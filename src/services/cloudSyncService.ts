import { auth, db, rtdb } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { ref, set, remove, onValue, get } from 'firebase/database';
import { storage } from './storage';
import { getReadNotificationIds, recordNotificationAsRead } from './notificationService';
import { extractProductImages } from './imageService';
import type { AppNotification, Category, Product, VideoTutorial, Sale, WithdrawalRequest, PaymentMethod, Reward } from '@/types';

type CacheKey = Parameters<typeof storage.set>[0];

/**
 * Universal recursive sanitizer for Realtime Database & Firestore.
 * Removes `undefined` values and ensures the payload will never crash RTDB.
 */
export function cleanRecordForCloud<T>(data: T): T {
  if (data === null || data === undefined) return null as any;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((item) => cleanRecordForCloud(item)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = cleanRecordForCloud(val);
    }
  }
  return clean as T;
}

class CloudSyncService {
  private isInitialized = false;
  private publicUnsubscribers: Array<() => void> = [];
  private privateUnsubscribers: Array<() => void> = [];
  private authUnsubscribe?: () => void;
  private authRevision = 0;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Dual Realtime Database listeners for Products & Categories (instant public access on all devices without Firestore permission blocks)
    try {
      const productsRef = ref(rtdb, 'products');
      const unsubRtdbProducts = onValue(
        productsRef,
        (snapshot: any) => {
          if (snapshot.exists()) {
            const val = snapshot.val() || {};
            const items = Object.values(val).map((p: any) => {
              const images = extractProductImages(p);
              return {
                ...p,
                images,
                imageUrl: p.imageUrl || images[0] || '',
              };
            }) as Product[];
            if (Array.isArray(items) && items.length > 0) {
              storage.set('PRODUCTS', items);
              window.dispatchEvent(new CustomEvent('dta_products_update', { detail: items }));
            }
          } else {
            // If RTDB products node is empty, push existing local products to cloud
            const local = storage.get<Product[]>('PRODUCTS', []);
            if (local.length > 0) {
              local.forEach((p) => {
                set(ref(rtdb, `products/${p.id}`), this.cleanProductForCloud(p)).catch(() => {});
              });
            }
          }
        },
        (error: any) => {
          console.warn('[RTDB] products listener error:', error);
        }
      );
      this.publicUnsubscribers.push(() => unsubRtdbProducts());
    } catch (rtdbErr) {
      console.warn('[RTDB] products listener setup failed:', rtdbErr);
    }

    try {
      const categoriesRef = ref(rtdb, 'categories');
      const unsubRtdbCategories = onValue(
        categoriesRef,
        (snapshot: any) => {
          if (snapshot.exists()) {
            const val = snapshot.val() || {};
            const items = Object.values(val) as Category[];
            if (Array.isArray(items) && items.length > 0) {
              storage.set('CATEGORIES', items);
              window.dispatchEvent(new CustomEvent('dta_categories_update', { detail: items }));
            }
          } else {
            const local = storage.get<Category[]>('CATEGORIES', []);
            if (local.length > 0) {
              local.forEach((c) => {
                set(ref(rtdb, `categories/${c.id}`), c).catch(() => {});
              });
            }
          }
        },
        (error: any) => {
          console.warn('[RTDB] categories listener error:', error);
        }
      );
      this.publicUnsubscribers.push(() => unsubRtdbCategories());
    } catch (rtdbErr) {
      console.warn('[RTDB] categories listener setup failed:', rtdbErr);
    }

    // RTDB is the primary authoritative store for products & categories (instant cross-device broadcast)

    // 3. Realtime Database listener for tutorials (public real-time broadcast across all users)
    try {
      const tutorialsRef = ref(rtdb, 'tutorials');
      const unsubRtdbTutorials = onValue(
        tutorialsRef,
        (snapshot: any) => {
          if (snapshot.exists()) {
            const val = snapshot.val() || {};
            const items = Object.values(val) as VideoTutorial[];
            const cleaned = items.filter(
              (t) =>
                t &&
                t.id &&
                !['tut-1', 'tut-2', 'tut-3'].includes(t.id) &&
                !t.rawInput?.includes('dQw4w9WgXcQ') &&
                !t.rawInput?.includes('L_LUpnjgPso') &&
                !t.rawInput?.includes('kJQP7kiw5Fk')
            );
            storage.set('TUTORIALS', cleaned);
          } else {
            // If RTDB tutorials node is empty, push any real local tutorials up to cloud
            const local = storage.get<VideoTutorial[]>('TUTORIALS', []);
            const realLocal = local.filter(
              (t) =>
                t &&
                t.id &&
                !['tut-1', 'tut-2', 'tut-3'].includes(t.id) &&
                !t.rawInput?.includes('dQw4w9WgXcQ')
            );
            if (realLocal.length > 0) {
              realLocal.forEach((tut) => {
                set(ref(rtdb, `tutorials/${tut.id}`), tut).catch(() => {});
              });
            }
          }
        },
        (error: any) => {
          console.warn('[RTDB] tutorials listener error:', error);
        }
      );
      this.publicUnsubscribers.push(() => unsubRtdbTutorials());
    } catch (rtdbErr) {
      console.warn('[RTDB] tutorials listener setup failed:', rtdbErr);
    }

    // Also listen to Firestore collection
    this.listenCollection('tutorials', 'TUTORIALS', this.publicUnsubscribers);
    this.authUnsubscribe = onAuthStateChanged(auth, (user: any) => void this.bindProtectedListeners(user));
  }

  private async bindProtectedListeners(user: any | null) {
    const revision = ++this.authRevision;
    this.clearPrivateListeners();
    if (!user) {
      return;
    }

    try {
      const isHardcodedAdmin =
        user.uid === 'oi8O5XbNHZOtnXaV10BRXdOATgi2' ||
        user.uid === 'PN9MiF9b8ZP54utzL8fgDu1XU072' ||
        ['ghhhbbbhjn3@gmail.com', 'dreamtoachievers@gmail.com'].includes(
          String(user.email || '').toLowerCase().trim()
        );

      let role: string | null = null;
      let userData: any = null;

      try {
        const profile = await getDoc(doc(db, 'users', user.uid));
        if (profile.exists()) {
          userData = profile.data();
          role = userData?.role || null;
        }
      } catch (profileErr) {
        console.warn('[Firestore] Profile fetch error, checking RTDB fallback:', profileErr);
      }

      // RTDB Fallback for role check if Firestore is unreachable
      if (!role && user.uid) {
        try {
          const rtdbSnap = await get(ref(rtdb, `users/${user.uid}/role`));
          if (rtdbSnap.exists()) {
            role = rtdbSnap.val();
          }
        } catch {}
      }

      if (revision !== this.authRevision || auth.currentUser?.uid !== user.uid) return;

      const isSuperAdmin = isHardcodedAdmin || role === 'admin' || role === 'superadmin';

      if (userData) {
        storage.set('USERS', [{ id: user.uid, ...userData }]);
      }

      // 1. Dual Realtime Database listeners (Instant, authoritative, cross-device sync)
      // Listen to user-specific ledgers for every logged-in user/partner
      this.bindRtdbListener(`user_sales/${user.uid}`, 'SALES', user.uid);
      this.bindRtdbListener(`user_withdrawals/${user.uid}`, 'WITHDRAWALS', user.uid);
      this.bindRtdbListener(`user_rewards/${user.uid}`, 'REWARDS', user.uid);
      this.bindRtdbListener(`user_payment_methods/${user.uid}`, 'PAYMENT_METHODS', user.uid);
      this.bindRtdbListener(`user_referrals/${user.uid}`, 'REFERRALS', user.uid);

      if (isSuperAdmin) {
        // In addition, administrators listen to platform-wide nodes across all users
        this.bindRtdbListener('sales', 'SALES');
        this.bindRtdbListener('withdrawals', 'WITHDRAWALS');
        this.bindRtdbListener('rewards', 'REWARDS');
        this.bindRtdbListener('users', 'USERS');
        this.bindRtdbListener('referrals', 'REFERRALS');
      }

      // 2. Automated Two-Way Local Healing (Ensures sales/withdrawals created offline or on mobile sync to cloud)
      this.reconcileLocalDataToCloud(user.uid, isSuperAdmin);

      // 3. Secondary Cloud Firestore listeners
      try {
        if (isSuperAdmin) {
          ['sales', 'users', 'withdrawals', 'rewards', 'notifications', 'audit_logs', 'referrals', 'deleted_products'].forEach((name) =>
            this.listenCollection(name, name.toUpperCase() as CacheKey, this.privateUnsubscribers));
        } else {
          this.listenQuery(query(collection(db, 'sales'), where('userId', '==', user.uid)), 'sales', 'SALES');
          this.listenQuery(query(collection(db, 'withdrawals'), where('userId', '==', user.uid)), 'withdrawals', 'WITHDRAWALS');
          this.listenQuery(query(collection(db, 'rewards'), where('userId', '==', user.uid)), 'rewards', 'REWARDS');
          this.listenQuery(query(collection(db, 'notifications'), where('userId', '==', user.uid)), 'notifications', 'NOTIFICATIONS');
          this.listenUserReferrals(user.uid);
        }
      } catch (firestoreErr: any) {
        console.warn('[Firestore] listeners secondary warning:', firestoreErr?.message || firestoreErr);
      }
    } catch (error: any) {
      console.warn('[CloudSync] could not bind authenticated listeners:', error.code || error.message);
    }
  }

  private bindRtdbListener(path: string, cacheKey: CacheKey, userId?: string) {
    try {
      const dbRef = ref(rtdb, path);
      const unsub = onValue(
        dbRef,
        (snapshot: any) => {
          if (snapshot.exists()) {
            const val = snapshot.val() || {};
            const items = (Array.isArray(val) ? val : Object.values(val)).filter(Boolean) as any[];
            if (Array.isArray(items)) {
              const existing = storage.get<any[]>(cacheKey, []);
              const map = new Map<string, any>();

              if (userId) {
                // Keep items from other users, merge items for this user
                existing.forEach((item) => {
                  if (item?.id && item?.userId !== userId) {
                    map.set(item.id, item);
                  }
                });
              } else {
                existing.forEach((item) => {
                  if (item?.id) map.set(item.id, item);
                });
              }

              items.forEach((item: any) => {
                if (item?.id) {
                  map.set(item.id, item);
                }
              });

              const merged = Array.from(map.values());
              storage.set(cacheKey, merged);
            }
          }
        },
        (error: any) => {
          console.warn(`[RTDB] ${path} listener warning:`, error?.message || error);
        }
      );
      this.privateUnsubscribers.push(() => unsub());
    } catch (err) {
      console.warn(`[RTDB] setup listener failed for ${path}:`, err);
    }
  }

  private reconcileLocalDataToCloud(userId: string, isSuperAdmin: boolean) {
    // 1. Reconcile local sales
    try {
      const localSales = storage.get<Sale[]>('SALES', []);
      for (const s of localSales) {
        if (s && s.id && (s.userId === userId || isSuperAdmin)) {
          const cleaned = cleanRecordForCloud(s);
          const targetUid = s.userId || userId;
          set(ref(rtdb, `user_sales/${targetUid}/${s.id}`), cleaned).catch(() => {});
          set(ref(rtdb, `sales/${s.id}`), cleaned).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[Reconciliation] sales warning:', err);
    }

    // 2. Reconcile local withdrawals
    try {
      const localWds = storage.get<WithdrawalRequest[]>('WITHDRAWALS', []);
      for (const w of localWds) {
        if (w && w.id && (w.userId === userId || isSuperAdmin)) {
          const cleaned = cleanRecordForCloud(w);
          const targetUid = w.userId || userId;
          set(ref(rtdb, `user_withdrawals/${targetUid}/${w.id}`), cleaned).catch(() => {});
          set(ref(rtdb, `withdrawals/${w.id}`), cleaned).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[Reconciliation] withdrawals warning:', err);
    }

    // 3. Reconcile local payment methods
    try {
      const localMethods = storage.get<PaymentMethod[]>('PAYMENT_METHODS', []);
      for (const pm of localMethods) {
        if (pm && pm.id && (pm.userId === userId || isSuperAdmin)) {
          const cleaned = cleanRecordForCloud(pm);
          const targetUid = pm.userId || userId;
          set(ref(rtdb, `user_payment_methods/${targetUid}/${pm.id}`), cleaned).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[Reconciliation] payment methods warning:', err);
    }
  }

  private listenCollection(collectionName: string, cacheKey: CacheKey, bucket: Array<() => void>) {
    bucket.push(onSnapshot(collection(db, collectionName), (snapshot: any) => {
      let docs = snapshot.docs.map((item: any) => ({ id: item.id, ...item.data() }));
      if (collectionName === 'products') {
        docs = docs.map((p: any) => {
          const images = extractProductImages(p);
          return {
            ...p,
            images,
            imageUrl: p.imageUrl || images[0] || '',
          };
        });
      }
      if (cacheKey === 'NOTIFICATIONS') {
        const existing = storage.get<AppNotification[]>('NOTIFICATIONS', []);
        const readIds = getReadNotificationIds();
        const map = new Map<string, any>();
        const now = Date.now();
        existing.forEach((n) => {
          if (!n?.id) return;
          const age = now - new Date(n.createdAt || 0).getTime();
          if (age < 15000) map.set(n.id, { ...n, isRead: readIds.has(n.id) || n.isRead === true });
        });
        docs.forEach((n: any) => {
          if (n?.id) {
            const existingItem = map.get(n.id);
            const isAlreadyRead = readIds.has(n.id) || existingItem?.isRead === true || n.isRead === true;
            map.set(n.id, {
              ...n,
              isRead: isAlreadyRead,
              linkUrl: n.linkUrl || n.link || '/dashboard/notifications',
            });
            if (isAlreadyRead && !n.isRead) {
              recordNotificationAsRead(n.id);
            }
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        storage.set(cacheKey, merged);
      } else if (docs.length > 0) {
        const existing = storage.get<any[]>(cacheKey, []);
        const map = new Map<string, any>();
        existing.forEach((item) => { if (item?.id) map.set(item.id, item); });
        docs.forEach((item: any) => { if (item?.id) map.set(item.id, item); });
        storage.set(cacheKey, Array.from(map.values()));
      }
    }, (error: any) => console.warn(`[Firestore] ${collectionName} listener failed:`, error.code)));
  }

  private listenQuery(source: any, label: string, cacheKey: CacheKey) {
    this.privateUnsubscribers.push(onSnapshot(source, (snapshot: any) => {
      const docs = snapshot.docs.map((item: any) => ({ id: item.id, ...item.data() }));
      if (cacheKey === 'NOTIFICATIONS') {
        const existing = storage.get<AppNotification[]>('NOTIFICATIONS', []);
        const readIds = getReadNotificationIds();
        const map = new Map<string, any>();
        const now = Date.now();
        const currentUserId = auth.currentUser?.uid;
        existing.forEach((n) => {
          if (!n?.id) return;
          const age = now - new Date(n.createdAt || 0).getTime();
          if (n.userId !== currentUserId || age < 15000) {
            map.set(n.id, { ...n, isRead: readIds.has(n.id) || n.isRead === true });
          }
        });
        docs.forEach((n: any) => {
          if (n?.id) {
            const existingItem = map.get(n.id);
            const isAlreadyRead = readIds.has(n.id) || existingItem?.isRead === true || n.isRead === true;
            map.set(n.id, {
              ...n,
              isRead: isAlreadyRead,
              linkUrl: n.linkUrl || n.link || '/dashboard/notifications',
            });
            if (isAlreadyRead && !n.isRead) {
              recordNotificationAsRead(n.id);
            }
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        storage.set(cacheKey, merged);
      } else if (docs.length > 0) {
        const existing = storage.get<any[]>(cacheKey, []);
        const map = new Map<string, any>();
        existing.forEach((item) => { if (item?.id) map.set(item.id, item); });
        docs.forEach((item: any) => { if (item?.id) map.set(item.id, item); });
        storage.set(cacheKey, Array.from(map.values()));
      }
    }, (error: any) => console.warn(`[Firestore] ${label} listener failed:`, error.code)));
  }

  private listenUserReferrals(uid: string) {
    const sides = new Map<string, Map<string, Record<string, unknown>>>();
    const update = (side: string, documents: Array<{ id: string; data: () => Record<string, unknown> }>) => {
      sides.set(side, new Map(documents.map((item) => [item.id, { id: item.id, ...item.data() }])));
      const merged = new Map<string, Record<string, unknown>>();
      sides.forEach((items) => items.forEach((value, id) => merged.set(id, value)));
      storage.set('REFERRALS', Array.from(merged.values()));
    };
    const incoming = query(collection(db, 'referrals'), where('referredUserId', '==', uid));
    const outgoing = query(collection(db, 'referrals'), where('referrerId', '==', uid));
    this.privateUnsubscribers.push(
      onSnapshot(incoming, (snapshot: any) => update('incoming', snapshot.docs), (error: any) => console.warn('[Firestore] referrals listener failed:', error.code)),
      onSnapshot(outgoing, (snapshot: any) => update('outgoing', snapshot.docs), (error: any) => console.warn('[Firestore] referrals listener failed:', error.code)),
    );
  }

  private clearPrivateListeners() {
    this.privateUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.privateUnsubscribers = [];
  }

  cleanProductForCloud(product: Product): Record<string, unknown> {
    const images = extractProductImages(product);

    return {
      ...product,
      id: String(product.id),
      name: String(product.name || '').trim(),
      slug: String(product.slug || '').trim(),
      categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds : [],
      retailPrice: Number(product.retailPrice || 0),
      partnerPrice: Number(product.partnerPrice || 0),
      suggestedSellingPrice: Number(product.suggestedSellingPrice || product.retailPrice || 0),
      grossMargin: Number(product.grossMargin ?? Math.max(0, product.retailPrice - product.partnerPrice)),
      currency: product.currency || 'PKR',
      status: product.status || 'active',
      images,
      imageUrl: product.imageUrl || images[0] || '',
      cashOnDelivery: product.cashOnDelivery !== false,
      brand: String(product.brand || 'Dream to Achievers Official').trim(),
      warranty: String(product.warranty || '7-Day Replacement Guarantee').trim(),
      dispatchTime: String(product.dispatchTime || 'Within 24-48 Hours (COD)').trim(),
      features: Array.isArray(product.features) ? product.features : [],
      specifications: product.specifications || {},
    };
  }

  async syncProductToCloud(product: Product) {
    const cleaned = this.cleanProductForCloud(product);
    // 1. Dual-sync to Realtime Database (guaranteed high-availability & instant cross-device broadcast)
    try {
      await set(ref(rtdb, `products/${product.id}`), cleaned);
    } catch (rtdbErr) {
      console.warn('[RTDB] syncProductToCloud warning:', rtdbErr);
    }
    // 2. Also persist to Cloud Firestore
    try {
      await setDoc(doc(db, 'products', product.id), cleaned, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore] syncProductToCloud warning:', fsErr);
    }
  }

  async syncAllProductsToCloud(products: Product[]) {
    for (const product of products) {
      await this.syncProductToCloud(product);
    }
    return products.length;
  }

  async deleteProductFromCloud(productId: string) {
    try {
      await remove(ref(rtdb, `products/${productId}`));
    } catch (rtdbErr) {
      console.warn('[RTDB] deleteProductFromCloud warning:', rtdbErr);
    }
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (fsErr) {
      console.warn('[Firestore] deleteProductFromCloud warning:', fsErr);
    }
  }

  async archiveProduct(product: Product) {
    const cleaned = this.cleanProductForCloud(product);
    try {
      await set(ref(rtdb, `deleted_products/${product.id}`), cleaned);
    } catch (rtdbErr) {
      console.warn('[RTDB] archiveProduct warning:', rtdbErr);
    }
    try {
      await setDoc(doc(db, 'deleted_products', product.id), cleaned);
    } catch (fsErr) {
      console.warn('[Firestore] archiveProduct warning:', fsErr);
    }
    await this.deleteProductFromCloud(product.id);
  }

  async restoreProduct(product: Product) {
    await this.syncProductToCloud(product);
    try {
      await remove(ref(rtdb, `deleted_products/${product.id}`));
    } catch (rtdbErr) {
      console.warn('[RTDB] restoreProduct warning:', rtdbErr);
    }
    try {
      await deleteDoc(doc(db, 'deleted_products', product.id));
    } catch (fsErr) {
      console.warn('[Firestore] restoreProduct warning:', fsErr);
    }
  }

  async syncCategoryToCloud(category: Category) {
    try {
      await set(ref(rtdb, `categories/${category.id}`), category);
    } catch (rtdbErr) {
      console.warn('[RTDB] syncCategoryToCloud warning:', rtdbErr);
    }
    try {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore] syncCategoryToCloud warning:', fsErr);
    }
  }

  async deleteCategoryFromCloud(categoryId: string) {
    try {
      await remove(ref(rtdb, `categories/${categoryId}`));
    } catch (rtdbErr) {
      console.warn('[RTDB] deleteCategoryFromCloud warning:', rtdbErr);
    }
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (fsErr) {
      console.warn('[Firestore] deleteCategoryFromCloud warning:', fsErr);
    }
  }
  async syncNotificationToCloud(notification: AppNotification) {
    await setDoc(doc(db, 'notifications', notification.id), notification, { merge: true });
    if (notification.userId) {
      await setDoc(doc(db, `users/${notification.userId}/notifications`, notification.id), notification, { merge: true });
    }
  }
  async syncTutorialToCloud(tutorial: VideoTutorial) {
    // 1. Dual-sync to Realtime Database (guaranteed high-availability & instant cross-device broadcast)
    try {
      await set(ref(rtdb, `tutorials/${tutorial.id}`), tutorial);
    } catch (rtdbErr) {
      console.warn('[RTDB] syncTutorialToCloud warning:', rtdbErr);
    }
    // 2. Also attempt Cloud Firestore
    try {
      await setDoc(doc(db, 'tutorials', tutorial.id), tutorial, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore] syncTutorialToCloud warning:', fsErr);
    }
  }
  async deleteTutorialFromCloud(tutorialId: string) {
    // 1. Remove from RTDB
    try {
      await remove(ref(rtdb, `tutorials/${tutorialId}`));
    } catch (rtdbErr) {
      console.warn('[RTDB] deleteTutorialFromCloud warning:', rtdbErr);
    }
    // 2. Remove from Firestore
    try {
      await deleteDoc(doc(db, 'tutorials', tutorialId));
    } catch (fsErr) {
      console.warn('[Firestore] deleteTutorialFromCloud warning:', fsErr);
    }
  }

  destroy() {
    this.authRevision++;
    this.authUnsubscribe?.();
    this.authUnsubscribe = undefined;
    this.publicUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.publicUnsubscribers = [];
    this.clearPrivateListeners();
    this.isInitialized = false;
  }
}

export const cloudSyncService = new CloudSyncService();

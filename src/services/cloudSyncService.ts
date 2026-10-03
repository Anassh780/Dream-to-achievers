import { auth, db, rtdb } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { ref, set, remove, onValue, get } from 'firebase/database';
import { storage } from './storage';
import type { AppNotification, Category, Product, VideoTutorial } from '@/types';

type CacheKey = Parameters<typeof storage.set>[0];

class CloudSyncService {
  private isInitialized = false;
  private publicUnsubscribers: Array<() => void> = [];
  private privateUnsubscribers: Array<() => void> = [];
  private authUnsubscribe?: () => void;
  private authRevision = 0;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;
    this.listenCollection('products', 'PRODUCTS', this.publicUnsubscribers);
    this.listenCollection('categories', 'CATEGORIES', this.publicUnsubscribers);

    // Realtime Database listener for tutorials (public real-time broadcast across all users)
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
      const profile = await getDoc(doc(db, 'users', user.uid));
      if (revision !== this.authRevision || auth.currentUser?.uid !== user.uid) return;
      const role = profile.data()?.role;
      if (role === 'admin' || role === 'superadmin') {
        ['sales', 'users', 'withdrawals', 'rewards', 'notifications', 'audit_logs', 'referrals', 'deleted_products'].forEach((name) =>
          this.listenCollection(name, name.toUpperCase() as CacheKey, this.privateUnsubscribers));
        return;
      }

      if (profile.exists()) {
        storage.set('USERS', [{ id: profile.id, ...profile.data() }]);
      }
      this.listenQuery(query(collection(db, 'sales'), where('userId', '==', user.uid)), 'sales', 'SALES');
      this.listenQuery(query(collection(db, 'withdrawals'), where('userId', '==', user.uid)), 'withdrawals', 'WITHDRAWALS');
      this.listenQuery(query(collection(db, 'rewards'), where('userId', '==', user.uid)), 'rewards', 'REWARDS');
      this.listenQuery(query(collection(db, 'notifications'), where('userId', '==', user.uid)), 'notifications', 'NOTIFICATIONS');
      this.listenUserReferrals(user.uid);
    } catch (error: any) {
      console.warn('[Firestore] could not bind authenticated listeners:', error.code || error.message);
    }
  }

  private listenCollection(collectionName: string, cacheKey: CacheKey, bucket: Array<() => void>) {
    bucket.push(onSnapshot(collection(db, collectionName), (snapshot: any) => {
      const docs = snapshot.docs.map((item: any) => ({ id: item.id, ...item.data() }));
      if (cacheKey === 'NOTIFICATIONS') {
        const existing = storage.get<AppNotification[]>('NOTIFICATIONS', []);
        const map = new Map<string, any>();
        const now = Date.now();
        existing.forEach((n) => {
          if (!n?.id) return;
          const age = now - new Date(n.createdAt || 0).getTime();
          if (age < 15000) map.set(n.id, n);
        });
        docs.forEach((n: any) => {
          if (n?.id) {
            map.set(n.id, {
              ...n,
              linkUrl: n.linkUrl || n.link || '/dashboard/notifications',
            });
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        storage.set(cacheKey, merged);
      } else {
        storage.set(cacheKey, docs);
      }
    }, (error: any) => console.warn(`[Firestore] ${collectionName} listener failed:`, error.code)));
  }

  private listenQuery(source: any, label: string, cacheKey: CacheKey) {
    this.privateUnsubscribers.push(onSnapshot(source, (snapshot: any) => {
      const docs = snapshot.docs.map((item: any) => ({ id: item.id, ...item.data() }));
      if (cacheKey === 'NOTIFICATIONS') {
        const existing = storage.get<AppNotification[]>('NOTIFICATIONS', []);
        const map = new Map<string, any>();
        const now = Date.now();
        const currentUserId = auth.currentUser?.uid;
        existing.forEach((n) => {
          if (!n?.id) return;
          const age = now - new Date(n.createdAt || 0).getTime();
          if (n.userId !== currentUserId || age < 15000) {
            map.set(n.id, n);
          }
        });
        docs.forEach((n: any) => {
          if (n?.id) {
            map.set(n.id, {
              ...n,
              linkUrl: n.linkUrl || n.link || '/dashboard/notifications',
            });
          }
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        storage.set(cacheKey, merged);
      } else {
        storage.set(cacheKey, docs);
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
    return { ...product, id: String(product.id), name: String(product.name || '').trim(), slug: String(product.slug || '').trim(), categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds : [], retailPrice: Number(product.retailPrice || 0), partnerPrice: Number(product.partnerPrice || 0), suggestedSellingPrice: Number(product.suggestedSellingPrice || product.retailPrice || 0), grossMargin: Number(product.grossMargin ?? Math.max(0, product.retailPrice - product.partnerPrice)), currency: product.currency || 'PKR', status: product.status || 'active' };
  }

  async syncProductToCloud(product: Product) { await setDoc(doc(db, 'products', product.id), this.cleanProductForCloud(product), { merge: true }); }
  async syncAllProductsToCloud(products: Product[]) { for (const product of products) await this.syncProductToCloud(product); return products.length; }
  async deleteProductFromCloud(productId: string) { await deleteDoc(doc(db, 'products', productId)); }
  async archiveProduct(product: Product) { await setDoc(doc(db, 'deleted_products', product.id), this.cleanProductForCloud(product)); await this.deleteProductFromCloud(product.id); }
  async restoreProduct(product: Product) { await this.syncProductToCloud(product); await deleteDoc(doc(db, 'deleted_products', product.id)); }
  async syncCategoryToCloud(category: Category) { await setDoc(doc(db, 'categories', category.id), category, { merge: true }); }
  async deleteCategoryFromCloud(categoryId: string) { await deleteDoc(doc(db, 'categories', categoryId)); }
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

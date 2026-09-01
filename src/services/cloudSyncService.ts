import { db, rtdb } from '@/lib/firebase';
import { collection, onSnapshot, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, onValue, get, set } from 'firebase/database';
import { storage } from './storage';
import { Product, Category, User, Sale, WithdrawalRequest, Reward } from '@/types';
import { SEED_PRODUCTS } from '@/config/products';
import { SEED_CATEGORIES } from '@/config/categories';

export const OFFICIAL_ADMIN_USER: User = {
  id: 'admin-dreamtoachievers-official',
  fullName: 'DreamToAchievers Official Admin',
  email: 'dreamtoachievers@gmail.com',
  role: 'admin',
  referralCode: 'DTA-ADMIN',
  currentRankSlug: 'diamond',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const LEGACY_PRODUCT_IDS = ['prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005', 'prod-006'];

class CloudSyncService {
  private isInitialized = false;
  private unsubscribers: Array<() => void> = [];

  /**
   * Initializes real-time bi-directional synchronization with Firebase
   */
  public async init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Clean legacy mock data from local storage
    this.cleanLegacyStorage();

    // 2. Guarantee official admin user presence
    await this.ensureOfficialAdmin();

    // 3. Initial cloud fetch and seed
    await this.initialCloudSync();

    // 4. Start real-time Firestore listeners
    this.startFirestoreListeners();

    // 5. Start real-time Realtime Database listeners
    this.startRTDBListeners();
  }

  /**
   * Cleans an object so Firestore and RTDB will NEVER reject it due to undefined values.
   */
  public cleanProductForCloud(p: Product): Record<string, any> {
    return {
      id: String(p.id || `prod-${Date.now()}`),
      name: String(p.name || '').trim(),
      slug: String(p.slug || '').trim(),
      shortDescription: String(p.shortDescription || '').trim(),
      description: String(p.description || '').trim(),
      category: String(p.category || 'General'),
      categoryId: String(p.categoryId || 'cat-lifestyle-gifting'),
      categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds : [p.categoryId || 'cat-lifestyle-gifting'],
      retailPrice: Number(p.retailPrice || 0),
      partnerPrice: Number(p.partnerPrice || 0),
      suggestedSellingPrice: Number(p.suggestedSellingPrice || p.retailPrice || 0),
      grossMargin: Number(p.grossMargin ?? Math.max(0, (p.retailPrice || 0) - (p.partnerPrice || 0))),
      currency: 'PKR',
      imageUrl: String(p.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80').trim(),
      sku: String(p.sku || `DTA-${Math.floor(1000 + Math.random() * 9000)}`).trim(),
      inStock: Boolean(p.inStock ?? true),
      isFeatured: Boolean(p.isFeatured ?? false),
      status: String(p.status || 'active'),
      createdAt: String(p.createdAt || new Date().toISOString()),
    };
  }

  /**
   * Removes outdated mock IDs from local storage
   */
  private cleanLegacyStorage() {
    try {
      const local = storage.get<Product[]>('PRODUCTS', []);
      const filtered = local.filter((p) => p && !LEGACY_PRODUCT_IDS.includes(p.id));
      if (filtered.length === 0 || filtered.length !== local.length) {
        storage.set('PRODUCTS', filtered.length > 0 ? filtered : SEED_PRODUCTS);
      }
    } catch {}
  }

  /**
   * Guarantees dreamtoachievers@gmail.com exists in local and cloud stores
   */
  public async ensureOfficialAdmin() {
    try {
      const users = storage.get<User[]>('USERS', []);
      const exists = users.find(
        (u: User) => u.email.toLowerCase() === OFFICIAL_ADMIN_USER.email.toLowerCase()
      );

      if (!exists) {
        users.unshift(OFFICIAL_ADMIN_USER);
        storage.set('USERS', users);
      } else if (exists.role !== 'admin' || exists.currentRankSlug !== 'diamond') {
        exists.role = 'admin';
        exists.currentRankSlug = 'diamond';
        storage.set('USERS', users);
      }

      // Sync to Firestore
      try {
        await setDoc(doc(db, 'users', OFFICIAL_ADMIN_USER.id), OFFICIAL_ADMIN_USER, { merge: true });
      } catch {}

      // Sync to RTDB
      try {
        await set(ref(rtdb, `users/${OFFICIAL_ADMIN_USER.id}`), OFFICIAL_ADMIN_USER);
      } catch {}
    } catch (err) {
      console.warn('[CloudSync] ensureOfficialAdmin warning:', err);
    }
  }

  /**
   * Real-time Cloud First Initial Sync:
   * Firestore & RTDB are the single source of truth across all devices.
   */
  public async initialCloudSync() {
    // 1. Delete legacy items from Cloud
    for (const legacyId of LEGACY_PRODUCT_IDS) {
      try {
        await deleteDoc(doc(db, 'products', legacyId));
        await set(ref(rtdb, `products/${legacyId}`), null);
      } catch {}
    }

    try {
      // 2. Fetch all products from Firestore
      const cloudProductsSnap: any = await getDocs(collection(db, 'products'));
      let validCloudProducts: Product[] = [];

      if (!cloudProductsSnap.empty) {
        cloudProductsSnap.forEach((d: any) => {
          const cp = d.data() as Product;
          if (cp && cp.id && !LEGACY_PRODUCT_IDS.includes(cp.id)) {
            validCloudProducts.push(cp);
          }
        });
      }

      // If cloud is empty, seed them now
      if (validCloudProducts.length === 0) {
        await this.seedCloudProducts();
        validCloudProducts = SEED_PRODUCTS;
      } else {
        // Ensure any missing seed products are in cloud
        for (const sp of SEED_PRODUCTS) {
          if (!validCloudProducts.some((p) => p.id === sp.id || p.sku === sp.sku)) {
            await this.syncProductToCloud(sp);
            validCloudProducts.push(sp);
          }
        }
      }

      // Pure cloud override: all devices will now display the exact same products
      storage.set('PRODUCTS', validCloudProducts);
      window.dispatchEvent(new CustomEvent('dta_products_update', { detail: validCloudProducts }));
    } catch (err) {
      console.warn('[CloudSync] Products initial sync error:', err);
      storage.set('PRODUCTS', SEED_PRODUCTS);
    }

    try {
      // 3. Sync Categories
      const cloudCatSnap: any = await getDocs(collection(db, 'categories'));
      let categories: Category[] = [];

      if (!cloudCatSnap.empty) {
        cloudCatSnap.forEach((d: any) => {
          const cc = d.data() as Category;
          if (cc && cc.id) categories.push(cc);
        });
      }

      if (categories.length === 0) {
        await this.seedCloudCategories();
        categories = SEED_CATEGORIES;
      }

      storage.set('CATEGORIES', categories);
      window.dispatchEvent(new CustomEvent('dta_categories_update', { detail: categories }));
    } catch (err) {
      console.warn('[CloudSync] Categories sync error:', err);
    }

    try {
      // 4. Sync Users
      const cloudUsersSnap: any = await getDocs(collection(db, 'users'));
      const userMap = new Map<string, User>();
      userMap.set(OFFICIAL_ADMIN_USER.id, OFFICIAL_ADMIN_USER);

      if (!cloudUsersSnap.empty) {
        cloudUsersSnap.forEach((d: any) => {
          const u = d.data() as User;
          if (u && u.id) {
            if (u.email.toLowerCase() === OFFICIAL_ADMIN_USER.email.toLowerCase()) {
              u.role = 'admin';
              u.currentRankSlug = 'diamond';
            }
            userMap.set(u.id, { ...userMap.get(u.id), ...u });
          }
        });
      }

      const mergedUsers = Array.from(userMap.values());
      storage.set('USERS', mergedUsers);
      window.dispatchEvent(new CustomEvent('dta_users_update', { detail: mergedUsers }));
    } catch (err) {
      console.warn('[CloudSync] Users sync error:', err);
    }

    try {
      // 5. Sync Sales
      const cloudSalesSnap: any = await getDocs(collection(db, 'sales'));
      if (!cloudSalesSnap.empty) {
        const sales: Sale[] = [];
        cloudSalesSnap.forEach((d: any) => {
          const s = d.data() as Sale;
          if (s && s.id) sales.push(s);
        });
        storage.set('SALES', sales);
        window.dispatchEvent(new CustomEvent('dta_sales_update', { detail: sales }));
      }
    } catch {}

    try {
      // 6. Sync Withdrawals
      const cloudWdSnap: any = await getDocs(collection(db, 'withdrawals'));
      if (!cloudWdSnap.empty) {
        const wds: WithdrawalRequest[] = [];
        cloudWdSnap.forEach((d: any) => {
          const w = d.data() as WithdrawalRequest;
          if (w && w.id) wds.push(w);
        });
        storage.set('WITHDRAWALS', wds);
        window.dispatchEvent(new CustomEvent('dta_withdrawals_update', { detail: wds }));
      }
    } catch {}
  }

  /**
   * Pushes all products directly to Firestore and RTDB
   */
  public async syncAllProductsToCloud(productsToSync?: Product[]): Promise<number> {
    const list = (productsToSync || storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS)).filter(
      (p) => p && !LEGACY_PRODUCT_IDS.includes(p.id)
    );
    let count = 0;
    for (const prod of list) {
      if (prod && prod.id) {
        await this.syncProductToCloud(prod);
        count++;
      }
    }
    return count;
  }

  /**
   * Seeds default seed products into cloud database
   */
  public async seedCloudProducts() {
    try {
      for (const prod of SEED_PRODUCTS) {
        const clean = this.cleanProductForCloud(prod);
        await setDoc(doc(db, 'products', clean.id), clean, { merge: true });
        await set(ref(rtdb, `products/${clean.id}`), clean);
      }
      storage.set('PRODUCTS', SEED_PRODUCTS);
      window.dispatchEvent(new CustomEvent('dta_products_update', { detail: SEED_PRODUCTS }));
    } catch (err) {
      console.warn('[CloudSync] Seeding products failed:', err);
    }
  }

  /**
   * Seeds default categories into cloud database
   */
  public async seedCloudCategories() {
    try {
      for (const cat of SEED_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
        await set(ref(rtdb, `categories/${cat.id}`), cat);
      }
      storage.set('CATEGORIES', SEED_CATEGORIES);
      window.dispatchEvent(new CustomEvent('dta_categories_update', { detail: SEED_CATEGORIES }));
    } catch (err) {
      console.warn('[CloudSync] Seeding categories failed:', err);
    }
  }

  /**
   * Real-time Firestore Listeners: Single Source of Truth
   */
  private startFirestoreListeners() {
    // 1. Products Stream
    try {
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot: any) => {
        if (snapshot.empty) return;
        const cloudList: Product[] = [];
        snapshot.forEach((d: any) => {
          const item = d.data() as Product;
          if (item && item.id && !LEGACY_PRODUCT_IDS.includes(item.id)) {
            cloudList.push(item);
          }
        });
        if (cloudList.length > 0) {
          storage.set('PRODUCTS', cloudList);
          window.dispatchEvent(new CustomEvent('dta_products_update', { detail: cloudList }));
        }
      });
      this.unsubscribers.push(unsubProducts);
    } catch (err) {
      console.warn('[CloudSync] Products stream setup error:', err);
    }

    // 2. Categories Stream
    try {
      const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot: any) => {
        if (snapshot.empty) return;
        const categories: Category[] = [];
        snapshot.forEach((d: any) => {
          const item = d.data() as Category;
          if (item && item.id) categories.push(item);
        });
        if (categories.length > 0) {
          storage.set('CATEGORIES', categories);
          window.dispatchEvent(new CustomEvent('dta_categories_update', { detail: categories }));
        }
      });
      this.unsubscribers.push(unsubCategories);
    } catch (err) {
      console.warn('[CloudSync] Categories stream setup error:', err);
    }

    // 3. Sales Stream
    try {
      const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot: any) => {
        if (snapshot.empty) return;
        const sales: Sale[] = [];
        snapshot.forEach((d: any) => {
          const s = d.data() as Sale;
          if (s && s.id) sales.push(s);
        });
        storage.set('SALES', sales);
        window.dispatchEvent(new CustomEvent('dta_sales_update', { detail: sales }));
      });
      this.unsubscribers.push(unsubSales);
    } catch (err) {
      console.warn('[CloudSync] Sales stream setup error:', err);
    }

    // 4. Users Stream
    try {
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot: any) => {
        if (snapshot.empty) return;
        const userMap = new Map<string, User>();
        userMap.set(OFFICIAL_ADMIN_USER.id, OFFICIAL_ADMIN_USER);

        snapshot.forEach((d: any) => {
          const u = d.data() as User;
          if (u && u.id) {
            if (u.email.toLowerCase() === OFFICIAL_ADMIN_USER.email.toLowerCase()) {
              u.role = 'admin';
              u.currentRankSlug = 'diamond';
            }
            userMap.set(u.id, { ...userMap.get(u.id), ...u });
          }
        });

        const merged = Array.from(userMap.values());
        storage.set('USERS', merged);
        window.dispatchEvent(new CustomEvent('dta_users_update', { detail: merged }));
      });
      this.unsubscribers.push(unsubUsers);
    } catch (err) {
      console.warn('[CloudSync] Users stream setup error:', err);
    }

    // 5. Withdrawals Stream
    try {
      const unsubWd = onSnapshot(collection(db, 'withdrawals'), (snapshot: any) => {
        if (snapshot.empty) return;
        const wds: WithdrawalRequest[] = [];
        snapshot.forEach((d: any) => {
          const w = d.data() as WithdrawalRequest;
          if (w && w.id) wds.push(w);
        });
        storage.set('WITHDRAWALS', wds);
        window.dispatchEvent(new CustomEvent('dta_withdrawals_update', { detail: wds }));
      });
      this.unsubscribers.push(unsubWd);
    } catch (err) {
      console.warn('[CloudSync] Withdrawals stream setup error:', err);
    }

    // 6. Rewards Stream
    try {
      const unsubRewards = onSnapshot(collection(db, 'rewards'), (snapshot: any) => {
        if (snapshot.empty) return;
        const rewards: Reward[] = [];
        snapshot.forEach((d: any) => {
          const r = d.data() as Reward;
          if (r && r.id) rewards.push(r);
        });
        storage.set('REWARDS', rewards);
        window.dispatchEvent(new CustomEvent('dta_rewards_update', { detail: rewards }));
      });
      this.unsubscribers.push(unsubRewards);
    } catch (err) {
      console.warn('[CloudSync] Rewards stream setup error:', err);
    }
  }

  /**
   * Real-time Realtime Database Listeners (Backup synchronization)
   */
  private startRTDBListeners() {
    try {
      const productsRef = ref(rtdb, 'products');
      onValue(productsRef, (snap: any) => {
        const val = snap.val();
        if (val && typeof val === 'object') {
          const rtdbProducts = (Object.values(val) as Product[]).filter(
            (p) => p && p.id && !LEGACY_PRODUCT_IDS.includes(p.id)
          );
          if (rtdbProducts.length > 0) {
            storage.set('PRODUCTS', rtdbProducts);
            window.dispatchEvent(new CustomEvent('dta_products_update', { detail: rtdbProducts }));
          }
        }
      });
    } catch (err) {
      console.warn('[CloudSync] RTDB products listener warning:', err);
    }
  }

  /**
   * Sync a single product creation/update to Cloud
   */
  public async syncProductToCloud(product: Product) {
    try {
      const clean = this.cleanProductForCloud(product);
      await setDoc(doc(db, 'products', clean.id), clean, { merge: true });
      await set(ref(rtdb, `products/${clean.id}`), clean);
    } catch (err) {
      console.warn('[CloudSync] Failed to sync product to cloud:', err);
    }
  }

  /**
   * Remove a product from Cloud
   */
  public async deleteProductFromCloud(productId: string) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      await set(ref(rtdb, `products/${productId}`), null);
    } catch (err) {
      console.warn('[CloudSync] Failed to delete product from cloud:', err);
    }
  }

  /**
   * Sync a category creation/update to Cloud
   */
  public async syncCategoryToCloud(category: Category) {
    try {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
      await set(ref(rtdb, `categories/${category.id}`), category);
    } catch (err) {
      console.warn('[CloudSync] Failed to sync category to cloud:', err);
    }
  }

  /**
   * Cleanup listeners
   */
  public destroy() {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.isInitialized = false;
  }
}

export const cloudSyncService = new CloudSyncService();

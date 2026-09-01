import { db, rtdb } from '@/lib/firebase';
import { collection, onSnapshot, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, onValue, get, set } from 'firebase/database';
import { storage } from './storage';
import { Product, Category, User, Sale } from '@/types';
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

class CloudSyncService {
  private isInitialized = false;
  private unsubscribers: Array<() => void> = [];

  /**
   * Initializes real-time bi-directional synchronization with Firebase
   */
  public async init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Guarantee official admin user presence
    await this.ensureOfficialAdmin();

    // 2. Initial cloud fetch, merge, and upload missing
    await this.initialCloudSync();

    // 3. Start real-time Firestore listeners
    this.startFirestoreListeners();

    // 4. Start real-time Realtime Database listeners
    this.startRTDBListeners();
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
   * True Two-Way Initial Cloud Sync:
   * Merges local and cloud data, then pushes all local items to cloud so no products are lost!
   */
  public async initialCloudSync() {
    try {
      // 1. Sync Products
      const localProducts = storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
      const productMap = new Map<string, Product>();

      // Seed with built-in SEED_PRODUCTS first
      SEED_PRODUCTS.forEach((p) => productMap.set(p.id, p));

      // Merge local items
      localProducts.forEach((p) => {
        if (p && p.id) productMap.set(p.id, { ...productMap.get(p.id), ...p });
      });

      // Fetch cloud Firestore items
      try {
        const cloudProductsSnap: any = await getDocs(collection(db, 'products'));
        if (!cloudProductsSnap.empty) {
          cloudProductsSnap.forEach((d: any) => {
            const cp = d.data() as Product;
            if (cp && cp.id) {
              productMap.set(cp.id, { ...productMap.get(cp.id), ...cp });
            }
          });
        }
      } catch (err) {
        console.warn('[CloudSync] Firestore products read warning:', err);
      }

      // Fetch RTDB items
      try {
        const rtdbSnap = await get(ref(rtdb, 'products'));
        if (rtdbSnap.exists()) {
          const val = rtdbSnap.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((cp: any) => {
              if (cp && cp.id) {
                productMap.set(cp.id, { ...productMap.get(cp.id), ...cp });
              }
            });
          }
        }
      } catch (err) {
        console.warn('[CloudSync] RTDB products read warning:', err);
      }

      const mergedProducts = Array.from(productMap.values());
      storage.set('PRODUCTS', mergedProducts);
      window.dispatchEvent(new CustomEvent('dta_products_update', { detail: mergedProducts }));

      // Push all unified products to Firestore & RTDB in background
      this.syncAllProductsToCloud(mergedProducts);
    } catch (err) {
      console.warn('[CloudSync] Products initial sync error:', err);
    }

    try {
      // 2. Sync Categories
      const localCategories = storage.get<Category[]>('CATEGORIES', SEED_CATEGORIES);
      const categoryMap = new Map<string, Category>();

      SEED_CATEGORIES.forEach((c) => categoryMap.set(c.id, c));
      localCategories.forEach((c) => {
        if (c && c.id) categoryMap.set(c.id, { ...categoryMap.get(c.id), ...c });
      });

      try {
        const cloudCatSnap: any = await getDocs(collection(db, 'categories'));
        if (!cloudCatSnap.empty) {
          cloudCatSnap.forEach((d: any) => {
            const cc = d.data() as Category;
            if (cc && cc.id) categoryMap.set(cc.id, { ...categoryMap.get(cc.id), ...cc });
          });
        }
      } catch {}

      const mergedCategories = Array.from(categoryMap.values());
      storage.set('CATEGORIES', mergedCategories);
      window.dispatchEvent(new CustomEvent('dta_categories_update', { detail: mergedCategories }));

      // Push categories to cloud
      for (const cat of mergedCategories) {
        this.syncCategoryToCloud(cat);
      }
    } catch (err) {
      console.warn('[CloudSync] Categories sync error:', err);
    }

    try {
      // 3. Sync Users
      const cloudUsersSnap: any = await getDocs(collection(db, 'users'));
      const userMap = new Map<string, User>();
      userMap.set(OFFICIAL_ADMIN_USER.id, OFFICIAL_ADMIN_USER);

      storage.get<User[]>('USERS', []).forEach((u: User) => {
        if (u && u.id) userMap.set(u.id, u);
      });

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
  }

  /**
   * Pushes all products directly to Firestore and RTDB
   */
  public async syncAllProductsToCloud(productsToSync?: Product[]): Promise<number> {
    const list = productsToSync || storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
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
        await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
        await set(ref(rtdb, `products/${prod.id}`), prod);
      }
      storage.set('PRODUCTS', SEED_PRODUCTS);
      window.dispatchEvent(new CustomEvent('dta_products_update', { detail: SEED_PRODUCTS }));
    } catch (err) {
      console.warn('[CloudSync] Seeding products failed:', err);
    }
  }

  /**
   * Real-time Firestore Listeners
   */
  private startFirestoreListeners() {
    // 1. Products Stream
    try {
      const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot: any) => {
        if (snapshot.empty) return;
        const cloudList: Product[] = [];
        snapshot.forEach((d: any) => cloudList.push(d.data() as Product));
        if (cloudList.length > 0) {
          const localList = storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
          const map = new Map<string, Product>();
          localList.forEach((p) => map.set(p.id, p));
          cloudList.forEach((p) => map.set(p.id, { ...map.get(p.id), ...p }));
          const merged = Array.from(map.values());
          storage.set('PRODUCTS', merged);
          window.dispatchEvent(new CustomEvent('dta_products_update', { detail: merged }));
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
        snapshot.forEach((d: any) => categories.push(d.data() as Category));
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
        const salesMap = new Map<string, Sale>();
        storage.get<Sale[]>('SALES', []).forEach((s: Sale) => salesMap.set(s.id, s));
        snapshot.forEach((d: any) => {
          const s = d.data() as Sale;
          if (s && s.id) salesMap.set(s.id, s);
        });
        const merged = Array.from(salesMap.values());
        storage.set('SALES', merged);
        window.dispatchEvent(new CustomEvent('dta_sales_update', { detail: merged }));
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
        storage.get<User[]>('USERS', []).forEach((u: User) => {
          if (u && u.id) userMap.set(u.id, u);
        });

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
          const rtdbProducts = Object.values(val) as Product[];
          if (rtdbProducts.length > 0) {
            const localList = storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
            const map = new Map<string, Product>();
            localList.forEach((p) => map.set(p.id, p));
            rtdbProducts.forEach((p) => map.set(p.id, { ...map.get(p.id), ...p }));
            const merged = Array.from(map.values());
            storage.set('PRODUCTS', merged);
            window.dispatchEvent(new CustomEvent('dta_products_update', { detail: merged }));
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
      await setDoc(doc(db, 'products', product.id), product, { merge: true });
      await set(ref(rtdb, `products/${product.id}`), product);
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

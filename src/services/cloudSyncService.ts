import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { storage } from './storage';
import type { Category, Product } from '@/types';

class CloudSyncService {
  private isInitialized = false;
  private unsubscribers: Array<() => void> = [];

  async init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;
    this.listen('products', 'PRODUCTS'); this.listen('categories', 'CATEGORIES');
    this.listen('sales', 'SALES'); this.listen('users', 'USERS');
    this.listen('withdrawals', 'WITHDRAWALS'); this.listen('rewards', 'REWARDS');
    this.listen('notifications', 'NOTIFICATIONS'); this.listen('audit_logs', 'AUDIT_LOGS');
    this.listen('referrals', 'REFERRALS');
    this.listen('deleted_products', 'DELETED_PRODUCTS');
  }

  private listen(collectionName: string, cacheKey: Parameters<typeof storage.set>[0]) {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot: any) => {
      storage.set(cacheKey, snapshot.docs.map((item: any) => ({ id: item.id, ...item.data() })));
    }, (error: any) => console.warn(`[Firestore] ${collectionName} listener failed:`, error.code));
    this.unsubscribers.push(unsubscribe);
  }

  cleanProductForCloud(product: Product): Record<string, unknown> {
    return { ...product, id: String(product.id), name: String(product.name || '').trim(), slug: String(product.slug || '').trim(), categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds : [], retailPrice: Number(product.retailPrice || 0), partnerPrice: Number(product.partnerPrice || 0), suggestedSellingPrice: Number(product.suggestedSellingPrice || product.retailPrice || 0), grossMargin: Number(product.grossMargin ?? Math.max(0, product.retailPrice - product.partnerPrice)), currency: product.currency || 'PKR', status: product.status || 'active' };
  }

  async syncProductToCloud(product: Product) { await setDoc(doc(db, 'products', product.id), this.cleanProductForCloud(product), { merge: true }); }
  async syncAllProductsToCloud(products: Product[]) { for (const product of products) await this.syncProductToCloud(product); return products.length; }
  async deleteProductFromCloud(productId: string) { await deleteDoc(doc(db, 'products', productId)); }
  async archiveProduct(product: Product) {
    await setDoc(doc(db, 'deleted_products', product.id), this.cleanProductForCloud(product));
    await this.deleteProductFromCloud(product.id);
  }
  async restoreProduct(product: Product) {
    await this.syncProductToCloud(product);
    await deleteDoc(doc(db, 'deleted_products', product.id));
  }
  async syncCategoryToCloud(category: Category) { await setDoc(doc(db, 'categories', category.id), category, { merge: true }); }

  destroy() { this.unsubscribers.forEach(unsubscribe => unsubscribe()); this.unsubscribers = []; this.isInitialized = false; }
}

export const cloudSyncService = new CloudSyncService();

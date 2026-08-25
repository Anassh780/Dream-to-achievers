import { Product } from '@/types';
import { storage } from './storage';
import { SEED_PRODUCTS } from '@/config/products';

export const productService = {
  getAllProducts(): Product[] {
    const products = storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
    return products.filter((p) => p.status === 'active');
  },

  getAllAdminProducts(): Product[] {
    return storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getAllProducts().find((p) => p.slug === slug);
  },

  getFeaturedProducts(): Product[] {
    return this.getAllProducts().filter((p) => p.isFeatured);
  },

  saveProduct(product: Product): void {
    const products = storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    storage.set('PRODUCTS', products);
  },

  deleteProduct(productId: string): void {
    const products = storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS);
    storage.set(
      'PRODUCTS',
      products.filter((p) => p.id !== productId)
    );
  },
};

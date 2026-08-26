import { Product } from '@/types';
import { storage } from './storage';
import { SEED_PRODUCTS } from '@/config/products';
import { categoryService } from './categoryService';

export type ProductSortOption =
  | 'highest_margin'
  | 'lowest_margin'
  | 'most_stock'
  | 'recently_added'
  | 'price_asc'
  | 'price_desc';

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

  getProductById(id: string): Product | undefined {
    return this.getAllAdminProducts().find((p) => p.id === id);
  },

  getFeaturedProducts(): Product[] {
    return this.getAllProducts().filter((p) => p.isFeatured);
  },

  /**
   * Filters products by category or subcategory (including descendants)
   */
  filterProducts(
    products: Product[],
    categorySlug: string | null,
    subCategorySlug: string | null = null,
    searchQuery: string = ''
  ): Product[] {
    let list = [...products];

    // Filter by category
    if (categorySlug) {
      const activeSlug = subCategorySlug || categorySlug;
      const targetCategory = categoryService.getCategoryBySlug(activeSlug);

      if (targetCategory) {
        const allowedIds = categoryService.getAllDescendantCategoryIds(targetCategory.id);

        list = list.filter((p) => {
          if (p.categoryId && allowedIds.includes(p.categoryId)) return true;
          if (p.categoryIds && p.categoryIds.some((id) => allowedIds.includes(id))) return true;
          if (
            p.category &&
            (p.category.toLowerCase() === targetCategory.name.toLowerCase() ||
              allowedIds.some((id) => id.includes(p.category.toLowerCase())))
          )
            return true;
          return false;
        });
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  },

  /**
   * Sorts products by margin, stock, date, or price
   */
  sortProducts(products: Product[], sortBy: ProductSortOption = 'highest_margin'): Product[] {
    const list = [...products];

    switch (sortBy) {
      case 'highest_margin':
        return list.sort((a, b) => (b.grossMargin || 0) - (a.grossMargin || 0));
      case 'lowest_margin':
        return list.sort((a, b) => (a.grossMargin || 0) - (b.grossMargin || 0));
      case 'most_stock':
        return list.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));
      case 'recently_added':
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'price_asc':
        return list.sort((a, b) => a.partnerPrice - b.partnerPrice);
      case 'price_desc':
        return list.sort((a, b) => b.partnerPrice - a.partnerPrice);
      default:
        return list;
    }
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

import { Category, CategoryTreeNode, Product } from '@/types';
import { storage } from './storage';
import { SEED_CATEGORIES } from '@/config/categories';
import { auditService } from './auditService';
import { cloudSyncService } from './cloudSyncService';

export const categoryService = {
  /**
   * Retrieves all categories from storage/cache
   */
  getAllCategories(): Category[] {
    return storage.get<Category[]>('CATEGORIES', SEED_CATEGORIES);
  },

  /**
   * Retrieves only active categories for Storefront and Partner views
   */
  getActiveCategories(): Category[] {
    return this.getAllCategories()
      .filter((c) => c.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  /**
   * Finds a category by its unique ID
   */
  getCategoryById(id: string): Category | undefined {
    return this.getAllCategories().find((c) => c.id === id);
  },

  /**
   * Finds a category by its slug (or fallback by name)
   */
  getCategoryBySlug(slug: string): Category | undefined {
    const cleanSlug = slug.toLowerCase().trim();
    return this.getAllCategories().find(
      (c) => c.slug.toLowerCase() === cleanSlug || c.id.toLowerCase() === cleanSlug
    );
  },

  /**
   * Builds a nested category tree from a flat list of categories
   */
  buildCategoryTree(categories?: Category[]): CategoryTreeNode[] {
    const list = categories || this.getActiveCategories();
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    list.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    list.forEach((cat) => {
      const node = map.get(cat.id);
      if (!node) return;

      if (cat.parentId && map.has(cat.parentId)) {
        const parentNode = map.get(cat.parentId);
        parentNode?.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort roots and all child tiers by sortOrder
    const sortNodes = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          sortNodes(n.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  },

  /**
   * Returns a breadcrumb chain of categories from top-level down to leaf
   */
  getCategoryHierarchy(categoryId: string): Category[] {
    const hierarchy: Category[] = [];
    let currentId: string | null = categoryId;
    const all = this.getAllCategories();

    let safetyCount = 0;
    while (currentId && safetyCount < 5) {
      safetyCount++;
      const cat = all.find((c) => c.id === currentId);
      if (cat) {
        hierarchy.unshift(cat);
        currentId = cat.parentId;
      } else {
        break;
      }
    }

    return hierarchy;
  },

  /**
   * Returns all descendant category IDs (children + grandchildren)
   */
  getAllDescendantCategoryIds(categoryId: string): string[] {
    const descendants: string[] = [categoryId];
    const all = this.getAllCategories();

    const findChildren = (pid: string) => {
      const children = all.filter((c) => c.parentId === pid);
      children.forEach((c) => {
        descendants.push(c.id);
        findChildren(c.id);
      });
    };

    findChildren(categoryId);
    return descendants;
  },

  /**
   * Aggregates live productCount and avgProfitMarginPKR for each category
   */
  getAggregatedCategories(products: Product[]): Category[] {
    const categories = this.getAllCategories();

    return categories.map((cat) => {
      const descendantIds = this.getAllDescendantCategoryIds(cat.id);
      
      const matchingProducts = products.filter((p) => {
        if (p.status !== 'active') return false;
        if (p.categoryId && descendantIds.includes(p.categoryId)) return true;
        if (p.categoryIds && p.categoryIds.some((id) => descendantIds.includes(id))) return true;
        if (p.category && (p.category === cat.name || descendantIds.some(id => id.includes(p.category.toLowerCase())))) return true;
        return false;
      });

      const productCount = matchingProducts.length;
      const totalMargin = matchingProducts.reduce((sum, p) => sum + (p.grossMargin || 0), 0);
      const avgProfitMarginPKR = productCount > 0 ? Math.round(totalMargin / productCount) : 0;

      return {
        ...cat,
        productCount,
        avgProfitMarginPKR,
      };
    });
  },

  /**
   * Validates and saves or creates a category with gap-indexed sortOrder
   */
  saveCategory(
    categoryData: Partial<Category> & { name: string },
    adminEmail = 'admin@dreamtoachievers.com'
  ): { success: boolean; category?: Category; error?: string } {
    const all = this.getAllCategories();
    const isNew = !categoryData.id;
    const now = new Date().toISOString();

    // Auto-generate slug if missing
    let slug = (categoryData.slug || categoryData.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existingSlug = all.find((c) => c.slug === slug && c.id !== categoryData.id);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Determine parent and depth
    let parentId: string | null = categoryData.parentId || null;
    let depth: 0 | 1 | 2 = 0;

    if (parentId) {
      const parent = all.find((c) => c.id === parentId);
      if (!parent) {
        return { success: false, error: 'Parent category not found.' };
      }
      if (parent.depth >= 2) {
        return { success: false, error: 'Maximum category depth of 3 tiers (depth 2) exceeded.' };
      }
      // Prevent cyclic assignment
      if (categoryData.id && parentId === categoryData.id) {
        return { success: false, error: 'A category cannot be its own parent.' };
      }
      depth = (parent.depth + 1) as 1 | 2;
    }

    const id = categoryData.id || `cat-${slug || Date.now()}`;

    // Gap-indexed sortOrder calculation
    let sortOrder = categoryData.sortOrder;
    if (sortOrder === undefined) {
      const siblings = all.filter((c) => c.parentId === parentId);
      const maxSort = siblings.reduce((max, s) => Math.max(max, s.sortOrder || 0), 0);
      sortOrder = maxSort + 10;
    }

    const category: Category = {
      id,
      name: categoryData.name.trim(),
      slug,
      description: categoryData.description || '',
      icon: categoryData.icon || 'Package',
      bannerUrl: categoryData.bannerUrl,
      thumbnailUrl: categoryData.thumbnailUrl,
      featured: categoryData.featured ?? false,
      sortOrder,
      status: categoryData.status || 'active',
      parentId,
      depth,
      childIds: categoryData.childIds || [],
      metaTitle: categoryData.metaTitle || `${categoryData.name} Wholesale Catalog | DreamToAchievers`,
      metaDescription: categoryData.metaDescription || categoryData.description,
      createdAt: categoryData.createdAt || now,
      updatedAt: now,
      createdBy: categoryData.createdBy || adminEmail,
    };

    const index = all.findIndex((c) => c.id === id);
    if (index >= 0) {
      all[index] = category;
    } else {
      all.push(category);
    }

    // Update parent's childIds
    if (parentId) {
      const parentIndex = all.findIndex((c) => c.id === parentId);
      if (parentIndex >= 0 && !all[parentIndex].childIds.includes(id)) {
        all[parentIndex].childIds.push(id);
      }
    }

    storage.set('CATEGORIES', all);

    // Sync to Cloud
    cloudSyncService.syncCategoryToCloud(category);

    auditService.logAction({
      adminId: 'admin',
      adminEmail,
      action: isNew ? 'CREATE_CATEGORY' : 'UPDATE_CATEGORY',
      entityType: 'category',
      entityId: id,
      details: `${isNew ? 'Created' : 'Updated'} category "${category.name}" (depth ${category.depth}, slug: ${category.slug}).`,
    });

    return { success: true, category };
  },

  /**
   * Reorders sibling categories using batched gap-indexed sortOrder
   */
  reorderCategories(orderedIds: string[], parentId: string | null = null, adminEmail = 'admin@dreamtoachievers.com'): void {
    const all = this.getAllCategories();
    let orderCounter = 10;

    orderedIds.forEach((id) => {
      const cat = all.find((c) => c.id === id);
      if (cat) {
        cat.sortOrder = orderCounter;
        cat.parentId = parentId;
        orderCounter += 10;
      }
    });

    storage.set('CATEGORIES', all);

    auditService.logAction({
      adminId: 'admin',
      adminEmail,
      action: 'REORDER_CATEGORIES',
      entityType: 'category',
      entityId: parentId || 'root',
      details: `Reordered ${orderedIds.length} categories under parent ${parentId || 'root'}.`,
    });
  },

  /**
   * Soft-archives a category (checks for active children first)
   */
  archiveCategory(categoryId: string, adminEmail = 'admin@dreamtoachievers.com'): { success: boolean; error?: string } {
    const all = this.getAllCategories();
    const activeChildren = all.filter((c) => c.parentId === categoryId && c.status === 'active');

    if (activeChildren.length > 0) {
      return {
        success: false,
        error: `Cannot archive this category because it has ${activeChildren.length} active subcategories. Please reassign or archive them first.`,
      };
    }

    const cat = all.find((c) => c.id === categoryId);
    if (!cat) return { success: false, error: 'Category not found.' };

    cat.status = 'archived';
    cat.archivedAt = new Date().toISOString();
    cat.updatedAt = new Date().toISOString();

    storage.set('CATEGORIES', all);

    auditService.logAction({
      adminId: 'admin',
      adminEmail,
      action: 'ARCHIVE_CATEGORY',
      entityType: 'category',
      entityId: categoryId,
      details: `Archived category "${cat.name}".`,
    });

    return { success: true };
  },

  /**
   * Hard-deletes a category only if productCount === 0 and no children
   */
  deleteCategory(categoryId: string, products: Product[], adminEmail = 'admin@dreamtoachievers.com'): { success: boolean; error?: string } {
    const all = this.getAllCategories();
    const children = all.filter((c) => c.parentId === categoryId);
    if (children.length > 0) {
      return { success: false, error: 'Cannot delete a category with child subcategories. Delete or reassign children first.' };
    }

    const assignedProducts = products.filter((p) => p.categoryId === categoryId || p.categoryIds?.includes(categoryId));
    if (assignedProducts.length > 0) {
      return { success: false, error: `Cannot delete category because ${assignedProducts.length} products are currently assigned to it.` };
    }

    const filtered = all.filter((c) => c.id !== categoryId);
    storage.set('CATEGORIES', filtered);

    auditService.logAction({
      adminId: 'admin',
      adminEmail,
      action: 'DELETE_CATEGORY',
      entityType: 'category',
      entityId: categoryId,
      details: `Hard-deleted category ID "${categoryId}".`,
    });

    return { success: true };
  },
};

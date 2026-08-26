import React, { useState, useMemo } from 'react';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { useAuth } from '@/context/AuthContext';
import { Category, CategoryStatus, CategoryTreeNode } from '@/types';
import { CategoryIcon, AVAILABLE_ICONS } from '@/components/categories/CategoryIcon';
import { CategoryPill } from '@/components/categories/CategoryPill';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  PencilSimple,
  Trash,
  Eye,
  Star,
  CaretDown,
  CaretRight,
  CaretUp,
  ShieldCheck,
  Package,
  Sparkle,
  Warning,
  Check,
  X,
  DeviceMobile,
  Desktop,
  ArrowSquareOut,
  FolderOpen,
} from '@phosphor-icons/react';

export const AdminCategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const allProducts = useMemo(() => productService.getAllAdminProducts(), [refreshKey]);
  const rawCategories = useMemo(() => categoryService.getAllCategories(), [refreshKey]);
  const aggregatedCategories = useMemo(
    () => categoryService.getAggregatedCategories(allProducts),
    [allProducts, refreshKey]
  );
  const categoryTree = useMemo(
    () => categoryService.buildCategoryTree(aggregatedCategories),
    [aggregatedCategories]
  );

  // Drawer / Form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('Package');
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<CategoryStatus>('active');

  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  // Live Preview Modal state
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);
  const [previewViewport, setPreviewViewport] = useState<'mobile' | 'desktop'>('mobile');

  // Notification banners
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Open Create Drawer
  const handleOpenCreate = (parentId: string | null = null) => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormIcon('Package');
    setFormParentId(parentId);
    setFormBannerUrl('');
    setFormThumbnailUrl('');
    setFormFeatured(false);
    setFormStatus('active');
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || '');
    setFormIcon(cat.icon || 'Package');
    setFormParentId(cat.parentId);
    setFormBannerUrl(cat.bannerUrl || '');
    setFormThumbnailUrl(cat.thumbnailUrl || '');
    setFormFeatured(cat.featured);
    setFormStatus(cat.status);
    setIsDrawerOpen(true);
  };

  // Save / Update Category
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const result = categoryService.saveCategory(
      {
        id: editingCategory?.id,
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim(),
        icon: formIcon,
        parentId: formParentId,
        bannerUrl: formBannerUrl.trim() || undefined,
        thumbnailUrl: formThumbnailUrl.trim() || undefined,
        featured: formFeatured,
        status: formStatus,
      },
      user?.email || 'admin@dreamtoachievers.com'
    );

    if (result.success) {
      showToast(
        editingCategory
          ? `Updated category "${formName}".`
          : `Created new category "${formName}".`,
        'success'
      );
      setIsDrawerOpen(false);
      setRefreshKey((k) => k + 1);
    } else {
      showToast(result.error || 'Failed to save category.', 'error');
    }
  };

  // Archive / Soft Delete
  const handleArchive = (cat: Category) => {
    if (cat.status === 'archived') {
      // Unarchive
      categoryService.saveCategory(
        { id: cat.id, name: cat.name, status: 'active' },
        user?.email
      );
      showToast(`Restored category "${cat.name}" to active status.`, 'success');
      setRefreshKey((k) => k + 1);
      return;
    }

    const result = categoryService.archiveCategory(cat.id, user?.email);
    if (result.success) {
      showToast(`Archived category "${cat.name}".`, 'success');
      setRefreshKey((k) => k + 1);
    } else {
      showToast(result.error || 'Failed to archive category.', 'error');
    }
  };

  // Hard Delete
  const handleDelete = (cat: Category) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete category "${cat.name}"? This action cannot be undone.`
      )
    )
      return;

    const result = categoryService.deleteCategory(cat.id, allProducts, user?.email);
    if (result.success) {
      showToast(`Deleted category "${cat.name}".`, 'success');
      setRefreshKey((k) => k + 1);
    } else {
      showToast(result.error || 'Failed to delete category.', 'error');
    }
  };

  // Reorder Siblings
  const handleMoveSort = (cat: Category, direction: 'up' | 'down') => {
    const siblings = aggregatedCategories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = siblings.findIndex((c) => c.id === cat.id);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const temp = siblings[index];
      siblings[index] = siblings[index - 1];
      siblings[index - 1] = temp;
    } else if (direction === 'down' && index < siblings.length - 1) {
      const temp = siblings[index];
      siblings[index] = siblings[index + 1];
      siblings[index + 1] = temp;
    } else {
      return;
    }

    categoryService.reorderCategories(
      siblings.map((s) => s.id),
      cat.parentId,
      user?.email
    );
    setRefreshKey((k) => k + 1);
  };

  // Filter valid parent categories (depth 0-1 only)
  const eligibleParents = useMemo(() => {
    return rawCategories.filter(
      (c) => c.depth < 2 && (!editingCategory || c.id !== editingCategory.id)
    );
  }, [rawCategories, editingCategory]);

  return (
    <div className="space-y-6 font-sans max-w-6xl selection:bg-cyan-500/30">
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>Admin Console</span>
            <span>/</span>
            <span>Catalog CMS</span>
            <span>/</span>
            <span className="text-cyan-300 font-semibold">Multi-Tier Categories</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
              Category Architecture & Hierarchy
            </h1>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
              <span>{rawCategories.length} Categories</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage 3-tier product taxonomy, SEO metadata, icons, and storefront pill ordering.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            onClick={() => handleOpenCreate(null)}
            variant="primary"
            size="sm"
            className="rounded-xl font-bold text-xs shadow-md"
            iconLeft={<Plus size={14} weight="bold" />}
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center space-x-2.5 shadow-lg animate-in fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <Check size={16} weight="bold" className="shrink-0" />
          ) : (
            <Warning size={16} weight="bold" className="shrink-0" />
          )}
          <span className="font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* 2. Hierarchical Category Tree Table */}
      <div className="rounded-3xl bg-[#060B18] border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <FolderOpen size={16} className="text-cyan-400" />
            <span className="font-heading font-bold text-white uppercase tracking-wider text-xs">
              Live Category Tree Hierarchy
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Gap-indexed ordering • Real-time Storefront Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] text-[10px] font-mono uppercase text-slate-400 border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 pl-5">Order</th>
                <th className="p-3.5">Category Name & Hierarchy</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Avg Margin</th>
                <th className="p-3.5">Featured</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {categoryTree.map((rootNode) => (
                <React.Fragment key={rootNode.id}>
                  {/* Top-Level Category Row */}
                  <tr className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleMoveSort(rootNode, 'up')}
                          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
                          title="Move Up"
                        >
                          <CaretUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveSort(rootNode, 'down')}
                          className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
                          title="Move Down"
                        >
                          <CaretDown size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 flex items-center justify-center shrink-0">
                          <CategoryIcon name={rootNode.icon} size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-white truncate max-w-[200px]">
                            {rootNode.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Tier 1 • Top-Level
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-cyan-400/90">
                      /{rootNode.slug}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          rootNode.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                            : rootNode.status === 'draft'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                        }`}
                      >
                        {rootNode.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-white">
                      {rootNode.productCount ?? 0} SKUs
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      +PKR {rootNode.avgProfitMarginPKR ?? 0}
                    </td>
                    <td className="p-3.5">
                      {rootNode.featured ? (
                        <Star size={15} weight="fill" className="text-amber-400" />
                      ) : (
                        <Star size={15} className="text-slate-600" />
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenCreate(rootNode.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs flex items-center space-x-1"
                          title="Add Sub-Category"
                        >
                          <Plus size={12} />
                          <span className="text-[10px]">Add Sub</span>
                        </button>
                        <button
                          onClick={() => setPreviewCategory(rootNode)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          title="Live Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rootNode)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                          title="Edit"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          onClick={() => handleArchive(rootNode)}
                          className={`p-1.5 rounded-lg ${
                            rootNode.status === 'archived'
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          }`}
                          title={rootNode.status === 'archived' ? 'Restore' : 'Archive'}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Sub-Category Rows (Depth 1) */}
                  {rootNode.children?.map((subNode) => (
                    <tr
                      key={subNode.id}
                      className="bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleMoveSort(subNode, 'up')}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
                            title="Move Up"
                          >
                            <CaretUp size={12} />
                          </button>
                          <button
                            onClick={() => handleMoveSort(subNode, 'down')}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5"
                            title="Move Down"
                          >
                            <CaretDown size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 pl-10">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-slate-600 font-mono">└</span>
                          <div className="w-6 h-6 rounded-md bg-white/5 text-slate-300 flex items-center justify-center shrink-0">
                            <CategoryIcon name={subNode.icon} size={12} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 truncate max-w-[180px]">
                              {subNode.name}
                            </p>
                            <p className="text-[9px] text-slate-500 font-mono">
                              Tier 2 • Sub-Category
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        /{rootNode.slug}/{subNode.slug}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                            subNode.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {subNode.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {subNode.productCount ?? 0} SKUs
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400">
                        +PKR {subNode.avgProfitMarginPKR ?? 0}
                      </td>
                      <td className="p-3.5">
                        {subNode.featured && (
                          <Star size={13} weight="fill" className="text-amber-400" />
                        )}
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setPreviewCategory(subNode)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                            title="Live Preview"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(subNode)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                            title="Edit"
                          >
                            <PencilSimple size={13} />
                          </button>
                          <button
                            onClick={() => handleArchive(subNode)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Archive"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Create / Edit Category Modal Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-[#060B18] border border-white/15 shadow-2xl space-y-5 text-xs font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-300 flex items-center justify-center">
                  <CategoryIcon name={formIcon} size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-white">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formParentId ? 'Assigning as sub-category' : 'Top-level root category'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!editingCategory) {
                        setFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '')
                        );
                      }
                    }}
                    placeholder="e.g. Organic Skincare"
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. organic-skincare"
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Parent Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Parent Category (Depth 0-1)</label>
                  <select
                    value={formParentId || ''}
                    onChange={(e) => setFormParentId(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="">None (Top-Level Category)</option>
                    {eligibleParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Tier {p.depth + 1})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as CategoryStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="active">Active (Visible on Storefront)</option>
                    <option value="draft">Draft (Admin Only)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Icon Picker Trigger */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Category Icon</label>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-[#030712] border border-white/15 flex items-center justify-center text-cyan-400 shrink-0">
                    <CategoryIcon name={formIcon} size={20} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(!iconPickerOpen)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold"
                  >
                    Select Icon ({formIcon})
                  </button>
                </div>

                {/* Searchable Icon Grid Dropdown */}
                {iconPickerOpen && (
                  <div className="p-3 rounded-2xl bg-[#030712] border border-white/15 space-y-2 mt-2">
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder="Search available icons..."
                      className="w-full px-3 py-1.5 rounded-lg bg-[#060B18] border border-white/10 text-white text-xs"
                    />
                    <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                      {AVAILABLE_ICONS.filter((i) =>
                        i.toLowerCase().includes(iconSearch.toLowerCase())
                      ).map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setFormIcon(iconName);
                            setIconPickerOpen(false);
                          }}
                          className={`p-2 rounded-lg flex flex-col items-center justify-center space-y-1 hover:bg-white/10 transition-colors ${
                            formIcon === iconName ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-slate-300'
                          }`}
                        >
                          <CategoryIcon name={iconName} size={16} />
                          <span className="text-[9px] truncate max-w-[45px]">{iconName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Editorial Overview Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short, high-converting overview of the products in this category..."
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Banner Image URL (1600x600)</label>
                  <input
                    type="url"
                    value={formBannerUrl}
                    onChange={(e) => setFormBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Thumbnail URL (400x400)</label>
                  <input
                    type="url"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400"
                />
                <label htmlFor="featuredCheck" className="text-slate-300 font-medium cursor-pointer">
                  Feature this category as a highlighted badge on storefront
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="rounded-xl font-bold px-6">
                  {editingCategory ? 'Save Changes' : 'Publish Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Live Pixel-Identical Preview Modal */}
      {previewCategory && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 rounded-3xl bg-[#060B18] border border-white/15 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Eye size={16} className="text-cyan-400" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Storefront Live Preview: {previewCategory.name}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-[#030712] p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setPreviewViewport('mobile')}
                    className={`p-1 rounded ${
                      previewViewport === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                    }`}
                    title="Mobile View"
                  >
                    <DeviceMobile size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewViewport('desktop')}
                    className={`p-1 rounded ${
                      previewViewport === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                    }`}
                    title="Desktop View"
                  >
                    <Desktop size={14} />
                  </button>
                </div>
                <button
                  onClick={() => setPreviewCategory(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div
              className={`mx-auto p-4 rounded-2xl bg-[#020612] border border-white/[0.08] space-y-4 ${
                previewViewport === 'mobile' ? 'max-w-xs' : 'w-full'
              }`}
            >
              <div className="space-y-1 text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                  Storefront Pill Render
                </span>
                <div className="flex items-center justify-center gap-2">
                  <CategoryPill
                    name={previewCategory.name}
                    icon={previewCategory.icon}
                    isActive={true}
                    count={previewCategory.productCount}
                    avgMargin={previewCategory.avgProfitMarginPKR}
                  />
                  <CategoryPill
                    name={previewCategory.name}
                    icon={previewCategory.icon}
                    isActive={false}
                    count={previewCategory.productCount}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block text-center">
                  Overview Card Render
                </span>
                <CategoryCard category={previewCategory} />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl"
                onClick={() => setPreviewCategory(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

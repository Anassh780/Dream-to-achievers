import React, { useState, useMemo } from 'react';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { useAuth } from '@/context/AuthContext';
import { Category, CategoryStatus } from '@/types';
import { CategoryIcon, AVAILABLE_ICONS } from '@/components/categories/CategoryIcon';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  PencilSimple,
  Trash,
  CaretDown,
  Check,
  X,
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

  // Auto-slug generator on name change
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Save Category Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !user) {
      showToast('Category name is required.', 'error');
      return;
    }

    const result = categoryService.saveCategory(
      {
        id: editingCategory?.id,
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim(),
        icon: formIcon,
        parentId: formParentId,
        bannerUrl: formBannerUrl.trim(),
        thumbnailUrl: formThumbnailUrl.trim(),
        featured: formFeatured,
        status: formStatus,
      },
      user.email
    );

    if (result.success) {
      showToast(`Category "${formName}" saved successfully.`);
      setIsDrawerOpen(false);
      setRefreshKey((k) => k + 1);
    } else {
      showToast(result.error || 'Failed to save category.', 'error');
    }
  };

  // Delete Category Protection Check
  const handleDelete = (cat: Category) => {
    if (!user) return;
    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      const result = categoryService.deleteCategory(cat.id, allProducts, user.email);
      if (result.success) {
        showToast(`Category "${cat.name}" deleted.`);
        setRefreshKey((k) => k + 1);
      } else {
        showToast(result.error || 'Failed to delete category.', 'error');
      }
    }
  };

  const filteredIcons = AVAILABLE_ICONS.filter((ic) =>
    ic.toLowerCase().includes(iconSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Admin Console</span>
            <span>/</span>
            <span>Commerce Taxonomy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F] tracking-tight">
            Category Taxonomy &amp; Hierarchy Management
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Manage 3-tier parent/subcategory taxonomy with drag ordering and product count protection.
          </p>
        </div>

        <Button
          onClick={() => handleOpenCreate(null)}
          variant="primary"
          size="sm"
          className="text-xs font-medium shrink-0"
          iconLeft={<Plus size={14} />}
        >
          Add Root Category
        </Button>
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in ${
            toastMsg.type === 'success'
              ? 'bg-[#F1ECDD] border-[#E3DCC8] text-[#1F4D3E]'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {toastMsg.type === 'success' ? <Check size={16} weight="bold" /> : <X size={16} weight="bold" />}
          <span className="font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* 2. Taxonomy Hierarchy Tree Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Category Hierarchy Tree</span>
          <span className="text-[10px] text-[#5B5C50]">{rawCategories.length} Categories</span>
        </div>

        <div className="divide-y divide-[#E3DCC8]">
          {categoryTree.map((parent) => (
            <div key={parent.id} className="p-4 hover:bg-[#FAF7EF] transition-colors space-y-3">
              {/* Parent Level 1 Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
                    <CategoryIcon name={parent.icon} size={16} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif font-semibold text-sm text-[#1E241F]">{parent.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
                        Tier 1 (Root)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5B5C50] font-mono">
                      Slug: /{parent.slug} • {parent.productCount || 0} Products
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenCreate(parent.id)}
                    className="px-2 py-1 rounded bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] text-[11px] font-mono flex items-center gap-1"
                  >
                    <Plus size={12} /> Subcategory
                  </button>
                  <button
                    onClick={() => handleOpenEdit(parent)}
                    className="p-1.5 rounded bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8]"
                    title="Edit Category"
                  >
                    <PencilSimple size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(parent)}
                    className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    title="Delete Category"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>

              {/* Subcategories Level 2 Tier */}
              {parent.children && parent.children.length > 0 && (
                <div className="pl-6 ml-4 border-l-2 border-[#E3DCC8] space-y-2">
                  {parent.children.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <CategoryIcon name={sub.icon} size={14} className="text-[#5B5C50]" />
                        <span className="font-serif font-medium text-[#1E241F] text-xs">{sub.name}</span>
                        <span className="text-[10px] font-mono text-[#7C7D70]">
                          ({sub.productCount || 0} items)
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1 rounded bg-white hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8]"
                        >
                          <PencilSimple size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub)}
                          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Category Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-lg text-[#1E241F]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Configure taxonomy parameters &amp; parent relationships
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Cleansers & Toners"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">URL Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="cleansers-toners"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Parent Category</label>
                  <select
                    value={formParentId || ''}
                    onChange={(e) => setFormParentId(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
                  >
                    <option value="">None (Root Category Tier 1)</option>
                    {rawCategories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Icon Selection</label>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(!iconPickerOpen)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <CategoryIcon name={formIcon} size={15} />
                      <span className="font-mono text-[11px]">{formIcon}</span>
                    </div>
                    <CaretDown size={12} />
                  </button>
                </div>
              </div>

              {/* Icon Picker Popover */}
              {iconPickerOpen && (
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Search icons..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E3DCC8] text-xs focus:outline-none focus:border-[#1F4D3E]"
                  />
                  <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
                    {filteredIcons.map((ic) => (
                      <button
                        type="button"
                        onClick={() => {
                          setFormIcon(ic);
                          setIconPickerOpen(false);
                        }}
                        className={`p-2 rounded-lg border flex items-center justify-center transition-colors ${
                          formIcon === ic
                            ? 'bg-[#1F4D3E] text-white border-[#1F4D3E]'
                            : 'bg-white text-[#1E241F] border-[#E3DCC8] hover:bg-[#F1ECDD]'
                        }`}
                        title={ic}
                      >
                        <CategoryIcon name={ic} size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Editorial category overview..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3DCC8] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-medium">
                  {editingCategory ? 'Save Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

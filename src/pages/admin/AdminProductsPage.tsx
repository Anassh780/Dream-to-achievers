import React, { useState, useMemo } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { SEED_PRODUCTS } from '@/config/products';
import { Button } from '@/components/ui/Button';
import { Plus, Trash, X, PencilSimple, Package, TrendUp, ShieldCheck } from '@phosphor-icons/react';

export const AdminProductsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(() =>
    storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS)
  );
  const allCategories = useMemo(() => categoryService.getAllCategories(), []);
  const categoryTree = useMemo(
    () => categoryService.buildCategoryTree(allCategories.filter((c) => c.status === 'active')),
    [allCategories]
  );

  const [isCreating, setIsCreating] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>(allCategories[0]?.id || 'cat-skincare');
  const [retailPrice, setRetailPrice] = useState(2500);
  const [partnerPrice, setPartnerPrice] = useState(2000);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
  );
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  const selectedCategoryObj = useMemo(
    () => allCategories.find((c) => c.id === categoryId),
    [categoryId, allCategories]
  );

  const handleOpenCreate = () => {
    setEditingProd(null);
    setName('');
    setCategoryId(allCategories[0]?.id || 'cat-skincare');
    setRetailPrice(2500);
    setPartnerPrice(2000);
    setImageUrl('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80');
    setShortDescription('');
    setDescription('');
    setIsCreating(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setCategoryId(p.categoryId || allCategories[0]?.id || 'cat-skincare');
    setRetailPrice(p.retailPrice);
    setPartnerPrice(p.partnerPrice);
    setImageUrl(p.imageUrl);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setIsCreating(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentAdmin) return;

    const grossMargin = Math.max(0, retailPrice - partnerPrice);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const targetCat = allCategories.find((c) => c.id === categoryId);
    const categoryName = targetCat ? targetCat.name : 'General Catalog';
    const categoryHierarchyIds = targetCat
      ? categoryService.getCategoryHierarchy(targetCat.id).map((c) => c.id)
      : [categoryId];

    const newProd: Product = {
      id: editingProd ? editingProd.id : `prod-${Date.now()}`,
      name,
      slug,
      shortDescription,
      description: description || shortDescription,
      category: categoryName,
      categoryId,
      categoryIds: categoryHierarchyIds,
      retailPrice,
      partnerPrice,
      suggestedSellingPrice: retailPrice,
      grossMargin,
      currency: 'PKR',
      imageUrl,
      sku: editingProd ? editingProd.sku : `DTA-${Date.now().toString().slice(-4)}`,
      inStock: true,
      isFeatured: editingProd ? editingProd.isFeatured : false,
      status: 'active',
      createdAt: editingProd ? editingProd.createdAt : new Date().toISOString(),
    };

    let updated: Product[];
    if (editingProd) {
      updated = products.map((p) => (p.id === editingProd.id ? newProd : p));
      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'UPDATE_PRODUCT',
        entityType: 'product',
        entityId: newProd.id,
        details: `Updated catalog product ${newProd.name} (Category: ${categoryName}, Margin: PKR ${grossMargin}).`,
      });
    } else {
      updated = [newProd, ...products];
      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'CREATE_PRODUCT',
        entityType: 'product',
        entityId: newProd.id,
        details: `Added new product ${newProd.name} (Category: ${categoryName}, Margin: PKR ${grossMargin}).`,
      });
    }

    setProducts(updated);
    storage.set('PRODUCTS', updated);
    setIsCreating(false);
    setEditingProd(null);
  };

  const handleDelete = (prodId: string) => {
    if (!currentAdmin) return;
    const target = products.find((p) => p.id === prodId);
    if (!target) return;

    if (!window.confirm(`Are you sure you want to delete "${target.name}"?`)) return;

    const updated = products.filter((p) => p.id !== prodId);
    setProducts(updated);
    storage.set('PRODUCTS', updated);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'DELETE_PRODUCT',
      entityType: 'product',
      entityId: prodId,
      details: `Deleted product ${target.name} from catalog.`,
    });
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl selection:bg-cyan-500/30">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>Admin Console</span>
            <span>/</span>
            <span>Inventory</span>
            <span>/</span>
            <span className="text-cyan-300 font-semibold">Products Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
            Wholesale Products & Pricing Inventory
          </h1>
          <p className="text-xs text-slate-400">
            Manage wholesale costs, suggested retail prices, product margins, and category assignments.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="rounded-xl font-bold text-xs shadow-md"
            iconLeft={<Plus size={14} weight="bold" />}
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* 2. Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-4 flex flex-col justify-between shadow-xl group hover:border-cyan-400/30 transition-all"
          >
            <div className="space-y-3">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#030712] relative">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#030712]/90 text-white border border-white/10">
                  {p.category}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>SKU: {p.sku}</span>
                  <span className="text-emerald-400">In Stock</span>
                </div>
                <h3 className="font-heading font-bold text-sm text-white truncate">{p.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.shortDescription}
                </p>
              </div>
            </div>

            {/* Economics Box */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Retail Price:</span>
                  <span className="text-white font-mono">PKR {p.retailPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Partner Wholesale:</span>
                  <span className="text-cyan-300 font-mono">PKR {p.partnerPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/[0.06] pt-1 text-slate-300">
                  <span>Gross Profit Margin:</span>
                  <span className="text-emerald-400 font-mono">+PKR {p.grossMargin.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <PencilSimple size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                  title="Delete Product"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Product Create / Edit Modal Drawer */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-[#060B18] border border-white/15 shadow-2xl space-y-4 text-xs font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Package size={18} className="text-cyan-400" />
                <h3 className="text-sm font-heading font-bold text-white">
                  {editingProd ? `Edit Product: ${editingProd.name}` : 'Add Wholesale Product'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Luxe Botanical Serum"
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Multi-Tier Category Dropdown with Live Margin Sanity Check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">Assigned Category Hierarchy *</label>
                  {selectedCategoryObj && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <TrendUp size={11} />
                      <span>Category Avg Margin: +PKR {selectedCategoryObj.avgProfitMarginPKR ?? 500}</span>
                    </span>
                  )}
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {categoryTree.map((rootCat) => (
                    <optgroup key={rootCat.id} label={`📁 ${rootCat.name} (Tier 1)`}>
                      <option value={rootCat.id}>{rootCat.name} (Direct)</option>
                      {rootCat.children?.map((subCat) => (
                        <option key={subCat.id} value={subCat.id}>
                          &nbsp;&nbsp;└─ {subCat.name} (Tier 2 Sub-Category)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Prices & Margins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Retail Price (PKR) *</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold">Partner Wholesale Cost (PKR) *</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={partnerPrice}
                    onChange={(e) => setPartnerPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Computed Margin Banner */}
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Computed Unit Margin:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +PKR {Math.max(0, retailPrice - partnerPrice).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Image URL</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Short Summary Description</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="One sentence summary for catalog card..."
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Full Product Details</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed ingredients, specifications, and selling points..."
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="rounded-xl font-bold px-6">
                  {editingProd ? 'Save Changes' : 'Publish Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

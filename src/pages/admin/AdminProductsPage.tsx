import React, { useState, useMemo } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { SEED_PRODUCTS } from '@/config/products';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Trash,
  X,
  PencilSimple,
  Package,
  Check,
  MagnifyingGlass,
} from '@phosphor-icons/react';

export const AdminProductsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(() =>
    storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS)
  );
  const allCategories = useMemo(() => categoryService.getAllCategories(), []);

  const [isCreating, setIsCreating] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>(allCategories[0]?.id || 'cat-skincare');
  const [retailPrice, setRetailPrice] = useState(2500);
  const [partnerPrice, setPartnerPrice] = useState(2000);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
  );
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const calculatedGrossMargin = Math.max(0, retailPrice - partnerPrice);

  const handleOpenCreate = () => {
    setEditingProd(null);
    setName('');
    setSku(`DTA-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategoryId(allCategories[0]?.id || 'cat-skincare');
    setRetailPrice(2500);
    setPartnerPrice(2000);
    setImageUrl('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80');
    setShortDescription('');
    setDescription('');
    setInStock(true);
    setIsFeatured(false);
    setIsCreating(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.categoryId || allCategories[0]?.id || 'cat-skincare');
    setRetailPrice(p.retailPrice);
    setPartnerPrice(p.partnerPrice);
    setImageUrl(p.imageUrl);
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setInStock(p.inStock);
    setIsFeatured(p.isFeatured || false);
    setIsCreating(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentAdmin) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const targetCat = allCategories.find((c) => c.id === categoryId);
    const categoryName = targetCat ? targetCat.name : 'Skincare & Beauty';

    if (editingProd) {
      const updated: Product[] = products.map((p) =>
        p.id === editingProd.id
          ? {
              ...p,
              name: name.trim(),
              slug,
              category: categoryName,
              categoryId,
              retailPrice: Number(retailPrice),
              partnerPrice: Number(partnerPrice),
              suggestedSellingPrice: Number(retailPrice),
              grossMargin: calculatedGrossMargin,
              sku: sku.trim(),
              imageUrl: imageUrl.trim(),
              shortDescription: shortDescription.trim(),
              description: description.trim(),
              inStock,
              isFeatured,
            }
          : p
      );

      storage.set('PRODUCTS', updated);
      setProducts(updated);

      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'UPDATE_PRODUCT',
        entityType: 'product',
        entityId: editingProd.id,
        details: `Updated product "${name}" (SKU: ${sku})`,
      });

      showToast(`Product "${name}" updated successfully.`);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        slug,
        category: categoryName,
        categoryId,
        retailPrice: Number(retailPrice),
        partnerPrice: Number(partnerPrice),
        suggestedSellingPrice: Number(retailPrice),
        grossMargin: calculatedGrossMargin,
        currency: 'PKR',
        imageUrl: imageUrl.trim(),
        sku: sku.trim(),
        inStock,
        isFeatured,
        status: 'active',
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      const updated = [newProduct, ...products];
      storage.set('PRODUCTS', updated);
      setProducts(updated);

      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'CREATE_PRODUCT',
        entityType: 'product',
        entityId: newProduct.id,
        details: `Created product "${name}" (SKU: ${sku})`,
      });

      showToast(`Product "${name}" created successfully.`);
    }

    setIsCreating(false);
  };

  const handleDelete = (p: Product) => {
    if (!currentAdmin) return;
    if (confirm(`Are you sure you want to delete ${p.name}?`)) {
      const updated = products.filter((item) => item.id !== p.id);
      storage.set('PRODUCTS', updated);
      setProducts(updated);

      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'DELETE_PRODUCT',
        entityType: 'product',
        entityId: p.id,
        details: `Deleted product "${p.name}" (SKU: ${p.sku})`,
      });

      showToast(`Product "${p.name}" deleted.`);
    }
  };

  const filteredList = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        categoryFilter === 'all' ||
        p.category === categoryFilter ||
        p.categoryId === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Store Admin</span>
            <span>/</span>
            <span>Products &amp; Inventory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F] tracking-tight">
            Products &amp; Wholesale Catalog
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Manage products, wholesale pricing, retail margins, and in-stock inventory for your store.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          variant="primary"
          size="sm"
          className="text-xs font-medium shrink-0"
          iconLeft={<Plus size={14} />}
        >
          + Add New Product
        </Button>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
          <Check size={16} weight="bold" className="shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Listed Products</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">{products.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">In Stock &amp; Available</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">
            {products.filter((p) => p.inStock).length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Featured Highlights</span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">
            {products.filter((p) => p.isFeatured).length}
          </span>
        </div>
      </div>

      {/* 2. Search & Category Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#7C7D70] text-xs focus:outline-none focus:border-[#1F4D3E]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-[#5B5C50] font-mono hidden sm:inline">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] font-mono text-[#5B5C50]">
            {filteredList.length} SKUs
          </span>
        </div>
      </div>

      {/* 3. Operational Data Table */}
      <div className="rounded-xl bg-white border border-[#E3DCC8] overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#E3DCC8] bg-[#F1ECDD] text-[#5B5C50] font-mono text-[11px]">
              <th className="p-3.5">Product</th>
              <th className="p-3.5">SKU &amp; Category</th>
              <th className="p-3.5">Stock</th>
              <th className="p-3.5 text-right">Retail Price</th>
              <th className="p-3.5 text-right">Wholesale Cost</th>
              <th className="p-3.5 text-right">Partner Margin</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3DCC8]">
            {filteredList.map((prod) => (
              <tr key={prod.id} className="hover:bg-[#FAF7EF] transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center space-x-3">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-[#FAF7EF] border border-[#E3DCC8] shrink-0"
                    />
                    <div className="max-w-[220px]">
                      <span className="font-serif font-semibold text-[#1E241F] truncate block">{prod.name}</span>
                      <span className="text-[10px] text-[#5B5C50] line-clamp-1">{prod.shortDescription}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 font-mono text-[#5B5C50]">
                  <span className="block text-[#1E241F] font-medium">{prod.sku}</span>
                  <span className="text-[10px] text-[#7C7D70]">{prod.category}</span>
                </td>
                <td className="p-3.5">
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                      prod.inStock
                        ? 'bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {prod.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="p-3.5 text-right font-mono text-[#1E241F]">
                  PKR {prod.retailPrice.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-[#1F4D3E] font-medium">
                  PKR {prod.partnerPrice.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-[#B8862E] font-bold">
                  +PKR {prod.grossMargin.toLocaleString()}
                </td>
                <td className="p-3.5 text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] transition-colors"
                      title="Edit Product"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      title="Delete Product"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Product Modal Drawer */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-lg text-[#1E241F]">
                  {editingProd ? 'Edit Product SKU' : 'Add New Wholesale Product'}
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Configure commercial specs &amp; unit margins
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Rose Hydrating Mist"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="DTA-1049"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Category Assignment</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Retail Price (PKR)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Wholesale Cost (PKR)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={partnerPrice}
                    onChange={(e) => setPartnerPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Gross Margin (PKR)</label>
                  <input
                    type="text"
                    disabled
                    value={`+PKR ${calculatedGrossMargin.toLocaleString()}`}
                    className="w-full px-3 py-2 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] text-[#B8862E] font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Short One-Line Summary</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Key highlight or ingredient benefits"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Full Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product information..."
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#5B5C50] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded accent-[#1F4D3E]"
                  />
                  <span>In Stock Availability</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-[#5B5C50] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded accent-[#1F4D3E]"
                  />
                  <span>Featured in Catalog</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E3DCC8] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-medium">
                  {editingProd ? 'Save Changes' : 'Create Product SKU'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

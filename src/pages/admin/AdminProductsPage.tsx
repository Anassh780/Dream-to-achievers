import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { SEED_PRODUCTS } from '@/config/products';
import { Button } from '@/components/ui/Button';
import { Plus, Trash, X } from '@phosphor-icons/react';

export const AdminProductsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(storage.get<Product[]>('PRODUCTS', SEED_PRODUCTS));
  const [isCreating, setIsCreating] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);

  // New Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('Skincare & Beauty');
  const [retailPrice, setRetailPrice] = useState(2500);
  const [partnerPrice, setPartnerPrice] = useState(2000);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentAdmin) return;

    const grossMargin = Math.max(0, retailPrice - partnerPrice);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProd: Product = {
      id: editingProd ? editingProd.id : `prod-${Date.now()}`,
      name,
      slug,
      shortDescription,
      description,
      category,
      retailPrice,
      partnerPrice,
      suggestedSellingPrice: retailPrice,
      grossMargin,
      currency: 'PKR',
      imageUrl,
      sku: `DTA-${Date.now().toString().slice(-4)}`,
      inStock: true,
      isFeatured: false,
      status: 'active',
      createdAt: new Date().toISOString(),
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
        details: `Updated catalog pricing/details for ${newProd.name} (Margin: PKR ${grossMargin}).`,
      });
    } else {
      updated = [newProd, ...products];
      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'CREATE_PRODUCT',
        entityType: 'product',
        entityId: newProd.id,
        details: `Added new product ${newProd.name} (Retail PKR ${retailPrice}, Partner PKR ${partnerPrice}).`,
      });
    }

    setProducts(updated);
    storage.set('PRODUCTS', updated);
    setIsCreating(false);
    setEditingProd(null);
    setName('');
    setShortDescription('');
    setDescription('');
  };

  const handleDelete = (prodId: string) => {
    if (!currentAdmin) return;
    const target = products.find((p) => p.id === prodId);
    const updated = products.filter((p) => p.id !== prodId);
    setProducts(updated);
    storage.set('PRODUCTS', updated);

    if (target) {
      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'DELETE_PRODUCT',
        entityType: 'product',
        entityId: prodId,
        details: `Deleted product ${target.name} from catalog.`,
      });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
            <span>Admin</span>
            <span>•</span>
            <span>Catalog Inventory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Product Management
          </h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingProd(null);
            setIsCreating(true);
          }}
        >
          <Plus size={15} className="mr-1" />
          Add Product
        </Button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        {products.map((p) => (
          <div key={p.id} className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-black/40">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-sm text-white">{p.name}</h3>
              <span className="text-[11px] text-[#8996A8] block">{p.category} • SKU: {p.sku}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0D141F] border border-white/[0.04] space-y-1 text-xs">
              <div className="flex justify-between text-[#8996A8]">
                <span>Retail Price:</span>
                <span className="text-white font-medium">PKR {p.retailPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#8996A8]">
                <span>Partner Wholesale:</span>
                <span className="text-white font-medium">PKR {p.partnerPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-white/[0.06] pt-1">
                <span className="text-[#8996A8]">Gross Margin:</span>
                <span className="text-[#22C55E]">PKR {p.grossMargin.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  setEditingProd(p);
                  setName(p.name);
                  setCategory(p.category);
                  setRetailPrice(p.retailPrice);
                  setPartnerPrice(p.partnerPrice);
                  setImageUrl(p.imageUrl);
                  setShortDescription(p.shortDescription);
                  setDescription(p.description);
                  setIsCreating(true);
                }}
                className="flex-1 p-1.5 rounded-lg bg-[#16202E] hover:bg-[#1C283A] text-white text-center border border-white/10"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20"
                title="Delete Product"
              >
                <Trash size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal (Step 34) */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#111A27] border border-white/[0.12] shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white">
                {editingProd ? `Edit Product: ${editingProd.name}` : 'Add Catalog Product'}
              </h3>
              <button onClick={() => setIsCreating(false)} className="text-[#8996A8] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-[#CBD5E1] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="Skincare & Beauty">Skincare & Beauty</option>
                    <option value="Electronics & Tech">Electronics & Tech</option>
                    <option value="Home & Lifestyle">Home & Lifestyle</option>
                    <option value="Wellness & Fitness">Wellness & Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#CBD5E1] mb-1">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] mb-1">Retail Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-[#CBD5E1] mb-1">Partner Wholesale Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={partnerPrice}
                    onChange={(e) => setPartnerPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-between text-[#4ADE80]">
                <span>Calculated Partner Margin:</span>
                <span className="font-semibold text-sm">PKR {Math.max(0, retailPrice - partnerPrice).toLocaleString()} / sale</span>
              </div>

              <div>
                <label className="block text-[#CBD5E1] mb-1">Tagline</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#CBD5E1] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6] resize-none"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary" size="md" className="flex-1 justify-center">
                  Save Product
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

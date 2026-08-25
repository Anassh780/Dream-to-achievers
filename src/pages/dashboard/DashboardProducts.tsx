import React, { useState } from 'react';
import { SEED_PRODUCTS } from '@/config/products';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Check, X } from '@phosphor-icons/react';

export const DashboardProducts: React.FC = () => {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct || !customerName) return;

    salesService.recordSale({
      userId: user.id,
      product: selectedProduct,
      customerName,
      customerEmail,
      quantity,
    });

    setSuccessMsg(`Sale recorded for ${selectedProduct.name}. +PKR ${(selectedProduct.grossMargin * quantity).toLocaleString()} margin credited.`);
    setSelectedProduct(null);
    setCustomerName('');
    setCustomerEmail('');
    setQuantity(1);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Catalog</span>
          <span>•</span>
          <span>Wholesale Pricing</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Products & Direct Sales
        </h1>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          Browse products, view wholesale margins, and record customer orders.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#4ADE80] text-xs flex items-center space-x-2">
          <Check size={16} weight="bold" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SEED_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-black/40 relative">
                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-medium px-2 py-0.5 rounded bg-[#080D14]/90 text-[#F8FAFC]">
                  {prod.category}
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-white">{prod.name}</h3>
                <p className="text-xs text-[#8996A8] line-clamp-2">{prod.shortDescription}</p>
              </div>

              {/* Pricing breakdown */}
              <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#8996A8]">
                  <span>Retail Price:</span>
                  <span className="text-white">PKR {prod.retailPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#8996A8]">
                  <span>Partner Wholesale:</span>
                  <span className="text-white font-medium">PKR {prod.partnerPrice.toLocaleString()}</span>
                </div>
                <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between font-semibold">
                  <span className="text-[#8996A8]">Gross Profit:</span>
                  <span className="text-[#22C55E]">+PKR {prod.grossMargin.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              onClick={() => setSelectedProduct(prod)}
            >
              <ShoppingCart size={15} className="mr-1.5" />
              Record Sale
            </Button>
          </div>
        ))}
      </div>

      {/* Record Sale Modal (Step 34) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111A27] border border-white/[0.12] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white">Record Sale: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-[#8996A8] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-3.5">
              <div>
                <label className="block text-[#CBD5E1] mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Asad Mehmood"
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] mb-1">Email / Phone</label>
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-[#CBD5E1] mb-1">Units (Quantity)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-between text-xs text-[#4ADE80]">
                <span>Profit Credited to Ledger:</span>
                <span className="font-semibold text-sm">PKR {(selectedProduct.grossMargin * quantity).toLocaleString()}</span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary" size="md" className="flex-1 justify-center">
                  Confirm Sale
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={() => setSelectedProduct(null)}>
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

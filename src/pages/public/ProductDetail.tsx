import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Check, ShoppingCart } from '@phosphor-icons/react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = productService.getProductBySlug(slug || '');
  const { user, isAuthenticated } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saleRecorded, setSaleRecorded] = useState(false);
  const navigate = useNavigate();

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 space-y-3 font-sans">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-xs text-[#94A3B8]">The requested product does not exist in the current catalog.</p>
        <Link to="/products">
          <Button variant="secondary" size="md" className="rounded-xl">
            Return to Products Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const handleSimulateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (!customerName) return;

    salesService.recordSale({
      userId: user.id,
      product,
      customerName,
      customerEmail,
      quantity,
    });

    setSaleRecorded(true);
  };

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto px-5 sm:px-8 font-sans">
      {/* Back button */}
      <div>
        <Link to="/products" className="inline-flex items-center space-x-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Wholesale Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="double-bezel">
            <div className="double-bezel-inner p-3 overflow-hidden">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A0F19] relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full bg-[#06090F]/90 backdrop-blur-sm text-white">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div className="p-3 rounded-2xl bg-[#0E1626] border border-white/[0.06]">
              <span className="text-[#60A5FA] font-medium block">100% Authentic</span>
              <span className="text-[10px] text-[#64748B]">Pre-Vetted Supply</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0E1626] border border-white/[0.06]">
              <span className="text-[#22C55E] font-medium block">Nationwide Delivery</span>
              <span className="text-[10px] text-[#64748B]">Logistics Ready</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0E1626] border border-white/[0.06]">
              <span className="text-white font-medium block">Rank Eligible</span>
              <span className="text-[10px] text-[#64748B]">Qualifying Unit</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Overview, Margin Calculator & Sales Simulation */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Profit Margin Matrix */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4 text-xs">
              <span className="text-[10px] font-mono text-[#60A5FA] uppercase tracking-wider block">
                Product Economics Matrix
              </span>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#0A0F19] border border-white/[0.04]">
                  <span className="text-[10px] text-[#64748B] block">Retail Price</span>
                  <span className="text-base font-bold text-white font-mono">PKR {product.retailPrice.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0F19] border border-white/[0.04]">
                  <span className="text-[10px] text-[#64748B] block">Wholesale Cost</span>
                  <span className="text-base font-bold text-[#60A5FA] font-mono">PKR {product.partnerPrice.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0F19] border border-white/[0.04]">
                  <span className="text-[10px] text-[#64748B] block">Gross Margin</span>
                  <span className="text-base font-bold text-[#22C55E] font-mono">+PKR {product.grossMargin.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Sales Recording for Logged-In Partner */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-7 space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-white">
                {isAuthenticated ? 'Record a Customer Sale' : 'Partner Portal Wholesale Access'}
              </h3>

              {isAuthenticated ? (
                saleRecorded ? (
                  <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-center space-y-2">
                    <Check size={24} className="text-[#22C55E] mx-auto" />
                    <p className="text-xs font-semibold text-white">Sale Successfully Credited</p>
                    <p className="text-xs text-[#94A3B8]">
                      +PKR {(product.grossMargin * quantity).toLocaleString()} has been logged to your profit ledger.
                    </p>
                    <div className="flex items-center justify-center space-x-2 pt-1">
                      <Link to="/dashboard/sales">
                        <Button variant="primary" size="sm" className="rounded-xl">
                          View Sales Ledger
                        </Button>
                      </Link>
                      <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => setSaleRecorded(false)}>
                        Record Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSimulateSale} className="space-y-3.5">
                    <div>
                      <label className="block text-[#94A3B8] mb-1 font-medium">Customer Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Asad Malik"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#94A3B8] mb-1 font-medium">Customer Contact</label>
                        <input
                          type="text"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="customer@email.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#94A3B8] mb-1 font-medium">Units</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-between text-[#4ADE80]">
                      <span>Calculated Gross Margin:</span>
                      <span className="font-semibold font-mono">PKR {(product.grossMargin * quantity).toLocaleString()}</span>
                    </div>

                    <Button type="submit" variant="primary" size="md" className="w-full justify-center rounded-xl font-medium">
                      Confirm & Record Customer Order
                    </Button>
                  </form>
                )
              ) : (
                <div className="space-y-3 text-xs text-[#94A3B8]">
                  <p>
                    To purchase at partner wholesale pricing (PKR {product.partnerPrice.toLocaleString()}) and earn direct gross margins, please sign in or register as a partner.
                  </p>
                  <div className="flex items-center space-x-2.5 pt-1">
                    <Link to="/signup">
                      <Button variant="primary" size="sm" className="rounded-xl">
                        Join as Partner
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="secondary" size="sm" className="rounded-xl">
                        Partner Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

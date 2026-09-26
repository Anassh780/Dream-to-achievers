import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { useToast } from '@/context/ToastContext';
import {
  ArrowLeft,
  Check,
  Package,
  ShieldCheck,
  Truck,
  TrendUp,
  ArrowRight,
  Calculator,
} from '@phosphor-icons/react';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [syncKey, setSyncKey] = useState(0);

  React.useEffect(() => {
    const handleSync = () => setSyncKey((prev) => prev + 1);
    window.addEventListener('dta_products_update', handleSync);
    window.addEventListener('dta_storage_change', handleSync);
    return () => {
      window.removeEventListener('dta_products_update', handleSync);
      window.removeEventListener('dta_storage_change', handleSync);
    };
  }, []);

  const product = useMemo(() => productService.getProductBySlug(slug || ''), [slug, syncKey]);
  const { user, isAuthenticated } = useAuth();
  const { success: toastSuccess } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [saleRecorded, setSaleRecorded] = useState(false);
  const navigate = useNavigate();

  const allProducts = useMemo(() => productService.getAllProducts(), [syncKey]);
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 3);
  }, [product, allProducts, syncKey]);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 space-y-3 font-sans bg-[var(--bg)] text-[var(--ink)]">
        <h2 className="font-serif text-2xl font-medium text-[var(--ink)]">Product Not Found</h2>
        <p className="text-xs text-[var(--ink-soft)]">The requested product does not exist in the current catalog.</p>
        <Link to="/products">
          <Button variant="outline" size="md" className="text-xs">
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

    toastSuccess(`Order recorded! +PKR ${(product.grossMargin * quantity).toLocaleString()} gross profit added to ledger.`);
    setSaleRecorded(true);
  };

  const productSchema = useMemo(() => {
    if (!product) return undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.imageUrl,
      description: product.description,
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: 'Dream to Achievers',
      },
      offers: {
        '@type': 'Offer',
        url: `https://dream-to-achievers.vercel.app/products/${product.slug}`,
        priceCurrency: 'PKR',
        price: product.retailPrice,
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Dream to Achievers',
        },
      },
    };
  }, [product]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title={`${product.name} | Wholesale Price & Margin | Dream to Achievers`}
        description={`${product.shortDescription} Wholesale rate: PKR ${product.partnerPrice.toLocaleString()}, Retail: PKR ${product.retailPrice.toLocaleString()}, Unit Margin: +PKR ${product.grossMargin.toLocaleString()}. Nationwide COD dispatch.`}
        canonicalPath={`/products/${product.slug}`}
        ogType="product"
        ogImage={product.imageUrl}
        ogImageAlt={`${product.name} — Verified Wholesale Inventory`}
        structuredData={productSchema}
      />
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-8 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link
            to="/products"
            className="inline-flex items-center space-x-1.5 text-xs text-[#9EABA2] hover:text-[#D9C08A] transition-colors font-mono"
          >
            <ArrowLeft size={14} />
            <span>Back to Wholesale Catalog</span>
          </Link>
        </div>

        {/* 1. Main PDP Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Product Gallery & Supply Proof */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 overflow-hidden p-3 shadow-xl hover:border-[#D9C08A]/30 transition-all">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#070B09] relative group">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 text-[10.5px] font-mono font-medium px-3 py-1 rounded bg-[#070B09]/80 backdrop-blur-md text-[#D9C08A] border border-[#D9C08A]/30 shadow-sm">
                  {product.category}
                </span>
                {product.isFeatured && (
                  <span className="absolute top-3 right-3 text-[10.5px] font-mono font-bold px-2.5 py-1 rounded bg-[#D9C08A] text-[#070B09] shadow-sm">
                    FEATURED SKU
                  </span>
                )}
              </div>
            </div>

            {/* Distribution Verification Strip */}
            <div className="p-4 rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 grid grid-cols-3 gap-3 text-center text-xs shadow-md">
              <div>
                <span className="text-[10px] text-[#9EABA2] font-mono block">SKU Identity</span>
                <span className="font-mono font-semibold text-[#F4F7F5] text-xs">{product.sku}</span>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[10px] text-[#9EABA2] font-mono block">Availability</span>
                <span className="font-semibold text-[#34D399] text-xs flex items-center justify-center gap-1">
                  <Check size={12} weight="bold" /> In Stock
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#9EABA2] font-mono block">Fulfillment</span>
                <span className="font-semibold text-[#D9C08A] text-xs flex items-center justify-center gap-1">
                  <Truck size={12} /> Nationwide COD
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Transparent Unit Economics & Direct Order Simulation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
                <ShieldCheck size={13} weight="bold" />
                <span>Verified Direct Distribution</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#F4F7F5] tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Transparent Unit Economics Box (Section 11 Requirement) */}
            <div className="p-6 rounded-3xl bg-[#0D1512]/85 backdrop-blur-xl border border-[#D9C08A]/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-serif font-medium text-[#F4F7F5]">
                  Unit Economics Breakdown
                </span>
                <span className="text-[10px] font-mono text-[#34D399] bg-[#34D399]/10 px-2.5 py-0.5 rounded border border-[#34D399]/25 font-semibold">
                  Verified Trade Rates
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/8">
                  <span className="text-[10px] text-[#9EABA2] block font-mono truncate">Retail Price</span>
                  <span className="font-mono font-medium text-[#C4D0C8] text-xs sm:text-base block truncate mt-0.5">
                    PKR {product.retailPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/8">
                  <span className="text-[10px] text-[#9EABA2] block font-mono truncate">Wholesale Cost</span>
                  <span className="font-mono font-medium text-[#34D399] text-xs sm:text-base block truncate mt-0.5">
                    PKR {product.partnerPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B09]/90 border border-[#34D399]/25">
                  <span className="text-[10px] text-[#9EABA2] block font-mono truncate">Partner Margin</span>
                  <span className="font-mono font-bold text-[#34D399] text-xs sm:text-base block truncate mt-0.5">
                    +PKR {product.grossMargin.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#9EABA2] font-sans leading-relaxed">
                You purchase this SKU at the wholesale rate of <strong className="text-[#34D399] font-mono">PKR {product.partnerPrice.toLocaleString()}</strong> and sell at retail for <strong className="text-[#F4F7F5] font-mono">PKR {product.retailPrice.toLocaleString()}</strong>, capturing the direct gross margin upon delivered order.
              </p>
            </div>

            {/* Direct Order / Sale Simulation Form */}
            <div className="p-6 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-xs font-serif font-medium text-[#F4F7F5]">
                <Calculator size={15} className="text-[#D9C08A]" />
                <span>Simulate Client Order &amp; Margin Ledger</span>
              </div>

              {saleRecorded ? (
                <div className="p-5 rounded-2xl bg-[#070B09]/90 border border-[#34D399]/30 text-xs space-y-2.5">
                  <div className="flex items-center space-x-2 font-semibold text-[#34D399]">
                    <Check size={16} weight="bold" />
                    <span>Order Recorded Successfully!</span>
                  </div>
                  <p className="text-[#9EABA2]">
                    Credited <strong className="text-[#34D399] font-mono">+PKR {(product.grossMargin * quantity).toLocaleString()}</strong> gross profit margin to your partner sales ledger.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaleRecorded(false)}
                    className="text-xs mt-2 border-[#D9C08A]/40 text-[#D9C08A] hover:bg-[#D9C08A]/10"
                  >
                    Record Another Order
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSimulateSale} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[#9EABA2] mb-1 font-medium">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 focus:outline-none focus:border-[#D9C08A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#9EABA2] mb-1 font-medium">Client Contact</label>
                      <input
                        type="text"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@email.com"
                        className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 focus:outline-none focus:border-[#D9C08A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9EABA2] mb-1 font-medium">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] font-mono focus:outline-none focus:border-[#D9C08A]"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#070B09]/90 border border-[#34D399]/25 flex justify-between font-mono text-xs items-center">
                    <span className="text-[#9EABA2]">Total Calculated Margin:</span>
                    <span className="font-bold text-[#34D399] text-sm sm:text-base">
                      +PKR {(product.grossMargin * quantity).toLocaleString()}
                    </span>
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full justify-center text-xs font-medium min-h-[44px] shadow-lg">
                    {isAuthenticated ? 'Record & Credit Order to Ledger' : 'Sign In to Record Partner Sale'}
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* 2. Detailed Specifications Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
          <h3 className="font-serif text-xl font-normal text-[#F4F7F5]">
            Product Information &amp; Distribution Details
          </h3>
          <div className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed space-y-3">
            <p>{product.description}</p>
            <p>
              All wholesale lots are inspected for batch freshness and packaged securely for nationwide courier cash on delivery dispatch. Return and exchange protection is supported for verified customer delivery disputes.
            </p>
          </div>
        </div>

        {/* 3. Related Inventory Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-xl font-normal text-[#F4F7F5]">
              Similar High-Margin Wholesale Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col justify-between space-y-3 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#D9C08A]/40 active:scale-[0.99] h-full"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#070B09] border border-white/10 shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="font-serif font-medium text-sm text-[#F4F7F5] truncate">{rel.name}</h4>
                      <span className="text-[10.5px] font-mono text-[#34D399] font-semibold block">
                        +PKR {rel.grossMargin.toLocaleString()} Margin
                      </span>
                    </div>
                  </div>

                  <Link to={`/products/${rel.slug}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-between min-h-[40px] sm:min-h-[36px] border-white/15 hover:border-[#D9C08A]/50 hover:bg-[#D9C08A]/10 text-[#F4F7F5]">
                      <span>View SKU</span>
                      <ArrowRight size={12} className="text-[#D9C08A]" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

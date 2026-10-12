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
  Images,
  CaretLeft,
  CaretRight,
  Sparkle,
  SealCheck,
  Clock,
  ArrowsClockwise,
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

        {/* 1. Main PDP Two-Column Layout (Daraz & Alibaba Official Storefront Pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Product Gallery & Daraz/Alibaba Multi-Image Switcher */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image Card */}
            <div className="rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 overflow-hidden p-3 shadow-xl hover:border-[#D9C08A]/30 transition-all">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#070B09] relative group">
                {(() => {
                  const imagesList = Array.isArray(product.images) && product.images.length > 0
                    ? product.images
                    : [product.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'];
                  const activeImg = imagesList[activeImageIndex] || imagesList[0];

                  return (
                    <>
                      <img
                        key={activeImg}
                        src={activeImg}
                        alt={`${product.name} - Angle ${activeImageIndex + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 animate-in fade-in-50"
                      />
                      <span className="absolute top-3 left-3 text-[10.5px] font-mono font-medium px-3 py-1 rounded bg-[#070B09]/80 backdrop-blur-md text-[#D9C08A] border border-[#D9C08A]/30 shadow-sm">
                        {product.category}
                      </span>
                      {product.isFeatured && (
                        <span className="absolute top-3 right-3 text-[10.5px] font-mono font-bold px-2.5 py-1 rounded bg-[#D9C08A] text-[#070B09] shadow-sm">
                          FEATURED SKU
                        </span>
                      )}

                      {/* Photo Navigation Overlay Arrows if > 1 photo */}
                      {imagesList.length > 1 && (
                        <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1));
                            }}
                            className="size-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center pointer-events-auto border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-110"
                            aria-label="Previous photo"
                          >
                            <CaretLeft size={16} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveImageIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0));
                            }}
                            className="size-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center pointer-events-auto border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-110"
                            aria-label="Next photo"
                          >
                            <CaretRight size={16} weight="bold" />
                          </button>
                        </div>
                      )}

                      {/* Photo Count Pill */}
                      {imagesList.length > 1 && (
                        <span className="absolute bottom-3 right-3 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/20 shadow-sm flex items-center gap-1">
                          <Images size={12} />
                          {activeImageIndex + 1} / {imagesList.length} Photos
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Interactive Thumbnail Strip (Alibaba/Daraz Style) */}
            {(() => {
              const imagesList = Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'];
              
              if (imagesList.length <= 1) return null;

              return (
                <div className="p-2.5 rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between px-1 text-[10.5px] font-mono text-[#9EABA2]">
                    <span>Product Angles &amp; Packaging ({imagesList.length})</span>
                    <span className="text-[#D9C08A]">Click to switch view</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                    {imagesList.map((thumbUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        onMouseEnter={() => setActiveImageIndex(idx)}
                        className={`relative size-14 sm:size-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#D9C08A] shadow-[0_0_12px_rgba(217,192,138,0.35)] scale-105'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`${product.name} thumb ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                        {activeImageIndex === idx && (
                          <span className="absolute inset-0 bg-[#D9C08A]/10 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Official Cash on Delivery Guarantee Banner (Prominent Daraz / Alibaba Badge) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0D1512] to-emerald-950/30 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Truck size={22} weight="bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#F4F7F5] tracking-wide">
                      Cash on Delivery (COD) Available
                    </span>
                    <span className="bg-emerald-500 text-[#070B09] text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded uppercase">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9EABA2] mt-0.5">
                    Pay securely in cash at your doorstep upon receiving the parcel across Pakistan.
                  </p>
                </div>
              </div>
            </div>

            {/* Distribution Verification & Trust Badges Strip */}
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
                <span className="text-[10px] text-[#9EABA2] font-mono block">Fulfillment Lead</span>
                <span className="font-semibold text-[#D9C08A] text-xs flex items-center justify-center gap-1">
                  <Clock size={12} /> {product.dispatchTime || '24-48h COD'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Transparent Unit Economics & Direct Order Simulation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
                  <ShieldCheck size={13} weight="bold" />
                  <span>Verified Direct Wholesale SKU</span>
                </div>
                {product.cashOnDelivery !== false && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
                    <Truck size={13} weight="bold" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#F4F7F5] tracking-tight">
                {product.name}
              </h1>

              {product.brand && (
                <div className="text-xs font-mono text-[#D9C08A] flex items-center gap-1">
                  <span>Brand:</span>
                  <strong className="text-[#F4F7F5]">{product.brand}</strong>
                </div>
              )}

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
                <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/[0.08]">
                  <span className="text-[10px] text-[#9EABA2] block font-mono truncate">Retail Price</span>
                  <span className="font-mono font-medium text-[#C4D0C8] text-xs sm:text-base block truncate mt-0.5">
                    PKR {product.retailPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/[0.08]">
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

        {/* 2. Daraz & Alibaba Commercial Specifications & Features Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#F4F7F5]">
                Product Specifications &amp; Official Commercial Standards
              </h3>
              <p className="text-xs text-[#9EABA2] mt-0.5 font-mono">
                Verified trade attributes, warranty compliance &amp; distribution guidelines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                <Truck size={13} weight="bold" />
                Cash on Delivery (COD) Verified
              </span>
            </div>
          </div>

          {/* Key Attributes Grid (Alibaba / Daraz Spec Table) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/10">
              <span className="text-[10px] text-[#9EABA2] block">Brand Name</span>
              <span className="font-semibold text-[#F4F7F5] truncate block mt-0.5">
                {product.brand || 'Dream to Achievers Official'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/10">
              <span className="text-[10px] text-[#9EABA2] block">SKU Code</span>
              <span className="font-semibold text-[#F4F7F5] truncate block mt-0.5">
                {product.sku}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/10">
              <span className="text-[10px] text-[#9EABA2] block">Payment Terms</span>
              <span className="font-semibold text-emerald-400 truncate block mt-0.5">
                Cash on Delivery (COD)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/10">
              <span className="text-[10px] text-[#9EABA2] block">Warranty Protection</span>
              <span className="font-semibold text-[#D9C08A] truncate block mt-0.5">
                {product.warranty || '7-Day Replacement Guarantee'}
              </span>
            </div>
          </div>

          {/* Bullet Key Highlights */}
          {Array.isArray(product.features) && product.features.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-mono font-semibold text-[#D9C08A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkle size={13} weight="fill" />
                Key Product Highlights:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#C4D0C8]">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#070B09]/60 border border-white/5">
                    <Check size={14} weight="bold" className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Description */}
          <div className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed space-y-3 pt-2">
            <h4 className="text-xs font-mono font-semibold text-[#F4F7F5] uppercase tracking-wider">
              Detailed Description:
            </h4>
            <p className="whitespace-pre-line">{product.description}</p>
            <div className="p-4 rounded-xl bg-[#070B09]/70 border border-white/10 text-xs text-[#9EABA2] space-y-1 font-sans">
              <strong className="text-[#F4F7F5] block font-mono">Wholesale Quality &amp; COD Safety Guarantee:</strong>
              <p>
                All wholesale inventory is inspected for batch quality before sealed packaging. Orders are fulfilled nationwide via express courier with real-time tracking and Cash on Delivery payment collection at recipient doorstep.
              </p>
            </div>
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

import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 space-y-3 font-sans bg-[#FAF7EF] text-[#1E241F]">
        <h2 className="font-serif text-2xl font-medium text-[#1E241F]">Product Not Found</h2>
        <p className="text-xs text-[#5B5C50]">The requested product does not exist in the current catalog.</p>
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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
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
            className="inline-flex items-center space-x-1.5 text-xs text-[#5B5C50] hover:text-[#1E241F] transition-colors font-mono"
          >
            <ArrowLeft size={14} />
            <span>Back to Wholesale Catalog</span>
          </Link>
        </div>

        {/* 1. Main PDP Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Product Gallery & Supply Proof */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-white border border-[#E3DCC8] overflow-hidden p-3 shadow-xs">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF7EF] relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-[10.5px] font-mono font-semibold px-3 py-1 rounded bg-white/90 text-[#1E241F] border border-[#E3DCC8] shadow-2xs">
                  {product.category}
                </span>
                {product.isFeatured && (
                  <span className="absolute top-3 right-3 text-[10.5px] font-mono font-bold px-2.5 py-1 rounded bg-[#EFE2C4] text-[#B8862E] border border-[#B8862E]/30 shadow-2xs">
                    FEATURED SKU
                  </span>
                )}
              </div>
            </div>

            {/* Distribution Verification Strip */}
            <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] grid grid-cols-3 gap-3 text-center text-xs shadow-2xs">
              <div>
                <span className="text-[10px] text-[#5B5C50] font-mono block">SKU Identity</span>
                <span className="font-mono font-semibold text-[#1E241F] text-xs">{product.sku}</span>
              </div>
              <div className="border-x border-[#E3DCC8]">
                <span className="text-[10px] text-[#5B5C50] font-mono block">Availability</span>
                <span className="font-semibold text-[#1F4D3E] text-xs flex items-center justify-center gap-1">
                  <Check size={12} weight="bold" /> In Stock
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#5B5C50] font-mono block">Fulfillment</span>
                <span className="font-semibold text-[#1E241F] text-xs flex items-center justify-center gap-1">
                  <Truck size={12} /> Nationwide COD
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Transparent Unit Economics & Direct Order Simulation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="eyebrow">
                <ShieldCheck size={13} weight="bold" />
                <span>Verified Manufacturer Supply</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-medium text-[#1E241F] tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                {product.shortDescription}
              </p>
            </div>

            {/* Transparent Unit Economics Box (Section 11 Requirement) */}
            <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
                <span className="text-xs font-serif font-semibold text-[#1E241F]">
                  Unit Economics Breakdown
                </span>
                <span className="text-[10px] font-mono text-[#1F4D3E] bg-[#F1ECDD] px-2 py-0.5 rounded border border-[#E3DCC8]">
                  Verified Rates
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                  <span className="text-[10px] text-[#5B5C50] block font-mono">Retail Price</span>
                  <span className="font-mono font-medium text-[#1E241F] text-sm sm:text-base">
                    PKR {product.retailPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                  <span className="text-[10px] text-[#5B5C50] block font-mono">Wholesale Cost</span>
                  <span className="font-mono font-medium text-[#1F4D3E] text-sm sm:text-base">
                    PKR {product.partnerPrice.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                  <span className="text-[10px] text-[#5B5C50] block font-mono">Partner Margin</span>
                  <span className="font-mono font-bold text-[#B8862E] text-sm sm:text-base">
                    +PKR {product.grossMargin.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#5B5C50] font-sans leading-relaxed">
                You purchase this SKU at the wholesale rate of <strong>PKR {product.partnerPrice.toLocaleString()}</strong> and sell at retail for <strong>PKR {product.retailPrice.toLocaleString()}</strong>, capturing the direct gross margin upon delivered order.
              </p>
            </div>

            {/* Direct Order / Sale Simulation Form */}
            <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
              <div className="flex items-center space-x-2 text-xs font-serif font-semibold text-[#1E241F]">
                <Calculator size={15} className="text-[#1F4D3E]" />
                <span>Simulate Client Order &amp; Margin Ledger</span>
              </div>

              {saleRecorded ? (
                <div className="p-4 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs space-y-2">
                  <div className="flex items-center space-x-2 font-semibold text-[#1F4D3E]">
                    <Check size={16} weight="bold" />
                    <span>Order Recorded Successfully!</span>
                  </div>
                  <p className="text-[#5B5C50]">
                    Credited <strong>+PKR {(product.grossMargin * quantity).toLocaleString()}</strong> gross profit margin to your partner sales ledger.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaleRecorded(false)}
                    className="text-xs mt-2"
                  >
                    Record Another Order
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSimulateSale} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#5B5C50] mb-1 font-medium">Customer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#5B5C50] mb-1 font-medium">Client Contact</label>
                      <input
                        type="text"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@email.com"
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5B5C50] mb-1 font-medium">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex justify-between font-mono text-xs">
                    <span className="text-[#5B5C50]">Total Calculated Margin:</span>
                    <span className="font-bold text-[#B8862E]">
                      +PKR {(product.grossMargin * quantity).toLocaleString()}
                    </span>
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full justify-center text-xs font-medium">
                    {isAuthenticated ? 'Record & Credit Order to Ledger' : 'Sign In to Record Partner Sale'}
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* 2. Detailed Specifications Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <h3 className="font-serif text-xl font-medium text-[#1E241F]">
            Product Information &amp; Distribution Details
          </h3>
          <div className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed space-y-3">
            <p>{product.description}</p>
            <p>
              All wholesale lots are inspected for batch freshness and packaged securely for nationwide courier cash on delivery dispatch. Return and exchange protection is supported for verified customer delivery disputes.
            </p>
          </div>
        </div>

        {/* 3. Related Inventory Carousel */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-serif text-xl font-medium text-[#1E241F]">
              Similar High-Margin Wholesale Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-xl bg-white border border-[#E3DCC8] p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#D2C8AF] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-12 h-12 rounded-lg object-cover bg-[#FAF7EF] border border-[#E3DCC8] shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="font-serif font-medium text-sm text-[#1E241F] truncate">{rel.name}</h4>
                      <span className="text-[10.5px] font-mono text-[#B8862E] font-semibold block">
                        +PKR {rel.grossMargin.toLocaleString()} Margin
                      </span>
                    </div>
                  </div>

                  <Link to={`/products/${rel.slug}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs justify-between">
                      <span>View SKU</span>
                      <ArrowRight size={12} />
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

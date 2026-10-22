import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import {
  extractProductImages,
  getRenderableImageUrl,
  getProductEconomics,
  DEFAULT_PRODUCT_FALLBACK_IMAGE,
} from '@/services/imageService';
import {
  X,
  ShoppingCart,
  WhatsappLogo,
  Copy,
  Check,
  Truck,
  ShieldCheck,
  Images,
  Sparkle,
  ArrowRight,
  CaretLeft,
  CaretRight,
  Calculator,
  Tag,
  TrendUp,
  Package,
} from '@phosphor-icons/react';

interface ProductInspectionModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordSale: (product: Product) => void;
}

export const ProductInspectionModal: React.FC<ProductInspectionModalProps> = ({
  product,
  isOpen,
  onClose,
  onRecordSale,
}) => {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [calcQty, setCalcQty] = useState(1);

  React.useEffect(() => {
    setActiveImgIdx(0);
    setCalcQty(1);
    setCopiedPitch(false);
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  const images = extractProductImages(product);
  const imageList = images.length > 0 ? images : [product.imageUrl || DEFAULT_PRODUCT_FALLBACK_IMAGE];
  const safeIdx = Math.min(activeImgIdx, Math.max(0, imageList.length - 1));
  const activeRawImg = imageList[safeIdx] || DEFAULT_PRODUCT_FALLBACK_IMAGE;
  const activeImgSrc = getRenderableImageUrl(activeRawImg);
  const econ = getProductEconomics(product);

  const totalCalculatedMargin = econ.grossMargin * calcQty;
  const totalCalculatedRetail = econ.retailPrice * calcQty;

  const handleCopyWhatsAppPitch = () => {
    const pitchText = `🌟 *EXCLUSIVE WHOLESALE OFFER: ${product.name}*\n\n` +
      `📦 *SKU:* ${product.sku}\n` +
      `💰 *Retail Price:* PKR ${econ.retailPrice.toLocaleString()}\n` +
      `🚚 *Delivery:* Cash on Delivery (COD) Nationwide across Pakistan\n` +
      `⚡ *Condition:* 100% Brand New · Authentic Verified Quality\n\n` +
      `📝 *Overview:* ${product.shortDescription || product.description || 'Premium wholesale grade product available for immediate order.'}\n\n` +
      `👉 *To Order:* Reply with your Name, City, Phone Number & Delivery Address!`;

    navigator.clipboard.writeText(pitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleShareToWhatsApp = () => {
    const pitchText = `🌟 *EXCLUSIVE WHOLESALE OFFER: ${product.name}*\n\n` +
      `📦 *SKU:* ${product.sku}\n` +
      `💰 *Price:* PKR ${econ.retailPrice.toLocaleString()}\n` +
      `🚚 *Cash on Delivery (COD) Available!*\n\n` +
      `Reply to place your order now!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(pitchText)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain touch-pan-y"
      role="dialog"
      aria-modal="true"
      aria-label="Product Inspection Studio"
    >
      <div className="rounded-t-3xl sm:rounded-3xl bg-[#090F0C] border border-white/10 p-4 sm:p-6 max-w-4xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col justify-between space-y-4 shadow-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 text-xs text-[#F4F7F5] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-[#34D399] border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
              {product.category || 'Wholesale SKU'}
            </span>
            <span className="text-[11px] font-mono text-[#9EABA2] truncate">
              SKU: <strong className="text-[#F4F7F5]">{product.sku}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Center Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1 space-y-5 no-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Left 6 Cols: Photo Gallery Studio */}
            <div className="md:col-span-6 space-y-3">
              <div className="aspect-[4/3] bg-[#050806] rounded-2xl relative overflow-hidden border border-white/[0.08] group">
                <img
                  src={activeImgSrc}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PRODUCT_FALLBACK_IMAGE;
                  }}
                />

                {imageList.length > 1 && (
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setActiveImgIdx((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-all active:scale-90"
                      aria-label="Previous photo"
                    >
                      <CaretLeft size={16} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImgIdx((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-all active:scale-90"
                      aria-label="Next photo"
                    >
                      <CaretRight size={16} weight="bold" />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-white border border-white/20 flex items-center gap-1">
                  <Images size={11} className="text-[#D9C08A]" />
                  <span>{safeIdx + 1} / {imageList.length}</span>
                </div>
              </div>

              {/* Thumbnails row */}
              {imageList.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-pan-x">
                  {imageList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImgIdx(idx)}
                      className={`w-14 h-14 rounded-xl border overflow-hidden p-1 bg-[#050806] shrink-0 transition-all cursor-pointer ${
                        safeIdx === idx
                          ? 'border-[#34D399] ring-2 ring-[#34D399]/30 scale-105'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getRenderableImageUrl(img)}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Verified Trust Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                  <Truck size={16} weight="bold" className="text-[#34D399] shrink-0" />
                  <div>
                    <p className="font-bold text-[#F4F7F5]">COD Nationwide</p>
                    <p className="text-[9.5px] text-[#9EABA2]">2-4 Day Delivery</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2">
                  <ShieldCheck size={16} weight="fill" className="text-[#D9C08A] shrink-0" />
                  <div>
                    <p className="font-bold text-[#F4F7F5]">Wholesale Stock</p>
                    <p className="text-[9.5px] text-[#9EABA2]">Inspected &amp; Sealed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Economics & Wholesale Pitch */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#F4F7F5] leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs text-[#9EABA2] mt-1.5 leading-relaxed">
                  {product.description || product.shortDescription || 'Verified wholesale catalog product for partner distribution across Pakistan.'}
                </p>
              </div>

              {/* Wholesale Margin Ledger Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#34D399]/10 via-white/[0.02] to-transparent border border-[#34D399]/30 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9EABA2]">Reseller Margin Ledger</span>
                  <span className="text-xs font-mono font-bold text-[#34D399] bg-[#34D399]/15 px-2 py-0.5 rounded-md border border-[#34D399]/30">
                    +{Math.round((econ.grossMargin / econ.partnerPrice) * 100)}% ROI Margin
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-[#9EABA2] block">Client Retail</span>
                    <span className="text-sm font-bold text-[#F4F7F5] block mt-0.5">PKR {econ.retailPrice.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] text-[#9EABA2] block">Wholesale Cost</span>
                    <span className="text-sm font-bold text-[#9EABA2] block mt-0.5">PKR {econ.partnerPrice.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 block font-bold">Your Profit</span>
                    <span className="text-sm font-bold text-[#34D399] block mt-0.5">+PKR {econ.grossMargin.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Profit Multiplier Calculator */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-semibold text-[#F4F7F5] flex items-center gap-1.5">
                    <Calculator size={14} className="text-[#D9C08A]" />
                    <span>Projected Volume Profit:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5, 10].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setCalcQty(qty)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          calcQty === qty
                            ? 'bg-[#34D399] text-[#070B09]'
                            : 'bg-white/[0.04] text-[#9EABA2] hover:text-[#F4F7F5]'
                        }`}
                      >
                        {qty}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-mono">
                  <span className="text-[#9EABA2]">Sell {calcQty} unit(s) at retail (PKR {totalCalculatedRetail.toLocaleString()}):</span>
                  <span className="text-sm font-bold text-[#34D399]">+PKR {totalCalculatedMargin.toLocaleString()} Profit</span>
                </div>
              </div>

              {/* 1-Tap Copy WhatsApp Pitch Box */}
              <div className="p-3.5 rounded-2xl bg-[#0D1512] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#34D399] flex items-center gap-1.5">
                    <WhatsappLogo size={14} weight="fill" />
                    <span>Instant Reseller Pitch for Socials</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppPitch}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[10px] font-mono font-bold text-[#D9C08A] border border-white/10 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPitch ? <Check size={11} className="text-[#34D399]" /> : <Copy size={11} />}
                    <span>{copiedPitch ? 'Copied Pitch!' : 'Copy Pitch'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#9EABA2] leading-relaxed line-clamp-2">
                  &ldquo;🌟 Exclusive Wholesale Offer: {product.name} · PKR {econ.retailPrice.toLocaleString()} · COD Available Nationwide...&rdquo;
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Action Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#25D366] hover:border-[#25D366]/40 inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] flex-1 sm:flex-initial"
              title="Share deal on WhatsApp"
            >
              <WhatsappLogo size={17} weight="fill" />
              <span>Share on WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyWhatsAppPitch}
              className="funding-ghost-pill px-3.5 py-2.5 text-xs font-medium text-[#F4F7F5] inline-flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              title="Copy pitch text"
            >
              {copiedPitch ? <Check size={15} className="text-[#34D399]" /> : <Copy size={15} />}
              <span className="hidden sm:inline">{copiedPitch ? 'Copied' : 'Copy Pitch'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRecordSale({
                ...product,
                retailPrice: econ.retailPrice,
                partnerPrice: econ.partnerPrice,
                grossMargin: econ.grossMargin,
              });
            }}
            className="funding-sheen-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer min-h-[44px] active:scale-[0.98]"
          >
            <ShoppingCart size={16} weight="bold" />
            <span>Record Client Sale (+PKR {econ.grossMargin.toLocaleString()} Profit)</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
};

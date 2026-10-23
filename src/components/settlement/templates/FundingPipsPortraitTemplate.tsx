import React from 'react';
import { SettlementRecord, formatSettlementAmount } from '@/types/settlement';
import { Package, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RealQrCode } from '@/components/common/RealQrCode';
import { resolveSettlementBackground } from '@/utils/settlementThemeHelper';

interface TemplateProps {
  record: SettlementRecord;
  variant?: 'blue' | 'emerald';
}

export const FundingPipsPortraitTemplate: React.FC<TemplateProps> = ({ record, variant }) => {
  const isEmerald = variant === 'emerald' || record.template === 'emerald_website_ui';
  const honoreeName =
    record.recipientName || record.signatoryName || record.businessName || 'Distinguished Partner';
  const totalProducts = record.totalProductsSold || 1;
  const amountStr = formatSettlementAmount(record.amount, record.currency);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dream-to-achievers.vercel.app';
  const verifyUrl = `${origin}/dashboard/sales?certificate=${encodeURIComponent(record.id)}&partner=${encodeURIComponent(record.partnerId || '')}`;

  // Default gradient
  const defaultBg = isEmerald
    ? `radial-gradient(circle at 100% 75%, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.92) 35%, rgba(5, 150, 105, 0.85) 65%, transparent 85%),
       radial-gradient(circle at 20% 90%, rgba(110, 231, 183, 0.7) 0%, transparent 50%),
       linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 40%, #DCFCE7 100%)`
    : `radial-gradient(circle at 100% 70%, rgba(56, 189, 248, 0.95) 0%, rgba(37, 99, 235, 0.92) 40%, rgba(29, 78, 216, 0.85) 75%, transparent 90%),
       radial-gradient(circle at 15% 90%, rgba(147, 197, 253, 0.6) 0%, transparent 50%),
       linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 38%, #DBEAFE 100%)`;

  const bgStyles = resolveSettlementBackground(record, defaultBg);

  // Format date like "OCT 19, 2026"
  const formattedDate = (() => {
    try {
      const d = new Date(record.settlementDate);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    } catch {
      return record.settlementDate || 'OCT 22, 2026';
    }
  })();

  const primaryColor = record.primaryTextColor || '#0B1536';
  const honoreeColor = record.honoreeTextColor || primaryColor;
  const amountColor = record.amountTextColor || primaryColor;
  const secondaryColor = record.secondaryTextColor || 'rgba(11, 21, 54, 0.7)';

  return (
    <div
      id="settlement-certificate-canvas"
      className="relative w-[600px] h-[840px] font-sans p-10 flex flex-col justify-between overflow-hidden select-none bg-white rounded-3xl shadow-2xl border border-slate-200/80"
      style={{
        ...bgStyles,
        fontFamily: record.customFontFamily || undefined,
        color: primaryColor,
      }}
    >
      {/* 3D Perspective Cyber Grid Overlay across lower gradient field */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.35) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'linear-gradient(180deg, transparent 28%, rgba(0,0,0,0.8) 55%, black 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 28%, rgba(0,0,0,0.8) 55%, black 100%)',
        }}
      />

      {/* Draft Mode Watermark if applicable */}
      {record.mode !== 'verified' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 opacity-8 rotate-[-28deg]">
          <div className="text-center font-mono font-black text-5xl tracking-widest text-slate-800 border-6 border-dashed border-slate-800 px-12 py-6 rounded-3xl uppercase">
            SAMPLE · DEMO
          </div>
        </div>
      )}

      {/* 1. TOP HEADER: Brand Logo + Certification Title */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Left: Brand Identity with official registered mark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-sm">
            <img
              src={record.partnerLogoUrl || record.platformLogoUrl || "/brand-logo.png"}
              alt="Brand Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center">
            <span className="font-sans font-black text-xl tracking-tight" style={{ color: primaryColor }}>
              {record.platformName || 'Dream to Achievers'}
            </span>
            <span className="text-[10px] font-black align-super ml-0.5" style={{ color: primaryColor }}>®</span>
          </div>
        </div>

        {/* Right: Subtitle */}
        <div className="text-xs font-sans font-semibold tracking-wide" style={{ color: secondaryColor }}>
          {record.certificateTitle || 'Certification of achievement'}
        </div>
      </div>

      {/* 2. HERO SECTION: Congratulations & Giant Phase/Payout Header */}
      <div className="relative z-10 mt-6 space-y-1">
        <div className="font-sans font-extrabold text-sm uppercase tracking-[0.22em]" style={{ color: record.accentColor || primaryColor }}>
          {record.congratsHeading || 'CONGRATULATIONS'}
        </div>

        <div className="flex items-end justify-between gap-3 pt-1">
          {/* Giant Impact Words - dynamic color & zero clipping */}
          <div className="font-sans font-black text-[50px] leading-[0.92] tracking-tight max-w-[360px]" style={{ color: primaryColor }}>
            {record.headline ? (
              <div className="break-words">{record.headline}</div>
            ) : (
              <>
                <div>WITHDRAWAL</div>
                <div>PROCESSED</div>
              </>
            )}
          </div>

          {/* Right Sub-Badge ("Disbursement Stage VERIFIED") - protected from overflow */}
          <div className="pb-2 text-right shrink-0 min-w-[125px]">
            <div className="font-sans font-extrabold text-sm leading-tight whitespace-nowrap" style={{ color: primaryColor }}>
              Disbursement
            </div>
            <div className="font-sans font-extrabold text-sm leading-tight whitespace-nowrap" style={{ color: primaryColor }}>
              Stage
            </div>
            <div
              className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-2xs whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(11, 21, 54, 0.08)',
                color: primaryColor,
              }}
            >
              <CheckCircle2 size={11} className="text-emerald-700" />
              <span>{record.statusBadgeLabel || record.status || 'VERIFIED'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROMINENT AMOUNT & PRODUCTS SOLD STATS CARDS */}
      <div className="relative z-10 grid grid-cols-2 gap-3 my-2">
        {/* Disbursed Amount Card */}
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-md">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Authorized Settlement Amount
          </div>
          <div className="font-sans font-black text-2xl mt-0.5 tracking-tight" style={{ color: amountColor }}>
            {amountStr}
          </div>
          <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>Disbursed to Account</span>
          </div>
        </div>

        {/* Total Products Sold */}
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-md">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Package size={12} className="text-slate-600" />
            <span>Total Products Sold</span>
          </div>
          <div className="font-sans font-black text-2xl mt-0.5 tracking-tight" style={{ color: primaryColor }}>
            {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
          </div>
          <div className="text-[10px] font-mono text-blue-700 font-semibold mt-0.5">
            Verified Sales Delivered
          </div>
        </div>
      </div>

      {/* 4. HONOREE PRESENTATION */}
      <div className="relative z-10 space-y-1">
        <div className="font-sans text-sm font-semibold" style={{ color: secondaryColor }}>
          Proudly presented to
        </div>
        <div className="font-sans font-black text-4xl tracking-tight leading-tight truncate" style={{ color: honoreeColor }}>
          {honoreeName}
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold pt-0.5" style={{ color: secondaryColor }}>
          <span>Tier: {record.partnerTier || 'VIP Achiever'}</span>
          <span>•</span>
          <span>Routing: {record.payoutChannel}</span>
        </div>
      </div>

      {/* 5. FOOTER: Date & Real Scannable Rainbow Holographic Foil QR Code */}
      <div className="relative z-10 flex items-end justify-between pt-4 border-t border-white/30">
        {/* Left: Date & Batch reference */}
        <div className="space-y-0.5">
          <div className="font-sans font-bold text-xs tracking-wider" style={{ color: secondaryColor }}>
            DATE:
          </div>
          <div className="font-sans font-black text-base tracking-wide" style={{ color: primaryColor }}>
            {formattedDate}
          </div>
          <div className="font-mono text-[9.5px] mt-1" style={{ color: secondaryColor }}>
            REF: {record.utrReference} • ID: {record.id}
          </div>
        </div>

        {/* Right: Rainbow Iridescent Holographic Foil with REAL Scannable QR Code */}
        <div className="flex flex-col items-end">
          <div
            className="p-[3.5px] rounded-2xl shadow-xl transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #A7F3D0 0%, #FDE047 25%, #F472B6 50%, #60A5FA 75%, #C084FC 100%)`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            }}
          >
            <div className="bg-white p-1 rounded-xl shadow-inner flex items-center justify-center">
              <RealQrCode
                value={verifyUrl}
                size={52}
                fgColor="#0F172A"
                bgColor="#FFFFFF"
                level="M"
                margin={1}
                title="Scan to verify official payout record"
              />
            </div>
          </div>
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1" style={{ color: secondaryColor }}>
            <ShieldCheck size={9} className="text-emerald-700" />
            <span>VERIFIED LEDGER</span>
          </span>
        </div>
      </div>
    </div>
  );
};

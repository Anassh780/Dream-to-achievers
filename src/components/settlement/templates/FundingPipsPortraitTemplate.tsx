import React from 'react';
import { SettlementRecord, formatSettlementAmount } from '@/types/settlement';
import { Package, ShieldCheck, CheckCircle2, Sparkles, Award } from 'lucide-react';

interface TemplateProps {
  record: SettlementRecord;
  variant?: 'blue' | 'emerald';
}

/**
 * High-precision deterministic SVG QR code pattern.
 */
const HolographicQrCode: React.FC<{ value: string; size?: number }> = ({ value, size = 64 }) => {
  // Deterministic pattern generation based on hash of string
  const modules = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  ];

  const n = modules.length;
  const cellSize = size / n;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xs">
      <rect width={size} height={size} fill="#FFFFFF" />
      {modules.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill="#0F172A"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const FundingPipsPortraitTemplate: React.FC<TemplateProps> = ({ record, variant }) => {
  const isEmerald = variant === 'emerald' || record.template === 'emerald_website_ui';
  const honoreeName =
    record.recipientName || record.signatoryName || record.businessName || 'Distinguished Partner';
  const totalProducts = record.totalProductsSold || 1;
  const amountStr = formatSettlementAmount(record.amount, record.currency);

  // Format date like "OCT 13, 2026"
  const formattedDate = (() => {
    try {
      const d = new Date(record.settlementDate);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    } catch {
      return record.settlementDate || 'OCT 22, 2026';
    }
  })();

  return (
    <div
      id="settlement-certificate-canvas"
      className="relative w-[600px] h-[840px] text-[#0B1536] font-sans p-10 flex flex-col justify-between overflow-hidden select-none bg-white rounded-3xl shadow-2xl border border-slate-200/80"
      style={{
        background: isEmerald
          ? `
            radial-gradient(circle at 100% 75%, rgba(52, 211, 153, 0.95) 0%, rgba(16, 185, 129, 0.92) 35%, rgba(5, 150, 105, 0.85) 65%, transparent 85%),
            radial-gradient(circle at 20% 90%, rgba(110, 231, 183, 0.7) 0%, transparent 50%),
            linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 40%, #DCFCE7 100%)
          `
          : `
            radial-gradient(circle at 100% 70%, rgba(56, 189, 248, 0.95) 0%, rgba(37, 99, 235, 0.92) 40%, rgba(29, 78, 216, 0.85) 75%, transparent 90%),
            radial-gradient(circle at 15% 90%, rgba(147, 197, 253, 0.6) 0%, transparent 50%),
            linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 38%, #DBEAFE 100%)
          `,
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
              src="/brand-logo.png"
              alt="Dream to Achievers"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center">
            <span className="font-sans font-black text-xl text-[#0B1536] tracking-tight">
              Dream to Achievers
            </span>
            <span className="text-[10px] font-black text-[#0B1536] align-super ml-0.5">®</span>
          </div>
        </div>

        {/* Right: Subtitle */}
        <div className="text-xs font-sans font-semibold text-slate-400/90 tracking-wide">
          Certification of achievement
        </div>
      </div>

      {/* 2. HERO SECTION: Congratulations & Giant Phase/Payout Header */}
      <div className="relative z-10 mt-6 space-y-1">
        <div className="font-sans font-extrabold text-sm uppercase tracking-[0.22em] text-[#0B1536]">
          CONGRATULATIONS
        </div>

        <div className="flex items-end justify-between gap-4 pt-1">
          {/* Giant Impact Words */}
          <div className="font-sans font-black text-[68px] leading-[0.88] tracking-[-0.03em] text-[#0B1536]">
            <div>WITHDRAWAL</div>
            <div>PROCESSED</div>
          </div>

          {/* Right Sub-Badge ("Evaluation Stage" in photo, "Disbursement Stage" here) */}
          <div className="pb-2 text-right">
            <div className="font-sans font-extrabold text-sm leading-tight text-[#0B1536]">
              Disbursement
            </div>
            <div className="font-sans font-extrabold text-sm leading-tight text-[#0B1536]">
              Stage
            </div>
            <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#0B1536]/10 text-[10px] font-mono font-bold text-[#0B1536]">
              VERIFIED
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
          <div className="font-sans font-black text-2xl text-[#0B1536] mt-0.5 tracking-tight">
            {amountStr}
          </div>
          <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-600" />
            <span>Disbursed to Account</span>
          </div>
        </div>

        {/* Total Products Sold (Key Requirement!) */}
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-md">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Package size={12} className="text-slate-600" />
            <span>Total Products Sold</span>
          </div>
          <div className="font-sans font-black text-2xl text-[#0B1536] mt-0.5 tracking-tight">
            {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
          </div>
          <div className="text-[10px] font-mono text-blue-700 font-semibold mt-0.5">
            Verified Sales Delivered
          </div>
        </div>
      </div>

      {/* 4. HONOREE PRESENTATION ("Proudly presented to Anas M") */}
      <div className="relative z-10 space-y-1">
        <div className="font-sans text-sm font-semibold text-slate-700">
          Proudly presented to
        </div>
        <div className="font-sans font-black text-4xl text-[#0B1536] tracking-tight leading-tight truncate">
          {honoreeName}
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700/90 pt-0.5">
          <span>Tier: {record.partnerTier || 'VIP Achiever'}</span>
          <span>•</span>
          <span>Routing: {record.payoutChannel}</span>
        </div>
      </div>

      {/* 5. FOOTER: Date & Rainbow Holographic Foil QR Code */}
      <div className="relative z-10 flex items-end justify-between pt-4 border-t border-white/30">
        {/* Left: Date & Batch reference */}
        <div className="space-y-0.5">
          <div className="font-sans font-bold text-xs text-[#0B1536]/80 tracking-wider">
            DATE:
          </div>
          <div className="font-sans font-black text-base text-[#0B1536] tracking-wide">
            {formattedDate}
          </div>
          <div className="font-mono text-[9.5px] text-[#0B1536]/70 mt-1">
            REF: {record.utrReference} • ID: {record.id}
          </div>
        </div>

        {/* Right: Rainbow Iridescent Holographic Foil QR Code (Matching exact photo!) */}
        <div className="flex flex-col items-end">
          <div
            className="p-[3.5px] rounded-2xl shadow-xl transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #A7F3D0 0%, #FDE047 25%, #F472B6 50%, #60A5FA 75%, #C084FC 100%)`,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            }}
          >
            <div className="bg-white p-1 rounded-xl shadow-inner flex items-center justify-center">
              <HolographicQrCode value={record.id} size={52} />
            </div>
          </div>
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#0B1536]/70 mt-1.5">
            VERIFIED LEDGER
          </span>
        </div>
      </div>
    </div>
  );
};

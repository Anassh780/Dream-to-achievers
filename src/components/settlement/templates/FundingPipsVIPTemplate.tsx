import React from 'react';
import { SettlementRecord, formatSettlementAmount } from '@/types/settlement';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Package,
  Sparkles,
  Crown,
  QrCode,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface TemplateProps {
  record: SettlementRecord;
}

export const FundingPipsVIPTemplate: React.FC<TemplateProps> = ({ record }) => {
  const isVerified = record.mode === 'verified';
  const honoreeName =
    record.recipientName || record.signatoryName || record.businessName || 'Distinguished Partner';
  const totalProducts = record.totalProductsSold || 1;

  return (
    <div
      id="settlement-certificate-canvas"
      className="relative w-[1200px] h-[750px] bg-[#07090E] text-[#F8FAFC] font-sans p-10 flex flex-col justify-between overflow-hidden select-none border-2 border-amber-500/40 shadow-2xl"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% -10%, rgba(245, 158, 11, 0.22) 0%, transparent 55%),
          radial-gradient(circle at 95% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 45%),
          radial-gradient(circle at 5% 90%, rgba(56, 189, 248, 0.07) 0%, transparent 45%),
          linear-gradient(to right, rgba(245, 158, 11, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(245, 158, 11, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 36px 36px, 36px 36px',
      }}
    >
      {/* Precision Metallic Gold Dual Framing & Corner Accents */}
      <div className="absolute inset-3 pointer-events-none border border-amber-500/30 rounded-2xl" />
      <div className="absolute inset-[15px] pointer-events-none border border-amber-400/15 rounded-xl" />

      {/* Decorative Guilloche Corner Brackets */}
      <div className="absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
      <div className="absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
      <div className="absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
      <div className="absolute bottom-5 right-5 w-5 h-5 border-b-2 border-r-2 border-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />

      {/* Draft Mode Watermark if applicable */}
      {!isVerified && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 opacity-10 rotate-[-24deg]">
          <div className="text-center font-mono font-black text-6xl tracking-widest text-amber-300 border-8 border-dashed border-amber-300 px-16 py-8 rounded-3xl uppercase">
            PREVIEW DRAFT · AUTO GENERATED
          </div>
        </div>
      )}

      {/* 1. TOP HEADER: Official Authority & Attestation Badge */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-amber-500/20">
        {/* Left: Platform Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] p-2">
            <img
              src="/images/brand-logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400 font-bold flex items-center gap-1">
                <Crown size={12} className="text-amber-400" />
                VIP DISBURSEMENT PROTOCOL
              </span>
              <span className="text-amber-500/40">•</span>
              <span className="font-mono text-[10px] text-slate-400 tracking-wider">OFFICIAL ATTESTATION</span>
            </div>
            <h1 className="font-serif font-black text-2xl text-slate-100 tracking-tight">
              {record.platformName}
            </h1>
          </div>
        </div>

        {/* Center: Verified Status Pill */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="uppercase tracking-widest">
              {record.status === 'Settled' || record.status === 'Disbursed'
                ? 'VERIFIED & DISBURSED'
                : 'OFFICIAL PAYOUT RECORD'}
            </span>
          </div>
        </div>

        {/* Right: Certificate Identifier */}
        <div className="text-right">
          <div className="font-mono text-[10px] text-amber-400/90 tracking-wider font-semibold uppercase">
            CERTIFICATE NO
          </div>
          <div className="font-mono text-sm font-bold text-slate-200 tracking-wider">
            {record.id}
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            DATE: {record.settlementDate}
          </div>
        </div>
      </div>

      {/* 2. MAIN HONOREE PRESENTATION (Funding Pips Centerpiece) */}
      <div className="relative z-10 text-center py-2 space-y-1.5">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.28em] text-amber-400/90">
          <Sparkles size={14} className="text-amber-400" />
          <span>Official Payout Certificate</span>
          <Sparkles size={14} className="text-amber-400" />
        </div>

        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          This authoritative certificate of earnings is proudly awarded to
        </div>

        <h2 className="font-serif font-black text-4xl sm:text-[42px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-[#FFD700] to-[#E6B800] uppercase drop-shadow-[0_4px_22px_rgba(245,158,11,0.4)] py-1 max-w-4xl mx-auto truncate">
          {honoreeName}
        </h2>

        <p className="text-xs text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          In official recognition of exceptional sales milestone achievement, verified order volume fulfillment,
          and authorized profit withdrawal settlement.
        </p>
      </div>

      {/* 3. THE 4 VIP METRIC CARDS (Includes Amount & Total Products Sold) */}
      <div className="relative z-10 grid grid-cols-4 gap-4 px-2">
        {/* Card 1: Official Disbursed Amount */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-950/90 border border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.15)] text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
            <Award size={13} className="text-amber-400" />
            <span>Disbursed Amount</span>
          </div>
          <div className="font-mono font-black text-2xl lg:text-[26px] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 tracking-tight">
            {formatSettlementAmount(record.amount, record.currency)}
          </div>
          <div className="text-[9.5px] font-mono text-slate-400">Net Processed Profit</div>
        </div>

        {/* Card 2: Total Products Sold (Key Requirement!) */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-cyan-500/15 via-slate-900/90 to-slate-950/90 border border-cyan-500/35 shadow-[0_4px_20px_rgba(6,182,212,0.12)] text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-center gap-1.5">
            <Package size={13} className="text-cyan-400" />
            <span>Total Products Sold</span>
          </div>
          <div className="font-mono font-black text-2xl lg:text-[26px] text-cyan-200 tracking-tight">
            {totalProducts} {totalProducts === 1 ? 'Product' : 'Products'}
          </div>
          <div className="text-[9.5px] font-mono text-slate-400">Verified Units Delivered</div>
        </div>

        {/* Card 3: Commercial Rank / Tier */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-slate-950/90 border border-amber-400/25 shadow-sm text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5">
            <Crown size={13} className="text-amber-400" />
            <span>Partner Standing</span>
          </div>
          <div className="font-serif font-bold text-lg lg:text-xl text-amber-200 truncate px-1">
            {record.partnerTier || 'VIP Achiever'}
          </div>
          <div className="text-[9.5px] font-mono text-slate-400">Official Reseller Tier</div>
        </div>

        {/* Card 4: Clearing Routing & Reference */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-b from-slate-800/40 via-slate-900/90 to-slate-950/90 border border-slate-700/60 shadow-sm text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>Clearing Routing</span>
          </div>
          <div className="font-mono font-bold text-sm text-slate-200 truncate">
            {record.payoutChannel}
          </div>
          <div className="text-[9.5px] font-mono text-slate-400 truncate">
            UTR: {record.utrReference}
          </div>
        </div>
      </div>

      {/* 4. FOOTER: Authority Signature, 3D Gold Seal & Verification Ledger */}
      <div className="relative z-10 pt-4 border-t border-amber-500/20 flex items-end justify-between">
        {/* Left: Authorized Officer Signature */}
        <div className="space-y-1">
          <div className="font-serif italic text-lg text-amber-200/90 select-none tracking-wider">
            Marcus Sterling
          </div>
          <div className="w-48 h-0.5 bg-gradient-to-r from-amber-400/60 to-transparent" />
          <div className="font-mono text-[10px] text-slate-300 uppercase font-semibold">
            Executive Director of Treasury
          </div>
          <div className="font-mono text-[9px] text-slate-500">
            Disbursement Authority • Clearing Node 01
          </div>
        </div>

        {/* Center: 3D Holographic VIP Gold Seal */}
        <div className="flex flex-col items-center">
          <div className="relative w-22 h-22 rounded-full bg-gradient-to-br from-[#FFE58F] via-[#D4AF37] to-[#8C6D15] p-0.5 shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center">
            {/* Inner Ring */}
            <div className="w-full h-full rounded-full bg-[#0A0D15] border-2 border-dashed border-[#FFE58F]/70 flex flex-col items-center justify-center p-2 text-center">
              <Crown size={16} className="text-amber-300 mb-0.5 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              <span className="text-[7.5px] font-mono font-black text-amber-200 tracking-wider uppercase leading-tight">
                OFFICIAL VIP
              </span>
              <span className="text-[6.5px] font-mono font-bold text-amber-400/90 tracking-widest uppercase">
                VERIFIED
              </span>
            </div>
          </div>
          <span className="text-[8.5px] font-mono text-amber-300/80 uppercase tracking-widest mt-1 font-semibold">
            ★ VIP CLUB PROTOCOL ★
          </span>
        </div>

        {/* Right: Immutable Cryptographic Fingerprint */}
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-mono text-[10px] font-bold">
            <CheckCircle2 size={13} />
            <span>AUTHENTICATED RECORD</span>
          </div>
          <div className="font-mono text-[9px] text-slate-400 tracking-wider max-w-[240px] truncate">
            HASH: {record.complianceHash ? record.complianceHash.slice(0, 32) : 'AUTH-CERT-LEDGER-DTA'}...
          </div>
          <div className="font-mono text-[9px] text-slate-500">
            ISO-20022 Financial Clearing Standard
          </div>
        </div>
      </div>
    </div>
  );
};

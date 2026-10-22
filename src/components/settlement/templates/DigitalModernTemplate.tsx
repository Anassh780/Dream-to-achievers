import React from 'react';
import { SettlementRecord, formatSettlementAmount } from '@/types/settlement';
import { Zap, ShieldCheck, Check, Building2, QrCode, ArrowUpRight, Cpu } from 'lucide-react';
import { RealQrCode } from '@/components/common/RealQrCode';

interface TemplateProps {
  record: SettlementRecord;
}

export const DigitalModernTemplate: React.FC<TemplateProps> = ({ record }) => {
  const isVerified = record.mode === 'verified';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dream-to-achievers.vercel.app';
  const verifyUrl = `${origin}/dashboard/sales?certificate=${encodeURIComponent(record.id)}&partner=${encodeURIComponent(record.partnerId || '')}`;

  return (
    <div
      id="settlement-certificate-canvas"
      className="relative w-[1200px] h-[750px] bg-[#090D16] text-[#F8FAFC] font-sans p-12 flex flex-col justify-between overflow-hidden select-none border border-cyan-500/30 shadow-2xl"
      style={{
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 100% 100%, rgba(52, 211, 153, 0.08) 0%, transparent 50%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 24px 24px, 24px 24px',
      }}
    >
      {/* High-Tech Framing Elements & Subtle Neon Grid Lines */}
      <div className="absolute inset-4 pointer-events-none border border-cyan-500/20 rounded-3xl" />
      <div className="absolute top-0 right-1/3 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-xs" />
      <div className="absolute bottom-0 left-1/4 w-80 h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-xs" />

      {/* Mode B Draft Watermark */}
      {!isVerified && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 opacity-12 rotate-[-22deg]">
          <div className="text-center font-mono font-black text-6xl tracking-widest text-cyan-300 border-8 border-dashed border-cyan-300 px-16 py-8 rounded-3xl uppercase">
            SAMPLE · NOT AN OFFICIAL RECORD
          </div>
        </div>
      )}

      {/* 1. Header: Modern Fintech Dual Lockup */}
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center p-2.5 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <img
              src="/brand-logo.png"
              alt="Platform Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/brand-logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-cyan-400 font-bold flex items-center gap-1">
                <Cpu size={12} />
                DIGITAL SETTLEMENT ENGINE
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider">
                REAL-TIME CLEARANCE
              </span>
            </div>
            <h1 className="font-serif font-bold text-xl text-slate-100 tracking-tight">
              {record.platformName}
            </h1>
          </div>
        </div>

        {/* Center: Modern Status Chip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-slate-300 font-bold uppercase">{record.status}</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-semibold">{record.payoutChannel}</span>
          </div>
        </div>

        {/* Right: Partner Branding */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="font-mono text-[10px] tracking-wider text-slate-400 block uppercase">
              Corporate Account
            </span>
            <span className="font-bold text-sm text-slate-200 truncate max-w-[200px] block">
              {record.businessName}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">{record.partnerId}</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-md">
            {record.partnerLogoUrl ? (
              <img
                src={record.partnerLogoUrl}
                alt={record.businessName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="text-cyan-400 w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Hero Center Card: Digital Financial Settlement */}
      <div className="relative z-10 py-6">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] grid grid-cols-12 gap-8 items-center">
          {/* Main Figure */}
          <div className="col-span-8 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300 flex items-center gap-1.5">
                <Zap size={14} className="text-cyan-400" />
                Verified Settlement Amount
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                UTR: {record.utrReference}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-100 to-emerald-300 tracking-tight tabular-nums">
                {formatSettlementAmount(record.amount, record.currency)}
              </span>
              <span className="font-mono text-base font-bold text-cyan-400 uppercase">
                {record.currency}
              </span>
            </div>

            {record.endorsementNote && (
              <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1 max-w-xl">
                {record.endorsementNote}
              </p>
            )}
          </div>

          {/* Cumulative & QR Lockup */}
          <div className="col-span-4 flex items-center justify-end gap-5 pl-6 border-l border-slate-800">
            <div className="text-right space-y-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                  Partner Tier Classification
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  {record.partnerTier}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                  Lifetime Cumulative Total
                </span>
                <span className="font-mono text-xl font-bold text-slate-100 tabular-nums block">
                  {formatSettlementAmount(record.cumulativeSettlements, record.currency)}
                </span>
              </div>
            </div>

            <div className="w-18 h-18 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg border border-slate-300">
              <RealQrCode
                value={verifyUrl}
                size={60}
                fgColor="#090D16"
                bgColor="#FFFFFF"
                level="M"
                margin={1}
                title="Scan to verify settlement"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Transaction Breakdown Matrix */}
      <div className="relative z-10 grid grid-cols-4 gap-4 py-1 font-mono text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Account Holder / Signatory</span>
          <p className="text-slate-200 font-bold truncate">{record.recipientName || record.signatoryName || record.businessName}</p>
          <span className="text-[9.5px] text-cyan-400 block truncate">Enterprise Verified</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-cyan-400 uppercase block font-semibold">Total Products Sold</span>
          <p className="text-cyan-200 font-bold">{record.totalProductsSold || 1} Products</p>
          <span className="text-[9.5px] text-slate-400 block">Verified Units Delivered</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Settlement Value Date</span>
          <p className="text-slate-200 font-bold">{record.settlementDate}</p>
          <span className="text-[9.5px] text-slate-400 block">{record.settlementTime || '12:00:00 UTC'}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Disbursement Rail</span>
          <p className="text-slate-200 font-bold truncate">{record.payoutChannel}</p>
          <span className="text-[9.5px] text-emerald-400 block truncate">UTR: {record.utrReference}</span>
        </div>
      </div>

      {/* 4. Footer: Cryptographic Signature & Attestation */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-cyan-300 font-bold block uppercase tracking-wider">
              SHA-256 Ledger Verification Hash
            </span>
            <span className="text-slate-400 font-mono text-[9px] truncate max-w-[550px] block select-all">
              {record.complianceHash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-slate-200 font-bold uppercase tracking-wider block">
            Dream to Achievers Financial Node
          </span>
          <span className="text-slate-500 text-[9px]">
            ISO-20022 Financial Output • Real-time Automated Settlement Rail
          </span>
        </div>
      </div>
    </div>
  );
};

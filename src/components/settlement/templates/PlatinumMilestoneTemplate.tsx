import React from 'react';
import { SettlementRecord, formatSettlementAmount } from '@/types/settlement';
import { Award, ShieldCheck, Sparkles, Building2, Check, QrCode } from 'lucide-react';

interface TemplateProps {
  record: SettlementRecord;
}

export const PlatinumMilestoneTemplate: React.FC<TemplateProps> = ({ record }) => {
  const isVerified = record.mode === 'verified';

  return (
    <div
      id="settlement-certificate-canvas"
      className="relative w-[1200px] h-[750px] bg-gradient-to-br from-[#0B0D13] via-[#07090E] to-[#0A0D15] text-[#F8FAFC] font-sans p-12 flex flex-col justify-between overflow-hidden select-none border border-amber-500/30 shadow-2xl"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(212, 175, 55, 0.06) 0%, transparent 40%),
          linear-gradient(to right, rgba(212, 175, 55, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(212, 175, 55, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 30px 30px, 30px 30px',
      }}
    >
      {/* Luxury Dual Metallic Border & Corner Ornaments */}
      <div className="absolute inset-4 pointer-events-none border border-amber-500/25 rounded-2xl" />
      <div className="absolute inset-[16px] pointer-events-none border border-amber-500/10 rounded-xl" />
      <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
      <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
      <div className="absolute bottom-5 left-5 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
      <div className="absolute bottom-5 right-5 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />

      {/* Mode B Draft Watermark */}
      {!isVerified && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 opacity-12 rotate-[-22deg]">
          <div className="text-center font-mono font-black text-6xl tracking-widest text-amber-300 border-8 border-dashed border-amber-300 px-16 py-8 rounded-3xl uppercase">
            SAMPLE · NOT AN OFFICIAL RECORD
          </div>
        </div>
      )}

      {/* 1. Header: Platform Identity & Milestone Honors Lockup */}
      <div className="relative z-10 flex items-center justify-between pb-6 border-b border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A1813] to-[#0A0906] border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.2)] p-2">
            <img
              src="/images/brand-logo.png"
              alt="Platform Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#D4AF37] font-bold">
                DISTINGUISHED PARTNER ATTESTATION
              </span>
              <span className="text-amber-500/40">•</span>
              <span className="font-mono text-[10px] text-slate-400">FINANCIAL CLEARING NODE</span>
            </div>
            <h1 className="font-serif font-bold text-2xl text-slate-100 tracking-tight">
              {record.platformName}
            </h1>
          </div>
        </div>

        {/* Center: Prestigious Gold Seal */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Award size={15} className="text-[#D4AF37]" />
            <span className="uppercase tracking-widest">Milestone Settlement Record</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            CERTIFICATE NO: <span className="text-amber-200 font-bold">{record.id}</span>
          </div>
        </div>

        {/* Right: Partner Lockup */}
        <div className="flex items-center gap-3.5 text-right">
          <div>
            <span className="font-mono text-[10px] tracking-wider text-amber-300 block uppercase font-semibold">
              Corporate Beneficiary
            </span>
            <span className="font-bold text-sm text-slate-100 truncate max-w-[200px] block">
              {record.businessName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">{record.partnerId}</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-md">
            {record.partnerLogoUrl ? (
              <img
                src={record.partnerLogoUrl}
                alt={record.businessName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="text-[#D4AF37] w-7 h-7" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Hero Centerpiece: Platinum Gold Revenue Milestone Card */}
      <div className="relative z-10 py-6">
        <div className="p-7 rounded-2xl bg-gradient-to-r from-[#14120D] via-[#0E0F14] to-[#14120D] border border-amber-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-8">
          {/* Main Amount */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-200/90 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#D4AF37]" />
                Official Disbursement Amount
              </span>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <Check size={11} strokeWidth={3} />
                {record.status}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-100 to-amber-300 tracking-tight tabular-nums drop-shadow-md">
                {formatSettlementAmount(record.amount, record.currency)}
              </span>
              <span className="font-mono text-base font-bold text-amber-400">
                {record.currency}
              </span>
            </div>

            {record.endorsementNote && (
              <p className="text-xs text-amber-100/90 font-sans leading-relaxed italic pt-1 max-w-xl">
                &ldquo;{record.endorsementNote}&rdquo;
              </p>
            )}
          </div>

          {/* Platinum Tier Badge & Segregated Cumulative Total */}
          <div className="flex flex-col items-end space-y-3.5 pl-6 border-l border-amber-500/20 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                Partner Recognition Tier
              </span>
              <span className="inline-block mt-0.5 text-xs font-mono font-black text-amber-200 bg-gradient-to-r from-amber-500/30 to-amber-500/10 px-3.5 py-1 rounded-lg border border-amber-400/40 shadow-sm uppercase tracking-wider">
                ★ {record.partnerTier} ★
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                Lifetime Cumulative Settlements
              </span>
              <span className="font-mono text-xl font-bold text-slate-200 tabular-nums">
                {formatSettlementAmount(record.cumulativeSettlements, record.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Attribution Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-4 py-2 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
          <span className="text-[10px] text-amber-200/70 uppercase block">Signatory Representative</span>
          <p className="text-slate-200 font-bold truncate">{record.signatoryName}</p>
          <span className="text-[9.5px] text-slate-400 block truncate">{record.businessName}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
          <span className="text-[10px] text-amber-200/70 uppercase block">Settlement Date</span>
          <p className="text-slate-200 font-bold">{record.settlementDate}</p>
          <span className="text-[9.5px] text-slate-400 block">{record.settlementTime || '14:00:00 UTC'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
          <span className="text-[10px] text-amber-200/70 uppercase block">Settlement Batch UTR</span>
          <p className="text-slate-200 font-bold truncate">{record.utrReference}</p>
          <span className="text-[9.5px] text-emerald-400 block">Settled on Ledger</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
          <span className="text-[10px] text-amber-200/70 uppercase block">Payment Channel</span>
          <p className="text-slate-200 font-bold truncate">{record.payoutChannel}</p>
          <span className="text-[9.5px] text-slate-400 block">Direct Banking Rail</span>
        </div>
      </div>

      {/* 4. Luxury Attestation Footer */}
      <div className="relative z-10 pt-4 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-amber-200 font-bold block uppercase tracking-wider">
              Cryptographic SHA-256 Ledger Fingerprint
            </span>
            <span className="text-slate-400 font-mono text-[9px] truncate max-w-[550px] block select-all">
              {record.complianceHash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-amber-100 font-bold uppercase tracking-wider block">
            Executive Treasury Verification
          </span>
          <span className="text-slate-400 text-[9.5px]">
            Officially Sealed and Documented by Dream to Achievers B2B Network
          </span>
        </div>
      </div>
    </div>
  );
};

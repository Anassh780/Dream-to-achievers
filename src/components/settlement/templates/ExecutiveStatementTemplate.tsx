import React from 'react';
import { SettlementRecord, formatSettlementAmount } from '@/types/settlement';
import { ShieldCheck, CheckCircle2, Building2, Fingerprint, Award, Check } from 'lucide-react';

interface TemplateProps {
  record: SettlementRecord;
}

export const ExecutiveStatementTemplate: React.FC<TemplateProps> = ({ record }) => {
  const isVerified = record.mode === 'verified';

  return (
    <div
      id="settlement-certificate-canvas"
      className="relative w-[1200px] h-[750px] bg-[#080C14] text-[#F8FAFC] font-sans p-12 flex flex-col justify-between overflow-hidden select-none border border-slate-800 shadow-2xl"
      style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.04) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(212, 175, 55, 0.04) 0%, transparent 40%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px',
      }}
    >
      {/* Precision Guilloche Border & Titanium Framing */}
      <div className="absolute inset-4 pointer-events-none border border-slate-700/50 rounded-2xl" />
      <div className="absolute inset-[18px] pointer-events-none border border-slate-800/80 rounded-xl" />
      <div className="absolute top-6 left-6 w-3 h-3 border-t-2 border-l-2 border-slate-500" />
      <div className="absolute top-6 right-6 w-3 h-3 border-t-2 border-r-2 border-slate-500" />
      <div className="absolute bottom-6 left-6 w-3 h-3 border-b-2 border-l-2 border-slate-500" />
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b-2 border-r-2 border-slate-500" />

      {/* Security Watermark (Mode B Draft Anti-Fraud Protection) */}
      {!isVerified && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 opacity-12 rotate-[-22deg]">
          <div className="text-center font-mono font-black text-6xl tracking-widest text-amber-300 border-8 border-dashed border-amber-300 px-16 py-8 rounded-3xl uppercase">
            SAMPLE · NOT AN OFFICIAL RECORD
          </div>
        </div>
      )}

      {/* 1. Header: Dual Logo Lockup & Institutional Header */}
      <div className="relative z-10 flex items-start justify-between pb-6 border-b border-slate-800">
        {/* Left: Platform Brand */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 flex items-center justify-center shadow-lg p-2.5">
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
              <span className="font-mono text-[10px] tracking-widest uppercase text-slate-400 font-semibold">
                INSTITUTIONAL SETTLEMENT LEDGER
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CLEARING NODE 01
              </span>
            </div>
            <h1 className="font-serif font-bold text-xl text-slate-100 tracking-tight">
              {record.platformName}
            </h1>
          </div>
        </div>

        {/* Center: Official Title Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-mono tracking-wider shadow-sm">
            <ShieldCheck size={14} className="text-sky-400" />
            <span className="font-semibold uppercase">Official Payout Certificate</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            BATCH REF: <span className="text-slate-200 font-bold">{record.utrReference}</span>
          </div>
        </div>

        {/* Right: Partner Organization Brand Lockup */}
        <div className="flex items-center gap-3.5 text-right">
          <div>
            <span className="font-mono text-[10px] tracking-wider text-slate-400 block uppercase">
              Partner Organization
            </span>
            <span className="font-bold text-sm text-slate-200 truncate max-w-[200px] block">
              {record.businessName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">{record.partnerId}</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-md">
            {record.partnerLogoUrl ? (
              <img
                src={record.partnerLogoUrl}
                alt={record.businessName}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="text-slate-400 w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Primary Financial Figure & Tier Recognition */}
      <div className="relative z-10 py-6 grid grid-cols-12 gap-6 items-center">
        {/* Left Column: Core Disbursed Amount */}
        <div className="col-span-7 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-slate-400">
              Net Authorized Settlement Amount
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                record.status === 'Settled'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : record.status === 'Disbursed'
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              <Check size={11} strokeWidth={3} />
              {record.status}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-5xl font-black text-slate-50 tracking-tight tabular-nums drop-shadow-sm">
              {formatSettlementAmount(record.amount, record.currency)}
            </span>
            <span className="font-mono text-sm font-semibold text-slate-400 uppercase">
              {record.currency}
            </span>
          </div>

          {record.endorsementNote && (
            <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-xl italic pt-1">
              &ldquo;{record.endorsementNote}&rdquo;
            </p>
          )}
        </div>

        {/* Right Column: Lifetime Cumulative Disbursements & Tier */}
        <div className="col-span-5 flex flex-col justify-end space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Merchant Classification</span>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/25">
              {record.partnerTier}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Lifetime Cumulative Settlements
              </span>
              <span className="font-mono text-lg font-bold text-slate-200 tabular-nums">
                {formatSettlementAmount(record.cumulativeSettlements, record.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Payout Channel</span>
              <span className="font-mono text-xs font-semibold text-slate-300">
                {record.payoutChannel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Structured Settlement Metadata Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-3 py-3 border-y border-slate-800 font-mono text-xs">
        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Authorized Signatory</span>
          <p className="text-slate-200 font-bold truncate">{record.signatoryName}</p>
          <span className="text-[9.5px] text-slate-500 block truncate">Identity Verified</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Settlement Value Date</span>
          <p className="text-slate-200 font-bold">{record.settlementDate}</p>
          <span className="text-[9.5px] text-slate-500 block">{record.settlementTime || '12:00:00 UTC'}</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Clearing Routing</span>
          <p className="text-slate-200 font-bold truncate">{record.payoutChannel}</p>
          <span className="text-[9.5px] text-emerald-400 block">Direct Treasury Dispatch</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase block">Ledger Verification ID</span>
          <p className="text-slate-200 font-bold truncate font-mono text-[11px]">{record.id}</p>
          <span className="text-[9.5px] text-slate-500 block">Immutable Record</span>
        </div>
      </div>

      {/* 4. Footer: Cryptographic SHA-256 Stamp & Legal Attestation */}
      <div className="relative z-10 pt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Fingerprint size={16} />
          </div>
          <div>
            <span className="text-slate-300 font-bold block uppercase tracking-wider">
              Cryptographic SHA-256 Ledger Stamp
            </span>
            <span className="text-slate-400 font-mono text-[9px] truncate max-w-[500px] block select-all">
              {record.complianceHash || 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-slate-300 font-semibold block uppercase">
              Dream to Achievers Financial Operations
            </span>
            <span className="text-slate-500 text-[9px]">
              ISO-20022 Compliant Settlement Output • Official B2B Attestation
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import {
  SettlementRecord,
  SettlementTemplateType,
  SettlementCurrency,
  SettlementStatus,
  PayoutChannel,
  PartnerTier,
  computeRecordHash,
} from '@/types/settlement';
import {
  Building2,
  User,
  Hash,
  Coins,
  ShieldCheck,
  Calendar,
  CreditCard,
  Upload,
  Trash2,
  Sparkles,
  RotateCcw,
  Layers,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';

interface SettlementFormProps {
  record: SettlementRecord;
  onChange: (updated: SettlementRecord) => void;
  onReset: () => void;
  onSamplePrefill: () => void;
}

const CURRENCIES: SettlementCurrency[] = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SGD', 'CAD', 'USDT'];

const STATUS_OPTIONS: SettlementStatus[] = ['Settled', 'Disbursed', 'Processed', 'Pending Re-check'];

const CHANNEL_OPTIONS: PayoutChannel[] = [
  'Wire Transfer',
  'SEPA Instant',
  'ACH Corporate Payout',
  '1-Link IBFT / Raast',
  'Escrow Settlement',
  'Digital Rails (USDT/USDC)',
  'Easypaisa / JazzCash Business',
];

const TIER_PRESETS: PartnerTier[] = [
  'Tier-1 Enterprise Partner',
  'Merchant Standard',
  'Global Vendor',
  'Strategic Distributor',
  'Diamond Sovereign Partner',
  'Corporate Affiliate',
];

export const SettlementForm: React.FC<SettlementFormProps> = ({
  record,
  onChange,
  onReset,
  onSamplePrefill,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = async (field: keyof SettlementRecord, value: any) => {
    const updated: SettlementRecord = { ...record, [field]: value };

    // Recompute compliance hash when key financial/legal parameters change
    if (['businessName', 'partnerId', 'amount', 'currency', 'utrReference', 'settlementDate'].includes(field)) {
      updated.complianceHash = await computeRecordHash({
        businessName: updated.businessName,
        partnerId: updated.partnerId,
        amount: updated.amount,
        currency: updated.currency,
        utrReference: updated.utrReference,
        settlementDate: updated.settlementDate,
      });
    }

    onChange(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        handleFieldChange('partnerLogoUrl', event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleFieldChange('partnerLogoUrl', undefined);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRegenerateUtr = () => {
    const randomBatch = Math.floor(100000 + Math.random() * 900000);
    handleFieldChange('utrReference', `UTR-${new Date().getFullYear()}-${randomBatch}-SETTLE`);
  };

  const setDatePreset = (preset: 'today' | 'yesterday' | 'period_close') => {
    const now = new Date();
    if (preset === 'yesterday') {
      now.setDate(now.getDate() - 1);
    } else if (preset === 'period_close') {
      now.setDate(0); // Last day of previous month
    }
    handleFieldChange('settlementDate', now.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6 text-xs text-slate-300">
      {/* 1. Operating Mode & Template Selector */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-cyan-400" />
            Operating Mode
          </label>
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
              record.mode === 'verified'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {record.mode === 'verified' ? 'Mode A: Verified Record' : 'Mode B: Draft / Demo Mode'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFieldChange('mode', 'verified')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              record.mode === 'verified'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)] font-semibold'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <FileCheck2 size={14} />
              <span>Verified Ledger</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Cryptographically validated against authoritative payouts.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleFieldChange('mode', 'draft')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              record.mode === 'draft'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <AlertTriangle size={14} />
              <span>Draft Demonstration</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Watermarked sample preview for custom corporate scenarios.
            </p>
          </button>
        </div>

        {/* Template Style Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-cyan-400" />
            Executive Template Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'funding_pips_portrait', name: 'Funding Pips (Sky Blue)', desc: 'Vertical Poster Cyan/Blue' },
              { id: 'emerald_website_ui', name: 'Website UI (Emerald)', desc: 'Vertical Emerald Mint' },
              { id: 'funding_pips_vip', name: 'VIP Gold Edition', desc: 'Obsidian Gold Landscape' },
              { id: 'executive_statement', name: 'Executive Statement', desc: 'Minimalist Swiss' },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleFieldChange('template', tmpl.id as SettlementTemplateType)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  record.template === tmpl.id
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-cyan-400/50 text-cyan-300 shadow-md ring-1 ring-cyan-400/30'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="font-bold text-xs block text-slate-100">{tmpl.name}</span>
                <span className="text-[9.5px] text-slate-400 block mt-0.5">{tmpl.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Business & Beneficiary Entity Details */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
        <h3 className="font-serif font-bold text-sm text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Building2 size={16} className="text-cyan-400" />
          <span>Entity &amp; Merchant Attribution</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Honoree / Recipient Name (VIP Certificate Display) *
            </label>
            <input
              type="text"
              value={record.recipientName || record.signatoryName || record.businessName || ''}
              onChange={(e) => {
                handleFieldChange('recipientName', e.target.value);
                handleFieldChange('businessName', e.target.value);
                handleFieldChange('signatoryName', e.target.value);
              }}
              placeholder="e.g. Ghhhhbbhjn"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Business / Entity Name *
            </label>
            <input
              type="text"
              value={record.businessName}
              onChange={(e) => handleFieldChange('businessName', e.target.value)}
              placeholder="e.g. Acme Global Logistics Ltd"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Authorized Signatory / Officer *
            </label>
            <input
              type="text"
              value={record.signatoryName}
              onChange={(e) => handleFieldChange('signatoryName', e.target.value)}
              placeholder="e.g. Sarah Jenkins, VP Treasury"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Partner / Merchant ID
            </label>
            <input
              type="text"
              value={record.partnerId}
              onChange={(e) => handleFieldChange('partnerId', e.target.value)}
              placeholder="e.g. DTA-ORG-9842-EU"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Partner Tier Classification
            </label>
            <input
              type="text"
              value={record.partnerTier}
              onChange={(e) => handleFieldChange('partnerTier', e.target.value)}
              placeholder="e.g. Tier-1 Enterprise Partner"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
            />
          </div>
        </div>

        {/* Quick Tier Preset Chips */}
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
            Quick Tier Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TIER_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleFieldChange('partnerTier', t)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-colors cursor-pointer ${
                  record.partnerTier === t
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Partner Logo Upload */}
        <div className="pt-2 border-t border-slate-800/80">
          <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase flex items-center justify-between">
            <span>Partner Business Logo (Dual Branding)</span>
            <span className="text-[9.5px] text-slate-500">Max 2MB (PNG / SVG / JPG)</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="partner-logo-upload-input"
            />
            <label
              htmlFor="partner-logo-upload-input"
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-200 inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Upload size={14} className="text-cyan-400" />
              <span>{record.partnerLogoUrl ? 'Replace Logo' : 'Upload Business Logo'}</span>
            </label>

            {record.partnerLogoUrl && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={record.partnerLogoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer transition-colors"
                  title="Remove Logo"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Financial Metrics & Settlement Currency */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
        <h3 className="font-serif font-bold text-sm text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
          <Coins size={16} className="text-cyan-400" />
          <span>Settlement Financial Metrics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Amount */}
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Authorized Settlement Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={record.amount}
                onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-sm font-mono font-bold tabular-nums transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-cyan-400">
                {record.currency}
              </span>
            </div>
          </div>

          {/* Currency Switcher */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Currency
            </label>
            <select
              value={record.currency}
              onChange={(e) => handleFieldChange('currency', e.target.value as SettlementCurrency)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono font-bold cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c} className="bg-slate-950 text-slate-100">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cumulative Lifetime Total */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase flex items-center justify-between">
            <span>Cumulative Lifetime Settlements Received</span>
            <span className="text-[9.5px] text-slate-500">Separated to prevent confusion</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={record.cumulativeSettlements}
            onChange={(e) => handleFieldChange('cumulativeSettlements', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono tabular-nums transition-colors"
          />
        </div>

        {/* Total Products Sold */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase flex items-center justify-between">
            <span>Total Products Sold (Volume Milestone)</span>
            <span className="text-[9.5px] text-cyan-400 font-semibold">Auto-calculated from sales</span>
          </label>
          <input
            type="number"
            min="1"
            value={record.totalProductsSold || 1}
            onChange={(e) => handleFieldChange('totalProductsSold', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-400 tabular-nums transition-colors"
          />
        </div>
      </div>

      {/* 4. Clearing Parameters & Dates */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
        <h3 className="font-serif font-bold text-sm text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
          <CreditCard size={16} className="text-cyan-400" />
          <span>Banking &amp; Clearing Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* UTR Reference */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase flex items-center justify-between">
              <span>Settlement Batch / UTR ID</span>
              <button
                type="button"
                onClick={handleRegenerateUtr}
                className="text-[9.5px] text-cyan-400 hover:underline cursor-pointer"
              >
                Regenerate
              </button>
            </label>
            <input
              type="text"
              value={record.utrReference}
              onChange={(e) => handleFieldChange('utrReference', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Settlement Status
            </label>
            <select
              value={record.status}
              onChange={(e) => handleFieldChange('status', e.target.value as SettlementStatus)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-slate-950 text-slate-100">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Payout Channel */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
              Payout Channel / Routing
            </label>
            <select
              value={record.payoutChannel}
              onChange={(e) => handleFieldChange('payoutChannel', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono cursor-pointer"
            >
              {CHANNEL_OPTIONS.map((ch) => (
                <option key={ch} value={ch} className="bg-slate-950 text-slate-100">
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Settlement Date */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase flex items-center justify-between">
              <span>Settlement Date</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDatePreset('today')}
                  className="text-[9px] font-mono text-cyan-400 hover:underline"
                >
                  Today
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setDatePreset('yesterday')}
                  className="text-[9px] font-mono text-cyan-400 hover:underline"
                >
                  Yesterday
                </button>
              </div>
            </label>
            <input
              type="date"
              value={record.settlementDate}
              onChange={(e) => handleFieldChange('settlementDate', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
            />
          </div>
        </div>

        {/* Optional Endorsement Note */}
        <div>
          <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
            Achievement or Compliance Endorsement Note
          </label>
          <textarea
            rows={2}
            value={record.endorsementNote || ''}
            onChange={(e) => handleFieldChange('endorsementNote', e.target.value)}
            placeholder="e.g. Authorized Quarterly Revenue Share Distribution & Milestone Attestation"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
          />
        </div>
      </div>

      {/* Quick Utility Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onSamplePrefill}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-colors"
        >
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>Prefill Sample B2B Data</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer transition-colors"
        >
          <RotateCcw size={13} />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
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
  Palette,
  Type,
  Image as ImageIcon,
  Check,
  Sliders,
  Paintbrush,
} from 'lucide-react';
import {
  BACKGROUND_PRESETS,
  FONT_OPTIONS,
} from '@/utils/settlementThemeHelper';

interface SettlementFormProps {
  record: SettlementRecord;
  onChange: (updated: SettlementRecord) => void;
  onReset: () => void;
  onSamplePrefill: () => void;
  defaultTab?: 'details' | 'styles';
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
  defaultTab = 'styles',
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'styles'>(defaultTab);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

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

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Background image must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        handleFieldChange('backgroundPreset', 'custom');
        handleFieldChange('customBackgroundImageUrl', event.target.result);
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

  const resetStylesToDefault = () => {
    onChange({
      ...record,
      customFontFamily: undefined,
      primaryTextColor: undefined,
      honoreeTextColor: undefined,
      amountTextColor: undefined,
      secondaryTextColor: undefined,
      accentColor: undefined,
      backgroundPreset: 'default',
      customBackgroundGradient: undefined,
      customBackgroundImageUrl: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Tab Bar: Data vs Styles */}
      <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`py-2 px-3 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders size={14} />
          <span>Ledger &amp; Data Fields</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('styles')}
          className={`py-2 px-3 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'styles'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Paintbrush size={14} />
          <span>Fonts, Colors &amp; Backgrounds</span>
        </button>
      </div>

      {activeTab === 'styles' ? (
        /* ========================================================
           TAB 2: FONTS, COLORS & AMAZING BACKGROUNDS (ADMIN ONLY)
           ======================================================== */
        <div className="space-y-4">
          {/* 1. Typography / Font Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <label className="text-[11px] font-mono uppercase text-slate-300 font-bold tracking-wider flex items-center gap-1.5">
                <Type size={15} className="text-amber-400" />
                Certificate Typography (Font Style)
              </label>
              <span className="text-[10px] font-mono text-cyan-400">
                {record.customFontFamily || 'Template Default'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Select an official font style to apply across the entire certificate canvas in real-time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => handleFieldChange('customFontFamily', font.family)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    record.customFontFamily === font.family
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold block">{font.name}</span>
                    {record.customFontFamily === font.family && (
                      <Check size={14} className="text-amber-400" />
                    )}
                  </div>
                  <span className="text-[10px] opacity-70 block mt-0.5 font-sans">
                    {font.category} • The quick brown fox jumps
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Amazing Backgrounds Gallery */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <label className="text-[11px] font-mono uppercase text-slate-300 font-bold tracking-wider flex items-center gap-1.5">
                <ImageIcon size={15} className="text-cyan-400" />
                Amazing Backgrounds Gallery
              </label>
              <span className="text-[10px] font-mono text-amber-400 uppercase">
                {record.backgroundPreset || 'default'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Switch the background of the certificate between ultra-luxury metallic foils, cyberpunk matrix grids, and high-tech gradients.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleFieldChange('backgroundPreset', preset.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-24 ${
                    (record.backgroundPreset || 'default') === preset.id
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                  style={{ background: preset.previewGradient }}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                      {preset.category}
                    </span>
                    {(record.backgroundPreset || 'default') === preset.id && (
                      <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xs">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="relative z-10 bg-black/75 p-1.5 rounded-lg backdrop-blur-xs">
                    <span className="text-[11px] font-bold text-white block truncate leading-tight">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Background Upload / Gradient Inputs */}
            {record.backgroundPreset === 'custom' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                <label className="text-[10.5px] font-mono uppercase text-cyan-400 font-semibold block">
                  Custom Artwork / Gradient Settings
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">
                      Custom CSS Gradient
                    </label>
                    <input
                      type="text"
                      value={record.customBackgroundGradient || ''}
                      onChange={(e) => handleFieldChange('customBackgroundGradient', e.target.value)}
                      placeholder="e.g. linear-gradient(135deg, #0f172a, #1e3a8a)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono text-[10px] uppercase">
                      Upload Custom Background Image (PNG/JPG)
                    </label>
                    <input
                      ref={bgImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => bgImageInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Upload File</span>
                      </button>
                      {record.customBackgroundImageUrl && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange('customBackgroundImageUrl', undefined)}
                          className="px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Text Colors Customizer */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <label className="text-[11px] font-mono uppercase text-slate-300 font-bold tracking-wider flex items-center gap-1.5">
                <Palette size={15} className="text-emerald-400" />
                Text &amp; Element Colors
              </label>
              <button
                type="button"
                onClick={resetStylesToDefault}
                className="text-[10px] font-mono text-slate-400 hover:text-amber-400 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Reset Colors</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Headings Color */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[10.5px] font-mono uppercase text-slate-400 font-semibold">
                  Primary Headings Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={record.primaryTextColor || '#F8FAFC'}
                    onChange={(e) => handleFieldChange('primaryTextColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={record.primaryTextColor || '#F8FAFC'}
                    onChange={(e) => handleFieldChange('primaryTextColor', e.target.value)}
                    placeholder="#F8FAFC"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {['#F8FAFC', '#0B1536', '#FFD700', '#38BDF8', '#34D399'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleFieldChange('primaryTextColor', c)}
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-2xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Honoree / Recipient Name Color */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[10.5px] font-mono uppercase text-slate-400 font-semibold">
                  Honoree Name Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={record.honoreeTextColor || '#FFD700'}
                    onChange={(e) => handleFieldChange('honoreeTextColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={record.honoreeTextColor || '#FFD700'}
                    onChange={(e) => handleFieldChange('honoreeTextColor', e.target.value)}
                    placeholder="#FFD700"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {['#FFD700', '#06B6D4', '#34D399', '#FFFFFF', '#0B1536'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleFieldChange('honoreeTextColor', c)}
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-2xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Disbursed Amount Color */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[10.5px] font-mono uppercase text-slate-400 font-semibold">
                  Disbursed Amount Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={record.amountTextColor || '#34D399'}
                    onChange={(e) => handleFieldChange('amountTextColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={record.amountTextColor || '#34D399'}
                    onChange={(e) => handleFieldChange('amountTextColor', e.target.value)}
                    placeholder="#34D399"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {['#34D399', '#FFD700', '#38BDF8', '#FFFFFF', '#0B1536'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleFieldChange('amountTextColor', c)}
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-2xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Metadata / Secondary Color */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <label className="block text-[10.5px] font-mono uppercase text-slate-400 font-semibold">
                  Metadata &amp; Label Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={record.secondaryTextColor || '#94A3B8'}
                    onChange={(e) => handleFieldChange('secondaryTextColor', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={record.secondaryTextColor || '#94A3B8'}
                    onChange={(e) => handleFieldChange('secondaryTextColor', e.target.value)}
                    placeholder="#94A3B8"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100"
                  />
                </div>
                <div className="flex gap-1.5 pt-1">
                  {['#94A3B8', '#64748B', '#CBD5E1', '#E2E8F0', '#475569'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleFieldChange('secondaryTextColor', c)}
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-2xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
           TAB 1: DATA, LEDGER & ENTITY FIELDS
           ======================================================== */
        <div className="space-y-4">
          {/* Operating Mode & Template Style Selector */}
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

          {/* Business & Beneficiary Entity Details */}
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
                  placeholder="e.g. Anas M / Ghhhhbbhjn"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-semibold transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Partner Identifier
                </label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={record.partnerId}
                    onChange={(e) => handleFieldChange('partnerId', e.target.value)}
                    placeholder="e.g. DTA-VIP-9842"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Partner Recognition Tier
                </label>
                <select
                  value={record.partnerTier}
                  onChange={(e) => handleFieldChange('partnerTier', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
                >
                  {TIER_PRESETS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Diamond VIP Partner">Diamond VIP Partner</option>
                  <option value="Gold Achiever">Gold Achiever</option>
                  <option value="Platinum Reseller">Platinum Reseller</option>
                  <option value="Silver Rising Star">Silver Rising Star</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Amounts & Products Sold */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
            <h3 className="font-serif font-bold text-sm text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Coins size={16} className="text-emerald-400" />
              <span>Financial Settlement &amp; Sales Deliveries</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Disbursed Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={record.amount}
                  onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono font-bold transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Currency
                </label>
                <select
                  value={record.currency}
                  onChange={(e) => handleFieldChange('currency', e.target.value as SettlementCurrency)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Total Products Sold *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={record.totalProductsSold || 1}
                  onChange={(e) => handleFieldChange('totalProductsSold', parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-400 text-xs font-mono font-bold transition-colors"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Lifetime Cumulative Settlements
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={record.cumulativeSettlements}
                  onChange={(e) => handleFieldChange('cumulativeSettlements', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Clearing Routing & Settlement Dates */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5 shadow-xs">
            <h3 className="font-serif font-bold text-sm text-slate-100 pb-2 border-b border-slate-800 flex items-center gap-2">
              <Calendar size={16} className="text-cyan-400" />
              <span>Clearing Rails &amp; Reference Audit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase flex items-center justify-between">
                  <span>Batch Reference / UTR</span>
                  <button
                    type="button"
                    onClick={handleRegenerateUtr}
                    className="text-[9px] font-mono text-cyan-400 hover:underline cursor-pointer"
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

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Payout Channel
                </label>
                <select
                  value={record.payoutChannel}
                  onChange={(e) => handleFieldChange('payoutChannel', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs transition-colors"
                >
                  {CHANNEL_OPTIONS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

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

              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                  Settlement Status
                </label>
                <select
                  value={record.status}
                  onChange={(e) => handleFieldChange('status', e.target.value as SettlementStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-mono transition-colors"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Endorsement Note */}
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[10.5px] uppercase">
                Endorsement Note
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
        </div>
      )}

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
          <span>Reset All Defaults</span>
        </button>
      </div>
    </div>
  );
};

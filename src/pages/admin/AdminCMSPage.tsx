import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { SiteSettings } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { Button } from '@/components/ui/Button';
import {
  Check,
  WhatsappLogo,
  EnvelopeSimple,
  Globe,
  ShieldCheck,
  ArrowSquareOut,
  Sparkle,
  Megaphone,
  ChatCircleDots,
  Copy,
  ArrowCounterClockwise,
  FloppyDisk,
  Eye,
} from '@phosphor-icons/react';

// Crisp Vector TikTok Icon
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.3 6.3 0 0 0 1.86-4.47V8.62a8.27 8.27 0 0 0 4.85 1.57v-3.5h-.93z" />
  </svg>
);

export const AdminCMSPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(() =>
    storage.get<SiteSettings>('SETTINGS', SITE_CONFIG)
  );

  const [brandName, setBrandName] = useState(settings.brandName || SITE_CONFIG.brandName);
  const [companyLegalName, setCompanyLegalName] = useState(settings.companyLegalName || SITE_CONFIG.companyLegalName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || SITE_CONFIG.supportEmail);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail || SITE_CONFIG.adminEmail || 'dreamtoachievers@gmail.com');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || SITE_CONFIG.whatsappNumber);
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || SITE_CONFIG.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers');
  const [whatsappChannelUrl, setWhatsappChannelUrl] = useState(settings.whatsappChannelUrl || SITE_CONFIG.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N');
  const [disclaimer, setDisclaimer] = useState(settings.disclaimerText || SITE_CONFIG.disclaimerText);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReset = () => {
    const current = storage.get<SiteSettings>('SETTINGS', SITE_CONFIG);
    setBrandName(current.brandName || SITE_CONFIG.brandName);
    setCompanyLegalName(current.companyLegalName || SITE_CONFIG.companyLegalName);
    setSupportEmail(current.supportEmail || SITE_CONFIG.supportEmail);
    setAdminEmail(current.adminEmail || SITE_CONFIG.adminEmail || 'dreamtoachievers@gmail.com');
    setWhatsappNumber(current.whatsappNumber || SITE_CONFIG.whatsappNumber);
    setTiktokUrl(current.tiktokUrl || SITE_CONFIG.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers');
    setWhatsappChannelUrl(current.whatsappChannelUrl || SITE_CONFIG.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N');
    setDisclaimer(current.disclaimerText || SITE_CONFIG.disclaimerText);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    setIsSubmitting(true);

    const newSettings: SiteSettings = {
      ...settings,
      brandName: brandName.trim(),
      companyLegalName: companyLegalName.trim(),
      supportEmail: supportEmail.trim(),
      adminEmail: adminEmail.trim(),
      whatsappNumber: whatsappNumber.trim(),
      tiktokUrl: tiktokUrl.trim(),
      whatsappChannelUrl: whatsappChannelUrl.trim(),
      disclaimerText: disclaimer.trim(),
    };

    setTimeout(() => {
      setSettings(newSettings);
      storage.set('SETTINGS', newSettings);

      auditService.logAction({
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        action: 'UPDATE_CMS_SETTINGS',
        entityType: 'settings',
        entityId: 'site-config',
        details: `Updated CMS channels (TikTok: ${tiktokUrl}, WhatsApp Channel: ${whatsappChannelUrl}, Support: ${supportEmail}).`,
      });

      setIsSubmitting(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }, 300);
  };

  return (
    <div className="space-y-5 font-sans max-w-5xl selection:bg-cyan-500/30">
      {/* 1. SaaS Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>Admin Console</span>
            <span>/</span>
            <span>Settings</span>
            <span>/</span>
            <span className="text-cyan-300 font-semibold">CMS & Social Integrations</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
              Platform & Social Media Settings
            </h1>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Sync</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage public-facing social channels, WhatsApp broadcasts, and official contact routing.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Preview Live Site</span>
            <ArrowSquareOut size={12} className="text-slate-400" />
          </a>

          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            variant="primary"
            size="sm"
            className="rounded-lg font-semibold text-xs shadow-md"
            iconLeft={saved ? <Check size={14} /> : <FloppyDisk size={14} />}
          >
            {isSubmitting ? 'Saving...' : saved ? 'Published Live' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check size={13} weight="bold" />
            </div>
            <span className="font-semibold text-xs">Platform settings published. Updates are live across all web sessions.</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80">Dispatched in real-time</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* 2. Official Social Media & Broadcast Channels Panel */}
        <div className="rounded-2xl bg-[#060B18] border border-white/[0.08] overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Sparkle size={15} weight="fill" />
              </div>
              <div>
                <h2 className="text-sm font-heading font-bold text-white">
                  Social Media & Community Channels
                </h2>
                <p className="text-[11px] text-slate-400">
                  Live URLs displayed on homepage, public footer, and contact directory.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/[0.06] p-2 sm:p-4 space-y-3 sm:space-y-0">
            {/* Row 1: TikTok Profile URL */}
            <div className="p-3 sm:p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/25 flex items-center justify-center">
                  <TikTokIcon size={16} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">TikTok Official Profile</span>
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">@dream.to.achievers</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:max-w-md">
                <input
                  type="url"
                  required
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@dream.to.achievers"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(tiktokUrl, 'tiktok')}
                  title="Copy URL"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'tiktok' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold inline-flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <span>Open</span>
                  <ArrowSquareOut size={12} />
                </a>
              </div>
            </div>

            {/* Row 2: WhatsApp VIP Channel URL */}
            <div className="p-3 sm:p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                  <Megaphone size={16} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">WhatsApp VIP Channel</span>
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Active Broadcast
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Restocks & Announcements</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:max-w-md">
                <input
                  type="url"
                  required
                  value={whatsappChannelUrl}
                  onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                  placeholder="https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(whatsappChannelUrl, 'whatsappChannel')}
                  title="Copy URL"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'whatsappChannel' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold inline-flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <span>Open</span>
                  <ArrowSquareOut size={12} />
                </a>
              </div>
            </div>

            {/* Row 3: Direct WhatsApp Help Desk */}
            <div className="p-3 sm:p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center">
                  <ChatCircleDots size={16} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Direct WhatsApp Help Desk</span>
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      1-on-1 Support
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Onboarding & Inquiries</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:max-w-md">
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+92 305 4511395"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(whatsappNumber, 'whatsappNumber')}
                  title="Copy Number"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'whatsappNumber' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold inline-flex items-center space-x-1 shrink-0 transition-colors"
                >
                  <span>Chat</span>
                  <ArrowSquareOut size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Official Email Communications & Routing Panel */}
        <div className="rounded-2xl bg-[#060B18] border border-white/[0.08] overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <EnvelopeSimple size={15} weight="fill" />
              </div>
              <div>
                <h2 className="text-sm font-heading font-bold text-white">
                  Email Communications & Notification Routing
                </h2>
                <p className="text-[11px] text-slate-400">
                  Recipient addresses for contact forms, bulk order inquiries, and audit events.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/[0.06] p-2 sm:p-4 space-y-3 sm:space-y-0">
            {/* Row 1: Support Email */}
            <div className="p-3 sm:p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Public Support & Inquiries Email</span>
                  <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Form Endpoint
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Receives customer messages from contact and checkout forms.</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:max-w-md">
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="dreamtoachievers@gmail.com"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(supportEmail, 'supportEmail')}
                  title="Copy Email"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'supportEmail' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Row 2: Admin Notification Email */}
            <div className="p-3 sm:p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Admin System Dispatch Email</span>
                  <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    System Alerts
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Receives order approvals and rank advancement alerts.</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:max-w-md">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="dreamtoachievers@gmail.com"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(adminEmail, 'adminEmail')}
                  title="Copy Email"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === 'adminEmail' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Brand & Legal Entity Metadata Panel */}
        <div className="rounded-2xl bg-[#060B18] border border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/[0.08]">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Globe size={15} weight="fill" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-white">
                Brand & Corporate Legal Entity
              </h2>
              <p className="text-[11px] text-slate-400">
                Official entity name and registered branding across legal disclosures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold text-[11px]">
                Public Brand Name
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Dream to Achievers"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold text-[11px]">
                Registered Company Legal Entity
              </label>
              <input
                type="text"
                required
                value={companyLegalName}
                onChange={(e) => setCompanyLegalName(e.target.value)}
                placeholder="Dream to Achievers Global Network (Pvt) Ltd"
                className="w-full px-3 py-2 rounded-lg bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 5. Statutory Earnings Disclaimer Notice Panel */}
        <div className="rounded-2xl bg-[#060B18] border border-white/[0.08] p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <ShieldCheck size={15} weight="fill" />
              </div>
              <div>
                <h2 className="text-sm font-heading font-bold text-white">
                  Statutory Earnings Disclaimer
                </h2>
                <p className="text-[11px] text-slate-400">
                  Published in the public footer, partner terms, and risk disclosures.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDisclaimer(SITE_CONFIG.disclaimerText)}
              className="text-[10px] font-mono text-cyan-300 hover:underline flex items-center space-x-1"
            >
              <ArrowCounterClockwise size={12} />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={3}
              required
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#030712] border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-400 transition-all resize-none font-mono"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Required for regulatory and platform transparency compliance.</span>
              <span>{disclaimer.length} characters</span>
            </div>
          </div>
        </div>

        {/* 6. Form Submit Footer Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium flex items-center space-x-1.5 cursor-pointer"
          >
            <ArrowCounterClockwise size={13} />
            <span>Discard Unsaved Changes</span>
          </button>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            size="md"
            className="rounded-lg font-bold px-6 text-xs shadow-md"
            iconLeft={saved ? <Check size={14} /> : <FloppyDisk size={14} />}
          >
            {isSubmitting ? 'Saving...' : saved ? 'Changes Published Live' : 'Save & Publish Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

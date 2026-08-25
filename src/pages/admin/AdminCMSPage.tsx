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
} from '@phosphor-icons/react';

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
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

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

    setSettings(newSettings);
    storage.set('SETTINGS', newSettings);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'UPDATE_CMS_SETTINGS',
      entityType: 'settings',
      entityId: 'site-config',
      details: `Updated social media links (TikTok: ${tiktokUrl}, WhatsApp Channel: ${whatsappChannelUrl}) and official emails.`,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl selection:bg-cyan-500/30">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span>ADMINISTRATION</span>
          <span>•</span>
          <span className="text-cyan-400">CMS & SOCIAL NETWORK SETTINGS</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
          Platform & Social Media Management
        </h1>
        <p className="text-xs text-slate-300">
          Manage all public-facing social media channels, WhatsApp broadcast links, and official support addresses in real-time.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2.5 animate-in fade-in duration-300 shadow-lg">
          <Check size={18} weight="bold" className="text-emerald-400 shrink-0" />
          <span className="font-semibold">All social media channels and platform settings updated and published live across the site!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Social Media & Broadcast Channels */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#080E1E] border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/[0.08]">
            <Sparkle size={18} weight="fill" className="text-cyan-400" />
            <h2 className="text-base font-heading font-bold text-white">
              Official Social Media & Community Channels
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            {/* TikTok Channel URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-semibold flex items-center space-x-1.5">
                  <span className="text-rose-400">TikTok Profile URL</span>
                  <span className="text-[10px] text-slate-400 font-mono">(Displayed on Homepage, Footer & Contact)</span>
                </label>
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-rose-300 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Test Link</span>
                    <ArrowSquareOut size={12} />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://www.tiktok.com/@dream.to.achievers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                />
              </div>
            </div>

            {/* WhatsApp Channel URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-200 font-semibold flex items-center space-x-1.5">
                  <span className="text-emerald-400">WhatsApp VIP Channel URL</span>
                  <span className="text-[10px] text-slate-400 font-mono">(Direct Broadcast Link)</span>
                </label>
                {whatsappChannelUrl && (
                  <a
                    href={whatsappChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-300 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Test Broadcast</span>
                    <ArrowSquareOut size={12} />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={whatsappChannelUrl}
                  onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                  placeholder="https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                />
              </div>
            </div>

            {/* Direct WhatsApp Help Desk Number */}
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-semibold">
                Direct WhatsApp Help Desk Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+92 305 4511395"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Official Support & Admin Email Addresses */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#080E1E] border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/[0.08]">
            <EnvelopeSimple size={18} weight="fill" className="text-cyan-400" />
            <h2 className="text-base font-heading font-bold text-white">
              Official Email Communications & Routing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-slate-200 font-semibold">
                Support & Contact Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="dreamtoachievers@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-200 font-semibold">
                Admin Notification Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="dreamtoachievers@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Brand & Legal Metadata */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#080E1E] border border-white/[0.08] space-y-5 shadow-xl">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/[0.08]">
            <Globe size={18} weight="fill" className="text-cyan-400" />
            <h2 className="text-base font-heading font-bold text-white">
              Brand Identity & Statutory Disclaimer
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Public Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Dream to Achievers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-200 font-semibold">Company Legal Entity</label>
                <input
                  type="text"
                  required
                  value={companyLegalName}
                  onChange={(e) => setCompanyLegalName(e.target.value)}
                  placeholder="Dream to Achievers Global Network (Pvt) Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-200 font-semibold">
                Statutory Earnings Disclaimer Text
              </label>
              <textarea
                rows={3}
                required
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white focus:outline-none focus:border-cyan-400 transition-all text-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="rounded-xl font-bold px-7 shadow-lg"
          >
            Publish Live Updates
          </Button>

          <p className="text-[11px] text-slate-400 flex items-center space-x-1">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Admin changes sync instantly across all pages and sessions.</span>
          </p>
        </div>
      </form>
    </div>
  );
};

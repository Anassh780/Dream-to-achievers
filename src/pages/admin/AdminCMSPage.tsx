import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { SiteSettings } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { Button } from '@/components/ui/Button';
import {
  YouTubeIcon,
  XIcon,
  InstagramIcon,
  LinkedInIcon,
  ThreadsIcon,
  FacebookIcon,
  TikTokIcon,
  WhatsAppIcon,
  SocialChannelsBar,
} from '@/components/ui/SocialIcons';
import {
  Check,
  WhatsappLogo,
  EnvelopeSimple,
  Globe,
  FloppyDisk,
  ArrowCounterClockwise,
  ShareNetwork,
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
  const [whatsappChannelUrl, setWhatsappChannelUrl] = useState(settings.whatsappChannelUrl || SITE_CONFIG.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N');
  
  // 7 Official Social Media Handles
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || SITE_CONFIG.youtubeUrl || 'https://youtube.com/@dreamtoachievers');
  const [xUrl, setXUrl] = useState(settings.xUrl || SITE_CONFIG.xUrl || 'https://x.com/dreamtoachiever');
  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || SITE_CONFIG.instagramUrl || 'https://instagram.com/dreamtoachievers');
  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl || SITE_CONFIG.linkedinUrl || 'https://linkedin.com/company/dream-to-achievers');
  const [threadsUrl, setThreadsUrl] = useState(settings.threadsUrl || SITE_CONFIG.threadsUrl || 'https://threads.net/@dreamtoachievers');
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || SITE_CONFIG.facebookUrl || 'https://facebook.com/dreamtoachievers');
  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || SITE_CONFIG.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers');

  const [disclaimer, setDisclaimer] = useState(settings.disclaimerText || SITE_CONFIG.disclaimerText);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    const current = storage.get<SiteSettings>('SETTINGS', SITE_CONFIG);
    setBrandName(current.brandName || SITE_CONFIG.brandName);
    setCompanyLegalName(current.companyLegalName || SITE_CONFIG.companyLegalName);
    setSupportEmail(current.supportEmail || SITE_CONFIG.supportEmail);
    setAdminEmail(current.adminEmail || SITE_CONFIG.adminEmail || 'dreamtoachievers@gmail.com');
    setWhatsappNumber(current.whatsappNumber || SITE_CONFIG.whatsappNumber);
    setWhatsappChannelUrl(current.whatsappChannelUrl || SITE_CONFIG.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N');
    setYoutubeUrl(current.youtubeUrl || SITE_CONFIG.youtubeUrl || 'https://youtube.com/@dreamtoachievers');
    setXUrl(current.xUrl || SITE_CONFIG.xUrl || 'https://x.com/dreamtoachiever');
    setInstagramUrl(current.instagramUrl || SITE_CONFIG.instagramUrl || 'https://instagram.com/dreamtoachievers');
    setLinkedinUrl(current.linkedinUrl || SITE_CONFIG.linkedinUrl || 'https://linkedin.com/company/dream-to-achievers');
    setThreadsUrl(current.threadsUrl || SITE_CONFIG.threadsUrl || 'https://threads.net/@dreamtoachievers');
    setFacebookUrl(current.facebookUrl || SITE_CONFIG.facebookUrl || 'https://facebook.com/dreamtoachievers');
    setTiktokUrl(current.tiktokUrl || SITE_CONFIG.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers');
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
      whatsappChannelUrl: whatsappChannelUrl.trim(),
      youtubeUrl: youtubeUrl.trim(),
      xUrl: xUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      threadsUrl: threadsUrl.trim(),
      facebookUrl: facebookUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),
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
        entityId: 'global-settings',
        details: `Updated platform CMS settings, support emails, and 7 official social handles.`,
      });

      setIsSubmitting(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>System Settings</span>
            <span>/</span>
            <span>Brand &amp; Social Links</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F] tracking-tight">
            Website Branding &amp; Social Channels
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Manage platform contact information, WhatsApp support number, and official social media handles.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            iconLeft={<ArrowCounterClockwise size={13} />}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="cms-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            iconLeft={<FloppyDisk size={14} />}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in shadow-xs">
          <Check size={16} weight="bold" />
          <span className="font-semibold">Platform settings saved and applied to entire website in real time.</span>
        </div>
      )}

      {/* Main CMS Form */}
      <form id="cms-form" onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Brand & Corporate Identity Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[#1E241F] pb-2 border-b border-[#E3DCC8]">
            Brand &amp; Legal Entity Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Public Brand Name</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Company Legal Registered Entity</label>
              <input
                type="text"
                required
                value={companyLegalName}
                onChange={(e) => setCompanyLegalName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>
          </div>
        </div>

        {/* 7 Official Social Media Handles Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E3DCC8]">
            <div>
              <h3 className="font-serif font-medium text-base text-[#1E241F] flex items-center gap-2">
                <ShareNetwork size={18} className="text-[#1F4D3E]" />
                <span>Official Social Media Handles (Admin Controlled)</span>
              </h3>
              <p className="text-[11.5px] text-[#5B5C50]">
                Changes here immediately update the footer, about page, and contact desks across all platforms.
              </p>
            </div>
            <div className="pt-1 sm:pt-0">
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#FAF7EF] text-[#1F4D3E] border border-[#E3DCC8]">
                7 Channels + WhatsApp Desk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. YouTube */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <YouTubeIcon size={15} className="text-[#FF0000]" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 2. X (Twitter) */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <XIcon size={14} className="text-[#1E241F]" />
                <span>X (formerly Twitter) Profile URL</span>
              </label>
              <input
                type="url"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                placeholder="https://x.com/dreamtoachiever"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 3. Instagram */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <InstagramIcon size={15} className="text-[#E4405F]" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 4. LinkedIn */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <LinkedInIcon size={15} className="text-[#0A66C2]" />
                <span>LinkedIn Company / Profile URL</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/dream-to-achievers"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 5. Threads */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <ThreadsIcon size={15} className="text-[#1E241F]" />
                <span>Threads Profile URL</span>
              </label>
              <input
                type="url"
                value={threadsUrl}
                onChange={(e) => setThreadsUrl(e.target.value)}
                placeholder="https://threads.net/@dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 6. Facebook */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <FacebookIcon size={15} className="text-[#1877F2]" />
                <span>Facebook Page URL</span>
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 7. TikTok */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <TikTokIcon size={15} className="text-[#FE2C55]" />
                <span>TikTok Channel URL</span>
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@dream.to.achievers"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>

            {/* 8. WhatsApp Channel */}
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium flex items-center gap-1.5">
                <WhatsAppIcon size={15} className="text-[#25D366]" />
                <span>WhatsApp Community Channel URL</span>
              </label>
              <input
                type="url"
                value={whatsappChannelUrl}
                onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                placeholder="https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono text-xs focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>
          </div>

          {/* Live Preview Strip */}
          <div className="pt-3 border-t border-[#E3DCC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-[#5B5C50]">Live Preview on Website:</span>
            <SocialChannelsBar size={16} />
          </div>
        </div>

        {/* Official Email & Support Desk Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[#1E241F] pb-2 border-b border-[#E3DCC8]">
            Official Support Desk &amp; Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Support Desk Email</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">Super Admin Alert Email</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">WhatsApp Support Phone</label>
              <div className="relative">
                <WhatsappLogo size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C7D70]" />
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Disclaimers Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[#1E241F] pb-2 border-b border-[#E3DCC8]">
            Statutory Legal Disclaimers
          </h3>

          <div>
            <label className="block text-[#5B5C50] mb-1 font-medium">Earnings &amp; Product Representation Notice</label>
            <textarea
              rows={3}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
            />
          </div>
        </div>

      </form>

    </div>
  );
};

export default AdminCMSPage;

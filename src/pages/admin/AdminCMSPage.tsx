import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { SiteSettings } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
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
  VideoCamera,
  ArrowRight,
} from '@phosphor-icons/react';

export const AdminCMSPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { success: toastSuccess, info: toastInfo } = useToast();
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
    toastInfo('CMS configurations reset to saved defaults.');
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
      toastSuccess('Platform branding & social links updated successfully.');
      setTimeout(() => setSaved(false), 3500);
    }, 300);
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
            <span>System Settings</span>
            <span>/</span>
            <span>Brand &amp; Social Links</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[var(--ink)] tracking-tight">
            Website Branding &amp; Social Channels
          </h1>
          <p className="text-xs text-[var(--ink-soft)]">
            Manage platform contact information, WhatsApp support number, and official social media handles.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            iconLeft={<ArrowCounterClockwise size={13} />}
            className="w-full"
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
            className="w-full"
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--primary-dark)] text-xs flex items-center space-x-2 animate-in fade-in shadow-xs">
          <Check size={16} weight="bold" />
          <span className="font-semibold">Platform settings saved and applied to entire website in real time.</span>
        </div>
      )}

      {/* Quick Link Card to Video Tutorials Management */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#D9C08A]/10 via-white/[0.02] to-transparent border border-[#D9C08A]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D9C08A]/15 border border-[#D9C08A]/30 flex items-center justify-center text-[#D9C08A] shrink-0">
            <VideoCamera size={20} weight="fill" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#F4F7F5]">
              Video Tutorials &amp; Academy Library
            </h3>
            <p className="text-xs text-[#9EABA2]">
              Add, embed, and manage video guides (YouTube, Vimeo, Loom, Drive, Direct MP4, or iframe codes).
            </p>
          </div>
        </div>
        <Link to="/admin/tutorials" className="shrink-0">
          <Button variant="champagne" size="sm" className="text-xs font-medium shadow-sm w-full sm:w-auto" iconRight={<ArrowRight size={13} />}>
            Manage Video Tutorials
          </Button>
        </Link>
      </div>

      {/* Main CMS Form */}
      <form id="cms-form" onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Brand & Corporate Identity Card */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[var(--ink)] pb-2 border-b border-[var(--line)]">
            Brand &amp; Legal Entity Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Public Brand Name</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Company Legal Registered Entity</label>
              <input
                type="text"
                required
                value={companyLegalName}
                onChange={(e) => setCompanyLegalName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
        </div>

        {/* 7 Official Social Media Handles Card */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--line)]">
            <div>
              <h3 className="font-serif font-medium text-base text-[var(--ink)] flex items-center gap-2">
                <ShareNetwork size={18} className="text-[var(--primary-dark)]" />
                <span>Official Social Media Handles (Admin Controlled)</span>
              </h3>
              <p className="text-[11.5px] text-[var(--ink-soft)]">
                Changes here immediately update the footer, about page, and contact desks across all platforms.
              </p>
            </div>
            <div className="pt-1 sm:pt-0">
              <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--primary-dark)] border border-[var(--line)]">
                7 Channels + WhatsApp Desk
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. YouTube */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <YouTubeIcon size={15} className="text-[var(--ink-soft)]" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/@dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 2. X (Twitter) */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <XIcon size={14} className="text-[var(--ink)]" />
                <span>X (formerly Twitter) Profile URL</span>
              </label>
              <input
                type="url"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                placeholder="https://x.com/dreamtoachiever"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 3. Instagram */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <InstagramIcon size={15} className="text-[var(--ink-soft)]" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 4. LinkedIn */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <LinkedInIcon size={15} className="text-[var(--ink-soft)]" />
                <span>LinkedIn Company / Profile URL</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/company/dream-to-achievers"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 5. Threads */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <ThreadsIcon size={15} className="text-[var(--ink)]" />
                <span>Threads Profile URL</span>
              </label>
              <input
                type="url"
                value={threadsUrl}
                onChange={(e) => setThreadsUrl(e.target.value)}
                placeholder="https://threads.net/@dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 6. Facebook */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <FacebookIcon size={15} className="text-[var(--ink-soft)]" />
                <span>Facebook Page URL</span>
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/dreamtoachievers"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 7. TikTok */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <TikTokIcon size={15} className="text-[var(--ink-soft)]" />
                <span>TikTok Channel URL</span>
              </label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@dream.to.achievers"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            {/* 8. WhatsApp Channel */}
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium flex items-center gap-1.5">
                <WhatsAppIcon size={15} className="text-[var(--primary)]" />
                <span>WhatsApp Community Channel URL</span>
              </label>
              <input
                type="url"
                value={whatsappChannelUrl}
                onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                placeholder="https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"
                className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono text-xs focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Live Preview Strip */}
          <div className="pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-[var(--ink-soft)]">Live Preview on Website:</span>
            <SocialChannelsBar size={16} />
          </div>
        </div>

        {/* Official Email & Support Desk Card */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[var(--ink)] pb-2 border-b border-[var(--line)]">
            Official Support Desk &amp; Communications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Support Desk Email</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="email"
                  required
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">Super Admin Alert Email</label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--ink-soft)] mb-1 font-medium">WhatsApp Support Phone</label>
              <div className="relative">
                <WhatsappLogo size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Disclaimers Card */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[var(--ink)] pb-2 border-b border-[var(--line)]">
            Statutory Legal Disclaimers
          </h3>

          <div>
            <label className="block text-[var(--ink-soft)] mb-1 font-medium">Earnings &amp; Product Representation Notice</label>
            <textarea
              rows={3}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

      </form>

    </div>
  );
};

export default AdminCMSPage;

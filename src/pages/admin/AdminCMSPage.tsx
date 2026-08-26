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
  FloppyDisk,
  ArrowCounterClockwise,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        entityId: 'global-settings',
        details: `Updated platform CMS settings, official support emails, and social desk links.`,
      });

      setIsSubmitting(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>System</span>
            <span>/</span>
            <span>CMS &amp; Brand Settings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F] tracking-tight">
            Platform Brand Configuration &amp; Contact Desks
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Manage platform identity, official support desks, WhatsApp numbers, and statutory disclaimers.
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
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
          <Check size={16} weight="bold" />
          <span className="font-semibold">Platform settings saved and applied to entire website.</span>
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

        {/* Official Channels & Contact Desks Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <h3 className="font-serif font-medium text-base text-[#1E241F] pb-2 border-b border-[#E3DCC8]">
            Official Support &amp; Communication Desks
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-[#5B5C50] mb-1 font-medium">Super Admin Notification Email</label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">WhatsApp Help Desk Number</label>
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

            <div>
              <label className="block text-[#5B5C50] mb-1 font-medium">WhatsApp Community Channel URL</label>
              <input
                type="url"
                value={whatsappChannelUrl}
                onChange={(e) => setWhatsappChannelUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#5B5C50] mb-1 font-medium">Official TikTok Channel URL</label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
            />
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

import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { SiteSettings } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Check } from '@phosphor-icons/react';

export const AdminCMSPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(storage.get<SiteSettings>('SETTINGS', SITE_CONFIG));
  const [brandName, setBrandName] = useState(settings.brandName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [disclaimer, setDisclaimer] = useState(settings.disclaimerText);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAdmin) return;

    const newSettings: SiteSettings = {
      ...settings,
      brandName,
      supportEmail,
      whatsappNumber,
      disclaimerText: disclaimer,
    };

    setSettings(newSettings);
    storage.set('SETTINGS', newSettings);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'UPDATE_CMS_SETTINGS',
      entityType: 'settings',
      entityId: 'site-config',
      details: 'Updated global site brand metadata and contact channels.',
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Admin</span>
          <span>•</span>
          <span>CMS & Communications</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Platform Settings
        </h1>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#4ADE80] text-xs flex items-center space-x-2">
          <Check size={16} weight="bold" />
          <span>CMS settings updated successfully!</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-4">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#CBD5E1] mb-1 font-medium">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[#CBD5E1] mb-1 font-medium">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-[#CBD5E1] mb-1 font-medium">WhatsApp Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#CBD5E1] mb-1 font-medium">Earnings Disclaimer Notice</label>
            <textarea
              rows={4}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6] resize-none"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types';
import { SITE_CONFIG } from '@/config/site';
import { storage } from '@/services/storage';

export const useSiteSettings = (): SiteSettings => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    return storage.get<SiteSettings>('SETTINGS', SITE_CONFIG);
  });

  useEffect(() => {
    const handleStorageChange = (e: any) => {
      if (e?.detail?.key === 'SETTINGS') {
        setSettings(e.detail.value || SITE_CONFIG);
      }
    };
    window.addEventListener('dta_storage_change', handleStorageChange);
    return () => window.removeEventListener('dta_storage_change', handleStorageChange);
  }, []);

  return settings;
};

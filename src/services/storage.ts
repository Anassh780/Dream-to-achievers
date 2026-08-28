import {
  User,
  RankDefinition,
  Product,
  Sale,
  ReferralRecord,
  Reward,
  RankHistoryEntry,
  AppNotification,
  AdminAuditLog,
  SiteSettings,
} from '@/types';
import { CANONICAL_RANKS } from '@/config/ranks';
import { SEED_PRODUCTS } from '@/config/products';
import { SEED_CATEGORIES } from '@/config/categories';
import { SITE_CONFIG } from '@/config/site';

const STORAGE_KEYS = {
  USERS: 'dta_users',
  CURRENT_USER_ID: 'dta_current_user_id',
  CURRENT_USER_DATA: 'dta_current_user_data',
  RANKS: 'dta_ranks',
  PRODUCTS: 'dta_products',
  CATEGORIES: 'dta_categories',
  SALES: 'dta_sales',
  REFERRALS: 'dta_referrals',
  REWARDS: 'dta_rewards',
  RANK_HISTORY: 'dta_rank_history',
  NOTIFICATIONS: 'dta_notifications',
  AUDIT_LOGS: 'dta_audit_logs',
  SETTINGS: 'dta_settings',
  CAPTURED_REF: 'dta_captured_ref',
};

export const storage = {
  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RANKS)) {
      localStorage.setItem(STORAGE_KEYS.RANKS, JSON.stringify(CANONICAL_RANKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REFERRALS)) {
      localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REWARDS)) {
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RANK_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.RANK_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SITE_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
  },

  get<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key, value } }));
    } catch (err) {
      console.error(`Error saving to storage key ${key}:`, err);
    }
  },

  getRaw(key: keyof typeof STORAGE_KEYS): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS[key]);
  },

  setRaw(key: keyof typeof STORAGE_KEYS, val: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS[key], val);
  },

  remove(key: keyof typeof STORAGE_KEYS): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS[key]);
  },

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.init();
  }
};

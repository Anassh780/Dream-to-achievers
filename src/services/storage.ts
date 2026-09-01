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
  WITHDRAWALS: 'dta_withdrawals',
  PAYMENT_METHODS: 'dta_payment_methods',
  RANK_HISTORY: 'dta_rank_history',
  NOTIFICATIONS: 'dta_notifications',
  AUDIT_LOGS: 'dta_audit_logs',
  SETTINGS: 'dta_settings',
  CAPTURED_REF: 'dta_captured_ref',
  DELETED_PRODUCTS: 'dta_deleted_products',
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
    if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify([]));
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
      if (!item) {
        if (key === 'PRODUCTS') return SEED_PRODUCTS as unknown as T;
        return defaultValue;
      }
      const parsed = JSON.parse(item);
      if (key === 'PRODUCTS' && Array.isArray(parsed) && parsed.length === 0) {
        return SEED_PRODUCTS as unknown as T;
      }
      return parsed;
    } catch {
      if (key === 'PRODUCTS') return SEED_PRODUCTS as unknown as T;
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

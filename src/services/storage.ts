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
  DELETED_USERS_SET: 'dta_deleted_users_set',
};

const cloudDataKeys = new Set<keyof typeof STORAGE_KEYS>([
  'USERS', 'PRODUCTS', 'CATEGORIES', 'SALES', 'REFERRALS', 'REWARDS',
  'WITHDRAWALS', 'PAYMENT_METHODS', 'RANK_HISTORY', 'NOTIFICATIONS', 'AUDIT_LOGS',
  'DELETED_PRODUCTS',
]);
const memoryData = new Map<keyof typeof STORAGE_KEYS, unknown>();

export const storage = {
  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.RANKS)) {
      localStorage.setItem(STORAGE_KEYS.RANKS, JSON.stringify(CANONICAL_RANKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SITE_CONFIG));
    }
    cloudDataKeys.forEach(key => localStorage.removeItem(STORAGE_KEYS[key]));
  },

  get<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      if (cloudDataKeys.has(key)) return (memoryData.get(key) as T | undefined) ?? defaultValue;
      const item = localStorage.getItem(STORAGE_KEYS[key]);
      if (!item) return defaultValue;
      const parsed = JSON.parse(item);
      return parsed;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: keyof typeof STORAGE_KEYS, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      if (cloudDataKeys.has(key)) memoryData.set(key, value);
      else localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
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

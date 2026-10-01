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
  VideoTutorial,
} from '@/types';
import { CANONICAL_RANKS } from '@/config/ranks';
import { SITE_CONFIG } from '@/config/site';
import { INITIAL_TUTORIALS } from '@/config/tutorials';

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
  TUTORIALS: 'dta_tutorials',
};

const cloudDataKeys = new Set<keyof typeof STORAGE_KEYS>([
  'USERS', 'PRODUCTS', 'CATEGORIES', 'SALES', 'REFERRALS', 'REWARDS',
  'WITHDRAWALS', 'PAYMENT_METHODS', 'RANK_HISTORY', 'NOTIFICATIONS', 'AUDIT_LOGS',
  'DELETED_PRODUCTS', 'TUTORIALS',
]);
const memoryData = new Map<keyof typeof STORAGE_KEYS, unknown>();

const syncChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('dta_cross_tab_sync')
    : null;

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    const data = event.data;
    if (!data) return;
    if (data.type === 'storage_change' && data.key) {
      if (cloudDataKeys.has(data.key)) {
        memoryData.set(data.key, data.value);
      }
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: data.key, value: data.value } }));
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
    } else if (data.type === 'storage_remove' && data.key) {
      memoryData.delete(data.key);
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: data.key } }));
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
    } else if (data.type === 'badge_update') {
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key) {
      memoryData.clear();
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: {} }));
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
      return;
    }
    const matched = Object.entries(STORAGE_KEYS).find(([, rawVal]) => rawVal === event.key);
    if (matched) {
      const storageKey = matched[0] as keyof typeof STORAGE_KEYS;
      if (event.newValue === null) {
        memoryData.delete(storageKey);
      } else {
        try {
          const parsed = JSON.parse(event.newValue);
          if (cloudDataKeys.has(storageKey)) {
            memoryData.set(storageKey, parsed);
          }
        } catch {
          memoryData.delete(storageKey);
        }
      }
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: storageKey } }));
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
    }
    if (event.key.startsWith('dta_badge_')) {
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
    }
  });
}

export const storage = {
  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.RANKS)) {
      localStorage.setItem(STORAGE_KEYS.RANKS, JSON.stringify(CANONICAL_RANKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SITE_CONFIG));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TUTORIALS)) {
      localStorage.setItem(STORAGE_KEYS.TUTORIALS, JSON.stringify(INITIAL_TUTORIALS));
    }
    // Cloud-backed data is also cached locally. Firestore remains the source of
    // truth, while the cache prevents a blank UI during startup/offline periods.
    cloudDataKeys.forEach((key) => {
      const cached = localStorage.getItem(STORAGE_KEYS[key]);
      if (!cached) return;
      try {
        memoryData.set(key, JSON.parse(cached));
      } catch {
        localStorage.removeItem(STORAGE_KEYS[key]);
      }
    });
  },

  get<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      if (cloudDataKeys.has(key)) {
        const memoryValue = memoryData.get(key) as T | undefined;
        if (memoryValue !== undefined) return memoryValue;
      }
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
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key, value } }));
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
      syncChannel?.postMessage({ type: 'storage_change', key, value });
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
    syncChannel?.postMessage({ type: 'storage_change', key, value: val });
  },

  remove(key: keyof typeof STORAGE_KEYS): void {
    if (typeof window === 'undefined') return;
    memoryData.delete(key);
    localStorage.removeItem(STORAGE_KEYS[key]);
    window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key } }));
    window.dispatchEvent(new CustomEvent('dta_badge_update'));
    syncChannel?.postMessage({ type: 'storage_remove', key });
  },

  broadcastBadgeUpdate(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('dta_badge_update'));
    syncChannel?.postMessage({ type: 'badge_update' });
  },

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    memoryData.clear();
    this.init();
    syncChannel?.postMessage({ type: 'badge_update' });
  }
};

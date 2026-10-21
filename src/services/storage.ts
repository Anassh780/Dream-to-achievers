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
  FEEDBACKS: 'dta_feedbacks',
  SUPPORT_TICKETS: 'dta_support_tickets',
  SETTLEMENT_CERTIFICATES: 'dta_settlement_certificates',
};

const cloudDataKeys = new Set<keyof typeof STORAGE_KEYS>([
  'USERS', 'PRODUCTS', 'CATEGORIES', 'SALES', 'REFERRALS', 'REWARDS',
  'WITHDRAWALS', 'PAYMENT_METHODS', 'RANK_HISTORY', 'NOTIFICATIONS', 'AUDIT_LOGS',
  'DELETED_PRODUCTS', 'TUTORIALS', 'FEEDBACKS', 'SUPPORT_TICKETS', 'SETTLEMENT_CERTIFICATES',
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

// Built-in IndexedDB Persistence Engine (Gigabytes capacity, no 5MB limit)
const DB_NAME = 'dta_client_db';
const DB_VERSION = 1;
const STORE_NAME = 'key_values';

function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e: any) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openIndexedDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet<T>(key: string, value: T): Promise<boolean> {
  const db = await openIndexedDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function idbRemove(key: string): Promise<boolean> {
  const db = await openIndexedDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
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
    } else {
      // Purge any legacy demo/mock tutorials from previous sessions
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.TUTORIALS);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const sanitized = list.filter(
              (item: any) =>
                !['tut-1', 'tut-2', 'tut-3'].includes(item.id) &&
                !item.rawInput?.includes('dQw4w9WgXcQ') &&
                !item.rawInput?.includes('L_LUpnjgPso') &&
                !item.rawInput?.includes('kJQP7kiw5Fk')
            );
            if (sanitized.length !== list.length) {
              localStorage.setItem(STORAGE_KEYS.TUTORIALS, JSON.stringify(sanitized));
            }
          }
        }
      } catch {
        // ignore parse error
      }
    }
    // 1. Synchronously populate memory cache from localStorage for 0ms initial render
    cloudDataKeys.forEach((key) => {
      const cached = localStorage.getItem(STORAGE_KEYS[key]);
      if (!cached) return;
      try {
        memoryData.set(key, JSON.parse(cached));
      } catch {
        localStorage.removeItem(STORAGE_KEYS[key]);
      }
    });

    // 2. Asynchronously hydrate from IndexedDB (restores high-fidelity full products with zero quota limits)
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      cloudDataKeys.forEach(async (key) => {
        try {
          const idbValue = await idbGet<any>(STORAGE_KEYS[key]);
          if (idbValue !== null && idbValue !== undefined) {
            memoryData.set(key, idbValue);
            if (key === 'PRODUCTS' && Array.isArray(idbValue) && idbValue.length > 0) {
              window.dispatchEvent(new CustomEvent('dta_products_update', { detail: idbValue }));
            }
          }
        } catch {}
      });
    }
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

      // 1. Asynchronously persist to IndexedDB (Gigabytes capacity, no 5MB quota limit)
      idbSet(STORAGE_KEYS[key], value).catch(() => {});

      // 2. Attempt to persist to localStorage safely
      try {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
      } catch (storageErr: any) {
        console.warn(`[Storage] Failed to persist ${key} to localStorage:`, storageErr?.message || storageErr);
        if (key === 'PRODUCTS' && Array.isArray(value)) {
          // If quota exceeded, cache a slim version in localStorage (strip heavy inline base64 images > 20KB)
          // while keeping full-fidelity products in memoryData and IndexedDB for the active session
          try {
            const isHeavyDataUri = (url?: string) => typeof url === 'string' && url.startsWith('data:image/') && url.length > 20480;
            const slimProducts = (value as any[]).map((p) => ({
              ...p,
              imageUrl: isHeavyDataUri(p.imageUrl) ? '' : p.imageUrl,
              images: Array.isArray(p.images) ? p.images.map((img: string) => (isHeavyDataUri(img) ? '' : img)).filter(Boolean) : [],
            }));
            localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(slimProducts));
          } catch {
            // If even slim products fail, remove key so stale products never overwrite live data on restart
            try { localStorage.removeItem(STORAGE_KEYS[key]); } catch {}
          }
        }
      }

      // 3. Always fire window events and broadcast channel so UI reactivity is never blocked by localStorage limits
      try {
        window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key, value } }));
        window.dispatchEvent(new CustomEvent('dta_badge_update'));
        syncChannel?.postMessage({ type: 'storage_change', key, value });
      } catch (eventErr) {
        console.warn(`[Storage] Failed to dispatch storage event for ${key}:`, eventErr);
      }
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
    idbSet(STORAGE_KEYS[key], val).catch(() => {});
    syncChannel?.postMessage({ type: 'storage_change', key, value: val });
  },

  remove(key: keyof typeof STORAGE_KEYS): void {
    if (typeof window === 'undefined') return;
    memoryData.delete(key);
    localStorage.removeItem(STORAGE_KEYS[key]);
    idbRemove(STORAGE_KEYS[key]).catch(() => {});
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
    Object.values(STORAGE_KEYS).forEach((k) => {
      localStorage.removeItem(k);
      idbRemove(k).catch(() => {});
    });
    memoryData.clear();
    this.init();
    syncChannel?.postMessage({ type: 'badge_update' });
  }
};

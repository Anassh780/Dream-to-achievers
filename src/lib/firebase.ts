import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

/**
 * Firebase web configuration is safe to ship to browsers. Environment variables
 * can override these deployment defaults without making the production bundle
 * depend on Vercel environment setup.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD8XpLrFfjXTHafqTbhsZ9ts3XpIBZutak',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'uc-store-b5265.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://uc-store-b5265-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'uc-store-b5265',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'uc-store-b5265.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '391296623869',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || '1:391296623869:web:500cee5c46badef7c9ca94',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-R0RV5YV022',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Explicitly ensure session persistence is locked to browserLocalPersistence
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err: any) => {
    console.warn('Firebase setPersistence error:', err);
  });
}

// Several domain models contain optional properties. Ignoring undefined values
// keeps valid documents from being rejected when an optional field is omitted.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const rtdb = getDatabase(app);
export const storageBucket = getStorage(app);

// Analytics requires browser APIs and is unavailable during SSR/prerendering.
// `isSupported` also avoids errors in privacy-restricted browser environments.
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported && firebaseConfig.measurementId) analytics = getAnalytics(app);
    })
    .catch(() => {
      analytics = null;
    });
}

export default app;

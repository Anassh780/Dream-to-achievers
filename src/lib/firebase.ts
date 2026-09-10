import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

/**
 * Firebase project credentials are supplied by the deployment environment.
 * Copy `.env.example` to `.env.local` when connecting the replacement project.
 * Never commit real Firebase configuration values to this repository.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Explicitly ensure session persistence is locked to browserLocalPersistence
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err: any) => {
    console.warn('Firebase setPersistence error:', err);
  });
}

export const db = getFirestore(app);
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

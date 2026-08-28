import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAre3vM0YJW9ak7h4zRifwfF1RZhhWAGf8",
  authDomain: "uc-store-b5265.firebaseapp.com",
  databaseURL: "https://uc-store-b5265-default-rtdb.firebaseio.com",
  projectId: "uc-store-b5265",
  storageBucket: "uc-store-b5265.firebasestorage.app",
  messagingSenderId: "391296623869",
  appId: "1:391296623869:web:5c2523ac126e76f9c9ca94"
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

export default app;

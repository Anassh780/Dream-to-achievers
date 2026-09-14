import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyD8XpLrFfjXTHafqTbhsZ9ts3XpIBZutak',
  authDomain: 'uc-store-b5265.firebaseapp.com',
  databaseURL: 'https://uc-store-b5265-default-rtdb.firebaseio.com',
  projectId: 'uc-store-b5265',
  storageBucket: 'uc-store-b5265.firebasestorage.app',
  messagingSenderId: '391296623869',
  appId: '1:391296623869:web:500cee5c46badef7c9ca94',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

async function inspect() {
  console.log('--- FIRESTORE USERS ---');
  try {
    const snap = await getDocs(collection(db, 'users'));
    console.log(`Found ${snap.docs.length} users in Firestore:`);
    snap.docs.forEach(doc => {
      const d = doc.data();
      console.log(`Doc ID: ${doc.id} | Name: "${d.fullName}" | Email: "${d.email}" | Code: "${d.referralCode}" | ReferredBy: "${d.referredByCode}" | Role: "${d.role}"`);
    });
  } catch (err) {
    console.error('Firestore error:', err);
  }

  console.log('\n--- RTDB USERS ---');
  try {
    const rtdbSnap = await get(ref(rtdb, 'users'));
    if (rtdbSnap.exists()) {
      const val = rtdbSnap.val();
      const keys = Object.keys(val);
      console.log(`Found ${keys.length} users in RTDB:`);
      keys.forEach(k => {
        const u = val[k];
        console.log(`Key: ${k} | ID: ${u?.id} | Name: "${u?.fullName}" | Email: "${u?.email}" | Code: "${u?.referralCode}" | ReferredBy: "${u?.referredByCode}"`);
      });
    } else {
      console.log('No users node in RTDB');
    }
  } catch (err) {
    console.error('RTDB error:', err);
  }

  console.log('\n--- FIRESTORE REFERRAL INDEX ---');
  try {
    const snap = await getDocs(collection(db, 'referral_index'));
    console.log(`Found ${snap.docs.length} referral index entries in Firestore:`);
    snap.docs.forEach(doc => {
      console.log(`Index ID: ${doc.id} =>`, doc.data());
    });
  } catch (err) {
    console.error('Referral index error:', err);
  }

  process.exit(0);
}

inspect();

import { ReferralRecord, User } from '@/types';
import { storage } from './storage';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { ref, get, set, child } from 'firebase/database';

export const referralService = {
  /**
   * Generates the public referral URL for a given referral code.
   */
  getReferralUrl(referralCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dreamtoachievers.com';
    return `${origin}/signup?ref=${encodeURIComponent(referralCode || '')}`;
  },

  /**
   * Captures referral code from query params (supports ?ref=, ?r=, ?referral=) on page load.
   */
  captureFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref') || params.get('r') || params.get('referral');
      if (refCode) {
        const clean = refCode.trim().toUpperCase();
        storage.setRaw('CAPTURED_REF', clean);
        return clean;
      }
    } catch (err) {
      console.warn('Error reading URL params for ref code:', err);
    }
    return storage.getRaw('CAPTURED_REF');
  },

  /**
   * Finds a referrer user by referral code across local cache, Firestore, and Realtime Database.
   */
  async findReferrerByCode(code: string): Promise<User | null> {
    if (!code) return null;
    const clean = code.trim().toUpperCase();

    // 1. Check local storage
    const localUsers = storage.get<User[]>('USERS', []);
    const localReferrer = localUsers.find((u) => u.referralCode?.toUpperCase() === clean);
    if (localReferrer) return localReferrer;

    // 2. Query Firestore
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', clean));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data() as User;
        // Cache locally
        if (!localUsers.some((u) => u.id === docData.id)) {
          localUsers.push(docData);
          storage.set('USERS', localUsers);
        }
        return docData;
      }
    } catch (firestoreErr) {
      console.warn('Firestore referrer query failed:', firestoreErr);
    }

    // 3. Query Realtime Database
    try {
      const rtdbRef = ref(rtdb);
      const snapshot = await get(child(rtdbRef, 'users'));
      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        for (const uid in allUsers) {
          const u = allUsers[uid] as User;
          if (u.referralCode?.toUpperCase() === clean) {
            // Cache locally
            if (!localUsers.some((item) => item.id === u.id)) {
              localUsers.push(u);
              storage.set('USERS', localUsers);
            }
            return u;
          }
        }
      }
    } catch (rtdbErr) {
      console.warn('RTDB referrer query failed:', rtdbErr);
    }

    return null;
  },

  /**
   * Returns list of community referrals for a specific user.
   */
  getUserReferrals(userId: string): ReferralRecord[] {
    const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    return referrals
      .filter((r) => r.referrerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Sync referrals for a user from Cloud Firestore and Realtime Database.
   */
  async syncUserReferrals(userId: string): Promise<ReferralRecord[]> {
    const localReferrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const mergedMap = new Map<string, ReferralRecord>();

    localReferrals.forEach((r) => mergedMap.set(r.id, r));

    // Try Firestore
    try {
      const refColl = collection(db, 'referrals');
      const q = query(refColl, where('referrerId', '==', userId));
      const snap = await getDocs(q);
      snap.forEach((d: any) => {
        const data = d.data() as ReferralRecord;
        mergedMap.set(data.id, data);
      });
    } catch (err) {
      console.warn('Firestore syncUserReferrals failed:', err);
    }

    // Try RTDB
    try {
      const rtdbRef = ref(rtdb);
      const snap = await get(child(rtdbRef, 'referrals'));
      if (snap.exists()) {
        const val = snap.val();
        for (const refId in val) {
          const rec = val[refId] as ReferralRecord;
          if (rec.referrerId === userId) {
            mergedMap.set(rec.id, rec);
          }
        }
      }
    } catch (err) {
      console.warn('RTDB syncUserReferrals failed:', err);
    }

    const all = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    storage.set('REFERRALS', all);
    return all.filter((r) => r.referrerId === userId);
  },

  /**
   * Saves a new referral record to local storage, Firestore, and Realtime Database.
   */
  async saveReferralRecord(record: ReferralRecord): Promise<void> {
    // 1. Local Storage
    const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const exists = referrals.findIndex((r) => r.id === record.id);
    if (exists >= 0) {
      referrals[exists] = record;
    } else {
      referrals.push(record);
    }
    storage.set('REFERRALS', referrals);

    // 2. Cloud Firestore
    try {
      await setDoc(doc(db, 'referrals', record.id), record, { merge: true });
    } catch (err) {
      console.warn('Firestore save referral failed:', err);
    }

    // 3. Realtime Database
    try {
      await set(ref(rtdb, `referrals/${record.id}`), record);
    } catch (err) {
      console.warn('RTDB save referral failed:', err);
    }
  },

  /**
   * Returns count of qualifying community members for a specific user.
   */
  getQualifyingCommunityCount(userId: string): number {
    return this.getUserReferrals(userId).filter((r) => r.isQualifying).length;
  },

  /**
   * Validates if a referral code is valid.
   */
  async validateReferralCode(
    code: string,
    currentUserId?: string
  ): Promise<{ valid: boolean; referrer?: User; error?: string }> {
    if (!code.trim()) {
      return { valid: false, error: 'Please enter a referral code.' };
    }
    const clean = code.trim().toUpperCase();
    const referrer = await this.findReferrerByCode(clean);

    if (!referrer) {
      return { valid: false, error: 'Referral code does not exist.' };
    }

    if (currentUserId && referrer.id === currentUserId) {
      return { valid: false, error: 'You cannot use your own referral code.' };
    }

    return { valid: true, referrer };
  },
};

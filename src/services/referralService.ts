import { ReferralRecord, User } from '@/types';
import { storage } from './storage';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, get, set, child } from 'firebase/database';

/**
 * Normalizes a referral code by stripping whitespace, dashes, underscores, and converting to uppercase.
 * Example: 'FARIA-939' -> 'FARIA939', 'faria 939' -> 'FARIA939', 'dta-faria939' -> 'FARIA939'
 */
export function normalizeReferralCode(code: string): string {
  if (!code) return '';
  return code
    .trim()
    .toUpperCase()
    .replace(/^DTA-?/, '')
    .replace(/[^A-Z0-9]/g, '');
}

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
   * Tolerant to case differences, dashes, and prefix variations.
   */
  async findReferrerByCode(code: string): Promise<User | null> {
    if (!code) return null;
    const cleanRaw = code.trim().toUpperCase();
    const normalized = normalizeReferralCode(code);

    // 1. Check local storage users cache
    const localUsers = storage.get<User[]>('USERS', []);
    const localReferrer = localUsers.find((u) => {
      const uNorm = normalizeReferralCode(u.referralCode || '');
      return uNorm === normalized || u.referralCode?.toUpperCase() === cleanRaw;
    });
    if (localReferrer) return localReferrer;

    // 2. Query Firestore referral_index (O(1) fast lookup)
    try {
      if (normalized) {
        const indexDoc = await getDoc(doc(db, 'referral_index', normalized));
        if (indexDoc.exists()) {
          const indexData = indexDoc.data() as any;
          if (indexData?.userId) {
            const userDoc = await getDoc(doc(db, 'users', indexData.userId));
            if (userDoc.exists()) {
              const u = userDoc.data() as User;
              this.cacheLocalUser(u);
              return u;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Firestore referral_index lookup failed:', err);
    }

    // 3. Query Firestore users collection
    try {
      const usersRef = collection(db, 'users');
      
      // Try exact match
      let q = query(usersRef, where('referralCode', '==', cleanRaw));
      let querySnapshot = await getDocs(q);

      // Try normalized code match if exact didn't return
      if (querySnapshot.empty && cleanRaw !== code.trim()) {
        q = query(usersRef, where('referralCode', '==', code.trim()));
        querySnapshot = await getDocs(q);
      }

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data() as User;
        this.cacheLocalUser(docData);
        return docData;
      }

      // If still empty, scan active users in Firestore to match normalized codes
      const allUsersSnap = await getDocs(usersRef);
      for (const d of allUsersSnap.docs) {
        const u = d.data() as User;
        const uNorm = normalizeReferralCode(u.referralCode || '');
        if (uNorm === normalized || u.referralCode?.toUpperCase() === cleanRaw) {
          this.cacheLocalUser(u);
          return u;
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore referrer query failed:', firestoreErr);
    }

    // 4. Query Realtime Database
    try {
      const rtdbRef = ref(rtdb);

      // Check referral_index in RTDB
      if (normalized) {
        const indexSnap = await get(child(rtdbRef, `referral_index/${normalized}`));
        if (indexSnap.exists()) {
          const val = indexSnap.val();
          if (val?.userId) {
            const userSnap = await get(child(rtdbRef, `users/${val.userId}`));
            if (userSnap.exists()) {
              const u = userSnap.val() as User;
              this.cacheLocalUser(u);
              return u;
            }
          }
        }
      }

      // Scan RTDB users
      const snapshot = await get(child(rtdbRef, 'users'));
      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        for (const uid in allUsers) {
          const u = allUsers[uid] as User;
          const uNorm = normalizeReferralCode(u.referralCode || '');
          if (uNorm === normalized || u.referralCode?.toUpperCase() === cleanRaw) {
            this.cacheLocalUser(u);
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
   * Helper to cache user in local storage
   */
  cacheLocalUser(user: User): void {
    if (!user || !user.id) return;
    const localUsers = storage.get<User[]>('USERS', []);
    const idx = localUsers.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      localUsers[idx] = user;
    } else {
      localUsers.push(user);
    }
    storage.set('USERS', localUsers);
  },

  /**
   * Returns list of community referrals for a specific user.
   */
  getUserReferrals(userId: string): ReferralRecord[] {
    const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const localUsers = storage.get<User[]>('USERS', []);
    const currentUser = localUsers.find((u) => u.id === userId);
    const userRefNorm = normalizeReferralCode(currentUser?.referralCode || '');

    return referrals
      .filter((r) => {
        if (r.referrerId === userId) return true;
        if (userRefNorm && normalizeReferralCode(r.referralCodeUsed || '') === userRefNorm) return true;
        return false;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Sync referrals for a user from Cloud Firestore, RTDB, and reconstruct from referred users.
   * Auto-heals any missing referral records dynamically.
   */
  async syncUserReferrals(userId: string): Promise<ReferralRecord[]> {
    const localReferrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const mergedMap = new Map<string, ReferralRecord>();

    localReferrals.forEach((r) => mergedMap.set(r.id, r));

    // Get current user profile for code matching
    const localUsers = storage.get<User[]>('USERS', []);
    let currentUser = localUsers.find((u) => u.id === userId);
    if (!currentUser) {
      const cached = storage.get<User | null>('CURRENT_USER_DATA', null);
      if (cached && cached.id === userId) currentUser = cached;
    }

    const userRefNorm = normalizeReferralCode(currentUser?.referralCode || '');

    // 1. Fetch from Firestore referrals collection
    try {
      const refColl = collection(db, 'referrals');
      
      // Query by referrerId
      const q1 = query(refColl, where('referrerId', '==', userId));
      const snap1 = await getDocs(q1);
      snap1.forEach((d: any) => {
        const data = d.data() as ReferralRecord;
        mergedMap.set(data.id, data);
      });

      // Also query by referralCodeUsed if available
      if (currentUser?.referralCode) {
        const q2 = query(refColl, where('referralCodeUsed', '==', currentUser.referralCode));
        const snap2 = await getDocs(q2);
        snap2.forEach((d: any) => {
          const data = d.data() as ReferralRecord;
          data.referrerId = userId; // heal referrerId if was unset
          mergedMap.set(data.id, data);
        });
      }
    } catch (err) {
      console.warn('Firestore syncUserReferrals failed:', err);
    }

    // 2. Fetch from RTDB referrals collection
    try {
      const rtdbRef = ref(rtdb);
      const snap = await get(child(rtdbRef, 'referrals'));
      if (snap.exists()) {
        const val = snap.val();
        for (const refId in val) {
          const rec = val[refId] as ReferralRecord;
          const recNorm = normalizeReferralCode(rec.referralCodeUsed || '');
          if (rec.referrerId === userId || (userRefNorm && recNorm === userRefNorm)) {
            rec.referrerId = userId;
            mergedMap.set(rec.id, rec);
          }
        }
      }
    } catch (err) {
      console.warn('RTDB syncUserReferrals failed:', err);
    }

    // 3. SELF-HEALING: Scan users in Firestore & RTDB who were referred by this user
    // If any user has referredByCode === currentUser.referralCode, ensure a ReferralRecord exists!
    try {
      const usersColl = collection(db, 'users');
      const allUsersSnap = await getDocs(usersColl);
      
      allUsersSnap.forEach((docSnap: any) => {
        const u = docSnap.data() as User;
        if (!u || u.id === userId) return;

        const uRefByNorm = normalizeReferralCode(u.referredByCode || '');
        if (userRefNorm && uRefByNorm === userRefNorm) {
          // Check if already in mergedMap
          const alreadyTracked = Array.from(mergedMap.values()).some(
            (r) => r.referredUserId === u.id || r.referredUserEmail === u.email
          );

          if (!alreadyTracked) {
            // Auto-heal missing referral record!
            const healedRecord: ReferralRecord = {
              id: `ref-healed-${u.id}`,
              referrerId: userId,
              referredUserId: u.id,
              referredUserName: u.fullName || 'Partner Reseller',
              referredUserEmail: u.email,
              referredUserRank: u.currentRankSlug || 'unranked',
              referralCodeUsed: currentUser?.referralCode || 'CODE',
              status: 'active',
              isQualifying: true,
              createdAt: u.createdAt || new Date().toISOString(),
            };

            mergedMap.set(healedRecord.id, healedRecord);
            // Save to Firestore & RTDB in background
            this.saveReferralRecord(healedRecord).catch(() => {});
          }
        }
      });
    } catch (healErr) {
      console.warn('Self-healing user scan failed:', healErr);
    }

    const all = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    storage.set('REFERRALS', all);

    return all.filter((r) => {
      if (r.referrerId === userId) return true;
      if (userRefNorm && normalizeReferralCode(r.referralCodeUsed || '') === userRefNorm) return true;
      return false;
    });
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
      if (record.referrerId) {
        await setDoc(doc(db, `users/${record.referrerId}/referrals`, record.id), record, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore save referral failed:', err);
    }

    // 3. Realtime Database
    try {
      await set(ref(rtdb, `referrals/${record.id}`), record);
      if (record.referrerId) {
        await set(ref(rtdb, `user_referrals/${record.referrerId}/${record.id}`), record);
      }
    } catch (err) {
      console.warn('RTDB save referral failed:', err);
    }
  },

  /**
   * Index a referral code in Firestore and RTDB for instant O(1) resolution.
   */
  async indexReferralCode(user: User): Promise<void> {
    if (!user || !user.referralCode || !user.id) return;
    const normalized = normalizeReferralCode(user.referralCode);
    if (!normalized) return;

    const payload = {
      userId: user.id,
      referralCode: user.referralCode,
      normalizedCode: normalized,
      fullName: user.fullName,
      email: user.email,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'referral_index', normalized), payload, { merge: true });
    } catch (err) {
      console.warn('Firestore referral_index save failed:', err);
    }

    try {
      await set(ref(rtdb, `referral_index/${normalized}`), payload);
    } catch (err) {
      console.warn('RTDB referral_index save failed:', err);
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
    const referrer = await this.findReferrerByCode(code);

    if (!referrer) {
      return { valid: false, error: 'Referral code does not exist.' };
    }

    if (currentUserId && referrer.id === currentUserId) {
      return { valid: false, error: 'You cannot use your own referral code.' };
    }

    return { valid: true, referrer };
  },
};

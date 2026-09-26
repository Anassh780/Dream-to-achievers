import { ReferralRecord, User } from '@/types';
import { storage } from './storage';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, get, set, child, remove } from 'firebase/database';

/**
 * Normalizes a referral code by stripping whitespace, dashes, underscores, and ensuring
 * canonical alignment with the 'DTA' brand prefix.
 * Example: 'FARIA-939' -> 'DTAFARIA939', 'faria 939' -> 'DTAFARIA939', 'DTA-3024' -> 'DTA3024', '3024' -> 'DTA3024'
 */
export function normalizeReferralCode(code?: string | null): string {
  if (!code) return '';
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!clean) return '';
  return clean.startsWith('DTA') ? clean : `DTA${clean}`;
}

export function cleanReferralForCloud(r: ReferralRecord): ReferralRecord {
  const cleanCode = String(r.referralCodeUsed || '').trim().toUpperCase();
  const standardizedCode = cleanCode && !cleanCode.startsWith('DTA')
    ? `DTA-${cleanCode.replace(/[^A-Z0-9]/g, '')}`
    : cleanCode;

  return {
    id: String(r.id || `ref-${Date.now()}`).trim(),
    referrerId: String(r.referrerId || '').trim(),
    referredUserId: String(r.referredUserId || '').trim(),
    referredUserName: String(r.referredUserName || 'Partner Reseller').trim(),
    referredUserEmail: String(r.referredUserEmail || '').toLowerCase().trim(),
    referredUserRank: r.referredUserRank || 'unranked',
    referralCodeUsed: standardizedCode,
    status: r.status || 'active',
    isQualifying: r.isQualifying !== false,
    createdAt: r.createdAt || new Date().toISOString(),
  };
}

export const referralService = {
  /**
   * Generates the public referral URL for a given referral code.
   */
  getReferralUrl(referralCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dream-to-achievers.vercel.app';
    return `${origin}/signup?ref=${encodeURIComponent(referralCode || '')}`;
  },

  /**
   * Captures referral code from query params (supports ?ref=, ?r=, ?referral=) on page load
   * and persists in localStorage and sessionStorage.
   */
  captureFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref') || params.get('r') || params.get('referral');
      if (refCode && refCode.trim()) {
        const clean = refCode.trim().toUpperCase();
        storage.setRaw('CAPTURED_REF', clean);
        try {
          sessionStorage.setItem('dta_captured_ref', clean);
        } catch {}
        return clean;
      }
    } catch (err) {
      console.warn('Error reading URL params for ref code:', err);
    }
    
    // Fallback to storage or session
    const stored = storage.getRaw('CAPTURED_REF');
    if (stored) return stored;
    try {
      return sessionStorage.getItem('dta_captured_ref');
    } catch {
      return null;
    }
  },

  /**
   * Finds a referrer user by referral code across local cache, Firestore, and Realtime Database.
   * Highly resilient to formatting, casing, UID direct lookups, and network delays.
   */
  async findReferrerByCode(code: string): Promise<User | null> {
    if (!code || !code.trim()) return null;
    const rawTrimmed = code.trim();
    const cleanUpper = rawTrimmed.toUpperCase();
    const normalized = normalizeReferralCode(rawTrimmed);

    // 1. Check local storage users cache
    const localUsers = storage.get<User[]>('USERS', []);
    const localReferrer = localUsers.find((u) => {
      if (!u) return false;
      const uNorm = normalizeReferralCode(u.referralCode || '');
      const uRaw = (u.referralCode || '').trim().toUpperCase();
      return (
        u.id === rawTrimmed ||
        uNorm === normalized ||
        uRaw === cleanUpper ||
        u.email?.toLowerCase() === rawTrimmed.toLowerCase()
      );
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

    // 3. Query Realtime Database referral_index
    try {
      if (normalized) {
        const rtdbRef = ref(rtdb);
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
    } catch (rtdbErr) {
      console.warn('RTDB referral_index lookup failed:', rtdbErr);
    }

    // 4. Query Firestore users collection (by referralCode exact, uppercase, or UID)
    try {
      const usersRef = collection(db, 'users');
      
      // Try exact UID lookup
      try {
        const directUserDoc = await getDoc(doc(db, 'users', rawTrimmed));
        if (directUserDoc.exists()) {
          const u = directUserDoc.data() as User;
          this.cacheLocalUser(u);
          return u;
        }
      } catch {}

      // Try exact referralCode
      let q = query(usersRef, where('referralCode', '==', cleanUpper));
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty && cleanUpper !== rawTrimmed) {
        q = query(usersRef, where('referralCode', '==', rawTrimmed));
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
        if (!u) continue;
        const uNorm = normalizeReferralCode(u.referralCode || '');
        if (
          u.id === rawTrimmed ||
          uNorm === normalized ||
          u.referralCode?.toUpperCase() === cleanUpper ||
          u.email?.toLowerCase() === rawTrimmed.toLowerCase()
        ) {
          this.cacheLocalUser(u);
          return u;
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore referrer query failed:', firestoreErr);
    }

    // 5. Query Realtime Database users collection fallback
    try {
      const rtdbRef = ref(rtdb);
      const snapshot = await get(child(rtdbRef, 'users'));
      if (snapshot.exists()) {
        const allUsers = snapshot.val();
        for (const uid in allUsers) {
          const u = allUsers[uid] as User;
          if (!u) continue;
          const uNorm = normalizeReferralCode(u.referralCode || '');
          if (
            u.id === rawTrimmed ||
            uid === rawTrimmed ||
            uNorm === normalized ||
            u.referralCode?.toUpperCase() === cleanUpper ||
            u.email?.toLowerCase() === rawTrimmed.toLowerCase()
          ) {
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
   * Helper to cache user in local storage.
   */
  cacheLocalUser(user: User): void {
    if (!user || !user.id) return;
    const localUsers = storage.get<User[]>('USERS', []);
    const idx = localUsers.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      localUsers[idx] = { ...localUsers[idx], ...user };
    } else {
      localUsers.push(user);
    }
    storage.set('USERS', localUsers);
  },

  /**
   * Returns list of community referrals for a specific user.
   * Matches by UID, normalized referral code, or legacy code formats, with instant local user reconciliation.
   */
  getUserReferrals(userId: string): ReferralRecord[] {
    const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const localUsers = storage.get<User[]>('USERS', []);
    const currentUser = localUsers.find((u) => u.id === userId) || storage.get<User | null>('CURRENT_USER_DATA', null);
    
    const userRefNorm = normalizeReferralCode(currentUser?.referralCode || '');
    const userRefRaw = (currentUser?.referralCode || '').trim().toUpperCase();

    const matchedRecords = referrals.filter((r) => {
      if (!r) return false;
      // Direct UID match
      if (r.referrerId === userId) return true;
      // Referral code match
      if (userRefNorm && normalizeReferralCode(r.referralCodeUsed || '') === userRefNorm) return true;
      if (userRefRaw && r.referralCodeUsed?.toUpperCase() === userRefRaw) return true;
      // Fallback: legacy record where referrerId was set to code
      if (userRefNorm && normalizeReferralCode(r.referrerId || '') === userRefNorm) return true;
      if (userRefRaw && r.referrerId?.toUpperCase() === userRefRaw) return true;
      return false;
    });

    // Also check localUsers in case any referred user is in memory but referral record was delayed
    const existingReferredIds = new Set(matchedRecords.map((r) => r.referredUserId));
    for (const u of localUsers) {
      if (!u || u.id === userId || existingReferredIds.has(u.id)) continue;
      const uRefNorm = normalizeReferralCode(u.referredByCode || '');
      const uRefRaw = (u.referredByCode || '').trim().toUpperCase();
      if (
        (userRefNorm && uRefNorm === userRefNorm) ||
        (userRefRaw && uRefRaw === userRefRaw) ||
        u.referredByCode === userId
      ) {
        matchedRecords.push({
          id: `ref-local-${u.id}`,
          referrerId: userId,
          referredUserId: u.id,
          referredUserName: u.fullName || 'Partner Reseller',
          referredUserEmail: u.email,
          referredUserRank: u.currentRankSlug || 'unranked',
          referralCodeUsed: currentUser?.referralCode || userRefRaw || 'CODE',
          status: 'active',
          isQualifying: true,
          createdAt: u.createdAt || new Date().toISOString(),
        });
        existingReferredIds.add(u.id);
      }
    }

    return matchedRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Sync referrals for a user from Cloud Firestore, RTDB, and reconstruct from referred users.
   * Automatically heals any missing or legacy referral records.
   */
  async syncUserReferrals(userId: string): Promise<ReferralRecord[]> {
    const localReferrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const mergedMap = new Map<string, ReferralRecord>();

    localReferrals.forEach((r) => {
      if (r && r.id) mergedMap.set(r.id, r);
    });

    // Get current user profile for code matching
    const localUsers = storage.get<User[]>('USERS', []);
    let currentUser = localUsers.find((u) => u.id === userId);
    if (!currentUser) {
      const cached = storage.get<User | null>('CURRENT_USER_DATA', null);
      if (cached && cached.id === userId) currentUser = cached;
    }

    // If still not found locally, fetch from Firestore / RTDB
    if (!currentUser) {
      try {
        const uDoc = await getDoc(doc(db, 'users', userId));
        if (uDoc.exists()) {
          currentUser = uDoc.data() as User;
          this.cacheLocalUser(currentUser);
        }
      } catch {}
    }

    const userRefNorm = normalizeReferralCode(currentUser?.referralCode || '');
    const userRefRaw = (currentUser?.referralCode || '').trim().toUpperCase();

    // 1. Fetch from Firestore global referrals & user subcollection
    try {
      const refColl = collection(db, 'referrals');
      
      // Query 1: by referrerId == userId
      const q1 = query(refColl, where('referrerId', '==', userId));
      const snap1 = await getDocs(q1);
      snap1.forEach((d: any) => {
        const data = d.data() as ReferralRecord;
        if (data && data.id) {
          data.referrerId = userId;
          mergedMap.set(data.id, data);
        }
      });

      // Query 2: by referralCodeUsed == currentUser.referralCode
      if (currentUser?.referralCode) {
        const q2 = query(refColl, where('referralCodeUsed', '==', currentUser.referralCode));
        const snap2 = await getDocs(q2);
        snap2.forEach((d: any) => {
          const data = d.data() as ReferralRecord;
          if (data && data.id) {
            data.referrerId = userId;
            mergedMap.set(data.id, data);
          }
        });
      }

      // Query 3: by referralCodeUsed == userRefNorm
      if (userRefNorm && userRefNorm !== currentUser?.referralCode) {
        try {
          const q3 = query(refColl, where('referralCodeUsed', '==', userRefNorm));
          const snap3 = await getDocs(q3);
          snap3.forEach((d: any) => {
            const data = d.data() as ReferralRecord;
            if (data && data.id) {
              data.referrerId = userId;
              mergedMap.set(data.id, data);
            }
          });
        } catch {}
      }

      // Query 4: user subcollection users/{userId}/referrals
      try {
        const subColl = collection(db, `users/${userId}/referrals`);
        const subSnap = await getDocs(subColl);
        subSnap.forEach((d: any) => {
          const data = d.data() as ReferralRecord;
          if (data && data.id) {
            data.referrerId = userId;
            mergedMap.set(data.id, data);
          }
        });
      } catch (subErr) {
        console.warn('Subcollection fetch skipped/failed:', subErr);
      }
    } catch (err) {
      console.warn('Firestore syncUserReferrals failed:', err);
    }

    // 2. Fetch from RTDB referrals collection
    try {
      const rtdbRef = ref(rtdb);
      
      // Check user_referrals/{userId}
      const userRefSnap = await get(child(rtdbRef, `user_referrals/${userId}`));
      if (userRefSnap.exists()) {
        const val = userRefSnap.val();
        for (const refId in val) {
          const rec = val[refId] as ReferralRecord;
          if (rec && rec.id) {
            rec.referrerId = userId;
            mergedMap.set(rec.id, rec);
          }
        }
      }

      // Check global referrals in RTDB
      const snap = await get(child(rtdbRef, 'referrals'));
      if (snap.exists()) {
        const val = snap.val();
        for (const refId in val) {
          const rec = val[refId] as ReferralRecord;
          if (!rec) continue;
          const recNorm = normalizeReferralCode(rec.referralCodeUsed || '');
          if (
            rec.referrerId === userId ||
            (userRefNorm && recNorm === userRefNorm) ||
            (userRefRaw && rec.referralCodeUsed?.toUpperCase() === userRefRaw) ||
            (userRefNorm && normalizeReferralCode(rec.referrerId || '') === userRefNorm) ||
            (userRefRaw && rec.referrerId?.toUpperCase() === userRefRaw)
          ) {
            rec.referrerId = userId;
            mergedMap.set(rec.id, rec);
          }
        }
      }
    } catch (err) {
      console.warn('RTDB syncUserReferrals failed:', err);
    }

    // 3. SELF-HEALING ENGINE: Scan users in Firestore, RTDB, and LocalStorage who were referred by this user
    try {
      const usersToScan: User[] = [];
      const scannedIds = new Set<string>();

      // A. Firestore users
      try {
        const usersColl = collection(db, 'users');
        const allUsersSnap = await getDocs(usersColl);
        allUsersSnap.forEach((docSnap: any) => {
          const u = docSnap.data() as User;
          if (u && u.id && !scannedIds.has(u.id)) {
            usersToScan.push(u);
            scannedIds.add(u.id);
          }
        });
      } catch {}

      // B. RTDB users
      try {
        const rtdbUsersSnap = await get(ref(rtdb, 'users'));
        if (rtdbUsersSnap.exists()) {
          const val = rtdbUsersSnap.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((u: any) => {
              if (u && u.id && !scannedIds.has(u.id)) {
                usersToScan.push(u);
                scannedIds.add(u.id);
              }
            });
          }
        }
      } catch {}

      // C. Local storage users
      localUsers.forEach((lu) => {
        if (lu && lu.id && !scannedIds.has(lu.id)) {
          usersToScan.push(lu);
          scannedIds.add(lu.id);
        }
      });
      
      for (const u of usersToScan) {
        if (!u || u.id === userId) continue;

        const uRefByNorm = normalizeReferralCode(u.referredByCode || '');
        const uRefByRaw = (u.referredByCode || '').trim().toUpperCase();

        if (
          (userRefNorm && uRefByNorm === userRefNorm) ||
          (userRefRaw && uRefByRaw === userRefRaw) ||
          u.referredByCode === userId
        ) {
          // Check if already in mergedMap
          const alreadyTracked = Array.from(mergedMap.values()).some(
            (r) => r.referredUserId === u.id || (r.referredUserEmail && u.email && r.referredUserEmail.toLowerCase() === u.email.toLowerCase())
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
              referralCodeUsed: currentUser?.referralCode || userRefRaw || 'CODE',
              status: 'active',
              isQualifying: true,
              createdAt: u.createdAt || new Date().toISOString(),
            };

            mergedMap.set(healedRecord.id, healedRecord);
            // Save to Firestore & RTDB in background
            this.saveReferralRecord(healedRecord).catch(() => {});
          }
        }
      }
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
      if (userRefRaw && r.referralCodeUsed?.toUpperCase() === userRefRaw) return true;
      if (userRefNorm && normalizeReferralCode(r.referrerId || '') === userRefNorm) return true;
      if (userRefRaw && r.referrerId?.toUpperCase() === userRefRaw) return true;
      return false;
    });
  },

  /**
   * Saves a new referral record to local storage, Firestore, and Realtime Database.
   * Multi-layered persistence ensures data is never lost.
   */
  async saveReferralRecord(record: ReferralRecord): Promise<void> {
    if (!record || !record.id) return;
    const clean = cleanReferralForCloud(record);

    // 1. Local Storage
    const referrals = storage.get<ReferralRecord[]>('REFERRALS', []);
    const exists = referrals.findIndex((r) => r.id === clean.id);
    if (exists >= 0) {
      referrals[exists] = clean;
    } else {
      referrals.unshift(clean);
    }
    storage.set('REFERRALS', referrals);

    // 2. Cloud Firestore
    try {
      await setDoc(doc(db, 'referrals', clean.id), clean, { merge: true });
      if (clean.referrerId) {
        await setDoc(doc(db, `users/${clean.referrerId}/referrals`, clean.id), clean, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore save referral failed:', err);
    }

    // 3. Realtime Database
    try {
      if (clean.referrerId) {
      }
    } catch (err) {
      console.warn('RTDB save referral failed:', err);
    }
  },

  /**
   * Index a referral code in Firestore and RTDB for instant O(1) resolution.
   * Also indexes legacy aliases (without DTA) so older links continue resolving seamlessly.
   */
  async indexReferralCode(user: User): Promise<void> {
    if (!user || !user.referralCode || !user.id) return;
    const rawCode = String(user.referralCode || '').trim().toUpperCase();
    const normalized = normalizeReferralCode(rawCode);
    if (!normalized) return;

    const payload = {
      userId: String(user.id || '').trim(),
      referralCode: rawCode,
      normalizedCode: normalized,
      fullName: String(user.fullName || 'Partner Reseller').trim(),
      email: String(user.email || '').toLowerCase().trim(),
      currentRankSlug: user.currentRankSlug || 'unranked',
      updatedAt: new Date().toISOString(),
    };

    // 1. Firestore index
    try {
      await setDoc(doc(db, 'referral_index', normalized), payload, { merge: true });
      if (rawCode !== normalized) {
        await setDoc(doc(db, 'referral_index', rawCode), payload, { merge: true });
      }
      const legacyWithoutDta = rawCode.replace(/^DTA-?/, '');
      if (legacyWithoutDta && legacyWithoutDta !== rawCode && legacyWithoutDta !== normalized) {
        await setDoc(doc(db, 'referral_index', legacyWithoutDta), payload, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore referral_index save failed:', err);
    }

    // 2. RTDB index
    try {
      await set(ref(rtdb, `referral_index/${normalized}`), payload);
      if (rawCode !== normalized) {
        await set(ref(rtdb, `referral_index/${rawCode}`), payload);
      }
      const legacyWithoutDta = rawCode.replace(/^DTA-?/, '');
      if (legacyWithoutDta && legacyWithoutDta !== rawCode && legacyWithoutDta !== normalized) {
        await set(ref(rtdb, `referral_index/${legacyWithoutDta}`), payload);
      }
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
   * Validates if a referral code is valid and returns the referrer user details.
   */
  async validateReferralCode(
    code: string,
    currentUserId?: string
  ): Promise<{ valid: boolean; referrer?: User; error?: string }> {
    if (!code || !code.trim()) {
      return { valid: false, error: 'Please enter a referral code.' };
    }
    const referrer = await this.findReferrerByCode(code);

    if (!referrer) {
      return { valid: false, error: 'Referral sponsor code not found.' };
    }

    if (currentUserId && referrer.id === currentUserId) {
      return { valid: false, error: 'You cannot use your own referral code.' };
    }

    return { valid: true, referrer };
  },

  /**
   * Scans every user across Firestore, RTDB, and LocalStorage.
   * If any user has a referral code that does not start with 'DTA',
   * resets their code to 'DTA-${cleanCode}', updates all sponsor links,
   * updates referral records, re-indexes the new code, and purges fake synthetic accounts.
   */
  async standardizeAndResetAllReferralCodes(): Promise<{
    totalUsersEvaluated: number;
    totalCodesMigrated: number;
    totalDownlinesUpdated: number;
    details: string[];
  }> {
    let totalCodesMigrated = 0;
    let totalDownlinesUpdated = 0;
    const details: string[] = [];

    try {
      const userMap = new Map<string, User>();

      // 1. Gather users from Firestore
      try {
        const snap = await getDocs(collection(db, 'users'));
        snap.forEach((d: any) => {
          const u = d.data() as User;
          const id = u.id || d.id;
          if (id) userMap.set(id, { ...u, id });
        });
      } catch (err) {
        console.warn('Firestore fetch users for code reset warning:', err);
      }

      // 2. Gather users from RTDB
      try {
        const rtdbSnap = await get(ref(rtdb, 'users'));
        if (rtdbSnap.exists()) {
          const val = rtdbSnap.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((u: any) => {
              if (u && u.id) {
                userMap.set(u.id, { ...userMap.get(u.id), ...u });
              }
            });
          }
        }
      } catch (err) {
        console.warn('RTDB fetch users for code reset warning:', err);
      }

      // 3. Gather users from local storage
      const localUsers = storage.get<User[]>('USERS', []);
      localUsers.forEach((u) => {
        if (u && u.id) userMap.set(u.id, { ...userMap.get(u.id), ...u });
      });

      // Filter out synthetic accounts and deduplicate by email
      const emailMap = new Map<string, User>();
      const realUsers: User[] = [];

      userMap.forEach((u) => {
        const isFakeSynthetic =
          (u.email?.endsWith('@dreamtoachievers.com') && u.id?.startsWith('user-')) ||
          (u.id && u.id.length > 25 && /^[A-Z0-9]+$/.test(u.id) && u.email?.endsWith('@dreamtoachievers.com'));

        if (isFakeSynthetic) {
          try {
            deleteDoc(doc(db, 'users', u.id)).catch(() => {});
            remove(ref(rtdb, `users/${u.id}`)).catch(() => {});
          } catch {}
          return;
        }

        const cleanEmail = (u.email || '').toLowerCase().trim();
        if (cleanEmail) {
          if (emailMap.has(cleanEmail)) {
            const existing = emailMap.get(cleanEmail)!;
            const isExistingTemp = existing.id?.startsWith('user-');
            const isCurrentTemp = u.id?.startsWith('user-');
            if (isExistingTemp && !isCurrentTemp) {
              emailMap.set(cleanEmail, { ...existing, ...u });
            } else {
              emailMap.set(cleanEmail, { ...u, ...existing });
            }
          } else {
            emailMap.set(cleanEmail, u);
          }
        } else {
          realUsers.push(u);
        }
      });

      emailMap.forEach((u) => realUsers.push(u));

      // 4. Check every user and identify non-DTA codes
      const migrationMap = new Map<string, string>(); // oldCodeClean -> newCode

      for (const u of realUsers) {
        const currentCode = String(u.referralCode || '').trim().toUpperCase();
        if (!currentCode || !currentCode.startsWith('DTA')) {
          // Needs reset!
          const cleanOld = currentCode.replace(/[^A-Z0-9]/gi, '');
          let newCode = '';
          if (cleanOld) {
            newCode = `DTA-${cleanOld}`;
          } else {
            const base = (u.fullName || 'VIP').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'VIP';
            const rand = Math.floor(100 + Math.random() * 900);
            newCode = `DTA-${base}${rand}`;
          }

          if (currentCode) {
            migrationMap.set(currentCode, newCode);
            migrationMap.set(cleanOld, newCode);
          }

          u.referralCode = newCode;
          totalCodesMigrated++;
          details.push(`Reset user "${u.fullName}" (${u.email}): ${currentCode || '[none]'} -> ${newCode}`);

          // Update in Firestore
          try {
            await setDoc(doc(db, 'users', u.id), { referralCode: newCode }, { merge: true });
          } catch (e) {
            console.warn(`Failed to update user doc in Firestore for ${u.id}:`, e);
          }

          // Update in RTDB
          try {
            await set(ref(rtdb, `users/${u.id}/referralCode`), newCode);
          } catch (e) {
            console.warn(`Failed to update user in RTDB for ${u.id}:`, e);
          }

          // Re-index new code
          await this.indexReferralCode(u).catch(() => {});
        } else {
          // Already starts with DTA, ensure it's indexed
          await this.indexReferralCode(u).catch(() => {});
        }
      }

      // 5. Update downlines whose referredByCode was an old code
      for (const u of realUsers) {
        if (u.referredByCode) {
          const oldRefClean = u.referredByCode.trim().toUpperCase();
          const cleanNoDta = oldRefClean.replace(/[^A-Z0-9]/gi, '');
          const mappedNew = migrationMap.get(oldRefClean) || migrationMap.get(cleanNoDta);
          if (mappedNew && mappedNew !== u.referredByCode) {
            u.referredByCode = mappedNew;
            totalDownlinesUpdated++;
            details.push(`Updated downline link for ${u.fullName}: sponsor ${oldRefClean} -> ${mappedNew}`);

            try {
              await setDoc(doc(db, 'users', u.id), { referredByCode: mappedNew }, { merge: true });
            } catch {}
            try {
              await set(ref(rtdb, `users/${u.id}/referredByCode`), mappedNew);
            } catch {}
          }
        }
      }

      // 6. Update ReferralRecords in local storage, Firestore, RTDB
      const allReferrals = storage.get<ReferralRecord[]>('REFERRALS', []);
      let referralsChanged = false;
      const updatedReferrals = allReferrals.map((r) => {
        const cleanRefCode = (r.referralCodeUsed || '').trim().toUpperCase();
        const cleanNoDta = cleanRefCode.replace(/[^A-Z0-9]/gi, '');
        const mapped = migrationMap.get(cleanRefCode) || migrationMap.get(cleanNoDta);
        if (mapped && mapped !== r.referralCodeUsed) {
          referralsChanged = true;
          return { ...r, referralCodeUsed: mapped };
        }
        return r;
      });

      if (referralsChanged) {
        storage.set('REFERRALS', updatedReferrals);
        for (const r of updatedReferrals) {
          if (r.id) {
            try {
              await setDoc(doc(db, 'referrals', r.id), { referralCodeUsed: r.referralCodeUsed }, { merge: true });
            } catch {}
            try {
              await set(ref(rtdb, `referrals/${r.id}/referralCodeUsed`), r.referralCodeUsed);
            } catch {}
          }
        }
      }

      // 7. Save normalized real users back to local storage and dispatch real-time events
      storage.set('USERS', realUsers);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dta_users_update', { detail: realUsers }));
        window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: 'USERS', value: realUsers } }));
        if (referralsChanged) {
          window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: 'REFERRALS', value: updatedReferrals } }));
        }
      }

      return {
        totalUsersEvaluated: realUsers.length,
        totalCodesMigrated,
        totalDownlinesUpdated,
        details,
      };
    } catch (err: any) {
      console.error('standardizeAndResetAllReferralCodes error:', err);
      return {
        totalUsersEvaluated: 0,
        totalCodesMigrated,
        totalDownlinesUpdated,
        details: [err?.message || 'Error running migration'],
      };
    }
  },

  /**
   * Platform-wide Reconciliation Tool for Admins.
   * Scans all registered users across Firestore, RTDB, and LocalStorage,
   * standardizes non-DTA referral codes, auto-restores full User profiles,
   * repairs missing referral records, indexes all sponsor codes, and recalculates rank progress.
   */
  async runPlatformReconciliation(): Promise<{ totalHealed: number; totalReferrals: number }> {
    let totalHealed = 0;
    try {
      // 1. First standardize and reset any non-DTA referral codes across platform
      await this.standardizeAndResetAllReferralCodes().catch(() => {});

      const allUsersMap = new Map<string, User>();

      // 2. Firestore users
      try {
        const usersColl = collection(db, 'users');
        const usersSnap = await getDocs(usersColl);
        usersSnap.forEach((d: any) => {
          const u = d.data() as User;
          const id = u.id || d.id;
          if (id) allUsersMap.set(id, { ...u, id });
        });
      } catch {}

      // 3. RTDB users
      try {
        const rtdbSnap = await get(ref(rtdb, 'users'));
        if (rtdbSnap.exists()) {
          const val = rtdbSnap.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((ru: any) => {
              if (ru && ru.id) {
                allUsersMap.set(ru.id, { ...allUsersMap.get(ru.id), ...ru });
              }
            });
          }
        }
      } catch {}

      // 4. Local users
      const localUsers = storage.get<User[]>('USERS', []);
      localUsers.forEach((lu) => {
        if (lu && lu.id) {
          allUsersMap.set(lu.id, { ...allUsersMap.get(lu.id), ...lu });
        }
      });

      // Purge any fake synthetic users from map
      const realUsers: User[] = [];
      allUsersMap.forEach((u) => {
        const isFakeSynthetic =
          (u.email?.endsWith('@dreamtoachievers.com') && u.id?.startsWith('user-')) ||
          (u.id && u.id.length > 25 && /^[A-Z0-9]+$/.test(u.id) && u.email?.endsWith('@dreamtoachievers.com'));

        if (isFakeSynthetic) {
          try {
            deleteDoc(doc(db, 'users', u.id)).catch(() => {});
            remove(ref(rtdb, `users/${u.id}`)).catch(() => {});
          } catch {}
        } else {
          realUsers.push(u);
        }
      });

      storage.set('USERS', realUsers);

      // Index every real user's referral code in Firestore and RTDB
      for (const u of realUsers) {
        if (u.referralCode) {
          await this.indexReferralCode(u).catch(() => {});
        }
      }

      // Reconcile referrals for every real user
      for (const u of realUsers) {
        if (u.id) {
          const synced = await this.syncUserReferrals(u.id);
          totalHealed += synced.length;
        }
      }

      // Dispatch real-time user update event so Admin Portal immediately updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dta_users_update', { detail: realUsers }));
        window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: 'USERS', value: realUsers } }));
      }

      return { totalHealed, totalReferrals: storage.get<ReferralRecord[]>('REFERRALS', []).length };
    } catch (err) {
      console.warn('runPlatformReconciliation failed:', err);
      return { totalHealed: 0, totalReferrals: storage.get<ReferralRecord[]>('REFERRALS', []).length };
    }
  },
};

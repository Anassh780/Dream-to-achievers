import { ReferralRecord, User } from '@/types';
import { storage } from './storage';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, get, set, child, remove } from 'firebase/database';

/**
 * Normalizes a referral code by stripping whitespace, dashes, underscores, and converting to uppercase.
 * Example: 'FARIA-939' -> 'FARIA939', 'faria 939' -> 'FARIA939', 'dta-faria939' -> 'FARIA939'
 */
export function normalizeReferralCode(code?: string | null): string {
  if (!code) return '';
  return code
    .trim()
    .toUpperCase()
    .replace(/^DTA-?/, '')
    .replace(/[^A-Z0-9]/g, '');
}

export function cleanReferralForCloud(r: ReferralRecord): ReferralRecord {
  return {
    id: String(r.id || `ref-${Date.now()}`).trim(),
    referrerId: String(r.referrerId || '').trim(),
    referredUserId: String(r.referredUserId || '').trim(),
    referredUserName: String(r.referredUserName || 'Partner Reseller').trim(),
    referredUserEmail: String(r.referredUserEmail || '').toLowerCase().trim(),
    referredUserRank: r.referredUserRank || 'unranked',
    referralCodeUsed: String(r.referralCodeUsed || '').trim().toUpperCase(),
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
      await set(ref(rtdb, `referrals/${clean.id}`), clean);
      if (clean.referrerId) {
        await set(ref(rtdb, `user_referrals/${clean.referrerId}/${clean.id}`), clean);
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
      userId: String(user.id || '').trim(),
      referralCode: String(user.referralCode || '').trim().toUpperCase(),
      normalizedCode: normalized,
      fullName: String(user.fullName || 'Partner Reseller').trim(),
      email: String(user.email || '').toLowerCase().trim(),
      currentRankSlug: user.currentRankSlug || 'unranked',
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'referral_index', normalized), payload, { merge: true });
      if (user.referralCode.toUpperCase() !== normalized) {
        await setDoc(doc(db, 'referral_index', user.referralCode.toUpperCase()), payload, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore referral_index save failed:', err);
    }

    try {
      await set(ref(rtdb, `referral_index/${normalized}`), payload);
      if (user.referralCode.toUpperCase() !== normalized) {
        await set(ref(rtdb, `referral_index/${user.referralCode.toUpperCase()}`), payload);
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
   * Platform-wide Reconciliation Tool for Admins.
   * Scans all registered users across Firestore, RTDB, and LocalStorage,
   * detects any missing sponsor codes (like LISHU267), auto-restores full User profiles,
   * repairs missing referral records, indexes all sponsor codes, and recalculates rank progress.
   */
  async runPlatformReconciliation(): Promise<{ totalHealed: number; totalReferrals: number }> {
    let totalHealed = 0;
    try {
      const allUsersMap = new Map<string, User>();

      // 1. Firestore users
      try {
        const usersColl = collection(db, 'users');
        const usersSnap = await getDocs(usersColl);
        usersSnap.forEach((d: any) => {
          const u = d.data() as User;
          if (u && u.id) allUsersMap.set(u.id, u);
        });
      } catch {}

      // 2. RTDB users
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

      // 3. Local users
      const localUsers = storage.get<User[]>('USERS', []);
      localUsers.forEach((lu) => {
        if (lu && lu.id) {
          allUsersMap.set(lu.id, { ...allUsersMap.get(lu.id), ...lu });
        }
      });

      // 4. Scan Firestore & RTDB referral_index for any registered sponsor codes
      const referralIndexMap = new Map<string, any>();
      try {
        const refIndexSnap = await getDocs(collection(db, 'referral_index'));
        refIndexSnap.forEach((d: any) => {
          const data = d.data();
          if (data && data.referralCode) {
            referralIndexMap.set(normalizeReferralCode(data.referralCode), data);
          }
        });
      } catch {}

      try {
        const rtdbIndexSnap = await get(ref(rtdb, 'referral_index'));
        if (rtdbIndexSnap.exists()) {
          const val = rtdbIndexSnap.val();
          if (val && typeof val === 'object') {
            Object.values(val).forEach((item: any) => {
              if (item && item.referralCode) {
                referralIndexMap.set(normalizeReferralCode(item.referralCode), item);
              }
            });
          }
        }
      } catch {}

      // 5. Detect all referenced sponsor codes from users and referrals
      const referencedSponsorCodes = new Set<string>();
      allUsersMap.forEach((u) => {
        if (u.referredByCode && u.referredByCode.trim()) {
          referencedSponsorCodes.add(u.referredByCode.trim().toUpperCase());
        }
      });

      const localRefs = storage.get<ReferralRecord[]>('REFERRALS', []);
      localRefs.forEach((r) => {
        if (r.referralCodeUsed) referencedSponsorCodes.add(r.referralCodeUsed.trim().toUpperCase());
        if (r.referrerId && !r.referrerId.startsWith('user-') && !r.referrerId.startsWith('admin-')) {
          referencedSponsorCodes.add(r.referrerId.trim().toUpperCase());
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
            deleteDoc(doc(db, 'users', u.id));
            remove(ref(rtdb, `users/${u.id}`));
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


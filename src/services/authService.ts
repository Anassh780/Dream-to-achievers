import { User, ReferralRecord } from '@/types';
import { auth, db, rtdb } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { ref, get, set, child, remove, onValue } from 'firebase/database';
import { storage } from './storage';
import { rankEngine } from './rankEngine';
import { referralService, normalizeReferralCode } from './referralService';
import { OFFICIAL_ADMIN_USER } from './cloudSyncService';

export const ADMIN_EMAILS = [
  'dreamtoachievers@gmail.com',
  'admin@dreamtoachievers.com',
  'dreamtoachievers.pk@gmail.com',
  'dreamtoachiever@gmail.com',
  'muskyna46@gmail.com',
  'ghhhbbbhjn3@gmail.com',
];

export function formatDisplayName(fullName?: string, email?: string, displayName?: string): string {
  // Always preserve the exact name or username entered by the user
  const explicit = String(fullName || displayName || '').trim();
  if (explicit) {
    return explicit;
  }
  if (email && email.includes('@')) {
    return email.split('@')[0];
  }
  return 'Partner Reseller';
}

export function cleanUserForCloud(u: User): User {
  const finalName = formatDisplayName(u.fullName, u.email);
  return {
    id: String(u.id || '').trim(),
    fullName: finalName,
    email: String(u.email || '').toLowerCase().trim(),
    role: u.role || 'user',
    referralCode: String(u.referralCode || '').trim().toUpperCase(),
    referredByCode: u.referredByCode ? String(u.referredByCode).trim().toUpperCase() : '',
    currentRankSlug: u.currentRankSlug || 'unranked',
    phone: u.phone ? String(u.phone).trim() : '',
    city: u.city ? String(u.city).trim() : '',
    isActive: u.isActive !== false,
    createdAt: u.createdAt || new Date().toISOString(),
  };
}

export const authService = {
  /**
   * Listen to real-time Firebase Auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (fbUser: any) => {
      if (!fbUser) {
        // If no Firebase user but we have local active session, preserve it unless explicitly logged out
        const localCached = authService.getCurrentUser();
        callback(localCached);
        return;
      }

      try {
        const userProfile = await authService.getUserProfile(fbUser.uid, fbUser.email || '');
        if (userProfile) {
          await authService.saveUserProfile(userProfile);
          // Sync referrals from Cloud Firestore/RTDB in background
          referralService.syncUserReferrals(userProfile.id).catch(() => {});
          callback(userProfile);
        } else {
          callback(authService.getCurrentUser());
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        callback(authService.getCurrentUser());
      }
    });
  },

  /**
   * Check if email is in the admin authorization list
   */
  isConfiguredAdmin(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
  },

  /**
   * Get user profile from Firestore / RTDB / Local Storage fallback
   */
  async getUserProfile(uid: string, fallbackEmail = ''): Promise<User | null> {
    const cleanEmail = fallbackEmail.toLowerCase().trim();
    const isAdminEmail = authService.isConfiguredAdmin(cleanEmail);

    try {
      // 1. Try Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data() as User;
        data.fullName = formatDisplayName(data.fullName, data.email, (auth.currentUser?.uid === uid ? auth.currentUser?.displayName : undefined) || undefined);
        // Ensure admin status is updated if email is configured
        if (isAdminEmail && data.role !== 'admin' && data.role !== 'superadmin') {
          data.role = 'admin';
          await authService.saveUserProfile(data);
        }
        storage.setRaw('CURRENT_USER_ID', data.id);
        return data;
      }
    } catch (firestoreErr) {
      console.warn('Firestore fetch failed, checking RTDB/local:', firestoreErr);
    }

    try {
      // 2. Try Realtime Database
      const rtdbRef = ref(rtdb);
      const snapshot = await get(child(rtdbRef, `users/${uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val() as User;
        data.fullName = formatDisplayName(data.fullName, data.email, (auth.currentUser?.uid === uid ? auth.currentUser?.displayName : undefined) || undefined);
        if (isAdminEmail && data.role !== 'admin' && data.role !== 'superadmin') {
          data.role = 'admin';
          await authService.saveUserProfile(data);
        }
        storage.setRaw('CURRENT_USER_ID', data.id);
        return data;
      }
    } catch (rtdbErr) {
      console.warn('RTDB fetch failed, checking local:', rtdbErr);
    }

    // 3. Check local users cache
    const localUsers = storage.get<User[]>('USERS', []);
    const foundLocal = localUsers.find((u) => u.id === uid || u.email.toLowerCase() === cleanEmail);
    if (foundLocal) {
      foundLocal.fullName = formatDisplayName(foundLocal.fullName, foundLocal.email, (auth.currentUser?.uid === uid ? auth.currentUser?.displayName : undefined) || undefined);
      if (isAdminEmail && foundLocal.role !== 'admin' && foundLocal.role !== 'superadmin') {
        foundLocal.role = 'admin';
        await authService.saveUserProfile(foundLocal);
      }
      storage.setRaw('CURRENT_USER_ID', foundLocal.id);
      return foundLocal;
    }

    // 4. Create default profile if user exists in Firebase Auth but no profile yet
    if (cleanEmail) {
      const capturedRef = storage.getRaw('CAPTURED_REF') || undefined;
      let validReferrer: User | undefined;
      if (capturedRef) {
        try {
          const found = await referralService.findReferrerByCode(capturedRef);
          if (found) validReferrer = found;
        } catch {}
      }

      const defaultUser: User = {
        id: uid,
        fullName: formatDisplayName(auth.currentUser?.displayName || '', cleanEmail),
        email: cleanEmail,
        role: isAdminEmail ? 'admin' : 'user',
        referralCode: `DTA-${Math.floor(1000 + Math.random() * 9000)}`,
        referredByCode: validReferrer ? validReferrer.referralCode : (capturedRef || ''),
        currentRankSlug: isAdminEmail ? 'diamond' : 'unranked',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      await authService.saveUserProfile(defaultUser);

      if (defaultUser.referredByCode) {
        const refRecord = {
          id: `ref-${uid}`,
          referrerId: validReferrer ? validReferrer.id : defaultUser.referredByCode,
          referredUserId: defaultUser.id,
          referredUserName: defaultUser.fullName,
          referredUserEmail: defaultUser.email,
          referredUserRank: 'unranked' as const,
          referralCodeUsed: defaultUser.referredByCode,
          status: 'active' as const,
          isQualifying: true,
          createdAt: defaultUser.createdAt,
        };
        await referralService.saveReferralRecord(refRecord).catch(() => {});
      }

      return defaultUser;
    }

    return null;
  },

  /**
   * Save user profile to both Firestore, RTDB, and Local Storage for reliable persistence
   */
  async saveUserProfile(user: User): Promise<void> {
    const clean = cleanUserForCloud(user);

    // Local storage
    const localUsers = storage.get<User[]>('USERS', []);
    const existingIndex = localUsers.findIndex(
      (u) => u.id === clean.id || (u.email && u.email.toLowerCase() === clean.email.toLowerCase())
    );
    if (existingIndex >= 0) {
      localUsers[existingIndex] = { ...localUsers[existingIndex], ...clean };
    } else {
      localUsers.push(clean);
    }
    storage.set('USERS', localUsers);
    storage.set('CURRENT_USER_DATA', clean);
    storage.setRaw('CURRENT_USER_ID', clean.id);

    // Dispatch real-time cross-tab & component events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_users_update', { detail: localUsers }));
    }

    // Firestore
    try {
      await setDoc(doc(db, 'users', clean.id), clean, { merge: true });
    } catch (err) {
      console.warn('Firestore setDoc failed:', err);
    }

    // Realtime Database
    try {
      await set(ref(rtdb, `users/${clean.id}`), clean);
    } catch (err) {
      console.warn('RTDB set failed:', err);
    }

    // Index referral code in background
    referralService.indexReferralCode(clean).catch(() => {});
  },

  /**
   * Returns the currently active session user with robust multi-layer fallback.
   */
  getCurrentUser(): User | null {
    storage.init();
    const cachedData = storage.get<User | null>('CURRENT_USER_DATA', null);
    if (cachedData && cachedData.isActive) {
      return cachedData;
    }

    const currentId = storage.getRaw('CURRENT_USER_ID');
    if (!currentId) return null;
    const users = storage.get<User[]>('USERS', []);
    const found = users.find((u) => u.id === currentId && u.isActive) || null;
    if (found) {
      storage.set('CURRENT_USER_DATA', found);
      return found;
    }
    return null;
  },

  /**
   * Real Firebase Login by Email and Password.
   */
  async login(email: string, password = 'password123'): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;
      const userProfile = await authService.getUserProfile(fbUser.uid, fbUser.email || cleanEmail);

      if (!userProfile) {
        return { success: false, error: 'User profile could not be loaded.' };
      }

      if (!userProfile.isActive) {
        await signOut(auth);
        return { success: false, error: 'This account has been deactivated. Please contact support.' };
      }

      storage.setRaw('CURRENT_USER_ID', userProfile.id);
      return { success: true, user: userProfile };
    } catch (firebaseErr: any) {
      console.warn('Firebase signIn failed, evaluating error:', firebaseErr);

      let errorMessage = 'Failed to sign in. Please verify your credentials.';
      if (firebaseErr?.code === 'auth/user-not-found' || firebaseErr?.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. If you are new, please create an account.';
      } else if (firebaseErr?.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again or reset your password.';
      } else if (firebaseErr?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (firebaseErr?.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Real Firebase User Registration with referral validation and seamless login healing.
   */
  async signup({
    fullName,
    email,
    password = 'password123',
    referralCode,
  }: {
    fullName: string;
    email: string;
    password?: string;
    referralCode?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const isAdminEmail = authService.isConfiguredAdmin(cleanEmail);
    const cleanName = fullName.trim() || cleanEmail.split('@')[0] || 'Partner';

    // Generate unique referral code for the new user (e.g. FARIA482)
    const baseCode = cleanName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'DTA';
    const randNum = Math.floor(100 + Math.random() * 900);
    const newReferralCode = `${baseCode}${randNum}`;

    let validReferrer: User | undefined;
    const cleanRef = referralCode?.trim().toUpperCase() || storage.getRaw('CAPTURED_REF')?.trim().toUpperCase() || undefined;

    if (cleanRef) {
      try {
        const found = await referralService.findReferrerByCode(cleanRef);
        if (found) {
          validReferrer = found;
        } else {
          return {
            success: false,
            error: `Invalid referral code "${cleanRef}". No registered sponsor exists with this code. Please check the code or register directly.`,
          };
        }
      } catch (e) {
        console.warn('Pre-auth referrer check error:', e);
      }
    }

    let fbUser: any = null;

    try {
      // 1. Try to create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      fbUser = userCredential.user;
    } catch (createErr: any) {
      if (createErr?.code === 'auth/email-already-in-use') {
        // User is already registered in Firebase Auth!
        // Attempt to authenticate with the entered password so we can load/sync their profile & referral
        try {
          const loginCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          fbUser = loginCredential.user;
        } catch (signInErr: any) {
          console.warn('Auth email exists and signIn failed:', signInErr);
          if (signInErr?.code === 'auth/wrong-password' || signInErr?.code === 'auth/invalid-credential') {
            return {
              success: false,
              error: 'This email is already registered, but the password entered does not match. Please sign in with your existing password or reset your password.',
            };
          }
          return {
            success: false,
            error: 'An account with this email address already exists. Please sign in to access your dashboard.',
          };
        }
      } else if (createErr?.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters long.' };
      } else if (createErr?.code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      } else {
        return { success: false, error: createErr?.message || 'Failed to create account. Please try again.' };
      }
    }

    if (!fbUser) {
      return { success: false, error: 'Failed to authenticate user.' };
    }

    try {
      // Update Firebase Auth Display Name
      try {
        await updateProfile(fbUser, { displayName: cleanName });
      } catch (pErr) {
        console.warn('updateProfile failed:', pErr);
      }

      // Check if user profile already exists
      let existingProfile = await authService.getUserProfile(fbUser.uid, cleanEmail);

      const assignedReferrerCode = validReferrer
        ? validReferrer.referralCode
        : '';

      const userToSave: User = {
        id: fbUser.uid,
        fullName: cleanName,
        email: cleanEmail,
        role: isAdminEmail ? 'admin' : (existingProfile?.role || 'user'),
        referralCode: existingProfile?.referralCode || newReferralCode,
        referredByCode: assignedReferrerCode,
        currentRankSlug: isAdminEmail ? 'diamond' : (existingProfile?.currentRankSlug || 'unranked'),
        isActive: true,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
      };

      // Save to Cloud & Local
      await authService.saveUserProfile(userToSave);

      // Record referral relationship if referred by code or user
      if (validReferrer && assignedReferrerCode) {
        const referralRecord: ReferralRecord = {
          id: `ref-${userToSave.id}`,
          referrerId: validReferrer.id,
          referredUserId: userToSave.id,
          referredUserName: userToSave.fullName,
          referredUserEmail: userToSave.email,
          referredUserRank: userToSave.currentRankSlug || 'unranked',
          referralCodeUsed: assignedReferrerCode,
          status: 'active',
          isQualifying: true,
          createdAt: userToSave.createdAt || new Date().toISOString(),
        };

        // Save locally and to Cloud Firestore / RTDB
        await referralService.saveReferralRecord(referralRecord);
      }

      // Welcome notification
      const userNotifs = storage.get<any[]>('NOTIFICATIONS', []);
      userNotifs.unshift({
        id: `notif-welcome-${Date.now()}`,
        userId: userToSave.id,
        type: 'welcome',
        title: '🌟 Welcome to Dream to Achievers!',
        message: isAdminEmail
          ? 'Administrator account activated with full platform access.'
          : 'Your partner account is active. Explore products, share your referral link, and work toward Silver Rank!',
        isRead: false,
        linkUrl: isAdminEmail ? '/admin' : '/dashboard/rank-progress',
        createdAt: new Date().toISOString(),
      });
      storage.set('NOTIFICATIONS', userNotifs);

      // Clear captured referral URL storage after successful signup
      storage.remove('CAPTURED_REF');
      try {
        sessionStorage.removeItem('dta_captured_ref');
      } catch {}

      return { success: true, user: userToSave };
    } catch (err: any) {
      console.error('Firebase profile setup error:', err);
      return { success: false, error: 'Failed to configure partner profile. Please try again.' };
    }
  },

  /**
   * Send Password Reset Email.
   */
  async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      console.warn('sendPasswordResetEmail failed:', err);
      return { success: false, error: err?.message || 'Failed to send password reset email.' };
    }
  },

  /**
   * Log out current user from Firebase Auth and local session.
   */
  async logout(): Promise<void> {
    storage.remove('CURRENT_USER_ID');
    storage.remove('CURRENT_USER_DATA');
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
  },

  /**
   * Helper to retrieve locally recorded deleted user IDs/emails/codes to prevent ghost restoration.
   */
  getDeletedBlacklist(): Set<string> {
    const set = new Set<string>();
    const localList = storage.get<string[]>('DELETED_USERS_SET', []);
    localList.forEach((item) => {
      if (item) set.add(item.toLowerCase().trim());
    });
    return set;
  },

  addToDeletedBlacklist(tokens: (string | undefined | null)[]) {
    const list = storage.get<string[]>('DELETED_USERS_SET', []);
    tokens.forEach((t) => {
      if (t && t.trim()) {
        const clean = t.toLowerCase().trim();
        if (!list.includes(clean)) list.push(clean);
      }
    });
    storage.set('DELETED_USERS_SET', list);
  },

  removeFromDeletedBlacklist(tokens: (string | undefined | null)[]) {
    let list = storage.get<string[]>('DELETED_USERS_SET', []);
    tokens.forEach((t) => {
      if (t && t.trim()) {
        const clean = t.toLowerCase().trim();
        list = list.filter((x) => x !== clean);
      }
    });
    storage.set('DELETED_USERS_SET', list);
  },

  /**
   * Permanently delete a user account from local cache, Firestore, and Realtime Database in one click.
   */
  async deleteUser(userId: string, referralCode?: string, email?: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: 'User ID is required.' };

    const cleanEmail = email?.toLowerCase().trim();
    const cleanCode = referralCode?.trim().toUpperCase();
    const normCode = normalizeReferralCode(cleanCode);

    // 1. Add to permanent blacklist
    authService.addToDeletedBlacklist([userId, cleanEmail, cleanCode, normCode]);

    // 2. Remove immediately from local USERS
    const localUsers = storage.get<User[]>('USERS', []);
    const updatedUsers = localUsers.filter(
      (u) =>
        u.id !== userId &&
        (!cleanEmail || u.email?.toLowerCase() !== cleanEmail) &&
        (!cleanCode || u.referralCode?.toUpperCase() !== cleanCode)
    );
    storage.set('USERS', updatedUsers);

    // 3. Clean local referrals relating to this user
    const localReferrals = storage.get<any[]>('REFERRALS', []);
    const updatedReferrals = localReferrals.filter(
      (r) =>
        r.referredUserId !== userId &&
        r.referrerId !== userId &&
        (!cleanEmail || r.referredUserEmail?.toLowerCase() !== cleanEmail) &&
        (!cleanCode || r.referralCodeUsed?.toUpperCase() !== cleanCode)
    );
    storage.set('REFERRALS', updatedReferrals);

    // 4. Delete from Firestore users collection
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch {}

    if (cleanEmail) {
      try {
        const emailSnap = await getDocs(query(collection(db, 'users'), where('email', '==', cleanEmail)));
        for (const d of emailSnap.docs) {
          await deleteDoc(doc(db, 'users', d.id)).catch(() => {});
        }
      } catch {}
    }

    if (cleanCode) {
      try {
        const codeSnap = await getDocs(query(collection(db, 'users'), where('referralCode', '==', cleanCode)));
        for (const d of codeSnap.docs) {
          await deleteDoc(doc(db, 'users', d.id)).catch(() => {});
        }
      } catch {}
    }

    // 5. Delete from Firestore referral_index
    if (normCode) {
      try {
        await deleteDoc(doc(db, 'referral_index', normCode));
      } catch {}
    }
    try {
      await deleteDoc(doc(db, 'referral_index', userId));
    } catch {}

    // 6. Delete matching referral records from Firestore
    try {
      const refSnap1 = await getDocs(query(collection(db, 'referrals'), where('referredUserId', '==', userId)));
      for (const d of refSnap1.docs) {
        await deleteDoc(doc(db, 'referrals', d.id)).catch(() => {});
      }
      const refSnap2 = await getDocs(query(collection(db, 'referrals'), where('referrerId', '==', userId)));
      for (const d of refSnap2.docs) {
        await deleteDoc(doc(db, 'referrals', d.id)).catch(() => {});
      }
    } catch {}

    // 7. Delete from Realtime Database
    try {
      await remove(ref(rtdb, `users/${userId}`));
      await remove(ref(rtdb, `user_referrals/${userId}`));
      if (normCode) {
        await remove(ref(rtdb, `referral_index/${normCode}`));
      }
    } catch {}

    // 8. Record permanent tombstone in Firestore and RTDB deleted_users collection
    try {
      const tombstone = {
        id: userId,
        email: cleanEmail || '',
        referralCode: cleanCode || '',
        deletedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'deleted_users', userId), tombstone, { merge: true });
      await set(ref(rtdb, `deleted_users/${userId}`), tombstone);
    } catch {}

    // 9. Dispatch sync events so all views and open tabs refresh immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: 'USERS', value: updatedUsers } }));
      window.dispatchEvent(new CustomEvent('dta_users_update', { detail: updatedUsers }));
    }

    return { success: true };
  },

  /**
   * Fetch all registered users from Firestore, RTDB, and Local Storage, merging and deduplicating.
   * All active users are 100% visible, with deleted users permanently filtered and purged.
   */
  async getAllUsers(): Promise<User[]> {
    const userMap = new Map<string, User>();
    const blacklist = authService.getDeletedBlacklist();

    // Fetch deleted_users tombstones from Firestore and RTDB
    try {
      const delSnap = await getDocs(collection(db, 'deleted_users'));
      delSnap.forEach((d: any) => {
        const data = d.data();
        if (data?.id) blacklist.add(data.id.toLowerCase().trim());
        if (data?.email) blacklist.add(data.email.toLowerCase().trim());
        if (data?.referralCode) blacklist.add(data.referralCode.toLowerCase().trim());
      });
    } catch {}

    try {
      const rtdbDelSnap = await get(ref(rtdb, 'deleted_users'));
      if (rtdbDelSnap.exists()) {
        const val = rtdbDelSnap.val();
        if (val && typeof val === 'object') {
          Object.values(val).forEach((item: any) => {
            if (item?.id) blacklist.add(item.id.toLowerCase().trim());
            if (item?.email) blacklist.add(item.email.toLowerCase().trim());
            if (item?.referralCode) blacklist.add(item.referralCode.toLowerCase().trim());
          });
        }
      }
    } catch {}

    // 0. Always guarantee Official Executive Admin user presence
    userMap.set(OFFICIAL_ADMIN_USER.id, OFFICIAL_ADMIN_USER);

    // 1. Seed from local storage (excluding any blacklisted/deleted)
    const localUsers = storage.get<User[]>('USERS', []);
    for (const u of localUsers) {
      if (u.id) {
        const isDeleted =
          blacklist.has(u.id.toLowerCase()) ||
          (u.email && blacklist.has(u.email.toLowerCase())) ||
          (u.referralCode && blacklist.has(u.referralCode.toLowerCase()));

        if (!isDeleted) {
          if (u.email && ADMIN_EMAILS.includes(u.email.toLowerCase())) {
            u.role = 'admin';
            u.currentRankSlug = 'diamond';
          }
          userMap.set(u.id, u);
        }
      }
    }

    // 2. Fetch all from Firestore
    try {
      const snap: any = await getDocs(collection(db, 'users'));
      snap.forEach((d: any) => {
        const data = d.data() as User;
        if (data && data.id) {
          const isDeleted =
            blacklist.has(data.id.toLowerCase()) ||
            (data.email && blacklist.has(data.email.toLowerCase())) ||
            (data.referralCode && blacklist.has(data.referralCode.toLowerCase()));

          if (isDeleted) {
            // Clean up resurrecting doc from Firestore immediately
            deleteDoc(doc(db, 'users', data.id)).catch(() => {});
          } else {
            if (data.email && ADMIN_EMAILS.includes(data.email.toLowerCase())) {
              data.role = 'admin';
              data.currentRankSlug = 'diamond';
            }
            userMap.set(data.id, { ...userMap.get(data.id), ...data });
          }
        }
      });
    } catch (err) {
      console.warn('Firestore getAllUsers fetch warning:', err);
    }

    // 3. Fetch all from RTDB
    try {
      const rtdbSnap = await get(ref(rtdb, 'users'));
      if (rtdbSnap.exists()) {
        const val = rtdbSnap.val();
        if (val && typeof val === 'object') {
          Object.values(val).forEach((item: any) => {
            if (item && item.id) {
              const isDeleted =
                blacklist.has(item.id.toLowerCase()) ||
                (item.email && blacklist.has(item.email.toLowerCase())) ||
                (item.referralCode && blacklist.has(item.referralCode.toLowerCase()));

              if (isDeleted) {
                remove(ref(rtdb, `users/${item.id}`)).catch(() => {});
              } else {
                if (item.email && ADMIN_EMAILS.includes(item.email.toLowerCase())) {
                  item.role = 'admin';
                  item.currentRankSlug = 'diamond';
                }
                userMap.set(item.id, { ...userMap.get(item.id), ...item });
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn('RTDB getAllUsers fetch warning:', err);
    }

    // 4. Purge any fake synthetic accounts and keep only 100% REAL users
    const realUsers: User[] = [];
    userMap.forEach((u) => {
      const isFakeSynthetic =
        (u.email?.endsWith('@dreamtoachievers.com') && u.id?.startsWith('user-')) ||
        (u.id && u.id.length > 25 && /^[A-Z0-9]+$/.test(u.id) && u.email?.endsWith('@dreamtoachievers.com'));

      const isDeleted =
        blacklist.has(u.id.toLowerCase()) ||
        (u.email && blacklist.has(u.email.toLowerCase())) ||
        (u.referralCode && blacklist.has(u.referralCode.toLowerCase()));

      if (isFakeSynthetic || isDeleted) {
        try {
          deleteDoc(doc(db, 'users', u.id));
          remove(ref(rtdb, `users/${u.id}`));
        } catch {}
      } else {
        realUsers.push({
          ...u,
          fullName: formatDisplayName(u.fullName, u.email),
        });
      }
    });

    storage.set('USERS', realUsers);
    return realUsers;
  },

  /**
   * Real-time subscription to all registered users from Firestore and RTDB.
   */
  subscribeToAllUsers(callback: (users: User[]) => void): () => void {
    // Initial fetch
    authService.getAllUsers().then(callback).catch(() => {});

    // Listen to Firestore updates
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = onSnapshot(
        collection(db, 'users'),
        (snapshot: any) => {
          const blacklist = authService.getDeletedBlacklist();
          const cloudUsers: User[] = [];
          snapshot.forEach((d: any) => {
            const data = d.data() as User;
            if (data && data.id) {
              const isDeleted =
                blacklist.has(data.id.toLowerCase()) ||
                (data.email && blacklist.has(data.email.toLowerCase())) ||
                (data.referralCode && blacklist.has(data.referralCode.toLowerCase()));

              if (!isDeleted) {
                cloudUsers.push({
                  ...data,
                  fullName: formatDisplayName(data.fullName, data.email),
                });
              }
            }
          });

          // Always ensure admin presence
          if (!cloudUsers.some((u) => u.id === OFFICIAL_ADMIN_USER.id)) {
            cloudUsers.unshift(OFFICIAL_ADMIN_USER);
          }

          storage.set('USERS', cloudUsers);
          callback(cloudUsers);
        },
        (err: any) => {
          console.warn('Firestore user stream warning:', err);
        }
      );
    } catch (e) {
      console.warn('Firestore onSnapshot setup warning:', e);
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  },
};

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
          storage.set('CURRENT_USER_DATA', userProfile);
          storage.setRaw('CURRENT_USER_ID', userProfile.id);
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
        fullName: cleanEmail.split('@')[0] || 'Partner',
        email: cleanEmail,
        role: isAdminEmail ? 'admin' : 'user',
        referralCode: `DTA-${Math.floor(1000 + Math.random() * 9000)}`,
        referredByCode: validReferrer ? validReferrer.referralCode : capturedRef,
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
    // Local storage
    const localUsers = storage.get<User[]>('USERS', []);
    const existingIndex = localUsers.findIndex(
      (u) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase())
    );
    if (existingIndex >= 0) {
      localUsers[existingIndex] = { ...localUsers[existingIndex], ...user };
    } else {
      localUsers.push(user);
    }
    storage.set('USERS', localUsers);
    storage.set('CURRENT_USER_DATA', user);
    storage.setRaw('CURRENT_USER_ID', user.id);

    // Dispatch real-time cross-tab & component events
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_users_update', { detail: localUsers }));
    }

    // Firestore
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (err) {
      console.warn('Firestore setDoc failed:', err);
    }

    // Realtime Database
    try {
      await set(ref(rtdb, `users/${user.id}`), user);
    } catch (err) {
      console.warn('RTDB set failed:', err);
    }

    // Index referral code in background
    referralService.indexReferralCode(user).catch(() => {});
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
    phone,
    city,
  }: {
    fullName: string;
    email: string;
    password?: string;
    referralCode?: string;
    phone?: string;
    city?: string;
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

      // 2. Retry referrer lookup if not found earlier
      if (cleanRef && !validReferrer) {
        try {
          const retryFound = await referralService.findReferrerByCode(cleanRef);
          if (retryFound) {
            validReferrer = retryFound;
          }
        } catch (retryErr) {
          console.warn('Post-auth referrer lookup retry:', retryErr);
        }
      }

      // Check if user profile already exists
      let existingProfile = await authService.getUserProfile(fbUser.uid, cleanEmail);

      const assignedReferrerCode = validReferrer
        ? validReferrer.referralCode
        : (cleanRef || existingProfile?.referredByCode);

      const userToSave: User = {
        id: fbUser.uid,
        fullName: cleanName || existingProfile?.fullName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: isAdminEmail ? 'admin' : (existingProfile?.role || 'user'),
        referralCode: existingProfile?.referralCode || newReferralCode,
        referredByCode: assignedReferrerCode,
        currentRankSlug: isAdminEmail ? 'diamond' : (existingProfile?.currentRankSlug || 'unranked'),
        phone: phone?.trim() || existingProfile?.phone,
        city: city?.trim() || existingProfile?.city,
        isActive: true,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
      };

      // Save to Cloud & Local
      await authService.saveUserProfile(userToSave);

      // Record referral relationship if referred by code or user
      if (assignedReferrerCode) {
        const referralRecord: ReferralRecord = {
          id: `ref-${userToSave.id}`,
          referrerId: validReferrer ? validReferrer.id : assignedReferrerCode,
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

        // Notify inviter if user object is known
        if (validReferrer) {
          const notifs = storage.get<any[]>('NOTIFICATIONS', []);
          notifs.unshift({
            id: `notif-${Date.now()}`,
            userId: validReferrer.id,
            type: 'referral_joined',
            title: '👥 New Community Member Joined!',
            message: `${userToSave.fullName} registered using your referral code (${validReferrer.referralCode}).`,
            isRead: false,
            linkUrl: '/dashboard/referrals',
            createdAt: new Date().toISOString(),
          });
          storage.set('NOTIFICATIONS', notifs);

          // Trigger rank re-evaluation for inviter
          rankEngine.checkAndPromoteUser(validReferrer.id);
        }
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
   * Helper to retrieve locally recorded deleted user IDs to prevent ghost restoration.
   */
  getDeletedUserIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('dta_deleted_user_ids');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Mark a user ID as deleted in localStorage blacklist.
   */
  markUserAsDeleted(userId: string): void {
    if (typeof window === 'undefined' || !userId) return;
    try {
      const deleted = authService.getDeletedUserIds();
      if (!deleted.includes(userId)) {
        deleted.push(userId);
        localStorage.setItem('dta_deleted_user_ids', JSON.stringify(deleted));
      }
    } catch {}
  },

  /**
   * Permanently delete a user account from local cache, Firestore, and Realtime Database.
   */
  async deleteUser(userId: string, referralCode?: string): Promise<{ success: boolean; error?: string }> {
    if (!userId) return { success: false, error: 'User ID is required.' };

    // 1. Mark in deleted blacklist
    authService.markUserAsDeleted(userId);

    // 2. Remove immediately from local USERS
    const localUsers = storage.get<User[]>('USERS', []);
    const updatedUsers = localUsers.filter((u) => u.id !== userId);
    storage.set('USERS', updatedUsers);

    // 3. Clean local referrals relating to this user
    const localReferrals = storage.get<any[]>('REFERRALS', []);
    const updatedReferrals = localReferrals.filter(
      (r) => r.referredUserId !== userId && r.referrerId !== userId
    );
    storage.set('REFERRALS', updatedReferrals);

    // 4. Delete from Firestore
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.warn('Firestore delete user error (non-fatal):', err);
    }

    if (referralCode) {
      const norm = normalizeReferralCode(referralCode);
      if (norm) {
        try {
          await deleteDoc(doc(db, 'referral_index', norm));
        } catch (err) {
          console.warn('Firestore delete referral_index error (non-fatal):', err);
        }
      }
    }

    // 5. Delete from Realtime Database
    try {
      await remove(ref(rtdb, `users/${userId}`));
    } catch (err) {
      console.warn('RTDB delete user error (non-fatal):', err);
    }

    try {
      await remove(ref(rtdb, `user_referrals/${userId}`));
    } catch (err) {
      console.warn('RTDB delete user_referrals error (non-fatal):', err);
    }

    // Dispatch sync event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_storage_change', { detail: { key: 'USERS', value: updatedUsers } }));
    }

    return { success: true };
  },

  /**
   * Fetch all registered users from Firestore, RTDB, and Local Storage, merging and deduplicating.
   */
  async getAllUsers(): Promise<User[]> {
    const deletedIds = new Set(authService.getDeletedUserIds());
    const userMap = new Map<string, User>();

    // 0. Always guarantee Official Executive Admin user presence
    userMap.set(OFFICIAL_ADMIN_USER.id, OFFICIAL_ADMIN_USER);

    // 1. Seed from local storage
    const localUsers = storage.get<User[]>('USERS', []);
    for (const u of localUsers) {
      if (u.id && !deletedIds.has(u.id)) {
        if (u.email && ADMIN_EMAILS.includes(u.email.toLowerCase())) {
          u.role = 'admin';
          u.currentRankSlug = 'diamond';
        }
        userMap.set(u.id, u);
      }
    }

    // 2. Fetch all from Firestore
    try {
      const snap: any = await getDocs(collection(db, 'users'));
      snap.forEach((d: any) => {
        const data = d.data() as User;
        if (data && data.id && !deletedIds.has(data.id)) {
          if (data.email && ADMIN_EMAILS.includes(data.email.toLowerCase())) {
            data.role = 'admin';
            data.currentRankSlug = 'diamond';
          }
          userMap.set(data.id, { ...userMap.get(data.id), ...data });
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
            if (item && item.id && !deletedIds.has(item.id)) {
              if (item.email && ADMIN_EMAILS.includes(item.email.toLowerCase())) {
                item.role = 'admin';
                item.currentRankSlug = 'diamond';
              }
              userMap.set(item.id, { ...userMap.get(item.id), ...item });
            }
          });
        }
      }
    } catch (err) {
      console.warn('RTDB getAllUsers fetch warning:', err);
    }

    const merged = Array.from(userMap.values());
    storage.set('USERS', merged);
    return merged;
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
          const deletedIds = new Set(authService.getDeletedUserIds());
          const cloudUsers: User[] = [];
          snapshot.forEach((d: any) => {
            const data = d.data() as User;
            if (data && data.id && !deletedIds.has(data.id)) {
              cloudUsers.push(data);
            }
          });

          const current = storage.get<User[]>('USERS', []).filter((u) => !deletedIds.has(u.id));
          const userMap = new Map<string, User>();
          current.forEach((u) => userMap.set(u.id, u));
          cloudUsers.forEach((u) => userMap.set(u.id, { ...userMap.get(u.id), ...u }));
          const merged = Array.from(userMap.values());
          storage.set('USERS', merged);
          callback(merged);
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

import { User } from '@/types';
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
} from 'firebase/firestore';
import { ref, get, set, child } from 'firebase/database';
import { storage } from './storage';
import { rankEngine } from './rankEngine';
import { referralService } from './referralService';

export const ADMIN_EMAILS = [
  'muskyna46@gmail.com',
  'ghhhbbbhjn3@gmail.com',
  'dreamtoachievers@gmail.com',
  'admin@dreamtoachievers.com',
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
      const defaultUser: User = {
        id: uid,
        fullName: cleanEmail.split('@')[0] || 'Partner',
        email: cleanEmail,
        role: isAdminEmail ? 'admin' : 'user',
        referralCode: `DTA-${Math.floor(1000 + Math.random() * 9000)}`,
        currentRankSlug: isAdminEmail ? 'diamond' : 'unranked',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      await authService.saveUserProfile(defaultUser);
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
    const existingIndex = localUsers.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      localUsers[existingIndex] = user;
    } else {
      localUsers.push(user);
    }
    storage.set('USERS', localUsers);
    storage.set('CURRENT_USER_DATA', user);
    storage.setRaw('CURRENT_USER_ID', user.id);

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
   * Real Firebase User Registration with referral validation.
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

    // Generate unique referral code for the new user (e.g. HAMZA482)
    const baseCode = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'DTA';
    const randNum = Math.floor(100 + Math.random() * 900);
    const newReferralCode = `${baseCode}${randNum}`;

    let validReferrer: User | undefined;

    if (referralCode) {
      const cleanRef = referralCode.trim().toUpperCase();
      const found = await referralService.findReferrerByCode(cleanRef);
      if (found) {
        validReferrer = found;
      }
    }

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;

      // Update Firebase Auth Display Name
      try {
        await updateProfile(fbUser, { displayName: fullName.trim() });
      } catch (pErr) {
        console.warn('updateProfile failed:', pErr);
      }

      const newUser: User = {
        id: fbUser.uid,
        fullName: fullName.trim(),
        email: cleanEmail,
        role: isAdminEmail ? 'admin' : 'user',
        referralCode: newReferralCode,
        referredByCode: validReferrer ? validReferrer.referralCode : undefined,
        currentRankSlug: isAdminEmail ? 'diamond' : 'unranked',
        phone: phone?.trim(),
        city: city?.trim(),
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      // Save to Cloud & Local
      await authService.saveUserProfile(newUser);

      // Record referral relationship if referred
      if (validReferrer) {
        const referralRecord = {
          id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          referrerId: validReferrer.id,
          referredUserId: newUser.id,
          referredUserName: newUser.fullName,
          referredUserEmail: newUser.email,
          referredUserRank: 'unranked' as const,
          referralCodeUsed: validReferrer.referralCode,
          status: 'active' as const,
          isQualifying: true,
          createdAt: new Date().toISOString(),
        };

        // Save locally and to Cloud Firestore / RTDB
        await referralService.saveReferralRecord(referralRecord);

        // Notify inviter
        const notifs = storage.get<any[]>('NOTIFICATIONS', []);
        notifs.unshift({
          id: `notif-${Date.now()}`,
          userId: validReferrer.id,
          type: 'referral_joined',
          title: '👥 New Community Member Joined!',
          message: `${newUser.fullName} registered using your referral code (${validReferrer.referralCode}).`,
          isRead: false,
          linkUrl: '/dashboard/referrals',
          createdAt: new Date().toISOString(),
        });
        storage.set('NOTIFICATIONS', notifs);

        // Trigger rank re-evaluation for inviter
        rankEngine.checkAndPromoteUser(validReferrer.id);
      }

      // Welcome notification
      const userNotifs = storage.get<any[]>('NOTIFICATIONS', []);
      userNotifs.unshift({
        id: `notif-welcome-${Date.now()}`,
        userId: newUser.id,
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

      return { success: true, user: newUser };
    } catch (err: any) {
      console.error('Firebase signup error:', err);

      let errorMessage = 'Failed to create partner account. Please try again.';
      if (err?.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email address already exists. Please sign in.';
      } else if (err?.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      return { success: false, error: errorMessage };
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
};

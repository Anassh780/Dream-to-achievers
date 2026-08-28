import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRankProgress } from '@/types';
import { authService } from '@/services/authService';
import { rankEngine } from '@/services/rankEngine';
import { salesService } from '@/services/salesService';
import { referralService } from '@/services/referralService';
import { notificationService } from '@/services/notificationService';
import { storage } from '@/services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  rankProgress: UserRankProgress | null;
  unreadNotifsCount: number;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    password?: string;
    referralCode?: string;
    phone?: string;
    city?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logout: () => Promise<void>;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [rankProgress, setRankProgress] = useState<UserRankProgress | null>(null);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  const calculateUserMetrics = useCallback((currentUser: User | null) => {
    if (currentUser) {
      const salesCount = salesService.getQualifyingSalesCount(currentUser.id);
      const communityCount = referralService.getQualifyingCommunityCount(currentUser.id);
      const progress = rankEngine.calculateProgress(salesCount, communityCount);
      setRankProgress(progress);
      setUnreadNotifsCount(notificationService.getUnreadCount(currentUser.id));
    } else {
      setRankProgress(null);
      setUnreadNotifsCount(0);
    }
  }, []);

  const refreshUserData = useCallback(() => {
    storage.init();
    referralService.captureFromUrl();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    calculateUserMetrics(currentUser);

    if (currentUser?.id) {
      referralService.syncUserReferrals(currentUser.id).then(() => {
        calculateUserMetrics(authService.getCurrentUser());
      }).catch(() => {});
    }
  }, [calculateUserMetrics]);

  useEffect(() => {
    // 1. Initial local load
    refreshUserData();

    // 2. Real-time Firebase Auth listener
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      calculateUserMetrics(firebaseUser);
    });

    // 3. Storage event listener for cross-tab sync
    const handleStorageChange = () => {
      refreshUserData();
    };

    window.addEventListener('dta_storage_change', handleStorageChange);
    return () => {
      unsubscribe();
      window.removeEventListener('dta_storage_change', handleStorageChange);
    };
  }, [refreshUserData, calculateUserMetrics]);

  const login = async (email: string, password = 'password123') => {
    const res = await authService.login(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      calculateUserMetrics(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    password?: string;
    referralCode?: string;
    phone?: string;
    city?: string;
  }) => {
    const res = await authService.signup(data);
    if (res.success && res.user) {
      setUser(res.user);
      calculateUserMetrics(res.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRankProgress(null);
    setUnreadNotifsCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin:
          user?.role === 'admin' ||
          user?.role === 'superadmin' ||
          (user?.email ? authService.isConfiguredAdmin(user.email) : false),
        rankProgress,
        unreadNotifsCount,
        login,
        signup,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { ReferralRecord, User } from '@/types';
import { storage } from './storage';

export const referralService = {
  /**
   * Generates the public referral URL for a given referral code.
   */
  getReferralUrl(referralCode: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dreamtoachievers.com';
    return `${origin}/signup?ref=${encodeURIComponent(referralCode)}`;
  },

  /**
   * Captures referral code from query params on page load.
   */
  captureFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const clean = ref.trim().toUpperCase();
      storage.setRaw('CAPTURED_REF', clean);
      return clean;
    }
    return storage.getRaw('CAPTURED_REF');
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
   * Returns count of qualifying community members for a specific user.
   */
  getQualifyingCommunityCount(userId: string): number {
    return this.getUserReferrals(userId).filter((r) => r.isQualifying).length;
  },

  /**
   * Validates if a referral code is valid and does not create a self-referral or circular dependency.
   */
  validateReferralCode(
    code: string,
    currentUserId?: string
  ): { valid: boolean; referrer?: User; error?: string } {
    const clean = code.trim().toUpperCase();
    const users = storage.get<User[]>('USERS', []);
    const referrer = users.find((u) => u.referralCode === clean);

    if (!referrer) {
      return { valid: false, error: 'Referral code does not exist.' };
    }

    if (currentUserId && referrer.id === currentUserId) {
      return { valid: false, error: 'You cannot use your own referral code.' };
    }

    return { valid: true, referrer };
  },
};

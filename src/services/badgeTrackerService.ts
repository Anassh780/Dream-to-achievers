// Badge Tracker Service - Tracks unseen counts per dashboard section and auto-decrements on view

class BadgeTrackerService {
  private getStorageKey(section: string, userId: string): string {
    return `dta_badge_viewed_${section}_${userId}`;
  }

  // --- REFERRALS BADGE ---
  public getUnseenReferralsCount(userId: string, currentTotal: number): number {
    if (typeof window === 'undefined' || !userId) return 0;
    const stored = localStorage.getItem(this.getStorageKey('referrals', userId));
    if (stored === null) {
      // First visit: initialize with current count so historical items don't show as unread
      localStorage.setItem(this.getStorageKey('referrals', userId), String(currentTotal));
      return 0;
    }
    const lastViewed = parseInt(stored, 10) || 0;
    return Math.max(0, currentTotal - lastViewed);
  }

  public markReferralsSeen(userId: string, currentTotal: number): void {
    if (typeof window === 'undefined' || !userId) return;
    localStorage.setItem(this.getStorageKey('referrals', userId), String(currentTotal));
    window.dispatchEvent(new Event('dta_badge_update'));
  }

  // --- SALES / ORDERS BADGE ---
  public getUnseenSalesCount(userId: string, currentTotal: number): number {
    if (typeof window === 'undefined' || !userId) return 0;
    const stored = localStorage.getItem(this.getStorageKey('sales', userId));
    if (stored === null) {
      localStorage.setItem(this.getStorageKey('sales', userId), String(currentTotal));
      return 0;
    }
    const lastViewed = parseInt(stored, 10) || 0;
    return Math.max(0, currentTotal - lastViewed);
  }

  public markSalesSeen(userId: string, currentTotal: number): void {
    if (typeof window === 'undefined' || !userId) return;
    localStorage.setItem(this.getStorageKey('sales', userId), String(currentTotal));
    window.dispatchEvent(new Event('dta_badge_update'));
  }

  // --- REWARDS BADGE ---
  public getUnseenRewardsCount(userId: string, currentTotal: number): number {
    if (typeof window === 'undefined' || !userId) return 0;
    const stored = localStorage.getItem(this.getStorageKey('rewards', userId));
    if (stored === null) {
      localStorage.setItem(this.getStorageKey('rewards', userId), String(currentTotal));
      return 0;
    }
    const lastViewed = parseInt(stored, 10) || 0;
    return Math.max(0, currentTotal - lastViewed);
  }

  public markRewardsSeen(userId: string, currentTotal: number): void {
    if (typeof window === 'undefined' || !userId) return;
    localStorage.setItem(this.getStorageKey('rewards', userId), String(currentTotal));
    window.dispatchEvent(new Event('dta_badge_update'));
  }

  // --- ADMIN ORDERS BADGE ---
  public getUnseenAdminOrdersCount(currentPending: number): number {
    if (typeof window === 'undefined') return 0;
    if (currentPending <= 0) return 0;
    const stored = localStorage.getItem('dta_badge_admin_orders_seen');
    if (stored === null) {
      return currentPending;
    }
    const lastViewed = parseInt(stored, 10) || 0;
    return Math.max(0, currentPending - lastViewed);
  }

  public markAdminOrdersSeen(currentPending: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dta_badge_admin_orders_seen', String(currentPending));
    window.dispatchEvent(new Event('dta_badge_update'));
  }

  // --- ADMIN PAYOUTS BADGE ---
  public getUnseenAdminPayoutsCount(currentPending: number): number {
    if (typeof window === 'undefined') return 0;
    if (currentPending <= 0) return 0;
    const stored = localStorage.getItem('dta_badge_admin_payouts_seen');
    if (stored === null) {
      return currentPending;
    }
    const lastViewed = parseInt(stored, 10) || 0;
    return Math.max(0, currentPending - lastViewed);
  }

  public markAdminPayoutsSeen(currentPending: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dta_badge_admin_payouts_seen', String(currentPending));
    window.dispatchEvent(new Event('dta_badge_update'));
  }

  // --- ADMIN USERS BADGE ---
  public getUnseenAdminUsersCount(currentTotal: number): number {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('dta_badge_admin_users_seen');
    if (stored === null) {
      localStorage.setItem('dta_badge_admin_users_seen', String(currentTotal));
      return 0;
    }
    const lastViewed = parseInt(stored, 10) || 0;
    return Math.max(0, currentTotal - lastViewed);
  }

  public markAdminUsersSeen(currentTotal: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dta_badge_admin_users_seen', String(currentTotal));
    window.dispatchEvent(new Event('dta_badge_update'));
  }
}

export const badgeTrackerService = new BadgeTrackerService();

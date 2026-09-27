import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/services/storage';
import { authService, SUPERADMIN_EMAIL, isSuperAdminEmail } from '@/services/authService';
import { referralService, normalizeReferralCode } from '@/services/referralService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { User, RankSlug, ReferralRecord, Sale } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  MagnifyingGlass,
  Users,
  X,
  Trash,
  CheckCircle,
  TreeStructure,
  Crown,
  Check,
  Warning,
  ArrowClockwise,
  DownloadSimple,
  ShoppingCart,
  Sparkle,
  Fire,
  Clock,
  ShieldCheck,
  ShieldPlus,
  ShieldSlash,
  LockKey,
  Key,
  EnvelopeSimple,
} from '@phosphor-icons/react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin, isSuperAdmin } = useAuth();
  const isSuperAdminAuthorized = isSuperAdmin || isSuperAdminEmail(currentAdmin?.email);
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('USERS', []));

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (isNaN(diffSec) || diffSec < 0) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 30) return `${diffDay}d ago`;
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return `${diffMonth}mo ago`;
      const diffYear = Math.floor(diffDay / 365);
      return `${diffYear}y ago`;
    } catch {
      return dateStr;
    }
  };

  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => storage.get<ReferralRecord[]>('REFERRALS', []));
  const [sales, setSales] = useState<Sale[]>(() => storage.get<Sale[]>('SALES', []));
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStandardizing, setIsStandardizing] = useState(false);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [rescueEmail, setRescueEmail] = useState('');
  const [rescueName, setRescueName] = useState('');
  const [rescueSponsor, setRescueSponsor] = useState('DTA-6267');
  const [isRescuing, setIsRescuing] = useState(false);

  // Search, Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTab, setQuickTab] = useState<'all' | 'admins' | 'active' | 'top_sellers' | 'top_recruiters' | 'high_ranks' | 'suspended'>('all');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [referralFilter, setReferralFilter] = useState<string>('all');
  const [salesFilter, setSalesFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<{ user: User; targetRole: 'admin' | 'reseller' } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') toastError(text);
    else toastSuccess(text);
  };

  const refreshData = async () => {
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers);
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
      setSales(storage.get<Sale[]>('SALES', []));
    } catch {
      setUsers(storage.get<User[]>('USERS', []));
      setSales(storage.get<Sale[]>('SALES', []));
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await referralService.runPlatformReconciliation().catch(() => {});
      const synced = await authService.getAllUsers();
      setUsers(synced);
      setSales(storage.get<Sale[]>('SALES', []));
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
      showToast(`Synchronized ${synced.length} registered partners from cloud database.`);
    } catch {
      showToast('Could not reach Firebase. Please check your connection and try again.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStandardizeCodes = async () => {
    setIsStandardizing(true);
    try {
      const res = await referralService.standardizeAndResetAllReferralCodes();
      await refreshData();
      showToast(
        `Reset complete! Updated ${res.totalCodesMigrated} partner codes to DTA prefix, updated ${res.totalDownlinesUpdated} referral records.`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Failed to standardize referral codes.', 'error');
    } finally {
      setIsStandardizing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = authService.subscribeToAllUsers((cloudUsers) => {
      setUsers(cloudUsers);
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
    });

    const handleStorage = () => refreshData();
    window.addEventListener('dta_storage_change', handleStorage);
    window.addEventListener('dta_users_update', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('dta_storage_change', handleStorage);
      window.removeEventListener('dta_users_update', handleStorage);
    };
  }, []);

  // Compute User Sales & Downline Metrics Map for ultra-fast filtering & sorting
  const userMetricsMap = useMemo(() => {
    const map = new Map<string, {
      salesCount: number;
      unitsSold: number;
      totalRevenue: number;
      totalProfit: number;
      downlineCount: number;
      qualifyingCount: number;
    }>();

    for (const u of users) {
      // 1. Sales metrics
      const userSales = sales.filter((s) => s.userId === u.id);
      const deliveredSales = userSales.filter(
        (s) => s.status === 'delivered' || s.status === 'confirmed' || s.status === 'fulfilled' || s.isQualifying
      );
      const unitsSold = deliveredSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
      const totalRevenue = deliveredSales.reduce((sum, s) => sum + (s.sellingPrice * (s.quantity || 1)), 0);
      const totalProfit = deliveredSales.reduce((sum, s) => sum + (s.profitMargin * (s.quantity || 1)), 0);

      // 2. Referral metrics
      const userRefs = referralService.getUserReferrals(u.id);
      const downlineCount = userRefs.length;
      const qualifyingCount = userRefs.filter((r) => r.isQualifying).length;

      map.set(u.id, {
        salesCount: deliveredSales.length,
        unitsSold,
        totalRevenue,
        totalProfit,
        downlineCount,
        qualifyingCount,
      });
    }

    return map;
  }, [users, sales, referrals]);

  // Find Sponsor details for any user
  const getSponsorInfo = (referredByCode?: string) => {
    if (!referredByCode || referredByCode === 'undefined' || referredByCode.trim().toLowerCase() === 'undefined') return null;
    const clean = referredByCode.trim().toUpperCase();
    const norm = normalizeReferralCode(clean);
    const sponsor = users.find(
      (u) =>
        (norm && normalizeReferralCode(u.referralCode) === norm) ||
        u.referralCode?.toUpperCase() === clean ||
        u.id === referredByCode
    );
    return sponsor ? { name: sponsor.fullName, code: sponsor.referralCode } : { name: clean, code: clean };
  };

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const metrics = userMetricsMap.get(u.id) || {
          salesCount: 0,
          unitsSold: 0,
          totalRevenue: 0,
          totalProfit: 0,
          downlineCount: 0,
          qualifyingCount: 0,
        };

        // 1. Search Query (Name, Email, Referral Code, Sponsor)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = (u.fullName || '').toLowerCase().includes(q);
          const matchesEmail = (u.email || '').toLowerCase().includes(q);
          const matchesCode = (u.referralCode || '').toLowerCase().includes(q);
          const matchesSponsor = (u.referredByCode || '').toLowerCase().includes(q);

          if (!matchesName && !matchesEmail && !matchesCode && !matchesSponsor) {
            return false;
          }
        }

        // 2. Quick Tab Preset
        if (quickTab === 'admins' && u.role !== 'admin' && u.role !== 'superadmin' && !isSuperAdminEmail(u.email)) return false;
        if (quickTab === 'active' && u.isActive === false) return false;
        if (quickTab === 'suspended' && u.isActive !== false) return false;
        if (quickTab === 'top_sellers' && metrics.unitsSold === 0) return false;
        if (quickTab === 'top_recruiters' && metrics.downlineCount === 0) return false;
        if (quickTab === 'high_ranks' && !['silver', 'gold', 'platinum', 'diamond'].includes(u.currentRankSlug || '')) return false;

        // 3. Rank Filter
        if (rankFilter !== 'all') {
          if (rankFilter === 'admin' && u.role !== 'admin' && u.role !== 'superadmin' && !isSuperAdminEmail(u.email)) return false;
          if (rankFilter !== 'admin' && u.currentRankSlug !== rankFilter) return false;
        }

        // 4. Status Filter
        if (statusFilter === 'active' && u.isActive === false) return false;
        if (statusFilter === 'suspended' && u.isActive !== false) return false;

        // 5. Referral / Team Filter
        if (referralFilter === 'has_referrals' && metrics.downlineCount === 0) return false;
        if (referralFilter === 'top_recruiters' && metrics.downlineCount < 5) return false;
        if (referralFilter === 'no_referrals' && metrics.downlineCount > 0) return false;

        // 6. Sales Volume Filter (Sold High)
        if (salesFilter === 'high_volume' && metrics.unitsSold < 5) return false;
        if (salesFilter === 'has_sales' && metrics.unitsSold === 0) return false;
        if (salesFilter === 'top_earners' && metrics.totalProfit < 3000) return false;
        if (salesFilter === 'no_sales' && metrics.unitsSold > 0) return false;

        return true;
      })
      .sort((a, b) => {
        const ma = userMetricsMap.get(a.id);
        const mb = userMetricsMap.get(b.id);

        switch (sortBy) {
          case 'highest_sales':
            return (mb?.unitsSold || 0) - (ma?.unitsSold || 0);
          case 'highest_profit':
            return (mb?.totalProfit || 0) - (ma?.totalProfit || 0);
          case 'most_referrals':
            return (mb?.downlineCount || 0) - (ma?.downlineCount || 0);
          case 'rank_desc': {
            const rankWeights: Record<string, number> = { diamond: 5, gold: 4, platinum: 3, silver: 2, unranked: 1 };
            return (rankWeights[b.currentRankSlug || 'unranked'] || 0) - (rankWeights[a.currentRankSlug || 'unranked'] || 0);
          }
          case 'name_asc':
            return (a.fullName || '').localeCompare(b.fullName || '');
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'newest':
          default:
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
      });
  }, [users, searchQuery, quickTab, rankFilter, statusFilter, referralFilter, salesFilter, sortBy, userMetricsMap]);

  // Export Users to CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      showToast('No user data to export.', 'error');
      return;
    }

    const headers = [
      'User ID',
      'Full Name',
      'Email Address',
      'Referral Code',
      'Referred By (Sponsor)',
      'Current Rank',
      'Role',
      'Account Status',
      'Delivered Units Sold',
      'Total Sales Revenue (PKR)',
      'Total Profit Earned (PKR)',
      'Direct Referrals Count',
      'Qualifying Active Referrals',
      'Registration Date',
    ];

    const rows = processedUsers.map((u) => {
      const metrics = userMetricsMap.get(u.id);
      const sponsor = getSponsorInfo(u.referredByCode);
      return [
        `"${u.id}"`,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        `"${u.email || ''}"`,
        `"${u.referralCode || ''}"`,
        `"${sponsor ? `${sponsor.name} (${sponsor.code})` : 'Organic / Direct'}"`,
        `"${(u.currentRankSlug || 'unranked').toUpperCase()}"`,
        `"${u.role}"`,
        `"${u.isActive !== false ? 'Active' : 'Suspended'}"`,
        metrics?.unitsSold || 0,
        metrics?.totalRevenue || 0,
        metrics?.totalProfit || 0,
        metrics?.downlineCount || 0,
        metrics?.qualifyingCount || 0,
        `"${u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dream_to_achievers_partners_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${processedUsers.length} partner records to CSV successfully.`);
  };

  const handleRescuePasswordReset = async (targetEmail?: string) => {
    const clean = (targetEmail || rescueEmail).toLowerCase().trim();
    if (!clean) {
      showToast('Please enter an email address to send a password reset.', 'error');
      return;
    }
    setIsRescuing(true);
    try {
      const res = await authService.sendPasswordReset(clean);
      if (res.success) {
        showToast(`Password reset email successfully sent to ${clean}!`, 'success');
      } else {
        showToast(res.error || 'Failed to dispatch reset email.', 'error');
      }
    } catch {
      showToast('Network error while dispatching reset email.', 'error');
    } finally {
      setIsRescuing(false);
    }
  };

  const handleRescueProvisionProfile = async () => {
    const clean = rescueEmail.toLowerCase().trim();
    if (!clean) {
      showToast('Please enter an email address.', 'error');
      return;
    }
    setIsRescuing(true);
    try {
      const existingUser = users.find((u) => u.email.toLowerCase() === clean);
      const randCode = Math.floor(1000 + Math.random() * 9000);
      const userToSave: User = {
        id: existingUser?.id || `user-rescue-${Date.now()}`,
        fullName: rescueName.trim() || existingUser?.fullName || clean.split('@')[0],
        email: clean,
        role: existingUser?.role || 'user',
        referralCode: existingUser?.referralCode || `DTA-${randCode}`,
        referredByCode: rescueSponsor.trim().toUpperCase() || existingUser?.referredByCode || 'DTA-6267',
        currentRankSlug: existingUser?.currentRankSlug || 'unranked',
        isActive: true,
        createdAt: existingUser?.createdAt || new Date().toISOString(),
      };

      await authService.saveUserProfile(userToSave);
      await handleManualSync();
      showToast(`User profile for ${clean} provisioned and synchronized!`, 'success');
      setShowRescueModal(false);
      setRescueEmail('');
      setRescueName('');
      setRescueSponsor('DTA-6267');
    } catch {
      showToast('Failed to provision user profile.', 'error');
    } finally {
      setIsRescuing(false);
    }
  };

  const handleRankOverride = (newRank: RankSlug) => {
    if (!selectedUser) return;
    const updated = users.map((u) => (u.id === selectedUser.id ? { ...u, currentRankSlug: newRank } : u));
    storage.set('USERS', updated);
    setUsers(updated);
    setSelectedUser(null);
    showToast(`Updated ${selectedUser.fullName}'s rank to ${newRank.toUpperCase()}.`);
  };

  const handleToggleStatus = (u: User) => {
    if (isSuperAdminEmail(u.email)) {
      showToast('Master Security Constraint: The root Superadmin account cannot be suspended.', 'error');
      return;
    }
    const updated = users.map((item) => (item.id === u.id ? { ...item, isActive: !item.isActive } : item));
    storage.set('USERS', updated);
    setUsers(updated);
    showToast(`Account ${u.fullName} is now ${!u.isActive ? 'Active' : 'Suspended'}.`);
  };

  const handleConfirmRoleChange = async () => {
    if (!roleModalUser) return;

    if (!isSuperAdminAuthorized) {
      showToast(`Unauthorized: Only the Master Superadmin (${SUPERADMIN_EMAIL}) can grant or revoke administrator clearance.`, 'error');
      setRoleModalUser(null);
      return;
    }

    setIsUpdatingRole(true);
    try {
      const res = await authService.updateUserRole(
        roleModalUser.user.id,
        roleModalUser.targetRole,
        currentAdmin?.email || SUPERADMIN_EMAIL
      );

      if (res.success && res.user) {
        const updatedTarget = res.user;
        setUsers((prev) => prev.map((u) => (u.id === updatedTarget.id ? updatedTarget : u)));
        showToast(
          roleModalUser.targetRole === 'admin'
            ? `Granted full Administrator clearance to ${roleModalUser.user.fullName}.`
            : `Revoked Administrator clearance from ${roleModalUser.user.fullName}.`
        );
      } else {
        showToast(res.error || 'Failed to update administrative clearance.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error occurred while updating role clearance.', 'error');
    } finally {
      setIsUpdatingRole(false);
      setRoleModalUser(null);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;

    if (isSuperAdminEmail(deletingUser.email)) {
      showToast('Master Security Constraint: The root Superadmin account cannot be deleted.', 'error');
      setDeletingUser(null);
      return;
    }

    if (deletingUser.id === currentAdmin?.id) {
      showToast('You cannot delete your own active administrator account.', 'error');
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);

    try {
      await authService.deleteUser(deletingUser.id, deletingUser.referralCode, deletingUser.email);

      setUsers((prev) =>
        prev.filter(
          (u) =>
            u.id !== deletingUser.id &&
            u.email?.toLowerCase() !== deletingUser.email?.toLowerCase() &&
            (!deletingUser.referralCode || u.referralCode?.toUpperCase() !== deletingUser.referralCode.toUpperCase())
        )
      );

      if (currentAdmin) {
        auditService.logAction({
          adminId: currentAdmin.id,
          adminEmail: currentAdmin.email,
          action: 'DELETE_USER',
          entityType: 'user',
          entityId: deletingUser.id,
          details: `Permanently deleted user account "${deletingUser.fullName}" (${deletingUser.email}, Code: ${deletingUser.referralCode})`,
        });
      }

      showToast(`User ${deletingUser.fullName} (${deletingUser.email}) permanently deleted.`);
    } catch {
      setUsers((prev) =>
        prev.filter(
          (u) =>
            u.id !== deletingUser.id &&
            u.email?.toLowerCase() !== deletingUser.email?.toLowerCase()
        )
      );
      showToast(`User removed from database.`);
    } finally {
      setIsDeleting(false);
      setDeletingUser(null);
    }
  };

  const getUserReferralsList = (userId: string) => {
    return referralService.getUserReferrals(userId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setQuickTab('all');
    setRankFilter('all');
    setStatusFilter('all');
    setReferralFilter('all');
    setSalesFilter('all');
    setSortBy('newest');
  };

  // Stats Counters
  const totalAdmins = users.filter((u) => u.role === 'admin' || u.role === 'superadmin' || isSuperAdminEmail(u.email)).length;
  const totalTopSellers = users.filter((u) => (userMetricsMap.get(u.id)?.unitsSold || 0) > 0).length;
  const totalTopRecruiters = users.filter((u) => (userMetricsMap.get(u.id)?.downlineCount || 0) > 0).length;
  const totalHighRanks = users.filter((u) => ['silver', 'gold', 'platinum', 'diamond'].includes(u.currentRankSlug || '')).length;
  const totalActive = users.filter((u) => u.isActive !== false).length;
  const totalSuspended = users.filter((u) => u.isActive === false).length;

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
            <span>Store Admin</span>
            <span>/</span>
            <span>Partner Directory &amp; Sales Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
            User Accounts &amp; Partner Directory
          </h1>
          <p className="text-xs text-[var(--ink-soft)]">
            Comprehensive directory of registered resellers. Filter by sales performance, milestone ranks, recruitment volume, and account status.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleStandardizeCodes}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs font-semibold shrink-0 text-[var(--accent)] border-[var(--accent)]/40 hover:bg-[var(--surface)]"
            isLoading={isStandardizing}
            iconLeft={<Sparkle size={14} className={isStandardizing ? 'animate-spin' : 'text-[var(--accent)]'} />}
            title="Scan and upgrade all partner codes in database to DTA prefix (e.g. DTA-XXXX)"
          >
            {isStandardizing ? 'Resetting to DTA...' : 'Reset to DTA Codes'}
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs font-semibold shrink-0"
            iconLeft={<DownloadSimple size={14} />}
            title="Download partner database as CSV spreadsheet"
          >
            Export CSV
          </Button>

          <Button
            onClick={handleManualSync}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs font-semibold shrink-0"
            isLoading={isSyncing}
            iconLeft={<ArrowClockwise size={14} className={isSyncing ? 'animate-spin' : ''} />}
            title="Fetch all registered users from Cloud Firestore & RTDB"
          >
            {isSyncing ? 'Syncing...' : 'Sync Cloud'}
          </Button>

          <Button
            onClick={() => setShowRescueModal(true)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs font-semibold shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
            iconLeft={<Key size={14} className="text-amber-400" />}
            title="Send password reset link or rescue an unlinked user account"
          >
            Rescue Account
          </Button>
        </div>
      </div>

      {/* Superadmin Authority Status Bar */}
      <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors ${
        isSuperAdminAuthorized
          ? 'bg-amber-500/[0.04] border-amber-500/25'
          : 'bg-[var(--surface)] border-[var(--line)]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isSuperAdminAuthorized
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-[var(--surface-alt)] text-[var(--ink-soft)] border-[var(--line)]'
          }`}>
            <Crown size={18} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--ink)]">Superadmin Security Node</span>
              {isSuperAdminAuthorized ? (
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AUTHORITY ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-medium bg-white/5 text-[var(--ink-soft)] border border-[var(--line)]">
                  READ ONLY PRIVILEGES
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-[var(--ink-soft)] mt-0.5">
              Root Authority: <span className="font-bold text-[var(--ink)]">{SUPERADMIN_EMAIL}</span>
              {isSuperAdminAuthorized
                ? ' — You have exclusive unilateral clearance to grant or revoke Administrator access.'
                : ' — Clearance restricted: Only the Master Superadmin can grant or revoke Administrator access.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" weight="bold" />
            <span>Active Administrators: <strong className="text-[var(--primary-dark)]">{totalAdmins}</strong></span>
          </span>
        </div>
      </div>

      {/* 1. Quick Metric Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => { setQuickTab('all'); setStatusFilter('all'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'all'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
          }`}
        >
          <Users size={14} />
          <span>All Partners ({users.length})</span>
        </button>

        <button
          onClick={() => { setQuickTab('admins'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'admins'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
          }`}
        >
          <ShieldCheck size={14} className={quickTab === 'admins' ? 'text-white' : 'text-emerald-500'} weight="bold" />
          <span>Administrators ({totalAdmins})</span>
        </button>

        <button
          onClick={() => { setQuickTab('active'); setStatusFilter('active'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'active'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
          }`}
        >
          <CheckCircle size={14} className="text-[var(--primary)]" />
          <span>Active ({totalActive})</span>
        </button>

        <button
          onClick={() => { setQuickTab('top_sellers'); setSalesFilter('has_sales'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'top_sellers'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
          }`}
        >
          <Fire size={14} className="text-[var(--accent)]" weight="fill" />
          <span>Top Resellers ({totalTopSellers})</span>
        </button>

        <button
          onClick={() => { setQuickTab('top_recruiters'); setReferralFilter('has_referrals'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'top_recruiters'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
          }`}
        >
          <TreeStructure size={14} className="text-blue-600" />
          <span>Top Recruiters ({totalTopRecruiters})</span>
        </button>

        <button
          onClick={() => { setQuickTab('high_ranks'); setRankFilter('all'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'high_ranks'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface)]'
          }`}
        >
          <Crown size={14} className="text-[var(--accent)]" weight="fill" />
          <span>Rank Leaders ({totalHighRanks})</span>
        </button>

        {totalSuspended > 0 && (
          <button
            onClick={() => { setQuickTab('suspended'); setStatusFilter('suspended'); }}
            className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickTab === 'suspended'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-[var(--surface)] text-rose-600 border-rose-500/20 hover:bg-rose-500/10'
            }`}
          >
            <Warning size={14} />
            <span>Suspended ({totalSuspended})</span>
          </button>
        )}
      </div>

      {/* 2. Comprehensive Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Search */}
          <div className="relative flex-1 text-xs">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, referral code, or sponsor..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:outline-none focus:border-[var(--primary)] text-xs"
            />
          </div>

          {/* Reset Filters */}
          {(searchQuery || rankFilter !== 'all' || statusFilter !== 'all' || referralFilter !== 'all' || salesFilter !== 'all' || sortBy !== 'newest') && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-alt)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <X size={14} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* 4 Multi-Criteria Dropdowns + Sorter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          {/* 1. Filter by Rank */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[var(--ink-soft)] font-semibold block">Filter by Rank</label>
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              <option value="all">All Ranks</option>
              <option value="diamond">Diamond · Level 04</option>
              <option value="gold">Gold · Level 03</option>
              <option value="platinum">Platinum · Level 02</option>
              <option value="silver">Silver · Level 01</option>
              <option value="unranked">Unranked (Starter)</option>
              <option value="admin">Administrators ({totalAdmins})</option>
            </select>
          </div>

          {/* 2. Filter by Sales */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[var(--ink-soft)] font-semibold block">Sales Volume (Sold High)</label>
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              <option value="all">All Sales Levels</option>
              <option value="high_volume">High Volume · 5+ Units</option>
              <option value="top_earners">Top Earners · Over PKR 3k</option>
              <option value="has_sales">Has Sold · 1+ Units</option>
              <option value="no_sales">No Sales Yet</option>
            </select>
          </div>

          {/* 3. Filter by Referrals & Recruitment */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[var(--ink-soft)] font-semibold block">Recruitment / Team</label>
            <select
              value={referralFilter}
              onChange={(e) => setReferralFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              <option value="all">All Team Sizes</option>
              <option value="top_recruiters">Top Recruiters · 5+ Team</option>
              <option value="has_referrals">Has Referrals · 1+ Team</option>
              <option value="no_referrals">Zero Referrals</option>
            </select>
          </div>

          {/* 4. Filter by Account Status */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[var(--ink-soft)] font-semibold block">Account Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts Only</option>
              <option value="suspended">Suspended / Inactive Only</option>
            </select>
          </div>

          {/* 5. Sort By */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[10.5px] font-mono text-[var(--ink-soft)] font-semibold block">Sort Directory By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] cursor-pointer font-medium"
            >
              <option value="newest">Recently Registered</option>
              <option value="highest_sales">Highest Units Sold</option>
              <option value="highest_profit">Highest Profit Earned</option>
              <option value="most_referrals">Most Referrals Onboarded</option>
              <option value="rank_desc">Highest Rank Milestone</option>
              <option value="name_asc">Name (A to Z)</option>
              <option value="oldest">Earliest Registered</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Filtered Users Table / Mobile Cards */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden text-xs shadow-xs">
        <div className="p-4 bg-[var(--surface)] border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-[var(--ink)]">Partner Directory</span>
            <span className="text-[11px] text-[var(--ink-soft)] bg-[var(--surface)] px-2.5 py-0.5 rounded-full border border-[var(--line)]">
              {processedUsers.length} of {users.length} Partners Matching
            </span>
          </div>
          <span className="text-[10.5px] text-[var(--ink-soft)]">
            Click Inspect to view full downline &amp; sales breakdown
          </span>
        </div>

        {processedUsers.length === 0 ? (
          <div className="p-12 text-center text-[var(--ink-soft)] space-y-3">
            <Users size={36} className="text-[var(--ink-soft)] mx-auto" />
            <p className="font-bold text-base text-[var(--ink)]">No partner accounts match current filters</p>
            <p className="text-xs text-[var(--ink-soft)]">Try adjusting your search keywords, rank filter, or sales volume filters.</p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--primary-dark)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table: strict min-w-[1250px] and whitespace-nowrap ensures zero column crushing */}
            <div className="hidden lg:block overflow-x-auto w-full">
              <table className="w-full min-w-[1250px] text-left font-sans border-collapse">
                <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10.5px] bg-[var(--surface)]">
                  <tr>
                    <th className="p-3.5 font-semibold min-w-[240px] whitespace-nowrap">Partner Profile</th>
                    <th className="p-3.5 font-semibold min-w-[180px] whitespace-nowrap">Referral &amp; Sponsor</th>
                    <th className="p-3.5 font-semibold min-w-[130px] text-center whitespace-nowrap">Rank Level</th>
                    <th className="p-3.5 font-semibold min-w-[150px] text-center whitespace-nowrap">Role &amp; Status</th>
                    <th className="p-3.5 font-semibold text-right min-w-[180px] whitespace-nowrap">Delivered Sales</th>
                    <th className="p-3.5 font-semibold text-center min-w-[150px] whitespace-nowrap">Downline Team</th>
                    <th className="p-3.5 font-semibold text-center min-w-[110px] whitespace-nowrap">Registered</th>
                    <th className="p-3.5 font-semibold text-center min-w-[270px] whitespace-nowrap">Clearance &amp; Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                  {processedUsers.map((u) => {
                    const metrics = userMetricsMap.get(u.id) || {
                      salesCount: 0,
                      unitsSold: 0,
                      totalRevenue: 0,
                      totalProfit: 0,
                      downlineCount: 0,
                      qualifyingCount: 0,
                    };
                    const sponsor = getSponsorInfo(u.referredByCode);

                    return (
                      <tr key={u.id} className="hover:bg-[var(--surface)]/70 transition-colors">
                        {/* 1. Partner Profile */}
                        <td className="p-3.5 min-w-[240px]">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {(u.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 max-w-[190px]">
                              <p className="font-bold text-[var(--ink)] text-xs sm:text-sm truncate" title={u.fullName || 'Unnamed User'}>
                                {u.fullName || 'Unnamed User'}
                              </p>
                              <p className="text-[10.5px] font-mono text-[var(--ink-soft)] truncate" title={u.email || 'No email'}>
                                {u.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Referral & Sponsor */}
                        <td className="p-3.5 min-w-[180px] whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-[var(--primary-dark)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--line)] text-xs inline-block whitespace-nowrap">
                              {u.referralCode || 'NO-CODE'}
                            </span>
                            <p className="text-[10px] text-[var(--ink-soft)] font-mono truncate max-w-[170px]" title={sponsor ? `Invited by: ${sponsor.name}` : 'Direct / Organic'}>
                              {sponsor ? `Invited by: ${sponsor.name}` : 'Direct / Organic'}
                            </p>
                          </div>
                        </td>

                        {/* 3. Rank Level */}
                        <td className="p-3.5 min-w-[130px] text-center whitespace-nowrap">
                          <span className="font-mono uppercase text-[10.5px] font-bold text-[var(--ink)] px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line)] inline-flex items-center gap-1 whitespace-nowrap">
                            {u.currentRankSlug === 'diamond' && <Crown size={12} weight="fill" className="text-[var(--accent)]" />}
                            {u.currentRankSlug === 'gold' && <Sparkle size={12} weight="fill" className="text-[var(--accent)]" />}
                            {u.currentRankSlug === 'platinum' && <Sparkle size={12} weight="fill" className="text-[var(--primary)]" />}
                            {u.currentRankSlug === 'silver' && <Sparkle size={12} weight="fill" className="text-[var(--ink-soft)]" />}
                            <span>{u.currentRankSlug || 'unranked'}</span>
                          </span>
                        </td>

                        {/* 4. Role Clearance & Status */}
                        <td className="p-3.5 min-w-[150px] text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-1">
                            {isSuperAdminEmail(u.email) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.12)] whitespace-nowrap">
                                <Crown size={12} weight="fill" className="text-amber-400 shrink-0" />
                                SUPERADMIN
                              </span>
                            ) : u.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.1)] whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-mono font-medium tracking-wide uppercase bg-[var(--surface-alt)] text-[var(--ink-soft)] border border-[var(--line)] whitespace-nowrap">
                                RESELLER
                              </span>
                            )}
                            <span
                              className={`inline-block text-[10px] font-mono font-bold capitalize px-2 py-0.2 rounded-full border whitespace-nowrap ${
                                u.isActive !== false
                                  ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] border-[var(--primary)]/20'
                                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              }`}
                            >
                              {u.isActive !== false ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Delivered Sales & Profit */}
                        <td className="p-3.5 min-w-[180px] text-right whitespace-nowrap">
                          <div className="space-y-0.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-[var(--primary-dark)] text-xs block whitespace-nowrap">
                              {metrics.unitsSold} units delivered
                            </span>
                            <span className="font-mono text-[10.5px] text-[var(--accent)] font-semibold block whitespace-nowrap">
                              +PKR {metrics.totalProfit.toLocaleString()} profit
                            </span>
                            {metrics.totalRevenue > 0 && (
                              <span className="text-[9.5px] text-[var(--ink-soft)] font-mono block whitespace-nowrap">
                                PKR {metrics.totalRevenue.toLocaleString()} volume
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Downline Team */}
                        <td className="p-3.5 min-w-[150px] text-center whitespace-nowrap">
                          <button
                            onClick={() => setInspectingUser(u)}
                            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--ink)] border border-[var(--line)] font-mono text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            title="Inspect Onboarded Teammates"
                          >
                            <TreeStructure size={14} className="text-[var(--primary-dark)] shrink-0" />
                            <span className="font-bold">{metrics.downlineCount}</span>
                            <span className="text-[10px] text-[var(--ink-soft)]">({metrics.qualifyingCount} Active)</span>
                          </button>
                        </td>

                        {/* 7. Registered Time Ago */}
                        <td className="p-3.5 min-w-[110px] text-center whitespace-nowrap">
                          <span
                            className="font-mono text-[10.5px] text-[var(--ink)] bg-[var(--surface)] px-2.5 py-1 rounded-lg border border-[var(--line)] inline-flex items-center gap-1 font-medium shadow-2xs whitespace-nowrap"
                            title={u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                          >
                            <Clock size={12} className="text-[var(--primary-dark)] shrink-0" />
                            <span className="whitespace-nowrap">{formatTimeAgo(u.createdAt)}</span>
                          </span>
                        </td>

                        {/* 8. Clearance & Actions */}
                        <td className="p-3.5 min-w-[270px] text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                            {/* Role Clearance Button */}
                            {isSuperAdminEmail(u.email) ? (
                              <span
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-mono font-semibold inline-flex items-center gap-1 cursor-default select-none shadow-2xs whitespace-nowrap"
                                title="Root Superadmin Account (Protected)"
                              >
                                <LockKey size={11} weight="bold" className="shrink-0" />
                                Master Root
                              </span>
                            ) : u.role === 'admin' ? (
                              <button
                                onClick={() => setRoleModalUser({ user: u, targetRole: 'reseller' })}
                                disabled={!isSuperAdminAuthorized}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all inline-flex items-center gap-1 shrink-0 ${
                                  isSuperAdminAuthorized
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-rose-500/30 cursor-pointer active:scale-95'
                                    : 'opacity-40 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                                }`}
                                title={
                                  isSuperAdminAuthorized
                                    ? `Revoke Admin access from ${u.fullName}`
                                    : `Clearance restricted: Only Superadmin (${SUPERADMIN_EMAIL}) can modify roles`
                                }
                              >
                                <ShieldSlash size={13} weight="bold" className="shrink-0" />
                                <span>Revoke Admin</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setRoleModalUser({ user: u, targetRole: 'admin' })}
                                disabled={!isSuperAdminAuthorized}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all inline-flex items-center gap-1 shrink-0 ${
                                  isSuperAdminAuthorized
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/30 cursor-pointer active:scale-95'
                                    : 'opacity-40 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                                }`}
                                title={
                                  isSuperAdminAuthorized
                                    ? `Grant full Administrator access to ${u.fullName}`
                                    : `Clearance restricted: Only Superadmin (${SUPERADMIN_EMAIL}) can modify roles`
                                }
                              >
                                <ShieldPlus size={13} weight="bold" className="shrink-0" />
                                <span>Grant Admin</span>
                              </button>
                            )}

                            {/* Milestone rank override */}
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--ink)] border border-[var(--line)] text-[11px] font-mono font-medium cursor-pointer whitespace-nowrap shrink-0"
                              title="Override Milestone Rank Level"
                            >
                              Rank
                            </button>

                            {/* Suspend / Activate */}
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isSuperAdminEmail(u.email)}
                              className={`px-2 py-1 rounded-lg border text-[11px] font-mono font-medium whitespace-nowrap shrink-0 transition-colors ${
                                isSuperAdminEmail(u.email)
                                  ? 'opacity-30 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                                  : 'bg-[var(--surface)] hover:bg-rose-500/10 text-[var(--ink-soft)] hover:text-rose-600 border-[var(--line)] cursor-pointer'
                              }`}
                              title={isSuperAdminEmail(u.email) ? 'Root Superadmin cannot be suspended' : u.isActive !== false ? 'Suspend User' : 'Activate User'}
                            >
                              {u.isActive !== false ? 'Suspend' : 'Activate'}
                            </button>

                            {/* Permanent deletion */}
                            <button
                              onClick={() => setDeletingUser(u)}
                              disabled={u.id === currentAdmin?.id || isSuperAdminEmail(u.email)}
                              className={`p-1.5 rounded-lg border text-[11px] transition-colors shrink-0 ${
                                u.id === currentAdmin?.id || isSuperAdminEmail(u.email)
                                  ? 'opacity-30 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/20 cursor-pointer'
                              }`}
                              title={
                                isSuperAdminEmail(u.email)
                                  ? 'Root Superadmin account cannot be deleted'
                                  : u.id === currentAdmin?.id
                                  ? 'Cannot delete currently logged in admin'
                                  : 'Permanently Delete User'
                              }
                            >
                              <Trash size={14} className="shrink-0" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Cards: Visible on screens < 1024px */}
            <div className="lg:hidden divide-y divide-[var(--line)]">
              {processedUsers.map((u) => {
                const metrics = userMetricsMap.get(u.id) || {
                  salesCount: 0,
                  unitsSold: 0,
                  totalRevenue: 0,
                  totalProfit: 0,
                  downlineCount: 0,
                  qualifyingCount: 0,
                };
                const sponsor = getSponsorInfo(u.referredByCode);

                return (
                  <div key={u.id} className="p-4 space-y-3 hover:bg-[var(--surface)]/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {(u.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--ink)] text-sm truncate">{u.fullName || 'Unnamed User'}</p>
                          <p className="text-[11px] font-mono text-[var(--ink-soft)] truncate">{u.email || 'No email'}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isSuperAdminEmail(u.email) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Crown size={11} weight="fill" className="text-amber-400" />
                            SUPERADMIN
                          </span>
                        ) : u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[var(--surface-alt)] text-[var(--ink-soft)] border border-[var(--line)]">
                            RESELLER
                          </span>
                        )}
                        <span
                          className={`inline-block text-[10px] font-mono font-bold capitalize px-2 py-0.5 rounded-full border shrink-0 ${
                            u.isActive !== false
                              ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] border-[var(--primary)]/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-0.5">
                        <span className="text-[var(--ink-soft)] block font-mono text-[10px]">Referral Code</span>
                        <span className="font-mono font-bold text-[var(--primary-dark)] text-xs block">{u.referralCode || 'NO-CODE'}</span>
                        <span className="text-[9.5px] text-[var(--ink-soft)] font-mono truncate block">
                          {sponsor ? `By: ${sponsor.name}` : 'Direct / Organic'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-0.5">
                        <span className="text-[var(--ink-soft)] block font-mono text-[10px]">Current Rank</span>
                        <span className="font-mono uppercase font-bold text-[var(--ink)] text-xs flex items-center gap-1">
                          {u.currentRankSlug === 'diamond' && <Crown size={12} weight="fill" className="text-[var(--accent)]" />}
                          {u.currentRankSlug === 'gold' && <Sparkle size={12} weight="fill" className="text-[var(--accent)]" />}
                          {u.currentRankSlug === 'platinum' && <Sparkle size={12} weight="fill" className="text-[var(--primary)]" />}
                          {u.currentRankSlug === 'silver' && <Sparkle size={12} weight="fill" className="text-[var(--ink-soft)]" />}
                          <span>{u.currentRankSlug || 'unranked'}</span>
                        </span>
                        <span className="text-[9.5px] text-[var(--ink-soft)] font-mono block">
                          Joined {formatTimeAgo(u.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-[var(--ink-soft)]">Performance</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[var(--primary-dark)] text-xs">{metrics.unitsSold} units</span>
                          <span className="font-mono text-xs text-[var(--accent)] font-semibold">+PKR {metrics.totalProfit.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setInspectingUser(u)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--ink)] border border-[var(--line)] font-mono text-[11px] font-bold cursor-pointer"
                      >
                        <TreeStructure size={13} className="text-[var(--primary-dark)]" />
                        <span>Team ({metrics.downlineCount})</span>
                      </button>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
                      {/* Role Clearance Button */}
                      {isSuperAdminEmail(u.email) ? (
                        <span
                          className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono font-semibold inline-flex items-center gap-1 cursor-default select-none shadow-2xs"
                        >
                          <LockKey size={12} weight="bold" />
                          Master Root
                        </span>
                      ) : u.role === 'admin' ? (
                        <button
                          onClick={() => setRoleModalUser({ user: u, targetRole: 'reseller' })}
                          disabled={!isSuperAdminAuthorized}
                          className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all inline-flex items-center gap-1.5 ${
                            isSuperAdminAuthorized
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 cursor-pointer active:scale-95'
                              : 'opacity-40 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                          }`}
                          title={isSuperAdminAuthorized ? 'Revoke Admin' : 'Superadmin Required'}
                        >
                          <ShieldSlash size={14} weight="bold" />
                          <span>Revoke Admin</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setRoleModalUser({ user: u, targetRole: 'admin' })}
                          disabled={!isSuperAdminAuthorized}
                          className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all inline-flex items-center gap-1.5 ${
                            isSuperAdminAuthorized
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-pointer active:scale-95'
                              : 'opacity-40 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                          }`}
                          title={isSuperAdminAuthorized ? 'Grant Admin' : 'Superadmin Required'}
                        >
                          <ShieldPlus size={14} weight="bold" />
                          <span>Grant Admin</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedUser(u)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--ink)] border border-[var(--line)] text-xs font-mono font-medium cursor-pointer"
                      >
                        Rank Level
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={isSuperAdminEmail(u.email)}
                        className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-colors ${
                          isSuperAdminEmail(u.email)
                            ? 'opacity-30 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                            : 'bg-[var(--surface)] hover:bg-rose-500/10 text-[var(--ink-soft)] hover:text-rose-600 border-[var(--line)] cursor-pointer'
                        }`}
                      >
                        {u.isActive !== false ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        disabled={u.id === currentAdmin?.id || isSuperAdminEmail(u.email)}
                        className={`min-h-[40px] min-w-[40px] p-2 rounded-xl border text-xs transition-colors flex items-center justify-center ${
                          u.id === currentAdmin?.id || isSuperAdminEmail(u.email)
                            ? 'opacity-30 cursor-not-allowed text-[var(--ink-soft)] border-[var(--line)]'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/20 cursor-pointer'
                        }`}
                        title="Delete User"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal 1: Comprehensive Partner Dossier & Inspection */}
      {inspectingUser && (() => {
        const metrics = userMetricsMap.get(inspectingUser.id) || {
          salesCount: 0,
          unitsSold: 0,
          totalRevenue: 0,
          totalProfit: 0,
          downlineCount: 0,
          qualifyingCount: 0,
        };
        const sponsor = getSponsorInfo(inspectingUser.referredByCode);
        const userSalesList = sales.filter((s) => s.userId === inspectingUser.id);
        const userDownline = getUserReferralsList(inspectingUser.id);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
            <div className="w-full max-w-3xl p-5 sm:p-7 rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl space-y-5 text-xs max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-7 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[var(--line)]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {(inspectingUser.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg text-[var(--ink)]">
                        {inspectingUser.fullName || 'Unnamed User'}
                      </h3>
                      <span className="font-mono uppercase text-[10px] font-bold text-[var(--ink)] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)]">
                        {inspectingUser.currentRankSlug || 'unranked'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                      {inspectingUser.email || 'No email'} · Partner Code: <span className="font-bold text-[var(--primary-dark)]">{inspectingUser.referralCode}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingUser(null)}
                  className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-alt)] active:scale-[0.96] text-[var(--ink-soft)] hover:text-[var(--ink)] transition-all cursor-pointer"
                  aria-label="Close user inspector"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                  <span className="text-[var(--ink-soft)] block font-mono text-[10px]">Delivered Volume</span>
                  <span className="text-xl font-bold font-mono text-[var(--ink)] mt-0.5 block">{metrics.unitsSold} Units</span>
                  <span className="text-[10px] text-[var(--ink-soft)] font-mono">{metrics.salesCount} delivered orders</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                  <span className="text-[var(--ink-soft)] block font-mono text-[10px]">Net Profit Earned</span>
                  <span className="text-xl font-bold font-mono text-[var(--primary-dark)] mt-0.5 block">PKR {metrics.totalProfit.toLocaleString()}</span>
                  <span className="text-[10px] text-[var(--ink-soft)] font-mono">Credited to wallet</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                  <span className="text-[var(--ink-soft)] block font-mono text-[10px]">Downline Team</span>
                  <span className="text-xl font-bold font-mono text-[var(--ink)] mt-0.5 block">{metrics.downlineCount} Teammates</span>
                  <span className="text-[10px] text-[var(--primary-dark)] font-mono font-semibold">{metrics.qualifyingCount} Qualifying</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                  <span className="text-[var(--ink-soft)] block font-mono text-[10px]">Invited By (Sponsor)</span>
                  <span className="text-xs font-bold text-[var(--ink)] mt-0.5 block truncate">
                    {sponsor ? sponsor.name : 'Direct / Organic'}
                  </span>
                  <span className="text-[10px] text-[var(--ink-soft)] font-mono">{sponsor ? sponsor.code : 'None'}</span>
                </div>
              </div>

              {/* Section 1: Customer Sales & Resale Margin */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-xs text-[var(--ink)] flex items-center gap-1.5">
                    <ShoppingCart size={15} className="text-[var(--primary-dark)]" />
                    Delivered Client Sales ({userSalesList.length})
                  </span>
                  <span className="text-[10.5px] text-[var(--ink-soft)]">
                    Total Units: {metrics.unitsSold}
                  </span>
                </div>

                {userSalesList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center text-[var(--ink-soft)]">
                    <p className="font-semibold text-xs">No client orders recorded yet.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--line)] overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full min-w-[550px] text-left font-sans">
                      <thead className="bg-[var(--surface)] border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2.5 whitespace-nowrap">Order ID</th>
                          <th className="p-2.5 whitespace-nowrap">Product Name</th>
                          <th className="p-2.5 whitespace-nowrap">Customer (Buyer)</th>
                          <th className="p-2.5 text-center whitespace-nowrap">Qty</th>
                          <th className="p-2.5 text-right whitespace-nowrap">Profit Margin</th>
                          <th className="p-2.5 text-center whitespace-nowrap">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                        {userSalesList.map((s) => (
                          <tr key={s.id} className="hover:bg-[var(--surface)]/60">
                            <td className="p-2.5 font-mono text-[10.5px] font-bold text-[var(--ink)] whitespace-nowrap">{s.id}</td>
                            <td className="p-2.5 font-medium text-[var(--ink)] whitespace-nowrap">{s.productName}</td>
                            <td className="p-2.5 text-[var(--ink-soft)] whitespace-nowrap">{s.customerName || 'Direct Buyer'}</td>
                            <td className="p-2.5 text-center font-mono font-bold whitespace-nowrap">{s.quantity || 1}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-[var(--primary-dark)] whitespace-nowrap">
                              +PKR {((s.profitMargin || 0) * (s.quantity || 1)).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center whitespace-nowrap">
                              <span className="font-mono text-[9.5px] px-2 py-0.5 rounded capitalize bg-[var(--surface)] border border-[var(--line)] whitespace-nowrap">
                                {s.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section 2: Referred Team Members */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-xs text-[var(--ink)] flex items-center gap-1.5">
                    <TreeStructure size={15} className="text-[var(--primary-dark)]" />
                    Referred Downline Team ({userDownline.length})
                  </span>
                  <span className="text-[10.5px] text-[var(--ink-soft)]">
                    {metrics.qualifyingCount} Qualifying Active
                  </span>
                </div>

                {userDownline.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center text-[var(--ink-soft)]">
                    <p className="font-semibold text-xs">No teammates onboarded yet with code {inspectingUser.referralCode}.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--line)] overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full min-w-[550px] text-left font-sans">
                      <thead className="bg-[var(--surface)] border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2.5 whitespace-nowrap">Teammate</th>
                          <th className="p-2.5 whitespace-nowrap">Rank Level</th>
                          <th className="p-2.5 whitespace-nowrap">Status</th>
                          <th className="p-2.5 text-right whitespace-nowrap">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                        {userDownline.map((r) => (
                          <tr key={r.id} className="hover:bg-[var(--surface)]/60">
                            <td className="p-2.5 whitespace-nowrap">
                              <p className="font-medium text-[var(--ink)]">{r.referredUserName}</p>
                              <p className="text-[10px] font-mono text-[var(--ink-soft)]">{r.referredUserEmail || 'No email'}</p>
                            </td>
                            <td className="p-2.5 font-mono uppercase text-[10px] font-bold whitespace-nowrap">
                              {r.referredUserRank || 'unranked'}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span
                                className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                                  r.isQualifying
                                    ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] border-[var(--primary)]/20'
                                    : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                                }`}
                              >
                                {r.isQualifying ? 'Qualifying Active' : 'Pending Activation'}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-mono text-[10px] text-[var(--ink-soft)] whitespace-nowrap">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedUser(inspectingUser); setInspectingUser(null); }}
                    className="text-xs font-semibold"
                  >
                    Change Milestone Level
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(inspectingUser)}
                    className="text-xs font-semibold"
                  >
                    {inspectingUser.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                  </Button>
                </div>

                <Button variant="primary" size="sm" onClick={() => setInspectingUser(null)}>
                  Close Dossier
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal 2: Delete User Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl space-y-4 text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center space-x-3 text-rose-600 pb-3 border-b border-[var(--line)]">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                <Trash size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--ink)]">Permanently Delete User?</h3>
                <p className="text-[11px] text-[var(--ink-soft)]">This action removes the account across all databases.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5 text-xs text-[var(--ink)]">
              <p className="font-semibold">
                Are you sure you want to permanently delete partner:
              </p>
              <div className="font-mono text-[11px] space-y-0.5 pt-1">
                <p>• Name: <span className="font-bold">{deletingUser.fullName}</span></p>
                <p>• Email: <span className="font-bold">{deletingUser.email}</span></p>
                <p>• Referral Code: <span className="font-bold">{deletingUser.referralCode}</span></p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--line)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDeleteUserConfirm}
                isLoading={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                Delete Account Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Change Level Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="w-full max-w-sm max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6 rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl space-y-4 text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h3 className="font-bold text-base text-[var(--ink)]">
                Override Rank: {selectedUser.fullName}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] active:scale-[0.96] transition-transform"
                aria-label="Close rank override dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {(['unranked', 'silver', 'platinum', 'gold', 'diamond'] as RankSlug[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRankOverride(r)}
                  className={`w-full min-h-[44px] p-2.5 rounded-xl border text-left flex items-center justify-between font-mono uppercase transition-all cursor-pointer active:scale-[0.98] ${
                    selectedUser.currentRankSlug === r
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-bold'
                      : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface-alt)]'
                  }`}
                >
                  <span>{r}</span>
                  {selectedUser.currentRankSlug === r && <span className="text-xs">Current Level</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Executive Admin Role Clearance Authorization Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-7 rounded-t-3xl sm:rounded-3xl bg-[#0C120E] border border-white/10 shadow-2xl space-y-5 text-xs text-[#F4F7F5] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-7 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  roleModalUser.targetRole === 'admin'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                }`}>
                  {roleModalUser.targetRole === 'admin' ? (
                    <ShieldPlus size={24} weight="bold" />
                  ) : (
                    <ShieldSlash size={24} weight="bold" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#F4F7F5]">
                    {roleModalUser.targetRole === 'admin'
                      ? 'Authorize Administrator Clearance'
                      : 'Revoke Administrator Clearance'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#9EABA2]">
                    Master Superadmin Access Control Protocol
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRoleModalUser(null)}
                disabled={isUpdatingRole}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-[#9EABA2] hover:text-[#F4F7F5] active:scale-[0.96] transition-transform cursor-pointer"
                aria-label="Close role authorization dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Partner Identity Dossier */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D9C08A] font-bold block">
                Target Account Dossier
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D9C08A] to-[#B8862E] text-[#070B09] flex items-center justify-center font-bold text-sm shrink-0">
                    {(roleModalUser.user.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#F4F7F5] truncate">{roleModalUser.user.fullName}</h4>
                    <p className="text-[11px] font-mono text-[#9EABA2] truncate">{roleModalUser.user.email}</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[10.5px] shrink-0 pl-2">
                  <span className="text-[#9EABA2] block">Partner Code</span>
                  <span className="font-bold text-[#D9C08A]">{roleModalUser.user.referralCode || 'NO-CODE'}</span>
                </div>
              </div>
            </div>

            {/* Privilege Impact Matrix */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${
              roleModalUser.targetRole === 'admin'
                ? 'bg-emerald-500/[0.05] border-emerald-500/25 text-[#E6F4EA]'
                : 'bg-rose-500/[0.05] border-rose-500/25 text-[#FDE8E8]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs font-mono uppercase tracking-wider">
                  {roleModalUser.targetRole === 'admin'
                    ? 'Granted Permissions Scope'
                    : 'Revocation Impact'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-black/30">
                  {roleModalUser.targetRole === 'admin' ? 'Elevated to Administrator' : 'Restored to Partner Reseller'}
                </span>
              </div>

              {roleModalUser.targetRole === 'admin' ? (
                <ul className="space-y-1.5 text-[11.5px] leading-relaxed font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Full Administrative Access:</strong> Unlocks complete clearance to the <code>/admin</code> control terminal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Commerce &amp; Shipping Management:</strong> Manage sales orders, wholesale prices, profit margins, and categories.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Network Tree &amp; Bonuses:</strong> Review team downlines, rank elevations, and approve milestone bonus payouts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Instant Cloud Sync:</strong> Clearance updates propagate across Firestore, Realtime Database, and active client sessions.</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-1.5 text-[11.5px] leading-relaxed font-sans">
                  <li className="flex items-start gap-2">
                    <Warning size={15} weight="fill" className="text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Immediate Access Termination:</strong> Revokes access to <code>/admin</code> and all back-office operational consoles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Warning size={15} weight="fill" className="text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Restored to Partner Reseller:</strong> Account will be restricted solely to the standard Reseller Hub (<code>/dashboard</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Warning size={15} weight="fill" className="text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Active Sessions Terminated:</strong> Any active administrative browser sessions for this user will redirect immediately.</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Superadmin Authorization Stamp */}
            <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2 text-amber-300">
                <Crown size={14} weight="fill" />
                <span>Superadmin Authorization:</span>
              </div>
              <span className="font-bold text-[#F4F7F5]">{SUPERADMIN_EMAIL}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRoleModalUser(null)}
                disabled={isUpdatingRole}
                className="text-xs font-semibold px-4 min-h-[40px]"
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isUpdatingRole}
                className={`min-h-[40px] px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  roleModalUser.targetRole === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/40 active:scale-95'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-950/40 active:scale-95'
                } ${isUpdatingRole ? 'opacity-70 cursor-wait' : ''}`}
              >
                {isUpdatingRole ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Clearance...</span>
                  </>
                ) : (
                  <>
                    {roleModalUser.targetRole === 'admin' ? (
                      <ShieldPlus size={15} weight="bold" />
                    ) : (
                      <ShieldSlash size={15} weight="bold" />
                    )}
                    <span>
                      {roleModalUser.targetRole === 'admin'
                        ? 'Confirm Administrator Clearance'
                        : 'Confirm Revocation of Access'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Rescue & Password Reset Modal */}
      {showRescueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0D1512] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(217,192,138,0.1)] p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-sm">
                  <Key size={20} weight="bold" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F4F7F5]">Partner Account Rescue Desk</h3>
                  <p className="text-xs text-[#9EABA2]">Resolve registration conflicts, recover passwords, and heal orphaned accounts.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRescueModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[#9EABA2] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D9C08A] text-[11px] leading-relaxed">
                <strong>How this works:</strong> If a partner receives an &quot;already registered&quot; error or is missing from the database, enter their email below to send them an official password reset link or provision their profile.
              </div>

              <div className="space-y-1">
                <label className="block text-[#9EABA2] font-medium">Partner Email Address *</label>
                <input
                  type="email"
                  value={rescueEmail}
                  onChange={(e) => setRescueEmail(e.target.value)}
                  placeholder="e.g. zs3207432@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/40 text-xs focus:outline-none focus:border-[#D9C08A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[#9EABA2] font-medium">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={rescueName}
                    onChange={(e) => setRescueName(e.target.value)}
                    placeholder="e.g. Tehreem Fatima"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/40 text-xs focus:outline-none focus:border-[#D9C08A]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[#9EABA2] font-medium">Sponsor Code (Optional)</label>
                  <input
                    type="text"
                    value={rescueSponsor}
                    onChange={(e) => setRescueSponsor(e.target.value)}
                    placeholder="e.g. DTA-6267"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/40 text-xs focus:outline-none focus:border-[#D9C08A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  disabled={isRescuing || !rescueEmail.trim()}
                  onClick={() => handleRescuePasswordReset()}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#D9C08A] hover:bg-[#c4ab75] text-[#070B09] font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <EnvelopeSimple size={15} weight="bold" />
                  <span>Send Reset Email</span>
                </button>
                <button
                  type="button"
                  disabled={isRescuing || !rescueEmail.trim()}
                  onClick={handleRescueProvisionProfile}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[#F4F7F5] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkle size={15} className="text-[#D9C08A]" />
                  <span>Heal & Sync Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

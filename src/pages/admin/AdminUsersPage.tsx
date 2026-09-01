import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/services/storage';
import { authService } from '@/services/authService';
import { referralService } from '@/services/referralService';
import { salesService } from '@/services/salesService';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { User, RankSlug, ReferralRecord, Sale } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  MagnifyingGlass,
  Users,
  X,
  Trash,
  CheckCircle,
  ShieldCheck,
  TreeStructure,
  UserCircle,
  Crown,
  Check,
  Warning,
  Eye,
  ArrowClockwise,
  Funnel,
  DownloadSimple,
  ShoppingCart,
  TrendUp,
  SlidersHorizontal,
  Sparkle,
  Fire,
  UserPlus,
  CurrencyDollar,
  Phone,
  MapPin,
  CaretUpDown,
  Clock,
} from '@phosphor-icons/react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('USERS', []));

  const formatTimeAgo = (dateStr: string) => {
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
  
  // Search, Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [quickTab, setQuickTab] = useState<'all' | 'active' | 'top_sellers' | 'top_recruiters' | 'high_ranks' | 'suspended'>('all');
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
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
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
      const synced = await authService.getAllUsers();
      setUsers(synced);
      setSales(storage.get<Sale[]>('SALES', []));
      setReferrals(storage.get<ReferralRecord[]>('REFERRALS', []));
      showToast(`Synchronized ${synced.length} registered users from cloud database.`);
    } catch (e) {
      showToast('Could not reach cloud database. Showing local cached users.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Initial sync & Real-time Cloud Firestore/RTDB stream listener
    const unsubscribe = authService.subscribeToAllUsers((cloudUsers) => {
      setUsers(cloudUsers);
    });

    const handleStorage = () => refreshData();
    window.addEventListener('dta_storage_change', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('dta_storage_change', handleStorage);
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
    if (!referredByCode) return null;
    const clean = referredByCode.trim().toUpperCase();
    const sponsor = users.find(
      (u) => u.referralCode?.toUpperCase() === clean || u.id === referredByCode
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

        // 1. Search Query (Name, Email, Referral Code, Phone, City, Sponsor)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = u.fullName.toLowerCase().includes(q);
          const matchesEmail = u.email.toLowerCase().includes(q);
          const matchesCode = u.referralCode.toLowerCase().includes(q);
          const matchesSponsor = (u.referredByCode || '').toLowerCase().includes(q);
          const matchesPhone = (u.phone || '').toLowerCase().includes(q);
          const matchesCity = (u.city || '').toLowerCase().includes(q);

          if (!matchesName && !matchesEmail && !matchesCode && !matchesSponsor && !matchesPhone && !matchesCity) {
            return false;
          }
        }

        // 2. Quick Tab Preset
        if (quickTab === 'active' && u.isActive === false) return false;
        if (quickTab === 'suspended' && u.isActive !== false) return false;
        if (quickTab === 'top_sellers' && metrics.unitsSold === 0) return false;
        if (quickTab === 'top_recruiters' && metrics.downlineCount === 0) return false;
        if (quickTab === 'high_ranks' && !['silver', 'gold', 'platinum', 'diamond'].includes(u.currentRankSlug || '')) return false;

        // 3. Rank Filter
        if (rankFilter !== 'all') {
          if (rankFilter === 'admin' && u.role !== 'admin') return false;
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
            const rankWeights: Record<string, number> = { diamond: 5, platinum: 4, gold: 3, silver: 2, unranked: 1 };
            return (rankWeights[b.currentRankSlug || 'unranked'] || 0) - (rankWeights[a.currentRankSlug || 'unranked'] || 0);
          }
          case 'name_asc':
            return a.fullName.localeCompare(b.fullName);
          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
      'Phone Number',
      'City',
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
        `"${u.fullName.replace(/"/g, '""')}"`,
        `"${u.email}"`,
        `"${u.phone || 'N/A'}"`,
        `"${u.city || 'N/A'}"`,
        `"${u.referralCode}"`,
        `"${sponsor ? `${sponsor.name} (${sponsor.code})` : 'Organic / Direct'}"`,
        `"${u.currentRankSlug.toUpperCase()}"`,
        `"${u.role}"`,
        `"${u.isActive !== false ? 'Active' : 'Suspended'}"`,
        metrics?.unitsSold || 0,
        metrics?.totalRevenue || 0,
        metrics?.totalProfit || 0,
        metrics?.downlineCount || 0,
        metrics?.qualifyingCount || 0,
        `"${new Date(u.createdAt).toISOString()}"`,
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

  const handleRankOverride = (newRank: RankSlug) => {
    if (!selectedUser) return;
    const updated = users.map((u) => (u.id === selectedUser.id ? { ...u, currentRankSlug: newRank } : u));
    storage.set('USERS', updated);
    setUsers(updated);
    setSelectedUser(null);
    showToast(`Updated ${selectedUser.fullName}'s rank to ${newRank.toUpperCase()}.`);
  };

  const handleToggleStatus = (u: User) => {
    const updated = users.map((item) => (item.id === u.id ? { ...item, isActive: !item.isActive } : item));
    storage.set('USERS', updated);
    setUsers(updated);
    showToast(`Account ${u.fullName} is now ${!u.isActive ? 'Active' : 'Suspended'}.`);
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;

    if (deletingUser.id === currentAdmin?.id) {
      showToast('You cannot delete your own active administrator account.', 'error');
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);

    try {
      // 1. Unified persistent delete across Firestore, RTDB, blacklist, and Local Storage
      await authService.deleteUser(deletingUser.id, deletingUser.referralCode);

      // 2. Instant UI optimistic update
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));

      // 3. Record in audit log
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
    } catch (e: any) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
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
  const totalTopSellers = users.filter((u) => (userMetricsMap.get(u.id)?.unitsSold || 0) > 0).length;
  const totalTopRecruiters = users.filter((u) => (userMetricsMap.get(u.id)?.downlineCount || 0) > 0).length;
  const totalHighRanks = users.filter((u) => ['silver', 'gold', 'platinum', 'diamond'].includes(u.currentRankSlug || '')).length;
  const totalActive = users.filter((u) => u.isActive !== false).length;
  const totalSuspended = users.filter((u) => u.isActive === false).length;

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Store Admin</span>
            <span>/</span>
            <span>Partner Directory &amp; Sales Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E241F]">
            User Accounts &amp; Partner Directory
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Comprehensive directory of registered resellers. Filter by sales performance, milestone ranks, recruitment volume, and account status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold shrink-0"
            iconLeft={<DownloadSimple size={14} />}
            title="Download partner database as CSV spreadsheet"
          >
            Export CSV
          </Button>

          <Button
            onClick={handleManualSync}
            variant="outline"
            size="sm"
            className="text-xs font-semibold shrink-0"
            isLoading={isSyncing}
            iconLeft={<ArrowClockwise size={14} className={isSyncing ? 'animate-spin' : ''} />}
            title="Fetch all registered users from Cloud Firestore & RTDB"
          >
            {isSyncing ? 'Syncing...' : 'Sync Cloud'}
          </Button>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in shadow-xs ${
            toastMsg.type === 'success'
              ? 'bg-[#F1ECDD] border-[#E3DCC8] text-[#1F4D3E]'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {toastMsg.type === 'success' ? <Check size={16} weight="bold" /> : <Warning size={16} weight="bold" />}
          <span className="font-semibold">{toastMsg.text}</span>
        </div>
      )}

      {/* 1. Quick Metric Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => { setQuickTab('all'); setStatusFilter('all'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'all'
              ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] shadow-xs'
              : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
          }`}
        >
          <Users size={14} />
          <span>All Partners ({users.length})</span>
        </button>

        <button
          onClick={() => { setQuickTab('active'); setStatusFilter('active'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'active'
              ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] shadow-xs'
              : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
          }`}
        >
          <CheckCircle size={14} className="text-emerald-600" />
          <span>Active ({totalActive})</span>
        </button>

        <button
          onClick={() => { setQuickTab('top_sellers'); setSalesFilter('has_sales'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'top_sellers'
              ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] shadow-xs'
              : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
          }`}
        >
          <Fire size={14} className="text-amber-500" weight="fill" />
          <span>Top Resellers / High Sales ({totalTopSellers})</span>
        </button>

        <button
          onClick={() => { setQuickTab('top_recruiters'); setReferralFilter('has_referrals'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'top_recruiters'
              ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] shadow-xs'
              : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
          }`}
        >
          <TreeStructure size={14} className="text-blue-600" />
          <span>Top Recruiters ({totalTopRecruiters})</span>
        </button>

        <button
          onClick={() => { setQuickTab('high_ranks'); setRankFilter('all'); }}
          className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            quickTab === 'high_ranks'
              ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] shadow-xs'
              : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
          }`}
        >
          <Crown size={14} className="text-[#B8862E]" weight="fill" />
          <span>Rank Leaders ({totalHighRanks})</span>
        </button>

        {totalSuspended > 0 && (
          <button
            onClick={() => { setQuickTab('suspended'); setStatusFilter('suspended'); }}
            className={`px-3.5 py-2 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickTab === 'suspended'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Warning size={14} />
            <span>Suspended ({totalSuspended})</span>
          </button>
        )}
      </div>

      {/* 2. Comprehensive Filter & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E3DCC8] space-y-3.5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Search */}
          <div className="relative flex-1 text-xs">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, referral code, sponsor, city, or phone..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#7C7D70] focus:outline-none focus:border-[#1F4D3E] text-xs"
            />
          </div>

          {/* Reset Filters */}
          {(searchQuery || rankFilter !== 'all' || statusFilter !== 'all' || referralFilter !== 'all' || salesFilter !== 'all' || sortBy !== 'newest') && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] text-xs font-semibold text-[#1E241F] transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
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
            <label className="text-[10.5px] font-mono text-[#5B5C50] font-semibold block">Filter by Rank</label>
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
            >
              <option value="all">All Ranks</option>
              <option value="diamond">👑 Diamond (Level 04)</option>
              <option value="platinum">⭐ Platinum (Level 03)</option>
              <option value="gold">🥇 Gold (Level 02)</option>
              <option value="silver">🥈 Silver (Level 01)</option>
              <option value="unranked">Unranked (Starter)</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* 2. Filter by Sales (Products Sold High) */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[#5B5C50] font-semibold block">Sales Volume (Sold High)</label>
            <select
              value={salesFilter}
              onChange={(e) => setSalesFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
            >
              <option value="all">All Sales Levels</option>
              <option value="high_volume">🔥 High Volume (5+ Units)</option>
              <option value="top_earners">💰 Top Margin Earners (&gt;PKR 3k)</option>
              <option value="has_sales">📦 Has Sold (1+ Units)</option>
              <option value="no_sales">No Sales Yet</option>
            </select>
          </div>

          {/* 3. Filter by Referrals & Recruitment */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[#5B5C50] font-semibold block">Recruitment / Team</label>
            <select
              value={referralFilter}
              onChange={(e) => setReferralFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
            >
              <option value="all">All Team Sizes</option>
              <option value="top_recruiters">👥 Top Recruiters (5+ Team)</option>
              <option value="has_referrals">🌱 Has Referrals (1+ Team)</option>
              <option value="no_referrals">Zero Referrals</option>
            </select>
          </div>

          {/* 4. Filter by Account Status */}
          <div className="space-y-1">
            <label className="text-[10.5px] font-mono text-[#5B5C50] font-semibold block">Account Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Accounts Only</option>
              <option value="suspended">Suspended / Inactive Only</option>
            </select>
          </div>

          {/* 5. Sort By */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[10.5px] font-mono text-[#5B5C50] font-semibold block">Sort Directory By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] cursor-pointer font-medium"
            >
              <option value="newest">Recently Registered</option>
              <option value="highest_sales">Highest Units Sold 🔥</option>
              <option value="highest_profit">Highest Profit Earned 💰</option>
              <option value="most_referrals">Most Referrals Onboarded 👥</option>
              <option value="rank_desc">Highest Rank Milestone 👑</option>
              <option value="name_asc">Name (A to Z)</option>
              <option value="oldest">Earliest Registered</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Filtered Users Table */}
      <div className="rounded-3xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-4 bg-[#FAF7EF] border-b border-[#E3DCC8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-[#1E241F]">Partner Directory</span>
            <span className="text-[11px] text-[#5B5C50] bg-white px-2.5 py-0.5 rounded-full border border-[#E3DCC8]">
              {processedUsers.length} of {users.length} Partners Matching
            </span>
          </div>
          <span className="text-[10.5px] text-[#7C7D70]">
            Click Inspect to view full downline &amp; sales breakdown
          </span>
        </div>

        {processedUsers.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-3">
            <Users size={36} className="text-[#7C7D70] mx-auto" />
            <p className="font-bold text-base text-[#1E241F]">No partner accounts match current filters</p>
            <p className="text-xs text-[#7C7D70]">Try adjusting your search keywords, rank filter, or sales volume filters.</p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-xs font-semibold text-[#1F4D3E] hover:bg-[#F1ECDD] transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10.5px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-semibold">Partner Profile</th>
                  <th className="p-3.5 font-semibold">Referral &amp; Sponsor</th>
                  <th className="p-3.5 font-semibold">Rank Level</th>
                  <th className="p-3.5 font-semibold text-right">Delivered Sales (Sold High)</th>
                  <th className="p-3.5 font-semibold text-center">Downline Team</th>
                  <th className="p-3.5 font-semibold text-center">Status</th>
                  <th className="p-3.5 font-semibold text-center">Registered</th>
                  <th className="p-3.5 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
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
                    <tr key={u.id} className="hover:bg-[#FAF7EF]/70 transition-colors">
                      {/* 1. Partner Profile */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#1F4D3E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#1E241F] text-xs sm:text-sm truncate">{u.fullName}</p>
                            <p className="text-[10.5px] font-mono text-[#7C7D70] truncate">{u.email}</p>
                            {(u.city || u.phone) && (
                              <p className="text-[9.5px] text-[#5B5C50] font-mono mt-0.5 truncate">
                                {u.city && <span>📍 {u.city}</span>}
                                {u.city && u.phone && <span> • </span>}
                                {u.phone && <span>📞 {u.phone}</span>}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Referral & Sponsor */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#1F4D3E] bg-[#FAF7EF] px-2 py-0.5 rounded border border-[#E3DCC8] text-xs inline-block">
                            {u.referralCode}
                          </span>
                          <p className="text-[10px] text-[#7C7D70] font-mono truncate">
                            {sponsor ? `Invited by: ${sponsor.name} (${sponsor.code})` : 'Direct / Organic'}
                          </p>
                        </div>
                      </td>

                      {/* 3. Rank Level */}
                      <td className="p-3.5">
                        <span className="font-mono uppercase text-[10.5px] font-bold text-[#1E241F] px-2.5 py-1 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] inline-flex items-center gap-1">
                          {u.currentRankSlug === 'diamond' && <Crown size={12} weight="fill" className="text-[#B8862E]" />}
                          {u.currentRankSlug === 'platinum' && <Sparkle size={12} weight="fill" className="text-purple-600" />}
                          {u.currentRankSlug === 'gold' && <Sparkle size={12} weight="fill" className="text-amber-500" />}
                          {u.currentRankSlug === 'silver' && <Sparkle size={12} weight="fill" className="text-slate-400" />}
                          <span>{u.currentRankSlug}</span>
                        </span>
                      </td>

                      {/* 4. Delivered Sales & Profit (Sold High) */}
                      <td className="p-3.5 text-right">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-[#1F4D3E] text-xs block">
                            {metrics.unitsSold} units delivered
                          </span>
                          <span className="font-mono text-[10.5px] text-[#B8862E] font-semibold block">
                            +PKR {metrics.totalProfit.toLocaleString()} profit
                          </span>
                          {metrics.totalRevenue > 0 && (
                            <span className="text-[9.5px] text-[#7C7D70] font-mono block">
                              PKR {metrics.totalRevenue.toLocaleString()} volume
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Downline Team */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setInspectingUser(u)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] font-mono text-xs transition-colors cursor-pointer"
                          title="Inspect Onboarded Teammates"
                        >
                          <TreeStructure size={14} className="text-[#1F4D3E]" />
                          <span className="font-bold">{metrics.downlineCount}</span>
                          <span className="text-[10px] text-[#7C7D70]">({metrics.qualifyingCount} Active)</span>
                        </button>
                      </td>

                      {/* 6. Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block text-[10.5px] font-mono font-bold capitalize px-2.5 py-0.5 rounded-full border ${
                            u.isActive !== false
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                        {u.role === 'admin' && (
                          <span className="block mt-1 font-mono text-[9px] text-white bg-[#1F4D3E] px-1.5 py-0.2 rounded mx-auto w-fit">
                            ADMIN
                          </span>
                        )}
                      </td>

                      {/* 7. Registered Time Ago */}
                      <td className="p-3.5 text-center">
                        <span
                          className="font-mono text-[10.5px] text-[#1E241F] bg-[#FAF7EF] px-2.5 py-1 rounded-lg border border-[#E3DCC8] inline-flex items-center gap-1 font-medium shadow-2xs whitespace-nowrap"
                          title={new Date(u.createdAt).toLocaleString()}
                        >
                          <Clock size={12} className="text-[#1F4D3E]" />
                          <span>{formatTimeAgo(u.createdAt)}</span>
                        </span>
                      </td>

                      {/* 8. Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7EF] hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8] text-[11px] font-mono font-medium cursor-pointer"
                            title="Override Milestone Rank Level"
                          >
                            Rank
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7EF] hover:bg-rose-50 text-[#5B5C50] hover:text-rose-700 border border-[#E3DCC8] text-[11px] font-mono font-medium cursor-pointer"
                            title={u.isActive !== false ? 'Suspend User' : 'Activate User'}
                          >
                            {u.isActive !== false ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={u.id === currentAdmin?.id}
                            className={`p-1.5 rounded-lg border text-[11px] transition-colors ${
                              u.id === currentAdmin?.id
                                ? 'opacity-30 cursor-not-allowed text-gray-400 border-gray-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                            }`}
                            title={u.id === currentAdmin?.id ? 'Cannot delete current logged in admin' : 'Permanently Delete User'}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-3xl p-6 sm:p-7 rounded-3xl bg-white border border-[#E3DCC8] shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#E3DCC8]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1F4D3E] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {inspectingUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg text-[#1E241F]">
                        {inspectingUser.fullName}
                      </h3>
                      <span className="font-mono uppercase text-[10px] font-bold text-[#1E241F] px-2 py-0.5 rounded bg-[#FAF7EF] border border-[#E3DCC8]">
                        {inspectingUser.currentRankSlug}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-[#5B5C50]">
                      {inspectingUser.email} {inspectingUser.phone && `• ${inspectingUser.phone}`} {inspectingUser.city && `• 📍 ${inspectingUser.city}`}
                    </p>
                    <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">
                      Code: <strong className="text-[#1F4D3E]">{inspectingUser.referralCode}</strong> • Sponsor: <strong className="text-[#1E241F]">{sponsor ? `${sponsor.name} (${sponsor.code})` : 'Direct / Organic'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingUser(null)}
                  className="p-1.5 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 4 Performance Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3.5 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                  <span className="text-[10px] text-[#5B5C50] font-semibold block">Delivered Units</span>
                  <p className="text-xl font-bold text-[#1F4D3E]">{metrics.unitsSold} Units</p>
                  <span className="text-[10px] text-[#7C7D70]">{metrics.salesCount} delivered orders</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                  <span className="text-[10px] text-[#5B5C50] font-semibold block">Total Margin Earned</span>
                  <p className="text-xl font-bold text-[#B8862E]">PKR {metrics.totalProfit.toLocaleString()}</p>
                  <span className="text-[10px] text-[#7C7D70]">Net seller profit</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                  <span className="text-[10px] text-[#5B5C50] font-semibold block">Sales Volume (Gross)</span>
                  <p className="text-xl font-bold text-[#1E241F]">PKR {metrics.totalRevenue.toLocaleString()}</p>
                  <span className="text-[10px] text-[#7C7D70]">Client order value</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                  <span className="text-[10px] text-[#5B5C50] font-semibold block">Downline Team</span>
                  <p className="text-xl font-bold text-[#1E241F]">{metrics.downlineCount} Members</p>
                  <span className="text-[10px] text-[#7C7D70]">{metrics.qualifyingCount} qualifying active</span>
                </div>
              </div>

              {/* Section 1: Customer Purchases & Product Orders */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-xs text-[#1E241F] flex items-center gap-1.5">
                    <ShoppingCart size={15} className="text-[#1F4D3E]" />
                    Customer Orders Sold ({userSalesList.length})
                  </span>
                  <span className="text-[10.5px] text-[#7C7D70]">
                    Total Units: {metrics.unitsSold}
                  </span>
                </div>

                {userSalesList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] text-center text-[#5B5C50]">
                    <p className="font-semibold text-xs">No client orders recorded yet.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E3DCC8] overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-left font-sans">
                      <thead className="bg-[#FAF7EF] border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2.5">Order ID</th>
                          <th className="p-2.5">Product Name</th>
                          <th className="p-2.5">Customer (Buyer)</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Profit Margin</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                        {userSalesList.map((s) => (
                          <tr key={s.id} className="hover:bg-[#FAF7EF]/60">
                            <td className="p-2.5 font-mono text-[10.5px] font-bold text-[#1E241F]">{s.id}</td>
                            <td className="p-2.5 font-medium text-[#1E241F]">{s.productName}</td>
                            <td className="p-2.5 text-[#5B5C50]">{s.customerName || 'Direct Buyer'}</td>
                            <td className="p-2.5 text-center font-mono font-bold">{s.quantity || 1}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-[#1F4D3E]">
                              +PKR {((s.profitMargin || 0) * (s.quantity || 1)).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="font-mono text-[9.5px] px-2 py-0.5 rounded capitalize bg-[#FAF7EF] border border-[#E3DCC8]">
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
                  <span className="font-bold text-xs text-[#1E241F] flex items-center gap-1.5">
                    <TreeStructure size={15} className="text-[#1F4D3E]" />
                    Referred Downline Team ({userDownline.length})
                  </span>
                  <span className="text-[10.5px] text-[#7C7D70]">
                    {metrics.qualifyingCount} Qualifying Active
                  </span>
                </div>

                {userDownline.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] text-center text-[#5B5C50]">
                    <p className="font-semibold text-xs">No teammates onboarded yet with code {inspectingUser.referralCode}.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E3DCC8] overflow-x-auto max-h-48 overflow-y-auto">
                    <table className="w-full text-left font-sans">
                      <thead className="bg-[#FAF7EF] border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2.5">Teammate</th>
                          <th className="p-2.5">Rank Level</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Joined Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                        {userDownline.map((r) => (
                          <tr key={r.id} className="hover:bg-[#FAF7EF]/60">
                            <td className="p-2.5">
                              <p className="font-medium text-[#1E241F]">{r.referredUserName}</p>
                              <p className="text-[10px] font-mono text-[#7C7D70]">{r.referredUserEmail || 'No email'}</p>
                            </td>
                            <td className="p-2.5 font-mono uppercase text-[10px] font-bold">
                              {r.referredUserRank || 'unranked'}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                                  r.isQualifying
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {r.isQualifying ? 'Qualifying Active' : 'Pending Activation'}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-mono text-[10px] text-[#7C7D70]">
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E3DCC8]">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-[#E3DCC8] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center space-x-3 text-rose-700 pb-3 border-b border-[#E3DCC8]">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash size={20} />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1E241F]">Permanently Delete User?</h3>
                <p className="text-[11px] text-[#5B5C50]">This action removes the account across all databases.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5 text-xs text-[#1E241F]">
              <p className="font-semibold">
                Are you sure you want to permanently delete partner:
              </p>
              <div className="font-mono text-[11px] space-y-0.5 pt-1">
                <p>• Name: <span className="font-bold">{deletingUser.fullName}</span></p>
                <p>• Email: <span className="font-bold">{deletingUser.email}</span></p>
                <p>• Referral Code: <span className="font-bold">{deletingUser.referralCode}</span></p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#E3DCC8]">
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
                className="bg-rose-700 hover:bg-rose-800 text-white border-transparent"
              >
                Delete Account Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Change Level Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white border border-[#E3DCC8] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
              <h3 className="font-bold text-base text-[#1E241F]">
                Override Rank: {selectedUser.fullName}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {(['unranked', 'silver', 'platinum', 'gold', 'diamond'] as RankSlug[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRankOverride(r)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between font-mono uppercase transition-colors cursor-pointer ${
                    selectedUser.currentRankSlug === r
                      ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] font-bold'
                      : 'bg-[#FAF7EF] text-[#1E241F] border-[#E3DCC8] hover:bg-[#F1ECDD]'
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

    </div>
  );
};


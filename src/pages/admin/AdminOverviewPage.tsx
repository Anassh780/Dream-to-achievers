import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/services/storage';
import { User, Sale, Reward } from '@/types';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Wallet,
  Package,
  Users,
  ArrowRight,
  ShieldCheck,
  TrendUp,
  Gift,
} from '@phosphor-icons/react';

export const AdminOverviewPage: React.FC = () => {
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setSyncKey((k) => k + 1);
    window.addEventListener('dta_storage_change', handleUpdate);
    window.addEventListener('dta_users_update', handleUpdate);
    window.addEventListener('dta_products_update', handleUpdate);
    return () => {
      window.removeEventListener('dta_storage_change', handleUpdate);
      window.removeEventListener('dta_users_update', handleUpdate);
      window.removeEventListener('dta_products_update', handleUpdate);
    };
  }, []);

  const users = useMemo(() => storage.get<User[]>('USERS', []), [syncKey]);
  const sales = useMemo(() => storage.get<Sale[]>('SALES', []), [syncKey]);
  const rewards = useMemo(() => storage.get<Reward[]>('REWARDS', []), [syncKey]);

  const totalSalesRevenue = useMemo(
    () => sales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0),
    [sales]
  );
  const totalProfitIssued = useMemo(
    () => sales.reduce((sum, s) => sum + s.profitMargin * s.quantity, 0),
    [sales]
  );
  const totalRewardsApproved = useMemo(
    () =>
      rewards
        .filter((r) => r.status === 'approved' || r.status === 'paid')
        .reduce((sum, r) => sum + r.amount, 0),
    [rewards]
  );
  const pendingRewardsCount = useMemo(
    () => rewards.filter((r) => r.status === 'pending_review').length,
    [rewards]
  );

  const rankCounts = useMemo(
    () => ({
      silver: users.filter((u) => u.currentRankSlug === 'silver').length,
      platinum: users.filter((u) => u.currentRankSlug === 'platinum').length,
      gold: users.filter((u) => u.currentRankSlug === 'gold').length,
      diamond: users.filter((u) => u.currentRankSlug === 'diamond').length,
      unranked: users.filter((u) => u.currentRankSlug === 'unranked').length,
    }),
    [users]
  );

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#D9C08A]/25">
      {/* Top Console Header */}
      <div className="funding-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-[radial-gradient(circle,rgba(217,192,138,0.08),transparent_70%)] blur-2xl" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#D9C08A] border-[#D9C08A]/30">Executive Console</span>
            <span>•</span>
            <span>Platform Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight">
            Executive Business Dashboard
          </h1>
          <p className="text-xs text-[#9EABA2] max-w-2xl">
            High-level operational overview of commercial sales, reseller profit distributions, and pending disbursements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto z-10 shrink-0">
          <Link to="/admin/rewards" className="flex-1 sm:flex-initial">
            <button className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#D9C08A] hover:border-[#D9C08A]/40 w-full inline-flex items-center justify-center cursor-pointer transition-all">
              Payouts Queue ({pendingRewardsCount})
            </button>
          </Link>
          <Link to="/admin/products" className="flex-1 sm:flex-initial">
            <button className="funding-champagne-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider w-full inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* 1. Primary KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* KPI 1: Registered Partners */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[#9EABA2] text-xs font-mono font-medium">Registered Partners</span>
            <div className="w-9 h-9 rounded-xl bg-[#34D399]/10 text-[#34D399] flex items-center justify-center border border-[#34D399]/25 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#F4F7F5] tracking-tight">{users.length}</p>
            <span className="text-[11px] font-mono text-[#9EABA2] mt-0.5 block">Active platform members</span>
          </div>
        </div>

        {/* KPI 2: Total Orders Revenue */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[#9EABA2] text-xs font-mono font-medium">Total Orders Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-[#D9C08A]/10 text-[#D9C08A] flex items-center justify-center border border-[#D9C08A]/25 shadow-[0_0_15px_rgba(217,192,138,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#D9C08A] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#F4F7F5] tracking-tight">PKR {totalSalesRevenue.toLocaleString()}</p>
            <span className="text-[11px] font-mono text-[#9EABA2] mt-0.5 block">{sales.length} customer purchases</span>
          </div>
        </div>

        {/* KPI 3: Seller Profit Margins */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group border-[#34D399]/20 hover:border-[#34D399]/40">
          <div className="flex items-center justify-between">
            <span className="text-[#34D399] text-xs font-mono font-bold">Seller Profit Margins</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#34D399]/20 to-[#34D399]/5 text-[#34D399] flex items-center justify-center border border-[#34D399]/30 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#34D399] tracking-tight">PKR {totalProfitIssued.toLocaleString()}</p>
            <span className="text-[11px] font-mono text-[#9EABA2] mt-0.5 block">Earned by reseller partners</span>
          </div>
        </div>

        {/* KPI 4: Milestone Rank Bonuses */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group border-[#D9C08A]/20 hover:border-[#D9C08A]/40">
          <div className="flex items-center justify-between">
            <span className="text-[#D9C08A] text-xs font-mono font-bold">Milestone Rank Bonuses</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9C08A]/20 to-[#D9C08A]/5 text-[#D9C08A] flex items-center justify-center border border-[#D9C08A]/30 shadow-[0_0_20px_rgba(217,192,138,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#D9C08A] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#D9C08A] tracking-tight">PKR {totalRewardsApproved.toLocaleString()}</p>
            <span className="text-[11px] font-mono text-[#9EABA2] mt-0.5 block">{pendingRewardsCount} pending review</span>
          </div>
        </div>
      </div>

      {/* 2. Executive Command Hub (Google-Style Clear Operational Tiles) */}
      <div className="funding-card p-6 sm:p-7 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-white/[0.08]">
          <div>
            <h3 className="font-serif font-bold text-base text-[#F4F7F5]">Executive Operations Center</h3>
            <p className="text-[11px] text-[#9EABA2]">Direct single-click navigation to core fulfillment and financial operations</p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#D9C08A] border border-white/10 self-start sm:self-auto">
            Operational Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Sales Fulfillment */}
          <Link
            to="/admin/sales"
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <ShoppingCart size={20} weight="duotone" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#F4F7F5] group-hover:text-emerald-400 transition-colors">
                Order Fulfillment
              </h4>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                Review {sales.length} customer orders, verify payment slips, and assign courier tracking.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400 pt-1">
              <span>Audit Sales Desk</span>
              <ArrowRight size={13} />
            </span>
          </Link>

          {/* Action 2: Withdrawals & Rewards */}
          <Link
            to="/admin/rewards"
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-[#D9C08A]/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[#D9C08A]/10 text-[#D9C08A] flex items-center justify-center border border-[#D9C08A]/20">
                <Wallet size={20} weight="duotone" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors">
                Payouts &amp; Bonuses
              </h4>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                Disburse partner profit withdrawals and approve milestone level bonuses ({pendingRewardsCount} pending).
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#D9C08A] pt-1">
              <span>Process Payouts</span>
              <ArrowRight size={13} />
            </span>
          </Link>

          {/* Action 3: Wholesale Inventory */}
          <Link
            to="/admin/products"
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-sky-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Package size={20} weight="duotone" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#F4F7F5] group-hover:text-sky-400 transition-colors">
                Wholesale Catalog
              </h4>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                Add products, update stock availability, set wholesale pricing, and toggle COD support.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-sky-400 pt-1">
              <span>Manage Inventory</span>
              <ArrowRight size={13} />
            </span>
          </Link>

          {/* Action 4: Partner Directory */}
          <Link
            to="/admin/users"
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-purple-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Users size={20} weight="duotone" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#F4F7F5] group-hover:text-purple-400 transition-colors">
                Partner Directory
              </h4>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                Inspect {users.length} registered partners, view referral trees, and manage admin clearances.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-purple-400 pt-1">
              <span>View Directory</span>
              <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </div>

      {/* 3. Rank Distribution Snapshot */}
      <div className="funding-card p-6 sm:p-7 space-y-5 text-xs relative overflow-hidden">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div>
            <h3 className="font-serif font-bold text-base text-[#F4F7F5]">Partner Rank Progression</h3>
            <p className="text-[11px] text-[#9EABA2]">Active distributors across rank milestone levels</p>
          </div>
          <Link to="/admin/ranks" className="text-xs text-[#D9C08A] hover:underline font-semibold flex items-center gap-1">
            <span>Manage Level Criteria →</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 transition-all">
            <span className="text-[#9EABA2] block text-[11px] sm:text-xs font-medium">Unranked</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7F5] mt-1 block">{rankCounts.unranked}</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-[#34D399]/20 hover:border-[#34D399]/40 transition-all">
            <span className="text-[#34D399] block text-[11px] sm:text-xs font-semibold truncate">Level 01 (Silver)</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7F5] mt-1 block">{rankCounts.silver}</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-[#34D399]/20 hover:border-[#34D399]/40 transition-all">
            <span className="text-[#34D399] block text-[11px] sm:text-xs font-semibold truncate">Level 02 (Platinum)</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7F5] mt-1 block">{rankCounts.platinum}</span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-[#D9C08A]/20 hover:border-[#D9C08A]/40 transition-all">
            <span className="text-[#D9C08A] block text-[11px] sm:text-xs font-semibold truncate">Level 03 (Gold)</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#F4F7F5] mt-1 block">{rankCounts.gold}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-[#D9C08A]/30 hover:border-[#D9C08A]/60 transition-all">
            <span className="text-[#D9C08A] block text-[11px] sm:text-xs font-bold truncate">Level 04 (Diamond)</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#D9C08A] mt-1 block">{rankCounts.diamond}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminOverviewPage;

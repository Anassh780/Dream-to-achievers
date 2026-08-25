import React from 'react';
import { storage } from '@/services/storage';
import { User, Sale, Reward, ReferralRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const AdminOverviewPage: React.FC = () => {
  const users = storage.get<User[]>('USERS', []);
  const sales = storage.get<Sale[]>('SALES', []);
  const rewards = storage.get<Reward[]>('REWARDS', []);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0);
  const totalProfitIssued = sales.reduce((sum, s) => sum + s.profitMargin * s.quantity, 0);
  const totalRewardsApproved = rewards
    .filter((r) => r.status === 'approved' || r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
  const pendingRewardsCount = rewards.filter((r) => r.status === 'pending_review').length;

  const rankCounts = {
    silver: users.filter((u) => u.currentRankSlug === 'silver').length,
    platinum: users.filter((u) => u.currentRankSlug === 'platinum').length,
    gold: users.filter((u) => u.currentRankSlug === 'gold').length,
    diamond: users.filter((u) => u.currentRankSlug === 'diamond').length,
    unranked: users.filter((u) => u.currentRankSlug === 'unranked').length,
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
            <span>Management</span>
            <span>•</span>
            <span>Platform Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            System Administration
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link to="/admin/rewards">
            <Button variant="secondary" size="sm">
              Review Rewards ({pendingRewardsCount})
            </Button>
          </Link>
          <Link to="/admin/products">
            <Button variant="primary" size="sm">
              + Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Matrix (Step 13, 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-1">
          <span className="text-[#8996A8] block">Total Partners</span>
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <span className="text-[11px] text-[#8996A8]">Active accounts</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-1">
          <span className="text-[#8996A8] block">Sales Volume</span>
          <p className="text-2xl font-bold text-white">PKR {totalSalesRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-[#8996A8]">{sales.length} transactions</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-1">
          <span className="text-[#8996A8] block">Profit Margins Paid</span>
          <p className="text-2xl font-bold text-[#22C55E]">PKR {totalProfitIssued.toLocaleString()}</p>
          <span className="text-[11px] text-[#8996A8]">Partner margins</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-1">
          <span className="text-[#8996A8] block">Milestone Rewards Approved</span>
          <p className="text-2xl font-bold text-[#F59E0B]">PKR {totalRewardsApproved.toLocaleString()}</p>
          <span className="text-[11px] text-[#8996A8]">{pendingRewardsCount} pending</span>
        </div>
      </div>

      {/* Rank Distribution Snapshot */}
      <div className="p-5 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
          <h3 className="font-semibold text-sm text-white">Partner Rank Distribution</h3>
          <Link to="/admin/ranks" className="text-[#3B82F6] hover:underline">
            Manage Thresholds →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04]">
            <span className="text-[#8996A8] block text-[11px]">Unranked</span>
            <span className="text-xl font-bold text-white">{rankCounts.unranked}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04]">
            <span className="text-slate-300 block text-[11px]">Silver</span>
            <span className="text-xl font-bold text-white">{rankCounts.silver}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04]">
            <span className="text-blue-300 block text-[11px]">Platinum</span>
            <span className="text-xl font-bold text-white">{rankCounts.platinum}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04]">
            <span className="text-amber-300 block text-[11px]">Gold</span>
            <span className="text-xl font-bold text-white">{rankCounts.gold}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04]">
            <span className="text-purple-300 block text-[11px]">Diamond</span>
            <span className="text-xl font-bold text-white">{rankCounts.diamond}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

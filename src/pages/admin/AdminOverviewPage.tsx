import React from 'react';
import { storage } from '@/services/storage';
import { User, Sale, Reward } from '@/types';
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
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Management</span>
            <span>•</span>
            <span>Platform Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
            System Administration Overview
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Core operational metrics, commercial volume, and pending partner rewards.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link to="/admin/rewards">
            <Button variant="outline" size="sm" className="text-xs">
              Review Rewards ({pendingRewardsCount})
            </Button>
          </Link>
          <Link to="/admin/products">
            <Button variant="primary" size="sm" className="text-xs">
              + Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[#5B5C50] font-mono block">Total Registered Partners</span>
          <p className="text-2xl font-bold font-mono text-[#1E241F]">{users.length}</p>
          <span className="text-[11px] text-[#7C7D70] font-mono">Active accounts</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[#5B5C50] font-mono block">Wholesale Sales Volume</span>
          <p className="text-2xl font-bold font-mono text-[#1E241F]">PKR {totalSalesRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-[#7C7D70] font-mono">{sales.length} transactions</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[#5B5C50] font-mono block">Profit Margins Credited</span>
          <p className="text-2xl font-bold font-mono text-[#1F4D3E]">PKR {totalProfitIssued.toLocaleString()}</p>
          <span className="text-[11px] text-[#7C7D70] font-mono">Gross partner margins</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-[#5B5C50] font-mono block">Milestone Rewards Approved</span>
          <p className="text-2xl font-bold font-mono text-[#B8862E]">PKR {totalRewardsApproved.toLocaleString()}</p>
          <span className="text-[11px] text-[#7C7D70] font-mono">{pendingRewardsCount} pending review</span>
        </div>
      </div>

      {/* Rank Distribution Snapshot */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
          <h3 className="font-serif font-medium text-base text-[#1E241F]">Partner Rank Distribution</h3>
          <Link to="/admin/ranks" className="text-xs text-[#1F4D3E] hover:underline font-mono">
            Manage Thresholds →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#5B5C50] block text-[11px] font-mono">Unranked</span>
            <span className="text-xl font-bold font-mono text-[#1E241F]">{rankCounts.unranked}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#5B5C50] block text-[11px] font-mono">Level 01</span>
            <span className="text-xl font-bold font-mono text-[#1E241F]">{rankCounts.silver}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#5B5C50] block text-[11px] font-mono">Level 02</span>
            <span className="text-xl font-bold font-mono text-[#1E241F]">{rankCounts.platinum}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#5B5C50] block text-[11px] font-mono">Level 03</span>
            <span className="text-xl font-bold font-mono text-[#1E241F]">{rankCounts.gold}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#5B5C50] block text-[11px] font-mono">Level 04</span>
            <span className="text-xl font-bold font-mono text-[#B8862E]">{rankCounts.diamond}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

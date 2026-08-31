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
            <span>Executive Console</span>
            <span>•</span>
            <span>Platform Overview</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E241F]">
            Executive Business Dashboard
          </h1>
          <p className="text-xs text-[#5B5C50]">
            High-level operational overview of commercial sales, reseller profit distributions, and pending disbursements.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link to="/admin/rewards">
            <Button variant="outline" size="sm" className="text-xs">
              Payouts Queue ({pendingRewardsCount})
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
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#5B5C50] text-xs font-medium">Registered Partners</span>
            <span className="w-2 h-2 rounded-full bg-[#1F4D3E]"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-[#1E241F]">{users.length}</p>
          <span className="text-[11px] text-[#7C7D70]">Active platform members</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#5B5C50] text-xs font-medium">Total Orders Revenue</span>
            <span className="w-2 h-2 rounded-full bg-[#B8862E]"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-[#1E241F]">PKR {totalSalesRevenue.toLocaleString()}</p>
          <span className="text-[11px] text-[#7C7D70]">{sales.length} customer purchases</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#5B5C50] text-xs font-medium">Seller Profit Margins</span>
            <span className="w-2 h-2 rounded-full bg-[#1F4D3E]"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-[#1F4D3E]">PKR {totalProfitIssued.toLocaleString()}</p>
          <span className="text-[11px] text-[#7C7D70]">Earned by reseller partners</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#5B5C50] text-xs font-medium">Milestone Rank Bonuses</span>
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-[#B8862E]">PKR {totalRewardsApproved.toLocaleString()}</p>
          <span className="text-[11px] text-[#7C7D70]">{pendingRewardsCount} pending review</span>
        </div>
      </div>

      {/* Rank Distribution Snapshot */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
          <div>
            <h3 className="font-serif font-medium text-base text-[#1E241F]">Partner Rank Progression</h3>
            <p className="text-[11px] text-[#5B5C50]">Active distributors across rank milestone levels</p>
          </div>
          <Link to="/admin/ranks" className="text-xs text-[#1F4D3E] hover:underline font-medium">
            Manage Level Criteria →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#5B5C50] block text-xs font-medium">Unranked</span>
            <span className="text-2xl font-bold font-mono text-[#1E241F] mt-1 block">{rankCounts.unranked}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#1F4D3E] block text-xs font-semibold">Level 01 (Silver)</span>
            <span className="text-2xl font-bold font-mono text-[#1E241F] mt-1 block">{rankCounts.silver}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#1F4D3E] block text-xs font-semibold">Level 02 (Platinum)</span>
            <span className="text-2xl font-bold font-mono text-[#1E241F] mt-1 block">{rankCounts.platinum}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
            <span className="text-[#B8862E] block text-xs font-semibold">Level 03 (Gold)</span>
            <span className="text-2xl font-bold font-mono text-[#1E241F] mt-1 block">{rankCounts.gold}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8]">
            <span className="text-[#B8862E] block text-xs font-bold">Level 04 (Diamond)</span>
            <span className="text-2xl font-bold font-mono text-[#B8862E] mt-1 block">{rankCounts.diamond}</span>
          </div>
        </div>
      </div>

    </div>
  );
};

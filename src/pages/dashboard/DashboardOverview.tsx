import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { salesService } from '@/services/salesService';
import { referralService } from '@/services/referralService';
import { rewardService } from '@/services/rewardService';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Gift,
  Copy,
  Check,
  Package,
  TrendUp,
} from '@phosphor-icons/react';

export const DashboardOverview: React.FC = () => {
  const { user, rankProgress } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user || !rankProgress) return null;

  const totalSales = rankProgress.qualifyingSales;
  const totalCommunity = rankProgress.qualifyingCommunity;
  const totalProfit = salesService.getTotalProfitEarned(user.id);
  const totalRewards = rewardService.getTotalRewardsEarned(user.id);
  const recentSales = salesService.getUserSales(user.id).slice(0, 4);
  const featuredInventory = productService.getAllProducts().slice(0, 3);

  const referralUrl = referralService.getReferralUrl(user.referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Top Business Header & Controls */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Partner Operations</span>
            <span>•</span>
            <span className="text-[#1F4D3E] font-bold">{user.referralCode}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F] tracking-tight">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Current Level: <span className="text-[#1E241F] font-semibold capitalize">{rankProgress.currentRank.name}</span>
            {rankProgress.nextRank && (
              <>
                {' '}• Next Milestone: <span className="text-[#1F4D3E] font-medium">{rankProgress.nextRank.name} (+PKR {rankProgress.nextRank.rewardAmount.toLocaleString()})</span>
              </>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/dashboard/products">
            <Button variant="primary" size="sm" iconLeft={<ShoppingCart size={14} />}>
              Record Client Sale
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-[#1F4D3E]" /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied' : 'Share Referral Code'}</span>
          </Button>
        </div>
      </div>

      {/* 2. Four Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Qualifying Product Sales */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Qualifying Sales</span>
            <ShoppingCart size={16} className="text-[#1F4D3E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E241F] font-mono">{totalSales}</p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Delivered Product Orders</p>
          </div>
        </div>

        {/* Metric 2: Estimated Direct Gross Margin */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Estimated Direct Margin</span>
            <TrendUp size={16} className="text-[#B8862E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#B8862E] font-mono">
              PKR {totalProfit.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Gross Product Margin</p>
          </div>
        </div>

        {/* Metric 3: Community Referral Network */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Partner Network</span>
            <Users size={16} className="text-[#1F4D3E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E241F] font-mono">{totalCommunity}</p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Verified Active Partners</p>
          </div>
        </div>

        {/* Metric 4: Milestone Rewards Earned */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Milestone Bonuses</span>
            <Gift size={16} className="text-[#B8862E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E241F] font-mono">
              PKR {totalRewards.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Level Bonuses Disbursed</p>
          </div>
        </div>

      </div>

      {/* 3. Progress to Next Rank Milestone Gauge */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3DCC8]">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#1E241F]">
              {rankProgress.nextRank ? `Milestone Progress: ${rankProgress.nextRank.name}` : 'Level 04 Pinnacle Completed'}
            </h3>
            <p className="text-xs text-[#5B5C50]">
              Dual volume requirements across product sales and community members.
            </p>
          </div>
          {rankProgress.nextRank && (
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#F1ECDD] text-[#B8862E] border border-[#E3DCC8]">
              Reward Bonus: PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}
            </span>
          )}
        </div>

        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition 1: Product Sales */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-medium">Personal Product Sales</span>
                <span className="text-[#1E241F] font-mono font-bold">
                  {totalSales} / {rankProgress.nextRank.requiredSales} units
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3DCC8] overflow-hidden">
                <div
                  className="h-full bg-[#1F4D3E] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.salesProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#5B5C50] font-mono">
                <span>{rankProgress.salesProgressPercent}% qualified</span>
                <span>{rankProgress.missingSales > 0 ? `${rankProgress.missingSales} sales to go` : 'Target Met'}</span>
              </div>
            </div>

            {/* Condition 2: Community Referrals */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-medium">Community Partners</span>
                <span className="text-[#1E241F] font-mono font-bold">
                  {totalCommunity} / {rankProgress.nextRank.requiredCommunity} members
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3DCC8] overflow-hidden">
                <div
                  className="h-full bg-[#1F4D3E] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.communityProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#5B5C50] font-mono">
                <span>{rankProgress.communityProgressPercent}% qualified</span>
                <span>{rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} members to go` : 'Target Met'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs text-[#1F4D3E]">
            Congratulations! You have achieved the highest rank in the DreamToAchievers network.
          </div>
        )}
      </div>

      {/* 4. Two-Column Dashboard Split: Recent Sales Ledger + High-Margin Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Recent Customer Sales */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
            <h3 className="font-serif font-medium text-base text-[#1E241F]">Recent Customer Sales</h3>
            <Link to="/dashboard/sales" className="text-xs text-[#1F4D3E] hover:underline font-mono">
              View All Orders →
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-xs text-[#5B5C50]">
              <Package size={28} className="text-[#7C7D70] mx-auto" />
              <p>No customer sales recorded yet.</p>
              <Link to="/dashboard/products">
                <Button variant="outline" size="sm" className="text-xs mt-2">
                  Browse Inventory to Sell
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate">
                    <p className="font-medium text-[#1E241F] truncate">{sale.productName}</p>
                    <p className="text-[10px] text-[#5B5C50] font-mono">
                      Client: {sale.customerName} • {sale.quantity} unit(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-semibold text-[#B8862E] block">
                      +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                    </span>
                    <span className="text-[9.5px] font-mono text-[#7C7D70]">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Top Inventory Margin Opportunities */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
            <h3 className="font-serif font-medium text-base text-[#1E241F]">High-Margin Products</h3>
            <Link to="/dashboard/products" className="text-xs text-[#1F4D3E] hover:underline font-mono">
              Full Catalog →
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {featuredInventory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-white border border-[#E3DCC8] shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-medium text-[#1E241F] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#5B5C50] font-mono">Cost: PKR {item.partnerPrice}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#B8862E] font-mono font-semibold block">
                    +{item.grossMargin}
                  </span>
                  <span className="text-[9.5px] text-[#7C7D70] font-mono">Margin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

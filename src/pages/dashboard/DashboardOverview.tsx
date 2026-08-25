import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { salesService } from '@/services/salesService';
import { referralService } from '@/services/referralService';
import { rewardService } from '@/services/rewardService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Gift,
  Coins,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
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

  const referralUrl = referralService.getReferralUrl(user.referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header / Greeting (Clean Business Header) */}
      <div className="p-6 rounded-2xl bg-[#0D141F] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#8996A8]">Partner Dashboard</span>
            <span className="text-[#8996A8]">•</span>
            <span className="text-xs font-mono text-[#8996A8]">{user.referralCode}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-[#CBD5E1]">
            Current Rank: <span className="text-white font-semibold capitalize">{rankProgress.currentRank.name}</span>
            {rankProgress.nextRank && (
              <>
                {' '}• Target Milestone: <span className="text-[#60A5FA] font-medium">{rankProgress.nextRank.name}</span>
              </>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/dashboard/products">
            <Button variant="primary" size="sm" iconLeft={<ShoppingCart size={15} />}>
              Record Sale
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied' : 'Share Referral'}</span>
          </Button>
        </div>
      </div>

      {/* 4 Equal Metric Stat Cards (Step 13, 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Qualifying Sales */}
        <div className="p-5 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8996A8]">Qualifying Sales</span>
            <ShoppingCart size={16} className="text-[#8996A8]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalSales}</p>
            <p className="text-xs text-[#8996A8] mt-0.5">Confirmed Product Orders</p>
          </div>
        </div>

        {/* Card 2: Community Team */}
        <div className="p-5 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8996A8]">Community Team</span>
            <Users size={16} className="text-[#8996A8]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalCommunity}</p>
            <p className="text-xs text-[#8996A8] mt-0.5">Verified Members</p>
          </div>
        </div>

        {/* Card 3: Direct Sales Margins */}
        <div className="p-5 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8996A8]">Sales Margin</span>
            <Coins size={16} className="text-[#8996A8]" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${totalProfit > 0 ? 'text-[#22C55E]' : 'text-white'}`}>
              PKR {totalProfit.toLocaleString()}
            </p>
            <p className="text-xs text-[#8996A8] mt-0.5">Gross Product Margin</p>
          </div>
        </div>

        {/* Card 4: Milestone Rewards */}
        <div className="p-5 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8996A8]">Milestone Rewards</span>
            <Gift size={16} className="text-[#8996A8]" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${totalRewards > 0 ? 'text-[#F59E0B]' : 'text-white'}`}>
              PKR {totalRewards.toLocaleString()}
            </p>
            <p className="text-xs text-[#8996A8] mt-0.5">Rank Rewards Earned</p>
          </div>
        </div>
      </div>

      {/* Progress to Next Rank Section (Step 17) */}
      <div className="p-6 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-base font-semibold text-white">
              {rankProgress.nextRank ? `Progress to ${rankProgress.nextRank.name}` : 'Diamond Rank Completed'}
            </h3>
            <p className="text-xs text-[#8996A8]">
              Complete both requirements to qualify for the next milestone reward.
            </p>
          </div>
          {rankProgress.nextRank && (
            <span className="text-xs font-medium px-2.5 py-1 rounded bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20">
              Reward: PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}
            </span>
          )}
        </div>

        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Condition 1: Product Sales */}
            <div className="p-4 rounded-xl bg-[#0D141F] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#CBD5E1] font-medium">Product Sales</span>
                <span className="text-white font-semibold">
                  {totalSales} / {rankProgress.nextRank.requiredSales} units
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#3B82F6] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.salesProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8996A8]">
                <span>{rankProgress.salesProgressPercent}% completed</span>
                <span>
                  {rankProgress.missingSales > 0 ? `${rankProgress.missingSales} sales remaining` : 'Complete'}
                </span>
              </div>
            </div>

            {/* Condition 2: Community Members */}
            <div className="p-4 rounded-xl bg-[#0D141F] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#CBD5E1] font-medium">Community Members</span>
                <span className="text-white font-semibold">
                  {totalCommunity} / {rankProgress.nextRank.requiredCommunity} members
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#3B82F6] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.communityProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8996A8]">
                <span>{rankProgress.communityProgressPercent}% completed</span>
                <span>
                  {rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} members remaining` : 'Complete'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
            <CheckCircle size={24} className="text-purple-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Diamond Rank Mastery</p>
            <p className="text-xs text-[#CBD5E1]">You have reached the highest canonical rank tier in Dream to Achievers.</p>
          </div>
        )}
      </div>

      {/* Bottom Grid: Recent Sales & Referral Link Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 Cols): Recent Sales Activity */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <h4 className="text-sm font-semibold text-white">Recent Sales Activity</h4>
            <Link to="/dashboard/sales" className="text-xs text-[#3B82F6] hover:underline">
              View All
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8996A8] space-y-2">
              <p>No qualifying sales recorded yet.</p>
              <Link to="/dashboard/products">
                <Button variant="secondary" size="sm">
                  Record First Sale
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="text-white font-medium">{sale.productName}</p>
                    <p className="text-[11px] text-[#8996A8]">{new Date(sale.createdAt).toLocaleDateString()} • {sale.customerName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#22C55E] font-semibold">+PKR {(sale.profitMargin * sale.quantity).toLocaleString()}</span>
                    <span className="text-[10px] text-[#8996A8] block">Margin</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (5 Cols): Unique Referral Sharing Box */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#111A27] border border-white/[0.08] space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
            <h4 className="text-sm font-semibold text-white">Your Referral Link</h4>
            <span className="text-xs font-mono text-[#60A5FA] bg-[#3B82F6]/10 px-2 py-0.5 rounded">
              {user.referralCode}
            </span>
          </div>

          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Invite partners to join your community. Every verified partner contributes toward your next rank tier.
          </p>

          <div className="p-2.5 rounded-lg bg-[#0D141F] border border-white/[0.06] font-mono text-xs text-[#CBD5E1] break-all select-all">
            {referralUrl}
          </div>

          <Button variant="primary" size="sm" className="w-full justify-center" onClick={handleCopy}>
            {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            <span>{copied ? 'Link Copied' : 'Copy Referral URL'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

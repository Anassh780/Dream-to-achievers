import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { salesService } from '@/services/salesService';
import { referralService } from '@/services/referralService';
import { rewardService } from '@/services/rewardService';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/Button';
import { OnboardingModal } from '@/components/modals/OnboardingModal';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Gift,
  Copy,
  Check,
  Package,
  TrendUp,
  WhatsappLogo,
  ShareNetwork,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Sparkle,
  Question,
  CurrencyDollar,
  CaretRight,
  CheckCircle,
} from '@phosphor-icons/react';

export const DashboardOverview: React.FC = () => {
  const { user, rankProgress } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (!user) return false;
    return !localStorage.getItem(`dta_onboarding_dismissed_${user.id}`);
  });

  if (!user || !rankProgress) return null;

  const totalSales = rankProgress.qualifyingSales;
  const totalCommunity = rankProgress.qualifyingCommunity;
  const totalProfit = salesService.getTotalProfitEarned(user.id);
  const availableProfit = salesService.getAvailableProfitBalance(user.id);
  const pendingProfit = salesService.getPendingProfit(user.id);
  const totalRewards = rewardService.getTotalRewardsEarned(user.id);
  const recentSales = salesService.getUserSales(user.id).slice(0, 5);
  const featuredInventory = productService.getAllProducts().slice(0, 4);

  const referralUrl = referralService.getReferralUrl(user.referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const shareMessage = `🌟 *Join Dream to Achievers Wholesale Network!*\n\nStart your verified e-commerce reselling business, source products at wholesale pricing, and earn direct profit margins on every sale + milestone cash rewards!\n\n👉 *Register with my Referral Link:* ${referralUrl}\n🔑 *Referral Code:* ${user.referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      {/* Onboarding Welcome Pop-Up (Only shows for newly registered users) */}
      <OnboardingModal
        userId={user.id}
        userName={user.fullName}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      {/* 1. Top Executive Partner Header */}
      <div className="funding-card p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-[radial-gradient(circle,rgba(52,211,153,0.1),transparent_70%)] blur-2xl" />
        
        <div className="space-y-1.5 min-w-0 z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="funding-ghost-pill px-3 py-1 text-xs font-mono text-[#34D399] border-[#34D399]/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
              <ShieldCheck size={14} weight="fill" /> Verified Partner
            </span>
            <span className="text-[#9EABA2]">•</span>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[#D9C08A] font-mono text-xs border border-white/10">
              Code: {user.referralCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight truncate">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-[#9EABA2]">
            Current Level: <strong className="text-[#F4F7F5] capitalize">{rankProgress.currentRank.name}</strong>
            {rankProgress.nextRank && (
              <>
                {' '}• Next Target: <strong className="text-[#34D399]">{rankProgress.nextRank.name} (+PKR {rankProgress.nextRank.rewardAmount.toLocaleString()})</strong>
              </>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 z-10">
          <button
            onClick={() => setShowOnboarding(true)}
            className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#F4F7F5] inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial cursor-pointer hover:border-white/20 transition-all"
            title="View beginner earning guide"
          >
            <Sparkle size={15} className="text-[#D9C08A]" weight="fill" />
            <span>How It Works</span>
          </button>
          <Link to="/dashboard/sales" className="flex-1 sm:flex-initial">
            <button className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#D9C08A] hover:border-[#D9C08A]/40 w-full inline-flex items-center justify-center cursor-pointer transition-all">
              Withdraw Profits
            </button>
          </Link>
          <Link to="/dashboard/products" className="flex-1 sm:flex-initial">
            <button className="funding-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider w-full inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer">
              <ShoppingCart size={14} weight="bold" />
              <span>Record Sale</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Four Master Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Qualifying Delivered Sales */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9EABA2] font-mono font-medium">Delivered Sales</span>
            <div className="w-9 h-9 rounded-xl bg-[#34D399]/10 text-[#34D399] flex items-center justify-center border border-[#34D399]/25 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              <ShoppingCart size={18} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#F4F7F5] font-mono tracking-tight">{totalSales}</p>
            <p className="text-[11px] text-[#9EABA2] font-mono mt-0.5">Delivered Client Orders</p>
          </div>
        </div>

        {/* KPI 2: Available Profit Margin */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group border-[#34D399]/20 hover:border-[#34D399]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#34D399] font-mono font-bold">Available Profit</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#34D399]/20 to-[#34D399]/5 text-[#34D399] flex items-center justify-center border border-[#34D399]/30 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
              <TrendUp size={18} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#34D399] font-mono tracking-tight">
              PKR {availableProfit.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#9EABA2] font-mono mt-0.5">
              +PKR {pendingProfit.toLocaleString()} in transit
            </p>
          </div>
        </div>

        {/* KPI 3: Community Referral Network */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9EABA2] font-mono font-medium">Partner Downline</span>
            <div className="w-9 h-9 rounded-xl bg-[#D9C08A]/10 text-[#D9C08A] flex items-center justify-center border border-[#D9C08A]/25 shadow-[0_0_15px_rgba(217,192,138,0.15)]">
              <Users size={18} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#F4F7F5] font-mono tracking-tight">{totalCommunity}</p>
            <p className="text-[11px] text-[#9EABA2] font-mono mt-0.5">Active Referred Partners</p>
          </div>
        </div>

        {/* KPI 4: Milestone Rewards Claimed */}
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-3 relative overflow-hidden group border-[#D9C08A]/20 hover:border-[#D9C08A]/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#D9C08A] font-mono font-bold">Milestone Rewards</span>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9C08A]/20 to-[#D9C08A]/5 text-[#D9C08A] flex items-center justify-center border border-[#D9C08A]/30 shadow-[0_0_20px_rgba(217,192,138,0.2)]">
              <Gift size={18} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#D9C08A] font-mono tracking-tight">
              PKR {totalRewards.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#9EABA2] font-mono mt-0.5">Cash Bonuses Disbursed</p>
          </div>
        </div>

      </div>

      {/* 3. 1-Click Referral Invitation & WhatsApp Sharing Hub */}
      <div className="funding-card p-6 sm:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center space-x-4 min-w-0 z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6EE7A8] to-[#2FA46B] text-[#070B09] flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
            <ShareNetwork size={24} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="font-serif font-bold text-base sm:text-lg text-[#F4F7F5] truncate">
              Grow Your Partner Network &amp; Earn Milestone Cash
            </p>
            <p className="text-xs text-[#9EABA2] mt-0.5 truncate">
              Share your link with prospective resellers to unlock rank upgrades and level bonuses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 z-10">
          <button
            onClick={handleWhatsAppShare}
            className="funding-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md cursor-pointer flex-1 sm:flex-initial"
            title="Share referral link on WhatsApp"
          >
            <WhatsappLogo size={18} weight="fill" />
            <span>WhatsApp Invite</span>
          </button>
          <button
            onClick={handleCopy}
            className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#F4F7F5] inline-flex items-center justify-center gap-1.5 cursor-pointer hover:border-white/20 transition-all flex-1 sm:flex-initial"
            title="Copy referral link"
          >
            {copied ? <Check size={16} className="text-[#34D399]" /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* 4. Milestone Rank Roadmap Gauge */}
      <div className="funding-card p-6 sm:p-7 space-y-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#F4F7F5]">
              {rankProgress.nextRank ? `Milestone Progress: ${rankProgress.nextRank.name}` : 'Highest Milestone Achieved'}
            </h2>
            <p className="text-xs text-[#9EABA2]">
              Dual volume qualifications required across personal product sales and community members.
            </p>
          </div>
          {rankProgress.nextRank && (
            <span className="funding-ghost-pill px-3.5 py-1.5 text-xs font-mono font-bold text-[#D9C08A] border-[#D9C08A]/30 self-start sm:self-auto">
              Bonus On Reach: +PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}
            </span>
          )}
        </div>

        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition 1: Product Sales */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F4F7F5] font-semibold">1. Personal Delivered Sales</span>
                <span className="text-[#F4F7F5] font-mono font-bold">
                  {totalSales} / {rankProgress.nextRank.requiredSales} units
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6EE7A8] to-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all duration-300"
                  style={{ width: `${rankProgress.salesProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#9EABA2] font-mono">
                <span>{rankProgress.salesProgressPercent}% achieved</span>
                <span className="font-semibold text-[#34D399]">{rankProgress.missingSales > 0 ? `${rankProgress.missingSales} sales to unlock` : '✅ Goal Met'}</span>
              </div>
            </div>

            {/* Condition 2: Community Referrals */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F4F7F5] font-semibold">2. Active Referred Partners</span>
                <span className="text-[#F4F7F5] font-mono font-bold">
                  {totalCommunity} / {rankProgress.nextRank.requiredCommunity} members
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6EE7A8] to-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all duration-300"
                  style={{ width: `${rankProgress.communityProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#9EABA2] font-mono">
                <span>{rankProgress.communityProgressPercent}% achieved</span>
                <span className="font-semibold text-[#34D399]">{rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} partners to unlock` : '✅ Goal Met'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#34D399]/30 text-xs font-semibold text-[#34D399]">
            🎉 Congratulations! You have achieved the highest rank in the DreamToAchievers network.
          </div>
        )}
      </div>

      {/* 5. Two-Column Dashboard Split: Recent Orders + High-Margin Wholesale Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Recent Customer Orders */}
        <div className="lg:col-span-7 funding-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <h3 className="font-serif font-bold text-base text-[#F4F7F5]">Recent Customer Orders</h3>
            <Link to="/dashboard/sales" className="text-xs text-[#34D399] hover:underline font-semibold flex items-center gap-1">
              <span>View All</span>
              <CaretRight size={12} weight="bold" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-8 text-center space-y-2.5 text-xs text-[#9EABA2]">
              <Package size={32} className="text-[#9EABA2]/60 mx-auto" />
              <p className="font-semibold text-sm text-[#F4F7F5]">No customer sales recorded yet.</p>
              <p className="text-[11px] text-[#9EABA2]">Select a product from the wholesale catalog to record your first client sale.</p>
              <Link to="/dashboard/products" className="inline-block pt-1">
                <button className="funding-sheen-btn px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer">
                  Browse Wholesale Catalog
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:border-[#34D399]/30 hover:bg-white/[0.04] transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-[#F4F7F5] truncate">{sale.productName}</p>
                    <p className="text-[11px] text-[#9EABA2] font-mono truncate">
                      Client: {sale.customerName} • {sale.quantity} unit(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#34D399] block text-xs sm:text-sm">
                      +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-[#9EABA2]">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Top High-Margin Inventory */}
        <div className="lg:col-span-5 funding-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <h3 className="font-serif font-bold text-base text-[#F4F7F5]">Top Wholesale Margins</h3>
            <Link to="/dashboard/products" className="text-xs text-[#34D399] hover:underline font-semibold flex items-center gap-1">
              <span>Full Catalog</span>
              <CaretRight size={12} weight="bold" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {featuredInventory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2.5 hover:border-[#D9C08A]/30 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center space-x-2.5 truncate min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover bg-white/[0.04] border border-white/10 shrink-0"
                  />
                  <div className="truncate min-w-0">
                    <p className="font-bold text-[#F4F7F5] truncate">{item.name}</p>
                    <p className="text-[10.5px] text-[#9EABA2] font-mono">Wholesale: PKR {item.partnerPrice}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#D9C08A] font-mono font-bold block text-xs">
                    +PKR {item.grossMargin}
                  </span>
                  <span className="text-[10px] text-[#9EABA2] font-mono">Your Profit</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;

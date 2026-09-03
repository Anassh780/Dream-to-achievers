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
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E3DCC8] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              <ShieldCheck size={14} weight="fill" /> Verified Partner
            </span>
            <span className="text-[#5B5C50]">•</span>
            <span className="text-[#1F4D3E] font-bold bg-[#FAF7EF] px-2.5 py-0.5 rounded-md border border-[#E3DCC8]">
              Code: {user.referralCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E241F] tracking-tight truncate">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Current Level: <strong className="text-[#1E241F] capitalize">{rankProgress.currentRank.name}</strong>
            {rankProgress.nextRank && (
              <>
                {' '}• Next Target: <strong className="text-[#1F4D3E]">{rankProgress.nextRank.name} (+PKR {rankProgress.nextRank.rewardAmount.toLocaleString()})</strong>
              </>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] text-xs font-semibold text-[#1E241F] transition-colors cursor-pointer"
            title="View beginner earning guide"
          >
            <Sparkle size={15} className="text-[#B8862E]" weight="fill" />
            <span>How It Works</span>
          </button>
          <Link to="/dashboard/sales" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold py-2.5">
              Withdraw Profits
            </Button>
          </Link>
          <Link to="/dashboard/products" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="sm" className="w-full text-xs font-semibold py-2.5" iconLeft={<ShoppingCart size={15} />}>
              Record Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Four Master Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Qualifying Delivered Sales */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] hover:border-[#1F4D3E]/40 transition-all space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono font-medium">Delivered Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/50">
              <ShoppingCart size={17} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#1E241F] font-mono tracking-tight">{totalSales}</p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Delivered Client Orders</p>
          </div>
        </div>

        {/* KPI 2: Available Profit Margin */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] hover:border-[#1F4D3E]/40 transition-all space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-900 font-mono font-bold">Available Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200/50">
              <TrendUp size={17} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-900 font-mono tracking-tight">
              PKR {availableProfit.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">
              +PKR {pendingProfit.toLocaleString()} in transit
            </p>
          </div>
        </div>

        {/* KPI 3: Community Referral Network */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] hover:border-[#1F4D3E]/40 transition-all space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono font-medium">Partner Downline</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200/50">
              <Users size={17} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#1E241F] font-mono tracking-tight">{totalCommunity}</p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Active Referred Partners</p>
          </div>
        </div>

        {/* KPI 4: Milestone Rewards Claimed */}
        <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] hover:border-[#1F4D3E]/40 transition-all space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono font-medium">Milestone Rewards</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/50">
              <Gift size={17} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#1E241F] font-mono tracking-tight">
              PKR {totalRewards.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Cash Bonuses Disbursed</p>
          </div>
        </div>

      </div>

      {/* 3. 1-Click Referral Invitation & WhatsApp Sharing Hub */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF7EF] dark:bg-[#141C18] border border-[#E3DCC8] dark:border-[#24352B] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#1F4D3E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShareNetwork size={24} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm sm:text-base text-[#1E241F] dark:text-[#F4F3EE] truncate">
              Grow Your Partner Network &amp; Earn Milestone Cash
            </p>
            <p className="text-xs text-[#5B5C50] dark:text-[#A2B1A8] mt-0.5 truncate">
              Share your link with prospective resellers to unlock rank upgrades and level bonuses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            title="Share referral link on WhatsApp"
          >
            <WhatsappLogo size={18} weight="fill" />
            <span>WhatsApp Invite</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1B2620] hover:bg-[#FAF7EF] dark:hover:bg-[#141C18] border border-[#E3DCC8] dark:border-[#24352B] text-[#1E241F] dark:text-[#F4F3EE] font-semibold text-xs transition-colors cursor-pointer"
            title="Copy referral link"
          >
            {copied ? <Check size={16} className="text-[#1F4D3E] dark:text-[#4ADE80]" /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* 4. Milestone Rank Roadmap Gauge */}
      <div className="p-6 rounded-3xl bg-white border border-[#E3DCC8] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#E3DCC8]">
          <div>
            <h2 className="text-lg font-bold text-[#1E241F]">
              {rankProgress.nextRank ? `Milestone Progress: ${rankProgress.nextRank.name}` : 'Highest Milestone Achieved'}
            </h2>
            <p className="text-xs text-[#5B5C50]">
              Dual volume qualifications required across personal product sales and community members.
            </p>
          </div>
          {rankProgress.nextRank && (
            <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-[#F1ECDD] text-[#B8862E] border border-[#E3DCC8] self-start sm:self-auto">
              Bonus On Reach: +PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}
            </span>
          )}
        </div>

        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition 1: Product Sales */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-bold">1. Personal Delivered Sales</span>
                <span className="text-[#1E241F] font-mono font-bold">
                  {totalSales} / {rankProgress.nextRank.requiredSales} units
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E3DCC8] overflow-hidden">
                <div
                  className="h-full bg-[#1F4D3E] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.salesProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#5B5C50] font-mono">
                <span>{rankProgress.salesProgressPercent}% achieved</span>
                <span className="font-semibold">{rankProgress.missingSales > 0 ? `${rankProgress.missingSales} sales to unlock` : '✅ Goal Met'}</span>
              </div>
            </div>

            {/* Condition 2: Community Referrals */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-bold">2. Active Referred Partners</span>
                <span className="text-[#1E241F] font-mono font-bold">
                  {totalCommunity} / {rankProgress.nextRank.requiredCommunity} members
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E3DCC8] overflow-hidden">
                <div
                  className="h-full bg-[#1F4D3E] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.communityProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#5B5C50] font-mono">
                <span>{rankProgress.communityProgressPercent}% achieved</span>
                <span className="font-semibold">{rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} partners to unlock` : '✅ Goal Met'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs font-semibold text-[#1F4D3E]">
            🎉 Congratulations! You have achieved the highest rank in the DreamToAchievers network.
          </div>
        )}
      </div>

      {/* 5. Two-Column Dashboard Split: Recent Orders + High-Margin Wholesale Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Recent Customer Orders */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E3DCC8]">
            <h3 className="font-bold text-base text-[#1E241F]">Recent Customer Orders</h3>
            <Link to="/dashboard/sales" className="text-xs text-[#1F4D3E] hover:underline font-semibold flex items-center gap-1">
              <span>View All</span>
              <CaretRight size={12} weight="bold" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-8 text-center space-y-2.5 text-xs text-[#5B5C50]">
              <Package size={32} className="text-[#7C7D70] mx-auto" />
              <p className="font-semibold text-sm text-[#1E241F]">No customer sales recorded yet.</p>
              <p className="text-[11px] text-[#7C7D70]">Select a product from the wholesale catalog to record your first client sale.</p>
              <Link to="/dashboard/products" className="inline-block pt-1">
                <Button variant="primary" size="sm" className="text-xs">
                  Browse Wholesale Catalog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between gap-3 hover:border-[#1F4D3E]/40 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-[#1E241F] truncate">{sale.productName}</p>
                    <p className="text-[11px] text-[#5B5C50] font-mono truncate">
                      Client: {sale.customerName} • {sale.quantity} unit(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-emerald-800 block text-xs sm:text-sm">
                      +PKR {(sale.profitMargin * sale.quantity).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-[#7C7D70]">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Top High-Margin Inventory */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E3DCC8]">
            <h3 className="font-bold text-base text-[#1E241F]">Top Wholesale Margins</h3>
            <Link to="/dashboard/products" className="text-xs text-[#1F4D3E] hover:underline font-semibold flex items-center gap-1">
              <span>Full Catalog</span>
              <CaretRight size={12} weight="bold" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {featuredInventory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between gap-2.5 hover:border-[#1F4D3E]/40 transition-colors"
              >
                <div className="flex items-center space-x-2.5 truncate min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover bg-white border border-[#E3DCC8] shrink-0"
                  />
                  <div className="truncate min-w-0">
                    <p className="font-bold text-[#1E241F] truncate">{item.name}</p>
                    <p className="text-[10.5px] text-[#5B5C50] font-mono">Wholesale: PKR {item.partnerPrice}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#B8862E] font-mono font-bold block text-xs">
                    +PKR {item.grossMargin}
                  </span>
                  <span className="text-[10px] text-[#7C7D70] font-mono">Your Profit</span>
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

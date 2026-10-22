import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isUserAdminOrSuperAdmin } from '@/services/authService';
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
  CaretDown,
  CaretUp,
  CheckCircle,
  Info,
  LightbulbFilament,
  Certificate,
  Truck,
} from '@phosphor-icons/react';

export const DashboardOverview: React.FC = () => {
  const { user, rankProgress } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (!user) return false;
    return !localStorage.getItem(`dta_onboarding_dismissed_${user.id}`);
  });
  const [showQuickstart, setShowQuickstart] = useState<boolean>(() => {
    if (!user) return true;
    const stored = localStorage.getItem(`dta_quickstart_minimized_${user.id}`);
    if (stored !== null) return stored !== 'true';
    if (typeof window !== 'undefined' && window.innerWidth < 768) return false;
    return true;
  });

  const toggleQuickstart = () => {
    setShowQuickstart((prev) => {
      const next = !prev;
      if (user) {
        localStorage.setItem(`dta_quickstart_minimized_${user.id}`, String(!next));
      }
      return next;
    });
  };

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
    <div className="space-y-5 sm:space-y-6 font-sans max-w-7xl">
      {/* Onboarding Welcome Pop-Up (Only shows for newly registered users) */}
      <OnboardingModal
        userId={user.id}
        userName={user.fullName}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      
      {/* 1. Top Executive Partner Header */}
      <div className="funding-card p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0 z-10">
          <Link to="/dashboard/products" className="flex-1 sm:flex-initial">
            <button className="funding-sheen-btn px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider w-full inline-flex items-center justify-center gap-1.5 shadow-md cursor-pointer min-h-[44px]">
              <ShoppingCart size={15} weight="bold" />
              <span>Record Sale</span>
            </button>
          </Link>
          <Link to="/dashboard/sales" className="flex-1 sm:flex-initial">
            <button className="funding-ghost-pill px-3.5 sm:px-4 py-2.5 text-xs font-medium text-[#D9C08A] hover:border-[#D9C08A]/40 w-full inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[44px]">
              <Wallet size={15} className="text-[#D9C08A]" />
              <span>Withdraw Profits</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Google-Style Reseller Quickstart Roadmap (Beginner-Friendly Interaction) */}
      <div className="funding-card p-4 sm:p-5 lg:p-6 space-y-4 relative overflow-hidden border-[#34D399]/20 bg-gradient-to-b from-[#34D399]/[0.03] to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#34D399] shrink-0 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
              <LightbulbFilament size={20} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#F4F7F5]">
                  How to Earn with Dream to Achievers
                </h2>
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Beginner Guide
                </span>
              </div>
              <p className="text-xs text-[#9EABA2]">
                Zero investment required. Source wholesale SKUs, take client orders with COD, and withdraw direct profit.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleQuickstart}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#9EABA2] hover:text-[#F4F7F5] border border-white/10 transition-colors cursor-pointer min-h-[38px]"
          >
            {showQuickstart ? (
              <>
                <span>Minimize</span>
                <CaretUp size={13} weight="bold" />
              </>
            ) : (
              <>
                <span>View 4 Steps</span>
                <CaretDown size={13} weight="bold" />
              </>
            )}
          </button>
        </div>

        {showQuickstart && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 animate-in fade-in duration-300">
            {/* Step 1 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070B09]/70 border border-white/[0.07] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Step 01
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Package size={17} weight="duotone" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#F4F7F5]">
                  Select Products
                </h3>
                <p className="text-xs text-[#9EABA2] leading-relaxed">
                  Browse wholesale items offering <strong className="text-[#34D399]">PKR 500 – 1,500+</strong> profit margin per unit.
                </p>
              </div>
              <Link
                to="/dashboard/products"
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#34D399] group-hover:underline pt-1 min-h-[36px]"
              >
                <span>Browse Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070B09]/70 border border-white/[0.07] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Step 02
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <WhatsappLogo size={17} weight="fill" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#F4F7F5]">
                  Share with Buyers
                </h3>
                <p className="text-xs text-[#9EABA2] leading-relaxed">
                  Share product photos with your contacts on WhatsApp, Facebook, or Instagram to collect orders.
                </p>
              </div>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#34D399] group-hover:underline pt-1 cursor-pointer text-left min-h-[36px]"
              >
                <span>Share Referral &amp; Deals</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070B09]/70 border border-white/[0.07] hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-3 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                    Step 03
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Truck size={17} weight="duotone" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#F4F7F5]">
                  Track Client Orders
                </h3>
                <p className="text-xs text-[#9EABA2] leading-relaxed">
                  Enter buyer address. We dispatch COD across Pakistan while you track delivery &amp; courier status.
                </p>
              </div>
              <Link
                to="/dashboard/sales"
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-sky-400 group-hover:underline pt-1 min-h-[36px]"
              >
                <span>Live Orders Tracker</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070B09]/70 border border-white/[0.07] hover:border-[#D9C08A]/40 transition-all flex flex-col justify-between space-y-3 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D9C08A]/10 text-[#D9C08A] font-bold border border-[#D9C08A]/20">
                    Step 04
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#D9C08A]/10 text-[#D9C08A] flex items-center justify-center">
                    <Wallet size={17} weight="duotone" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#F4F7F5]">
                  Receive Profits
                </h3>
                <p className="text-xs text-[#9EABA2] leading-relaxed">
                  Upon parcel delivery, your margin is credited. Withdraw directly to <strong className="text-[#F4F7F5]">JazzCash, EasyPaisa, or Bank</strong>.
                </p>
              </div>
              <Link
                to="/dashboard/profile"
                className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#D9C08A] group-hover:underline pt-1 min-h-[36px]"
              >
                <span>Add Payout Account</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Four Master Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Qualifying Delivered Sales */}
        <div className="funding-stat-kpi p-4 sm:p-5 space-y-2.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#9EABA2] font-mono font-medium">Delivered Sales</span>
              <span className="cursor-help text-[#9EABA2]/60 hover:text-[#34D399] transition-colors" title="Delivered customer orders that have earned profit">
                <Info size={13} />
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#34D399]/10 text-[#34D399] flex items-center justify-center border border-[#34D399]/25 shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              <ShoppingCart size={18} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#F4F7F5] font-mono tracking-tight">{totalSales}</p>
            <p className="text-[11px] text-[#9EABA2] font-mono mt-0.5">Completed Client Orders</p>
          </div>
        </div>

        {/* KPI 2: Available Profit Margin */}
        <div className="funding-stat-kpi p-4 sm:p-5 space-y-2.5 relative overflow-hidden group border-[#34D399]/20 hover:border-[#34D399]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#34D399] font-mono font-bold">Available Profit</span>
              <span className="cursor-help text-[#34D399]/60 hover:text-[#34D399] transition-colors" title="Cash profit ready for direct withdrawal to your bank or mobile wallet">
                <Info size={13} />
              </span>
            </div>
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
        <div className="funding-stat-kpi p-4 sm:p-5 space-y-2.5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#9EABA2] font-mono font-medium">Partner Downline</span>
              <span className="cursor-help text-[#9EABA2]/60 hover:text-[#D9C08A] transition-colors" title="Affiliate partners registered using your referral code">
                <Info size={13} />
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#D9C08A]/10 text-[#D9C08A] flex items-center justify-center border border-[#D9C08A]/25 shadow-[0_0_15px_rgba(217,192,138,0.15)]">
              <Users size={18} weight="bold" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-[#F4F7F5] font-mono tracking-tight">{totalCommunity}</p>
            <p className="text-[11px] text-[#9EABA2] font-mono mt-0.5">Active Referred Resellers</p>
          </div>
        </div>

        {/* KPI 4: Milestone Rewards Claimed */}
        <div className="funding-stat-kpi p-4 sm:p-5 space-y-2.5 relative overflow-hidden group border-[#D9C08A]/20 hover:border-[#D9C08A]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#D9C08A] font-mono font-bold">Milestone Rewards</span>
              <span className="cursor-help text-[#D9C08A]/60 hover:text-[#D9C08A] transition-colors" title="Cash bonuses unlocked by achieving personal sales and team growth targets">
                <Info size={13} />
              </span>
            </div>
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
      <div className="funding-card p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-5 relative overflow-hidden">
        <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 z-10">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#6EE7A8] to-[#2FA46B] text-[#070B09] flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(52,211,153,0.3)]">
            <ShareNetwork size={22} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="font-serif font-bold text-base sm:text-lg text-[#F4F7F5] leading-snug">
              Grow Your Partner Network &amp; Earn Milestone Cash
            </p>
            <p className="text-xs text-[#9EABA2] mt-0.5 leading-relaxed">
              Share your link with prospective resellers to unlock rank upgrades and level bonuses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 z-10">
          <button
            onClick={handleWhatsAppShare}
            className="funding-sheen-btn min-h-[44px] px-3.5 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 sm:gap-2 shadow-md cursor-pointer flex-1 sm:flex-initial whitespace-nowrap"
            title="Share referral link on WhatsApp"
          >
            <WhatsappLogo size={18} weight="fill" className="shrink-0" />
            <span>WhatsApp Invite</span>
          </button>
          <button
            onClick={handleCopy}
            className="funding-ghost-pill min-h-[44px] px-3 sm:px-4 py-2.5 text-xs font-medium text-[#F4F7F5] inline-flex items-center justify-center gap-1.5 cursor-pointer hover:border-white/20 transition-all flex-1 sm:flex-initial whitespace-nowrap"
            title="Copy referral link"
          >
            {copied ? <Check size={16} className="text-[#34D399] shrink-0" /> : <Copy size={16} className="shrink-0" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* 4. Milestone Rank Roadmap Gauge */}
      <div className="funding-card p-4 sm:p-6 lg:p-7 space-y-5 relative overflow-hidden">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left 7 Cols: Recent Customer Orders */}
        <div className="lg:col-span-7 funding-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <h3 className="font-serif font-bold text-base text-[#F4F7F5]">Recent Customer Orders</h3>
            <Link to="/dashboard/sales" className="text-xs text-[#34D399] hover:underline font-semibold flex items-center gap-1 min-h-[36px]">
              <span>View All</span>
              <CaretRight size={12} weight="bold" />
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="p-6 sm:p-8 text-center space-y-2.5 text-xs text-[#9EABA2]">
              <Package size={32} className="text-[#9EABA2]/60 mx-auto" />
              <p className="font-semibold text-sm text-[#F4F7F5]">No customer sales recorded yet.</p>
              <p className="text-[11px] text-[#9EABA2]">Select a product from the wholesale catalog to record your first client sale.</p>
              <Link to="/dashboard/products" className="inline-block pt-1">
                <button className="funding-sheen-btn px-4 py-2.5 min-h-[44px] text-xs font-bold uppercase tracking-wider cursor-pointer">
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
                  <div className="space-y-0.5 min-w-0 flex-1">
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
        <div className="lg:col-span-5 funding-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <h3 className="font-serif font-bold text-base text-[#F4F7F5]">Top Wholesale Margins</h3>
            <Link to="/dashboard/products" className="text-xs text-[#34D399] hover:underline font-semibold flex items-center gap-1 min-h-[36px]">
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
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-12 h-12 rounded-xl object-cover bg-white/[0.04] border border-white/10 shrink-0"
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

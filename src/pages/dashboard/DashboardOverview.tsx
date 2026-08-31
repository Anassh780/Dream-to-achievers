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
  WhatsappLogo,
  ShareNetwork,
  ArrowRight,
  ShieldCheck,
  Wallet,
  Sparkle,
  Question,
  CurrencyDollar,
} from '@phosphor-icons/react';

export const DashboardOverview: React.FC = () => {
  const { user, rankProgress } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user || !rankProgress) return null;

  const totalSales = rankProgress.qualifyingSales;
  const totalCommunity = rankProgress.qualifyingCommunity;
  const totalProfit = salesService.getTotalProfitEarned(user.id);
  const availableProfit = salesService.getAvailableProfitBalance(user.id);
  const pendingProfit = salesService.getPendingProfit(user.id);
  const totalRewards = rewardService.getTotalRewardsEarned(user.id);
  const recentSales = salesService.getUserSales(user.id).slice(0, 4);
  const featuredInventory = productService.getAllProducts().slice(0, 3);

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
    <div className="space-y-6 font-sans">
      
      {/* 1. Top Business Header & Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3DCC8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span className="inline-flex items-center gap-1 font-semibold text-[#1F4D3E]">
              <ShieldCheck size={14} weight="fill" /> Verified Partner
            </span>
            <span>•</span>
            <span className="text-[#1F4D3E] font-bold bg-[#F1ECDD] px-2 py-0.5 rounded border border-[#E3DCC8]">
              {user.referralCode}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E241F] tracking-tight truncate">
            Welcome back, {user.fullName}
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Current Level: <span className="text-[#1E241F] font-bold capitalize">{rankProgress.currentRank.name}</span>
            {rankProgress.nextRank && (
              <>
                {' '}• Next Goal: <span className="text-[#1F4D3E] font-semibold">{rankProgress.nextRank.name} (+PKR {rankProgress.nextRank.rewardAmount.toLocaleString()})</span>
              </>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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

      {/* 2. Beginner Earning Quick-Start Guide (Master-Level Accessibility) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-br from-[#1F4D3E] to-[#153A2E] text-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Sparkle size={18} weight="fill" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">How You Earn Money on Dream to Achievers</h2>
              <p className="text-xs text-white/80">Follow these 4 simple steps to start earning daily income</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-white/15 text-[#D4AF37] border border-white/20 self-start sm:self-auto">
            Beginner Friendly • Step-by-Step
          </span>
        </div>

        {/* 4 Step Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <Link
            to="/dashboard/products"
            className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all border border-white/10 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#1E241F] font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <Package size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Pick a Product</p>
              <p className="text-white/70 text-[11px] mt-0.5">
                Choose from our wholesale catalog with margins up to PKR 1,000+ per unit.
              </p>
            </div>
            <div className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1 pt-1">
              <span>Browse Catalog</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* Step 2 */}
          <Link
            to="/dashboard/products"
            className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all border border-white/10 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#1E241F] font-mono font-bold text-xs flex items-center justify-center">
                2
              </span>
              <ShoppingCart size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Sell to Client</p>
              <p className="text-white/70 text-[11px] mt-0.5">
                Recommend the product to clients. Collect customer name, phone, & address.
              </p>
            </div>
            <div className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1 pt-1">
              <span>Submit Order</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* Step 3 */}
          <Link
            to="/dashboard/sales"
            className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all border border-white/10 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#1E241F] font-mono font-bold text-xs flex items-center justify-center">
                3
              </span>
              <Wallet size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Withdraw Profit</p>
              <p className="text-white/70 text-[11px] mt-0.5">
                Once admin approves, profit is added to balance. Withdraw via Easypaisa, JazzCash, or Bank.
              </p>
            </div>
            <div className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1 pt-1">
              <span>View Balance</span>
              <ArrowRight size={12} />
            </div>
          </Link>

          {/* Step 4 */}
          <Link
            to="/dashboard/referrals"
            className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 transition-all border border-white/10 space-y-2 group block"
          >
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#1E241F] font-mono font-bold text-xs flex items-center justify-center">
                4
              </span>
              <Gift size={18} className="text-white/80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Earn Cash Bonuses</p>
              <p className="text-white/70 text-[11px] mt-0.5">
                Share your referral link with friends. Earn milestone bonuses up to PKR 150,000+ as rank increases!
              </p>
            </div>
            <div className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1 pt-1">
              <span>Invite Partners</span>
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>

      {/* 3. 1-Tap Referral Share Banner (WhatsApp & Link Copy) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E3DCC8] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E] shrink-0">
            <ShareNetwork size={22} weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#1E241F] truncate">Your Official Referral Invitation</p>
            <p className="text-xs text-[#5B5C50] font-mono truncate">Code: <span className="font-bold text-[#1F4D3E]">{user.referralCode}</span> • Link: <span className="text-[#7C7D70]">{referralUrl}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
            title="Share referral link directly on WhatsApp"
          >
            <WhatsappLogo size={16} weight="fill" />
            <span>Share on WhatsApp</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] text-[#1E241F] font-semibold text-xs transition-colors cursor-pointer"
            title="Copy referral link"
          >
            {copied ? <Check size={16} className="text-[#1F4D3E]" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* 4. Four Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Qualifying Product Sales */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Qualifying Sales</span>
            <ShoppingCart size={18} className="text-[#1F4D3E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E241F] font-mono">{totalSales}</p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Delivered Product Orders</p>
          </div>
        </div>

        {/* Metric 2: Available & Total Margin */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#1F4D3E] font-mono font-bold">Available Payout Profit</span>
            <TrendUp size={18} className="text-[#1F4D3E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1F4D3E] font-mono">
              PKR {availableProfit.toLocaleString()}
            </p>
            <p className="text-[10.5px] text-[#7C7D70] font-mono mt-0.5">
              +PKR {pendingProfit.toLocaleString()} pending clearance
            </p>
          </div>
        </div>

        {/* Metric 3: Community Referral Network */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Partner Team</span>
            <Users size={18} className="text-[#1F4D3E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E241F] font-mono">{totalCommunity}</p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Referred Active Partners</p>
          </div>
        </div>

        {/* Metric 4: Milestone Rewards Earned */}
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5B5C50] font-mono">Milestone Bonuses</span>
            <Gift size={18} className="text-[#B8862E]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1E241F] font-mono">
              PKR {totalRewards.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#7C7D70] font-mono mt-0.5">Level Bonuses Claimed</p>
          </div>
        </div>

      </div>

      {/* 5. Progress to Next Rank Milestone Gauge */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3DCC8]">
          <div>
            <h3 className="text-lg font-bold text-[#1E241F]">
              {rankProgress.nextRank ? `Milestone Progress: ${rankProgress.nextRank.name}` : 'Highest Level Achieved'}
            </h3>
            <p className="text-xs text-[#5B5C50]">
              Unlock higher wholesale margins and cash bonuses by reaching dual sales & partner targets.
            </p>
          </div>
          {rankProgress.nextRank && (
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[#F1ECDD] text-[#B8862E] border border-[#E3DCC8]">
              Cash Reward: PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}
            </span>
          )}
        </div>

        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition 1: Product Sales */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-semibold">1. Personal Delivered Sales</span>
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
              <div className="flex items-center justify-between text-[10px] text-[#5B5C50] font-mono">
                <span>{rankProgress.salesProgressPercent}% completed</span>
                <span className="font-semibold">{rankProgress.missingSales > 0 ? `${rankProgress.missingSales} more sales needed` : '✅ Requirement Met!'}</span>
              </div>
            </div>

            {/* Condition 2: Community Referrals */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-semibold">2. Active Referred Partners</span>
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
              <div className="flex items-center justify-between text-[10px] text-[#5B5C50] font-mono">
                <span>{rankProgress.communityProgressPercent}% completed</span>
                <span className="font-semibold">{rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} more members needed` : '✅ Requirement Met!'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-xs font-semibold text-[#1F4D3E]">
            🎉 Congratulations! You have achieved the highest rank in the DreamToAchievers network.
          </div>
        )}
      </div>

      {/* 6. Two-Column Dashboard Split: Recent Sales Ledger + High-Margin Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Recent Customer Sales */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
            <h3 className="font-bold text-base text-[#1E241F]">Recent Customer Sales</h3>
            <Link to="/dashboard/sales" className="text-xs text-[#1F4D3E] hover:underline font-semibold">
              View All Orders →
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
            <div className="space-y-2 text-xs">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 truncate">
                    <p className="font-bold text-[#1E241F] truncate">{sale.productName}</p>
                    <p className="text-[10.5px] text-[#5B5C50] font-mono">
                      Client: {sale.customerName} • {sale.quantity} unit(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#1F4D3E] block">
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
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
            <h3 className="font-bold text-base text-[#1E241F]">High-Margin Products</h3>
            <Link to="/dashboard/products" className="text-xs text-[#1F4D3E] hover:underline font-semibold">
              Full Catalog →
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {featuredInventory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between gap-2"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-white border border-[#E3DCC8] shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-[#1E241F] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#5B5C50] font-mono">Wholesale: PKR {item.partnerPrice}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#B8862E] font-mono font-bold block">
                    +PKR {item.grossMargin}
                  </span>
                  <span className="text-[9.5px] text-[#7C7D70] font-mono">Your Profit</span>
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

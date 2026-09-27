import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import {
  Trophy,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  TrendUp,
  Users,
  Wallet,
  Sparkle,
  Crown,
} from '@phosphor-icons/react';

export const RanksPage: React.FC = () => {
  const ranks = [
    {
      level: 'Level 01',
      title: 'Starter Milestone',
      reward: 'PKR 2,000',
      sales: '10 Units',
      team: '20 Members',
      badge: 'Starter',
      isTopTier: false,
    },
    {
      level: 'Level 02',
      title: 'Growth Milestone',
      reward: 'PKR 4,000',
      sales: '25 Units',
      team: '45 Members',
      badge: 'Growth',
      isTopTier: false,
    },
    {
      level: 'Level 03',
      title: 'Regional Milestone',
      reward: 'PKR 6,000',
      sales: '35 Units',
      team: '60 Members',
      badge: 'Regional',
      isTopTier: false,
    },
    {
      level: 'Level 04 ★',
      title: 'National Milestone',
      reward: 'PKR 10,000',
      sales: '100 Units',
      team: '200 Members',
      badge: 'Pinnacle',
      isTopTier: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Partner Milestone Rewards & Cash Bonus Tiers | Dream to Achievers"
        description="Earn guaranteed cash bonuses from PKR 2,000 to PKR 10,000 on Dream to Achievers. Transparent milestone tracking for sales and reseller team expansion."
        canonicalPath="/ranks"
        ogType="website"
      />
      
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09] relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9C08A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[860px] mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <ShieldCheck size={14} weight="bold" />
            <span>Guaranteed Performance Payouts</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.12]">
            Partner Milestone Rewards
          </h1>
          <p className="text-xs sm:text-base text-[#9EABA2] leading-relaxed max-w-lg mx-auto">
            Sell products, expand your distribution network, and unlock direct cash bonuses from PKR 2,000 up to PKR 10,000 credited to your verified wallet.
          </p>
        </div>
      </section>

      {/* 2. Visual 4-Tier Milestone Cards */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ranks.map((r) => (
            <div
              key={r.level}
              className={`p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl ${
                r.isTopTier
                  ? 'bg-gradient-to-b from-[#131E1A] to-[#0D1512] border-2 border-[#D9C08A] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(217,192,138,0.2)] relative overflow-hidden'
                  : 'bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 hover:border-[#D9C08A]/40 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(217,192,138,0.08)]'
              }`}
            >
              {r.isTopTier && (
                <div className="absolute top-0 right-0 px-3.5 py-1 bg-[#D9C08A] text-[#070B09] text-[10px] font-mono font-bold uppercase rounded-bl-xl shadow-md flex items-center gap-1">
                  <Crown size={12} weight="fill" />
                  <span>PINNACLE TIER</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[11px] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
                    r.isTopTier
                      ? 'bg-[#D9C08A]/15 text-[#D9C08A] border border-[#D9C08A]/30'
                      : 'bg-[#131E1A] text-[#34D399] border border-white/10'
                  }`}>
                    {r.level}
                  </span>
                  <span className="text-[10.5px] font-mono text-[#9EABA2] uppercase tracking-wide">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <div className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                    r.isTopTier ? 'gold-gradient-text' : 'text-[#34D399]'
                  }`}>
                    +{r.reward}
                  </div>
                  <span className="text-xs text-[#9EABA2] block mt-1 font-medium">
                    Guaranteed Cash Bonus
                  </span>
                </div>
              </div>

              {/* Requirement Chips */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#9EABA2]">
                    <TrendUp size={14} className="text-[#34D399]" weight="bold" />
                    <span>Product Sales:</span>
                  </span>
                  <strong className="font-mono text-[#F4F7F5]">{r.sales}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#9EABA2]">
                    <Users size={14} className="text-[#D9C08A]" weight="bold" />
                    <span>Team Members:</span>
                  </span>
                  <strong className="font-mono text-[#F4F7F5]">{r.team}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Visual 3-Step "How to Claim" Strip */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F4F7F5]">
              How to Claim Your Milestone Rewards
            </h3>
            <p className="text-xs text-[#9EABA2]">
              Transparent tracking and instant payout directly to your verified account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[#070B09]/90 border border-white/[0.08] space-y-2.5 text-center">
              <div className="w-9 h-9 rounded-full bg-[#131E1A] text-[#D9C08A] border border-[#D9C08A]/30 flex items-center justify-center font-bold text-xs mx-auto shadow-md">
                1
              </div>
              <h4 className="font-serif font-medium text-sm text-[#F4F7F5]">Sell &amp; Invite</h4>
              <p className="text-[11.5px] text-[#9EABA2] leading-relaxed">
                Every product you sell and every reseller who joins through your referral code counts automatically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#070B09]/90 border border-white/[0.08] space-y-2.5 text-center">
              <div className="w-9 h-9 rounded-full bg-[#131E1A] text-[#D9C08A] border border-[#D9C08A]/30 flex items-center justify-center font-bold text-xs mx-auto shadow-md">
                2
              </div>
              <h4 className="font-serif font-medium text-sm text-[#F4F7F5]">Track on Dashboard</h4>
              <p className="text-[11.5px] text-[#9EABA2] leading-relaxed">
                Your partner dashboard displays a real-time progress bar towards your next cash bonus.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#070B09]/90 border border-[#34D399]/30 space-y-2.5 text-center">
              <div className="w-9 h-9 rounded-full bg-[#131E1A] text-[#34D399] border border-[#34D399]/30 flex items-center justify-center font-bold text-xs mx-auto shadow-md">
                3
              </div>
              <h4 className="font-serif font-medium text-sm text-[#F4F7F5]">Claim Cash Payout</h4>
              <p className="text-[11.5px] text-[#9EABA2] leading-relaxed">
                Click "Claim Bonus" upon reaching 100% and receive funds directly in your bank or JazzCash/Easypaisa.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Action CTA Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D1512] to-[#070B09] border border-[#D9C08A]/35 text-[#F4F7F5] text-center space-y-5 max-w-2xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#D9C08A]/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#F4F7F5] relative z-10">
            Start earning milestone bonuses today
          </h3>
          <p className="text-xs sm:text-sm text-[#9EABA2] max-w-md mx-auto leading-relaxed relative z-10">
            Create your account now and start working towards your Level 01 cash bonus.
          </p>
          <div className="pt-2 relative z-10">
            <Link to="/signup">
              <Button variant="champagne" size="md" className="font-medium shadow-lg" iconRight={<ArrowRight size={13} />}>
                Create Partner Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RanksPage;

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
    <div className="min-h-screen bg-[#FAF7EF] dark:bg-[#0B100D] text-[#1E241F] dark:text-[#F4F3EE] pb-24 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="Partner Milestone Rewards & Cash Bonus Tiers | Dream to Achievers"
        description="Earn guaranteed cash bonuses from PKR 2,000 to PKR 10,000 on Dream to Achievers. Transparent milestone tracking for sales and reseller team expansion."
        canonicalPath="/ranks"
        ogType="website"
      />
      
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8] dark:border-[#24352B] text-center">
        <div className="max-w-[860px] mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F4D3E]/8 dark:bg-[#348E72]/15 border border-[#1F4D3E]/15 dark:border-[#348E72]/30 text-[#1F4D3E] dark:text-[#48C79B] text-xs font-medium">
            <ShieldCheck size={14} weight="bold" />
            <span>Cash Bonus Roadmap &amp; Qualification</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl tracking-tight leading-[1.12]">
            Partner Milestone Rewards
          </h1>
          <p className="text-xs sm:text-base text-[#5B5C50] dark:text-[#A2B1A8] leading-relaxed max-w-lg mx-auto">
            Sell products, invite resellers to your team, and unlock direct cash bonuses from PKR 2,000 up to PKR 10,000 credited to your wallet.
          </p>
        </div>
      </section>

      {/* 2. Visual 4-Tier Milestone Cards */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ranks.map((r) => (
            <div
              key={r.level}
              className={`p-6 rounded-2xl flex flex-col justify-between space-y-5 transition-all duration-200 shadow-xs hover:shadow-md ${
                r.isTopTier
                  ? 'bg-white dark:bg-[#18231E] border-2 border-[#B8862E] dark:border-[#E2B258] ring-2 ring-[#B8862E]/20 dark:ring-[#E2B258]/20 relative overflow-hidden'
                  : 'bg-white dark:bg-[#141C18] border border-[#E3DCC8] dark:border-[#24352B] hover:border-[#1F4D3E]/40'
              }`}
            >
              {r.isTopTier && (
                <div className="absolute -top-1 -right-1 px-3 py-1 bg-gradient-to-r from-[#B8862E] to-[#D4A043] text-white text-[9.5px] font-mono font-bold uppercase rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Crown size={12} weight="fill" />
                  <span>Top Tier</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[11px] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
                    r.isTopTier
                      ? 'bg-[#1F4D3E] dark:bg-[#276E57] text-white shadow-2xs'
                      : 'bg-[#FAF7EF] dark:bg-[#1B2620] text-[#1F4D3E] dark:text-[#48C79B] border border-[#E3DCC8] dark:border-[#24352B]'
                  }`}>
                    {r.level}
                  </span>
                  <span className="text-[10.5px] font-mono text-[#7C7D70] dark:text-[#A2B1A8] uppercase tracking-wide">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <div className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight ${
                    r.isTopTier ? 'text-[#B8862E] dark:text-[#E2B258]' : 'text-[#1F4D3E] dark:text-[#48C79B]'
                  }`}>
                    +{r.reward}
                  </div>
                  <span className="text-xs text-[#5B5C50] dark:text-[#A2B1A8] block mt-0.5 font-medium">
                    Guaranteed Cash Bonus
                  </span>
                </div>
              </div>

              {/* Requirement Chips */}
              <div className="space-y-2.5 pt-4 border-t border-[#E3DCC8] dark:border-[#24352B] text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#5B5C50] dark:text-[#A2B1A8]">
                    <TrendUp size={14} className="text-[#1F4D3E] dark:text-[#48C79B]" weight="bold" />
                    <span>Product Sales:</span>
                  </span>
                  <strong className="font-mono text-[#1E241F] dark:text-[#F4F3EE]">{r.sales}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#5B5C50] dark:text-[#A2B1A8]">
                    <Users size={14} className="text-[#1F4D3E] dark:text-[#48C79B]" weight="bold" />
                    <span>Team Members:</span>
                  </span>
                  <strong className="font-mono text-[#1E241F] dark:text-[#F4F3EE]">{r.team}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Visual 3-Step "How to Claim" Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141C18] border border-[#E3DCC8] dark:border-[#24352B] shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1E241F] dark:text-[#F4F3EE]">
              How to Claim Your Milestone Rewards
            </h3>
            <p className="text-xs text-[#5B5C50] dark:text-[#A2B1A8]">
              Transparent tracking and instant payout directly to your verified account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF7EF] dark:bg-[#1B2620] border border-[#E3DCC8] dark:border-[#24352B] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#1F4D3E] dark:bg-[#276E57] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                1
              </div>
              <h4 className="font-semibold text-sm text-[#1E241F] dark:text-[#F4F3EE]">Sell &amp; Invite</h4>
              <p className="text-[11.5px] text-[#5B5C50] dark:text-[#A2B1A8] leading-relaxed">
                Every product you sell and every reseller who joins through your referral code counts automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7EF] dark:bg-[#1B2620] border border-[#E3DCC8] dark:border-[#24352B] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#1F4D3E] dark:bg-[#276E57] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                2
              </div>
              <h4 className="font-semibold text-sm text-[#1E241F] dark:text-[#F4F3EE]">Track on Dashboard</h4>
              <p className="text-[11.5px] text-[#5B5C50] dark:text-[#A2B1A8] leading-relaxed">
                Your partner dashboard displays a real-time progress bar towards your next cash bonus.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7EF] dark:bg-[#1B2620] border border-[#E3DCC8] dark:border-[#24352B] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#B8862E] dark:bg-[#E2B258] text-white dark:text-[#141C18] flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                3
              </div>
              <h4 className="font-semibold text-sm text-[#1E241F] dark:text-[#F4F3EE]">Claim Cash Payout</h4>
              <p className="text-[11.5px] text-[#5B5C50] dark:text-[#A2B1A8] leading-relaxed">
                Click "Claim Bonus" upon reaching 100% and receive funds directly in your bank or JazzCash/Easypaisa.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Action CTA Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#1F4D3E] text-white text-center space-y-5 max-w-2xl mx-auto shadow-md">
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
            Start earning milestone bonuses today
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto leading-relaxed">
            Create your account now and start working towards your Level 01 cash bonus.
          </p>
          <div className="pt-1">
            <Link to="/signup">
              <Button variant="outline" size="md" className="bg-white text-[#1F4D3E] hover:bg-emerald-50 border-white font-medium" iconRight={<ArrowRight size={13} />}>
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

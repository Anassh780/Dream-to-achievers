import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Trophy,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  TrendUp,
  Users,
  Wallet,
  Sparkle,
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
      color: 'border-[#E3DCC8]',
      highlight: false,
    },
    {
      level: 'Level 02',
      title: 'Growth Milestone',
      reward: 'PKR 4,000',
      sales: '25 Units',
      team: '45 Members',
      badge: 'Growth',
      color: 'border-[#E3DCC8]',
      highlight: false,
    },
    {
      level: 'Level 03',
      title: 'Regional Milestone',
      reward: 'PKR 6,000',
      sales: '35 Units',
      team: '60 Members',
      badge: 'Regional',
      color: 'border-[#E3DCC8]',
      highlight: false,
    },
    {
      level: 'Level 04 ★',
      title: 'National Milestone',
      reward: 'PKR 10,000',
      sales: '100 Units',
      team: '200 Members',
      badge: 'Top Tier',
      color: 'border-[#B8862E]',
      highlight: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
            <ShieldCheck size={13} weight="bold" />
            <span>Cash Bonus Roadmap</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            Partner Milestone Rewards
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-md mx-auto">
            Sell products, invite resellers to your team, and unlock direct cash bonuses from PKR 2,000 up to PKR 10,000.
          </p>
        </div>
      </section>

      {/* 2. Visual 4-Tier Milestone Cards */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ranks.map((r) => (
            <div
              key={r.level}
              className={`p-6 rounded-2xl bg-white border ${r.color} shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-all ${
                r.highlight ? 'bg-gradient-to-b from-white to-[#FBF7ED]' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[11px] uppercase font-semibold px-2.5 py-0.5 rounded-full ${
                    r.highlight ? 'bg-[#1F4D3E] text-white' : 'bg-[#FAF7EF] text-[#1F4D3E] border border-[#E3DCC8]'
                  }`}>
                    {r.level}
                  </span>
                  <span className="text-[10px] font-mono text-[#7C7D70] uppercase">{r.badge}</span>
                </div>

                <div>
                  <div className="text-2xl font-serif font-bold text-[#1F4D3E]">
                    +{r.reward}
                  </div>
                  <span className="text-xs text-[#5B5C50]">Guaranteed Cash Bonus</span>
                </div>
              </div>

              {/* Requirement Chips */}
              <div className="space-y-2.5 pt-4 border-t border-[#E3DCC8] text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#5B5C50]">
                    <TrendUp size={14} className="text-[#1F4D3E]" />
                    <span>Product Sales:</span>
                  </span>
                  <strong className="font-mono text-[#1E241F]">{r.sales}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#5B5C50]">
                    <Users size={14} className="text-[#1F4D3E]" />
                    <span>Team Members:</span>
                  </span>
                  <strong className="font-mono text-[#1E241F]">{r.team}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Visual 3-Step "How to Claim" Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3DCC8] shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1E241F]">
              How to Claim Your Milestone Rewards
            </h3>
            <p className="text-xs text-[#5B5C50]">
              Transparent tracking and instant payout directly to your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#1F4D3E] text-white flex items-center justify-center font-bold text-xs mx-auto">
                1
              </div>
              <h4 className="font-semibold text-sm text-[#1E241F]">Sell &amp; Invite</h4>
              <p className="text-[11.5px] text-[#5B5C50]">
                Every product you sell and every reseller who joins through your referral code counts automatically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#1F4D3E] text-white flex items-center justify-center font-bold text-xs mx-auto">
                2
              </div>
              <h4 className="font-semibold text-sm text-[#1E241F]">Track on Dashboard</h4>
              <p className="text-[11.5px] text-[#5B5C50]">
                Your partner dashboard displays a real-time progress bar towards your next cash bonus.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#B8862E] text-white flex items-center justify-center font-bold text-xs mx-auto">
                3
              </div>
              <h4 className="font-semibold text-sm text-[#1E241F]">Claim Cash Payout</h4>
              <p className="text-[11.5px] text-[#5B5C50]">
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

import React from 'react';
import { ShieldStar, Medal, Crown, Diamond, ArrowRight, Gift, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const RankJourney: React.FC = () => {
  const ranks = [
    {
      order: '01',
      name: 'Silver Rank',
      slug: 'silver',
      sales: 10,
      community: 20,
      reward: 2000,
      tagline: 'Foundational tier. Establish direct customer base & initial referral team.',
      accent: 'text-slate-300',
      badgeBg: 'bg-slate-400/10 border-slate-400/20 text-slate-300',
      icon: ShieldStar,
      elevation: 'md:translate-y-0',
    },
    {
      order: '02',
      name: 'Platinum Rank',
      slug: 'platinum',
      sales: 25,
      community: 45,
      reward: 4000,
      tagline: 'Momentum milestone. Accelerate product sales and expand community network.',
      accent: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      icon: Medal,
      elevation: 'md:-translate-y-2',
    },
    {
      order: '03',
      name: 'Gold Rank',
      slug: 'gold',
      sales: 35,
      community: 60,
      reward: 6000,
      tagline: 'Leadership milestone. Master performance advertising and mentor active partners.',
      accent: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 border-amber-400/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      icon: Crown,
      elevation: 'md:-translate-y-4',
    },
    {
      order: '04',
      name: 'Diamond Rank',
      slug: 'diamond',
      sales: 100,
      community: 200,
      reward: 10000,
      tagline: 'Pinnacle enterprise tier. Scale high-volume distribution and lead top-tier revenue share.',
      accent: 'text-purple-400',
      badgeBg: 'bg-purple-500/15 border-purple-400/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
      icon: Diamond,
      elevation: 'md:-translate-y-6',
      isPinnacle: true,
    },
  ];

  return (
    <div className="space-y-12 font-sans">
      {/* 4 Connected Rank Cards with Staggered Elevation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        {ranks.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.slug}
              className={`double-bezel transition-all duration-300 ${r.elevation}`}
            >
              <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-6 bg-[#080E1E] border border-white/[0.08] hover:border-cyan-400/30 shadow-xl">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full border ${r.badgeBg}`}>
                      TIER {r.order}
                    </span>
                    {r.isPinnacle ? (
                      <span className="text-[10px] font-medium text-purple-400 flex items-center gap-1">
                        <Sparkle size={12} weight="fill" /> Pinnacle Tier
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400">Milestone</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-[#030712] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-inner">
                      <Icon size={22} weight="fill" className={r.accent} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">
                        {r.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">Stage {r.order}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                    {r.tagline}
                  </p>
                </div>

                {/* Dual Qualification Requirements */}
                <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#030712] border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 block">Product Sales</span>
                      <span className="text-base font-bold text-white font-jetbrains">{r.sales}</span>
                      <span className="text-[10px] text-slate-400 block">Units</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#030712] border border-white/[0.06]">
                      <span className="text-[10px] text-slate-400 block">Community</span>
                      <span className="text-base font-bold text-white font-jetbrains">{r.community}</span>
                      <span className="text-[10px] text-slate-400 block">Members</span>
                    </div>
                  </div>

                  {/* Guaranteed Milestone Reward Callout */}
                  <div className="p-3 rounded-xl bg-[#030712] border border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Gift size={15} className="text-emerald-400" />
                      <span>Cash Reward:</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 font-jetbrains">
                      PKR {r.reward.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Action Link */}
                <Link to={`/ranks#${r.slug}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-between rounded-xl group text-xs font-semibold">
                    <span>Rank Criteria</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

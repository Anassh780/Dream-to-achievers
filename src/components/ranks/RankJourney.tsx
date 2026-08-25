import React from 'react';
import { RankDefinition } from '@/types';
import { ShieldStar, Medal, Crown, Diamond, CheckCircle, ArrowRight, Gift, Sparkle } from '@phosphor-icons/react';
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
      tagline: 'Foundational commerce tier. Establish direct customer base & initial referral team.',
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
      accent: 'text-[#60A5FA]',
      badgeBg: 'bg-blue-500/10 border-blue-400/20 text-[#60A5FA]',
      icon: Medal,
      elevation: 'md:-translate-y-3',
    },
    {
      order: '03',
      name: 'Gold Rank',
      slug: 'gold',
      sales: 35,
      community: 60,
      reward: 6000,
      tagline: 'Leadership milestone. Master performance advertising and mentor active partners.',
      accent: 'text-[#F59E0B]',
      badgeBg: 'bg-amber-500/10 border-amber-400/20 text-[#FBBF24]',
      icon: Crown,
      elevation: 'md:-translate-y-6',
    },
    {
      order: '04',
      name: 'Diamond Rank',
      slug: 'diamond',
      sales: 100,
      community: 200,
      reward: 10000,
      tagline: 'Pinnacle enterprise tier. Scale high-volume distribution and lead top-tier revenue share.',
      accent: 'text-[#C084FC]',
      badgeBg: 'bg-purple-500/10 border-purple-400/25 text-[#C084FC]',
      icon: Diamond,
      elevation: 'md:-translate-y-9',
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
              <div className="double-bezel-inner p-6 sm:p-7 flex flex-col justify-between h-full space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full border ${r.badgeBg}`}>
                      TIER {r.order}
                    </span>
                    {r.isPinnacle ? (
                      <span className="text-[10px] font-medium text-[#C084FC] flex items-center gap-1">
                        <Sparkle size={12} weight="fill" /> Pinnacle Tier
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-[#64748B]">Milestone</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-[#0A0F19] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <Icon size={22} weight="fill" className={r.accent} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-white">
                        {r.name}
                      </h3>
                      <p className="text-[11px] text-[#64748B]">Milestone Stage {r.order}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed min-h-[3rem]">
                    {r.tagline}
                  </p>
                </div>

                {/* Dual Qualification Requirements */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#0A0F19] border border-white/[0.04]">
                      <span className="text-[10px] text-[#64748B] block">Product Sales</span>
                      <span className="text-base font-bold text-white">{r.sales}</span>
                      <span className="text-[10px] text-[#64748B] block">Units</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A0F19] border border-white/[0.04]">
                      <span className="text-[10px] text-[#64748B] block">Community</span>
                      <span className="text-base font-bold text-white">{r.community}</span>
                      <span className="text-[10px] text-[#64748B] block">Members</span>
                    </div>
                  </div>

                  {/* Guaranteed Milestone Reward Callout */}
                  <div className="p-3 rounded-xl bg-[#0A0F19] border border-white/[0.04] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-[#94A3B8]">
                      <Gift size={15} />
                      <span>Cash Reward:</span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      PKR {r.reward.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Action Link */}
                <Link to={`/ranks#${r.slug}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-between rounded-xl group text-xs">
                    <span>Rank Details</span>
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

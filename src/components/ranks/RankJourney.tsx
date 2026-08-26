import React from 'react';
import { ShieldCheck, Trophy, Crown, Diamond, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export const RankJourney: React.FC = () => {
  const ranks = [
    {
      level: 'Level 01',
      name: 'Starter Partner',
      slug: 'silver',
      sales: 10,
      community: 20,
      reward: 2000,
      description: 'Foundational tier. Build your customer base and place your initial team referrals.',
      badgeBg: 'bg-slate-400/10 text-slate-300 border-slate-400/30',
    },
    {
      level: 'Level 02',
      name: 'Growth Partner',
      slug: 'platinum',
      sales: 25,
      community: 45,
      reward: 4000,
      description: 'Scale wholesale volume and grow an active distributor network.',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    },
    {
      level: 'Level 03',
      name: 'Regional Partner',
      slug: 'gold',
      sales: 35,
      community: 60,
      reward: 6000,
      description: 'Manage multi-channel resale and mentor a regional distributor team.',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    {
      level: 'Level 04',
      name: 'National Partner',
      slug: 'diamond',
      sales: 100,
      community: 200,
      reward: 10000,
      description: 'High-volume nationwide distribution with maximum cash milestone payouts.',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* 4 Connected Milestone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-3xl overflow-hidden bg-[#060B18] border border-white/[0.08] shadow-2xl divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
        {ranks.map((r) => (
          <div
            key={r.slug}
            className="p-6 sm:p-7 flex flex-col justify-between space-y-5 hover:bg-white/[0.02] transition-colors group"
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${r.badgeBg}`}>
                  {r.level}
                </span>
                <Trophy size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                  {r.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>

            {/* Metrics & Cash Bonus */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-1.5 text-xs font-jetbrains">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Required Sales:</span>
                  <span className="text-white font-bold">{r.sales} units</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Community Network:</span>
                  <span className="text-cyan-300 font-bold">{r.community} members</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-300 font-medium">Guaranteed Bonus:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  +PKR {r.reward.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

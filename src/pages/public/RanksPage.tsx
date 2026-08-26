import React from 'react';
import { Button } from '@/components/ui/Button';
import { RankJourney } from '@/components/ranks/RankJourney';
import { CANONICAL_RANKS } from '@/config/ranks';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShieldCheck, Trophy, Sparkle } from '@phosphor-icons/react';

export const RanksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      {/* 1. Header Banner */}
      <section className="relative pt-24 sm:pt-28 pb-14 border-b border-white/[0.08] bg-radial-hero overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-4 text-center">
          <div className="eyebrow mx-auto">
            <ShieldCheck size={13} weight="bold" />
            <span>Dual Qualification Milestone Roadmap</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
            Partner Level Milestone Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            From your first 10 direct product sales to enterprise 200-member community networks, our 4-level rank milestone model delivers transparent progression and guaranteed cash rewards.
          </p>
        </div>
      </section>

      {/* 2. Rank Cards Section */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 space-y-16">
        <section>
          <RankJourney />
        </section>

        {/* 3. Rank Comparison Matrix Table */}
        <section className="p-7 sm:p-9 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-6 shadow-2xl">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Verification Specifications
            </span>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
              Level Qualification Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Compare sales requirements, community thresholds, cash rewards, and perks across all 4 tiers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#030712] overflow-hidden text-xs shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/[0.08] text-slate-400 text-[10px] bg-[#060B18] font-mono uppercase">
                  <tr>
                    <th className="p-4 font-semibold">Level Tier</th>
                    <th className="p-4 font-semibold text-center">Required Sales</th>
                    <th className="p-4 font-semibold text-center">Community Network</th>
                    <th className="p-4 font-semibold text-center">Cash Bonus</th>
                    <th className="p-4 font-semibold">Benefits & Perks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {CANONICAL_RANKS.map((r) => (
                    <tr key={r.slug} className="hover:bg-white/[0.02] transition-colors" id={r.slug}>
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
                            <Trophy size={14} weight="fill" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">{r.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Tier 0{r.order}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-cyan-300">
                        {r.requiredSales} units
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-white">
                        {r.requiredCommunity} members
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-emerald-400 text-sm">
                        +PKR {r.rewardAmount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <ul className="space-y-1 text-slate-400">
                          {r.benefits.map((b, i) => (
                            <li key={i} className="flex items-center space-x-1.5">
                              <CheckCircle size={12} weight="fill" className="text-cyan-400 shrink-0" />
                              <span className="text-[11px]">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Footer Join Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#060B18] to-[#0A1024] border border-white/10 text-center space-y-4 shadow-2xl">
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
            Ready to climb the milestone ladder?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Create your account, start distributing wholesale products, and track your milestone progress in real time.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button variant="primary" size="md" className="rounded-xl font-bold text-xs" iconRight={<ArrowRight size={13} />}>
                Join as Partner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

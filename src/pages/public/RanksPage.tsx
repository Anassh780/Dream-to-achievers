import React from 'react';
import { Button } from '@/components/ui/Button';
import { RankJourney } from '@/components/ranks/RankJourney';
import { CANONICAL_RANKS } from '@/config/ranks';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShieldCheck, Trophy } from '@phosphor-icons/react';

export const RanksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-4">
          <div className="eyebrow">
            <ShieldCheck size={13} weight="bold" />
            <span>Dual Qualification Milestone Roadmap</span>
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            Partner Level Milestone Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-lg mx-auto">
            From your first 10 direct product sales to enterprise 200-member community networks, our 4-level rank milestone model delivers transparent progression and guaranteed cash rewards.
          </p>
        </div>
      </section>

      {/* 2. Rank Cards Section */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-16">
        <section>
          <RankJourney />
        </section>

        {/* 3. Rank Comparison Matrix Table */}
        <section className="p-7 sm:p-9 rounded-xl bg-white border border-[#E3DCC8] space-y-6 shadow-xs">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Verification Specifications
            </span>
            <h3 className="font-display font-medium text-xl sm:text-2xl text-[#1E241F]">
              Level Qualification Matrix
            </h3>
            <p className="text-xs text-[#5B5C50]">
              Compare sales requirements, community thresholds, cash rewards, and perks across all 4 tiers.
            </p>
          </div>

          <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-[#E3DCC8] text-[#5B5C50] text-[11px] bg-[#F1ECDD] font-mono">
                  <tr>
                    <th className="p-4 font-medium">Level Tier</th>
                    <th className="p-4 font-medium text-center">Required Sales</th>
                    <th className="p-4 font-medium text-center">Community Network</th>
                    <th className="p-4 font-medium text-center">Cash Bonus</th>
                    <th className="p-4 font-medium">Benefits &amp; Perks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                  {CANONICAL_RANKS.map((r) => (
                    <tr key={r.slug} className="hover:bg-[#FAF7EF] transition-colors" id={r.slug}>
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
                            <Trophy size={14} weight="bold" />
                          </div>
                          <div>
                            <span className="font-medium text-[#1E241F] block">{r.name}</span>
                            <span className="text-[10px] text-[#5B5C50] font-mono">Tier 0{r.order}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-medium text-[#1E241F]">
                        {r.requiredSales} units
                      </td>
                      <td className="p-4 text-center font-mono font-medium text-[#1E241F]">
                        {r.requiredCommunity} members
                      </td>
                      <td className="p-4 text-center font-mono font-semibold text-[#B8862E] text-sm">
                        +PKR {r.rewardAmount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <ul className="space-y-1 text-[#5B5C50]">
                          {r.benefits.map((b, i) => (
                            <li key={i} className="flex items-center space-x-1.5">
                              <CheckCircle size={12} weight="bold" className="text-[#1F4D3E] shrink-0" />
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
        <div className="p-8 sm:p-10 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <h3 className="font-display font-medium text-xl sm:text-2xl text-[#1E241F]">
            Ready to climb the milestone ladder?
          </h3>
          <p className="text-xs sm:text-sm text-[#5B5C50] max-w-md mx-auto">
            Create your account, start distributing wholesale products, and track your milestone progress in real time.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button variant="primary" size="md" className="font-medium" iconRight={<ArrowRight size={13} />}>
                Join as Partner
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RankJourney } from '@/components/ranks/RankJourney';
import { CANONICAL_RANKS } from '@/config/ranks';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Sparkle } from '@phosphor-icons/react';

export const RanksPage: React.FC = () => {
  return (
    <div className="space-y-20 pb-24 max-w-6xl mx-auto px-5 sm:px-8 font-sans">
      {/* Header */}
      <section className="pt-8 text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
          Dual Qualification Milestone System
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
          Four-Level Achievement Journey
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          From your first 10 product sales to enterprise 200-member community networks, our 4-level rank milestone model delivers transparent progression and guaranteed cash rewards.
        </p>
      </section>

      {/* Main Interactive 4-Rank Cards & Margin Formula */}
      <section className="space-y-8">
        <RankJourney />
      </section>

      {/* Comprehensive Rank Comparison Table */}
      <section className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-1.5">
          <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
            Verification Specifications
          </span>
          <h3 className="text-2xl font-heading font-bold text-white">
            Rank Tier Comparison Matrix
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Compare sales requirements, community thresholds, cash rewards, and perks across all 4 tiers.
          </p>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/[0.06] text-[#94A3B8] text-[11px] bg-[#0A0F19]">
                  <tr>
                    <th className="p-4 font-medium">Rank Tier</th>
                    <th className="p-4 font-medium text-center">Required Sales</th>
                    <th className="p-4 font-medium text-center">Community Network</th>
                    <th className="p-4 font-medium text-center">Milestone Reward</th>
                    <th className="p-4 font-medium">Benefits & Perks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
                  {CANONICAL_RANKS.map((r) => (
                    <tr key={r.slug} className="hover:bg-white/[0.02] transition-colors" id={r.slug}>
                      <td className="p-4 font-heading font-bold text-white text-sm">{r.name}</td>
                      <td className="p-4 text-center font-mono text-white">{r.requiredSales} Units</td>
                      <td className="p-4 text-center font-mono text-white">{r.requiredCommunity} Members</td>
                      <td className="p-4 text-center font-mono font-bold text-white">
                        {r.currency} {r.rewardAmount.toLocaleString()}
                      </td>
                      <td className="p-4 space-y-1.5">
                        {r.benefits.slice(0, 2).map((b, i) => (
                          <div key={i} className="flex items-center space-x-1.5 text-[11px] text-[#94A3B8]">
                            <CheckCircle size={13} className="text-[#22C55E] shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="double-bezel">
        <div className="double-bezel-inner p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-2xl font-heading font-bold text-white">
            Begin Your Progression at Silver Rank
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Register today to receive your personal tracking portal, wholesale pricing, and referral code.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-6 group"
                iconRight={
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white ml-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={13} weight="bold" />
                  </span>
                }
              >
                Create Partner Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

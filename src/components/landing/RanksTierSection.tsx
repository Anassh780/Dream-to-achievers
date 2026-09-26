import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/luxury/ScrollReveal';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import {
  Trophy,
  Crown,
  Sparkle,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Medal,
  Diamond,
  SealCheck,
} from '@phosphor-icons/react';

interface RankTierData {
  tier: string;
  name: string;
  salesReq: string;
  networkReq: string;
  cashBonus: string;
  perks: string[];
  isElevated?: boolean;
  emblemColor: string;
  badgeTitle: string;
}

const TIERS: RankTierData[] = [
  {
    tier: 'TIER 01',
    name: 'Silver Rank',
    salesReq: '10 Units Sold',
    networkReq: '20 Active Resellers',
    cashBonus: 'PKR 2,000',
    emblemColor: 'from-slate-300 via-gray-100 to-slate-400',
    badgeTitle: 'Starter Milestone',
    perks: [
      'Standard Partner Purchase Margin',
      'VIP Telegram & WhatsApp Access',
      'Silver Partner Digital Credential',
    ],
    isElevated: false,
  },
  {
    tier: 'TIER 02',
    name: 'Platinum Rank',
    salesReq: '25 Units Sold',
    networkReq: '45 Active Resellers',
    cashBonus: 'PKR 4,000',
    emblemColor: 'from-teal-200 via-cyan-100 to-emerald-300',
    badgeTitle: 'Growth Milestone',
    perks: [
      'Priority New SKU Allocations',
      'Advanced Viral Video Playbooks',
      'Accelerated Payout Ledger',
    ],
    isElevated: false,
  },
  {
    tier: 'TIER 03',
    name: 'Gold Executive',
    salesReq: '35 Units Sold',
    networkReq: '60 Active Resellers',
    cashBonus: 'PKR 6,000',
    emblemColor: 'from-amber-300 via-yellow-100 to-yellow-500',
    badgeTitle: 'Executive Mastermind',
    perks: [
      'Dedicated Account Growth Officer',
      'Featured on National Showcase',
      'Custom Marketing Creative Kits',
      'Direct WhatsApp Direct Line',
    ],
    isElevated: true,
  },
  {
    tier: 'TIER 04',
    name: 'Diamond Pinnacle',
    salesReq: '100 Units Sold',
    networkReq: '200 Active Resellers',
    cashBonus: 'PKR 10,000',
    emblemColor: 'from-blue-200 via-purple-100 to-cyan-300',
    badgeTitle: 'Enterprise Founder Tier',
    perks: [
      'Top-Tier Profit Revenue Share',
      'Lifetime Diamond Trophy Badge',
      'Direct Advisory with Executive Team',
      'National Gala Event Invitation',
    ],
    isElevated: false,
  },
];

export const RanksTierSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-b border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="luxury-eyebrow flex items-center justify-center gap-2">
            <Sparkle size={13} className="text-[var(--champagne)]" />
            <span>Milestone Growth Architecture</span>
          </div>
          <h2 className="display-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Transparent cash milestone rewards
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Move volume, expand your reseller community, and unlock guaranteed cash bonuses credited to your partner wallet.
          </p>
        </div>

        {/* Tiered Glass Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {TIERS.map((rank, index) => (
            <ScrollReveal
              key={rank.name}
              staggerIndex={index}
              threshold={0.15}
              className="h-full flex"
            >
              <GlassCard
                glow={rank.isElevated}
                className={`w-full p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-400 ${
                  rank.isElevated
                    ? 'border-[var(--champagne-border)] ring-1 ring-[var(--champagne-border)] lg:-translate-y-3 lg:scale-105 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] z-10'
                    : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header & Visual Medal Emblem */}
                  <div className="flex items-center justify-between">
                    <span className="luxury-eyebrow text-[10px] text-[var(--champagne)]">
                      {rank.tier}
                    </span>
                    {rank.isElevated && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--champagne)]/15 border border-[var(--champagne)]/30 text-[10px] font-mono text-[var(--champagne)] uppercase tracking-wider">
                        Top Performer
                      </span>
                    )}
                  </div>

                  {/* Medal Graphic Container */}
                  <div className="flex items-center gap-3.5 py-1">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rank.emblemColor} p-[1px] shadow-lg flex items-center justify-center shrink-0`}
                    >
                      <div className="w-full h-full rounded-[15px] bg-[#070B09] flex items-center justify-center text-[var(--champagne)]">
                        {rank.tier === 'TIER 01' && <Medal size={24} weight="duotone" />}
                        {rank.tier === 'TIER 02' && <Trophy size={24} weight="duotone" />}
                        {rank.tier === 'TIER 03' && <Crown size={24} weight="fill" className="text-amber-300" />}
                        {rank.tier === 'TIER 04' && <Diamond size={24} weight="duotone" className="text-cyan-300" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="display-serif text-xl font-normal text-[var(--text-primary)]">
                        {rank.name}
                      </h3>
                      <div className="text-[11px] font-mono text-[var(--text-muted)]">
                        {rank.badgeTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-[var(--text-muted)] py-1 border-y border-white/[0.06] flex items-center justify-between">
                    <span>Target: {rank.salesReq}</span>
                    <span>Team: {rank.networkReq}</span>
                  </div>

                  {/* Cash Bonus Highlight */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      Guaranteed Cash Bonus
                    </div>
                    <div className="font-serif text-2xl sm:text-3xl text-[var(--champagne)] font-medium">
                      {rank.cashBonus}
                    </div>
                  </div>

                  {/* Perks Checklist */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[10.5px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                      Tier Privileges:
                    </div>
                    <ul className="space-y-2">
                      {rank.perks.map((perk) => (
                        <li
                          key={perk}
                          className="flex items-start gap-2 text-xs text-[var(--text-primary)]/85 leading-snug"
                        >
                          <CheckCircle
                            size={14}
                            weight="fill"
                            className="text-[var(--emerald)] shrink-0 mt-0.5"
                          />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <Link
                    to="/ranks"
                    className={`w-full py-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      rank.isElevated
                        ? 'emerald-gradient-btn'
                        : 'bg-white/[0.05] hover:bg-white/[0.10] text-[var(--text-primary)] border border-white/[0.08]'
                    }`}
                  >
                    <span>View Roadmap</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

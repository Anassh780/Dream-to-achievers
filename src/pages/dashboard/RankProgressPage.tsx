import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CANONICAL_RANKS } from '@/config/ranks';
import { storage } from '@/services/storage';
import { CheckCircle, Lock } from '@phosphor-icons/react';

export const RankProgressPage: React.FC = () => {
  const { user, rankProgress } = useAuth();

  if (!user || !rankProgress) return null;

  const rankHistory = storage.get<any[]>('RANK_HISTORY', []).filter((h) => h.userId === user.id);

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#D9C08A]/25">
      
      {/* Page Header */}
      <div className="space-y-1 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
          <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#34D399] border-[#34D399]/30">Partner Hub</span>
          <span>/</span>
          <span>Level Progression</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
          Partner Level Progression &amp; Roadmap
        </h1>
        <p className="text-xs text-[#9EABA2]">
          Review qualification criteria and live progress across all 4 partner milestone tiers.
        </p>
      </div>

      {/* 1. Primary Current-Rank Status Card */}
      <div className="funding-card p-6 sm:p-7 space-y-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 w-64 h-64 bg-[radial-gradient(circle,rgba(52,211,153,0.1),transparent_70%)] blur-2xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08] z-10 relative">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#34D399] font-semibold tracking-wider block">
              Active Milestone Level
            </span>
            <div className="flex items-center space-x-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F4F7F5]">
                {rankProgress.currentRank.name}
              </h2>
              <span className="funding-ghost-pill px-3 py-1 text-xs font-mono text-[#34D399] border-[#34D399]/30">
                Tier {rankProgress.currentRank.order || 1}
              </span>
            </div>
          </div>

          {rankProgress.nextRank ? (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono flex items-center space-x-3">
              <div>
                <span className="text-[10px] text-[#9EABA2] block">Next Goal:</span>
                <span className="font-bold text-[#F4F7F5]">{rankProgress.nextRank.name}</span>
              </div>
              <div className="border-l border-white/[0.08] pl-3">
                <span className="text-[10px] text-[#9EABA2] block">Bonus:</span>
                <span className="font-bold text-[#D9C08A]">+PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="funding-ghost-pill px-3.5 py-1.5 text-xs font-mono text-[#34D399] border-[#34D399]/40">
              Level 04 Pinnacle Completed
            </div>
          )}
        </div>

        {/* Primary Dual Progress Bars */}
        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 z-10 relative">
            {/* Sales Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F4F7F5] font-semibold">Personal Product Orders</span>
                <span className="text-[#F4F7F5] font-mono font-bold">
                  {rankProgress.qualifyingSales} / {rankProgress.nextRank.requiredSales} units ({rankProgress.salesProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6EE7A8] to-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all duration-300"
                  style={{ width: `${rankProgress.salesProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#9EABA2] font-mono">
                <span>{rankProgress.salesProgressPercent}% Qualified</span>
                <span className="font-semibold text-[#34D399]">{rankProgress.missingSales > 0 ? `${rankProgress.missingSales} sales remaining` : 'Complete'}</span>
              </div>
            </div>

            {/* Community Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#F4F7F5] font-semibold">Partner Team Network</span>
                <span className="text-[#F4F7F5] font-mono font-bold">
                  {rankProgress.qualifyingCommunity} / {rankProgress.nextRank.requiredCommunity} members ({rankProgress.communityProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6EE7A8] to-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all duration-300"
                  style={{ width: `${rankProgress.communityProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#9EABA2] font-mono">
                <span>{rankProgress.communityProgressPercent}% Qualified</span>
                <span className="font-semibold text-[#34D399]">{rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} members remaining` : 'Complete'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#9EABA2] font-mono">You have unlocked all milestone levels.</p>
        )}
      </div>

      {/* 2. Full Rank Journey Roadmap Below */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#F4F7F5]">Full Milestone Tier Journey</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANONICAL_RANKS.map((rank) => {
            const isCompleted =
              rankProgress.qualifyingSales >= rank.requiredSales &&
              rankProgress.qualifyingCommunity >= rank.requiredCommunity;
            const isCurrent = user.currentRankSlug === rank.slug;
            const isNext = rankProgress.nextRank?.slug === rank.slug;
            const isTopTier = rank.order === 4;

            return (
              <div
                key={rank.slug}
                className={`funding-card p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? 'border-[#34D399] shadow-[0_0_25px_rgba(52,211,153,0.15)] ring-1 ring-[#34D399]/40'
                    : isTopTier
                    ? 'border-[#D9C08A] shadow-[0_0_25px_rgba(217,192,138,0.15)] ring-1 ring-[#D9C08A]/40'
                    : isCompleted
                    ? 'border-white/10 opacity-90'
                    : 'border-white/[0.08]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isTopTier
                        ? 'bg-[#D9C08A]/15 text-[#D9C08A] border-[#D9C08A]/30 font-bold'
                        : isCurrent
                        ? 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30 font-semibold'
                        : 'bg-white/[0.04] text-[#9EABA2] border-white/10'
                    }`}>
                      Level 0{rank.order} {isTopTier && '★'}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center text-[10px] font-mono text-[#34D399] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle size={12} weight="fill" className="mr-1" /> Achieved
                      </span>
                    ) : isNext ? (
                      <span className="text-[10px] font-mono text-[#34D399] bg-white/[0.04] px-2 py-0.5 rounded-full border border-[#34D399]/40 font-semibold">
                        Current Goal
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#9EABA2] flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>

                  <h4 className={`font-serif font-bold text-base ${
                    isTopTier ? 'text-[#D9C08A]' : 'text-[#F4F7F5]'
                  }`}>{rank.name}</h4>
                  <p className="text-xs text-[#9EABA2] line-clamp-2">{rank.tagline}</p>
                </div>

                <div className="pt-3 border-t border-white/[0.08] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#9EABA2]">
                    <span>Required Sales:</span>
                    <span className="text-[#F4F7F5] font-bold">{rank.requiredSales} Units</span>
                  </div>
                  <div className="flex justify-between text-[#9EABA2]">
                    <span>Required Team:</span>
                    <span className="text-[#F4F7F5] font-bold">{rank.requiredCommunity} Members</span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.08] flex justify-between font-bold text-[#D9C08A]">
                    <span>Cash Reward:</span>
                    <span>PKR {rank.rewardAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Milestone Achievement History Ledger */}
      <div className="funding-card p-6 space-y-4">
        <h3 className="font-serif text-base font-bold text-[#F4F7F5]">Milestone Achievement Ledger</h3>
        {rankHistory.length === 0 ? (
          <p className="text-xs text-[#9EABA2] py-4 text-center font-mono">
            No historical milestone rewards claimed yet.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.08] text-xs">
            {rankHistory.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-[#F4F7F5] font-semibold uppercase font-mono">{h.newRankSlug} Level Unlocked</p>
                  <p className="text-[10px] text-[#9EABA2] font-mono">Achieved: {new Date(h.achievedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#D9C08A] font-bold font-mono">+PKR {h.rewardAmountIssued.toLocaleString()}</span>
                  <span className="text-[9.5px] text-[#9EABA2] block font-mono">Disbursed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

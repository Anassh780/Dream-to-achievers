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
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Page Header */}
      <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Partner Hub</span>
          <span>/</span>
          <span>Level Progression</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
          Partner Level Progression &amp; Roadmap
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Review qualification criteria and live progress across all 4 partner milestone tiers.
        </p>
      </div>

      {/* 1. Primary Current-Rank Status Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3DCC8]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#1F4D3E] font-semibold tracking-wider block">
              Active Milestone Level
            </span>
            <div className="flex items-center space-x-3">
              <h2 className="font-serif text-2xl font-medium text-[#1E241F]">
                {rankProgress.currentRank.name}
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]">
                Tier {rankProgress.currentRank.order || 1}
              </span>
            </div>
          </div>

          {rankProgress.nextRank ? (
            <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-xs font-mono flex items-center space-x-3">
              <div>
                <span className="text-[10px] text-[#5B5C50] block">Next Goal:</span>
                <span className="font-bold text-[#1E241F]">{rankProgress.nextRank.name}</span>
              </div>
              <div className="border-l border-[#E3DCC8] pl-3">
                <span className="text-[10px] text-[#5B5C50] block">Bonus:</span>
                <span className="font-bold text-[#B8862E]">+PKR {rankProgress.nextRank.rewardAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-[#F1ECDD] text-[#1F4D3E] text-xs font-mono border border-[#E3DCC8]">
              Level 04 Pinnacle Completed
            </div>
          )}
        </div>

        {/* Primary Dual Progress Bars */}
        {rankProgress.nextRank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sales Bar */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-medium">Personal Product Orders</span>
                <span className="text-[#1E241F] font-mono font-bold">
                  {rankProgress.qualifyingSales} / {rankProgress.nextRank.requiredSales} units ({rankProgress.salesProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3DCC8] overflow-hidden">
                <div
                  className="h-full bg-[#1F4D3E] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.salesProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#5B5C50] font-mono">
                <span>{rankProgress.salesProgressPercent}% Qualified</span>
                <span>{rankProgress.missingSales > 0 ? `${rankProgress.missingSales} sales remaining` : 'Complete'}</span>
              </div>
            </div>

            {/* Community Bar */}
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1E241F] font-medium">Partner Team Network</span>
                <span className="text-[#1E241F] font-mono font-bold">
                  {rankProgress.qualifyingCommunity} / {rankProgress.nextRank.requiredCommunity} members ({rankProgress.communityProgressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E3DCC8] overflow-hidden">
                <div
                  className="h-full bg-[#1F4D3E] rounded-full transition-all duration-300"
                  style={{ width: `${rankProgress.communityProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#5B5C50] font-mono">
                <span>{rankProgress.communityProgressPercent}% Qualified</span>
                <span>{rankProgress.missingCommunity > 0 ? `${rankProgress.missingCommunity} members remaining` : 'Complete'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#5B5C50] font-mono">You have unlocked all milestone levels.</p>
        )}
      </div>

      {/* 2. Full Rank Journey Roadmap Below */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-[#1E241F]">Full Milestone Tier Journey</h3>
        
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
                className={`p-5 rounded-xl bg-white border transition-colors flex flex-col justify-between space-y-4 shadow-xs ${
                  isCurrent
                    ? 'border-[#1F4D3E] ring-2 ring-[#1F4D3E]/30 dark:ring-[#48C79B]/30'
                    : isTopTier
                    ? 'border-[#B8862E] dark:border-[#E2B258] ring-1 ring-[#B8862E]/20 dark:ring-[#E2B258]/20'
                    : isCompleted
                    ? 'border-[#E3DCC8] bg-[#FAF7EF]/50'
                    : 'border-[#E3DCC8]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isTopTier
                        ? 'bg-[#1F4D3E] text-white dark:bg-[#276E57] border-[#1F4D3E]'
                        : 'bg-[#FAF7EF] text-[#5B5C50] border-[#E3DCC8]'
                    }`}>
                      Level 0{rank.order} {isTopTier && '★'}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center text-[10px] font-mono text-[#1F4D3E] font-semibold bg-[#F1ECDD] px-2 py-0.5 rounded border border-[#E3DCC8]">
                        <CheckCircle size={12} weight="fill" className="mr-1" /> Achieved
                      </span>
                    ) : isNext ? (
                      <span className="text-[10px] font-mono text-[#1F4D3E] bg-[#F1ECDD] px-2 py-0.5 rounded border border-[#E3DCC8] font-semibold">
                        Current Goal
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#7C7D70] flex items-center gap-1">
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>

                  <h4 className={`font-serif font-medium text-base ${
                    isTopTier ? 'text-[#B8862E] dark:text-[#E2B258]' : 'text-[#1E241F]'
                  }`}>{rank.name}</h4>
                  <p className="text-xs text-[#5B5C50] line-clamp-2">{rank.tagline}</p>
                </div>

                <div className="pt-3 border-t border-[#E3DCC8] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Required Sales:</span>
                    <span className="text-[#1E241F] font-bold">{rank.requiredSales} Units</span>
                  </div>
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Required Team:</span>
                    <span className="text-[#1E241F] font-bold">{rank.requiredCommunity} Members</span>
                  </div>
                  <div className="pt-2 border-t border-[#E3DCC8] flex justify-between font-bold text-[#B8862E]">
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
      <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
        <h3 className="font-serif text-base font-medium text-[#1E241F]">Milestone Achievement Ledger</h3>
        {rankHistory.length === 0 ? (
          <p className="text-xs text-[#5B5C50] py-3 text-center font-mono">
            No historical milestone rewards claimed yet.
          </p>
        ) : (
          <div className="divide-y divide-[#E3DCC8] text-xs">
            {rankHistory.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[#1E241F] font-medium uppercase font-mono">{h.newRankSlug} Level Unlocked</p>
                  <p className="text-[10px] text-[#5B5C50] font-mono">Achieved: {new Date(h.achievedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#B8862E] font-semibold font-mono">+PKR {h.rewardAmountIssued.toLocaleString()}</span>
                  <span className="text-[9.5px] text-[#7C7D70] block font-mono">Disbursed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

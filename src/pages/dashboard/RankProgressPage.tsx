import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { CANONICAL_RANKS } from '@/config/ranks';
import { storage } from '@/services/storage';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Lock } from '@phosphor-icons/react';

export const RankProgressPage: React.FC = () => {
  const { user, rankProgress } = useAuth();

  if (!user || !rankProgress) return null;

  const rankHistory = storage.get<any[]>('RANK_HISTORY', []).filter((h) => h.userId === user.id);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Rank Center</span>
          <span>•</span>
          <span>Milestone Roadmap</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Rank Progression & Milestones
        </h1>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          Review your qualification status across all 4 milestone tiers from Silver to Diamond.
        </p>
      </div>

      {/* 4 Tier Comprehensive Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CANONICAL_RANKS.map((rank) => {
          const isCompleted =
            rankProgress.qualifyingSales >= rank.requiredSales &&
            rankProgress.qualifyingCommunity >= rank.requiredCommunity;
          const isCurrent = user.currentRankSlug === rank.slug;
          const isNext = rankProgress.nextRank?.slug === rank.slug;

          const salesPct = Math.min(Math.round((rankProgress.qualifyingSales / rank.requiredSales) * 100), 100);
          const commPct = Math.min(Math.round((rankProgress.qualifyingCommunity / rank.requiredCommunity) * 100), 100);

          return (
            <div
              key={rank.slug}
              className={`p-5 rounded-xl bg-[#111A27] border transition-colors space-y-4 ${
                isCurrent
                  ? 'border-[#3B82F6] bg-[#16202E]'
                  : isCompleted
                  ? 'border-white/[0.12]'
                  : 'border-white/[0.06] opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-[#8996A8]">
                  Tier {rank.order}
                </span>
                {isCompleted ? (
                  <span className="inline-flex items-center text-xs text-[#22C55E] font-medium">
                    <CheckCircle size={14} className="mr-1" /> Achieved
                  </span>
                ) : isNext ? (
                  <span className="text-xs text-[#60A5FA] font-medium bg-[#3B82F6]/10 px-2 py-0.5 rounded">
                    Next Goal
                  </span>
                ) : (
                  <span className="text-xs text-[#8996A8] flex items-center gap-1">
                    <Lock size={13} /> Locked
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">{rank.name}</h3>
                <p className="text-xs text-[#8996A8] mt-0.5">{rank.tagline}</p>
              </div>

              {/* Progress Bars for this specific rank */}
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#CBD5E1]">Product Sales</span>
                    <span className="text-white font-medium">
                      {rankProgress.qualifyingSales} / {rank.requiredSales} units ({salesPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#3B82F6] rounded-full"
                      style={{ width: `${salesPct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#CBD5E1]">Community Network</span>
                    <span className="text-white font-medium">
                      {rankProgress.qualifyingCommunity} / {rank.requiredCommunity} members ({commPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#3B82F6] rounded-full"
                      style={{ width: `${commPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reward */}
              <div className="p-3 rounded-lg bg-[#0D141F] border border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-[#8996A8]">Cash Milestone Reward:</span>
                <span className="text-sm font-semibold text-white">
                  PKR {rank.rewardAmount.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rank Achievement History */}
      <div className="p-5 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-3">
        <h3 className="font-semibold text-sm text-white">Milestone Achievement Ledger</h3>
        {rankHistory.length === 0 ? (
          <p className="text-xs text-[#8996A8] py-3 text-center">No historical milestone achievements recorded yet.</p>
        ) : (
          <div className="divide-y divide-white/[0.06] text-xs">
            {rankHistory.map((h) => (
              <div key={h.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium uppercase">{h.newRankSlug} Rank Unlocked</p>
                  <p className="text-[11px] text-[#8996A8]">Achieved on: {new Date(h.achievedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#22C55E] font-semibold">+PKR {h.rewardAmountIssued.toLocaleString()}</span>
                  <span className="text-[10px] text-[#8996A8] block">Bonus Generated</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

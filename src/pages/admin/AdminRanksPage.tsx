import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { RankDefinition } from '@/types';
import { CANONICAL_RANKS } from '@/config/ranks';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { Crown, Pencil, X } from '@phosphor-icons/react';

export const AdminRanksPage: React.FC = () => {
  const { success: toastSuccess } = useToast();
  const [ranks, setRanks] = useState<RankDefinition[]>(() => storage.get<RankDefinition[]>('RANKS', CANONICAL_RANKS));
  const [selectedRank, setSelectedRank] = useState<RankDefinition | null>(null);
  const [salesReq, setSalesReq] = useState<number>(0);
  const [commReq, setCommReq] = useState<number>(0);
  const [rewardAmt, setRewardAmt] = useState<number>(0);

  const handleEdit = (rank: RankDefinition) => {
    setSelectedRank(rank);
    setSalesReq(rank.requiredSales);
    setCommReq(rank.requiredCommunity);
    setRewardAmt(rank.rewardAmount);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRank) return;

    const updated = ranks.map((r) =>
      r.id === selectedRank.id
        ? {
            ...r,
            requiredSales: salesReq,
            requiredCommunity: commReq,
            rewardAmount: rewardAmt,
          }
        : r
    );

    storage.set('RANKS', updated);
    setRanks(updated);
    toastSuccess(`Milestone thresholds for ${selectedRank.name} updated successfully.`);
    setSelectedRank(null);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[var(--accent)]/25">
      <div className="space-y-1 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
          <span>Growth Engine</span>
          <span>/</span>
          <span>Rank Milestones</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
          Rank Levels &amp; Milestone Bonuses
        </h1>
        <p className="text-xs text-[var(--ink-soft)]">
          Configure sales volumes, active team size requirements, and cash bonuses for Level 01–04 partner promotions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ranks.map((rank) => (
          <div
            key={rank.id}
            className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-4 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--primary)] border border-[var(--line)]">
                  Level 0{rank.order}
                </span>
                <button
                  type="button"
                  onClick={() => handleEdit(rank)}
                  className="p-1 rounded text-[var(--ink-soft)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none cursor-pointer"
                  title={`Edit thresholds for ${rank.name}`}
                  aria-label={`Edit thresholds for ${rank.name}`}
                >
                  <Pencil size={14} />
                </button>
              </div>
              <h3 className="font-serif font-medium text-base text-[var(--ink)]">{rank.name}</h3>
              <p className="text-xs text-[var(--ink-soft)] line-clamp-2">{rank.tagline}</p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Required Sales:</span>
                <span className="text-[var(--ink)] font-bold">{rank.requiredSales} Units</span>
              </div>
              <div className="flex justify-between text-[var(--ink-soft)]">
                <span>Required Team:</span>
                <span className="text-[var(--ink)] font-bold">{rank.requiredCommunity} Members</span>
              </div>
              <div className="pt-1.5 border-t border-[var(--line)] flex justify-between font-bold text-[var(--accent)]">
                <span>Cash Bonus:</span>
                <span>PKR {rank.rewardAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Thresholds Modal */}
      {selectedRank && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6 rounded-t-3xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xl space-y-4 text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                Configure Level: {selectedRank.name}
              </h3>
              <button
                onClick={() => setSelectedRank(null)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] active:scale-[0.96] transition-transform"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Required Personal Sales (Units)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={salesReq}
                  onChange={(e) => setSalesReq(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Required Team Size (Members)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={commReq}
                  onChange={(e) => setCommReq(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Cash Reward Amount (PKR)</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  value={rewardAmt}
                  onChange={(e) => setRewardAmt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRank(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Thresholds
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

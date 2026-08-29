import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { RankDefinition } from '@/types';
import { CANONICAL_RANKS } from '@/config/ranks';
import { Button } from '@/components/ui/Button';
import { Crown, Pencil, X } from '@phosphor-icons/react';

export const AdminRanksPage: React.FC = () => {
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
    setSelectedRank(null);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="space-y-1 pb-4 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Growth Engine</span>
          <span>/</span>
          <span>Rank Milestones</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
          Rank Levels &amp; Milestone Bonuses
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Configure sales volumes, active team size requirements, and cash bonuses for Level 01–04 partner promotions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ranks.map((rank) => (
          <div
            key={rank.id}
            className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-4 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF7EF] text-[#1F4D3E] border border-[#E3DCC8]">
                  Level 0{rank.order}
                </span>
                <button
                  onClick={() => handleEdit(rank)}
                  className="p-1 rounded text-[#5B5C50] hover:text-[#1E241F] cursor-pointer"
                  title="Edit thresholds"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <h3 className="font-serif font-medium text-base text-[#1E241F]">{rank.name}</h3>
              <p className="text-xs text-[#5B5C50] line-clamp-2">{rank.tagline}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#5B5C50]">
                <span>Required Sales:</span>
                <span className="text-[#1E241F] font-bold">{rank.requiredSales} Units</span>
              </div>
              <div className="flex justify-between text-[#5B5C50]">
                <span>Required Team:</span>
                <span className="text-[#1E241F] font-bold">{rank.requiredCommunity} Members</span>
              </div>
              <div className="pt-1.5 border-t border-[#E3DCC8] flex justify-between font-bold text-[#B8862E]">
                <span>Cash Bonus:</span>
                <span>PKR {rank.rewardAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Thresholds Modal */}
      {selectedRank && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-[#E3DCC8] shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
              <h3 className="font-serif font-medium text-base text-[#1E241F]">
                Configure Level: {selectedRank.name}
              </h3>
              <button onClick={() => setSelectedRank(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Required Personal Sales (Units)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={salesReq}
                  onChange={(e) => setSalesReq(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Required Team Size (Members)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={commReq}
                  onChange={(e) => setCommReq(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Cash Reward Amount (PKR)</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  value={rewardAmt}
                  onChange={(e) => setRewardAmt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] font-mono focus:outline-none focus:border-[#1F4D3E]"
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

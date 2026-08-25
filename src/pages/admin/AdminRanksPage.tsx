import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { useAuth } from '@/context/AuthContext';
import { RankDefinition } from '@/types';
import { CANONICAL_RANKS } from '@/config/ranks';
import { Button } from '@/components/ui/Button';
import { Check, X } from '@phosphor-icons/react';

export const AdminRanksPage: React.FC = () => {
  const { user: currentAdmin, refreshUserData } = useAuth();
  const [ranks, setRanks] = useState<RankDefinition[]>(storage.get<RankDefinition[]>('RANKS', CANONICAL_RANKS));
  const [editingRank, setEditingRank] = useState<RankDefinition | null>(null);
  const [salesReq, setSalesReq] = useState(10);
  const [commReq, setCommReq] = useState(20);
  const [rewardAmt, setRewardAmt] = useState(2000);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRank || !currentAdmin) return;

    const updatedRanks = ranks.map((r) =>
      r.id === editingRank.id
        ? {
            ...r,
            requiredSales: salesReq,
            requiredCommunity: commReq,
            rewardAmount: rewardAmt,
          }
        : r
    );

    setRanks(updatedRanks);
    storage.set('RANKS', updatedRanks);

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'UPDATE_RANK_THRESHOLDS',
      entityType: 'rank',
      entityId: editingRank.id,
      details: `Updated ${editingRank.name} requirements: Sales=${salesReq}, Community=${commReq}, Reward=PKR ${rewardAmt}.`,
    });

    refreshUserData();
    setSavedMsg(`Thresholds for ${editingRank.name} updated successfully.`);
    setEditingRank(null);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Admin</span>
          <span>•</span>
          <span>Qualification Rules</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Rank Engine Thresholds
        </h1>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          Configure sales requirements, community targets, and cash rewards for each tier.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#4ADE80] text-xs flex items-center space-x-2">
          <Check size={16} weight="bold" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Ranks Thresholds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {ranks.map((rank) => (
          <div key={rank.id} className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-[#8996A8]">
                  Tier {rank.order}
                </span>
                <span className="text-[#22C55E] text-[11px]">Active</span>
              </div>
              <h3 className="font-semibold text-sm text-white">{rank.name}</h3>
              <p className="text-xs text-[#8996A8] leading-relaxed">{rank.tagline}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0D141F] border border-white/[0.04] space-y-1 text-xs">
              <div className="flex justify-between text-[#8996A8]">
                <span>Sales:</span>
                <span className="text-white font-medium">{rank.requiredSales} units</span>
              </div>
              <div className="flex justify-between text-[#8996A8]">
                <span>Community:</span>
                <span className="text-white font-medium">{rank.requiredCommunity} members</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-white/[0.06] pt-1">
                <span className="text-[#8996A8]">Reward:</span>
                <span className="text-white">PKR {rank.rewardAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                setEditingRank(rank);
                setSalesReq(rank.requiredSales);
                setCommReq(rank.requiredCommunity);
                setRewardAmt(rank.rewardAmount);
              }}
            >
              Edit Thresholds
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Rank Modal (Step 34) */}
      {editingRank && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111A27] border border-white/[0.12] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-semibold text-white">
                Edit Thresholds: {editingRank.name}
              </h3>
              <button onClick={() => setEditingRank(null)} className="text-[#8996A8] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveThresholds} className="space-y-3.5">
              <div>
                <label className="block text-[#CBD5E1] mb-1">Qualifying Sales Required</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={salesReq}
                  onChange={(e) => setSalesReq(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#CBD5E1] mb-1">Qualifying Members Required</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={commReq}
                  onChange={(e) => setCommReq(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[#CBD5E1] mb-1">Milestone Cash Reward (PKR)</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={rewardAmt}
                  onChange={(e) => setRewardAmt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0D141F] border border-white/10 text-white focus:outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button type="submit" variant="primary" size="md" className="flex-1 justify-center">
                  Save Thresholds
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={() => setEditingRank(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

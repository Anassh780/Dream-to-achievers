import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { rewardService } from '@/services/rewardService';

export const DashboardRewards: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const rewards = rewardService.getUserRewards(user.id);
  const totalEarned = rewardService.getTotalRewardsEarned(user.id);
  const paidTotal = rewards.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const pendingTotal = rewards.filter((r) => r.status !== 'paid' && r.status !== 'rejected').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Rewards</span>
          <span>•</span>
          <span>Rank Bonuses</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Milestone Cash Rewards
        </h1>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          One-time cash bonuses unlocked upon reaching Silver, Platinum, Gold, and Diamond tiers.
        </p>
      </div>

      {/* Reward Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Total Milestone Rewards</span>
          <span className={`text-2xl font-bold ${totalEarned > 0 ? 'text-[#F59E0B]' : 'text-white'}`}>
            PKR {totalEarned.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Disbursed / Paid</span>
          <span className={`text-2xl font-bold ${paidTotal > 0 ? 'text-[#22C55E]' : 'text-white'}`}>
            PKR {paidTotal.toLocaleString()}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-[#111A27] border border-white/[0.08]">
          <span className="text-xs text-[#8996A8] block">Under Review</span>
          <span className="text-2xl font-bold text-white">PKR {pendingTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Rewards Ledger Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="p-3.5 bg-[#0D141F] border-b border-white/[0.06]">
          <span className="font-semibold text-white">Reward Disbursement History</span>
        </div>

        {rewards.length === 0 ? (
          <div className="p-8 text-center text-[#8996A8]">
            No milestone rewards generated yet. Complete 10 sales & 20 community members to unlock Silver Rank (PKR 2,000).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
                <tr>
                  <th className="p-3.5 font-medium">Reward ID</th>
                  <th className="p-3.5 font-medium">Milestone Tier</th>
                  <th className="p-3.5 font-medium text-right">Amount</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium">Reference / Note</th>
                  <th className="p-3.5 font-medium text-right">Date Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
                {rewards.map((rew) => (
                  <tr key={rew.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-mono text-[#8996A8]">{rew.id}</td>
                    <td className="p-3.5 font-medium text-white">{rew.rankName}</td>
                    <td className="p-3.5 text-right font-semibold text-white">
                      PKR {rew.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-medium capitalize px-2 py-0.5 rounded ${
                          rew.status === 'paid'
                            ? 'bg-[#22C55E]/10 text-[#4ADE80] border border-[#22C55E]/20'
                            : rew.status === 'approved'
                            ? 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {rew.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#8996A8] text-[11px]">
                      {rew.transactionReference || rew.adminNote || 'Queued for processing'}
                    </td>
                    <td className="p-3.5 text-right text-[#8996A8]">
                      {new Date(rew.earnedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

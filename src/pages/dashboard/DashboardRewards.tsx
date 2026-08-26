import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { rewardService } from '@/services/rewardService';
import { Gift } from '@phosphor-icons/react';

export const DashboardRewards: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const rewards = rewardService.getUserRewards(user.id);
  const totalEarned = rewardService.getTotalRewardsEarned(user.id);
  const paidTotal = rewards.filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
  const pendingTotal = rewards.filter((r) => r.status !== 'paid' && r.status !== 'rejected').reduce((sum, r) => sum + r.amount, 0);

  const statusStyles: Record<string, string> = {
    paid: 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]',
    approved: 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]',
    pending_review: 'bg-[#EFE2C4] text-[#B8862E] border-[#B8862E]/30',
    earned: 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Financials</span>
          <span>/</span>
          <span>Level Milestone Rewards</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
          Milestone Cash Rewards Ledger
        </h1>
        <p className="text-xs text-[#5B5C50]">
          One-time cash bonuses unlocked upon reaching Level 01, Level 02, Level 03, and Level 04 thresholds.
        </p>
      </div>

      {/* Accounting Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Total Milestone Rewards</span>
          <span className="text-2xl font-bold font-mono text-[#1E241F]">
            PKR {totalEarned.toLocaleString()}
          </span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Disbursed / Paid</span>
          <span className="text-2xl font-bold font-mono text-[#1F4D3E]">
            PKR {paidTotal.toLocaleString()}
          </span>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
          <span className="text-xs text-[#5B5C50] font-mono block">Pending Review / Processing</span>
          <span className="text-2xl font-bold font-mono text-[#B8862E]">
            PKR {pendingTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Financial Rewards Ledger Table */}
      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between">
          <span className="font-semibold text-[#1E241F] font-mono text-xs">Reward Disbursement Ledger</span>
          <span className="text-[10px] font-mono text-[#5B5C50]">{rewards.length} Records</span>
        </div>

        {rewards.length === 0 ? (
          <div className="p-10 text-center text-[#5B5C50] space-y-2">
            <Gift size={28} className="text-[#7C7D70] mx-auto" />
            <p className="font-medium text-[#1E241F]">No milestone rewards generated yet</p>
            <p className="text-xs max-w-sm mx-auto text-[#7C7D70]">
              Complete 10 personal sales &amp; 20 community referrals to unlock Level 01 (PKR 2,000 bonus).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Reward ID</th>
                  <th className="p-3.5 font-medium">Milestone Tier</th>
                  <th className="p-3.5 font-medium text-right">Amount (PKR)</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium">Reference / Note</th>
                  <th className="p-3.5 font-medium text-right">Earned Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50] font-sans">
                {rewards.map((rew) => (
                  <tr key={rew.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#5B5C50]">{rew.id}</td>
                    <td className="p-3.5 font-serif font-semibold text-[#1E241F]">{rew.rankName}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#B8862E]">
                      PKR {rew.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border ${
                          statusStyles[rew.status] || 'bg-[#FAF7EF] text-[#5B5C50]'
                        }`}
                      >
                        {rew.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#5B5C50] text-xs font-mono">
                      {rew.transactionReference || rew.adminNote || 'Queued for operations disbursement'}
                    </td>
                    <td className="p-3.5 text-right text-[#5B5C50] font-mono">
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

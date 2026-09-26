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
    paid: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
    approved: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
    pending_review: 'bg-[#D9C08A]/15 text-[#D9C08A] border-[#D9C08A]/30',
    earned: 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30',
    rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#D9C08A]/25">
      
      {/* Header */}
      <div className="space-y-1 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
          <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#D9C08A] border-[#D9C08A]/30">Financials</span>
          <span>/</span>
          <span>Level Milestone Rewards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight">
          Milestone Cash Rewards Ledger
        </h1>
        <p className="text-xs text-[#9EABA2]">
          One-time cash bonuses unlocked upon reaching Level 01, Level 02, Level 03, and Level 04 thresholds.
        </p>
      </div>

      {/* Accounting Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group">
          <span className="text-xs text-[#9EABA2] font-mono block">Total Milestone Rewards</span>
          <span className="text-2xl font-bold font-mono text-[#F4F7F5] block">
            PKR {totalEarned.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-[#9EABA2] block">Accumulated earnings</span>
        </div>
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#34D399]/30 hover:border-[#34D399]/50">
          <span className="text-xs text-[#34D399] font-mono font-medium block">Disbursed / Paid</span>
          <span className="text-2xl font-bold font-mono text-[#34D399] block">
            PKR {paidTotal.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-[#9EABA2] block">Transferred to partner</span>
        </div>
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#D9C08A]/30 hover:border-[#D9C08A]/50">
          <span className="text-xs text-[#D9C08A] font-mono font-medium block">Pending Review / Processing</span>
          <span className="text-2xl font-bold font-mono text-[#D9C08A] block">
            PKR {pendingTotal.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-[#9EABA2] block">Queued in operations</span>
        </div>
      </div>

      {/* Financial Rewards Ledger Table */}
      <div className="funding-table-wrap text-xs shadow-xl">
        <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
          <span className="font-semibold text-[#F4F7F5] font-mono text-xs">Reward Disbursement Ledger</span>
          <span className="text-[10px] font-mono text-[#9EABA2]">{rewards.length} Records</span>
        </div>

        {rewards.length === 0 ? (
          <div className="p-10 text-center text-[#9EABA2] space-y-2">
            <Gift size={32} className="text-[#9EABA2]/60 mx-auto" />
            <p className="font-serif font-bold text-base text-[#F4F7F5]">No milestone rewards generated yet</p>
            <p className="text-xs max-w-sm mx-auto text-[#9EABA2]">
              Complete 10 personal sales &amp; 20 community referrals to unlock Level 01 (PKR 2,000 bonus).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
            <table className="w-full min-w-[850px] text-left font-sans border-collapse">
              <thead className="border-b border-white/[0.08] text-[#9EABA2] font-mono text-[10px] bg-white/[0.02]">
                <tr>
                  <th className="p-3.5 font-medium whitespace-nowrap min-w-[130px]">Reward ID</th>
                  <th className="p-3.5 font-medium whitespace-nowrap min-w-[150px]">Milestone Tier</th>
                  <th className="p-3.5 font-medium text-right whitespace-nowrap min-w-[120px]">Amount (PKR)</th>
                  <th className="p-3.5 font-medium text-center whitespace-nowrap min-w-[110px]">Status</th>
                  <th className="p-3.5 font-medium whitespace-nowrap min-w-[200px]">Reference / Note</th>
                  <th className="p-3.5 font-medium text-right whitespace-nowrap min-w-[120px]">Earned Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-[#9EABA2] font-sans">
                {rewards.map((rew) => (
                  <tr key={rew.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3.5 font-mono text-[#9EABA2] whitespace-nowrap min-w-[130px]">{rew.id}</td>
                    <td className="p-3.5 font-serif font-semibold text-[#F4F7F5] whitespace-nowrap min-w-[150px]">{rew.rankName}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#D9C08A] whitespace-nowrap min-w-[120px]">
                      PKR {rew.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap min-w-[110px]">
                      <span
                        className={`inline-block text-[10px] font-mono font-semibold capitalize px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                          statusStyles[rew.status] || 'bg-white/[0.04] text-[#9EABA2]'
                        }`}
                      >
                        {rew.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#9EABA2] text-xs font-mono whitespace-nowrap min-w-[200px]">
                      {rew.transactionReference || rew.adminNote || 'Queued for operations disbursement'}
                    </td>
                    <td className="p-3.5 text-right text-[#9EABA2] font-mono whitespace-nowrap min-w-[120px]">
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

export default DashboardRewards;

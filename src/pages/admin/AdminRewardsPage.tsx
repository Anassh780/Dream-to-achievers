import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { rewardService } from '@/services/rewardService';
import { useAuth } from '@/context/AuthContext';
import { Reward, RewardStatus, User } from '@/types';

export const AdminRewardsPage: React.FC = () => {
  const { user: currentAdmin, refreshUserData } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>(rewardService.getAllAdminRewards());
  const users = storage.get<User[]>('USERS', []);

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.fullName || userId;
  };

  const handleUpdateStatus = (rewardId: string, status: RewardStatus) => {
    if (!currentAdmin) return;
    const ref = status === 'paid' ? `TRX-DTA-${Date.now().toString().slice(-6)}` : undefined;

    rewardService.updateRewardStatus({
      rewardId,
      status,
      transactionReference: ref,
      adminNote: `Status updated to ${status} by Administrator ${currentAdmin.fullName}.`,
    });

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'UPDATE_REWARD_STATUS',
      entityType: 'reward',
      entityId: rewardId,
      details: `Disbursement status for reward #${rewardId} changed to ${status}.`,
    });

    setRewards(rewardService.getAllAdminRewards());
    refreshUserData();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
          <span>Admin</span>
          <span>•</span>
          <span>Payout Approvals</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
          Milestone Cash Disbursements
        </h1>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111A27] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-white/[0.06] text-[#8996A8] text-[11px]">
              <tr>
                <th className="p-3.5 font-medium">Reward ID</th>
                <th className="p-3.5 font-medium">Partner Name</th>
                <th className="p-3.5 font-medium">Milestone</th>
                <th className="p-3.5 font-medium text-right">Amount</th>
                <th className="p-3.5 font-medium text-center">Status</th>
                <th className="p-3.5 font-medium">Disbursement Ref</th>
                <th className="p-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#CBD5E1]">
              {rewards.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="p-3.5 font-mono text-[#8996A8]">{r.id}</td>
                  <td className="p-3.5 font-medium text-white">{getUserName(r.userId)}</td>
                  <td className="p-3.5 text-[#CBD5E1]">{r.rankName}</td>
                  <td className="p-3.5 text-right font-semibold text-white">
                    PKR {r.amount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-medium capitalize px-2 py-0.5 rounded ${
                        r.status === 'paid'
                          ? 'bg-[#22C55E]/10 text-[#4ADE80]'
                          : r.status === 'approved'
                          ? 'bg-[#3B82F6]/10 text-[#60A5FA]'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-[#8996A8] text-[11px]">
                    {r.transactionReference || r.adminNote || 'Awaiting action'}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    {r.status === 'pending_review' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="px-2 py-1 rounded bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#60A5FA] text-[10px] cursor-pointer font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {r.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'paid')}
                        className="px-2 py-1 rounded bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#4ADE80] text-[10px] cursor-pointer font-medium"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {r.status === 'paid' && (
                      <span className="text-[11px] text-[#22C55E] font-medium">Disbursed ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

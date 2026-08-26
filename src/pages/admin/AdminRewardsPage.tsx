import React, { useState } from 'react';
import { storage } from '@/services/storage';
import { rewardService } from '@/services/rewardService';
import { Reward, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Gift, X } from '@phosphor-icons/react';

export const AdminRewardsPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>(() => storage.get<Reward[]>('REWARDS', []));
  const [users] = useState<User[]>(() => storage.get<User[]>('USERS', []));
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [refText, setRefText] = useState('');

  const refreshRewards = () => {
    setRewards(storage.get<Reward[]>('REWARDS', []));
  };

  const getUserName = (userId: string) => {
    const u = users.find((item) => item.id === userId);
    return u ? u.fullName : userId;
  };

  const getUserEmail = (userId: string) => {
    const u = users.find((item) => item.id === userId);
    return u ? u.email : '';
  };

  const handleApprove = (reward: Reward) => {
    rewardService.updateRewardStatus({
      rewardId: reward.id,
      status: 'approved',
      adminNote: 'Approved by administrator',
    });
    refreshRewards();
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward || !refText) return;

    rewardService.updateRewardStatus({
      rewardId: selectedReward.id,
      status: 'paid',
      adminNote: 'Disbursed',
      transactionReference: refText,
    });
    setSelectedReward(null);
    setRefText('');
    refreshRewards();
  };

  const handleReject = (reward: Reward) => {
    rewardService.updateRewardStatus({
      rewardId: reward.id,
      status: 'rejected',
      adminNote: 'Verification failed or duplicate account',
    });
    refreshRewards();
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="space-y-1 pb-4 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Financials</span>
          <span>/</span>
          <span>Rewards Approval</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
          Milestone Cash Reward Disbursements
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Review and approve milestone cash bonuses achieved upon qualifying Level 01–04 requirements.
        </p>
      </div>

      <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
        <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
          <span className="font-semibold text-[#1E241F]">Milestone Rewards Queue</span>
          <span className="text-[10px] text-[#5B5C50]">{rewards.length} Total Claims</span>
        </div>

        {rewards.length === 0 ? (
          <div className="p-12 text-center text-[#5B5C50] space-y-2">
            <Gift size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No milestone rewards submitted</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                <tr>
                  <th className="p-3.5 font-medium">Claim ID</th>
                  <th className="p-3.5 font-medium">Partner</th>
                  <th className="p-3.5 font-medium">Level</th>
                  <th className="p-3.5 font-medium text-right">Bonus Amount</th>
                  <th className="p-3.5 font-medium text-center">Status</th>
                  <th className="p-3.5 font-medium">Payment Reference</th>
                  <th className="p-3.5 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                {rewards.map((rew) => (
                  <tr key={rew.id} className="hover:bg-[#FAF7EF] transition-colors">
                    <td className="p-3.5 font-mono text-[#7C7D70]">{rew.id}</td>
                    <td className="p-3.5">
                      <p className="font-serif font-semibold text-[#1E241F]">{getUserName(rew.userId)}</p>
                      <p className="text-[10px] font-mono text-[#7C7D70]">{getUserEmail(rew.userId)}</p>
                    </td>
                    <td className="p-3.5 font-serif font-medium text-[#1E241F]">{rew.rankName}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#B8862E]">
                      PKR {rew.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border ${
                          rew.status === 'paid'
                            ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                            : rew.status === 'pending_review'
                            ? 'bg-[#EFE2C4] text-[#B8862E] border-[#B8862E]/30'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {rew.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] font-mono text-[#5B5C50]">
                      {rew.transactionReference || rew.adminNote || 'Pending'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {rew.status === 'pending_review' && (
                          <button
                            onClick={() => handleApprove(rew)}
                            className="px-2 py-1 rounded bg-[#F1ECDD] text-[#1F4D3E] hover:bg-[#EAE4D2] border border-[#E3DCC8] text-[11px] font-mono"
                          >
                            Approve
                          </button>
                        )}
                        {rew.status === 'approved' && (
                          <button
                            onClick={() => setSelectedReward(rew)}
                            className="px-2 py-1 rounded bg-[#1F4D3E] text-white hover:bg-[#153A2E] text-[11px] font-mono font-medium"
                          >
                            Mark Paid
                          </button>
                        )}
                        {rew.status !== 'rejected' && rew.status !== 'paid' && (
                          <button
                            onClick={() => handleReject(rew)}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-mono"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-sm w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
              <h3 className="font-serif font-medium text-base text-[#1E241F]">Record Bonus Disbursement</h3>
              <button onClick={() => setSelectedReward(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePay} className="space-y-3">
              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Disbursement Reference / Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={refText}
                  onChange={(e) => setRefText(e.target.value)}
                  placeholder="e.g. Bank Transfer Ref / JazzCash 94829"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReward(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

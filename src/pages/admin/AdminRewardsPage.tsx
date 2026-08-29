import React, { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { rewardService } from '@/services/rewardService';
import { payoutService } from '@/services/payoutService';
import { Reward, WithdrawalRequest, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Gift, HandCoins, X, Check, CheckCircle, Bank, DeviceMobile, WhatsappLogo } from '@phosphor-icons/react';

export const AdminRewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'rewards'>('withdrawals');

  const [rewards, setRewards] = useState<Reward[]>(() => storage.get<Reward[]>('REWARDS', []));
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => payoutService.getAllWithdrawals());
  const [users, setUsers] = useState<User[]>(() => storage.get<User[]>('USERS', []));

  // Milestone reward modal state
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [rewardRefText, setRewardRefText] = useState('');

  // Profit withdrawal modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [withdrawalRefText, setWithdrawalRefText] = useState('');
  const [withdrawalAdminNote, setWithdrawalAdminNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const refreshData = () => {
    setRewards(storage.get<Reward[]>('REWARDS', []));
    setWithdrawals(payoutService.getAllWithdrawals());
    setUsers(storage.get<User[]>('USERS', []));
  };

  useEffect(() => {
    refreshData();
    const handleStorage = () => refreshData();
    window.addEventListener('dta_storage_change', handleStorage);
    return () => window.removeEventListener('dta_storage_change', handleStorage);
  }, []);

  const getUser = (userId: string) => {
    return users.find((item) => item.id === userId);
  };

  // Milestone Reward Actions
  const handleApproveReward = (reward: Reward) => {
    rewardService.updateRewardStatus({
      rewardId: reward.id,
      status: 'approved',
      adminNote: 'Approved by administrator',
    });
    refreshData();
  };

  const handlePayReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReward || !rewardRefText) return;

    rewardService.updateRewardStatus({
      rewardId: selectedReward.id,
      status: 'paid',
      adminNote: 'Disbursed',
      transactionReference: rewardRefText,
    });
    setSelectedReward(null);
    setRewardRefText('');
    refreshData();
  };

  const handleRejectReward = (reward: Reward) => {
    rewardService.updateRewardStatus({
      rewardId: reward.id,
      status: 'rejected',
      adminNote: 'Verification failed or duplicate account',
    });
    refreshData();
  };

  // Profit Withdrawal Actions
  const handleApproveWithdrawal = async (w: WithdrawalRequest) => {
    await payoutService.updateWithdrawalStatus({
      requestId: w.id,
      status: 'approved',
      adminNote: 'Approved for disbursement',
    });
    refreshData();
    setActionSuccessMsg(`Withdrawal ${w.id} approved.`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handlePayWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal || !withdrawalRefText) return;

    await payoutService.updateWithdrawalStatus({
      requestId: selectedWithdrawal.id,
      status: 'paid',
      transactionReference: withdrawalRefText,
      adminNote: withdrawalAdminNote || 'Manual transfer completed',
    });

    setSelectedWithdrawal(null);
    setWithdrawalRefText('');
    setWithdrawalAdminNote('');
    refreshData();
    setActionSuccessMsg('Payout marked as Paid & user notified.');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  const handleRejectWithdrawal = async (w: WithdrawalRequest) => {
    const reason = prompt('Please enter reason for rejecting this payout request:', 'Account details mismatch');
    if (reason === null) return;

    await payoutService.updateWithdrawalStatus({
      requestId: w.id,
      status: 'rejected',
      adminNote: reason || 'Rejected by administrator',
    });
    refreshData();
  };

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const pendingRewardsCount = rewards.filter((r) => r.status === 'pending_review').length;

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[#E3DCC8]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
          <span>Financials</span>
          <span>/</span>
          <span>Payouts &amp; Milestone Disbursements</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1E241F]">
          Platform Disbursements &amp; Profit Payouts
        </h1>
        <p className="text-xs text-[#5B5C50]">
          Process reseller profit margin withdrawals and milestone rank cash bonus disbursements.
        </p>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle size={16} weight="fill" />
          <span className="font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-[#E3DCC8] pb-1">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-[5px] flex items-center space-x-2 ${
            activeTab === 'withdrawals'
              ? 'border-[#1F4D3E] text-[#1F4D3E]'
              : 'border-transparent text-[#5B5C50] hover:text-[#1E241F]'
          }`}
        >
          <HandCoins size={14} />
          <span>Seller Profit Withdrawals ({withdrawals.length})</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {pendingWithdrawalsCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-[5px] flex items-center space-x-2 ${
            activeTab === 'rewards'
              ? 'border-[#1F4D3E] text-[#1F4D3E]'
              : 'border-transparent text-[#5B5C50] hover:text-[#1E241F]'
          }`}
        >
          <Gift size={14} />
          <span>Milestone Level Bonuses ({rewards.length})</span>
          {pendingRewardsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {pendingRewardsCount} new
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Seller Profit Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="rounded-xl border border-[#E3DCC8] bg-white overflow-hidden text-xs shadow-xs">
          <div className="p-3.5 bg-[#F1ECDD] border-b border-[#E3DCC8] flex items-center justify-between font-mono">
            <span className="font-semibold text-[#1E241F]">Seller Profit Withdrawal Claims</span>
            <span className="text-[10px] text-[#5B5C50]">{withdrawals.length} Total Claims</span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-12 text-center text-[#5B5C50] space-y-2">
              <HandCoins size={32} className="text-[#7C7D70] mx-auto" />
              <p className="font-serif font-medium text-base text-[#1E241F]">No profit withdrawal requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="border-b border-[#E3DCC8] text-[#5B5C50] font-mono text-[10px] bg-[#FAF7EF]">
                  <tr>
                    <th className="p-3.5 font-medium">Claim ID</th>
                    <th className="p-3.5 font-medium">Seller Partner</th>
                    <th className="p-3.5 font-medium">Payout Method / Bank</th>
                    <th className="p-3.5 font-medium text-right">Amount (PKR)</th>
                    <th className="p-3.5 font-medium text-center">Status</th>
                    <th className="p-3.5 font-medium">Disbursement Ref</th>
                    <th className="p-3.5 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCC8] text-[#5B5C50]">
                  {withdrawals.map((w) => {
                    const u = getUser(w.userId);

                    return (
                      <tr key={w.id} className="hover:bg-[#FAF7EF] transition-colors">
                        <td className="p-3.5 font-mono text-[#7C7D70]">{w.id}</td>
                        <td className="p-3.5">
                          <p className="font-serif font-semibold text-[#1E241F]">{w.userName || u?.fullName}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-[#7C7D70] font-mono">
                            {w.userPhone && (
                              <a
                                href={`https://wa.me/${w.userPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1F4D3E] flex items-center space-x-0.5 hover:underline"
                              >
                                <WhatsappLogo size={11} weight="fill" />
                                <span>{w.userPhone}</span>
                              </a>
                            )}
                            <span>{w.userEmail || u?.email}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="p-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] space-y-0.5 font-mono text-[11px]">
                            <span className="font-bold text-[#1E241F] block">{w.payoutMethod.bankName}</span>
                            <span className="text-[#5B5C50] block">Title: {w.payoutMethod.accountTitle}</span>
                            <span className="text-[#1F4D3E] font-bold block select-all">
                              No: {w.payoutMethod.accountNumber}
                            </span>
                            {w.payoutMethod.branchCity && (
                              <span className="text-[10px] text-[#7C7D70] block">City: {w.payoutMethod.branchCity}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-[#1F4D3E] text-sm">
                          PKR {w.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border ${
                              w.status === 'paid'
                                ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                                : w.status === 'approved'
                                ? 'bg-[#F1ECDD] text-[#1F4D3E] border-[#E3DCC8]'
                                : w.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-[#EFE2C4] text-[#B8862E] border-[#B8862E]/30'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] font-mono text-[#5B5C50]">
                          {w.transactionReference || w.adminNote || 'Pending'}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            {w.status === 'pending' && (
                              <button
                                onClick={() => handleApproveWithdrawal(w)}
                                className="px-2 py-1 rounded bg-[#F1ECDD] text-[#1F4D3E] hover:bg-[#EAE4D2] border border-[#E3DCC8] text-[11px] font-mono"
                              >
                                Approve
                              </button>
                            )}
                            {(w.status === 'pending' || w.status === 'approved') && (
                              <button
                                onClick={() => setSelectedWithdrawal(w)}
                                className="px-2 py-1 rounded bg-[#1F4D3E] text-white hover:bg-[#153A2E] text-[11px] font-mono font-medium"
                              >
                                Mark Paid
                              </button>
                            )}
                            {w.status !== 'rejected' && w.status !== 'paid' && (
                              <button
                                onClick={() => handleRejectWithdrawal(w)}
                                className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-mono"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Milestone Level Bonuses */}
      {activeTab === 'rewards' && (
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
                  {rewards.map((rew) => {
                    const u = getUser(rew.userId);

                    return (
                      <tr key={rew.id} className="hover:bg-[#FAF7EF] transition-colors">
                        <td className="p-3.5 font-mono text-[#7C7D70]">{rew.id}</td>
                        <td className="p-3.5">
                          <p className="font-serif font-semibold text-[#1E241F]">{u?.fullName || rew.userId}</p>
                          <p className="text-[10px] font-mono text-[#7C7D70]">{u?.email || ''}</p>
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
                                onClick={() => handleApproveReward(rew)}
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
                                onClick={() => handleRejectReward(rew)}
                                className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-mono"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Mark Milestone Bonus Paid */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-sm w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
              <h3 className="font-serif font-medium text-base text-[#1E241F]">Record Bonus Disbursement</h3>
              <button onClick={() => setSelectedReward(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePayReward} className="space-y-3">
              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Disbursement Reference / Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={rewardRefText}
                  onChange={(e) => setRewardRefText(e.target.value)}
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

      {/* Modal 2: Mark Seller Profit Withdrawal Paid */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-md w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Disburse Profit Withdrawal
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Amount: <span className="font-bold text-[#1F4D3E]">PKR {selectedWithdrawal.amount.toLocaleString()}</span>
                </p>
              </div>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-[#5B5C50] hover:text-[#1E241F]">
                <X size={16} />
              </button>
            </div>

            {/* Destination Payout Account Info */}
            <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-[#5B5C50] uppercase font-bold block">
                Target Receiving Account:
              </span>
              <div className="flex justify-between text-[#1E241F]">
                <span>Bank / Wallet:</span>
                <span className="font-bold">{selectedWithdrawal.payoutMethod.bankName}</span>
              </div>
              <div className="flex justify-between text-[#1E241F]">
                <span>Account Title:</span>
                <span className="font-medium">{selectedWithdrawal.payoutMethod.accountTitle}</span>
              </div>
              <div className="flex justify-between text-[#1F4D3E]">
                <span>Account / IBAN:</span>
                <span className="font-bold select-all">{selectedWithdrawal.payoutMethod.accountNumber}</span>
              </div>
            </div>

            <form onSubmit={handlePayWithdrawal} className="space-y-3">
              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">
                  Bank / JazzCash / EasyPaisa Transaction Reference *
                </label>
                <input
                  type="text"
                  required
                  value={withdrawalRefText}
                  onChange={(e) => setWithdrawalRefText(e.target.value)}
                  placeholder="e.g. IBFT-98429402 or EasyPaisa TRX 982189"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">
                  Disbursement Note for Seller (Optional)
                </label>
                <input
                  type="text"
                  value={withdrawalAdminNote}
                  onChange={(e) => setWithdrawalAdminNote(e.target.value)}
                  placeholder="e.g. Transferred from Meezan Bank business account"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E3DCC8]">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedWithdrawal(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Confirm Disbursed &amp; Notify Seller
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


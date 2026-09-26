import React, { useState, useEffect } from 'react';
import { storage } from '@/services/storage';
import { rewardService } from '@/services/rewardService';
import { payoutService } from '@/services/payoutService';
import { notificationService } from '@/services/notificationService';
import { Reward, WithdrawalRequest, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { Gift, HandCoins, X, Check, CheckCircle, Bank, DeviceMobile, WhatsappLogo } from '@phosphor-icons/react';

export const AdminRewardsPage: React.FC = () => {
  const { success: toastSuccess, error: toastError } = useToast();
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
  const [withdrawalProofSlip, setWithdrawalProofSlip] = useState<string>('');
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

  const handleWithdrawalProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toastError('Proof slip must be smaller than 4MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setWithdrawalProofSlip(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Milestone Reward Actions
  const handleApproveReward = (reward: Reward) => {
    rewardService.updateRewardStatus({
      rewardId: reward.id,
      status: 'approved',
      adminNote: 'Approved by administrator',
    });
    refreshData();
    toastSuccess(`Milestone reward (${reward.rankName} - PKR ${reward.amount.toLocaleString()}) approved.`);
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
    toastSuccess(`Milestone reward of PKR ${selectedReward.amount.toLocaleString()} marked as disbursed.`);
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
    toastSuccess(`Milestone reward (${reward.rankName}) marked as rejected.`);
  };

  // Profit Withdrawal Actions
  const handleApproveWithdrawal = async (w: WithdrawalRequest) => {
    await payoutService.updateWithdrawalStatus({
      requestId: w.id,
      status: 'approved',
      adminNote: 'Approved for disbursement',
    });
    refreshData();
    toastSuccess(`Withdrawal #${w.id} (PKR ${w.amount.toLocaleString()}) approved.`);
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
      payoutProofUrl: withdrawalProofSlip || undefined,
    });

    toastSuccess(`Payout of PKR ${selectedWithdrawal.amount.toLocaleString()} marked as Paid with proof.`);
    setSelectedWithdrawal(null);
    setWithdrawalRefText('');
    setWithdrawalAdminNote('');
    setWithdrawalProofSlip('');
    refreshData();
    setActionSuccessMsg('Payout marked as Paid with attached proof & user notified.');
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Rejection modal states
  const [rejectingWithdrawal, setRejectingWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [selectedPayoutReason, setSelectedPayoutReason] = useState<string>('Account Title Name Mismatch with Partner Profile');
  const [customPayoutReason, setCustomPayoutReason] = useState<string>('');
  const [isRejectingPayout, setIsRejectingPayout] = useState(false);

  const PAYOUT_REJECTION_REASONS = [
    'Account Title Name Mismatch with Partner Profile',
    'Invalid / Closed Bank Account or Wallet Number',
    'Incorrect Account Number / IBAN Length',
    'Suspicious / Duplicate Withdrawal Request',
    'Other / Custom Reason',
  ];

  const handleConfirmRejectWithdrawal = async () => {
    if (!rejectingWithdrawal) return;
    setIsRejectingPayout(true);

    const finalReason =
      selectedPayoutReason === 'Other / Custom Reason'
        ? customPayoutReason.trim() || 'Payout request rejected by administrator'
        : selectedPayoutReason + (customPayoutReason.trim() ? ` - Note: ${customPayoutReason.trim()}` : '');

    await payoutService.updateWithdrawalStatus({
      requestId: rejectingWithdrawal.id,
      status: 'rejected',
      adminNote: finalReason,
    });

    notificationService.createNotification({
      userId: rejectingWithdrawal.userId,
      title: 'Withdrawal Request Rejected ❌',
      message: `Your profit withdrawal of PKR ${rejectingWithdrawal.amount.toLocaleString()} was rejected: "${finalReason}". Please check your payout account details in Profile and re-submit.`,
      type: 'system',
      link: '/dashboard/rewards',
    });

    refreshData();
    setIsRejectingPayout(false);
    setRejectingWithdrawal(null);
    setCustomPayoutReason('');
  };

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const pendingRewardsCount = rewards.filter((r) => r.status === 'pending_review').length;

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
          <span>Financials</span>
          <span>/</span>
          <span>Payouts &amp; Milestone Disbursements</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)]">
          Platform Disbursements &amp; Profit Payouts
        </h1>
        <p className="text-xs text-[var(--ink-soft)]">
          Process reseller profit margin withdrawals and milestone rank cash bonus disbursements.
        </p>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--primary-dark)] text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle size={16} weight="fill" />
          <span className="font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-[var(--line)] pb-1 overflow-x-auto overscroll-x-contain scrollbar-none">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`shrink-0 px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-[5px] flex items-center space-x-2 ${
            activeTab === 'withdrawals'
              ? 'border-[var(--primary)] text-[var(--primary-dark)]'
              : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          <HandCoins size={14} />
          <span>Seller Profit Withdrawals ({withdrawals.length})</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px]">
              {pendingWithdrawalsCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`shrink-0 px-4 py-2 text-xs font-mono font-medium transition-all border-b-2 -mb-[5px] flex items-center space-x-2 ${
            activeTab === 'rewards'
              ? 'border-[var(--primary)] text-[var(--primary-dark)]'
              : 'border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]'
          }`}
        >
          <Gift size={14} />
          <span>Milestone Level Bonuses ({rewards.length})</span>
          {pendingRewardsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px]">
              {pendingRewardsCount} new
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Seller Profit Withdrawals */}
      {activeTab === 'withdrawals' && (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden text-xs shadow-xs">
          <div className="p-3.5 bg-[var(--surface-alt)] border-b border-[var(--line)] flex items-center justify-between font-mono">
            <span className="font-semibold text-[var(--ink)]">Seller Profit Withdrawal Claims</span>
            <span className="text-[10px] text-[var(--ink-soft)]">{withdrawals.length} Total Claims</span>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-12 text-center text-[var(--ink-soft)] space-y-2">
              <HandCoins size={32} className="text-[var(--ink-soft)] mx-auto" />
              <p className="font-serif font-medium text-base text-[var(--ink)]">No profit withdrawal requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
              <table className="w-full min-w-[1000px] text-left font-sans border-collapse">
                <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] bg-[var(--surface)]">
                  <tr>
                    <th className="p-3.5 font-medium min-w-[100px] whitespace-nowrap">Claim ID</th>
                    <th className="p-3.5 font-medium min-w-[180px]">Seller Partner</th>
                    <th className="p-3.5 font-medium min-w-[200px]">Payout Method / Bank</th>
                    <th className="p-3.5 font-medium text-right min-w-[130px] whitespace-nowrap">Amount (PKR)</th>
                    <th className="p-3.5 font-medium text-center min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="p-3.5 font-medium min-w-[130px] whitespace-nowrap">Disbursement Ref</th>
                    <th className="p-3.5 font-medium text-center min-w-[180px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                  {withdrawals.map((w) => {
                    const u = getUser(w.userId);

                    return (
                      <tr key={w.id} className="hover:bg-[var(--surface)] transition-colors">
                        <td className="p-3.5 font-mono text-[var(--ink-soft)] min-w-[100px] whitespace-nowrap">{w.id}</td>
                        <td className="p-3.5 min-w-[180px]">
                          <p className="font-serif font-semibold text-[var(--ink)]">{w.userName || u?.fullName}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-[var(--ink-soft)] font-mono whitespace-nowrap">
                            {w.userPhone && (
                              <a
                                href={`https://wa.me/${w.userPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--primary-dark)] flex items-center space-x-0.5 hover:underline whitespace-nowrap"
                              >
                                <WhatsappLogo size={11} weight="fill" className="shrink-0" />
                                <span>{w.userPhone}</span>
                              </a>
                            )}
                            <span className="truncate">{w.userEmail || u?.email}</span>
                          </div>
                        </td>
                        <td className="p-3.5 min-w-[200px]">
                          <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] space-y-0.5 font-mono text-[11px]">
                            <span className="font-bold text-[var(--ink)] block whitespace-nowrap">{w.payoutMethod.bankName}</span>
                            <span className="text-[var(--ink-soft)] block whitespace-nowrap">Title: {w.payoutMethod.accountTitle}</span>
                            <span className="text-[var(--primary-dark)] font-bold block select-all whitespace-nowrap">
                              No: {w.payoutMethod.accountNumber}
                            </span>
                            {w.payoutMethod.branchCity && (
                              <span className="text-[10px] text-[var(--ink-soft)] block whitespace-nowrap">City: {w.payoutMethod.branchCity}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-[var(--primary-dark)] text-sm min-w-[130px] whitespace-nowrap">
                          PKR {w.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center min-w-[110px] whitespace-nowrap">
                          <span
                            className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border whitespace-nowrap ${
                              w.status === 'paid'
                                ? 'bg-[var(--surface-alt)] text-[var(--primary-dark)] border-[var(--line)]'
                                : w.status === 'approved'
                                ? 'bg-[var(--surface-alt)] text-[var(--primary-dark)] border-[var(--line)]'
                                : w.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                : 'bg-[var(--surface-alt)] text-[var(--accent)] border-[var(--accent)]/30'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] font-mono text-[var(--ink-soft)] min-w-[130px]">
                          {w.transactionReference || w.adminNote || 'Pending'}
                        </td>
                        <td className="p-3.5 text-center min-w-[180px] whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                            {w.status === 'pending' && (
                              <button
                                onClick={() => handleApproveWithdrawal(w)}
                                className="px-2 py-1 rounded bg-[var(--surface-alt)] text-[var(--primary-dark)] hover:bg-[var(--surface-alt)] border border-[var(--line)] text-[11px] font-mono whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {(w.status === 'pending' || w.status === 'approved') && (
                              <button
                                onClick={() => setSelectedWithdrawal(w)}
                                className="px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] text-[11px] font-mono font-medium whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            {w.status !== 'rejected' && w.status !== 'paid' && (
                              <button
                                onClick={() => setRejectingWithdrawal(w)}
                                className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-500/20 border border-rose-200 text-[11px] font-mono whitespace-nowrap shrink-0 cursor-pointer"
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
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden text-xs shadow-xs">
          <div className="p-3.5 bg-[var(--surface-alt)] border-b border-[var(--line)] flex items-center justify-between font-mono">
            <span className="font-semibold text-[var(--ink)]">Partner Rank Milestone Claims</span>
            <span className="text-[var(--ink-soft)] text-[11px]">{rewards.length} Submitted</span>
          </div>

          {rewards.length === 0 ? (
            <div className="p-12 text-center text-[var(--ink-soft)] space-y-2">
              <Gift size={32} className="text-[var(--ink-soft)] mx-auto" />
              <p className="font-serif font-medium text-base text-[var(--ink)]">No milestone rewards submitted</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full touch-pan-x overscroll-x-contain">
              <table className="w-full min-w-[1000px] text-left font-sans border-collapse">
                <thead className="border-b border-[var(--line)] text-[var(--ink-soft)] font-mono text-[10px] bg-[var(--surface)]">
                  <tr>
                    <th className="p-3.5 font-medium min-w-[100px] whitespace-nowrap">Claim ID</th>
                    <th className="p-3.5 font-medium min-w-[180px]">Partner</th>
                    <th className="p-3.5 font-medium min-w-[120px] whitespace-nowrap">Level</th>
                    <th className="p-3.5 font-medium text-right min-w-[130px] whitespace-nowrap">Bonus Amount</th>
                    <th className="p-3.5 font-medium text-center min-w-[110px] whitespace-nowrap">Status</th>
                    <th className="p-3.5 font-medium min-w-[130px] whitespace-nowrap">Payment Reference</th>
                    <th className="p-3.5 font-medium text-center min-w-[180px] whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[var(--ink-soft)]">
                  {rewards.map((rew) => {
                    const u = getUser(rew.userId);

                    return (
                      <tr key={rew.id} className="hover:bg-[var(--surface)] transition-colors">
                        <td className="p-3.5 font-mono text-[var(--ink-soft)] min-w-[100px] whitespace-nowrap">{rew.id}</td>
                        <td className="p-3.5 min-w-[180px]">
                          <p className="font-serif font-semibold text-[var(--ink)]">{u?.fullName || rew.userId}</p>
                          <p className="text-[10px] font-mono text-[var(--ink-soft)] truncate">{u?.email || ''}</p>
                        </td>
                        <td className="p-3.5 font-serif font-medium text-[var(--ink)] min-w-[120px] whitespace-nowrap">{rew.rankName}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-[var(--accent)] min-w-[130px] whitespace-nowrap">
                          PKR {rew.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center min-w-[110px] whitespace-nowrap">
                          <span
                            className={`inline-block text-[10px] font-mono font-semibold capitalize px-2 py-0.5 rounded border whitespace-nowrap ${
                              rew.status === 'paid'
                                ? 'bg-[var(--surface-alt)] text-[var(--primary-dark)] border-[var(--line)]'
                                : rew.status === 'pending_review'
                                ? 'bg-[var(--surface-alt)] text-[var(--accent)] border-[var(--accent)]/30'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            }`}
                          >
                            {rew.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-[11px] font-mono text-[var(--ink-soft)] min-w-[130px]">
                          {rew.transactionReference || rew.adminNote || 'Pending'}
                        </td>
                        <td className="p-3.5 text-center min-w-[180px] whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                            {rew.status === 'pending_review' && (
                              <button
                                onClick={() => handleApproveReward(rew)}
                                className="px-2 py-1 rounded bg-[var(--surface-alt)] text-[var(--primary-dark)] hover:bg-[var(--surface-alt)] border border-[var(--line)] text-[11px] font-mono whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {(rew.status === 'pending_review' || rew.status === 'approved') && (
                              <button
                                onClick={() => setSelectedReward(rew)}
                                className="px-2 py-1 rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] text-[11px] font-mono font-medium whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                            {rew.status !== 'rejected' && rew.status !== 'paid' && (
                              <button
                                onClick={() => handleRejectReward(rew)}
                                className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-500/20 border border-rose-200 text-[11px] font-mono whitespace-nowrap shrink-0 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="rounded-t-3xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6 max-w-sm w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto space-y-4 shadow-xl text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h3 className="font-serif font-medium text-base text-[var(--ink)]">Record Bonus Disbursement</h3>
              <button
                onClick={() => setSelectedReward(null)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] active:scale-[0.96] transition-transform"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePayReward} className="space-y-3">
              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Disbursement Reference / Transaction ID *</label>
                <input
                  type="text"
                  required
                  value={rewardRefText}
                  onChange={(e) => setRewardRefText(e.target.value)}
                  placeholder="e.g. Bank Transfer Ref / JazzCash 94829"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="rounded-t-3xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-6 max-w-md w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto space-y-4 shadow-xl text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div>
                <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                  Disburse Profit Withdrawal
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Amount: <span className="font-bold text-[var(--primary-dark)]">PKR {selectedWithdrawal.amount.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] active:scale-[0.96] transition-transform"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Destination Payout Account Info */}
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold block">
                Target Receiving Account:
              </span>
              <div className="flex justify-between text-[var(--ink)]">
                <span>Bank / Wallet:</span>
                <span className="font-bold">{selectedWithdrawal.payoutMethod.bankName}</span>
              </div>
              <div className="flex justify-between text-[var(--ink)]">
                <span>Account Title:</span>
                <span className="font-medium">{selectedWithdrawal.payoutMethod.accountTitle}</span>
              </div>
              <div className="flex justify-between text-[var(--primary-dark)]">
                <span>Account / IBAN:</span>
                <span className="font-bold select-all">{selectedWithdrawal.payoutMethod.accountNumber}</span>
              </div>
            </div>

            <form onSubmit={handlePayWithdrawal} className="space-y-3">
              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Bank / JazzCash / EasyPaisa Transaction Reference *
                </label>
                <input
                  type="text"
                  required
                  value={withdrawalRefText}
                  onChange={(e) => setWithdrawalRefText(e.target.value)}
                  placeholder="e.g. IBFT-98429402 or EasyPaisa TRX 982189"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Disbursement Note for Seller (Optional)
                </label>
                <input
                  type="text"
                  value={withdrawalAdminNote}
                  onChange={(e) => setWithdrawalAdminNote(e.target.value)}
                  placeholder="e.g. Transferred from Meezan Bank business account"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Admin Payment Slip Attachment */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[var(--ink)] font-medium text-[11px]">
                    Attach Bank / Wallet Payment Slip (Optional)
                  </label>
                  {withdrawalProofSlip && (
                    <button
                      type="button"
                      onClick={() => setWithdrawalProofSlip('')}
                      className="text-[10px] text-rose-600 hover:underline font-mono"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {withdrawalProofSlip ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                    <img
                      src={withdrawalProofSlip}
                      alt="Payment Slip"
                      className="w-12 h-12 rounded object-cover border border-[var(--line)]"
                    />
                    <span className="text-[11px] font-mono text-[var(--primary-dark)] font-semibold">
                      ✓ Payment Receipt Attached
                    </span>
                  </div>
                ) : (
                  <div className="relative border border-dashed border-[var(--line)] rounded-lg p-2.5 text-center hover:bg-[var(--surface)] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWithdrawalProofFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                      Click to upload payment receipt screenshot (JPG, PNG)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[var(--line)]">
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

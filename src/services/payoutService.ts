import { PaymentMethod, PaymentMethodType, WithdrawalRequest, WithdrawalStatus, User } from '@/types';
import { storage } from './storage';
import { db, rtdb } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';

export const payoutService = {
  /**
   * Retrieves all saved payment payout methods for a user.
   */
  getUserPaymentMethods(userId: string): PaymentMethod[] {
    const methods = storage.get<PaymentMethod[]>('PAYMENT_METHODS', []);
    return methods
      .filter((m) => m.userId === userId)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  },

  /**
   * Adds a new payment payout method for a user.
   */
  async addPaymentMethod({
    userId,
    methodType,
    accountTitle,
    accountNumber,
    bankName,
    branchCity,
    isDefault = false,
  }: {
    userId: string;
    methodType: PaymentMethodType;
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    branchCity?: string;
    isDefault?: boolean;
  }): Promise<PaymentMethod> {
    const methods = storage.get<PaymentMethod[]>('PAYMENT_METHODS', []);
    const userMethods = methods.filter((m) => m.userId === userId);

    // If this is user's first method or marked as default, make others non-default
    const shouldBeDefault = isDefault || userMethods.length === 0;
    if (shouldBeDefault) {
      methods.forEach((m) => {
        if (m.userId === userId) m.isDefault = false;
      });
    }

    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      methodType,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      branchCity: branchCity?.trim(),
      isDefault: shouldBeDefault,
      createdAt: new Date().toISOString(),
    };

    methods.push(newMethod);
    storage.set('PAYMENT_METHODS', methods);

    // Sync to Cloud
    try {
      await setDoc(doc(db, `users/${userId}/payment_methods`, newMethod.id), newMethod, { merge: true });
    } catch {}
    try {
      await set(ref(rtdb, `user_payment_methods/${userId}/${newMethod.id}`), newMethod);
    } catch {}

    return newMethod;
  },

  /**
   * Deletes a payment method.
   */
  deletePaymentMethod(userId: string, methodId: string): void {
    let methods = storage.get<PaymentMethod[]>('PAYMENT_METHODS', []);
    methods = methods.filter((m) => m.id !== methodId);
    
    // Ensure at least one default remains if available
    const userMethods = methods.filter((m) => m.userId === userId);
    if (userMethods.length > 0 && !userMethods.some((m) => m.isDefault)) {
      userMethods[0].isDefault = true;
    }

    storage.set('PAYMENT_METHODS', methods);
  },

  /**
   * Sets a specific payment method as the default payout account.
   */
  setDefaultPaymentMethod(userId: string, methodId: string): void {
    const methods = storage.get<PaymentMethod[]>('PAYMENT_METHODS', []);
    methods.forEach((m) => {
      if (m.userId === userId) {
        m.isDefault = m.id === methodId;
      }
    });
    storage.set('PAYMENT_METHODS', methods);
  },

  /**
   * Retrieves withdrawal requests for a specific user.
   */
  getUserWithdrawals(userId: string): WithdrawalRequest[] {
    const withdrawals = storage.get<WithdrawalRequest[]>('WITHDRAWALS', []);
    return withdrawals
      .filter((w) => w.userId === userId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  },

  /**
   * Retrieves all withdrawal requests across the platform for administrators.
   */
  getAllWithdrawals(): WithdrawalRequest[] {
    const withdrawals = storage.get<WithdrawalRequest[]>('WITHDRAWALS', []);
    return withdrawals.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  },

  /**
   * Creates a new withdrawal request for a reseller.
   */
  async createWithdrawalRequest({
    user,
    amount,
    payoutMethod,
  }: {
    user: User;
    amount: number;
    payoutMethod: PaymentMethod;
  }): Promise<{ success: boolean; request?: WithdrawalRequest; error?: string }> {
    if (!user || !user.id) {
      return { success: false, error: 'User is not authenticated.' };
    }

    if (amount < 500) {
      return { success: false, error: 'Minimum withdrawal amount is PKR 500.' };
    }

    const newRequest: WithdrawalRequest = {
      id: `wd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone,
      amount,
      currency: 'PKR',
      payoutMethod,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const withdrawals = storage.get<WithdrawalRequest[]>('WITHDRAWALS', []);
    withdrawals.unshift(newRequest);
    storage.set('WITHDRAWALS', withdrawals);

    // Sync to Cloud
    try {
      await setDoc(doc(db, 'withdrawals', newRequest.id), newRequest, { merge: true });
      await setDoc(doc(db, `users/${user.id}/withdrawals`, newRequest.id), newRequest, { merge: true });
    } catch {}
    try {
      await set(ref(rtdb, `withdrawals/${newRequest.id}`), newRequest);
      await set(ref(rtdb, `user_withdrawals/${user.id}/${newRequest.id}`), newRequest);
    } catch {}

    // Create user confirmation notification
    const notifs = storage.get<any[]>('NOTIFICATIONS', []);
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: user.id,
      type: 'withdrawal_requested',
      title: '💸 Withdrawal Request Submitted',
      message: `Your payout request for PKR ${amount.toLocaleString()} via ${payoutMethod.bankName} (${payoutMethod.accountNumber}) has been submitted for manual processing.`,
      isRead: false,
      linkUrl: '/dashboard/sales',
      createdAt: new Date().toISOString(),
    });
    storage.set('NOTIFICATIONS', notifs);

    return { success: true, request: newRequest };
  },

  /**
   * Admin updates withdrawal status (approve, mark paid, or reject) and attaches payment proof slip.
   */
  async updateWithdrawalStatus({
    requestId,
    status,
    transactionReference,
    adminNote,
    payoutProofUrl,
  }: {
    requestId: string;
    status: WithdrawalStatus;
    transactionReference?: string;
    adminNote?: string;
    payoutProofUrl?: string;
  }): Promise<void> {
    const withdrawals = storage.get<WithdrawalRequest[]>('WITHDRAWALS', []);
    const idx = withdrawals.findIndex((w) => w.id === requestId);
    if (idx === -1) return;

    withdrawals[idx].status = status;
    withdrawals[idx].processedAt = new Date().toISOString();
    if (transactionReference !== undefined) withdrawals[idx].transactionReference = transactionReference;
    if (adminNote !== undefined) withdrawals[idx].adminNote = adminNote;
    if (payoutProofUrl !== undefined) withdrawals[idx].payoutProofUrl = payoutProofUrl;

    storage.set('WITHDRAWALS', withdrawals);

    // Sync to Cloud
    try {
      await setDoc(doc(db, 'withdrawals', requestId), withdrawals[idx], { merge: true });
    } catch {}
    try {
      await set(ref(rtdb, `withdrawals/${requestId}`), withdrawals[idx]);
    } catch {}

    // Dispatch notification to user
    const targetUserId = withdrawals[idx].userId;
    const notifs = storage.get<any[]>('NOTIFICATIONS', []);
    const statusTitles: Record<WithdrawalStatus, string> = {
      approved: '✅ Payout Approved for Processing',
      paid: '💵 Payout Disbursed Successfully!',
      rejected: '❌ Withdrawal Request Rejected',
      pending: '⏳ Payout Pending',
    };

    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: targetUserId,
      type: status === 'paid' ? 'withdrawal_paid' : status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
      title: statusTitles[status] || 'Payout Status Update',
      message:
        status === 'paid'
          ? `PKR ${withdrawals[idx].amount.toLocaleString()} has been sent to your ${withdrawals[idx].payoutMethod.bankName} account (${withdrawals[idx].payoutMethod.accountNumber}). Ref: ${transactionReference || 'Direct Payout'}.`
          : status === 'rejected'
          ? `Withdrawal request for PKR ${withdrawals[idx].amount.toLocaleString()} was rejected. Note: ${adminNote || 'Contact support'}.`
          : `Withdrawal request for PKR ${withdrawals[idx].amount.toLocaleString()} was approved and is in processing.`,
      isRead: false,
      linkUrl: '/dashboard/sales',
      createdAt: new Date().toISOString(),
    });
    storage.set('NOTIFICATIONS', notifs);
  },
};

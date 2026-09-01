import { Reward, RewardStatus } from '@/types';
import { storage } from './storage';
import { db, rtdb } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';

export const rewardService = {
  getUserRewards(userId: string): Reward[] {
    const rewards = storage.get<Reward[]>('REWARDS', []);
    return rewards
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  },

  getAllAdminRewards(): Reward[] {
    const rewards = storage.get<Reward[]>('REWARDS', []);
    return rewards.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  },

  getTotalRewardsEarned(userId: string): number {
    return this.getUserRewards(userId)
      .filter((r) => r.status !== 'rejected')
      .reduce((sum, r) => sum + r.amount, 0);
  },

  async updateRewardStatus({
    rewardId,
    status,
    adminNote,
    transactionReference,
  }: {
    rewardId: string;
    status: RewardStatus;
    adminNote?: string;
    transactionReference?: string;
  }): Promise<void> {
    const rewards = storage.get<Reward[]>('REWARDS', []);
    const index = rewards.findIndex((r) => r.id === rewardId);
    if (index >= 0) {
      rewards[index].status = status;
      if (adminNote) rewards[index].adminNote = adminNote;
      if (transactionReference) rewards[index].transactionReference = transactionReference;
      if (status === 'approved') rewards[index].approvedAt = new Date().toISOString();
      if (status === 'paid') rewards[index].paidAt = new Date().toISOString();
      storage.set('REWARDS', rewards);

      // Sync to Cloud Firestore & RTDB
      try {
        await setDoc(doc(db, 'rewards', rewardId), rewards[index], { merge: true });
        await setDoc(doc(db, `users/${rewards[index].userId}/rewards`, rewardId), rewards[index], { merge: true });
      } catch {}
      try {
        await set(ref(rtdb, `rewards/${rewardId}`), rewards[index]);
        await set(ref(rtdb, `user_rewards/${rewards[index].userId}/${rewardId}`), rewards[index]);
      } catch {}

      // Create notification for user
      const targetUserId = rewards[index].userId;
      const notifs = storage.get<any[]>('NOTIFICATIONS', []);
      notifs.unshift({
        id: `notif-${Date.now()}`,
        userId: targetUserId,
        type: status === 'paid' ? 'reward_paid' : 'reward_approved',
        title: status === 'paid' ? '💰 Milestone Reward Paid!' : '✅ Milestone Reward Approved',
        message:
          status === 'paid'
            ? `Your PKR ${rewards[index].amount.toLocaleString()} reward for ${rewards[index].rankName} has been disbursed (${transactionReference || 'Direct Transfer'}).`
            : `Your PKR ${rewards[index].amount.toLocaleString()} reward for ${rewards[index].rankName} has been approved.`,
        isRead: false,
        linkUrl: '/dashboard/rewards',
        createdAt: new Date().toISOString(),
      });
      storage.set('NOTIFICATIONS', notifs);
    }
  },
};

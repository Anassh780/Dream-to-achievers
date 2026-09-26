import { RankDefinition, RankSlug, UserRankProgress, User } from '@/types';
import { CANONICAL_RANKS, UNRANKED_DEFINITION } from '@/config/ranks';
import { storage } from './storage';
import { referralService } from './referralService';
import { salesService } from './salesService';

export const rankEngine = {
  /**
   * Retrieves all currently active rank definitions ordered by tier.
   */
  getAllRanks(): RankDefinition[] {
    const ranks = storage.get<RankDefinition[]>('RANKS', CANONICAL_RANKS);
    return ranks.filter((r) => r.isActive).sort((a, b) => a.order - b.order);
  },

  /**
   * Evaluates the highest rank achieved by a user given their qualifying sales and community members count.
   * Logic: sales >= requiredSales AND qualifyingCommunity >= requiredCommunity
   */
  evaluateRank(qualifyingSales: number, qualifyingCommunity: number): RankDefinition {
    const ranks = this.getAllRanks();
    let highestRank: RankDefinition = UNRANKED_DEFINITION;

    for (const rank of ranks) {
      if (qualifyingSales >= rank.requiredSales && qualifyingCommunity >= rank.requiredCommunity) {
        highestRank = rank;
      }
    }

    return highestRank;
  },

  /**
   * Computes comprehensive user rank progress, including next rank, independent progress bars,
   * missing requirements, and overall percentage completion.
   */
  calculateProgress(qualifyingSales: number, qualifyingCommunity: number): UserRankProgress {
    const ranks = this.getAllRanks();
    const currentRank = this.evaluateRank(qualifyingSales, qualifyingCommunity);

    // Find next rank tier
    const nextRank =
      currentRank.order === 0
        ? ranks[0] || null
        : ranks.find((r) => r.order === currentRank.order + 1) || null;

    if (!nextRank) {
      // Max rank reached (Diamond)
      return {
        currentRank,
        nextRank: null,
        qualifyingSales,
        qualifyingCommunity,
        salesProgressPercent: 100,
        communityProgressPercent: 100,
        overallProgressPercent: 100,
        missingSales: 0,
        missingCommunity: 0,
        isMaxRank: true,
      };
    }

    const salesProgressPercent = Math.min(
      Math.round((qualifyingSales / nextRank.requiredSales) * 100),
      100
    );
    const communityProgressPercent = Math.min(
      Math.round((qualifyingCommunity / nextRank.requiredCommunity) * 100),
      100
    );

    // Overall progress is only 100% when BOTH conditions are satisfied
    const overallProgressPercent = Math.min(
      Math.round(((salesProgressPercent + communityProgressPercent) / 2)),
      99
    );

    const missingSales = Math.max(0, nextRank.requiredSales - qualifyingSales);
    const missingCommunity = Math.max(0, nextRank.requiredCommunity - qualifyingCommunity);

    return {
      currentRank,
      nextRank,
      qualifyingSales,
      qualifyingCommunity,
      salesProgressPercent,
      communityProgressPercent,
      overallProgressPercent,
      missingSales,
      missingCommunity,
      isMaxRank: false,
    };
  },

  /**
   * Recalculates and updates user rank state. If a new milestone rank is reached,
   * generates an idempotent reward entry and creates a celebration notification.
   */
  checkAndPromoteUser(userId: string): { promoted: boolean; newRank?: RankDefinition } {
    const users = storage.get<User[]>('USERS', []);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return { promoted: false };

    const user = users[userIndex];

    // Compute qualifying metrics for this user using unified service functions
    const qualifyingSales = salesService.getQualifyingSalesCount(userId);
    const qualifyingCommunity = referralService.getQualifyingCommunityCount(userId);

    const achievedRank = this.evaluateRank(qualifyingSales, qualifyingCommunity);

    if (achievedRank.order > 0 && achievedRank.slug !== user.currentRankSlug) {
      // Check if user already claimed this rank historically to prevent duplicate rewards
      const history = storage.get<any[]>('RANK_HISTORY', []);
      const alreadyClaimed = history.some((h) => h.userId === userId && h.newRankSlug === achievedRank.slug);

      // Update user current rank
      user.currentRankSlug = achievedRank.slug;
      users[userIndex] = user;
      storage.set('USERS', users);

      if (!alreadyClaimed) {
        // Create Reward
        const rewardId = `rew-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newReward = {
          id: rewardId,
          userId,
          rankSlug: achievedRank.slug,
          rankName: achievedRank.name,
          amount: achievedRank.rewardAmount,
          currency: 'PKR',
          status: 'pending_review',
          earnedAt: new Date().toISOString(),
          adminNote: `Automatic milestone reward generated upon achieving ${achievedRank.name}.`,
        };

        const rewards = storage.get<any[]>('REWARDS', []);
        rewards.push(newReward);
        storage.set('REWARDS', rewards);

        // Record Rank History
        const historyEntry = {
          id: `hist-${Date.now()}`,
          userId,
          previousRankSlug: user.currentRankSlug || 'unranked',
          newRankSlug: achievedRank.slug,
          achievedAt: new Date().toISOString(),
          qualifyingSalesAtAchievement: qualifyingSales,
          qualifyingCommunityAtAchievement: qualifyingCommunity,
          rewardAmountIssued: achievedRank.rewardAmount,
          rewardId,
        };
        history.push(historyEntry);
        storage.set('RANK_HISTORY', history);

        // Create Notification
        const notifs = storage.get<any[]>('NOTIFICATIONS', []);
        notifs.unshift({
          id: `notif-${Date.now()}`,
          userId,
          type: 'rank_achieved',
          title: `🎉 ${achievedRank.name} Achieved!`,
          message: `Congratulations! You unlocked ${achievedRank.name} and earned a PKR ${achievedRank.rewardAmount.toLocaleString()} Milestone Reward.`,
          isRead: false,
          linkUrl: '/dashboard/rewards',
          createdAt: new Date().toISOString(),
        });
        storage.set('NOTIFICATIONS', notifs);
      }

      return { promoted: true, newRank: achievedRank };
    }

    return { promoted: false };
  },
};

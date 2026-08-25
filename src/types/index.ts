export type RankSlug = 'silver' | 'platinum' | 'gold' | 'diamond';

export interface RankDefinition {
  id: string;
  name: string;
  slug: RankSlug;
  order: number;
  requiredSales: number;
  requiredCommunity: number;
  rewardAmount: number;
  currency: string;
  accentColor: 'silver' | 'platinum' | 'gold' | 'diamond';
  icon: string;
  tagline: string;
  description: string;
  benefits: string[];
  isActive: boolean;
}

export interface UserRankProgress {
  currentRank: RankDefinition;
  nextRank: RankDefinition | null;
  qualifyingSales: number;
  qualifyingCommunity: number;
  salesProgressPercent: number;
  communityProgressPercent: number;
  overallProgressPercent: number;
  missingSales: number;
  missingCommunity: number;
  isMaxRank: boolean;
}

export interface RankHistoryEntry {
  id: string;
  userId: string;
  previousRankSlug: RankSlug | 'unranked';
  newRankSlug: RankSlug;
  achievedAt: string;
  qualifyingSalesAtAchievement: number;
  qualifyingCommunityAtAchievement: number;
  rewardAmountIssued: number;
  rewardId: string;
}

export type ProductStatus = 'active' | 'draft' | 'out_of_stock';

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: 'Skincare & Beauty' | 'Electronics & Tech' | 'Fashion & Apparel' | 'Wellness & Fitness' | 'Home & Lifestyle';
  retailPrice: number;
  partnerPrice: number;
  suggestedSellingPrice: number;
  grossMargin: number;
  currency: string;
  imageUrl: string;
  sku: string;
  inStock: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  createdAt: string;
}

export type SaleStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';

export interface Sale {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail?: string;
  quantity: number;
  retailPrice: number;
  partnerPrice: number;
  sellingPrice: number;
  profitMargin: number;
  currency: string;
  status: SaleStatus;
  isQualifying: boolean;
  createdAt: string;
  confirmedAt?: string;
}

export type ReferralStatus = 'active' | 'pending' | 'inactive';

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  referredUserRank: RankSlug | 'unranked';
  referralCodeUsed: string;
  status: ReferralStatus;
  isQualifying: boolean;
  createdAt: string;
}

export type RewardStatus = 'earned' | 'pending_review' | 'approved' | 'paid' | 'rejected';

export interface Reward {
  id: string;
  userId: string;
  rankSlug: RankSlug;
  rankName: string;
  amount: number;
  currency: string;
  status: RewardStatus;
  earnedAt: string;
  approvedAt?: string;
  paidAt?: string;
  transactionReference?: string;
  adminNote?: string;
}

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  referralCode: string;
  referredByCode?: string;
  currentRankSlug: RankSlug | 'unranked';
  avatarUrl?: string;
  phone?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'welcome'
  | 'referral_joined'
  | 'sale_confirmed'
  | 'rank_achieved'
  | 'reward_earned'
  | 'reward_approved'
  | 'reward_paid'
  | 'system_announcement';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: 'rank' | 'user' | 'product' | 'sale' | 'reward' | 'settings';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  brandName: string;
  companyLegalName: string;
  supportEmail: string;
  adminEmail?: string;
  whatsappNumber: string;
  tiktokUrl?: string;
  whatsappChannelUrl?: string;
  disclaimerText: string;
  communityRuleDescription: string;
  isReferralSignupEnabled: boolean;
}


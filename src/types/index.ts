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
export type CategoryStatus = 'active' | 'archived' | 'draft';

export interface Category {
  id: string;                    // e.g. 'cat-skincare'
  name: string;                  // e.g. 'Skincare & Beauty'
  slug: string;                  // e.g. 'skincare'
  description: string;           // editorial overview, 1-2 sentences
  icon: string;                  // Lucide or Phosphor icon name, e.g. 'Sparkle'
  bannerUrl?: string;            // 1600x600 recommended
  thumbnailUrl?: string;         // 400x400, used in pill carousel
  featured: boolean;
  sortOrder: number;             // gap-indexed (10, 20, 30...)
  status: CategoryStatus;

  // --- Hierarchy ---
  parentId: string | null;       // null = top-level category
  depth: 0 | 1 | 2;              // enforce max 3 tiers (top / sub / leaf)
  childIds: string[];            // denormalized for fast tree rendering

  // --- SEO & metadata ---
  metaTitle?: string;
  metaDescription?: string;

  // --- Computed fields ---
  productCount?: number;
  avgProfitMarginPKR?: number;

  // --- Audit ---
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  archivedAt?: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  categoryId?: string;
  categoryIds?: string[];
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

export type SaleStatus =
  | 'pending_verification'
  | 'payment_verified'
  | 'processing'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'rejected'
  | 'confirmed'
  | 'fulfilled';

export interface Sale {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  customerName: string;
  customerPhone?: string; // WhatsApp number
  customerEmail?: string;
  customerAddress?: string; // Full delivery address
  customerCity?: string;
  paymentScreenshotUrl?: string; // Base64 or Image URL
  paymentProofNotes?: string;
  quantity: number;
  retailPrice: number;
  partnerPrice: number;
  sellingPrice: number;
  profitMargin: number;
  currency: string;
  status: SaleStatus;
  shippingCourier?: string; // TCS, Leopard, Trax, PostEx, etc.
  trackingNumber?: string;
  shippingNotes?: string;
  isQualifying: boolean;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  adminReviewNote?: string;
}

export type PaymentMethodType = 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'sadapay' | 'nayapay' | 'other';

export interface PaymentMethod {
  id: string;
  userId: string;
  methodType: PaymentMethodType;
  accountTitle: string;
  accountNumber: string;
  bankName: string;
  branchCity?: string;
  isDefault: boolean;
  createdAt: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  amount: number;
  currency: string;
  payoutMethod: PaymentMethod;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  transactionReference?: string;
  adminNote?: string;
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
  paymentMethods?: PaymentMethod[];
  isActive: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'welcome'
  | 'referral_joined'
  | 'sale_submitted'
  | 'sale_confirmed'
  | 'sale_dispatched'
  | 'sale_delivered'
  | 'rank_achieved'
  | 'reward_earned'
  | 'reward_approved'
  | 'reward_paid'
  | 'withdrawal_requested'
  | 'withdrawal_approved'
  | 'withdrawal_paid'
  | 'withdrawal_rejected'
  | 'system_announcement'
  | 'system'
  | 'info';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  linkUrl?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType: 'rank' | 'user' | 'product' | 'sale' | 'reward' | 'settings' | 'category';
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
  whatsappChannelUrl?: string;
  youtubeUrl?: string;
  xUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  threadsUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  disclaimerText: string;
  communityRuleDescription: string;
  isReferralSignupEnabled: boolean;
}


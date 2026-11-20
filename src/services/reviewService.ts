import { CustomerReview, ReviewPersona, ReviewStatus } from '@/types';
import { storage } from './storage';
import { auditService } from './auditService';
import { notificationService } from './notificationService';
import { webNotificationService } from './webNotificationService';
import { INITIAL_REVIEWS } from '@/config/reviews';
import { rtdb } from '@/lib/firebase';
import { ref, get, set, remove } from 'firebase/database';

class ReviewService {
  /**
   * Retrieves all reviews from storage, falling back to INITIAL_REVIEWS.
   */
  getAll(): CustomerReview[] {
    const raw = storage.get<CustomerReview[]>('REVIEWS', INITIAL_REVIEWS);
    if (!Array.isArray(raw) || raw.length === 0) {
      storage.set('REVIEWS', INITIAL_REVIEWS);
      return INITIAL_REVIEWS;
    }
    return [...raw].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }

  /**
   * Retrieves only published reviews for landing page & public presentation.
   */
  getPublished(): CustomerReview[] {
    return this.getAll().filter((r) => r.status === 'published');
  }

  /**
   * Retrieves featured reviews for spotlight sections.
   */
  getFeatured(): CustomerReview[] {
    return this.getPublished().filter((r) => r.isFeatured);
  }

  /**
   * Filters reviews by persona category ('all' or specific persona).
   */
  getByPersona(persona: ReviewPersona | 'all', publishedOnly = true): CustomerReview[] {
    const pool = publishedOnly ? this.getPublished() : this.getAll();
    if (persona === 'all') return pool;
    return pool.filter((r) => r.persona === persona);
  }

  /**
   * Finds a single review by its unique ID.
   */
  getById(id: string): CustomerReview | undefined {
    return this.getAll().find((r) => r.id === id);
  }

  /**
   * Returns count of user submissions awaiting admin moderation.
   */
  getPendingCount(): number {
    return this.getAll().filter((r) => r.status === 'pending').length;
  }

  /**
   * Aggregated review statistics for SaaS trust proof & Admin metrics.
   */
  getStats() {
    const all = this.getAll();
    const published = all.filter((r) => r.status === 'published');
    const pending = all.filter((r) => r.status === 'pending');
    const featured = published.filter((r) => r.isFeatured);

    const ratingsCount = published.length > 0 ? published.length : 1;
    const avgRating = Number(
      (published.reduce((sum, r) => sum + (r.rating || 5), 0) / ratingsCount).toFixed(2)
    );

    const totalOrders = published.reduce((sum, r) => sum + (r.ordersCount || 0), 0);

    const byPersona: Record<ReviewPersona, number> = {
      student: published.filter((r) => r.persona === 'student').length,
      homemaker: published.filter((r) => r.persona === 'homemaker').length,
      professional: published.filter((r) => r.persona === 'professional').length,
      retailer: published.filter((r) => r.persona === 'retailer').length,
      creator: published.filter((r) => r.persona === 'creator').length,
      entrepreneur: published.filter((r) => r.persona === 'entrepreneur').length,
      other: published.filter((r) => r.persona === 'other').length,
    };

    return {
      total: all.length,
      published: published.length,
      pending: pending.length,
      featured: featured.length,
      avgRating: isNaN(avgRating) ? 4.9 : avgRating,
      totalOrders,
      byPersona,
    };
  }

  /**
   * Admin: Creates a new customer review.
   */
  createReview(
    input: Omit<CustomerReview, 'id' | 'createdAt'> & { id?: string }
  ): CustomerReview {
    const reviews = this.getAll();
    const id = input.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReview: CustomerReview = {
      ...input,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpfulCount: input.helpfulCount ?? 0,
      isVerified: input.isVerified ?? true,
      isFeatured: input.isFeatured ?? false,
      status: input.status ?? 'published',
    };

    const updated = [newReview, ...reviews];
    this.save(updated);

    auditService.logAction({
      adminId: 'admin',
      adminEmail: 'admin@dreamtoachievers.com',
      action: 'CREATE_REVIEW',
      entityType: 'review',
      entityId: newReview.id,
      details: `Created review for ${newReview.name} (${newReview.persona})`,
    });

    // Sync to cloud RTDB in background
    set(ref(rtdb, `reviews/${newReview.id}`), newReview).catch(() => {});

    return newReview;
  }

  /**
   * Public: Allows students, homemakers, or resellers to submit their real review.
   * Review enters 'pending' state awaiting Admin approval.
   */
  submitPublicReview(input: {
    name: string;
    role: string;
    persona: ReviewPersona;
    organizationOrCollege?: string;
    city: string;
    avatar?: string;
    rating: number;
    headline: string;
    quote: string;
    payoutMethod?: string;
    revenueEarned?: string;
    ordersCount?: number;
  }): CustomerReview {
    const reviews = this.getAll();
    const id = `rev-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newReview: CustomerReview = {
      id,
      name: input.name.trim(),
      role: input.role.trim() || 'Reseller Partner',
      persona: input.persona || 'student',
      organizationOrCollege: input.organizationOrCollege?.trim(),
      city: input.city.trim() || 'Pakistan',
      avatar: input.avatar?.trim() || '',
      rating: Math.min(5, Math.max(1, input.rating || 5)),
      headline: input.headline.trim() || 'Real experience with Dream to Achievers',
      quote: input.quote.trim(),
      payoutMethod: input.payoutMethod?.trim() || 'JazzCash / Easypaisa',
      revenueEarned: input.revenueEarned?.trim() || 'Verified Reseller Margin',
      ordersCount: input.ordersCount ?? 1,
      rankTier: 'Silver Reseller',
      isVerified: true,
      isFeatured: false,
      status: 'pending', // Awaiting admin approval
      helpfulCount: 0,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const updated = [newReview, ...reviews];
    this.save(updated);

    // Notify admins of new pending review
    try {
      notificationService.createNotification({
        userId: 'admin',
        type: 'system',
        title: 'New Customer Review Submitted',
        message: `${newReview.name} (${newReview.role}) submitted a review awaiting moderation.`,
        linkUrl: '/admin/reviews',
      });
      webNotificationService.sendLocalNotification(
        'New Customer Review Submitted',
        `${newReview.name} submitted a ${newReview.rating}-star review for approval.`,
        '/admin/reviews'
      );
    } catch {}

    set(ref(rtdb, `reviews/${newReview.id}`), newReview).catch(() => {});

    return newReview;
  }

  /**
   * Admin: Updates an existing review.
   */
  updateReview(id: string, updates: Partial<CustomerReview>): CustomerReview | null {
    const reviews = this.getAll();
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updatedReview: CustomerReview = {
      ...reviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    reviews[index] = updatedReview;
    this.save(reviews);

    auditService.logAction({
      adminId: 'admin',
      adminEmail: 'admin@dreamtoachievers.com',
      action: 'UPDATE_REVIEW',
      entityType: 'review',
      entityId: id,
      details: `Updated review fields: ${Object.keys(updates).join(', ')}`,
    });

    set(ref(rtdb, `reviews/${id}`), updatedReview).catch(() => {});

    return updatedReview;
  }

  /**
   * Admin: Deletes a review.
   */
  deleteReview(id: string): boolean {
    const reviews = this.getAll();
    const filtered = reviews.filter((r) => r.id !== id);
    if (filtered.length === reviews.length) return false;

    this.save(filtered);

    auditService.logAction({
      adminId: 'admin',
      adminEmail: 'admin@dreamtoachievers.com',
      action: 'DELETE_REVIEW',
      entityType: 'review',
      entityId: id,
      details: `Deleted review with ID ${id}`,
    });
    remove(ref(rtdb, `reviews/${id}`)).catch(() => {});

    return true;
  }

  /**
   * Admin: Toggles published / hidden status.
   */
  togglePublish(id: string): CustomerReview | null {
    const review = this.getById(id);
    if (!review) return null;
    const newStatus: ReviewStatus = review.status === 'published' ? 'hidden' : 'published';
    return this.updateReview(id, { status: newStatus });
  }

  /**
   * Admin: Toggles featured on landing page.
   */
  toggleFeatured(id: string): CustomerReview | null {
    const review = this.getById(id);
    if (!review) return null;
    return this.updateReview(id, { isFeatured: !review.isFeatured });
  }

  /**
   * Admin: Approves a pending user-submitted review and publishes it.
   */
  approveReview(id: string): CustomerReview | null {
    return this.updateReview(id, { status: 'published', isVerified: true });
  }

  /**
   * Increments the helpful thumbs-up counter for a review (with localStorage deduplication).
   */
  incrementHelpful(id: string): boolean {
    if (typeof window === 'undefined') return false;
    const likedKey = `dta_helpful_rev_${id}`;
    if (localStorage.getItem(likedKey)) {
      return false; // Already liked
    }

    const review = this.getById(id);
    if (!review) return false;

    const updated = this.updateReview(id, { helpfulCount: (review.helpfulCount || 0) + 1 });
    if (updated) {
      localStorage.setItem(likedKey, '1');
      return true;
    }
    return false;
  }

  /**
   * Admin: Resets reviews back to curated 10-year experience presets.
   */
  resetToDefaults(): CustomerReview[] {
    this.save(INITIAL_REVIEWS);
    auditService.logAction({
      adminId: 'admin',
      adminEmail: 'admin@dreamtoachievers.com',
      action: 'RESET_REVIEWS_DEFAULT',
      entityType: 'review',
      entityId: 'all',
      details: `Reset reviews to default initial preset of ${INITIAL_REVIEWS.length} reviews`,
    });

    // Sync all to RTDB
    INITIAL_REVIEWS.forEach((r) => {
      set(ref(rtdb, `reviews/${r.id}`), r).catch(() => {});
    });

    return INITIAL_REVIEWS;
  }

  /**
   * Fetches latest reviews from RTDB and merges with local storage.
   */
  async fetchFromCloud(): Promise<CustomerReview[]> {
    try {
      const snap = await get(ref(rtdb, 'reviews'));
      if (snap.exists()) {
        const val = snap.val() || {};
        const remoteItems = Object.values(val) as CustomerReview[];
        const local = this.getAll();
        const map = new Map<string, CustomerReview>();

        remoteItems.forEach((r) => map.set(r.id, r));
        local.forEach((r) => {
          if (!map.has(r.id)) {
            map.set(r.id, r);
            set(ref(rtdb, `reviews/${r.id}`), r).catch(() => {});
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        );

        this.save(merged);
        return merged;
      } else {
        const local = this.getAll();
        if (local.length > 0) {
          local.forEach((r) => set(ref(rtdb, `reviews/${r.id}`), r).catch(() => {}));
        }
        return local;
      }
    } catch (err) {
      console.warn('[ReviewService] fetchFromCloud error:', err);
      return this.getAll();
    }
  }

  /**
   * Internal helper to persist reviews and fire custom events.
   */
  private save(reviews: CustomerReview[]): void {
    storage.set('REVIEWS', reviews);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_reviews_update', { detail: reviews }));
      window.dispatchEvent(new CustomEvent('dta_badge_update'));
    }
  }
}

export const reviewService = new ReviewService();

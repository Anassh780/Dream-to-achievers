import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { reviewService } from '@/services/reviewService';
import type { CustomerReview, ReviewPersona, ReviewStatus } from '@/types';
import {
  Star,
  Sparkle,
  SealCheck,
  GraduationCap,
  House,
  Briefcase,
  Storefront,
  VideoCamera,
  RocketLaunch,
  ThumbsUp,
  CheckCircle,
  Clock,
  Trash,
  NotePencil,
  MagnifyingGlass,
  Plus,
  Eye,
  EyeSlash,
  ArrowsClockwise,
  X,
  Check,
  WarningCircle,
  Bank,
  DeviceMobile,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { GlassCard } from '@/components/ui/luxury/GlassCard';

export const AdminReviewsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [reviews, setReviews] = useState<CustomerReview[]>(() => reviewService.getAll());
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'pending' | 'featured' | 'hidden'>('all');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<ReviewPersona | 'all'>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    persona: 'student' as ReviewPersona,
    organizationOrCollege: '',
    city: '',
    avatar: '',
    rating: 5,
    headline: '',
    quote: '',
    revenueEarned: '',
    ordersCount: 50,
    rankTier: 'Gold Partner',
    payoutMethod: 'JazzCash & Nayapay',
    status: 'published' as ReviewStatus,
    isFeatured: false,
    adminNotes: '',
  });

  const refreshData = () => {
    setReviews(reviewService.getAll());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('dta_reviews_update', handleUpdate);
    window.addEventListener('dta_storage_change', handleUpdate);
    return () => {
      window.removeEventListener('dta_reviews_update', handleUpdate);
      window.removeEventListener('dta_storage_change', handleUpdate);
    };
  }, []);

  // Compute Metrics
  const stats = useMemo(() => {
    const total = reviews.length;
    const published = reviews.filter((r) => r.status === 'published').length;
    const pending = reviews.filter((r) => r.status === 'pending').length;
    const featured = reviews.filter((r) => r.status === 'published' && r.isFeatured).length;
    const hidden = reviews.filter((r) => r.status === 'hidden').length;

    const ratedList = reviews.filter((r) => r.status === 'published');
    const avgRating =
      ratedList.length > 0
        ? (ratedList.reduce((acc, curr) => acc + curr.rating, 0) / ratedList.length).toFixed(2)
        : '5.00';

    return { total, published, pending, featured, hidden, avgRating };
  }, [reviews]);

  // Filtered Reviews List
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Tab filter
      if (activeTab === 'published' && r.status !== 'published') return false;
      if (activeTab === 'pending' && r.status !== 'pending') return false;
      if (activeTab === 'hidden' && r.status !== 'hidden') return false;
      if (activeTab === 'featured' && (!r.isFeatured || r.status !== 'published')) return false;

      // Persona filter
      if (selectedPersona !== 'all' && r.persona !== selectedPersona) return false;

      // Rating filter
      if (selectedRating !== 'all' && r.rating !== parseInt(selectedRating, 10)) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(query);
        const matchesRole = r.role.toLowerCase().includes(query);
        const matchesCity = r.city.toLowerCase().includes(query);
        const matchesOrg = (r.organizationOrCollege || '').toLowerCase().includes(query);
        const matchesHeadline = r.headline.toLowerCase().includes(query);
        const matchesQuote = r.quote.toLowerCase().includes(query);
        if (!matchesName && !matchesRole && !matchesCity && !matchesOrg && !matchesHeadline && !matchesQuote) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, activeTab, selectedPersona, selectedRating, searchQuery]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingReview(null);
    setFormData({
      name: '',
      role: 'BS Computer Science Student',
      persona: 'student',
      organizationOrCollege: 'FAST-NUCES Lahore',
      city: 'Lahore',
      avatar: '/images/landing/reseller-hamza.webp',
      rating: 5,
      headline: '',
      quote: '',
      revenueEarned: 'PKR 75,000 Withdrawn',
      ordersCount: 45,
      rankTier: 'Gold Partner',
      payoutMethod: 'Nayapay & JazzCash',
      status: 'published',
      isFeatured: false,
      adminNotes: '',
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (review: CustomerReview) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      role: review.role,
      persona: review.persona,
      organizationOrCollege: review.organizationOrCollege || '',
      city: review.city,
      avatar: review.avatar || '',
      rating: review.rating,
      headline: review.headline,
      quote: review.quote,
      revenueEarned: review.revenueEarned || '',
      ordersCount: review.ordersCount || 1,
      rankTier: review.rankTier || 'Silver Reseller',
      payoutMethod: review.payoutMethod || 'Direct Wallet',
      status: review.status,
      isFeatured: review.isFeatured,
      adminNotes: review.adminNotes || '',
    });
    setIsEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      toastError('Name and Review Quote are required.');
      return;
    }

    try {
      if (editingReview) {
        reviewService.updateReview(editingReview.id, {
          name: formData.name.trim(),
          role: formData.role.trim(),
          persona: formData.persona,
          organizationOrCollege: formData.organizationOrCollege.trim(),
          city: formData.city.trim(),
          avatar: formData.avatar.trim(),
          rating: formData.rating,
          headline: formData.headline.trim() || 'Verified Reseller Partner',
          quote: formData.quote.trim(),
          revenueEarned: formData.revenueEarned.trim(),
          ordersCount: Number(formData.ordersCount) || 1,
          rankTier: formData.rankTier,
          payoutMethod: formData.payoutMethod.trim(),
          status: formData.status,
          isFeatured: formData.isFeatured,
          adminNotes: formData.adminNotes.trim(),
        });
        toastSuccess(`Review for "${formData.name}" updated successfully.`);
      } else {
        reviewService.createReview({
          name: formData.name.trim(),
          role: formData.role.trim() || 'Reseller Partner',
          persona: formData.persona,
          organizationOrCollege: formData.organizationOrCollege.trim(),
          city: formData.city.trim() || 'Pakistan',
          avatar: formData.avatar.trim() || '/images/landing/reseller-hamza.webp',
          rating: formData.rating,
          headline: formData.headline.trim() || 'Verified Reseller Partner',
          quote: formData.quote.trim(),
          revenueEarned: formData.revenueEarned.trim() || 'PKR 50,000 Withdrawn',
          ordersCount: Number(formData.ordersCount) || 10,
          rankTier: formData.rankTier,
          payoutMethod: formData.payoutMethod.trim() || 'JazzCash / Easypaisa',
          status: formData.status,
          isFeatured: formData.isFeatured,
          isVerified: true,
          helpfulCount: 0,
          date: new Date().toISOString().split('T')[0],
          adminNotes: formData.adminNotes.trim(),
        });
        toastSuccess(`New review for "${formData.name}" added successfully.`);
      }

      setIsEditModalOpen(false);
      refreshData();
    } catch {
      toastError('An error occurred while saving the review.');
    }
  };

  // Quick Toggle Published
  const handleTogglePublish = (review: CustomerReview) => {
    const updated = reviewService.togglePublish(review.id);
    if (updated) {
      toastSuccess(
        `Review status changed to ${updated.status === 'published' ? 'Published' : 'Hidden'}.`
      );
      refreshData();
    }
  };

  // Quick Toggle Featured
  const handleToggleFeatured = (review: CustomerReview) => {
    const updated = reviewService.toggleFeatured(review.id);
    if (updated) {
      toastSuccess(
        `Review ${updated.isFeatured ? 'featured on landing page' : 'unfeatured from landing page'}.`
      );
      refreshData();
    }
  };

  // Quick Approve Pending Review
  const handleApprovePending = (review: CustomerReview) => {
    const updated = reviewService.approveReview(review.id);
    if (updated) {
      toastSuccess(`Submission from "${review.name}" approved and published to landing page!`);
      refreshData();
    }
  };

  // Delete Review
  const handleConfirmDelete = () => {
    if (!deleteCandidateId) return;
    const success = reviewService.deleteReview(deleteCandidateId);
    if (success) {
      toastSuccess('Review deleted successfully.');
      refreshData();
    } else {
      toastError('Could not delete review.');
    }
    setDeleteCandidateId(null);
  };

  // Reset to SaaS Curated Presets
  const handleResetToPresets = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the official curated 10-Year SaaS Reviews dataset? This will restore all verified student, homemaker, and merchant reviews.'
      )
    ) {
      reviewService.resetToDefaults();
      toastSuccess('Restored 12 curated SaaS customer reviews!');
      refreshData();
    }
  };

  const getPersonaBadge = (persona: ReviewPersona) => {
    switch (persona) {
      case 'student':
        return {
          label: 'Student',
          icon: GraduationCap,
          colorClass: 'bg-emerald-500/15 text-[var(--emerald)] border-emerald-500/30',
        };
      case 'homemaker':
        return {
          label: 'Homemaker',
          icon: House,
          colorClass: 'bg-[var(--champagne)]/15 text-[var(--champagne)] border-[var(--champagne)]/30',
        };
      case 'professional':
        return {
          label: 'Professional',
          icon: Briefcase,
          colorClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        };
      case 'retailer':
        return {
          label: 'Shop Owner',
          icon: Storefront,
          colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        };
      case 'creator':
        return {
          label: 'Creator',
          icon: VideoCamera,
          colorClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        };
      case 'entrepreneur':
        return {
          label: 'Entrepreneur',
          icon: RocketLaunch,
          colorClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        };
      default:
        return {
          label: 'Partner',
          icon: Sparkle,
          colorClass: 'bg-white/10 text-white border-white/20',
        };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[var(--champagne)]/10 text-[var(--champagne)] border border-[var(--champagne)]/20 shadow-sm">
              <Star size={20} weight="fill" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F4F7F5] tracking-tight">
                Customer Reviews Control Center
              </h1>
              <p className="text-xs text-[#9EABA2] font-mono mt-0.5">
                Manage verified student, homemaker, professional, and merchant reviews for SaaS landing page trust proof.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToPresets}
            className="funding-ghost-pill px-3 py-2 text-xs font-mono text-[#9EABA2] hover:text-[#F4F7F5] flex items-center gap-1.5"
            title="Restore official curated 10-year experience dataset"
          >
            <ArrowsClockwise size={13} />
            <span>Reset Curated Presets</span>
          </button>

          <a
            href="/#customer-reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="funding-ghost-pill px-3 py-2 text-xs font-mono text-[var(--champagne)] flex items-center gap-1.5"
          >
            <ArrowSquareOut size={13} />
            <span>View on Landing Page</span>
          </a>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="funding-champagne-sheen-btn px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} weight="bold" />
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="funding-card p-4 space-y-1">
          <div className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider flex items-center justify-between">
            <span>Total Reviews</span>
            <Star size={12} className="text-[#9EABA2]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#F4F7F5]">{stats.total}</div>
          <div className="text-[10px] font-mono text-[#9EABA2]">In database</div>
        </div>

        <div className="funding-card p-4 space-y-1 border-emerald-500/20">
          <div className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider flex items-center justify-between">
            <span>Published Live</span>
            <CheckCircle size={12} className="text-[var(--emerald)]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[var(--emerald)]">{stats.published}</div>
          <div className="text-[10px] font-mono text-[var(--emerald)]/80">Visible on landing page</div>
        </div>

        <div
          className={`funding-card p-4 space-y-1 ${
            stats.pending > 0 ? 'border-[var(--champagne)]/40 bg-[var(--champagne)]/5 ring-1 ring-[var(--champagne)]/30' : ''
          }`}
        >
          <div className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock size={12} className="text-[var(--champagne)]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[var(--champagne)]">{stats.pending}</div>
          <div className="text-[10px] font-mono text-[var(--champagne)]/80">
            {stats.pending > 0 ? 'Submissions need moderation' : 'Queue clean'}
          </div>
        </div>

        <div className="funding-card p-4 space-y-1">
          <div className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider flex items-center justify-between">
            <span>Featured Spotlight</span>
            <Sparkle size={12} className="text-[var(--champagne)]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#F4F7F5]">{stats.featured}</div>
          <div className="text-[10px] font-mono text-[#9EABA2]">Pinned reviews</div>
        </div>

        <div className="funding-card p-4 space-y-1 col-span-2 lg:col-span-1">
          <div className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider flex items-center justify-between">
            <span>Avg Trust Score</span>
            <Star size={12} weight="fill" className="text-[var(--champagne)]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[var(--champagne)]">{stats.avgRating}</div>
          <div className="text-[10px] font-mono text-[#9EABA2]">Across all published</div>
        </div>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tab Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-[#9EABA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>All Reviews</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">{stats.total}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('published')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'published'
                  ? 'bg-[var(--emerald)]/20 text-[var(--emerald)] font-semibold border border-[var(--emerald)]/30'
                  : 'text-[#9EABA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Published</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">{stats.published}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-[var(--champagne)]/20 text-[var(--champagne)] font-semibold border border-[var(--champagne)]/30'
                  : 'text-[#9EABA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Pending Moderation</span>
              {stats.pending > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--champagne)] text-black font-bold animate-pulse">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'featured'
                  ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30'
                  : 'text-[#9EABA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Featured</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">{stats.featured}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hidden')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeTab === 'hidden'
                  ? 'bg-neutral-800 text-neutral-200 font-semibold'
                  : 'text-[#9EABA2] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>Hidden / Drafts</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08]">{stats.hidden}</span>
            </button>
          </div>

          {/* Persona Filter Dropdown & Search Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value as any)}
              className="px-3 py-2 bg-[#0c120e] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)] font-mono"
            >
              <option value="all">All Personas</option>
              <option value="student">🎓 University Students</option>
              <option value="homemaker">🏡 Homemakers & Mothers</option>
              <option value="professional">💼 Working Professionals</option>
              <option value="retailer">🏪 Shop Owners & Merchants</option>
              <option value="creator">📱 Digital Creators</option>
              <option value="entrepreneur">🚀 Entrepreneurs</option>
            </select>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 bg-[#0c120e] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)] font-mono"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>

            <div className="relative min-w-[220px]">
              <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] placeholder-[#9EABA2] focus:outline-none focus:border-[var(--champagne)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9EABA2] hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table / Card Grid */}
      {filteredReviews.length === 0 ? (
        <div className="funding-card p-12 text-center space-y-3">
          <Star size={36} className="mx-auto text-[var(--champagne)] opacity-50" />
          <h3 className="text-base font-serif font-bold text-[#F4F7F5]">No reviews match criteria</h3>
          <p className="text-xs text-[#9EABA2] max-w-sm mx-auto">
            Try resetting your tab, search query, or persona filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSelectedPersona('all');
              setSelectedRating('all');
              setSearchQuery('');
            }}
            className="funding-ghost-pill px-4 py-1.5 text-xs text-[var(--champagne)]"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((review) => {
            const badge = getPersonaBadge(review.persona);
            const BadgeIcon = badge.icon;
            const isPending = review.status === 'pending';

            return (
              <div
                key={review.id}
                className={`funding-card p-5 space-y-4 transition-all duration-300 hover:border-[var(--champagne)]/40 ${
                  isPending ? 'border-[var(--champagne)]/30 bg-[var(--champagne)]/[0.02]' : ''
                }`}
              >
                {/* Header Row: Avatar + Details + Status + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--champagne)]/30 shrink-0 bg-neutral-900 flex items-center justify-center text-sm font-serif font-bold text-[var(--champagne)]">
                      {review.avatar ? (
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.endsWith('.webp')) {
                              target.src = review.avatar.replace('.webp', '.jpg');
                            } else {
                              target.style.display = 'none';
                            }
                          }}
                        />
                      ) : (
                        <span>{review.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-serif font-bold text-[#F4F7F5] flex items-center gap-1.5">
                          <span>{review.name}</span>
                          <SealCheck size={15} weight="fill" className="text-[var(--champagne)]" />
                        </span>

                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${badge.colorClass}`}
                        >
                          <BadgeIcon size={10} weight="bold" />
                          <span>{badge.label}</span>
                        </span>

                        {review.isFeatured && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                            <Star size={9} weight="fill" />
                            <span>Featured</span>
                          </span>
                        )}

                        {review.status === 'published' && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-[var(--emerald)] border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle size={9} weight="fill" />
                            <span>Live</span>
                          </span>
                        )}

                        {review.status === 'pending' && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[var(--champagne)]/20 text-[var(--champagne)] border border-[var(--champagne)]/30 flex items-center gap-1 animate-pulse">
                            <Clock size={9} weight="bold" />
                            <span>Awaiting Moderation</span>
                          </span>
                        )}

                        {review.status === 'hidden' && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                            Hidden
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-mono text-[#9EABA2]">
                        {review.role} · {review.organizationOrCollege ? `${review.organizationOrCollege} · ` : ''}
                        <span className="text-[#F4F7F5] font-medium">{review.city}</span>
                      </div>

                      <div className="flex items-center gap-3 pt-0.5 text-xs font-mono">
                        <div className="flex items-center gap-0.5 text-[var(--champagne)]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              weight={i < review.rating ? 'fill' : 'regular'}
                              className={i < review.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                            />
                          ))}
                        </div>

                        {review.revenueEarned && (
                          <span className="text-[11px] font-medium text-[var(--emerald)] flex items-center gap-1">
                            <Bank size={11} />
                            <span>{review.revenueEarned}</span>
                          </span>
                        )}

                        {review.payoutMethod && (
                          <span className="text-[10px] text-[#9EABA2] flex items-center gap-1">
                            <DeviceMobile size={11} />
                            <span>{review.payoutMethod}</span>
                          </span>
                        )}

                        <span className="text-[10px] text-[#9EABA2]">
                          Orders: <strong className="text-white font-mono">{review.ordersCount || 1}</strong>
                        </span>

                        <span className="text-[10px] text-[#9EABA2]">
                          Helpful: <strong className="text-white font-mono">{review.helpfulCount || 0}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                    {/* Approve Button if pending */}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleApprovePending(review)}
                        className="funding-champagne-sheen-btn px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                      >
                        <Check size={12} weight="bold" />
                        <span>Approve & Publish</span>
                      </button>
                    )}

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(review)}
                      className={`p-2 rounded-lg text-xs transition-colors border ${
                        review.status === 'published'
                          ? 'bg-emerald-500/10 text-[var(--emerald)] border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-white/[0.04] text-[#9EABA2] border-white/[0.08] hover:text-white'
                      }`}
                      title={review.status === 'published' ? 'Hide review from landing page' : 'Publish review'}
                    >
                      {review.status === 'published' ? <Eye size={15} /> : <EyeSlash size={15} />}
                    </button>

                    {/* Toggle Featured */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(review)}
                      className={`p-2 rounded-lg text-xs transition-colors border ${
                        review.isFeatured
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                          : 'bg-white/[0.04] text-[#9EABA2] border-white/[0.08] hover:text-white'
                      }`}
                      title={review.isFeatured ? 'Unpin from featured' : 'Pin as featured on landing page'}
                    >
                      <Star size={15} weight={review.isFeatured ? 'fill' : 'regular'} />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(review)}
                      className="p-2 rounded-lg text-xs bg-white/[0.04] text-[#F4F7F5] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                      title="Edit review details"
                    >
                      <NotePencil size={15} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeleteCandidateId(review.id)}
                      className="p-2 rounded-lg text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      title="Delete review"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>

                {/* Review Headline & Body */}
                <div className="space-y-1.5 pl-0 sm:pl-15">
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-[var(--champagne)]">
                    "{review.headline}"
                  </h4>
                  <p className="text-xs text-[#F4F7F5]/90 leading-relaxed font-sans italic">
                    "{review.quote}"
                  </p>
                  {review.adminNotes && (
                    <div className="mt-2 p-2 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] font-mono text-[#9EABA2]">
                      <span className="text-[var(--champagne)] font-semibold">Admin Note:</span> {review.adminNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT REVIEW MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="funding-card max-w-2xl w-full p-6 sm:p-8 rounded-2xl border-white/[0.12] space-y-6 max-h-[92vh] overflow-y-auto relative shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-[#9EABA2] hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <div className="luxury-eyebrow flex items-center gap-1.5 text-[var(--champagne)]">
                <Star size={14} weight="fill" />
                <span>Review Editor</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#F4F7F5]">
                {editingReview ? `Edit Review: ${editingReview.name}` : 'Add New Customer Review'}
              </h3>
              <p className="text-xs text-[#9EABA2] font-mono mt-0.5">
                Configure authentic Pakistani student, homemaker, professional, or merchant reviews.
              </p>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Reviewer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saad Bin Tariq"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Persona Category *</label>
                  <select
                    value={formData.persona}
                    onChange={(e) => setFormData({ ...formData, persona: e.target.value as ReviewPersona })}
                    className="w-full px-3 py-2 bg-[#0c120e] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)] font-mono"
                  >
                    <option value="student">🎓 University / College Student</option>
                    <option value="homemaker">🏡 Homemaker & Mother</option>
                    <option value="professional">💼 Working 9-to-5 Professional</option>
                    <option value="retailer">🏪 Shop Owner & Local Merchant</option>
                    <option value="creator">📱 Digital & TikTok Creator</option>
                    <option value="entrepreneur">🚀 First-Time Entrepreneur</option>
                    <option value="other">⭐ Other Verified Partner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Role / Affiliation</label>
                  <input
                    type="text"
                    placeholder="e.g. BS Computer Science Student, FAST-NUCES"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore, Karachi, Rawalpindi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="/images/landing/reseller-hamza.webp or external URL"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                  />
                  <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-[#9EABA2]">
                    <span>Presets:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '/images/landing/reseller-ayesha.webp' })}
                      className="hover:text-[var(--champagne)] underline"
                    >
                      Ayesha
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '/images/landing/reseller-hamza.webp' })}
                      className="hover:text-[var(--champagne)] underline"
                    >
                      Hamza
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '/images/landing/reseller-zainab.webp' })}
                      className="hover:text-[var(--champagne)] underline"
                    >
                      Zainab
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: '/images/landing/reseller-bilal.webp' })}
                      className="hover:text-[var(--champagne)] underline"
                    >
                      Bilal
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Rating (1-5 Stars)</label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={20}
                          weight={star <= formData.rating ? 'fill' : 'regular'}
                          className={star <= formData.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-[var(--champagne)] ml-2">
                      {formData.rating} Stars
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#9EABA2]">Review Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Covered my 6th semester tuition fee without burdening my parents"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#9EABA2]">Full Story & Review *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Full authentic review quote detailing real reseller metrics, COD experience, packaging, and profit payout..."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)] leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Revenue Metric</label>
                  <input
                    type="text"
                    placeholder="e.g. PKR 94,000 Withdrawn"
                    value={formData.revenueEarned}
                    onChange={(e) => setFormData({ ...formData, revenueEarned: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Milestone Rank</label>
                  <select
                    value={formData.rankTier}
                    onChange={(e) => setFormData({ ...formData, rankTier: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0c120e] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)] font-mono"
                  >
                    <option value="Silver Reseller">Silver Reseller</option>
                    <option value="Gold Partner">Gold Partner</option>
                    <option value="Platinum Partner">Platinum Partner</option>
                    <option value="Diamond Pinnacle">Diamond Pinnacle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Payout Method</label>
                  <input
                    type="text"
                    placeholder="e.g. Nayapay & JazzCash"
                    value={formData.payoutMethod}
                    onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[#9EABA2]">Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ReviewStatus })}
                    className="w-full px-3 py-2 bg-[#0c120e] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)] font-mono"
                  >
                    <option value="published">Published (Live on Landing)</option>
                    <option value="pending">Pending Moderation</option>
                    <option value="hidden">Hidden / Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFeaturedToggle"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--champagne)] bg-neutral-900 border-white/[0.2] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isFeaturedToggle" className="text-xs font-mono text-[#F4F7F5] cursor-pointer">
                    Pin as Featured Spotlight Review
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#9EABA2]">Admin Internal Notes</label>
                <input
                  type="text"
                  placeholder="Private admin verification note..."
                  value={formData.adminNotes}
                  onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[#F4F7F5] focus:outline-none focus:border-[var(--champagne)]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="funding-ghost-pill px-4 py-2 text-xs text-[#F4F7F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="funding-champagne-sheen-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  {editingReview ? 'Save Changes' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="funding-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash size={24} />
            </div>
            <h4 className="text-base font-serif font-bold text-[#F4F7F5]">Delete Customer Review?</h4>
            <p className="text-xs text-[#9EABA2]">
              Are you sure you want to permanently remove this review? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="funding-ghost-pill px-4 py-2 text-xs text-[#F4F7F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;

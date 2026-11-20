import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import { reviewService } from '@/services/reviewService';
import type { CustomerReview, ReviewPersona } from '@/types';
import {
  Sparkle,
  Star,
  SealCheck,
  GraduationCap,
  House,
  Briefcase,
  Storefront,
  VideoCamera,
  RocketLaunch,
  ThumbsUp,
  ShieldCheck,
  CheckCircle,
  X,
  MagnifyingGlass,
  Plus,
  Quotes,
  Bank,
  DeviceMobile,
  ArrowRight,
  Eye,
} from '@phosphor-icons/react';
import { useToast } from '@/context/ToastContext';

interface CustomerReviewsSectionProps {
  className?: string;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({ className = '' }) => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [reviews, setReviews] = useState<CustomerReview[]>(() => reviewService.getPublished());
  const [selectedPersona, setSelectedPersona] = useState<ReviewPersona | 'all'>('all');
  const [viewMode, setViewMode] = useState<'marquee' | 'grid'>('marquee');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedReviewForModal, setSelectedReviewForModal] = useState<CustomerReview | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // User Submission Form State
  const [formData, setFormData] = useState({
    name: '',
    persona: 'student' as ReviewPersona,
    role: '',
    organizationOrCollege: '',
    city: '',
    rating: 5,
    headline: '',
    quote: '',
    payoutMethod: 'JazzCash / Easypaisa',
    revenueEarned: '',
    ordersCount: 1,
    avatar: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helpful state tracker
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleUpdate = () => {
      setReviews(reviewService.getPublished());
    };
    window.addEventListener('dta_reviews_update', handleUpdate);
    window.addEventListener('dta_storage_change', handleUpdate);
    return () => {
      window.removeEventListener('dta_reviews_update', handleUpdate);
      window.removeEventListener('dta_storage_change', handleUpdate);
    };
  }, []);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchPersona = selectedPersona === 'all' || r.persona === selectedPersona;
      const matchSearch =
        searchQuery.trim() === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.organizationOrCollege && r.organizationOrCollege.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.headline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPersona && matchSearch;
    });
  }, [reviews, selectedPersona, searchQuery]);

  // Dual marquee tracks (split for smooth staggered multi-row flow)
  const topMarqueeItems = useMemo(() => {
    const list = filteredReviews.slice(0, Math.ceil(filteredReviews.length / 2));
    const pool = list.length >= 3 ? list : filteredReviews;
    return [...pool, ...pool, ...pool, ...pool];
  }, [filteredReviews]);

  const bottomMarqueeItems = useMemo(() => {
    const list = filteredReviews.slice(Math.ceil(filteredReviews.length / 2));
    const pool = list.length >= 3 ? list : filteredReviews;
    return [...pool, ...pool, ...pool, ...pool];
  }, [filteredReviews]);

  const getPersonaBadge = (persona: ReviewPersona) => {
    switch (persona) {
      case 'student':
        return {
          label: 'University Student',
          icon: GraduationCap,
          colorClass: 'bg-emerald-500/10 text-[var(--emerald)] border-emerald-500/20',
        };
      case 'homemaker':
        return {
          label: 'Homemaker & Mother',
          icon: House,
          colorClass: 'bg-[var(--champagne)]/10 text-[var(--champagne)] border-[var(--champagne)]/20',
        };
      case 'professional':
        return {
          label: 'Working Professional',
          icon: Briefcase,
          colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        };
      case 'retailer':
        return {
          label: 'Retailer & Merchant',
          icon: Storefront,
          colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'creator':
        return {
          label: 'Digital Creator',
          icon: VideoCamera,
          colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        };
      case 'entrepreneur':
        return {
          label: 'Entrepreneur',
          icon: RocketLaunch,
          colorClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
      default:
        return {
          label: 'Verified Reseller',
          icon: Sparkle,
          colorClass: 'bg-white/10 text-[var(--text-primary)] border-white/20',
        };
    }
  };

  const handleHelpfulClick = (e: React.MouseEvent, reviewId: string) => {
    e.stopPropagation();
    const success = reviewService.incrementHelpful(reviewId);
    if (success) {
      setHelpfulMap((prev) => ({ ...prev, [reviewId]: true }));
      toastSuccess('Thank you for your feedback! Marked as helpful.');
    } else {
      toastSuccess('You have already marked this review as helpful.');
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.quote.trim()) {
      toastError('Please fill in your name and review details.');
      return;
    }

    setIsSubmitting(true);
    try {
      reviewService.submitPublicReview({
        name: formData.name,
        role: formData.role || `${formData.persona.toUpperCase()} Reseller`,
        persona: formData.persona,
        organizationOrCollege: formData.organizationOrCollege,
        city: formData.city || 'Pakistan',
        avatar: formData.avatar,
        rating: formData.rating,
        headline: formData.headline || 'Verified partner experience',
        quote: formData.quote,
        payoutMethod: formData.payoutMethod,
        revenueEarned: formData.revenueEarned || 'Verified Margin',
        ordersCount: Number(formData.ordersCount) || 1,
      });

      toastSuccess('Your review has been submitted for verified moderation. Thank you for empowering our community!');
      setIsSubmitModalOpen(false);
      setFormData({
        name: '',
        persona: 'student',
        role: '',
        organizationOrCollege: '',
        city: '',
        rating: 5,
        headline: '',
        quote: '',
        payoutMethod: 'JazzCash / Easypaisa',
        revenueEarned: '',
        ordersCount: 1,
        avatar: '',
      });
    } catch {
      toastError('Could not submit review at this moment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Persona counts for pill badges
  const personaCounts = useMemo(() => {
    return {
      all: reviews.length,
      student: reviews.filter((r) => r.persona === 'student').length,
      homemaker: reviews.filter((r) => r.persona === 'homemaker').length,
      professional: reviews.filter((r) => r.persona === 'professional').length,
      retailer: reviews.filter((r) => r.persona === 'retailer').length,
      creator: reviews.filter((r) => r.persona === 'creator').length,
      entrepreneur: reviews.filter((r) => r.persona === 'entrepreneur').length,
    };
  }, [reviews]);

  return (
    <section className={`relative py-24 sm:py-32 border-b border-[var(--line)] overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-10 left-1/4 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(217,192,138,0.06),transparent_70%)] blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 w-[450px] h-[320px] bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.05),transparent_70%)] blur-3xl -z-10" />

      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-12">
        {/* SaaS 10-Year Header & Trust Eyebrow */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="luxury-eyebrow inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--champagne)]/10 border border-[var(--champagne)]/20 shadow-sm">
            <Sparkle size={13} weight="fill" className="text-[var(--champagne)] animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-[var(--champagne)] uppercase font-semibold">
              10+ Years Reseller Enablement & Proven Infrastructure
            </span>
          </div>

          <h2 className="display-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)] tracking-tight">
            Loved by Students, Homemakers & Independent Merchants
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            From university hostel rooms in Lahore to family boutiques in Rawalpindi and electronics shops in Sialkot — real
            independent partners generating reliable weekly profits with zero inventory lock-in.
          </p>

          {/* SaaS Trust Proof Metrics Strip */}
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-3.5 rounded-xl border-white/[0.08] text-center space-y-1 hover:border-[var(--champagne)]/30 transition-colors">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[var(--champagne)] flex items-center justify-center gap-1">
                <span>4.92</span>
                <span className="text-xs text-[var(--text-muted)] font-mono font-normal">/ 5.0</span>
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Star size={11} weight="fill" className="text-[var(--champagne)]" />
                <span>18,400+ Verified Ratings</span>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-white/[0.08] text-center space-y-1 hover:border-[var(--emerald)]/30 transition-colors">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[var(--emerald)]">
                PKR 180M+
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-center gap-1">
                <Bank size={11} className="text-[var(--emerald)]" />
                <span>Reseller Margins Disbursed</span>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-white/[0.08] text-center space-y-1 hover:border-white/20 transition-colors">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
                99.2%
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-center gap-1">
                <ShieldCheck size={11} className="text-sky-400" />
                <span>COD Delivery Completion</span>
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-white/[0.08] text-center space-y-1 hover:border-white/20 transition-colors">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
                24-48h
              </div>
              <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-center gap-1">
                <DeviceMobile size={11} className="text-[var(--champagne)]" />
                <span>JazzCash & Bank Transfers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls & Persona Filter Pills */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Persona Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedPersona('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'all'
                    ? 'bg-[var(--champagne)] text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <span>All Stories</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersona('student')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'student'
                    ? 'bg-[var(--emerald)] text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <GraduationCap size={14} weight="fill" />
                <span>University Students</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.student}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersona('homemaker')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'homemaker'
                    ? 'bg-[var(--champagne)] text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <House size={14} weight="fill" />
                <span>Homemakers</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.homemaker}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersona('professional')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'professional'
                    ? 'bg-sky-400 text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <Briefcase size={14} weight="fill" />
                <span>9-to-5 Professionals</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.professional}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersona('retailer')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'retailer'
                    ? 'bg-amber-400 text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <Storefront size={14} weight="fill" />
                <span>Shop Owners & Retailers</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.retailer}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersona('creator')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'creator'
                    ? 'bg-purple-400 text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <VideoCamera size={14} weight="fill" />
                <span>Creators</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.creator}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersona('entrepreneur')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  selectedPersona === 'entrepreneur'
                    ? 'bg-rose-400 text-[#070B09] font-bold shadow-sm'
                    : 'bg-white/[0.05] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.08] border border-white/[0.08]'
                }`}
              >
                <RocketLaunch size={14} weight="fill" />
                <span>Entrepreneurs</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-sans">
                  {personaCounts.entrepreneur}
                </span>
              </button>
            </div>

            {/* Right side mode toggles & Share Story button */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center">
                <button
                  type="button"
                  onClick={() => setViewMode('marquee')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    viewMode === 'marquee'
                      ? 'bg-[var(--champagne)]/15 text-[var(--champagne)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Live Stream
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--champagne)]/15 text-[var(--champagne)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Card Grid
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="funding-champagne-sheen-btn text-xs px-3.5 py-1.5 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={13} weight="bold" />
                <span>Share Your Story</span>
              </button>
            </div>
          </div>

          {/* Search bar when in Grid Mode */}
          {viewMode === 'grid' && (
            <div className="relative max-w-md">
              <MagnifyingGlass
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                placeholder="Search by student name, city, university, or quote..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--champagne)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RENDER MODE 1: Smooth Continuous SaaS Dual Marquee */}
      {viewMode === 'marquee' ? (
        <div className="relative w-full mt-10 overflow-hidden space-y-6">
          {/* Edge gradient masks */}
          <div className="absolute left-0 inset-y-0 w-16 sm:w-36 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-16 sm:w-36 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />

          {/* Row 1: Leftward moving track */}
          <div className="animate-marquee-luxury flex gap-6 px-4 py-2">
            {topMarqueeItems.map((item, index) => {
              const badge = getPersonaBadge(item.persona);
              const BadgeIcon = badge.icon;
              const hasLiked = helpfulMap[item.id];

              return (
                <GlassCard
                  key={`top-${item.id}-${index}`}
                  interactive={true}
                  onClick={() => setSelectedReviewForModal(item)}
                  className="w-[360px] sm:w-[420px] shrink-0 p-6 space-y-4 border-white/[0.08] hover:border-[var(--champagne-border)] transition-all duration-400 group cursor-pointer"
                >
                  {/* Top row: Avatar + Name + Persona Tag + Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--champagne-border)] shrink-0 shadow-sm bg-neutral-900 flex items-center justify-center text-sm font-serif font-bold text-[var(--champagne)]">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.endsWith('.webp')) {
                                target.src = item.avatar.replace('.webp', '.jpg');
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <span>{item.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                          <span>{item.name}</span>
                          <SealCheck size={14} weight="fill" className="text-[var(--champagne)] shrink-0" />
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                          {item.role}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]/70 truncate">
                          {item.organizationOrCollege ? `${item.organizationOrCollege} · ` : ''}
                          {item.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-0.5 text-[var(--champagne)]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            weight={i < item.rating ? 'fill' : 'regular'}
                            className={i < item.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${badge.colorClass}`}
                      >
                        <BadgeIcon size={10} weight="bold" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Headline & Quote */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs sm:text-[13px] font-serif font-semibold text-[var(--champagne)] line-clamp-1">
                      "{item.headline}"
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[var(--text-primary)]/85 leading-[1.65] italic line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Bottom Row: Metrics & Verification */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.1] text-[10px] text-[var(--champagne)] font-medium">
                        {item.rankTier || 'Verified Reseller'}
                      </span>
                      {item.revenueEarned && (
                        <span className="text-[11px] text-[var(--emerald)] font-semibold">
                          {item.revenueEarned}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleHelpfulClick(e, item.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 transition-colors ${
                          hasLiked
                            ? 'bg-[var(--emerald)]/20 text-[var(--emerald)] border border-[var(--emerald)]/30'
                            : 'bg-white/[0.04] text-[var(--text-muted)] hover:text-white border border-white/[0.08]'
                        }`}
                        title="Mark as helpful"
                      >
                        <ThumbsUp size={10} weight={hasLiked ? 'fill' : 'regular'} />
                        <span>{(item.helpfulCount || 0) + (hasLiked ? 1 : 0)}</span>
                      </button>

                      <span className="text-[10px] text-[var(--text-muted)]/60 group-hover:text-[var(--champagne)] flex items-center gap-0.5 transition-colors">
                        <span>Details</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Row 2: Rightward moving track (Staggered continuous flow) */}
          <div className="animate-marquee-luxury-reverse flex gap-6 px-4 py-2">
            {bottomMarqueeItems.map((item, index) => {
              const badge = getPersonaBadge(item.persona);
              const BadgeIcon = badge.icon;
              const hasLiked = helpfulMap[item.id];

              return (
                <GlassCard
                  key={`bot-${item.id}-${index}`}
                  interactive={true}
                  onClick={() => setSelectedReviewForModal(item)}
                  className="w-[360px] sm:w-[420px] shrink-0 p-6 space-y-4 border-white/[0.08] hover:border-[var(--champagne-border)] transition-all duration-400 group cursor-pointer"
                >
                  {/* Top row: Avatar + Name + Persona Tag + Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--champagne-border)] shrink-0 shadow-sm bg-neutral-900 flex items-center justify-center text-sm font-serif font-bold text-[var(--champagne)]">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            decoding="async"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.endsWith('.webp')) {
                                target.src = item.avatar.replace('.webp', '.jpg');
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <span>{item.name.charAt(0)}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                          <span>{item.name}</span>
                          <SealCheck size={14} weight="fill" className="text-[var(--champagne)] shrink-0" />
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                          {item.role}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]/70 truncate">
                          {item.organizationOrCollege ? `${item.organizationOrCollege} · ` : ''}
                          {item.city}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-0.5 text-[var(--champagne)]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            weight={i < item.rating ? 'fill' : 'regular'}
                            className={i < item.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${badge.colorClass}`}
                      >
                        <BadgeIcon size={10} weight="bold" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Headline & Quote */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs sm:text-[13px] font-serif font-semibold text-[var(--champagne)] line-clamp-1">
                      "{item.headline}"
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[var(--text-primary)]/85 leading-[1.65] italic line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Bottom Row: Metrics & Verification */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.1] text-[10px] text-[var(--champagne)] font-medium">
                        {item.rankTier || 'Verified Reseller'}
                      </span>
                      {item.revenueEarned && (
                        <span className="text-[11px] text-[var(--emerald)] font-semibold">
                          {item.revenueEarned}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleHelpfulClick(e, item.id)}
                        className={`px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 transition-colors ${
                          hasLiked
                            ? 'bg-[var(--emerald)]/20 text-[var(--emerald)] border border-[var(--emerald)]/30'
                            : 'bg-white/[0.04] text-[var(--text-muted)] hover:text-white border border-white/[0.08]'
                        }`}
                        title="Mark as helpful"
                      >
                        <ThumbsUp size={10} weight={hasLiked ? 'fill' : 'regular'} />
                        <span>{(item.helpfulCount || 0) + (hasLiked ? 1 : 0)}</span>
                      </button>

                      <span className="text-[10px] text-[var(--text-muted)]/60 group-hover:text-[var(--champagne)] flex items-center gap-0.5 transition-colors">
                        <span>Details</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ) : (
        /* RENDER MODE 2: Categorized Interactive Grid */
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 mt-10">
          {filteredReviews.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border-white/[0.08] space-y-3">
              <Quotes size={36} className="mx-auto text-[var(--champagne)] opacity-50" />
              <h3 className="text-base font-serif font-semibold text-[var(--text-primary)]">
                No customer reviews match your criteria
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Try switching the persona category or clearing the search query to see other verified reseller stories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedPersona('all');
                  setSearchQuery('');
                }}
                className="mt-2 funding-ghost-pill px-4 py-1.5 text-xs text-[var(--champagne)]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((item) => {
                const badge = getPersonaBadge(item.persona);
                const BadgeIcon = badge.icon;
                const hasLiked = helpfulMap[item.id];

                return (
                  <GlassCard
                    key={`grid-${item.id}`}
                    interactive={true}
                    onClick={() => setSelectedReviewForModal(item)}
                    className="p-6 space-y-4 border-white/[0.08] hover:border-[var(--champagne-border)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--champagne-border)] shrink-0 shadow-sm bg-neutral-900 flex items-center justify-center text-sm font-serif font-bold text-[var(--champagne)]">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.name}
                                decoding="async"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src.endsWith('.webp')) {
                                    target.src = item.avatar.replace('.webp', '.jpg');
                                  } else {
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            ) : (
                              <span>{item.name.charAt(0)}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                              <span>{item.name}</span>
                              <SealCheck size={14} weight="fill" className="text-[var(--champagne)] shrink-0" />
                            </div>
                            <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                              {item.role}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)]/70 truncate">
                              {item.organizationOrCollege ? `${item.organizationOrCollege} · ` : ''}
                              {item.city}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 shrink-0 ${badge.colorClass}`}
                        >
                          <BadgeIcon size={10} weight="bold" />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* Stars & Headline */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-0.5 text-[var(--champagne)]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              weight={i < item.rating ? 'fill' : 'regular'}
                              className={i < item.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                            />
                          ))}
                        </div>
                        <h4 className="text-sm font-serif font-semibold text-[var(--champagne)]">
                          "{item.headline}"
                        </h4>
                        <p className="text-xs text-[var(--text-primary)]/85 leading-relaxed italic">
                          "{item.quote}"
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata & Helpful Button */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-[var(--champagne)]">
                          {item.rankTier || 'Verified Reseller'}
                        </span>
                        {item.revenueEarned && (
                          <div className="text-[11px] text-[var(--emerald)] font-semibold">
                            {item.revenueEarned}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleHelpfulClick(e, item.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1 transition-colors ${
                            hasLiked
                              ? 'bg-[var(--emerald)]/20 text-[var(--emerald)] border border-[var(--emerald)]/30'
                              : 'bg-white/[0.04] text-[var(--text-muted)] hover:text-white border border-white/[0.08]'
                          }`}
                        >
                          <ThumbsUp size={11} weight={hasLiked ? 'fill' : 'regular'} />
                          <span>Helpful ({(item.helpfulCount || 0) + (hasLiked ? 1 : 0)})</span>
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULL STORY MODAL */}
      {selectedReviewForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-2xl border-white/[0.12] space-y-6 max-h-[90vh] overflow-y-auto relative shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
            <button
              type="button"
              onClick={() => setSelectedReviewForModal(null)}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--champagne)] shrink-0 shadow-md bg-neutral-900 flex items-center justify-center text-lg font-serif font-bold text-[var(--champagne)]">
                {selectedReviewForModal.avatar ? (
                  <img
                    src={selectedReviewForModal.avatar}
                    alt={selectedReviewForModal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.endsWith('.webp')) {
                        target.src = selectedReviewForModal.avatar.replace('.webp', '.jpg');
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <span>{selectedReviewForModal.name.charAt(0)}</span>
                )}
              </div>

              <div>
                <div className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>{selectedReviewForModal.name}</span>
                  <SealCheck size={18} weight="fill" className="text-[var(--champagne)]" />
                </div>
                <div className="text-xs font-mono text-[var(--champagne)]">
                  {selectedReviewForModal.role}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)]">
                  {selectedReviewForModal.organizationOrCollege ? `${selectedReviewForModal.organizationOrCollege} · ` : ''}
                  {selectedReviewForModal.city}, Pakistan
                </div>
              </div>
            </div>

            {/* Persona & Rating strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-1 text-[var(--champagne)]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    weight={i < selectedReviewForModal.rating ? 'fill' : 'regular'}
                    className={i < selectedReviewForModal.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                  />
                ))}
                <span className="text-xs font-mono text-[var(--text-muted)] ml-2">
                  5.0 Verified Review
                </span>
              </div>

              <div className="text-xs font-mono text-[var(--emerald)] flex items-center gap-1">
                <CheckCircle size={14} weight="fill" />
                <span>Verified Independent Reseller</span>
              </div>
            </div>

            {/* Full Story Content */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[var(--champagne)]">
                "{selectedReviewForModal.headline}"
              </h3>
              <p className="text-sm text-[var(--text-primary)]/90 leading-relaxed font-sans">
                "{selectedReviewForModal.quote}"
              </p>
            </div>

            {/* Key Verified Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-black/40 border border-white/[0.06] text-center font-mono">
              <div className="space-y-0.5">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Milestone Rank</div>
                <div className="text-xs font-bold text-[var(--champagne)]">
                  {selectedReviewForModal.rankTier || 'Silver Reseller'}
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Verified Withdrawals</div>
                <div className="text-xs font-bold text-[var(--emerald)]">
                  {selectedReviewForModal.revenueEarned || 'Confidential'}
                </div>
              </div>

              <div className="space-y-0.5 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-[var(--text-muted)] uppercase">Payout Channel</div>
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {selectedReviewForModal.payoutMethod || 'Direct Wallet / Bank'}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={(e) => handleHelpfulClick(e, selectedReviewForModal.id)}
                className="funding-ghost-pill px-4 py-2 text-xs flex items-center gap-1.5 text-[var(--text-primary)]"
              >
                <ThumbsUp size={13} />
                <span>Helpful ({selectedReviewForModal.helpfulCount || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReviewForModal(null)}
                className="funding-champagne-sheen-btn px-5 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE YOUR REVIEW MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-2xl border-white/[0.12] space-y-6 max-h-[90vh] overflow-y-auto relative shadow-[0_20px_70px_rgba(0,0,0,0.8)]">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="space-y-2">
              <div className="luxury-eyebrow flex items-center gap-1.5 text-[var(--champagne)]">
                <Sparkle size={13} />
                <span>Community Voices</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--text-primary)]">
                Share Your Reseller Journey
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Your authentic story inspires thousands of students, homemakers, and fresh entrepreneurs across Pakistan.
                Submissions are verified and featured on the live showcase.
              </p>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--text-muted)]">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Tariq"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--text-muted)]">I am a... *</label>
                  <select
                    value={formData.persona}
                    onChange={(e) => setFormData({ ...formData, persona: e.target.value as ReviewPersona })}
                    className="w-full px-3 py-2 bg-[#0c120e] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                  >
                    <option value="student">🎓 University / College Student</option>
                    <option value="homemaker">🏡 Homemaker / Mother</option>
                    <option value="professional">💼 9-to-5 Working Professional</option>
                    <option value="retailer">🏪 Shop Owner / Local Merchant</option>
                    <option value="creator">📱 Digital / TikTok Creator</option>
                    <option value="entrepreneur">🚀 First-Time Entrepreneur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--text-muted)]">
                    Role / University / Store
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FAST Lahore or Home Boutique"
                    value={formData.organizationOrCollege}
                    onChange={(e) => setFormData({ ...formData, organizationOrCollege: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--text-muted)]">City in Pakistan *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lahore, Karachi, Rawalpindi"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[var(--text-muted)]">Overall Rating</label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        size={22}
                        weight={star <= formData.rating ? 'fill' : 'regular'}
                        className={star <= formData.rating ? 'text-[var(--champagne)]' : 'text-neutral-600'}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-[var(--champagne)] ml-2">
                    {formData.rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[var(--text-muted)]">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Covered my university fees with zero capital risk"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[var(--text-muted)]">Your Story & Experience *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us how you get orders, which categories sell best, how COD courier dispatch worked, and how payouts landed in your wallet..."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)] leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--text-muted)]">Approximate Profit Earned</label>
                  <input
                    type="text"
                    placeholder="e.g. PKR 65,000 Withdrawn"
                    value={formData.revenueEarned}
                    onChange={(e) => setFormData({ ...formData, revenueEarned: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-[var(--text-muted)]">Payout Method Used</label>
                  <input
                    type="text"
                    placeholder="e.g. JazzCash, Nayapay, Meezan"
                    value={formData.payoutMethod}
                    onChange={(e) => setFormData({ ...formData, payoutMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--champagne)]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="funding-ghost-pill px-4 py-2 text-xs text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="funding-champagne-sheen-btn px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

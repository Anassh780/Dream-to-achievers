import React from 'react';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import { Sparkle, Star, SealCheck } from '@phosphor-icons/react';

interface Testimonial {
  name: string;
  city: string;
  rank: string;
  revenue: string;
  avatar: string;
  quote: string;
  category: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Ayesha Tariq',
    city: 'Lahore',
    rank: 'Gold Partner',
    revenue: 'PKR 84,500 Withdrawn',
    avatar: '/images/landing/reseller-ayesha.webp',
    quote:
      'I started without any stock or advance capital. The skincare catalog items sell effortlessly on WhatsApp groups because the product formulas are genuine and margins are guaranteed.',
    category: 'Skincare & Derma',
  },
  {
    name: 'Hamza Naveed',
    city: 'Faisalabad',
    rank: 'Platinum Rank',
    revenue: 'PKR 62,000 Withdrawn',
    avatar: '/images/landing/reseller-hamza.webp',
    quote:
      'The TikTok video scripts and demo reels changed everything for my store. I get 15 to 20 COD orders every week and payouts hit my wallet automatically.',
    category: 'Lifestyle Tech',
  },
  {
    name: 'Zainab Bibi',
    city: 'Rawalpindi',
    rank: 'Diamond Pinnacle',
    revenue: 'PKR 142,000 Withdrawn',
    avatar: '/images/landing/reseller-zainab.webp',
    quote:
      'As a homemaker, having Dream to Achievers handle customer packaging and courier delivery gave me full financial independence. The PKR 10,000 milestone bonus was real.',
    category: 'Multi-Category',
  },
  {
    name: 'Bilal Farooq',
    city: 'Karachi',
    rank: 'Gold Executive',
    revenue: 'PKR 96,000 Withdrawn',
    avatar: '/images/landing/reseller-bilal.webp',
    quote:
      'COD delivery across Pakistan has always been a pain point for independent sellers. DTA solved this completely with their automated dispatch and transparent ledger.',
    category: 'Smart Peripherals',
  },
];

export const TestimonialMarquee: React.FC = () => {
  // Duplicate array for infinite seamless looping
  const marqueeItems = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="relative py-24 sm:py-32 border-b border-[var(--line)] overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="luxury-eyebrow flex items-center justify-center gap-2">
            <Sparkle size={13} className="text-[var(--champagne)]" />
            <span>Verified Reseller Ledger</span>
          </div>
          <h2 className="display-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Endorsed by independent commerce leaders
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Real partners generating consistent weekly margins through our wholesale distribution pipeline.
          </p>
        </div>

      </div>

      {/* Marquee Container with subtle gradient masks on left and right edges */}
      <div className="relative w-full mt-10 overflow-hidden">
        {/* Left & Right fade masks */}
        <div className="absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="animate-marquee-luxury flex gap-6 px-4 py-4">
          {marqueeItems.map((item, index) => (
            <GlassCard
              key={`${item.name}-${index}`}
              interactive={true}
              className="w-[340px] sm:w-[400px] shrink-0 p-6 space-y-4 border-white/[0.08] hover:border-[var(--champagne-border)] transition-all duration-400"
            >
              {/* Top Row: Avatar + Partner Info + Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--champagne-border)] shrink-0 shadow-sm">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith('.webp')) {
                          target.src = item.avatar.replace('.webp', '.jpg');
                        }
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>{item.name}</span>
                      <SealCheck size={14} weight="fill" className="text-[var(--champagne)]" />
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">
                      {item.city} · {item.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-[var(--champagne)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} weight="fill" />
                  ))}
                </div>
              </div>

              {/* Reseller Quote */}
              <p className="text-xs sm:text-[13px] text-[var(--text-primary)]/90 leading-[1.65] italic">
                "{item.quote}"
              </p>

              {/* Bottom Row: Milestone Rank and Realized Payout Badge */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-[10px] font-mono text-[var(--champagne)]">
                  {item.rank}
                </span>
                <div className="text-right">
                  <span className="text-[11px] font-mono font-medium text-[var(--emerald)]">
                    {item.revenue}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

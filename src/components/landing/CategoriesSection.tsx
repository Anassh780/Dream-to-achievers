import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/luxury/ScrollReveal';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import { ArrowUpRight, Sparkle, SealCheck } from '@phosphor-icons/react';

interface CategoryTileData {
  id: string;
  title: string;
  categorySlug: string;
  eyebrow: string;
  image: string;
  marginText: string;
  description: string;
  skuCount: string;
}

const CATEGORIES: CategoryTileData[] = [
  {
    id: 'cat-skincare',
    title: 'Skincare & Derma',
    categorySlug: 'skincare',
    eyebrow: 'BEAUTY & CLINICAL',
    image: '/images/landing/cat-skincare.webp',
    marginText: 'PKR 650 – 1,300 margin',
    description: 'High-demand hyaluronic serums, brightening creams, and tested dermatological treatments.',
    skuCount: '48 Verified SKUs',
  },
  {
    id: 'cat-perfume',
    title: 'Luxury Fragrances & Attars',
    categorySlug: 'skincare',
    eyebrow: 'HAUTE PARFUMERIE',
    image: '/images/landing/cat-perfume.webp',
    marginText: 'PKR 800 – 1,600 margin',
    description: 'Niche French oil impressions, pure concentrated attars, and luxury gold-flacon gift sets.',
    skuCount: '32 Verified SKUs',
  },
  {
    id: 'cat-tech',
    title: 'Lifestyle Electronics',
    categorySlug: 'electronics',
    eyebrow: 'SMART AUDIO & GADGETS',
    image: '/images/landing/cat-tech.webp',
    marginText: 'PKR 500 – 1,150 margin',
    description: 'Fast-moving wireless ANC acoustics, smart watches, and phone peripherals with guaranteed QC.',
    skuCount: '38 Verified SKUs',
  },
  {
    id: 'cat-wellness',
    title: 'Personal Wellness',
    categorySlug: 'wellness',
    eyebrow: 'ORGANIC ESSENTIALS',
    image: '/images/landing/cat-wellness.webp',
    marginText: 'PKR 600 – 1,200 margin',
    description: 'Specialty grooming sets, personal health accessories, and organic care formulas.',
    skuCount: '24 Verified SKUs',
  },
];

export const CategoriesSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-b border-[var(--line)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-950/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1240px] mx-auto space-y-14 sm:space-y-16 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[var(--champagne-hairline)]">
          <div className="space-y-2">
            <div className="luxury-eyebrow flex items-center gap-2">
              <Sparkle size={13} className="text-[var(--champagne)]" />
              <span>Verified Wholesale Catalog</span>
            </div>
            <h2 className="display-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
              Curated for high-velocity reseller margin
            </h2>
          </div>
          <Link
            to="/products"
            className="funding-sheen-btn px-6 py-2.5 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-2 self-start md:self-auto shrink-0 shadow-md"
          >
            <span>Browse All 140+ SKUs</span>
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Original Clean Crystal Glassmorphism Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, index) => (
            <ScrollReveal
              key={cat.id}
              staggerIndex={index}
              threshold={0.1}
              className="h-full"
            >
              <Link
                to={`/products?category=${cat.categorySlug}`}
                className="group block relative h-[440px] rounded-[24px] overflow-hidden border border-white/[0.12] hover:border-[var(--champagne-border)] transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] hover:shadow-[0_24px_60px_-15px_rgba(15,107,71,0.22)] focus-visible:outline-none"
              >
                {/* Full-Bleed Crystal Photography Canvas (aligned to showcase products) */}
                <div className="absolute inset-0 overflow-hidden bg-[var(--bg-elevated)]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    decoding="async"
                    className="w-full h-full object-cover object-[center_18%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 filter contrast-[1.04]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.endsWith('.jpg')) {
                        target.src = cat.image.replace('.webp', '.jpg');
                      }
                    }}
                  />
                  {/* Gentle gradient for seamless text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/25 to-transparent pointer-events-none" />
                </div>

                {/* Top Floating Glass Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-[10px] font-mono text-[var(--champagne)] uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                    <SealCheck size={12} weight="fill" className="text-[var(--champagne)]" />
                    <span>{cat.skuCount}</span>
                  </div>
                </div>

                {/* Bottom Floating Crystal Glassmorphism Card */}
                <div className="absolute inset-x-3 bottom-3 z-10">
                  <GlassCard
                    interactive={true}
                    className="p-4 sm:p-4.5 space-y-2 border-white/15 group-hover:border-[var(--champagne-border)] transition-all duration-400 bg-[var(--bg-elevated)]/80 backdrop-blur-[16px] shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
                  >
                    <span className="luxury-eyebrow text-[9.5px] text-[var(--champagne)] tracking-[0.16em] block">
                      {cat.eyebrow}
                    </span>

                    <h3 className="display-serif text-lg sm:text-xl font-normal text-[var(--text-primary)] group-hover:text-[var(--champagne)] transition-colors leading-snug">
                      {cat.title}
                    </h3>

                    <p className="text-[11px] text-[var(--text-muted)] leading-[1.5] line-clamp-2">
                      {cat.description}
                    </p>

                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                      <div className="text-[11px] font-mono font-medium text-[var(--emerald)]">
                        {cat.marginText}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--champagne)] group-hover:text-[var(--bg-base)] group-hover:scale-105 transition-all duration-300 shadow-sm">
                        <ArrowUpRight size={13} weight="bold" />
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};



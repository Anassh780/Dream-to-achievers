import React from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/luxury/ScrollReveal';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import {
  Sparkle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  VideoCamera,
  Truck,
  UserCheck,
} from '@phosphor-icons/react';

interface EditorialRowData {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  bullets: string[];
  ctaText: string;
  ctaLink: string;
  reverse?: boolean;
}

const EDITORIAL_ROWS: EditorialRowData[] = [
  {
    eyebrow: 'ORGANIC ACCELERATION · TIKTOK & REELS',
    title: 'Short-form content pipelines that move physical stock',
    description:
      'We supply high-converting video hooks, product demo b-roll, and tested Urdu scripts that turn casual social viewers into active cash on delivery orders without ad spend.',
    image: '/images/tiktok-automation.webp',
    imageAlt: 'TikTok automation and viral distribution content production suite',
    bullets: [
      'Pre-edited 1080p demo clips & texture unboxings',
      'Tested Urdu & Roman-Urdu commercial sales scripts',
      'Direct WhatsApp DM triage conversion funnels',
    ],
    ctaText: 'Explore Creative Services',
    ctaLink: '/services',
    reverse: false,
  },
  {
    eyebrow: 'NATIONWIDE FULFILLMENT · 150+ CITIES',
    title: 'Centralized warehouse logistics with automated COD payout',
    description:
      'Never pack a parcel or negotiate with courier dispatchers again. When you record a sale, our warehouse packs, quality-checks, and delivers across Pakistan with end-to-end SMS tracking.',
    image: '/images/landing/cta-ambient.webp',
    imageAlt: 'Centralized distribution warehouse and automated courier sorting facility',
    bullets: [
      '99.4% verified order fulfillment delivery accuracy',
      'Automated Cash on Delivery collection at customer doorstep',
      'Immediate ledger credit to your digital wallet upon clearance',
    ],
    ctaText: 'Learn Logistics Process',
    ctaLink: '/how-it-works',
    reverse: true,
  },
  {
    eyebrow: 'LEADERSHIP & PURPOSE · FARIA IMRAN',
    title: 'Founded to build financial sovereignty for Pakistani entrepreneurs',
    description:
      'Executive Director Faria Imran established Dream to Achievers to eliminate unfair middleman markups and empower homemakers, students, and independent sellers with verified commercial opportunities.',
    image: '/images/faria-imran.webp',
    imageAlt: 'Faria Imran — Founder and Executive Director of Dream to Achievers',
    bullets: [
      'Direct factory & licensed importer relationships',
      'Active mentorship community with daily strategy calls',
      'Zero upfront inventory barriers for emerging business owners',
    ],
    ctaText: 'Read Founder Story',
    ctaLink: '/founder/faria-imran',
    reverse: false,
  },
];

export const ServicesEditorialSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-b border-[var(--line)]">
      <div className="max-w-[1240px] mx-auto space-y-24 sm:space-y-32">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="luxury-eyebrow flex items-center justify-center gap-2">
            <Sparkle size={13} className="text-[var(--champagne)]" />
            <span>Platform Capabilities &amp; Vision</span>
          </div>
          <h2 className="display-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Built for scale, verified by infrastructure
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Every operational layer is optimized to turn product catalog access into predictable daily commerce.
          </p>
        </div>

        {/* Alternating Image/Text Rows */}
        <div className="space-y-20 sm:space-y-28">
          {EDITORIAL_ROWS.map((row, index) => (
            <ScrollReveal
              key={row.title}
              threshold={0.2}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center ${
                row.reverse ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image Column with Clip-Path Reveal */}
              <div
                className={`lg:col-span-6 ${
                  row.reverse ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="relative rounded-[24px] overflow-hidden border border-white/[0.12] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] group bg-[var(--bg-elevated)]">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={row.image}
                      alt={row.imageAlt}
                      decoding="async"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith('.webp')) {
                          target.src = row.image.replace('.webp', '.png');
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Text Column */}
              <div
                className={`lg:col-span-6 space-y-6 ${
                  row.reverse ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div className="space-y-2">
                  <span className="luxury-eyebrow text-[var(--champagne)]">
                    {row.eyebrow}
                  </span>
                  <h3 className="display-serif text-2xl sm:text-4xl font-normal text-[var(--text-primary)] leading-[1.12]">
                    {row.title}
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-[1.65]">
                  {row.description}
                </p>

                <ul className="space-y-2.5 pt-1">
                  {row.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-primary)]/85"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="text-[var(--emerald)] shrink-0 mt-0.5"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3">
                  <Link
                    to={row.ctaLink}
                    className="champagne-glass-btn px-6 py-2.5 text-xs font-mono inline-flex items-center gap-2 group"
                  >
                    <span>{row.ctaText}</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

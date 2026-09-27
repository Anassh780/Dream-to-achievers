import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ParallaxImage } from '@/components/ui/luxury/ParallaxImage';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import {
  ShieldCheck,
  ArrowRight,
  Sparkle,
  Truck,
  Package,
  TrendUp,
  SealCheck,
} from '@phosphor-icons/react';

// Word-by-word stagger animator for display serif headline
const StaggeredTitle: React.FC<{ text: string; champagnePhrase: string }> = ({
  text,
  champagnePhrase,
}) => {
  const words = text.split(' ');
  const champagneWords = champagnePhrase.split(' ');

  return (
    <h1 className="display-serif text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal tracking-[-0.02em] leading-[1.05] text-[var(--text-primary)] max-w-5xl mx-auto">
      {words.map((word, i) => {
        const isChampagne = champagneWords.some(
          (cw) => word.toLowerCase().includes(cw.toLowerCase())
        );

        return (
          <span
            key={i}
            className="inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              animation: `fade-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 40}ms forwards`,
              opacity: 0,
              transform: 'translateY(20px)',
            }}
          >
            {isChampagne ? (
              <span className="text-[var(--champagne)] font-normal mr-[0.26em]">
                {word}
              </span>
            ) : (
              <span className="mr-[0.26em]">{word}</span>
            )}
          </span>
        );
      })}
    </h1>
  );
};

// Count-up numeral for trust strip
const CountUpMetric: React.FC<{
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}> = ({ target, prefix = '', suffix = '', duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const statRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          let startTime: number | null = null;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out expo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(eased * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (statRef.current) observer.observe(statRef.current);
    return () => observer.disconnect();
  }, [target, duration, hasTriggered]);

  return (
    <span ref={statRef} className="font-serif font-medium text-[var(--champagne)]">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-32 sm:pt-40 pb-12 sm:pb-16 overflow-hidden">
      {/* 1. Full-Bleed Ambient Shot with subtle parallax (12% slower than scroll) */}
      <ParallaxImage
        src="/images/landing/hero-ambient.webp"
        alt="Luxury consumer cosmetic and lifestyle electronics wholesale goods arranged on dark stone"
        speed={0.12}
        priority={true}
        overlayOpacity="normal"
        className="absolute inset-0 z-0 h-full w-full"
      />

      {/* 2. Central Hero Statement */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-8 text-center my-auto space-y-7 sm:space-y-9">
        {/* Glass Badge Pill with Champagne Border & Live Pulse Dot */}
        <div className="inline-flex items-center">
          <div className="funding-ghost-pill px-4 py-1.5 flex items-center gap-2.5 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-primary)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Direct Wholesale Distribution · Pakistan</span>
          </div>
        </div>

        {/* High-Contrast Display Serif Headline */}
        <StaggeredTitle
          text="Start an online reselling business with verified wholesale inventory"
          champagnePhrase="verified wholesale inventory"
        />

        {/* Muted Subhead capped at 58ch */}
        <p className="text-[15px] sm:text-lg text-[var(--text-muted)] max-w-[58ch] mx-auto leading-[1.65] font-sans">
          Access high-margin consumer catalog SKUs, transparent unit economics, and nationwide cash on delivery fulfillment with zero upfront inventory buy-in.
        </p>

        {/* Dual Luxury CTAs (FundingPips Specular Sheen) */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/signup"
            className="funding-sheen-btn px-8 py-3.5 text-xs uppercase tracking-[0.14em] font-semibold inline-flex items-center gap-2 group shadow-xl"
          >
            <span>Create Partner Account</span>
            <ArrowRight
              size={14}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/products"
            className="funding-ghost-pill px-7 py-3.5 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2"
          >
            <span>Explore Wholesale Catalog</span>
          </Link>
        </div>

        {/* Floating Desktop Luxury Badges */}
        <div className="hidden xl:block pointer-events-none">
          {/* Badge Left */}
          <div className="absolute top-1/2 left-0 2xl:-left-6 -translate-y-12">
            <GlassCard className="px-4 py-3 flex items-center gap-3 border-[var(--champagne-border)] shadow-2xl animate-pulse duration-1000">
              <div className="w-8 h-8 rounded-full bg-[var(--emerald)]/20 text-[var(--emerald)] flex items-center justify-center">
                <TrendUp size={16} weight="bold" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Unit Profit</div>
                <div className="text-xs font-mono font-medium text-[var(--champagne)]">PKR 500–1,300/item</div>
              </div>
            </GlassCard>
          </div>

          {/* Badge Right */}
          <div className="absolute top-1/2 right-0 2xl:-right-6 translate-y-8">
            <GlassCard className="px-4 py-3 flex items-center gap-3 border-white/10 shadow-2xl">
              <div className="w-8 h-8 rounded-full bg-[var(--champagne)]/20 text-[var(--champagne)] flex items-center justify-center">
                <Truck size={16} weight="bold" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">COD Dispatch</div>
                <div className="text-xs font-mono font-medium text-[var(--text-primary)]">150+ Cities Active</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* 3. Thin Glass Trust Strip with Key Performance Metrics */}
      <div className="relative z-10 max-w-[1100px] mx-auto px-5 sm:px-8 w-full pt-8 sm:pt-14">
        <GlassCard className="p-4 sm:p-5 border border-white/[0.08] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-[var(--champagne-hairline)] text-center">
            
            <div className="pt-2 md:pt-0 space-y-1">
              <div className="text-xl sm:text-2xl font-serif">
                <CountUpMetric target={150} suffix="+" />
              </div>
              <div className="luxury-eyebrow text-[10px]">Cities COD Coverage</div>
            </div>

            <div className="pt-2 md:pt-0 space-y-1">
              <div className="text-xl sm:text-2xl font-serif">
                <CountUpMetric target={100} suffix="%" />
              </div>
              <div className="luxury-eyebrow text-[10px]">Verified Factory SKUs</div>
            </div>

            <div className="pt-2 md:pt-0 space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-[var(--champagne)]">
                PKR 500–1,300
              </div>
              <div className="luxury-eyebrow text-[10px]">Fixed Reseller Margin</div>
            </div>

            <div className="pt-2 md:pt-0 space-y-1">
              <div className="text-xl sm:text-2xl font-serif">
                <CountUpMetric target={10000} prefix="PKR " />
              </div>
              <div className="luxury-eyebrow text-[10px]">Top Milestone Bonus</div>
            </div>

          </div>
        </GlassCard>
      </div>

      {/* Keyframe animation for initial title words */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

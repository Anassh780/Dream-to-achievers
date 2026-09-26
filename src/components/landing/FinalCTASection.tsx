import React from 'react';
import { Link } from 'react-router-dom';
import { ParallaxImage } from '@/components/ui/luxury/ParallaxImage';
import { ScrollReveal } from '@/components/ui/luxury/ScrollReveal';
import { ArrowRight, Sparkle, SealCheck } from '@phosphor-icons/react';

export const FinalCTASection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-8 overflow-hidden">
      {/* Dark Ambient Warehouse & Fulfillment Center Background */}
      <ParallaxImage
        src="/images/landing/cta-ambient.webp"
        alt="Automated luxury e-commerce fulfillment and distribution line"
        speed={0.1}
        overlayOpacity="heavy"
        className="absolute inset-0 z-0 h-full w-full"
      />

      <div className="relative z-10 max-w-[1000px] mx-auto text-center space-y-8">
        <ScrollReveal threshold={0.2} className="space-y-6">
          <div className="inline-flex items-center">
            <div className="glass-pill px-4 py-1.5 border border-[var(--champagne-border)] flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--text-primary)]">
              <SealCheck size={14} className="text-[var(--champagne)]" weight="fill" />
              <span>Zero Risk · Immediate Activation</span>
            </div>
          </div>

          <h2 className="display-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-[1.08]">
            Step into sovereign wholesale commerce with zero upfront capital
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-[54ch] mx-auto leading-[1.65]">
            Join over 10,000 independent resellers across Pakistan. Source verified wholesale inventory, set your margins, and collect profits directly to your bank account.
          </p>

          <div className="pt-4 flex justify-center">
            <Link
              to="/signup"
              className="funding-sheen-btn px-9 py-4 text-xs sm:text-sm uppercase tracking-[0.15em] font-semibold inline-flex items-center gap-2.5 shadow-2xl group focus-visible:outline-none"
            >
              <span>Create Free Partner Account</span>
              <ArrowRight
                size={15}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import { ScrollReveal } from '@/components/ui/luxury/ScrollReveal';
import {
  UserCircleCheck,
  Package,
  ShareNetwork,
  Truck,
  CheckCircle,
  Sparkle,
  Wallet,
  SealCheck,
} from '@phosphor-icons/react';

interface StepData {
  num: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  metric: string;
  image: string;
  imageCaption: string;
}

const STEPS: StepData[] = [
  {
    num: '01',
    title: 'Instant Partner Accreditation',
    subtitle: 'Zero Registration Fee · Instant Whitelist',
    description:
      'Create your free reseller profile in under 60 seconds. Unlock wholesale baseline pricing across all catalog tiers with zero upfront inventory commitments.',
    icon: UserCircleCheck,
    badge: 'ONBOARDING',
    metric: 'Instant Approval',
    image: '/images/landing/step-credential.webp',
    imageCaption: 'Digital accreditation & verified factory tier clearance',
  },
  {
    num: '02',
    title: 'Catalog Curation & Asset Downloads',
    subtitle: 'High-Res Media · Pre-Tested Copy',
    description:
      'Select high-margin cosmetic, perfume, or electronics SKUs. Access studio photography, video reels, and Urdu/English benefit scripts ready for WhatsApp and TikTok distribution.',
    icon: Package,
    badge: 'CURATION',
    metric: '140+ Live SKUs',
    image: '/images/landing/cat-perfume.webp',
    imageCaption: 'Studio assets & commercial product video scripts',
  },
  {
    num: '03',
    title: 'Customer Order Placement & Tracking',
    subtitle: 'Direct Dashboard Routing · Real-Time Tracking',
    description:
      'Share media with your customers. Record orders in your partner dashboard in two clicks. No packaging or courier negotiations needed on your end.',
    icon: ShareNetwork,
    badge: 'SALES ROUTING',
    metric: '150+ Cities COD',
    image: '/images/tiktok-automation.webp',
    imageCaption: 'Direct-to-customer courier dispatch order routing',
  },
  {
    num: '04',
    title: 'Nationwide Courier COD & Wallet Payout',
    subtitle: 'Automated Cash Collection · Direct Ledger Credit',
    description:
      'Our centralized logistics hubs pack with inspection seals and dispatch via Cash on Delivery. Once collected, your profit margin (PKR 500 to 1,600) is credited straight to your digital wallet.',
    icon: Wallet,
    badge: 'PROFIT CLEARANCE',
    metric: 'Direct Bank Transfer',
    image: '/images/landing/step-parcel.webp',
    imageCaption: 'Automated COD courier delivery & ledger settlement',
  },
];

export const HowItWorksSticky: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const windowMiddle = window.innerHeight / 2;
      stepRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        if (rect.top <= windowMiddle && rect.bottom >= windowMiddle) {
          setActiveStepIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentStep = STEPS[activeStepIndex] || STEPS[0];
  const CurrentIcon = currentStep.icon;

  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-b border-[var(--line)] overflow-hidden">
      {/* Background Macro Texture at subtle opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.12] select-none">
        <img
          src="/images/landing/macro-texture.webp"
          alt="Macro packaging fiber and tactile luxury cardboard texture"
          loading="lazy"
          className="w-full h-full object-cover object-center filter saturate-0 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-transparent to-[var(--bg-base)]" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="luxury-eyebrow flex items-center justify-center gap-2">
            <Sparkle size={13} className="text-[var(--champagne)]" />
            <span>Execution Framework</span>
          </div>
          <h2 className="display-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)]">
            How wholesale reselling works
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            A frictionless 4-phase system designed for individuals building sustainable e-commerce cash flow.
          </p>
        </div>

        {/* Pinned Sticky Layout: Left Visual Stays Fixed with Real Picture Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Pinned Sticky Visual (Left on desktop) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-32">
            <GlassCard
              glow={true}
              className="p-6 space-y-6 border-[var(--champagne-border)] shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--champagne-hairline)]">
                <span className="luxury-eyebrow text-[var(--champagne)]">
                  ACTIVE PHASE {currentStep.num} OF 04
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {currentStep.badge}
                </span>
              </div>

              {/* Dynamic Step Picture Frame */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[var(--bg-elevated)] border border-white/15 group shadow-xl">
                <img
                  key={currentStep.image}
                  src={currentStep.image}
                  alt={currentStep.title}
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.endsWith('.jpg')) {
                      target.src = currentStep.image.replace('.webp', '.jpg');
                    }
                  }}
                />
                
                {/* Floating telemetry pill */}
                <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <CurrentIcon size={18} className="text-[var(--champagne)]" weight="duotone" />
                    <span className="text-xs font-mono text-[var(--text-primary)] font-medium">
                      {currentStep.metric}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--champagne)] uppercase tracking-wider">
                    Phase Verified
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                  {currentStep.subtitle}
                </div>
                <h3 className="display-serif text-xl font-normal text-[var(--text-primary)]">
                  {currentStep.title}
                </h3>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {STEPS.map((step, idx) => (
                  <div
                    key={step.num}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeStepIndex
                        ? 'bg-[var(--champagne)] shadow-[0_0_12px_rgba(217,192,138,0.5)]'
                        : idx < activeStepIndex
                        ? 'bg-[var(--emerald)]/60'
                        : 'bg-white/[0.1]'
                    }`}
                  />
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Numbered Steps Stream (Right column on desktop) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {STEPS.map((step, index) => {
              const isActive = index === activeStepIndex;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.num}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  className="transition-all duration-400"
                >
                  <GlassCard
                    className={`p-6 sm:p-8 space-y-4 transition-all duration-400 ${
                      isActive
                        ? 'border-[var(--champagne-border)] ring-1 ring-[var(--champagne-border)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]'
                        : 'border-white/[0.08] opacity-75 lg:opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-sm font-semibold transition-colors ${
                            isActive
                              ? 'bg-[var(--champagne)] text-[var(--bg-base)]'
                              : 'bg-white/[0.06] text-[var(--text-muted)] border border-white/[0.1]'
                          }`}
                        >
                          {step.num}
                        </div>
                        <span className="luxury-eyebrow text-[10px] text-[var(--champagne)]">
                          {step.badge}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[var(--champagne)] font-medium">
                        {step.metric}
                      </div>
                    </div>

                    {/* Mobile Only: Inline Step Picture */}
                    <div className="lg:hidden rounded-xl overflow-hidden aspect-[16/9] border border-white/10 my-3 bg-[var(--bg-elevated)]">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.endsWith('.jpg')) {
                            target.src = step.image.replace('.webp', '.jpg');
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="display-serif text-xl sm:text-2xl font-normal text-[var(--text-primary)]">
                        {step.title}
                      </h4>
                      <p className="text-sm text-[var(--text-muted)] leading-[1.65]">
                        {step.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                      <CheckCircle size={14} className="text-[var(--emerald)]" weight="fill" />
                      <span>{step.subtitle}</span>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

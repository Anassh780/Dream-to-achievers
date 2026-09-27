import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/luxury/GlassCard';
import { ScrollReveal } from '@/components/ui/luxury/ScrollReveal';
import { CaretDown, Sparkle, ChatCircleDots, ArrowUpRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'INVESTMENT & RISK',
    question: 'Do I need any capital or advance fee to join as a wholesale partner?',
    answer:
      'No upfront capital or registration fee is required. Joining Dream to Achievers is 100% free. You gain immediate accreditation to browse wholesale trade rates and start selling with zero inventory buy-in commitments.',
  },
  {
    id: 'faq-2',
    category: 'PROFIT & ARBITRAGE',
    question: 'How does the reseller profit margin work on each unit?',
    answer:
      'Each product in our catalog features transparent pricing: the factory wholesale price, the verified customer retail price, and your net profit margin (typically PKR 500 to 1,300 per unit). When your customer accepts the Cash on Delivery (COD) order, that profit is credited directly into your partner wallet.',
  },
  {
    id: 'faq-3',
    category: 'LOGISTICS & COD',
    question: 'Who manages parcel packaging, shipping, and Cash on Delivery?',
    answer:
      'Our centralized logistics hubs in Lahore and Karachi handle all fulfillment operations. When you record a customer order on your dashboard, we pack, barcode, quality-check, and dispatch the parcel nationwide across 150+ cities with leading courier partners.',
  },
  {
    id: 'faq-4',
    category: 'MILESTONE REWARDS',
    question: 'How do I qualify for the PKR 2,000 to PKR 10,000 cash bonuses?',
    answer:
      'As your cumulative unit sales grow and you invite verified resellers to your partner network, you unlock progressive milestone tiers (Silver, Platinum, Gold, and Diamond). Each tier triggers an instant cash bonus credited straight to your digital wallet with no redemption barriers.',
  },
  {
    id: 'faq-5',
    category: 'MARKETING ASSETS',
    question: 'Do you provide product photography, videos, and commercial copy?',
    answer:
      'Yes. Every verified SKU includes high-resolution studio photographs, video texture clips, hook-scripts for TikTok and Instagram Reels, and tested sales copy in both Urdu and English ready for one-tap sharing.',
  },
  {
    id: 'faq-6',
    category: 'PAYOUT SCHEDULE',
    question: 'How quickly can I withdraw my profit earnings to my bank account?',
    answer:
      'Once a courier delivers the parcel and clears COD payment, your earnings become available for immediate withdrawal to your bank account, JazzCash, or Raast with transparent transaction ledger records.',
  },
];

export const LuxuryFAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-8 border-b border-[var(--line)]">
      <div className="max-w-[1000px] mx-auto space-y-14 sm:space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="luxury-eyebrow flex items-center justify-center gap-2">
            <Sparkle size={13} className="text-[var(--champagne)]" />
            <span>Operational Clarifications</span>
          </div>
          <h2 className="display-serif text-3xl sm:text-5xl font-normal text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Direct answers on margins, nationwide courier fulfillment, and wallet payouts.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, index) => {
            const isOpen = openId === faq.id;

            return (
              <ScrollReveal key={faq.id} staggerIndex={index} threshold={0.1}>
                <GlassCard
                  className={`transition-all duration-300 ${
                    isOpen
                      ? 'border-[var(--champagne-border)] shadow-[0_16px_40px_-15px_rgba(0,0,0,0.7)]'
                      : 'border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  <button
                    id={`faq-trigger-${faq.id}`}
                    onClick={() => toggle(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus-visible:outline-none cursor-pointer select-none"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${faq.id}`}
                  >
                    <div className="space-y-1.5">
                      <span className="luxury-eyebrow text-[10px] text-[var(--champagne)]">
                        {faq.category}
                      </span>
                      <h3 className="display-serif text-lg sm:text-xl font-normal text-[var(--text-primary)]">
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? 'bg-[var(--champagne)] text-[var(--bg-base)] rotate-180 shadow-[0_0_12px_rgba(217,192,138,0.4)]'
                          : 'bg-white/[0.05] text-[var(--text-muted)] border border-white/[0.1]'
                      }`}
                    >
                      <CaretDown size={14} weight="bold" />
                    </div>
                  </button>

                  <div
                    id={`faq-panel-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${faq.id}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-[var(--text-muted)] leading-[1.7] border-t border-white/[0.06]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Luxury Concierge Desk Card without photo */}
        <ScrollReveal threshold={0.15}>
          <GlassCard className="p-6 sm:p-8 border-[var(--champagne-border)] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-2xl bg-[var(--champagne)]/10 border border-[var(--champagne-border)] shrink-0 flex items-center justify-center text-[var(--champagne)] shadow-md">
                <ChatCircleDots size={28} weight="duotone" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-serif font-semibold text-[var(--text-primary)]">
                    Executive Partner Desk
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--emerald)]/15 border border-[var(--emerald)]/30 text-[9.5px] font-mono text-[var(--emerald)] uppercase tracking-wider">
                    Online 24/7
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
                  Need personalized onboarding, bulk order procurement, or wholesale margin verification? Speak directly with founding leadership.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/contact"
                className="champagne-glass-btn px-5 py-2.5 text-xs font-mono w-full sm:w-auto text-center"
              >
                Help Desk
              </Link>
              <a
                href="https://wa.me/923054511395?text=Hi%20Dream%20to%20Achievers%20team,%20I%20have%20an%20inquiry%20about%20partner%20onboarding."
                target="_blank"
                rel="noreferrer"
                className="funding-sheen-btn px-5 py-2.5 text-xs font-mono font-semibold inline-flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-md"
              >
                <span>WhatsApp VIP</span>
                <ArrowUpRight size={13} weight="bold" />
              </a>
            </div>
          </GlassCard>
        </ScrollReveal>

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  CaretDown,
  ShieldCheck,
  WhatsappLogo,
  ArrowRight,
  MagnifyingGlass,
  CheckCircle,
} from '@phosphor-icons/react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'Do I need any investment or upfront fee to join Dream to Achievers?',
    answer:
      'No. Joining Dream to Achievers is 100% free. You do not need to buy bulk inventory in advance, pay registration fees, or hold stock. You only place orders when your retail customers order from you.',
  },
  {
    category: 'Getting Started',
    question: 'Who can become a partner on Dream to Achievers?',
    answer:
      'Any individual or business in Pakistan can join as a partner. Whether you sell on WhatsApp, TikTok, Instagram, Facebook, or offline channels, our platform equips you with wholesale products, marketing scripts, and logistics.',
  },
  {
    category: 'Wholesale & Margins',
    question: 'How do unit profit margins work on product sales?',
    answer:
      'You get verified products at wholesale trade rates (e.g. PKR 2,999) and market them to customers at suggested retail (e.g. PKR 4,500). When our courier completes delivery, the transparent gross margin (+PKR 1,501) is credited directly to your partner wallet.',
  },
  {
    category: 'Wholesale & Margins',
    question: 'Are products quality-checked before courier dispatch?',
    answer:
      'Yes. Every wholesale lot across skincare, consumer technology, and lifestyle gifting is inspected for batch quality and safely packed for nationwide courier transit.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'Who manages shipping and Cash on Delivery (COD)?',
    answer:
      'Dream to Achievers manages 100% of packaging, courier booking, and cash collection across 150+ Pakistani cities. You never need to visit courier offices or ship packages yourself.',
  },
  {
    category: 'Shipping & Delivery',
    question: 'How do customers pay for their orders?',
    answer:
      'All orders are delivered with courier Cash on Delivery (COD). The courier collects the full retail amount in cash from your customer upon delivery.',
  },
  {
    category: 'Milestone Rewards',
    question: 'How do the Level 01 to Level 04 milestone cash bonuses work?',
    answer:
      'As you complete personal customer sales and invite other resellers using your referral code, you unlock structured cash milestone rewards: Level 01 (PKR 2,000), Level 02 (PKR 4,000), Level 03 (PKR 6,000), and Level 04 (PKR 10,000).',
  },
  {
    category: 'Milestone Rewards',
    question: 'How is milestone reward progress tracked?',
    answer:
      'Your partner dashboard features an automated progress bar tracking verified sales units and active referral team members in real-time.',
  },
  {
    category: 'Payouts & Wallet',
    question: 'How do I withdraw my earnings and cash rewards?',
    answer:
      'Once delivered orders are confirmed, profits in your wallet are available for withdrawal directly to your Pakistani bank account, JazzCash, or Easypaisa.',
  },
  {
    category: 'Leadership & Support',
    question: 'Who founded Dream to Achievers?',
    answer:
      'Dream to Achievers was founded by Faria Imran, an entrepreneur and digital commerce strategist who built the platform to eliminate capital, storage, and courier barriers for online sellers across Pakistan.',
  },
  {
    category: 'Leadership & Support',
    question: 'How can I contact official partner support?',
    answer:
      'Our team is available through the official WhatsApp Desk (+92 305 4511395), our WhatsApp Channel, and via email at dreamtoachievers@gmail.com.',
  },
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const siteConfig = useSiteSettings();

  const categories = ['All', 'Getting Started', 'Wholesale & Margins', 'Shipping & Delivery', 'Milestone Rewards', 'Payouts & Wallet', 'Leadership & Support'];

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS_DATA.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Dream to Achievers team, I have a question regarding wholesale reselling and partner onboarding.'
  )}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Frequently Asked Questions (FAQ) | Dream to Achievers"
        description="Find answers to common questions about Dream to Achievers wholesale pricing, Cash on Delivery (COD) dispatch, milestone cash bonuses, and partner onboarding."
        canonicalPath="/faq"
        ogType="website"
        structuredData={faqSchema}
      />

      {/* Header Banner */}
      <section className="px-6 sm:px-8 pt-10 pb-8 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09]">
        <div className="max-w-[1180px] mx-auto space-y-4">
          <Breadcrumbs items={[{ label: 'FAQ' }]} />

          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
              <ShieldCheck size={13} weight="bold" />
              <span>Partner Knowledge Base</span>
            </div>
            <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.1]">
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
              Clear answers regarding wholesale commerce, Cash on Delivery logistics, margin calculations, and milestone rewards.
            </p>
          </div>
        </div>
      </section>

      {/* Main FAQ Content Area */}
      <main className="max-w-[880px] mx-auto px-6 sm:px-8 pt-10 space-y-8">
        
        {/* Search Input & Category Pills */}
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frequently asked questions..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 text-xs sm:text-sm text-[#F4F7F5] placeholder:text-[#9EABA2]/50 focus:outline-none focus:border-[#D9C08A] shadow-lg transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#D9C08A] text-[#070B09] border-[#D9C08A] shadow-md font-semibold'
                    : 'bg-[#0D1512]/80 text-[#9EABA2] border-white/10 hover:border-[#D9C08A]/40 hover:text-[#F4F7F5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 text-center space-y-3 shadow-xl">
              <p className="text-sm text-[#9EABA2]">No matching questions found.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs text-[#D9C08A] font-medium underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 shadow-lg hover:border-[#D9C08A]/30"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer select-none focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#34D399] uppercase tracking-wider block font-semibold">
                        {faq.category}
                      </span>
                      <h2 className="font-serif text-sm sm:text-base font-normal text-[#F4F7F5]">
                        {faq.question}
                      </h2>
                    </div>
                    <div
                      className={`p-2 rounded-xl bg-[#131E1A] border border-white/10 text-[#D9C08A] transition-all duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 !bg-[#D9C08A] !text-[#070B09] !border-[#D9C08A]' : ''
                      }`}
                    >
                      <CaretDown size={14} weight="bold" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-[#9EABA2] leading-relaxed border-t border-white/8 bg-[#070B09]/40 animate-in fade-in duration-200">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D1512] to-[#070B09] border border-[#D9C08A]/35 text-[#F4F7F5] text-center space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.08)] mt-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D9C08A]/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F4F7F5] relative z-10">
            Still have questions about partnering?
          </h2>
          <p className="text-xs sm:text-sm text-[#9EABA2] max-w-md mx-auto leading-relaxed relative z-10">
            Connect directly with our support team on WhatsApp or submit an inquiry through our direct help desk.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="champagne" size="md" className="font-medium shadow-lg" iconLeft={<WhatsappLogo size={16} />}>
                Chat on WhatsApp Desk
              </Button>
            </a>
            <Link to="/contact">
              <Button variant="outline" size="md" className="border-white/15 hover:border-[#D9C08A]/40 text-[#F4F7F5]" iconRight={<ArrowRight size={13} />}>
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default FAQPage;

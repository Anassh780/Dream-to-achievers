import React, { useState } from 'react';
import { CaretDown, ChatCircleDots } from '@phosphor-icons/react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Wholesale & Margins',
    question: 'How do partner profit margins work and when are they credited?',
    answer:
      'Partners purchase or distribute products at fixed wholesale prices (e.g., PKR 2,000) and sell at recommended retail (e.g., PKR 2,500). The gross margin (+PKR 500) is directly credited to your profit ledger upon verified customer order delivery.',
  },
  {
    category: 'Wholesale & Margins',
    question: 'Is there a minimum order quantity (MOQ) or mandatory upfront fee?',
    answer:
      'No. Dream to Achievers is designed for independent resellers. There is zero mandatory inventory buy-in or franchise fee required to register and start distributing catalog items.',
  },
  {
    category: 'Logistics & Delivery',
    question: 'How is nationwide order delivery and Cash on Delivery (COD) handled?',
    answer:
      'Our centralized logistics infrastructure fulfills customer orders nationwide across Pakistan. Couriers collect cash on delivery, and our automated ledger reconciles the margin straight to your account.',
  },
  {
    category: 'Ranks & Rewards',
    question: 'What are the requirements to achieve Level 01 to Level 04 partner milestones?',
    answer:
      'Milestones are achieved through dual qualification: Level 01 (10 sales, 20 members → PKR 2,000), Level 02 (25 sales, 45 members → PKR 4,000), Level 03 (35 sales, 60 members → PKR 6,000), and Level 04 (100 sales, 200 members → PKR 10,000).',
  },
  {
    category: 'Ranks & Rewards',
    question: 'How do I claim and receive my milestone cash bonuses?',
    answer:
      'When your dashboard progress bar reaches 100% for a rank tier, a "Claim Reward" button is unlocked. Once submitted, our operations team verifies the volume and disburses funds via your preferred payment method within 24–48 hours.',
  },
  {
    category: 'Community & Referrals',
    question: 'How does partner network attribution work?',
    answer:
      'Every partner receives a unique referral code. When new partners register through your link, they are automatically permanently mapped into your team and attributed on transparent platform records.',
  },
  {
    category: 'Support & Desk',
    question: 'What dedicated support is available if I or my customer has an issue?',
    answer:
      'Partners have access to our official WhatsApp Help Desk, VIP broadcast channel, and email support for order tracking, catalog sheets, and technical guidance.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-16 px-6 sm:px-8 bg-[#FAF7EF] border-b border-[#E3DCC8] font-sans">
      <div className="max-w-[860px] mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-center space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
            Frequently Asked Questions
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]">
            Operational &amp; Partner Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#5B5C50] max-w-md mx-auto">
            Everything you need to know about wholesale product distribution, margin tracking, and milestone reward claims.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-white border border-[#E3DCC8] overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer select-none focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-mono text-[#1F4D3E] uppercase tracking-wider block">
                      {faq.category}
                    </span>
                    <span className="font-serif text-base sm:text-lg font-medium text-[#1E241F]">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#1F4D3E] text-white border-[#1F4D3E]' : ''
                    }`}
                  >
                    <CaretDown size={14} weight="bold" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5B5C50] leading-relaxed border-t border-[#E3DCC8] bg-[#FAF7EF]/40 animate-fade-up">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

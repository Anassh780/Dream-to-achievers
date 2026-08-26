import React, { useState } from 'react';
import { CaretDown, ChatCircleDots } from '@phosphor-icons/react';
import { ScrollFloat } from '@/components/ui/ScrollFloat';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'Do I need any investment or advance fee to join?',
    answer:
      'No. Joining DreamToAchievers is 100% free. You do not need to buy any inventory upfront or pay any registration fees.',
  },
  {
    category: 'Earnings & Profit',
    question: 'How do I make a profit on each product sale?',
    answer:
      'You get products at wholesale rates (e.g. PKR 2,000) and sell to your customers at suggested retail (e.g. PKR 2,500). When our courier delivers the parcel and collects cash, your PKR 500 profit is credited directly to you.',
  },
  {
    category: 'Delivery & COD',
    question: 'Who handles shipping and Cash on Delivery (COD)?',
    answer:
      'We do! We pack and deliver orders to your customers across 150+ cities in Pakistan with fast courier Cash on Delivery (COD). You do not need to pack or ship anything yourself.',
  },
  {
    category: 'Cash Bonuses',
    question: 'How do I earn the PKR 2,000 to PKR 10,000 milestone cash bonuses?',
    answer:
      'As you complete personal sales and invite other resellers to your team, you unlock Level 01 to Level 04 milestones with guaranteed cash rewards up to PKR 10,000.',
  },
  {
    category: 'Support & Help',
    question: 'How can I get help if I need guidance with selling or orders?',
    answer:
      'You have direct access to our WhatsApp Support Desk, product catalog images, and selling video scripts to help you start making sales from day one.',
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
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="top bottom-=10%"
            scrollEnd="bottom center"
            stagger={0.02}
            containerClassName="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]"
          >
            Operational & Partner Inquiries
          </ScrollFloat>
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

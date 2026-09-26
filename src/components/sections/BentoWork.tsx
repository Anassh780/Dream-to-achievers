import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface BentoWorkProps {
  showHeader?: boolean;
}

export const BentoWork: React.FC<BentoWorkProps> = ({ showHeader = true }) => {
  const benefits = [
    {
      id: 'bento-logistics',
      num: '01',
      title: 'Nationwide logistics & COD dispatch',
      description:
        'Centralized order routing with delivery coverage across 150+ cities. Couriers handle cash on delivery with status updates on every order.',
      metaBold: '99.4%',
      metaText: 'fulfillment accuracy',
    },
    {
      id: 'bento-wholesale-pricing',
      num: '02',
      title: 'Wholesale price access',
      description:
        'Direct factory and verified distributor rates, with a healthy, consistent margin on every unit sold.',
      metaBold: 'PKR 500 to 1,300',
      metaText: 'per unit margin',
    },
    {
      id: 'bento-inventory',
      num: '03',
      title: 'Verified catalog inventory',
      description:
        'A curated selection of high-demand skincare formulas and lifestyle electronics, with continuous stock availability checks.',
      metaBold: 'Restocked and quality-checked',
      metaText: 'in batches',
    },
    {
      id: 'bento-referrals',
      num: '04',
      title: 'Partner network tracking',
      description:
        'Every partner gets a unique referral code that permanently attributes their team’s sign-ups, visible on one shared dashboard.',
      metaBold: 'Transparent',
      metaText: 'attribution, no manual reconciliation',
    },
  ];

  return (
    <section id="services" className="w-full font-sans">
      <div className="space-y-8">
        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-[#D9C08A] font-semibold">
                Network capabilities
              </div>
              <h2 className="font-serif font-normal text-2xl sm:text-3xl text-[#F4F7F5]">
                Built for people moving real inventory
              </h2>
              <p className="text-xs sm:text-sm text-[#9EABA2] max-w-xl leading-relaxed">
                Every figure a partner sees is pulled from verified catalog data — not a projection.
              </p>
            </div>
            <Link to="/services">
              <Button
                variant="outline"
                size="sm"
                iconRight={<ArrowRight size={13} />}
                className="border-white/10 text-[#F4F7F5] hover:border-[#D9C08A]/40"
              >
                Explore All Capabilities
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {benefits.map((card) => (
            <div
              key={card.id}
              className="p-6 rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 hover:border-[#D9C08A]/40 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group hover:-translate-y-0.5"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#131E1A] border border-[#D9C08A]/25 text-[#D9C08A] font-mono text-xs font-bold flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {card.num}
                </div>
                <h3 className="font-serif text-lg font-medium text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#9EABA2] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="text-xs pt-3.5 border-t border-white/10 flex items-center gap-1.5 font-mono">
                <span className="text-[#34D399] font-medium">{card.metaBold}</span>
                <span className="text-[#9EABA2]">{card.metaText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoWork;

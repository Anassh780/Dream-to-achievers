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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
            <div className="space-y-1">
              <div className="section-kicker">Network capabilities</div>
              <h2 className="font-display font-medium text-3xl sm:text-4xl text-[#1E241F]">
                Built for people moving real inventory
              </h2>
              <p className="text-[#5B5C50] text-sm max-w-xl">
                Every figure a partner sees is pulled from verified catalog data — not a projection.
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                Explore All Capabilities
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {benefits.map((card) => (
            <div
              key={card.id}
              className="cap-card flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="cap-icon">
                  {card.num}
                </div>
                <h3 className="font-display text-[17px] font-semibold text-[#1E241F] mb-2">
                  {card.title}
                </h3>
                <p className="text-[13.5px] text-[#5B5C50] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="cap-meta text-xs text-[#5B5C50] pt-3 border-t border-[#E3DCC8]">
                <strong>{card.metaBold}</strong> {card.metaText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

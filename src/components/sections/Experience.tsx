import React from 'react';
import { CheckCircle } from '@phosphor-icons/react';

export const Experience: React.FC = () => {
  const caseStudies = [
    {
      period: 'Case Study #1 — DTC Wholesale Scale',
      title: 'E-Commerce Skincare Distribution Scaling',
      client: 'Verified Brand Partner',
      description: 'Scaled monthly product sales from 40 units to 480+ units in 60 days via direct TikTok organic hooks and targeted partner community distribution.',
      metrics: 'PKR 450k+ Margins Generated',
      highlights: [
        'Over 2.8M organic views generated across video reviews',
        'Achieved Level 04 milestone qualification in 75 days',
        'Integrated automated margin crediting to local partner ledgers',
      ],
    },
    {
      period: 'Case Study #2 — Organic Community Expansion',
      title: 'Viral Video Content & Partner Referral Funnel',
      client: 'Apex Lifestyle Network',
      description: 'Executed daily automated product demonstration reels, driving 120+ active verified partner signups in 30 days.',
      metrics: '120+ Active Team Members',
      highlights: [
        'Automated script generation & product demonstration workflows',
        'High conversion referral page with 38% partner completion rate',
        'Direct cash milestone bonus unlocks achieved across team members',
      ],
    },
    {
      period: 'Case Study #3 — Distribution Operations',
      title: 'Catalog Order Fulfillment & Margin Optimization',
      client: 'National Logistics Hub',
      description: 'Streamlined order routing and wholesale margin calculations, reducing fulfillment latency from 48 hours to under 6 hours.',
      metrics: '99.4% Order Accuracy',
      highlights: [
        'Automated order confirmation and courier dispatch sync',
        'Real-time customer status tracking and WhatsApp updates',
        'Instant gross margin ledger credit upon confirmed delivery',
      ],
    },
  ];

  return (
    <section id="case-studies" className="max-w-[1180px] mx-auto px-6 sm:px-8 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div>
          <span className="text-xs text-[#1F4D3E] font-medium uppercase tracking-wider block mb-1">
            Proven Performance
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#1E241F]">
            Partner Case Studies &amp; Distribution Results
          </h2>
        </div>
        <p className="text-xs text-[#5B5C50] max-w-sm">
          Documented metrics demonstrating product volume, community growth, and cash rewards unlocked.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {caseStudies.map((cs, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white border border-[#E3DCC8] hover:border-[#D2C8AF] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4 text-xs shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#5B5C50]">{cs.period}</span>
                <span className="text-[10px] font-mono font-semibold text-[#B8862E] bg-[#EFE2C4] px-2 py-0.5 rounded">
                  {cs.metrics}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-semibold text-base text-[#1E241F]">{cs.title}</h3>
                <p className="text-[11px] text-[#5B5C50] font-mono">{cs.client}</p>
                <p className="text-xs text-[#5B5C50] leading-relaxed pt-1">{cs.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3DCC8] space-y-1.5">
              {cs.highlights.map((hl, i) => (
                <div key={i} className="flex items-start space-x-1.5 text-[11px] text-[#5B5C50]">
                  <CheckCircle size={13} weight="bold" className="text-[#1F4D3E] shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

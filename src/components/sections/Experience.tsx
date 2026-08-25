import React from 'react';
import { ChartLineUp, CheckCircle } from '@phosphor-icons/react';

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
        'Achieved Diamond Rank milestone qualification in 75 days',
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
    <section id="case-studies" className="max-w-6xl mx-auto px-5 sm:px-8 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <span className="text-xs text-[#60A5FA] font-medium uppercase tracking-wider block mb-1">
            Proven Performance
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Partner Case Studies
          </h2>
        </div>
        <p className="text-xs text-[#8996A8] max-w-sm">
          Documented metrics demonstrating product volume, community growth, and cash rewards unlocked.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {caseStudies.map((cs, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#111A27] border border-white/[0.08] hover:border-white/[0.14] transition-colors flex flex-col justify-between space-y-4 text-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8996A8]">{cs.period}</span>
                <span className="text-[10px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded">
                  {cs.metrics}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white">{cs.title}</h3>
                <p className="text-[11px] text-[#8996A8]">{cs.client}</p>
                <p className="text-xs text-[#CBD5E1] leading-relaxed pt-1">{cs.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
              {cs.highlights.map((hl, i) => (
                <div key={i} className="flex items-start space-x-1.5 text-[11px] text-[#8996A8]">
                  <CheckCircle size={13} className="text-[#3B82F6] shrink-0 mt-0.5" />
                  <span className="text-[#CBD5E1]">{hl}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

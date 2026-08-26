import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendUp,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Wholesale Products',
      subtitle: 'Browse Verified Inventory at Wholesale Cost',
      desc: 'Create your partner account and explore high-demand skincare and consumer electronic products. Every SKU has transparent wholesale partner pricing and established retail margins.',
      icon: Package,
      points: [
        'Verified supplier inventory with batch quality inspection',
        'Transparent wholesale pricing without hidden buy-ins',
        'Direct catalog data sheets and marketing assets',
      ],
    },
    {
      num: '02',
      title: 'Sell & Keep Your Direct Margin',
      subtitle: 'Distribute at Suggested Retail & Earn Immediately',
      desc: 'Market products to your local network, clients, or digital audience. When an order is fulfilled, you capture the gross profit margin (e.g. +PKR 500 to PKR 1,300 per unit) credited straight to your sales ledger.',
      icon: TrendUp,
      points: [
        'Nationwide cash-on-delivery and courier logistics handling',
        'Instant gross profit margin calculation per sale',
        'Automated customer order tracking notifications',
      ],
    },
    {
      num: '03',
      title: 'Grow & Unlock Level Milestones',
      subtitle: 'Progress from Level 01 to Level 04 for Cash Bonuses',
      desc: 'Build your distribution volume and introduce reseller partners to your network. Meeting combined unit sales and community milestones unlocks guaranteed rank cash bonuses from PKR 2,000 to PKR 10,000.',
      icon: Trophy,
      points: [
        'Structured 4-tier qualification roadmap',
        'Real-time partner network and personal sales tracking',
        'Direct bonus disbursements upon milestone claim approval',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-4">
          <div className="eyebrow">
            <ShieldCheck size={13} weight="bold" />
            <span>Operational Blueprint</span>
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            How DreamToAchievers Works
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-lg mx-auto">
            A transparent 3-step pathway from wholesale inventory sourcing to direct client distribution and guaranteed rank milestone rewards.
          </p>
        </div>
      </section>

      {/* 2. Step Cards */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-7 sm:p-9 rounded-xl bg-white border border-[#E3DCC8] shadow-xs space-y-5 hover:border-[#D2C8AF] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
                    <Icon size={20} weight="bold" />
                  </div>
                  <div>
                    <h2 className="font-display font-medium text-lg text-[#1E241F]">
                      {step.title}
                    </h2>
                    <p className="text-xs text-[#5B5C50] font-mono">{step.subtitle}</p>
                  </div>
                </div>
                <span className="font-mono text-2xl sm:text-3xl font-medium text-[#B8862E]">
                  {step.num}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                {step.desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {step.points.map((point) => (
                  <div
                    key={point}
                    className="p-3.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-start space-x-2.5 text-xs text-[#1E241F]"
                  >
                    <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0 mt-0.5" />
                    <span className="leading-snug text-[#5B5C50]">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 3. Action CTA Banner */}
        <div className="p-8 sm:p-10 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <h3 className="font-display font-medium text-xl sm:text-2xl text-[#1E241F]">
            Ready to start your distribution journey?
          </h3>
          <p className="text-xs sm:text-sm text-[#5B5C50] max-w-md mx-auto">
            Create your account in seconds, browse the wholesale catalog, and claim your initial sales margins.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="md" className="font-medium" iconRight={<ArrowRight size={13} />}>
                Create Partner Account
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="md" className="font-medium">
                Explore Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

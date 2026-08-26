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
  Sparkle,
} from '@phosphor-icons/react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose Wholesale Products',
      subtitle: 'Browse Verified Inventory at Wholesale Cost',
      desc: 'Create your partner account and explore high-demand skincare and consumer electronic products. Every SKU has transparent wholesale partner pricing and established retail margins.',
      icon: Package,
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
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
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
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
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      points: [
        'Structured 4-tier qualification roadmap',
        'Real-time partner network and personal sales tracking',
        'Direct bonus disbursements upon milestone claim approval',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      {/* 1. Header Banner */}
      <section className="relative pt-24 sm:pt-28 pb-14 border-b border-white/[0.08] bg-radial-hero overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-4 text-center">
          <div className="eyebrow mx-auto">
            <ShieldCheck size={13} weight="bold" />
            <span>Operational Blueprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
            How DreamToAchievers Works
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            A transparent 3-step pathway from wholesale inventory sourcing to direct client distribution and guaranteed rank milestone rewards.
          </p>
        </div>
      </section>

      {/* 2. Step Cards */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 space-y-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-7 sm:p-9 rounded-3xl bg-[#060B18] border border-white/[0.08] shadow-2xl space-y-6 hover:border-cyan-400/30 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${step.badgeColor}`}>
                    <Icon size={20} weight="fill" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">{step.subtitle}</p>
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-jetbrains font-extrabold text-white/20 group-hover:text-cyan-400/40 transition-colors">
                  {step.num}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {step.desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {step.points.map((point) => (
                  <div
                    key={point}
                    className="p-3.5 rounded-2xl bg-[#030712] border border-white/[0.06] flex items-start space-x-2.5 text-xs text-slate-300"
                  >
                    <CheckCircle size={15} weight="fill" className="text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 3. Action CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#060B18] to-[#0A1024] border border-white/10 text-center space-y-4 shadow-2xl">
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
            Ready to start your distribution journey?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Create your account in seconds, browse the wholesale catalog, and claim your initial sales margins.
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="md" className="rounded-xl font-bold text-xs" iconRight={<ArrowRight size={13} />}>
                Create Partner Account
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="secondary" size="md" className="rounded-xl text-xs font-semibold">
                Explore Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

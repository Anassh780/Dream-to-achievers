import React from 'react';
import {
  Truck,
  Package,
  TrendUp,
  Users,
  Trophy,
  Megaphone,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface BentoWorkProps {
  showHeader?: boolean;
}

export const BentoWork: React.FC<BentoWorkProps> = ({ showHeader = true }) => {
  const benefits = [
    {
      id: 'bento-logistics',
      title: 'Nationwide Logistics & COD Dispatch',
      description:
        'Centralized order routing and delivery fleet coverage across 150+ cities. Couriers handle Cash on Delivery with real-time status sync.',
      badge: '99.4% Fulfillment Accuracy',
      icon: Truck,
      span: 'md:col-span-2 lg:col-span-8',
      highlight: 'End-to-End Fulfillment',
      accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    },
    {
      id: 'bento-wholesale-pricing',
      title: 'Wholesale Price Access',
      description:
        'Direct factory and verified distributor rates. Maintain healthy gross margins of +PKR 500 to PKR 1,300 on every unit sold.',
      badge: 'Up to 35% Margin',
      icon: TrendUp,
      span: 'md:col-span-1 lg:col-span-4',
      highlight: 'Margin Protection',
      accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
    {
      id: 'bento-inventory',
      title: 'Verified Catalog Inventory',
      description:
        'Curated selection of high-demand skincare formulas and lifestyle electronic accessories with continuous stock availability.',
      badge: '100+ Live SKUs',
      icon: Package,
      span: 'md:col-span-1 lg:col-span-4',
      highlight: 'Batch Quality Checked',
      accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    },
    {
      id: 'bento-referrals',
      title: 'Automated Partner Network Tracking',
      description:
        'Unique partner tracking codes attribute team registrations permanently. Transparent dashboard monitors qualified volume across tiers.',
      badge: '100% Attribution Accuracy',
      icon: Users,
      span: 'md:col-span-2 lg:col-span-4',
      highlight: 'Transparent Tracking',
      accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    },
    {
      id: 'bento-rewards',
      title: 'Rank Milestone Cash Rewards',
      description:
        'Structured 4-tier milestone ladder rewarding volume and team development with guaranteed cash bonuses from PKR 2,000 to PKR 10,000.',
      badge: 'PKR 10,000 Max Bonus',
      icon: Trophy,
      span: 'md:col-span-1 lg:col-span-4',
      highlight: 'Direct Disbursement',
      accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    },
    {
      id: 'bento-marketing',
      title: 'Distribution Marketing Assistance',
      description:
        'High-converting product creative assets, video ad scripts, demo reels, and catalog data sheets to accelerate reseller conversions.',
      badge: 'Ready-to-Use Creatives',
      icon: Megaphone,
      span: 'md:col-span-2 lg:col-span-12',
      highlight: 'Marketing Support',
      accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    },
  ];

  return (
    <section id="services" className="w-full font-sans">
      <div className="space-y-8">
        {showHeader && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Distribution Infrastructure
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                Wholesale Network Capabilities
              </h2>
            </div>
            <Link to="/services">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                Explore All Capabilities
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          {benefits.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`${card.span} p-6 sm:p-8 rounded-3xl bg-[#060B18] border border-white/[0.08] hover:border-cyan-400/30 transition-all flex flex-col justify-between space-y-5 shadow-xl group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${card.accentColor}`}>
                      <Icon size={20} weight="fill" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#030712] text-cyan-300 border border-white/10">
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium">
                  <span className="text-cyan-400 font-mono text-[11px]">{card.highlight}</span>
                  <Link to="/services" className="text-slate-400 hover:text-white flex items-center space-x-1 font-mono text-[11px] transition-colors">
                    <span>Learn more</span>
                    <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

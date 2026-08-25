import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Package,
  ShoppingCart,
  Users,
  Lightning,
  Gift,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Join as Partner',
      subtitle: 'Instant Access to Wholesale Pricing & Portal',
      desc: 'Sign up in under 60 seconds. You immediately unlock your partner dashboard, wholesale catalog rates, and unique referral tracking code.',
      icon: UserPlus,
      highlight: 'Zero Franchise Fee',
    },
    {
      num: '02',
      title: 'Choose In-Demand Products',
      subtitle: 'Curated Skincare, Tech & Lifestyle Goods',
      desc: 'Browse our catalog of verified consumer goods. Every item comes with established partner wholesale prices and suggested retail rates.',
      icon: Package,
      highlight: 'Direct Wholesale Access',
    },
    {
      num: '03',
      title: 'Sell Directly to Customers',
      subtitle: 'Market to Your Audience & Network',
      desc: 'Share products with customers. Nationwide courier fulfillment delivers directly to your customer with cash-on-delivery tracking.',
      icon: ShoppingCart,
      highlight: 'Nationwide Delivery',
    },
    {
      num: '04',
      title: 'Earn Direct Profit Margins',
      subtitle: 'Earn Immediate PKR 500+ Gross Margins',
      desc: 'When a customer purchases at retail (e.g. PKR 2,500), you keep the gross profit margin (PKR 500) directly credited to your profit ledger.',
      icon: Lightning,
      highlight: 'Instant Gross Profit',
    },
    {
      num: '05',
      title: 'Build Your Community',
      subtitle: 'Grow a Team of Active Partners',
      desc: 'Share your referral code with aspiring entrepreneurs. As they register and generate sales, they count toward your verified community milestones.',
      icon: Users,
      highlight: 'Verified Attributions',
    },
    {
      num: '06',
      title: 'Unlock Ranks & Cash Rewards',
      subtitle: 'PKR 2,000 up to PKR 10,000 Milestone Bonuses',
      desc: 'Meet dual requirements across product sales and community members to unlock guaranteed cash milestone bonuses from Silver up to Diamond.',
      icon: Gift,
      highlight: 'Guaranteed Tier Payouts',
    },
  ];

  return (
    <div className="space-y-20 pb-24 max-w-5xl mx-auto px-5 sm:px-8 font-sans">
      {/* Header */}
      <section className="pt-8 text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
          Six-Stage Business Blueprint
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
          How Dream to Achievers Works
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          A systematic, transparent process engineered to reward active product sales and community leadership.
        </p>
      </section>

      {/* Visual Step-by-Step Connected Journey */}
      <section className="space-y-6 max-w-3xl mx-auto">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.num} className="double-bezel">
              <div className="double-bezel-inner p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-2 flex items-center md:flex-col md:items-start justify-between">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#60A5FA]">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-[#0A0F19] border border-white/[0.06] flex items-center justify-center text-[#60A5FA] mt-2">
                    <Icon size={20} />
                  </div>
                </div>

                <div className="md:col-span-10 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-heading font-bold text-lg text-white">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono text-[#60A5FA] bg-[#3B82F6]/10 px-2.5 py-0.5 rounded-full border border-[#3B82F6]/20 w-fit">
                      {item.highlight}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] font-medium">{item.subtitle}</p>
                  <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed pt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA Section */}
      <section className="double-bezel">
        <div className="double-bezel-inner p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-2xl font-heading font-bold text-white tracking-tight">
            Ready to put this system into action?
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto">
            Create your partner account today and start earning product sales margins and rank rewards immediately.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-6 group"
                iconRight={
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white ml-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={13} weight="bold" />
                  </span>
                }
              >
                Create Partner Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

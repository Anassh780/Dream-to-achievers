import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import {
  UserPlus,
  Package,
  ShareNetwork,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

export const HowItWorks: React.FC = () => {
  const visualSteps = [
    {
      step: '01',
      title: 'Join for Free',
      shortDesc: 'Sign up in 30 seconds to unlock wholesale partner pricing.',
      icon: UserPlus,
      highlight: 'Zero registration fee · Instant dashboard access',
    },
    {
      step: '02',
      title: 'Choose Products',
      shortDesc: 'Pick from 100+ verified skincare and consumer tech products.',
      icon: Package,
      highlight: 'PKR 500 – 1,300 transparent margin per item',
    },
    {
      step: '03',
      title: 'Share & Take Orders',
      shortDesc: 'Post product images and videos on WhatsApp, TikTok, or Instagram.',
      icon: ShareNetwork,
      highlight: 'Free marketing photos and video scripts provided',
    },
    {
      step: '04',
      title: 'We Ship & You Get Paid',
      shortDesc: 'We pack and deliver nationwide via courier Cash on Delivery (COD).',
      icon: Truck,
      highlight: 'Profit credited straight to your dashboard wallet',
    },
  ];

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Sell Wholesale Products with Dream to Achievers',
    description: 'A 4-step process for starting an online reselling business in Pakistan with zero upfront inventory investment.',
    step: visualSteps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.title,
      text: s.shortDesc,
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="How It Works — B2B Wholesale Reselling Process | Dream to Achievers"
        description="Learn how to start an online reselling business with Dream to Achievers in 4 steps. Source verified products, sell nationwide via COD, and withdraw guaranteed profits."
        canonicalPath="/how-it-works"
        ogType="website"
        structuredData={howToSchema}
      />
      
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09] relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9C08A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1180px] mx-auto max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <ShieldCheck size={13} weight="bold" />
            <span>Turnkey Distribution Protocol</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.1]">
            How Dream to Achievers Works
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed max-w-md mx-auto">
            A visual roadmap to launching your wholesale business and securing reliable profit margins with zero upfront inventory investment.
          </p>
        </div>
      </section>

      {/* 2. Visual 4-Step Grid */}
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visualSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-6 sm:p-8 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 shadow-xl space-y-5 hover:border-[#D9C08A]/40 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(217,192,138,0.08)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#131E1A] border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A] shadow-md group-hover:scale-105 transition-transform">
                      <Icon size={24} weight="bold" />
                    </div>
                    <span className="font-serif text-3xl font-normal text-[#D9C08A]">
                      {step.step}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors">
                      {step.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
                      {step.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-[#34D399] font-medium">
                  <CheckCircle size={15} weight="bold" className="shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Action CTA Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D1512] to-[#070B09] border border-[#D9C08A]/35 text-[#F4F7F5] text-center space-y-5 max-w-2xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D9C08A]/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#F4F7F5] relative z-10">
            Ready to start earning wholesale profits?
          </h3>
          <p className="text-xs sm:text-sm text-[#9EABA2] max-w-md mx-auto leading-relaxed relative z-10">
            Create your free partner account and start distributing verified wholesale inventory today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            <Link to="/signup">
              <Button variant="champagne" size="md" className="font-medium shadow-lg" iconRight={<ArrowRight size={13} />}>
                Create Free Partner Account
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="md" className="border-white/20 text-[#F4F7F5] hover:bg-[#D9C08A]/10 hover:border-[#D9C08A]/40 font-medium">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HowItWorks;

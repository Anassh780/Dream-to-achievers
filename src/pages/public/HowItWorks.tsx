import React from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
            <ShieldCheck size={13} weight="bold" />
            <span>Simple Reseller Process</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            How Dream to Achievers Works
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-md mx-auto">
            A visual guide to starting your reselling business and earning profit without buying inventory.
          </p>
        </div>
      </section>

      {/* 2. Visual 4-Step Grid */}
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visualSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3DCC8] shadow-xs space-y-4 hover:border-[#1F4D3E]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
                      <Icon size={24} weight="bold" />
                    </div>
                    <span className="font-serif text-3xl font-bold text-[#B8862E]">
                      {step.step}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#1E241F]">
                      {step.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                      {step.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E3DCC8] flex items-center gap-2 text-xs font-mono text-[#1F4D3E] font-medium">
                  <CheckCircle size={15} weight="bold" className="shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Action CTA Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#1F4D3E] text-white text-center space-y-5 max-w-2xl mx-auto shadow-md">
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
            Ready to start making profit?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto leading-relaxed">
            Create your free partner account and start selling verified wholesale products today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link to="/signup">
              <Button variant="outline" size="md" className="bg-white text-[#1F4D3E] hover:bg-emerald-50 border-white font-medium" iconRight={<ArrowRight size={13} />}>
                Create Free Partner Account
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="ghost" size="md" className="text-white hover:bg-[#153A2E]/80 border-white/25 font-medium">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HowItWorks;

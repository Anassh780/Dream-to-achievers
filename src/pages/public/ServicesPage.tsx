import React from 'react';
import { BentoWork } from '@/components/sections/BentoWork';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from '@phosphor-icons/react';

export const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      {/* 1. Page Header */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-4">
          <div className="eyebrow">
            <ShieldCheck size={13} weight="bold" />
            <span>Growth &amp; Distribution Ecosystem</span>
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            Ecosystem &amp; Partner Services
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-lg mx-auto">
            In addition to our physical product catalog, DreamToAchievers equips partners with logistics support, verified inventory, and partner network growth tools.
          </p>
        </div>
      </section>

      {/* 2. Services Bento Grid */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-16">
        <BentoWork showHeader={false} />

        {/* 3. CTA */}
        <section className="p-8 sm:p-12 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <h3 className="font-display text-2xl font-medium text-[#1E241F]">
            Have questions about specific services?
          </h3>
          <p className="text-xs sm:text-sm text-[#5B5C50]">
            Connect with our partner growth team to learn how to integrate these solutions into your distribution pipeline.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="primary" size="md" className="font-medium" iconRight={<ArrowRight size={13} />}>
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

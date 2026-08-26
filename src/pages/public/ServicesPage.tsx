import React from 'react';
import { BentoWork } from '@/components/sections/BentoWork';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkle } from '@phosphor-icons/react';

export const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      {/* 1. Page Header */}
      <section className="relative pt-24 sm:pt-28 pb-14 border-b border-white/[0.08] bg-radial-hero overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-4 text-center">
          <div className="eyebrow mx-auto">
            <ShieldCheck size={13} weight="bold" />
            <span>Growth & Distribution Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
            Ecosystem & Partner Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            In addition to our physical product catalog, DreamToAchievers equips partners with logistics support, verified inventory, and performance marketing infrastructure.
          </p>
        </div>
      </section>

      {/* 2. Services Bento Grid */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 space-y-16">
        <BentoWork showHeader={false} />

        {/* 3. CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#060B18] border border-white/[0.08] text-center space-y-4 max-w-2xl mx-auto shadow-2xl">
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
            Have questions about specific services?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Connect with our partner growth team to learn how to integrate these solutions into your distribution pipeline.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="primary" size="md" className="rounded-xl font-bold text-xs" iconRight={<ArrowRight size={13} />}>
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

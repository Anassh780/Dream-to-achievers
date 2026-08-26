import React from 'react';
import { Target, Users, TrendUp, ShieldCheck, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      {/* 1. Hero Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-4">
          <div className="eyebrow">
            <ShieldCheck size={13} weight="bold" />
            <span>Platform Mission &amp; Architecture</span>
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            Pakistan's Premier Wholesale &amp; Partner Growth Ecosystem
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-lg mx-auto">
            DreamToAchievers connects quality product manufacturing with independent partner distribution, automated COD logistics, and structured milestone cash rewards.
          </p>
        </div>
      </section>

      {/* 2. Core Pillars Bento Grid */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-xl bg-white border border-[#E3DCC8] space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
              <Target size={20} weight="bold" />
            </div>
            <h3 className="font-display font-medium text-lg text-[#1E241F]">Our Mission</h3>
            <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
              To empower independent entrepreneurs by eliminating inventory risk, providing direct wholesale partner pricing, and rewarding verified community growth through transparent rank milestones.
            </p>
          </div>

          <div className="p-7 rounded-xl bg-white border border-[#E3DCC8] space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
              <TrendUp size={20} weight="bold" />
            </div>
            <h3 className="font-display font-medium text-lg text-[#1E241F]">Product-First Economics</h3>
            <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
              Every profit margin and milestone reward is backed by genuine customer product transactions. We prioritize consumable, high-demand goods with verified consumer satisfaction.
            </p>
          </div>

          <div className="p-7 rounded-xl bg-white border border-[#E3DCC8] space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E]">
              <Users size={20} weight="bold" />
            </div>
            <h3 className="font-display font-medium text-lg text-[#1E241F]">Community &amp; Mentorship</h3>
            <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
              Partners receive ongoing strategic guidance in direct client sales, social media catalog marketing, and team mentoring to ensure sustainable long-term scale.
            </p>
          </div>
        </div>

        {/* 3. Operational Architecture Matrix */}
        <div className="p-8 sm:p-10 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1F4D3E] font-semibold">
                Transparent Governance
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-medium text-[#1E241F]">
                How DreamToAchievers Operates
              </h2>
            </div>
            <Link to="/signup">
              <Button variant="primary" size="sm" className="font-medium" iconRight={<ArrowRight size={13} />}>
                Join Partner Network
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-white border border-[#E3DCC8] space-y-1.5 shadow-xs">
              <span className="text-[#1F4D3E] font-mono font-semibold text-xs block">01 / Sourcing</span>
              <p className="text-[#5B5C50] leading-relaxed">Direct manufacturer partnerships guarantee high profit margins without intermediate retail markups.</p>
            </div>
            <div className="p-4 rounded-lg bg-white border border-[#E3DCC8] space-y-1.5 shadow-xs">
              <span className="text-[#1F4D3E] font-mono font-semibold text-xs block">02 / Logistics</span>
              <p className="text-[#5B5C50] leading-relaxed">Nationwide cash-on-delivery infrastructure handles fulfillment, parcel tracking, and payment clearance.</p>
            </div>
            <div className="p-4 rounded-lg bg-white border border-[#E3DCC8] space-y-1.5 shadow-xs">
              <span className="text-[#B8862E] font-mono font-semibold text-xs block">03 / Milestones</span>
              <p className="text-[#5B5C50] leading-relaxed">4-tier rank qualification roadmap awards guaranteed cash bonuses up to PKR 10,000 upon volume achievement.</p>
            </div>
            <div className="p-4 rounded-lg bg-white border border-[#E3DCC8] space-y-1.5 shadow-xs">
              <span className="text-[#1F4D3E] font-mono font-semibold text-xs block">04 / Growth</span>
              <p className="text-[#5B5C50] leading-relaxed">Performance marketing hooks and video pipelines help partners convert viewers into repeat customers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

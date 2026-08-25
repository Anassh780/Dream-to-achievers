import React from 'react';
import { OwnerProfile } from '@/components/sections/OwnerProfile';
import { Target, Users, TrendUp, Sparkle } from '@phosphor-icons/react';

export const About: React.FC = () => {
  return (
    <div className="space-y-24 pb-24 max-w-6xl mx-auto px-5 sm:px-8 font-sans">
      {/* Top Hero Banner */}
      <section className="pt-8 text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
          Platform Mission & Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
          Pakistan's Premier Product & Leadership Ecosystem
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          Dream to Achievers is a commerce and community platform designed to bridge quality product manufacturing with independent partner distribution, data-driven advertising, and milestone cash rewards.
        </p>
      </section>

      {/* Core Values Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-7 space-y-3 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0F19] border border-white/[0.06] flex items-center justify-center text-[#60A5FA]">
                <Target size={20} />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Our Mission</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                To democratize e-commerce entrepreneurship by eliminating inventory bottlenecks, providing verified wholesale catalog pricing, and rewarding community growth through transparent rank milestones.
              </p>
            </div>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-7 space-y-3 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0F19] border border-white/[0.06] flex items-center justify-center text-[#22C55E]">
                <TrendUp size={20} />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Product-First Model</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Every profit margin and milestone reward is backed by genuine customer product transactions. We prioritize consumable, high-demand goods with verified consumer satisfaction.
              </p>
            </div>
          </div>
        </div>

        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-7 space-y-3 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A0F19] border border-white/[0.06] flex items-center justify-center text-[#F59E0B]">
                <Users size={20} />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Community & Mentorship</h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Partners receive ongoing strategic guidance in digital advertising, social media content generation, and customer relations to ensure sustainable long-term scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Profile Section */}
      <div className="pt-4">
        <OwnerProfile />
      </div>
    </div>
  );
};

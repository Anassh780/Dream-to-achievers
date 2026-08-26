import React from 'react';
import { Target, Users, TrendUp, ShieldCheck, Sparkle, Globe, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      {/* 1. Hero Banner */}
      <section className="relative pt-24 sm:pt-28 pb-14 border-b border-white/[0.08] bg-radial-hero overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-4 text-center">
          <div className="eyebrow mx-auto">
            <ShieldCheck size={13} weight="bold" />
            <span>Platform Mission & Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
            Pakistan's Premier Wholesale & Partner Commerce Ecosystem
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            DreamToAchievers connects quality product manufacturing with independent partner distribution, automated nationwide logistics, and structured milestone cash rewards.
          </p>
        </div>
      </section>

      {/* 2. Pillars Bento Grid */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-4 shadow-xl hover:border-cyan-400/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <Target size={20} weight="fill" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              To empower independent entrepreneurs by eliminating inventory risk, providing direct wholesale partner pricing, and rewarding verified community growth through transparent rank milestones.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-4 shadow-xl hover:border-cyan-400/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <TrendUp size={20} weight="fill" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Product-First Economics</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every profit margin and milestone reward is backed by genuine customer product transactions. We prioritize consumable, high-demand goods with verified consumer satisfaction.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-4 shadow-xl hover:border-cyan-400/30 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Users size={20} weight="fill" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Community & Mentorship</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Partners receive ongoing strategic guidance in direct client sales, social media catalog marketing, and team mentoring to ensure sustainable long-term scale.
            </p>
          </div>
        </div>

        {/* 3. Platform Architecture Matrix */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Transparent Governance
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                How DreamToAchievers Operates
              </h2>
            </div>
            <Link to="/signup">
              <Button variant="primary" size="sm" className="rounded-xl font-bold text-xs" iconRight={<ArrowRight size={13} />}>
                Join Partner Network
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-2">
              <span className="text-cyan-300 font-mono font-bold text-sm block">01 / Sourcing</span>
              <p className="text-slate-300 leading-relaxed">Direct manufacturer partnerships guarantee high profit margins without intermediate retail markups.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-2">
              <span className="text-emerald-300 font-mono font-bold text-sm block">02 / Logistics</span>
              <p className="text-slate-300 leading-relaxed">Nationwide cash-on-delivery infrastructure handles fulfillment, parcel tracking, and payment clearance.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-2">
              <span className="text-amber-300 font-mono font-bold text-sm block">03 / Milestones</span>
              <p className="text-slate-300 leading-relaxed">4-tier rank qualification roadmap awards guaranteed cash bonuses up to PKR 10,000 upon volume achievement.</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-2">
              <span className="text-purple-300 font-mono font-bold text-sm block">04 / Growth</span>
              <p className="text-slate-300 leading-relaxed">Automated performance marketing hooks and video pipelines to help partners convert viewers into repeat customers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

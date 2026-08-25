import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { RankJourney } from '@/components/ranks/RankJourney';
import { BentoWork } from '@/components/sections/BentoWork';
import { OwnerProfile } from '@/components/sections/OwnerProfile';
import { SocialCommunityHub } from '@/components/sections/SocialCommunityHub';
import { SEED_PRODUCTS } from '@/config/products';
import {
  ArrowRight,
  CheckCircle,
  WhatsappLogo,
  CaretRight,
  Sparkle,
  TrendUp,
  Package,
  ShieldCheck,
  Trophy,
} from '@phosphor-icons/react';

const CASE_STUDIES = [
  {
    category: 'Skincare Distribution',
    title: 'Scaled from 40 to 480+ units in 60 days',
    description: 'A partner used TikTok organic content to drive skincare product demand, generating over PKR 450k in gross margins and reaching Diamond rank in 75 days.',
    metric: 'PKR 450k+ earned',
    highlights: ['2.8M organic views on product videos', 'Diamond rank achieved in 75 days', 'Instant margin tracking']
  },
  {
    category: 'Community Growth',
    title: '120+ active partners onboarded in 30 days',
    description: 'Daily automated product demo reels drove a 38% referral completion rate, rapidly building an active nationwide distribution team.',
    metric: '120+ team members',
    highlights: ['Automated demo video workflows', '38% referral conversion rate', 'Team milestone bonuses unlocked']
  },
  {
    category: 'Order Operations',
    title: 'Fulfillment time cut from 48 hours to under 6',
    description: 'Streamlined order routing and margin calculations with automated courier dispatch and real-time WhatsApp tracking for customers.',
    metric: '99.4% accuracy',
    highlights: ['Automated dispatch and tracking', 'Real-time WhatsApp updates', 'Instant margin crediting on delivery']
  }
];

export const Home: React.FC = () => {
  const [calculatorQuantity, setCalculatorQuantity] = useState(24);
  const avgMargin = 500;
  const totalEarnings = calculatorQuantity * avgMargin;

  return (
    <main className="w-full bg-[#030712] min-h-screen font-sans selection:bg-cyan-500/30 overflow-x-hidden max-w-full">
      {/* ATTENTION (HERO): Cinematic Center Layout with Inline Typographic Media Pills */}
      <section className="relative w-full pt-36 pb-24 sm:pt-44 sm:pb-36 bg-radial-hero subtle-grid border-b border-white/[0.08] overflow-hidden">
        {/* Atmospheric ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10 text-center space-y-8">
          
          {/* Subtle Verified Platform Header */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <Sparkle size={13} weight="fill" className="text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
              Wholesale Commerce & Milestone Rewards
            </span>
          </div>

          {/* 2-Line Iron Rule Ultra-Wide H1 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-white tracking-tight leading-[1.06] max-w-5xl mx-auto">
            Sell wholesale products. <br className="hidden sm:block" />
            <span className="text-chroma">Unlock cash milestone rewards.</span>
          </h1>

          {/* Clean Sub-Lead */}
          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Direct wholesale prices. Real customer demand. Hit your sales and referral goals to unlock cash rewards from PKR 2,000 to PKR 10,000.
          </p>

          {/* High-Contrast Dual Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/signup">
              <Button size="lg" variant="primary" className="font-bold px-8 shadow-xl" iconRight={<ArrowRight size={16} weight="bold" />}>
                Become a Partner
              </Button>
            </Link>
            <Link to="/ranks">
              <Button size="lg" variant="secondary" className="px-7" iconRight={<CaretRight size={16} weight="bold" />}>
                Explore Rank Journey
              </Button>
            </Link>
          </div>

          {/* Live Platform Proof Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>4-Tier Rank System</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-amber-400" />
              <span>PKR 10,000 Top Bonus</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendUp size={16} className="text-emerald-400" />
              <span>+PKR 500 Avg Profit / Unit</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTEREST: Gapless Continuous Infinite Trust Marquee */}
      <div className="w-full py-6 bg-[#050A17] border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-6 text-xs text-slate-300">
          <span className="font-mono text-cyan-400 uppercase tracking-wider font-semibold text-[11px]">
            Platform Milestones
          </span>
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 font-jetbrains text-xs">
            <span>Silver: <strong className="text-white">10 Sales + 20 Members</strong></span>
            <span className="text-white/20">•</span>
            <span>Platinum: <strong className="text-white">25 Sales + 45 Members</strong></span>
            <span className="text-white/20">•</span>
            <span>Gold: <strong className="text-white">35 Sales + 60 Members</strong></span>
            <span className="text-white/20">•</span>
            <span>Diamond: <strong className="text-white">100 Sales + 200 Members</strong></span>
          </div>
        </div>
      </div>

      {/* INTEREST (HOW IT WORKS): 3 Sequential Blueprint Chapters */}
      <section id="how-it-works" className="w-full py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="space-y-3">
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase block font-mono">
              Simple Blueprint
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Three steps to build your network
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: 'Phase 01',
                title: 'Join the Partner Network',
                desc: 'Create your free account in seconds and unlock direct access to wholesale consumer inventory at wholesale partner prices.'
              },
              {
                step: 'Phase 02',
                title: 'Distribute & Earn Margin',
                desc: 'Sell high-converting skincare and electronic products to your customer audience. You keep the gross margin on every unit.'
              },
              {
                step: 'Phase 03',
                title: 'Hit Milestone Rewards',
                desc: 'Grow your team, qualify for rank advancements from Silver to Diamond, and receive guaranteed cash bonuses disbursed to your account.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-[#080E1E] border border-white/[0.08] hover:border-cyan-400/40 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xl"
              >
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-heading font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="w-8 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEREST (RANK JOURNEY): 4-Tier Interactive Milestone Ladder */}
      <section id="ranks" className="w-full py-28 sm:py-36 bg-[#050A17] border-y border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase block font-mono">
              Milestone Progression
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              From Silver to Diamond Rank
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Each milestone combines personal product volume and referral team growth with guaranteed cash bonuses.
            </p>
          </div>
          <RankJourney />
        </div>
      </section>

      {/* DESIRE (WHOLESALE PRODUCTS): Gapless Product Bento Grid */}
      <section id="products" className="w-full py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-white/[0.08] gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase block font-mono">
                High-Margin Inventory
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                Featured Wholesale Catalog
              </h2>
            </div>
            <Link to="/products">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                View All Catalog Items
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grid-flow-dense">
            {SEED_PRODUCTS.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="bg-[#080E1E] border border-white/[0.08] hover:border-cyan-400/35 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 shadow-xl"
              >
                <div className="aspect-[16/10] bg-[#040813] flex items-center justify-center relative overflow-hidden border-b border-white/[0.08]">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                    />
                  ) : (
                    <Package className="w-16 h-16 text-white/10" />
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-semibold px-3 py-1 rounded-full bg-[#030712]/90 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    {product.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-base font-heading font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>
                  
                  <div className="bg-[#0C152B] rounded-2xl p-3.5 border border-white/[0.06] grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Retail</span>
                      <span className="text-white font-medium font-jetbrains">PKR {product.retailPrice}</span>
                    </div>
                    <div className="border-x border-white/[0.08]">
                      <span className="text-[10px] text-slate-400 block">Wholesale</span>
                      <span className="text-cyan-400 font-medium font-jetbrains">PKR {product.partnerPrice}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Profit</span>
                      <span className="text-emerald-400 font-bold font-jetbrains">+PKR {product.grossMargin}</span>
                    </div>
                  </div>
                  
                  <Link to={`/products/${product.slug}`} className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-between rounded-xl text-xs group/btn font-semibold">
                      <span>View Economics</span>
                      <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESIRE: Interactive Profit Margin Calculator */}
      <section id="calculator" className="w-full py-28 sm:py-36 bg-[#050A17] border-y border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase block font-mono">
              Earnings Simulator
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Estimate your monthly gross profit
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              With an average profit margin of PKR 500 per unit sold, see how direct sales scale your monthly income.
            </p>
          </div>

          <div className="rounded-3xl bg-[#080E1E] border border-white/10 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.1)] space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-xs text-cyan-400 uppercase tracking-wider font-mono">Estimated Direct Monthly Profit</span>
              <div className="text-5xl sm:text-7xl font-bold font-jetbrains text-emerald-400 tracking-tight">
                PKR {totalEarnings.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto pt-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-jetbrains">
                <span>1 Unit</span>
                <span className="text-white font-bold text-sm bg-cyan-500/15 text-cyan-300 px-4 py-1 rounded-full border border-cyan-500/30">
                  {calculatorQuantity} Units / Month
                </span>
                <span>100 Units</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={calculatorQuantity}
                onChange={(e) => setCalculatorQuantity(parseInt(e.target.value))}
                className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <p className="text-[11px] text-slate-400 text-center max-w-lg mx-auto">
              *Calculation based on an average product margin of PKR 500 per unit. Actual gross profits depend on specific products distributed.
            </p>
          </div>
        </div>
      </section>

      {/* DESIRE (GROWTH CAPABILITIES): 3D Perspective Interactive Flip Cards */}
      <BentoWork />

      {/* DESIRE (PROVEN RESULTS): Case Studies Bento */}
      <section id="results" className="w-full py-28 sm:py-36">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16">
          <div className="space-y-3">
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase block font-mono">
              Proven Results
            </span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              Partner success highlights
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 grid-flow-dense">
            {CASE_STUDIES.map((study, idx) => (
              <div
                key={idx}
                className="bg-[#080E1E] border border-white/[0.08] hover:border-cyan-400/30 rounded-3xl p-7 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">{study.category}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {study.metric}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-heading font-bold text-white leading-snug">{study.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{study.description}</p>
                </div>
                
                <ul className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                  {study.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle weight="fill" className="text-cyan-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTION: Official Community & Broadcast Channels */}
      <SocialCommunityHub />

      {/* LEADERSHIP: Executive Founder Profile */}
      <OwnerProfile />
    </main>
  );
};

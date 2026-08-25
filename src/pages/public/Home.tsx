import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { RankJourney } from '@/components/ranks/RankJourney';
import { BentoWork } from '@/components/sections/BentoWork';
import { OwnerProfile } from '@/components/sections/OwnerProfile';
import { SEED_PRODUCTS } from '@/config/products';
import {
  ArrowRight,
  CheckCircle,
  WhatsappLogo,
  CaretRight,
  Star,
  TrendUp,
  Package,
} from '@phosphor-icons/react';

const RANK_PREVIEWS = [
  { name: 'Silver', target: '20 sales', bonus: 'PKR 2,000' },
  { name: 'Platinum', target: '45 sales', bonus: 'PKR 4,000' },
  { name: 'Gold', target: '60 sales', bonus: 'PKR 6,000' },
  { name: 'Diamond', target: '200 sales', bonus: 'PKR 10,000' },
];

const CASE_STUDIES = [
  {
    label: 'Skincare Distribution',
    title: 'Scaled from 40 to 480+ units in 60 days',
    description: 'A partner used TikTok organic content to drive skincare product demand, generating over PKR 450k in margins and reaching Diamond rank qualification in 75 days.',
    metric: 'PKR 450k+ earned',
    highlights: ['2.8M organic views on product videos', 'Diamond rank qualified in 75 days', 'Automated margin tracking']
  },
  {
    label: 'Community Growth',
    title: '120+ active partners onboarded in 30 days',
    description: 'Daily automated product demo reels drove a 38% referral completion rate, rapidly building an active distribution network.',
    metric: '120+ team members',
    highlights: ['Automated demo video workflows', '38% referral conversion rate', 'Multiple team milestone bonuses unlocked']
  },
  {
    label: 'Order Operations',
    title: 'Fulfillment time cut from 48 hours to under 6',
    description: 'Streamlined order routing and margin calculations with automated courier dispatch and real-time WhatsApp tracking for customers.',
    metric: '99.4% accuracy',
    highlights: ['Automated dispatch and tracking', 'Real-time WhatsApp updates', 'Instant margin crediting on delivery']
  }
];

export const Home: React.FC = () => {
  const [calculatorQuantity, setCalculatorQuantity] = useState(20);
  const avgMargin = 500;
  const totalEarnings = calculatorQuantity * avgMargin;

  return (
    <div className="w-full bg-[#06090F] min-h-screen font-sans selection:bg-[#3B82F6]/30 overflow-x-hidden">
      {/* SECTION 1: HERO */}
      <section className="relative w-full pt-32 pb-20 sm:pt-36 sm:pb-28 bg-radial-hero subtle-grid border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-sm">
                <Star weight="fill" className="text-blue-400 w-3.5 h-3.5" />
                <span className="text-xs font-mono font-medium text-white/90 tracking-wide uppercase">
                  Dream to Achievers Ecosystem
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold font-outfit text-white leading-[1.1] tracking-tight" style={{ textWrap: 'balance' }}>
                Sell premium products.<br/>
                <span className="text-blue-400">Build your team.</span><br/>
                Get rewarded.
              </h1>
              
              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl">
                Join our partner network to sell high-margin consumer products at wholesale rates. Hit your sales and team-building targets to unlock cash milestone rewards from PKR 2,000 to PKR 10,000.
              </p>
              
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link to="/signup">
                  <Button size="lg" variant="primary" iconRight={<ArrowRight weight="bold" />}>
                    Become a Partner
                  </Button>
                </Link>
                <Link to="/ranks">
                  <Button size="lg" variant="secondary" iconRight={<CaretRight weight="bold" />}>
                    Explore the Journey
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Content - Rank Preview Interactive Card */}
            <div className="lg:col-span-5 relative mx-auto w-full max-w-md">
              <div className="relative rounded-3xl bg-[#0E1626] border border-white/[0.08] p-6 sm:p-7 shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                  <h3 className="text-base font-outfit font-semibold text-white">Milestone Progression</h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Live System
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  {RANK_PREVIEWS.map((rank) => (
                    <div 
                      key={rank.name} 
                      className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#0A0F19] border border-white/[0.04] hover:border-white/15 hover:bg-[#121C2E] transition-all"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:border-blue-400 group-hover:bg-blue-500/20 transition-colors">
                        <TrendUp className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{rank.name} Rank</span>
                          <span className="text-blue-400 font-jetbrains text-xs font-bold">{rank.bonus}</span>
                        </div>
                        <p className="text-[11px] text-white/50">{rank.target}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-2">
                  <Link to="/signup" className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-center rounded-xl text-xs">
                      Start at Silver Rank Today
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST STATS BAR */}
      <section className="w-full border-b border-white/[0.06] bg-[#0A101C]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06]">
            {[
              { label: 'Rank Tiers', value: '4' },
              { label: 'Top Milestone Bonus', value: 'PKR 10,000' },
              { label: 'Avg Margin / Unit', value: 'PKR 500+' },
              { label: 'Verified Catalog', value: '6 Items' }
            ].map((stat, idx) => (
              <div key={idx} className="py-8 px-4 flex flex-col items-center justify-center text-center">
                <div className="text-2xl sm:text-3xl font-semibold font-outfit text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-white/50 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="w-full py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
          <div>
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase block mb-2 font-mono">
              Simple Blueprint
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-semibold text-white tracking-tight">
              Three steps to start earning
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: 'Join the network', desc: 'Register as a verified partner in seconds and get direct wholesale access to consumer catalogs at discounted partner rates.' },
              { title: 'Sell to customers', desc: 'Market high-converting skincare and tech items to your audience at standard retail prices. You keep the gross margin on every unit.' },
              { title: 'Earn cash rewards', desc: 'Build your referral team, hit dual sales and community targets, and unlock guaranteed cash milestone bonuses from Silver to Diamond.' }
            ].map((step, idx) => (
              <div key={idx} className="relative pt-6 border-t border-blue-500/30">
                <div className="absolute top-0 right-0 -mt-[1.125rem] text-6xl font-bold text-white/[0.04] select-none font-outfit">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-2 relative z-10">{step.title}</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: RANK JOURNEY */}
      <section id="ranks" className="w-full py-20 sm:py-28 bg-[#080C14] border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase block font-mono">
              Milestone Progression
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-semibold text-white tracking-tight">
              Your path from Silver to Diamond
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Every verified sale and activated partner team member advances your rank toward cash rewards.
            </p>
          </div>
          <RankJourney />
        </div>
      </section>

      {/* SECTION 5: WHOLESALE PRODUCTS */}
      <section id="products" className="w-full py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-white/[0.06] gap-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase block mb-2 font-mono">
                High-Margin Inventory
              </span>
              <h2 className="text-3xl sm:text-4xl font-outfit font-semibold text-white tracking-tight">
                Featured Wholesale Catalog
              </h2>
            </div>
            <Link to="/products">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                View All Catalog Items
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEED_PRODUCTS.slice(0, 3).map((product) => (
              <div key={product.id} className="bg-[#0A0F19] border border-white/[0.06] hover:border-white/15 rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 shadow-xl">
                <div className="aspect-[16/10] bg-[#070A12] flex items-center justify-center relative overflow-hidden border-b border-white/[0.06]">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                    />
                  ) : (
                    <Package className="w-16 h-16 text-white/10" />
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#06090F]/90 backdrop-blur-md text-white border border-white/10">
                    {product.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-heading font-bold text-white group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>
                  
                  <div className="bg-[#0E1626] rounded-2xl p-3.5 border border-white/[0.04] grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-white/40 block">Retail</span>
                      <span className="text-white font-medium font-jetbrains">PKR {product.retailPrice}</span>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <span className="text-[10px] text-white/40 block">Wholesale</span>
                      <span className="text-blue-400 font-medium font-jetbrains">PKR {product.partnerPrice}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">Profit</span>
                      <span className="text-emerald-400 font-bold font-jetbrains">+PKR {product.grossMargin}</span>
                    </div>
                  </div>
                  
                  <Link to={`/products/${product.slug}`} className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-between rounded-xl text-xs group/btn">
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

      {/* SECTION 6: INTERACTIVE PROFIT CALCULATOR */}
      <section id="calculator" className="w-full py-20 sm:py-28 bg-[#080C14] border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase block font-mono">
              Earnings Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-semibold text-white tracking-tight">
              See what you could earn
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto">
              Every verified unit sold yields an average profit margin of PKR 500. Drag the slider to simulate monthly earnings.
            </p>
          </div>

          <div className="rounded-3xl bg-[#0E1626] border border-white/[0.08] p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <span className="text-xs text-white/50 uppercase tracking-wider font-mono">Estimated Direct Monthly Profit</span>
              <div className="text-4xl sm:text-6xl font-bold font-jetbrains text-emerald-400 tracking-tight">
                PKR {totalEarnings.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex justify-between items-center text-xs text-white/60 font-jetbrains">
                <span>1 Unit</span>
                <span className="text-white font-bold text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
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
                className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <p className="text-[11px] text-white/40 text-center max-w-lg mx-auto">
              *Calculation based on an average product margin of PKR 500 per unit. Actual gross profits depend on specific products distributed.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE FLIP CARDS (GROWTH SERVICES) */}
      <BentoWork />

      {/* SECTION 8: CASE STUDIES */}
      <section id="results" className="w-full py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
          <div>
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase block mb-2 font-mono">
              Proven Results
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-semibold text-white tracking-tight">
              What our partners have achieved
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {CASE_STUDIES.map((study, idx) => (
              <div key={idx} className="bg-[#0A0F19] border border-white/[0.06] hover:border-white/15 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">{study.label}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {study.metric}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-heading font-bold text-white leading-snug">{study.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{study.description}</p>
                </div>
                
                <ul className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                  {study.highlights.map((highlight, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5 text-xs text-white/80">
                      <CheckCircle weight="fill" className="text-blue-400 w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: FOUNDER PROFILE */}
      <OwnerProfile />

      {/* SECTION 10: FINAL CONVERSION CTA */}
      <section className="relative w-full py-24 sm:py-32 overflow-hidden border-t border-white/[0.06] bg-radial-hero">
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-5xl font-outfit font-semibold text-white tracking-tight">
              Ready to start earning?
            </h2>
            <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
              Create your verified partner account in seconds and unlock wholesale catalog rates today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full" iconRight={<ArrowRight weight="bold" />}>
                Create Free Account
              </Button>
            </Link>
            <a 
              href="https://wa.me/923054511395?text=Hi%20Faria,%20I%20would%20like%20to%20join%20Dream%20to%20Achievers." 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" variant="secondary" className="w-full" iconLeft={<WhatsappLogo weight="fill" className="text-emerald-400" />}>
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

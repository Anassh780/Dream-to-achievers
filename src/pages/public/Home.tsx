import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DepthCarousel } from '@/components/ui/DepthCarousel';
import { FAQSection } from '@/components/sections/FAQSection';
import { OwnerProfile } from '@/components/sections/OwnerProfile';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { Strands } from '@/components/ui/Strands';
import { SEED_PRODUCTS } from '@/config/products';
import {
  ArrowRight,
  ShieldCheck,
  Package,
  Trophy,
  Users,
  CheckCircle,
  Truck,
  Sparkle,
} from '@phosphor-icons/react';

export const Home: React.FC = () => {
  const [calculatorQuantity, setCalculatorQuantity] = useState(24);
  const avgMargin = 650;
  const totalEarnings = calculatorQuantity * avgMargin;

  return (
    <div className="w-full bg-[#FAF7EF] text-[#1E241F] font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. CLEAN HERO SECTION */}
      <header className="px-6 sm:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
              <ShieldCheck size={14} weight="bold" />
              <span>Pakistan's Verified Wholesale Reseller Network</span>
            </div>

            <h1 className="font-serif font-normal text-3xl sm:text-5xl lg:text-[50px] tracking-tight leading-[1.12] text-[#1E241F]">
              Start your reselling business with <em className="italic text-[#1F4D3E] font-medium">zero upfront inventory</em>.
            </h1>

            <p className="text-sm sm:text-base text-[#5B5C50] max-w-[500px] leading-relaxed">
              Source verified products at direct wholesale rates, set your own selling price, and keep 100% of your profit margin. We deliver nationwide with Cash on Delivery (COD).
            </p>

            {/* Quick Benefits Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#1E241F] font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
                <span>Zero advance stock purchase needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
                <span>COD dispatch across 150+ cities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
                <span>PKR 500 – 1,300 profit per item</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
                <span>Instant partner referral tracking</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link to="/products">
                <Button variant="primary" size="lg" className="font-medium text-xs sm:text-sm" iconRight={<ArrowRight size={14} />}>
                  Browse Wholesale Catalog
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="font-medium text-xs sm:text-sm">
                  Join as Partner (Free)
                </Button>
              </Link>
            </div>

            {/* Quick Stats Strip */}
            <div className="pt-6 border-t border-[#E3DCC8] flex flex-wrap gap-8 sm:gap-12">
              <div>
                <div className="text-xs text-[#7C7D70]">Available Products</div>
                <div className="font-serif text-2xl font-medium text-[#1E241F] mt-0.5">100+ SKUs</div>
              </div>
              <div>
                <div className="text-xs text-[#7C7D70]">Avg. Profit per Unit</div>
                <div className="font-serif text-2xl font-medium text-[#1F4D3E] mt-0.5">PKR 650+</div>
              </div>
              <div>
                <div className="text-xs text-[#7C7D70]">Milestone Rewards</div>
                <div className="font-serif text-2xl font-medium text-[#B8862E] mt-0.5">Up to PKR 10K</div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Wholesale Margin Ledger Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white border border-[#E3DCC8] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              
              {/* Card Header with subtle gradient */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#F1ECDD] to-[#FAF7EF] border-b border-[#E3DCC8]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1F4D3E] animate-pulse" />
                  <span className="text-[13px] font-semibold text-[#1E241F] tracking-tight">
                    Live Profit Example
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[#1F4D3E] border border-[#1F4D3E]/20 bg-[#1F4D3E]/5 rounded-full px-3 py-1">
                  <ShieldCheck size={11} weight="bold" />
                  Verified
                </div>
              </div>

              {/* Hero Product Image + Details */}
              <div className="p-5 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-[68px] h-[68px] rounded-xl overflow-hidden bg-gradient-to-br from-[#EFE2C4] to-[#F1ECDD] border border-[#E3DCC8] shrink-0 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1608248597359-bb4f53ca0c59?auto=format&fit=crop&w=200&q=80"
                      alt="Luxe botanical elixir"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[#B8862E]"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="font-mono text-[10px] text-[#7C7D70] uppercase tracking-[0.08em] mb-0.5">
                      DTA-SKN-001 · Skincare
                    </div>
                    <div className="text-[14px] font-semibold text-[#1E241F] leading-snug">
                      Luxe botanical skin repair elixir
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9.5px] font-mono text-white bg-[#1F4D3E] rounded-full px-2 py-0.5">High Demand</span>
                      <span className="text-[9.5px] font-mono text-[#5B5C50]">In stock</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Grid */}
                <div className="grid grid-cols-3 gap-0 rounded-xl border border-[#E3DCC8] overflow-hidden">
                  <div className="p-3 bg-[#FAF7EF] text-center">
                    <div className="text-[10px] text-[#7C7D70] uppercase tracking-wider mb-1 font-medium">Customer Pays</div>
                    <div className="font-mono text-[14px] font-semibold text-[#1E241F]">PKR 2,500</div>
                  </div>
                  <div className="p-3 bg-[#FAF7EF] border-x border-[#E3DCC8] text-center">
                    <div className="text-[10px] text-[#7C7D70] uppercase tracking-wider mb-1 font-medium">Your Cost</div>
                    <div className="font-mono text-[14px] font-semibold text-[#1F4D3E]">PKR 2,000</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#FBF7ED] to-[#F5EDD8] text-center">
                    <div className="text-[10px] text-[#7C7D70] uppercase tracking-wider mb-1 font-medium">Your Profit</div>
                    <div className="font-mono text-[14px] font-bold text-[#B8862E]">+PKR 500</div>
                  </div>
                </div>

                {/* Visual margin bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-[#7C7D70]">
                    <span>Profit Margin</span>
                    <span className="text-[#B8862E] font-semibold">+25% Net Gain</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1ECDD] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1F4D3E] to-[#2D6A56]" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              {/* Second product teaser */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3DCC8] bg-gradient-to-r from-[#F1ECDD] to-[#FAF7EF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E3DCC8] overflow-hidden shadow-2xs">
                    <img
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=100&q=80"
                      alt="ANC Earbuds"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-[#1E241F]">Quantum sound ANC earbuds</span>
                </div>
                <span className="font-mono text-[11.5px] font-bold text-[#B8862E] bg-[#B8862E]/10 rounded-full px-2.5 py-0.5">+PKR 1,000 Profit</span>
              </div>

              {/* Bottom accent strip */}
              <div className="h-1 bg-gradient-to-r from-[#1F4D3E] via-[#B8862E] to-[#1F4D3E]" />
            </div>
          </div>

        </div>
      </header>

      {/* 2. SIMPLE 3-STEP "HOW IT WORKS" (EASY TO UNDERSTAND) */}
      <section className="px-6 sm:px-8 py-16 bg-[#F1ECDD] border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-10">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Simple 3-Step Process
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]">
              How DreamToAchievers Works
            </h2>
            <p className="text-[#5B5C50] text-xs sm:text-sm">
              Anyone in Pakistan can start an online resale business in 3 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 01 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs hover:border-[#1F4D3E]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-base">
                1
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[#1E241F]">
                  Pick Wholesale Products
                </h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed">
                  Browse 100+ verified skincare formulas, cosmetics, and electronics at factory-direct wholesale pricing.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-mono text-[#1F4D3E] font-medium flex items-center gap-1.5">
                <CheckCircle size={14} weight="bold" />
                <span>Zero advance bulk stock cost</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs hover:border-[#1F4D3E]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-base">
                2
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[#1E241F]">
                  Share &amp; Take Orders
                </h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed">
                  Post products on WhatsApp, TikTok, Instagram, or Facebook. Sell to customers at recommended retail prices.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-mono text-[#1F4D3E] font-medium flex items-center gap-1.5">
                <CheckCircle size={14} weight="bold" />
                <span>Free marketing video copy &amp; images</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs hover:border-[#1F4D3E]/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-base">
                3
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[#1E241F]">
                  We Ship &amp; You Get Paid
                </h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed">
                  We pack and deliver the parcel with Cash on Delivery (COD) across 150+ cities. You receive your profit directly.
                </p>
              </div>
              <div className="pt-2 text-[11px] font-mono text-[#1F4D3E] font-medium flex items-center gap-1.5">
                <CheckCircle size={14} weight="bold" />
                <span>Automated rider COD dispatch</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. PARTNER LEVELS & REWARDS (CLEAR & MOTIVATING) */}
      <section className="px-6 sm:px-8 py-16 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-8">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Partner Growth Milestones
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]">
              Sell More, Earn Cash Bonuses
            </h2>
            <p className="text-[#5B5C50] text-xs sm:text-sm">
              As your personal sales and reseller referrals grow, unlock direct cash bonuses up to PKR 10,000.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Level 01 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-2xs hover:border-[#1F4D3E]/30 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase font-semibold text-[#1F4D3E] bg-[#FAF7EF] px-2 py-0.5 rounded border border-[#E3DCC8]">
                    Level 01
                  </span>
                  <span className="text-[10px] text-[#7C7D70]">Starter</span>
                </div>
                <div className="text-xl font-bold font-serif text-[#B8862E]">
                  +PKR 2,000
                </div>
                <div className="text-[11.5px] text-[#5B5C50]">Cash bonus reward</div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8] text-xs">
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Product Sales:</span>
                  <strong className="text-[#1E241F]">10 units</strong>
                </div>
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Team Referrals:</span>
                  <strong className="text-[#1E241F]">20 members</strong>
                </div>
              </div>
            </div>

            {/* Level 02 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-2xs hover:border-[#1F4D3E]/30 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase font-semibold text-[#1F4D3E] bg-[#FAF7EF] px-2 py-0.5 rounded border border-[#E3DCC8]">
                    Level 02
                  </span>
                  <span className="text-[10px] text-[#7C7D70]">Growth</span>
                </div>
                <div className="text-xl font-bold font-serif text-[#B8862E]">
                  +PKR 4,000
                </div>
                <div className="text-[11.5px] text-[#5B5C50]">Cash bonus reward</div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8] text-xs">
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Product Sales:</span>
                  <strong className="text-[#1E241F]">25 units</strong>
                </div>
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Team Referrals:</span>
                  <strong className="text-[#1E241F]">45 members</strong>
                </div>
              </div>
            </div>

            {/* Level 03 */}
            <div className="p-5 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-2xs hover:border-[#1F4D3E]/30 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase font-semibold text-[#1F4D3E] bg-[#FAF7EF] px-2 py-0.5 rounded border border-[#E3DCC8]">
                    Level 03
                  </span>
                  <span className="text-[10px] text-[#7C7D70]">Regional</span>
                </div>
                <div className="text-xl font-bold font-serif text-[#B8862E]">
                  +PKR 6,000
                </div>
                <div className="text-[11.5px] text-[#5B5C50]">Cash bonus reward</div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8] text-xs">
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Product Sales:</span>
                  <strong className="text-[#1E241F]">35 units</strong>
                </div>
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Team Referrals:</span>
                  <strong className="text-[#1E241F]">60 members</strong>
                </div>
              </div>
            </div>

            {/* Level 04 */}
            <div className="p-5 rounded-2xl bg-white border border-[#B8862E]/40 space-y-4 shadow-xs hover:border-[#B8862E] transition-all flex flex-col justify-between bg-gradient-to-b from-white to-[#FBF7ED]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase font-semibold text-white bg-[#1F4D3E] px-2 py-0.5 rounded">
                    Level 04 ★
                  </span>
                  <span className="text-[10px] text-[#B8862E] font-semibold">Top Tier</span>
                </div>
                <div className="text-xl font-bold font-serif text-[#1F4D3E]">
                  +PKR 10,000
                </div>
                <div className="text-[11.5px] text-[#5B5C50]">Cash bonus reward</div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8] text-xs">
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Product Sales:</span>
                  <strong className="text-[#1E241F]">100 units</strong>
                </div>
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Team Referrals:</span>
                  <strong className="text-[#1E241F]">200 members</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FEATURED PRODUCTS — 3D DEPTH CAROUSEL */}
      <section className="px-6 sm:px-8 py-16 bg-[#F1ECDD] border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Featured catalog
            </div>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="top bottom-=10%"
              scrollEnd="bottom center"
              stagger={0.02}
              containerClassName="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]"
            >
              Products your customers already want
            </ScrollFloat>
            <p className="text-[#5B5C50] text-sm sm:text-base max-w-[520px] mx-auto">
              High-demand consumer goods with verified wholesale pricing and transparent margins on every unit.
            </p>
          </div>

          <div style={{ height: '460px', position: 'relative' }}>
            <DepthCarousel
              items={SEED_PRODUCTS.map((p) => ({
                image: p.imageUrl,
                alt: p.name,
              }))}
              cardWidth={280}
              cardHeight={360}
              radius={16}
              tint="#1E241F"
              depth={180}
              spread={80}
              tilt={18}
              tiltDirection="right"
              perspective={1200}
              visibleCards={4}
              falloff={0.22}
              blur={5}
              duration={650}
              ease="power3.out"
              autoplay
              autoplayDelay={3500}
              loop
              showControls
              showIndicators
            />
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button variant="outline" size="md" className="font-medium text-xs">
                View full wholesale catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MARGIN ESTIMATOR CALCULATOR */}
      <section className="px-6 sm:px-8 py-16 bg-[#F1ECDD] border-b border-[#E3DCC8]">
        <div className="max-w-[800px] mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#E3DCC8] shadow-xs space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Profit Calculator
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F]">
              Estimate Your Monthly Profit
            </h3>
            <p className="text-xs sm:text-sm text-[#5B5C50]">
              Drag the slider to see how much you can earn selling products in your spare time.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5B5C50]">Products sold per month:</span>
              <span className="font-bold text-[#1E241F] text-sm font-mono bg-[#FAF7EF] px-2.5 py-1 rounded-md border border-[#E3DCC8]">
                {calculatorQuantity} Units / Month
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={1}
              value={calculatorQuantity}
              onChange={(e) => setCalculatorQuantity(Number(e.target.value))}
              className="w-full accent-[#1F4D3E] cursor-pointer h-2 bg-[#F1ECDD] rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-[#7C7D70]">
              <span>5 units (Part-time)</span>
              <span>75 units</span>
              <span>150+ units (Full-time)</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs text-[#5B5C50] block">Estimated Take-Home Profit:</span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#B8862E]">
                PKR {totalEarnings.toLocaleString()}
              </span>
              <span className="text-[10.5px] text-[#7C7D70] block mt-0.5">Based on average PKR 650 profit per unit</span>
            </div>
            <Link to="/signup">
              <Button variant="primary" size="md" className="text-xs font-medium shrink-0">
                Start Selling Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOUNDER PROFILE & SERVICES */}
      <OwnerProfile />

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <FAQSection />

      {/* 7. FINAL CONVERSION CTA WITH STRANDS BACKGROUND */}
      <section className="px-6 sm:px-8 py-20">
        <div className="max-w-[1180px] mx-auto rounded-2xl bg-[#1F4D3E] text-white text-center shadow-lg relative overflow-hidden" style={{ minHeight: '340px' }}>
          {/* Ambient WebGL Strands — distinct flowing lines, NOT a blob */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.55 }}>
            <Strands
              colors={['#52B788', '#D4A043', '#7CCFA8', '#2D6A56']}
              count={6}
              speed={0.3}
              amplitude={1.2}
              waviness={1.4}
              thickness={0.5}
              glow={1.4}
              taper={1.8}
              spread={1.5}
              intensity={0.5}
              saturation={1.8}
              opacity={1}
              scale={1.0}
            />
          </div>

          {/* Foreground Content — always fully visible */}
          <div className="relative z-10 p-10 sm:p-14 space-y-5 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-white leading-tight max-w-xl mx-auto drop-shadow-lg">
              Ready to distribute verified wholesale goods?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 max-w-lg mx-auto leading-relaxed drop-shadow-sm">
              Join hundreds of active distributors in Pakistan. Unlock wholesale pricing, direct margins, and milestone cash rewards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              <Link to="/signup">
                <Button variant="outline" size="lg" className="bg-white text-[#1F4D3E] hover:bg-emerald-50 border-white font-medium shadow-md">
                  Apply for Partner Access
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="ghost" size="lg" className="text-white hover:bg-[#153A2E]/80 border-white/25 font-medium">
                  Browse Full Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

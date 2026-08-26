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
      
      {/* 1. EDITORIAL HERO SECTION */}
      <header className="px-6 sm:px-8 pt-16 pb-14 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="eyebrow">
              <ShieldCheck size={14} weight="bold" />
              <span>Verified B2B wholesale network</span>
            </div>

            <h1 className="font-serif font-normal text-4xl sm:text-5xl lg:text-[54px] tracking-tight leading-[1.08] text-[#1E241F]">
              Source better.<br />
              Sell smarter.<br />
              Grow <em className="italic text-[#1F4D3E] font-medium">your</em> distribution business.
            </h1>

            <p className="text-base text-[#5B5C50] max-w-[490px] leading-relaxed">
              Access verified wholesale pricing on high-demand consumer goods, sell at suggested retail, and keep the full margin on every unit — with transparent partner-level rewards as your network grows.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link to="/products">
                <Button variant="primary" size="md" className="font-medium" iconRight={<ArrowRight size={14} />}>
                  Explore wholesale catalog
                </Button>
              </Link>
              <Link to="/ranks">
                <Button variant="outline" size="md" className="font-medium">
                  See partner rewards
                </Button>
              </Link>
            </div>

            {/* Credibility Stats Strip */}
            <div className="pt-6 border-t border-[#E3DCC8] flex flex-wrap gap-8 sm:gap-12">
              <div>
                <div className="text-xs text-[#5B5C50] font-sans">Verified SKUs</div>
                <div className="font-serif text-2xl font-medium text-[#1E241F] mt-0.5">100+</div>
              </div>
              <div>
                <div className="text-xs text-[#5B5C50] font-sans">Unit margin</div>
                <div className="font-serif text-2xl font-medium text-[#1E241F] mt-0.5">PKR 500–1,300</div>
              </div>
              <div>
                <div className="text-xs text-[#5B5C50] font-sans">Milestone bonus</div>
                <div className="font-serif text-2xl font-medium text-[#1E241F] mt-0.5">Up to PKR 10,000</div>
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
                    Wholesale margin sheet
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
                  {/* Large product thumbnail */}
                  <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-gradient-to-br from-[#EFE2C4] to-[#F1ECDD] border border-[#E3DCC8] shrink-0 shadow-sm">
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
                    <div className="font-mono text-[10px] text-[#7C7D70] uppercase tracking-[0.08em] mb-1">
                      DTA-SKN-001 · Skincare
                    </div>
                    <div className="text-[15px] font-semibold text-[#1E241F] leading-snug">
                      Luxe botanical skin repair elixir
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-mono text-white bg-[#1F4D3E] rounded-full px-2 py-0.5">Best seller</span>
                      <span className="text-[10px] font-mono text-[#5B5C50]">In stock</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Grid */}
                <div className="grid grid-cols-3 gap-0 rounded-xl border border-[#E3DCC8] overflow-hidden">
                  <div className="p-3.5 bg-[#FAF7EF]">
                    <div className="text-[10px] text-[#7C7D70] uppercase tracking-wider mb-1.5 font-medium">Retail</div>
                    <div className="font-mono text-[15px] font-semibold text-[#1E241F]">PKR 2,500</div>
                  </div>
                  <div className="p-3.5 bg-[#FAF7EF] border-x border-[#E3DCC8]">
                    <div className="text-[10px] text-[#7C7D70] uppercase tracking-wider mb-1.5 font-medium">Your cost</div>
                    <div className="font-mono text-[15px] font-semibold text-[#1F4D3E]">PKR 2,000</div>
                  </div>
                  <div className="p-3.5 bg-gradient-to-br from-[#FBF7ED] to-[#F5EDD8]">
                    <div className="text-[10px] text-[#7C7D70] uppercase tracking-wider mb-1.5 font-medium">You keep</div>
                    <div className="font-mono text-[15px] font-bold text-[#B8862E]">+PKR 500</div>
                  </div>
                </div>

                {/* Visual margin bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7C7D70]">
                    <span>Margin breakdown</span>
                    <span className="text-[#B8862E] font-semibold">20% margin</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F1ECDD] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1F4D3E] to-[#2D6A56]" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#7C7D70]">
                    <span>Partner cost · 80%</span>
                    <span className="text-[#B8862E]">Profit · 20%</span>
                  </div>
                </div>
              </div>

              {/* Second product teaser */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#E3DCC8] bg-gradient-to-r from-[#F1ECDD] to-[#FAF7EF]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E3DCC8] overflow-hidden shadow-xs">
                    <img
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=100&q=80"
                      alt="ANC Earbuds"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-[#1E241F]">Quantum sound ANC earbuds</span>
                </div>
                <span className="font-mono text-[12px] font-bold text-[#B8862E] bg-[#B8862E]/8 rounded-full px-2.5 py-0.5">+PKR 1,000</span>
              </div>

              {/* Bottom accent strip */}
              <div className="h-1 bg-gradient-to-r from-[#1F4D3E] via-[#B8862E] to-[#1F4D3E]" />
            </div>
          </div>

        </div>
      </header>

      {/* 2. NETWORK CAPABILITIES SECTION */}
      <section className="px-6 sm:px-8 py-16 bg-[#F1ECDD] border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-10">
          
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Network capabilities
            </div>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="top bottom-=10%"
              scrollEnd="bottom center"
              stagger={0.02}
              containerClassName="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]"
            >
              Built for people moving real inventory
            </ScrollFloat>
            <p className="text-[#5B5C50] text-sm sm:text-base max-w-[540px]">
              Every figure a partner sees is pulled from verified catalog data — not a projection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Card 01 */}
            <div className="p-6 rounded-xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-medium text-sm">
                01
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Nationwide logistics &amp; COD dispatch
              </h3>
              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                Centralized order routing with delivery coverage across 150+ cities. Couriers handle cash on delivery with status updates on every order.
              </p>
              <div className="pt-3 border-t border-[#E3DCC8] text-xs text-[#5B5C50]">
                <strong className="text-[#1E241F] font-semibold">99.4%</strong> fulfillment accuracy
              </div>
            </div>

            {/* Card 02 */}
            <div className="p-6 rounded-xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-medium text-sm">
                02
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Wholesale price access
              </h3>
              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                Direct factory and verified distributor rates, with a healthy, consistent margin on every unit sold.
              </p>
              <div className="pt-3 border-t border-[#E3DCC8] text-xs text-[#5B5C50]">
                Margins from <strong className="text-[#1E241F] font-semibold">PKR 500 to 1,300</strong> per unit
              </div>
            </div>

            {/* Card 03 */}
            <div className="p-6 rounded-xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-medium text-sm">
                03
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Verified catalog inventory
              </h3>
              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                A curated selection of high-demand skincare formulas and lifestyle electronics, with continuous stock availability checks.
              </p>
              <div className="pt-3 border-t border-[#E3DCC8] text-xs text-[#5B5C50]">
                Restocked and <strong className="text-[#1E241F] font-semibold">quality-checked</strong> in batches
              </div>
            </div>

            {/* Card 04 */}
            <div className="p-6 rounded-xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-medium text-sm">
                04
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Partner network tracking
              </h3>
              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                Every partner gets a unique referral code that permanently attributes their team's sign-ups, visible on one shared dashboard.
              </p>
              <div className="pt-3 border-t border-[#E3DCC8] text-xs text-[#5B5C50]">
                <strong className="text-[#1E241F] font-semibold">Transparent</strong> attribution, no manual reconciliation
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. PARTNER LEVELS SECTION */}
      <section className="px-6 sm:px-8 py-16 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-10">
          
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Partner levels
            </div>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="top bottom-=10%"
              scrollEnd="bottom center"
              stagger={0.02}
              containerClassName="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]"
            >
              Grow at your own pace
            </ScrollFloat>
            <p className="text-[#5B5C50] text-sm sm:text-base max-w-[540px]">
              Each level combines personal sales with team growth. Bonuses are cash, paid on qualification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E3DCC8] rounded-xl overflow-hidden bg-white shadow-xs divide-y sm:divide-y-0 sm:divide-x divide-[#E3DCC8]">
            
            {/* Level 01 */}
            <div className="p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-[#7C7D70] mb-2">Level 01</div>
                <h3 className="font-serif text-lg font-medium text-[#1E241F] mb-1">Starter partner</h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed min-h-[48px]">
                  Build your customer base and place your first team referrals.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8]">
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Product sales</span>
                  <strong className="font-mono font-medium text-[#1E241F]">10 units</strong>
                </div>
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Team size</span>
                  <strong className="font-mono font-medium text-[#1E241F]">20 members</strong>
                </div>
                <div className="pt-2 border-t border-[#E3DCC8] flex justify-between items-center text-xs font-medium">
                  <span className="text-[#1E241F]">Cash bonus</span>
                  <span className="font-mono font-semibold text-[#B8862E]">PKR 2,000</span>
                </div>
              </div>
            </div>

            {/* Level 02 */}
            <div className="p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-[#7C7D70] mb-2">Level 02</div>
                <h3 className="font-serif text-lg font-medium text-[#1E241F] mb-1">Growth partner</h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed min-h-[48px]">
                  Scale wholesale volume and grow an active distributor team.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8]">
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Product sales</span>
                  <strong className="font-mono font-medium text-[#1E241F]">25 units</strong>
                </div>
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Team size</span>
                  <strong className="font-mono font-medium text-[#1E241F]">45 members</strong>
                </div>
                <div className="pt-2 border-t border-[#E3DCC8] flex justify-between items-center text-xs font-medium">
                  <span className="text-[#1E241F]">Cash bonus</span>
                  <span className="font-mono font-semibold text-[#B8862E]">PKR 4,000</span>
                </div>
              </div>
            </div>

            {/* Level 03 */}
            <div className="p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-[#7C7D70] mb-2">Level 03</div>
                <h3 className="font-serif text-lg font-medium text-[#1E241F] mb-1">Regional partner</h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed min-h-[48px]">
                  Manage multi-channel resale and mentor a regional team.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8]">
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Product sales</span>
                  <strong className="font-mono font-medium text-[#1E241F]">35 units</strong>
                </div>
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Team size</span>
                  <strong className="font-mono font-medium text-[#1E241F]">60 members</strong>
                </div>
                <div className="pt-2 border-t border-[#E3DCC8] flex justify-between items-center text-xs font-medium">
                  <span className="text-[#1E241F]">Cash bonus</span>
                  <span className="font-mono font-semibold text-[#B8862E]">PKR 6,000</span>
                </div>
              </div>
            </div>

            {/* Level 04 */}
            <div className="p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-[#7C7D70] mb-2">Level 04</div>
                <h3 className="font-serif text-lg font-medium text-[#1E241F] mb-1">National partner</h3>
                <p className="text-xs text-[#5B5C50] leading-relaxed min-h-[48px]">
                  High-volume nationwide distribution with top-tier revenue share.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E3DCC8]">
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Product sales</span>
                  <strong className="font-mono font-medium text-[#1E241F]">100 units</strong>
                </div>
                <div className="flex justify-between text-xs text-[#5B5C50]">
                  <span>Team size</span>
                  <strong className="font-mono font-medium text-[#1E241F]">200 members</strong>
                </div>
                <div className="pt-2 border-t border-[#E3DCC8] flex justify-between items-center text-xs font-medium">
                  <span className="text-[#1E241F]">Cash bonus</span>
                  <span className="font-mono font-semibold text-[#B8862E]">PKR 10,000</span>
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
        <div className="max-w-[800px] mx-auto p-8 rounded-2xl bg-white border border-[#E3DCC8] shadow-sm space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              Margin Calculator
            </div>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="top bottom-=10%"
              scrollEnd="bottom center"
              stagger={0.02}
              as="h3"
              containerClassName="font-serif text-2xl font-medium text-[#1E241F]"
            >
              Estimate Your Monthly Partner Profit
            </ScrollFloat>
            <p className="text-xs sm:text-sm text-[#5B5C50]">
              Adjust monthly unit sales volume to calculate gross distributor profit margin.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#5B5C50]">Monthly Volume:</span>
              <span className="font-bold text-[#1E241F] text-sm">{calculatorQuantity} Units / Month</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={1}
              value={calculatorQuantity}
              onChange={(e) => setCalculatorQuantity(Number(e.target.value))}
              className="w-full accent-[#1F4D3E] cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#5B5C50] block">Estimated Gross Monthly Margin:</span>
              <span className="font-mono text-2xl font-bold text-[#B8862E]">
                +PKR {totalEarnings.toLocaleString()}
              </span>
            </div>
            <Link to="/signup">
              <Button variant="primary" size="md" className="text-xs font-medium">
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

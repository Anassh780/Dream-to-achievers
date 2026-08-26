import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DepthCarousel } from '@/components/ui/DepthCarousel';
import { OwnerProfile } from '@/components/sections/OwnerProfile';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { Strands } from '@/components/ui/Strands';
import { SEED_PRODUCTS } from '@/config/products';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

export const Home: React.FC = () => {
  return (
    <div className="w-full bg-[#FAF7EF] text-[#1E241F] font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. CLEAN HERO SECTION */}
      <header className="px-6 sm:px-8 pt-16 sm:pt-20 pb-16 sm:pb-20 border-b border-[#E3DCC8] text-center">
        <div className="max-w-[860px] mx-auto space-y-7">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
            <ShieldCheck size={14} weight="bold" />
            <span>Pakistan's Verified Wholesale Reseller Network</span>
          </div>

          <h1 className="font-serif font-normal text-3xl sm:text-5xl lg:text-[54px] tracking-tight leading-[1.12] text-[#1E241F]">
            Start your reselling business with <em className="italic text-[#1F4D3E] font-medium">zero upfront inventory</em>.
          </h1>

          <p className="text-sm sm:text-base text-[#5B5C50] max-w-[620px] mx-auto leading-relaxed">
            Source verified products at direct wholesale rates, set your own selling price, and keep 100% of your profit margin. We deliver nationwide with Cash on Delivery (COD).
          </p>

          {/* Quick Benefits Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-[#1E241F] font-medium max-w-2xl mx-auto">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#E3DCC8] shadow-2xs">
              <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
              <span>Zero advance stock purchase</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#E3DCC8] shadow-2xs">
              <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
              <span>COD in 150+ cities</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#E3DCC8] shadow-2xs">
              <CheckCircle size={15} weight="bold" className="text-[#1F4D3E] shrink-0" />
              <span>PKR 500 – 1,300 profit per unit</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <Link to="/products">
              <Button variant="primary" size="lg" className="font-medium text-xs sm:text-sm shadow-sm" iconRight={<ArrowRight size={14} />}>
                Browse Wholesale Catalog
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg" className="font-medium text-xs sm:text-sm">
                Join as Partner (Free)
              </Button>
            </Link>
          </div>

        </div>
      </header>

      {/* 2. FEATURED PRODUCTS — 3D DEPTH CAROUSEL */}
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

      {/* 3. FOUNDER PROFILE & SERVICES (WITH 3D FLIP CARDS) */}
      <OwnerProfile />

      {/* 4. FINAL CONVERSION CTA WITH STRANDS BACKGROUND */}
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
export default Home;

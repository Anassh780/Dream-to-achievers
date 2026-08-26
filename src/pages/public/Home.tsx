import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  ShieldCheck,
  Package,
  TrendUp,
  Wallet,
} from '@phosphor-icons/react';

export const Home: React.FC = () => {
  return (
    <div className="w-full bg-[#FAF7EF] text-[#1E241F] font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. CLEAN & PURPOSE-FOCUSED HERO */}
      <header className="px-6 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24 border-b border-[#E3DCC8] text-center">
        <div className="max-w-[860px] mx-auto space-y-7">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
            <ShieldCheck size={14} weight="bold" />
            <span>Pakistan's Wholesale Reseller &amp; Partner Platform</span>
          </div>

          <h1 className="font-serif font-normal text-3xl sm:text-5xl lg:text-[54px] tracking-tight leading-[1.12] text-[#1E241F]">
            Sell verified products.<br />
            Earn <em className="italic text-[#1F4D3E] font-medium">guaranteed profit</em> on your dashboard.
          </h1>

          <p className="text-sm sm:text-base text-[#5B5C50] max-w-[580px] mx-auto leading-relaxed">
            Create an account, choose high-demand wholesale products, sell to your customers, and withdraw your profit margins and cash bonuses directly from your dashboard.
          </p>

          {/* 3 Core Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <Package size={16} className="text-[#1F4D3E]" weight="bold" />
                <span>Zero Inventory Buy-in</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">Sell products without buying stock in advance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <TrendUp size={16} className="text-[#1F4D3E]" weight="bold" />
                <span>PKR 500–1,300 Profit</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">Fixed, transparent profit margin on every sale.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <Wallet size={16} className="text-[#1F4D3E]" weight="bold" />
                <span>Direct Dashboard Payout</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">We handle COD delivery and credit your profit.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="font-medium text-xs sm:text-sm shadow-sm" iconRight={<ArrowRight size={14} />}>
                Create Partner Account (Free)
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="font-medium text-xs sm:text-sm">
                View Wholesale Products
              </Button>
            </Link>
          </div>

        </div>
      </header>

      {/* 2. SIMPLE 3-STEP PROCESS */}
      <section className="px-6 sm:px-8 py-16 sm:py-20 border-b border-[#E3DCC8]">
        <div className="max-w-[1100px] mx-auto space-y-10">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
              How You Make Money
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F]">
              3 Simple Steps to Start Earning
            </h2>
            <p className="text-[#5B5C50] text-xs sm:text-sm">
              No technical skills needed. Sell products from your phone and collect profits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Create Free Account
              </h3>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Sign up in 30 seconds. Get your personal reseller dashboard and access wholesale inventory.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Share &amp; Take Orders
              </h3>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Post product images and videos on WhatsApp, TikTok, or Instagram. Record your customer orders.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3DCC8] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-[#1E241F]">
                Get Paid on Dashboard
              </h3>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                We handle Cash on Delivery (COD) across Pakistan. Your profit margin is credited directly to your dashboard wallet.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. FINAL CONVERSION CTA */}
      <section className="px-6 sm:px-8 py-16 sm:py-20">
        <div className="max-w-[1000px] mx-auto rounded-3xl bg-[#1F4D3E] text-white text-center p-10 sm:p-14 space-y-6 shadow-lg">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white leading-tight max-w-xl mx-auto">
            Ready to start making money with verified products?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-md mx-auto leading-relaxed">
            Join hundreds of Pakistani resellers. Create your account today and earn your first profit margin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/signup">
              <Button variant="outline" size="lg" className="bg-white text-[#1F4D3E] hover:bg-emerald-50 border-white font-medium shadow-md">
                Create Free Partner Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg" className="text-white hover:bg-[#153A2E]/80 border-white/25 font-medium">
                Log In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

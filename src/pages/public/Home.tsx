import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SEED_PRODUCTS } from '@/config/products';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Package,
  TrendUp,
  Wallet,
  Users,
} from '@phosphor-icons/react';

export const Home: React.FC = () => {
  return (
    <div className="w-full bg-[#FAF7EF] text-[#1E241F] font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. CLEAN & PURPOSE-FOCUSED HERO */}
      <header className="px-6 sm:px-8 pt-14 sm:pt-20 pb-14 sm:pb-20 border-b border-[#E3DCC8] text-center">
        <div className="max-w-[860px] mx-auto space-y-7">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
            <ShieldCheck size={14} weight="bold" />
            <span>Pakistan's Wholesale Reseller &amp; Partner Platform</span>
          </div>

          <h1 className="font-serif font-normal text-3xl sm:text-5xl lg:text-[52px] tracking-tight leading-[1.12] text-[#1E241F]">
            Sell verified products.<br />
            Earn <em className="italic text-[#1F4D3E] font-medium">guaranteed profit</em> on your dashboard.
          </h1>

          <p className="text-sm sm:text-base text-[#5B5C50] max-w-[580px] mx-auto leading-relaxed">
            Create an account, choose high-demand wholesale products, sell to your customers, and withdraw your profit margins and cash bonuses directly from your dashboard.
          </p>

          {/* 3 Core Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <Package size={16} className="text-[#1F4D3E]" weight="bold" />
                <span>Zero Inventory Buy-in</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">Sell products without buying stock in advance.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <TrendUp size={16} className="text-[#1F4D3E]" weight="bold" />
                <span>PKR 500–1,300 Profit</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">Fixed, transparent profit margin on every sale.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
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

      {/* 2. REAL WHOLESALE PRODUCTS WITH DIRECT PROFIT MARGINS */}
      <section className="px-6 sm:px-8 py-16 bg-[#F1ECDD] border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
                Available Wholesale Catalog
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F]">
                Products Ready to Sell
              </h2>
              <p className="text-xs text-[#5B5C50]">
                All products in stock with verified profit margins per unit.
              </p>
            </div>

            <Link to="/products">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                View All Products
              </Button>
            </Link>
          </div>

          {/* Clean 3-Column Product Grid with Clear Margins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEED_PRODUCTS.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="rounded-2xl bg-white border border-[#E3DCC8] p-4 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#1F4D3E]/40 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  {/* Product Image */}
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-[#FAF7EF] border border-[#E3DCC8] relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded bg-white/90 text-[#1F4D3E] border border-[#E3DCC8] backdrop-blur-xs">
                      {product.category}
                    </span>
                    <span className="absolute top-2.5 right-2.5 text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#1F4D3E] text-white shadow-xs">
                      +PKR {product.grossMargin.toLocaleString()} Profit
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#7C7D70] uppercase tracking-wide">
                      {product.sku}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-[#1E241F] leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price Comparison Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-xs">
                    <div>
                      <span className="text-[10px] text-[#7C7D70] block">Customer Retail</span>
                      <span className="font-mono font-semibold text-[#1E241F]">
                        PKR {product.retailPrice.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7C7D70] block">Your Wholesale Cost</span>
                      <span className="font-mono font-semibold text-[#1F4D3E]">
                        PKR {product.partnerPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sell Action Button */}
                <Link to={`/products/${product.slug}`} className="block w-full">
                  <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FAF7EF] hover:bg-[#1F4D3E] hover:text-white text-[#1F4D3E] text-xs font-semibold border border-[#E3DCC8] hover:border-[#1F4D3E] transition-colors cursor-pointer shadow-2xs group">
                    <span>Sell This Product (+PKR {product.grossMargin.toLocaleString()})</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. SIMPLE 3-STEP PROCESS */}
      <section className="px-6 sm:px-8 py-16 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto space-y-10">
          
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
              <div className="w-9 h-9 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-sm">
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
              <div className="w-9 h-9 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-sm">
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
              <div className="w-9 h-9 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-serif text-[#1F4D3E] font-bold text-sm">
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

      {/* 4. FINAL CONVERSION CTA */}
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

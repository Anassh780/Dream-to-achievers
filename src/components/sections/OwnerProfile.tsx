import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CardFlip } from '@/components/ui/CardFlip';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  image: string;
  summary: string;
  metric: string;
  deliverables: string[];
}

export const OwnerProfile: React.FC = () => {
  const siteConfig = useSiteSettings();

  const services: ServiceItem[] = [
    {
      id: 'srv-tiktok',
      title: 'TikTok Viral Automation',
      category: 'Organic Growth',
      image: '/images/tiktok-automation.webp',
      summary: 'High-velocity short-form content pipelines converting casual viewers into paying retail customers.',
      metric: '25M+ Views',
      deliverables: [
        'Hook scripting & audio matching',
        'Daily short-form video batch production',
        'Bio link conversion funnels',
      ],
    },
    {
      id: 'srv-smm',
      title: 'Social Media Distribution',
      category: 'Channel Management',
      image: '/images/smm.webp',
      summary: 'Multi-channel brand positioning across Instagram, Facebook, and WhatsApp community broadcasting.',
      metric: '98% Uplift',
      deliverables: [
        'Omnichannel content calendars',
        'Community engagement & DM sales triage',
        'Reseller influencer collaborations',
      ],
    },
    {
      id: 'srv-content',
      title: 'Commercial Content & Scripting',
      category: 'Creative Production',
      image: '/images/content-writing.webp',
      summary: 'Studio-grade product unboxings, cosmetic texture copy, and problem-solution ad creatives.',
      metric: '4.8x Conversion',
      deliverables: [
        'High-converting video scripts',
        'Urdu & English product copy',
        'Catalog sales data sheets',
      ],
    },
    {
      id: 'srv-ads',
      title: 'Performance Paid Ads',
      category: 'Paid Acquisition',
      image: '/images/paid-ads.webp',
      summary: 'Data-driven Meta and TikTok ad campaigns engineered with strict CAC bounds and scalable ROAS.',
      metric: '3.4x Target ROAS',
      deliverables: [
        'Creative hook testing matrix',
        'Lookalike & pixel event optimization',
        'Real-time cash flow & CPA monitoring',
      ],
    },
    {
      id: 'srv-graphic',
      title: 'Visual Assets & Catalog Design',
      category: 'Brand Identity',
      image: '/images/graphic-design.webp',
      summary: 'Factory-direct supplier presentation, premium packaging mockups, and wholesale banners.',
      metric: '100% Custom',
      deliverables: [
        'High-res product mockups',
        'Social media banner packages',
        'Digital brand guideline boards',
      ],
    },
    {
      id: 'srv-biz',
      title: 'Wholesale Sourcing & Strategy',
      category: 'Supply Chain',
      image: '/images/biz-management.webp',
      summary: '1-on-1 operational coaching for high-volume resellers aiming for Level 03 & Level 04 milestones.',
      metric: '99.4% SLA',
      deliverables: [
        'Supplier batch inspection ledgers',
        'Sub-distributor team structuring',
        'Nationwide COD logistics integration',
      ],
    },
  ];

  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Faria, I would like to connect regarding DreamToAchievers partner onboarding and wholesale collaboration.'
  )}`;

  return (
    <section id="founder" className="w-full py-16 sm:py-20 font-sans border-t border-[#E3DCC8] bg-[#FAF7EF]">
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 space-y-16">
        
        {/* 1. FOUNDER PROFILE & MESSAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Portrait Frame */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl p-3.5 bg-white border border-[#E3DCC8] shadow-xs space-y-3">
              <div className="rounded-xl overflow-hidden bg-[#FAF7EF] relative border border-[#E3DCC8]">
                <div className="aspect-[4/5] relative w-full overflow-hidden">
                  <img
                    src="/images/faria-imran.webp"
                    alt="Faria Imran — Founder & Executive Director"
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/faria-imran.jpg';
                    }}
                  />
                </div>

                <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-[#E3DCC8] flex items-center justify-between shadow-xs">
                  <div>
                    <p className="font-serif font-semibold text-[#1E241F] text-sm">Faria Imran</p>
                    <p className="text-[11px] text-[#5B5C50]">Founder &amp; Executive Director</p>
                  </div>
                  <span className="stamp">
                    Verified
                  </span>
                </div>
              </div>

              {/* Quick Trust Numbers */}
              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
                  <p className="text-lg font-semibold font-serif text-[#1E241F]">25M+</p>
                  <p className="text-[10px] text-[#5B5C50]">Audience Reach</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
                  <p className="text-lg font-semibold font-serif text-[#1F4D3E]">100%</p>
                  <p className="text-[10px] text-[#5B5C50]">COD Delivered</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clear, Friendly Mission Narrative */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
              <ShieldCheck size={13} weight="bold" />
              <span>Founder's Vision</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-medium text-[#1E241F] tracking-tight leading-snug">
                "We handle the stock, warehousing, and delivery — so you can focus on selling and earning."
              </h2>
              <p className="text-xs font-mono uppercase tracking-wider text-[#B8862E] font-medium">
                — Faria Imran, Founder &amp; Executive Director
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
              DreamToAchievers is built to make online selling simple and accessible for everyone in Pakistan. You don't need millions in capital or warehouse space. We provide high-demand products at wholesale prices, manage parcel delivery across 150+ cities, and pay your profits directly to you.
            </p>

            {/* 3 Clear Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
                <div className="font-semibold text-xs text-[#1E241F] flex items-center gap-1.5">
                  <CheckCircle size={14} weight="bold" className="text-[#1F4D3E]" />
                  <span>No Inventory Cost</span>
                </div>
                <p className="text-[11px] text-[#5B5C50]">Start without buying upfront bulk inventory.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
                <div className="font-semibold text-xs text-[#1E241F] flex items-center gap-1.5">
                  <CheckCircle size={14} weight="bold" className="text-[#1F4D3E]" />
                  <span>Nationwide COD</span>
                </div>
                <p className="text-[11px] text-[#5B5C50]">Couriers deliver and collect cash across Pakistan.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E3DCC8] space-y-1 shadow-2xs">
                <div className="font-semibold text-xs text-[#1E241F] flex items-center gap-1.5">
                  <CheckCircle size={14} weight="bold" className="text-[#1F4D3E]" />
                  <span>Direct Cash Bonuses</span>
                </div>
                <p className="text-[11px] text-[#5B5C50]">Earn milestone cash rewards up to PKR 10,000.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md" iconLeft={<WhatsappLogo size={16} />}>
                  Chat with Founder Desk
                </Button>
              </a>
              <Link to="/how-it-works">
                <Button variant="outline" size="md">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE 3D FLIP SERVICE CARDS */}
        <div className="space-y-8 pt-6 border-t border-[#E3DCC8]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="eyebrow">
                <ShieldCheck size={13} weight="bold" />
                <span>Partner Enablement Solutions</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
                Distribution &amp; Growth Services
              </h2>
              <p className="text-xs text-[#5B5C50] max-w-lg">
                Interactive capability suite. Hover or tap each card to flip and inspect operational deliverables.
              </p>
            </div>

            <Link to="/services">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                View All Ecosystem Services
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <CardFlip
                key={service.id}
                title={service.title}
                subtitle={service.summary}
                description={service.summary}
                features={service.deliverables}
                categoryNumber={service.category}
                metric={service.metric}
                impactBadge={service.metric}
                frontImage={service.image}
                whatsappUrl={whatsappUrl}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

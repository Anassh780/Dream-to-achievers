import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
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
        
        {/* 1. FOUNDER PROFILE & MISSION STATEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Authentic Portrait Frame */}
          <div className="lg:col-span-5">
            <div className="rounded-xl p-3 bg-white border border-[#E3DCC8] shadow-xs space-y-3.5">
              <div className="rounded-lg overflow-hidden bg-[#FAF7EF] relative border border-[#E3DCC8]">
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

                <div className="absolute bottom-3 inset-x-3 p-3 rounded-lg bg-white/95 backdrop-blur-md border border-[#E3DCC8] flex items-center justify-between shadow-xs">
                  <div>
                    <p className="font-display font-semibold text-[#1E241F] text-sm">Faria Imran</p>
                    <p className="text-[11px] text-[#5B5C50]">Founder &amp; Executive Director</p>
                  </div>
                  <span className="stamp">
                    Verified
                  </span>
                </div>
              </div>

              {/* Verified Metrics Counter */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
                  <p className="text-xl font-medium font-display text-[#1E241F]">25M+</p>
                  <p className="text-[10.5px] text-[#5B5C50] mt-0.5">Organic Impressions</p>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
                  <p className="text-xl font-medium font-display text-[#1F4D3E]">100%</p>
                  <p className="text-[10.5px] text-[#5B5C50] mt-0.5">Transparent Margins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Founder Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="eyebrow">
              <ShieldCheck size={13} weight="bold" />
              <span>Leadership &amp; Brand Story</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[38px] font-medium text-[#1E241F] tracking-tight leading-tight">
                "We built DreamToAchievers to give everyday distributors enterprise wholesale power."
              </h2>
              <p className="text-xs font-mono uppercase tracking-wider text-[#B8862E] font-medium">
                — Faria Imran, Founder &amp; Executive Director
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
              <p>
                As an entrepreneur and growth strategist, I recognized that traditional resale businesses in Pakistan struggle with inconsistent product quality, unreliable courier deliveries, and opaque pricing margins.
              </p>
              <p>
                DreamToAchievers bridges this gap by combining physical wholesale commerce with complete digital infrastructure. We handle product testing, warehousing, courier dispatch, and customer logistics — so our distributor partners can focus purely on marketing and generating profitable gross margins.
              </p>
            </div>

            {/* Core Values Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
                <span className="font-display font-medium text-xs text-[#1E241F] block">Zero Inventory Risk</span>
                <p className="text-[11px] text-[#5B5C50]">Distribute verified wholesale products without upfront bulk warehousing capital.</p>
              </div>
              <div className="p-3.5 rounded-lg bg-white border border-[#E3DCC8] space-y-1 shadow-xs">
                <span className="font-display font-medium text-xs text-[#1E241F] block">Guaranteed Milestone Bonuses</span>
                <p className="text-[11px] text-[#5B5C50]">Clear dual qualification milestones unlocking up to PKR 10,000 cash rewards.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md" iconLeft={<WhatsappLogo size={16} />}>
                  Direct WhatsApp Desk
                </Button>
              </a>
              <Link to="/how-it-works">
                <Button variant="outline" size="md">
                  Explore Operational Model
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. CLEAN EDITORIAL SERVICES GRID */}
        <div className="space-y-8 pt-6 border-t border-[#E3DCC8]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="eyebrow">
                <ShieldCheck size={13} weight="bold" />
                <span>Partner Enablement Solutions</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
                Distribution &amp; Growth Services
              </h2>
              <p className="text-xs text-[#5B5C50] max-w-lg">
                Complete growth and operational infrastructure designed to scale your independent distribution network.
              </p>
            </div>

            <Link to="/services">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                View All Ecosystem Services
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-xl bg-white border border-[#E3DCC8] p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#D2C8AF] transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF7EF] text-[#1F4D3E] border border-[#E3DCC8]">
                      {service.category}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[#B8862E] bg-[#EFE2C4] px-2 py-0.5 rounded">
                      {service.metric}
                    </span>
                  </div>

                  <div className="w-full h-32 rounded-lg overflow-hidden bg-[#FAF7EF] border border-[#E3DCC8]">
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src.endsWith('.webp')) {
                          target.src = target.src.replace('.webp', '.png');
                        } else {
                          target.src = '/images/logo.png';
                        }
                      }}
                    />
                  </div>

                  <div>
                    <h3 className="font-display font-medium text-base text-[#1E241F] mb-1">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#5B5C50] leading-relaxed">
                      {service.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E3DCC8]">
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px] text-[#5B5C50]">
                        <CheckCircle size={13} weight="bold" className="text-[#1F4D3E] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E3DCC8] flex items-center justify-between text-xs">
                  <span className="text-[10.5px] font-mono text-[#5B5C50]">Verified Service</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-[#1F4D3E] font-medium hover:underline flex items-center gap-1"
                  >
                    Inquire via Desk &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

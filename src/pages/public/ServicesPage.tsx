import React from 'react';
import { BentoWork } from '@/components/sections/BentoWork';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, CheckCircle, WhatsappLogo } from '@phosphor-icons/react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const ServicesPage: React.FC = () => {
  const siteConfig = useSiteSettings();
  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Dream to Achievers team, I would like to inquire about partner enablement services.'
  )}`;

  const services = [
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

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      {/* 1. Page Header */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-4">
          <div className="eyebrow">
            <ShieldCheck size={13} weight="bold" />
            <span>Growth &amp; Distribution Ecosystem</span>
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            Ecosystem &amp; Partner Services
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-lg mx-auto">
            In addition to our physical product catalog, DreamToAchievers equips partners with logistics support, verified inventory, and partner network growth tools.
          </p>
        </div>
      </section>

      {/* 2. Services Bento Grid & Solutions Suite */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-16">
        <BentoWork showHeader={true} />

        {/* 3. Detailed Services Cards with Images */}
        <section className="space-y-8 pt-6 border-t border-[#E3DCC8]">
          <div className="space-y-1">
            <div className="section-kicker">Execution Solutions</div>
            <h2 className="font-display font-medium text-2xl sm:text-3xl text-[#1E241F]">
              Partner Growth Modules
            </h2>
            <p className="text-xs sm:text-sm text-[#5B5C50]">
              Operational services to expand your distribution volume and customer base.
            </p>
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
                  <span className="text-[10.5px] font-mono text-[#5B5C50]">Active Module</span>
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
        </section>

        {/* 4. CTA */}
        <section className="p-8 sm:p-12 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
          <h3 className="font-display text-2xl font-medium text-[#1E241F]">
            Have questions about specific services?
          </h3>
          <p className="text-xs sm:text-sm text-[#5B5C50]">
            Connect with our partner growth team to learn how to integrate these solutions into your distribution pipeline.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="primary" size="md" className="font-medium" iconRight={<ArrowRight size={13} />}>
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

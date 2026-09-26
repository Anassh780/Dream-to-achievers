import React from 'react';
import { BentoWork } from '@/components/sections/BentoWork';
import { Button } from '@/components/ui/Button';
import { CardFlip } from '@/components/ui/CardFlip';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { ArrowRight, ShieldCheck } from '@phosphor-icons/react';
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="B2B Distribution & Growth Services | Dream to Achievers"
        description="Explore B2B distribution, wholesale logistics, and partner growth enablement services from Dream to Achievers. Helping resellers scale across Pakistan."
        canonicalPath="/services"
        ogType="website"
      />

      {/* 1. Page Header */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09] relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9C08A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1180px] mx-auto max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <ShieldCheck size={13} weight="bold" />
            <span>Growth &amp; Distribution Ecosystem</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.1]">
            Ecosystem &amp; Partner Services
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed max-w-lg mx-auto">
            In addition to our physical product catalog, Dream to Achievers equips partners with logistics support, verified inventory, and partner network growth tools.
          </p>
        </div>
      </section>

      {/* 2. Services Bento Grid & Solutions Suite */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-16">
        <BentoWork showHeader={true} />

        {/* 3. Detailed Services Cards with Images */}
        <section className="space-y-8 pt-6 border-t border-white/10">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#D9C08A] font-semibold">Execution Solutions</div>
            <h2 className="font-serif font-normal text-2xl sm:text-3xl text-[#F4F7F5]">
              Partner Growth Modules
            </h2>
            <p className="text-xs sm:text-sm text-[#9EABA2]">
              Operational services to expand your distribution volume and customer base.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
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
        </section>

        {/* 4. CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D1512] to-[#070B09] border border-[#D9C08A]/35 text-center space-y-5 max-w-2xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D9C08A]/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#F4F7F5] relative z-10">
            Have questions about specific services?
          </h3>
          <p className="text-xs sm:text-sm text-[#9EABA2] max-w-md mx-auto leading-relaxed relative z-10">
            Connect with our partner growth team to learn how to integrate these solutions into your distribution pipeline.
          </p>
          <div className="pt-2 relative z-10">
            <Link to="/contact">
              <Button variant="champagne" size="md" className="font-medium shadow-lg" iconRight={<ArrowRight size={13} />}>
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;

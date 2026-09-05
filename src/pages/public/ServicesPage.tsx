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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="B2B Distribution & Growth Services | Dream to Achievers"
        description="Explore B2B distribution, wholesale logistics, and partner growth enablement services from Dream to Achievers. Helping resellers scale across Pakistan."
        canonicalPath="/services"
        ogType="website"
      />

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

export default ServicesPage;

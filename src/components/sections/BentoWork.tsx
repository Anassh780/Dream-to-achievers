import React from 'react';
import { CardFlip } from '@/components/ui/CardFlip';
import { Video, TrendUp, PencilLine, ShareNetwork, Cpu, Palette, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface BentoWorkProps {
  showHeader?: boolean;
}

export const BentoWork: React.FC<BentoWorkProps> = ({ showHeader = true }) => {
  const flipServices = [
    {
      id: 'service-tiktok',
      categoryNumber: '01 / AUTOMATION',
      title: 'TikTok & Reels Automation',
      subtitle: 'Automated video scripting & scheduled batch publishing pipelines',
      description: 'Automated video scripting, AI editing workflows, batch posting schedules, and TikTok Shop integration for exponential organic reach.',
      features: [
        'Viral Scripting Engines',
        'AI Batch Video Editing',
        'Auto-Posting Schedule',
        'TikTok Shop Integration',
      ],
      impactBadge: '10M+ Views',
      icon: <Video size={18} />,
      frontImage: '/images/tiktok-automation.webp',
    },
    {
      id: 'service-ads',
      categoryNumber: '02 / MEDIA BUYING',
      title: 'Paid Performance Marketing',
      subtitle: 'Data-driven Meta, TikTok & Google ad scaling',
      description: 'Data-driven Meta, TikTok & Google ad campaigns engineered for maximum return on ad spend and rapid ROAS scale.',
      features: [
        'Meta & TikTok Ads',
        'A/B Creative Testing',
        'ROAS Optimization',
        'Retargeting Funnels',
      ],
      impactBadge: '4.8x Avg ROAS',
      icon: <TrendUp size={18} />,
      frontImage: '/images/paid-ads.webp',
    },
    {
      id: 'service-copy',
      categoryNumber: '03 / DIRECT RESPONSE',
      title: 'Conversion Copywriting',
      subtitle: 'Persuasive ad copy, VSLs & landing page scripts',
      description: 'Persuasive ad copy, high-converting landing page scripts, email sequences, and SEO editorial content designed to sell.',
      features: [
        'Direct-Response Copy',
        'Video Ad Scripts',
        'High-Converting VSLs',
        'Email Sequences',
      ],
      impactBadge: '3.2x Conversion',
      icon: <PencilLine size={18} />,
      frontImage: '/images/content-writing.webp',
    },
    {
      id: 'service-smm',
      categoryNumber: '04 / BRAND GROWTH',
      title: 'Social Media Management',
      subtitle: 'Omnichannel positioning & partner community scaling',
      description: 'Omnichannel content calendars, community moderation, influencer outreach, and viral organic reach strategies.',
      features: [
        'Cross-Platform Scheduling',
        'Brand Voice Blueprint',
        'Community Engagement',
        'Influencer Seeding',
      ],
      impactBadge: '100k+ Reach',
      icon: <ShareNetwork size={18} />,
      frontImage: '/images/smm.webp',
    },
    {
      id: 'service-ops',
      categoryNumber: '05 / OPERATIONS',
      title: 'Operations & CRM Systems',
      subtitle: 'Workflow automation & nationwide order routing',
      description: 'End-to-end workflow automation, CRM pipeline architecture, team SOP development, and operations optimization.',
      features: [
        'Workflow Automation',
        'CRM & Pipeline Setup',
        'Team SOP Systems',
        'KPI Dashboards',
      ],
      impactBadge: '35h/wk Saved',
      icon: <Cpu size={18} />,
      frontImage: '/images/biz-management.webp',
    },
    {
      id: 'service-design',
      categoryNumber: '06 / CREATIVE',
      title: 'Graphic & Creative Design',
      subtitle: 'High-converting ad visuals, packaging & brand guidelines',
      description: 'High-converting ad creatives, scroll-stopping thumbnails, brand guideline systems, and polished digital marketing collateral.',
      features: [
        'High-ROAS Ad Creatives',
        'Social Media Asset Packs',
        'Brand Identity Guidelines',
        'Packaging & Merch',
      ],
      impactBadge: '500+ Assets',
      icon: <Palette size={18} />,
      frontImage: '/images/graphic-design.webp',
    },
  ];

  return (
    <section id="services" className="w-full py-20 sm:py-28 font-sans bg-[#060B18] border-y border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
        {showHeader && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
            <div>
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase block mb-2 font-mono">
                Interactive Flip Cards
              </span>
              <h2 className="text-3xl sm:text-4xl font-outfit font-bold text-white tracking-tight">
                Growth & Scaling Capabilities
              </h2>
            </div>
            <Link to="/services">
              <Button variant="outline" size="sm" iconRight={<ArrowRight size={13} />}>
                Explore All Services
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flipServices.map((svc) => (
            <CardFlip
              key={svc.id}
              id={svc.id}
              categoryNumber={svc.categoryNumber}
              title={svc.title}
              subtitle={svc.subtitle}
              description={svc.description}
              features={svc.features}
              impactBadge={svc.impactBadge}
              icon={svc.icon}
              frontImage={svc.frontImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

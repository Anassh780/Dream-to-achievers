import React, { useEffect, useRef } from 'react';
import { CardFlip } from '@/components/ui/CardFlip';
import { Badge } from '@/components/ui/Badge';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { BorderGlow } from '@/components/ui/BorderGlow';
import { Sparkle, Video, TrendUp, PencilLine, ShareNetwork, Cpu, Palette } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const borderGlowThemes: Record<string, { glowColor: string; colors: string[] }> = {
  cyan: {
    glowColor: '190 100 70',
    colors: ['#00f0ff', '#38bdf8', '#818cf8'],
  },
  emerald: {
    glowColor: '155 80 60',
    colors: ['#34d399', '#10b981', '#06b6d4'],
  },
  amber: {
    glowColor: '40 90 60',
    colors: ['#fbbf24', '#f59e0b', '#ec4899'],
  },
  indigo: {
    glowColor: '235 85 65',
    colors: ['#818cf8', '#6366f1', '#a855f7'],
  },
  rose: {
    glowColor: '345 85 65',
    colors: ['#fb7185', '#f43f5e', '#ec4899'],
  },
};


export const BentoWork: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.flip-card-wrapper', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const flipServices = [
    {
      id: 'service-tiktok',
      categoryNumber: 'CORE SERVICE #1',
      title: 'TikTok Automation',
      subtitle: 'Automated video scripting & batch posting pipelines',
      description: 'Automated video scripting, AI editing workflows, batch posting schedules, and TikTok Shop integration for exponential organic reach.',
      features: [
        'Viral Scripting Engines',
        'CapCut AI Batch Editing',
        'Auto-Posting Schedule',
        'TikTok Shop Integration',
      ],
      impactBadge: '10M+ Organic Views',
      icon: <Video size={20} className="text-[#00f0ff]" />,
      accentColor: 'cyan' as const,
      frontImage: '/images/tiktok-automation.webp',
    },
    {
      id: 'service-ads',
      categoryNumber: 'CORE SERVICE #2',
      title: 'Paid Advertisement',
      subtitle: 'Data-driven Meta, TikTok & Google ad scaling',
      description: 'Data-driven Meta, TikTok & Google ad campaigns engineered for maximum return on ad spend and rapid ROAS scale.',
      features: [
        'Meta & TikTok Ads',
        'A/B Creative Testing',
        'ROAS Optimization',
        'Retargeting Funnels',
      ],
      impactBadge: '4.8x Avg ROAS',
      icon: <TrendUp size={20} className="text-emerald-400" />,
      accentColor: 'emerald' as const,
      frontImage: '/images/paid-ads.webp',
    },
    {
      id: 'service-copy',
      categoryNumber: 'CORE SERVICE #3',
      title: 'Content Writing',
      subtitle: 'Persuasive ad copy & landing page scripts',
      description: 'Persuasive ad copy, high-converting landing page scripts, email sequences, and SEO editorial content designed to sell.',
      features: [
        'Direct-Response Copy',
        'Video Ad Scripts',
        'High-Converting Emails',
        'SEO Editorial Content',
      ],
      impactBadge: '+180% Click Conv.',
      icon: <PencilLine size={20} className="text-amber-400" />,
      accentColor: 'amber' as const,
      frontImage: '/images/content-writing.webp',
    },
    {
      id: 'service-smm',
      categoryNumber: 'CORE SERVICE #4',
      title: 'Social Media Marketing',
      subtitle: 'Full-spectrum social growth & community building',
      description: 'Full-spectrum social media management, community engagement, brand positioning, and daily multi-platform distribution.',
      features: [
        'Instagram & TikTok SMM',
        'YouTube Shorts Engine',
        'Community Building',
        'Brand Authority Strategy',
      ],
      impactBadge: '3x Community Growth',
      icon: <ShareNetwork size={20} className="text-indigo-400" />,
      accentColor: 'indigo' as const,
      frontImage: '/images/smm.webp',
    },
    {
      id: 'service-biz',
      categoryNumber: 'CORE SERVICE #5',
      title: 'Business Management',
      subtitle: 'Workflow automations & client onboarding OS',
      description: 'Streamlining agency operations, automated client onboarding, Make/Zapier workflow automations, and CRM synchronization.',
      features: [
        'Make.com Scenarios',
        'Zapier Automations',
        'Airtable & CRM Sync',
        'Client Onboarding OS',
      ],
      impactBadge: '35 Hrs/Wk Saved',
      icon: <Cpu size={20} className="text-[#00f0ff]" />,
      accentColor: 'cyan' as const,
      frontImage: '/images/biz-management.webp',
    },
    {
      id: 'service-graphic',
      categoryNumber: 'CORE SERVICE #6',
      title: 'Graphic Designing',
      subtitle: 'High-converting ad creatives & UI/UX brand assets',
      description: 'High-converting ad graphics, premium social media visual assets, brand identity kits, and UI/UX creative designs.',
      features: [
        'Ad Creative Assets',
        'Brand Style Guides',
        'Social Media Graphics',
        'Figma UI/UX Systems',
      ],
      impactBadge: '100% Custom Identity',
      icon: <Palette size={20} className="text-rose-400" />,
      accentColor: 'rose' as const,
      frontImage: '/images/graphic-design.webp',
    },
  ];

  return (
    <section ref={sectionRef} id="services" className="py-24 relative bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <Badge variant="accent" size="md" className="mb-3">
              <Sparkle size={14} className="text-[#00f0ff]" /> Vanguard Flip Card Architecture
            </Badge>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              stagger={0.025}
              textClassName="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading"
            >
              Our Core Growth & Agency Services
            </ScrollFloat>
          </div>
          <p className="text-slate-400 max-w-md text-sm sm:text-base">
            Hover or tap any card to flip and explore detailed deliverables, features, and booking options.
          </p>
        </div>

        {/* 6 Modern Interactive Flip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {flipServices.map((service) => {
            const theme = borderGlowThemes[service.accentColor] || borderGlowThemes.cyan;
            return (
              <div key={service.id} className="flip-card-wrapper w-full flex justify-center">
                <BorderGlow
                  edgeSensitivity={30}
                  glowColor={theme.glowColor}
                  backgroundColor="#0a0e17"
                  borderRadius={16}
                  glowRadius={30}
                  glowIntensity={1.2}
                  coneSpread={25}
                  animated={false}
                  colors={theme.colors}
                >
                  <CardFlip
                    id={service.id}
                    categoryNumber={service.categoryNumber}
                    title={service.title}
                    subtitle={service.subtitle}
                    description={service.description}
                    features={service.features}
                    impactBadge={service.impactBadge}
                    icon={service.icon}
                    accentColor={service.accentColor}
                    frontImage={service.frontImage}
                  />
                </BorderGlow>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

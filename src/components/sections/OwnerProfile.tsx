import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  Sparkle,
  TrendUp,
  ArrowsClockwise,
  CheckCircle,
} from '@phosphor-icons/react';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  image: string;
  frontSummary: string;
  metric: string;
  deliverables: string[];
  tools: string[];
}

export const OwnerProfile: React.FC = () => {
  const siteConfig = useSiteSettings();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const services: ServiceItem[] = [
    {
      id: 'srv-tiktok',
      title: 'TikTok Viral Automation',
      category: 'Organic Growth',
      image: '/images/tiktok-automation.webp',
      frontSummary: 'High-velocity short-form content pipelines converting casual scrollers into paying retail customers.',
      metric: '25M+ Organic Impressions',
      deliverables: [
        'Hook scripting & trending audio matching',
        'Daily short-form video batch production',
        'Direct bio link conversion funnels',
      ],
      tools: ['CapCut Pro', 'TikTok Analytics', 'Notion Pipelines'],
    },
    {
      id: 'srv-smm',
      title: 'Social Media Distribution',
      category: 'Channel Management',
      image: '/images/smm.webp',
      frontSummary: 'Multi-channel brand positioning across Instagram, Facebook, and WhatsApp community broadcasting.',
      metric: '98% Engagement Uplift',
      deliverables: [
        'Omnichannel content calendars',
        'Community engagement & DM sales triage',
        'Reseller influencer collaborations',
      ],
      tools: ['Meta Business Suite', 'Canva Pro', 'WhatsApp Channel Manager'],
    },
    {
      id: 'srv-content',
      title: 'Commercial Video Creation',
      category: 'Creative Production',
      image: '/images/content-creation.webp',
      frontSummary: 'Studio-grade product unboxings, cosmetic texture B-rolls, and problem-solution ad creatives.',
      metric: '4.8x Conversion Rate',
      deliverables: [
        'Macro 4K product cinematography',
        'Urdu & English voiceover narration',
        'High-converting thumbnail suites',
      ],
      tools: ['Sony FX3 Cine', 'Premiere Pro', 'DaVinci Resolve'],
    },
    {
      id: 'srv-ads',
      title: 'Performance Paid Ads',
      category: 'Paid Acquisition',
      image: '/images/paid-ads.webp',
      frontSummary: 'Data-driven Meta and TikTok ad campaigns engineered with strict CAC bounds and scalable ROAS.',
      metric: '3.4x Target ROAS',
      deliverables: [
        'Creative hook testing matrix',
        'Lookalike & pixel event optimization',
        'Real-time cash flow & CPA monitoring',
      ],
      tools: ['TikTok Ads Manager', 'Meta Ads Manager', 'Triple Whale'],
    },
    {
      id: 'srv-logistics',
      title: 'Wholesale Sourcing & Logistics',
      category: 'Supply Chain',
      image: '/images/sourcing-logistics.webp',
      frontSummary: 'Factory-direct supplier vetting, bulk inventory quality checks, and nationwide courier routing.',
      metric: '99.4% Delivery SLA',
      deliverables: [
        'Supplier batch inspection ledgers',
        'Centralized packaging & tamper-sealing',
        'Nationwide COD logistics integration',
      ],
      tools: ['TCS Courier API', 'Trax Logistics', 'Custom Inventory ERP'],
    },
    {
      id: 'srv-mentorship',
      title: 'Partner Strategy & Mentorship',
      category: 'Executive Coaching',
      image: '/images/mentorship.webp',
      frontSummary: '1-on-1 operational coaching for high-volume resellers aiming for Level 03 & Level 04 milestones.',
      metric: '100% Rank Achievement',
      deliverables: [
        'Weekly sales & margin breakdown audits',
        'Sub-distributor hiring & team structuring',
        'Personal brand authority positioning',
      ],
      tools: ['Zoom Private Rooms', 'Loom Video Audits', 'Partner ERP'],
    },
  ];

  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Faria, I would like to connect regarding DreamToAchievers partner onboarding and wholesale collaboration.'
  )}`;

  return (
    <section id="founder" className="w-full py-16 sm:py-24 font-sans border-t border-white/[0.08] bg-[#020612]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16">
        
        {/* 1. FOUNDER PROFILE & MISSION STATEMENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Authentic Portrait Frame */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-3 sm:p-4 bg-[#060B18] border border-white/[0.08] shadow-2xl space-y-4">
              <div className="rounded-2xl overflow-hidden bg-[#030712] relative border border-white/[0.06]">
                <div className="aspect-[4/5] relative w-full overflow-hidden">
                  <img
                    src="/images/faria-imran.webp"
                    alt="Faria Imran — Founder & Executive Director"
                    loading="lazy"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/faria-imran.jpg';
                    }}
                  />
                </div>

                <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-[#060B18]/90 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="font-heading font-bold text-white text-sm">Faria Imran</p>
                    <p className="text-[10px] text-slate-400 font-mono">Founder &amp; Executive Director</p>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <ShieldCheck size={11} weight="fill" className="text-cyan-400" />
                    <span>VERIFIED</span>
                  </span>
                </div>
              </div>

              {/* Verified Metrics Counter */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06]">
                  <p className="text-xl font-bold font-jetbrains text-white">25M+</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Organic Impressions</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06]">
                  <p className="text-xl font-bold font-jetbrains text-emerald-400">100%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Transparent Margins</p>
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
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                "We built DreamToAchievers to give everyday distributors enterprise wholesale power."
              </h2>
              <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                — Faria Imran, Founder &amp; Executive Director
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                As an entrepreneur and growth strategist, I recognized that traditional resale businesses in Pakistan struggle with inconsistent product quality, unreliable courier deliveries, and opaque pricing margins.
              </p>
              <p>
                DreamToAchievers bridges this gap by combining physical wholesale commerce with complete digital infrastructure. We handle product testing, warehousing, courier dispatch, and customer logistics — so our distributor partners can focus purely on marketing and generating profitable gross margins.
              </p>
            </div>

            {/* Core Values Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#060B18] border border-white/[0.08] space-y-1">
                <span className="font-heading font-bold text-xs text-white block">Zero Inventory Risk</span>
                <p className="text-[11px] text-slate-400">Distribute verified wholesale products without upfront bulk warehousing capital.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#060B18] border border-white/[0.08] space-y-1">
                <span className="font-heading font-bold text-xs text-white block">Guaranteed Milestone Bonuses</span>
                <p className="text-[11px] text-slate-400">Clear dual qualification milestones unlocking up to PKR 10,000 cash rewards.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md" iconLeft={<WhatsappLogo size={16} weight="fill" className="text-emerald-950" />}>
                  Direct WhatsApp Desk
                </Button>
              </a>
              <Link to="/how-it-works">
                <Button variant="secondary" size="md">
                  Explore Operational Model
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. SERVICES FLIP CARDS GRID */}
        <div className="space-y-8 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="eyebrow">
                <Sparkle size={13} weight="fill" />
                <span>Partner Enablement Solutions</span>
              </div>
              <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                Distribution &amp; Growth Services
              </h2>
              <p className="text-xs text-slate-400 max-w-lg">
                Click or hover over any service card to reveal the underlying execution deliverables and operational tools.
              </p>
            </div>

            <Link to="/services">
              <Button variant="secondary" size="sm" iconRight={<ArrowRight size={13} />}>
                View All Ecosystem Services
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const isFlipped = !!flippedCards[service.id];

              return (
                <div
                  key={service.id}
                  onClick={() => toggleFlip(service.id)}
                  className="relative h-[340px] cursor-pointer group [perspective:1000px]"
                >
                  <div
                    className={`w-full h-full duration-500 [transform-style:preserve-3d] transition-transform relative rounded-3xl ${
                      isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:[transform:rotateY(180deg)]'
                    }`}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl bg-[#060B18] border border-white/[0.08] p-5 flex flex-col justify-between shadow-xl overflow-hidden">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {service.category}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {service.metric}
                          </span>
                        </div>

                        <div className="w-full h-32 rounded-2xl overflow-hidden bg-[#030712] border border-white/5">
                          <img
                            src={service.image}
                            alt={service.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/logo.png';
                            }}
                          />
                        </div>

                        <div>
                          <h3 className="font-heading font-bold text-base text-white mb-1">
                            {service.title}
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {service.frontSummary}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                          <ArrowsClockwise size={13} /> Tap to flip deliverables
                        </span>
                        <span className="text-slate-500">Details &rarr;</span>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-[#0A1024] border border-cyan-500/30 p-5 flex flex-col justify-between shadow-2xl text-xs">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                          <h4 className="font-heading font-bold text-sm text-white">
                            {service.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Specs
                          </span>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                            Key Deliverables:
                          </span>
                          {service.deliverables.map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-200">
                              <CheckCircle size={13} weight="fill" className="text-cyan-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-white/[0.08] space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 block">Tools &amp; Stack:</span>
                          <div className="flex flex-wrap gap-1">
                            {service.tools.map((tool, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">SLA: Active Support</span>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <span className="font-mono text-[11px] text-cyan-400 font-bold hover:underline flex items-center gap-1">
                            Inquire via Desk &rarr;
                          </span>
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

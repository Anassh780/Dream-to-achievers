import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SITE_CONFIG } from '@/config/site';
import {
  TrendUp,
  Lightning,
  CheckCircle,
  Cpu,
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  Sparkle,
} from '@phosphor-icons/react';

export const OwnerProfile: React.FC = () => {
  const expertiseList = [
    {
      title: 'Content & Video Marketing Pipelines',
      desc: 'Automated script-to-publish video systems that generate millions of organic impressions and convert viewers into product buyers.',
      icon: Lightning,
    },
    {
      title: 'Performance Paid Advertising',
      desc: 'Data-driven Meta and TikTok campaigns with structured creative hooks scaling client returns up to 5.4x ROAS.',
      icon: TrendUp,
    },
    {
      title: 'Wholesale Sourcing & Logistics',
      desc: 'Reliable supplier partnerships, verified margin ledgers, and streamlined nationwide delivery infrastructure.',
      icon: Cpu,
    },
  ];

  const cleanWhatsApp = SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Faria, I would like to connect regarding Dream to Achievers partner onboarding and growth collaboration.'
  )}`;

  return (
    <section id="founder" className="w-full py-20 sm:py-28 font-sans bg-[#06090F] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase block mb-2 font-mono">
              Executive Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-outfit font-semibold text-white tracking-tight">
              Meet Founder Faria Imran
            </h2>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" iconLeft={<WhatsappLogo size={16} weight="fill" className="text-emerald-400" />}>
              Direct WhatsApp Desk
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Authentic Portrait Frame */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl p-2 bg-white/[0.03] border border-white/[0.08] shadow-2xl overflow-hidden group">
              <div className="rounded-[1.35rem] overflow-hidden bg-[#0A0F19] relative border border-white/[0.06]">
                <div className="aspect-[4/5] relative w-full overflow-hidden">
                  <img
                    src="/images/faria-imran.webp"
                    alt="Faria Imran — Founder & Executive Director"
                    loading="lazy"
                    className="w-full h-full object-cover object-top filter brightness-[1.02] contrast-[1.03] transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/faria-imran.jpg';
                    }}
                  />
                  
                  {/* Subtle inner shadow and gradient scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-transparent to-transparent opacity-80" />
                </div>

                {/* Floating Status Pill */}
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#080C14]/90 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-lg">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="font-heading font-bold text-white text-base">Faria Imran</p>
                      <Sparkle size={13} weight="fill" className="text-blue-400" />
                    </div>
                    <p className="text-xs text-[#94A3B8]">Founder & Executive Director</p>
                  </div>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>

              {/* Verified Metrics Counter */}
              <div className="grid grid-cols-2 gap-3 mt-3 px-1 text-center">
                <div className="p-3.5 rounded-2xl bg-[#0A0F19] border border-white/[0.04]">
                  <p className="text-2xl font-bold text-white font-jetbrains">25M+</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Organic Views Generated</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0A0F19] border border-white/[0.04]">
                  <p className="text-2xl font-bold text-emerald-400 font-jetbrains">5.4x</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Peak Campaign ROAS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Story & Value Props */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-sm text-[#94A3B8] leading-relaxed">
              <h3 className="text-2xl sm:text-3xl font-outfit font-semibold text-white tracking-tight">
                Empowering independent distributors with real product economics.
              </h3>
              <p>
                Faria started <strong className="text-white">Dream to Achievers</strong> to solve a fundamental challenge in online commerce: giving ambitious individuals direct access to genuine wholesale pricing, verified margins, and automated distribution systems.
              </p>
              <p>
                By combining physical high-demand consumer goods with viral TikTok content playbooks and milestone cash bonuses, we help partners nationwide build resilient digital sales networks.
              </p>
            </div>

            {/* Core Capability Cards */}
            <div className="space-y-3 pt-2">
              {expertiseList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0A0F19] border border-white/[0.06] hover:border-white/15 transition-colors flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Icon size={20} weight="fill" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Direct Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link to="/signup">
                <Button variant="primary" size="md" iconRight={<ArrowRight size={14} weight="bold" />}>
                  Become a Partner
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="md">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

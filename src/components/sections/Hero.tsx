import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowDownRight, Lightning, RocketLaunch, TrendUp, Cpu, Video, ChartLineUp } from '@phosphor-icons/react';
import gsap from 'gsap';

export const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Kinetic reveal for Hero copy
      gsap.from('.hero-reveal', {
        y: 35,
        opacity: 0,
        duration: 0.9,
        stagger: 0.14,
        ease: 'power3.out',
      });

      // Subtle float effect on live growth terminal
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          y: -12,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] pt-32 pb-20 flex items-center justify-center bg-radial-hero overflow-hidden grid-background"
    >
      {/* Background Radial Glow Mesh Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        {/* Left Column: Headline, Value Proposition, CTAs */}
        <div className="lg:col-span-7 space-y-7">
          <div className="hero-reveal">
            <Badge variant="accent" size="md">
              <Lightning size={14} className="text-[#00f0ff]" weight="fill" />
              Faria Imran — Growth Marketing & Automation Lead
            </Badge>
          </div>

          <h1 className="hero-reveal text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] pb-1 font-heading">
            Scale your brand with <span className="text-gradient-cyan italic">TikTok automation & viral ads</span>.
          </h1>

          <p className="hero-reveal text-base sm:text-lg text-slate-300 max-w-[52ch] leading-relaxed font-normal">
            Welcome to Faria Imran's official portfolio. Specialized in automated content pipelines, high-ROAS ad campaigns, strategic copywriting, and end-to-end business growth.
          </p>

          <div className="hero-reveal flex flex-wrap items-center gap-4 pt-2">
            <a href="#services">
              <Button
                variant="primary"
                size="lg"
                iconRight={
                  <span className="w-6 h-6 rounded-full bg-[#080b11]/20 flex items-center justify-center ml-1">
                    <ArrowDownRight size={14} weight="bold" />
                  </span>
                }
              >
                Explore Services
              </Button>
            </a>
            <a href="#contact">
              <Button variant="secondary" size="lg">
                Book Growth Audit
              </Button>
            </a>
          </div>

          {/* ROI Stats Strip */}
          <div className="hero-reveal pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-xl">
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-extrabold text-white">50M+</p>
              <p className="text-xs text-slate-400 font-mono">Organic Views Generated</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-extrabold text-[#00f0ff]">$3.8M+</p>
              <p className="text-xs text-slate-400 font-mono">Ad Spend Managed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">4.8x</p>
              <p className="text-xs text-slate-400 font-mono">Average Campaign ROAS</p>
            </div>
          </div>
        </div>

        {/* Right Column: Double-Bezel Live Growth Engine Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div
            ref={cardRef}
            className="hero-reveal w-full max-w-md p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl relative"
          >
            {/* Inner Core Container */}
            <div className="rounded-[calc(2rem-0.5rem)] bg-[#0a0e17] p-6 border border-white/10 space-y-6">
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-[#00f0ff] flex items-center gap-1.5 font-semibold">
                  <ChartLineUp size={16} /> LIVE GROWTH ENGINE
                </span>
              </div>

              {/* Dynamic Campaign Status Cards */}
              <div className="space-y-3">
                {/* Metric 1: TikTok Automation */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff]">
                      <Video size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">TikTok Automated Pipeline</p>
                      <p className="text-[11px] text-slate-400 font-mono">14 Videos Posted / Auto-Scheduled</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold">+240% Reach</span>
                </div>

                {/* Metric 2: Ad Spend & ROAS */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <TrendUp size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Meta & TikTok Paid Campaign</p>
                      <p className="text-[11px] text-slate-400 font-mono">$12,400 Daily Spend / 5.2x ROAS</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#00f0ff] font-bold">Scaling</span>
                </div>

                {/* Metric 3: Automated Business Ops */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <Cpu size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">CRM & Client Onboarding</p>
                      <p className="text-[11px] text-slate-400 font-mono">Make.com Automation Synced</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-300">100% Auto</span>
                </div>
              </div>

              {/* Live Terminal Output */}
              <div className="font-mono text-[11px] text-slate-400 pt-3 border-t border-white/10 leading-relaxed">
                <p className="text-slate-500">// Real-time campaign automation log</p>
                <p>
                  <span className="text-[#00f0ff]">[SYSTEM]</span> Script generation completed for TikTok Batch #4
                </p>
                <p>
                  <span className="text-emerald-400">[ADS]</span> Auto-budget reallocation triggered (+15% to Winner Ad #2)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

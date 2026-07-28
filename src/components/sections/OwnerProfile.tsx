import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { BorderGlow } from '@/components/ui/BorderGlow';
import {
  UserCheck,
  Sparkle,
  TrendUp,
  Lightning,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  Cpu,
  EnvelopeSimple,
  Globe,
  Certificate,
  Star,
  Rocket,
  WhatsappLogo
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const OwnerProfile: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance reveal for text and metrics
      gsap.from('.profile-reveal', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Subtle float animation on portrait card frame
      if (imageFrameRef.current) {
        gsap.to(imageFrameRef.current, {
          y: -8,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const expertiseList = [
    {
      title: 'TikTok & Reels Automation Engine',
      desc: 'Architecting end-to-end automated script-to-publish content pipelines that generate millions of organic impressions.',
      icon: Lightning,
    },
    {
      title: 'High-ROAS Meta & Paid Campaigns',
      desc: 'Deploying direct-response ad hooks and data-driven targeting scaling client revenue up to 5.4x ROAS.',
      icon: TrendUp,
    },
    {
      title: 'Business Process & CRM Automation',
      desc: 'Integrating Make.com scenarios, AI agents, and CRM sync to eliminate manual bottlenecks for fast-growing brands.',
      icon: Cpu,
    },
  ];

  const QuickPill = ({ label }: { label: string }) => (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 hover:border-[#00f0ff]/40 hover:text-white transition-all cursor-default">
      <CheckCircle size={14} className="text-[#00f0ff]" />
      <span>{label}</span>
    </span>
  );

  return (
    <section ref={sectionRef} id="about" className="py-24 bg-[#080b11] relative overflow-hidden grid-background">
      {/* Glow Orbs background */}
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 space-y-12">
        {/* Section Header with Kinetic ScrollFloat Animation */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="accent" size="md" className="mb-2">
            <UserCheck size={14} className="text-[#00f0ff]" weight="fill" /> Portfolio Owner & Founder Profile
          </Badge>

          {/* Header Text Animation (ScrollFloat) */}
          <div className="profile-reveal">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              stagger={0.025}
              textClassName="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-heading"
            >
              Meet Faria Imran — Founder & Strategic Growth Architect
            </ScrollFloat>
          </div>

          <p className="profile-reveal text-base sm:text-lg text-slate-300 leading-relaxed max-w-[65ch]">
            The driving force behind Vanguard's automated growth systems. Faria combines high-converting creative strategy, viral content automation, and data-driven ad management to scale modern brands with speed and precision.
          </p>
        </div>

        {/* Main Content Grid: Portrait Card (with BorderGlow) + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (5 Cols): Neon Edge Glow Card */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div ref={imageFrameRef} className="profile-reveal w-full max-w-md">
              <BorderGlow
                edgeSensitivity={30}
                glowColor="190 100 70"
                backgroundColor="#0a0e17"
                borderRadius={28}
                glowRadius={30}
                glowIntensity={1.4}
                coneSpread={25}
                animated={true}
                colors={['#00f0ff', '#38bdf8', '#818cf8', '#34d399']}
                className="w-full shadow-[0_0_40px_rgba(0,240,255,0.15)]"
              >
                <div className="p-5 space-y-5">
                  {/* Photo Frame Container */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
                    <img
                      src="/images/faria-imran.jpg"
                      alt="Faria Imran - Portfolio Owner & Founder"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Subtle Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080b11] via-transparent to-transparent opacity-85" />
                    
                    {/* Floating Availability Pill */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#080b11]/85 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Available for Audits & Partnerships</span>
                      </span>
                    </div>

                    {/* Name Tag Overlay at Bottom of Image */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#080b11]/90 backdrop-blur-md border border-white/15">
                      <h3 className="text-xl font-bold font-heading text-white">Faria Imran</h3>
                      <p className="text-xs font-mono text-[#00f0ff] font-medium">Founder & Head of Growth</p>
                    </div>
                  </div>

                  {/* Highlights Stats Bar (Fixes unused bottom space) */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div>
                      <p className="text-base font-mono font-bold text-white">50M+</p>
                      <p className="text-[10px] font-mono text-slate-400">Views Engineered</p>
                    </div>
                    <div className="border-x border-white/10">
                      <p className="text-base font-mono font-bold text-[#00f0ff]">4.8x</p>
                      <p className="text-[10px] font-mono text-slate-400">Avg ROAS Lift</p>
                    </div>
                    <div>
                      <p className="text-base font-mono font-bold text-emerald-400">100%</p>
                      <p className="text-[10px] font-mono text-slate-400">Automated Pipeline</p>
                    </div>
                  </div>

                  {/* Direct Contact Action Strip */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                      <Globe size={15} className="text-[#00f0ff]" />
                      <span>Global Operations</span>
                    </div>
                    <a
                      href="#contact"
                      className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-[#00f0ff] hover:text-white transition-colors"
                    >
                      <span>Connect Directly</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </div>
              </BorderGlow>
            </div>
          </div>

          {/* Right Column (7 Cols): Bio, Core Pillars, Key Stats */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Bio & Leadership Manifesto Card */}
            <div className="profile-reveal p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#0a0e17] p-6 sm:p-8 space-y-5">
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-mono text-[#00f0ff] font-bold flex items-center gap-2">
                    <ShieldCheck size={16} /> EXECUTIVE SUMMARY
                  </span>
                  <Badge variant="dot" size="sm">
                    Verified Portfolio Owner
                  </Badge>
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                  "Growth isn't about guessing—it's about building systematic, repeatable engines. At Vanguard, I help brands replace fragmented marketing efforts with automated content pipelines, high-ROAS paid media campaigns, and scalable business workflows."
                </p>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <QuickPill label="Growth Architecture" />
                  <QuickPill label="TikTok Content Systems" />
                  <QuickPill label="Meta Direct Response Ads" />
                  <QuickPill label="Automated Workflows (Make.com)" />
                  <QuickPill label="Strategic Copywriting" />
                  <QuickPill label="Full-Stack Business Ops" />
                </div>
              </div>
            </div>

            {/* Core Strategic Pillars */}
            <div className="profile-reveal space-y-4">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold">
                Strategic Core Pillars — Faria Imran
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {expertiseList.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#0a0e17] border border-white/10 hover:border-[#00f0ff]/40 transition-all duration-300 space-y-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-110 transition-transform">
                        <Icon size={20} />
                      </div>
                      <h5 className="text-sm font-bold text-white font-heading group-hover:text-[#00f0ff] transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar & Direct Call */}
            <div className="profile-reveal pt-2 flex flex-wrap items-center gap-4">
              <a href="#contact">
                <Button
                  variant="primary"
                  size="lg"
                  iconRight={
                    <span className="w-6 h-6 rounded-full bg-[#080b11]/20 flex items-center justify-center ml-1">
                      <ArrowUpRight size={14} weight="bold" />
                    </span>
                  }
                >
                  Book Strategy Call with Faria
                </Button>
              </a>
              <a
                href="https://wa.me/923054511395?text=Hi%20Faria,%20I%20would%20like%20to%20discuss%20a%20growth%20collaboration%20for%20my%20brand."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300"
                  iconLeft={<WhatsappLogo size={18} weight="fill" className="text-emerald-400" />}
                >
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

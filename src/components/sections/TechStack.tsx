import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { Cpu, Video, TrendUp, PencilLine, ShareNetwork, Wrench } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const TechStack: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stack-card', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stackCategories = [
    {
      title: 'TikTok & Video Automation',
      icon: <Video size={24} className="text-[#00f0ff]" />,
      tools: ['TikTok Shop API', 'CapCut Engine', 'ElevenLabs Voice AI', 'OpusClip Automation', 'Premiere Pro'],
    },
    {
      title: 'Paid Ads & Tracking Stack',
      icon: <TrendUp size={24} className="text-emerald-400" />,
      tools: ['Meta Business Suite', 'TikTok Ads Manager', 'Google Ads Engine', 'Triple Whale', 'Hyros Tracking'],
    },
    {
      title: 'Copywriting & Content Engine',
      icon: <PencilLine size={24} className="text-amber-400" />,
      tools: ['Direct-Response Copy', 'Claude Scriptwriting', 'Notion Content OS', 'Grammarly Pro', 'SEOSurfer'],
    },
    {
      title: 'Ops & Business Automation',
      icon: <Cpu size={24} className="text-indigo-400" />,
      tools: ['Make.com Scenarios', 'Zapier Automation', 'Airtable Databases', 'HubSpot CRM', 'Slack Workflow Bots'],
    },
  ];

  return (
    <section ref={sectionRef} id="stack" className="py-24 bg-[#090d16] relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="emerald" size="md">
            <Wrench size={14} className="text-emerald-400" /> Agency Infrastructure
          </Badge>
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            stagger={0.03}
            containerClassName="flex justify-center"
            textClassName="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading"
          >
            Our Growth & Automation Stack
          </ScrollFloat>
          <p className="text-slate-400 text-sm sm:text-base">
            Enterprise marketing platforms, automated workflow triggers, and high-conversion creative toolkits.
          </p>
        </div>

        {/* Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stackCategories.map((cat) => (
            <div key={cat.title} className="stack-card">
              <div className="p-2 rounded-[1.75rem] bg-white/5 border border-white/10 hover:border-white/20 transition-all h-full">
                <div className="rounded-[calc(1.75rem-0.375rem)] bg-[#0c111d] p-6 h-full space-y-6">
                  <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {cat.icon}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-white leading-tight">
                      {cat.title}
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {cat.tools.map((tool) => (
                      <li key={tool} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">{tool}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]/70" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

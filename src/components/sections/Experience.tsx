import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import { ChartLineUp, CheckCircle, RocketLaunch, Sparkle } from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Experience: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.case-study-item', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        x: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const caseStudies = [
    {
      period: 'Case Study #1 — DTC Scale',
      title: 'E-Commerce Fashion Brand Scaling',
      client: 'Verve Wear Global',
      description: 'Engineered automated TikTok content pipelines paired with high-intent Meta retargeting ads, scaling monthly revenue from $35,000 to $280,000 in 90 days.',
      metrics: '5.4x ROAS / $245k Rev Lift',
      highlights: [
        'Generated 22M+ organic views across 45 automated TikTok videos',
        'Built high-conversion direct response ad creatives & video hooks',
        'Integrated automated order tracking & email retargeting flows',
      ],
    },
    {
      period: 'Case Study #2 — SaaS Organic Growth',
      title: 'Viral TikTok & Social Growth Engine',
      client: 'Aura AI Productivity',
      description: 'Executed daily automated TikTok & Instagram Reels distribution system, driving 14,000+ new app signups without ad spend.',
      metrics: '14M Views / 14k Signups',
      highlights: [
        'Automated script generation & voiceover synthesis pipeline',
        'Achieved 3 viral hits (>2.5M views each) in the first 30 days',
        'Optimized landing page copy resulting in a 24% conversion rate',
      ],
    },
    {
      period: 'Case Study #3 — Agency Automation',
      title: 'Business Management & CRM Automation',
      client: 'Apex Marketing Partners',
      description: 'Streamlined agency operations by deploying custom Make.com scenarios, eliminating manual client onboarding and contract routing.',
      metrics: '35 Hrs/Wk Saved',
      highlights: [
        'Automated client intake, invoice generation & Slack notifications',
        'Reduced client onboarding time from 3 days to 4 minutes',
        'Built real-time client KPI reporting dashboard',
      ],
    },
  ];

  return (
    <section ref={sectionRef} id="case-studies" className="py-24 bg-[#07090e] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <Badge variant="accent" size="md" className="mb-3">
              <ChartLineUp size={14} className="text-[#00f0ff]" /> Proven Client Impact
            </Badge>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              stagger={0.025}
              textClassName="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading"
            >
              Growth Case Studies
            </ScrollFloat>
          </div>
          <p className="text-slate-400 max-w-md text-sm sm:text-base">
            Verified performance metrics demonstrating measurable revenue, view counts, and operations time saved.
          </p>
        </div>

        {/* Case Studies Timeline */}
        <div className="relative pl-6 border-l border-white/15 space-y-10 max-w-4xl mx-auto">
          {caseStudies.map((cs, idx) => (
            <div key={idx} className="case-study-item relative group">
              {/* Indicator Dot */}
              <div className="absolute -left-[31px] top-2 w-4 h-4 rounded-full bg-[#07090e] border-2 border-[#00f0ff] group-hover:scale-125 group-hover:bg-[#00f0ff] transition-all" />

              <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 group-hover:border-[#00f0ff]/40 transition-all">
                <div className="rounded-[calc(2rem-0.5rem)] bg-[#0a0e17] p-8 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono text-[#00f0ff] font-semibold block">{cs.period}</span>
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#00f0ff] transition-colors font-heading">
                        {cs.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400">Client: {cs.client}</p>
                    </div>
                    <Badge variant="emerald" size="md" className="w-max font-mono font-bold text-xs">
                      {cs.metrics}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">{cs.description}</p>

                  <div className="pt-4 border-t border-white/10 space-y-2">
                    {cs.highlights.map((item, i) => (
                      <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-300 font-mono">
                        <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Cpu, Video, TrendUp, PencilLine } from '@phosphor-icons/react';

export const TechStack: React.FC = () => {
  const stackCategories = [
    {
      title: 'TikTok & Video Automation',
      icon: <Video size={20} className="text-[#60A5FA]" />,
      tools: ['TikTok Shop API', 'CapCut AI Workflows', 'ElevenLabs Voice Engine', 'Batch Publishing Tools', 'Creative Optimization'],
    },
    {
      title: 'Paid Performance Media',
      icon: <TrendUp size={20} className="text-[#22C55E]" />,
      tools: ['Meta Ads Manager', 'TikTok Business Center', 'Google Search & PMax', 'Attribution Tracking', 'Funnel Analytics'],
    },
    {
      title: 'Direct-Response Systems',
      icon: <PencilLine size={20} className="text-[#F59E0B]" />,
      tools: ['Direct-Response Copy', 'Conversion Landing Pages', 'WhatsApp Sales Automations', 'Email Follow-Ups', 'Offer Positioning'],
    },
    {
      title: 'Operations & Community Stack',
      icon: <Cpu size={20} className="text-[#A855F7]" />,
      tools: ['Automated Margin Crediting', 'Referral Network Engine', 'Dual Rank Verification', 'Milestone Reward Queue', 'Real-Time Ledgers'],
    },
  ];

  return (
    <section id="stack" className="max-w-6xl mx-auto px-5 sm:px-8 space-y-8 font-sans">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs text-[#60A5FA] font-medium uppercase tracking-wider">
          Tooling & Architecture
        </span>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
          Our Technology & Operations Stack
        </h2>
        <p className="text-xs sm:text-sm text-[#8996A8]">
          The systems powering automated catalog distribution, video marketing, and rank milestone rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stackCategories.map((cat) => (
          <div
            key={cat.title}
            className="p-5 rounded-2xl bg-[#111A27] border border-white/[0.08] flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-white/[0.06]">
              <div className="p-2 rounded-lg bg-[#0D141F] border border-white/[0.06]">
                {cat.icon}
              </div>
              <h3 className="font-semibold text-xs text-white leading-tight">
                {cat.title}
              </h3>
            </div>

            <ul className="space-y-2 text-xs">
              {cat.tools.map((tool) => (
                <li key={tool} className="flex items-center justify-between text-[#CBD5E1]">
                  <span>{tool}</span>
                  <span className="w-1 h-1 rounded-full bg-[#3B82F6]" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

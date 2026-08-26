import React from 'react';
import { Cpu, Video, TrendUp, PencilLine } from '@phosphor-icons/react';

export const TechStack: React.FC = () => {
  const stackCategories = [
    {
      title: 'TikTok & Video Pipelines',
      icon: <Video size={20} className="text-[#1F4D3E]" />,
      tools: ['TikTok Shop API', 'CapCut Batch Workflows', 'ElevenLabs Voice Engine', 'Publishing Automation', 'Creative Testing'],
    },
    {
      title: 'Paid Media Operations',
      icon: <TrendUp size={20} className="text-[#B8862E]" />,
      tools: ['Meta Ads Manager', 'TikTok Business Center', 'Google Search & PMax', 'Attribution Tracking', 'Funnel Analytics'],
    },
    {
      title: 'Direct-Response Assets',
      icon: <PencilLine size={20} className="text-[#1F4D3E]" />,
      tools: ['Direct-Response Copy', 'Conversion Landing Pages', 'WhatsApp Sales Desks', 'Email Broadcasts', 'Offer Positioning'],
    },
    {
      title: 'Operations & Ledger Stack',
      icon: <Cpu size={20} className="text-[#B8862E]" />,
      tools: ['Automated Margin Ledgers', 'Partner Attribution Engine', 'Level Qualification', 'Milestone Cash Queue', 'COD Courier API'],
    },
  ];

  return (
    <section id="stack" className="max-w-[1180px] mx-auto px-6 sm:px-8 space-y-8 font-sans">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="eyebrow">
          <span>Infrastructure &amp; Tooling</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#1E241F]">
          Technology &amp; Operations Infrastructure
        </h2>
        <p className="text-xs sm:text-sm text-[#5B5C50]">
          The systems powering automated catalog distribution, video marketing, and milestone cash rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stackCategories.map((cat) => (
          <div
            key={cat.title}
            className="p-6 rounded-2xl bg-white border border-[#E3DCC8] flex flex-col justify-between space-y-4 shadow-xs"
          >
            <div className="flex items-center space-x-3 pb-3 border-b border-[#E3DCC8]">
              <div className="p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8]">
                {cat.icon}
              </div>
              <h3 className="font-serif font-semibold text-sm text-[#1E241F] leading-tight">
                {cat.title}
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs">
              {cat.tools.map((tool) => (
                <li key={tool} className="flex items-center justify-between text-[#5B5C50]">
                  <span>{tool}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3E]" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

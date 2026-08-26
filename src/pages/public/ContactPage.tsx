import React from 'react';
import { Contact } from '@/components/sections/Contact';
import { ShieldCheck } from '@phosphor-icons/react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      {/* 1. Header Banner */}
      <section className="relative pt-24 sm:pt-28 pb-14 border-b border-white/[0.08] bg-radial-hero overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-4 text-center">
          <div className="eyebrow mx-auto">
            <ShieldCheck size={13} weight="bold" />
            <span>Direct Partner & Brand Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
            Connect with DreamToAchievers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Have an inquiry about wholesale catalog access, milestone reward verification, or enterprise partnerships? Reach out via our direct form or official WhatsApp desk.
          </p>
        </div>
      </section>

      {/* 2. Contact Form & Support Desks */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12">
        <Contact />
      </div>
    </div>
  );
};

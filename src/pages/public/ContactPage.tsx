import React from 'react';
import { Contact } from '@/components/sections/Contact';
import { ShieldCheck } from '@phosphor-icons/react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-4">
          <div className="eyebrow">
            <ShieldCheck size={13} weight="bold" />
            <span>Direct Partner &amp; Brand Support</span>
          </div>
          <h1 className="font-display font-medium text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            Connect with DreamToAchievers
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-lg mx-auto">
            Have an inquiry about wholesale catalog access, milestone reward verification, or enterprise partnerships? Reach out via our direct form or official WhatsApp desk.
          </p>
        </div>
      </section>

      {/* 2. Contact Form & Desks */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12">
        <Contact />
      </div>
    </div>
  );
};

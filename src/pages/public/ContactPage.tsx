import React from 'react';
import { Contact } from '@/components/sections/Contact';
import { SEOHead } from '@/components/common/SEOHead';
import { ShieldCheck } from '@phosphor-icons/react';

export const ContactPage: React.FC = () => {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://dream-to-achievers.vercel.app/contact#webpage',
    url: 'https://dream-to-achievers.vercel.app/contact',
    name: 'Contact Dream to Achievers Support & Onboarding Desks',
    description:
      'Official contact channels and executive help desk for Dream to Achievers partners and wholesale distributors.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Dream to Achievers',
      url: 'https://dream-to-achievers.vercel.app/',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'dreamtoachievers@gmail.com',
        telephone: '+92 305 4511395',
        availableLanguage: ['en', 'ur'],
      },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Contact Official Support & Founder Desk | Dream to Achievers"
        description="Connect with Dream to Achievers support, partner onboarding, and executive desks. Inquire about wholesale catalog access, COD dispatch, and milestone rewards."
        canonicalPath="/contact"
        ogType="website"
        structuredData={contactSchema}
      />

      {/* 1. Header Banner */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09] relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9C08A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1180px] mx-auto max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <ShieldCheck size={13} weight="bold" />
            <span>Direct Partner &amp; Brand Support</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.1]">
            Connect with Dream to Achievers
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed max-w-lg mx-auto">
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

export default ContactPage;

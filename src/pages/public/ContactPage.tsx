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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="Contact Official Support & Founder Desk | Dream to Achievers"
        description="Connect with Dream to Achievers support, partner onboarding, and executive desks. Inquire about wholesale catalog access, COD dispatch, and milestone rewards."
        canonicalPath="/contact"
        ogType="website"
        structuredData={contactSchema}
      />

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

export default ContactPage;

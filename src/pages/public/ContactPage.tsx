import React from 'react';
import { Contact } from '@/components/sections/Contact';

export const ContactPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto px-5 sm:px-8 font-sans">
      {/* Single Clean Page Header */}
      <section className="pt-8 text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs text-[#60A5FA] font-medium uppercase tracking-wider">
          Direct Partner & Brand Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
          Connect with Dream to Achievers
        </h1>
        <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
          Have an inquiry about wholesale catalog access, milestone reward verification, or enterprise partnerships? Reach out via our direct form or official WhatsApp desk.
        </p>
      </section>

      {/* Main Clean Contact Component */}
      <Contact />
    </div>
  );
};

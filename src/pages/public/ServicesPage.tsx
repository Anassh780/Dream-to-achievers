import React from 'react';
import { BentoWork } from '@/components/sections/BentoWork';
import { TechStack } from '@/components/sections/TechStack';
import { Experience } from '@/components/sections/Experience';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

export const ServicesPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-24 max-w-6xl mx-auto px-5 sm:px-8 font-sans">
      {/* Page Header */}
      <section className="pt-8 text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
          Growth & Distribution Ecosystem
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
          Ecosystem & Partner Services
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          In addition to our physical product catalog, Dream to Achievers equips partners with automated marketing pipelines, high-ROAS paid media systems, and community growth tools.
        </p>
      </section>

      {/* Services Grid (without duplicate header) */}
      <BentoWork showHeader={false} />

      {/* Technology & Tooling Stack */}
      <TechStack />

      {/* Verified Partner Case Studies */}
      <Experience />

      {/* CTA */}
      <section className="double-bezel">
        <div className="double-bezel-inner p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto">
          <h3 className="text-2xl font-heading font-bold text-white">
            Have questions about specific services?
          </h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Connect with our partner growth team to learn how to integrate these solutions into your distribution pipeline.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button
                variant="primary"
                size="lg"
                className="rounded-full px-6 group"
                iconRight={
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white ml-1 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={13} weight="bold" />
                  </span>
                }
              >
                Contact Support Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

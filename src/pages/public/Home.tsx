import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { HowItWorksSticky } from '@/components/landing/HowItWorksSticky';
import { RanksTierSection } from '@/components/landing/RanksTierSection';
import { ServicesEditorialSection } from '@/components/landing/ServicesEditorialSection';
import { TestimonialMarquee } from '@/components/landing/TestimonialMarquee';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LuxuryFAQSection } from '@/components/landing/LuxuryFAQSection';

export const Home: React.FC = () => {
  const homeStructuredData = [
    {
      '@type': 'WebSite',
      '@id': 'https://dream-to-achievers.vercel.app/#website',
      url: 'https://dream-to-achievers.vercel.app/',
      name: 'Dream to Achievers',
      alternateName: ['DreamToAchievers', 'Dream to Achievers Official', 'Dream to Achievers B2B'],
      description: 'Verified B2B wholesale product distribution and reseller growth network in Pakistan.',
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': 'https://dream-to-achievers.vercel.app/#organization',
      name: 'Dream to Achievers',
      alternateName: 'DreamToAchievers',
      url: 'https://dream-to-achievers.vercel.app/',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://dream-to-achievers.vercel.app/#logo',
        url: 'https://dream-to-achievers.vercel.app/images/brand-logo.png',
        contentUrl: 'https://dream-to-achievers.vercel.app/images/brand-logo.png',
        caption: 'Dream to Achievers Official Brand Logo',
        width: '1024',
        height: '1024',
      },
      image: 'https://dream-to-achievers.vercel.app/images/brand-logo.png',
      description:
        'Official verified B2B wholesale commerce, product distribution, and reseller network platform founded by Faria Imran.',
      founder: {
        '@type': 'Person',
        name: 'Faria Imran',
        jobTitle: 'Founder & Executive Director',
        url: 'https://dream-to-achievers.vercel.app/founder/faria-imran',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'dreamtoachievers@gmail.com',
        telephone: '+92 305 4511395',
        availableLanguage: ['en', 'ur'],
      },
      sameAs: [
        'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N',
        'https://www.tiktok.com/@dream.to.achievers',
        'https://linkedin.com/company/dream-to-achievers',
        'https://youtube.com/@dreamtoachievers',
        'https://x.com/dreamtoachiever',
        'https://instagram.com/dreamtoachievers',
        'https://facebook.com/dreamtoachievers',
      ],
    },
    {
      '@type': 'Person',
      '@id': 'https://dream-to-achievers.vercel.app/founder/faria-imran#person',
      name: 'Faria Imran',
      jobTitle: 'Founder & Executive Director',
      worksFor: {
        '@id': 'https://dream-to-achievers.vercel.app/#organization',
      },
      url: 'https://dream-to-achievers.vercel.app/founder/faria-imran',
    },
  ];

  return (
    <div className="w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--champagne)]/25 selection:text-[var(--text-primary)]">
      <SEOHead
        title="Dream to Achievers | Verified B2B Wholesale Commerce & Reseller Network"
        description="Pakistan's verified wholesale distribution and online reselling ecosystem. Source authentic consumer SKUs, sell nationwide with COD, and earn guaranteed profit margins."
        canonicalPath="/"
        ogType="website"
        structuredData={homeStructuredData}
      />

      {/* 1. Hero Section (Full viewport, ambient parallax, serif headline, trust strip) */}
      <HeroSection />

      {/* 2. Categories Section (Editorial flat-lay tiles with clip-path reveals & champagne hover) */}
      <CategoriesSection />

      {/* 3. How It Works (Sticky/pinned section with macro packaging texture & activating steps) */}
      <HowItWorksSticky />

      {/* 4. Ranks & Milestones (Tiered glass cards, elevated tier scale, champagne border & glow) */}
      <RanksTierSection />

      {/* 5. Services + About (Alternating image/text rows with clip-path reveals) */}
      <ServicesEditorialSection />

      {/* 6. Social Proof (Verified partner testimonials in a slow marquee that pauses on hover) */}
      <TestimonialMarquee />

      {/* 7. Frequently Asked Questions (Luxury Accordion) */}
      <LuxuryFAQSection />

      {/* 8. Final Conversion CTA (Large serif statement over dark ambient warehouse image) */}
      <FinalCTASection />
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  ShieldCheck,
  CheckCircle,
  WhatsappLogo,
  EnvelopeSimple,
  ChatsCircle,
  Package,
  Truck,
  Wallet,
  ArrowRight,
} from '@phosphor-icons/react';

export const FounderPage: React.FC = () => {
  const siteConfig = useSiteSettings();
  const whatsappNumber = siteConfig.whatsappNumber || '+92 305 4511395';
  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '');
  const supportEmail = siteConfig.supportEmail || 'dreamtoachievers@gmail.com';
  const whatsappChannelUrl = siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N';

  const founderWhatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Faria Imran, I am reaching out through Dream to Achievers regarding partner opportunities and wholesale collaboration.'
  )}`;

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://dream-to-achievers.vercel.app/founder/faria-imran#person',
    name: 'Faria Imran',
    jobTitle: 'Founder & Executive Director',
    worksFor: {
      '@type': 'Organization',
      '@id': 'https://dream-to-achievers.vercel.app/#organization',
      name: 'Dream to Achievers',
      url: 'https://dream-to-achievers.vercel.app/',
      logo: 'https://dream-to-achievers.vercel.app/images/brand-logo.png',
    },
    url: 'https://dream-to-achievers.vercel.app/founder/faria-imran',
    image: 'https://dream-to-achievers.vercel.app/images/faria-imran.webp',
    description:
      'Faria Imran is the Founder & Executive Director of Dream to Achievers, a verified B2B wholesale commerce and partner growth platform in Pakistan.',
    sameAs: [
      siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N',
      siteConfig.linkedinUrl || 'https://linkedin.com/company/dream-to-achievers',
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Faria Imran — Founder of Dream to Achievers | Leadership Profile"
        description="Official profile of Faria Imran, Founder & Executive Director of Dream to Achievers. Learn about her mission building Pakistan's verified B2B wholesale platform."
        canonicalPath="/founder/faria-imran"
        ogType="profile"
        ogImage="https://dream-to-achievers.vercel.app/images/faria-imran.webp"
        ogImageAlt="Faria Imran — Founder & Executive Director of Dream to Achievers"
        structuredData={personSchema}
      />

      {/* 1. Header & Breadcrumbs */}
      <section className="px-6 sm:px-8 pt-10 pb-8 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09]">
        <div className="max-w-[1180px] mx-auto space-y-4">
          <Breadcrumbs items={[{ label: 'About', href: '/about' }, { label: 'Faria Imran' }]} />

          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
              <ShieldCheck size={13} weight="bold" />
              <span>Founder &amp; Executive Leadership</span>
            </div>
            <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.1]">
              Faria Imran — Founder of Dream to Achievers
            </h1>
            <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
              Founder &amp; Executive Director driving wholesale commerce innovation and accessible reselling infrastructure in Pakistan.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Executive Profile Grid */}
      <main className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="rounded-3xl bg-[#0D1512]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-10 shadow-xl space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
            
            {/* Left Column: Portrait and Verified Credentials */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-[#070B09] border border-[#D9C08A]/30 relative shadow-xl group">
                <div className="aspect-[4/5] relative w-full overflow-hidden">
                  <img
                    src="/images/faria-imran.webp"
                    alt="Faria Imran — Founder & Executive Director of Dream to Achievers"
                    width={480}
                    height={600}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/faria-imran.jpg';
                    }}
                  />
                </div>

                <div className="absolute bottom-3 inset-x-3 p-3.5 rounded-xl bg-[#070B09]/90 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-lg">
                  <div>
                    <h2 className="font-serif font-medium text-[#F4F7F5] text-base">Faria Imran</h2>
                    <p className="text-[11px] text-[#9EABA2]">Founder &amp; Executive Director</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-semibold text-[#34D399] bg-[#34D399]/15 border border-[#34D399]/30 px-2.5 py-1 rounded-full">
                    Verified Entity
                  </span>
                </div>
              </div>

              {/* Direct Leadership Contact Card */}
              <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08] space-y-3 text-xs">
                <span className="font-serif font-medium text-xs text-[#F4F7F5] block">
                  Official Founder Desks
                </span>
                <div className="space-y-2">
                  <a
                    href={founderWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1512] border border-white/10 hover:border-[#D9C08A]/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <WhatsappLogo size={16} className="text-[#34D399]" />
                      <span className="font-medium text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors">WhatsApp Founder Desk</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#9EABA2]">Connect &rarr;</span>
                  </a>

                  <a
                    href={`mailto:${supportEmail}?subject=Founder%20Inquiry%20-%20Faria%20Imran`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D1512] border border-white/10 hover:border-[#D9C08A]/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <EnvelopeSimple size={16} className="text-[#D9C08A]" />
                      <span className="font-medium text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors">Executive Email</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#9EABA2]">Write &rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative Biography & Vision */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#D9C08A] font-semibold block">
                  Executive Vision
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-normal text-[#F4F7F5] tracking-tight leading-snug">
                  "We built Dream to Achievers to eliminate the capital and logistics barriers that hold Pakistani entrepreneurs back."
                </h2>
                <p className="text-xs font-mono text-[#9EABA2]">
                  — Faria Imran, Founder of Dream to Achievers
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
                <p>
                  <strong className="text-[#F4F7F5]">Faria Imran</strong> is an entrepreneur and digital business strategist who founded <strong className="text-[#F4F7F5]">Dream to Achievers</strong> with a singular focus: making online wholesale reselling accessible, transparent, and profitable for everyone in Pakistan.
                </p>
                <p>
                  Observing that aspiring resellers and micro-entrepreneurs routinely face three crippling hurdles—lack of upfront capital to purchase bulk inventory, absence of storage facilities, and complex courier delivery logistics—she designed the Dream to Achievers platform to handle the entire operational backend.
                </p>
                <p>
                  Under her leadership, Dream to Achievers manages direct manufacturer sourcing, batch quality verification, warehousing, and nationwide Cash on Delivery (COD) dispatch across 150+ Pakistani cities. This structure allows independent partners to focus entirely on marketing and customer service, while earning fixed, transparent profit margins and milestone cash rewards up to PKR 10,000.
                </p>
              </div>

              {/* Verified Platform Pillars Under Faria Imran */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <h3 className="font-serif font-medium text-base text-[#F4F7F5]">
                  Core Operational Principles Established by the Founder
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F7F5]">
                      <Package size={15} className="text-[#34D399]" weight="bold" />
                      <span>Zero Inventory Risk</span>
                    </div>
                    <p className="text-[11px] text-[#9EABA2] leading-relaxed">
                      Partners never purchase dead stock in advance. Sourcing happens on-demand.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F7F5]">
                      <Truck size={15} className="text-[#34D399]" weight="bold" />
                      <span>150+ Cities COD</span>
                    </div>
                    <p className="text-[11px] text-[#9EABA2] leading-relaxed">
                      Centralized courier packaging, tracking, and cash collection nationwide.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F7F5]">
                      <Wallet size={15} className="text-[#D9C08A]" weight="bold" />
                      <span>Direct Profit Ledgers</span>
                    </div>
                    <p className="text-[11px] text-[#9EABA2] leading-relaxed">
                      Unit margins (+PKR 500–1,300) credited directly to partner dashboard wallets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a href={founderWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="champagne" size="md" iconLeft={<WhatsappLogo size={16} />}>
                    Connect on WhatsApp Desk
                  </Button>
                </a>
                <Link to="/how-it-works">
                  <Button variant="outline" size="md" className="border-white/15 hover:border-[#D9C08A]/40 text-[#F4F7F5]" iconRight={<ArrowRight size={13} />}>
                    Explore How It Works
                  </Button>
                </Link>
                <Link to="/signup">
                  <span className="text-xs font-medium text-[#D9C08A] hover:underline flex items-center gap-1 font-mono">
                    Join Partner Program &rarr;
                  </span>
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Entity Information & Relationship Card for Google Search */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#34D399]">
            <CheckCircle size={15} weight="bold" />
            <span>Official Entity Verification &amp; Governance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08]">
              <span className="text-[10.5px] text-[#9EABA2] font-mono block">Founder / Director</span>
              <strong className="text-[#F4F7F5] text-sm font-serif">Faria Imran</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08]">
              <span className="text-[10.5px] text-[#9EABA2] font-mono block">Official Platform</span>
              <strong className="text-[#F4F7F5] text-sm font-serif">Dream to Achievers</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08]">
              <span className="text-[10.5px] text-[#9EABA2] font-mono block">Business Category</span>
              <strong className="text-[#F4F7F5] text-sm font-serif">B2B Wholesale Platform</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-white/[0.08]">
              <span className="text-[10.5px] text-[#9EABA2] font-mono block">Production Domain</span>
              <strong className="text-[#D9C08A] text-xs font-mono truncate block mt-0.5">
                dream-to-achievers.vercel.app
              </strong>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default FounderPage;

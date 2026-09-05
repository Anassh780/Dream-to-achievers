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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
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
      <section className="px-6 sm:px-8 pt-10 pb-8 border-b border-[#E3DCC8] bg-[#F1ECDD]">
        <div className="max-w-[1180px] mx-auto space-y-4">
          <Breadcrumbs items={[{ label: 'About', href: '/about' }, { label: 'Faria Imran' }]} />

          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
              <ShieldCheck size={13} weight="bold" />
              <span>Founder &amp; Executive Leadership</span>
            </div>
            <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
              Faria Imran — Founder of Dream to Achievers
            </h1>
            <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
              Founder &amp; Executive Director driving wholesale commerce innovation and accessible reselling infrastructure in Pakistan.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Executive Profile Grid */}
      <main className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-12 space-y-12">
        <div className="rounded-3xl bg-white border border-[#E3DCC8] p-6 sm:p-10 shadow-xs space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
            
            {/* Left Column: Portrait and Verified Credentials */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden bg-[#FAF7EF] border border-[#E3DCC8] relative shadow-xs">
                <div className="aspect-[4/5] relative w-full overflow-hidden">
                  <img
                    src="/images/faria-imran.webp"
                    alt="Faria Imran — Founder & Executive Director of Dream to Achievers"
                    width={480}
                    height={600}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/faria-imran.jpg';
                    }}
                  />
                </div>

                <div className="absolute bottom-3 inset-x-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E3DCC8] flex items-center justify-between shadow-xs">
                  <div>
                    <h2 className="font-serif font-semibold text-[#1E241F] text-base">Faria Imran</h2>
                    <p className="text-[11px] text-[#5B5C50]">Founder &amp; Executive Director</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-semibold text-[#1F4D3E] bg-[#1F4D3E]/10 border border-[#1F4D3E]/20 px-2.5 py-1 rounded-full">
                    Verified Entity
                  </span>
                </div>
              </div>

              {/* Direct Leadership Contact Card */}
              <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-3 text-xs">
                <span className="font-serif font-semibold text-xs text-[#1E241F] block">
                  Official Founder Desks
                </span>
                <div className="space-y-2">
                  <a
                    href={founderWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E3DCC8] hover:border-[#1F4D3E] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <WhatsappLogo size={16} className="text-[#1F4D3E]" />
                      <span className="font-medium text-[#1E241F]">WhatsApp Founder Desk</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#7C7D70]">Connect &rarr;</span>
                  </a>

                  <a
                    href={`mailto:${supportEmail}?subject=Founder%20Inquiry%20-%20Faria%20Imran`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E3DCC8] hover:border-[#1F4D3E] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <EnvelopeSimple size={16} className="text-[#1F4D3E]" />
                      <span className="font-medium text-[#1E241F]">Executive Email</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#7C7D70]">Write &rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative Biography & Vision */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#B8862E] font-medium block">
                  Executive Vision
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-medium text-[#1E241F] tracking-tight leading-snug">
                  "We built Dream to Achievers to eliminate the capital and logistics barriers that hold Pakistani entrepreneurs back."
                </h2>
                <p className="text-xs font-mono text-[#5B5C50]">
                  — Faria Imran, Founder of Dream to Achievers
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                <p>
                  <strong>Faria Imran</strong> is an entrepreneur and digital business strategist who founded <strong>Dream to Achievers</strong> with a singular focus: making online wholesale reselling accessible, transparent, and profitable for everyone in Pakistan.
                </p>
                <p>
                  Observing that aspiring resellers and micro-entrepreneurs routinely face three crippling hurdles—lack of upfront capital to purchase bulk inventory, absence of storage facilities, and complex courier delivery logistics—she designed the Dream to Achievers platform to handle the entire operational backend.
                </p>
                <p>
                  Under her leadership, Dream to Achievers manages direct manufacturer sourcing, batch quality verification, warehousing, and nationwide Cash on Delivery (COD) dispatch across 150+ Pakistani cities. This structure allows independent partners to focus entirely on marketing and customer service, while earning fixed, transparent profit margins and milestone cash rewards up to PKR 10,000.
                </p>
              </div>

              {/* Verified Platform Pillars Under Faria Imran */}
              <div className="pt-2 border-t border-[#E3DCC8] space-y-3">
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Core Operational Principles Established by the Founder
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E241F]">
                      <Package size={15} className="text-[#1F4D3E]" weight="bold" />
                      <span>Zero Inventory Risk</span>
                    </div>
                    <p className="text-[11px] text-[#5B5C50] leading-relaxed">
                      Partners never purchase dead stock in advance. Sourcing happens on-demand.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E241F]">
                      <Truck size={15} className="text-[#1F4D3E]" weight="bold" />
                      <span>150+ Cities COD</span>
                    </div>
                    <p className="text-[11px] text-[#5B5C50] leading-relaxed">
                      Centralized courier packaging, tracking, and cash collection nationwide.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E241F]">
                      <Wallet size={15} className="text-[#1F4D3E]" weight="bold" />
                      <span>Direct Profit Ledgers</span>
                    </div>
                    <p className="text-[11px] text-[#5B5C50] leading-relaxed">
                      Unit margins (+PKR 500–1,300) credited directly to partner dashboard wallets.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a href={founderWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="md" iconLeft={<WhatsappLogo size={16} />}>
                    Connect on WhatsApp Desk
                  </Button>
                </a>
                <Link to="/how-it-works">
                  <Button variant="outline" size="md" iconRight={<ArrowRight size={13} />}>
                    Explore How It Works
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="ghost" size="md" className="text-[#1F4D3E] font-medium">
                    Join Partner Program &rarr;
                  </Button>
                </Link>
              </div>

            </div>

          </div>

        </div>

        {/* 3. Entity Information & Relationship Card for Google Search */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#F1ECDD] border border-[#E3DCC8] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1F4D3E]">
            <CheckCircle size={15} weight="bold" />
            <span>Official Entity Verification &amp; Governance</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8]">
              <span className="text-[10.5px] text-[#5B5C50] font-mono block">Founder / Director</span>
              <strong className="text-[#1E241F] text-sm font-serif">Faria Imran</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8]">
              <span className="text-[10.5px] text-[#5B5C50] font-mono block">Official Platform</span>
              <strong className="text-[#1E241F] text-sm font-serif">Dream to Achievers</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8]">
              <span className="text-[10.5px] text-[#5B5C50] font-mono block">Business Category</span>
              <strong className="text-[#1E241F] text-sm font-serif">B2B Wholesale Platform</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8]">
              <span className="text-[10.5px] text-[#5B5C50] font-mono block">Production Domain</span>
              <strong className="text-[#1F4D3E] text-xs font-mono truncate block">
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

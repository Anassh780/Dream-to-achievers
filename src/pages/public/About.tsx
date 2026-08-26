import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  EnvelopeSimple,
  ChatsCircle,
} from '@phosphor-icons/react';

export const About: React.FC = () => {
  const siteConfig = useSiteSettings();
  const whatsappChannelUrl = siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N';
  const supportEmail = siteConfig.supportEmail || 'dreamtoachievers@gmail.com';

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. Clean Page Header */}
      <section className="px-6 sm:px-8 pt-16 pb-12 border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto text-center max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4D3E]/8 border border-[#1F4D3E]/15 text-[#1F4D3E] text-xs font-medium">
            <ShieldCheck size={13} weight="bold" />
            <span>Leadership &amp; Founder</span>
          </div>
          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#1E241F] tracking-tight leading-[1.1]">
            About the Founder
          </h1>
          <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed max-w-md mx-auto">
            Meet Faria Imran, the entrepreneur and executive director behind Dream to Achievers.
          </p>
        </div>
      </section>

      {/* 2. Main Owner Profile & Narrative Card */}
      <div className="max-w-[1000px] mx-auto px-6 sm:px-8 pt-12">
        <div className="rounded-3xl bg-white border border-[#E3DCC8] p-6 sm:p-10 shadow-xs space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            
            {/* Left Column: Authentic Portrait Frame */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden bg-[#FAF7EF] border border-[#E3DCC8] relative shadow-xs">
                <div className="aspect-[4/5] relative w-full overflow-hidden">
                  <img
                    src="/images/faria-imran.webp"
                    alt="Faria Imran — Founder & Executive Director"
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/faria-imran.jpg';
                    }}
                  />
                </div>

                <div className="absolute bottom-3 inset-x-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E3DCC8] flex items-center justify-between shadow-xs">
                  <div>
                    <h3 className="font-serif font-semibold text-[#1E241F] text-base">Faria Imran</h3>
                    <p className="text-[11px] text-[#5B5C50]">Founder &amp; Executive Director</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-semibold text-[#1F4D3E] bg-[#1F4D3E]/10 border border-[#1F4D3E]/20 px-2.5 py-1 rounded-full">
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Founder Narrative & Vision */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight leading-snug">
                  "Empowering every individual in Pakistan to build a profitable reselling business."
                </h2>
                <p className="text-xs font-mono uppercase tracking-wider text-[#B8862E] font-medium">
                  — Faria Imran
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                <p>
                  Faria Imran is an entrepreneur and digital commerce strategist who founded <strong>Dream to Achievers</strong> with a clear mission: eliminate the traditional barriers of online selling in Pakistan.
                </p>
                <p>
                  Recognizing that most aspiring resellers struggle with upfront bulk capital, warehouse space, and courier delivery management, she built Dream to Achievers to handle full product sourcing, packaging, and nationwide Cash on Delivery (COD) logistics — enabling independent partners to earn reliable profit margins directly from their phones.
                </p>
              </div>

              {/* Verified Achievements Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-center font-mono">
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                  <p className="text-base sm:text-lg font-bold text-[#1E241F]">25M+</p>
                  <p className="text-[10px] text-[#5B5C50] font-sans">Organic Views</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8]">
                  <p className="text-base sm:text-lg font-bold text-[#1F4D3E]">150+</p>
                  <p className="text-[10px] text-[#5B5C50] font-sans">Cities Delivered</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] col-span-2 sm:col-span-1">
                  <p className="text-base sm:text-lg font-bold text-[#B8862E]">100%</p>
                  <p className="text-[10px] text-[#5B5C50] font-sans">Profit Transparency</p>
                </div>
              </div>
            </div>

          </div>

          {/* 3. Three Core Commitments */}
          <div className="pt-6 border-t border-[#E3DCC8] grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E]" />
                <span>Zero Inventory Risk</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">
                Partners never buy dead stock. Only sell what your customers order.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E]" />
                <span>Automated COD Logistics</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">
                Centralized courier dispatch handles delivery and cash collection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E241F]">
                <CheckCircle size={15} weight="bold" className="text-[#1F4D3E]" />
                <span>Guaranteed Payouts</span>
              </div>
              <p className="text-[11.5px] text-[#5B5C50]">
                Unit margins and rank bonuses are deposited directly to your wallet.
              </p>
            </div>
          </div>

          {/* 4. Connect Channels */}
          <div className="pt-6 border-t border-[#E3DCC8] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="primary" size="md" iconLeft={<ChatsCircle size={16} />}>
                  Join Official WhatsApp Channel
                </Button>
              </a>

              <a
                href={`mailto:${supportEmail}?subject=Inquiry%20for%20Faria%20Imran%20-%20Dream%20To%20Achievers`}
              >
                <Button variant="outline" size="md" iconLeft={<EnvelopeSimple size={16} />}>
                  Send Email Query
                </Button>
              </a>
            </div>

            <Link to="/signup">
              <span className="text-xs font-medium text-[#1F4D3E] hover:underline flex items-center gap-1 font-mono">
                Become a Partner &rarr;
              </span>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default About;

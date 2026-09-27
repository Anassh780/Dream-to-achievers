import React from 'react';
import { Link } from 'react-router-dom';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { SocialChannelsBar } from '@/components/ui/SocialIcons';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { WhatsappLogo, ArrowUpRight } from '@phosphor-icons/react';

export const LuxuryFooter: React.FC = () => {
  const siteConfig = useSiteSettings();

  return (
    <footer className="relative border-t border-[var(--champagne-hairline)] bg-[var(--bg-elevated)] pt-20 pb-12 overflow-hidden text-xs text-[var(--text-muted)]">
      {/* Soft Emerald Radial Glow (No Photo) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none rounded-full blur-[110px] opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(15, 107, 71, 0.1) 45%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-8 space-y-16">
        
        {/* Top Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Col 1 & 2: Brand & Credibility */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block group focus-visible:outline-none">
              <div className="flex items-center gap-2.5">
                <DreamLogo size={36} />
                <span className="font-serif text-lg font-medium tracking-tight text-[var(--text-primary)]">
                  Dream to Achievers
                </span>
              </div>
            </Link>

            <p className="text-xs text-[var(--text-muted)] max-w-sm leading-[1.7]">
              Pakistan's premier direct-to-reseller B2B wholesale platform. Verified catalog pricing, nationwide cash on delivery logistics, and transparent milestone reward payouts.
            </p>

            <div className="space-y-2.5 pt-2">
              <span className="luxury-eyebrow text-[10px] text-[var(--text-primary)] block">
                Official Broadcast &amp; Channels:
              </span>
              <SocialChannelsBar size={16} />
            </div>
          </div>

          {/* Col 3: Wholesale Catalog */}
          <div className="space-y-3">
            <span className="luxury-eyebrow text-[10.5px] text-[var(--champagne)] block">
              Wholesale Catalog
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products?category=skincare" className="hover:text-[var(--text-primary)] transition-colors">
                  Skincare &amp; Cosmetics
                </Link>
              </li>
              <li>
                <Link to="/products?category=fragrances" className="hover:text-[var(--text-primary)] transition-colors">
                  Luxury Fragrances &amp; Attars
                </Link>
              </li>
              <li>
                <Link to="/products?category=electronics" className="hover:text-[var(--text-primary)] transition-colors">
                  Lifestyle Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=wellness" className="hover:text-[var(--text-primary)] transition-colors">
                  Personal Wellness
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[var(--champagne)] transition-colors flex items-center gap-1">
                  <span>All Verified SKUs</span>
                  <ArrowUpRight size={11} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Partner Program */}
          <div className="space-y-3">
            <span className="luxury-eyebrow text-[10.5px] text-[var(--champagne)] block">
              Partner Network
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/ranks" className="hover:text-[var(--text-primary)] transition-colors">
                  Milestone Cash Bonuses
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[var(--text-primary)] transition-colors">
                  Logistics &amp; Dispatch
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-[var(--text-primary)] transition-colors font-medium text-[var(--emerald)]">
                  Become a Partner (Free)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Desk & Support */}
          <div className="space-y-3">
            <span className="luxury-eyebrow text-[10.5px] text-[var(--champagne)] block">
              Desk &amp; Support
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
                >
                  <WhatsappLogo size={14} className="text-[var(--emerald)]" />
                  <span>WhatsApp VIP Channel</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}?subject=Partner%20Inquiry`}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  Email Executive Desk
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Contact &amp; Location
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  About Founder
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[11px] font-mono text-[var(--champagne)] hover:underline inline-flex items-center gap-1">
                  <span>Admin Gateway</span>
                  <ArrowUpRight size={10} />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Hairline Divider */}
        <div className="pt-8 border-t border-[var(--champagne-hairline)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Dream to Achievers (DTA). All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link to="/disclaimer" className="hover:text-[var(--text-primary)] transition-colors">
              Disclaimer
            </Link>
            <span className="text-[var(--champagne)]">Verified Wholesale Pakistan</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

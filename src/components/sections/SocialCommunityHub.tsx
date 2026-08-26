import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/Button';
import {
  WhatsappLogo,
  EnvelopeSimple,
  ArrowSquareOut,
  Sparkle,
  CheckCircle,
  Megaphone,
  ChatCircleDots,
} from '@phosphor-icons/react';

// Custom Crisp TikTok SVG Icon
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.3 6.3 0 0 0 1.86-4.47V8.62a8.27 8.27 0 0 0 4.85 1.57v-3.5h-.93z" />
  </svg>
);

export const SocialCommunityHub: React.FC = () => {
  const siteConfig = useSiteSettings();
  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const directWhatsAppUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Dream to Achievers team, I would like to connect directly regarding the partner network.'
  )}`;

  const channels = [
    {
      id: 'tiktok',
      title: 'Official TikTok',
      handle: '@dream.to.achievers',
      link: siteConfig.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers',
      category: 'VIDEO CHANNELS',
      badge: 'Daily Content',
      desc: 'Watch daily product demonstration reels, direct selling tips, viral marketing playbooks, and partner achievements.',
      highlights: ['Product showcase reels', 'Organic viral strategies', 'Live partner milestones'],
      icon: TikTokIcon,
      buttonText: 'Follow on TikTok',
    },
    {
      id: 'whatsapp-channel',
      title: 'WhatsApp VIP Channel',
      handle: 'DreamToAchievers Broadcast',
      link: siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N',
      category: 'OFFICIAL BROADCAST',
      badge: 'Verified Channel',
      desc: 'Get immediate notifications on new wholesale stock arrivals, special flash margin bonuses, and leadership announcements.',
      highlights: ['Real-time inventory drops', 'Flash margin bonuses', 'Instant announcements'],
      icon: Megaphone,
      buttonText: 'Join VIP Channel',
    },
    {
      id: 'email-support',
      title: 'Official Support Desk',
      handle: siteConfig.supportEmail || 'dreamtoachievers@gmail.com',
      link: `mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`,
      category: 'ADMIN & SUPPORT',
      badge: 'Direct Desk',
      desc: 'Connect with our administration team for account onboarding, bulk order procurement, and payment verification.',
      highlights: ['Executive inquiries', 'Bulk catalog sourcing', 'Payout confirmations'],
      icon: EnvelopeSimple,
      buttonText: 'Email Support Team',
    },
    {
      id: 'whatsapp-chat',
      title: 'Direct WhatsApp Chat',
      handle: siteConfig.whatsappNumber || '+92 305 4511395',
      link: directWhatsAppUrl,
      category: '1-ON-1 CONSULTATION',
      badge: 'Fast Response',
      desc: 'Direct one-on-one communication with our onboarding team to answer all questions before you begin.',
      highlights: ['Personal onboarding', 'Product catalog PDFs', 'Immediate assistance'],
      icon: ChatCircleDots,
      buttonText: 'Chat on WhatsApp',
    },
  ];

  return (
    <section id="community" className="w-full py-18 font-sans bg-[#FAF7EF] border-t border-[#E3DCC8]">
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E3DCC8]">
          <div className="space-y-2">
            <div className="eyebrow">
              <Sparkle size={13} weight="bold" />
              <span>Official Channels</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F] tracking-tight">
              Connect With Our Official Community &amp; Desks
            </h2>
            <p className="text-xs sm:text-sm text-[#5B5C50] max-w-xl leading-relaxed">
              Stay updated with product releases, viral video playbooks, and verified announcements across our official network.
            </p>
          </div>
        </div>

        {/* 4 Clean Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className="rounded-2xl bg-white border border-[#E3DCC8] hover:border-[#D2C8AF] hover:-translate-y-0.5 p-6 flex flex-col justify-between space-y-6 transition-all duration-200 shadow-xs"
              >
                <div className="space-y-4">
                  {/* Top Bar with Category & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#7C7D70] tracking-wider uppercase font-semibold">
                      {ch.category}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF7EF] text-[#1F4D3E] border border-[#E3DCC8]">
                      {ch.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start space-x-3.5 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center shrink-0 text-[#1F4D3E]">
                      <Icon size={20} />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h3 className="font-serif font-semibold text-sm text-[#1E241F] truncate">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] font-mono text-[#5B5C50] truncate">
                        {ch.handle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#5B5C50] leading-relaxed min-h-[3rem]">
                    {ch.desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-[#E3DCC8]">
                    {ch.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[11px] text-[#1E241F]">
                        <CheckCircle size={13} weight="bold" className="text-[#1F4D3E] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* External Action Button */}
                <div className="pt-2">
                  <a
                    href={ch.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between text-xs font-medium"
                    >
                      <span>{ch.buttonText}</span>
                      <ArrowSquareOut size={14} />
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

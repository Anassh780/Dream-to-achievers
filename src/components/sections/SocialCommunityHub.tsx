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

// Custom Crisp TikTok SVG Icon for high visual fidelity
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
      category: 'VIDEO COMMUNITY',
      badge: 'Daily Content',
      badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
      desc: 'Watch daily product demonstration reels, direct selling tips, viral marketing playbooks, and partner rank achievements.',
      highlights: ['Product showcase reels', 'Organic viral strategies', 'Live partner milestones'],
      icon: TikTokIcon,
      iconContainerClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25 group-hover:border-rose-400 group-hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
      buttonText: 'Follow on TikTok',
      buttonVariant: 'secondary' as const,
    },
    {
      id: 'whatsapp-channel',
      title: 'WhatsApp VIP Channel',
      handle: 'Dream to Achievers Broadcast',
      link: siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N',
      category: 'OFFICIAL BROADCAST',
      badge: 'Verified Channel',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      desc: 'Get immediate notifications on new wholesale stock arrivals, special flash margin bonuses, and leadership announcements.',
      highlights: ['Real-time inventory drops', 'Flash margin bonuses', 'Instant announcements'],
      icon: Megaphone,
      iconContainerClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 group-hover:border-emerald-400 group-hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      buttonText: 'Join WhatsApp Channel',
      buttonVariant: 'emerald' as const,
    },
    {
      id: 'email-support',
      title: 'Official Support Desk',
      handle: siteConfig.supportEmail || 'dreamtoachievers@gmail.com',
      link: `mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`,
      category: 'ADMIN & SUPPORT',
      badge: '24/7 Desk',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25 shadow-[0_0_10px_rgba(0,242,254,0.2)]',
      desc: 'Connect with our administration team for account onboarding, bulk order procurement, and payment verification.',
      highlights: ['Executive inquiries', 'Bulk catalog sourcing', 'Payout confirmations'],
      icon: EnvelopeSimple,
      iconContainerClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(0,242,254,0.2)]',
      buttonText: 'Email Support Team',
      buttonVariant: 'outline' as const,
    },
    {
      id: 'whatsapp-chat',
      title: 'Direct WhatsApp Chat',
      handle: siteConfig.whatsappNumber || '+92 305 4511395',
      link: directWhatsAppUrl,
      category: '1-ON-1 CONSULTATION',
      badge: 'Fast Response',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
      desc: 'Direct one-on-one communication with our onboarding team to answer all questions before you begin.',
      highlights: ['Personal onboarding', 'Product catalog PDFs', 'Immediate assistance'],
      icon: ChatCircleDots,
      iconContainerClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 group-hover:border-emerald-400 group-hover:bg-emerald-500/20',
      buttonText: 'Chat on WhatsApp',
      buttonVariant: 'secondary' as const,
    },
  ];

  return (
    <section id="community" className="w-full py-20 sm:py-28 font-sans bg-[#040814] border-y border-white/[0.08] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkle size={12} weight="fill" className="text-cyan-400 animate-pulse" />
              <span>Official Channels</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-outfit font-bold text-white tracking-tight">
              Connect With Our Official Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Stay updated with product releases, viral video playbooks, and verified announcements across our official network.
            </p>
          </div>
        </div>

        {/* 4 Clean, Balanced Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.id}
                className="group relative rounded-3xl bg-[#080E1E] border border-white/[0.08] hover:border-cyan-400/30 p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 shadow-xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.1)]"
              >
                <div className="space-y-4">
                  {/* Top Bar with Category & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase font-semibold">
                      {ch.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${ch.badgeClass}`}>
                      {ch.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start space-x-3.5 pt-1">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 ${ch.iconContainerClass}`}>
                      <Icon size={22} weight="fill" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-400 transition-colors truncate">
                        {ch.title}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {ch.handle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                    {ch.desc}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                    {ch.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[11px] text-slate-200">
                        <CheckCircle size={13} weight="fill" className="text-cyan-400 shrink-0" />
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
                      variant={ch.buttonVariant}
                      size="sm"
                      className="w-full justify-between rounded-xl text-xs font-semibold group/btn"
                    >
                      <span>{ch.buttonText}</span>
                      <ArrowSquareOut size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
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

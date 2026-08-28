import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// 1. YouTube Official Icon
export const YouTubeIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// 2. X (formerly Twitter) Official Modern Icon
export const XIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// 3. Instagram Official Icon
export const InstagramIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2.5" />
  </svg>
);

// 4. LinkedIn Official Icon
export const LinkedInIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

// 5. Threads Official Icon
export const ThreadsIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12.186 24C5.464 24 0 18.536 0 11.814 0 5.092 5.464 0 12.186 0c6.722 0 12.186 5.464 12.186 11.814 0 .684-.057 1.353-.167 2.004h-4.305c.045-.27.068-.546.068-.828 0-4.3-3.487-7.787-7.782-7.787-4.296 0-7.783 3.487-7.783 7.787 0 4.3 3.487 7.787 7.783 7.787 1.776 0 3.415-.596 4.733-1.603l2.844 2.844C17.75 23.11 15.068 24 12.186 24zm4.218-10.875c-.29-2.617-2.485-4.66-5.185-4.66-2.88 0-5.215 2.336-5.215 5.216 0 2.88 2.336 5.215 5.215 5.215 1.558 0 2.955-.688 3.916-1.78l-2.42-2.42c-.417.472-.924.764-1.496.764-1.127 0-2.04-.913-2.04-2.04 0-1.128.913-2.04 2.04-2.04 1.055 0 1.92.798 2.025 1.83l3.16.115z" />
  </svg>
);

// 6. Facebook Official Icon
export const FacebookIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// 7. TikTok Official Icon
export const TikTokIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98v8.68c-.02 1.93-.66 3.86-1.89 5.37-1.48 1.83-3.77 2.94-6.13 2.93-2.74-.01-5.32-1.46-6.73-3.8-1.42-2.35-1.39-5.38.08-7.7 1.48-2.34 4.14-3.72 6.9-3.56.03 1.37.01 2.74.01 4.11-1.3-.13-2.65.31-3.54 1.25-.89.94-1.22 2.29-.86 3.51.36 1.22 1.46 2.12 2.73 2.23 1.27.11 2.53-.54 3.12-1.66.38-.72.48-1.55.48-2.36V.02h1.56z" />
  </svg>
);

// 8. WhatsApp Official Icon
export const WhatsAppIcon: React.FC<SocialIconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export interface SocialChannelsBarProps {
  className?: string;
  size?: number;
  showLabels?: boolean;
}

/**
 * Reusable Universal Social Channels Strip connected dynamically to Admin CMS settings
 */
export const SocialChannelsBar: React.FC<SocialChannelsBarProps> = ({
  className = '',
  size = 18,
  showLabels = false,
}) => {
  const siteConfig = useSiteSettings();

  const channels = [
    {
      name: 'YouTube',
      url: siteConfig.youtubeUrl || 'https://youtube.com/@dreamtoachievers',
      icon: YouTubeIcon,
      hoverClass: 'hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5',
    },
    {
      name: 'X (Twitter)',
      url: siteConfig.xUrl || 'https://x.com/dreamtoachiever',
      icon: XIcon,
      hoverClass: 'hover:text-[#1E241F] dark:hover:text-white hover:border-[#1E241F]/40 hover:bg-black/5 dark:hover:bg-white/5',
    },
    {
      name: 'Instagram',
      url: siteConfig.instagramUrl || 'https://instagram.com/dreamtoachievers',
      icon: InstagramIcon,
      hoverClass: 'hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5',
    },
    {
      name: 'LinkedIn',
      url: siteConfig.linkedinUrl || 'https://linkedin.com/company/dream-to-achievers',
      icon: LinkedInIcon,
      hoverClass: 'hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5',
    },
    {
      name: 'Threads',
      url: siteConfig.threadsUrl || 'https://threads.net/@dreamtoachievers',
      icon: ThreadsIcon,
      hoverClass: 'hover:text-[#1E241F] dark:hover:text-white hover:border-[#1E241F]/40 hover:bg-black/5 dark:hover:bg-white/5',
    },
    {
      name: 'Facebook',
      url: siteConfig.facebookUrl || 'https://facebook.com/dreamtoachievers',
      icon: FacebookIcon,
      hoverClass: 'hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5',
    },
    {
      name: 'TikTok',
      url: siteConfig.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers',
      icon: TikTokIcon,
      hoverClass: 'hover:text-[#FE2C55] hover:border-[#FE2C55]/40 hover:bg-[#FE2C55]/5',
    },
    {
      name: 'WhatsApp Channel',
      url: siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N',
      icon: WhatsAppIcon,
      hoverClass: 'hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5',
    },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {channels.map((channel) => {
        const Icon = channel.icon;
        return (
          <a
            key={channel.name}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Visit Dream to Achievers on ${channel.name}`}
            className={`p-2 rounded-xl bg-white dark:bg-[#17211C] border border-[#E3DCC8] dark:border-[#273830] text-[#5B5C50] dark:text-[#A3AFA8] transition-all duration-200 shadow-2xs ${channel.hoverClass} inline-flex items-center gap-2 text-xs font-medium`}
          >
            <Icon size={size} />
            {showLabels && <span className="text-[11.5px]">{channel.name}</span>}
          </a>
        );
      })}
    </div>
  );
};

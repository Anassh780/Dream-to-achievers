import React, { useState } from 'react';
import { ArrowRight, ArrowsClockwise, CheckCircle, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export interface CardFlipProps {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  impactBadge?: string;
  categoryNumber?: string;
  icon?: React.ReactNode;
  frontImage?: string;
  metric?: string;
  whatsappUrl?: string;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  title,
  subtitle,
  description,
  features,
  impactBadge,
  categoryNumber,
  icon,
  frontImage,
  metric,
  whatsappUrl,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="flip-card-container group relative h-[440px] w-full cursor-pointer select-none"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped((prev) => !prev);
        }
      }}
      aria-label={`${title} - Click or hover to flip and view details`}
    >
      <div className={cn("flip-card-inner", isFlipped && "is-flipped")}>
        
        {/* FRONT FACE — Luxury Liquid Glass Card */}
        <div className="flip-card-front bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-[#D9C08A]/40 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(217,192,138,0.1)] p-5 flex flex-col justify-between transition-all duration-300 rounded-2xl">
          <div className="space-y-3.5">
            {/* Top Badge Strip */}
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-mono uppercase px-2.5 py-1 rounded-md bg-[#131E1A] text-[#34D399] border border-white/10 font-medium tracking-wide">
                {categoryNumber || 'Service'}
              </span>
              {(metric || impactBadge) && (
                <span className="text-[10.5px] font-mono font-semibold text-[#D9C08A] bg-[#D9C08A]/10 border border-[#D9C08A]/30 px-2.5 py-1 rounded-md">
                  {metric || impactBadge}
                </span>
              )}
            </div>

            {/* Service Image Container */}
            {frontImage && (
              <div className="w-full h-40 rounded-xl overflow-hidden bg-[#070B09] border border-white/10 relative">
                <img
                  src={frontImage}
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.endsWith('.webp')) {
                      target.src = target.src.replace('.webp', '.png');
                    } else {
                      target.src = '/images/brand-logo.png';
                    }
                  }}
                />
              </div>
            )}

            {/* Title & Short Description */}
            <div className="space-y-1">
              <h3 className="font-serif font-medium text-base text-[#F4F7F5] leading-snug group-hover:text-[#D9C08A] transition-colors">
                {title}
              </h3>
              <p className="text-xs text-[#9EABA2] leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Bottom Flip Hint Bar */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#9EABA2]">
              <Sparkle size={13} className="text-[#D9C08A]" />
              <span>Tap / Hover to flip</span>
            </div>
            <div
              className="w-7 h-7 rounded-full bg-[#131E1A] border border-white/10 flex items-center justify-center text-[#D9C08A] group-hover:bg-[#D9C08A] group-hover:text-[#070B09] transition-colors shadow-2xs"
              title="Flip to view deliverables"
            >
              <ArrowsClockwise size={13} className="group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* BACK FACE — Dark Obsidian Liquid Glass Card */}
        <div className="flip-card-back bg-[#0D1512]/95 backdrop-blur-xl border border-[#D9C08A]/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)] p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 rounded-2xl">
          <div className="space-y-4">
            {/* Top Badge Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10.5px] font-mono uppercase px-2.5 py-1 rounded-md bg-[#131E1A] text-[#34D399] border border-white/10 font-medium tracking-wide">
                {categoryNumber || 'Capabilities'}
              </span>
              {(metric || impactBadge) && (
                <span className="text-[10.5px] font-mono font-semibold text-[#D9C08A] bg-[#D9C08A]/10 border border-[#D9C08A]/30 px-2.5 py-1 rounded-md">
                  {metric || impactBadge}
                </span>
              )}
            </div>

            {/* Title & Detail */}
            <div className="space-y-1">
              <h3 className="font-serif font-medium text-base text-[#F4F7F5] leading-snug">
                {title}
              </h3>
              <p className="text-xs text-[#9EABA2] leading-relaxed">
                {description}
              </p>
            </div>

            {/* Deliverables List */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-[#D9C08A] tracking-wider block font-semibold">
                Included Deliverables:
              </span>
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-[#F4F7F5]">
                    <CheckCircle
                      size={14}
                      weight="bold"
                      className="text-[#34D399] shrink-0 mt-0.5"
                    />
                    <span className="leading-snug text-[11.5px] text-[#C4D0C8]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-3 border-t border-white/10">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#10b981] hover:to-[#059669] text-white text-xs font-medium transition-all shadow-[0_4px_16px_rgba(5,150,105,0.3)] group/btn">
                  <span>Inquire via WhatsApp Desk</span>
                  <ArrowRight
                    size={13}
                    className="text-[#D9C08A] group-hover/btn:translate-x-1 transition-transform"
                  />
                </div>
              </a>
            ) : (
              <Link
                to="/services"
                onClick={(e) => e.stopPropagation()}
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#10b981] hover:to-[#059669] text-white text-xs font-medium transition-all shadow-[0_4px_16px_rgba(5,150,105,0.3)] group/btn">
                  <span>Explore Service Package</span>
                  <ArrowRight
                    size={13}
                    className="text-[#D9C08A] group-hover/btn:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardFlip;

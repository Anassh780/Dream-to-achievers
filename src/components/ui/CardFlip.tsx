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
        
        {/* FRONT FACE — Warm Editorial White Card */}
        <div className="flip-card-front bg-white border border-[#E3DCC8] shadow-xs hover:border-[#D2C8AF] hover:shadow-md p-5 flex flex-col justify-between transition-all duration-300 rounded-2xl">
          <div className="space-y-3.5">
            {/* Top Badge Strip */}
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-mono uppercase px-2.5 py-1 rounded-md bg-[#FAF7EF] text-[#1F4D3E] border border-[#E3DCC8] font-medium tracking-wide">
                {categoryNumber || 'Service'}
              </span>
              {(metric || impactBadge) && (
                <span className="text-[10.5px] font-mono font-semibold text-[#B8862E] bg-[#EFE2C4] px-2.5 py-1 rounded-md">
                  {metric || impactBadge}
                </span>
              )}
            </div>

            {/* Service Image Container */}
            {frontImage && (
              <div className="w-full h-40 rounded-xl overflow-hidden bg-[#FAF7EF] border border-[#E3DCC8] relative">
                <img
                  src={frontImage}
                  alt={title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
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
              <h3 className="font-sans font-semibold text-base text-[#1E241F] leading-snug">
                {title}
              </h3>
              <p className="text-xs text-[#5B5C50] leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Bottom Flip Hint Bar */}
          <div className="pt-3 border-t border-[#E3DCC8] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5B5C50]">
              <Sparkle size={13} className="text-[#B8862E]" />
              <span>Tap / Hover to flip</span>
            </div>
            <div
              className="w-7 h-7 rounded-full bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center text-[#1F4D3E] group-hover:bg-[#1F4D3E] group-hover:text-white transition-colors shadow-2xs"
              title="Flip to view deliverables"
            >
              <ArrowsClockwise size={13} className="group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* BACK FACE — Warm Ledger Sand Card */}
        <div className="flip-card-back bg-[#F1ECDD] border border-[#E3DCC8] shadow-md p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 rounded-2xl">
          <div className="space-y-4">
            {/* Top Badge Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <span className="text-[10.5px] font-mono uppercase px-2.5 py-1 rounded-md bg-white text-[#1F4D3E] border border-[#E3DCC8] font-medium tracking-wide">
                {categoryNumber || 'Capabilities'}
              </span>
              {(metric || impactBadge) && (
                <span className="text-[10.5px] font-mono font-semibold text-[#B8862E] bg-white px-2.5 py-1 rounded-md border border-[#E3DCC8]">
                  {metric || impactBadge}
                </span>
              )}
            </div>

            {/* Title & Detail */}
            <div className="space-y-1">
              <h3 className="font-sans font-semibold text-base text-[#1E241F] leading-snug">
                {title}
              </h3>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                {description}
              </p>
            </div>

            {/* Deliverables List */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-[#7C7D70] tracking-wider block font-semibold">
                Included Deliverables:
              </span>
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-[#1E241F]">
                    <CheckCircle
                      size={14}
                      weight="bold"
                      className="text-[#1F4D3E] shrink-0 mt-0.5"
                    />
                    <span className="leading-snug text-[11.5px]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-3 border-t border-[#E3DCC8]">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#1F4D3E] hover:bg-[#153A2E] text-white text-xs font-medium transition-colors shadow-xs group/btn">
                  <span>Inquire via WhatsApp Desk</span>
                  <ArrowRight
                    size={13}
                    className="text-[#EFE2C4] group-hover/btn:translate-x-1 transition-transform"
                  />
                </div>
              </a>
            ) : (
              <Link
                to="/services"
                onClick={(e) => e.stopPropagation()}
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#1F4D3E] hover:bg-[#153A2E] text-white text-xs font-medium transition-colors shadow-xs group/btn">
                  <span>Explore Service Package</span>
                  <ArrowRight
                    size={13}
                    className="text-[#EFE2C4] group-hover/btn:translate-x-1 transition-transform"
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

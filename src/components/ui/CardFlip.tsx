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
      className="flip-card-container group relative h-[420px] w-full cursor-pointer select-none"
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
        {/* FRONT FACE */}
        <div className="flip-card-front bg-[#17211C] border border-[#273830] shadow-md transition-all duration-300 group-hover:border-[#B8862E]/50 group-hover:shadow-xl">
          {frontImage ? (
            <div className="relative h-full w-full overflow-hidden bg-[#0F1512]">
              <img
                src={frontImage}
                alt={title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.endsWith('.webp')) {
                    target.src = target.src.replace('.webp', '.png');
                  } else {
                    target.src = '/images/logo.png';
                  }
                }}
              />

              {/* High-legibility gradient scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A100D] via-[#0A100D]/70 to-[#0A100D]/20" />

              {/* Top Header Floating Tags */}
              <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  {icon && (
                    <div className="p-2 rounded-xl bg-[#0A100D]/85 backdrop-blur-md border border-white/15 text-[#D4A043] shadow-xs">
                      {icon}
                    </div>
                  )}
                  {categoryNumber && (
                    <span className="text-[10.5px] font-mono text-white/90 uppercase font-semibold bg-[#0A100D]/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15 tracking-wider">
                      {categoryNumber}
                    </span>
                  )}
                </div>
                {(impactBadge || metric) && (
                  <span className="text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#B8862E]/25 text-[#EFE2C4] border border-[#B8862E]/40 backdrop-blur-md shadow-xs">
                    {impactBadge || metric}
                  </span>
                )}
              </div>

              {/* Bottom Details Banner */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10 space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-serif font-medium text-lg sm:text-xl text-white leading-tight">
                      {title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-slate-300 leading-relaxed font-sans">
                      {subtitle}
                    </p>
                  </div>
                  <div
                    className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:rotate-180 transition-transform duration-500 shadow-md"
                    title="Click or hover to flip"
                  >
                    <ArrowsClockwise size={16} />
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-[10.5px] font-mono text-[#D4A043] pt-1">
                  <Sparkle size={12} weight="fill" />
                  <span>Hover / Tap to see deliverables</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col justify-between text-white">
              <div className="flex items-center justify-between">
                {categoryNumber && (
                  <span className="text-xs font-mono uppercase text-[#D4A043]">
                    {categoryNumber}
                  </span>
                )}
                {metric && (
                  <span className="text-xs font-mono text-[#B8862E]">{metric}</span>
                )}
              </div>
              <div>
                <h3 className="font-serif font-medium text-xl mb-1">{title}</h3>
                <p className="text-xs text-slate-300">{subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* BACK FACE */}
        <div className="flip-card-back bg-[#17211C] border border-[#B8862E]/40 shadow-2xl p-6 sm:p-7 flex flex-col justify-between text-white">
          <div className="space-y-4">
            <div className="space-y-1.5 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono text-[#D4A043] uppercase tracking-wider font-semibold">
                  {categoryNumber || "Capabilities"}
                </span>
                {(impactBadge || metric) && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {impactBadge || metric}
                  </span>
                )}
              </div>
              <h3 className="font-serif font-medium text-lg text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#D4A043]/90 tracking-wider block">
                Included Deliverables:
              </span>
              <div className="space-y-2">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 text-xs text-slate-200"
                  >
                    <CheckCircle
                      size={14}
                      weight="bold"
                      className="text-[#52B788] shrink-0 mt-0.5"
                    />
                    <span className="leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1F4D3E] to-[#2D6A56] hover:from-[#153A2E] hover:to-[#1F4D3E] text-white text-xs font-semibold border border-[#52B788]/30 transition-all duration-200 cursor-pointer shadow-md group/btn">
                  <span>Inquire via WhatsApp Desk</span>
                  <ArrowRight
                    size={13}
                    className="text-[#D4A043] group-hover/btn:translate-x-1 transition-transform"
                  />
                </div>
              </a>
            ) : (
              <Link
                to="/services"
                onClick={(e) => e.stopPropagation()}
                className="block w-full"
              >
                <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all duration-200 cursor-pointer shadow-sm group/btn">
                  <span>Explore Service Package</span>
                  <ArrowRight
                    size={13}
                    className="text-[#D4A043] group-hover/btn:translate-x-1 transition-transform"
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

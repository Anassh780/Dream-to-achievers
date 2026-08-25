import React, { useState } from 'react';
import { ArrowRight, ArrowsClockwise, Sparkle } from '@phosphor-icons/react';
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
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group relative h-[400px] w-full [perspective:1800px] cursor-pointer select-none"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
      aria-label={`${title} - Click or hover to view details`}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "motion-reduce:transition-none",
          isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        {/* FRONT FACE */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-3xl",
            "bg-[#0A0F19] border border-white/[0.08]",
            "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300",
            "group-hover:border-white/20 group-hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]"
          )}
        >
          {frontImage ? (
            <div className="relative h-full w-full overflow-hidden bg-[#070A12]">
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
                  }
                }}
              />

              {/* Multi-layered atmospheric scrim for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06090F] via-[#06090F]/70 to-[#06090F]/20" />

              {/* Top Header Floating Tags */}
              <div className="absolute top-0 inset-x-0 p-5 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  {icon && (
                    <div className="p-2 rounded-xl bg-[#06090F]/80 backdrop-blur-md border border-white/10 text-[#60A5FA] shadow-sm">
                      {icon}
                    </div>
                  )}
                  {categoryNumber && (
                    <span className="text-[10px] font-mono text-white/90 uppercase font-semibold bg-[#06090F]/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 tracking-wider">
                      {categoryNumber}
                    </span>
                  )}
                </div>
                {impactBadge && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30 backdrop-blur-md">
                    {impactBadge}
                  </span>
                )}
              </div>

              {/* Bottom Details Banner */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10 space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl text-white leading-tight">
                      {title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-[#94A3B8] leading-relaxed">
                      {subtitle}
                    </p>
                  </div>
                  <div 
                    className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 group-hover:rotate-180 transition-transform duration-500 shadow-md"
                    title="Click or hover to flip"
                  >
                    <ArrowsClockwise size={16} />
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#60A5FA] pt-1">
                  <Sparkle size={12} weight="fill" />
                  <span>Hover / Tap to view deliverables</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                {icon && <div className="p-2.5 rounded-xl bg-[#0A0F19] text-[#60A5FA]">{icon}</div>}
                {impactBadge && (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20">
                    {impactBadge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white">{title}</h3>
                <p className="text-xs text-[#94A3B8]">{subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* BACK FACE */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-3xl p-6 sm:p-7",
            "bg-[#0E1626] border border-[#3B82F6]/30 shadow-2xl",
            "flex flex-col justify-between",
            "transition-shadow duration-300"
          )}
        >
          <div className="space-y-4">
            <div className="space-y-1.5 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#60A5FA] uppercase tracking-wider font-semibold">
                  {categoryNumber || "Capabilities"}
                </span>
                {impactBadge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                    {impactBadge}
                  </span>
                )}
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                {title}
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider block">
                Included Features & Systems:
              </span>
              <div className="space-y-1.5">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 text-xs text-[#CBD5E1]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08]">
            <Link to="/contact" className="block w-full">
              <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#3B82F6] text-white text-xs font-medium border border-white/10 hover:border-transparent transition-all duration-200 cursor-pointer shadow-sm group/btn">
                <span>Inquire About This Service</span>
                <ArrowRight size={13} className="text-[#60A5FA] group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

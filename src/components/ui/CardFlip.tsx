import React, { useState } from "react";
import { ArrowRight, Repeat2, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardFlipProps {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  impactBadge?: string;
  categoryNumber?: string;
  icon?: React.ReactNode;
  accentColor?: "cyan" | "emerald" | "amber" | "indigo" | "rose";
  frontImage?: string;
}

const accentHexMap = {
  cyan: '#00f0ff',
  emerald: '#34d399',
  amber: '#fbbf24',
  indigo: '#818cf8',
  rose: '#fb7185',
};

export const CardFlip: React.FC<CardFlipProps> = ({
  title,
  subtitle,
  description,
  features,
  impactBadge,
  categoryNumber,
  icon,
  accentColor = "cyan",
  frontImage,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const accentStyles = {
    cyan: {
      text: "text-[#00f0ff]",
      border: "hover:border-[#00f0ff]/50",
      glow: "shadow-[0_0_50px_rgba(0,240,255,0.4)]",
      bgGradient: "from-[#00f0ff]/20 via-[#00f0ff]/10 to-transparent",
      buttonHover: "hover:from-[#00f0ff]/20 hover:via-[#00f0ff]/10 hover:to-transparent",
      badgeBg: "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/30",
    },
    emerald: {
      text: "text-emerald-400",
      border: "hover:border-emerald-500/50",
      glow: "shadow-[0_0_50px_rgba(16,185,129,0.4)]",
      bgGradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      buttonHover: "hover:from-emerald-500/20 hover:via-emerald-500/10 hover:to-transparent",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    amber: {
      text: "text-amber-400",
      border: "hover:border-amber-500/50",
      glow: "shadow-[0_0_50px_rgba(245,158,11,0.4)]",
      bgGradient: "from-amber-500/20 via-amber-500/10 to-transparent",
      buttonHover: "hover:from-amber-500/20 hover:via-amber-500/10 hover:to-transparent",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    indigo: {
      text: "text-indigo-400",
      border: "hover:border-indigo-500/50",
      glow: "shadow-[0_0_50px_rgba(99,102,241,0.4)]",
      bgGradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
      buttonHover: "hover:from-indigo-500/20 hover:via-indigo-500/10 hover:to-transparent",
      badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    rose: {
      text: "text-rose-400",
      border: "hover:border-rose-500/50",
      glow: "shadow-[0_0_50px_rgba(244,63,94,0.4)]",
      bgGradient: "from-rose-500/20 via-rose-500/10 to-transparent",
      buttonHover: "hover:from-rose-500/20 hover:via-rose-500/10 hover:to-transparent",
      badgeBg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
  };

  const style = accentStyles[accentColor];
  const electricHex = accentHexMap[accentColor] || '#00f0ff';

  return (
    <div
      className="group relative h-[380px] w-full max-w-[360px] [perspective:2000px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-[transform] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "motion-reduce:transition-none",
          isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front of Card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-2xl",
            "bg-[#0a0e17] border border-white/10",
            "shadow-xl transition-all duration-500",
            style.border,
            "group-hover:shadow-2xl"
          )}
        >
          {/* Custom Front Image Showcase */}
          {frontImage ? (
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#0a0e17]">
              <img
                src={frontImage}
                alt={title}
                width={360}
                height={380}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain object-center rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
              />

              {/* Subtle bottom text scrim only — no full dark overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl" />

              {/* Top Bar with Category & Impact Badge over Image */}
              <div className="absolute top-0 left-0 right-0 z-10 p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {icon && (
                    <div className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15">
                      {icon}
                    </div>
                  )}
                  {categoryNumber && (
                    <span className="text-[10px] font-mono text-slate-200 uppercase font-semibold bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/10">
                      {categoryNumber}
                    </span>
                  )}
                </div>
                {impactBadge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-lg",
                      style.badgeBg
                    )}
                  >
                    {impactBadge}
                  </span>
                )}
              </div>

              {/* Bottom Front Content over Image */}
              <div className="absolute right-0 bottom-0 left-0 p-5 z-10">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-heading font-extrabold text-xl text-white leading-snug tracking-tight transition-transform duration-500 ease-out group-hover:translate-y-[-2px] drop-shadow-md">
                      {title}
                    </h3>
                    <p className="line-clamp-2 text-xs font-mono text-slate-200 leading-relaxed transition-transform delay-[50ms] duration-500 ease-out group-hover:translate-y-[-2px] drop-shadow-sm">
                      {subtitle}
                    </p>
                  </div>
                  <div className="group/icon relative shrink-0">
                    <div
                      className={cn(
                        "absolute inset-[-8px] rounded-lg transition-opacity duration-300",
                        style.bgGradient
                      )}
                    />
                    <Repeat2
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 h-5 w-5 transition-transform duration-300 group-hover/icon:-rotate-180 group-hover/icon:scale-110",
                        style.text
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Animated Glow Pulsing Orbs Background (Default) */
            <div className="relative h-full overflow-hidden bg-gradient-to-b from-[#0f1623] to-[#07090e]">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-start justify-center pt-16"
              >
                <div className="relative flex h-[120px] w-[220px] items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      className={cn(
                        "absolute h-[60px] w-[60px] rounded-full",
                        "animate-[scale_3s_linear_infinite]",
                        "motion-reduce:animate-none",
                        "opacity-0",
                        style.glow,
                        "group-hover:animate-[scale_2s_linear_infinite]"
                      )}
                      key={i}
                      style={{
                        animationDelay: `${i * 0.35}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Top Bar with Category & Impact Badge */}
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {icon && (
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {icon}
                    </div>
                  )}
                  {categoryNumber && (
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                      {categoryNumber}
                    </span>
                  )}
                </div>
                {impactBadge && (
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border",
                      style.badgeBg
                    )}
                  >
                    {impactBadge}
                  </span>
                )}
              </div>

              {/* Bottom Front Content */}
              <div className="absolute right-0 bottom-0 left-0 p-6">
                <div className="flex items-end justify-between gap-3">
                  <div className="space-y-2">
                    <h3 className="font-heading font-extrabold text-xl text-white leading-snug tracking-tight transition-transform duration-500 ease-out group-hover:translate-y-[-4px]">
                      {title}
                    </h3>
                    <p className="line-clamp-2 text-xs font-mono text-slate-400 leading-relaxed transition-transform delay-[50ms] duration-500 ease-out group-hover:translate-y-[-4px]">
                      {subtitle}
                    </p>
                  </div>
                  <div className="group/icon relative shrink-0">
                    <div
                      className={cn(
                        "absolute inset-[-8px] rounded-lg transition-opacity duration-300",
                        style.bgGradient
                      )}
                    />
                    <Repeat2
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 h-5 w-5 transition-transform duration-300 group-hover/icon:-rotate-180 group-hover/icon:scale-110",
                        style.text
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back of Card */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-2xl p-6",
            "bg-gradient-to-b from-[#0f1623] via-[#0a0e17] to-[#07090e]",
            "border border-white/15 shadow-2xl",
            "flex flex-col justify-between",
            "transition-shadow duration-500"
          )}
        >
          <div className="space-y-4">
            <div className="space-y-1.5 pb-3 border-b border-white/10">
              <span className={cn("text-[11px] font-mono font-semibold uppercase tracking-wider", style.text)}>
                {categoryNumber || "Service Overview"}
              </span>
              <h3 className="font-heading font-bold text-lg text-white leading-tight">
                {title}
              </h3>
              <p className="line-clamp-3 text-xs text-slate-300 leading-relaxed pt-1">
                {description}
              </p>
            </div>

            {/* Feature List with Stagger Animations */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Included Deliverables:</span>
              {features.map((feature, index) => (
                <div
                  className="flex items-center gap-2 text-xs font-mono text-slate-200 transition-[transform,opacity] duration-300 ease-out"
                  key={feature}
                  style={{
                    transform: isFlipped ? "translateX(0)" : "translateX(-10px)",
                    opacity: isFlipped ? 1 : 0,
                    transitionDelay: `${index * 50 + 150}ms`,
                  }}
                >
                  <ArrowRight aria-hidden="true" className={cn("h-3.5 w-3.5 shrink-0", style.text)} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start CTA Button */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <a href="#contact">
              <button
                className={cn(
                  "group/start relative w-full",
                  "flex items-center justify-between",
                  "rounded-xl px-4 py-2.5",
                  "transition-[transform,background] duration-300",
                  "bg-white/5 border border-white/10 text-white font-medium text-xs",
                  style.buttonHover,
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
                )}
                type="button"
              >
                <span className={cn("font-mono font-bold transition-colors duration-300", style.text)}>
                  Book Service Audit
                </span>
                <div className="group/icon relative">
                  <ArrowRight
                    aria-hidden="true"
                    className={cn("relative z-10 h-4 w-4 transition-transform duration-300 group-hover/start:translate-x-1", style.text)}
                  />
                </div>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

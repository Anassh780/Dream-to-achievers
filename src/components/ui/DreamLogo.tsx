import React from 'react';

export interface DreamLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const DreamLogo: React.FC<DreamLogoProps> = ({
  className = '',
  size = 32,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Brand Icon Image with Cyber Glow */}
      <div
        className="relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 transition-all duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/images/logo.png"
          alt="DreamToAchievers"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Typography Brandmark */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-heading font-extrabold text-[15px] sm:text-[16px] tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            DreamToAchievers
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-cyan-400/90 font-semibold">
            Commerce &amp; Leadership
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';

export interface DreamLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const DreamLogo: React.FC<DreamLogoProps> = ({
  className = '',
  size = 38,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Official Brand Logo Mark */}
      <div
        className="rounded-[9px] bg-[#1F4D3E] text-white flex items-center justify-center font-display font-semibold shrink-0 overflow-hidden shadow-xs transition-transform duration-150 group-hover:scale-105"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
      >
        <img
          src="/images/logo.png"
          alt="DreamToAchievers"
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            // Fallback to "D" glyph if image not found
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span className="hidden group-has-[img[style*='display: none']]:inline">D</span>
      </div>

      {/* Typography Brandmark */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-display font-semibold text-[17px] sm:text-[18px] tracking-tight text-[#1E241F]">
            DreamToAchievers
          </span>
          <span className="font-sans text-[10px] sm:text-[11px] tracking-wider uppercase text-[#5B5C50] font-medium">
            Commerce &amp; Leadership
          </span>
        </div>
      )}
    </div>
  );
};

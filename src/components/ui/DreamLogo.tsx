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
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      {/* Official Brand Logo Mark Perfectly Framed */}
      <div
        className="rounded-xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-200 group-hover:scale-105 p-1"
        style={{ width: size, height: size }}
      >
        <img
          src="/images/brand-logo.png"
          alt="Dream to Achievers"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Typography Brandmark */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-serif font-bold text-[16px] sm:text-[17px] tracking-tight text-[var(--ink)]">
            DreamToAchievers
          </span>
          <span className="font-mono text-[9.5px] tracking-wider uppercase text-[var(--ink-soft)] font-medium">
            Wholesale &amp; Reselling
          </span>
        </div>
      )}
    </div>
  );
};

export default DreamLogo;

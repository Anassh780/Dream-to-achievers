import React from 'react';

export interface DreamLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const DreamLogo: React.FC<DreamLogoProps> = ({
  className = '',
  size = 36,
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center space-x-2.5 group select-none ${className}`}>
      {/* Official Brand Logo Icon Image */}
      <div
        className="relative flex items-center justify-center rounded-xl overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <img
          src="/images/logo.png"
          alt="Dream to Achievers"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Typography Brandmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center">
            <span>Dream<span className="text-[#60A5FA]">To</span>Achievers</span>
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#64748B] mt-0.5 font-medium">
            Commerce & Leadership
          </span>
        </div>
      )}
    </div>
  );
};

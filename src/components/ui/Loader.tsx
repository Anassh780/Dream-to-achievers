import React from 'react';
import { cn } from '@/lib/utils';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  title = 'Configuring your account...',
  subtitle = 'Please wait while we prepare everything for you',
  size = 'md',
  fullScreen = false,
  className,
  ...props
}) => {
  const sizeConfig = {
    sm: {
      container: 'w-20 h-20',
      titleClass: 'text-sm font-medium',
      subtitleClass: 'text-xs',
      spacing: 'space-y-2',
      maxWidth: 'max-w-48',
    },
    md: {
      container: 'w-32 h-32',
      titleClass: 'text-base font-medium',
      subtitleClass: 'text-xs sm:text-sm',
      spacing: 'space-y-3',
      maxWidth: 'max-w-56',
    },
    lg: {
      container: 'w-40 h-40',
      titleClass: 'text-lg font-semibold',
      subtitleClass: 'text-sm',
      spacing: 'space-y-4',
      maxWidth: 'max-w-64',
    },
  };

  const config = sizeConfig[size];

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-6 p-6 font-sans text-center select-none',
        className
      )}
      {...props}
    >
      {/* Concentric Conic Animated Loader */}
      <div className={cn('relative flex items-center justify-center animate-pulse', config.container)}>
        {/* Ring 1: Outer shimmer ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin [animation-duration:3s]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, #1F4D3E 90deg, transparent 180deg)',
            mask: 'radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)',
            WebkitMask:
              'radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)',
            opacity: 0.85,
          }}
        />

        {/* Ring 2: Primary animated gradient ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin [animation-duration:2.2s]"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, #1F4D3E 120deg, #B8862E 240deg, transparent 360deg)',
            mask: 'radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)',
            WebkitMask:
              'radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)',
            opacity: 0.9,
          }}
        />

        {/* Ring 3: Counter-rotating secondary ring */}
        <div
          className="absolute inset-0 rounded-full animate-spin [animation-duration:3.8s] [animation-direction:reverse]"
          style={{
            background:
              'conic-gradient(from 180deg, transparent 0deg, #B8862E 45deg, transparent 90deg)',
            mask: 'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)',
            WebkitMask:
              'radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)',
            opacity: 0.6,
          }}
        />

        {/* Ring 4: Accent outer particle orbit */}
        <div
          className="absolute inset-0 rounded-full animate-spin [animation-duration:3.2s]"
          style={{
            background:
              'conic-gradient(from 270deg, transparent 0deg, #1F4D3E 20deg, transparent 40deg)',
            mask: 'radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)',
            WebkitMask:
              'radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)',
            opacity: 0.7,
          }}
        />

        {/* Center Emblem Glyph */}
        <div className="w-8 h-8 rounded-full bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center font-display font-semibold text-xs text-[#1F4D3E] shadow-xs">
          D
        </div>
      </div>

      {/* Typography with Breathing Fade Motion */}
      <div className={cn('text-center transition-opacity duration-300', config.spacing, config.maxWidth)}>
        <h3
          className={cn(
            config.titleClass,
            'font-display font-medium text-[#1E241F] tracking-tight leading-snug animate-pulse'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            config.subtitleClass,
            'text-[#5B5C50] leading-relaxed font-sans'
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7EF]/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="p-8 rounded-2xl bg-white border border-[#E3DCC8] shadow-lg max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loader;

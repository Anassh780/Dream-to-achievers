import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'pill' | 'hairline';
  interactive?: boolean;
  glow?: boolean;
}

/**
 * Standardized GlassCard primitive implementing the exact luxury glass specification.
 * - background: rgba(255,255,255,0.045)
 * - border: 1px solid rgba(255,255,255,0.10)
 * - backdrop-filter: blur(22px) saturate(140%)
 * - box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 60px -20px rgba(0,0,0,0.65)
 * - radius: 20px (cards) / 999px (pills)
 * - on hover: border lifts to rgba(217,192,138,0.28), translateY(-4px), transition 400ms cubic-bezier(0.16,1,0.3,1)
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'default',
      interactive = false,
      glow = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel relative overflow-hidden text-[var(--text-primary)]',
          variant === 'pill' && 'glass-pill rounded-full',
          variant === 'elevated' && 'border-[var(--champagne-border)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_30px_70px_-15px_rgba(0,0,0,0.7)]',
          glow && 'ring-1 ring-[var(--emerald)]/20 shadow-[0_0_40px_-10px_rgba(52,211,153,0.15)]',
          interactive && 'glass-panel-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {glow && (
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[var(--emerald)]/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

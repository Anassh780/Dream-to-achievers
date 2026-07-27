import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowColor?: 'cyan' | 'emerald' | 'indigo' | 'none';
  aspectRatio?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverEffect = true,
      glowColor = 'cyan',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel rounded-2xl p-6 relative overflow-hidden group border border-white/10',
          hoverEffect && 'glass-panel-hover',
          glowColor === 'cyan' && 'hover:border-[#00f0ff]/40',
          glowColor === 'emerald' && 'hover:border-emerald-500/40',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

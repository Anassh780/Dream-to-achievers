import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'emerald' | 'outline' | 'dot';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-mono font-medium transition-colors select-none';

  const variants = {
    default: 'bg-white/5 text-slate-300 border border-white/10',
    accent: 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    outline: 'bg-transparent text-slate-400 border border-slate-700',
    dot: 'bg-[#0f1623] text-slate-200 border border-white/10 pl-2.5',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
  };

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {variant === 'dot' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
      )}
      {children}
    </div>
  );
};

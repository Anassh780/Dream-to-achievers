import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'emerald' | 'warning' | 'danger' | 'outline' | 'dot' | 'cyan' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-sans text-xs font-semibold transition-colors select-none';

  const variants = {
    default: 'bg-white/[0.06] text-[#E2E8F0] border border-white/10 backdrop-blur-md',
    accent: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    cyan: 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30 shadow-[0_0_12px_rgba(0,242,254,0.2)]',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    outline: 'bg-transparent text-[#94A3B8] border border-white/15',
    dot: 'bg-[#0A101D] text-[#F8FAFC] border border-white/10 pl-2',
  };

  const sizes = {
    sm: 'text-[10px] font-mono px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {variant === 'dot' && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      )}
      {children}
    </div>
  );
};

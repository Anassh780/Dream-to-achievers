import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'emerald' | 'warning' | 'danger' | 'outline' | 'dot';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center rounded-md font-sans text-xs font-medium transition-colors select-none';

  const variants = {
    default: 'bg-white/5 text-[#CBD5E1] border border-white/10',
    accent: 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/25',
    emerald: 'bg-[#22C55E]/10 text-[#4ADE80] border border-[#22C55E]/25',
    warning: 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/25',
    danger: 'bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/25',
    outline: 'bg-transparent text-[#8996A8] border border-white/10',
    dot: 'bg-[#111A27] text-[#F8FAFC] border border-white/10 pl-2',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {variant === 'dot' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
      )}
      {children}
    </div>
  );
};

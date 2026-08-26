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
  const baseStyles = 'inline-flex items-center rounded-full font-sans text-xs font-medium transition-colors select-none';

  const variants = {
    default: 'bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8]',
    accent: 'bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]',
    cyan: 'bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]',
    emerald: 'bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]',
    warning: 'bg-[#EFE2C4] text-[#B8862E] border border-[#B8862E]/30',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    purple: 'bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]',
    outline: 'bg-white text-[#5B5C50] border border-[#E3DCC8]',
    dot: 'bg-white text-[#1E241F] border border-[#E3DCC8] pl-2',
  };

  const sizes = {
    sm: 'text-[10.5px] font-mono px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  return (
    <div className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {variant === 'dot' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3E]" />
      )}
      {children}
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'emerald' | 'champagne' | 'danger' | 'liquid-glass';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      iconLeft,
      iconRight,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center text-center font-medium font-sans select-none cursor-pointer touch-manipulation transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--champagne)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] rounded-full whitespace-normal sm:whitespace-nowrap';

    const variants = {
      primary:
        'bg-gradient-to-b from-[#6EE7A8] to-[#2FA46B] text-[#070B09] font-semibold border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_-6px_rgba(47,164,107,0.45)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_16px_32px_-6px_rgba(47,164,107,0.55)]',
      secondary:
        'bg-white/[0.05] hover:bg-white/[0.1] text-[var(--text-primary)] border border-white/10 hover:border-white/20',
      ghost:
        'bg-transparent hover:bg-white/[0.08] text-[var(--text-primary)]',
      outline:
        'bg-white/[0.02] hover:bg-[var(--champagne)]/10 text-[var(--text-primary)] border border-[var(--champagne-border)] hover:border-[var(--champagne)]',
      emerald:
        'bg-gradient-to-r from-[#6EE7A8] to-[#2FA46B] text-[#070B09] font-semibold border border-white/30 shadow-[0_10px_24px_-6px_rgba(52,211,153,0.45)] hover:-translate-y-0.5',
      champagne:
        'bg-gradient-to-r from-[#FFF8E7] via-[#D9C08A] to-[#B8862E] text-[#070B09] font-bold border border-white/40 shadow-[0_10px_24px_-6px_rgba(217,192,138,0.45)] hover:-translate-y-0.5 hover:brightness-105',
      danger:
        'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50',
      'liquid-glass':
        'liquid-glass-btn border-white/20 text-[#F4F7F5]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[38px] sm:min-h-[36px]',
      md: 'text-xs sm:text-sm px-5 py-2.5 gap-2 min-h-[44px]',
      lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : (
          iconLeft
        )}
        <span>{children}</span>
        {!isLoading && iconRight}
      </button>
    );
  }
);

Button.displayName = 'Button';

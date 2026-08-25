import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'magnetic' | 'emerald';
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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer text-sm font-sans';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#00F2FE] via-[#38BDF8] to-[#3B82F6] text-[#030712] font-bold hover:brightness-110 border border-white/30 shadow-[0_4px_25px_rgba(0,242,254,0.35)] hover:shadow-[0_6px_30px_rgba(0,242,254,0.5)]',
      secondary:
        'bg-white/[0.05] text-[#F8FAFC] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 backdrop-blur-md shadow-sm',
      ghost:
        'bg-transparent text-[#94A3B8] hover:text-white hover:bg-white/5',
      outline:
        'bg-transparent text-cyan-400 border border-cyan-400/35 hover:border-cyan-400 hover:bg-cyan-400/10',
      emerald:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border border-emerald-300/40 shadow-[0_4px_20px_rgba(16,185,129,0.35)]',
      magnetic:
        'bg-gradient-to-r from-[#00F2FE] to-[#3B82F6] text-[#030712] font-bold shadow-[0_4px_25px_rgba(0,242,254,0.35)]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-full min-h-[36px]',
      md: 'text-sm px-5 py-2.5 gap-2 rounded-full min-h-[44px]',
      lg: 'text-sm sm:text-base px-6 py-3 gap-2.5 rounded-full min-h-[48px]',
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

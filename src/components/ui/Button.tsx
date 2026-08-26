import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'emerald' | 'danger';
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
      'inline-flex items-center justify-center font-sans select-none cursor-pointer transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020612] rounded-xl';

    const variants = {
      primary:
        'bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold border border-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.25)] hover:shadow-[0_0_28px_rgba(0,242,254,0.4)] active:scale-98 hover:-translate-y-0.5',
      secondary:
        'bg-white/[0.05] hover:bg-white/[0.09] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 active:scale-98 shadow-sm',
      ghost:
        'bg-transparent hover:bg-white/[0.06] text-slate-300 hover:text-white active:scale-98',
      outline:
        'bg-transparent hover:bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 active:scale-98 shadow-[0_0_12px_rgba(0,242,254,0.1)]',
      emerald:
        'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] active:scale-98 hover:-translate-y-0.5',
      danger:
        'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 active:scale-98',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[34px]',
      md: 'text-xs sm:text-sm px-4.5 py-2 gap-2 min-h-[38px]',
      lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5 min-h-[44px]',
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

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'magnetic';
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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-full cursor-pointer';

    const variants = {
      primary:
        'bg-[#00f0ff] text-[#080b11] font-semibold hover:bg-[#38bdf8] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] border border-[#00f0ff]',
      secondary:
        'bg-[#0f1623] text-white hover:bg-[#151f32] border border-white/10 hover:border-white/20',
      ghost:
        'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
      outline:
        'bg-transparent text-[#00f0ff] border border-[#00f0ff]/40 hover:border-[#00f0ff] hover:bg-[#00f0ff]/10',
      magnetic:
        'bg-gradient-to-r from-[#00f0ff] to-[#38bdf8] text-[#080b11] font-semibold hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] border border-[#00f0ff]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-7 py-3.5 gap-2.5',
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

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
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090F] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer text-sm font-sans';

    const variants = {
      primary:
        'bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] border border-white/15 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]',
      secondary:
        'bg-white/5 text-[#F8FAFC] hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-sm',
      ghost:
        'bg-transparent text-[#94A3B8] hover:text-white hover:bg-white/5',
      outline:
        'bg-transparent text-[#60A5FA] border border-[#3B82F6]/30 hover:border-[#3B82F6] hover:bg-[#3B82F6]/10',
      magnetic:
        'bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] border border-white/15 shadow-[0_4px_15px_rgba(59,130,246,0.3)]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-full',
      md: 'text-sm px-5 py-2.5 gap-2 rounded-full',
      lg: 'text-sm px-6 py-3 gap-2.5 rounded-full',
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

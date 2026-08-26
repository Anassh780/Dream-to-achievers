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
      'inline-flex items-center justify-center font-medium font-sans select-none cursor-pointer transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F4D3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EF] rounded-[8px] whitespace-nowrap';

    const variants = {
      primary:
        'bg-[#1F4D3E] hover:bg-[#153A2E] text-white border border-[#1F4D3E] hover:-translate-y-px shadow-xs',
      secondary:
        'bg-transparent hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8]',
      ghost:
        'bg-transparent hover:bg-[#F1ECDD] text-[#1E241F]',
      outline:
        'bg-transparent hover:bg-[#F1ECDD] text-[#1E241F] border border-[#E3DCC8]',
      emerald:
        'bg-[#1F4D3E] hover:bg-[#153A2E] text-white border border-[#1F4D3E] hover:-translate-y-px shadow-xs',
      danger:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[34px]',
      md: 'text-sm px-4.5 py-2.5 gap-2 min-h-[40px]',
      lg: 'text-base px-5.5 py-3 gap-2.5 min-h-[46px]',
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

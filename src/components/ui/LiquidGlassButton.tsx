import React, { useRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface LiquidGlassBaseProps {
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export type LiquidGlassButtonProps =
  | (LiquidGlassBaseProps &
      React.ButtonHTMLAttributes<HTMLButtonElement> & {
        to?: undefined;
        href?: undefined;
      })
  | (LiquidGlassBaseProps &
      Omit<LinkProps, 'to'> & {
        to: string;
        href?: undefined;
      })
  | (LiquidGlassBaseProps &
      React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
        to?: undefined;
      });

/**
 * LiquidGlassButton
 * 
 * Optical thick-lens convex glass pill button.
 * - Blurs what is behind it and bends light at the bevel rim.
 * - Dynamic specular caustic highlight follows the cursor.
 * - Physical 3D perspective tilt & tactile press.
 * - ZERO per-frame JS: driven 100% by registered CSS Houdini properties (@property)
 *   interpolated directly by the browser's hardware compositor.
 */
export const LiquidGlassButton = React.forwardRef<HTMLElement, LiquidGlassButtonProps>(
  (
    {
      size = 'md',
      iconLeft,
      iconRight,
      children,
      className,
      maxTilt = 6.5,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLElement | null>(null);

    const setRef = (node: HTMLElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    // Native pointer coordinates -> writes directly to Houdini CSS variables with 0 frame loops
    const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // 3D Perspective Tilt calculation
      const tiltX = -((y - 50) / 50) * maxTilt;
      const tiltY = ((x - 50) / 50) * maxTilt;

      el.style.setProperty('--liquid-x', `${x.toFixed(1)}%`);
      el.style.setProperty('--liquid-y', `${y.toFixed(1)}%`);
      el.style.setProperty('--liquid-tilt-x', `${tiltX.toFixed(2)}deg`);
      el.style.setProperty('--liquid-tilt-y', `${tiltY.toFixed(2)}deg`);
      el.style.setProperty('--liquid-glow', '1');

      if ('onPointerMove' in props && typeof props.onPointerMove === 'function') {
        props.onPointerMove(e as any);
      }
    };

    const handlePointerLeave = (e: React.PointerEvent<HTMLElement>) => {
      const el = e.currentTarget;
      // Reset to resting state; Houdini transitions smoothly handle decay
      el.style.setProperty('--liquid-tilt-x', '0deg');
      el.style.setProperty('--liquid-tilt-y', '0deg');
      el.style.setProperty('--liquid-glow', '0');
      el.style.setProperty('--liquid-press', '1');

      if ('onPointerLeave' in props && typeof props.onPointerLeave === 'function') {
        props.onPointerLeave(e as any);
      }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.style.setProperty('--liquid-press', '0.96');

      if ('onPointerDown' in props && typeof props.onPointerDown === 'function') {
        props.onPointerDown(e as any);
      }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.style.setProperty('--liquid-press', '1');

      if ('onPointerUp' in props && typeof props.onPointerUp === 'function') {
        props.onPointerUp(e as any);
      }
    };

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs min-h-[38px] sm:min-h-[36px] gap-1.5 font-medium',
      md: 'px-5 py-2.5 text-xs sm:text-sm min-h-[44px] gap-2 font-medium',
      lg: 'px-7 py-3.5 text-xs sm:text-sm min-h-[48px] gap-2.5 font-medium tracking-[0.14em]',
    };

    const sharedClassName = cn(
      'liquid-glass-pill',
      sizeStyles[size],
      className
    );

    const pointerHandlers = {
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
    };

    const innerContent = (
      <>
        {iconLeft && <span className="inline-flex items-center shrink-0">{iconLeft}</span>}
        <span className="truncate">{children}</span>
        {iconRight && <span className="inline-flex items-center shrink-0">{iconRight}</span>}
      </>
    );

    if (props.to) {
      const { to, ...rest } = props;
      return (
        <Link
          ref={setRef as any}
          to={to}
          className={sharedClassName}
          {...pointerHandlers}
          {...rest}
        >
          {innerContent}
        </Link>
      );
    }

    if (props.href) {
      const { href, ...rest } = props;
      return (
        <a
          ref={setRef as any}
          href={href}
          className={sharedClassName}
          {...pointerHandlers}
          {...rest}
        >
          {innerContent}
        </a>
      );
    }

    const { type = 'button', ...rest } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={setRef as any}
        type={type}
        className={sharedClassName}
        {...pointerHandlers}
        {...rest}
      >
        {innerContent}
      </button>
    );
  }
);

LiquidGlassButton.displayName = 'LiquidGlassButton';

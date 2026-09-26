import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number; // In milliseconds
  staggerIndex?: number;
  yOffset?: number; // Default 28px
  duration?: number; // In seconds, default 0.7
  threshold?: number; // Default 0.2 (20% in view)
  as?: React.ElementType;
}

/**
 * Luxury ScrollReveal primitive.
 * Motion defaults: opacity 0->1, y 28px->0, duration 0.7s, cubic-bezier(0.16,1,0.3,1),
 * triggered at 20% in view, triggers only once.
 * Gracefully respects prefers-reduced-motion.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  delay = 0,
  staggerIndex = 0,
  yOffset = 28,
  duration = 0.7,
  threshold = 0.2,
  as: Component = 'div',
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const totalDelay = delay + staggerIndex * 80;

  return (
    <Component
      ref={elementRef}
      className={cn('transition-all', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`,
        transitionDuration: `${duration}s`,
        transitionDelay: `${totalDelay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isVisible ? 'auto' : 'transform, opacity',
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

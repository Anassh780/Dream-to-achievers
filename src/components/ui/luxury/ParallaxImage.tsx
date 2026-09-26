import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ParallaxImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  speed?: number; // e.g. 0.12 (y moves 12% slower than scroll)
  priority?: boolean;
  overlayOpacity?: 'normal' | 'heavy' | 'subtle';
  className?: string;
  imageClassName?: string;
}

/**
 * Editorial ParallaxImage Primitive.
 * - Darkens with linear-gradient(180deg, rgba(7,11,9,0.55), rgba(7,11,9,0.92))
 * - Slight desaturation and warm shadow lift
 * - Subtle parallax (12% slower than scroll), disabled on prefers-reduced-motion or mobile
 */
export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  src,
  alt,
  speed = 0.12,
  priority = false,
  overlayOpacity = 'normal',
  className,
  imageClassName,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || speed === 0) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Only calculate when element is near viewport
          if (rect.bottom >= 0 && rect.top <= windowHeight) {
            const distanceFromCenter = rect.top - windowHeight / 2;
            setOffsetY(distanceFromCenter * speed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  const overlayGradients = {
    subtle: 'linear-gradient(180deg, rgba(7, 11, 9, 0.40) 0%, rgba(7, 11, 9, 0.75) 100%)',
    normal: 'linear-gradient(180deg, rgba(7, 11, 9, 0.55) 0%, rgba(7, 11, 9, 0.92) 100%)',
    heavy: 'linear-gradient(180deg, rgba(7, 11, 9, 0.70) 0%, rgba(7, 11, 9, 0.96) 100%)',
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {/* Parallax moving image wrapper */}
      <div
        className="absolute inset-x-0 -inset-y-[15%] w-full h-[130%] pointer-events-none will-change-transform"
        style={{
          transform: `translateY(${offsetY}px)`,
          transition: 'transform 100ms linear',
        }}
      >
        <img
          src={src}
          alt={alt}
          fetchPriority={priority ? 'high' : 'auto'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'w-full h-full object-cover object-center filter saturate-[0.88] contrast-[1.06]',
            imageClassName
          )}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.endsWith('.webp')) {
              target.src = src.replace('.webp', '.jpg');
            }
          }}
        />
      </div>

      {/* Unified Luxury Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: overlayGradients[overlayOpacity],
        }}
        aria-hidden="true"
      />

      {/* Content slot over image */}
      {children && <div className="relative z-[2]">{children}</div>}
    </div>
  );
};

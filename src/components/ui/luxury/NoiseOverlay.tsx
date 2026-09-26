import React from 'react';

/**
 * Global SVG grain noise overlay (3.5% opacity, fixed, pointer-events-none)
 * Essential luxury aesthetic layer adding tactile surface texture.
 */
export const NoiseOverlay: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99] opacity-[0.035] select-none mix-blend-screen dark:mix-blend-overlay"
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="luxury-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#luxury-grain)" />
      </svg>
    </div>
  );
};

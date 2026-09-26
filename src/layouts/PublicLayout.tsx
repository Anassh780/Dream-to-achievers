import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LuxuryNav } from '@/components/landing/LuxuryNav';
import { LuxuryFooter } from '@/components/landing/LuxuryFooter';
import { NoiseOverlay } from '@/components/ui/luxury/NoiseOverlay';
import { SmoothScroll } from '@/components/common/SmoothScroll';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-[var(--champagne)]/25 selection:text-[var(--text-primary)] relative">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global Grain Noise Overlay (SVG feTurbulence, 3.5% opacity, pointer-events-none) */}
        <NoiseOverlay />

        {/* Luxury Glass Top Navigation Bar */}
        <LuxuryNav />

        {/* Main Page Content Body */}
        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 min-w-0 ${!isHome ? 'pt-24' : ''}`}
        >
          <Outlet />
        </main>

        {/* Luxury Multi-Column Editorial Footer */}
        <LuxuryFooter />
      </div>
    </SmoothScroll>
  );
};

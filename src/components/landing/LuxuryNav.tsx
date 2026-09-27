import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { List, X, ShieldCheck, ArrowRight, Sparkle } from '@phosphor-icons/react';

export const LuxuryNav: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Ranks', href: '/ranks' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* FundingPips Style Floating Island Navbar Container */}
      <header className="fixed top-3 sm:top-4 inset-x-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <div
          className={`pointer-events-auto material-nav-island max-w-[1240px] w-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-6 transition-all duration-300 ${
            isScrolled
              ? 'bg-[#090E0B]/90 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.18)] border-white/[0.14]'
              : 'bg-[#0B100D]/75 shadow-[0_16px_35px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)]'
          }`}
        >
          {/* Brand Logo Left - Single clean brandmark with Wholesale pulse badge */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <DreamLogo size={32} showText={false} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
                DreamToAchievers
              </span>
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-[var(--emerald)] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
                <span>Wholesale</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links Center (FundingPips Pill Tabs) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-0.5 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] shrink-0"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className={({ isActive }) =>
                  `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Controls Right */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Admin (Pill Ghost) */}
            <Link to="/admin">
              <span className="funding-ghost-pill px-3 py-1.5 text-[11.5px] font-mono text-[var(--text-muted)] hover:text-[var(--champagne)] block">
                Admin
              </span>
            </Link>

            {/* Auth / Dashboard Controls (FundingPips Sheen Button) */}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="funding-sheen-btn px-4 py-2 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="funding-sheen-btn px-4 py-2 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <span>Join Free</span>
                  <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions & Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.12] text-[var(--text-primary)] focus-visible:outline-none active:scale-95 transition-transform touch-manipulation cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Glass Sheet for Mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[var(--bg-base)]/95 backdrop-blur-[20px] saturate-[130%] flex flex-col justify-between pt-24 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--champagne-hairline)]">
              <span className="luxury-eyebrow">Platform Navigation</span>
              <span className="text-[10px] font-mono text-[var(--champagne)]">Pakistan COD</span>
            </div>

            <div className="flex flex-col space-y-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-2xl text-base font-serif transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-white/[0.08] text-[var(--champagne)] border border-[var(--champagne-border)] font-semibold'
                        : 'text-[var(--text-primary)] hover:bg-white/[0.04]'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  <ArrowRight size={15} className="opacity-40" />
                </NavLink>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--champagne-hairline)] space-y-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="funding-sheen-btn w-full py-3 text-center text-xs uppercase tracking-wider font-semibold block"
              >
                Open Partner Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="funding-ghost-pill py-2.5 text-center text-xs font-medium block"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="funding-sheen-btn py-2.5 text-center text-xs uppercase tracking-wider font-semibold block"
                >
                  Join Free
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 text-xs font-mono text-[var(--text-muted)]">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[var(--champagne)] flex items-center gap-1"
              >
                <ShieldCheck size={14} />
                <span>Admin Gateway</span>
              </Link>
              <span>150+ Cities COD</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

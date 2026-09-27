import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';
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

  const [roleMode, setRoleMode] = useState<'reseller' | 'wholesale'>('reseller');

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Ranks', href: '/ranks' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const primaryLinks = [
    { label: 'Home', href: '/' },
    { label: 'Wholesale Catalog', href: '/products' },
    { label: 'Tiers & Ranks', href: '/ranks' },
    { label: 'Services & Logistics', href: '/services' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  const featureLinks =
    roleMode === 'reseller'
      ? [
          { label: 'Zero-Capital COD Dispatch', href: '/how-it-works' },
          { label: 'Trade Margin Calculator', href: '/products' },
          { label: 'Cash Bonus Roadmap', href: '/ranks' },
          { label: 'Automated Courier Tracking', href: '/services' },
        ]
      : [
          { label: 'Bulk Lot Procurement', href: '/products' },
          { label: 'Verified Trade Rates', href: '/products' },
          { label: 'Nationwide Courier Network', href: '/services' },
          { label: 'Direct Reseller Channel', href: '/about' },
        ];

  const secondaryLinks = [
    { label: 'About & Leadership', href: '/about' },
    { label: 'Support & FAQ', href: '/faq' },
    { label: 'Executive Contact', href: '/contact' },
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
            {/* Admin (Liquid Glass Pill) */}
            <LiquidGlassButton
              to="/admin"
              size="sm"
              className="px-3 py-1.5 text-[11.5px] font-mono text-[var(--text-muted)] hover:text-[var(--champagne)]"
            >
              Admin
            </LiquidGlassButton>

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

      {/* Floating Luxury Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="relative w-full max-w-[420px] max-h-[calc(100dvh-24px)] flex flex-col rounded-[32px] overflow-hidden bg-gradient-to-b from-[#0F1714] via-[#09100D] to-[#050806] border border-[#D9C08A]/35 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(217,192,138,0.12)] animate-in zoom-in-95 duration-200">
            {/* Top Section: Logo at Left, White Close Pill at Right */}
            <div className="shrink-0 px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/[0.06]">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 focus:outline-none"
              >
                <DreamLogo size={28} showText={false} />
                <span className="font-serif text-[15px] font-semibold tracking-tight text-[#F4F7F5]">
                  DreamToAchievers
                </span>
              </Link>

              {/* White rounded Close pill button with dark text */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-white hover:bg-neutral-100 text-[#070B09] font-bold text-xs px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform cursor-pointer inline-flex items-center gap-1.5 touch-manipulation"
                aria-label="Close navigation"
              >
                <span>Close</span>
                <X size={13} weight="bold" />
              </button>
            </div>

            {/* Role Switcher: Large segmented pill toggle with thin luxury outline */}
            <div className="shrink-0 px-6 pt-4 pb-2">
              <div className="p-1 rounded-full border border-[#D9C08A]/40 bg-[#070B09]/80 backdrop-blur-md flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setRoleMode('reseller')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer touch-manipulation ${
                    roleMode === 'reseller'
                      ? 'bg-gradient-to-r from-[#FFF8E7] via-[#D9C08A] to-[#B8862E] text-[#070B09] shadow-[0_3px_12px_rgba(217,192,138,0.35)]'
                      : 'text-[#9EABA2] hover:text-white'
                  }`}
                >
                  Reseller Partner
                </button>
                <button
                  type="button"
                  onClick={() => setRoleMode('wholesale')}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer touch-manipulation ${
                    roleMode === 'wholesale'
                      ? 'bg-gradient-to-r from-[#FFF8E7] via-[#D9C08A] to-[#B8862E] text-[#070B09] shadow-[0_3px_12px_rgba(217,192,138,0.35)]'
                      : 'text-[#9EABA2] hover:text-white'
                  }`}
                >
                  Wholesale Buyer
                </button>
              </div>
            </div>

            {/* Navigation Links Body (Scrollable with no scrollbar) */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4 [scrollbar-width:none] overscroll-contain">
              {/* Main Navigation Stack (Large bold typography) */}
              <div className="space-y-1.5">
                {primaryLinks.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block text-2xl sm:text-[26px] font-serif font-bold tracking-tight transition-colors py-1 ${
                        isActive
                          ? 'text-white flex items-center justify-between'
                          : 'text-[#D9C08A] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#D9C08A] shadow-[0_0_10px_rgba(217,192,138,0.9)] shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Features Section Heading & Indented Submenu */}
              <div className="pt-2 border-t border-white/[0.06]">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--champagne)] font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkle size={12} weight="fill" />
                  <span>Wholesale Features</span>
                </div>
                <div className="pl-4 space-y-2.5 border-l-2 border-[#D9C08A]/30 ml-1.5 my-2">
                  {featureLinks.map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block text-sm font-medium transition-colors py-0.5 ${
                          isActive
                            ? 'text-white font-semibold'
                            : 'text-[#C4D0C8] hover:text-white'
                        }`
                      }
                    >
                      <span>{sub.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Additional Pages Stack */}
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                {secondaryLinks.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block text-lg font-serif font-medium transition-colors py-1 ${
                        isActive
                          ? 'text-white font-bold flex items-center justify-between'
                          : 'text-[#A1B2A8] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Bottom Footer Section (Flex pinned) */}
            <div className="shrink-0 px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-white/[0.08] bg-[#070B09]/80 backdrop-blur-md space-y-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="funding-sheen-btn w-full py-2.5 text-center text-xs uppercase tracking-wider font-semibold block"
                >
                  Open Partner Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
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

              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[var(--champagne)] flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck size={14} className="text-[#D9C08A]" />
                  <span>Admin Gateway</span>
                </Link>
                <span>150+ Cities COD</span>
              </div>

              {/* Copyright */}
              <div className="text-[10px] font-mono text-center text-[var(--text-muted)] pt-1">
                © 2026 Dream to Achievers. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

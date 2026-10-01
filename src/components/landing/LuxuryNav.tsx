import React, { useEffect, useState, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';
import {
  List,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkle,
  CaretDown,
  VideoCamera,
  ShoppingBag,
} from '@phosphor-icons/react';

export const LuxuryNav: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHowItWorksOpen, setMobileHowItWorksOpen] = useState(true);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    setDesktopDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Click outside listener for desktop dropdown
  useEffect(() => {
    if (!desktopDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDesktopDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDesktopDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [desktopDropdownOpen]);

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

  const isHowItWorksActive =
    location.pathname === '/how-it-works' ||
    location.pathname === '/how-it-works/selling' ||
    location.pathname === '/tutorials' ||
    location.pathname === '/how-it-works/tutorials';

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
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`
              }
            >
              Products
            </NavLink>

            {/* How It Works Dropdown (Tutorials & How Selling Works) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => {
                if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
                setDesktopDropdownOpen(true);
              }}
              onMouseLeave={() => {
                dropdownTimeoutRef.current = setTimeout(() => setDesktopDropdownOpen(false), 200);
              }}
            >
              <button
                type="button"
                onClick={() => setDesktopDropdownOpen((prev) => !prev)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap inline-flex items-center gap-1 cursor-pointer ${
                  isHowItWorksActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`}
                aria-expanded={desktopDropdownOpen}
                aria-haspopup="true"
              >
                <span>How It Works</span>
                <CaretDown
                  size={12}
                  weight="bold"
                  className={`transition-transform duration-200 ${
                    desktopDropdownOpen ? 'rotate-180 text-[var(--champagne)]' : ''
                  }`}
                />
              </button>

              {/* Floating Obsidian Glass Dropdown Menu */}
              {desktopDropdownOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 min-w-[270px] pointer-events-auto"
                >
                  <div className="p-2 rounded-2xl bg-[#0D1512]/95 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(217,192,138,0.08)] space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <Link
                      to="/tutorials"
                      role="menuitem"
                      onClick={() => setDesktopDropdownOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                        location.pathname === '/tutorials'
                          ? 'bg-white/[0.08] text-[#D9C08A]'
                          : 'hover:bg-white/[0.05] text-[#F4F7F5]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#D9C08A]/10 border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A] shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <VideoCamera size={16} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif text-xs font-semibold tracking-tight text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors">
                          Tutorials
                        </div>
                        <p className="text-[10px] font-mono text-[#9EABA2] leading-relaxed line-clamp-1 mt-0.5">
                          Watch video guides & masterclasses
                        </p>
                      </div>
                    </Link>

                    <Link
                      to="/how-it-works"
                      role="menuitem"
                      onClick={() => setDesktopDropdownOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all group ${
                        location.pathname === '/how-it-works'
                          ? 'bg-white/[0.08] text-[#D9C08A]'
                          : 'hover:bg-white/[0.05] text-[#F4F7F5]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[#34D399] shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <ShoppingBag size={16} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif text-xs font-semibold tracking-tight text-[#F4F7F5] group-hover:text-[#34D399] transition-colors">
                          How Selling Works
                        </div>
                        <p className="text-[10px] font-mono text-[#9EABA2] leading-relaxed line-clamp-1 mt-0.5">
                          4-step wholesale reselling & COD process
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/ranks"
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`
              }
            >
              Ranks
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`
              }
            >
              Services
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--champagne)] bg-white/[0.08] shadow-2xs font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                }`
              }
            >
              Contact
            </NavLink>
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

            {/* Real Web Navigation Links Body (Scrollable with no scrollbar) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 [scrollbar-width:none] overscroll-contain">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-2xl sm:text-[26px] font-serif font-bold tracking-tight transition-colors py-1.5 ${
                    isActive
                      ? 'text-white flex items-center justify-between font-extrabold'
                      : 'text-[#D9C08A] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>Home</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#D9C08A] shadow-[0_0_10px_rgba(217,192,138,0.9)] shrink-0" />
                    )}
                  </>
                )}
              </NavLink>

              <NavLink
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-2xl sm:text-[26px] font-serif font-bold tracking-tight transition-colors py-1.5 ${
                    isActive
                      ? 'text-white flex items-center justify-between font-extrabold'
                      : 'text-[#D9C08A] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>Wholesale Catalog</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#D9C08A] shadow-[0_0_10px_rgba(217,192,138,0.9)] shrink-0" />
                    )}
                  </>
                )}
              </NavLink>

              {/* How It Works Mobile Accordion Sub-Menu */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setMobileHowItWorksOpen((prev) => !prev)}
                  className={`w-full flex items-center justify-between text-2xl sm:text-[26px] font-serif font-bold tracking-tight transition-colors py-1.5 cursor-pointer touch-manipulation min-h-[44px] ${
                    isHowItWorksActive ? 'text-white' : 'text-[#D9C08A] hover:text-white'
                  }`}
                  aria-expanded={mobileHowItWorksOpen}
                >
                  <span className="flex items-center gap-2">
                    <span>How It Works</span>
                  </span>
                  <CaretDown
                    size={20}
                    className={`transition-transform duration-200 ${
                      mobileHowItWorksOpen ? 'rotate-180 text-white' : 'text-[#D9C08A]'
                    }`}
                  />
                </button>

                {mobileHowItWorksOpen && (
                  <div className="pl-3 py-1 space-y-1.5 border-l-2 border-[#D9C08A]/35 ml-2 mt-1 animate-in fade-in duration-150">
                    <NavLink
                      to="/how-it-works"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-all ${
                          isActive
                            ? 'bg-[#D9C08A]/15 text-[#D9C08A] font-bold border border-[#D9C08A]/30'
                            : 'text-[#F4F7F5] hover:bg-white/[0.04]'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag size={18} className="text-[#34D399] shrink-0" />
                        <span>How Selling Works (4-Step)</span>
                      </div>
                      {location.pathname === '/how-it-works' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A]" />
                      )}
                    </NavLink>

                    <NavLink
                      to="/tutorials"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium min-h-[44px] transition-all ${
                          isActive
                            ? 'bg-[#D9C08A]/15 text-[#D9C08A] font-bold border border-[#D9C08A]/30'
                            : 'text-[#F4F7F5] hover:bg-white/[0.04]'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <VideoCamera size={18} className="text-[#D9C08A] shrink-0" />
                        <span>Tutorials (Video Guides)</span>
                      </div>
                      {location.pathname === '/tutorials' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A]" />
                      )}
                    </NavLink>
                  </div>
                )}
              </div>

              {[
                { label: 'Tiers & Ranks', href: '/ranks' },
                { label: 'Services & Logistics', href: '/services' },
                { label: 'About Us', href: '/about' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact VIP', href: '/contact' },
              ].map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block text-2xl sm:text-[26px] font-serif font-bold tracking-tight transition-colors py-1.5 ${
                      isActive
                        ? 'text-white flex items-center justify-between font-extrabold'
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

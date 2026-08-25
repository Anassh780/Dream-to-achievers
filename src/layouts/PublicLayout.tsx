import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import { SITE_CONFIG } from '@/config/site';
import {
  List,
  X,
  WhatsappLogo,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Products', href: '/products' },
    { label: 'Rank Journey', href: '/ranks' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ];

  const whatsappDirectUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hi Dream to Achievers team, I would like to inquire about partner onboarding and catalog distribution.'
  )}`;

  return (
    <div className="min-h-screen bg-[#06090F] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#3B82F6]/30 overflow-x-hidden grain-overlay">
      {/* Floating Glass Pill Navigation Bar (Step 4) */}
      <div className="fixed top-4 sm:top-6 inset-x-0 z-50 px-4 sm:px-6 pointer-events-none flex justify-center">
        <header
          className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border ${
            scrolled
              ? 'bg-[#06090F]/85 backdrop-blur-2xl border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
              : 'bg-[#06090F]/70 backdrop-blur-xl border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Logo Left */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <DreamLogo size={26} />
          </Link>

          {/* Navigation Centered */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href);

              return (
                <NavLink
                  key={link.label}
                  to={link.href}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 font-medium ${
                    isActive
                      ? 'text-white bg-white/10 shadow-inner font-semibold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Desk */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#4ADE80] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 transition-colors border border-[#22C55E]/20"
            >
              <WhatsappLogo size={14} weight="fill" />
              <span>WhatsApp</span>
            </a>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="rounded-full px-4">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-1.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-full px-3 text-xs text-white/80 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full px-4 group"
                    iconRight={
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white ml-0.5 group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight size={10} weight="bold" />
                      </span>
                    }
                  >
                    Join Partner
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Drawer Trigger */}
          <div className="lg:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="rounded-full text-xs py-1 px-3">
                  App
                </Button>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/5 text-[#CBD5E1] hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
            </button>
          </div>
        </header>
      </div>

      {/* Screen-Filling Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#06090F]/95 backdrop-blur-3xl p-6 pt-24 flex flex-col justify-between animate-in fade-in duration-300">
          <nav className="space-y-2">
            <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block px-3 pb-2">
              Platform Navigation
            </span>
            {navLinks.map((link, idx) => (
              <NavLink
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="block px-4 py-3 rounded-2xl text-lg font-heading font-semibold text-[#CBD5E1] hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl text-sm font-medium text-[#4ADE80] bg-[#22C55E]/10 border border-[#22C55E]/20"
            >
              <WhatsappLogo size={18} weight="fill" />
              <span>Official WhatsApp Desk</span>
            </a>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full justify-center rounded-2xl">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center rounded-2xl">
                    Join Partner
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer for Floating Nav */}
      <div className="h-16 sm:h-20" />

      {/* Main Public Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* High-Fashion Editorial Oversized Footer (Step 15) */}
      <footer className="bg-[#05070C] border-t border-white/[0.08] pt-20 pb-12 text-xs text-[#94A3B8] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16 relative z-10">
          {/* Top CTA Band */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
                  Get started
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  Ready to start earning?
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  Create your free partner account and get access to our wholesale catalog today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full px-6 group"
                    iconRight={
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white ml-1 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={13} weight="bold" />
                      </span>
                    }
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Column 1 (5 cols): Identity & Statement */}
            <div className="md:col-span-5 space-y-4">
              <DreamLogo size={32} />
              <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed max-w-sm">
                Dream to Achievers connects ambitious partners with wholesale consumer products and a clear path to cash rewards.
              </p>
              <div className="flex items-center space-x-3 text-xs text-[#64748B] pt-2">
                <span>Support: {SITE_CONFIG.supportEmail}</span>
                <span>•</span>
                <span>WhatsApp: {SITE_CONFIG.whatsappNumber}</span>
              </div>
            </div>

            {/* Column 2 (3 cols): Architecture */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Platform Architecture
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/products" className="hover:text-white transition-colors">
                    Wholesale Products Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/ranks" className="hover:text-white transition-colors">
                    4-Tier Rank Milestone Journey
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition-colors">
                    6-Step Business Blueprint
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-white transition-colors">
                    Automation & Paid Media
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 (4 cols): Governance & Trust */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">
                Compliance & Policies
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Partner Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Data Privacy & Security
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="hover:text-white transition-colors">
                    Statutory Earnings Disclaimer
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Official Growth & Support Desk
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Statutory Earnings Disclaimer Notice Box */}
          <div className="p-5 rounded-2xl bg-[#0A0F19] border border-white/[0.04] text-[11px] leading-relaxed text-[#64748B]">
            <p>
              <strong className="text-[#94A3B8]">Official Earnings & Product Representation Notice:</strong> {SITE_CONFIG.disclaimerText}
            </p>
          </div>

          {/* Huge Typographic Brand Watermark */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} {SITE_CONFIG.brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

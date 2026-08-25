import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import {
  List,
  X,
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkle,
} from '@phosphor-icons/react';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const siteConfig = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Products', href: '/products' },
    { label: 'Ranks', href: '/ranks' },
    { label: 'Capabilities', href: '/services' },
    { label: 'Founder', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const whatsappDirectUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hi Dream to Achievers team, I would like to inquire about partner onboarding and catalog distribution.'
  )}`;

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden grain-overlay">
      {/* Floating Glass Pill Navigation Bar */}
      <div className="fixed top-4 sm:top-6 inset-x-0 z-50 px-4 sm:px-6 pointer-events-none flex justify-center">
        <header
          className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border ${
            scrolled
              ? 'bg-[#030712]/90 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.1)]'
              : 'bg-[#080E1E]/80 backdrop-blur-xl border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
          }`}
        >
          {/* Logo Left */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <DreamLogo size={28} />
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
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 font-medium ${
                    isActive
                      ? 'text-white bg-white/10 shadow-inner font-semibold border border-white/10'
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
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            >
              <WhatsappLogo size={14} weight="fill" />
              <span>WhatsApp</span>
            </a>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="rounded-full px-5 font-bold">
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
                    className="rounded-full px-4 group font-bold"
                    iconRight={
                      <span className="w-4 h-4 rounded-full bg-slate-950/20 flex items-center justify-center text-slate-950 ml-0.5 group-hover:translate-x-0.5 transition-transform">
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
        <div className="fixed inset-0 z-40 bg-[#030712]/95 backdrop-blur-3xl p-6 pt-24 flex flex-col justify-between animate-in fade-in duration-300">
          <nav className="space-y-2">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block px-3 pb-2">
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
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
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

      {/* Page Content Outlet */}
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>

      {/* High-End Editorial Footer */}
      <footer className="border-t border-white/[0.08] bg-[#02050E] text-[#94A3B8] font-sans">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12 space-y-12">
          
          {/* Footer Top Conversion Band */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0C152B] to-[#080E1E] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="space-y-1 text-center md:text-left relative z-10">
              <span className="text-[10px] font-mono font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider inline-block mb-2">
                Partner Opportunity
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
                Ready to start earning?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Create your free partner account and get access to our wholesale catalog today.
              </p>
            </div>
            <div className="flex items-center gap-3 relative z-10 shrink-0">
              <Link to="/signup">
                <Button variant="primary" size="md" className="rounded-full px-6 font-bold" iconRight={<ArrowRight size={14} weight="bold" />}>
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
            <div className="md:col-span-5 space-y-4">
              <Link to="/" className="inline-block">
                <DreamLogo size={32} />
              </Link>
              <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed max-w-sm">
                Dream to Achievers connects ambitious partners with high-margin wholesale consumer products and a guaranteed path to milestone rewards.
              </p>
              
              {/* Official Social Media Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href={siteConfig.tiktokUrl || "https://www.tiktok.com/@dream.to.achievers"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.3 6.3 0 0 0 1.86-4.47V8.62a8.27 8.27 0 0 0 4.85 1.57v-3.5h-.93z" />
                  </svg>
                  <span>@dream.to.achievers</span>
                </a>

                <a
                  href={siteConfig.whatsappChannelUrl || "https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors"
                >
                  <WhatsappLogo size={12} weight="fill" />
                  <span>WhatsApp Channel</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] pt-1 font-mono">
                <a href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`} className="hover:text-cyan-400 transition-colors">
                  {siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}
                </a>
                <span>•</span>
                <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                  WhatsApp: {siteConfig.whatsappNumber || '+92 305 4511395'}
                </a>
              </div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] font-mono">
                Platform Architecture
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/products" className="hover:text-cyan-400 transition-colors">
                    Wholesale Products Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/ranks" className="hover:text-cyan-400 transition-colors">
                    4-Tier Rank Milestones
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-cyan-400 transition-colors">
                    Growth & Automation Services
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-white font-semibold uppercase tracking-wider text-[11px] font-mono">
                Compliance & Policies
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                    Partner Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
                    Data Privacy & Security
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="hover:text-cyan-400 transition-colors">
                    Statutory Earnings Disclaimer
                  </Link>
                </li>
                <li className="flex items-center space-x-1.5 text-[#64748B] pt-1">
                  <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
                  <span>Verified Partner Association Platform</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#64748B]">
            <p>© {new Date().getFullYear()} {siteConfig.brandName || 'Dream to Achievers'}. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-white transition-colors">Partner Portal</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
import {
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkle,
  Package,
  Trophy,
  TreeStructure,
  Lightning,
  FileText,
  LockKey,
  Scales,
  Certificate,
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Globe,
  ArrowSquareOut,
} from '@phosphor-icons/react';

// Crisp Vector TikTok Icon
const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.3 6.3 0 0 0 1.86-4.47V8.62a8.27 8.27 0 0 0 4.85 1.57v-3.5h-.93z" />
  </svg>
);

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const siteConfig = useSiteSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandArchitecture, setExpandArchitecture] = useState(true);
  const [expandCompliance, setExpandCompliance] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden w-full max-w-full">
      {/* 1. Sleek Floating Glass Navigation Bar */}
      <div className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center">
        <header
          className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full px-3.5 sm:px-6 py-2.5 flex items-center justify-between border ${
            scrolled
              ? 'bg-[#030712]/92 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(0,242,254,0.12)]'
              : 'bg-[#080E1E]/85 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Logo Left */}
          <Link to="/" className="flex items-center space-x-2 shrink-0 group">
            <DreamLogo size={30} />
          </Link>

          {/* Desktop Navigation Centered */}
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
                      ? 'text-white bg-white/10 shadow-inner font-semibold border border-white/15'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* WhatsApp Quick Pill (Desktop) */}
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            >
              <WhatsappLogo size={14} weight="fill" />
              <span>WhatsApp</span>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="rounded-full px-3 sm:px-3.5 text-xs font-semibold text-cyan-300 border-cyan-400/40 hover:bg-cyan-400/10 shadow-[0_0_12px_rgba(0,242,254,0.2)]">
                      Admin Center
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" className="rounded-full px-3.5 sm:px-4 font-bold text-xs">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <Link to="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm" className="rounded-full px-3 text-xs text-slate-300 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full px-3.5 sm:px-4 group font-bold text-xs shadow-md"
                    iconRight={
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-950/20 flex items-center justify-center text-slate-950 ml-0.5 group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight size={9} weight="bold" />
                      </span>
                    }
                  >
                    Join
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Animated Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Toggle Navigation Menu"
            >
              <span
                className={`w-4 h-0.5 bg-current rounded-full transition-transform duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-current rounded-full transition-opacity duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`w-4 h-0.5 bg-current rounded-full transition-transform duration-300 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          </div>
        </header>
      </div>

      {/* Screen-Filling Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#020612]/95 backdrop-blur-3xl p-5 pt-24 flex flex-col justify-between animate-in fade-in duration-300 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-white/[0.08]">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Platform Navigation
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                7 Sections
              </span>
            </div>

            <nav className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.href);

                return (
                  <NavLink
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-heading font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={14} className="text-slate-500" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl text-sm font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 shadow-lg active:scale-98 transition-transform"
            >
              <WhatsappLogo size={18} weight="fill" />
              <span>Official WhatsApp Help Desk</span>
            </a>

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full justify-center rounded-2xl text-xs font-semibold">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center rounded-2xl text-xs font-bold shadow-lg">
                    Join Partner
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="md" className="w-full justify-center rounded-2xl text-xs font-semibold text-cyan-300 border-cyan-400/40">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={isAdmin ? '' : 'col-span-2'}>
                  <Button variant="primary" size="md" className="w-full justify-center rounded-2xl text-xs font-bold">
                    Partner Dashboard
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

      {/* 2. Premium Enterprise-Level Footer Experience */}
      <footer className="border-t border-white/[0.08] bg-[#01040D] text-[#94A3B8] font-sans relative overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 pb-12 space-y-12 relative z-10">
          
          {/* Footer Conversion Card */}
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#080E1E] to-[#030712] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,254,0.08)] relative overflow-hidden">
            <div className="space-y-1.5 text-center md:text-left relative z-10">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
                <Sparkle size={11} weight="fill" className="text-cyan-400" />
                <span>Enterprise Partner Opportunity</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                Scale your wholesale distribution today.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Unlock high-margin skincare and electronics inventory with direct milestone rewards.
              </p>
            </div>
            <div className="flex items-center gap-3 relative z-10 shrink-0 w-full sm:w-auto">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto rounded-xl px-7 font-bold text-xs shadow-xl" iconRight={<ArrowRight size={14} weight="bold" />}>
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Footer Structured Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            
            {/* Column 1: Main Brand Authority & Verified Seal Card (5 cols) */}
            <div className="md:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#060B18] border border-white/[0.08] flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                {/* Brandmark + Verified Badge */}
                <div className="flex items-center justify-between">
                  <Link to="/" className="inline-block">
                    <DreamLogo size={32} />
                  </Link>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.15)]">
                    <ShieldCheck size={12} weight="fill" className="text-cyan-400" />
                    <span>VERIFIED</span>
                  </span>
                </div>

                {/* Editorial Description */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  DreamToAchievers connects ambitious partners with verified wholesale product margins, performance marketing infrastructure, and cash milestone rewards.
                </p>

                {/* Social Media Interactive Pills (TikTok & WhatsApp Channel) */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block tracking-wider">
                    Official Broadcast & Community
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* TikTok Pill */}
                    <a
                      href={siteConfig.tiktokUrl || 'https://www.tiktok.com/@dream.to.achievers'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 transition-all text-xs text-rose-300 font-mono shadow-sm active:scale-98"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300">
                          <TikTokIcon size={12} />
                        </div>
                        <span className="font-semibold truncate max-w-[100px]">@dream.to.achievers</span>
                      </div>
                      <ArrowSquareOut size={13} className="text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>

                    {/* WhatsApp VIP Channel Pill */}
                    <a
                      href={siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/40 transition-all text-xs text-emerald-300 font-mono shadow-sm active:scale-98"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <WhatsappLogo size={13} weight="fill" />
                        </div>
                        <span className="font-semibold">VIP Channel</span>
                      </div>
                      <ArrowSquareOut size={13} className="text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Support Desk Strip */}
              <div className="p-3.5 rounded-2xl bg-[#030712] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300 font-mono">
                <a
                  href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`}
                  className="flex items-center space-x-1.5 hover:text-cyan-400 transition-colors"
                >
                  <EnvelopeSimple size={14} className="text-cyan-400" />
                  <span className="truncate">{siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}</span>
                </a>
                <span className="hidden sm:inline text-white/20">•</span>
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-emerald-400 hover:underline"
                >
                  <WhatsappLogo size={14} weight="fill" />
                  <span>{siteConfig.whatsappNumber || '+92 305 4511395'}</span>
                </a>
              </div>
            </div>

            {/* Column 2: Platform Architecture Structured Card (3.5 cols) */}
            <div className="md:col-span-3.5 p-6 rounded-3xl bg-[#060B18] border border-white/[0.08] flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                <div 
                  onClick={() => setExpandArchitecture(!expandArchitecture)}
                  className="flex items-center justify-between pb-3 border-b border-white/[0.08] cursor-pointer sm:cursor-default"
                >
                  <span className="text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                    <Globe size={15} className="text-cyan-400" />
                    <span>Platform Architecture</span>
                  </span>
                  <button className="sm:hidden text-slate-400">
                    {expandArchitecture ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>
                </div>

                <div className={`space-y-1.5 pt-3 ${expandArchitecture ? 'block' : 'hidden sm:block'}`}>
                  {[
                    { label: 'Wholesale Products Catalog', href: '/products', icon: Package, badge: 'Active' },
                    { label: '4-Tier Rank Milestones', href: '/ranks', icon: Trophy, badge: 'PKR 10k' },
                    { label: 'How It Works Blueprint', href: '/how-it-works', icon: TreeStructure },
                    { label: 'Growth & Automation Services', href: '/services', icon: Lightning },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-xs text-slate-300 hover:text-white"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                            <Icon size={14} />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-[10px] font-mono text-slate-500">
                  Decentralized Catalog & Order Routing
                </p>
              </div>
            </div>

            {/* Column 3: Compliance & Security Structured Card (3.5 cols) */}
            <div className="md:col-span-3.5 p-6 rounded-3xl bg-[#060B18] border border-white/[0.08] flex flex-col justify-between space-y-4 shadow-xl">
              <div>
                <div 
                  onClick={() => setExpandCompliance(!expandCompliance)}
                  className="flex items-center justify-between pb-3 border-b border-white/[0.08] cursor-pointer sm:cursor-default"
                >
                  <span className="text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck size={15} className="text-cyan-400" />
                    <span>Compliance & Policies</span>
                  </span>
                  <button className="sm:hidden text-slate-400">
                    {expandCompliance ? <CaretUp size={14} /> : <CaretDown size={14} />}
                  </button>
                </div>

                <div className={`space-y-1.5 pt-3 ${expandCompliance ? 'block' : 'hidden sm:block'}`}>
                  {[
                    { label: 'Partner Terms & Conditions', href: '/terms', icon: FileText },
                    { label: 'Data Privacy & Security', href: '/privacy', icon: LockKey },
                    { label: 'Statutory Earnings Disclaimer', href: '/disclaimer', icon: Scales },
                    { label: 'Platform Standards', href: '/terms', icon: Certificate },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors text-xs text-slate-300 hover:text-white"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                            <Icon size={14} />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Prominent Verification Badge */}
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center space-x-2.5 text-xs text-cyan-300">
                <ShieldCheck size={18} weight="fill" className="text-cyan-400 shrink-0" />
                <div className="leading-tight">
                  <p className="font-bold text-[11px]">Verified Partner Association</p>
                  <p className="text-[10px] text-cyan-400/80 font-mono">Reg. DTA-78401 • Encrypted</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Bottom Legal, Status & Copyright Bar */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-center sm:text-left">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-mono text-[11px] text-slate-300">
                System Status: <strong className="text-emerald-400 font-semibold">100% Operational</strong>
              </span>
            </div>

            <p className="text-[11px] text-center">
              © {new Date().getFullYear()} {siteConfig.brandName || 'Dream to Achievers'}. All rights reserved.
            </p>

            <div className="flex items-center space-x-4 text-[11px] font-mono">
              <Link to="/login" className="hover:text-cyan-300 transition-colors">Partner Portal</Link>
              <span>•</span>
              <Link to="/signup" className="hover:text-cyan-300 transition-colors">Register</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-cyan-300 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

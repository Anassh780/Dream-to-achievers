import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { SocialChannelsBar } from '@/components/ui/SocialIcons';
import { SwitchButton } from '@/components/ui/SwitchButton';
import {
  List,
  X,
  ArrowRight,
  ShieldCheck,
  Package,
  Trophy,
  ChartLineUp,
  WhatsappLogo,
} from '@phosphor-icons/react';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const siteConfig = useSiteSettings();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

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
    <div className="min-h-screen flex flex-col bg-[#FAF7EF] text-[#1E241F] font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. Clean Editorial Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#FAF7EF]/95 backdrop-blur-md border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <DreamLogo size={34} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-[13px] font-medium text-[#5B5C50]">
            {navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `transition-colors hover:text-[#1E241F] ${
                    isActive ? 'text-[#1F4D3E] font-semibold' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Header Action Controls */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <SwitchButton size="sm" showLabel={false} />

            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="text-xs font-medium px-2.5">
                  Admin
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="text-xs font-medium">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-medium text-[#5B5C50] hover:text-[#1E241F]">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="text-xs font-medium shadow-2xs">
                    Join Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button with SwitchButton */}
          <div className="md:hidden flex items-center gap-2">
            <SwitchButton size="sm" showLabel={false} />
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-lg text-[#1E241F] hover:bg-[#F1ECDD] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileDrawerOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] z-30 bg-[#FAF7EF] p-6 flex flex-col justify-between border-b border-[#E3DCC8] animate-in slide-in-from-top-2">
          <div className="space-y-4">
            <span className="text-[10px] font-mono uppercase text-[#7C7D70] font-semibold tracking-wider block">
              Menu Navigation
            </span>
            <div className="space-y-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={({ isActive }) =>
                    `block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1F4D3E] text-white font-semibold'
                        : 'text-[#1E241F] hover:bg-[#F1ECDD]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#E3DCC8] space-y-2.5">
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileDrawerOpen(false)} className="block">
                <Button variant="outline" size="md" className="w-full justify-center text-xs font-mono text-[#1F4D3E] border-[#1F4D3E]/30 bg-[#1F4D3E]/5">
                  🔐 Open Admin Portal
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="block">
                <Button variant="primary" size="md" className="w-full justify-center">
                  Open Partner Dashboard
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileDrawerOpen(false)} className="block">
                  <Button variant="outline" size="md" className="w-full justify-center text-xs">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileDrawerOpen(false)} className="block">
                  <Button variant="primary" size="md" className="w-full justify-center text-xs">
                    Join Free
                  </Button>
                </Link>
              </div>
            )}

            {!isAdmin && (
              <Link to="/admin" onClick={() => setMobileDrawerOpen(false)} className="block text-center pt-1">
                <span className="text-[11px] font-mono text-[#5B5C50] hover:text-[#1E241F] underline">
                  Admin Login Access
                </span>
              </Link>
            )}

            <div className="pt-3 border-t border-[#E3DCC8] space-y-2">
              <span className="text-[10.5px] font-mono text-[#5B5C50] uppercase tracking-wider block">
                Connect With Us
              </span>
              <SocialChannelsBar size={16} />
            </div>
          </div>
        </div>
      )}

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Enterprise Multi-Column Editorial Footer */}
      <footer className="border-t border-[#E3DCC8] bg-[#F1ECDD] pt-14 pb-10 text-xs text-[#5B5C50]">
        <div className="max-w-[1180px] mx-auto px-6 sm:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Col 1: Brand & Credibility */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <DreamLogo size={32} />
              </Link>
              <p className="text-xs text-[#5B5C50] max-w-sm leading-relaxed">
                Direct-to-reseller wholesale commerce and structured partner growth platform. Transparent unit economics, nationwide COD fulfillment, and verified cash rewards.
              </p>
              
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-[#1E241F] font-semibold block uppercase tracking-wider">
                  Official Channels &amp; Community:
                </span>
                <SocialChannelsBar size={16} />
              </div>
            </div>

            {/* Col 2: Wholesale Catalog */}
            <div className="space-y-2.5">
              <span className="font-serif font-semibold text-[13px] text-[#1E241F] block">
                Wholesale Catalog
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/products?category=skincare" className="hover:text-[#1E241F] transition-colors">
                    Skincare &amp; Beauty
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=electronics" className="hover:text-[#1E241F] transition-colors">
                    Lifestyle Electronics
                  </Link>
                </li>
                <li>
                  <Link to="/products?category=wellness" className="hover:text-[#1E241F] transition-colors">
                    Health &amp; Wellness
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="hover:text-[#1E241F] transition-colors">
                    All Verified SKUs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Partner Program */}
            <div className="space-y-2.5">
              <span className="font-serif font-semibold text-[13px] text-[#1E241F] block">
                Partner Growth
              </span>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/ranks" className="hover:text-[#1E241F] transition-colors">
                    Milestone Tiers
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-[#1E241F] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-[#1E241F] transition-colors">
                    Logistics &amp; Dispatch
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-[#1E241F] transition-colors">
                    Become a Partner
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Support */}
            <div className="space-y-2.5">
              <span className="font-serif font-semibold text-[13px] text-[#1E241F] block">
                Support &amp; Desk
              </span>
              <ul className="space-y-1.5">
                <li>
                  <a
                    href={siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#1E241F] transition-colors"
                  >
                    <WhatsappLogo size={14} className="text-[#1F4D3E]" />
                    <span>WhatsApp Channel</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}?subject=Partner%20Support%20Query`}
                    className="hover:text-[#1E241F] transition-colors"
                  >
                    Email Support
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#1E241F] transition-colors">
                    Help Desk &amp; Queries
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#1E241F] transition-colors">
                    About Founder
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-[#1E241F] transition-colors font-mono text-[11px] text-[#1F4D3E]">
                    Admin Portal ↗
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#7C7D70]">
            <p>© {new Date().getFullYear()} Dream to Achievers (DTA). All rights reserved.</p>
            <p>Verified B2B Wholesale Distribution Network</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

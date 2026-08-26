import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Wholesale catalog', href: '/products' },
    { label: 'Partner journey', href: '/ranks' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EF] text-[#1E241F] font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. Clean Editorial Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#FAF7EF]/95 backdrop-blur-md border-b border-[#E3DCC8]">
        <div className="max-w-[1180px] mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group">
            <DreamLogo size={36} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium text-[#5B5C50]">
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
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="text-xs font-medium">
                  Admin portal
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" className="text-xs font-medium">
                  Partner dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-xs font-medium">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="text-xs font-medium">
                    Become a partner
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden p-2 rounded-lg text-[#1E241F] hover:bg-[#F1ECDD] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileDrawerOpen ? <X size={22} /> : <List size={22} />}
          </button>

        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] z-30 bg-[#FAF7EF] p-6 flex flex-col justify-between border-b border-[#E3DCC8] animate-in slide-in-from-top-2">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-[#7C7D70] font-semibold tracking-wider block">
              Menu Navigation
            </span>
            <div className="space-y-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#1E241F] hover:bg-[#F1ECDD] transition-colors"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#E3DCC8] space-y-2.5">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMobileDrawerOpen(false)} className="block">
                <Button variant="primary" size="md" className="w-full justify-center text-xs">
                  Open Partner Dashboard
                </Button>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setMobileDrawerOpen(false)}>
                  <Button variant="outline" size="md" className="w-full justify-center text-xs">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileDrawerOpen(false)}>
                  <Button variant="primary" size="md" className="w-full justify-center text-xs">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
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
            <div className="lg:col-span-2 space-y-3.5">
              <Link to="/" className="inline-block">
                <DreamLogo size={32} />
              </Link>
              <p className="text-xs text-[#5B5C50] max-w-sm leading-relaxed">
                Direct-to-reseller wholesale commerce and structured partner growth platform. Transparent unit economics, nationwide COD fulfillment, and verified cash rewards.
              </p>
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
                    href="https://wa.me/923237583685"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#1E241F] transition-colors"
                  >
                    <WhatsappLogo size={14} className="text-[#1F4D3E]" />
                    <span>WhatsApp Desk</span>
                  </a>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#1E241F] transition-colors">
                    About DTA
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#1E241F] transition-colors">
                    Partner Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#1E241F] transition-colors">
                    Privacy Policy
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

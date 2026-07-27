import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowUpRight, List, X, Sparkle, TrendUp } from '@phosphor-icons/react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Growth Stack', href: '#stack' },
    { label: 'Case Studies', href: '#case-studies' },
    { label: 'Book Audit', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 pointer-events-none">
      {/* Floating Island Navbar Container */}
      <div
        className={`max-w-5xl mx-auto px-6 py-3.5 rounded-full pointer-events-auto transition-all duration-500 flex items-center justify-between ${
          scrolled
            ? 'glass-panel border-white/15 bg-[#07090e]/85 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            : 'glass-panel border-white/10 bg-[#07090e]/60 backdrop-blur-md'
        }`}
      >
        {/* Brand Identity */}
        <a href="#" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff] font-mono font-bold text-xs group-hover:scale-105 group-hover:bg-[#00f0ff]/20 transition-all">
            <TrendUp size={16} weight="bold" />
          </div>
          <span className="font-heading font-extrabold text-base text-white tracking-tight group-hover:text-[#00f0ff] transition-colors">
            VANGUARD<span className="text-[#00f0ff]">.AGENCY</span>
          </span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-mono tracking-wide text-slate-300 hover:text-[#00f0ff] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center space-x-3">
          <Badge variant="dot" size="sm" className="hidden lg:inline-flex">
            Scale Mode: Active
          </Badge>
          <a href="#contact">
            <Button
              variant="primary"
              size="sm"
              iconRight={
                <span className="w-5 h-5 rounded-full bg-[#080b11]/20 flex items-center justify-center ml-1">
                  <ArrowUpRight size={12} weight="bold" />
                </span>
              }
            >
              Scale Brand
            </Button>
          </a>
        </div>

        {/* Mobile Hamburger Morph Button */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white transition-transform active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X size={22} className="text-[#00f0ff]" /> : <List size={22} />}
        </button>
      </div>

      {/* Mobile Menu Fullscreen Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden pointer-events-auto fixed inset-0 top-20 bg-[#07090e]/95 backdrop-blur-3xl p-8 flex flex-col justify-between z-40 animate-in fade-in duration-300">
          <div className="space-y-6">
            <Badge variant="accent" size="md">
              <Sparkle size={14} className="text-[#00f0ff]" /> Vanguard Growth Menu
            </Badge>
            <nav className="space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-2xl font-heading font-bold text-white hover:text-[#00f0ff] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <Badge variant="dot" size="md" className="w-full justify-center">
              Available for Q3/Q4 Partnerships
            </Badge>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="lg" className="w-full justify-center">
                Book Growth Audit
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  House,
  ChartLineUp,
  Package,
  ShoppingCart,
  Users,
  Gift,
  Bell,
  UserCircle,
  SignOut,
  List,
  X,
  ShieldStar,
  Copy,
  Check,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { referralService } from '@/services/referralService';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, rankProgress, unreadNotifsCount, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <ShieldStar size={48} className="text-cyan-400 animate-pulse" />
        <h2 className="text-2xl font-heading font-bold text-white">Partner Session Required</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Please sign in to access your partner analytics, customer sales ledgers, and milestone rewards.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="md" className="rounded-xl font-bold">
              Partner Sign In
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="md" className="rounded-xl">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: House },
    { label: 'Rank Progress', href: '/dashboard/rank-progress', icon: ChartLineUp, badge: rankProgress?.nextRank ? `${rankProgress.overallProgressPercent}%` : 'MAX' },
    { label: 'Products', href: '/dashboard/products', icon: Package },
    { label: 'Sales & Margins', href: '/dashboard/sales', icon: ShoppingCart, count: rankProgress?.qualifyingSales },
    { label: 'Referral Community', href: '/dashboard/referrals', icon: Users, count: rankProgress?.qualifyingCommunity },
    { label: 'Milestone Rewards', href: '/dashboard/rewards', icon: Gift },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, count: unreadNotifsCount || undefined },
    { label: 'Profile', href: '/dashboard/profile', icon: UserCircle },
  ];

  const rankBadgeStyles: Record<string, string> = {
    silver: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
    platinum: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
    gold: 'bg-amber-500/15 text-amber-300 border-amber-400/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    diamond: 'bg-purple-500/15 text-purple-300 border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    unranked: 'bg-white/5 text-slate-400 border-white/10',
  };

  const handleCopyRef = () => {
    if (!user) return;
    const url = referralService.getReferralUrl(user.referralCode);
    navigator.clipboard.writeText(url);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-cyan-500/30">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#080E1E] border-r border-white/[0.08] p-4 shrink-0 min-h-screen sticky top-0 shadow-2xl">
        <div className="space-y-5">
          {/* Brand Logo & Public Link */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/">
              <DreamLogo size={26} />
            </Link>
            <Link
              to="/"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="View Public Site"
            >
              <ArrowSquareOut size={16} />
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-[#0C152B] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {user.fullName}
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase ${
                  rankBadgeStyles[user.currentRankSlug] || rankBadgeStyles.unranked
                }`}
              >
                {user.currentRankSlug}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Referral Code Quick Copy Pill */}
          <div className="p-2.5 rounded-xl bg-[#030712] border border-white/[0.06] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Referral Code</span>
              <span className="font-mono font-bold text-cyan-400">{user.referralCode}</span>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy referral link"
            >
              {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block pb-1">
              PARTNER MENU
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 font-semibold border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-200">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <SignOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top App Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#080E1E] border-b border-white/[0.08] sticky top-0 z-40">
        <Link to="/">
          <DreamLogo size={24} />
        </Link>
        <div className="flex items-center space-x-2">
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase ${
              rankBadgeStyles[user.currentRankSlug] || rankBadgeStyles.unranked
            }`}
          >
            {user.currentRankSlug}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
            aria-label="Toggle Dashboard Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#030712]/95 backdrop-blur-2xl p-6 pt-16 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <p className="font-bold text-white">{user.fullName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-white/5 text-slate-300">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 font-medium"
                  >
                    <Icon size={20} className="text-cyan-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-rose-500/10 text-rose-300 text-sm font-semibold border border-rose-500/20"
            >
              <SignOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Sub-Page Outlet */}
      <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

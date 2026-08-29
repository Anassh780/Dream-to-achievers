import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SwitchButton } from '@/components/ui/SwitchButton';
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
  ShieldCheck,
  Copy,
  Check,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { referralService } from '@/services/referralService';
import { DreamLogo } from '@/components/ui/DreamLogo';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, rankProgress, unreadNotifsCount, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <ShieldCheck size={48} className="text-[#1F4D3E]" />
        <h2 className="font-serif text-2xl font-medium text-[#1E241F]">Partner Session Required</h2>
        <p className="text-xs text-[#5B5C50] max-w-md">
          Please sign in to access your partner analytics, wholesale inventory ledger, and milestone rewards.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="md" className="text-xs font-medium">
              Partner Sign In
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md" className="text-xs font-medium">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: House },
    { label: 'Wholesale Inventory', href: '/dashboard/products', icon: Package },
    { label: 'Rank Progress', href: '/dashboard/rank-progress', icon: ChartLineUp, badge: rankProgress?.nextRank ? `${rankProgress.overallProgressPercent}%` : 'MAX' },
    { label: 'Direct Sales', href: '/dashboard/sales', icon: ShoppingCart, count: rankProgress?.qualifyingSales },
    { label: 'Referral Network', href: '/dashboard/referrals', icon: Users, count: rankProgress?.qualifyingCommunity },
    { label: 'Rewards', href: '/dashboard/rewards', icon: Gift },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      count: unreadNotifsCount || undefined,
      isAlert: true,
    },
    { label: 'Profile', href: '/dashboard/profile', icon: UserCircle },
  ];

  const handleCopyRef = () => {
    if (!user) return;
    const url = referralService.getReferralUrl(user.referralCode);
    navigator.clipboard.writeText(url);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col md:flex-row font-sans selection:bg-[#B8862E]/25">
      
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-[#E3DCC8] p-4 shrink-0 min-h-screen sticky top-0 shadow-xs">
        <div className="space-y-5">
          {/* Logo & Public Site Link */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/" className="flex items-center gap-2">
              <DreamLogo size={28} showText={false} />
              <span className="font-serif font-semibold text-sm text-[#1E241F]">Partner Hub</span>
            </Link>
            <Link
              to="/"
              className="p-1.5 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF] transition-colors"
              title="View Public Storefront"
            >
              <ArrowSquareOut size={16} />
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1E241F] truncate max-w-[120px]">
                {user.fullName}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8] uppercase">
                {user.currentRankSlug}
              </span>
            </div>
            <p className="text-[10.5px] font-mono text-[#5B5C50] truncate">{user.email}</p>
          </div>

          {/* Admin Switch Banner (If user is admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] hover:bg-[#EAE4D2] transition-colors text-xs group"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#1F4D3E]" />
                <span className="font-semibold text-[#1E241F]">Admin Portal</span>
              </div>
              <ArrowSquareOut size={13} className="text-[#5B5C50]" />
            </Link>
          )}

          {/* Referral Code Quick Copy Pill */}
          <div className="p-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-[#5B5C50] block">Referral Code</span>
              <span className="font-mono font-bold text-[#1F4D3E]">{user.referralCode}</span>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-1.5 rounded-lg bg-white border border-[#E3DCC8] hover:bg-[#F1ECDD] text-[#1E241F] transition-colors cursor-pointer"
              title="Copy referral link"
            >
              {copiedRef ? <Check size={14} className="text-[#1F4D3E]" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium ${
                    isActive
                      ? 'bg-[#1F4D3E] text-white font-medium shadow-xs'
                      : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon size={16} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-[#F1ECDD] text-[#5B5C50]'}`}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          item.isAlert
                            ? 'bg-red-600 text-white shadow-2xs animate-pulse'
                            : isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F1ECDD] text-[#5B5C50]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Action */}
        <div className="pt-4 border-t border-[#E3DCC8]">
          <div className="pt-2 border-t border-[#E3DCC8] flex items-center justify-between">
            <SwitchButton size="sm" showLabel={true} className="w-full justify-start text-xs" />
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <SignOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E3DCC8] p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <DreamLogo size={28} showText={false} />
          <span className="font-serif font-semibold text-sm text-[#1E241F]">Partner Hub</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to="/dashboard/notifications"
            className="relative p-2 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </Link>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8] uppercase">
            {user.currentRankSlug}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1E241F] hover:bg-[#FAF7EF]"
          >
            {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-[#FAF7EF] p-5 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1 text-sm">
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg font-medium ${
                    isActive
                      ? 'bg-[#1F4D3E] text-white font-medium'
                      : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#F1ECDD]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && <span className="text-xs font-mono">{item.badge}</span>}
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.isAlert
                            ? 'bg-red-600 text-white animate-pulse'
                            : isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F1ECDD] text-[#5B5C50]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#E3DCC8]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

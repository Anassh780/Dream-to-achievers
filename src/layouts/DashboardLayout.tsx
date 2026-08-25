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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#06090F] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <DreamLogo size={42} />
        <h2 className="text-xl font-heading font-bold text-white">Partner Authentication Required</h2>
        <p className="text-sm text-[#94A3B8] max-w-md">
          Please sign in to your Dream to Achievers partner account to access your performance dashboard, sales tracking, and rank rewards.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="md" className="rounded-xl">
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
    platinum: 'bg-blue-500/10 text-[#60A5FA] border-blue-400/20',
    gold: 'bg-amber-500/10 text-[#FBBF24] border-amber-400/20',
    diamond: 'bg-purple-500/10 text-[#C084FC] border-purple-400/25',
    unranked: 'bg-white/5 text-[#64748B] border-white/10',
  };

  const handleCopyRef = () => {
    if (!user) return;
    const url = referralService.getReferralUrl(user.referralCode);
    navigator.clipboard.writeText(url);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#06090F] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-[#3B82F6]/30">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#0A0F19] border-r border-white/[0.08] p-4 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-5">
          {/* Brand Logo & Public Link */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/">
              <DreamLogo size={26} />
            </Link>
            <Link
              to="/"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-white/5 transition-colors"
              title="View Public Site"
            >
              <ArrowSquareOut size={16} />
            </Link>
          </div>

          {/* Compact User Profile Block */}
          <div className="p-3 rounded-2xl bg-[#0E1626] border border-white/[0.08] space-y-2.5">
            <div className="flex items-center space-x-3">
              <img
                src={
                  user.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0E1626&color=F8FAFC`
                }
                alt={user.fullName}
                className="w-8 h-8 rounded-full border border-white/10 object-cover"
              />
              <div className="overflow-hidden min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">{user.fullName}</h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                      rankBadgeStyles[user.currentRankSlug] || rankBadgeStyles.unranked
                    }`}
                  >
                    {user.currentRankSlug.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-[#64748B]">Partner</span>
                </div>
              </div>
            </div>

            {/* Referral Code Row */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 font-mono text-[11px] text-[#64748B]">
                <span>Code:</span>
                <span className="text-white font-medium">{user.referralCode}</span>
              </div>
              <button
                onClick={handleCopyRef}
                className="p-1 rounded text-[#94A3B8] hover:text-[#3B82F6] hover:bg-white/5 transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                title="Copy Referral Link"
              >
                {copiedRef ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedRef ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Clean Navigation Rows */}
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
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isActive
                      ? 'bg-[#121C2E] text-white font-semibold border-l-[3px] border-[#3B82F6]'
                      : 'text-[#94A3B8] hover:bg-[#0E1626] hover:text-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon size={16} className={isActive ? 'text-[#3B82F6]' : 'text-[#64748B]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#3B82F6]/10 text-[#60A5FA]">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && !item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-[#94A3B8]">
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-white/[0.08] space-y-1">
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-[#CBD5E1] hover:bg-[#0E1626] transition-colors"
            >
              <ShieldStar size={16} className="text-[#3B82F6]" />
              <span>Admin Console</span>
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <SignOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0F19] border-b border-white/[0.08] sticky top-0 z-40">
        <Link to="/">
          <DreamLogo size={26} />
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to="/dashboard/notifications"
            className="relative p-2 rounded-lg bg-white/5 text-[#CBD5E1]"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3B82F6]" />
            )}
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-[#CBD5E1]"
          >
            {mobileSidebarOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Modal Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#06090F]/95 backdrop-blur-md z-50 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-[#0E1626] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{user.fullName}</p>
                <p className="text-[10px] text-[#64748B] uppercase">{user.currentRankSlug} Rank</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleCopyRef} className="rounded-xl">
                {copiedRef ? 'Copied' : 'Share Code'}
              </Button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center space-x-3 p-2.5 rounded-xl text-sm text-[#CBD5E1] hover:bg-[#0E1626]"
                  >
                    <Icon size={18} className="text-[#3B82F6]" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                setMobileSidebarOpen(false);
                navigate('/');
              }}
              className="w-full py-2 text-center text-xs text-[#EF4444] bg-rose-500/10 rounded-xl"
            >
              Sign Out
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

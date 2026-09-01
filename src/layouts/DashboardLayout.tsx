import React, { useState, useEffect } from 'react';
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
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { referralService } from '@/services/referralService';
import { badgeTrackerService } from '@/services/badgeTrackerService';
import { DreamLogo } from '@/components/ui/DreamLogo';

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, rankProgress, unreadNotifsCount, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dta_user_sidebar_collapsed') === 'true';
  });
  const [copiedRef, setCopiedRef] = useState(false);
  const [, setBadgeTrigger] = useState(0);
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('dta_user_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Track and auto-decrement unseen badges when user visits a section
  useEffect(() => {
    if (!user) return;

    if (location.pathname.startsWith('/dashboard/referrals')) {
      badgeTrackerService.markReferralsSeen(user.id, rankProgress?.qualifyingCommunity || 0);
      setBadgeTrigger((prev) => prev + 1);
    } else if (location.pathname.startsWith('/dashboard/sales')) {
      badgeTrackerService.markSalesSeen(user.id, rankProgress?.qualifyingSales || 0);
      setBadgeTrigger((prev) => prev + 1);
    } else if (location.pathname.startsWith('/dashboard/rewards')) {
      badgeTrackerService.markRewardsSeen(user.id, 10);
      setBadgeTrigger((prev) => prev + 1);
    }

    const handleBadgeUpdate = () => setBadgeTrigger((prev) => prev + 1);
    window.addEventListener('dta_badge_update', handleBadgeUpdate);
    return () => window.removeEventListener('dta_badge_update', handleBadgeUpdate);
  }, [location.pathname, user?.id, rankProgress?.qualifyingCommunity, rankProgress?.qualifyingSales]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <ShieldCheck size={48} className="text-[#1F4D3E]" />
        <h2 className="text-2xl font-bold text-[#1E241F]">Partner Session Required</h2>
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

  // Calculate unseen counts that decrement once viewed
  const unseenReferrals = user
    ? badgeTrackerService.getUnseenReferralsCount(user.id, rankProgress?.qualifyingCommunity || 0)
    : 0;
  const unseenSales = user
    ? badgeTrackerService.getUnseenSalesCount(user.id, rankProgress?.qualifyingSales || 0)
    : 0;

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: House },
    { label: 'Wholesale Inventory', href: '/dashboard/products', icon: Package },
    {
      label: 'Rank Progress',
      href: '/dashboard/rank-progress',
      icon: ChartLineUp,
      badge: rankProgress?.nextRank ? `${rankProgress.overallProgressPercent}%` : 'MAX',
    },
    {
      label: 'Direct Sales',
      href: '/dashboard/sales',
      icon: ShoppingCart,
      count: unseenSales > 0 ? unseenSales : undefined,
    },
    {
      label: 'Referral Network',
      href: '/dashboard/referrals',
      icon: Users,
      count: unseenReferrals > 0 ? unseenReferrals : undefined,
    },
    { label: 'Rewards', href: '/dashboard/rewards', icon: Gift },
    {
      label: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      count: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
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
      
      {/* Desktop Persistent Sidebar with Expand/Collapse */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-white border-r border-[#E3DCC8] p-3 shrink-0 min-h-screen sticky top-0 shadow-xs transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="space-y-4">
          {/* Logo & Public Site Link + Collapse Button */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DCC8] min-h-[44px]">
            {!isCollapsed ? (
              <Link to="/" className="flex items-center gap-2 min-w-0">
                <DreamLogo size={28} showText={false} />
                <span className="font-bold text-sm text-[#1E241F] truncate">Partner Hub</span>
              </Link>
            ) : (
              <Link to="/" className="mx-auto" title="Partner Hub">
                <DreamLogo size={28} showText={false} />
              </Link>
            )}

            <button
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF] transition-colors cursor-pointer border border-transparent hover:border-[#E3DCC8]"
              title={isCollapsed ? 'Expand Sidebar (Open)' : 'Collapse Sidebar (Close)'}
              aria-label="Toggle Sidebar Navigation"
            >
              {isCollapsed ? <CaretRight size={15} weight="bold" /> : <CaretLeft size={15} weight="bold" />}
            </button>
          </div>

          {/* User Profile Card */}
          {!isCollapsed ? (
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
          ) : (
            <div className="flex justify-center" title={`${user.fullName} (${user.currentRankSlug})`}>
              <div className="w-9 h-9 rounded-xl bg-[#1F4D3E] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Admin Switch Banner (If user is admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center ${
                isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
              } rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] hover:bg-[#EAE4D2] transition-colors text-xs group`}
              title="Admin Portal"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#1F4D3E]" />
                {!isCollapsed && <span className="font-semibold text-[#1E241F]">Admin Portal</span>}
              </div>
              {!isCollapsed && <ArrowSquareOut size={13} className="text-[#5B5C50]" />}
            </Link>
          )}

          {/* Referral Code Quick Copy Pill */}
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between text-xs">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-mono uppercase text-[#5B5C50] block">Referral Code</span>
                <span className="font-mono font-bold text-[#1F4D3E] truncate">{user.referralCode}</span>
              </div>
              <button
                onClick={handleCopyRef}
                className="p-1.5 rounded-lg bg-white border border-[#E3DCC8] hover:bg-[#F1ECDD] text-[#1E241F] transition-colors cursor-pointer shrink-0"
                title="Copy referral link"
              >
                {copiedRef ? <Check size={14} className="text-[#1F4D3E]" /> : <Copy size={14} />}
              </button>
            </div>
          )}

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
                  title={item.label}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                  } rounded-xl transition-all font-medium group ${
                    isActive
                      ? 'bg-[#1F4D3E] text-white font-semibold shadow-xs'
                      : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {/* Collapsed Icon with pinned badge */}
                    <div className="relative flex items-center justify-center">
                      <Icon size={19} weight={isActive ? 'fill' : 'regular'} className="shrink-0" />
                      {isCollapsed && item.count !== undefined && item.count > 0 && (
                        <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] ring-2 ring-white shadow-xs animate-pulse">
                          {item.count}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Expanded Mode Red Notification Bubble */}
                  {!isCollapsed && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        item.isAlert
                          ? 'bg-red-600 text-white shadow-xs animate-pulse'
                          : isActive
                          ? 'bg-red-600 text-white ring-1 ring-white/30 shadow-xs'
                          : 'bg-red-600 text-white shadow-xs'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#F1ECDD] text-[#5B5C50]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Action */}
        <div className="pt-3 border-t border-[#E3DCC8] space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <SwitchButton size="sm" showLabel={true} className="w-full justify-start text-xs" />
            </div>
          )}

          <button
            onClick={() => logout()}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'space-x-2 px-3 py-2'
            } rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer`}
            title="Sign Out"
          >
            <SignOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E3DCC8] p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <DreamLogo size={28} showText={false} />
          <span className="font-bold text-sm text-[#1E241F]">Partner Hub</span>
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
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </NavLink>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg font-semibold text-[#1F4D3E] bg-[#F1ECDD] mt-3"
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck size={18} />
                  <span>Admin Portal</span>
                </div>
                <ArrowSquareOut size={14} />
              </Link>
            )}
          </nav>

          <div className="pt-6 border-t border-[#E3DCC8] space-y-3">
            <SwitchButton size="sm" showLabel={true} className="w-full justify-start text-xs" />
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm text-rose-700 bg-rose-50"
            >
              <SignOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};

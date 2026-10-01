import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/services/storage';
import { salesService } from '@/services/salesService';
import { payoutService } from '@/services/payoutService';
import { badgeTrackerService } from '@/services/badgeTrackerService';
import { Button } from '@/components/ui/Button';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { AppNotification } from '@/types';
import { notificationService } from '@/services/notificationService';
import { NotificationQuickPopover } from '@/components/notifications/NotificationQuickPopover';
import { NotificationDetailModal } from '@/components/modals/NotificationDetailModal';
import {
  ShieldCheck,
  House,
  Users,
  Package,
  ShoppingCart,
  TreeStructure,
  Crown,
  Gift,
  Article,
  Scroll,
  SignOut,
  ArrowSquareOut,
  LockKey,
  X,
  List,
  FolderSimple,
  HandCoins,
  GearSix,
  CheckCircle,
  Sparkle,
  Bell,
  CaretLeft,
  CaretRight,
  VideoCamera,
} from '@phosphor-icons/react';

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeColor?: string;
  }[];
}

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, unreadNotifsCount, logout, refreshUserData } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dta_admin_sidebar_collapsed') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('dta_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Dynamic real-time pending update counters with badge tracker integration
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);
  const [, setBadgeTrigger] = useState(0);

  const calculatePendingUpdates = () => {
    try {
      const sales = salesService.getAllSales();
      const pendingOrders = sales.filter(
        (s) => s.status === 'pending_verification' || s.status === 'payment_verified'
      ).length;
      setPendingOrdersCount(pendingOrders);

      const withdrawals = payoutService.getAllWithdrawals();
      const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending').length;
      
      const rewards = storage.get<any[]>('REWARDS', []);
      const pendingRewards = rewards.filter((r) => r.status === 'pending_review').length;

      setPendingPayoutsCount(pendingWithdrawals + pendingRewards);
    } catch {
      // Fallback
    }
  };

  // Track and auto-clear badges when Admin visits sections
  useEffect(() => {
    calculatePendingUpdates();

    if (location.pathname.startsWith('/admin/sales')) {
      badgeTrackerService.markAdminOrdersSeen(pendingOrdersCount);
      setBadgeTrigger((prev) => prev + 1);
    } else if (location.pathname.startsWith('/admin/rewards')) {
      badgeTrackerService.markAdminPayoutsSeen(pendingPayoutsCount);
      setBadgeTrigger((prev) => prev + 1);
    }

    const handleStorageChange = () => {
      calculatePendingUpdates();
      setBadgeTrigger((prev) => prev + 1);
    };
    const handleBadgeUpdate = () => {
      calculatePendingUpdates();
      setBadgeTrigger((prev) => prev + 1);
    };

    window.addEventListener('dta_storage_change', handleStorageChange);
    window.addEventListener('dta_badge_update', handleBadgeUpdate);
    return () => {
      window.removeEventListener('dta_storage_change', handleStorageChange);
      window.removeEventListener('dta_badge_update', handleBadgeUpdate);
    };
  }, [location.pathname, pendingOrdersCount, pendingPayoutsCount]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans relative overflow-hidden">
        <div className="pointer-events-none fixed top-1/4 left-1/3 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(217,192,138,0.06),transparent_70%)] blur-3xl -z-10" />
        <div className="funding-card max-w-md p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D9C08A]/10 border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A] mx-auto shadow-[0_0_25px_rgba(217,192,138,0.15)]">
            <LockKey size={34} weight="bold" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#F4F7F5]">Administrative Access Required</h2>
          <p className="text-xs sm:text-sm text-[#9EABA2] max-w-sm mx-auto leading-relaxed">
            This portal is restricted to authorized platform administrators. Please sign in with your administrative credentials.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/login">
              <button className="funding-champagne-sheen-btn px-5 py-2.5 text-xs font-bold uppercase tracking-wider">
                Sign In with Admin Account
              </button>
            </Link>
            <Link to="/">
              <button className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#F4F7F5]">
                Return to Website
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate unseen counts that decrement once admin visits the section
  const unseenAdminOrders = badgeTrackerService.getUnseenAdminOrdersCount(pendingOrdersCount);
  const unseenAdminPayouts = badgeTrackerService.getUnseenAdminPayoutsCount(pendingPayoutsCount);
  const totalAdminAlerts = unseenAdminOrders + unseenAdminPayouts;

  const navGroups: NavGroup[] = [
    {
      title: 'STORE & COMMERCE',
      items: [
        { label: 'Dashboard Overview', href: '/admin', icon: House },
        {
          label: 'Orders & Shipping',
          href: '/admin/sales',
          icon: ShoppingCart,
          badgeCount: unseenAdminOrders > 0 ? unseenAdminOrders : undefined,
        },
        { label: 'Product Categories', href: '/admin/categories', icon: FolderSimple },
        { label: 'Products & Wholesale', href: '/admin/products', icon: Package },
        { label: 'User Accounts', href: '/admin/users', icon: Users },
      ],
    },
    {
      title: 'NETWORK & PAYOUTS',
      items: [
        { label: 'Referrals & Team Tree', href: '/admin/referrals', icon: TreeStructure },
        { label: 'Rank Levels', href: '/admin/ranks', icon: Crown },
        {
          label: 'Payouts & Bonuses',
          href: '/admin/rewards',
          icon: HandCoins,
          badgeCount: unseenAdminPayouts > 0 ? unseenAdminPayouts : undefined,
        },
      ],
    },
    {
      title: 'SYSTEM & SETTINGS',
      items: [
        { label: 'Video Tutorials', href: '/admin/tutorials', icon: VideoCamera },
        { label: 'Website CMS & Config', href: '/admin/cms', icon: GearSix },
        { label: 'Activity Logs', href: '/admin/audit-logs', icon: Scroll },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex flex-col md:flex-row font-sans selection:bg-[#D9C08A]/25 relative overflow-x-hidden">
      <a href="#admin-main" className="skip-link">Skip to admin content</a>

      {/* Atmospheric luminous mesh glows (Funding Pips background signature) */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(217,192,138,0.06),transparent_70%)] blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.05),transparent_70%)] blur-3xl -z-10" />
      
      {/* Desktop VIP Admin Sidebar (Funding Pips Liquid Frosted Glass) */}
      {/* Desktop VIP Admin Sidebar (Funding Pips Liquid Frosted Glass) */}
      <aside
        className={`hidden md:flex flex-col funding-sidebar fixed inset-y-0 left-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Pinned Top Brand & Control Bar */}
        <div className="shrink-0 p-3.5 pb-3 border-b border-white/[0.08] min-h-[54px] flex items-center justify-between">
          {!isCollapsed ? (
            <Link to="/admin" className="flex items-center gap-2.5 min-w-0 group">
              <DreamLogo size={28} showText={false} />
              <div className="min-w-0">
                <div className="font-serif font-semibold text-sm text-[#F4F7F5] tracking-tight truncate">
                  Admin Terminal
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-pulse shadow-[0_0_8px_rgba(217,192,138,0.8)]" />
                  <span className="text-[9px] font-mono text-[#D9C08A] uppercase tracking-wider">
                    Executive Node
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <Link to="/admin" className="mx-auto" title="Admin Terminal">
              <DreamLogo size={28} showText={false} />
            </Link>
          )}

          {/* Sidebar Open/Close Toggle Button */}
          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.06] transition-colors cursor-pointer border border-transparent hover:border-white/10"
            title={isCollapsed ? 'Expand Sidebar (Open)' : 'Collapse Sidebar (Close)'}
            aria-label="Toggle Sidebar Navigation"
          >
            {isCollapsed ? <CaretRight size={15} weight="bold" /> : <CaretLeft size={15} weight="bold" />}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="space-y-4 text-xs">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-2.5 text-[10px] font-mono font-bold tracking-wider text-[#9EABA2]/70 uppercase">
                    {group.title}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.href);

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        title={item.label}
                        className={`flex items-center ${
                          isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                        } rounded-xl transition-all font-medium group ${
                          isActive
                            ? 'bg-gradient-to-r from-[#D9C08A]/20 via-[#D9C08A]/10 to-transparent text-[#D9C08A] border-l-2 border-[#D9C08A] font-semibold shadow-[0_0_20px_rgba(217,192,138,0.12)]'
                            : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {/* Collapsed Icon with pinned badge */}
                          <div className="relative flex items-center justify-center">
                            <Icon
                              size={18}
                              weight={isActive ? 'fill' : 'regular'}
                              className={isActive ? 'text-[#D9C08A]' : ''}
                            />
                            {isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] ring-2 ring-[#070B09] shadow-xs animate-pulse">
                                {item.badgeCount}
                              </span>
                            )}
                          </div>
                          {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}
                        </div>

                        {/* Expanded Mode Red Notification Bubble */}
                        {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-[9.5px] shadow-xs animate-pulse">
                            {item.badgeCount}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Docked Pro Utility & User Profile Footer */}
        <div className="shrink-0 p-3.5 border-t border-white/[0.08] space-y-2 bg-[#070B09]/80 backdrop-blur-md">
          {!isCollapsed ? (
            <>
              {/* Telemetry Status Pod */}
              <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#9EABA2]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  <span>Attribution Protocol</span>
                </div>
                <span className="text-[#34D399] font-medium">Synced</span>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                <Link
                  to="/dashboard"
                  className="flex-1 text-center py-1.5 px-2 rounded-xl funding-ghost-pill text-[11px] font-mono font-medium text-[#34D399] hover:border-[#34D399]/40 transition-colors truncate"
                >
                  Partner Hub ↗
                </Link>
                <Link
                  to="/"
                  className="flex-1 text-center py-1.5 px-2 rounded-xl funding-ghost-pill text-[11px] font-mono font-medium text-[#9EABA2] hover:text-[#F4F7F5] transition-colors truncate"
                >
                  Live Store ↗
                </Link>
              </div>

              {/* Admin User Profile */}
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between">
                <div className="flex items-center space-x-2.5 truncate pr-1">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#D9C08A] to-[#B8862E] text-[#070B09] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#F4F7F5] truncate leading-tight">{user?.fullName}</p>
                    <p className="text-[9.5px] font-mono text-[#9EABA2] truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-1.5 rounded-xl text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  title="Sign Out"
                >
                  <SignOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <Link
                to="/"
                className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-[#9EABA2] hover:text-[#F4F7F5]"
                title="View Live Store"
              >
                <ArrowSquareOut size={16} />
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-xl text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                title="Sign Out"
              >
                <SignOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 funding-topbar px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <DreamLogo size={28} showText={false} />
          <div>
            <span className="font-serif font-semibold text-sm text-[#F4F7F5] block">Admin Terminal</span>
            <span className="text-[9px] font-mono text-[#D9C08A] font-semibold uppercase">Executive Node</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                notifPopoverOpen
                  ? 'bg-[#D9C08A]/15 border-[#D9C08A]/40 text-[#D9C08A]'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] bg-white/[0.04] border-white/10'
              }`}
              title="Platform Notifications"
              aria-label="Toggle notifications pop-up"
              aria-expanded={notifPopoverOpen}
            >
              <Bell size={18} weight={notifPopoverOpen ? 'fill' : 'regular'} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          )}

          {totalAdminAlerts > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] animate-pulse">
              {totalAdminAlerts}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl text-[#F4F7F5] bg-white/[0.06] border border-white/10 active:scale-[0.96] transition-all"
            aria-label="Toggle Admin Navigation Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="admin-mobile-navigation"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Mobile Full Menu Overlay */}
      {mobileMenuOpen && (
        <div id="admin-mobile-navigation" className="md:hidden fixed inset-0 z-50 bg-[#070B09]/95 backdrop-blur-2xl p-5 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col justify-between overflow-y-auto overscroll-contain animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <DreamLogo size={28} showText={false} />
                <span className="font-serif font-semibold text-sm text-[#F4F7F5]">Admin Navigation</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#F4F7F5]"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="space-y-4 text-xs">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <p className="text-[10px] font-mono font-bold tracking-wider text-[#9EABA2]/70 uppercase">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/admin'
                          ? location.pathname === '/admin'
                          : location.pathname.startsWith(item.href);

                      return (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium touch-manipulation active:scale-[0.98] transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#D9C08A]/20 to-transparent text-[#D9C08A] border-l-2 border-[#D9C08A] font-semibold'
                              : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </div>
                          {item.badgeCount !== undefined && item.badgeCount > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px]">
                              {item.badgeCount}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="pt-5 mt-6 border-t border-white/[0.08] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl funding-ghost-pill text-xs font-semibold text-[#F4F7F5] text-center"
              >
                Website Home
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl funding-ghost-pill text-xs font-semibold text-[#34D399] text-center"
              >
                Partner Dashboard
              </Link>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 text-center cursor-pointer"
            >
              Sign Out from Admin
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <main id="admin-main" tabIndex={-1} className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-x-hidden min-w-0">
          {/* Desktop Top Executive Utility Bar (Funding Pips Signature) */}
          <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="funding-ghost-pill px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-[#F4F7F5]">
                <span className="w-2 h-2 rounded-full bg-[#D9C08A] animate-pulse shadow-[0_0_8px_rgba(217,192,138,0.8)]" />
                <span>Executive Protocol Active</span>
              </div>
              <span className="text-xs font-mono text-[#9EABA2]">· Central Administrative Core Node</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Desktop Quick Notifications Button */}
              {user && (
                <button
                  type="button"
                  onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                  className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                    notifPopoverOpen
                      ? 'bg-[#D9C08A]/15 border-[#D9C08A]/40 text-[#D9C08A]'
                      : 'text-[#9EABA2] hover:text-[#F4F7F5] bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                  }`}
                  title="Platform Notifications"
                  aria-label="Toggle notifications pop-up"
                  aria-expanded={notifPopoverOpen}
                >
                  <Bell size={17} weight={notifPopoverOpen ? 'fill' : 'regular'} />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9.5px] ring-2 ring-[#070B09] shadow-xs animate-pulse">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>
              )}

              <LiquidGlassButton
                to="/admin/rewards"
                size="sm"
                iconLeft={<HandCoins size={14} className="text-[#D9C08A]" />}
                className="px-3.5 py-1.5 text-xs font-medium text-[#F4F7F5]"
              >
                <span>Pending Payouts ({pendingPayoutsCount})</span>
              </LiquidGlassButton>
              <Link to="/admin/sales" className="funding-champagne-sheen-btn px-4 py-1.5 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 shadow-md">
                <ShoppingCart size={13} weight="bold" />
                <span>Orders Queue ({pendingOrdersCount})</span>
              </Link>
            </div>
          </div>

          <Outlet />
        </main>
      </div>

      {/* Universal Floating Quick Notifications Popover */}
      {user && (
        <NotificationQuickPopover
          userId={user.id}
          isOpen={notifPopoverOpen}
          onClose={() => setNotifPopoverOpen(false)}
          onSelectNotification={(notif) => {
            setSelectedNotif(notif);
            setNotifModalOpen(true);
          }}
          unreadCount={unreadNotifsCount}
          onRefreshUserData={refreshUserData}
        />
      )}

      {/* Universal Floating Detail Modal with Spring Motion Design */}
      <NotificationDetailModal
        notification={selectedNotif}
        isOpen={notifModalOpen && Boolean(selectedNotif)}
        onClose={() => {
          setNotifModalOpen(false);
          setSelectedNotif(null);
        }}
        onToggleRead={(id, currentlyRead) => {
          if (currentlyRead) {
            const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
            const idx = notifs.findIndex((n) => n.id === id);
            if (idx >= 0) {
              notifs[idx].isRead = false;
              storage.set('NOTIFICATIONS', notifs);
              refreshUserData();
              if (selectedNotif && selectedNotif.id === id) {
                setSelectedNotif({ ...selectedNotif, isRead: false });
              }
            }
          } else {
            notificationService.markAsRead(id);
            refreshUserData();
            if (selectedNotif && selectedNotif.id === id) {
              setSelectedNotif({ ...selectedNotif, isRead: true });
            }
          }
        }}
      />
    </div>
  );
};

export default AdminLayout;


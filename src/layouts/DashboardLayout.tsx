import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { LiquidGlassButton } from '@/components/ui/LiquidGlassButton';
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
    window.addEventListener('dta_storage_change', handleBadgeUpdate);
    return () => {
      window.removeEventListener('dta_badge_update', handleBadgeUpdate);
      window.removeEventListener('dta_storage_change', handleBadgeUpdate);
    };
  }, [location.pathname, user?.id, rankProgress?.qualifyingCommunity, rankProgress?.qualifyingSales]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <ShieldCheck size={48} className="text-[var(--primary)]" />
        <h2 className="text-2xl font-bold text-[var(--ink)]">Partner Session Required</h2>
        <p className="text-xs text-[var(--ink-soft)] max-w-md">
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
      href: '/dashboard/ranks',
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
    <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex flex-col md:flex-row font-sans selection:bg-[#D9C08A]/25 relative overflow-x-hidden">
      <a href="#dashboard-main" className="skip-link">Skip to dashboard content</a>

      {/* Atmospheric luminous mesh glows (Funding Pips background signature) */}
      <div className="pointer-events-none fixed top-0 right-1/4 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.06),transparent_70%)] blur-3xl -z-10" />
      <div className="pointer-events-none fixed bottom-10 left-1/3 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(217,192,138,0.05),transparent_70%)] blur-3xl -z-10" />
      
      {/* Desktop Persistent Sidebar with Expand/Collapse */}
      <aside
        className={`hidden md:flex flex-col funding-sidebar fixed inset-y-0 left-0 h-screen z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Pinned Top Brand & Control Bar */}
        <div className="shrink-0 p-3.5 pb-3 border-b border-white/[0.08] min-h-[54px] flex items-center justify-between">
          {!isCollapsed ? (
            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <DreamLogo size={28} showText={false} />
              <div className="min-w-0">
                <div className="font-serif font-semibold text-sm text-[#F4F7F5] truncate tracking-tight">Partner Terminal</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[9px] font-mono text-[#34D399] uppercase tracking-wider">Live · Tier Active</span>
                </div>
              </div>
            </Link>
          ) : (
            <Link to="/" className="mx-auto" title="Partner Terminal">
              <DreamLogo size={28} showText={false} />
            </Link>
          )}

          <button
            onClick={toggleSidebarCollapse}
            className="p-1.5 rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.06] transition-colors cursor-pointer border border-transparent hover:border-white/10"
            title={isCollapsed ? 'Expand Sidebar (Open)' : 'Collapse Sidebar (Close)'}
            aria-label="Toggle Sidebar Navigation"
          >
            {isCollapsed ? <CaretRight size={15} weight="bold" /> : <CaretLeft size={15} weight="bold" />}
          </button>
        </div>

        {/* Scrollable Middle Navigation & Identity */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* User Profile Card */}
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F4F7F5] truncate max-w-[120px]">
                  {user.fullName}
                </span>
                <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 uppercase tracking-wider">
                  {user.currentRankSlug}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#9EABA2] truncate">{user.email}</p>
            </div>
          ) : (
            <div className="flex justify-center" title={`${user.fullName} (${user.currentRankSlug})`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6EE7A8] to-[#2FA46B] text-[#070B09] flex items-center justify-center font-bold text-xs shadow-md">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Admin Switch Banner (If user is admin) */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center ${
                isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
              } rounded-xl bg-gradient-to-r from-[#D9C08A]/10 to-transparent border border-[#D9C08A]/25 hover:border-[#D9C08A]/50 transition-all text-xs group`}
              title="Admin Portal"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-[#D9C08A]" weight="fill" />
                {!isCollapsed && <span className="font-semibold text-[#F4F7F5]">Executive Admin</span>}
              </div>
              {!isCollapsed && <ArrowSquareOut size={13} className="text-[#D9C08A]" />}
            </Link>
          )}

          {/* Referral Code Quick Copy Pill */}
          {!isCollapsed && (
            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#9EABA2] block">Referral Code</span>
                <span className="font-mono font-bold text-[#D9C08A] truncate">{user.referralCode}</span>
              </div>
              <button
                onClick={handleCopyRef}
                className="p-1.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-[#D9C08A]/40 text-[#F4F7F5] transition-all cursor-pointer shrink-0"
                title="Copy referral link"
              >
                {copiedRef ? <Check size={14} className="text-[#34D399]" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs pt-1">
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
                      ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-[#34D399] border-l-2 border-[#34D399] font-semibold shadow-[0_0_20px_rgba(52,211,153,0.12)]'
                      : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
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
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-500/20 text-[#34D399] border-emerald-500/30 font-semibold'
                          : 'bg-white/[0.04] text-[#9EABA2] border-white/10'
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

        {/* Docked Utility & Sign Out Footer */}
        <div className="shrink-0 p-3.5 border-t border-white/[0.08] space-y-2 bg-[#070B09]/80 backdrop-blur-md">
          {!isCollapsed ? (
            <>
              {/* Telemetry Status Pod */}
              <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#9EABA2]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                  <span>Node: Lahore COD Hub</span>
                </div>
                <span className="text-[#34D399] font-medium">Online</span>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                <Link
                  to="/"
                  className="flex-1 text-center py-1.5 px-2 rounded-xl funding-ghost-pill text-[11px] font-mono font-medium text-[#9EABA2] hover:text-[#F4F7F5] transition-colors truncate"
                >
                  Live Store ↗
                </Link>
                <Link
                  to="/products"
                  className="flex-1 text-center py-1.5 px-2 rounded-xl funding-ghost-pill text-[11px] font-mono font-medium text-[#D9C08A] hover:border-[#D9C08A]/40 transition-colors truncate"
                >
                  Catalog ↗
                </Link>
              </div>

              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer font-medium"
                title="Sign Out"
              >
                <SignOut size={15} />
                <span>Sign Out Terminal</span>
              </button>
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
                onClick={() => logout()}
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
      <header className="md:hidden sticky top-0 z-40 funding-topbar p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <DreamLogo size={28} showText={false} />
          <span className="font-serif font-semibold text-sm text-[#F4F7F5]">Partner Terminal</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Link
            to="/dashboard/notifications"
            className="relative p-2 rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] bg-white/[0.04] border border-white/10"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </Link>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 uppercase">
            {user.currentRankSlug}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl text-[#F4F7F5] bg-white/[0.06] border border-white/10 active:scale-[0.96] transition-all"
            aria-label="Toggle partner navigation"
            aria-expanded={mobileMenuOpen}
            aria-controls="partner-mobile-navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div id="partner-mobile-navigation" className="md:hidden fixed inset-0 z-50 bg-[#070B09]/95 backdrop-blur-2xl p-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col justify-between overflow-y-auto overscroll-contain animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Partner navigation">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <DreamLogo size={28} showText={false} />
                <span className="font-serif font-semibold text-sm text-[#F4F7F5]">Navigation Terminal</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#F4F7F5]"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="space-y-1.5 text-sm">
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
                    className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl font-medium touch-manipulation active:scale-[0.98] transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-[#34D399] border-l-2 border-[#34D399] font-semibold'
                        : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && <span className="text-xs font-mono">{item.badge}</span>}
                      {item.count !== undefined && item.count > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
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
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-[#D9C08A] bg-[#D9C08A]/10 border border-[#D9C08A]/30 mt-3"
                >
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={18} />
                    <span>Admin Portal</span>
                  </div>
                  <ArrowSquareOut size={14} />
                </Link>
              )}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20"
            >
              <SignOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <main id="dashboard-main" tabIndex={-1} className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto">
          {/* Desktop Top Utility Bar (Funding Pips Signature) */}
          <div className="hidden md:flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="funding-ghost-pill px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-[#F4F7F5]">
                <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>Reseller Terminal Active</span>
              </div>
              <span className="text-xs font-mono text-[#9EABA2]">· Pakistan COD Logistics Node</span>
            </div>
            <div className="flex items-center gap-3">
              <LiquidGlassButton
                to="/products"
                size="sm"
                iconLeft={<Package size={14} className="text-[#D9C08A]" />}
                className="px-3.5 py-1.5 text-xs font-medium text-[#F4F7F5]"
              >
                <span>Wholesale Catalog</span>
              </LiquidGlassButton>
              <Link to="/dashboard/sales" className="funding-sheen-btn px-4 py-1.5 text-xs uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 shadow-md">
                <ShoppingCart size={13} weight="bold" />
                <span>Record Sale</span>
              </Link>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

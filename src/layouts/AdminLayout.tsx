import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/services/storage';
import { salesService } from '@/services/salesService';
import { payoutService } from '@/services/payoutService';
import { badgeTrackerService } from '@/services/badgeTrackerService';
import { Button } from '@/components/ui/Button';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { SwitchButton } from '@/components/ui/SwitchButton';
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
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('dta_admin_sidebar_collapsed') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

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
    const handleBadgeUpdate = () => setBadgeTrigger((prev) => prev + 1);

    window.addEventListener('dta_storage_change', handleStorageChange);
    window.addEventListener('dta_badge_update', handleBadgeUpdate);
    return () => {
      window.removeEventListener('dta_storage_change', handleStorageChange);
      window.removeEventListener('dta_badge_update', handleBadgeUpdate);
    };
  }, [location.pathname, pendingOrdersCount, pendingPayoutsCount]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-[#1F4D3E]/10 border border-[#1F4D3E]/20 flex items-center justify-center text-[#1F4D3E] mx-auto">
          <LockKey size={36} weight="bold" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E241F]">Administrative Access Required</h2>
        <p className="text-xs sm:text-sm text-[#5B5C50] max-w-md mx-auto leading-relaxed">
          This portal is restricted to authorized platform administrators. Please sign in with your administrative credentials.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="md" className="text-xs font-medium">
              Sign In with Admin Account
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md" className="text-xs font-medium">
              Return to Website
            </Button>
          </Link>
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
        { label: 'Website CMS & Config', href: '/admin/cms', icon: GearSix },
        { label: 'Activity Logs', href: '/admin/audit-logs', icon: Scroll },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col md:flex-row font-sans selection:bg-[#B8862E]/25">
      
      {/* Desktop VIP Admin Sidebar (Advanced Expand/Collapse) */}
      <aside
        className={`hidden md:flex flex-col justify-between bg-white border-r border-[#E3DCC8] shrink-0 min-h-screen sticky top-0 shadow-xs z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-3 space-y-4">
          {/* Header Brand + Collapse Button */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8] min-h-[48px]">
            {!isCollapsed ? (
              <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
                <DreamLogo size={32} showText={false} />
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-[#1E241F] tracking-tight truncate">
                      DreamToAchievers
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#1F4D3E] text-white text-[9px] font-mono font-semibold uppercase tracking-wider">
                      Executive Admin
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <Link to="/admin" className="mx-auto" title="DreamToAchievers Admin">
                <DreamLogo size={32} showText={false} />
              </Link>
            )}

            {/* Sidebar Open/Close Toggle Button */}
            <button
              onClick={toggleSidebarCollapse}
              className="p-1.5 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF] transition-colors cursor-pointer border border-transparent hover:border-[#E3DCC8]"
              title={isCollapsed ? 'Expand Sidebar (Open)' : 'Collapse Sidebar (Close)'}
              aria-label="Toggle Sidebar Navigation"
            >
              {isCollapsed ? <CaretRight size={16} weight="bold" /> : <CaretLeft size={16} weight="bold" />}
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-4 text-xs">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-2.5 text-[10px] font-mono font-bold tracking-wider text-[#7C7D70]">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
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
                          isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                        } rounded-xl transition-all font-medium ${
                          isActive
                            ? 'bg-[#1F4D3E] text-white shadow-xs font-semibold'
                            : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {/* Collapsed Icon with pinned badge */}
                          <div className="relative flex items-center justify-center">
                            <Icon
                              size={19}
                              weight={isActive ? 'fill' : 'regular'}
                              className={isActive ? 'text-[#D4AF37]' : ''}
                            />
                            {isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 text-white font-mono font-bold text-[9px] ring-2 ring-white shadow-xs animate-pulse">
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

        {/* User Card & Quick Links */}
        <div className="p-3 border-t border-[#E3DCC8] space-y-2 bg-[#FAF7EF]/40">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between gap-1.5">
                <Link
                  to="/dashboard"
                  className="flex-1 text-center py-1.5 px-2 rounded-lg bg-white border border-[#E3DCC8] text-[11px] font-mono font-medium text-[#1F4D3E] hover:bg-[#FAF7EF] transition-colors truncate"
                >
                  Partner Hub ↗
                </Link>
                <Link
                  to="/"
                  className="flex-1 text-center py-1.5 px-2 rounded-lg bg-white border border-[#E3DCC8] text-[11px] font-mono font-medium text-[#5B5C50] hover:bg-[#FAF7EF] transition-colors truncate"
                >
                  Live Store ↗
                </Link>
              </div>

              {/* Theme Toggle Button */}
              <div className="pt-0.5">
                <SwitchButton size="sm" showLabel={true} className="w-full justify-start text-xs" />
              </div>

              {/* Admin User Profile */}
              <div className="p-2 rounded-xl bg-white border border-[#E3DCC8] flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2 truncate pr-1">
                  <div className="w-7 h-7 rounded-full bg-[#1F4D3E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#1E241F] truncate leading-tight">{user?.fullName}</p>
                    <p className="text-[9.5px] font-mono text-[#5B5C50] truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-1.5 rounded-lg text-[#7C7D70] hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors"
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
                className="p-2 rounded-lg bg-white border border-[#E3DCC8] text-[#5B5C50] hover:text-[#1E241F]"
                title="View Live Store"
              >
                <ArrowSquareOut size={16} />
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg text-[#7C7D70] hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                title="Sign Out"
              >
                <SignOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3DCC8] px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <DreamLogo size={28} showText={false} />
          <div>
            <span className="font-bold text-sm text-[#1E241F] block">Admin Portal</span>
            <span className="text-[9px] font-mono text-[#1F4D3E] font-semibold uppercase">Executive</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {totalAdminAlerts > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] animate-pulse">
              {totalAdminAlerts}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#1E241F] hover:bg-[#FAF7EF] border border-[#E3DCC8]"
            aria-label="Toggle Admin Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Mobile Full Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-[#FAF7EF] p-5 flex flex-col justify-between overflow-y-auto border-b border-[#E3DCC8] animate-in slide-in-from-top-2">
          <nav className="space-y-4 text-xs">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-mono font-bold tracking-wider text-[#7C7D70]">
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
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                          isActive
                            ? 'bg-[#1F4D3E] text-white font-semibold shadow-xs'
                            : 'text-[#1E241F] hover:bg-[#F1ECDD]'
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

          <div className="pt-5 mt-6 border-t border-[#E3DCC8] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl bg-white border border-[#E3DCC8] text-xs font-semibold text-[#1E241F] text-center"
              >
                Website Home
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-xs font-semibold text-[#1F4D3E] text-center"
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
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 text-center"
            >
              Sign Out from Admin
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-x-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;


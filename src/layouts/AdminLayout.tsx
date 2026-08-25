import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DreamLogo } from '@/components/ui/DreamLogo';
import { Button } from '@/components/ui/Button';
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
  Gear,
} from '@phosphor-icons/react';

interface NavGroup {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
  }[];
}

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#020612] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <LockKey size={48} className="text-cyan-400 animate-pulse" />
        <h2 className="text-xl font-heading font-bold text-white">Administrative Access Required</h2>
        <p className="text-xs text-slate-400 max-w-md">
          This portal is restricted to authorized platform administrators.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="sm" className="rounded-lg font-semibold text-xs">
              Sign In with Admin Account
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="sm" className="rounded-lg text-xs">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navGroups: NavGroup[] = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard Overview', href: '/admin', icon: House },
        { label: 'Users Management', href: '/admin/users', icon: Users },
        { label: 'Products & Inventory', href: '/admin/products', icon: Package },
        { label: 'Sales Verification', href: '/admin/sales', icon: ShoppingCart },
      ],
    },
    {
      title: 'BUSINESS ENGINE',
      items: [
        { label: 'Referral Audits', href: '/admin/referrals', icon: TreeStructure },
        { label: 'Rank Milestones', href: '/admin/ranks', icon: Crown },
        { label: 'Milestone Rewards', href: '/admin/rewards', icon: Gift },
      ],
    },
    {
      title: 'SYSTEM & CONFIG',
      items: [
        { label: 'CMS Settings', href: '/admin/cms', icon: Article },
        { label: 'System Audit Logs', href: '/admin/audit-logs', icon: Scroll },
      ],
    },
  ];

  const userInitials = (user?.fullName || 'Admin')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-cyan-500/30">
      {/* 1. Desktop Persistent Admin Sidebar (Linear / Stripe Style) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#050916] border-r border-white/[0.08] p-3.5 shrink-0 min-h-screen sticky top-0 shadow-2xl">
        <div className="space-y-4">
          {/* Header Brand Bar */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/[0.06] pb-3">
            <Link to="/" className="flex items-center space-x-2">
              <DreamLogo size={24} />
            </Link>
            <span className="text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Quick Switch to Partner App */}
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs text-slate-300 hover:text-white transition-all group"
          >
            <div className="flex items-center space-x-2">
              <House size={14} className="text-cyan-400" />
              <span className="font-medium text-[11px]">Switch to Partner App</span>
            </div>
            <ArrowSquareOut size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Grouped Navigation Links */}
          <div className="space-y-4 pt-1">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-0.5">
                <span className="px-2.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block pb-1">
                  {group.title}
                </span>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.href);

                    return (
                      <NavLink
                        key={item.label}
                        to={item.href}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 relative ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/25 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {isActive && (
                            <span className="w-1 h-3.5 bg-cyan-400 rounded-full shrink-0" />
                          )}
                          <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Admin Identity */}
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[1px] shrink-0">
                <div className="w-full h-full rounded-full bg-[#050916] flex items-center justify-center text-[10px] font-bold text-cyan-300">
                  {userInitials}
                </div>
              </div>
              <div className="truncate max-w-[130px]">
                <p className="font-semibold text-white truncate text-xs">{user?.fullName || 'Administrator'}</p>
                <p className="text-[9px] text-slate-400 font-mono truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <SignOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Compact Top Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#050916] border-b border-white/[0.08] sticky top-0 z-40">
        <Link to="/" className="flex items-center space-x-2">
          <DreamLogo size={22} />
        </Link>
        <div className="flex items-center space-x-2">
          <Link
            to="/dashboard"
            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300 hover:bg-white/10"
          >
            Partner App
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-white"
            aria-label="Open Navigation Menu"
          >
            <span className="w-3.5 h-0.5 bg-current rounded-full" />
            <span className="w-3.5 h-0.5 bg-current rounded-full" />
            <span className="w-3.5 h-0.5 bg-current rounded-full" />
          </button>
        </div>
      </header>

      {/* 3. Mobile Premium Enterprise Drawer (Full Screen / Slide-in Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#020612]/95 backdrop-blur-2xl flex flex-col justify-between p-5 animate-in fade-in slide-in-from-left duration-250 font-sans">
          
          {/* Top Admin Identity Card Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                {/* Circular Profile Avatar with Gradient Ring */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-[1.5px] shadow-[0_0_15px_rgba(0,242,254,0.25)] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#050916] flex items-center justify-center text-xs font-bold text-cyan-300 font-mono">
                    {userInitials}
                  </div>
                </div>

                {/* Identity Info */}
                <div className="space-y-0.5 overflow-hidden max-w-[190px]">
                  <div className="flex items-center space-x-1.5">
                    <h2 className="text-sm font-heading font-bold text-white tracking-tight truncate">
                      System Admin Portal
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    {user?.email}
                  </p>
                  <div className="pt-0.5">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <ShieldCheck size={11} weight="fill" className="text-cyan-400" />
                      <span>SUPER ADMIN</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setConfirmSignOut(false);
                }}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                aria-label="Close Menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grouped Navigation Links (Scrollable Center Area) */}
            <div className="overflow-y-auto max-h-[calc(100vh-270px)] pr-1 space-y-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                    {group.title}
                  </span>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/admin'
                          ? location.pathname === '/admin'
                          : location.pathname.startsWith(item.href);

                      return (
                        <NavLink
                          key={item.label}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                              : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          {isActive ? (
                            <span className="w-1 h-3.5 bg-cyan-400 rounded-full shrink-0" />
                          ) : (
                            <span className="w-1 h-3.5 bg-transparent rounded-full shrink-0" />
                          )}
                          <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                          <span className="flex-1 truncate">{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed Bottom Actions Card */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 transition-all"
            >
              <ArrowSquareOut size={15} className="text-cyan-400" />
              <span>Switch to Partner Dashboard</span>
            </Link>

            {confirmSignOut ? (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between animate-in fade-in duration-200">
                <span className="text-xs text-rose-300 font-semibold">Confirm Sign Out?</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    Yes, Exit
                  </button>
                  <button
                    onClick={() => setConfirmSignOut(false)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-xs hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmSignOut(true)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-xs font-semibold text-rose-300 transition-all cursor-pointer"
              >
                <SignOut size={15} />
                <span>Sign Out of Administration</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Main Admin Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

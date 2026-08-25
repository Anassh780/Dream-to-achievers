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
} from '@phosphor-icons/react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#030712] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
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

  const adminNavItems = [
    { label: 'Overview', href: '/admin', icon: House },
    { label: 'Users Directory', href: '/admin/users', icon: Users },
    { label: 'Products & Catalog', href: '/admin/products', icon: Package },
    { label: 'Sales Orders', href: '/admin/sales', icon: ShoppingCart },
    { label: 'Referral Tree', href: '/admin/referrals', icon: TreeStructure },
    { label: 'Rank Milestones', href: '/admin/ranks', icon: Crown },
    { label: 'Reward Payouts', href: '/admin/rewards', icon: Gift },
    { label: 'CMS & Social Media', href: '/admin/cms', icon: Article },
    { label: 'System Audit Logs', href: '/admin/audit-logs', icon: Scroll },
  ];

  return (
    <div className="min-h-screen bg-[#040814] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-cyan-500/30">
      {/* Desktop Persistent Admin Sidebar (SaaS Style) */}
      <aside className="hidden md:flex flex-col justify-between w-60 bg-[#060B18] border-r border-white/[0.08] p-3.5 shrink-0 min-h-screen sticky top-0 shadow-xl">
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

          {/* Quick Switch to User App */}
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

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <span className="px-2.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold block pb-1">
              Platform Controls
            </span>
            <nav className="space-y-0.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border-l-2 border-cyan-400 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Admin Identity */}
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px]">
            <div className="truncate max-w-[140px]">
              <p className="font-semibold text-white truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[9px] text-slate-400 font-mono truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <SignOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (Compact & Crisp) */}
      <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#060B18] border-b border-white/[0.08] sticky top-0 z-40">
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            <span className={`w-3.5 h-0.5 bg-current rounded-full transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
            <span className={`w-3.5 h-0.5 bg-current rounded-full transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-3.5 h-0.5 bg-current rounded-full transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#030712]/98 backdrop-blur-2xl p-5 pt-16 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <p className="font-bold text-white text-sm">Platform Admin</p>
                <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg bg-white/5 text-slate-300">
                ✕
              </button>
            </div>

            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 text-xs font-medium"
                  >
                    <Icon size={18} className="text-cyan-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-white/[0.08] space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-white/5 text-white text-xs font-medium"
            >
              <ArrowSquareOut size={14} />
              <span>Switch to Partner Dashboard</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-medium"
            >
              <SignOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

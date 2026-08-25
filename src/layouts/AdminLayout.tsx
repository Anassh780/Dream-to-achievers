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
  List,
  X,
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
        <LockKey size={52} className="text-cyan-400 animate-pulse" />
        <h2 className="text-2xl font-heading font-bold text-white">403 — Administrative Access Required</h2>
        <p className="text-sm text-slate-400 max-w-md">
          This portal is restricted to authorized administrators (<code className="text-cyan-400 font-mono">muskyna46@gmail.com</code>, <code className="text-cyan-400 font-mono">ghhhbbbhjn3@gmail.com</code>).
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="md" className="rounded-xl font-bold">
              Sign In with Admin Email
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

  const adminNavItems = [
    { label: 'Admin Overview', href: '/admin', icon: House },
    { label: 'Users Directory', href: '/admin/users', icon: Users },
    { label: 'Products & Margins', href: '/admin/products', icon: Package },
    { label: 'Sales Verifications', href: '/admin/sales', icon: ShoppingCart },
    { label: 'Referral Audits', href: '/admin/referrals', icon: TreeStructure },
    { label: 'Rank Thresholds', href: '/admin/ranks', icon: Crown },
    { label: 'Milestone Rewards', href: '/admin/rewards', icon: Gift },
    { label: 'CMS Settings', href: '/admin/cms', icon: Article },
    { label: 'System Audit Logs', href: '/admin/audit-logs', icon: Scroll },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-cyan-500/30">
      {/* Desktop Persistent Admin Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#080E1E] border-r border-white/[0.08] p-4 shrink-0 min-h-screen sticky top-0 shadow-2xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/">
              <DreamLogo size={26} />
            </Link>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              ADMIN
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0C152B] border border-white/[0.08]">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Administrator'}</p>
            <p className="text-[10px] text-cyan-400 font-mono">{user?.email}</p>
          </div>

          {/* Quick Direct Switch to Partner App */}
          <Link
            to="/dashboard"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-transparent border border-cyan-400/25 hover:border-cyan-400/50 transition-all text-xs group shadow-[0_0_15px_rgba(0,242,254,0.1)]"
          >
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
                <House size={16} weight="fill" />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-cyan-300 transition-colors">Partner View</p>
                <p className="text-[10px] text-slate-400">Switch to User App</p>
              </div>
            </div>
            <ArrowSquareOut size={14} className="text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block pb-1">
              SYSTEM CONTROLS
            </span>
            <nav className="space-y-1">
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
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-transparent text-cyan-300 font-semibold border-l-2 border-cyan-400'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
          >
            <ArrowSquareOut size={16} />
            <span>Switch to Partner View</span>
          </Link>
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
          <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded-full">
            ADMIN
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
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
                <p className="font-bold text-white">System Admin Portal</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-white/5 text-slate-300">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1.5">
              {adminNavItems.map((item) => {
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

          <div className="pt-6 border-t border-white/10 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-white/5 text-white text-xs font-semibold"
            >
              <ArrowSquareOut size={16} />
              <span>Partner Dashboard</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-semibold"
            >
              <SignOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Sub-Page Outlet */}
      <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

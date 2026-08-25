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
} from '@phosphor-icons/react';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#06090F] text-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <ShieldCheck size={48} className="text-[#3B82F6]" />
        <h2 className="text-xl font-heading font-bold text-white">403 — Administrative Access Required</h2>
        <p className="text-sm text-[#94A3B8] max-w-md">
          This portal is restricted to authorized Dream to Achievers administrators. Use the Persona Switcher in the bottom-left to toggle to System Admin.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/dashboard">
            <Button variant="secondary" size="md" className="rounded-xl">
              User Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="primary" size="md" className="rounded-xl">
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
    <div className="min-h-screen bg-[#06090F] text-[#F8FAFC] flex flex-col md:flex-row font-sans selection:bg-[#3B82F6]/30">
      {/* Desktop Persistent Admin Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-[#0A0F19] border-r border-white/[0.08] p-4 shrink-0 min-h-screen sticky top-0">
        <div className="space-y-5">
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/">
              <DreamLogo size={26} />
            </Link>
            <span className="text-[10px] font-mono font-medium bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/20 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0E1626] border border-white/[0.08]">
            <p className="text-xs font-semibold text-white">{user?.fullName || 'Administrator'}</p>
            <p className="text-[11px] text-[#64748B]">System Management</p>
          </div>

          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-semibold block pb-1">
              MANAGEMENT
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
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                      isActive
                        ? 'bg-[#121C2E] text-white font-semibold border-l-[3px] border-[#3B82F6]'
                        : 'text-[#94A3B8] hover:bg-[#0E1626] hover:text-[#F8FAFC]'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-[#3B82F6]' : 'text-[#64748B]'} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08] space-y-1 text-xs">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#0E1626] transition-colors"
          >
            <span>Partner Dashboard</span>
            <ArrowSquareOut size={14} />
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <SignOut size={16} />
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0A0F19] border-b border-white/[0.08] sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <DreamLogo size={26} />
          <span className="text-[10px] text-[#3B82F6] border border-[#3B82F6]/30 px-1.5 py-0.5 rounded">
            ADMIN
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#CBD5E1]"
        >
          {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#06090F]/95 backdrop-blur-md z-50 p-5 flex flex-col justify-between">
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-2.5 rounded-xl text-sm text-[#CBD5E1] hover:bg-[#0E1626]"
                >
                  <Icon size={18} className="text-[#3B82F6]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Admin Sub-Page Outlet */}
      <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

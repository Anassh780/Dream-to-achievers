import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
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
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <LockKey size={48} className="text-[#1F4D3E]" />
        <h2 className="font-serif text-xl font-medium text-[#1E241F]">Administrative Access Required</h2>
        <p className="text-xs text-[#5B5C50] max-w-md">
          This portal is restricted to authorized platform administrators.
        </p>
        <div className="flex items-center space-x-3 pt-2">
          <Link to="/login">
            <Button variant="primary" size="sm" className="text-xs font-medium">
              Sign In with Admin Account
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="text-xs font-medium">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const navGroups: NavGroup[] = [
    {
      title: 'COMMERCE OPERATIONS',
      items: [
        { label: 'Overview', href: '/admin', icon: House },
        { label: 'Category Taxonomy', href: '/admin/categories', icon: Article },
        { label: 'Products & Inventory', href: '/admin/products', icon: Package },
        { label: 'Sales Verification', href: '/admin/sales', icon: ShoppingCart },
        { label: 'Users Management', href: '/admin/users', icon: Users },
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
      title: 'SYSTEM & AUDIT',
      items: [
        { label: 'CMS & Settings', href: '/admin/cms', icon: Article },
        { label: 'System Audit Logs', href: '/admin/audit-logs', icon: Scroll },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] flex flex-col md:flex-row font-sans selection:bg-[#B8862E]/25">
      
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-[#E3DCC8] p-4 shrink-0 min-h-screen sticky top-0 shadow-xs">
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <img src="/images/logo.png" alt="DreamToAchievers" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
              </div>
              <div>
                <span className="font-serif font-semibold text-sm text-[#1E241F] block">Admin Engine</span>
                <span className="text-[10px] font-mono text-[#5B5C50]">Super Admin</span>
              </div>
            </Link>
            <Link
              to="/dashboard"
              className="p-1.5 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF] transition-colors"
              title="Switch to Partner Dashboard"
            >
              <ArrowSquareOut size={16} />
            </Link>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-5 text-xs">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-[#7C7D70]">
                  {group.title}
                </p>
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
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-colors font-medium ${
                          isActive
                            ? 'bg-[#1F4D3E] text-white font-medium shadow-xs'
                            : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
                        }`}
                      >
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="space-y-2">
          <div className="pt-2 border-t border-[#E3DCC8] flex items-center justify-between">
            <SwitchButton size="sm" showLabel={true} className="w-full justify-start text-xs" />
          </div>

          {/* Admin User Info Card */}
          <div className="p-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-[#1E241F] truncate">{user?.fullName}</p>
              <p className="text-[10px] font-mono text-[#5B5C50] truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 cursor-pointer"
              title="Sign Out"
            >
              <SignOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E3DCC8] p-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1F4D3E] text-white flex items-center justify-center font-serif font-semibold text-sm">
            D
          </div>
          <span className="font-serif font-semibold text-sm text-[#1E241F]">Admin Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <SwitchButton size="sm" showLabel={false} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1E241F] hover:bg-[#FAF7EF]"
          >
            {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-[#FAF7EF] p-5 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-4 text-xs">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-mono font-semibold tracking-wider text-[#7C7D70]">
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
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg ${
                          isActive
                            ? 'bg-[#1F4D3E] text-white font-medium'
                            : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#F1ECDD]'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#E3DCC8]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
                navigate('/login');
              }}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

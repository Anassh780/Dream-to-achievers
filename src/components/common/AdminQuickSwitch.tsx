import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  House,
  Gauge,
  Package,
  ShoppingCart,
  Users,
  Crown,
  Gift,
  Article,
  X,
  CaretUp,
  CaretDown,
} from '@phosphor-icons/react';

export const AdminQuickSwitch: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  // Do not render floating widget inside Admin or Dashboard layouts (they have integrated header/sidebar switchers)
  const isInsidePortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');
  if (isInsidePortal) {
    return null;
  }

  const adminShortcuts = [
    { label: 'Admin Overview', href: '/admin', icon: Gauge },
    { label: 'Users Directory', href: '/admin/users', icon: Users },
    { label: 'Products & Margins', href: '/admin/products', icon: Package },
    { label: 'Sales Verification', href: '/admin/sales', icon: ShoppingCart },
    { label: 'Rank Thresholds', href: '/admin/ranks', icon: Crown },
    { label: 'Milestone Rewards', href: '/admin/rewards', icon: Gift },
    { label: 'Social & CMS Settings', href: '/admin/cms', icon: Article },
  ];

  return (
    <div className="hidden sm:block fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* Floating Panel Popup */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl bg-[#080E1E]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <ShieldCheck size={14} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Admin Quick Access</p>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>

          {/* Primary View Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2 py-2.5">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all"
            >
              <Gauge size={14} />
              <span>Admin Panel</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all"
            >
              <House size={14} />
              <span>Partner App</span>
            </Link>
          </div>

          {/* Quick Admin Navigation List */}
          <div className="space-y-0.5 pt-2 border-t border-white/[0.08]">
            {adminShortcuts.slice(0, 5).map((sc) => {
              const Icon = sc.icon;
              return (
                <Link
                  key={sc.href}
                  to={sc.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={13} className="text-cyan-400" />
                    <span>{sc.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#080E1E] hover:bg-[#0C152B] text-white border border-white/15 shadow-xl transition-all duration-200 cursor-pointer group active:scale-95 text-xs"
      >
        <div className="w-4 h-4 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
          <ShieldCheck size={11} weight="fill" />
        </div>
        <span className="font-semibold text-slate-200">Admin Mode</span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
          PROD
        </span>
        {isOpen ? <CaretDown size={12} /> : <CaretUp size={12} />}
      </button>
    </div>
  );
};

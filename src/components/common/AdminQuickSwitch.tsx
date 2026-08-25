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
  Sparkle,
} from '@phosphor-icons/react';

export const AdminQuickSwitch: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const isInAdmin = location.pathname.startsWith('/admin');
  const isInDashboard = location.pathname.startsWith('/dashboard');

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
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* Floating Panel Popup */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-3xl bg-[#080E1E]/95 backdrop-blur-2xl border border-cyan-500/30 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,242,254,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <ShieldCheck size={16} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1">
                  <span>Admin Control Hub</span>
                  <Sparkle size={10} className="text-cyan-400" />
                </p>
                <p className="text-[10px] text-cyan-300 font-mono truncate max-w-[170px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Primary View Switcher Buttons */}
          <div className="grid grid-cols-2 gap-2 py-3">
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-bold transition-all ${
                isInAdmin
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md ring-1 ring-white/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <Gauge size={18} className="mb-1" />
              <span>Admin Panel</span>
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-xs font-bold transition-all ${
                isInDashboard
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md ring-1 ring-white/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <House size={18} className="mb-1" />
              <span>Partner App</span>
            </Link>
          </div>

          {/* Quick Admin Navigation List */}
          <div className="space-y-1 pt-2 border-t border-white/[0.08]">
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block px-2 pb-1">
              Direct Admin Shortcuts
            </span>
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
              {adminShortcuts.map((sc) => {
                const Icon = sc.icon;
                return (
                  <Link
                    key={sc.href}
                    to={sc.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon size={14} className="text-cyan-400" />
                      <span>{sc.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-[#080E1E] hover:bg-[#0C152B] text-white border border-cyan-400/40 shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,242,254,0.25)] transition-all duration-200 cursor-pointer group active:scale-95"
      >
        <div className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
          <ShieldCheck size={13} weight="fill" />
        </div>
        <span className="text-xs font-bold">
          {isInAdmin ? 'Admin Center' : 'Switch Mode'}
        </span>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          ADMIN
        </span>
        {isOpen ? <CaretDown size={14} /> : <CaretUp size={14} />}
      </button>
    </div>
  );
};

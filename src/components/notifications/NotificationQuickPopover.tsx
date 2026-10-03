import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppNotification } from '@/types';
import { notificationService } from '@/services/notificationService';
import {
  Bell,
  Check,
  CheckCircle,
  Clock,
  ArrowRight,
  X,
  Trophy,
  Gift,
  ShoppingCart,
  Users,
  Info,
  Sparkle,
} from '@phosphor-icons/react';

interface NotificationQuickPopoverProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  unreadCount: number;
  onRefreshUserData?: () => void;
}

export const NotificationQuickPopover: React.FC<NotificationQuickPopoverProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectNotification,
  unreadCount,
  onRefreshUserData,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    userId ? notificationService.getUserNotifications(userId) : []
  );
  const [filter, setFilter] = useState<'all' | 'unread' | 'sales' | 'rewards' | 'team'>('all');

  const refreshList = () => {
    if (!userId) return;
    setNotifications(notificationService.getUserNotifications(userId));
    if (onRefreshUserData) onRefreshUserData();
  };

  useEffect(() => {
    if (!isOpen || !userId) return;
    refreshList();

    // Pull real-time cloud updates
    notificationService.syncUserNotificationsFromCloud(userId).then((cloudNotifs) => {
      setNotifications(cloudNotifs);
    }).catch(() => {});

    const handleUpdate = () => {
      refreshList();
    };

    window.addEventListener('dta_storage_change', handleUpdate);
    window.addEventListener('dta_badge_update', handleUpdate);
    return () => {
      window.removeEventListener('dta_storage_change', handleUpdate);
      window.removeEventListener('dta_badge_update', handleUpdate);
    };
  }, [isOpen, userId]);

  // Click outside listener with detached element immunity
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Critical: if clicked node was detached from DOM during react rerender, do not close!
      if (!document.body.contains(target)) return;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (target.closest?.('[aria-label="Quick Notifications"]')) return;
      if (target.closest?.('[aria-label="Toggle notifications pop-up"]')) return;
      if (target.closest?.('[aria-label="Platform Notifications"]')) return;
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleMarkAllRead = () => {
    if (!userId) return;
    notificationService.markAllAsRead(userId);
    refreshList();
  };

  const handleMarkItemRead = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    notificationService.markAsRead(notifId);
    refreshList();
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (isNaN(diffSec) || diffSec < 0) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 30) return `${diffDay}d ago`;
      return `${Math.floor(diffDay / 30)}mo ago`;
    } catch {
      return dateStr;
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return <Trophy size={15} weight="fill" className="text-amber-400" />;
      case 'reward_paid':
      case 'reward_approved':
      case 'reward_earned':
        return <Gift size={15} weight="fill" className="text-[#34D399]" />;
      case 'withdrawal_requested':
      case 'withdrawal_approved':
      case 'withdrawal_paid':
        return <Sparkle size={15} weight="fill" className="text-[#34D399]" />;
      case 'sale_submitted':
      case 'sale_confirmed':
      case 'sale_dispatched':
      case 'sale_delivered':
        return <ShoppingCart size={15} weight="fill" className="text-sky-400" />;
      case 'referral_joined':
      case 'team_expansion':
        return <Users size={15} weight="fill" className="text-purple-400" />;
      default:
        return <Bell size={15} weight="fill" className="text-[#D9C08A]" />;
    }
  };

  const filteredNotifs = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'sales') return n.type.includes('sale') || n.type.includes('order');
      if (filter === 'rewards') return n.type.includes('reward') || n.type.includes('rank') || n.type.includes('withdrawal');
      if (filter === 'team') return n.type === 'referral_joined' || n.type === 'team_expansion';
      return true;
    });
  }, [notifications, filter]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile & Desktop backdrop overlay for focus & outside dismiss */}
      <div
        className="fixed inset-0 z-40 bg-black/60 md:bg-black/25 backdrop-blur-xs animate-notif-backdrop cursor-pointer"
        onClick={onClose}
      />

      {/* Floating Popover Container */}
      <div
        ref={popoverRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Quick Notifications"
        className="fixed right-3 sm:right-6 md:right-8 lg:right-12 top-16 md:top-20 z-50 w-[calc(100vw-24px)] max-w-sm sm:max-w-md rounded-3xl bg-[#0D1512]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(217,192,138,0.06)] overflow-hidden flex flex-col max-h-[82vh] animate-notif-popover"
      >
        {/* Top Header */}
        <div className="p-4 pb-3 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#070B09]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#D9C08A]">
              <Bell size={16} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-semibold text-sm text-[#F4F7F5]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-mono font-bold text-[9.5px] animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#9EABA2]">Real-time Partner Alerts</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllRead();
                }}
                className="px-2 py-1 rounded-lg text-[10px] font-mono text-[#34D399] hover:bg-[#34D399]/10 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 rounded-lg text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X size={15} weight="bold" />
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'sales', label: 'Orders & Sales' },
            { id: 'rewards', label: 'Ranks & Rewards' },
            { id: 'team', label: 'Referral Team' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFilter(tab.id as any);
              }}
              className={`px-2.5 py-1 rounded-full text-[10.5px] font-mono font-medium shrink-0 transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30 font-semibold'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Notifications List */}
        <div className="overflow-y-auto overscroll-contain flex-1 max-h-[380px] p-2 space-y-1.5 [scrollbar-width:thin]">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-[#9EABA2] space-y-2">
              <CheckCircle size={28} className="text-[#34D399]/70 mx-auto" />
              <p className="text-xs font-medium text-[#F4F7F5]">All caught up!</p>
              <p className="text-[11px] text-[#9EABA2]/70 leading-relaxed">
                You have no notifications in this category right now.
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) {
                    notificationService.markAsRead(notif.id);
                    refreshList();
                  }
                  onSelectNotification(notif);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer group active:scale-[0.99] ${
                  !notif.isRead
                    ? 'bg-white/[0.04] border-[#34D399]/30 hover:border-[#34D399] shadow-xs'
                    : 'bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#F4F7F5] truncate group-hover:text-[#34D399] transition-colors">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#9EABA2] line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5 text-[10px] font-mono text-[#9EABA2]/60">
                    <Clock size={10} />
                    <span>{formatTimeAgo(notif.createdAt)}</span>
                  </div>
                </div>

                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={(e) => handleMarkItemRead(e, notif.id)}
                    className="p-1.5 rounded-lg text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.08] transition-colors shrink-0"
                    title="Mark read"
                  >
                    <Check size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation Link */}
        <div className="p-3 bg-[#070B09]/80 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <Link
            to="/dashboard/notifications"
            onClick={onClose}
            className="text-[11px] font-mono text-[#D9C08A] hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <span>Open Full Notification Hub</span>
            <ArrowRight size={12} />
          </Link>
          <span className="text-[10px] font-mono text-[#9EABA2]/60">
            {notifications.length} total alerts
          </span>
        </div>
      </div>
    </>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ArrowSquareOut,
  SlidersHorizontal,
  Trash,
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
  const navigate = useNavigate();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    userId ? notificationService.getUserNotifications(userId) : []
  );
  const [filter, setFilter] = useState<'all' | 'unread' | 'sales' | 'rewards' | 'team'>('all');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await notificationService.markAllAsRead(userId);
    refreshList();
  };

  const handleMarkItemRead = async (e: React.MouseEvent, notifId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await notificationService.markAsRead(notifId);
    refreshList();
  };

  const handleDeleteItem = async (e: React.MouseEvent, notifId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingIds((prev) => new Set(prev).add(notifId));
    setTimeout(async () => {
      await notificationService.deleteNotification(notifId, userId);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(notifId);
        return next;
      });
      refreshList();
    }, 300);
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

  const getNotifDetails = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return {
          icon: Trophy,
          iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          accent: 'text-amber-400',
          channel: 'Rank Level',
        };
      case 'reward_paid':
      case 'reward_approved':
      case 'reward_earned':
        return {
          icon: Gift,
          iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          accent: 'text-emerald-400',
          channel: 'Cash Bonus',
        };
      case 'withdrawal_requested':
      case 'withdrawal_approved':
      case 'withdrawal_paid':
        return {
          icon: Sparkle,
          iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          accent: 'text-emerald-400',
          channel: 'Payout',
        };
      case 'sale_submitted':
      case 'sale_confirmed':
      case 'sale_dispatched':
      case 'sale_delivered':
        return {
          icon: ShoppingCart,
          iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          accent: 'text-sky-400',
          channel: 'Store Order',
        };
      case 'referral_joined':
      case 'team_expansion':
        return {
          icon: Users,
          iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          accent: 'text-purple-400',
          channel: 'Downline Team',
        };
      default:
        return {
          icon: Bell,
          iconBg: 'bg-[#D9C08A]/15 text-[#D9C08A] border-[#D9C08A]/30',
          accent: 'text-[#D9C08A]',
          channel: 'Notice',
        };
    }
  };

  const getNotifAction = (notif: AppNotification) => {
    const link = notif.linkUrl || notif.link;
    if (link) {
      if (link.includes('sales')) return { label: 'View Order', path: link };
      if (link.includes('rewards')) return { label: 'View Reward', path: link };
      if (link.includes('ranks')) return { label: 'Track Rank', path: link };
      if (link.includes('referrals')) return { label: 'View Team', path: link };
      if (link.includes('products')) return { label: 'View Catalog', path: link };
      return { label: 'View Action', path: link };
    }
    if (notif.type.includes('sale') || notif.type.includes('order')) return { label: 'View Order', path: '/dashboard/sales' };
    if (notif.type.includes('reward') || notif.type.includes('rank')) return { label: 'View Rewards', path: '/dashboard/rewards' };
    if (notif.type.includes('referral') || notif.type.includes('team')) return { label: 'View Team', path: '/dashboard/referrals' };
    return null;
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
      {/* Mobile & Desktop backdrop overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/75 md:bg-black/35 backdrop-blur-xs animate-notif-backdrop cursor-pointer"
        onClick={onClose}
      />

      {/* Floating Popover Container: Bottom Sheet on Mobile (<640px), Anchored Island on Desktop (sm+) */}
      <div
        ref={popoverRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications Panel"
        className="fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-20 sm:right-6 sm:inset-x-auto sm:w-[430px] z-50 rounded-t-[32px] sm:rounded-3xl bg-[#0D1512]/98 backdrop-blur-2xl border border-white/12 shadow-[0_-20px_50px_rgba(0,0,0,0.9),0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(217,192,138,0.08)] overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[580px] pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="px-4 py-3 sm:p-4 border-b border-white/[0.08] flex items-center justify-between gap-3 bg-[#070B09]/75 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D9C08A]/25 to-transparent border border-[#D9C08A]/40 flex items-center justify-center text-[#D9C08A] shrink-0 shadow-xs">
              <Bell size={18} weight="fill" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#F4F7F5] truncate">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold text-[10px] shadow-xs animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#9EABA2] block truncate">Direct Partner Alerts &amp; Ledger Log</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllRead();
                }}
                className="px-2.5 py-1.5 min-h-[36px] rounded-xl text-[11px] font-mono font-semibold text-[#34D399] bg-[#34D399]/10 hover:bg-[#34D399]/20 border border-[#34D399]/25 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCircle size={13} weight="bold" />
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Read all</span>
              </button>
            )}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center"
              aria-label="Close notifications panel"
            >
              <X size={17} weight="bold" />
            </button>
          </div>
        </div>

        {/* Quick Category Filter Tabs */}
        <div className="px-3.5 py-2 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-momentum bg-[#070B09]/40 shrink-0">
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
              className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono font-medium shrink-0 transition-all cursor-pointer flex items-center justify-center active:scale-95 ${
                filter === tab.id
                  ? 'bg-[#34D399] text-[#070B09] font-bold shadow-md'
                  : 'bg-white/[0.04] text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Notifications Feed */}
        <div className="overflow-y-auto overscroll-contain flex-1 p-3 space-y-2 no-scrollbar touch-momentum">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-[#9EABA2] space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/25 text-[#34D399] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle size={26} weight="bold" />
              </div>
              <p className="font-serif font-bold text-sm text-[#F4F7F5]">All caught up!</p>
              <p className="text-xs text-[#9EABA2] max-w-xs mx-auto leading-relaxed">
                {filter === 'unread'
                  ? 'Zero unread notices. You are up to date on all customer deliveries and bonus unlocks.'
                  : 'No notifications in this category right now.'}
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const details = getNotifDetails(notif.type);
              const IconComp = details.icon;
              const action = getNotifAction(notif);
              const isDeleting = deletingIds.has(notif.id);

              return (
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
                  className={`border flex flex-col gap-2.5 cursor-pointer group active:scale-[0.99] transition-all duration-300 ease-out ${
                    isDeleting
                      ? 'opacity-0 -translate-x-full scale-95 max-h-0 py-0 my-0 overflow-hidden pointer-events-none'
                      : 'max-h-[300px] p-3.5 opacity-100 translate-x-0 scale-100 rounded-2xl'
                  } ${
                    !notif.isRead
                      ? 'bg-gradient-to-r from-emerald-950/30 via-white/[0.03] to-transparent border-l-4 border-l-[#34D399] border-y-white/10 border-r-white/10 shadow-xs'
                      : 'bg-white/[0.015] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform ${details.iconBg}`}
                    >
                      <IconComp size={18} weight="fill" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider ${details.accent}`}>
                            {details.channel}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[#9EABA2]/70 shrink-0">
                          <Clock size={11} />
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-[#F4F7F5] truncate group-hover:text-[#34D399] transition-colors leading-snug">
                        {notif.title}
                      </h4>

                      <p className="text-xs text-[#9EABA2] line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {/* Action Strip (Direct Link Button + Mark Read Button) */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                    {action ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!notif.isRead) {
                            notificationService.markAsRead(notif.id);
                          }
                          onClose();
                          navigate(action.path);
                        }}
                        className="px-3 py-1 min-h-[34px] rounded-lg bg-white/[0.05] hover:bg-[#34D399]/20 hover:text-[#34D399] border border-white/10 text-xs font-mono font-semibold text-[#F4F7F5] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <span>{action.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#9EABA2]/60">Tap card to inspect</span>
                    )}

                    {!notif.isRead ? (
                      <button
                        type="button"
                        onClick={(e) => handleMarkItemRead(e, notif.id)}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-mono text-[#34D399] hover:bg-[#34D399]/15 border border-transparent hover:border-[#34D399]/30 transition-all flex items-center gap-1 cursor-pointer"
                        title="Mark notification as read"
                      >
                        <Check size={13} weight="bold" />
                        <span>Mark read</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-[#9EABA2]/50">Read</span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(e, notif.id)}
                      className="min-h-[34px] min-w-[34px] px-2 rounded-lg text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/15 transition-all flex items-center justify-center cursor-pointer"
                      title="Clear & delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hub Link */}
        <div className="p-3.5 bg-[#070B09]/90 border-t border-white/[0.08] flex items-center justify-between text-xs shrink-0">
          <Link
            to="/dashboard/notifications"
            onClick={onClose}
            className="text-xs font-mono text-[#D9C08A] hover:underline inline-flex items-center gap-1.5 font-bold min-h-[38px]"
          >
            <span>Open Full Notification Hub</span>
            <ArrowRight size={13} />
          </Link>
          <span className="text-[10.5px] font-mono text-[#9EABA2]">
            {notifications.length} alerts logged
          </span>
        </div>
      </div>
    </>
  );
};

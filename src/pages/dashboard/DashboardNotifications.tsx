import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { webNotificationService } from '@/services/webNotificationService';
import { storage } from '@/services/storage';
import { AppNotification } from '@/types';
import { NotificationDetailModal } from '@/components/modals/NotificationDetailModal';
import { Button } from '@/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRinging,
  Check,
  CheckCircle,
  Info,
  Trophy,
  Gift,
  ShoppingCart,
  Users,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkle,
  DeviceMobile,
  Trash,
  MagnifyingGlass,
  ArrowsClockwise,
  EnvelopeSimple,
  Broom,
} from '@phosphor-icons/react';
import { EmailNotificationModal } from '@/components/modals/EmailNotificationModal';

export const DashboardNotifications: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    user ? notificationService.getUserNotifications(user.id) : []
  );

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);
  const [emailModalNotif, setEmailModalNotif] = useState<AppNotification | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

  // Push Permission State
  const [pushStatus, setPushStatus] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isEnablingPush, setIsEnablingPush] = useState(false);

  const refreshList = () => {
    if (!user) return;
    setNotifications(notificationService.getUserNotifications(user.id));
    refreshUserData();
  };

  const handleManualRefresh = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const cloudNotifs = await notificationService.syncUserNotificationsFromCloud(user.id);
      setNotifications(cloudNotifs);
      refreshUserData();
    } catch {
      refreshList();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    refreshList();

    // Pull latest notifications from Cloud Firestore & RTDB immediately
    notificationService.syncUserNotificationsFromCloud(user.id).then((cloudNotifs) => {
      setNotifications(cloudNotifs);
    }).catch(() => {});

    if (typeof Notification !== 'undefined') {
      setPushStatus(Notification.permission);
    }

    // Real-time cross-tab and storage listener
    const handleUpdate = () => {
      refreshList();
    };

    window.addEventListener('dta_storage_change', handleUpdate);
    window.addEventListener('dta_badge_update', handleUpdate);
    return () => {
      window.removeEventListener('dta_storage_change', handleUpdate);
      window.removeEventListener('dta_badge_update', handleUpdate);
    };
  }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    refreshList();
  };

  const handleMarkUnread = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificationService.markAsUnread(id);
    refreshList();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // 1. Trigger animated vanishing slide-out & scale down
    setDeletingIds((prev) => new Set(prev).add(id));

    // 2. Wait 300ms for animation to vanish, then permanently purge from records
    setTimeout(async () => {
      await notificationService.deleteNotification(id, user?.id);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refreshList();
      if (selectedNotif && selectedNotif.id === id) {
        setSelectedNotif(null);
      }
    }, 320);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    refreshList();
  };

  const handleDeleteRead = async () => {
    if (!user) return;
    const readIds = notifications.filter((n) => n.isRead).map((n) => n.id);
    if (readIds.length === 0) return;

    setDeletingIds((prev) => {
      const next = new Set(prev);
      readIds.forEach((id) => next.add(id));
      return next;
    });

    setTimeout(async () => {
      await notificationService.deleteReadNotifications(user.id);
      setDeletingIds(new Set());
      refreshList();
    }, 320);
  };

  const handleClearAll = async () => {
    if (!user || notifications.length === 0) return;
    const allIds = notifications.map((n) => n.id);

    // Vanish all notifications with smooth collective slide-out
    setDeletingIds(new Set(allIds));

    setTimeout(async () => {
      await notificationService.clearAllNotifications(user.id);
      setDeletingIds(new Set());
      refreshList();
      if (selectedNotif) setSelectedNotif(null);
    }, 320);
  };

  const handleOpenNotification = (notif: AppNotification) => {
    if (!notif.isRead) {
      notificationService.markAsRead(notif.id);
      refreshList();
    }
    setSelectedNotif(notif);
  };

  const handleEnablePush = async () => {
    setIsEnablingPush(true);
    const granted = await webNotificationService.requestPermission();
    if (typeof Notification !== 'undefined') {
      setPushStatus(Notification.permission);
    }
    setIsEnablingPush(false);
    if (granted) {
      webNotificationService.showNotification({
        title: 'Notifications Activated! 🔔',
        body: 'You will now receive instant push alerts for orders, milestone bonuses, and referral joinings on this device.',
        tag: 'welcome-push',
      });
    }
  };

  const formatTimeAgo = (dateStr: string) => {
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
      const diffMonth = Math.floor(diffDay / 30);
      return `${diffMonth}mo ago`;
    } catch {
      return dateStr;
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return <Trophy size={18} weight="fill" className="text-amber-400" />;
      case 'reward_paid':
      case 'reward_approved':
      case 'reward_earned':
        return <Gift size={18} weight="fill" className="text-[#34D399]" />;
      case 'withdrawal_requested':
      case 'withdrawal_approved':
      case 'withdrawal_paid':
        return <Sparkle size={18} weight="fill" className="text-[#34D399]" />;
      case 'sale_submitted':
      case 'sale_confirmed':
      case 'sale_dispatched':
      case 'sale_delivered':
        return <ShoppingCart size={18} weight="fill" className="text-sky-400" />;
      case 'referral_joined':
      case 'team_expansion':
        return <Users size={18} weight="fill" className="text-purple-400" />;
      default:
        return <Bell size={18} weight="fill" className="text-[#D9C08A]" />;
    }
  };

  const getNotifBadgeColor = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'reward_paid':
      case 'reward_approved':
      case 'reward_earned':
      case 'withdrawal_paid':
      case 'withdrawal_approved':
        return 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20';
      case 'sale_submitted':
      case 'sale_confirmed':
      case 'sale_dispatched':
      case 'sale_delivered':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'referral_joined':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-[var(--surface-alt)] text-[var(--ink-soft)] border-[var(--line)]';
    }
  };

  const getNotifBorderAccent = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return 'border-l-4 border-l-amber-500';
      case 'reward_paid':
      case 'reward_approved':
      case 'reward_earned':
      case 'withdrawal_paid':
      case 'withdrawal_approved':
        return 'border-l-4 border-l-[#34D399]';
      case 'sale_submitted':
      case 'sale_confirmed':
      case 'sale_dispatched':
      case 'sale_delivered':
        return 'border-l-4 border-l-sky-500';
      case 'referral_joined':
      case 'team_expansion':
        return 'border-l-4 border-l-purple-500';
      default:
        return 'border-l-4 border-l-[var(--primary)]';
    }
  };

  const getNotificationAction = (notif: AppNotification) => {
    const type = notif.type || '';
    if (type.includes('sale') || type.includes('order')) {
      return { label: 'View Orders', path: '/dashboard/sales', icon: ShoppingCart };
    }
    if (type.includes('reward') || type.includes('rank')) {
      return { label: 'View Rewards', path: '/dashboard/rewards', icon: Gift };
    }
    if (type.includes('withdrawal')) {
      return { label: 'View Balance', path: '/dashboard/sales', icon: Sparkle };
    }
    if (type.includes('referral') || type.includes('team')) {
      return { label: 'View Team', path: '/dashboard/referrals', icon: Users };
    }
    return null;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notifications.filter((n) => {
      if (q && !n.title?.toLowerCase().includes(q) && !n.message?.toLowerCase().includes(q)) {
        return false;
      }
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'sales') return n.type.includes('sale') || n.type.includes('order');
      if (activeTab === 'rewards') return n.type.includes('reward') || n.type.includes('rank') || n.type.includes('withdrawal');
      if (activeTab === 'team') return n.type === 'referral_joined' || n.type === 'team_expansion';
      if (activeTab === 'system') return n.type === 'system' || n.type === 'info' || n.type === 'welcome' || n.type === 'system_announcement';
      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  return (
    <div className="space-y-6 font-sans max-w-4xl selection:bg-[var(--accent)]/25">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[var(--ink-soft)]">
            <span>Activity</span>
            <span>/</span>
            <span>Alerts &amp; Real-time Notifications</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
              Partner Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-xs shadow-xs animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            Live transaction receipts, customer order fulfillment updates, rank milestone unlocks, and referral team additions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isSyncing}
            className="text-xs font-medium"
            iconLeft={<ArrowsClockwise size={14} className={isSyncing ? 'animate-spin' : ''} />}
          >
            Sync Cloud
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs font-medium"
              iconLeft={<CheckCircle size={14} />}
            >
              Mark All Read ({unreadCount})
            </Button>
          )}

          {readCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteRead}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
              iconLeft={<Trash size={14} />}
            >
              Clear Read ({readCount})
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-all"
              iconLeft={<Broom size={14} weight="bold" />}
            >
              Clear All ({notifications.length})
            </Button>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notifications by title, order ID, product, or keyword..."
          className="w-full pl-10 pr-10 py-2.5 min-h-[44px] rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 focus:outline-hidden focus:border-[var(--primary)] transition-all font-sans shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)] p-2 rounded-lg"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 3. Device Web Push Activation Banner */}
      {pushStatus !== 'granted' && (
        <div className="p-4 rounded-2xl bg-[var(--surface-alt)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <BellRinging size={20} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                Enable Mobile &amp; Desktop Push Notifications
              </h3>
              <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
                Stay updated instantly on customer sales, profit approvals, and team joins even when your browser or tab is closed.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleEnablePush}
            isLoading={isEnablingPush}
            className="text-xs font-semibold shrink-0 min-h-[44px]"
          >
            Turn On Notifications
          </Button>
        </div>
      )}

      {/* 4. Filter Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-momentum pb-1 text-xs font-mono whitespace-nowrap">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'sales', label: 'Orders & Sales' },
          { id: 'rewards', label: 'Ranks & Bonuses' },
          { id: 'team', label: 'Referral Team' },
          { id: 'system', label: 'System & Alerts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-semibold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface-alt)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Notifications Feed List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center text-[var(--ink-soft)] space-y-2 shadow-xs">
            <Bell size={36} className="text-[var(--ink-soft)]/70 mx-auto" />
            <p className="font-bold text-base text-[var(--ink)]">No notifications in this filter</p>
            <p className="text-xs text-[var(--ink-soft)]/70">
              {searchQuery
                ? `No notifications found matching "${searchQuery}".`
                : "You're all caught up with your partner alerts and ledger logs."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const action = getNotificationAction(notif);
            const borderAccent = getNotifBorderAccent(notif.type);
            const isDeleting = deletingIds.has(notif.id);

            return (
              <div
                key={notif.id}
                onClick={() => handleOpenNotification(notif)}
                className={`rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group transition-all duration-300 ease-out ${
                  isDeleting
                    ? 'opacity-0 -translate-x-full scale-95 max-h-0 py-0 my-0 overflow-hidden pointer-events-none'
                    : 'max-h-[350px] p-3.5 sm:p-4 opacity-100 translate-x-0 scale-100'
                } ${borderAccent} ${
                  !notif.isRead
                    ? 'bg-[var(--surface)] border-[var(--primary)]/40 shadow-xs ring-1 ring-[var(--primary)]/20 hover:border-[var(--primary)]'
                    : 'bg-[var(--surface)]/90 border-[var(--line)] hover:bg-[var(--surface-alt)]'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-2xs">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-xs sm:text-sm text-[var(--ink)] truncate group-hover:text-[var(--primary)] transition-colors">
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--ink-soft)]/75 font-mono pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                      <span>&bull;</span>
                      <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                    </div>

                    {/* Quick 1-Tap Action Deep-Link */}
                    {action && (
                      <div className="pt-1.5 sm:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(action.path);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[var(--primary)] bg-[var(--surface-alt)] hover:bg-[var(--primary)]/10 border border-[var(--primary)]/25 active:scale-[0.98] transition-all cursor-pointer min-h-[38px]"
                        >
                          <action.icon size={13} weight="bold" />
                          <span>{action.label}</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--line)]">
                  {/* Desktop Quick 1-Tap Action Pill */}
                  {action && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(action.path);
                      }}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[var(--primary)] bg-[var(--surface-alt)] hover:bg-[var(--primary)]/10 border border-[var(--primary)]/25 active:scale-[0.98] transition-all cursor-pointer min-h-[36px]"
                    >
                      <action.icon size={13} weight="bold" />
                      <span>{action.label}</span>
                      <ArrowRight size={11} />
                    </button>
                  )}

                  <div className="flex items-center space-x-1 ml-auto sm:ml-0">
                    {!notif.isRead ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notif.id);
                        }}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-[var(--ink-soft)] hover:text-[#34D399] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
                        title="Mark as read"
                        aria-label="Mark notification as read"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleMarkUnread(e, notif.id)}
                        className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
                        title="Mark as unread"
                        aria-label="Mark notification as unread"
                      >
                        <Clock size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmailModalNotif(notif);
                      }}
                      className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-[var(--ink-soft)] hover:text-[#D9C08A] hover:bg-[#D9C08A]/10 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
                      title="Send Luxury Email Receipt"
                      aria-label="Send Luxury Email Receipt"
                    >
                      <EnvelopeSimple size={16} weight="bold" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="min-h-[40px] min-w-[40px] p-2 rounded-xl text-[var(--ink-soft)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer inline-flex items-center justify-center active:scale-95"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash size={15} />
                    </button>

                    <span className="text-[11px] font-mono text-[var(--primary)] font-semibold hidden md:inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ml-1">
                      <span>Details</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 6. Notification Detail Modal Popup with Spring Motion Design */}
      <NotificationDetailModal
        notification={selectedNotif}
        isOpen={Boolean(selectedNotif)}
        onClose={() => setSelectedNotif(null)}
        onSendEmail={(notif) => setEmailModalNotif(notif)}
        onToggleRead={async (id, currentlyRead) => {
          if (currentlyRead) {
            await notificationService.markAsUnread(id);
            refreshList();
            if (selectedNotif && selectedNotif.id === id) {
              setSelectedNotif({ ...selectedNotif, isRead: false });
            }
          } else {
            await notificationService.markAsRead(id);
            refreshList();
            if (selectedNotif && selectedNotif.id === id) {
              setSelectedNotif({ ...selectedNotif, isRead: true });
            }
          }
        }}
        onDelete={async (id) => {
          await notificationService.deleteNotification(id, user?.id);
          refreshList();
          setSelectedNotif(null);
        }}
      />

      {/* 7. Luxury High-Visual Email Dispatch Studio Modal */}
      <EmailNotificationModal
        notification={emailModalNotif}
        isOpen={Boolean(emailModalNotif)}
        onClose={() => setEmailModalNotif(null)}
        defaultEmail={user?.email}
        defaultName={user?.fullName}
      />

    </div>
  );
};

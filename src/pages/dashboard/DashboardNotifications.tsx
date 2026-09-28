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
} from '@phosphor-icons/react';

export const DashboardNotifications: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    user ? notificationService.getUserNotifications(user.id) : []
  );

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

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

  const handleMarkRead = (id: string) => {
    notificationService.markAsRead(id);
    refreshList();
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id);
    refreshList();
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'sales') return n.type.includes('sale') || n.type.includes('order');
      if (activeTab === 'rewards') return n.type.includes('reward') || n.type.includes('rank') || n.type.includes('withdrawal');
      if (activeTab === 'team') return n.type === 'referral_joined' || n.type === 'team_expansion';
      if (activeTab === 'system') return n.type === 'system' || n.type === 'info' || n.type === 'welcome' || n.type === 'system_announcement';
      return true;
    });
  }, [notifications, activeTab]);

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

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-medium shrink-0"
            iconLeft={<CheckCircle size={14} />}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* 2. Device Web Push Activation Banner */}
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
            className="text-xs font-semibold shrink-0"
          >
            Turn On Notifications
          </Button>
        </div>
      )}

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono">
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
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-semibold shadow-xs'
                : 'bg-[var(--surface)] text-[var(--ink-soft)] border-[var(--line)] hover:bg-[var(--surface-alt)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Notifications Feed List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-center text-[var(--ink-soft)] space-y-2 shadow-xs">
            <Bell size={36} className="text-[var(--ink-soft)]/70 mx-auto" />
            <p className="font-bold text-base text-[var(--ink)]">No notifications in this filter</p>
            <p className="text-xs text-[var(--ink-soft)]/70">
              You&apos;re all caught up with your partner alerts and ledger logs.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenNotification(notif)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer group ${
                !notif.isRead
                  ? 'bg-[var(--surface)] border-[var(--primary)]/40 shadow-xs ring-1 ring-[var(--primary)]/20 hover:border-[var(--primary)]'
                  : 'bg-[var(--surface)]/90 border-[var(--line)] hover:bg-[var(--surface-alt)]'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-xs sm:text-sm text-[var(--ink)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-[var(--ink-soft)] leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center space-x-2 text-[10px] text-[var(--ink-soft)]/70 font-mono pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                    <span>&bull;</span>
                    <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0 self-center">
                {!notif.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notif.id);
                    }}
                    className="p-1.5 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]"
                    title="Mark as read"
                  >
                    <Check size={15} />
                  </button>
                )}
                <span className="text-[11px] font-mono text-[var(--primary)] font-semibold hidden sm:inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Details</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Notification Detail Modal Popup with Spring Motion Design */}
      <NotificationDetailModal
        notification={selectedNotif}
        isOpen={Boolean(selectedNotif)}
        onClose={() => setSelectedNotif(null)}
        onToggleRead={(id, currentlyRead) => {
          if (currentlyRead) {
            const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
            const idx = notifs.findIndex((n) => n.id === id);
            if (idx >= 0) {
              notifs[idx].isRead = false;
              storage.set('NOTIFICATIONS', notifs);
              refreshList();
              if (selectedNotif && selectedNotif.id === id) {
                setSelectedNotif({ ...selectedNotif, isRead: false });
              }
            }
          } else {
            notificationService.markAsRead(id);
            refreshList();
            if (selectedNotif && selectedNotif.id === id) {
              setSelectedNotif({ ...selectedNotif, isRead: true });
            }
          }
        }}
      />

    </div>
  );
};

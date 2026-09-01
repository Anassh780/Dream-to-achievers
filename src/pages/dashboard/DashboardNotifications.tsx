import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { webNotificationService } from '@/services/webNotificationService';
import { AppNotification } from '@/types';
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
    refreshList();
    if (typeof Notification !== 'undefined') {
      setPushStatus(Notification.permission);
    }
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
        title: 'Notifications Activated! ??',
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
        return <Trophy size={18} weight="fill" className="text-[#B8862E]" />;
      case 'reward_paid':
      case 'reward_earned':
        return <Gift size={18} weight="fill" className="text-[#1F4D3E]" />;
      case 'sale_confirmed':
        return <ShoppingCart size={18} weight="fill" className="text-[#1F4D3E]" />;
      case 'referral_joined':
        return <Users size={18} weight="fill" className="text-[#1F4D3E]" />;
      default:
        return <Info size={18} weight="bold" className="text-[#5B5C50]" />;
    }
  };

  const getNotifBadgeColor = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'reward_paid':
      case 'reward_earned':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'sale_confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'referral_joined':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-[#FAF7EF] text-[#5B5C50] border-[#E3DCC8]';
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'sales') return n.type === 'sale_confirmed';
      if (activeTab === 'rewards') return n.type === 'reward_paid' || n.type === 'reward_earned' || n.type === 'rank_achieved';
      if (activeTab === 'team') return n.type === 'referral_joined';
      if (activeTab === 'system') return n.type === 'system' || n.type === 'info';
      return true;
    });
  }, [notifications, activeTab]);

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Activity</span>
            <span>/</span>
            <span>Alerts &amp; Real-time Notifications</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E241F] tracking-tight">
              Partner Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold text-xs shadow-xs animate-pulse">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-[#5B5C50]">
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F1ECDD] to-[#FAF7EF] border border-[#E3DCC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F4D3E] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <BellRinging size={20} weight="fill" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-xs sm:text-sm text-[#1E241F]">
                Enable Mobile &amp; Desktop Push Notifications
              </h3>
              <p className="text-[11px] text-[#5B5C50] leading-relaxed">
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
            className="text-xs font-semibold shrink-0 bg-[#1F4D3E] text-white"
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
          { id: 'sales', label: '?? Orders & Sales' },
          { id: 'rewards', label: '?? Ranks & Bonuses' },
          { id: 'team', label: '?? Referral Team' },
          { id: 'system', label: '?? System & Alerts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#1F4D3E] text-white border-[#1F4D3E] font-semibold shadow-xs'
                : 'bg-white text-[#5B5C50] border-[#E3DCC8] hover:bg-[#FAF7EF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Notifications Feed List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-[#E3DCC8] text-center text-[#5B5C50] space-y-2 shadow-xs">
            <Bell size={36} className="text-[#7C7D70] mx-auto" />
            <p className="font-bold text-base text-[#1E241F]">No notifications in this filter</p>
            <p className="text-xs text-[#7C7D70]">
              You're all caught up with your partner alerts and ledger logs.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenNotification(notif)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer group ${
                !notif.isRead
                  ? 'bg-white border-[#1F4D3E]/40 shadow-xs ring-1 ring-[#1F4D3E]/20 hover:border-[#1F4D3E]'
                  : 'bg-white/90 border-[#E3DCC8] hover:bg-[#FAF7EF]'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-xs sm:text-sm text-[#1E241F] truncate group-hover:text-[#1F4D3E] transition-colors">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-[#5B5C50] leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center space-x-2 text-[10px] text-[#7C7D70] font-mono pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                    <span>•</span>
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
                    className="p-1.5 rounded-lg text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]"
                    title="Mark as read"
                  >
                    <Check size={15} />
                  </button>
                )}
                <span className="text-[11px] font-mono text-[#1F4D3E] font-semibold hidden sm:inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Details</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Notification Detail Modal Popup */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#E3DCC8] shadow-2xl p-6 space-y-4 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E3DCC8]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center shrink-0">
                  {getNotifIcon(selectedNotif.type)}
                </div>
                <div>
                  <span
                    className={`inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border mb-1 ${getNotifBadgeColor(
                      selectedNotif.type
                    )}`}
                  >
                    {selectedNotif.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-[#1E241F]">
                    {selectedNotif.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1.5 rounded-xl text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification Content Body */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2">
              <p className="text-xs sm:text-sm text-[#1E241F] leading-relaxed font-sans">
                {selectedNotif.message}
              </p>
              <div className="pt-2 border-t border-[#E3DCC8]/70 flex items-center justify-between text-[10.5px] font-mono text-[#7C7D70]">
                <span>Logged: {new Date(selectedNotif.createdAt).toLocaleString()}</span>
                <span>{formatTimeAgo(selectedNotif.createdAt)}</span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-[#7C7D70]">
                Notification ID: {selectedNotif.id}
              </span>

              <div className="flex items-center space-x-2">
                {selectedNotif.link && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const link = selectedNotif.link!;
                      setSelectedNotif(null);
                      navigate(link);
                    }}
                    className="bg-[#1F4D3E] text-white text-xs font-semibold"
                    iconRight={<ArrowRight size={13} />}
                  >
                    View in Section
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNotif(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

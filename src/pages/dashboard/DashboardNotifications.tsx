import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { AppNotification } from '@/types';
import { Button } from '@/components/ui/Button';
import { Bell, Check, CheckCircle, Info, Trophy, Gift, ShoppingCart, Users } from '@phosphor-icons/react';

export const DashboardNotifications: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    user ? notificationService.getUserNotifications(user.id) : []
  );

  const handleMarkRead = (id: string) => {
    notificationService.markAsRead(id);
    if (user) {
      setNotifications(notificationService.getUserNotifications(user.id));
      refreshUserData();
    }
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    notificationService.markAllAsRead(user.id);
    setNotifications(notificationService.getUserNotifications(user.id));
    refreshUserData();
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return <Trophy size={16} className="text-[#B8862E]" />;
      case 'reward_paid':
      case 'reward_earned':
        return <Gift size={16} className="text-[#1F4D3E]" />;
      case 'sale_confirmed':
        return <ShoppingCart size={16} className="text-[#1F4D3E]" />;
      case 'referral_joined':
        return <Users size={16} className="text-[#1F4D3E]" />;
      default:
        return <Info size={16} className="text-[#5B5C50]" />;
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Activity</span>
            <span>/</span>
            <span>Alerts &amp; Notifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E241F] tracking-tight">
            Partner Notifications Feed
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Activity updates on recorded sales, rank milestone unlocks, and referral team additions.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-medium"
            iconLeft={<CheckCircle size={14} />}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 rounded-xl bg-white border border-[#E3DCC8] text-center text-[#5B5C50] space-y-2 shadow-xs">
            <Bell size={32} className="text-[#7C7D70] mx-auto" />
            <p className="font-serif font-medium text-base text-[#1E241F]">No notifications</p>
            <p className="text-xs">You're all caught up with your partner account activity.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 shadow-xs ${
                !notif.isRead
                  ? 'bg-white border-[#1F4D3E]/30 hover:border-[#1F4D3E]'
                  : 'bg-white/80 border-[#E3DCC8] hover:bg-white'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] flex items-center justify-center shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-serif font-medium text-sm text-[#1E241F]">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3E]" />
                    )}
                  </div>
                  <p className="text-xs text-[#5B5C50] leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-[#7C7D70] font-mono block pt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notif.id);
                  }}
                  className="p-1 rounded text-[#5B5C50] hover:text-[#1E241F] shrink-0"
                  title="Mark read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

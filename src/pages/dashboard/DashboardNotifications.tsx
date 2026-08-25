import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Check } from '@phosphor-icons/react';

export const DashboardNotifications: React.FC = () => {
  const { user, refreshUserData } = useAuth();

  if (!user) return null;

  const notifs = notificationService.getUserNotifications(user.id);

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(user.id);
    refreshUserData();
  };

  const handleMarkOne = (id: string) => {
    notificationService.markAsRead(id);
    refreshUserData();
  };

  return (
    <div className="space-y-6 font-sans max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-[#8996A8]">
            <span>Activity</span>
            <span>•</span>
            <span>Alerts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
            Notifications
          </h1>
        </div>

        {notifs.some((n) => !n.isRead) && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} className="text-xs">
            <Check size={14} className="mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2.5 text-xs">
        {notifs.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#111A27] border border-white/[0.08] text-center text-[#8996A8]">
            No notifications in your inbox.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkOne(n.id)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-[#16202E] border-[#3B82F6]/30'
                  : 'bg-[#111A27] border-white/[0.06] opacity-75'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white text-xs">{n.title}</h4>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  )}
                </div>
                <p className="text-[#CBD5E1] text-xs leading-relaxed">{n.message}</p>
                <span className="text-[11px] text-[#8996A8] block pt-0.5">
                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {n.linkUrl && (
                <Link to={n.linkUrl} className="shrink-0">
                  <Button variant="secondary" size="sm" className="text-[11px] px-2.5 py-1">
                    View
                  </Button>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

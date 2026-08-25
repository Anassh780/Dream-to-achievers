import { AppNotification } from '@/types';
import { storage } from './storage';

export const notificationService = {
  getUserNotifications(userId: string): AppNotification[] {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    return notifs
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount(userId: string): number {
    return this.getUserNotifications(userId).filter((n) => !n.isRead).length;
  },

  markAsRead(notificationId: string): void {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const index = notifs.findIndex((n) => n.id === notificationId);
    if (index >= 0) {
      notifs[index].isRead = true;
      storage.set('NOTIFICATIONS', notifs);
    }
  },

  markAllAsRead(userId: string): void {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
    storage.set('NOTIFICATIONS', updated);
  },
};

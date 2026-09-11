import { AppNotification } from '@/types';
import { storage } from './storage';
import { webNotificationService } from './webNotificationService';
import { cloudSyncService } from './cloudSyncService';

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

  createNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): AppNotification {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    notifs.unshift(newNotif);
    storage.set('NOTIFICATIONS', notifs);
    cloudSyncService.syncNotificationToCloud(newNotif).catch((error) => {
      console.error('Failed to save notification to Firebase:', error);
    });

    // Dispatch Web Push notification to user device
    webNotificationService.sendLocalNotification(
      newNotif.title,
      newNotif.message,
      newNotif.link || '/dashboard/notifications'
    );

    return newNotif;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const index = notifs.findIndex((n) => n.id === notificationId);
    if (index >= 0) {
      notifs[index].isRead = true;
      await cloudSyncService.syncNotificationToCloud(notifs[index]);
      storage.set('NOTIFICATIONS', notifs);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
    const changed = updated.filter((notification, index) => notification.isRead && !notifs[index]?.isRead);
    await Promise.all(changed.map((notification) => cloudSyncService.syncNotificationToCloud(notification)));
    storage.set('NOTIFICATIONS', updated);
  },
};

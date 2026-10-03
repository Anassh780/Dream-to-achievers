import { AppNotification, NotificationType, User } from '@/types';
import { storage } from './storage';
import { webNotificationService } from './webNotificationService';
import { db, rtdb } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ref, set, get, child, update, remove } from 'firebase/database';

export const notificationService = {
  /**
   * Retrieves all notifications for a specific user from local cache,
   * sorted latest first.
   */
  getUserNotifications(userId: string): AppNotification[] {
    if (!userId) return [];
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    return notifs
      .filter((n) => n && (n.userId === userId || n.userId === 'all'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Retrieves the count of unread notifications for a specific user.
   */
  getUnreadCount(userId: string): number {
    if (!userId) return 0;
    return this.getUserNotifications(userId).filter((n) => !n.isRead).length;
  },

  /**
   * Universal notification creation & dispatch engine.
   * Multi-target persistence:
   * 1. Local storage & memory cache (if recipient or admin)
   * 2. Cloud Firestore root (`notifications/${id}`)
   * 3. Cloud Firestore user subcollection (`users/${userId}/notifications/${id}`)
   * 4. Realtime Database global (`notifications/${id}`)
   * 5. Realtime Database user (`user_notifications/${userId}/${id}`)
   * 6. Web Push notification to device (if recipient is active)
   * 7. Cross-tab & badge update broadcasting
   */
  createNotification(notif: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    linkUrl?: string;
    link?: string;
    id?: string;
  }): AppNotification {
    const targetLink = notif.linkUrl || notif.link || '/dashboard/notifications';
    const newNotif: AppNotification = {
      id: notif.id || `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      userId: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      isRead: false,
      link: targetLink,
      linkUrl: targetLink,
      createdAt: new Date().toISOString(),
    };

    // 1. Check current logged-in user
    const currentUserId = storage.get<string | null>('CURRENT_USER_ID', null);
    const currentUserData = storage.get<User | null>('CURRENT_USER_DATA', null);
    const isAdmin =
      currentUserData?.role === 'admin' ||
      currentUserData?.role === 'superadmin' ||
      currentUserData?.email === 'ghhhbbbhjn3@gmail.com';

    // Update local cache if recipient is current user or admin
    if (currentUserId === notif.userId || isAdmin) {
      const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
      const existsIdx = notifs.findIndex((n) => n.id === newNotif.id);
      if (existsIdx >= 0) {
        notifs[existsIdx] = newNotif;
      } else {
        notifs.unshift(newNotif);
      }
      storage.set('NOTIFICATIONS', notifs);
      storage.broadcastBadgeUpdate();

      // Trigger Web Push notification if recipient is current user
      if (currentUserId === notif.userId) {
        webNotificationService.sendLocalNotification(
          newNotif.title,
          newNotif.message,
          newNotif.linkUrl || '/dashboard/notifications'
        );
      }
    }

    // 2. Persist to Cloud Firestore (Global + User Subcollection)
    try {
      setDoc(doc(db, 'notifications', newNotif.id), newNotif, { merge: true }).catch((err: any) => {
        console.warn('[Firestore] Global notification save warning:', err);
      });
      if (newNotif.userId) {
        setDoc(doc(db, `users/${newNotif.userId}/notifications`, newNotif.id), newNotif, { merge: true }).catch((err: any) => {
          console.warn('[Firestore] User subcollection notification save warning:', err);
        });
      }
    } catch (fsErr: any) {
      console.warn('[Firestore] notification dispatch exception:', fsErr);
    }

    // 3. Persist to Realtime Database (Global + User Subnode)
    try {
      set(ref(rtdb, `notifications/${newNotif.id}`), newNotif).catch((err: any) => {
        console.warn('[RTDB] Global notification save warning:', err);
      });
      if (newNotif.userId) {
        set(ref(rtdb, `user_notifications/${newNotif.userId}/${newNotif.id}`), newNotif).catch((err: any) => {
          console.warn('[RTDB] User subnode notification save warning:', err);
        });
      }
    } catch (rtdbErr: any) {
      console.warn('[RTDB] notification dispatch exception:', rtdbErr);
    }

    return newNotif;
  },

  /**
   * Force syncs user notifications from Cloud Firestore & RTDB into local cache.
   * Merges seamlessly without losing existing items.
   */
  async syncUserNotificationsFromCloud(userId: string): Promise<AppNotification[]> {
    if (!userId) return [];
    const localNotifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const mergedMap = new Map<string, AppNotification>();

    // Seed with existing local items
    localNotifs.forEach((n) => {
      if (n && n.id) mergedMap.set(n.id, n);
    });

    // 1. Fetch from Firestore global notifications (where userId == userId)
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      snap.forEach((docSnap: any) => {
        const data = docSnap.data() as AppNotification;
        if (data && data.id) {
          mergedMap.set(data.id, {
            ...data,
            linkUrl: data.linkUrl || data.link || '/dashboard/notifications',
          });
        }
      });
    } catch (fsErr: any) {
      console.warn('[Firestore] syncUserNotifications query warning:', fsErr);
    }

    // 2. Fetch from Firestore user subcollection (users/{userId}/notifications)
    try {
      const subSnap = await getDocs(collection(db, `users/${userId}/notifications`));
      subSnap.forEach((docSnap: any) => {
        const data = docSnap.data() as AppNotification;
        if (data && data.id) {
          mergedMap.set(data.id, {
            ...data,
            linkUrl: data.linkUrl || data.link || '/dashboard/notifications',
          });
        }
      });
    } catch (subErr: any) {
      console.warn('[Firestore] user subcollection notification fetch warning:', subErr);
    }

    // 3. Fetch from RTDB user_notifications/{userId}
    try {
      const rtdbSnap = await get(child(ref(rtdb), `user_notifications/${userId}`));
      if (rtdbSnap.exists()) {
        const val = rtdbSnap.val();
        if (val && typeof val === 'object') {
          Object.values(val).forEach((item: any) => {
            if (item && item.id) {
              mergedMap.set(item.id, {
                ...item,
                linkUrl: item.linkUrl || item.link || '/dashboard/notifications',
              });
            }
          });
        }
      }
    } catch (rtdbErr) {
      console.warn('[RTDB] syncUserNotifications fetch warning:', rtdbErr);
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    storage.set('NOTIFICATIONS', merged);
    return merged.filter((n) => n.userId === userId);
  },

  /**
   * Marks a notification as read locally, in Firestore, and in RTDB.
   */
  async markAsRead(notificationId: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const index = notifs.findIndex((n) => n.id === notificationId);
    let targetNotif: AppNotification | null = null;

    if (index >= 0) {
      notifs[index].isRead = true;
      targetNotif = notifs[index];
      storage.set('NOTIFICATIONS', notifs);
      storage.broadcastBadgeUpdate();
    }

    // Update in Firestore
    try {
      await setDoc(doc(db, 'notifications', notificationId), { isRead: true }, { merge: true });
      if (targetNotif?.userId) {
        await setDoc(doc(db, `users/${targetNotif.userId}/notifications`, notificationId), { isRead: true }, { merge: true });
      }
    } catch (err) {
      console.warn('[Firestore] markAsRead sync warning:', err);
    }

    // Update in RTDB
    try {
      await update(ref(rtdb, `notifications/${notificationId}`), { isRead: true });
      if (targetNotif?.userId) {
        await update(ref(rtdb, `user_notifications/${targetNotif.userId}/${notificationId}`), { isRead: true });
      }
    } catch (rtdbErr) {
      console.warn('[RTDB] markAsRead sync warning:', rtdbErr);
    }
  },

  /**
   * Marks a notification as unread locally, in Firestore, and in RTDB.
   */
  async markAsUnread(notificationId: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const index = notifs.findIndex((n) => n.id === notificationId);
    let targetNotif: AppNotification | null = null;

    if (index >= 0) {
      notifs[index].isRead = false;
      targetNotif = notifs[index];
      storage.set('NOTIFICATIONS', notifs);
      storage.broadcastBadgeUpdate();
    }

    // Update in Firestore
    try {
      await setDoc(doc(db, 'notifications', notificationId), { isRead: false }, { merge: true });
      if (targetNotif?.userId) {
        await setDoc(doc(db, `users/${targetNotif.userId}/notifications`, notificationId), { isRead: false }, { merge: true });
      }
    } catch (err) {
      console.warn('[Firestore] markAsUnread sync warning:', err);
    }

    // Update in RTDB
    try {
      await update(ref(rtdb, `notifications/${notificationId}`), { isRead: false });
      if (targetNotif?.userId) {
        await update(ref(rtdb, `user_notifications/${targetNotif.userId}/${notificationId}`), { isRead: false });
      }
    } catch (rtdbErr) {
      console.warn('[RTDB] markAsUnread sync warning:', rtdbErr);
    }
  },

  /**
   * Permanently deletes a single notification across local storage, Firestore, and RTDB.
   */
  async deleteNotification(notificationId: string, userId?: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const target = notifs.find((n) => n.id === notificationId);
    const targetUserId = userId || target?.userId;
    const remaining = notifs.filter((n) => n.id !== notificationId);
    storage.set('NOTIFICATIONS', remaining);
    storage.broadcastBadgeUpdate();

    // Delete in Firestore
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      if (targetUserId) {
        await deleteDoc(doc(db, `users/${targetUserId}/notifications`, notificationId));
      }
    } catch (err) {
      console.warn('[Firestore] deleteNotification warning:', err);
    }

    // Delete in RTDB
    try {
      await remove(ref(rtdb, `notifications/${notificationId}`));
      if (targetUserId) {
        await remove(ref(rtdb, `user_notifications/${targetUserId}/${notificationId}`));
      }
    } catch (rtdbErr) {
      console.warn('[RTDB] deleteNotification warning:', rtdbErr);
    }
  },

  /**
   * Deletes all read notifications for a specific user across local storage, Firestore, and RTDB.
   */
  async deleteReadNotifications(userId: string): Promise<void> {
    if (!userId) return;
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const toDelete: string[] = [];
    const remaining = notifs.filter((n) => {
      if (n.userId === userId && n.isRead) {
        toDelete.push(n.id);
        return false;
      }
      return true;
    });

    storage.set('NOTIFICATIONS', remaining);
    storage.broadcastBadgeUpdate();

    // Delete in Firestore and RTDB in background
    Promise.all(
      toDelete.map(async (id) => {
        try {
          await deleteDoc(doc(db, 'notifications', id));
          await deleteDoc(doc(db, `users/${userId}/notifications`, id));
          await remove(ref(rtdb, `notifications/${id}`));
          await remove(ref(rtdb, `user_notifications/${userId}/${id}`));
        } catch {}
      })
    ).catch(() => {});
  },

  /**
   * Marks all notifications for a specific user as read across local, Firestore, and RTDB.
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const changedIds: string[] = [];

    const updated = notifs.map((n) => {
      if (n.userId === userId && !n.isRead) {
        changedIds.push(n.id);
        return { ...n, isRead: true };
      }
      return n;
    });

    storage.set('NOTIFICATIONS', updated);
    storage.broadcastBadgeUpdate();

    // Sync changed notifications in background
    Promise.all(
      changedIds.map(async (id) => {
        try {
          await setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true });
          await setDoc(doc(db, `users/${userId}/notifications`, id), { isRead: true }, { merge: true });
          await update(ref(rtdb, `notifications/${id}`), { isRead: true });
          await update(ref(rtdb, `user_notifications/${userId}/${id}`), { isRead: true });
        } catch {}
      })
    ).catch(() => {});
  },

  /**
   * Dispatches a broadcast notification to all platform administrators.
   */
  async notifyAdmins(payload: {
    title: string;
    message: string;
    linkUrl?: string;
    type?: NotificationType;
  }): Promise<void> {
    const localUsers = storage.get<User[]>('USERS', []);
    const adminIds = new Set<string>();

    // Known master administrator IDs
    adminIds.add('oi8O5XbNHZOtnXaV10BRXdOATgi2');
    adminIds.add('PN9MiF9b8ZP54utzL8fgDu1XU072');

    // Add current session user if admin
    const currentUserId = storage.get<string | null>('CURRENT_USER_ID', null);
    const currentUserData = storage.get<User | null>('CURRENT_USER_DATA', null);
    if (currentUserData?.role === 'admin' || currentUserData?.role === 'superadmin' || currentUserData?.email === 'ghhhbbbhjn3@gmail.com') {
      if (currentUserId) adminIds.add(currentUserId);
    }

    // Add local admins
    localUsers.forEach((u) => {
      if (u.role === 'admin' || u.role === 'superadmin' || u.email === 'ghhhbbbhjn3@gmail.com') {
        if (u.id) adminIds.add(u.id);
      }
    });

    for (const adminId of adminIds) {
      this.createNotification({
        userId: adminId,
        type: payload.type || 'system_announcement',
        title: payload.title,
        message: payload.message,
        linkUrl: payload.linkUrl || '/admin',
      });
    }
  },
};

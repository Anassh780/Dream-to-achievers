import { AppNotification, NotificationType, User } from '@/types';
import { storage } from './storage';
import { webNotificationService } from './webNotificationService';
import { db, rtdb } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { ref, set, get, child, update, remove } from 'firebase/database';

const READ_IDS_KEY = 'dta_read_notif_ids';

export function getReadNotificationIds(): Set<string> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(READ_IDS_KEY) : null;
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

export function recordNotificationAsRead(id: string): void {
  try {
    const set = getReadNotificationIds();
    set.add(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function recordAllNotificationsAsRead(ids: string[]): void {
  try {
    const set = getReadNotificationIds();
    ids.forEach((id) => set.add(id));
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function recordNotificationAsUnread(id: string): void {
  try {
    const set = getReadNotificationIds();
    set.delete(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function removeDeletedNotificationId(id: string): void {
  try {
    const set = getReadNotificationIds();
    set.delete(id);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export const notificationService = {
  /**
   * Retrieves all notifications for a specific user from local cache,
   * sorted latest first, strictly respecting the persistent read registry.
   */
  getUserNotifications(userId: string): AppNotification[] {
    if (!userId) return [];
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const readIds = getReadNotificationIds();
    return notifs
      .filter((n) => n && (n.userId === userId || n.userId === 'all'))
      .map((n) => {
        if (readIds.has(n.id)) {
          return { ...n, isRead: true };
        }
        return n;
      })
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
   * Strictly respects the persistent read registry so that read items NEVER revert to unread.
   */
  async syncUserNotificationsFromCloud(userId: string): Promise<AppNotification[]> {
    if (!userId) return [];
    const localNotifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const readIds = getReadNotificationIds();
    const mergedMap = new Map<string, AppNotification>();

    // Seed with existing local items, applying readIds enforcement
    localNotifs.forEach((n) => {
      if (n && n.id) {
        mergedMap.set(n.id, {
          ...n,
          isRead: readIds.has(n.id) || n.isRead === true,
        });
      }
    });

    const mergeDoc = (data: AppNotification) => {
      if (!data || !data.id) return;
      const existing = mergedMap.get(data.id);
      // Once read locally or registered in readIds, a notification NEVER reverts to unread!
      const isAlreadyRead = readIds.has(data.id) || existing?.isRead === true || data.isRead === true;
      mergedMap.set(data.id, {
        ...data,
        isRead: isAlreadyRead,
        linkUrl: data.linkUrl || data.link || '/dashboard/notifications',
      });
      if (isAlreadyRead && !data.isRead) {
        recordNotificationAsRead(data.id);
      }
    };

    // 1. Fetch from Firestore global notifications (where userId == userId)
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snap = await getDocs(q);
      snap.forEach((docSnap: any) => {
        mergeDoc(docSnap.data() as AppNotification);
      });
    } catch (fsErr: any) {
      console.warn('[Firestore] syncUserNotifications global query warning:', fsErr);
    }

    // 2. Fetch from Firestore user subcollection (users/{userId}/notifications)
    try {
      const subSnap = await getDocs(collection(db, `users/${userId}/notifications`));
      subSnap.forEach((docSnap: any) => {
        mergeDoc(docSnap.data() as AppNotification);
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
            mergeDoc(item as AppNotification);
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
    return merged.filter((n) => n && (n.userId === userId || n.userId === 'all'));
  },

  /**
   * Marks a notification as read locally, in Firestore, and in RTDB.
   */
  async markAsRead(notificationId: string): Promise<void> {
    recordNotificationAsRead(notificationId);

    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const index = notifs.findIndex((n) => n.id === notificationId);
    let targetNotif: AppNotification | null = null;

    if (index >= 0) {
      notifs[index].isRead = true;
      targetNotif = notifs[index];
    }
    storage.set('NOTIFICATIONS', notifs);
    storage.broadcastBadgeUpdate();

    const userId = targetNotif?.userId;

    // Independent async cloud syncs so one network hiccup doesn't abort others
    // 1. Root Firestore
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch {
      try {
        await setDoc(doc(db, 'notifications', notificationId), { isRead: true }, { merge: true });
      } catch (e) {
        console.warn('[Firestore] markAsRead root sync warning:', e);
      }
    }

    // 2. User Subcollection Firestore
    if (userId) {
      try {
        await updateDoc(doc(db, `users/${userId}/notifications`, notificationId), { isRead: true });
      } catch {
        try {
          await setDoc(doc(db, `users/${userId}/notifications`, notificationId), { isRead: true }, { merge: true });
        } catch (e) {
          console.warn('[Firestore] markAsRead user subcollection sync warning:', e);
        }
      }
    }

    // 3. Root RTDB
    try {
      await update(ref(rtdb, `notifications/${notificationId}`), { isRead: true });
    } catch (rtdbErr) {
      console.warn('[RTDB] markAsRead root sync warning:', rtdbErr);
    }

    // 4. User RTDB
    if (userId) {
      try {
        await update(ref(rtdb, `user_notifications/${userId}/${notificationId}`), { isRead: true });
      } catch (rtdbErr) {
        console.warn('[RTDB] markAsRead user subnode sync warning:', rtdbErr);
      }
    }
  },

  /**
   * Marks a notification as unread locally, in Firestore, and in RTDB.
   */
  async markAsUnread(notificationId: string): Promise<void> {
    recordNotificationAsUnread(notificationId);

    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const index = notifs.findIndex((n) => n.id === notificationId);
    let targetNotif: AppNotification | null = null;

    if (index >= 0) {
      notifs[index].isRead = false;
      targetNotif = notifs[index];
    }
    storage.set('NOTIFICATIONS', notifs);
    storage.broadcastBadgeUpdate();

    const userId = targetNotif?.userId;

    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: false });
    } catch {
      try {
        await setDoc(doc(db, 'notifications', notificationId), { isRead: false }, { merge: true });
      } catch (err) {
        console.warn('[Firestore] markAsUnread sync warning:', err);
      }
    }

    if (userId) {
      try {
        await updateDoc(doc(db, `users/${userId}/notifications`, notificationId), { isRead: false });
      } catch {
        try {
          await setDoc(doc(db, `users/${userId}/notifications`, notificationId), { isRead: false }, { merge: true });
        } catch (err) {
          console.warn('[Firestore] markAsUnread subcollection sync warning:', err);
        }
      }
    }

    try {
      await update(ref(rtdb, `notifications/${notificationId}`), { isRead: false });
    } catch (rtdbErr) {
      console.warn('[RTDB] markAsUnread root sync warning:', rtdbErr);
    }

    if (userId) {
      try {
        await update(ref(rtdb, `user_notifications/${userId}/${notificationId}`), { isRead: false });
      } catch (rtdbErr) {
        console.warn('[RTDB] markAsUnread user subnode sync warning:', rtdbErr);
      }
    }
  },

  /**
   * Permanently deletes a single notification across local storage, Firestore, and RTDB.
   */
  async deleteNotification(notificationId: string, userId?: string): Promise<void> {
    removeDeletedNotificationId(notificationId);

    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const target = notifs.find((n) => n.id === notificationId);
    const targetUserId = userId || target?.userId;
    const remaining = notifs.filter((n) => n.id !== notificationId);
    storage.set('NOTIFICATIONS', remaining);
    storage.broadcastBadgeUpdate();

    // Delete in Firestore
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (err) {
      console.warn('[Firestore] deleteNotification root warning:', err);
    }

    if (targetUserId) {
      try {
        await deleteDoc(doc(db, `users/${targetUserId}/notifications`, notificationId));
      } catch (err) {
        console.warn('[Firestore] deleteNotification user subcollection warning:', err);
      }
    }

    // Delete in RTDB
    try {
      await remove(ref(rtdb, `notifications/${notificationId}`));
    } catch (rtdbErr) {
      console.warn('[RTDB] deleteNotification root warning:', rtdbErr);
    }

    if (targetUserId) {
      try {
        await remove(ref(rtdb, `user_notifications/${targetUserId}/${notificationId}`));
      } catch (rtdbErr) {
        console.warn('[RTDB] deleteNotification user subnode warning:', rtdbErr);
      }
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
      if ((n.userId === userId || n.userId === 'all') && n.isRead) {
        toDelete.push(n.id);
        removeDeletedNotificationId(n.id);
        return false;
      }
      return true;
    });

    storage.set('NOTIFICATIONS', remaining);
    storage.broadcastBadgeUpdate();

    // Delete in Firestore and RTDB in background
    toDelete.forEach(async (id) => {
      try {
        await deleteDoc(doc(db, 'notifications', id));
      } catch {}
      try {
        await deleteDoc(doc(db, `users/${userId}/notifications`, id));
      } catch {}
      try {
        await remove(ref(rtdb, `notifications/${id}`));
      } catch {}
      try {
        await remove(ref(rtdb, `user_notifications/${userId}/${id}`));
      } catch {}
    });
  },

  /**
   * Marks all notifications for a specific user as read across local, Firestore, and RTDB.
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notifs = storage.get<AppNotification[]>('NOTIFICATIONS', []);
    const changedIds: string[] = [];

    const updated = notifs.map((n) => {
      if ((n.userId === userId || n.userId === 'all' || n.userId === 'admin') && !n.isRead) {
        changedIds.push(n.id);
        return { ...n, isRead: true };
      }
      return n;
    });

    recordAllNotificationsAsRead(changedIds);
    storage.set('NOTIFICATIONS', updated);
    storage.broadcastBadgeUpdate();

    // Sync changed notifications in background with independent operations
    changedIds.forEach(async (id) => {
      // 1. Root Firestore
      try {
        await updateDoc(doc(db, 'notifications', id), { isRead: true });
      } catch {
        try {
          await setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true });
        } catch {}
      }

      // 2. User Subcollection Firestore
      try {
        await updateDoc(doc(db, `users/${userId}/notifications`, id), { isRead: true });
      } catch {
        try {
          await setDoc(doc(db, `users/${userId}/notifications`, id), { isRead: true }, { merge: true });
        } catch {}
      }

      // 3. RTDB Root
      try {
        await update(ref(rtdb, `notifications/${id}`), { isRead: true });
      } catch {}

      // 4. RTDB User
      try {
        await update(ref(rtdb, `user_notifications/${userId}/${id}`), { isRead: true });
      } catch {}
    });
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

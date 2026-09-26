// Web Push & Background Desktop / Mobile Notification Service

class WebNotificationService {
  private isSupported: boolean;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    if (typeof window !== 'undefined') {
      this.initServiceWorker();
    }
  }

  private async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        console.warn('[WebNotification] Service Worker registration failed:', err);
      }
    }
  }

  public isNotificationSupported(): boolean {
    return this.isSupported;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  public isPermissionGranted(): boolean {
    return this.isSupported && Notification.permission === 'granted';
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.sendLocalNotification(
          'Notifications Activated! ??',
          'You will now receive real-time order verifications, bonus alerts, and team updates.',
          '/dashboard/notifications'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[WebNotification] Permission request error:', err);
      return false;
    }
  }

  public async showNotification(options: { title: string; body: string; tag?: string; url?: string }) {
    return this.sendLocalNotification(options.title, options.body, options.url || '/dashboard/notifications');
  }

  public async sendLocalNotification(title: string, body: string, url: string = '/dashboard/notifications') {
    if (!this.isPermissionGranted()) return;

    try {
      if (this.swRegistration && 'showNotification' in this.swRegistration) {
        const swOptions: NotificationOptions & { vibrate?: number[]; data?: { url: string } } = {
          body,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-48x48.png',
          tag: `dta-${Date.now()}`,
          vibrate: [200, 100, 200],
          data: { url },
        };
        await this.swRegistration.showNotification(title, swOptions as NotificationOptions);
      } else {
        const notif = new Notification(title, {
          body,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-48x48.png',
        });
        notif.onclick = () => {
          window.focus();
          window.location.href = url;
          notif.close();
        };
      }
    } catch (err) {
      console.warn('[WebNotification] Notification send failed:', err);
    }
  }
}

export const webNotificationService = new WebNotificationService();

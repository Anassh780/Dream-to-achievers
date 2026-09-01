// Service Worker for Dream to Achievers Background Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Dream to Achievers';
    const options = {
      body: data.body || 'You have a new update in your partner hub.',
      icon: data.icon || '/android-chrome-192x192.png',
      badge: '/favicon-48x48.png',
      tag: data.tag || 'dta-notification',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/dashboard/notifications',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const title = 'Dream to Achievers';
    const options = {
      body: event.data.text() || 'New platform update available.',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-48x48.png',
      data: { url: '/dashboard/notifications' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

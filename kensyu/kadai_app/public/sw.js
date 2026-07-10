/* global self */

// Minimal service worker for Push API.
self.addEventListener('push', (event) => {
  try {
    const payload = event.data ? event.data.json() : {};
    const title = payload.title || '通知';
    const body = payload.body || '';

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        // Keep silent otherwise; customize as needed.
      })
    );
  } catch (e) {
    // Fallback to non-parsed body
    event.waitUntil(
      self.registration.showNotification('通知', {
        body: event.data ? String(event.data.text ? event.data.text() : '') : '',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length) {
        return clientList[0].focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
      return undefined;
    })
  );
});


const NOTIFY_TIMES = [9, 14, 20]; // 9 AM, 2 PM, 8 PM

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('periodicsync', e => {
  if (e.tag === 'shift-reminder') {
    e.waitUntil(checkAndNotify());
  }
});

self.addEventListener('push', e => {
  e.waitUntil(checkAndNotify());
});

async function checkAndNotify() {
  const now = new Date();
  const hour = now.getHours();

  if (!NOTIFY_TIMES.includes(hour)) return;

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');

  const allClients = await clients.matchAll({ type: 'window' });

  for (const client of allClients) {
    client.postMessage({ type: 'CHECK_TODAY', date: `${y}-${m}-${d}` });
    return;
  }

  await self.registration.showNotification('My Shifts 📅', {
    body: 'Do you have a shift today? Open the app and log it!',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'shift-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Later' }
    ]
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();

  if (e.action === 'dismiss') return;

  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      if (cs.length) return cs[0].focus();
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'TODAY_NOT_LOGGED') {

    const msgs = [
      'Don\'t forget to log today\'s shift! 📅',
      'Log today\'s shift to keep your salary accurate 💰',
      'Reminder: today\'s shift is still not logged ⏰',
      'Keep your schedule updated by logging today\'s shift 📝',
      'Your work tracker is waiting for today\'s shift 👀'
    ];

    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    self.registration.showNotification('My Shifts', {
      body: msg,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'shift-reminder',
      renotify: true,
      actions: [
        { action: 'open', title: '📝 Log Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }
});

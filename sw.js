// CoTecha Service Worker v2.0
const CACHE = 'cotecha-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// ─── PUSH RECIBIDO ───
self.addEventListener('push', e => {
  let data = { title: '🔔 CoTecha', body: 'Nueva alerta', tipo: 'aviso' };
  try { if (e.data) data = { ...data, ...e.data.json() }; }
  catch(err) { if (e.data) data.body = e.data.text(); }

  const options = {
    body: data.body,
    icon: 'https://cotecha.github.io/app/icon-192.png',
    badge: 'https://cotecha.github.io/app/icon-96.png',
    tag: 'cotecha-alerta-' + (data.id || Date.now()),
    renotify: true,
    requireInteraction: data.tipo === 'urgente',
    vibrate: data.tipo === 'urgente' ? [200,100,200,100,200] : [200],
    data: { url: data.url || 'https://cotecha.github.io/alertas' },
    actions: [
      { action: 'ver', title: 'Ver alerta' },
      { action: 'cerrar', title: 'Cerrar' }
    ]
  };

  e.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── CLICK EN NOTIFICACIÓN ───
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'cerrar') return;
  const url = e.notification.data?.url || 'https://cotecha.github.io/alertas';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wClients => {
      for (const c of wClients) {
        if (c.url.includes('cotecha.github.io') && 'focus' in c) {
          c.navigate(url); return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

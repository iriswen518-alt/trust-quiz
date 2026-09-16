const VER = '20260916-132017';
const CACHE = 'tq-' + VER;
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const ks = await caches.keys();
  await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;                                  // 進度上傳(POST)不攔
  if (new URL(r.url).origin !== location.origin) return;           // 雲端同步 API 不攔
  e.respondWith((async () => {
    try {
      const net = await fetch(r, { cache: 'no-store' });
      const c = await caches.open(CACHE); c.put(r, net.clone());
      return net;
    } catch (err) {
      const hit = await caches.match(r);
      if (hit) return hit;
      throw err;
    }
  })());
});

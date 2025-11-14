const CACHE_NAME = 'storezone-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const req = evt.request;

  // image: cache-first
  if (req.destination === 'image') {
    evt.respondWith(
      caches.match(req).then(resp => resp || fetch(req).then(net => {
        caches.open(CACHE_NAME).then(c => c.put(req, net.clone()));
        return net;
      })).catch(()=>caches.match('/icons/icon-192.png'))
    );
    return;
  }

  // navigation: network-first, fallback to cache
  if (req.mode === 'navigate') {
    evt.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
        return res;
      }).catch(()=>caches.match(req).then(r => r || caches.match('/')))
    );
    return;
  }

  // default: try network, fallback to cache
  evt.respondWith(fetch(req).catch(()=>caches.match(req)));
});

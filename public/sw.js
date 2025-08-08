// sw.js
const CACHE_NAME = 'ashish-property-v2';
const ASSET_URLS = [
  '/',                 // SPA entry
  '/manifest.json',
  '/favicon.ico',
  // add your built asset paths if they’re fixed, e.g.:
  // '/static/js/bundle.js',
  // '/static/css/main.css',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSET_URLS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Never intercept cross-origin requests (lets CORS work normally)
  if (url.origin !== self.location.origin) return;

  // 2) Only cache GET requests; let POST/PUT/PATCH/DELETE/OPTIONS go to network
  if (req.method !== 'GET') return;

  // 3) For navigation requests (HTML): network-first, fallback to cache
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put('/', fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cached = await caches.match('/');
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // 4) For same-origin assets: cache-first, then network
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        // Only cache OK, same-origin, basic responses
        if (res.ok && res.type === 'basic') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone()).catch(() => {});
        }
        return res;
      } catch {
        // Optional: return nothing or a fallback response
        return new Response('', { status: 504 });
      }
    })()
  );
});

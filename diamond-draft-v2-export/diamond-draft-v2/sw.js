/* ============================================================================
   DIAMOND DRAFT V2 — OFFLINE-FIRST SERVICE WORKER
   Bump CACHE_NAME on every Cloudflare Pages release to refresh installed PWAs.
   ============================================================================ */
const CACHE_NAME = 'diamond-draft-v2.0.1';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './data/franchises.js',
  './data/historical-db.js',
  './data/named-synergies.js',
  './data/seed-historical-players.js',
  './engine/game-engine.js',
  './assets/ballpark.jpg',
  './assets/logo-full.png',
  './assets/logo-mark.png',
  './assets/favicon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-512-maskable.png',
  './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('diamond-draft-') && k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Network-first for optional large compiled Lahman JSON (cached in IndexedDB)
  if (url.pathname.endsWith('historical-players.json')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Stale-while-revalidate for Google Fonts
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(req).then(cached => {
          const fetched = fetch(req).then(res => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Cache-first for all local app shell & Seed Vault assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   Spudlicious Service Worker
   Strategy:
     • HTML (navigations)  → network-first, fall back to cached shell (offline).
     • Images / media       → stale-while-revalidate (fast + self-healing).
     • Fonts / static       → cache-first.
   Bump CACHE_VERSION on every deploy to invalidate old caches cleanly.
   ══════════════════════════════════════════════════════════════════════════ */
const CACHE_VERSION = 'spud-v9';
const SHELL_CACHE   = `${CACHE_VERSION}-shell`;
const ASSET_CACHE   = `${CACHE_VERSION}-assets`;

/* Minimal shell precache — the app is a single HTML file. */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/web/spudlicious-logo-web.webp',
  './assets/web/mascot-web.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {/* tolerate a missing optional asset */}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  /* Never cache cross-origin third parties (maps, WhatsApp, analytics, fonts CDN handles its own). */
  const sameOrigin = url.origin === self.location.origin;

  /* HTML navigations → network-first with offline shell fallback. */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (sameOrigin) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  /* Cross-origin (fonts CDNs, maps, etc.) → never intercept. The browser's own
     HTTP cache handles fonts (long max-age); offline falls back to system fonts
     via font-display:swap. SW interception of CORS font binaries caused
     ERR_FAILED races — do not reintroduce it. */
  if (!sameOrigin) return;

  const dest = req.destination;

  /* Images / video / audio → stale-while-revalidate. */
  if (dest === 'image' || dest === 'video' || dest === 'audio') {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req)
            .then((res) => { if (res && res.status === 200) cache.put(req, res.clone()); return res; })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  /* Everything else same-origin (css/js/json/fonts) → cache-first, then network. */
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(ASSET_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});

/* Allow the page to trigger an immediate update. */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

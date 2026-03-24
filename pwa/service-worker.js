// ========================================
// ZEAL Cultural Festival - Service Worker
// ========================================

const CACHE_NAME = 'zeal-v1.0.0';
const STATIC_ASSETS = [
  'index.html',
  'events.html',
  'team.html',
  'sponsors.html',
  'announcements.html',
  'css/style.css',
  'css/animations.css',
  'css/cursor.css',
  'css/responsive.css',
  'js/main.js',
  'js/loader.js',
  'js/cursor.js',
  'js/particles.js',
  'js/animations.js',
  'js/events-filter.js',
  'js/pwa.js',
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for dynamic
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CDN resources: network first with cache fallback
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Local assets: cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'registration-sync') {
    event.waitUntil(syncRegistrations());
  }
});

async function syncRegistrations() {
  // Placeholder for registration sync logic
  console.log('Syncing registrations...');
}

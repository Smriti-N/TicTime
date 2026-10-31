const CACHE_NAME = 'tictime-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  'index.html',
  './css/styles.css',
  './js/game.js',
  './js/ui.js',
  './js/main.js',
  './manifest.json',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW] Pre-cache skipped for asset:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      // 1. Try matching cached response
      const cachedResponse = await caches.match(event.request, { ignoreSearch: true });

      // 2. Background revalidation promise
      const fetchPromise = fetch(event.request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline and navigating to a page, serve cached index.html
          if (event.request.mode === 'navigate') {
            return (await caches.match('./index.html')) || (await caches.match('index.html')) || (await caches.match('./'));
          }
        });

      // 3. Return cache immediately if available, otherwise await network
      if (cachedResponse) {
        // Run network update in background
        event.waitUntil(fetchPromise);
        return cachedResponse;
      }

      const networkResult = await fetchPromise;
      if (networkResult) {
        return networkResult;
      }

      // Offline fallback for navigation requests
      if (event.request.mode === 'navigate') {
        const fallback = (await caches.match('./index.html')) || (await caches.match('index.html')) || (await caches.match('./'));
        if (fallback) return fallback;
      }

      return new Response('Offline: resource not available in cache.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain' })
      });
    })()
  );
});

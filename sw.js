const CACHE_PREFIX = 'tictime-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_FILES = [
  './index.html', './css/styles.css', './js/game.js', './js/ui.js', './js/main.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.href.startsWith(self.registration.scope)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try {
        return await fetch(request);
      } catch (error) {
        const page = await cache.match('./index.html');
        if (page) return page;
        throw error;
      }
    }
    const cached = await cache.match(request, { ignoreSearch: true });
    return cached || fetch(request);
  })());
});

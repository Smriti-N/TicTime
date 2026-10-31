// Service worker: keeps a copy of the game so it loads and plays with no network.
// Registered from js/main.js. Only runs when the page is served over http(s).

// Bump the version when you add, rename or remove a file in APP_FILES.
const APP_CACHE = 'tictime-app-v1';
const FONT_CACHE = 'tictime-fonts';

const APP_FILES = [
  './',
  'index.html',
  'css/styles.css',
  'js/game.js',
  'js/ui.js',
  'js/main.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// Download every game file up front, skipping the browser's HTTP cache.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_FILES.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

// Delete caches left behind by older versions, then take control of open pages.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== APP_CACHE && key !== FONT_CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstThenRefresh(event));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(fontFromCacheOrNetwork(request));
  }
  // Any other request goes to the network as normal.
});

// Game files: answer from the cache right away (instant, works offline) and
// refresh the cached copy in the background so the next visit gets updates.
async function cacheFirstThenRefresh(event) {
  const { request } = event;
  const cache = await caches.open(APP_CACHE);
  const cached = await cache.match(request, { ignoreSearch: request.mode === 'navigate' });

  const refresh = fetch(request).then(async (response) => {
    if (response.status === 200) await cache.put(request, response.clone());
    return response;
  });

  if (cached) {
    event.waitUntil(refresh.catch(() => {})); // offline: keep the cached copy
    return cached;
  }
  return refresh.catch(() => Response.error());
}

// Google Fonts: the Sora font is cached the first time it loads. Offline with
// nothing cached, return an empty stylesheet so the page quietly falls back to
// the system font (see font-family in css/styles.css) instead of failing.
async function fontFromCacheOrNetwork(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request, { ignoreVary: true });
  if (cached) return cached;

  try {
    // Ask with CORS so we can see the status code and only cache good responses.
    const response = await fetch(request.url, { mode: 'cors', credentials: 'omit' });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    if (request.destination === 'style') {
      return new Response('', { headers: { 'Content-Type': 'text/css' } });
    }
    return Response.error();
  }
}

const CACHE_NAME = 'arka-v2.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.css',
  '/main.js',
  '/utils.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

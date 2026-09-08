// Progressive Web App Service Worker for Javelo360 ERP (v19 Release)
const CACHE_NAME = 'javelo360-erp-v19';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json?v=19',
  '/styles.css?v=19',
  '/app.js?v=19',
  '/vendor/react.production.min.js?v=19',
  '/vendor/react-dom.production.min.js?v=19',
  '/vendor/confetti.browser.min.js?v=19'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

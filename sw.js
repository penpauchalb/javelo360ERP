// Progressive Web App Service Worker for Javelo360 ERP (v31 Release)
const CACHE_NAME = 'javelo360-erp-v31';
const ASSETS_TO_CACHE = [
  './',
  './manifest.json?v=31',
  './styles.css?v=31',
  './app.js?v=31',
  './react.production.min.js?v=31',
  './react-dom.production.min.js?v=31',
  './confetti.browser.min.js?v=31'
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

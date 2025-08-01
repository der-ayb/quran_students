// Basic service worker for PWA offline support
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open('v1').then(async function(cache) {
      // Request persistent storage for site
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persisted storage granted: ${isPersisted}`);
      }
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/script.js',
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  console.log('Service Worker fetching: ' + event.request.url);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js"
);

workbox.setConfig({ debug: false });

// Force waiting service worker to become active
self.skipWaiting();
workbox.core.clientsClaim();

if (workbox) {
  console.log("Workbox loaded successfully");

  // Precache critical files with revisions (update revisions when files change)
  workbox.precaching.precacheAndRoute([
    { url: "/", revision: "1" },
    { url: "/favicon.ico", revision: "1" },
    { url: "/index.html", revision: "1" },
    { url: "/offline.html", revision: "1" },
    { url: "/manifest.json", revision: "1" },
    { url: "/src/style.css", revision: "1" },
    { url: "/src/script.js", revision: "1" },
    { url: "/src/auth.js", revision: "1" },
    { url: "/src/pdfmake.js", revision: "1" },
    { url: "/src/vfs_fonts.js", revision: "1" },
    { url: "/assets/default.sqlite3", revision: "1" },
    { url: "/assets/quran.sqlite", revision: "1" },
    { url: "/assets/manifest-icon-192.maskable.png", revision: "1" },
    { url: "/assets/manifest-icon-512.maskable.png", revision: "1" },
    { url: "/assets/apple-icon-180.png", revision: "1" },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/spacelab/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css",
      revision: "1",
    },
    {
      url: "https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth.css",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/2.3.2/css/dataTables.dataTables.css",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/2.3.2/css/dataTables.bootstrap5.css",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.4/css/buttons.bootstrap5.css",
      revision: "1",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css",
      revision: "1",
    },
    { url: "https://code.jquery.com/jquery-3.5.1.slim.min.js", revision: "1" },
    {
      url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.js",
      revision: "1",
    },
    {
      url: "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js",
      revision: "1",
    },
    {
      url: "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth-compat.js",
      revision: "1",
    },
    {
      url: "https://www.gstatic.com/firebasejs/ui/6.0.2/firebase-ui-auth.js",
      revision: "1",
    },
    { url: "https://cdn.datatables.net/2.3.2/js/dataTables.js", revision: "1" },
    {
      url: "https://cdn.datatables.net/2.3.2/js/dataTables.bootstrap5.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.4/js/dataTables.buttons.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.4/js/buttons.bootstrap5.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.4/js/buttons.html5.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.4/js/buttons.print.js",
      revision: "1",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/moment/min/moment.min.js",
      revision: "1",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js",
      revision: "1",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/downloadjs@1.4.7/download.min.js",
      revision: "1",
    },
    {
      url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&family=Poppins&display=swap",
      revision: "1",
    },
  ]);

  // Cache API requests
  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === location.origin +"quran_students/"||
      url.origin === 'https://code.jquery.com' ||
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://cdnjs.cloudflare.com' ||
      url.origin === 'https://www.gstatic.com' ||
      url.origin === 'https://cdn.datatables.net' ||
      url.origin === 'https://cdn.jsdelivr.net' ,
    new workbox.strategies.NetworkFirst({
      cacheName: "core-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60,
          maxEntries: 10,
        }),
      ],
    })
  );

  // Cache images
  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "image-cache",
    })
  );

  // Serve Cached Resources
  workbox.routing.registerRoute(
    ({ url }) => url.origin === self.location.origin,
    new workbox.strategies.CacheFirst({
      cacheName: "static-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 7 * 24 * 60 * 60, // Cache static resources for 7 days
        }),
      ],
    })
  );

  // Serve HTML pages with Network First and offline fallback
  // Serve HTML pages with Network First and offline fallback
  workbox.routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    async ({ event }) => {
      try {
        const response = await workbox.strategies
          .networkFirst({
            cacheName: "pages-cache",
            plugins: [
              new workbox.expiration.ExpirationPlugin({
                maxEntries: 50,
              }),
            ],
          })
          .handle({ event });
        return response || (await caches.match("/offline.html"));
      } catch (error) {
        return await caches.match("/offline.html");
      }
    }
  );
} else {
  console.log("❌ Workbox failed to load");
}

// Clean up old/unused caches during activation
self.addEventListener("activate", (event) => {
  const currentCaches = [
    workbox.core.cacheNames.precache,
    "core-cache",
    "image-cache",
    "pages-cache",
    "static-cache",
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

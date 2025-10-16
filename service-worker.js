importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js"
);

workbox.setConfig({ debug: location.hostname !== "127.0.0.1" ? false : true });
// Force waiting service worker to become active
const CACHE_NAME = "my-pwa-cache-v1";

// Precache critical files with revisions (update revisions when files change)
workbox.precaching.precacheAndRoute(
  [
    { url: "./", revision: "1" },
    { url: "./favicon.ico", revision: "1" },
    { url: "./index.html", revision: "1" },
    { url: "./offline.html", revision: "1" },
    { url: "./manifest.json", revision: "1" },

    { url: "./src/style.css", revision: "1" },
    { url: "./src/fonts.css", revision: "1" },
    { url: "./src/script.js", revision: "1" },
    { url: "./src/auth.js", revision: "1" },
    { url: "./src/pdfmake.js", revision: "1" },
    { url: "./src/vfs_fonts.js", revision: "1" },
    { url: "./src/yearpicker.css", revision: "1" },
    { url: "./src/yearpicker.js", revision: "1" },

    {
      url: "./assets/fonts/changa/2-cm9JNi2YuVOUckY5y-au8.woff2",
      revision: "1",
    },
    {
      url: "./assets/fonts/markazi/syk0-ydym6AtQaiEtX7yhqbVpHWVF1E.woff2",
      revision: "1",
    },
    {
      url: "./assets/fonts/noto-sans/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4r4xA.woff2",
      revision: "1",
    },
    {
      url: "./assets/fonts/raedex/SLXYc1bJ7HE5YDoGPuzj_dh8uc7wUy8ZQQyX2Iw1ZEzMhQ.woff2",
      revision: "1",
    },
    { url: "./assets/fonts/rubik/iJWKBXyIfDnIV7nErXyi0A.woff2", revision: "1" },

    { url: "./assets/default.sqlite3", revision: "1" },
    { url: "./assets/quran.sqlite", revision: "1" },
    { url: "./assets/manifest-icon-192.maskable.png", revision: "1" },
    { url: "./assets/manifest-icon-512.maskable.png", revision: "1" },
    { url: "./assets/apple-icon-180.png", revision: "1" },
    // bootstrap
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/spacelab/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/cerulean/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/yeti/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/flatly/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/slate/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/solar/bootstrap.rtl.min.css",
      revision: "1",
    },
    // other cdn
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
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
      revision: "1",
    },
    {
      url: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.js",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm",
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
    {
      url: "https://cdn.datatables.net/2.3.2/js/dataTables.js",
      revision: "1",
    },
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
      url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/ar-dz.min.js",
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
  ],
  {
    // Ignore URL parameters to prevent duplicate caching
    ignoreURLParametersMatching: [/.*/],
  }
);

// Cache-first for precached local and CDN files
workbox.routing.registerRoute(
  ({ url }) =>
    url.origin === location.origin ||
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.origin === "https://www.gstatic.com" ||
    url.origin === "https://cdn.datatables.net" ||
    url.origin === "https://cdn.jsdelivr.net",
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100, // Support large file list
      }),
    ],
  })
);

// Stale-while-revalidate for other CDN resources
workbox.routing.registerRoute(
  ({ url }) => url.origin !== location.origin,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "cdn-dynamic-cache",
  })
);

// Offline fallback for navigation
workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  new workbox.strategies.CacheFirst({
    cacheName: CACHE_NAME,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  })
);

// Immediate activation and client control
self.skipWaiting();
workbox.core.clientsClaim();

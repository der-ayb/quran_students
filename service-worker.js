importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js"
);

workbox.setConfig({ debug: false });

// Precache critical files with revisions (update revisions when files change)
workbox.precaching.precacheAndRoute(
  [
    { url: "./", revision: "1" },
    { url: "./favicon.ico", revision: "1" },
    { url: "./index.html", revision: "1" },
    { url: "./app.html", revision: "3" },
    { url: "./manifest.json", revision: "1" },

    { url: "./src/style.css", revision: "2" },
    { url: "./src/fonts.css", revision: "1" },
    { url: "./src/script.js", revision: "2" },
    { url: "./src/auth.js", revision: "2" },
    { url: "./src/pdfmake.js", revision: "1" },
    { url: "./src/vfs_fonts.js", revision: "1" },
    { url: "./src/yearpicker.css", revision: "1" },
    { url: "./src/yearpicker.js", revision: "1" },

    { url: "./assets/default.sqlite3", revision: "1" },
    { url: "./assets/quran.sqlite", revision: "1" },

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
    {
      url: "./assets/fonts/rubik/iJWKBXyIfDnIV7nErXyi0A.woff2",
      revision: "1",
    },

    {
      url: "./assets/images/manifest-icon-192.maskable.png",
      revision: "1",
    },
    {
      url: "./assets/images/manifest-icon-512.maskable.png",
      revision: "1",
    },
    { url: "./assets/images/apple-icon-180.png", revision: "1" },

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
      url: "https://cdn.datatables.net/2.3.4/css/dataTables.dataTables.css",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/2.3.4/css/dataTables.bootstrap5.css",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/select/3.1.3/js/dataTables.select.min.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/select/3.1.3/js/select.bootstrap5.min.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/select/3.1.3/css/select.bootstrap5.min.css",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.5/css/buttons.bootstrap5.css",
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
      url: "https://cdn.datatables.net/2.3.4/js/dataTables.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/2.3.4/js/dataTables.bootstrap5.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.5/js/dataTables.buttons.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.5/js/buttons.bootstrap5.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.5/js/buttons.html5.js",
      revision: "1",
    },
    {
      url: "https://cdn.datatables.net/buttons/3.2.5/js/buttons.print.js",
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
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://cdnjs.cloudflare.com" ||
    url.origin === "https://www.gstatic.com" ||
    url.origin === "https://cdn.datatables.net" ||
    url.origin === "https://cdn.jsdelivr.net",
  new workbox.strategies.CacheFirst({
    cacheName: 'CACHE_NAME',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100 // Support large file list
      })
    ]
  })
);

// Stale-while-revalidate for other CDN resources
workbox.routing.registerRoute(
  ({ url }) => url.origin !== location.origin,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'cdn-dynamic-cache'
  })
);

// Offline fallback for navigation
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.CacheFirst({
    cacheName: 'CACHE_NAME',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200]
      })
    ]
  })
);

// Immediate activation
workbox.core.skipWaiting();
workbox.core.clientsClaim();
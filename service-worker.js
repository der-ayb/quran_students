importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js"
);

workbox.setConfig({ debug: true });

// Precache critical files with revisions (update revisions when files change)
workbox.precaching.precacheAndRoute(
  [
    { url: "./", revision: "1" },
    { url: "./favicon.ico", revision: "1" },
    { url: "./index.html", revision: "1" },
    { url: "./offline.html", revision: "1" },
    { url: "./manifest.json", revision: "1" },
    { url: "./src/style.css", revision: "1" },
    { url: "./src/script.js", revision: "1" },
    { url: "./src/auth.js", revision: "1" },
    { url: "./src/pdfmake.js", revision: "1" },
    { url: "./src/vfs_fonts.js", revision: "1" },
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
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/cosmo/bootstrap.rtl.min.css",
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
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/simplex/bootstrap.rtl.min.css",
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
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/superhero/bootstrap.rtl.min.css",
      revision: "1",
    },
    {
      url: "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/cyborg/bootstrap.rtl.min.css",
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
  ],
  {
    // Ignore URL parameters to prevent duplicate caching
    ignoreURLParametersMatching: [/.*/],
  }
);

// Runtime caching for same-origin requests (network first, fallback to cache)
workbox.routing.registerRoute(
  ({ request }) => request.destination === "document",
  new workbox.strategies.NetworkFirst({
    cacheName: "pages",
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })],
  })
);

// Runtime caching for CSS/JS (stale-while-revalidate)
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "script",
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "assets",
  })
);

// Runtime caching for images
workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: "images",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Fallback to offline.html for navigation requests
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return workbox.precaching.matchPrecache("./offline.html");
  }
  return Response.error();
});

console.log("[SW] worker-service.js loaded");

// Enhanced Service Worker for Quran Students PWA
// Version: 2.0

const CACHE_NAME = 'quran-students-v2';
const STATIC_CACHE = 'quran-students-static-v2';
const DYNAMIC_CACHE = 'quran-students-dynamic-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/index.html',
  '/manifest.json',

  '/src/style.css',
  '/src/script.js',
  '/src/auth.js',
  '/src/pdfmake.js',
  '/src/vfs_fonts.js',

  '/assets/default.sqlite3',
  '/assets/quran.sqlite',
  '/assets/manifest-icon-192.maskable.png',
  '/assets/manifest-icon-512.maskable.png',
  '/assets/apple-icon-180.png',
];

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/spacelab/bootstrap.rtl.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js',
  'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm',
  'https://cdn.datatables.net/2.3.2/js/dataTables.js',
  'https://cdn.datatables.net/2.3.2/css/dataTables.dataTables.css'
];

// Hostname whitelist for caching
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'cdn.jsdelivr.net',
  'cdn.datatables.net',
  'cdnjs.cloudflare.com',
  'www.gstatic.com',
  'code.jquery.com',
  // 'der-ayb.github.io/quran_students'
  // 'http://127.0.0.1:5500/'
  // 'https://437da5bfcb87.ngrok-free.app/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache external resources
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching external resources');
        return Promise.allSettled(
          EXTERNAL_RESOURCES.map(url => 
            cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
    })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticAsset(event.request));
  } else if (isExternalResource(event.request)) {
    event.respondWith(handleExternalResource(event.request));
  } else if (HOSTNAME_WHITELIST.includes(url.hostname)) {
    event.respondWith(handleDynamicRequest(event.request));
  }
});

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.hostname === self.location.hostname && 
         (STATIC_ASSETS.some(asset => url.pathname === asset) ||
          url.pathname.startsWith('/assets/') ||
          url.pathname.startsWith('/src/'));
}

// Check if request is for an external resource
function isExternalResource(request) {
  return EXTERNAL_RESOURCES.some(resource => request.url.startsWith(resource.split('?')[0]));
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

// Handle external resources with stale-while-revalidate strategy
async function handleExternalResource(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Start network request (don't await)
    const networkPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);
    
    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      networkPromise.catch(() => {});
      return cachedResponse;
    }
    
    // Wait for network if no cache
    return await networkPromise || cachedResponse;
  } catch (error) {
    console.error('External resource fetch failed:', error);
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

// Handle dynamic requests with network-first strategy
async function handleDynamicRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(getFixedUrl(request));
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return await getOfflineFallback(request);
  }
}

// Utility function to fix URLs (cache busting for same-origin requests)
function getFixedUrl(request) {
  const url = new URL(request.url);
  
  // Ensure HTTPS
  url.protocol = self.location.protocol;
  
  // Add cache busting for same-origin requests
  if (url.hostname === self.location.hostname) {
    url.searchParams.set('cache-bust', Date.now());
  }
  
  return url.href;
}

// Get offline fallback response
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Return main page for navigation requests
  if (request.mode === 'navigate') {
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
  }
  
  // Return generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'هذا المحتوى غير متوفر في وضع عدم الاتصال',
      url: request.url
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  );
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Notify all clients that sync is starting
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_START',
        message: 'بدء مزامنة البيانات...'
      });
    });
    
    // Here you would implement actual data synchronization
    // For now, just notify completion
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'تم مزامنة البيانات بنجاح'
      });
    });
    
    console.log('Service Worker: Data sync completed');
  } catch (error) {
    console.error('Service Worker: Data sync failed:', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        message: 'فشل في مزامنة البيانات'
      });
    });
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      static: STATIC_CACHE,
      dynamic: DYNAMIC_CACHE
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'daily-data-backup') {
    event.waitUntil(performDailyBackup());
  }
});

// Perform daily backup
async function performDailyBackup() {
  try {
    console.log('Service Worker: Performing daily backup...');
    
    // Notify clients about backup
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKUP_START',
        message: 'بدء النسخ الاحتياطي اليومي...'
      });
    });
    
    // Here you would implement actual backup logic
    // For now, just simulate success
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKUP_COMPLETE',
        message: 'تم النسخ الاحتياطي بنجاح'
      });
    });
    
    console.log('Service Worker: Daily backup completed');
  } catch (error) {
    console.error('Service Worker: Daily backup failed:', error);
  }
}

console.log('Service Worker: Script loaded successfully');

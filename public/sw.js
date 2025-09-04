const CACHE_NAME = 'tamil-hexagon-v3';
const STATIC_CACHE = 'tamil-hexagon-static-v3';
const DYNAMIC_CACHE = 'tamil-hexagon-dynamic-v3';
const IMAGE_CACHE = 'tamil-hexagon-images-v3';

const staticAssets = [
  '/',
  '/manifest.json',
  '/logo.jpg',
  '/offline.html',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap'
];

const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(staticAssets);
      }),
      // Pre-cache critical resources
      caches.open(DYNAMIC_CACHE).then((cache) => {
        // Pre-cache the main app shell
        return cache.add('/');
      })
    ]).then(() => {
      // Show install notification
      self.registration.showNotification('Tamil Hexagon Installed!', {
        body: 'The app is now available offline. Tap to open.',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: 'install-success',
        requireInteraction: false,
        actions: [
          {
            action: 'open',
            title: 'Open App'
          }
        ]
      });
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Enhanced fetch event with multiple caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/') || url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle images with cache-first strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Handle fonts and static assets with cache-first strategy
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Handle navigation requests with stale-while-revalidate
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
});

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const responseClone = response.clone();
    
    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName = DYNAMIC_CACHE) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => {
    // If network fails and we have no cache, return offline page
    if (!cachedResponse) {
      return caches.match('/offline.html');
    }
  });
  
  return cachedResponse || fetchPromise;
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === self.registration.scope && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending offline actions
  // This could include syncing game progress, scores, etc.
  try {
    // Implementation for background sync
  } catch (error) {
    // Handle sync errors
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New puzzle available!',
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      tag: data.tag || 'default',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Play Now'
        },
        {
          action: 'dismiss',
          title: 'Later'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Tamil Hexagon', options)
    );
  }
});
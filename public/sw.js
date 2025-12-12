/**
 * Carphatian Service Worker
 * 
 * Provides offline support and caching for the PWA.
 * 
 * Built by Carphatian
 */

const CACHE_NAME = 'carphatian-v1'
const STATIC_CACHE_NAME = 'carphatian-static-v1'
const DYNAMIC_CACHE_NAME = 'carphatian-dynamic-v1'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/',
]

// Routes to cache with stale-while-revalidate
const CACHE_FIRST_ROUTES = [
  '/images/',
  '/_next/static/',
  '/fonts/',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS.filter(asset => !asset.includes('/offline')))
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API routes - Network first, fallback to cache
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request))
    return
  }

  // Static assets - Cache first
  if (CACHE_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML pages - Stale while revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Default - Network first
  event.respondWith(networkFirst(request))
})

// Cache strategies

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // Return offline page for navigation requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline')
    }
    throw error
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return a fallback for images
    if (request.url.includes('/images/')) {
      return new Response('', { status: 404 })
    }
    throw error
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => {
      if (cachedResponse) {
        return cachedResponse
      }
      return caches.match('/offline')
    })

  return cachedResponse || networkPromise
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        timestamp: Date.now(),
      },
      actions: data.actions || [],
      tag: data.tag || 'default',
      renotify: true,
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Carphatian', options)
    )
  } catch (error) {
    console.error('[SW] Push notification error:', error)
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        // Open a new window
        return clients.openWindow(url)
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncMessages() {
  // Sync any pending messages when back online
  const cache = await caches.open('pending-messages')
  const requests = await cache.keys()
  
  for (const request of requests) {
    try {
      const response = await cache.match(request)
      const data = await response.json()
      
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      await cache.delete(request)
    } catch (error) {
      console.error('[SW] Failed to sync message:', error)
    }
  }
}

async function syncNotifications() {
  // Mark notifications as read when back online
  try {
    await fetch('/api/notifications/sync', { method: 'POST' })
  } catch (error) {
    console.error('[SW] Failed to sync notifications:', error)
  }
}

console.log('[SW] Service Worker loaded')

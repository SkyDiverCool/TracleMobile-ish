const CACHE = '553d48899da898cb29083912d7530909d07db9d0decc0aef377553d74ca7afe5'
const PRECACHE_URLS = [
  '/external-stylesheets.css',
  '/index.html',
  '/index.js',
  '/manifest.webmanifest'
]

// On install precache all static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache =>
        Promise.all(
          PRECACHE_URLS.map(url =>
            cache
              .add(url)
              .catch(error => console.log(`Could not cache: ${url} - ${error}!`))
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

// On activate remove all unused caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => cacheNames.filter(cacheName => cacheName !== CACHE))
      .then(cachesToDelete =>
        Promise.all(
          cachesToDelete.map(cacheToDelete => caches.delete(cacheToDelete))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const url = event.request.url
  const origin = self.location.origin
  const isSameOrigin = url.startsWith(origin)

  let response = null

  // If we are on the same origin
  if (isSameOrigin) {
    // Try to get the response from the cache, and if not available
    // fall back to the "index.html" file.
    response =
      caches
        .match(event.request)
        .then(cachedResponse => cachedResponse || caches.match('/index.html'))
  } else {
    response = fetch(event.request)
  }

  event.respondWith(response)
})

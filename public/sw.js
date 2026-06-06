const PRECACHE_NAME = 'stockcut-precache-v2';
const RUNTIME_NAME = 'stockcut-runtime-v2';
const SHELL_URLS = ['/', '/sheet-cutting-optimizer', '/linear-cutting-optimizer', '/saw-kerf-calculator', '/manifest.webmanifest'];
const MAX_RUNTIME_ENTRIES = 60;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => ![PRECACHE_NAME, RUNTIME_NAME].includes(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isCacheableSameOriginAsset(request, url) {
  return url.origin === self.location.origin
    && request.method === 'GET'
    && ['script', 'style', 'image', 'font'].includes(request.destination);
}

async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_NAME);
  const keys = await cache.keys();
  if (keys.length <= MAX_RUNTIME_ENTRIES) return;
  await Promise.all(keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES).map(key => cache.delete(key)));
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(RUNTIME_NAME);
      await cache.put(request, response.clone());
      void trimRuntimeCache();
    }
    return response;
  } catch {
    return await caches.match(request) || await caches.match('/') || Response.error();
  }
}

async function cacheFirstAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(RUNTIME_NAME);
    await cache.put(request, response.clone());
    void trimRuntimeCache();
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isCacheableSameOriginAsset(request, url)) {
    event.respondWith(cacheFirstAsset(request));
  }
});

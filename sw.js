const CACHE_NAME = 'washer-log-v73-maskable';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Abaikan CDN - jangan di-cache, biar gak kena Tracking Prevention
  if(url.hostname.includes('cdn.') || url.hostname.includes('jsdelivr') || url.hostname.includes('google') || url.hostname.includes('tailwindcss')){
    return;
  }
  // Hanya handle file di scope Washer-Log
  if(url.pathname.startsWith('/Washer-Log/')){
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          if(res.ok && e.request.method === 'GET'){
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});

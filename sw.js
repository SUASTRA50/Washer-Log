const CACHE_NAME = 'washer-log-v72-isolated';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Jangan sentuh CDN / google script sama sekali - biar gak tracking prevention
  if(url.hostname.includes('cdn.') || url.hostname.includes('jsdelivr') || url.hostname.includes('google') || url.hostname.includes('tailwindcss')){
    return;
  }
  // Hanya handle request di scope Washer-Log
  if(url.pathname.startsWith('/Washer-Log/') || url.origin === location.origin){
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          if(res.ok && e.request.method === 'GET' && e.request.url.startsWith('http')){
             const clone = res.clone();
             caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});

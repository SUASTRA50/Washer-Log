
const CACHE_NAME = 'washer-log-v64-1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never cache Google Script API - always network
  if(url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        // cache new assets
        if(e.request.method==='GET' && resp.status===200){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(e.request, clone));
        }
        return resp;
      }).catch(()=>cached);
    })
  );
});

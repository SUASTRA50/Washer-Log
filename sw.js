const CACHE_NAME = 'washer-log-v70';
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
    .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if(url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')){
    return; // jangan cache API
  }
  // Untuk CDN, pakai network first, jangan cache di install
  if(url.hostname.includes('cdn.tailwindcss.com') || url.hostname.includes('cdn.jsdelivr.net')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        if(e.request.method==='GET' && resp.status===200 && resp.type==='basic'){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(e.request, clone));
        }
        return resp;
      }).catch(()=>cached);
    })
  );
});

// SMG — service worker (funzionamento offline)
const CACHE = 'sudomagodo-v1';
const FILES = ['./', './index.html', './engine.js', './app.js', './app.webmanifest', './icon-192.png', './icon-512.png',
  './icon-maskable-512.png', './apple-touch-icon.png', './logo.png',
  './fonts/poppins-regular.woff', './fonts/poppins-medium.woff', './fonts/poppins-bold.woff', './fonts/poppins-bolditalic.woff'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Solo i file dell'app: rete prima (aggiornamenti immediati), cache se offline.
// Le chiamate a Intervals.icu e al meteo passano direttamente.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

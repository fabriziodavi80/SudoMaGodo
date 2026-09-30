// SMG si è spostata: questo service worker si rimuove da solo
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.registration.unregister()));

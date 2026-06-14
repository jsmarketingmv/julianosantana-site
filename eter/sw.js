const CACHE = 'eter-v3';
const ASSETS = [
  '/eter/',
  '/eter/index.html',
  '/eter/manifest.json',
  '/eter/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isAppShell = req.mode === 'navigate'
    || url.pathname === '/eter/'
    || url.pathname.endsWith('/eter/index.html');

  if (isAppShell) {
    // Network-first: sempre busca a versão mais nova quando online,
    // cai para o cache só quando offline.
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('/eter/', copy));
          return res;
        })
        .catch(() => caches.match(req).then(c => c || caches.match('/eter/')))
    );
    return;
  }

  // Cache-first para assets estáticos (ícone, manifest).
  e.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});

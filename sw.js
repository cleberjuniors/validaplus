const CACHE_NAME = "validaplus-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./login.html",
  "./cadastro.html",
  "./dashboard.html",
  "./manifest.json",
  "./css/style.css",
  "./js/auth.js",
  "./js/produtos.js"
];

// INSTALA
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ATIVA
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (offline)
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

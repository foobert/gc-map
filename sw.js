self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open("gc-map").then(function(cache) {
      return cache.addAll([
        "/",
        "/index.html",
        "/css/detail.css",
        "/css/filter.css",
        "/css/index.css",
        "/css/map.css",
        "/css/progress.css",
        "/css/location.css",
        "/bundle.js"
      ]);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

// WICHTIG: Bei jeder Code-Änderung an index.html sowohl hier APP_VERSION
// als auch die Versionsnummer in version.json erhöhen (gleicher Wert!).
const APP_VERSION = "1.0.0";
const CACHE_NAME = "magisches-gestuet-v" + APP_VERSION;
const CORE_ASSETS = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Wird von der App nach Klick auf "Aktualisieren" gesendet.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // version.json darf NIEMALS aus dem Cache kommen, sonst erkennt die App
  // neue Versionen nicht mehr.
  if (url.pathname.endsWith("version.json")) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

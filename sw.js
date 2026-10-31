// Service worker: deixa o app instalável e abre a tela inicial mesmo com internet fraca.
// Estratégia: tenta a rede primeiro (para sempre pegar a versão nova) e usa o cache como reserva.
const CACHE = "talktome-v5";
const SHELL = ["/", "/index.html", "/style.css", "/scripts.js", "/scripts-intl.js", "/core.js", "/backend-firebase.js", "/ai-providers.js", "/firebase-config.js", "/pwa.js",
  "/logo.svg", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Só cuida dos arquivos do próprio app. API, login e Firebase passam direto.
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/__/")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("/index.html")))
  );
});

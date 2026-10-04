const CACHE = "casa-llavaneras-ios-v56";
const ASSETS = ["./", "./index.html", "./styles.css", "./app.js", "./wines.js", "./dossiers.js", "./providers/wineProvider.js", "./pairings.js", "./manifest.json", "./icon.svg", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./cave-principal.jpg", "./capsula.jpg", "./botella-tinto.jpg", "./botella-blanco.jpg", "./botella-espumoso.jpg"];
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (new URL(url).origin !== self.location.origin) return;
  if (/\.(js|css|html)$/.test(url) || e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok && /\.(jpg|jpeg|png|svg|webp)$/i.test(url)) {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
    }
    return r;
  }).catch(() => caches.match(e.request)));
});

self.addEventListener("message", e => {
  const data = e.data || {};
  if (data.type === "notify" && data.title) {
    e.waitUntil(self.registration.showNotification(data.title, {
      body: data.body || "",
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: data.tag || "cava",
      renotify: true,
      data: { open: data.open || "home" }
    }));
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const open = (e.notification.data && e.notification.data.open) || "home";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    if (list[0]) {
      list[0].postMessage({ type: "open", screen: open });
      return list[0].focus();
    }
    return clients.openWindow("./index.html");
  }));
});

self.addEventListener("push", e => {
  let payload = { title: "Casa Llavaneras", body: "Revisa tu vinoteca.", open: "home" };
  try {
    if (e.data) payload = Object.assign(payload, e.data.json());
  } catch {
    try { if (e.data) payload.body = e.data.text(); } catch {}
  }
  e.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body || "",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: payload.tag || "cava",
    data: { open: payload.open || "home" }
  }));
});

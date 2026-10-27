const CACHE = "casa-llavaneras-ios-v104";
const VERSION = "v104";
const NEXT = CACHE + "-next";
const ASSETS = ["./", "./index.html", "./styles.css", "./i18n.js", "./casa-util.js", "./casa-vino.js", "./casa-estado.js", "./casa-inicio.js", "./casa-vinoteca.js", "./casa-bodega.js", "./casa-ficha.js", "./casa-mesa.js", "./casa-bebidas.js", "./casa-gemini.js", "./casa-ajustes.js", "./casa-v86.js", "./casa-v88.js", "./casa-v89.js", "./casa-v90.js", "./casa-v91.js", "./casa-v92.js", "./casa-alta.js", "./casa-v103.js", "./app.js", "./wines.js", "./bodegas.js", "./dossiers.js", "./providers/wineProvider.js", "./pairings.js", "./catalog-i18n.js", "./manifest.json", "./icon.svg", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./cave-principal.jpg", "./capsula.jpg", "./botella-tinto.jpg", "./botella-blanco.jpg", "./botella-espumoso.jpg", "./vinedo-chateau-margaux.jpg", "./bodega-domaine-georges-roumier.jpg", "./bodega-domaine-cecile-tremblay.jpg", "./bodega-perelada.jpg", "./bodega-schloss-johannisberg.jpg", "./bodega-kuhling-gillot.jpg", "./bodega-cartuxa.jpg", "./bodega-fitapreta.jpg", "./bodega-vila-gale.jpg", "./bodega-casa-ferreirinha.jpg", "./bodega-churchills.jpg", "./bodega-niepoort.jpg", "./bodega-pocas.jpg", "./bodega-quinta-do-bomfim.jpg", "./bodega-quinta-do-crasto.jpg", "./bodega-quinta-do-pessegueiro.jpg", "./bodega-quinta-vale-d-maria.jpg", "./bodega-taylors.jpg", "./bodega-wine-and-soul.jpg", "./bodega-casa-santos-lima.jpg", "./bodega-madeira-wine-company.jpg", "./bodega-ermelinda-freitas.jpg", "./bodega-aveleda.jpg", "./bodega-luis-canas.jpg", "./bodega-garcia-figuero.jpg", "./bodega-pago-de-los-capellanes.jpg"];
const OCR = ["./vendor/tesseract/tesseract.min.js", "./vendor/tesseract/worker.min.js", "./vendor/tesseract/tesseract-core-lstm.wasm.js", "./vendor/tesseract/tesseract-core-simd-lstm.wasm.js", "./vendor/tesseract/spa.traineddata.gz", "./vendor/tesseract/eng.traineddata.gz", "./vendor/tesseract/por.traineddata.gz", "./vendor/tesseract/fra.traineddata.gz", "./vendor/tesseract/cat.traineddata.gz"];

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { cache: "no-store", signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function shellIsThisVersion(cache) {
  try {
    const htmlRes = await cache.match("./index.html");
    const appRes = await cache.match("./app.js");
    if (!htmlRes || !appRes) return false;
    const html = await htmlRes.text();
    const app = await appRes.text();
    return html.includes('content="' + VERSION + '"') && app.includes('APP_VERSION = "' + VERSION + '"');
  } catch (err) {
    return false;
  }
}

async function shellIsComplete(cache) {
  try {
    for (const path of ASSETS) {
      const hit = await cache.match(path, { ignoreSearch: true });
      if (!hit) return false;
    }
    return shellIsThisVersion(cache);
  } catch (err) {
    return false;
  }
}

let picked = null;
async function activeCache() {
  if (!picked) {
    try {
      const keys = await caches.keys();
      if (keys.includes(NEXT)) {
        const next = await caches.open(NEXT);
        if (await shellIsComplete(next)) picked = NEXT;
      }
    } catch (err) {}
    if (!picked) picked = CACHE;
  }
  return caches.open(picked);
}

function withoutSearch(request) {
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function matchShell(cache, request) {
  const clean = withoutSearch(request);
  let hit = await cache.match(clean) || await cache.match(request, { ignoreSearch: true });
  if (!hit && request.mode === "navigate") {
    hit = await cache.match("./index.html") || await cache.match("./");
  }
  return hit || null;
}

let revalidated = false;
function revalidateShell() {
  if (revalidated) return Promise.resolve();
  revalidated = true;
  return (async () => {
    if (!picked) await activeCache();
    const stagingName = picked === NEXT ? CACHE : NEXT;
    const staging = await caches.open(stagingName);
    const saved = [];
    for (const path of ASSETS) {
      let res = null;
      try { res = await fetchWithTimeout(path, 3000); } catch (err) { res = null; }
      if (!res || !res.ok) {
        if (picked !== stagingName) await caches.delete(stagingName);
        return;
      }
      saved.push([path, res]);
    }
    for (const pair of saved) await staging.put(pair[0], pair[1].clone());
    if (!(await shellIsComplete(staging))) {
      if (picked !== stagingName) await caches.delete(stagingName);
      return;
    }
    picked = stagingName;
  })().catch(async () => {});
}

async function putFresh(cache, path) {
  const res = await fetch(new Request(path, { cache: "reload" }));
  if (!res || !res.ok) throw new Error(path);
  await cache.put(path, res);
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      for (const path of ASSETS) await putFresh(cache, path);
      for (const path of OCR) {
        try { await putFresh(cache, path); } catch (err) {}
      }
      if (!(await shellIsThisVersion(cache))) throw new Error("version");
      await self.skipWaiting();
    } catch (err) {
      await caches.delete(CACHE);
      throw err;
    }
  })());
});

self.addEventListener("activate", e => {
  // La página ya está pintada cuando este worker toma el control. En Safari
  // iOS la navegación no se despacha hasta que waitUntil termina, así que
  // esperarla aquí deja el documento congelado: se ve Inicio y ningún toque
  // entra. La recarga la hace la propia página (controllerchange / sw-activated).
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && k !== NEXT).map(k => caches.delete(k)));
    await self.clients.claim();
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    list.forEach(client => {
      try { client.postMessage({ type: "sw-activated", version: VERSION }); } catch (err) {}
    });
  })());
});

function plainResponse() {
  return new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function settleWithin(work, ms, fallback) {
  return new Promise(resolve => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => {
      Promise.resolve().then(fallback).then(finish, () => finish(plainResponse()));
    }, ms);
    Promise.resolve().then(work).then(finish, () => {
      Promise.resolve().then(fallback).then(finish, () => finish(plainResponse()));
    });
  });
}

async function shellFallback(request) {
  try {
    const fresh = await fetchWithTimeout(request, 3000);
    if (fresh && fresh.ok) return fresh;
  } catch (err) {}
  try {
    const cache = await caches.open(CACHE);
    const hit = await matchShell(cache, request);
    if (hit) return hit;
  } catch (err) {}
  return plainResponse();
}

async function serveShell(request) {
  const cache = await activeCache();
  const current = await shellIsThisVersion(cache);
  if (current) {
    const cached = await matchShell(cache, request);
    if (cached) return cached;
  }
  let fresh = null;
  try { fresh = await fetchWithTimeout(request, 4000); } catch (err) { fresh = null; }
  if (fresh && fresh.ok) return fresh;
  const again = await matchShell(await activeCache(), request);
  if (again) return again;
  return new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (e.request.method !== "GET") return;
  let path = url;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== self.location.origin) return;
    path = parsed.pathname;
  } catch (err) {
    return;
  }
  if (/\/sw\.js$/.test(path)) return;
  if (/\/vendor\/(tesseract|zxing)\//.test(path)) {
    e.respondWith((async () => {
      const cache = await activeCache();
      const hit = await cache.match(e.request, { ignoreSearch: true });
      if (hit) return hit;
      const fresh = await fetch(e.request);
      if (fresh && fresh.ok) cache.put(e.request, fresh.clone()).catch(() => {});
      return fresh;
    })());
    return;
  }
  if (e.request.mode === "navigate" || /\.(js|css|html)$/.test(path)) {
    e.respondWith(settleWithin(
      () => serveShell(e.request),
      4500,
      () => shellFallback(e.request)
    ).then((res) => {
      revalidateShell();
      return res;
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok && /\.(jpg|jpeg|png|svg|webp)$/i.test(url)) {
      const copy = r.clone();
      activeCache().then(c => c.put(e.request, copy)).catch(() => {});
    }
    return r;
  }).catch(() => activeCache().then(c => c.match(e.request, { ignoreSearch: true })).then(hit => hit || new Response("", { status: 504 }))));
});

self.addEventListener("message", e => {
  const data = e.data || {};
  if (data.type === "skip-waiting") {
    e.waitUntil(self.skipWaiting());
    return;
  }
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

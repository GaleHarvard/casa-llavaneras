/* Estado, copia de seguridad y etiquetas. */
const STORE = "vinoteca.pro.max.v3";
const defaultState = () => ({
  vinotecas: [
    {
      id: "v1",
      name: "Vinoteca principal",
      brand: "La Sommelière VIP 185",
      capacity: 185,
      used: 0,
      tHigh: 16.7,
      tLow: 12.0,
      humidity: 65,
      role: "prestige",
      zones: ["VIP 185 · botellas prestigiosas", "Lectura 16,7 °C"],
      photo: "cave-render-sommeliere.jpg"
    },
    { id: "v2", name: "Cava de guarda", brand: "Eurocave", capacity: 32, used: 0, tHigh: 12.6, tLow: 12.6, humidity: 72, zones: ["Zona única · 12,5 °C"], photo: "cave-render-eurocave.jpg" }
  ],
  bottles: [
    { uid: "b1", wineId: "tondonia-reserva-2011", qty: 3, cellarId: "v1", bin: "A-12", bought: "2024-11-02", price: 42, note: "Caja de 6, quedan 3" },
    { uid: "b2", wineId: "pazo-senorans-2023", qty: 4, cellarId: "v1", bin: "B-03", bought: "2025-06-18", price: 18, note: "" },
    { uid: "b3", wineId: "vega-valbuena-2019", qty: 2, cellarId: "v2", bin: "G-01", bought: "2025-01-20", price: 165, note: "Para aniversario" },
    { uid: "b7", wineId: "vs-unico-2009", qty: 2, cellarId: "v1", bin: "A-01", bought: "2022-10-08", price: 520, note: "Bandeja superior · etiquetas blancas" },
    { uid: "b4", wineId: "gramona-iii-lustros-2016", qty: 2, cellarId: "v1", bin: "B-08", bought: "2025-12-10", price: 44, note: "" },
    { uid: "b5", wineId: "muga-prado-enea-2015", qty: 2, cellarId: "v2", bin: "G-04", bought: "2024-04-12", price: 62, note: "" },
    { uid: "b6", wineId: "riscal-reserva-2019", qty: 6, cellarId: "v1", bin: "A-02", bought: "2025-09-01", price: 21, note: "Consumo diario elevado" }
  ],
  favorites: ["tondonia-reserva-2011"],
  notify: { on: false, evolve: true, ready: true, temp: true, last: {} },
  tasting: {},
  houses: [{ id: "h1", name: "Casa Llavaneras", type: "Casa", note: "" }],
  prefs: {
    hideValue: false,
    hidePrices: false,
    hideBin: false,
    scale: 10,
    decimals: true,
    currency: "EUR",
    demo: true,
    lastBackup: null,
    sources: { vivino: true, penin: true, parker: true, spectator: true, decanter: true, vinous: true, suckling: true }
  },
  activity: [],
  consumption: [],
  consumptionBackfilled: true,
  customWines: [],
  inbox: []
});
let state = load();
let currentWine = null;
let currentBottle = null;
let stream = null;
let filterType = "todos";
let pairingMode = "cava";
let mesaFilters = { owned: false, ready: false, grape: "", type: "todos" };
let cellarFlags = { owned: false, ready: false, grape: "" };
let pairingDish = null;
let pairingQuery = "";
let lastList = "home";
let screenId = "home";
let navStack = [];
let currentSub = "";
let lastLabelData = null;
let intakeSource = "camara";
let ocrBusy = false;
let tesseractReady = null;
function load() {
  try {
    const raw = localStorage.getItem(STORE) || localStorage.getItem("vinoteca.pro.max.v1") || localStorage.getItem("vinoteca.pro.max.v2");
    keepPreMigrationSnapshot(raw);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed.vinotecas || !parsed.bottles) return defaultState();
    if (!parsed.favorites) parsed.favorites = [];
    if (!parsed.notify) parsed.notify = { on: false, evolve: true, ready: true, temp: true, last: {} };
    if (!parsed.notify.last) parsed.notify.last = {};
    if (!parsed.tasting) parsed.tasting = {};
    if (!parsed.houses) parsed.houses = [{ id: "h1", name: "Casa Llavaneras", type: "Casa", note: "" }];
    if (!parsed.prefs) parsed.prefs = {};
    parsed.prefs = Object.assign({
      hideValue: false, hidePrices: false, hideBin: false, scale: 10, decimals: true,
      currency: "EUR", demo: true, lastBackup: null,
      sources: { vivino: true, penin: true, parker: true, spectator: true, decanter: true, vinous: true, suckling: true }
    }, parsed.prefs);
    if (!parsed.prefs.sources) parsed.prefs.sources = { vivino: true, penin: true, parker: true, spectator: true, decanter: true, vinous: true, suckling: true };
    if (!parsed.activity) parsed.activity = [];
    if (!parsed.customWines) parsed.customWines = [];
    if (!parsed.inbox) parsed.inbox = [];
    ensureConsumption(parsed);
    ensureExitReasons(parsed);
    ensureTastingEntries(parsed);
    parsed.vinotecas.forEach(v => { if (!v.houseId) v.houseId = "h1"; });
    return parsed;
  } catch {
    return defaultState();
  }
}
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
  } catch (err) {
    const pending = [];
    releaseConfirmedLabelBytes(pending);
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      if (pending.length) rescuePendingLabels(pending);
    } catch (err2) {
      console.warn("save quota", err2);
      if (pending.length) rescuePendingLabels(pending);
      else notifySaveFailed();
    }
  }
}
function keepPreMigrationSnapshot(raw) {
  if (!raw) return;
  [STORE + ".antes-v74", STORE + ".antes-v75"].forEach(key => {
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, raw);
    } catch (err) {}
  });
}
let bebidaFilter = "todas";
let cellarView = "botellas";
let perfilKind = "";
let currentCaveId = "";
let cellarSearchTick = 0;
let pendingExit = null;
const labelPhotoCache = Object.create(null);
function isDataImage(value) {
  return typeof value === "string" && value.indexOf("data:image") === 0;
}
function isLabelMarker(value) {
  return typeof value === "string" && value.indexOf("idb:") === 0;
}
function lotLabelKey(uid) {
  return "lot:" + uid;
}
function labelMarker(key) {
  return "idb:" + key;
}
function resolveLabelRef(ref) {
  if (!ref || typeof ref !== "string") return "";
  if (isDataImage(ref)) return ref;
  if (isLabelMarker(ref)) return labelPhotoCache[ref.slice(4)] || "";
  return "";
}
function isOwnLabelRef(ref) {
  return isDataImage(ref) || isLabelMarker(ref);
}
function openLabelDbOnce() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("no-idb")); return; }
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn(value);
    };
    let req;
    try { req = indexedDB.open("casa-llavaneras-labels", 1); }
    catch (err) { reject(err); return; }
    const timer = setTimeout(() => finish(reject, new Error("idb-timeout")), 1200);
    req.onupgradeneeded = () => {
      try {
        if (!req.result.objectStoreNames.contains("thumbs")) req.result.createObjectStore("thumbs");
      } catch (err) {}
    };
    req.onsuccess = () => finish(resolve, req.result);
    req.onerror = () => finish(reject, req.error || new Error("idb-open"));
    req.onblocked = () => finish(reject, new Error("idb-blocked"));
  });
}
function openLabelDb() {
  const delays = [0, 160, 420];
  const attempt = (i) => openLabelDbOnce().catch(err => {
    if (i + 1 >= delays.length) throw err;
    return waitMs(delays[i + 1]).then(() => attempt(i + 1));
  });
  return attempt(0);
}
function readThumbs(db) {
  return new Promise((resolve, reject) => {
    const out = {};
    const tx = db.transaction("thumbs", "readonly");
    const req = tx.objectStore("thumbs").openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) { resolve(out); return; }
      if (cur.key && cur.value) out[String(cur.key)] = cur.value;
      cur.continue();
    };
    req.onerror = () => reject(req.error);
  });
}
function loadLabelPhotos() {
  return openLabelDb().then(readThumbs).then(map => {
    Object.keys(map).forEach(k => { if (map[k]) labelPhotoCache[k] = map[k]; });
    return true;
  }).catch(() => false);
}
function readLabelPhotos() {
  return openLabelDb().then(readThumbs).catch(() => ({}));
}
function writeLabelPhotos(map) {
  const photos = map && typeof map === "object" ? map : {};
  const entries = Object.keys(photos).filter(id => isDataImage(photos[id]));
  if (!entries.length) return Promise.resolve(true);
  return openLabelDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("thumbs", "readwrite");
    const store = tx.objectStore("thumbs");
    entries.forEach(id => store.put(photos[id], id));
    tx.oncomplete = () => {
      entries.forEach(id => { labelPhotoCache[id] = photos[id]; });
      resolve(true);
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("idb-abort"));
  })).catch(() => false);
}
function putLabelVerified(key, dataUrl) {
  if (!key || !isDataImage(dataUrl)) return Promise.resolve(false);
  return openLabelDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("thumbs", "readwrite");
    tx.objectStore("thumbs").put(dataUrl, key);
    tx.oncomplete = () => resolve(db);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("idb-abort"));
  })).then(db => new Promise(resolve => {
    const tx = db.transaction("thumbs", "readonly");
    const req = tx.objectStore("thumbs").get(key);
    req.onsuccess = () => {
      const ok = req.result === dataUrl;
      if (ok) labelPhotoCache[key] = dataUrl;
      resolve(ok);
    };
    req.onerror = () => resolve(false);
  })).catch(() => false);
}
function saveWineLabelPhoto(id, dataUrl) {
  if (!id || !isDataImage(dataUrl)) return Promise.resolve(false);
  return putLabelVerified(id, dataUrl).then(ok => {
    if (ok) return true;
    const wine = wineById(id);
    if (wine && !isCatalogWineId(id) && dataUrl.length < 90000) wine.labelThumb = dataUrl;
    return false;
  });
}
function assignLabelKey(wineId, uid, bytes, claimed) {
  const wineKey = wineId || (uid ? lotLabelKey(uid) : "");
  const lotKey = uid ? lotLabelKey(uid) : wineKey;
  if (lotKey && labelPhotoCache[lotKey] === bytes) return lotKey;
  if (wineKey && labelPhotoCache[wineKey] === bytes) return wineKey;
  if (claimed && claimed[wineKey] === bytes) return wineKey;
  const wineTaken = (wineKey && labelPhotoCache[wineKey] && labelPhotoCache[wineKey] !== bytes)
    || (claimed && claimed[wineKey] && claimed[wineKey] !== bytes);
  if (wineTaken) return lotKey;
  if (claimed && wineKey) claimed[wineKey] = bytes;
  return wineKey || lotKey;
}
function assignThumbKey(wineId, bytes, claimed) {
  const alt = "thumb:" + wineId;
  if (labelPhotoCache[alt] === bytes) return alt;
  if (labelPhotoCache[wineId] === bytes) return wineId;
  if (claimed && claimed[wineId] === bytes) return wineId;
  const taken = (labelPhotoCache[wineId] && labelPhotoCache[wineId] !== bytes)
    || (claimed && claimed[wineId] && claimed[wineId] !== bytes);
  if (taken) {
    if (claimed) claimed[alt] = bytes;
    return alt;
  }
  if (claimed) claimed[wineId] = bytes;
  return wineId;
}
function collectLabelJobs(pending, applyIfCached) {
  const claimed = Object.create(null);
  let applied = false;
  (state.bottles || []).forEach(b => {
    if (!b || !isDataImage(b.labelPhoto)) return;
    const key = assignLabelKey(b.wineId, b.uid, b.labelPhoto, claimed);
    const job = { key: key, bytes: b.labelPhoto, apply: () => { b.labelPhoto = labelMarker(key); } };
    if (applyIfCached && labelPhotoCache[key] === b.labelPhoto) { job.apply(); applied = true; }
    else pending.push(job);
  });
  (state.customWines || []).forEach(w => {
    if (!w || !w.id || !isDataImage(w.labelThumb)) return;
    const key = assignThumbKey(w.id, w.labelThumb, claimed);
    const job = { key: key, bytes: w.labelThumb, apply: () => { w.labelThumb = labelMarker(key); } };
    if (applyIfCached && labelPhotoCache[key] === w.labelThumb) { job.apply(); applied = true; }
    else pending.push(job);
  });
  return applied;
}
function releaseConfirmedLabelBytes(pending) {
  collectLabelJobs(pending, true);
}
function rescuePendingLabels(pending) {
  Promise.all(pending.map(job => putLabelVerified(job.key, job.bytes).then(ok => {
    if (ok) job.apply();
    return ok;
  }))).then(results => {
    const any = results.some(Boolean);
    if (!any) { notifySaveFailed(); return; }
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (err) { notifySaveFailed(); }
  }).catch(() => notifySaveFailed());
}
function notifySaveFailed() {
  const now = Date.now();
  if (now - (notifySaveFailed.at || 0) < 5000) return;
  notifySaveFailed.at = now;
  try { toast(t("quota.toast")); }
  catch (err) { console.warn("save quota", err); }
}
function migrateStoredLabelBytes() {
  const pending = [];
  const already = collectLabelJobs(pending, false);
  return pending.reduce((chain, job) => chain.then(changed => {
    return putLabelVerified(job.key, job.bytes).then(ok => {
      if (ok) { job.apply(); return true; }
      return changed;
    });
  }), Promise.resolve(already));
}
function countOwnLabels(map) {
  const source = map || labelPhotoCache;
  return Object.keys(source).filter(k => isDataImage(source[k])).length;
}
function prepareOwnLabels() {
  return loadLabelPhotos().then(ok => migrateStoredLabelBytes().then(changed => {
    const dirty = !!(state && state._consumptionDirty);
    const reasons = !!(state && state._reasonsDirty);
    const tastings = !!(state && state._tastingsDirty);
    if (dirty) delete state._consumptionDirty;
    if (reasons) delete state._reasonsDirty;
    if (tastings) delete state._tastingsDirty;
    if (dirty || reasons || tastings || changed) save();
    if (!ok) {
      setTimeout(() => {
        loadLabelPhotos().then(again => { if (again) repaintAfterLabels(); });
      }, 800);
    }
    return true;
  }));
}
function repaintAfterLabels() {
  try {
    if (screenId === "cellar") renderCellar();
    else if (screenId === "calendar") renderCalendar();
    else if (screenId === "pairings") renderPairings();
    else if (screenId === "wine" && currentWine) openWine(currentWine.id, currentBottle);
    else if (screenId === "bebidas") renderBebidas();
    else if (screenId === "home") renderHome();
  } catch (err) {}
}
function ownLabel(w, bottle) {
  if (bottle && bottle.wineId && (!w || bottle.wineId === w.id)) {
    const lot = resolveLabelRef(bottle.labelPhoto);
    if (lot) return lot;
  }
  if (!w) return "";
  if (labelPhotoCache[w.id]) return labelPhotoCache[w.id];
  const thumb = resolveLabelRef(w.labelThumb);
  if (thumb) return thumb;
  const hit = (state.bottles || []).find(b => b.wineId === w.id && resolveLabelRef(b.labelPhoto));
  if (hit) return resolveLabelRef(hit.labelPhoto);
  const row = (state.inbox || []).find(b => b.wineId === w.id && resolveLabelRef(b.photo));
  return row ? resolveLabelRef(row.photo) : "";
}
function hasOwnLabel(w, bottle) {
  if (bottle && isOwnLabelRef(bottle.labelPhoto)) return true;
  if (!w) return false;
  if (labelPhotoCache[w.id]) return true;
  if (isOwnLabelRef(w.labelThumb)) return true;
  if ((state.bottles || []).some(b => b.wineId === w.id && (isOwnLabelRef(b.labelPhoto) || labelPhotoCache[lotLabelKey(b.uid)]))) return true;
  if ((state.inbox || []).some(b => b.wineId === w.id && (isOwnLabelRef(b.photo) || labelPhotoCache[w.id]))) return true;
  return false;
}
function labelSrc(w, bottle) {
  const own = ownLabel(w, bottle);
  if (own) return own;
  if (hasOwnLabel(w, bottle)) return "";
  if (w && w.labelUrl && /^https?:\/\//i.test(w.labelUrl)) return w.labelUrl;
  if (w && CATALOG_LABELS[w.id]) return CATALOG_LABELS[w.id];
  return "";
}
function labelThumbHtml(w, cls, bottle) {
  const tone = bottleTone(w);
  const src = labelSrc(w, bottle);
  const clsName = (cls || "label-thumb") + (src ? "" : " label-fallback");
  const alt = escHtml(((w && w.producer) || "") + " " + ((w && w.name) || "") + " " + ((w && w.vintage) || "")).trim();
  if (src) return `<img class="${clsName}" alt="${alt}" src="${escHtml(src)}" data-fallback="${tone}" onerror="labelFallback(this)">`;
  return `<img class="${clsName}" alt="${alt}" data-fallback="${tone}" data-bottle="${tone}">`;
}
function mountLabelThumbs(root) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll("img[data-fallback]").forEach(img => {
    if (!img.getAttribute("src")) img.src = bottleSrcFromTone(img.getAttribute("data-fallback"));
  });
}
function labelFallback(img) {
  if (!img || img.dataset.fellback === "1") return;
  const src = img.getAttribute("src") || "";
  if (isDataImage(src) || isLabelMarker(src)) return;
  img.dataset.fellback = "1";
  img.onerror = null;
  img.classList.add("label-fallback");
  img.src = bottleSrcFromTone(img.getAttribute("data-fallback"));
}
window.labelFallback = labelFallback;
function compressLabelThumb(dataUrl) {
  return new Promise(resolve => {
    if (!dataUrl) { resolve(""); return; }
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) { resolve(""); return; }
      const ratio = w / h;
      let sx, sy, side;
      if (ratio < 0.85) {
        side = Math.round(Math.min(w * 0.92, h * 0.52));
        sx = Math.round((w - side) / 2);
        sy = Math.round(h * 0.28);
        if (sy + side > h) sy = Math.max(0, h - side);
      } else {
        side = Math.min(w, h);
        sx = Math.round((w - side) / 2);
        sy = Math.round((h - side) / 2);
      }
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, 300, 300);
      try { resolve(canvas.toDataURL("image/jpeg", 0.7)); }
      catch (e) { resolve(""); }
    };
    img.onerror = () => resolve("");
    img.src = dataUrl;
  });
}
function rememberLabelPhoto(wineId, dataUrl, bottle, inboxRow) {
  if (!wineId || !dataUrl) return Promise.resolve(false);
  return compressLabelThumb(dataUrl).then(async thumb => {
    if (!thumb) return false;
    const wineOk = await saveWineLabelPhoto(wineId, thumb);
    if (bottle && bottle.uid) {
      const lotKey = lotLabelKey(bottle.uid);
      const lotOk = await saveWineLabelPhoto(lotKey, thumb);
      if (lotOk) bottle.labelPhoto = labelMarker(lotKey);
      else if (wineOk) bottle.labelPhoto = labelMarker(wineId);
      else bottle.labelPhoto = thumb;
    }
    if (inboxRow) {
      if (wineOk) inboxRow.photo = labelMarker(wineId);
      else if (thumb.length < 90000) inboxRow.photo = thumb;
    }
    const stored = wineById(wineId);
    if (stored && !isCatalogWineId(wineId) && wineOk) stored.labelThumb = labelMarker(wineId);
    save();
    try {
      if (inboxRow && screenId === "inbox") renderInbox();
    } catch (err) {}
    return wineOk;
  });
}
function changeWineLabel() {
  const wine = currentWine;
  if (!wine) return;
  const input = $("#wine-label-file");
  if (!input) return;
  input.value = "";
  input.removeAttribute("capture");
  input.setAttribute("accept", "image/*");
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const thumb = await compressLabelThumb(reader.result);
      if (!thumb) { toast(t("label.unread")); return; }
      const wineOk = await saveWineLabelPhoto(wine.id, thumb);
      if (currentBottle && currentBottle.wineId === wine.id) {
        const lotKey = lotLabelKey(currentBottle.uid);
        const lotOk = await saveWineLabelPhoto(lotKey, thumb);
        if (lotOk) currentBottle.labelPhoto = labelMarker(lotKey);
        else if (wineOk) currentBottle.labelPhoto = labelMarker(wine.id);
        else currentBottle.labelPhoto = thumb;
      }
      const stored = wineById(wine.id);
      if (stored && !isCatalogWineId(wine.id) && wineOk) stored.labelThumb = labelMarker(wine.id);
      save();
      toast(t("label.updated"));
      openWine(wine.id, currentBottle);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
let tastingEditId = "";
let tastingLink = null;
function labelRefFor(w) {
  if (!w || typeof labelSrc !== "function") return "";
  const src = labelSrc(w);
  if (!src || String(src).indexOf("data:") === 0) return "";
  return src;
}
function winesOf(target) {
  return (window.WINE_CATALOG || []).concat((target && target.customWines) || []);
}
function wineFromServeLabel(target, label) {
  const n = normTxt(label);
  if (!n) return null;
  let best = null;
  let bestLen = 0;
  winesOf(target).forEach(w => {
    const key = normTxt((w.producer || "") + " " + (w.name || ""));
    if (key && n.indexOf(key) >= 0 && key.length > bestLen) { best = w; bestLen = key.length; }
  });
  return best;
}
function ensureConsumption(target) {
  if (!target) return target;
  if (!Array.isArray(target.consumption)) target.consumption = [];
  if (target.consumptionBackfilled) return target;
  let added = 0;
  const seen = {};
  target.consumption.forEach(c => {
    if (c && c.sourceAt != null) seen[String(c.sourceAt) + "|" + (c.sourceText || "")] = 1;
  });
  (target.activity || []).forEach(a => {
    if (!a) return;
    const text = String(a.text || "");
    const typed = a.type === "serve";
    const m = text.match(/^Servidas?\s+(\d+)\s*·\s*(.+)$/i);
    if (!typed && !m) return;
    const key = String(a.at || "") + "|" + text;
    if (seen[key]) return;
    const qty = Math.max(1, parseInt((typed && a.qty) ? a.qty : (m && m[1]), 10) || 1);
    const label = ((m && m[2]) || text).trim();
    const wine = (a.wineId && winesOf(target).find(w => w.id === a.wineId)) || wineFromServeLabel(target, label);
    const at = Number(a.at) || Date.now();
    target.consumption.push({
      id: "c" + at + "-" + qty,
      at: at,
      date: isoFromTs(at),
      qty: qty,
      occasion: "",
      people: "",
      rating: null,
      note: "",
      wineId: wine ? wine.id : (a.wineId || ""),
      name: wine ? wine.name : (label || "Vino"),
      vintage: wine ? (wine.vintage || "") : "",
      producer: wine ? (wine.producer || "") : "",
      type: wine ? (wine.type || "") : "",
      label: "",
      reason: "bebida",
      sourceAt: at,
      sourceText: text
    });
    seen[key] = 1;
    added += 1;
  });
  target.consumptionBackfilled = true;
  if (added) target._consumptionDirty = true;
  return target;
}
function ensureExitReasons(target) {
  if (!target) return target;
  if (!Array.isArray(target.consumption)) target.consumption = [];
  let added = 0;
  target.consumption.forEach(c => {
    if (!c || c.reason) return;
    c.reason = "bebida";
    added += 1;
  });
  if (!target.marketOverrides || typeof target.marketOverrides !== "object" || Array.isArray(target.marketOverrides)) {
    target.marketOverrides = {};
  }
  if (added) target._reasonsDirty = true;
  return target;
}
function blankTasting(wineId, extra) {
  extra = extra || {};
  return {
    id: extra.id || ("t" + Date.now().toString(36) + Math.random().toString(16).slice(2, 6)),
    wineId: wineId || "",
    at: extra.at || Date.now(),
    date: extra.date || todayIso(),
    consumptionId: extra.consumptionId || "",
    vista: { hue: extra.hue || "", intensity: extra.intensity == null ? 5 : extra.intensity },
    nariz: { intensity: 5, aromas: [], text: "" },
    boca: { acidez: 6, dulzor: 2, tanino: 6, cuerpo: 7, final: 5 },
    conclusion: { score: null, note: "" }
  };
}
function tastingFromLegacy(wineId, old) {
  old = old || {};
  const at = Number(old.at) || 0;
  return {
    id: "tlegacy-" + wineId,
    wineId: wineId,
    at: at,
    date: at ? isoFromTs(at) : "",
    consumptionId: "",
    vista: { hue: "", intensity: null },
    nariz: { intensity: null, aromas: [], text: "" },
    boca: {
      acidez: Number(old.acidez),
      dulzor: Number(old.dulzor),
      tanino: Number(old.tanino),
      cuerpo: Number(old.cuerpo),
      final: null
    },
    conclusion: { score: null, note: old.note ? String(old.note) : "" },
    legacy: JSON.parse(JSON.stringify(old))
  };
}
function isLegacyTaste(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return value.acidez != null || value.dulzor != null || value.tanino != null || value.cuerpo != null || Object.prototype.hasOwnProperty.call(value, "note");
}
function ensureTastingEntries(target) {
  if (!target) return target;
  if (!target.tasting || typeof target.tasting !== "object" || Array.isArray(target.tasting)) target.tasting = {};
  if (!target.wineEdits || typeof target.wineEdits !== "object" || Array.isArray(target.wineEdits)) target.wineEdits = {};
  let added = 0;
  Object.keys(target.tasting).forEach(id => {
    const cur = target.tasting[id];
    if (Array.isArray(cur)) return;
    if (isLegacyTaste(cur)) {
      target.tasting[id] = [tastingFromLegacy(id, cur)];
      added += 1;
      return;
    }
    target.tasting[id] = [];
  });
  if (added) target._tastingsDirty = true;
  return target;
}
function makeConsumption(wine, qty, fields) {
  fields = fields || {};
  const at = Date.parse((fields.date || todayIso()) + "T12:00:00");
  return {
    id: "c" + Date.now().toString(36) + Math.random().toString(16).slice(2, 6),
    at: Number.isFinite(at) ? at : Date.now(),
    date: fields.date || todayIso(),
    qty: Math.max(1, qty || 1),
    occasion: fields.occasion || "",
    people: fields.people || "",
    rating: fields.rating || null,
    note: fields.note || "",
    wineId: wine ? wine.id : "",
    name: wine ? (wine.name || "Vino") : "Vino",
    vintage: wine ? (wine.vintage || "") : "",
    producer: wine ? (wine.producer || "") : "",
    type: wine ? (wine.type || "") : "",
    label: labelRefFor(wine),
    reason: fields.reason || "bebida"
  };
}
let pendingServe = null;
let pendingCataOffer = null;
let lastOcrText = "";
let lastOcrRaw = "";
let lastOcrNote = "";
let ocrLexiconCache = null;
let lastInternetHits = [];
let photoSearchGen = 0;
let intakeBusy = false;
let forceOnce = false;
function prefs() { return state.prefs || (state.prefs = {}); }
function houseName(id) {
  return (state.houses.find(h => h.id === id) || { name: "Casa Llavaneras" }).name;
}
function ensureHouse(name) {
  const n = (name || "").trim() || "Casa Llavaneras";
  let h = state.houses.find(x => x.name.toLowerCase() === n.toLowerCase());
  if (!h) {
    h = { id: "h" + Date.now(), name: n, type: "Casa", note: "" };
    state.houses.push(h);
  }
  return h.id;
}
function fmtBackup(ts) {
  if (typeof formatWhen === "function") return formatWhen(ts);
  if (!ts) return "Aún no";
  const d = new Date(ts);
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function uniqueWines() {
  return new Set(state.bottles.map(b => b.wineId)).size;
}
const BACKUP_STALE_MS = 30 * 24 * 60 * 60 * 1000;
function backupIsDue() {
  const ts = Number(prefs().lastBackup) || 0;
  if (!ts) return true;
  return Date.now() - ts > BACKUP_STALE_MS;
}
function backupReminderHtml() {
  if (!backupIsDue()) return "";
  const never = !Number(prefs().lastBackup);
  return `<div class="card backup-remind" role="button" onclick="openPerfilSub('backup')" style="margin-top:12px">
    <div class="row"><h3>${t("backup.title")}</h3><span class="badge warn">${never ? t("backup.due") : t("backup.old")}</span></div>
    <p class="muted" style="margin-top:6px">${never ? t("backup.neverBody") : t("backup.oldBody")}</p>
  </div>`;
}
function refreshBackupReminder() {
  const box = document.getElementById("backup-remind");
  if (box) box.innerHTML = backupReminderHtml();
}
function askPersistentStorage() {
  try {
    if (navigator.storage && typeof navigator.storage.persist === "function") {
      navigator.storage.persist().catch(() => {});
    }
  } catch (e) {}
}
function ensureStateShape(target) {
  if (!target.favorites) target.favorites = [];
  if (!target.notify) target.notify = { on: false, evolve: true, ready: true, temp: true, last: {} };
  if (!target.notify.last) target.notify.last = {};
  if (!target.tasting) target.tasting = {};
  if (!target.houses) target.houses = [{ id: "h1", name: "Casa Llavaneras", type: "Casa", note: "" }];
  target.prefs = Object.assign({
    hideValue: false, hidePrices: false, hideBin: false, scale: 10, decimals: true,
    currency: "EUR", demo: true, lastBackup: null,
    sources: { vivino: true, penin: true, parker: true, spectator: true, decanter: true, vinous: true, suckling: true }
  }, target.prefs || {});
  if (!target.prefs.sources) {
    target.prefs.sources = { vivino: true, penin: true, parker: true, spectator: true, decanter: true, vinous: true, suckling: true };
  }
  if (!target.activity) target.activity = [];
  if (!target.customWines) target.customWines = [];
  if (!target.inbox) target.inbox = [];
  if (!target.notify.dismissedStock) target.notify.dismissedStock = [];
  ensureConsumption(target);
  ensureExitReasons(target);
  ensureTastingEntries(target);
  (target.vinotecas || []).forEach(v => { if (v && !v.houseId) v.houseId = "h1"; });
  return target;
}
async function collectBackup() {
  const labels = await readLabelPhotos();
  let provider = {};
  try { provider = readPriceCfg() || {}; } catch (e) { provider = {}; }
  return {
    format: 2,
    version: "2",
    savedAt: new Date().toISOString(),
    app: APP_VERSION,
    state: JSON.parse(JSON.stringify(state)),
    labels: labels || {},
    provider: provider
  };
}
function markBackupSaved() {
  prefs().lastBackup = Date.now();
  save();
  toast(t("backup.saved"));
  if ($("#perfil-sub") && $("#perfil-sub").classList.contains("active")) openPerfilSub("backup");
  if (screenId === "home") renderHome();
  refreshBackupReminder();
}
async function exportBackup() {
  try {
    askPersistentStorage();
    const payload = await collectBackup();
    const name = "MiVinoteca_Backup_" + new Date().toISOString().slice(0, 10) + ".json";
    const text = JSON.stringify(payload, null, 2);
    const file = new File([text], name, { type: "application/json" });
    let canFileShare = false;
    try {
      canFileShare = !!(navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }));
    } catch (e) { canFileShare = false; }
    if (canFileShare) {
      try {
        await navigator.share({ files: [file], title: t("backup.share") });
        markBackupSaved();
        return;
      } catch (err) {
        if (err && err.name === "AbortError") {
          toast(t("backup.notSaved"));
          return;
        }
      }
    }
    downloadFile(name, text, "application/json");
    markBackupSaved();
  } catch (e) {
    toast(t("backup.fail"));
  }
}
function applyRestoredBackup(data) {
  if (!data || typeof data !== "object") throw new Error("invalid");
  const full = data.state && data.state.bottles && data.state.vinotecas;
  const keptStamp = Number(prefs().lastBackup) || null;
  if (full) {
    state = ensureStateShape(data.state);
    if (!state.prefs) state.prefs = {};
    state.prefs.lastBackup = keptStamp;
  } else {
    if (!data.bottles || !data.vinotecas) throw new Error("invalid");
    if (data.houses) state.houses = data.houses;
    state.vinotecas = data.vinotecas;
    state.bottles = data.bottles;
    if (data.tasting) state.tasting = data.tasting;
    if (data.favorites) state.favorites = data.favorites;
    if (data.notify) state.notify = data.notify;
    if (data.customWines) state.customWines = data.customWines;
    if (data.inbox) state.inbox = data.inbox;
    if (data.activity) state.activity = data.activity;
    if (Array.isArray(data.consumption)) state.consumption = data.consumption;
    else if (data.activity) state.consumptionBackfilled = false;
    if (data.prefs) {
      state.prefs = Object.assign(prefs(), data.prefs);
      state.prefs.lastBackup = keptStamp;
    }
    ensureStateShape(state);
  }
  const writes = [];
  if (data.labels && typeof data.labels === "object") writes.push(writeLabelPhotos(data.labels));
  if (data.provider && typeof data.provider === "object") {
    try { localStorage.setItem(PRICE_CFG_KEY, JSON.stringify(data.provider)); } catch (e) {}
  }
  return Promise.all(writes).then(() => migrateStoredLabelBytes()).catch(() => false).then(() => {
    if (state && state._consumptionDirty) delete state._consumptionDirty;
    if (state && state._reasonsDirty) delete state._reasonsDirty;
    if (state && state._tastingsDirty) delete state._tastingsDirty;
    save();
    return true;
  });
}
function exportCsv() {
  const head = ["csv.name","csv.estate","csv.vintage","csv.region","csv.country","csv.type","csv.qty","csv.place","csv.score","csv.state","csv.price"].map(k => t(k));
  const rows = state.bottles.map(b => {
    const w = wineById(b.wineId) || {};
    const loc = state.prefs.hideBin ? houseName(state.vinotecas.find(v=>v.id===b.cellarId)?.houseId) : (cellarName(b.cellarId) + " " + (b.bin||""));
    const price = state.prefs.hidePrices ? "" : (b.price || "");
    return [w.name, w.producer, w.vintage, w.region, w.country, w.type, b.qty, loc, w.ratings && w.ratings.parker ? w.ratings.parker.score : "", phaseOf(w).label, price];
  });
  const csv = [head].concat(rows).map(r => r.map(x => `"${String(x??"").replace(/"/g,'""')}"`).join(";")).join("\n");
  downloadFile("MiVinoteca_Inventario_" + new Date().toISOString().slice(0,10) + ".csv", csv, "text/csv");
  toast(t("backup.csvInv"));
}
function exportTastingCsv() {
  const head = ["Vino","Añada","Fecha","Acidez","Dulzor","Tanino","Cuerpo","Final","Puntuación","Recuerdo"];
  const rows = [];
  Object.keys(state.tasting || {}).forEach(id => {
    const w = wineById(id) || {};
    tastingsOf(id).forEach(t => {
      const boca = t.boca || {};
      rows.push([w.producer + " " + w.name, w.vintage, t.date || "", boca.acidez, boca.dulzor, boca.tanino, boca.cuerpo, boca.final, (t.conclusion && t.conclusion.score) || "", (t.conclusion && t.conclusion.note) || ""]);
    });
  });
  const csv = [head].concat(rows).map(r => r.map(x => `"${String(x??"").replace(/"/g,'""')}"`).join(";")).join("\n");
  downloadFile("MiVinoteca_Catas_" + new Date().toISOString().slice(0,10) + ".csv", csv, "text/csv");
  toast(t("backup.csvTaste"));
}
function reviewRestore(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const bag = (data && data.state && data.state.bottles) ? data.state : data;
      const bottles = bag.bottles || [];
      const nB = bottles.length;
      const nW = new Set(bottles.map(b => b.wineId)).size;
      const nT = Object.keys((bag.tasting) || {}).length;
      const nCustom = ((bag.customWines) || data.customWines || []).length;
      const nLabels = data.labels ? Object.keys(data.labels).length : 0;
      const nDrink = ((bag.consumption) || data.consumption || []).length;
      if (!confirm(t("backup.confirm", { w: nW, b: nB, t: nT, c: nCustom, d: nDrink, l: nLabels, when: data.savedAt || "—" }))) return;
      applyRestoredBackup(data).then(() => {
        toast(t("backup.restored"));
        show("perfil");
        renderHome();
      }).catch(() => toast(t("backup.badFile")));
    } catch {
      toast(t("backup.badJson"));
    }
  };
  reader.readAsText(file);
}
function importCsv() { toast(t("backup.csvLater")); }
function askWipe() {
  const ok = prompt(t("backup.wipeAsk"));
  if (ok !== "ELIMINAR") return toast(t("backup.notWiped"));
  state.bottles = [];
  state.tasting = {};
  state.favorites = [];
  prefs().demo = false;
  save();
  toast(t("backup.wiped"));
  show("perfil");
}
if (typeof bootLang === "function") bootLang();

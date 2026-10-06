function dossierOf(w) {
  const packed = (window.WINE_DOSSIERS && w && window.WINE_DOSSIERS[w.id]) || {};
  const own = (w && w.dossier) || {};
  const merged = Object.assign({
    soils: "Suelo de la denominación.",
    elevation: "—",
    vineyard: w ? (w.appellation + " · " + (w.grapes || []).join(", ")) : "",
    vinification: "Elaboración de la casa.",
    elevage: "Crianza en bodega.",
    glass: "Copa adecuada al tipo",
    decant: w && w.type === "espumoso" ? "No" : "30–60 min",
    oxygen: "Servir en su temperatura.",
    history: w ? (w.producer + " se elabora en " + w.region + " (" + w.appellation + ").") : "",
    market: { low: 0, mid: 0, high: 0, trend: "—" },
    similar: [],
    awards: []
  }, packed, own);
  if (w && w.provenance && !(window.WINE_DOSSIERS && window.WINE_DOSSIERS[w.id])) {
    ["soils", "elevation", "vineyard", "vinification", "elevage", "glass", "decant", "oxygen", "history"].forEach(k => {
      if (!own[k]) merged[k] = "Sin dato";
    });
    if (!own.awards) merged.awards = [];
    if (!own.market) merged.market = { low: null, mid: null, high: null, trend: "Sin dato" };
  }
  return merged;
}

const NOW = new Date(2026, 8, 22);
const YEAR = NOW.getFullYear();
const STORE = "vinoteca.pro.max.v3";

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
  cave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16M16 4v16"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 7h12M8 12h12M8 17h12"/><circle cx="4" cy="7" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="17" r="1.2" fill="currentColor"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 12h8"/></svg>'
};

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
  customWines: [],
  inbox: [],
  plateCache: {}
});

let state = load();
let currentWine = null;
let currentBottle = null;
let stream = null;
let filterType = "todos";
let pairingMode = "cava";
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
    if (!parsed.plateCache || typeof parsed.plateCache !== "object") parsed.plateCache = {};
    parsed.vinotecas.forEach(v => { if (!v.houseId) v.houseId = "h1"; });
    const main = parsed.vinotecas.find(v => v.id === "v1");
    if (main) {
      main.brand = "La Sommelière VIP 185";
      main.photo = "cave-render-sommeliere.jpg";
      main.capacity = 185;
      main.role = "prestige";
      if (!main.zones || main.zones.join("").includes("Pando") || main.zones.join("").includes("Tintos")) {
        main.zones = ["Lectura actual · 16,7 °C", "SET 1 / SET 2"];
      }
      if (Math.abs(main.tHigh - 13.2) < 0.05) main.tHigh = 16.7;
    }
    const guarda = parsed.vinotecas.find(v => v.id === "v2");
    if (guarda) {
      guarda.photo = "cave-render-eurocave.jpg";
      if (!guarda.brand) guarda.brand = "Eurocave";
    }
    if (!parsed.bottles.some(b => b.wineId === "vs-unico-2009")) {
      parsed.bottles.unshift({ uid: "b7", wineId: "vs-unico-2009", qty: 2, cellarId: "v1", bin: "A-01", bought: "2022-10-08", price: 520, note: "Bandeja superior" });
    }
    parsed.vinotecas = parsed.vinotecas.filter(v => v.id !== "v3");
    return parsed;
  } catch {
    return defaultState();
  }
}
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
  } catch (err) {
    state.bottles.forEach(b => {
      if (b.labelPhoto && String(b.labelPhoto).length > 4000) b.labelPhoto = "";
      if (b.photo && String(b.photo).length > 4000) b.photo = "";
    });
    try { localStorage.setItem(STORE, JSON.stringify(state)); }
    catch (err2) { console.warn("save quota", err2); }
  }
}

function wineById(id) {
  return WINE_CATALOG.find(w => w.id === id) || (state.customWines || []).find(w => w.id === id);
}

function phaseOf(wine) {
  const a = wine.aging;
  const pr = progressOf(wine);
  if (YEAR < a.drinkFrom || pr.pct < 38) return { key: "wait", label: "Aguardar", hint: "Todavía gana en botella" };
  if (YEAR > a.holdTo || pr.pct >= 82) return { key: "late", label: "En declive", hint: "Riesgo de fatiga" };
  if (YEAR >= a.peakEnd - 1 || pr.pct >= 62) return { key: "warn", label: "Beber pronto", hint: "Últimos años de meseta" };
  if (YEAR < a.peakStart) return { key: "ok", label: "Se puede abrir", hint: "Antes del apogeo" };
  return { key: "ok", label: "En apogeo", hint: "Ventana ideal" };
}

function progressOf(wine) {
  const start = wine.vintage;
  const end = wine.aging.holdTo;
  const peak0 = wine.aging.peakStart;
  const peak1 = wine.aging.peakEnd;
  const pct = Math.max(0, Math.min(100, ((YEAR - start) / (end - start)) * 100));
  const peakPct0 = ((peak0 - start) / (end - start)) * 100;
  const peakPct1 = ((peak1 - start) / (end - start)) * 100;
  return { pct, peakPct0, peakPct1 };
}

function yearsUntilPeakEnd(peakEnd) {
  const left = Number(peakEnd) - YEAR;
  if (!Number.isFinite(left)) return "—";
  if (left > 1) return "Quedan " + left + " años";
  if (left === 1) return "Queda 1 año";
  if (left === 0) return "Último año";
  return "Pasado de fecha";
}

function drinkWindowMarks(pr) {
  const clamp = n => Math.max(0, Math.min(100, n));
  const left = Number.isFinite(pr.peakPct0) ? clamp(pr.peakPct0) : 0;
  const right = Number.isFinite(pr.peakPct1) ? clamp(pr.peakPct1) : left;
  const now = Number.isFinite(pr.pct) ? clamp(pr.pct) : 0;
  return { left, width: Math.max(right - left, 1.5), now };
}

function score100(r) {
  if (!r) return "—";
  if (r.scale === 5) return Math.round(r.score * 20);
  return r.score;
}

function totalBottles() {
  return state.bottles.reduce((n, b) => n + b.qty, 0);
}
function cellarValue() {
  return state.bottles.reduce((n, b) => n + (Number(b.price) || 0) * b.qty, 0);
}

function bottlesReady() {
  return state.bottles.filter(b => {
    const w = wineById(b.wineId);
    const p = phaseOf(w);
    return p.key === "ok" || p.key === "warn";
  });
}

function $ (sel, root = document) { return root.querySelector(sel); }
function $$ (sel, root = document) { return [...root.querySelectorAll(sel)]; }

function snapNav() {
  return {
    id: screenId || "home",
    wineId: currentWine && currentWine.id,
    bottleUid: currentBottle && currentBottle.uid,
    sub: currentSub || ""
  };
}
function show(id, opts) {
  opts = opts || {};
  if (!id) id = "home";
  if (opts.tab) navStack = [];
  else if (!opts.replace && !opts.pop && screenId && screenId !== id) {
    navStack.push(snapNav());
    if (navStack.length > 24) navStack.shift();
  }
  screenId = id;
  if (!["wine", "wine-sub", "dish"].includes(id)) lastList = id;
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  const tabId = id === "cave-detail-screen" ? "caves" : id === "wine" || id === "wine-sub" ? lastList : id;
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.go === tabId || t.dataset.go === id));
  document.querySelector(".app")?.classList.toggle("fiche", id === "wine" || id === "wine-sub" || id === "dish");
  if (id !== "scan") stopCam();
  if (id === "home") renderHome();
  if (id === "inbox") renderInbox();
  if (id === "caves") renderCaves();
  if (id === "cellar") renderCellar();
  if (id === "calendar") renderCalendar();
  if (id === "pairings") renderPairings();
  if (id === "perfil") renderPerfil();
  if (id === "zonas") renderZonas();
  if (id === "catas") renderCatas();
}
function backCaption() {
  const p = navStack[navStack.length - 1];
  if (!p) return "Inicio";
  const names = {
    home: "Inicio", caves: "Vinotecas", "cave-detail-screen": "Vinoteca",
    cellar: "Botellas", calendar: "Fechas", pairings: "Mesa", scan: "Escanear", inbox: "Entradas",
    perfil: "Perfil", "perfil-sub": "Perfil", zonas: "Zonas", catas: "Catas",
    dish: "Plato", wine: "Ficha", "wine-sub": "Ficha"
  };
  if (p.id === "wine" && p.wineId) {
    const w = wineById(p.wineId);
    return w ? w.producer.split(" ").slice(0, 2).join(" ") : "Ficha";
  }
  return names[p.id] || "Atrás";
}
function goBack() {
  hideSheets();
  const prev = navStack.pop();
  if (!prev) return show("home", { replace: true });
  restoreNav(prev);
}
function restoreNav(p) {
  if (!p) return show("home", { replace: true });
  if ((p.id === "wine" || p.id === "wine-sub") && p.wineId) {
    const bot = p.bottleUid ? state.bottles.find(b => b.uid === p.bottleUid) : null;
    currentWine = wineById(p.wineId);
    currentBottle = bot || state.bottles.find(b => b.wineId === p.wineId) || null;
    if (p.id === "wine-sub" && p.sub) {
      openWine(p.wineId, currentBottle);
      openWineSub(p.sub);
      navStack.pop();
      return;
    }
    openWine(p.wineId, currentBottle);
    navStack.pop();
    return;
  }
  show(p.id, { replace: true });
}

function renderHome() {
  const ready = bottlesReady();
  const main = state.vinotecas.find(v => v.id === "v1");
  syncUsed();
  const cap = state.vinotecas.reduce((n, v) => n + (v.capacity || 0), 0);
  $("#home-kpis").innerHTML = `
    <div class="kpi"><b>${totalBottles()}/${cap}</b><span>En cava</span></div>
    <div class="kpi"><b>${state.prefs.hideValue ? "—" : cellarValue() + " €"}</b><span>Valor</span></div>
    <div class="kpi"><b>${ready.reduce((n,b)=>n+b.qty,0)}</b><span>Para servir</span></div>
    <div class="kpi"><b>${main ? main.tHigh.toFixed(1) + "°" : "—"}</b><span>VIP 185</span></div>`;

  const featured = pickFeaturedWine();
  $("#home-featured").innerHTML = featured ? `
    <h2 style="margin-top:8px">Vino destacado</h2>
    <div class="card" role="button" onclick="openWine('${featured.id}')" style="margin-top:10px">
      <div class="feat-row">
        <img src="${featured.id.indexOf('margaux')>=0?'capsula-margaux.jpg':'capsula.jpg'}" alt="${featured.name}">
        <div>
          <p class="tiny">${phaseOf(featured).label}</p>
          <h3 style="margin-top:4px">${featured.producer}</h3>
          <p>${featured.name} ${featured.vintage}</p>
          <p class="muted" style="margin-top:6px">${featured.region} · Parker ${featured.ratings.parker.score}</p>
        </div>
      </div>
    </div>` : "";

  const drinkNow = ready.slice(0, 4);
  $("#home-ready").innerHTML = `
    <h2 style="margin-top:16px">Para beber ahora</h2>
    ${drinkNow.length
      ? `<div class="tile-row" style="margin-top:10px">${drinkNow.map(b => homeWineTile(wineById(b.wineId))).join("")}</div>`
      : `<p class="empty">Nada en ventana de consumo.</p>`}`;

  const lastT = lastTastings(3);
  $("#home-tasting").innerHTML = `
    <h2 style="margin-top:16px" role="button" onclick="show('catas')">Últimas catas</h2>
    ${lastT.length ? lastT.map(t => `
      <div class="card" role="button" onclick="openWineThenTaste('${t.wine.id}')" style="margin-top:10px">
        <div class="row"><h3>${t.wine.producer}</h3><span class="tiny">${t.when}</span></div>
        <p class="muted">${t.wine.name} ${t.wine.vintage}</p>
        <p class="tiny" style="margin-top:4px">${t.note || "Sin recuerdo escrito"}</p>
      </div>`).join("") : `<p class="empty">Aún no hay cata personal.</p>`}`;

  $("#home-alerts").innerHTML = homeAlertsHtml(main);
  const perm = typeof Notification !== "undefined" ? Notification.permission : "denied";
  const on = state.notify && state.notify.on && perm === "granted";
  $("#home-notify").innerHTML = `
    <h2 style="margin-top:18px">Páginas</h2>
    <div class="card" role="button" onclick="show('inbox')" style="margin-top:10px"><div class="row"><h3>Entradas del escáner</h3><span class="tiny">${(state.inbox||[]).filter(x=>!x.entered).length || "›"}</span></div><p class="muted">Fotos leídas pendientes de stock y hueco</p></div>
    <div class="card" role="button" onclick="show('caves',{tab:true})" style="margin-top:8px"><div class="row"><h3>Vinotecas</h3><span class="tiny">›</span></div><p class="muted">VIP 185 y el resto de cavas</p></div>
    <div class="card" role="button" onclick="openCave('v1')" style="margin-top:8px"><div class="row"><h3>Detalle VIP 185</h3><span class="tiny">›</span></div><p class="muted">Foto, huecos, temperatura</p></div>
    <div class="card" role="button" onclick="show('cellar',{tab:true})" style="margin-top:8px"><div class="row"><h3>Botellas</h3><span class="tiny">›</span></div><p class="muted">Inventario, lotes y ubicación</p></div>
    <div class="card" role="button" onclick="show('pairings',{tab:true})" style="margin-top:8px"><div class="row"><h3>Mesa</h3><span class="tiny">›</span></div><p class="muted">Maridajes por plato y por vino</p></div>
    <div class="card" role="button" onclick="show('calendar',{tab:true})" style="margin-top:8px"><div class="row"><h3>Fechas</h3><span class="tiny">›</span></div><p class="muted">Beber ahora, pronto, aguardar</p></div>
    <div class="card" role="button" onclick="openHomeMap()" style="margin-top:8px"><div class="row"><h3>Zonas vinícolas</h3><span class="tiny">›</span></div><p class="muted">Mapa por región y vinos</p></div>
    <div class="card" role="button" onclick="show('catas')" style="margin-top:8px"><div class="row"><h3>Cuaderno de cata</h3><span class="tiny">›</span></div><p class="muted">Ejes y recuerdo</p></div>
    <div class="card" role="button" onclick="show('perfil')" style="margin-top:8px"><div class="row"><h3>Perfil</h3><span class="tiny">›</span></div><p class="muted">Casas, copias y privacidad</p></div>
    <div class="card" role="button" onclick="setCellarView('ubicaciones');show('cellar',{tab:true})" style="margin-top:8px"><div class="row"><h3>Ubicación física</h3><span class="tiny">›</span></div><p class="muted">Hueco, lote, servir y mover</p></div>
    <div class="chip-row" style="margin-top:14px">
      <button class="chip on" onclick="startScan()">Escanear</button>
      <button class="chip" onclick="show('inbox')">Entradas</button>
      <button class="chip" onclick="quickTaste()">Cata rápida</button>
      <button class="chip" onclick="openHomeMap()">Mapa</button>
    </div>
    <div class="card" role="button" onclick="openNotify()" style="margin-top:12px">
      <div class="row"><h2>Avisos</h2><span class="badge ${on ? "ok" : "wait"}">${on ? "Activos" : "Configurar"}</span></div>
      <p class="muted" style="margin-top:6px">${on ? "Apogeo, beber pronto y temperatura." : "Actívalos para no perder la ventana."}</p>
    </div>
    <div class="card" role="button" onclick="show('perfil')" style="margin-top:10px">
      <div class="row"><h2>Perfil</h2><span class="tiny">›</span></div>
      <p class="muted" style="margin-top:6px">Casas, privacidad, copias y fuentes.</p>
    </div>`;
}

function pickFeaturedWine() {
  const wines = [...new Set(state.bottles.map(b => b.wineId))].map(wineById).filter(Boolean);
  if (!wines.length) return null;
  const peak = wines.filter(w => phaseOf(w).key === "ok");
  const pool = peak.length ? peak : wines;
  return pool.slice().sort((a, b) => (b.ratings.parker.score || 0) - (a.ratings.parker.score || 0))[0];
}

function lastTastings(n) {
  return Object.keys(state.tasting || {}).map(id => {
    const t = state.tasting[id];
    const w = wineById(id);
    if (!w || !t) return null;
    return { wine: w, note: t.note || "", at: t.at || 0, when: t.at ? fmtBackup(t.at).split(" · ")[0] : "—" };
  }).filter(Boolean).sort((a, b) => b.at - a.at).slice(0, n);
}

function homeAlertsHtml(main) {
  const items = [];
  if (main && main.tHigh >= 15) {
    items.push(`<div class="card warn-card" role="button" onclick="openCave('v1')"><strong>Temperatura elevada</strong><p class="muted" style="margin-top:6px">${main.tHigh.toFixed(1)} °C · ideal 12–16 °C</p></div>`);
  }
  state.bottles.forEach(b => {
    const w = wineById(b.wineId);
    if (!w) return;
    const p = phaseOf(w);
    const bin = state.prefs.hideBin ? "" : (b.bin || "");
    if (p.key === "warn" || p.key === "late") {
      items.push(`<div class="card" role="button" onclick="openBottle('${b.uid}')">
        <div class="row"><span class="muted"><i class="alert-dot"></i>Ventana de consumo</span><span class="badge ${p.key}">${p.label}</span></div>
        <h3 style="margin-top:6px">${w.producer} ${w.name} ${w.vintage}</h3>
        <p class="muted">${b.qty} ud${bin ? " · " + bin : ""}</p>
      </div>`);
    }
    if (b.qty <= 1) {
      items.push(`<div class="card" role="button" onclick="openBottle('${b.uid}')">
        <div class="row"><span class="muted">Stock bajo</span><span class="badge warn">1 ud</span></div>
        <h3 style="margin-top:6px">${w.producer} ${w.name}</h3>
      </div>`);
    }
    if (!b.bin || !state.tasting[b.wineId]) {
      items.push(`<div class="card" role="button" onclick="openBottle('${b.uid}')">
        <div class="row"><span class="muted">Información pendiente</span></div>
        <h3 style="margin-top:6px">${w.producer} ${w.name}</h3>
        <p class="tiny">${!b.bin ? "Sin hueco" : "Sin cata personal"}</p>
      </div>`);
    }
  });
  const uniq = [];
  const seen = new Set();
  items.forEach(html => { if (!seen.has(html)) { seen.add(html); uniq.push(html); } });
  return `<h2 style="margin-top:16px">Alertas</h2><div style="margin-top:10px">${uniq.slice(0, 6).join("") || `<div class="card muted">Sin urgencias.</div>`}</div>`;
}

function openWineThenTaste(id) {
  openWine(id);
  setTimeout(() => openWineSub("taste"), 0);
}
function quickTaste() {
  const w = pickFeaturedWine();
  if (!w) return startScan();
  openWineThenTaste(w.id);
}
function openHomeMap() { show("zonas"); }

const ZONES = [
  { name: "Rioja", country: "España", map: "mapa-rioja.jpg", keys: "rioja, rioja alta, rioja alavesa, rioja baja" },
  { name: "Ribera del Duero", country: "España", map: "mapa-ribera.jpg", keys: "ribera del duero, valbuena de duero" },
  { name: "Priorat", country: "España", map: "mapa-priorat.jpg", keys: "priorat prior gratallops" },
  { name: "Montsant", country: "España", map: "mapa-montsant.jpg", keys: "montsant falset" },
  { name: "Rías Baixas", country: "España", map: "mapa-rias.jpg", keys: "rías rias baixas albariño albarino salnés" },
  { name: "Ribeiro", country: "España", map: "mapa-ribeiro.jpg", keys: "ribeiro ribadavia treixadura" },
  { name: "Ribeira Sacra", country: "España", map: "mapa-ribeirasacra.jpg", keys: "ribeira sacra sil mencía" },
  { name: "Valdeorras", country: "España", map: "mapa-valdeorras.jpg", keys: "valdeorras godello sil" },
  { name: "Monterrei", country: "España", map: "mapa-monterrei.jpg", keys: "monterrei verín verin" },
  { name: "Toro", country: "España", map: "mapa-toro.jpg", keys: "toro numanthia tinta de toro" },
  { name: "Rueda", country: "España", map: "mapa-rueda.jpg", keys: "rueda verdejo" },
  { name: "Bierzo", country: "España", map: "mapa-bierzo.jpg", keys: "bierzo mencía ponferrada" },
  { name: "Cigales", country: "España", map: "mapa-cigales.jpg", keys: "cigales valladolid" },
  { name: "Arlanza", country: "España", map: "mapa-arlanza.jpg", keys: "arlanza lerma" },
  { name: "Arribes", country: "España", map: "mapa-arribes.jpg", keys: "arribes fermoselle" },
  { name: "Tierra de León", country: "España", map: "mapa-leon.jpg", keys: "tierra de león leon prieto picudo" },
  { name: "Tierra del Vino de Zamora", country: "España", map: "mapa-zamora.jpg", keys: "tierra del vino de zamora, zamora" },
  { name: "Sierra de Salamanca", country: "España", map: "mapa-salamanca.jpg", keys: "salamanca sierra de salamanca" },
  { name: "Navarra", country: "España", map: "mapa-navarra.jpg", keys: "navarra pamplona" },
  { name: "Somontano", country: "España", map: "mapa-somontano.jpg", keys: "somontano barbastro huesca" },
  { name: "Calatayud", country: "España", map: "mapa-calatayud.jpg", keys: "calatayud jalón jalon" },
  { name: "Campo de Borja", country: "España", map: "mapa-borja.jpg", keys: "campo de borja garnacha" },
  { name: "Cariñena", country: "España", map: "mapa-carinena.jpg", keys: "cariñena carinena" },
  { name: "Costers del Segre", country: "España", map: "mapa-costers.jpg", keys: "costers segre raïmat raimat lleida" },
  { name: "Penedès", country: "España", map: "mapa-penedes.jpg", keys: "penedès penedes" },
  { name: "Corpinnat", country: "España", map: "mapa-penedes.jpg", keys: "corpinnat" },
  { name: "Cava", country: "España", map: "mapa-cava.jpg", keys: "cava sadurní sadurni" },
  { name: "Empordà", country: "España", map: "mapa-emporda.jpg", keys: "empordà emporda figueres" },
  { name: "Alella", country: "España", map: "mapa-alella.jpg", keys: "alella tiana" },
  { name: "Conca de Barberà", country: "España", map: "mapa-conca.jpg", keys: "conca barberà barbera montblanc" },
  { name: "Pla de Bages", country: "España", map: "mapa-bages.jpg", keys: "bages manresa" },
  { name: "Tarragona", country: "España", map: "mapa-tarragona.jpg", keys: "tarragona" },
  { name: "Terra Alta", country: "España", map: "mapa-terraalta.jpg", keys: "terra alta, gandesa" },
  { name: "Catalunya", country: "España", map: "mapa-catalunya.jpg", keys: "catalunya cataluña" },
  { name: "Alicante", country: "España", map: "mapa-alicante.jpg", keys: "alicante, fondillon" },
  { name: "Utiel-Requena", country: "España", map: "mapa-utiel.jpg", keys: "utiel requena bobal" },
  { name: "Valencia", country: "España", map: "mapa-valencia.jpg", keys: "valencia" },
  { name: "Jumilla", country: "España", map: "mapa-jumilla.jpg", keys: "jumilla monastrell" },
  { name: "Yecla", country: "España", map: "mapa-yecla.jpg", keys: "yecla monastrell" },
  { name: "Bullas", country: "España", map: "mapa-bullas.jpg", keys: "bullas" },
  { name: "Jerez", country: "España", map: "mapa-jerez.jpg", keys: "jerez sherry xérès xeres" },
  { name: "Manzanilla-Sanlúcar", country: "España", map: "mapa-manzanilla.jpg", keys: "manzanilla sanlúcar sanlucar" },
  { name: "Montilla-Moriles", country: "España", map: "mapa-montilla.jpg", keys: "montilla moriles pedro ximénez ximenez" },
  { name: "Málaga", country: "España", map: "mapa-malaga.jpg", keys: "málaga malaga ronda" },
  { name: "Condado de Huelva", country: "España", map: "mapa-huelva.jpg", keys: "huelva condado bollullos" },
  { name: "La Mancha", country: "España", map: "mapa-lamancha.jpg", keys: "la mancha manchego" },
  { name: "Valdepeñas", country: "España", map: "mapa-valdepenas.jpg", keys: "valdepeñas valdepenas" },
  { name: "Manchuela", country: "España", map: "mapa-manchuela.jpg", keys: "manchuela bobal" },
  { name: "Almansa", country: "España", map: "mapa-almansa.jpg", keys: "almansa" },
  { name: "Méntrida", country: "España", map: "mapa-mentrida.jpg", keys: "méntrida mentrida" },
  { name: "Uclés", country: "España", map: "mapa-ucles.jpg", keys: "uclés ucles" },
  { name: "Vinos de Madrid", country: "España", map: "mapa-madrid.jpg", keys: "vinos de madrid, arganda, san martin de valdeiglesias" },
  { name: "Ribera del Guadiana", country: "España", map: "mapa-guadiana.jpg", keys: "guadiana almendralejo barros" },
  { name: "Txakoli", country: "España", map: "mapa-txakoli.jpg", keys: "txakoli txakolina getaria bizkaia álava alava" },
  { name: "Cangas", country: "España", map: "mapa-cangas.jpg", keys: "cangas asturias" },
  { name: "Binissalem", country: "España", map: "mapa-binissalem.jpg", keys: "binissalem mallorca" },
  { name: "Pla i Llevant", country: "España", map: "mapa-mallorca.jpg", keys: "pla i llevant mallorca manacor" },
  { name: "Islas Canarias", country: "España", map: "mapa-canarias.jpg", keys: "canarias tenerife valle orotava tacoronte" },
  { name: "Lanzarote", country: "España", map: "mapa-lanzarote.jpg", keys: "lanzarote geria malvasía malvasia" },
  { name: "Sierras de Málaga", country: "España", map: "mapa-malaga.jpg", keys: "sierras de málaga malaga serranía ronda" },
  { name: "Lebrija", country: "España", map: "mapa-jerez.jpg", keys: "lebrija" },
  { name: "Mondéjar", country: "España", map: "mapa-madrid.jpg", keys: "mondéjar mondejar" },
  { name: "Ribera del Júcar", country: "España", map: "mapa-manchuela.jpg", keys: "ribera del jucar, jucar" },
  { name: "Valtiendas", country: "España", map: "mapa-ribera.jpg", keys: "valtiendas" },
  { name: "Valles de Benavente", country: "España", map: "mapa-leon.jpg", keys: "valles de benavente" },

  { name: "Douro", country: "Portugal", map: "mapa-douro.jpg", keys: "douro pinhão pinhao régua regua" },
  { name: "Porto", country: "Portugal", map: "mapa-porto.jpg", keys: "porto port oporto gaia tawny vintage" },
  { name: "Vinho Verde", country: "Portugal", map: "mapa-vinhoverde.jpg", keys: "vinho verde minho monção moncao alvarinho" },
  { name: "Dão", country: "Portugal", map: "mapa-dao.jpg", keys: "dão dao viseu touriga" },
  { name: "Bairrada", country: "Portugal", map: "mapa-bairrada.jpg", keys: "bairrada baga mealhada" },
  { name: "Alentejo", country: "Portugal", map: "mapa-alentejo.jpg", keys: "alentejo évora evora reguengos" },
  { name: "Lisboa", country: "Portugal", map: "mapa-lisboa.jpg", keys: "lisboa estremadura alenquer" },
  { name: "Setúbal", country: "Portugal", map: "mapa-setubal.jpg", keys: "setúbal setubal moscatel" },
  { name: "Palmela", country: "Portugal", map: "mapa-palmela.jpg", keys: "palmela azeitão azeitao" },
  { name: "Tejo", country: "Portugal", map: "mapa-tejo.jpg", keys: "tejo ribatejo tajo" },
  { name: "Algarve", country: "Portugal", map: "mapa-algarve.jpg", keys: "algarve lagoa lagos" },
  { name: "Madeira", country: "Portugal", map: "mapa-madeira.jpg", keys: "madeira malmsey bual sercial" },
  { name: "Trás-os-Montes", country: "Portugal", map: "mapa-trasosmontes.jpg", keys: "trás-os-montes tras os montes chaves" },
  { name: "Beira Interior", country: "Portugal", map: "mapa-beira.jpg", keys: "beira interior pinhel" },
  { name: "Távora-Varosa", country: "Portugal", map: "mapa-tavora.jpg", keys: "távora tavora varosa" },
  { name: "Açores", country: "Portugal", map: "mapa-acores.jpg", keys: "açores acores pico biscoitos" },
  { name: "Colares", country: "Portugal", map: "mapa-colares.jpg", keys: "colares sintra ramisco" },
  { name: "Bucelas", country: "Portugal", map: "mapa-bucelas.jpg", keys: "bucelas arinto" },

  { name: "Champagne", country: "Francia", map: "mapa-champagne.jpg", keys: "champagne pérignon perignon reims épernay epernay" },
  { name: "Médoc", country: "Francia", map: "mapa-medoc.jpg", keys: "medoc, margaux, pauillac, saint-julien, bordeaux" },
  { name: "Sauternes", country: "Francia", map: "mapa-sauternes.jpg", keys: "sauternes, barsac" },
  { name: "Borgoña", country: "Francia", map: "mapa-borgona.jpg", keys: "borgoña bourgogne burgundy beaune vosne nuits" },
  { name: "Chablis", country: "Francia", map: "mapa-chablis.jpg", keys: "chablis, yonne" },
  { name: "Ródano", country: "Francia", map: "mapa-rhone.jpg", keys: "ródano rhone rhône châteauneuf chateauneuf hermitage côte rotie cote" },
  { name: "Loira", country: "Francia", map: "mapa-loira.jpg", keys: "loira loire sancerre vouvray chinon muscadet" },
  { name: "Alsacia", country: "Francia", map: "mapa-alsacia.jpg", keys: "alsacia alsace riesling gewurztraminer" },
  { name: "Provenza", country: "Francia", map: "mapa-provenza.jpg", keys: "provenza provence bandol cassis" },
  { name: "Languedoc", country: "Francia", map: "mapa-languedoc.jpg", keys: "languedoc roussillon pic saint" },
  { name: "Beaujolais", country: "Francia", map: "mapa-beaujolais.jpg", keys: "beaujolais morgon fleurie moulin" },

  { name: "Piemonte", country: "Italia", map: "mapa-piemonte.jpg", keys: "piemonte, piedmont, barolo, barbaresco, langhe" },
  { name: "Bolgheri", country: "Italia", map: "mapa-bolgheri.jpg", keys: "bolgheri sassicaia ornellaia" },
  { name: "Toscana", country: "Italia", map: "mapa-toscana.jpg", keys: "toscana tuscany chianti brunello montalcino" },
  { name: "Veneto", country: "Italia", map: "mapa-veneto.jpg", keys: "veneto valpolicella amarone soave prosecco" },
  { name: "Sicilia", country: "Italia", map: "mapa-sicilia.jpg", keys: "sicilia, sicily, etna, marsala" },

  { name: "Mendoza", country: "Argentina", map: "mapa-mendoza.jpg", keys: "mendoza, valle de uco" },
  { name: "Salta", country: "Argentina", map: "mapa-salta.jpg", keys: "salta cafayate torrontés torrontes" },
  { name: "Patagonia", country: "Argentina", map: "mapa-patagonia.jpg", keys: "patagonia, neuquen, rio negro" },
  { name: "San Juan", country: "Argentina", map: "mapa-sanjuan.jpg", keys: "san juan, pedernal" },

  { name: "Barossa", country: "Australia", map: "mapa-barossa.jpg", keys: "barossa, barossa valley" },
  { name: "Margaret River", country: "Australia", map: "mapa-margaret.jpg", keys: "margaret river" },
  { name: "Hunter Valley", country: "Australia", map: "mapa-hunter.jpg", keys: "hunter valley semillon" },
  { name: "McLaren Vale", country: "Australia", map: "mapa-mclaren.jpg", keys: "mclaren vale" },

  { name: "Mosel", country: "Alemania", map: "mapa-mosel.jpg", keys: "mosel mosela riesling bernkastel" },
  { name: "Rheingau", country: "Alemania", map: "mapa-rheingau.jpg", keys: "rheingau johannisberg" },
  { name: "Pfalz", country: "Alemania", map: "mapa-pfalz.jpg", keys: "pfalz palatinado" },
  { name: "Baden", country: "Alemania", map: "mapa-baden.jpg", keys: "baden kaiserstuhl" },

  { name: "Napa Valley", country: "California", map: "mapa-napa.jpg", keys: "napa valley cabernet oakville rutherford" },
  { name: "Sonoma", country: "California", map: "mapa-sonoma.jpg", keys: "sonoma russian river pinot" },
  { name: "Paso Robles", country: "California", map: "mapa-paso.jpg", keys: "paso robles" },
  { name: "Santa Barbara", country: "California", map: "mapa-santabarbara.jpg", keys: "santa barbara sta. rita hills" }
];
const ZONE_PLATE = Object.fromEntries(ZONES.map(z => [z.name, z.map]));
function foldZone(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}
function zonePhrases(z) {
  const raw = foldZone(z.keys || z.name);
  return raw.split(",").map(p => p.trim()).filter(p => p.length >= 4);
}

function escapeReg(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const NO_GEMINI_NOTE = "Sin clave de Gemini en esta app. Si la guardaste en Safari, pégala también aquí: Inicio › Avisos › Precios de mercado.";
const ZONE_SKIP = new Set(["touriga", "riesling", "pinot", "garnacha", "tempranillo", "mencia", "monastrell", "bobal", "godello", "verdejo", "albarino", "alvarinho", "malvasia", "vintage", "tawny", "moscatel", "baga", "arinto", "ramisco", "semillon", "cabernet", "chardonnay", "syrah", "gewurztraminer", "prieto", "picudo", "torrontes", "malmsey", "sercial"]);
function zoneNeedles(z) {
  const needles = [];
  const name = foldZone(z.name);
  if (name.length >= 3) needles.push(name);
  foldZone(z.keys || "").split(",").forEach(chunk => {
    const phrase = chunk.trim();
    if (phrase.length >= 4) needles.push(phrase);
    phrase.split(/\s+/).forEach(word => {
      if (word.length >= 6 && !ZONE_SKIP.has(word)) needles.push(word);
    });
  });
  return needles;
}
function detectZone(text) {
  const hay = foldZone(text);
  if (!hay) return null;
  let best = null;
  let bestLen = 0;
  let bestAt = 1e9;
  ZONES.forEach(z => {
    zoneNeedles(z).forEach(needle => {
      if (needle.length < 3 || needle.length < bestLen) return;
      const re = new RegExp("(^|[^a-z0-9])" + escapeReg(needle) + "([^a-z0-9]|$)");
      const at = hay.search(re);
      if (at < 0) return;
      if (needle.length > bestLen || (needle.length === bestLen && at < bestAt)) {
        best = z;
        bestLen = needle.length;
        bestAt = at;
      }
    });
  });
  return best;
}
function countryFromBlob(text) {
  const n = foldZone(text);
  if (/\bportugal\b/.test(n)) return "Portugal";
  if (/\bespana\b|\bspain\b/.test(n)) return "España";
  if (/\bfrancia\b|\bfrance\b/.test(n)) return "Francia";
  if (/\bitalia\b|\bitaly\b/.test(n)) return "Italia";
  if (/\balemania\b|\bgermany\b/.test(n)) return "Alemania";
  if (/\bargentina\b/.test(n)) return "Argentina";
  if (/\bchile\b/.test(n)) return "Chile";
  if (/\baustralia\b/.test(n)) return "Australia";
  return "";
}
function isOpinionPage(url, title) {
  if (isProductPageUrl(url)) return false;
  const blob = normTxt((url || "") + " " + (title || ""));
  return /\b(opiniones|opinion|consejos|consejo|foro|forum|blog|review|reviews|resena|resenas|wikipedia|reddit)\b/.test(blob);
}
function titleLooksDirty(s) {
  const t = String(s || "");
  if (/[…]|\.{2,}/.test(t)) return true;
  if (/\s-\s-\s/.test(t)) return true;
  if (/\b(opiniones|consejos|vinissimus|dec[aá]ntalo|comprar|precio)\b/i.test(t)) return true;
  if (/^\s*vino\s+/i.test(t) && /\s-\s/.test(t)) return true;
  if (t.length > 72) return true;
  return false;
}
function isTitleJunk(part) {
  const n = normTxt(part);
  if (!n) return true;
  return /opiniones|consejos|vinissimus|decantalo|wine searcher|wikipedia|comprar|precio|valoraciones|reviews|resena/.test(n);
}
function peelTypePrefix(s) {
  const raw = String(s || "").trim();
  const peeled = raw.replace(/^(tinto|blanco|rosado|espumoso|generoso|red|white)\s+/i, "").trim();
  return peeled.length >= 3 ? peeled : raw;
}
function polishTitle(raw) {
  let s = String(raw || "").replace(/[…]/g, " ").replace(/\.{2,}/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s*[|]\s*.*$/, "");
  s = s.replace(/\s+[·]\s*(comprar|precio|opiniones|consejos)\b[\s\S]*$/i, "");
  s = s.replace(/\s+-\s*(opiniones|consejos|valoraciones|reviews?|comprar|precio)\b[\s\S]*$/i, "");
  s = s.replace(/\b(opiniones|consejos)\b[\s\S]*$/i, "");
  s = s.replace(/\b(vinissimus|dec[aá]ntalo|vivino|wine-searcher|wikipedia)\b[\s\S]*$/i, "");
  s = s.replace(/^\s*(comprar|vino|wine)\s+/i, "");
  s = s.replace(/(?:\s*-\s*){2,}/g, " - ");
  s = s.replace(/\s+-\s*$/g, "").replace(/^\s*-\s+/g, "");
  return s.replace(/\s+/g, " ").trim();
}
function producerFromHead(head, zone) {
  let s = String(head || "").replace(/^\s*(vino|wine|comprar)\s+/i, "").trim();
  if (zone) {
    const name = escapeReg(zone.name);
    s = s.replace(new RegExp("^" + name + "\\s+", "i"), "").trim();
    s = s.replace(new RegExp("\\s+" + name + "$", "i"), "").trim();
  }
  s = peelTypePrefix(s);
  if (!s || isTitleJunk(s)) return "";
  if (zone && foldZone(s) === foldZone(zone.name)) return "";
  return s;
}
function splitCapsProducer(segment, zone) {
  const words = String(segment || "").split(/\s+/).filter(Boolean);
  const prod = [];
  const nameWords = [];
  words.forEach(word => {
    const caps = /^[A-ZÁÉÍÓÚÜÑ0-9]{2,}$/.test(word);
    const isZone = zone && foldZone(word) === foldZone(zone.name);
    if (caps && !isZone) prod.push(word);
    else nameWords.push(word);
  });
  return { producer: prod.join(" "), name: nameWords.join(" ").trim() };
}
function identityFromTitle(raw) {
  const vintage = yearFromText(raw) || 0;
  const zone = detectZone(raw);
  const type = wineTypeFromText(raw);
  const country = (zone && zone.country) || countryFromBlob(raw);
  let s = polishTitle(raw);
  if (vintage) s = s.replace(new RegExp("\\b" + vintage + "\\b"), " ").replace(/\s+/g, " ").trim();
  const parts = s.split(/\s*(?:·|\||–|—)\s*|\s+-\s+/).map(p => p.trim()).filter(p => p && !isTitleJunk(p));
  let producer = "";
  let name = "";
  if (parts.length >= 2) {
    producer = producerFromHead(parts[0], zone);
    name = peelTypePrefix(parts.slice(1).join(" ").trim());
  } else if (parts.length === 1) {
    const split = splitCapsProducer(parts[0], zone);
    producer = split.producer;
    name = peelTypePrefix(split.name || parts[0]);
  }
  if (!name) name = peelTypePrefix(parts[0] || s);
  if (producer && normTxt(producer) === normTxt(name)) producer = "";
  if (zone && producer && foldZone(producer) === foldZone(zone.name)) producer = "";
  return {
    name: String(name || "").replace(/\s+/g, " ").trim(),
    producer: String(producer || "").replace(/\s+/g, " ").trim(),
    vintage: vintage,
    region: zone ? zone.name : "",
    appellation: zone ? zone.name : "",
    country: country || "",
    type: type || ""
  };
}
function applyCleanIdentity(wine, raw) {
  if (!wine) return null;
  const source = raw || [wine.name, wine.producer, wine.vintage].filter(Boolean).join(" ");
  const idn = identityFromTitle(source);
  wine.provenance = wine.provenance || {};
  if (!wine.provenance.rawTitle && titleLooksDirty(wine.name)) wine.provenance.rawTitle = wine.name;
  const dirty = titleLooksDirty(wine.name) || titleLooksDirty(wine.producer);
  if (idn.name && wine.provenance.name !== "página" && (dirty || !String(wine.name || "").trim())) {
    wine.name = idn.name;
    markWineSource(wine, "name", "título");
  }
  if (idn.producer && wine.provenance.producer !== "página" && (dirty || !String(wine.producer || "").trim() || titleLooksDirty(wine.producer))) {
    wine.producer = idn.producer;
    markWineSource(wine, "producer", "título");
  }
  if (idn.region && wine.provenance.region !== "página") {
    wine.region = idn.region;
    wine.appellation = idn.appellation || idn.region;
    markWineSource(wine, "region", "título");
  }
  if (idn.country && wine.provenance.country !== "página") {
    wine.country = idn.country;
    markWineSource(wine, "country", "título");
  }
  if (idn.type && wine.provenance.type !== "página") {
    wine.type = idn.type;
    wine.color = colorForWineType(idn.type);
    markWineSource(wine, "type", "título");
  }
  if (idn.vintage) {
    const current = Number(wine.vintage) || 0;
    if (!current || current === YEAR || dirty) wine.vintage = idn.vintage;
  }
  return idn;
}
function identityAgrees(blob, next, current) {
  const proposed = normTxt(next);
  if (!proposed) return false;
  const words = proposed.split(" ").filter(t => t.length >= 4);
  const known = normTxt(current);
  if (!words.length) return blob.includes(proposed) || known.includes(proposed);
  return words.some(t => blob.includes(t) || known.includes(t));
}
function acceptableIdentityText(value) {
  const s = clipText(value, 80);
  if (s.length < 2 || s.length > 80) return "";
  if (/https?:|opiniones|consejos|vinissimus|comprar|precio|\.{2,}/i.test(s)) return "";
  return s;
}
function applyGeminiIdentity(wine, raw) {
  if (!wine || !raw || typeof raw !== "object") return;
  wine.provenance = wine.provenance || {};
  const blob = normTxt([wine.provenance.rawTitle, wine.provenance.pageExcerpt, wine.provenance.pageUrl, wine.name, wine.producer].filter(Boolean).join(" "));
  const producer = acceptableIdentityText(raw.producer);
  if (producer && wine.provenance.producer !== "página" && identityAgrees(blob, producer, wine.producer)) {
    wine.producer = producer;
    markWineSource(wine, "producer", "estimación Gemini");
  }
  const name = acceptableIdentityText(raw.name);
  if (name && wine.provenance.name !== "página" && identityAgrees(blob, name, wine.name)) {
    wine.name = name;
    markWineSource(wine, "name", "estimación Gemini");
  }
  const year = Math.round(Number(raw.vintage));
  const mentioned = [wine.provenance.rawTitle, wine.provenance.pageExcerpt, wine.provenance.pageUrl, wine.name, String(wine.vintage || "")].join(" ").includes(String(year));
  const currentYear = Number(wine.vintage) || 0;
  if (year >= 1950 && year <= YEAR + 1 && (mentioned || !currentYear || currentYear === YEAR)) wine.vintage = year;
  const zone = detectZone([raw.region, raw.country, raw.name].filter(Boolean).join(" "));
  if (wine.provenance.region !== "página") {
    if (zone) {
      wine.region = zone.name;
      wine.appellation = zone.name;
      markWineSource(wine, "region", "estimación Gemini");
    } else {
      const region = acceptableIdentityText(raw.region);
      if (region) {
        wine.region = region;
        wine.appellation = region;
        markWineSource(wine, "region", "estimación Gemini");
      }
    }
  }
  if (wine.provenance.country !== "página") {
    const named = countryNameFrom(raw.country || "");
    const country = named || (zone && zone.country) || "";
    if (country && country.length < 40) {
      wine.country = country;
      markWineSource(wine, "country", "estimación Gemini");
    }
  }
  if (wine.provenance.type !== "página") {
    const type = wineTypeFromText(raw.type || "");
    if (type) {
      wine.type = type;
      wine.color = colorForWineType(type);
      markWineSource(wine, "type", "estimación Gemini");
    }
  }
}
function winesInZone(z) {
  const phrases = zonePhrases(z);
  const zoneName = foldZone(z.name);
  return WINE_CATALOG.filter(w => {
    const hay = foldZone([w.region, w.appellation, w.country].join(" "));
    if (zoneName.length >= 4 && hay.includes(zoneName)) return true;
    return phrases.some(p => hay.includes(p));
  });
}
function renderZonas(q) {
  const query = (q || "").trim().toLowerCase();
  const list = ZONES.filter(z => !query || (z.name + " " + z.country + " " + z.keys).toLowerCase().includes(query));
  const groups = [];
  list.forEach(z => {
    const last = groups[groups.length - 1];
    if (!last || last.country !== z.country) groups.push({ country: z.country, items: [z] });
    else last.items.push(z);
  });
  const html = groups.map(g => {
    const tiles = g.items.map(z => {
      const n = winesInZone(z).length;
      const plate = ZONE_PLATE[z.name] || z.map;
      return `<button class="zone-tile" onclick="openZona('${z.name.replace(/'/g, "\\'")}')">
        <img src="${plate}" alt="${z.name}">
        <span><b>${z.name}</b><small>${z.country} · ${n} vino${n === 1 ? "" : "s"}</small></span>
      </button>`;
    }).join("");
    return `<p class="cal-h">${g.country} · ${g.items.length}</p><div class="zone-grid">${tiles}</div>`;
  }).join("");
  $("#zonas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">Mi Vinoteca</p>
    <h1>Zonas vinícolas</h1>
    <div class="search" style="margin:12px 0"><input id="zona-q" type="search" placeholder="Rioja, Douro, Champagne, Napa…" value="${(q || "").replace(/"/g, "")}" oninput="renderZonas(this.value)"></div>
    <p class="muted">Placa grabada de cada zona. El nombre va debajo del mapa.</p>
    ${html || "<p class='empty'>Ninguna zona con ese nombre.</p>"}`;
  const box = $("#zona-q");
  if (box && query) { box.focus(); box.setSelectionRange(query.length, query.length); }
}
function openZona(name) {
  const z = ZONES.find(x => x.name === name);
  if (!z) return renderZonas();
  const wines = winesInZone(z);
  $("#zonas-body").innerHTML = `
    <button class="back" onclick="renderZonas()">‹ Zonas</button>
    ${z.map ? `<img class="map-art" src="${z.map}" alt="Mapa ${z.name}">` : ""}
    <p class="eyebrow" style="font-size:10px;letter-spacing:.14em;margin:2px 0 0">${z.country}</p>
    <h1 style="font-size:20px;margin:2px 0 4px;line-height:1.2">${z.name}</h1>
    <p class="muted" style="margin:0 0 12px;font-size:13px">${wines.length} vino${wines.length === 1 ? "" : "s"} en catálogo</p>
    ${wines.map(w => `<div class="card" role="button" onclick="openWine('${w.id}')">
      <div class="row"><h3>${w.producer}</h3><span class="tiny">${w.vintage}</span></div>
      <p class="muted">${w.name} · ${w.appellation}</p>
    </div>`).join("") || "<p class='empty'>Aún no hay botellas de esta zona.</p>"}
    ${wines[0] ? `<button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWine('${wines[0].id}');setTimeout(()=>openWineSub('mapa'),80)">Mapa de bodega ›</button>` : ""}`;
}

function renderCatas() {
  const list = lastTastings(20);
  $("#catas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">Mi Vinoteca</p>
    <h1>Catas</h1>
    <button class="btn btn-gold" style="width:100%;margin:10px 0" onclick="quickTaste()">Cata rápida</button>
    ${list.length ? list.map(t => `<div class="card" role="button" onclick="openWineThenTaste('${t.wine.id}')">
      <div class="row"><h3>${t.wine.producer}</h3><span class="tiny">${t.when}</span></div>
      <p class="muted">${t.wine.name} ${t.wine.vintage}</p>
      <p class="tiny" style="margin-top:6px">${t.note || "Cuaderno sin recuerdo"}</p>
    </div>`).join("") : `<p class="empty">Todavía no hay catas. Usa Cata rápida.</p>`}`;
}

function cellarName(id) {
  return (state.vinotecas.find(v => v.id === id) || { name: "—" }).name;
}

function homeWineTile(w) {
  const p = phaseOf(w);
  return `<button class="wine-tile" onclick="openWine('${w.id}')">
    <div class="tile-bot" style="--c:${w.color}"></div>
    <b>${w.producer.replace("R. ", "")}</b>
    <span>${shortWineName(w)}</span>
    <em>${w.vintage}</em>
    <small class="${p.key}">${p.label}</small>
  </button>`;
}

function shortWineName(w) {
  if (!w) return "";
  const n = (w.name || "").replace("Reserva", "").replace("Gran Reserva", "").trim();
  const last = (w.producer || "").split(" ").slice(-1)[0];
  return n.length > 2 ? n : last;
}
function pairLabel(w) {
  if (!w) return "";
  const prod = w.producer || "";
  const short = shortWineName(w);
  if (!short || prod.toLowerCase().includes(short.toLowerCase()) || short.toLowerCase().includes(prod.toLowerCase())) {
    return prod || short;
  }
  return (prod + " " + short).trim();
}

function bottleCard(b) {
  const w = wineById(b.wineId);
  const p = phaseOf(w);
  const title = `${shortWineName(w)}${b.bin ? " " + b.bin : ""}`;
  const kind = w.type === "tinto" ? "Tinto" : w.type === "blanco" ? "Blanco" : w.type === "espumoso" ? "Espumoso" : w.type;
  return `<div class="inv-card" role="button" onclick="openBottle('${b.uid}')">
    <div class="inv-sil" style="--c:${w.color}" aria-hidden="true"></div>
    <div class="inv-meta">
      <div class="row">
        <h3>${w.producer.split(" ").slice(0, 3).join(" ")}</h3>
        <span class="badge ${p.key}">${p.label}</span>
      </div>
      <p class="inv-title">${title}</p>
      <p class="muted">${w.region} · ${kind} · ${w.vintage}${state.prefs.hideBin ? "" : (b.bin ? " · " + b.bin : "")} · ${b.qty} botella${b.qty>1?"s":""}</p>
    </div>
    <div class="inv-score">★ ${w.ratings.parker.score}</div>
  </div>`;
}

function renderCaves() {
  syncUsed();
  const icoBot = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3h6l-1 8a4 4 0 1 1-4 0L9 3z"/><path d="M10 21h4"/></svg>`;
  const icoTemp = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v10.2A3.2 3.2 0 1 1 9.6 16"/><path d="M12 3h2M12 7h1.6"/></svg>`;
  $("#caves-list").innerHTML = state.vinotecas.map(v => {
    const shot = v.photo || (v.role === "prestige" ? "cave-render-sommeliere.jpg" : "cave-render-eurocave.jpg");
    const role = v.role === "prestige" ? "Prestigiosas" : "De guarda";
    return `<article class="cave-lux" role="button" tabindex="0" onclick="openCave('${v.id}')">
      <img src="${shot}" alt="${v.name}" onerror="this.src='cave-principal.jpg'">
      <div class="cave-lux-copy">
        <h3>${v.name}</h3>
        <p class="cave-lux-brand">${v.brand}${v.house ? " · " + v.house : ""}</p>
        <p class="cave-lux-role">${role}</p>
        <i class="cave-lux-rule"></i>
        <p class="cave-lux-stat">${icoBot}<b>${v.used}/${v.capacity}</b></p>
        <p class="cave-lux-stat">${icoTemp}<b>${v.tHigh.toFixed(1)}° C</b></p>
      </div>
    </article>`;
  }).join("");
}

function syncUsed() {
  state.vinotecas.forEach(v => {
    v.used = state.bottles.filter(b => b.cellarId === v.id).reduce((n, b) => n + b.qty, 0);
  });
}

function openCave(id) {
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  ensureCaveSlots(v);
  $("#cave-house").textContent = v.house || v.brand || "Casa Llavaneras";
  $("#cave-title").textContent = v.name;
  $("#cave-detail").innerHTML = `
    <p class="muted">${v.brand}${v.role === "prestige" ? " · reserva de las botellas más caras" : ""}</p>
    <img class="cave-photo" src="${v.photo || "cave-render-sommeliere.jpg"}" alt="${v.name}" onerror="this.src='cave-principal.jpg'" />
    <h2>Temperatura</h2>
    <div class="temp-grid" style="margin:12px 0">
      <label class="temp"><span class="tiny">Zona alta °C</span><input id="cave-thigh" type="number" step="0.1" value="${Number(v.tHigh).toFixed(1)}" style="width:100%;background:transparent;border:0;color:#c9a227;font:700 22px inherit" /></label>
      <label class="temp"><span class="tiny">Zona baja °C</span><input id="cave-tlow" type="number" step="0.1" value="${Number(v.tLow || v.tHigh).toFixed(1)}" style="width:100%;background:transparent;border:0;color:#c9a227;font:700 22px inherit" /></label>
    </div>
    <label class="field"><span>Humedad %</span><input id="cave-hr" type="number" value="${v.humidity || 65}" /></label>
    <button class="btn btn-gold" style="width:100%;margin:8px 0" onclick="saveCaveTemp('${v.id}')">Modificar temperatura</button>
    <h2>Mapa de huecos</h2>
    ${rackGrid(id)}
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="openSpaceSheet('${v.id}')">Añadir espacios</button>
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="deleteCave('${v.id}')">Dar de baja esta vinoteca</button>`;
  show("cave-detail-screen");
}

function saveCaveTemp(id) {
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  const hi = parseFloat($("#cave-thigh").value);
  const lo = parseFloat($("#cave-tlow").value);
  const hr = parseInt($("#cave-hr").value, 10);
  if (!Number.isFinite(hi) || hi < 0 || hi > 25) return toast("Temperatura no válida");
  v.tHigh = Math.round(hi * 10) / 10;
  v.tLow = Number.isFinite(lo) ? Math.round(lo * 10) / 10 : v.tHigh;
  if (Number.isFinite(hr)) v.humidity = hr;
  save();
  toast("Temperatura guardada · " + v.tHigh.toFixed(1) + " °C");
  openCave(id);
}

function slotCode(n) {
  return "E-" + String(n).padStart(2, "0");
}
function slotNumber(code) {
  const m = String(code || "").match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}
function ensureCaveSlots(v) {
  if (v.slots && v.slots.length) return v.slots;
  const fromRack = rackSlots(v.id);
  const seen = new Set();
  v.slots = fromRack.filter(code => {
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });
  save();
  return v.slots;
}
function nextSlotNumbers(v, count) {
  const used = new Set((v.slots || []).map(slotNumber));
  state.bottles.filter(b => b.cellarId === v.id && b.bin).forEach(b => used.add(slotNumber(b.bin)));
  const out = [];
  let n = 1;
  while (out.length < count) {
    if (!used.has(n)) {
      out.push(slotCode(n));
      used.add(n);
    }
    n += 1;
    if (n > 500) break;
  }
  return out;
}
function openSpaceSheet(id) {
  currentCaveId = id;
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  ensureCaveSlots(v);
  const hint = $("#space-hint");
  if (hint) hint.textContent = v.name + " · " + v.slots.length + " espacios. El siguiente sigue el orden E-01, E-02…";
  const select = $("#space-existing");
  if (select) {
    const mine = new Set(v.slots);
    const codes = [];
    state.vinotecas.forEach(other => {
      ensureCaveSlots(other);
      other.slots.forEach(code => { if (!mine.has(code) && !codes.includes(code)) codes.push(code); });
    });
    select.innerHTML = codes.length
      ? codes.map(c => `<option value="${c}">${c}</option>`).join("")
      : `<option value="">No hay espacios libres en otras vinotecas</option>`;
  }
  showSheet("space-sheet");
}
function addSequentialSpaces() {
  const v = state.vinotecas.find(x => x.id === currentCaveId);
  if (!v) return;
  ensureCaveSlots(v);
  const count = Math.max(1, parseInt(($("#space-count") && $("#space-count").value) || "1", 10));
  const fresh = nextSlotNumbers(v, count);
  fresh.forEach(code => { if (!v.slots.includes(code)) v.slots.push(code); });
  v.slots.sort((a, b) => slotNumber(a) - slotNumber(b) || a.localeCompare(b));
  v.capacity = Math.max(v.capacity || 0, v.slots.length);
  save();
  hideSheets();
  toast(fresh.length + " espacios añadidos");
  openCave(v.id);
}
function assignExistingSpace() {
  const v = state.vinotecas.find(x => x.id === currentCaveId);
  const code = $("#space-existing") && $("#space-existing").value;
  if (!v || !code) return toast("No hay espacio para asignar");
  ensureCaveSlots(v);
  if (v.slots.includes(code)) return toast("Ese espacio ya está en esta vinoteca");
  v.slots.push(code);
  v.slots.sort((a, b) => slotNumber(a) - slotNumber(b) || a.localeCompare(b));
  v.capacity = Math.max(v.capacity || 0, v.slots.length);
  save();
  hideSheets();
  toast("Espacio " + code + " asignado");
  openCave(v.id);
}
function previewNewSlots() {
  const n = Math.max(1, parseInt(($("#new-cave-slots") && $("#new-cave-slots").value) || "12", 10));
  const el = $("#new-slots-preview");
  if (el) el.textContent = "Se crearán " + Array.from({ length: Math.min(n, 6) }, (_, i) => slotCode(i + 1)).join(", ") + (n > 6 ? "…" : "");
}

let cellarView = "botellas";
let currentCaveId = "";
function setCellarView(v) {
  cellarView = v;
  renderCellar();
}
function fold(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function wineHay(w, extra) {
  if (!w) return "";
  return fold([w.producer, w.name, w.vintage, w.region, w.appellation, w.type, (w.aliases || []).join(" "), w.priceHint, extra || ""].join(" "));
}
function catalogWines() {
  return WINE_CATALOG.concat(state.customWines || []);
}
function renderCellar() {
  const q = fold($("#cellar-q")?.value || "");
  const typeOk = (w) => filterType === "todos" || w.type === filterType || (filterType === "rosado" && w.type === "rose");
  let list = state.bottles.filter(b => {
    const w = wineById(b.wineId);
    if (!w) return false;
    const hay = wineHay(w, cellarName(b.cellarId) + " " + (b.bin || ""));
    return typeOk(w) && (!q || hay.includes(q));
  });
  const tabs = [["botellas","Botellas"],["productores","Productores"],["lotes","Lotes"],["ubicaciones","Ubicaciones"]];
  const tabHtml = `<div class="chip-row" style="margin:0 0 10px">${tabs.map(([k,l]) => `<button class="chip ${cellarView===k?"on":""}" onclick="setCellarView('${k}')">${l}</button>`).join("")}</div>`;
  let body = "";
  if (cellarView === "productores") {
    const by = {};
    list.forEach(b => {
      const w = wineById(b.wineId);
      (by[w.producer] || (by[w.producer] = [])).push(b);
    });
    body = Object.keys(by).sort().map(p => {
      const qty = by[p].reduce((n, x) => n + x.qty, 0);
      const w = wineById(by[p][0].wineId);
      return `<div class="card" role="button" onclick="openWine('${w.id}')"><div class="row"><h3>${p}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[p].length} lote${by[p].length>1?"s":""}</p><button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeWineLots('${w.id}')">Quitar</button></div>`;
    }).join("");
  } else if (cellarView === "lotes") {
    body = list.map(b => {
      const w = wineById(b.wineId);
      return `<div class="card" role="button" onclick="openBottle('${b.uid}')"><div class="row"><h3>${w.producer}</h3><span class="tiny">×${b.qty}</span></div><p class="muted">${w.name} ${w.vintage}</p><p class="tiny">${cellarName(b.cellarId)} · ${state.prefs.hideBin ? "hueco oculto" : (b.bin || "sin hueco")}</p><button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeLot('${b.uid}')">Quitar lote</button></div>`;
    }).join("");
  } else if (cellarView === "ubicaciones") {
    const by = {};
    list.forEach(b => {
      const key = cellarName(b.cellarId) + " · " + (state.prefs.hideBin ? "—" : (b.bin || "sin hueco"));
      (by[key] || (by[key] = [])).push(b);
    });
    body = Object.keys(by).sort().map(k => {
      const qty = by[k].reduce((n, x) => n + x.qty, 0);
      const first = by[k][0];
      return `<div class="card" role="button" onclick="openCave('${first.cellarId}')"><div class="row"><h3>${k}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[k].map(b => wineById(b.wineId).name).join(" · ")}</p></div>`;
    }).join("");
  } else {
    const byWine = {};
    list.forEach(b => { (byWine[b.wineId] || (byWine[b.wineId] = [])).push(b); });
    body = Object.keys(byWine).map(id => wineStockCard(byWine[id])).join("");
  }
  const stockIds = new Set(state.bottles.map(b => b.wineId));
  const catalog = q ? catalogWines().filter(w => typeOk(w) && !stockIds.has(w.id) && wineHay(w).includes(q)).slice(0, 12) : [];
  const catalogHtml = catalog.length ? `<p class="tiny" style="margin:14px 0 8px">En catálogo, no en cava</p>` + catalog.map(catalogHit).join("") : "";
  const empty = !body && !catalogHtml ? `<p class="empty">${q ? "Sin coincidencias para «" + ($("#cellar-q").value || "") + "»." : "La cava está vacía. Escanea o añade a mano."}</p>` : "";
  $("#cellar-list").innerHTML = tabHtml + body + catalogHtml + empty;
}
function catalogHit(w) {
  return `<div class="inv-card" role="button" onclick="openWine('${w.id}')">
    <div class="inv-sil" style="--c:${w.color || "#6a1a22"}"></div>
    <div class="inv-meta">
      <div class="row"><h3>${w.producer.split(" ").slice(0,3).join(" ")}</h3><span class="badge">Catálogo</span></div>
      <p class="inv-title">${w.name} ${w.vintage}</p>
      <p class="muted">${w.appellation || w.region} · ${w.priceHint || "sin horquilla"}</p>
    </div>
  </div>`;
}
function removeLot(uid) {
  const b = state.bottles.find(x => x.uid === uid);
  if (!b) return;
  const w = wineById(b.wineId);
  if (!confirm("Quitar este lote" + (w ? " de " + w.name : "") + " del listado?")) return;
  state.bottles = state.bottles.filter(x => x.uid !== uid);
  save();
  renderCellar();
  toast("Lote quitado");
}
function removeWineLots(wineId) {
  const w = wineById(wineId);
  const n = state.bottles.filter(b => b.wineId === wineId).reduce((s, b) => s + b.qty, 0);
  if (!n) return;
  if (!confirm("Quitar " + n + " botella" + (n > 1 ? "s" : "") + (w ? " de " + w.name : "") + " del inventario?")) return;
  state.bottles = state.bottles.filter(b => b.wineId !== wineId);
  save();
  renderCellar();
  toast("Quitado del listado");
}

function wineStockCard(lots) {
  const b = lots[0];
  const w = wineById(b.wineId);
  const p = phaseOf(w);
  const qty = lots.reduce((n, x) => n + x.qty, 0);
  const locs = lots.map(x => `${cellarName(x.cellarId)} ${state.prefs.hideBin ? "" : (x.bin || "")} ×${x.qty}`.trim()).join(" · ");
  return `<div class="inv-card" role="button" onclick="openWine('${w.id}')">
    <div class="inv-sil" style="--c:${w.color}"></div>
    <div class="inv-meta">
      <div class="row"><h3>${w.producer.split(" ").slice(0,3).join(" ")}</h3><span class="badge ${p.key}">${p.label}</span></div>
      <p class="inv-title">${w.name} ${w.vintage}</p>
      <p class="muted">${qty} botella${qty>1?"s":""} · ${lots.length} lote${lots.length>1?"s":""}</p>
      <p class="tiny">${locs}</p>
      <button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeWineLots('${w.id}')">Quitar del listado</button>
    </div>
    <div class="inv-score">★ ${w.ratings.parker.score}</div>
  </div>`;
}

function renderCalendar() {
  const groups = { wait: [], ok: [], warn: [], late: [] };
  state.bottles.forEach(b => groups[phaseOf(wineById(b.wineId)).key].push(b));
  $("#calendar-list").innerHTML = `
    ${calBlock("Beber ahora", groups.ok)}
    ${calBlock("Beber pronto", groups.warn)}
    ${calBlock("Aguardar", groups.wait)}
    ${calBlock("Riesgo de declive", groups.late)}`;
}

function calBlock(title, arr) {
  if (!arr.length) return "";
  return `<h2 class="cal-h">${title}</h2>` + arr.map(b => {
    const w = wineById(b.wineId);
    const pr = progressOf(w);
    const mark = drinkWindowMarks(pr);
    return `<div class="cal-card" role="button" onclick="openBottle('${b.uid}')">
      <div class="cal-top">
        <div class="inv-sil" style="--c:${w.color}"></div>
        <div>
          <h3>${shortWineName(w)}</h3>
          <p class="muted">${w.name} ${w.vintage}</p>
          <p class="tiny">${datesAreReal(w) ? "Beber hasta " + w.aging.peakEnd : "Beber hasta Sin dato"}</p>
        </div>
      </div>
      <div class="win-row">
        <span class="tiny">Ventana de consumo</span>
        <span class="tiny win-left">${datesAreReal(w) ? yearsUntilPeakEnd(w.aging.peakEnd) : "Sin dato"}</span>
      </div>
      <div class="win-bar" role="img" aria-label="Apogeo de ${w.aging.peakStart} a ${w.aging.peakEnd}. Año actual ${YEAR}.">
        <span class="win-peak" style="left:${mark.left}%;width:${mark.width}%"></span>
        <span class="win-now" style="left:${mark.now}%" title="Año ${YEAR}"></span>
      </div>
    </div>`;
  }).join("");
}

function rackSlots(cellarId) {
  const v = state.vinotecas.find(x => x.id === cellarId);
  if (v && v.slots && v.slots.length) {
    const extra = state.bottles.filter(b => b.cellarId === cellarId && b.bin && !v.slots.includes(b.bin)).map(b => b.bin);
    return [...v.slots, ...extra.filter((c, i, a) => a.indexOf(c) === i)];
  }
  const rows = cellarId === "v1" ? ["A", "B", "C", "D", "E"] : ["A", "B", "C"];
  const cols = cellarId === "v1" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];
  const base = [];
  rows.forEach(r => cols.forEach(c => base.push(`${r}-${String(c).padStart(2, "0")}`)));
  const extra = state.bottles.filter(b => b.cellarId === cellarId && b.bin && !base.includes(b.bin)).map(b => b.bin);
  return [...base, ...extra];
}

function rackGrid(cellarId) {
  const list = state.bottles.filter(b => b.cellarId === cellarId);
  const byBin = {};
  list.forEach(b => { if (b.bin) byBin[b.bin] = b; });
  const pending = {};
  (state.inbox || []).forEach(r => {
    if (!r.entered && r.cellarId === cellarId && r.bin && !byBin[r.bin]) pending[r.bin] = r;
  });
  return `<div class="rack">${rackSlots(cellarId).map(code => {
    const b = byBin[code];
    if (b) {
      const w = wineById(b.wineId);
      return `<button class="rack-slot" onclick="openBottle('${b.uid}')">
        <b>${code}</b>
        <small>${w.producer.split(" ").slice(-2).join(" ")} ${shortWineName(w)} ${w.vintage}</small>
        <span class="rack-dot"></span>
      </button>`;
    }
    const p = pending[code];
    if (p) {
      const w = wineById(p.wineId);
      const name = w ? (w.producer.split(" ").slice(-2).join(" ") + " " + w.vintage) : "Alta";
      return `<button class="rack-slot" onclick="openWine('${p.wineId}')">
        <b>${code}</b>
        <small>${name} · pendiente</small>
        <span class="rack-dot"></span>
      </button>`;
    }
    return `<div class="rack-slot empty"><b>${code}</b><small>—</small><span class="rack-dot off"></span></div>`;
  }).join("")}</div>`;
}

function openBottle(uid) {
  const b = state.bottles.find(x => x.uid === uid);
  currentBottle = b;
  openWine(b.wineId, b);
}

function starsRow(score5) {
  const full = Math.round(score5);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

const PRODUCER_ART = {
  "Château Margaux": { land: "vinedo-margaux.jpg", cap: "capsula-margaux.jpg", map: "mapa-medoc.jpg" },
  "Vega Sicilia": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" },
  "Dominio de Pingus": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" },
  "R. López de Heredia": { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
  "Marqués de Riscal": { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
  "CVNE": { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
  "Bodegas Muga": { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
  "Marqués de Murrieta": { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
  "Pazo de Señoráns": { land: "vinedo-rias.jpg", cap: "capsula.jpg", map: "mapa-rias.jpg" },
  "Álvaro Palacios": { land: "vinedo-priorat.jpg", cap: "capsula.jpg", map: "mapa-priorat.jpg" },
  "Scala Dei": { land: "vinedo-priorat.jpg", cap: "capsula.jpg", map: "mapa-priorat.jpg" },
  "Moët & Chandon": { land: "vinedo-champagne.jpg", cap: "capsula.jpg", map: "mapa-champagne.jpg" },
  "Gramona": { land: "vinedo-champagne.jpg", cap: "capsula.jpg", map: "mapa-penedes.jpg" },
  "Tenuta San Guido": { land: "vinedo-bolgheri.jpg", cap: "capsula.jpg", map: "mapa-bolgheri.jpg" },
  "Penfolds": { land: "vinedo-margaux.jpg", cap: "capsula.jpg", map: "mapa-barossa.jpg" },
  "Enrique Mendoza": { land: "vinedo.jpg", cap: "capsula.jpg", map: "mapa-alicante.jpg" },
  "Numanthia": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-toro.jpg" }
};
const GEO_COUNTRY = {
  espana: "España", portugal: "Portugal", francia: "France", italia: "Italy",
  alemania: "Germany", argentina: "Argentina", chile: "Chile", australia: "Australia",
  sudafrica: "South Africa", austria: "Austria", grecia: "Greece",
  "nueva zelanda": "New Zealand", "estados unidos": "United States"
};
const platePending = new Set();
const plateMiss = new Set();
const outlineMemo = new Map();
let nominatimWait = Promise.resolve();

function plateCache() {
  if (!state.plateCache || typeof state.plateCache !== "object") state.plateCache = {};
  return state.plateCache;
}
function plateTitle(s) {
  return String(s || "").trim().replace(/\s+/g, " ").toLocaleUpperCase("es");
}
function xmlEsc(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function svgDataUrl(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function geoCountryName(country) {
  const folded = foldZone(country);
  return GEO_COUNTRY[folded] || country || "";
}
function fixedZoneOf(w) {
  if (!w) return null;
  const place = [w.region, w.appellation, w.country].filter(Boolean).join(" ");
  return detectZone(place) || detectZone([w.name, w.producer].filter(Boolean).join(" "));
}
function zonePlateKey(w) {
  return "z:" + foldZone(w.region || w.appellation || w.country || "");
}
function wineryPlateKey(w) {
  return "b:" + foldZone(w.producer || "") + "|" + foldZone(w.region || w.country || "");
}
function nominatimSlot() {
  const next = nominatimWait.then(() => new Promise(resolve => setTimeout(resolve, 1100)));
  nominatimWait = next.then(() => {}, () => {});
  return next;
}
function parseJsonSlice(text, openCh, closeCh) {
  const s = String(text || "");
  const start = s.indexOf(openCh);
  const end = s.lastIndexOf(closeCh);
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(s.slice(start, end + 1)); }
  catch (e) { return null; }
}
async function nominatimSearch(params) {
  await nominatimSlot();
  const q = new URLSearchParams();
  Object.keys(params || {}).forEach(k => {
    if (params[k] != null && params[k] !== "") q.set(k, String(params[k]));
  });
  if (!q.get("format")) q.set("format", "jsonv2");
  const url = "https://nominatim.openstreetmap.org/search?" + q.toString();
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (e) {}
  try {
    const text = await readPublicPage(url);
    const data = parseJsonSlice(text, "[", "]");
    return Array.isArray(data) ? data : [];
  } catch (e) {}
  return [];
}
async function nominatimReverse(lat, lon) {
  await nominatimSlot();
  const url = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.lat) return data;
    }
  } catch (e) {}
  try {
    const text = await readPublicPage(url);
    const data = parseJsonSlice(text, "{", "}");
    return data && data.lat ? data : null;
  } catch (e) {}
  return null;
}
function ringArea(ring) {
  let area = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i];
    const q = ring[(i + 1) % ring.length];
    area += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(area / 2);
}
function geoOuterRings(geo) {
  if (!geo) return [];
  if (geo.type === "Polygon") return (geo.coordinates || []).slice(0, 1).filter(r => r && r.length > 3);
  if (geo.type === "MultiPolygon") {
    const rings = (geo.coordinates || []).map(poly => poly && poly[0]).filter(r => r && r.length > 3);
    rings.sort((a, b) => ringArea(b) - ringArea(a));
    return rings.slice(0, 6);
  }
  return [];
}
function bboxOf(rings) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  rings.forEach(ring => ring.forEach(p => {
    if (p[0] < minX) minX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] > maxY) maxY = p[1];
  }));
  return { minX, minY, maxX, maxY };
}
function distPointSeg(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy || 1e-12;
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function simplifyRing(points, tol) {
  if (points.length <= 8) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const pair = stack.pop();
    const a = pair[0];
    const b = pair[1];
    let maxD = 0;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = distPointSeg(points[i], points[a], points[b]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (idx >= 0 && maxD > tol) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
  return out.length >= 4 ? out : points.slice();
}
function prepRings(rings) {
  if (!rings.length) return [];
  const span = Math.max(bboxOf(rings).maxX - bboxOf(rings).minX, bboxOf(rings).maxY - bboxOf(rings).minY, 1e-6);
  const tol = span * 0.012;
  return rings.map(ring => simplifyRing(ring, tol)).filter(ring => ring.length >= 4);
}
function polygonScore(item, query) {
  const geo = item && item.geojson;
  if (!geo || (geo.type !== "Polygon" && geo.type !== "MultiPolygon")) return -1;
  const cat = String(item.category || item.class || "");
  const typ = String(item.type || "");
  if (/highway|building|shop|amenity|tourism|waterway|natural|railway|aeroway|man_made/.test(cat + " " + typ)) return -1;
  let score = 0;
  if (cat === "boundary") score += 5;
  if (cat === "place") score += 2;
  if (/administrative|region|county|state|province|island|protected/.test(typ)) score += 3;
  const token = foldZone(String(query || "").split(",")[0]);
  const name = foldZone((item.name || "") + " " + (item.display_name || ""));
  if (token && token.length >= 3 && name.includes(token)) score += 4;
  const rings = geoOuterRings(geo);
  if (!rings.length) return -1;
  const box = bboxOf(rings);
  const area = Math.max(0, box.maxX - box.minX) * Math.max(0, box.maxY - box.minY);
  if (area < 1e-7) return -1;
  score += Math.min(3, Math.log10(area + 1e-6) + 3);
  return score;
}
function pickOutline(rows, query) {
  let best = null;
  let score = -1;
  (rows || []).forEach(row => {
    const next = polygonScore(row, query);
    if (next > score) { score = next; best = row; }
  });
  return score >= 2 ? best : null;
}
function outlineFromHit(hit, fallback) {
  const rings = prepRings(geoOuterRings(hit.geojson));
  if (!rings.length) return null;
  const addr = hit.address || {};
  return {
    rings,
    bbox: bboxOf(rings),
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    fallback: fallback || "region",
    country: addr.country || "",
    localName: hit.name || addr.city || addr.town || addr.village || addr.state || ""
  };
}
function zoneQueries(w) {
  const region = String((w && (w.region || w.appellation)) || "").trim();
  const country = geoCountryName((w && w.country) || "");
  const local = String((w && w.country) || "").trim();
  const list = [];
  if (region && country) list.push(region + ", " + country);
  if (region && local && foldZone(local) !== foldZone(country)) list.push(region + ", " + local);
  if (region) list.push(region);
  if (country) list.push(country);
  return list.filter((q, i) => q && list.indexOf(q) === i);
}
async function nominatimPolygons(q, threshold) {
  let rows = await nominatimSearch({ q, polygon_geojson: "1", polygon_threshold: String(threshold), limit: "6" });
  const heavy = rows.some(row => JSON.stringify(row.geojson || "").length > 90000);
  if (heavy) rows = await nominatimSearch({ q, polygon_geojson: "1", polygon_threshold: "0.03", limit: "4" });
  return rows;
}
async function resolveOutline(w) {
  const queries = zoneQueries(w);
  const memoKey = queries.join("|");
  if (outlineMemo.has(memoKey)) return outlineMemo.get(memoKey);
  let hint = null;
  let found = null;
  for (let i = 0; i < queries.length; i++) {
    const rows = await nominatimPolygons(queries[i], i === queries.length - 1 ? 0.02 : 0.0025);
    if (!hint && rows[0] && rows[0].address) hint = rows[0].address;
    const best = pickOutline(rows, queries[i]);
    if (best) {
      const kind = foldZone(queries[i]) === foldZone(geoCountryName(w.country || "")) ? "country" : "region";
      found = outlineFromHit(best, kind);
      break;
    }
  }
  if (!found && hint) {
    const prov = hint.state || hint.province || hint.county || "";
    const country = hint.country || geoCountryName(w.country || "");
    const extra = [];
    if (prov && country) extra.push({ q: prov + ", " + country, kind: "province" });
    if (country) extra.push({ q: country, kind: "country" });
    for (let i = 0; i < extra.length; i++) {
      const rows = await nominatimPolygons(extra[i].q, extra[i].kind === "country" ? 0.03 : 0.012);
      const best = pickOutline(rows, extra[i].q);
      if (best) { found = outlineFromHit(best, extra[i].kind); break; }
    }
  }
  if (found) outlineMemo.set(memoKey, found);
  return found;
}
function placeLabel(hit) {
  const addr = (hit && hit.address) || {};
  return addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || hit.name || "";
}
async function geocodePin(w, outline) {
  const memoKey = foldZone(w.producer || "") + "|" + outline.lat + "," + outline.lon;
  if (outline.pin && outline.pinKey === memoKey) return outline.pin;
  const q = [w.producer, w.region || w.appellation, geoCountryName(w.country || "")].filter(Boolean).join(", ");
  const lat0 = Number(outline.lat);
  const lon0 = Number(outline.lon);
  const fallback = { lat: lat0, lon: lon0, label: outline.localName || w.region || w.country || "" };
  let pin = fallback;
  if (w.producer) {
    const rows = await nominatimSearch({ q, limit: "1" });
    const hit = rows[0];
    if (hit) {
      const lat = Number(hit.lat);
      const lon = Number(hit.lon);
      const box = outline.bbox;
      const span = Math.max(box.maxX - box.minX, box.maxY - box.minY, 0.25);
      if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat - lat0) <= span * 2.2 && Math.abs(lon - lon0) <= span * 2.2) {
        pin = { lat, lon, label: placeLabel(hit) || fallback.label };
      }
    }
  }
  outline.pin = pin;
  outline.pinKey = memoKey;
  return pin;
}
async function nearbyTowns(pin, outline) {
  if (outline.towns && outline.townPin === pin.label) return outline.towns;
  const box = outline.bbox;
  const dlat = Math.max(0.05, Math.min(0.55, (box.maxY - box.minY) * 0.32));
  const dlon = Math.max(0.05, Math.min(0.7, (box.maxX - box.minX) * 0.32));
  const spots = [
    [pin.lat + dlat, pin.lon],
    [pin.lat - dlat, pin.lon],
    [pin.lat, pin.lon + dlon],
    [pin.lat, pin.lon - dlon],
    [pin.lat + dlat * 0.55, pin.lon + dlon * 0.55]
  ];
  const seen = new Set();
  const pinName = foldZone(pin.label);
  if (pinName) seen.add(pinName);
  const towns = [];
  for (let i = 0; i < spots.length && towns.length < 5; i++) {
    const hit = await nominatimReverse(spots[i][0], spots[i][1]);
    const label = placeLabel(hit);
    const key = foldZone(label);
    if (!label || !key || seen.has(key) || key === pinName) continue;
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    seen.add(key);
    towns.push({ lat, lon, label });
  }
  outline.towns = towns;
  outline.townPin = pin.label;
  return towns;
}
function projectPoint(lon, lat, proj) {
  return [
    proj.ox + (lon - proj.minX) * proj.s,
    proj.oy + (proj.maxY - lat) * proj.s
  ];
}
function makeProject(rings, box) {
  const b = bboxOf(rings);
  const bw = Math.max(1e-6, b.maxX - b.minX);
  const bh = Math.max(1e-6, b.maxY - b.minY);
  const pad = 28;
  const s = Math.min((box.w - pad * 2) / bw, (box.h - pad * 2) / bh);
  return {
    minX: b.minX,
    maxY: b.maxY,
    s,
    ox: box.x + (box.w - bw * s) / 2,
    oy: box.y + (box.h - bh * s) / 2
  };
}
function ringPath(ring, proj) {
  return ring.map((p, i) => {
    const xy = projectPoint(p[0], p[1], proj);
    return (i ? "L" : "M") + xy[0].toFixed(1) + " " + xy[1].toFixed(1);
  }).join("") + "Z";
}
function renderEngravedPlate(opts) {
  const title = plateTitle(opts.title).slice(0, 42);
  const subtitle = plateTitle(opts.subtitle).slice(0, 48);
  const size = title.length > 26 ? 28 : title.length > 18 ? 34 : title.length > 12 ? 42 : 50;
  const box = { x: 86, y: 148, w: 996, h: 500 };
  const proj = makeProject(opts.rings, box);
  const paths = opts.rings.map(ring => ringPath(ring, proj)).join("");
  const pinXY = projectPoint(opts.pin.lon, opts.pin.lat, proj);
  const compass = { x: 1036, y: 642 };
  const labels = [];
  opts.towns.forEach(town => {
    const xy = projectPoint(town.lon, town.lat, proj);
    if (xy[0] < box.x + 8 || xy[0] > box.x + box.w - 8 || xy[1] < box.y + 8 || xy[1] > box.y + box.h - 8) return;
    if (Math.hypot(xy[0] - compass.x, xy[1] - compass.y) < 78) return;
    if (Math.hypot(xy[0] - pinXY[0], xy[1] - pinXY[1]) < 36) return;
    const anchor = xy[0] > box.x + box.w - 120 ? "end" : "start";
    const dx = anchor === "end" ? -8 : 8;
    labels.push({ x: xy[0], y: xy[1], text: plateTitle(town.label).slice(0, 22), anchor, dx });
  });
  const pinName = plateTitle(opts.pin.label).slice(0, 22);
  const pinAnchor = pinXY[0] > box.x + box.w - 140 ? "end" : "start";
  const pinDx = pinAnchor === "end" ? -14 : 14;
  const corner = (x, y, sx, sy) =>
    `<path d="M${x} ${y + sy * 28} V${y} H${x + sx * 28}" fill="none" stroke="#e8c97a" stroke-width="1.4"/>` +
    `<path d="M${x + sx * 10} ${y + sy * 10} l${sx * 6} ${sy * 6} l${-sx * 6} ${sy * 6} l${-sx * 6} ${-sy * 6} Z" fill="#c6a35a"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1168 784" width="1168" height="784">` +
    `<rect width="1168" height="784" fill="#090b0a"/>` +
    `<rect x="26" y="26" width="1116" height="732" fill="none" stroke="#c6a35a" stroke-width="3"/>` +
    `<rect x="38" y="38" width="1092" height="708" fill="none" stroke="#e8c97a" stroke-width="1.15"/>` +
    `<rect x="50" y="50" width="1068" height="684" fill="none" stroke="#8d7340" stroke-width="1"/>` +
    corner(58, 58, 1, 1) + corner(1110, 58, -1, 1) + corner(58, 726, 1, -1) + corner(1110, 726, -1, -1) +
    `<text x="584" y="108" text-anchor="middle" fill="#f0d48a" font-family="Palatino, 'Palatino Linotype', 'Iowan Old Style', 'Times New Roman', Times, serif" font-size="${size}" letter-spacing="6">${xmlEsc(title)}</text>` +
    (subtitle ? `<text x="584" y="134" text-anchor="middle" fill="#b89a5e" font-family="Palatino, 'Times New Roman', Times, serif" font-size="15" letter-spacing="4">${xmlEsc(subtitle)}</text>` : "") +
    `<path d="${paths}" fill="rgba(198,163,90,0.07)" stroke="#e4c98a" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>` +
    labels.map(lab => `<g><circle cx="${lab.x.toFixed(1)}" cy="${lab.y.toFixed(1)}" r="2.2" fill="#e8c97a"/><text x="${(lab.x + lab.dx).toFixed(1)}" y="${(lab.y + 4).toFixed(1)}" text-anchor="${lab.anchor}" fill="#cbb074" font-family="Palatino, 'Times New Roman', Times, serif" font-size="15" letter-spacing="1.4">${xmlEsc(lab.text)}</text></g>`).join("") +
    `<g transform="translate(${pinXY[0].toFixed(1)} ${pinXY[1].toFixed(1)})"><path d="M0 -18 C7 -18 11 -12 11 -7 C11 1 0 14 0 14 C0 14 -11 1 -11 -7 C-11 -12 -7 -18 0 -18 Z" fill="#e8c97a"/><circle cy="-7" r="3.1" fill="#1a1408"/></g>` +
    (pinName ? `<text x="${(pinXY[0] + pinDx).toFixed(1)}" y="${(pinXY[1] - 6).toFixed(1)}" text-anchor="${pinAnchor}" fill="#f0d48a" font-family="Palatino, 'Times New Roman', Times, serif" font-size="16" letter-spacing="1.6">${xmlEsc(pinName)}</text>` : "") +
    `<g transform="translate(${compass.x} ${compass.y})" fill="none" stroke="#e8c97a" stroke-width="1.3">` +
    `<circle r="34"/><circle r="4" fill="#e8c97a" stroke="none"/>` +
    `<path d="M0 -30 L6 -6 L0 -12 L-6 -6 Z" fill="#e8c97a"/>` +
    `<path d="M0 30 L6 6 L0 12 L-6 6 Z"/><path d="M30 0 L6 6 L12 0 L6 -6 Z"/><path d="M-30 0 L-6 6 L-12 0 L-6 -6 Z"/>` +
    `<path d="M0 -16 V16 M-16 0 H16" stroke="#8d7340"/>` +
    `</g>` +
    `<text x="${compass.x}" y="${compass.y - 40}" text-anchor="middle" fill="#e8c97a" font-family="Palatino, 'Times New Roman', Times, serif" font-size="13" letter-spacing="1">N</text>` +
    `<text x="584" y="748" text-anchor="middle" fill="#6e5a32" font-family="Palatino, 'Times New Roman', Times, serif" font-size="11" letter-spacing="1.5">DATOS GEOGRÁFICOS © OPENSTREETMAP</text>` +
    `</svg>`;
}
async function buildZonePlate(w) {
  const outline = await resolveOutline(w);
  if (!outline) return "";
  const pin = await geocodePin(w, outline);
  const towns = await nearbyTowns(pin, outline);
  const title = w.region || w.appellation || outline.localName || w.country || "Zona";
  const subtitle = outline.fallback === "country"
    ? ("Contorno de " + (outline.country || w.country || ""))
    : outline.fallback === "province"
      ? ("Contorno de " + (outline.localName || outline.country || ""))
      : (w.country || outline.country || "");
  return renderEngravedPlate({ title, subtitle, rings: outline.rings, pin, towns });
}
async function buildWineryPlate(w) {
  const outline = await resolveOutline(w);
  if (!outline) return "";
  const pin = await geocodePin(w, outline);
  const towns = await nearbyTowns(pin, outline);
  const subtitle = [pin.label, w.region || w.appellation || outline.country || ""].filter(Boolean).join(" · ");
  return renderEngravedPlate({ title: w.producer || w.region || "Bodega", subtitle, rings: outline.rings, pin, towns });
}
function platesOutstanding(w) {
  if (!w || isCatalogWineId(w.id)) return false;
  const fixed = fixedZoneOf(w);
  const cache = plateCache();
  const keys = w.plateKeys || {};
  const zoneKey = zonePlateKey(w);
  const bodegaKey = wineryPlateKey(w);
  if (!(fixed && fixed.map) && !(keys.zone && cache[keys.zone]) && !plateMiss.has(zoneKey)) return true;
  if (!PRODUCER_ART[w.producer] && w.producer && !(keys.winery && cache[keys.winery]) && !plateMiss.has(bodegaKey)) return true;
  return false;
}
async function ensureGeneratedPlates(wine) {
  if (!wine || isCatalogWineId(wine.id)) return false;
  wine.plateKeys = wine.plateKeys || {};
  const fixed = fixedZoneOf(wine);
  let changed = false;
  if (!(fixed && fixed.map)) {
    const key = zonePlateKey(wine);
    plateMiss.delete(key);
    if (key !== "z:" && !plateCache()[key]) {
      setFichaProgress("Trazando el mapa de la zona…");
      const svg = await buildZonePlate(wine);
      if (svg) { plateCache()[key] = svg; changed = true; }
      else plateMiss.add(key);
    }
    if (key !== "z:" && plateCache()[key]) wine.plateKeys.zone = key;
  }
  if (!PRODUCER_ART[wine.producer] && wine.producer) {
    const key = wineryPlateKey(wine);
    plateMiss.delete(key);
    if (!plateCache()[key]) {
      setFichaProgress("Trazando el mapa de la bodega…");
      const svg = await buildWineryPlate(wine);
      if (svg) { plateCache()[key] = svg; changed = true; }
      else plateMiss.add(key);
    }
    if (plateCache()[key]) wine.plateKeys.winery = key;
  }
  if (changed) save();
  return changed;
}
function schedulePlate(w) {
  if (!platesOutstanding(w)) return;
  const id = w.id;
  platePending.add(id);
  ensureGeneratedPlates(w).then(() => {
    platePending.delete(id);
    if (!currentWine || currentWine.id !== id) return;
    if (screenId === "wine-sub" && currentSub) openWineSub(currentSub);
    else if (screenId === "wine") openWine(id, currentBottle);
  }).catch(() => { platePending.delete(id); });
}
function estateArt(w) {
  const hit = PRODUCER_ART[w.producer];
  if (hit) return hit;
  const hitZone = fixedZoneOf(w);
  const fixed = hitZone && hitZone.map ? hitZone.map : "";
  if (!w || isCatalogWineId(w.id)) {
    return fixed ? { land: fixed, cap: "capsula.jpg", map: fixed } : { land: "", cap: "capsula.jpg", map: "" };
  }
  const cache = plateCache();
  const keys = w.plateKeys || {};
  const zoneSvg = !fixed && keys.zone && cache[keys.zone];
  const winerySvg = keys.winery && cache[keys.winery];
  const zoneSrc = fixed || (zoneSvg ? svgDataUrl(zoneSvg) : "");
  const landSrc = winerySvg ? svgDataUrl(winerySvg) : zoneSrc;
  return { land: landSrc, cap: "capsula.jpg", map: zoneSrc };
}

function capsuleLines(w) {
  const raw = String(w.appellation || w.region || "").replace(/^DO(Ca|P|C)?\s*/i, "").trim();
  if (!raw) return [];
  const words = raw.split(/\s+/).slice(0, 5);
  const lines = [];
  let line = "";
  words.forEach(word => {
    const next = (line + " " + word).trim();
    if (next.length > 12 && line) { lines.push(line); line = word; }
    else line = next;
  });
  if (line) lines.push(line);
  if (w.country && lines.length < 3) lines.push(String(w.country).toUpperCase());
  return lines.slice(0, 3);
}
function bottleKind(w) {
  const t = normTxt(`${w.type || ""} ${w.style || ""} ${w.appellation || ""} ${w.region || ""} ${w.name || ""} ${(w.grapes || []).join(" ")}`);
  if (/cava|champagne|espumoso|corpinnat/.test(t)) return "spark";
  if (/albarino|rias baixas|riesling|alsace|mosela/.test(t)) return "slim";
  if (/blanco|white|chardonnay|godello|verdejo|viura/.test(t)) return "white";
  if (/rosado|rose/.test(t)) return "rose";
  return "red";
}
function bottleSVG(w, forceKind) {
  const kind = forceKind || bottleKind(w);
  const lines = capsuleLines(w);
  const label = lines.map((line, i) => `<text x="60" y="${38 + i * 11}" text-anchor="middle" fill="#2a1c08" font-size="8" font-family="Georgia, serif" font-weight="700">${line.toUpperCase()}</text>`).join("");
  const glass = { red: "#9a2434", white: "#e6d7a2", slim: "#f0e2ae", rose: "#e7b7c0", spark: "#d8c48a", generoso: "#c4a35a", neutral: "#c8c2b6" }[kind] || "#c8c2b6";
  const body = kind === "spark"
    ? `<path d="M46 78h28v18c8 6 14 18 14 40v42c0 10-8 16-28 16s-28-6-28-16v-42c0-22 6-34 14-40V78z" fill="${glass}"/>`
    : kind === "slim"
      ? `<path d="M50 78h20v28c6 10 10 22 10 48v28c0 8-6 14-20 14s-20-6-20-14v-28c0-26 4-38 10-48V78z" fill="${glass}"/>`
      : `<path d="M44 78h32v16c10 8 16 20 16 42v40c0 12-10 18-32 18s-32-6-32-18v-40c0-22 6-34 16-42V78z" fill="${glass}"/>`;
  const muselet = kind === "spark"
    ? `<path d="M52 70c4 8 12 8 16 0M60 74v10M50 84h20" fill="none" stroke="#d7d7d7" stroke-width="1.4"/>`
    : "";
  return `<svg class="bottle-svg bottle-${kind}" data-bottle="${kind}" viewBox="0 0 120 200" aria-label="${lines.join(" ") || "Botella"}">
    <rect x="48" y="8" width="24" height="70" rx="6" fill="url(#foil)"/>
    ${label}
    ${muselet}
    ${body}
    <defs><linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7b4"/><stop offset=".5" stop-color="#c9a24a"/><stop offset="1" stop-color="#8a6a28"/></linearGradient></defs>
  </svg>`;
}
/* fotos de botella incrustadas: no dependen de un jpg en GitHub */
const BOTTLE_PHOTOS = {
  tinto: "data:image/jpeg;base64,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",
  blanco: "data:image/jpeg;base64,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",
  espumoso: "data:image/jpeg;base64,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"
};

function bottleAsset(w) {
  const kind = bottleKind(w);
  if (kind === "spark") return BOTTLE_PHOTOS.espumoso;
  if (kind === "white" || kind === "slim" || kind === "rose") return BOTTLE_PHOTOS.blanco;
  return BOTTLE_PHOTOS.tinto;
}
function bottleTone(w) {
  if (!w || !w.provenance || isCatalogWineId(w.id)) {
    const kind = bottleKind(w);
    if (kind === "spark") return "photo-espumoso";
    if (kind === "white" || kind === "slim" || kind === "rose") return "photo-blanco";
    return "photo-tinto";
  }
  if (!fieldIsReal(w, "type")) return "neutral";
  const type = normTxt(w.type);
  if (type === "blanco") return "photo-blanco";
  if (type === "espumoso") return "photo-espumoso";
  if (type === "rosado") return "rose";
  if (type === "generoso") return "generoso";
  if (type === "tinto") return "red";
  return "neutral";
}
function bottleMarkup(w) {
  const tone = bottleTone(w);
  if (tone === "photo-tinto" || tone === "photo-blanco" || tone === "photo-espumoso") {
    const src = tone === "photo-blanco" ? BOTTLE_PHOTOS.blanco : tone === "photo-espumoso" ? BOTTLE_PHOTOS.espumoso : BOTTLE_PHOTOS.tinto;
    return `<img class="bottle-photo" data-bottle="${tone}" src="${src}" alt="Botella">`;
  }
  return bottleSVG(w, tone);
}
function estateSVG(w) {
  const art = estateArt(w);
  const landKind = art.land ? (String(art.land).indexOf("data:") === 0 ? "generado" : art.land) : "";
  const land = art.land ? `<img class="estate-photo" data-land="${landKind}" src="${art.land}" alt="" onerror="this.style.display='none'">` : "";
  return `
    ${land}
    <div class="foil-wrap">
      ${bottleMarkup(w)}
    </div>`;
}

function dishArt() {
  return `<svg class="pair-art" viewBox="0 0 88 88" fill="none" stroke="currentColor" stroke-width="1.35">
    <ellipse cx="44" cy="72" rx="30" ry="7"/>
    <path d="M16 68h56"/>
    <path d="M22 68c2-16 8-34 22-38 14 4 20 22 22 38"/>
    <path d="M30 48c8 6 20 6 28 0"/>
    <path d="M34 36c6-2 10-10 8-16 8 2 12 10 10 18"/>
    <path d="M40 22c2-6 8-10 14-8"/>
  </svg>`;
}

function isFav(id) { return (state.favorites || []).includes(id); }
function toggleFav(id) {
  state.favorites = state.favorites || [];
  if (isFav(id)) state.favorites = state.favorites.filter(x => x !== id);
  else state.favorites.push(id);
  save();
  if (currentWine && currentWine.id === id) openWine(id, currentBottle);
}

function normalizeWine(w) {
  if (!w || typeof w !== "object") return w;
  if (!w.conservation) w.conservation = { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" };
  const y = Number(w.vintage) || YEAR;
  if (!w.aging) w.aging = { drinkFrom: y + 1, peakStart: y + 3, peakEnd: y + 10, holdTo: y + 15 };
  if (!w.aging.holdTo) w.aging.holdTo = w.aging.drinkTo || ((Number(w.aging.peakEnd) || y + 10) + 4);
  if (!w.aging.drinkFrom) w.aging.drinkFrom = y + 1;
  if (!w.aging.peakStart) w.aging.peakStart = y + 3;
  if (!w.aging.peakEnd) w.aging.peakEnd = y + 10;
  if (!Array.isArray(w.evolutionNotes)) w.evolutionNotes = [];
  if (!Array.isArray(w.grapes)) w.grapes = [];
  if (!w.ratings) w.ratings = {};
  const scales = { vivino: 5, penin: 100, parker: 100, spectator: 100, decanter: 100 };
  Object.keys(scales).forEach(k => {
    if (!w.ratings[k]) w.ratings[k] = { score: 0, scale: scales[k], note: "" };
    if (w.ratings[k].score == null || Number.isNaN(Number(w.ratings[k].score))) w.ratings[k].score = 0;
  });
  return w;
}
function pendingForWine(wineId) {
  return (state.inbox || []).filter(r => !r.entered && r.wineId === wineId);
}
function pendingPlacementLine(wineId) {
  const rows = pendingForWine(wineId).filter(r => r.bin);
  if (!rows.length) return "";
  return rows.map(r => `<p class="tiny" style="text-align:center;margin:6px 0 4px">Alta pendiente · ${cellarName(r.cellarId)} · ${r.bin}</p>`).join("");
}
function datesAreReal(w) {
  if (!w || !w.provenance) return true;
  return !!(w.provenance.aging && w.provenance.aging !== "valor por defecto");
}
function fieldIsReal(w, key) {
  if (!w || !w.provenance) return true;
  return !!(w.provenance[key] && w.provenance[key] !== "valor por defecto");
}
function rateScore(score, digits) {
  const n = Number(score);
  if (!n) return "Sin dato";
  return digits ? n.toFixed(digits) : String(n);
}
function isPlaceholderNote(text) {
  return /ficha a partir de la bodega|alta por etiqueta|completa la ficha|ficha creada/i.test(String(text || ""));
}
function noteLooksLikeLinkOrPrice(text) {
  const n = String(text || "").trim();
  if (!n) return false;
  if (/https?:\/\//i.test(n) || /search-result/i.test(n)) return true;
  return /^\d{1,4}(?:[.,]\d{1,2})?\s*€$/.test(n);
}
function publishedNote(obj) {
  const n = ((obj && obj.note) || "").trim();
  if (!n || isPlaceholderNote(n) || noteLooksLikeLinkOrPrice(n)) return "";
  return n;
}
function criticBlurb(w) {
  const parker = w && w.ratings && w.ratings.parker;
  const note = publishedNote(parker);
  if (note) return (parker && parker.estimate ? "Estimación. " : "") + note;
  const tasting = publishedNote({ note: w && w.tasting });
  if (tasting.length > 24) {
    const est = w.provenance && w.provenance.tasting === "estimación Gemini";
    return (est ? "Estimación. " : "") + tasting;
  }
  return "Sin dato";
}
function criticMeters(w) {
  const r = (w && w.ratings) || {};
  const bit = (label, block, digits) => {
    const score = block && block.score;
    const est = block && block.estimate && score ? " est." : "";
    return label + " " + rateScore(score, digits) + est;
  };
  const dec = r.decanter && r.decanter.score ? " · Decanter " + rateScore(r.decanter.score, 0) + (r.decanter.estimate ? " est." : "") : "";
  return bit("WA", r.parker, 0) + " · " + bit("Peñín", r.penin, 0) + " · " + bit("WS", r.spectator, 0) + dec + " · " + bit("Vivino", r.vivino, 1);
}
function styleLabel(w) {
  if (!w) return "Sin dato";
  const kind = w.kindStyle || "";
  if (w.provenance && (w.style === "internet" || w.style === "escaneo") && !kind) return w.type || "Sin dato";
  if (kind) return kind + " · " + (w.type || "");
  return (w.style || "Sin dato") + " · " + (w.type || "");
}
function shownTemp(w, which) {
  if (!fieldIsReal(w, which)) return "Sin dato";
  const c = w.conservation || {};
  if (which === "cellar") return c.cellarMin + "–" + c.cellarMax + " °C";
  return c.serveMin + "–" + c.serveMax + " °C";
}
function pairingPackOf(w) {
  if (!w) return null;
  if (window.WINE_PAIRINGS && WINE_PAIRINGS[w.id]) return WINE_PAIRINGS[w.id];
  if (w.pairingPack && Array.isArray(w.pairingPack.matches) && w.pairingPack.matches.length) return w.pairingPack;
  if (Array.isArray(w.pairing) && w.pairing.length) {
    return {
      logic: w.pairing.join(" · "),
      serve: fieldIsReal(w, "service") ? (w.conservation.serveMin + "–" + w.conservation.serveMax + " °C") : "",
      avoid: [],
      matches: w.pairing.map((name, i) => ({ dishId: null, score: 0, why: String(name), label: String(name) }))
    };
  }
  return null;
}
function pairFeatureHtml(w) {
  const pack = pairingPackOf(w);
  const top = pack && pack.matches && pack.matches[0];
  if (!top) return `<p class="muted" style="margin:0 0 12px">Sin dato</p>`;
  const dish = top.dishId ? PAIRING_DISHES.find(d => d.id === top.dishId) : null;
  const title = dish ? dish.name : (top.label || top.why);
  const score = top.score ? `<div class="pair-score">${top.score}/100</div>` : "";
  const why = dish ? top.why : "";
  return `<div class="pair-feature" role="button" onclick="openWineSub('pairings')">
      ${dish ? dishArt() : ""}
      <div>
        <h3>${escHtml(title)}</h3>
        ${score}
        ${why ? `<p class="muted" style="margin-top:4px">${escHtml(why)}</p>` : ""}
      </div>
    </div>`;
}
function fichaStatusCard(w) {
  if (!w || isCatalogWineId(w.id)) return "";
  const note = (w.provenance && w.provenance.geminiNote) || "";
  const btn = `<button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="completeExistingWine('${w.id}')">Completar ficha</button>`;
  if (!note) return `<div id="ficha-status">${btn}</div>`;
  return `<div class="card" id="ficha-status"><p>${escHtml(note)}</p>${btn}</div>`;
}
function setFichaProgress(msg) {
  setScanStatus(msg);
  const el = document.getElementById("ficha-status");
  if (el) el.innerHTML = `<p>${escHtml(msg)}</p>`;
  const box = document.getElementById("scan-results");
  if (box && document.getElementById("scan") && document.getElementById("scan").classList.contains("active")) {
    box.innerHTML = `<div class="card"><p>${escHtml(msg)}</p><p class="tiny">Primero la página de la tienda o la bodega. Lo que no aparezca, si hay clave guardada, lo estima Gemini.</p></div>`;
  }
}
function openWine(wineId, bottle) {
  const w = wineById(wineId);
  if (!w) {
    toast("No hay ficha para este vino");
    show("cellar", { tab: true });
    return;
  }
  normalizeWine(w);
  currentWine = w;
  currentBottle = bottle || state.bottles.find(b => b.wineId === wineId) || null;
  const p = phaseOf(w);
  const r = w.ratings;
  const backTo = lastList === "wine" ? (bottle ? "cellar" : "scan") : lastList;
  const pill = datesAreReal(w) ? (p.label || "").toUpperCase() : (fieldIsReal(w, "type") && w.type ? String(w.type).toUpperCase() : "SIN DATO");

  $("#wine-body").innerHTML = `
    <div class="wine-top">
      <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
      <div class="spacer"></div>
      <button class="icon-btn fav ${isFav(w.id) ? "on" : ""}" onclick="toggleFav('${w.id}')" aria-label="Favorito">${isFav(w.id) ? "♥" : "♡"}</button>
      <button type="button" class="icon-btn" onclick="openWineMenu()" aria-label="Más de este vino">···</button>
    </div>
    <div class="wine-hero">${estateSVG(w)}</div>
    <h1 class="wine-producer">${w.producer}</h1>
    <p class="wine-cuvee">${w.name} ${w.vintage}</p>
    <div class="peak-pill">${pill}</div>
    ${currentBottle ? `<p class="tiny" style="text-align:center;margin:6px 0 4px">En mi bodega · ${currentBottle.qty} botella${currentBottle.qty>1?"s":""}</p>` : ""}
    ${pendingPlacementLine(w.id)}
    <div class="wine-tabs">
      <button type="button" onclick="openWineSub('profile')">General</button>
      <button type="button" onclick="openWineSub('taste')">Cata</button>
      <button type="button" onclick="openWineSub('mapa')">Bodega</button>
      <button type="button" onclick="openWineSub('anadas')">Añadas</button>
    </div>
    ${zoneStrip(w)}
    ${fichaStatusCard(w)}

    <div class="sec-head" role="button" onclick="openWineSub('ratings')"><h2>Calificaciones</h2><span class="sec-ico">▦</span></div>
    <div class="rate-grid" role="button" onclick="openWineSub('ratings')">
      <div class="rate-card">
        <div class="who">
          <div class="badge-round vivino-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="1.6"><path d="M12 4c2 4 6 6 6 11a6 6 0 1 1-12 0c0-5 4-7 6-11z"/></svg>
          </div>
          <div><b>Vivino</b><div class="stars">${r.vivino.score ? starsRow(r.vivino.score) : ""}</div></div>
        </div>
        <div class="rate-score" style="${r.vivino.score ? "" : "font-size:14px"}">${rateScore(r.vivino.score, 1)}</div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Peñín</b></div>
        <div class="rate-end"><div class="rate-score" style="${r.penin.score ? "" : "font-size:14px"}">${rateScore(r.penin.score, 0)}</div>
          <svg class="rate-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3 20 7v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V7z"/></svg>
        </div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Parker</b></div>
        <div class="rate-end"><div class="rate-score" style="${r.parker.score ? "" : "font-size:14px"}">${rateScore(r.parker.score, 0)}</div><span class="parker-p">P</span></div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Spectator</b></div>
        <div class="rate-end"><div class="rate-score" style="${r.spectator.score ? "" : "font-size:14px"}">${rateScore(r.spectator.score, 0)}</div>
          <svg class="rate-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M6 18l2.5-2.5"/></svg>
        </div>
      </div>
    </div>
    <div class="card" role="button" onclick="openWineSub('ratings')" style="margin:8px 0 12px">
      <p class="tiny">Crítica publicada</p>
      <p style="margin-top:8px;line-height:1.45">${escHtml(criticBlurb(w))}</p>
      <p class="muted" style="margin-top:8px">${r.parker && r.parker.reviewer && r.parker.score ? escHtml(r.parker.reviewer) + " · " : ""}${escHtml(criticMeters(w))}</p>
    </div>

    <div class="sec-head" role="button" onclick="openWineSub('pairings')"><h2>Maridajes</h2><span class="sec-ico">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 13h14v3H5z"/><path d="M7 13c0-5 2.5-8 5-8s5 3 5 8"/><path d="M4 19h16"/></svg>
    </span></div>
    ${pairFeatureHtml(w)}

    <div class="serve-bar" role="button" onclick="openWineSub('keep')">
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v3M8 5l1.2 2.2M16 5l-1.2 2.2"/><path d="M7 14a5 5 0 0 0 10 0c0-3-2.4-5.5-5-7-2.6 1.5-5 4-5 7z"/></svg>
        <div><div class="lbl">Guarda</div><div class="val">${shownTemp(w, "cellar")}</div></div>
      </div>
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3h8l-1 9a5 5 0 1 1-6 0L8 3z"/><path d="M9 21h6"/></svg>
        <div><div class="lbl">Servicio</div><div class="val">${shownTemp(w, "service")}</div></div>
      </div>
    </div>
    <div class="dossier-grid">
      <button type="button" onclick="openWineSub('tecnica')">Técnica</button>
      <button type="button" onclick="openWineSub('servicio')">Copa</button>
      <button type="button" onclick="openWineSub('evolve')">Evolución</button>
      <button type="button" onclick="openWineSub('mercado')">Mercado</button>
      <button type="button" onclick="openWineSub('historia')">Historia</button>
      <button type="button" onclick="openWineSub('origen')">Hueco</button>
      <button type="button" onclick="openWineSub('compras')">Compras</button>
    </div>
    ${cataPersonalCard(w)}
  `;
  if (platesOutstanding(w)) platePending.add(w.id);
  show("wine");
  schedulePlate(w);
}

function getTaste(id) {
  const d = { acidez: 6, dulzor: 2, tanino: 6, cuerpo: 7, note: "" };
  return Object.assign({}, d, (state.tasting && state.tasting[id]) || {});
}

function cataPersonalCard(w) {
  const t = getTaste(w.id);
  const hint = t.note ? t.note : "Tu nota, no la de las guías.";
  return `<div class="cata-entry" role="button" onclick="openWineSub('taste')">
    <div class="row"><h2>Cata personal</h2><span class="sec-ico">›</span></div>
    <p class="muted" style="margin-top:6px">${hint}</p>
  </div>`;
}

function openWineMenu() {
  if (!currentWine) return;
  showSheet("wine-menu-sheet");
}

function openWineSub(kind) {
  currentSub = kind;
  const w = currentWine;
  if (!w) return;
  normalizeWine(w);
  const p = phaseOf(w);
  const pr = progressOf(w);
  const r = w.ratings;
  const titles = {
    ratings: "Calificaciones",
    pairings: "Maridajes",
    keep: "Conservación",
    servicio: "Servicio en copa",
    tecnica: "Ficha técnica",
    historia: "Historia",
    mercado: "Valor de mercado",
    evolve: "Evolución",
    profile: "Perfil",
    origen: "Origen y hueco",
    mapa: "Mapa y bodega",
    vinos: "Vinos de la zona",
    taste: "Cuaderno de cata",
    anadas: "Añadas",
    compras: "Compras e historial",
    bottle: currentBottle ? "Ubicación física" : "Añadir a vinoteca"
  };
  let body = "";
  if (kind === "ratings") {
    const d = dossierOf(w);
    const casaRaw = publishedNote({ note: w.tasting });
    const casa = casaRaw || (w.provenance ? "Sin dato" : (w.tasting || "").trim());
    const noteOf = (obj, extra) => {
      const n = publishedNote(obj) || publishedNote({ note: extra });
      if (n && n !== casa) return n;
      if (w.provenance) return "Sin dato";
      return "Sin párrafo propio de esta guía para la añada. La nota de la casa está abajo.";
    };
    const card = (fuente, puntos, texto) => `
      <div class="card" style="margin-top:10px">
        <div class="row"><p class="tiny">${fuente}</p><b>${puntos || "—"}</b></div>
        <p style="margin-top:8px;line-height:1.5">${texto}</p>
      </div>`;
    body = `
      <p class="tiny" style="margin:6px 0 8px">Guías del sector + nota de la casa. Vivino no tiene API: la media es de dossier, no de la web en vivo.</p>
      <div class="temp-grid" style="margin:8px 0 12px">
        <div class="temp"><span class="tiny">Vivino</span><b>${rateScore(r.vivino.score, 1)}</b></div>
        <div class="temp"><span class="tiny">Peñín</span><b>${rateScore(r.penin.score, 0)}</b></div>
        <div class="temp"><span class="tiny">Parker / WA</span><b>${rateScore(r.parker.score, 0)}</b></div>
        <div class="temp"><span class="tiny">Spectator</span><b>${rateScore(r.spectator.score, 0)}</b></div>
      </div>
      ${card("Guía Peñín" + (r.penin.estimate ? " · estimación" : ""), r.penin.score ? r.penin.score + "/100" : "Sin dato", noteOf(r.penin))}
      ${card((r.parker.reviewer || "Wine Advocate") + (r.parker.estimate ? " · estimación" : ""), r.parker.score ? r.parker.score + "/100" : "Sin dato", noteOf(r.parker))}
      ${card("Wine Spectator" + (r.spectator.estimate ? " · estimación" : ""), r.spectator.score ? r.spectator.score + "/100" : "Sin dato", noteOf(r.spectator, r.spectator.note))}
      ${card("Decanter" + (r.decanter && r.decanter.estimate ? " · estimación" : ""), (r.decanter && r.decanter.score ? r.decanter.score + "/100" : "Sin dato"), noteOf(r.decanter))}
      ${card("Vivino · usuarios" + (r.vivino.estimate ? " · estimación" : ""), (r.vivino.score ? r.vivino.score.toFixed(1) + "/5 · " + (r.vivino.count || "Sin dato") + " valoraciones" : "Sin dato"), noteOf(r.vivino))}
      ${card("Nota de cata (casa)", "ficha", casa)}
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">Referencias</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('taste')">Cata personal ›</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('historia')">Historia y añada ›</button>`;
  } else if (kind === "pairings") {
    body = pairingBlock(w);
  } else if (kind === "keep") {
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">Vinoteca</span><b>${shownTemp(w, "cellar")}</b></div>
        <div class="temp"><span class="tiny">Servicio</span><b>${shownTemp(w, "service")}</b></div>
        <div class="temp"><span class="tiny">Humedad</span><b>${fieldIsReal(w, "cellar") ? w.conservation.humidity : "Sin dato"}</b></div>
        <div class="temp"><span class="tiny">Posición</span><b style="font-size:16px">${fieldIsReal(w, "cellar") ? w.conservation.position : "Sin dato"}</b></div>
      </div>
      <div class="card">
        <p class="muted">Luz: ${w.conservation.light}. El corcho vive con humedad ${corkHumidity(w)}: por debajo se reseca y entra oxígeno; por encima hay moho en la cápsula.</p>
        ${adviseCave(w)}
      </div>
      <div class="card">
        <strong>Cómo conservarlo</strong>
        <p class="muted" style="margin-top:6px">Horizontal, oscuro, sin UV ni vibración de electrodomésticos. Estabilidad antes que la cifra exacta: más de 2 °C de oscilación acelera la evolución.</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="openWineSub('servicio')">Protocolo de servicio ›</button>`;
  } else if (kind === "servicio") {
    const d = dossierOf(w);
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">Servir</span><b>${shownTemp(w, "service")}</b></div>
        <div class="temp"><span class="tiny">Decantar</span><b style="font-size:16px">${d.decant}</b></div>
      </div>
      <div class="card"><p class="tiny">Copa</p><p>${d.glass}</p></div>
      <div class="card"><p class="tiny">Oxígeno</p><p class="muted" style="margin-top:6px">${d.oxygen}</p></div>
      <div class="card"><p class="tiny">Guarda en cava</p><p class="muted" style="margin-top:6px">${shownTemp(w, "cellar")} · ${fieldIsReal(w, "cellar") ? w.conservation.humidity : "Sin dato"} · ${fieldIsReal(w, "cellar") ? w.conservation.position : "Sin dato"}</p></div>`;
  } else if (kind === "tecnica") {
    const d = dossierOf(w);
    body = `
      ${provenanceCard(w)}
      <div class="fact"><span>Uvas</span><b>${(w.grapes || []).join(", ") || "—"}</b></div>
      <div class="fact"><span>Alcohol</span><b>${w.abv ? w.abv + "% vol." : "—"}</b></div>
      <div class="fact"><span>Estilo</span><b>${escHtml(styleLabel(w))}</b></div>
      ${w.provenance ? `<div class="fact"><span>Zona</span><b>${escHtml([w.appellation || w.region, w.country].filter(Boolean).join(" · ") || "—")}</b></div>
      <div class="fact"><span>Beber</span><b>${datesAreReal(w) ? w.aging.drinkFrom + "–" + w.aging.peakEnd : "Sin dato"}</b></div>
      <div class="fact"><span>Límite</span><b>${datesAreReal(w) ? w.aging.holdTo : "Sin dato"}</b></div>
      <div class="fact"><span>Maridaje</span><b>${escHtml((w.pairing || []).join(", ") || "—")}</b></div>` : ""}
      <div class="fact"><span>Altitud</span><b>${d.elevation}</b></div>
      <div class="card" style="margin-top:12px"><p class="tiny">Suelos</p><p class="muted" style="margin-top:6px">${d.soils}</p></div>
      <div class="card"><p class="tiny">Viñedo</p><p class="muted" style="margin-top:6px">${d.vineyard}</p></div>
      <div class="card"><p class="tiny">Vinificación</p><p class="muted" style="margin-top:6px">${d.vinification}</p></div>
      <div class="card"><p class="tiny">Crianza</p><p class="muted" style="margin-top:6px">${escHtml(w.crianza || d.elevage)}</p></div>`;
  } else if (kind === "historia") {
    const d = dossierOf(w);
    const paras = String(d.history || (w.producer + " se elabora en " + w.region + ".")).split("\n").filter(Boolean);
    body = `
      ${mapTabs("historia")}
      ${paras.map(t => `<div class="card"><p style="line-height:1.5">${t}</p></div>`).join("")}
      <div class="card"><p class="tiny">Elaboración</p><p style="margin-top:8px">${d.vinification}</p><p class="muted" style="margin-top:8px">${d.elevage}</p></div>
      <div class="card"><p class="tiny">Crítica de añada ${w.vintage}</p>
        <p style="margin-top:8px;line-height:1.45">${escHtml(criticBlurb(w))}</p>
        <p class="muted" style="margin-top:8px">${escHtml(criticMeters(w))}</p>
        ${(r.penin && r.penin.note) ? `<p class="muted" style="margin-top:10px">${r.penin.note}</p>` : ""}
      </div>
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">Referencias</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('evolve')">Evolución y fechas ›</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('mapa')">Volver al mapa</button>`;
  } else if (kind === "mercado") {
    body = `<div id="mercado-box">${mercadoSkeleton(w)}</div>`;
    setTimeout(() => fillMercado(w), 0);
  } else if (kind === "evolve") {
    const when = datesAreReal(w)
      ? `Añada ${w.vintage}. Beber desde ${w.aging.drinkFrom}. Apogeo ${w.aging.peakStart}–${w.aging.peakEnd}. Límite prudente ${w.aging.holdTo}.`
      : `Añada ${w.vintage}. Ventana de consumo: Sin dato.`;
    body = `
      <p class="muted" style="margin:6px 0">${when}</p>
      <div class="peak-pill">${datesAreReal(w) ? (p.label || "").toUpperCase() : "SIN DATO"}</div>
      ${datesAreReal(w) ? `<div class="bar"><i style="width:${pr.pct}%"></i></div>
      <div class="row tiny"><span>${w.vintage}</span><span>hoy ${YEAR}</span><span>${w.aging.holdTo}</span></div>` : ""}
      <div class="timeline">
        ${(w.evolutionNotes || []).map(n => `<div class="tl-item"><em>${n.year} · ${n.phase}</em><strong>${escHtml(n.text)}</strong></div>`).join("")}
        <div class="tl-item"><em>${YEAR} · Estado actual</em><strong>${datesAreReal(w) ? currentAdvice(w, p) : "Sin dato de ventana. Pulsa Completar ficha."}</strong></div>
      </div>`;
  } else if (kind === "profile") {
    body = `
      <p class="muted">${w.appellation} · ${w.country}</p>
      <h3 style="margin:8px 0 6px">${w.producer}</h3>
      <p>${w.name} ${w.vintage}</p>
      <div class="card" style="margin-top:12px">
        <h2>Cata publicada</h2>
        <p style="margin-top:8px">${w.tasting}</p>
      </div>
      <div class="card">
        <p>Uvas: ${(w.grapes || []).join(", ") || "—"}</p>
        <p class="muted">${w.abv ? w.abv + "% vol." : "Sin dato"} · ${escHtml(styleLabel(w))} · ${w.priceHint && w.priceHint !== "—" ? escHtml(w.priceHint) : "Sin dato"}</p>
      </div>
      <div class="card">
        <p class="tiny">Suelos</p>
        <p class="muted" style="margin-top:6px">${dossierOf(w).soils}</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('tecnica')">Ficha técnica completa ›</button>`;
  } else if (kind === "origen") {
    const b = currentBottle;
    const pend = pendingForWine(w.id)[0];
    const pos = b ? (b.bin || "sin hueco") : (pend && pend.bin ? pend.bin + " · pendiente" : "—");
    const caveLabel = b ? cellarName(b.cellarId) : (pend ? cellarName(pend.cellarId) + " · aún no está en la bodega" : "No está en cava");
    body = `
      <div class="fact"><span>Posición</span><b>${pos}</b></div>
      <div class="fact"><span>Vinoteca</span><b>${caveLabel}</b></div>
      <div class="fact"><span>Bodega</span><b>${w.producer}</b></div>
      <div class="fact"><span>Añada</span><b>${w.vintage}</b></div>
      <div class="fact"><span>Denominación</span><b>${w.appellation}</b></div>
      <div class="fact"><span>Región</span><b>${w.region}</b></div>
      <div class="fact"><span>País</span><b>${w.country}</b></div>
      ${b && b.price ? `<div class="fact"><span>Precio</span><b>${b.price} €</b></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:14px" onclick="openWineSub('mapa')">Ver mapa de la zona</button>`;
  } else if (kind === "mapa") {
    body = mapaBlock(w) + mapTabs("mapa");
  } else if (kind === "vinos") {
    const house = WINE_CATALOG.filter(x => x.producer === w.producer);
    const zone = WINE_CATALOG.filter(x => x.producer !== w.producer && (x.region === w.region || x.appellation === w.appellation));
    const ownHouse = (!house.length && w.houseWines) ? w.houseWines : [];
    body = mapTabs("vinos") + `
      <h2>${w.producer}</h2>
      ${house.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.name} ${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
        <p class="muted">${s.appellation}</p>
      </div>`).join("") || ownHouse.map(s => `<div class="card"><div class="row"><h3>${escHtml(s.name)}</h3></div><p class="muted">${escHtml(s.note || "")}</p></div>`).join("") || `<p class="muted">${w.provenance ? "Sin dato" : "Solo esta referencia de la casa."}</p>`}
      ${zone.length ? `<h2 style="margin-top:16px">Misma zona</h2>` + zone.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.producer} ${s.name}</h3><span class="badge">${s.vintage}</span></div>
      </div>`).join("") : ""}`;
  } else if (kind === "anadas") {
    const sibs = WINE_CATALOG.filter(x => x.producer === w.producer && x.name === w.name);
    const extra = (!sibs.length && Array.isArray(w.vintages)) ? w.vintages : [];
    body = sibs.length ? sibs.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
      <div class="row"><h3>${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
      <p class="muted">${s.priceHint} · ${phaseOf(s).label}</p>
    </div>`).join("") : (extra.length ? extra.map(s => `<div class="card">
      <div class="row"><h3>${escHtml(String(s.vintage))}</h3></div>
      <p class="muted">${escHtml([s.priceHint, s.note].filter(Boolean).join(" · ") || "Sin dato")}</p>
    </div>`).join("") : `<p class="muted">${w.provenance ? "Sin dato" : "No hay otras añadas en el catálogo."}</p>`);
  } else if (kind === "compras") {
    const b = currentBottle;
    const d = dossierOf(w);
    const cost = b && b.price && !state.prefs.hidePrices ? b.price : null;
    const est = d.market && d.market.mid ? d.market.mid : null;
    const pct = cost && est ? Math.round(((est - cost) / cost) * 100) : null;
    body = state.prefs.hideValue ? `<p class="muted">Valor oculto en Privacidad.</p>` : `
      <div class="temp-grid">
        <div class="temp"><span class="tiny">Compra</span><b>${cost ? cost + " €" : "—"}</b></div>
        <div class="temp"><span class="tiny">Estimado</span><b>${est ? est + " €" : "—"}</b></div>
        <div class="temp"><span class="tiny">Δ</span><b>${pct == null ? "—" : (pct>=0?"+":"")+pct+"%"}</b></div>
        <div class="temp"><span class="tiny">Uds</span><b>${b ? b.qty : 0}</b></div>
      </div>
      <div class="card"><p class="tiny">Movimientos</p>
        ${b ? `<p style="margin-top:8px">Compra · ${b.qty} bot. · ${b.bought || "fecha n/d"} ${cost ? "· "+cost+" €/bot." : ""}</p>
        ${b.note ? `<p class="muted">${b.note}</p>` : ""}` : `<p class="muted">Aún no está en cava.</p>`}
      </div>
      <button class="btn btn-ghost" style="width:100%" onclick="openWineSub('mercado')">Horquilla de mercado ›</button>`;
  } else if (kind === "taste") {
    const t = getTaste(w.id);
    const axis = (left, right, field, val) => `
      <div class="axis">
        <span>${left}</span>
        <input type="range" min="1" max="10" value="${val}" oninput="setTaste('${w.id}','${field}',this.value)" />
        <span>${right}</span>
      </div>`;
    body = `
      <p class="cata-mark">✎</p>
      <h2 class="cata-title">Cuaderno de cata</h2>
      <p class="cata-kicker">Tu nota, no la de las guías.</p>
      ${axis("Débil", "Ácido", "acidez", t.acidez)}
      ${axis("Seco", "Dulce", "dulzor", t.dulzor)}
      ${axis("Suave", "Tánico", "tanino", t.tanino)}
      ${axis("Ligero", "Poderoso", "cuerpo", t.cuerpo)}
      <label class="recuerdo">Recuerdo
        <textarea onchange="setTaste('${w.id}','note',this.value)" placeholder="¿Qué se te queda en la memoria?">${(t.note || "").replace(/</g, "")}</textarea>
      </label>
      <p class="cata-foot">Casa Llavaneras</p>`;
  } else {
    const cave = currentBottle && state.vinotecas.find(v => v.id === currentBottle.cellarId);
    body = currentBottle ? `
      <p class="tiny">${houseName(cave && cave.houseId)} · ${cellarName(currentBottle.cellarId)}</p>
      ${cave && cave.photo ? `<img class="estate-wide" src="${cave.photo}" alt="Vinoteca">` : `<img class="estate-wide" src="cave-principal.jpg" alt="Cava">`}
      <div class="fact"><span>Estantería / hueco</span><b>${state.prefs.hideBin ? "Oculto" : (currentBottle.bin || "sin hueco")}</b></div>
      <div class="fact"><span>Cantidad</span><b>${currentBottle.qty}</b></div>
      <div class="fact"><span>Entrada</span><b>${currentBottle.bought || "—"}</b></div>
      ${!state.prefs.hidePrices && currentBottle.price ? `<div class="fact"><span>Precio</span><b>${currentBottle.price} €</b></div>` : ""}
      ${currentBottle.note ? `<div class="card"><p>${currentBottle.note}</p></div>` : ""}
      ${currentBottle.labelPhoto ? `<img class="cave-photo" src="${currentBottle.labelPhoto}" alt="Etiqueta escaneada" />` : ""}
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="addToLot(1)">+1</button>
        <button class="btn btn-gold" onclick="consumeBottle(1)">Servir 1</button>
        <button class="btn btn-ghost" onclick="consumeMany()">Servir N</button>
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="showSheet('move-sheet')">Mover lote</button>
        <button class="btn btn-ghost" onclick="showSheet('add-sheet')">Otra ubicación</button>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('compras')">Compras e historial ›</button>` : `
      <p class="muted" style="margin-bottom:12px">Este vino aún no está en tu cava.</p>
      <div class="btn-row">
        <button class="btn btn-gold" onclick="quickAdd('${w.id}')">Añadir a vinoteca</button>
        <button class="btn btn-ghost" onclick="showSheet('add-sheet')">Elegir hueco</button>
      </div>`;
  }
  const art = estateArt(w);
  const bodegaImg = "";
  const titleCss = kind === "mapa" ? "font-size:22px;margin:4px 0 10px;line-height:1.15" : "margin-bottom:16px";
  const eyeCss = kind === "mapa" ? "font-size:10px;margin:0" : "";
  $("#wine-sub-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    ${bodegaImg}
    <p class="eyebrow" style="${eyeCss}">${w.name} ${w.vintage}</p>
    <h1 style="${titleCss}">${titles[kind] || "Ficha"}</h1>
    ${body}`;
  show("wine-sub");
}

function pairingBlock(w) {
  const pack = pairingPackOf(w);
  if (!pack) return `<p class="muted">Sin dato</p>`;
  const inCellar = state.bottles.some(b => b.wineId === w.id);
  return `
    <h2 style="margin-top:16px">Maridajes de este vino</h2>
    <p class="muted" style="margin:6px 0 10px">${pack.logic}</p>
    <div class="card"><p class="tiny">Servicio en mesa</p><p>${escHtml(pack.serve || "Sin dato")}</p>
      ${(pack.avoid && pack.avoid.length) ? `<p class="muted" style="margin-top:8px">Evitar: ${escHtml(pack.avoid.join(" · "))}</p>` : ""}</div>
    ${pack.matches.map(m => {
      const d = m.dishId && PAIRING_DISHES.find(x => x.id === m.dishId);
      const badge = m.score ? `<span class="badge">${m.score}/100</span>` : "";
      if (!d) return `<div class="card"><div class="row"><h3>${escHtml(m.label || m.why)}</h3>${badge}</div></div>`;
      return `<div class="card" role="button" onclick="openDish('${d.id}')">
        <div class="row"><h3>${d.icon} ${d.name}</h3><span class="badge ${m.score >= 94 ? "ok" : m.score >= 88 ? "warn" : ""}">${m.score}/100</span></div>
        <p class="muted">${m.why}</p>
        <p class="tiny">${d.family} · ${d.heat}${inCellar ? " · lo tienes en vinoteca" : ""}</p>
      </div>`;
    }).join("")}
    <button class="btn btn-ghost" style="width:100%;margin-bottom:8px" onclick="show('pairings')">Explorar todos los maridajes</button>`;
}

function renderPairings() {
  const q = (pairingQuery || "").toLowerCase();
  if (pairingMode === "platos") {
    const dishes = (PAIRING_DISHES || []).filter(d => `${d.name} ${d.family} ${(d.tags || []).join(" ")}`.toLowerCase().includes(q));
    $("#pair-body").innerHTML = dishes.map(d => {
      const wines = winesForDish(d.id);
      const best = wines[0];
      const label = best ? pairLabel(best.wine) : "";
      return `<article class="card dish-hit" role="button" tabindex="0" onclick="openDish('${d.id}')">
        <div class="row"><h3>${d.icon} ${d.name}</h3><span class="badge">${wines.length} vino${wines.length === 1 ? "" : "s"} ›</span></div>
        <p class="muted">${d.family} · ${d.heat}</p>
        ${best ? `<p class="tiny" style="margin-top:8px;color:#c9a227" onclick="event.stopPropagation();openWine('${best.wine.id}')">Mejor encaje: ${label} · ${best.score} ›</p>` : ""}
        <button type="button" class="btn btn-ghost" style="width:100%;margin-top:10px;pointer-events:none">Ver vinos del plato</button>
      </article>`;
    }).join("") || `<p class="empty">Sin platos con ese nombre.</p>`;
    return;
  }
  const source = pairingMode === "cava"
    ? [...new Set(state.bottles.map(b => b.wineId))].map(wineById).filter(Boolean)
    : WINE_CATALOG;
  const list = source.filter(w => `${w.producer} ${w.name} ${w.region} ${w.pairing.join(" ")}`.toLowerCase().includes(q));
  $("#pair-body").innerHTML = list.map(w => {
    const pack = WINE_PAIRINGS[w.id];
    const top = pack?.matches?.[0];
    const d = top ? PAIRING_DISHES.find(x => x.id === top.dishId) : null;
    const have = state.bottles.filter(b => b.wineId === w.id).reduce((n, b) => n + b.qty, 0);
    return `<div class="pair-card" role="button" onclick="openWine('${w.id}');setTimeout(()=>openWineSub('pairings'),40)">
      <div class="pair-thumb" style="--c:${w.color}"></div>
      <div class="pair-copy">
        <h3>${shortWineName(w)}</h3>
        <p class="muted">${w.name} ${w.vintage} · ${w.region}</p>
        <p class="pair-dish">${d ? d.name : ((w.pairing || []).slice(0,2).join(" · "))}</p>
        <p class="pair-score-line">${top ? "★ " + top.score + "/100" : "★ ficha"}</p>
      </div>
      <span class="pair-go">›</span>
    </div>`;
  }).join("") || `<p class="empty">Sin coincidencias.</p>`;
}

function winesForDish(dishId) {
  const table = window.WINE_PAIRINGS || {};
  return Object.entries(table).map(([id, pack]) => {
    const m = (pack.matches || []).find(x => x.dishId === dishId);
    if (!m) return null;
    const wine = wineById(id);
    if (!wine) return null;
    return { wine, score: m.score, why: m.why, pack };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}

function openDish(id) {
  try {
    pairingDish = id;
    const d = (PAIRING_DISHES || []).find(x => x.id === id);
    if (!d) return;
    const wines = winesForDish(id);
    const inCava = wines.filter(x => state.bottles.some(b => b.wineId === x.wine.id));
    const title = (d.icon ? d.icon + " " : "") + d.name;
    const body = $("#dish-body");
    if (!body) return;
    body.innerHTML = `
    <button type="button" class="back" onclick="goBack()">‹ Mesa</button>
    <p class="eyebrow">${d.family || "Plato"}</p>
    <h1>${title}</h1>
    <p class="muted">${d.heat || ""} · ${(d.tags || []).join(" · ")}</p>
    ${inCava.length ? `<div class="card" style="margin-top:12px"><h2>En tu vinoteca ahora</h2>
      ${inCava.map(x => `<p role="button" style="margin-top:8px" onclick="openWine('${x.wine.id}')"><strong>${pairLabel(x.wine)} ${x.wine.vintage}</strong> · ${x.score}/100 ›<br><span class="muted">${x.why}</span></p>`).join("")}
    </div>` : `<p class="muted" style="margin-top:12px">Ninguna botella de este maridaje está en stock. Abajo, el catálogo.</p>`}
    <h2 style="margin-top:16px">Ranking por encaje</h2>
    ${wines.length ? wines.map(x => {
      const have = state.bottles.some(b => b.wineId === x.wine.id);
      return `<div class="card" role="button" onclick="openWine('${x.wine.id}')">
        <div class="row"><h3>${pairLabel(x.wine)}</h3><span class="badge ${x.score>=94?"ok":"warn"}">${x.score}</span></div>
        <p class="muted">${x.wine.vintage} · ${x.wine.region} · ${x.wine.type}</p>
        <p style="margin-top:8px">${x.why || ""}</p>
        <p class="tiny">${(x.pack && x.pack.serve) || ""}${have ? " · lo tienes" : ""}</p>
      </div>`;
    }).join("") : `<p class="empty">Aún no hay vinos enlazados a este plato.</p>`}
    <h2>Regla de mesa</h2>
    ${(window.PAIRING_RULES || []).map(r => `<div class="card"><strong>${r.title}</strong><p class="muted">${r.text}</p></div>`).join("")}`;
    show("dish");
  } catch (err) {
    console.warn("openDish", err);
    show("dish");
  }
}

function adviseCave(w) {
  const best = state.vinotecas.map(v => {
    const target = (w.conservation.cellarMin + w.conservation.cellarMax) / 2;
    const mid = (v.tHigh + v.tLow) / 2;
    return { v, diff: Math.abs(mid - target) };
  }).sort((a, b) => a.diff - b.diff)[0];
  if (!best) return "";
  const live = best.v.tHigh;
  const high = live > w.conservation.cellarMax + 1;
  return `<p style="margin-top:8px">Recomendación: <strong>${best.v.name}</strong> (ahora a ${live.toFixed(1)} °C). ${
    high
      ? `La lectura actual está por encima de la guarda ideal (${w.conservation.cellarMin}–${w.conservation.cellarMax} °C). Baja SET 1 en La Sommelière.`
      : best.diff < 1.2 ? "Temperatura idónea." : "Ajusta 1 °C si puedes; la estabilidad importa más."
  }</p>`;
}

function currentAdvice(w, p) {
  if (p.key === "wait") return `No está en su momento. Guárdalo a ${w.conservation.cellarMin}–${w.conservation.cellarMax} °C hasta ${w.aging.drinkFrom}. Abrirlo ahora pierde complejidad.`;
  if (p.key === "ok" && YEAR < w.aging.peakStart) return `Ya se puede servir. Decanta según el tipo (${w.type === "tinto" ? "60–120 min" : "no es necesario"}). El apogeo empieza en ${w.aging.peakStart}.`;
  if (p.key === "ok") return `Está en la meseta. Sirve a ${w.conservation.serveMin}–${w.conservation.serveMax} °C. Es el intervalo que pedías para tomarlo.`;
  if (p.key === "warn") return `Ha pasado el corazón del apogeo. Sigue noble, pero cada año suma terciarios y resta fruta. Priorízalo en el calendario.`;
  return `Fuera de ventana prudente. Ábrelo solo si aceptas un perfil muy evolucionado. Revisa corcho y nivel.`;
}

function stockOf(wineId) {
  return state.bottles.filter(b => b.wineId === wineId).reduce((n, b) => n + b.qty, 0);
}
function logAct(text) {
  state.activity = state.activity || [];
  state.activity.unshift({ at: Date.now(), text });
  state.activity = state.activity.slice(0, 40);
}
function refreshAddKeep() {
  const hint = $("#add-keep-hint");
  if (!hint) return;
  if (!currentWine) { hint.textContent = ""; return; }
  hint.textContent = keepHint(currentWine, ($("#add-cellar") && $("#add-cellar").value) || "v1");
}
function corkHumidity(w) {
  return (w && w.conservation && w.conservation.humidity) || "65–75%";
}
function keepHint(w, cellarId) {
  if (!w || !w.conservation) return "";
  const c = w.conservation;
  const hrIdeal = corkHumidity(w);
  const cave = state.vinotecas.find(v => v.id === cellarId);
  const nowT = cave ? cave.tHigh : null;
  const nowH = cave && cave.humidity != null ? cave.humidity : null;
  const okT = nowT == null || (nowT >= c.cellarMin - 1 && nowT <= c.cellarMax + 1);
  const nums = String(hrIdeal).match(/\d+/g) || ["65", "75"];
  const hMin = Number(nums[0]);
  const hMax = Number(nums[1] || nums[0]);
  const okH = nowH == null || (nowH >= hMin - 5 && nowH <= hMax + 5);
  let line = `Guarda ${c.cellarMin}–${c.cellarMax} °C · humedad corcho ${hrIdeal} · ${c.position || "horizontal"}`;
  if (nowT != null) line += ` · cava ${nowT.toFixed(1)} °C${okT ? "" : " fuera de rango"}`;
  if (nowH != null) line += ` · ${nowH}% HR${okH ? "" : " seca para el corcho"}`;
  return line;
}
function preferredCellar(w, price) {
  const vip = state.vinotecas.find(v => v.role === "prestige") || state.vinotecas[0];
  const other = state.vinotecas.find(v => v.id !== (vip && vip.id)) || vip;
  const p = Number(price) || 0;
  const score = w && w.ratings && w.ratings.parker ? w.ratings.parker.score : 0;
  if ((p >= 80 || score >= 95) && vip) return vip.id;
  return (other && other.id) || (vip && vip.id) || "v1";
}
function mergeOrCreateLot({ wineId, cellarId, bin, qty, price, note, photo }) {
  const hit = state.bottles.find(b => b.wineId === wineId && b.cellarId === cellarId && (b.bin || "") === (bin || ""));
  if (hit) {
    hit.qty += qty;
    if (price) hit.price = price;
    if (photo) hit.labelPhoto = photo;
    if (note) hit.note = [hit.note, note].filter(Boolean).join(" · ");
    return hit;
  }
  const lot = {
    uid: "b" + Date.now() + Math.random().toString(16).slice(2, 6),
    wineId, qty, cellarId, bin: bin || nextBin(cellarId),
    bought: NOW.toISOString().slice(0, 10),
    price: price || 0, note: note || "", labelPhoto: photo || ""
  };
  state.bottles.push(lot);
  return lot;
}
function consumeBottle(n) {
  if (!currentBottle) return;
  const take = Math.max(1, parseInt(n || 1, 10));
  const wineId = currentBottle.wineId;
  const have = currentBottle.qty;
  const used = Math.min(take, have);
  currentBottle.qty -= used;
  logAct(`Servidas ${used} · ${wineById(wineId).producer} ${wineById(wineId).name}`);
  if (currentBottle.qty <= 0) {
    const uid = currentBottle.uid;
    state.bottles = state.bottles.filter(b => b.uid !== uid);
    currentBottle = state.bottles.find(b => b.wineId === wineId) || null;
  }
  save();
  toast(currentBottle ? `${used} servida${used>1?"s":""} · quedan ${currentBottle.qty}` : `${used} servida${used>1?"s":""} · lote vacío`);
  openWine(wineId, currentBottle);
}
function addToLot(n) {
  if (!currentBottle) return showSheet("add-sheet");
  const add = Math.max(1, parseInt(n || 1, 10));
  currentBottle.qty += add;
  logAct(`Entrada +${add} · ${cellarName(currentBottle.cellarId)} ${currentBottle.bin||""}`);
  save();
  toast(`+${add} · lote ${currentBottle.qty}`);
  openWine(currentBottle.wineId, currentBottle);
}

function addCurrentToCellar() {
  if (!currentWine) return;
  const cellarId = $("#add-cellar").value;
  const qty = Math.max(1, parseInt($("#add-qty").value || "1", 10));
  const bin = $("#add-bin").value.trim() || nextBin(cellarId);
  const price = parseFloat($("#add-price").value || "0");
  const note = $("#add-note").value.trim();
  currentBottle = mergeOrCreateLot({
    wineId: currentWine.id, cellarId, bin, qty, price, note, photo: lastLabelData || ""
  });
  const inboxUid = $("#add-inbox-uid") && $("#add-inbox-uid").value;
  if (inboxUid) {
    const row = (state.inbox || []).find(x => x.uid === inboxUid);
    if (row) {
      row.entered = true;
      row.cellarId = cellarId;
      row.bin = bin;
    }
    $("#add-inbox-uid").value = "";
  }
  try { logAct(`Alta +${qty} ${currentWine.producer} ${currentWine.name} → ${cellarName(cellarId)} ${bin}`); } catch (e) {}
  save();
  hideSheets();
  const tmin = currentWine.conservation && currentWine.conservation.cellarMin;
  toast(tmin ? `${qty} en ${cellarName(cellarId)} · ${bin}` : `${qty} en ${cellarName(cellarId)}`);
  openWine(currentWine.id, currentBottle);
}

function moveBottle() {
  if (!currentBottle) return;
  const dest = $("#move-cellar").value;
  const bin = $("#move-bin").value.trim();
  const qty = Math.max(1, parseInt(($("#move-qty") && $("#move-qty").value) || currentBottle.qty, 10));
  const take = Math.min(qty, currentBottle.qty);
  const from = cellarName(currentBottle.cellarId) + " " + (currentBottle.bin || "");
  if (take >= currentBottle.qty) {
    const merged = state.bottles.find(b => b.uid !== currentBottle.uid && b.wineId === currentBottle.wineId && b.cellarId === dest && (b.bin || "") === bin);
    if (merged) {
      merged.qty += currentBottle.qty;
      state.bottles = state.bottles.filter(b => b.uid !== currentBottle.uid);
      currentBottle = merged;
    } else {
      currentBottle.cellarId = dest;
      currentBottle.bin = bin;
    }
  } else {
    currentBottle.qty -= take;
    currentBottle = mergeOrCreateLot({
      wineId: currentBottle.wineId, cellarId: dest, bin, qty: take,
      price: currentBottle.price, note: "Traslado", photo: currentBottle.labelPhoto || ""
    });
  }
  logAct(`Traslado ${take} · ${from} → ${cellarName(dest)} ${bin}`);
  save();
  hideSheets();
  openBottle(currentBottle.uid);
  toast(`Movidas ${take}`);
}

function addCave() {
  const name = $("#new-cave-name").value.trim();
  if (!name) return;
  state.vinotecas.push({
    id: "v" + Date.now(),
    name,
    house: ($("#new-cave-house") && $("#new-cave-house").value.trim()) || "",
    brand: $("#new-cave-brand").value.trim() || "Vinoteca",
    capacity: parseInt($("#new-cave-cap").value || "24", 10),
    used: 0,
    tHigh: parseFloat($("#new-cave-th").value || "13"),
    tLow: parseFloat($("#new-cave-tl").value || "11"),
    humidity: parseInt($("#new-cave-hr").value || "68", 10),
    bins: ($("#new-cave-bins") && $("#new-cave-bins").value.trim()) || "",
    slots: nextSlotNumbers({ slots: [], id: "new" }, Math.max(1, parseInt(($("#new-cave-slots") && $("#new-cave-slots").value) || "12", 10))),
    place: ($("#new-cave-place") && $("#new-cave-place").value.trim()) || "",
    houseId: ensureHouse(($("#new-cave-house") && $("#new-cave-house").value.trim()) || "Casa Llavaneras"),
    zones: ["Personalizada"]
  });
  save();
  hideSheets();
  renderCaves();
  toast("Vinoteca creada");
}

function normTxt(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function setCamButton(label) {
  const b = $("#scan-cam-btn");
  if (b) b.textContent = label;
}
function resetScanPreview() {
  const preview = $("#scan-preview");
  if (preview) { preview.hidden = true; preview.removeAttribute("src"); }
  const finder = $("#scan-finder");
  if (finder) finder.style.display = "";
  const video = $("#cam");
  if (video) video.hidden = true;
}
async function startLiveCamera() {
  stopCam();
  const video = $("#cam");
  if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setCamButton("Abrir cámara");
    return false;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      audio: false
    });
    video.srcObject = stream;
    video.hidden = false;
    const finder = $("#scan-finder");
    if (finder) finder.style.display = "none";
    await video.play();
    setCamButton("Capturar etiqueta");
    setScanStatus("Encuadra la etiqueta en vertical y pulsa Capturar etiqueta.");
    return true;
  } catch (e) {
    if (video) video.hidden = true;
    setCamButton("Abrir cámara");
    return false;
  }
}
async function startScan() {
  show("scan");
  lastList = "scan";
  intakeSource = "camara";
  resetScanPreview();
  if ($("#scan-results")) $("#scan-results").innerHTML = "";
  const ok = await startLiveCamera();
  if (!ok) setScanStatus("Cámara no disponible. Abre la cámara del sistema, elige una foto o usa el alta manual.");
}
async function captureOrOpenCamera() {
  if (screenId !== "scan") {
    show("scan");
    lastList = "scan";
  }
  intakeSource = "camara";
  const video = $("#cam");
  if (video && video.srcObject && video.videoWidth) {
    captureLabel();
    return;
  }
  const ok = await startLiveCamera();
  if (!ok) pickLabelPhoto();
}
function onScanStage() {
  const video = $("#cam");
  if (video && video.srcObject && video.videoWidth) captureLabel();
  else captureOrOpenCamera();
}

function stopCam() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  const video = $("#cam");
  if (video) video.srcObject = null;
}

function setScanStatus(msg) {
  const el = $("#scan-status");
  if (el) el.textContent = msg;
}

function pickLabelPhoto() {
  intakeSource = "camara";
  const input = $("#scan-file-cam") || $("#scan-file");
  if (!input) return;
  input.setAttribute("accept", "image/*");
  input.setAttribute("capture", "environment");
  openPhotoInput(input);
}

function pickFromRoll() {
  intakeSource = "fototeca";
  if (screenId !== "scan") {
    show("scan");
    lastList = "scan";
  }
  const input = $("#scan-file-lib") || $("#scan-file");
  if (!input) return;
  input.removeAttribute("capture");
  input.setAttribute("accept", "image/*");
  openPhotoInput(input);
}

function openPhotoInput(input) {
  input.value = "";
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => ingestLabelImage(reader.result);
    reader.readAsDataURL(file);
  };
  input.click();
}

function captureLabel() {
  const video = $("#cam");
  if (!video || !video.videoWidth) {
    pickLabelPhoto();
    return;
  }
  intakeSource = "camara";
  const canvas = $("#scan-canvas");
  const maxW = 900;
  const scale = Math.min(1, maxW / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  ingestLabelImage(canvas.toDataURL("image/jpeg", 0.82));
}

function showLabelPreview(dataUrl) {
  const img = $("#scan-preview");
  const video = $("#cam");
  const finder = $("#scan-finder");
  img.src = dataUrl;
  img.hidden = false;
  if (video) video.hidden = true;
  if (finder) finder.style.display = "none";
  stopCam();
}

function compressDataUrl(dataUrl, maxW = 900, quality = 0.8) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function ingestLabelImage(dataUrl) {
  lastLabelData = await compressDataUrl(dataUrl, 720, 0.72);
  showLabelPreview(lastLabelData);
  await identifyFromPhoto(lastLabelData);
}

let lastOcrText = "";
let lastOcrRaw = "";
let lastOcrNote = "";

const OCR_WINE_WORDS = new Set("vina vinas vinedo vinedos vieja viejas reserva crianza roble joven gran tinto blanco rosado espumoso generoso brut cosecha seleccion pago finca rioja ribera duero priorat rias baixas rueda bierzo penedes cava champagne".split(" "));
const OCR_CONNECTORS = new Set("de del la las los y do da di el".split(" "));
let ocrLexiconCache = null;
function wineLexicon() {
  if (ocrLexiconCache) return ocrLexiconCache;
  const set = new Set();
  const add = (s) => normTxt(s).split(" ").forEach(w => { if (w.length >= 4) set.add(w); });
  try {
    (typeof WINE_CATALOG !== "undefined" ? WINE_CATALOG : []).forEach(w => {
      add(w.producer); add(w.name); add(w.region); add(w.appellation);
      (w.aliases || []).forEach(add);
    });
    if (typeof BODEGA_GEO !== "undefined") Object.keys(BODEGA_GEO).forEach(add);
  } catch (e) {}
  ocrLexiconCache = set;
  return set;
}
function lineLetterDensity(line) {
  const compact = String(line || "").replace(/\s/g, "");
  if (!compact) return 0;
  const letters = (compact.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
  return letters / compact.length;
}
function classifyOcrToken(tok, lexicon) {
  if (/^(19|20)\d{2}$/.test(tok)) return "year";
  const letters = String(tok || "").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (!letters) return "";
  if (/[a-záéíóúüñ][A-ZÁÉÍÓÚÜÑ]/.test(letters) || /[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+[A-ZÁÉÍÓÚÜÑ]/.test(letters)) return "";
  const n = normTxt(letters);
  if (OCR_CONNECTORS.has(n)) return "conn";
  if (letters.length < 3) return "";
  if (OCR_WINE_WORDS.has(n) || (lexicon && lexicon.has(n))) return "known";
  if (letters.length >= 4 && letters === letters.toUpperCase()) return "caps";
  if (/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]{2,}$/.test(letters)) return "title";
  return "";
}
function wordsFromOcrLine(line, lexicon) {
  const tokens = String(line || "").split(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/).filter(Boolean);
  const marks = tokens.map(tok => ({ tok, kind: classifyOcrToken(tok, lexicon) }));
  const strong = marks.some(m => m.kind === "known" || m.kind === "caps" || m.kind === "year");
  const chosen = marks.map(m => m.kind === "year" || m.kind === "known" || m.kind === "caps" || (m.kind === "title" && strong));
  const out = [];
  marks.forEach((m, i) => {
    if (chosen[i]) { out.push(m.tok); return; }
    if (m.kind !== "conn") return;
    if (chosen.slice(0, i).some(Boolean) && chosen.slice(i + 1).some(Boolean)) out.push(m.tok);
  });
  return out;
}
function prettyOcrWord(word) {
  if (/^(19|20)\d{2}$/.test(word)) return word;
  const lower = String(word || "").toLocaleLowerCase("es");
  if (OCR_CONNECTORS.has(normTxt(lower))) return lower;
  return lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
}
function cleanOcrQuery(raw) {
  const text = String(raw || "").replace(/\r/g, "");
  const lexicon = wineLexicon();
  const lines = text.split(/\n+| \/ | \/|\/ /).map(s => s.trim()).filter(Boolean);
  const picked = [];
  lines.forEach(line => {
    const letters = (line.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
    const uppers = (line.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
    const onlyYear = letters < 3 && /\b(?:19|20)\d{2}\b/.test(line);
    if (!onlyYear && lineLetterDensity(line) < 0.4 && uppers < 8 && letters < 10) return;
    const words = wordsFromOcrLine(line, lexicon);
    if (words.length) picked.push({ uppers, words });
  });
  if (!picked.length) return "";
  const bestUpper = Math.max.apply(null, picked.map(p => p.uppers));
  const use = bestUpper >= 8 ? picked.filter(p => p.uppers >= 8 || p.words.some(w => /^(19|20)\d{2}$/.test(w) || OCR_WINE_WORDS.has(normTxt(w)) || lexicon.has(normTxt(w)))) : picked;
  const seen = new Set();
  const words = [];
  use.forEach(p => p.words.forEach(w => {
    const key = normTxt(w);
    if (!key || seen.has(key)) return;
    seen.add(key);
    words.push(prettyOcrWord(w));
  }));
  while (words.length && OCR_CONNECTORS.has(normTxt(words[0]))) words.shift();
  while (words.length && OCR_CONNECTORS.has(normTxt(words[words.length - 1]))) words.pop();
  return words.join(" ").replace(/\s+/g, " ").trim();
}
function labelQueryUseful(query) {
  const words = String(query || "").split(/\s+/).filter(Boolean);
  const year = words.some(w => /^(19|20)\d{2}$/.test(w));
  const long = words.filter(w => normTxt(w).length >= 5 && !OCR_CONNECTORS.has(normTxt(w)));
  return (year && long.length >= 1) || long.length >= 2;
}
function queryFromLabelFields(obj) {
  if (!obj || typeof obj !== "object") return "";
  const yearNum = Math.round(Number(obj.vintage));
  const year = yearNum >= 1900 && yearNum <= YEAR + 1 ? String(yearNum) : "";
  const bits = [obj.producer, obj.name, obj.region].map(s => String(s || "").replace(/https?:\/\/\S+/gi, " ").replace(/\s+/g, " ").trim()).filter(s => s.length >= 2);
  let phrase = bits.join(" ");
  if (year) phrase = phrase.replace(new RegExp("\\b" + year + "\\b", "g"), " ");
  phrase = (phrase + (year ? " " + year : "")).replace(/\s+/g, " ").trim();
  return cleanOcrQuery(phrase) || phrase;
}
function repairOcr(raw) {
  let s = " " + normTxt(raw) + " ";
  const pesq = /pesquera|pesq|squera|squer|souera|esouera|ouera|so era|p e so|te p e so/.test(s)
    || (/tinto/.test(s) && /ribera del duero/.test(s) && /reserva/.test(s) && !/vega|unico|pingus|protos|malleolus/.test(s));
  if (pesq) s += " pesquera tinto ";
  s = s.replace(/ribera\s*del\s*duer[a-z]*/g, " ribera del duero ");
  s = s.replace(/denominaci[o0]n/g, " denominacion ");
  s = s.replace(/\breserva\b/g, " reserva ");
  s = s.replace(/\bcrianza\b/g, " crianza ");
  s = s.replace(/\btinto\b/g, " tinto ");
  s = s.replace(/\b(19|20)[\s\-]?([0-9]{2})\b/g, "$1$2");
  const years = s.match(/\b(?:19|20)\d{2}\b/g) || [];
  return { text: s.replace(/\s+/g, " ").trim(), years, pesquera: pesq || s.includes("pesquera") };
}

function labelReading(fixed) {
  const bits = [];
  if (fixed.pesquera) bits.push("Tinto Pesquera");
  if (fixed.text.includes("ribera del duero")) bits.push("Ribera del Duero");
  else if (fixed.text.includes("rioja")) bits.push("Rioja");
  else if (fixed.text.includes("priorat")) bits.push("Priorat");
  else if (fixed.text.includes("margaux")) bits.push("Margaux");
  if (fixed.text.includes("reserva")) bits.push("Reserva");
  if (fixed.text.includes("crianza")) bits.push("Crianza");
  if (fixed.years[0]) bits.push(fixed.years[0]);
  return bits.join(" · ");
}

function preprocessLabel(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(2, 1600 / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const pix = ctx.getImageData(0, 0, w, h);
      const d = pix.data;
      for (let i = 0; i < d.length; i += 4) {
        let v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
        v = (v - 128) * 1.25 + 138;
        d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v));
      }
      ctx.putImageData(pix, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractReady) return tesseractReady;
  tesseractReady = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error("ocr"));
    document.head.appendChild(s);
  });
  return tesseractReady;
}

async function ocrOnce(Tesseract, img, lang) {
  const result = await Tesseract.recognize(img, lang || "spa", {
    tessedit_pageseg_mode: "6",
    logger: m => {
      if (m.status === "recognizing text" && m.progress) {
        setScanStatus("Leyendo la etiqueta… " + Math.round(m.progress * 100) + "%");
      }
    }
  });
  return (result && result.data && result.data.text) || "";
}

function readableLabel(raw) {
  return String(raw || "").replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{2,}/g, "\n").trim();
}

async function readLabelText(dataUrl) {
  const Tesseract = await loadTesseract();
  const prep = await preprocessLabel(dataUrl);
  let best = "";
  let bestScore = -1;
  for (const lang of ["spa", "eng"]) {
    for (const img of [dataUrl, prep]) {
      try {
        const text = await Promise.race([
          ocrOnce(Tesseract, img, lang),
          new Promise((_, rej) => setTimeout(() => rej(new Error("ocr-timeout")), 22000))
        ]);
        const raw = readableLabel(text);
        const fixed = repairOcr(raw);
        const words = raw.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}/g) || [];
        const known = (fixed.text.match(/pesquera|margaux|vega|tondonia|pingus|ribera|reserva|rioja|priorat/g) || []).length;
        const score = words.length * 4 + Math.min(raw.length, 160) / 8 + (fixed.years.length ? 6 : 0) + known * 8;
        if (score > bestScore) { bestScore = score; best = raw; }
        if (words.length >= 3 && score >= 24) return best;
      } catch (e) {}
    }
    if (bestScore >= 24) break;
  }
  return best;
}

let lastInternetHits = [];
let photoSearchGen = 0;

function escHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const WINE_QUERY_GENERIC = new Set("vino vinos wine tinto tintos blanco blanca bodega bodegas reserva crianza gran vieja viejas vina vinas vinedo vinedos del los las con para desde ribera duero rioja ano anos mes meses botella botellas compra comprar tienda precio etiqueta".split(" "));
function queryTokens(q) {
  const all = normTxt(q).split(" ").filter(t => t.length >= 4 && !/^(19|20)\d{2}$/.test(t));
  const distinctive = all.filter(t => !WINE_QUERY_GENERIC.has(t));
  return distinctive.length ? distinctive : all;
}
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
}
function sourceFromUrl(url) {
  const host = hostOf(url);
  if (!host) return "Web";
  if (host.includes("vinissimus")) return "Vinissimus";
  if (host.includes("decantalo")) return "Decántalo";
  if (host.includes("bigshopper")) return "Bigshopper";
  if (host.includes("vivino")) return "Vivino";
  if (host.includes("google.")) return "Google";
  return host;
}
function priceIn(text) {
  const m = String(text || "").match(/(\d{1,4}[.,]\d{2})\s*€/);
  return m ? m[1].replace(".", ",") + " €" : "";
}
function unwrapSearchUrl(url) {
  try {
    const u = new URL(url);
    const uddg = u.searchParams.get("uddg");
    if (uddg) return uddg;
  } catch (e) {}
  return url;
}
function snippetText(raw) {
  return String(raw || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}
function rankWineHits(rows, q) {
  const tokens = queryTokens(q);
  const phraseTokens = normTxt(q).split(" ").filter(t => t.length >= 4 && !/^(19|20)\d{2}$/.test(t));
  const scored = [];
  const seen = new Set();
  rows.forEach(row => {
    const title = String(row.title || "").replace(/\s+/g, " ").trim();
    const url = String(row.url || "").trim();
    if (!title || /^image\s+\d+/i.test(title)) return;
    const key = normTxt(title);
    if (seen.has(key)) return;
    const titleHay = normTxt(title);
    const n = tokens.filter(t => titleHay.includes(t)).length;
    if (tokens.length && !n) return;
    let cover = phraseTokens.filter(t => titleHay.includes(t)).length;
    const host = hostOf(url);
    const bodega = tokens.some(t => t.length >= 5 && host.includes(t));
    const opinion = isOpinionPage(url, title);
    const product = isProductPageUrl(url);
    if (product) cover += 5;
    if (opinion) cover -= 5;
    if (bodega && !/vinissimus|decantalo|bigshopper|google/.test(host)) row.source = "Bodega · " + host;
    let pref = bodega ? 0 : /decantalo/.test(host) ? 1 : /vinissimus/.test(host) ? 2 : /bigshopper/.test(host) ? 3 : 4;
    if (product) pref = Math.min(pref, 1);
    if (opinion) pref = 8;
    seen.add(key);
    scored.push(Object.assign({}, row, { title, url, _cover: cover, _price: row.price ? 1 : 0, _pref: pref }));
  });
  scored.sort((a, b) => b._cover - a._cover || a._pref - b._pref || b._price - a._price);
  return scored.map(row => {
    const copy = Object.assign({}, row);
    delete copy._cover;
    delete copy._price;
    delete copy._pref;
    return copy;
  });
}
function parseDdgMarkdown(md) {
  const hits = [];
  const re = /^\d+\.\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gm;
  let m;
  while ((m = re.exec(md))) {
    const rawUrl = m[2];
    const around = md.slice(m.index, m.index + m[0].length + 80);
    if (/sponsored|ad_domain|\/y\.js/i.test(rawUrl + around)) continue;
    const url = unwrapSearchUrl(rawUrl);
    const host = hostOf(url);
    if (!host || host.includes("duckduckgo.com")) continue;
    const rest = md.slice(m.index + m[0].length);
    const next = rest.search(/\n\d+\.\[/);
    const extract = snippetText(next >= 0 ? rest.slice(0, next) : rest.slice(0, 500));
    hits.push({
      title: m[1].replace(/\s+/g, " ").trim(),
      url,
      extract,
      price: priceIn(extract),
      source: sourceFromUrl(url),
      kind: "web"
    });
  }
  return hits;
}
function parseVinissimusMarkdown(md, query) {
  const hits = [];
  const parts = String(md || "").split(/!\[[^\]]*:\s*/).slice(1);
  parts.forEach(part => {
    const titleEnd = part.indexOf("]");
    if (titleEnd < 1) return;
    const title = part.slice(0, titleEnd).replace(/\s+/g, " ").trim();
    if (!title || /^image\s+\d+/i.test(title)) return;
    const body = part.slice(titleEnd, titleEnd + 2500);
    const link = body.match(/https:\/\/www\.vinissimus\.com\/es\/vino\/[a-z0-9-]+\//i);
    if (!link) return;
    const producer = (body.match(/\n((?:Bodegas|Viñedos|Dominio|Bodega)[^\n]{3,80})/) || [])[1] || "";
    const region = (body.match(/\n([^\n]{3,60}\(España\))/) || [])[1] || "";
    const price = priceIn(body);
    hits.push({
      title,
      url: link[0],
      producer: producer.trim(),
      price,
      extract: [producer.trim(), region.trim()].filter(Boolean).join(" · "),
      source: "Vinissimus",
      kind: "tienda"
    });
  });
  if (!hits.length) {
    const url = productUrlInMarkdown(md, query);
    if (url) {
      hits.push({
        title: query || "Vino",
        url,
        producer: "",
        price: priceIn(md),
        extract: "",
        source: "Vinissimus",
        kind: "tienda"
      });
    }
  }
  return hits;
}
function searchPortals(q) {
  const enc = encodeURIComponent(q);
  return [
    { title: "«" + q + "» en Google", url: "https://www.google.com/search?hl=es&q=" + enc, source: "Google", extract: "La búsqueda en Google: bodega, vino y tiendas.", kind: "buscar" },
    { title: "«" + q + "» en Vinissimus", url: "https://www.vinissimus.com/es/search-result/?name=" + enc, source: "Vinissimus", extract: "Abrir el vino en la tienda Vinissimus.", kind: "buscar" },
    { title: "«" + q + "» en Decántalo", url: "https://www.decantalo.com/es/busqueda?controller=search&s=" + enc, source: "Decántalo", extract: "Abrir el vino en la tienda Decántalo.", kind: "buscar" }
  ];
}
async function readPublicPage(target, signal) {
  const res = await fetch("https://r.jina.ai/" + target, { signal, headers: { Accept: "text/plain" } });
  if (!res.ok) throw new Error("http-" + res.status);
  const text = await res.text();
  if (!text || text.length < 80) throw new Error("vacio");
  if (/just a moment|tr[aá]fico inusual|unusual traffic|captcha/i.test(text.slice(0, 700))) throw new Error("bloqueo");
  return text;
}
async function lookupWineOnline(query) {
  const q = readableLabel(query).replace(/\s+/g, " ");
  if (q.length < 3) {
    return { query: q, hits: [], state: "sin-texto", note: "No hay un nombre legible. Corrige el texto leído y vuelve a buscar." };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 16000);
  const pages = await Promise.allSettled([
    readPublicPage("https://www.vinissimus.com/es/search-result/?name=" + encodeURIComponent(q), ctrl.signal),
    readPublicPage("https://lite.duckduckgo.com/lite/?kl=es-es&q=" + encodeURIComponent(q + " vino"), ctrl.signal)
  ]);
  clearTimeout(timer);
  let found = [];
  if (pages[0].status === "fulfilled") found = found.concat(parseVinissimusMarkdown(pages[0].value, q));
  if (pages[1].status === "fulfilled") found = found.concat(parseDdgMarkdown(pages[1].value));
  const ranked = rankWineHits(found, q);
  const shops = ranked.filter(h => h.kind === "tienda").slice(0, 3);
  const web = ranked.filter(h => h.kind !== "tienda").slice(0, 3);
  const chosen = shops.concat(web);
  const portals = searchPortals(q).filter(p => p.source === "Google" || !chosen.some(h => h.source === p.source));
  const hits = chosen.concat(portals);
  const readShops = ranked.length > 0;
  const bothFailed = pages.every(p => p.status === "rejected");
  const note = readShops
    ? "Bodega y tiendas para «" + q + "». Google abre la misma búsqueda."
    : (bothFailed
      ? "No se pudo leer el listado. Abre Google, Vinissimus o Decántalo, o corrige el texto."
      : "No hay una ficha cerrada para «" + q + "». Abre Google o las tiendas, o corrige el texto leído.");
  return { query: q, hits, state: "ok", note };
}
function showScanConfirm(text, hits, remote) {
  const readable = readableLabel(text).replace(/\s+/g, " ");
  const list = (hits || []).slice(0, 4);
  remote = remote || { hits: [], state: "omitida", note: "Aún no se ha buscado en internet.", query: "" };
  lastInternetHits = remote.hits || [];
  const remoteCards = lastInternetHits.length ? lastInternetHits.map((h, i) => {
    const open = h.url ? `<a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center;text-decoration:none" href="${escHtml(h.url)}" target="_blank" rel="noopener">Abrir ${escHtml(h.source || "enlace")}</a>` : "";
    const use = h.kind === "buscar" ? "" : `<button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="confirmInternetWine(${i})">Usar esta ficha</button>`;
    const who = h.producer ? `<p class="muted">${escHtml(h.producer)}</p>` : "";
    const price = h.price ? `<p class="muted">${escHtml(h.price)}</p>` : "";
    return `
      <div class="card">
        <p class="tiny">${escHtml(h.source || "Web")}</p>
        <h3>${escHtml(h.title)}</h3>
        ${who}
        ${price}
        <p class="muted">${escHtml(h.extract || "")}</p>
        ${use}
        ${open}
      </div>`;
  }).join("") : `<div class="card"><p>${escHtml(remote.note || "Sin resultado.")}</p></div>`;
  const status = remote.state === "ok"
    ? ("Búsqueda: " + lastInternetHits.length + " resultado" + (lastInternetHits.length === 1 ? "" : "s") + " de bodega y tiendas.")
    : (remote.note || "Revisa el texto leído.");
  setScanStatus(status);
  const el = $("#scan-results");
  if (!el) return;
  el.innerHTML = `
    <div class="card">
      <p class="tiny">Texto leído de la etiqueta</p>
      <textarea id="scan-read" rows="2">${escHtml(readable)}</textarea>
      ${lastOcrRaw ? `<p class="tiny">Lectura en bruto: ${escHtml(lastOcrRaw)}</p>` : ""}
      ${lastOcrNote ? `<p class="tiny">${escHtml(lastOcrNote)}</p>` : ""}
      <p class="tiny">Si la lectura falla, corrige el texto y vuelve a buscar.</p>
      <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="searchCorrectedLabel()">Buscar este texto</button>
    </div>
    <h2 style="margin-top:14px">Bodega y tiendas</h2>
    <p class="tiny" style="margin:0 0 8px">${escHtml(remote.note || "")}</p>
    ${remoteCards}
    ${list.length ? `<h2 style="margin-top:14px">En el catálogo</h2>` + list.map(w => `
      <div class="card">
        <h3>${escHtml(w.producer)}</h3>
        <p class="muted">${escHtml(w.name + " " + w.vintage + " · " + (w.appellation || w.region || ""))}</p>
        <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="confirmScanWine('${w.id}')">Este es</button>
      </div>`).join("") : `<p class="empty">Ningún vino del catálogo local coincide.</p>`}
    <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="confirmScanCustom()">Crear ficha con lo escrito</button>`;
}
function searchCorrectedLabel() {
  const typed = readableLabel((($("#scan-read") && $("#scan-read").value) || ($("#scan-q") && $("#scan-q").value) || "")).replace(/\s+/g, " ");
  if ($("#scan-q")) $("#scan-q").value = typed;
  lastOcrText = typed;
  if (typed.length < 3) {
    setScanStatus("Escribe el nombre del vino para buscarlo.");
    return;
  }
  searchAndShowLabel(typed);
}

function confirmScanWine(id) {
  const w = wineById(id);
  if (!w) return;
  const q = (($("#scan-q") && $("#scan-q").value) || lastOcrText || "").trim();
  parkScanInInbox(ensureScannedWine(w, q), q, intakeSource || "camara");
}

function isCatalogWineId(id) {
  return (WINE_CATALOG || []).some(w => w.id === id);
}
function needsWineCompletion(w) {
  if (!w || isCatalogWineId(w.id)) return false;
  if (w.provenance && w.provenance.done) return false;
  return w.style === "internet" || w.style === "escaneo";
}
function showCompletingStatus() {
  setFichaProgress("Completando la ficha…");
}
function colorForWineType(type) {
  if (type === "blanco") return "#e8d9a0";
  if (type === "rosado") return "#e7b7c6";
  if (type === "espumoso") return "#efe3b8";
  if (type === "generoso") return "#c4a35a";
  return "#4a1020";
}
function wineTypeFromText(text) {
  const t = normTxt(text);
  if (/espumoso|cava|champagne|brut/.test(t)) return "espumoso";
  if (/blanco|white/.test(t)) return "blanco";
  if (/rosado|rose/.test(t)) return "rosado";
  if (/generoso|jerez|fino|oloroso/.test(t)) return "generoso";
  if (/tinto|red/.test(t)) return "tinto";
  return "";
}
function countryNameFrom(raw) {
  const n = normTxt(raw);
  if (/espana|spain/.test(n)) return "España";
  if (/francia|france/.test(n)) return "Francia";
  if (/italia|italy/.test(n)) return "Italia";
  if (/portugal/.test(n)) return "Portugal";
  if (/alemania|germany/.test(n)) return "Alemania";
  if (/argentina/.test(n)) return "Argentina";
  if (/chile/.test(n)) return "Chile";
  return String(raw || "").replace(/\s+/g, " ").trim();
}
function grapeListFrom(raw) {
  return String(raw || "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, m => (m.match(/\[([^\]]+)\]/) || [])[1] || "")
    .replace(/\d+\s*%/g, " ")
    .split(/,|\/|\+|\sy\s/i)
    .map(s => s.replace(/\s+/g, " ").trim())
    .filter(s => {
      if (s.length < 3 || s.length > 40) return false;
      if (/sulfito|contiene/i.test(s)) return false;
      return !/^(vino|tinto|blanco|rosado|red|white)( (tinto|blanco|rosado|red|white))?$/i.test(s);
    });
}
function lineField(text, label) {
  const re = new RegExp("(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?" + label + "(?:\\*\\*)?\\s*[:：]\\s*([^\\n]+)", "i");
  const m = String(text || "").match(re);
  if (!m) return "";
  return m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}
function productSlice(md) {
  const text = String(md || "");
  const ficha = text.search(/ficha t[eé]cnica/i);
  if (ficha >= 0) return text.slice(Math.max(0, ficha - 500), ficha + 4500);
  const head = text.search(/^#\s+\S/m);
  if (head >= 0) return text.slice(head, head + 4500);
  return text.slice(0, 5000);
}
function mdField(text, label) {
  const re = new RegExp("\\|\\s*" + label + "[^\\n|]*\\|\\s*([^\\n|]+)", "i");
  const m = String(text || "").match(re);
  if (!m) return "";
  return m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}
function parseWinePage(md) {
  const slice = productSlice(md);
  const facts = {};
  const tipo = mdField(slice, "Tipo") || mdField(slice, "Type") || lineField(slice, "Tipo(?: de vino)?") || lineField(slice, "Type");
  const type = wineTypeFromText(tipo);
  if (type) facts.type = type;
  const regionRaw = mdField(slice, "Regi[oó]n") || mdField(slice, "Denominaci[oó]n") || mdField(slice, "Appellation")
    || lineField(slice, "Regi[oó]n") || lineField(slice, "Denominaci[oó]n(?: de origen)?") || lineField(slice, "D\\.?O\\.?");
  if (regionRaw) {
    const place = regionRaw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    facts.region = (place ? place[1] : regionRaw).replace(/\s+/g, " ").trim();
    if (place) facts.country = countryNameFrom(place[2]);
    facts.appellation = facts.region;
  }
  if (!facts.country) {
    const countryCell = slice.match(/\(([A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{3,24})\)/);
    if (countryCell) facts.country = countryNameFrom(countryCell[1]);
  }
  const grapes = grapeListFrom(mdField(slice, "Uvas?") || mdField(slice, "Variedad(?:es)?") || lineField(slice, "Uvas?") || lineField(slice, "Variedad(?:es)?"));
  if (grapes.length) facts.grapes = grapes;
  const abvRaw = mdField(slice, "Graduaci[oó]n") || mdField(slice, "Alcohol") || mdField(slice, "Grado")
    || lineField(slice, "Graduaci[oó]n(?: alcoh[oó]lica)?") || lineField(slice, "Alcohol") || lineField(slice, "Grado(?: alcoh[oó]lico)?");
  const abvMatch = (abvRaw || slice).match(/(\d{1,2}(?:[,.]\d{1,2})?)\s*%/);
  if (abvMatch) {
    const abv = Number(abvMatch[1].replace(",", "."));
    if (abv >= 4 && abv <= 22) facts.abv = abv;
  }
  const producer = mdField(slice, "Productor") || mdField(slice, "Bodega") || lineField(slice, "Productor") || lineField(slice, "Bodega");
  if (producer && producer.length > 2 && producer.length < 80) facts.producer = producer;
  const crianza = mdField(slice, "Crianza") || mdField(slice, "Envejecimiento") || mdField(slice, "Barrica")
    || lineField(slice, "Crianza") || lineField(slice, "Envejecimiento");
  const crianzaProse = slice.match(/(\d+\s*meses en barrica[^\n.]{0,60}|crianza de \d+[^\n.]{0,60})/i);
  if (crianza || crianzaProse) facts.crianza = (crianza || crianzaProse[1]).replace(/\s+/g, " ").trim();
  const vista = mdField(slice, "Vista") || lineField(slice, "Vista");
  const nariz = mdField(slice, "Nariz") || lineField(slice, "Nariz");
  const boca = mdField(slice, "Boca") || lineField(slice, "Boca");
  const tasteBits = [vista && ("Vista: " + vista), nariz && ("Nariz: " + nariz), boca && ("Boca: " + boca)].filter(Boolean);
  if (tasteBits.length) facts.tasting = tasteBits.join(". ");
  const serveRange = slice.match(/(?:serv(?:ir|icio)|temperatura de servicio)[^\d]{0,40}(\d{1,2})\s*[–\-a]\s*(\d{1,2})\s*(?:º|°)?\s*C/i);
  const serveOne = slice.match(/(?:serv(?:ir|icio)|temperatura de servicio|consumo)[^\d]{0,24}(\d{1,2})\s*(?:º|°)\s*C/i);
  if (serveRange) {
    facts.serveMin = Number(serveRange[1]);
    facts.serveMax = Number(serveRange[2]);
  } else if (serveOne) {
    const n = Number(serveOne[1]);
    if (n >= 4 && n <= 22) { facts.serveMin = n; facts.serveMax = n; }
  }
  const euros = priceFromMarkdown(md);
  if (euros) facts.priceEur = euros;
  const style = styleFromText(slice);
  if (style) facts.style = style;
  return facts;
}
function styleFromText(text) {
  const t = normTxt(text);
  if (/gran reserva/.test(t)) return "gran_reserva";
  if (/\breserva\b/.test(t)) return "reserva";
  if (/crianza/.test(t)) return "crianza";
  if (/\broble\b/.test(t)) return "roble";
  if (/\bjoven\b/.test(t)) return "joven";
  return "";
}
function priceFromMarkdown(md) {
  const text = String(md || "");
  const head = text.search(/^#\s+\S/m);
  const slice = text.slice(head >= 0 ? head : 0, (head >= 0 ? head : 0) + 7000);
  const m = slice.match(/(\d{1,4}(?:[,.]\d{2}))\s*€/);
  if (!m) return 0;
  const n = Number(m[1].replace(",", "."));
  if (n < 3 || n > 5000) return 0;
  return n;
}
function applyShelfPrice(wine, euros, source) {
  const n = typeof euros === "number" ? euros : Number(String(euros).replace(",", ".").replace(/[^\d.]/g, ""));
  if (!(n >= 3 && n <= 5000)) return;
  wine.priceHint = n.toFixed(2).replace(".", ",") + " €";
  wine.dossier = wine.dossier || {};
  const market = wine.dossier.market || {};
  wine.dossier.market = {
    low: market.low || null,
    mid: Math.round(n),
    high: market.high || null,
    trend: "Precio visto en la página de la tienda."
  };
  markWineSource(wine, "price", source);
}
function markWineSource(wine, field, source) {
  wine.provenance = wine.provenance || {};
  wine.provenance[field] = source;
}
function applyPageFacts(wine, facts) {
  if (!facts) return;
  if (facts.type) {
    wine.type = facts.type;
    wine.color = colorForWineType(facts.type);
    markWineSource(wine, "type", "página");
  }
  if (facts.grapes && facts.grapes.length) {
    wine.grapes = facts.grapes;
    markWineSource(wine, "grapes", "página");
  }
  if (facts.region) {
    const z = detectZone(facts.region + " " + (facts.country || ""));
    wine.region = z ? z.name : facts.region;
    wine.appellation = z ? z.name : (facts.appellation || facts.region);
    markWineSource(wine, "region", "página");
    if (z && !facts.country) {
      facts.country = z.country;
    }
  }
  if (facts.country) {
    wine.country = facts.country;
    markWineSource(wine, "country", "página");
  }
  if (facts.abv) {
    wine.abv = facts.abv;
    markWineSource(wine, "abv", "página");
  }
  if (facts.producer) {
    wine.producer = facts.producer;
    markWineSource(wine, "producer", "página");
  }
  if (facts.tasting && !noteLooksLikeLinkOrPrice(facts.tasting)) {
    wine.tasting = facts.tasting;
    markWineSource(wine, "tasting", "página");
  }
  if (facts.crianza) {
    wine.crianza = facts.crianza;
    markWineSource(wine, "crianza", "página");
  }
  if (facts.serveMin) {
    wine.conservation = wine.conservation || {};
    wine.conservation.serveMin = facts.serveMin;
    wine.conservation.serveMax = facts.serveMax || facts.serveMin;
    markWineSource(wine, "service", "página");
  }
  if (facts.style) {
    wine.kindStyle = facts.style;
    markWineSource(wine, "style", "página");
  }
  if (facts.priceEur) applyShelfPrice(wine, facts.priceEur, "página");
}
const PAIRING_DISH_IDS = ["cordero", "caza", "buey", "aves", "cerdo", "estofado", "marisco", "pescado-blanco", "pescado-graso", "arroz", "pasta", "setas", "ensalada", "queso-tierno", "queso-curado", "legumbres", "chocolate", "sashimi"];
function geminiGaps(wine) {
  const p = (wine && wine.provenance) || {};
  const gaps = [];
  ["type", "grapes", "region", "country", "abv", "tasting", "crianza", "service", "cellar", "pairing", "aging", "style", "ratings", "dossier", "web", "evolution", "vintages", "price"].forEach(k => {
    const named = k === "type" || k === "region" || k === "country";
    if (p[k] === "página") return;
    if (named && (p[k] === "título" || p[k] === "estimación Gemini")) return;
    gaps.push(k);
  });
  return gaps;
}
function storedGeminiKey() {
  try {
    if (window.WineDataProvider && typeof WineDataProvider.loadCfg === "function") {
      return String((WineDataProvider.loadCfg().geminiKey) || "").trim();
    }
  } catch (e) {}
  return "";
}
function saneVintageYear(n, vintage) {
  const y = Math.round(Number(n));
  if (!Number.isFinite(y) || y < vintage || y > vintage + 80) return 0;
  return y;
}
function applyGeminiFacts(wine, raw) {
  if (!raw || typeof raw !== "object") return;
  const gaps = new Set(geminiGaps(wine));
  const vintage = Number(wine.vintage) || YEAR;
  if (gaps.has("type")) {
    const type = wineTypeFromText(raw.type || "");
    if (type) {
      wine.type = type;
      wine.color = colorForWineType(type);
      markWineSource(wine, "type", "estimación Gemini");
    }
  }
  if (gaps.has("grapes") && Array.isArray(raw.grapes)) {
    const grapes = raw.grapes.map(g => String(g || "").trim()).filter(g => g.length >= 3 && g.length <= 40).slice(0, 6);
    if (grapes.length) {
      wine.grapes = grapes;
      markWineSource(wine, "grapes", "estimación Gemini");
    }
  }
  if (gaps.has("region") && raw.region) {
    wine.region = String(raw.region).replace(/\s+/g, " ").trim().slice(0, 80);
    wine.appellation = String(raw.appellation || raw.region).replace(/\s+/g, " ").trim().slice(0, 80);
    markWineSource(wine, "region", "estimación Gemini");
  }
  if (gaps.has("country") && raw.country) {
    wine.country = countryNameFrom(raw.country);
    markWineSource(wine, "country", "estimación Gemini");
  }
  if (gaps.has("abv")) {
    const abv = Number(String(raw.abv == null ? "" : raw.abv).replace(",", "."));
    if (abv >= 4 && abv <= 22) {
      wine.abv = abv;
      markWineSource(wine, "abv", "estimación Gemini");
    }
  }
  if (gaps.has("tasting") && raw.tasting && !noteLooksLikeLinkOrPrice(raw.tasting)) {
    const tasting = String(raw.tasting).replace(/\s+/g, " ").trim();
    if (tasting.length > 12) {
      wine.tasting = tasting.slice(0, 420);
      markWineSource(wine, "tasting", "estimación Gemini");
    }
  }
  if (gaps.has("crianza") && raw.crianza) {
    wine.crianza = String(raw.crianza).replace(/\s+/g, " ").trim().slice(0, 180);
    markWineSource(wine, "crianza", "estimación Gemini");
  }
  if (gaps.has("service")) {
    const a = Number(raw.serveMin);
    const b = Number(raw.serveMax);
    if (a >= 4 && a <= 22 && b >= a && b <= 22) {
      wine.conservation.serveMin = a;
      wine.conservation.serveMax = b;
      markWineSource(wine, "service", "estimación Gemini");
    }
  }
  if (gaps.has("cellar")) {
    const a = Number(raw.cellarMin);
    const b = Number(raw.cellarMax);
    if (a >= 5 && a <= 18 && b >= a && b <= 20) {
      wine.conservation.cellarMin = a;
      wine.conservation.cellarMax = b;
      if (raw.humidity) wine.conservation.humidity = String(raw.humidity).slice(0, 24);
      if (raw.position) wine.conservation.position = String(raw.position).slice(0, 40);
      markWineSource(wine, "cellar", "estimación Gemini");
    }
  }
  if (gaps.has("pairings") && Array.isArray(raw.pairings)) {
    const pairing = raw.pairings.map(x => String(x || "").replace(/\s+/g, " ").trim()).filter(x => x.length > 2 && x.length < 48).slice(0, 6);
    if (pairing.length) {
      wine.pairing = pairing;
      markWineSource(wine, "pairing", "estimación Gemini");
    }
  }
  if (gaps.has("aging")) {
    const drinkFrom = saneVintageYear(raw.drinkFrom, vintage);
    const peakStart = saneVintageYear(raw.peakStart, vintage);
    const peakEnd = saneVintageYear(raw.peakEnd, vintage);
    const holdTo = saneVintageYear(raw.holdTo, vintage);
    if (drinkFrom && peakStart >= drinkFrom && peakEnd >= peakStart && holdTo >= peakEnd) {
      wine.aging = { drinkFrom, peakStart, peakEnd, holdTo };
      if (raw.structure) {
        const structure = Math.round(Number(raw.structure));
        if (structure >= 40 && structure <= 100) wine.aging.structure = structure;
      }
      markWineSource(wine, "aging", "estimación Gemini");
    }
  }
  applyGeminiRecord(wine, raw);
}
function clipText(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}
function applyGeminiRecord(wine, raw) {
  if (!raw || typeof raw !== "object") return;
  const gaps = new Set(geminiGaps(wine));
  if (gaps.has("style")) {
    const style = styleFromText(raw.style || raw.kindStyle || "");
    if (style) {
      wine.kindStyle = style;
      markWineSource(wine, "style", "estimación Gemini");
    }
  }
  if (gaps.has("ratings") && raw.ratings && typeof raw.ratings === "object") {
    const bands = {
      vivino: { min: 3, max: 5 },
      penin: { min: 70, max: 100 },
      parker: { min: 70, max: 100 },
      spectator: { min: 70, max: 100 },
      decanter: { min: 70, max: 100 }
    };
    let any = false;
    Object.keys(bands).forEach(k => {
      const src = raw.ratings[k];
      if (!src || src.known !== true) return;
      const score = Number(String(src.score == null ? "" : src.score).replace(",", "."));
      if (!(score >= bands[k].min && score <= bands[k].max)) return;
      wine.ratings[k] = wine.ratings[k] || { scale: k === "vivino" ? 5 : 100, note: "" };
      wine.ratings[k].score = k === "vivino" ? Math.round(score * 10) / 10 : Math.round(score);
      wine.ratings[k].scale = k === "vivino" ? 5 : 100;
      wine.ratings[k].note = clipText(src.note, 280);
      wine.ratings[k].estimate = true;
      if (k === "vivino") {
        const count = Math.round(Number(src.count));
        if (count > 0 && count < 500000) wine.ratings[k].count = count;
      }
      if (k === "parker" && src.reviewer) wine.ratings[k].reviewer = clipText(src.reviewer, 60);
      any = true;
    });
    if (any) markWineSource(wine, "ratings", "estimación Gemini");
  }
  const pack = raw.pairingPack || raw.pairingsPack;
  if (gaps.has("pairing") && pack && typeof pack === "object") {
    const matches = (Array.isArray(pack.matches) ? pack.matches : []).map(m => {
      const dishId = String((m && m.dishId) || "");
      const score = Math.round(Number(m && m.score));
      const why = clipText(m && m.why, 180);
      if (!PAIRING_DISH_IDS.includes(dishId) || !(score >= 60 && score <= 100) || why.length < 8) return null;
      const dish = PAIRING_DISHES.find(d => d.id === dishId);
      return { dishId, score, why, label: dish ? dish.name : dishId };
    }).filter(Boolean).slice(0, 4);
    if (matches.length) {
      wine.pairingPack = {
        logic: clipText(pack.logic, 220) || matches.map(m => m.label).join(" · "),
        serve: clipText(pack.serve, 80) || shownTemp(wine, "service"),
        avoid: (Array.isArray(pack.avoid) ? pack.avoid : []).map(x => clipText(x, 40)).filter(x => x.length > 2).slice(0, 4),
        matches
      };
      wine.pairing = matches.map(m => m.label);
      markWineSource(wine, "pairing", "estimación Gemini");
    }
  }
  if (gaps.has("dossier") && raw.dossier && typeof raw.dossier === "object") {
    const d = raw.dossier;
    wine.dossier = wine.dossier || {};
    ["soils", "elevation", "vineyard", "vinification", "elevage", "glass", "decant", "oxygen"].forEach(k => {
      const text = clipText(d[k], 220);
      if (text.length > 3) wine.dossier[k] = text;
    });
    const history = String(d.history || "").replace(/\r/g, "").trim();
    if (history.length > 40) wine.dossier.history = history.slice(0, 900);
    if (Array.isArray(d.awards)) {
      const awards = d.awards.map(a => clipText(a, 40)).filter(a => a.length > 2).slice(0, 6);
      if (awards.length) wine.dossier.awards = awards;
    }
    const pageMid = wine.provenance && wine.provenance.price === "página" && wine.dossier.market ? wine.dossier.market.mid : 0;
    const market = d.market || {};
    const low = Math.round(Number(market.low));
    const mid = Math.round(Number(market.mid));
    const high = Math.round(Number(market.high));
    const sane = n => n >= 4 && n <= 8000;
    if (pageMid) {
      wine.dossier.market = wine.dossier.market || {};
      if (sane(low) && low <= pageMid) wine.dossier.market.low = low;
      if (sane(high) && high >= pageMid) wine.dossier.market.high = high;
    } else if (sane(mid) && (!sane(low) || low <= mid) && (!sane(high) || high >= mid)) {
      wine.dossier.market = {
        low: sane(low) ? low : null,
        mid,
        high: sane(high) ? high : null,
        trend: clipText(market.trend, 140) || "Estimación Gemini, no es cotización."
      };
      if (!wine.priceHint || wine.priceHint === "—") wine.priceHint = mid + " €";
      markWineSource(wine, "price", "estimación Gemini");
    }
    if (wine.dossier.history || wine.dossier.soils || wine.dossier.glass) markWineSource(wine, "dossier", "estimación Gemini");
    if (Array.isArray(d.priceHistory)) {
      const rows = d.priceHistory.map(r => ({
        year: Math.round(Number(r && r.year)),
        mid: Math.round(Number(r && (r.mid != null ? r.mid : r.price)))
      })).filter(r => r.year >= 2010 && r.year <= YEAR && r.mid >= 4 && r.mid <= 8000).slice(0, 6);
      if (rows.length) wine.priceHistory = rows;
    }
  }
  if (gaps.has("evolution") && Array.isArray(raw.evolutionNotes)) {
    const vintage = Number(wine.vintage) || YEAR;
    const notes = raw.evolutionNotes.map(n => ({
      year: Math.round(Number(n && n.year)),
      phase: clipText(n && n.phase, 32),
      text: clipText(n && n.text, 180)
    })).filter(n => n.year >= vintage - 2 && n.year <= vintage + 60 && n.phase && n.text.length > 8).slice(0, 4);
    if (notes.length) {
      wine.evolutionNotes = notes;
      markWineSource(wine, "evolution", "estimación Gemini");
    }
  }
  if (gaps.has("vintages") && Array.isArray(raw.vintages)) {
    const rows = raw.vintages.map(v => ({
      vintage: Math.round(Number(v && (v.vintage || v.year))),
      note: clipText(v && v.note, 80),
      priceHint: clipText(v && v.priceHint, 24)
    })).filter(v => v.vintage >= 1950 && v.vintage <= YEAR + 1).slice(0, 5);
    if (rows.length) {
      wine.vintages = rows;
      markWineSource(wine, "vintages", "estimación Gemini");
    }
  }
  if (Array.isArray(raw.houseWines)) {
    const rows = raw.houseWines.map(v => ({
      name: clipText(v && v.name, 60),
      note: clipText(v && v.note, 80)
    })).filter(v => v.name.length > 2).slice(0, 4);
    if (rows.length) wine.houseWines = rows;
  }
  if (gaps.has("web") && raw.geo && typeof raw.geo === "object") {
    const lat = Number(raw.geo.lat);
    const lng = Number(raw.geo.lng);
    const madrid = Math.abs(lat - 40.4) < 0.08 && Math.abs(lng + 3.7) < 0.08;
    wine.geo = wine.geo || {};
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 80 && Math.abs(lng) <= 180 && Math.abs(lat) > 0.2 && !madrid) {
      wine.geo.lat = Math.round(lat * 1000) / 1000;
      wine.geo.lng = Math.round(lng * 1000) / 1000;
      markWineSource(wine, "web", wine.provenance.web || "estimación Gemini");
    }
    if (raw.geo.zone) wine.geo.zone = clipText(raw.geo.zone, 80);
    if (raw.geo.address) wine.geo.address = clipText(raw.geo.address, 120);
    const web = clipText(raw.geo.web, 140);
    if (/^https?:\/\//i.test(web) && !/google\.|duckduckgo\.|search-result/i.test(web) && !wine.geo.web) {
      wine.geo.web = web;
      if (wine.provenance.web !== "página") markWineSource(wine, "web", "estimación Gemini");
    }
  }
}
function sealWineProvenance(wine) {
  const keys = ["type", "grapes", "region", "country", "abv", "tasting", "crianza", "service", "cellar", "pairing", "aging", "producer", "style", "ratings", "dossier", "web", "price", "evolution", "vintages", "shops"];
  wine.provenance = wine.provenance || {};
  keys.forEach(k => { if (!wine.provenance[k]) wine.provenance[k] = "valor por defecto"; });
  wine.provenance.done = true;
}
function provenanceCard(w) {
  if (!w || !w.provenance) return "";
  const labels = {
    type: "tipo", grapes: "uvas", region: "zona", country: "país", abv: "alcohol",
    tasting: "cata", crianza: "crianza", service: "servicio", cellar: "guarda",
    pairing: "maridajes", aging: "fechas de consumo", producer: "bodega",
    style: "estilo", ratings: "puntuaciones", dossier: "historia y técnica",
    web: "web y mapa", price: "precio", evolution: "evolución", vintages: "añadas", shops: "tiendas"
  };
  const buckets = {};
  Object.keys(labels).forEach(k => {
    const src = w.provenance[k] || "valor por defecto";
    buckets[src] = buckets[src] || [];
    buckets[src].push(labels[k]);
  });
  const lines = ["página", "título", "estimación Gemini", "valor por defecto"].filter(src => buckets[src] && buckets[src].length).map(src =>
    `<p style="margin-top:8px"><b>${escHtml(src)}</b><span class="muted"> · ${escHtml(buckets[src].join(", "))}</span></p>`
  ).join("");
  const host = w.provenance.pageHost ? `<p class="tiny" style="margin-top:6px">Página leída: ${escHtml(w.provenance.pageHost)}</p>` : "";
  const why = w.provenance.geminiNote ? `<p style="margin-top:8px">${escHtml(w.provenance.geminiNote)}</p>` : "";
  return `<div class="card"><p class="tiny">De dónde sale cada dato</p>${host}${why}${lines}</div>`;
}
function isShopHost(url) {
  return /vinissimus|decantalo|bigshopper|vivino|wine-searcher|google\.|amazon\.|duckduckgo|instagram|facebook/i.test(String(url || ""));
}
function isSearchListingUrl(url) {
  return /\/search-result\/|\/busqueda(?:\?|$)|google\.[^/]+\/search|duckduckgo\.com/i.test(String(url || ""));
}
function isProductPageUrl(url) {
  return /vinissimus\.com\/es\/vino\/[a-z0-9-]+\/?/i.test(String(url || "")) || /decantalo\.com\/es\/[^?\s]+\.html/i.test(String(url || ""));
}
function isReadableWineUrl(url) {
  return !!(url && !isSearchListingUrl(url));
}
function productUrlInMarkdown(md, hint) {
  const text = String(md || "");
  const links = [];
  const patterns = [
    /https:\/\/www\.vinissimus\.com\/es\/vino\/[a-z0-9-]+\//gi,
    /https:\/\/www\.decantalo\.com\/es\/[a-z0-9-]+\.html/gi
  ];
  patterns.forEach(re => {
    let m;
    while ((m = re.exec(text))) {
      if (!links.includes(m[0])) links.push(m[0]);
    }
  });
  if (!links.length) return "";
  const tokens = queryTokens(hint || "");
  if (!tokens.length) return links[0];
  let best = links[0];
  let bestN = -1;
  links.forEach(url => {
    const hay = normTxt(url);
    const n = tokens.filter(t => hay.includes(t)).length;
    if (n > bestN) { bestN = n; best = url; }
  });
  return bestN > 0 ? best : links[0];
}
async function readPageQuiet(url) {
  if (!isReadableWineUrl(url)) return "";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);
  try {
    return await readPublicPage(url, ctrl.signal);
  } catch (e) {
    return "";
  } finally {
    clearTimeout(timer);
  }
}
async function readAnyPublicPage(url) {
  if (!url || /google\.[^/]+\/search|duckduckgo\.com/i.test(url)) return "";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);
  try {
    return await readPublicPage(url, ctrl.signal);
  } catch (e) {
    return "";
  } finally {
    clearTimeout(timer);
  }
}
async function resolveToProductUrl(url, hint) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (isProductPageUrl(raw)) return raw;
  if (!isSearchListingUrl(raw)) return isReadableWineUrl(raw) ? raw : "";
  const md = await readAnyPublicPage(raw);
  return productUrlInMarkdown(md, hint);
}
async function readFactsFromUrl(wine, url) {
  const hint = [wine && wine.name, wine && wine.producer, wine && wine.vintage].filter(Boolean).join(" ");
  const product = await resolveToProductUrl(url, hint);
  if (!product || !isReadableWineUrl(product)) return false;
  const page = await readPageQuiet(product);
  if (!page) return false;
  applyPageFacts(wine, parseWinePage(page));
  wine.provenance = wine.provenance || {};
  wine.provenance.pageExcerpt = clipText(page, 1600);
  wine.provenance.pageHost = hostOf(product) || product;
  wine.provenance.pageUrl = product;
  wine.provenance.pageNote = "";
  return true;
}
function clearJunkTasting(wine) {
  if (!wine) return;
  const src = wine.provenance && wine.provenance.tasting;
  if (src === "página" && !noteLooksLikeLinkOrPrice(wine.tasting)) return;
  if (noteLooksLikeLinkOrPrice(wine.tasting) || isPlaceholderNote(wine.tasting)) {
    wine.tasting = "";
    if (wine.provenance && src !== "página") delete wine.provenance.tasting;
  }
}
function pageFactsReady(wine) {
  return fieldIsReal(wine, "type") && fieldIsReal(wine, "region") && fieldIsReal(wine, "abv");
}
async function geminiWithModel(key, prompt, schema, signal, maxOutputTokens, extraParts) {
  const images = !!(extraParts && extraParts.length);
  const skip = [];
  let last = { parsed: null, reason: "modelo no disponible (HTTP 404)", model: "" };
  if (!window.WineDataProvider || !WineDataProvider.pickGeminiModel) {
    return { parsed: null, reason: "ningún modelo disponible", fatal: true, model: "" };
  }
  for (let n = 0; n < 4; n++) {
    let model = "";
    try {
      model = await WineDataProvider.pickGeminiModel(key, { images: images, skip: skip });
    } catch (err) {
      const status = err && err.status;
      const reason = status === 401 || status === 403 ? ("clave rechazada (HTTP " + status + ")") : (status ? ("HTTP " + status) : "red o CORS");
      return { parsed: null, reason: reason, fatal: true, model: "" };
    }
    if (!model) return { parsed: null, reason: "ningún modelo disponible", fatal: true, model: "" };
    const outcome = await geminiGenerate(key, model, prompt, schema, signal, maxOutputTokens, extraParts);
    if (outcome && outcome.skipModel) {
      WineDataProvider.forgetGeminiModel(model);
      skip.push(model);
      last = outcome;
      continue;
    }
    return outcome || last;
  }
  return last;
}
function geminiBlockSpecs() {
  const str = { type: "STRING" };
  const num = { type: "NUMBER" };
  const rating = { type: "OBJECT", properties: { known: { type: "BOOLEAN" }, score: num, count: num, note: str, reviewer: str } };
  return {
    basics: {
      name: "basics",
      label: "Datos",
      maxTokens: 2048,
      schema: {
        type: "OBJECT",
        properties: {
          type: str, style: str, grapes: { type: "ARRAY", items: str }, region: str, appellation: str, country: str, abv: num,
          crianza: str, tasting: str, serveMin: num, serveMax: num, cellarMin: num, cellarMax: num,
          humidity: str, position: str, light: str, drinkFrom: num, peakStart: num, peakEnd: num, holdTo: num, structure: num
        }
      },
      ask: "Bloque datos y fechas. type: tinto, blanco, rosado, espumoso o generoso. style: reserva, crianza, roble, joven o gran reserva. tasting es la nota de cata, sin URL y sin precio. serveMin/serveMax y cellarMin/cellarMax en grados. drinkFrom, peakStart, peakEnd y holdTo son años, en ese orden; peakEnd es el último año para beber. Si no estás seguro, cadena vacía o 0."
    },
    pairings: {
      name: "pairings",
      label: "Puntuaciones",
      maxTokens: 2048,
      schema: {
        type: "OBJECT",
        properties: {
          ratings: { type: "OBJECT", properties: { vivino: rating, penin: rating, parker: rating, spectator: rating, decanter: rating } },
          pairingPack: {
            type: "OBJECT",
            properties: {
              logic: str, serve: str, avoid: { type: "ARRAY", items: str },
              matches: { type: "ARRAY", items: { type: "OBJECT", properties: { dishId: str, score: num, why: str } } }
            }
          }
        }
      },
      ask: "Bloque puntuaciones y maridajes. En ratings, known=true solo si recuerdas una nota publicada de esa añada; si no, known=false y score=0. No uses 0 como si fuera la nota. pairingPack.matches.dishId tiene que ser uno de: " + PAIRING_DISH_IDS.join(", ") + ". score de 60 a 100. why en español, sin URL."
    },
    dossier: {
      name: "dossier",
      label: "Dossier",
      maxTokens: 3072,
      schema: {
        type: "OBJECT",
        properties: {
          dossier: {
            type: "OBJECT",
            properties: {
              soils: str, elevation: str, vineyard: str, vinification: str, elevage: str, glass: str, decant: str, oxygen: str, history: str,
              awards: { type: "ARRAY", items: str },
              market: { type: "OBJECT", properties: { low: num, mid: num, high: num, trend: str } },
              priceHistory: { type: "ARRAY", items: { type: "OBJECT", properties: { year: num, mid: num } } }
            }
          },
          evolutionNotes: { type: "ARRAY", items: { type: "OBJECT", properties: { year: num, phase: str, text: str } } },
          vintages: { type: "ARRAY", items: { type: "OBJECT", properties: { vintage: num, note: str, priceHint: str } } },
          houseWines: { type: "ARRAY", items: { type: "OBJECT", properties: { name: str, note: str } } },
          geo: { type: "OBJECT", properties: { lat: num, lng: num, zone: str, address: str, web: str } }
        }
      },
      ask: "Bloque dossier, añadas y precio. dossier.history: dos párrafos en español, sin URL. market en euros de tienda. geo.lat y geo.lng de la bodega, no de Madrid si la bodega no está allí. geo.web es la URL de la bodega si la conoces. Si no estás seguro, cadena vacía, lista vacía o 0."
    }
  };
}
function geminiBlocksFor(gaps) {
  const set = new Set(gaps || []);
  const specs = geminiBlockSpecs();
  const blocks = [];
  if (["type", "grapes", "region", "country", "abv", "tasting", "crianza", "service", "cellar", "aging", "style"].some(k => set.has(k))) blocks.push(specs.basics);
  if (set.has("ratings") || set.has("pairing")) blocks.push(specs.pairings);
  if (["dossier", "web", "evolution", "vintages", "price"].some(k => set.has(k))) blocks.push(specs.dossier);
  return blocks;
}
function stripJsonFences(text) {
  let s = String(text || "").trim();
  const wrapped = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (wrapped) return wrapped[1].trim();
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}
function extractJsonObject(text) {
  const s = stripJsonFences(text);
  const start = s.indexOf("{");
  if (start < 0) return null;
  const sliced = s.slice(start);
  const end = sliced.lastIndexOf("}");
  if (end > 0) {
    try { return JSON.parse(sliced.slice(0, end + 1)); } catch (e) {}
  }
  return repairJsonObject(sliced);
}
function repairJsonObject(s) {
  let out = "";
  let inStr = false;
  let esc = false;
  const stack = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      out += c;
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === "\"") inStr = false;
      continue;
    }
    if (c === "\"") { inStr = true; out += c; continue; }
    if (c === "{" || c === "[") { stack.push(c); out += c; continue; }
    if (c === "}" || c === "]") {
      const open = stack[stack.length - 1];
      if ((c === "}" && open === "{") || (c === "]" && open === "[")) {
        stack.pop();
        out += c;
        if (!stack.length) break;
      }
      continue;
    }
    out += c;
  }
  if (inStr) out += "\"";
  out = out.replace(/,\s*$/, "");
  while (stack.length) {
    out = out.replace(/,\s*$/, "");
    out += stack.pop() === "{" ? "}" : "]";
  }
  try { return JSON.parse(out); } catch (e) { return null; }
}
function geminiObjectUseful(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return Object.keys(obj).some(k => {
    const v = obj[k];
    if (v == null || v === "" || v === 0) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return true;
  });
}
function geminiPartsText(json) {
  const parts = ((((json || {}).candidates || [])[0] || {}).content || {}).parts || [];
  return parts.filter(p => p && !p.thought).map(p => p.text || "").join("");
}
function geminiFinish(json) {
  return (((json || {}).candidates || [])[0] || {}).finishReason || "";
}
function geminiReasonFrom(status, finish, parsed, err) {
  if (status === 401 || status === 403) return "clave rechazada (HTTP " + status + ")";
  if (status === 429) return "cuota agotada";
  if (err && err.name === "AbortError") return "tiempo agotado";
  if (!status && err) return "red o CORS";
  if (status === 404) return "modelo no disponible (HTTP 404)";
  if (finish === "MAX_TOKENS" && !parsed) return "respuesta cortada";
  if (!parsed) return status && status !== 200 ? ("HTTP " + status) : "JSON inválido";
  return "";
}
function summarizeGeminiProblems(items) {
  if (!items.length) return "";
  const reasons = items.map(i => i.problem);
  const unique = reasons.filter((r, i) => reasons.indexOf(r) === i);
  if (unique.length === 1) return "Gemini: " + unique[0];
  return "Gemini: " + items.map(i => i.label + ": " + i.problem).join(" · ");
}
async function geminiGenerate(key, model, prompt, schema, signal, maxOutputTokens, extraParts) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
  const attempts = [
    { schema: schema, think: true },
    { schema: schema, think: false },
    { schema: null, think: false }
  ];
  let last = { parsed: null, reason: "JSON inválido", model };
  for (let i = 0; i < attempts.length; i++) {
    const opt = attempts[i];
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: maxOutputTokens || 2048,
      responseMimeType: "application/json"
    };
    if (opt.think) generationConfig.thinkingConfig = { thinkingBudget: 0 };
    if (opt.schema) generationConfig.responseSchema = opt.schema;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }].concat(extraParts || []) }], generationConfig })
      });
    } catch (err) {
      return { parsed: null, reason: geminiReasonFrom(0, "", null, err), fatal: true, model };
    }
    if (res.status === 400 && i < attempts.length - 1) continue;
    if (res.status === 404) return { parsed: null, reason: "modelo no disponible (HTTP 404)", model, skipModel: true };
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      return { parsed: null, reason: geminiReasonFrom(res.status, "", null, null), fatal: true, model };
    }
    if (!res.ok) {
      last = { parsed: null, reason: geminiReasonFrom(res.status, "", null, null), model };
      continue;
    }
    let json;
    try { json = await res.json(); } catch (e) {
      last = { parsed: null, reason: "JSON inválido", model };
      continue;
    }
    const finish = geminiFinish(json);
    const parsed = extractJsonObject(geminiPartsText(json));
    if (geminiObjectUseful(parsed)) return { parsed, reason: "", model, finish };
    last = { parsed: null, reason: geminiReasonFrom(200, finish, null, null), model, finish };
    if (finish === "MAX_TOKENS") break;
  }
  return last;
}
async function readGeminiWineFacts(wine, gaps) {
  const key = storedGeminiKey();
  wine.provenance = wine.provenance || {};
  if (!key) {
    wine.provenance.geminiNote = NO_GEMINI_NOTE;
    return null;
  }
  const blocks = geminiBlocksFor(gaps);
  if (!blocks.length) {
    wine.provenance.geminiNote = "";
    return null;
  }
  const known = [wine.producer, wine.name, wine.vintage, wine.region, wine.type, wine.abv ? wine.abv + "%" : "", (wine.grapes || []).join(", ")].filter(Boolean).join(" · ");
  const problems = [];
  let any = false;
  let fatal = false;
  for (const block of blocks) {
    if (fatal) break;
    const prompt = ["Ficha de vinoteca. Responde solo JSON.", "Vino: " + known, "Bloque: " + block.name, block.ask].join("\n");
    let outcome = null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      outcome = await geminiWithModel(key, prompt, block.schema, ctrl.signal, block.maxTokens);
    } finally {
      clearTimeout(timer);
    }
    if (outcome && outcome.parsed) {
      applyGeminiFacts(wine, outcome.parsed);
      any = true;
      wine.provenance.geminiModel = outcome.model || wine.provenance.geminiModel;
    } else {
      problems.push({ label: block.label, problem: (outcome && outcome.reason) || "JSON inválido" });
      if (outcome && outcome.fatal) fatal = true;
    }
  }
  wine.provenance.geminiNote = summarizeGeminiProblems(problems);
  return any ? { ok: true } : null;
}
async function geminiProbe(key) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  const schema = { type: "OBJECT", properties: { ok: { type: "BOOLEAN" } } };
  try {
    const outcome = await geminiWithModel(key, "Responde solo este JSON: {\"ok\":true}", schema, ctrl.signal, 64);
    if (outcome && outcome.parsed) return "Funciona · " + (outcome.model || "");
    return (outcome && outcome.reason) || "modelo no disponible (HTTP 404)";
  } finally {
    clearTimeout(timer);
  }
}

async function geminiNormalizeIdentity(wine) {
  const key = storedGeminiKey();
  if (!key || !wine) return;
  wine.provenance = wine.provenance || {};
  const schema = {
    type: "OBJECT",
    properties: {
      producer: { type: "STRING" },
      name: { type: "STRING" },
      vintage: { type: "NUMBER" },
      region: { type: "STRING" },
      country: { type: "STRING" },
      type: { type: "STRING" }
    }
  };
  const prompt = [
    "Normaliza la identidad de un vino. Responde solo JSON.",
    "Título de la página: " + (wine.provenance.rawTitle || wine.name || ""),
    "Nombre actual: " + (wine.name || ""),
    "Productor actual: " + (wine.producer || ""),
    "Añada actual: " + (wine.vintage || ""),
    "URL: " + (wine.provenance.pageUrl || ""),
    "Texto: " + clipText(wine.provenance.pageExcerpt || "", 1600),
    "producer es la bodega, corta. name es el vino, sin bodega, sin añada y sin coletillas de la web (opiniones, consejos, comprar, precio o el nombre del sitio). vintage es el año o 0. region es la denominación. country es el país. type es tinto, blanco, rosado, espumoso o generoso, o vacío.",
    "Usa solo el título, el texto y la URL. No inventes."
  ].join("\n");
  let outcome = null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    outcome = await geminiWithModel(key, prompt, schema, ctrl.signal, 512);
  } finally {
    clearTimeout(timer);
  }
  if (outcome && outcome.parsed) applyGeminiIdentity(wine, outcome.parsed);
  else if (outcome && outcome.reason && !wine.provenance.geminiNote) wine.provenance.geminiNote = "Gemini: " + outcome.reason;
}
async function completeWineRecord(wine, pageUrl) {
  normalizeWine(wine);
  wine.provenance = wine.provenance || {};
  clearJunkTasting(wine);
  applyCleanIdentity(wine, [wine.provenance.rawTitle || wine.name, wine.producer, wine.vintage, pageUrl || wine.provenance.pageUrl || ""].join(" \n "));
  const target = String(pageUrl || wine.provenance.pageUrl || "").trim();
  const opinionFirst = isOpinionPage(target, (wine.provenance.rawTitle || "") + " " + (wine.name || ""));
  setFichaProgress(isSearchListingUrl(target) ? "Abriendo la ficha del vino en la tienda…" : "Completando la ficha…");
  let read = false;
  if (target && !opinionFirst) {
    read = await readFactsFromUrl(wine, target);
    if (!read) wine.provenance.pageNote = "No se pudo leer la página de la tienda o la bodega.";
  }
  setFichaProgress("Buscando la bodega y las tiendas…");
  try {
    const remote = await lookupWineOnline([wine.producer, wine.name, wine.vintage].filter(Boolean).join(" "));
    const hits = (remote && remote.hits) || [];
    const shops = hits.filter(h => h && h.kind === "tienda" && h.url && !isSearchListingUrl(h.url)).slice(0, 3).map(h => ({
      title: h.title || "",
      url: h.url,
      price: h.price || "",
      source: h.source || hostOf(h.url)
    }));
    if (shops.length) {
      wine.shops = shops;
      markWineSource(wine, "shops", "página");
      if (wine.provenance.price !== "página") {
        const priced = shops.find(s => s.price);
        if (priced) applyShelfPrice(wine, priced.price, "página");
      }
    }
    if (!pageFactsReady(wine)) {
      for (const shop of (wine.shops || [])) {
        if (pageFactsReady(wine)) break;
        if (!shop.url || shop.url === wine.provenance.pageUrl) continue;
        if (await readFactsFromUrl(wine, shop.url)) read = true;
      }
    }
    const bodega = hits.find(h => h && h.url && h.kind !== "tienda" && h.kind !== "buscar" && !isShopHost(h.url) && isReadableWineUrl(h.url) && !isOpinionPage(h.url, h.title));
    if (bodega) {
      wine.geo = wine.geo || {};
      if (!wine.geo.web) {
        wine.geo.web = bodega.url;
        markWineSource(wine, "web", "página");
      }
      if (bodega.url !== wine.provenance.pageUrl) {
        const md = await readPageQuiet(bodega.url);
        if (md) applyPageFacts(wine, parseWinePage(md));
      }
    }
  } catch (e) {}
  if (!read && target && opinionFirst) {
    read = await readFactsFromUrl(wine, target);
  }
  if (read) wine.provenance.pageNote = "";
  if (storedGeminiKey()) {
    setFichaProgress("Afinando nombre, bodega y zona…");
    try { await geminiNormalizeIdentity(wine); } catch (e) {
      if (!wine.provenance.geminiNote) wine.provenance.geminiNote = "Gemini: red o CORS";
    }
  }
  const gaps = geminiGaps(wine);
  if (!storedGeminiKey()) {
    wine.provenance.geminiNote = NO_GEMINI_NOTE;
  } else if (gaps.length) {
    setFichaProgress("Completando con Gemini lo que la página no trae…");
    try {
      await readGeminiWineFacts(wine, gaps);
    } catch (e) {
      if (!wine.provenance.geminiNote) wine.provenance.geminiNote = "Gemini: red o CORS";
    }
  } else if (!wine.provenance.geminiNote) {
    wine.provenance.geminiNote = "";
  }
  sealWineProvenance(wine);
  try { await ensureGeneratedPlates(wine); } catch (e) {}
  save();
  return wine;
}
let intakeBusy = false;
async function settleNewWine(wine, raw, source, pageUrl) {
  if (!wine) return;
  if (intakeBusy) return toast("Sigue completando la ficha anterior");
  intakeBusy = true;
  try {
    if (needsWineCompletion(wine)) {
      showCompletingStatus();
      let url = String(pageUrl || "");
      if (!url) {
        try {
          const remote = await lookupWineOnline([wine.producer, wine.name, wine.vintage].filter(Boolean).join(" "));
          const hit = (remote.hits || []).find(h => h && h.url && h.kind !== "buscar" && !isOpinionPage(h.url, h.title))
            || (remote.hits || []).find(h => h && h.url && h.kind !== "buscar");
          if (hit) url = hit.url;
        } catch (e) {}
      }
      try { await completeWineRecord(wine, url); } catch (e) {}
    }
    parkScanInInbox(wine, raw, source);
  } finally {
    intakeBusy = false;
  }
}
async function completeExistingWine(id) {
  const wine = wineById(id);
  if (!wine || isCatalogWineId(wine.id)) return;
  if (intakeBusy) return toast("Sigue completando la ficha anterior");
  intakeBusy = true;
  try {
    normalizeWine(wine);
    wine.provenance = wine.provenance || {};
    wine.provenance.done = false;
    wine.provenance.geminiNote = "";
    const noKey = !storedGeminiKey();
    if (noKey) openNotify();
    setFichaProgress("Completando la ficha…");
    await completeWineRecord(wine, wine.provenance.pageUrl || "");
    if (currentWine && currentWine.id === wine.id) openWine(wine.id, currentBottle);
    if (noKey) openNotify();
    toast(wine.provenance.geminiNote ? "Ficha a medias" : "Ficha actualizada");
  } catch (e) {
    toast("No se pudo completar la ficha");
  } finally {
    intakeBusy = false;
  }
}
function confirmScanCustom() {
  const q = (($("#scan-read") && $("#scan-read").value) || ($("#scan-q") && $("#scan-q").value) || "").trim();
  const raw = q || lastOcrText || "";
  const w = inferWineFromText(raw);
  if (!w) return toast("Escribe bodega y añada");
  settleNewWine(w, raw, intakeSource || "camara", "");
}
function wineFromInternetHit(hit) {
  const title = (hit && hit.title) || "";
  const raw = [title, hit && hit.producer, hit && hit.extract, hit && hit.url, lastOcrText].filter(Boolean).join(" ");
  const local = rankFromText(title || raw);
  if (local[0]) return ensureScannedWine(local[0], raw);
  const id = "web-" + normTxt((hit && (hit.url || title)) || "vino").replace(/\s+/g, "-").slice(0, 72);
  const existed = wineById(id);
  if (existed) return existed;
  const idn = identityFromTitle(title);
  const zone = detectZone(raw);
  const year = idn.vintage || yearFromText(raw) || YEAR;
  const givenProducer = String((hit && hit.producer) || "").trim();
  const producer = (givenProducer && !titleLooksDirty(givenProducer) && givenProducer.length <= 80) ? givenProducer : (idn.producer || "");
  const name = idn.name || "Vino";
  const type = idn.type || wineTypeFromText(raw);
  const w = {
    id, name, producer: producer || name, vintage: year,
    region: (zone && zone.name) || idn.region || "",
    country: (zone && zone.country) || idn.country || "",
    appellation: (zone && zone.name) || idn.appellation || "",
    type: type || "", style: "internet",
    grapes: [], abv: 0, color: "#4a1020",
    ratings: {
      vivino: { score: 0, count: 0, scale: 5, note: "" },
      penin: { score: 0, scale: 100, note: "" },
      parker: { score: 0, scale: 100, reviewer: "", note: "" },
      spectator: { score: 0, scale: 100, note: "" },
      decanter: { score: 0, scale: 100, note: "" }
    },
    priceHint: (hit && hit.price) || "—",
    tasting: "",
    pairing: [],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: year + 1, peakStart: year + 3, peakEnd: year + 10, holdTo: year + 15 },
    evolutionNotes: [],
    provenance: {
      rawTitle: (hit && hit.title) || "",
      pageUrl: (hit && hit.url) || ""
    }
  };
  if (w.type) markWineSource(w, "type", "título");
  if (w.region) markWineSource(w, "region", "título");
  if (w.country) markWineSource(w, "country", "título");
  if (producer) markWineSource(w, "producer", "título");
  if (idn.name) markWineSource(w, "name", "título");
  state.customWines = state.customWines || [];
  state.customWines.push(w);
  return w;
}
function confirmInternetWine(i) {
  const hit = lastInternetHits[i];
  if (!hit) return toast("Ese resultado ya no está");
  if (hit.kind === "buscar") {
    if (hit.url) window.open(hit.url, "_blank", "noopener");
    return;
  }
  const w = wineFromInternetHit(hit);
  if (!w) return toast("No se pudo crear la ficha");
  settleNewWine(w, lastOcrText || hit.title, intakeSource || "fototeca", hit.url || "");
}
async function searchAndShowLabel(text) {
  const gen = ++photoSearchGen;
  setScanStatus("Buscando el vino en internet…");
  if ($("#scan-results")) $("#scan-results").innerHTML = `<div class="card muted">Buscando el vino en internet…</div>`;
  const remote = await lookupWineOnline(text);
  if (gen !== photoSearchGen) return;
  showScanConfirm(text, rankFromText(text), remote);
}

async function readLabelWithGemini(dataUrl) {
  const key = storedGeminiKey();
  if (!key) return { query: "", note: "" };
  const comma = String(dataUrl || "").indexOf(",");
  if (comma < 0) return { query: "", note: "Gemini: imagen no válida" };
  const mime = (String(dataUrl).slice(0, comma).match(/data:(image\/[a-zA-Z0-9.+-]+)/) || [])[1] || "image/jpeg";
  const data = String(dataUrl).slice(comma + 1);
  if (data.length < 40) return { query: "", note: "Gemini: imagen no válida" };
  const schema = {
    type: "OBJECT",
    properties: {
      producer: { type: "STRING" },
      name: { type: "STRING" },
      vintage: { type: "NUMBER" },
      region: { type: "STRING" }
    }
  };
  const prompt = [
    "Lee la etiqueta de vino de la foto. Responde solo JSON.",
    "producer es la bodega, name es el vino sin la bodega y sin la añada, vintage es el año (0 si no se ve), region es la zona.",
    "No inventes. Si un campo no se lee, cadena vacía o 0."
  ].join("\n");
  const image = { inlineData: { mimeType: mime, data: data } };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const outcome = await geminiWithModel(key, prompt, schema, ctrl.signal, 512, [image]);
    const query = outcome && outcome.parsed ? queryFromLabelFields(outcome.parsed) : "";
    if (labelQueryUseful(query)) return { query, note: "" };
    let last = "JSON inválido";
    if (outcome && outcome.finish === "MAX_TOKENS") last = "respuesta cortada";
    else if (outcome && outcome.parsed) last = "JSON inválido";
    else if (outcome && outcome.reason) last = outcome.reason;
    if (outcome && outcome.fatal) return { query: "", note: "Gemini: " + outcome.reason };
    return { query: "", note: "Gemini: " + last };
  } catch (e) {
    return { query: "", note: e && e.name === "AbortError" ? "Gemini: tiempo agotado" : "Gemini: red o CORS" };
  } finally {
    clearTimeout(timer);
  }
}
async function identifyFromPhoto(dataUrl) {
  if (ocrBusy) {
    setScanStatus("Sigue la lectura anterior.");
    return;
  }
  ocrBusy = true;
  const fromRoll = intakeSource === "fototeca";
  setScanStatus(fromRoll ? "Foto de la fototeca. Leyendo la etiqueta…" : "Leyendo la etiqueta…");
  if ($("#scan-results")) $("#scan-results").innerHTML = `<div class="card muted">${fromRoll ? "Foto elegida. Leyendo la etiqueta para buscar el vino." : "Analizando la foto. Un momento."}</div>`;
  let text = "";
  let query = "";
  lastOcrNote = "";
  try {
    try { text = await readLabelText(dataUrl); } catch (e) { text = ""; }
    lastOcrRaw = readableLabel(text).replace(/\s+/g, " ");
    query = cleanOcrQuery(text);
    if (storedGeminiKey()) {
      setScanStatus(fromRoll ? "Foto de la fototeca. Leyendo la etiqueta con Gemini…" : "Leyendo la etiqueta con Gemini…");
      const gem = await readLabelWithGemini(dataUrl);
      if (gem.query) query = gem.query;
      else if (gem.note) lastOcrNote = gem.note;
    }
  } finally {
    ocrBusy = false;
  }
  if (!query) {
    lastOcrText = lastOcrRaw;
    if ($("#scan-q")) $("#scan-q").value = lastOcrRaw;
    setScanStatus("No se pudo limpiar la lectura. Corrige el texto y busca.");
    showScanConfirm(lastOcrRaw, rankFromText(lastOcrRaw), { hits: [], state: "sin-texto", note: "La lectura no dejó un nombre de vino. Corrige el texto.", query: "" });
    return;
  }
  lastOcrText = query;
  if ($("#scan-q")) $("#scan-q").value = query;
  await searchAndShowLabel(query);
}

function rankFromText(raw) {
  const hay = normTxt(raw);
  if (!hay || hay.length < 4) return [];
  const scored = WINE_CATALOG.map(w => {
    let score = 0;
    const prod = normTxt(w.producer);
    const nam = normTxt(w.name);
    const tokens = prod.split(" ").filter(t => t.length >= 5 && !/chateau|bodegas|celler|dominio|tenuta/.test(t));
    tokens.forEach(t => { if (hay.includes(t)) score += 28; });
    if (nam.length >= 5 && hay.includes(nam)) score += 22;
    if (hay.includes(String(w.vintage))) score += 8;
    if (hay.includes("unico") && /unico/.test(nam)) score += 30;
    if (hay.includes("vega") && hay.includes("sicilia") && /vega sicilia/.test(prod)) score += 40;
    if (hay.includes("tondonia") && /tondonia/.test(nam)) score += 30;
    if (hay.includes("valbuena") && /valbuena/.test(nam)) score += 26;
    if (hay.includes("pazo") && /pazo/.test(prod)) score += 24;
    if (hay.includes("margaux") && /margaux/.test(prod + " " + nam)) score += 40;
    const aliases = (w.aliases || []).map(normTxt);
    aliases.forEach(t => { if (t.length >= 5 && hay.includes(t)) score += 46; });
    if (hay.includes("pesquera") && /pesquera/.test(prod + " " + nam + " " + aliases.join(" "))) score += 50;
    if (hay.includes("reserva") && /reserva/.test(nam) && score >= 28) score += 12;
    const region = normTxt(w.region + " " + w.appellation);
    if (hay.includes("ribera del duero") && !/ribera/.test(region)) score = 0;
    if (hay.includes("rioja") && !/rioja/.test(region)) score = 0;
    if (hay.includes("priorat") && !/priorat/.test(region)) score = 0;
    if (hay.includes("margaux") && !/margaux|medoc/.test(region + " " + prod)) score = 0;
    return { w, score };
  }).filter(x => x.score >= 28).sort((a, b) => b.score - a.score);
  const uniq = [];
  const seen = new Set();
  scored.forEach(x => {
    if (!seen.has(x.w.id)) { seen.add(x.w.id); uniq.push(x.w); }
  });
  return uniq.slice(0, 6);
}

function intakeSourceLabel(src) {
  if (src === "fototeca") return "Fototeca";
  if (src === "manual") return "Manual";
  return "Cámara";
}
function parkScanInInbox(wine, text, source) {
  if (!wine) return;
  const via = source || intakeSource || "camara";
  state.inbox = state.inbox || [];
  const cellarId = preferredCellar(wine, 0) || (state.vinotecas[0] && state.vinotecas[0].id) || "v1";
  const bin = nextBin(cellarId);
  const row = {
    uid: "in" + Date.now() + Math.random().toString(16).slice(2, 6),
    wineId: wine.id,
    created: new Date().toISOString(),
    text: String(text || "").replace(/\s+/g, " ").slice(0, 180),
    photo: (via !== "manual" && lastLabelData && lastLabelData.length < 140000) ? lastLabelData : "",
    entered: false,
    cellarId,
    bin,
    source: via
  };
  state.inbox.unshift(row);
  save();
  if ($("#scan-q")) $("#scan-q").value = "";
  setScanStatus("Ficha lista. Hueco " + bin + " reservado en altas pendientes.");
  toast(wine.producer + " " + wine.vintage + " · " + cellarName(cellarId) + " " + bin);
  show("inbox");
}
function ensurePendingSlots() {
  let dirty = false;
  (state.inbox || []).forEach(row => {
    if (row.entered) return;
    if (!row.cellarId) {
      const w = wineById(row.wineId);
      row.cellarId = (w && preferredCellar(w, 0)) || "v1";
      dirty = true;
    }
    if (!row.bin) {
      row.bin = nextBin(row.cellarId);
      dirty = true;
    }
  });
  if (dirty) save();
}
function renderInbox() {
  const box = $("#inbox-list");
  if (!box) return;
  ensurePendingSlots();
  const q = fold(($("#inbox-q") && $("#inbox-q").value) || "");
  const rows = (state.inbox || []).filter(row => {
    const w = wineById(row.wineId);
    const hay = wineHay(w, (row.text || "") + " " + (row.bin || "") + " " + intakeSourceLabel(row.source));
    return !q || hay.includes(q);
  });
  if (!(state.inbox || []).length) {
    box.innerHTML = `<div class="card muted">Aún no hay altas pendientes. Escanea una etiqueta, elige una foto o da de alta a mano.</div>
      <button class="btn btn-gold" style="width:100%;margin-top:12px" onclick="startScan()">Abrir cámara</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="pickFromRoll()">Elegir de fotos</button>`;
    return;
  }
  if (!rows.length) {
    box.innerHTML = `<p class="empty">Ninguna entrada coincide. Borra la búsqueda para ver el listado.</p>`;
    return;
  }
  box.innerHTML = rows.map(row => {
    const w = wineById(row.wineId);
    const title = w ? `${w.producer}` : "Vino leído";
    const sub = w ? `${w.name} ${w.vintage}` : "";
    const badge = row.entered ? `<span class="badge ok">En bodega</span>` : `<span class="badge warn">Pendiente</span>`;
    const where = row.entered
      ? `<p class="tiny">En bodega · ${cellarName(row.cellarId)} · ${row.bin || "sin hueco"}</p>`
      : `<p class="tiny">Hueco pendiente · ${cellarName(row.cellarId)} · ${row.bin || "sin hueco"}</p>`;
    const via = `<p class="tiny">${intakeSourceLabel(row.source)}</p>`;
    return `<article class="inbox-card">
      ${row.photo ? `<img src="${row.photo}" alt="">` : `<div class="inbox-ph"></div>`}
      <div class="inbox-copy">
        <div class="row"><h3>${title}</h3>${badge}</div>
        <p>${sub}</p>
        ${where}
        ${via}
        <div class="inbox-actions">
          ${row.entered
            ? `<button class="btn btn-ghost" onclick="openWine('${row.wineId}')">Ver ficha</button>`
            : `<button class="btn btn-gold" onclick="enterInbox('${row.uid}')">Introducir en el hueco</button>
               <button class="btn btn-ghost" onclick="openWine('${row.wineId}')">Ficha</button>`}
          <button class="btn btn-ghost" onclick="deleteInbox('${row.uid}')">Eliminar</button>
        </div>
      </div>
    </article>`;
  }).join("") + `<button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="startScan()">Escanear otra</button>`;
}
function deleteInbox(uid) {
  const row = (state.inbox || []).find(x => x.uid === uid);
  if (!row) return;
  const w = wineById(row.wineId);
  if (!confirm("Eliminar esta lectura" + (w ? " de " + w.name : "") + " del listado?")) return;
  state.inbox = (state.inbox || []).filter(x => x.uid !== uid);
  save();
  renderInbox();
  toast("Lectura eliminada");
}
function enterInbox(uid) {
  const row = (state.inbox || []).find(x => x.uid === uid);
  if (!row || row.entered) return;
  const w = wineById(row.wineId);
  if (!w) return toast("Ficha no encontrada");
  normalizeWine(w);
  currentWine = w;
  if (!row.cellarId) row.cellarId = preferredCellar(w, 0) || "v1";
  if (!row.bin) row.bin = nextBin(row.cellarId);
  lastLabelData = row.photo || "";
  showSheet("add-sheet");
  if ($("#add-inbox-uid")) $("#add-inbox-uid").value = uid;
  if ($("#add-cellar")) $("#add-cellar").value = row.cellarId;
  if ($("#add-bin")) $("#add-bin").value = row.bin;
  if ($("#add-qty")) $("#add-qty").value = "1";
  if ($("#add-keep-hint")) $("#add-keep-hint").textContent = "Hueco reservado " + row.bin + " · " + cellarName(row.cellarId) + ". Confirma cuando la botella esté en ese espacio.";
}
function yearFromText(raw) {
  const m = String(raw || "").match(/\b((?:19|20)\d{2})\b/);
  return m ? parseInt(m[1], 10) : 0;
}
function ensureScannedWine(base, raw) {
  if (!base) return null;
  const year = yearFromText(raw);
  if (!year || year === Number(base.vintage)) return base;
  const nid = String(base.id).replace(/-?\d{4}$/, "") + "-" + year;
  const existed = wineById(nid);
  if (existed) return existed;
  const copy = JSON.parse(JSON.stringify(base));
  copy.id = nid;
  copy.vintage = year;
  state.customWines = state.customWines || [];
  state.customWines.push(copy);
  return copy;
}
function inferWineFromText(raw) {
  const hay = normTxt(raw);
  if (!hay || hay.length < 6) return null;
  const year = yearFromText(raw) || YEAR;
  const catalog = WINE_CATALOG.find(w => {
    const tokens = normTxt(w.producer).split(" ").filter(t => t.length >= 5 && !/chateau|bodegas|celler|dominio/.test(t));
    return tokens.some(t => hay.includes(t)) || (normTxt(w.name).length >= 5 && hay.includes(normTxt(w.name)));
  });
  if (catalog) return ensureScannedWine(catalog, raw);
  const words = hay.split(" ").filter(x => x.length > 2 && x !== String(year)).slice(0, 4);
  const label = words.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ") || "Vino escaneado";
  const id = "scan-" + Date.now();
  const w = {
    id, name: label, producer: label, vintage: year,
    region: "", country: "", appellation: "", type: "tinto", style: "escaneo",
    grapes: [], abv: 13.5, color: "#4a1020",
    ratings: {
      vivino: { score: 0, count: 0, scale: 5, note: "" },
      penin: { score: 0, scale: 100, note: "" },
      parker: { score: 0, scale: 100, reviewer: "", note: "Alta por etiqueta. Completa la ficha." },
      spectator: { score: 0, scale: 100, note: "" },
      decanter: { score: 0, scale: 100, note: "" }
    },
    priceHint: "—",
    tasting: "Ficha creada al escanear la etiqueta.",
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: year + 1, peakStart: year + 3, peakEnd: year + 10, holdTo: year + 15, drinkTo: year + 14 },
    evolutionNotes: []
  };
  state.customWines = state.customWines || [];
  state.customWines.push(w);
  return w;
}

function identifyFromCatalog(q) {
  const s = fold(q);
  if (!s) return WINE_CATALOG.slice(0, 8);
  const tokens = s.split(/\s+/).filter(t => t.length > 1);
  return catalogWines().filter(w => {
    const hay = wineHay(w, (w.grapes || []).join(" "));
    return tokens.every(t => hay.includes(t));
  });
}
function previewScanQuery() {
  if ($("#scan-read")) return;
  const q = ($("#scan-q") && $("#scan-q").value) || "";
  if (!fold(q)) {
    if ($("#scan-results")) $("#scan-results").innerHTML = "";
    return;
  }
  renderHits(identifyFromCatalog(q).slice(0, 8), "Coincidencias", true);
}

function queueIntake(wineId) {
  const w = wineById(wineId);
  if (!w) return toast("No hay ficha");
  const q = (($("#scan-q") && $("#scan-q").value) || lastOcrText || "").trim();
  const source = intakeSource === "manual" || !lastLabelData ? "manual" : (intakeSource || "camara");
  parkScanInInbox(ensureScannedWine(w, q), q, source);
}
function manualIntake() {
  intakeSource = "manual";
  const q = (($("#scan-q") && $("#scan-q").value) || "").trim();
  if (!q) {
    setScanStatus("Escribe bodega, vino y añada. Alta manual es la última opción, sin foto.");
    if (screenId !== "scan") {
      show("scan");
      lastList = "scan";
    }
    const input = $("#scan-q");
    if (input) input.focus();
    return;
  }
  const hits = identifyFromCatalog(q);
  if (hits.length === 1) {
    parkScanInInbox(ensureScannedWine(hits[0], q), q, "manual");
    return;
  }
  if (hits.length > 1) {
    renderHits(hits, "Elige la ficha", true);
    return;
  }
  const w = inferWineFromText(q);
  if (!w) return toast("Escribe bodega y añada");
  settleNewWine(w, q, "manual", "");
}
function runIdentify() {
  manualIntake();
}

function takenBins(cellarId) {
  const used = new Set();
  state.bottles.filter(b => b.cellarId === cellarId && b.bin).forEach(b => used.add(b.bin));
  (state.inbox || []).filter(r => !r.entered && r.cellarId === cellarId && r.bin).forEach(r => used.add(r.bin));
  return used;
}
function nextBin(cellarId) {
  const v = state.vinotecas.find(x => x.id === cellarId);
  const used = takenBins(cellarId);
  if (v) {
    ensureCaveSlots(v);
    const free = rackSlots(cellarId).find(code => !used.has(code));
    if (free) return free;
  }
  for (let i = 1; i <= 40; i++) {
    const bin = "A-" + String(i).padStart(2, "0");
    if (!used.has(bin)) return bin;
  }
  return "A-99";
}

function quickAdd(wineId) {
  const w = wineById(wineId);
  if (!w) {
    setScanStatus("No se pudo crear la ficha. Escribe bodega y añada.");
    return;
  }
  currentWine = w;
  const cellarId = preferredCellar(w, 0) || "v1";
  const thumb = lastLabelData && lastLabelData.length < 120000 ? lastLabelData : "";
  currentBottle = mergeOrCreateLot({
    wineId: w.id, cellarId, bin: nextBin(cellarId), qty: 1, price: 0,
    note: "Alta por etiqueta", photo: thumb
  });
  try { logAct(`Alta rápida ${w.producer} ${w.name} → ${cellarName(cellarId)}`); } catch (e) {}
  save();
  const tmin = w.conservation && w.conservation.cellarMin;
  const tmax = w.conservation && w.conservation.cellarMax;
  toast(tmin ? ("1 en " + cellarName(cellarId) + " · " + tmin + "–" + tmax + " °C") : ("1 botella en " + cellarName(cellarId)));
  try { openWine(w.id, currentBottle); }
  catch (e) {
    setScanStatus("Guardado. Ábrelo en Botellas.");
    show("cellar", { tab: true });
  }
}
function consumeMany() {
  if (!currentBottle) return;
  const n = parseInt(prompt("¿Cuántas sirves de este lote? (hay " + currentBottle.qty + ")", "1"), 10);
  if (!n || n < 1) return;
  consumeBottle(n);
}
function deleteCave(id) {
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  if (state.vinotecas.length < 2) return toast("Deja al menos una vinoteca");
  const used = state.bottles.filter(b => b.cellarId === id);
  const dest = state.vinotecas.find(x => x.id !== id);
  if (used.length && !confirm(`${v.name} tiene ${used.reduce((n,b)=>n+b.qty,0)} botellas. ¿Pasarlas a ${dest.name} y dar de baja?`)) return;
  used.forEach(b => { b.cellarId = dest.id; });
  state.vinotecas = state.vinotecas.filter(x => x.id !== id);
  logAct("Baja vinoteca " + v.name);
  save();
  toast("Vinoteca dada de baja");
  show("caves");
}

function renderHits(hits, title, withAdd) {
  $("#scan-results").innerHTML = `<h2>${title}</h2>` + (hits.map(w => {
    const p = phaseOf(w);
    const have = state.bottles.filter(b => b.wineId === w.id).reduce((n, b) => n + b.qty, 0);
    return `<div class="card">
      <div class="bottle-row" role="button" onclick="openWine('${w.id}')">
        <div class="capsule" style="background:${w.color}"></div>
        <div class="meta">
          <div class="row"><h3>${w.producer} ${w.name}</h3><span class="badge ${p.key}">${w.vintage}</span></div>
          <p class="muted">${w.region} · Vivino ${w.ratings.vivino.score.toFixed(1)} · Peñín ${w.ratings.penin.score}</p>
          ${have ? `<p class="tiny">Ya tienes ${have} ud</p>` : ""}
        </div>
      </div>
      ${withAdd ? `<div class="scan-hit-actions">
        <button class="btn btn-gold" onclick="event.stopPropagation();queueIntake('${w.id}')">Reservar hueco</button>
        <button class="btn btn-ghost" onclick="event.stopPropagation();openWine('${w.id}')">Ver ficha</button>
      </div>` : ""}
    </div>`;
  }).join("") || `<p class="empty">Sin ficha en el catálogo.</p><button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="manualIntake()">Crear ficha con lo escrito</button>`);
}

function fillSelects() {
  const opts = state.vinotecas.map(v => `<option value="${v.id}">${v.name}</option>`).join("");
  $("#add-cellar").innerHTML = opts;
  $("#move-cellar").innerHTML = opts;
}

function onAddCellarChange() {
  const id = $("#add-cellar") && $("#add-cellar").value;
  if ($("#add-bin") && id) $("#add-bin").value = nextBin(id);
  refreshAddKeep();
}
function showSheet(id) {
  fillSelects();
  if (id === "add-sheet") {
    if ($("#add-inbox-uid")) $("#add-inbox-uid").value = "";
    const cellar = currentWine ? preferredCellar(currentWine, currentBottle && currentBottle.price) : "v1";
    $("#add-cellar").value = cellar;
    $("#add-bin").value = nextBin(cellar);
    $("#add-qty").value = "1";
    refreshAddKeep();
  }
  if (id === "move-sheet" && currentBottle) {
    $("#move-cellar").value = currentBottle.cellarId;
    $("#move-bin").value = currentBottle.bin || "";
    if ($("#move-qty")) $("#move-qty").value = currentBottle.qty;
    if ($("#move-hint")) $("#move-hint").textContent = `${currentBottle.qty} ud en ${cellarName(currentBottle.cellarId)} ${currentBottle.bin || ""}`;
  }
  if (id === "add-sheet") refreshAddKeep();
  $$(".modal-bg").forEach(m => m.classList.remove("show"));
  const el = document.getElementById(id);
  if (el) el.classList.add("show");
}
function hideSheets() { $$(".modal-bg").forEach(m => m.classList.remove("show")); }

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(() => { t.style.opacity = "0"; }, 2200);
}

function notifyPrefs() {
  if (!state.notify) state.notify = { on: false, evolve: true, ready: true, temp: true, last: {} };
  if (!state.notify.last) state.notify.last = {};
  return state.notify;
}

function openNotify() {
  const n = notifyPrefs();
  $("#n-on").checked = !!n.on;
  $("#n-evolve").checked = n.evolve !== false;
  $("#n-ready").checked = n.ready !== false;
  $("#n-temp").checked = n.temp !== false;
  const perm = typeof Notification === "undefined" ? "unsupported" : Notification.permission;
  const tip = {
    granted: "Permiso dado. Los avisos salen al abrir la app y en pruebas.",
    denied: "El iPhone ha bloqueado los avisos. Ajustes → Notificaciones → Casa Llavaneras.",
    default: "Pulsa Permitir y acepta el diálogo del iPhone.",
    unsupported: "Este navegador no admite avisos."
  };
  $("#notify-perm").textContent = tip[perm] || tip.default;
  hydratePriceFields();
  showSheet("notify-sheet");
}

function setNotify(key, val) {
  const n = notifyPrefs();
  if (key === "on") n.on = !!val;
  else n[key] = !!val;
  save();
  if (key === "on" && val) enableNotifications();
  else renderHome();
}

async function enableNotifications() {
  if (typeof Notification === "undefined") {
    toast("Este iPhone no admite avisos web");
    return;
  }
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (!standalone) {
    toast("Antes: Compartir → Añadir a pantalla de inicio");
  }
  let perm = Notification.permission;
  if (perm !== "granted") {
    try { perm = await Notification.requestPermission(); } catch { perm = "denied"; }
  }
  const n = notifyPrefs();
  n.on = perm === "granted";
  if (perm === "granted") {
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8(VAPID_PUBLIC)
        });
      }
      n.subscription = sub.toJSON();
    } catch {
      n.subscription = null;
    }
  }
  save();
  openNotify();
  renderHome();
  if (perm === "granted") {
    toast("Avisos activados");
    runNotifyCheck(true);
  } else if (perm === "denied") {
    toast("Actívalos en Ajustes del iPhone");
  }
}

const VAPID_PUBLIC = "BJTA-BISIe4fBRIQrwMpcYo4uEjhCGtz0ZjhRQxFsgCGE-TRpcv7QAmHIqcjnJAy2m53kYUFWR-qjRp6emitpqY";
function urlB64ToUint8(s) {
  const pad = "=".repeat((4 - s.length % 4) % 4);
  const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function pushNote(title, body, tag, open) {
  const n = notifyPrefs();
  if (!n.on || typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  const now = Date.now();
  if (!forceOnce && n.last[tag] && now - n.last[tag] < 12 * 60 * 60 * 1000) return false;
  n.last[tag] = now;
  save();
  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.active) {
      reg.active.postMessage({ type: "notify", title, body, tag, open });
      return true;
    }
  } catch {}
  try {
    new Notification(title, { body, tag });
    return true;
  } catch {
    return false;
  }
}

let forceOnce = false;

async function testNotification() {
  forceOnce = true;
  const n = notifyPrefs();
  n.on = true;
  save();
  if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
    await enableNotifications();
  }
  await pushNote("Casa Llavaneras", "Avisos listos. Te avisaremos del apogeo y de la temperatura.", "test", "home");
  forceOnce = false;
  toast("Aviso de prueba enviado");
}

function runNotifyCheck(force) {
  const n = notifyPrefs();
  if (!n.on) return;
  if (force) forceOnce = true;
  const ready = bottlesReady();
  const alerts = state.bottles.filter(b => {
    const w = wineById(b.wineId);
    return w && (phaseOf(w).key === "warn" || phaseOf(w).key === "late");
  });
  const main = state.vinotecas.find(v => v.id === "v1");
  if (n.temp && main && main.tHigh >= 15) {
    pushNote("Vinoteca a " + main.tHigh.toFixed(1) + " °C", "Baja SET 1 hacia 12–14 °C para la guarda.", "temp", "caves");
  }
  if (n.evolve && alerts.length) {
    const w = wineById(alerts[0].wineId);
    pushNote("Beber pronto", w.producer + " " + w.name + " " + w.vintage + " · " + alerts.length + " aviso" + (alerts.length > 1 ? "s" : ""), "evolve", "calendar");
  }
  if (n.ready && ready.length) {
    const w = wineById(ready[0].wineId);
    pushNote("En apogeo", w.producer + " " + w.name + " listo para abrir.", "ready", "home");
  }
  forceOnce = false;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", ev => {
    const d = ev.data || {};
    if (d.type === "open" && d.screen) show(d.screen);
  });
}

function clock() {
  const d = new Date();
  $("#clock").textContent = d.toTimeString().slice(0, 5);
}

window.renderCellar = renderCellar;
window.renderPairings = renderPairings;
window.openDish = openDish;
window.setPairMode = (m, btn) => {
  pairingMode = m;
  $$("#pair-seg button").forEach(b => b.classList.toggle("on", b === btn));
  renderPairings();
};
window.setPairQuery = v => { pairingQuery = v; renderPairings(); };
window.show = show;
window.openBottle = openBottle;
window.openWine = openWine;
window.openWineSub = openWineSub;
window.openExternal = openExternal;
const BODEGA_GEO = {
  "Vega Sicilia": { lat: 41.6325, lng: -4.286, zone: "Valbuena de Duero", web: "https://www.temposvegasicilia.com/es" },
  "Dominio de Pingus": { lat: 41.636, lng: -4.363, zone: "Quintanilla de Onésimo", web: "https://www.pingus.es" },
  "R. López de Heredia": { lat: 42.5764, lng: -2.8467, zone: "Haro · Rioja Alta", web: "https://www.lopezdeheredia.com" },
  "Marqués de Riscal": { lat: 42.515, lng: -2.618, zone: "Elciego · Rioja Alavesa", web: "https://www.marquesderiscal.com" },
  "Álvaro Palacios": { lat: 41.1934, lng: 0.7769, zone: "Gratallops · Priorat", address: "Polígono Industrial 6, Parcela 26, 43737 Gratallops, Tarragona", web: "https://www.alvaropalacios.com" },
  "Pazo de Señoráns": { lat: 42.516, lng: -8.727, zone: "Meis · Rías Baixas", web: "https://www.pazodesenorans.com" },
  "CVNE": { lat: 42.576, lng: -2.846, zone: "Haro · Rioja Alta", web: "https://www.cvne.com" },
  "Gramona": { lat: 41.426, lng: 1.785, zone: "Sant Sadurní d'Anoia", web: "https://www.gramona.com" },
  "Moët & Chandon": { lat: 49.082, lng: 3.946, zone: "Hautvillers · Champagne", web: "https://www.domperignon.com" },
  "Château Margaux": { lat: 45.044, lng: -0.677, zone: "Margaux · Médoc", web: "https://www.chateau-margaux.com" },
  "Tenuta San Guido": { lat: 43.234, lng: 10.565, zone: "Bolgheri", web: "https://www.tenutasanguido.com" },
  "Penfolds": { lat: -34.536, lng: 138.959, zone: "Magill · South Australia", web: "https://www.penfolds.com" },
  "Bodegas Muga": { lat: 42.577, lng: -2.847, zone: "Haro · Rioja Alta", web: "https://www.bodegasmuga.com" },
  "Scala Dei": { lat: 41.2547, lng: 0.8095, zone: "Escaladei · Priorat", address: "Rambla de la Cartoixa, 5, 43379 Escaladei, Tarragona", web: "https://www.cellersdescaladei.com" },
  "Enrique Mendoza": { lat: 38.580, lng: -0.103, zone: "Alfaz del Pi · Alicante", web: "https://www.bodegasmendoza.com" },
  "Numanthia": { lat: 41.525, lng: -5.395, zone: "Valdefinjas · Toro", web: "https://www.numanthia.com" },
  "Marqués de Murrieta": { lat: 42.430, lng: -2.445, zone: "Ygay · Rioja", web: "https://www.marquesdemurrieta.com" },
  "Bodegas Alejandro Fernández": { lat: 41.641, lng: -4.158, zone: "Pesquera de Duero", address: "Pesquera de Duero, Valladolid", web: "https://www.grupopesquera.com" }
};

function bodegaGeo(w) {
  const known = BODEGA_GEO[w && w.producer];
  if (known) return known;
  const g = (w && w.geo) || {};
  const lat = Number(g.lat);
  const lng = Number(g.lng);
  const pin = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) > 0.2;
  return {
    lat: pin ? lat : null,
    lng: pin ? lng : null,
    zone: g.zone || (w && (w.appellation || w.region || w.country)) || "Sin dato",
    address: g.address || "",
    web: g.web || ""
  };
}
function bodegaWeb(url) {
  let u = String(url || "").trim();
  if (!u) return "";
  u = u.replace(/https?:\/\/(www\.)?vega-sicilia\.com(\/.*)?$/i, "https://www.temposvegasicilia.com/es");
  u = u.replace(/https?:\/\/(www\.)?scaladei\.es(\/.*)?$/i, "https://www.cellersdescaladei.com");
  return u;
}
function openExternal(url) {
  if (!url) return false;
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    location.href = url;
  }
  return false;
}

function zoneStrip(w) {
  const g = bodegaGeo(w);
  return `<div class="zone-card" role="button" onclick="openWineSub('mapa')">
    <div>
      <p class="tiny">Zona de la bodega</p>
      <strong>${g.zone}</strong>
      <p class="muted">${w.appellation}</p>
    </div>
    <span class="tiny">Mapa y web ›</span>
  </div>`;
}

function mapTabs(on) {
  return `<div class="wine-tabs" style="margin-top:12px">
    <button type="button" class="${on === "mapa" ? "on" : ""}" onclick="openWineSub('mapa')">Mapa</button>
    <button type="button" class="${on === "historia" ? "on" : ""}" onclick="openWineSub('historia')">Historia</button>
    <button type="button" class="${on === "vinos" ? "on" : ""}" onclick="openWineSub('vinos')">Vinos</button>
  </div>`;
}
function placeLine(w, g) {
  if (g.address) return g.address;
  const zone = String(g.zone || "").trim();
  const region = String(w.region || "").trim();
  if (!zone) return region;
  if (!region || zone.toLowerCase() === region.toLowerCase() || zone.toLowerCase().includes(region.toLowerCase())) return zone;
  return zone + " · " + region;
}
function marketBand(w) {
  const d = dossierOf(w);
  const m = (d && d.market) || {};
  if (m.low || m.mid || m.high) {
    return { low: m.low || null, mid: m.mid || null, high: m.high || null, note: m.trend || "Dossier de la casa", source: "dossier" };
  }
  const nums = String((w && w.priceHint) || "").match(/\d+(?:[.,]\d+)?/g);
  if (nums && nums.length) {
    const vals = nums.map(n => Math.round(Number(String(n).replace(",", ".")))).filter(n => n > 0);
    if (vals.length) {
      const low = Math.min.apply(null, vals);
      const high = Math.max.apply(null, vals);
      const mid = vals.length === 1 ? vals[0] : Math.round((low + high) / 2);
      return {
        low: vals.length === 1 ? Math.round(vals[0] * 0.9) : low,
        mid: mid,
        high: vals.length === 1 ? Math.round(vals[0] * 1.12) : high,
        note: "Horquilla de la ficha (" + w.priceHint + "). No es cotización.",
        source: "ficha"
      };
    }
  }
  return { low: null, mid: null, high: null, note: "Sin precio en la ficha. Activa Gemini en Avisos si quieres una estimación.", source: "vacio" };
}
function mapaBlock(w) {
  const art = estateArt(w);
  const g = bodegaGeo(w);
  const file = (p) => "./" + String(p || "").replace(/^\.\//, "");
  const mapSrc = art.map ? (String(art.map).indexOf("data:") === 0 ? art.map : file(art.map)) : "";
  const mapImg = mapSrc
    ? `<img class="map-art" data-map="${mapSrc.indexOf("data:") === 0 ? "generado" : mapSrc}" src="${mapSrc}" alt="" onerror="this.style.display='none'">`
    : `<p class="muted" data-map="" style="text-align:center;margin:8px 0">${platePending.has(w.id) ? "Trazando el mapa de la zona…" : "Sin mapa de esta zona"}</p>`;
  const hasPin = g.lat != null && g.lng != null && Number.isFinite(Number(g.lat)) && Number.isFinite(Number(g.lng));
  const osm = hasPin ? `https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=16/${g.lat}/${g.lng}` : "";
  const pin = hasPin ? `${g.lat},${g.lng}` : "";
  const gmaps = hasPin ? `https://www.google.com/maps?q=${pin}` : "";
  const apple = hasPin ? `https://maps.apple.com/?ll=${pin}&q=${pin}` : "";
  const mapLinks = hasPin ? `
    <a class="btn btn-ghost" style="width:100%;margin-top:10px;display:block;text-align:center" href="${gmaps}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Google Maps</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${apple}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Mapas de Apple</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${osm}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">OpenStreetMap</a>` : `<p class="muted" style="margin-top:10px">Sin dato de coordenadas.</p>`;
  const shops = (w.shops || []).map(s => `<a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${escHtml(s.url)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${escHtml(s.source || "Tienda")}${s.price ? " · " + escHtml(s.price) : ""}</a>`).join("");
  return `
    ${mapImg}
    <p class="tiny" style="margin:0 0 10px;text-align:center">${g.zone || w.region}</p>
    <p class="eyebrow" style="font-size:10px;letter-spacing:.14em;margin:2px 0 0">${w.appellation || ""}</p>
    <h3 style="font-size:17px;margin:2px 0 2px;line-height:1.2">${w.producer}</h3>
    <p class="muted" style="margin:0 0 12px;font-size:13px">${placeLine(w, g)}</p>
    ${mapLinks}
    ${bodegaWeb(g.web) ? `<a class="btn btn-gold" style="width:100%;margin-top:8px;display:block;text-align:center" href="${bodegaWeb(g.web)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Web de la bodega</a>` : (w.provenance ? `<p class="muted" style="margin-top:8px">Web de la bodega: Sin dato</p>` : "")}
    ${shops}`;
}

function priceHistoryBlock(w) {
  if (!w || (!w.provenance && !(w.priceHistory && w.priceHistory.length))) return "";
  const rows = Array.isArray(w.priceHistory) ? w.priceHistory : [];
  if (!rows.length) return `<div class="card"><p class="tiny">Evolución de precio</p><p class="muted" style="margin-top:6px">Sin dato</p></div>`;
  return `<div class="card"><p class="tiny">Evolución de precio</p>${rows.map(r => `<p style="margin-top:8px">${escHtml(String(r.year))} · ${escHtml(String(r.mid))} €</p>`).join("")}</div>`;
}
function mercadoSkeleton(w) {
  const band = marketBand(w);
  const mine = currentBottle && currentBottle.price ? currentBottle.price + " €" : "—";
  const euro = (n) => n ? n + " €" : "Sin dato";
  return `
    <p class="muted" style="margin:6px 0 10px">${band.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">Baja</span><b>${euro(band.low)}</b></div>
      <div class="temp"><span class="tiny">Media</span><b>${euro(band.mid)}</b></div>
      <div class="temp"><span class="tiny">Alta</span><b>${euro(band.high)}</b></div>
      <div class="temp"><span class="tiny">Tu coste</span><b>${mine}</b></div>
    </div>
    <p class="tiny" id="mercado-src">${band.source === "ficha" ? "Ficha" : band.source === "dossier" ? "Dossier" : "Sin fuente"} · EUR</p>
    ${priceHistoryBlock(w)}`;
}

async function fillMercado(w) {
  const box = document.getElementById("mercado-box");
  if (!box || !window.WineDataProvider) return;
  const band = marketBand(w);
  let quote;
  try {
    quote = await WineDataProvider.priceOf(w);
  } catch (err) {
    quote = { low: band.low, mid: band.mid, high: band.high, currency: "EUR", source: band.source, note: band.note, trend: "" };
  }
  if (!quote.low && !quote.mid && !quote.high) {
    quote.low = band.low;
    quote.mid = band.mid;
    quote.high = band.high;
    quote.note = (quote.note ? quote.note + " " : "") + band.note;
    quote.source = band.source;
  }
  if (!document.getElementById("mercado-box")) return;
  const d = dossierOf(w);
  const mine = currentBottle && currentBottle.price ? currentBottle.price + " €" : "—";
  const euro = (n) => n ? n + " €" : "Sin dato";
  const tag = quote.source === "gemini" ? "Gemini" : quote.source === "live" ? "Live" : (quote.source === "ficha" ? "Página" : "Dossier");
  box.innerHTML = `
    <p class="muted" style="margin:6px 0 10px">${quote.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">Baja</span><b>${euro(quote.low)}</b></div>
      <div class="temp"><span class="tiny">Media</span><b>${euro(quote.mid)}</b></div>
      <div class="temp"><span class="tiny">Alta</span><b>${euro(quote.high)}</b></div>
      <div class="temp"><span class="tiny">Tu coste</span><b>${mine}</b></div>
    </div>
    <div class="card"><p class="tiny">${tag} · ${quote.currency || "EUR"}${quote.confianza ? " · confianza " + quote.confianza : ""}</p>
      <p class="muted" style="margin-top:6px">${quote.trend || ""}</p></div>
    ${priceHistoryBlock(w)}
    ${d.similar && d.similar.length ? `<h2 style="margin:16px 0 8px">Parecidos en catálogo</h2>${d.similar.map(id => {
      const s = wineById(id);
      if (!s) return "";
      return `<div class="card" role="button" onclick="openWine('${s.id}')"><h3>${s.producer} ${s.name} ${s.vintage}</h3><p class="muted">${s.region} · ${s.priceHint}</p></div>`;
    }).join("")}` : ""}
    <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openNotify()">Configurar fuente de precios</button>`;
}

function setPriceMode(on) {
  if (!window.WineDataProvider) return;
  WineDataProvider.saveCfg({ mode: on ? "live" : "demo" });
}
async function probeGeminiKey() {
  const el = document.getElementById("gemini-probe");
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const key = typed || storedGeminiKey();
  if (!key) {
    if (el) el.textContent = "No hay clave. Pégala arriba o guárdala antes.";
    return;
  }
  if (el) el.textContent = "Probando la clave…";
  try {
    const msg = await geminiProbe(key);
    if (el) el.textContent = msg;
  } catch (e) {
    if (el) el.textContent = "red o CORS";
  }
}
function savePriceCfg() {
  if (!window.WineDataProvider) return;
  const url = ($("#p-url") && $("#p-url").value.trim()) || "";
  const key = ($("#p-key") && $("#p-key").value.trim()) || "";
  const live = $("#p-live") && $("#p-live").checked;
  const geminiOn = $("#p-gemini") && $("#p-gemini").checked;
  const geminiKey = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  WineDataProvider.saveCfg({
    mode: live && key ? "live" : "demo",
    apiUrl: url || "https://www.wine-searcher.com/ws_api.php",
    apiKey: key,
    geminiOn: !!(geminiOn && geminiKey),
    geminiKey: geminiKey
  });
  hideSheets();
  toast(geminiOn && geminiKey ? "Precios: estimación Gemini" : live && key ? "Precios: Wine-Searcher" : "Precios: dossier");
}
function hydratePriceFields() {
  if (!window.WineDataProvider) return;
  const cfg = WineDataProvider.loadCfg();
  if ($("#p-live")) $("#p-live").checked = cfg.mode === "live" && !!cfg.apiKey;
  if ($("#p-url")) $("#p-url").value = cfg.apiUrl || "";
  if ($("#p-key")) $("#p-key").value = cfg.apiKey || "";
  if ($("#p-gemini")) $("#p-gemini").checked = !!cfg.geminiOn && !!cfg.geminiKey;
  if ($("#p-gemini-key")) $("#p-gemini-key").value = cfg.geminiKey || "";
}

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
  if (!ts) return "Aún no";
  const d = new Date(ts);
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function uniqueWines() {
  return new Set(state.bottles.map(b => b.wineId)).size;
}
function renderPerfil() {
  const p = prefs();
  const house = (state.houses[0] && state.houses[0].name) || "Casa Llavaneras";
  $("#perfil-body").innerHTML = `
    <div class="hero">
      <p class="eyebrow">Mi Vinoteca</p>
      <h1>Perfil</h1>
      <p>Colección, preferencias y configuración</p>
    </div>
    <div class="card" style="display:flex;gap:14px;align-items:center">
      <img src="apple-touch-icon.png" alt="" style="width:64px;height:64px;border-radius:32px;border:1px solid rgba(198,163,90,.4)">
      <div>
      <p class="tiny">Colección</p>
      <h3 style="margin-top:4px">Mi Vinoteca ${house}</h3>
      <p class="muted">${totalBottles()} botellas · ${uniqueWines()} vinos</p>
      </div>
      <div class="temp-grid" style="margin-top:12px">
        <div class="temp"><span class="tiny">Botellas</span><b>${totalBottles()}</b></div>
        <div class="temp"><span class="tiny">Vinos</span><b>${uniqueWines()}</b></div>
      </div>
      <p class="tiny" style="margin-top:12px">Última copia de seguridad</p>
      <p>${fmtBackup(p.lastBackup)}</p>
    </div>
    ${p.demo ? `<div class="card"><div class="row"><strong>Modo demostración</strong><button class="btn btn-ghost" onclick="exitDemo()">Salir</button></div><p class="tiny" style="margin-top:6px">Los vinos de ejemplo no son tu colección real.</p></div>` : ""}
    <div class="card" role="button" onclick="openPerfilSub('casas')"><div class="row"><h3>Mis casas y vinotecas</h3><span>›</span></div><p class="muted">Gestionar ubicaciones físicas.</p></div>
    <div class="card" role="button" onclick="openPerfilSub('cata')"><div class="row"><h3>Preferencias de cata</h3><span>›</span></div><p class="muted">Escala 0–${p.scale}. El cuaderno aprobado no cambia.</p></div>
    <div class="card" role="button" onclick="openPerfilSub('fuentes')"><div class="row"><h3>Puntuaciones externas</h3><span>›</span></div><p class="muted">Qué guías se ven en la ficha.</p></div>
    <div class="card" role="button" onclick="openPerfilSub('privacidad')"><div class="row"><h3>Privacidad y seguridad</h3><span>›</span></div><p class="muted">Valor, precios, hueco.</p></div>
    <div class="card" role="button" onclick="openPerfilSub('backup')"><div class="row"><h3>Copias de seguridad</h3><span>›</span></div><p class="muted">Exportar y restaurar JSON / CSV.</p></div>
    <div class="card" role="button" onclick="openPerfilSub('acerca')"><div class="row"><h3>Acerca de</h3><span>›</span></div><p class="muted">v1.0.0 · esquema localStorage</p></div>
    <input id="restore-file" type="file" accept="application/json,.json" hidden onchange="reviewRestore(this.files[0])" />
    <input id="import-csv" type="file" accept=".csv,text/csv" hidden onchange="importCsv(this.files[0])" />`;
}
function openPerfilSub(kind) {
  const p = prefs();
  const titles = {
    casas: "Mis ubicaciones",
    cata: "Preferencias de cata",
    fuentes: "Fuentes externas",
    privacidad: "Privacidad y seguridad",
    backup: "Copias de seguridad",
    acerca: "Acerca de"
  };
  let body = "";
  if (kind === "casas") {
    body = state.houses.map(h => {
      const caves = state.vinotecas.filter(v => (v.houseId || "h1") === h.id);
      return `<div class="card"><p class="tiny">${h.type || "Casa"}</p><h3>${h.name}</h3>
        ${caves.map(v => `<p class="muted" style="margin-top:6px">· ${v.name} · ${v.used || 0}/${v.capacity} · ${v.tHigh} °C</p>`).join("") || `<p class="muted">Sin vinotecas</p>`}
      </div>`;
    }).join("") + `<button class="btn btn-gold" style="width:100%" onclick="showSheet('cave-sheet')">Añadir vinoteca</button>
      <p class="tiny" style="margin-top:10px">La casa se indica en el campo Casa. No pedimos dirección postal.</p>`;
  } else if (kind === "cata") {
    body = `
      <div class="card"><p class="tiny">Escala principal</p>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn ${p.scale===10?"btn-gold":"btn-ghost"}" onclick="setPref('scale',10)">0–10</button>
          <button class="btn ${p.scale===100?"btn-gold":"btn-ghost"}" onclick="setPref('scale',100)">0–100</button>
        </div>
        <p class="muted" style="margin-top:8px">El cuaderno sigue Débil–Ácido / Seco–Dulce / Suave–Tánico / Ligero–Poderoso.</p>
      </div>
      <label class="switch-row"><span>Permitir decimales</span><input type="checkbox" ${p.decimals?"checked":""} onchange="setPref('decimals', this.checked)" /></label>`;
  } else if (kind === "fuentes") {
    const rows = [
      ["vivino","Vivino"],["penin","Peñín"],["parker","Parker"],
      ["spectator","Wine Spectator"],["decanter","Decanter"],["vinous","Vinous"],["suckling","James Suckling"]
    ];
    body = `<p class="muted" style="margin-bottom:10px">Solo ocultan o muestran la guía. No hay API de Vivino.</p>` +
      rows.map(([k,l]) => `<label class="switch-row"><span>${l}</span><input type="checkbox" ${p.sources[k]!==false?"checked":""} onchange="setSource('${k}', this.checked)" /></label>`).join("");
  } else if (kind === "privacidad") {
    body = `
      <label class="switch-row"><span>Mostrar valor de la colección</span><input type="checkbox" ${p.hideValue?"":"checked"} onchange="setPref('hideValue', !this.checked)" /></label>
      <label class="switch-row"><span>Mostrar precios en las fichas</span><input type="checkbox" ${p.hidePrices?"":"checked"} onchange="setPref('hidePrices', !this.checked)" /></label>
      <label class="switch-row"><span>Mostrar hueco exacto</span><input type="checkbox" ${p.hideBin?"":"checked"} onchange="setPref('hideBin', !this.checked)" /></label>
      <div class="card" style="margin-top:12px"><p class="tiny">Face ID</p><p class="muted" style="margin-top:6px">En PWA no hay Face ID nativo. Más adelante: PIN o passkey. La colección no se publica.</p></div>`;
  } else if (kind === "backup") {
    body = `
      <div class="card"><p class="tiny">Última copia</p><h3 style="margin-top:4px">${fmtBackup(p.lastBackup)}</h3><p class="muted">${p.lastBackup ? "Correcta" : "Pendiente"}</p></div>
      <button class="btn btn-gold" style="width:100%" onclick="exportBackup()">Crear copia ahora · JSON</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="exportCsv()">Exportar inventario · CSV</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="exportTastingCsv()">Exportar catas · CSV</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="$('#restore-file').click()">Restaurar copia JSON</button>
      <p class="tiny" style="margin:12px 0">La restauración pide confirmación. No se mezcla a ciegas.</p>
      <button class="btn btn-ghost" style="width:100%" onclick="askWipe()">Eliminar colección</button>`;
  } else {
    body = `
      <div class="card"><h3>Mi Vinoteca</h3><p class="muted" style="margin-top:6px">Versión 1.0.0</p>
        <p class="tiny" style="margin-top:10px">Esquema vinoteca.pro.max.v3 · ${totalBottles()} botellas · ${uniqueWines()} vinos · ${state.vinotecas.length} vinotecas</p>
        <p class="tiny">Última copia: ${fmtBackup(p.lastBackup)}</p>
      </div>
      <p class="muted">Colección privada. No se indexa ni se comparte sola.</p>`;
  }
  $("#perfil-sub-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">Mi Vinoteca</p>
    <h1>${titles[kind]}</h1>
    ${body}`;
  show("perfil-sub");
}
function setPref(key, val) {
  prefs()[key] = val;
  save();
  renderPerfil();
  if (document.getElementById("perfil-sub").classList.contains("active")) {
    const t = ($("#perfil-sub-body h1") || {}).textContent;
    const map = { "Preferencias de cata":"cata", "Privacidad y seguridad":"privacidad" };
    if (map[t]) openPerfilSub(map[t]);
  }
  if (key === "hideValue" || key === "hidePrices" || key === "hideBin") renderHome();
}
function setSource(key, on) {
  prefs().sources[key] = !!on;
  save();
}
function exportBackup() {
  const payload = {
    version: "1.0.0",
    savedAt: new Date().toISOString(),
    houses: state.houses,
    vinotecas: state.vinotecas,
    bottles: state.bottles,
    tasting: state.tasting,
    favorites: state.favorites,
    prefs: state.prefs,
    notify: state.notify,
    customWines: state.customWines || [],
    plateCache: state.plateCache || {}
  };
  downloadFile("MiVinoteca_Backup_" + new Date().toISOString().slice(0,10) + ".json", JSON.stringify(payload, null, 2), "application/json");
  prefs().lastBackup = Date.now();
  save();
  toast("Copia JSON descargada");
  if ($("#perfil-sub").classList.contains("active")) openPerfilSub("backup");
}
function exportCsv() {
  const head = ["Nombre","Bodega","Añada","Región","País","Tipo","Cantidad","Ubicación","Puntuación","Estado","Precio"];
  const rows = state.bottles.map(b => {
    const w = wineById(b.wineId) || {};
    const loc = state.prefs.hideBin ? houseName(state.vinotecas.find(v=>v.id===b.cellarId)?.houseId) : (cellarName(b.cellarId) + " " + (b.bin||""));
    const price = state.prefs.hidePrices ? "" : (b.price || "");
    return [w.name, w.producer, w.vintage, w.region, w.country, w.type, b.qty, loc, w.ratings && w.ratings.parker ? w.ratings.parker.score : "", phaseOf(w).label, price];
  });
  const csv = [head].concat(rows).map(r => r.map(x => `"${String(x??"").replace(/"/g,'""')}"`).join(";")).join("\n");
  downloadFile("MiVinoteca_Inventario_" + new Date().toISOString().slice(0,10) + ".csv", csv, "text/csv");
  toast("CSV de inventario");
}
function exportTastingCsv() {
  const head = ["Vino","Añada","Acidez","Dulzor","Tanino","Cuerpo","Recuerdo"];
  const rows = Object.keys(state.tasting||{}).map(id => {
    const w = wineById(id) || {};
    const t = state.tasting[id] || {};
    return [w.producer + " " + w.name, w.vintage, t.acidez, t.dulzor, t.tanino, t.cuerpo, t.note||""];
  });
  const csv = [head].concat(rows).map(r => r.map(x => `"${String(x??"").replace(/"/g,'""')}"`).join(";")).join("\n");
  downloadFile("MiVinoteca_Catas_" + new Date().toISOString().slice(0,10) + ".csv", csv, "text/csv");
  toast("CSV de catas");
}
function downloadFile(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
function reviewRestore(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const nB = (data.bottles||[]).length;
      const nW = new Set((data.bottles||[]).map(b => b.wineId)).size;
      const nT = Object.keys(data.tasting||{}).length;
      if (!confirm(`COPIA ENCONTRADA\n${nW} vinos\n${nB} lotes de botellas\n${nT} catas\nFecha: ${data.savedAt||"—"}\n\nEsto REEMPLAZA la colección actual. ¿Continuar?`)) return;
      if (!data.bottles || !data.vinotecas) return toast("Archivo no válido");
      state.houses = data.houses || state.houses;
      state.vinotecas = data.vinotecas;
      state.bottles = data.bottles;
      state.tasting = data.tasting || {};
      state.favorites = data.favorites || [];
      if (data.prefs) state.prefs = Object.assign(prefs(), data.prefs);
      if (data.notify) state.notify = data.notify;
      if (Array.isArray(data.customWines)) state.customWines = data.customWines;
      if (data.plateCache && typeof data.plateCache === "object") state.plateCache = data.plateCache;
      prefs().lastBackup = Date.now();
      save();
      toast("Colección restaurada");
      show("perfil");
    } catch {
      toast("JSON ilegible");
    }
  };
  reader.readAsText(file);
}
function importCsv() { toast("Importar CSV: siguiente pase. Usa JSON de copia."); }
function askWipe() {
  const ok = prompt("Esto borra botellas y catas de este iPhone.\nEscribe ELIMINAR para confirmar.");
  if (ok !== "ELIMINAR") return toast("No se ha borrado");
  state.bottles = [];
  state.tasting = {};
  state.favorites = [];
  prefs().demo = false;
  save();
  toast("Colección vacía");
  show("perfil");
}
function exitDemo() {
  prefs().demo = false;
  save();
  toast("Fuera de demostración. Los datos de este teléfono siguen aquí.");
  renderPerfil();
}

function setTaste(id, field, val) {
  if (!state.tasting) state.tasting = {};
  const cur = getTaste(id);
  cur[field] = field === "note" ? val : Number(val);
  cur.at = Date.now();
  state.tasting[id] = cur;
  save();
  const el = document.getElementById("tv-" + field);
  if (el) el.textContent = val;
}
window.setTaste = setTaste;
window.openWineMenu = openWineMenu;
window.openCave = openCave;
window.startScan = startScan;
window.renderInbox = renderInbox;
window.enterInbox = enterInbox;
window.parkScanInInbox = parkScanInInbox;
window.runIdentify = runIdentify;
window.fakeScan = runIdentify;
window.captureLabel = captureLabel;
window.pickLabelPhoto = pickLabelPhoto;
window.pickFromRoll = pickFromRoll;
window.confirmScanWine = confirmScanWine;
window.confirmScanCustom = confirmScanCustom;
window.quickAdd = quickAdd;
window.toggleFav = toggleFav;
window.addCurrentToCellar = addCurrentToCellar;
window.openNotify = openNotify;
window.openPerfilSub = openPerfilSub;
window.setPref = setPref;
window.setSource = setSource;
window.exportBackup = exportBackup;
window.exportCsv = exportCsv;
window.exportTastingCsv = exportTastingCsv;
window.reviewRestore = reviewRestore;
window.importCsv = importCsv;
window.askWipe = askWipe;
window.exitDemo = exitDemo;
window.quickTaste = quickTaste;
window.openHomeMap = openHomeMap;
window.openWineThenTaste = openWineThenTaste;
window.addToLot = addToLot;
window.consumeMany = consumeMany;
window.deleteCave = deleteCave;
window.goBack = goBack;
window.refreshAddKeep = refreshAddKeep;
window.setPriceMode = setPriceMode;
window.savePriceCfg = savePriceCfg;
window.probeGeminiKey = probeGeminiKey;
window.setNotify = setNotify;
window.enableNotifications = enableNotifications;
window.testNotification = testNotification;
window.moveBottle = moveBottle;
window.addCave = addCave;
window.saveCaveTemp = saveCaveTemp;
window.openSpaceSheet = openSpaceSheet;
window.addSequentialSpaces = addSequentialSpaces;
window.assignExistingSpace = assignExistingSpace;
window.previewNewSlots = previewNewSlots;
window.consumeBottle = consumeBottle;
window.showSheet = showSheet;
window.hideSheets = hideSheets;
window.removeLot = removeLot;
window.removeWineLots = removeWineLots;
window.deleteInbox = deleteInbox;
window.previewScanQuery = previewScanQuery;
window.setFilter = (t, btn) => {
  filterType = t;
  $$(".chip").forEach(c => c.classList.toggle("on", c === btn));
  renderCellar();
};

document.addEventListener("DOMContentLoaded", () => {
  clock();
  setInterval(clock, 30000);
  renderHome();
  setTimeout(() => $("#splash").classList.add("hide"), 700);
  setTimeout(() => runNotifyCheck(false), 1600);
});

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
const APP_VERSION = "v67";
const PRICE_CFG_KEY = "vinoteca-jgc-provider";

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
  inbox: []
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
  if (!wine || !wine.aging) return { key: "wait", label: "Sin dato", hint: "" };
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
  mountLabelThumbs(document.getElementById(id));
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
    </div>
    <p class="tiny app-version" style="text-align:center;margin:18px 0 8px">Versión ${APP_VERSION}</p>`;
  mountLabelThumbs(document.getElementById("home"));
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
  const pageLocks = (field, value) => wine.provenance[field] === "página" && String(value || "").trim() && !titleLooksDirty(value);
  if (idn.name && !pageLocks("name", wine.name) && (dirty || titleLooksDirty(wine.name) || !String(wine.name || "").trim())) {
    wine.name = idn.name;
    markWineSource(wine, "name", "título");
  }
  if (idn.producer && !pageLocks("producer", wine.producer) && (dirty || !String(wine.producer || "").trim() || titleLooksDirty(wine.producer))) {
    wine.producer = idn.producer;
    markWineSource(wine, "producer", "título");
  }
  if (idn.region && !pageLocks("region", wine.region)) {
    wine.region = idn.region;
    wine.appellation = idn.appellation || idn.region;
    markWineSource(wine, "region", "título");
  }
  if (idn.country && !pageLocks("country", wine.country)) {
    wine.country = idn.country;
    markWineSource(wine, "country", "título");
  }
  if (idn.type && !pageLocks("type", wine.type)) {
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
function legacyGeminiNote(note) {
  const n = String(note || "").trim();
  if (!n || n === NO_GEMINI_NOTE) return false;
  return /ajustes de precio/i.test(n) || /sin clave de gemini/i.test(n);
}
function internetAddedWine(w) {
  if (!w || isCatalogWineId(w.id)) return false;
  if (w.style === "internet" || w.style === "escaneo") return true;
  const p = w.provenance;
  return !!(p && (p.pageUrl || p.rawTitle));
}
function refreshDirtyInternetWine(wine) {
  if (!internetAddedWine(wine)) return false;
  wine.provenance = wine.provenance || {};
  const dirty = titleLooksDirty(wine.name) || titleLooksDirty(wine.producer);
  const stale = legacyGeminiNote(wine.provenance.geminiNote) || !!wine.enrichError || !!(wine.provenance && wine.provenance.enrichError);
  if (!dirty && !stale) return false;
  if (dirty) {
    const raw = [wine.provenance.rawTitle, wine.name, wine.producer, wine.vintage, wine.provenance.pageUrl].filter(Boolean).join(" \n ");
    applyCleanIdentity(wine, raw);
  }
  if (wine.enrichError) delete wine.enrichError;
  if (wine.provenance.enrichError) delete wine.provenance.enrichError;
  if (!storedGeminiKey()) wine.provenance.geminiNote = NO_GEMINI_NOTE;
  else if (legacyGeminiNote(wine.provenance.geminiNote)) wine.provenance.geminiNote = "";
  return true;
}
function refreshDirtyInternetWines() {
  let changed = false;
  (state.customWines || []).forEach(w => {
    if (refreshDirtyInternetWine(w)) changed = true;
  });
  if (changed) save();
  return changed;
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
      <div class="label-row">${labelThumbHtml(w)}<div class="label-copy"><div class="row"><h3>${w.producer}</h3><span class="tiny">${w.vintage}</span></div>
      <p class="muted">${w.name} · ${w.appellation}</p></div></div>
    </div>`).join("") || "<p class='empty'>Aún no hay botellas de esta zona.</p>"}
    ${wines[0] ? `<button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWine('${wines[0].id}');setTimeout(()=>openWineSub('mapa'),80)">Mapa de bodega ›</button>` : ""}`;
  mountLabelThumbs($("#zonas-body"));
}

function renderCatas() {
  const list = lastTastings(20);
  $("#catas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">Mi Vinoteca</p>
    <h1>Catas</h1>
    <button class="btn btn-gold" style="width:100%;margin:10px 0" onclick="quickTaste()">Cata rápida</button>
    ${list.length ? list.map(t => `<div class="card" role="button" onclick="openWineThenTaste('${t.wine.id}')">
      <div class="label-row">${labelThumbHtml(t.wine)}<div class="label-copy"><div class="row"><h3>${t.wine.producer}</h3><span class="tiny">${t.when}</span></div>
      <p class="muted">${t.wine.name} ${t.wine.vintage}</p>
      <p class="tiny" style="margin-top:6px">${t.note || "Cuaderno sin recuerdo"}</p></div></div>
    </div>`).join("") : `<p class="empty">Todavía no hay catas. Usa Cata rápida.</p>`}`;
  mountLabelThumbs($("#catas-body"));
}

function cellarName(id) {
  return (state.vinotecas.find(v => v.id === id) || { name: "—" }).name;
}

function homeWineTile(w) {
  const p = phaseOf(w);
  return `<button class="wine-tile" onclick="openWine('${w.id}')">
    ${labelThumbHtml(w)}
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
    ${labelThumbHtml(w)}
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
      return `<div class="card" role="button" onclick="openWine('${w.id}')"><div class="label-row">${labelThumbHtml(w)}<div class="label-copy"><div class="row"><h3>${p}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[p].length} lote${by[p].length>1?"s":""}</p></div></div><button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeWineLots('${w.id}')">Quitar</button></div>`;
    }).join("");
  } else if (cellarView === "lotes") {
    body = list.map(b => {
      const w = wineById(b.wineId);
      return `<div class="card" role="button" onclick="openBottle('${b.uid}')"><div class="label-row">${labelThumbHtml(w)}<div class="label-copy"><div class="row"><h3>${w.producer}</h3><span class="tiny">×${b.qty}</span></div><p class="muted">${w.name} ${w.vintage}</p><p class="tiny">${cellarName(b.cellarId)} · ${state.prefs.hideBin ? "hueco oculto" : (b.bin || "sin hueco")}</p></div></div><button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeLot('${b.uid}')">Quitar lote</button></div>`;
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
      const w0 = wineById(first.wineId);
      return `<div class="card" role="button" onclick="openCave('${first.cellarId}')"><div class="label-row">${labelThumbHtml(w0)}<div class="label-copy"><div class="row"><h3>${k}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[k].map(b => wineById(b.wineId).name).join(" · ")}</p></div></div></div>`;
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
  mountLabelThumbs($("#cellar-list"));
}
function catalogHit(w) {
  return `<div class="inv-card" role="button" onclick="openWine('${w.id}')">
    ${labelThumbHtml(w)}
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
    ${labelThumbHtml(w)}
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
  mountLabelThumbs($("#calendar-list"));
}

function calBlock(title, arr) {
  if (!arr.length) return "";
  return `<h2 class="cal-h">${title}</h2>` + arr.map(b => {
    const w = wineById(b.wineId);
    const pr = progressOf(w);
    const mark = drinkWindowMarks(pr);
    return `<div class="cal-card" role="button" onclick="openBottle('${b.uid}')">
      <div class="cal-top">
        ${labelThumbHtml(w)}
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

function estateArt(w) {
  const byProducer = {
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
  const hit = byProducer[w.producer];
  if (hit) return hit;
  const place = [w.region, w.appellation, w.country].filter(Boolean).join(" ");
  let hitZone = detectZone(place);
  if (!hitZone) hitZone = detectZone([w.name, w.producer].filter(Boolean).join(" "));
  if (hitZone && hitZone.map) return { land: hitZone.map, cap: "capsula.jpg", map: hitZone.map };
  return { land: "", cap: "capsula.jpg", map: "" };
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
  w = w || {};
  const type = normTxt(w.type || "");
  if (type === "espumoso" || type === "cava" || type === "champagne") return "spark";
  if (type === "blanco" || type === "white") return "white";
  if (type === "rosado" || type === "rose") return "rose";
  if (type === "tinto" || type === "red") return "red";
  if (type === "generoso") return "generoso";
  const t = normTxt(`${w.style || ""} ${w.appellation || ""} ${w.region || ""} ${w.name || ""} ${(w.grapes || []).join(" ")}`);
  if (/\b(cava|champagne|espumoso|corpinnat)\b/.test(t)) return "spark";
  if (/\b(albarino|riesling|godello|verdejo|viura|chardonnay)\b/.test(t) || t.indexOf("rias baixas") >= 0 || t.indexOf("alsace") >= 0 || t.indexOf("mosela") >= 0) return "slim";
  if (/\b(blanco|white)\b/.test(t)) return "white";
  if (/\b(rosado|rose)\b/.test(t)) return "rose";
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
/* fotos realistas por tipo; el rosado usa la de blanco */
const BOTTLE_PHOTOS = {
  tinto: "botella-tinto.jpg",
  blanco: "botella-blanco.jpg",
  espumoso: "botella-espumoso.jpg",
  rosado: "botella-blanco.jpg"
};

function bottleTone(w) {
  const kind = bottleKind(w || {});
  if (kind === "spark") return "photo-espumoso";
  if (kind === "rose") return "photo-rosado";
  if (kind === "white" || kind === "slim") return "photo-blanco";
  return "photo-tinto";
}
function bottleAsset(w) {
  return bottleSrcFromTone(bottleTone(w));
}
function bottleMarkup(w) {
  const tone = bottleTone(w);
  return `<img class="bottle-photo" data-bottle="${tone}" src="${bottleSrcFromTone(tone)}" alt="Botella">`;
}
const CATALOG_LABELS = {
  "pingus-2018": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/dpin18_anv800.png",
  "tondonia-reserva-2011": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/vtonr11_anv800.png",
  "riscal-reserva-2019": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/mrisr19_anv800.png",
  "margaux-2016": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/chmar16_anv800.png",
  "vega-valbuena-2019": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/valb519_anv800.png",
  "muga-prado-enea-2015": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/prdn15_anv800.png",
  "numanthia-2018": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/numan18_anv800.png",
  "grange-2018": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/pengr18_anv800.png"
};
const labelPhotoCache = Object.create(null);
function bottleSrcFromTone(tone) {
  if (tone === "photo-blanco") return BOTTLE_PHOTOS.blanco;
  if (tone === "photo-espumoso") return BOTTLE_PHOTOS.espumoso;
  if (tone === "photo-rosado") return BOTTLE_PHOTOS.rosado || BOTTLE_PHOTOS.blanco;
  return BOTTLE_PHOTOS.tinto;
}
function openLabelDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error("no-idb")); return; }
    const req = indexedDB.open("casa-llavaneras-labels", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("thumbs")) req.result.createObjectStore("thumbs");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function loadLabelPhotos() {
  return openLabelDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("thumbs", "readonly");
    const req = tx.objectStore("thumbs").openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) { resolve(); return; }
      if (cur.key && cur.value) labelPhotoCache[cur.key] = cur.value;
      cur.continue();
    };
    req.onerror = () => reject(req.error);
  })).catch(() => {});
}
function saveWineLabelPhoto(id, dataUrl) {
  if (!id || !dataUrl) return Promise.resolve(false);
  labelPhotoCache[id] = dataUrl;
  return openLabelDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction("thumbs", "readwrite");
    tx.objectStore("thumbs").put(dataUrl, id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  })).catch(() => {
    const wine = wineById(id);
    if (wine && !isCatalogWineId(id) && dataUrl.length < 90000) wine.labelThumb = dataUrl;
    return false;
  });
}
function ownLabel(w) {
  if (!w) return "";
  if (labelPhotoCache[w.id]) return labelPhotoCache[w.id];
  if (w.labelThumb && String(w.labelThumb).indexOf("data:image") === 0) return w.labelThumb;
  const bottle = (state.bottles || []).find(b => b.wineId === w.id && b.labelPhoto && String(b.labelPhoto).indexOf("data:image") === 0);
  if (bottle) return bottle.labelPhoto;
  const row = (state.inbox || []).find(b => b.wineId === w.id && b.photo && String(b.photo).indexOf("data:image") === 0);
  return row ? row.photo : "";
}
function labelSrc(w) {
  const own = ownLabel(w);
  if (own) return own;
  if (w && w.labelUrl && /^https?:\/\//i.test(w.labelUrl)) return w.labelUrl;
  if (w && CATALOG_LABELS[w.id]) return CATALOG_LABELS[w.id];
  return "";
}
function labelThumbHtml(w, cls) {
  const tone = bottleTone(w);
  const src = labelSrc(w);
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
function rememberLabelPhoto(wineId, dataUrl) {
  if (!wineId || !dataUrl) return;
  compressLabelThumb(dataUrl).then(thumb => { if (thumb) saveWineLabelPhoto(wineId, thumb); });
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
      if (!thumb) { toast("No se pudo leer la foto"); return; }
      await saveWineLabelPhoto(wine.id, thumb);
      if (currentBottle && currentBottle.wineId === wine.id) currentBottle.labelPhoto = thumb;
      save();
      toast("Etiqueta actualizada");
      openWine(wine.id, currentBottle);
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function estateSVG(w) {
  const art = estateArt(w);
  const land = art.land ? `<img class="estate-photo" src="${art.land}" alt="" onerror="this.style.display='none'">` : "";
  const visual = labelSrc(w)
    ? labelThumbHtml(w, "label-thumb label-thumb-hero")
    : bottleMarkup(w);
  return `
    ${land}
    <div class="foil-wrap">
      ${visual}
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
  if (refreshDirtyInternetWine(w)) save();
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
    <button type="button" class="btn btn-ghost label-change" onclick="changeWineLabel()">Cambiar etiqueta</button>
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
  show("wine");
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
    mountLabelThumbs($("#pair-body"));
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
      ${labelThumbHtml(w)}
      <div class="pair-copy">
        <h3>${shortWineName(w)}</h3>
        <p class="muted">${w.name} ${w.vintage} · ${w.region}</p>
        <p class="pair-dish">${d ? d.name : ((w.pairing || []).slice(0,2).join(" · "))}</p>
        <p class="pair-score-line">${top ? "★ " + top.score + "/100" : "★ ficha"}</p>
      </div>
      <span class="pair-go">›</span>
    </div>`;
  }).join("") || `<p class="empty">Sin coincidencias.</p>`;
  mountLabelThumbs($("#pair-body"));
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
        <div class="label-row">${labelThumbHtml(x.wine)}<div class="label-copy">
        <div class="row"><h3>${pairLabel(x.wine)}</h3><span class="badge ${x.score>=94?"ok":"warn"}">${x.score}</span></div>
        <p class="muted">${x.wine.vintage} · ${x.wine.region} · ${x.wine.type}</p>
        <p style="margin-top:8px">${x.why || ""}</p>
        <p class="tiny">${(x.pack && x.pack.serve) || ""}${have ? " · lo tienes" : ""}</p>
        </div></div>
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
  if (lastLabelData) rememberLabelPhoto(currentWine.id, lastLabelData);
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
function pageLabelUrl(md, wine) {
  if (!wine) return "";
  const text = String(md || "");
  const title = ((text.match(/^Title:\s*(.+)$/m) || [])[1] || "");
  const year = String(wine.vintage || "");
  const titleYears = title.match(/\b(?:19|20)\d{2}\b/g) || [];
  if (year && titleYears.length && titleYears.indexOf(year) < 0) return "";
  const stop = new Set("vino vinos wine reserva crianza gran tinto blanco rosado espumoso image imagen foto bottle botella ano anos bodega bodegas".split(" "));
  const tokens = normTxt([wine.producer, wine.name].filter(Boolean).join(" ")).split(" ").filter(t => t.length >= 4 && !stop.has(t));
  if (!tokens.length) return "";
  const bad = /logo|icon|sprite|favicon|flag|welcome|pixel|banner|payment|\.svg(?:$|\?)/i;
  const re = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  const titleN = normTxt(title);
  let best = "";
  let bestScore = 0;
  let match;
  while ((match = re.exec(text))) {
    const alt = match[1] || "";
    const url = match[2];
    if (bad.test(url) || bad.test(alt)) continue;
    const altN = normTxt(alt);
    const altYears = alt.match(/\b(?:19|20)\d{2}\b/g) || [];
    if (year && altYears.length && altYears.indexOf(year) < 0) continue;
    const yearOk = !!(year && (altYears.indexOf(year) >= 0 || titleYears.indexOf(year) >= 0));
    if (!yearOk) continue;
    if (altN && tokens.every(t => altN.indexOf(t) < 0) && altN.length > 12) continue;
    let score = 0;
    tokens.forEach(t => { if (altN.indexOf(t) >= 0) score += 3; });
    if (year && altYears.indexOf(year) >= 0) score += 4;
    if (tokens.some(t => titleN.indexOf(t) >= 0) && /prfmtgrande|\/vi\/|product|bottle/i.test(url)) score += 3;
    if (score > bestScore) { bestScore = score; best = url; }
  }
  return bestScore >= 3 ? best : "";
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
  if (facts.producer && !titleLooksDirty(facts.producer)) {
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
function readPriceCfg() {
  try {
    if (window.WineDataProvider && typeof WineDataProvider.loadCfg === "function") return WineDataProvider.loadCfg();
  } catch (e) {}
  try { return JSON.parse(localStorage.getItem(PRICE_CFG_KEY) || "{}"); } catch (e) {}
  return {};
}
function storedGeminiKey() {
  return String((readPriceCfg().geminiKey) || "").trim();
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
  const pageImage = pageLabelUrl(page, wine);
  if (pageImage && !ownLabel(wine)) wine.labelUrl = pageImage;
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
  applyCleanIdentity(wine, [wine.provenance.rawTitle || wine.name, wine.producer, wine.vintage, wine.provenance.pageUrl || ""].join(" \n "));
  if (wine.enrichError) delete wine.enrichError;
  if (wine.provenance.enrichError) delete wine.provenance.enrichError;
  if (legacyGeminiNote(wine.provenance.geminiNote)) wine.provenance.geminiNote = "";
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
    if (wine.enrichError) delete wine.enrichError;
    if (wine.provenance.enrichError) delete wine.provenance.enrichError;
    applyCleanIdentity(wine, [wine.provenance.rawTitle || wine.name, wine.producer, wine.vintage, wine.provenance.pageUrl || ""].join(" \n "));
    const noKey = !storedGeminiKey();
    if (noKey) wine.provenance.geminiNote = NO_GEMINI_NOTE;
    else if (legacyGeminiNote(wine.provenance.geminiNote)) wine.provenance.geminiNote = "";
    save();
    if (noKey) openNotify();
    if (currentWine && currentWine.id === wine.id) openWine(wine.id, currentBottle);
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
  if (row.photo) rememberLabelPhoto(wine.id, row.photo);
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
  if (thumb) rememberLabelPhoto(w.id, thumb);
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
        ${labelThumbHtml(w)}
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
  mountLabelThumbs($("#scan-results"));
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
  const el = document.getElementById("clock");
  if (!el) return;
  const d = new Date();
  el.textContent = d.toTimeString().slice(0, 5);
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
  const mapSrc = art.map ? file(art.map) : "";
  const mapImg = mapSrc
    ? `<img class="map-art" data-map="${mapSrc}" src="${mapSrc}" alt="" onerror="this.style.display='none'">`
    : `<p class="muted" data-map="" style="text-align:center;margin:8px 0">Sin mapa de esta zona</p>`;
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
function refreshGeminiKeyState() {
  const stateEl = document.getElementById("gemini-key-state");
  if (!stateEl) return;
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const stored = storedGeminiKey();
  if (typed && typed !== stored) {
    stateEl.textContent = "Clave escrita, pulsa Guardar precios para guardarla";
    return;
  }
  if (stored) {
    stateEl.textContent = "Clave guardada en esta app.";
    return;
  }
  stateEl.textContent = "No hay clave en esta app. Pégala aquí: Safari y el icono de inicio no comparten la clave.";
}
async function probeGeminiKey() {
  const el = document.getElementById("gemini-probe");
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const key = typed || storedGeminiKey();
  if (!key) {
    if (el) el.textContent = "No hay clave. Pégala arriba o guárdala antes.";
    refreshGeminiKeyState();
    return;
  }
  if (el) el.textContent = "Probando la clave…";
  try {
    const msg = await geminiProbe(key);
    if (el) el.textContent = msg;
    if (typed && /^Funciona\b/.test(String(msg || ""))) {
      const box = $("#p-gemini");
      if (box) box.checked = true;
      const result = persistPriceCfg();
      toast(result.ok ? "Clave de Gemini guardada en esta app" : "No se pudo guardar la clave");
    }
  } catch (e) {
    if (el) el.textContent = "red o CORS";
  }
  refreshGeminiKeyState();
}
function persistPriceCfg() {
  const prev = readPriceCfg();
  const url = ($("#p-url") && $("#p-url").value.trim()) || "";
  const key = ($("#p-key") && $("#p-key").value.trim()) || "";
  const live = $("#p-live") && $("#p-live").checked;
  const geminiOn = $("#p-gemini") && $("#p-gemini").checked;
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const geminiKey = typed || String(prev.geminiKey || "").trim();
  const next = {
    mode: live && key ? "live" : "demo",
    apiUrl: url || prev.apiUrl || "https://www.wine-searcher.com/ws_api.php",
    apiKey: key || prev.apiKey || "",
    geminiOn: !!(geminiOn && geminiKey),
    geminiKey: geminiKey,
    currency: prev.currency || "EUR"
  };
  try {
    if (window.WineDataProvider && typeof WineDataProvider.saveCfg === "function") WineDataProvider.saveCfg(next);
    else localStorage.setItem(PRICE_CFG_KEY, JSON.stringify(Object.assign({}, prev, next)));
  } catch (e) {
    return { ok: false, saved: "", live: false };
  }
  const saved = String((readPriceCfg().geminiKey) || "").trim();
  if (geminiKey && saved !== geminiKey) return { ok: false, saved: saved, live: !!(live && key) };
  return { ok: true, saved: saved, live: !!(live && key) };
}
function savePriceCfg() {
  const result = persistPriceCfg();
  if (!result.ok) {
    toast("No se pudo guardar la clave");
    return;
  }
  hideSheets();
  toast(result.saved ? "Clave de Gemini guardada en esta app" : (result.live ? "Precios: Wine-Searcher" : "Precios: dossier"));
  refreshGeminiKeyState();
}
function hydratePriceFields() {
  const cfg = readPriceCfg();
  if ($("#p-live")) $("#p-live").checked = cfg.mode === "live" && !!cfg.apiKey;
  if ($("#p-url")) $("#p-url").value = cfg.apiUrl || "";
  if ($("#p-key")) $("#p-key").value = cfg.apiKey || "";
  if ($("#p-gemini")) $("#p-gemini").checked = !!cfg.geminiOn && !!cfg.geminiKey;
  const keyEl = $("#p-gemini-key");
  if (keyEl && document.activeElement !== keyEl) keyEl.value = cfg.geminiKey || "";
  refreshGeminiKeyState();
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
      <p class="tiny app-version" style="margin-top:8px">Versión ${APP_VERSION}</p>
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
      <div class="card"><h3>Mi Vinoteca</h3><p class="muted" style="margin-top:6px">Versión ${APP_VERSION}</p>
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
    notify: state.notify
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
window.APP_VERSION = APP_VERSION;
window.savePriceCfg = savePriceCfg;
window.probeGeminiKey = probeGeminiKey;
window.changeWineLabel = changeWineLabel;
window.refreshGeminiKeyState = refreshGeminiKeyState;
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
  const hideSplash = () => {
    const el = document.getElementById("splash");
    if (el) el.classList.add("hide");
  };
  try {
    clock();
    setInterval(() => { try { clock(); } catch (e) {} }, 30000);
    try { refreshDirtyInternetWines(); } catch (e) { console.warn("limpieza", e); }
    try { renderHome(); } catch (e) { console.warn("inicio", e); }
    loadLabelPhotos().then(() => {
      try {
        if (screenId === "cellar") renderCellar();
        else if (screenId === "calendar") renderCalendar();
        else if (screenId === "pairings") renderPairings();
        else if (screenId === "wine" && currentWine) openWine(currentWine.id, currentBottle);
        else if (screenId === "home") renderHome();
      } catch (e) {}
    });
  } catch (e) {
    console.warn("arranque", e);
  } finally {
    setTimeout(hideSplash, 700);
  }
  setTimeout(() => { try { runNotifyCheck(false); } catch (e) {} }, 1600);
});

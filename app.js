function dossierOf(w) {
  const packed = (window.WINE_DOSSIERS && w && window.WINE_DOSSIERS[w.id]) || {};
  return Object.assign({
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
  }, packed);
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
function renderCellar() {
  const q = ($("#cellar-q")?.value || "").toLowerCase();
  let list = state.bottles.filter(b => {
    const w = wineById(b.wineId);
    if (!w) return false;
    const hay = `${w.producer} ${w.name} ${w.vintage} ${w.region} ${w.type} ${cellarName(b.cellarId)} ${b.bin || ""}`.toLowerCase();
    const typeOk = filterType === "todos" || w.type === filterType;
    return typeOk && hay.includes(q);
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
      return `<div class="card" role="button" onclick="openWine('${w.id}')"><div class="row"><h3>${p}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[p].length} lote${by[p].length>1?"s":""}</p></div>`;
    }).join("");
  } else if (cellarView === "lotes") {
    body = list.map(b => {
      const w = wineById(b.wineId);
      return `<div class="card" role="button" onclick="openBottle('${b.uid}')"><div class="row"><h3>${w.producer}</h3><span class="tiny">×${b.qty}</span></div><p class="muted">${w.name} ${w.vintage}</p><p class="tiny">${cellarName(b.cellarId)} · ${state.prefs.hideBin ? "hueco oculto" : (b.bin || "sin hueco")}</p></div>`;
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
  $("#cellar-list").innerHTML = tabHtml + (body || `<p class="empty">Sin coincidencias. Escanea o añade a mano.</p>`);
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
    return `<div class="cal-card" role="button" onclick="openBottle('${b.uid}')">
      <div class="cal-top">
        <div class="inv-sil" style="--c:${w.color}"></div>
        <div>
          <h3>${shortWineName(w)}</h3>
          <p class="muted">${w.name} ${w.vintage}</p>
          <p class="tiny">Beber hasta ${w.aging.peakEnd}</p>
        </div>
      </div>
      <div class="win-row">
        <span class="tiny">Ventana de consumo</span>
        <span class="tiny">${Math.round(pr.pct)}%</span>
      </div>
      <div class="win-bar"><i style="width:${pr.pct}%"></i></div>
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
  return `<div class="rack">${rackSlots(cellarId).map(code => {
    const b = byBin[code];
    if (!b) return `<div class="rack-slot empty"><b>${code}</b><small>—</small><span class="rack-dot off"></span></div>`;
    const w = wineById(b.wineId);
    return `<button class="rack-slot" onclick="openBottle('${b.uid}')">
      <b>${code}</b>
      <small>${w.producer.split(" ").slice(-2).join(" ")} ${shortWineName(w)} ${w.vintage}</small>
      <span class="rack-dot"></span>
    </button>`;
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
  const zone = (w.region + " " + (w.appellation || "") + " " + (w.country || "")).toLowerCase();
  const hitZone = ZONES.find(z => (z.keys || "").split(/\s+/).some(k => k.length > 2 && zone.includes(k)) || zone.includes(z.name.toLowerCase()));
  if (hitZone) {
    return { land: hitZone.map, cap: "capsula.jpg", map: hitZone.map };
  }
  return { land: "mapa-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" };
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
function bottleSVG(w) {
  const kind = bottleKind(w);
  const lines = capsuleLines(w);
  const label = lines.map((line, i) => `<text x="60" y="${38 + i * 11}" text-anchor="middle" fill="#2a1c08" font-size="8" font-family="Georgia, serif" font-weight="700">${line.toUpperCase()}</text>`).join("");
  const glass = { red: "#3a1018", white: "#e6d7a2", slim: "#f0e2ae", rose: "#e7b7c0", spark: "#d8c48a" }[kind];
  const body = kind === "spark"
    ? `<path d="M46 78h28v18c8 6 14 18 14 40v42c0 10-8 16-28 16s-28-6-28-16v-42c0-22 6-34 14-40V78z" fill="${glass}"/>`
    : kind === "slim"
      ? `<path d="M50 78h20v28c6 10 10 22 10 48v28c0 8-6 14-20 14s-20-6-20-14v-28c0-26 4-38 10-48V78z" fill="${glass}"/>`
      : `<path d="M44 78h32v16c10 8 16 20 16 42v40c0 12-10 18-32 18s-32-6-32-18v-40c0-22 6-34 16-42V78z" fill="${glass}"/>`;
  const muselet = kind === "spark"
    ? `<path d="M52 70c4 8 12 8 16 0M60 74v10M50 84h20" fill="none" stroke="#d7d7d7" stroke-width="1.4"/>`
    : "";
  return `<svg class="bottle-svg bottle-${kind}" viewBox="0 0 120 200" aria-label="${lines.join(" ") || "Botella"}">
    <rect x="48" y="8" width="24" height="70" rx="6" fill="url(#foil)"/>
    ${label}
    ${muselet}
    ${body}
    <defs><linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7b4"/><stop offset=".5" stop-color="#c9a24a"/><stop offset="1" stop-color="#8a6a28"/></linearGradient></defs>
  </svg>`;
}
function bottleAsset(w) {
  const kind = bottleKind(w);
  if (kind === "spark") return "botellas/espumoso.jpg";
  if (kind === "white" || kind === "slim" || kind === "rose") return "botellas/blanco.jpg";
  return "botellas/tinto.jpg";
}
function bottleSilhouette(kind) {
  const glass = kind === "white" || kind === "slim" || kind === "rose" ? "#d7c48a" : kind === "spark" ? "#e6d7a2" : "#6b1c28";
  const neck = kind === "slim" || kind === "white" || kind === "spark" ? 18 : 22;
  return `<svg class="bottle-svg" viewBox="0 0 80 200" aria-label="Silueta ${kind}">
    <path d="M${40-neck/2} 8 h${neck} v28 c8 8 16 18 16 36 v96 c0 14-10 24-${16+neck/2} 24 h-${neck} c-${6+neck/2} 0-${16+neck/2}-10-${16+neck/2}-24 V72 c0-18 8-28 16-36 V8z" fill="${glass}" stroke="#e2c56a" stroke-width="1.4"/>
    <rect x="${40-neck/2+1}" y="8" width="${neck-2}" height="16" rx="2" fill="#c9a227"/>
    <rect x="24" y="92" width="32" height="46" rx="3" fill="#f4efe4" opacity="0.9"/>
  </svg>`;
}
function estateSVG(w) {
  const art = estateArt(w);
  const kind = bottleKind(w);
  return `
    <img class="estate-photo" src="${art.land}" alt="Viñedo" onerror="this.style.display='none'">
    <div class="foil-wrap">${bottleSilhouette(kind)}</div>`;
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

function openWine(wineId, bottle) {
  const w = wineById(wineId);
  if (!w) {
    toast("No hay ficha para este vino");
    show("cellar", { tab: true });
    return;
  }
  if (!w.conservation) w.conservation = { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" };
  if (!w.aging) {
    const y = Number(w.vintage) || YEAR;
    w.aging = { drinkFrom: y + 1, peakStart: y + 3, peakEnd: y + 10, drinkTo: y + 14 };
  }
  if (!w.ratings) {
    w.ratings = { vivino: { score: 0, count: 0, scale: 5 }, penin: { score: 0, scale: 100 }, parker: { score: 0, scale: 100, note: "" }, spectator: { score: 0, scale: 100 }, decanter: { score: 0, scale: 100 } };
  }
  currentWine = w;
  currentBottle = bottle || state.bottles.find(b => b.wineId === wineId) || null;
  const p = phaseOf(w);
  const r = w.ratings;
  const pack = WINE_PAIRINGS[w.id];
  const top = pack?.matches?.[0];
  const dish = top ? PAIRING_DISHES.find(d => d.id === top.dishId) : null;
  const backTo = lastList === "wine" ? (bottle ? "cellar" : "scan") : lastList;
  const pill = (p.label || "").toUpperCase();

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
    <div class="wine-tabs">
      <button type="button" onclick="openWineSub('profile')">General</button>
      <button type="button" onclick="openWineSub('taste')">Cata</button>
      <button type="button" onclick="openWineSub('mapa')">Bodega</button>
      <button type="button" onclick="openWineSub('anadas')">Añadas</button>
    </div>
    ${zoneStrip(w)}

    <div class="sec-head" role="button" onclick="openWineSub('ratings')"><h2>Calificaciones</h2><span class="sec-ico">▦</span></div>
    <div class="rate-grid" role="button" onclick="openWineSub('ratings')">
      <div class="rate-card">
        <div class="who">
          <div class="badge-round vivino-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="1.6"><path d="M12 4c2 4 6 6 6 11a6 6 0 1 1-12 0c0-5 4-7 6-11z"/></svg>
          </div>
          <div><b>Vivino</b><div class="stars">${starsRow(r.vivino.score)}</div></div>
        </div>
        <div class="rate-score">${r.vivino.score.toFixed(1)}</div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Peñín</b></div>
        <div class="rate-end"><div class="rate-score">${r.penin.score}</div>
          <svg class="rate-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3 20 7v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V7z"/></svg>
        </div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Parker</b></div>
        <div class="rate-end"><div class="rate-score">${r.parker.score}</div><span class="parker-p">P</span></div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Spectator</b></div>
        <div class="rate-end"><div class="rate-score">${r.spectator.score}</div>
          <svg class="rate-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M6 18l2.5-2.5"/></svg>
        </div>
      </div>
    </div>
    <div class="card" role="button" onclick="openWineSub('ratings')" style="margin:8px 0 12px">
      <p class="tiny">Crítica publicada</p>
      <p style="margin-top:8px;line-height:1.45">${(r.parker && r.parker.note) || w.tasting}</p>
      <p class="muted" style="margin-top:8px">${r.parker && r.parker.reviewer ? r.parker.reviewer + " · " : ""}WA ${r.parker.score} · Peñín ${r.penin.score} · WS ${r.spectator.score}${r.decanter && r.decanter.score ? " · Decanter " + r.decanter.score : ""} · Vivino ${r.vivino.score.toFixed(1)}</p>
    </div>

    <div class="sec-head" role="button" onclick="openWineSub('pairings')"><h2>Maridajes</h2><span class="sec-ico">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 13h14v3H5z"/><path d="M7 13c0-5 2.5-8 5-8s5 3 5 8"/><path d="M4 19h16"/></svg>
    </span></div>
    ${dish ? `<div class="pair-feature" role="button" onclick="openWineSub('pairings')">
      ${dishArt()}
      <div>
        <h3>${dish.name}</h3>
        <div class="pair-score">${top.score}/100</div>
        <p class="muted" style="margin-top:4px">${top.why}</p>
      </div>
    </div>` : ""}

    <div class="serve-bar" role="button" onclick="openWineSub('keep')">
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v3M8 5l1.2 2.2M16 5l-1.2 2.2"/><path d="M7 14a5 5 0 0 0 10 0c0-3-2.4-5.5-5-7-2.6 1.5-5 4-5 7z"/></svg>
        <div><div class="lbl">Guarda</div><div class="val">${w.conservation.cellarMin}–${w.conservation.cellarMax} °C</div></div>
      </div>
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3h8l-1 9a5 5 0 1 1-6 0L8 3z"/><path d="M9 21h6"/></svg>
        <div><div class="lbl">Servicio</div><div class="val">${w.conservation.serveMin}–${w.conservation.serveMax} °C</div></div>
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
    const casa = (w.tasting || "").trim();
    const noteOf = (obj, extra) => {
      const n = ((obj && obj.note) || extra || "").trim();
      if (n && n !== casa) return n;
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
        <div class="temp"><span class="tiny">Vivino</span><b>${r.vivino.score.toFixed(1)}</b></div>
        <div class="temp"><span class="tiny">Peñín</span><b>${r.penin.score}</b></div>
        <div class="temp"><span class="tiny">Parker / WA</span><b>${r.parker.score}</b></div>
        <div class="temp"><span class="tiny">Spectator</span><b>${r.spectator.score}</b></div>
      </div>
      ${card("Guía Peñín", r.penin.score + "/100", noteOf(r.penin))}
      ${card(r.parker.reviewer || "Luis Gutiérrez / Wine Advocate", r.parker.score + "/100", noteOf(r.parker))}
      ${card("Wine Spectator", r.spectator.score + "/100", noteOf(r.spectator, r.spectator.note))}
      ${card("Decanter", (r.decanter && r.decanter.score ? r.decanter.score + "/100" : "—"), noteOf(r.decanter))}
      ${card("Vivino · usuarios", r.vivino.score.toFixed(1) + "/5 · " + (r.vivino.count || "—") + " valoraciones", noteOf(r.vivino))}
      ${card("Nota de cata (casa)", "ficha", casa)}
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">Referencias</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('taste')">Cata personal ›</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('historia')">Historia y añada ›</button>`;
  } else if (kind === "pairings") {
    body = pairingBlock(w);
  } else if (kind === "keep") {
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">Vinoteca</span><b>${w.conservation.cellarMin}–${w.conservation.cellarMax} °C</b></div>
        <div class="temp"><span class="tiny">Servicio</span><b>${w.conservation.serveMin}–${w.conservation.serveMax} °C</b></div>
        <div class="temp"><span class="tiny">Humedad</span><b>${w.conservation.humidity}</b></div>
        <div class="temp"><span class="tiny">Posición</span><b style="font-size:16px">${w.conservation.position}</b></div>
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
        <div class="temp"><span class="tiny">Servir</span><b>${w.conservation.serveMin}–${w.conservation.serveMax} °C</b></div>
        <div class="temp"><span class="tiny">Decantar</span><b style="font-size:16px">${d.decant}</b></div>
      </div>
      <div class="card"><p class="tiny">Copa</p><p>${d.glass}</p></div>
      <div class="card"><p class="tiny">Oxígeno</p><p class="muted" style="margin-top:6px">${d.oxygen}</p></div>
      <div class="card"><p class="tiny">Guarda en cava</p><p class="muted" style="margin-top:6px">${w.conservation.cellarMin}–${w.conservation.cellarMax} °C · ${w.conservation.humidity} · ${w.conservation.position}</p></div>`;
  } else if (kind === "tecnica") {
    const d = dossierOf(w);
    body = `
      <div class="fact"><span>Uvas</span><b>${w.grapes.join(", ")}</b></div>
      <div class="fact"><span>Alcohol</span><b>${w.abv}% vol.</b></div>
      <div class="fact"><span>Estilo</span><b>${w.style} · ${w.type}</b></div>
      <div class="fact"><span>Altitud</span><b>${d.elevation}</b></div>
      <div class="card" style="margin-top:12px"><p class="tiny">Suelos</p><p class="muted" style="margin-top:6px">${d.soils}</p></div>
      <div class="card"><p class="tiny">Viñedo</p><p class="muted" style="margin-top:6px">${d.vineyard}</p></div>
      <div class="card"><p class="tiny">Vinificación</p><p class="muted" style="margin-top:6px">${d.vinification}</p></div>
      <div class="card"><p class="tiny">Crianza</p><p class="muted" style="margin-top:6px">${d.elevage}</p></div>`;
  } else if (kind === "historia") {
    const d = dossierOf(w);
    const paras = String(d.history || (w.producer + " se elabora en " + w.region + ".")).split("\n").filter(Boolean);
    body = `
      ${mapTabs("historia")}
      ${paras.map(t => `<div class="card"><p style="line-height:1.5">${t}</p></div>`).join("")}
      <div class="card"><p class="tiny">Elaboración</p><p style="margin-top:8px">${d.vinification}</p><p class="muted" style="margin-top:8px">${d.elevage}</p></div>
      <div class="card"><p class="tiny">Crítica de añada ${w.vintage}</p>
        <p style="margin-top:8px;line-height:1.45">${(r.parker && r.parker.note) || w.tasting}</p>
        <p class="muted" style="margin-top:8px">${r.parker && r.parker.reviewer ? r.parker.reviewer + " · " : ""}WA ${r.parker.score} · Peñín ${r.penin.score} · WS ${r.spectator.score}${r.decanter && r.decanter.score ? " · Decanter " + r.decanter.score : ""}</p>
        ${(r.penin && r.penin.note) ? `<p class="muted" style="margin-top:10px">${r.penin.note}</p>` : ""}
      </div>
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">Referencias</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('evolve')">Evolución y fechas ›</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('mapa')">Volver al mapa</button>`;
  } else if (kind === "mercado") {
    body = `<div id="mercado-box">${mercadoSkeleton(w)}</div>`;
    setTimeout(() => fillMercado(w), 0);
  } else if (kind === "evolve") {
    body = `
      <p class="muted" style="margin:6px 0">Añada ${w.vintage}. Beber desde ${w.aging.drinkFrom}. Apogeo ${w.aging.peakStart}–${w.aging.peakEnd}. Límite prudente ${w.aging.holdTo}.</p>
      <div class="peak-pill">${(p.label || "").toUpperCase()}</div>
      <div class="bar"><i style="width:${pr.pct}%"></i></div>
      <div class="row tiny"><span>${w.vintage}</span><span>hoy ${YEAR}</span><span>${w.aging.holdTo}</span></div>
      <div class="timeline">
        ${w.evolutionNotes.map(n => `<div class="tl-item"><em>${n.year} · ${n.phase}</em><strong>${n.text}</strong></div>`).join("")}
        <div class="tl-item"><em>${YEAR} · Estado actual</em><strong>${currentAdvice(w, p)}</strong></div>
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
        <p>Uvas: ${w.grapes.join(", ")}</p>
        <p class="muted">${w.abv}% vol. · ${w.type} · ${w.style} · ${w.priceHint}</p>
      </div>
      <div class="card">
        <p class="tiny">Suelos</p>
        <p class="muted" style="margin-top:6px">${dossierOf(w).soils}</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('tecnica')">Ficha técnica completa ›</button>`;
  } else if (kind === "origen") {
    const b = currentBottle;
    body = `
      <div class="fact"><span>Posición</span><b>${b ? (b.bin || "sin hueco") : "—"}</b></div>
      <div class="fact"><span>Vinoteca</span><b>${b ? cellarName(b.cellarId) : "No está en cava"}</b></div>
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
    body = mapTabs("vinos") + `
      <h2>${w.producer}</h2>
      ${house.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.name} ${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
        <p class="muted">${s.appellation}</p>
      </div>`).join("") || `<p class="muted">Solo esta referencia de la casa.</p>`}
      ${zone.length ? `<h2 style="margin-top:16px">Misma zona</h2>` + zone.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.producer} ${s.name}</h3><span class="badge">${s.vintage}</span></div>
      </div>`).join("") : ""}`;
  } else if (kind === "anadas") {
    const sibs = WINE_CATALOG.filter(x => x.producer === w.producer && x.name === w.name);
    body = sibs.length ? sibs.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
      <div class="row"><h3>${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
      <p class="muted">${s.priceHint} · ${phaseOf(s).label}</p>
    </div>`).join("") : `<p class="muted">No hay otras añadas en el catálogo.</p>`;
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
  const bodegaImg = kind === "mapa" && art.land
    ? `<img class="estate-wide" src="${art.land}" alt="${w.producer}" style="margin:6px 0 12px;height:200px;object-fit:contain;background:#000">`
    : "";
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
  const pack = WINE_PAIRINGS[w.id] || {
    logic: (w.pairing || []).join(" · ") || "Maridaje de la ficha.",
    serve: w.conservation ? (`${w.conservation.serveMin}–${w.conservation.serveMax} °C`) : "Servir a temperatura de tipo.",
    avoid: [],
    matches: (w.pairing || []).map((name, i) => ({ dishId: null, score: 90 - i * 3, why: name }))
  };
  if (!pack) return "";
  const inCellar = state.bottles.some(b => b.wineId === w.id);
  return `
    <h2 style="margin-top:16px">Maridajes de este vino</h2>
    <p class="muted" style="margin:6px 0 10px">${pack.logic}</p>
    <div class="card"><p class="tiny">Servicio en mesa</p><p>${pack.serve}</p>
      <p class="muted" style="margin-top:8px">Evitar: ${pack.avoid.join(" · ")}</p></div>
    ${pack.matches.map(m => {
      const d = m.dishId && PAIRING_DISHES.find(x => x.id === m.dishId);
      if (!d) return `<div class="card"><div class="row"><h3>${m.why}</h3><span class="badge">${m.score}/100</span></div></div>`;
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

async function startScan() {
  show("scan");
  lastList = "scan";
  stopCam();
  const preview = $("#scan-preview");
  if (preview) { preview.hidden = true; preview.removeAttribute("src"); }
  const finder = $("#scan-finder");
  if (finder) finder.style.display = "";
  const video = $("#cam");
  if (video) { video.hidden = true; video.srcObject = null; }
  setScanStatus("Abre la cámara o elige una foto. La etiqueta va en vertical.");
  if ($("#scan-results")) $("#scan-results").innerHTML = "";
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
  const input = $("#scan-file-cam") || $("#scan-file");
  if (!input) return;
  input.setAttribute("accept", "image/*");
  input.setAttribute("capture", "environment");
  openPhotoInput(input);
}

function pickFromRoll() {
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
  pickLabelPhoto();
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

async function ocrOnce(Tesseract, img) {
  const result = await Tesseract.recognize(img, "eng", {
    tessedit_pageseg_mode: "6",
    logger: m => {
      if (m.status === "recognizing text" && m.progress) {
        setScanStatus("Leyendo la etiqueta… " + Math.round(m.progress * 100) + "%");
      }
    }
  });
  return (result && result.data && result.data.text) || "";
}

async function readLabelText(dataUrl) {
  const Tesseract = await loadTesseract();
  const prep = await preprocessLabel(dataUrl);
  let best = "";
  let bestScore = -1;
  for (const img of [dataUrl, prep]) {
    try {
      const text = await Promise.race([
        ocrOnce(Tesseract, img),
        new Promise((_, rej) => setTimeout(() => rej(new Error("ocr-timeout")), 20000))
      ]);
      const fixed = repairOcr(text);
      const score = (fixed.text.match(/pesquera|margaux|vega|tondonia|pingus|ribera|reserva|rioja|priorat/g) || []).length * 10 + (fixed.years.length ? 8 : 0) + Math.min(text.length, 80) / 20;
      if (score > bestScore) { bestScore = score; best = fixed.text || text; }
      if (score >= 18) break;
    } catch (e) {}
  }
  return best;
}

function showScanConfirm(text, hits) {
  const fixed = repairOcr(text);
  const reading = labelReading(fixed);
  const list = (hits || []).slice(0, 4);
  setScanStatus(reading ? ("Lectura: " + reading) : "No se leyó la bodega. Escribe el nombre abajo.");
  const el = $("#scan-results");
  if (!el) return;
  el.innerHTML = `
    <div class="card">
      <p class="tiny">Lectura de la etiqueta</p>
      <p style="margin-top:6px">${reading || "No se ha reconocido la bodega. Escribe el nombre y la añada."}</p>
    </div>
    ${list.length ? `<h2 style="margin-top:14px">¿Cuál es?</h2>` + list.map(w => `
      <div class="card">
        <h3>${w.producer}</h3>
        <p class="muted">${w.name} ${w.vintage} · ${w.appellation || w.region}</p>
        <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="confirmScanWine('${w.id}')">Este es</button>
      </div>`).join("") : `<p class="empty">Ningún vino del catálogo coincide. Escribe el nombre abajo.</p>`}
    <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="confirmScanCustom()">Crear ficha con lo escrito</button>`;
}

function confirmScanWine(id) {
  const w = wineById(id);
  if (!w) return;
  const q = (($("#scan-q") && $("#scan-q").value) || lastOcrText || "").trim();
  parkScanInInbox(ensureScannedWine(w, q), q);
}

function confirmScanCustom() {
  const q = (($("#scan-q") && $("#scan-q").value) || "").trim();
  const raw = q || ($("#scan-results") && $("#scan-results").innerText) || "";
  const w = inferWineFromText(q || raw);
  if (!w) return toast("Escribe bodega y añada");
  parkScanInInbox(w, q);
}

async function identifyFromPhoto(dataUrl) {
  if (ocrBusy) return;
  ocrBusy = true;
  setScanStatus("Leyendo la etiqueta…");
  if ($("#scan-results")) $("#scan-results").innerHTML = `<div class="card muted">Analizando la foto. Un momento.</div>`;
  let text = "";
  try {
    text = await readLabelText(dataUrl);
  } catch {
    text = "";
  }
  ocrBusy = false;
  lastOcrText = repairOcr(text).text || text;
  const hits = rankFromText(lastOcrText);
  showScanConfirm(lastOcrText, hits);
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

function parkScanInInbox(wine, text) {
  if (!wine) return;
  state.inbox = state.inbox || [];
  const row = {
    uid: "in" + Date.now(),
    wineId: wine.id,
    created: new Date().toISOString(),
    text: String(text || "").replace(/\s+/g, " ").slice(0, 180),
    photo: (lastLabelData && lastLabelData.length < 140000) ? lastLabelData : "",
    entered: false,
    cellarId: "",
    bin: ""
  };
  state.inbox.unshift(row);
  save();
  setScanStatus("Leído. Está en Entradas, pendiente de stock.");
  toast(wine.producer + " " + wine.vintage + " · dar entrada");
  show("inbox");
}
function renderInbox() {
  const box = $("#inbox-list");
  if (!box) return;
  const rows = state.inbox || [];
  if (!rows.length) {
    box.innerHTML = `<div class="card muted">Aún no hay lecturas. Escanea una etiqueta.</div>
      <button class="btn btn-gold" style="width:100%;margin-top:12px" onclick="startScan()">Abrir cámara</button>`;
    return;
  }
  box.innerHTML = rows.map(row => {
    const w = wineById(row.wineId);
    const title = w ? `${w.producer}` : "Vino leído";
    const sub = w ? `${w.name} ${w.vintage}` : "";
    const zone = w ? `${w.appellation || w.region || "—"}` : "—";
    const badge = row.entered ? `<span class="badge ok">En stock</span>` : `<span class="badge warn">Pendiente</span>`;
    const where = row.entered ? `<p class="tiny">${cellarName(row.cellarId)} · ${row.bin || "sin hueco"}</p>` : `<p class="tiny">${zone}</p>`;
    return `<article class="inbox-card">
      ${row.photo ? `<img src="${row.photo}" alt="">` : `<div class="inbox-ph"></div>`}
      <div class="inbox-copy">
        <div class="row"><h3>${title}</h3>${badge}</div>
        <p>${sub}</p>
        ${where}
        <div class="inbox-actions">
          ${row.entered
            ? `<button class="btn btn-ghost" onclick="openWine('${row.wineId}')">Ver ficha</button>`
            : `<button class="btn btn-gold" onclick="enterInbox('${row.uid}')">Dar entrada</button>
               <button class="btn btn-ghost" onclick="openWine('${row.wineId}')">Ficha</button>`}
        </div>
      </div>
    </article>`;
  }).join("") + `<button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="startScan()">Escanear otra</button>`;
}
function enterInbox(uid) {
  const row = (state.inbox || []).find(x => x.uid === uid);
  if (!row) return;
  const w = wineById(row.wineId);
  if (!w) return toast("Ficha no encontrada");
  currentWine = w;
  lastLabelData = row.photo || lastLabelData;
  fillSelects();
  if ($("#add-inbox-uid")) $("#add-inbox-uid").value = uid;
  if ($("#add-cellar")) $("#add-cellar").value = preferredCellar(w, 0) || "v1";
  if ($("#add-bin")) $("#add-bin").value = nextBin($("#add-cellar").value);
  if ($("#add-qty")) $("#add-qty").value = "1";
  if ($("#add-keep-hint")) $("#add-keep-hint").textContent = (w.appellation || w.region || "") + " · elige vinoteca y hueco";
  showSheet("add-sheet");
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
  if (catalog) return catalog;
  const words = hay.split(" ").filter(x => x.length > 2).slice(0, 4);
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
    aging: { drinkFrom: year + 1, peakStart: year + 3, peakEnd: year + 10, drinkTo: year + 14 }
  };
  state.customWines = state.customWines || [];
  state.customWines.push(w);
  return w;
}

function identifyFromCatalog(q) {
  const s = normTxt(q);
  if (!s) return WINE_CATALOG.slice(0, 8);
  return WINE_CATALOG.filter(w => normTxt(`${w.producer} ${w.name} ${w.vintage} ${w.region} ${w.grapes.join(" ")}`).includes(s));
}

function runIdentify() {
  const q = $("#scan-q").value;
  const hits = identifyFromCatalog(q);
  if (q && hits.length === 1) {
    parkScanInInbox(ensureScannedWine(hits[0], q), q);
    return;
  }
  renderHits(hits, q ? `Coincidencias para “${q}”` : "Catálogo", true);
}

function nextBin(cellarId) {
  const used = state.bottles.filter(b => b.cellarId === cellarId).map(b => b.bin);
  for (let i = 1; i <= 40; i++) {
    const bin = "A-" + String(i).padStart(2, "0");
    if (!used.includes(bin)) return bin;
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
        <button class="btn btn-gold" onclick="event.stopPropagation();quickAdd('${w.id}')">Añadir a vinoteca</button>
        <button class="btn btn-ghost" onclick="event.stopPropagation();openWine('${w.id}')">Ver ficha</button>
      </div>` : ""}
    </div>`;
  }).join("") || `<p class="empty">Sin ficha. Escribe bodega y añada arriba.</p>`);
}

function fillSelects() {
  const opts = state.vinotecas.map(v => `<option value="${v.id}">${v.name}</option>`).join("");
  $("#add-cellar").innerHTML = opts;
  $("#move-cellar").innerHTML = opts;
}

function showSheet(id) {
  fillSelects();
  if (id === "add-sheet") {
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
  "Marqués de Murrieta": { lat: 42.430, lng: -2.445, zone: "Ygay · Rioja", web: "https://www.marquesdemurrieta.com" }
};

function bodegaGeo(w) {
  return BODEGA_GEO[w.producer] || { lat: 40.4, lng: -3.7, zone: w.region, web: "" };
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
function mapaBlock(w) {
  const art = estateArt(w);
  const g = bodegaGeo(w);
  const file = (p) => "./" + String(p || "").replace(/^\.\//, "");
  const mapSrc = file(art.map || "mapa-ribera.jpg");
  const landSrc = file(art.land || "vinedo-ribera.jpg");
  const osm = `https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=16/${g.lat}/${g.lng}`;
  const pin = `${g.lat},${g.lng}`;
  const gmaps = `https://www.google.com/maps?q=${pin}`;
  const apple = `https://maps.apple.com/?ll=${pin}&q=${pin}`;
  return `
    <img class="map-art" src="${mapSrc}" alt="" data-fb="${landSrc}"
      onerror="if(this.dataset.step!=='1'){this.dataset.step='1';this.src=this.dataset.fb;}else{this.style.display='none';}">
    <p class="tiny" style="margin:0 0 10px;text-align:center">${g.zone || w.region}</p>
    <p class="eyebrow" style="font-size:10px;letter-spacing:.14em;margin:2px 0 0">${w.appellation || ""}</p>
    <h3 style="font-size:17px;margin:2px 0 2px;line-height:1.2">${w.producer}</h3>
    <p class="muted" style="margin:0 0 12px;font-size:13px">${g.address || (g.zone + " · " + w.region)}</p>
    <a class="btn btn-ghost" style="width:100%;margin-top:10px;display:block;text-align:center" href="${gmaps}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Google Maps</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${apple}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Mapas de Apple</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${osm}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">OpenStreetMap</a>
    ${bodegaWeb(g.web) ? `<a class="btn btn-gold" style="width:100%;margin-top:8px;display:block;text-align:center" href="${bodegaWeb(g.web)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Web de la bodega</a>` : ""}`;
}

function mercadoSkeleton(w) {
  const d = dossierOf(w);
  const mine = currentBottle && currentBottle.price ? currentBottle.price + " €" : "—";
  return `
    <p class="muted" style="margin:6px 0 10px">Vivino no tiene API oficial. Ahora: dossier demo. Si activas live (Wine-Searcher), se sustituye esta horquilla.</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">Baja</span><b>${d.market.low ? d.market.low + " €" : "—"}</b></div>
      <div class="temp"><span class="tiny">Media</span><b>${d.market.mid ? d.market.mid + " €" : "—"}</b></div>
      <div class="temp"><span class="tiny">Alta</span><b>${d.market.high ? d.market.high + " €" : "—"}</b></div>
      <div class="temp"><span class="tiny">Tu coste</span><b>${mine}</b></div>
    </div>
    <p class="tiny" id="mercado-src">Cargando fuente…</p>`;
}

async function fillMercado(w) {
  const box = document.getElementById("mercado-box");
  if (!box || !window.WineDataProvider) return;
  const quote = await WineDataProvider.priceOf(w);
  const d = dossierOf(w);
  const mine = currentBottle && currentBottle.price ? currentBottle.price + " €" : "—";
  const euro = (n) => n ? n + " €" : "—";
  box.innerHTML = `
    <p class="muted" style="margin:6px 0 10px">${quote.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">Baja</span><b>${euro(quote.low)}</b></div>
      <div class="temp"><span class="tiny">Media</span><b>${euro(quote.mid)}</b></div>
      <div class="temp"><span class="tiny">Alta</span><b>${euro(quote.high)}</b></div>
      <div class="temp"><span class="tiny">Tu coste</span><b>${mine}</b></div>
    </div>
    <div class="card"><p class="tiny">${quote.source === "live" ? "Live" : "Dossier"} · ${quote.currency}</p>
      <p class="muted" style="margin-top:6px">${quote.trend || ""}</p></div>
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
function savePriceCfg() {
  if (!window.WineDataProvider) return;
  const url = ($("#p-url") && $("#p-url").value.trim()) || "";
  const key = ($("#p-key") && $("#p-key").value.trim()) || "";
  const live = $("#p-live") && $("#p-live").checked;
  WineDataProvider.saveCfg({
    mode: live && key ? "live" : "demo",
    apiUrl: url || "https://www.wine-searcher.com/ws_api.php",
    apiKey: key
  });
  hideSheets();
  toast(live && key ? "Precios: modo live" : "Precios: dossier demo");
}
function hydratePriceFields() {
  if (!window.WineDataProvider) return;
  const cfg = WineDataProvider.loadCfg();
  if ($("#p-live")) $("#p-live").checked = cfg.mode === "live" && !!cfg.apiKey;
  if ($("#p-url")) $("#p-url").value = cfg.apiUrl || "";
  if ($("#p-key")) $("#p-key").value = cfg.apiKey || "";
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
window.savePriceCfg = savePriceCfg;
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

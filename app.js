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
      photo: "cave-principal.jpg"
    },
    { id: "v2", name: "Cava de guarda", brand: "Eurocave", capacity: 32, used: 0, tHigh: 12.6, tLow: 12.6, humidity: 72, zones: ["Zona única · 12,5 °C"], photo: "cave-temp.jpg" }
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
  activity: []
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
    parsed.vinotecas.forEach(v => { if (!v.houseId) v.houseId = "h1"; });
    const main = parsed.vinotecas.find(v => v.id === "v1");
    if (main) {
      main.brand = "La Sommelière VIP 185";
      main.photo = "cave-principal.jpg";
      main.capacity = 185;
      main.role = "prestige";
      if (!main.zones || main.zones.join("").includes("Pando") || main.zones.join("").includes("Tintos")) {
        main.zones = ["Lectura actual · 16,7 °C", "SET 1 / SET 2"];
      }
      if (Math.abs(main.tHigh - 13.2) < 0.05) main.tHigh = 16.7;
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
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }

function wineById(id) { return WINE_CATALOG.find(w => w.id === id); }

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
  document.querySelector(".app")?.classList.toggle("fiche", id === "wine" || id === "wine-sub");
  if (id !== "scan") stopCam();
  if (id === "home") renderHome();
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
    cellar: "Botellas", calendar: "Fechas", pairings: "Mesa", scan: "Escanear",
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
    <div class="card" role="button" onclick="show('caves',{tab:true})" style="margin-top:10px"><div class="row"><h3>Vinotecas</h3><span class="tiny">›</span></div><p class="muted">VIP 185 y el resto de cavas</p></div>
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
  { name: "Rioja", country: "España", img: "vinedo-rioja.jpg", map: "mapa-rioja.jpg", keys: "rioja haro alavesa alta baja" },
  { name: "Ribera del Duero", country: "España", img: "vinedo-ribera.jpg", map: "mapa-ribera.jpg", keys: "ribera duero valbuena pingus vega" },
  { name: "Toro", country: "España", img: "mapa-toro.svg", map: "mapa-toro.svg", keys: "toro numanthia" },
  { name: "Cigales", country: "España", img: "mapa-cigales.svg", map: "mapa-cigales.svg", keys: "cigales" },
  { name: "Rueda", country: "España", img: "mapa-rueda.svg", map: "mapa-rueda.svg", keys: "rueda verdejo" },
  { name: "Bierzo", country: "España", img: "mapa-bierzo.svg", map: "mapa-bierzo.svg", keys: "bierzo mencía mencia" },
  { name: "Priorat", country: "España", img: "vinedo-priorat.jpg", map: "mapa-priorat.jpg", keys: "priorat priorato gratallops" },
  { name: "Montsant", country: "España", img: "mapa-montsant.svg", map: "mapa-montsant.svg", keys: "montsant" },
  { name: "Penedès", country: "España", img: "mapa-penedes.svg", map: "mapa-penedes.jpg", keys: "penedès penedes corpinnat cava gramona" },
  { name: "Corpinnat", country: "España", img: "mapa-corpinnat.svg", map: "mapa-corpinnat.svg", keys: "corpinnat" },
  { name: "Cava", country: "España", img: "mapa-cava.svg", map: "mapa-cava.svg", keys: "cava" },
  { name: "Empordà", country: "España", img: "mapa-emporda.svg", map: "mapa-emporda.svg", keys: "empordà emporda" },
  { name: "Terra Alta", country: "España", img: "mapa-terra-alta.svg", map: "mapa-terra-alta.svg", keys: "terra alta" },
  { name: "Costers del Segre", country: "España", img: "mapa-costers-segre.svg", map: "mapa-costers-segre.svg", keys: "costers segre" },
  { name: "Rías Baixas", country: "España", img: "vinedo-rias.jpg", map: "mapa-rias.jpg", keys: "rías rias baixas albariño albarino salnés" },
  { name: "Ribeiro", country: "España", img: "mapa-ribeiro.svg", map: "mapa-ribeiro.svg", keys: "ribeiro" },
  { name: "Ribeira Sacra", country: "España", img: "mapa-ribeira-sacra.svg", map: "mapa-ribeira-sacra.svg", keys: "ribeira sacra" },
  { name: "Valdeorras", country: "España", img: "mapa-valdeorras.svg", map: "mapa-valdeorras.svg", keys: "valdeorras godello" },
  { name: "Monterrei", country: "España", img: "mapa-monterrei.svg", map: "mapa-monterrei.svg", keys: "monterrei" },
  { name: "Getariako Txakolina", country: "España", img: "mapa-txakoli.svg", map: "mapa-txakoli.svg", keys: "txakoli txakolina getaria bizkaiko arabako" },
  { name: "Navarra", country: "España", img: "mapa-navarra.svg", map: "mapa-navarra.svg", keys: "navarra" },
  { name: "Somontano", country: "España", img: "mapa-somontano.svg", map: "mapa-somontano.svg", keys: "somontano" },
  { name: "Cariñena", country: "España", img: "mapa-carinena.svg", map: "mapa-carinena.svg", keys: "cariñena carinena" },
  { name: "Calatayud", country: "España", img: "mapa-calatayud.svg", map: "mapa-calatayud.svg", keys: "calatayud" },
  { name: "Campo de Borja", country: "España", img: "mapa-campo-borja.svg", map: "mapa-campo-borja.svg", keys: "campo borja" },
  { name: "Utiel-Requena", country: "España", img: "mapa-utiel-requena.svg", map: "mapa-utiel-requena.svg", keys: "utiel requena bobal" },
  { name: "Valencia", country: "España", img: "mapa-valencia.svg", map: "mapa-valencia.svg", keys: "valencia" },
  { name: "Alicante", country: "España", img: "mapa-alicante.svg", map: "mapa-alicante.svg", keys: "alicante fondillón fondillon mendoza" },
  { name: "Jumilla", country: "España", img: "mapa-jumilla.svg", map: "mapa-jumilla.svg", keys: "jumilla monastrell" },
  { name: "Yecla", country: "España", img: "mapa-yecla.svg", map: "mapa-yecla.svg", keys: "yecla" },
  { name: "Bullas", country: "España", img: "mapa-bullas.svg", map: "mapa-bullas.svg", keys: "bullas" },
  { name: "La Mancha", country: "España", img: "mapa-la-mancha.svg", map: "mapa-la-mancha.svg", keys: "mancha" },
  { name: "Valdepeñas", country: "España", img: "mapa-valdepenas.svg", map: "mapa-valdepenas.svg", keys: "valdepeñas valdepenas" },
  { name: "Vinos de Madrid", country: "España", img: "mapa-madrid.svg", map: "mapa-madrid.svg", keys: "madrid" },
  { name: "Jerez-Xérès-Sherry", country: "España", img: "mapa-jerez.svg", map: "mapa-jerez.svg", keys: "jerez xeres sherry manzanilla sanlucar" },
  { name: "Montilla-Moriles", country: "España", img: "mapa-montilla.svg", map: "mapa-montilla.svg", keys: "montilla moriles pedro ximenez" },
  { name: "Málaga y Sierras", country: "España", img: "mapa-malaga.svg", map: "mapa-malaga.svg", keys: "málaga malaga sierras" },
  { name: "Binissalem / Pla i Llevant", country: "España", img: "mapa-mallorca.svg", map: "mapa-mallorca.svg", keys: "binissalem mallorca llevant" },
  { name: "Lanzarote / Canarias", country: "España", img: "mapa-canarias.svg", map: "mapa-canarias.svg", keys: "lanzarote canarias tacoronte valle güímar" },
  { name: "Douro", country: "Portugal", img: "mapa-douro.svg", map: "mapa-douro.svg", keys: "douro duero maos mãos irmaos porto vintage lbv" },
  { name: "Porto", country: "Portugal", img: "mapa-porto.svg", map: "mapa-porto.svg", keys: "porto port wine tawny vintage" },
  { name: "Vinho Verde", country: "Portugal", img: "mapa-vinho-verde.svg", map: "mapa-vinho-verde.svg", keys: "vinho verde loureiro alvarinho" },
  { name: "Dão", country: "Portugal", img: "mapa-dao.svg", map: "mapa-dao.svg", keys: "dão dao" },
  { name: "Bairrada", country: "Portugal", img: "mapa-bairrada.svg", map: "mapa-bairrada.svg", keys: "bairrada baga" },
  { name: "Alentejo", country: "Portugal", img: "mapa-alentejo.svg", map: "mapa-alentejo.svg", keys: "alentejo alentejano" },
  { name: "Lisboa", country: "Portugal", img: "mapa-lisboa.svg", map: "mapa-lisboa.svg", keys: "lisboa estremadura" },
  { name: "Península de Setúbal", country: "Portugal", img: "mapa-setubal.svg", map: "mapa-setubal.svg", keys: "setúbal setubal moscatel palmela" },
  { name: "Tejo", country: "Portugal", img: "mapa-tejo.svg", map: "mapa-tejo.svg", keys: "tejo ribatejo" },
  { name: "Beira Interior", country: "Portugal", img: "mapa-beira-interior.svg", map: "mapa-beira-interior.svg", keys: "beira interior" },
  { name: "Trás-os-Montes", country: "Portugal", img: "mapa-tras-os-montes.svg", map: "mapa-tras-os-montes.svg", keys: "tras os montes trás-os-montes" },
  { name: "Távora-Varosa", country: "Portugal", img: "mapa-tavora-varosa.svg", map: "mapa-tavora-varosa.svg", keys: "távora tavora varosa" },
  { name: "Algarve", country: "Portugal", img: "mapa-algarve.svg", map: "mapa-algarve.svg", keys: "algarve lagoa lagos tavira portimão" },
  { name: "Madeira", country: "Portugal", img: "mapa-madeira.svg", map: "mapa-madeira.svg", keys: "madeira malvasia sercial" },
  { name: "Açores", country: "Portugal", img: "mapa-acores.svg", map: "mapa-acores.svg", keys: "açores azores pico terceira" },
  { name: "Bordeaux", country: "Francia", img: "mapa-bordeaux.svg", map: "mapa-bordeaux.svg", keys: "bordeaux burdeos graves pessac saint-emilion Pomerol" },
  { name: "Médoc", country: "Francia", img: "vinedo-margaux.jpg", map: "mapa-medoc.jpg", keys: "médoc medoc margaux pauillac saint-julien saint-estèphe" },
  { name: "Bourgogne", country: "Francia", img: "mapa-bourgogne.svg", map: "mapa-bourgogne.svg", keys: "bourgogne burgundy borgoña côte d or vosne gevrey puligny" },
  { name: "Chablis", country: "Francia", img: "mapa-chablis.svg", map: "mapa-chablis.svg", keys: "chablis" },
  { name: "Champagne", country: "Francia", img: "vinedo-champagne.jpg", map: "mapa-champagne.jpg", keys: "champagne pérignon perignon reims epernay" },
  { name: "Vallée du Rhône", country: "Francia", img: "mapa-rhone.svg", map: "mapa-rhone.svg", keys: "rhône rhone hermitage côte-rôtie châteauneuf gigondas" },
  { name: "Loire", country: "Francia", img: "mapa-loire.svg", map: "mapa-loire.svg", keys: "loire sancerre vouvray muscadet chinon saumur" },
  { name: "Alsace", country: "Francia", img: "mapa-alsace.svg", map: "mapa-alsace.svg", keys: "alsace alsacia riesling gewurztraminer" },
  { name: "Languedoc-Roussillon", country: "Francia", img: "mapa-languedoc.svg", map: "mapa-languedoc.svg", keys: "languedoc roussillon corbières fitou minervois" },
  { name: "Provence", country: "Francia", img: "mapa-provence.svg", map: "mapa-provence.svg", keys: "provence bandol cassis cotes de provence" },
  { name: "Beaujolais", country: "Francia", img: "mapa-beaujolais.svg", map: "mapa-beaujolais.svg", keys: "beaujolais morgon fleurie moulin" },
  { name: "Sud-Ouest", country: "Francia", img: "mapa-sud-ouest.svg", map: "mapa-sud-ouest.svg", keys: "sud-ouest cahors madiran bergerac gaillac" },
  { name: "Bolgheri", country: "Italia", img: "vinedo-bolgheri.jpg", map: "mapa-bolgheri.jpg", keys: "bolgheri sassicaia toscana" },
  { name: "South Australia", country: "Australia", img: "mapa-south-australia.svg", map: "mapa-south-australia.svg", keys: "australia barossa grange penfolds" }
];

const ZONE_ATLAS = {
  "Rioja": { keep: "mapa-rioja.jpg", photo: "vinedo-rioja.jpg", labels: [["HARO",28,38],["LOGEÑO",62,48],["EBRO",48,62]], pin: [30,36,"HARO"] },
  "Ribera del Duero": { keep: "mapa-ribera.jpg", photo: "vinedo-ribera.jpg", labels: [["VALBUENA",42,40],["PEÑAFIEL",68,52],["DUERO",50,62]], pin: [44,38,"VALBUENA"] },
  "Toro": { labels: [["TORO",48,42],["MORALES",32,58],["DUERO",62,50],["ZAMORA",22,30]], pin: [50,40,"TORO"] },
  "Cigales": { labels: [["CIGALES",50,44],["VALLADOLID",55,68],["PISUERGA",38,58]], pin: [48,42,"CIGALES"] },
  "Rueda": { labels: [["RUEDA",46,46],["LA SECA",62,38],["DUERO",40,62]], pin: [48,44,"RUEDA"] },
  "Bierzo": { labels: [["PONFERRADA",48,48],["CACABELOS",30,36],["VILLAFRANCA",32,58],["SIL",62,42]], pin: [36,56,"VILLAFRANCA"] },
  "Priorat": { keep: "mapa-priorat.jpg", photo: "vinedo-priorat.jpg", labels: [["GRATALLOPS",48,42],["ESCALADEI",58,32],["EBRE",22,70]], pin: [50,40,"GRATALLOPS"] },
  "Montsant": { labels: [["FALSET",48,46],["CAPÇANES",36,60],["MONTSANT",58,32]], pin: [50,44,"FALSET"] },
  "Penedès": { keep: "mapa-penedes.jpg", labels: [["VILAFRANCA",42,48],["SITGES",58,68],["SANT SADURNÍ",50,34]], pin: [44,46,"VILAFRANCA"] },
  "Corpinnat": { labels: [["SANT SADURNÍ",50,42],["TORRELAVIT",34,34],["SUBIRATS",62,56]], pin: [52,40,"SANT SADURNÍ"] },
  "Cava": { labels: [["PENEDÈS",48,40],["REQUENA",72,48],["RIOJA",40,22]], pin: [50,38,"PENEDÈS"] },
  "Empordà": { labels: [["FIGUERES",40,42],["ROSES",62,38],["CADAQUÉS",70,50]], pin: [42,40,"FIGUERES"] },
  "Terra Alta": { labels: [["GANDESA",48,46],["BATEA",32,38],["EBRE",55,70]], pin: [50,44,"GANDESA"] },
  "Costers del Segre": { labels: [["LLEIDA",42,52],["RAIMAT",30,40],["SEGRE",58,46]], pin: [32,38,"RAIMAT"] },
  "Rías Baixas": { keep: "mapa-rias.jpg", photo: "vinedo-rias.jpg", labels: [["CAMBADOS",38,50],["MEIS",48,38],["SALNÉS",42,28]], pin: [40,36,"MEIS"] },
  "Ribeiro": { labels: [["RIBADAVIA",48,46],["MIÑO",40,60],["AVIA",58,38]], pin: [50,44,"RIBADAVIA"] },
  "Ribeira Sacra": { labels: [["SIL",58,42],["MIÑO",38,58],["MONFORTE",50,36]], pin: [52,34,"MONFORTE"] },
  "Valdeorras": { labels: [["O BARCO",50,44],["SIL",42,58],["LAROUCO",62,36]], pin: [52,42,"O BARCO"] },
  "Monterrei": { labels: [["VERÍN",48,48],["MONTERREI",40,36],["TÁMEGA",58,60]], pin: [42,34,"MONTERREI"] },
  "Getariako Txakolina": { labels: [["GETARIA",48,42],["ZARAUTZ",62,50],["DONOSTIA",72,38]], pin: [50,40,"GETARIA"] },
  "Navarra": { labels: [["OLITE",48,44],["ESTELLA",32,36],["TUDELA",58,62]], pin: [50,42,"OLITE"] },
  "Somontano": { labels: [["BARBASTRO",50,46],["PIRINEO",55,24],["CINCA",38,58]], pin: [52,44,"BARBASTRO"] },
  "Cariñena": { labels: [["CARIÑENA",48,46],["ZARAGOZA",58,28]], pin: [50,44,"CARIÑENA"] },
  "Calatayud": { labels: [["CALATAYUD",48,46],["JALÓN",40,60],["ATECA",32,38]], pin: [50,44,"CALATAYUD"] },
  "Campo de Borja": { labels: [["BORJA",48,44],["MAGALLÓN",36,56],["EBRO",62,38]], pin: [50,42,"BORJA"] },
  "Utiel-Requena": { labels: [["REQUENA",52,48],["UTIEL",38,38]], pin: [54,46,"REQUENA"] },
  "Valencia": { labels: [["VALÈNCIA",58,50],["TURIA",48,42],["MAR",78,58]], pin: [60,48,"VALÈNCIA"] },
  "Alicante": { labels: [["ALACANT",58,52],["MARINA",62,36],["MONÒVER",40,44]], pin: [42,42,"MONÒVER"] },
  "Jumilla": { labels: [["JUMILLA",48,46],["ALTIPLANO",40,32],["YECLA",62,38]], pin: [50,44,"JUMILLA"] },
  "Yecla": { labels: [["YECLA",50,46],["ALTIPLANO",42,60]], pin: [52,44,"YECLA"] },
  "Bullas": { labels: [["BULLAS",48,46],["CEHEGÍN",36,38]], pin: [50,44,"BULLAS"] },
  "La Mancha": { labels: [["TOMELLOSO",48,46],["ALCÁZAR",36,34],["VALDEPEÑAS",52,64]], pin: [50,44,"TOMELLOSO"] },
  "Valdepeñas": { labels: [["VALDEPEÑAS",50,48],["CALATRAVA",40,34]], pin: [52,46,"VALDEPEÑAS"] },
  "Vinos de Madrid": { labels: [["SAN MARTÍN",32,52],["ARGANDA",68,50],["SIERRA",50,28]], pin: [50,30,"MADRID"] },
  "Jerez-Xérès-Sherry": { labels: [["JEREZ",48,44],["SANLÚCAR",38,58],["EL PUERTO",58,60]], pin: [50,42,"JEREZ"] },
  "Montilla-Moriles": { labels: [["MONTILLA",46,44],["MORILES",58,56],["CÓRDOBA",50,28]], pin: [48,42,"MONTILLA"] },
  "Málaga y Sierras": { labels: [["MÁLAGA",52,58],["AXARQUÍA",62,42],["RONDA",34,40]], pin: [54,56,"MÁLAGA"] },
  "Binissalem / Pla i Llevant": { labels: [["BINISSALEM",42,42],["FELANITX",62,52],["PALMA",38,62]], pin: [44,40,"BINISSALEM"] },
  "Lanzarote / Canarias": { labels: [["LANZAROTE",32,40],["LA GERIA",38,52],["TENERIFE",62,48]], pin: [40,50,"LA GERIA"] },
  "Douro": { labels: [["RÉGUA",48,46],["PINHÃO",62,40],["DOURO",50,60]], pin: [50,44,"RÉGUA"] },
  "Porto": { labels: [["PORTO",42,48],["VILA NOVA DE GAIA",52,58],["DOURO",62,42]], pin: [44,46,"PORTO"] },
  "Vinho Verde": { labels: [["MONÇÃO",42,28],["PONTE DE LIMA",40,46],["MINHO",38,36]], pin: [44,26,"MONÇÃO"] },
  "Dão": { labels: [["VISEU",50,44],["NELAS",42,56],["ESTRELA",62,34]], pin: [52,42,"VISEU"] },
  "Bairrada": { labels: [["ANADIA",48,46],["MEALHADA",50,34],["BAIRRADA",40,58]], pin: [50,44,"ANADIA"] },
  "Alentejo": { labels: [["ÉVORA",48,46],["REGUENGOS",58,54],["BEJA",46,66]], pin: [50,44,"ÉVORA"] },
  "Lisboa": { labels: [["LISBOA",42,58],["ÓBIDOS",40,32],["ATLÂNTICO",22,48]], pin: [44,56,"LISBOA"] },
  "Península de Setúbal": { labels: [["SETÚBAL",52,50],["PALMELA",48,38],["ARRÁBIDA",58,44]], pin: [54,48,"SETÚBAL"] },
  "Tejo": { labels: [["SANTAREM",50,46],["TEJO",48,58],["CARTAXO",42,38]], pin: [52,44,"SANTAREM"] },
  "Beira Interior": { labels: [["GUARDA",52,36],["CASTELO RODRIGO",42,48]], pin: [54,34,"GUARDA"] },
  "Trás-os-Montes": { labels: [["BRAGANÇA",58,32],["MIRANDELA",46,50],["CHAVES",34,36]], pin: [48,48,"MIRANDELA"] },
  "Távora-Varosa": { labels: [["TÁVORA",46,46],["VAROSA",58,40],["LAMEGO",50,58]], pin: [52,56,"LAMEGO"] },
  "Algarve": { labels: [["LAGOS",32,50],["FARO",62,52],["TAVIRA",72,46]], pin: [64,50,"FARO"] },
  "Madeira": { labels: [["FUNCHAL",52,58],["PICO",50,36],["ATLÂNTICO",68,70]], pin: [54,56,"FUNCHAL"] },
  "Açores": { labels: [["PICO",48,48],["TERCEIRA",68,40],["S. MIGUEL",78,52]], pin: [50,46,"PICO"] },
  "Bordeaux": { labels: [["BORDEAUX",48,50],["MÉDOC",38,32],["SAINT-ÉMILION",62,46],["GIRONDE",42,40]], pin: [50,48,"BORDEAUX"] },
  "Médoc": { keep: "mapa-medoc.jpg", photo: "vinedo-margaux.jpg", labels: [["MARGAUX",48,58],["PAUILLAC",46,38],["SAINT-JULIEN",50,46]], pin: [50,56,"MARGAUX"] },
  "Bourgogne": { labels: [["BEAUNE",48,50],["NUITS",50,38],["MÂCON",46,68],["CÔTE D'OR",62,44]], pin: [50,48,"BEAUNE"] },
  "Chablis": { labels: [["CHABLIS",50,46],["SEREIN",48,58],["GRAND CRU",58,36]], pin: [52,44,"CHABLIS"] },
  "Champagne": { keep: "mapa-champagne.jpg", photo: "vinedo-champagne.jpg", labels: [["REIMS",52,32],["ÉPERNAY",48,50],["MARNE",42,42]], pin: [50,48,"ÉPERNAY"] },
  "Vallée du Rhône": { labels: [["HERMITAGE",48,36],["CHÂTEAUNEUF",50,62],["CÔTE-RÔTIE",46,24]], pin: [52,60,"CHÂTEAUNEUF"] },
  "Loire": { labels: [["SANCERRE",68,46],["VOUVRAY",42,50],["MUSCADET",22,52],["LOIRE",48,40]], pin: [70,44,"SANCERRE"] },
  "Alsace": { labels: [["COLMAR",48,50],["RIBEAUVILLÉ",50,36],["VOSGES",32,46]], pin: [50,48,"COLMAR"] },
  "Languedoc-Roussillon": { labels: [["MONTPELLIER",58,48],["CORBIÈRES",40,56],["BANYULS",32,70]], pin: [42,54,"CORBIÈRES"] },
  "Provence": { labels: [["BANDOL",48,58],["AIX",50,36],["CASSIS",58,62]], pin: [50,56,"BANDOL"] },
  "Beaujolais": { labels: [["BEAUJEU",46,40],["MORGON",52,50],["FLEURIE",48,32]], pin: [50,48,"MORGON"] },
  "Sud-Ouest": { labels: [["CAHORS",52,46],["MADIRAN",34,52],["BERGERAC",40,34]], pin: [54,44,"CAHORS"] },
  "Bolgheri": { keep: "mapa-bolgheri.jpg", photo: "vinedo-bolgheri.jpg", labels: [["BOLGHERI",48,46],["CASTAGNETO",52,58],["TIRRENO",28,50]], pin: [50,44,"BOLGHERI"] },
  "South Australia": { labels: [["BAROSSA",48,40],["MCLAREN VALE",46,58],["ADELAIDE",40,50]], pin: [50,38,"BAROSSA"] }
};
function zoneSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function zoneRand(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function chateauMark(x, y) {
  return `<g transform="translate(${x} ${y})" fill="#d4b45a" stroke="none">
    <rect x="-5" y="-7" width="10" height="8" rx="0.4"/>
    <path d="M-6 -7 L0 -13 L6 -7Z"/>
    <rect x="-1.4" y="-2" width="2.8" height="3" fill="#0a0907"/>
  </g>`;
}
function zoneLandPath(kind, rnd) {
  if (kind === "coast") return "M 210 170 C 280 210 250 320 300 390 C 360 490 420 520 520 500 C 680 470 760 390 820 300 C 870 230 900 160 860 120 L 980 120 L 980 640 C 760 680 520 700 280 640 C 220 560 180 420 210 170Z";
  if (kind === "island") return "M 430 240 C 520 200 690 220 760 310 C 820 400 800 520 700 580 C 560 650 400 620 350 520 C 310 430 350 280 430 240Z";
  if (kind === "river") return "M 240 160 C 360 180 420 260 500 250 C 620 235 700 180 820 210 C 900 240 930 330 880 410 C 820 510 700 560 560 580 C 400 600 280 540 240 430 C 210 340 190 230 240 160Z";
  return "M 260 180 C 400 150 560 170 700 160 C 820 155 900 230 910 330 C 920 450 840 560 700 600 C 520 650 340 620 260 520 C 200 430 190 260 260 180Z";
}
function zoneKind(name) {
  if (/Rías|Txakoli|Alicante|Valencia|Empordà|Algarve|Lisboa|Setúbal|Provence|Champagne|Bolgheri|Porto|Vinho Verde|Málaga|Jerez|Bordeaux|Médoc|Languedoc/.test(name)) return "coast";
  if (/Madeira|Açores|Mallorca|Canarias|Binissalem/.test(name)) return "island";
  if (/Douro|Porto|Ribera|Toro|Rueda|Ribeiro|Ribeira|Valdeorras|Loire|Rhône|Tejo|Bierzo/.test(name)) return "river";
  return "plateau";
}
function zoneMapSvg(z) {
  const a = ZONE_ATLAS[z.name] || { labels: [[z.name.toUpperCase(), 50, 45]], pin: [50, 45, z.name.toUpperCase()] };
  const rnd = zoneRand(zoneSeed(z.name));
  const W = 1168, H = 820;
  const gold = "#c9a227", pale = "#e8d7a6", ink = "#0a0907";
  const kind = zoneKind(z.name);
  let topo = "";
  for (let i = 0; i < 16; i++) {
    const y = 150 + i * 34 + rnd() * 8;
    let d = `M 160 ${y.toFixed(1)}`;
    for (let x = 200; x < 1020; x += 70) d += ` Q ${x} ${(y + Math.sin(i + x / 80) * 10).toFixed(1)} ${x + 35} ${y.toFixed(1)}`;
    topo += `<path d="${d}" fill="none" stroke="${gold}" stroke-width="0.7" opacity="${(0.12 + rnd() * 0.18).toFixed(2)}"/>`;
  }
  const places = (a.labels || []).map(([tx, xf, yf], i) => {
    const x = 280 + xf * 6.2, y = 180 + yf * 4.4;
    return `${chateauMark(x, y - 16)}<text x="${(x + 14).toFixed(1)}" y="${y.toFixed(1)}" fill="${pale}" font-size="15" font-family="Palatino Linotype, Palatino, Georgia, serif">${tx}</text>`;
  }).join("");
  const [pfx, pfy, cap] = a.pin || [50, 45, z.name];
  const pinx = 300 + pfx * 6.2, piny = 170 + pfy * 4.4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${ink}"/>
    <rect x="36" y="28" width="${W-72}" height="${H-56}" rx="8" fill="none" stroke="${gold}" stroke-width="1.6"/>
    <rect x="48" y="40" width="${W-96}" height="${H-80}" rx="4" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.45"/>
    ${topo}
    <path d="${zoneLandPath(kind, rnd)}" fill="none" stroke="${gold}" stroke-width="1.7" opacity="0.9"/>
    <rect x="64" y="56" width="210" height="168" rx="4" fill="${ink}" stroke="${gold}" stroke-width="1.2"/>
    <text x="169" y="92" text-anchor="middle" fill="${pale}" font-size="20" font-family="Palatino Linotype, Palatino, Georgia, serif" letter-spacing="3">${(z.name.split(" / ")[0] || z.name).toUpperCase()}</text>
    <text x="169" y="118" text-anchor="middle" fill="${gold}" font-size="12" font-family="Palatino Linotype, Palatino, Georgia, serif" letter-spacing="3">${(z.country || "").toUpperCase()}</text>
    <g transform="translate(169 168)" fill="none" stroke="${gold}" stroke-width="1.2">
      <circle r="26"/>
      <path d="M0 -20 L5 0 L0 20 L-5 0Z" fill="${gold}" stroke="none"/>
      <text y="-32" text-anchor="middle" fill="${gold}" font-size="11" font-family="Palatino Linotype, Palatino, Georgia, serif">N</text>
    </g>
    ${places}
    <g transform="translate(${pinx.toFixed(1)} ${piny.toFixed(1)})">
      <path d="M0 -22 C8 -22 13 -14 13 -8 C13 2 0 18 0 18 C0 18 -13 2 -13 -8 C-13 -14 -8 -22 0 -22Z" fill="${gold}"/>
      <circle cy="-9" r="4" fill="${ink}"/>
    </g>
    <g transform="translate(930 560)">
      <circle r="78" fill="${ink}" stroke="${gold}" stroke-width="1.4"/>
      <circle r="70" fill="none" stroke="${gold}" stroke-width="0.4" opacity="0.4"/>
      <g transform="translate(0 8)" fill="${gold}">
        <rect x="-18" y="-8" width="36" height="28"/>
        <path d="M-22 -8 L0 -36 L22 -8Z"/>
        <rect x="-6" y="6" width="12" height="14" fill="${ink}"/>
      </g>
    </g>
    <text x="930" y="668" text-anchor="middle" fill="${gold}" font-size="11" font-family="Palatino Linotype, Palatino, Georgia, serif" letter-spacing="2">${cap}</text>
    <g transform="translate(80 730)" fill="${gold}">
      <ellipse cx="8" cy="6" rx="4" ry="6"/>
      <ellipse cx="16" cy="4" rx="4" ry="6"/>
      <ellipse cx="12" cy="12" rx="4" ry="5"/>
      <path d="M12 0 C12 -8 20 -10 22 -4" fill="none" stroke="${gold}" stroke-width="1"/>
    </g>
    <text x="112" y="748" fill="${gold}" font-size="11" font-family="Palatino Linotype, Palatino, Georgia, serif" letter-spacing="2">${(z.country || "").toUpperCase()}</text>
    <line x1="80" y1="760" x2="170" y2="760" stroke="${gold}" stroke-width="0.6"/>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
const ZONE_PLATE = {
  "Rioja": "mapa-rioja.jpg",
  "Ribera del Duero": "mapa-ribera.jpg",
  "Priorat": "mapa-priorat.jpg",
  "Rías Baixas": "mapa-rias.jpg",
  "Penedès": "mapa-penedes.jpg",
  "Champagne": "mapa-champagne.jpg",
  "Médoc": "mapa-medoc.jpg",
  "Bolgheri": "mapa-bolgheri.jpg",
  "Bierzo": "mapa-bierzo.jpg",
  "Douro": "mapa-douro.jpg",
  "Bourgogne": "mapa-bourgogne.jpg",
  "Jerez-Xérès-Sherry": "mapa-jerez.jpg",
  "Toro": "mapa-toro.jpg",
  "Rueda": "mapa-rueda.jpg",
  "Montsant": "mapa-montsant.jpg",
  "Empordà": "mapa-emporda.jpg",
  "Ribeira Sacra": "mapa-ribeira-sacra.jpg",
  "Getariako Txakolina": "mapa-txakoli.jpg",
  "Alentejo": "mapa-alentejo.jpg",
  "Vallée du Rhône": "mapa-rhone.jpg",
  "Cigales": "mapa-cigales.jpg",
  "Navarra": "mapa-navarra.jpg",
  "Jumilla": "mapa-jumilla.jpg",
  "La Mancha": "mapa-la-mancha.jpg",
  "Porto": "mapa-porto.jpg",
  "Vinho Verde": "mapa-vinho-verde.jpg",
  "Dão": "mapa-dao.jpg",
  "Loire": "mapa-loire.jpg",
  "Bordeaux": "mapa-bordeaux.jpg",
  "Chablis": "mapa-chablis.jpg",
  "Alsace": "mapa-alsace.jpg",
  "Provence": "mapa-provence.jpg",
  "Languedoc-Roussillon": "mapa-languedoc.jpg",
  "Madeira": "mapa-madeira.jpg",
  "Lanzarote / Canarias": "mapa-canarias.jpg",
  "Ribeiro": "mapa-ribeiro.jpg",
  "Beaujolais": "mapa-beaujolais.jpg",
  "Sud-Ouest": "mapa-sud-ouest.jpg",
  "Bairrada": "mapa-bairrada.jpg",
  "Alicante": "mapa-alicante.jpg",
  "Binissalem / Pla i Llevant": "mapa-mallorca.jpg",
  "Terra Alta": "mapa-terra-alta.jpg",
  "Somontano": "mapa-somontano.jpg",
  "South Australia": "mapa-south-australia.jpg",
  "Costers del Segre": "mapa-costers-segre.jpg",
  "Valdeorras": "mapa-valdeorras.jpg",
  "Monterrei": "mapa-monterrei.jpg",
  "Cariñena": "mapa-carinena.jpg",
  "Calatayud": "mapa-calatayud.jpg",
  "Campo de Borja": "mapa-campo-de-borja.jpg",
  "Utiel-Requena": "mapa-utiel-requena.jpg",
  "Valencia": "mapa-valencia.jpg",
  "Yecla": "mapa-yecla.jpg",
  "Bullas": "mapa-bullas.jpg",
  "Valdepeñas": "mapa-valdepenas.jpg",
  "Vinos de Madrid": "mapa-madrid.jpg",
  "Montilla-Moriles": "mapa-montilla.jpg",
  "Málaga y Sierras": "mapa-malaga.jpg",
  "Corpinnat": "mapa-corpinnat.jpg",
  "Cava": "mapa-cava.jpg",
  "Lisboa": "mapa-lisboa.jpg",
  "Península de Setúbal": "mapa-setubal.jpg",
  "Tejo": "mapa-tejo.jpg",
  "Beira Interior": "mapa-beira-interior.jpg",
  "Trás-os-Montes": "mapa-tras-os-montes.jpg",
  "Távora-Varosa": "mapa-tavora-varosa.jpg",
  "Algarve": "mapa-algarve.jpg",
  "Açores": "mapa-acores.jpg"
};
function zoneArt(z) {
  const plate = ZONE_PLATE[z.name];
  if (plate) return { img: plate, map: plate };
  const drawn = zoneMapSvg(z);
  return { img: drawn, map: drawn };
}

function winesInZone(z) {
  const keys = (z.keys || z.name).toLowerCase().split(/\s+/);
  return WINE_CATALOG.filter(w => {
    const blob = (w.region + " " + w.appellation + " " + w.country + " " + w.producer + " " + w.name).toLowerCase();
    return keys.some(k => k.length > 2 && blob.includes(k));
  });
}
function renderZonas(q) {
  const query = (q || "").trim().toLowerCase();
  const list = ZONES.filter(z => !query || (z.name + " " + z.country + " " + z.keys).toLowerCase().includes(query));
  const html = list.map(z => {
    const n = winesInZone(z).length;
    return `<button class="zone-tile" onclick="openZona('${z.name.replace(/'/g, "\\'")}')">
      <img src="${zoneArt(z).img}" alt="${z.name}">
      <span><b>${z.name}</b><small>${z.country} · ${n} vinos</small></span>
    </button>`;
  }).join("");
  $("#zonas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">Mi Vinoteca</p>
    <h1>Zonas vinícolas</h1>
    <div class="search" style="margin:12px 0"><input id="zona-q" type="search" placeholder="Buscar Rioja, Champagne, Toro…" value="${(q || "").replace(/"/g, "")}" oninput="renderZonas(this.value)"></div>
    <p class="muted">Toca una zona para ver el mapa y los vinos.</p>
    <div class="zone-grid">${html || "<p class='empty'>Ninguna zona con ese nombre.</p>"}</div>`;
  const box = $("#zona-q");
  if (box && query) { box.focus(); box.setSelectionRange(query.length, query.length); }
}
function openZona(name) {
  const z = ZONES.find(x => x.name === name);
  if (!z) return renderZonas();
  const wines = winesInZone(z);
  $("#zonas-body").innerHTML = `
    <button class="back" onclick="renderZonas()">‹ Zonas</button>
    <p class="eyebrow">${z.country}</p>
    <h1>${z.name}</h1>
    <img class="map-art" src="${zoneArt(z).map}" alt="Mapa ${z.name}">
    <p class="muted" style="margin:10px 0">${wines.length} vino${wines.length === 1 ? "" : "s"} en catálogo</p>
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
  const n = (w.name || "").replace("Reserva", "").replace("Gran Reserva", "").trim();
  const last = (w.producer || "").split(" ").slice(-1)[0];
  return n.length > 2 ? n : last;
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
  $("#caves-list").innerHTML = state.vinotecas.map(v => {
    const shot = "cave-principal.jpg";
    return `<div class="cave-card cave-card-photo" role="button" onclick="openCave('${v.id}')">
      <img class="cave-shot" src="${shot}" alt="${v.name}" onerror="this.style.display='none'">
      <div>
        <h3>${v.name}</h3>
        <p class="muted">${v.brand}${v.house ? " · " + v.house : ""}</p>
        <p class="tiny" style="margin-top:6px">${v.role === "prestige" ? "PRESTIGIOSAS" : "DE GUARDA"}</p>
        <p class="cave-meta"><span>${v.used}/${v.capacity}</span><span>${v.tHigh.toFixed(1)} °C</span></p>
      </div>
    </div>`;
  }).join("");
}

function syncUsed() {
  state.vinotecas.forEach(v => {
    v.used = state.bottles.filter(b => b.cellarId === v.id).reduce((n, b) => n + b.qty, 0);
  });
}

function openCave(id) {
  const v = state.vinotecas.find(x => x.id === id);
  $("#cave-house").textContent = v.house || v.brand || "Casa Llavaneras";
  $("#cave-title").textContent = v.name;
  $("#cave-detail").innerHTML = `
    <p class="muted">${v.brand}${v.role === "prestige" ? " · reserva de las botellas más caras" : ""}</p>
    <img class="cave-photo" src="cave-principal.jpg" alt="${v.name}" onerror="this.style.display='none'" />
    <h2>Mapa de huecos</h2>
    ${rackGrid(id)}
    <div class="temp-grid" style="margin:12px 0">
      <div class="temp"><span class="tiny">Temperatura</span><b>${v.tHigh.toFixed(1)} °C</b></div>
      <div class="temp"><span class="tiny">Humedad</span><b>${v.humidity}% HR</b></div>
    </div>
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="deleteCave('${v.id}')">Dar de baja esta vinoteca</button>`;
  show("cave-detail-screen");
}

let cellarView = "botellas";
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
    "Penfolds": { land: "vinedo-margaux.jpg", cap: "capsula.jpg", map: "mapa-medoc.jpg" },
    "Enrique Mendoza": { land: "vinedo.jpg", cap: "capsula.jpg", map: "" },
    "Numanthia": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" },
    "Mãos & Irmãos": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" }
  };
  const hit = byProducer[w.producer];
  if (hit) return hit;
  const zone = (w.region + " " + (w.appellation || "")).toLowerCase();
  if (/rías|rias baixas|albariño|albarino/.test(zone)) return { land: "vinedo-rias.jpg", cap: "capsula.jpg", map: "mapa-rias.jpg" };
  if (/rioja/.test(zone)) return { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" };
  if (/douro|porto|dao|dão|alentejo|vinho verde/.test(zone)) return { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" };
  if (/ribera|duero/.test(zone)) return { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" };
  if (/priorat|priorato/.test(zone)) return { land: "vinedo-priorat.jpg", cap: "capsula.jpg", map: "mapa-priorat.jpg" };
  if (/médoc|medoc|margaux|pauillac/.test(zone)) return { land: "vinedo-margaux.jpg", cap: "capsula.jpg", map: "mapa-medoc.jpg" };
  if (/corpinnat|penedès|penedes|cava/.test(zone)) return { land: "vinedo-champagne.jpg", cap: "capsula.jpg", map: "mapa-penedes.jpg" };
  if (/champagne/.test(zone)) return { land: "vinedo-champagne.jpg", cap: "capsula.jpg", map: "mapa-champagne.jpg" };
  if (/bolgheri|toscana/.test(zone)) return { land: "vinedo-bolgheri.jpg", cap: "capsula.jpg", map: "mapa-bolgheri.jpg" };
  if (/alicante|marina/.test(zone)) return { land: "vinedo.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" };
  if (/australia|barossa/.test(zone)) return { land: "vinedo-margaux.jpg", cap: "capsula.jpg", map: "mapa-medoc.jpg" };
  if (/toro/.test(zone)) return { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" };
  return { land: "vinedo-rioja.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" };
}

function estateSVG(w) {
  const art = estateArt(w);
  return `
    <img class="estate-photo" src="${art.land}" alt="Viñedo">
    <div class="foil-wrap">
      <img class="foil-photo" src="${art.cap}" alt="Cápsula">
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

function openWine(wineId, bottle) {
  const w = wineById(wineId);
  if (!w) return;
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
      <button class="icon-btn" onclick="openWineMenu()">···</button>
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
    ? `<img class="estate-wide" src="${art.land}" alt="${w.producer}" style="margin:6px 0 10px;height:210px;object-fit:contain">`
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
    const dishes = PAIRING_DISHES.filter(d => `${d.name} ${d.family} ${d.tags.join(" ")}`.toLowerCase().includes(q));
    $("#pair-body").innerHTML = dishes.map(d => {
      const wines = winesForDish(d.id);
      const best = wines[0];
      const label = best ? `${best.wine.producer} ${shortWineName(best.wine)}` : "";
      return `<div class="card">
        <div class="row" role="button" onclick="openDish('${d.id}')"><h3>${d.icon} ${d.name}</h3><span class="badge">${wines.length} vinos ›</span></div>
        <p class="muted">${d.family} · ${d.heat}</p>
        ${best ? `<p class="tiny" role="button" style="margin-top:8px;color:#c9a227" onclick="openWine('${best.wine.id}')">Mejor encaje: ${label} · ${best.score} ›</p>` : ""}
        <button class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="openDish('${d.id}')">Ver vinos del plato</button>
      </div>`;
    }).join("");
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
  return Object.entries(WINE_PAIRINGS).map(([id, pack]) => {
    const m = pack.matches.find(x => x.dishId === dishId);
    if (!m) return null;
    return { wine: wineById(id), score: m.score, why: m.why, pack };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}

function openDish(id) {
  pairingDish = id;
  const d = PAIRING_DISHES.find(x => x.id === id);
  const wines = winesForDish(id);
  const inCava = wines.filter(x => state.bottles.some(b => b.wineId === x.wine.id));
  $("#dish-title").textContent = d.icon + " " + d.name;
  $("#dish-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">${d.family}</p>
    <h1>${d.icon} ${d.name}</h1>
    <p class="muted">${d.heat} · ${d.tags.join(" · ")}</p>
    ${inCava.length ? `<div class="card" style="margin-top:12px"><h2>En tu vinoteca ahora</h2>
      ${inCava.map(x => `<p role="button" style="margin-top:8px" onclick="openWine('${x.wine.id}')"><strong>${x.wine.producer} ${x.wine.name} ${x.wine.vintage}</strong> · ${x.score}/100 ›<br><span class="muted">${x.why}</span></p>`).join("")}
    </div>` : `<p class="muted" style="margin-top:12px">Ninguna botella de este maridaje está en stock. Abajo, el catálogo.</p>`}
    <h2 style="margin-top:16px">Ranking por encaje</h2>
    ${wines.map(x => {
      const have = state.bottles.some(b => b.wineId === x.wine.id);
      return `<div class="card" role="button" onclick="openWine('${x.wine.id}')">
        <div class="row"><h3>${x.wine.producer} ${x.wine.name}</h3><span class="badge ${x.score>=94?"ok":"warn"}">${x.score}</span></div>
        <p class="muted">${x.wine.vintage} · ${x.wine.region} · ${x.wine.type}</p>
        <p style="margin-top:8px">${x.why}</p>
        <p class="tiny">${x.pack.serve}${have ? " · lo tienes" : ""}</p>
      </div>`;
    }).join("")}
    <h2>Regla de mesa</h2>
    ${PAIRING_RULES.map(r => `<div class="card"><strong>${r.title}</strong><p class="muted">${r.text}</p></div>`).join("")}`;
  show("dish");
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
  logAct(`Alta +${qty} ${currentWine.producer} ${currentWine.name} → ${cellarName(cellarId)} ${bin}`);
  save();
  hideSheets();
  toast(`${qty} en ${cellarName(cellarId)} · ${currentWine.conservation.cellarMin}–${currentWine.conservation.cellarMax} °C · HR ${corkHumidity(currentWine)}`);
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
  return foldOcr(s);
}
function foldOcr(s) {
  let t = (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  t = t.replace(/[|»«•·]/g, " ");
  t = t.replace(/\brn\b/g, "m");
  t = t.replace(/vv/g, "w");
  t = t.replace(/0(?=[a-z])/g, "o");
  t = t.replace(/(?<=[a-z])0/g, "o");
  t = t.replace(/\bmanos\b/g, "maos");
  t = t.replace(/\bmao\b/g, "maos");
  t = t.replace(/\bfa\s+e\s+nos\b/g, "maos");
  t = t.replace(/\be\s+nos\b/g, "maos");
  t = t.replace(/[^a-z0-9]+/g, " ").trim();
  t = t.replace(/\s+/g, " ");
  return t;
}
function tokensOf(s) {
  return foldOcr(s).split(" ").filter(x => x.length >= 2);
}
function fuzzyHit(hay, needle) {
  const n = foldOcr(needle);
  if (!n || n.length < 3) return false;
  if (hay.includes(n)) return true;
  if (n.length >= 4 && hay.replace(/ /g, "").includes(n.replace(/ /g, ""))) return true;
  const toks = hay.split(" ");
  return toks.some(tok => {
    if (tok === n) return true;
    if (n.length >= 4 && tok.length >= 4 && (tok.includes(n) || n.includes(tok))) return true;
    return false;
  });
}

async function startScan() {
  show("scan");
  lastList = "scan";
  const preview = $("#scan-preview");
  if (preview) { preview.hidden = true; preview.removeAttribute("src"); }
  const finder = $("#scan-finder");
  if (finder) finder.style.display = "";
  setScanStatus("Toca la foto. Se reconoce y entra solo en la vinoteca principal.");
  $("#scan-results").innerHTML = "";
  const video = $("#cam");
  video.hidden = false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } }, audio: false });
    video.srcObject = stream;
    await video.play();
  } catch {
    setScanStatus("Cámara no disponible. Usa Galería para subir la foto de la etiqueta.");
    video.hidden = true;
  }
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
  const input = $("#scan-file");
  input.setAttribute("capture", "environment");
  openPhotoInput(input);
}

function pickFromRoll() {
  const input = $("#scan-file");
  input.removeAttribute("capture");
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
  const canvas = $("#scan-canvas");
  const maxW = 900;
  const scale = Math.min(1, maxW / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
  lastLabelData = await compressDataUrl(dataUrl);
  showLabelPreview(lastLabelData);
  await identifyFromPhoto(lastLabelData);
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

async function identifyFromPhoto(dataUrl) {
  if (ocrBusy) return;
  ocrBusy = true;
  setScanStatus("Leyendo la etiqueta…");
  $("#scan-results").innerHTML = `<div class="card muted">Analizando la foto. Un momento.</div>`;
  let text = "";
  try {
    const Tesseract = await loadTesseract();
    const result = await Tesseract.recognize(dataUrl, "eng+spa", {
      logger: m => {
        if (m.status === "recognizing text" && m.progress) {
          setScanStatus("Leyendo la etiqueta… " + Math.round(m.progress * 100) + "%");
        }
      }
    });
    text = result?.data?.text || "";
  } catch {
    text = "";
  }
  ocrBusy = false;
  const n = normTxt(text);
  if (/sommelier|sommeliere|sommelière/.test(n) || /16[\.,]?7/.test(text)) {
    const main = state.vinotecas.find(v => v.id === "v1");
    if (main) {
      main.brand = "La Sommelière · 2 zonas";
      main.tHigh = 16.7;
      save();
    }
  }
  const hits = rankFromText(text);
  if (hits.length) {
    setScanStatus("Reconocido. Guardado en la vinoteca principal.");
    quickAdd(hits[0].id);
    return;
  }
  setScanStatus(text ? ("Leído: " + text.replace(/\s+/g, " ").slice(0, 120) + " — escribe el nombre") : "No se leyó. Foto más cerca o escribe el nombre.");
  renderHits([], "Sin coincidencia", false);
}

function rankFromText(raw) {
  const hay = foldOcr(raw);
  if (!hay) return [];
  const scored = WINE_CATALOG.map(w => {
    let score = 0;
    const bits = [w.producer, w.name, String(w.vintage), w.region, w.appellation, ...(w.grapes || []), ...(w.aliases || [])];
    bits.forEach(b => {
      const t = foldOcr(b);
      if (t.length >= 3 && fuzzyHit(hay, t)) score += Math.min(30, 8 + t.length);
    });
    const producerFirst = foldOcr((w.producer || "").split(" ")[0]);
    if (producerFirst.length >= 3 && fuzzyHit(hay, producerFirst)) score += 14;
    if (hay.includes(String(w.vintage))) score += 22;
    if (hay.includes("unico") && /unico/.test(foldOcr(w.name))) score += 30;
    if (hay.includes("vega") && hay.includes("sicilia") && /vega sicilia/.test(foldOcr(w.producer))) score += 36;
    if (hay.includes("tondonia") && /tondonia/.test(foldOcr(w.name))) score += 30;
    if (hay.includes("valbuena") && /valbuena/.test(foldOcr(w.name))) score += 26;
    if (hay.includes("pazo") && /pazo/.test(foldOcr(w.producer))) score += 24;
    if ((hay.includes("douro") || hay.includes("portugal")) && /maos/.test(foldOcr(w.producer + " " + w.name + " " + (w.aliases || []).join(" ")))) {
      if (hay.includes("maos") || hay.includes("nos") || hay.includes("tinto") || hay.includes("rouge")) score += 36;
    }
    return { w, score };
  }).filter(x => x.score >= 14).sort((a, b) => b.score - a.score);
  const uniq = [];
  const seen = new Set();
  scored.forEach(x => {
    if (!seen.has(x.w.id)) { seen.add(x.w.id); uniq.push(x.w); }
  });
  return uniq.slice(0, 6);
}

function identifyFromCatalog(q) {
  const s = foldOcr(q);
  if (!s) return WINE_CATALOG.slice(0, 8);
  const hits = rankFromText(q);
  if (hits.length) return hits;
  return WINE_CATALOG.filter(w => foldOcr(`${w.producer} ${w.name} ${w.vintage} ${w.region} ${(w.grapes || []).join(" ")} ${(w.aliases || []).join(" ")}`).includes(s));
}

function runIdentify() {
  const q = $("#scan-q").value;
  const hits = identifyFromCatalog(q);
  if (q && hits.length === 1) {
    quickAdd(hits[0].id);
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
  if (!w) return;
  currentWine = w;
  const cellarId = preferredCellar(w, 0);
  currentBottle = mergeOrCreateLot({
    wineId, cellarId, bin: nextBin(cellarId), qty: 1, price: 0,
    note: "Alta rápida", photo: lastLabelData || ""
  });
  logAct(`Alta rápida ${w.producer} ${w.name} → ${cellarName(cellarId)}`);
  save();
  toast("1 en " + cellarName(cellarId) + " · " + w.conservation.cellarMin + "–" + w.conservation.cellarMax + " °C · HR " + corkHumidity(w));
  openWine(wineId, currentBottle);
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
const BODEGA_GEO = {
  "Vega Sicilia": { lat: 41.6325, lng: -4.286, zone: "Valbuena de Duero", web: "https://www.vega-sicilia.com" },
  "Dominio de Pingus": { lat: 41.636, lng: -4.363, zone: "Quintanilla de Onésimo", web: "https://www.pingus.es" },
  "R. López de Heredia": { lat: 42.5764, lng: -2.8467, zone: "Haro · Rioja Alta", web: "https://www.lopezdeheredia.com" },
  "Marqués de Riscal": { lat: 42.515, lng: -2.618, zone: "Elciego · Rioja Alavesa", web: "https://www.marquesderiscal.com" },
  "Álvaro Palacios": { lat: 41.193, lng: 0.766, zone: "Gratallops · Priorat", web: "https://www.alvaropalacios.com" },
  "Pazo de Señoráns": { lat: 42.516, lng: -8.727, zone: "Meis · Rías Baixas", web: "https://www.pazodesenorans.com" },
  "CVNE": { lat: 42.576, lng: -2.846, zone: "Haro · Rioja Alta", web: "https://www.cvne.com" },
  "Gramona": { lat: 41.426, lng: 1.785, zone: "Sant Sadurní d'Anoia", web: "https://www.gramona.com" },
  "Moët & Chandon": { lat: 49.082, lng: 3.946, zone: "Hautvillers · Champagne", web: "https://www.domperignon.com" },
  "Château Margaux": { lat: 45.044, lng: -0.677, zone: "Margaux · Médoc", web: "https://www.chateau-margaux.com" },
  "Tenuta San Guido": { lat: 43.234, lng: 10.565, zone: "Bolgheri", web: "https://www.tenutasanguido.com" },
  "Penfolds": { lat: -34.536, lng: 138.959, zone: "Magill · South Australia", web: "https://www.penfolds.com" },
  "Bodegas Muga": { lat: 42.577, lng: -2.847, zone: "Haro · Rioja Alta", web: "https://www.bodegasmuga.com" },
  "Scala Dei": { lat: 41.167, lng: 0.806, zone: "Escaladei · Priorat", web: "https://www.scaladei.es" },
  "Enrique Mendoza": { lat: 38.580, lng: -0.103, zone: "Alfaz del Pi · Alicante", web: "https://www.bodegasmendoza.com" },
  "Numanthia": { lat: 41.525, lng: -5.395, zone: "Valdefinjas · Toro", web: "https://www.numanthia.com" },
  "Marqués de Murrieta": { lat: 42.430, lng: -2.445, zone: "Ygay · Rioja", web: "https://www.marquesdemurrieta.com" },
  "Mãos & Irmãos": { lat: 41.162, lng: -7.787, zone: "Loureiro · Peso da Régua · Douro", web: "" }
};

function bodegaGeo(w) {
  return BODEGA_GEO[w.producer] || { lat: 40.4, lng: -3.7, zone: w.region, web: "" };
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
  const pad = 0.18;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${g.lng-pad}%2C${g.lat-pad}%2C${g.lng+pad}%2C${g.lat+pad}&layer=mapnik&marker=${g.lat}%2C${g.lng}`;
  const osm = `https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=12/${g.lat}/${g.lng}`;
  const gmaps = `https://maps.google.com/?q=${encodeURIComponent(w.producer + " " + g.zone)}`;
  return `
    <p class="muted" style="margin:0 0 16px">${w.appellation} · ${w.region}</p>
    <div class="card">
      <h3>${w.producer}</h3>
      <p class="muted" style="margin-top:4px">${g.zone}</p>
    </div>
    ${art.map ? `<img class="map-art" src="${art.map}" alt="Mapa de ${g.zone}">` : `<div class="map-frame"><iframe title="Mapa de la bodega" src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`}
    <a class="btn btn-ghost" style="width:100%;margin-top:10px;display:block;text-align:center" href="${gmaps}" target="_blank" rel="noopener">Abrir en Mapas</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${osm}" target="_blank" rel="noopener">OpenStreetMap</a>
    ${g.web ? `<a class="btn btn-gold" style="width:100%;margin-top:8px;display:block;text-align:center" href="${g.web}" target="_blank" rel="noopener">Web de la bodega</a>` : ""}`;
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
window.runIdentify = runIdentify;
window.fakeScan = runIdentify;
window.captureLabel = captureLabel;
window.pickLabelPhoto = pickLabelPhoto;
window.pickFromRoll = pickFromRoll;
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

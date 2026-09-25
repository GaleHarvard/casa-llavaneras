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
      brand: "La Sommelière · 2 zonas",
      capacity: 180,
      used: 0,
      tHigh: 16.7,
      tLow: 12.0,
      humidity: 65,
      zones: ["Lectura actual · 16,7 °C", "SET 1 / SET 2"],
      photo: "cave-principal.jpg"
    },
    { id: "v2", name: "Cava de guarda", brand: "Eurocave", capacity: 32, used: 0, tHigh: 12.6, tLow: 12.6, humidity: 72, zones: ["Zona única · 12,5 °C"] }
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
  tasting: {}
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
    const main = parsed.vinotecas.find(v => v.id === "v1");
    if (main) {
      main.brand = "La Sommelière · 2 zonas";
      main.photo = "cave-principal.jpg";
      if (main.capacity < 100) main.capacity = 180;
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
  if (YEAR < a.drinkFrom) return { key: "wait", label: "Aún no", hint: "Necesita botella" };
  if (YEAR < a.peakStart) return { key: "ok", label: "Se puede abrir", hint: "Antes del apogeo" };
  if (YEAR <= a.peakEnd) return { key: "ok", label: "En apogeo", hint: "Ventana ideal" };
  if (YEAR <= a.holdTo) return { key: "warn", label: "Maduro", hint: "Beber pronto" };
  return { key: "late", label: "En declive", hint: "Riesgo de fatiga" };
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

function show(id) {
  if (!["wine", "wine-sub", "dish"].includes(id)) lastList = id;
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.go === id));
  document.querySelector(".app")?.classList.toggle("fiche", id === "wine" || id === "wine-sub");
  if (id !== "scan") stopCam();
  if (id === "home") renderHome();
  if (id === "caves") renderCaves();
  if (id === "cellar") renderCellar();
  if (id === "calendar") renderCalendar();
  if (id === "pairings") renderPairings();
}

function renderHome() {
  const ready = bottlesReady();
  const alerts = state.bottles.filter(b => {
    const w = wineById(b.wineId);
    return w && (phaseOf(w).key === "warn" || phaseOf(w).key === "late");
  });
  const main = state.vinotecas.find(v => v.id === "v1");
  syncUsed();
  const cap = state.vinotecas.reduce((n, v) => n + (v.capacity || 0), 0);
  $("#home-kpis").innerHTML = `
    <div class="kpi"><b>${totalBottles()}/${cap}</b><span>En cava</span></div>
    <div class="kpi"><b>${cellarValue()} €</b><span>Valor</span></div>
    <div class="kpi"><b>${ready.reduce((n,b)=>n+b.qty,0)}</b><span>Para servir</span></div>
    <div class="kpi"><b>${main ? main.tHigh.toFixed(1) + "°" : "—"}</b><span>Sommelière</span></div>`;

  const tempNote = main && main.tHigh >= 15
    ? `<div class="card warn-card" role="button" onclick="openCave('v1')"><strong>Temperatura elevada</strong><p class="muted" style="margin-top:6px">Tu cava está a ${main.tHigh.toFixed(1)} °C. El rango ideal es 12–16 °C.</p><p class="tiny gold" style="margin-top:8px">Revisar cava ›</p></div>`
    : "";
  $("#home-alerts").innerHTML = tempNote + (alerts.length ? alerts.map(b => {
    const w = wineById(b.wineId);
    const p = phaseOf(w);
    return `<div class="card" role="button" onclick="openBottle('${b.uid}')">
      <div class="row"><span class="muted"><i class="alert-dot"></i>${p.label}</span><span class="badge ${p.key}">${p.hint}</span></div>
      <h3 style="margin-top:6px">${w.producer} ${w.name} ${w.vintage}</h3>
      <p class="muted">${b.qty} ud · ${b.bin}</p>
    </div>`;
  }).join("") : (tempNote ? "" : `<div class="card muted">Sin urgencias.</div>`));

  const featured = [...new Set(state.bottles.map(b => b.wineId))].map(wineById).filter(Boolean).slice(0, 6);
  $("#home-ready").innerHTML = `<div class="tile-row">${featured.map(homeWineTile).join("")}</div>` || `<p class="empty">Escanea una botella con el círculo.</p>`;
  const perm = typeof Notification !== "undefined" ? Notification.permission : "denied";
  const on = state.notify && state.notify.on && perm === "granted";
  $("#home-notify").innerHTML = `
    <div class="card" role="button" onclick="openNotify()">
      <div class="row"><h2>Avisos</h2><span class="badge ${on ? "ok" : "wait"}">${on ? "Activos" : "Configurar"}</span></div>
      <p class="muted" style="margin-top:6px">${on ? "Te avisamos de apogeo, beber pronto y temperatura." : "Actívalos para no perder la ventana de un vino."}</p>
    </div>`;
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
      <p class="muted">${w.region} · ${kind} · ${w.vintage}</p>
    </div>
  </div>`;
}

function renderCaves() {
  syncUsed();
  $("#caves-list").innerHTML = state.vinotecas.map(v => {
    return `<div class="cave-card" role="button" onclick="openCave('${v.id}')">
      <div class="cave-ico" aria-hidden="true"></div>
      <div>
        <h3>${v.name}</h3>
        <p class="muted">${v.brand}${v.house ? " · " + v.house : ""}</p>
        <p class="cave-meta"><span>${v.used}/${v.capacity}</span><span>${v.tHigh.toFixed(1)}°</span></p>
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
    <p class="muted">${v.brand}</p>
    ${v.photo ? `<img class="cave-photo" src="${v.photo}" alt="${v.name}" />` : ""}
    <h2>Mapa de huecos</h2>
    ${rackGrid(id)}
    <div class="temp-ring-row">
      <div class="temp-ring"><b>${v.tHigh.toFixed(1)}</b><span>°C</span></div>
      <div>
        <p class="muted">Zona única</p>
        <p class="gold">Ajuste automático</p>
        <p class="tiny">${v.used}/${v.capacity} · ${v.humidity}% HR</p>
      </div>
    </div>`;
  show("cave-detail-screen");
}

function renderCellar() {
  const q = ($("#cellar-q")?.value || "").toLowerCase();
  let list = state.bottles.filter(b => {
    const w = wineById(b.wineId);
    const hay = `${w.producer} ${w.name} ${w.vintage} ${w.region} ${w.type}`.toLowerCase();
    const typeOk = filterType === "todos" || w.type === filterType;
    return typeOk && hay.includes(q);
  });
  $("#cellar-list").innerHTML = list.map(bottleCard).join("") || `<p class="empty">Sin coincidencias. Escanea o añade a mano.</p>`;
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
  return `<h2 class="cal-h">${title}</h2>` + (arr.length ? arr.map(b => {
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
  }).join("") : `<p class="muted" style="margin-bottom:8px">Ninguna botella en este estado.</p>`);
}

function rackSlots(cellarId) {
  const rows = ["A", "B", "C"];
  const cols = [1, 2, 3, 4];
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
    "Pazo de Señoráns": { land: "vinedo-rias.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
    "Álvaro Palacios": { land: "vinedo-priorat.jpg", cap: "capsula.jpg", map: "mapa-priorat.jpg" },
    "Scala Dei": { land: "vinedo-priorat.jpg", cap: "capsula.jpg", map: "mapa-priorat.jpg" },
    "Moët & Chandon": { land: "vinedo-champagne.jpg", cap: "capsula.jpg", map: "mapa-medoc.jpg" },
    "Gramona": { land: "vinedo-champagne.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
    "Tenuta San Guido": { land: "vinedo-bolgheri.jpg", cap: "capsula.jpg", map: "mapa-medoc.jpg" },
    "Penfolds": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" },
    "Enrique Mendoza": { land: "vinedo-rias.jpg", cap: "capsula.jpg", map: "mapa-rioja.jpg" },
    "Numanthia": { land: "vinedo-ribera.jpg", cap: "capsula.jpg", map: "mapa-ribera.jpg" }
  };
  return byProducer[w.producer] || { land: "vinedo.jpg", cap: "capsula.jpg", map: "" };
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
      <button class="back" onclick="show('${backTo}')">‹</button>
      <div class="spacer"></div>
      <button class="icon-btn fav ${isFav(w.id) ? "on" : ""}" onclick="toggleFav('${w.id}')" aria-label="Favorito">${isFav(w.id) ? "♥" : "♡"}</button>
      <button class="icon-btn" onclick="openWineMenu()">···</button>
    </div>
    <div class="wine-hero">${estateSVG(w)}</div>
    <h1 class="wine-producer">${w.producer}</h1>
    <p class="wine-cuvee">${w.name} ${w.vintage}</p>
    <div class="peak-pill">${pill}</div>
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
  const w = currentWine;
  if (!w) return;
  const p = phaseOf(w);
  const pr = progressOf(w);
  const r = w.ratings;
  const titles = {
    ratings: "Calificaciones",
    pairings: "Maridajes",
    keep: "Conservación",
    evolve: "Evolución",
    profile: "Perfil",
    origen: "Origen y hueco",
    mapa: "Mapa y bodega",
    taste: "Cuaderno de cata",
    bottle: currentBottle ? "Esta botella" : "Añadir a vinoteca"
  };
  let body = "";
  if (kind === "ratings") {
    body = `
      <p class="tiny" style="margin:6px 0 8px">Fuentes públicas. Vivino en escala 5; crítica en 100 puntos.</p>
      <div class="ratings">
        <div class="rate"><b>${r.vivino.score.toFixed(1)}</b><span>Vivino · ${r.vivino.count.toLocaleString("es")} opiniones · ${score100(r.vivino)}/100</span></div>
        <div class="rate"><b>${r.penin.score}</b><span>Guía Peñín / 100</span></div>
        <div class="rate"><b>${r.parker.score}</b><span>${r.parker.reviewer}</span></div>
        <div class="rate"><b>${r.spectator.score}</b><span>Wine Spectator / 100</span></div>
        <div class="rate"><b>${r.decanter.score}</b><span>Decanter / 100</span></div>
        <div class="rate"><b>${w.priceHint}</b><span>Horquilla de mercado</span></div>
      </div>`;
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
        <p class="muted">Luz: ${w.conservation.light}. Evita vibración. El corcho no es hermético al aroma.</p>
        ${adviseCave(w)}
      </div>
      <div class="card">
        <strong>Cómo conservarlo</strong>
        <p class="muted" style="margin-top:6px">Horizontal, oscuro, sin UV ni vibración de electrodomésticos. Estabilidad antes que la cifra exacta: más de 2 °C de oscilación acelera la evolución.</p>
      </div>`;
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
        <h2>Cata</h2>
        <p style="margin-top:8px">${w.tasting}</p>
      </div>
      <div class="card">
        <p>Uvas: ${w.grapes.join(", ")}</p>
        <p class="muted">${w.abv}% vol. · ${w.type} · ${w.style} · ${w.priceHint}</p>
      </div>`;
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
    body = mapaBlock(w);
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
    body = currentBottle ? `
      <div class="card">
        <p>Ubicación: ${cellarName(currentBottle.cellarId)} · ${currentBottle.bin || "sin hueco"}</p>
        <p class="muted">Compra ${currentBottle.bought || "—"} · ${currentBottle.price ? currentBottle.price + " €" : "precio no indicado"} · ${currentBottle.qty} ud</p>
        ${currentBottle.note ? `<p style="margin-top:6px">${currentBottle.note}</p>` : ""}
        ${currentBottle.labelPhoto ? `<img class="cave-photo" src="${currentBottle.labelPhoto}" alt="Etiqueta escaneada" />` : ""}
        <div class="btn-row">
          <button class="btn btn-gold" onclick="consumeBottle()">Servir 1</button>
          <button class="btn btn-ghost" onclick="showSheet('move-sheet')">Mover</button>
        </div>
      </div>` : `
      <p class="muted" style="margin-bottom:12px">Este vino aún no está en tu cava.</p>
      <div class="btn-row">
        <button class="btn btn-gold" onclick="quickAdd('${w.id}')">Añadir a vinoteca</button>
        <button class="btn btn-ghost" onclick="showSheet('add-sheet')">Elegir hueco</button>
      </div>`;
  }
  $("#wine-sub-body").innerHTML = `
    <button class="back" onclick="show('wine')">‹ ${w.producer}</button>
    <p class="eyebrow">${w.name} ${w.vintage}</p>
    <h1>${titles[kind] || "Ficha"}</h1>
    ${body}`;
  show("wine-sub");
}

function pairingBlock(w) {
  const pack = WINE_PAIRINGS[w.id];
  if (!pack) return "";
  const inCellar = state.bottles.some(b => b.wineId === w.id);
  return `
    <h2 style="margin-top:16px">Maridajes de este vino</h2>
    <p class="muted" style="margin:6px 0 10px">${pack.logic}</p>
    <div class="card"><p class="tiny">Servicio en mesa</p><p>${pack.serve}</p>
      <p class="muted" style="margin-top:8px">Evitar: ${pack.avoid.join(" · ")}</p></div>
    ${pack.matches.map(m => {
      const d = PAIRING_DISHES.find(x => x.id === m.dishId);
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
      return `<div class="card" role="button" onclick="openDish('${d.id}')">
        <div class="row"><h3>${d.icon} ${d.name}</h3><span class="badge">${wines.length} vinos</span></div>
        <p class="muted">${d.family} · ${d.heat}</p>
        ${best ? `<p class="tiny" style="margin-top:6px">Mejor encaje: ${best.wine.producer} ${best.wine.name} · ${best.score}</p>` : ""}
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
    return `<div class="pair-card" role="button" onclick="openWine('${w.id}')">
      <div class="pair-thumb" style="--c:${w.color}"></div>
      <div class="pair-copy">
        <h3>${shortWineName(w)}</h3>
        <p class="muted">${w.name} ${w.vintage} · ${w.region}</p>
        <p class="pair-dish">${d ? d.name : (w.pairing[0] || "")}</p>
        <p class="pair-score-line">${top ? "★ " + top.score + "/100" : ""}</p>
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
    <button class="back" onclick="show('pairings')">‹ Maridajes</button>
    <p class="eyebrow">${d.family}</p>
    <h1>${d.icon} ${d.name}</h1>
    <p class="muted">${d.heat} · ${d.tags.join(" · ")}</p>
    ${inCava.length ? `<div class="card" style="margin-top:12px"><h2>En tu vinoteca ahora</h2>
      ${inCava.map(x => `<p style="margin-top:8px"><strong>${x.wine.producer} ${x.wine.name} ${x.wine.vintage}</strong> · ${x.score}/100<br><span class="muted">${x.why}</span></p>`).join("")}
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

function consumeBottle() {
  if (!currentBottle) return;
  const wineId = currentBottle.wineId;
  currentBottle.qty -= 1;
  if (currentBottle.qty <= 0) {
    state.bottles = state.bottles.filter(b => b.uid !== currentBottle.uid);
    currentBottle = state.bottles.find(b => b.wineId === wineId) || null;
  }
  save();
  toast("Servida");
  openWine(wineId, currentBottle);
}

function addCurrentToCellar() {
  if (!currentWine) return;
  const cellarId = $("#add-cellar").value;
  const qty = Math.max(1, parseInt($("#add-qty").value || "1", 10));
  const bin = $("#add-bin").value.trim() || nextBin(cellarId);
  const price = parseFloat($("#add-price").value || "0");
  const note = $("#add-note").value.trim();
  const existing = state.bottles.find(b => b.wineId === currentWine.id && b.cellarId === cellarId && b.bin === bin);
  if (existing) {
    existing.qty += qty;
    if (lastLabelData) existing.labelPhoto = lastLabelData;
    currentBottle = existing;
  } else {
    const bottle = {
      uid: "b" + Date.now(),
      wineId: currentWine.id,
      qty, cellarId, bin,
      bought: NOW.toISOString().slice(0, 10),
      price, note,
      labelPhoto: lastLabelData || ""
    };
    state.bottles.push(bottle);
    currentBottle = bottle;
  }
  save();
  hideSheets();
  toast("Guardada en " + cellarName(cellarId));
  openWine(currentWine.id, currentBottle);
}

function moveBottle() {
  if (!currentBottle) return;
  currentBottle.cellarId = $("#move-cellar").value;
  currentBottle.bin = $("#move-bin").value.trim();
  save();
  hideSheets();
  openBottle(currentBottle.uid);
  toast("Ubicación actualizada");
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
  const hay = normTxt(raw);
  if (!hay) return [];
  const scored = WINE_CATALOG.map(w => {
    let score = 0;
    const bits = [w.producer, w.name, String(w.vintage), w.region, w.appellation, ...(w.grapes || [])];
    bits.forEach(b => {
      const t = normTxt(b);
      if (t.length >= 4 && hay.includes(t)) score += Math.min(28, t.length);
    });
    const producerFirst = normTxt(w.producer.split(" ")[0]);
    if (producerFirst.length >= 4 && hay.includes(producerFirst)) score += 14;
    if (hay.includes(String(w.vintage))) score += 22;
    if (hay.includes("unico") && /unico/.test(normTxt(w.name))) score += 30;
    if (hay.includes("vega") && hay.includes("sicilia") && /vega sicilia/.test(normTxt(w.producer))) score += 36;
    if (hay.includes("tondonia") && /tondonia/.test(normTxt(w.name))) score += 30;
    if (hay.includes("valbuena") && /valbuena/.test(normTxt(w.name))) score += 26;
    if (hay.includes("pazo") && /pazo/.test(normTxt(w.producer))) score += 24;
    return { w, score };
  }).filter(x => x.score >= 18).sort((a, b) => b.score - a.score);
  const uniq = [];
  const seen = new Set();
  scored.forEach(x => {
    if (!seen.has(x.w.id)) { seen.add(x.w.id); uniq.push(x.w); }
  });
  return uniq.slice(0, 6);
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
  const cellarId = "v1";
  const existing = state.bottles.find(b => b.wineId === wineId && b.cellarId === cellarId);
  if (existing) {
    existing.qty += 1;
    if (lastLabelData) existing.labelPhoto = lastLabelData;
    currentBottle = existing;
  } else {
    const bottle = {
      uid: "b" + Date.now(),
      wineId,
      qty: 1,
      cellarId,
      bin: nextBin(cellarId),
      bought: NOW.toISOString().slice(0, 10),
      price: 0,
      note: "Añadido por escaneo",
      labelPhoto: lastLabelData || ""
    };
    state.bottles.push(bottle);
    currentBottle = bottle;
  }
  save();
  toast("Guardado en " + cellarName(cellarId));
  openWine(wineId, currentBottle);
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
    $("#add-cellar").value = "v1";
    $("#add-bin").value = nextBin("v1");
    $("#add-qty").value = "1";
  }
  if (id === "move-sheet" && currentBottle) {
    $("#move-cellar").value = currentBottle.cellarId;
    $("#move-bin").value = currentBottle.bin || "";
  }
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
  "Marqués de Murrieta": { lat: 42.430, lng: -2.445, zone: "Ygay · Rioja", web: "https://www.marquesdemurrieta.com" }
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

function mapaBlock(w) {
  const art = estateArt(w);
  const g = bodegaGeo(w);
  const pad = 0.18;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${g.lng-pad}%2C${g.lat-pad}%2C${g.lng+pad}%2C${g.lat+pad}&layer=mapnik&marker=${g.lat}%2C${g.lng}`;
  const osm = `https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=12/${g.lat}/${g.lng}`;
  const gmaps = `https://maps.google.com/?q=${encodeURIComponent(w.producer + " " + g.zone)}`;
  return `
    <p class="muted">${w.appellation} · ${w.region}</p>
    ${art.land ? `<img class="estate-wide" src="${art.land}" alt="${w.producer}">` : ""}
    <div class="card">
      <h3>${w.producer}</h3>
      <p class="muted" style="margin-top:4px">${g.zone}</p>
    </div>
    ${art.map ? `<img class="map-art" src="${art.map}" alt="Mapa de ${g.zone}">` : `<div class="map-frame"><iframe title="Mapa de la bodega" src="${embed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`}
    <a class="btn btn-ghost" style="width:100%;margin-top:10px;display:block;text-align:center" href="${gmaps}" target="_blank" rel="noopener">Abrir en Mapas</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${osm}" target="_blank" rel="noopener">OpenStreetMap</a>
    ${g.web ? `<a class="btn btn-gold" style="width:100%;margin-top:8px;display:block;text-align:center" href="${g.web}" target="_blank" rel="noopener">Web de la bodega</a>` : ""}`;
}

function setTaste(id, field, val) {
  if (!state.tasting) state.tasting = {};
  const cur = getTaste(id);
  cur[field] = field === "note" ? val : Number(val);
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

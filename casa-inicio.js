/* Pantalla de inicio, fechas y avisos de stock. */
function renderHome() {
  const ready = bottlesReady();
  const main = state.vinotecas.find(v => v.id === "v1");
  syncUsed();
  const cap = state.vinotecas.reduce((n, v) => n + (v.capacity || 0), 0);
  $("#home-kpis").innerHTML = `
    <div class="kpi"><b>${totalBottles()}/${cap}</b><span>En cava</span></div>
    <div class="kpi" role="button" onclick="show('balance')"><b>${state.prefs.hideValue ? "—" : euro(cellarValue())}</b><span>${state.prefs.hideValue ? "Valor" : ("Coste · " + euro(cellarMarketValue()) + " mercado")}</span></div>
    <div class="kpi"><b>${ready.reduce((n,b)=>n+b.qty,0)}</b><span>Para servir</span></div>
    <div class="kpi"><b>${main && Number.isFinite(Number(main.tHigh)) ? Number(main.tHigh).toFixed(1) + "°" : "—"}</b><span>VIP 185</span></div>`;

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
  if ($("#home-open")) $("#home-open").innerHTML = monthOpenHtml();
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
    <div class="card" role="button" onclick="show('bebidas')" style="margin-top:8px"><div class="row"><h3>Bebidas</h3><span class="tiny">${(state.consumption || []).reduce((n, c) => n + (Number(c.qty) || 1), 0) || "›"}</span></div><p class="muted">Lo que ya se ha servido</p></div>
    <div class="card" role="button" onclick="show('catas')" style="margin-top:8px"><div class="row"><h3>Cuaderno de cata</h3><span class="tiny">›</span></div><p class="muted">Ejes y recuerdo</p></div>
    <div class="card" role="button" onclick="show('perfil')" style="margin-top:8px"><div class="row"><h3>Perfil</h3><span class="tiny">›</span></div><p class="muted">Casas, copias y privacidad</p></div>
    <div class="card" role="button" onclick="setCellarView('ubicaciones');show('cellar',{tab:true})" style="margin-top:8px"><div class="row"><h3>Ubicación física</h3><span class="tiny">›</span></div><p class="muted">Hueco, lote, servir y mover</p></div>
    <div class="chip-row" style="margin-top:14px">
      <button class="chip on" onclick="startScan()">Escanear</button>
      <button class="chip" onclick="show('inbox')">Entradas</button>
      <button class="chip" onclick="quickTaste()">Cata rápida</button>
      <button class="chip" onclick="openHomeMap()">Mapa</button>
    </div>
    ${backupReminderHtml()}
    <div class="card" style="margin-top:12px">
      <div role="button" onclick="openNotify()">
        <div class="row"><h2>Avisos</h2><span class="badge ${on ? "ok" : "wait"}">${on ? "Activos" : "Configurar"}</span></div>
        <p class="muted" style="margin-top:6px">${on ? "Apogeo, beber pronto, temperatura y última botella." : "Actívalos para no perder la ventana."}</p>
      </div>
      ${stockNoticesHtml()}
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
  const rows = [];
  Object.keys(state.tasting || {}).forEach(id => {
    const w = wineById(id);
    tastingsOf(id).forEach(t => {
      if (!w || !t) return;
      const note = (t.conclusion && t.conclusion.note) || t.note || "";
      rows.push({
        wine: w,
        note: note,
        score: t.conclusion ? t.conclusion.score : null,
        at: t.at || 0,
        when: t.date || (t.at ? isoFromTs(t.at) : "—"),
        id: t.id
      });
    });
  });
  return rows.sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, n);
}
function monthOpenReason(w) {
  if (!w || !datesAreReal(w) || !w.aging) return null;
  const peakStart = Number(w.aging.peakStart);
  const peakEnd = Number(w.aging.peakEnd);
  const holdTo = Number(w.aging.holdTo);
  if (!Number.isFinite(peakStart) || !Number.isFinite(peakEnd)) return null;
  const past = (Number.isFinite(holdTo) && YEAR > holdTo) || YEAR > peakEnd;
  const endsThisYear = peakEnd === YEAR || holdTo === YEAR;
  const atPeak = YEAR >= peakStart && YEAR <= peakEnd;
  if (past) return { rank: 0, text: "Pasado su momento óptimo" };
  if (endsThisYear) return { rank: 1, text: "Beber antes de " + YEAR };
  if (atPeak) return { rank: 2, text: "En su mejor momento" };
  return null;
}
function openThisMonth() {
  const seen = {};
  const rows = [];
  (state.bottles || []).forEach(b => {
    const qty = Number(b && b.qty) || 0;
    if (!b || qty < 1) return;
    if (seen[b.wineId]) { seen[b.wineId].qty += qty; return; }
    const w = wineById(b.wineId);
    const reason = monthOpenReason(w);
    if (!reason) return;
    const row = { wine: w, qty: qty, reason: reason.text, rank: reason.rank, end: Number(w.aging.peakEnd) || 9999 };
    seen[b.wineId] = row;
    rows.push(row);
  });
  rows.sort((a, b) => a.rank - b.rank || a.end - b.end || String(a.wine.producer || "").localeCompare(String(b.wine.producer || ""), "es"));
  return rows;
}
function monthOpenHtml() {
  const rows = openThisMonth();
  const body = rows.length ? rows.map(r => {
    const w = r.wine;
    const badge = r.rank === 0 ? "late" : r.rank === 1 ? "warn" : "ok";
    return `<div class="card" role="button" onclick="openWine('${w.id}')" style="margin-top:8px">
      <div class="row"><h3>${escHtml(w.producer)}</h3><span class="badge ${badge}">${escHtml(r.reason)}</span></div>
      <p style="margin-top:4px">${escHtml(w.name)} ${escHtml(String(w.vintage || ""))}</p>
      <p class="muted">${r.qty} botella${r.qty > 1 ? "s" : ""}</p>
    </div>`;
  }).join("") : `<p class="empty">Nada en su momento este mes.</p>`;
  return `<h2 style="margin-top:16px">Qué abrir este mes</h2>${body}`;
}
function stockByWine() {
  const map = {};
  (state.bottles || []).forEach(b => {
    if (!b || !b.wineId) return;
    map[b.wineId] = (map[b.wineId] || 0) + (Number(b.qty) || 0);
  });
  return map;
}
function lastBottleWines() {
  const map = stockByWine();
  return Object.keys(map).filter(id => map[id] === 1).map(wineById).filter(Boolean);
}
function stockDismissed(id) {
  const list = (notifyPrefs().dismissedStock) || [];
  return list.indexOf(id) >= 0;
}
function pruneStockDismissals() {
  const n = notifyPrefs();
  const map = stockByWine();
  n.dismissedStock = (n.dismissedStock || []).filter(id => map[id] === 1);
}
function dismissStock(id) {
  const n = notifyPrefs();
  n.dismissedStock = n.dismissedStock || [];
  if (n.dismissedStock.indexOf(id) < 0) n.dismissedStock.push(id);
  save();
  if (screenId === "home") renderHome();
  const box = $("#stock-notices");
  if (box) box.innerHTML = stockNoticesHtml();
}
function stockNoticesHtml() {
  pruneStockDismissals();
  const rows = lastBottleWines().filter(w => !stockDismissed(w.id));
  if (!rows.length) return "";
  return rows.map(w => `<div class="card" style="margin-top:8px" onclick="event.stopPropagation()">
    <h3>Queda 1 botella de ${escHtml(w.producer)} ${escHtml(w.name)}</h3>
    <p class="muted" style="margin-top:6px">${escHtml(String(w.vintage || ""))}${w.type ? " · " + escHtml(typeLabel(w.type)) : ""}</p>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="event.stopPropagation();openWine('${w.id}')">Ver ficha</button>
      <button class="btn btn-ghost" onclick="event.stopPropagation();dismissStock('${w.id}')">Ocultar</button>
    </div>
  </div>`).join("");
}
function maybeStockPush() {
  const n = notifyPrefs();
  if (!n.on || n.stock === false) return;
  const rows = lastBottleWines().filter(w => !stockDismissed(w.id));
  if (!rows.length) return;
  const w = rows[0];
  const extra = rows.length > 1 ? " · y " + (rows.length - 1) + " más" : "";
  pushNote("Última botella", "Queda 1 botella de " + w.producer + " " + w.name + extra, "stock-" + w.id, "home");
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

/* Pantalla de inicio, fechas y avisos de stock. */
function renderHome() {
  const ready = bottlesReady();
  const main = state.vinotecas.find(v => v.id === "v1");
  syncUsed();
  const cap = state.vinotecas.reduce((n, v) => n + (v.capacity || 0), 0);
  $("#home-kpis").innerHTML = `
    <div class="kpi"><b>${totalBottles()}/${cap}</b><span>${t("home.inCellar")}</span></div>
    <div class="kpi" role="button" onclick="show('balance')"><b>${state.prefs.hideValue ? "—" : euro(cellarValue())}</b><span>${state.prefs.hideValue ? t("home.value") : t("home.costMarket", { m: euro(cellarMarketValue()) })}</span></div>
    <div class="kpi"><b>${ready.reduce((n,b)=>n+b.qty,0)}</b><span>${t("home.toServe")}</span></div>
    <div class="kpi"><b>${main && Number.isFinite(Number(main.tHigh)) ? Number(main.tHigh).toFixed(1) + "°" : "—"}</b><span>VIP 185</span></div>`;

  const featured = pickFeaturedWine();
  $("#home-featured").innerHTML = featured ? `
    <h2 style="margin-top:8px">${t("home.featured")}</h2>
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
    <h2 style="margin-top:16px">${t("home.drinkNow")}</h2>
    ${drinkNow.length
      ? `<div class="tile-row" style="margin-top:10px">${drinkNow.map(b => homeWineTile(wineById(b.wineId))).join("")}</div>`
      : `<p class="empty">${t("home.noneWindow")}</p>`}`;

  const lastT = lastTastings(3);
  $("#home-tasting").innerHTML = `
    <h2 style="margin-top:16px" role="button" onclick="show('catas')">${t("home.lastTastings")}</h2>
    ${lastT.length ? lastT.map(row => `
      <div class="card" role="button" onclick="openWineThenTaste('${row.wine.id}')" style="margin-top:10px">
        <div class="row"><h3>${row.wine.producer}</h3><span class="tiny">${formatDate(row.when)}</span></div>
        <p class="muted">${row.wine.name} ${row.wine.vintage}</p>
        <p class="tiny" style="margin-top:4px">${row.note || t("home.noNote")}</p>
      </div>`).join("") : `<p class="empty">${t("home.noTasting")}</p>`}`;

  $("#home-alerts").innerHTML = homeAlertsHtml(main);
  const perm = typeof Notification !== "undefined" ? Notification.permission : "denied";
  const on = state.notify && state.notify.on && perm === "granted";
  $("#home-notify").innerHTML = `
    <h2 style="margin-top:18px">${t("home.pages")}</h2>
    <div class="card" role="button" onclick="show('inbox')" style="margin-top:10px"><div class="row"><h3>${t("home.inboxTitle")}</h3><span class="tiny">${(state.inbox||[]).filter(x=>!x.entered).length || "›"}</span></div><p class="muted">${t("home.inboxSub")}</p></div>
    <div class="card" role="button" onclick="show('caves',{tab:true})" style="margin-top:8px"><div class="row"><h3>${t("tab.caves")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.cavesSub")}</p></div>
    <div class="card" role="button" onclick="openCave('v1')" style="margin-top:8px"><div class="row"><h3>${t("home.vip")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.vipSub")}</p></div>
    <div class="card" role="button" onclick="show('cellar',{tab:true})" style="margin-top:8px"><div class="row"><h3>${t("tab.bottles")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.bottlesSub")}</p></div>
    <div class="card" role="button" onclick="show('pairings',{tab:true})" style="margin-top:8px"><div class="row"><h3>${t("tab.table")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.tableSub")}</p></div>
    <div class="card" role="button" onclick="show('calendar',{tab:true})" style="margin-top:8px"><div class="row"><h3>${t("tab.dates")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.datesSub")}</p></div>
    <div class="card" role="button" onclick="openHomeMap()" style="margin-top:8px"><div class="row"><h3>${t("home.zones")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.zonesSub")}</p></div>
    <div class="card" role="button" onclick="show('bebidas')" style="margin-top:8px"><div class="row"><h3>${t("home.drinks")}</h3><span class="tiny">${(state.consumption || []).reduce((n, c) => n + (Number(c.qty) || 1), 0) || "›"}</span></div><p class="muted">${t("home.drinksSub")}</p></div>
    <div class="card" role="button" onclick="show('catas')" style="margin-top:8px"><div class="row"><h3>${t("home.notebook")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.notebookSub")}</p></div>
    <div class="card" role="button" onclick="show('perfil')" style="margin-top:8px"><div class="row"><h3>${t("home.profile")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.profileSub")}</p></div>
    <div class="card" role="button" onclick="setCellarView('ubicaciones');show('cellar',{tab:true})" style="margin-top:8px"><div class="row"><h3>${t("home.location")}</h3><span class="tiny">›</span></div><p class="muted">${t("home.locationSub")}</p></div>
    <div class="chip-row" style="margin-top:14px">
      <button class="chip on" onclick="startScan()">${t("home.scan")}</button>
      <button class="chip" onclick="show('inbox')">${t("home.inbox")}</button>
      <button class="chip" onclick="quickTaste()">${t("home.quick")}</button>
      <button class="chip" onclick="openHomeMap()">${t("home.map")}</button>
    </div>
    ${backupReminderHtml()}
    <div class="card" style="margin-top:12px">
      <div role="button" onclick="openNotify()">
        <div class="row"><h2>${t("home.notices")}</h2><span class="badge ${on ? "ok" : "wait"}">${on ? t("home.noticesOn") : t("home.noticesSetup")}</span></div>
        <p class="muted" style="margin-top:6px">${on ? t("home.noticesOnHint") : t("home.noticesOffHint")}</p>
      </div>
      ${stockNoticesHtml()}
    </div>
    <div class="card" role="button" onclick="show('perfil')" style="margin-top:10px">
      <div class="row"><h2>${t("home.profile")}</h2><span class="tiny">›</span></div>
      <p class="muted" style="margin-top:6px">${t("home.profileCard")}</p>
    </div>
    <p class="tiny app-version" style="text-align:center;margin:18px 0 8px">${t("home.version", { v: (typeof APP_VERSION !== "undefined" ? APP_VERSION : "") })}</p>`;
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
  if (past) return { rank: 0, text: t("home.reasonPast") };
  if (endsThisYear) return { rank: 1, text: t("home.reasonBefore", { y: YEAR }) };
  if (atPeak) return { rank: 2, text: t("home.reasonPeak") };
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
      <p class="muted">${r.qty} ${nounBottles(r.qty)}</p>
    </div>`;
  }).join("") : `<p class="empty">${t("home.noneMonth")}</p>`;
  return `<h2 style="margin-top:16px">${t("home.openMonth")}</h2>${body}`;
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
    <h3>${t("home.stockOne", { name: escHtml(w.producer) + " " + escHtml(w.name) })}</h3>
    <p class="muted" style="margin-top:6px">${escHtml(String(w.vintage || ""))}${w.type ? " · " + escHtml(typeLabel(w.type)) : ""}</p>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="event.stopPropagation();openWine('${w.id}')">${t("home.see")}</button>
      <button class="btn btn-ghost" onclick="event.stopPropagation();dismissStock('${w.id}')">${t("home.hide")}</button>
    </div>
  </div>`).join("");
}
function maybeStockPush() {
  const n = notifyPrefs();
  if (!n.on || n.stock === false) return;
  const rows = lastBottleWines().filter(w => !stockDismissed(w.id));
  if (!rows.length) return;
  const w = rows[0];
  const extra = rows.length > 1 ? t("notify.more", { n: rows.length - 1 }) : "";
  pushNote(t("notify.lastTitle"), t("notify.lastBody", { wine: w.producer + " " + w.name, extra: extra }), "stock-" + w.id, "home");
}
function homeAlertsHtml(main) {
  const items = [];
  if (main && main.tHigh >= 15) {
    items.push(`<div class="card warn-card" role="button" onclick="openCave('v1')"><strong>${t("home.tempHigh")}</strong><p class="muted" style="margin-top:6px">${t("home.tempIdeal", { t: main.tHigh.toFixed(1) })}</p></div>`);
  }
  state.bottles.forEach(b => {
    const w = wineById(b.wineId);
    if (!w) return;
    const p = phaseOf(w);
    const bin = state.prefs.hideBin ? "" : (b.bin || "");
    if (p.key === "warn" || p.key === "late") {
      items.push(`<div class="card" role="button" onclick="openBottle('${b.uid}')">
        <div class="row"><span class="muted"><i class="alert-dot"></i>${t("home.window")}</span><span class="badge ${p.key}">${p.label}</span></div>
        <h3 style="margin-top:6px">${w.producer} ${w.name} ${w.vintage}</h3>
        <p class="muted">${b.qty} ud${bin ? " · " + bin : ""}</p>
      </div>`);
    }
    if (b.qty <= 1) {
      items.push(`<div class="card" role="button" onclick="openBottle('${b.uid}')">
        <div class="row"><span class="muted">${t("home.lowStock")}</span><span class="badge warn">${t("home.oneUd")}</span></div>
        <h3 style="margin-top:6px">${w.producer} ${w.name}</h3>
      </div>`);
    }
    if (!b.bin || !state.tasting[b.wineId]) {
      items.push(`<div class="card" role="button" onclick="openBottle('${b.uid}')">
        <div class="row"><span class="muted">${t("home.pendingInfo")}</span></div>
        <h3 style="margin-top:6px">${w.producer} ${w.name}</h3>
        <p class="tiny">${!b.bin ? t("home.noBin") : t("home.noTaste")}</p>
      </div>`);
    }
  });
  const uniq = [];
  const seen = new Set();
  items.forEach(html => { if (!seen.has(html)) { seen.add(html); uniq.push(html); } });
  return `<h2 style="margin-top:16px">${t("home.alerts")}</h2><div style="margin-top:10px">${uniq.slice(0, 6).join("") || `<div class="card muted">${t("home.noneUrgent")}</div>`}</div>`;
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
    ${calBlock(t("cal.now"), groups.ok)}
    ${calBlock(t("cal.soon"), groups.warn)}
    ${calBlock(t("cal.wait"), groups.wait)}
    ${calBlock(t("cal.late"), groups.late)}`;
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
          <p class="tiny">${datesAreReal(w) ? t("cal.until", { y: w.aging.peakEnd }) : t("cal.untilUnknown")}</p>
        </div>
      </div>
      <div class="win-row">
        <span class="tiny">${t("home.window")}</span>
        <span class="tiny win-left">${datesAreReal(w) ? yearsUntilPeakEnd(w.aging.peakEnd) : t("nodata")}</span>
      </div>
      <div class="win-bar" role="img" aria-label="${t("cal.peakAria", { a: w.aging.peakStart, b: w.aging.peakEnd, y: YEAR })}">
        <span class="win-peak" style="left:${mark.left}%;width:${mark.width}%"></span>
        <span class="win-now" style="left:${mark.now}%" title="${t("cal.year", { y: YEAR })}"></span>
      </div>
    </div>`;
  }).join("");
}

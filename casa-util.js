/* Utilidades compartidas de Casa Llavaneras. */
function today() {
  let raw = "";
  try { raw = globalThis.__casaToday || ""; } catch (e) { raw = ""; }
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function yearNow() { return today().getFullYear(); }
function formatTodayLabel() {
  const d = today();
  const loc = (typeof appLocale === "function" && appLocale()) || "es-ES";
  try { return d.toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" }); }
  catch (e) { return todayIso(); }
}
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
  cave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16M16 4v16"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 7h12M8 12h12M8 17h12"/><circle cx="4" cy="7" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="17" r="1.2" fill="currentColor"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><path d="M8 12h8"/></svg>'
};
function euro(n) {
  if (typeof formatEuro === "function") return formatEuro(n);
  const v = Math.round(Number(n) || 0);
  try { return v.toLocaleString("es-ES") + " €"; }
  catch (e) { return v + " €"; }
}
function $ (sel, root = document) { return root.querySelector(sel); }
function $$ (sel, root = document) { return [...root.querySelectorAll(sel)]; }
const ROOT_IDS = { home: 1, caves: 1, cellar: 1, pairings: 1 };
const tabScroll = { home: 0, caves: 0, cellar: 0, pairings: 0 };
let navReady = false;
let navSilent = false;
let pendingTab = null;
let tabOwner = "home";
let cellarSeg = "lista";
let zonaName = "";
let caveOpen = "";
function backCaption() { return t("nav.back"); }
function hashFor(st) {
  st = st || {};
  const id = st.screen || "home";
  if (id === "cellar" && st.seg === "cuando") return "#cellar/cuando";
  if ((id === "wine" || id === "wine-sub") && st.wineId) return "#wine/" + encodeURIComponent(st.wineId) + (id === "wine-sub" && st.sub ? "/" + encodeURIComponent(st.sub) : "");
  if (id === "dish" && st.dish) return "#dish/" + encodeURIComponent(st.dish);
  if (id === "zonas" && st.zone) return "#zonas/" + encodeURIComponent(st.zone);
  if (id === "perfil-sub" && st.perfil) return "#perfil/" + encodeURIComponent(st.perfil);
  if (id === "cave-detail-screen" && st.cave) return "#cave/" + encodeURIComponent(st.cave);
  return "#" + id;
}
function stateNow(id, extra) {
  return Object.assign({
    screen: id,
    tab: tabOwner,
    seg: cellarSeg,
    wineId: currentWine && currentWine.id || "",
    bottleUid: currentBottle && currentBottle.uid || "",
    sub: currentSub || "",
    dish: typeof pairingDish !== "undefined" ? (pairingDish || "") : "",
    perfil: typeof perfilKind !== "undefined" ? (perfilKind || "") : "",
    zone: zonaName || "",
    cave: caveOpen || "",
    depth: (history.state && history.state.depth) || 0,
    scroll: 0
  }, extra || {});
}
function rememberScroll() {
  if (!history.state) return;
  const sc = document.querySelector("#" + screenId + " .scroll");
  const st = Object.assign({}, history.state, { scroll: sc ? sc.scrollTop : 0 });
  try { history.replaceState(st, "", location.hash || hashFor(st)); } catch (e) {}
}
function show(id, opts) {
  opts = opts || {};
  if (typeof langRefresh !== "undefined" && langRefresh) opts.replace = true;
  if (!id) id = "home";
  if (id === "calendar") {
    id = "cellar";
    opts.tab = true;
    opts.seg = "cuando";
  }
  if (opts.seg) cellarSeg = opts.seg === "cuando" ? "cuando" : "lista";
  if (opts.zone != null) zonaName = opts.zone || "";
  if (id === "zonas" && opts.zone == null && !navSilent) zonaName = "";
  if (navSilent || !navReady) {
    reveal(id);
    return;
  }
  if (opts.tab && ROOT_IDS[id]) {
    const depth = (history.state && history.state.depth) || 0;
    const sameRoot = screenId === id && depth === 0 && !(id === "cellar" && opts.seg && opts.seg !== ((history.state && history.state.seg) || cellarSeg));
    if (sameRoot && !opts.seg) {
      const sc = document.querySelector("#" + id + " .scroll");
      if (sc) sc.scrollTop = 0;
      return;
    }
    rememberScroll();
    tabOwner = id;
    const st = stateNow(id, { tab: id, depth: 0, zone: "", scroll: 0 });
    if (depth > 0) {
      pendingTab = st;
      history.go(-depth);
      return;
    }
    history.replaceState(st, "", hashFor(st));
    reveal(id);
    focusScreen();
    return;
  }
  rememberScroll();
  const prevZone = history.state && history.state.zone;
  const sameScreen = screenId === id && !opts.zone && id !== "wine" && id !== "wine-sub" && id !== "dish" && id !== "perfil-sub" && id !== "cave-detail-screen";
  const sameWine = (id === "wine" || id === "wine-sub") && history.state && history.state.wineId && currentWine && history.state.wineId === currentWine.id && (id !== "wine-sub" || history.state.sub === (currentSub || ""));
  const st = stateNow(id);
  if (opts.replace || sameScreen || sameWine) {
    st.depth = (history.state && history.state.depth) || (ROOT_IDS[id] ? 0 : 1);
    history.replaceState(st, "", hashFor(st));
  } else {
    if (opts.zone && prevZone === opts.zone && screenId === "zonas") st.depth = (history.state && history.state.depth) || 1;
    else st.depth = ((history.state && history.state.depth) || 0) + 1;
    st.tab = tabOwner;
    if (opts.zone && prevZone === opts.zone && screenId === "zonas") history.replaceState(st, "", hashFor(st));
    else history.pushState(st, "", hashFor(st));
  }
  reveal(id);
  focusScreen();
}
function reveal(id) {
  if (ROOT_IDS[screenId]) {
    const prev = document.querySelector("#" + screenId + " .scroll");
    if (prev) tabScroll[screenId] = prev.scrollTop;
  }
  screenId = id;
  if (ROOT_IDS[id]) {
    tabOwner = id;
    lastList = id;
  } else if (id === "scan") lastList = "scan";
  else if (!["wine", "wine-sub", "dish"].includes(id)) lastList = id;
  $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  document.querySelector(".app")?.classList.toggle("fiche", id === "wine" || id === "wine-sub" || id === "dish");
  if (id !== "scan" && typeof stopCam === "function") stopCam();
  if (id === "home") renderHome();
  if (id === "inbox") renderInbox();
  if (id === "caves") renderCaves();
  if (id === "cellar") {
    renderCellar();
    applyCellarSeg();
    if (cellarSeg === "cuando" && typeof renderCalendar === "function") renderCalendar();
  }
  if (id === "pairings") renderPairings();
  if (id === "perfil") renderPerfil();
  if (id === "zonas" && !zonaName) renderZonas();
  if (id === "catas") renderCatas();
  if (id === "bebidas") renderBebidas();
  if (id === "balance") renderBalance();
  if (typeof mountLabelThumbs === "function") mountLabelThumbs(document.getElementById(id));
  syncChrome();
  const sc = document.querySelector("#" + id + " .scroll");
  if (sc && ROOT_IDS[id] && !(history.state && history.state.scroll)) sc.scrollTop = tabScroll[id] || 0;
}
function focusScreen() {
  const h = document.querySelector("#" + screenId + " h1");
  if (!h) return;
  h.setAttribute("tabindex", "-1");
  try { h.focus({ preventScroll: true }); } catch (e) {}
}
function syncChrome() {
  const bar = document.getElementById("topbar");
  const live = !!(document.querySelector(".app") && document.querySelector(".app").classList.contains("cam-live"));
  const pushed = !ROOT_IDS[screenId];
  if (bar) bar.hidden = !pushed || live;
  document.querySelector(".app")?.classList.toggle("show-top", pushed && !live);
  const h1 = document.querySelector("#" + screenId + " h1");
  const title = document.getElementById("topbar-title");
  if (title) {
    title.textContent = h1 ? h1.textContent.trim() : "";
    title.classList.remove("on");
  }
  const actions = document.getElementById("topbar-actions");
  if (actions) {
    if (screenId === "wine" && currentWine && typeof isFav === "function") {
      const wid = currentWine.id;
      const on = isFav(wid);
      actions.innerHTML = `<button type="button" class="icon-btn fav ${on ? "on" : ""}" onclick="toggleFav('${wid}')" aria-label="${t("wine.fav")}">${on ? "♥" : "♡"}</button><button type="button" class="icon-btn" onclick="openWineMenu()" aria-label="${t("wine.more")}">···</button>`;
    } else actions.innerHTML = "";
  }
  const hi = screenId === "scan" ? "scan" : (ROOT_IDS[screenId] ? screenId : (tabOwner || "home"));
  document.querySelectorAll(".tab").forEach(btn => {
    const on = btn.dataset.go === hi;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
  const close = document.getElementById("cam-close");
  if (close) close.hidden = !live;
  onBarScroll();
}
function onBarScroll() {
  const title = document.getElementById("topbar-title");
  const bar = document.getElementById("topbar");
  const h1 = document.querySelector(".screen.active h1");
  if (!title || !bar || bar.hidden || !h1) return;
  title.classList.toggle("on", h1.getBoundingClientRect().bottom < bar.getBoundingClientRect().bottom + 2);
}
function applyCellarSeg() {
  const when = cellarSeg === "cuando";
  const lista = document.getElementById("cellar-lista");
  const box = document.getElementById("cellar-when");
  if (lista) lista.hidden = when;
  if (box) box.hidden = !when;
  const a = document.getElementById("seg-lista");
  const b = document.getElementById("seg-cuando");
  if (a) a.classList.toggle("on", !when);
  if (b) b.classList.toggle("on", when);
}
function setCellarSeg(seg) {
  cellarSeg = seg === "cuando" ? "cuando" : "lista";
  applyCellarSeg();
  if (cellarSeg === "cuando" && typeof renderCalendar === "function") renderCalendar();
  if (!navReady || navSilent) return;
  const st = stateNow("cellar", { tab: "cellar", depth: (history.state && history.state.depth) || 0 });
  try { history.replaceState(st, "", hashFor(st)); } catch (e) {}
}
function goBack() {
  if (typeof hideSheets === "function") hideSheets();
  if (history.state && history.state.depth > 0) history.back();
  else show(tabOwner || "home", { tab: true });
}
function restoreFromState(st) {
  st = st || { screen: "home", tab: "home", depth: 0 };
  tabOwner = st.tab || (ROOT_IDS[st.screen] ? st.screen : "home");
  cellarSeg = st.seg === "cuando" ? "cuando" : "lista";
  zonaName = st.zone || "";
  caveOpen = st.cave || "";
  navSilent = true;
  try {
    if ((st.screen === "wine" || st.screen === "wine-sub") && st.wineId && typeof openWine === "function") {
      const bot = st.bottleUid && state.bottles ? state.bottles.find(b => b.uid === st.bottleUid) : null;
      currentBottle = bot || null;
      if (st.screen === "wine-sub" && st.sub && typeof openWineSub === "function") {
        openWine(st.wineId, currentBottle);
        openWineSub(st.sub);
      } else openWine(st.wineId, currentBottle);
    } else if (st.screen === "dish" && st.dish && typeof openDish === "function") openDish(st.dish);
    else if (st.screen === "perfil-sub" && st.perfil && typeof openPerfilSub === "function") openPerfilSub(st.perfil);
    else if (st.screen === "zonas" && st.zone && typeof openZona === "function") openZona(st.zone);
    else if (st.screen === "cave-detail-screen" && st.cave && typeof openCave === "function") openCave(st.cave);
    else reveal(st.screen || "home");
  } finally {
    navSilent = false;
  }
  syncChrome();
  const sc = document.querySelector("#" + (screenId || "home") + " .scroll");
  if (sc) sc.scrollTop = Number(st.scroll) || 0;
}
function onPopState(ev) {
  if (pendingTab) {
    const st = pendingTab;
    pendingTab = null;
    tabOwner = st.tab || "home";
    cellarSeg = st.seg === "cuando" ? "cuando" : "lista";
    zonaName = "";
    try { history.replaceState(st, "", hashFor(st)); } catch (e) {}
    navSilent = true;
    try { reveal(st.screen); } finally { navSilent = false; }
    return;
  }
  restoreFromState(ev.state || { screen: "home", tab: "home", depth: 0, seg: "lista" });
}
window.addEventListener("popstate", onPopState);
document.addEventListener("scroll", onBarScroll, true);
document.addEventListener("DOMContentLoaded", () => {
  navReady = true;
  if (!history.state) {
    history.replaceState(stateNow("home", { depth: 0, tab: "home", seg: "lista" }), "", "#home");
  }
});
function typeLabel(kind) {
  const key = "type." + typeKey(kind || "otro");
  const hit = t(key);
  return hit === key ? (kind ? String(kind) : t("type.otro")) : hit;
}
function fold(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[·•]/g, "");
}
function starsRow(score5) {
  const full = Math.round(score5);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}
function waitMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function todayIso() {
  const d = today();
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function isoFromTs(ts) {
  const d = new Date(Number(ts) || Date.now());
  const p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function normTxt(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function escHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function showSheet(id) {
  fillSelects();
  if (id === "add-sheet") {
    if ($("#add-inbox-uid")) $("#add-inbox-uid").value = "";
    const cellar = currentWine ? preferredCellar(currentWine, currentBottle && currentBottle.price) : "v1";
    $("#add-cellar").value = cellar;
    if ($("#add-bin")) $("#add-bin").dataset.touched = "";
    $("#add-qty").value = "1";
    paintFreeSlots();
    refreshAddKeep();
  }
  if (id === "move-sheet" && currentBottle) {
    $("#move-cellar").value = currentBottle.cellarId;
    $("#move-bin").value = currentBottle.bin || "";
    if ($("#move-qty")) $("#move-qty").value = currentBottle.qty;
    if ($("#move-hint")) $("#move-hint").textContent = t("move.hint", { n: currentBottle.qty, where: (cellarName(currentBottle.cellarId) + " " + (currentBottle.bin || "")).trim() });
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
function clock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const d = new Date();
  el.textContent = d.toTimeString().slice(0, 5);
}
function formatBytes(n) {
  n = Number(n) || 0;
  if (n < 1024) return Math.round(n) + " B";
  if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
  return (n / 1048576).toFixed(1) + " MB";
}
function downloadFile(name, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

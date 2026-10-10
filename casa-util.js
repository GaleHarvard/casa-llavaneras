/* Utilidades compartidas de Casa Llavaneras. */
const NOW = new Date(2026, 8, 22);
const YEAR = NOW.getFullYear();
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
  if (typeof langRefresh !== "undefined" && langRefresh) opts.replace = true;
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
  if (id === "bebidas") renderBebidas();
  if (id === "balance") renderBalance();
  mountLabelThumbs(document.getElementById(id));
}
function backCaption() {
  const p = navStack[navStack.length - 1];
  if (!p) return t("nav.home");
  const names = {
    home: "nav.home", caves: "nav.caves", "cave-detail-screen": "nav.cave",
    cellar: "nav.bottles", calendar: "nav.dates", pairings: "nav.table", scan: "nav.scan", inbox: "nav.inbox",
    perfil: "nav.profile", "perfil-sub": "nav.profile", zonas: "nav.zones", catas: "nav.tastings", bebidas: "nav.drinks", balance: "nav.balance",
    dish: "nav.dish", wine: "nav.wine", "wine-sub": "nav.wine"
  };
  if (p.id === "wine" && p.wineId) {
    const w = wineById(p.wineId);
    return w ? w.producer.split(" ").slice(0, 2).join(" ") : t("nav.wine");
  }
  return names[p.id] ? t(names[p.id]) : t("nav.back");
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
  const d = new Date();
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

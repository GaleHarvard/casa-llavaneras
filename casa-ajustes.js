/* Avisos, perfil y ajustes. */
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
  if ($("#n-stock")) $("#n-stock").checked = n.stock !== false;
  if ($("#stock-notices")) $("#stock-notices").innerHTML = stockNoticesHtml();
  const perm = typeof Notification === "undefined" ? "unsupported" : Notification.permission;
  const tip = {
    granted: t("notify.granted"),
    denied: t("notify.denied"),
    default: t("notify.default"),
    unsupported: t("notify.unsupported")
  };
  $("#notify-perm").textContent = tip[perm] || tip.default;
  refreshBackupReminder();
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
    toast(t("notify.noWeb"));
    return;
  }
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (!standalone) {
    toast(t("notify.homeScreen"));
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
    toast(t("notify.on"));
    runNotifyCheck(true);
  } else if (perm === "denied") {
    toast(t("notify.iosSettings"));
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
async function testNotification() {
  forceOnce = true;
  const n = notifyPrefs();
  n.on = true;
  save();
  if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
    await enableNotifications();
  }
  await pushNote("Casa Llavaneras", t("notify.testBody"), "test", "home");
  forceOnce = false;
  toast(t("notify.testSent"));
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
    pushNote(t("notify.tempTitle", { t: main.tHigh.toFixed(1) }), t("notify.tempBody"), "temp", "caves");
  }
  if (n.evolve && alerts.length) {
    const w = wineById(alerts[0].wineId);
    pushNote(t("notify.soonTitle"), t("notify.soonBody", { wine: w.producer + " " + w.name + " " + w.vintage, n: alerts.length, s: alerts.length > 1 ? t("notify.soonS") : "" }), "evolve", "calendar");
  }
  if (n.ready && ready.length) {
    const w = wineById(ready[0].wineId);
    pushNote(t("notify.peakTitle"), t("notify.peakBody", { wine: w.producer + " " + w.name }), "ready", "home");
  }
  if (n.stock !== false) maybeStockPush();
  forceOnce = false;
}
function renderPerfil() {
  const p = prefs();
  const house = (state.houses[0] && state.houses[0].name) || "Casa Llavaneras";
  $("#perfil-body").innerHTML = `
    <div class="hero">
      <p class="eyebrow">${t("eyebrow.cellar")}</p>
      <h1>${t("profile.h1")}</h1>
      <p>${t("profile.lead")}</p>
    </div>
    <div class="card" style="display:flex;gap:14px;align-items:center">
      <img src="apple-touch-icon.png" alt="" style="width:64px;height:64px;border-radius:32px;border:1px solid rgba(198,163,90,.4)">
      <div>
      <p class="tiny">${t("profile.collection")}</p>
      <h3 style="margin-top:4px">${t("profile.houseLine", { house: house })}</h3>
      <p class="muted">${t("profile.counts", { b: totalBottles(), w: uniqueWines() })}</p>
      </div>
      <div class="temp-grid" style="margin-top:12px">
        <div class="temp"><span class="tiny">${t("profile.bottles")}</span><b>${totalBottles()}</b></div>
        <div class="temp"><span class="tiny">${t("profile.wines")}</span><b>${uniqueWines()}</b></div>
      </div>
      <p class="tiny" style="margin-top:12px">${t("profile.lastCopy")}</p>
      <p>${fmtBackup(p.lastBackup)}</p>
      <p class="tiny app-version" style="margin-top:8px">${t("home.version", { v: APP_VERSION })}</p>
    </div>
    ${langPickerHtml()}
    ${p.demo ? `<div class="card"><div class="row"><strong>${t("profile.demo")}</strong><button class="btn btn-ghost" onclick="exitDemo()">${t("profile.demoOut")}</button></div><p class="tiny" style="margin-top:6px">${t("profile.demoHint")}</p></div>` : ""}
    <div class="card" role="button" onclick="openPerfilSub('casas')"><div class="row"><h3>${t("profile.houses")}</h3><span>›</span></div><p class="muted">${t("profile.housesSub")}</p></div>
    <div class="card" role="button" onclick="openPerfilSub('cata')"><div class="row"><h3>${t("profile.tastePrefs")}</h3><span>›</span></div><p class="muted">${t("profile.tastePrefsSub", { n: p.scale })}</p></div>
    <div class="card" role="button" onclick="openPerfilSub('fuentes')"><div class="row"><h3>${t("profile.sources")}</h3><span>›</span></div><p class="muted">${t("profile.sourcesSub")}</p></div>
    <div class="card" role="button" onclick="openPerfilSub('privacidad')"><div class="row"><h3>${t("profile.privacy")}</h3><span>›</span></div><p class="muted">${t("profile.privacySub")}</p></div>
    <div class="card" role="button" onclick="show('bebidas')"><div class="row"><h3>${t("home.drinks")}</h3><span>›</span></div><p class="muted">${t("profile.drinksSub")}</p></div>
    <div class="card" role="button" onclick="openPerfilSub('backup')"><div class="row"><h3>${t("profile.backup")}</h3><span>›</span></div><p class="muted">${t("profile.backupSub")}</p></div>
    <div class="card" role="button" onclick="openPerfilSub('acerca')"><div class="row"><h3>${t("profile.about")}</h3><span>›</span></div><p class="muted">${t("profile.aboutSub", { v: APP_VERSION })}</p></div>
    <input id="restore-file" type="file" accept="application/json,.json" hidden onchange="reviewRestore(this.files[0])" />
    <input id="import-csv" type="file" accept=".csv,text/csv" hidden onchange="importCsv(this.files[0])" />`;
}
function openPerfilSub(kind) {
  perfilKind = kind || "";
  const p = prefs();
  const titles = {
    casas: t("profile.locations"),
    cata: t("profile.tastePrefs"),
    fuentes: t("profile.sourcesTitle"),
    privacidad: t("profile.privacy"),
    backup: t("profile.backup"),
    acerca: t("profile.about")
  };
  let body = "";
  if (kind === "casas") {
    body = state.houses.map(h => {
      const caves = state.vinotecas.filter(v => (v.houseId || "h1") === h.id);
      return `<div class="card"><p class="tiny">${h.type || t("profile.houseType")}</p><h3>${h.name}</h3>
        ${caves.map(v => `<p class="muted" style="margin-top:6px">· ${v.name} · ${v.used || 0}/${v.capacity} · ${v.tHigh} °C</p>`).join("") || `<p class="muted">${t("profile.noCellars")}</p>`}
      </div>`;
    }).join("") + `<button class="btn btn-gold" style="width:100%" onclick="showSheet('cave-sheet')">${t("caves.add")}</button>
      <p class="tiny" style="margin-top:10px">${t("profile.houseField")}</p>`;
  } else if (kind === "cata") {
    body = `
      <div class="card"><p class="tiny">${t("profile.scale")}</p>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn ${p.scale===10?"btn-gold":"btn-ghost"}" onclick="setPref('scale',10)">0–10</button>
          <button class="btn ${p.scale===100?"btn-gold":"btn-ghost"}" onclick="setPref('scale',100)">0–100</button>
        </div>
        <p class="muted" style="margin-top:8px">${t("profile.scaleHint")}</p>
      </div>
      <label class="switch-row"><span>${t("profile.decimals")}</span><input type="checkbox" ${p.decimals?"checked":""} onchange="setPref('decimals', this.checked)" /></label>`;
  } else if (kind === "fuentes") {
    const rows = [
      ["vivino","Vivino"],["penin","Peñín"],["parker","Parker"],
      ["spectator","Wine Spectator"],["decanter","Decanter"],["vinous","Vinous"],["suckling","James Suckling"]
    ];
    body = `<p class="muted" style="margin-bottom:10px">${t("profile.sourcesHint")}</p>` +
      rows.map(([k,l]) => `<label class="switch-row"><span>${l}</span><input type="checkbox" ${p.sources[k]!==false?"checked":""} onchange="setSource('${k}', this.checked)" /></label>`).join("");
  } else if (kind === "privacidad") {
    body = `
      <label class="switch-row"><span>${t("profile.showValue")}</span><input type="checkbox" ${p.hideValue?"":"checked"} onchange="setPref('hideValue', !this.checked)" /></label>
      <label class="switch-row"><span>${t("profile.showPrices")}</span><input type="checkbox" ${p.hidePrices?"":"checked"} onchange="setPref('hidePrices', !this.checked)" /></label>
      <label class="switch-row"><span>${t("profile.showBin")}</span><input type="checkbox" ${p.hideBin?"":"checked"} onchange="setPref('hideBin', !this.checked)" /></label>
      <div class="card" style="margin-top:12px"><p class="tiny">${t("profile.face")}</p><p class="muted" style="margin-top:6px">${t("profile.faceHint")}</p></div>`;
  } else if (kind === "backup") {
    body = `
      <div class="card"><p class="tiny">${t("profile.lastCopy")}</p><h3 style="margin-top:4px">${fmtBackup(p.lastBackup)}</h3><p class="muted">${p.lastBackup ? t("profile.copyOk") : t("profile.copyDue")}</p></div>
      <p class="muted" style="margin:0 0 12px">${t("profile.copyLead")}</p>
      <button class="btn btn-gold" style="width:100%" onclick="exportBackup()">${t("profile.exportNow")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="exportCsv()">${t("profile.exportCsv")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="exportTastingCsv()">${t("profile.exportTastings")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="$('#restore-file').click()">${t("profile.restore")}</button>
      <p class="tiny" style="margin:12px 0">${t("profile.restoreHint")}</p>
      <button class="btn btn-ghost" style="width:100%" onclick="askWipe()">${t("profile.wipe")}</button>`;
  } else {
    body = `
      <div class="card"><h3>${t("profile.aboutApp")}</h3><p class="muted" style="margin-top:6px">${t("home.version", { v: APP_VERSION })}</p>
        <p class="tiny" style="margin-top:10px">${t("profile.schema", { b: totalBottles(), w: uniqueWines(), c: state.vinotecas.length })}</p>
        <p class="tiny" id="about-labels">${t("profile.labels", { n: countOwnLabels() })}</p>
        <p class="tiny">${t("profile.lastLine", { when: fmtBackup(p.lastBackup) })}</p>
        <div id="about-storage"><p class="tiny" style="margin-top:10px">${t("profile.checking")}</p></div>
      </div>
      <p class="muted">${t("profile.private")}</p>`;
  }
  $("#perfil-sub-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">${t("eyebrow.cellar")}</p>
    <h1>${titles[kind]}</h1>
    ${body}`;
  show("perfil-sub");
  if (kind === "acerca") fillAboutStorage();
}
function setPref(key, val) {
  prefs()[key] = val;
  save();
  renderPerfil();
  if (document.getElementById("perfil-sub").classList.contains("active") && perfilKind) openPerfilSub(perfilKind);
  if (key === "hideValue" || key === "hidePrices" || key === "hideBin") renderHome();
}
function setSource(key, on) {
  prefs().sources[key] = !!on;
  save();
}
function fillAboutStorage() {
  const el = document.getElementById("about-storage");
  if (!el) return;
  const paint = (persistent, space) => {
    const box = document.getElementById("about-storage");
    if (!box) return;
    box.innerHTML = `<p class="tiny" style="margin-top:10px">${t("profile.persist")}</p><p>${persistent}</p><p class="tiny" style="margin-top:8px">${t("profile.used")}</p><p>${space}</p>`;
  };
  const paintLabels = (n) => {
    const line = document.getElementById("about-labels");
    if (line) line.textContent = t("profile.labels", { n: n });
  };
  Promise.resolve().then(async () => {
    let persistent = t("profile.persistUnknown");
    let space = t("profile.spaceUnknown");
    try {
      if (navigator.storage && typeof navigator.storage.persisted === "function") {
        persistent = (await navigator.storage.persisted())
          ? t("profile.persistYes")
          : t("profile.persistNo");
      }
    } catch (e) {}
    try {
      if (navigator.storage && typeof navigator.storage.estimate === "function") {
        const est = await navigator.storage.estimate();
        const used = formatBytes(est && est.usage);
        const quota = est && est.quota ? formatBytes(est.quota) : "";
        space = quota ? t("profile.spaceOf", { used: used, quota: quota }) : used;
      }
    } catch (e) {}
    paint(persistent, space);
    try {
      const labels = await readLabelPhotos();
      const fromDb = labels && typeof labels === "object" ? countOwnLabels(labels) : 0;
      paintLabels(fromDb || countOwnLabels());
    } catch (e) { paintLabels(countOwnLabels()); }
  });
}
function exitDemo() {
  prefs().demo = false;
  save();
  toast(t("profile.demoLeft"));
  renderPerfil();
}

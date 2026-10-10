/* Bebidas, motivos de salida y balance. */
const EXIT_REASONS = [
  { id: "bebida", label: "Bebida" },
  { id: "regalada", label: "Regalada" },
  { id: "defecto", label: "Defectuosa / corcho" },
  { id: "vendida", label: "Vendida" },
  { id: "otro", label: "Otro" }
];
function reasonLabel(c) {
  const raw = c && (c.reason || c.id) ? String(c.reason || c.id) : "bebida";
  const id = raw === "Bebida" ? "bebida" : raw;
  const key = "reason." + id;
  const hit = t(key);
  return hit === key ? raw : hit;
}
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function consumptionThumb(c) {
  const live = c.wineId && wineById(c.wineId);
  if (live) return labelThumbHtml(live);
  if (c.label && String(c.label).indexOf("data:") !== 0) return `<img class="label-thumb" alt="" src="${escHtml(c.label)}">`;
  return labelThumbHtml({ id: c.wineId || "", producer: c.producer, name: c.name, vintage: c.vintage, type: c.type });
}
function renderBebidas() {
  const el = $("#bebidas-body");
  if (!el) return;
  const all = (state.consumption || []).slice().sort((a, b) => (b.at || 0) - (a.at || 0));
  const filters = [{ id: "todas" }].concat(EXIT_REASONS);
  const chips = `<div class="chip-row" style="margin-top:12px">${filters.map(f => `<button type="button" class="chip ${bebidaFilter === f.id ? "on" : ""}" onclick="setBebidaFilter('${f.id}')">${f.id === "todas" ? t("reason.todas") : reasonLabel(f)}</button>`).join("")}</div>`;
  const head = `<button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <div class="hero"><p class="eyebrow">${t("kicker.history")}</p><h1>${t("drinks.h1")}</h1><p>${t("drinks.lead")}</p></div>${chips}`;
  const list = all.filter(c => bebidaFilter === "todas" || (c.reason || "bebida") === bebidaFilter);
  if (!all.length) {
    el.innerHTML = head + `<p class="empty">${t("drinks.empty")}</p>`;
    return;
  }
  if (!list.length) {
    el.innerHTML = head + `<p class="empty">${t("drinks.none")}</p>`;
    return;
  }
  const byYear = {};
  list.forEach(c => {
    const y = String((c.date || isoFromTs(c.at)).slice(0, 4) || "—");
    (byYear[y] = byYear[y] || []).push(c);
  });
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));
  const blocks = years.map(y => {
    const rows = byYear[y];
    const n = rows.reduce((s, c) => s + (Number(c.qty) || 1), 0);
    const reasons = {};
    rows.forEach(c => {
      const r = reasonLabel(c);
      reasons[r] = (reasons[r] || 0) + (Number(c.qty) || 1);
    });
    const reasonLine = Object.keys(reasons).map(r => r + " " + reasons[r]).join(" · ");
    const byMonth = {};
    rows.forEach(c => {
      const mk = String(c.date || isoFromTs(c.at)).slice(0, 7);
      (byMonth[mk] = byMonth[mk] || []).push(c);
    });
    const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a)).map(mk => {
      const cards = byMonth[mk].map(c => {
        const when = c.date ? formatDate(c.date) : "";
        const occ = c.reason === "bebida" || !c.reason ? occasionLabel(c.occasion) : "";
        const bits = [when, reasonLabel(c), occ, c.people, c.rating ? starsRow(c.rating) : ""].filter(Boolean).join(" · ");
        return `<div class="card" style="margin-top:8px">
          <div class="bottle-row">
            ${consumptionThumb(c)}
            <div class="meta">
              <div class="row"><h3>${escHtml(c.producer || t("drinks.producer"))}</h3><span class="badge">${escHtml(reasonLabel(c))}</span></div>
              <p>${escHtml(c.name || t("drinks.wine"))} ${escHtml(String(c.vintage || ""))}${c.qty > 1 ? " · " + t("drinks.bottles", { n: c.qty }) : ""}</p>
              <p class="tiny">${escHtml(bits)}</p>
              ${c.note ? `<p class="muted">${escHtml(c.note)}</p>` : ""}
              <div class="btn-row">
                ${(c.reason || "bebida") === "bebida" ? `<button class="btn btn-gold" onclick="startTastingForConsumption('${c.id}')">${t("drinks.addTaste")}</button>` : ""}
                <button class="btn btn-ghost" onclick="editConsumption('${c.id}')">${t("drinks.edit")}</button>
                <button class="btn btn-ghost" onclick="deleteConsumption('${c.id}')">${t("drinks.delete")}</button>
              </div>
            </div>
          </div>
        </div>`;
      }).join("");
      return `<h2 class="cal-h">${formatMonth(mk) || mk}</h2>${cards}`;
    }).join("");
    return `<div class="card" style="margin-top:12px"><div class="row"><h3>${escHtml(y)}</h3><span class="badge">${n} ${nounBottles(n)}</span></div><p class="muted" style="margin-top:6px">${escHtml(reasonLine)}</p></div>${months}`;
  }).join("");
  el.innerHTML = head + blocks;
  mountLabelThumbs(el);
}
function setBebidaFilter(id) {
  bebidaFilter = id || "todas";
  renderBebidas();
}
function balanceTypeOf(w) {
  const t = String((w && w.type) || "").toLowerCase();
  if (t === "rose") return "rosado";
  if (["tinto", "blanco", "espumoso", "rosado", "dulce", "generoso"].indexOf(t) >= 0) return t;
  return "otro";
}
function balanceRows() {
  const byWine = {};
  (state.bottles || []).forEach(b => {
    const w = wineById(b.wineId);
    if (!w) return;
    const row = byWine[w.id] || (byWine[w.id] = {
      id: w.id, wine: w, qty: 0, cost: 0, marketEach: unitMarket(w)
    });
    const qty = Number(b.qty) || 0;
    row.qty += qty;
    row.cost += (Number(b.price) || 0) * qty;
  });
  return Object.keys(byWine).map(id => byWine[id]);
}
function renderBalance() {
  const el = $("#balance-body");
  if (!el) return;
  const hidden = !!(state.prefs && state.prefs.hideValue);
  const rows = balanceRows();
  const bottles = rows.reduce((n, r) => n + r.qty, 0);
  const cost = rows.reduce((n, r) => n + r.cost, 0);
  const market = rows.reduce((n, r) => n + (r.marketEach > 0 ? r.marketEach * r.qty : 0), 0);
  const diff = market - cost;
  const pct = cost > 0 ? Math.round((diff / cost) * 100) : null;
  const money = n => hidden ? "—" : euro(n);
  const types = ["tinto", "blanco", "espumoso", "rosado", "dulce", "generoso", "otro"];
  const byType = {};
  rows.forEach(r => {
    const key = balanceTypeOf(r.wine);
    const box = byType[key] || (byType[key] = { qty: 0, cost: 0, market: 0 });
    box.qty += r.qty;
    box.cost += r.cost;
    if (r.marketEach > 0) box.market += r.marketEach * r.qty;
  });
  const typeHtml = types.filter(kind => byType[kind]).map(kind => {
    const box = byType[kind];
    const d = box.market - box.cost;
    return `<div class="card" style="margin-top:8px"><div class="row"><h3>${typeLabel(kind)}</h3><span class="tiny">${box.qty} ${t("balance.bot")}</span></div><p class="muted" style="margin-top:6px">${t("balance.line", { c: money(box.cost), m: money(box.market), d: hidden ? "—" : ((d >= 0 ? "+" : "") + euro(d)) })}</p></div>`;
  }).join("");
  const gains = rows.filter(r => r.marketEach > 0 && r.cost > 0).map(r => {
    const m = r.marketEach * r.qty;
    return { row: r, gain: m - r.cost, pct: Math.round(((m - r.cost) / r.cost) * 100) };
  }).sort((a, b) => b.gain - a.gain).slice(0, 5);
  const gainHtml = gains.length ? gains.map(g => `<div class="card" style="margin-top:8px"><div class="row"><h3>${escHtml(g.row.wine.producer)}</h3><span class="badge ${g.gain >= 0 ? "ok" : "late"}">${hidden ? "—" : ((g.gain >= 0 ? "+" : "") + euro(g.gain))}</span></div><p class="muted">${escHtml(g.row.wine.name)} ${escHtml(String(g.row.wine.vintage || ""))} · ${hidden ? "" : (g.pct >= 0 ? "+" : "") + g.pct + "%"}</p></div>`).join("") : `<p class="empty">${t("balance.noMarket")}</p>`;
  const missing = rows.filter(r => !(r.marketEach > 0));
  const missingQty = missing.reduce((n, r) => n + r.qty, 0);
  const missingHtml = missing.length ? `<div class="card" style="margin-top:12px"><h3>${missingQty === 1 ? t("balance.missing1") : t("balance.missing", { n: missingQty })}</h3><p class="muted" style="margin-top:6px">${missing.map(r => escHtml(r.wine.producer + " " + r.wine.name)).join(" · ")}</p><div class="btn-row"><button class="btn btn-gold" onclick="estimateMissingMarket()">${t("balance.estimate")}</button><button class="btn btn-ghost" onclick="editMissingMarket()">${t("balance.edit")}</button></div><div id="balance-edit"></div></div>` : `<p class="tiny" style="margin-top:12px">${t("balance.allHave")}</p>`;
  el.innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <div class="hero"><p class="eyebrow">${t("kicker.collection")}</p><h1>${t("balance.h1")}</h1><p>${t("balance.lead")}</p></div>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">${t("home.inCellar")}</span><b>${bottles}</b></div>
      <div class="temp"><span class="tiny">${t("balance.cost")}</span><b>${money(cost)}</b></div>
      <div class="temp"><span class="tiny">${t("balance.market")}</span><b>${money(market)}</b></div>
      <div class="temp"><span class="tiny">${t("balance.diff")}</span><b>${hidden ? "—" : ((diff >= 0 ? "+" : "") + euro(diff))}</b></div>
    </div>
    <p class="tiny" style="margin:8px 0 0">${pct == null || hidden ? t("balance.noPct") : t("balance.pct", { p: (pct >= 0 ? "+" : "") + pct })}</p>
    <h2 style="margin-top:16px">${t("balance.byType")}</h2>
    ${typeHtml || `<p class="empty">${t("balance.empty")}</p>`}
    <h2 style="margin-top:16px">${t("balance.gaps")}</h2>
    ${gainHtml}
    ${missingHtml}`;
}
function editMissingMarket() {
  const box = document.getElementById("balance-edit");
  if (!box) return;
  const missing = balanceRows().filter(r => !(r.marketEach > 0));
  if (!missing.length) return toast(t("balance.allHaveToast"));
  box.innerHTML = missing.map(r => `<label class="field"><span>${escHtml(r.wine.producer)} ${escHtml(r.wine.name)}</span><input id="mkt-${r.id}" type="number" min="1" step="1" placeholder="${t("balance.perBt")}"></label>`).join("") + `<button class="btn btn-gold" style="width:100%" onclick="saveMarketEdits()">${t("balance.saveValues")}</button>`;
}
function saveMarketEdits() {
  state.marketOverrides = state.marketOverrides || {};
  let n = 0;
  balanceRows().forEach(r => {
    const el = document.getElementById("mkt-" + r.id);
    const mid = el ? Math.round(Number(el.value)) : 0;
    if (mid > 0) {
      state.marketOverrides[r.id] = Object.assign({}, state.marketOverrides[r.id] || {}, { mid: mid, source: "manual" });
      n += 1;
    }
  });
  if (!n) return toast(t("balance.needPrice"));
  save();
  toast(t("balance.saved"));
  renderBalance();
}
async function estimateMissingMarket() {
  const missing = balanceRows().filter(r => !(r.marketEach > 0));
  if (!missing.length) return toast(t("balance.allHaveToast"));
  if (!window.WineDataProvider || typeof storedGeminiKey !== "function" || !storedGeminiKey()) {
    toast(t("balance.needGemini"));
    openNotify();
    return;
  }
  toast(t("balance.estimating"));
  let got = 0;
  for (const r of missing) {
    try {
      const quote = await WineDataProvider.priceOf(r.wine);
      const mid = quote && Math.round(Number(quote.mid));
      if (mid > 0 && quote.source === "gemini") {
        state.marketOverrides = state.marketOverrides || {};
        state.marketOverrides[r.id] = { low: quote.low || null, mid: mid, high: quote.high || null, trend: quote.note || quote.trend || "", source: "gemini" };
        got += 1;
      }
    } catch (err) {}
  }
  if (got) save();
  renderBalance();
  toast(got ? t("balance.estimated", { n: got }) : t("balance.noQuote"));
}
function editConsumption(id) {
  const row = (state.consumption || []).find(c => c.id === id);
  if (!row) return;
  openServeSheet({
    mode: "edit",
    id: row.id,
    qty: row.qty || 1,
    wineId: row.wineId,
    date: row.date,
    occasion: row.occasion || "",
    people: row.people || "",
    note: row.note || "",
    rating: row.rating || null,
    reason: row.reason || "bebida",
    fallback: ((row.producer || "") + " " + (row.name || "")).trim()
  });
}
function deleteConsumption(id) {
  const row = (state.consumption || []).find(c => c.id === id);
  if (!row) return;
  const who = ((row.producer || "") + " " + (row.name || "esta bebida")).trim();
  if (!confirm("¿Borrar " + who + " del historial de bebidas?")) return;
  state.consumption = state.consumption.filter(c => c.id !== id);
  save();
  renderBebidas();
  toast(t("drinks.deleted"));
}
function logAct(text, extra) {
  state.activity = state.activity || [];
  const row = Object.assign({ at: Date.now(), text: text }, extra || {});
  state.activity.unshift(row);
  state.activity = state.activity.slice(0, 40);
  return row;
}
function readServeFields() {
  const rating = parseInt(($("#serve-rating") && $("#serve-rating").value) || "", 10);
  const reason = (pendingServe && pendingServe.reason) || "bebida";
  const bebida = reason === "bebida";
  return {
    date: ($("#serve-date") && $("#serve-date").value) || todayIso(),
    occasion: bebida ? occasionIdFrom((($("#serve-occasion") && $("#serve-occasion").value) || "").trim()) : "",
    people: bebida ? ((($("#serve-people") && $("#serve-people").value) || "").trim()) : "",
    note: (($("#serve-note") && $("#serve-note").value) || "").trim(),
    rating: bebida && rating >= 1 && rating <= 5 ? rating : null,
    reason: reason
  };
}
function paintServeStars(rating) {
  $$("#serve-stars .chip").forEach(c => c.classList.toggle("on", Number(c.dataset.star) === Number(rating)));
}
function setServeChip(id, btn) {
  const input = $("#serve-occasion");
  if (!input) return;
  const label = OCCASION_IDS.indexOf(id) >= 0 ? t("occasion." + id) : id;
  const same = occasionIdFrom(input.value.trim()) === id && OCCASION_IDS.indexOf(id) >= 0;
  $$("#serve-chips .chip").forEach(c => c.classList.remove("on"));
  if (same) { input.value = ""; return; }
  if (btn) btn.classList.add("on");
  input.value = label;
}
function syncServeChip() {
  const id = occasionIdFrom((($("#serve-occasion") && $("#serve-occasion").value) || "").trim());
  $$("#serve-chips .chip").forEach(c => c.classList.toggle("on", c.getAttribute("data-occasion") === id));
}
function setServeRating(n) {
  const cur = parseInt(($("#serve-rating") && $("#serve-rating").value) || "0", 10);
  const next = cur === n ? 0 : n;
  if ($("#serve-rating")) $("#serve-rating").value = next ? String(next) : "";
  paintServeStars(next);
}
function setExitReason(id, btn) {
  if (!pendingServe) pendingServe = {};
  pendingServe.reason = id || "bebida";
  $$("#serve-reasons .chip").forEach(c => c.classList.toggle("on", c.dataset.reason === pendingServe.reason));
  const extra = $("#serve-bebida");
  if (extra) extra.hidden = pendingServe.reason !== "bebida";
  if (btn && btn.dataset && btn.dataset.reason) btn.classList.add("on");
}
function openServeSheet(opts) {
  pendingServe = opts || null;
  if (!pendingServe) return;
  if (!pendingServe.reason) pendingServe.reason = "bebida";
  const editing = pendingServe.mode === "edit";
  if ($("#serve-title")) $("#serve-title").textContent = editing ? t("serve.edit") : t("serve.h1");
  const w = pendingServe.wineId ? wineById(pendingServe.wineId) : null;
  const name = w ? (w.producer + " " + w.name) : (pendingServe.fallback || t("serve.this"));
  if ($("#serve-hint")) {
    $("#serve-hint").textContent = editing ? name : (pendingServe.qty + " · " + name);
  }
  if ($("#serve-date")) $("#serve-date").value = pendingServe.date || todayIso();
  if ($("#serve-occasion")) {
    const raw = pendingServe.occasion || "";
    const id = occasionIdFrom(raw);
    $("#serve-occasion").value = OCCASION_IDS.indexOf(id) >= 0 ? t("occasion." + id) : raw;
  }
  if ($("#serve-people")) $("#serve-people").value = pendingServe.people || "";
  if ($("#serve-note")) $("#serve-note").value = pendingServe.note || "";
  if ($("#serve-rating")) $("#serve-rating").value = pendingServe.rating ? String(pendingServe.rating) : "";
  if ($("#serve-save")) $("#serve-save").textContent = editing ? t("serve.saveEdit") : t("serve.save");
  if ($("#serve-skip")) $("#serve-skip").textContent = editing ? t("serve.cancel") : t("serve.skip");
  setExitReason(pendingServe.reason);
  syncServeChip();
  paintServeStars(pendingServe.rating || 0);
  showSheet("serve-sheet");
}
function askServe(n) {
  if (!currentBottle) return;
  const qty = Math.min(Math.max(1, parseInt(n, 10) || 1), currentBottle.qty);
  if (qty < 1) return;
  openServeSheet({ mode: "new", qty: qty, wineId: currentBottle.wineId, bottleUid: currentBottle.uid, date: todayIso() });
}
function askServeMany() {
  if (!currentBottle) return;
  const n = parseInt(prompt(t("drinks.howMany", { n: currentBottle.qty }), "1"), 10);
  if (!n || n < 1) return;
  askServe(n);
}
function skipServe() {
  if (!pendingServe || pendingServe.mode === "edit") {
    pendingServe = null;
    hideSheets();
    return;
  }
  confirmServe(false);
}
function confirmServe(keepNote) {
  const job = pendingServe;
  if (!job) return hideSheets();
  const fields = keepNote ? readServeFields() : {
    date: ($("#serve-date") && $("#serve-date").value) || todayIso(),
    occasion: "", people: "", note: "", rating: null,
    reason: (job && job.reason) || "bebida"
  };
  if (job.mode === "edit") {
    const row = (state.consumption || []).find(c => c.id === job.id);
    if (row && keepNote) {
      const at = Date.parse((fields.date || row.date) + "T12:00:00");
      row.date = fields.date || row.date;
      if (Number.isFinite(at)) row.at = at;
      row.reason = fields.reason || "bebida";
      row.occasion = fields.occasion;
      row.people = fields.people;
      row.note = fields.note;
      row.rating = fields.rating;
      save();
      toast(t("drinks.updated"));
    }
    pendingServe = null;
    hideSheets();
    if (screenId === "bebidas") renderBebidas();
    return;
  }
  const bottle = state.bottles.find(b => b.uid === job.bottleUid) || currentBottle;
  if (!bottle) {
    pendingServe = null;
    hideSheets();
    toast(t("drinks.gone"));
    return;
  }
  const wine = wineById(bottle.wineId);
  const used = Math.min(job.qty, bottle.qty);
  const wineId = bottle.wineId;
  const entry = makeConsumption(wine, used, fields);
  const why = reasonLabel(entry);
  const verb = entry.reason === "bebida" ? "Servidas " : ("Salida " + why + " ");
  const act = logAct(verb + used + " · " + (wine ? (wine.producer + " " + wine.name) : "botella"), { type: entry.reason === "bebida" ? "serve" : "exit", qty: used, wineId: wineId, reason: entry.reason });
  entry.sourceAt = act.at;
  entry.sourceText = act.text;
  state.consumption = state.consumption || [];
  state.consumption.unshift(entry);
  bottle.qty -= used;
  if (bottle.qty <= 0) {
    state.bottles = state.bottles.filter(b => b.uid !== bottle.uid);
    currentBottle = state.bottles.find(b => b.wineId === wineId) || null;
  } else currentBottle = bottle;
  save();
  pendingServe = null;
  hideSheets();
  const left = stockOf(wineId);
  const gone = why + " · " + used;
  toast(left ? t("drinks.left", { why: why, n: used, left: left }) : t("drinks.noneLeft", { why: why, n: used }));
  openWine(wineId, currentBottle);
  if (entry.reason === "bebida") offerTasting(entry);
  if (left === 1) maybeStockPush();
}
function offerTasting(entry) {
  if (!entry || entry.reason !== "bebida") return;
  pendingCataOffer = { wineId: entry.wineId, consumptionId: entry.id, date: entry.date || todayIso() };
  const hint = $("#cata-offer-hint");
  if (hint) hint.textContent = (entry.producer || "") + " " + (entry.name || "");
  showSheet("cata-offer-sheet");
}
function acceptCataOffer() {
  const job = pendingCataOffer;
  pendingCataOffer = null;
  hideSheets();
  if (!job || !job.wineId) return;
  startTastingForConsumption(job.consumptionId);
}

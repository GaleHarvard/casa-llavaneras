/* Recuento, deseos, reservas y ficha de vino con añadas. */
function cuveeOf(wine) {
  if (!wine) return { id: "p:x:x", producer: "", name: "", appellation: "", region: "", country: "", grapes: [], vintageIds: [] };
  const id = wineParentId(wine);
  const stored = state && state.cuvees && state.cuvees[id];
  if (stored) return stored;
  return {
    id: id,
    producer: wine.producer || "",
    name: wine.name || "",
    region: wine.region || "",
    country: wine.country || "",
    appellation: wine.appellation || "",
    grapes: Array.isArray(wine.grapes) ? wine.grapes.slice() : [],
    type: wine.type || "",
    style: wine.style || "",
    vintageIds: wine.id ? [wine.id] : []
  };
}
function vintageSiblings(wine) {
  if (!wine) return [];
  const ids = (cuveeOf(wine).vintageIds || []).slice();
  if (wine.id && ids.indexOf(wine.id) < 0) ids.push(wine.id);
  const list = ids.map(wineById).filter(Boolean);
  if (wine.id && !list.some(x => x.id === wine.id)) list.push(wine);
  return list.slice().sort((a, b) => (Number(b.vintage) || 0) - (Number(a.vintage) || 0) || String(a.id).localeCompare(String(b.id)));
}
function isoAddDays(iso, n) {
  const d = new Date(String(iso || "") + "T12:00:00");
  if (!Number.isFinite(d.getTime())) return String(iso || "");
  d.setDate(d.getDate() + (Number(n) || 0));
  const p = x => String(x).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function bottleHeld(b, on) {
  if (!b || !state) return false;
  const day = on || todayIso();
  return (state.reservations || []).some(r => r && r.bottleUid === b.uid && r.date && r.date >= day);
}
function reservationForBottle(b) {
  if (!b) return null;
  const day = todayIso();
  const rows = (state.reservations || []).filter(r => r && r.bottleUid === b.uid && r.date && r.date >= day);
  rows.sort((a, c) => String(a.date).localeCompare(String(c.date)));
  return rows[0] || null;
}
function dueReservations() {
  const day = todayIso();
  return (state.reservations || []).filter(r => {
    if (!r || !r.date || r.date < day) return false;
    const lead = Math.max(0, Number(r.leadDays) || 3);
    return r.date <= isoAddDays(day, lead);
  }).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
function reservationLabel(r) {
  if (!r) return "";
  const w = wineById(r.wineId);
  const name = w ? ((w.producer || "") + " " + (w.name || "")).trim() : (r.wineId || "");
  return name;
}
function heldMark(b) {
  const r = reservationForBottle(b);
  if (!r) return "";
  const when = formatDate(r.date);
  const extra = r.occasion ? " · " + escHtml(r.occasion) : "";
  return `<span class="badge warn">${escHtml(t("wish.heldFor", { when: when }))}${extra}</span>`;
}
function vintageBlockHtml(w) {
  if (!w) return "";
  const cuvee = cuveeOf(w);
  const grapes = (cuvee.grapes && cuvee.grapes.length ? cuvee.grapes : (w.grapes || [])).join(", ");
  const place = cuvee.appellation || w.appellation || t("nodata");
  const chips = vintageSiblings(w).map(s => `<button type="button" class="chip ${s.id === w.id ? "on" : ""}" onclick="openWine('${s.id}')">${escHtml(String(s.vintage || "—"))}</button>`).join("");
  const taste = String(w.tasting || "").trim();
  const shown = taste.length > 280 ? taste.slice(0, 277) + "…" : taste;
  const from = w.aging && w.aging.drinkFrom;
  const hold = w.aging && w.aging.holdTo;
  const windowTxt = from ? (from + "–" + (hold || "")) : t("nodata");
  const price = w.priceHint ? (w.priceHint + " · " + t("fact.orientative")) : t("nodata");
  const lot = (state.bottles || []).find(b => b.wineId === w.id && bottleHeld(b)) || (state.bottles || []).find(b => b.wineId === w.id);
  const mark = lot && bottleHeld(lot) ? `<p style="margin-top:8px">${heldMark(lot)}</p>` : "";
  const reserve = lot ? `<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openDeseos('${lot.uid}')">${t("wish.reserve")}</button>` : "";
  return `<div id="vintage-block">
    <p class="tiny" style="margin-top:10px">${t("vintage.wine")}</p>
    <p class="muted">${escHtml(place)}${grapes ? " · " + escHtml(grapes) : ""}</p>
    <div class="chip-row" style="margin-top:8px">${chips}</div>
    <div class="card" style="margin-top:8px">
      <p class="tiny">${t("vintage.this")} ${escHtml(String(w.vintage || "—"))}</p>
      <p style="margin-top:6px">${shown ? escHtml(shown) : escHtml(t("nodata"))}</p>
      <p class="muted" style="margin-top:6px">${escHtml(t("vintage.window"))}: ${escHtml(String(windowTxt))} · ${escHtml(t("vintage.price"))}: ${escHtml(price)}</p>
      ${mark}
    </div>
    ${reserve}
  </div>`;
}
function reservationNoticesHtml() {
  const rows = dueReservations();
  if (!rows.length) return "";
  return rows.map(r => `<div class="card" style="margin-top:8px" onclick="event.stopPropagation();openWine('${r.wineId || ""}')">
    <h3>${escHtml(t("wish.notice", { wine: reservationLabel(r) }))}</h3>
    <p class="muted" style="margin-top:6px">${escHtml(formatDate(r.date))}${r.occasion ? " · " + escHtml(r.occasion) : ""}</p>
  </div>`).join("");
}
function countUnits(cellar) {
  if (!cellar) return [];
  if (typeof migrateOneCave === "function") migrateOneCave(cellar, state.bottles || []);
  const units = [];
  const covered = {};
  (((cellar.layout && cellar.layout.zones) || [])).forEach(z => {
    if (z.kind === "free") {
      const codes = typeof zoneCodes === "function" ? zoneCodes(z) : [];
      codes.forEach(c => { covered[c] = 1; });
      units.push({ id: z.id || ("z" + units.length), name: z.name || t("count.zone"), kind: "zone", codes: codes });
      return;
    }
    (z.rows || []).forEach(r => {
      const codes = typeof rowCodes === "function" ? rowCodes(r) : [];
      codes.forEach(c => { covered[c] = 1; });
      units.push({
        id: r.id || ("r" + units.length),
        name: [z.name, r.name || r.prefix].filter(Boolean).join(" · ") || t("count.shelf"),
        kind: "shelf",
        codes: codes
      });
    });
  });
  const loose = [];
  (state.bottles || []).forEach(b => {
    if (b.cellarId !== cellar.id || !b.bin || covered[b.bin]) return;
    if (loose.indexOf(b.bin) < 0) loose.push(b.bin);
  });
  if (loose.length) units.push({ id: "loose", name: t("layout.unplaced"), kind: "zone", codes: loose });
  if ((state.bottles || []).some(b => b.cellarId === cellar.id && !b.bin)) {
    units.push({ id: "nobin", name: t("layout.unplaced"), kind: "zone", codes: [], nobin: true });
  }
  return units;
}
function linesForUnit(cellarId, unit) {
  return (state.bottles || []).filter(b => {
    if (!b || b.cellarId !== cellarId) return false;
    if (unit.nobin) return !b.bin;
    return !!(b.bin && (unit.codes || []).indexOf(b.bin) >= 0);
  }).map(b => ({
    bottleUid: b.uid,
    wineId: b.wineId,
    bin: b.bin || "",
    expected: Number(b.qty) || 0,
    found: Number(b.qty) || 0,
    reason: "otro"
  }));
}
function countWineName(line) {
  const w = line && wineById(line.wineId);
  if (!w) return line && line.wineId || t("serve.this");
  return [w.producer, w.name, w.vintage].filter(Boolean).join(" ");
}
function countLine(uid) {
  const d = state.countDraft;
  if (!d) return null;
  let hit = null;
  (d.units || []).forEach(u => (u.lines || []).forEach(line => { if (line.bottleUid === uid) hit = line; }));
  return hit;
}
function countDiffs(d) {
  const missing = [];
  const extra = [];
  let present = 0;
  (d && d.units || []).forEach(u => {
    (u.lines || []).forEach(line => {
      const exp = Number(line.expected) || 0;
      const found = Number(line.found) || 0;
      const name = countWineName(line);
      if (found < exp) missing.push({ bottleUid: line.bottleUid, wineId: line.wineId, bin: line.bin, n: exp - found, name: name, unit: u.name, reason: line.reason || "otro" });
      if (found > exp) extra.push({ id: "over-" + line.bottleUid, label: name, n: found - exp, bin: line.bin, wineId: line.wineId, unit: u.name, added: true });
      present += Math.min(found, exp);
    });
    (u.extras || []).forEach(x => extra.push(x));
  });
  return { missing: missing, extra: extra, present: present };
}
function startCount(cellarId) {
  const v = (state.vinotecas || []).find(x => x.id === cellarId) || (state.vinotecas || [])[0];
  if (!v) return toast(t("profile.noCellars"));
  const built = countUnits(v).map(u => ({
    id: u.id,
    name: u.name,
    kind: u.kind,
    codes: u.codes || [],
    nobin: !!u.nobin,
    lines: linesForUnit(v.id, u),
    extras: []
  }));
  const occupied = built.filter(u => u.lines.length);
  const empty = built.filter(u => !u.lines.length);
  state.countDraft = {
    id: "cnt" + Date.now().toString(36),
    cellarId: v.id,
    cellarName: v.name || "",
    date: todayIso(),
    at: Date.now(),
    index: 0,
    phase: "walk",
    units: occupied.concat(empty)
  };
  save();
  show("recuento");
}
function openRecuento(cellarId) {
  if (cellarId && (!state.countDraft || state.countDraft.cellarId !== cellarId)) startCount(cellarId);
  else show("recuento");
}
function setCountFound(uid, found) {
  const line = countLine(uid);
  if (!line) return;
  const n = Math.max(0, parseInt(found, 10) || 0);
  line.found = n;
  save();
  renderRecuento();
}
function setCountReason(uid, reason) {
  const line = countLine(uid);
  if (!line) return;
  line.reason = reason || "otro";
  save();
  renderRecuento();
}
function addCountExtra() {
  const d = state.countDraft;
  if (!d || !d.units || !d.units.length) return;
  const u = d.units[d.index] || d.units[0];
  const input = document.getElementById("count-extra-name");
  const label = (input && input.value || "").trim();
  if (!label) return toast(t("wish.needName"));
  u.extras = u.extras || [];
  u.extras.push({ id: "x" + Date.now().toString(36), label: label, unit: u.name, bin: "" });
  save();
  renderRecuento();
}
function countStep(dir) {
  const d = state.countDraft;
  if (!d || !d.units) return;
  if (d.phase === "summary") {
    d.phase = "walk";
    d.index = Math.max(0, d.units.length - 1);
  } else {
    const next = d.index + dir;
    if (next >= d.units.length) d.phase = "summary";
    else d.index = Math.max(0, next);
  }
  save();
  renderRecuento();
}
function countSkipEmpty() {
  const d = state.countDraft;
  if (!d || !d.units) return;
  let i = d.index + 1;
  while (i < d.units.length && !(d.units[i].lines || []).length && !(d.units[i].extras || []).length) i += 1;
  if (i >= d.units.length) d.phase = "summary";
  else d.index = i;
  save();
  renderRecuento();
}
function countSummary() {
  if (!state.countDraft) return;
  state.countDraft.phase = "summary";
  save();
  renderRecuento();
}
function countRetire(uid) {
  const line = countLine(uid);
  const bottle = (state.bottles || []).find(b => b.uid === uid);
  if (!line || !bottle) return;
  const n = Math.max(0, (Number(line.expected) || 0) - (Number(line.found) || 0));
  if (n < 1) return;
  const reason = line.reason || "otro";
  const wine = wineById(bottle.wineId);
  const entry = makeConsumption(wine, n, { date: todayIso(), reason: reason, note: t("count.h1") });
  state.consumption = state.consumption || [];
  state.consumption.unshift(entry);
  try { logAct("Salida " + reasonLabel(entry) + " " + n + " · " + (wine ? (wine.producer + " " + wine.name) : "botella"), { type: "exit", qty: n, wineId: bottle.wineId, reason: reason }); } catch (e) {}
  bottle.qty -= n;
  if (bottle.qty <= 0) {
    state.bottles = state.bottles.filter(b => b.uid !== uid);
    line.expected = 0;
    line.found = 0;
    line.resolved = true;
  } else {
    line.expected = bottle.qty;
    line.found = bottle.qty;
  }
  save();
  toast(t("exit.logged"));
  renderRecuento();
}
function noteCountMoved(uid) {
  const line = countLine(uid);
  if (!line) return;
  line.found = line.expected;
  line.resolved = "move";
}
function countMove(uid) {
  const b = (state.bottles || []).find(x => x.uid === uid);
  if (!b) return;
  currentBottle = b;
  currentWine = wineById(b.wineId);
  showSheet("move-sheet");
}
function matchWineByLabel(label) {
  const q = normTxt(label);
  if (!q) return null;
  const all = (typeof WINE_CATALOG !== "undefined" ? WINE_CATALOG : []).concat(state.customWines || []);
  return all.find(w => normTxt([w.producer, w.name, w.vintage].join(" ")) === q)
    || all.find(w => normTxt([w.producer, w.name].join(" ")).indexOf(q) >= 0)
    || null;
}
function createCountWine(label) {
  const id = "cnt-" + normTxt(label).replace(/\s+/g, "-").slice(0, 48) + "-" + Date.now().toString(36);
  const w = {
    id: id,
    name: label,
    producer: label,
    vintage: "",
    region: "",
    country: "",
    appellation: "",
    type: "",
    style: "",
    grapes: [],
    ratings: {},
    priceHint: "",
    tasting: "",
    pairing: [],
    aging: { drinkFrom: 0, peakStart: 0, peakEnd: 0, holdTo: 0 },
    provenance: { source: "recuento" }
  };
  w.parentId = wineParentId(w);
  state.customWines = state.customWines || [];
  state.customWines.push(w);
  try { migrateV86(state); } catch (e) {}
  return w;
}
function countAddExtra(extraId) {
  const d = state.countDraft;
  if (!d) return;
  let extra = null;
  (d.units || []).forEach(u => (u.extras || []).forEach(x => { if (x.id === extraId) extra = x; }));
  if (!extra || extra.added) return;
  const wine = matchWineByLabel(extra.label) || createCountWine(extra.label);
  extra.wineId = wine.id;
  mergeOrCreateLot({ wineId: wine.id, cellarId: d.cellarId, bin: "", qty: extra.n || 1, price: 0, note: t("count.extra"), photo: "" });
  extra.added = true;
  save();
  toast(t("count.added"));
  renderRecuento();
}
function finishCount() {
  const d = state.countDraft;
  if (!d) return;
  const diffs = countDiffs(d);
  state.counts = state.counts || [];
  state.counts.unshift({
    id: d.id,
    at: Date.now(),
    date: d.date || todayIso(),
    cellarId: d.cellarId,
    cellarName: d.cellarName || "",
    present: diffs.present,
    missing: diffs.missing.map(x => ({ bottleUid: x.bottleUid, wineId: x.wineId, bin: x.bin, n: x.n, name: x.name })),
    extra: diffs.extra.map(x => ({ label: x.label || "", bin: x.bin || "", wineId: x.wineId || "" })),
    shelves: (d.units || []).length
  });
  state.countDraft = null;
  save();
  toast(t("count.saved"));
  renderRecuento();
}
function renderRecuento() {
  const el = document.getElementById("recuento-body");
  if (!el) return;
  const d = state.countDraft;
  if (!d || d.phase === "done") {
    el.innerHTML = countHomeHtml();
    return;
  }
  if (d.phase === "summary") {
    el.innerHTML = countSummaryHtml(d);
    return;
  }
  el.innerHTML = countShelfHtml(d);
}
function countHomeHtml() {
  const caves = (state.vinotecas || []).map(v => `<button type="button" class="card" style="width:100%;text-align:left;margin-top:8px" onclick="startCount('${v.id}')"><div class="row"><h3>${escHtml(v.name || "")}</h3><span class="tiny">${t("count.start")}</span></div><p class="muted">${t("count.lead")}</p></button>`).join("");
  const history = (state.counts || []).slice(0, 12).map(c => {
    const miss = (c.missing || []).reduce((n, x) => n + (Number(x.n) || 0), 0);
    const extra = (c.extra || []).length;
    return `<div class="card" style="margin-top:8px"><div class="row"><h3>${escHtml(c.cellarName || "")}</h3><span class="tiny">${escHtml(formatDate(c.date))}</span></div><p class="muted">${t("count.presentN", { n: c.present || 0 })} · ${t("count.missLine", { n: miss })} · ${t("count.extraLine", { n: extra })}</p></div>`;
  }).join("");
  return `<button class="back" onclick="goBack()">‹ ${t("nav.back")}</button>
    <p class="eyebrow">${t("kicker.inventory")}</p>
    <h1>${t("count.h1")}</h1>
    <p class="muted">${t("count.lead")}</p>
    ${caves || `<p class="empty">${t("profile.noCellars")}</p>`}
    <h2 style="margin-top:18px">${t("count.history")}</h2>
    ${history || `<p class="empty">${t("count.empty")}</p>`}`;
}
function countShelfHtml(d) {
  const u = (d.units || [])[d.index] || { name: "", lines: [], extras: [], kind: "shelf" };
  const lines = (u.lines || []).map(line => {
    const exp = Number(line.expected) || 0;
    const found = Number(line.found) || 0;
    const here = found >= exp && exp > 0;
    return `<div class="card" style="margin-top:8px">
      <div class="row"><h3>${escHtml(countWineName(line))}</h3><span class="tiny">${escHtml(line.bin || "")}</span></div>
      <p class="muted">${t("count.expected")}: ${exp}</p>
      <div class="chip-row" style="margin-top:8px">
        <button type="button" class="chip ${here ? "on" : ""}" onclick="setCountFound('${line.bottleUid}', ${exp})">${t("count.present")}</button>
        <button type="button" class="chip ${found < exp ? "on" : ""}" onclick="setCountFound('${line.bottleUid}', 0)">${t("count.missing")}</button>
      </div>
    </div>`;
  }).join("");
  const extras = (u.extras || []).map(x => `<div class="card" style="margin-top:8px"><h3>${escHtml(x.label)}</h3><p class="muted">${t("count.extra")}</p></div>`).join("");
  const kind = u.kind === "zone" ? t("count.zone") : t("count.shelf");
  const last = d.index >= (d.units || []).length - 1;
  return `<button class="back" onclick="goBack()">‹ ${t("nav.back")}</button>
    <p class="eyebrow">${escHtml(d.cellarName || "")}</p>
    <h1>${t("count.h1")}</h1>
    <p class="tiny">${t("count.progress", { n: d.index + 1, m: (d.units || []).length })} · ${kind}</p>
    <h2 style="margin-top:8px">${escHtml(u.name || "")}</h2>
    ${lines || `<p class="empty">${t("count.noneShelf")}</p>`}
    ${extras}
    <label class="field"><span>${t("count.extra")}</span><input id="count-extra-name" placeholder="${t("count.extraPh")}" /></label>
    <button type="button" class="btn btn-ghost" style="width:100%" onclick="addCountExtra()">${t("count.noteExtra")}</button>
    <div class="btn-row">
      <button type="button" class="btn btn-ghost" onclick="countStep(-1)" ${d.index ? "" : "disabled"}>${t("count.prev")}</button>
      <button type="button" class="btn btn-gold" onclick="${last ? "countSummary()" : "countStep(1)"}">${last ? t("count.summary") : t("count.next")}</button>
    </div>
    <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="countSkipEmpty()">${t("count.skipEmpty")}</button>`;
}
function countSummaryHtml(d) {
  const diffs = countDiffs(d);
  const reasons = (typeof EXIT_REASONS !== "undefined" ? EXIT_REASONS : []).map(r => r.id);
  const miss = diffs.missing.map(x => {
    const line = countLine(x.bottleUid);
    const reason = (line && line.reason) || "otro";
    const chips = reasons.map(id => `<button type="button" class="chip ${id === reason ? "on" : ""}" onclick="setCountReason('${x.bottleUid}', '${id}')">${reasonLabel({ reason: id })}</button>`).join("");
    return `<div class="card" style="margin-top:8px">
      <div class="row"><h3>${escHtml(x.name)}</h3><span class="badge late">${escHtml(t("count.missLine", { n: x.n }))}</span></div>
      <p class="muted">${escHtml(x.unit || "")}${x.bin ? " · " + escHtml(x.bin) : ""}</p>
      <div class="chip-row" style="margin-top:8px">${chips}</div>
      <div class="btn-row">
        <button type="button" class="btn btn-gold" onclick="countRetire('${x.bottleUid}')">${t("count.retire")}</button>
        <button type="button" class="btn btn-ghost" onclick="countMove('${x.bottleUid}')">${t("count.move")}</button>
      </div>
    </div>`;
  }).join("");
  const extra = diffs.extra.map(x => `<div class="card" style="margin-top:8px">
      <div class="row"><h3>${escHtml(x.label || "")}</h3><span class="badge warn">${t("count.extra")}</span></div>
      <p class="muted">${escHtml(x.unit || "")}</p>
      ${x.added ? `<p class="tiny">${t("count.added")}</p>` : `<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="countAddExtra('${x.id}')">${t("count.add")}</button>`}
    </div>`).join("");
  const calm = !diffs.missing.length && !diffs.extra.length ? `<p class="empty">${t("count.ok")}</p>` : "";
  return `<button class="back" onclick="countStep(-1)">‹ ${t("count.prev")}</button>
    <p class="eyebrow">${escHtml(d.cellarName || "")}</p>
    <h1>${t("count.summary")}</h1>
    <p class="muted">${escHtml(formatDate(d.date))} · ${t("count.presentN", { n: diffs.present })}</p>
    ${miss}
    ${extra}
    ${calm}
    <button type="button" class="btn btn-gold" style="width:100%;margin-top:14px" onclick="finishCount()">${t("count.save")}</button>`;
}
function openDeseos(bottleUid) {
  state._wishBottle = bottleUid || "";
  show("deseos");
}
function saveWish() {
  const name = ((document.getElementById("wish-name") || {}).value || "").trim();
  if (!name) return toast(t("wish.needName"));
  const note = ((document.getElementById("wish-note") || {}).value || "").trim();
  const price = ((document.getElementById("wish-price") || {}).value || "").trim();
  state.wishlist = state.wishlist || [];
  state.wishlist.unshift({ id: "wsh" + Date.now().toString(36), name: name, note: note, targetPrice: price, at: Date.now() });
  save();
  toast(t("wish.saved"));
  renderDeseos();
}
function removeWish(id) {
  state.wishlist = (state.wishlist || []).filter(x => x.id !== id);
  save();
  renderDeseos();
}
function saveReservation() {
  const uid = (document.getElementById("res-bottle") || {}).value || "";
  const date = (document.getElementById("res-date") || {}).value || "";
  const occasion = ((document.getElementById("res-occasion") || {}).value || "").trim();
  const note = ((document.getElementById("res-note") || {}).value || "").trim();
  if (!uid) return toast(t("wish.noBottle"));
  if (!date) return toast(t("wish.needDate"));
  const b = (state.bottles || []).find(x => x.uid === uid);
  state.reservations = state.reservations || [];
  const hit = state.reservations.find(r => r.bottleUid === uid && r.date === date);
  if (hit) {
    hit.occasion = occasion;
    hit.note = note;
    hit.wineId = b ? b.wineId : hit.wineId;
    if (!hit.leadDays) hit.leadDays = 3;
  } else {
    state.reservations.unshift({
      id: "rsv" + Date.now().toString(36),
      bottleUid: uid,
      wineId: b ? b.wineId : "",
      date: date,
      occasion: occasion,
      note: note,
      leadDays: 3,
      at: Date.now()
    });
  }
  save();
  toast(t("wish.savedRes"));
  renderDeseos();
}
function removeReservation(id) {
  state.reservations = (state.reservations || []).filter(x => x.id !== id);
  save();
  renderDeseos();
}
function renderDeseos() {
  const el = document.getElementById("deseos-body");
  if (!el) return;
  const wishes = (state.wishlist || []).map(w => `<div class="card" style="margin-top:8px">
      <div class="row"><h3>${escHtml(w.name)}</h3>${w.targetPrice ? `<span class="tiny">${escHtml(String(w.targetPrice))} €</span>` : ""}</div>
      ${w.note ? `<p class="muted">${escHtml(w.note)}</p>` : ""}
      <button type="button" class="btn btn-ghost" style="margin-top:8px" onclick="removeWish('${w.id}')">${t("wish.remove")}</button>
    </div>`).join("");
  const reserves = (state.reservations || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date))).map(r => `<div class="card" style="margin-top:8px" role="button" onclick="openWine('${r.wineId || ""}')">
      <div class="row"><h3>${escHtml(reservationLabel(r))}</h3><span class="badge warn">${t("wish.held")}</span></div>
      <p class="muted">${escHtml(formatDate(r.date))}${r.occasion ? " · " + escHtml(r.occasion) : ""}</p>
      ${r.note ? `<p class="tiny">${escHtml(r.note)}</p>` : ""}
      <button type="button" class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeReservation('${r.id}')">${t("wish.remove")}</button>
    </div>`).join("");
  const options = (state.bottles || []).map(b => {
    const w = wineById(b.wineId);
    const label = w ? [w.producer, w.name, w.vintage, b.bin].filter(Boolean).join(" ") : b.uid;
    const sel = state._wishBottle === b.uid ? " selected" : "";
    return `<option value="${escHtml(b.uid)}"${sel}>${escHtml(label)}</option>`;
  }).join("");
  el.innerHTML = `<button class="back" onclick="goBack()">‹ ${t("nav.back")}</button>
    <p class="eyebrow">${t("home.notices")}</p>
    <h1>${t("wish.h1")}</h1>
    <p class="muted">${t("wish.lead")}</p>
    <h2 style="margin-top:16px">${t("wish.add")}</h2>
    <label class="field"><span>${t("wish.name")}</span><input id="wish-name" /></label>
    <label class="field"><span>${t("wish.note")}</span><input id="wish-note" /></label>
    <label class="field"><span>${t("wish.price")}</span><input id="wish-price" inputmode="decimal" /></label>
    <button type="button" class="btn btn-gold" style="width:100%" onclick="saveWish()">${t("wish.save")}</button>
    ${wishes || `<p class="empty">${t("wish.empty")}</p>`}
    <h2 style="margin-top:18px">${t("wish.reserve")}</h2>
    <label class="field"><span>${t("wish.bottle")}</span><select id="res-bottle"><option value="">${t("wish.noBottle")}</option>${options}</select></label>
    <label class="field"><span>${t("wish.date")}</span><input id="res-date" type="date" value="${todayIso()}" /></label>
    <label class="field"><span>${t("wish.occasion")}</span><input id="res-occasion" /></label>
    <label class="field"><span>${t("wish.note")}</span><input id="res-note" /></label>
    <button type="button" class="btn btn-gold" style="width:100%" onclick="saveReservation()">${t("wish.saveRes")}</button>
    ${reserves || `<p class="empty">${t("wish.resEmpty")}</p>`}`;
}

/* Botellas, búsqueda y altas en la cava. */
function setCellarView(v) {
  cellarView = v;
  renderCellar();
}
function cellarQuery() {
  const el = document.getElementById("cellar-q");
  return fold(el ? el.value : "").replace(/\s+/g, " ").trim();
}
function queryHits(hay, q) {
  if (!q) return true;
  return q.split(" ").filter(Boolean).every(t => hay.includes(t));
}
function wineHay(w, extra) {
  if (!w) return "";
  const p = w.provenance || {};
  return fold([
    w.producer, w.name, w.vintage, w.region, w.appellation, w.country, w.type, w.style,
    (w.grapes || []).join(" "),
    (w.aliases || []).join(" "),
    p.rawTitle, p.pageExcerpt,
    w.priceHint,
    extra || ""
  ].join(" "));
}
function scheduleCellarSearch() {
  const tick = ++cellarSearchTick;
  try { renderCellar(); } catch (e) { console.warn("búsqueda", e); }
  setTimeout(() => {
    if (tick !== cellarSearchTick) return;
    try { renderCellar(); } catch (e) {}
  }, 50);
}
function catalogWines() {
  return WINE_CATALOG.concat(state.customWines || []);
}
function renderCellar() {
  const q = cellarQuery();
  const typeOk = (w) => filterType === "todos" || w.type === filterType || (filterType === "rosado" && w.type === "rose");
  let list = state.bottles.filter(b => {
    const w = wineById(b.wineId);
    if (!w) return false;
    const hay = wineHay(w, cellarName(b.cellarId) + " " + (b.bin || ""));
    return typeOk(w) && queryHits(hay, q) && winePasses(w, { owned: cellarFlags.owned, ready: cellarFlags.ready, grape: cellarFlags.grape });
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
      return `<div class="card" role="button" onclick="openWine('${w.id}')"><div class="label-row">${labelThumbHtml(w)}<div class="label-copy"><div class="row"><h3>${escHtml(p)}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[p].length} lote${by[p].length>1?"s":""}</p></div></div><button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeWineLots('${w.id}')">Quitar</button></div>`;
    }).join("");
  } else if (cellarView === "lotes") {
    body = list.map(b => {
      const w = wineById(b.wineId);
      return `<div class="card" role="button" onclick="openBottle('${b.uid}')"><div class="label-row">${labelThumbHtml(w, "label-thumb", b)}<div class="label-copy"><div class="row"><h3>${w.producer}</h3><span class="tiny">×${b.qty}</span></div><p class="muted">${w.name} ${w.vintage}</p><p class="tiny">${cellarName(b.cellarId)} · ${state.prefs.hideBin ? "hueco oculto" : (b.bin || "sin hueco")}</p></div></div><button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeLot('${b.uid}')">Quitar lote</button></div>`;
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
      const w0 = wineById(first.wineId);
      return `<div class="card" role="button" onclick="openCave('${first.cellarId}')"><div class="label-row">${labelThumbHtml(w0)}<div class="label-copy"><div class="row"><h3>${k}</h3><span class="tiny">${qty} ud</span></div><p class="muted">${by[k].map(b => wineById(b.wineId).name).join(" · ")}</p></div></div></div>`;
    }).join("");
  } else {
    const byWine = {};
    list.forEach(b => { (byWine[b.wineId] || (byWine[b.wineId] = [])).push(b); });
    body = Object.keys(byWine).map(id => {
      try { return wineStockCard(byWine[id]); } catch (e) { return ""; }
    }).join("");
  }
  const stockIds = new Set(state.bottles.map(b => b.wineId));
  const catalog = (!cellarFlags.owned && q) ? catalogWines().filter(w => typeOk(w) && !stockIds.has(w.id) && queryHits(wineHay(w), q) && winePasses(w, { ready: cellarFlags.ready, grape: cellarFlags.grape })).slice(0, 12) : [];
  fillGrapeSelect("cellar-grape", catalogWines().concat(state.bottles.map(b => wineById(b.wineId)).filter(Boolean)), cellarFlags.grape);
  const catalogHtml = catalog.length ? `<p class="tiny" style="margin:14px 0 8px">En catálogo, no en cava</p>` + catalog.map(w => {
    try { return catalogHit(w); } catch (e) { return ""; }
  }).join("") : "";
  const typeNames = { todos: "Todos", tinto: "Tinto", blanco: "Blanco", espumoso: "Espumoso", rosado: "Rosado" };
  const typed = ($("#cellar-q") && $("#cellar-q").value || "").trim();
  const emptyText = q
    ? "Sin coincidencias para «" + typed + "»" + (filterType !== "todos" ? " en " + (typeNames[filterType] || "") : "") + "."
    : "La cava está vacía. Escanea o añade a mano.";
  const empty = !body && !catalogHtml ? `<p class="empty">${escHtml(emptyText)}</p>` : "";
  $("#cellar-list").innerHTML = tabHtml + body + catalogHtml + empty;
  mountLabelThumbs($("#cellar-list"));
}
function catalogHit(w) {
  return `<div class="inv-card" role="button" onclick="openWine('${w.id}')">
    ${labelThumbHtml(w)}
    <div class="inv-meta">
      <div class="row"><h3>${escHtml(producerShort(w))}</h3><span class="badge">Catálogo</span></div>
      <p class="inv-title">${w.name} ${w.vintage}</p>
      <p class="muted">${w.appellation || w.region} · ${w.priceHint || "sin horquilla"}</p>
    </div>
  </div>`;
}
function exitReasonChips(includeVoid) {
  const rows = EXIT_REASONS.slice();
  if (includeVoid) rows.push({ id: "error", label: "Error de registro (no contar)" });
  return rows.map(r => `<button type="button" class="chip ${r.id === "bebida" ? "on" : ""}" data-reason="${r.id}" onclick="setRemoveReason('${r.id}', this)">${r.label}</button>`).join("");
}
function setRemoveReason(id, btn) {
  if (!pendingExit) return;
  pendingExit.reason = id;
  const host = btn && btn.parentElement;
  if (host) $$(".chip", host).forEach(c => c.classList.toggle("on", c === btn));
}
function openExitSheet(job) {
  pendingExit = job;
  if (!pendingExit) return;
  pendingExit.reason = "bebida";
  if ($("#exit-title")) $("#exit-title").textContent = job.mode === "wine" ? "Quitar del listado" : "Quitar lote";
  if ($("#exit-hint")) $("#exit-hint").textContent = job.hint || "";
  if ($("#exit-reasons")) $("#exit-reasons").innerHTML = exitReasonChips(true);
  if ($("#exit-note")) $("#exit-note").value = "";
  showSheet("exit-sheet");
}
function removeLot(uid) {
  const b = state.bottles.find(x => x.uid === uid);
  if (!b) return;
  const w = wineById(b.wineId);
  openExitSheet({
    mode: "lot",
    uids: [uid],
    qty: b.qty,
    wineId: b.wineId,
    hint: (w ? w.producer + " " + w.name : "Este lote") + " · " + b.qty + " botella" + (b.qty > 1 ? "s" : "")
  });
}
function removeWineLots(wineId) {
  const lots = state.bottles.filter(b => b.wineId === wineId);
  const n = lots.reduce((s, b) => s + b.qty, 0);
  if (!n) return;
  const w = wineById(wineId);
  openExitSheet({
    mode: "wine",
    uids: lots.map(b => b.uid),
    qty: n,
    wineId: wineId,
    hint: (w ? w.producer + " " + w.name : "Estas botellas") + " · " + n + " botella" + (n > 1 ? "s" : "")
  });
}
function confirmExit() {
  const job = pendingExit;
  if (!job) return hideSheets();
  const reason = job.reason || "bebida";
  const note = (($("#exit-note") && $("#exit-note").value) || "").trim();
  const lots = state.bottles.filter(b => job.uids.indexOf(b.uid) >= 0);
  if (!lots.length) {
    pendingExit = null;
    hideSheets();
    toast("Ese lote ya no está");
    return;
  }
  if (reason !== "error") {
    const wine = wineById(job.wineId);
    const entry = makeConsumption(wine, job.qty, { date: todayIso(), note: note, reason: reason });
    state.consumption = state.consumption || [];
    state.consumption.unshift(entry);
    logAct("Salida " + reasonLabel(entry) + " " + job.qty + " · " + (wine ? (wine.producer + " " + wine.name) : "botella"), { type: "exit", qty: job.qty, wineId: job.wineId, reason: reason });
  }
  state.bottles = state.bottles.filter(b => job.uids.indexOf(b.uid) < 0);
  if (currentBottle && job.uids.indexOf(currentBottle.uid) >= 0) currentBottle = null;
  save();
  pendingExit = null;
  hideSheets();
  toast(reason === "error" ? "Lote quitado, sin contar" : "Salida registrada");
  if (screenId === "cellar") renderCellar();
  else if (screenId === "wine" || screenId === "wine-sub") {
    if (currentBottle) openWine(currentBottle.wineId, currentBottle);
    else show("cellar");
  } else if (screenId === "home") renderHome();
}
function wineStockCard(lots) {
  const b = lots[0];
  const w = wineById(b.wineId);
  const p = phaseOf(w);
  const qty = lots.reduce((n, x) => n + x.qty, 0);
  const locs = lots.map(x => `${cellarName(x.cellarId)} ${state.prefs.hideBin ? "" : (x.bin || "")} ×${x.qty}`.trim()).join(" · ");
  return `<div class="inv-card" role="button" onclick="openWine('${w.id}')">
    ${labelThumbHtml(w)}
    <div class="inv-meta">
      <div class="row"><h3>${escHtml(producerShort(w))}</h3><span class="badge ${p.key}">${p.label}</span></div>
      <p class="inv-title">${escHtml(w.name)} ${escHtml(w.vintage)}</p>
      <p class="muted">${qty} botella${qty>1?"s":""} · ${lots.length} lote${lots.length>1?"s":""}</p>
      <p class="tiny">${locs}</p>
      <button class="btn btn-ghost" style="margin-top:8px" onclick="event.stopPropagation();removeWineLots('${w.id}')">Quitar del listado</button>
    </div>
    <div class="inv-score">${parkerMark(w)}</div>
  </div>`;
}
function openBottle(uid) {
  const b = state.bottles.find(x => x.uid === uid);
  currentBottle = b;
  openWine(b.wineId, b);
}
function toggleCellarFlag(key, btn) {
  cellarFlags[key] = !cellarFlags[key];
  if (btn) btn.classList.toggle("on", !!cellarFlags[key]);
  renderCellar();
}
function setCellarGrape(value) {
  cellarFlags.grape = value || "";
  renderCellar();
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
  askServe(n);
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
function slotTaken(cellarId, bin, exceptUid) {
  if (!bin) return false;
  return state.bottles.some(b => b.cellarId === cellarId && (b.bin || "") === bin && b.uid !== exceptUid)
    || (state.inbox || []).some(r => !r.entered && r.cellarId === cellarId && (r.bin || "") === bin);
}
function addCurrentToCellar() {
  if (!currentWine) return;
  const cellarId = $("#add-cellar").value;
  const qty = Math.max(1, parseInt($("#add-qty").value || "1", 10));
  const bin = $("#add-bin").value.trim() || nextBin(cellarId);
  if (slotTaken(cellarId, bin)) {
    const who = state.bottles.find(b => b.cellarId === cellarId && (b.bin || "") === bin);
    const w = who ? wineById(who.wineId) : null;
    const name = w ? (w.producer + " " + w.name) : "otra botella";
    if (!confirm("El hueco " + bin + " ya lo ocupa " + name + ". ¿Guardar igualmente?")) return;
  }
  const price = parseFloat($("#add-price").value || "0");
  const note = $("#add-note").value.trim();
  currentBottle = mergeOrCreateLot({
    wineId: currentWine.id, cellarId, bin, qty, price, note, photo: ""
  });
  if (lastLabelData) rememberLabelPhoto(currentWine.id, lastLabelData, currentBottle);
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
  if (bin && slotTaken(dest, bin, currentBottle.uid)) {
    if (!confirm("El hueco " + bin + " ya está ocupado. ¿Mover igualmente?")) return;
  }
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
function takenBins(cellarId) {
  const used = new Set();
  state.bottles.filter(b => b.cellarId === cellarId && b.bin).forEach(b => used.add(b.bin));
  (state.inbox || []).filter(r => !r.entered && r.cellarId === cellarId && r.bin).forEach(r => used.add(r.bin));
  return used;
}
function nextBin(cellarId) {
  const v = state.vinotecas.find(x => x.id === cellarId);
  const used = takenBins(cellarId);
  if (v) {
    ensureCaveSlots(v);
    const free = rackSlots(cellarId).find(code => !used.has(code));
    if (free) return free;
  }
  for (let i = 1; i <= 40; i++) {
    const bin = "A-" + String(i).padStart(2, "0");
    if (!used.has(bin)) return bin;
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
  const thumb = lastLabelData || "";
  currentBottle = mergeOrCreateLot({
    wineId: w.id, cellarId, bin: nextBin(cellarId), qty: 1, price: 0,
    note: "Alta por etiqueta", photo: ""
  });
  if (thumb) rememberLabelPhoto(w.id, thumb, currentBottle);
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
  askServeMany();
}
function renderHits(hits, title, withAdd) {
  $("#scan-results").innerHTML = `<h2>${title}</h2>` + (hits.map(w => {
    const p = phaseOf(w);
    const have = state.bottles.filter(b => b.wineId === w.id).reduce((n, b) => n + b.qty, 0);
    return `<div class="card">
      <div class="bottle-row" role="button" onclick="openWine('${w.id}')">
        ${labelThumbHtml(w)}
        <div class="meta">
          <div class="row"><h3>${w.producer} ${w.name}</h3><span class="badge ${p.key}">${w.vintage}</span></div>
          <p class="muted">${w.region} · Vivino ${w.ratings.vivino.score.toFixed(1)} · Peñín ${w.ratings.penin.score}</p>
          ${have ? `<p class="tiny">Ya tienes ${have} ud</p>` : ""}
        </div>
      </div>
      ${withAdd ? `<div class="scan-hit-actions">
        <button class="btn btn-gold" onclick="event.stopPropagation();queueIntake('${w.id}')">Reservar hueco</button>
        <button class="btn btn-ghost" onclick="event.stopPropagation();openWine('${w.id}')">Ver ficha</button>
      </div>` : ""}
    </div>`;
  }).join("") || `<p class="empty">Sin ficha en el catálogo.</p><button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="manualIntake()">Crear ficha con lo escrito</button>`);
  mountLabelThumbs($("#scan-results"));
}
function fillSelects() {
  const opts = state.vinotecas.map(v => `<option value="${v.id}">${v.name}</option>`).join("");
  $("#add-cellar").innerHTML = opts;
  $("#move-cellar").innerHTML = opts;
}
function onAddBinInput() {
  const input = $("#add-bin");
  if (input) input.dataset.touched = "1";
  paintFreeSlots();
}
function pickFreeSlot(code) {
  const input = $("#add-bin");
  if (!input) return;
  input.value = code;
  input.dataset.touched = "1";
  paintFreeSlots();
}
function paintFreeSlots() {
  const id = $("#add-cellar") && $("#add-cellar").value;
  const input = $("#add-bin");
  const hint = $("#add-free-hint");
  const grid = $("#add-free-grid");
  if (!id || !grid) return;
  const free = freeSlotCodes(id);
  const proposed = free[0] || "";
  if (input && input.dataset.touched !== "1") input.value = proposed;
  if (hint) hint.textContent = proposed ? ("Hueco libre propuesto: " + proposed) : "No quedan huecos libres en esta vinoteca.";
  const current = input ? input.value.trim() : "";
  grid.innerHTML = free.length ? free.map(code => `<button type="button" class="rack-slot rack-free ${code === current ? "on" : ""}" onclick="pickFreeSlot('${code}')"><b>${escHtml(code)}</b><small>libre</small></button>`).join("") : `<p class="muted">Sin huecos libres.</p>`;
}
function onAddCellarChange() {
  const input = $("#add-bin");
  if (input) input.dataset.touched = "";
  paintFreeSlots();
  refreshAddKeep();
}

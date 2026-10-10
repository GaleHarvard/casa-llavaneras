/* Mesa y maridaje. */
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
function pairingBlock(w) {
  const pack = pairingPackOf(w);
  if (!pack) return `<p class="muted">Sin dato</p>`;
  const inCellar = state.bottles.some(b => b.wineId === w.id);
  return `
    <h2 style="margin-top:16px">Maridajes de este vino</h2>
    <p class="muted" style="margin:6px 0 10px">${pack.logic}</p>
    <div class="card"><p class="tiny">Servicio en mesa</p><p>${escHtml(pack.serve || "Sin dato")}</p>
      ${(pack.avoid && pack.avoid.length) ? `<p class="muted" style="margin-top:8px">Evitar: ${escHtml(pack.avoid.join(" · "))}</p>` : ""}</div>
    ${pack.matches.map(m => {
      const d = m.dishId && PAIRING_DISHES.find(x => x.id === m.dishId);
      const badge = m.score ? `<span class="badge">${m.score}/100</span>` : "";
      if (!d) return `<div class="card"><div class="row"><h3>${escHtml(m.label || m.why)}</h3>${badge}</div></div>`;
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
  paintMesaFilterUi();
  if (pairingMode === "platos") {
    const dishes = (PAIRING_DISHES || []).filter(d => {
      const text = `${d.name} ${d.family} ${(d.tags || []).join(" ")}`.toLowerCase();
      if (!text.includes(q)) return false;
      if (!mesaFilters.owned && !mesaFilters.ready && !mesaFilters.grape && mesaFilters.type === "todos") return true;
      return winesForDish(d.id).length > 0;
    });
    $("#pair-body").innerHTML = dishes.map(d => {
      const wines = winesForDish(d.id);
      const best = wines[0];
      const label = best ? pairLabel(best.wine) : "";
      return `<article class="card dish-hit" role="button" tabindex="0" onclick="openDish('${d.id}')">
        <div class="row"><h3>${d.icon} ${d.name}</h3><span class="badge">${wines.length} vino${wines.length === 1 ? "" : "s"} ›</span></div>
        <p class="muted">${d.family} · ${d.heat}</p>
        ${best ? `<p class="tiny" style="margin-top:8px;color:#c9a227" onclick="event.stopPropagation();openWine('${best.wine.id}')">Mejor encaje: ${label} · ${best.score} ›</p>` : ""}
        <button type="button" class="btn btn-ghost" style="width:100%;margin-top:10px;pointer-events:none">Ver vinos del plato</button>
      </article>`;
    }).join("") || `<p class="empty">Sin platos con ese nombre.</p>`;
    mountLabelThumbs($("#pair-body"));
    return;
  }
  const source = pairingMode === "cava"
    ? [...new Set(state.bottles.map(b => b.wineId))].map(wineById).filter(Boolean)
    : WINE_CATALOG;
  const list = source.filter(w => `${w.producer} ${w.name} ${w.region} ${(w.pairing || []).join(" ")}`.toLowerCase().includes(q) && winePasses(w, mesaFilters));
  $("#pair-body").innerHTML = list.map(w => {
    const pack = WINE_PAIRINGS[w.id];
    const top = pack?.matches?.[0];
    const d = top ? PAIRING_DISHES.find(x => x.id === top.dishId) : null;
    const have = state.bottles.filter(b => b.wineId === w.id).reduce((n, b) => n + b.qty, 0);
    return `<div class="pair-card" role="button" onclick="openWine('${w.id}');setTimeout(()=>openWineSub('pairings'),40)">
      ${labelThumbHtml(w)}
      <div class="pair-copy">
        <h3>${shortWineName(w)}</h3>
        <p class="muted">${w.name} ${w.vintage} · ${w.region}</p>
        <p class="pair-dish">${d ? d.name : ((w.pairing || []).slice(0,2).join(" · "))}</p>
        <p class="pair-score-line">${top ? "★ " + top.score + "/100" : "★ ficha"}</p>
      </div>
      <span class="pair-go">›</span>
    </div>`;
  }).join("") || `<p class="empty">Sin coincidencias.</p>`;
  mountLabelThumbs($("#pair-body"));
}
function winesForDish(dishId) {
  const table = window.WINE_PAIRINGS || {};
  return Object.entries(table).map(([id, pack]) => {
    const m = (pack.matches || []).find(x => x.dishId === dishId);
    if (!m) return null;
    const wine = wineById(id);
    if (!wine || !winePasses(wine, mesaFilters)) return null;
    return { wine, score: m.score, why: m.why, pack };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
}
function winePasses(w, opts) {
  opts = opts || {};
  if (!w) return false;
  if (opts.owned && stockOf(w.id) < 1) return false;
  if (opts.ready) {
    const p = phaseOf(w);
    if (!p || (p.key !== "ok" && p.key !== "warn")) return false;
  }
  if (opts.type && opts.type !== "todos") {
    const t = w.type === "rose" ? "rosado" : w.type;
    if (t !== opts.type) return false;
  }
  if (opts.grape) {
    const g = normTxt(opts.grape);
    const hit = (w.grapes || []).some(name => {
      const n = normTxt(name);
      return n === g || n.indexOf(g) >= 0;
    });
    if (!hit) return false;
  }
  return true;
}
function grapeChoices(wines) {
  const set = [];
  (wines || []).forEach(w => {
    (w && w.grapes || []).forEach(g => { if (g && set.indexOf(g) < 0) set.push(g); });
  });
  return set.sort((a, b) => a.localeCompare(b, "es"));
}
function fillGrapeSelect(id, wines, current) {
  const el = document.getElementById(id);
  if (!el) return;
  const grapes = grapeChoices(wines);
  el.innerHTML = `<option value="">Todas las uvas</option>` + grapes.map(g => `<option value="${escHtml(g)}"${g === current ? " selected" : ""}>${escHtml(g)}</option>`).join("");
}
function paintMesaFilterUi() {
  const owned = document.getElementById("mesa-owned");
  const ready = document.getElementById("mesa-ready");
  const typeBtn = document.getElementById("mesa-type");
  if (owned) owned.classList.toggle("on", !!mesaFilters.owned);
  if (ready) ready.classList.toggle("on", !!mesaFilters.ready);
  if (typeBtn) {
    const labels = { todos: "Tipo", tinto: "Tinto", blanco: "Blanco", espumoso: "Espumoso", rosado: "Rosado", dulce: "Dulce", generoso: "Generoso" };
    typeBtn.textContent = labels[mesaFilters.type] || "Tipo";
    typeBtn.classList.toggle("on", mesaFilters.type !== "todos");
  }
  const pool = pairingMode === "cava"
    ? [...new Set(state.bottles.map(b => b.wineId))].map(wineById).filter(Boolean)
    : catalogWines();
  fillGrapeSelect("mesa-grape", pool, mesaFilters.grape);
}
function toggleMesaFlag(key) {
  mesaFilters[key] = !mesaFilters[key];
  refreshMesaView();
}
function cycleMesaType() {
  const order = ["todos", "tinto", "blanco", "espumoso", "rosado", "dulce", "generoso"];
  const i = order.indexOf(mesaFilters.type);
  mesaFilters.type = order[(i + 1) % order.length];
  refreshMesaView();
}
function setMesaGrape(value) {
  mesaFilters.grape = value || "";
  refreshMesaView();
}
function mesaFilterSummary() {
  const bits = [];
  if (mesaFilters.owned) bits.push("Solo lo que tengo");
  if (mesaFilters.ready) bits.push("Listo para beber");
  if (mesaFilters.type && mesaFilters.type !== "todos") bits.push(mesaFilters.type);
  if (mesaFilters.grape) bits.push(mesaFilters.grape);
  return bits.length ? "Filtros: " + bits.join(" · ") : "";
}
function refreshMesaView() {
  if (screenId === "dish" && pairingDish) openDish(pairingDish);
  else renderPairings();
}
function openDish(id) {
  try {
    pairingDish = id;
    const d = (PAIRING_DISHES || []).find(x => x.id === id);
    if (!d) return;
    const wines = winesForDish(id);
    const inCava = wines.filter(x => state.bottles.some(b => b.wineId === x.wine.id));
    const title = (d.icon ? d.icon + " " : "") + d.name;
    const body = $("#dish-body");
    if (!body) return;
    body.innerHTML = `
    <button type="button" class="back" onclick="goBack()">‹ Mesa</button>
    <p class="eyebrow">${d.family || "Plato"}</p>
    <h1>${title}</h1>
    <p class="muted">${d.heat || ""} · ${(d.tags || []).join(" · ")}</p>
    ${mesaFilterSummary() ? `<p class="tiny" style="margin-top:8px">${escHtml(mesaFilterSummary())}</p>` : ""}
    ${inCava.length ? `<div class="card" style="margin-top:12px"><h2>En tu vinoteca ahora</h2>
      ${inCava.map(x => `<p role="button" style="margin-top:8px" onclick="openWine('${x.wine.id}')"><strong>${pairLabel(x.wine)} ${x.wine.vintage}</strong> · ${x.score}/100 ›<br><span class="muted">${x.why}</span></p>`).join("")}
    </div>` : `<p class="muted" style="margin-top:12px">Ninguna botella de este maridaje está en stock. Abajo, el catálogo.</p>`}
    <h2 style="margin-top:16px">Ranking por encaje</h2>
    ${wines.length ? wines.map(x => {
      const have = state.bottles.some(b => b.wineId === x.wine.id);
      return `<div class="card" role="button" onclick="openWine('${x.wine.id}')">
        <div class="label-row">${labelThumbHtml(x.wine)}<div class="label-copy">
        <div class="row"><h3>${pairLabel(x.wine)}</h3><span class="badge ${x.score>=94?"ok":"warn"}">${x.score}</span></div>
        <p class="muted">${x.wine.vintage} · ${x.wine.region} · ${x.wine.type}</p>
        <p style="margin-top:8px">${x.why || ""}</p>
        <p class="tiny">${(x.pack && x.pack.serve) || ""}${have ? " · lo tienes" : ""}</p>
        </div></div>
      </div>`;
    }).join("") : `<p class="empty">Aún no hay vinos enlazados a este plato.</p>`}
    <h2>Regla de mesa</h2>
    ${(window.PAIRING_RULES || []).map(r => `<div class="card"><strong>${r.title}</strong><p class="muted">${r.text}</p></div>`).join("")}`;
    show("dish");
  } catch (err) {
    console.warn("openDish", err);
    show("dish");
  }
}

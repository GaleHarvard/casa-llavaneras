/* Ficha del vino, cata y uvas. */
function renderCatas() {
  const list = lastTastings(20);
  $("#catas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">Mi Vinoteca</p>
    <h1>Catas</h1>
    <button class="btn btn-gold" style="width:100%;margin:10px 0" onclick="quickTaste()">Cata rápida</button>
    ${list.length ? list.map(t => `<div class="card" role="button" onclick="openWineThenTaste('${t.wine.id}')">
      <div class="label-row">${labelThumbHtml(t.wine)}<div class="label-copy"><div class="row"><h3>${t.wine.producer}</h3><span class="tiny">${t.when}</span></div>
      <p class="muted">${t.wine.name} ${t.wine.vintage}</p>
      <p class="tiny" style="margin-top:6px">${t.note || "Cuaderno sin recuerdo"}</p></div></div>
    </div>`).join("") : `<p class="empty">Todavía no hay catas. Usa Cata rápida.</p>`}`;
  mountLabelThumbs($("#catas-body"));
}
function isFav(id) { return (state.favorites || []).includes(id); }
function toggleFav(id) {
  state.favorites = state.favorites || [];
  if (isFav(id)) state.favorites = state.favorites.filter(x => x !== id);
  else state.favorites.push(id);
  save();
  if (currentWine && currentWine.id === id) openWine(id, currentBottle);
}
function pendingForWine(wineId) {
  return (state.inbox || []).filter(r => !r.entered && r.wineId === wineId);
}
function pendingPlacementLine(wineId) {
  const rows = pendingForWine(wineId).filter(r => r.bin);
  if (!rows.length) return "";
  return rows.map(r => `<p class="tiny" style="text-align:center;margin:6px 0 4px">Alta pendiente · ${cellarName(r.cellarId)} · ${r.bin}</p>`).join("");
}
function isPlaceholderNote(text) {
  return /ficha a partir de la bodega|alta por etiqueta|completa la ficha|ficha creada/i.test(String(text || ""));
}
function noteLooksLikeLinkOrPrice(text) {
  const n = String(text || "").trim();
  if (!n) return false;
  if (/https?:\/\//i.test(n) || /search-result/i.test(n)) return true;
  return /^\d{1,4}(?:[.,]\d{1,2})?\s*€$/.test(n);
}
function publishedNote(obj) {
  const n = ((obj && obj.note) || "").trim();
  if (!n || isPlaceholderNote(n) || noteLooksLikeLinkOrPrice(n)) return "";
  return n;
}
function criticBlurb(w) {
  const parker = w && w.ratings && w.ratings.parker;
  const note = publishedNote(parker);
  if (note) return (parker && parker.estimate ? "Estimación. " : "") + note;
  const tasting = publishedNote({ note: w && w.tasting });
  if (tasting.length > 24) {
    const est = w.provenance && w.provenance.tasting === "estimación Gemini";
    return (est ? "Estimación. " : "") + tasting;
  }
  return "Sin dato";
}
function criticMeters(w) {
  const r = (w && w.ratings) || {};
  const bit = (label, block, digits) => {
    const score = block && block.score;
    const est = block && block.estimate && score ? " est." : "";
    return label + " " + rateScore(score, digits) + est;
  };
  const dec = r.decanter && r.decanter.score ? " · Decanter " + rateScore(r.decanter.score, 0) + (r.decanter.estimate ? " est." : "") : "";
  return bit("WA", r.parker, 0) + " · " + bit("Peñín", r.penin, 0) + " · " + bit("WS", r.spectator, 0) + dec + " · " + bit("Vivino", r.vivino, 1);
}
function shownTemp(w, which) {
  if (!fieldIsReal(w, which)) return "Sin dato";
  const c = w.conservation || {};
  if (which === "cellar") return c.cellarMin + "–" + c.cellarMax + " °C";
  return c.serveMin + "–" + c.serveMax + " °C";
}
function pairingPackOf(w) {
  if (!w) return null;
  if (window.WINE_PAIRINGS && WINE_PAIRINGS[w.id]) return WINE_PAIRINGS[w.id];
  if (w.pairingPack && Array.isArray(w.pairingPack.matches) && w.pairingPack.matches.length) return w.pairingPack;
  if (Array.isArray(w.pairing) && w.pairing.length) {
    return {
      logic: w.pairing.join(" · "),
      serve: fieldIsReal(w, "service") ? (w.conservation.serveMin + "–" + w.conservation.serveMax + " °C") : "",
      avoid: [],
      matches: w.pairing.map((name, i) => ({ dishId: null, score: 0, why: String(name), label: String(name) }))
    };
  }
  return null;
}
function pairFeatureHtml(w) {
  const pack = pairingPackOf(w);
  const top = pack && pack.matches && pack.matches[0];
  if (!top) return `<p class="muted" style="margin:0 0 12px">Sin dato</p>`;
  const dish = top.dishId ? PAIRING_DISHES.find(d => d.id === top.dishId) : null;
  const title = dish ? dish.name : (top.label || top.why);
  const score = top.score ? `<div class="pair-score">${top.score}/100</div>` : "";
  const why = dish ? top.why : "";
  return `<div class="pair-feature" role="button" onclick="openWineSub('pairings')">
      ${dish ? dishArt() : ""}
      <div>
        <h3>${escHtml(title)}</h3>
        ${score}
        ${why ? `<p class="muted" style="margin-top:4px">${escHtml(why)}</p>` : ""}
      </div>
    </div>`;
}
function fichaStatusCard(w) {
  if (!w || isCatalogWineId(w.id)) return "";
  const note = (w.provenance && w.provenance.geminiNote) || "";
  const btn = `<button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="completeExistingWine('${w.id}')">Completar ficha</button>`;
  if (!note) return `<div id="ficha-status">${btn}</div>`;
  return `<div class="card" id="ficha-status"><p>${escHtml(note)}</p>${btn}</div>`;
}
function setFichaProgress(msg) {
  setScanStatus(msg);
  const el = document.getElementById("ficha-status");
  if (el) el.innerHTML = `<p>${escHtml(msg)}</p>`;
  const box = document.getElementById("scan-results");
  if (box && document.getElementById("scan") && document.getElementById("scan").classList.contains("active")) {
    box.innerHTML = `<div class="card"><p>${escHtml(msg)}</p><p class="tiny">Primero la página de la tienda o la bodega. Lo que no aparezca, si hay clave guardada, lo estima Gemini.</p></div>`;
  }
}
function openWine(wineId, bottle) {
  const w = wineById(wineId);
  if (!w) {
    toast("No hay ficha para este vino");
    show("cellar", { tab: true });
    return;
  }
  normalizeWine(w);
  if (refreshDirtyInternetWine(w)) save();
  currentWine = w;
  currentBottle = bottle || state.bottles.find(b => b.wineId === wineId) || null;
  const p = phaseOf(w);
  const r = w.ratings;
  const backTo = lastList === "wine" ? (bottle ? "cellar" : "scan") : lastList;
  const pill = datesAreReal(w) ? (p.label || "").toUpperCase() : (fieldIsReal(w, "type") && w.type ? String(w.type).toUpperCase() : "SIN DATO");

  $("#wine-body").innerHTML = `
    <div class="wine-top">
      <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
      <div class="spacer"></div>
      <button class="icon-btn fav ${isFav(w.id) ? "on" : ""}" onclick="toggleFav('${w.id}')" aria-label="Favorito">${isFav(w.id) ? "♥" : "♡"}</button>
      <button type="button" class="icon-btn" onclick="openWineMenu()" aria-label="Más de este vino">···</button>
    </div>
    <div class="wine-hero">${estateSVG(w)}</div>
    <h1 class="wine-producer">${w.producer}</h1>
    <p class="wine-cuvee">${w.name} ${w.vintage}</p>
    <button type="button" class="btn btn-ghost label-change" onclick="changeWineLabel()">Cambiar etiqueta</button>
    <div class="peak-pill">${pill}</div>
    ${currentBottle ? `<p class="tiny" style="text-align:center;margin:6px 0 4px">En mi bodega · ${currentBottle.qty} botella${currentBottle.qty>1?"s":""}</p>` : ""}
    ${currentBottle && currentBottle.cellarId ? `<button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="showLotInCave()">Ver en la vinoteca</button>` : ""}
    ${pendingPlacementLine(w.id)}
    <div class="wine-tabs">
      <button type="button" onclick="openWineSub('profile')">General</button>
      <button type="button" onclick="openWineSub('taste')">Cata</button>
      <button type="button" onclick="openWineSub('mapa')">Bodega</button>
      <button type="button" onclick="openWineSub('anadas')">Añadas</button>
    </div>
    ${zoneStrip(w)}
    ${fichaStatusCard(w)}

    <div class="sec-head" role="button" onclick="openWineSub('ratings')"><h2>Calificaciones</h2><span class="sec-ico">▦</span></div>
    <div class="rate-grid" role="button" onclick="openWineSub('ratings')">
      <div class="rate-card">
        <div class="who">
          <div class="badge-round vivino-mark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="1.6"><path d="M12 4c2 4 6 6 6 11a6 6 0 1 1-12 0c0-5 4-7 6-11z"/></svg>
          </div>
          <div><b>Vivino</b><div class="stars">${r.vivino.score ? starsRow(r.vivino.score) : ""}</div></div>
        </div>
        <div class="rate-score" style="${r.vivino.score ? "" : "font-size:14px"}">${rateScore(r.vivino.score, 1)}</div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Peñín</b></div>
        <div class="rate-end"><div class="rate-score" style="${r.penin.score ? "" : "font-size:14px"}">${rateScore(r.penin.score, 0)}</div>
          <svg class="rate-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3 20 7v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V7z"/></svg>
        </div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Parker</b></div>
        <div class="rate-end"><div class="rate-score" style="${r.parker.score ? "" : "font-size:14px"}">${rateScore(r.parker.score, 0)}</div><span class="parker-p">P</span></div>
      </div>
      <div class="rate-card">
        <div class="who"><b>Spectator</b></div>
        <div class="rate-end"><div class="rate-score" style="${r.spectator.score ? "" : "font-size:14px"}">${rateScore(r.spectator.score, 0)}</div>
          <svg class="rate-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M6 18l2.5-2.5"/></svg>
        </div>
      </div>
    </div>
    <div class="card" role="button" onclick="openWineSub('ratings')" style="margin:8px 0 12px">
      <p class="tiny">Crítica publicada</p>
      <p style="margin-top:8px;line-height:1.45">${escHtml(criticBlurb(w))}</p>
      <p class="muted" style="margin-top:8px">${r.parker && r.parker.reviewer && r.parker.score ? escHtml(r.parker.reviewer) + " · " : ""}${escHtml(criticMeters(w))}</p>
    </div>

    <div class="sec-head" role="button" onclick="openWineSub('pairings')"><h2>Maridajes</h2><span class="sec-ico">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 13h14v3H5z"/><path d="M7 13c0-5 2.5-8 5-8s5 3 5 8"/><path d="M4 19h16"/></svg>
    </span></div>
    ${pairFeatureHtml(w)}

    <div class="serve-bar" role="button" onclick="openWineSub('keep')">
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v3M8 5l1.2 2.2M16 5l-1.2 2.2"/><path d="M7 14a5 5 0 0 0 10 0c0-3-2.4-5.5-5-7-2.6 1.5-5 4-5 7z"/></svg>
        <div><div class="lbl">Guarda</div><div class="val">${shownTemp(w, "cellar")}</div></div>
      </div>
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3h8l-1 9a5 5 0 1 1-6 0L8 3z"/><path d="M9 21h6"/></svg>
        <div><div class="lbl">Servicio</div><div class="val">${shownTemp(w, "service")}</div></div>
      </div>
    </div>
    <div class="dossier-grid">
      <button type="button" onclick="openWineSub('tecnica')">Técnica</button>
      <button type="button" onclick="openWineSub('servicio')">Copa</button>
      <button type="button" onclick="openWineSub('evolve')">Evolución</button>
      <button type="button" onclick="openWineSub('mercado')">Mercado</button>
      <button type="button" onclick="openWineSub('historia')">Historia</button>
      <button type="button" onclick="openWineSub('origen')">Hueco</button>
      <button type="button" onclick="openWineSub('compras')">Compras</button>
    </div>
    ${cataPersonalCard(w)}
  `;
  show("wine");
}
function tastingsOf(id) {
  const list = state.tasting && state.tasting[id];
  if (!Array.isArray(list)) return [];
  return list.slice().sort((a, b) => (a.at || 0) - (b.at || 0) || String(a.date || "").localeCompare(String(b.date || "")));
}
function cataPersonalCard(w) {
  const list = tastingsOf(w.id);
  const last = list[list.length - 1];
  const note = last && last.conclusion ? last.conclusion.note : "";
  const score = last && last.conclusion && last.conclusion.score != null && last.conclusion.score !== "" ? last.conclusion.score : null;
  const hint = list.length
    ? ((score != null ? score + "/100 · " : "") + (note || "Cata sin recuerdo") + (list.length > 1 ? " · " + list.length + " catas" : ""))
    : "Tu nota, no la de las guías.";
  return `<div class="cata-entry" role="button" onclick="openWineSub('taste')">
    <div class="row"><h2>Cata personal</h2><span class="sec-ico">›</span></div>
    <p class="muted" style="margin-top:6px">${escHtml(hint)}</p>
  </div>`;
}
const HUE_BY_TYPE = {
  tinto: ["Rubí", "Granate", "Picota", "Púrpura", "Teja"],
  blanco: ["Pajizo", "Amarillo", "Verdoso", "Dorado", "Ámbar"],
  espumoso: ["Amarillo pálido", "Dorado", "Rosado", "Cobrizo"],
  rosado: ["Rosa pálido", "Salmón", "Frambuesa", "Piel de cebolla"],
  rose: ["Rosa pálido", "Salmón", "Frambuesa", "Piel de cebolla"],
  dulce: ["Dorado", "Ámbar", "Topacio", "Caoba"],
  generoso: ["Oro", "Ámbar", "Caoba", "Palo cortado"]
};
const AROMA_FAMILIES = [
  { id: "fruta", label: "Fruta", chips: ["Cereza", "Fresa", "Ciruela", "Mora", "Manzana", "Cítricos", "Melocotón", "Fruta tropical", "Fruta pasa"] },
  { id: "floral", label: "Floral", chips: ["Rosa", "Violeta", "Flores blancas", "Jazmín"] },
  { id: "especias", label: "Especias", chips: ["Pimienta", "Clavo", "Canela", "Regaliz", "Hierbas"] },
  { id: "madera", label: "Madera", chips: ["Vainilla", "Coco", "Cedro", "Tostado", "Café", "Chocolate"] },
  { id: "terciarios", label: "Terciarios", chips: ["Cuero", "Tabaco", "Tierra", "Setas", "Balsámico", "Miel"] }
];
function hueOptions(w) {
  const type = w && w.type === "rose" ? "rosado" : (w && w.type) || "tinto";
  return HUE_BY_TYPE[type] || HUE_BY_TYPE.tinto;
}
function tastingById(wineId, id) {
  return tastingsOf(wineId).find(t => t.id === id) || null;
}
function evolutionHtml(list) {
  const pts = (list || []).filter(t => t.conclusion && t.conclusion.score != null && t.conclusion.score !== "" && Number(t.conclusion.score) >= 0);
  if (!pts.length) return `<p class="muted">Aún no hay puntuación para ver la evolución.</p>`;
  const sorted = pts.slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || ((a.at || 0) - (b.at || 0)));
  return `<div class="evo">${sorted.map(t => {
    const s = Math.max(0, Math.min(100, Math.round(Number(t.conclusion.score))));
    return `<div class="evo-row"><span class="tiny">${escHtml(t.date || "—")}</span><div class="evo-bar" role="img" aria-label="${s} sobre 100"><span style="width:${s}%"></span></div><b>${s}</b></div>`;
  }).join("")}</div>`;
}
function tastingHistoryCard(t) {
  const boca = t.boca || {};
  const note = (t.conclusion && t.conclusion.note) || "";
  const score = t.conclusion && t.conclusion.score != null && t.conclusion.score !== "" ? t.conclusion.score : null;
  const aromas = (t.nariz && t.nariz.aromas) || [];
  const bits = [t.vista && t.vista.hue, aromas.slice(0, 4).join(", ")].filter(Boolean).join(" · ");
  const axes = ["Acidez " + (boca.acidez == null ? "—" : boca.acidez), "Dulzor " + (boca.dulzor == null ? "—" : boca.dulzor), "Tanino " + (boca.tanino == null ? "—" : boca.tanino), "Cuerpo " + (boca.cuerpo == null ? "—" : boca.cuerpo)];
  if (boca.final != null && boca.final !== "") axes.push("Final " + boca.final);
  return `<article class="card taste-card" style="margin-top:8px">
    <div class="row"><h3>${escHtml(t.date || "Sin fecha")}</h3>${score != null ? `<span class="badge">${escHtml(String(score))}</span>` : `<span class="tiny">Sin puntuación</span>`}</div>
    ${bits ? `<p class="tiny" style="margin-top:6px">${escHtml(bits)}</p>` : ""}
    <p class="muted" style="margin-top:6px">${escHtml(axes.join(" · "))}</p>
    ${note ? `<p style="margin-top:6px">${escHtml(note)}</p>` : ""}
    <button class="btn btn-ghost" style="margin-top:8px" onclick="editTasting('${escHtml(t.id)}')">Editar</button>
  </article>`;
}
function tasteAxis(left, right, id, val) {
  const v = val == null || val === "" || Number.isNaN(Number(val)) ? 5 : val;
  return `<div class="axis"><span>${left}</span><input id="${id}" type="range" min="1" max="10" value="${v}"><span>${right}</span></div>`;
}
function tastingFormHtml(w, entry) {
  entry = entry || blankTasting(w.id, tastingLink || {});
  const vista = entry.vista || {};
  const nariz = entry.nariz || {};
  const boca = entry.boca || {};
  const conclusion = entry.conclusion || {};
  const hues = hueOptions(w).map(h => `<button type="button" class="chip ${vista.hue === h ? "on" : ""}" data-hue="${escHtml(h)}" onclick="pickTasteChip(this, 'hue')">${h}</button>`).join("");
  const families = AROMA_FAMILIES.map(f => {
    const chips = f.chips.map(a => `<button type="button" class="chip ${(nariz.aromas || []).indexOf(a) >= 0 ? "on" : ""}" data-aroma="${escHtml(a)}" onclick="pickTasteChip(this, 'aroma')">${a}</button>`).join("");
    return `<div class="aroma-family"><p class="tiny">${f.label}</p><div class="chip-row">${chips}</div></div>`;
  }).join("");
  const score = conclusion.score == null || conclusion.score === "" ? "" : conclusion.score;
  return `<div id="taste-form">
    <p class="cata-mark">✎</p>
    <h2 class="cata-title">${entry.id && tastingEditId ? "Editar cata" : "Hoja de cata"}</h2>
    <p class="cata-kicker">Tu nota, no la de las guías.</p>
    <label class="field"><span>Fecha</span><input id="taste-date" type="date" value="${escHtml(entry.date || todayIso())}"></label>
    <h3 style="margin-top:14px">Vista</h3>
    <div class="chip-row" id="taste-hues">${hues}</div>
    <p class="tiny">Intensidad</p>
    ${tasteAxis("Pálido", "Cubierto", "taste-vista-int", vista.intensity == null ? 5 : vista.intensity)}
    <h3 style="margin-top:14px">Nariz</h3>
    <p class="tiny">Intensidad</p>
    ${tasteAxis("Cerrada", "Intensa", "taste-nariz-int", nariz.intensity == null ? 5 : nariz.intensity)}
    ${families}
    <label class="field"><span>Otros aromas</span><textarea id="taste-nariz-text" placeholder="Lo que no está en las fichas">${escHtml(nariz.text || "")}</textarea></label>
    <h3 style="margin-top:14px">Boca</h3>
    ${tasteAxis("Débil", "Ácido", "taste-acidez", boca.acidez == null ? 6 : boca.acidez)}
    ${tasteAxis("Seco", "Dulce", "taste-dulzor", boca.dulzor == null ? 2 : boca.dulzor)}
    ${tasteAxis("Suave", "Tánico", "taste-tanino", boca.tanino == null ? 6 : boca.tanino)}
    ${tasteAxis("Ligero", "Poderoso", "taste-cuerpo", boca.cuerpo == null ? 7 : boca.cuerpo)}
    <p class="tiny">Final / persistencia</p>
    ${tasteAxis("Corto", "Largo", "taste-final", boca.final == null ? 5 : boca.final)}
    <h3 style="margin-top:14px">Conclusión</h3>
    <label class="field"><span>Puntuación (0–100)</span><input id="taste-score" type="number" min="0" max="100" step="1" placeholder="85" value="${escHtml(String(score))}"></label>
    <label class="recuerdo">Recuerdo
      <textarea id="taste-note" placeholder="¿Qué se te queda en la memoria?">${escHtml(conclusion.note || "")}</textarea>
    </label>
    <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="saveTasting()">Guardar cata</button>
    <p class="cata-foot">Casa Llavaneras</p>
  </div>`;
}
function tastingScreen(w) {
  const list = tastingsOf(w.id);
  const editing = tastingEditId ? tastingById(w.id, tastingEditId) : null;
  const history = list.length ? list.slice().reverse().map(tastingHistoryCard).join("") : `<p class="empty">Aún no hay catas de este vino.</p>`;
  return `
    <h2>Historial</h2>
    <div id="taste-history">${history}</div>
    <h2 style="margin-top:16px">Evolución</h2>
    <div id="taste-evolution">${evolutionHtml(list)}</div>
    <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="newTasting()">Nueva cata</button>
    ${tastingFormHtml(w, editing || blankTasting(w.id, tastingLink || {}))}`;
}
function pickTasteChip(btn, kind) {
  if (!btn) return;
  if (kind === "hue") {
    const on = btn.classList.contains("on");
    $$("#taste-hues .chip").forEach(c => c.classList.remove("on"));
    if (!on) btn.classList.add("on");
    return;
  }
  btn.classList.toggle("on");
}
function newTasting() {
  tastingEditId = "";
  tastingLink = tastingLink || null;
  if (currentWine) openWineSub("taste");
}
function editTasting(id) {
  tastingEditId = id;
  if (currentWine) openWineSub("taste");
}
function startTastingForConsumption(id) {
  const row = (state.consumption || []).find(c => c.id === id);
  if (!row || !row.wineId) return toast("Esa bebida ya no está");
  tastingEditId = "";
  tastingLink = { consumptionId: row.id, date: row.date || todayIso() };
  openWine(row.wineId);
  openWineSub("taste");
}
function readTastingForm(wineId) {
  const hueBtn = document.querySelector("#taste-hues .chip.on");
  const aromas = $$("#taste-form [data-aroma].on").map(b => b.getAttribute("data-aroma")).filter(Boolean);
  const num = (id, fallback) => {
    const el = document.getElementById(id);
    const n = el ? Number(el.value) : NaN;
    return Number.isFinite(n) ? n : fallback;
  };
  const scoreRaw = (document.getElementById("taste-score") && document.getElementById("taste-score").value || "").trim();
  let score = null;
  if (scoreRaw !== "") {
    const n = Math.round(Number(scoreRaw));
    if (n >= 0 && n <= 100) score = n;
  }
  const prev = tastingEditId ? tastingById(wineId, tastingEditId) : null;
  const entry = prev ? JSON.parse(JSON.stringify(prev)) : blankTasting(wineId, tastingLink || {});
  entry.date = (document.getElementById("taste-date") && document.getElementById("taste-date").value) || entry.date || todayIso();
  const at = Date.parse(entry.date + "T12:00:00");
  if (Number.isFinite(at)) entry.at = at;
  entry.vista = { hue: hueBtn ? hueBtn.getAttribute("data-hue") : "", intensity: num("taste-vista-int", 5) };
  entry.nariz = {
    intensity: num("taste-nariz-int", 5),
    aromas: aromas,
    text: (document.getElementById("taste-nariz-text") && document.getElementById("taste-nariz-text").value || "").trim()
  };
  entry.boca = {
    acidez: num("taste-acidez", 6),
    dulzor: num("taste-dulzor", 2),
    tanino: num("taste-tanino", 6),
    cuerpo: num("taste-cuerpo", 7),
    final: num("taste-final", 5)
  };
  entry.conclusion = {
    score: score,
    note: (document.getElementById("taste-note") && document.getElementById("taste-note").value || "").trim()
  };
  if (tastingLink && tastingLink.consumptionId && !entry.consumptionId) entry.consumptionId = tastingLink.consumptionId;
  return entry;
}
function saveTasting() {
  const w = currentWine;
  if (!w) return;
  const entry = readTastingForm(w.id);
  state.tasting = state.tasting || {};
  const list = Array.isArray(state.tasting[w.id]) ? state.tasting[w.id] : [];
  const idx = list.findIndex(t => t.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  state.tasting[w.id] = list;
  save();
  tastingEditId = "";
  tastingLink = null;
  toast("Cata guardada");
  openWineSub("taste");
}
const VESSEL_LABELS = { barrica: "Barrica", fudre: "Fudre", deposito: "Depósito", anfora: "Ánfora", botella: "Botella", hormigon: "Hormigón", mixto: "Mixto" };
const OAK_LABELS = { frances: "Francés", americano: "Americano", hungaro: "Húngaro", mixto: "Mixto", ninguno: "Ninguno" };
function selectOptions(map, current, empty) {
  const head = `<option value="">${empty}</option>`;
  return head + Object.keys(map).map(k => `<option value="${k}"${k === current ? " selected" : ""}>${map[k]}</option>`).join("");
}
function openTechEdit() {
  const w = currentWine;
  const box = document.getElementById("tech-edit");
  if (!w || !box) return;
  const grapes = (w.grapes || []).slice();
  if (!grapes.length) grapes.push("");
  const rows = grapes.map((g, i) => grapeRowHtml(i, g, w.grapePct && w.grapePct[g] ? w.grapePct[g] : "")).join("");
  const e = w.elevage || {};
  box.innerHTML = `<div class="card" style="margin-top:10px">
    <h3>Uvas</h3>
    <p class="tiny">El porcentaje es opcional. La lista que ya tenías se queda.</p>
    <div id="grape-rows">${rows}</div>
    <button class="btn btn-ghost" style="margin-top:8px" onclick="addGrapeRow()">Añadir uva</button>
    <h3 style="margin-top:14px">Crianza</h3>
    <label class="field"><span>Meses</span><input id="elev-months" type="number" min="0" max="120" placeholder="18" value="${e.months || ""}"></label>
    <label class="field"><span>Recipiente</span><select id="elev-vessel">${selectOptions(VESSEL_LABELS, e.vessel || "", "Sin dato")}</select></label>
    <label class="field"><span>Roble</span><select id="elev-oak">${selectOptions(OAK_LABELS, e.oak || "", "Sin dato")}</select></label>
    <label class="field"><span>% roble nuevo</span><input id="elev-new" type="number" min="0" max="100" placeholder="30" value="${e.newOak == null ? "" : e.newOak}"></label>
    <label class="field"><span>Texto libre</span><textarea id="elev-text" placeholder="La crianza, con tus palabras">${escHtml(w.crianza || "")}</textarea></label>
    <button class="btn btn-gold" style="width:100%" onclick="saveTechEdit()">Guardar uvas y crianza</button>
  </div>`;
}
function grapeRowHtml(i, name, pct) {
  return `<div class="grape-row"><input class="grape-name" data-i="${i}" value="${escHtml(name)}" placeholder="Tempranillo"><input class="grape-pct" type="number" min="0" max="100" placeholder="%" value="${escHtml(String(pct))}"></div>`;
}
function addGrapeRow() {
  const host = document.getElementById("grape-rows");
  if (!host) return;
  host.insertAdjacentHTML("beforeend", grapeRowHtml(host.children.length, "", ""));
}
function saveTechEdit() {
  const w = currentWine;
  if (!w) return;
  const names = [];
  const pct = {};
  $$("#grape-rows .grape-row").forEach(row => {
    const name = (row.querySelector(".grape-name").value || "").replace(/\s+/g, " ").trim();
    if (!name) return;
    names.push(name);
    const n = Math.round(Number(row.querySelector(".grape-pct").value));
    if (n > 0 && n <= 100) pct[name] = n;
  });
  const months = Math.round(Number(document.getElementById("elev-months").value));
  const vessel = document.getElementById("elev-vessel").value;
  const oak = document.getElementById("elev-oak").value;
  const neuRaw = document.getElementById("elev-new").value;
  const neu = neuRaw === "" ? null : Math.round(Number(neuRaw));
  const text = (document.getElementById("elev-text").value || "").trim();
  const elevage = {};
  if (months > 0) elevage.months = months;
  if (vessel) elevage.vessel = vessel;
  if (oak) elevage.oak = oak;
  if (neu != null && neu >= 0 && neu <= 100 && neuRaw !== "") elevage.newOak = neu;
  state.wineEdits = state.wineEdits || {};
  state.wineEdits[w.id] = {
    grapes: names,
    grapePct: pct,
    crianza: text,
    elevage: elevage,
    user: { grapes: true, crianza: true, elevage: true }
  };
  applyStoredWineEdit(w);
  save();
  toast("Uvas y crianza guardadas");
  openWineSub("tecnica");
}
function openWineMenu() {
  if (!currentWine) return;
  showSheet("wine-menu-sheet");
}
function openWineSub(kind) {
  currentSub = kind;
  const w = currentWine;
  if (!w) return;
  normalizeWine(w);
  const p = phaseOf(w);
  const pr = progressOf(w);
  const r = w.ratings;
  const titles = {
    ratings: "Calificaciones",
    pairings: "Maridajes",
    keep: "Conservación",
    servicio: "Servicio en copa",
    tecnica: "Ficha técnica",
    historia: "Historia",
    mercado: "Valor de mercado",
    evolve: "Evolución",
    profile: "Perfil",
    origen: "Origen y hueco",
    mapa: "Mapa y bodega",
    vinos: "Vinos de la zona",
    taste: "Cuaderno de cata",
    anadas: "Añadas",
    compras: "Compras e historial",
    bottle: currentBottle ? "Ubicación física" : "Añadir a vinoteca"
  };
  let body = "";
  if (kind === "ratings") {
    const d = dossierOf(w);
    const casaRaw = publishedNote({ note: w.tasting });
    const casa = casaRaw || (w.provenance ? "Sin dato" : (w.tasting || "").trim());
    const noteOf = (obj, extra) => {
      const n = publishedNote(obj) || publishedNote({ note: extra });
      if (n && n !== casa) return n;
      if (w.provenance) return "Sin dato";
      return "Sin párrafo propio de esta guía para la añada. La nota de la casa está abajo.";
    };
    const card = (fuente, puntos, texto) => `
      <div class="card" style="margin-top:10px">
        <div class="row"><p class="tiny">${fuente}</p><b>${puntos || "—"}</b></div>
        <p style="margin-top:8px;line-height:1.5">${texto}</p>
      </div>`;
    body = `
      <p class="tiny" style="margin:6px 0 8px">Guías del sector + nota de la casa. Vivino no tiene API: la media es de dossier, no de la web en vivo.</p>
      <div class="temp-grid" style="margin:8px 0 12px">
        <div class="temp"><span class="tiny">Vivino</span><b>${rateScore(r.vivino.score, 1)}</b></div>
        <div class="temp"><span class="tiny">Peñín</span><b>${rateScore(r.penin.score, 0)}</b></div>
        <div class="temp"><span class="tiny">Parker / WA</span><b>${rateScore(r.parker.score, 0)}</b></div>
        <div class="temp"><span class="tiny">Spectator</span><b>${rateScore(r.spectator.score, 0)}</b></div>
      </div>
      ${card("Guía Peñín" + (r.penin.estimate ? " · estimación" : ""), r.penin.score ? r.penin.score + "/100" : "Sin dato", noteOf(r.penin))}
      ${card((r.parker.reviewer || "Wine Advocate") + (r.parker.estimate ? " · estimación" : ""), r.parker.score ? r.parker.score + "/100" : "Sin dato", noteOf(r.parker))}
      ${card("Wine Spectator" + (r.spectator.estimate ? " · estimación" : ""), r.spectator.score ? r.spectator.score + "/100" : "Sin dato", noteOf(r.spectator, r.spectator.note))}
      ${card("Decanter" + (r.decanter && r.decanter.estimate ? " · estimación" : ""), (r.decanter && r.decanter.score ? r.decanter.score + "/100" : "Sin dato"), noteOf(r.decanter))}
      ${card("Vivino · usuarios" + (r.vivino.estimate ? " · estimación" : ""), (r.vivino.score ? r.vivino.score.toFixed(1) + "/5 · " + (r.vivino.count || "Sin dato") + " valoraciones" : "Sin dato"), noteOf(r.vivino))}
      ${card("Nota de cata (casa)", "ficha", casa)}
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">Referencias</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('taste')">Cata personal ›</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('historia')">Historia y añada ›</button>`;
  } else if (kind === "pairings") {
    body = pairingBlock(w);
  } else if (kind === "keep") {
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">Vinoteca</span><b>${shownTemp(w, "cellar")}</b></div>
        <div class="temp"><span class="tiny">Servicio</span><b>${shownTemp(w, "service")}</b></div>
        <div class="temp"><span class="tiny">Humedad</span><b>${fieldIsReal(w, "cellar") ? w.conservation.humidity : "Sin dato"}</b></div>
        <div class="temp"><span class="tiny">Posición</span><b style="font-size:16px">${fieldIsReal(w, "cellar") ? w.conservation.position : "Sin dato"}</b></div>
      </div>
      <div class="card">
        <p class="muted">Luz: ${w.conservation.light}. El corcho vive con humedad ${corkHumidity(w)}: por debajo se reseca y entra oxígeno; por encima hay moho en la cápsula.</p>
        ${adviseCave(w)}
      </div>
      <div class="card">
        <strong>Cómo conservarlo</strong>
        <p class="muted" style="margin-top:6px">Horizontal, oscuro, sin UV ni vibración de electrodomésticos. Estabilidad antes que la cifra exacta: más de 2 °C de oscilación acelera la evolución.</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="openWineSub('servicio')">Protocolo de servicio ›</button>`;
  } else if (kind === "servicio") {
    const d = dossierOf(w);
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">Servir</span><b>${shownTemp(w, "service")}</b></div>
        <div class="temp"><span class="tiny">Decantar</span><b style="font-size:16px">${d.decant}</b></div>
      </div>
      <div class="card"><p class="tiny">Copa</p><p>${d.glass}</p></div>
      <div class="card"><p class="tiny">Oxígeno</p><p class="muted" style="margin-top:6px">${d.oxygen}</p></div>
      <div class="card"><p class="tiny">Guarda en cava</p><p class="muted" style="margin-top:6px">${shownTemp(w, "cellar")} · ${fieldIsReal(w, "cellar") ? w.conservation.humidity : "Sin dato"} · ${fieldIsReal(w, "cellar") ? w.conservation.position : "Sin dato"}</p></div>`;
  } else if (kind === "tecnica") {
    const d = dossierOf(w);
    body = `
      ${provenanceCard(w)}
      <div class="fact"><span>Uvas</span><b>${escHtml(grapeLine(w))}</b></div>
      <div class="fact"><span>Alcohol</span><b>${w.abv ? w.abv + "% vol." : "—"}</b></div>
      <div class="fact"><span>Estilo</span><b>${escHtml(styleLabel(w))}</b></div>
      ${w.provenance ? `<div class="fact"><span>Zona</span><b>${escHtml([w.appellation || w.region, w.country].filter(Boolean).join(" · ") || "—")}</b></div>
      <div class="fact"><span>Beber</span><b>${datesAreReal(w) ? w.aging.drinkFrom + "–" + w.aging.peakEnd : "Sin dato"}</b></div>
      <div class="fact"><span>Límite</span><b>${datesAreReal(w) ? w.aging.holdTo : "Sin dato"}</b></div>
      <div class="fact"><span>Maridaje</span><b>${escHtml((w.pairing || []).join(", ") || "—")}</b></div>` : ""}
      <div class="fact"><span>Altitud</span><b>${d.elevation}</b></div>
      <div class="card" style="margin-top:12px"><p class="tiny">Suelos</p><p class="muted" style="margin-top:6px">${d.soils}</p></div>
      <div class="card"><p class="tiny">Viñedo</p><p class="muted" style="margin-top:6px">${d.vineyard}</p></div>
      <div class="card"><p class="tiny">Vinificación</p><p class="muted" style="margin-top:6px">${d.vinification}</p></div>
      <div class="card"><p class="tiny">Crianza</p>${elevageLine(w) ? `<p style="margin-top:6px">${escHtml(elevageLine(w))}</p>` : ""}<p class="muted" style="margin-top:6px">${escHtml(userLocked(w, "crianza") ? (w.crianza || "Sin texto") : (w.crianza || d.elevage || "Sin texto"))}</p></div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openTechEdit()">Editar uvas y crianza</button>
      <div id="tech-edit"></div>`;
  } else if (kind === "historia") {
    const d = dossierOf(w);
    const paras = String(d.history || (w.producer + " se elabora en " + w.region + ".")).split("\n").filter(Boolean);
    body = `
      ${mapTabs("historia")}
      ${paras.map(t => `<div class="card"><p style="line-height:1.5">${t}</p></div>`).join("")}
      <div class="card"><p class="tiny">Elaboración</p><p style="margin-top:8px">${d.vinification}</p><p class="muted" style="margin-top:8px">${d.elevage}</p></div>
      <div class="card"><p class="tiny">Crítica de añada ${w.vintage}</p>
        <p style="margin-top:8px;line-height:1.45">${escHtml(criticBlurb(w))}</p>
        <p class="muted" style="margin-top:8px">${escHtml(criticMeters(w))}</p>
        ${(r.penin && r.penin.note) ? `<p class="muted" style="margin-top:10px">${r.penin.note}</p>` : ""}
      </div>
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">Referencias</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('evolve')">Evolución y fechas ›</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('mapa')">Volver al mapa</button>`;
  } else if (kind === "mercado") {
    body = `<div id="mercado-box">${mercadoSkeleton(w)}</div>`;
    setTimeout(() => fillMercado(w), 0);
  } else if (kind === "evolve") {
    const when = datesAreReal(w)
      ? `Añada ${w.vintage}. Beber desde ${w.aging.drinkFrom}. Apogeo ${w.aging.peakStart}–${w.aging.peakEnd}. Límite prudente ${w.aging.holdTo}.`
      : `Añada ${w.vintage}. Ventana de consumo: Sin dato.`;
    body = `
      <p class="muted" style="margin:6px 0">${when}</p>
      <div class="peak-pill">${datesAreReal(w) ? (p.label || "").toUpperCase() : "SIN DATO"}</div>
      ${datesAreReal(w) ? `<div class="bar"><i style="width:${pr.pct}%"></i></div>
      <div class="row tiny"><span>${w.vintage}</span><span>hoy ${YEAR}</span><span>${w.aging.holdTo}</span></div>` : ""}
      <div class="timeline">
        ${(w.evolutionNotes || []).map(n => `<div class="tl-item"><em>${n.year} · ${n.phase}</em><strong>${escHtml(n.text)}</strong></div>`).join("")}
        <div class="tl-item"><em>${YEAR} · Estado actual</em><strong>${datesAreReal(w) ? currentAdvice(w, p) : "Sin dato de ventana. Pulsa Completar ficha."}</strong></div>
      </div>`;
  } else if (kind === "profile") {
    body = `
      <p class="muted">${w.appellation} · ${w.country}</p>
      <h3 style="margin:8px 0 6px">${w.producer}</h3>
      <p>${w.name} ${w.vintage}</p>
      <div class="card" style="margin-top:12px">
        <h2>Cata publicada</h2>
        <p style="margin-top:8px">${w.tasting}</p>
      </div>
      <div class="card">
        <p>Uvas: ${(w.grapes || []).join(", ") || "—"}</p>
        <p class="muted">${w.abv ? w.abv + "% vol." : "Sin dato"} · ${escHtml(styleLabel(w))} · ${w.priceHint && w.priceHint !== "—" ? escHtml(w.priceHint) : "Sin dato"}</p>
      </div>
      <div class="card">
        <p class="tiny">Suelos</p>
        <p class="muted" style="margin-top:6px">${dossierOf(w).soils}</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('tecnica')">Ficha técnica completa ›</button>`;
  } else if (kind === "origen") {
    const b = currentBottle;
    const pend = pendingForWine(w.id)[0];
    const pos = b ? (b.bin || "sin hueco") : (pend && pend.bin ? pend.bin + " · pendiente" : "—");
    const caveLabel = b ? cellarName(b.cellarId) : (pend ? cellarName(pend.cellarId) + " · aún no está en la bodega" : "No está en cava");
    body = `
      <div class="fact"><span>Posición</span><b>${pos}</b></div>
      <div class="fact"><span>Vinoteca</span><b>${caveLabel}</b></div>
      <div class="fact"><span>Bodega</span><b>${w.producer}</b></div>
      <div class="fact"><span>Añada</span><b>${w.vintage}</b></div>
      <div class="fact"><span>Denominación</span><b>${w.appellation}</b></div>
      <div class="fact"><span>Región</span><b>${w.region}</b></div>
      <div class="fact"><span>País</span><b>${w.country}</b></div>
      ${b && b.price ? `<div class="fact"><span>Precio</span><b>${b.price} €</b></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:14px" onclick="openWineSub('mapa')">Ver mapa de la zona</button>`;
  } else if (kind === "mapa") {
    body = mapaBlock(w) + mapTabs("mapa");
  } else if (kind === "vinos") {
    const house = WINE_CATALOG.filter(x => x.producer === w.producer);
    const zone = WINE_CATALOG.filter(x => x.producer !== w.producer && (x.region === w.region || x.appellation === w.appellation));
    const ownHouse = (!house.length && w.houseWines) ? w.houseWines : [];
    body = mapTabs("vinos") + `
      <h2>${w.producer}</h2>
      ${house.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.name} ${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
        <p class="muted">${s.appellation}</p>
      </div>`).join("") || ownHouse.map(s => `<div class="card"><div class="row"><h3>${escHtml(s.name)}</h3></div><p class="muted">${escHtml(s.note || "")}</p></div>`).join("") || `<p class="muted">${w.provenance ? "Sin dato" : "Solo esta referencia de la casa."}</p>`}
      ${zone.length ? `<h2 style="margin-top:16px">Misma zona</h2>` + zone.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.producer} ${s.name}</h3><span class="badge">${s.vintage}</span></div>
      </div>`).join("") : ""}`;
  } else if (kind === "anadas") {
    const sibs = WINE_CATALOG.filter(x => x.producer === w.producer && x.name === w.name);
    const extra = (!sibs.length && Array.isArray(w.vintages)) ? w.vintages : [];
    body = sibs.length ? sibs.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
      <div class="row"><h3>${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
      <p class="muted">${s.priceHint} · ${phaseOf(s).label}</p>
    </div>`).join("") : (extra.length ? extra.map(s => `<div class="card">
      <div class="row"><h3>${escHtml(String(s.vintage))}</h3></div>
      <p class="muted">${escHtml([s.priceHint, s.note].filter(Boolean).join(" · ") || "Sin dato")}</p>
    </div>`).join("") : `<p class="muted">${w.provenance ? "Sin dato" : "No hay otras añadas en el catálogo."}</p>`);
  } else if (kind === "compras") {
    const b = currentBottle;
    const d = dossierOf(w);
    const cost = b && b.price && !state.prefs.hidePrices ? b.price : null;
    const est = d.market && d.market.mid ? d.market.mid : null;
    const pct = cost && est ? Math.round(((est - cost) / cost) * 100) : null;
    body = state.prefs.hideValue ? `<p class="muted">Valor oculto en Privacidad.</p>` : `
      <div class="temp-grid">
        <div class="temp"><span class="tiny">Compra</span><b>${cost ? cost + " €" : "—"}</b></div>
        <div class="temp"><span class="tiny">Estimado</span><b>${est ? est + " €" : "—"}</b></div>
        <div class="temp"><span class="tiny">Δ</span><b>${pct == null ? "—" : (pct>=0?"+":"")+pct+"%"}</b></div>
        <div class="temp"><span class="tiny">Uds</span><b>${b ? b.qty : 0}</b></div>
      </div>
      <div class="card"><p class="tiny">Movimientos</p>
        ${b ? `<p style="margin-top:8px">Compra · ${b.qty} bot. · ${b.bought || "fecha n/d"} ${cost ? "· "+cost+" €/bot." : ""}</p>
        ${b.note ? `<p class="muted">${b.note}</p>` : ""}` : `<p class="muted">Aún no está en cava.</p>`}
      </div>
      <button class="btn btn-ghost" style="width:100%" onclick="openWineSub('mercado')">Horquilla de mercado ›</button>`;
  } else if (kind === "taste") {
    body = tastingScreen(w);
  } else {
    const cave = currentBottle && state.vinotecas.find(v => v.id === currentBottle.cellarId);
    body = currentBottle ? `
      <p class="tiny">${houseName(cave && cave.houseId)} · ${cellarName(currentBottle.cellarId)}</p>
      ${cave && cave.photo ? `<img class="estate-wide" src="${cave.photo}" alt="Vinoteca">` : `<img class="estate-wide" src="cave-principal.jpg" alt="Cava">`}
      <div class="fact"><span>Estantería / hueco</span><b>${state.prefs.hideBin ? "Oculto" : (currentBottle.bin || "sin hueco")}</b></div>
      <div class="fact"><span>Cantidad</span><b>${currentBottle.qty}</b></div>
      <div class="fact"><span>Entrada</span><b>${currentBottle.bought || "—"}</b></div>
      ${!state.prefs.hidePrices && currentBottle.price ? `<div class="fact"><span>Precio</span><b>${currentBottle.price} €</b></div>` : ""}
      ${currentBottle.note ? `<div class="card"><p>${currentBottle.note}</p></div>` : ""}
      ${resolveLabelRef(currentBottle.labelPhoto) ? `<img class="cave-photo" src="${resolveLabelRef(currentBottle.labelPhoto)}" alt="Etiqueta escaneada" />` : ""}
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="addToLot(1)">+1</button>
        <button class="btn btn-gold" onclick="askServe(1)">Servir 1</button>
        <button class="btn btn-ghost" onclick="askServeMany()">Servir N</button>
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="showSheet('move-sheet')">Mover lote</button>
        <button class="btn btn-ghost" onclick="showLotInCave()">Ver en la vinoteca</button>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="showSheet('add-sheet')">Otra ubicación</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('compras')">Compras e historial ›</button>` : `
      <p class="muted" style="margin-bottom:12px">Este vino aún no está en tu cava.</p>
      <div class="btn-row">
        <button class="btn btn-gold" onclick="quickAdd('${w.id}')">Añadir a vinoteca</button>
        <button class="btn btn-ghost" onclick="showSheet('add-sheet')">Elegir hueco</button>
      </div>`;
  }
  const art = estateArt(w);
  const bodegaImg = "";
  const titleCss = kind === "mapa" ? "font-size:22px;margin:4px 0 10px;line-height:1.15" : "margin-bottom:16px";
  const eyeCss = kind === "mapa" ? "font-size:10px;margin:0" : "";
  $("#wine-sub-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    ${bodegaImg}
    <p class="eyebrow" style="${eyeCss}">${w.name} ${w.vintage}</p>
    <h1 style="${titleCss}">${titles[kind] || "Ficha"}</h1>
    ${body}`;
  show("wine-sub");
}
function provenanceCard(w) {
  if (!w || !w.provenance) return "";
  const labels = {
    type: "tipo", grapes: "uvas", region: "zona", country: "país", abv: "alcohol",
    tasting: "cata", crianza: "crianza", service: "servicio", cellar: "guarda",
    pairing: "maridajes", aging: "fechas de consumo", producer: "bodega",
    style: "estilo", ratings: "puntuaciones", dossier: "historia y técnica",
    web: "web y mapa", price: "precio", evolution: "evolución", vintages: "añadas", shops: "tiendas"
  };
  const buckets = {};
  Object.keys(labels).forEach(k => {
    const src = w.provenance[k] || "valor por defecto";
    buckets[src] = buckets[src] || [];
    buckets[src].push(labels[k]);
  });
  const lines = ["página", "título", "estimación Gemini", "valor por defecto"].filter(src => buckets[src] && buckets[src].length).map(src =>
    `<p style="margin-top:8px"><b>${escHtml(src)}</b><span class="muted"> · ${escHtml(buckets[src].join(", "))}</span></p>`
  ).join("");
  const host = w.provenance.pageHost ? `<p class="tiny" style="margin-top:6px">Página leída: ${escHtml(w.provenance.pageHost)}</p>` : "";
  const why = w.provenance.geminiNote ? `<p style="margin-top:8px">${escHtml(w.provenance.geminiNote)}</p>` : "";
  return `<div class="card"><p class="tiny">De dónde sale cada dato</p>${host}${why}${lines}</div>`;
}
function priceHistoryBlock(w) {
  if (!w || (!w.provenance && !(w.priceHistory && w.priceHistory.length))) return "";
  const rows = Array.isArray(w.priceHistory) ? w.priceHistory : [];
  if (!rows.length) return `<div class="card"><p class="tiny">Evolución de precio</p><p class="muted" style="margin-top:6px">Sin dato</p></div>`;
  return `<div class="card"><p class="tiny">Evolución de precio</p>${rows.map(r => `<p style="margin-top:8px">${escHtml(String(r.year))} · ${escHtml(String(r.mid))} €</p>`).join("")}</div>`;
}
function mercadoSkeleton(w) {
  const band = marketBand(w);
  const mine = currentBottle && currentBottle.price ? currentBottle.price + " €" : "—";
  const euro = (n) => n ? n + " €" : "Sin dato";
  return `
    <p class="muted" style="margin:6px 0 10px">${band.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">Baja</span><b>${euro(band.low)}</b></div>
      <div class="temp"><span class="tiny">Media</span><b>${euro(band.mid)}</b></div>
      <div class="temp"><span class="tiny">Alta</span><b>${euro(band.high)}</b></div>
      <div class="temp"><span class="tiny">Tu coste</span><b>${mine}</b></div>
    </div>
    <p class="tiny" id="mercado-src">${band.source === "ficha" ? "Ficha" : band.source === "dossier" ? "Dossier" : "Sin fuente"} · EUR</p>
    ${priceHistoryBlock(w)}`;
}
async function fillMercado(w) {
  const box = document.getElementById("mercado-box");
  if (!box || !window.WineDataProvider) return;
  const band = marketBand(w);
  let quote;
  try {
    quote = await WineDataProvider.priceOf(w);
  } catch (err) {
    quote = { low: band.low, mid: band.mid, high: band.high, currency: "EUR", source: band.source, note: band.note, trend: "" };
  }
  if (!quote.low && !quote.mid && !quote.high) {
    quote.low = band.low;
    quote.mid = band.mid;
    quote.high = band.high;
    quote.note = (quote.note ? quote.note + " " : "") + band.note;
    quote.source = band.source;
  }
  if (!document.getElementById("mercado-box")) return;
  const d = dossierOf(w);
  const mine = currentBottle && currentBottle.price ? currentBottle.price + " €" : "—";
  const euro = (n) => n ? n + " €" : "Sin dato";
  const tag = quote.source === "gemini" ? "Gemini" : quote.source === "live" ? "Live" : (quote.source === "ficha" ? "Página" : "Dossier");
  box.innerHTML = `
    <p class="muted" style="margin:6px 0 10px">${quote.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">Baja</span><b>${euro(quote.low)}</b></div>
      <div class="temp"><span class="tiny">Media</span><b>${euro(quote.mid)}</b></div>
      <div class="temp"><span class="tiny">Alta</span><b>${euro(quote.high)}</b></div>
      <div class="temp"><span class="tiny">Tu coste</span><b>${mine}</b></div>
    </div>
    <div class="card"><p class="tiny">${tag} · ${quote.currency || "EUR"}${quote.confianza ? " · confianza " + quote.confianza : ""}</p>
      <p class="muted" style="margin-top:6px">${quote.trend || ""}</p></div>
    ${priceHistoryBlock(w)}
    ${d.similar && d.similar.length ? `<h2 style="margin:16px 0 8px">Parecidos en catálogo</h2>${d.similar.map(id => {
      const s = wineById(id);
      if (!s) return "";
      return `<div class="card" role="button" onclick="openWine('${s.id}')"><h3>${s.producer} ${s.name} ${s.vintage}</h3><p class="muted">${s.region} · ${s.priceHint}</p></div>`;
    }).join("")}` : ""}
    <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openNotify()">Configurar fuente de precios</button>`;
}
function setTaste(id, field, val) {
  if (!state.tasting) state.tasting = {};
  const list = Array.isArray(state.tasting[id]) ? state.tasting[id] : [];
  let entry = list[list.length - 1];
  if (!entry) {
    entry = blankTasting(id);
    list.push(entry);
  }
  entry.boca = entry.boca || {};
  entry.conclusion = entry.conclusion || { score: null, note: "" };
  if (field === "note") entry.conclusion.note = val;
  else entry.boca[field] = Number(val);
  entry.at = Date.now();
  state.tasting[id] = list;
  save();
  const el = document.getElementById("tv-" + field);
  if (el) el.textContent = val;
}

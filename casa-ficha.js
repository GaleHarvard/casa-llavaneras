/* Ficha del vino, cata y uvas. */
function renderCatas() {
  const list = lastTastings(20);
  $("#catas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">${t("eyebrow.cellar")}</p>
    <h1>${t("catas.h1")}</h1>
    <button class="btn btn-gold" style="width:100%;margin:10px 0" onclick="quickTaste()">${t("home.quick")}</button>
    ${list.length ? list.map(row => `<div class="card" role="button" onclick="openWineThenTaste('${row.wine.id}')">
      <div class="label-row">${labelThumbHtml(row.wine)}<div class="label-copy"><div class="row"><h3>${row.wine.producer}</h3><span class="tiny">${row.when}</span></div>
      <p class="muted">${row.wine.name} ${row.wine.vintage}</p>
      <p class="tiny" style="margin-top:6px">${row.note || t("catas.noneNote")}</p></div></div>
    </div>`).join("") : `<p class="empty">${t("catas.empty")}</p>`}`;
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
  return rows.map(r => `<p class="tiny" style="text-align:center;margin:6px 0 4px">${t("fact.pendingLine", { cave: cellarName(r.cellarId), bin: r.bin })}</p>`).join("");
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
function shownRating(w, key) {
  const block = (w && w.ratings && w.ratings[key]) || {};
  const note = typeof catalogNote === "function" ? catalogNote(w, key) : (block.note || "");
  return Object.assign({}, block, { note: note });
}
function shownTasting(w) {
  return typeof catalogTasting === "function" ? catalogTasting(w) : ((w && w.tasting) || "");
}
function shownKeep(w, field) {
  if (typeof catalogKeep === "function") return catalogKeep(w, field);
  return (w && w.conservation && w.conservation[field]) || "";
}
function criticBlurb(w) {
  const parker = shownRating(w, "parker");
  const note = publishedNote(parker);
  if (note && publishedScore(w, "parker")) return note;
  const tasting = publishedNote({ note: shownTasting(w) });
  if (tasting.length > 24) {
    const est = w.provenance && w.provenance.tasting === "estimación Gemini";
    return (est ? t("fact.estimateDot") : "") + tasting;
  }
  return "";
}
function manualScoreText(w, key, digits) {
  const block = publishedScore(w, key);
  if (!block) return "";
  const n = Number(String(block.score).replace(",", "."));
  return digits ? n.toFixed(digits) : String(Math.round(n));
}
function manualScoreMeta(block) {
  if (!block) return "";
  return [block.source || block.reviewer, block.date].filter(Boolean).join(" · ");
}
function criticMeters(w) {
  const bits = [];
  const add = (label, key, digits) => {
    const txt = manualScoreText(w, key, digits);
    if (txt) bits.push(label + " " + txt);
  };
  add("WA", "parker", 0);
  add("Peñín", "penin", 0);
  add("WS", "spectator", 0);
  add("Decanter", "decanter", 0);
  add("Vivino", "vivino", 1);
  return bits.join(" · ");
}
function shownTempParts(w, which) {
  const c = (w && w.conservation) || {};
  const realKey = which === "cellar" ? "cellar" : "service";
  if (fieldIsReal(w, realKey)) {
    if (which === "cellar" && c.cellarMin != null && c.cellarMax != null) return { text: c.cellarMin + "–" + c.cellarMax + " °C", orientative: false };
    if (which !== "cellar" && c.serveMin != null && c.serveMax != null) return { text: c.serveMin + "–" + c.serveMax + " °C", orientative: false };
  }
  const hint = indicativeFacts(w);
  const pair = which === "cellar" ? hint.cellar : hint.serve;
  if (!pair) return { text: "", orientative: false };
  return { text: pair[0] + "–" + pair[1] + " °C", orientative: true };
}
function shownTemp(w, which) {
  const p = shownTempParts(w, which);
  if (!p.text) return "";
  return p.orientative ? (p.text + " · " + t("fact.orientative")) : p.text;
}
function keepFieldText(w, field) {
  if (fieldIsReal(w, "cellar")) {
    const v = shownKeep(w, field);
    if (!isNodataText(v)) return v;
  }
  const hint = indicativeFacts(w);
  if (field === "humidity" && hint.humidity) return hint.humidity + " · " + t("fact.orientative");
  if (field === "position" && hint.positionKey) return t(hint.positionKey) + " · " + t("fact.orientative");
  if (field === "light") return t("fact.lightDark") + " · " + t("fact.orientative");
  return "";
}
function factTextCard(title, text) {
  if (isNodataText(text)) return "";
  return `<div class="card"><p class="tiny">${title}</p><p class="muted" style="margin-top:6px">${text}</p></div>`;
}
function factRow(label, value) {
  if (isNodataText(value)) return "";
  return `<div class="fact"><span>${label}</span><b>${escHtml(String(value))}</b></div>`;
}
var scoreUi = { focus: "", form: false };
const SCORE_GUIDES = [
  ["vivino", "Vivino", 1],
  ["penin", "Guía Peñín", 0],
  ["parker", "Parker / WA", 0],
  ["spectator", "Wine Spectator", 0],
  ["decanter", "Decanter", 0]
];
function openRatingsList() {
  scoreUi.focus = "";
  scoreUi.form = false;
  openWineSub("ratings");
}
function openScore(key) {
  scoreUi.focus = key || "";
  scoreUi.form = false;
  openWineSub("ratings");
}
function openScoreForm() {
  scoreUi.focus = "";
  scoreUi.form = true;
  openWineSub("ratings");
}
function referencesHtml(w) {
  const bits = SCORE_GUIDES.map(g => {
    const block = publishedScore(w, g[0]);
    if (!block) return "";
    const n = manualScoreText(w, g[0], g[2]);
    const who = block.source || block.reviewer || "";
    const same = who && normTxt(who) === normTxt(g[1]);
    return n + " " + g[1] + (who && !same ? " · " + who : "") + " · " + t(scoreTagKey(block));
  }).filter(Boolean);
  if (!bits.length) return "";
  return `<div class="card"><p class="tiny">${t("fact.refs")}</p><p style="margin-top:8px">${escHtml(bits.join(" · "))}</p></div>`;
}
function scoreSummaryCard(w, g) {
  const block = publishedScore(w, g[0]);
  if (!block) return "";
  const n = manualScoreText(w, g[0], g[2]);
  const scale = block.scale || (g[0] === "vivino" ? 5 : 100);
  const who = block.source || block.reviewer || "";
  const note = publishedNote(shownRating(w, g[0]));
  const tag = t(scoreTagKey(block));
  return `<div class="card" role="button" style="margin-top:10px" onclick="openScore('${g[0]}')">
    <div class="row"><p class="tiny">${escHtml(g[1])}</p><b>${escHtml(n)}/${scale}</b></div>
    <p class="tiny" style="margin-top:6px">${escHtml([who, tag].filter(Boolean).join(" · "))}</p>
    ${note ? `<p style="margin-top:8px;line-height:1.5">${escHtml(note)}</p>` : ""}
  </div>`;
}
function scoreDetailHtml(w, g) {
  const block = publishedScore(w, g[0]);
  if (!block) return "";
  const n = manualScoreText(w, g[0], g[2]);
  const scale = block.scale || (g[0] === "vivino" ? 5 : 100);
  const who = block.source || block.reviewer || "";
  const note = publishedNote(shownRating(w, g[0]));
  const url = /^https?:\/\//i.test(block.url || "") ? block.url : "";
  return `<div class="card">
    <p class="tiny">${escHtml(g[1])} · ${escHtml(t(scoreTagKey(block)))}</p>
    <p style="font-size:28px;margin:8px 0">${escHtml(n)}<span class="muted">/${scale}</span></p>
    ${who ? `<p>${escHtml(who)}</p>` : ""}
    ${url ? `<p class="muted" style="margin-top:6px"><a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(url)}</a></p>` : ""}
    ${note ? `<p style="margin-top:8px;line-height:1.5">${escHtml(note)}</p>` : ""}
  </div>
  <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openRatingsList()">${t("score.all")}</button>`;
}
function scoreActionRow(w) {
  return `<button type="button" class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openScoreForm()">${t("score.add")}</button>
    <p class="muted" id="score-note" style="margin:8px 0 0"></p>
    <button type="button" class="btn btn-gold" id="score-search" style="width:100%;margin-top:8px" onclick="searchPublishedScores('${w.id}')">${t("score.search")}</button>`;
}
function ratingsHomeHtml(w) {
  const present = SCORE_GUIDES.filter(g => publishedScore(w, g[0]));
  const blurb = criticBlurb(w);
  const meters = criticMeters(w);
  const critic = (blurb || meters) ? `<div class="card" role="button" onclick="openRatingsList()" style="margin:8px 0 12px">
      <p class="tiny">${t("wine.critic")}</p>
      ${blurb ? `<p style="margin-top:8px;line-height:1.45">${escHtml(blurb)}</p>` : ""}
      ${meters ? `<p class="muted" style="margin-top:8px">${escHtml(meters)}</p>` : ""}
    </div>` : "";
  if (!present.length) {
    return `<p class="muted" style="margin:0 0 12px">${escHtml(t("score.noneLine"))}</p>${critic}`;
  }
  return `<div class="rate-grid">${present.map(g => `<div class="rate-card" role="button" onclick="openScore('${g[0]}')">
      <div class="who"><b>${escHtml(g[1])}</b></div>
      <div class="rate-score">${escHtml(manualScoreText(w, g[0], g[2]))}</div>
    </div>`).join("")}</div>${critic}`;
}
function ratingsSubHtml(w) {
  const focus = SCORE_GUIDES.find(g => g[0] === scoreUi.focus && publishedScore(w, g[0]));
  if (focus) return scoreDetailHtml(w, focus) + scoreActionRow(w);
  const cards = SCORE_GUIDES.map(g => scoreSummaryCard(w, g)).join("");
  const empty = cards ? "" : `<p class="muted">${escHtml(t("score.noneLine"))}</p>`;
  return `<p class="tiny" style="margin:6px 0 8px">${t("score.lead")}</p>
    ${referencesHtml(w)}
    ${empty}
    ${cards}
    ${scoreActionRow(w)}
    ${scoreUi.form ? manualScoreForm(w) : ""}`;
}
function indicativeServiceBtn(w) {
  if (!w || (typeof isCatalogWineId === "function" && isCatalogWineId(w.id))) return "";
  if (fieldIsReal(w, "service") && fieldIsReal(w, "cellar")) return "";
  return `<button type="button" class="btn btn-gold" style="width:100%;margin-top:12px" onclick="completeExistingWine('${w.id}')">${t("score.completeGemini")}</button>`;
}
function pairingPackOf(w) {
  if (!w) return null;
  if (window.WINE_PAIRINGS && WINE_PAIRINGS[w.id]) {
    return typeof localizePairingPack === "function" ? localizePairingPack(w.id, WINE_PAIRINGS[w.id]) : WINE_PAIRINGS[w.id];
  }
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
  if (!top) return "";
  const dish = top.dishId ? PAIRING_DISHES.find(d => d.id === top.dishId) : null;
  const title = dish ? dishName(dish) : (top.label || top.why);
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
  const btn = `<button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="completeExistingWine('${w.id}')">${t("fact.complete")}</button>`;
  if (!note) return `<div id="ficha-status">${btn}</div>`;
  const shown = note === NO_GEMINI_NOTE ? t("gemini.noKeyNote") : note;
  return `<div class="card" id="ficha-status"><p>${escHtml(shown)}</p>${btn}</div>`;
}
function setFichaProgress(msg) {
  setScanStatus(msg);
  const el = document.getElementById("ficha-status");
  if (el) el.innerHTML = `<p>${escHtml(msg)}</p>`;
  const box = document.getElementById("scan-results");
  if (box && document.getElementById("scan") && document.getElementById("scan").classList.contains("active")) {
    box.innerHTML = `<div class="card"><p>${escHtml(msg)}</p><p class="tiny">${t("fact.shopHint")}</p></div>`;
  }
}
function wineTranslateCard() {
  return "";
}
function openWine(wineId, bottle) {
  const w = wineById(wineId);
  if (!w) {
    toast(t("wine.noSheet"));
    show("cellar", { tab: true });
    return;
  }
  normalizeWine(w);
  if (refreshDirtyInternetWine(w)) save();
  currentWine = w;
  currentBottle = bottle || state.bottles.find(b => b.wineId === wineId) || null;
  const p = phaseOf(w);
  const backTo = lastList === "wine" ? (bottle ? "cellar" : "scan") : lastList;
  scoreUi.focus = "";
  scoreUi.form = false;
  const range = shownDrinkRange(w);
  const pill = datesAreReal(w) ? (p.label || "").toUpperCase() : (range ? (range + " · " + t("fact.orientative")) : (fieldIsReal(w, "type") && w.type ? typeLabel(w.type).toUpperCase() : ""));

  $("#wine-body").innerHTML = `
    <div class="wine-hero">${estateSVG(w)}</div>
    <h1 class="wine-producer">${escHtml(typeof fichaTitles === "function" ? fichaTitles(w).head : (typeof sheetTitle === "function" ? sheetTitle(w.producer) : (w.producer || "")))}</h1>
    <p class="wine-cuvee">${escHtml(typeof fichaTitles === "function" ? fichaTitles(w).sub : ((typeof sheetTitle === "function" ? sheetTitle(w.name) : (w.name || "")) + (shownYear(w) ? " " + shownYear(w) : "")))}</p>
    ${typeof vintageBlockHtml === "function" ? vintageBlockHtml(w) : ""}
    <button type="button" class="btn btn-ghost label-change" onclick="changeWineLabel()">${t("label.change")}</button>
    <div class="peak-pill">${pill}</div>
    ${currentBottle ? `<p class="tiny" style="text-align:center;margin:6px 0 4px">${t("wine.inCellar", { n: currentBottle.qty, noun: nounBottles(currentBottle.qty) })}</p>` : ""}
    ${currentBottle ? `<button type="button" class="btn btn-ghost baja-btn" onclick="askServe(1)">${t("wine.retire")}</button>` : ""}
    ${wineNeedsData(w) ? `<div class="card miss-card"><p class="tiny">${t("wine.missing")}</p><p class="muted" style="margin-top:6px">${t("wine.missingLead")}</p><button type="button" class="btn btn-gold" onclick="completeExistingWine('${w.id}')">${t("wine.complete")}</button><button type="button" class="btn btn-ghost" onclick="startScan()">${t("wine.scanFront")}</button></div>` : ""}
    ${currentBottle && currentBottle.cellarId ? `<button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="showLotInCave()">${t("wine.seeCave")}</button>` : ""}
    ${pendingPlacementLine(w.id)}
    <div class="wine-tabs">
      <button type="button" onclick="openWineSub('profile')">${t("wine.general")}</button>
      <button type="button" onclick="openWineSub('taste')">${t("wine.tasteTab")}</button>
      <button type="button" onclick="openWineSub('mapa')">${t("wine.estateTab")}</button>
      <button type="button" onclick="openWineSub('anadas')">${t("wine.vintagesTab")}</button>
    </div>
    ${zoneStrip(w)}
    ${fichaStatusCard(w)}

    <div class="sec-head" role="button" onclick="openRatingsList()"><h2>${t("wine.ratings")}</h2><span class="sec-ico">▦</span></div>
    ${ratingsHomeHtml(w)}

    <div class="sec-head" role="button" onclick="openWineSub('pairings')"><h2>${t("wine.pairings")}</h2><span class="sec-ico">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 13h14v3H5z"/><path d="M7 13c0-5 2.5-8 5-8s5 3 5 8"/><path d="M4 19h16"/></svg>
    </span></div>
    ${pairFeatureHtml(w)}

    <div class="serve-bar" role="button" onclick="openWineSub('keep')">
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v3M8 5l1.2 2.2M16 5l-1.2 2.2"/><path d="M7 14a5 5 0 0 0 10 0c0-3-2.4-5.5-5-7-2.6 1.5-5 4-5 7z"/></svg>
        <div><div class="lbl">${t("wine.keep")}</div><div class="val">${shownTemp(w, "cellar")}</div></div>
      </div>
      <div class="serve-cell">
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3h8l-1 9a5 5 0 1 1-6 0L8 3z"/><path d="M9 21h6"/></svg>
        <div><div class="lbl">${t("wine.service")}</div><div class="val">${shownTemp(w, "service")}</div></div>
      </div>
    </div>
    <div class="dossier-grid">
      <button type="button" onclick="openWineSub('tecnica')">${t("wine.techBtn")}</button>
      <button type="button" onclick="openWineSub('servicio')">${t("wine.glassBtn")}</button>
      <button type="button" onclick="openWineSub('evolve')">${t("wine.evolveBtn")}</button>
      <button type="button" onclick="openWineSub('mercado')">${t("wine.marketBtn")}</button>
      <button type="button" onclick="openWineSub('historia')">${t("wine.historyBtn")}</button>
      <button type="button" onclick="openWineSub('origen')">${t("wine.binBtn")}</button>
      <button type="button" onclick="openWineSub('compras')">${t("wine.buyBtn")}</button>
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
    ? ((score != null ? score + "/100 · " : "") + (note || t("wine.noMemory")) + (list.length > 1 ? " · " + t("wine.nTastings", { n: list.length }) : ""))
    : t("wine.personalEmpty");
  return `<div class="cata-entry" role="button" onclick="openWineSub('taste')">
    <div class="row"><h2>${t("wine.personal")}</h2><span class="sec-ico">›</span></div>
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
  const type = w && w.type === "rose" ? "rosado" : (w && w.type) || "";
  return HUE_BY_TYPE[type] || [];
}
function tastingById(wineId, id) {
  return tastingsOf(wineId).find(t => t.id === id) || null;
}
function evolutionHtml(list) {
  const pts = (list || []).filter(t => t.conclusion && t.conclusion.score != null && t.conclusion.score !== "" && Number(t.conclusion.score) >= 0);
  if (!pts.length) return `<p class="muted">${t("taste.noPoints")}</p>`;
  const sorted = pts.slice().sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || ((a.at || 0) - (b.at || 0)));
  return `<div class="evo">${sorted.map(row => {
    const s = Math.max(0, Math.min(100, Math.round(Number(row.conclusion.score))));
    return `<div class="evo-row"><span class="tiny">${escHtml(row.date || "—")}</span><div class="evo-bar" role="img" aria-label="${t("taste.over", { n: s })}"><span style="width:${s}%"></span></div><b>${s}</b></div>`;
  }).join("")}</div>`;
}
function tastingHistoryCard(entry) {
  const boca = entry.boca || {};
  const note = (entry.conclusion && entry.conclusion.note) || "";
  const score = entry.conclusion && entry.conclusion.score != null && entry.conclusion.score !== "" ? entry.conclusion.score : null;
  const aromas = ((entry.nariz && entry.nariz.aromas) || []).slice(0, 4).map(chipLabel);
  const bits = [entry.vista && entry.vista.hue ? chipLabel(entry.vista.hue) : "", aromas.join(", ")].filter(Boolean).join(" · ");
  const axes = [t("taste.acidL") + " " + (boca.acidez == null ? "—" : boca.acidez), t("taste.sweetL") + " " + (boca.dulzor == null ? "—" : boca.dulzor), t("taste.tanninL") + " " + (boca.tanino == null ? "—" : boca.tanino), t("taste.bodyL") + " " + (boca.cuerpo == null ? "—" : boca.cuerpo)];
  if (boca.final != null && boca.final !== "") axes.push(t("taste.finishL") + " " + boca.final);
  return `<article class="card taste-card" style="margin-top:8px">
    <div class="row"><h3>${escHtml(entry.date || t("taste.noDate"))}</h3>${score != null ? `<span class="badge">${escHtml(String(score))}</span>` : `<span class="tiny">${t("taste.noScore")}</span>`}</div>
    ${bits ? `<p class="tiny" style="margin-top:6px">${escHtml(bits)}</p>` : ""}
    <p class="muted" style="margin-top:6px">${escHtml(axes.join(" · "))}</p>
    ${note ? `<p style="margin-top:6px">${escHtml(note)}</p>` : ""}
    <button class="btn btn-ghost" style="margin-top:8px" onclick="editTasting('${escHtml(entry.id)}')">${t("taste.editBtn")}</button>
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
  const hues = hueOptions(w).map(h => `<button type="button" class="chip ${vista.hue === h ? "on" : ""}" data-hue="${escHtml(h)}" onclick="pickTasteChip(this, 'hue')">${chipLabel(h)}</button>`).join("");
  const families = AROMA_FAMILIES.map(f => {
    const chips = f.chips.map(a => `<button type="button" class="chip ${(nariz.aromas || []).indexOf(a) >= 0 ? "on" : ""}" data-aroma="${escHtml(a)}" onclick="pickTasteChip(this, 'aroma')">${chipLabel(a)}</button>`).join("");
    return `<div class="aroma-family"><p class="tiny">${chipLabel(f.label)}</p><div class="chip-row">${chips}</div></div>`;
  }).join("");
  const score = conclusion.score == null || conclusion.score === "" ? "" : conclusion.score;
  return `<div id="taste-form">
    <p class="cata-mark">✎</p>
    <h2 class="cata-title">${entry.id && tastingEditId ? t("taste.edit") : t("taste.sheet")}</h2>
    <p class="cata-kicker">${t("taste.yours")}</p>
    <label class="field"><span>${t("taste.date")}</span><input id="taste-date" type="date" value="${escHtml(entry.date || todayIso())}"></label>
    <h3 style="margin-top:14px">${t("taste.sight")}</h3>
    <div class="chip-row" id="taste-hues">${hues}</div>
    <p class="tiny">${t("taste.intensity")}</p>
    ${tasteAxis(t("taste.pale"), t("taste.deep"), "taste-vista-int", vista.intensity == null ? 5 : vista.intensity)}
    <h3 style="margin-top:14px">${t("taste.nose")}</h3>
    <p class="tiny">${t("taste.intensity")}</p>
    ${tasteAxis(t("taste.closed"), t("taste.intense"), "taste-nariz-int", nariz.intensity == null ? 5 : nariz.intensity)}
    ${families}
    <label class="field"><span>${t("taste.otherAroma")}</span><textarea id="taste-nariz-text" placeholder="${t("taste.otherPh")}">${escHtml(nariz.text || "")}</textarea></label>
    <h3 style="margin-top:14px">${t("taste.palate")}</h3>
    ${tasteAxis(t("taste.weak"), t("taste.acid"), "taste-acidez", boca.acidez == null ? 6 : boca.acidez)}
    ${tasteAxis(t("taste.dry"), t("taste.sweet"), "taste-dulzor", boca.dulzor == null ? 2 : boca.dulzor)}
    ${tasteAxis(t("taste.soft"), t("taste.tannic"), "taste-tanino", boca.tanino == null ? 6 : boca.tanino)}
    ${tasteAxis(t("taste.light"), t("taste.powerful"), "taste-cuerpo", boca.cuerpo == null ? 7 : boca.cuerpo)}
    <p class="tiny">${t("taste.finish")}</p>
    ${tasteAxis(t("taste.short"), t("taste.long"), "taste-final", boca.final == null ? 5 : boca.final)}
    <h3 style="margin-top:14px">${t("taste.close")}</h3>
    <label class="field"><span>${t("taste.score")}</span><input id="taste-score" type="number" min="0" max="100" step="1" placeholder="85" value="${escHtml(String(score))}"></label>
    <label class="recuerdo">${t("taste.memory")}
      <textarea id="taste-note" placeholder="${t("taste.memoryPh")}">${escHtml(conclusion.note || "")}</textarea>
    </label>
    <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="saveTasting()">${t("taste.save")}</button>
    <p class="cata-foot">Casa Llavaneras</p>
  </div>`;
}
function tastingScreen(w) {
  const list = tastingsOf(w.id);
  const editing = tastingEditId ? tastingById(w.id, tastingEditId) : null;
  const history = list.length ? list.slice().reverse().map(tastingHistoryCard).join("") : `<p class="empty">${t("taste.none")}</p>`;
  return `
    <h2>${t("taste.history")}</h2>
    <div id="taste-history">${history}</div>
    <h2 style="margin-top:16px">${t("taste.evolve")}</h2>
    <div id="taste-evolution">${evolutionHtml(list)}</div>
    <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="newTasting()">${t("taste.new")}</button>
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
  if (!row || !row.wineId) return toast(t("taste.gone"));
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
  toast(t("taste.saved"));
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
  const vesselMap = {};
  Object.keys(VESSEL_LABELS).forEach(k => { vesselMap[k] = t("vessel." + k); });
  const oakMap = {};
  Object.keys(OAK_LABELS).forEach(k => { oakMap[k] = t("oak." + k); });
  box.innerHTML = `<div class="card" style="margin-top:10px">
    <h3>${t("tech.grapes")}</h3>
    <p class="tiny">${t("tech.pct")}</p>
    <div id="grape-rows">${rows}</div>
    <button class="btn btn-ghost" style="margin-top:8px" onclick="addGrapeRow()">${t("tech.addGrape")}</button>
    <h3 style="margin-top:14px">${t("tech.elevage")}</h3>
    <label class="field"><span>${t("tech.months")}</span><input id="elev-months" type="number" min="0" max="120" placeholder="18" value="${e.months || ""}"></label>
    <label class="field"><span>${t("tech.vessel")}</span><select id="elev-vessel">${selectOptions(vesselMap, e.vessel || "", t("nodata"))}</select></label>
    <label class="field"><span>${t("tech.oak")}</span><select id="elev-oak">${selectOptions(oakMap, e.oak || "", t("nodata"))}</select></label>
    <label class="field"><span>${t("tech.newOak")}</span><input id="elev-new" type="number" min="0" max="100" placeholder="30" value="${e.newOak == null ? "" : e.newOak}"></label>
    <label class="field"><span>${t("tech.free")}</span><textarea id="elev-text" placeholder="${t("tech.freePh")}">${escHtml(w.crianza || "")}</textarea></label>
    <button class="btn btn-gold" style="width:100%" onclick="saveTechEdit()">${t("tech.save")}</button>
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
  toast(t("tech.saved"));
  openWineSub("tecnica");
}
function manualScoreForm(w) {
  const guides = [["parker", "Parker / WA"], ["penin", "Guía Peñín"], ["spectator", "Wine Spectator"], ["decanter", "Decanter"], ["vivino", "Vivino"]];
  return `<div class="card" id="score-form">
    <p class="tiny">${t("score.form")}</p>
    <label class="field"><span>${t("score.guide")}</span>
      <select id="score-guide">${guides.map(g => `<option value="${g[0]}">${g[1]}</option>`).join("")}</select>
    </label>
    <label class="field"><span>${t("score.value")}</span><input id="score-value" inputmode="decimal" autocomplete="off"></label>
    <label class="field"><span>${t("score.source")}</span><input id="score-source" autocomplete="off"></label>
    <label class="field"><span>${t("score.date")}</span><input id="score-date" type="date"></label>
    <label class="field"><span>${t("score.url")}</span><input id="score-url" type="url" placeholder="https://" autocomplete="off"></label>
    <button type="button" class="btn btn-gold" style="width:100%" onclick="saveManualScore('${w.id}')">${t("score.save")}</button>
  </div>`;
}
function saveManualScore(wineId) {
  const w = wineById(wineId);
  if (!w) return;
  const key = ($("#score-guide") && $("#score-guide").value) || "parker";
  const raw = ($("#score-value") && $("#score-value").value) || "";
  const score = Number(String(raw).replace(",", "."));
  const max = key === "vivino" ? 5 : 100;
  if (!(score > 0 && score <= max)) { toast(t("score.bad")); return; }
  const block = {
    score: key === "vivino" ? Math.round(score * 10) / 10 : Math.round(score),
    scale: max,
    note: "",
    source: (($("#score-source") && $("#score-source").value) || "").trim(),
    date: (($("#score-date") && $("#score-date").value) || "").trim(),
    url: (($("#score-url") && $("#score-url").value) || "").trim(),
    manual: true,
    by: "usuario",
    origin: "usuario",
    estimate: false
  };
  state.wineEdits = state.wineEdits || {};
  const edit = state.wineEdits[w.id] || {};
  edit.ratings = Object.assign({}, edit.ratings || {});
  edit.ratings[key] = block;
  edit.user = Object.assign({}, edit.user || {}, { ratings: true });
  state.wineEdits[w.id] = edit;
  const custom = (state.customWines || []).find(x => x && x.id === w.id);
  if (custom) {
    custom.ratings = custom.ratings || {};
    custom.ratings[key] = Object.assign({}, custom.ratings[key] || {}, block);
    custom.provenance = custom.provenance || {};
    custom.provenance.ratings = "usuario";
  }
  save();
  toast(t("score.saved"));
  openWine(w.id, currentBottle);
  openScore(key);
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
    ratings: t("sub.ratings"),
    pairings: t("sub.pairings"),
    keep: t("sub.keep"),
    servicio: t("sub.servicio"),
    tecnica: t("sub.tecnica"),
    historia: t("sub.historia"),
    mercado: t("sub.mercado"),
    evolve: t("sub.evolve"),
    profile: t("sub.profile"),
    origen: t("sub.origen"),
    mapa: t("sub.mapa"),
    vinos: t("sub.vinos"),
    taste: t("sub.taste"),
    anadas: t("sub.anadas"),
    compras: t("sub.compras"),
    bottle: currentBottle ? t("sub.bottle") : t("sub.add")
  };
  let body = "";
  if (kind === "ratings") {
    const casa = publishedNote({ note: shownTasting(w) });
    body = ratingsSubHtml(w) +
      (casa ? `<div class="card" style="margin-top:10px"><p class="tiny">${t("fact.houseNote")}</p><p style="margin-top:8px;line-height:1.5">${escHtml(casa)}</p></div>` : "") +
      `<button type="button" class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('taste')">${t("fact.personalLink")}</button>
      <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('historia')">${t("fact.historyLink")}</button>`;
  } else if (kind === "pairings") {
    body = pairingBlock(w);
  } else if (kind === "keep") {
    const cellar = shownTempParts(w, "cellar");
    const serve = shownTempParts(w, "service");
    const humid = keepFieldText(w, "humidity");
    const pos = keepFieldText(w, "position");
    const light = fieldIsReal(w, "cellar") && !isNodataText(shownKeep(w, "light")) ? shownKeep(w, "light") : keepFieldText(w, "light");
    const cork = fieldIsReal(w, "cellar") ? corkHumidity(w) : indicativeFacts(w).humidity;
    const cell = (label, parts) => parts && parts.text ? `<div class="temp"><span class="tiny">${label}${parts.orientative ? " · " + t("fact.orientative") : ""}</span><b>${escHtml(parts.text)}</b></div>` : "";
    const plain = (label, value) => value && !isNodataText(value) ? `<div class="temp"><span class="tiny">${label}</span><b style="font-size:16px">${escHtml(value)}</b></div>` : "";
    body = `
      <div class="temp-grid" style="margin:10px 0">
        ${cell(t("fact.cellarShort"), cellar)}
        ${cell(t("fact.service"), serve)}
        ${plain(t("fact.humidity"), humid)}
        ${plain(t("fact.pos"), pos)}
      </div>
      <div class="card">
        <p class="muted">${t("fact.light", { light: light, h: cork })}</p>
        ${adviseCave(w)}
      </div>
      <div class="card">
        <strong>${t("fact.howKeep")}</strong>
        <p class="muted" style="margin-top:6px">${t("fact.howKeepBody")}</p>
      </div>
      <button type="button" class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="openWineSub('servicio')">${t("fact.serviceLink")}</button>
      ${indicativeServiceBtn(w)}`;
  } else if (kind === "servicio") {
    const d = dossierOf(w);
    const hint = indicativeFacts(w);
    const serve = shownTempParts(w, "service");
    const cellar = shownTempParts(w, "cellar");
    const decant = !isNodataText(d.decant) ? d.decant : (t(hint.decantKey) + " · " + t("fact.orientative"));
    const glass = !isNodataText(d.glass) ? d.glass : (t(hint.glassKey) + " · " + t("fact.orientative"));
    const oxygen = !isNodataText(d.oxygen) ? d.oxygen : "";
    const humid = keepFieldText(w, "humidity");
    const pos = keepFieldText(w, "position");
    const cellarBits = [cellar.text ? (cellar.text + (cellar.orientative ? " · " + t("fact.orientative") : "")) : "", humid, pos].filter(x => x && !isNodataText(x));
    body = `
      <div class="temp-grid" style="margin:10px 0">
        ${serve.text ? `<div class="temp"><span class="tiny">${t("fact.serve")}${serve.orientative ? " · " + t("fact.orientative") : ""}</span><b>${escHtml(serve.text)}</b></div>` : ""}
        <div class="temp"><span class="tiny">${t("fact.decant")}</span><b style="font-size:16px">${escHtml(decant)}</b></div>
      </div>
      ${glass ? `<div class="card"><p class="tiny">${t("fact.glass")}</p><p>${escHtml(glass)}</p></div>` : ""}
      ${oxygen ? `<div class="card"><p class="tiny">${t("fact.oxygen")}</p><p class="muted" style="margin-top:6px">${escHtml(oxygen)}</p></div>` : ""}
      ${cellarBits.length ? `<div class="card"><p class="tiny">${t("fact.cellar")}</p><p class="muted" style="margin-top:6px">${escHtml(cellarBits.join(" · "))}</p></div>` : ""}
      ${indicativeServiceBtn(w)}`;
  } else if (kind === "tecnica") {
    const d = dossierOf(w);
    const pairList = (typeof catalogPairingList === "function" ? catalogPairingList(w) : (w.pairing || [])).filter(Boolean);
    const drink = shownDrinkRange(w);
    const limit = datesAreReal(w) && w.aging && w.aging.holdTo ? String(w.aging.holdTo) : (indicativeFacts(w).holdTo ? String(indicativeFacts(w).holdTo) : "");
    const crianza = (userLocked(w, "crianza") && w.crianza && !isNodataText(w.crianza)) ? w.crianza
      : (w.crianza && !isNodataText(w.crianza)) ? w.crianza
      : (d.elevage && !isNodataText(d.elevage)) ? d.elevage
      : (t(indicativeFacts(w).crianzaKey) + " · " + t("fact.orientative"));
    const zone = [w.appellation || w.region, countryLabel(w.country)].filter(x => x && !isNodataText(x)).join(" · ");
    body = `
      ${provenanceCard(w)}
      ${factRow(t("fact.grapes"), grapeLine(w))}
      ${factRow(t("fact.abv"), w.abv ? w.abv + "% vol." : "")}
      ${factRow(t("fact.style"), styleLabel(w))}
      ${w.provenance ? factRow(t("fact.zone"), zone) : ""}
      ${factRow(t("fact.drink") + ((!datesAreReal(w) || (w.provenance && !userLocked(w, "aging"))) ? " · " + t("fact.orientative") : ""), drink)}
      ${factRow(t("fact.limit") + (datesAreReal(w) ? "" : " · " + t("fact.orientative")), limit)}
      ${pairList.length ? factRow(t("fact.pair"), pairList.join(", ")) : ""}
      ${factRow(t("fact.alt"), d.elevation)}
      ${factTextCard(t("fact.soils"), d.soils)}
      ${factTextCard(t("fact.vineyard"), d.vineyard)}
      ${factTextCard(t("fact.vini"), d.vinification)}
      <div class="card"><p class="tiny">${t("fact.elevage")}${userLocked(w, "crianza") ? "" : " · " + t("fact.orientative")}</p>${elevageLine(w) ? `<p style="margin-top:6px">${escHtml(elevageLine(w))}</p>` : ""}<p class="muted" style="margin-top:6px">${escHtml(crianza)}</p></div>
      <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openTechEdit()">${t("tech.edit")}</button>
      <div id="tech-edit"></div>
      ${indicativeServiceBtn(w)}`;
  } else if (kind === "historia") {
    const d = dossierOf(w);
    const paras = String(d.history || t("fact.madeIn", { producer: typeof sheetTitle === "function" ? sheetTitle(w.producer) : (w.producer || ""), region: w.region, app: w.appellation || "" })).split("\n").filter(line => line && !isNodataText(line));
    const blurb = criticBlurb(w);
    const meters = criticMeters(w);
    const peninNote = publishedNote(shownRating(w, "penin"));
    const making = [d.vinification, d.elevage].filter(x => x && !isNodataText(x));
    body = `
      ${mapTabs("historia")}
      ${paras.map(line => `<div class="card"><p style="line-height:1.5">${line}</p></div>`).join("")}
      ${making.length ? `<div class="card"><p class="tiny">${t("fact.making")}</p><p style="margin-top:8px">${making.join("</p><p class=\"muted\" style=\"margin-top:8px\">")}</p></div>` : ""}
      ${(blurb || meters || peninNote) ? `<div class="card"><p class="tiny">${t("fact.vintageNote", { y: w.vintage })}</p>
        ${blurb ? `<p style="margin-top:8px;line-height:1.45">${escHtml(blurb)}</p>` : ""}
        ${meters ? `<p class="muted" style="margin-top:8px">${escHtml(meters)}</p>` : ""}
        ${peninNote ? `<p class="muted" style="margin-top:10px">${escHtml(peninNote)}</p>` : ""}
      </div>` : ""}
      ${referencesHtml(w)}
      <button type="button" class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('evolve')">${t("fact.evolveLink")}</button>
      <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('mapa')">${t("fact.backMap")}</button>`;
  } else if (kind === "mercado") {
    body = `<div id="mercado-box">${mercadoSkeleton(w)}</div>`;
    setTimeout(() => fillMercado(w), 0);
  } else if (kind === "evolve") {
    const range = shownDrinkRange(w);
    const when = datesAreReal(w)
      ? t("fact.vintageLine", { v: w.vintage, from: w.aging.drinkFrom, a: w.aging.peakStart, b: w.aging.peakEnd, h: w.aging.holdTo })
      : (range ? (range + " · " + t("fact.orientative")) : "");
    const windowMark = datesAreReal(w) && !userLocked(w, "aging") && w.provenance ? `<p class="tiny">${t("fact.orientative")}</p>` : (datesAreReal(w) ? "" : "");
    const stages = datesAreReal(w) ? windowTimeline(w) : [];
    const pill = datesAreReal(w) ? (p.label || "").toUpperCase() : (range ? t("fact.orientative").toUpperCase() : "");
    body = `
      ${windowMark}
      ${when ? `<p class="muted" style="margin:6px 0">${escHtml(when)}</p>` : ""}
      ${pill ? `<div class="peak-pill">${escHtml(pill)}</div>` : ""}
      ${datesAreReal(w) ? `<div class="bar"><i style="width:${pr.pct}%"></i></div>
      <div class="row tiny"><span>${w.vintage}</span><span>${t("fact.now", { when: formatTodayLabel() })}</span><span>${w.aging.holdTo}</span></div>` : ""}
      <div class="timeline">
        ${stages.map(n => {
          const cls = n.year < yearNow() ? "past" : (n.year > yearNow() ? "future" : "now");
          const stamp = n.kind === "now" ? formatTodayLabel() : n.year;
          return `<div class="tl-item ${cls}"><em>${escHtml(stamp)} · ${escHtml(n.phase)}</em><strong>${escHtml(n.text)}</strong></div>`;
        }).join("") || `<div class="tl-item now"><em>${escHtml(formatTodayLabel())} · ${t("fact.state")}</em><strong>${t("fact.noWindow")}</strong></div>`}
      </div>`;
  } else if (kind === "profile") {
    const taste = shownTasting(w);
    const bits = [];
    if ((w.grapes || []).length) bits.push(t("fact.grapes") + ": " + w.grapes.join(", "));
    if (w.abv) bits.push(w.abv + "% vol.");
    if (styleLabel(w)) bits.push(styleLabel(w));
    if (w.priceHint && !isNodataText(w.priceHint)) bits.push(w.priceHint + " · " + t("fact.orientative"));
    const place = [w.appellation, w.country].filter(x => x && !isNodataText(x)).join(" · ");
    body = `
      ${place ? `<p class="muted">${escHtml(place)}</p>` : ""}
      <h3 style="margin:8px 0 6px">${escHtml(typeof sheetTitle === "function" ? sheetTitle(w.producer) : (w.producer || ""))}</h3>
      <p>${escHtml(typeof sheetTitle === "function" ? sheetTitle(w.name) : (w.name || ""))} ${escHtml(String(w.vintage || ""))}</p>
      ${taste ? `<div class="card" style="margin-top:12px"><h2>${t("fact.published")}</h2><p style="margin-top:8px">${escHtml(taste)}</p></div>` : ""}
      ${bits.length ? `<div class="card"><p class="muted">${escHtml(bits.join(" · "))}</p></div>` : ""}
      ${factTextCard(t("fact.soils"), dossierOf(w).soils)}
      <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('tecnica')">${t("fact.techFull")}</button>`;
  } else if (kind === "origen") {
    const b = currentBottle;
    const pend = pendingForWine(w.id)[0];
    const pos = b ? (b.bin || t("cellar.noBin")) : (pend && pend.bin ? pend.bin + " · " + t("fact.pending") : "—");
    const caveLabel = b ? cellarName(b.cellarId) : (pend ? cellarName(pend.cellarId) + " · " + t("fact.notYet") : t("fact.notCellar"));
    body = `
      <div class="fact"><span>${t("fact.pos")}</span><b>${pos}</b></div>
      <div class="fact"><span>${t("fact.cellarShort")}</span><b>${caveLabel}</b></div>
      <div class="fact"><span>${t("fact.estate")}</span><b>${escHtml(typeof sheetTitle === "function" ? sheetTitle(w.producer) : (w.producer || ""))}</b></div>
      <div class="fact"><span>${t("fact.vintage")}</span><b>${w.vintage}</b></div>
      <div class="fact"><span>${t("fact.app")}</span><b>${w.appellation}</b></div>
      <div class="fact"><span>${t("fact.region")}</span><b>${w.region}</b></div>
      <div class="fact"><span>${t("fact.country")}</span><b>${countryLabel(w.country)}</b></div>
      ${b && b.price ? `<div class="fact"><span>${t("fact.price")}</span><b>${formatEuro(b.price)}</b></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:14px" onclick="openWineSub('mapa')">${t("fact.zoneMap")}</button>`;
  } else if (kind === "mapa") {
    body = mapaBlock(w) + mapTabs("mapa");
  } else if (kind === "vinos") {
    const house = WINE_CATALOG.filter(x => x.producer === w.producer);
    const zone = WINE_CATALOG.filter(x => x.producer !== w.producer && (x.region === w.region || x.appellation === w.appellation));
    const ownHouse = (!house.length && w.houseWines) ? w.houseWines : [];
    body = mapTabs("vinos") + `
      <h2>${escHtml(typeof sheetTitle === "function" ? sheetTitle(w.producer) : (w.producer || ""))}</h2>
      ${house.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.name} ${s.vintage}</h3><span class="badge">${manualScoreText(s, "parker", 0)}</span></div>
        <p class="muted">${s.appellation}</p>
      </div>`).join("") || ownHouse.map(s => `<div class="card"><div class="row"><h3>${escHtml(s.name)}</h3></div><p class="muted">${escHtml(s.note || "")}</p></div>`).join("") || `<p class="muted">${w.provenance ? "" : t("fact.onlyOne")}</p>`}
      ${zone.length ? `<h2 style="margin-top:16px">${t("fact.sameZone")}</h2>` + zone.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.producer} ${s.name}</h3><span class="badge">${s.vintage}</span></div>
      </div>`).join("") : ""}`;
  } else if (kind === "anadas") {
    const cuvee = typeof cuveeOf === "function" ? cuveeOf(w) : null;
    const sibs = typeof vintageSiblings === "function" ? vintageSiblings(w) : WINE_CATALOG.filter(x => x.producer === w.producer && x.name === w.name);
    const extra = (Array.isArray(w.vintages) ? w.vintages : []).filter(s => !sibs.some(x => String(x.vintage) === String(s.vintage)));
    const grapes = ((cuvee && cuvee.grapes && cuvee.grapes.length) ? cuvee.grapes : (w.grapes || [])).join(", ");
    const head = `<div class="card"><p class="tiny">${t("vintage.wine")}</p><h3 style="margin-top:6px">${escHtml(typeof sheetTitle === "function" ? sheetTitle(w.producer) : (w.producer || ""))}</h3><p>${escHtml(typeof sheetTitle === "function" ? sheetTitle(w.name) : (w.name || ""))}</p><p class="muted">${escHtml((cuvee && cuvee.appellation) || w.appellation || "")}${grapes ? " · " + escHtml(grapes) : ""}</p></div>`;
    const cards = sibs.map(s => {
      const park = manualScoreText(s, "parker", 0);
      const price = s.priceHint && !isNodataText(s.priceHint) ? (s.priceHint + " · " + t("fact.orientative")) : "";
      const phase = phaseOf(s).label;
      const meta = [price, phase && !isNodataText(phase) ? phase : ""].filter(Boolean).join(" · ");
      return `<div class="card" role="button" onclick="openWine('${s.id}')">
      <div class="row"><h3>${escHtml(String(s.vintage || "—"))}</h3>${park ? `<span class="badge">${escHtml(park)}</span>` : ""}</div>
      ${meta ? `<p class="muted">${escHtml(meta)}</p>` : ""}
      <p class="tiny">${escHtml(String(s.tasting || "").slice(0, 140))}</p>
    </div>`;
    }).join("");
    const more = extra.map(s => {
      const meta = [s.priceHint, s.note].filter(x => x && !isNodataText(x)).join(" · ");
      return `<div class="card">
      <div class="row"><h3>${escHtml(String(s.vintage))}</h3></div>
      ${meta ? `<p class="muted">${escHtml(meta)}</p>` : ""}
    </div>`;
    }).join("");
    body = head + (cards || more || "");
  } else if (kind === "compras") {
    const b = currentBottle;
    const d = dossierOf(w);
    const cost = b && b.price && !state.prefs.hidePrices ? b.price : null;
    const est = d.market && d.market.mid ? d.market.mid : null;
    const pct = cost && est ? Math.round(((est - cost) / cost) * 100) : null;
    body = state.prefs.hideValue ? `<p class="muted">${t("fact.hiddenValue")}</p>` : `
      <div class="temp-grid">
        <div class="temp"><span class="tiny">${t("fact.buy")}</span><b>${cost ? formatEuro(cost) : "—"}</b></div>
        <div class="temp"><span class="tiny">${t("fact.estimated")}</span><b>${est ? formatEuro(est) : "—"}</b></div>
        <div class="temp"><span class="tiny">Δ</span><b>${pct == null ? "—" : (pct>=0?"+":"")+pct+"%"}</b></div>
        <div class="temp"><span class="tiny">${t("fact.units")}</span><b>${b ? b.qty : 0}</b></div>
      </div>
      <div class="card"><p class="tiny">${t("fact.moves")}</p>
        ${b ? `<p style="margin-top:8px">${t("fact.buy")} · ${b.qty} ${t("cellar.ud")} · ${b.bought || t("fact.dateNd")} ${cost ? "· " + formatEuro(cost) : ""}</p>
        ${b.note ? `<p class="muted">${b.note}</p>` : ""}` : `<p class="muted">${t("fact.notInShort")}</p>`}
      </div>
      <button class="btn btn-ghost" style="width:100%" onclick="openWineSub('mercado')">${t("wine.marketBtn")} ›</button>`;
  } else if (kind === "taste") {
    body = tastingScreen(w);
  } else {
    const cave = currentBottle && state.vinotecas.find(v => v.id === currentBottle.cellarId);
    body = currentBottle ? `
      <p class="tiny">${houseName(cave && cave.houseId)} · ${cellarName(currentBottle.cellarId)}</p>
      ${cave && cave.photo ? `<img class="estate-wide" src="${cave.photo}" alt="Vinoteca">` : `<img class="estate-wide" src="cave-principal.jpg" alt="Cava">`}
      <div class="fact"><span>${t("fact.bin")}</span><b>${state.prefs.hideBin ? t("fact.hidden") : (currentBottle.bin || t("cellar.noBin"))}</b></div>
      <div class="fact"><span>${t("fact.qty")}</span><b>${currentBottle.qty}</b></div>
      <div class="fact"><span>${t("fact.in")}</span><b>${currentBottle.bought || "—"}</b></div>
      ${!state.prefs.hidePrices && currentBottle.price ? `<div class="fact"><span>${t("fact.price")}</span><b>${formatEuro(currentBottle.price)}</b></div>` : ""}
      ${currentBottle.note ? `<div class="card"><p>${currentBottle.note}</p></div>` : ""}
      ${resolveLabelRef(currentBottle.labelPhoto) ? `<img class="cave-photo" src="${resolveLabelRef(currentBottle.labelPhoto)}" alt="Etiqueta escaneada" />` : ""}
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="addToLot(1)">+1</button>
        <button class="btn btn-gold" onclick="askServe(1)">${t("fact.serve1")}</button>
        <button class="btn btn-ghost" onclick="askServeMany()">${t("fact.serveN")}</button>
      </div>
      <div class="btn-row">
        <button class="btn btn-ghost" onclick="showSheet('move-sheet')">${t("move.h1")}</button>
        <button class="btn btn-ghost" onclick="showLotInCave()">${t("wine.seeCave")}</button>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="showSheet('add-sheet')">${t("fact.otherPlace")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('compras')">${t("menu.compras")} ›</button>` : `
      <p class="muted" style="margin-bottom:12px">${t("fact.notIn")}</p>
      <div class="btn-row">
        <button class="btn btn-gold" onclick="quickAdd('${w.id}')">${t("sub.add")}</button>
        <button class="btn btn-ghost" onclick="showSheet('add-sheet')">${t("fact.pickSlot")}</button>
      </div>`;
  }
  const art = estateArt(w);
  const bodegaImg = "";
  const titleCss = kind === "mapa" ? "font-size:22px;margin:4px 0 10px;line-height:1.15" : "margin-bottom:16px";
  const eyeCss = kind === "mapa" ? "font-size:10px;margin:0" : "";
  $("#wine-sub-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    ${bodegaImg}
    <p class="eyebrow" style="${eyeCss}">${escHtml(typeof fichaTitles === "function" ? [fichaTitles(w).head, fichaTitles(w).sub].filter(Boolean).join(" · ") : ((typeof sheetTitle === "function" ? sheetTitle(w.name) : (w.name || "")) + (shownYear(w) ? " " + shownYear(w) : "")))}</p>
    <h1 style="${titleCss}">${titles[kind] || t("sub.sheet")}</h1>
    ${body}`;
  show("wine-sub");
}
function provenanceCard(w) {
  if (!w || !w.provenance) return "";
  const labels = {
    type: "prov.type", grapes: "prov.grapes", region: "prov.region", country: "prov.country", abv: "prov.abv",
    tasting: "prov.tasting", crianza: "prov.crianza", service: "prov.service", cellar: "prov.cellar",
    pairing: "prov.pairing", aging: "prov.aging", producer: "prov.producer",
    style: "prov.style", ratings: "prov.ratings", dossier: "prov.dossier",
    web: "prov.web", price: "prov.price", evolution: "prov.evolution", vintages: "prov.vintages", shops: "prov.shops"
  };
  const srcKey = { "página": "src.page", "título": "src.title", "estimación Gemini": "src.gemini", "valor por defecto": "src.default" };
  const buckets = {};
  Object.keys(labels).forEach(k => {
    const src = w.provenance[k] || "valor por defecto";
    buckets[src] = buckets[src] || [];
    buckets[src].push(t(labels[k]));
  });
  const lines = Object.keys(srcKey).filter(src => buckets[src] && buckets[src].length).map(src =>
    `<p style="margin-top:8px"><b>${escHtml(t(srcKey[src]))}</b><span class="muted"> · ${escHtml(buckets[src].join(", "))}</span></p>`
  ).join("");
  const host = w.provenance.pageHost ? `<p class="tiny" style="margin-top:6px">${t("fact.pageRead", { host: w.provenance.pageHost })}</p>` : "";
  const note = w.provenance.geminiNote;
  const why = note ? `<p style="margin-top:8px">${escHtml(note === NO_GEMINI_NOTE ? t("gemini.noKeyNote") : note)}</p>` : "";
  return `<div class="card"><p class="tiny">${t("fact.from")}</p>${host}${why}${lines}</div>`;
}
function priceHistoryBlock(w) {
  if (!w || (!w.provenance && !(w.priceHistory && w.priceHistory.length))) return "";
  const rows = Array.isArray(w.priceHistory) ? w.priceHistory : [];
  if (!rows.length) return "";
  return `<div class="card"><p class="tiny">${t("fact.priceEvo")}</p>${rows.map(r => `<p style="margin-top:8px">${escHtml(String(r.year))} · ${formatEuro(r.mid)}</p>`).join("")}</div>`;
}
function mercadoSkeleton(w) {
  const band = marketBand(w);
  const mine = currentBottle && currentBottle.price ? formatEuro(currentBottle.price) : "—";
  const cell = (label, n) => n ? `<div class="temp"><span class="tiny">${label}</span><b>${formatEuro(n)}</b></div>` : "";
  const src = band.source === "ficha" ? t("fact.sourceFicha") : band.source === "dossier" ? t("fact.sourceDossier") : "";
  const grid = cell(t("fact.low"), band.low) + cell(t("fact.mid"), band.mid) + cell(t("fact.high"), band.high) + (currentBottle && currentBottle.price ? `<div class="temp"><span class="tiny">${t("fact.yourCost")}</span><b>${mine}</b></div>` : "");
  return `
    ${grid ? `<p class="tiny">${t("fact.orientative")}</p>` : ""}
    ${band.note && !isNodataText(band.note) ? `<p class="muted" style="margin:6px 0 10px">${band.note}</p>` : ""}
    ${grid ? `<div class="temp-grid">${grid}</div>` : ""}
    ${src ? `<p class="tiny" id="mercado-src">${src} · EUR</p>` : `<p class="tiny" id="mercado-src" hidden></p>`}
    ${priceHistoryBlock(w)}
    ${shopLinks(w)}`;
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
  const mine = currentBottle && currentBottle.price ? formatEuro(currentBottle.price) : "";
  const cell = (label, n) => n ? `<div class="temp"><span class="tiny">${label}</span><b>${formatEuro(n)}</b></div>` : "";
  const grid = cell(t("fact.low"), quote.low) + cell(t("fact.mid"), quote.mid) + cell(t("fact.high"), quote.high) + (mine ? `<div class="temp"><span class="tiny">${t("fact.yourCost")}</span><b>${mine}</b></div>` : "");
  const tag = quote.source === "gemini" ? "Gemini" : quote.source === "live" ? "Live" : (quote.source === "ficha" ? t("fact.sourcePage") : (quote.source === "dossier" ? t("fact.sourceDossier") : ""));
  box.innerHTML = `
    ${grid ? `<p class="tiny">${t("fact.orientative")}</p>` : ""}
    ${quote.note && !isNodataText(quote.note) ? `<p class="muted" style="margin:6px 0 10px">${quote.note}</p>` : ""}
    ${grid ? `<div class="temp-grid">${grid}</div>` : ""}
    <div class="card"><p class="tiny">${tag} · ${quote.currency || "EUR"}${quote.confianza ? " · " + t("fact.confidence") + " " + quote.confianza : ""}</p>
      <p class="muted" style="margin-top:6px">${quote.trend || ""}</p></div>
    ${priceHistoryBlock(w)}
    ${shopLinks(w)}
    ${d.similar && d.similar.length ? `<h2 style="margin:16px 0 8px">${t("fact.similar")}</h2>${d.similar.map(id => {
      const s = wineById(id);
      if (!s) return "";
      return `<div class="card" role="button" onclick="openWine('${s.id}')"><h3>${s.producer} ${s.name} ${s.vintage}</h3><p class="muted">${s.region} · ${s.priceHint}</p></div>`;
    }).join("")}` : ""}
    <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openNotify()">${t("price.h1")}</button>`;
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

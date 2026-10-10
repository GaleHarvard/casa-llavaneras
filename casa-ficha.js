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
function criticBlurb(w) {
  const parker = w && w.ratings && w.ratings.parker;
  const note = publishedNote(parker);
  if (note) return (parker && parker.estimate ? t("fact.estimateDot") : "") + note;
  const tasting = publishedNote({ note: w && w.tasting });
  if (tasting.length > 24) {
    const est = w.provenance && w.provenance.tasting === "estimación Gemini";
    return (est ? t("fact.estimateDot") : "") + tasting;
  }
  return t("nodata");
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
  if (!fieldIsReal(w, which)) return t("nodata");
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
  if (!top) return `<p class="muted" style="margin:0 0 12px">${t("nodata")}</p>`;
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
function wineTranslateCard(w) {
  return `<div class="card" id="wine-tr">
    <p class="tiny">${t("tr.title")}</p>
    <p class="muted" id="wine-tr-body" style="margin-top:6px">${t("tr.keep")}</p>
    <button type="button" class="btn btn-ghost" id="wine-tr-btn" style="width:100%;margin-top:8px" onclick="requestWineTranslation('${w.id}')">${t("tr.button")}</button>
  </div>`;
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
  const r = w.ratings;
  const backTo = lastList === "wine" ? (bottle ? "cellar" : "scan") : lastList;
  const pill = datesAreReal(w) ? (p.label || "").toUpperCase() : (fieldIsReal(w, "type") && w.type ? typeLabel(w.type).toUpperCase() : t("nodata").toUpperCase());

  $("#wine-body").innerHTML = `
    <div class="wine-top">
      <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
      <div class="spacer"></div>
      <button class="icon-btn fav ${isFav(w.id) ? "on" : ""}" onclick="toggleFav('${w.id}')" aria-label="${t("wine.fav")}">${isFav(w.id) ? "♥" : "♡"}</button>
      <button type="button" class="icon-btn" onclick="openWineMenu()" aria-label="${t("wine.more")}">···</button>
    </div>
    <div class="wine-hero">${estateSVG(w)}</div>
    <h1 class="wine-producer">${w.producer}</h1>
    <p class="wine-cuvee">${w.name} ${w.vintage}</p>
    <button type="button" class="btn btn-ghost label-change" onclick="changeWineLabel()">${t("label.change")}</button>
    <div class="peak-pill">${pill}</div>
    ${wineTranslateCard(w)}
    ${currentBottle ? `<p class="tiny" style="text-align:center;margin:6px 0 4px">${t("wine.inCellar", { n: currentBottle.qty, noun: nounBottles(currentBottle.qty) })}</p>` : ""}
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

    <div class="sec-head" role="button" onclick="openWineSub('ratings')"><h2>${t("wine.ratings")}</h2><span class="sec-ico">▦</span></div>
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
      <p class="tiny">${t("wine.critic")}</p>
      <p style="margin-top:8px;line-height:1.45">${escHtml(criticBlurb(w))}</p>
      <p class="muted" style="margin-top:8px">${r.parker && r.parker.reviewer && r.parker.score ? escHtml(r.parker.reviewer) + " · " : ""}${escHtml(criticMeters(w))}</p>
    </div>

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
  if (typeof paintWineTranslation === "function") paintWineTranslation(w.id);
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
  const type = w && w.type === "rose" ? "rosado" : (w && w.type) || "tinto";
  return HUE_BY_TYPE[type] || HUE_BY_TYPE.tinto;
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
    const d = dossierOf(w);
    const casaRaw = publishedNote({ note: w.tasting });
    const casa = casaRaw || (w.provenance ? t("nodata") : (w.tasting || "").trim());
    const noteOf = (obj, extra) => {
      const n = publishedNote(obj) || publishedNote({ note: extra });
      if (n && n !== casa) return n;
      if (w.provenance) return t("nodata");
      return t("fact.noGuide");
    };
    const card = (fuente, puntos, texto) => `
      <div class="card" style="margin-top:10px">
        <div class="row"><p class="tiny">${fuente}</p><b>${puntos || "—"}</b></div>
        <p style="margin-top:8px;line-height:1.5">${texto}</p>
      </div>`;
    body = `
      <p class="tiny" style="margin:6px 0 8px">${t("fact.guides")}</p>
      <div class="temp-grid" style="margin:8px 0 12px">
        <div class="temp"><span class="tiny">Vivino</span><b>${rateScore(r.vivino.score, 1)}</b></div>
        <div class="temp"><span class="tiny">Peñín</span><b>${rateScore(r.penin.score, 0)}</b></div>
        <div class="temp"><span class="tiny">Parker / WA</span><b>${rateScore(r.parker.score, 0)}</b></div>
        <div class="temp"><span class="tiny">Spectator</span><b>${rateScore(r.spectator.score, 0)}</b></div>
      </div>
      ${card("Guía Peñín" + (r.penin.estimate ? " · " + t("fact.estimate") : ""), r.penin.score ? r.penin.score + "/100" : t("nodata"), noteOf(r.penin))}
      ${card((r.parker.reviewer || "Wine Advocate") + (r.parker.estimate ? " · " + t("fact.estimate") : ""), r.parker.score ? r.parker.score + "/100" : t("nodata"), noteOf(r.parker))}
      ${card("Wine Spectator" + (r.spectator.estimate ? " · " + t("fact.estimate") : ""), r.spectator.score ? r.spectator.score + "/100" : t("nodata"), noteOf(r.spectator, r.spectator.note))}
      ${card("Decanter" + (r.decanter && r.decanter.estimate ? " · " + t("fact.estimate") : ""), (r.decanter && r.decanter.score ? r.decanter.score + "/100" : t("nodata")), noteOf(r.decanter))}
      ${card("Vivino · " + t("fact.users") + (r.vivino.estimate ? " · " + t("fact.estimate") : ""), (r.vivino.score ? r.vivino.score.toFixed(1) + "/5 · " + (r.vivino.count || t("nodata")) + " " + t("fact.reviews") : t("nodata")), noteOf(r.vivino))}
      ${card(t("fact.houseNote"), t("fact.sheetWord"), casa)}
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">${t("fact.refs")}</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('taste')">${t("fact.personalLink")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('historia')">${t("fact.historyLink")}</button>`;
  } else if (kind === "pairings") {
    body = pairingBlock(w);
  } else if (kind === "keep") {
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">${t("fact.cellarShort")}</span><b>${shownTemp(w, "cellar")}</b></div>
        <div class="temp"><span class="tiny">${t("fact.service")}</span><b>${shownTemp(w, "service")}</b></div>
        <div class="temp"><span class="tiny">${t("fact.humidity")}</span><b>${fieldIsReal(w, "cellar") ? w.conservation.humidity : t("nodata")}</b></div>
        <div class="temp"><span class="tiny">${t("fact.pos")}</span><b style="font-size:16px">${fieldIsReal(w, "cellar") ? w.conservation.position : t("nodata")}</b></div>
      </div>
      <div class="card">
        <p class="muted">${t("fact.light", { light: w.conservation.light, h: corkHumidity(w) })}</p>
        ${adviseCave(w)}
      </div>
      <div class="card">
        <strong>${t("fact.howKeep")}</strong>
        <p class="muted" style="margin-top:6px">${t("fact.howKeepBody")}</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:10px" onclick="openWineSub('servicio')">${t("fact.serviceLink")}</button>`;
  } else if (kind === "servicio") {
    const d = dossierOf(w);
    body = `
      <div class="temp-grid" style="margin:10px 0">
        <div class="temp"><span class="tiny">${t("fact.serve")}</span><b>${shownTemp(w, "service")}</b></div>
        <div class="temp"><span class="tiny">${t("fact.decant")}</span><b style="font-size:16px">${d.decant}</b></div>
      </div>
      <div class="card"><p class="tiny">${t("fact.glass")}</p><p>${d.glass}</p></div>
      <div class="card"><p class="tiny">${t("fact.oxygen")}</p><p class="muted" style="margin-top:6px">${d.oxygen}</p></div>
      <div class="card"><p class="tiny">${t("fact.cellar")}</p><p class="muted" style="margin-top:6px">${shownTemp(w, "cellar")} · ${fieldIsReal(w, "cellar") ? w.conservation.humidity : t("nodata")} · ${fieldIsReal(w, "cellar") ? w.conservation.position : t("nodata")}</p></div>`;
  } else if (kind === "tecnica") {
    const d = dossierOf(w);
    body = `
      ${provenanceCard(w)}
      <div class="fact"><span>${t("fact.grapes")}</span><b>${escHtml(grapeLine(w))}</b></div>
      <div class="fact"><span>${t("fact.abv")}</span><b>${w.abv ? w.abv + "% vol." : "—"}</b></div>
      <div class="fact"><span>${t("fact.style")}</span><b>${escHtml(styleLabel(w))}</b></div>
      ${w.provenance ? `<div class="fact"><span>${t("fact.zone")}</span><b>${escHtml([w.appellation || w.region, countryLabel(w.country)].filter(Boolean).join(" · ") || "—")}</b></div>
      <div class="fact"><span>${t("fact.drink")}</span><b>${datesAreReal(w) ? w.aging.drinkFrom + "–" + w.aging.peakEnd : t("nodata")}</b></div>
      <div class="fact"><span>${t("fact.limit")}</span><b>${datesAreReal(w) ? w.aging.holdTo : t("nodata")}</b></div>
      <div class="fact"><span>${t("fact.pair")}</span><b>${escHtml((w.pairing || []).join(", ") || "—")}</b></div>` : ""}
      <div class="fact"><span>${t("fact.alt")}</span><b>${d.elevation}</b></div>
      <div class="card" style="margin-top:12px"><p class="tiny">${t("fact.soils")}</p><p class="muted" style="margin-top:6px">${d.soils}</p></div>
      <div class="card"><p class="tiny">${t("fact.vineyard")}</p><p class="muted" style="margin-top:6px">${d.vineyard}</p></div>
      <div class="card"><p class="tiny">${t("fact.vini")}</p><p class="muted" style="margin-top:6px">${d.vinification}</p></div>
      <div class="card"><p class="tiny">${t("fact.elevage")}</p>${elevageLine(w) ? `<p style="margin-top:6px">${escHtml(elevageLine(w))}</p>` : ""}<p class="muted" style="margin-top:6px">${escHtml(userLocked(w, "crianza") ? (w.crianza || t("tech.noText")) : (w.crianza || d.elevage || t("tech.noText")))}</p></div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openTechEdit()">${t("tech.edit")}</button>
      <div id="tech-edit"></div>`;
  } else if (kind === "historia") {
    const d = dossierOf(w);
    const paras = String(d.history || (w.producer + " se elabora en " + w.region + ".")).split("\n").filter(Boolean);
    body = `
      ${mapTabs("historia")}
      ${paras.map(t => `<div class="card"><p style="line-height:1.5">${t}</p></div>`).join("")}
      <div class="card"><p class="tiny">${t("fact.making")}</p><p style="margin-top:8px">${d.vinification}</p><p class="muted" style="margin-top:8px">${d.elevage}</p></div>
      <div class="card"><p class="tiny">${t("fact.vintageNote", { y: w.vintage })}</p>
        <p style="margin-top:8px;line-height:1.45">${escHtml(criticBlurb(w))}</p>
        <p class="muted" style="margin-top:8px">${escHtml(criticMeters(w))}</p>
        ${(r.penin && r.penin.note) ? `<p class="muted" style="margin-top:10px">${r.penin.note}</p>` : ""}
      </div>
      ${d.awards && d.awards.length ? `<div class="card"><p class="tiny">${t("fact.refs")}</p><p style="margin-top:8px">${d.awards.join(" · ")}</p></div>` : ""}
      <button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWineSub('evolve')">${t("fact.evolveLink")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('mapa')">${t("fact.backMap")}</button>`;
  } else if (kind === "mercado") {
    body = `<div id="mercado-box">${mercadoSkeleton(w)}</div>`;
    setTimeout(() => fillMercado(w), 0);
  } else if (kind === "evolve") {
    const when = datesAreReal(w)
      ? t("fact.vintageLine", { v: w.vintage, from: w.aging.drinkFrom, a: w.aging.peakStart, b: w.aging.peakEnd, h: w.aging.holdTo })
      : t("fact.vintageUnknown", { v: w.vintage });
    body = `
      <p class="muted" style="margin:6px 0">${when}</p>
      <div class="peak-pill">${datesAreReal(w) ? (p.label || "").toUpperCase() : t("nodata").toUpperCase()}</div>
      ${datesAreReal(w) ? `<div class="bar"><i style="width:${pr.pct}%"></i></div>
      <div class="row tiny"><span>${w.vintage}</span><span>${t("fact.now", { y: YEAR })}</span><span>${w.aging.holdTo}</span></div>` : ""}
      <div class="timeline">
        ${(w.evolutionNotes || []).map(n => `<div class="tl-item"><em>${n.year} · ${n.phase}</em><strong>${escHtml(n.text)}</strong></div>`).join("")}
        <div class="tl-item"><em>${YEAR} · ${t("fact.state")}</em><strong>${datesAreReal(w) ? currentAdvice(w, p) : t("fact.noWindow")}</strong></div>
      </div>`;
  } else if (kind === "profile") {
    body = `
      <p class="muted">${w.appellation} · ${w.country}</p>
      <h3 style="margin:8px 0 6px">${w.producer}</h3>
      <p>${w.name} ${w.vintage}</p>
      <div class="card" style="margin-top:12px">
        <h2>${t("fact.published")}</h2>
        <p style="margin-top:8px">${w.tasting}</p>
      </div>
      <div class="card">
        <p>${t("fact.grapes")}: ${(w.grapes || []).join(", ") || "—"}</p>
        <p class="muted">${w.abv ? w.abv + "% vol." : t("nodata")} · ${escHtml(styleLabel(w))} · ${w.priceHint && w.priceHint !== "—" ? escHtml(w.priceHint) : t("nodata")}</p>
      </div>
      <div class="card">
        <p class="tiny">${t("fact.soils")}</p>
        <p class="muted" style="margin-top:6px">${dossierOf(w).soils}</p>
      </div>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openWineSub('tecnica')">${t("fact.techFull")}</button>`;
  } else if (kind === "origen") {
    const b = currentBottle;
    const pend = pendingForWine(w.id)[0];
    const pos = b ? (b.bin || t("cellar.noBin")) : (pend && pend.bin ? pend.bin + " · " + t("fact.pending") : "—");
    const caveLabel = b ? cellarName(b.cellarId) : (pend ? cellarName(pend.cellarId) + " · " + t("fact.notYet") : t("fact.notCellar"));
    body = `
      <div class="fact"><span>${t("fact.pos")}</span><b>${pos}</b></div>
      <div class="fact"><span>${t("fact.cellarShort")}</span><b>${caveLabel}</b></div>
      <div class="fact"><span>${t("fact.estate")}</span><b>${w.producer}</b></div>
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
      <h2>${w.producer}</h2>
      ${house.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
        <div class="row"><h3>${s.name} ${s.vintage}</h3><span class="badge">Parker ${s.ratings.parker.score}</span></div>
        <p class="muted">${s.appellation}</p>
      </div>`).join("") || ownHouse.map(s => `<div class="card"><div class="row"><h3>${escHtml(s.name)}</h3></div><p class="muted">${escHtml(s.note || "")}</p></div>`).join("") || `<p class="muted">${w.provenance ? t("nodata") : t("fact.onlyOne")}</p>`}
      ${zone.length ? `<h2 style="margin-top:16px">${t("fact.sameZone")}</h2>` + zone.map(s => `<div class="card" role="button" onclick="openWine('${s.id}')">
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
      <p class="muted">${escHtml([s.priceHint, s.note].filter(Boolean).join(" · ") || t("nodata"))}</p>
    </div>`).join("") : `<p class="muted">${w.provenance ? t("nodata") : t("fact.noOther")}</p>`);
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
    <p class="eyebrow" style="${eyeCss}">${w.name} ${w.vintage}</p>
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
  if (!rows.length) return `<div class="card"><p class="tiny">${t("fact.priceEvo")}</p><p class="muted" style="margin-top:6px">${t("nodata")}</p></div>`;
  return `<div class="card"><p class="tiny">${t("fact.priceEvo")}</p>${rows.map(r => `<p style="margin-top:8px">${escHtml(String(r.year))} · ${formatEuro(r.mid)}</p>`).join("")}</div>`;
}
function mercadoSkeleton(w) {
  const band = marketBand(w);
  const mine = currentBottle && currentBottle.price ? formatEuro(currentBottle.price) : "—";
  const money = (n) => n ? formatEuro(n) : t("nodata");
  const src = band.source === "ficha" ? t("fact.sourceFicha") : band.source === "dossier" ? t("fact.sourceDossier") : t("fact.sourceNone");
  return `
    <p class="muted" style="margin:6px 0 10px">${band.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">${t("fact.low")}</span><b>${money(band.low)}</b></div>
      <div class="temp"><span class="tiny">${t("fact.mid")}</span><b>${money(band.mid)}</b></div>
      <div class="temp"><span class="tiny">${t("fact.high")}</span><b>${money(band.high)}</b></div>
      <div class="temp"><span class="tiny">${t("fact.yourCost")}</span><b>${mine}</b></div>
    </div>
    <p class="tiny" id="mercado-src">${src} · EUR</p>
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
  const mine = currentBottle && currentBottle.price ? formatEuro(currentBottle.price) : "—";
  const money = (n) => n ? formatEuro(n) : t("nodata");
  const tag = quote.source === "gemini" ? "Gemini" : quote.source === "live" ? "Live" : (quote.source === "ficha" ? t("fact.sourcePage") : t("fact.sourceDossier"));
  box.innerHTML = `
    <p class="muted" style="margin:6px 0 10px">${quote.note}</p>
    <div class="temp-grid">
      <div class="temp"><span class="tiny">${t("fact.low")}</span><b>${money(quote.low)}</b></div>
      <div class="temp"><span class="tiny">${t("fact.mid")}</span><b>${money(quote.mid)}</b></div>
      <div class="temp"><span class="tiny">${t("fact.high")}</span><b>${money(quote.high)}</b></div>
      <div class="temp"><span class="tiny">${t("fact.yourCost")}</span><b>${mine}</b></div>
    </div>
    <div class="card"><p class="tiny">${tag} · ${quote.currency || "EUR"}${quote.confianza ? " · " + t("fact.confidence") + " " + quote.confianza : ""}</p>
      <p class="muted" style="margin-top:6px">${quote.trend || ""}</p></div>
    ${priceHistoryBlock(w)}
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

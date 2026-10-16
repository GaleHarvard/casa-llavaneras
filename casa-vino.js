/* Datos de vino: fase, botella, mercado y bodega. */
function dossierOf(w) {
  const packed = (window.WINE_DOSSIERS && w && window.WINE_DOSSIERS[w.id]) || {};
  const own = (w && w.dossier) || {};
  const say = (key, fallback) => (typeof t === "function" ? t(key) : fallback);
  const merged = Object.assign({
    soils: say("fact.soilFb", "Suelo de la denominación."),
    elevation: "—",
    vineyard: w ? (w.appellation + " · " + (w.grapes || []).join(", ")) : "",
    vinification: say("fact.makeFb", "Elaboración de la casa."),
    elevage: say("fact.elevFb", "Crianza en bodega."),
    glass: say("fact.glassFb", "Copa adecuada al tipo"),
    decant: w && w.type === "espumoso" ? say("fact.noDecant", "No") : "30–60 min",
    oxygen: say("fact.oxyFb", "Servir en su temperatura."),
    history: w ? (typeof t === "function" ? t("fact.madeIn", { producer: w.producer || "", region: w.region || "", app: w.appellation || "" }) : ((w.producer || "") + " se elabora en " + (w.region || "") + " (" + (w.appellation || "") + ").")) : "",
    market: { low: 0, mid: 0, high: 0, trend: "—" },
    similar: [],
    awards: []
  }, packed, own);
  if (w && w.provenance && !(window.WINE_DOSSIERS && window.WINE_DOSSIERS[w.id])) {
    ["soils", "elevation", "vineyard", "vinification", "elevage", "glass", "decant", "oxygen", "history"].forEach(k => {
      if (!own[k]) merged[k] = say("nodata", "Sin dato");
    });
    if (!own.awards) merged.awards = [];
    if (!own.market) merged.market = { low: null, mid: null, high: null, trend: say("nodata", "Sin dato") };
  }
  if (w && typeof localizeDossier === "function") return localizeDossier(w.id, merged);
  return merged;
}
function wineById(id) {
  const w = WINE_CATALOG.find(x => x.id === id) || (state.customWines || []).find(x => x.id === id);
  return applyStoredWineEdit(w);
}
function applyStoredWineEdit(w) {
  if (!w || !state || !state.wineEdits) return w;
  const e = state.wineEdits[w.id];
  if (!e) return w;
  if (Array.isArray(e.grapes)) w.grapes = e.grapes.slice();
  if (e.grapePct && typeof e.grapePct === "object") w.grapePct = Object.assign({}, e.grapePct);
  if (typeof e.crianza === "string") w.crianza = e.crianza;
  if (e.elevage && typeof e.elevage === "object") w.elevage = Object.assign({}, w.elevage || {}, e.elevage);
  if (e.ratings && typeof e.ratings === "object") {
    w.ratings = w.ratings || {};
    Object.keys(e.ratings).forEach(k => {
      const block = e.ratings[k];
      const origin = scoreOrigin(block);
      if (block && (scoreIsUser(block) || origin === "web" || origin === "verificada")) w.ratings[k] = Object.assign({}, w.ratings[k] || {}, block);
    });
  }
  w.provenance = w.provenance || {};
  if (e.user) Object.keys(e.user).forEach(k => { if (e.user[k]) w.provenance[k] = "usuario"; });
  return w;
}
function userLocked(wine, field) {
  if (!wine) return false;
  const e = state && state.wineEdits && state.wineEdits[wine.id];
  if (e && e.user && e.user[field]) return true;
  return !!(wine.provenance && wine.provenance[field] === "usuario");
}
function phaseOf(wine) {
  if (!wine || !wine.aging) return { key: "wait", label: t("phase.nodata"), hint: "" };
  const a = wine.aging;
  const from = Number(a.drinkFrom);
  const peak0 = Number(a.peakStart);
  const peak1 = Number(a.peakEnd);
  const hold = Number(a.holdTo);
  if (!from || !peak0 || !peak1 || !hold) return { key: "wait", label: t("phase.nodata"), hint: "" };
  if (yearNow() < from) return { key: "wait", label: t("phase.wait"), hint: t("phase.waitHint") };
  if (yearNow() > hold) return { key: "late", label: t("phase.late"), hint: t("phase.lateHint") };
  if (yearNow() > peak1) return { key: "warn", label: t("phase.warn"), hint: t("phase.warnHint") };
  if (yearNow() < peak0) return { key: "ok", label: t("phase.open"), hint: t("phase.openHint") };
  return { key: "ok", label: t("phase.peak"), hint: t("phase.peakHint") };
}
function progressOf(wine) {
  const start = wine.vintage;
  const end = wine.aging.holdTo;
  const peak0 = wine.aging.peakStart;
  const peak1 = wine.aging.peakEnd;
  const pct = Math.max(0, Math.min(100, ((yearNow() - start) / (end - start)) * 100));
  const peakPct0 = ((peak0 - start) / (end - start)) * 100;
  const peakPct1 = ((peak1 - start) / (end - start)) * 100;
  return { pct, peakPct0, peakPct1 };
}
function yearsUntilPeakEnd(peakEnd) {
  const left = Number(peakEnd) - yearNow();
  if (!Number.isFinite(left)) return "—";
  if (left > 1) return t("years.many", { n: left });
  if (left === 1) return t("years.one");
  if (left === 0) return t("years.last");
  return t("years.past");
}
function drinkWindowMarks(pr) {
  const clamp = n => Math.max(0, Math.min(100, n));
  const left = Number.isFinite(pr.peakPct0) ? clamp(pr.peakPct0) : 0;
  const right = Number.isFinite(pr.peakPct1) ? clamp(pr.peakPct1) : left;
  const now = Number.isFinite(pr.pct) ? clamp(pr.pct) : 0;
  return { left, width: Math.max(right - left, 1.5), now };
}
function totalBottles() {
  return state.bottles.reduce((n, b) => n + b.qty, 0);
}
function cellarValue() {
  return state.bottles.reduce((n, b) => n + (Number(b.price) || 0) * b.qty, 0);
}
function bottlesReady() {
  return state.bottles.filter(b => {
    if (typeof bottleHeld === "function" && bottleHeld(b)) return false;
    const w = wineById(b.wineId);
    const p = phaseOf(w);
    return p.key === "ok" || p.key === "warn";
  });
}
function unitMarket(w) {
  if (!w) return 0;
  const over = state.marketOverrides && state.marketOverrides[w.id];
  const custom = over && Number(over.mid);
  if (custom > 0) return custom;
  const band = typeof marketBand === "function" ? marketBand(w) : null;
  const mid = band && Number(band.mid);
  return mid > 0 ? mid : 0;
}
function cellarMarketValue() {
  return (state.bottles || []).reduce((n, b) => n + unitMarket(wineById(b.wineId)) * (Number(b.qty) || 0), 0);
}
function shortWineName(w) {
  if (!w) return "";
  const n = (w.name || "").replace("Reserva", "").replace("Gran Reserva", "").trim();
  const last = (w.producer || "").split(" ").slice(-1)[0];
  return n.length > 2 ? n : last;
}
function pairLabel(w) {
  if (!w) return "";
  const prod = w.producer || "";
  const short = shortWineName(w);
  if (!short || prod.toLowerCase().includes(short.toLowerCase()) || short.toLowerCase().includes(prod.toLowerCase())) {
    return prod || short;
  }
  return (prod + " " + short).trim();
}
function producerShort(w) {
  const p = String((w && w.producer) || "").trim() || "Sin bodega";
  return p.split(/\s+/).slice(0, 3).join(" ");
}
function parkerMark(w) {
  const block = publishedScore(w, "parker");
  return block ? ("★ " + block.score) : "";
}
function scoreOrigin(block) {
  return String((block && (block.origin || block.origen)) || "");
}
function scoreIsUser(block) {
  if (!block || typeof block !== "object") return false;
  if (block.estimate === true) return false;
  const origin = scoreOrigin(block);
  if (origin === "web" || origin === "verificada" || origin === "catalogo") return false;
  if (block.manual === true || block.by === "usuario" || origin === "usuario") return true;
  const src = String(block.source || "").trim();
  if (src && !/gemini|estimaci/i.test(src)) return true;
  return false;
}
function scoreIsAi(block, wine) {
  if (!block || typeof block !== "object") return false;
  const origin = scoreOrigin(block);
  if (origin === "web" || origin === "verificada" || origin === "catalogo") return false;
  if (scoreIsUser(block)) return false;
  if (block.estimate === true) return true;
  const by = String(block.by || block.origin || block.origen || "");
  if (/gemini|estim|inteligencia|^ia$|^ai$/i.test(by)) return true;
  const prov = wine && wine.provenance && String(wine.provenance.ratings || "");
  if (/gemini|estimaci[oó]n|^ia$|^ai$/i.test(prov)) return true;
  return false;
}
function userScore(w, key) {
  const block = w && w.ratings && w.ratings[key];
  if (!scoreIsUser(block)) return null;
  const n = Number(String(block.score == null ? "" : block.score).replace(",", "."));
  if (!(n > 0)) return null;
  return block;
}
function publishedScore(w, key) {
  const block = w && w.ratings && w.ratings[key];
  if (!block || typeof block !== "object" || block.estimate === true) return null;
  if (scoreIsAi(block, w)) return null;
  const n = Number(String(block.score == null ? "" : block.score).replace(",", "."));
  if (!(n > 0)) return null;
  return block;
}
function scoreTagKey(block) {
  if (!block) return "";
  const origin = scoreOrigin(block);
  if (origin === "web") return "score.web";
  if (origin === "verificada" || block.verified === true) return "score.verified";
  if (block.manual === true || block.by === "usuario" || origin === "usuario") return "score.yours";
  return "score.catalog";
}
function isNodataText(s) {
  const n = String(s == null ? "" : s).trim();
  if (!n || n === "—" || n === "-" || n === "–") return true;
  if (typeof t === "function") {
    try { if (n === t("nodata")) return true; } catch (e) {}
  }
  return /^(sin dato|sense dada|no data|sans donnee|sans donnée|sem dado)$/i.test(n);
}
function indicativeFacts(w) {
  const kind = bottleKind(w || {});
  const style = normTxt(((w && w.style) || "") + " " + ((w && w.name) || "") + " " + ((w && w.appellation) || ""));
  const year = Number(w && w.vintage) || 0;
  const age = year ? (yearNow() - year) : 0;
  const agedRed = kind === "red" && (/gran|reserva|crianza|icono/.test(style) || age >= 4);
  let serve = [15, 17];
  let cellar = [12, 14];
  let decantKey = "fact.decantYoung";
  let glassKey = "fact.glassRed";
  let positionKey = "fact.posHoriz";
  let humidity = "65–75%";
  let crianzaKey = "fact.crianzaYoung";
  let fromOff = 2;
  let holdOff = 8;
  if (kind === "spark") {
    serve = [8, 10]; cellar = [8, 12]; decantKey = "fact.noDecant"; glassKey = "fact.glassSpark"; crianzaKey = "fact.crianzaSpark"; fromOff = 1; holdOff = 10;
  } else if (kind === "white" || kind === "slim") {
    const aged = age >= 5 || /crianza|reserva|barrica|gran/.test(style);
    serve = aged ? [10, 12] : [8, 10];
    cellar = aged ? [10, 13] : [8, 12];
    decantKey = "fact.noDecant"; glassKey = "fact.glassWhite"; crianzaKey = aged ? "fact.crianzaOak" : "fact.crianzaYoung";
    fromOff = aged ? 2 : 1; holdOff = aged ? 10 : 4;
  } else if (kind === "rose") {
    serve = [8, 12]; cellar = [8, 12]; decantKey = "fact.noDecant"; glassKey = "fact.glassRose"; fromOff = 1; holdOff = 3;
  } else if (kind === "generoso") {
    serve = [12, 14]; cellar = [12, 16]; decantKey = "fact.noDecant"; glassKey = "fact.glassGen"; positionKey = "fact.posVert"; humidity = "60–70%"; fromOff = 0; holdOff = 20;
  } else if (agedRed) {
    serve = [16, 18]; cellar = [12, 14]; decantKey = "fact.decantAged"; glassKey = "fact.glassRed"; crianzaKey = "fact.crianzaOak";
    fromOff = 4; holdOff = (/gran|icono/.test(style) || age >= 10) ? 18 : 12;
  }
  return {
    serve: serve, cellar: cellar, decantKey: decantKey, glassKey: glassKey,
    positionKey: positionKey, humidity: humidity, crianzaKey: crianzaKey,
    drinkFrom: year ? year + fromOff : 0,
    holdTo: year ? year + holdOff : 0
  };
}
function shownDrinkRange(w) {
  if (datesAreReal(w) && w && w.aging && w.aging.drinkFrom && (w.aging.peakEnd || w.aging.holdTo)) {
    return w.aging.drinkFrom + "–" + (w.aging.peakEnd || w.aging.holdTo);
  }
  const hint = indicativeFacts(w);
  if (!hint.drinkFrom || !hint.holdTo) return "";
  return hint.drinkFrom + "–" + hint.holdTo;
}
function clearAiScoreBlock(block) {
  let changed = false;
  if (Number(block.score)) { block.score = 0; changed = true; }
  if (block.count) { delete block.count; changed = true; }
  if (block.estimate) { delete block.estimate; changed = true; }
  if (block.note) { block.note = ""; changed = true; }
  if (block.reviewer && block.estimate !== false) { delete block.reviewer; changed = true; }
  return changed;
}
function stripStoredAiScores(st) {
  if (!st || typeof st !== "object") return false;
  let changed = false;
  const visit = (w) => {
    if (!w || !w.ratings || typeof w.ratings !== "object") return;
    Object.keys(w.ratings).forEach(k => {
      const block = w.ratings[k];
      if (scoreIsAi(block, w) && clearAiScoreBlock(block)) changed = true;
    });
    const prov = w.provenance && String(w.provenance.ratings || "");
    if (/gemini|estimaci[oó]n|^ia$|^ai$/i.test(prov)) {
      const kept = Object.keys(w.ratings).some(k => scoreIsUser(w.ratings[k]));
      if (kept) w.provenance.ratings = "usuario";
      else delete w.provenance.ratings;
      changed = true;
    }
  };
  (st.customWines || []).forEach(visit);
  if (st.wineEdits && typeof st.wineEdits === "object") {
    Object.keys(st.wineEdits).forEach(id => {
      const edit = st.wineEdits[id];
      if (edit && edit.ratings) visit({ ratings: edit.ratings, provenance: {} });
    });
  }
  return changed;
}
function estateArt(w) {
  w = w || {};
  const land = (typeof wineryImageFor === "function") ? wineryImageFor(w) : (typeof GENERIC_ESTATE !== "undefined" ? GENERIC_ESTATE : "vinedo.jpg");
  const place = [w.region, w.appellation, w.country].filter(Boolean).join(" ");
  let hitZone = detectZone(place);
  if (!hitZone) hitZone = detectZone([w.name, w.producer].filter(Boolean).join(" "));
  const cap = land === "vinedo-chateau-margaux.jpg" ? "capsula-margaux.jpg" : "capsula.jpg";
  return { land: land, cap: cap, map: hitZone && hitZone.map ? hitZone.map : "" };
}
function bottleKind(w) {
  w = w || {};
  const type = normTxt(w.type || "");
  if (type === "espumoso" || type === "cava" || type === "champagne") return "spark";
  if (type === "blanco" || type === "white") return "white";
  if (type === "rosado" || type === "rose") return "rose";
  if (type === "tinto" || type === "red") return "red";
  if (type === "generoso") return "generoso";
  const t = normTxt(`${w.style || ""} ${w.appellation || ""} ${w.region || ""} ${w.name || ""} ${(w.grapes || []).join(" ")}`);
  if (/\b(cava|champagne|espumoso|corpinnat)\b/.test(t)) return "spark";
  if (/\b(albarino|riesling|godello|verdejo|viura|chardonnay)\b/.test(t) || t.indexOf("rias baixas") >= 0 || t.indexOf("alsace") >= 0 || t.indexOf("mosela") >= 0) return "slim";
  if (/\b(blanco|white)\b/.test(t)) return "white";
  if (/\b(rosado|rose)\b/.test(t)) return "rose";
  return "red";
}
/* fotos realistas por tipo; el rosado usa la de blanco */
const BOTTLE_PHOTOS = {
  tinto: "botella-tinto.jpg",
  blanco: "botella-blanco.jpg",
  espumoso: "botella-espumoso.jpg",
  rosado: "botella-blanco.jpg"
};
function bottleTone(w) {
  const kind = bottleKind(w || {});
  if (kind === "spark") return "photo-espumoso";
  if (kind === "rose") return "photo-rosado";
  if (kind === "white" || kind === "slim") return "photo-blanco";
  return "photo-tinto";
}
function bottleMarkup(w) {
  const tone = bottleTone(w);
  return `<img class="bottle-photo" data-bottle="${tone}" src="${bottleSrcFromTone(tone)}" alt="Botella">`;
}
const CATALOG_LABELS = {
  "pingus-2018": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/dpin18_anv800.png",
  "tondonia-reserva-2011": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/vtonr11_anv800.png",
  "riscal-reserva-2019": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/mrisr19_anv800.png",
  "margaux-2016": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/chmar16_anv800.png",
  "vega-valbuena-2019": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/valb519_anv800.png",
  "muga-prado-enea-2015": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/prdn15_anv800.png",
  "numanthia-2018": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/numan18_anv800.png",
  "grange-2018": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/pengr18_anv800.png"
};
function bottleSrcFromTone(tone) {
  if (tone === "photo-blanco") return BOTTLE_PHOTOS.blanco;
  if (tone === "photo-espumoso") return BOTTLE_PHOTOS.espumoso;
  if (tone === "photo-rosado") return BOTTLE_PHOTOS.rosado || BOTTLE_PHOTOS.blanco;
  return BOTTLE_PHOTOS.tinto;
}
function estateSVG(w) {
  const art = estateArt(w);
  const land = art.land ? `<img class="estate-photo" src="${art.land}" alt="" onerror="this.style.display='none'">` : "";
  const bottle = currentBottle && w && currentBottle.wineId === w.id ? currentBottle : null;
  const visual = labelSrc(w, bottle)
    ? labelThumbHtml(w, "label-thumb label-thumb-hero", bottle)
    : bottleMarkup(w);
  return `
    ${land}
    <div class="foil-wrap">
      ${visual}
    </div>`;
}
function normalizeWine(w) {
  if (!w || typeof w !== "object") return w;
  if (!w.conservation) w.conservation = { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" };
  const y = Number(w.vintage) || yearNow();
  if (!w.aging) w.aging = { drinkFrom: y + 1, peakStart: y + 3, peakEnd: y + 10, holdTo: y + 15 };
  if (!w.aging.holdTo) w.aging.holdTo = w.aging.drinkTo || ((Number(w.aging.peakEnd) || y + 10) + 4);
  if (!w.aging.drinkFrom) w.aging.drinkFrom = y + 1;
  if (!w.aging.peakStart) w.aging.peakStart = y + 3;
  if (!w.aging.peakEnd) w.aging.peakEnd = y + 10;
  if (!Array.isArray(w.evolutionNotes)) w.evolutionNotes = [];
  if (!Array.isArray(w.grapes)) w.grapes = [];
  if (!w.ratings) w.ratings = {};
  const scales = { vivino: 5, penin: 100, parker: 100, spectator: 100, decanter: 100 };
  Object.keys(scales).forEach(k => {
    if (!w.ratings[k]) w.ratings[k] = { score: 0, scale: scales[k], note: "" };
    if (w.ratings[k].score == null || Number.isNaN(Number(w.ratings[k].score))) w.ratings[k].score = 0;
  });
  return w;
}
function datesAreReal(w) {
  if (!w || !w.provenance) return true;
  return !!(w.provenance.aging && w.provenance.aging !== "valor por defecto");
}
function fieldIsReal(w, key) {
  if (!w || !w.provenance) return true;
  return !!(w.provenance[key] && w.provenance[key] !== "valor por defecto");
}
function rateScore(score, digits) {
  const n = Number(score);
  if (!n) return "";
  return digits ? n.toFixed(digits) : String(n);
}
function styleLabel(w) {
  if (!w) return "";
  const kind = w.kindStyle || "";
  const typ = w.type ? typeLabel(w.type) : "";
  if (w.provenance && (w.style === "internet" || w.style === "escaneo") && !kind) return typ || "";
  if (kind) return kind + (typ ? " · " + typ : "");
  if (!w.style || isNodataText(w.style)) return typ || "";
  return w.style + (typ ? " · " + typ : "");
}
function grapeLine(w) {
  const names = (w && w.grapes) || [];
  if (!names.length) return "—";
  return names.map(g => {
    const pct = w.grapePct && Number(w.grapePct[g]);
    return pct > 0 ? g + " " + pct + "%" : g;
  }).join(" · ");
}
function elevageLine(w) {
  const e = (w && w.elevage) || {};
  const bits = [];
  if (Number(e.months) > 0) bits.push(t("tech.monthsN", { n: e.months }));
  if (e.vessel && VESSEL_LABELS[e.vessel]) bits.push(t("vessel." + e.vessel));
  if (e.oak && OAK_LABELS[e.oak]) bits.push(t("tech.oak") + " " + t("oak." + e.oak));
  if (e.newOak != null && e.newOak !== "" && Number(e.newOak) >= 0 && e.oak && e.oak !== "ninguno" && String(e.newOak) !== "") {
    if (Number(e.newOak) > 0 || e.newOak === 0) bits.push(t("tech.newN", { n: e.newOak }));
  }
  return bits.join(" · ");
}
function adviseCave(w) {
  const best = state.vinotecas.map(v => {
    const target = (w.conservation.cellarMin + w.conservation.cellarMax) / 2;
    const mid = (v.tHigh + v.tLow) / 2;
    return { v, diff: Math.abs(mid - target) };
  }).sort((a, b) => a.diff - b.diff)[0];
  if (!best) return "";
  const live = best.v.tHigh;
  const high = live > w.conservation.cellarMax + 1;
  const extra = high
    ? t("keep.high", { a: w.conservation.cellarMin, b: w.conservation.cellarMax })
    : (best.diff < 1.2 ? t("keep.ideal") : t("keep.adjust"));
  return `<p style="margin-top:8px">${t("keep.rec", { name: best.v.name, t: live.toFixed(1) })} ${extra}</p>`;
}
function currentAdvice(w, p) {
  const c = w.conservation || {};
  if (p.key === "wait") return t("advice.wait", { a: c.cellarMin, b: c.cellarMax, y: w.aging.drinkFrom });
  if (p.key === "ok" && yearNow() < w.aging.peakStart) return t("advice.early", { y: w.aging.peakStart });
  if (p.key === "ok") return t("advice.peak", { a: c.serveMin, b: c.serveMax });
  if (p.key === "warn") return t("advice.warn");
  return t("advice.late");
}
function noteAgrees(note, wine) {
  const a = (wine && wine.aging) || {};
  const y = Number(note && note.year);
  if (!y) return false;
  if (Number(wine.vintage) && y < Number(wine.vintage) - 1) return false;
  if (Number(a.holdTo) && y > Number(a.holdTo)) return false;
  const blob = normTxt((note.phase || "") + " " + (note.text || ""));
  const peakWord = /integracion|apogeo|meseta|cotidiano|mejor momento/.test(blob);
  if (peakWord && Number(a.peakStart) && y > Number(a.peakStart)) return false;
  return true;
}
function windowTimeline(w) {
  if (!w || !datesAreReal(w) || !w.aging) return [];
  const a = w.aging;
  const notes = (typeof catalogEvolution === "function" ? catalogEvolution(w) : (w.evolutionNotes || [])).filter(n => noteAgrees(n, w));
  const items = notes.map(n => ({ year: Number(n.year), kind: "note", phase: n.phase, text: n.text }));
  const have = y => items.some(it => it.year === Number(y));
  if (Number(a.drinkFrom) && !have(a.drinkFrom)) items.push({ year: Number(a.drinkFrom), kind: "anchor", phase: t("evo.drink"), text: t("evo.drinkText") });
  if (Number(a.peakStart) && Number(a.peakStart) !== Number(a.drinkFrom) && !have(a.peakStart)) items.push({ year: Number(a.peakStart), kind: "anchor", phase: t("evo.peak"), text: t("evo.peakText") });
  if (Number(a.holdTo) && !have(a.holdTo)) items.push({ year: Number(a.holdTo), kind: "anchor", phase: t("evo.limit"), text: t("evo.limitText") });
  const p = phaseOf(w);
  items.push({ year: yearNow(), kind: "now", phase: t("fact.state"), text: currentAdvice(w, p) });
  items.sort((x, y) => x.year - y.year || (x.kind === "now") - (y.kind === "now"));
  return items;
}
function shownYear(w) {
  const y = Number(w && w.vintage);
  return y >= 1950 && y <= yearNow() + 1 ? String(y) : "";
}
function wineNeedsData(w) {
  if (!w || !w.provenance) return false;
  if (w.provenance.incomplete) return true;
  return !shownYear(w) && (w.style === "internet" || w.style === "escaneo");
}
function stockOf(wineId) {
  return state.bottles.filter(b => b.wineId === wineId).reduce((n, b) => n + b.qty, 0);
}
function colorForWineType(type) {
  if (type === "blanco") return "#e8d9a0";
  if (type === "rosado") return "#e7b7c6";
  if (type === "espumoso") return "#efe3b8";
  if (type === "generoso") return "#c4a35a";
  return "#4a1020";
}
function wineTypeFromText(text) {
  const t = normTxt(text);
  if (/espumoso|cava|champagne|brut/.test(t)) return "espumoso";
  if (/blanco|white/.test(t)) return "blanco";
  if (/rosado|rose/.test(t)) return "rosado";
  if (/generoso|jerez|fino|oloroso/.test(t)) return "generoso";
  if (/tinto|red/.test(t)) return "tinto";
  return "";
}
function styleFromText(text) {
  const t = normTxt(text);
  if (/gran reserva/.test(t)) return "gran_reserva";
  if (/\breserva\b/.test(t)) return "reserva";
  if (/crianza/.test(t)) return "crianza";
  if (/\broble\b/.test(t)) return "roble";
  if (/\bjoven\b/.test(t)) return "joven";
  return "";
}
const BODEGA_GEO = {
  "Vega Sicilia": { lat: 41.6325, lng: -4.286, zone: "Valbuena de Duero", web: "https://www.temposvegasicilia.com/es" },
  "Dominio de Pingus": { lat: 41.636, lng: -4.363, zone: "Quintanilla de Onésimo", web: "https://www.pingus.es" },
  "R. López de Heredia": { lat: 42.5764, lng: -2.8467, zone: "Haro · Rioja Alta", web: "https://www.lopezdeheredia.com" },
  "Marqués de Riscal": { lat: 42.515, lng: -2.618, zone: "Elciego · Rioja Alavesa", web: "https://www.marquesderiscal.com" },
  "Álvaro Palacios": { lat: 41.1934, lng: 0.7769, zone: "Gratallops · Priorat", address: "Polígono Industrial 6, Parcela 26, 43737 Gratallops, Tarragona", web: "https://www.alvaropalacios.com" },
  "Pazo de Señoráns": { lat: 42.516, lng: -8.727, zone: "Meis · Rías Baixas", web: "https://www.pazodesenorans.com" },
  "CVNE": { lat: 42.576, lng: -2.846, zone: "Haro · Rioja Alta", web: "https://www.cvne.com" },
  "Gramona": { lat: 41.426, lng: 1.785, zone: "Sant Sadurní d'Anoia", web: "https://www.gramona.com" },
  "Moët & Chandon": { lat: 49.082, lng: 3.946, zone: "Hautvillers · Champagne", web: "https://www.domperignon.com" },
  "Château Margaux": { lat: 45.044, lng: -0.677, zone: "Margaux · Médoc", web: "https://www.chateau-margaux.com" },
  "Tenuta San Guido": { lat: 43.234, lng: 10.565, zone: "Bolgheri", web: "https://www.tenutasanguido.com" },
  "Penfolds": { lat: -34.536, lng: 138.959, zone: "Magill · South Australia", web: "https://www.penfolds.com" },
  "Bodegas Muga": { lat: 42.577, lng: -2.847, zone: "Haro · Rioja Alta", web: "https://www.bodegasmuga.com" },
  "Scala Dei": { lat: 41.2547, lng: 0.8095, zone: "Escaladei · Priorat", address: "Rambla de la Cartoixa, 5, 43379 Escaladei, Tarragona", web: "https://www.cellersdescaladei.com" },
  "Enrique Mendoza": { lat: 38.580, lng: -0.103, zone: "Alfaz del Pi · Alicante", web: "https://www.bodegasmendoza.com" },
  "Numanthia": { lat: 41.525, lng: -5.395, zone: "Valdefinjas · Toro", web: "https://www.numanthia.com" },
  "Marqués de Murrieta": { lat: 42.430, lng: -2.445, zone: "Ygay · Rioja", web: "https://www.marquesdemurrieta.com" },
  "Bodegas Alejandro Fernández": { lat: 41.641, lng: -4.158, zone: "Pesquera de Duero", address: "Pesquera de Duero, Valladolid", web: "https://www.grupopesquera.com" }
};
const ESTATE_MORE = [
  {
    name: "Bodegas y Viñedos García Figuero",
    aliases: ["García Figuero", "Garcia Figuero", "Tinto Figuero", "Figuero"],
    lat: 41.729, lng: -3.884,
    zone: "La Horra",
    address: "Ctra. La Horra a Roa, km 2,2, 09311 La Horra, Burgos",
    web: "https://figuero.es"
  },
  {
    name: "CARM",
    aliases: ["Casa Agrícola Roboredo Madeira", "Roboredo Madeira"],
    lat: 41.016, lng: -7.055,
    zone: "Almendra · Douro",
    address: "Almendra, 5150 Vila Nova de Foz Côa",
    web: "https://www.carm.pt"
  }
];
function foldEstate(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function estateNeedle(hay, label) {
  const needle = foldEstate(label);
  if (needle.length < 4) return false;
  const re = new RegExp("(^| )" + needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "( |$)");
  return re.test(hay);
}
function estateHit(w) {
  if (!w) return null;
  if (BODEGA_GEO[w.producer]) return BODEGA_GEO[w.producer];
  const hay = foldEstate((w.producer || "") + " " + (w.name || ""));
  if (!hay) return null;
  let best = null;
  let bestLen = 0;
  const take = (label, rec) => {
    const n = foldEstate(label).length;
    if (n <= bestLen || !estateNeedle(hay, label)) return;
    best = rec;
    bestLen = n;
  };
  ESTATE_MORE.forEach(rec => {
    take(rec.name, rec);
    (rec.aliases || []).forEach(alias => take(alias, rec));
  });
  (typeof WINERY_PLACES !== "undefined" ? WINERY_PLACES : []).forEach(rec => {
    take(rec.name, rec);
    (rec.aliases || []).forEach(alias => take(alias, rec));
  });
  Object.keys(BODEGA_GEO).forEach(name => take(name, BODEGA_GEO[name]));
  return best;
}
function isShopUrl(url) {
  return /vinissimus|decantalo|decántalo|bigshopper|vivino\.com|wine-searcher|google\.|amazon\.|duckduckgo|instagram|facebook/i.test(String(url || ""));
}
function textShop(s) {
  return /vinissimus|dec[aá]ntalo|vivino|wine-searcher|amazon\.|€/i.test(String(s || ""));
}
function pinOk(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) <= 0.2) return false;
  if (Math.abs(lat - 40.4) < 0.02 && Math.abs(lng + 3.7) < 0.02) return false;
  return true;
}
function bodegaGeo(w) {
  const lib = estateHit(w) || {};
  const g = (w && w.geo) || {};
  const lat = Number(g.lat);
  const lng = Number(g.lng);
  const storedPin = pinOk(lat, lng);
  const storedAddress = !textShop(g.address) && String(g.address || "").trim().length > 8 ? String(g.address).trim() : "";
  const storedWeb = g.web && !isShopUrl(g.web) ? g.web : "";
  const region = String((w && (w.appellation || w.region)) || "").trim();
  const storedZone = g.zone && !textShop(g.zone) && foldEstate(g.zone) !== foldEstate(region) ? g.zone : "";
  return {
    lat: storedPin ? lat : (lib.lat != null ? lib.lat : null),
    lng: storedPin ? lng : (lib.lng != null ? lib.lng : null),
    zone: storedZone || lib.zone || region || (w && w.country) || "",
    address: storedAddress || lib.address || "",
    web: storedWeb || lib.web || ""
  };
}
function repairShopWinery(w) {
  if (!w) return false;
  const lib = estateHit(w);
  w.geo = w.geo || {};
  let changed = false;
  if (isShopUrl(w.geo.web) || textShop(w.geo.web)) {
    const url = String(w.geo.web || "");
    w.shops = Array.isArray(w.shops) ? w.shops : [];
    if (url && !w.shops.some(s => s && s.url === url)) w.shops.push({ url: url, source: "Tienda", price: "", title: "" });
    w.geo.web = (lib && lib.web) || "";
    changed = true;
  }
  if (textShop(w.geo.address)) {
    w.geo.address = (lib && lib.address) || "";
    changed = true;
  }
  if (textShop(w.geo.zone)) {
    w.geo.zone = (lib && lib.zone) || "";
    changed = true;
  }
  const lat = Number(w.geo.lat);
  const lng = Number(w.geo.lng);
  if (!pinOk(lat, lng) && lib && lib.lat != null) {
    w.geo.lat = lib.lat;
    w.geo.lng = lib.lng;
    changed = true;
  }
  if (!String(w.geo.address || "").trim() && lib && lib.address) {
    w.geo.address = lib.address;
    changed = true;
  }
  if (!String(w.geo.web || "").trim() && lib && lib.web) {
    w.geo.web = lib.web;
    changed = true;
  }
  if ((!String(w.geo.zone || "").trim() || textShop(w.geo.zone)) && lib && lib.zone) {
    w.geo.zone = lib.zone;
    changed = true;
  }
  if (textShop(w.producer) && lib && lib.name) {
    w.producer = lib.name;
    changed = true;
  }
  return changed;
}
function repairStoredWineries(bag) {
  let changed = false;
  ((bag && bag.customWines) || []).forEach(w => {
    if (repairShopWinery(w)) changed = true;
  });
  return changed;
}
function marketBand(w) {
  const d = dossierOf(w);
  const m = (d && d.market) || {};
  if (m.low || m.mid || m.high) {
    return { low: m.low || null, mid: m.mid || null, high: m.high || null, note: m.trend || (typeof t === "function" ? t("fact.dossierHouse") : "Dossier de la casa"), source: "dossier" };
  }
  const nums = String((w && w.priceHint) || "").match(/\d+(?:[.,]\d+)?/g);
  if (nums && nums.length) {
    const vals = nums.map(n => Math.round(Number(String(n).replace(",", ".")))).filter(n => n > 0);
    if (vals.length) {
      const low = Math.min.apply(null, vals);
      const high = Math.max.apply(null, vals);
      const mid = vals.length === 1 ? vals[0] : Math.round((low + high) / 2);
      return {
        low: vals.length === 1 ? Math.round(vals[0] * 0.9) : low,
        mid: mid,
        high: vals.length === 1 ? Math.round(vals[0] * 1.12) : high,
        note: typeof t === "function" ? t("fact.bandNote", { hint: w.priceHint }) : ("Horquilla de la ficha (" + w.priceHint + "). No es cotización."),
        source: "ficha"
      };
    }
  }
  return { low: null, mid: null, high: null, note: "Sin precio en la ficha. Activa Gemini en Avisos si quieres una estimación.", source: "vacio" };
}
function dateYearSelfCheck() {
  const sample = { vintage: 2015, aging: { drinkFrom: 2020, peakStart: 2024, peakEnd: 2026, holdTo: 2030 } };
  const prev = globalThis.__casaToday;
  try {
    globalThis.__casaToday = "2026-06-15";
    const a = { y: yearNow(), phase: phaseOf(sample).key };
    globalThis.__casaToday = "2027-06-15";
    const b = { y: yearNow(), phase: phaseOf(sample).key, now: windowTimeline(sample).filter(it => it.kind === "now").map(it => it.year)[0] };
    return { ok: a.y === 2026 && b.y === 2027 && a.phase === "ok" && b.phase === "warn" && b.now === 2027, a: a, b: b };
  } finally {
    if (prev) globalThis.__casaToday = prev;
    else delete globalThis.__casaToday;
  }
}

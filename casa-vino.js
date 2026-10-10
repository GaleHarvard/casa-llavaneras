/* Datos de vino: fase, botella, mercado y bodega. */
function dossierOf(w) {
  const packed = (window.WINE_DOSSIERS && w && window.WINE_DOSSIERS[w.id]) || {};
  const own = (w && w.dossier) || {};
  const merged = Object.assign({
    soils: "Suelo de la denominación.",
    elevation: "—",
    vineyard: w ? (w.appellation + " · " + (w.grapes || []).join(", ")) : "",
    vinification: "Elaboración de la casa.",
    elevage: "Crianza en bodega.",
    glass: "Copa adecuada al tipo",
    decant: w && w.type === "espumoso" ? "No" : "30–60 min",
    oxygen: "Servir en su temperatura.",
    history: w ? (w.producer + " se elabora en " + w.region + " (" + w.appellation + ").") : "",
    market: { low: 0, mid: 0, high: 0, trend: "—" },
    similar: [],
    awards: []
  }, packed, own);
  if (w && w.provenance && !(window.WINE_DOSSIERS && window.WINE_DOSSIERS[w.id])) {
    ["soils", "elevation", "vineyard", "vinification", "elevage", "glass", "decant", "oxygen", "history"].forEach(k => {
      if (!own[k]) merged[k] = "Sin dato";
    });
    if (!own.awards) merged.awards = [];
    if (!own.market) merged.market = { low: null, mid: null, high: null, trend: "Sin dato" };
  }
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
  const pr = progressOf(wine);
  if (YEAR < a.drinkFrom || pr.pct < 38) return { key: "wait", label: t("phase.wait"), hint: t("phase.waitHint") };
  if (YEAR > a.holdTo || pr.pct >= 82) return { key: "late", label: t("phase.late"), hint: t("phase.lateHint") };
  if (YEAR >= a.peakEnd - 1 || pr.pct >= 62) return { key: "warn", label: t("phase.warn"), hint: t("phase.warnHint") };
  if (YEAR < a.peakStart) return { key: "ok", label: t("phase.open"), hint: t("phase.openHint") };
  return { key: "ok", label: t("phase.peak"), hint: t("phase.peakHint") };
}
function progressOf(wine) {
  const start = wine.vintage;
  const end = wine.aging.holdTo;
  const peak0 = wine.aging.peakStart;
  const peak1 = wine.aging.peakEnd;
  const pct = Math.max(0, Math.min(100, ((YEAR - start) / (end - start)) * 100));
  const peakPct0 = ((peak0 - start) / (end - start)) * 100;
  const peakPct1 = ((peak1 - start) / (end - start)) * 100;
  return { pct, peakPct0, peakPct1 };
}
function yearsUntilPeakEnd(peakEnd) {
  const left = Number(peakEnd) - YEAR;
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
  const s = w && w.ratings && w.ratings.parker && Number(w.ratings.parker.score);
  return s ? ("★ " + s) : "★ —";
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
  const y = Number(w.vintage) || YEAR;
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
  if (!n) return t("nodata");
  return digits ? n.toFixed(digits) : String(n);
}
function styleLabel(w) {
  if (!w) return t("nodata");
  const kind = w.kindStyle || "";
  const typ = w.type ? typeLabel(w.type) : "";
  if (w.provenance && (w.style === "internet" || w.style === "escaneo") && !kind) return typ || t("nodata");
  if (kind) return kind + (typ ? " · " + typ : "");
  if (!w.style || w.style === "Sin dato") return typ || t("nodata");
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
  if (p.key === "ok" && YEAR < w.aging.peakStart) return t("advice.early", { y: w.aging.peakStart });
  if (p.key === "ok") return t("advice.peak", { a: c.serveMin, b: c.serveMax });
  if (p.key === "warn") return t("advice.warn");
  return t("advice.late");
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
function bodegaGeo(w) {
  const known = BODEGA_GEO[w && w.producer];
  if (known) return known;
  const g = (w && w.geo) || {};
  const lat = Number(g.lat);
  const lng = Number(g.lng);
  const pin = Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) > 0.2;
  return {
    lat: pin ? lat : null,
    lng: pin ? lng : null,
    zone: g.zone || (w && (w.appellation || w.region || w.country)) || "Sin dato",
    address: g.address || "",
    web: g.web || ""
  };
}
function marketBand(w) {
  const d = dossierOf(w);
  const m = (d && d.market) || {};
  if (m.low || m.mid || m.high) {
    return { low: m.low || null, mid: m.mid || null, high: m.high || null, note: m.trend || "Dossier de la casa", source: "dossier" };
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
        note: "Horquilla de la ficha (" + w.priceHint + "). No es cotización.",
        source: "ficha"
      };
    }
  }
  return { low: null, mid: null, high: null, note: "Sin precio en la ficha. Activa Gemini en Avisos si quieres una estimación.", source: "vacio" };
}

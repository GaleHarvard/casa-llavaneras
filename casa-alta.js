/* Alta v93.
   Borrador en memoria (altaFlow) hasta la confirmación.
   status: "DRAFT" | "CONFIRMED"
   step: "capture" | "analysis" | "preview"
   ask: "front" | "back"
   frontLabelImage: portada. Se guarda en IndexedDB (casa-llavaneras-labels) con la clave del vino
     y se copia a labelThumb. Es la imagen principal de la ficha.
   backLabelImage: contraetiqueta. Clave "back:" + id, campo propio, apartado Contraetiqueta.
   sheet: { name, vintage, region, winery, grapes, abv, crianza, serveTemp, tasting, pairing }
   assets: matchLocalAssets → { regionAssetImage, wineryAssetImage, zone, winery }
   cellarLocation: { cellarId, bin } obligatorio para confirmar.
   Las fotos no se copian al localStorage. La copia vinoteca.pro.max.v3.antes-v93 se hace una sola vez. */

function blankWineSheet() {
  return {
    name: "", vintage: "", region: "", winery: "",
    grapes: "", abv: "", crianza: "", serveTemp: "", tasting: "", pairing: ""
  };
}

function blankAltaFlow() {
  return {
    status: "DRAFT",
    step: "capture",
    ask: "front",
    source: "",
    frontLabelImage: "",
    backLabelImage: "",
    sheet: blankWineSheet(),
    assets: null,
    zoneText: "",
    wineryText: "",
    sources: [],
    failure: "",
    failureReason: "",
    cellarLocation: { cellarId: "", bin: "" },
    qty: "1",
    wineId: ""
  };
}

var altaFlow = null;
var ALTA_BACKUP_KEY = ((typeof CASA_EDITION !== "undefined" && CASA_EDITION === "jesus") ? "jesus." : "") + "vinoteca.pro.max.v3.antes-v93";

function foldAlta(text) {
  if (typeof foldWinery === "function") return foldWinery(text);
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function phraseHit(hay, needle) {
  if (!hay || !needle) return false;
  if (hay === needle) return true;
  const padded = " " + hay + " ";
  if (padded.indexOf(" " + needle + " ") >= 0) return true;
  if (hay.indexOf(needle + " ") === 0) return true;
  return hay.length > needle.length && hay.lastIndexOf(" " + needle) === hay.length - needle.length - 1;
}

function altaLabels(item) {
  const labels = [];
  const push = value => {
    const text = String(value || "").trim();
    if (text) labels.push(text);
  };
  if (!item) return labels;
  push(item.name);
  String(item.keys || "").split(/[,]+/).forEach(chunk => {
    const phrase = chunk.trim();
    if (!phrase) return;
    push(phrase);
    phrase.split(/\s+/).forEach(push);
  });
  (item.aliases || []).forEach(push);
  return labels;
}

function matchLocalAssets(region, winery) {
  const regionBlob = foldAlta(region);
  const wineryBlob = foldAlta([winery, region].filter(Boolean).join(" "));
  const wineryOnly = foldAlta(winery);
  let zone = null;
  let zoneLen = 0;
  (typeof ZONES !== "undefined" ? ZONES : []).forEach(item => {
    if (!item) return;
    const official = foldAlta(item.name);
    altaLabels(item).forEach(label => {
      const needle = foldAlta(label);
      const min = needle && needle === official ? 3 : 4;
      if (!needle || needle.length < min || needle.length <= zoneLen) return;
      if (!phraseHit(regionBlob, needle)) return;
      zone = item;
      zoneLen = needle.length;
    });
  });
  let card = null;
  let cardLen = 0;
  const cards = typeof WINERY_CARDS !== "undefined" ? WINERY_CARDS : [];
  cards.forEach(item => {
    if (!item) return;
    altaLabels(item).concat(wineTitleLabels(item)).forEach(label => {
      const needle = foldAlta(label);
      if (!needle || needle.length < 5 || needle.length <= cardLen) return;
      if (!phraseHit(wineryBlob, needle) && !phraseHit(wineryOnly, needle)) return;
      card = item;
      cardLen = needle.length;
    });
  });
  return {
    regionAssetImage: zone && zone.map ? zone.map : "",
    wineryAssetImage: card && card.file ? card.file : "",
    zone: zone,
    winery: card
  };
}

function wineTitleLabels(card) {
  const labels = [];
  (card && card.wines || []).forEach(wine => {
    const text = String(wine || "").trim();
    if (!text) return;
    labels.push(text);
    const short = text.replace(/\s+(tinto|branco|blanco|blanc|white|red|reserva)$/i, "").trim();
    if (short && short !== text) labels.push(short);
  });
  return labels;
}

function genericRegion(text) {
  const folded = foldAlta(text);
  if (!folded) return true;
  return folded === "sin indicacion geografica"
    || folded === "sin denominacion de origen"
    || folded === "vino de mesa"
    || folded === "table wine"
    || folded === "vin de table";
}

function samePlace(a, b) {
  const left = foldAlta(a);
  const right = foldAlta(b);
  return !!(left && right && left === right);
}

function zoneRecord(name) {
  if (!name) return null;
  if (typeof zoneByName === "function") {
    const hit = zoneByName(name);
    if (hit) return hit;
  }
  if (typeof ZONES !== "undefined" && ZONES) return ZONES.find(zone => zone && zone.name === name) || null;
  return null;
}

function placeForSheet(region, winery, name) {
  const assets = matchLocalAssets(region, [winery, name].filter(Boolean).join(" "));
  const card = assets.winery;
  const house = winery || (card && card.name) || "";
  const useless = genericRegion(region) || samePlace(region, house) || (card && samePlace(region, card.name));
  let zone = assets.zone;
  if (useless && card && card.zone) zone = zoneRecord(card.zone);
  else if (useless) zone = null;
  let label = zone && zone.name ? zone.name : "";
  if (!label && useless && card && card.zoneText && !samePlace(card.zoneText, house) && !samePlace(card.zoneText, card.name)) {
    label = String(card.zoneText).trim();
  }
  if (!label && !useless) label = String(region || "").trim();
  if (samePlace(label, house) || (card && samePlace(label, card.name))) label = "";
  return { zone: zone || null, label: label, winery: card, assets: assets };
}

function wineReadingSchema() {
  const str = { type: "STRING" };
  return {
    type: "OBJECT",
    properties: {
      name: str, vintage: str, region: str, winery: str,
      grapes: str, abv: str, crianza: str, serveTemp: str, tasting: str, pairing: str
    },
    required: ["name", "vintage", "region", "winery"]
  };
}

function sheetFromParsed(parsed) {
  const src = parsed || {};
  const sheet = blankWineSheet();
  Object.keys(sheet).forEach(key => {
    const value = src[key];
    const text = value && typeof value === "object" ? value.value : value;
    sheet[key] = String(text || "").replace(/\s+/g, " ").trim();
    if (/^sin dato$/i.test(sheet[key])) sheet[key] = "";
  });
  if (typeof vintageFromText === "function") {
    const year = vintageFromText(sheet.vintage);
    if (!year) sheet.vintage = "";
    else sheet.vintage = year;
  }
  if (sheet.vintage && /lote|^\s*l\s*\d{4}/i.test(sheet.vintage)) sheet.vintage = "";
  return typeof polishSheetIdentity === "function" ? polishSheetIdentity(sheet) : sheet;
}

function tastingConflicts(type, text) {
  if (type !== "blanco" && type !== "espumoso") return false;
  return /\brojo\b|\brub[ií]\b|\bgranate\b|\bpicota\b|\bviol[aá]ceo\b|\bcereza\b|\bteja\b/i.test(String(text || ""));
}

function sheetWordType(row) {
  const blob = foldAlta([row && row.name, row && row.region, row && row.crianza].join(" "));
  if (/\b(branco|blanco|white|blanc)\b/.test(blob)) return "blanco";
  return "";
}

function polishSheetIdentity(sheet) {
  const row = sheet || {};
  const grapeType = typeof typeFromGrapes === "function" ? typeFromGrapes(row.grapes) : "";
  const wordType = grapeType || sheetWordType(row);
  if (tastingConflicts(wordType, row.tasting)) row.tasting = "";
  if (typeof stripContradictingStyle !== "function" || typeof typeFromGrapes !== "function") return row;
  const next = stripContradictingStyle(row.name, grapeType);
  if (next) row.name = next;
  if (grapeType === "blanco" && row.crianza && typeof inventedStylePhrase === "function" && inventedStylePhrase(row.crianza) && /\btinto\b/i.test(row.crianza)) {
    row.crianza = "";
  }
  return row;
}

function missingIdentity(sheet) {
  const row = sheet || {};
  return ["name", "vintage", "region", "winery"].filter(key => !String(row[key] || "").trim());
}

function citedUri(outcome) {
  const chunks = typeof groundingChunksOf === "function" ? groundingChunksOf(outcome && outcome.raw) : [];
  const fromChunk = (chunks || []).map(chunk => chunk && chunk.uri).find(uri => /^https:\/\//i.test(uri || ""));
  if (fromChunk) return fromChunk;
  const parsed = outcome && outcome.parsed;
  const written = parsed && (parsed.source || parsed.url || parsed.fuente);
  return /^https:\/\//i.test(written || "") ? String(written) : "";
}

function blurbConflicts(text, zoneName) {
  const blob = foldAlta(text);
  const zone = foldAlta(zoneName);
  if (!blob || !zone) return false;
  const foreign = /galicia|rias baixas|rioja|ribera del duero|priorat|borgona|bordeaux|jerez/;
  if ((zone.indexOf("alentejo") >= 0 || zone.indexOf("evora") >= 0) && foreign.test(blob)) return true;
  if (/galicia/.test(blob) && zone.indexOf("galicia") < 0 && zone.indexOf("rias") < 0) return true;
  return false;
}

function groundedClaim(outcome, needles) {
  const wanted = (needles || []).map(foldAlta).filter(needle => needle && needle.length >= 4);
  if (!wanted.length || !outcome) return "";
  const chunks = typeof groundingChunksOf === "function" ? groundingChunksOf(outcome.raw) : [];
  const https = (chunks || []).filter(chunk => chunk && /^https:\/\//i.test(chunk.uri || ""));
  if (!https.length) return "";
  const blobOf = chunk => foldAlta((chunk.title || "") + " " + (chunk.uri || ""));
  const hit = https.find(chunk => wanted.some(needle => blobOf(chunk).indexOf(needle) >= 0));
  if (hit) return hit.uri;
  const parsed = outcome.parsed || {};
  const written = String(parsed.source || parsed.url || parsed.fuente || "");
  if (!/^https:\/\//i.test(written)) return "";
  const host = written.replace(/^https:\/\//i, "").split("/")[0].replace(/^www\./, "").toLowerCase();
  const same = https.find(chunk => {
    const uh = String(chunk.uri || "").replace(/^https:\/\//i, "").split("/")[0].replace(/^www\./, "").toLowerCase();
    return uh && host && (uh === host || uh.endsWith("." + host) || host.endsWith("." + uh));
  });
  if (!same) return "";
  const blob = foldAlta((same.title || "") + " " + written);
  return wanted.some(needle => blob.indexOf(needle) >= 0) ? written : "";
}

function peraMancaFiction(name, winery) {
  const house = foldAlta(winery);
  const title = foldAlta(name);
  const badHouse = house === "terras mancas" || house === "adega terras mancas";
  const badTitle = title === "terras mancas" || title === "adega terras mancas";
  if (badHouse) return true;
  return badTitle && !house;
}

function rescuePeraMancaSheet(sheet) {
  const row = sheet || {};
  if (!peraMancaFiction(row.name, row.winery)) return false;
  row.name = "Pêra-Manca Branco";
  row.winery = "Fundação Eugénio de Almeida";
  row.region = "Alentejo";
  if (String(row.vintage || "") === "2025") row.vintage = "";
  row.grapes = "Antão Vaz, Arinto";
  row.tasting = "";
  row.pairing = "";
  return true;
}

var PERA_MANCA_HISTORY = "Blanco de excepción de la Fundação Eugénio de Almeida, criado en la Adega Cartuxa (Quinta de Valbom, Évora). La casa lo ampara en la DOC Alentejo, subzona Évora.";
var PERA_MANCA_VINI = "Antão Vaz y Arinto de los viñedos de la fundación. El mosto fermenta en parte en acero inoxidable y en parte en barrica de roble francés. Luego el vino permanece sobre lías y se afina en botella.";
var PERA_MANCA_SOURCES = [
  "https://www.cartuxa.pt/portefolio-vinhos/pera-manca-doc-alentejo-evora-branco/",
  "https://www.cartuxa.pt/wp-content/uploads/pera-manca-white-2021-eng.pdf"
];

function fillEmptySheet(sheet, parsed) {
  const next = sheet || blankWineSheet();
  if (!parsed) return next;
  Object.keys(next).forEach(key => {
    if (String(next[key] || "").trim()) return;
    const value = parsed[key];
    const text = value && typeof value === "object" ? value.value : value;
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (!clean || /^sin dato$/i.test(clean)) return;
    next[key] = clean;
  });
  return next;
}

function readingFailureKind(outcome) {
  const src = outcome || {};
  if (src.quota) return "quota";
  const reason = String(src.reason || "");
  if (/tiempo agotado/i.test(reason)) return "timeout";
  if (src.parsed) return "";
  if (/clave/i.test(reason)) return "key";
  if (/red o CORS|failed to fetch|network error|load failed/i.test(reason)) return "fetch";
  if (src.fatal) return "other";
  return src.parsed ? "" : "other";
}

async function postWineReading(key, parts, signal) {
  const schema = wineReadingSchema();
  const prompt = [
    "La primera imagen es la etiqueta delantera. Si hay una segunda, es la contraetiqueta. Léelas juntas.",
    "Responde solo JSON con las claves name, vintage, region, winery, grapes, abv, crianza, serveTemp, tasting, pairing.",
    "name es el nombre impreso en la etiqueta, letra por letra. No lo cambies por otro vino parecido.",
    "No añadas tinto, blanco, rosado, joven, crianza ni reserva si esas palabras no están impresas. No lo llames Tinto Joven.",
    "vintage es el año impreso en la etiqueta. No pongas otra añada que conozcas de ese vino. Si no está, déjalo vacío. No uses un lote L2023 como añada.",
    "region es la DO o la zona impresa. Nunca pongas el nombre de la bodega como zona. winery es la bodega impresa. Si no la lees, déjala vacía: no la sustituyas por otra bodega parecida.",
    "grapes, abv, crianza, serveTemp, tasting y pairing solo si se leen. Si no constan, cadena vacía.",
    "La nota de cata tiene que coincidir con el color. Un blanco no es rojo, cereza, picota ni granate.",
    "No inventes bodega, región, historia ni nota. No escribas «Sin dato»."
  ].join("\n");
  if (typeof geminiTryModels !== "function") return { parsed: null, reason: "red o CORS", fatal: true };
  return geminiTryModels(key, "read", function (model) {
    return geminiGenerate(key, model, prompt, schema, signal, 2048, parts);
  });
}

async function postWineSearch(key, prompt, signal) {
  if (typeof geminiTryModels !== "function") return { parsed: null, reason: "", fatal: true };
  return geminiTryModels(key, "ground", function (model) {
    return geminiGrounded(key, model, prompt, signal);
  });
}

async function quietWineSearch(key, prompt, signal) {
  try {
    const search = await postWineSearch(key, prompt, signal);
    if (!search || search.quota || !search.parsed) return null;
    return search;
  } catch (err) {
    return null;
  }
}

async function analyzeAndEnrichWine(front, back) {
  const sheet = blankWineSheet();
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) return { ok: false, failure: "needKey", reason: "", sheet: sheet, assets: matchLocalAssets("", ""), sources: [] };
  const images = [front, back].filter(Boolean);
  const parts = images.map(image => typeof imagePart === "function" ? imagePart(image) : null).filter(Boolean);
  if (!parts.length) return { ok: false, failure: "image", reason: "", sheet: sheet, assets: matchLocalAssets("", ""), sources: [] };
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 22000);
  const sources = [];
  let zoneText = "";
  let wineryText = "";
  try {
    const outcome = await postWineReading(key, parts, ctrl && ctrl.signal);
    const kind = readingFailureKind(outcome);
    const onLine = typeof navigator === "undefined" ? true : navigator.onLine;
    if (kind === "quota" || kind === "timeout" || kind === "key") {
      return { ok: false, failure: kind, reason: (outcome && outcome.reason) || "", sheet: sheet, assets: matchLocalAssets("", ""), sources: sources };
    }
    if (kind === "fetch" && typeof shouldUseOfflineRead === "function" && shouldUseOfflineRead(onLine, "fetch")) {
      return { ok: false, failure: "offline", reason: "", sheet: sheet, assets: matchLocalAssets("", ""), sources: sources };
    }
    if (kind === "fetch" || (kind && !outcome.parsed)) {
      return { ok: false, failure: kind || "fetch", reason: (outcome && outcome.reason) || "", sheet: sheet, assets: matchLocalAssets("", ""), sources: sources };
    }
    const readSheet = sheetFromParsed(outcome && outcome.parsed);
    fillEmptySheet(sheet, readSheet);
    rescuePeraMancaSheet(sheet);
    const labelYear = sheet.vintage;
    if (typeof polishSheetIdentity === "function") polishSheetIdentity(sheet);
    let placed = placeForSheet(sheet.region, sheet.winery, sheet.name);
    if (placed.winery) {
      if (placed.label) sheet.region = placed.label;
      if (placed.winery.web && /^https:\/\//i.test(placed.winery.web)) sources.push(placed.winery.web);
    } else if (sheet.winery || sheet.region || missingIdentity(sheet).length) {
      const search = await quietWineSearch(key, [
        "Contrasta el productor y la zona de este vino con Google Search.",
        "Responde JSON: {\"winery\":\"\",\"region\":\"\",\"grapes\":\"\",\"source\":\"https://...\"}.",
        "winery y region solo si una página citada los nombra. Si no hay fuente, déjalos vacíos.",
        "No inventes historia, región ni nota de cata. No devuelvas añada.",
        "No escribas «Sin dato».",
        "Leído en la etiqueta: " + [sheet.name, sheet.vintage, sheet.region, sheet.winery].filter(Boolean).join(" · ")
      ].join("\n"), ctrl && ctrl.signal);
      const parsed = search && search.parsed;
      const extra = { name: parsed ? String(parsed.name || "") : "" };
      extra.name = "";
      const proposedWinery = parsed ? String(parsed.winery || "").replace(/\s+/g, " ").trim() : "";
      const proposedRegion = parsed ? String(parsed.region || "").replace(/\s+/g, " ").trim() : "";
      const proposedGrapes = parsed ? String(parsed.grapes || "").replace(/\s+/g, " ").trim() : "";
      const wineryUri = groundedClaim(search, [proposedWinery, sheet.name]);
      const regionUri = groundedClaim(search, [proposedRegion, sheet.name]);
      if (!placed.zone) {
        if (regionUri && proposedRegion && !/^sin dato$/i.test(proposedRegion)) {
          sheet.region = proposedRegion;
          sources.push(regionUri);
        } else sheet.region = "";
      }
      if (wineryUri && proposedWinery && !/^sin dato$/i.test(proposedWinery)) {
        sheet.winery = proposedWinery;
        sources.push(wineryUri);
      } else sheet.winery = "";
      if ((wineryUri || regionUri) && proposedGrapes && !/^sin dato$/i.test(proposedGrapes) && !String(sheet.grapes || "").trim()) {
        sheet.grapes = proposedGrapes;
      }
      placed = placeForSheet(sheet.region, sheet.winery, sheet.name);
      if (placed.winery && placed.label) sheet.region = placed.label;
      if (placed.winery && placed.winery.web && /^https:\/\//i.test(placed.winery.web)) sources.push(placed.winery.web);
    }
    if (labelYear) sheet.vintage = labelYear;
    else sheet.vintage = "";
    rescuePeraMancaSheet(sheet);
    if (typeof polishSheetIdentity === "function") polishSheetIdentity(sheet);
    const found = placeForSheet(sheet.region, sheet.winery, sheet.name);
    if (found.label) sheet.region = found.label;
    const assets = found.assets || matchLocalAssets(sheet.region, sheet.winery);
    if (found.zone) {
      assets.zone = found.zone;
      assets.regionAssetImage = found.zone.map || assets.regionAssetImage || "";
    }
    if (found.winery) {
      assets.winery = found.winery;
      if (found.winery.file) assets.wineryAssetImage = found.winery.file;
    }
    if (zoneText && blurbConflicts(zoneText, sheet.region)) zoneText = "";
    if (wineryText && blurbConflicts(wineryText, sheet.region)) wineryText = "";
    return { ok: true, failure: "", reason: "", sheet: sheet, assets: assets, zoneText: zoneText, wineryText: wineryText, sources: sources };
  } catch (err) {
    const aborted = err && (err.name === "AbortError" || /abort/i.test(String(err.message || "")));
    const failure = aborted ? "timeout" : "fetch";
    const onLine = typeof navigator === "undefined" ? true : navigator.onLine;
    if (!aborted && typeof shouldUseOfflineRead === "function" && shouldUseOfflineRead(onLine, "fetch")) {
      return { ok: false, failure: "offline", reason: "", sheet: sheet, assets: matchLocalAssets("", ""), sources: [] };
    }
    return { ok: false, failure: failure, reason: aborted ? "tiempo agotado" : String(err && err.message || ""), sheet: sheet, assets: matchLocalAssets("", ""), sources: [] };
  } finally {
    clearTimeout(timer);
  }
}

function altaCanConfirm(flow) {
  const row = flow || {};
  const place = row.cellarLocation || {};
  return !!(place.cellarId && String(place.bin || "").trim());
}

function altaFailureText(kind, reason) {
  if (kind === "offline") return t("alta.offline");
  if (kind === "image") return t("alta.image");
  if (typeof labelFailureText === "function") return labelFailureText(kind === "fetch" ? "fetch" : kind, reason) || "";
  return String(reason || "");
}

function setAltaChrome(on) {
  const app = document.querySelector(".app");
  if (!app) return;
  app.classList.remove("scan-slots");
  app.classList.toggle("alta-flow", !!on);
}

function armAltaInputs() {
  const cam = document.getElementById("scan-file-cam");
  const lib = document.getElementById("scan-file-lib");
  if (cam) {
    cam.setAttribute("accept", "image/*");
    cam.setAttribute("capture", "environment");
  }
  if (lib) {
    lib.setAttribute("accept", "image/*");
    lib.removeAttribute("capture");
  }
}

function altaEntryButtons() {
  return '<div class="alta-entry">'
    + '<button type="button" class="btn btn-gold" id="alta-cam" onclick="altaPick(\'camara\')">' + escHtml(t("alta.cam")) + "</button>"
    + '<button type="button" class="btn btn-ghost" id="alta-lib" onclick="altaPick(\'fototeca\')">' + escHtml(t("alta.lib")) + "</button>"
    + "</div>";
}

function altaThumb(src, caption) {
  if (!src) return "";
  return '<figure class="alta-shot"><img src="' + escHtml(src) + '" alt="' + escHtml(caption) + '"><figcaption class="tiny">' + escHtml(caption) + "</figcaption></figure>";
}

function renderAltaCapture() {
  if (!altaFlow) altaFlow = blankAltaFlow();
  setAltaChrome(true);
  armAltaInputs();
  const box = document.getElementById("scan-results");
  if (!box) return;
  const front = altaFlow.ask === "back";
  box.innerHTML = '<div class="card" id="alta-capture">'
    + "<h2>" + escHtml(front ? t("alta.stepBack") : t("alta.stepFront")) + "</h2>"
    + "<p>" + escHtml(t("alta.both")) + "</p>"
    + '<div class="alta-photo-row">' + altaThumb(altaFlow.frontLabelImage, t("alta.slotFront")) + altaThumb(altaFlow.backLabelImage, t("alta.slotBack")) + "</div>"
    + altaEntryButtons()
    + (front ? '<button type="button" class="btn btn-ghost" id="alta-skip-back" style="width:100%;margin-top:8px" onclick="altaSkipBack()">' + escHtml(t("alta.onlyFront")) + "</button>" : "")
    + "</div>";
}

function renderAltaAnalysis() {
  setAltaChrome(true);
  const box = document.getElementById("scan-results");
  if (!box) return;
  const failure = altaFlow && altaFlow.failure ? altaFailureText(altaFlow.failure, altaFlow.failureReason) : "";
  box.innerHTML = '<div class="card" id="alta-analysis"><p>' + escHtml(failure || t("alta.analyzing")) + "</p>"
    + (failure ? '<button type="button" class="btn btn-gold" id="alta-retry" style="width:100%;margin-top:8px" onclick="runAltaAnalysis()">' + escHtml(t("alta.retry")) + "</button>" : "")
    + "</div>";
}

function altaBinChoices(cellarId, selected, shelfIndex) {
  let codes = [];
  const caves = (typeof state !== "undefined" && state && state.vinotecas) || [];
  const cave = caves.find(item => item && item.id === cellarId);
  if (cave && typeof ensureCaveSlots === "function") ensureCaveSlots(cave);
  if (typeof rackSlots === "function" && cellarId) codes = rackSlots(cellarId) || [];
  if (shelfIndex != null && shelfIndex !== "" && typeof jesusOn === "function" && jesusOn() && typeof shelfCodesAt === "function") {
    const allowed = shelfCodesAt(cellarId, shelfIndex);
    if (allowed.length) codes = codes.filter(code => allowed.indexOf(code) >= 0);
  }
  if (!codes.length && cellarId && typeof nextBin === "function") codes = [nextBin(cellarId)];
  const used = typeof takenBins === "function" && cellarId ? takenBins(cellarId) : new Set();
  const free = codes.filter(code => !used.has(code));
  const list = free.length ? free : codes;
  const options = ['<option value=""></option>'].concat(list.slice(0, 80).map(code => {
    const label = typeof slotDisplay === "function" ? slotDisplay(cellarId, code) : code;
    return '<option value="' + escHtml(code) + '"' + (code === selected ? " selected" : "") + ">" + escHtml(label) + "</option>";
  }));
  return options.join("");
}

function altaShownFact(label, value) {
  const text = String(value || "").trim();
  if (!text || /^sin dato$/i.test(text)) return "";
  return "<p><span class=\"tiny\">" + escHtml(label) + "</span><br>" + escHtml(text) + "</p>";
}

function renderAltaPreview() {
  if (!altaFlow) return;
  setAltaChrome(false);
  if (typeof show === "function") show("alta");
  const body = document.getElementById("alta-body");
  if (!body) return;
  const sheet = altaFlow.sheet || blankWineSheet();
  const assets = altaFlow.assets || matchLocalAssets(sheet.region, sheet.winery);
  const place = altaFlow.cellarLocation || { cellarId: "", bin: "" };
  const caves = (typeof state !== "undefined" && state && state.vinotecas) || [];
  const chosen = caves.find(cave => cave && cave.id === place.cellarId);
  const jesusShelves = typeof jesusOn === "function" && jesusOn() && chosen && typeof shelfRows === "function" ? shelfRows(chosen) : [];
  const shelfAt = jesusShelves.length && typeof shelfIndexForCode === "function" ? shelfIndexForCode(place.cellarId, place.bin) : null;
  const caveOptions = ['<option value=""></option>'].concat(caves.map(cave => {
    return '<option value="' + escHtml(cave.id) + '"' + (cave.id === place.cellarId ? " selected" : "") + ">" + escHtml(cave.name) + "</option>";
  })).join("");
  const shelfField = jesusShelves.length
    ? '<label class="field"><span>' + escHtml(t("jesus.shelf")) + '</span><select id="alta-shelf" onchange="altaShelfPicked()">' + altaShelfChoices(place.cellarId, shelfAt) + "</select></label>"
    : "";
  const input = (key, label) => '<label class="field"><span>' + escHtml(label) + '</span><input id="alta-f-' + key + '" value="' + escHtml(sheet[key] || "") + '"></label>';
  const asset = (src, caption, open) => {
    if (!src) return "";
    const click = open ? ' onclick="' + open + '"' : "";
    return '<button type="button" class="alta-asset"' + click + '><img src="' + escHtml(src) + '" alt="' + escHtml(caption) + '"><span class="tiny">' + escHtml(caption) + "</span></button>";
  };
  const zoneOpen = assets.zone ? "openZona('" + String(assets.zone.name).replace(/'/g, "") + "')" : "";
  const wineryOpen = assets.winery ? "openBodega('" + assets.winery.id + "')" : "";
  const ready = altaCanConfirm(altaFlow);
  body.innerHTML = '<div id="alta-preview">'
    + '<p class="tiny">' + escHtml(t("alta.draft")) + "</p>"
    + "<h1>" + escHtml(t("alta.preview")) + "</h1>"
    + '<div class="alta-photo-row">'
    + altaThumb(altaFlow.frontLabelImage, t("alta.slotFront"))
    + altaThumb(altaFlow.backLabelImage, t("alta.slotBack"))
    + asset(assets.regionAssetImage, assets.zone ? assets.zone.name : t("alta.zonePhoto"), zoneOpen)
    + asset(assets.wineryAssetImage, assets.winery ? assets.winery.name : t("alta.wineryPhoto"), wineryOpen)
    + "</div>"
    + altaShownFact(t("alta.climate"), altaFlow.zoneText)
    + altaShownFact(t("alta.history"), altaFlow.wineryText)
    + ((altaFlow.sources || []).length ? '<p class="tiny">' + escHtml(t("alta.source")) + " · " + escHtml(altaFlow.sources[0]) + "</p>" : "")
    + '<label class="field"><span>' + escHtml(t("alta.cellar")) + '</span><select id="alta-cellar" onchange="altaCellarPicked()">' + caveOptions + "</select></label>"
    + shelfField
    + '<label class="field"><span>' + escHtml(t("alta.slot")) + '</span><select id="alta-bin" onchange="altaLocationChanged()">' + altaBinChoices(place.cellarId, place.bin, shelfAt) + "</select></label>"
    + '<p class="muted" id="alta-need-place">' + escHtml(ready ? "" : t("alta.needPlace")) + "</p>"
    + '<button type="button" class="btn btn-gold" id="alta-confirm" style="width:100%;margin-top:8px" onclick="confirmAlta(false)"' + (ready ? "" : " disabled") + ">" + escHtml(t("alta.confirm")) + "</button>"
    + '<button type="button" class="btn btn-ghost" id="alta-another" style="width:100%;margin-top:8px" onclick="confirmAlta(true)"' + (ready ? "" : " disabled") + ">" + escHtml(t("alta.saveAnother")) + "</button>"
    + '<div class="alta-grid">'
    + input("name", t("alta.name"))
    + input("winery", t("alta.producer"))
    + input("vintage", t("alta.vintage"))
    + input("region", t("alta.appellation"))
    + input("grapes", t("alta.grapes"))
    + input("abv", t("alta.abv"))
    + input("crianza", t("alta.crianza"))
    + input("serveTemp", t("alta.serve"))
    + input("tasting", t("wine.tasteTab"))
    + input("pairing", t("alta.pairing"))
    + '<label class="field"><span>' + escHtml(t("alta.qty")) + '</span><input id="alta-qty" type="number" min="1" value="' + escHtml(altaFlow.qty || "1") + '"></label>'
    + "</div>"
    + "</div>";
}

function renderAltaStep() {
  if (!altaFlow) altaFlow = blankAltaFlow();
  if (altaFlow.step === "preview") return renderAltaPreview();
  if (altaFlow.step === "analysis") {
    if (typeof show === "function") show("scan");
    return renderAltaAnalysis();
  }
  if (typeof show === "function") show("scan");
  return renderAltaCapture();
}

function altaPick(source) {
  if (!altaFlow) altaFlow = blankAltaFlow();
  if (altaFlow.step !== "capture") {
    altaFlow.step = "capture";
  }
  altaFlow.source = source === "fototeca" ? "fototeca" : "camara";
  armAltaInputs();
  const input = document.getElementById(altaFlow.source === "fototeca" ? "scan-file-lib" : "scan-file-cam");
  if (!input) return;
  input.value = "";
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => altaAcceptPhoto(reader.result);
    reader.readAsDataURL(file);
  };
  renderAltaStep();
  input.click();
}

const ORIENT_PROBE = "/9j/4AAQSkZJRgABAQAAAQABAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgr/wAARCAAQACADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD4vr+Uz/fw+Q6/6qD/AJrwoAKAPryv+Vc/6UD5Dr/qoP8AmvCgAoA//9k=";
let labelOrientCached = "";

function dataUrlBytes(dataUrl) {
  const comma = String(dataUrl || "").indexOf(",");
  if (comma < 0) return new Uint8Array(0);
  const body = dataUrl.slice(comma + 1);
  if (!/;base64/i.test(dataUrl.slice(0, comma))) return new Uint8Array(0);
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 255;
  return out;
}

function dataUrlBlob(dataUrl) {
  const mime = (String(dataUrl || "").match(/^data:([^;,]+)/) || [])[1] || "image/jpeg";
  return new Blob([dataUrlBytes(dataUrl)], { type: mime });
}

function readJpegOrientation(bytes) {
  if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return 1;
  let i = 2;
  while (i + 4 < bytes.length) {
    if (bytes[i] !== 0xff) { i += 1; continue; }
    const marker = bytes[i + 1];
    if (marker === 0xd8) { i += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break;
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (len < 2 || i + 2 + len > bytes.length) break;
    if (marker === 0xe1 && len > 10 && bytes[i + 4] === 0x45 && bytes[i + 5] === 0x78 && bytes[i + 6] === 0x69 && bytes[i + 7] === 0x66) {
      const tiff = i + 10;
      const le = bytes[tiff] === 0x49;
      const u16 = n => le ? (bytes[n] | (bytes[n + 1] << 8)) : ((bytes[n] << 8) | bytes[n + 1]);
      const u32 = n => le ? (bytes[n] | (bytes[n + 1] << 8) | (bytes[n + 2] << 16) | (bytes[n + 3] << 24)) : ((bytes[n] << 24) | (bytes[n + 1] << 16) | (bytes[n + 2] << 8) | bytes[n + 3]);
      let offset = tiff + u32(tiff + 4);
      if (offset > 0 && offset + 2 < bytes.length) {
        const count = u16(offset);
        offset += 2;
        for (let e = 0; e < count; e++) {
          const ent = offset + e * 12;
          if (ent + 12 > bytes.length) break;
          if (u16(ent) === 0x0112) return u16(ent + 8) || 1;
        }
      }
    }
    i += 2 + len;
  }
  return 1;
}

function readJpegSize(bytes) {
  if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) { i += 1; continue; }
    const marker = bytes[i + 1];
    if (marker === 0xd8) { i += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break;
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (len < 2 || i + 2 + len > bytes.length) break;
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
    }
    i += 2 + len;
  }
  return null;
}

function loadImageEl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

function sourceSize(source) {
  return {
    w: source.naturalWidth || source.width || 1,
    h: source.naturalHeight || source.height || 1
  };
}

function drawUpright(source, orientation) {
  const size = sourceSize(source);
  const sw = size.w;
  const sh = size.h;
  const turn = orientation > 4 && orientation < 9;
  const dw = turn ? sh : sw;
  const dh = turn ? sw : sh;
  const edge = Math.max(dw, dh);
  const scale = edge > 1600 ? 1600 / edge : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(dw * scale));
  canvas.height = Math.max(1, Math.round(dh * scale));
  const ctx = canvas.getContext("2d");
  const w = sw * scale;
  const h = sh * scale;
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, w, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, h); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, h, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, h, w); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, w); break;
    default: break;
  }
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function canvasToJpeg(canvas) {
  return canvas.toDataURL("image/jpeg", 0.82);
}

function sampleProbe(source) {
  const size = sourceSize(source);
  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, size.w, size.h);
  const redAt = (x, y) => {
    const px = ctx.getImageData(Math.max(0, x), Math.max(0, y), 1, 1).data;
    return px[0] > 180 && px[0] > px[2] + 40;
  };
  if (size.h > size.w) return redAt(2, 2) ? "top" : "other";
  return redAt(2, 2) ? "left" : "other";
}

async function labelOrientMode() {
  if (labelOrientCached) return labelOrientCached;
  const url = "data:image/jpeg;base64," + ORIENT_PROBE;
  const blob = dataUrlBlob(url);
  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
      const place = sampleProbe(bmp);
      const upright = place === "top" && bmp.height > bmp.width;
      if (bmp.close) bmp.close();
      if (upright) {
        labelOrientCached = "from-image";
        return labelOrientCached;
      }
      try {
        const raw = await createImageBitmap(blob, { imageOrientation: "none" });
        const rawPlace = sampleProbe(raw);
        const rawOk = rawPlace === "left" && raw.width > raw.height;
        if (raw.close) raw.close();
        if (rawOk) {
          labelOrientCached = "none";
          return labelOrientCached;
        }
      } catch (err) {}
    }
  } catch (err) {}
  try {
    const img = await loadImageEl(url);
    labelOrientCached = sampleProbe(img) === "top" ? "already" : "raw";
  } catch (err) {
    labelOrientCached = "raw";
  }
  return labelOrientCached;
}

async function uprightLabelData(dataUrl) {
  if (!dataUrl || String(dataUrl).indexOf("data:image") !== 0) return dataUrl || "";
  const bytes = dataUrlBytes(dataUrl);
  const orient = readJpegOrientation(bytes) || 1;
  if (orient < 2 || orient > 8) return dataUrl;
  const mode = await labelOrientMode();
  try {
    if (mode === "from-image" && typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(dataUrlBlob(dataUrl), { imageOrientation: "from-image" });
      const url = canvasToJpeg(drawUpright(bmp, 1));
      if (bmp.close) bmp.close();
      return url;
    }
    if (mode === "none" && typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(dataUrlBlob(dataUrl), { imageOrientation: "none" });
      const url = canvasToJpeg(drawUpright(bmp, orient));
      if (bmp.close) bmp.close();
      return url;
    }
    const img = await loadImageEl(dataUrl);
    const sof = readJpegSize(bytes);
    let applied = mode === "already";
    if (sof && orient > 4) {
      if (img.naturalWidth === sof.height && img.naturalHeight === sof.width) applied = true;
      else if (img.naturalWidth === sof.width && img.naturalHeight === sof.height) applied = false;
    }
    return canvasToJpeg(drawUpright(img, applied ? 1 : orient));
  } catch (err) {
    return dataUrl;
  }
}

async function rotateSavedLabel() {
  const wine = typeof currentWine !== "undefined" ? currentWine : null;
  if (!wine) return;
  const bottle = typeof currentBottle !== "undefined" ? currentBottle : null;
  const src = typeof ownLabel === "function" ? ownLabel(wine, bottle) : "";
  if (!src || src.indexOf("data:image") !== 0) {
    if (typeof toast === "function") toast(t("label.unread"));
    return;
  }
  const img = await loadImageEl(src);
  const turned = canvasToJpeg(drawUpright(img, 6));
  const lot = bottle && bottle.labelPhoto && String(bottle.labelPhoto).indexOf("idb:lot:") === 0;
  const key = lot ? bottle.labelPhoto.slice(4) : wine.id;
  let ok = false;
  if (typeof saveWineLabelPhoto === "function") ok = await saveWineLabelPhoto(key, turned);
  const marker = ok && typeof labelMarker === "function" ? labelMarker(key) : turned;
  const stored = typeof wineById === "function" ? wineById(wine.id) : wine;
  if (stored && !lot) {
    stored.labelThumb = marker;
    if (stored.frontLabelImage) stored.frontLabelImage = marker;
  }
  if (bottle && lot) bottle.labelPhoto = marker;
  if (typeof save === "function") save();
  if (typeof openWine === "function") openWine(wine.id, bottle);
}

function ensureRotateLabelButton(wine, bottle) {
  const body = document.getElementById("wine-body");
  if (!body || document.getElementById("label-rotate")) return;
  const change = body.querySelector(".label-change");
  if (!change || typeof hasOwnLabel !== "function" || !hasOwnLabel(wine, bottle)) return;
  const row = document.createElement("div");
  row.className = "label-actions";
  change.parentNode.insertBefore(row, change);
  row.appendChild(change);
  const rot = document.createElement("button");
  rot.type = "button";
  rot.className = "btn btn-ghost label-rotate";
  rot.id = "label-rotate";
  rot.textContent = t("label.rotate");
  rot.onclick = () => rotateSavedLabel();
  row.appendChild(rot);
}

async function altaAcceptPhoto(dataUrl) {
  const straight = await uprightLabelData(dataUrl);
  const prepared = typeof prepareLabelImage === "function" ? await prepareLabelImage(straight || dataUrl) : { ok: true, dataUrl: straight || dataUrl };
  if (!prepared.ok) {
    if (typeof toast === "function") toast(t("alta.image"));
    return;
  }
  if (!altaFlow) altaFlow = blankAltaFlow();
  if (altaFlow.ask !== "back") {
    altaFlow.frontLabelImage = prepared.dataUrl;
    altaFlow.ask = "back";
    altaFlow.step = "capture";
    renderAltaStep();
    return;
  }
  altaFlow.backLabelImage = prepared.dataUrl;
  await runAltaAnalysis();
}

async function altaSkipBack() {
  if (!altaFlow || !altaFlow.frontLabelImage) return;
  altaFlow.backLabelImage = "";
  await runAltaAnalysis();
}

async function runAltaAnalysis() {
  if (!altaFlow || !altaFlow.frontLabelImage) return renderAltaCapture();
  altaFlow.step = "analysis";
  altaFlow.failure = "";
  altaFlow.status = "DRAFT";
  renderAltaStep();
  const result = await analyzeAndEnrichWine(altaFlow.frontLabelImage, altaFlow.backLabelImage);
  if (!altaFlow) return;
  if (!result.ok) {
    altaFlow.failure = result.failure || "other";
    altaFlow.failureReason = result.reason || "";
    altaFlow.step = "analysis";
    renderAltaStep();
    return;
  }
  altaFlow.sheet = result.sheet || blankWineSheet();
  altaFlow.assets = result.assets || matchLocalAssets(altaFlow.sheet.region, altaFlow.sheet.winery);
  altaFlow.zoneText = result.zoneText || "";
  altaFlow.wineryText = result.wineryText || "";
  altaFlow.sources = result.sources || [];
  altaFlow.step = "preview";
  altaFlow.status = "DRAFT";
  renderAltaStep();
}

function captureAltaSheet() {
  if (!altaFlow) return;
  altaFlow.sheet = altaFlow.sheet || blankWineSheet();
  Object.keys(altaFlow.sheet).forEach(key => {
    const el = document.getElementById("alta-f-" + key);
    if (el) altaFlow.sheet[key] = String(el.value || "").trim();
  });
  const qty = document.getElementById("alta-qty");
  const cellar = document.getElementById("alta-cellar");
  const bin = document.getElementById("alta-bin");
  if (qty) altaFlow.qty = qty.value;
  if (cellar || bin) {
    altaFlow.cellarLocation = {
      cellarId: cellar ? cellar.value : "",
      bin: bin ? bin.value : ""
    };
  }
}

function altaCellarPicked() {
  captureAltaSheet();
  if (altaFlow && altaFlow.cellarLocation) altaFlow.cellarLocation.bin = "";
  renderAltaPreview();
}

function altaShelfPicked() {
  captureAltaSheet();
  const shelf = document.getElementById("alta-shelf");
  if (altaFlow && altaFlow.cellarLocation && shelf && typeof shelfCodesAt === "function") {
    const codes = shelfCodesAt(altaFlow.cellarLocation.cellarId, shelf.value);
    altaFlow.cellarLocation.bin = codes[0] || "";
  }
  renderAltaPreview();
}

function altaLocationChanged() {
  captureAltaSheet();
  const ready = altaCanConfirm(altaFlow);
  const confirm = document.getElementById("alta-confirm");
  const another = document.getElementById("alta-another");
  if (confirm) confirm.disabled = !ready;
  if (another) another.disabled = !ready;
}

function altaWineId(sheet) {
  const slug = foldAlta((sheet.winery || "") + " " + (sheet.name || "")).replace(/ /g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  const year = String(sheet.vintage || "").replace(/\D/g, "");
  return (slug || "vino") + (year ? "-" + year : "");
}

function emptyAltaRatings() {
  return {
    vivino: { score: 0, scale: 5, note: "" },
    penin: { score: 0, scale: 100, note: "" },
    parker: { score: 0, scale: 100, note: "" },
    spectator: { score: 0, scale: 100, note: "" },
    decanter: { score: 0, scale: 100, note: "" }
  };
}

async function storeAltaImage(key, dataUrl) {
  if (!dataUrl) return "";
  if (typeof saveWineLabelPhoto === "function") {
    const ok = await saveWineLabelPhoto(key, dataUrl);
    if (ok && typeof labelMarker === "function") return labelMarker(key);
  }
  if (String(dataUrl).length < 400000) return dataUrl;
  return "";
}

async function confirmAlta(another) {
  if (!altaFlow) return;
  captureAltaSheet();
  altaFlow.assets = matchLocalAssets(altaFlow.sheet.region, altaFlow.sheet.winery);
  if (!altaCanConfirm(altaFlow)) {
    renderAltaPreview();
    return;
  }
  const sheet = altaFlow.sheet;
  const place = placeForSheet(sheet.region, sheet.winery, sheet.name);
  const assets = place.assets || altaFlow.assets || {};
  const card = place.winery;
  const zone = place.zone;
  altaFlow.assets = assets;
  const id = altaWineId(sheet);
  const printedHouse = String(sheet.winery || "").trim();
  const wine = {
    id: id,
    name: sheet.name || "",
    producer: printedHouse || (card && card.name) || "",
    vintage: parseInt(sheet.vintage, 10) || 0,
    region: place.label || "",
    country: (zone && zone.country) || (card && card.country) || "",
    appellation: place.label || "",
    type: typeof reconcileType === "function" ? reconcileType("", String(sheet.grapes || "")) : "",
    style: "escaneo",
    grapes: typeof grapeParts === "function" ? grapeParts(sheet.grapes) : String(sheet.grapes || "").split(/[,;]/).map(part => part.trim()).filter(Boolean),
    abv: parseFloat(String(sheet.abv || "").replace(",", ".")) || 0,
    volume: "",
    color: "",
    ratings: emptyAltaRatings(),
    priceHint: "",
    tasting: sheet.tasting || "",
    provenance: {
      intake: "usuario",
      intakeStatus: "CONFIRMED",
      zoneId: zone ? zone.name : "",
      wineryId: card ? card.id : "",
      vintageSource: sheet.vintage ? "etiqueta" : "",
      sources: (altaFlow.sources || []).slice(),
      zoneText: altaFlow.zoneText || "",
      wineryText: altaFlow.wineryText || "",
      crianza: sheet.crianza || "",
      serveTemp: sheet.serveTemp || "",
      pairingNote: sheet.pairing || ""
    },
    geo: card ? { lat: card.lat, lng: card.lng, web: card.web, address: card.address, zone: card.town || "" } : {},
    zoneAsset: (zone && zone.map) || "",
    wineryAsset: (card && card.file) || assets.wineryAssetImage || ""
  };
  if (typeof alignWineWithGrapes === "function") alignWineWithGrapes(wine);
  if (tastingConflicts(wine.type, wine.tasting)) wine.tasting = "";
  if (wine.provenance && blurbConflicts(wine.provenance.wineryText, wine.region || wine.appellation)) wine.provenance.wineryText = "";
  if (wine.provenance && blurbConflicts(wine.provenance.zoneText, wine.region || wine.appellation)) wine.provenance.zoneText = "";
  if (card && card.about && wine.provenance && wine.provenance.dossier !== "usuario") {
    wine.dossier = wine.dossier || {};
    if (!wine.dossier.history) {
      wine.dossier.history = String(card.about).trim();
      wine.provenance.dossier = "catálogo";
    }
  }
  const peraBlob = foldAlta([wine.name, sheet.grapes, (wine.grapes || []).join(" ")].join(" "));
  const peraWhite = card && card.id === "cartuxa" && /pera manca/.test(peraBlob) && /branco|blanco|white|antao vaz|arinto/.test(peraBlob) && !/\btinto\b|\btinta\b/.test(peraBlob);
  if (peraWhite) {
    wine.type = "blanco";
    wine.grapes = ["Antão Vaz", "Arinto"];
    wine.country = wine.country || "Portugal";
    wine.appellation = "DOC Alentejo";
    wine.region = "Alentejo";
    wine.provenance.zoneId = "Alentejo";
    wine.provenance.wineryId = "cartuxa";
    wine.zoneAsset = (zone && zone.map) || wine.zoneAsset || "mapa-alentejo.jpg";
    wine.wineryAsset = card.file || wine.wineryAsset || "";
    wine.dossier = wine.dossier || {};
    wine.dossier.history = PERA_MANCA_HISTORY;
    wine.dossier.vinification = PERA_MANCA_VINI;
    wine.dossier.soils = "Suelo granítico.";
    wine.provenance.dossier = "catálogo";
    wine.provenance.wineryText = PERA_MANCA_HISTORY;
    wine.provenance.zoneText = "Continental cálido y seco. Suelo granítico en Évora.";
    PERA_MANCA_SOURCES.forEach(uri => {
      if (wine.provenance.sources.indexOf(uri) < 0) wine.provenance.sources.push(uri);
    });
    if (!wine.geo || !wine.geo.zone) {
      wine.geo = Object.assign({}, wine.geo || {}, { zone: "Évora", web: card.web || "", address: card.address || "" });
    }
  }
  if (!wine.color && wine.type && typeof colorForWineType === "function") wine.color = colorForWineType(wine.type);
  if (typeof normalizeWine === "function") normalizeWine(wine);
  const stored = typeof upsertCustomWine === "function" ? upsertCustomWine(wine) : wine;
  stored.frontLabelImage = await storeAltaImage(stored.id, altaFlow.frontLabelImage);
  stored.backLabelImage = altaFlow.backLabelImage ? await storeAltaImage("back:" + stored.id, altaFlow.backLabelImage) : "";
  if (stored.frontLabelImage) stored.labelThumb = stored.frontLabelImage;
  if (stored.backLabelImage) stored.backLabel = stored.backLabelImage;
  stored.provenance.intakeStatus = "CONFIRMED";
  const cellarId = altaFlow.cellarLocation.cellarId;
  const bin = altaFlow.cellarLocation.bin;
  const qty = Math.max(1, parseInt(altaFlow.qty || "1", 10) || 1);
  let lot = null;
  if (typeof mergeOrCreateLot === "function") {
    lot = mergeOrCreateLot({ wineId: stored.id, cellarId: cellarId, bin: bin, qty: qty, photo: "" });
  }
  altaFlow.status = "CONFIRMED";
  altaFlow.wineId = stored.id;
  if (typeof save === "function") save();
  if (typeof toast === "function") toast(t("alta.confirmed"));
  if (another) {
    altaFlow = blankAltaFlow();
    if (typeof show === "function") show("scan");
    renderAltaCapture();
    return stored;
  }
  setAltaChrome(false);
  if (typeof openWine === "function") openWine(stored.id, lot);
  return stored;
}

function frontCoverSrc(wine) {
  if (!wine) return "";
  const photoOf = ref => {
    if (!ref) return "";
    if (typeof resolvedPhoto === "function") {
      const got = resolvedPhoto(ref);
      if (got) return got;
    }
    if (/^data:image\//i.test(ref) || /^https?:\/\//i.test(ref)) return ref;
    return "";
  };
  return photoOf(wine.labelThumb) || photoOf(wine.frontLabelImage) || (typeof labelSrc === "function" ? (labelSrc(wine, typeof currentBottle !== "undefined" ? currentBottle : null) || "") : "");
}

function sheetIllustration(wine, allowGeneric) {
  const generic = typeof GENERIC_ESTATE !== "undefined" ? GENERIC_ESTATE : "vinedo.jpg";
  const card = (typeof wineryCardFor === "function" && wineryCardFor(wine))
    || (wine && wine.provenance && wine.provenance.wineryId && typeof wineryCardById === "function" ? wineryCardById(wine.provenance.wineryId) : null);
  let winerySrc = wine && wine.wineryAsset || "";
  if ((!winerySrc || winerySrc === generic) && typeof wineryImageFor === "function") {
    const file = wineryImageFor(wine);
    if (file && file !== generic) winerySrc = file;
  }
  if ((!winerySrc || winerySrc === generic) && card && card.file && card.file !== generic) winerySrc = card.file;
  if (winerySrc && winerySrc !== generic) {
    const id = (card && card.id) || (wine.provenance && wine.provenance.wineryId) || "";
    return { src: winerySrc, open: id ? "openBodega('" + String(id).replace(/'/g, "") + "')" : "" };
  }
  let zoneSrc = wine && wine.zoneAsset || "";
  let zoneName = wine && wine.provenance && wine.provenance.zoneId || "";
  if (!zoneSrc && typeof estateArt === "function") {
    const art = estateArt(wine);
    if (art && art.map) zoneSrc = art.map;
  }
  if (!zoneName && typeof detectZone === "function") {
    const hit = detectZone([wine && wine.appellation, wine && wine.region, wine && wine.country].filter(Boolean).join(" "));
    if (hit) {
      zoneName = hit.name;
      if (!zoneSrc) zoneSrc = hit.map || "";
    }
  }
  if (zoneSrc && zoneSrc !== generic) {
    return { src: zoneSrc, open: zoneName ? "openZona('" + String(zoneName).replace(/'/g, "") + "')" : "" };
  }
  if (allowGeneric && generic) return { src: generic, open: "" };
  return { src: "", open: "" };
}

function wineHeroHtml(wine) {
  const front = frontCoverSrc(wine);
  const illus = sheetIllustration(wine, true);
  const wide = front ? "" : " hero-art-full";
  const art = illus.src
    ? (illus.open
      ? '<button type="button" class="hero-art' + wide + '" onclick="' + illus.open + '"><img src="' + escHtml(illus.src) + '" alt=""></button>'
      : '<img class="hero-art' + wide + '" src="' + escHtml(illus.src) + '" alt="">')
    : "";
  if (!front) return '<div class="hero-row hero-row-solo">' + art + "</div>";
  return '<div class="hero-row">' + art + '<div class="foil-wrap"><img class="label-thumb label-thumb-hero" src="' + escHtml(front) + '" alt=""></div></div>';
}

function altaAssetBlock(wine) {
  if (!wine) return "";
  const zoneSrc = wine.zoneAsset || "";
  const winerySrc = wine.wineryAsset || "";
  const photoOf = ref => {
    if (!ref) return "";
    if (typeof resolvedPhoto === "function") return resolvedPhoto(ref) || "";
    return /^data:image\//i.test(ref) ? ref : "";
  };
  const frontSrc = photoOf(wine.labelThumb) || photoOf(wine.frontLabelImage);
  const backSrc = photoOf(wine.backLabel) || photoOf(wine.backLabelImage);
  const zoneText = wine.provenance && wine.provenance.zoneText;
  const wineryText = wine.provenance && wine.provenance.wineryText;
  const confirmed = wine.provenance && wine.provenance.intakeStatus === "CONFIRMED";
  if (!zoneSrc && !winerySrc && !frontSrc && !backSrc && !zoneText && !wineryText) return "";
  const zoneName = (wine.provenance && wine.provenance.zoneId) || wine.appellation || "";
  const wineryId = wine.provenance && wine.provenance.wineryId;
  const bits = [];
  if (frontSrc) bits.push('<figure class="alta-shot"><img src="' + escHtml(frontSrc) + '" alt="' + escHtml(t("alta.slotFront")) + '"><figcaption class="tiny">' + escHtml(t("alta.slotFront")) + "</figcaption></figure>");
  if (backSrc) bits.push('<figure class="alta-shot"><img src="' + escHtml(backSrc) + '" alt="' + escHtml(t("alta.slotBack")) + '"><figcaption class="tiny">' + escHtml(t("alta.slotBack")) + "</figcaption></figure>");
  if (zoneSrc) bits.push('<button type="button" class="alta-asset" onclick="openZona(\'' + String(zoneName).replace(/'/g, "") + '\')"><img src="' + escHtml(zoneSrc) + '" alt=""><span class="tiny">' + escHtml(zoneName || t("alta.zonePhoto")) + "</span></button>");
  if (winerySrc && wineryId) bits.push('<button type="button" class="alta-asset" onclick="openBodega(\'' + wineryId + '\')"><img src="' + escHtml(winerySrc) + '" alt=""><span class="tiny">' + escHtml(wine.producer || t("alta.wineryPhoto")) + "</span></button>");
  const notes = altaShownFact(t("alta.climate"), zoneText) + altaShownFact(t("alta.history"), wineryText);
  const mark = confirmed ? '<p class="tiny" id="alta-confirmed">' + escHtml(t("alta.confirmed")) + "</p>" : "";
  return mark + '<div id="alta-assets" class="alta-photo-row">' + bits.join("") + "</div>" + notes;
}

var openWineAlta = openWine;
openWine = function (wineId, bottle) {
  try {
    if (!(typeof cellarLocked !== "undefined" && cellarLocked) && typeof migrateGrapeIdentity === "function") {
      const rows = migrateGrapeIdentity(state);
      if (rows && rows.length && typeof save === "function") save();
    }
  } catch (err) {}
  openWineAlta(wineId, bottle);
  setAltaChrome(false);
  const wine = typeof wineById === "function" ? wineById(wineId) : null;
  const body = document.getElementById("wine-body");
  if (wine && body) ensureRotateLabelButton(wine, bottle);
  if (!wine || !body || document.getElementById("alta-assets")) return;
  const hero = body.querySelector(".wine-hero");
  if (hero) hero.innerHTML = wineHeroHtml(wine);
  const zoneText = wine.provenance && wine.provenance.zoneText;
  const wineryText = wine.provenance && wine.provenance.wineryText;
  const confirmed = wine.provenance && wine.provenance.intakeStatus === "CONFIRMED";
  const notes = (confirmed ? '<p class="tiny" id="alta-confirmed">' + escHtml(t("alta.confirmed")) + "</p>" : "")
    + altaShownFact(t("alta.climate"), zoneText)
    + altaShownFact(t("alta.history"), wineryText);
  if (notes && hero && !document.getElementById("alta-confirmed")) hero.insertAdjacentHTML("afterend", notes);
};

var startScanAlta = startScan;
startScan = async function () {
  setAltaChrome(true);
  if (typeof stopCam === "function") stopCam();
  altaFlow = blankAltaFlow();
  if (typeof show === "function") show("scan");
  renderAltaCapture();
};

var ingestLabelImageAlta = ingestLabelImage;
ingestLabelImage = async function (dataUrl) {
  await altaAcceptPhoto(dataUrl);
};

pickFromRoll = function () {
  altaPick("fototeca");
};

captureOrOpenCamera = function () {
  altaPick("camara");
};

function backupCellarBeforeV93() {
  const store = typeof STORE !== "undefined" ? STORE : "vinoteca.pro.max.v3";
  try {
    if (localStorage.getItem(ALTA_BACKUP_KEY)) return false;
    const raw = localStorage.getItem(store);
    if (!raw) return false;
    localStorage.setItem(ALTA_BACKUP_KEY, raw);
    return true;
  } catch (err) {
    return false;
  }
}

function labelYearsOf(wine, bag) {
  const bits = [];
  const push = value => { if (value != null && String(value).trim()) bits.push(String(value)); };
  const prov = (wine && wine.provenance) || {};
  push(prov.originalTitle);
  push(prov.rawTitle);
  push(prov.ocrText);
  push(prov.labelText);
  push(prov.pageExcerpt);
  ((bag && bag.bottles) || []).forEach(bottle => {
    if (bottle && wine && bottle.wineId === wine.id) push(bottle.note);
  });
  const years = [];
  bits.join("\n").replace(/\b(19|20)\d{2}\b/g, year => { years.push(year); return year; });
  return years.filter((year, index) => years.indexOf(year) === index);
}

function storedPeraMancaFiction(wine) {
  if (!wine) return false;
  if (peraMancaFiction(wine.name, wine.producer)) return true;
  if (foldAlta(wine.name) !== "terras mancas") return false;
  const blob = foldAlta([
    wine.region, wine.appellation, wine.tasting,
    wine.dossier && wine.dossier.history,
    wine.dossier && wine.dossier.vinification,
    wine.provenance && wine.provenance.wineryText,
    wine.provenance && wine.provenance.zoneText
  ].join(" "));
  return /galicia|rojo cereza|viticultura artesanal/.test(blob) || Number(wine.vintage) === 2025 || tastingConflicts("blanco", wine.tasting);
}

function applyPeraMancaIdentity(wine, bag) {
  const prov = wine.provenance || {};
  wine.provenance = prov;
  const years = labelYearsOf(wine, bag);
  const chosen = years.length === 1 ? parseInt(years[0], 10) : 0;
  if (!prov.originalTitle) prov.originalTitle = [wine.producer, wine.name].filter(Boolean).join(" · ");
  const keptThumb = wine.labelThumb || "";
  const keptFront = wine.frontLabelImage || "";
  const keptBack = wine.backLabelImage || wine.backLabel || "";
  const keptRatings = wine.ratings;
  wine.name = "Pêra-Manca Branco";
  wine.producer = "Fundação Eugénio de Almeida";
  wine.region = "Alentejo";
  wine.appellation = "DOC Alentejo";
  wine.country = "Portugal";
  wine.type = "blanco";
  if (typeof colorForWineType === "function") wine.color = colorForWineType("blanco");
  const lockedGrapes = typeof userLocked === "function" && userLocked(wine, "grapes");
  if (!lockedGrapes) wine.grapes = ["Antão Vaz", "Arinto"];
  wine.vintage = chosen || 0;
  prov.vintageSource = chosen ? "etiqueta" : "";
  prov.zoneId = "Alentejo";
  prov.wineryId = "cartuxa";
  prov.intake = prov.intake || "usuario";
  if (!(typeof userLocked === "function" && userLocked(wine, "tasting"))) wine.tasting = "";
  if (!(typeof userLocked === "function" && userLocked(wine, "pairing"))) {
    wine.pairing = [];
    prov.pairingNote = "";
  }
  const dossierLocked = prov.dossier === "usuario" || (typeof userLocked === "function" && userLocked(wine, "dossier"));
  if (!dossierLocked) {
    wine.dossier = wine.dossier || {};
    wine.dossier.history = PERA_MANCA_HISTORY;
    wine.dossier.vinification = PERA_MANCA_VINI;
    wine.dossier.elevage = "";
    wine.dossier.soils = "Suelo granítico.";
    prov.dossier = "catálogo";
  }
  prov.wineryText = PERA_MANCA_HISTORY;
  prov.zoneText = "Continental cálido y seco. Suelo granítico en Évora.";
  wine.zoneAsset = "mapa-alentejo.jpg";
  wine.wineryAsset = "bodega-cartuxa.jpg";
  wine.geo = Object.assign({}, wine.geo || {});
  if (!wine.geo.web) wine.geo.web = "https://www.cartuxa.pt/";
  if (!wine.geo.address) wine.geo.address = "Quinta de Valbom, Estrada da Soeira, 7005-003 Évora";
  if (!wine.geo.zone) wine.geo.zone = "Évora";
  prov.sources = Array.isArray(prov.sources) ? prov.sources : [];
  PERA_MANCA_SOURCES.forEach(uri => { if (prov.sources.indexOf(uri) < 0) prov.sources.push(uri); });
  if (keptThumb) wine.labelThumb = keptThumb;
  if (keptFront) wine.frontLabelImage = keptFront;
  if (keptBack) {
    wine.backLabelImage = keptBack;
    wine.backLabel = keptBack;
  }
  if (keptRatings) wine.ratings = keptRatings;
  if (wine.ratings) {
    Object.keys(wine.ratings).forEach(key => {
      const block = wine.ratings[key];
      if (block && block.note && (tastingConflicts("blanco", block.note) || /galicia/i.test(block.note))) block.note = "";
    });
  }
  const cuvee = typeof cuveeForWine === "function" ? cuveeForWine(wine, bag) : null;
  if (cuvee && (peraMancaFiction(cuvee.name, cuvee.producer) || foldAlta(cuvee.name) === "terras mancas")) {
    cuvee.name = wine.name;
    cuvee.type = "blanco";
    if (!lockedGrapes) cuvee.grapes = (wine.grapes || []).slice();
    cuvee.appellation = wine.appellation;
    cuvee.region = wine.region;
  }
}

function migratePeraManca() {
  if (typeof state === "undefined" || !state || !Array.isArray(state.customWines)) return false;
  let changed = false;
  state.customWines.forEach(wine => {
    if (!storedPeraMancaFiction(wine)) return;
    applyPeraMancaIdentity(wine, state);
    changed = true;
  });
  if (changed && typeof save === "function" && !(typeof cellarLocked !== "undefined" && cellarLocked)) save();
  return changed;
}

function migrateClearZones() {
  if (typeof state === "undefined" || !state || !Array.isArray(state.customWines)) return false;
  let changed = false;
  state.customWines.forEach(wine => {
    if (!wine || (typeof isCatalogWineId === "function" && isCatalogWineId(wine.id))) return;
    const current = String(wine.appellation || wine.region || "").trim();
    const place = placeForSheet(current, wine.producer || "", wine.name || "");
    const useless = genericRegion(current) || samePlace(current, wine.producer) || (place.winery && samePlace(current, place.winery.name));
    if (!useless || !place.label || samePlace(current, place.label)) return;
    wine.region = place.label;
    wine.appellation = place.label;
    wine.provenance = wine.provenance || {};
    if (place.zone) {
      wine.provenance.zoneId = place.zone.name;
      if (place.zone.map) wine.zoneAsset = place.zone.map;
      if (place.zone.country && !wine.country) wine.country = place.zone.country;
    }
    if (place.winery) {
      wine.provenance.wineryId = place.winery.id;
      if (place.winery.file) wine.wineryAsset = place.winery.file;
    }
    changed = true;
  });
  if (changed && typeof save === "function") save();
  return changed;
}

function migrateAltaPhotos() {
  backupCellarBeforeV93();
  if (typeof state === "undefined" || !state || !Array.isArray(state.customWines)) return false;
  let changed = false;
  state.customWines.forEach(wine => {
    if (!wine) return;
    if (!wine.frontLabelImage && wine.labelThumb) {
      wine.frontLabelImage = wine.labelThumb;
      changed = true;
    }
    if (!wine.backLabelImage && wine.backLabel) {
      wine.backLabelImage = wine.backLabel;
      changed = true;
    }
  });
  if (changed && typeof save === "function") save();
  return changed;
}

function linkIllustratedCellar() {
  if (typeof state === "undefined" || !state || !Array.isArray(state.customWines)) return false;
  if (typeof wineryCardFor !== "function") return false;
  const wanted = { "luis-canas": 1, "garcia-figuero": 1, "pago-de-los-capellanes": 1 };
  const generic = typeof GENERIC_ESTATE !== "undefined" ? GENERIC_ESTATE : "vinedo.jpg";
  let changed = false;
  state.customWines.forEach(wine => {
    if (!wine) return;
    const card = wineryCardFor(wine);
    if (!card || !wanted[card.id] || !card.file) return;
    wine.provenance = wine.provenance || {};
    if (!wine.provenance.wineryId) {
      wine.provenance.wineryId = card.id;
      changed = true;
    }
    if (!wine.wineryAsset || wine.wineryAsset === generic) {
      wine.wineryAsset = card.file;
      changed = true;
    }
    if ((!wine.zoneAsset || wine.zoneAsset === generic) && card.zone && typeof zoneByName === "function") {
      const zone = zoneByName(card.zone);
      if (zone && zone.map) {
        wine.zoneAsset = zone.map;
        if (!wine.provenance.zoneId) wine.provenance.zoneId = zone.name;
        changed = true;
      }
    }
  });
  if (changed && typeof save === "function") save();
  return changed;
}

var compressLabelThumbStraight = compressLabelThumb;
compressLabelThumb = function (dataUrl) {
  return uprightLabelData(dataUrl).then(straight => compressLabelThumbStraight(straight || dataUrl));
};

var applyPageFactsCasa = typeof applyPageFacts === "function" ? applyPageFacts : null;
if (applyPageFactsCasa) {
  applyPageFacts = function (wine, facts, url) {
    const result = applyPageFactsCasa(wine, facts, url);
    if (wine && tastingConflicts(wine.type, wine.tasting)) wine.tasting = "";
    return result;
  };
}
var applyGeminiFactsCasa = typeof applyGeminiFacts === "function" ? applyGeminiFacts : null;
if (applyGeminiFactsCasa) {
  applyGeminiFacts = function (wine, raw) {
    const result = applyGeminiFactsCasa(wine, raw);
    if (wine && tastingConflicts(wine.type, wine.tasting)) wine.tasting = "";
    return result;
  };
}

var prepareOwnLabelsAlta = prepareOwnLabels;
prepareOwnLabels = function () {
  return prepareOwnLabelsAlta().then(() => {
    try {
      migrateAltaPhotos();
      migratePeraManca();
      migrateClearZones();
      linkIllustratedCellar();
      if (typeof migrateGrapeIdentity === "function" && migrateGrapeIdentity(state).length && typeof save === "function") save();
    } catch (err) {}
    return true;
  });
};

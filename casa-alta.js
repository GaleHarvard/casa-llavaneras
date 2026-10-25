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
var ALTA_BACKUP_KEY = "vinoteca.pro.max.v3.antes-v93";

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
  return sheet;
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
    "vintage es el año impreso en la etiqueta. No pongas otra añada que conozcas de ese vino. Si no está, déjalo vacío. No uses un lote L2023 como añada.",
    "region es la DO o la zona impresa. Nunca pongas el nombre de la bodega como zona. winery es la bodega.",
    "grapes, abv, crianza, serveTemp, tasting y pairing solo si se leen. Si no constan, cadena vacía.",
    "No inventes. No escribas «Sin dato»."
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
    const labelYear = readSheet.vintage;
    fillEmptySheet(sheet, readSheet);
    if (missingIdentity(sheet).length) {
      const search = await quietWineSearch(key, [
        "Completa solo los datos que falten de este vino. Usa Google Search.",
        "Responde JSON: {\"name\":\"\",\"vintage\":\"\",\"region\":\"\",\"winery\":\"\",\"grapes\":\"\",\"abv\":\"\",\"crianza\":\"\",\"serveTemp\":\"\",\"tasting\":\"\",\"pairing\":\"\",\"source\":\"https://...\"}.",
        "source es la página de donde sale el dato. Si no hay fuente, deja el campo vacío.",
        "No inventes. No escribas «Sin dato».",
        "Si la añada ya figura en «Ya leído», devuelve vintage vacío. No la sustituyas por otro año.",
        "Ya leído: " + [sheet.name, sheet.vintage, sheet.region, sheet.winery].filter(Boolean).join(" · ")
      ].join("\n"), ctrl && ctrl.signal);
      const uri = citedUri(search);
      if (uri && search && search.parsed) {
        fillEmptySheet(sheet, sheetFromParsed(search.parsed));
        sources.push(uri);
      }
    }
    if (labelYear) sheet.vintage = labelYear;
    const found = placeForSheet(sheet.region, sheet.winery, sheet.name);
    if (found.label) sheet.region = found.label;
    const assets = found.assets || matchLocalAssets(sheet.region, sheet.winery);
    if (found.zone) {
      assets.zone = found.zone;
      assets.regionAssetImage = found.zone.map || assets.regionAssetImage || "";
    }
    if (!assets.zone && sheet.region) {
      const place = await quietWineSearch(key, [
        "Describe la denominación o zona vinícola «" + sheet.region + "»: clima y suelo.",
        "Responde JSON: {\"climate\":\"\",\"soil\":\"\",\"source\":\"https://...\"}.",
        "Si no hay una página que lo sostenga, deja los campos vacíos. No inventes. No escribas «Sin dato»."
      ].join("\n"), ctrl && ctrl.signal);
      const uri = citedUri(place);
      const parsed = place && place.parsed;
      if (uri && parsed) {
        zoneText = [parsed.climate, parsed.soil].map(bit => String(bit || "").trim()).filter(bit => bit && !/^sin dato$/i.test(bit)).join(" ");
        if (zoneText) sources.push(uri);
        else zoneText = "";
      }
    }
    if (!assets.winery && sheet.winery) {
      const house = await quietWineSearch(key, [
        "Describe la bodega «" + sheet.winery + "»: historia, fundación y ubicación.",
        "Responde JSON: {\"history\":\"\",\"founded\":\"\",\"place\":\"\",\"source\":\"https://...\"}.",
        "Si no hay una página que lo sostenga, deja los campos vacíos. No inventes. No escribas «Sin dato»."
      ].join("\n"), ctrl && ctrl.signal);
      const uri = citedUri(house);
      const parsed = house && house.parsed;
      if (uri && parsed) {
        wineryText = [parsed.history, parsed.founded, parsed.place].map(bit => String(bit || "").trim()).filter(bit => bit && !/^sin dato$/i.test(bit)).join(" · ");
        if (wineryText) sources.push(uri);
        else wineryText = "";
      }
    }
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

function altaBinChoices(cellarId, selected) {
  let codes = [];
  const caves = (typeof state !== "undefined" && state && state.vinotecas) || [];
  const cave = caves.find(item => item && item.id === cellarId);
  if (cave && typeof ensureCaveSlots === "function") ensureCaveSlots(cave);
  if (typeof rackSlots === "function" && cellarId) codes = rackSlots(cellarId) || [];
  if (!codes.length && cellarId && typeof nextBin === "function") codes = [nextBin(cellarId)];
  const used = typeof takenBins === "function" && cellarId ? takenBins(cellarId) : new Set();
  const free = codes.filter(code => !used.has(code));
  const list = free.length ? free : codes;
  const options = ['<option value=""></option>'].concat(list.slice(0, 80).map(code => {
    return '<option value="' + escHtml(code) + '"' + (code === selected ? " selected" : "") + ">" + escHtml(code) + "</option>";
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
  const caveOptions = ['<option value=""></option>'].concat(caves.map(cave => {
    return '<option value="' + escHtml(cave.id) + '"' + (cave.id === place.cellarId ? " selected" : "") + ">" + escHtml(cave.name) + "</option>";
  })).join("");
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
    + '<label class="field"><span>' + escHtml(t("alta.slot")) + '</span><select id="alta-bin" onchange="altaLocationChanged()">' + altaBinChoices(place.cellarId, place.bin) + "</select></label>"
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
  const wine = {
    id: id,
    name: sheet.name || "",
    producer: (card && card.name) || sheet.winery || "",
    vintage: parseInt(sheet.vintage, 10) || 0,
    region: place.label || "",
    country: (zone && zone.country) || (card && card.country) || "",
    appellation: place.label || "",
    type: "",
    style: "escaneo",
    grapes: String(sheet.grapes || "").split(/[,;]/).map(part => part.trim()).filter(Boolean),
    abv: parseFloat(String(sheet.abv || "").replace(",", ".")) || 0,
    volume: "",
    color: "#4a1020",
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
  const art = illus.src
    ? (illus.open
      ? '<button type="button" class="hero-art" onclick="' + illus.open + '"><img src="' + escHtml(illus.src) + '" alt=""></button>'
      : '<img class="hero-art" src="' + escHtml(illus.src) + '" alt="">')
    : "";
  const side = front
    ? '<img class="label-thumb label-thumb-hero" src="' + escHtml(front) + '" alt="">'
    : (typeof bottleMarkup === "function" ? bottleMarkup(wine) : "");
  return '<div class="hero-row">' + art + (side ? '<div class="foil-wrap">' + side + "</div>" : "") + "</div>";
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
  const wanted = { "luis-canas": 1, "garcia-figuero": 1 };
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

var prepareOwnLabelsAlta = prepareOwnLabels;
prepareOwnLabels = function () {
  return prepareOwnLabelsAlta().then(() => {
    try { migrateAltaPhotos(); migrateClearZones(); linkIllustratedCellar(); } catch (err) {}
    return true;
  });
};

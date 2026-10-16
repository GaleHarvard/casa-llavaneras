/* Alta v88: visión primero, contraetiqueta, coincidencia aproximada y bodega. */
var labelPair = { front: "", back: "", waitingBack: false };
var altaDraft = null;

var LABEL_KEYS = ["name", "producer", "appellation", "vintage", "type", "grapes", "abv", "volume"];

/* Municipios de referencia. Rueda: Wikipedia 41°24′50″N 4°57′35″O.
   Haro: Wikipedia 42°34′37″N 2°50′46″O. Peso da Régua: ayuntamiento 41.163185, -7.789176.
   Santiuste de San Juan Bautista: Wikipedia 41°09′25″N 4°34′19″O. */
var TOWN_PINS = {
  "santiuste de san juan bautista": { lat: 41.156944, lng: -4.571944, label: "Santiuste de San Juan Bautista" }
};
var DO_CENTROIDS = {
  rueda: { lat: 41.413889, lng: -4.959722, label: "Rueda" },
  rioja: { lat: 42.576944, lng: -2.846111, label: "Haro" },
  douro: { lat: 41.163185, lng: -7.789176, label: "Peso da Régua" }
};

function resetLabelPair() {
  labelPair.front = "";
  labelPair.back = "";
  labelPair.waitingBack = false;
}

function asField(raw) {
  if (raw && typeof raw === "object") {
    const n = Number(raw.confidence);
    const confidence = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : (String(raw.value || "").trim() ? 0.5 : 0);
    return { value: String(raw.value == null ? "" : raw.value).trim(), confidence: confidence };
  }
  const value = raw == null ? "" : String(raw).trim();
  return { value: value, confidence: value ? 0.5 : 0 };
}

function combineField(a, b) {
  const left = asField(a);
  const right = asField(b);
  if (right.value && right.confidence > left.confidence) return right;
  if (left.value) return left;
  if (right.value) return right;
  return { value: "", confidence: 0 };
}

function mergeFieldBags(a, b) {
  const out = {};
  LABEL_KEYS.forEach(key => { out[key] = combineField(a && a[key], b && b[key]); });
  return out;
}

function fieldValue(fields, key) {
  const field = fields && fields[key];
  return field && field.value != null ? String(field.value).trim() : "";
}

function fieldBagHasText(bag) {
  return LABEL_KEYS.some(key => fieldValue(bag, key).length > 1);
}

function levenshtein(a, b) {
  const s = String(a || "");
  const t = String(b || "");
  if (s === t) return 0;
  if (!s) return t.length;
  if (!t) return s.length;
  const prev = new Array(t.length + 1);
  const cur = new Array(t.length + 1);
  for (let j = 0; j <= t.length; j++) prev[j] = j;
  for (let i = 1; i <= s.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= t.length; j++) {
      const cost = s.charAt(i - 1) === t.charAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= t.length; j++) prev[j] = cur[j];
  }
  return prev[t.length];
}

function fuzzyRatio(a, b) {
  const x = foldEstate(a);
  const y = foldEstate(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  if (x.length >= 4 && y.length >= 4 && (x.indexOf(y) >= 0 || y.indexOf(x) >= 0)) return 0.86;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}

function catalogList() {
  if (typeof WINE_CATALOG !== "undefined" && WINE_CATALOG && WINE_CATALOG.length) return WINE_CATALOG;
  if (typeof window !== "undefined" && window.WINE_CATALOG) return window.WINE_CATALOG;
  return [];
}

function fuzzyCatalogHit(fields) {
  const name = fieldValue(fields, "name");
  const producer = fieldValue(fields, "producer");
  const appellation = fieldValue(fields, "appellation");
  const vintage = parseInt(fieldValue(fields, "vintage"), 10) || 0;
  const cleanName = vintage ? name.replace(new RegExp("\\b" + vintage + "\\b"), " ").replace(/\s+/g, " ").trim() : name;
  if (!cleanName && !producer) return null;
  let best = null;
  let bestScore = 0;
  catalogList().forEach(wine => {
    const nameScore = Math.max(
      fuzzyRatio(cleanName, wine.name),
      fuzzyRatio(cleanName, (wine.producer || "") + " " + (wine.name || ""))
    );
    const prodScore = Math.max(
      fuzzyRatio(producer, wine.producer),
      fuzzyRatio(producer, wine.name),
      !producer && cleanName ? fuzzyRatio(cleanName, wine.producer) : 0
    );
    const appScore = appellation ? Math.max(fuzzyRatio(appellation, wine.appellation), fuzzyRatio(appellation, wine.region)) : 0;
    let score = nameScore * 0.55 + prodScore * 0.35 + appScore * 0.1;
    if (vintage && Number(wine.vintage) === vintage) score += 0.08;
    if (vintage && Number(wine.vintage) && Number(wine.vintage) !== vintage) score -= 0.12;
    if (score > bestScore) {
      bestScore = score;
      best = wine;
    }
  });
  if (!best || bestScore < 0.72) return null;
  return {
    wine: best,
    score: Math.round(bestScore * 1000) / 1000,
    sameYear: !vintage || Number(best.vintage) === vintage
  };
}

function intakeHost(url) {
  return String(url || "").replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./, "").toLowerCase();
}

function officialHostOk(url, producer, wineName) {
  const raw = String(url || "").trim();
  if (!/^https:\/\//i.test(raw)) return false;
  if (typeof isShopUrl === "function" && isShopUrl(raw)) return false;
  const hostFold = foldEstate(intakeHost(raw)).replace(/ /g, "");
  if (!hostFold) return false;
  const stop = { bodegas: 1, bodega: 1, celler: 1, domaine: 1, chateau: 1, vinos: 1, vino: 1, wine: 1, wines: 1, casa: 1 };
  const tokens = (text) => foldEstate(text).split(" ").filter(part => part.length >= 4 && !stop[part]);
  const prod = tokens(producer);
  const names = tokens(wineName);
  if (prod.join("").length >= 6 && hostFold.indexOf(prod.join("")) >= 0) return true;
  if (prod.filter(part => hostFold.indexOf(part) >= 0).length >= 2) return true;
  if (names.some(part => part.length >= 5 && hostFold.indexOf(part) >= 0)) return true;
  if (prod.some(part => part.length >= 6 && hostFold.indexOf(part) >= 0)) return true;
  return false;
}

function chunkMentions(url, chunks) {
  const host = intakeHost(url);
  return (chunks || []).some(chunk => {
    const uri = chunk && chunk.uri ? String(chunk.uri) : "";
    if (!uri) return false;
    if (uri.indexOf(url) >= 0 || url.indexOf(uri) >= 0) return true;
    const other = intakeHost(uri);
    return !!(host && other && (other === host || other.endsWith("." + host) || host.endsWith("." + other)));
  });
}

function citedWebUrl(url, chunks, producer, wineName) {
  const list = Array.isArray(chunks) ? chunks : [];
  const raw = String(url || "").trim();
  if (officialHostOk(raw, producer, wineName) && chunkMentions(raw, list)) return raw;
  let found = "";
  list.forEach(chunk => {
    const uri = chunk && chunk.uri ? String(chunk.uri) : "";
    if (!found && officialHostOk(uri, producer, wineName)) found = uri;
  });
  return found;
}

function townPinFor(text) {
  const hay = foldEstate(text);
  let best = null;
  let bestLen = 0;
  Object.keys(TOWN_PINS).forEach(key => {
    if (key.length <= bestLen || hay.indexOf(key) < 0) return;
    best = TOWN_PINS[key];
    bestLen = key.length;
  });
  return best;
}

function doCentroidFor(text) {
  const hay = foldEstate(text);
  const order = ["rueda", "rioja", "douro"];
  let best = "";
  order.forEach(key => {
    if (hay.indexOf(key) >= 0 && key.length > best.length) best = key;
  });
  return best ? DO_CENTROIDS[best] : null;
}

function resolvedPin(w, g) {
  const geo = g || {};
  const lat = Number(geo.lat);
  const lng = Number(geo.lng);
  if (typeof pinOk === "function" && pinOk(lat, lng)) {
    return { lat: lat, lng: lng, approx: "bodega", label: geo.zone || (w && w.producer) || "" };
  }
  const blob = [geo.zone, geo.address, w && w.zone, w && w.producer, w && w.name].filter(Boolean).join(" ");
  const town = townPinFor(blob);
  if (town && pinOk(town.lat, town.lng)) return { lat: town.lat, lng: town.lng, approx: "municipio", label: town.label };
  const cen = doCentroidFor([w && w.appellation, w && w.region, geo.zone].filter(Boolean).join(" "));
  if (cen && pinOk(cen.lat, cen.lng)) return { lat: cen.lat, lng: cen.lng, approx: "do", label: cen.label };
  return { lat: null, lng: null, approx: "", label: "" };
}

function intakeEsc(s) {
  if (typeof escHtml === "function") return escHtml(s);
  return String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function mapLinksHtml(w, g) {
  const pin = resolvedPin(w, g || {});
  if (!pin || typeof pinOk !== "function" || !pinOk(Number(pin.lat), Number(pin.lng))) return "";
  const place = pin.label || "";
  const note = pin.approx === "municipio" ? t("map.pinTown", { place: place }) : (pin.approx === "do" ? t("map.pinDo", { place: place }) : t("map.pinHouse"));
  const lat = Number(pin.lat);
  const lng = Number(pin.lng);
  const q = lat + "," + lng;
  const osm = "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lng + "#map=14/" + lat + "/" + lng;
  const gmaps = "https://www.google.com/maps?q=" + q;
  const apple = "https://maps.apple.com/?ll=" + q + "&q=" + encodeURIComponent(q);
  const link = (href, label) => '<a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="' + href + '" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">' + label + "</a>";
  return '<p class="tiny" style="margin:0 0 4px">' + intakeEsc(note) + "</p>"
    + '<p class="muted" style="margin:0 0 4px;font-size:13px">' + intakeEsc(t("map.coords")) + ": " + lat.toFixed(3) + ", " + lng.toFixed(3) + "</p>"
    + link(gmaps, "Google Maps")
    + link(apple, intakeEsc(t("map.apple")))
    + link(osm, "OpenStreetMap");
}

function imagePart(dataUrl) {
  const comma = String(dataUrl || "").indexOf(",");
  if (comma < 0) return null;
  const mime = (String(dataUrl).slice(0, comma).match(/data:(image\/[a-zA-Z0-9.+-]+)/) || [])[1] || "image/jpeg";
  const data = String(dataUrl).slice(comma + 1);
  if (data.length < 40) return null;
  return { inlineData: { mimeType: mime, data: data } };
}

function labelSchema() {
  const field = { type: "OBJECT", properties: { value: { type: "STRING" }, confidence: { type: "NUMBER" } } };
  const properties = {};
  LABEL_KEYS.forEach(key => { properties[key] = field; });
  return { type: "OBJECT", properties: properties };
}

function bagFromParsed(parsed) {
  const src = parsed || {};
  const bag = {};
  LABEL_KEYS.forEach(key => { bag[key] = asField(src[key]); });
  return bag;
}

async function visionOnce(images) {
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key || typeof geminiWithModel !== "function") return null;
  const parts = (images || []).map(imagePart).filter(Boolean);
  if (!parts.length) return null;
  const prompt = [
    "La primera imagen es la etiqueta del vino. Si hay una segunda imagen, es la contraetiqueta. Léelas juntas y combina los datos.",
    "Responde solo JSON. Cada campo es {\"value\":\"...\",\"confidence\":0 a 1}.",
    "name: nombre del vino. producer: la bodega, no el importador.",
    "appellation: la DO o DOC. vintage: el año, o vacío si no se lee.",
    "type: tinto, blanco, rosado, espumoso o generoso.",
    "grapes: variedades separadas por comas. abv: el grado alcohólico. volume: el volumen de la botella.",
    "confidence 0 si no se lee y 1 si está claro. No inventes."
  ].join("\n");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 22000);
  try {
    const outcome = await geminiWithModel(key, prompt, labelSchema(), ctrl.signal, 800, parts);
    if (!outcome || outcome.fatal || !outcome.parsed) return null;
    return bagFromParsed(outcome.parsed);
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function fieldsFromOcr(text) {
  const raw = String(text || "");
  const year = typeof yearFromText === "function" ? yearFromText(raw) : 0;
  const type = typeof wineTypeFromText === "function" ? (wineTypeFromText(raw) || "") : "";
  const region = typeof detectLabelRegion === "function" ? (detectLabelRegion(raw) || "") : "";
  let name = "";
  if (typeof labelIdentity === "function") {
    try {
      const lines = raw.split(/\n+/).map((line, i) => ({ text: line, h: 16, y: i * 20 }));
      const idn = labelIdentity(lines, raw) || {};
      name = idn.query || idn.brand || "";
    } catch (err) {}
  }
  const low = 0.4;
  return {
    name: { value: name, confidence: name ? low : 0 },
    producer: { value: "", confidence: 0 },
    appellation: { value: region, confidence: region ? low : 0 },
    vintage: { value: year ? String(year) : "", confidence: year ? low : 0 },
    type: { value: type, confidence: type ? low : 0 },
    grapes: { value: "", confidence: 0 },
    abv: { value: "", confidence: 0 },
    volume: { value: "", confidence: 0 }
  };
}

async function readLabelsOffline(front, back) {
  let text = "";
  if (typeof readLabelText === "function") {
    try {
      const first = front ? await readLabelText(front) : null;
      const second = back ? await readLabelText(back) : null;
      text = [first && first.text, second && second.text].filter(Boolean).join("\n");
    } catch (err) {}
  }
  const bag = fieldsFromOcr(text);
  bag._offline = true;
  return bag;
}

async function readBothLabels(front, back) {
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (online && key) {
    let bag = await visionOnce([front, back].filter(Boolean));
    if ((!bag || !fieldBagHasText(bag)) && front && back) {
      const frontBag = await visionOnce([front]);
      const backBag = await visionOnce([back]);
      bag = mergeFieldBags(frontBag, backBag);
    }
    if (bag && fieldBagHasText(bag)) return bag;
  }
  return readLabelsOffline(front, back);
}

function askBackLabel() {
  if (typeof setScanStatus === "function") setScanStatus(t("alta.needBack"));
  const box = document.getElementById("scan-results");
  if (!box) return;
  box.innerHTML = '<div class="card"><p>' + intakeEsc(t("alta.needBack")) + "</p>"
    + '<button type="button" class="btn btn-gold" style="width:100%;margin-top:10px" onclick="shootBackLabel()">' + intakeEsc(t("alta.shootBack")) + "</button>"
    + '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="skipBackLabel()">' + intakeEsc(t("alta.skipBack")) + "</button></div>";
}

function shootBackLabel() {
  labelPair.waitingBack = true;
  if (typeof resetScanPreview === "function") resetScanPreview();
  if (typeof startLiveCamera !== "function") {
    if (typeof pickLabelPhoto === "function") pickLabelPhoto();
    return;
  }
  startLiveCamera().then(ok => {
    if (!ok && typeof pickLabelPhoto === "function") pickLabelPhoto();
  });
}

async function skipBackLabel() {
  labelPair.waitingBack = false;
  await readAndConfirmLabels();
}

async function readAndConfirmLabels() {
  if (typeof setScanStatus === "function") setScanStatus(t("alta.reading"));
  const box = document.getElementById("scan-results");
  if (box) box.innerHTML = '<div class="card muted">' + intakeEsc(t("alta.reading")) + "</div>";
  const fields = await readBothLabels(labelPair.front, labelPair.back);
  openAlta({
    fields: fields,
    photos: [labelPair.front, labelPair.back].filter(Boolean),
    catalog: fuzzyCatalogHit(fields),
    offline: !!(fields && fields._offline)
  });
}

async function ingestLabelImage(dataUrl) {
  const img = typeof compressDataUrl === "function" ? await compressDataUrl(dataUrl, 720, 0.72) : dataUrl;
  if (!labelPair.waitingBack || !labelPair.front) {
    labelPair.front = img;
    labelPair.back = "";
    labelPair.waitingBack = true;
    if (typeof lastLabelData !== "undefined") lastLabelData = img;
    if (typeof showLabelPreview === "function") showLabelPreview(img);
    askBackLabel();
    return;
  }
  labelPair.back = img;
  labelPair.waitingBack = false;
  await readAndConfirmLabels();
}

function fieldsFromQuery(text) {
  const bag = fieldsFromOcr(text);
  if (!fieldValue(bag, "name") && String(text || "").trim()) {
    bag.name = { value: String(text).trim(), confidence: 0.45 };
  }
  return bag;
}

function manualIntake() {
  if (typeof intakeSource !== "undefined") intakeSource = "manual";
  resetLabelPair();
  const q = ((document.getElementById("scan-q") && document.getElementById("scan-q").value) || "").trim();
  const fields = fieldsFromQuery(q);
  openAlta({ fields: fields, photos: [], catalog: fuzzyCatalogHit(fields), offline: false });
}

function doubtClass(field) {
  const value = field && String(field.value || "").trim();
  const confidence = Number(field && field.confidence);
  return !value || !(confidence >= 0.75) ? "field doubt" : "field";
}

function captureAltaEdits() {
  if (!altaDraft) return;
  altaDraft.fields = altaDraft.fields || {};
  LABEL_KEYS.forEach(key => {
    const el = document.getElementById("alta-" + key);
    if (!el) return;
    const prev = altaDraft.fields[key] || { value: "", confidence: 0 };
    const value = el.value.trim();
    altaDraft.fields[key] = { value: value, confidence: value === String(prev.value || "") ? (Number(prev.confidence) || 0) : 1 };
  });
  const qty = document.getElementById("alta-qty");
  const cellar = document.getElementById("alta-cellar");
  const bin = document.getElementById("alta-bin");
  if (qty) altaDraft.qty = qty.value;
  if (cellar) altaDraft.cellarId = cellar.value;
  if (bin) altaDraft.bin = bin.value;
}

function altaCellarChanged() {
  const cellar = document.getElementById("alta-cellar");
  const bin = document.getElementById("alta-bin");
  if (!cellar || !bin || typeof nextBin !== "function") return;
  bin.value = nextBin(cellar.value);
  if (altaDraft) altaDraft.bin = bin.value;
}

function renderAlta() {
  if (!altaDraft) return;
  captureAltaEdits();
  const fields = altaDraft.fields || {};
  const photos = (altaDraft.photos || []).map(src => '<img src="' + src + '" alt="' + intakeEsc(t("alta.photo")) + '">').join("");
  const input = (key, wide) => {
    const field = fields[key] || { value: "", confidence: 0 };
    return '<label class="' + doubtClass(field) + (wide ? " wide" : "") + '"><span>' + intakeEsc(t("alta." + key)) + "</span>"
      + '<input id="alta-' + key + '" value="' + intakeEsc(field.value || "") + '"></label>';
  };
  const caves = (typeof state !== "undefined" && state && state.vinotecas) || [];
  const cellarId = altaDraft.cellarId || (caves[0] && caves[0].id) || "v1";
  const options = caves.map(cave => '<option value="' + intakeEsc(cave.id) + '"' + (cave.id === cellarId ? " selected" : "") + ">" + intakeEsc(cave.name) + "</option>").join("");
  const bin = altaDraft.bin || (typeof nextBin === "function" ? nextBin(cellarId) : "");
  const catalog = altaDraft.catalog && altaDraft.catalog.wine && altaDraft.catalog.score >= 0.72
    ? '<p class="tiny">' + intakeEsc(t("alta.catalog")) + ": " + intakeEsc(altaDraft.catalog.wine.producer + " " + altaDraft.catalog.wine.name + " " + (altaDraft.catalog.wine.vintage || "")) + "</p>"
    : "";
  const offline = altaDraft.offline ? '<p class="muted">' + intakeEsc(t("alta.offline")) + "</p>" : "";
  const body = document.getElementById("alta-body");
  if (!body) return;
  body.innerHTML = ''
    + "<h1>" + intakeEsc(t("alta.h1")) + "</h1>"
    + '<p class="muted">' + intakeEsc(t("alta.lead")) + "</p>"
    + offline
    + (photos ? '<div class="alta-photos">' + photos + "</div>" : "")
    + catalog
    + '<div class="alta-grid">'
    + input("name", true) + input("producer", true) + input("appellation", true) + input("grapes", true)
    + input("vintage", false) + input("type", false) + input("abv", false) + input("volume", false)
    + '<label class="field"><span>' + intakeEsc(t("alta.qty")) + '</span><input id="alta-qty" type="number" min="1" value="' + intakeEsc(altaDraft.qty || "1") + '"></label>'
    + '<label class="field"><span>' + intakeEsc(t("alta.where")) + '</span><select id="alta-cellar" onchange="altaCellarChanged()">' + options + "</select></label>"
    + '<label class="field wide"><span>' + intakeEsc(t("alta.bin")) + '</span><input id="alta-bin" value="' + intakeEsc(bin) + '"></label>'
    + "</div>"
    + '<div class="alta-actions">'
    + '<button type="button" class="btn btn-gold" style="width:100%" onclick="saveAlta(false)">' + intakeEsc(t("alta.save")) + "</button>"
    + '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="saveAlta(true)">' + intakeEsc(t("alta.saveAnother")) + "</button>"
    + "</div>";
}

function openAlta(opts) {
  const options = opts || {};
  const caves = (typeof state !== "undefined" && state && state.vinotecas) || [];
  const cellarId = options.cellarId || (caves[0] && caves[0].id) || "v1";
  altaDraft = {
    fields: mergeFieldBags(options.fields, null),
    photos: options.photos || [],
    catalog: options.catalog || null,
    offline: !!options.offline,
    qty: options.qty || "1",
    cellarId: cellarId,
    bin: options.bin || (typeof nextBin === "function" ? nextBin(cellarId) : "")
  };
  renderAlta();
  if (typeof show === "function") show("alta");
}

function normIntakeType(raw) {
  const s = foldEstate(raw);
  if (/espum|champ|cava|brut/.test(s)) return "espumoso";
  if (/rosad|rose/.test(s)) return "rosado";
  if (/blanc|white/.test(s)) return "blanco";
  if (/generos|jerez|porto|port\b/.test(s)) return "generoso";
  if (/tint|red/.test(s)) return "tinto";
  return String(raw || "").trim();
}

function intakeSlug(producer, name, vintage) {
  const slug = foldEstate(producer + " " + name).replace(/ /g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
  return (slug || "vino") + (vintage ? "-" + vintage : "");
}

function applyKnownWinery(wine) {
  const lib = typeof estateHit === "function" ? estateHit(wine) : null;
  if (!lib) return;
  wine.geo = wine.geo || {};
  if (!wine.geo.web && lib.web) wine.geo.web = lib.web;
  if (!wine.geo.address && lib.address) wine.geo.address = lib.address;
  if (!wine.geo.zone && lib.zone) wine.geo.zone = lib.zone;
  if (!(typeof pinOk === "function" && pinOk(Number(wine.geo.lat), Number(wine.geo.lng))) && lib.lat != null) {
    wine.geo.lat = lib.lat;
    wine.geo.lng = lib.lng;
  }
}

function emptyRatings() {
  return {
    vivino: { score: 0, scale: 5, note: "" },
    penin: { score: 0, scale: 100, note: "" },
    parker: { score: 0, scale: 100, note: "" },
    spectator: { score: 0, scale: 100, note: "" },
    decanter: { score: 0, scale: 100, note: "" }
  };
}

function upsertCustomWine(draft) {
  state.customWines = state.customWines || [];
  const hit = state.customWines.find(wine => wine && wine.id === draft.id);
  if (!hit) {
    state.customWines.push(draft);
    return draft;
  }
  ["name", "producer", "appellation", "vintage", "type", "grapes", "abv", "volume", "region", "country"].forEach(key => {
    if (draft[key] != null && draft[key] !== "" && !(Array.isArray(draft[key]) && !draft[key].length)) hit[key] = draft[key];
  });
  hit.geo = Object.assign({}, hit.geo || {}, draft.geo || {});
  hit.provenance = Object.assign({}, hit.provenance || {}, draft.provenance || {});
  return hit;
}

function wineForIntake(fields, catalogHit) {
  const name = fieldValue(fields, "name") || t("alta.name");
  const producer = fieldValue(fields, "producer") || name;
  const vintage = parseInt(fieldValue(fields, "vintage"), 10) || 0;
  const hit = catalogHit && catalogHit.wine;
  const same = hit && catalogHit.sameYear && catalogHit.score >= 0.72
    && (fuzzyRatio(name, hit.name) >= 0.6 || fuzzyRatio(producer, hit.producer) >= 0.8);
  if (same) return { wine: hit, fromCatalog: true };
  const zone = typeof detectZone === "function" ? detectZone([fieldValue(fields, "appellation"), name, producer].join(" ")) : null;
  const grapes = fieldValue(fields, "grapes").split(/[,;/]/).map(part => part.trim()).filter(Boolean);
  const abv = parseFloat(fieldValue(fields, "abv").replace(",", "."));
  const draft = {
    id: intakeSlug(producer, name, vintage),
    name: name,
    producer: producer,
    vintage: vintage,
    region: zone ? zone.name : "",
    country: zone && zone.country ? zone.country : "",
    appellation: fieldValue(fields, "appellation"),
    type: normIntakeType(fieldValue(fields, "type")),
    style: "escaneo",
    grapes: grapes,
    abv: Number.isFinite(abv) ? abv : 0,
    volume: fieldValue(fields, "volume"),
    color: normIntakeType(fieldValue(fields, "type")) === "blanco" ? "#dcc07a" : "#4a1020",
    ratings: emptyRatings(),
    priceHint: "",
    tasting: "",
    evolutionNotes: [],
    provenance: { intake: "usuario" },
    geo: {}
  };
  LABEL_KEYS.forEach(key => { draft.provenance[key] = "usuario"; });
  applyKnownWinery(draft);
  return { wine: upsertCustomWine(draft), fromCatalog: false };
}

async function attachWineryFromWeb(wineId) {
  const custom = (state.customWines || []).find(wine => wine && wine.id === wineId);
  if (!custom || typeof geminiSearchScores !== "function" || typeof storedGeminiKey !== "function") return;
  const key = storedGeminiKey();
  if (!key) return;
  if (typeof memGet === "function" && memGet("quota-day")) return;
  const lib = typeof estateHit === "function" ? estateHit(custom) : null;
  const geo = custom.geo || {};
  const hasWeb = (geo.web && !(typeof isShopUrl === "function" && isShopUrl(geo.web))) || (lib && lib.web);
  const hasPin = (typeof pinOk === "function" && pinOk(Number(geo.lat), Number(geo.lng))) || (lib && lib.lat != null);
  if (hasWeb && hasPin) return;
  const prompt = [
    "Busca la bodega oficial de este vino con Google Search.",
    "Responde solo JSON: {\"web\":\"https://...\",\"address\":\"\",\"lat\":0,\"lng\":0,\"zone\":\"municipio\"}.",
    "web es el sitio de la bodega, no una tienda. lat y lng son de la bodega; si no constan, 0.",
    "No inventes. Si no hay página oficial, deja web vacío.",
    "Vino: " + [custom.producer, custom.name, custom.vintage, custom.appellation].filter(Boolean).join(" · ")
  ].join("\n");
  const outcome = await geminiSearchScores(key, prompt);
  const chunks = typeof groundingChunksOf === "function" ? groundingChunksOf(outcome && outcome.raw) : [];
  const parsed = (outcome && outcome.parsed) || {};
  const web = citedWebUrl(parsed.web, chunks, custom.producer, custom.name);
  if (!web && !(chunks || []).some(chunk => chunk && chunk.uri)) return;
  custom.geo = custom.geo || {};
  let changed = false;
  if (web && !custom.geo.web) { custom.geo.web = web; changed = true; }
  const address = String(parsed.address || "").trim();
  if (address && !custom.geo.address && !(typeof textShop === "function" && textShop(address))) {
    custom.geo.address = address;
    changed = true;
  }
  const zone = String(parsed.zone || "").trim();
  if (zone && !custom.geo.zone && !(typeof textShop === "function" && textShop(zone))) {
    custom.geo.zone = zone;
    changed = true;
  }
  const lat = Number(parsed.lat);
  const lng = Number(parsed.lng);
  if (web && typeof pinOk === "function" && pinOk(lat, lng) && !pinOk(Number(custom.geo.lat), Number(custom.geo.lng))) {
    custom.geo.lat = lat;
    custom.geo.lng = lng;
    changed = true;
  }
  if (changed && typeof save === "function") save();
}

function finishIntakeBackground(wineId, fromCatalog) {
  setTimeout(() => {
    const run = async () => {
      try { await attachWineryFromWeb(wineId); } catch (err) {}
      if (!fromCatalog && typeof searchPublishedScores === "function") {
        try { await searchPublishedScores(wineId, true); } catch (err) {}
      }
    };
    run();
  }, 40);
}

function saveAlta(another) {
  if (typeof cellarLocked !== "undefined" && cellarLocked) return;
  if (!altaDraft) return;
  captureAltaEdits();
  const built = wineForIntake(altaDraft.fields, altaDraft.catalog);
  const wine = built.wine;
  if (!wine) return;
  const cellarId = altaDraft.cellarId || "v1";
  const qty = Math.max(1, parseInt(altaDraft.qty || "1", 10) || 1);
  const bin = (altaDraft.bin || "").trim() || (typeof nextBin === "function" ? nextBin(cellarId) : "");
  if (typeof slotTaken === "function" && slotTaken(cellarId, bin)) {
    const who = state.bottles.find(bottle => bottle.cellarId === cellarId && (bottle.bin || "") === bin);
    const other = who && typeof wineById === "function" ? wineById(who.wineId) : null;
    const label = other ? (other.producer + " " + other.name) : t("alta.where");
    if (typeof confirm === "function" && !confirm(t("slot.taken", { bin: bin, name: label }))) return;
  }
  const photo = (altaDraft.photos || [])[0] || "";
  const lot = mergeOrCreateLot({ wineId: wine.id, cellarId: cellarId, bin: bin, qty: qty, photo: photo });
  if (typeof save === "function") save();
  if (photo && typeof rememberLabelPhoto === "function") rememberLabelPhoto(wine.id, photo, lot);
  if (typeof toast === "function") toast(t("alta.saved"));
  finishIntakeBackground(wine.id, built.fromCatalog);
  if (another) {
    resetLabelPair();
    if (typeof startScan === "function") startScan();
    return;
  }
  if (typeof openWine === "function") openWine(wine.id, lot);
}

(function () {
  var prev = typeof refreshVisible === "function" ? refreshVisible : null;
  window.refreshVisible = function () {
    if (prev) prev();
    try {
      if (typeof screenId !== "undefined" && screenId === "alta" && altaDraft) renderAlta();
    } catch (err) {}
  };
})();

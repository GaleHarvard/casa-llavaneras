/* Alta v89: una sola lectura, código de barras y nombres sin repetición. */
LABEL_KEYS = ["name", "producer", "appellation", "vintage", "type", "category", "grapes", "abv", "volume", "ean", "web"];

function clipText(text, max) {
  const limit = max || 80;
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= limit) return s;
  return s.slice(0, limit).replace(/[\s,./|;–—-]+$/g, "").trim();
}

function escapeReg(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripLegalSuffix(text) {
  let s = String(text || "");
  s = s.replace(/\bpropietat\s+d['’][^/|;]*/gi, " ");
  s = s.replace(/\b(s\.\s*a\.\s*u\.?|s\.\s*l\.\s*u\.?|s\.\s*c\.\s*p\.?|s\.\s*a\.?|s\.\s*l\.?|gmbh|ltd\.?|inc\.?)\b/gi, " ");
  s = s.replace(/(^|\s)b\.(?=\s|$)/gi, " ");
  s = s.replace(/[…]+/g, " ");
  s = s.replace(/\s+/g, " ").replace(/^[\s,.\-–—/]+|[\s,.\-–—/]+$/g, "").trim();
  return s;
}

function collapseRun(text) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length < 12) return s;
  const max = Math.min(48, Math.floor(s.length / 2));
  for (let len = 6; len <= max; len++) {
    const unit = s.slice(0, len).trim();
    if (unit.length < 6) continue;
    const re = new RegExp("^(?:" + escapeReg(unit) + "[\\s/|;,.–—-]*){2,}", "i");
    if (re.test(s)) return unit;
  }
  return s;
}

function uniqueSegments(text) {
  const parts = String(text || "").split(/\s*[/|;]\s*/).map(part => part.replace(/\s+/g, " ").trim()).filter(Boolean);
  const kept = [];
  parts.forEach(part => {
    const key = typeof foldEstate === "function" ? foldEstate(stripLegalSuffix(part)) : stripLegalSuffix(part).toLowerCase();
    if (!key) return;
    const dup = kept.some(prev => {
      const other = typeof foldEstate === "function" ? foldEstate(stripLegalSuffix(prev)) : stripLegalSuffix(prev).toLowerCase();
      if (!other) return false;
      if (other === key) return true;
      if (other.length >= 6 && key.length >= 6 && (key.indexOf(other) >= 0 || other.indexOf(key) >= 0)) return true;
      return false;
    });
    if (!dup) kept.push(part);
  });
  return kept;
}

function normalizeWineryName(text) {
  const parts = uniqueSegments(text);
  let s = parts.length ? parts[0] : String(text || "");
  s = stripLegalSuffix(collapseRun(s));
  s = stripLegalSuffix(collapseRun(s));
  return clipText(s, 80);
}

function cleanAbv(value) {
  const m = String(value || "").match(/(\d{1,2}(?:[.,]\d)?)/);
  return m ? m[1] : "";
}

function cleanVolume(value) {
  const s = clipText(value, 80);
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(cl|ml|l)\b/i);
  if (!m) return s;
  return m[1] + " " + m[2].toLowerCase();
}

function cleanVintage(value) {
  const m = String(value || "").match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : "";
}

function genericWineName(name, producer) {
  const n = typeof foldEstate === "function" ? foldEstate(name) : String(name || "").toLowerCase();
  const p = typeof foldEstate === "function" ? foldEstate(producer) : String(producer || "").toLowerCase();
  if (!n || n.length < 2) return true;
  if (/^(vino|vi|wine|vin|vinho|cava)$/.test(n)) return true;
  if (p && n === p) return true;
  return false;
}

function composeWineName(producer, category, vintage) {
  return clipText([producer, category, vintage].filter(Boolean).join(" "), 80);
}

function normalizeLabelBag(bag) {
  const src = bag || {};
  const out = {};
  LABEL_KEYS.forEach(key => { out[key] = asField(src[key]); });
  out.producer.value = normalizeWineryName(out.producer.value);
  out.name.value = clipText(stripLegalSuffix(collapseRun(out.name.value)), 80);
  out.category.value = clipText(collapseRun(out.category.value), 80);
  out.vintage.value = cleanVintage(out.vintage.value);
  if (genericWineName(out.name.value, out.producer.value)) {
    const composed = composeWineName(out.producer.value, out.category.value, out.vintage.value);
    if (composed && !genericWineName(composed, out.producer.value)) out.name.value = composed;
    else if (out.producer.value && out.vintage.value) out.name.value = clipText(out.producer.value + " " + out.vintage.value, 80);
  }
  out.appellation.value = clipText(collapseRun(out.appellation.value), 80);
  out.type.value = clipText(typeof normIntakeType === "function" ? normIntakeType(out.type.value) : out.type.value, 80);
  out.grapes.value = clipText(collapseRun(out.grapes.value), 80);
  out.abv.value = cleanAbv(out.abv.value);
  out.volume.value = cleanVolume(out.volume.value);
  out.web.value = clipText(out.web.value, 80);
  out.ean.value = String(out.ean.value || "").replace(/\D/g, "").slice(0, 14);
  if (out.producer.confidence && out.producer.value) out.producer.confidence = Math.max(out.producer.confidence, 0.5);
  return out;
}

function bagFromParsed(parsed) {
  const src = parsed || {};
  const bag = {};
  LABEL_KEYS.forEach(key => { bag[key] = asField(src[key]); });
  return bag;
}

function labelSchema() {
  const field = {
    type: "OBJECT",
    properties: { value: { type: "STRING" }, confidence: { type: "NUMBER" } },
    required: ["value", "confidence"]
  };
  const properties = {};
  LABEL_KEYS.forEach(key => { properties[key] = field; });
  return { type: "OBJECT", properties: properties, required: LABEL_KEYS.slice() };
}

function acceptGeminiLabel(outcome) {
  const src = outcome || {};
  const finish = String(src.finish || "");
  const reason = String(src.reason || "");
  if (finish === "MAX_TOKENS") return { bag: null, failure: "cut", reason: reason };
  if (src.quota || /cuota|quota|l[ií]mite por minuto|per-minute|limite à la minute|limite por minuto/i.test(reason)) {
    return { bag: null, failure: "quota", reason: reason };
  }
  if (/clave/i.test(reason)) return { bag: null, failure: "key", reason: reason };
  if (/red o CORS|failed to fetch|network error|tiempo agotado/i.test(reason)) {
    return { bag: null, failure: "network", reason: reason };
  }
  if (!src.parsed || src.fatal) return { bag: null, failure: reason ? "other" : "network", reason: reason };
  return { bag: normalizeLabelBag(bagFromParsed(src.parsed)), failure: "", reason: "" };
}

function labelFailureText(kind, reason) {
  const why = String(reason || "").trim();
  if (kind === "cut") return t("alta.cut");
  if (kind === "needKey") return t("alta.needKey");
  if (kind === "key") return why || t("alta.needKey");
  if (kind === "quota") return why || t("alta.quota");
  if (kind === "network") return t("alta.network");
  if (kind === "image") return t("alta.image");
  if (kind === "other" && why) return why;
  return "";
}

function eanChecksumOk(code) {
  const s = String(code || "").replace(/\D/g, "");
  if (s.length !== 8 && s.length !== 13) return false;
  const digits = s.split("").map(n => parseInt(n, 10));
  const check = digits.pop();
  let sum = 0;
  for (let i = digits.length - 1, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) sum += digits[i] * weight;
  return (10 - (sum % 10)) % 10 === check;
}

function parseOffProduct(json) {
  if (!json || json.status !== 1 || !json.product) return null;
  const product = json.product;
  const web = String(product.link || product.url || "").trim();
  return {
    name: String(product.product_name_es || product.product_name || "").trim(),
    producer: String(product.brands || "").split(",")[0].trim(),
    ean: String(product.code || json.code || "").replace(/\D/g, ""),
    volume: String(product.quantity || "").trim(),
    web: /^https:\/\//i.test(web) ? web : ""
  };
}

function emptyLabelBag() {
  const bag = {};
  LABEL_KEYS.forEach(key => { bag[key] = { value: "", confidence: 0 }; });
  return bag;
}

function fillIfEmpty(bag, key, value, confidence) {
  if (!value || !bag[key]) return;
  if (String(bag[key].value || "").trim()) return;
  bag[key] = { value: String(value).trim(), confidence: confidence };
}

function mergeScanSources(geminiBag, off, reads) {
  const bag = emptyLabelBag();
  const src = geminiBag || {};
  LABEL_KEYS.forEach(key => { if (src[key]) bag[key] = asField(src[key]); });
  const product = off || null;
  if (product) {
    fillIfEmpty(bag, "name", product.name, 0.85);
    fillIfEmpty(bag, "producer", product.producer, 0.85);
    fillIfEmpty(bag, "volume", product.volume, 0.85);
    fillIfEmpty(bag, "web", product.web, 0.85);
    fillIfEmpty(bag, "ean", product.ean, 0.85);
  }
  let ean = "";
  let qr = "";
  (reads || []).forEach(read => {
    const raw = String(read && read.raw || "").trim();
    const digits = raw.replace(/\D/g, "");
    if (!ean && eanChecksumOk(digits)) ean = digits;
    if (!qr && /^https:\/\//i.test(raw) && !(typeof isShopUrl === "function" && isShopUrl(raw))) qr = raw;
  });
  if (ean) bag.ean = { value: ean, confidence: 0.98 };
  if (qr && !String(bag.web.value || "").trim()) bag.web = { value: qr, confidence: 0.9 };
  return normalizeLabelBag(bag);
}

function catalogByEan(ean) {
  const code = String(ean || "").replace(/\D/g, "");
  if (!code) return null;
  const hit = catalogList().find(wine => String((wine && (wine.ean || wine.barcode)) || "").replace(/\D/g, "") === code);
  return hit || null;
}

function validIntakeIdentity(name, producer) {
  const ok = value => {
    const s = String(value || "").trim();
    if (s.length < 2 || s.length > 80) return false;
    if ((s.match(/\//g) || []).length >= 2) return false;
    return true;
  };
  return ok(name) && ok(producer);
}

function sheetTitle(text) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  if (raw.length <= 80 && (raw.match(/\//g) || []).length < 2) return raw;
  return normalizeWineryName(raw) || clipText(raw, 80);
}

function repairRepeatedTitles(bag) {
  const st = bag || (typeof state !== "undefined" ? state : null);
  if (!st || !Array.isArray(st.customWines)) return false;
  let changed = false;
  st.customWines.forEach(wine => {
    if (!wine) return;
    const originalName = String(wine.name || "");
    const originalProducer = String(wine.producer || "");
    const cleanedProducer = normalizeWineryName(originalProducer) || clipText(originalProducer, 80);
    let cleanedName = clipText(stripLegalSuffix(collapseRun(originalName)), 80);
    if (genericWineName(cleanedName, cleanedProducer)) {
      const year = wine.vintage ? String(wine.vintage) : "";
      const category = wine.provenance && wine.provenance.category ? wine.provenance.category : "";
      const composed = composeWineName(cleanedProducer, category, year);
      if (composed) cleanedName = composed;
    }
    if (cleanedName === originalName && cleanedProducer === originalProducer) return;
    wine.provenance = wine.provenance || {};
    const original = [originalProducer, originalName].filter(Boolean).join(" · ");
    if (!wine.provenance.originalTitle) wine.provenance.originalTitle = original;
    (st.bottles || []).forEach(bottle => {
      if (!bottle || bottle.wineId !== wine.id) return;
      const line = "Nombre original: " + original;
      const note = String(bottle.note || "");
      if (note.indexOf("Nombre original:") < 0) bottle.note = note ? (note + "\n" + line) : line;
    });
    wine.producer = cleanedProducer;
    wine.name = cleanedName || wine.name;
    changed = true;
  });
  return changed;
}

function prepareLabelImage(dataUrl) {
  return new Promise(resolve => {
    if (typeof Image === "undefined") {
      resolve({ ok: false, error: "image" });
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const edge = Math.max(img.width || 0, img.height || 0);
        const scale = edge > 1600 ? 1600 / edge : 1;
        const w = Math.max(1, Math.round((img.width || 1) * scale));
        const h = Math.max(1, Math.round((img.height || 1) * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve({ ok: true, dataUrl: canvas.toDataURL("image/jpeg", 0.82) });
      } catch (err) {
        resolve({ ok: false, error: "image" });
      }
    };
    img.onerror = () => resolve({ ok: false, error: "image" });
    img.src = dataUrl;
  });
}

function loadHtmlImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = dataUrl;
  });
}

function loadZxing() {
  if (typeof window !== "undefined" && window.ZXing && window.ZXing.BrowserMultiFormatReader) return Promise.resolve(window.ZXing);
  return new Promise(resolve => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }
    const script = document.createElement("script");
    script.src = "vendor/zxing/zxing.min.js";
    script.onload = () => resolve(window.ZXing || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

async function readCodesFromImage(dataUrl) {
  const found = [];
  if (!dataUrl || typeof document === "undefined") return found;
  try {
    if (typeof BarcodeDetector === "function") {
      const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128"] });
      const img = await loadHtmlImage(dataUrl);
      const codes = await detector.detect(img);
      (codes || []).forEach(code => {
        if (code && code.rawValue) found.push({ raw: String(code.rawValue), format: String(code.format || "") });
      });
    }
  } catch (err) {}
  if (found.length) return found;
  try {
    const lib = await loadZxing();
    if (!lib || !lib.BrowserMultiFormatReader) return found;
    const reader = new lib.BrowserMultiFormatReader();
    const img = await loadHtmlImage(dataUrl);
    const result = await reader.decodeFromImageElement(img);
    const text = result && (result.text || (result.getText && result.getText()));
    if (text) found.push({ raw: String(text), format: "zxing" });
  } catch (err) {}
  return found;
}

async function fetchOffProduct(ean) {
  if (!ean || typeof fetch !== "function") return null;
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 8000);
  try {
    const res = await fetch("https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(ean) + ".json", ctrl ? { signal: ctrl.signal } : undefined);
    if (!res || !res.ok) return null;
    return parseOffProduct(await res.json());
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function visionLabel(images) {
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) return { bag: null, failure: "needKey", reason: "" };
  if (typeof geminiWithModel !== "function") return { bag: null, failure: "network", reason: "" };
  const parts = (images || []).map(imagePart).filter(Boolean);
  if (!parts.length) return { bag: null, failure: "image", reason: "" };
  const prompt = [
    "Lee todas las imágenes de esta botella en una sola respuesta. La primera es la etiqueta; si hay otra, es la contraetiqueta.",
    "Responde solo JSON. Cada campo es {\"value\":\"\",\"confidence\":0 a 1}.",
    "name: nombre comercial del vino, sin la bodega si el vino ya tiene nombre propio.",
    "producer: bodega comercial. No copies la razón social: quita S.A., S.L., S.A.U., S.L.U. y «Propietat d'…».",
    "appellation: DO, DOC o subzona. vintage: el año de la cosecha, o vacío.",
    "type: tinto, blanco, rosado, espumoso o generoso.",
    "category: la categoría que se lea, por ejemplo Reserva, Gran Reserva o Brut Nature. Si hay varias, sepáralas con un espacio, nunca con una barra.",
    "grapes: variedades separadas por comas, o vacío si no se leen. abv: el grado, solo el número. volume: por ejemplo 75 cl.",
    "ean: el código de barras, solo dígitos. web: la web de la bodega que esté impresa, sin inventarla.",
    "No inventes. No repitas ninguna frase. No unas campos con « / ».",
    "confidence 0 si no se lee y 1 si está claro."
  ].join("\n");
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 22000);
  try {
    const outcome = await geminiWithModel(key, prompt, labelSchema(), ctrl && ctrl.signal, 2048, parts);
    return acceptGeminiLabel(outcome);
  } catch (err) {
    return { bag: null, failure: "network", reason: "red o CORS" };
  } finally {
    clearTimeout(timer);
  }
}

async function readBothLabels(front, back) {
  const images = [front, back].filter(Boolean);
  const online = typeof navigator === "undefined" || navigator.onLine !== false;
  const reads = [];
  for (let i = 0; i < images.length; i++) {
    const codes = await readCodesFromImage(images[i]);
    codes.forEach(code => reads.push(code));
  }
  let ean = "";
  reads.forEach(read => {
    const digits = String(read && read.raw || "").replace(/\D/g, "");
    if (!ean && eanChecksumOk(digits)) ean = digits;
  });
  let off = null;
  if (online && ean) off = await fetchOffProduct(ean);
  let outcome = { bag: null, failure: "", reason: "" };
  if (!online) {
    const ocr = await readLabelsOffline(front, back);
    outcome = { bag: ocr, failure: "", reason: "" };
  } else {
    const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
    if (!key) outcome = { bag: null, failure: "needKey", reason: "" };
    else outcome = await visionLabel(images);
  }
  const bag = mergeScanSources(outcome.bag, off, reads);
  const catalogEan = catalogByEan(fieldValue(bag, "ean"));
  bag._failure = outcome.failure || "";
  bag._failureReason = outcome.reason || "";
  bag._offline = !online;
  bag._catalogEan = catalogEan;
  return bag;
}

async function ingestLabelImage(dataUrl) {
  const prepared = await prepareLabelImage(dataUrl);
  if (!prepared.ok) {
    if (typeof setScanStatus === "function") setScanStatus(t("alta.image"));
    if (typeof toast === "function") toast(t("alta.image"));
    return;
  }
  const img = prepared.dataUrl;
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

function renderAlta() {
  if (!altaDraft) return;
  if (!altaDraft._skipCapture) captureAltaEdits();
  altaDraft._skipCapture = false;
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
  const failure = altaDraft.failure ? '<p class="alta-fail">' + intakeEsc(altaDraft.failure) + "</p>" : "";
  const ean = fieldValue(fields, "ean");
  const barcode = ean && fields.ean && Number(fields.ean.confidence) >= 0.9
    ? '<p class="tiny">' + intakeEsc(t("alta.barcode")) + " · " + intakeEsc(ean) + "</p>"
    : "";
  const body = document.getElementById("alta-body");
  if (!body) return;
  body.innerHTML = ""
    + "<h1>" + intakeEsc(t("alta.h1")) + "</h1>"
    + '<p class="muted">' + intakeEsc(t("alta.lead")) + "</p>"
    + failure
    + offline
    + barcode
    + (photos ? '<div class="alta-photos">' + photos + "</div>" : "")
    + catalog
    + '<div class="alta-grid">'
    + input("name", true) + input("producer", true) + input("appellation", true) + input("category", true) + input("grapes", true)
    + input("vintage", false) + input("type", false) + input("abv", false) + input("volume", false)
    + input("ean", false) + input("web", false)
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
  const raw = options.fields || {};
  const fields = normalizeLabelBag(raw);
  const failure = options.failure || labelFailureText(raw._failure, raw._failureReason);
  const caves = (typeof state !== "undefined" && state && state.vinotecas) || [];
  const cellarId = options.cellarId || (caves[0] && caves[0].id) || "v1";
  let catalog = options.catalog || null;
  if (!catalog && raw._catalogEan) {
    catalog = { wine: raw._catalogEan, score: 1, sameYear: true };
  }
  altaDraft = {
    fields: fields,
    photos: options.photos || [],
    catalog: catalog,
    offline: !!(options.offline || raw._offline),
    failure: failure,
    qty: options.qty || "1",
    cellarId: cellarId,
    bin: options.bin || (typeof nextBin === "function" ? nextBin(cellarId) : ""),
    _skipCapture: true
  };
  renderAlta();
  if (typeof show === "function") show("alta");
}

var wineForIntakeV88 = wineForIntake;
wineForIntake = function (fields, catalogHit) {
  const built = wineForIntakeV88(fields, catalogHit);
  const wine = built && built.wine;
  if (!wine || built.fromCatalog) return built;
  const web = fieldValue(fields, "web");
  const ean = fieldValue(fields, "ean");
  const category = fieldValue(fields, "category");
  if (ean) wine.ean = ean;
  wine.provenance = wine.provenance || {};
  if (category) wine.provenance.category = category;
  const href = /^https?:\/\//i.test(web) ? web : (web ? ("https://" + web.replace(/^\/+/, "")) : "");
  if (href && wine.geo && !wine.geo.web && !(typeof isShopUrl === "function" && isShopUrl(href))) wine.geo.web = href;
  return built;
};

var saveAltaV88 = saveAlta;
saveAlta = function (another) {
  if (typeof cellarLocked !== "undefined" && cellarLocked) return;
  if (!altaDraft) return;
  captureAltaEdits();
  altaDraft.fields = normalizeLabelBag(altaDraft.fields);
  const name = fieldValue(altaDraft.fields, "name");
  const producer = fieldValue(altaDraft.fields, "producer");
  if (!validIntakeIdentity(name, producer)) {
    if (altaDraft.fields.name) altaDraft.fields.name.confidence = 0.2;
    if (altaDraft.fields.producer) altaDraft.fields.producer.confidence = 0.2;
    altaDraft.failure = t("alta.needIdentity");
    altaDraft._skipCapture = true;
    renderAlta();
    if (typeof toast === "function") toast(t("alta.needIdentity"));
    return;
  }
  altaDraft._skipCapture = true;
  renderAlta();
  return saveAltaV88(another);
};

(function () {
  if (typeof state === "undefined" || !state || state._corrupt) return;
  if (typeof cellarLocked !== "undefined" && cellarLocked) return;
  try {
    if (repairRepeatedTitles(state) && typeof save === "function") save();
  } catch (err) {}
})();

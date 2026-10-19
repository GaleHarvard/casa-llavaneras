/* Escáner v92: sin falso «sin conexión», etiqueta y contraetiqueta, ficha editable. */

function explicitWineType(text) {
  const n = typeof normTxt === "function" ? normTxt(text) : String(text || "").toLowerCase();
  if (!n) return "";
  if (/\bespumoso\b|\bchampagne\b|\bcava\b|\bbrut\b/.test(n)) return "espumoso";
  if (/\bblanco\b|\bblanca\b|\bwhite\b/.test(n)) return "blanco";
  if (/\brosado\b|\brosada\b|\brose\b/.test(n)) return "rosado";
  const tinto = /\btinto\b|\btinta\b|\bred\b|\bnegre\b|\bnegra\b|\bnoir\b/.test(n);
  const fortified = /\bgeneroso\b|\bjerez\b|\bporto\b|\bport\b|\bmanzanilla\b|\bamontillado\b|\boloroso\b/.test(n);
  const fino = /\bfino\b/.test(n);
  if (tinto && !fortified) return "tinto";
  if (fortified || fino) return "generoso";
  if (tinto) return "tinto";
  return "";
}

function vintageFromText(raw) {
  const text = String(raw || "");
  const matches = text.match(/\b(?:19|20)\d{2}\b/g) || [];
  const years = matches.filter(year => {
    const lot = new RegExp("(?:^|[^A-Za-z0-9])L\\s*" + year + "\\b", "i");
    if (!lot.test(text)) return true;
    const bare = text.replace(new RegExp("L\\s*" + year, "ig"), " ");
    return new RegExp("\\b" + year + "\\b").test(bare);
  });
  return years[0] || "";
}

function photoIsClearlyBackLabel(text) {
  const raw = String(text || "").trim();
  if (!raw) return false;
  if (typeof backLabelText === "function" && backLabelText(raw)) return true;
  const n = typeof normTxt === "function" ? normTxt(raw) : raw.toLowerCase();
  return /sulfitos|sulfites|embotellad|contiene sulfit|codigo de barras|ingredients|ingredientes/.test(n);
}

function codesProveBackLabel(codes) {
  return (codes || []).some(code => {
    const digits = String(code && code.raw || "").replace(/\D/g, "");
    return typeof eanChecksumOk === "function" && eanChecksumOk(digits);
  });
}

function backLabelShouldMove(wine, text, codes) {
  if (!wine || wine.backLabel) return false;
  return photoIsClearlyBackLabel(text) || codesProveBackLabel(codes);
}

function shouldUseOfflineRead(onLine, failure) {
  return onLine === false && failure === "fetch";
}

function refineLabelFailure(outcome) {
  const src = outcome || {};
  const reason = String(src.reason || "");
  if (src.failure === "timeout" || /tiempo agotado/i.test(reason)) {
    return { bag: null, failure: "timeout", reason: reason || "tiempo agotado" };
  }
  if (src.failure === "network") return { bag: null, failure: "fetch", reason: reason || "red o CORS" };
  return src;
}

function intakeSavePlan(name, producer) {
  const n = String(name || "").trim();
  const p = String(producer || "").trim();
  const nameOk = n.length >= 2 && n.length <= 80 && (n.match(/\//g) || []).length < 2;
  if (!nameOk) return { ok: false, pending: false };
  if (!p) return { ok: true, pending: true };
  const producerOk = p.length >= 2 && p.length <= 80 && (p.match(/\//g) || []).length < 2;
  return { ok: producerOk, pending: false };
}

function catalogWineryFromText(text) {
  if (typeof WINERY_CARDS === "undefined" || typeof foldWinery !== "function") return null;
  const blob = foldWinery(text || "");
  if (!blob) return null;
  let best = null;
  let bestLen = 0;
  WINERY_CARDS.forEach(card => {
    [card.name].concat(card.aliases || []).forEach(label => {
      const needle = foldWinery(label);
      if (!needle || needle.length < 6 || needle.length <= bestLen) return;
      if (blob.indexOf(needle) < 0) return;
      best = card;
      bestLen = needle.length;
    });
  });
  return best;
}

function softenScanBag(bag, ocrText) {
  if (!bag || !bag.type) return bag;
  const conf = Number(bag.type.confidence) || 0;
  const explicit = explicitWineType(ocrText || "");
  const value = String(bag.type.value || "");
  if (explicit && conf < 0.75) bag.type = { value: explicit, confidence: 0.8 };
  else if (conf < 0.75 || !/^(tinto|blanco|rosado|espumoso|generoso)$/.test(value)) bag.type = { value: "", confidence: 0 };
  if (bag.vintage && (Number(bag.vintage.confidence) || 0) < 0.75) {
    const year = vintageFromText(ocrText || "");
    const onBack = ocrText && typeof backLabelText === "function" && backLabelText(ocrText);
    bag.vintage = !onBack && year ? { value: year, confidence: 0.8 } : { value: "", confidence: 0 };
  }
  return bag;
}

var wineTypeFromTextPrev = wineTypeFromText;
wineTypeFromText = function (text) {
  return explicitWineType(text) || "";
};

var fieldsFromOcrPrev = fieldsFromOcr;
fieldsFromOcr = function (text) {
  const bag = fieldsFromOcrPrev(text);
  const raw = String(text || "");
  if (typeof window !== "undefined") window.__lastScanText = raw;
  const year = vintageFromText(raw);
  const onBack = typeof backLabelText === "function" && backLabelText(raw);
  bag.vintage = !onBack && year ? { value: year, confidence: 0.8 } : { value: "", confidence: 0 };
  const type = explicitWineType(raw);
  bag.type = { value: type, confidence: type ? 0.8 : 0 };
  return bag;
};

var labelFailureTextPrev = labelFailureText;
labelFailureText = function (kind, reason) {
  if (kind === "timeout") return t("alta.timeout");
  if (kind === "fetch") return t("alta.network");
  if (kind === "quota") {
    const why = String(reason || "");
    if (!why || /búsqueda|cerca|search|recherche|pesquisa/i.test(why)) return t("alta.quota");
    return labelFailureTextPrev(kind, reason);
  }
  return labelFailureTextPrev(kind, reason);
};

var visionLabelPrev = visionLabel;
visionLabel = async function (images) {
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) return { bag: null, failure: "needKey", reason: "" };
  if (typeof geminiWithModel !== "function") return { bag: null, failure: "fetch", reason: "red o CORS" };
  const parts = (images || []).map(imagePart).filter(Boolean);
  if (!parts.length) return { bag: null, failure: "image", reason: "" };
  const prompt = [
    "Lee todas las imágenes de esta botella en una sola respuesta. La primera es la etiqueta; si hay otra, es la contraetiqueta.",
    "Responde solo JSON. Cada campo es {\"value\":\"\",\"confidence\":0 a 1}.",
    "name: nombre comercial del vino, sin la bodega si el vino ya tiene nombre propio.",
    "producer: bodega comercial. No copies la razón social: quita S.A., S.L., S.A.U., S.L.U. y «Propietat d'…».",
    "appellation: DO, DOC o subzona. vintage: el año de la cosecha, o vacío. No uses el lote L2023 como añada.",
    "type: tinto, blanco, rosado, espumoso o generoso, o vacío si no está escrito. No deduzcas generoso.",
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
    return refineLabelFailure(acceptGeminiLabel(outcome));
  } catch (err) {
    const aborted = err && (err.name === "AbortError" || /abort/i.test(String(err && err.message || "")));
    if (aborted) return { bag: null, failure: "timeout", reason: "tiempo agotado" };
    return { bag: null, failure: "fetch", reason: String(err && err.message || err || "red o CORS") };
  } finally {
    clearTimeout(timer);
  }
};

var readBothLabelsPrev = readBothLabels;
readBothLabels = async function (front, back) {
  const images = [front, back].filter(Boolean);
  const reads = [];
  for (let i = 0; i < images.length; i++) {
    const codes = typeof readCodesFromImage === "function" ? await readCodesFromImage(images[i]) : [];
    (codes || []).forEach(code => reads.push(code));
  }
  let ean = "";
  reads.forEach(read => {
    const digits = String(read && read.raw || "").replace(/\D/g, "");
    if (!ean && typeof eanChecksumOk === "function" && eanChecksumOk(digits)) ean = digits;
  });
  const onLine = typeof navigator === "undefined" ? true : navigator.onLine !== false;
  let off = null;
  if (onLine && ean && typeof fetchOffProduct === "function") off = await fetchOffProduct(ean);
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  let outcome = { bag: null, failure: "", reason: "" };
  if (!key) outcome = { bag: null, failure: "needKey", reason: "" };
  else outcome = refineLabelFailure(await visionLabel(images));
  let usedOffline = false;
  if (typeof window !== "undefined") window.__lastScanText = "";
  if (shouldUseOfflineRead(typeof navigator === "undefined" ? true : navigator.onLine, outcome.failure)) {
    const ocr = await readLabelsOffline(front, back);
    outcome = { bag: ocr, failure: "", reason: "" };
    usedOffline = true;
  }
  const bag = mergeScanSources(outcome.bag, off, reads);
  const ocrText = typeof window !== "undefined" ? (window.__lastScanText || "") : "";
  softenScanBag(bag, ocrText);
  const catalogEan = typeof catalogByEan === "function" ? catalogByEan(fieldValue(bag, "ean")) : null;
  bag._failure = usedOffline ? "" : (outcome.failure || "");
  bag._failureReason = usedOffline ? "" : (outcome.reason || "");
  bag._offline = usedOffline;
  bag._catalogEan = catalogEan;
  bag._ocrText = ocrText;
  return bag;
};

function scanApp() {
  return document.querySelector(".app");
}

function showLabelSlots() {
  const app = scanApp();
  if (app) app.classList.add("scan-slots");
  const box = document.getElementById("scan-results");
  if (!box) return;
  const front = labelPair.front || "";
  const back = labelPair.back || "";
  const pending = labelPair.pending || "";
  const fig = (src, caption) => src
    ? '<img src="' + escHtml(src) + '" alt="' + escHtml(caption) + '">'
    : '<p class="muted">' + escHtml(t("sheet.noBack")).replace("Sin contraetiqueta.", "—") + "</p>";
  const onlyBack = !front && !!back;
  box.innerHTML = '<div class="card label-slots" id="label-slots">'
    + "<p>" + escHtml(t("alta.slotsLead")) + "</p>"
    + '<div class="label-slot"><p class="tiny">' + escHtml(t("alta.slotFront")) + "</p>" + (front ? '<img src="' + escHtml(front) + '" alt="">' : '<p class="muted">—</p>')
    + '<button type="button" class="btn btn-gold" onclick="shootLabelSlot(\'front\')">' + escHtml(t("alta.shootFront")) + "</button></div>"
    + '<div class="label-slot"><p class="tiny">' + escHtml(t("alta.slotBack")) + "</p>" + (back ? '<img src="' + escHtml(back) + '" alt="">' : '<p class="muted">—</p>')
    + '<button type="button" class="btn btn-ghost" onclick="shootLabelSlot(\'back\')">' + escHtml(t("alta.shootBack")) + "</button></div>"
    + (pending ? '<p>' + escHtml(t("alta.which")) + "</p>" + fig(pending, "")
      + '<button type="button" class="btn btn-gold" onclick="assignPendingPhoto(\'front\')">' + escHtml(t("alta.slotFront")) + "</button>"
      + '<button type="button" class="btn btn-ghost" onclick="assignPendingPhoto(\'back\')">' + escHtml(t("alta.slotBack")) + "</button>" : "")
    + (onlyBack ? '<p id="only-back-note">' + escHtml(t("alta.onlyBack")) + "</p>" : "")
    + ((front || back) ? '<button type="button" class="btn btn-gold" onclick="readAndConfirmLabels()">' + escHtml(onlyBack ? t("alta.readAnyway") : t("alta.readBoth")) + "</button>" : "")
    + "</div>";
}

function shootLabelSlot(slot) {
  labelPair.slot = slot === "back" ? "back" : "front";
  labelPair.waitingBack = labelPair.slot === "back";
  const app = scanApp();
  if (app) app.classList.remove("scan-slots");
  if (typeof shootBackLabel === "function") shootBackLabel();
  else if (typeof pickLabelPhoto === "function") pickLabelPhoto();
}

function assignPendingPhoto(slot) {
  const img = labelPair.pending || "";
  labelPair.pending = "";
  if (!img) return showLabelSlots();
  if (slot === "back") labelPair.back = img;
  else labelPair.front = img;
  labelPair.slot = "";
  if (typeof showLabelPreview === "function" && labelPair.front) showLabelPreview(labelPair.front);
  showLabelSlots();
}

var ingestLabelImagePrev = ingestLabelImage;
ingestLabelImage = async function (dataUrl) {
  const prepared = typeof prepareLabelImage === "function" ? await prepareLabelImage(dataUrl) : { ok: true, dataUrl: dataUrl };
  if (!prepared.ok) {
    if (typeof setScanStatus === "function") setScanStatus(t("alta.image"));
    if (typeof toast === "function") toast(t("alta.image"));
    return;
  }
  const img = prepared.dataUrl;
  const slot = labelPair.slot === "back" || labelPair.slot === "front" ? labelPair.slot : "";
  if (!slot) {
    labelPair.pending = img;
    if (typeof showLabelPreview === "function") showLabelPreview(img);
    showLabelSlots();
    return;
  }
  labelPair[slot] = img;
  labelPair.slot = "";
  labelPair.waitingBack = false;
  if (typeof lastLabelData !== "undefined" && slot === "front") lastLabelData = img;
  if (typeof showLabelPreview === "function" && (slot === "front" || !labelPair.front)) showLabelPreview(img);
  if (labelPair.front && labelPair.back) {
    await readAndConfirmLabels();
    return;
  }
  showLabelSlots();
};

var readAndConfirmLabelsPrev = readAndConfirmLabels;
readAndConfirmLabels = async function () {
  if (!labelPair.front && !labelPair.back) return showLabelSlots();
  if (typeof setScanStatus === "function") setScanStatus(t("alta.reading"));
  const box = document.getElementById("scan-results");
  if (box) box.innerHTML = '<div class="card muted">' + escHtml(t("alta.reading")) + "</div>";
  const fields = await readBothLabels(labelPair.front, labelPair.back);
  const app = scanApp();
  if (app) app.classList.remove("scan-slots");
  openAlta({
    fields: fields,
    photos: [labelPair.front, labelPair.back].filter(Boolean),
    front: labelPair.front || "",
    back: labelPair.back || "",
    catalog: typeof fuzzyCatalogHit === "function" ? fuzzyCatalogHit(fields) : null,
    offline: !!(fields && fields._offline),
    onlyBack: !labelPair.front && !!labelPair.back,
    ocrText: (fields && fields._ocrText) || ""
  });
};

function decorateAlta() {
  const body = document.getElementById("alta-body");
  if (!body || !altaDraft) return;
  if ((altaDraft.failure || altaDraft.offline) && !document.getElementById("alta-retry")) {
    const html = '<button type="button" class="btn btn-ghost" id="alta-retry" style="width:100%;margin:8px 0" onclick="retryAltaRead()">' + escHtml(t("alta.retry")) + "</button>";
    const fail = body.querySelector(".alta-fail") || body.querySelector("p.muted");
    if (fail) fail.insertAdjacentHTML("afterend", html);
  }
  const fields = altaDraft.fields || {};
  const producer = typeof fieldValue === "function" ? fieldValue(fields, "producer") : "";
  if (!producer && !document.getElementById("alta-pending")) {
    const blob = [
      producer,
      typeof fieldValue === "function" ? fieldValue(fields, "name") : "",
      typeof fieldValue === "function" ? fieldValue(fields, "appellation") : "",
      altaDraft.ocrText || ""
    ].join(" ");
    const hint = catalogWineryFromText(blob);
    altaDraft.suggestion = hint;
    let block = '<p class="muted" id="alta-pending">' + escHtml(t("alta.pendingWinery")) + "</p>";
    if (hint) {
      const aliases = (hint.aliases || []).slice(0, 4).join(" · ");
      block += '<div class="card" id="alta-suggest"><p>' + escHtml(t("alta.suggestWinery", { name: hint.name })) + "</p>"
        + (aliases ? '<p class="tiny">' + escHtml(aliases) + "</p>" : "")
        + '<button type="button" class="btn btn-gold" style="width:100%;margin-top:8px" onclick="useSuggestedWinery()">' + escHtml(t("alta.useWinery")) + "</button></div>";
    }
    const grid = body.querySelector(".alta-grid");
    if (grid) grid.insertAdjacentHTML("beforebegin", block);
  }
  if ((altaDraft.onlyBack || (!altaDraft.front && altaDraft.back)) && !document.getElementById("alta-only-back")) {
    const warn = '<div class="card" id="alta-only-back"><p>' + escHtml(t("alta.onlyBack")) + '</p><button type="button" class="btn btn-gold" style="width:100%;margin-top:8px" onclick="shootFrontFromAlta()">' + escHtml(t("alta.shootFront")) + "</button></div>";
    const lead = body.querySelector("p.muted");
    if (lead) lead.insertAdjacentHTML("afterend", warn);
  }
}

var renderAltaPrev = renderAlta;
renderAlta = function () {
  renderAltaPrev();
  decorateAlta();
};

var openAltaPrev = openAlta;
openAlta = function (opts) {
  const options = opts || {};
  openAltaPrev(options);
  if (!altaDraft) return;
  if (options.front) altaDraft.front = options.front;
  if (options.back) altaDraft.back = options.back;
  altaDraft.ocrText = options.ocrText || altaDraft.ocrText || "";
  altaDraft.onlyBack = !!options.onlyBack;
  renderAlta();
};

async function retryAltaRead() {
  if (!altaDraft) return;
  if (typeof captureAltaEdits === "function") captureAltaEdits();
  const front = altaDraft.front || (typeof labelPair !== "undefined" ? labelPair.front : "") || "";
  const back = altaDraft.back || (typeof labelPair !== "undefined" ? labelPair.back : "") || "";
  const fields = await readBothLabels(front, back);
  openAlta({
    fields: fields,
    photos: [front, back].filter(Boolean),
    front: front,
    back: back,
    catalog: typeof fuzzyCatalogHit === "function" ? fuzzyCatalogHit(fields) : null,
    offline: !!(fields && fields._offline),
    onlyBack: !front && !!back,
    ocrText: (fields && fields._ocrText) || altaDraft.ocrText || ""
  });
}

function useSuggestedWinery() {
  if (!altaDraft || !altaDraft.suggestion) return;
  if (typeof captureAltaEdits === "function") captureAltaEdits();
  altaDraft.fields = altaDraft.fields || {};
  altaDraft.fields.producer = { value: altaDraft.suggestion.name, confidence: 0.92 };
  altaDraft.producerPending = false;
  altaDraft._skipCapture = true;
  renderAlta();
}

function shootFrontFromAlta() {
  if (altaDraft && typeof captureAltaEdits === "function") captureAltaEdits();
  labelPair.back = (altaDraft && altaDraft.back) || labelPair.back || "";
  labelPair.front = "";
  labelPair.slot = "front";
  if (typeof show === "function") show("scan");
  showLabelSlots();
  shootLabelSlot("front");
}

var startScanPrev = startScan;
startScan = async function () {
  await startScanPrev();
  showLabelSlots();
};

var wineForIntakePrev = wineForIntake;
wineForIntake = function (fields, catalogHit) {
  const pending = !!(typeof altaDraft !== "undefined" && altaDraft && altaDraft.producerPending) && !(typeof fieldValue === "function" && fieldValue(fields, "producer"));
  const built = wineForIntakePrev(fields, catalogHit);
  const wine = built && built.wine;
  if (pending && wine && !built.fromCatalog) {
    wine.producer = "";
    wine.provenance = wine.provenance || {};
    wine.provenance.producerPending = true;
  }
  if (wine && !built.fromCatalog && typeof fieldValue === "function" && !fieldValue(fields, "type")) wine.type = "";
  return built;
};

var saveAltaPrev = saveAlta;
saveAlta = function (another) {
  if (typeof cellarLocked !== "undefined" && cellarLocked) return;
  if (!altaDraft) return;
  if (typeof captureAltaEdits === "function") captureAltaEdits();
  if (typeof normalizeLabelBag === "function") altaDraft.fields = normalizeLabelBag(altaDraft.fields);
  const name = fieldValue(altaDraft.fields, "name");
  const producer = fieldValue(altaDraft.fields, "producer");
  const plan = intakeSavePlan(name, producer);
  if (!plan.ok) {
    altaDraft.failure = t("alta.needIdentity");
    altaDraft._skipCapture = true;
    renderAlta();
    if (typeof toast === "function") toast(t("alta.needIdentity"));
    return;
  }
  altaDraft.producerPending = plan.pending;
  if (altaDraft.front || altaDraft.back || altaDraft.onlyBack) {
    altaDraft._backPhoto = altaDraft.back || "";
    altaDraft.photos = altaDraft.front ? [altaDraft.front] : [];
  }
  altaDraft._skipCapture = true;
  const backPhoto = altaDraft._backPhoto || "";
  let wineId = "";
  try {
    const built = wineForIntake(altaDraft.fields, altaDraft.catalog);
    wineId = built && built.wine ? built.wine.id : "";
  } catch (err) {}
  const result = typeof saveAltaV88 === "function" ? saveAltaV88(another) : saveAltaPrev(another);
  if (backPhoto && wineId) rememberBackPhoto(wineId, backPhoto);
  return result;
};

function backLabelKey(id) {
  return "back:" + id;
}

function resolvedPhoto(ref) {
  if (!ref) return "";
  if (typeof isDataImage === "function" && isDataImage(ref)) return ref;
  if (typeof resolveLabelRef === "function") return resolveLabelRef(ref) || "";
  return "";
}

async function rememberBackPhoto(wineId, dataUrl) {
  const wine = typeof wineById === "function" ? wineById(wineId) : null;
  if (!wine || !dataUrl) return false;
  let stored = "";
  if (typeof saveWineLabelPhoto === "function") {
    const ok = await saveWineLabelPhoto(backLabelKey(wineId), dataUrl);
    if (ok && typeof labelMarker === "function") stored = labelMarker(backLabelKey(wineId));
  }
  if (!stored && String(dataUrl).length < 400000) stored = dataUrl;
  if (!stored) return false;
  wine.backLabel = stored;
  if (typeof save === "function") save();
  if (typeof currentWine !== "undefined" && currentWine && currentWine.id === wineId && typeof screenId !== "undefined" && screenId === "wine") {
    openWine(wineId, typeof currentBottle !== "undefined" ? currentBottle : null);
  }
  return true;
}

function detachMatchingHero(wine, bytes) {
  if (!wine || !bytes) return;
  const same = ref => ref === bytes || resolvedPhoto(ref) === bytes;
  if (same(wine.labelThumb)) wine.labelThumb = "";
  (state.bottles || []).forEach(bottle => {
    if (bottle && bottle.wineId === wine.id && same(bottle.labelPhoto)) bottle.labelPhoto = "";
  });
  if (typeof labelPhotoCache !== "undefined" && labelPhotoCache[wine.id] === bytes) delete labelPhotoCache[wine.id];
}

var ownLabelPrev = ownLabel;
ownLabel = function (w, bottle) {
  const src = ownLabelPrev(w, bottle);
  if (!w || !src || !w.backLabel || w.labelThumb) return src;
  const back = resolvedPhoto(w.backLabel);
  if (back && src === back) return "";
  return src;
};

async function migrateStoredBackLabels() {
  if (typeof state === "undefined" || !state || !Array.isArray(state.customWines)) return false;
  let changed = false;
  for (let i = 0; i < state.customWines.length; i++) {
    const wine = state.customWines[i];
    if (!wine || wine.backLabel || (typeof isCatalogWineId === "function" && isCatalogWineId(wine.id))) continue;
    const blob = [
      wine.provenance && wine.provenance.rawTitle,
      wine.provenance && wine.provenance.originalTitle,
      wine.tasting
    ].filter(Boolean).join("\n");
    const hero = ownLabelPrev(wine, null);
    let codes = [];
    if (hero && !photoIsClearlyBackLabel(blob) && typeof readCodesFromImage === "function") {
      try { codes = await readCodesFromImage(hero); } catch (err) { codes = []; }
    }
    if (!backLabelShouldMove(wine, blob, codes) || !hero) continue;
    const ok = await rememberBackPhoto(wine.id, hero);
    if (!ok) continue;
    detachMatchingHero(wine, hero);
    changed = true;
  }
  if (changed && typeof save === "function") save();
  return changed;
}

var prepareOwnLabelsPrev = prepareOwnLabels;
prepareOwnLabels = function () {
  return prepareOwnLabelsPrev().then(() => migrateStoredBackLabels().catch(() => false));
};

function backLabelSection(w) {
  const src = resolvedPhoto(w && w.backLabel);
  const img = src ? '<img src="' + escHtml(src) + '" alt="' + escHtml(t("alta.back")) + '">' : '<p class="muted">' + escHtml(t("sheet.noBack")) + "</p>";
  const label = src ? t("sheet.changeBack") : t("sheet.addBack");
  return '<div id="back-label"><div class="sec-head"><h2>' + escHtml(t("alta.back")) + '</h2></div>' + img
    + '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="changeBackLabel()">' + escHtml(label) + "</button></div>";
}

var openWinePrev = openWine;
openWine = function (wineId, bottle) {
  openWinePrev(wineId, bottle);
  const w = typeof wineById === "function" ? wineById(wineId) : null;
  const body = document.getElementById("wine-body");
  if (!w || !body || (typeof isCatalogWineId === "function" && isCatalogWineId(w.id))) return;
  body.querySelectorAll("#vintage-block .chip").forEach(btn => {
    if ((btn.textContent || "").trim() === "—") btn.remove();
  });
  const block = document.getElementById("vintage-block");
  if (block && !document.getElementById("ficha-edit")) {
    block.insertAdjacentHTML("beforeend", '<button type="button" class="btn btn-gold" id="ficha-edit" style="width:100%;margin-top:8px" onclick="openFichaEdit(\'' + w.id + '\')">' + escHtml(t("sheet.edit")) + "</button>");
  }
  body.querySelectorAll("[onclick*='completeExistingWine']").forEach(btn => {
    btn.setAttribute("onclick", "openFichaEdit('" + w.id + "')");
  });
  if (!document.getElementById("back-label")) {
    const change = body.querySelector(".label-change");
    const html = backLabelSection(w);
    if (change) change.insertAdjacentHTML("afterend", html);
    else body.insertAdjacentHTML("beforeend", html);
  }
};

function openFichaEdit(id) {
  const w = wineById(id);
  if (!w || (typeof isCatalogWineId === "function" && isCatalogWineId(w.id))) return;
  const body = document.getElementById("wine-body");
  if (!body) return;
  const types = ["", "tinto", "blanco", "rosado", "espumoso", "generoso"];
  const options = types.map(kind => {
    const label = kind ? (typeof typeLabel === "function" ? typeLabel(kind) : kind) : "—";
    return '<option value="' + kind + '"' + (w.type === kind ? " selected" : "") + ">" + escHtml(label) + "</option>";
  }).join("");
  const field = (key, label, value) => '<label class="field"><span>' + escHtml(label) + '</span><input id="edit-' + key + '" value="' + escHtml(value || "") + '"></label>';
  body.innerHTML = '<div id="wine-edit">'
    + '<button type="button" class="btn btn-ghost" style="width:100%;margin-bottom:8px" onclick="openWine(\'' + w.id + '\')">‹ ' + escHtml(t("nav.back")) + "</button>"
    + "<h1>" + escHtml(t("sheet.edit")) + "</h1>"
    + field("vintage", t("alta.vintage"), w.vintage || "")
    + field("name", t("alta.name"), w.name)
    + field("producer", t("alta.producer"), w.producer)
    + field("appellation", t("alta.appellation"), w.appellation)
    + field("grapes", t("alta.grapes"), (w.grapes || []).join(", "))
    + field("abv", t("alta.abv"), w.abv || "")
    + '<label class="field"><span>' + escHtml(t("alta.type")) + '</span><select id="edit-type">' + options + "</select></label>"
    + field("volume", t("alta.volume"), w.volume)
    + '<button type="button" class="btn btn-gold" id="edit-save" style="width:100%;margin-top:14px" onclick="saveFichaEdit(\'' + w.id + '\')">' + escHtml(t("alta.save")) + "</button>"
    + '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="completeExistingWine(\'' + w.id + '\')">' + escHtml(t("sheet.gemini")) + "</button>"
    + "</div>";
  const year = document.getElementById("edit-vintage");
  if (year) year.focus();
}

function saveFichaEdit(id) {
  const wine = wineById(id);
  if (!wine || (typeof isCatalogWineId === "function" && isCatalogWineId(wine.id))) return;
  const val = key => {
    const el = document.getElementById("edit-" + key);
    return el ? String(el.value || "").trim() : "";
  };
  const vintage = parseInt(val("vintage"), 10);
  wine.name = val("name") || wine.name;
  wine.producer = val("producer");
  wine.vintage = vintage >= 1900 && vintage <= 2100 ? vintage : 0;
  wine.appellation = val("appellation");
  wine.type = val("type");
  const abv = parseFloat(val("abv").replace(",", "."));
  wine.abv = Number.isFinite(abv) ? abv : 0;
  wine.volume = val("volume");
  wine.grapes = val("grapes").split(/[,;]/).map(part => part.trim()).filter(Boolean);
  wine.provenance = wine.provenance || {};
  if (!wine.producer) wine.provenance.producerPending = true;
  else if (wine.provenance.producerPending) delete wine.provenance.producerPending;
  if (wine.vintage) wine.provenance.incomplete = false;
  if (typeof save === "function") save();
  if (typeof toast === "function") toast(t("sheet.saved"));
  openWine(wine.id, typeof currentBottle !== "undefined" ? currentBottle : null);
}

function changeBackLabel() {
  const wine = typeof currentWine !== "undefined" ? currentWine : null;
  if (!wine) return;
  const input = document.getElementById("wine-label-file");
  if (!input) return;
  input.value = "";
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => rememberBackPhoto(wine.id, reader.result);
    reader.readAsDataURL(file);
  };
  input.click();
}

var askBackLabelPrev = askBackLabel;
askBackLabel = function () {
  labelPair.slot = "back";
  showLabelSlots();
};

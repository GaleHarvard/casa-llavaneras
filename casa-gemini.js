/* Escaneo, ficha de internet y Gemini. */
const PRICE_CFG_KEY = "vinoteca-jgc-provider";
function escapeReg(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const NO_GEMINI_NOTE = "Sin clave de Gemini en esta app. Si la guardaste en Safari, pégala también aquí: Inicio › Avisos › Precios de mercado.";
const ZONE_SKIP = new Set(["touriga", "riesling", "pinot", "garnacha", "tempranillo", "mencia", "monastrell", "bobal", "godello", "verdejo", "albarino", "alvarinho", "malvasia", "vintage", "tawny", "moscatel", "baga", "arinto", "ramisco", "semillon", "cabernet", "chardonnay", "syrah", "gewurztraminer", "prieto", "picudo", "torrontes", "malmsey", "sercial"]);
function countryFromBlob(text) {
  const n = foldZone(text);
  if (/\bportugal\b/.test(n)) return "Portugal";
  if (/\bespana\b|\bspain\b/.test(n)) return "España";
  if (/\bfrancia\b|\bfrance\b/.test(n)) return "Francia";
  if (/\bitalia\b|\bitaly\b/.test(n)) return "Italia";
  if (/\balemania\b|\bgermany\b/.test(n)) return "Alemania";
  if (/\bargentina\b/.test(n)) return "Argentina";
  if (/\bchile\b/.test(n)) return "Chile";
  if (/\baustralia\b/.test(n)) return "Australia";
  return "";
}
function isOpinionPage(url, title) {
  if (isProductPageUrl(url)) return false;
  const blob = normTxt((url || "") + " " + (title || ""));
  return /\b(opiniones|opinion|consejos|consejo|foro|forum|blog|review|reviews|resena|resenas|wikipedia|reddit)\b/.test(blob);
}
function titleLooksDirty(s) {
  const t = String(s || "");
  if (/[…]|\.{2,}/.test(t)) return true;
  if (/\s-\s-\s/.test(t)) return true;
  if (/\b(opiniones|consejos|vinissimus|dec[aá]ntalo|comprar|precio)\b/i.test(t)) return true;
  if (/^\s*vino\s+/i.test(t) && /\s-\s/.test(t)) return true;
  if (t.length > 72) return true;
  return false;
}
function isTitleJunk(part) {
  const n = normTxt(part);
  if (!n) return true;
  return /opiniones|consejos|vinissimus|decantalo|wine searcher|wikipedia|comprar|precio|valoraciones|reviews|resena/.test(n);
}
function peelTypePrefix(s) {
  const raw = String(s || "").trim();
  const peeled = raw.replace(/^(tinto|blanco|rosado|espumoso|generoso|red|white)\s+/i, "").trim();
  return peeled.length >= 3 ? peeled : raw;
}
function polishTitle(raw) {
  let s = String(raw || "").replace(/[…]/g, " ").replace(/\.{2,}/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/\s*[|]\s*.*$/, "");
  s = s.replace(/\s+[·]\s*(comprar|precio|opiniones|consejos)\b[\s\S]*$/i, "");
  s = s.replace(/\s+-\s*(opiniones|consejos|valoraciones|reviews?|comprar|precio)\b[\s\S]*$/i, "");
  s = s.replace(/\b(opiniones|consejos)\b[\s\S]*$/i, "");
  s = s.replace(/\b(vinissimus|dec[aá]ntalo|vivino|wine-searcher|wikipedia)\b[\s\S]*$/i, "");
  s = s.replace(/^\s*(comprar|vino|wine)\s+/i, "");
  s = s.replace(/(?:\s*-\s*){2,}/g, " - ");
  s = s.replace(/\s+-\s*$/g, "").replace(/^\s*-\s+/g, "");
  return s.replace(/\s+/g, " ").trim();
}
function producerFromHead(head, zone) {
  let s = String(head || "").replace(/^\s*(vino|wine|comprar)\s+/i, "").trim();
  if (zone) {
    const name = escapeReg(zone.name);
    s = s.replace(new RegExp("^" + name + "\\s+", "i"), "").trim();
    s = s.replace(new RegExp("\\s+" + name + "$", "i"), "").trim();
  }
  s = peelTypePrefix(s);
  if (!s || isTitleJunk(s)) return "";
  if (zone && foldZone(s) === foldZone(zone.name)) return "";
  return s;
}
function splitCapsProducer(segment, zone) {
  const words = String(segment || "").split(/\s+/).filter(Boolean);
  const prod = [];
  const nameWords = [];
  words.forEach(word => {
    const caps = /^[A-ZÁÉÍÓÚÜÑ0-9]{2,}$/.test(word);
    const isZone = zone && foldZone(word) === foldZone(zone.name);
    if (caps && !isZone) prod.push(word);
    else nameWords.push(word);
  });
  return { producer: prod.join(" "), name: nameWords.join(" ").trim() };
}
function identityFromTitle(raw) {
  const vintage = yearFromText(raw) || 0;
  const zone = detectZone(raw);
  const type = wineTypeFromText(raw);
  const country = (zone && zone.country) || countryFromBlob(raw);
  let s = polishTitle(raw);
  if (vintage) s = s.replace(new RegExp("\\b" + vintage + "\\b"), " ").replace(/\s+/g, " ").trim();
  const parts = s.split(/\s*(?:·|\||–|—)\s*|\s+-\s+/).map(p => p.trim()).filter(p => p && !isTitleJunk(p));
  let producer = "";
  let name = "";
  if (parts.length >= 2) {
    producer = producerFromHead(parts[0], zone);
    name = peelTypePrefix(parts.slice(1).join(" ").trim());
  } else if (parts.length === 1) {
    const split = splitCapsProducer(parts[0], zone);
    producer = split.producer;
    name = peelTypePrefix(split.name || parts[0]);
  }
  if (!name) name = peelTypePrefix(parts[0] || s);
  if (producer && normTxt(producer) === normTxt(name)) producer = "";
  if (zone && producer && foldZone(producer) === foldZone(zone.name)) producer = "";
  return {
    name: String(name || "").replace(/\s+/g, " ").trim(),
    producer: String(producer || "").replace(/\s+/g, " ").trim(),
    vintage: vintage,
    region: zone ? zone.name : "",
    appellation: zone ? zone.name : "",
    country: country || "",
    type: type || ""
  };
}
function applyCleanIdentity(wine, raw) {
  if (!wine) return null;
  const source = raw || [wine.name, wine.producer, wine.vintage].filter(Boolean).join(" ");
  const idn = identityFromTitle(source);
  wine.provenance = wine.provenance || {};
  if (!wine.provenance.rawTitle && titleLooksDirty(wine.name)) wine.provenance.rawTitle = wine.name;
  const dirty = titleLooksDirty(wine.name) || titleLooksDirty(wine.producer);
  const pageLocks = (field, value) => wine.provenance[field] === "página" && String(value || "").trim() && !titleLooksDirty(value);
  if (idn.name && !pageLocks("name", wine.name) && (dirty || titleLooksDirty(wine.name) || !String(wine.name || "").trim())) {
    wine.name = idn.name;
    markWineSource(wine, "name", "título");
  }
  if (idn.producer && !pageLocks("producer", wine.producer) && (dirty || !String(wine.producer || "").trim() || titleLooksDirty(wine.producer))) {
    wine.producer = idn.producer;
    markWineSource(wine, "producer", "título");
  }
  if (idn.region && !pageLocks("region", wine.region)) {
    wine.region = idn.region;
    wine.appellation = idn.appellation || idn.region;
    markWineSource(wine, "region", "título");
  }
  if (idn.country && !pageLocks("country", wine.country)) {
    wine.country = idn.country;
    markWineSource(wine, "country", "título");
  }
  if (idn.type && !pageLocks("type", wine.type)) {
    wine.type = idn.type;
    wine.color = colorForWineType(idn.type);
    markWineSource(wine, "type", "título");
  }
  if (idn.vintage) {
    const current = Number(wine.vintage) || 0;
    if (!current || current === YEAR || dirty) wine.vintage = idn.vintage;
  }
  return idn;
}
function legacyGeminiNote(note) {
  const n = String(note || "").trim();
  if (!n || n === NO_GEMINI_NOTE) return false;
  return /ajustes de precio/i.test(n) || /sin clave de gemini/i.test(n);
}
function internetAddedWine(w) {
  if (!w || isCatalogWineId(w.id)) return false;
  if (w.style === "internet" || w.style === "escaneo") return true;
  const p = w.provenance;
  return !!(p && (p.pageUrl || p.rawTitle));
}
function refreshDirtyInternetWine(wine) {
  if (!internetAddedWine(wine)) return false;
  wine.provenance = wine.provenance || {};
  const dirty = titleLooksDirty(wine.name) || titleLooksDirty(wine.producer);
  const stale = legacyGeminiNote(wine.provenance.geminiNote) || !!wine.enrichError || !!(wine.provenance && wine.provenance.enrichError);
  if (!dirty && !stale) return false;
  if (dirty) {
    const raw = [wine.provenance.rawTitle, wine.name, wine.producer, wine.vintage, wine.provenance.pageUrl].filter(Boolean).join(" \n ");
    applyCleanIdentity(wine, raw);
  }
  if (wine.enrichError) delete wine.enrichError;
  if (wine.provenance.enrichError) delete wine.provenance.enrichError;
  if (!storedGeminiKey()) wine.provenance.geminiNote = NO_GEMINI_NOTE;
  else if (legacyGeminiNote(wine.provenance.geminiNote)) wine.provenance.geminiNote = "";
  return true;
}
function refreshDirtyInternetWines() {
  let changed = false;
  (state.customWines || []).forEach(w => {
    if (refreshDirtyInternetWine(w)) changed = true;
  });
  if (changed) save();
  return changed;
}
function identityAgrees(blob, next, current) {
  const proposed = normTxt(next);
  if (!proposed) return false;
  const words = proposed.split(" ").filter(t => t.length >= 4);
  const known = normTxt(current);
  if (!words.length) return blob.includes(proposed) || known.includes(proposed);
  return words.some(t => blob.includes(t) || known.includes(t));
}
function acceptableIdentityText(value) {
  const s = clipText(value, 80);
  if (s.length < 2 || s.length > 80) return "";
  if (/https?:|opiniones|consejos|vinissimus|comprar|precio|\.{2,}/i.test(s)) return "";
  return s;
}
function applyGeminiIdentity(wine, raw) {
  if (!wine || !raw || typeof raw !== "object") return;
  wine.provenance = wine.provenance || {};
  const blob = normTxt([wine.provenance.rawTitle, wine.provenance.pageExcerpt, wine.provenance.pageUrl, wine.name, wine.producer].filter(Boolean).join(" "));
  const producer = acceptableIdentityText(raw.producer);
  if (producer && wine.provenance.producer !== "página" && identityAgrees(blob, producer, wine.producer)) {
    wine.producer = producer;
    markWineSource(wine, "producer", "estimación Gemini");
  }
  const name = acceptableIdentityText(raw.name);
  if (name && wine.provenance.name !== "página" && identityAgrees(blob, name, wine.name)) {
    wine.name = name;
    markWineSource(wine, "name", "estimación Gemini");
  }
  const year = Math.round(Number(raw.vintage));
  const mentioned = [wine.provenance.rawTitle, wine.provenance.pageExcerpt, wine.provenance.pageUrl, wine.name, String(wine.vintage || "")].join(" ").includes(String(year));
  const currentYear = Number(wine.vintage) || 0;
  if (year >= 1950 && year <= YEAR + 1 && (mentioned || !currentYear || currentYear === YEAR)) wine.vintage = year;
  const zone = detectZone([raw.region, raw.country, raw.name].filter(Boolean).join(" "));
  if (wine.provenance.region !== "página") {
    if (zone) {
      wine.region = zone.name;
      wine.appellation = zone.name;
      markWineSource(wine, "region", "estimación Gemini");
    } else {
      const region = acceptableIdentityText(raw.region);
      if (region) {
        wine.region = region;
        wine.appellation = region;
        markWineSource(wine, "region", "estimación Gemini");
      }
    }
  }
  if (wine.provenance.country !== "página") {
    const named = countryNameFrom(raw.country || "");
    const country = named || (zone && zone.country) || "";
    if (country && country.length < 40) {
      wine.country = country;
      markWineSource(wine, "country", "estimación Gemini");
    }
  }
  if (wine.provenance.type !== "página") {
    const type = wineTypeFromText(raw.type || "");
    if (type) {
      wine.type = type;
      wine.color = colorForWineType(type);
      markWineSource(wine, "type", "estimación Gemini");
    }
  }
}
function setCamButton(label) {
  const b = $("#scan-cam-btn");
  if (b) b.textContent = label;
}
function resetScanPreview() {
  const preview = $("#scan-preview");
  if (preview) { preview.hidden = true; preview.removeAttribute("src"); }
  const finder = $("#scan-finder");
  if (finder) finder.style.display = "";
  const video = $("#cam");
  if (video) video.hidden = true;
}
async function startLiveCamera() {
  stopCam();
  const video = $("#cam");
  if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setCamButton("Abrir cámara");
    return false;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      audio: false
    });
    video.srcObject = stream;
    video.hidden = false;
    const finder = $("#scan-finder");
    if (finder) finder.style.display = "none";
    await video.play();
    setCamButton("Capturar etiqueta");
    setScanStatus(t("scan.frame"));
    return true;
  } catch (e) {
    if (video) video.hidden = true;
    setCamButton("Abrir cámara");
    return false;
  }
}
async function startScan() {
  show("scan");
  lastList = "scan";
  intakeSource = "camara";
  resetScanPreview();
  if ($("#scan-results")) $("#scan-results").innerHTML = "";
  const ok = await startLiveCamera();
  if (!ok) setScanStatus(t("scan.noCam"));
}
async function captureOrOpenCamera() {
  if (screenId !== "scan") {
    show("scan");
    lastList = "scan";
  }
  intakeSource = "camara";
  const video = $("#cam");
  if (video && video.srcObject && video.videoWidth) {
    captureLabel();
    return;
  }
  const ok = await startLiveCamera();
  if (!ok) pickLabelPhoto();
}
function onScanStage() {
  const video = $("#cam");
  if (video && video.srcObject && video.videoWidth) captureLabel();
  else captureOrOpenCamera();
}
function stopCam() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  const video = $("#cam");
  if (video) video.srcObject = null;
}
function setScanStatus(msg) {
  const el = $("#scan-status");
  if (el) el.textContent = msg;
}
function pickLabelPhoto() {
  intakeSource = "camara";
  const input = $("#scan-file-cam") || $("#scan-file");
  if (!input) return;
  input.setAttribute("accept", "image/*");
  input.setAttribute("capture", "environment");
  openPhotoInput(input);
}
function pickFromRoll() {
  intakeSource = "fototeca";
  if (screenId !== "scan") {
    show("scan");
    lastList = "scan";
  }
  const input = $("#scan-file-lib") || $("#scan-file");
  if (!input) return;
  input.removeAttribute("capture");
  input.setAttribute("accept", "image/*");
  openPhotoInput(input);
}
function openPhotoInput(input) {
  input.value = "";
  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => ingestLabelImage(reader.result);
    reader.readAsDataURL(file);
  };
  input.click();
}
function captureLabel() {
  const video = $("#cam");
  if (!video || !video.videoWidth) {
    pickLabelPhoto();
    return;
  }
  intakeSource = "camara";
  const canvas = $("#scan-canvas");
  const maxW = 900;
  const scale = Math.min(1, maxW / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  ingestLabelImage(canvas.toDataURL("image/jpeg", 0.82));
}
function showLabelPreview(dataUrl) {
  const img = $("#scan-preview");
  const video = $("#cam");
  const finder = $("#scan-finder");
  img.src = dataUrl;
  img.hidden = false;
  if (video) video.hidden = true;
  if (finder) finder.style.display = "none";
  stopCam();
}
function compressDataUrl(dataUrl, maxW = 900, quality = 0.8) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
async function ingestLabelImage(dataUrl) {
  lastLabelData = await compressDataUrl(dataUrl, 720, 0.72);
  showLabelPreview(lastLabelData);
  await identifyFromPhoto(lastLabelData);
}
const OCR_WINE_WORDS = new Set("vina vinas vinedo vinedos vieja viejas reserva crianza roble joven gran tinto blanco rosado espumoso generoso brut cosecha seleccion pago finca rioja ribera duero priorat rias baixas rueda bierzo penedes cava champagne".split(" "));
const OCR_CONNECTORS = new Set("de del la las los y do da di el".split(" "));
function wineLexicon() {
  if (ocrLexiconCache) return ocrLexiconCache;
  const set = new Set();
  const add = (s) => normTxt(s).split(" ").forEach(w => { if (w.length >= 4) set.add(w); });
  try {
    (typeof WINE_CATALOG !== "undefined" ? WINE_CATALOG : []).forEach(w => {
      add(w.producer); add(w.name); add(w.region); add(w.appellation);
      (w.aliases || []).forEach(add);
    });
    if (typeof BODEGA_GEO !== "undefined") Object.keys(BODEGA_GEO).forEach(add);
  } catch (e) {}
  ocrLexiconCache = set;
  return set;
}
function lineLetterDensity(line) {
  const compact = String(line || "").replace(/\s/g, "");
  if (!compact) return 0;
  const letters = (compact.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
  return letters / compact.length;
}
function classifyOcrToken(tok, lexicon) {
  if (/^(19|20)\d{2}$/.test(tok)) return "year";
  const letters = String(tok || "").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  if (!letters) return "";
  if (/[a-záéíóúüñ][A-ZÁÉÍÓÚÜÑ]/.test(letters) || /[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+[A-ZÁÉÍÓÚÜÑ]/.test(letters)) return "";
  const n = normTxt(letters);
  if (OCR_CONNECTORS.has(n)) return "conn";
  if (letters.length < 3) return "";
  if (OCR_WINE_WORDS.has(n) || (lexicon && lexicon.has(n))) return "known";
  if (letters.length >= 4 && letters === letters.toUpperCase()) return "caps";
  if (/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]{2,}$/.test(letters)) return "title";
  return "";
}
function wordsFromOcrLine(line, lexicon) {
  const tokens = String(line || "").split(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/).filter(Boolean);
  const marks = tokens.map(tok => ({ tok, kind: classifyOcrToken(tok, lexicon) }));
  const strong = marks.some(m => m.kind === "known" || m.kind === "caps" || m.kind === "year");
  const chosen = marks.map(m => m.kind === "year" || m.kind === "known" || m.kind === "caps" || (m.kind === "title" && strong));
  const out = [];
  marks.forEach((m, i) => {
    if (chosen[i]) { out.push(m.tok); return; }
    if (m.kind !== "conn") return;
    if (chosen.slice(0, i).some(Boolean) && chosen.slice(i + 1).some(Boolean)) out.push(m.tok);
  });
  return out;
}
function prettyOcrWord(word) {
  if (/^(19|20)\d{2}$/.test(word)) return word;
  const lower = String(word || "").toLocaleLowerCase("es");
  if (OCR_CONNECTORS.has(normTxt(lower))) return lower;
  return lower.charAt(0).toLocaleUpperCase("es") + lower.slice(1);
}
function cleanOcrQuery(raw) {
  const text = String(raw || "").replace(/\r/g, "");
  const lexicon = wineLexicon();
  const lines = text.split(/\n+| \/ | \/|\/ /).map(s => s.trim()).filter(Boolean);
  const picked = [];
  lines.forEach(line => {
    const letters = (line.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
    const uppers = (line.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
    const onlyYear = letters < 3 && /\b(?:19|20)\d{2}\b/.test(line);
    if (!onlyYear && lineLetterDensity(line) < 0.4 && uppers < 8 && letters < 10) return;
    const words = wordsFromOcrLine(line, lexicon);
    if (words.length) picked.push({ uppers, words });
  });
  if (!picked.length) return "";
  const bestUpper = Math.max.apply(null, picked.map(p => p.uppers));
  const use = bestUpper >= 8 ? picked.filter(p => p.uppers >= 8 || p.words.some(w => /^(19|20)\d{2}$/.test(w) || OCR_WINE_WORDS.has(normTxt(w)) || lexicon.has(normTxt(w)))) : picked;
  const seen = new Set();
  const words = [];
  use.forEach(p => p.words.forEach(w => {
    const key = normTxt(w);
    if (!key || seen.has(key)) return;
    seen.add(key);
    words.push(prettyOcrWord(w));
  }));
  while (words.length && OCR_CONNECTORS.has(normTxt(words[0]))) words.shift();
  while (words.length && OCR_CONNECTORS.has(normTxt(words[words.length - 1]))) words.pop();
  return words.join(" ").replace(/\s+/g, " ").trim();
}
function labelQueryUseful(query) {
  const words = String(query || "").split(/\s+/).filter(Boolean);
  const year = words.some(w => /^(19|20)\d{2}$/.test(w));
  const long = words.filter(w => normTxt(w).length >= 5 && !OCR_CONNECTORS.has(normTxt(w)));
  return (year && long.length >= 1) || long.length >= 2;
}
function queryFromLabelFields(obj) {
  if (!obj || typeof obj !== "object") return "";
  const yearNum = Math.round(Number(obj.vintage));
  const year = yearNum >= 1900 && yearNum <= YEAR + 1 ? String(yearNum) : "";
  const bits = [obj.producer, obj.name, obj.region].map(s => String(s || "").replace(/https?:\/\/\S+/gi, " ").replace(/\s+/g, " ").trim()).filter(s => s.length >= 2);
  let phrase = bits.join(" ");
  if (year) phrase = phrase.replace(new RegExp("\\b" + year + "\\b", "g"), " ");
  phrase = (phrase + (year ? " " + year : "")).replace(/\s+/g, " ").trim();
  return cleanOcrQuery(phrase) || phrase;
}
function repairOcr(raw) {
  let s = " " + normTxt(raw) + " ";
  const pesq = /pesquera|pesq|squera|squer|souera|esouera|ouera|so era|p e so|te p e so/.test(s)
    || (/tinto/.test(s) && /ribera del duero/.test(s) && /reserva/.test(s) && !/vega|unico|pingus|protos|malleolus/.test(s));
  if (pesq) s += " pesquera tinto ";
  s = s.replace(/ribera\s*del\s*duer[a-z]*/g, " ribera del duero ");
  s = s.replace(/denominaci[o0]n/g, " denominacion ");
  s = s.replace(/\breserva\b/g, " reserva ");
  s = s.replace(/\bcrianza\b/g, " crianza ");
  s = s.replace(/\btinto\b/g, " tinto ");
  s = s.replace(/\b(19|20)[\s\-]?([0-9]{2})\b/g, "$1$2");
  const years = s.match(/\b(?:19|20)\d{2}\b/g) || [];
  return { text: s.replace(/\s+/g, " ").trim(), years, pesquera: pesq || s.includes("pesquera") };
}
function preprocessLabel(dataUrl) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(2, 1600 / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const pix = ctx.getImageData(0, 0, w, h);
      const d = pix.data;
      for (let i = 0; i < d.length; i += 4) {
        let v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
        v = (v - 128) * 1.25 + 138;
        d[i] = d[i + 1] = d[i + 2] = Math.max(0, Math.min(255, v));
      }
      ctx.putImageData(pix, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractReady) return tesseractReady;
  tesseractReady = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error("ocr"));
    document.head.appendChild(s);
  });
  return tesseractReady;
}
async function ocrOnce(Tesseract, img, lang) {
  const result = await Tesseract.recognize(img, lang || "spa", {
    tessedit_pageseg_mode: "6",
    logger: m => {
      if (m.status === "recognizing text" && m.progress) {
        setScanStatus(t("scan.readingPct", { n: Math.round(m.progress * 100) }));
      }
    }
  });
  return (result && result.data && result.data.text) || "";
}
function readableLabel(raw) {
  return String(raw || "").replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{2,}/g, "\n").trim();
}
async function readLabelText(dataUrl) {
  const Tesseract = await loadTesseract();
  const prep = await preprocessLabel(dataUrl);
  let best = "";
  let bestScore = -1;
  for (const lang of ["spa", "eng"]) {
    for (const img of [dataUrl, prep]) {
      try {
        const text = await Promise.race([
          ocrOnce(Tesseract, img, lang),
          new Promise((_, rej) => setTimeout(() => rej(new Error("ocr-timeout")), 22000))
        ]);
        const raw = readableLabel(text);
        const fixed = repairOcr(raw);
        const words = raw.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}/g) || [];
        const known = (fixed.text.match(/pesquera|margaux|vega|tondonia|pingus|ribera|reserva|rioja|priorat/g) || []).length;
        const score = words.length * 4 + Math.min(raw.length, 160) / 8 + (fixed.years.length ? 6 : 0) + known * 8;
        if (score > bestScore) { bestScore = score; best = raw; }
        if (words.length >= 3 && score >= 24) return best;
      } catch (e) {}
    }
    if (bestScore >= 24) break;
  }
  return best;
}
const WINE_QUERY_GENERIC = new Set("vino vinos wine tinto tintos blanco blanca bodega bodegas reserva crianza gran vieja viejas vina vinas vinedo vinedos del los las con para desde ribera duero rioja ano anos mes meses botella botellas compra comprar tienda precio etiqueta".split(" "));
function queryTokens(q) {
  const all = normTxt(q).split(" ").filter(t => t.length >= 4 && !/^(19|20)\d{2}$/.test(t));
  const distinctive = all.filter(t => !WINE_QUERY_GENERIC.has(t));
  return distinctive.length ? distinctive : all;
}
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
}
function sourceFromUrl(url) {
  const host = hostOf(url);
  if (!host) return "Web";
  if (host.includes("vinissimus")) return "Vinissimus";
  if (host.includes("decantalo")) return "Decántalo";
  if (host.includes("bigshopper")) return "Bigshopper";
  if (host.includes("vivino")) return "Vivino";
  if (host.includes("google.")) return "Google";
  return host;
}
function priceIn(text) {
  const m = String(text || "").match(/(\d{1,4}[.,]\d{2})\s*€/);
  return m ? m[1].replace(".", ",") + " €" : "";
}
function unwrapSearchUrl(url) {
  try {
    const u = new URL(url);
    const uddg = u.searchParams.get("uddg");
    if (uddg) return uddg;
  } catch (e) {}
  return url;
}
function snippetText(raw) {
  return String(raw || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}
function rankWineHits(rows, q) {
  const tokens = queryTokens(q);
  const phraseTokens = normTxt(q).split(" ").filter(t => t.length >= 4 && !/^(19|20)\d{2}$/.test(t));
  const scored = [];
  const seen = new Set();
  rows.forEach(row => {
    const title = String(row.title || "").replace(/\s+/g, " ").trim();
    const url = String(row.url || "").trim();
    if (!title || /^image\s+\d+/i.test(title)) return;
    const key = normTxt(title);
    if (seen.has(key)) return;
    const titleHay = normTxt(title);
    const n = tokens.filter(t => titleHay.includes(t)).length;
    if (tokens.length && !n) return;
    let cover = phraseTokens.filter(t => titleHay.includes(t)).length;
    const host = hostOf(url);
    const bodega = tokens.some(t => t.length >= 5 && host.includes(t));
    const opinion = isOpinionPage(url, title);
    const product = isProductPageUrl(url);
    if (product) cover += 5;
    if (opinion) cover -= 5;
    if (bodega && !/vinissimus|decantalo|bigshopper|google/.test(host)) row.source = "Bodega · " + host;
    let pref = bodega ? 0 : /decantalo/.test(host) ? 1 : /vinissimus/.test(host) ? 2 : /bigshopper/.test(host) ? 3 : 4;
    if (product) pref = Math.min(pref, 1);
    if (opinion) pref = 8;
    seen.add(key);
    scored.push(Object.assign({}, row, { title, url, _cover: cover, _price: row.price ? 1 : 0, _pref: pref }));
  });
  scored.sort((a, b) => b._cover - a._cover || a._pref - b._pref || b._price - a._price);
  return scored.map(row => {
    const copy = Object.assign({}, row);
    delete copy._cover;
    delete copy._price;
    delete copy._pref;
    return copy;
  });
}
function parseDdgMarkdown(md) {
  const hits = [];
  const re = /^\d+\.\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gm;
  let m;
  while ((m = re.exec(md))) {
    const rawUrl = m[2];
    const around = md.slice(m.index, m.index + m[0].length + 80);
    if (/sponsored|ad_domain|\/y\.js/i.test(rawUrl + around)) continue;
    const url = unwrapSearchUrl(rawUrl);
    const host = hostOf(url);
    if (!host || host.includes("duckduckgo.com")) continue;
    const rest = md.slice(m.index + m[0].length);
    const next = rest.search(/\n\d+\.\[/);
    const extract = snippetText(next >= 0 ? rest.slice(0, next) : rest.slice(0, 500));
    hits.push({
      title: m[1].replace(/\s+/g, " ").trim(),
      url,
      extract,
      price: priceIn(extract),
      source: sourceFromUrl(url),
      kind: "web"
    });
  }
  return hits;
}
function parseVinissimusMarkdown(md, query) {
  const hits = [];
  const parts = String(md || "").split(/!\[[^\]]*:\s*/).slice(1);
  parts.forEach(part => {
    const titleEnd = part.indexOf("]");
    if (titleEnd < 1) return;
    const title = part.slice(0, titleEnd).replace(/\s+/g, " ").trim();
    if (!title || /^image\s+\d+/i.test(title)) return;
    const body = part.slice(titleEnd, titleEnd + 2500);
    const link = body.match(/https:\/\/www\.vinissimus\.com\/es\/vino\/[a-z0-9-]+\//i);
    if (!link) return;
    const producer = (body.match(/\n((?:Bodegas|Viñedos|Dominio|Bodega)[^\n]{3,80})/) || [])[1] || "";
    const region = (body.match(/\n([^\n]{3,60}\(España\))/) || [])[1] || "";
    const price = priceIn(body);
    hits.push({
      title,
      url: link[0],
      producer: producer.trim(),
      price,
      extract: [producer.trim(), region.trim()].filter(Boolean).join(" · "),
      source: "Vinissimus",
      kind: "tienda"
    });
  });
  if (!hits.length) {
    const url = productUrlInMarkdown(md, query);
    if (url) {
      hits.push({
        title: query || "Vino",
        url,
        producer: "",
        price: priceIn(md),
        extract: "",
        source: "Vinissimus",
        kind: "tienda"
      });
    }
  }
  return hits;
}
function searchPortals(q) {
  const enc = encodeURIComponent(q);
  return [
    { title: "«" + q + "» en Google", url: "https://www.google.com/search?hl=es&q=" + enc, source: "Google", extract: "La búsqueda en Google: bodega, vino y tiendas.", kind: "buscar" },
    { title: "«" + q + "» en Vinissimus", url: "https://www.vinissimus.com/es/search-result/?name=" + enc, source: "Vinissimus", extract: "Abrir el vino en la tienda Vinissimus.", kind: "buscar" },
    { title: "«" + q + "» en Decántalo", url: "https://www.decantalo.com/es/busqueda?controller=search&s=" + enc, source: "Decántalo", extract: "Abrir el vino en la tienda Decántalo.", kind: "buscar" }
  ];
}
async function readPublicPage(target, signal) {
  const res = await fetch("https://r.jina.ai/" + target, { signal, headers: { Accept: "text/plain" } });
  if (!res.ok) throw new Error("http-" + res.status);
  const text = await res.text();
  if (!text || text.length < 80) throw new Error("vacio");
  if (/just a moment|tr[aá]fico inusual|unusual traffic|captcha/i.test(text.slice(0, 700))) throw new Error("bloqueo");
  return text;
}
async function lookupWineOnline(query) {
  const q = readableLabel(query).replace(/\s+/g, " ");
  if (q.length < 3) {
    return { query: q, hits: [], state: "sin-texto", note: "No hay un nombre legible. Corrige el texto leído y vuelve a buscar." };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 16000);
  const pages = await Promise.allSettled([
    readPublicPage("https://www.vinissimus.com/es/search-result/?name=" + encodeURIComponent(q), ctrl.signal),
    readPublicPage("https://lite.duckduckgo.com/lite/?kl=es-es&q=" + encodeURIComponent(q + " vino"), ctrl.signal)
  ]);
  clearTimeout(timer);
  let found = [];
  if (pages[0].status === "fulfilled") found = found.concat(parseVinissimusMarkdown(pages[0].value, q));
  if (pages[1].status === "fulfilled") found = found.concat(parseDdgMarkdown(pages[1].value));
  const ranked = rankWineHits(found, q);
  const shops = ranked.filter(h => h.kind === "tienda").slice(0, 3);
  const web = ranked.filter(h => h.kind !== "tienda").slice(0, 3);
  const chosen = shops.concat(web);
  const portals = searchPortals(q).filter(p => p.source === "Google" || !chosen.some(h => h.source === p.source));
  const hits = chosen.concat(portals);
  const readShops = ranked.length > 0;
  const bothFailed = pages.every(p => p.status === "rejected");
  const note = readShops
    ? "Bodega y tiendas para «" + q + "». Google abre la misma búsqueda."
    : (bothFailed
      ? "No se pudo leer el listado. Abre Google, Vinissimus o Decántalo, o corrige el texto."
      : "No hay una ficha cerrada para «" + q + "». Abre Google o las tiendas, o corrige el texto leído.");
  return { query: q, hits, state: "ok", note };
}
function showScanConfirm(text, hits, remote) {
  const readable = readableLabel(text).replace(/\s+/g, " ");
  const list = (hits || []).slice(0, 4);
  remote = remote || { hits: [], state: "omitida", note: "Aún no se ha buscado en internet.", query: "" };
  lastInternetHits = remote.hits || [];
  const remoteCards = lastInternetHits.length ? lastInternetHits.map((h, i) => {
    const open = h.url ? `<a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center;text-decoration:none" href="${escHtml(h.url)}" target="_blank" rel="noopener">Abrir ${escHtml(h.source || "enlace")}</a>` : "";
    const use = h.kind === "buscar" ? "" : `<button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="confirmInternetWine(${i})">Usar esta ficha</button>`;
    const who = h.producer ? `<p class="muted">${escHtml(h.producer)}</p>` : "";
    const price = h.price ? `<p class="muted">${escHtml(h.price)}</p>` : "";
    return `
      <div class="card">
        <p class="tiny">${escHtml(h.source || "Web")}</p>
        <h3>${escHtml(h.title)}</h3>
        ${who}
        ${price}
        <p class="muted">${escHtml(h.extract || "")}</p>
        ${use}
        ${open}
      </div>`;
  }).join("") : `<div class="card"><p>${escHtml(remote.note || "Sin resultado.")}</p></div>`;
  const status = remote.state === "ok"
    ? ("Búsqueda: " + lastInternetHits.length + " resultado" + (lastInternetHits.length === 1 ? "" : "s") + " de bodega y tiendas.")
    : (remote.note || "Revisa el texto leído.");
  setScanStatus(status);
  const el = $("#scan-results");
  if (!el) return;
  el.innerHTML = `
    <div class="card">
      <p class="tiny">Texto leído de la etiqueta</p>
      <textarea id="scan-read" rows="2">${escHtml(readable)}</textarea>
      ${lastOcrRaw ? `<p class="tiny">Lectura en bruto: ${escHtml(lastOcrRaw)}</p>` : ""}
      ${lastOcrNote ? `<p class="tiny">${escHtml(lastOcrNote)}</p>` : ""}
      <p class="tiny">Si la lectura falla, corrige el texto y vuelve a buscar.</p>
      <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="searchCorrectedLabel()">Buscar este texto</button>
    </div>
    <h2 style="margin-top:14px">Bodega y tiendas</h2>
    <p class="tiny" style="margin:0 0 8px">${escHtml(remote.note || "")}</p>
    ${remoteCards}
    ${list.length ? `<h2 style="margin-top:14px">En el catálogo</h2>` + list.map(w => `
      <div class="card">
        <h3>${escHtml(w.producer)}</h3>
        <p class="muted">${escHtml(w.name + " " + w.vintage + " · " + (w.appellation || w.region || ""))}</p>
        <button class="btn btn-gold" style="width:100%;margin-top:8px" onclick="confirmScanWine('${w.id}')">Este es</button>
      </div>`).join("") : `<p class="empty">Ningún vino del catálogo local coincide.</p>`}
    <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="confirmScanCustom()">Crear ficha con lo escrito</button>`;
}
function searchCorrectedLabel() {
  const typed = readableLabel((($("#scan-read") && $("#scan-read").value) || ($("#scan-q") && $("#scan-q").value) || "")).replace(/\s+/g, " ");
  if ($("#scan-q")) $("#scan-q").value = typed;
  lastOcrText = typed;
  if (typed.length < 3) {
    setScanStatus(t("scan.typeName"));
    return;
  }
  searchAndShowLabel(typed);
}
function confirmScanWine(id) {
  const w = wineById(id);
  if (!w) return;
  const q = (($("#scan-q") && $("#scan-q").value) || lastOcrText || "").trim();
  parkScanInInbox(ensureScannedWine(w, q), q, intakeSource || "camara");
}
function isCatalogWineId(id) {
  return (WINE_CATALOG || []).some(w => w.id === id);
}
function needsWineCompletion(w) {
  if (!w || isCatalogWineId(w.id)) return false;
  if (w.provenance && w.provenance.done) return false;
  return w.style === "internet" || w.style === "escaneo";
}
function showCompletingStatus() {
  setFichaProgress("Completando la ficha…");
}
function countryNameFrom(raw) {
  const n = normTxt(raw);
  if (/espana|spain/.test(n)) return "España";
  if (/francia|france/.test(n)) return "Francia";
  if (/italia|italy/.test(n)) return "Italia";
  if (/portugal/.test(n)) return "Portugal";
  if (/alemania|germany/.test(n)) return "Alemania";
  if (/argentina/.test(n)) return "Argentina";
  if (/chile/.test(n)) return "Chile";
  return String(raw || "").replace(/\s+/g, " ").trim();
}
function grapeMixFrom(raw) {
  const names = [];
  const pct = {};
  String(raw || "").replace(/\[[^\]]*\]\([^)]*\)/g, m => (m.match(/\[([^\]]+)\]/) || [])[1] || "").split(/,|\/|\+|\sy\s/i).forEach(part => {
    const hit = String(part).match(/(\d+(?:[.,]\d+)?)\s*%/);
    const name = String(part).replace(/\d+(?:[.,]\d+)?\s*%/g, " ").replace(/\s+/g, " ").trim();
    if (name.length < 3 || name.length > 40) return;
    if (/sulfito|contiene/i.test(name)) return;
    if (/^(vino|tinto|blanco|rosado|red|white)( (tinto|blanco|rosado|red|white))?$/i.test(name)) return;
    names.push(name);
    if (hit) {
      const n = Math.round(Number(hit[1].replace(",", ".")));
      if (n > 0 && n <= 100) pct[name] = n;
    }
  });
  return { names, pct };
}
function elevageFromText(text) {
  const t = String(text || "");
  const out = {};
  const months = t.match(/(\d+)\s*meses/i);
  if (months) out.months = Number(months[1]);
  if (/foudre|fudre/i.test(t)) out.vessel = "fudre";
  else if (/ánfora|anfora/i.test(t)) out.vessel = "anfora";
  else if (/depósito|deposito|acero|inox/i.test(t)) out.vessel = "deposito";
  else if (/hormig[oó]n/i.test(t)) out.vessel = "hormigon";
  else if (/barrica|roble/i.test(t)) out.vessel = "barrica";
  else if (/botella/i.test(t)) out.vessel = "botella";
  if (/franc[eé]s/i.test(t)) out.oak = "frances";
  else if (/americano/i.test(t)) out.oak = "americano";
  else if (/h[uú]ngaro/i.test(t)) out.oak = "hungaro";
  const neu = t.match(/(\d+)\s*%\s*(?:de\s+)?(?:roble\s+)?nuevo/i);
  if (neu) out.newOak = Number(neu[1]);
  return out;
}
function elevageFromGemini(raw) {
  const vesselMap = { barrica: "barrica", fudre: "fudre", foudre: "fudre", deposito: "deposito", "depósito": "deposito", anfora: "anfora", "ánfora": "anfora", botella: "botella", hormigon: "hormigon", "hormigón": "hormigon", mixto: "mixto" };
  const oakMap = { frances: "frances", "francés": "frances", americano: "americano", hungaro: "hungaro", "húngaro": "hungaro", mixto: "mixto", ninguno: "ninguno" };
  const out = elevageFromText(raw && raw.crianza);
  const months = Math.round(Number(raw && raw.elevageMonths));
  if (months > 0 && months <= 120) out.months = months;
  const vessel = vesselMap[normTxt(raw && raw.elevageVessel).replace(/\s+/g, "")];
  if (vessel) out.vessel = vessel;
  const oak = oakMap[normTxt(raw && raw.elevageOak)];
  if (oak) out.oak = oak;
  const neu = Math.round(Number(raw && raw.elevageNewOak));
  if (neu >= 0 && neu <= 100 && raw && raw.elevageNewOak != null && raw.elevageNewOak !== "" && raw.elevageNewOak !== 0) out.newOak = neu;
  return out;
}
function fillElevage(wine, patch) {
  if (!wine || !patch || userLocked(wine, "elevage")) return;
  const cur = Object.assign({}, wine.elevage || {});
  let changed = false;
  ["months", "vessel", "oak", "newOak"].forEach(k => {
    const empty = cur[k] == null || cur[k] === "" || cur[k] === 0;
    if (empty && patch[k] != null && patch[k] !== "" && patch[k] !== 0) {
      cur[k] = patch[k];
      changed = true;
    }
  });
  if (changed) wine.elevage = cur;
}
function lineField(text, label) {
  const re = new RegExp("(?:^|\\n)\\s*(?:[-*]\\s*)?(?:\\*\\*)?" + label + "(?:\\*\\*)?\\s*[:：]\\s*([^\\n]+)", "i");
  const m = String(text || "").match(re);
  if (!m) return "";
  return m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}
function productSlice(md) {
  const text = String(md || "");
  const ficha = text.search(/ficha t[eé]cnica/i);
  if (ficha >= 0) return text.slice(Math.max(0, ficha - 500), ficha + 4500);
  const head = text.search(/^#\s+\S/m);
  if (head >= 0) return text.slice(head, head + 4500);
  return text.slice(0, 5000);
}
function mdField(text, label) {
  const re = new RegExp("\\|\\s*" + label + "[^\\n|]*\\|\\s*([^\\n|]+)", "i");
  const m = String(text || "").match(re);
  if (!m) return "";
  return m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}
function parseWinePage(md) {
  const slice = productSlice(md);
  const facts = {};
  const tipo = mdField(slice, "Tipo") || mdField(slice, "Type") || lineField(slice, "Tipo(?: de vino)?") || lineField(slice, "Type");
  const type = wineTypeFromText(tipo);
  if (type) facts.type = type;
  const regionRaw = mdField(slice, "Regi[oó]n") || mdField(slice, "Denominaci[oó]n") || mdField(slice, "Appellation")
    || lineField(slice, "Regi[oó]n") || lineField(slice, "Denominaci[oó]n(?: de origen)?") || lineField(slice, "D\\.?O\\.?");
  if (regionRaw) {
    const place = regionRaw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    facts.region = (place ? place[1] : regionRaw).replace(/\s+/g, " ").trim();
    if (place) facts.country = countryNameFrom(place[2]);
    facts.appellation = facts.region;
  }
  if (!facts.country) {
    const countryCell = slice.match(/\(([A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{3,24})\)/);
    if (countryCell) facts.country = countryNameFrom(countryCell[1]);
  }
  const grapeRaw = mdField(slice, "Uvas?") || mdField(slice, "Variedad(?:es)?") || lineField(slice, "Uvas?") || lineField(slice, "Variedad(?:es)?");
  const mix = grapeMixFrom(grapeRaw);
  if (mix.names.length) {
    facts.grapes = mix.names;
    if (Object.keys(mix.pct).length) facts.grapePct = mix.pct;
  }
  const abvRaw = mdField(slice, "Graduaci[oó]n") || mdField(slice, "Alcohol") || mdField(slice, "Grado")
    || lineField(slice, "Graduaci[oó]n(?: alcoh[oó]lica)?") || lineField(slice, "Alcohol") || lineField(slice, "Grado(?: alcoh[oó]lico)?");
  const abvMatch = (abvRaw || slice).match(/(\d{1,2}(?:[,.]\d{1,2})?)\s*%/);
  if (abvMatch) {
    const abv = Number(abvMatch[1].replace(",", "."));
    if (abv >= 4 && abv <= 22) facts.abv = abv;
  }
  const producer = mdField(slice, "Productor") || mdField(slice, "Bodega") || lineField(slice, "Productor") || lineField(slice, "Bodega");
  if (producer && producer.length > 2 && producer.length < 80) facts.producer = producer;
  const crianza = mdField(slice, "Crianza") || mdField(slice, "Envejecimiento") || mdField(slice, "Barrica")
    || lineField(slice, "Crianza") || lineField(slice, "Envejecimiento");
  const crianzaProse = slice.match(/(\d+\s*meses en barrica[^\n.]{0,60}|crianza de \d+[^\n.]{0,60})/i);
  if (crianza || crianzaProse) facts.crianza = (crianza || crianzaProse[1]).replace(/\s+/g, " ").trim();
  const vista = mdField(slice, "Vista") || lineField(slice, "Vista");
  const nariz = mdField(slice, "Nariz") || lineField(slice, "Nariz");
  const boca = mdField(slice, "Boca") || lineField(slice, "Boca");
  const tasteBits = [vista && ("Vista: " + vista), nariz && ("Nariz: " + nariz), boca && ("Boca: " + boca)].filter(Boolean);
  if (tasteBits.length) facts.tasting = tasteBits.join(". ");
  const serveRange = slice.match(/(?:serv(?:ir|icio)|temperatura de servicio)[^\d]{0,40}(\d{1,2})\s*[–\-a]\s*(\d{1,2})\s*(?:º|°)?\s*C/i);
  const serveOne = slice.match(/(?:serv(?:ir|icio)|temperatura de servicio|consumo)[^\d]{0,24}(\d{1,2})\s*(?:º|°)\s*C/i);
  if (serveRange) {
    facts.serveMin = Number(serveRange[1]);
    facts.serveMax = Number(serveRange[2]);
  } else if (serveOne) {
    const n = Number(serveOne[1]);
    if (n >= 4 && n <= 22) { facts.serveMin = n; facts.serveMax = n; }
  }
  const euros = priceFromMarkdown(md);
  if (euros) facts.priceEur = euros;
  const style = styleFromText(slice);
  if (style) facts.style = style;
  return facts;
}
function pageLabelUrl(md, wine) {
  if (!wine) return "";
  const text = String(md || "");
  const title = ((text.match(/^Title:\s*(.+)$/m) || [])[1] || "");
  const year = String(wine.vintage || "");
  const titleYears = title.match(/\b(?:19|20)\d{2}\b/g) || [];
  if (year && titleYears.length && titleYears.indexOf(year) < 0) return "";
  const stop = new Set("vino vinos wine reserva crianza gran tinto blanco rosado espumoso image imagen foto bottle botella ano anos bodega bodegas".split(" "));
  const tokens = normTxt([wine.producer, wine.name].filter(Boolean).join(" ")).split(" ").filter(t => t.length >= 4 && !stop.has(t));
  if (!tokens.length) return "";
  const bad = /logo|icon|sprite|favicon|flag|welcome|pixel|banner|payment|\.svg(?:$|\?)/i;
  const re = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  const titleN = normTxt(title);
  let best = "";
  let bestScore = 0;
  let match;
  while ((match = re.exec(text))) {
    const alt = match[1] || "";
    const url = match[2];
    if (bad.test(url) || bad.test(alt)) continue;
    const altN = normTxt(alt);
    const altYears = alt.match(/\b(?:19|20)\d{2}\b/g) || [];
    if (year && altYears.length && altYears.indexOf(year) < 0) continue;
    const yearOk = !!(year && (altYears.indexOf(year) >= 0 || titleYears.indexOf(year) >= 0));
    if (!yearOk) continue;
    if (altN && tokens.every(t => altN.indexOf(t) < 0) && altN.length > 12) continue;
    let score = 0;
    tokens.forEach(t => { if (altN.indexOf(t) >= 0) score += 3; });
    if (year && altYears.indexOf(year) >= 0) score += 4;
    if (tokens.some(t => titleN.indexOf(t) >= 0) && /prfmtgrande|\/vi\/|product|bottle/i.test(url)) score += 3;
    if (score > bestScore) { bestScore = score; best = url; }
  }
  return bestScore >= 3 ? best : "";
}
function priceFromMarkdown(md) {
  const text = String(md || "");
  const head = text.search(/^#\s+\S/m);
  const slice = text.slice(head >= 0 ? head : 0, (head >= 0 ? head : 0) + 7000);
  const m = slice.match(/(\d{1,4}(?:[,.]\d{2}))\s*€/);
  if (!m) return 0;
  const n = Number(m[1].replace(",", "."));
  if (n < 3 || n > 5000) return 0;
  return n;
}
function applyShelfPrice(wine, euros, source) {
  const n = typeof euros === "number" ? euros : Number(String(euros).replace(",", ".").replace(/[^\d.]/g, ""));
  if (!(n >= 3 && n <= 5000)) return;
  wine.priceHint = n.toFixed(2).replace(".", ",") + " €";
  wine.dossier = wine.dossier || {};
  const market = wine.dossier.market || {};
  wine.dossier.market = {
    low: market.low || null,
    mid: Math.round(n),
    high: market.high || null,
    trend: "Precio visto en la página de la tienda."
  };
  markWineSource(wine, "price", source);
}
function markWineSource(wine, field, source) {
  wine.provenance = wine.provenance || {};
  wine.provenance[field] = source;
}
function applyPageFacts(wine, facts) {
  if (!facts) return;
  if (facts.type) {
    wine.type = facts.type;
    wine.color = colorForWineType(facts.type);
    markWineSource(wine, "type", "página");
  }
  if (facts.grapes && facts.grapes.length && !userLocked(wine, "grapes")) {
    wine.grapes = facts.grapes;
    if (facts.grapePct && Object.keys(facts.grapePct).length) wine.grapePct = facts.grapePct;
    markWineSource(wine, "grapes", "página");
  }
  if (facts.region) {
    const z = detectZone(facts.region + " " + (facts.country || ""));
    wine.region = z ? z.name : facts.region;
    wine.appellation = z ? z.name : (facts.appellation || facts.region);
    markWineSource(wine, "region", "página");
    if (z && !facts.country) {
      facts.country = z.country;
    }
  }
  if (facts.country) {
    wine.country = facts.country;
    markWineSource(wine, "country", "página");
  }
  if (facts.abv) {
    wine.abv = facts.abv;
    markWineSource(wine, "abv", "página");
  }
  if (facts.producer && !titleLooksDirty(facts.producer)) {
    wine.producer = facts.producer;
    markWineSource(wine, "producer", "página");
  }
  if (facts.tasting && !noteLooksLikeLinkOrPrice(facts.tasting)) {
    wine.tasting = facts.tasting;
    markWineSource(wine, "tasting", "página");
  }
  if (facts.crianza && !userLocked(wine, "crianza") && !String(wine.crianza || "").trim()) {
    wine.crianza = facts.crianza;
    markWineSource(wine, "crianza", "página");
  }
  if (facts.crianza && !userLocked(wine, "elevage")) fillElevage(wine, elevageFromText(facts.crianza));
  if (facts.serveMin) {
    wine.conservation = wine.conservation || {};
    wine.conservation.serveMin = facts.serveMin;
    wine.conservation.serveMax = facts.serveMax || facts.serveMin;
    markWineSource(wine, "service", "página");
  }
  if (facts.style) {
    wine.kindStyle = facts.style;
    markWineSource(wine, "style", "página");
  }
  if (facts.priceEur) applyShelfPrice(wine, facts.priceEur, "página");
}
const PAIRING_DISH_IDS = ["cordero", "caza", "buey", "aves", "cerdo", "estofado", "marisco", "pescado-blanco", "pescado-graso", "arroz", "pasta", "setas", "ensalada", "queso-tierno", "queso-curado", "legumbres", "chocolate", "sashimi"];
function geminiGaps(wine) {
  const p = (wine && wine.provenance) || {};
  const gaps = [];
  ["type", "grapes", "region", "country", "abv", "tasting", "crianza", "service", "cellar", "pairing", "aging", "style", "ratings", "dossier", "web", "evolution", "vintages", "price"].forEach(k => {
    const named = k === "type" || k === "region" || k === "country";
    if (userLocked(wine, k) || (k === "crianza" && userLocked(wine, "elevage"))) return;
    if (p[k] === "página") return;
    if (named && (p[k] === "título" || p[k] === "estimación Gemini")) return;
    gaps.push(k);
  });
  return gaps;
}
function readPriceCfg() {
  try {
    if (window.WineDataProvider && typeof WineDataProvider.loadCfg === "function") return WineDataProvider.loadCfg();
  } catch (e) {}
  try { return JSON.parse(localStorage.getItem(PRICE_CFG_KEY) || "{}"); } catch (e) {}
  return {};
}
function storedGeminiKey() {
  return String((readPriceCfg().geminiKey) || "").trim();
}
function saneVintageYear(n, vintage) {
  const y = Math.round(Number(n));
  if (!Number.isFinite(y) || y < vintage || y > vintage + 80) return 0;
  return y;
}
function applyGeminiFacts(wine, raw) {
  if (!raw || typeof raw !== "object") return;
  const gaps = new Set(geminiGaps(wine));
  const vintage = Number(wine.vintage) || YEAR;
  if (gaps.has("type")) {
    const type = wineTypeFromText(raw.type || "");
    if (type) {
      wine.type = type;
      wine.color = colorForWineType(type);
      markWineSource(wine, "type", "estimación Gemini");
    }
  }
  if (gaps.has("grapes") && !userLocked(wine, "grapes")) {
    const mix = Array.isArray(raw.grapeMix) ? raw.grapeMix : [];
    const fromMix = [];
    const pct = {};
    mix.forEach(g => {
      const name = String((g && g.name) || "").replace(/\s+/g, " ").trim();
      if (name.length < 3 || name.length > 40) return;
      fromMix.push(name);
      const n = Math.round(Number(g && g.pct));
      if (n > 0 && n <= 100) pct[name] = n;
    });
    const grapes = fromMix.length ? fromMix : (Array.isArray(raw.grapes) ? raw.grapes.map(g => String(g || "").trim()).filter(g => g.length >= 3 && g.length <= 40) : []);
    if (grapes.length) {
      wine.grapes = grapes.slice(0, 8);
      if (Object.keys(pct).length) wine.grapePct = pct;
      markWineSource(wine, "grapes", "estimación Gemini");
    }
  }
  if (gaps.has("region") && raw.region) {
    wine.region = String(raw.region).replace(/\s+/g, " ").trim().slice(0, 80);
    wine.appellation = String(raw.appellation || raw.region).replace(/\s+/g, " ").trim().slice(0, 80);
    markWineSource(wine, "region", "estimación Gemini");
  }
  if (gaps.has("country") && raw.country) {
    wine.country = countryNameFrom(raw.country);
    markWineSource(wine, "country", "estimación Gemini");
  }
  if (gaps.has("abv")) {
    const abv = Number(String(raw.abv == null ? "" : raw.abv).replace(",", "."));
    if (abv >= 4 && abv <= 22) {
      wine.abv = abv;
      markWineSource(wine, "abv", "estimación Gemini");
    }
  }
  if (gaps.has("tasting") && raw.tasting && !noteLooksLikeLinkOrPrice(raw.tasting)) {
    const tasting = String(raw.tasting).replace(/\s+/g, " ").trim();
    if (tasting.length > 12) {
      wine.tasting = tasting.slice(0, 420);
      markWineSource(wine, "tasting", "estimación Gemini");
    }
  }
  if (gaps.has("crianza") && raw.crianza && !userLocked(wine, "crianza") && !String(wine.crianza || "").trim()) {
    wine.crianza = String(raw.crianza).replace(/\s+/g, " ").trim().slice(0, 180);
    markWineSource(wine, "crianza", "estimación Gemini");
  }
  if (!userLocked(wine, "elevage")) fillElevage(wine, elevageFromGemini(raw));
  if (gaps.has("service")) {
    const a = Number(raw.serveMin);
    const b = Number(raw.serveMax);
    if (a >= 4 && a <= 22 && b >= a && b <= 22) {
      wine.conservation.serveMin = a;
      wine.conservation.serveMax = b;
      markWineSource(wine, "service", "estimación Gemini");
    }
  }
  if (gaps.has("cellar")) {
    const a = Number(raw.cellarMin);
    const b = Number(raw.cellarMax);
    if (a >= 5 && a <= 18 && b >= a && b <= 20) {
      wine.conservation.cellarMin = a;
      wine.conservation.cellarMax = b;
      if (raw.humidity) wine.conservation.humidity = String(raw.humidity).slice(0, 24);
      if (raw.position) wine.conservation.position = String(raw.position).slice(0, 40);
      markWineSource(wine, "cellar", "estimación Gemini");
    }
  }
  if (gaps.has("pairings") && Array.isArray(raw.pairings)) {
    const pairing = raw.pairings.map(x => String(x || "").replace(/\s+/g, " ").trim()).filter(x => x.length > 2 && x.length < 48).slice(0, 6);
    if (pairing.length) {
      wine.pairing = pairing;
      markWineSource(wine, "pairing", "estimación Gemini");
    }
  }
  if (gaps.has("aging")) {
    const drinkFrom = saneVintageYear(raw.drinkFrom, vintage);
    const peakStart = saneVintageYear(raw.peakStart, vintage);
    const peakEnd = saneVintageYear(raw.peakEnd, vintage);
    const holdTo = saneVintageYear(raw.holdTo, vintage);
    if (drinkFrom && peakStart >= drinkFrom && peakEnd >= peakStart && holdTo >= peakEnd) {
      wine.aging = { drinkFrom, peakStart, peakEnd, holdTo };
      if (raw.structure) {
        const structure = Math.round(Number(raw.structure));
        if (structure >= 40 && structure <= 100) wine.aging.structure = structure;
      }
      markWineSource(wine, "aging", "estimación Gemini");
    }
  }
  applyGeminiRecord(wine, raw);
}
function clipText(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}
function applyGeminiRecord(wine, raw) {
  if (!raw || typeof raw !== "object") return;
  const gaps = new Set(geminiGaps(wine));
  if (gaps.has("style")) {
    const style = styleFromText(raw.style || raw.kindStyle || "");
    if (style) {
      wine.kindStyle = style;
      markWineSource(wine, "style", "estimación Gemini");
    }
  }
  if (gaps.has("ratings") && raw.ratings && typeof raw.ratings === "object") {
    const bands = {
      vivino: { min: 3, max: 5 },
      penin: { min: 70, max: 100 },
      parker: { min: 70, max: 100 },
      spectator: { min: 70, max: 100 },
      decanter: { min: 70, max: 100 }
    };
    let any = false;
    Object.keys(bands).forEach(k => {
      const src = raw.ratings[k];
      if (!src || src.known !== true) return;
      const score = Number(String(src.score == null ? "" : src.score).replace(",", "."));
      if (!(score >= bands[k].min && score <= bands[k].max)) return;
      wine.ratings[k] = wine.ratings[k] || { scale: k === "vivino" ? 5 : 100, note: "" };
      wine.ratings[k].score = k === "vivino" ? Math.round(score * 10) / 10 : Math.round(score);
      wine.ratings[k].scale = k === "vivino" ? 5 : 100;
      wine.ratings[k].note = clipText(src.note, 280);
      wine.ratings[k].estimate = true;
      if (k === "vivino") {
        const count = Math.round(Number(src.count));
        if (count > 0 && count < 500000) wine.ratings[k].count = count;
      }
      if (k === "parker" && src.reviewer) wine.ratings[k].reviewer = clipText(src.reviewer, 60);
      any = true;
    });
    if (any) markWineSource(wine, "ratings", "estimación Gemini");
  }
  const pack = raw.pairingPack || raw.pairingsPack;
  if (gaps.has("pairing") && pack && typeof pack === "object") {
    const matches = (Array.isArray(pack.matches) ? pack.matches : []).map(m => {
      const dishId = String((m && m.dishId) || "");
      const score = Math.round(Number(m && m.score));
      const why = clipText(m && m.why, 180);
      if (!PAIRING_DISH_IDS.includes(dishId) || !(score >= 60 && score <= 100) || why.length < 8) return null;
      const dish = PAIRING_DISHES.find(d => d.id === dishId);
      return { dishId, score, why, label: dish ? dish.name : dishId };
    }).filter(Boolean).slice(0, 4);
    if (matches.length) {
      wine.pairingPack = {
        logic: clipText(pack.logic, 220) || matches.map(m => m.label).join(" · "),
        serve: clipText(pack.serve, 80) || shownTemp(wine, "service"),
        avoid: (Array.isArray(pack.avoid) ? pack.avoid : []).map(x => clipText(x, 40)).filter(x => x.length > 2).slice(0, 4),
        matches
      };
      wine.pairing = matches.map(m => m.label);
      markWineSource(wine, "pairing", "estimación Gemini");
    }
  }
  if (gaps.has("dossier") && raw.dossier && typeof raw.dossier === "object") {
    const d = raw.dossier;
    wine.dossier = wine.dossier || {};
    ["soils", "elevation", "vineyard", "vinification", "elevage", "glass", "decant", "oxygen"].forEach(k => {
      const text = clipText(d[k], 220);
      if (text.length > 3) wine.dossier[k] = text;
    });
    const history = String(d.history || "").replace(/\r/g, "").trim();
    if (history.length > 40) wine.dossier.history = history.slice(0, 900);
    if (Array.isArray(d.awards)) {
      const awards = d.awards.map(a => clipText(a, 40)).filter(a => a.length > 2).slice(0, 6);
      if (awards.length) wine.dossier.awards = awards;
    }
    const pageMid = wine.provenance && wine.provenance.price === "página" && wine.dossier.market ? wine.dossier.market.mid : 0;
    const market = d.market || {};
    const low = Math.round(Number(market.low));
    const mid = Math.round(Number(market.mid));
    const high = Math.round(Number(market.high));
    const sane = n => n >= 4 && n <= 8000;
    if (pageMid) {
      wine.dossier.market = wine.dossier.market || {};
      if (sane(low) && low <= pageMid) wine.dossier.market.low = low;
      if (sane(high) && high >= pageMid) wine.dossier.market.high = high;
    } else if (sane(mid) && (!sane(low) || low <= mid) && (!sane(high) || high >= mid)) {
      wine.dossier.market = {
        low: sane(low) ? low : null,
        mid,
        high: sane(high) ? high : null,
        trend: clipText(market.trend, 140) || "Estimación Gemini, no es cotización."
      };
      if (!wine.priceHint || wine.priceHint === "—") wine.priceHint = mid + " €";
      markWineSource(wine, "price", "estimación Gemini");
    }
    if (wine.dossier.history || wine.dossier.soils || wine.dossier.glass) markWineSource(wine, "dossier", "estimación Gemini");
    if (Array.isArray(d.priceHistory)) {
      const rows = d.priceHistory.map(r => ({
        year: Math.round(Number(r && r.year)),
        mid: Math.round(Number(r && (r.mid != null ? r.mid : r.price)))
      })).filter(r => r.year >= 2010 && r.year <= YEAR && r.mid >= 4 && r.mid <= 8000).slice(0, 6);
      if (rows.length) wine.priceHistory = rows;
    }
  }
  if (gaps.has("evolution") && Array.isArray(raw.evolutionNotes)) {
    const vintage = Number(wine.vintage) || YEAR;
    const notes = raw.evolutionNotes.map(n => ({
      year: Math.round(Number(n && n.year)),
      phase: clipText(n && n.phase, 32),
      text: clipText(n && n.text, 180)
    })).filter(n => n.year >= vintage - 2 && n.year <= vintage + 60 && n.phase && n.text.length > 8).slice(0, 4);
    if (notes.length) {
      wine.evolutionNotes = notes;
      markWineSource(wine, "evolution", "estimación Gemini");
    }
  }
  if (gaps.has("vintages") && Array.isArray(raw.vintages)) {
    const rows = raw.vintages.map(v => ({
      vintage: Math.round(Number(v && (v.vintage || v.year))),
      note: clipText(v && v.note, 80),
      priceHint: clipText(v && v.priceHint, 24)
    })).filter(v => v.vintage >= 1950 && v.vintage <= YEAR + 1).slice(0, 5);
    if (rows.length) {
      wine.vintages = rows;
      markWineSource(wine, "vintages", "estimación Gemini");
    }
  }
  if (Array.isArray(raw.houseWines)) {
    const rows = raw.houseWines.map(v => ({
      name: clipText(v && v.name, 60),
      note: clipText(v && v.note, 80)
    })).filter(v => v.name.length > 2).slice(0, 4);
    if (rows.length) wine.houseWines = rows;
  }
  if (gaps.has("web") && raw.geo && typeof raw.geo === "object") {
    const lat = Number(raw.geo.lat);
    const lng = Number(raw.geo.lng);
    const madrid = Math.abs(lat - 40.4) < 0.08 && Math.abs(lng + 3.7) < 0.08;
    wine.geo = wine.geo || {};
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 80 && Math.abs(lng) <= 180 && Math.abs(lat) > 0.2 && !madrid) {
      wine.geo.lat = Math.round(lat * 1000) / 1000;
      wine.geo.lng = Math.round(lng * 1000) / 1000;
      markWineSource(wine, "web", wine.provenance.web || "estimación Gemini");
    }
    if (raw.geo.zone) wine.geo.zone = clipText(raw.geo.zone, 80);
    if (raw.geo.address) wine.geo.address = clipText(raw.geo.address, 120);
    const web = clipText(raw.geo.web, 140);
    if (/^https?:\/\//i.test(web) && !/google\.|duckduckgo\.|search-result/i.test(web) && !wine.geo.web) {
      wine.geo.web = web;
      if (wine.provenance.web !== "página") markWineSource(wine, "web", "estimación Gemini");
    }
  }
}
function sealWineProvenance(wine) {
  const keys = ["type", "grapes", "region", "country", "abv", "tasting", "crianza", "service", "cellar", "pairing", "aging", "producer", "style", "ratings", "dossier", "web", "price", "evolution", "vintages", "shops"];
  wine.provenance = wine.provenance || {};
  keys.forEach(k => { if (!wine.provenance[k]) wine.provenance[k] = "valor por defecto"; });
  wine.provenance.done = true;
}
function isShopHost(url) {
  return /vinissimus|decantalo|bigshopper|vivino|wine-searcher|google\.|amazon\.|duckduckgo|instagram|facebook/i.test(String(url || ""));
}
function isSearchListingUrl(url) {
  return /\/search-result\/|\/busqueda(?:\?|$)|google\.[^/]+\/search|duckduckgo\.com/i.test(String(url || ""));
}
function isProductPageUrl(url) {
  return /vinissimus\.com\/es\/vino\/[a-z0-9-]+\/?/i.test(String(url || "")) || /decantalo\.com\/es\/[^?\s]+\.html/i.test(String(url || ""));
}
function isReadableWineUrl(url) {
  return !!(url && !isSearchListingUrl(url));
}
function productUrlInMarkdown(md, hint) {
  const text = String(md || "");
  const links = [];
  const patterns = [
    /https:\/\/www\.vinissimus\.com\/es\/vino\/[a-z0-9-]+\//gi,
    /https:\/\/www\.decantalo\.com\/es\/[a-z0-9-]+\.html/gi
  ];
  patterns.forEach(re => {
    let m;
    while ((m = re.exec(text))) {
      if (!links.includes(m[0])) links.push(m[0]);
    }
  });
  if (!links.length) return "";
  const tokens = queryTokens(hint || "");
  if (!tokens.length) return links[0];
  let best = links[0];
  let bestN = -1;
  links.forEach(url => {
    const hay = normTxt(url);
    const n = tokens.filter(t => hay.includes(t)).length;
    if (n > bestN) { bestN = n; best = url; }
  });
  return bestN > 0 ? best : links[0];
}
async function readPageQuiet(url) {
  if (!isReadableWineUrl(url)) return "";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);
  try {
    return await readPublicPage(url, ctrl.signal);
  } catch (e) {
    return "";
  } finally {
    clearTimeout(timer);
  }
}
async function readAnyPublicPage(url) {
  if (!url || /google\.[^/]+\/search|duckduckgo\.com/i.test(url)) return "";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);
  try {
    return await readPublicPage(url, ctrl.signal);
  } catch (e) {
    return "";
  } finally {
    clearTimeout(timer);
  }
}
async function resolveToProductUrl(url, hint) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (isProductPageUrl(raw)) return raw;
  if (!isSearchListingUrl(raw)) return isReadableWineUrl(raw) ? raw : "";
  const md = await readAnyPublicPage(raw);
  return productUrlInMarkdown(md, hint);
}
async function readFactsFromUrl(wine, url) {
  const hint = [wine && wine.name, wine && wine.producer, wine && wine.vintage].filter(Boolean).join(" ");
  const product = await resolveToProductUrl(url, hint);
  if (!product || !isReadableWineUrl(product)) return false;
  const page = await readPageQuiet(product);
  if (!page) return false;
  applyPageFacts(wine, parseWinePage(page));
  const pageImage = pageLabelUrl(page, wine);
  if (pageImage && !ownLabel(wine)) wine.labelUrl = pageImage;
  wine.provenance = wine.provenance || {};
  wine.provenance.pageExcerpt = clipText(page, 1600);
  wine.provenance.pageHost = hostOf(product) || product;
  wine.provenance.pageUrl = product;
  wine.provenance.pageNote = "";
  return true;
}
function clearJunkTasting(wine) {
  if (!wine) return;
  const src = wine.provenance && wine.provenance.tasting;
  if (src === "página" && !noteLooksLikeLinkOrPrice(wine.tasting)) return;
  if (noteLooksLikeLinkOrPrice(wine.tasting) || isPlaceholderNote(wine.tasting)) {
    wine.tasting = "";
    if (wine.provenance && src !== "página") delete wine.provenance.tasting;
  }
}
function pageFactsReady(wine) {
  return fieldIsReal(wine, "type") && fieldIsReal(wine, "region") && fieldIsReal(wine, "abv");
}
async function geminiWithModel(key, prompt, schema, signal, maxOutputTokens, extraParts) {
  const images = !!(extraParts && extraParts.length);
  const skip = [];
  let last = { parsed: null, reason: "modelo no disponible (HTTP 404)", model: "" };
  if (!window.WineDataProvider || !WineDataProvider.pickGeminiModel) {
    return { parsed: null, reason: "ningún modelo disponible", fatal: true, model: "" };
  }
  for (let n = 0; n < 4; n++) {
    let model = "";
    try {
      model = await WineDataProvider.pickGeminiModel(key, { images: images, skip: skip });
    } catch (err) {
      const status = err && err.status;
      const reason = status === 401 || status === 403 ? ("clave rechazada (HTTP " + status + ")") : (status ? ("HTTP " + status) : "red o CORS");
      return { parsed: null, reason: reason, fatal: true, model: "" };
    }
    if (!model) return { parsed: null, reason: "ningún modelo disponible", fatal: true, model: "" };
    const outcome = await geminiGenerate(key, model, prompt, schema, signal, maxOutputTokens, extraParts);
    if (outcome && outcome.skipModel) {
      WineDataProvider.forgetGeminiModel(model);
      skip.push(model);
      last = outcome;
      continue;
    }
    return outcome || last;
  }
  return last;
}
function geminiBlockSpecs() {
  const str = { type: "STRING" };
  const num = { type: "NUMBER" };
  const rating = { type: "OBJECT", properties: { known: { type: "BOOLEAN" }, score: num, count: num, note: str, reviewer: str } };
  return {
    basics: {
      name: "basics",
      label: "Datos",
      maxTokens: 2048,
      schema: {
        type: "OBJECT",
        properties: {
          type: str, style: str, grapes: { type: "ARRAY", items: str },
          grapeMix: { type: "ARRAY", items: { type: "OBJECT", properties: { name: str, pct: num } } },
          region: str, appellation: str, country: str, abv: num,
          crianza: str, elevageMonths: num, elevageVessel: str, elevageOak: str, elevageNewOak: num,
          tasting: str, serveMin: num, serveMax: num, cellarMin: num, cellarMax: num,
          humidity: str, position: str, light: str, drinkFrom: num, peakStart: num, peakEnd: num, holdTo: num, structure: num
        }
      },
      ask: "Bloque datos y fechas. type: tinto, blanco, rosado, espumoso o generoso. style: reserva, crianza, roble, joven o gran reserva. grapeMix: cada uva con name y pct (0 si no sabes el porcentaje). elevageMonths son los meses de crianza. elevageVessel: barrica, fudre, deposito, anfora, botella o mixto. elevageOak: frances, americano, hungaro, mixto o ninguno. elevageNewOak: porcentaje de roble nuevo, 0 si no se sabe. crianza es el texto libre, sin URL. tasting es la nota de cata, sin URL y sin precio. serveMin/serveMax y cellarMin/cellarMax en grados. drinkFrom, peakStart, peakEnd y holdTo son años, en ese orden; peakEnd es el último año para beber. Si no estás seguro, cadena vacía o 0."
    },
    pairings: {
      name: "pairings",
      label: "Puntuaciones",
      maxTokens: 2048,
      schema: {
        type: "OBJECT",
        properties: {
          ratings: { type: "OBJECT", properties: { vivino: rating, penin: rating, parker: rating, spectator: rating, decanter: rating } },
          pairingPack: {
            type: "OBJECT",
            properties: {
              logic: str, serve: str, avoid: { type: "ARRAY", items: str },
              matches: { type: "ARRAY", items: { type: "OBJECT", properties: { dishId: str, score: num, why: str } } }
            }
          }
        }
      },
      ask: "Bloque puntuaciones y maridajes. En ratings, known=true solo si recuerdas una nota publicada de esa añada; si no, known=false y score=0. No uses 0 como si fuera la nota. pairingPack.matches.dishId tiene que ser uno de: " + PAIRING_DISH_IDS.join(", ") + ". score de 60 a 100. why en español, sin URL."
    },
    dossier: {
      name: "dossier",
      label: "Dossier",
      maxTokens: 3072,
      schema: {
        type: "OBJECT",
        properties: {
          dossier: {
            type: "OBJECT",
            properties: {
              soils: str, elevation: str, vineyard: str, vinification: str, elevage: str, glass: str, decant: str, oxygen: str, history: str,
              awards: { type: "ARRAY", items: str },
              market: { type: "OBJECT", properties: { low: num, mid: num, high: num, trend: str } },
              priceHistory: { type: "ARRAY", items: { type: "OBJECT", properties: { year: num, mid: num } } }
            }
          },
          evolutionNotes: { type: "ARRAY", items: { type: "OBJECT", properties: { year: num, phase: str, text: str } } },
          vintages: { type: "ARRAY", items: { type: "OBJECT", properties: { vintage: num, note: str, priceHint: str } } },
          houseWines: { type: "ARRAY", items: { type: "OBJECT", properties: { name: str, note: str } } },
          geo: { type: "OBJECT", properties: { lat: num, lng: num, zone: str, address: str, web: str } }
        }
      },
      ask: "Bloque dossier, añadas y precio. dossier.history: dos párrafos en español, sin URL. market en euros de tienda. geo.lat y geo.lng de la bodega, no de Madrid si la bodega no está allí. geo.web es la URL de la bodega si la conoces. Si no estás seguro, cadena vacía, lista vacía o 0."
    }
  };
}
function geminiBlocksFor(gaps) {
  const set = new Set(gaps || []);
  const specs = geminiBlockSpecs();
  const blocks = [];
  if (["type", "grapes", "region", "country", "abv", "tasting", "crianza", "service", "cellar", "aging", "style"].some(k => set.has(k))) blocks.push(specs.basics);
  if (set.has("ratings") || set.has("pairing")) blocks.push(specs.pairings);
  if (["dossier", "web", "evolution", "vintages", "price"].some(k => set.has(k))) blocks.push(specs.dossier);
  return blocks;
}
function stripJsonFences(text) {
  let s = String(text || "").trim();
  const wrapped = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (wrapped) return wrapped[1].trim();
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}
function extractJsonObject(text) {
  const s = stripJsonFences(text);
  const start = s.indexOf("{");
  if (start < 0) return null;
  const sliced = s.slice(start);
  const end = sliced.lastIndexOf("}");
  if (end > 0) {
    try { return JSON.parse(sliced.slice(0, end + 1)); } catch (e) {}
  }
  return repairJsonObject(sliced);
}
function repairJsonObject(s) {
  let out = "";
  let inStr = false;
  let esc = false;
  const stack = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      out += c;
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === "\"") inStr = false;
      continue;
    }
    if (c === "\"") { inStr = true; out += c; continue; }
    if (c === "{" || c === "[") { stack.push(c); out += c; continue; }
    if (c === "}" || c === "]") {
      const open = stack[stack.length - 1];
      if ((c === "}" && open === "{") || (c === "]" && open === "[")) {
        stack.pop();
        out += c;
        if (!stack.length) break;
      }
      continue;
    }
    out += c;
  }
  if (inStr) out += "\"";
  out = out.replace(/,\s*$/, "");
  while (stack.length) {
    out = out.replace(/,\s*$/, "");
    out += stack.pop() === "{" ? "}" : "]";
  }
  try { return JSON.parse(out); } catch (e) { return null; }
}
function geminiObjectUseful(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return Object.keys(obj).some(k => {
    const v = obj[k];
    if (v == null || v === "" || v === 0) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return true;
  });
}
function geminiPartsText(json) {
  const parts = ((((json || {}).candidates || [])[0] || {}).content || {}).parts || [];
  return parts.filter(p => p && !p.thought).map(p => p.text || "").join("");
}
function geminiFinish(json) {
  return (((json || {}).candidates || [])[0] || {}).finishReason || "";
}
function geminiReasonFrom(status, finish, parsed, err) {
  if (status === 401 || status === 403) return "clave rechazada (HTTP " + status + ")";
  if (status === 429) return "cuota agotada";
  if (err && err.name === "AbortError") return "tiempo agotado";
  if (!status && err) return "red o CORS";
  if (status === 404) return "modelo no disponible (HTTP 404)";
  if (finish === "MAX_TOKENS" && !parsed) return "respuesta cortada";
  if (!parsed) return status && status !== 200 ? ("HTTP " + status) : "JSON inválido";
  return "";
}
function summarizeGeminiProblems(items) {
  if (!items.length) return "";
  const reasons = items.map(i => i.problem);
  const unique = reasons.filter((r, i) => reasons.indexOf(r) === i);
  if (unique.length === 1) return "Gemini: " + unique[0];
  return "Gemini: " + items.map(i => i.label + ": " + i.problem).join(" · ");
}
async function geminiGenerate(key, model, prompt, schema, signal, maxOutputTokens, extraParts) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
  const attempts = [
    { schema: schema, think: true },
    { schema: schema, think: false },
    { schema: null, think: false }
  ];
  let last = { parsed: null, reason: "JSON inválido", model };
  for (let i = 0; i < attempts.length; i++) {
    const opt = attempts[i];
    const generationConfig = {
      temperature: 0.2,
      maxOutputTokens: maxOutputTokens || 2048,
      responseMimeType: "application/json"
    };
    if (opt.think) generationConfig.thinkingConfig = { thinkingBudget: 0 };
    if (opt.schema) generationConfig.responseSchema = opt.schema;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }].concat(extraParts || []) }], generationConfig })
      });
    } catch (err) {
      return { parsed: null, reason: geminiReasonFrom(0, "", null, err), fatal: true, model };
    }
    if (res.status === 400 && i < attempts.length - 1) continue;
    if (res.status === 404) return { parsed: null, reason: "modelo no disponible (HTTP 404)", model, skipModel: true };
    if (res.status === 401 || res.status === 403 || res.status === 429) {
      return { parsed: null, reason: geminiReasonFrom(res.status, "", null, null), fatal: true, model };
    }
    if (!res.ok) {
      last = { parsed: null, reason: geminiReasonFrom(res.status, "", null, null), model };
      continue;
    }
    let json;
    try { json = await res.json(); } catch (e) {
      last = { parsed: null, reason: "JSON inválido", model };
      continue;
    }
    const finish = geminiFinish(json);
    const parsed = extractJsonObject(geminiPartsText(json));
    if (geminiObjectUseful(parsed)) return { parsed, reason: "", model, finish };
    last = { parsed: null, reason: geminiReasonFrom(200, finish, null, null), model, finish };
    if (finish === "MAX_TOKENS") break;
  }
  return last;
}
async function readGeminiWineFacts(wine, gaps) {
  const key = storedGeminiKey();
  wine.provenance = wine.provenance || {};
  if (!key) {
    wine.provenance.geminiNote = NO_GEMINI_NOTE;
    return null;
  }
  const blocks = geminiBlocksFor(gaps);
  if (!blocks.length) {
    wine.provenance.geminiNote = "";
    return null;
  }
  const known = [wine.producer, wine.name, wine.vintage, wine.region, wine.type, wine.abv ? wine.abv + "%" : "", (wine.grapes || []).join(", ")].filter(Boolean).join(" · ");
  const problems = [];
  let any = false;
  let fatal = false;
  for (const block of blocks) {
    if (fatal) break;
    const prompt = ["Ficha de vinoteca. Responde solo JSON.", "Vino: " + known, "Bloque: " + block.name, block.ask].join("\n");
    let outcome = null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      outcome = await geminiWithModel(key, prompt, block.schema, ctrl.signal, block.maxTokens);
    } finally {
      clearTimeout(timer);
    }
    if (outcome && outcome.parsed) {
      applyGeminiFacts(wine, outcome.parsed);
      any = true;
      wine.provenance.geminiModel = outcome.model || wine.provenance.geminiModel;
    } else {
      problems.push({ label: block.label, problem: (outcome && outcome.reason) || "JSON inválido" });
      if (outcome && outcome.fatal) fatal = true;
    }
  }
  wine.provenance.geminiNote = summarizeGeminiProblems(problems);
  return any ? { ok: true } : null;
}
let lastGeminiProbeOk = false;
async function geminiProbe(key) {
  lastGeminiProbeOk = false;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  const schema = { type: "OBJECT", properties: { ok: { type: "BOOLEAN" } } };
  try {
    const outcome = await geminiWithModel(key, "Responde solo este JSON: {\"ok\":true}", schema, ctrl.signal, 64);
    if (outcome && outcome.parsed) {
      lastGeminiProbeOk = true;
      return t("price.works", { m: outcome.model || "" });
    }
    return (outcome && outcome.reason) || "modelo no disponible (HTTP 404)";
  } finally {
    clearTimeout(timer);
  }
}
async function geminiNormalizeIdentity(wine) {
  const key = storedGeminiKey();
  if (!key || !wine) return;
  wine.provenance = wine.provenance || {};
  const schema = {
    type: "OBJECT",
    properties: {
      producer: { type: "STRING" },
      name: { type: "STRING" },
      vintage: { type: "NUMBER" },
      region: { type: "STRING" },
      country: { type: "STRING" },
      type: { type: "STRING" }
    }
  };
  const prompt = [
    "Normaliza la identidad de un vino. Responde solo JSON.",
    "Título de la página: " + (wine.provenance.rawTitle || wine.name || ""),
    "Nombre actual: " + (wine.name || ""),
    "Productor actual: " + (wine.producer || ""),
    "Añada actual: " + (wine.vintage || ""),
    "URL: " + (wine.provenance.pageUrl || ""),
    "Texto: " + clipText(wine.provenance.pageExcerpt || "", 1600),
    "producer es la bodega, corta. name es el vino, sin bodega, sin añada y sin coletillas de la web (opiniones, consejos, comprar, precio o el nombre del sitio). vintage es el año o 0. region es la denominación. country es el país. type es tinto, blanco, rosado, espumoso o generoso, o vacío.",
    "Usa solo el título, el texto y la URL. No inventes."
  ].join("\n");
  let outcome = null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    outcome = await geminiWithModel(key, prompt, schema, ctrl.signal, 512);
  } finally {
    clearTimeout(timer);
  }
  if (outcome && outcome.parsed) applyGeminiIdentity(wine, outcome.parsed);
  else if (outcome && outcome.reason && !wine.provenance.geminiNote) wine.provenance.geminiNote = "Gemini: " + outcome.reason;
}
async function completeWineRecord(wine, pageUrl) {
  normalizeWine(wine);
  wine.provenance = wine.provenance || {};
  clearJunkTasting(wine);
  applyCleanIdentity(wine, [wine.provenance.rawTitle || wine.name, wine.producer, wine.vintage, pageUrl || wine.provenance.pageUrl || ""].join(" \n "));
  const target = String(pageUrl || wine.provenance.pageUrl || "").trim();
  const opinionFirst = isOpinionPage(target, (wine.provenance.rawTitle || "") + " " + (wine.name || ""));
  setFichaProgress(isSearchListingUrl(target) ? "Abriendo la ficha del vino en la tienda…" : "Completando la ficha…");
  let read = false;
  if (target && !opinionFirst) {
    read = await readFactsFromUrl(wine, target);
    if (!read) wine.provenance.pageNote = "No se pudo leer la página de la tienda o la bodega.";
  }
  setFichaProgress("Buscando la bodega y las tiendas…");
  try {
    const remote = await lookupWineOnline([wine.producer, wine.name, wine.vintage].filter(Boolean).join(" "));
    const hits = (remote && remote.hits) || [];
    const shops = hits.filter(h => h && h.kind === "tienda" && h.url && !isSearchListingUrl(h.url)).slice(0, 3).map(h => ({
      title: h.title || "",
      url: h.url,
      price: h.price || "",
      source: h.source || hostOf(h.url)
    }));
    if (shops.length) {
      wine.shops = shops;
      markWineSource(wine, "shops", "página");
      if (wine.provenance.price !== "página") {
        const priced = shops.find(s => s.price);
        if (priced) applyShelfPrice(wine, priced.price, "página");
      }
    }
    if (!pageFactsReady(wine)) {
      for (const shop of (wine.shops || [])) {
        if (pageFactsReady(wine)) break;
        if (!shop.url || shop.url === wine.provenance.pageUrl) continue;
        if (await readFactsFromUrl(wine, shop.url)) read = true;
      }
    }
    const bodega = hits.find(h => h && h.url && h.kind !== "tienda" && h.kind !== "buscar" && !isShopHost(h.url) && isReadableWineUrl(h.url) && !isOpinionPage(h.url, h.title));
    if (bodega) {
      wine.geo = wine.geo || {};
      if (!wine.geo.web) {
        wine.geo.web = bodega.url;
        markWineSource(wine, "web", "página");
      }
      if (bodega.url !== wine.provenance.pageUrl) {
        const md = await readPageQuiet(bodega.url);
        if (md) applyPageFacts(wine, parseWinePage(md));
      }
    }
  } catch (e) {}
  if (!read && target && opinionFirst) {
    read = await readFactsFromUrl(wine, target);
  }
  if (read) wine.provenance.pageNote = "";
  applyCleanIdentity(wine, [wine.provenance.rawTitle || wine.name, wine.producer, wine.vintage, wine.provenance.pageUrl || ""].join(" \n "));
  if (wine.enrichError) delete wine.enrichError;
  if (wine.provenance.enrichError) delete wine.provenance.enrichError;
  if (legacyGeminiNote(wine.provenance.geminiNote)) wine.provenance.geminiNote = "";
  if (storedGeminiKey()) {
    setFichaProgress("Afinando nombre, bodega y zona…");
    try { await geminiNormalizeIdentity(wine); } catch (e) {
      if (!wine.provenance.geminiNote) wine.provenance.geminiNote = "Gemini: red o CORS";
    }
  }
  const gaps = geminiGaps(wine);
  if (!storedGeminiKey()) {
    wine.provenance.geminiNote = NO_GEMINI_NOTE;
  } else if (gaps.length) {
    setFichaProgress("Completando con Gemini lo que la página no trae…");
    try {
      await readGeminiWineFacts(wine, gaps);
    } catch (e) {
      if (!wine.provenance.geminiNote) wine.provenance.geminiNote = "Gemini: red o CORS";
    }
  } else if (!wine.provenance.geminiNote) {
    wine.provenance.geminiNote = "";
  }
  sealWineProvenance(wine);
  save();
  return wine;
}
async function settleNewWine(wine, raw, source, pageUrl) {
  if (!wine) return;
  if (intakeBusy) return toast(t("gemini.busy"));
  intakeBusy = true;
  try {
    if (needsWineCompletion(wine)) {
      showCompletingStatus();
      let url = String(pageUrl || "");
      if (!url) {
        try {
          const remote = await lookupWineOnline([wine.producer, wine.name, wine.vintage].filter(Boolean).join(" "));
          const hit = (remote.hits || []).find(h => h && h.url && h.kind !== "buscar" && !isOpinionPage(h.url, h.title))
            || (remote.hits || []).find(h => h && h.url && h.kind !== "buscar");
          if (hit) url = hit.url;
        } catch (e) {}
      }
      try { await completeWineRecord(wine, url); } catch (e) {}
    }
    parkScanInInbox(wine, raw, source);
  } finally {
    intakeBusy = false;
  }
}
async function completeExistingWine(id) {
  const wine = wineById(id);
  if (!wine || isCatalogWineId(wine.id)) return;
  if (intakeBusy) return toast(t("gemini.busy"));
  intakeBusy = true;
  try {
    normalizeWine(wine);
    wine.provenance = wine.provenance || {};
    wine.provenance.done = false;
    if (wine.enrichError) delete wine.enrichError;
    if (wine.provenance.enrichError) delete wine.provenance.enrichError;
    applyCleanIdentity(wine, [wine.provenance.rawTitle || wine.name, wine.producer, wine.vintage, wine.provenance.pageUrl || ""].join(" \n "));
    const noKey = !storedGeminiKey();
    if (noKey) wine.provenance.geminiNote = NO_GEMINI_NOTE;
    else if (legacyGeminiNote(wine.provenance.geminiNote)) wine.provenance.geminiNote = "";
    save();
    if (noKey) openNotify();
    if (currentWine && currentWine.id === wine.id) openWine(wine.id, currentBottle);
    setFichaProgress("Completando la ficha…");
    await completeWineRecord(wine, wine.provenance.pageUrl || "");
    if (currentWine && currentWine.id === wine.id) openWine(wine.id, currentBottle);
    if (noKey) openNotify();
    toast(wine.provenance.geminiNote ? t("gemini.partial") : t("gemini.updated"));
  } catch (e) {
    toast(t("gemini.fail"));
  } finally {
    intakeBusy = false;
  }
}
function confirmScanCustom() {
  const q = (($("#scan-read") && $("#scan-read").value) || ($("#scan-q") && $("#scan-q").value) || "").trim();
  const raw = q || lastOcrText || "";
  const w = inferWineFromText(raw);
  if (!w) return toast(t("gemini.needName"));
  settleNewWine(w, raw, intakeSource || "camara", "");
}
function wineFromInternetHit(hit) {
  const title = (hit && hit.title) || "";
  const raw = [title, hit && hit.producer, hit && hit.extract, hit && hit.url, lastOcrText].filter(Boolean).join(" ");
  const local = rankFromText(title || raw);
  if (local[0]) return ensureScannedWine(local[0], raw);
  const id = "web-" + normTxt((hit && (hit.url || title)) || "vino").replace(/\s+/g, "-").slice(0, 72);
  const existed = wineById(id);
  if (existed) return existed;
  const idn = identityFromTitle(title);
  const zone = detectZone(raw);
  const year = idn.vintage || yearFromText(raw) || YEAR;
  const givenProducer = String((hit && hit.producer) || "").trim();
  const producer = (givenProducer && !titleLooksDirty(givenProducer) && givenProducer.length <= 80) ? givenProducer : (idn.producer || "");
  const name = idn.name || "Vino";
  const type = idn.type || wineTypeFromText(raw);
  const w = {
    id, name, producer: producer || name, vintage: year,
    region: (zone && zone.name) || idn.region || "",
    country: (zone && zone.country) || idn.country || "",
    appellation: (zone && zone.name) || idn.appellation || "",
    type: type || "", style: "internet",
    grapes: [], abv: 0, color: "#4a1020",
    ratings: {
      vivino: { score: 0, count: 0, scale: 5, note: "" },
      penin: { score: 0, scale: 100, note: "" },
      parker: { score: 0, scale: 100, reviewer: "", note: "" },
      spectator: { score: 0, scale: 100, note: "" },
      decanter: { score: 0, scale: 100, note: "" }
    },
    priceHint: (hit && hit.price) || "—",
    tasting: "",
    pairing: [],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: year + 1, peakStart: year + 3, peakEnd: year + 10, holdTo: year + 15 },
    evolutionNotes: [],
    provenance: {
      rawTitle: (hit && hit.title) || "",
      pageUrl: (hit && hit.url) || ""
    }
  };
  if (w.type) markWineSource(w, "type", "título");
  if (w.region) markWineSource(w, "region", "título");
  if (w.country) markWineSource(w, "country", "título");
  if (producer) markWineSource(w, "producer", "título");
  if (idn.name) markWineSource(w, "name", "título");
  state.customWines = state.customWines || [];
  state.customWines.push(w);
  return w;
}
function confirmInternetWine(i) {
  const hit = lastInternetHits[i];
  if (!hit) return toast(t("gemini.gone"));
  if (hit.kind === "buscar") {
    if (hit.url) window.open(hit.url, "_blank", "noopener");
    return;
  }
  const w = wineFromInternetHit(hit);
  if (!w) return toast(t("gemini.noCreate"));
  settleNewWine(w, lastOcrText || hit.title, intakeSource || "fototeca", hit.url || "");
}
async function searchAndShowLabel(text) {
  const gen = ++photoSearchGen;
  setScanStatus(t("gemini.searching"));
  if ($("#scan-results")) $("#scan-results").innerHTML = `<div class="card muted">Buscando el vino en internet…</div>`;
  const remote = await lookupWineOnline(text);
  if (gen !== photoSearchGen) return;
  showScanConfirm(text, rankFromText(text), remote);
}
async function readLabelWithGemini(dataUrl) {
  const key = storedGeminiKey();
  if (!key) return { query: "", note: "" };
  const comma = String(dataUrl || "").indexOf(",");
  if (comma < 0) return { query: "", note: "Gemini: imagen no válida" };
  const mime = (String(dataUrl).slice(0, comma).match(/data:(image\/[a-zA-Z0-9.+-]+)/) || [])[1] || "image/jpeg";
  const data = String(dataUrl).slice(comma + 1);
  if (data.length < 40) return { query: "", note: "Gemini: imagen no válida" };
  const schema = {
    type: "OBJECT",
    properties: {
      producer: { type: "STRING" },
      name: { type: "STRING" },
      vintage: { type: "NUMBER" },
      region: { type: "STRING" }
    }
  };
  const prompt = [
    "Lee la etiqueta de vino de la foto. Responde solo JSON.",
    "producer es la bodega, name es el vino sin la bodega y sin la añada, vintage es el año (0 si no se ve), region es la zona.",
    "No inventes. Si un campo no se lee, cadena vacía o 0."
  ].join("\n");
  const image = { inlineData: { mimeType: mime, data: data } };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const outcome = await geminiWithModel(key, prompt, schema, ctrl.signal, 512, [image]);
    const query = outcome && outcome.parsed ? queryFromLabelFields(outcome.parsed) : "";
    if (labelQueryUseful(query)) return { query, note: "" };
    let last = "JSON inválido";
    if (outcome && outcome.finish === "MAX_TOKENS") last = "respuesta cortada";
    else if (outcome && outcome.parsed) last = "JSON inválido";
    else if (outcome && outcome.reason) last = outcome.reason;
    if (outcome && outcome.fatal) return { query: "", note: "Gemini: " + outcome.reason };
    return { query: "", note: "Gemini: " + last };
  } catch (e) {
    return { query: "", note: e && e.name === "AbortError" ? "Gemini: tiempo agotado" : "Gemini: red o CORS" };
  } finally {
    clearTimeout(timer);
  }
}
async function identifyFromPhoto(dataUrl) {
  if (ocrBusy) {
    setScanStatus(t("scan.prev"));
    return;
  }
  ocrBusy = true;
  const fromRoll = intakeSource === "fototeca";
  setScanStatus(fromRoll ? t("scan.rollReading") : t("scan.reading"));
  if ($("#scan-results")) $("#scan-results").innerHTML = `<div class="card muted">${fromRoll ? "Foto elegida. Leyendo la etiqueta para buscar el vino." : "Analizando la foto. Un momento."}</div>`;
  let text = "";
  let query = "";
  lastOcrNote = "";
  try {
    try { text = await readLabelText(dataUrl); } catch (e) { text = ""; }
    lastOcrRaw = readableLabel(text).replace(/\s+/g, " ");
    query = cleanOcrQuery(text);
    if (storedGeminiKey()) {
      setScanStatus(fromRoll ? t("scan.rollGemini") : t("scan.geminiReading"));
      const gem = await readLabelWithGemini(dataUrl);
      if (gem.query) query = gem.query;
      else if (gem.note) lastOcrNote = gem.note;
    }
  } finally {
    ocrBusy = false;
  }
  if (!query) {
    lastOcrText = lastOcrRaw;
    if ($("#scan-q")) $("#scan-q").value = lastOcrRaw;
    setScanStatus(t("scan.unclean"));
    showScanConfirm(lastOcrRaw, rankFromText(lastOcrRaw), { hits: [], state: "sin-texto", note: "La lectura no dejó un nombre de vino. Corrige el texto.", query: "" });
    return;
  }
  lastOcrText = query;
  if ($("#scan-q")) $("#scan-q").value = query;
  await searchAndShowLabel(query);
}
function rankFromText(raw) {
  const hay = normTxt(raw);
  if (!hay || hay.length < 4) return [];
  const scored = WINE_CATALOG.map(w => {
    let score = 0;
    const prod = normTxt(w.producer);
    const nam = normTxt(w.name);
    const tokens = prod.split(" ").filter(t => t.length >= 5 && !/chateau|bodegas|celler|dominio|tenuta/.test(t));
    tokens.forEach(t => { if (hay.includes(t)) score += 28; });
    if (nam.length >= 5 && hay.includes(nam)) score += 22;
    if (hay.includes(String(w.vintage))) score += 8;
    if (hay.includes("unico") && /unico/.test(nam)) score += 30;
    if (hay.includes("vega") && hay.includes("sicilia") && /vega sicilia/.test(prod)) score += 40;
    if (hay.includes("tondonia") && /tondonia/.test(nam)) score += 30;
    if (hay.includes("valbuena") && /valbuena/.test(nam)) score += 26;
    if (hay.includes("pazo") && /pazo/.test(prod)) score += 24;
    if (hay.includes("margaux") && /margaux/.test(prod + " " + nam)) score += 40;
    const aliases = (w.aliases || []).map(normTxt);
    aliases.forEach(t => { if (t.length >= 5 && hay.includes(t)) score += 46; });
    if (hay.includes("pesquera") && /pesquera/.test(prod + " " + nam + " " + aliases.join(" "))) score += 50;
    if (hay.includes("reserva") && /reserva/.test(nam) && score >= 28) score += 12;
    const region = normTxt(w.region + " " + w.appellation);
    if (hay.includes("ribera del duero") && !/ribera/.test(region)) score = 0;
    if (hay.includes("rioja") && !/rioja/.test(region)) score = 0;
    if (hay.includes("priorat") && !/priorat/.test(region)) score = 0;
    if (hay.includes("margaux") && !/margaux|medoc/.test(region + " " + prod)) score = 0;
    return { w, score };
  }).filter(x => x.score >= 28).sort((a, b) => b.score - a.score);
  const uniq = [];
  const seen = new Set();
  scored.forEach(x => {
    if (!seen.has(x.w.id)) { seen.add(x.w.id); uniq.push(x.w); }
  });
  return uniq.slice(0, 6);
}
function intakeSourceLabel(src) {
  if (src === "fototeca") return t("src.photo");
  if (src === "manual") return t("src.manual");
  return t("src.camera");
}
function parkScanInInbox(wine, text, source) {
  if (!wine) return;
  const via = source || intakeSource || "camara";
  state.inbox = state.inbox || [];
  const cellarId = preferredCellar(wine, 0) || (state.vinotecas[0] && state.vinotecas[0].id) || "v1";
  const bin = nextBin(cellarId);
  const row = {
    uid: "in" + Date.now() + Math.random().toString(16).slice(2, 6),
    wineId: wine.id,
    created: new Date().toISOString(),
    text: String(text || "").replace(/\s+/g, " ").slice(0, 180),
    photo: "",
    entered: false,
    cellarId,
    bin,
    source: via
  };
  state.inbox.unshift(row);
  if (via !== "manual" && lastLabelData) rememberLabelPhoto(wine.id, lastLabelData, null, row);
  save();
  if ($("#scan-q")) $("#scan-q").value = "";
  setScanStatus(t("inbox.ready", { bin: bin }));
  toast(wine.producer + " " + wine.vintage + " · " + cellarName(cellarId) + " " + bin);
  show("inbox");
}
function ensurePendingSlots() {
  let dirty = false;
  (state.inbox || []).forEach(row => {
    if (row.entered) return;
    if (!row.cellarId) {
      const w = wineById(row.wineId);
      row.cellarId = (w && preferredCellar(w, 0)) || "v1";
      dirty = true;
    }
    if (!row.bin) {
      row.bin = nextBin(row.cellarId);
      dirty = true;
    }
  });
  if (dirty) save();
}
function renderInbox() {
  const box = $("#inbox-list");
  if (!box) return;
  ensurePendingSlots();
  const q = fold(($("#inbox-q") && $("#inbox-q").value) || "");
  const rows = (state.inbox || []).filter(row => {
    const w = wineById(row.wineId);
    const hay = wineHay(w, (row.text || "") + " " + (row.bin || "") + " " + intakeSourceLabel(row.source));
    return !q || hay.includes(q);
  });
  if (!(state.inbox || []).length) {
    box.innerHTML = `<div class="card muted">${t("inbox.empty")}</div>
      <button class="btn btn-gold" style="width:100%;margin-top:12px" onclick="startScan()">${t("scan.open")}</button>
      <button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="pickFromRoll()">${t("scan.photos")}</button>`;
    return;
  }
  if (!rows.length) {
    box.innerHTML = `<p class="empty">${t("inbox.none")}</p>`;
    return;
  }
  box.innerHTML = rows.map(row => {
    const w = wineById(row.wineId);
    const title = w ? `${w.producer}` : t("inbox.read");
    const sub = w ? `${w.name} ${w.vintage}` : "";
    const badge = row.entered ? `<span class="badge ok">${t("inbox.inCellar")}</span>` : `<span class="badge warn">${t("inbox.pending")}</span>`;
    const where = row.entered
      ? `<p class="tiny">${t("inbox.where", { cave: cellarName(row.cellarId), bin: row.bin || t("cellar.noBin") })}</p>`
      : `<p class="tiny">${t("inbox.slot", { cave: cellarName(row.cellarId), bin: row.bin || t("cellar.noBin") })}</p>`;
    const via = `<p class="tiny">${intakeSourceLabel(row.source)}</p>`;
    return `<article class="inbox-card">
      ${row.photo ? `<img src="${row.photo}" alt="">` : `<div class="inbox-ph"></div>`}
      <div class="inbox-copy">
        <div class="row"><h3>${title}</h3>${badge}</div>
        <p>${sub}</p>
        ${where}
        ${via}
        <div class="inbox-actions">
          ${row.entered
            ? `<button class="btn btn-ghost" onclick="openWine('${row.wineId}')">${t("inbox.see")}</button>`
            : `<button class="btn btn-gold" onclick="enterInbox('${row.uid}')">${t("inbox.enter")}</button>
               <button class="btn btn-ghost" onclick="openWine('${row.wineId}')">${t("inbox.sheet")}</button>`}
          <button class="btn btn-ghost" onclick="deleteInbox('${row.uid}')">${t("inbox.delete")}</button>
        </div>
      </div>
    </article>`;
  }).join("") + `<button class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="startScan()">${t("inbox.another")}</button>`;
}
function deleteInbox(uid) {
  const row = (state.inbox || []).find(x => x.uid === uid);
  if (!row) return;
  const w = wineById(row.wineId);
  if (!confirm(t("inbox.confirm", { extra: w ? t("inbox.of", { name: w.name }) : "" }))) return;
  state.inbox = (state.inbox || []).filter(x => x.uid !== uid);
  save();
  renderInbox();
  toast(t("inbox.deleted"));
}
function enterInbox(uid) {
  const row = (state.inbox || []).find(x => x.uid === uid);
  if (!row || row.entered) return;
  const w = wineById(row.wineId);
  if (!w) return toast(t("inbox.missing"));
  normalizeWine(w);
  currentWine = w;
  if (!row.cellarId) row.cellarId = preferredCellar(w, 0) || "v1";
  if (!row.bin) row.bin = nextBin(row.cellarId);
  lastLabelData = row.photo || "";
  showSheet("add-sheet");
  if ($("#add-inbox-uid")) $("#add-inbox-uid").value = uid;
  if ($("#add-cellar")) $("#add-cellar").value = row.cellarId;
  if ($("#add-bin")) $("#add-bin").value = row.bin;
  if ($("#add-qty")) $("#add-qty").value = "1";
  if ($("#add-keep-hint")) $("#add-keep-hint").textContent = t("inbox.reserved", { bin: row.bin, cave: cellarName(row.cellarId) });
}
function yearFromText(raw) {
  const m = String(raw || "").match(/\b((?:19|20)\d{2})\b/);
  return m ? parseInt(m[1], 10) : 0;
}
function ensureScannedWine(base, raw) {
  if (!base) return null;
  const year = yearFromText(raw);
  if (!year || year === Number(base.vintage)) return base;
  const nid = String(base.id).replace(/-?\d{4}$/, "") + "-" + year;
  const existed = wineById(nid);
  if (existed) return existed;
  const copy = JSON.parse(JSON.stringify(base));
  copy.id = nid;
  copy.vintage = year;
  state.customWines = state.customWines || [];
  state.customWines.push(copy);
  return copy;
}
function inferWineFromText(raw) {
  const hay = normTxt(raw);
  if (!hay || hay.length < 6) return null;
  const year = yearFromText(raw) || YEAR;
  const catalog = WINE_CATALOG.find(w => {
    const tokens = normTxt(w.producer).split(" ").filter(t => t.length >= 5 && !/chateau|bodegas|celler|dominio/.test(t));
    return tokens.some(t => hay.includes(t)) || (normTxt(w.name).length >= 5 && hay.includes(normTxt(w.name)));
  });
  if (catalog) return ensureScannedWine(catalog, raw);
  const words = hay.split(" ").filter(x => x.length > 2 && x !== String(year)).slice(0, 4);
  const label = words.map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ") || "Vino escaneado";
  const id = "scan-" + Date.now();
  const w = {
    id, name: label, producer: label, vintage: year,
    region: "", country: "", appellation: "", type: "tinto", style: "escaneo",
    grapes: [], abv: 13.5, color: "#4a1020",
    ratings: {
      vivino: { score: 0, count: 0, scale: 5, note: "" },
      penin: { score: 0, scale: 100, note: "" },
      parker: { score: 0, scale: 100, reviewer: "", note: "Alta por etiqueta. Completa la ficha." },
      spectator: { score: 0, scale: 100, note: "" },
      decanter: { score: 0, scale: 100, note: "" }
    },
    priceHint: "—",
    tasting: "Ficha creada al escanear la etiqueta.",
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: year + 1, peakStart: year + 3, peakEnd: year + 10, holdTo: year + 15, drinkTo: year + 14 },
    evolutionNotes: []
  };
  state.customWines = state.customWines || [];
  state.customWines.push(w);
  return w;
}
function identifyFromCatalog(q) {
  const s = fold(q);
  if (!s) return WINE_CATALOG.slice(0, 8);
  const tokens = s.split(/\s+/).filter(t => t.length > 1);
  return catalogWines().filter(w => {
    const hay = wineHay(w, (w.grapes || []).join(" "));
    return tokens.every(t => hay.includes(t));
  });
}
function previewScanQuery() {
  if ($("#scan-read")) return;
  const q = ($("#scan-q") && $("#scan-q").value) || "";
  if (!fold(q)) {
    if ($("#scan-results")) $("#scan-results").innerHTML = "";
    return;
  }
  renderHits(identifyFromCatalog(q).slice(0, 8), "Coincidencias", true);
}
function queueIntake(wineId) {
  const w = wineById(wineId);
  if (!w) return toast(t("gemini.noSheet"));
  const q = (($("#scan-q") && $("#scan-q").value) || lastOcrText || "").trim();
  const source = intakeSource === "manual" || !lastLabelData ? "manual" : (intakeSource || "camara");
  parkScanInInbox(ensureScannedWine(w, q), q, source);
}
function manualIntake() {
  intakeSource = "manual";
  const q = (($("#scan-q") && $("#scan-q").value) || "").trim();
  if (!q) {
    setScanStatus(t("scan.manualHint"));
    if (screenId !== "scan") {
      show("scan");
      lastList = "scan";
    }
    const input = $("#scan-q");
    if (input) input.focus();
    return;
  }
  const hits = identifyFromCatalog(q);
  if (hits.length === 1) {
    parkScanInInbox(ensureScannedWine(hits[0], q), q, "manual");
    return;
  }
  if (hits.length > 1) {
    renderHits(hits, "Elige la ficha", true);
    return;
  }
  const w = inferWineFromText(q);
  if (!w) return toast(t("gemini.needName"));
  settleNewWine(w, q, "manual", "");
}
function runIdentify() {
  manualIntake();
}
function setPriceMode(on) {
  if (!window.WineDataProvider) return;
  WineDataProvider.saveCfg({ mode: on ? "live" : "demo" });
}
function refreshGeminiKeyState() {
  const stateEl = document.getElementById("gemini-key-state");
  if (!stateEl) return;
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const stored = storedGeminiKey();
  if (typed && typed !== stored) {
    stateEl.textContent = t("price.typed");
    return;
  }
  if (stored) {
    stateEl.textContent = t("price.stored");
    return;
  }
  stateEl.textContent = t("price.none");
}
async function probeGeminiKey() {
  const el = document.getElementById("gemini-probe");
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const key = typed || storedGeminiKey();
  if (!key) {
    if (el) el.textContent = t("price.needKey");
    refreshGeminiKeyState();
    return;
  }
  if (el) el.textContent = t("price.probing");
  try {
    const msg = await geminiProbe(key);
    if (el) el.textContent = msg;
    if (typed && lastGeminiProbeOk) {
      const box = $("#p-gemini");
      if (box) box.checked = true;
      const result = persistPriceCfg();
      toast(result.ok ? t("price.savedKey") : t("price.keyFail"));
    }
  } catch (e) {
    if (el) el.textContent = t("price.net");
  }
  refreshGeminiKeyState();
}
function persistPriceCfg() {
  const prev = readPriceCfg();
  const url = ($("#p-url") && $("#p-url").value.trim()) || "";
  const key = ($("#p-key") && $("#p-key").value.trim()) || "";
  const live = $("#p-live") && $("#p-live").checked;
  const geminiOn = $("#p-gemini") && $("#p-gemini").checked;
  const typed = ($("#p-gemini-key") && $("#p-gemini-key").value.trim()) || "";
  const geminiKey = typed || String(prev.geminiKey || "").trim();
  const next = {
    mode: live && key ? "live" : "demo",
    apiUrl: url || prev.apiUrl || "https://www.wine-searcher.com/ws_api.php",
    apiKey: key || prev.apiKey || "",
    geminiOn: !!(geminiOn && geminiKey),
    geminiKey: geminiKey,
    currency: prev.currency || "EUR"
  };
  try {
    if (window.WineDataProvider && typeof WineDataProvider.saveCfg === "function") WineDataProvider.saveCfg(next);
    else localStorage.setItem(PRICE_CFG_KEY, JSON.stringify(Object.assign({}, prev, next)));
  } catch (e) {
    return { ok: false, saved: "", live: false };
  }
  const saved = String((readPriceCfg().geminiKey) || "").trim();
  if (geminiKey && saved !== geminiKey) return { ok: false, saved: saved, live: !!(live && key) };
  return { ok: true, saved: saved, live: !!(live && key) };
}
function savePriceCfg() {
  const result = persistPriceCfg();
  if (!result.ok) {
    toast(t("price.keyFail"));
    return;
  }
  hideSheets();
  toast(result.saved ? t("price.savedKey") : (result.live ? t("price.wsOn") : t("price.dossier")));
  refreshGeminiKeyState();
}
function hydratePriceFields() {
  const cfg = readPriceCfg();
  if ($("#p-live")) $("#p-live").checked = cfg.mode === "live" && !!cfg.apiKey;
  if ($("#p-url")) $("#p-url").value = cfg.apiUrl || "";
  if ($("#p-key")) $("#p-key").value = cfg.apiKey || "";
  if ($("#p-gemini")) $("#p-gemini").checked = !!cfg.geminiOn && !!cfg.geminiKey;
  const keyEl = $("#p-gemini-key");
  if (keyEl && document.activeElement !== keyEl) keyEl.value = cfg.geminiKey || "";
  refreshGeminiKeyState();
}
const TR_DB_NAME = "casa-llavaneras-i18n";
const TR_STORE = "tr";
const TR_LS_KEY = "vinoteca.i18n.cache";
const TR_LS_CAP = 350000;
const TR_LANG_NAME = { ca: "Catalan", en: "English", fr: "French", pt: "European Portuguese" };
const TR_WINE_TERM = { ca: "criança", en: "ageing", fr: "élevage", pt: "estágio" };
function trCacheKey(wineId, lang) {
  return String(wineId) + ":" + String(lang);
}
function openTrDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("no-idb"));
    const req = indexedDB.open(TR_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TR_STORE)) db.createObjectStore(TR_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("idb"));
  });
}
function idbGetTr(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TR_STORE, "readonly");
    const req = tx.objectStore(TR_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
function idbPutTr(db, key, row) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TR_STORE, "readwrite");
    tx.objectStore(TR_STORE).put(row, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
function readTrBag() {
  try { return JSON.parse(localStorage.getItem(TR_LS_KEY) || "{}") || {}; } catch (e) { return {}; }
}
async function readWineTranslation(wineId, lang) {
  const key = trCacheKey(wineId, lang);
  try {
    const db = await openTrDb();
    const hit = await idbGetTr(db, key);
    db.close();
    if (hit && hit.text) return hit;
  } catch (e) {}
  const bag = readTrBag();
  return bag[key] && bag[key].text ? bag[key] : null;
}
async function writeWineTranslation(wineId, lang, text) {
  const key = trCacheKey(wineId, lang);
  const row = { text: String(text), at: Date.now(), lang: lang };
  try {
    const db = await openTrDb();
    await idbPutTr(db, key, row);
    db.close();
    return;
  } catch (e) {}
  try {
    const bag = readTrBag();
    bag[key] = row;
    let raw = JSON.stringify(bag);
    if (raw.length > TR_LS_CAP) {
      const entries = Object.keys(bag).sort((a, b) => (bag[a].at || 0) - (bag[b].at || 0));
      while (raw.length > TR_LS_CAP && entries.length) {
        delete bag[entries.shift()];
        raw = JSON.stringify(bag);
      }
    }
    localStorage.setItem(TR_LS_KEY, raw);
  } catch (e) {}
}
function wineFieldLocked(w, field) {
  if (!w) return false;
  if (w.provenance && w.provenance[field] === "usuario") return true;
  const user = w.wineEdits && w.wineEdits.user;
  return !!(user && user[field]);
}
function wineTranslatePayload(w) {
  const d = typeof dossierOf === "function" ? dossierOf(w) : {};
  const pack = (window.WINE_PAIRINGS && WINE_PAIRINGS[w.id]) || w.pairingPack || null;
  const out = {};
  ["soils", "vineyard", "vinification", "elevage", "history", "oxygen", "glass", "decant"].forEach(k => {
    if (d && d[k]) out[k] = d[k];
  });
  if (d && d.awards && d.awards.length) out.awards = d.awards;
  if (w.tasting && !wineFieldLocked(w, "tasting")) out.tasting = w.tasting;
  if (pack) {
    if (pack.logic) out.pairingLogic = pack.logic;
    if (pack.serve) out.pairingServe = pack.serve;
    if (pack.avoid && pack.avoid.length) out.pairingAvoid = pack.avoid;
    const why = (pack.matches || []).map(m => m.why).filter(Boolean);
    if (why.length) out.pairingWhy = why;
  }
  if (Array.isArray(w.evolutionNotes) && w.evolutionNotes.length) {
    out.evolution = w.evolutionNotes.map(n => ({ year: n.year, phase: n.phase, text: n.text }));
  }
  const critics = [];
  const ratings = w.ratings || {};
  ["penin", "parker", "spectator", "decanter", "vivino"].forEach(k => {
    const note = ratings[k] && ratings[k].note;
    if (note && !wineFieldLocked(w, "ratings")) critics.push(note);
  });
  if (critics.length) out.critics = critics;
  return out;
}
async function paintWineTranslation(wineId) {
  const lang = (typeof appLang !== "undefined" && appLang) || "es";
  const box = document.getElementById("wine-tr-body");
  if (!box || !wineId || lang === "es") return;
  const hit = await readWineTranslation(wineId, lang);
  if (!hit || !hit.text) return;
  if (!currentWine || currentWine.id !== wineId) return;
  if (((typeof appLang !== "undefined" && appLang) || "es") !== lang) return;
  box.textContent = hit.text;
}
async function requestWineTranslation(wineId) {
  const lang = (typeof appLang !== "undefined" && appLang) || "es";
  if (lang === "es") return toast(t("tr.already"));
  const key = storedGeminiKey();
  if (!key) return toast(t("tr.needKey"));
  const cached = await readWineTranslation(wineId, lang);
  if (cached && cached.text) {
    await paintWineTranslation(wineId);
    return;
  }
  const w = wineById(wineId);
  if (!w) return;
  const box = document.getElementById("wine-tr-body");
  if (box) box.textContent = t("tr.working");
  const payload = wineTranslatePayload(w);
  const prompt = [
    "Translate this Spanish wine-catalogue JSON into " + (TR_LANG_NAME[lang] || lang) + ".",
    "Return JSON {\"text\":\"...\"}: natural prose a sommelier would write, covering every field.",
    "Keep proper nouns (estate, cuvée, appellation, place, grape variety, critic) unchanged.",
    "Use the wine term «" + (TR_WINE_TERM[lang] || "crianza") + "» wherever the Spanish says crianza, envejecimiento or élevage.",
    "Do not invent facts. Do not translate the drinker's own notes.",
    JSON.stringify(payload)
  ].join("\n");
  const schema = { type: "OBJECT", properties: { text: { type: "STRING" } }, required: ["text"] };
  try {
    const outcome = await geminiWithModel(key, prompt, schema, null, 2048);
    const text = outcome && outcome.parsed && String(outcome.parsed.text || "").trim();
    if (!text) throw new Error("empty");
    await writeWineTranslation(wineId, lang, text);
    if (box && currentWine && currentWine.id === wineId) box.textContent = text;
    toast(t("tr.done"));
  } catch (e) {
    if (box) box.textContent = t("tr.keep");
    toast(t("tr.fail"));
  }
}

/* Datos de bodega y añada (v103).
   La clave de Gemini, con Google Search, busca hechos en la web oficial y en bodeboca.com.
   Solo se guardan campos cortos y su URL. Si discrepan, vale la web oficial.
   Un campo vacío no se pinta. El usuario puede corregirlo. */

var FACT_HOUSE = ["hectares", "founded", "production", "soils", "winemaker"];
var FACT_VINTAGE = ["bottles", "ageing", "abv", "harvest", "scores"];
var factsBusy = false;

addI18n([
  ["fact103.expand", "Ampliar datos", "Ampliar dades", "Expand details", "Élargir les données", "Ampliar dados"],
  ["fact103.edit", "Editar", "Editar", "Edit", "Modifier", "Editar"],
  ["fact103.save", "Guardar", "Desar", "Save", "Enregistrer", "Guardar"],
  ["fact103.cancel", "Cancelar", "Cancel·lar", "Cancel", "Annuler", "Cancelar"],
  ["fact103.looking", "Buscando datos…", "Cercant dades…", "Looking up details…", "Recherche des données…", "A procurar dados…"],
  ["fact103.source", "Fuente", "Font", "Source", "Source", "Fonte"],
  ["fact103.hectares", "Viñedo", "Vinya", "Vineyard", "Vignoble", "Vinha"],
  ["fact103.founded", "Fundación", "Fundació", "Founded", "Fondation", "Fundação"],
  ["fact103.production", "Producción", "Producció", "Production", "Production", "Produção"],
  ["fact103.soils", "Suelos y altitud", "Sòls i altitud", "Soils and altitude", "Sols et altitude", "Solos e altitude"],
  ["fact103.winemaker", "Enólogo", "Enòleg", "Winemaker", "Vinificateur", "Enólogo"],
  ["fact103.bottles", "Botellas", "Ampolles", "Bottles", "Bouteilles", "Garrafas"],
  ["fact103.ageing", "Crianza", "Criança", "Ageing", "Élevage", "Estágio"],
  ["fact103.abv", "Alcohol", "Alcohol", "Alcohol", "Alcool", "Álcool"],
  ["fact103.harvest", "Vendimia", "Verema", "Harvest", "Vendanges", "Vindima"],
  ["fact103.scores", "Puntuaciones", "Puntuacions", "Scores", "Notes", "Pontuações"]
]);

function cleanFactText(value) {
  const text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  if (!text || /^[\s«"]*sin datos?[\s.»"]*$/i.test(text)) return "";
  if (text.length > 90) return "";
  if (text.split(/\s+/).length > 18) return "";
  return text;
}

function factHostOf(url) {
  if (typeof hostOfUrl === "function") return hostOfUrl(url);
  return String(url || "").replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./, "").toLowerCase();
}

function factChunks(raw) {
  if (typeof groundingChunksOf === "function") return groundingChunksOf(raw) || [];
  return [];
}

function chunkSupports(url, chunks) {
  if (!/^https:\/\//i.test(url || "")) return false;
  const host = factHostOf(url);
  if (!host || !chunks || !chunks.length) return false;
  return chunks.some(chunk => {
    const uri = chunk && chunk.uri || "";
    const uh = factHostOf(uri);
    if (uh && (uh === host || uh.endsWith("." + host) || host.endsWith("." + uh))) return true;
    if (uri && (uri.indexOf(url) >= 0 || (uri.length > 12 && url.indexOf(uri) >= 0))) return true;
    return String(chunk && chunk.title || "").toLowerCase().indexOf(host) >= 0;
  });
}

function readFactSide(raw, chunks, kind) {
  if (!raw || typeof raw !== "object") return null;
  const value = cleanFactText(raw[kind]);
  const source = String(raw[kind + "Source"] || "").trim();
  if (!value || !chunkSupports(source, chunks)) return null;
  const host = factHostOf(source);
  const bodeboca = host === "bodeboca.com" || host.endsWith(".bodeboca.com");
  if (kind === "bodeboca" && !bodeboca) return null;
  if (kind === "official" && bodeboca) return null;
  return { value: value, source: source };
}

function pickFact(raw, chunks) {
  const official = readFactSide(raw, chunks, "official");
  const bodeboca = readFactSide(raw, chunks, "bodeboca");
  if (official && bodeboca && official.value !== bodeboca.value) {
    return { value: official.value, source: official.source, sources: [official.source], by: "web" };
  }
  if (official && bodeboca) {
    return { value: official.value, source: official.source, sources: [official.source, bodeboca.source], by: "web" };
  }
  if (official) return { value: official.value, source: official.source, sources: [official.source], by: "web" };
  if (bodeboca) return { value: bodeboca.value, source: bodeboca.source, sources: [bodeboca.source], by: "web" };
  return null;
}

function acceptFactBag(parsed, raw) {
  const chunks = factChunks(raw);
  const house = {};
  const vintage = {};
  if (!chunks.some(chunk => chunk && chunk.uri)) return { house: house, vintage: vintage };
  const src = parsed || {};
  function take(key, bucket, nested) {
    const row = src[key] || (src[nested] && src[nested][key]);
    const got = pickFact(row, chunks);
    if (got) bucket[key] = got;
  }
  FACT_HOUSE.forEach(key => take(key, house, "house"));
  FACT_VINTAGE.forEach(key => take(key, vintage, "vintage"));
  return { house: house, vintage: vintage };
}

function factRecord(row) {
  const value = cleanFactText(row && row.value);
  if (!value) return null;
  const sources = [];
  const list = (row && row.sources) || (row && row.source ? [row.source] : []);
  list.forEach(url => {
    const text = String(url || "").trim();
    if (/^https:\/\//i.test(text) && sources.indexOf(text) < 0) sources.push(text);
  });
  return {
    value: value,
    source: sources[0] || "",
    sources: sources,
    by: row && row.by === "usuario" ? "usuario" : "web"
  };
}

function mergeFactBag(current, incoming) {
  const next = Object.assign({}, current || {});
  Object.keys(incoming || {}).forEach(key => {
    const prev = next[key];
    if (prev && prev.by === "usuario") return;
    const row = factRecord(incoming[key]);
    if (row) next[key] = row;
  });
  return next;
}

function factKeyForWine(wine) {
  const card = wine && typeof wineryCardFor === "function" ? wineryCardFor(wine) : null;
  if (card && card.id) return card.id;
  if (wine && wine.provenance && wine.provenance.wineryId) return wine.provenance.wineryId;
  if (typeof foldWinery === "function") return foldWinery((wine && wine.producer) || "") || "";
  return String((wine && wine.producer) || "").trim().toLowerCase();
}

function houseFactsFor(key) {
  if (!key || typeof state === "undefined" || !state || !state.houseFacts) return {};
  return state.houseFacts[key] || {};
}

function applyHouseFacts(key, bag) {
  if (!key || typeof state === "undefined" || !state) return {};
  state.houseFacts = state.houseFacts || {};
  state.houseFacts[key] = mergeFactBag(state.houseFacts[key], bag);
  return state.houseFacts[key];
}

function factLabel(key) {
  const code = "fact103." + key;
  const label = typeof t === "function" ? t(code) : "";
  return label && label !== code ? label : key;
}

function jsAttr(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function factLine(label, row) {
  const kept = factRecord(row);
  if (!kept) return "";
  const link = kept.source
    ? ' <a class="tiny" href="' + escHtml(kept.source) + '" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">' + escHtml(factLabel("source")) + "</a>"
    : "";
  return '<div class="fact"><span>' + escHtml(label) + "</span><b>" + escHtml(kept.value) + link + "</b></div>";
}

function factsBlockHtml(house, vintage, opts) {
  const lines = [];
  FACT_HOUSE.forEach(key => {
    const line = factLine(factLabel(key), house && house[key]);
    if (line) lines.push(line);
  });
  FACT_VINTAGE.forEach(key => {
    const line = factLine(factLabel(key), vintage && vintage[key]);
    if (line) lines.push(line);
  });
  const buttons = opts && opts.buttons ? opts.buttons : "";
  if (!lines.length && !buttons) return "";
  return '<div class="card" id="facts-v103">' + lines.join("") + buttons + "</div>";
}

function factButtons(expand, edit) {
  return '<button type="button" class="btn btn-ghost" id="facts-expand" style="width:100%;margin-top:8px" onclick="' + expand + '">' + escHtml(factLabel("expand")) + "</button>"
    + '<button type="button" class="btn btn-ghost" id="facts-edit" style="width:100%;margin-top:8px" onclick="' + edit + '">' + escHtml(factLabel("edit")) + "</button>";
}

function wineFactsHtml(wine) {
  if (!wine) return "";
  const id = jsAttr(wine.id);
  return factsBlockHtml(houseFactsFor(factKeyForWine(wine)), wine.vintageFacts, {
    buttons: factButtons("expandWineFacts('" + id + "')", "editWineFacts('" + id + "')")
  });
}

function bodegaFactsHtml(card) {
  if (!card) return "";
  const id = jsAttr(card.id);
  return factsBlockHtml(houseFactsFor(card.id), {}, {
    buttons: factButtons("expandBodegaFacts('" + id + "')", "editBodegaFacts('" + id + "')")
  });
}

function factCardFor(wine) {
  return (wine && typeof wineryCardFor === "function" && wineryCardFor(wine))
    || (wine && wine.provenance && wine.provenance.wineryId && typeof wineryCardById === "function" ? wineryCardById(wine.provenance.wineryId) : null);
}

function factPrompt(wine, card) {
  const year = wine && (wine.vintage || wine.year) || "";
  const name = [wine && wine.producer, wine && wine.name, year, wine && (wine.appellation || wine.region)].filter(Boolean).join(" · ");
  const web = (card && card.web) || (wine && wine.geo && wine.geo.web) || "";
  return [
    "Busca hechos concretos de esta bodega y de esta añada en la web oficial de la bodega y en bodeboca.com.",
    "Responde solo JSON. Cada campo es {\"official\":\"\",\"officialSource\":\"https://...\",\"bodeboca\":\"\",\"bodebocaSource\":\"https://...\"}.",
    "Campos de bodega: hectares, founded, production, soils, winemaker.",
    "Campos de la añada: bottles, ageing, abv, harvest, scores.",
    "hectares: hectáreas de viñedo. founded: año de fundación. production: producción anual. soils: suelos y altitud, en una frase corta. winemaker: enólogo.",
    "bottles: botellas de esa añada. ageing: meses de crianza y tipo de barrica. abv: alcohol. harvest: nota breve de la vendimia. scores: puntuaciones publicadas, si constan.",
    "Como máximo 18 palabras por campo. Cadena vacía si no consta. No escribas «Sin dato». No copies párrafos ni textos descriptivos de Bodeboca.",
    "officialSource es una URL https de la web oficial, nunca de bodeboca.com. bodebocaSource es una URL https de bodeboca.com.",
    "Si las fuentes discrepan, rellena las dos cifras con su URL.",
    web ? ("Web oficial: " + web) : "Si no conoces la web oficial, deja official vacío.",
    "Vino: " + name
  ].join("\n");
}

async function lookupWineFacts(wine, signal) {
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) return { ok: false, reason: "needKey", house: {}, vintage: {} };
  const card = factCardFor(wine);
  const prompt = factPrompt(wine, card);
  let outcome = null;
  try {
    if (typeof postWineSearch === "function") outcome = await postWineSearch(key, prompt, signal);
    else if (typeof geminiTryModels === "function" && typeof geminiGrounded === "function") {
      outcome = await geminiTryModels(key, "ground", function (model) {
        return geminiGrounded(key, model, prompt, signal);
      });
    }
  } catch (err) {
    return { ok: false, reason: "fetch", house: {}, vintage: {} };
  }
  if (!outcome || !outcome.parsed) return { ok: false, reason: (outcome && outcome.reason) || "empty", house: {}, vintage: {} };
  const bag = acceptFactBag(outcome.parsed, outcome.raw);
  return { ok: true, reason: "", house: bag.house, vintage: bag.vintage };
}

async function lookupWineFactsTimed(wine, ms) {
  const ctrl = typeof AbortController === "function" ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, ms || 18000);
  try {
    return await lookupWineFacts(wine, ctrl && ctrl.signal);
  } finally {
    clearTimeout(timer);
  }
}

function probeFromSheet(sheet, assets) {
  const card = assets && assets.winery;
  return {
    producer: (card && card.name) || (sheet && sheet.winery) || "",
    name: (sheet && sheet.name) || "",
    vintage: (sheet && sheet.vintage) || "",
    region: (sheet && sheet.region) || "",
    appellation: (sheet && sheet.region) || "",
    provenance: { wineryId: (card && card.id) || "" },
    geo: { web: (card && card.web) || "" }
  };
}

function stampFacts(wine, flow) {
  if (!wine || !flow) return;
  if (flow.vintageFacts) wine.vintageFacts = mergeFactBag(wine.vintageFacts, flow.vintageFacts);
  const cardId = (wine.provenance && wine.provenance.wineryId) || factKeyForWine(wine);
  if (cardId && flow.houseFacts) applyHouseFacts(cardId, flow.houseFacts);
  if (typeof save === "function") save();
}

async function ampliarAltaFacts() {
  const flow = typeof altaFlow !== "undefined" ? altaFlow : null;
  if (!flow || !flow.sheet || factsBusy) return;
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) {
    if (typeof toast === "function") toast(t("score.needKey"));
    return;
  }
  factsBusy = true;
  if (typeof toast === "function") toast(t("fact103.looking"));
  try {
    const got = await lookupWineFactsTimed(probeFromSheet(flow.sheet, flow.assets));
    if (!got || !got.ok || altaFlow !== flow) return;
    flow.houseFacts = mergeFactBag(flow.houseFacts, got.house);
    flow.vintageFacts = mergeFactBag(flow.vintageFacts, got.vintage);
    if (flow.status === "DRAFT" && flow.step === "preview") {
      if (typeof captureAltaSheet === "function") captureAltaSheet();
      if (typeof renderAltaPreview === "function") renderAltaPreview();
      return;
    }
    if (flow.wineId && typeof wineById === "function") {
      const wine = wineById(flow.wineId);
      stampFacts(wine, flow);
      if (wine && document.getElementById("wine-body") && typeof openWine === "function") openWine(wine.id, typeof currentBottle !== "undefined" ? currentBottle : null);
    }
  } finally {
    factsBusy = false;
  }
}

async function expandWineFacts(wineId) {
  if (factsBusy) return;
  const wine = typeof wineById === "function" ? wineById(wineId) : null;
  if (!wine) return;
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) {
    if (typeof toast === "function") toast(t("score.needKey"));
    return;
  }
  factsBusy = true;
  if (typeof toast === "function") toast(t("fact103.looking"));
  try {
    const got = await lookupWineFactsTimed(wine);
    if (got && got.ok) {
      const id = factKeyForWine(wine);
      if (id) applyHouseFacts(id, got.house);
      wine.vintageFacts = mergeFactBag(wine.vintageFacts, got.vintage);
      if (typeof save === "function") save();
    }
  } finally {
    factsBusy = false;
  }
  if (typeof openWine === "function") openWine(wine.id, typeof currentBottle !== "undefined" ? currentBottle : null);
}

async function expandBodegaFacts(cardId) {
  if (factsBusy) return;
  const card = typeof wineryCardById === "function" ? wineryCardById(cardId) : null;
  if (!card) return;
  const key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
  if (!key) {
    if (typeof toast === "function") toast(t("score.needKey"));
    return;
  }
  const probe = {
    producer: card.name,
    name: (card.wines && card.wines[0]) || "",
    vintage: "",
    region: card.zone || "",
    provenance: { wineryId: card.id },
    geo: { web: card.web || "" }
  };
  factsBusy = true;
  if (typeof toast === "function") toast(t("fact103.looking"));
  try {
    const got = await lookupWineFactsTimed(probe);
    if (got && got.ok) {
      applyHouseFacts(card.id, got.house);
      if (typeof save === "function") save();
    }
  } finally {
    factsBusy = false;
  }
  if (typeof openBodega === "function") openBodega(card.id, typeof bodegaFromList !== "undefined" && bodegaFromList);
}

function factInputs(bag, keys) {
  return keys.map(key => {
    const value = bag && bag[key] && bag[key].value || "";
    return '<label class="field"><span>' + escHtml(factLabel(key)) + '</span><input id="fact-in-' + key + '" value="' + escHtml(cleanFactText(value)) + '"></label>';
  }).join("");
}

function factEditBar(saveCall, cancelCall) {
  return '<button type="button" class="btn btn-gold" id="facts-save" style="width:100%;margin-top:8px" onclick="' + saveCall + '">' + escHtml(factLabel("save")) + "</button>"
    + '<button type="button" class="btn btn-ghost" id="facts-cancel" style="width:100%;margin-top:8px" onclick="' + cancelCall + '">' + escHtml(factLabel("cancel")) + "</button>";
}

function writeFactEdit(target, key, previous) {
  const el = document.getElementById("fact-in-" + key);
  const value = cleanFactText(el ? el.value : "");
  if (!value) {
    delete target[key];
    return;
  }
  const prev = previous && previous[key];
  if (prev && prev.value === value) {
    target[key] = prev;
    return;
  }
  target[key] = { value: value, source: "", sources: [], by: "usuario" };
}

function editWineFacts(wineId) {
  const wine = typeof wineById === "function" ? wineById(wineId) : null;
  const box = document.querySelector("#wine-body #facts-v103");
  if (!wine || !box) return;
  const house = houseFactsFor(factKeyForWine(wine));
  box.innerHTML = factInputs(house, FACT_HOUSE) + factInputs(wine.vintageFacts, FACT_VINTAGE)
    + factEditBar("saveWineFactEdits('" + jsAttr(wine.id) + "')", "openWine('" + jsAttr(wine.id) + "')");
}

function saveWineFactEdits(wineId) {
  const wine = typeof wineById === "function" ? wineById(wineId) : null;
  if (!wine || typeof state === "undefined" || !state) return;
  const id = factKeyForWine(wine);
  const prevHouse = Object.assign({}, id ? houseFactsFor(id) : {});
  const prevVintage = Object.assign({}, wine.vintageFacts || {});
  const house = Object.assign({}, prevHouse);
  const vintage = Object.assign({}, prevVintage);
  FACT_HOUSE.forEach(key => writeFactEdit(house, key, prevHouse));
  FACT_VINTAGE.forEach(key => writeFactEdit(vintage, key, prevVintage));
  if (id) {
    state.houseFacts = state.houseFacts || {};
    state.houseFacts[id] = house;
  }
  wine.vintageFacts = vintage;
  if (typeof save === "function") save();
  if (typeof openWine === "function") openWine(wine.id, typeof currentBottle !== "undefined" ? currentBottle : null);
}

function editBodegaFacts(cardId) {
  const card = typeof wineryCardById === "function" ? wineryCardById(cardId) : null;
  const box = document.querySelector("#bodegas-body #facts-v103");
  if (!card || !box) return;
  const back = typeof bodegaFromList !== "undefined" && bodegaFromList ? "true" : "false";
  box.innerHTML = factInputs(houseFactsFor(card.id), FACT_HOUSE)
    + factEditBar("saveBodegaFactEdits('" + jsAttr(card.id) + "')", "openBodega('" + jsAttr(card.id) + "', " + back + ")");
}

function saveBodegaFactEdits(cardId) {
  const card = typeof wineryCardById === "function" ? wineryCardById(cardId) : null;
  if (!card || typeof state === "undefined" || !state) return;
  const prev = Object.assign({}, houseFactsFor(card.id));
  const house = Object.assign({}, prev);
  FACT_HOUSE.forEach(key => writeFactEdit(house, key, prev));
  state.houseFacts = state.houseFacts || {};
  state.houseFacts[card.id] = house;
  if (typeof save === "function") save();
  if (typeof openBodega === "function") openBodega(card.id, typeof bodegaFromList !== "undefined" && bodegaFromList);
}

var openWineV103 = openWine;
openWine = function (wineId, bottle) {
  openWineV103(wineId, bottle);
  const body = document.getElementById("wine-body");
  if (!body || body.querySelector("#facts-v103")) return;
  const cuvee = body.querySelector(".wine-cuvee");
  const wine = typeof wineById === "function" ? wineById(wineId) : null;
  const html = wineFactsHtml(wine);
  if (cuvee && html) cuvee.insertAdjacentHTML("afterend", html);
};

var renderBodegaSheetV103 = renderBodegaSheet;
renderBodegaSheet = function (id) {
  renderBodegaSheetV103(id);
  const card = typeof wineryCardById === "function" ? wineryCardById(id) : null;
  const box = document.getElementById("bodegas-body");
  const h1 = box && box.querySelector("h1");
  if (!card || !h1 || box.querySelector("#facts-v103")) return;
  const html = bodegaFactsHtml(card);
  if (html) h1.insertAdjacentHTML("afterend", html);
};

var renderAltaPreviewV103 = renderAltaPreview;
renderAltaPreview = function () {
  renderAltaPreviewV103();
  const body = document.getElementById("alta-preview");
  if (!body || body.querySelector("#facts-v103") || typeof altaFlow === "undefined" || !altaFlow) return;
  const html = factsBlockHtml(altaFlow.houseFacts, altaFlow.vintageFacts, {
    buttons: '<button type="button" class="btn btn-ghost" id="facts-expand" style="width:100%;margin-top:8px" onclick="ampliarAltaFacts()">' + escHtml(factLabel("expand")) + "</button>"
  });
  const h1 = body.querySelector("h1");
  if (h1 && html) h1.insertAdjacentHTML("afterend", html);
};

var runAltaAnalysisV103 = runAltaAnalysis;
runAltaAnalysis = async function () {
  await runAltaAnalysisV103();
  if (typeof altaFlow === "undefined" || !altaFlow || altaFlow.step !== "preview") return;
  await ampliarAltaFacts();
};

var confirmAltaV103 = confirmAlta;
confirmAlta = async function (another) {
  const flow = typeof altaFlow !== "undefined" ? altaFlow : null;
  if (flow && flow.status === "DRAFT") flow.status = "CONFIRMING";
  const prev = openWine;
  let painted = false;
  openWine = function (wineId, bottle) {
    const wine = typeof wineById === "function" ? wineById(wineId) : null;
    stampFacts(wine, flow);
    painted = true;
    openWine = prev;
    return prev(wineId, bottle);
  };
  try {
    const stored = await confirmAltaV103(another);
    if (!painted && stored && stored.id) stampFacts(stored, flow);
    if (!stored && flow && flow.step === "preview") flow.status = "DRAFT";
    return stored;
  } finally {
    openWine = prev;
  }
};

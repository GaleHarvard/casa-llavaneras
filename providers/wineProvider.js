/* WineDataProvider
   demo: dossier local, sin red.
   live: Wine-Searcher ws_api.php si hay apiKey.
   gemini: estimación de horquilla con la API gratuita de Google AI Studio.
   La clave no se escribe en el código: se lee de localStorage (Avisos)
   o de window.VINOTECA_CONFIG.geminiKey. En una PWA la clave queda en el
   iPhone; no la subas a GitHub. Vivino no se scrapea. */
(function (root) {
  const KEY = "vinoteca-jgc-provider";
  const CACHE_KEY = "vinoteca-jgc-gemini-cache";
  const TIMEOUT_MS = 12000;
  const MODEL_KEY = "vinoteca-gemini-model";
  const MODEL_TTL = 24 * 60 * 60 * 1000;

  function modelId(model) {
    return String((model && model.name) || model || "").replace(/^models\//, "");
  }
  function modelBlocked(id) {
    return /preview|experimental|(^|[-_.])exp(\d|[-_.]|$)|tts|(^|[-_.])image($|[-_.])|embed|(^|[-_.])live($|[-_.])/i.test(String(id || ""));
  }
  function modelFamily(id) {
    const n = String(id || "").toLowerCase();
    if (n.indexOf("flash-lite") >= 0) return 1;
    if (n.indexOf("flash") >= 0) return 0;
    if (n.indexOf("pro") >= 0) return 2;
    return 9;
  }
  function modelVersion(id) {
    const m = String(id || "").match(/(\d+(?:\.\d+)?)/);
    if (!m) return [0];
    return m[1].split(".").map(function (n) { return parseInt(n, 10) || 0; });
  }
  function supportsGenerate(model) {
    const methods = model && (model.supportedGenerationMethods || model.supportedActions);
    if (!methods) return true;
    return methods.some(function (item) { return String(item).toLowerCase().indexOf("generatecontent") >= 0; });
  }
  function modalityList(model) {
    if (!model) return null;
    if (Array.isArray(model.supportedInputModalities)) return model.supportedInputModalities;
    if (Array.isArray(model.inputModalities)) return model.inputModalities;
    if (model.supportedModalities && Array.isArray(model.supportedModalities.input)) return model.supportedModalities.input;
    return null;
  }
  function supportsImage(model) {
    const mods = modalityList(model);
    if (!mods) return true;
    return mods.some(function (item) { return /image/i.test(String(item)); });
  }
  function rankGeminiModels(models, opts) {
    const wantImage = !!(opts && opts.images);
    return (models || []).map(function (model) {
      return { raw: model, id: modelId(model) };
    }).filter(function (model) {
      if (!model.id || modelBlocked(model.id) || !supportsGenerate(model.raw)) return false;
      if (modelFamily(model.id) > 2) return false;
      if (wantImage && !supportsImage(model.raw)) return false;
      return true;
    }).sort(function (a, b) {
      const family = modelFamily(a.id) - modelFamily(b.id);
      if (family) return family;
      const av = modelVersion(a.id);
      const bv = modelVersion(b.id);
      const n = Math.max(av.length, bv.length);
      for (let i = 0; i < n; i++) {
        const d = (bv[i] || 0) - (av[i] || 0);
        if (d) return d;
      }
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }).map(function (model) { return model.id; });
  }
  function keyTag(key) {
    const s = String(key || "");
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }
  function readModelCache() {
    try { return JSON.parse(localStorage.getItem(MODEL_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function writeModelCache(cache) {
    localStorage.setItem(MODEL_KEY, JSON.stringify(cache || {}));
  }
  function outputModalities(model) {
    if (!model) return [];
    if (Array.isArray(model.supportedOutputModalities)) return model.supportedOutputModalities;
    if (Array.isArray(model.outputModalities)) return model.outputModalities;
    if (model.supportedModalities && Array.isArray(model.supportedModalities.output)) return model.supportedModalities.output;
    return [];
  }
  function methodNames(model) {
    const methods = (model && (model.supportedGenerationMethods || model.supportedActions)) || [];
    return methods.map(function (item) { return String(item).toLowerCase(); });
  }
  function imageModelTier(model) {
    const id = modelId(model);
    if (!id || /tts|embed|(^|[-_.])live($|[-_.])/i.test(id)) return 0;
    const methods = methodNames(model);
    const gen = methods.some(function (item) { return item.indexOf("generatecontent") >= 0; });
    const predict = methods.some(function (item) { return item.indexOf("predict") >= 0; });
    const outImage = outputModalities(model).some(function (item) { return /image/i.test(String(item)); });
    const namedImage = /image/i.test(id) && !/imagen/i.test(id);
    const imagen = /imagen/i.test(id);
    if (namedImage && gen) return 1;
    if (outImage && gen) return 2;
    if (imagen && gen) return 3;
    if (imagen && predict) return 4;
    if (namedImage && predict) return 5;
    return 0;
  }
  function previewBias(id) {
    return /preview|experimental|(^|[-_.])exp(\d|[-_.]|$)/i.test(id) ? 1 : 0;
  }
  function rankGeminiImageModels(models) {
    return (models || []).map(function (model) {
      return { raw: model, id: modelId(model), tier: imageModelTier(model) };
    }).filter(function (model) {
      return model.tier > 0;
    }).sort(function (a, b) {
      if (a.tier !== b.tier) return a.tier - b.tier;
      const preview = previewBias(a.id) - previewBias(b.id);
      if (preview) return preview;
      const av = modelVersion(a.id);
      const bv = modelVersion(b.id);
      const n = Math.max(av.length, bv.length);
      for (let i = 0; i < n; i++) {
        const d = (bv[i] || 0) - (av[i] || 0);
        if (d) return d;
      }
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }).map(function (model) { return model.id; });
  }
  function forgetGeminiModel(name) {
    const cache = readModelCache();
    ["text", "image", "plate"].forEach(function (slot) {
      if (cache[slot] && cache[slot].name === name) delete cache[slot];
    });
    writeModelCache(cache);
  }
  async function listGeminiModels(key) {
    const all = [];
    let pageToken = "";
    for (let n = 0; n < 6; n++) {
      let url = "https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=" + encodeURIComponent(key);
      if (pageToken) url += "&pageToken=" + encodeURIComponent(pageToken);
      const res = await fetch(url);
      if (!res.ok) {
        const err = new Error("HTTP " + res.status);
        err.status = res.status;
        throw err;
      }
      const json = await res.json();
      (json.models || []).forEach(function (model) { all.push(model); });
      pageToken = json.nextPageToken || "";
      if (!pageToken) break;
    }
    return all;
  }
  async function pickGeminiModel(key, opts) {
    opts = opts || {};
    const slot = opts.images ? "image" : "text";
    const skip = {};
    (opts.skip || []).forEach(function (name) { skip[String(name)] = true; });
    const tag = keyTag(key);
    const cache = readModelCache();
    const hit = cache[slot];
    if (hit && hit.name && hit.tag === tag && !skip[hit.name] && (Date.now() - hit.at) < MODEL_TTL) return hit.name;
    const ranked = rankGeminiModels(await listGeminiModels(key), opts).filter(function (id) { return !skip[id]; });
    if (!ranked.length) return "";
    cache[slot] = { name: ranked[0], at: Date.now(), tag: tag };
    writeModelCache(cache);
    return ranked[0];
  }
  async function pickGeminiImageModel(key, opts) {
    opts = opts || {};
    const skip = {};
    (opts.skip || []).forEach(function (name) { skip[String(name)] = true; });
    const tag = keyTag(key);
    const cache = readModelCache();
    const hit = cache.plate;
    if (hit && hit.name && hit.tag === tag && !skip[hit.name] && (Date.now() - hit.at) < MODEL_TTL) return hit.name;
    const ranked = rankGeminiImageModels(await listGeminiModels(key)).filter(function (id) { return !skip[id]; });
    if (!ranked.length) return "";
    cache.plate = { name: ranked[0], at: Date.now(), tag: tag };
    writeModelCache(cache);
    return ranked[0];
  }

  function loadCfg() {
    const injected = (root.VINOTECA_CONFIG && root.VINOTECA_CONFIG.geminiKey) || "";
    try {
      return Object.assign({
        mode: "demo",
        apiUrl: "https://www.wine-searcher.com/ws_api.php",
        apiKey: "",
        geminiKey: injected,
        geminiOn: false,
        currency: "EUR"
      }, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch (e) {
      return { mode: "demo", apiUrl: "https://www.wine-searcher.com/ws_api.php", apiKey: "", geminiKey: injected, geminiOn: false, currency: "EUR" };
    }
  }

  function saveCfg(partial) {
    const next = Object.assign(loadCfg(), partial || {});
    const stored = Object.assign({}, next);
    delete stored.geminiKeyFromWindow;
    localStorage.setItem(KEY, JSON.stringify(stored));
    return next;
  }

  function demoPrice(wine) {
    const d = (root.dossierOf && root.dossierOf(wine)) || {};
    const m = d.market || {};
    return {
      source: "demo",
      currency: "EUR",
      low: m.low || null,
      mid: m.mid || null,
      high: m.high || null,
      hint: (wine && wine.priceHint) || "",
      trend: m.trend || "",
      confianza: "baja",
      note: "Precio de dossier. No es una cotización en vivo."
    };
  }

  function parseLive(json) {
    if (!json || typeof json !== "object") return null;
    const n = (v) => {
      const x = Number(String(v == null ? "" : v).replace(/[^\d.]/g, ""));
      return Number.isFinite(x) && x > 0 ? x : null;
    };
    return {
      source: "live",
      currency: json.currency || json.currencycode || "EUR",
      low: n(json["price-min"] || json.price_min || json.min || json.low),
      mid: n(json["price-average"] || json.price_avg || json.average || json.mid),
      high: n(json["price-max"] || json.price_max || json.max || json.high),
      hint: "",
      trend: json.trend || "Cotización en vivo",
      confianza: "media",
      note: json.region ? ("Fuente live · " + json.region) : "Fuente live (Wine-Searcher u otra API documentada)."
    };
  }

  async function livePrice(wine, cfg) {
    if (!cfg.apiKey) throw new Error("Falta apiKey");
    const q = encodeURIComponent((wine.producer + " " + wine.name).trim());
    const url = cfg.apiUrl +
      (cfg.apiUrl.indexOf("?") >= 0 ? "&" : "?") +
      "api_key=" + encodeURIComponent(cfg.apiKey) +
      "&winename=" + q +
      "&vintage=" + encodeURIComponent(wine.vintage) +
      "&currencycode=" + encodeURIComponent(cfg.currency || "EUR");
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    const parsed = parseLive(json);
    if (!parsed || (!parsed.low && !parsed.mid && !parsed.high)) throw new Error("Respuesta sin precio");
    return parsed;
  }

  function emptyEstimate(msg) {
    return {
      baja: null,
      media: null,
      alta: null,
      moneda: "EUR",
      confianza: "baja",
      fuente_estimacion: msg,
      ok: false
    };
  }

  function asMoney(v) {
    const x = Number(v);
    if (!Number.isFinite(x) || x < 0) return null;
    return Math.round(x);
  }

  function readCache(id) {
    try {
      const all = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const hit = all[id];
      if (!hit || !hit.at || Date.now() - hit.at > 7 * 24 * 60 * 60 * 1000) return null;
      return hit.value;
    } catch (e) {
      return null;
    }
  }

  function writeCache(id, value) {
    try {
      const all = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      all[id] = { at: Date.now(), value: value };
      localStorage.setItem(CACHE_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  function normalizeEstimate(raw) {
    let obj = raw;
    if (typeof raw === "string") {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start < 0 || end <= start) throw new Error("JSON no encontrado");
      obj = JSON.parse(raw.slice(start, end + 1));
    }
    const confianza = ["alta", "media", "baja"].includes(obj.confianza) ? obj.confianza : "baja";
    return {
      baja: asMoney(obj.baja),
      media: asMoney(obj.media),
      alta: asMoney(obj.alta),
      moneda: "EUR",
      confianza: confianza,
      fuente_estimacion: String(obj.fuente_estimacion || "Estimación de modelo, no cotización").slice(0, 280),
      ok: true
    };
  }

  function geminiBody(nombre, anada, region) {
    const user = [
      "Estima la horquilla de precio al público en España y Europa, botella 75 cl, hoy.",
      "Vino: " + nombre,
      "Añada: " + (anada || "sin añada"),
      "Zona: " + (region || "no indicada"),
      "Si el vino o la añada no son identificables, confianza baja y horquilla amplia.",
      "No inventes una casa de subastas concreta. Cifras en euros, sin símbolo."
    ].join("\n");
    return {
      systemInstruction: {
        parts: [{
          text: "Eres un tasador de vino para una vinoteca privada en España. Conoces precios de bodega, tienda especializada y mercado secundario europeo (Wine-Searcher, Idealwine, Millésima, Lavinia, Vila Viniteca) solo como referencia de orden de magnitud. No tienes acceso a la web en esta llamada: es una estimación, no una cotización. Responde únicamente el JSON pedido. baja = suelo razonable de tienda, media = precio habitual, alta = techo de añada escasa o gran formato no aplicable (sigue siendo 75 cl). moneda siempre EUR. confianza alta solo si el vino es muy conocido y la añada está documentada; media si la casa es conocida y la añada es plausible; baja en el resto."
        }]
      },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            baja: { type: "NUMBER" },
            media: { type: "NUMBER" },
            alta: { type: "NUMBER" },
            moneda: { type: "STRING" },
            confianza: { type: "STRING", enum: ["alta", "media", "baja"] },
            fuente_estimacion: { type: "STRING" }
          },
          required: ["baja", "media", "alta", "moneda", "confianza", "fuente_estimacion"]
        }
      }
    };
  }

  async function estimarValorMercado(params, cfg) {
    cfg = cfg || loadCfg();
    const key = String((cfg && cfg.geminiKey) || "").trim();
    const nombre = String((params && params.nombre) || "").trim();
    const anada = String((params && (params.anada || params.ano)) || "").trim();
    const region = String((params && (params.region || params.tipo)) || "").trim();
    if (!key) return emptyEstimate("Sin clave Gemini. Pégala en Avisos → Precios. No va en el código.");
    if (!nombre) return emptyEstimate("Falta el nombre del vino.");

    const id = (nombre + "|" + anada + "|" + region).toLowerCase();
    const hit = readCache(id);
    if (hit) {
      hit.fuente_estimacion = (hit.fuente_estimacion || "").replace(/ · caché$/, "") + " · caché";
      return hit;
    }

    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    let last = "Gemini no disponible";
    const skip = [];
    try {
      for (let i = 0; i < 4; i++) {
        let model = "";
        try {
          model = await pickGeminiModel(key, { skip: skip });
        } catch (err) {
          if (err && err.name === "AbortError") {
            return emptyEstimate("Tiempo agotado (12 s). Sin red o Gemini lento. Se mantiene el dossier.");
          }
          const status = err && err.status;
          if (status === 401 || status === 403) return emptyEstimate("Clave Gemini rechazada (" + status + "). Revísala en Google AI Studio.");
          return emptyEstimate(status ? ("Gemini HTTP " + status) : ("Sin conexión. " + ((err && err.message) || "fetch falló")));
        }
        if (!model) { last = "ningún modelo disponible"; break; }
        const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
        let res;
        let body = geminiBody(nombre, anada, region);
        try {
          res = await fetch(url, {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": key
            },
            body: JSON.stringify(body)
          });
          if (res.status === 400 && body.generationConfig && body.generationConfig.thinkingConfig) {
            delete body.generationConfig.thinkingConfig;
            res = await fetch(url, {
              method: "POST",
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": key
              },
              body: JSON.stringify(body)
            });
          }
        } catch (err) {
          if (err && err.name === "AbortError") {
            return emptyEstimate("Tiempo agotado (12 s). Sin red o Gemini lento. Se mantiene el dossier.");
          }
          return emptyEstimate("Sin conexión. " + ((err && err.message) || "fetch falló"));
        }
        if (res.status === 429) return emptyEstimate("Cuota gratuita de Gemini agotada. Prueba más tarde; la ficha sigue con el dossier.");
        if (res.status === 401 || res.status === 403) return emptyEstimate("Clave Gemini rechazada (" + res.status + "). Revísala en Google AI Studio.");
        if (res.status === 404) {
          forgetGeminiModel(model);
          skip.push(model);
          last = "modelo no disponible (HTTP 404)";
          continue;
        }
        if (!res.ok) { last = "Gemini HTTP " + res.status; continue; }
        let json;
        try { json = await res.json(); } catch (e) { last = "Respuesta no JSON"; continue; }
        const parts = (((json.candidates || [])[0] || {}).content || {}).parts || [];
        const text = parts.map(function (p) { return p.text || ""; }).join("");
        let est;
        try { est = normalizeEstimate(text); } catch (e) { last = "No se pudo leer el JSON"; continue; }
        if (est.baja == null && est.media == null && est.alta == null) {
          return emptyEstimate("Gemini no devolvió cifras. Se mantiene el dossier.");
        }
        est.fuente_estimacion = est.fuente_estimacion + " · " + model;
        writeCache(id, est);
        return est;
      }
      return emptyEstimate(last);
    } finally {
      clearTimeout(timer);
    }
  }

  function fromEstimate(est) {
    return {
      source: est.ok ? "gemini" : "demo",
      currency: "EUR",
      low: est.baja,
      mid: est.media,
      high: est.alta,
      confianza: est.confianza,
      trend: est.fuente_estimacion,
      note: est.ok
        ? "Estimación Gemini (" + est.confianza + "). No es una cotización."
        : est.fuente_estimacion,
      estimate: est
    };
  }

  async function priceOf(wine) {
    const cfg = loadCfg();
    if (!wine) return demoPrice({ priceHint: "" });
    if (cfg.geminiOn && cfg.geminiKey) {
      const est = await estimarValorMercado({
        nombre: [wine.producer, wine.name].filter(Boolean).join(" "),
        anada: wine.vintage,
        region: wine.appellation || wine.region || ""
      }, cfg);
      if (est.ok) return fromEstimate(est);
      const fb = demoPrice(wine);
      fb.note = est.fuente_estimacion + " Horquilla del dossier.";
      fb.confianza = "baja";
      fb.estimate = est;
      return fb;
    }
    if (cfg.mode !== "live" || !cfg.apiKey) return demoPrice(wine);
    try {
      return await livePrice(wine, cfg);
    } catch (err) {
      const fallback = demoPrice(wine);
      fallback.note = "Live no disponible (" + (err.message || "error") + "). Se muestra el dossier.";
      fallback.source = "demo";
      return fallback;
    }
  }

  root.WineDataProvider = {
    loadCfg, saveCfg, priceOf, demoPrice, estimarValorMercado,
    rankGeminiModels, pickGeminiModel, rankGeminiImageModels, pickGeminiImageModel, forgetGeminiModel, listGeminiModels
  };
})(window);

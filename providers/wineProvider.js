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
  const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

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
    try {
      for (let i = 0; i < MODELS.length; i++) {
        const model = MODELS[i];
        const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
        let res;
        try {
          res = await fetch(url, {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": key
            },
            body: JSON.stringify(geminiBody(nombre, anada, region))
          });
        } catch (err) {
          if (err && err.name === "AbortError") {
            return emptyEstimate("Tiempo agotado (12 s). Sin red o Gemini lento. Se mantiene el dossier.");
          }
          return emptyEstimate("Sin conexión. " + ((err && err.message) || "fetch falló"));
        }
        if (res.status === 429) return emptyEstimate("Cuota gratuita de Gemini agotada. Prueba más tarde; la ficha sigue con el dossier.");
        if (res.status === 401 || res.status === 403) return emptyEstimate("Clave Gemini rechazada (" + res.status + "). Revísala en Google AI Studio.");
        if (res.status === 404) { last = "Modelo " + model + " no disponible en esta clave"; continue; }
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

  root.WineDataProvider = { loadCfg, saveCfg, priceOf, demoPrice, estimarValorMercado };
})(window);

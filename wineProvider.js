/* WineDataProvider
   mode "demo": precios del dossier local (sin red).
   mode "live": API documentada (Wine-Searcher wine-check u otra compatible).
   Prohibido scrapear vivino.com: Vivino no tiene API pública oficial. */
(function (root) {
  const KEY = "vinoteca-jgc-provider";

  function loadCfg() {
    try {
      return Object.assign({
        mode: "demo",
        apiUrl: "https://www.wine-searcher.com/ws_api.php",
        apiKey: "",
        currency: "EUR"
      }, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch (e) {
      return { mode: "demo", apiUrl: "https://www.wine-searcher.com/ws_api.php", apiKey: "", currency: "EUR" };
    }
  }

  function saveCfg(partial) {
    const next = Object.assign(loadCfg(), partial || {});
    localStorage.setItem(KEY, JSON.stringify(next));
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
      hint: wine.priceHint || "",
      trend: m.trend || "",
      note: "Precio de dossier. Vivino no ofrece API; esto no es una extracción automática."
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
      note: json.region ? ("Fuente en vivo · " + json.region) : "Fuente en vivo (Wine-Searcher u otra API documentada)."
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

  async function priceOf(wine) {
    const cfg = loadCfg();
    if (!wine) return demoPrice({ priceHint: "", ratings: {} });
    if (cfg.mode !== "live" || !cfg.apiKey) return demoPrice(wine);
    try {
      return await livePrice(wine, cfg);
    } catch (err) {
      const fallback = demoPrice(wine);
      fallback.note = "Modo en vivo no disponible (" + (err.message || "error") + "). Se muestra el dossier.";
      fallback.source = "demo";
      return fallback;
    }
  }

  root.WineDataProvider = { loadCfg, saveCfg, priceOf, demoPrice };
})(window);

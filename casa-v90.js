/* Puntuaciones v90: la búsqueda usa un modelo con grounding gratuito y no inventa 30 s. */
function quotaViolations(body) {
  const details = (((body || {}).error || {}).details) || [];
  const out = [];
  details.forEach(detail => {
    ((detail && detail.violations) || []).forEach(item => out.push(item || {}));
  });
  return out;
}

function classifyQuota(body) {
  const waitMs = typeof retryDelayRawMs === "function" ? retryDelayRawMs(body) : 0;
  const violations = quotaViolations(body);
  const quotaId = violations.map(item => item.quotaId || "").filter(Boolean).join(" ");
  const quotaMetric = violations.map(item => item.quotaMetric || "").filter(Boolean).join(" ");
  const blob = (quotaId + " " + quotaMetric + " " + JSON.stringify(body || {})).toLowerCase();
  const grounding = /grounding|google_search|search_grounding|searchqueries|search_queries/.test(blob);
  const minute = /perminute|per_minute|requestsperminute/.test(blob);
  const daily = /perday|per_day|requestsperday/.test(blob) || /generate_content_free_tier_requests/.test(blob);
  let kind = "other";
  if (grounding && !minute) kind = "grounding";
  else if (minute && daily) kind = waitMs > 120000 ? "day" : "minute";
  else if (minute) kind = "minute";
  else if (daily) kind = "day";
  else if (waitMs > 120000) kind = "day";
  else if (waitMs > 0 && waitMs <= 60000) kind = "minute";
  return { kind: kind, waitMs: waitMs, quotaId: quotaId, quotaMetric: quotaMetric };
}

function quotaIsDaily(body) {
  return classifyQuota(body).kind === "day";
}

function quotaReason(body) {
  const found = classifyQuota(body);
  if (found.kind === "day") return t("gemini.quotaDay", { when: nextMadridNine() });
  if (found.kind === "grounding") return t("score.grounding");
  if (found.kind === "minute" && found.waitMs > 0) {
    return t("gemini.quotaMin", { n: Math.max(1, Math.round(found.waitMs / 1000)) });
  }
  if (found.kind === "minute") return t("gemini.quotaSoon");
  return t("score.quota");
}

function groundingRejected(status, message) {
  if (status !== 400) return false;
  return /search|ground|tool|not supported|not available|unsupported/i.test(String(message || ""));
}

function interpretScoreFailure(status, body, message) {
  if (groundingRejected(status, message)) return { action: "next", kind: "model", waitMs: 0 };
  if (status !== 429) return { action: "stop", kind: "other", waitMs: 0 };
  const found = classifyQuota(body);
  if (found.kind === "minute" && found.waitMs > 0 && found.waitMs <= 30000) {
    return { action: "retry", kind: "minute", waitMs: found.waitMs };
  }
  if (found.kind === "grounding" || found.kind === "model" || found.kind === "other") {
    return { action: "next", kind: found.kind, waitMs: 0 };
  }
  if (found.kind === "minute") return { action: "next", kind: "minute", waitMs: 0 };
  return { action: "stop", kind: found.kind, waitMs: 0 };
}

function freeGroundingRank(id) {
  const name = String(id || "").replace(/^models\//, "").toLowerCase();
  if (!name || /preview|experimental|(^|[-_.])exp(\d|[-_.]|$)|image|embed|tts|live|native-audio/.test(name)) return 99;
  if (name === "gemini-2.5-flash") return 0;
  if (name.indexOf("gemini-2.5-flash-lite") === 0) return 1;
  if (name.indexOf("gemini-2.0-flash") === 0) return 2;
  if (/^gemini-2\.5-flash(-\d|$)/.test(name)) return 3;
  return 99;
}

function freeGroundingModels(ids) {
  const seen = {};
  return (ids || []).map(id => String(id || "").replace(/^models\//, "")).filter(id => {
    if (!id || seen[id] || freeGroundingRank(id) >= 99) return false;
    seen[id] = true;
    return true;
  }).sort((a, b) => freeGroundingRank(a) - freeGroundingRank(b) || (a < b ? -1 : 1));
}

function groundingToolFor(model) {
  const name = String(model || "").toLowerCase();
  if (/gemini-1\./.test(name)) return { google_search_retrieval: {} };
  return { google_search: {} };
}

function categoryOnlyName(name) {
  const text = String(name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b(19|20)\d{2}\b/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
  return /^(crianza|reserva|gran reserva|roble|joven|brut|brut nature|reserva especial|guarda superior)$/.test(text);
}

function rememberedParts(wine) {
  const prov = (wine && wine.provenance) || {};
  let text = String(prov.originalTitle || prov.rawTitle || "").trim();
  if (!text && wine && typeof state !== "undefined" && state && Array.isArray(state.bottles)) {
    const bottle = state.bottles.find(item => item && item.wineId === wine.id && /Nombre original:/.test(String(item.note || "")));
    if (bottle) {
      const line = String(bottle.note).split(/\n/).find(row => row.indexOf("Nombre original:") >= 0) || "";
      text = line.replace(/^.*Nombre original:\s*/, "").trim();
    }
  }
  return text.split(/\s*[·|]\s*/).map(part => part.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function nameWithoutYear(name, year) {
  const text = String(name || "").replace(/\s+/g, " ").trim();
  if (!year) return text;
  return text.replace(new RegExp("\\s+" + year + "\\s*$"), "").trim();
}

function fichaTitles(w) {
  const wine = w || {};
  const clip = typeof sheetTitle === "function" ? sheetTitle : function (value) { return String(value || "").replace(/\s+/g, " ").trim(); };
  const year = typeof shownYear === "function" ? String(shownYear(wine) || "") : (wine.vintage ? String(wine.vintage) : "");
  let producer = clip(wine.producer || "");
  let name = clip(nameWithoutYear(wine.name, year));
  const parts = rememberedParts(wine);
  if ((!producer || categoryOnlyName(producer)) && parts[0] && !categoryOnlyName(nameWithoutYear(parts[0], year))) {
    producer = clip(nameWithoutYear(parts[0], year));
  }
  if (producer && categoryOnlyName(producer)) producer = "";
  if (!name || categoryOnlyName(name)) {
    const better = parts.map(part => clip(nameWithoutYear(part, year))).filter(part => part && !categoryOnlyName(part) && part !== producer).pop();
    if (better) name = better;
  }
  const head = producer || name || year;
  let sub = "";
  if (name && name !== head) sub = (name + (year ? " " + year : "")).trim();
  else if (year && year !== head) sub = year;
  if (sub === head) sub = "";
  return { head: head, sub: sub };
}

function plainScoreUrl(item) {
  const url = String(item && item.url || "").trim();
  if (!/^https:\/\//i.test(url)) return "";
  if (typeof isShopUrl === "function" && isShopUrl(url)) return "";
  return url;
}

function setScoreNote(text) {
  const note = typeof document !== "undefined" ? document.getElementById("score-note") : null;
  if (note) note.textContent = text || "";
}

async function waitScoreRetry(ms) {
  const btn = typeof document !== "undefined" ? document.getElementById("score-search") : null;
  const started = Date.now();
  while (Date.now() - started < ms) {
    const left = Math.max(1, Math.ceil((ms - (Date.now() - started)) / 1000));
    if (btn) btn.textContent = t("score.wait", { n: left });
    await new Promise(resolve => setTimeout(resolve, Math.min(250, ms - (Date.now() - started))));
  }
  if (btn) btn.textContent = t("score.search");
}

function scoreModelFallback() {
  if (typeof geminiModelsFor === "function") return geminiModelsFor("ground");
  return ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
}

async function listScoreModels(key) {
  const provider = window.WineDataProvider;
  if (!provider || !provider.listGeminiModels) return scoreModelFallback();
  try {
    const models = await provider.listGeminiModels(key);
    const ids = (models || []).map(model => String((model && (model.name || model)) || "").replace(/^models\//, ""));
    const catalog = typeof geminiModelsFor === "function" ? geminiModelsFor("ground").filter(id => ids.indexOf(id) >= 0) : [];
    const ranked = catalog.length ? catalog : freeGroundingModels(ids);
    return ranked.length ? ranked : scoreModelFallback();
  } catch (err) {
    const status = err && err.status;
    if (status === 401 || status === 403 || status === 400) throw err;
    return scoreModelFallback();
  }
}

async function postScore(key, model, prompt, signal, tool) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
  const generationConfig = { temperature: 0.2, maxOutputTokens: 2048 };
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: generationConfig
  };
  if (tool) payload.tools = [tool];
  return fetch(url, {
    method: "POST",
    signal: signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(payload)
  });
}

async function readScoreResponse(res) {
  let body = {};
  try { body = await res.json(); } catch (err) { body = {}; }
  const message = typeof geminiErrorText === "function" ? geminiErrorText(body) : "";
  return { body: body, message: message, json: res.ok ? body : null };
}

async function fetchScoreReading(key, prompt) {
  const models = (await listScoreModels(key)).slice(0, 2);
  let last = { parsed: null, raw: null, reason: t("score.quota"), kind: "other", model: "", grounded: false };
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    let retried = false;
    for (let hop = 0; hop < 2; hop++) {
      let res;
      try {
        res = await postScore(key, model, prompt, null, groundingToolFor(model));
      } catch (err) {
        return { parsed: null, raw: null, reason: typeof geminiReasonFrom === "function" ? geminiReasonFrom(0, "", null, err) : t("score.quota"), kind: "network", model: model, grounded: false, stop: true };
      }
      if (res.status === 404) { last = { parsed: null, raw: null, reason: t("score.model"), kind: "model", model: model, grounded: false }; break; }
      if (res.ok) {
        const json = await res.json();
        const parsed = typeof extractJsonObject === "function" ? extractJsonObject(typeof geminiPartsText === "function" ? geminiPartsText(json) : "") : null;
        return { parsed: parsed, raw: json, reason: "", kind: "", model: model, grounded: true };
      }
      const fail = await readScoreResponse(res);
      const step = interpretScoreFailure(res.status, fail.body, fail.message);
      last = { parsed: null, raw: null, reason: res.status === 429 ? quotaReason(fail.body) : (step.kind === "model" ? t("score.model") : (fail.message || t("score.quota"))), kind: step.kind, model: model, grounded: false, stop: step.action === "stop" };
      if (step.action === "retry" && !retried) {
        retried = true;
        await waitScoreRetry(step.waitMs);
        continue;
      }
      if (step.action === "next" || step.action === "retry") break;
      return last;
    }
  }
  if (last.kind === "day" || last.kind === "minute") return last;
  const plain = models[0] || "gemini-2.5-flash";
  try {
    const res = await postScore(key, plain, prompt, null, null);
    if (!res.ok) {
      const fail = await readScoreResponse(res);
      if (res.status === 429) return { parsed: null, raw: null, reason: quotaReason(fail.body), kind: classifyQuota(fail.body).kind, model: plain, grounded: false, stop: true };
      return last;
    }
    const json = await res.json();
    const parsed = typeof extractJsonObject === "function" ? extractJsonObject(typeof geminiPartsText === "function" ? geminiPartsText(json) : "") : null;
    return { parsed: parsed, raw: json, reason: t("score.noGrounding"), kind: "ungrounded", model: plain, grounded: false, ungrounded: true };
  } catch (err) {
    return last;
  }
}

async function geminiSearchScores(key, prompt) {
  try {
    return await fetchScoreReading(key, prompt);
  } catch (err) {
    const status = err && err.status;
    const reason = status === 401 || status === 403 ? ("clave rechazada (HTTP " + status + ")") : (status ? ("HTTP " + status) : "red o CORS");
    return { parsed: null, raw: null, reason: reason, fatal: true, model: "", grounded: false, stop: true };
  }
}

async function searchPublishedScores(wineId, quiet) {
  if (scoreSearchBusy) return;
  const w = wineById(wineId);
  if (!w) return;
  const key = storedGeminiKey();
  if (!key) { if (!quiet) toast(t("score.needKey")); return; }
  scoreSearchBusy = true;
  const btn = typeof document !== "undefined" ? document.getElementById("score-search") : null;
  if (btn) btn.disabled = true;
  if (!quiet) {
    toast(t("score.searching"));
    setScoreNote(t("score.searching"));
  }
  const known = [w.producer, w.name, w.vintage, w.appellation, w.region, w.country].filter(Boolean).join(" · ");
  const prompt = [
    "Busca puntuaciones publicadas de este vino en bodegas, Guía Peñín, Wine Spectator, Decanter, Vivino, Robert Parker o tiendas que citen la cifra.",
    "Responde solo JSON: {\"scores\":[{\"guide\":\"parker|penin|spectator|decanter|vivino\",\"score\":97,\"source\":\"nombre de la guía\",\"url\":\"https://...\"}]}",
    "No incluyas una puntuación si no tienes una URL https de la página que cita ese número.",
    "No inventes cifras. Si no hay fuente, omite esa guía.",
    "Vino: " + known
  ].join("\n");
  let outcome;
  try { outcome = await geminiSearchScores(key, prompt); }
  finally {
    scoreSearchBusy = false;
    if (btn) {
      btn.disabled = false;
      btn.textContent = t("score.search");
    }
  }
  const chunks = typeof groundingChunksOf === "function" ? groundingChunksOf(outcome && outcome.raw) : [];
  const rows = outcome && outcome.parsed && Array.isArray(outcome.parsed.scores) ? outcome.parsed.scores : [];
  const grounded = !!(outcome && outcome.grounded && chunks.some(chunk => chunk && chunk.uri));
  if (!rows.length || (!grounded && !(outcome && outcome.ungrounded))) {
    if (!quiet) {
      const reason = (outcome && outcome.reason) || t("score.noneFound");
      toast(reason);
      setScoreNote(reason);
    }
    return;
  }
  state.wineEdits = state.wineEdits || {};
  const edit = state.wineEdits[w.id] || {};
  edit.ratings = Object.assign({}, edit.ratings || {});
  let saved = 0;
  rows.forEach(item => {
    const guide = canonScoreGuide(item && (item.guide || item.source));
    if (!guide) return;
    const cited = grounded ? citedScoreUrl(item, chunks, outcome.raw) : plainScoreUrl(item);
    if (!cited) return;
    const current = publishedScore(w, guide);
    if (scoreBlockLocked(current) || scoreBlockLocked(edit.ratings[guide])) return;
    const max = guide === "vivino" ? 5 : 100;
    const score = Number(String(item.score == null ? "" : item.score).replace(",", "."));
    if (!(score > 0 && score <= max)) return;
    edit.ratings[guide] = {
      score: guide === "vivino" ? Math.round(score * 10) / 10 : Math.round(score),
      scale: max,
      source: String(item.source || "").trim(),
      url: cited,
      origin: "web",
      by: "web",
      manual: false,
      estimate: false,
      note: ""
    };
    saved++;
  });
  if (!saved) {
    if (!quiet) {
      const reason = (outcome && outcome.ungrounded) ? t("score.noGrounding") : ((outcome && outcome.reason) || t("score.noneFound"));
      toast(reason);
      setScoreNote(reason);
    }
    return;
  }
  state.wineEdits[w.id] = edit;
  const custom = (state.customWines || []).find(wine => wine && wine.id === w.id);
  if (custom) custom.ratings = Object.assign({}, custom.ratings || {}, edit.ratings);
  save();
  if (quiet) return;
  if (outcome && outcome.ungrounded) setScoreNote(t("score.noGrounding"));
  toast(outcome && outcome.ungrounded ? t("score.noGrounding") : t("score.savedWeb"));
  openWine(w.id, currentBottle);
  openRatingsList();
}

/* La búsqueda de puntuaciones no inventa un límite de 30 s y no usa un modelo sin grounding gratuito. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

function extractFunction(src, name) {
  const start = src.indexOf("function " + name);
  if (start < 0) throw new Error("falta " + name);
  let i = src.indexOf("{", start);
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("sin cierre " + name);
}

const root = path.join(__dirname, "..");
const v90 = fs.readFileSync(path.join(root, "casa-v90.js"), "utf8");
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");
const ficha = fs.readFileSync(path.join(root, "casa-ficha.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const util = fs.readFileSync(path.join(root, "casa-util.js"), "utf8");
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.ok(!v90.includes("|| 30000"));
assert.ok(extractFunction(v90, "fetchScoreReading").includes("slice(0, 2)"));
assert.ok(extractFunction(v90, "fetchScoreReading").includes("postScore(key, plain, prompt, null, null)"));
assert.ok(html.includes("casa-v90.js?v=105"));
assert.ok(html.indexOf("casa-v90.js?v=105") < html.indexOf("app.js?v=105"));
assert.ok(html.indexOf("casa-v89.js?v=105") < html.indexOf("casa-v90.js?v=105"));
assert.ok(app.includes('APP_VERSION = "v105"'));
assert.ok(sw.includes('"casa-llavaneras-ios-v105"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v105"'));
assert.ok(sw.includes('const VERSION = "v105"'));
assert.ok(sw.includes("./casa-v90.js"));
assert.ok(!html.includes("?v=90"));
assert.ok(!html.includes("?v=89"));

["score.grounding", "score.noGrounding", "score.quota", "score.wait", "score.model", "gemini.quotaSoon"].forEach(key => {
  const line = i18n.split("\n").find(row => row.indexOf('["' + key + '"') >= 0);
  assert.ok(line, key);
  assert.strictEqual(line.split('", "').length, 6, key);
});
const none = i18n.split("\n").find(row => row.indexOf('["score.noneLine"') >= 0);
assert.ok(none);
assert.ok(!/Buscar|Cercar|Search|Chercher|Procurar/.test(none));

const sub = extractFunction(ficha, "ratingsSubHtml");
const home = extractFunction(ficha, "ratingsHomeHtml");
assert.ok(sub.indexOf("scoreActionRow(w)") < sub.indexOf("scoreUi.form"));
assert.ok(sub.includes("scoreUi.form ? manualScoreForm(w) : \"\""));
assert.ok(!sub.includes("searchPublishedScores"));
assert.ok(!home.includes("searchPublishedScores"));
assert.ok(home.includes('<p class="muted" style="margin:0 0 12px">${escHtml(t("score.noneLine"))}</p>'));
assert.ok(extractFunction(ficha, "scoreActionRow").includes('id="score-search"'));
assert.ok(ficha.includes("fichaTitles"));

const COPY = {
  "gemini.quotaMin": "Límite por minuto. Vuelve a intentarlo en {n} s.",
  "gemini.quotaDay": "Cuota del día agotada. Vuelve a las 9:00, hora de Madrid ({when}).",
  "gemini.quotaSoon": "Límite por minuto. Vuelve a intentarlo enseguida.",
  "score.grounding": "Este modelo no incluye la búsqueda de Google en el plan gratuito.",
  "score.noGrounding": "Sin búsqueda de Google en el plan gratuito. Solo guardo puntuaciones que traen una página.",
  "score.quota": "Gemini ha rechazado la búsqueda y no ha dicho cuántos segundos hay que esperar.",
  "score.wait": "Espera {n} s",
  "score.search": "Buscar puntuaciones",
  "score.model": "Este modelo no admite la búsqueda.",
  "score.searching": "Buscando puntuaciones…",
  "score.savedWeb": "Puntuaciones guardadas desde la web.",
  "score.noneFound": "No he encontrado puntuaciones publicadas.",
  "score.needKey": "Hace falta la clave de Gemini."
};
function t(key, vars) {
  let text = COPY[key] || key;
  Object.keys(vars || {}).forEach(name => { text = text.replace("{" + name + "}", vars[name]); });
  return text;
}
function nextMadridNine() { return "19 oct · 9:00"; }
function yearNow() { return 2026; }
function shownYear(w) {
  const y = Number(w && w.vintage);
  return y >= 1950 && y <= yearNow() + 1 ? String(y) : "";
}
function sheetTitle(text) { return String(text || "").replace(/\s+/g, " ").trim(); }

eval(extractFunction(gemini, "retryDelayRawMs"));
eval(extractFunction(gemini, "geminiPartsText"));
eval(extractFunction(gemini, "stripJsonFences"));
eval(extractFunction(gemini, "repairJsonObject"));
eval(extractFunction(gemini, "extractJsonObject"));
eval(extractFunction(util, "normTxt"));
eval(extractFunction(gemini, "canonScoreGuide"));
eval(extractFunction(gemini, "groundingChunksOf"));
eval(extractFunction(gemini, "hostOfUrl"));
eval(extractFunction(gemini, "citedScoreUrl"));
eval(extractFunction(vino, "isShopUrl"));
eval(v90);

const minuteBody = {
  error: {
    code: 429,
    message: "Resource has been exhausted (e.g. check quota).",
    status: "RESOURCE_EXHAUSTED",
    details: [
      {
        "@type": "type.googleapis.com/google.rpc.QuotaFailure",
        violations: [{
          quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests",
          quotaId: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier",
          quotaDimensions: { model: "gemini-2.5-flash" }
        }]
      },
      { "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay: "12s" }
    ]
  }
};
const dayBody = {
  error: {
    code: 429,
    message: "Resource has been exhausted (e.g. check quota).",
    status: "RESOURCE_EXHAUSTED",
    details: [{
      "@type": "type.googleapis.com/google.rpc.QuotaFailure",
      violations: [{
        quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests",
        quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier",
        quotaValue: "20"
      }]
    }]
  }
};
const groundingBody = {
  error: {
    code: 429,
    message: "Resource has been exhausted (e.g. check quota).",
    status: "RESOURCE_EXHAUSTED",
    details: [{
      "@type": "type.googleapis.com/google.rpc.QuotaFailure",
      violations: [{
        quotaMetric: "generativelanguage.googleapis.com/generate_content_google_search_grounding_free_tier_requests",
        quotaId: "GenerateContentGoogleSearchGroundingRequestsPerDayPerProjectPerModel-FreeTier"
      }]
    }]
  }
};
const bareBody = {
  error: {
    code: 429,
    message: "Resource exhausted.",
    status: "RESOURCE_EXHAUSTED",
    details: [{ "@type": "type.googleapis.com/google.rpc.Help", links: [{ description: "Learn more", url: "https://cloud.google.com/vertex-ai/generative-ai/docs/error-code-429" }] }]
  }
};

const minute = classifyQuota(minuteBody);
assert.strictEqual(minute.kind, "minute");
assert.strictEqual(minute.waitMs, 12000);
assert.ok(quotaReason(minuteBody).includes("12"));
assert.ok(!quotaReason(minuteBody).includes("30"));
assert.strictEqual(quotaIsDaily(minuteBody), false);
assert.deepStrictEqual(interpretScoreFailure(429, minuteBody, minuteBody.error.message).action, "retry");

const day = classifyQuota(dayBody);
assert.strictEqual(day.kind, "day");
assert.ok(quotaReason(dayBody).includes("Cuota del día"));
assert.ok(!quotaReason(dayBody).includes("30"));
assert.strictEqual(interpretScoreFailure(429, dayBody, dayBody.error.message).action, "stop");

const grounding = classifyQuota(groundingBody);
assert.strictEqual(grounding.kind, "grounding");
assert.strictEqual(quotaReason(groundingBody), COPY["score.grounding"]);
assert.strictEqual(interpretScoreFailure(429, groundingBody, groundingBody.error.message).action, "next");

const bare = classifyQuota(bareBody);
assert.strictEqual(bare.kind, "other");
assert.strictEqual(bare.waitMs, 0);
assert.ok(!quotaReason(bareBody).includes("30"));
assert.strictEqual(interpretScoreFailure(429, bareBody, bareBody.error.message).action, "next");

const unsupported = interpretScoreFailure(400, { error: { message: "google_search is not supported for this model" } }, "google_search is not supported for this model");
assert.strictEqual(unsupported.action, "next");
assert.strictEqual(unsupported.kind, "model");

assert.deepStrictEqual(
  freeGroundingModels(["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-2.5-flash-preview"]),
  ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
);
assert.ok(groundingToolFor("gemini-2.5-flash").google_search);
assert.ok(!groundingToolFor("gemini-2.5-flash").google_search_retrieval);
assert.ok(groundingToolFor("gemini-1.5-flash").google_search_retrieval);

const titled = fichaTitles({ producer: "Bodegas Faustino", name: "Crianza", vintage: 2020 });
assert.strictEqual(titled.head, "Bodegas Faustino");
assert.strictEqual(titled.sub, "Crianza 2020");
const doubled = fichaTitles({ producer: "Bodegas Faustino", name: "Crianza 2020", vintage: 2020 });
assert.strictEqual(doubled.sub, "Crianza 2020");
const recovered = fichaTitles({
  producer: "",
  name: "Crianza",
  vintage: 2020,
  provenance: { originalTitle: "Bodegas Faustino · Gran Faustino" }
});
assert.strictEqual(recovered.head, "Bodegas Faustino");
assert.strictEqual(recovered.sub, "Gran Faustino 2020");
const fromNote = fichaTitles({ id: "c1", producer: "Crianza", name: "Crianza", vintage: 2020 });
state = { bottles: [{ wineId: "c1", note: "Nombre original: Bodegas Faustino · Crianza" }] };
assert.strictEqual(fichaTitles({ id: "c1", producer: "", name: "Crianza", vintage: 2020 }).head, "Bodegas Faustino");
assert.strictEqual(fromNote.head, "Crianza");

var scoreSearchBusy = false;
var currentBottle = null;
var toasts = [];
var notes = [];
var wine = { id: "crianza-2020", name: "Crianza", producer: "Bodegas Faustino", vintage: 2020, ratings: {} };
function wineById() { return wine; }
function storedGeminiKey() { return "AIzaTESTKEYV90NOTREAL0001"; }
function toast(msg) { toasts.push(msg); }
function save() {}
function openWine() {}
function openRatingsList() {}
function publishedScore() { return null; }
function scoreBlockLocked() { return false; }
const waits = [];
const realWait = waitScoreRetry;
waitScoreRetry = async function (ms) { waits.push(ms); };

const listed = [
  { name: "models/gemini-3.5-flash-lite" },
  { name: "models/gemini-2.5-flash" },
  { name: "models/gemini-2.5-flash-lite" },
  { name: "models/gemini-2.5-pro" }
];
global.window = { WineDataProvider: { listGeminiModels: async () => listed } };
const calls = [];
function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status: status,
    json: async () => body
  };
}
function okScore(url, grounded) {
  const candidate = {
    content: { parts: [{ text: JSON.stringify({ scores: [{ guide: "parker", score: 95, source: "Robert Parker", url: url }] }) }] }
  };
  if (grounded) candidate.groundingMetadata = { groundingChunks: [{ web: { uri: url, title: "Parker" } }] };
  return { candidates: [candidate] };
}
global.fetch = async function (url, opts) {
  const payload = JSON.parse(opts.body);
  calls.push({ url: url, tools: payload.tools || null, mime: payload.generationConfig && payload.generationConfig.responseMimeType || "" });
  const queue = global.fetch.queue || [];
  const next = queue.shift() || jsonResponse(500, {});
  return next;
};

(async () => {
  calls.length = 0;
  waits.length = 0;
  global.fetch.queue = [jsonResponse(429, groundingBody), jsonResponse(200, okScore("https://revista.example/faustino", true))];
  const hopped = await fetchScoreReading("clave-de-prueba-v90", "prompt");
  assert.strictEqual(hopped.grounded, true);
  assert.strictEqual(hopped.model, "gemini-2.5-flash-lite");
  assert.strictEqual(calls.length, 2);
  assert.ok(calls.every(call => call.url.indexOf("gemini-3.5-flash-lite") < 0));
  assert.ok(calls.every(call => call.url.indexOf("gemini-2.5-pro") < 0));
  assert.ok(calls[0].url.indexOf("gemini-2.5-flash:") >= 0);
  assert.deepStrictEqual(calls[0].tools, [{ google_search: {} }]);
  assert.ok(calls.every(call => !call.mime));

  calls.length = 0;
  waits.length = 0;
  global.fetch.queue = [jsonResponse(429, minuteBody), jsonResponse(200, okScore("https://revista.example/faustino", true))];
  const retried = await fetchScoreReading("clave-de-prueba-v90", "prompt");
  assert.strictEqual(retried.grounded, true);
  assert.strictEqual(retried.model, "gemini-2.5-flash");
  assert.deepStrictEqual(waits, [12000]);
  assert.strictEqual(calls.length, 2);
  assert.ok(calls.every(call => call.url.indexOf("gemini-2.5-flash:") >= 0));

  calls.length = 0;
  global.fetch.queue = [jsonResponse(429, dayBody), jsonResponse(200, okScore("https://revista.example/faustino", true))];
  const stopped = await fetchScoreReading("clave-de-prueba-v90", "prompt");
  assert.strictEqual(stopped.kind, "day");
  assert.strictEqual(calls.length, 1);
  assert.ok(stopped.reason.includes("Cuota del día"));

  calls.length = 0;
  global.fetch.queue = [
    jsonResponse(429, bareBody),
    jsonResponse(429, bareBody),
    jsonResponse(200, {
      candidates: [{
        content: { parts: [{ text: JSON.stringify({ scores: [
          { guide: "parker", score: 95, source: "Robert Parker", url: "https://revista.example/faustino" },
          { guide: "spectator", score: 93, source: "Vinissimus", url: "https://www.vinissimus.com/faustino" },
          { guide: "decanter", score: 91, source: "Decanter", url: "" }
        ] }) }] }
      }]
    })
  ];
  wine = { id: "crianza-2020", name: "Crianza", producer: "Bodegas Faustino", vintage: 2020, ratings: {} };
  state = { wineEdits: {}, customWines: [wine], bottles: [] };
  toasts.length = 0;
  notes.length = 0;
  scoreSearchBusy = false;
  const setNote = setScoreNote;
  setScoreNote = function (text) { notes.push(text); setNote(text); };
  await searchPublishedScores(wine.id, false);
  assert.strictEqual(calls.length, 3);
  assert.strictEqual(calls[2].tools, null);
  assert.strictEqual(wine.ratings.parker.score, 95);
  assert.strictEqual(wine.ratings.parker.origin, "web");
  assert.strictEqual(wine.ratings.parker.url, "https://revista.example/faustino");
  assert.ok(!wine.ratings.spectator);
  assert.ok(!wine.ratings.decanter);
  assert.ok(toasts.indexOf(COPY["score.noGrounding"]) >= 0);
  assert.ok(notes.indexOf(COPY["score.noGrounding"]) >= 0);

  const seen = [];
  const btn = { disabled: false };
  Object.defineProperty(btn, "textContent", {
    set(value) { seen.push(value); },
    get() { return seen[seen.length - 1] || ""; }
  });
  global.document = { getElementById: id => id === "score-search" ? btn : null };
  waitScoreRetry = realWait;
  await waitScoreRetry(350);
  assert.ok(seen.some(text => text.indexOf("Espera") === 0));
  assert.strictEqual(seen[seen.length - 1], "Buscar puntuaciones");

  console.log("v90-scores ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

/* v94: un 404 en el primer modelo pasa al siguiente y la ficha no enseña el HTTP. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

function extractFunction(src, name) {
  const token = "function " + name;
  const at = src.indexOf(token);
  if (at < 0) throw new Error("falta " + name);
  let start = at;
  if (src.slice(Math.max(0, at - 6), at) === "async ") start = at - 6;
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
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");

assert.ok(app.includes('APP_VERSION = "v103"'));
assert.ok(html.includes('content="v103"'));
assert.ok(html.includes("casa-alta.js?v=103"));
assert.ok(sw.includes('const CACHE = "casa-llavaneras-ios-v103"'));
assert.ok(sw.includes('const VERSION = "v103"'));
assert.ok(gemini.indexOf('id: "gemini-3.5-flash-lite", read: true') >= 0);
assert.ok(gemini.indexOf('id: "gemini-3.5-flash-lite"') < gemini.indexOf('id: "gemini-2.5-flash", read: true'));
assert.ok(gemini.includes("ground: false"));
assert.ok(gemini.includes("function geminiGenerateUrl"));
assert.ok(extractFunction(gemini, "geminiGenerateRun").includes("geminiGenerateUrl(model)"));
assert.ok(extractFunction(gemini, "geminiGrounded").includes("geminiGenerateUrl(model)"));
assert.ok(extractFunction(gemini, "geminiGenerateRun").includes("x-goog-api-key"));
assert.strictEqual(extractFunction(gemini, "geminiGenerate").includes("async function geminiGenerate(key, model, prompt, schema, signal, maxOutputTokens, extraParts)") || gemini.includes("async function geminiGenerate(key, model, prompt, schema, signal, maxOutputTokens, extraParts)"), true);
assert.ok(extractFunction(alta, "postWineReading").includes("geminiGenerate(key, model, prompt, schema, signal, 2048, parts)"));
assert.ok(extractFunction(alta, "postWineSearch").includes("geminiGrounded(key, model, prompt, signal)"));
assert.ok(extractFunction(alta, "postWineSearch").includes('geminiTryModels(key, "ground"'));
assert.ok(alta.includes("quietWineSearch"));
const line = i18n.split("\n").find(row => row.indexOf('["alta.noModel"') >= 0);
assert.ok(line);
assert.strictEqual(line.split('", "').length, 6);
assert.ok(!/HTTP|404/.test(line));

const blockStart = gemini.indexOf("const GEMINI_MODELS");
const blockEnd = gemini.indexOf("async function geminiWithModel");
eval(gemini.slice(blockStart, blockEnd));
global.geminiTryModels = geminiTryModels;
global.geminiModelsFor = geminiModelsFor;
global.geminiGenerateUrl = geminiGenerateUrl;
global.listGeminiModelsOnce = listGeminiModelsOnce;

assert.strictEqual(
  geminiGenerateUrl("models/gemini-3.5-flash-lite"),
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
);
assert.deepStrictEqual(geminiModelsFor("read")[0], "gemini-3.5-flash-lite");
assert.ok(geminiModelsFor("ground").indexOf("gemini-3.5-flash-lite") < 0);
assert.deepStrictEqual(geminiModelsFor("ground")[0], "gemini-2.5-flash");

const store = {};
global.localStorage = {
  getItem: key => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
  setItem: (key, value) => { store[key] = String(value); }
};
let listHits = 0;
global.fetch = async url => {
  listHits += 1;
  assert.ok(String(url).indexOf("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100") === 0);
  return {
    ok: true,
    status: 200,
    json: async () => ({
      models: [
        { name: "models/gemini-3.5-flash-lite" },
        { name: "models/gemini-2.5-flash" },
        { name: "models/gemini-2.5-pro" },
        { name: "models/gemini-2.0-flash" }
      ]
    })
  };
};

const zoneSrc = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8").split("\n").slice(1, 125).join("\n");
const ZONES = new Function(zoneSrc + "\nreturn ZONES;")();
eval(fs.readFileSync(path.join(root, "bodegas.js"), "utf8"));

const api = new Function("ZONES", "WINERY_CARDS", "foldWinery", [
  extractFunction(alta, "blankWineSheet"),
  extractFunction(alta, "foldAlta"),
  extractFunction(alta, "phraseHit"),
  extractFunction(alta, "altaLabels"),
  extractFunction(alta, "wineTitleLabels"),
  extractFunction(alta, "matchLocalAssets"),
  extractFunction(alta, "genericRegion"),
  extractFunction(alta, "samePlace"),
  extractFunction(alta, "zoneRecord"),
  extractFunction(alta, "placeForSheet"),
  extractFunction(alta, "wineReadingSchema"),
  extractFunction(alta, "sheetFromParsed"),
  extractFunction(alta, "missingIdentity"),
  extractFunction(alta, "citedUri"),
  extractFunction(alta, "fillEmptySheet"),
  extractFunction(alta, "readingFailureKind"),
  extractFunction(alta, "postWineReading"),
  extractFunction(alta, "postWineSearch"),
  extractFunction(alta, "quietWineSearch"),
  extractFunction(alta, "analyzeAndEnrichWine"),
  "return { analyzeAndEnrichWine };"
].join("\n"));
const mod = api(ZONES, WINERY_CARDS, foldWinery);

(async () => {
  const first = await listGeminiModelsOnce("clave-gratuita-v94-000000");
  const second = await listGeminiModelsOnce("clave-gratuita-v94-000000");
  assert.strictEqual(listHits, 1);
  assert.ok(first.indexOf("gemini-3.5-flash-lite") >= 0);
  assert.deepStrictEqual(second, first);

  const readModels = await geminiModelsForKey("clave-gratuita-v94-000000", "read");
  const groundModels = await geminiModelsForKey("clave-gratuita-v94-000000", "ground");
  assert.strictEqual(listHits, 1);
  assert.deepStrictEqual(readModels, ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-2.0-flash"]);
  assert.deepStrictEqual(groundModels, ["gemini-2.5-flash", "gemini-2.0-flash"]);

  const tried = [];
  const hopped = await geminiTryModels("clave-gratuita-v94-000000", "read", async model => {
    tried.push(model);
    if (tried.length === 1) return { parsed: null, reason: "modelo no disponible (HTTP 404)", skipModel: true, model: model };
    return { parsed: { name: "Finca Garbet", vintage: "2018", region: "Empordà", winery: "Perelada" }, model: model };
  });
  assert.deepStrictEqual(tried, ["gemini-3.5-flash-lite", "gemini-2.5-flash"]);
  assert.strictEqual(hopped.parsed.name, "Finca Garbet");
  assert.ok(!/HTTP|404/.test(JSON.stringify(hopped.parsed)));

  const missed = await geminiTryModels("clave-gratuita-v94-000000", "read", async () => {
    return { parsed: null, reason: "modelo no disponible (HTTP 404)", skipModel: true };
  });
  assert.strictEqual(missed.parsed, null);
  assert.ok(missed.reason.indexOf("Ningún modelo") >= 0);
  assert.ok(!/HTTP|404/.test(missed.reason));

  const jpeg = "data:image/jpeg;base64," + "A".repeat(80);
  global.storedGeminiKey = () => "clave-gratuita-v94-000000";
  global.imagePart = () => ({ inlineData: { mimeType: "image/jpeg", data: "abc" } });
  global.shouldUseOfflineRead = () => false;
  Object.defineProperty(navigator, "onLine", { configurable: true, get: () => true });
  const seen = [];
  global.geminiGenerate = async (key, model) => {
    seen.push(model);
    if (model === "gemini-3.5-flash-lite") return { parsed: null, reason: "modelo no disponible (HTTP 404)", skipModel: true, model: model };
    return { parsed: { name: "Finca Garbet", vintage: "2018", region: "Empordà", winery: "", grapes: "Garnacha" }, model: model };
  };
  global.geminiGrounded = async () => ({ parsed: null, reason: "modelo no disponible (HTTP 404)", skipModel: true });
  const draft = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(draft.ok, true);
  assert.strictEqual(draft.failure, "");
  assert.strictEqual(draft.sheet.name, "Finca Garbet");
  assert.strictEqual(draft.sheet.winery, "");
  assert.strictEqual(draft.sheet.grapes, "Garnacha");
  assert.deepStrictEqual(seen, ["gemini-3.5-flash-lite", "gemini-2.5-flash"]);
  assert.ok(!/HTTP|404|Sin dato/.test(JSON.stringify(draft)));
  console.log("v94 modelos ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

/* Alta v94: fototeca, Gemini, catálogo, borrador y confirmación. */
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
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const v92 = fs.readFileSync(path.join(root, "casa-v92.js"), "utf8");

assert.ok(app.includes('APP_VERSION = "v104"'));
assert.ok(html.includes('content="v104"'));
assert.ok(html.includes("casa-alta.js?v=104"));
assert.ok(html.indexOf("casa-v92.js?v=104") < html.indexOf("casa-alta.js?v=104"));
assert.ok(html.indexOf("casa-alta.js?v=104") < html.indexOf("app.js?v=104"));
assert.ok(sw.includes("./casa-alta.js"));
assert.ok(sw.includes('const CACHE = "casa-llavaneras-ios-v104"'));
assert.ok(sw.includes('const VERSION = "v104"'));
assert.ok(fs.existsSync(path.join(root, "docs/alta-v93.md")));
assert.ok(fs.existsSync(path.join(root, "archivo/app hoy.js")));

const cam = html.slice(html.indexOf('id="scan-file-cam"'), html.indexOf('id="scan-file-lib"'));
const lib = html.slice(html.indexOf('id="scan-file-lib"'), html.indexOf('id="scan-file"'));
assert.ok(cam.includes('capture="environment"'));
assert.ok(lib.includes('accept="image/*"'));
assert.ok(!lib.includes("capture"));
assert.ok(alta.includes('id="alta-cam"'));
assert.ok(alta.includes('id="alta-lib"'));
assert.ok(alta.includes('id="alta-skip-back"'));
assert.ok(alta.includes('lib.removeAttribute("capture")'));
assert.ok(alta.includes('cam.setAttribute("capture", "environment")'));
assert.ok(alta.includes('app.classList.remove("scan-slots")'));
assert.ok(css.includes(".app.scan-slots #scan .scan-tools { display: none; }"));
assert.ok(css.includes(".app.alta-flow #scan .scan-tools"));
const startWrap = alta.slice(alta.indexOf("startScan = async function"), alta.indexOf("var ingestLabelImageAlta"));
assert.ok(!startWrap.includes("showLabelSlots"));
assert.ok(!startWrap.includes("scan-slots"));
assert.ok(v92.includes("showLabelSlots"));
assert.ok(alta.includes("vinoteca.pro.max.v3.antes-v93"));
assert.ok(alta.includes('status: "DRAFT"'));
assert.ok(alta.includes('intakeStatus: "CONFIRMED"'));
assert.ok(alta.includes('storeAltaImage(stored.id, altaFlow.frontLabelImage)'));
assert.ok(alta.includes('storeAltaImage("back:" + stored.id, altaFlow.backLabelImage)'));
assert.ok(alta.includes("if (!wine.frontLabelImage && wine.labelThumb)"));
assert.ok(alta.includes("analyzeAndEnrichWine"));
assert.ok(alta.includes("matchLocalAssets"));
assert.ok(alta.includes("geminiTryModels(key, \"read\""));
assert.ok(alta.includes("quietWineSearch"));
assert.ok(alta.includes("geminiGrounded"));
assert.ok(alta.includes("shouldUseOfflineRead"));
const searchFn = extractFunction(alta, "postWineSearch");
assert.ok(searchFn.includes("geminiGrounded"));
assert.ok(!searchFn.includes("responseSchema"));
assert.ok(!searchFn.includes("wineReadingSchema"));
const readingFn = extractFunction(alta, "postWineReading");
assert.ok(readingFn.includes("wineReadingSchema"));
assert.ok(readingFn.includes("geminiGenerate"));
assert.ok(!readingFn.includes("geminiGrounded"));

["alta.cam", "alta.lib", "alta.stepFront", "alta.stepBack", "alta.onlyFront", "alta.confirm", "alta.cellar", "alta.slot", "alta.zonePhoto", "alta.wineryPhoto", "alta.needPlace", "alta.crianza", "alta.serve", "alta.pairing", "alta.confirmed", "alta.draft"].forEach(key => {
  const line = i18n.split("\n").find(row => row.indexOf('["' + key + '"') >= 0);
  assert.ok(line, key);
  assert.strictEqual(line.split('", "').length, 6, key);
});

const zoneSrc = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8").split("\n").slice(1, 125).join("\n");
const ZONES = new Function(zoneSrc + "\nreturn ZONES;")();
eval(fs.readFileSync(path.join(root, "bodegas.js"), "utf8"));
assert.strictEqual(ZONES.length, 115);
assert.strictEqual(WINERY_CARDS.length, 59);

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
  extractFunction(alta, "altaCanConfirm"),
  extractFunction(alta, "altaShownFact"),
  "return { phraseHit, matchLocalAssets, wineReadingSchema, sheetFromParsed, missingIdentity, altaCanConfirm, altaShownFact, analyzeAndEnrichWine, readingFailureKind };"
].join("\n"));
const mod = api(ZONES, WINERY_CARDS, foldWinery);

assert.strictEqual(mod.phraseHit("porto", "port"), false);
assert.strictEqual(mod.phraseHit("do emporda", "emporda"), true);
const perelada = mod.matchLocalAssets("Empordà", "Grup Peralada");
assert.strictEqual(perelada.regionAssetImage, "mapa-emporda.jpg");
assert.strictEqual(perelada.wineryAssetImage, "bodega-perelada.jpg");
assert.strictEqual(perelada.zone.name, "Empordà");
assert.strictEqual(perelada.winery.id, "perelada");
assert.strictEqual(mod.matchLocalAssets("DO Empordà", "Castillo Perelada").winery.id, "perelada");
assert.strictEqual(mod.matchLocalAssets("Figueres", "Perelada").regionAssetImage, "mapa-emporda.jpg");
assert.strictEqual(mod.matchLocalAssets("Atlantis", "Bodega Inventada Larga").regionAssetImage, "");
assert.strictEqual(mod.matchLocalAssets("Atlantis", "Bodega Inventada Larga").wineryAssetImage, "");
const canas = mod.matchLocalAssets("Rioja", "Bodegas Luis Cañas");
assert.strictEqual(canas.winery.id, "luis-canas");
assert.strictEqual(canas.wineryAssetImage, "bodega-luis-canas.jpg");
assert.strictEqual(canas.regionAssetImage, "mapa-rioja.jpg");
const figuero = mod.matchLocalAssets("Ribera del Duero", "Figuero Viñas Viejas");
assert.strictEqual(figuero.winery.id, "garcia-figuero");
assert.strictEqual(figuero.wineryAssetImage, "bodega-garcia-figuero.jpg");
assert.strictEqual(figuero.regionAssetImage, "mapa-ribera.jpg");

const schema = mod.wineReadingSchema();
assert.deepStrictEqual(schema.required, ["name", "vintage", "region", "winery"]);
const cleaned = mod.sheetFromParsed({ name: "Sin dato", vintage: "2018", region: "Empordà", winery: "Perelada", grapes: "Sin dato" });
assert.strictEqual(cleaned.name, "");
assert.strictEqual(cleaned.grapes, "");
assert.strictEqual(cleaned.vintage, "2018");
assert.deepStrictEqual(mod.missingIdentity(cleaned), ["name"]);
global.escHtml = value => String(value == null ? "" : value);
global.t = key => key;
assert.strictEqual(mod.altaShownFact("Uvas", ""), "");
assert.strictEqual(mod.altaShownFact("Uvas", "Sin dato"), "");
assert.ok(mod.altaShownFact("Uvas", "Garnacha").includes("Garnacha"));
assert.strictEqual(mod.altaCanConfirm({ cellarLocation: { cellarId: "", bin: "" } }), false);
assert.strictEqual(mod.altaCanConfirm({ cellarLocation: { cellarId: "v1", bin: "" } }), false);
assert.strictEqual(mod.altaCanConfirm({ cellarLocation: { cellarId: "v1", bin: "A-03" } }), true);

const jpeg = "data:image/jpeg;base64," + "A".repeat(80);
let generateCalls = [];
let groundedCalls = [];
global.storedGeminiKey = () => "clave";
global.imagePart = data => ({ inlineData: { mimeType: "image/jpeg", data: String(data).slice(0, 12) } });
global.shouldUseOfflineRead = (onLine, failure) => onLine === false && failure === "fetch";
function setOnline(value) {
  Object.defineProperty(navigator, "onLine", { configurable: true, get: () => value });
}
setOnline(true);
global.geminiModelsForKey = async (key, kind) => kind === "ground"
  ? ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
  : ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
eval([
  extractFunction(fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8"), "geminiModelMissText"),
  extractFunction(fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8"), "geminiTryModels")
].join("\n"));
global.geminiTryModels = geminiTryModels;
global.geminiGenerate = async (key, model, prompt, schemaArg, signal, tokens, parts) => {
  generateCalls.push({ model, schema: schemaArg, parts: parts || [], prompt });
  return { parsed: { name: "Finca Garbet", vintage: "2018", region: "Empordà", winery: "Grup Peralada", grapes: "Garnacha", abv: "14,5", crianza: "Sin dato", serveTemp: "", tasting: "", pairing: "" } };
};
global.geminiGrounded = async () => {
  groundedCalls.push("no");
  return { parsed: null };
};

(async () => {
  const full = await mod.analyzeAndEnrichWine(jpeg, jpeg);
  assert.strictEqual(full.ok, true);
  assert.strictEqual(full.sheet.name, "Finca Garbet");
  assert.strictEqual(full.sheet.crianza, "");
  assert.strictEqual(full.sheet.grapes, "Garnacha");
  assert.strictEqual(full.assets.winery.id, "perelada");
  assert.strictEqual(full.assets.regionAssetImage, "mapa-emporda.jpg");
  assert.strictEqual(groundedCalls.length, 0);
  assert.strictEqual(generateCalls.length, 1);
  assert.strictEqual(generateCalls[0].model, "gemini-3.5-flash-lite");
  assert.deepStrictEqual(generateCalls[0].schema.required, ["name", "vintage", "region", "winery"]);
  assert.strictEqual(generateCalls[0].parts.length, 2);
  assert.ok(generateCalls[0].prompt.includes("«Sin dato»"));

  generateCalls = [];
  groundedCalls = [];
  global.geminiGenerate = async () => {
    generateCalls.push("read");
    return { parsed: { name: "", vintage: "", region: "", winery: "", grapes: "Sin dato" } };
  };
  global.geminiGrounded = async (key, model, prompt) => {
    groundedCalls.push({ model, prompt });
    if (prompt.includes("Google Search")) {
      return { parsed: { name: "Nube", vintage: "2015", region: "Atlantis", winery: "Bodega Inventada Larga", grapes: "Listán", abv: "", crianza: "", serveTemp: "", tasting: "", pairing: "", source: "https://example.com/vino" } };
    }
    if (prompt.includes("clima")) return { parsed: { climate: "Atlántico", soil: "Volcánico", source: "https://example.com/do" } };
    if (prompt.includes("historia")) return { parsed: { history: "Casa familiar", founded: "1901", place: "Isla", source: "https://example.com/bodega" } };
    return { parsed: { climate: "Sin dato", soil: "", source: "" } };
  };
  const enriched = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(enriched.ok, true);
  assert.strictEqual(enriched.sheet.name, "");
  assert.strictEqual(enriched.sheet.grapes, "Listán");
  assert.strictEqual(enriched.zoneText, "Atlántico Volcánico");
  assert.ok(enriched.wineryText.includes("1901"));
  assert.ok(enriched.sources.includes("https://example.com/vino"));
  assert.ok(groundedCalls.every(call => call.model === "gemini-2.5-flash" || call.model === "gemini-2.5-flash-lite"));
  assert.ok(groundedCalls.length >= 2);

  global.geminiGrounded = async () => ({ parsed: { climate: "Inventado", soil: "Sin dato", source: "nota interna" } });
  global.geminiGenerate = async () => ({ parsed: { name: "Nube", vintage: "2015", region: "Atlantis", winery: "Bodega Inventada Larga" } });
  const bare = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(bare.zoneText, "");
  assert.strictEqual(bare.wineryText, "");
  assert.ok(!JSON.stringify(bare.sheet).includes("Sin dato"));

  global.geminiGenerate = async () => ({ parsed: { name: "Pago Garduña", vintage: "2021", region: "", winery: "Pago de los Capellanes", grapes: "" } });
  global.geminiGrounded = async (key, model, prompt) => {
    if (String(prompt || "").includes("Google Search")) {
      return { parsed: { name: "Pago Garduña", vintage: "2020", region: "Ribera del Duero", winery: "Pago de los Capellanes", grapes: "", source: "https://example.com/garduna" } };
    }
    return { parsed: null };
  };
  const garduna = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(garduna.ok, true);
  assert.strictEqual(garduna.sheet.vintage, "2021");
  assert.strictEqual(garduna.sheet.region, "Ribera del Duero");

  global.geminiGenerate = async () => ({ quota: true, reason: "HTTP 429", parsed: null });
  const quota = await mod.analyzeAndEnrichWine(jpeg, jpeg);
  assert.strictEqual(quota.ok, false);
  assert.strictEqual(quota.failure, "quota");

  setOnline(false);
  global.geminiGenerate = async () => ({ parsed: null, reason: "red o CORS", fatal: true });
  const offline = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(offline.failure, "offline");

  setOnline(true);
  const online = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(online.failure, "fetch");

  global.geminiGenerate = async () => { const err = new Error("aborted"); err.name = "AbortError"; throw err; };
  const timed = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(timed.failure, "timeout");

  global.storedGeminiKey = () => "";
  const needKey = await mod.analyzeAndEnrichWine(jpeg, "");
  assert.strictEqual(needKey.failure, "needKey");

  console.log("v94 alta ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

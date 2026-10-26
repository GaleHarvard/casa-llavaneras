/* v103: hechos cortos de bodega y añada. La web oficial gana. Sin párrafos ni «Sin dato». */
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
const file = fs.readFileSync(path.join(root, "casa-v103.js"), "utf8");
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const bodegas = fs.readFileSync(path.join(root, "bodegas.js"), "utf8");
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const ficha = fs.readFileSync(path.join(root, "casa-ficha.js"), "utf8");

assert.ok(app.includes('APP_VERSION = "v103"'));
assert.ok(html.includes('content="v103"'));
assert.ok(html.includes("casa-v103.js?v=103"));
assert.ok(html.indexOf("casa-alta.js?v=103") < html.indexOf("casa-v103.js?v=103"));
assert.ok(html.indexOf("casa-v103.js?v=103") < html.indexOf("app.js?v=103"));
assert.ok(sw.includes("./casa-v103.js"));
assert.ok(sw.includes('const CACHE = "casa-llavaneras-ios-v103"'));
assert.ok(sw.includes('const VERSION = "v103"'));
assert.ok(sw.includes('cache: "reload"'));
assert.ok(sw.includes('data.type === "skip-waiting"'));
assert.ok(sw.includes("client.navigate"));
assert.ok(sw.includes("shellIsThisVersion"));
assert.ok(html.includes('register("sw.js?v=103")'));
assert.ok(html.includes("reg.update()"));
assert.ok(html.includes('postMessage({ type: "skip-waiting" })'));
assert.ok(html.includes("casa-sw-version"));
assert.ok(!html.includes("casa-sw-reload"));
assert.ok(bodegas.includes("vinedo-chateau-margaux.jpg"));
assert.ok(bodegas.includes("bodega-pago-de-carraovejas.jpg"));
assert.ok(bodegas.includes("bodega-luis-canas.jpg"));
assert.ok(file.includes("google_search") === false);
assert.ok(file.includes("postWineSearch"));
assert.ok(file.includes("geminiGrounded"));
assert.ok(file.includes("bodeboca.com"));
assert.ok(!/fetch\s*\(/.test(file));
assert.ok(!file.includes("indexedDB.deleteDatabase"));
assert.ok(!file.includes("vinoteca.pro.max.v3"));
assert.ok(file.includes('insertAdjacentHTML("afterend"'));
assert.ok(file.includes('querySelector(".wine-cuvee")'));
assert.ok(file.includes("by === \"usuario\""));
assert.ok(ficha.includes('class="wine-cuvee"'));
assert.ok(alta.includes("function confirmAlta"));
assert.ok(!alta.includes("houseFacts"));

file.split("\n").filter(line => line.indexOf('["fact103.') >= 0).forEach(line => {
  assert.strictEqual(line.split('", "').length, 6, line);
});

function loadFn(src, name) {
  return new Function(extractFunction(src, name) + "\nreturn " + name + ";")();
}
const groundingChunksOf = loadFn(gemini, "groundingChunksOf");
const hostOfUrl = loadFn(gemini, "hostOfUrl");
const labels = {};
file.split("\n").filter(line => line.indexOf('["fact103.') >= 0).forEach(line => {
  const parts = line.split('", "');
  const key = parts[0].replace(/^\s*\["/, "");
  labels[key] = parts[1];
});
function t(key) { return labels[key] || key; }
function escHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
const api = new Function("groundingChunksOf", "hostOfUrl", "escHtml", "t", [
  'var FACT_HOUSE = ["hectares", "founded", "production", "soils", "winemaker"];',
  'var FACT_VINTAGE = ["bottles", "ageing", "abv", "harvest", "scores"];',
  extractFunction(file, "cleanFactText"),
  extractFunction(file, "factHostOf"),
  extractFunction(file, "factChunks"),
  extractFunction(file, "chunkSupports"),
  extractFunction(file, "readFactSide"),
  extractFunction(file, "pickFact"),
  extractFunction(file, "acceptFactBag"),
  extractFunction(file, "factRecord"),
  extractFunction(file, "mergeFactBag"),
  extractFunction(file, "factLabel"),
  extractFunction(file, "factLine"),
  extractFunction(file, "factsBlockHtml"),
  "return { cleanFactText, pickFact, acceptFactBag, mergeFactBag, factsBlockHtml };"
].join("\n"))(groundingChunksOf, hostOfUrl, escHtml, t);

assert.strictEqual(api.cleanFactText("Sin dato"), "");
assert.strictEqual(api.cleanFactText("«Sin dato»"), "");
assert.strictEqual(api.cleanFactText(""), "");
const prose = "Texto descriptivo de prueba de Bodeboca que cuenta el paisaje familiar la cueva y la historia del viñedo durante muchos años sin ser un dato concreto.";
assert.ok(prose.length > 90);
assert.strictEqual(api.cleanFactText(prose), "");
assert.strictEqual(api.cleanFactText("TEST 50 ha"), "TEST 50 ha");

const chunks = [
  { web: { uri: "https://www.luiscanas.com/bodega", title: "TEST DATA oficial" } },
  { web: { uri: "https://www.bodeboca.com/vino/luis-canas-2024", title: "TEST DATA Bodeboca" } }
];
const raw = { candidates: [{ groundingMetadata: { groundingChunks: chunks } }] };
const parsed = {
  hectares: {
    official: "TEST 50 ha",
    officialSource: "https://www.luiscanas.com/bodega",
    bodeboca: "TEST 80 ha",
    bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024"
  },
  founded: {
    official: "1970",
    officialSource: "https://www.luiscanas.com/bodega",
    bodeboca: "1970",
    bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024"
  },
  soils: {
    official: "TEST arcilla y caliza, 500 m",
    officialSource: "https://www.luiscanas.com/bodega",
    bodeboca: prose,
    bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024"
  },
  winemaker: {
    official: "TEST nadie",
    officialSource: "https://evil.example/enologo",
    bodeboca: "",
    bodebocaSource: ""
  },
  bottles: {
    official: "TEST 120000",
    officialSource: "https://www.luiscanas.com/bodega",
    bodeboca: "TEST 90000",
    bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024"
  },
  abv: {
    official: "TEST 13,5%",
    officialSource: "https://www.luiscanas.com/bodega",
    bodeboca: "Sin dato",
    bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024"
  },
  harvest: {
    official: "",
    officialSource: "",
    bodeboca: "TEST vendimia temprana",
    bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024"
  },
  scores: {
    official: "TEST Parker 91",
    officialSource: "http://www.luiscanas.com/bodega",
    bodeboca: "",
    bodebocaSource: ""
  }
};
const bag = api.acceptFactBag(parsed, raw);
assert.strictEqual(bag.house.hectares.value, "TEST 50 ha");
assert.strictEqual(bag.house.hectares.source, "https://www.luiscanas.com/bodega");
assert.ok(!JSON.stringify(bag).includes("TEST 80 ha"));
assert.strictEqual(bag.house.founded.value, "1970");
assert.deepStrictEqual(bag.house.founded.sources, ["https://www.luiscanas.com/bodega", "https://www.bodeboca.com/vino/luis-canas-2024"]);
assert.strictEqual(bag.house.soils.value, "TEST arcilla y caliza, 500 m");
assert.ok(!JSON.stringify(bag).includes("paisaje familiar"));
assert.strictEqual(bag.house.winemaker, undefined);
assert.strictEqual(bag.vintage.bottles.value, "TEST 120000");
assert.ok(!JSON.stringify(bag).includes("TEST 90000"));
assert.strictEqual(bag.vintage.abv.value, "TEST 13,5%");
assert.strictEqual(bag.vintage.harvest.value, "TEST vendimia temprana");
assert.strictEqual(bag.vintage.harvest.source, "https://www.bodeboca.com/vino/luis-canas-2024");
assert.strictEqual(bag.vintage.scores, undefined);
assert.ok(!JSON.stringify(bag).includes("Sin dato"));

const empty = api.acceptFactBag(parsed, {});
assert.deepStrictEqual(empty.house, {});
assert.deepStrictEqual(empty.vintage, {});

const redirect = api.pickFact({
  official: "TEST 50 ha",
  officialSource: "https://www.luiscanas.com/bodega"
}, [{ uri: "https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc", title: "luiscanas.com" }]);
assert.strictEqual(redirect.value, "TEST 50 ha");

const kept = api.mergeFactBag({
  hectares: { value: "TEST 42 ha usuario", source: "", sources: [], by: "usuario" }
}, {
  hectares: { value: "TEST 50 ha", source: "https://www.luiscanas.com/bodega", sources: ["https://www.luiscanas.com/bodega"], by: "web" }
});
assert.strictEqual(kept.hectares.value, "TEST 42 ha usuario");
assert.strictEqual(kept.hectares.by, "usuario");

const htmlFacts = api.factsBlockHtml(bag.house, bag.vintage, { buttons: "" });
assert.ok(htmlFacts.includes("TEST 50 ha"));
assert.ok(htmlFacts.includes("Viñedo"));
assert.ok(htmlFacts.includes("https://www.luiscanas.com/bodega"));
assert.ok(!htmlFacts.includes("TEST 80 ha"));
assert.ok(!htmlFacts.includes("Sin dato"));
assert.ok(!htmlFacts.includes("paisaje familiar"));
assert.strictEqual(api.factsBlockHtml({}, {}, { buttons: "" }), "");
assert.ok(!api.factsBlockHtml({ hectares: { value: "Sin dato", by: "web" } }, {}, { buttons: '<button id="facts-expand">Ampliar datos</button>' }).includes("Sin dato"));

console.log("v103-datos ok");

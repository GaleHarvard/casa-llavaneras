/* Las puntuaciones del catálogo vuelven a verse. La IA no. La web solo con origen. */
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
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const util = fs.readFileSync(path.join(root, "casa-util.js"), "utf8");
const ficha = fs.readFileSync(path.join(root, "casa-ficha.js"), "utf8");
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const api = new Function([
  extractFunction(util, "normTxt"),
  "function yearNow() { return 2026; }",
  extractFunction(vino, "bottleKind"),
  extractFunction(vino, "scoreOrigin"),
  extractFunction(vino, "scoreIsUser"),
  extractFunction(vino, "scoreIsAi"),
  extractFunction(vino, "publishedScore"),
  extractFunction(vino, "scoreTagKey"),
  extractFunction(vino, "indicativeFacts"),
  extractFunction(vino, "clearAiScoreBlock"),
  extractFunction(vino, "stripStoredAiScores"),
  "return { publishedScore, scoreTagKey, scoreIsUser, indicativeFacts, stripStoredAiScores };"
].join("\n"))();

assert.strictEqual(api.scoreTagKey({ score: 97 }), "score.catalog");
assert.ok(api.publishedScore({ ratings: { parker: { score: 97 } } }, "parker"));
assert.strictEqual(api.publishedScore({ ratings: { parker: { score: 96, estimate: true } } }, "parker"), null);
assert.strictEqual(api.publishedScore({
  ratings: { parker: { score: 96, estimate: true } },
  provenance: { ratings: "gemini" }
}, "parker"), null);
assert.strictEqual(api.scoreTagKey({ score: 91, manual: true, by: "usuario" }), "score.yours");
assert.strictEqual(api.scoreTagKey({ score: 93, origin: "web", source: "Wine Spectator", url: "https://example.com/a" }), "score.web");
assert.strictEqual(api.scoreIsUser({ score: 93, origin: "web", source: "Wine Spectator" }), false);
assert.strictEqual(api.scoreTagKey({ score: 97, origin: "verificada", url: "https://example.com/b" }), "score.verified");

const pintas = { type: "tinto", style: "crianza", vintage: 2022, name: "Pintas", appellation: "DOC Douro" };
const facts = api.indicativeFacts(pintas);
assert.deepStrictEqual(facts.serve, [16, 18]);
assert.deepStrictEqual(facts.cellar, [12, 14]);

const ai = { customWines: [{ ratings: { parker: { score: 96, estimate: true } }, provenance: { ratings: "gemini" } }], wineEdits: {} };
assert.strictEqual(api.stripStoredAiScores(ai), true);
assert.strictEqual(Number(ai.customWines[0].ratings.parker.score), 0);

const web = { customWines: [{ ratings: { parker: { score: 97, origin: "web", source: "Wine Spectator", url: "https://example.com" } }, provenance: { ratings: "gemini" } }], wineEdits: {} };
api.stripStoredAiScores(web);
assert.strictEqual(web.customWines[0].ratings.parker.score, 97);

global.window = {};
eval(fs.readFileSync(path.join(root, "wines.js"), "utf8"));
let recovered = 0;
let verified = 0;
const sources = {};
window.WINE_CATALOG.forEach(w => {
  assert.notStrictEqual(w.id, "pintas-2022");
  Object.keys(w.ratings || {}).forEach(k => {
    const block = w.ratings[k];
    if (Number(block.score) > 0) recovered++;
    if (block.origin === "verificada") {
      assert.ok(/^https:\/\//.test(block.url), w.id + " " + k);
      assert.ok(block.source, w.id + " " + k);
      verified++;
      sources[block.source] = (sources[block.source] || 0) + 1;
    }
  });
});
const unico = window.WINE_CATALOG.find(w => w.id === "vs-unico-2009");
assert.strictEqual(unico.ratings.parker.score, 97);
assert.ok(unico.ratings.parker.note.length > 40);
assert.ok(unico.ratings.parker.url.indexOf("bordeauxindex.com") >= 0);
assert.strictEqual(unico.ratings.spectator.score, 96);
assert.ok(!unico.ratings.spectator.url);
const pingus = window.WINE_CATALOG.find(w => w.id === "pingus-2018");
assert.strictEqual(pingus.ratings.parker.score, 100);
assert.ok(pingus.ratings.parker.url.indexOf("frw.co.uk") >= 0);
const u14 = window.WINE_CATALOG.find(w => w.id === "vs-unico-2014");
assert.strictEqual(u14.ratings.penin.note, "");
assert.strictEqual(u14.ratings.parker.score, 98);
assert.ok(recovered >= 100, "recuperadas " + recovered);
assert.strictEqual(verified, 17);

assert.ok(!ficha.includes('placeholder="96"'));
assert.ok(ficha.includes("score.noneLine"));
assert.ok(ficha.includes("openScore("));
assert.ok(gemini.includes("google_search"));
assert.ok(gemini.includes("origin: \"web\""));
assert.ok(gemini.includes("quotaTries < 2"));
assert.ok(i18n.includes("score.catalog"));
assert.ok(i18n.includes("score.noneLine"));
assert.ok(app.includes('APP_VERSION = "v96"'));
assert.ok(sw.includes("casa-llavaneras-ios-v96"));
assert.ok(html.includes('content="v96"'));
assert.ok(!html.includes("?v=89"));

console.log("v87-scores ok");
console.log("recuperadas " + recovered);
console.log("verificadas " + verified);
console.log(JSON.stringify(sources));

/* Guarda de datos: un JSON ilegible no se sustituye por la cava de ejemplo. */
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

const estado = fs.readFileSync(path.join(__dirname, "..", "casa-estado.js"), "utf8");
const vino = fs.readFileSync(path.join(__dirname, "..", "casa-vino.js"), "utf8");

assert.ok(estado.includes("if (cellarLocked || (state && state._corrupt)) return;"), "save() tiene que negarse");
assert.ok(estado.includes("if (!verdict.ok) return lockCorruptStore(raw);"), "load() no sigue con datos rotos");
assert.ok(!estado.includes("countFrozenPurchases"), "el parche de la fecha fija ya no está");
assert.ok(!/catch\s*\{\s*return defaultState\(\)/.test(estado), "un fallo de lectura no carga la demo");

const classifySrc = [
  'const STORE = "vinoteca.pro.max.v3";',
  extractFunction(estado, "classifyStoredCellar"),
  extractFunction(estado, "corruptBackupKey")
].join("\n");
const classifyBag = new Function(classifySrc + "\nreturn { classifyStoredCellar, corruptBackupKey };")();

const empty = classifyBag.classifyStoredCellar("");
assert.strictEqual(empty.ok, true);
assert.strictEqual(empty.empty, true);

const broken = classifyBag.classifyStoredCellar("{no es json");
assert.strictEqual(broken.ok, false);
assert.strictEqual(broken.reason, "parse");

const shape = classifyBag.classifyStoredCellar(JSON.stringify({ vinotecas: [] }));
assert.strictEqual(shape.ok, false);
assert.strictEqual(shape.reason, "shape");

const good = classifyBag.classifyStoredCellar(JSON.stringify({ vinotecas: [{ id: "v1" }], bottles: [] }));
assert.strictEqual(good.ok, true);
assert.strictEqual(good.empty, false);
assert.ok(Array.isArray(good.parsed.bottles));

assert.strictEqual(classifyBag.corruptBackupKey(1710000000000), "vinoteca.pro.max.v3.corrupt-1710000000000");

const scoreSrc = ["scoreOrigin", "scoreIsUser", "scoreIsAi", "clearAiScoreBlock", "stripStoredAiScores"].map(name => extractFunction(vino, name)).join("\n");
const scores = new Function(scoreSrc + "\nreturn { stripStoredAiScores, scoreIsUser };")();

const stored = {
  customWines: [{
    id: "mio",
    provenance: { ratings: "estimación Gemini" },
    ratings: {
      parker: { score: 96, estimate: true, note: "inventada" },
      penin: { score: 91, manual: true, by: "usuario", source: "Guía", date: "2026-01-02", url: "https://ejemplo.test/p" }
    }
  }],
  wineEdits: {
    "otro": { ratings: { spectator: { score: 88, estimate: true, note: "ia" } } }
  }
};
assert.strictEqual(scores.stripStoredAiScores(stored), true);
assert.strictEqual(stored.customWines[0].ratings.parker.score, 0);
assert.strictEqual(stored.customWines[0].ratings.parker.note, "");
assert.strictEqual(stored.customWines[0].ratings.penin.score, 91);
assert.strictEqual(scores.scoreIsUser(stored.customWines[0].ratings.penin), true);
assert.strictEqual(stored.customWines[0].provenance.ratings, "usuario");
assert.strictEqual(stored.wineEdits.otro.ratings.spectator.score, 0);
assert.strictEqual(scores.stripStoredAiScores(stored), false);

const mem = Object.create(null);
const localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  setItem(k, v) { mem[k] = String(v); },
  key(i) { return Object.keys(mem)[i] || null; },
  get length() { return Object.keys(mem).length; }
};
const STORE = "vinoteca.pro.max.v3";
const raw = "{roto";
localStorage.setItem(STORE, raw);
let cellarLocked = false;
let state = { _corrupt: true, bottles: [{ uid: "demo" }] };
function save() {
  if (cellarLocked || (state && state._corrupt)) return;
  localStorage.setItem(STORE, JSON.stringify({ vinotecas: [], bottles: [{ uid: "demo" }] }));
}
cellarLocked = true;
save();
assert.strictEqual(localStorage.getItem(STORE), raw);
const key = classifyBag.corruptBackupKey(42);
localStorage.setItem(key, raw);
assert.strictEqual(localStorage.getItem(key), raw);
assert.notStrictEqual(localStorage.getItem(STORE), JSON.stringify({ vinotecas: [], bottles: [{ uid: "demo" }] }));

console.log("corrupt-guard ok");

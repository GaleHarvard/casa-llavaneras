/* v101: el service worker activa la ficha y la migración reconoce el alta real. */
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
const v89 = fs.readFileSync(path.join(root, "casa-v89.js"), "utf8");
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const api = new Function([
  "function foldEstate(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }",
  "function colorForWineType(type) { if (type === 'blanco') return '#e8d9a0'; if (type === 'tinto') return '#4a1020'; return ''; }",
  extractFunction(v89, "foldGrapeName"),
  extractFunction(v89, "grapeParts"),
  extractFunction(v89, "grapeListHas"),
  extractFunction(v89, "grapeColor"),
  extractFunction(v89, "typeFromGrapes"),
  extractFunction(v89, "cuveeForWine"),
  extractFunction(v89, "collectedGrapes"),
  extractFunction(v89, "labelCorpus"),
  extractFunction(v89, "labelHasWord"),
  extractFunction(v89, "labelProtects"),
  extractFunction(v89, "refineGrapeField"),
  extractFunction(v89, "canonType"),
  extractFunction(v89, "reconcileType"),
  extractFunction(v89, "stripContradictingStyle"),
  extractFunction(v89, "inventedStylePhrase"),
  extractFunction(v89, "luisCanasPrintedName"),
  extractFunction(v89, "clearContradictingCrianza"),
  extractFunction(v89, "alignWineWithGrapes"),
  extractFunction(v89, "migrateGrapeIdentity"),
  "return { grapeParts, typeFromGrapes, migrateGrapeIdentity, alignWineWithGrapes, stripContradictingStyle };"
].join("\n"))();

const tasting = "Vista: Violáceo, ribete granate. Nariz: fruta roja.";
const v99Grapes = "VIURA, MALVASÍA Y TEMPRANILLO BLANCO".split(/[,;]/).map(part => part.trim()).filter(Boolean);
assert.deepStrictEqual(v99Grapes, ["VIURA", "MALVASÍA Y TEMPRANILLO BLANCO"]);
assert.strictEqual(api.typeFromGrapes(v99Grapes), "blanco");
assert.deepStrictEqual(api.grapeParts(v99Grapes), ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);

const cellar = {
  customWines: [
    {
      id: "bodegas-luis-canas-luis-canas-tinto-joven-2024-2024",
      parentId: "p:bodegas-luis-canas:luis-canas-tinto-joven-2024",
      name: "Luis Cañas Tinto Joven 2024",
      subtitle: "Luis Cañas Tinto Joven 2024",
      producer: "Bodegas Luis Cañas",
      vintage: 2024,
      region: "Rioja",
      appellation: "Rioja",
      country: "España",
      type: "",
      style: "escaneo",
      grapes: v99Grapes.slice(),
      color: "#4a1020",
      tasting: tasting,
      ratings: { parker: { score: 91, scale: 100, note: "guardar" } },
      labelThumb: "idb:front-luis",
      frontLabelImage: "idb:front-luis",
      provenance: {
        intake: "usuario",
        intakeStatus: "CONFIRMED",
        wineryId: "luis-canas",
        crianza: "Tinto Joven",
        grapes: "VIURA, MALVASÍA Y TEMPRANILLO BLANCO"
      }
    },
    {
      id: "solo-cuvee",
      parentId: "p:solo:cuvee",
      name: "Casa Tinto Joven 2021",
      producer: "Casa",
      vintage: 2021,
      type: "tinto",
      grapes: [],
      tasting: tasting,
      provenance: { intakeStatus: "CONFIRMED" }
    },
    {
      id: "solo-edicion",
      name: "Otro Tinto Joven 2020",
      producer: "Otro",
      vintage: 2020,
      type: "",
      grapes: [],
      subtitle: "Otro Tinto Joven 2020",
      tasting: "Vista: Violáceo puro.",
      provenance: {}
    },
    {
      id: "crianza-etiqueta",
      name: "Algo Crianza 2018",
      producer: "Algo",
      vintage: 2018,
      type: "tinto",
      grapes: ["Tempranillo"],
      provenance: { labelText: "Algo Crianza 2018 Tempranillo" }
    }
  ],
  cuvees: {
    "p:bodegas-luis-canas:luis-canas-tinto-joven-2024": {
      id: "p:bodegas-luis-canas:luis-canas-tinto-joven-2024",
      name: "Luis Cañas Tinto Joven 2024",
      grapes: ["VIURA", "MALVASÍA Y TEMPRANILLO BLANCO"],
      type: "",
      appellation: "Rioja",
      vintageIds: ["bodegas-luis-canas-luis-canas-tinto-joven-2024-2024"]
    },
    "p:solo:cuvee": {
      id: "p:solo:cuvee",
      name: "Casa Tinto Joven 2021",
      grapes: ["VIURA, MALVASÍA Y TEMPRANILLO BLANCO"],
      type: "tinto",
      vintageIds: ["solo-cuvee"]
    }
  },
  wineEdits: {
    "solo-edicion": { grapes: "VIURA, MALVASÍA Y TEMPRANILLO BLANCO" }
  },
  bottles: [
    { wineId: "bodegas-luis-canas-luis-canas-tinto-joven-2024-2024", qty: 2, note: "hueco B2", grapes: ["VIURA", "MALVASÍA Y TEMPRANILLO BLANCO"] }
  ]
};

const fixed = api.migrateGrapeIdentity(cellar);
const luis = cellar.customWines[0];
const cuvee = cellar.cuvees[luis.parentId];
assert.strictEqual(luis.name, "Luis Cañas 2024");
assert.strictEqual(luis.subtitle, "Luis Cañas 2024");
assert.strictEqual(luis.type, "blanco");
assert.strictEqual(luis.color, "#e8d9a0");
assert.strictEqual(luis.tasting, tasting);
assert.deepStrictEqual(luis.grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
assert.deepStrictEqual(luis.provenance.grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
assert.strictEqual(luis.provenance.crianza, "");
assert.strictEqual(luis.provenance.originalTitle, "Luis Cañas Tinto Joven 2024");
assert.strictEqual(luis.provenance.intakeStatus, "CONFIRMED");
assert.strictEqual(luis.labelThumb, "idb:front-luis");
assert.strictEqual(luis.ratings.parker.score, 91);
assert.strictEqual(cuvee.name, "Luis Cañas 2024");
assert.strictEqual(cuvee.type, "blanco");
assert.deepStrictEqual(cuvee.grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
assert.strictEqual(cuvee.appellation, "Rioja");
assert.deepStrictEqual(cellar.bottles[0].grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
assert.strictEqual(cellar.bottles[0].qty, 2);
assert.strictEqual(cellar.bottles[0].note, "hueco B2");

const solo = cellar.customWines[1];
assert.strictEqual(solo.name, "Casa 2021");
assert.strictEqual(solo.type, "blanco");
assert.strictEqual(solo.tasting, tasting);
assert.deepStrictEqual(cellar.cuvees["p:solo:cuvee"].grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
assert.strictEqual(cellar.cuvees["p:solo:cuvee"].name, "Casa 2021");

const edited = cellar.customWines[2];
assert.strictEqual(edited.name, "Otro 2020");
assert.strictEqual(edited.subtitle, "Otro 2020");
assert.strictEqual(edited.type, "blanco");
assert.strictEqual(edited.tasting, "Vista: Violáceo puro.");
assert.deepStrictEqual(edited.grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
assert.deepStrictEqual(cellar.wineEdits["solo-edicion"].grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);

const kept = cellar.customWines[3];
assert.strictEqual(kept.name, "Algo Crianza 2018");
assert.strictEqual(kept.type, "tinto");
assert.strictEqual(api.migrateGrapeIdentity(cellar).length, 0);
assert.ok(fixed.some(row => row.id.indexOf("luis-canas") >= 0));

const labeled = {
  id: "en-etiqueta",
  name: "Luis Cañas Tinto Joven 2024",
  producer: "Bodegas Luis Cañas",
  vintage: 2024,
  type: "tinto",
  grapes: ["Viura", "Malvasía", "Tempranillo Blanco"],
  tasting: tasting,
  provenance: { ocrText: "Luis Cañas Tinto Joven 2024" }
};
assert.strictEqual(api.alignWineWithGrapes(labeled), true);
assert.strictEqual(labeled.name, "Luis Cañas Tinto Joven 2024");
assert.strictEqual(labeled.type, "blanco");
assert.strictEqual(labeled.tasting, tasting);

assert.strictEqual(api.stripContradictingStyle("Luis Cañas Tinto Joven 2024", "blanco"), "Luis Cañas 2024");
assert.strictEqual(api.stripContradictingStyle("Algo Crianza 2018", "tinto", { provenance: { labelText: "Crianza" } }), "Algo Crianza 2018");

assert.ok(sw.includes('"casa-llavaneras-ios-v106"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v106"'));
assert.ok(sw.includes('const VERSION = "v106"'));
assert.ok(sw.includes('cache: "reload"'));
assert.ok(sw.includes('data.type === "skip-waiting"'));
assert.ok(!sw.includes("client.navigate"));
assert.ok(sw.includes("clients.claim"));
assert.ok(sw.includes("settleWithin"));
assert.ok(sw.includes("shellIsThisVersion"));
assert.ok(app.includes('APP_VERSION = "v106"'));
assert.ok(html.includes('content="v106"'));
assert.ok(html.includes("casa-v89.js?v=106"));
assert.ok(html.includes("casa-alta.js?v=106"));
assert.ok(html.includes('register("sw.js?v=106")'));
assert.ok(html.includes("reg.update()"));
assert.ok(html.includes('postMessage({ type: "skip-waiting" })'));
assert.ok(html.includes("casa-sw-version"));
assert.ok(!html.includes('casa-sw-reload'));
assert.ok(alta.includes("migrateGrapeIdentity(state)"));
assert.ok(alta.includes("grapeParts(sheet.grapes)"));
assert.ok(v89.includes("function collectedGrapes"));
assert.ok(!v89.includes("wine.tasting ="));

console.log("v101-activacion ok");

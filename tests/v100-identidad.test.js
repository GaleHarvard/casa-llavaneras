/* v100: el nombre es el de la etiqueta y el tipo sigue a las uvas. */
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
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const ficha = fs.readFileSync(path.join(root, "casa-ficha.js"), "utf8");
const v92 = fs.readFileSync(path.join(root, "casa-v92.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
global.window = global.window || {};
eval(fs.readFileSync(path.join(root, "wines.js"), "utf8"));

const api = new Function("WINE_CATALOG", [
  "function foldEstate(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }",
  "function colorForWineType(type) { if (type === 'blanco') return '#e8d9a0'; if (type === 'tinto') return '#4a1020'; return ''; }",
  "function clipText(text, max) { const s = String(text || '').replace(/\\s+/g, ' ').trim(); return s.length <= (max || 80) ? s : s.slice(0, max || 80); }",
  "function normIntakeType(raw) { const s = foldEstate(raw); if (/espum|champ|cava|brut/.test(s)) return 'espumoso'; if (/rosad|rose/.test(s)) return 'rosado'; if (/blanc|white/.test(s)) return 'blanco'; if (/tint|red/.test(s)) return 'tinto'; return String(raw || '').trim(); }",
  "function asField(value) { if (value && typeof value === 'object' && 'value' in value) return { value: String(value.value || ''), confidence: Number(value.confidence) || 0 }; return { value: String(value || ''), confidence: value ? 0.9 : 0 }; }",
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
  extractFunction(v89, "categoryForName"),
  extractFunction(v89, "stripContradictingStyle"),
  extractFunction(v89, "inventedStylePhrase"),
  extractFunction(v89, "luisCanasPrintedName"),
  extractFunction(v89, "clearContradictingCrianza"),
  extractFunction(v89, "alignWineWithGrapes"),
  extractFunction(v89, "migrateGrapeIdentity"),
  extractFunction(v89, "composeWineName"),
  "return { typeFromGrapes, reconcileType, composeWineName, alignWineWithGrapes, migrateGrapeIdentity, stripContradictingStyle };"
].join("\n"))(window.WINE_CATALOG);

assert.strictEqual(api.typeFromGrapes(["Viura", "Malvasía", "Tempranillo Blanco"]), "blanco");
assert.strictEqual(api.typeFromGrapes("Viura, Malvasía y Tempranillo Blanco"), "blanco");
assert.strictEqual(api.typeFromGrapes(["Tempranillo", "Garnacha"]), "tinto");
assert.strictEqual(api.typeFromGrapes(["Chardonnay", "Pinot Noir"]), "");
assert.strictEqual(api.typeFromGrapes([]), "");
assert.strictEqual(api.reconcileType("", ["Viura"]), "blanco");
assert.strictEqual(api.reconcileType("tinto", ["Viura", "Malvasía", "Tempranillo Blanco"]), "blanco");
assert.strictEqual(api.reconcileType("", []), "");
assert.strictEqual(api.reconcileType("tinto", []), "tinto");
assert.strictEqual(api.reconcileType("espumoso", ["Xarel·lo", "Macabeo"]), "espumoso");
assert.strictEqual(api.reconcileType("rosado", ["Garnacha", "Tempranillo"]), "rosado");
assert.strictEqual(api.reconcileType("blanco", ["Tempranillo"]), "tinto");

assert.strictEqual(api.composeWineName("Juvé & Camps", "Gran Reserva Brut Nature", "2018"), "Juvé & Camps Gran Reserva Brut Nature 2018");
assert.strictEqual(api.composeWineName("Luis Cañas", "Tinto Joven", "2024"), "Luis Cañas 2024");
assert.strictEqual(api.stripContradictingStyle("Luis Cañas Tinto Joven 2024", "blanco"), "Luis Cañas 2024");

const cellar = {
  customWines: [
    {
      id: "luis-canas-2024",
      name: "Luis Cañas Tinto Joven 2024",
      producer: "Bodegas Luis Cañas",
      vintage: 2024,
      type: "tinto",
      color: "#4a1020",
      grapes: ["Viura", "Malvasía", "Tempranillo Blanco"],
      labelThumb: "idb:front-luis",
      frontLabelImage: "idb:front-luis",
      ratings: { parker: { score: 91, scale: 100, note: "nota" } },
      geo: { lat: 42.54, lng: -2.66, web: "https://luiscanas.com" },
      provenance: { intake: "usuario", crianza: "Tinto Joven", wineryId: "luis-canas" }
    },
    {
      id: "godello-mal",
      name: "Algo Tinto 2022",
      producer: "Bodega Algo",
      vintage: 2022,
      type: "tinto",
      grapes: ["Godello"],
      provenance: {}
    },
    {
      id: "pesquera",
      name: "Reserva",
      producer: "Tinto Pesquera",
      vintage: 2016,
      type: "tinto",
      grapes: ["Tempranillo"],
      provenance: { originalTitle: "ya estaba" }
    },
    {
      id: "sin-uvas",
      name: "Casa",
      producer: "Casa",
      vintage: 2020,
      type: "tinto",
      grapes: [],
      provenance: {}
    },
    {
      id: "murrieta",
      name: "Rosado",
      producer: "Marqués de Murrieta",
      vintage: 2024,
      type: "rosado",
      grapes: ["Garnacha", "Tempranillo", "Mazuelo", "Graciano"],
      provenance: {}
    }
  ],
  bottles: [{ wineId: "luis-canas-2024", qty: 2, note: "hueco A1" }]
};
const fixed = api.migrateGrapeIdentity(cellar);
const byId = {};
fixed.forEach(row => { byId[row.id] = row; });
const luis = cellar.customWines[0];
assert.strictEqual(luis.name, "Luis Cañas 2024");
assert.strictEqual(luis.type, "blanco");
assert.strictEqual(luis.color, "#e8d9a0");
assert.strictEqual(luis.labelThumb, "idb:front-luis");
assert.strictEqual(luis.frontLabelImage, "idb:front-luis");
assert.strictEqual(luis.ratings.parker.score, 91);
assert.strictEqual(luis.geo.web, "https://luiscanas.com");
assert.strictEqual(luis.provenance.wineryId, "luis-canas");
assert.strictEqual(luis.provenance.crianza, "");
assert.strictEqual(luis.provenance.originalTitle, "Luis Cañas Tinto Joven 2024");
assert.strictEqual(cellar.bottles[0].qty, 2);
assert.strictEqual(cellar.bottles[0].note, "hueco A1");
assert.strictEqual(byId["luis-canas-2024"].nextType, "blanco");
assert.strictEqual(cellar.customWines[1].name, "Algo 2022");
assert.strictEqual(cellar.customWines[1].type, "blanco");
assert.strictEqual(cellar.customWines[2].name, "Reserva");
assert.strictEqual(cellar.customWines[2].type, "tinto");
assert.strictEqual(cellar.customWines[2].producer, "Tinto Pesquera");
assert.strictEqual(cellar.customWines[3].type, "tinto");
assert.strictEqual(cellar.customWines[3].name, "Casa");
assert.strictEqual(cellar.customWines[4].type, "rosado");
assert.strictEqual(cellar.customWines[4].name, "Rosado");
assert.strictEqual(api.migrateGrapeIdentity(cellar).length, 0);

const catalog = [];
window.WINE_CATALOG.forEach(wine => {
  const copy = {
    id: wine.id,
    name: wine.name,
    producer: wine.producer,
    vintage: wine.vintage,
    type: wine.type,
    grapes: wine.grapes,
    provenance: {}
  };
  if (api.alignWineWithGrapes(copy)) catalog.push(wine.id + " " + copy.name + " " + copy.type);
});
assert.deepStrictEqual(catalog, []);

assert.ok(alta.includes("No añadas tinto, blanco, rosado, joven"));
assert.ok(alta.includes("extra.name = \"\""));
assert.ok(alta.includes("alignWineWithGrapes"));
assert.ok(!ficha.includes('|| "tinto"'));
assert.ok(v92.includes("No pongas tinto por defecto"));
assert.ok(v89.includes("function categoryForName"));
assert.ok(app.includes('APP_VERSION = "v109"'));
assert.ok(html.includes('content="v109"'));
assert.ok(sw.includes('"casa-llavaneras-ios-v109"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v109"'));
assert.ok(sw.includes('const VERSION = "v109"'));
assert.ok(html.includes("casa-alta.js?v=109"));
console.log("v100-identidad ok");
console.log(JSON.stringify(fixed));

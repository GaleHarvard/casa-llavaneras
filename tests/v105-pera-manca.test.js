/* Pêra-Manca: la lectura «Terras Mancas» no puede inventar bodega, zona ni nota. */
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
const vinoteca = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8");
const zoneSrc = vinoteca.slice(0, vinoteca.indexOf("const ZONE_DO"));
const ZONES = new Function(zoneSrc + "\nreturn ZONES;")();
eval(fs.readFileSync(path.join(root, "bodegas.js"), "utf8"));

const names = [
  "blankWineSheet", "foldAlta", "phraseHit", "altaLabels", "wineTitleLabels",
  "matchLocalAssets", "genericRegion", "samePlace", "zoneRecord", "placeForSheet",
  "wineReadingSchema", "sheetFromParsed", "tastingConflicts", "sheetWordType",
  "polishSheetIdentity", "missingIdentity", "citedUri", "blurbConflicts",
  "groundedClaim", "peraMancaFiction", "rescuePeraMancaSheet", "fillEmptySheet",
  "readingFailureKind", "postWineReading", "postWineSearch", "quietWineSearch",
  "analyzeAndEnrichWine", "labelYearsOf", "storedPeraMancaFiction",
  "applyPeraMancaIdentity", "migratePeraManca"
];
const api = new Function("ZONES", "WINERY_CARDS", "foldWinery", "PERA_MANCA_HISTORY", "PERA_MANCA_VINI", "PERA_MANCA_SOURCES", [
  names.map(name => extractFunction(alta, name)).join("\n"),
  "return { matchLocalAssets, placeForSheet, tastingConflicts, rescuePeraMancaSheet, groundedClaim, analyzeAndEnrichWine, migratePeraManca, storedPeraMancaFiction };"
].join("\n"));
const history = alta.slice(alta.indexOf("var PERA_MANCA_HISTORY"), alta.indexOf("function fillEmptySheet"));
const constants = new Function(history + "\nreturn { PERA_MANCA_HISTORY, PERA_MANCA_VINI, PERA_MANCA_SOURCES };")();
const mod = api(ZONES, WINERY_CARDS, foldWinery, constants.PERA_MANCA_HISTORY, constants.PERA_MANCA_VINI, constants.PERA_MANCA_SOURCES);

assert.strictEqual(mod.matchLocalAssets("", "Pêra-Manca").winery.id, "cartuxa");
assert.strictEqual(mod.matchLocalAssets("", "Pera Manca").winery.id, "cartuxa");
assert.strictEqual(mod.matchLocalAssets("", "Eugénio de Almeida").winery.id, "cartuxa");
assert.strictEqual(mod.matchLocalAssets("", "Fundação Eugénio de Almeida").winery.id, "cartuxa");
assert.notStrictEqual(mod.matchLocalAssets("", "Terras Mancas").winery && mod.matchLocalAssets("", "Terras Mancas").winery.id, "cartuxa");

const placed = mod.placeForSheet("Évora-Alentejo", "Fundação Eugénio de Almeida", "Pêra-Manca Branco");
assert.strictEqual(placed.winery.id, "cartuxa");
assert.strictEqual(placed.zone.name, "Alentejo");
assert.strictEqual(placed.zone.map, "mapa-alentejo.jpg");

assert.strictEqual(mod.tastingConflicts("blanco", "Vista: Rojo cereza. Nariz: fruta roja."), true);
assert.strictEqual(mod.tastingConflicts("tinto", "Cereza picota. Nariz compleja."), false);
assert.strictEqual(mod.tastingConflicts("blanco", "Color pajizo, flor blanca."), false);

const rescued = { name: "Terras Mancas", winery: "Adega Terras Mancas", region: "Galicia", vintage: "2025", tasting: "Vista: Rojo cereza", grapes: "" };
assert.strictEqual(mod.rescuePeraMancaSheet(rescued), true);
assert.strictEqual(rescued.name, "Pêra-Manca Branco");
assert.strictEqual(rescued.winery, "Fundação Eugénio de Almeida");
assert.strictEqual(rescued.region, "Alentejo");
assert.strictEqual(rescued.vintage, "");
assert.strictEqual(rescued.tasting, "");
assert.strictEqual(rescued.grapes, "Antão Vaz, Arinto");

const namedOnly = { name: "Terras Mancas", winery: "Adega Cartuxa", vintage: "2019", region: "Sin indicación geográfica" };
assert.strictEqual(mod.rescuePeraMancaSheet(namedOnly), false);
assert.strictEqual(namedOnly.name, "Terras Mancas");
assert.strictEqual(namedOnly.vintage, "2019");

global.groundingChunksOf = json => {
  const meta = ((((json || {}).candidates || [])[0] || {}).groundingMetadata) || {};
  return (meta.groundingChunks || []).map(chunk => ({
    uri: chunk && chunk.web && chunk.web.uri ? String(chunk.web.uri) : "",
    title: chunk && chunk.web && chunk.web.title ? String(chunk.web.title) : ""
  }));
};
assert.strictEqual(mod.groundedClaim({ parsed: { source: "https://example.com/vino" }, raw: {} }, ["Bodega Inventada"]), "");
assert.strictEqual(mod.groundedClaim({
  parsed: { winery: "Fundação Eugénio de Almeida" },
  raw: { candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: "https://www.cartuxa.pt/portefolio-vinhos/pera-manca-doc-alentejo-evora-branco/", title: "Pêra-Manca branco" } }] } }] }
}, ["Fundação Eugénio de Almeida", "Pêra-Manca Branco"]), "https://www.cartuxa.pt/portefolio-vinhos/pera-manca-doc-alentejo-evora-branco/");

const kept = {
  id: "otro",
  name: "Valbuena 5º",
  producer: "Vega Sicilia",
  vintage: 2019,
  region: "Ribera del Duero",
  type: "tinto",
  tasting: "Ciruela",
  labelThumb: "idb:valbuena",
  grapes: ["Tinto Fino"]
};
const bad = {
  id: "adega-terras-mancas-terras-mancas-2025",
  name: "Terras Mancas",
  producer: "Adega Terras Mancas",
  vintage: 2025,
  region: "Galicia",
  appellation: "Galicia",
  country: "España",
  type: "tinto",
  color: "#4a1020",
  grapes: ["Mencía"],
  tasting: "Vista: Rojo cereza. Nariz: fruta roja.",
  pairing: ["Pulpo"],
  labelThumb: "idb:pera",
  frontLabelImage: "idb:pera",
  backLabelImage: "idb:contra",
  ratings: { parker: { score: 91, scale: 100, note: "Vista: Rojo cereza" } },
  dossier: { history: "Viticultura artesanal en Galicia.", vinification: "Maceración en Galicia.", elevage: "Barrica" },
  provenance: { intake: "usuario", intakeStatus: "CONFIRMED", wineryText: "Viticultura artesanal en Galicia", zoneText: "Atlántico gallego", sources: ["https://ejemplo.invalid/invento"] }
};
const withYear = {
  id: "con-anio",
  name: "Terras Mancas",
  producer: "Adega Terras Mancas",
  vintage: 2025,
  tasting: "Vista: Rojo cereza",
  region: "Galicia",
  labelThumb: "idb:anio",
  provenance: { ocrText: "VINHO BRANCO ÉVORA-ALENTEJO 2021", intake: "usuario" }
};
const state = {
  customWines: [kept, bad, withYear, { id: "t1", producer: "Adega Cartuxa", name: "Terras Mancas", vintage: 2019, region: "Sin indicación geográfica", appellation: "Sin indicación geográfica", provenance: {} }],
  bottles: [
    { uid: "b9", wineId: bad.id, qty: 2, cellarId: "v1", bin: "C-04", price: 80, note: "regalo" },
    { uid: "b3", wineId: "vega-valbuena-2019", qty: 2, cellarId: "v2", bin: "G-01", price: 165, note: "Para aniversario" }
  ]
};
global.state = state;
global.cellarLocked = false;
let saved = 0;
global.save = () => { saved += 1; };
global.colorForWineType = type => type === "blanco" ? "#e8d9a0" : "";
assert.strictEqual(mod.migratePeraManca(), true);
assert.strictEqual(saved, 1);
assert.strictEqual(bad.name, "Pêra-Manca Branco");
assert.strictEqual(bad.producer, "Fundação Eugénio de Almeida");
assert.strictEqual(bad.region, "Alentejo");
assert.strictEqual(bad.appellation, "DOC Alentejo");
assert.strictEqual(bad.country, "Portugal");
assert.strictEqual(bad.type, "blanco");
assert.strictEqual(bad.color, "#e8d9a0");
assert.deepStrictEqual(bad.grapes, ["Antão Vaz", "Arinto"]);
assert.strictEqual(bad.vintage, 0);
assert.strictEqual(bad.tasting, "");
assert.strictEqual(bad.dossier.history.includes("Galicia"), false);
assert.ok(bad.dossier.history.includes("Évora"));
assert.ok(bad.dossier.vinification.includes("Antão Vaz"));
assert.strictEqual(bad.dossier.elevage, "");
assert.strictEqual(bad.wineryAsset, "bodega-cartuxa.jpg");
assert.strictEqual(bad.zoneAsset, "mapa-alentejo.jpg");
assert.strictEqual(bad.provenance.wineryId, "cartuxa");
assert.strictEqual(bad.provenance.zoneId, "Alentejo");
assert.strictEqual(bad.geo.zone, "Évora");
assert.strictEqual(bad.labelThumb, "idb:pera");
assert.strictEqual(bad.frontLabelImage, "idb:pera");
assert.strictEqual(bad.backLabelImage, "idb:contra");
assert.strictEqual(bad.ratings.parker.score, 91);
assert.strictEqual(bad.ratings.parker.note, "");
assert.strictEqual(bad.id, "adega-terras-mancas-terras-mancas-2025");
assert.ok(bad.provenance.sources.includes("https://www.cartuxa.pt/portefolio-vinhos/pera-manca-doc-alentejo-evora-branco/"));
assert.ok(!/galicia/i.test(bad.provenance.wineryText));
assert.strictEqual(state.bottles[0].qty, 2);
assert.strictEqual(state.bottles[0].bin, "C-04");
assert.strictEqual(state.bottles[0].price, 80);
assert.strictEqual(state.bottles[0].note, "regalo");
assert.strictEqual(state.bottles[0].wineId, bad.id);
assert.strictEqual(kept.name, "Valbuena 5º");
assert.strictEqual(kept.producer, "Vega Sicilia");
assert.strictEqual(kept.tasting, "Ciruela");
assert.strictEqual(kept.labelThumb, "idb:valbuena");
assert.strictEqual(kept.vintage, 2019);
assert.strictEqual(state.customWines[3].name, "Terras Mancas");
assert.strictEqual(state.customWines[3].producer, "Adega Cartuxa");
assert.strictEqual(state.customWines[3].vintage, 2019);
assert.strictEqual(withYear.vintage, 2021);
assert.strictEqual(withYear.name, "Pêra-Manca Branco");
assert.strictEqual(mod.migratePeraManca(), false);

assert.ok(alta.includes("No inventes bodega, región, historia ni nota"));
assert.ok(!alta.includes("Describe la bodega"));
assert.ok(fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8").includes("intake === \"usuario\""));
assert.strictEqual(WINERY_CARDS.length, 60);

console.log("v105 pera-manca ok");

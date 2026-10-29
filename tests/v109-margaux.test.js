/* v109: Margaux du Château Margaux no se guarda como otra bodega ni como Médoc por defecto. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

function extractFunction(src, name) {
  const start = src.indexOf("function " + name);
  if (start < 0) throw new Error("falta " + name);
  let i = src.indexOf("{", start);
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("sin cierre " + name);
}

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const wines = read("wines.js");
const gemini = read("casa-gemini.js");
const vino = read("casa-vino.js");
const v109 = read("casa-v109.js");
const sw = read("sw.js");
const app = read("app.js");
const html = read("index.html");

global.window = global.window || {};
eval(wines);
global.WINE_CATALOG = window.WINE_CATALOG;
eval(["foldIdentity", "distinctiveIdentityTokens", "geminiAgreesLabel", "secondMargauxText", "catalogWineForLabel", "labelAllowsIdentity"].map(name => extractFunction(gemini, name)).join("\n"));
eval(["datesAreReal", "isNodataText", "shownDrinkRange", "priceIsCited"].map(name => extractFunction(vino, name)).join("\n"));
eval(v109);

const label = "MARGAUX 2015 · DU CHÂTEAU MARGAUX";
assert.strictEqual(catalogWineForLabel(label).id, "margaux-du-chateau-margaux");
assert.strictEqual(catalogWineForLabel("CHÂTEAU MARGAUX 2016").id, "margaux-2016");
assert.strictEqual(catalogWineForLabel("Château Palmer 2015 Margaux"), null);
assert.strictEqual(catalogWineForLabel("Château Beychevelle 2015"), null);
assert.strictEqual(geminiAgreesLabel("Château Beychevelle 2015", label), false);
assert.strictEqual(geminiAgreesLabel("Margaux 2015 Château Margaux", label), true);

const cuvee = WINE_CATALOG.find(wine => wine.id === "margaux-du-chateau-margaux");
assert.strictEqual(cuvee.name, "Margaux du Château Margaux");
assert.strictEqual(cuvee.producer, "Château Margaux");
assert.strictEqual(cuvee.appellation, "AOC Margaux");
assert.strictEqual(cuvee.type, "tinto");
assert.strictEqual(cuvee.priceHint, "");
assert.strictEqual(cuvee.tasting, "");

const bad = {
  id: "scan-beychevelle",
  name: "Château Beychevelle",
  producer: "Château Beychevelle",
  vintage: 2015,
  region: "Médoc",
  appellation: "Médoc",
  country: "Francia",
  type: "tinto",
  priceHint: "158,90 €",
  tasting: "Notas de otra bodega.",
  grapes: ["Cabernet Sauvignon"],
  aging: { drinkFrom: 2016, peakStart: 2018, peakEnd: 2025, holdTo: 2030 },
  provenance: {
    name: "página",
    producer: "página",
    region: "valor por defecto",
    price: "página",
    aging: "valor por defecto",
    tasting: "página",
    grapes: "página",
    ocrText: label,
    pageUrl: "https://www.vinissimus.com/es/vino/chateau-beychevelle/"
  }
};
const bottle = { uid: "b1", wineId: bad.id, qty: 1, cellarId: "v1", bin: "B-04", price: 80, note: "arriba", labelPhoto: "idb:scan-beychevelle" };
const store = { customWines: [bad], bottles: [bottle], inbox: [{ wineId: bad.id, text: label }] };
assert.strictEqual(migrateMisfiledMargaux(store), true);
assert.strictEqual(bad.id, "scan-beychevelle");
assert.strictEqual(bad.name, "Margaux du Château Margaux");
assert.strictEqual(bad.producer, "Château Margaux");
assert.strictEqual(bad.appellation, "AOC Margaux");
assert.strictEqual(bad.region, "Margaux");
assert.notStrictEqual(bad.region, "Médoc");
assert.strictEqual(bad.vintage, 2015);
assert.strictEqual(bad.priceHint, "");
assert.strictEqual(bad.tasting, "");
assert.strictEqual(bottle.price, 80);
assert.strictEqual(bottle.bin, "B-04");
assert.strictEqual(bottle.labelPhoto, "idb:scan-beychevelle");
assert.strictEqual(bottle.qty, 1);
assert.strictEqual(shownDrinkRange(bad), "");
assert.strictEqual(priceIsCited(bad), false);

const realBeychevelle = {
  id: "real-bey",
  name: "Château Beychevelle",
  producer: "Château Beychevelle",
  vintage: 2015,
  provenance: { ocrText: "CHÂTEAU BEYCHEVELLE 2015" }
};
assert.strictEqual(migrateMisfiledMargaux({ customWines: [realBeychevelle], bottles: [], inbox: [] }), false);
assert.strictEqual(realBeychevelle.name, "Château Beychevelle");

const unnamed = {
  id: "solo-nombre",
  name: "Château Beychevelle",
  producer: "Château Beychevelle",
  vintage: 2015,
  provenance: {}
};
assert.strictEqual(migrateMisfiledMargaux({ customWines: [unnamed], bottles: [], inbox: [] }), false);
assert.strictEqual(unnamed.producer, "Château Beychevelle");

assert.ok(!v109.includes("localStorage.clear"));
assert.ok(sw.includes("./casa-v109.js"));
assert.ok(sw.includes('"casa-llavaneras-ios-v110"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v110"'));
assert.ok(app.includes('APP_VERSION = "v110"'));
assert.ok(html.includes('content="v110"'));
assert.ok(html.includes("casa-v109.js?v=110"));
assert.ok(!gemini.includes('wine.provenance[k] = "valor por defecto"'));
assert.ok(read("bodegas.js").includes("Margaux du Château Margaux"));
assert.ok(!read("bodegas.js").includes('"Margaux",'));

console.log("v109-margaux ok");

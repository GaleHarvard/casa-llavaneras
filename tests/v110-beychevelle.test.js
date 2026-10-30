/* v110: la ficha Beychevelle 2015 con Médoc por defecto y el grabado de Margaux se corrige una sola vez. */
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
const gemini = read("casa-gemini.js");
const vino = read("casa-vino.js");
const ficha = read("casa-ficha.js");
const v110 = read("casa-v110.js");
global.window = global.window || {};
eval(read("wines.js"));
global.WINE_CATALOG = window.WINE_CATALOG;
eval(["foldIdentity", "isCatalogWineId"].map(name => extractFunction(gemini, name)).join("\n"));
eval(["isNodataText", "regionIsCited", "shownAppellation"].map(name => extractFunction(vino, name)).join("\n"));
eval(v110);

function entry(extra) {
  return Object.assign({
    id: "alta-beychevelle-2015",
    name: "Château Beychevelle",
    producer: "Château Beychevelle",
    vintage: 2015,
    region: "Médoc",
    appellation: "Médoc",
    country: "Francia",
    type: "tinto",
    style: "escaneo",
    priceHint: "158,90 €",
    wineryAsset: "vinedo-chateau-margaux.jpg",
    frontLabelImage: "idb:alta-beychevelle-2015",
    labelThumb: "idb:alta-beychevelle-2015",
    provenance: {
      intake: "usuario",
      intakeStatus: "CONFIRMED",
      zoneId: "Médoc",
      wineryId: "margaux",
      region: "valor por defecto",
      price: "página"
    }
  }, extra || {});
}

const wine = entry();
const bottle = { uid: "b1", wineId: wine.id, qty: 2, cellarId: "v1", bin: "C-02", price: 158.9, note: "balda", labelPhoto: "idb:alta-beychevelle-2015" };
const store = { customWines: [wine], bottles: [bottle], inbox: [], cuvees: {} };
assert.strictEqual(shownAppellation(wine), "");
assert.strictEqual(migrateV110Margaux(store), true);
assert.strictEqual(store.migrations["v110-margaux"].action, "corrected");
assert.strictEqual(store.migrations["v110-margaux"].count, 1);
assert.strictEqual(wine.id, "alta-beychevelle-2015");
assert.strictEqual(wine.name, "Margaux du Château Margaux");
assert.strictEqual(wine.producer, "Château Margaux");
assert.strictEqual(wine.appellation, "AOC Margaux");
assert.strictEqual(wine.region, "Margaux");
assert.strictEqual(wine.type, "tinto");
assert.strictEqual(wine.vintage, 2015);
assert.strictEqual(wine.priceHint, "158,90 €");
assert.strictEqual(wine.frontLabelImage, "idb:alta-beychevelle-2015");
assert.strictEqual(wine.wineryAsset, "vinedo-chateau-margaux.jpg");
assert.strictEqual(bottle.bin, "C-02");
assert.strictEqual(bottle.price, 158.9);
assert.strictEqual(bottle.qty, 2);
assert.strictEqual(bottle.labelPhoto, "idb:alta-beychevelle-2015");
assert.strictEqual(shownAppellation(wine), "AOC Margaux");
assert.strictEqual(migrateV110Margaux(store), false);
assert.strictEqual(wine.name, "Margaux du Château Margaux");

const first = entry({ id: "una" });
const second = entry({ id: "otra" });
const ambiguous = { customWines: [first, second], bottles: [], cuvees: {} };
assert.strictEqual(migrateV110Margaux(ambiguous), true);
assert.strictEqual(ambiguous.migrations["v110-margaux"].action, "skipped-many");
assert.strictEqual(first.name, "Château Beychevelle");
assert.strictEqual(second.name, "Château Beychevelle");

const alone = entry({ id: "sin-grabado", wineryAsset: "vinedo.jpg", provenance: { intakeStatus: "CONFIRMED", region: "valor por defecto", zoneId: "Médoc", wineryId: "", price: "página", intake: "usuario" } });
const noArt = { customWines: [alone], bottles: [], cuvees: {} };
assert.strictEqual(migrateV110Margaux(noArt), true);
assert.strictEqual(noArt.migrations["v110-margaux"].action, "none");
assert.strictEqual(alone.producer, "Château Beychevelle");

assert.ok(!v110.includes("localStorage.clear"));
assert.ok(read("sw.js").includes("./casa-v110.js"));
assert.ok(read("sw.js").includes('"casa-llavaneras-ios-v111"'));
assert.ok(read("sw.js").includes('"casa-llavaneras-jesus-ios-v111"'));
assert.ok(read("app.js").includes('APP_VERSION = "v111"'));
assert.ok(read("index.html").includes("casa-v110.js?v=111"));
assert.ok(!ficha.includes('"valor por defecto": "src.default"'));
assert.ok(ficha.includes('"catálogo": "src.catalog"'));

console.log("v110-beychevelle ok");

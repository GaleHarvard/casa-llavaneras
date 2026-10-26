/* v102: el grabado de Pago de los Capellanes entra en el catálogo. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const bodegas = fs.readFileSync(path.join(root, "bodegas.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const wines = fs.readFileSync(path.join(root, "wines.js"), "utf8");

global.window = global.window || {};
eval(bodegas);
eval(wines);

assert.strictEqual(WINERY_CARDS.length, 59);
const card = WINERY_CARDS.find(item => item.id === "pago-de-los-capellanes");
assert.ok(card);
assert.strictEqual(card.name, "Pago de los Capellanes");
assert.strictEqual(card.zone, "Ribera del Duero");
assert.strictEqual(card.file, "bodega-pago-de-los-capellanes.jpg");
assert.deepStrictEqual(card.aliases, ["Pago de Capellanes", "Pago de los Capellanes", "Bodegas Pago de los Capellanes"]);
assert.ok(fs.existsSync(path.join(root, card.file)));
assert.ok(fs.statSync(path.join(root, card.file)).size > 1000);

["Pago de los Capellanes", "Pago de Capellanes", "Bodegas Pago de los Capellanes"].forEach(producer => {
  assert.strictEqual(wineryImageFor({ producer: producer, name: "Crianza" }), "bodega-pago-de-los-capellanes.jpg", producer);
});
assert.strictEqual(wineryImageFor({ producer: "Pago de Carraovejas", name: "Crianza" }), "bodega-pago-de-carraovejas.jpg");
assert.strictEqual(wineryImageFor({ producer: "Bodegas Luis Cañas", name: "Luis Cañas" }), "bodega-luis-canas.jpg");
assert.strictEqual(wineryImageFor({ producer: "Château Margaux", name: "Margaux" }), "vinedo-chateau-margaux.jpg");

const library = WINERY_LIBRARY.find(item => item.file === "bodega-pago-de-los-capellanes.jpg");
assert.strictEqual(library.name, "Pago de los Capellanes");
assert.strictEqual(WINERY_LIBRARY.filter(item => item.file === "bodega-luis-canas.jpg").length, 1);
assert.strictEqual(WINERY_LIBRARY.filter(item => item.file === "bodega-garcia-figuero.jpg").length, 1);

const catalog = (window.WINE_CATALOG || []).filter(wine => /capellan/i.test((wine.producer || "") + " " + (wine.name || "")));
assert.deepStrictEqual(catalog, []);
assert.ok(!/capellan/i.test(wines));

assert.ok(sw.includes("./bodega-pago-de-los-capellanes.jpg"));
assert.ok(sw.includes('const CACHE = "casa-llavaneras-ios-v102"'));
assert.ok(sw.includes("client.navigate"));
assert.ok(sw.includes('data.type === "skip-waiting"'));
assert.ok(app.includes('APP_VERSION = "v102"'));
assert.ok(html.includes('content="v102"'));
assert.ok(html.includes("reg.update()"));
assert.ok(html.includes("casa-sw-version"));
assert.ok(alta.includes('"pago-de-los-capellanes": 1'));
assert.ok(bodegas.includes("bodega-pago-de-los-capellanes.jpg"));
assert.ok(!bodegas.includes("bodegas-pago-de-capellanes.jpg"));

console.log("v102-capellanes ok");

/* v108: el grabado de Bodegas Muriel entra en el catálogo compartido. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const bodegas = read("bodegas.js");
const sw = read("sw.js");
const app = read("app.js");
const html = read("index.html");
const jesus = read("jesus/index.html");

global.window = global.window || {};
eval(bodegas);

assert.strictEqual(WINERY_CARDS.length, 60);
const card = WINERY_CARDS.find(item => item.id === "bodegas-muriel");
assert.ok(card);
assert.strictEqual(card.name, "Bodegas Muriel");
assert.deepStrictEqual(card.aliases, ["Muriel"]);
assert.strictEqual(card.country, "España");
assert.strictEqual(card.zone, "Rioja");
assert.strictEqual(card.zoneText, "Rioja Alavesa");
assert.strictEqual(card.town, "Elciego");
assert.strictEqual(card.file, "bodega-muriel.jpg");
assert.strictEqual(card.about, "");
assert.strictEqual(card.web, "");
assert.strictEqual(card.address, "");
assert.strictEqual(card.founded, "");
assert.deepStrictEqual(card.wines, []);
assert.strictEqual(card.lat, null);
assert.strictEqual(card.lng, null);
assert.ok(fs.existsSync(path.join(root, card.file)));
assert.ok(fs.statSync(path.join(root, card.file)).size > 20000);

const library = WINERY_LIBRARY.find(item => item.file === "bodega-muriel.jpg");
assert.strictEqual(library.name, "Bodegas Muriel");
assert.deepStrictEqual(library.aliases, ["Muriel"]);
assert.strictEqual(WINERY_LIBRARY.filter(item => item.file === "bodega-muriel.jpg").length, 1);
assert.strictEqual(WINERY_LIBRARY.filter(item => item.file === "bodega-marques-de-murrieta.jpg").length, 1);

["Bodegas Muriel", "Muriel", "Bodega Muriel"].forEach(producer => {
  assert.strictEqual(wineryImageFor({ producer: producer, name: "Crianza" }), "bodega-muriel.jpg", producer);
});
assert.strictEqual(wineryImageFor({ producer: "Marqués de Murrieta", name: "Castillo Ygay" }), "bodega-marques-de-murrieta.jpg");
assert.strictEqual(wineryImageFor({ producer: "Pago de los Capellanes", name: "Crianza" }), "bodega-pago-de-los-capellanes.jpg");

assert.ok(sw.includes("./bodega-muriel.jpg"));
assert.ok(sw.includes("./bodega-pago-de-los-capellanes.jpg"));
assert.ok(sw.includes('"casa-llavaneras-ios-v109"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v109"'));
assert.ok(sw.includes('const VERSION = "v109"'));
assert.ok(!sw.includes("client.navigate"));
assert.ok(app.includes('APP_VERSION = "v109"'));
assert.ok(html.includes('content="v109"'));
assert.ok(jesus.includes('content="v109"'));
assert.ok(read("jesus/sw.js").includes('importScripts("../sw.js?v=109")'));
assert.ok(!bodegas.includes("bodegas-muriel.jpg"));
assert.ok(bodegas.includes("bodega-muriel.jpg"));

console.log("v108-muriel ok");

/* v112: el grabado de Dominio del Challao entra en el catálogo compartido. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
global.window = global.window || {};
eval(read("bodegas.js"));

assert.strictEqual(WINERY_CARDS.length, 61);
const card = WINERY_CARDS.find(item => item.id === "dominio-del-challao");
assert.ok(card);
assert.strictEqual(card.name, "Dominio del Challao");
assert.deepStrictEqual(card.aliases, ["Challao", "Dominio Challao"]);
assert.strictEqual(card.country, "España");
assert.strictEqual(card.zone, "Rioja");
assert.strictEqual(card.zoneText, "Rioja Alavesa");
assert.strictEqual(card.town, "");
assert.strictEqual(card.address, "");
assert.strictEqual(card.about, "");
assert.strictEqual(card.founded, "");
assert.deepStrictEqual(card.wines, []);
assert.strictEqual(card.lat, null);
assert.strictEqual(card.lng, null);
assert.strictEqual(card.web, "https://www.dominiodelchallao.com/");
assert.deepStrictEqual(card.sources, ["https://www.dominiodelchallao.com/"]);
assert.strictEqual(card.file, "bodega-dominio-del-challao.jpg");
const file = path.join(root, card.file);
const buf = fs.readFileSync(file);
assert.strictEqual(buf.readUInt16BE(0), 0xffd8);
assert.ok(buf.length > 80000);

const library = WINERY_LIBRARY.find(item => item.file === card.file);
assert.strictEqual(library.name, "Dominio del Challao");
["Dominio del Challao", "Dominio Challao", "Challao"].forEach(producer => {
  assert.strictEqual(wineryImageFor({ producer: producer, name: "Tinto" }), card.file, producer);
});
assert.strictEqual(wineryImageFor({ producer: "Bodegas Muriel", name: "Crianza" }), "bodega-muriel.jpg");
assert.strictEqual(wineryImageFor({ producer: "Château Beychevelle", name: "2015" }), "bodega-chateau-beychevelle.jpg");

const sw = read("sw.js");
assert.ok(sw.includes("./bodega-dominio-del-challao.jpg"));
assert.ok(sw.includes('"casa-llavaneras-ios-v112"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v112"'));
assert.ok(sw.includes('const VERSION = "v112"'));
assert.ok(read("app.js").includes('APP_VERSION = "v112"'));
assert.ok(read("index.html").includes('content="v112"'));
assert.ok(read("jesus/sw.js").includes('importScripts("../sw.js?v=112")'));
assert.ok(read("casa-estado.js").includes('"vinoteca.pro.max.v3"'));
assert.ok(read("casa-estado.js").includes('jesusExampleSeed = "v111"'));
assert.ok(fs.existsSync(path.join(root, "hero-render.jpg")));
assert.ok(fs.existsSync(path.join(root, "bodega-muriel.jpg")));

console.log("v112-challao ok");

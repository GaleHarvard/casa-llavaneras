/* v111: solo cambia el grabado de Château Beychevelle. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
global.window = global.window || {};
eval(read("bodegas.js"));

const entry = WINERY_LIBRARY.find(item => item.name === "Château Beychevelle");
assert.ok(entry);
assert.strictEqual(entry.file, "bodega-chateau-beychevelle.jpg");
assert.deepStrictEqual(entry.aliases, ["Beychevelle", "Ch. Beychevelle"]);
assert.strictEqual(wineryImageFor({ producer: "Château Beychevelle", name: "2015" }), "bodega-chateau-beychevelle.jpg");
assert.strictEqual(wineryImageFor({ producer: "Beychevelle", name: "Réserve" }), "bodega-chateau-beychevelle.jpg");
assert.strictEqual(wineryImageFor({ producer: "Château Latour", name: "Latour" }), "bodega-chateau-latour.jpg");
assert.strictEqual(wineryImageFor({ producer: "Château Margaux", name: "Margaux" }), "vinedo-chateau-margaux.jpg");
assert.ok(!WINERY_CARDS.some(card => card && /beychevelle/i.test(card.name || "")));

const file = path.join(root, "bodega-chateau-beychevelle.jpg");
const buf = fs.readFileSync(file);
assert.strictEqual(buf.readUInt16BE(0), 0xffd8);
assert.ok(buf.length > 80000);
const sw = read("sw.js");
const app = read("app.js");
const html = read("index.html");
assert.ok(sw.includes("./bodega-chateau-beychevelle.jpg"));
assert.ok(sw.includes('"casa-llavaneras-ios-v111"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v111"'));
assert.ok(sw.includes('const VERSION = "v111"'));
assert.ok(app.includes('APP_VERSION = "v111"'));
assert.ok(html.includes('content="v111"'));
assert.ok(read("jesus/sw.js").includes('importScripts("../sw.js?v=111")'));
assert.ok(read("casa-estado.js").includes('"vinoteca.pro.max.v3"'));
assert.ok(read("casa-estado.js").includes('"jesus.vinoteca.pro.max.v3"'));
assert.ok(fs.existsSync(path.join(root, "hero-render.jpg")));
assert.ok(fs.existsSync(path.join(root, "vinedo-chateau-margaux.jpg")));

console.log("v111-beychevelle ok");

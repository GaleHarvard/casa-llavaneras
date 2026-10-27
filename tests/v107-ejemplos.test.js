/* v107: Jesús ve tres ejemplos. José conserva el catálogo y la cava de siempre. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const estado = read("casa-estado.js");
const mesa = read("casa-mesa.js");
const sw = read("sw.js");
const app = read("app.js");
const html = read("index.html");
const jesusHtml = read("jesus/index.html");
const wines = read("wines.js");

assert.ok(estado.includes('wineId: "tondonia-reserva-2011"'));
assert.ok(estado.includes('wineId: "pingus-2018"') === false);
assert.ok(estado.includes("function jesusExampleBottles"));
assert.ok(estado.includes('wineId: "margaux-2016"'));
assert.ok(estado.includes('wineId: "vs-unico-2009"'));
assert.ok(estado.includes('wineId: "riscal-reserva-2019"'));
assert.ok(estado.includes('cellarId: "j-fr"'));
assert.ok(estado.includes('cellarId: "j-es"'));
assert.ok(estado.includes("function seedJesusExamples"));
assert.ok(estado.includes("jesusExamplesUntouched"));
assert.ok(estado.includes('parsed.jesusExampleSeed = "v107"'));
assert.ok(estado.includes("if (CASA_EDITION === \"jesus\")"));
assert.ok(estado.includes('if (CASA_EDITION === "jesus") return ""'));
assert.ok(!estado.includes("localStorage.clear"));
assert.ok(estado.includes('"vinoteca.pro.max.v3"'));
assert.ok(estado.includes('"jesus.vinoteca.pro.max.v3"'));

assert.ok(mesa.includes('const JESUS_EXAMPLE_IDS = ["margaux-2016", "vs-unico-2009", "riscal-reserva-2019"]'));
assert.ok(mesa.includes("jesusMesa() ? mesaSource() : WINE_CATALOG"));
assert.ok(mesa.includes("jesusMesa() && !jesusOwnsWine(wine.id)"));
assert.ok(!mesa.includes("Único 2014"));

assert.ok(wines.includes('id: "margaux-2016"'));
assert.ok(wines.includes('appellation: "AOC Margaux 1er Cru"'));
assert.ok(wines.includes('id: "vs-unico-2009"'));
assert.ok(wines.includes('appellation: "DO Ribera del Duero"'));
assert.ok(wines.includes('id: "riscal-reserva-2019"'));
assert.ok(wines.includes('producer: "Marqués de Riscal"'));
assert.ok(wines.includes("vintage: 2019"));

assert.ok(sw.includes('"casa-llavaneras-ios-v107"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v107"'));
assert.ok(sw.includes('const VERSION = "v107"'));
assert.ok(app.includes('APP_VERSION = "v107"'));
assert.ok(html.includes('content="v107"'));
assert.ok(jesusHtml.includes('content="v107"'));
assert.ok(read("jesus/sw.js").includes('importScripts("../sw.js?v=107")'));
assert.ok(!html.includes("Jesús Gómez"));
assert.ok(html.includes('<div class="mark">J.G.C.</div>'));

console.log("v107-ejemplos ok");

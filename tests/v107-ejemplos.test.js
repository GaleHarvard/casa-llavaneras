/* v107: Jesús ve tres ejemplos. José conserva el catálogo y la cava de siempre. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const crypto = require("crypto");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const estado = read("casa-estado.js");
const mesa = read("casa-mesa.js");
const sw = read("sw.js");
const app = read("app.js");
const html = read("index.html");
const jesusHtml = read("jesus/index.html");
const wines = read("wines.js");
const vino = read("casa-vino.js");

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
assert.ok(estado.includes('parsed.jesusExampleSeed = "v111"'));
assert.ok(estado.includes("if (CASA_EDITION === \"jesus\")"));
assert.ok(estado.includes('if (CASA_EDITION === "jesus") return ""'));
assert.ok(estado.includes('if (CASA_EDITION === "jesus" && w && JESUS_EXAMPLE_LABELS[w.id]) return JESUS_EXAMPLE_LABELS[w.id];'));
assert.ok(estado.includes('"margaux-2016": "etiquetas/margaux-2016.png"'));
assert.ok(estado.includes('"vs-unico-2009": "etiquetas/vs-unico-2009.png"'));
assert.ok(estado.includes('"riscal-reserva-2019": "etiquetas/riscal-reserva-2019.png"'));
assert.ok(read("casa-v105.js").includes("etiquetas\\/"));
const labelHashes = ["margaux-2016.png", "vs-unico-2009.png", "riscal-reserva-2019.png"].map(name => {
  const bytes = fs.readFileSync(path.join(root, "jesus", "etiquetas", name));
  assert.strictEqual(bytes.readUInt32BE(0), 0x89504e47);
  assert.ok(bytes.length > 20000);
  return crypto.createHash("md5").update(bytes).digest("hex");
});
assert.strictEqual(new Set(labelHashes).size, 3);
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
assert.ok(vino.includes('"margaux-2016": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/chmar16_anv800.png"'));
assert.ok(vino.includes('"riscal-reserva-2019": "https://cdn.vinissimus.com/img/unsafe/p500x/plain/local:///prfmtgrande/vi/mrisr19_anv800.png"'));
assert.ok(!vino.includes("vs-unico-2009"));
assert.ok(!vino.includes("etiquetas/"));

assert.ok(sw.includes('"casa-llavaneras-ios-v111"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v111"'));
assert.ok(sw.includes('const VERSION = "v111"'));
assert.ok(app.includes('APP_VERSION = "v111"'));
assert.ok(html.includes('content="v111"'));
assert.ok(jesusHtml.includes('content="v111"'));
assert.ok(read("jesus/sw.js").includes('importScripts("../sw.js?v=111")'));
assert.ok(!html.includes("Jesús Gómez"));
assert.ok(html.includes('<div class="mark">J.G.C.</div>'));

console.log("v107-ejemplos ok");

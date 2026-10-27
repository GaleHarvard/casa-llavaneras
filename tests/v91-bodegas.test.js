/* Las bodegas ilustradas tienen ficha, alias y solo zonas que ya existen. */
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
const bodegas = fs.readFileSync(path.join(root, "bodegas.js"), "utf8");
const v88 = fs.readFileSync(path.join(root, "casa-v88.js"), "utf8");
const v91 = fs.readFileSync(path.join(root, "casa-v91.js"), "utf8");
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const vinoteca = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

eval(bodegas);
eval(extractFunction(vino, "foldEstate"));
eval(extractFunction(v88, "fieldValue"));
eval(extractFunction(v88, "levenshtein"));
eval(extractFunction(v88, "fuzzyRatio"));
eval(extractFunction(v91, "fuzzyWineryHit"));

const zoneSrc = vinoteca.slice(0, vinoteca.indexOf("const ZONE_DO"));
const zoneNames = new Set(Array.from(zoneSrc.matchAll(/name: "([^"]+)"/g)).map(hit => hit[1]));

assert.strictEqual(WINERY_CARDS.length, 59);
const files = {};
const missing = [];
WINERY_CARDS.forEach(card => {
  assert.ok(card.id && card.name && card.country, card.id);
  if (card.zone) assert.ok(zoneNames.has(card.zone), card.id + " zona " + card.zone);
  if (card.file) {
    const full = path.join(root, card.file);
    assert.ok(fs.existsSync(full), card.file);
    files[card.file] = (files[card.file] || 0) + 1;
  }
  ["town", "web", "address", "about"].forEach(key => {
    if (!String(card[key] || "").trim()) missing.push(card.name + ": " + key);
  });
  if (!card.founded) missing.push(card.name + ": founded");
  if (!card.lat && card.lat !== 0) missing.push(card.name + ": coords");
  if (!card.wines || !card.wines.length) missing.push(card.name + ": wines");
  if (!card.zone) missing.push(card.name + ": zone");
});
assert.strictEqual(files["bodega-domaine-leflaive.jpg"], 1);
assert.strictEqual(fs.statSync(path.join(root, "bodega-domaine-coche-dury.jpg")).size, 175812);
const pending = WINERY_CARDS.filter(card => !card.file).map(card => card.id).sort();
assert.deepStrictEqual(pending, []);
assert.strictEqual(WINERY_CARDS.find(card => card.id === "cecile-tremblay").town, "Morey-Saint-Denis");
assert.ok(sw.includes("./bodega-domaine-cecile-tremblay.jpg"));
assert.ok(!v91.includes("bodega-domaine-leflaive.jpg"));

const tio = fuzzyWineryHit({ producer: { value: "Tío Pepe" }, name: { value: "" } });
assert.strictEqual(tio && tio.name, "González Byass");
const ygay = fuzzyWineryHit({ producer: { value: "Castillo Ygay" }, name: { value: "" } });
assert.strictEqual(ygay && ygay.name, "Marqués de Murrieta");
const coche = fuzzyWineryHit({ producer: { value: "Coche Dury" }, name: { value: "Meursault" } });
assert.strictEqual(coche && coche.id, "coche-dury");
const datos = JSON.parse(fs.readFileSync(path.join(root, "data/bodegas-datos.json"), "utf8"));
assert.strictEqual(datos.length, 58);
const byName = {};
WINERY_CARDS.forEach(card => { byName[card.name] = card; });
assert.strictEqual(byName["Vega Sicilia"].web, "https://temposvegasicilia.com/");
assert.strictEqual(byName["Ramón Bilbao"].web, "https://bodegasramonbilbao.com/");
assert.strictEqual(byName["Scala Dei"].web, "https://cellersdescaladei.com/");
assert.strictEqual(byName["Ysios"].web, "https://bodegasysios.com/");
assert.strictEqual(byName["Familia Torres"].web, "https://www.torres.es/");
assert.strictEqual(byName["Château Massamier la Mignarde"].web, "https://massamier-la-mignarde.com/");
assert.strictEqual(byName["Familia Torres"].precision, "municipio");
assert.strictEqual(byName["Petrus"].founded, "siglo XVIII");
assert.ok(byName["Vega Sicilia"].sources.length);
assert.strictEqual(byName["Bodegas Luis Cañas"].file, "bodega-luis-canas.jpg");
assert.strictEqual(byName["Bodegas Luis Cañas"].zone, "Rioja");
assert.ok(byName["Bodegas Luis Cañas"].wines.includes("Luis Cañas"));
assert.strictEqual(byName["Bodegas y Viñedos García Figuero"].file, "bodega-garcia-figuero.jpg");
assert.strictEqual(byName["Bodegas y Viñedos García Figuero"].zone, "Ribera del Duero");
assert.ok(byName["Bodegas y Viñedos García Figuero"].wines.includes("Figuero Viñas Viejas"));
assert.ok(sw.includes("./bodega-luis-canas.jpg"));
assert.ok(sw.includes("./bodega-garcia-figuero.jpg"));
assert.strictEqual(wineryImageFor({ producer: "Bodegas Luis Cañas", name: "Luis Cañas" }), "bodega-luis-canas.jpg");
assert.strictEqual(wineryImageFor({ producer: "Bodegas y Viñedos García Figuero", name: "Viñas Viejas" }), "bodega-garcia-figuero.jpg");
assert.strictEqual(wineryImageFor({ producer: "Figuero", name: "Figuero Viñas Viejas" }), "bodega-garcia-figuero.jpg");
assert.ok(vino.includes("https://temposvegasicilia.com/"));
assert.ok(vinoteca.includes("https://bodegasramonbilbao.com/"));
assert.ok(v91.includes("wineries.sources"));
assert.ok(v91.includes('precision === "municipio"'));

assert.ok(html.includes('id="bodegas"'));
assert.ok(html.includes("casa-v91.js?v=104"));
assert.ok(app.includes('APP_VERSION = "v104"'));
assert.ok(sw.includes("casa-llavaneras-ios-v104"));
assert.ok(sw.includes("./bodega-domaine-georges-roumier.jpg"));
assert.ok(sw.includes("./casa-v91.js"));
["wineries.h1", "wineries.open", "wineries.artPending", "wineries.noZone", "wineries.sources"].forEach(key => {
  const line = i18n.split("\n").find(row => row.indexOf('["' + key + '"') >= 0);
  assert.ok(line, key);
  assert.strictEqual(line.split('", "').length, 6, key);
});
assert.ok(v91.includes("openBodegaList"));
assert.ok(v91.includes("fuzzyWineryHit"));
assert.ok(!vinoteca.includes("bodega-domaine-coche-dury"));

console.log("v91-bodegas ok");
console.log("fichas " + WINERY_CARDS.length);
console.log("sin ilustración " + pending.join(", "));
console.log("huecos " + missing.length);
missing.forEach(line => console.log("  " + line));

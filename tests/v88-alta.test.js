/* Alta v88: visión, coincidencia aproximada y bodega con pin de reserva. */
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

function extractDecl(src, name) {
  let start = src.indexOf("const " + name);
  if (start < 0) start = src.indexOf("var " + name);
  if (start < 0) throw new Error("falta " + name);
  let i = start;
  while (i < src.length && src[i] !== "{" && src[i] !== "[") i += 1;
  const open = src[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === open) depth += 1;
    else if (src[i] === close) {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1) + ";";
    }
  }
  throw new Error("sin cierre " + name);
}

const root = path.join(__dirname, "..");
const v88 = fs.readFileSync(path.join(root, "casa-v88.js"), "utf8");
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const bodegas = fs.readFileSync(path.join(root, "bodegas.js"), "utf8");
const vinoteca = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8");
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

global.window = global.window || {};
eval(fs.readFileSync(path.join(root, "wines.js"), "utf8"));
eval(bodegas);
global.WINERY_PLACES = WINERY_PLACES;

const api = new Function("WINE_CATALOG", [
  "function t(key) { return key; }",
  extractDecl(vino, "BODEGA_GEO"),
  extractDecl(vino, "ESTATE_MORE"),
  extractFunction(vino, "foldEstate"),
  extractFunction(vino, "estateNeedle"),
  extractFunction(vino, "estateHit"),
  extractFunction(vino, "isShopUrl"),
  extractFunction(vino, "pinOk"),
  extractDecl(v88, "TOWN_PINS"),
  extractDecl(v88, "DO_CENTROIDS"),
  extractFunction(v88, "asField"),
  extractFunction(v88, "combineField"),
  extractFunction(v88, "levenshtein"),
  extractFunction(v88, "fuzzyRatio"),
  extractFunction(v88, "catalogList"),
  extractFunction(v88, "fieldValue"),
  extractFunction(v88, "fuzzyCatalogHit"),
  extractFunction(v88, "intakeHost"),
  extractFunction(v88, "officialHostOk"),
  extractFunction(v88, "chunkMentions"),
  extractFunction(v88, "citedWebUrl"),
  extractFunction(v88, "townPinFor"),
  extractFunction(v88, "doCentroidFor"),
  extractFunction(v88, "resolvedPin"),
  extractFunction(v88, "intakeEsc"),
  extractFunction(v88, "mapLinksHtml"),
  "return { fuzzyRatio, fuzzyCatalogHit, combineField, officialHostOk, citedWebUrl, resolvedPin, estateHit, mapLinksHtml };"
].join("\n"))(window.WINE_CATALOG);

function bag(fields) {
  const out = {};
  Object.keys(fields).forEach(key => {
    const value = fields[key];
    out[key] = typeof value === "object" ? value : { value: value, confidence: 0.9 };
  });
  return out;
}

const circe = api.fuzzyCatalogHit(bag({
  name: "Circe Verdejo",
  producer: "Bodegas Avelino Vegas",
  appellation: "DO Rueda",
  vintage: "2025",
  type: "blanco",
  grapes: "Verdejo"
}));
assert.strictEqual(circe, null, circe && circe.wine.id + " " + circe.score);

const pintas = api.fuzzyCatalogHit(bag({
  name: "Pintas",
  producer: "Wine & Soul",
  appellation: "Douro",
  vintage: "2022",
  type: "tinto"
}));
assert.strictEqual(pintas, null, pintas && pintas.wine.id + " " + pintas.score);

const mono = api.fuzzyCatalogHit(bag({
  name: "Monopole",
  producer: "CVNE",
  appellation: "DOCa Rioja",
  vintage: "2022",
  type: "blanco",
  grapes: "Viura"
}));
assert.ok(mono, "Monopole sin coincidencia");
assert.strictEqual(mono.wine.id, "cvne-monopole-2022");
assert.strictEqual(mono.sameYear, true);

const typed = api.fuzzyCatalogHit(bag({ name: "CVNE Monopole 2022", vintage: "2022" }));
assert.ok(typed && typed.wine.id === "cvne-monopole-2022", typed && typed.wine.id);
assert.strictEqual(api.fuzzyCatalogHit(bag({ name: "Circe Verdejo 2025", vintage: "2025" })), null);
assert.strictEqual(api.fuzzyCatalogHit(bag({ name: "Pintas 2022", producer: "Wine & Soul", vintage: "2022" })), null);

assert.strictEqual(api.combineField({ value: "13%", confidence: 0.55 }, { value: "13,5%", confidence: 0.92 }).value, "13,5%");
assert.strictEqual(api.combineField({ value: "Circe", confidence: 0.9 }, { value: "Otro", confidence: 0.4 }).value, "Circe");

assert.strictEqual(api.officialHostOk("https://avelinovegas.com/", "Bodegas Avelino Vegas", "Circe"), true);
assert.strictEqual(api.officialHostOk("https://www.vinissimus.com/es/circe", "Bodegas Avelino Vegas", "Circe"), false);
assert.strictEqual(api.officialHostOk("https://www.circe.wine/contacto/", "Bodegas Avelino Vegas", "Circe"), true);
assert.strictEqual(api.officialHostOk("http://avelinovegas.com/", "Bodegas Avelino Vegas", "Circe"), false);

const chunks = [{ uri: "https://avelinovegas.com/contacto/", title: "Contacto" }];
assert.strictEqual(api.citedWebUrl("https://avelinovegas.com/", chunks, "Bodegas Avelino Vegas", "Circe"), "https://avelinovegas.com/");
assert.strictEqual(api.citedWebUrl("https://avelinovegas.com/", [], "Bodegas Avelino Vegas", "Circe"), "");
assert.strictEqual(api.citedWebUrl("https://www.vinissimus.com/x", chunks, "Bodegas Avelino Vegas", "Circe"), "https://avelinovegas.com/contacto/");

const estate = api.estateHit({ producer: "Bodegas Avelino Vegas", name: "Circe" });
assert.strictEqual(estate.lat, 41.161401);
assert.strictEqual(estate.lng, -4.574553);
assert.ok(estate.web.indexOf("https://avelinovegas.com/") === 0);

const onlyDo = { producer: "Casa Nueva", name: "Blanco", appellation: "DO Rueda", region: "Rueda", geo: {} };
const links = api.mapLinksHtml(onlyDo, {});
assert.ok(!links.includes("Sin dato"));
assert.ok(!links.includes("map.noPin"));
assert.ok(links.includes("41.414"));
assert.ok(links.includes("map.pinDo"));
assert.strictEqual(api.resolvedPin(onlyDo, {}).approx, "do");

const town = api.resolvedPin(
  { producer: "Otra", name: "Verdejo", appellation: "", region: "" },
  { zone: "Santiuste de San Juan Bautista", address: "40460 Santiuste de San Juan Bautista" }
);
assert.strictEqual(town.approx, "municipio");
assert.ok(Math.abs(town.lat - 41.156944) < 0.0001);

const both = extractFunction(v88, "readBothLabels");
assert.ok(both.indexOf("visionOnce") >= 0 && both.indexOf("visionOnce") < both.indexOf("readLabelsOffline"));
assert.ok(!v88.includes("identifyFromPhoto"));
assert.ok(gemini.includes("function searchPublishedScores(wineId, quiet)"));
assert.ok(gemini.includes("if (quiet) return;"));
assert.ok(gemini.includes("quotaTries < 2"));
assert.ok(gemini.includes("if (typeof resetLabelPair === \"function\") resetLabelPair();"));
assert.ok(!vinoteca.includes('t("map.noPin")'));
assert.ok(vinoteca.includes("mapLinksHtml"));
assert.ok(i18n.includes("Guardar y añadir otra"));
assert.ok(i18n.includes("Fotografiar contraetiqueta"));
assert.ok(i18n.includes("map.pinTown"));
["ca", "en", "fr", "pt"].forEach(code => {
  assert.ok(i18n.includes("alta.saveAnother"));
});
assert.ok(app.includes('APP_VERSION = "v102"'));
assert.ok(sw.includes("casa-llavaneras-ios-v102"));
assert.ok(sw.includes("./casa-v88.js"));
assert.ok(html.includes('content="v102"'));
assert.ok(html.includes("casa-v88.js?v=102"));
assert.ok(html.includes('id="alta"'));
assert.ok(!html.includes("?v=87"));

console.log("v88-alta ok");
console.log("circe catalogo null");
console.log("pintas catalogo null");
console.log("monopole " + mono.wine.id + " " + mono.score);

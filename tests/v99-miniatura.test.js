/* La cabecera no usa la botella genérica de otro vino. */
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
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const heroFn = extractFunction(alta, "wineHeroHtml");
const estateFn = extractFunction(vino, "estateSVG");
assert.ok(!heroFn.includes("bottleMarkup"));
assert.ok(heroFn.includes("hero-art-full"));
assert.ok(!estateFn.includes("bottleMarkup"));
assert.ok(estateFn.includes("estate-photo-full"));
assert.ok(app.includes('APP_VERSION = "v107"'));
assert.ok(html.includes('content="v107"'));
assert.ok(sw.includes('"casa-llavaneras-ios-v107"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v107"'));
assert.ok(sw.includes('const VERSION = "v107"'));

const vinoteca = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8");
const zoneSrc = vinoteca.slice(0, vinoteca.indexOf("const ZONE_DO"));
const ZONES = new Function(zoneSrc + "\nreturn ZONES;")();
eval(fs.readFileSync(path.join(root, "bodegas.js"), "utf8"));
const api = new Function("ZONES", "WINERY_CARDS", "foldWinery", [
  extractFunction(alta, "foldAlta"),
  extractFunction(alta, "phraseHit"),
  extractFunction(alta, "altaLabels"),
  extractFunction(alta, "wineTitleLabels"),
  extractFunction(alta, "matchLocalAssets"),
  extractFunction(alta, "frontCoverSrc"),
  extractFunction(alta, "sheetIllustration"),
  extractFunction(alta, "wineHeroHtml"),
  "return { wineHeroHtml };"
].join("\n"));
global.escHtml = value => String(value == null ? "" : value);
global.GENERIC_ESTATE = GENERIC_ESTATE;
global.wineryImageFor = wineryImageFor;
global.wineryCardFor = () => null;
global.wineryCardById = id => WINERY_CARDS.find(card => card.id === id) || null;
global.labelSrc = () => "";
global.detectZone = () => null;
const mod = api(ZONES, WINERY_CARDS, foldWinery);

const murrieta = mod.wineHeroHtml({
  producer: "Marqués de Murrieta",
  name: "Rosado",
  vintage: 2024,
  region: "Rioja",
  appellation: "DOCa Rioja",
  type: "rosado"
});
assert.ok(murrieta.includes("bodega-marques-de-murrieta.jpg"));
assert.ok(murrieta.includes("hero-art-full"));
assert.ok(!murrieta.includes("foil-wrap"));
assert.ok(!/botella-(tinto|blanco|espumoso)/.test(murrieta));

const photo = "data:image/jpeg;base64,abc";
const labeled = mod.wineHeroHtml({
  producer: "Marqués de Murrieta",
  name: "Rosado",
  vintage: 2024,
  region: "Rioja",
  labelThumb: photo
});
assert.ok(labeled.includes("label-thumb-hero"));
assert.ok(labeled.includes(photo));
assert.ok(labeled.includes("foil-wrap"));
assert.ok(!labeled.includes("hero-art-full"));
assert.ok(!/botella-(tinto|blanco|espumoso)/.test(labeled));

console.log("v100-miniatura ok");

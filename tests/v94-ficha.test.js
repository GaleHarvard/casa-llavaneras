/* Cabecera, zona de catálogo y añada leída en la etiqueta. */
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
const vinoteca = fs.readFileSync(path.join(root, "casa-vinoteca.js"), "utf8");
const zoneSrc = vinoteca.slice(0, vinoteca.indexOf("const ZONE_DO"));
const ZONES = new Function(zoneSrc + "\nreturn ZONES;")();
eval(fs.readFileSync(path.join(root, "bodegas.js"), "utf8"));

const api = new Function("ZONES", "WINERY_CARDS", "foldWinery", [
  extractFunction(alta, "blankWineSheet"),
  extractFunction(alta, "foldAlta"),
  extractFunction(alta, "phraseHit"),
  extractFunction(alta, "altaLabels"),
  extractFunction(alta, "wineTitleLabels"),
  extractFunction(alta, "matchLocalAssets"),
  extractFunction(alta, "genericRegion"),
  extractFunction(alta, "samePlace"),
  extractFunction(alta, "zoneRecord"),
  extractFunction(alta, "placeForSheet"),
  extractFunction(alta, "frontCoverSrc"),
  extractFunction(alta, "sheetIllustration"),
  extractFunction(alta, "wineHeroHtml"),
  extractFunction(alta, "migrateClearZones"),
  "return { matchLocalAssets, placeForSheet, wineHeroHtml, migrateClearZones };"
].join("\n"));

global.escHtml = value => String(value == null ? "" : value);
global.GENERIC_ESTATE = "vinedo.jpg";
global.wineryCardFor = () => null;
global.wineryCardById = id => WINERY_CARDS.find(card => card.id === id) || null;
global.wineryImageFor = () => "vinedo.jpg";
global.detectZone = text => /ribera del duero/i.test(String(text || "")) ? { name: "Ribera del Duero", map: "mapa-ribera.jpg", country: "España" } : null;
global.estateArt = wine => ({ land: "vinedo.jpg", map: /ribera/i.test((wine && wine.region) || "") ? "mapa-ribera.jpg" : "" });
global.labelSrc = () => "";

const mod = api(ZONES, WINERY_CARDS, foldWinery);

const pera = mod.placeForSheet("Sin indicación geográfica", "Adega Cartuxa", "Terras Mancas");
assert.strictEqual(pera.winery.id, "cartuxa");
assert.strictEqual(pera.zone.name, "Alentejo");
assert.strictEqual(pera.label, "Alentejo");
assert.notStrictEqual(pera.label, "Terras Mancas");
assert.notStrictEqual(pera.label, "Adega Cartuxa");

const named = mod.matchLocalAssets("", "Pêra-Manca");
assert.strictEqual(named.winery.id, "cartuxa");
assert.notStrictEqual(mod.matchLocalAssets("", "Terras Mancas").winery && mod.matchLocalAssets("", "Terras Mancas").winery.id, "cartuxa");

const abadia = mod.placeForSheet("Abadía Retuerta", "Abadía Retuerta", "Selección Especial");
assert.strictEqual(abadia.label, "Vino de la Tierra de Castilla y León");
assert.strictEqual(abadia.zone, null);
assert.notStrictEqual(abadia.label, "Abadía Retuerta");

const kept = mod.placeForSheet("Rioja", "Marqués de Riscal", "Reserva");
assert.strictEqual(kept.label, "Rioja");

const label = "data:image/jpeg;base64," + "A".repeat(40);
const terras = {
  producer: "Adega Cartuxa",
  name: "Terras Mancas",
  region: "Alentejo",
  appellation: "Alentejo",
  labelThumb: label,
  wineryAsset: "bodega-cartuxa.jpg",
  provenance: { wineryId: "cartuxa", zoneId: "Alentejo" }
};
const terrasHtml = mod.wineHeroHtml(terras);
assert.strictEqual((terrasHtml.match(/label-thumb-hero/g) || []).length, 1);
assert.ok(terrasHtml.includes("hero-art"));
assert.ok(terrasHtml.includes(label));
assert.ok(terrasHtml.includes("bodega-cartuxa.jpg"));
assert.ok(!terrasHtml.includes("sheet-cover"));
assert.ok(!terrasHtml.includes("Etiqueta delantera"));
assert.ok(!terrasHtml.includes("vinedo.jpg"));

const capellanes = {
  producer: "Pago de los Capellanes",
  name: "Pago Garduña",
  region: "Ribera del Duero",
  appellation: "Ribera del Duero",
  labelThumb: label
};
const capHtml = mod.wineHeroHtml(capellanes);
assert.ok(capHtml.includes("mapa-ribera.jpg"));
assert.ok(capHtml.includes("hero-art"));
assert.ok(!capHtml.includes("vinedo.jpg"));
assert.strictEqual((capHtml.match(/label-thumb-hero/g) || []).length, 1);

const bare = mod.wineHeroHtml({ producer: "Pago de los Capellanes", name: "Crianza", region: "Ribera del Duero", appellation: "Ribera del Duero" });
assert.ok(bare.includes("hero-art"));
assert.ok(bare.includes("mapa-ribera.jpg"));
assert.ok(!bare.includes("label-thumb-hero"));
assert.ok(!bare.includes("vinedo.jpg"));

const state = {
  customWines: [
    { id: "t1", producer: "Adega Cartuxa", name: "Terras Mancas", vintage: 2019, region: "Sin indicación geográfica", appellation: "Sin indicación geográfica", provenance: {} },
    { id: "t2", producer: "Abadía Retuerta", name: "Selección Especial", vintage: 2018, region: "Abadía Retuerta", appellation: "Abadía Retuerta", provenance: {} },
    { id: "t3", producer: "Pago de los Capellanes", name: "Pago Garduña", vintage: 2020, region: "Ribera del Duero", appellation: "Ribera del Duero", provenance: {} }
  ]
};
global.state = state;
global.isCatalogWineId = () => false;
let saved = false;
global.save = () => { saved = true; };
assert.strictEqual(mod.migrateClearZones(), true);
assert.strictEqual(state.customWines[0].appellation, "Alentejo");
assert.strictEqual(state.customWines[0].vintage, 2019);
assert.strictEqual(state.customWines[1].appellation, "Vino de la Tierra de Castilla y León");
assert.strictEqual(state.customWines[1].vintage, 2018);
assert.strictEqual(state.customWines[2].appellation, "Ribera del Duero");
assert.strictEqual(state.customWines[2].vintage, 2020);
assert.strictEqual(saved, true);
assert.strictEqual(mod.migrateClearZones(), false);

assert.ok(alta.includes("vintageSource: sheet.vintage ? \"etiqueta\" : \"\""));
assert.ok(alta.includes("if (labelYear) sheet.vintage = labelYear"));
assert.ok(fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8").includes('vintageSource === "etiqueta"'));
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
assert.ok(css.includes(".hero-art"));
assert.ok(css.includes("isolation: isolate"));
const foil = css.slice(css.indexOf(".hero-row .foil-wrap {"), css.indexOf(".hero-row .label-thumb-hero"));
assert.ok(foil && !foil.includes("z-index"));
assert.ok(fs.readFileSync(path.join(root, "casa-util.js"), "utf8").includes("startX <= 28"));

console.log("v94 ficha ok");

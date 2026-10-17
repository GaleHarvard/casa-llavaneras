/* Alta v89: nombre repetido, respuesta cortada y código de barras. */
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
const v88 = fs.readFileSync(path.join(root, "casa-v88.js"), "utf8");
const v89 = fs.readFileSync(path.join(root, "casa-v89.js"), "utf8");
const vino = fs.readFileSync(path.join(root, "casa-vino.js"), "utf8");
const ficha = fs.readFileSync(path.join(root, "casa-ficha.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");

global.window = global.window || {};
eval(fs.readFileSync(path.join(root, "wines.js"), "utf8"));

const api = new Function("WINE_CATALOG", [
  "var LABEL_KEYS = ['name','producer','appellation','vintage','type','category','grapes','abv','volume','ean','web'];",
  "function t(key) { return key; }",
  extractFunction(vino, "foldEstate"),
  extractFunction(vino, "isShopUrl"),
  extractFunction(v88, "asField"),
  extractFunction(v88, "fieldValue"),
  extractFunction(v88, "levenshtein"),
  extractFunction(v88, "fuzzyRatio"),
  extractFunction(v88, "catalogList"),
  extractFunction(v88, "fuzzyCatalogHit"),
  extractFunction(v88, "normIntakeType"),
  extractFunction(v89, "clipText"),
  extractFunction(v89, "escapeReg"),
  extractFunction(v89, "stripLegalSuffix"),
  extractFunction(v89, "collapseRun"),
  extractFunction(v89, "uniqueSegments"),
  extractFunction(v89, "normalizeWineryName"),
  extractFunction(v89, "cleanAbv"),
  extractFunction(v89, "cleanVolume"),
  extractFunction(v89, "cleanVintage"),
  extractFunction(v89, "genericWineName"),
  extractFunction(v89, "composeWineName"),
  extractFunction(v89, "normalizeLabelBag"),
  extractFunction(v89, "bagFromParsed"),
  extractFunction(v89, "acceptGeminiLabel"),
  extractFunction(v89, "labelFailureText"),
  extractFunction(v89, "eanChecksumOk"),
  extractFunction(v89, "parseOffProduct"),
  extractFunction(v89, "emptyLabelBag"),
  extractFunction(v89, "fillIfEmpty"),
  extractFunction(v89, "mergeScanSources"),
  extractFunction(v89, "catalogByEan"),
  extractFunction(v89, "validIntakeIdentity"),
  extractFunction(v89, "sheetTitle"),
  extractFunction(v89, "repairRepeatedTitles"),
  "return { normalizeWineryName, normalizeLabelBag, acceptGeminiLabel, labelFailureText, eanChecksumOk, parseOffProduct, mergeScanSources, validIntakeIdentity, sheetTitle, repairRepeatedTitles, fuzzyCatalogHit, catalogByEan, composeWineName };"
].join("\n"))(window.WINE_CATALOG);

const repeat = ("Juvé & Camps S.A.U. / ").repeat(40);
assert.strictEqual(api.normalizeWineryName(repeat), "Juvé & Camps");
assert.ok(!api.normalizeWineryName(repeat).includes("/"));
assert.strictEqual(api.normalizeWineryName("Juvé & Camps B. Propietat d'Espiells S.A.U."), "Juvé & Camps");
assert.strictEqual(api.normalizeWineryName("Juvé & Camps B. Propietat d'Espiells S.A.U. / Juvé & Ca"), "Juvé & Camps");
assert.strictEqual(api.normalizeWineryName("Bodegas Avelino Vegas"), "Bodegas Avelino Vegas");
assert.strictEqual(api.normalizeWineryName("Wine & Soul"), "Wine & Soul");
assert.ok(api.normalizeWineryName("X".repeat(200)).length <= 80);
assert.ok(!v89.includes('.join(" / ")'));
assert.ok(!v89.includes('+ " / "'));

const kept = api.normalizeLabelBag({
  name: { value: "Reserva de la Familia", confidence: 0.95 },
  producer: { value: repeat, confidence: 0.9 },
  category: { value: "Gran Reserva Brut Nature", confidence: 0.9 },
  vintage: { value: "2018", confidence: 1 },
  type: { value: "espumoso", confidence: 0.9 },
  abv: { value: "12 % vol", confidence: 0.9 },
  volume: { value: "75 cl", confidence: 0.9 },
  ean: { value: "8424487600188", confidence: 0.8 },
  web: { value: "juveycamps.com", confidence: 0.8 },
  appellation: { value: "Cava, Comtats de Barcelona · Valls d'Anoia-Foix", confidence: 0.9 }
});
assert.strictEqual(kept.name.value, "Reserva de la Familia");
assert.strictEqual(kept.producer.value, "Juvé & Camps");
assert.strictEqual(kept.vintage.value, "2018");
assert.strictEqual(kept.abv.value, "12");
assert.strictEqual(kept.volume.value, "75 cl");
assert.ok(kept.name.value.length <= 80);

const composed = api.normalizeLabelBag({
  producer: { value: "Juvé & Camps B. Propietat d'Espiells S.A.U.", confidence: 0.9 },
  category: { value: "Gran Reserva Brut Nature", confidence: 0.9 },
  vintage: { value: "2018", confidence: 1 },
  type: { value: "cava", confidence: 0.8 }
});
assert.strictEqual(composed.producer.value, "Juvé & Camps");
assert.strictEqual(composed.name.value, "Juvé & Camps Gran Reserva Brut Nature 2018");
assert.strictEqual(composed.type.value, "espumoso");
assert.strictEqual(api.composeWineName("Juvé & Camps", "Gran Reserva Brut Nature", "2018"), composed.name.value);

const cut = api.acceptGeminiLabel({
  finish: "MAX_TOKENS",
  parsed: { producer: { value: repeat, confidence: 0.9 } }
});
assert.strictEqual(cut.bag, null);
assert.strictEqual(cut.failure, "cut");
assert.strictEqual(api.labelFailureText("cut", ""), "alta.cut");

const quota = api.acceptGeminiLabel({
  parsed: null,
  fatal: true,
  quota: "minute",
  reason: "Límite por minuto. Vuelve a intentarlo en 30 s."
});
assert.strictEqual(quota.bag, null);
assert.strictEqual(quota.failure, "quota");
assert.ok(quota.reason.includes("minuto"));
assert.ok(api.labelFailureText("quota", quota.reason).includes("minuto"));

const network = api.acceptGeminiLabel({ parsed: null, fatal: true, reason: "red o CORS" });
assert.strictEqual(network.bag, null);
assert.strictEqual(network.failure, "network");
assert.strictEqual(api.labelFailureText("network", network.reason), "alta.network");

const good = api.acceptGeminiLabel({
  finish: "STOP",
  parsed: {
    name: { value: "Reserva de la Familia", confidence: 0.96 },
    producer: { value: "Juvé & Camps B. Propietat d'Espiells S.A.U.", confidence: 0.9 },
    appellation: { value: "Cava, Comtats de Barcelona · Valls d'Anoia-Foix", confidence: 0.9 },
    vintage: { value: "2018", confidence: 0.98 },
    type: { value: "espumoso", confidence: 0.94 },
    category: { value: "Gran Reserva Brut Nature", confidence: 0.93 },
    grapes: { value: "", confidence: 0 },
    abv: { value: "12", confidence: 0.9 },
    volume: { value: "75 cl", confidence: 0.9 },
    ean: { value: "8424487600188", confidence: 0.7 },
    web: { value: "juveycamps.com", confidence: 0.88 }
  }
});
assert.ok(good.bag);
assert.strictEqual(good.failure, "");
assert.strictEqual(good.bag.name.value, "Reserva de la Familia");
assert.strictEqual(good.bag.producer.value, "Juvé & Camps");
assert.strictEqual(good.bag.vintage.value, "2018");
assert.strictEqual(good.bag.type.value, "espumoso");
assert.strictEqual(good.bag.category.value, "Gran Reserva Brut Nature");
assert.strictEqual(good.bag.abv.value, "12");
assert.strictEqual(good.bag.volume.value, "75 cl");
assert.strictEqual(good.bag.ean.value, "8424487600188");
assert.strictEqual(good.bag.web.value, "juveycamps.com");
assert.strictEqual(api.fuzzyCatalogHit(good.bag), null);

assert.strictEqual(api.validIntakeIdentity("", "Juvé & Camps"), false);
assert.strictEqual(api.validIntakeIdentity("Reserva de la Familia", ""), false);
assert.strictEqual(api.validIntakeIdentity(repeat, "Juvé & Camps"), false);
assert.strictEqual(api.validIntakeIdentity("Reserva de la Familia", "Juvé & Camps"), true);

const repaired = {
  customWines: [{
    id: "juve-roto",
    name: "Vino",
    producer: repeat,
    vintage: 2018,
    provenance: {}
  }],
  bottles: [{ wineId: "juve-roto", note: "en cava", qty: 1 }]
};
assert.strictEqual(api.repairRepeatedTitles(repaired), true);
assert.strictEqual(repaired.customWines[0].producer, "Juvé & Camps");
assert.ok(repaired.customWines[0].name.length <= 80);
assert.ok(repaired.customWines[0].name.indexOf("Juvé") === 0);
assert.ok(repaired.customWines[0].provenance.originalTitle.indexOf("Juvé & Camps S.A.U.") >= 0);
assert.ok(repaired.bottles[0].note.indexOf("en cava") === 0);
assert.ok(repaired.bottles[0].note.indexOf("Nombre original:") >= 0);
assert.strictEqual(repaired.bottles.length, 1);
assert.strictEqual(api.repairRepeatedTitles(repaired), false);

assert.strictEqual(api.eanChecksumOk("8424487600188"), true);
assert.strictEqual(api.eanChecksumOk("8424487600187"), false);
const off = api.parseOffProduct({
  status: 1,
  code: "8424487600188",
  product: { product_name_es: "Reserva de la Familia", brands: "Juvé & Camps", quantity: "75 cl", code: "8424487600188", link: "https://juveycamps.com" }
});
assert.strictEqual(off.ean, "8424487600188");
const merged = api.mergeScanSources(
  { name: { value: "Reserva de la Familia", confidence: 0.96 }, producer: { value: "Juvé & Camps", confidence: 0.9 }, ean: { value: "0000000000000", confidence: 0.4 } },
  { name: "OTRO NOMBRE", producer: "Otra bodega", ean: "8424487600188", volume: "75 cl", web: "" },
  [{ raw: "8424487600188", format: "ean_13" }, { raw: "https://www.vinissimus.com/es", format: "qr_code" }, { raw: "https://juveycamps.com/familia", format: "qr_code" }]
);
assert.strictEqual(merged.name.value, "Reserva de la Familia");
assert.strictEqual(merged.producer.value, "Juvé & Camps");
assert.strictEqual(merged.ean.value, "8424487600188");
assert.strictEqual(merged.ean.confidence, 0.98);
assert.strictEqual(merged.volume.value, "75 cl");
assert.strictEqual(merged.web.value, "https://juveycamps.com/familia");

function bag(fields) {
  const out = {};
  Object.keys(fields).forEach(key => { out[key] = { value: fields[key], confidence: 0.95 }; });
  return api.normalizeLabelBag(out);
}
assert.strictEqual(api.fuzzyCatalogHit(bag({ name: "Circe Verdejo", producer: "Bodegas Avelino Vegas", appellation: "DO Rueda", vintage: "2025", type: "blanco" })), null);
assert.strictEqual(api.fuzzyCatalogHit(bag({ name: "Pintas", producer: "Wine & Soul", appellation: "Douro", vintage: "2022", type: "tinto" })), null);
const mono = api.fuzzyCatalogHit(bag({ name: "Monopole", producer: "CVNE", appellation: "DOCa Rioja", vintage: "2022", type: "blanco" }));
assert.ok(mono && mono.wine.id === "cvne-monopole-2022", mono && mono.wine.id);
assert.strictEqual(api.catalogByEan("8424487600188"), null);

const reader = extractFunction(v89, "readBothLabels");
const offlineAt = reader.indexOf("readLabelsOffline");
assert.ok(reader.indexOf("if (!online)") >= 0);
assert.ok(reader.indexOf("if (!online)") < offlineAt);
assert.strictEqual((reader.match(/readLabelsOffline/g) || []).length, 1);
assert.ok(!reader.includes("visionOnce([front])"));
assert.strictEqual((v89.match(/geminiWithModel\(/g) || []).length, 1);
assert.ok(v89.includes("1600"));
assert.ok(v89.includes("image/jpeg"));
assert.ok(v89.includes("2048"));
assert.ok(v89.includes("openfoodfacts.org"));
assert.ok(v89.includes("BarcodeDetector"));
assert.ok(v89.includes("vendor/zxing/zxing.min.js"));
assert.ok(extractFunction(v89, "prepareLabelImage").includes('error: "image"'));
assert.ok(!extractFunction(v89, "prepareLabelImage").includes("resolve(dataUrl)"));

const useful = gemini.indexOf("if (geminiObjectUseful(parsed))");
const bump = gemini.indexOf('finish === "MAX_TOKENS" && !bumped');
assert.ok(useful >= 0 && bump > useful);

assert.ok(!ficha.includes('id="wine-tr"'));
assert.ok(!ficha.includes("tr.button"));
assert.ok(!ficha.includes("paintWineTranslation"));
assert.ok(ficha.includes("sheetTitle"));
assert.ok(ficha.includes("escHtml"));

["alta.category", "alta.ean", "alta.web", "alta.cut", "alta.needKey", "alta.network", "alta.quota", "alta.needIdentity", "alta.image", "alta.barcode"].forEach(key => {
  assert.ok(i18n.includes('["' + key + '"'), key);
});
assert.ok(i18n.includes("Para guardar hacen falta un nombre de vino y una bodega válidos."));
assert.ok(i18n.includes("La resposta de Gemini s'ha tallat."));
assert.ok(i18n.includes("Gemini did not respond: network failure."));
assert.ok(i18n.includes("La réponse de Gemini a été coupée."));
assert.ok(i18n.includes("O Gemini não respondeu: falha de rede."));

assert.ok(app.includes('APP_VERSION = "v89"'));
assert.ok(sw.includes("casa-llavaneras-ios-v89"));
assert.ok(sw.includes("./casa-v89.js"));
assert.ok(sw.includes("zxing"));
assert.ok(!sw.includes("./vendor/zxing/zxing.min.js"));
assert.ok(html.includes('content="v89"'));
assert.ok(html.includes("casa-v89.js?v=89"));
assert.ok(!html.includes("?v=88"));
assert.ok(fs.existsSync(path.join(root, "vendor/zxing/zxing.min.js")));
assert.ok(fs.existsSync(path.join(root, "tests/fixtures/juve-contraetiqueta.png")));
assert.ok(fs.existsSync(path.join(root, "docs/escaner-causas-v89.md")));

const title = api.sheetTitle(repeat);
assert.strictEqual(title, "Juvé & Camps");
assert.strictEqual(api.sheetTitle("Reserva de la Familia"), "Reserva de la Familia");

console.log("v89-alta ok");
console.log("juve " + good.bag.name.value + " / " + good.bag.producer.value);
console.log("circe null");
console.log("pintas null");
console.log("monopole " + mono.wine.id);

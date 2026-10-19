/* Escáner v92: conexión, tipo, contraetiqueta, añada y bodega pendiente. */
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
const v92 = fs.readFileSync(path.join(root, "casa-v92.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

assert.strictEqual(app.includes('APP_VERSION = "v93"'), true);
assert.ok(html.includes("casa-v92.js?v=93"));
assert.ok(html.indexOf("casa-v91.js?v=93") < html.indexOf("casa-v92.js?v=93"));
assert.ok(html.indexOf("casa-v92.js?v=93") < html.indexOf("app.js?v=93"));
assert.ok(sw.includes("./casa-v92.js"));
assert.ok(sw.includes('const CACHE = "casa-llavaneras-ios-v93"'));
assert.ok(i18n.includes("alta.timeout"));
assert.ok(i18n.includes("sheet.edit"));
assert.ok(v92.includes("shouldUseOfflineRead"));
assert.ok(v92.includes("bag._offline = usedOffline"));

eval(fs.readFileSync(path.join(root, "bodegas.js"), "utf8"));
global.normTxt = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
global.backLabelText = raw => /sulfit|embotellado|contiene sulfitos/.test(global.normTxt(raw));
global.eanChecksumOk = code => String(code || "").replace(/\D/g, "") === "8410013011016";

const api = new Function("WINERY_CARDS", "foldWinery", [
  extractFunction(v92, "explicitWineType"),
  extractFunction(v92, "vintageFromText"),
  extractFunction(v92, "photoIsClearlyBackLabel"),
  extractFunction(v92, "codesProveBackLabel"),
  extractFunction(v92, "backLabelShouldMove"),
  extractFunction(v92, "shouldUseOfflineRead"),
  extractFunction(v92, "refineLabelFailure"),
  extractFunction(v92, "intakeSavePlan"),
  extractFunction(v92, "catalogWineryFromText"),
  extractFunction(v92, "softenScanBag"),
  "return { explicitWineType, vintageFromText, photoIsClearlyBackLabel, codesProveBackLabel, backLabelShouldMove, shouldUseOfflineRead, refineLabelFailure, intakeSavePlan, catalogWineryFromText, softenScanBag };"
].join("\n"))(WINERY_CARDS, foldWinery);

assert.strictEqual(api.shouldUseOfflineRead(false, "fetch"), true);
assert.strictEqual(api.shouldUseOfflineRead(false, "timeout"), false);
assert.strictEqual(api.shouldUseOfflineRead(false, "quota"), false);
assert.strictEqual(api.shouldUseOfflineRead(false, "needKey"), false);
assert.strictEqual(api.shouldUseOfflineRead(false, ""), false);
assert.strictEqual(api.shouldUseOfflineRead(true, "fetch"), false);
assert.strictEqual(api.refineLabelFailure({ failure: "network", reason: "tiempo agotado" }).failure, "timeout");
assert.strictEqual(api.refineLabelFailure({ failure: "network", reason: "Failed to fetch" }).failure, "fetch");

assert.strictEqual(api.explicitWineType("3 finques"), "");
assert.strictEqual(api.explicitWineType("DO Empordà"), "");
assert.strictEqual(api.explicitWineType("vi negre garnatxa negra"), "tinto");
assert.strictEqual(api.explicitWineType("jerez fino"), "generoso");
assert.strictEqual(api.vintageFromText("lote L2023"), "");
assert.strictEqual(api.vintageFromText("cosecha 2019 lote L2023"), "2019");

const unsure = { type: { value: "generoso", confidence: 0.4 }, vintage: { value: "2023", confidence: 0.4 } };
api.softenScanBag(unsure, "3 finques lote L2023");
assert.strictEqual(unsure.type.value, "");
assert.strictEqual(unsure.vintage.value, "");
const clear = { type: { value: "tinto", confidence: 0.92 }, vintage: { value: "2019", confidence: 0.95 } };
api.softenScanBag(clear, "");
assert.strictEqual(clear.type.value, "tinto");
assert.strictEqual(clear.vintage.value, "2019");

assert.strictEqual(api.photoIsClearlyBackLabel(""), false);
assert.strictEqual(api.photoIsClearlyBackLabel("3 Finques"), false);
assert.strictEqual(api.photoIsClearlyBackLabel("contiene sulfitos"), true);
assert.strictEqual(api.backLabelShouldMove({ id: "a", backLabel: "" }, "contiene sulfitos", []), true);
assert.strictEqual(api.backLabelShouldMove({ id: "a", backLabel: "" }, "etiqueta ilustrada", []), false);
assert.strictEqual(api.backLabelShouldMove({ id: "a", backLabel: "ya" }, "contiene sulfitos", []), false);
assert.strictEqual(api.backLabelShouldMove({ id: "a" }, "", [{ raw: "8410013011016" }]), true);
assert.strictEqual(api.codesProveBackLabel([{ raw: "no" }]), false);

assert.strictEqual(api.intakeSavePlan("", "Perelada").ok, false);
assert.strictEqual(api.intakeSavePlan("3 Finques", "").pending, true);
assert.strictEqual(api.intakeSavePlan("3 Finques", "").ok, true);
assert.strictEqual(api.intakeSavePlan("3 Finques", "Perelada").pending, false);

const hinted = api.catalogWineryFromText("Perelada 3 Finques DO Empordà");
assert.ok(hinted);
assert.strictEqual(hinted.id, "perelada");
assert.ok(hinted.aliases.indexOf("Castillo Perelada") >= 0);
assert.ok(hinted.aliases.indexOf("Grup Peralada") >= 0);
assert.strictEqual(api.catalogWineryFromText("3 Finques"), null);

assert.ok(v92.includes("openFichaEdit"));
assert.ok(v92.includes("labelPair.front"));
assert.ok(v92.includes("labelPair.back"));
assert.ok(v92.includes("producerPending"));
assert.ok(v92.includes("alta.onlyBack"));
assert.ok(fs.existsSync(path.join(root, "docs/escaner-causas-v92.md")));

console.log("v92 escáner ok");

/* La migración a vino/añada copia el estado, no cambia los ids y se puede repetir. */
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

const estado = fs.readFileSync(path.join(__dirname, "..", "casa-estado.js"), "utf8");
const loadSrc = extractFunction(estado, "load");
const snapAt = loadSrc.indexOf("keepPreMigrationSnapshot");
assert.ok(snapAt >= 0, "load copia el estado");
assert.ok(loadSrc.indexOf("migrateV86", snapAt) > snapAt, "con datos guardados, la copia es anterior a la migración");
assert.ok(estado.includes('STORE + ".antes-v86"'), "la copia de la v86 tiene su propia clave");

const STORE = "vinoteca.pro.max.v3";
const mem = { "vinoteca-jgc-provider": "sekret-key" };
const localStorage = {
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
  setItem: function (k, v) { mem[k] = String(v); }
};
const bag = new Function("localStorage", [
  "const STORE = " + JSON.stringify(STORE) + ";",
  extractFunction(estado, "wineParentId"),
  extractFunction(estado, "migrateV86"),
  extractFunction(estado, "keepPreMigrationSnapshot"),
  "return { wineParentId: wineParentId, migrateV86: migrateV86, keepPreMigrationSnapshot: keepPreMigrationSnapshot };"
].join("\n"))(localStorage);

const raw = JSON.stringify({ vinotecas: [{ id: "v1" }], bottles: [{ uid: "b1" }] });
bag.keepPreMigrationSnapshot(raw);
bag.keepPreMigrationSnapshot("otro texto");
assert.strictEqual(mem[STORE + ".antes-v86"], raw);
assert.strictEqual(mem["vinoteca-jgc-provider"], "sekret-key");

const catalog = [
  {
    id: "vs-unico-2014",
    producer: "Vega Sicilia",
    name: "Único",
    vintage: 2014,
    appellation: "DO Ribera del Duero",
    region: "Ribera del Duero",
    country: "España",
    type: "tinto",
    grapes: ["Tinto Fino"],
    tasting: "ciruela",
    priceHint: "450–650 €",
    aging: { drinkFrom: 2026, holdTo: 2050 }
  },
  {
    id: "vs-unico-2009",
    producer: "Vega Sicilia",
    name: "Único",
    vintage: 2009,
    appellation: "DO Ribera del Duero",
    grapes: ["Tinto Fino", "Cabernet Sauvignon"],
    tasting: "cedro",
    priceHint: "480–720 €",
    aging: { drinkFrom: 2020, holdTo: 2048 }
  }
];
const custom = {
  id: "casa-2018",
  producer: "Casa",
  name: "Pago",
  vintage: 2018,
  grapes: ["Garnacha"],
  tasting: "nota de cata",
  priceHint: "22 €",
  aging: { drinkFrom: 2022, peakStart: 2024, peakEnd: 2030, holdTo: 2034 },
  dossier: { history: "no perder" }
};
const st = {
  vinotecas: [{ id: "v1", name: "Principal" }],
  bottles: [{ uid: "b1", wineId: "vs-unico-2009", qty: 2, cellarId: "v1", bin: "A-01", price: 10, labelPhoto: "idb:lot:b1" }],
  customWines: [custom],
  wineEdits: { "vs-unico-2009": { ratings: { parker: { score: 91, manual: true } } } },
  wishlist: [{ id: "ya", name: "Pingus", note: "si baja", targetPrice: "1400" }],
  reservations: [{ id: "r1", bottleUid: "b1", wineId: "vs-unico-2009", date: "2026-12-01", occasion: "Aniversario" }],
  counts: [{ id: "c0", date: "2026-10-01", present: 2 }],
  tasting: { "casa-2018": [{ conclusion: { note: "mia" } }] }
};
const bottles = JSON.stringify(st.bottles);
const edits = JSON.stringify(st.wineEdits);
const wishes = JSON.stringify(st.wishlist);
const reserves = JSON.stringify(st.reservations);
const counts = JSON.stringify(st.counts);

assert.strictEqual(bag.migrateV86(st, catalog), true);
assert.strictEqual(custom.id, "casa-2018");
assert.strictEqual(custom.tasting, "nota de cata");
assert.strictEqual(custom.priceHint, "22 €");
assert.strictEqual(custom.dossier.history, "no perder");
assert.strictEqual(custom.grapes[0], "Garnacha");
assert.ok(custom.parentId.indexOf("p:") === 0);
assert.strictEqual(catalog[0].parentId, undefined);
assert.strictEqual(catalog[1].grapes[1], "Cabernet Sauvignon");
assert.strictEqual(catalog[1].tasting, "cedro");

const pid = bag.wineParentId(catalog[0]);
assert.strictEqual(pid, bag.wineParentId(catalog[1]));
assert.deepStrictEqual(st.cuvees[pid].vintageIds, ["vs-unico-2009", "vs-unico-2014"]);
assert.strictEqual(st.cuvees[pid].appellation, "DO Ribera del Duero");
assert.ok(st.cuvees[pid].grapes.indexOf("Tinto Fino") >= 0);
assert.strictEqual(st.cuvees[pid].tasting, undefined);
assert.ok(st.cuvees[custom.parentId].vintageIds.indexOf("casa-2018") >= 0);
assert.deepStrictEqual(st.cuvees[custom.parentId].grapes, ["Garnacha"]);
assert.strictEqual(JSON.stringify(st.bottles), bottles);
assert.strictEqual(st.bottles[0].labelPhoto, "idb:lot:b1");
assert.strictEqual(JSON.stringify(st.wineEdits), edits);
assert.strictEqual(JSON.stringify(st.wishlist), wishes);
assert.strictEqual(JSON.stringify(st.reservations), reserves);
assert.strictEqual(JSON.stringify(st.counts), counts);
assert.strictEqual(st.tasting["casa-2018"][0].conclusion.note, "mia");
assert.strictEqual(st.migrated.v86, true);

const frozen = JSON.stringify(st);
assert.strictEqual(bag.migrateV86(st, catalog), false);
assert.strictEqual(JSON.stringify(st), frozen);
assert.strictEqual(mem["vinoteca-jgc-provider"], "sekret-key");

console.log("v86-migrate ok");

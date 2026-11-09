/* v113: la web oficial del catálogo manda sobre la que estimó Gemini, salvo si el usuario la escribió. */
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
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const vino = read("casa-vino.js");
const v88 = read("casa-v88.js");
const v89 = read("casa-v89.js");
const v91 = read("casa-v91.js");
const gemini = read("casa-gemini.js");
const estado = read("casa-estado.js");
const sw = read("sw.js");
const app = read("app.js");
const html = read("index.html");
const jesus = read("jesus/index.html");

global.window = {};
function t(key) { return key; }
eval(read("bodegas.js"));
eval(extractFunction(v91, "wineryCardById"));
eval(extractFunction(v91, "wineryCardFor"));
eval(vino);
eval(extractFunction(v88, "applyKnownWinery"));

assert.strictEqual(WINERY_CARDS.length, 61);
assert.ok(sw.includes('"casa-llavaneras-ios-v113"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v113"'));
assert.ok(sw.includes('const VERSION = "v113"'));
assert.ok(app.includes('APP_VERSION = "v113"'));
assert.ok(html.includes('content="v113"'));
assert.ok(jesus.includes('content="v113"'));
assert.ok(jesus.includes("casa-llavaneras-jesus-ios-v113"));
assert.ok(read("jesus/sw.js").includes('importScripts("../sw.js?v=113")'));
assert.ok(estado.includes('const STORE = CASA_EDITION === "jesus" ? "jesus.vinoteca.pro.max.v3" : "vinoteca.pro.max.v3"'));
assert.ok(estado.includes('parsed.jesusExampleSeed = "v111"'));
assert.ok(v91.includes("migrateOfficialWebs(state)"));
assert.ok(gemini.includes("applyOfficialCatalogWeb(wine)"));
assert.ok(v89.includes('wine.provenance.web = "manual"'));

const eventWeb = "https://feria-vinos.example/dominio-del-challao";
const official = "https://www.dominiodelchallao.com/";
const challao = {
  id: "challao-2021",
  name: "Challao",
  producer: "Dominio del Challao",
  vintage: 2021,
  type: "tinto",
  tasting: "Nota de José que no se toca",
  ratings: { parker: { score: 96, scale: 100, origin: "usuario", manual: true, source: "José" } },
  geo: { web: eventWeb, lat: 42.59, lng: -2.79, zone: "Labastida" },
  provenance: { web: "estimación Gemini", tasting: "página" }
};
const bottle = { uid: "b-challao", wineId: challao.id, qty: 3, cellarId: "v1", bin: "A-02", note: "Nombre original: Dominio del Challao" };
const photo = "idb:etiqueta-challao";
bottle.labelPhoto = photo;

assert.strictEqual(bodegaGeo(challao).web, official);
assert.strictEqual(challao.geo.web, eventWeb);

const hand = {
  id: "challao-mano",
  name: "Challao",
  producer: "Dominio del Challao",
  geo: { web: "https://notas.example/mi-challao" },
  provenance: { web: "página" }
};
assert.strictEqual(bodegaGeo(hand).web, "https://notas.example/mi-challao");
hand.provenance.web = "manual";
assert.strictEqual(bodegaGeo(hand).web, "https://notas.example/mi-challao");
const typed = {
  id: "challao-usuario",
  name: "Challao",
  producer: "Dominio del Challao",
  geo: { web: "https://notas.example/escrita" },
  provenance: { web: "usuario" },
  ratings: { vivino: { score: 4.2, scale: 5, manual: true } }
};
assert.strictEqual(bodegaGeo(typed).web, "https://notas.example/escrita");

const byAlias = {
  id: "challao-alias",
  name: "Tinto",
  producer: "Challao",
  geo: { web: eventWeb },
  provenance: { web: "estimación Gemini" }
};
assert.strictEqual(officialCatalogWeb(byAlias), official);

const faustino = {
  id: "faustino-web",
  name: "Crianza",
  producer: "Faustino",
  geo: { web: "https://evento.example/faustino" },
  provenance: { web: "estimación Gemini" },
  ratings: { penin: { score: 90, scale: 100, manual: true } }
};
assert.strictEqual(officialCatalogWeb(faustino), "https://www.bodegasfaustino.com/");

const store = {
  vinotecas: [{ id: "v1" }],
  bottles: [bottle],
  customWines: [challao, hand, byAlias, faustino, typed]
};
assert.strictEqual(migrateOfficialWebs(store), true);
assert.strictEqual(challao.geo.web, official);
assert.strictEqual(challao.provenance.web, "catálogo");
assert.strictEqual(challao.tasting, "Nota de José que no se toca");
assert.strictEqual(challao.provenance.tasting, "página");
assert.strictEqual(challao.ratings.parker.score, 96);
assert.strictEqual(challao.ratings.parker.source, "José");
assert.strictEqual(challao.geo.zone, "Labastida");
assert.strictEqual(byAlias.geo.web, official);
assert.strictEqual(byAlias.provenance.web, "catálogo");
assert.strictEqual(faustino.geo.web, "https://www.bodegasfaustino.com/");
assert.strictEqual(faustino.ratings.penin.score, 90);
assert.strictEqual(hand.geo.web, "https://notas.example/mi-challao");
assert.strictEqual(hand.provenance.web, "manual");
assert.strictEqual(typed.geo.web, "https://notas.example/escrita");
assert.strictEqual(typed.provenance.web, "usuario");
assert.strictEqual(typed.ratings.vivino.score, 4.2);
assert.strictEqual(store.bottles[0].qty, 3);
assert.strictEqual(store.bottles[0].labelPhoto, photo);
assert.strictEqual(store.bottles[0].note, "Nombre original: Dominio del Challao");
assert.strictEqual(migrateOfficialWebs(store), false);

const fresh = { producer: "Dominio del Challao", name: "Challao", geo: { web: eventWeb }, provenance: { web: "estimación Gemini" } };
applyKnownWinery(fresh);
assert.strictEqual(fresh.geo.web, official);
assert.strictEqual(fresh.provenance.web, "catálogo");

const kept = { producer: "Dominio del Challao", name: "Challao", geo: { web: official }, provenance: { web: "manual" } };
applyKnownWinery(kept);
assert.strictEqual(kept.geo.web, official);
assert.strictEqual(kept.provenance.web, "manual");

const untouched = { id: "otra", producer: "Bodega sin ficha", name: "Tinto", geo: { web: eventWeb }, ratings: { vivino: { score: 4.1 } } };
assert.strictEqual(applyOfficialCatalogWeb(untouched), false);
assert.strictEqual(untouched.geo.web, eventWeb);
assert.strictEqual(untouched.ratings.vivino.score, 4.1);

console.log("v113-web ok");

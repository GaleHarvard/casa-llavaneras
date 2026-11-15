/* v113: el grabado de Descendientes de J. Palacios no se confunde con Álvaro Palacios. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
global.window = global.window || {};
eval(read("bodegas.js"));

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
eval(extractFunction(read("casa-v91.js"), "wineryCardById"));
eval(extractFunction(read("casa-v91.js"), "wineryCardFor"));
function fieldValue(fields, key) {
  const row = fields && fields[key];
  return String((row && row.value) || "");
}
eval(extractFunction(read("casa-vino.js"), "foldEstate"));
eval(extractFunction(read("casa-v88.js"), "levenshtein"));
eval(extractFunction(read("casa-v88.js"), "fuzzyRatio"));
eval(extractFunction(read("casa-v91.js"), "fuzzyWineryHit"));

assert.strictEqual(WINERY_CARDS.length, 62);
const card = WINERY_CARDS.find(item => item.id === "descendientes-de-j-palacios");
assert.ok(card);
assert.strictEqual(card.name, "Descendientes de J. Palacios");
assert.deepStrictEqual(card.aliases, ["J. Palacios", "Descendientes de José Palacios"]);
assert.strictEqual(card.country, "España");
assert.strictEqual(card.zone, "Bierzo");
assert.strictEqual(card.zoneText, "DO Bierzo");
assert.strictEqual(card.town, "Corullón");
assert.strictEqual(card.address, "C/ Chao do Pando, 1, 24514 Corullón, León");
assert.strictEqual(card.founded, 1999);
assert.ok(card.about.includes("Ricardo Pérez Palacios"));
assert.ok(card.about.includes("Rafael Moneo"));
assert.ok(card.about.includes("23 ha"));
assert.ok(!/cata|nariz|boca|tanino/i.test(card.about));
assert.deepStrictEqual(card.wines, ["Pétalos", "Villa de Corullón", "Las Lamas", "Moncerbal", "La Faraona", "Valdafoz", "Al Chelo", "Fontelas"]);
assert.strictEqual(card.lat, null);
assert.strictEqual(card.lng, null);
assert.strictEqual(card.web, "https://www.djpalacios.com/");
assert.ok(!/alvaropalacios\.com/i.test(card.web));
assert.deepStrictEqual(card.sources, [
  "https://www.bodeboca.com/bodegas/descendientes-j-palacios",
  "https://www.crdobierzo.es/es/bodegas-y-vinos/descendientes-de-j-palacios-sl/44/",
  "http://www.laesenciadelvino.com/bodegas/detalles/descendientes_de_j_palacios"
]);
assert.strictEqual(card.file, "bodega-descendientes-de-j-palacios.jpg");
const file = path.join(root, card.file);
const buf = fs.readFileSync(file);
assert.strictEqual(buf.readUInt16BE(0), 0xffd8);
assert.ok(buf.length > 80000);
assert.ok(read("sw.js").includes("./bodega-descendientes-de-j-palacios.jpg"));

const library = WINERY_LIBRARY.find(item => item.file === card.file);
assert.strictEqual(library.name, "Descendientes de J. Palacios");
assert.ok(!library.aliases.includes("Palacios"));

const alvaroImage = "vinedo-priorat.jpg";
[
  ["Descendientes de J. Palacios", "Pétalos"],
  ["J. Palacios", "Villa de Corullón"],
  ["Descendientes de José Palacios", "La Faraona"],
  ["Descendientes de J. Palacios", "Las Lamas"],
  ["Descendientes de J. Palacios", "Moncerbal"],
  ["", "Pétalos"],
  ["", "Villa de Corullón"],
  ["", "La Faraona"],
  ["", "Moncerbal"],
  ["Palacios", "Pétalos"],
  ["Palacios", "Corullón"]
].forEach(pair => {
  const wine = { producer: pair[0], name: pair[1] };
  assert.strictEqual(wineryImageFor(wine), card.file, pair.join(" · "));
  assert.strictEqual(wineryCardFor(wine).id, card.id, pair.join(" · "));
  assert.notStrictEqual(wineryImageFor(wine), alvaroImage, pair.join(" · "));
});

[
  ["Álvaro Palacios", "L'Ermita"],
  ["Alvaro Palacios", "Finca Dofí"],
  ["Palacios", "Les Terrasses"],
  ["Álvaro Palacios", "Gratallops"]
].forEach(pair => {
  const wine = { producer: pair[0], name: pair[1] };
  assert.strictEqual(wineryImageFor(wine), alvaroImage, pair.join(" · "));
  assert.strictEqual(wineryCardFor(wine), null, pair.join(" · "));
});

assert.strictEqual(wineryImageFor({ producer: "Palacios", name: "" }), alvaroImage);
assert.strictEqual(wineryCardFor({ producer: "Palacios", name: "" }), null);
assert.strictEqual(wineryImageFor({ producer: "Bodegas Muriel", name: "Crianza" }), "bodega-muriel.jpg");

const fields = (producer, name) => ({ producer: { value: producer }, name: { value: name } });
assert.strictEqual(fuzzyWineryHit(fields("Descendientes de J. Palacios", "Pétalos")).id, card.id);
assert.strictEqual(fuzzyWineryHit(fields("J. Palacios", "")).id, card.id);
assert.strictEqual(fuzzyWineryHit(fields("", "La Faraona")).id, card.id);
assert.strictEqual(fuzzyWineryHit(fields("Álvaro Palacios", "L'Ermita")), null);
assert.strictEqual(fuzzyWineryHit(fields("Palacios", "")), null);
assert.strictEqual(fuzzyWineryHit(fields("Palacios", "Les Terrasses")), null);

console.log("v113-palacios ok");

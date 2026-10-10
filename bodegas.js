var GENERIC_ESTATE = "vinedo.jpg";

var WINERY_LIBRARY = [
  { name: "Château Pontet-Canet", file: "bodega-chateau-pontet-canet.jpg", aliases: ["Pontet-Canet", "Pontet Canet"] },
  { name: "Château Ausone", file: "bodega-chateau-ausone.jpg", aliases: ["Ausone"] },
  { name: "Château Cheval Blanc", file: "bodega-chateau-cheval-blanc.jpg", aliases: ["Cheval Blanc"] },
  { name: "Château Massamier la Mignarde", file: "bodega-chateau-massamier-la-mignarde.jpg", aliases: ["Massamier"] },
  { name: "Domaine Leflaive", file: "bodega-domaine-leflaive.jpg", aliases: ["Leflaive"] },
  { name: "Château Latour", file: "bodega-chateau-latour.jpg", aliases: ["Latour", "Ch. Latour"] },
  { name: "Château Haut-Brion", file: "bodega-chateau-haut-brion.jpg", aliases: ["Haut-Brion", "Haut Brion"] },
  { name: "Château Lafite Rothschild", file: "bodega-chateau-lafite-rothschild.jpg", aliases: ["Lafite"] },
  { name: "Domaine Dugat-Py", file: "bodega-domaine-dugat-py.jpg", aliases: ["Dugat-Py", "Dugat Py"] },
  { name: "Domaine d'Auvenay", file: "bodega-domaine-d-auvenay.jpg", aliases: ["Auvenay"] },
  { name: "Domaine Leroy", file: "bodega-domaine-leroy.jpg", aliases: ["Leroy"] },
  { name: "Petrus", file: "bodega-petrus.jpg", aliases: ["Pétrus"] },
  { name: "Château Mouton Rothschild", file: "bodega-chateau-mouton-rothschild.jpg", aliases: ["Mouton Rothschild", "Mouton"] },
  { name: "Domaine de la Romanée-Conti", file: "bodega-domaine-de-la-romanee-conti.jpg", aliases: ["Romanée-Conti", "Romanee-Conti", "DRC"] },
  { name: "Familia Torres", file: "bodega-familia-torres.jpg", aliases: ["Torres"] },
  { name: "Gramona", file: "bodega-gramona.jpg" },
  { name: "Abadía Retuerta", file: "bodega-abadia-retuerta.jpg", aliases: ["Abadia Retuerta"] },
  { name: "Marqués de Murrieta", file: "bodega-marques-de-murrieta.jpg", aliases: ["Murrieta", "Castillo Ygay", "Ygay"] },
  { name: "Vivanco", file: "bodega-vivanco.jpg" },
  { name: "Abadal", file: "bodega-abadal.jpg" },
  { name: "Codorníu", file: "bodega-codorniu.jpg", aliases: ["Codorniu"] },
  { name: "Pago de Carraovejas", file: "bodega-pago-de-carraovejas.jpg", aliases: ["Carraovejas"] },
  { name: "Bodegas Faustino", file: "bodega-faustino.jpg", aliases: ["Faustino"] },
  { name: "González Byass", file: "bodega-gonzalez-byass.jpg", aliases: ["Gonzalez Byass", "Tío Pepe", "Tio Pepe"] },
  { name: "Scala Dei", file: "bodega-scala-dei.jpg" },
  { name: "Ysios", file: "bodega-ysios.jpg" },
  { name: "CVNE", file: "bodega-cvne.jpg", aliases: ["Cune"] },
  { name: "Ramón Bilbao", file: "bodega-ramon-bilbao.jpg", aliases: ["Ramon Bilbao"] },
  { name: "Perelada", file: "bodega-perelada.jpg" },
  { name: "Marqués de Riscal", file: "bodega-marques-de-riscal.jpg", aliases: ["Riscal"] },
  { name: "La Rioja Alta", file: "bodega-la-rioja-alta.jpg", aliases: ["Rioja Alta"] },
  { name: "Juvé & Camps", file: "bodega-juve-y-camps.jpg", aliases: ["Juvé y Camps", "Juve y Camps", "Juve & Camps"] },
  { name: "Vega Sicilia", file: "bodega-vega-sicilia.jpg", aliases: ["Valbuena", "Único"] },
  { name: "Château Margaux", file: "vinedo-chateau-margaux.jpg", aliases: ["Margaux", "Ch. Margaux"] },
  { name: "Dominio de Pingus", file: "vinedo-ribera.jpg", aliases: ["Pingus"] },
  { name: "R. López de Heredia", file: "vinedo-rioja.jpg", aliases: ["Lopez de Heredia", "López de Heredia", "Tondonia"] },
  { name: "Bodegas Muga", file: "vinedo-rioja.jpg", aliases: ["Muga"] },
  { name: "Pazo de Señoráns", file: "vinedo-rias.jpg", aliases: ["Señoráns", "Senorans"] },
  { name: "Álvaro Palacios", file: "vinedo-priorat.jpg", aliases: ["Alvaro Palacios", "Palacios"] },
  { name: "Moët & Chandon", file: "vinedo-champagne.jpg", aliases: ["Moet & Chandon", "Moet", "Dom Pérignon", "Dom Perignon"] },
  { name: "Tenuta San Guido", file: "vinedo-bolgheri.jpg", aliases: ["Sassicaia", "San Guido"] },
  { name: "Enrique Mendoza", file: "vinedo.jpg", aliases: ["Enrique Mendoza"] },
  { name: "Numanthia", file: "vinedo-ribera.jpg", aliases: ["Numanthia"] }
];

var WINERY_STOP = {
  chateau: 1, bodegas: 1, bodega: 1, domaine: 1, dominio: 1, celler: 1,
  casa: 1, pago: 1, marques: 1, familia: 1, tenuta: 1, de: 1, la: 1, del: 1,
  les: 1, des: 1, y: 1, the: 1, of: 1, du: 1, et: 1, el: 1, los: 1, las: 1
};

function foldWinery(s) {
  return String(s || "")
    .replace(/&/g, " y ")
    .replace(/\bch\.\s*/gi, "chateau ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactWinery(folded) {
  return String(folded || "").split(" ").filter(function (w) {
    return w.length > 1 && !WINERY_STOP[w];
  }).join(" ");
}

function wineryNeedles(entry) {
  var labels = [entry.name].concat(entry.aliases || []);
  var seen = {};
  var out = [];
  labels.forEach(function (label) {
    var folded = foldWinery(label);
    [folded, compactWinery(folded)].forEach(function (n) {
      if (!n || n.length < 3 || seen[n]) return;
      seen[n] = 1;
      out.push(n);
    });
  });
  return out;
}

function wineryNeedleHits(needle, hay, compactHay) {
  if (needle.length < 4) return hay === needle || compactHay === needle;
  var escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var re = new RegExp("(^| )" + escaped + "( |$)");
  return re.test(hay) || re.test(compactHay);
}

function wineryImageFor(w) {
  var generic = GENERIC_ESTATE || "vinedo.jpg";
  w = w || {};
  var hay = foldWinery((w.producer || "") + " " + (w.name || ""));
  var compactHay = compactWinery(hay);
  if (!hay) return generic;
  var best = null;
  var bestLen = 0;
  (WINERY_LIBRARY || []).forEach(function (entry) {
    wineryNeedles(entry).forEach(function (needle) {
      if (needle.length <= bestLen) return;
      if (!wineryNeedleHits(needle, hay, compactHay)) return;
      best = entry;
      bestLen = needle.length;
    });
  });
  return best ? best.file : generic;
}

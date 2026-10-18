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
  { name: "Numanthia", file: "vinedo-ribera.jpg", aliases: ["Numanthia"] },
  { name: "Bodegas Avelino Vegas", file: "vinedo.jpg", aliases: ["Avelino Vegas", "Circe"] },
  { name: "Domaine Coche-Dury", file: "bodega-domaine-coche-dury.jpg", aliases: ["Coche-Dury", "Coche Dury"] },
  { name: "Domaine Cécile Tremblay", file: "", aliases: ["Cécile Tremblay", "Cecile Tremblay"] },
  { name: "Domaine Georges Roumier", file: "", aliases: ["Georges Roumier", "Roumier"] }
];

/* Santiuste de San Juan Bautista: web https://avelinovegas.com/ y pin 41.161401, -4.574553. */
var WINERY_PLACES = [
  {
    name: "Bodegas Avelino Vegas",
    aliases: ["Avelino Vegas", "Circe"],
    lat: 41.161401,
    lng: -4.574553,
    zone: "Santiuste de San Juan Bautista",
    address: "Calle Grupo Calvo Sotelo, 8, 40460 Santiuste de San Juan Bautista (Segovia), España",
    web: "https://avelinovegas.com/"
  }
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
  return best && best.file ? best.file : generic;
}

/* Fichas de las 37 bodegas ilustradas. Un campo vacío no se ha podido comprobar. */
var WINERY_CARDS = [
  { id: "marques-de-riscal", name: "Marqués de Riscal", aliases: ["Riscal"], country: "España", zone: "Rioja", town: "Elciego", web: "https://www.marquesderiscal.com", address: "C/ Torrea 1, 01340 Elciego, Álava", lat: 42.515, lng: -2.618, founded: 1858, about: "Guillermo Hurtado de Amézaga fundó la bodega en Elciego en 1858.", wines: ["Marqués de Riscal Reserva", "Arienzo Crianza", "Marqués de Riscal Verdejo Sobre Lías Finas"], file: "bodega-marques-de-riscal.jpg" },
  { id: "familia-torres", name: "Familia Torres", aliases: ["Torres"], country: "España", zone: "Penedès", town: "Vilafranca del Penedès", web: "https://www.torres.es", address: "", lat: null, lng: null, founded: 1870, about: "Jaime y Miguel Torres Vendrell fundaron la bodega en Vilafranca del Penedès en 1870.", wines: [], file: "bodega-familia-torres.jpg" },
  { id: "gramona", name: "Gramona", aliases: [], country: "España", zone: "Cava", town: "Sant Sadurní d'Anoia", web: "https://gramona.com", address: "Carrer Indústria 36, 08770 Sant Sadurní d'Anoia", lat: 41.426, lng: 1.785, founded: 1881, about: "Pau Batlle fundó el Celler Batlle en Sant Sadurní d'Anoia en 1881.", wines: ["III Lustros", "Celler Batlle"], file: "bodega-gramona.jpg" },
  { id: "abadia-retuerta", name: "Abadía Retuerta", aliases: ["Abadia Retuerta"], country: "España", zone: "", town: "", web: "https://abadia-retuerta.com", address: "", lat: null, lng: null, founded: 1146, about: "El monasterio de Santa María de Retuerta fue fundado en 1146.", wines: [], file: "bodega-abadia-retuerta.jpg" },
  { id: "marques-de-murrieta", name: "Marqués de Murrieta", aliases: ["Murrieta", "Castillo Ygay", "Ygay"], country: "España", zone: "Rioja", town: "Ygay", web: "https://www.marquesdemurrieta.com", address: "", lat: 42.430, lng: -2.445, founded: 0, about: "La finca de Ygay es la casa de Castillo Ygay.", wines: ["Castillo Ygay"], file: "bodega-marques-de-murrieta.jpg" },
  { id: "abadal", name: "Abadal", aliases: [], country: "España", zone: "Pla de Bages", town: "Santa Maria d'Horta d'Avinyó", web: "https://abadal.net", address: "Santa Maria d'Horta d'Avinyó, 08279 Barcelona", lat: null, lng: null, founded: 1983, about: "Valentí Roqueta fundó Abadal en 1983, en el Pla de Bages.", wines: ["Abadal Picapoll", "Abadal 3.9", "Abadal Nuat", "Abadal Mandó"], file: "bodega-abadal.jpg" },
  { id: "vivanco", name: "Vivanco", aliases: [], country: "España", zone: "Rioja", town: "Briones", web: "https://vivancoculturadevino.es", address: "", lat: null, lng: null, founded: 0, about: "Bodega en Briones, en Rioja Alta.", wines: [], file: "bodega-vivanco.jpg" },
  { id: "codorniu", name: "Codorníu", aliases: ["Codorniu"], country: "España", zone: "Cava", town: "Sant Sadurní d'Anoia", web: "https://www.codorniu.com", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-codorniu.jpg" },
  { id: "pago-de-carraovejas", name: "Pago de Carraovejas", aliases: ["Carraovejas"], country: "España", zone: "Ribera del Duero", town: "Peñafiel", web: "https://www.pagodecarraovejas.com", address: "Camino de Carraovejas, s/n, 47300 Peñafiel, Valladolid", lat: null, lng: null, founded: 0, about: "Finca de viñedo en el valle de Carraovejas, junto a Peñafiel.", wines: ["Pago de Carraovejas"], file: "bodega-pago-de-carraovejas.jpg" },
  { id: "faustino", name: "Bodegas Faustino", aliases: ["Faustino"], country: "España", zone: "Rioja", town: "Oyón", web: "https://www.bodegasfaustino.com", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-faustino.jpg" },
  { id: "gonzalez-byass", name: "González Byass", aliases: ["Gonzalez Byass", "Tío Pepe", "Tio Pepe"], country: "España", zone: "Jerez", town: "Jerez de la Frontera", web: "https://www.gonzalezbyass.com", address: "", lat: null, lng: null, founded: 0, about: "Bodega de Jerez, casa de Tío Pepe.", wines: ["Tío Pepe"], file: "bodega-gonzalez-byass.jpg" },
  { id: "scala-dei", name: "Scala Dei", aliases: [], country: "España", zone: "Priorat", town: "Escaladei", web: "https://www.cellersdescaladei.com", address: "Rambla de la Cartoixa, 5, 43379 Escaladei, Tarragona", lat: 41.2547, lng: 0.8095, founded: 0, about: "", wines: [], file: "bodega-scala-dei.jpg" },
  { id: "ysios", name: "Ysios", aliases: [], country: "España", zone: "Rioja", town: "Laguardia", web: "https://www.bodegasysios.com", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-ysios.jpg" },
  { id: "cvne", name: "CVNE", aliases: ["Cune", "C.V.N.E."], country: "España", zone: "Rioja", town: "Haro", web: "https://www.cvne.com", address: "", lat: 42.576, lng: -2.846, founded: 1879, about: "Eusebio y Raimundo Real de Asúa fundaron CVNE en Haro en 1879.", wines: ["Imperial", "Viña Real", "Contino"], file: "bodega-cvne.jpg" },
  { id: "ramon-bilbao", name: "Ramón Bilbao", aliases: ["Ramon Bilbao"], country: "España", zone: "Rioja", town: "Haro", web: "", address: "Carretera Nacional 232, 26329 Haro, La Rioja", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-ramon-bilbao.jpg" },
  { id: "perelada", name: "Perelada", aliases: [], country: "España", zone: "", town: "", web: "", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-perelada.jpg" },
  { id: "la-rioja-alta", name: "La Rioja Alta", aliases: ["Rioja Alta"], country: "España", zone: "Rioja", town: "Haro", web: "", address: "Barrio de la Estación, s/n, 26200 Haro, La Rioja", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-la-rioja-alta.jpg" },
  { id: "juve-y-camps", name: "Juvé & Camps", aliases: ["Juvé y Camps", "Juve y Camps", "Juve & Camps"], country: "España", zone: "", town: "", web: "", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-juve-y-camps.jpg" },
  { id: "vega-sicilia", name: "Vega Sicilia", aliases: ["Valbuena", "Único", "Unico"], country: "España", zone: "Ribera del Duero", town: "Valbuena de Duero", web: "https://www.temposvegasicilia.com/es", address: "", lat: 41.6325, lng: -4.286, founded: 0, about: "", wines: ["Único", "Valbuena"], file: "bodega-vega-sicilia.jpg" },
  { id: "pontet-canet", name: "Château Pontet-Canet", aliases: ["Pontet-Canet", "Pontet Canet"], country: "Francia", zone: "Médoc", town: "Pauillac", web: "https://www.pontet-canet.com", address: "", lat: null, lng: null, founded: 0, about: "Cinquième cru classé de Pauillac.", wines: [], file: "bodega-chateau-pontet-canet.jpg" },
  { id: "ausone", name: "Château Ausone", aliases: ["Ausone"], country: "Francia", zone: "", town: "Saint-Émilion", web: "", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-chateau-ausone.jpg" },
  { id: "cheval-blanc", name: "Château Cheval Blanc", aliases: ["Cheval Blanc"], country: "Francia", zone: "", town: "Saint-Émilion", web: "https://www.chateau-chevalblanc.com", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-chateau-cheval-blanc.jpg" },
  { id: "massamier", name: "Château Massamier la Mignarde", aliases: ["Massamier"], country: "Francia", zone: "", town: "", web: "", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-chateau-massamier-la-mignarde.jpg" },
  { id: "leflaive", name: "Domaine Leflaive", aliases: ["Leflaive"], country: "Francia", zone: "Borgoña", town: "Puligny-Montrachet", web: "", address: "", lat: null, lng: null, founded: 0, about: "Joseph Leflaive formó el domaine en Puligny-Montrachet entre 1910 y 1930.", wines: [], file: "bodega-domaine-leflaive.jpg" },
  { id: "latour", name: "Château Latour", aliases: ["Latour", "Ch. Latour"], country: "Francia", zone: "Médoc", town: "Pauillac", web: "https://www.chateau-latour.com", address: "", lat: null, lng: null, founded: 0, about: "Premier cru classé de Pauillac.", wines: [], file: "bodega-chateau-latour.jpg" },
  { id: "haut-brion", name: "Château Haut-Brion", aliases: ["Haut-Brion", "Haut Brion"], country: "Francia", zone: "", town: "Pessac", web: "https://www.haut-brion.com", address: "", lat: null, lng: null, founded: 0, about: "Premier cru classé, en Pessac.", wines: [], file: "bodega-chateau-haut-brion.jpg" },
  { id: "margaux", name: "Château Margaux", aliases: ["Margaux", "Ch. Margaux"], country: "Francia", zone: "Médoc", town: "Margaux", web: "https://www.chateau-margaux.com", address: "", lat: 45.044, lng: -0.677, founded: 0, about: "Premier cru classé de Margaux.", wines: [], file: "vinedo-chateau-margaux.jpg" },
  { id: "lafite", name: "Château Lafite Rothschild", aliases: ["Lafite"], country: "Francia", zone: "Médoc", town: "Pauillac", web: "", address: "", lat: null, lng: null, founded: 0, about: "Premier cru classé de Pauillac.", wines: [], file: "bodega-chateau-lafite-rothschild.jpg" },
  { id: "cecile-tremblay", name: "Domaine Cécile Tremblay", aliases: ["Cécile Tremblay", "Cecile Tremblay"], country: "Francia", zone: "Borgoña", town: "Morey-Saint-Denis", web: "", address: "", lat: null, lng: null, founded: 2003, about: "Cécile Tremblay fundó el domaine en Morey-Saint-Denis en 2003.", wines: [], file: "" },
  { id: "coche-dury", name: "Domaine Coche-Dury", aliases: ["Coche-Dury", "Coche Dury"], country: "Francia", zone: "Borgoña", town: "Meursault", web: "", address: "", lat: null, lng: null, founded: 0, about: "Léon Coche fundó el domaine en Meursault en los años 1920.", wines: [], file: "bodega-domaine-coche-dury.jpg" },
  { id: "dugat-py", name: "Domaine Dugat-Py", aliases: ["Dugat-Py", "Dugat Py"], country: "Francia", zone: "Borgoña", town: "Gevrey-Chambertin", web: "", address: "", lat: null, lng: null, founded: 0, about: "Domaine de Gevrey-Chambertin.", wines: [], file: "bodega-domaine-dugat-py.jpg" },
  { id: "auvenay", name: "Domaine d'Auvenay", aliases: ["Auvenay", "d'Auvenay"], country: "Francia", zone: "Borgoña", town: "Saint-Romain", web: "", address: "", lat: null, lng: null, founded: 0, about: "Domaine de Lalou Bize-Leroy en Saint-Romain.", wines: [], file: "bodega-domaine-d-auvenay.jpg" },
  { id: "roumier", name: "Domaine Georges Roumier", aliases: ["Georges Roumier", "Roumier"], country: "Francia", zone: "Borgoña", town: "Chambolle-Musigny", web: "", address: "", lat: null, lng: null, founded: 1924, about: "Georges Roumier fundó el domaine en Chambolle-Musigny en 1924.", wines: [], file: "" },
  { id: "leroy", name: "Domaine Leroy", aliases: ["Leroy"], country: "Francia", zone: "Borgoña", town: "Vosne-Romanée", web: "", address: "", lat: null, lng: null, founded: 0, about: "Domaine de Lalou Bize-Leroy en Vosne-Romanée.", wines: [], file: "bodega-domaine-leroy.jpg" },
  { id: "petrus", name: "Petrus", aliases: ["Pétrus", "Château Pétrus"], country: "Francia", zone: "", town: "Pomerol", web: "", address: "", lat: null, lng: null, founded: 0, about: "", wines: [], file: "bodega-petrus.jpg" },
  { id: "mouton", name: "Château Mouton Rothschild", aliases: ["Mouton Rothschild", "Mouton"], country: "Francia", zone: "Médoc", town: "Pauillac", web: "", address: "", lat: null, lng: null, founded: 0, about: "Premier cru classé de Pauillac.", wines: [], file: "bodega-chateau-mouton-rothschild.jpg" },
  { id: "romanee-conti", name: "Domaine de la Romanée-Conti", aliases: ["Romanée-Conti", "Romanee-Conti", "DRC"], country: "Francia", zone: "Borgoña", town: "Vosne-Romanée", web: "", address: "", lat: null, lng: null, founded: 0, about: "Domaine de Vosne-Romanée.", wines: ["Romanée-Conti"], file: "bodega-domaine-de-la-romanee-conti.jpg" }
];

WINERY_CARDS.forEach(function (card) {
  WINERY_PLACES.push({
    name: card.name,
    aliases: card.aliases || [],
    lat: card.lat,
    lng: card.lng,
    zone: [card.town, card.zone].filter(Boolean).join(" · "),
    address: card.address || "",
    web: card.web || ""
  });
});

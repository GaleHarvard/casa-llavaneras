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
  { name: "Domaine Georges Roumier", file: "", aliases: ["Georges Roumier", "Roumier"] },
  { name: "Schloss Johannisberg", file: "bodega-schloss-johannisberg.jpg", aliases: ["Fürst von Metternich-Winneburg'sche Domäne Schloss Johannisberg"] },
  { name: "Kühling-Gillot", file: "bodega-kuhling-gillot.jpg", aliases: ["Weingut Kühling-Gillot", "Kühling & Battenfeld"] },
  { name: "Adega Cartuxa", file: "bodega-cartuxa.jpg", aliases: ["Cartuxa", "Fundação Eugénio de Almeida", "Quinta de Valbom"] },
  { name: "Fitapreta", file: "bodega-fitapreta.jpg", aliases: ["Fita Preta Vinhos", "Herdade Fitapreta"] },
  { name: "Vila Galé (Casa de Santa Vitória)", file: "bodega-vila-gale.jpg", aliases: ["Casa de Santa Vitória", "Santa Vitória", "Vila Galé Alentejo Vineyards"] },
  { name: "Casa Ferreirinha", file: "bodega-casa-ferreirinha.jpg", aliases: ["A.A. Ferreira", "Ferreira", "Sogrape"] },
  { name: "Churchill's", file: "bodega-churchills.jpg", aliases: ["Churchill Graham", "Quinta da Gricha"] },
  { name: "Niepoort", file: "bodega-niepoort.jpg", aliases: ["Niepoort Vinhos", "Quinta de Nápoles"] },
  { name: "Poças", file: "bodega-pocas.jpg", aliases: ["Poças Júnior"] },
  { name: "Quinta do Bomfim (Symington Family Estates)", file: "bodega-quinta-do-bomfim.jpg", aliases: ["Symington", "Dow's", "Quinta do Bomfim"] },
  { name: "Quinta do Crasto", file: "bodega-quinta-do-crasto.jpg", aliases: ["Crasto"] },
  { name: "Quinta do Pessegueiro", file: "bodega-quinta-do-pessegueiro.jpg", aliases: ["Zannier"] },
  { name: "Quinta Vale D. Maria", file: "bodega-quinta-vale-d-maria.jpg", aliases: ["Vale Dona Maria", "Van Zellers & Co"] },
  { name: "Taylor's", file: "bodega-taylors.jpg", aliases: ["Taylor Fladgate", "Taylor's Port"] },
  { name: "Wine & Soul", file: "bodega-wine-and-soul.jpg", aliases: ["Wine&Soul", "Vine & Soul", "Quinta da Manoella"] },
  { name: "Casa Santos Lima", file: "bodega-casa-santos-lima.jpg", aliases: ["Quinta da Boavista"] },
  { name: "Madeira Wine Company", file: "bodega-madeira-wine-company.jpg", aliases: ["Blandy's", "Madeira Wine Association"] },
  { name: "Casa Ermelinda Freitas", file: "bodega-ermelinda-freitas.jpg", aliases: ["Ermelinda Freitas"] },
  { name: "Aveleda", file: "bodega-aveleda.jpg", aliases: ["Quinta da Aveleda"] }
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
  {
    "id": "marques-de-riscal",
    "name": "Marqués de Riscal",
    "aliases": [
      "Riscal",
      "Herederos del Marqués de Riscal"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja (Rioja Alavesa)",
    "town": "Elciego",
    "web": "https://www.marquesderiscal.com/",
    "address": "Calle Torrea, 1, 01340 Elciego (Álava)",
    "lat": 42.5115,
    "lng": -2.6185,
    "precision": "bodega",
    "founded": 1858,
    "about": "Bodega histórica de Elciego, en la Rioja Alavesa, fundada en 1858 y una de las más antiguas de la DOCa Rioja. Su Ciudad del Vino tiene un hotel diseñado por Frank Gehry.",
    "wines": [
      "Barón de Chirel",
      "Marqués de Riscal Reserva",
      "Marqués de Riscal Gran Reserva",
      "Marqués de Riscal 150 Aniversario"
    ],
    "file": "bodega-marques-de-riscal.jpg",
    "sources": [
      "https://www.marquesderiscal.com/",
      "https://www.marquesderiscal.com/legal",
      "https://www.marquesderiscal.com/nuestra-historia",
      "https://www.openstreetmap.org/way/195419041",
      "https://www.marquesderiscal.com/nuestros-vinos"
    ]
  },
  {
    "id": "familia-torres",
    "name": "Familia Torres",
    "aliases": [
      "Torres",
      "Bodegas Torres",
      "Miguel Torres"
    ],
    "country": "España",
    "zone": "Penedès",
    "zoneText": "DO Penedès",
    "town": "Pacs del Penedès",
    "web": "https://www.torres.es/",
    "address": "Finca El Maset, s/n, 08796 Pacs del Penedès (Barcelona)",
    "lat": 41.3615,
    "lng": 1.6699,
    "precision": "municipio",
    "founded": 1870,
    "about": "Empresa familiar del Penedès fundada en 1870 en Vilafranca del Penedès, con la mayor superficie de viñedo de la DO Penedès. Su sede y la finca Mas La Plana están en Pacs del Penedès.",
    "wines": [
      "Mas La Plana",
      "Grans Muralles",
      "Milmanda",
      "Reserva Real"
    ],
    "file": "bodega-familia-torres.jpg",
    "sources": [
      "https://www.torres.es/",
      "https://www.torres.es/espacios-para-eventos/bodega-waltraud",
      "https://en.wikipedia.org/wiki/Bodegas_Torres",
      "https://www.openstreetmap.org/relation/341416"
    ]
  },
  {
    "id": "gramona",
    "name": "Gramona",
    "aliases": [
      "Celler Batlle"
    ],
    "country": "España",
    "zone": "Corpinnat",
    "zoneText": "Corpinnat (Penedès)",
    "town": "Sant Sadurní d'Anoia",
    "web": "https://www.gramona.com/",
    "address": "Carrer Indústria, 36, 08770 Sant Sadurní d'Anoia (Barcelona)",
    "lat": 41.427,
    "lng": 1.773,
    "precision": "bodega",
    "founded": 1881,
    "about": "Empresa familiar de Sant Sadurní d'Anoia, con seis generaciones, que elabora espumosos de larga crianza bajo la marca Corpinnat. Cultiva xarel·lo, macabeo y parellada en viticultura biodinámica.",
    "wines": [
      "III Lustros",
      "Celler Batlle",
      "Enoteca"
    ],
    "file": "bodega-gramona.jpg",
    "sources": [
      "https://www.gramona.com/es/",
      "https://es.wikipedia.org/wiki/Gramona",
      "https://www.openstreetmap.org/way/631855193"
    ]
  },
  {
    "id": "abadia-retuerta",
    "name": "Abadía Retuerta",
    "aliases": [
      "Abadia Retuerta"
    ],
    "country": "España",
    "zone": "",
    "zoneText": "Vino de la Tierra de Castilla y León",
    "town": "Sardón de Duero",
    "web": "https://abadia-retuerta.com/",
    "address": "Carretera N-122, km 332,5, 47340 Sardón de Duero (Valladolid)",
    "lat": 41.6169,
    "lng": -4.4107,
    "precision": "bodega",
    "founded": 1996,
    "about": "Finca vinícola junto al monasterio de Santa María de Retuerta, a orillas del Duero, fuera de la DO Ribera del Duero. La bodega actual se construyó en 1996.",
    "wines": [
      "Selección Especial",
      "Pago Negralada",
      "Pago Valdebellón"
    ],
    "file": "bodega-abadia-retuerta.jpg",
    "sources": [
      "https://abadia-retuerta.com/",
      "https://abadia-retuerta.com/aviso-legal/",
      "https://es.wikipedia.org/wiki/Monasterio_de_Santa_Mar%C3%ADa_de_Retuerta",
      "https://abadia-retuerta.com/bodega/historia/",
      "https://abadia-retuerta.com/producto/pago-valdebellon/"
    ]
  },
  {
    "id": "marques-de-murrieta",
    "name": "Marqués de Murrieta",
    "aliases": [
      "Murrieta",
      "Castillo Ygay",
      "Castillo de Igay"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja",
    "town": "Logroño",
    "web": "https://marquesdemurrieta.com/",
    "address": "Carretera N-232a, km 402, 26006 Logroño (La Rioja)",
    "lat": 42.4546,
    "lng": -2.3889,
    "precision": "bodega",
    "founded": 1852,
    "about": "Bodega fundada en 1852 por Luciano de Murrieta, la primera de Rioja en exportar sus vinos. Desde 1872 elabora en la finca Castillo Ygay, cerca de Logroño.",
    "wines": [
      "Castillo Ygay",
      "Dalmau",
      "Capellanía"
    ],
    "file": "bodega-marques-de-murrieta.jpg",
    "sources": [
      "https://marquesdemurrieta.com/",
      "https://marquesdemurrieta.com/pages/contacto",
      "https://en.wikipedia.org/wiki/Bodegas_Marqu%C3%A9s_de_Murrieta",
      "https://www.openstreetmap.org/way/410675265"
    ]
  },
  {
    "id": "abadal",
    "name": "Abadal",
    "aliases": [
      "Bodegues Abadal",
      "Celler Abadal",
      "Roqueta Origen"
    ],
    "country": "España",
    "zone": "Pla de Bages",
    "zoneText": "DO Pla de Bages",
    "town": "Santa Maria d'Horta d'Avinyó (Avinyó)",
    "web": "https://abadal.net/",
    "address": "Masia Oliveres, s/n, 08279 Santa Maria d'Horta d'Avinyó (Barcelona)",
    "lat": 41.8188,
    "lng": 1.9809,
    "precision": "bodega",
    "founded": 1983,
    "about": "Bodega de la familia Roqueta en el Bages, fundada en 1983 por Valentí Roqueta junto a la masía familiar. Impulsó la recuperación de variedades locales como la picapoll y la mandó, y la creación de la DO Pla de Bages.",
    "wines": [
      "Abadal Picapoll",
      "Abadal 3.9",
      "Abadal Mandó"
    ],
    "file": "bodega-abadal.jpg",
    "sources": [
      "https://abadal.net/",
      "https://abadal.net/legal-notice/",
      "https://abadal.net/the-winery/",
      "https://www.openstreetmap.org/way/182876024"
    ]
  },
  {
    "id": "vivanco",
    "name": "Vivanco",
    "aliases": [
      "Bodegas Vivanco",
      "Dinastía Vivanco",
      "Vivanco Cultura de Vino"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja",
    "town": "Briones",
    "web": "https://vivancoculturadevino.es/",
    "address": "Carretera Nacional 232, km 442, 26330 Briones (La Rioja)",
    "lat": 42.5395,
    "lng": -2.7775,
    "precision": "bodega",
    "founded": 0,
    "about": "Bodega familiar de Briones que alberga el Museo Vivanco de la Cultura del Vino, de 4000 m², con un jardín de más de 220 variedades de vid.",
    "wines": [
      "Vivanco Crianza",
      "Colección Vivanco 4 Varietales",
      "Vivanco Reserva"
    ],
    "file": "bodega-vivanco.jpg",
    "sources": [
      "https://vivancoculturadevino.es/es/",
      "https://vivancoculturadevino.es/es/aviso-legal/",
      "https://es.wikipedia.org/wiki/Museo_Vivanco_de_la_Cultura_del_Vino"
    ]
  },
  {
    "id": "codorniu",
    "name": "Codorníu",
    "aliases": [
      "Codorniu",
      "Raventós Codorníu"
    ],
    "country": "España",
    "zone": "Cava",
    "zoneText": "DO Cava (Penedès)",
    "town": "Sant Sadurní d'Anoia",
    "web": "https://www.codorniu.com/",
    "address": "Avinguda Jaume Codorníu, s/n, 08770 Sant Sadurní d'Anoia (Barcelona)",
    "lat": 41.4357,
    "lng": 1.7972,
    "precision": "bodega",
    "founded": 1551,
    "about": "El productor de cava más antiguo y uno de los mayores, con orígenes documentados en 1551 en Sant Sadurní d'Anoia. Sus cavas modernistas son monumento histórico-artístico.",
    "wines": [
      "Anna de Codorníu",
      "Ars Collecta Jaume Codorníu Gran Reserva",
      "Ars Collecta Blanc de Noirs Gran Reserva"
    ],
    "file": "bodega-codorniu.jpg",
    "sources": [
      "https://www.codorniu.com/en/contact-us",
      "https://www.codorniu.com/en/legal-notice",
      "https://en.wikipedia.org/wiki/Codorn%C3%ADu_Winery",
      "https://es.wikipedia.org/wiki/Codorn%C3%ADu",
      "https://www.codorniu.com/cavas/premium-prestige"
    ]
  },
  {
    "id": "pago-de-carraovejas",
    "name": "Pago de Carraovejas",
    "aliases": [
      "Carraovejas"
    ],
    "country": "España",
    "zone": "Ribera del Duero",
    "zoneText": "DO Ribera del Duero",
    "town": "Peñafiel",
    "web": "https://www.pagodecarraovejas.com/",
    "address": "Camino de Carraovejas, s/n, 47300 Peñafiel (Valladolid)",
    "lat": 41.5943,
    "lng": -4.0876,
    "precision": "bodega",
    "founded": 1987,
    "about": "Bodega de Peñafiel nacida en 1987, cuando José María Ruiz plantó sus primeras nueve hectáreas en las laderas de Carraovejas, a los pies del castillo.",
    "wines": [
      "Pago de Carraovejas",
      "El Anejón",
      "Cuesta de las Liebres"
    ],
    "file": "bodega-pago-de-carraovejas.jpg",
    "sources": [
      "https://www.pagodecarraovejas.com/",
      "https://www.pagodecarraovejas.com/bodega/historia-de-carraovejas/",
      "https://www.openstreetmap.org/way/885843957",
      "https://www.pagodecarraovejas.com/vinos/"
    ]
  },
  {
    "id": "faustino",
    "name": "Bodegas Faustino",
    "aliases": [
      "Faustino",
      "Familia Martínez Zabala"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja (Rioja Alavesa)",
    "town": "Oyón",
    "web": "https://www.bodegasfaustino.com/",
    "address": "Carretera de Logroño, s/n, 01320 Oyón (Álava)",
    "lat": 42.4908,
    "lng": -2.4356,
    "precision": "bodega",
    "founded": 1861,
    "about": "Bodega de Oyón, en la Rioja Alavesa, fundada en 1861 por Eleuterio Martínez Arzok. Es conocida por su Faustino I Gran Reserva, que salió al mercado en 1964.",
    "wines": [
      "Faustino I Gran Reserva",
      "Faustino V",
      "Faustino VII"
    ],
    "file": "bodega-faustino.jpg",
    "sources": [
      "https://www.bodegasfaustino.com/",
      "https://www.bodegasfaustino.com/faustinoI/",
      "https://en.wikipedia.org/wiki/Bodegas_Faustino"
    ]
  },
  {
    "id": "gonzalez-byass",
    "name": "González Byass",
    "aliases": [
      "Gonzalez Byass",
      "Tío Pepe",
      "Tio Pepe"
    ],
    "country": "España",
    "zone": "Jerez",
    "zoneText": "DO Jerez-Xérès-Sherry",
    "town": "Jerez de la Frontera",
    "web": "https://www.gonzalezbyass.com/",
    "address": "Calle Manuel María González, 12, 11403 Jerez de la Frontera (Cádiz)",
    "lat": 36.6801,
    "lng": -6.143,
    "precision": "bodega",
    "founded": 1835,
    "about": "Casa jerezana fundada en 1835 por Manuel María González Ángel, al que luego se unió su agente inglés Robert Blake Byass. Su fino Tío Pepe es una de las marcas de vino más conocidas de España.",
    "wines": [
      "Tío Pepe",
      "Viña AB",
      "Apóstoles",
      "Noé"
    ],
    "file": "bodega-gonzalez-byass.jpg",
    "sources": [
      "https://www.gonzalezbyass.com/es/aviso-legal",
      "https://en.wikipedia.org/wiki/Gonz%C3%A1lez_Byass",
      "https://www.openstreetmap.org/way/184309385",
      "https://es.wikipedia.org/wiki/Gonz%C3%A1lez_Byass",
      "https://www.gonzalezbyass.com/en/wineries-brands/gonzalez-byass-1"
    ]
  },
  {
    "id": "scala-dei",
    "name": "Scala Dei",
    "aliases": [
      "Cellers de Scala Dei",
      "Cellers Scala Dei"
    ],
    "country": "España",
    "zone": "Priorat",
    "zoneText": "DOQ Priorat",
    "town": "Escaladei (La Morera de Montsant)",
    "web": "https://cellersdescaladei.com/",
    "address": "Rambla de la Cartoixa, s/n, 43379 Escaladei (Tarragona)",
    "lat": 41.2476,
    "lng": 0.8114,
    "precision": "bodega",
    "founded": 1974,
    "about": "Bodega fundada en 1974 en Escaladei, en edificios de la antigua cartuja que dio origen al vino del Priorat. La cava de crianza está en la casa del procurador de la cartuja.",
    "wines": [
      "Cartoixa",
      "Prior",
      "Masdeu"
    ],
    "file": "bodega-scala-dei.jpg",
    "sources": [
      "https://cellersdescaladei.com/",
      "https://cellersdescaladei.com/pages/aviso-legal",
      "https://www.doqpriorat.org/es/bodegas/cellers-de-scala-dei-sa/",
      "https://www.openstreetmap.org/way/286397189",
      "https://ca.wikipedia.org/wiki/Cellers_de_Scala_Dei",
      "https://cellersdescaladei.com/collections/all"
    ]
  },
  {
    "id": "ysios",
    "name": "Ysios",
    "aliases": [
      "Bodegas Ysios"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja (Rioja Alavesa)",
    "town": "Laguardia",
    "web": "https://bodegasysios.com/",
    "address": "Camino de la Hoya, s/n, 01300 Laguardia (Álava)",
    "lat": 42.5687,
    "lng": -2.591,
    "precision": "bodega",
    "founded": 2001,
    "about": "Bodega de Laguardia, al pie de la sierra de Cantabria, en un edificio de Santiago Calatrava inaugurado en 2001. Elabora tempranillo de la Rioja Alavesa.",
    "wines": [
      "Ysios Edición Limitada",
      "Ysios Reserva"
    ],
    "file": "bodega-ysios.jpg",
    "sources": [
      "https://bodegasysios.com/",
      "https://bodegasysios.com/contacto/",
      "https://es.wikipedia.org/wiki/Bodegas_Ysios",
      "https://www.openstreetmap.org/way/224489124",
      "https://www.esenciarioja.es/en/bodegas-asociadas-esencia-rioja/bodegas-ysios-en/"
    ]
  },
  {
    "id": "cvne",
    "name": "CVNE",
    "aliases": [
      "Cune",
      "Compañía Vinícola del Norte de España"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja",
    "town": "Haro",
    "web": "https://cvne.com/",
    "address": "Avenida Costa del Vino, 21 (Barrio de la Estación), 26200 Haro (La Rioja)",
    "lat": 42.5819,
    "lng": -2.8491,
    "precision": "bodega",
    "founded": 1879,
    "about": "Bodega familiar fundada en 1879 en el Barrio de la Estación de Haro y llevada hoy por la quinta generación. Agrupa las marcas Cune, Imperial, Viña Real y Monopole.",
    "wines": [
      "Imperial Gran Reserva",
      "Viña Real",
      "Monopole",
      "Cune Reserva"
    ],
    "file": "bodega-cvne.jpg",
    "sources": [
      "https://cvne.com/",
      "https://www.haroturismo.org/es/enoturismo/bodegas/cvne",
      "https://es.wikipedia.org/wiki/Compa%C3%B1%C3%ADa_Vin%C3%ADcola_del_Norte_de_Espa%C3%B1a",
      "https://www.openstreetmap.org/way/823626545"
    ]
  },
  {
    "id": "ramon-bilbao",
    "name": "Ramón Bilbao",
    "aliases": [
      "Bodegas Ramón Bilbao",
      "Ramon Bilbao"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja",
    "town": "Haro",
    "web": "https://bodegasramonbilbao.com/",
    "address": "Avenida Santo Domingo de la Calzada, 34, 26200 Haro (La Rioja)",
    "lat": 42.5696,
    "lng": -2.8626,
    "precision": "bodega",
    "founded": 1924,
    "about": "Bodega de Haro fundada en 1924, cuando Ramón Bilbao registró su marca. En 2014 el IWSC la nombró mejor bodega española.",
    "wines": [
      "Ramón Bilbao Crianza",
      "Ramón Bilbao Reserva",
      "Ramón Bilbao Gran Reserva",
      "Mirto"
    ],
    "file": "bodega-ramon-bilbao.jpg",
    "sources": [
      "https://bodegasramonbilbao.com/",
      "https://bodegasramonbilbao.com/visitanos/",
      "https://www.haroturismo.org/es/enoturismo/bodegas/bodegas-ramon-bilbao",
      "https://www.openstreetmap.org/way/823597776",
      "https://bodegasramonbilbao.com/nosotros/",
      "https://bodegasramonbilbao.com/vinos/"
    ]
  },
  {
    "id": "perelada",
    "name": "Perelada",
    "aliases": [
      "Castillo Perelada",
      "Cavas del Castillo de Perelada",
      "Grup Peralada",
      "Peralada"
    ],
    "country": "España",
    "zone": "Empordà",
    "zoneText": "DO Empordà",
    "town": "Peralada",
    "web": "https://www.perelada.com/",
    "address": "Paratge La Granja, s/n, 17491 Peralada (Girona)",
    "lat": 42.3085,
    "lng": 3.009,
    "precision": "municipio",
    "founded": 1923,
    "about": "Bodega del Empordà vinculada al castillo de Peralada, propiedad de la familia Suqué Mateu y con origen en 1923.",
    "wines": [
      "Gran Claustro",
      "Ex Ex",
      "Garnatxa de l'Empordà"
    ],
    "file": "bodega-perelada.jpg",
    "sources": [
      "https://www.perelada.com/",
      "https://perelada.com/es/contacto",
      "https://www.openstreetmap.org/relation/345221"
    ]
  },
  {
    "id": "la-rioja-alta",
    "name": "La Rioja Alta",
    "aliases": [
      "La Rioja Alta S.A.",
      "Rioja Alta"
    ],
    "country": "España",
    "zone": "Rioja",
    "zoneText": "DOCa Rioja",
    "town": "Haro",
    "web": "https://www.riojalta.com/",
    "address": "Avenida de Vizcaya, 8, 26200 Haro (La Rioja)",
    "lat": 42.5844,
    "lng": -2.8469,
    "precision": "bodega",
    "founded": 1890,
    "about": "Bodega del Barrio de la Estación de Haro fundada en 1890 por cinco viticultores locales. Es conocida por sus grandes reservas de larga crianza.",
    "wines": [
      "Gran Reserva 904",
      "Gran Reserva 890",
      "Viña Ardanza",
      "Viña Arana"
    ],
    "file": "bodega-la-rioja-alta.jpg",
    "sources": [
      "https://www.riojalta.com/",
      "https://riojawine.com/es/bodegas-rioja/la-rioja-alta-sa/",
      "https://en.wikipedia.org/wiki/La_Rioja_Alta",
      "https://www.openstreetmap.org/way/505670122"
    ]
  },
  {
    "id": "juve-y-camps",
    "name": "Juvé & Camps",
    "aliases": [
      "Juvé y Camps",
      "Juve y Camps",
      "Juve & Camps"
    ],
    "country": "España",
    "zone": "Cava",
    "zoneText": "DO Cava (Penedès)",
    "town": "Sant Sadurní d'Anoia",
    "web": "https://www.juveycamps.com/",
    "address": "Carrer Sant Venat, 1, 08770 Sant Sadurní d'Anoia (Barcelona)",
    "lat": 41.4246,
    "lng": 1.7919,
    "precision": "bodega",
    "founded": 1921,
    "about": "Casa familiar de Sant Sadurní d'Anoia fundada en 1921 por Joan Juvé Baqués y Teresa Camps Ferrer, especializada en cavas de larga crianza.",
    "wines": [
      "Reserva de la Familia",
      "Gran Juvé & Camps",
      "Milesimé"
    ],
    "file": "bodega-juve-y-camps.jpg",
    "sources": [
      "https://www.juveycamps.com/",
      "https://www.juveycamps.com/contacto/",
      "https://www.juveycamps.com/familia/",
      "https://www.openstreetmap.org/way/771128093",
      "https://www.revistadelvino.es/2022/12/04/juve-camps-milesime-parcelarios-origen-y-terrunos/"
    ]
  },
  {
    "id": "vega-sicilia",
    "name": "Vega Sicilia",
    "aliases": [
      "Bodegas Vega Sicilia",
      "Tempos Vega Sicilia",
      "Único",
      "Valbuena"
    ],
    "country": "España",
    "zone": "Ribera del Duero",
    "zoneText": "DO Ribera del Duero",
    "town": "Valbuena de Duero",
    "web": "https://temposvegasicilia.com/",
    "address": "Carretera N-122, km 323, 47359 Valbuena de Duero (Valladolid)",
    "lat": 41.629,
    "lng": -4.2939,
    "precision": "bodega",
    "founded": 1864,
    "about": "Bodega de Valbuena de Duero fundada en 1864, una de las más prestigiosas de España. Su Único se cría alrededor de diez años antes de salir al mercado.",
    "wines": [
      "Único",
      "Valbuena 5°"
    ],
    "file": "bodega-vega-sicilia.jpg",
    "sources": [
      "https://temposvegasicilia.com/",
      "https://temposvegasicilia.com/es/politica-de-privacidad",
      "https://en.wikipedia.org/wiki/Vega_Sicilia",
      "https://www.temposvegasicilia.com/es/contacto"
    ]
  },
  {
    "id": "pontet-canet",
    "name": "Château Pontet-Canet",
    "aliases": [
      "Pontet-Canet",
      "Pontet Canet"
    ],
    "country": "Francia",
    "zone": "Médoc",
    "zoneText": "AOC Pauillac (Burdeos)",
    "town": "Pauillac",
    "web": "https://www.pontet-canet.com/",
    "address": "Château Pontet-Canet, 33250 Pauillac",
    "lat": 45.2084,
    "lng": -0.7706,
    "precision": "bodega",
    "founded": "principios del siglo XVIII",
    "about": "Quinto gran cru clasificado de Pauillac en 1855, conocido por su viticultura biodinámica.",
    "wines": [
      "Château Pontet-Canet",
      "Les Hauts de Pontet"
    ],
    "file": "bodega-chateau-pontet-canet.jpg",
    "sources": [
      "https://www.pontet-canet.com/",
      "https://www.pontet-canet.com/mentions-legales/",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Pontet-Canet",
      "https://en.wikipedia.org/wiki/Ch%C3%A2teau_Pontet-Canet"
    ]
  },
  {
    "id": "ausone",
    "name": "Château Ausone",
    "aliases": [
      "Ausone"
    ],
    "country": "Francia",
    "zone": "",
    "zoneText": "AOC Saint-Émilion Grand Cru (Burdeos)",
    "town": "Saint-Émilion",
    "web": "https://www.chateau-ausone.fr/",
    "address": "Château Ausone, 33330 Saint-Émilion",
    "lat": 44.8892,
    "lng": -0.1564,
    "precision": "bodega",
    "founded": 0,
    "about": "Pequeña finca de Saint-Émilion, propiedad de la familia Vauthier, que lleva el nombre del poeta romano Ausonio. Fue primer gran cru clasificado A de Saint-Émilion.",
    "wines": [
      "Château Ausone",
      "Chapelle d'Ausone"
    ],
    "file": "bodega-chateau-ausone.jpg",
    "sources": [
      "https://www.chateau-ausone.fr/",
      "https://www.chateau-ausone.fr/en/legal-mentions/",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Ausone"
    ]
  },
  {
    "id": "cheval-blanc",
    "name": "Château Cheval Blanc",
    "aliases": [
      "Cheval Blanc"
    ],
    "country": "Francia",
    "zone": "",
    "zoneText": "AOC Saint-Émilion Grand Cru (Burdeos)",
    "town": "Saint-Émilion",
    "web": "https://www.chateau-cheval-blanc.com/",
    "address": "Château Cheval Blanc, 33330 Saint-Émilion",
    "lat": 44.9195,
    "lng": -0.1893,
    "precision": "bodega",
    "founded": 0,
    "about": "Finca de Saint-Émilion, junto a Pomerol, famosa por la alta proporción de cabernet franc de su ensamblaje.",
    "wines": [
      "Château Cheval Blanc",
      "Le Petit Cheval"
    ],
    "file": "bodega-chateau-cheval-blanc.jpg",
    "sources": [
      "https://www.chateau-cheval-blanc.com/",
      "https://www.chateau-cheval-blanc.com/mentions-legales/",
      "https://en.wikipedia.org/wiki/Ch%C3%A2teau_Cheval_Blanc"
    ]
  },
  {
    "id": "massamier",
    "name": "Château Massamier la Mignarde",
    "aliases": [
      "Massamier",
      "Massamier La Mignarde"
    ],
    "country": "Francia",
    "zone": "Languedoc",
    "zoneText": "AOC Minervois (Languedoc)",
    "town": "Pépieux",
    "web": "https://massamier-la-mignarde.com/",
    "address": "Château Massamier La Mignarde, 11700 Pépieux",
    "lat": 43.2974,
    "lng": 2.6801,
    "precision": "municipio",
    "founded": 0,
    "about": "Finca familiar del Minervois, en Pépieux (Aude), con un viñedo agroforestal en el que planta árboles entre las cepas. Elabora vinos blancos, tintos, rosados y naranja.",
    "wines": [
      "Les Arbousiers",
      "Expression de Sauvignon",
      "Campus Domini Rosé"
    ],
    "file": "bodega-chateau-massamier-la-mignarde.jpg",
    "sources": [
      "https://massamier-la-mignarde.com/",
      "https://www.openstreetmap.org/relation/78117",
      "https://massamier-la-mignarde.com/boutique/"
    ]
  },
  {
    "id": "leflaive",
    "name": "Domaine Leflaive",
    "aliases": [
      "Leflaive"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Beaune (Puligny-Montrachet)",
    "town": "Puligny-Montrachet",
    "web": "https://www.leflaive.fr/",
    "address": "Place Pasquier de la Fontaine, 21190 Puligny-Montrachet",
    "lat": 46.9487,
    "lng": 4.7532,
    "precision": "municipio",
    "founded": 1717,
    "about": "Finca de referencia de los blancos de Puligny-Montrachet, con presencia de la familia Leflaive en el pueblo desde 1717. Cultiva en biodinámica.",
    "wines": [
      "Chevalier-Montrachet",
      "Bâtard-Montrachet",
      "Puligny-Montrachet 1er Cru Les Pucelles"
    ],
    "file": "bodega-domaine-leflaive.jpg",
    "sources": [
      "https://www.leflaive.fr/fr_FR/",
      "https://www.leflaive.fr/fr_FR/mentions-legales",
      "https://en.wikipedia.org/wiki/Domaine_Leflaive",
      "https://www.openstreetmap.org/relation/128158"
    ]
  },
  {
    "id": "latour",
    "name": "Château Latour",
    "aliases": [
      "Latour",
      "Ch. Latour"
    ],
    "country": "Francia",
    "zone": "Médoc",
    "zoneText": "AOC Pauillac (Burdeos)",
    "town": "Pauillac",
    "web": "https://www.chateau-latour.com/",
    "address": "Lieu-dit Saint-Lambert, 33250 Pauillac",
    "lat": 45.1771,
    "lng": -0.7442,
    "precision": "bodega",
    "founded": 1331,
    "about": "Primer gran cru clasificado de 1855 en el extremo sur de Pauillac, junto al estuario del Gironda. Pertenece a François Pinault.",
    "wines": [
      "Château Latour (Grand Vin)",
      "Les Forts de Latour",
      "Pauillac de Château Latour"
    ],
    "file": "bodega-chateau-latour.jpg",
    "sources": [
      "https://www.chateau-latour.com/fr",
      "https://www.chateau-latour.com/fr/mentions-legales",
      "https://en.wikipedia.org/wiki/Ch%C3%A2teau_Latour",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Latour"
    ]
  },
  {
    "id": "haut-brion",
    "name": "Château Haut-Brion",
    "aliases": [
      "Haut-Brion",
      "Haut Brion"
    ],
    "country": "Francia",
    "zone": "",
    "zoneText": "AOC Pessac-Léognan (Graves, Burdeos)",
    "town": "Pessac",
    "web": "https://www.haut-brion.com/",
    "address": "135 avenue Jean Jaurès, 33600 Pessac",
    "lat": 44.8142,
    "lng": -0.6127,
    "precision": "bodega",
    "founded": 1525,
    "about": "El único primer gran cru de 1855 fuera del Médoc, en Pessac, a las afueras de Burdeos. Pertenece al Domaine Clarence Dillon.",
    "wines": [
      "Château Haut-Brion",
      "Château Haut-Brion Blanc",
      "Le Clarence de Haut-Brion"
    ],
    "file": "bodega-chateau-haut-brion.jpg",
    "sources": [
      "https://www.haut-brion.com/",
      "https://www.pessac-leognan.com/nos-chateaux/chateau-haut-brion/",
      "https://en.wikipedia.org/wiki/Ch%C3%A2teau_Haut-Brion",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Haut-Brion"
    ]
  },
  {
    "id": "margaux",
    "name": "Château Margaux",
    "aliases": [
      "Margaux",
      "Ch. Margaux"
    ],
    "country": "Francia",
    "zone": "Médoc",
    "zoneText": "AOC Margaux (Burdeos)",
    "town": "Margaux-Cantenac",
    "web": "https://www.chateau-margaux.com/",
    "address": "Domaine de Château Margaux, 33460 Margaux-Cantenac",
    "lat": 45.0444,
    "lng": -0.6688,
    "precision": "bodega",
    "founded": 0,
    "about": "Primer gran cru clasificado de 1855, con 262 hectáreas en la AOC Margaux. Es propiedad de la familia Mentzelopoulos.",
    "wines": [
      "Château Margaux",
      "Pavillon Rouge du Château Margaux",
      "Pavillon Blanc du Château Margaux"
    ],
    "file": "vinedo-chateau-margaux.jpg",
    "sources": [
      "https://www.chateau-margaux.com/",
      "https://www.societe.com/societe/sca-chateau-margaux-321152993.html",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Margaux"
    ]
  },
  {
    "id": "lafite",
    "name": "Château Lafite Rothschild",
    "aliases": [
      "Lafite",
      "Lafite Rothschild"
    ],
    "country": "Francia",
    "zone": "Médoc",
    "zoneText": "AOC Pauillac (Burdeos)",
    "town": "Pauillac",
    "web": "https://www.lafite.com/",
    "address": "Le Pouyalet, 33250 Pauillac",
    "lat": 45.2249,
    "lng": -0.773,
    "precision": "bodega",
    "founded": 0,
    "about": "Primer gran cru clasificado de 1855 en Pauillac, de la familia Rothschild desde el siglo XIX. Tiene 178 hectáreas, 116 de ellas de viñedo.",
    "wines": [
      "Château Lafite Rothschild",
      "Carruades de Lafite"
    ],
    "file": "bodega-chateau-lafite-rothschild.jpg",
    "sources": [
      "https://www.lafite.com/domaines/chateau-lafite-rothschild/contact/",
      "https://www.pagesjaunes.fr/pros/06022154",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Lafite_Rothschild"
    ]
  },
  {
    "id": "cecile-tremblay",
    "name": "Domaine Cécile Tremblay",
    "aliases": [
      "Cécile Tremblay",
      "C. Tremblay"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Nuits",
    "town": "Morey-Saint-Denis",
    "web": "",
    "address": "8 rue de Très Girard, 21220 Morey-Saint-Denis",
    "lat": 47.1957,
    "lng": 4.9666,
    "precision": "bodega",
    "founded": 2003,
    "about": "Finca de la Côte de Nuits creada en 2003 por Cécile Tremblay a partir de viñas de su familia. Entre sus vinos está el grand cru Chapelle-Chambertin.",
    "wines": [
      "Chapelle-Chambertin",
      "Échezeaux"
    ],
    "file": "bodega-domaine-cecile-tremblay.jpg",
    "sources": [
      "https://grossiste.e-pro.fr/cote-d-or/c-tremblay_f4096486",
      "https://www.burgundy-report.com/burgundy-report-extra/12-2023/cecile-tremblay-2022/",
      "https://www.openstreetmap.org/way/133392315",
      "https://www.mesaccordsmetsvins.fr/partenaires-bourgogne"
    ]
  },
  {
    "id": "coche-dury",
    "name": "Domaine Coche-Dury",
    "aliases": [
      "Coche-Dury",
      "Coche Dury"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Beaune (Meursault)",
    "town": "Meursault",
    "web": "",
    "address": "25 rue Charles Giraud, 21190 Meursault",
    "lat": 46.9746,
    "lng": 4.7808,
    "precision": "bodega",
    "founded": 0,
    "about": "Finca de Meursault, en la Côte de Beaune, de la familia Coche. Sus Meursault y su Corton-Charlemagne están entre los blancos más buscados de Borgoña.",
    "wines": [
      "Corton-Charlemagne",
      "Meursault 1er Cru Perrières",
      "Meursault 1er Cru Caillerets"
    ],
    "file": "bodega-domaine-coche-dury.jpg",
    "sources": [
      "https://www.societe.com/societe/coche-dury-408788461.html",
      "https://en.wikipedia.org/wiki/Domaine_Coche-Dury",
      "https://www.openstreetmap.org/node/2894170436"
    ]
  },
  {
    "id": "dugat-py",
    "name": "Domaine Dugat-Py",
    "aliases": [
      "Dugat-Py",
      "Dugat Py",
      "Domaine Bernard Dugat-Py"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Nuits (Gevrey-Chambertin)",
    "town": "Gevrey-Chambertin",
    "web": "http://www.dugat-py.fr/",
    "address": "Rue Planteligone, Cour de l'Aumônerie, BP 31, 21220 Gevrey-Chambertin",
    "lat": 47.2262,
    "lng": 4.9706,
    "precision": "municipio",
    "founded": 1923,
    "about": "Finca familiar de Gevrey-Chambertin nacida del primer Domaine Dugat (1923) y llamada Dugat-Py desde 1994. La dirige Bernard Dugat-Py, conocido por sus grands crus de viñas viejas.",
    "wines": [
      "Chambertin",
      "Mazis-Chambertin",
      "Charmes-Chambertin"
    ],
    "file": "bodega-domaine-dugat-py.jpg",
    "sources": [
      "http://www.dugat-py.fr/contact.0_6__.php",
      "https://www.burgundy-report.com/burgundy-report-extra/11-2017/profile-dugat-py/",
      "https://www.openstreetmap.org/relation/134176"
    ]
  },
  {
    "id": "auvenay",
    "name": "Domaine d'Auvenay",
    "aliases": [
      "Auvenay",
      "d'Auvenay"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Beaune (Saint-Romain)",
    "town": "Saint-Romain",
    "web": "",
    "address": "Auvenay, 21190 Saint-Romain",
    "lat": 47.0084,
    "lng": 4.6784,
    "precision": "bodega",
    "founded": 1988,
    "about": "Finca personal de Lalou Bize-Leroy en la meseta sobre Saint-Romain, cerca de Meursault, con su primera añada en 1989. Produce cantidades mínimas de grandes blancos y tintos.",
    "wines": [
      "Chevalier-Montrachet",
      "Criots-Bâtard-Montrachet",
      "Mazis-Chambertin"
    ],
    "file": "bodega-domaine-d-auvenay.jpg",
    "sources": [
      "https://www.pappers.fr/entreprise/domaine-dauvenay-819782574",
      "https://www.winewithseth.com/winewiki/domaine-d-auvenay/",
      "https://www.openstreetmap.org/node/4911607259",
      "https://worldoffinewine.com/news-features/lalou-bize-leroy"
    ]
  },
  {
    "id": "roumier",
    "name": "Domaine Georges Roumier",
    "aliases": [
      "Roumier",
      "Georges Roumier",
      "Domaine Roumier"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Nuits (Chambolle-Musigny)",
    "town": "Chambolle-Musigny",
    "web": "",
    "address": "4 rue de Vergy, 21220 Chambolle-Musigny",
    "lat": 47.1853,
    "lng": 4.9502,
    "precision": "bodega",
    "founded": 1924,
    "about": "Finca de Chambolle-Musigny fundada en 1924 por Georges Roumier y dirigida por su nieto Christophe Roumier desde 1990.",
    "wines": [
      "Musigny",
      "Bonnes-Mares",
      "Chambolle-Musigny 1er Cru Les Amoureuses"
    ],
    "file": "bodega-domaine-georges-roumier.jpg",
    "sources": [
      "https://chambollemusigny.fr/de/weinberge-und-weine/unsere-winzer",
      "https://www.winewithseth.com/winewiki/domaine-roumier/",
      "https://www.openstreetmap.org/node/12492701086"
    ]
  },
  {
    "id": "leroy",
    "name": "Domaine Leroy",
    "aliases": [
      "Leroy",
      "Lalou Bize-Leroy"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Nuits (Vosne-Romanée)",
    "town": "Vosne-Romanée",
    "web": "https://www.domaine-leroy.fr/",
    "address": "15 rue de la Fontaine, 21700 Vosne-Romanée",
    "lat": 47.1558,
    "lng": 4.9559,
    "precision": "bodega",
    "founded": 1988,
    "about": "Finca de Lalou Bize-Leroy, creada en 1988 tras la compra del Domaine Charles Noëllat en Vosne-Romanée. Cultiva en biodinámica con certificación de Ecocert.",
    "wines": [
      "Musigny",
      "Richebourg",
      "Chambertin"
    ],
    "file": "bodega-domaine-leroy.jpg",
    "sources": [
      "https://www.domaine-leroy.fr/",
      "https://www.societe.com/societe/sce-du-domaine-leroy-778269365.html",
      "https://en.wikipedia.org/wiki/Domaine_Leroy",
      "https://www.enprimeurclub.com/wineries/domaine-leroy",
      "https://domaine-leroy.fr/vineyard/richebourg/en"
    ]
  },
  {
    "id": "petrus",
    "name": "Petrus",
    "aliases": [
      "Pétrus",
      "Château Pétrus",
      "Château Petrus"
    ],
    "country": "Francia",
    "zone": "",
    "zoneText": "AOC Pomerol (Burdeos)",
    "town": "Pomerol",
    "web": "https://www.petrus.com/",
    "address": "3 route de Lussac, 33500 Pomerol",
    "lat": 44.9307,
    "lng": -0.1928,
    "precision": "bodega",
    "founded": "siglo XVIII",
    "about": "Finca de 11,4 hectáreas en Pomerol, junto al límite con Saint-Émilion, que elabora un único tinto casi solo de merlot y ningún segundo vino. Pertenece a Jean-François Moueix.",
    "wines": [
      "Petrus"
    ],
    "file": "bodega-petrus.jpg",
    "sources": [
      "https://fr.wikipedia.org/wiki/Petrus_(vin)",
      "https://cheval-et-vigne.fr/chateaux/chateaux-de-la-rive-droite/petrus/",
      "https://en.wikipedia.org/wiki/Ch%C3%A2teau_P%C3%A9trus"
    ]
  },
  {
    "id": "mouton",
    "name": "Château Mouton Rothschild",
    "aliases": [
      "Mouton Rothschild",
      "Mouton"
    ],
    "country": "Francia",
    "zone": "Médoc",
    "zoneText": "AOC Pauillac (Burdeos)",
    "town": "Pauillac",
    "web": "https://www.chateau-mouton-rothschild.com/",
    "address": "Rue de Grassi, 33250 Pauillac",
    "lat": 45.2153,
    "lng": -0.7684,
    "precision": "bodega",
    "founded": 1853,
    "about": "Finca de Pauillac que Nathaniel de Rothschild compró y rebautizó en 1853. Es el único vino que ha cambiado de categoría en la clasificación de 1855: pasó a primer gran cru en 1973.",
    "wines": [
      "Château Mouton Rothschild",
      "Le Petit Mouton",
      "Aile d'Argent"
    ],
    "file": "bodega-chateau-mouton-rothschild.jpg",
    "sources": [
      "https://www.chateau-mouton-rothschild.com/",
      "https://www.chateau-mouton-rothschild.com/legal",
      "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Mouton_Rothschild"
    ]
  },
  {
    "id": "romanee-conti",
    "name": "Domaine de la Romanée-Conti",
    "aliases": [
      "DRC",
      "Romanée-Conti",
      "Romanee-Conti"
    ],
    "country": "Francia",
    "zone": "Borgoña",
    "zoneText": "Borgoña · Côte de Nuits (Vosne-Romanée)",
    "town": "Vosne-Romanée",
    "web": "https://www.romanee-conti.fr/",
    "address": "1 rue Derrière le Four, 21700 Vosne-Romanée",
    "lat": 47.1617,
    "lng": 4.9497,
    "precision": "bodega",
    "founded": 1869,
    "about": "Una de las fincas más prestigiosas del mundo, con 25,5 hectáreas casi todas en Vosne-Romanée. Debe su nombre a su viña más célebre, la Romanée-Conti, de 1,8 hectáreas.",
    "wines": [
      "Romanée-Conti",
      "La Tâche",
      "Richebourg",
      "Montrachet"
    ],
    "file": "bodega-domaine-de-la-romanee-conti.jpg",
    "sources": [
      "https://www.romanee-conti.fr/fr/mentions",
      "https://www.hachette-vins.com/guide-vins/producteurs/23234/dom-de-la-romanee-conti-montrachet/",
      "https://fr.wikipedia.org/wiki/Domaine_de_la_Roman%C3%A9e-Conti",
      "https://en.wikipedia.org/wiki/Domaine_de_la_Roman%C3%A9e-Conti"
    ]
  },
  {
    "id": "schloss-johannisberg",
    "name": "Schloss Johannisberg",
    "aliases": [
      "Fürst von Metternich-Winneburg'sche Domäne Schloss Johannisberg"
    ],
    "country": "Alemania",
    "zone": "Rheingau",
    "zoneText": "Rheingau",
    "town": "Geisenheim-Johannisberg",
    "web": "https://schloss-johannisberg.de/",
    "address": "Schloss Johannisberg, 65366 Geisenheim-Johannisberg",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1720,
    "about": "Antigua abadía benedictina (h. 1100) del Rheingau. Desde 1720 toda la finca está plantada de riesling: se presenta como el primer viñedo cerrado de riesling del mundo y la cuna de la Spätlese. 47,9 ha en la Grosse Lage Schloss Johannisberg (VDP).",
    "wines": [
      "Schloss Johannisberg Riesling"
    ],
    "file": "bodega-schloss-johannisberg.jpg",
    "sources": [
      "https://schloss-johannisberg.de/",
      "https://schloss-johannisberg.de/kontakt/",
      "https://schloss-johannisberg.de/historie/",
      "https://www.vdp.de/de/die-winzer/rheingau/schloss-johannisberg"
    ]
  },
  {
    "id": "kuhling-gillot",
    "name": "Kühling-Gillot",
    "aliases": [
      "Weingut Kühling-Gillot",
      "Kühling & Battenfeld"
    ],
    "country": "Alemania",
    "zone": "",
    "zoneText": "Rheinhessen",
    "town": "Bodenheim",
    "web": "https://www.kuehling-gillot.de/",
    "address": "Ölmühlstraße 25, 55294 Bodenheim",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": null,
    "about": "Bodega familiar de Bodenheim dirigida desde 2006 por Carolin Spanier-Gillot, con viñas en el Roter Hang (Nierstein/Nackenheim); trabaja en biodinámica junto a Battenfeld-Spanier, con quien vinifica en Hohen-Sülzen.",
    "wines": [
      "Riesling GG Pettenthal",
      "Riesling GG Hipping",
      "Riesling GG Ölberg",
      "Riesling GG Rothenberg"
    ],
    "file": "bodega-kuhling-gillot.jpg",
    "sources": [
      "https://www.weinkenner.de/weingueter/weingut-kuehling-gillot/",
      "https://www.rheinhessen.de/en/search-producers/a-winery-carolin-spanier-gillot-amp-ho-spanier",
      "https://www.feinschmecker.de/weingut/de/bodenheim/k%C3%BChling-gillot-7a"
    ]
  },
  {
    "id": "cartuxa",
    "name": "Adega Cartuxa",
    "aliases": [
      "Cartuxa",
      "Fundação Eugénio de Almeida",
      "Quinta de Valbom"
    ],
    "country": "Portugal",
    "zone": "Alentejo",
    "zoneText": "DOC Alentejo (Évora)",
    "town": "Évora",
    "web": "https://www.cartuxa.pt/",
    "address": "Quinta de Valbom, Estrada da Soeira, 7005-003 Évora",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1871,
    "about": "Antigua casa de reposo de los jesuitas de la Universidad de Évora (1580), con lagar desde 1776; la familia Eugénio de Almeida la compró en 1871. Hoy es de la Fundação Eugénio de Almeida, con más de 600 ha de viñedo.",
    "wines": [
      "Pêra-Manca tinto",
      "Pêra-Manca branco",
      "Cartuxa",
      "Scala Coeli",
      "EA"
    ],
    "file": "bodega-cartuxa.jpg",
    "sources": [
      "https://www.cartuxa.pt/",
      "https://www.cartuxa.pt/adega/"
    ]
  },
  {
    "id": "fitapreta",
    "name": "Fitapreta",
    "aliases": [
      "Fita Preta Vinhos",
      "Herdade Fitapreta"
    ],
    "country": "Portugal",
    "zone": "Alentejo",
    "zoneText": "DOC Alentejo",
    "town": "Évora (Paço do Morgado de Oliveira)",
    "web": "https://www.antoniomacanita.com/en/wineries/fitapreta/fitapreta",
    "address": "",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 2004,
    "about": "Proyecto fundado en 2004 por António Maçanita y David Booth. La bodega está en el Paço do Morgado de Oliveira, un edificio medieval de 1306 a unos 10 km de Évora.",
    "wines": [
      "Preta"
    ],
    "file": "bodega-fitapreta.jpg",
    "sources": [
      "https://www.antoniomacanita.com/en/wineries/fitapreta/fitapreta",
      "https://www.antoniomacanita.com/en/wineries/fitapreta/team",
      "https://www.antoniomacanita.com/uploads/subcanais2_conteudos_ficheiros/book-fitapreta-2026-pt.pdf"
    ]
  },
  {
    "id": "vila-gale",
    "name": "Vila Galé (Casa de Santa Vitória)",
    "aliases": [
      "Casa de Santa Vitória",
      "Santa Vitória",
      "Vila Galé Alentejo Vineyards"
    ],
    "country": "Portugal",
    "zone": "Alentejo",
    "zoneText": "Alentejo",
    "town": "Santa Vitória (Beja)",
    "web": "https://www.santavitoria.pt/",
    "address": "Herdade da Malhada, 7800-730 Santa Vitória (Beja)",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": null,
    "about": "Bodega del grupo Vila Galé en el Alentejo, con vinos y aceites Santa Vitória y el hotel Vila Galé Alentejo Vineyards en la finca.",
    "wines": [],
    "file": "bodega-vila-gale.jpg",
    "sources": [
      "https://www.santavitoria.pt/",
      "https://www.santavitoria.pt/pages/contact",
      "https://vilagale.com/en/hotels/alentejo/vila-gale-alentejo-vineyards"
    ]
  },
  {
    "id": "casa-ferreirinha",
    "name": "Casa Ferreirinha",
    "aliases": [
      "A.A. Ferreira",
      "Ferreira",
      "Sogrape"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro",
    "town": "Vila Nova de Gaia (caves)",
    "web": "https://sogrape.com/pt/brand/casa-ferreirinha",
    "address": "Avenida Ramos Pinto, 70, 4400-082 Vila Nova de Gaia (Caves Ferreira)",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1751,
    "about": "Casa del Douro ligada a la familia Ferreira (1751) y a Dona Antónia Adelaide Ferreira, «a Ferreirinha». Hoy pertenece a Sogrape; en 1952 nació aquí el Barca Velha, y la Quinta da Leda (1979) es su finca clave en el Douro Superior.",
    "wines": [
      "Barca Velha"
    ],
    "file": "bodega-casa-ferreirinha.jpg",
    "sources": [
      "https://sogrape.com/pt/brand/casa-ferreirinha",
      "https://sogrape.com/tourism/caves-ferreira",
      "https://portoferreira.com/en/dona-antonia",
      "https://www.sograpevinhos.com/app/templates/media/kits_imprensa/casa-ferreirinha_press.pdf"
    ]
  },
  {
    "id": "churchills",
    "name": "Churchill's",
    "aliases": [
      "Churchill Graham",
      "Quinta da Gricha"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Vila Nova de Gaia",
    "web": "https://drinkchurchills.com/",
    "address": "Rua da Fonte Nova, 5, 4400-156 Vila Nova de Gaia",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1981,
    "about": "Casa de oporto fundada en 1981 por John Graham. Su finca en el Douro es la Quinta da Gricha (Ervedosa do Douro) y su lodge está en Vila Nova de Gaia.",
    "wines": [],
    "file": "bodega-churchills.jpg",
    "sources": [
      "https://drinkchurchills.com/",
      "https://drinkchurchills.com/products/tasting-at-churchills-lodge",
      "https://drinkchurchills.com/pages/our-story",
      "https://porttoportwine.blogspot.com/2019/05/churchills-and-quinta-da-gricha.html"
    ]
  },
  {
    "id": "niepoort",
    "name": "Niepoort",
    "aliases": [
      "Niepoort Vinhos",
      "Quinta de Nápoles"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Santo Adrião (Armamar)",
    "web": "https://www.niepoort.pt/",
    "address": "Quinta de Nápoles, 5110-543 Santo Adrião, Armamar",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1842,
    "about": "Casa familiar de vinos de Oporto fundada en 1842. Su bodega en el Douro es la Quinta de Nápoles, en Santo Adrião (Armamar).",
    "wines": [],
    "file": "bodega-niepoort.jpg",
    "sources": [
      "https://www.niepoort.pt/",
      "https://www.niepoort.pt/lugares/napoles/"
    ]
  },
  {
    "id": "pocas",
    "name": "Poças",
    "aliases": [
      "Poças Júnior"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Vila Nova de Gaia",
    "web": "https://www.pocas.pt/",
    "address": "Rua Visconde das Devesas, 186, 4400-337 Vila Nova de Gaia",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1918,
    "about": "Productor independiente de vinos de Oporto y DOC Douro, fundado en 1918 por Manoel Domingues Poças Júnior; sus caves y centro de visitas están en Vila Nova de Gaia (Rua Visconde das Devesas, 168).",
    "wines": [],
    "file": "bodega-pocas.jpg",
    "sources": [
      "https://www.pocas.pt/",
      "https://www.pocas.pt/pages/contact-us",
      "https://www.pocas.pt/en/pages/faq"
    ]
  },
  {
    "id": "quinta-do-bomfim",
    "name": "Quinta do Bomfim (Symington Family Estates)",
    "aliases": [
      "Symington",
      "Dow's",
      "Quinta do Bomfim"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Pinhão (Alijó)",
    "web": "https://www.symington.com/",
    "address": "Quinta do Bomfim, 5085-060 Pinhão",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1896,
    "about": "Quinta de Symington Family Estates en Pinhão, comprada en 1896 por George Warre para Dow's; su bodega de 1896 sigue en uso y desde 2015 tiene centro de visitas.",
    "wines": [],
    "file": "bodega-quinta-do-bomfim.jpg",
    "sources": [
      "https://www.symington.com/",
      "https://www.symington.com/visit.php",
      "https://www.symington.com/vineyard/quinta-do-bomfim",
      "https://www.symington.com/winery/bomfim-winery"
    ]
  },
  {
    "id": "quinta-do-crasto",
    "name": "Quinta do Crasto",
    "aliases": [
      "Crasto"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Gouvinhas (Sabrosa)",
    "web": "https://www.quintadocrasto.wine/",
    "address": "Gouvinhas, 5060-063 Sabrosa",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": "documentada desde 1615",
    "about": "Quinta del Douro con historia documentada desde 1615; Constantino de Almeida la compró en 1918 y la familia Roquette la gestiona desde 1981.",
    "wines": [],
    "file": "bodega-quinta-do-crasto.jpg",
    "sources": [
      "https://www.quintadocrasto.wine/",
      "https://www.quintadocrasto.wine/historia/"
    ]
  },
  {
    "id": "quinta-do-pessegueiro",
    "name": "Quinta do Pessegueiro",
    "aliases": [
      "Zannier"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro",
    "town": "Ervedosa do Douro (São João da Pesqueira)",
    "web": "https://www.quintadopessegueiro.com/",
    "address": "5130-104 Ervedosa do Douro",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": null,
    "about": "Quinta del Douro en Ervedosa do Douro, propiedad del grupo de Roger Zannier.",
    "wines": [],
    "file": "bodega-quinta-do-pessegueiro.jpg",
    "sources": [
      "https://www.quintadopessegueiro.com/",
      "https://dourowinetourism.com/pt/unidades-enoturismo/quinta-do-pessegueiro",
      "https://www.zannier.com/en/contact-us/"
    ]
  },
  {
    "id": "quinta-vale-d-maria",
    "name": "Quinta Vale D. Maria",
    "aliases": [
      "Vale Dona Maria",
      "Van Zellers & Co"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Sarzedinho (São João da Pesqueira)",
    "web": "https://quintavaledonamaria.com/",
    "address": "EM502, 5130-141 Ervedosa do Douro (Sarzedinho)",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": null,
    "about": "Quinta del valle del río Torto que Cristiano van Zeller compró en 1996; desde 2017 pertenece a Aveleda.",
    "wines": [],
    "file": "bodega-quinta-vale-d-maria.jpg",
    "sources": [
      "https://quintavaledonamaria.com/",
      "https://www.winesofportugal.com/en/discover/wine-tourism/quinta-vale-d-maria/",
      "https://quintavaledonamaria.com/sobre-nos/"
    ]
  },
  {
    "id": "taylors",
    "name": "Taylor's",
    "aliases": [
      "Taylor Fladgate",
      "Taylor's Port"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Vila Nova de Gaia",
    "web": "https://www.taylor.pt/",
    "address": "Rua do Choupelo, 250, 4400-088 Vila Nova de Gaia",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1692,
    "about": "Casa de vinos de Oporto fundada en 1692 por Job Bearsley. Desde 1893 es dueña de la Quinta de Vargellas, en el Douro Superior; sus caves están en Vila Nova de Gaia.",
    "wines": [],
    "file": "bodega-taylors.jpg",
    "sources": [
      "https://www.taylor.pt/",
      "https://www.taylor.pt/pt/contactos",
      "https://www.taylor.pt/en/about/our-history"
    ]
  },
  {
    "id": "wine-and-soul",
    "name": "Wine & Soul",
    "aliases": [
      "Wine&Soul",
      "Vine & Soul",
      "Quinta da Manoella"
    ],
    "country": "Portugal",
    "zone": "Douro",
    "zoneText": "DOC Douro / Porto",
    "town": "Valle del Pinhão",
    "web": "https://wineandsoul.com/",
    "address": "",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 2001,
    "about": "Fundada en 2001 por Sandra Tavares da Silva y Jorge Serôdio Borges en el valle del Pinhão, en un antiguo almacén de oporto con la viña Pintas. En 2009 compraron la Quinta da Manoella, con viñas que se remontan a 1838.",
    "wines": [
      "Pintas",
      "Quinta da Manoella"
    ],
    "file": "bodega-wine-and-soul.jpg",
    "sources": [
      "https://wineandsoul.com/",
      "https://wineandsoul.com/about-us/"
    ]
  },
  {
    "id": "casa-santos-lima",
    "name": "Casa Santos Lima",
    "aliases": [
      "Quinta da Boavista"
    ],
    "country": "Portugal",
    "zone": "Lisboa",
    "zoneText": "Lisboa (Alenquer)",
    "town": "Alenquer (Aldeia Galega da Merceana)",
    "web": "https://www.casasantoslima.com/",
    "address": "Quinta da Boavista, Aldeia Galega da Merceana, 2580-081 Alenquer",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": "finales del s. XIX (relanzada en 1990)",
    "about": "Empresa familiar productora y exportadora con sede en la Quinta da Boavista (Alenquer). Sus orígenes se remontan a Joaquim Santos Lima a finales del siglo XIX; José Luís Santos Lima Oliveira da Silva la relanzó en 1990.",
    "wines": [],
    "file": "bodega-casa-santos-lima.jpg",
    "sources": [
      "https://www.casasantoslima.com/",
      "https://www.casasantoslima.com/pt/contactos/",
      "https://www.casasantoslima.com/en/casa-santos-lima/our-history/",
      "https://casasantoslima.com/pt/casa-santos-lima/quem-somos/"
    ]
  },
  {
    "id": "madeira-wine-company",
    "name": "Madeira Wine Company",
    "aliases": [
      "Blandy's",
      "Madeira Wine Association"
    ],
    "country": "Portugal",
    "zone": "Madeira",
    "zoneText": "DOP Madeira",
    "town": "Funchal",
    "web": "https://www.madeirawinecompany.com/",
    "address": "Avenida Arriaga, 28, 9000-064 Funchal (Blandy's Wine Lodge)",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1913,
    "about": "Fundada en 1913 como Madeira Wine Association, a la que se unió Blandy's en 1925. Su Blandy's Wine Lodge, en el centro de Funchal, es la bodega de visita.",
    "wines": [
      "Blandy's"
    ],
    "file": "bodega-madeira-wine-company.jpg",
    "sources": [
      "https://www.madeirawinecompany.com/",
      "https://blandys.com/en/contact-us/",
      "https://madeirawinecompany.com/en/about-us/our-history.html"
    ]
  },
  {
    "id": "ermelinda-freitas",
    "name": "Casa Ermelinda Freitas",
    "aliases": [
      "Ermelinda Freitas"
    ],
    "country": "Portugal",
    "zone": "Setúbal",
    "zoneText": "Península de Setúbal",
    "town": "Palmela (Fernando Pó)",
    "web": "https://www.ermelindafreitas.pt/",
    "address": "Rua Manuel João de Freitas, Fernando Pó, 2965-595 Águas de Moura (Palmela)",
    "lat": 38.5772,
    "lng": -8.8733,
    "precision": "bodega",
    "founded": 1920,
    "about": "Empresa familiar de Fernando Pó fundada en 1920 por Leonilde Freitas y dirigida por cuatro generaciones de mujeres; hoy la lleva Leonor Freitas, con 550 ha de viña en la península de Setúbal.",
    "wines": [],
    "file": "bodega-ermelinda-freitas.jpg",
    "sources": [
      "https://www.ermelindafreitas.pt/",
      "https://redepatrimoniofids.amrs.pt/adega-ermelinda-freitas/",
      "https://www.cmjornal.pt/c-studio/detalhe/casa-ermelinda-freitas-100-anos-de-vinhas-e-vinho"
    ]
  },
  {
    "id": "aveleda",
    "name": "Aveleda",
    "aliases": [
      "Quinta da Aveleda"
    ],
    "country": "Portugal",
    "zone": "Vinho Verde",
    "zoneText": "Vinho Verde",
    "town": "Penafiel",
    "web": "https://www.aveleda.com/",
    "address": "Rua da Aveleda, 2, 4560-570 Penafiel",
    "lat": null,
    "lng": null,
    "precision": "",
    "founded": 1870,
    "about": "Empresa familiar fundada en 1870 por Manoel Pedro Guedes en la Quinta da Aveleda, en los Vinhos Verdes. Hoy, con la quinta generación, produce también en Douro, Bairrada, Lisboa y Algarve; su marca principal es Casal Garcia.",
    "wines": [
      "Casal Garcia"
    ],
    "file": "bodega-aveleda.jpg",
    "sources": [
      "https://www.aveleda.com/",
      "https://www.company.aveleda.com/pt/contactos",
      "https://www.company.aveleda.com/pt/empresa",
      "https://company.aveleda.com/pt"
    ]
  }
];

WINERY_CARDS.forEach(function (card) {
  WINERY_PLACES.push({
    name: card.name,
    aliases: card.aliases || [],
    lat: card.lat,
    lng: card.lng,
    zone: [card.town, card.zone].filter(Boolean).join(" · "),
    address: card.address || "",
    web: card.web || "",
    precision: card.precision || ""
  });
});

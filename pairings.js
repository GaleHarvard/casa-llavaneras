window.PAIRING_DISHES = [
  { id: "cordero", name: "Cordero y lechazo", icon: "🍖", family: "Carnes", heat: "asado / parrilla", tags: ["graso", "asado", "umami"] },
  { id: "caza", name: "Caza", icon: "🦌", family: "Carnes", heat: "guiso / asado", tags: ["intenso", "salvaje", "umami"] },
  { id: "buey", name: "Buey, chuletón, solomillo", icon: "🥩", family: "Carnes", heat: "parrilla", tags: ["graso", "a la brasa", "proteína"] },
  { id: "aves", name: "Aves y pichón", icon: "🍗", family: "Carnes", heat: "asado", tags: ["fino", "asado"] },
  { id: "cerdo", name: "Ibérico y embutido", icon: "🥓", family: "Cured", heat: "frío / plancha", tags: ["salado", "graso", "curado"] },
  { id: "estofado", name: "Estofados y carrillera", icon: "🍲", family: "Carnes", heat: "lento", tags: ["salsa", "colágeno", "umami"] },
  { id: "marisco", name: "Marisco y ostras", icon: "🦪", family: "Mar", heat: "crudo / vapor", tags: ["yodo", "salino", "delicado"] },
  { id: "pescado-blanco", name: "Pescado blanco", icon: "🐟", family: "Mar", heat: "plancha / horno", tags: ["suave", "graso-bajo"] },
  { id: "pescado-graso", name: "Pescado azul", icon: "🐟", family: "Mar", heat: "plancha", tags: ["graso", "intenso"] },
  { id: "arroz", name: "Arroces y risotto", icon: "🍚", family: "Cereal", heat: "caldo", tags: ["almidón", "umami"] },
  { id: "pasta", name: "Pasta", icon: "🍝", family: "Cereal", heat: "salsa", tags: ["almidón"] },
  { id: "setas", name: "Setas y bosque", icon: "🍄", family: "Vegetal", heat: "salteado", tags: ["umami", "tierra"] },
  { id: "ensalada", name: "Ensaladas y crudos", icon: "🥗", family: "Vegetal", heat: "frío", tags: ["ácido", "verde"] },
  { id: "queso-tierno", name: "Queso tierno / pasta blanda", icon: "🧀", family: "Queso", heat: "frío", tags: ["láctico", "crema"] },
  { id: "queso-curado", name: "Queso curado y viejo", icon: "🧀", family: "Queso", heat: "frío", tags: ["salado", "umami", "graso"] },
  { id: "legumbres", name: "Legumbres", icon: "🫘", family: "Vegetal", heat: "guiso", tags: ["tierra", "umami"] },
  { id: "chocolate", name: "Chocolate negro", icon: "🍫", family: "Postre", heat: "frío", tags: ["amargo", "cacao"] },
  { id: "sashimi", name: "Sashimi y crudo fino", icon: "🍣", family: "Mar", heat: "crudo", tags: ["yodo", "grasa-fina"] }
];

window.WINE_PAIRINGS = {
  "vs-unico-2009": {
    logic: "Único 2009 ya en meseta: tanino noble y acidez viva. Pide proteína asada y grasa de cordero.",
    serve: "16–18 °C. Decantar 90 min. Copa borgoña ancha.",
    avoid: ["Picante intenso", "Vinagretas fuertes", "Pescado delicado", "Postres dulces"],
    matches: [
      { dishId: "cordero", score: 98, why: "La grasa del lechazo envuelve el tanino; el cedro dialoga con la piel asada." },
      { dishId: "caza", score: 96, why: "Caza menor refuerza los terciarios de bosque y cacao." },
      { dishId: "aves", score: 94, why: "Pichón o pato asado: proteína fina para no aplastar la elegancia." },
      { dishId: "queso-curado", score: 90, why: "Oveja vieja. Sal contra la persistencia del vino." },
      { dishId: "setas", score: 88, why: "Boletus a la plancha: umami de sotobosque." }
    ]
  },
  "vs-unico-2014": {
    logic: "Tinto de guarda, tanino noble y acidez viva. Pide proteína asada, grasa de cordero y umami de asado; el tanino limpia la boca.",
    serve: "16–18 °C. Decantar 90–120 min. Copa borgoña ancha.",
    avoid: ["Picante intenso", "Vinagretas fuertes", "Pescado delicado", "Postres dulces"],
    matches: [
      { dishId: "cordero", score: 98, why: "La grasa del lechazo envuelve el tanino; el regaliz y el cedro dialogan con la piel asada." },
      { dishId: "caza", score: 96, why: "Caza menor (perdiz, becada) refuerza los terciarios de bosque y cacao." },
      { dishId: "aves", score: 94, why: "Pichón o pato asado: proteína fina para no aplastar la elegancia de Único." },
      { dishId: "queso-curado", score: 90, why: "Oveja vieja. Sal y cristal de tirosina contra la persistencia del vino." },
      { dishId: "setas", score: 88, why: "Boletus a la plancha o revuelto: umami de sotobosque." }
    ]
  },
  "pingus-2018": {
    logic: "Densidad extrema con textura sedosa. Mejor con piezas nobles, no con salsas dulces ni picantes.",
    serve: "16–18 °C. Decantar 2 h. Poca cantidad por copa.",
    avoid: ["Barbacoa ahumada en exceso", "Quesos azules muy salados", "Platos muy picantes"],
    matches: [
      { dishId: "buey", score: 98, why: "Solomillo o buey madurado: grasa intramuscular iguala la concentración." },
      { dishId: "caza", score: 97, why: "Perdiz estofada o ciervo: el salvaje sostiene el grafito de Pingus." },
      { dishId: "cordero", score: 95, why: "Carré o paletilla asada, sin salsa de fruta." },
      { dishId: "queso-curado", score: 90, why: "Idiazábal añejo o parmesano 36 meses." }
    ]
  },
  "tondonia-reserva-2011": {
    logic: "Rioja clásico: acidez, cuero fino y naranja confitada. Encaja con asados de cordero, bacalao y setas, no con platos pesados de Toro.",
    serve: "16–17 °C. Decantar 30–45 min si está cerrado.",
    avoid: ["Barbacoa de costilla agridulce", "Curry", "Chocolate"],
    matches: [
      { dishId: "cordero", score: 97, why: "Maridaje clásico que realza la estructura y complejidad del reserva." },
      { dishId: "setas", score: 94, why: "Níscalos o setas de cardo; el terciario de té y cedro encaja." },
      { dishId: "pescado-graso", score: 90, why: "Bacalao a la riojana: tomate, pimiento y acidez del vino." },
      { dishId: "estofado", score: 89, why: "Callos o rabo con poco pimentón dulce." },
      { dishId: "queso-curado", score: 88, why: "Manchego curado, no muy picante." }
    ]
  },
  "riscal-reserva-2019": {
    logic: "Reserva cotidiano, cuerpo medio, balsámico. Mesa de diario: chuletillas, embutido, arroz de carne.",
    serve: "16–17 °C. Decantar 20 min o abrir al servir.",
    avoid: ["Marisco fino", "Postre"],
    matches: [
      { dishId: "cordero", score: 92, why: "Chuletillas al sarmiento: el ahumado de parrilla con el roble del reserva." },
      { dishId: "cerdo", score: 91, why: "Chorizo, lomo ibérico, jamón de cebo. Sal y grasa contra tanino medio." },
      { dishId: "arroz", score: 88, why: "Arroz de pichón o de costilla." },
      { dishId: "estofado", score: 86, why: "Guisos de diario sin chocolate en la salsa." }
    ]
  },
  "lermita-2019": {
    logic: "Garnacha de ladera: frescura, flor y pizarra. Mejor con cabrito, arroz de montaña y cabra que con chuletón enorme.",
    serve: "16–18 °C. Decantar 60 min.",
    avoid: ["Salsas de nata", "Pescado crudo"],
    matches: [
      { dishId: "cordero", score: 96, why: "Cabrito al horno: la pizarra corta la grasa y la flor de jara huele a monte." },
      { dishId: "arroz", score: 93, why: "Arroz de montaña o de conejo con romero." },
      { dishId: "queso-curado", score: 90, why: "Cabra curada del Priorat o Garrotxa." },
      { dishId: "setas", score: 89, why: "Rovellons a la llauna." },
      { dishId: "aves", score: 88, why: "Pichón con reducción ligera, sin dulzor." }
    ]
  },
  "pazo-senorans-2023": {
    logic: "Albariño atlántico: acidez, pomelo y sal. El yodo del marisco es su terreno. No lo mates con salsas de mantequilla pesada.",
    serve: "8–10 °C. No helar: pierde flor.",
    avoid: ["Carnes rojas", "Salsas de tomate asado", "Quesos muy viejos"],
    matches: [
      { dishId: "marisco", score: 99, why: "Ostra, navaja, nécora, percebe: sal contra sal, acidez contra yodo." },
      { dishId: "pescado-blanco", score: 96, why: "Rodaballo o lubina a la plancha, apenas un hilo de aceite." },
      { dishId: "sashimi", score: 92, why: "Pescado blanco crudo; la acidez hace de limón." },
      { dishId: "ensalada", score: 86, why: "Ensalada de marisco o tomate aliñado con poco vinagre." },
      { dishId: "queso-tierno", score: 84, why: "Tetilla, queso fresco de cabra." }
    ]
  },
  "cvne-monopole-2022": {
    logic: "Viura de guarda, velo y almendra. Pescado con salsa, pollo asado, cocina de cuchara blanca.",
    serve: "10–12 °C.",
    avoid: ["Ostras muy frías (mejor albariño)", "Carnes de caza mayor"],
    matches: [
      { dishId: "pescado-blanco", score: 95, why: "Merluza en salsa verde: la crianza aguanta el perejil y el ajo." },
      { dishId: "aves", score: 92, why: "Pollo asado o capón, piel crujiente." },
      { dishId: "queso-tierno", score: 88, why: "Idiazábal tierno o tetilla." },
      { dishId: "arroz", score: 87, why: "Arroz caldoso de rape o verduras." },
      { dishId: "setas", score: 85, why: "Revuelto de perretxikos." }
    ]
  },
  "gramona-iii-lustros-2016": {
    logic: "Espumoso de larga crianza: brioche y burbuja extrafina. Marisco, arroces y quesos blandos; también mesa completa si no hay guiso de caza.",
    serve: "8–10 °C. Copa de vino blanco, no flauta estrecha.",
    avoid: ["Chocolate con leche", "Platos muy picantes"],
    matches: [
      { dishId: "marisco", score: 96, why: "La burbuja desengrasa el marisco y el brioche sostiene el coral." },
      { dishId: "arroz", score: 94, why: "Arroz meloso de bogavante o senyoret." },
      { dishId: "queso-tierno", score: 90, why: "Brie, sainte-maure, tetilla." },
      { dishId: "pescado-blanco", score: 88, why: "Lubina al horno con hinojo." },
      { dishId: "sashimi", score: 86, why: "La acidez y el CO2 limpian la grasa del crudo." }
    ]
  },
  "dom-perignon-2015": {
    logic: "Champagne de tensión y yeso. Crudo fino, ostras y vieiras. No lo gastes con un guiso de rabo.",
    serve: "8–10 °C. Copa tulipa o borgoña pequeña.",
    avoid: ["Cordero", "Salsas oscuras", "Postre de chocolate"],
    matches: [
      { dishId: "marisco", score: 99, why: "Ostra y DP: tiza contra concha, cítrico contra yodo." },
      { dishId: "sashimi", score: 97, why: "Pescado graso fino (hamachi) o vieira cruda." },
      { dishId: "pescado-blanco", score: 93, why: "Rodaballo al vapor o turbot." },
      { dishId: "queso-tierno", score: 88, why: "Chaource o comté joven, no azul." }
    ]
  },
  "margaux-2016": {
    logic: "Premier cru perfumado y sedoso. Cordero de Pauillac, pichón, solomillo. La 2016 aún pide decantación larga.",
    serve: "16–18 °C. Decantar 2–3 h si se abre ahora.",
    avoid: ["Picante", "Vinagreta", "Queso azul potente"],
    matches: [
      { dishId: "cordero", score: 99, why: "El maridaje histórico de Médoc: costillar o paletilla, hierbas, jugo reducido." },
      { dishId: "aves", score: 96, why: "Pichón o canard au poivre vert, sin naranja dulce." },
      { dishId: "buey", score: 94, why: "Solomillo, no chuletón gigante que tape el perfume." },
      { dishId: "queso-curado", score: 88, why: "Comté 24 meses o oveja suave." }
    ]
  },
  "sassicaia-2019": {
    logic: "Cabernet marino de Bolgheri. Bistecca, jabalí, pecorino. El eucalipto pide hierba y parrilla.",
    serve: "16–18 °C. Decantar 60–90 min.",
    avoid: ["Pescado blanco", "Postres"],
    matches: [
      { dishId: "buey", score: 97, why: "Bistecca alla fiorentina: grasa de raza y cabernet se entienden." },
      { dishId: "caza", score: 94, why: "Jabalí in umido o cinghiale." },
      { dishId: "queso-curado", score: 91, why: "Pecorino toscano stagionato." },
      { dishId: "pasta", score: 86, why: "Pappardelle al cinghiale." },
      { dishId: "cordero", score: 88, why: "Costillar con romero." }
    ]
  },
  "grange-2018": {
    logic: "Shiraz de guarda, cacao y mora. Carnes a la brasa, caza mayor y, al final, un cuadrado de chocolate 70 %.",
    serve: "16–18 °C. Decantar 90 min.",
    avoid: ["Marisco", "Platos ácidos de vinagre"],
    matches: [
      { dishId: "buey", score: 96, why: "Costillar o ribeye a la brasa; el humo con el roble americano." },
      { dishId: "caza", score: 95, why: "Caza mayor: ciervo, canguro en clave australiana, jabalí." },
      { dishId: "chocolate", score: 90, why: "Cacao del vino y cacao del postre, amargos ambos. Poco azúcar." },
      { dishId: "estofado", score: 88, why: "Estofado oscuro sin naranja confitada." }
    ]
  },
  "vega-valbuena-2019": {
    logic: "Hermano menor de Único: misma estirpe, más accesible. Lechazo, setas, carrillera.",
    serve: "16–18 °C. Decantar 60 min.",
    avoid: ["Pescado crudo", "Picante"],
    matches: [
      { dishId: "cordero", score: 96, why: "Lechazo asado: el tanino de Valbuena limpia la grasa de la pieza." },
      { dishId: "setas", score: 92, why: "Setas de cardo o boletus con ajo." },
      { dishId: "estofado", score: 91, why: "Carrillera al vino tinto, reducción corta." },
      { dishId: "aves", score: 88, why: "Pato asado." }
    ]
  },
  "muga-prado-enea-2015": {
    logic: "Gran reserva de Rioja Alta: guinda, tabaco, clavo. Mesa de fiesta: cordero, callos, manchego viejo.",
    serve: "16–18 °C. Decantar 45 min.",
    avoid: ["Sushi", "Ensalada de vinagre"],
    matches: [
      { dishId: "cordero", score: 97, why: "Cordero al horno y gran reserva: el clavo del vino con el jugo de asado." },
      { dishId: "estofado", score: 93, why: "Callos a la madrileña o riojana." },
      { dishId: "queso-curado", score: 92, why: "Manchego viejo." },
      { dishId: "cerdo", score: 86, why: "Jamón de bellota, loncha gruesa." }
    ]
  },
  "scala-dei-prior-2020": {
    logic: "Priorat ágil, tomillo y pizarra. Estofados de diario, arroz de carne, embutido de payés.",
    serve: "15–17 °C.",
    avoid: ["Ostras", "Postre lácteo"],
    matches: [
      { dishId: "estofado", score: 93, why: "Estofado de ternera o conejo al romero." },
      { dishId: "arroz", score: 91, why: "Arroz de costilla o de montaña." },
      { dishId: "cerdo", score: 88, why: "Embutido de payés, butifarra a la brasa." },
      { dishId: "legumbres", score: 85, why: "Alubias con butifarra." }
    ]
  },
  "enrique-mendoza-chardonnay-2022": {
    logic: "Chardonnay de barrica mediterráneo: piña asada y avellana. Pescado graso, aves, risotto.",
    serve: "10–12 °C.",
    avoid: ["Ostra fría (demasiada madera)", "Carnes de caza mayor"],
    matches: [
      { dishId: "pescado-graso", score: 94, why: "Atún o salmón a la plancha; la barrica aguanta la grasa." },
      { dishId: "aves", score: 92, why: "Pollo asado o capón con jugo." },
      { dishId: "arroz", score: 90, why: "Risotto de setas o de azafrán." },
      { dishId: "pasta", score: 86, why: "Pasta con nata suave o carbonara ligera." }
    ]
  },
  "numanthia-2018": {
    logic: "Tinta de Toro, tanino firme y 15 %. Chuletón, caza y legumbres. Decantar siempre.",
    serve: "16–18 °C. Decantar 90 min.",
    avoid: ["Pescado", "Queso fresco", "Platos picantes dulces"],
    matches: [
      { dishId: "buey", score: 97, why: "Chuletón de vaca vieja: grasa y tanino de Toro se equilibran." },
      { dishId: "caza", score: 94, why: "Ciervo o jabalí." },
      { dishId: "legumbres", score: 90, why: "Alubias de La Bañeza, judiones, lentejas estofadas." },
      { dishId: "estofado", score: 89, why: "Estofado oscuro de ternera." }
    ]
  },
  "raidue-rose-2024": {
    logic: "Rosado seco de Rioja: fresa y sal. Ensaladas, plancha de pescado, arroz a banda. Beber joven.",
    serve: "8–10 °C.",
    avoid: ["Caza", "Chocolate", "Guisos de rabo"],
    matches: [
      { dishId: "ensalada", score: 94, why: "Ensalada de tomate, ventresca o pipirrana." },
      { dishId: "pescado-blanco", score: 92, why: "Pescado a la plancha, apenas aceite." },
      { dishId: "arroz", score: 90, why: "Arroz a banda o senyoret." },
      { dishId: "marisco", score: 86, why: "Gamba a la plancha, no ostra de lujo (mejor albariño o champagne)." }
    ]
  }
};

window.PAIRING_RULES = [
  { title: "Tanino pide grasa y proteína", text: "Un tinto estructurado (Toro, Ribera de guarda, Grange) limpia la boca si hay grasa intramuscular o piel asada. Sin grasa, el tanino amarga." },
  { title: "Acidez pide yodo o salsa", text: "Albariño, champagne y rioja clásico funcionan con marisco, tomate o vinagreta suave porque la acidez sustituye al limón." },
  { title: "Burbuja desengrasa", text: "Corpinnat y champagne cortan fritura, hojaldre y queso blando. Copa ancha, no flauta." },
  { title: "Madera pide cocina de horno", text: "Blancos con barrica (Monopole, Chardonnay) van a merluza en salsa, ave asada o risotto, no a ostra fría." },
  { title: "No cruce de mundos", text: "Icono de guarda no va con picante, curry ni postre dulce. Rosado y albariño no van con caza mayor." }
];

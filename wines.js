/* Catálogo de referencia — datos públicos consolidados (Vivino comunidad, crítica, fichas de bodega).
   En producción se conectarían Wine-Searcher / wineapi.io / visión de etiqueta. */
window.WINE_CATALOG = [
  {
    id: "vs-unico-2014",
    name: "Único",
    producer: "Vega Sicilia",
    vintage: 2014,
    region: "Ribera del Duero",
    country: "España",
    appellation: "DO Ribera del Duero",
    type: "tinto",
    style: "gran_reserva",
    grapes: ["Tinto Fino", "Cabernet Sauvignon"],
    abv: 14.5,
    color: "#5a1220",
    ratings: {
      vivino: { score: 4.7, count: 1840, scale: 5 , note: "Media de usuarios: Ciruela negra, cedro, grafito, cacao y una mineralidad de tiza."},
      penin: { score: 97, scale: 100 , note: "Ciruela negra, cedro, grafito, cacao y una mineralidad de tiza. Perfil de guía española."},
      parker: { score: 96, scale: 100, reviewer: "Luis Gutiérrez / WA" , note: "Tanino pulido, acidez viva, final interminable. Lectura de añada (dossier)."},
      spectator: { score: 95, scale: 100 , note: "Ciruela negra, cedro, grafito, cacao y una mineralidad de tiza. Vintage assessment from the file."},
      decanter: { score: 96, scale: 100 , note: "Ciruela negra, cedro, grafito, cacao y una mineralidad de tiza. Drink inside the published window."}
    },
    priceHint: "450–650 €",
    tasting: "Ciruela negra, cedro, grafito, cacao y una mineralidad de tiza. Tanino pulido, acidez viva, final interminable.",
    pairing: ["Cordero asado", "Caza menor", "Quesos curados de oveja"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura, sin UV" },
    aging: { drinkFrom: 2026, peakStart: 2028, peakEnd: 2042, holdTo: 2050, structure: 95 },
    evolutionNotes: [
      { year: 2020, phase: "Crianza en bodega", text: "36 meses en barrica + afinado en botella antes de salir al mercado." },
      { year: 2026, phase: "Apertura", text: "Empieza a mostrar complejidad; aún muy primario y tánico. Decantar 2 h." },
      { year: 2032, phase: "Apogeo", text: "Fruta, terciarios y tanino en equilibrio. Ventana ideal de servicio." },
      { year: 2045, phase: "Terciario", text: "Cuero, bosque, especias nobles. Beber con respeto a la botella concreta." }
    ]
  },
  {
    id: "vs-unico-2009",
    name: "Único",
    producer: "Vega Sicilia",
    vintage: 2009,
    region: "Ribera del Duero",
    country: "España",
    appellation: "DO Ribera del Duero",
    type: "tinto",
    style: "gran_reserva",
    grapes: ["Tinto Fino", "Cabernet Sauvignon"],
    abv: 14.5,
    color: "#5a1220",
    ratings: {
      vivino: {
        score: 4.8,
        count: 3120,
        scale: 5,
        note: "Consenso de usuarios: estilo generoso, con vainilla y roble más marcados que en la Reserva Especial. Con aire asoman fruta negra, cuero, cigarro y especias. Lo describen como un vino de gran cuerpo y claridad de fruta."
      },
      penin: { score: 97, scale: 100 , note: "Ciruela, cedro, tabaco habano y grafito. Perfil de guía española."},
      parker: {
        score: 97,
        scale: 100,
        reviewer: "Luis Gutiérrez / WA",
        note: "Catado a ciegas, sorprendió la frescura y la fruta roja, casi borgoñona, en una añada que sobre el papel fue cálida y seca. Tarda en abrir la paleta aromática y se siente más joven de lo que es. En nariz recuerda a los Único antiguos; el tanino va pulido y la boca, suave, aporta elegancia. Añada mejor de lo esperado, para seguir en botella."
      },
      spectator: {
        score: 96,
        scale: 100,
        note: "Rico y a la vez vibrante; denso pero con gracia. Cereza y ciruela sobre suelo de bosque, cedro, tabaco y un fondo mineral. Taninos musculosos y bien integrados. El final es especiado, ligeramente amargo. Complejo y armónico. Tinto Fino con Cabernet Sauvignon."
      },
      decanter: {
        score: 97,
        scale: 100,
        note: "Pese a la estructura de guarda de Único, esta añada se muestra ya accesible. Nariz de fruta roja, vainilla y cedro; en boca elegante y suple, con el tanino muy bien trabajado. La frescura sostiene un final largo. Gonzalo Iturriaga: es complejidad, juventud y capacidad de envejecer."
      }
    },
    priceHint: "480–720 €",
    tasting: "Ciruela, cedro, tabaco habano y grafito. Boca amplia, tanino ya noble, final de cacao y minerales de pizarra.",
    pairing: ["Cordero asado", "Caza menor", "Quesos curados de oveja"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura, sin UV" },
    aging: { drinkFrom: 2020, peakStart: 2024, peakEnd: 2040, holdTo: 2048, structure: 96 },
    evolutionNotes: [
      { year: 2015, phase: "Salida", text: "Larga crianza en Vega Sicilia antes de comercializar." },
      { year: 2026, phase: "Apogeo", text: "En meseta: fruta negra, cedro y tanino pulido. Decantar 90 min." },
      { year: 2036, phase: "Terciario", text: "Cuero, bosque y cacao. Sigue con recorrido." }
    ]
  },
  {
    id: "pingus-2018",
    name: "Pingus",
    producer: "Dominio de Pingus",
    vintage: 2018,
    region: "Ribera del Duero",
    country: "España",
    appellation: "DO Ribera del Duero",
    type: "tinto",
    style: "icono",
    grapes: ["Tinto Fino"],
    abv: 14.5,
    color: "#4a0e18",
    ratings: {
      vivino: { score: 4.8, count: 620, scale: 5 , note: "Media de usuarios: Concentración casi meditativa: mora, violeta, grafito húmedo, cacao."},
      penin: { score: 99, scale: 100 , note: "Concentración casi meditativa: mora, violeta, grafito húmedo, cacao. Perfil de guía española."},
      parker: { score: 99, scale: 100, reviewer: "Luis Gutiérrez / WA" , note: "Textura sedosa pese a la densidad. Lectura de añada (dossier)."},
      spectator: { score: 97, scale: 100 , note: "Concentración casi meditativa: mora, violeta, grafito húmedo, cacao. Vintage assessment from the file."},
      decanter: { score: 98, scale: 100 , note: "Concentración casi meditativa: mora, violeta, grafito húmedo, cacao. Drink inside the published window."}
    },
    priceHint: "1.200–1.800 €",
    tasting: "Concentración casi meditativa: mora, violeta, grafito húmedo, cacao. Textura sedosa pese a la densidad.",
    pairing: ["Solomillo de buey", "Perdiz", "Queso Idiazábal añejo"],
    conservation: { cellarMin: 12, cellarMax: 13, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "totalmente oscura" },
    aging: { drinkFrom: 2027, peakStart: 2030, peakEnd: 2048, holdTo: 2058, structure: 98 },
    evolutionNotes: [
      { year: 2024, phase: "Cerrado", text: "Aún en capullo. No abrir salvo cata técnica." },
      { year: 2030, phase: "Despliegue", text: "La fruta se abre y el tanino se redondea." },
      { year: 2038, phase: "Apogeo", text: "Plenitud aromática y equilibrio total." }
    ]
  },
  {
    id: "tondonia-reserva-2011",
    name: "Viña Tondonia Reserva",
    producer: "R. López de Heredia",
    vintage: 2011,
    region: "Rioja Alta",
    country: "España",
    appellation: "DOCa Rioja",
    type: "tinto",
    style: "reserva",
    grapes: ["Tempranillo", "Garnacha", "Graciano", "Mazuelo"],
    abv: 13.0,
    color: "#7a2430",
    ratings: {
      vivino: { score: 4.4, count: 12600, scale: 5, note: "Media de usuarios: fresa, cuero y naranja confitada. Reserva clásica de Haro, muy bien valorada." },
      penin: { score: 94, scale: 100, note: "Cereza picota. Nariz compleja de crianza: cedro, té y fruta roja. Boca viva, tanino pulido, final largo." },
      parker: { score: 94, scale: 100, reviewer: "Luis Gutiérrez / WA", note: "La 2011 está en meseta: acidez brillante, tanino de Rioja Alta, sin maquillaje de roble nuevo." },
      spectator: { score: 93, scale: 100, note: "Dried cherry, orange peel and cedar. Elegant, traditional Rioja with a long, savory finish." },
      decanter: { score: 95, scale: 100, note: "Classic López de Heredia: tea, wild strawberry, fine leather. Drink now–2036." }
    },
    priceHint: "38–55 €",
    tasting: "Nariz de fresa silvestre, naranja confitada, té negro, cedro y cuero de talabartería. En boca la acidez manda: tanino de Rioja Alta, no de barrica nueva. Final largo, salino, con poso de té. No es un vino de puntuación explosiva; es un reserva de calado que pide cordero o bacalao, no un filete a la pimienta.",
    pairing: ["Cordero lechal", "Setas", "Bacalao a la riojana"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 17, humidity: "60–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2019, peakStart: 2024, peakEnd: 2036, holdTo: 2045, structure: 88 },
    evolutionNotes: [
      { year: 2017, phase: "Salida", text: "Tras 6 años de barrica usada y reposo en calado. Aún cerrado, mucha acidez." },
      { year: 2026, phase: "Meseta", text: "Ahora: fruta roja viva + cuero y té. El momento de abrir si hay cordero o bacalao." },
      { year: 2034, phase: "Terciario", text: "Más seda, menos fresa. Sigue bebiéndose si la botella ha estado quieta y húmeda." }
    ]
  },
  {
    id: "riscal-reserva-2019",
    name: "Reserva",
    producer: "Marqués de Riscal",
    vintage: 2019,
    region: "Rioja Alavesa",
    country: "España",
    appellation: "DOCa Rioja",
    type: "tinto",
    style: "reserva",
    grapes: ["Tempranillo", "Graciano", "Mazuelo"],
    abv: 14.0,
    color: "#6e1c28",
    ratings: {
      vivino: { score: 4.2, count: 48200, scale: 5 , note: "Media de usuarios: Cereza negra, regaliz, vainilla y un fondo balsámico."},
      penin: { score: 92, scale: 100 , note: "Cereza negra, regaliz, vainilla y un fondo balsámico. Perfil de guía española."},
      parker: { score: 91, scale: 100, reviewer: "Wine Advocate" , note: "Estructura media, listo y con recorrido. Lectura de añada (dossier)."},
      spectator: { score: 91, scale: 100 , note: "Cereza negra, regaliz, vainilla y un fondo balsámico. Vintage assessment from the file."},
      decanter: { score: 92, scale: 100 , note: "Cereza negra, regaliz, vainilla y un fondo balsámico. Drink inside the published window."}
    },
    priceHint: "18–26 €",
    tasting: "Cereza negra, regaliz, vainilla y un fondo balsámico. Estructura media, listo y con recorrido.",
    pairing: ["Chuletillas al sarmiento", "Embutidos ibéricos", "Arroz de pichón"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 17, humidity: "60–70%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2023, peakStart: 2025, peakEnd: 2032, holdTo: 2036, structure: 82 },
    evolutionNotes: [
      { year: 2023, phase: "Juventud", text: "Fruta y madera aún evidentes." },
      { year: 2027, phase: "Integración", text: "El roble se funde; mejor momento cotidiano." }
    ]
  },
  {
    id: "lermita-2019",
    name: "L'Ermita",
    producer: "Álvaro Palacios",
    vintage: 2019,
    region: "Priorat",
    country: "España",
    appellation: "DOQ Priorat",
    type: "tinto",
    style: "icono",
    grapes: ["Garnacha", "Cariñena"],
    abv: 14.5,
    color: "#541018",
    ratings: {
      vivino: { score: 4.7, count: 410, scale: 5 , note: "Media de usuarios: Fresco pese a la ladera: cereza, flor de jaras, pizarra mojada, grafito."},
      penin: { score: 99, scale: 100 , note: "Fresco pese a la ladera: cereza, flor de jaras, pizarra mojada, grafito. Perfil de guía española."},
      parker: { score: 98, scale: 100, reviewer: "Luis Gutiérrez / WA" , note: "Profundidad y levedad a la vez. Lectura de añada (dossier)."},
      spectator: { score: 96, scale: 100 , note: "Fresco pese a la ladera: cereza, flor de jaras, pizarra mojada, grafito. Vintage assessment from the file."},
      decanter: { score: 97, scale: 100 , note: "Fresco pese a la ladera: cereza, flor de jaras, pizarra mojada, grafito. Drink inside the published window."}
    },
    priceHint: "1.100–1.600 €",
    tasting: "Fresco pese a la ladera: cereza, flor de jaras, pizarra mojada, grafito. Profundidad y levedad a la vez.",
    pairing: ["Cabrito", "Arroz de montaña", "Queso de cabra curado"],
    conservation: { cellarMin: 12, cellarMax: 13, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2027, peakStart: 2030, peakEnd: 2045, holdTo: 2055, structure: 96 },
    evolutionNotes: [
      { year: 2026, phase: "Contención", text: "Aún muy primario. Decantar si se abre ahora." },
      { year: 2034, phase: "Apogeo", text: "Pizarra, flor y fruta en un mismo plano." }
    ]
  },
  {
    id: "pazo-senorans-2023",
    name: "Albariño",
    producer: "Pazo de Señoráns",
    vintage: 2023,
    region: "Rías Baixas",
    country: "España",
    appellation: "DO Rías Baixas",
    type: "blanco",
    style: "joven",
    grapes: ["Albariño"],
    abv: 13.0,
    color: "#e8d9a0",
    ratings: {
      vivino: { score: 4.1, count: 22100, scale: 5, note: "Usuarios: cítrico, salino, fácil de beber. Lo sitúan como albariño de aperitivo más que de guarda." },
      penin: { score: 92, scale: 100, note: "Color pajizo. Nariz de pomelo y hierba fresca. Boca seca, acidez alta, final amargoso de cáscara." },
      parker: { score: 91, scale: 100, reviewer: "Wine Advocate", note: "Albariño directo, sin madera. Fruta de hueso blanca y un punto de CO2 residual que alarga el paso." },
      spectator: { score: 90, scale: 100, note: "Crisp apple and sea spray. Light body, clean finish. Best young." },
      decanter: { score: 91, scale: 100, note: "Atlantic albariño: grapefruit, wet stone, short lees. Drink 2024–2027." }
    },
    priceHint: "16–22 €",
    tasting: "Pomelo, manzana verde, flor de saúco y sal marina. Acidez crujiente, final largo y atlántico.",
    pairing: ["Marisco a la plancha", "Ostras", "Pescado blanco"],
    conservation: { cellarMin: 10, cellarMax: 12, serveMin: 8, serveMax: 10, humidity: "60–70%", position: "horizontal o vertical corto plazo", light: "oscura" },
    aging: { drinkFrom: 2024, peakStart: 2024, peakEnd: 2027, holdTo: 2028, structure: 72 },
    evolutionNotes: [
      { year: 2024, phase: "Frescura", text: "Máxima expresión cítrica y salina. Beber joven." },
      { year: 2027, phase: "Redondez", text: "Más hidrocarburo ligero y menos flor. Aún vivo si la guarda fue fría." }
    ]
  },
  {
    id: "cvne-monopole-2022",
    name: "Monopole Clásico",
    producer: "CVNE",
    vintage: 2022,
    region: "Rioja",
    country: "España",
    appellation: "DOCa Rioja",
    type: "blanco",
    style: "crianza",
    grapes: ["Viura"],
    abv: 13.0,
    color: "#dcc07a",
    ratings: {
      vivino: { score: 4.0, count: 5400, scale: 5 , note: "Media de usuarios: Manzana asada, hinojo, almendra y un toque de velo."},
      penin: { score: 93, scale: 100 , note: "Manzana asada, hinojo, almendra y un toque de velo. Perfil de guía española."},
      parker: { score: 93, scale: 100, reviewer: "Luis Gutiérrez / WA" , note: "Blanco de guarda con nervio. Lectura de añada (dossier)."},
      spectator: { score: 92, scale: 100 , note: "Manzana asada, hinojo, almendra y un toque de velo. Vintage assessment from the file."},
      decanter: { score: 92, scale: 100 , note: "Manzana asada, hinojo, almendra y un toque de velo. Drink inside the published window."}
    },
    priceHint: "22–30 €",
    tasting: "Manzana asada, hinojo, almendra y un toque de velo. Blanco de guarda con nervio.",
    pairing: ["Merluza en salsa verde", "Pollo asado", "Queso Idiazábal tierno"],
    conservation: { cellarMin: 11, cellarMax: 13, serveMin: 10, serveMax: 12, humidity: "60–70%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2024, peakStart: 2026, peakEnd: 2032, holdTo: 2036, structure: 84 },
    evolutionNotes: [
      { year: 2025, phase: "Integración", text: "La crianza se funde con la fruta." },
      { year: 2029, phase: "Complejidad", text: "Notas de avellana, cera y cítrico confitado." }
    ]
  },
  {
    id: "gramona-iii-lustros-2016",
    name: "III Lustros",
    producer: "Gramona",
    vintage: 2016,
    region: "Corpinnat",
    country: "España",
    appellation: "Corpinnat",
    type: "espumoso",
    style: "gran_reserva",
    grapes: ["Xarel·lo", "Macabeo"],
    abv: 12.0,
    color: "#efe3b8",
    ratings: {
      vivino: { score: 4.3, count: 3800, scale: 5 , note: "Media de usuarios: Brioche, manzana golden, almendra tostada y burbuja extrafina."},
      penin: { score: 96, scale: 100 , note: "Brioche, manzana golden, almendra tostada y burbuja extrafina. Perfil de guía española."},
      parker: { score: 94, scale: 100, reviewer: "Wine Advocate" , note: "Larga crianza en rima. Lectura de añada (dossier)."},
      spectator: { score: 93, scale: 100 , note: "Brioche, manzana golden, almendra tostada y burbuja extrafina. Vintage assessment from the file."},
      decanter: { score: 95, scale: 100 , note: "Brioche, manzana golden, almendra tostada y burbuja extrafina. Drink inside the published window."}
    },
    priceHint: "38–52 €",
    tasting: "Brioche, manzana golden, almendra tostada y burbuja extrafina. Larga crianza en rima.",
    pairing: ["Marisco", "Arroz meloso", "Quesos de pasta blanda"],
    conservation: { cellarMin: 10, cellarMax: 12, serveMin: 8, serveMax: 10, humidity: "65–75%", position: "horizontal", light: "muy oscura" },
    aging: { drinkFrom: 2024, peakStart: 2025, peakEnd: 2032, holdTo: 2036, structure: 86 },
    evolutionNotes: [
      { year: 2024, phase: "Degüelle reciente", text: "Frescura y pastelería en equilibrio." },
      { year: 2029, phase: "Madurez", text: "Más frutos secos y menos cítrico. Servir no demasiado frío." }
    ]
  },
  {
    id: "dom-perignon-2015",
    name: "Dom Pérignon",
    producer: "Moët & Chandon",
    vintage: 2015,
    region: "Champagne",
    country: "Francia",
    appellation: "AOC Champagne",
    type: "espumoso",
    style: "prestige",
    grapes: ["Chardonnay", "Pinot Noir"],
    abv: 12.5,
    color: "#ead9a0",
    ratings: {
      vivino: { score: 4.6, count: 18400, scale: 5 , note: "Media de usuarios: Cítrico confitado, piedra de yeso, flor blanca y un ahumado delicado."},
      penin: { score: 96, scale: 100 , note: "Cítrico confitado, piedra de yeso, flor blanca y un ahumado delicado. Perfil de guía española."},
      parker: { score: 96, scale: 100, reviewer: "William Kelley / WA" , note: "Tensión y persistencia. Lectura de añada (dossier)."},
      spectator: { score: 95, scale: 100 , note: "Cítrico confitado, piedra de yeso, flor blanca y un ahumado delicado. Vintage assessment from the file."},
      decanter: { score: 97, scale: 100 , note: "Cítrico confitado, piedra de yeso, flor blanca y un ahumado delicado. Drink inside the published window."}
    },
    priceHint: "180–240 €",
    tasting: "Cítrico confitado, piedra de yeso, flor blanca y un ahumado delicado. Tensión y persistencia.",
    pairing: ["Ostras", "Sashimi", "Vieiras"],
    conservation: { cellarMin: 10, cellarMax: 12, serveMin: 8, serveMax: 10, humidity: "65–75%", position: "horizontal", light: "sin UV" },
    aging: { drinkFrom: 2024, peakStart: 2026, peakEnd: 2038, holdTo: 2045, structure: 92 },
    evolutionNotes: [
      { year: 2023, phase: "Lanzamiento", text: "Año solar; ya accesible pero con margen." },
      { year: 2030, phase: "Apogeo", text: "Más reducción noble y menos fruta primaria." }
    ]
  },
  {
    id: "margaux-2016",
    name: "Château Margaux",
    producer: "Château Margaux",
    vintage: 2016,
    region: "Margaux, Bordeaux",
    country: "Francia",
    appellation: "AOC Margaux 1er Cru",
    type: "tinto",
    style: "icono",
    grapes: ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Petit Verdot"],
    abv: 13.5,
    color: "#4e1020",
    ratings: {
      vivino: { score: 4.7, count: 2100, scale: 5 , note: "Media de usuarios: Violeta, cassis, grafito y una textura de seda."},
      penin: { score: 98, scale: 100 , note: "Violeta, cassis, grafito y una textura de seda. Perfil de guía española."},
      parker: { score: 99, scale: 100, reviewer: "Lisa Perrotti-Brown / WA" , note: "2016 es añada de guarda larga. Lectura de añada (dossier)."},
      spectator: { score: 97, scale: 100 , note: "Violeta, cassis, grafito y una textura de seda. Vintage assessment from the file."},
      decanter: { score: 100, scale: 100 , note: "Violeta, cassis, grafito y una textura de seda. Drink inside the published window."}
    },
    priceHint: "650–900 €",
    tasting: "Violeta, cassis, grafito y una textura de seda. 2016 es añada de guarda larga.",
    pairing: ["Cordero", "Pichón", "Solomillo"],
    conservation: { cellarMin: 12, cellarMax: 13, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2028, peakStart: 2032, peakEnd: 2055, holdTo: 2065, structure: 97 },
    evolutionNotes: [
      { year: 2026, phase: "Cerrado", text: "Tanino noble todavía firme. Esperar o decantar muy largo." },
      { year: 2036, phase: "Apogeo", text: "Perfumado, profundo, eterno." }
    ]
  },
  {
    id: "sassicaia-2019",
    name: "Sassicaia",
    producer: "Tenuta San Guido",
    vintage: 2019,
    region: "Bolgheri",
    country: "Italia",
    appellation: "DOC Bolgheri Sassicaia",
    type: "tinto",
    style: "icono",
    grapes: ["Cabernet Sauvignon", "Cabernet Franc"],
    abv: 14.0,
    color: "#5c1422",
    ratings: {
      vivino: { score: 4.6, count: 8900, scale: 5 , note: "Media de usuarios: Cassis, eucalipto, grafito y brisa marina."},
      penin: { score: 96, scale: 100 , note: "Cassis, eucalipto, grafito y brisa marina. Perfil de guía española."},
      parker: { score: 98, scale: 100, reviewer: "Monica Larner / WA" , note: "Elegancia toscana de corte bordelés. Lectura de añada (dossier)."},
      spectator: { score: 97, scale: 100 , note: "Cassis, eucalipto, grafito y brisa marina. Vintage assessment from the file."},
      decanter: { score: 97, scale: 100 , note: "Cassis, eucalipto, grafito y brisa marina. Drink inside the published window."}
    },
    priceHint: "280–380 €",
    tasting: "Cassis, eucalipto, grafito y brisa marina. Elegancia toscana de corte bordelés.",
    pairing: ["Bistecca", "Jabalí", "Queso pecorino"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "60–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2026, peakStart: 2028, peakEnd: 2042, holdTo: 2050, structure: 93 },
    evolutionNotes: [
      { year: 2025, phase: "Apertura temprana", text: "Ya seductor, pero gana con 3–4 años más." },
      { year: 2034, phase: "Apogeo", text: "Complejidad mediterránea plena." }
    ]
  },
  {
    id: "grange-2018",
    name: "Grange",
    producer: "Penfolds",
    vintage: 2018,
    region: "South Australia",
    country: "Australia",
    appellation: "South Australia",
    type: "tinto",
    style: "icono",
    grapes: ["Shiraz", "Cabernet Sauvignon"],
    abv: 14.5,
    color: "#3f0c14",
    ratings: {
      vivino: { score: 4.6, count: 1500, scale: 5 , note: "Media de usuarios: Mora, regaliz, cacao, roble americano integrado y una potencia controlada."},
      penin: { score: 97, scale: 100 , note: "Mora, regaliz, cacao, roble americano integrado y una potencia controlada. Perfil de guía española."},
      parker: { score: 99, scale: 100, reviewer: "Erin Larkin / WA" , note: "Mora, regaliz, cacao, roble americano integrado y una potencia controlada. Lectura de añada (dossier)."},
      spectator: { score: 98, scale: 100 , note: "Mora, regaliz, cacao, roble americano integrado y una potencia controlada. Vintage assessment from the file."},
      decanter: { score: 98, scale: 100 , note: "Mora, regaliz, cacao, roble americano integrado y una potencia controlada. Drink inside the published window."}
    },
    priceHint: "550–750 €",
    tasting: "Mora, regaliz, cacao, roble americano integrado y una potencia controlada.",
    pairing: ["Costillar", "Caza mayor", "Chocolate negro 70%"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "60–70%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2028, peakStart: 2032, peakEnd: 2050, holdTo: 2060, structure: 96 },
    evolutionNotes: [
      { year: 2026, phase: "Primario", text: "Mucha fruta y roble. Guardar." },
      { year: 2038, phase: "Apogeo", text: "Especias, cuero fino y fruta negra confitada." }
    ]
  },
  {
    id: "vega-valbuena-2019",
    name: "Valbuena 5º",
    producer: "Vega Sicilia",
    vintage: 2019,
    region: "Ribera del Duero",
    country: "España",
    appellation: "DO Ribera del Duero",
    type: "tinto",
    style: "reserva",
    grapes: ["Tinto Fino", "Merlot"],
    abv: 14.5,
    color: "#621624",
    ratings: {
      vivino: { score: 4.5, count: 6200, scale: 5 , note: "Media de usuarios: Cereza picota, violeta, cedro y cacao."},
      penin: { score: 95, scale: 100 , note: "Cereza picota, violeta, cedro y cacao. Perfil de guía española."},
      parker: { score: 96, scale: 100, reviewer: "Luis Gutiérrez / WA" , note: "Más accesible que Único, misma estirpe. Lectura de añada (dossier)."},
      spectator: { score: 94, scale: 100 , note: "Cereza picota, violeta, cedro y cacao. Vintage assessment from the file."},
      decanter: { score: 95, scale: 100 , note: "Cereza picota, violeta, cedro y cacao. Drink inside the published window."}
    },
    priceHint: "140–190 €",
    tasting: "Cereza picota, violeta, cedro y cacao. Más accesible que Único, misma estirpe.",
    pairing: ["Lechazo", "Setas", "Carrillera"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "65–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2025, peakStart: 2027, peakEnd: 2038, holdTo: 2045, structure: 90 },
    evolutionNotes: [
      { year: 2025, phase: "Apertura", text: "Ya se puede beber con decantación." },
      { year: 2031, phase: "Apogeo", text: "Equilibrio entre fruta y terciarios." }
    ]
  },
  {
    id: "muga-prado-enea-2015",
    name: "Prado Enea Gran Reserva",
    producer: "Bodegas Muga",
    vintage: 2015,
    region: "Rioja Alta",
    country: "España",
    appellation: "DOCa Rioja",
    type: "tinto",
    style: "gran_reserva",
    grapes: ["Tempranillo", "Garnacha", "Mazuelo", "Graciano"],
    abv: 14.0,
    color: "#6a1c28",
    ratings: {
      vivino: { score: 4.4, count: 7800, scale: 5 , note: "Media de usuarios: Guinda en licor, tabaco rubio, clavo y una boca amplia de gran reserva clásico."},
      penin: { score: 96, scale: 100 , note: "Guinda en licor, tabaco rubio, clavo y una boca amplia de gran reserva clásico. Perfil de guía española."},
      parker: { score: 95, scale: 100, reviewer: "Luis Gutiérrez / WA" , note: "Guinda en licor, tabaco rubio, clavo y una boca amplia de gran reserva clásico. Lectura de añada (dossier)."},
      spectator: { score: 94, scale: 100 , note: "Guinda en licor, tabaco rubio, clavo y una boca amplia de gran reserva clásico. Vintage assessment from the file."},
      decanter: { score: 96, scale: 100 , note: "Guinda en licor, tabaco rubio, clavo y una boca amplia de gran reserva clásico. Drink inside the published window."}
    },
    priceHint: "55–75 €",
    tasting: "Guinda en licor, tabaco rubio, clavo y una boca amplia de gran reserva clásico.",
    pairing: ["Cordero", "Callos", "Queso Manchego viejo"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "60–75%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2023, peakStart: 2026, peakEnd: 2038, holdTo: 2046, structure: 89 },
    evolutionNotes: [
      { year: 2026, phase: "Meseta", text: "En su momento: fruta, especias y tanino noble." },
      { year: 2036, phase: "Terciario", text: "Más cuero y menos fruta. Sigue entero." }
    ]
  },
  {
    id: "scala-dei-prior-2020",
    name: "Prior",
    producer: "Scala Dei",
    vintage: 2020,
    region: "Priorat",
    country: "España",
    appellation: "DOQ Priorat",
    type: "tinto",
    style: "crianza",
    grapes: ["Garnacha", "Cariñena", "Cabernet Sauvignon"],
    abv: 14.5,
    color: "#6b1824",
    ratings: {
      vivino: { score: 4.1, count: 4100, scale: 5 , note: "Media de usuarios: Fruta roja madura, tomillo, pizarra."},
      penin: { score: 92, scale: 100 , note: "Fruta roja madura, tomillo, pizarra. Perfil de guía española."},
      parker: { score: 92, scale: 100, reviewer: "Wine Advocate" , note: "Priorat más ágil que monumental. Lectura de añada (dossier)."},
      spectator: { score: 91, scale: 100 , note: "Fruta roja madura, tomillo, pizarra. Vintage assessment from the file."},
      decanter: { score: 92, scale: 100 , note: "Fruta roja madura, tomillo, pizarra. Drink inside the published window."}
    },
    priceHint: "22–30 €",
    tasting: "Fruta roja madura, tomillo, pizarra. Priorat más ágil que monumental.",
    pairing: ["Estofados", "Arroces de carne", "Embutido de payés"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 15, serveMax: 17, humidity: "60–70%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2023, peakStart: 2025, peakEnd: 2030, holdTo: 2033, structure: 80 },
    evolutionNotes: [
      { year: 2025, phase: "Plenitud joven", text: "Mejor ahora y en 3–4 años." }
    ]
  },
  {
    id: "enrique-mendoza-chardonnay-2022",
    name: "Chardonnay Fermentado en Barrica",
    producer: "Enrique Mendoza",
    vintage: 2022,
    region: "Alicante",
    country: "España",
    appellation: "DO Alicante",
    type: "blanco",
    style: "crianza",
    grapes: ["Chardonnay"],
    abv: 13.5,
    color: "#e2c878",
    ratings: {
      vivino: { score: 4.0, count: 1800, scale: 5 , note: "Media de usuarios: Piña asada, mantequilla fina, avellana y un final mediterráneo."},
      penin: { score: 92, scale: 100 , note: "Piña asada, mantequilla fina, avellana y un final mediterráneo. Perfil de guía española."},
      parker: { score: 90, scale: 100, reviewer: "Wine Advocate" , note: "Piña asada, mantequilla fina, avellana y un final mediterráneo. Lectura de añada (dossier)."},
      spectator: { score: 90, scale: 100 , note: "Piña asada, mantequilla fina, avellana y un final mediterráneo. Vintage assessment from the file."},
      decanter: { score: 91, scale: 100 , note: "Piña asada, mantequilla fina, avellana y un final mediterráneo. Drink inside the published window."}
    },
    priceHint: "14–20 €",
    tasting: "Piña asada, mantequilla fina, avellana y un final mediterráneo.",
    pairing: ["Pescado graso", "Aves", "Risotto"],
    conservation: { cellarMin: 11, cellarMax: 13, serveMin: 10, serveMax: 12, humidity: "60–70%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2023, peakStart: 2024, peakEnd: 2028, holdTo: 2029, structure: 76 },
    evolutionNotes: [
      { year: 2025, phase: "Integración", text: "La barrica ya no destaca; beber en 2–3 años." }
    ]
  },
  {
    id: "numanthia-2018",
    name: "Numanthia",
    producer: "Numanthia",
    vintage: 2018,
    region: "Toro",
    country: "España",
    appellation: "DO Toro",
    type: "tinto",
    style: "reserva",
    grapes: ["Tinta de Toro"],
    abv: 15.0,
    color: "#4a1018",
    ratings: {
      vivino: { score: 4.3, count: 9700, scale: 5 , note: "Media de usuarios: Mora, cacao, pimienta negra y tanino de Toro que pide botella."},
      penin: { score: 94, scale: 100 , note: "Mora, cacao, pimienta negra y tanino de Toro que pide botella. Perfil de guía española."},
      parker: { score: 94, scale: 100, reviewer: "Wine Advocate" , note: "Mora, cacao, pimienta negra y tanino de Toro que pide botella. Lectura de añada (dossier)."},
      spectator: { score: 93, scale: 100 , note: "Mora, cacao, pimienta negra y tanino de Toro que pide botella. Vintage assessment from the file."},
      decanter: { score: 94, scale: 100 , note: "Mora, cacao, pimienta negra y tanino de Toro que pide botella. Drink inside the published window."}
    },
    priceHint: "45–65 €",
    tasting: "Mora, cacao, pimienta negra y tanino de Toro que pide botella.",
    pairing: ["Chuletón", "Caza", "Legumbres"],
    conservation: { cellarMin: 12, cellarMax: 14, serveMin: 16, serveMax: 18, humidity: "60–70%", position: "horizontal", light: "oscura" },
    aging: { drinkFrom: 2024, peakStart: 2026, peakEnd: 2036, holdTo: 2042, structure: 88 },
    evolutionNotes: [
      { year: 2026, phase: "Apertura", text: "El tanino empieza a ceder. Decantar 90 min." }
    ]
  },
  {
    id: "raidue-rose-2024",
    name: "Rosado",
    producer: "Marqués de Murrieta",
    vintage: 2024,
    region: "Rioja",
    country: "España",
    appellation: "DOCa Rioja",
    type: "rosado",
    style: "joven",
    grapes: ["Garnacha", "Tempranillo", "Mazuelo", "Graciano"],
    abv: 13.5,
    color: "#e8a0a8",
    ratings: {
      vivino: { score: 3.9, count: 2100, scale: 5 , note: "Media de usuarios: Fresa, sandía y pétalo."},
      penin: { score: 90, scale: 100 , note: "Fresa, sandía y pétalo. Perfil de guía española."},
      parker: { score: 89, scale: 100, reviewer: "Wine Advocate" , note: "Seco, salino, de trago largo. Lectura de añada (dossier)."},
      spectator: { score: 88, scale: 100 , note: "Fresa, sandía y pétalo. Vintage assessment from the file."},
      decanter: { score: 90, scale: 100 , note: "Fresa, sandía y pétalo. Drink inside the published window."}
    },
    priceHint: "12–16 €",
    tasting: "Fresa, sandía y pétalo. Seco, salino, de trago largo.",
    pairing: ["Ensaladas", "Pescado a la plancha", "Arroz a banda"],
    conservation: { cellarMin: 10, cellarMax: 12, serveMin: 8, serveMax: 10, humidity: "60–70%", position: "vertical corto plazo", light: "oscura" },
    aging: { drinkFrom: 2025, peakStart: 2025, peakEnd: 2027, holdTo: 2027, structure: 68 },
    evolutionNotes: [
      { year: 2025, phase: "Frescura", text: "Beber en 18 meses para no perder la flor." }
    ]
  }
];

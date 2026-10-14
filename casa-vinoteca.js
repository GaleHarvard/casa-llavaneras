/* Vinotecas, mapa de zonas y huecos. */
const ZONES = [
  { name: "Rioja", country: "España", map: "mapa-rioja.jpg", keys: "rioja, rioja alta, rioja alavesa, rioja baja" },
  { name: "Ribera del Duero", country: "España", map: "mapa-ribera.jpg", keys: "ribera del duero, valbuena de duero" },
  { name: "Priorat", country: "España", map: "mapa-priorat.jpg", keys: "priorat prior gratallops" },
  { name: "Montsant", country: "España", map: "mapa-montsant.jpg", keys: "montsant falset" },
  { name: "Rías Baixas", country: "España", map: "mapa-rias.jpg", keys: "rías rias baixas albariño albarino salnés" },
  { name: "Ribeiro", country: "España", map: "mapa-ribeiro.jpg", keys: "ribeiro ribadavia treixadura" },
  { name: "Ribeira Sacra", country: "España", map: "mapa-ribeirasacra.jpg", keys: "ribeira sacra sil mencía" },
  { name: "Valdeorras", country: "España", map: "mapa-valdeorras.jpg", keys: "valdeorras godello sil" },
  { name: "Monterrei", country: "España", map: "mapa-monterrei.jpg", keys: "monterrei verín verin" },
  { name: "Toro", country: "España", map: "mapa-toro.jpg", keys: "toro numanthia tinta de toro" },
  { name: "Rueda", country: "España", map: "mapa-rueda.jpg", keys: "rueda verdejo" },
  { name: "Bierzo", country: "España", map: "mapa-bierzo.jpg", keys: "bierzo mencía ponferrada" },
  { name: "Cigales", country: "España", map: "mapa-cigales.jpg", keys: "cigales valladolid" },
  { name: "Arlanza", country: "España", map: "mapa-arlanza.jpg", keys: "arlanza lerma" },
  { name: "Arribes", country: "España", map: "mapa-arribes.jpg", keys: "arribes fermoselle" },
  { name: "Tierra de León", country: "España", map: "mapa-leon.jpg", keys: "tierra de león leon prieto picudo" },
  { name: "Tierra del Vino de Zamora", country: "España", map: "mapa-zamora.jpg", keys: "tierra del vino de zamora, zamora" },
  { name: "Sierra de Salamanca", country: "España", map: "mapa-salamanca.jpg", keys: "salamanca sierra de salamanca" },
  { name: "Navarra", country: "España", map: "mapa-navarra.jpg", keys: "navarra pamplona" },
  { name: "Somontano", country: "España", map: "mapa-somontano.jpg", keys: "somontano barbastro huesca" },
  { name: "Calatayud", country: "España", map: "mapa-calatayud.jpg", keys: "calatayud jalón jalon" },
  { name: "Campo de Borja", country: "España", map: "mapa-borja.jpg", keys: "campo de borja garnacha" },
  { name: "Cariñena", country: "España", map: "mapa-carinena.jpg", keys: "cariñena carinena" },
  { name: "Costers del Segre", country: "España", map: "mapa-costers.jpg", keys: "costers segre raïmat raimat lleida" },
  { name: "Penedès", country: "España", map: "mapa-penedes.jpg", keys: "penedès penedes" },
  { name: "Corpinnat", country: "España", map: "mapa-penedes.jpg", keys: "corpinnat" },
  { name: "Cava", country: "España", map: "mapa-cava.jpg", keys: "cava sadurní sadurni" },
  { name: "Empordà", country: "España", map: "mapa-emporda.jpg", keys: "empordà emporda figueres" },
  { name: "Alella", country: "España", map: "mapa-alella.jpg", keys: "alella tiana" },
  { name: "Conca de Barberà", country: "España", map: "mapa-conca.jpg", keys: "conca barberà barbera montblanc" },
  { name: "Pla de Bages", country: "España", map: "mapa-bages.jpg", keys: "bages manresa" },
  { name: "Tarragona", country: "España", map: "mapa-tarragona.jpg", keys: "tarragona" },
  { name: "Terra Alta", country: "España", map: "mapa-terraalta.jpg", keys: "terra alta, gandesa" },
  { name: "Catalunya", country: "España", map: "mapa-catalunya.jpg", keys: "catalunya cataluña" },
  { name: "Alicante", country: "España", map: "mapa-alicante.jpg", keys: "alicante, fondillon" },
  { name: "Utiel-Requena", country: "España", map: "mapa-utiel.jpg", keys: "utiel requena bobal" },
  { name: "Valencia", country: "España", map: "mapa-valencia.jpg", keys: "valencia" },
  { name: "Jumilla", country: "España", map: "mapa-jumilla.jpg", keys: "jumilla monastrell" },
  { name: "Yecla", country: "España", map: "mapa-yecla.jpg", keys: "yecla monastrell" },
  { name: "Bullas", country: "España", map: "mapa-bullas.jpg", keys: "bullas" },
  { name: "Jerez", country: "España", map: "mapa-jerez.jpg", keys: "jerez sherry xérès xeres" },
  { name: "Manzanilla-Sanlúcar", country: "España", map: "mapa-manzanilla.jpg", keys: "manzanilla sanlúcar sanlucar" },
  { name: "Montilla-Moriles", country: "España", map: "mapa-montilla.jpg", keys: "montilla moriles pedro ximénez ximenez" },
  { name: "Málaga", country: "España", map: "mapa-malaga.jpg", keys: "málaga malaga ronda" },
  { name: "Condado de Huelva", country: "España", map: "mapa-huelva.jpg", keys: "huelva condado bollullos" },
  { name: "La Mancha", country: "España", map: "mapa-lamancha.jpg", keys: "la mancha manchego" },
  { name: "Valdepeñas", country: "España", map: "mapa-valdepenas.jpg", keys: "valdepeñas valdepenas" },
  { name: "Manchuela", country: "España", map: "mapa-manchuela.jpg", keys: "manchuela bobal" },
  { name: "Almansa", country: "España", map: "mapa-almansa.jpg", keys: "almansa" },
  { name: "Méntrida", country: "España", map: "mapa-mentrida.jpg", keys: "méntrida mentrida" },
  { name: "Uclés", country: "España", map: "mapa-ucles.jpg", keys: "uclés ucles" },
  { name: "Vinos de Madrid", country: "España", map: "mapa-madrid.jpg", keys: "vinos de madrid, arganda, san martin de valdeiglesias" },
  { name: "Ribera del Guadiana", country: "España", map: "mapa-guadiana.jpg", keys: "guadiana almendralejo barros" },
  { name: "Txakoli", country: "España", map: "mapa-txakoli.jpg", keys: "txakoli txakolina getaria bizkaia álava alava" },
  { name: "Cangas", country: "España", map: "mapa-cangas.jpg", keys: "cangas asturias" },
  { name: "Binissalem", country: "España", map: "mapa-binissalem.jpg", keys: "binissalem mallorca" },
  { name: "Pla i Llevant", country: "España", map: "mapa-mallorca.jpg", keys: "pla i llevant mallorca manacor" },
  { name: "Islas Canarias", country: "España", map: "mapa-canarias.jpg", keys: "canarias tenerife valle orotava tacoronte" },
  { name: "Lanzarote", country: "España", map: "mapa-lanzarote.jpg", keys: "lanzarote geria malvasía malvasia" },
  { name: "Sierras de Málaga", country: "España", map: "mapa-malaga.jpg", keys: "sierras de málaga malaga serranía ronda" },
  { name: "Lebrija", country: "España", map: "mapa-jerez.jpg", keys: "lebrija" },
  { name: "Mondéjar", country: "España", map: "mapa-madrid.jpg", keys: "mondéjar mondejar" },
  { name: "Ribera del Júcar", country: "España", map: "mapa-manchuela.jpg", keys: "ribera del jucar, jucar" },
  { name: "Valtiendas", country: "España", map: "mapa-ribera.jpg", keys: "valtiendas" },
  { name: "Valles de Benavente", country: "España", map: "mapa-leon.jpg", keys: "valles de benavente" },

  { name: "Douro", country: "Portugal", map: "mapa-douro.jpg", keys: "douro pinhão pinhao régua regua" },
  { name: "Porto", country: "Portugal", map: "mapa-porto.jpg", keys: "porto port oporto gaia tawny vintage" },
  { name: "Vinho Verde", country: "Portugal", map: "mapa-vinhoverde.jpg", keys: "vinho verde minho monção moncao alvarinho" },
  { name: "Dão", country: "Portugal", map: "mapa-dao.jpg", keys: "dão dao viseu touriga" },
  { name: "Bairrada", country: "Portugal", map: "mapa-bairrada.jpg", keys: "bairrada baga mealhada" },
  { name: "Alentejo", country: "Portugal", map: "mapa-alentejo.jpg", keys: "alentejo évora evora reguengos" },
  { name: "Lisboa", country: "Portugal", map: "mapa-lisboa.jpg", keys: "lisboa estremadura alenquer" },
  { name: "Setúbal", country: "Portugal", map: "mapa-setubal.jpg", keys: "setúbal setubal moscatel" },
  { name: "Palmela", country: "Portugal", map: "mapa-palmela.jpg", keys: "palmela azeitão azeitao" },
  { name: "Tejo", country: "Portugal", map: "mapa-tejo.jpg", keys: "tejo ribatejo tajo" },
  { name: "Algarve", country: "Portugal", map: "mapa-algarve.jpg", keys: "algarve lagoa lagos" },
  { name: "Madeira", country: "Portugal", map: "mapa-madeira.jpg", keys: "madeira malmsey bual sercial" },
  { name: "Trás-os-Montes", country: "Portugal", map: "mapa-trasosmontes.jpg", keys: "trás-os-montes tras os montes chaves" },
  { name: "Beira Interior", country: "Portugal", map: "mapa-beira.jpg", keys: "beira interior pinhel" },
  { name: "Távora-Varosa", country: "Portugal", map: "mapa-tavora.jpg", keys: "távora tavora varosa" },
  { name: "Açores", country: "Portugal", map: "mapa-acores.jpg", keys: "açores acores pico biscoitos" },
  { name: "Colares", country: "Portugal", map: "mapa-colares.jpg", keys: "colares sintra ramisco" },
  { name: "Bucelas", country: "Portugal", map: "mapa-bucelas.jpg", keys: "bucelas arinto" },

  { name: "Champagne", country: "Francia", map: "mapa-champagne.jpg", keys: "champagne pérignon perignon reims épernay epernay" },
  { name: "Médoc", country: "Francia", map: "mapa-medoc.jpg", keys: "medoc, margaux, pauillac, saint-julien, bordeaux" },
  { name: "Sauternes", country: "Francia", map: "mapa-sauternes.jpg", keys: "sauternes, barsac" },
  { name: "Borgoña", country: "Francia", map: "mapa-borgona.jpg", keys: "borgoña bourgogne burgundy beaune vosne nuits" },
  { name: "Chablis", country: "Francia", map: "mapa-chablis.jpg", keys: "chablis, yonne" },
  { name: "Ródano", country: "Francia", map: "mapa-rhone.jpg", keys: "ródano rhone rhône châteauneuf chateauneuf hermitage côte rotie cote" },
  { name: "Loira", country: "Francia", map: "mapa-loira.jpg", keys: "loira loire sancerre vouvray chinon muscadet" },
  { name: "Alsacia", country: "Francia", map: "mapa-alsacia.jpg", keys: "alsacia alsace riesling gewurztraminer" },
  { name: "Provenza", country: "Francia", map: "mapa-provenza.jpg", keys: "provenza provence bandol cassis" },
  { name: "Languedoc", country: "Francia", map: "mapa-languedoc.jpg", keys: "languedoc roussillon pic saint" },
  { name: "Beaujolais", country: "Francia", map: "mapa-beaujolais.jpg", keys: "beaujolais morgon fleurie moulin" },

  { name: "Piemonte", country: "Italia", map: "mapa-piemonte.jpg", keys: "piemonte, piedmont, barolo, barbaresco, langhe" },
  { name: "Bolgheri", country: "Italia", map: "mapa-bolgheri.jpg", keys: "bolgheri sassicaia ornellaia" },
  { name: "Toscana", country: "Italia", map: "mapa-toscana.jpg", keys: "toscana tuscany chianti brunello montalcino" },
  { name: "Veneto", country: "Italia", map: "mapa-veneto.jpg", keys: "veneto valpolicella amarone soave prosecco" },
  { name: "Sicilia", country: "Italia", map: "mapa-sicilia.jpg", keys: "sicilia, sicily, etna, marsala" },

  { name: "Mendoza", country: "Argentina", map: "mapa-mendoza.jpg", keys: "mendoza, valle de uco" },
  { name: "Salta", country: "Argentina", map: "mapa-salta.jpg", keys: "salta cafayate torrontés torrontes" },
  { name: "Patagonia", country: "Argentina", map: "mapa-patagonia.jpg", keys: "patagonia, neuquen, rio negro" },
  { name: "San Juan", country: "Argentina", map: "mapa-sanjuan.jpg", keys: "san juan, pedernal" },

  { name: "Barossa", country: "Australia", map: "mapa-barossa.jpg", keys: "barossa, barossa valley" },
  { name: "Margaret River", country: "Australia", map: "mapa-margaret.jpg", keys: "margaret river" },
  { name: "Hunter Valley", country: "Australia", map: "mapa-hunter.jpg", keys: "hunter valley semillon" },
  { name: "McLaren Vale", country: "Australia", map: "mapa-mclaren.jpg", keys: "mclaren vale" },

  { name: "Mosel", country: "Alemania", map: "mapa-mosel.jpg", keys: "mosel mosela riesling bernkastel" },
  { name: "Rheingau", country: "Alemania", map: "mapa-rheingau.jpg", keys: "rheingau johannisberg" },
  { name: "Pfalz", country: "Alemania", map: "mapa-pfalz.jpg", keys: "pfalz palatinado" },
  { name: "Baden", country: "Alemania", map: "mapa-baden.jpg", keys: "baden kaiserstuhl" },

  { name: "Napa Valley", country: "California", map: "mapa-napa.jpg", keys: "napa valley cabernet oakville rutherford" },
  { name: "Sonoma", country: "California", map: "mapa-sonoma.jpg", keys: "sonoma russian river pinot" },
  { name: "Paso Robles", country: "California", map: "mapa-paso.jpg", keys: "paso robles" },
  { name: "Santa Barbara", country: "California", map: "mapa-santabarbara.jpg", keys: "santa barbara sta. rita hills" }
];
const ZONE_DO = {
  "Rioja": { surface: "Unas 66.000 ha de viñedo.", climate: "Transición atlántico-mediterránea. Veranos secos e inviernos fríos, con el cierzo en Rioja Alta y Alavesa.", soils: "Arcillo-calcáreos en terrazas y aluviones del Ebro.", grapes: "Tempranillo, Garnacha, Graciano y Mazuelo. Blancos de Viura." },
  "Ribera del Duero": { surface: "Unas 26.100 ha de viñedo.", climate: "Continental extremo: veranos cortos y calurosos, inviernos largos y gran oscilación entre el día y la noche. El viñedo está alto, hacia 750–1.000 m.", soils: "Arcilla, caliza, arena y cascajo del Duero, según el pago.", grapes: "Tinto Fino (Tempranillo). También Cabernet Sauvignon, Merlot, Malbec, Garnacha y Albillo Mayor." },
  "Priorat": { surface: "Unas 2.000 ha de viñedo.", climate: "Mediterráneo de interior, seco y con calor de día y frescor de noche en los costers.", soils: "Llicorella: pizarra descompuesta en laderas muy pendientes.", grapes: "Garnacha y Cariñena, con algo de Cabernet, Syrah y Merlot." },
  "Montsant": { climate: "Mediterráneo, algo más abierto y fresco que el Priorat vecino.", soils: "Arcilla, caliza y pizarra en el valle que rodea el Priorat.", grapes: "Garnacha y Cariñena." },
  "Rías Baixas": { surface: "Unas 4.300 ha de viñedo.", climate: "Atlántico, húmedo y templado, con influencia del océano.", soils: "Granito y suelos ácidos, a menudo en pérgola.", grapes: "Albariño. También Loureiro, Treixadura y Caiño." },
  "Ribeiro": { climate: "Atlántico de interior, en el valle del Miño, Avia y Arnoia.", soils: "Granito arenoso, sábrego.", grapes: "Treixadura, Torrontés, Godello y Loureira. Tintos de Brancellao y Caíño." },
  "Ribeira Sacra": { climate: "Atlántico con cañones abruptos del Sil y del Miño.", soils: "Pizarra y granito en bancales heroicos.", grapes: "Mencía, y blancos de Godello." },
  "Valdeorras": { climate: "Continental con influencia atlántica, en el valle del Sil.", soils: "Pizarra.", grapes: "Godello y Mencía." },
  "Monterrei": { climate: "Continental, más seco que el resto de Galicia, en el valle de Monterrei.", soils: "Granito, pizarra y sedimentos.", grapes: "Godello, Treixadura y Mencía." },
  "Toro": { climate: "Continental extremo, con calor de meseta y noches frías.", soils: "Arena y arcilla sobre el Duero.", grapes: "Tinta de Toro." },
  "Rueda": { surface: "Unas 20.000 ha de viñedo.", climate: "Continental, inviernos largos y veranos secos.", soils: "Cantos y caliza de la meseta.", grapes: "Verdejo. También Sauvignon Blanc." },
  "Bierzo": { climate: "Atlántico de transición, húmedo y con microclimas de valle.", soils: "Pizarra y arcilla en laderas.", grapes: "Mencía y Godello." },
  "Cigales": { climate: "Continental, entre el Pisuerga y el Duero.", soils: "Cantos, arena y arcilla.", grapes: "Tempranillo y Verdejo. Rosados clásicos de la zona." },
  "Arlanza": { climate: "Continental, fresco y de altitud.", soils: "Arena, arcilla y caliza del Arlanza.", grapes: "Tempranillo y Mencía. Blancos de Albillo." },
  "Arribes": { climate: "Continental con el cañón del Duero, más suave junto al río.", soils: "Granito, pizarra y arena.", grapes: "Juan García, Rufete y Bruñal. Blancos de Malvasía y Puesta en Cruz." },
  "Tierra de León": { climate: "Continental de meseta, frío y seco.", soils: "Cantos y arcilla.", grapes: "Prieto Picudo y Mencía. Blancos de Albarín y Verdejo." },
  "Tierra del Vino de Zamora": { climate: "Continental extremo, en la meseta zamorana.", soils: "Arena y arcilla.", grapes: "Tempranillo y algo de Garnacha." },
  "Sierra de Salamanca": { climate: "De sierra, más fresco y húmedo que la meseta.", soils: "Granito y pizarra.", grapes: "Rufete, y blancos de Rufete Serrano." },
  "Navarra": { climate: "De norte húmedo a sur seco, según la subzona.", soils: "Aluvión, arcilla y caliza.", grapes: "Garnacha y Tempranillo. Rosados de Garnacha." },
  "Somontano": { climate: "De pie de monte pirenaico, con contraste de día y noche.", soils: "Arcilla, arena y cantos.", grapes: "Moristel, Parraleta, Tempranillo, Cabernet y Merlot. Blancos de Gewürztraminer y Chardonnay." },
  "Calatayud": { climate: "Continental, seco y de altitud.", soils: "Pizarra y arcilla en laderas.", grapes: "Garnacha." },
  "Campo de Borja": { climate: "Continental, con el cierzo.", soils: "Arcilla y cantos.", grapes: "Garnacha." },
  "Cariñena": { climate: "Continental seco, en el valle del Ebro.", soils: "Cascajo y arcilla.", grapes: "Garnacha y Cariñena." },
  "Costers del Segre": { climate: "Continental seco del interior de Lleida.", soils: "Caliza y arcilla.", grapes: "Tempranillo, Cabernet, Garnacha y Macabeo." },
  "Penedès": { climate: "Mediterráneo, de costa a interior.", soils: "Caliza, arcilla y arena.", grapes: "Xarel·lo, Macabeo y Parellada. Tintos de Garnacha y Ull de Llebre." },
  "Corpinnat": { climate: "El del Alt Penedès: mediterráneo, con noches frescas.", soils: "Caliza y arcilla de viña propia.", grapes: "Xarel·lo, Macabeo y Parellada, con crianza larga en botella." },
  "Cava": { climate: "El de cada zona de elaboración; el corazón histórico es el Penedès.", soils: "Los de la viña de origen.", grapes: "Macabeo, Xarel·lo y Parellada. También Chardonnay y Pinot Noir." },
  "Empordà": { climate: "Mediterráneo con tramontana.", soils: "Pizarra, arena y granito.", grapes: "Garnacha y Cariñena. Blancos de Garnacha Blanca y Macabeo." },
  "Alella": { climate: "Mediterráneo de costa, entre la sierra y el mar.", soils: "Sauló: granito arenoso.", grapes: "Pansa Blanca (Xarel·lo)." },
  "Conca de Barberà": { climate: "Mediterráneo de interior, fresco por la altitud.", soils: "Caliza y arcilla.", grapes: "Trepat, Garnacha y Macabeo." },
  "Pla de Bages": { climate: "Mediterráneo de interior, en la Cataluña central.", soils: "Arcilla y caliza.", grapes: "Picapoll, Mandó y Garnacha." },
  "Tarragona": { climate: "Mediterráneo de costa.", soils: "Caliza y aluvión.", grapes: "Garnacha, Cariñena y Macabeo." },
  "Terra Alta": { climate: "Mediterráneo de interior, seco y ventoso.", soils: "Arcilla y caliza, con panal.", grapes: "Garnacha Blanca y Garnacha Tinta." },
  "Catalunya": { climate: "El de la viña: de costa mediterránea a interior.", soils: "Los del pago de origen.", grapes: "Las variedades autorizadas en Cataluña, según el vino." },
  "Alicante": { climate: "Mediterráneo seco, de costa a la montaña de la Marina.", soils: "Caliza y arcilla.", grapes: "Monastrell. Blancos de Moscatel y, en la costa, Chardonnay." },
  "Utiel-Requena": { climate: "Continental, meseta alta y seca.", soils: "Caliza y arcilla.", grapes: "Bobal." },
  "Valencia": { climate: "Mediterráneo, de huerta a interior.", soils: "Caliza, arena y arcilla.", grapes: "Monastrell, Garnacha y Moscatel." },
  "Jumilla": { climate: "Continental seco, de mucha luz.", soils: "Caliza y arena.", grapes: "Monastrell." },
  "Yecla": { climate: "Continental seco, en el altiplano murciano.", soils: "Caliza.", grapes: "Monastrell." },
  "Bullas": { climate: "Mediterráneo de altitud, más fresco que el litoral.", soils: "Caliza y arcilla.", grapes: "Monastrell." },
  "Jerez": { surface: "Unas 7.000 ha de viñedo.", climate: "Atlántico del suroeste, con poniente húmedo y levante seco.", soils: "Albariza: creta que guarda el agua.", grapes: "Palomino, Pedro Ximénez y Moscatel." },
  "Manzanilla-Sanlúcar": { climate: "Atlántico de la desembocadura del Guadalquivir, más húmedo que Jerez.", soils: "Albariza.", grapes: "Palomino." },
  "Montilla-Moriles": { climate: "Continental andaluz, muy caluroso.", soils: "Albariza y albero.", grapes: "Pedro Ximénez." },
  "Málaga": { climate: "Mediterráneo, de costa a la Axarquía y a Ronda.", soils: "Pizarra en la Axarquía y caliza en Ronda.", grapes: "Pedro Ximénez y Moscatel." },
  "Condado de Huelva": { climate: "Atlántico del Condado, suave.", soils: "Arena, albariza y arcilla.", grapes: "Zalema." },
  "La Mancha": { surface: "La mayor extensión de viñedo de España.", climate: "Continental extremo, seco y de mucha luz.", soils: "Caliza y arcilla de la llanura.", grapes: "Airén y Tempranillo (Cencibel)." },
  "Valdepeñas": { climate: "Continental, en el campo de Calatrava.", soils: "Caliza y arena.", grapes: "Tempranillo y Airén." },
  "Manchuela": { climate: "Continental, entre los ríos Júcar y Cabriel.", soils: "Arcilla y caliza.", grapes: "Bobal y Macabeo." },
  "Almansa": { climate: "Continental seco, puerta de Levante.", soils: "Caliza.", grapes: "Garnacha Tintorera y Monastrell." },
  "Méntrida": { climate: "Continental, al pie de Gredos.", soils: "Arena granítica.", grapes: "Garnacha." },
  "Uclés": { climate: "Continental, entre la Alcarria y la Mancha.", soils: "Caliza y arcilla.", grapes: "Tempranillo, Garnacha y Verdejo." },
  "Vinos de Madrid": { climate: "Continental, con tres subzonas distintas.", soils: "Granito en San Martín, arcilla en Arganda y Navalcarnero.", grapes: "Garnacha, Albillo y Malvar." },
  "Ribera del Guadiana": { climate: "Continental cálido de Extremadura.", soils: "Arcilla, arena y pizarra.", grapes: "Tempranillo, Garnacha, Cayetana y Pardina." },
  "Txakoli": { climate: "Atlántico, húmedo y fresco, junto al Cantábrico.", soils: "Margas y arenisca en ladera.", grapes: "Hondarrabi Zuri y Hondarrabi Beltza." },
  "Cangas": { climate: "Atlántico de montaña, en el suroccidente de Asturias.", soils: "Pizarra en bancales.", grapes: "Albarín Negro, Carrasquín y Verdejo Negro." },
  "Binissalem": { climate: "Mediterráneo mallorquín, caluroso y seco.", soils: "Caliza y arcilla.", grapes: "Manto Negro y Moll (Prensal)." },
  "Pla i Llevant": { climate: "Mediterráneo, en el este de Mallorca.", soils: "Caliza y arcilla.", grapes: "Callet, Manto Negro y Prensal." },
  "Islas Canarias": { climate: "Atlántico subtropical, de costa a ladera volcánica.", soils: "Volcánicos, a menudo en pie franco.", grapes: "Listán Negro, Listán Blanco y Malvasía." },
  "Lanzarote": { climate: "Seco, con alisio y muy poca lluvia.", soils: "Lapilli volcánico, en hoyos protegidos del viento.", grapes: "Malvasía Volcánica." },
  "Sierras de Málaga": { climate: "De sierra, más fresco que la costa malagueña.", soils: "Pizarra y caliza, según el pago.", grapes: "Pedro Ximénez, Moscatel y tintos de altura." },
  "Lebrija": { climate: "Atlántico del bajo Guadalquivir, parecido al marco de Jerez.", soils: "Albariza.", grapes: "Palomino." },
  "Mondéjar": { climate: "Continental, en la Alcarria de Guadalajara.", soils: "Caliza y arcilla roja.", grapes: "Tempranillo, Malvar y Airén." },
  "Ribera del Júcar": { climate: "Continental, en el valle del Júcar.", soils: "Cantos y arcilla.", grapes: "Tempranillo, Bobal y Airén." },
  "Valtiendas": { climate: "Continental, en las laderas segovianas del Duero.", soils: "Arena, arcilla y caliza.", grapes: "Tempranillo y Albillo." },
  "Valles de Benavente": { climate: "Continental de meseta.", soils: "Cantos y arcilla.", grapes: "Tempranillo, Prieto Picudo y Verdejo." },
  "Douro": { surface: "Unas 40.000 ha de viñedo.", climate: "Continental de valle, con veranos muy calurosos y laderas que miran al río.", soils: "Esquisto, en socalcos.", grapes: "Touriga Nacional, Touriga Franca, Tinta Roriz y Tinta Barroca." },
  "Porto": { climate: "El del Douro, donde nace; el vino envejece en Vila Nova de Gaia.", soils: "Esquisto del Douro.", grapes: "Las mismas castas del Douro: Touriga Nacional, Touriga Franca y Tinta Roriz." },
  "Vinho Verde": { climate: "Atlántico, húmedo y fresco.", soils: "Granito.", grapes: "Alvarinho, Loureiro, Trajadura y Arinto." },
  "Dão": { climate: "Continental de interior, protegido por sierras.", soils: "Granito.", grapes: "Touriga Nacional, Tinta Roriz, Alfrocheiro y Encruzado." },
  "Bairrada": { climate: "Atlántico, húmedo, entre la costa y el interior.", soils: "Arcilla y caliza.", grapes: "Baga. Blancos de Maria Gomes y Bical." },
  "Alentejo": { climate: "Continental cálido y seco.", soils: "Granito, esquisto y arcilla, según la subregión.", grapes: "Aragonez, Trincadeira y Alicante Bouschet. Blancos de Antão Vaz." },
  "Lisboa": { climate: "Atlántico, de costa a colina.", soils: "Caliza y arcilla.", grapes: "Arinto, Fernão Pires y Castelão." },
  "Setúbal": { climate: "Mediterráneo atlántico, en la península de Setúbal.", soils: "Arena y caliza.", grapes: "Moscatel de Setúbal y Castelão." },
  "Palmela": { climate: "Mediterráneo, entre la Arrábida y el Sado.", soils: "Arena.", grapes: "Castelão." },
  "Tejo": { climate: "Mediterráneo de ribera, cálido.", soils: "Aluvión del Tajo y arena.", grapes: "Fernão Pires, Castelão y Touriga." },
  "Algarve": { climate: "Mediterráneo del sur, luminoso.", soils: "Arena y arcilla.", grapes: "Negra Mole, Castelão y Sirah." },
  "Madeira": { climate: "Atlántico subtropical, de ladera.", soils: "Volcánicos, en poios.", grapes: "Sercial, Verdelho, Bual, Malvasía y Tinta Negra." },
  "Trás-os-Montes": { climate: "Continental de montaña, frío.", soils: "Esquisto y granito.", grapes: "Bastardo, Rufete y blancos de Gouveio y Códega." },
  "Beira Interior": { climate: "Continental de altitud, en la frontera.", soils: "Granito y esquisto.", grapes: "Rufete, Marufo y Siria." },
  "Távora-Varosa": { climate: "Continental fresco, entre el Dão y el Douro.", soils: "Granito.", grapes: "Malvasia Fina, Cerceal y Touriga." },
  "Açores": { climate: "Atlántico oceánico, húmedo y ventoso.", soils: "Volcánicos, en currais de piedra.", grapes: "Verdelho y Arinto dos Açores." },
  "Colares": { climate: "Atlántico de la costa de Sintra.", soils: "Arena sobre arcilla, en pie franco.", grapes: "Ramisco y Malvasia de Colares." },
  "Bucelas": { climate: "Atlántico, al norte de Lisboa.", soils: "Caliza.", grapes: "Arinto." },
  "Champagne": { surface: "Unas 34.000 ha.", climate: "Fresco y límite para la viña, con heladas de primavera.", soils: "Creta, sobre todo en la Côte des Blancs y la Montagne de Reims.", grapes: "Chardonnay, Pinot Noir y Pinot Meunier." },
  "Médoc": { climate: "Oceánico templado del estuario de la Gironda.", soils: "Gravas del Garona y del Atlántico.", grapes: "Cabernet Sauvignon, Merlot, Cabernet Franc y Petit Verdot." },
  "Sauternes": { climate: "Oceánico, con nieblas del Ciron que favorecen la podredumbre noble.", soils: "Gravas y arcilla.", grapes: "Sémillon, Sauvignon Blanc y Muscadelle." },
  "Borgoña": { climate: "Semicontinental, fresco, de la Côte de Nuits a la Côte de Beaune.", soils: "Caliza y marga.", grapes: "Pinot Noir y Chardonnay." },
  "Chablis": { climate: "Fresco y continental, con riesgo de helada.", soils: "Kimmeridgiense: marga y caliza con fósiles.", grapes: "Chardonnay." },
  "Ródano": { climate: "Continental en el norte y mediterráneo en el sur, con el mistral.", soils: "Granito en el norte; galets y arcilla en el sur.", grapes: "Syrah en el norte. Garnacha, Syrah y Mourvèdre en el sur." },
  "Loira": { climate: "Oceánico, fresco, de Nantes a Sancerre.", soils: "Pizarra, toba, sílex y gravas, según el tramo.", grapes: "Melon de Bourgogne, Chenin, Sauvignon y Cabernet Franc." },
  "Alsacia": { climate: "Semicontinental y seco, a resguardo de los Vosgos.", soils: "Granito, caliza y marga, en un mosaico de pueblos.", grapes: "Riesling, Gewürztraminer, Pinot Gris y Pinot Blanc." },
  "Provenza": { climate: "Mediterráneo, con mistral.", soils: "Caliza y esquisto, de Bandol a la costa.", grapes: "Garnacha, Cinsault, Mourvèdre y Syrah. En Bandol, Mourvèdre." },
  "Languedoc": { climate: "Mediterráneo, seco y luminoso.", soils: "Pizarra, caliza y arcilla, de viña a viña.", grapes: "Garnacha, Syrah, Mourvèdre y Cariñena." },
  "Beaujolais": { climate: "Semicontinental, más suave que la Côte d'Or.", soils: "Granito y, al sur, arcilla y caliza.", grapes: "Gamay." },
  "Piemonte": { climate: "Continental, con nieblas de otoño en las Langhe.", soils: "Marga calcárea.", grapes: "Nebbiolo, Barbera y Dolcetto. Blancos de Moscato y Arneis." },
  "Bolgheri": { climate: "Mediterráneo de costa, templado por el Tirreno.", soils: "Aluvión, arcilla y arena.", grapes: "Cabernet Sauvignon, Cabernet Franc y Merlot." },
  "Toscana": { climate: "Mediterráneo de colina, con contrastes de altitud.", soils: "Galestro, alberese y arcilla.", grapes: "Sangiovese. En Chianti y Montalcino es la casta central." },
  "Veneto": { climate: "De llanura húmeda a colina fresca, según el valle.", soils: "Morrena, caliza y aluvión.", grapes: "Corvina, Rondinella y Garganega. Prosecco de Glera." },
  "Sicilia": { climate: "Mediterráneo, de costa cálida a ladera del Etna.", soils: "Volcánicos en el Etna; caliza en otras zonas.", grapes: "Nero d'Avola, Nerello Mascalese y Carricante." },
  "Mendoza": { climate: "Desértico de altura, con riego de deshielo y mucha luz.", soils: "Aluvión de los Andes.", grapes: "Malbec. También Cabernet y Bonarda." },
  "Salta": { climate: "De gran altitud, seco y con amplitud térmica.", soils: "Arena y canto de los valles Calchaquíes.", grapes: "Torrontés y Malbec." },
  "Patagonia": { climate: "Fresco, ventoso y de días largos.", soils: "Aluvión de río.", grapes: "Pinot Noir y Malbec." },
  "San Juan": { climate: "Desértico y muy luminoso, más cálido que Mendoza.", soils: "Aluvión.", grapes: "Syrah y Bonarda. También Pedro Giménez." },
  "Barossa": { climate: "Mediterráneo cálido, de valle.", soils: "Arcilla y arena antigua.", grapes: "Shiraz y Grenache. Blancos de Semillon y Riesling en Eden Valley." },
  "Margaret River": { climate: "Marítimo, templado por el Índico.", soils: "Gravas y marga.", grapes: "Cabernet Sauvignon y Chardonnay." },
  "Hunter Valley": { climate: "Húmedo y cálido, con lluvias de vendimia.", soils: "Arcilla y aluvión.", grapes: "Semillon y Shiraz." },
  "McLaren Vale": { climate: "Mediterráneo, entre la costa y las colinas.", soils: "Arena, arcilla y caliza.", grapes: "Shiraz y Grenache." },
  "Mosel": { climate: "Fresco, en laderas que miran al río.", soils: "Pizarra.", grapes: "Riesling." },
  "Rheingau": { climate: "Fresco, en la orilla derecha del Rin.", soils: "Pizarra, cuarcita y loess.", grapes: "Riesling y Spätburgunder." },
  "Pfalz": { climate: "El más soleado de Alemania, al resguardo del Haardt.", soils: "Caliza, loess y arenisca.", grapes: "Riesling y Spätburgunder." },
  "Baden": { climate: "El más cálido del país, de norte a sur del Rin.", soils: "Volcánicos en Kaiserstuhl; loess y caliza en el resto.", grapes: "Spätburgunder, Riesling y Grauburgunder." },
  "Napa Valley": { climate: "Mediterráneo de valle, más fresco hacia la bahía.", soils: "Aluvión, volcánicos y gravas, de viña a viña.", grapes: "Cabernet Sauvignon." },
  "Sonoma": { climate: "De costa fresca a valle más cálido.", soils: "Volcánicos y aluvión.", grapes: "Pinot Noir y Chardonnay en la costa; Zinfandel en viñas viejas." },
  "Paso Robles": { climate: "De días calurosos y noches frías, en el paso de la costa.", soils: "Caliza y marga.", grapes: "Cabernet, Syrah y Zinfandel." },
  "Santa Barbara": { climate: "Fresco, con los valles abiertos al Pacífico.", soils: "Caliza y marga marina.", grapes: "Pinot Noir y Chardonnay." }
};
function zoneFactsFor(w) {
  const blob = [w && w.appellation, w && w.region, w && w.country].filter(Boolean).join(" ");
  const z = typeof detectZone === "function" ? detectZone(blob) : null;
  if (!z || !ZONE_DO[z.name]) return null;
  return { name: z.name, country: z.country, facts: ZONE_DO[z.name] };
}
const ZONE_PLATE = Object.fromEntries(ZONES.map(z => [z.name, z.map]));
function foldZone(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}
function zonePhrases(z) {
  const raw = foldZone(z.keys || z.name);
  return raw.split(",").map(p => p.trim()).filter(p => p.length >= 4);
}
function zoneNeedles(z) {
  const needles = [];
  const name = foldZone(z.name);
  if (name.length >= 3) needles.push(name);
  foldZone(z.keys || "").split(",").forEach(chunk => {
    const phrase = chunk.trim();
    if (phrase.length >= 4) needles.push(phrase);
    phrase.split(/\s+/).forEach(word => {
      if (word.length >= 6 && !ZONE_SKIP.has(word)) needles.push(word);
    });
  });
  return needles;
}
function detectZone(text) {
  const hay = foldZone(text);
  if (!hay) return null;
  let best = null;
  let bestLen = 0;
  let bestAt = 1e9;
  ZONES.forEach(z => {
    zoneNeedles(z).forEach(needle => {
      if (needle.length < 3 || needle.length < bestLen) return;
      const re = new RegExp("(^|[^a-z0-9])" + escapeReg(needle) + "([^a-z0-9]|$)");
      const at = hay.search(re);
      if (at < 0) return;
      if (needle.length > bestLen || (needle.length === bestLen && at < bestAt)) {
        best = z;
        bestLen = needle.length;
        bestAt = at;
      }
    });
  });
  return best;
}
function winesInZone(z) {
  const phrases = zonePhrases(z);
  const zoneName = foldZone(z.name);
  return WINE_CATALOG.filter(w => {
    const hay = foldZone([w.region, w.appellation, w.country].join(" "));
    if (zoneName.length >= 4 && hay.includes(zoneName)) return true;
    return phrases.some(p => hay.includes(p));
  });
}
function renderZonas(q) {
  zonaName = "";
  const query = (q || "").trim().toLowerCase();
  const list = ZONES.filter(z => !query || (z.name + " " + z.country + " " + z.keys).toLowerCase().includes(query));
  const groups = [];
  list.forEach(z => {
    const last = groups[groups.length - 1];
    if (!last || last.country !== z.country) groups.push({ country: z.country, items: [z] });
    else last.items.push(z);
  });
  const html = groups.map(g => {
    const tiles = g.items.map(z => {
      const n = winesInZone(z).length;
      const plate = ZONE_PLATE[z.name] || z.map;
      return `<button class="zone-tile" onclick="openZona('${z.name.replace(/'/g, "\\'")}')">
        <img src="${plate}" alt="${z.name}">
        <span><b>${z.name}</b><small>${countryLabel(z.country)} · ${wineCountLabel(n)}</small></span>
      </button>`;
    }).join("");
    return `<p class="cal-h">${countryLabel(g.country)} · ${g.items.length}</p><div class="zone-grid">${tiles}</div>`;
  }).join("");
  $("#zonas-body").innerHTML = `
    <button class="back" onclick="goBack()">‹ ${backCaption()}</button>
    <p class="eyebrow">${t("eyebrow.cellar")}</p>
    <h1>${t("zones.h1")}</h1>
    <div class="search" style="margin:12px 0"><input id="zona-q" type="search" data-i18n-placeholder="search.zone" placeholder="${t("search.zone")}" value="${(q || "").replace(/"/g, "")}" oninput="renderZonas(this.value)"></div>
    <p class="muted">${t("zones.hint")}</p>
    ${html || `<p class="empty">${t("zones.none")}</p>`}`;
  const box = $("#zona-q");
  if (box && query) { box.focus(); box.setSelectionRange(query.length, query.length); }
}
function openZona(name) {
  const z = ZONES.find(x => x.name === name);
  if (!z) return renderZonas();
  const wines = winesInZone(z);
  $("#zonas-body").innerHTML = `
    <button class="back" onclick="renderZonas()">‹ ${t("zones.back")}</button>
    ${z.map ? `<img class="map-art" src="${z.map}" alt="Mapa ${z.name}">` : ""}
    <p class="eyebrow" style="font-size:10px;letter-spacing:.14em;margin:2px 0 0">${countryLabel(z.country)}</p>
    <h1 style="font-size:20px;margin:2px 0 4px;line-height:1.2">${z.name}</h1>
    <p class="muted" style="margin:0 0 12px;font-size:13px">${wines.length === 1 ? t("zones.inCatalog1") : t("zones.inCatalog", { n: wines.length })}</p>
    ${wines.map(w => `<div class="card" role="button" onclick="openWine('${w.id}')">
      <div class="label-row">${labelThumbHtml(w)}<div class="label-copy"><div class="row"><h3>${w.producer}</h3><span class="tiny">${w.vintage}</span></div>
      <p class="muted">${w.name} · ${w.appellation}</p></div></div>
    </div>`).join("") || `<p class="empty">${t("zones.empty")}</p>`}
    ${wines[0] ? `<button class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openWine('${wines[0].id}');setTimeout(()=>openWineSub('mapa'),80)">${t("zones.estateMap")}</button>` : ""}`;
  mountLabelThumbs($("#zonas-body"));
  zonaName = name;
  show("zonas", { zone: name });
}
function cellarName(id) {
  return (state.vinotecas.find(v => v.id === id) || { name: "—" }).name;
}
function renderCaves() {
  syncUsed();
  const icoBot = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3h6l-1 8a4 4 0 1 1-4 0L9 3z"/><path d="M10 21h4"/></svg>`;
  const icoTemp = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v10.2A3.2 3.2 0 1 1 9.6 16"/><path d="M12 3h2M12 7h1.6"/></svg>`;
  $("#caves-list").innerHTML = state.vinotecas.map(v => {
    const shot = v.photo || (v.role === "prestige" ? "cave-render-sommeliere.jpg" : "cave-render-eurocave.jpg");
    const role = v.role === "prestige" ? t("caves.prestige") : t("caves.keeping");
    return `<article class="cave-lux" role="button" tabindex="0" onclick="openCave('${v.id}')">
      <img src="${shot}" alt="${v.name}" onerror="this.src='cave-principal.jpg'">
      <div class="cave-lux-copy">
        <h3>${v.name}</h3>
        <p class="cave-lux-brand">${v.brand}${v.house ? " · " + v.house : ""}</p>
        <p class="cave-lux-role">${role}</p>
        <i class="cave-lux-rule"></i>
        <p class="cave-lux-stat">${icoBot}<b>${v.used}/${v.capacity}</b></p>
        <p class="cave-lux-stat">${icoTemp}<b>${v.tHigh.toFixed(1)}° C</b></p>
      </div>
    </article>`;
  }).join("");
}
function syncUsed() {
  state.vinotecas.forEach(v => {
    v.used = state.bottles.filter(b => b.cellarId === v.id).reduce((n, b) => n + b.qty, 0);
  });
}
function openCave(id, highlightBin) {
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  ensureCaveSlots(v);
  $("#cave-house").textContent = v.house || v.brand || "Casa Llavaneras";
  $("#cave-title").textContent = v.name;
  $("#cave-detail").innerHTML = `
    <p class="muted">${v.brand}${v.role === "prestige" ? t("caves.reserve") : ""}</p>
    <img class="cave-photo" src="${v.photo || "cave-render-sommeliere.jpg"}" alt="${v.name}" onerror="this.src='cave-principal.jpg'" />
    <h2>${t("caves.temp")}</h2>
    <div class="temp-grid" style="margin:12px 0">
      <label class="temp"><span class="tiny">${t("caves.high")}</span><input id="cave-thigh" type="number" step="0.1" value="${Number(v.tHigh).toFixed(1)}" style="width:100%;background:transparent;border:0;color:#c9a227;font:700 22px inherit" /></label>
      <label class="temp"><span class="tiny">${t("caves.low")}</span><input id="cave-tlow" type="number" step="0.1" value="${Number(v.tLow || v.tHigh).toFixed(1)}" style="width:100%;background:transparent;border:0;color:#c9a227;font:700 22px inherit" /></label>
    </div>
    <label class="field"><span>${t("caves.humidity")}</span><input id="cave-hr" type="number" value="${v.humidity || 65}" /></label>
    <button class="btn btn-gold" style="width:100%;margin:8px 0" onclick="saveCaveTemp('${v.id}')">${t("caves.saveTemp")}</button>
    <h2>${t("caves.map")}</h2>
    ${rackGrid(id, highlightBin || "")}
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="openSpaceSheet('${v.id}')">${t("caves.addSlots")}</button>
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="deleteCave('${v.id}')">${t("caves.retire")}</button>`;
  caveOpen = id;
  show("cave-detail-screen");
  if (highlightBin) {
    setTimeout(() => {
      const el = document.querySelector(".rack-focus");
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", inline: "nearest" });
    }, 40);
  }
}
function showLotInCave() {
  const b = currentBottle;
  if (!b || !b.cellarId) return toast(t("caves.notIn"));
  openCave(b.cellarId, b.bin || "");
}
function saveCaveTemp(id) {
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  const hi = parseFloat($("#cave-thigh").value);
  const lo = parseFloat($("#cave-tlow").value);
  const hr = parseInt($("#cave-hr").value, 10);
  if (!Number.isFinite(hi) || hi < 0 || hi > 25) return toast(t("caves.badTemp"));
  v.tHigh = Math.round(hi * 10) / 10;
  v.tLow = Number.isFinite(lo) ? Math.round(lo * 10) / 10 : v.tHigh;
  if (Number.isFinite(hr)) v.humidity = hr;
  save();
  toast(t("caves.savedTemp", { t: v.tHigh.toFixed(1) }));
  openCave(id);
}
function slotCode(n) {
  return "E-" + String(n).padStart(2, "0");
}
function slotNumber(code) {
  const m = String(code || "").match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}
function ensureCaveSlots(v) {
  if (v.slots && v.slots.length) return v.slots;
  const fromRack = rackSlots(v.id);
  const seen = new Set();
  v.slots = fromRack.filter(code => {
    if (seen.has(code)) return false;
    seen.add(code);
    return true;
  });
  save();
  return v.slots;
}
function nextSlotNumbers(v, count) {
  const used = new Set((v.slots || []).map(slotNumber));
  state.bottles.filter(b => b.cellarId === v.id && b.bin).forEach(b => used.add(slotNumber(b.bin)));
  const out = [];
  let n = 1;
  while (out.length < count) {
    if (!used.has(n)) {
      out.push(slotCode(n));
      used.add(n);
    }
    n += 1;
    if (n > 500) break;
  }
  return out;
}
function openSpaceSheet(id) {
  currentCaveId = id;
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  ensureCaveSlots(v);
  const hint = $("#space-hint");
  if (hint) hint.textContent = t("caves.slotHint", { name: v.name, n: v.slots.length });
  const select = $("#space-existing");
  if (select) {
    const mine = new Set(v.slots);
    const codes = [];
    state.vinotecas.forEach(other => {
      ensureCaveSlots(other);
      other.slots.forEach(code => { if (!mine.has(code) && !codes.includes(code)) codes.push(code); });
    });
    select.innerHTML = codes.length
      ? codes.map(c => `<option value="${c}">${c}</option>`).join("")
      : `<option value="">${t("space.noneOther")}</option>`;
  }
  showSheet("space-sheet");
}
function addSequentialSpaces() {
  const v = state.vinotecas.find(x => x.id === currentCaveId);
  if (!v) return;
  ensureCaveSlots(v);
  const count = Math.max(1, parseInt(($("#space-count") && $("#space-count").value) || "1", 10));
  const fresh = nextSlotNumbers(v, count);
  fresh.forEach(code => { if (!v.slots.includes(code)) v.slots.push(code); });
  v.slots.sort((a, b) => slotNumber(a) - slotNumber(b) || a.localeCompare(b));
  v.capacity = Math.max(v.capacity || 0, v.slots.length);
  save();
  hideSheets();
  toast(t("caves.slotsAdded", { n: fresh.length }));
  openCave(v.id);
}
function assignExistingSpace() {
  const v = state.vinotecas.find(x => x.id === currentCaveId);
  const code = $("#space-existing") && $("#space-existing").value;
  if (!v || !code) return toast(t("caves.noSlot"));
  ensureCaveSlots(v);
  if (v.slots.includes(code)) return toast(t("caves.slotExists"));
  v.slots.push(code);
  v.slots.sort((a, b) => slotNumber(a) - slotNumber(b) || a.localeCompare(b));
  v.capacity = Math.max(v.capacity || 0, v.slots.length);
  save();
  hideSheets();
  toast(t("caves.slotAssigned", { code: code }));
  openCave(v.id);
}
function previewNewSlots() {
  const n = Math.max(1, parseInt(($("#new-cave-slots") && $("#new-cave-slots").value) || "12", 10));
  const el = $("#new-slots-preview");
  if (el) el.textContent = "Se crearán " + Array.from({ length: Math.min(n, 6) }, (_, i) => slotCode(i + 1)).join(", ") + (n > 6 ? "…" : "");
}
function rackSlots(cellarId) {
  const v = state.vinotecas.find(x => x.id === cellarId);
  if (v && v.slots && v.slots.length) {
    const extra = state.bottles.filter(b => b.cellarId === cellarId && b.bin && !v.slots.includes(b.bin)).map(b => b.bin);
    return [...v.slots, ...extra.filter((c, i, a) => a.indexOf(c) === i)];
  }
  const rows = cellarId === "v1" ? ["A", "B", "C", "D", "E"] : ["A", "B", "C"];
  const cols = cellarId === "v1" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];
  const base = [];
  rows.forEach(r => cols.forEach(c => base.push(`${r}-${String(c).padStart(2, "0")}`)));
  const extra = state.bottles.filter(b => b.cellarId === cellarId && b.bin && !base.includes(b.bin)).map(b => b.bin);
  return [...base, ...extra];
}
function slotPattern(code) {
  const m = String(code || "").match(/^([A-Za-z]+)-(\d+)$/);
  if (!m) return null;
  return { row: m[1].toUpperCase(), col: parseInt(m[2], 10), code: String(code) };
}
function slotsAreGrid(codes) {
  return codes.length > 0 && codes.every(code => slotPattern(code));
}
function rackCell(cellarId, code, highlight, byBin, pending) {
  const focus = highlight && String(highlight) === String(code) ? " rack-focus" : "";
  const b = byBin[code];
  if (b) {
    const w = wineById(b.wineId) || {};
    const who = ((w.producer || "").split(" ").slice(-2).join(" ") + " " + (typeof shortWineName === "function" ? shortWineName(w) : "") + " " + (w.vintage || "")).trim();
    return `<button class="rack-slot${focus}" data-slot="${escHtml(code)}" onclick="openBottle('${b.uid}')">
      <b>${escHtml(code)}</b>
      <small>${escHtml(who)}</small>
      <span class="rack-dot"></span>
    </button>`;
  }
  const p = pending[code];
  if (p) {
    const w = wineById(p.wineId);
    const name = w ? (w.producer.split(" ").slice(-2).join(" ") + " " + w.vintage) : "Alta";
    return `<button class="rack-slot${focus}" data-slot="${escHtml(code)}" onclick="openWine('${p.wineId}')">
      <b>${escHtml(code)}</b>
      <small>${escHtml(name)} · pendiente</small>
      <span class="rack-dot"></span>
    </button>`;
  }
  return `<div class="rack-slot empty${focus}" data-slot="${escHtml(code)}"><b>${escHtml(code)}</b><small>—</small><span class="rack-dot off"></span></div>`;
}
function rackGrid(cellarId, highlight) {
  const list = state.bottles.filter(b => b.cellarId === cellarId);
  const byBin = {};
  list.forEach(b => { if (b.bin) byBin[b.bin] = b; });
  const pending = {};
  (state.inbox || []).forEach(r => {
    if (!r.entered && r.cellarId === cellarId && r.bin && !byBin[r.bin]) pending[r.bin] = r;
  });
  const codes = rackSlots(cellarId);
  if (!slotsAreGrid(codes)) {
    return `<div class="rack">${codes.map(code => rackCell(cellarId, code, highlight, byBin, pending)).join("")}</div>`;
  }
  const parsed = codes.map(slotPattern);
  const rows = [];
  const cols = [];
  parsed.forEach(p => {
    if (rows.indexOf(p.row) < 0) rows.push(p.row);
    if (cols.indexOf(p.col) < 0) cols.push(p.col);
  });
  rows.sort();
  cols.sort((a, b) => a - b);
  const have = {};
  parsed.forEach(p => { have[p.row + "-" + p.col] = p.code; });
  const body = rows.map(row => {
    const cells = cols.map(col => {
      const code = have[row + "-" + col];
      if (!code) return `<div class="rack-slot empty" aria-hidden="true"></div>`;
      return rackCell(cellarId, code, highlight, byBin, pending);
    }).join("");
    return `<div class="rack-row" style="grid-template-columns:repeat(${cols.length},minmax(72px,1fr))">${cells}</div>`;
  }).join("");
  return `<div class="rack-rows">${body}</div>`;
}
function freeSlotCodes(cellarId) {
  const used = takenBins(cellarId);
  return rackSlots(cellarId).filter(code => !used.has(code));
}
function addCave() {
  const name = $("#new-cave-name").value.trim();
  if (!name) return;
  state.vinotecas.push({
    id: "v" + Date.now(),
    name,
    house: ($("#new-cave-house") && $("#new-cave-house").value.trim()) || "",
    brand: $("#new-cave-brand").value.trim() || "Vinoteca",
    capacity: parseInt($("#new-cave-cap").value || "24", 10),
    used: 0,
    tHigh: parseFloat($("#new-cave-th").value || "13"),
    tLow: parseFloat($("#new-cave-tl").value || "11"),
    humidity: parseInt($("#new-cave-hr").value || "68", 10),
    bins: ($("#new-cave-bins") && $("#new-cave-bins").value.trim()) || "",
    slots: nextSlotNumbers({ slots: [], id: "new" }, Math.max(1, parseInt(($("#new-cave-slots") && $("#new-cave-slots").value) || "12", 10))),
    place: ($("#new-cave-place") && $("#new-cave-place").value.trim()) || "",
    houseId: ensureHouse(($("#new-cave-house") && $("#new-cave-house").value.trim()) || "Casa Llavaneras"),
    zones: ["Personalizada"]
  });
  save();
  hideSheets();
  renderCaves();
  toast(t("caves.created"));
}
function deleteCave(id) {
  const v = state.vinotecas.find(x => x.id === id);
  if (!v) return;
  if (state.vinotecas.length < 2) return toast(t("caves.keepOne"));
  const used = state.bottles.filter(b => b.cellarId === id);
  const dest = state.vinotecas.find(x => x.id !== id);
  if (used.length && !confirm(`${v.name} tiene ${used.reduce((n,b)=>n+b.qty,0)} botellas. ¿Pasarlas a ${dest.name} y dar de baja?`)) return;
  used.forEach(b => { b.cellarId = dest.id; });
  state.vinotecas = state.vinotecas.filter(x => x.id !== id);
  logAct("Baja vinoteca " + v.name);
  save();
  toast(t("caves.retired"));
  show("caves");
}
function bodegaWeb(url) {
  let u = String(url || "").trim();
  if (!u) return "";
  u = u.replace(/https?:\/\/(www\.)?vega-sicilia\.com(\/.*)?$/i, "https://www.temposvegasicilia.com/es");
  u = u.replace(/https?:\/\/(www\.)?scaladei\.es(\/.*)?$/i, "https://www.cellersdescaladei.com");
  return u;
}
function openExternal(url) {
  if (!url) return false;
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {
    location.href = url;
  }
  return false;
}
function zoneStrip(w) {
  const g = bodegaGeo(w);
  return `<div class="zone-card" role="button" onclick="openWineSub('mapa')">
    <div>
      <p class="tiny">${t("map.zone")}</p>
      <strong>${g.zone}</strong>
      <p class="muted">${w.appellation}</p>
    </div>
    <span class="tiny">${t("map.web")}</span>
  </div>`;
}
function mapTabs(on) {
  return `<div class="wine-tabs" style="margin-top:12px">
    <button type="button" class="${on === "mapa" ? "on" : ""}" onclick="openWineSub('mapa')">${t("map.tab")}</button>
    <button type="button" class="${on === "historia" ? "on" : ""}" onclick="openWineSub('historia')">${t("wine.historyBtn")}</button>
    <button type="button" class="${on === "vinos" ? "on" : ""}" onclick="openWineSub('vinos')">${t("map.wines")}</button>
  </div>`;
}
function placeLine(w, g) {
  if (g.address) return g.address;
  const zone = String(g.zone || "").trim();
  const region = String(w.region || "").trim();
  if (!zone) return region;
  if (!region || zone.toLowerCase() === region.toLowerCase() || zone.toLowerCase().includes(region.toLowerCase())) return zone;
  return zone + " · " + region;
}
function mapaBlock(w) {
  const art = estateArt(w);
  const g = bodegaGeo(w);
  const file = (p) => "./" + String(p || "").replace(/^\.\//, "");
  const mapSrc = art.map ? file(art.map) : "";
  const mapImg = mapSrc
    ? `<img class="map-art" data-map="${mapSrc}" src="${mapSrc}" alt="" onerror="this.style.display='none'">`
    : `<p class="muted" data-map="" style="text-align:center;margin:8px 0">${t("map.none")}</p>`;
  const hasPin = g.lat != null && g.lng != null && Number.isFinite(Number(g.lat)) && Number.isFinite(Number(g.lng));
  const osm = hasPin ? `https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=16/${g.lat}/${g.lng}` : "";
  const pin = hasPin ? `${g.lat},${g.lng}` : "";
  const gmaps = hasPin ? `https://www.google.com/maps?q=${pin}` : "";
  const apple = hasPin ? `https://maps.apple.com/?ll=${pin}&q=${pin}` : "";
  const mapLinks = hasPin ? `
    <p class="muted" style="margin:0 0 4px;font-size:13px">${t("map.coords")}: ${Number(g.lat).toFixed(3)}, ${Number(g.lng).toFixed(3)}</p>
    <a class="btn btn-ghost" style="width:100%;margin-top:10px;display:block;text-align:center" href="${gmaps}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Google Maps</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${apple}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${t("map.apple")}</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${osm}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">OpenStreetMap</a>` : `<p class="muted" style="margin-top:10px">${t("map.noPin")}</p>`;
  const zd = zoneFactsFor(w);
  const factRow = (label, value) => value ? `<p style="margin:8px 0 0"><span class="tiny">${escHtml(label)}</span><br>${escHtml(value)}</p>` : "";
  const zoneCard = zd ? `<div class="card" style="margin-top:14px"><p class="tiny">${t("map.zone")}</p><h3 style="margin:4px 0 0;font-size:17px">${escHtml(zd.name)}</h3>${factRow(t("map.surface"), zd.facts.surface)}${factRow(t("map.climate"), zd.facts.climate)}${factRow(t("map.soils"), zd.facts.soils)}${factRow(t("map.grapes"), zd.facts.grapes)}</div>` : "";
  return `
    ${mapImg}
    <p class="tiny" style="margin:0 0 10px;text-align:center">${g.zone || w.region}</p>
    <p class="eyebrow" style="font-size:10px;letter-spacing:.14em;margin:2px 0 0">${w.appellation || ""}</p>
    <h3 style="font-size:17px;margin:2px 0 2px;line-height:1.2">${w.producer}</h3>
    <p class="muted" style="margin:0 0 12px;font-size:13px">${placeLine(w, g)}</p>
    ${mapLinks}
    ${bodegaWeb(g.web) ? `<a class="btn btn-gold" style="width:100%;margin-top:8px;display:block;text-align:center" href="${bodegaWeb(g.web)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${t("map.webBtn")}</a>` : (w.provenance ? `<p class="muted" style="margin-top:8px">${t("map.webNone")}</p>` : "")}
    ${zoneCard}`;
}
function shopLinks(w) {
  return (w && w.shops || []).map(s => `<a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${escHtml(s.url)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${escHtml(s.source || t("shop.word"))}${s.price ? " · " + escHtml(s.price) : ""}</a>`).join("");
}

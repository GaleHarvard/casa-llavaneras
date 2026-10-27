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
function jesusOn() {
  return typeof CASA_EDITION !== "undefined" && CASA_EDITION === "jesus";
}
function cellarCountryCode(v) {
  const raw = String(v && v.country || "").trim();
  if (raw === "ES" || raw === "FR") return raw;
  const fold = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (fold === "espana" || fold === "spain" || fold === "espagne" || fold === "espanha") return "ES";
  if (fold === "francia" || fold === "france" || fold === "franca") return "FR";
  return "";
}
function cellarCountryName(v) {
  const code = cellarCountryCode(v);
  if (code === "ES") return t("jesus.spain");
  if (code === "FR") return t("jesus.france");
  return "";
}
function flagSvg(code) {
  if (code === "ES") return `<svg class="cave-flag" viewBox="0 0 30 20" width="28" height="18" aria-hidden="true"><rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/></svg>`;
  if (code === "FR") return `<svg class="cave-flag" viewBox="0 0 30 20" width="28" height="18" aria-hidden="true"><rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#ffffff"/><rect x="20" width="10" height="20" fill="#ef4135"/></svg>`;
  return "";
}
function renamePencil() {
  return `<svg class="rename-pencil" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M12 6l4 4"/></svg>`;
}
function shelfRows(v) {
  const out = [];
  ((v && v.layout && v.layout.zones) || []).forEach((z, zi) => {
    (z.rows || []).forEach((r, ri) => out.push({ row: r, zi: zi, ri: ri, codes: rowCodes(r) }));
  });
  return out;
}
function slotCustomName(v, code) {
  return String(v && v.slotNames && v.slotNames[code] || "").trim();
}
function slotDisplay(cellarId, code) {
  const raw = String(code || "");
  if (!jesusOn() || !raw) return raw;
  const v = (state.vinotecas || []).find(x => x.id === cellarId);
  return slotCustomName(v, raw) || raw;
}
function binPlaceLabel(cellarId, code) {
  const raw = String(code || "");
  if (!jesusOn() || !raw) return raw;
  const v = (state.vinotecas || []).find(x => x.id === cellarId);
  const hit = shelfRows(v).find(item => item.codes.indexOf(raw) >= 0);
  const shelf = hit && String(hit.row.name || "").trim();
  const slot = slotDisplay(cellarId, raw);
  return shelf ? shelf + " · " + slot : slot;
}
function shelfIndexForCode(cellarId, code) {
  const v = (state.vinotecas || []).find(x => x.id === cellarId);
  const idx = shelfRows(v).findIndex(item => item.codes.indexOf(code) >= 0);
  return idx >= 0 ? idx : 0;
}
function shelfCodesAt(cellarId, index) {
  const v = (state.vinotecas || []).find(x => x.id === cellarId);
  const item = shelfRows(v)[Number(index)];
  return item ? item.codes.slice() : [];
}
function altaShelfChoices(cellarId, selectedIndex) {
  return shelfRows((state.vinotecas || []).find(x => x.id === cellarId)).map((item, i) => {
    return `<option value="${i}"${i === Number(selectedIndex) ? " selected" : ""}>${escHtml(item.row.name || t("jesus.shelf"))}</option>`;
  }).join("");
}
function renderCaves() {
  syncUsed();
  const icoBot = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3h6l-1 8a4 4 0 1 1-4 0L9 3z"/><path d="M10 21h4"/></svg>`;
  const icoTemp = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v10.2A3.2 3.2 0 1 1 9.6 16"/><path d="M12 3h2M12 7h1.6"/></svg>`;
  const jesus = jesusOn();
  const banner = jesus && state.vinotecas.some(v => !String(v.name || "").trim())
    ? `<div class="card" id="jesus-name-cave"><h3>${t("jesus.nameCave")}</h3><p class="muted" style="margin-top:6px">${t("jesus.pendingLead")}</p></div>`
    : "";
  $("#caves-list").innerHTML = banner + state.vinotecas.map(v => {
    const named = String(v.name || "").trim();
    const title = named || (jesus ? t("jesus.nameCave") : v.name);
    const shot = v.photo || (jesus ? "" : (v.role === "prestige" ? "cave-render-sommeliere.jpg" : "cave-render-eurocave.jpg"));
    const role = v.role === "prestige" ? t("caves.prestige") : t("caves.keeping");
    const open = named ? `openCave('${v.id}')` : `openCaveComposer('${v.id}')`;
    const code = jesus ? cellarCountryCode(v) : "";
    const flag = code ? flagSvg(code) : "";
    const loc = code ? cellarCountryName(v) : "";
    let brandLine = `${named ? (v.brand || "") : ""}${v.house ? " · " + v.house : ""}`;
    if (loc) brandLine = brandLine ? brandLine + " · " + loc : loc;
    const titleHtml = flag ? `<div class="cave-title-row">${flag}<h3>${escHtml(title)}</h3></div>` : `<h3>${escHtml(title)}</h3>`;
    return `<article class="cave-lux" role="button" tabindex="0" onclick="${open}">
      ${shot ? `<img src="${shot}" alt="${escHtml(title)}" onerror="this.remove()">` : ""}
      <div class="cave-lux-copy">
        ${titleHtml}
        <p class="cave-lux-brand">${escHtml(brandLine)}</p>
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
  const jesus = jesusOn();
  const code = jesus ? cellarCountryCode(v) : "";
  const loc = code ? cellarCountryName(v) : "";
  const houseBits = [];
  if (v.house) houseBits.push(v.house);
  else if (v.brand) houseBits.push(v.brand);
  else if (!jesus) houseBits.push(typeof brandName === "function" ? brandName() : "Casa Llavaneras");
  if (loc) houseBits.push(loc);
  $("#cave-house").textContent = houseBits.join(" · ");
  const title = String(v.name || "").trim() || (jesus ? t("jesus.nameCave") : v.name);
  const titleEl = $("#cave-title");
  if (titleEl) {
    titleEl.removeAttribute("data-i18n");
    if (code) {
      titleEl.classList.add("cave-title-flag");
      titleEl.innerHTML = flagSvg(code) + `<span>${escHtml(title)}</span>`;
    } else {
      titleEl.classList.remove("cave-title-flag");
      titleEl.textContent = title;
    }
  }
  const typeLine = v.layout && v.layout.type ? t("layout.type." + v.layout.type) : "";
  const depthLine = v.layout && Number(v.layout.depth) > 1 ? t("layout.depthN", { n: v.layout.depth }) : "";
  $("#cave-detail").innerHTML = `
    <p class="muted">${v.brand || ""}${v.role === "prestige" ? t("caves.reserve") : ""}</p>
    ${typeLine || depthLine ? `<p class="tiny">${[typeLine, depthLine].filter(Boolean).join(" · ")}</p>` : ""}
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="openCaveComposer('${v.id}')">${t("layout.define")}</button>
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="openRecuento('${v.id}')">${t("count.h1")}</button>
    ${(() => { const shot = v.photo || (jesus ? "" : "cave-render-sommeliere.jpg"); return shot ? `<img class="cave-photo" src="${shot}" alt="${escHtml(v.name)}" onerror="this.src='cave-principal.jpg'" />` : ""; })()}
    <h2>${t("caves.temp")}</h2>
    <div class="temp-grid" style="margin:12px 0">
      <label class="temp"><span class="tiny">${t("caves.high")}</span><input id="cave-thigh" type="number" step="0.1" value="${Number(v.tHigh).toFixed(1)}" style="width:100%;background:transparent;border:0;color:#c9a227;font:700 22px inherit" /></label>
      <label class="temp"><span class="tiny">${t("caves.low")}</span><input id="cave-tlow" type="number" step="0.1" value="${Number(v.tLow || v.tHigh).toFixed(1)}" style="width:100%;background:transparent;border:0;color:#c9a227;font:700 22px inherit" /></label>
    </div>
    <label class="field"><span>${t("caves.humidity")}</span><input id="cave-hr" type="number" value="${v.humidity || 65}" /></label>
    <button class="btn btn-gold" style="width:100%;margin:8px 0" onclick="saveCaveTemp('${v.id}')">${t("caves.saveTemp")}</button>
    ${jesus ? `<button type="button" class="btn btn-ghost cave-rename" id="cave-rename" onclick="openRenameSheet('${v.id}')">${renamePencil()} ${escHtml(t("jesus.rename"))}</button>` : ""}
    <h2>${t("caves.map")}</h2>
    ${rackGrid(id, highlightBin || "")}
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="openSpaceSheet('${v.id}')">${t("caves.addSlots")}</button>
    <button class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="deleteCave('${v.id}')">${t("caves.retire")}</button>`;
  caveOpen = id;
  show("cave-detail-screen");
  if (highlightBin === "__unplaced__") {
    setTimeout(() => {
      const el = document.getElementById("sin-ubicar");
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
    }, 40);
  } else if (highlightBin) {
    setTimeout(() => {
      const el = document.querySelector(".rack-focus");
      if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", inline: "nearest" });
    }, 40);
  }
}
function showLotInCave() {
  const b = currentBottle;
  if (!b || !b.cellarId) return toast(t("caves.notIn"));
  openCave(b.cellarId, b.bin || "__unplaced__");
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
  if (!v) return [];
  if (!v.layout || !v.layout.zones) migrateOneCave(v, state.bottles || []);
  const base = v.layout ? codesFromLayout(v.layout) : [];
  if (base.length) {
    const extra = (state.bottles || []).filter(b => b.cellarId === v.id && b.bin && base.indexOf(b.bin) < 0).map(b => b.bin);
    const next = uniqueCodes(base.concat(extra));
    const prev = (v.slots || []).join("|");
    v.slots = next;
    if (prev !== next.join("|")) save();
    return v.slots;
  }
  if (v.slots && v.slots.length) return v.slots;
  return [];
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
  const count = Math.max(1, Math.min(80, parseInt(($("#space-count") && $("#space-count").value) || "1", 10) || 1));
  if (!v.layout) migrateOneCave(v, state.bottles || []);
  const prefix = nextPrefix(v.layout);
  let zone = (v.layout.zones || []).find(z => z.kind !== "free");
  if (!zone) {
    zone = { id: "z" + Date.now(), name: t("layout.sampleZone"), kind: "grid", rows: [] };
    v.layout.zones.push(zone);
  }
  if (!zone.rows) zone.rows = [];
  zone.rows.push({ id: "r" + Date.now(), name: prefix, prefix: prefix, capacity: count });
  v.layout.legacy = false;
  v.slots = codesFromLayout(v.layout);
  v.capacity = Math.max(Number(v.capacity) || 0, layoutCapacity(v.layout));
  save();
  hideSheets();
  toast(t("caves.slotsAdded", { n: count }));
  openCave(v.id);
}
function assignExistingSpace() {
  const v = state.vinotecas.find(x => x.id === currentCaveId);
  const code = $("#space-existing") && $("#space-existing").value;
  if (!v || !code) return toast(t("caves.noSlot"));
  ensureCaveSlots(v);
  if ((v.slots || []).indexOf(code) >= 0) return toast(t("caves.slotExists"));
  if (!v.layout) migrateOneCave(v, state.bottles || []);
  const parsed = slotPattern(code);
  const prefix = parsed ? parsed.row : "X";
  let zone = (v.layout.zones || []).find(z => z.kind !== "free");
  if (!zone) {
    zone = { id: "z" + Date.now(), name: t("layout.sampleZone"), kind: "grid", rows: [] };
    v.layout.zones.push(zone);
  }
  let row = (zone.rows || []).find(r => r.prefix === prefix);
  if (!row) {
    row = { id: "r" + Date.now(), name: prefix, prefix: prefix, capacity: 0, slots: [] };
    zone.rows.push(row);
  }
  row.slots = uniqueCodes((row.slots && row.slots.length ? row.slots : rowCodes(row)).concat([code]));
  row.capacity = row.slots.length;
  v.slots = codesFromLayout(v.layout);
  v.capacity = Math.max(Number(v.capacity) || 0, layoutCapacity(v.layout));
  save();
  hideSheets();
  toast(t("caves.slotAssigned", { code: code }));
  openCave(v.id);
}
function previewNewSlots() {
  if (!caveDraft) return;
  updateLayoutPreview();
}
function rackSlots(cellarId) {
  const v = state.vinotecas.find(x => x.id === cellarId);
  if (v && v.layout && v.layout.zones && v.layout.zones.length) {
    const base = codesFromLayout(v.layout);
    const extra = state.bottles.filter(b => b.cellarId === cellarId && b.bin && base.indexOf(b.bin) < 0).map(b => b.bin);
    return uniqueCodes(base.concat(extra));
  }
  if (v && v.slots && v.slots.length) {
    const extra = state.bottles.filter(b => b.cellarId === cellarId && b.bin && v.slots.indexOf(b.bin) < 0).map(b => b.bin);
    return uniqueCodes(v.slots.concat(extra));
  }
  return legacyRackCodes(v || { id: cellarId }, state.bottles || []);
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
    const held = typeof bottleHeld === "function" && bottleHeld(b);
    const label = slotDisplay(cellarId, code);
    return `<button class="rack-slot${focus}${held ? " held" : ""}" data-slot="${escHtml(code)}" onclick="openBottle('${b.uid}')">
      <b>${escHtml(label)}</b>
      <small>${escHtml(who)}${held ? " · " + escHtml(t("wish.held")) : ""}</small>
      <span class="rack-dot"></span>
    </button>`;
  }
  const p = pending[code];
  if (p) {
    const w = wineById(p.wineId);
    const name = w ? (w.producer.split(" ").slice(-2).join(" ") + " " + w.vintage) : "Alta";
    const label = slotDisplay(cellarId, code);
    return `<button class="rack-slot${focus}" data-slot="${escHtml(code)}" onclick="openWine('${p.wineId}')">
      <b>${escHtml(label)}</b>
      <small>${escHtml(name)} · pendiente</small>
      <span class="rack-dot"></span>
    </button>`;
  }
  const label = slotDisplay(cellarId, code);
  const origin = label !== String(code) ? String(code) : "—";
  return `<div class="rack-slot empty${focus}" data-slot="${escHtml(code)}"><b>${escHtml(label)}</b><small>${escHtml(origin)}</small><span class="rack-dot off"></span></div>`;
}
function rackGrid(cellarId, highlight) {
  const list = state.bottles.filter(b => b.cellarId === cellarId);
  const byBin = {};
  list.forEach(b => { if (b.bin) byBin[b.bin] = b; });
  const pending = {};
  (state.inbox || []).forEach(r => {
    if (!r.entered && r.cellarId === cellarId && r.bin && !byBin[r.bin]) pending[r.bin] = r;
  });
  const v = state.vinotecas.find(x => x.id === cellarId);
  if (v && v.layout && v.layout.zones && v.layout.zones.length && !v.layout.legacy) {
    return layoutRack(v, highlight, byBin, pending) + unplacedHtml(cellarId, highlight);
  }
  const codes = rackSlots(cellarId);
  if (!slotsAreGrid(codes)) {
    return `<div class="rack">${codes.map(code => rackCell(cellarId, code, highlight, byBin, pending)).join("")}</div>${unplacedHtml(cellarId, highlight)}`;
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
  return `<div class="rack-rows">${body}</div>${unplacedHtml(cellarId, highlight)}`;
}
function freeSlotCodes(cellarId) {
  const used = takenBins(cellarId);
  return rackSlots(cellarId).filter(code => !used.has(code));
}
function addCave() {
  openCaveComposer();
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
  u = u.replace(/https?:\/\/(www\.)?(temposvegasicilia\.com|vega-sicilia\.com)(\/.*)?$/i, "https://temposvegasicilia.com/");
  u = u.replace(/https?:\/\/(www\.)?(cellersdescaladei\.com|scaladei\.es)(\/.*)?$/i, "https://cellersdescaladei.com/");
  u = u.replace(/https?:\/\/(www\.)?bodegasramonbilbao\.com(\/.*)?$/i, "https://bodegasramonbilbao.com/");
  u = u.replace(/https?:\/\/(www\.)?bodegasysios\.com(\/.*)?$/i, "https://bodegasysios.com/");
  u = u.replace(/^https?:\/\/(www\.)?torres\.es\/?$/i, "https://www.torres.es/");
  u = u.replace(/https?:\/\/(www\.)?massamier-la-mignarde\.com(\/.*)?$/i, "https://massamier-la-mignarde.com/");
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
  const pinLat = hasPin ? Number(g.lat) : null;
  const pinLng = hasPin ? Number(g.lng) : null;
  const fallbackHtml = !hasPin && typeof mapLinksHtml === "function" ? mapLinksHtml(w, g) : "";
  const osm = hasPin ? `https://www.openstreetmap.org/?mlat=${pinLat}&mlon=${pinLng}#map=16/${pinLat}/${pinLng}` : "";
  const pin = hasPin ? `${pinLat},${pinLng}` : "";
  const gmaps = hasPin ? `https://www.google.com/maps?q=${pin}` : "";
  const apple = hasPin ? `https://maps.apple.com/?ll=${pin}&q=${pin}` : "";
  const mapLinks = hasPin ? `
    <p class="muted" style="margin:0 0 4px;font-size:13px">${t("map.coords")}: ${pinLat.toFixed(3)}, ${pinLng.toFixed(3)}</p>
    <a class="btn btn-ghost" style="width:100%;margin-top:10px;display:block;text-align:center" href="${gmaps}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">Google Maps</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${apple}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${t("map.apple")}</a>
    <a class="btn btn-ghost" style="width:100%;margin-top:8px;display:block;text-align:center" href="${osm}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">OpenStreetMap</a>` : fallbackHtml;
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
function pad2(n) { return String(n).padStart(2, "0"); }
function uniqueCodes(list) {
  const out = [];
  (list || []).forEach(code => {
    if (code && out.indexOf(code) < 0) out.push(code);
  });
  return out;
}
function rowCodes(r) {
  if (!r) return [];
  if (r.slots && r.slots.length) return r.slots.slice();
  const prefix = r.prefix || "A";
  const n = Math.max(0, Math.min(80, Number(r.capacity) || 0));
  const out = [];
  for (let i = 1; i <= n; i++) out.push(prefix + "-" + pad2(i));
  return out;
}
function zoneCodes(z) {
  if (!z) return [];
  if (z.kind === "free") {
    if (z.slots && z.slots.length) return z.slots.slice();
    const prefix = z.prefix || "F";
    const n = Math.max(0, Math.min(400, Number(z.capacity) || 0));
    const out = [];
    for (let i = 1; i <= n; i++) out.push(prefix + "-" + pad2(i));
    return out;
  }
  const out = [];
  (z.rows || []).forEach(r => rowCodes(r).forEach(c => out.push(c)));
  return out;
}
function codesFromLayout(layout) {
  const out = [];
  ((layout && layout.zones) || []).forEach(z => zoneCodes(z).forEach(c => out.push(c)));
  return uniqueCodes(out);
}
function layoutCapacity(layout) {
  const depth = Math.max(1, Number(layout && layout.depth) || 1);
  return codesFromLayout(layout).length * depth;
}
function usedPrefixes(layout) {
  const used = {};
  ((layout && layout.zones) || []).forEach(z => {
    if (z.prefix) used[z.prefix] = 1;
    (z.rows || []).forEach(r => { if (r.prefix) used[r.prefix] = 1; });
  });
  return used;
}
function nextPrefix(layout) {
  const used = usedPrefixes(layout);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < letters.length; i++) if (!used[letters[i]]) return letters[i];
  return "R" + (Object.keys(used).length + 1);
}
function legacyRackCodes(v, bottles) {
  const id = v && v.id || "";
  let base = [];
  if (v && v.slots && v.slots.length) base = v.slots.slice();
  else {
    const rows = id === "v1" ? ["A", "B", "C", "D", "E"] : ["A", "B", "C"];
    const cols = id === "v1" ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4];
    rows.forEach(r => cols.forEach(c => base.push(r + "-" + pad2(c))));
  }
  const extra = (bottles || []).filter(b => b.cellarId === id && b.bin && base.indexOf(b.bin) < 0).map(b => b.bin);
  return uniqueCodes(base.concat(extra));
}
function guessCaveType(v) {
  const blob = ((v.name || "") + " " + (v.brand || "") + " " + (v.role || "")).toLowerCase();
  if (/caja|carton|monton/.test(blob)) return "caja";
  if (/estanter/.test(blob)) return "estanteria";
  if (/botellero/.test(blob)) return "botellero";
  if (/armario/.test(blob)) return "armario";
  if (v.tHigh != null || /vinoteca|cava|eurocave|sommel/.test(blob)) return "clima";
  return "otro";
}
function migrateOneCave(v, bottles) {
  if (!v || (v.layout && v.layout.zones && v.layout.zones.length)) return false;
  const codes = legacyRackCodes(v, bottles);
  const groups = [];
  const loose = [];
  codes.forEach(code => {
    const parsed = slotPattern(code);
    if (!parsed) { loose.push(code); return; }
    let g = groups.find(x => x.prefix === parsed.row);
    if (!g) { g = { prefix: parsed.row, slots: [] }; groups.push(g); }
    if (g.slots.indexOf(code) < 0) g.slots.push(code);
  });
  groups.forEach(g => g.slots.sort((a, b) => slotNumber(a) - slotNumber(b)));
  const rows = groups.map((g, i) => ({
    id: "r" + (i + 1),
    name: g.prefix,
    prefix: g.prefix,
    capacity: g.slots.length,
    slots: g.slots
  }));
  const zones = [{
    id: "z1",
    name: (v.zones && v.zones[0]) || "Principal",
    kind: "grid",
    rows: rows.length ? rows : [{ id: "r1", name: "A", prefix: "A", capacity: 4, slots: ["A-01", "A-02", "A-03", "A-04"] }]
  }];
  if (loose.length) {
    zones.push({ id: "z2", name: "Libre", kind: "free", prefix: "F", capacity: loose.length, slots: loose });
  }
  v.layout = { type: guessCaveType(v), depth: 1, legacy: true, zones: zones };
  v.slots = codesFromLayout(v.layout);
  return true;
}
function migrateCellarLayouts(st) {
  const bag = st || state;
  if (!bag || !bag.vinotecas) return false;
  let changed = false;
  bag.vinotecas.forEach(v => {
    if (migrateOneCave(v, bag.bottles || [])) changed = true;
  });
  return changed;
}
function cloneLayout(layout) {
  return JSON.parse(JSON.stringify(layout || { type: "clima", depth: 1, legacy: false, zones: [] }));
}
let caveEditing = "";
let caveDraft = null;
function freshCaveDraft() {
  return {
    name: "",
    house: "",
    brand: "",
    place: "",
    tHigh: "13",
    tLow: "11",
    humidity: "68",
    country: "",
    layout: {
      type: "clima",
      depth: 1,
      legacy: false,
      zones: [
        {
          id: "z1",
          name: t("layout.sampleZone"),
          kind: "grid",
          rows: [
            { id: "r1", name: t("layout.sampleRow", { n: 1 }), prefix: "A", capacity: 8 },
            { id: "r2", name: t("layout.sampleRow", { n: 2 }), prefix: "B", capacity: 4 },
            { id: "r3", name: t("layout.sampleRow", { n: 3 }), prefix: "C", capacity: 2 }
          ]
        },
        { id: "z2", name: t("layout.sampleFree"), kind: "free", prefix: "K", capacity: 12 }
      ]
    }
  };
}
function draftFromCave(v) {
  migrateOneCave(v, state.bottles || []);
  return {
    name: v.name || "",
    house: v.house || "",
    brand: v.brand || "",
    place: v.place || "",
    tHigh: Number.isFinite(Number(v.tHigh)) ? String(v.tHigh) : "13",
    tLow: Number.isFinite(Number(v.tLow)) ? String(v.tLow) : "12",
    humidity: Number.isFinite(Number(v.humidity)) ? String(v.humidity) : "65",
    country: v.country || "",
    layout: cloneLayout(v.layout)
  };
}
function openCaveComposer(id) {
  caveEditing = id || "";
  if (id) {
    const v = state.vinotecas.find(x => x.id === id);
    if (!v) return;
    caveDraft = draftFromCave(v);
  } else caveDraft = freshCaveDraft();
  paintCaveComposer();
  showSheet("cave-sheet");
}
function readComposerFields() {
  if (!caveDraft) caveDraft = freshCaveDraft();
  const name = $("#new-cave-name");
  if (name) caveDraft.name = name.value;
  const house = $("#new-cave-house");
  if (house) caveDraft.house = house.value;
  const brand = $("#new-cave-brand");
  if (brand) caveDraft.brand = brand.value;
  const place = $("#new-cave-place");
  if (place) caveDraft.place = place.value;
  const th = $("#new-cave-th");
  if (th) caveDraft.tHigh = th.value;
  const tl = $("#new-cave-tl");
  if (tl) caveDraft.tLow = tl.value;
  const hr = $("#new-cave-hr");
  if (hr) caveDraft.humidity = hr.value;
  const country = $("#new-cave-country");
  if (country) caveDraft.country = country.value;
  const type = $("#cave-type");
  if (type) caveDraft.layout.type = type.value || "otro";
  const depthEl = $("#cave-depth");
  if (depthEl) {
    const d = parseInt(depthEl.value, 10);
    caveDraft.layout.depth = Number.isFinite(d) && d > 1 ? Math.min(d, 8) : 1;
  }
  (caveDraft.layout.zones || []).forEach((z, zi) => {
    const zn = document.getElementById("zname-" + zi);
    if (zn) z.name = zn.value;
    const zt = document.getElementById("ztemp-" + zi);
    if (zt) z.temp = zt.value.trim();
    if (z.kind === "free") {
      const cap = document.getElementById("zcap-" + zi);
      if (!cap) return;
      const n = Math.max(0, Math.min(400, parseInt(cap.value || "0", 10) || 0));
      if (z.slots && z.slots.length && n !== z.slots.length) {
        z.slots = null;
        caveDraft.layout.legacy = false;
      }
      z.capacity = n;
    } else {
      (z.rows || []).forEach((r, ri) => {
        const rn = document.getElementById("rname-" + zi + "-" + ri);
        const rc = document.getElementById("rcap-" + zi + "-" + ri);
        if (rn) r.name = rn.value;
        if (!rc) return;
        const n = Math.max(0, Math.min(80, parseInt(rc.value || "0", 10) || 0));
        const cur = r.slots && r.slots.length ? r.slots.length : Number(r.capacity) || 0;
        if (n !== cur) {
          r.capacity = n;
          r.slots = null;
          caveDraft.layout.legacy = false;
        } else if (!(r.slots && r.slots.length)) r.capacity = n;
      });
    }
  });
}
function rowEditorCount(r) {
  return r.slots && r.slots.length ? r.slots.length : Number(r.capacity) || 0;
}
function paintCaveComposer() {
  if (!caveDraft) caveDraft = freshCaveDraft();
  const title = $("#cave-sheet-title");
  if (title) title.textContent = caveEditing ? t("layout.edit") : t("new.h1");
  const saveBtn = $("#cave-save");
  if (saveBtn) saveBtn.textContent = caveEditing ? t("layout.save") : t("new.create");
  if ($("#new-cave-name")) $("#new-cave-name").value = caveDraft.name || "";
  if ($("#new-cave-house")) $("#new-cave-house").value = caveDraft.house || "";
  if ($("#new-cave-brand")) $("#new-cave-brand").value = caveDraft.brand || "";
  if ($("#new-cave-place")) $("#new-cave-place").value = caveDraft.place || "";
  if ($("#new-cave-th")) $("#new-cave-th").value = caveDraft.tHigh || "";
  if ($("#new-cave-tl")) $("#new-cave-tl").value = caveDraft.tLow || "";
  if ($("#new-cave-hr")) $("#new-cave-hr").value = caveDraft.humidity || "";
  if ($("#cave-type")) $("#cave-type").value = caveDraft.layout.type || "otro";
  if ($("#cave-depth")) $("#cave-depth").value = Number(caveDraft.layout.depth) > 1 ? String(caveDraft.layout.depth) : "";
  syncJesusCountryField();
  const box = $("#cave-layout");
  if (box) box.innerHTML = (caveDraft.layout.zones || []).map((z, zi) => zoneEditorHtml(z, zi)).join("")
    + `<div class="btn-row">
      <button type="button" class="btn btn-ghost" onclick="addLayoutZone('grid')">${t("layout.addZone")}</button>
      <button type="button" class="btn btn-ghost" onclick="addLayoutZone('free')">${t("layout.addFree")}</button>
    </div>`;
  updateLayoutPreview();
}
function syncJesusCountryField() {
  if (!jesusOn()) return;
  const cur = (caveDraft && caveDraft.country) || "";
  let sel = document.getElementById("new-cave-country");
  if (!sel) {
    const name = document.getElementById("new-cave-name");
    if (!name || !name.parentElement) return;
    const opt = (value, label) => `<option value="${value}">${escHtml(label)}</option>`;
    name.parentElement.insertAdjacentHTML("afterend", `<label class="field" id="jesus-country-field"><span>${escHtml(t("jesus.country"))}</span><select id="new-cave-country" onchange="touchCaveDraft()">${opt("", "—")}${opt("ES", t("jesus.spain"))}${opt("FR", t("jesus.france"))}</select></label>`);
    sel = document.getElementById("new-cave-country");
  }
  if (sel) sel.value = cur;
}
function zoneEditorHtml(z, zi) {
  const moves = `<span class="layout-actions">
    <button type="button" onclick="moveLayoutZone(${zi},-1)" aria-label="${t("layout.up")}">↑</button>
    <button type="button" onclick="moveLayoutZone(${zi},1)" aria-label="${t("layout.down")}">↓</button>
    <button type="button" onclick="removeLayoutZone(${zi})" aria-label="${t("layout.remove")}">×</button>
  </span>`;
  const temp = `<label class="field layout-temp"><span>${t("layout.temp")}</span><input id="ztemp-${zi}" type="number" step="0.1" value="${escHtml(z.temp || "")}" oninput="touchCaveDraft()"></label>`;
  if (z.kind === "free") {
    const n = z.slots && z.slots.length ? z.slots.length : Number(z.capacity) || 0;
    return `<section class="layout-zone">
      <div class="row"><b>${t("layout.free")}</b>${moves}</div>
      <label class="field"><span>${t("layout.zone")}</span><input id="zname-${zi}" value="${escHtml(z.name || "")}" oninput="touchCaveDraft()"></label>
      <label class="field"><span>${t("layout.cap")}</span><input id="zcap-${zi}" type="number" min="0" value="${n}" oninput="touchCaveDraft()"></label>
      ${temp}
    </section>`;
  }
  const rows = (z.rows || []).map((r, ri) => `<div class="layout-row">
    <input id="rname-${zi}-${ri}" value="${escHtml(r.name || r.prefix || "")}" aria-label="${t("layout.row")}" oninput="touchCaveDraft()">
    <input id="rcap-${zi}-${ri}" type="number" min="0" value="${rowEditorCount(r)}" aria-label="${t("layout.cap")}" oninput="touchCaveDraft()">
    <span class="layout-actions">
      <button type="button" onclick="moveLayoutRow(${zi},${ri},-1)" aria-label="${t("layout.up")}">↑</button>
      <button type="button" onclick="moveLayoutRow(${zi},${ri},1)" aria-label="${t("layout.down")}">↓</button>
      <button type="button" onclick="removeLayoutRow(${zi},${ri})" aria-label="${t("layout.remove")}">×</button>
    </span>
  </div>`).join("");
  return `<section class="layout-zone">
    <div class="row"><b>${t("layout.kindGrid")}</b>${moves}</div>
    <label class="field"><span>${t("layout.zone")}</span><input id="zname-${zi}" value="${escHtml(z.name || "")}" oninput="touchCaveDraft()"></label>
    <p class="tiny">${t("layout.rowHint")}</p>
    ${rows}
    <button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="addLayoutRow(${zi})">${t("layout.addRow")}</button>
    ${temp}
  </section>`;
}
function touchCaveDraft() {
  readComposerFields();
  updateLayoutPreview();
}
function updateLayoutPreview() {
  const prev = $("#layout-preview");
  if (!prev || !caveDraft) return;
  const dropped = caveEditing ? occupiedDropCount(caveEditing, caveDraft.layout) : 0;
  const warn = dropped ? `<p class="layout-warn">${t("layout.pending", { n: dropped })}</p>` : "";
  prev.innerHTML = `<p class="tiny">${t("layout.preview")}</p>${warn}${layoutPreviewHtml(caveDraft.layout)}`;
}
function layoutPreviewHtml(layout) {
  return (layout.zones || []).map(z => {
    if (z.kind === "free") {
      const n = zoneCodes(z).length;
      return `<div class="layout-free"><b>${escHtml(z.name || t("layout.free"))}</b><span>${t("layout.pile", { n: n })}</span></div>`;
    }
    const rows = (z.rows || []).map(r => {
      const codes = rowCodes(r);
      const cells = codes.map(c => `<div class="rack-slot empty"><b>${escHtml(c)}</b></div>`).join("") || `<div class="rack-slot empty"><b>—</b></div>`;
      return `<div class="rack-row" style="grid-template-columns:repeat(${Math.max(codes.length, 1)},minmax(0,1fr))">${cells}</div>`;
    }).join("");
    return `<p class="tiny">${escHtml(z.name || "")}</p><div class="rack-rows rack-fit">${rows}</div>`;
  }).join("");
}
function occupiedDropCount(cellarId, layout) {
  const removed = droppedCodes(cellarId, layout);
  const hit = state.bottles.filter(b => b.cellarId === cellarId && b.bin && removed.indexOf(b.bin) >= 0);
  const inbox = (state.inbox || []).filter(r => !r.entered && r.cellarId === cellarId && r.bin && removed.indexOf(r.bin) >= 0);
  return hit.length + inbox.length;
}
function droppedCodes(cellarId, layout) {
  const v = state.vinotecas.find(x => x.id === cellarId);
  if (!v) return [];
  const old = uniqueCodes((v.slots || []).concat(codesFromLayout(v.layout || {})));
  const next = codesFromLayout(layout);
  return old.filter(c => next.indexOf(c) < 0);
}
function addLayoutZone(kind) {
  readComposerFields();
  const prefix = nextPrefix(caveDraft.layout);
  if (kind === "free") {
    caveDraft.layout.zones.push({ id: "z" + Date.now(), name: t("layout.sampleFree"), kind: "free", prefix: prefix, capacity: 8 });
  } else {
    caveDraft.layout.zones.push({
      id: "z" + Date.now(),
      name: t("layout.sampleZone"),
      kind: "grid",
      rows: [{ id: "r" + Date.now(), name: prefix, prefix: prefix, capacity: 6 }]
    });
  }
  caveDraft.layout.legacy = false;
  paintCaveComposer();
}
function removeLayoutZone(zi) {
  readComposerFields();
  if ((caveDraft.layout.zones || []).length < 2) return toast(t("layout.keepZone"));
  caveDraft.layout.zones.splice(zi, 1);
  caveDraft.layout.legacy = false;
  paintCaveComposer();
}
function moveLayoutZone(zi, dir) {
  readComposerFields();
  const zones = caveDraft.layout.zones;
  const j = zi + dir;
  if (j < 0 || j >= zones.length) return;
  const tmp = zones[zi];
  zones[zi] = zones[j];
  zones[j] = tmp;
  paintCaveComposer();
}
function addLayoutRow(zi) {
  readComposerFields();
  const z = caveDraft.layout.zones[zi];
  if (!z || z.kind === "free") return;
  const prefix = nextPrefix(caveDraft.layout);
  z.rows = z.rows || [];
  z.rows.push({ id: "r" + Date.now(), name: prefix, prefix: prefix, capacity: 6 });
  caveDraft.layout.legacy = false;
  paintCaveComposer();
}
function removeLayoutRow(zi, ri) {
  readComposerFields();
  const z = caveDraft.layout.zones[zi];
  if (!z || !z.rows || z.rows.length < 2) return toast(t("layout.keepRow"));
  z.rows.splice(ri, 1);
  caveDraft.layout.legacy = false;
  paintCaveComposer();
}
function moveLayoutRow(zi, ri, dir) {
  readComposerFields();
  const rows = caveDraft.layout.zones[zi] && caveDraft.layout.zones[zi].rows;
  if (!rows) return;
  const j = ri + dir;
  if (j < 0 || j >= rows.length) return;
  const tmp = rows[ri];
  rows[ri] = rows[j];
  rows[j] = tmp;
  paintCaveComposer();
}
function applyDraftToCave(v, codes, structural) {
  v.name = caveDraft.name.trim();
  if (v.name) v.namePending = false;
  v.house = (caveDraft.house || "").trim();
  v.brand = (caveDraft.brand || "").trim() || v.brand || (jesusOn() && !v.name ? "" : "Vinoteca");
  if (jesusOn()) v.country = (caveDraft.country || "").trim();
  v.place = (caveDraft.place || "").trim();
  const hi = parseFloat(caveDraft.tHigh);
  const lo = parseFloat(caveDraft.tLow);
  const hr = parseInt(caveDraft.humidity, 10);
  if (Number.isFinite(hi)) v.tHigh = Math.round(hi * 10) / 10;
  if (Number.isFinite(lo)) v.tLow = Math.round(lo * 10) / 10;
  if (Number.isFinite(hr)) v.humidity = hr;
  if (!Number.isFinite(Number(v.tHigh))) v.tHigh = 13;
  if (!Number.isFinite(Number(v.tLow))) v.tLow = v.tHigh;
  v.layout = cloneLayout(caveDraft.layout);
  v.slots = codes.slice();
  const cap = layoutCapacity(v.layout);
  if (structural) v.capacity = Math.max(cap, (state.bottles || []).filter(b => b.cellarId === v.id).reduce((n, b) => n + (Number(b.qty) || 0), 0));
  else v.capacity = Math.max(Number(v.capacity) || 0, cap);
  if (!v.houseId) v.houseId = ensureHouse(v.house || (typeof brandName === "function" ? brandName() : "Casa Llavaneras"));
  else if (v.house) v.houseId = ensureHouse(v.house);
}
function commitCaveForm() {
  if (!caveDraft) caveDraft = freshCaveDraft();
  readComposerFields();
  const name = (caveDraft.name || "").trim();
  const editing = caveEditing ? state.vinotecas.find(x => x.id === caveEditing) : null;
  const jesusPending = jesusOn() && editing && !String(editing.name || "").trim();
  if (!name && !jesusPending) return toast(t("layout.needName"));
  const codes = codesFromLayout(caveDraft.layout);
  if (!codes.length) return toast(t("layout.needSlots"));
  const id = caveEditing;
  if (id) {
    const v = state.vinotecas.find(x => x.id === id);
    if (!v) return;
    const removed = droppedCodes(id, caveDraft.layout);
    const hit = state.bottles.filter(b => b.cellarId === id && b.bin && removed.indexOf(b.bin) >= 0);
    const inbox = (state.inbox || []).filter(r => !r.entered && r.cellarId === id && r.bin && removed.indexOf(r.bin) >= 0);
    const n = hit.length + inbox.length;
    if (n && !confirm(t("layout.unplaceWarn", { n: n }))) return;
    hit.forEach(b => { b.bin = ""; b.unplaced = true; });
    inbox.forEach(r => { r.bin = ""; });
    applyDraftToCave(v, codes, removed.length > 0);
    save();
    hideSheets();
    toast(n ? t("layout.unplacedDone", { n: n }) : t("layout.saved"));
    openCave(id);
    return;
  }
  const v = {
    id: "v" + Date.now(),
    name: name,
    used: 0,
    bins: "",
    zones: [(caveDraft.layout.zones[0] && caveDraft.layout.zones[0].name) || "Personalizada"],
    houseId: ensureHouse((caveDraft.house || "").trim() || (typeof brandName === "function" ? brandName() : "Casa Llavaneras"))
  };
  applyDraftToCave(v, codes, true);
  state.vinotecas.push(v);
  save();
  hideSheets();
  renderCaves();
  toast(t("caves.created"));
  openCave(v.id);
}
function layoutRack(v, highlight, byBin, pending) {
  return (v.layout.zones || []).map(z => {
    if (z.kind === "free") return freeZoneHtml(z, highlight, byBin, pending);
    const temp = z.temp ? `<span class="tiny">${escHtml(String(z.temp))} °C</span>` : "";
    const rows = (z.rows || []).map(r => {
      const codes = rowCodes(r);
      const cells = codes.map(code => rackCell(v.id, code, highlight, byBin, pending)).join("") || `<div class="rack-slot empty"><b>—</b></div>`;
      const head = jesusOn() && r.name ? `<p class="rack-shelf">${escHtml(r.name)}</p>` : "";
      return `${head}<div class="rack-row" style="grid-template-columns:repeat(${Math.max(codes.length, 1)},minmax(0,1fr))">${cells}</div>`;
    }).join("");
    return `<h3 class="cal-h">${escHtml(z.name || t("layout.kindGrid"))} ${temp}</h3><div class="rack-rows rack-fit">${rows}</div>`;
  }).join("");
}
function freeZoneHtml(z, highlight, byBin, pending) {
  const codes = zoneCodes(z);
  const used = codes.filter(c => byBin[c] || pending[c]);
  const items = used.map(c => rackCell("", c, highlight, byBin, pending)).join("");
  return `<section class="layout-free">
    <div class="row"><h3>${escHtml(z.name || t("layout.free"))}</h3><span class="tiny">${t("layout.pile", { n: codes.length - used.length })}</span></div>
    <div class="rack">${items || `<p class="muted">${t("layout.emptyPile")}</p>`}</div>
  </section>`;
}
function unplacedHtml(cellarId, highlight) {
  const rows = (state.bottles || []).filter(b => b.cellarId === cellarId && !b.bin);
  if (!rows.length) return "";
  const focus = highlight === "__unplaced__" ? " rack-focus" : "";
  const body = rows.map(b => {
    const w = wineById(b.wineId) || {};
    const who = ((w.producer || "") + " " + (w.name || "") + " " + (w.vintage || "")).trim() || b.wineId;
    return `<div class="row" style="margin-top:8px"><span>${escHtml(who)} · ${b.qty}</span><button type="button" class="btn btn-ghost" onclick="placeUnlocated('${b.uid}')">${t("layout.place")}</button></div>`;
  }).join("");
  return `<section id="sin-ubicar" class="unplaced${focus}"><h3>${t("layout.unplaced")}</h3><p class="muted">${t("layout.unplacedLead")}</p>${body}</section>`;
}
function placeUnlocated(uid) {
  const b = state.bottles.find(x => x.uid === uid);
  if (!b) return;
  const free = freeSlotCodes(b.cellarId);
  if (!free.length) return toast(t("layout.noFree"));
  b.bin = free[0];
  b.unplaced = false;
  save();
  openCave(b.cellarId, b.bin);
}
let renameCaveId = "";
function ensureRenameSheet() {
  if (document.getElementById("rename-sheet")) return;
  document.body.insertAdjacentHTML("beforeend", `<div id="rename-sheet" class="modal-bg" onclick="if(event.target===this)hideSheets()"><div class="sheet"><div class="handle"></div><h3 class="rename-title" id="rename-title"></h3><p class="muted" id="rename-lead"></p><button type="button" class="btn btn-gold" style="width:100%;margin:8px 0" onclick="saveRenameSheet()" id="rename-save"></button><div id="rename-body"></div></div></div>`);
}
function resetRenameField(btn) {
  const input = btn && btn.parentElement && btn.parentElement.querySelector("input");
  if (input) input.value = btn.getAttribute("data-default") || "";
}
function openRenameSheet(id) {
  if (!jesusOn()) return;
  const v = (state.vinotecas || []).find(x => x.id === id);
  if (!v) return;
  renameCaveId = id;
  ensureRenameSheet();
  const title = document.getElementById("rename-title");
  const lead = document.getElementById("rename-lead");
  const saveBtn = document.getElementById("rename-save");
  if (title) title.innerHTML = renamePencil() + " " + escHtml(t("jesus.rename"));
  if (lead) lead.textContent = t("jesus.renameLead");
  if (saveBtn) saveBtn.textContent = t("jesus.renameSave");
  const rows = shelfRows(v);
  const shelves = rows.map(item => {
    const base = item.row.baseName || item.row.name || "";
    return `<label class="field rename-line"><span>${escHtml(t("jesus.shelf"))} · ${escHtml(base)}</span><span class="rename-edit"><input id="rename-row-${item.zi}-${item.ri}" value="${escHtml(item.row.name || "")}" autocomplete="off"><button type="button" class="btn btn-ghost" data-default="${escHtml(base)}" onclick="resetRenameField(this)">${escHtml(t("jesus.renameDefault"))}</button></span></label>`;
  }).join("");
  const slots = rows.map(item => {
    const cells = item.codes.map(code => `<label class="field rename-line"><span>${escHtml(code)}</span><span class="rename-edit"><input data-rename-slot="${escHtml(code)}" value="${escHtml(slotCustomName(v, code))}" placeholder="${escHtml(code)}" autocomplete="off"><button type="button" class="btn btn-ghost" data-default="" onclick="resetRenameField(this)">${escHtml(t("jesus.renameDefault"))}</button></span></label>`).join("");
    return `<h2>${escHtml(item.row.name || t("jesus.shelf"))}</h2>${cells}`;
  }).join("");
  const body = document.getElementById("rename-body");
  if (body) body.innerHTML = `<h2>${escHtml(t("jesus.shelves"))}</h2>${shelves}<h2>${escHtml(t("jesus.slots"))}</h2>${slots}`;
  showSheet("rename-sheet");
}
function saveRenameSheet() {
  if (!jesusOn()) return;
  const v = (state.vinotecas || []).find(x => x.id === renameCaveId);
  if (!v) return;
  shelfRows(v).forEach(item => {
    const input = document.getElementById("rename-row-" + item.zi + "-" + item.ri);
    if (!input) return;
    const next = input.value.trim();
    if (!item.row.baseName) item.row.baseName = item.row.name || next;
    item.row.name = next || item.row.baseName;
  });
  if (!v.slotNames || typeof v.slotNames !== "object") v.slotNames = {};
  document.querySelectorAll("[data-rename-slot]").forEach(input => {
    const code = input.getAttribute("data-rename-slot");
    const next = input.value.trim();
    if (!code) return;
    if (!next || next === code) delete v.slotNames[code];
    else v.slotNames[code] = next;
  });
  const live = {};
  codesFromLayout(v.layout).forEach(code => { if (v.slotNames[code]) live[code] = v.slotNames[code]; });
  v.slotNames = live;
  save();
  hideSheets();
  toast(t("jesus.renameSaved"));
  openCave(v.id);
}
if (typeof state !== "undefined" && state && state.vinotecas) {
  try {
    if (migrateCellarLayouts(state) && localStorage.getItem(STORE)) save();
  } catch (e) {}
}

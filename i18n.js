/* Idiomas de la interfaz. El texto del catálogo y lo que escribe el usuario no van aquí. */
const LANG_CHOICES = [
  { code: "es", locale: "es-ES", endonym: "Español" },
  { code: "ca", locale: "ca-ES", endonym: "Català" },
  { code: "en", locale: "en-GB", endonym: "English" },
  { code: "fr", locale: "fr-FR", endonym: "Français" },
  { code: "pt", locale: "pt-PT", endonym: "Português" }
];
const I18N_ORDER = ["es", "ca", "en", "fr", "pt"];
const I18N_ROWS = [
  ["tab.home", "Inicio", "Inici", "Home", "Accueil", "Início"],
  ["tab.caves", "Vinotecas", "Vinoteques", "Cellars", "Caves", "Adegas"],
  ["tab.bottles", "Botellas", "Ampolles", "Bottles", "Bouteilles", "Garrafas"],
  ["tab.table", "Mesa", "Taula", "Table", "Table", "Mesa"],
  ["tab.dates", "Fechas", "Dates", "Dates", "Dates", "Datas"],
  ["nav.home", "Inicio", "Inici", "Home", "Accueil", "Início"],
  ["nav.caves", "Vinotecas", "Vinoteques", "Cellars", "Caves", "Adegas"],
  ["nav.cave", "Vinoteca", "Vinoteca", "Cellar", "Cave", "Adega"],
  ["nav.bottles", "Botellas", "Ampolles", "Bottles", "Bouteilles", "Garrafas"],
  ["nav.dates", "Fechas", "Dates", "Dates", "Dates", "Datas"],
  ["nav.table", "Mesa", "Taula", "Table", "Table", "Mesa"],
  ["nav.scan", "Escanear", "Escanejar", "Scan", "Scanner", "Digitalizar"],
  ["nav.inbox", "Entradas", "Entrades", "Intakes", "Entrées", "Entradas"],
  ["nav.profile", "Perfil", "Perfil", "Profile", "Profil", "Perfil"],
  ["nav.zones", "Zonas", "Zones", "Regions", "Régions", "Regiões"],
  ["nav.tastings", "Catas", "Tastos", "Tastings", "Dégustations", "Provas"],
  ["nav.drinks", "Bebidas", "Begudes", "Drinks", "Consommés", "Bebidas"],
  ["nav.balance", "Balance", "Balanç", "Balance", "Bilan", "Balanço"],
  ["nav.dish", "Plato", "Plat", "Dish", "Plat", "Prato"],
  ["nav.wine", "Ficha", "Fitxa", "Wine", "Fiche", "Ficha"],
  ["nav.back", "Atrás", "Enrere", "Back", "Retour", "Voltar"],
  ["splash.title", "Vinotecas", "Vinoteques", "Cellars", "Caves", "Adegas"],
  ["splash.tag", "Escanea. Conserva. Sirve en su momento.", "Escaneja. Conserva. Serveix al seu moment.", "Scan. Keep. Serve at the right time.", "Scannez. Conservez. Servez au bon moment.", "Digitalize. Conserve. Sirva na hora certa."],
  ["boot.title", "No se ha podido abrir", "No s'ha pogut obrir", "Could not open", "Impossible d'ouvrir", "Não foi possível abrir"],
  ["boot.body", "La app no ha arrancado. Tus vinos siguen guardados en este iPhone.", "L'app no ha arrencat. Els vins segueixen desats en aquest iPhone.", "The app did not start. Your wines are still on this iPhone.", "L'app n'a pas démarré. Vos vins sont toujours sur cet iPhone.", "A app não arrancou. Os vinhos continuam neste iPhone."],
  ["boot.retry", "Reintentar", "Tornar a provar", "Try again", "Réessayer", "Tentar de novo"],
  ["boot.repair", "Reparar", "Reparar", "Repair", "Réparer", "Reparar"],
  ["boot.repairHint", "Reparar quita la caché de la app y vuelve a cargarla. No borra la cava.", "Reparar treu la memòria cau de l'app i la torna a carregar. No esborra el celler.", "Repair clears the app cache and reloads it. It does not erase the cellar.", "Réparer vide le cache de l'app et la recharge. Cela n'efface pas la cave.", "Reparar limpa a cache da app e volta a carregá-la. Não apaga a adega."],
  ["update.ready", "Nueva versión disponible", "Nova versió disponible", "New version available", "Nouvelle version disponible", "Nova versão disponível"],
  ["eyebrow.cellar", "Mi Vinoteca", "El meu celler", "My cellar", "Ma cave", "A minha adega"],
  ["kicker.inventory", "Inventario", "Inventari", "Inventory", "Inventaire", "Inventário"],
  ["kicker.when", "Consumo", "Consum", "Drinking", "Consommation", "Consumo"],
  ["kicker.table", "Mesa", "Taula", "Table", "Table", "Mesa"],
  ["kicker.scan", "Un toque", "Un toc", "One tap", "Un geste", "Um toque"],
  ["kicker.inbox", "Altas pendientes", "Altes pendents", "Pending intakes", "Entrées en attente", "Altas pendentes"],
  ["kicker.history", "Historial", "Historial", "History", "Historique", "Histórico"],
  ["kicker.collection", "Colección", "Col·lecció", "Collection", "Collection", "Coleção"],
  ["home.h1", "Casa Llavaneras", "Casa Llavaneras", "Casa Llavaneras", "Casa Llavaneras", "Casa Llavaneras"],
  ["home.inCellar", "En cava", "Al celler", "In cellar", "En cave", "Na adega"],
  ["home.value", "Valor", "Valor", "Value", "Valeur", "Valor"],
  ["home.costMarket", "Coste · {m} mercado", "Cost · {m} mercat", "Cost · {m} market", "Coût · {m} marché", "Custo · {m} mercado"],
  ["home.toServe", "Para servir", "Per servir", "To serve", "À servir", "Para servir"],
  ["home.featured", "Vino destacado", "Vi destacat", "Wine of note", "Vin en vedette", "Vinho em destaque"],
  ["home.drinkNow", "Para beber ahora", "Per beure ara", "Ready to drink", "À boire maintenant", "Para beber agora"],
  ["home.noneWindow", "Nada en ventana de consumo.", "Res a la finestra de consum.", "Nothing in its drinking window.", "Rien dans la fenêtre de consommation.", "Nada na janela de consumo."],
  ["home.lastTastings", "Últimas catas", "Últims tastos", "Latest tastings", "Dernières dégustations", "Últimas provas"],
  ["home.noNote", "Sin recuerdo escrito", "Sense record escrit", "No written note", "Pas de note écrite", "Sem nota escrita"],
  ["home.noTasting", "Aún no hay cata personal.", "Encara no hi ha tast personal.", "No personal tasting yet.", "Pas encore de dégustation personnelle.", "Ainda não há prova pessoal."],
  ["home.pages", "Páginas", "Pàgines", "Pages", "Pages", "Páginas"],
  ["home.inboxTitle", "Entradas del escáner", "Entrades de l'escàner", "Scanner intakes", "Entrées du scan", "Entradas do scanner"],
  ["home.inboxSub", "Fotos leídas pendientes de stock y hueco", "Fotos llegides pendents d'estoc i forat", "Read photos still waiting for stock and a slot", "Photos lues en attente de stock et d'emplacement", "Fotos lidas à espera de stock e lugar"],
  ["home.cavesSub", "VIP 185 y el resto de cavas", "VIP 185 i la resta de caves", "VIP 185 and the other cellars", "VIP 185 et les autres caves", "VIP 185 e as outras adegas"],
  ["home.vip", "Detalle VIP 185", "Detall VIP 185", "VIP 185 detail", "Détail VIP 185", "Detalhe VIP 185"],
  ["home.vipSub", "Foto, huecos, temperatura", "Foto, forats, temperatura", "Photo, slots, temperature", "Photo, emplacements, température", "Foto, lugares, temperatura"],
  ["home.bottlesSub", "Inventario, lotes y ubicación", "Inventari, lots i ubicació", "Inventory, lots and location", "Inventaire, lots et emplacement", "Inventário, lotes e localização"],
  ["home.tableSub", "Maridajes por plato y por vino", "Maridatges per plat i per vi", "Pairings by dish and by wine", "Accords par plat et par vin", "Harmonizações por prato e por vinho"],
  ["home.datesSub", "Beber ahora, pronto, aguardar", "Beure ara, aviat, esperar", "Drink now, soon, or wait", "Boire maintenant, bientôt, ou attendre", "Beber agora, em breve, ou esperar"],
  ["home.zones", "Zonas vinícolas", "Zones vinícoles", "Wine regions", "Régions viticoles", "Regiões vinícolas"],
  ["home.zonesSub", "Mapa por región y vinos", "Mapa per regió i vins", "Map by region and wines", "Carte par région et vins", "Mapa por região e vinhos"],
  ["home.drinks", "Bebidas", "Begudes", "Drinks", "Consommés", "Bebidas"],
  ["home.drinksSub", "Lo que ya se ha servido", "El que ja s'ha servit", "What has already been served", "Ce qui a déjà été servi", "O que já foi servido"],
  ["home.notebook", "Cuaderno de cata", "Quadern de tast", "Tasting notebook", "Carnet de dégustation", "Caderno de prova"],
  ["home.notebookSub", "Ejes y recuerdo", "Eixos i record", "Axes and memory", "Axes et souvenir", "Eixos e memória"],
  ["home.profile", "Perfil", "Perfil", "Profile", "Profil", "Perfil"],
  ["home.profileSub", "Casas, copias y privacidad", "Cases, còpies i privadesa", "Houses, backups and privacy", "Maisons, copies et confidentialité", "Casas, cópias e privacidade"],
  ["home.location", "Ubicación física", "Ubicació física", "Physical location", "Emplacement physique", "Localização física"],
  ["home.locationSub", "Hueco, lote, servir y mover", "Forat, lot, servir i moure", "Slot, lot, serve and move", "Emplacement, lot, servir et déplacer", "Lugar, lote, servir e mover"],
  ["home.scan", "Escanear", "Escanejar", "Scan", "Scanner", "Digitalizar"],
  ["home.inbox", "Entradas", "Entrades", "Intakes", "Entrées", "Entradas"],
  ["home.quick", "Cata rápida", "Tast ràpid", "Quick tasting", "Dégustation rapide", "Prova rápida"],
  ["home.map", "Mapa", "Mapa", "Map", "Carte", "Mapa"],
  ["home.notices", "Avisos", "Avisos", "Notices", "Alertes", "Avisos"],
  ["home.noticesOn", "Activos", "Actius", "On", "Actives", "Ativos"],
  ["home.noticesSetup", "Configurar", "Configurar", "Set up", "Régler", "Configurar"],
  ["home.noticesOnHint", "Apogeo, beber pronto, temperatura y última botella.", "Apogeu, beure aviat, temperatura i última ampolla.", "Peak, drink soon, temperature and last bottle.", "Apogée, à boire bientôt, température et dernière bouteille.", "Apogeu, beber em breve, temperatura e última garrafa."],
  ["home.noticesOffHint", "Actívalos para no perder la ventana.", "Activa'ls per no perdre la finestra.", "Turn them on so you do not miss the window.", "Activez-les pour ne pas manquer la fenêtre.", "Ative-os para não perder a janela."],
  ["home.profileCard", "Casas, privacidad, copias y fuentes.", "Cases, privadesa, còpies i fonts.", "Houses, privacy, backups and sources.", "Maisons, confidentialité, copies et sources.", "Casas, privacidade, cópias e fontes."],
  ["home.version", "Versión {v}", "Versió {v}", "Version {v}", "Version {v}", "Versão {v}"],
  ["home.openMonth", "Qué abrir este mes", "Què obrir aquest mes", "What to open this month", "Quoi ouvrir ce mois-ci", "O que abrir este mês"],
  ["home.noneMonth", "Nada en su momento este mes.", "Res al seu moment aquest mes.", "Nothing at its moment this month.", "Rien à son moment ce mois-ci.", "Nada no seu momento este mês."],
  ["home.reasonPast", "Pasado su momento óptimo", "Passat el moment òptim", "Past its best", "Passé son meilleur moment", "Passou do momento ideal"],
  ["home.reasonBefore", "Beber antes de {y}", "Beure abans de {y}", "Drink before {y}", "Boire avant {y}", "Beber antes de {y}"],
  ["home.reasonPeak", "En su mejor momento", "En el millor moment", "At its best", "À son apogée", "No seu melhor momento"],
  ["home.stockOne", "Queda 1 botella de {name}", "Queda 1 ampolla de {name}", "1 bottle left of {name}", "Plus qu'une bouteille de {name}", "Resta 1 garrafa de {name}"],
  ["home.see", "Ver ficha", "Veure fitxa", "Open wine", "Voir la fiche", "Ver ficha"],
  ["home.hide", "Ocultar", "Amagar", "Hide", "Masquer", "Ocultar"],
  ["home.tempHigh", "Temperatura elevada", "Temperatura elevada", "Temperature high", "Température élevée", "Temperatura elevada"],
  ["home.tempIdeal", "{t} °C · ideal 12–16 °C", "{t} °C · ideal 12–16 °C", "{t} °C · ideal 12–16 °C", "{t} °C · idéal 12–16 °C", "{t} °C · ideal 12–16 °C"],
  ["home.window", "Ventana de consumo", "Finestra de consum", "Drinking window", "Fenêtre de consommation", "Janela de consumo"],
  ["home.lowStock", "Stock bajo", "Estoc baix", "Low stock", "Stock bas", "Stock baixo"],
  ["home.pendingInfo", "Información pendiente", "Informació pendent", "Missing details", "Information manquante", "Informação em falta"],
  ["home.noBin", "Sin hueco", "Sense forat", "No slot", "Sans emplacement", "Sem lugar"],
  ["home.noTaste", "Sin cata personal", "Sense tast personal", "No personal tasting", "Sans dégustation personnelle", "Sem prova pessoal"],
  ["home.alerts", "Alertas", "Alertes", "Alerts", "Alertes", "Alertas"],
  ["home.noneUrgent", "Sin urgencias.", "Sense urgències.", "Nothing urgent.", "Rien d'urgent.", "Sem urgências."],
  ["home.oneUd", "1 ud", "1 u.", "1 bt", "1 u.", "1 un."],
  ["cal.now", "Beber ahora", "Beure ara", "Drink now", "À boire maintenant", "Beber agora"],
  ["cal.soon", "Beber pronto", "Beure aviat", "Drink soon", "À boire bientôt", "Beber em breve"],
  ["cal.wait", "Aguardar", "Esperar", "Wait", "Attendre", "Aguardar"],
  ["cal.late", "Riesgo de declive", "Risc de declivi", "Past its peak", "Risque de déclin", "Risco de declínio"],
  ["cal.until", "Beber hasta {y}", "Beure fins a {y}", "Drink until {y}", "Boire jusqu'en {y}", "Beber até {y}"],
  ["cal.untilUnknown", "Beber hasta sin dato", "Beure fins a sense dada", "Drink-until unknown", "Boire jusqu'à : inconnu", "Beber até: sem dado"],
  ["cal.peakAria", "Apogeo de {a} a {b}. Año actual {y}.", "Apogeu de {a} a {b}. Any actual {y}.", "Peak from {a} to {b}. Current year {y}.", "Apogée de {a} à {b}. Année en cours {y}.", "Apogeu de {a} a {b}. Ano atual {y}."],
  ["cal.year", "Año {y}", "Any {y}", "Year {y}", "Année {y}", "Ano {y}"],
  ["phase.nodata", "Sin dato", "Sense dada", "No data", "Sans donnée", "Sem dado"],
  ["phase.wait", "Aguardar", "Esperar", "Wait", "Attendre", "Aguardar"],
  ["phase.waitHint", "Todavía gana en botella", "Encara guanya en ampolla", "Still improving in bottle", "Gagne encore en bouteille", "Ainda ganha na garrafa"],
  ["phase.late", "En declive", "En declivi", "In decline", "En déclin", "Em declínio"],
  ["phase.lateHint", "Riesgo de fatiga", "Risc de fatiga", "Risk of fading", "Risque de fatigue", "Risco de fadiga"],
  ["phase.warn", "Beber pronto", "Beure aviat", "Drink soon", "À boire bientôt", "Beber em breve"],
  ["phase.warnHint", "Últimos años de meseta", "Últims anys de meseta", "Last years of the plateau", "Dernières années de plateau", "Últimos anos de patamar"],
  ["phase.open", "Se puede abrir", "Es pot obrir", "Can be opened", "Peut être ouvert", "Pode abrir-se"],
  ["phase.openHint", "Antes del apogeo", "Abans de l'apogeu", "Before the peak", "Avant l'apogée", "Antes do apogeu"],
  ["phase.peak", "En apogeo", "En apogeu", "At its peak", "À l'apogée", "No apogeu"],
  ["phase.peakHint", "Ventana ideal", "Finestra ideal", "Ideal window", "Fenêtre idéale", "Janela ideal"],
  ["years.many", "Quedan {n} años", "Queden {n} anys", "{n} years left", "Encore {n} ans", "Faltam {n} anos"],
  ["years.one", "Queda 1 año", "Queda 1 any", "1 year left", "Encore 1 an", "Falta 1 ano"],
  ["years.last", "Último año", "Últim any", "Final year", "Dernière année", "Último ano"],
  ["years.past", "Pasado de fecha", "Passat de data", "Past its date", "Date dépassée", "Fora de prazo"],
  ["nodata", "Sin dato", "Sense dada", "No data", "Sans donnée", "Sem dado"],
  ["type.todos", "Todos", "Tots", "All", "Tous", "Todos"],
  ["type.tinto", "Tinto", "Negre", "Red", "Rouge", "Tinto"],
  ["type.blanco", "Blanco", "Blanc", "White", "Blanc", "Branco"],
  ["type.espumoso", "Espumoso", "Escumós", "Sparkling", "Effervescent", "Espumante"],
  ["type.rosado", "Rosado", "Rosat", "Rosé", "Rosé", "Rosé"],
  ["type.dulce", "Dulce", "Dolç", "Sweet", "Doux", "Doce"],
  ["type.generoso", "Generoso", "Generós", "Fortified", "Vin de liqueur", "Generoso"],
  ["type.otro", "Otro", "Altre", "Other", "Autre", "Outro"],
  ["type.word", "Tipo", "Tipus", "Type", "Type", "Tipo"],
  ["grape.label", "Uva", "Raïm", "Grape", "Cépage", "Casta"],
  ["grape.all", "Todas las uvas", "Tots els raïms", "All grapes", "Tous les cépages", "Todas as castas"],
  ["search.cellar", "Buscar en cava y catálogo…", "Cercar al celler i al catàleg…", "Search cellar and catalogue…", "Chercher dans la cave et le catalogue…", "Procurar na adega e no catálogo…"],
  ["search.inbox", "Buscar en entradas…", "Cercar a les entrades…", "Search intakes…", "Chercher dans les entrées…", "Procurar nas entradas…"],
  ["search.pair", "Vino, bodega o plato…", "Vi, celler o plat…", "Wine, estate or dish…", "Vin, domaine ou plat…", "Vinho, produtor ou prato…"],
  ["search.zone", "Rioja, Douro, Champagne, Napa…", "Rioja, Douro, Champagne, Napa…", "Rioja, Douro, Champagne, Napa…", "Rioja, Douro, Champagne, Napa…", "Rioja, Douro, Champagne, Napa…"],
  ["search.scan", "O escribe bodega / añada", "O escriu celler / anyada", "Or type estate / vintage", "Ou saisissez domaine / millésime", "Ou escreva produtor / colheita"],
  ["filter.owned", "Solo lo que tengo", "Només el que tinc", "Only what I own", "Seulement ce que j'ai", "Só o que tenho"],
  ["filter.ready", "Listo para beber", "Llest per beure", "Ready to drink", "Prêt à boire", "Pronto a beber"],
  ["cellar.bottles", "Botellas", "Ampolles", "Bottles", "Bouteilles", "Garrafas"],
  ["cellar.producers", "Productores", "Productors", "Producers", "Producteurs", "Produtores"],
  ["cellar.lots", "Lotes", "Lots", "Lots", "Lots", "Lotes"],
  ["cellar.places", "Ubicaciones", "Ubicacions", "Locations", "Emplacements", "Localizações"],
  ["cellar.empty", "La cava está vacía. Escanea o añade a mano.", "El celler és buit. Escaneja o afegeix a mà.", "The cellar is empty. Scan or add by hand.", "La cave est vide. Scannez ou ajoutez à la main.", "A adega está vazia. Digitalize ou acrescente à mão."],
  ["cellar.none", "Sin coincidencias para «{q}»{extra}.", "Sense coincidències per a «{q}»{extra}.", "No matches for «{q}»{extra}.", "Aucun résultat pour «{q}»{extra}.", "Sem resultados para «{q}»{extra}."],
  ["cellar.inType", " en {type}", " a {type}", " in {type}", " dans {type}", " em {type}"],
  ["cellar.catalog", "En catálogo, no en cava", "Al catàleg, no al celler", "In the catalogue, not in the cellar", "Au catalogue, pas en cave", "No catálogo, não na adega"],
  ["cellar.badge", "Catálogo", "Catàleg", "Catalogue", "Catalogue", "Catálogo"],
  ["cellar.noBand", "sin horquilla", "sense forquilla", "no range", "sans fourchette", "sem intervalo"],
  ["cellar.remove", "Quitar", "Treure", "Remove", "Retirer", "Retirar"],
  ["cellar.removeLot", "Quitar lote", "Treure lot", "Remove lot", "Retirer le lot", "Retirar lote"],
  ["cellar.removeList", "Quitar del listado", "Treure del llistat", "Remove from list", "Retirer de la liste", "Retirar da lista"],
  ["cellar.binHidden", "hueco oculto", "forat ocult", "slot hidden", "emplacement masqué", "lugar oculto"],
  ["cellar.noBin", "sin hueco", "sense forat", "no slot", "sans emplacement", "sem lugar"],
  ["cellar.ud", "ud", "u.", "bt", "u.", "un."],
  ["caves.h1", "Vinotecas", "Vinoteques", "Cellars", "Caves", "Adegas"],
  ["caves.sub", "Gestión de cava privada", "Gestió de celler privat", "Private cellar care", "Gestion de cave privée", "Gestão de adega privada"],
  ["caves.add", "Añadir vinoteca", "Afegir vinoteca", "Add a cellar", "Ajouter une cave", "Adicionar adega"],
  ["caves.motto", "Colección privada · Control preciso · Conservación perfecta", "Col·lecció privada · Control precís · Conservació perfecta", "Private collection · Precise control · Careful keeping", "Collection privée · Contrôle précis · Conservation soignée", "Coleção privada · Controlo preciso · Conservação cuidada"],
  ["caves.prestige", "Prestigiosas", "Prestigioses", "Prestige", "Prestige", "Prestígio"],
  ["caves.keeping", "De guarda", "De guarda", "For ageing", "De garde", "De estágio"],
  ["caves.reserve", " · reserva de las botellas más caras", " · reserva de les ampolles més cares", " · reserve for the finest bottles", " · réserve des bouteilles les plus précieuses", " · reserva das garrafas mais valiosas"],
  ["caves.temp", "Temperatura", "Temperatura", "Temperature", "Température", "Temperatura"],
  ["caves.high", "Zona alta °C", "Zona alta °C", "Upper zone °C", "Zone haute °C", "Zona alta °C"],
  ["caves.low", "Zona baja °C", "Zona baixa °C", "Lower zone °C", "Zone basse °C", "Zona baixa °C"],
  ["caves.humidity", "Humedad %", "Humitat %", "Humidity %", "Humidité %", "Humidade %"],
  ["caves.saveTemp", "Modificar temperatura", "Modificar temperatura", "Save temperature", "Modifier la température", "Alterar temperatura"],
  ["caves.map", "Mapa de huecos", "Mapa de forats", "Slot map", "Plan des emplacements", "Mapa de lugares"],
  ["caves.addSlots", "Añadir espacios", "Afegir espais", "Add slots", "Ajouter des emplacements", "Adicionar lugares"],
  ["caves.retire", "Dar de baja esta vinoteca", "Donar de baixa aquesta vinoteca", "Retire this cellar", "Retirer cette cave", "Dar baixa desta adega"],
  ["caves.notIn", "Este vino no está en una vinoteca", "Aquest vi no és en una vinoteca", "This wine is not in a cellar", "Ce vin n'est pas dans une cave", "Este vinho não está numa adega"],
  ["caves.badTemp", "Temperatura no válida", "Temperatura no vàlida", "Temperature not valid", "Température non valide", "Temperatura inválida"],
  ["caves.savedTemp", "Temperatura guardada · {t} °C", "Temperatura desada · {t} °C", "Temperature saved · {t} °C", "Température enregistrée · {t} °C", "Temperatura guardada · {t} °C"],
  ["caves.created", "Vinoteca creada", "Vinoteca creada", "Cellar created", "Cave créée", "Adega criada"],
  ["caves.keepOne", "Deja al menos una vinoteca", "Deixa almenys una vinoteca", "Keep at least one cellar", "Gardez au moins une cave", "Deixe pelo menos uma adega"],
  ["caves.retired", "Vinoteca dada de baja", "Vinoteca donada de baixa", "Cellar retired", "Cave retirée", "Adega dada de baixa"],
  ["caves.slotsAdded", "{n} espacios añadidos", "{n} espais afegits", "{n} slots added", "{n} emplacements ajoutés", "{n} lugares adicionados"],
  ["caves.noSlot", "No hay espacio para asignar", "No hi ha espai per assignar", "No slot to assign", "Aucun emplacement à assigner", "Não há lugar para atribuir"],
  ["caves.slotExists", "Ese espacio ya está en esta vinoteca", "Aquest espai ja és en aquesta vinoteca", "That slot is already in this cellar", "Cet emplacement est déjà dans cette cave", "Esse lugar já está nesta adega"],
  ["caves.slotAssigned", "Espacio {code} asignado", "Espai {code} assignat", "Slot {code} assigned", "Emplacement {code} assigné", "Lugar {code} atribuído"],
  ["caves.slotHint", "{name} · {n} espacios. El siguiente sigue el orden E-01, E-02…", "{name} · {n} espais. El següent segueix l'ordre E-01, E-02…", "{name} · {n} slots. The next follows E-01, E-02…", "{name} · {n} emplacements. Le suivant suit E-01, E-02…", "{name} · {n} lugares. O seguinte segue E-01, E-02…"],
  ["zones.h1", "Zonas vinícolas", "Zones vinícoles", "Wine regions", "Régions viticoles", "Regiões vinícolas"],
  ["zones.hint", "Placa grabada de cada zona. El nombre va debajo del mapa.", "Placa gravada de cada zona. El nom va sota el mapa.", "An engraved plate for each region. The name sits under the map.", "Une plaque gravée pour chaque région. Le nom est sous la carte.", "Uma placa gravada de cada região. O nome fica sob o mapa."],
  ["zones.none", "Ninguna zona con ese nombre.", "Cap zona amb aquest nom.", "No region by that name.", "Aucune région sous ce nom.", "Nenhuma região com esse nome."],
  ["zones.wines", "{n} vinos", "{n} vins", "{n} wines", "{n} vins", "{n} vinhos"],
  ["zones.wine1", "1 vino", "1 vi", "1 wine", "1 vin", "1 vinho"],
  ["zones.inCatalog", "{n} vinos en catálogo", "{n} vins al catàleg", "{n} wines in the catalogue", "{n} vins au catalogue", "{n} vinhos no catálogo"],
  ["zones.inCatalog1", "1 vino en catálogo", "1 vi al catàleg", "1 wine in the catalogue", "1 vin au catalogue", "1 vinho no catálogo"],
  ["zones.empty", "Aún no hay botellas de esta zona.", "Encara no hi ha ampolles d'aquesta zona.", "No bottles from this region yet.", "Pas encore de bouteilles de cette région.", "Ainda não há garrafas desta região."],
  ["zones.estateMap", "Mapa de bodega ›", "Mapa de celler ›", "Estate map ›", "Carte du domaine ›", "Mapa do produtor ›"],
  ["zones.back", "Zonas", "Zones", "Regions", "Régions", "Regiões"],
  ["country.España", "España", "Espanya", "Spain", "Espagne", "Espanha"],
  ["country.Portugal", "Portugal", "Portugal", "Portugal", "Portugal", "Portugal"],
  ["country.Francia", "Francia", "França", "France", "France", "França"],
  ["country.Italia", "Italia", "Itàlia", "Italy", "Italie", "Itália"],
  ["country.Argentina", "Argentina", "Argentina", "Argentina", "Argentine", "Argentina"],
  ["country.Australia", "Australia", "Austràlia", "Australia", "Australie", "Austrália"],
  ["country.Alemania", "Alemania", "Alemanya", "Germany", "Allemagne", "Alemanha"],
  ["country.California", "California", "Califòrnia", "California", "Californie", "Califórnia"],
  ["pair.h1", "Maridajes", "Maridatges", "Pairings", "Accords", "Harmonizações"],
  ["pair.lead", "Explora armonías pensadas para cada momento.", "Explora harmonies pensades per a cada moment.", "Harmonies chosen for each moment.", "Des accords pensés pour chaque moment.", "Harmonias pensadas para cada momento."],
  ["pair.catalog", "Catálogo", "Catàleg", "Catalogue", "Catalogue", "Catálogo"],
  ["pair.yours", "Tu cava", "El teu celler", "Your cellar", "Votre cave", "A sua adega"],
  ["pair.byDish", "Por plato", "Per plat", "By dish", "Par plat", "Por prato"],
  ["pair.ofWine", "Maridajes de este vino", "Maridatges d'aquest vi", "Pairings for this wine", "Accords de ce vin", "Harmonizações deste vinho"],
  ["pair.service", "Servicio en mesa", "Servei a taula", "At the table", "Service à table", "Serviço à mesa"],
  ["pair.avoid", "Evitar: {list}", "Evitar: {list}", "Avoid: {list}", "À éviter : {list}", "Evitar: {list}"],
  ["pair.inCellar", "lo tienes en vinoteca", "el tens a la vinoteca", "you have it in the cellar", "vous l'avez en cave", "tem-no na adega"],
  ["pair.explore", "Explorar todos los maridajes", "Explorar tots els maridatges", "Browse every pairing", "Voir tous les accords", "Explorar todas as harmonizações"],
  ["pair.wines", "{n} vinos ›", "{n} vins ›", "{n} wines ›", "{n} vins ›", "{n} vinhos ›"],
  ["pair.wine1", "1 vino ›", "1 vi ›", "1 wine ›", "1 vin ›", "1 vinho ›"],
  ["pair.best", "Mejor encaje: {label} · {score} ›", "Millor encaix: {label} · {score} ›", "Best match: {label} · {score} ›", "Meilleur accord : {label} · {score} ›", "Melhor encaixe: {label} · {score} ›"],
  ["pair.seeWines", "Ver vinos del plato", "Veure vins del plat", "Wines for this dish", "Vins pour ce plat", "Vinhos deste prato"],
  ["pair.noDish", "Sin platos con ese nombre.", "Cap plat amb aquest nom.", "No dish by that name.", "Aucun plat sous ce nom.", "Nenhum prato com esse nome."],
  ["pair.none", "Sin coincidencias.", "Sense coincidències.", "No matches.", "Aucun résultat.", "Sem resultados."],
  ["pair.sheet", "ficha", "fitxa", "sheet", "fiche", "ficha"],
  ["pair.now", "En tu vinoteca ahora", "A la teva vinoteca ara", "In your cellar now", "Dans votre cave maintenant", "Na sua adega agora"],
  ["pair.noneStock", "Ninguna botella de este maridaje está en stock. Abajo, el catálogo.", "Cap ampolla d'aquest maridatge és en estoc. A sota, el catàleg.", "None of these pairings are in stock. The catalogue is below.", "Aucune bouteille de cet accord n'est en stock. Le catalogue est plus bas.", "Nenhuma garrafa desta harmonização está em stock. O catálogo fica abaixo."],
  ["pair.rank", "Ranking por encaje", "Rànquing per encaix", "Ranked by fit", "Classement par accord", "Ranking por encaixe"],
  ["pair.youHave", "lo tienes", "el tens", "you have it", "vous l'avez", "tem-no"],
  ["pair.noWines", "Aún no hay vinos enlazados a este plato.", "Encara no hi ha vins enllaçats a aquest plat.", "No wines linked to this dish yet.", "Aucun vin lié à ce plat pour l'instant.", "Ainda não há vinhos ligados a este prato."],
  ["pair.rule", "Regla de mesa", "Regla de taula", "Table rule", "Règle de table", "Regra de mesa"],
  ["pair.filters", "Filtros: {list}", "Filtres: {list}", "Filters: {list}", "Filtres : {list}", "Filtros: {list}"],
  ["pair.dish", "Plato", "Plat", "Dish", "Plat", "Prato"],
  ["dish.cordero", "Cordero y lechazo", "Xai i lletó", "Lamb", "Agneau", "Cordeiro"],
  ["dish.caza", "Caza", "Caça", "Game", "Gibier", "Caça"],
  ["dish.buey", "Buey, chuletón, solomillo", "Bou, txuletón i filet", "Beef steak", "Bœuf, côte, filet", "Vaca, costela, filete"],
  ["dish.aves", "Aves y pichón", "Aus i colomí", "Poultry and squab", "Volaille et pigeonneau", "Aves e borracho"],
  ["dish.cerdo", "Ibérico y embutido", "Ibèric i embotit", "Ibérico and charcuterie", "Ibérique et charcuterie", "Ibérico e enchidos"],
  ["dish.estofado", "Estofados y carrillera", "Estofats i galta", "Stews and cheek", "Mijotés et joue", "Estufados e bochecha"],
  ["dish.marisco", "Marisco y ostras", "Marisc i ostres", "Shellfish and oysters", "Fruits de mer et huîtres", "Marisco e ostras"],
  ["dish.pescado-blanco", "Pescado blanco", "Peix blanc", "White fish", "Poisson blanc", "Peixe branco"],
  ["dish.pescado-graso", "Pescado azul", "Peix blau", "Oily fish", "Poisson gras", "Peixe gordo"],
  ["dish.arroz", "Arroces y risotto", "Arròs i risotto", "Rice and risotto", "Riz et risotto", "Arroz e risoto"],
  ["dish.pasta", "Pasta", "Pasta", "Pasta", "Pâtes", "Massa"],
  ["dish.setas", "Setas y bosque", "Bolets i bosc", "Mushrooms", "Champignons", "Cogumelos"],
  ["dish.ensalada", "Ensaladas y crudos", "Amanides i crus", "Salads and raw dishes", "Salades et cru", "Saladas e crus"],
  ["dish.queso-tierno", "Queso tierno / pasta blanda", "Formatge tendre", "Soft cheese", "Fromage à pâte molle", "Queijo de pasta mole"],
  ["dish.queso-curado", "Queso curado y viejo", "Formatge curat", "Aged cheese", "Fromage affiné", "Queijo curado"],
  ["dish.legumbres", "Legumbres", "Llegums", "Pulses", "Légumineuses", "Leguminosas"],
  ["dish.chocolate", "Chocolate negro", "Xocolata negra", "Dark chocolate", "Chocolat noir", "Chocolate negro"],
  ["dish.sashimi", "Sashimi y crudo fino", "Sashimi i cru fi", "Sashimi", "Sashimi", "Sashimi"],
  ["family.carnes", "Carnes", "Carns", "Meat", "Viandes", "Carnes"],
  ["family.cured", "Curados", "Curats", "Cured", "Salaisons", "Curados"],
  ["family.mar", "Mar", "Mar", "Sea", "Mer", "Mar"],
  ["family.cereal", "Cereal", "Cereal", "Grains", "Céréales", "Cereais"],
  ["family.vegetal", "Vegetal", "Vegetal", "Vegetables", "Végétal", "Vegetal"],
  ["family.queso", "Queso", "Formatge", "Cheese", "Fromage", "Queijo"],
  ["family.postre", "Postre", "Postres", "Dessert", "Dessert", "Sobremesa"],
  ["heat.cordero", "asado / parrilla", "rostit / brasa", "roast / grill", "rôti / grill", "assado / grelha"],
  ["heat.caza", "guiso / asado", "guisat / rostit", "stew / roast", "mijoté / rôti", "guisado / assado"],
  ["heat.buey", "parrilla", "brasa", "grill", "grill", "grelha"],
  ["heat.aves", "asado", "rostit", "roast", "rôti", "assado"],
  ["heat.cerdo", "frío / plancha", "fred / planxa", "cold / griddle", "froid / plancha", "frio / chapa"],
  ["heat.estofado", "lento", "lent", "slow", "mijotage", "lento"],
  ["heat.marisco", "crudo / vapor", "cru / vapor", "raw / steamed", "cru / vapeur", "cru / vapor"],
  ["heat.pescado-blanco", "plancha / horno", "planxa / forn", "griddle / oven", "plancha / four", "chapa / forno"],
  ["heat.pescado-graso", "plancha", "planxa", "griddle", "plancha", "chapa"],
  ["heat.arroz", "caldo", "brou", "broth", "bouillon", "caldo"],
  ["heat.pasta", "salsa", "salsa", "sauce", "sauce", "molho"],
  ["heat.setas", "salteado", "saltat", "sautéed", "sauté", "salteado"],
  ["heat.ensalada", "frío", "fred", "cold", "froid", "frio"],
  ["heat.queso-tierno", "frío", "fred", "cold", "froid", "frio"],
  ["heat.queso-curado", "frío", "fred", "cold", "froid", "frio"],
  ["heat.legumbres", "guiso", "guisat", "stew", "mijoté", "guisado"],
  ["heat.chocolate", "frío", "fred", "cold", "froid", "frio"],
  ["heat.sashimi", "crudo", "cru", "raw", "cru", "cru"],
  ["rule.0.t", "Tanino pide grasa y proteína", "El taní demana greix i proteïna", "Tannin wants fat and protein", "Le tanin demande du gras et des protéines", "O tanino pede gordura e proteína"],
  ["rule.0.d", "Un tinto estructurado limpia la boca si hay grasa intramuscular o piel asada. Sin grasa, el tanino amarga.", "Un negre estructurat neteja la boca si hi ha greix intramuscular o pell rostida. Sense greix, el taní amarga.", "A structured red clears the palate when there is intramuscular fat or roasted skin. Without fat, the tannin turns bitter.", "Un rouge structuré nettoie la bouche s'il y a du gras intramusculaire ou une peau rôtie. Sans gras, le tanin amertume.", "Um tinto estruturado limpa a boca se houver gordura intramuscular ou pele assada. Sem gordura, o tanino amarga."],
  ["rule.1.t", "Acidez pide yodo o salsa", "L'acidesa demana iode o salsa", "Acidity wants iodine or sauce", "L'acidité demande de l'iode ou une sauce", "A acidez pede iodo ou molho"],
  ["rule.1.d", "Albariño, champagne y rioja clásico funcionan con marisco, tomate o vinagreta suave porque la acidez sustituye al limón.", "L'albariño, el champagne i el rioja clàssic funcionen amb marisc, tomàquet o vinagreta suau perquè l'acidesa substitueix la llimona.", "Albariño, champagne and classic Rioja work with shellfish, tomato or a light vinaigrette because the acidity stands in for lemon.", "L'albariño, le champagne et le rioja classique vont avec les fruits de mer, la tomate ou une vinaigrette douce : l'acidité remplace le citron.", "O albariño, o champagne e o rioja clássico funcionam com marisco, tomate ou vinagrete suave porque a acidez substitui o limão."],
  ["rule.2.t", "Burbuja desengrasa", "La bombolla desgreixa", "Bubbles cut the fat", "La bulle dégraisse", "A bolha desengordura"],
  ["rule.2.d", "Corpinnat y champagne cortan fritura, hojaldre y queso blando. Copa ancha, no flauta.", "El Corpinnat i el champagne tallen fregit, pasta de full i formatge tou. Copa ampla, no flauta.", "Corpinnat and champagne cut fried food, pastry and soft cheese. Use a wide glass, not a flute.", "Le Corpinnat et le champagne coupent le frit, le feuilleté et le fromage mou. Verre large, pas une flûte.", "O Corpinnat e o champagne cortam fritos, massa folhada e queijo macio. Copo largo, não flûte."],
  ["rule.3.t", "Madera pide cocina de horno", "La fusta demana cuina de forn", "Oak wants oven cooking", "Le bois demande une cuisine de four", "A madeira pede cozinha de forno"],
  ["rule.3.d", "Blancos con barrica van a merluza en salsa, ave asada o risotto, no a ostra fría.", "Els blancs amb bóta van a lluç amb salsa, au rostida o risotto, no a l'ostra freda.", "Barrel-aged whites belong with hake in sauce, roast poultry or risotto, not a cold oyster.", "Les blancs élevés en fût vont à la sauce de merlu, à la volaille rôtie ou au risotto, pas à l'huître froide.", "Brancos com estágio em madeira pedem pescada de molho, ave assada ou risoto, não ostra fria."],
  ["rule.4.t", "No cruce de mundos", "No barregis mons", "Do not cross worlds", "Ne mélangez pas les mondes", "Não cruze mundos"],
  ["rule.4.d", "Un icono de guarda no va con picante, curry ni postre dulce. Rosado y albariño no van con caza mayor.", "Una icona de guarda no va amb picant, curry ni postres dolços. El rosat i l'albariño no van amb caça major.", "An ageing icon does not belong with chilli, curry or a sweet pudding. Rosé and albariño do not belong with large game.", "Une icône de garde ne va pas avec le piment, le curry ni un dessert sucré. Rosé et albariño ne vont pas avec le grand gibier.", "Um ícone de estágio não combina com picante, caril nem sobremesa doce. O rosé e o albariño não vão com caça maior."],
  ["scan.h1", "Escanear", "Escanejar", "Scan", "Scanner", "Digitalizar"],
  ["scan.label", "Etiqueta", "Etiqueta", "Label", "Étiquette", "Rótulo"],
  ["scan.labelSub", "Cámara. Lee la etiqueta, crea la ficha y reserva el hueco en altas pendientes.", "Càmera. Llegeix l'etiqueta, crea la fitxa i reserva el forat a les altes pendents.", "Camera. It reads the label, builds the sheet and reserves a slot in pending intakes.", "Appareil photo. Il lit l'étiquette, crée la fiche et réserve l'emplacement dans les entrées en attente.", "Câmara. Lê o rótulo, cria a ficha e reserva o lugar nas altas pendentes."],
  ["scan.roll", "Carta o lineal", "Carta o lineal", "List or shelf", "Carte ou linéaire", "Carta ou prateleira"],
  ["scan.rollSub", "Foto del carrete. Lee la etiqueta, busca el vino en internet y puedes confirmar la ficha.", "Foto del carret. Llegeix l'etiqueta, busca el vi a internet i pots confirmar la fitxa.", "A photo from the roll. It reads the label, looks the wine up and you can confirm the sheet.", "Photo de la pellicule. Elle lit l'étiquette, cherche le vin et vous pouvez confirmer la fiche.", "Foto do rolo. Lê o rótulo, procura o vinho e pode confirmar a ficha."],
  ["scan.open", "Abrir cámara", "Obrir càmera", "Open camera", "Ouvrir l'appareil", "Abrir câmara"],
  ["scan.photos", "Elegir de fotos", "Triar de fotos", "Choose from photos", "Choisir dans les photos", "Escolher das fotos"],
  ["scan.manual", "Alta manual", "Alta manual", "Add by hand", "Saisie manuelle", "Alta manual"],
  ["scan.finder", "Cámara · etiqueta en vertical", "Càmera · etiqueta en vertical", "Camera · label upright", "Appareil · étiquette à la verticale", "Câmara · rótulo na vertical"],
  ["scan.tap", "Toca para abrir la cámara", "Toca per obrir la càmera", "Tap to open the camera", "Touchez pour ouvrir l'appareil", "Toque para abrir a câmara"],
  ["scan.aria", "Escanear", "Escanejar", "Scan", "Scanner", "Digitalizar"],
  ["scan.alt", "Etiqueta capturada", "Etiqueta capturada", "Captured label", "Étiquette capturée", "Rótulo capturado"],
  ["inbox.h1", "Entradas", "Entrades", "Intakes", "Entrées", "Entradas"],
  ["inbox.lead", "Fichas ya creadas que aún no están en la bodega. El hueco reservado se ve aquí y en la hoja de la vinoteca.", "Fitxes ja creades que encara no són al celler. El forat reservat es veu aquí i al full de la vinoteca.", "Sheets already created that are not in the cellar yet. The reserved slot shows here and on the cellar page.", "Fiches déjà créées qui ne sont pas encore en cave. L'emplacement réservé se voit ici et sur la feuille de la cave.", "Fichas já criadas que ainda não estão na adega. O lugar reservado vê-se aqui e na folha da adega."],
  ["inbox.empty", "Aún no hay altas pendientes. Escanea una etiqueta, elige una foto o da de alta a mano.", "Encara no hi ha altes pendents. Escaneja una etiqueta, tria una foto o dona d'alta a mà.", "No pending intakes yet. Scan a label, choose a photo or add by hand.", "Pas encore d'entrées en attente. Scannez une étiquette, choisissez une photo ou saisissez à la main.", "Ainda não há altas pendentes. Digitalize um rótulo, escolha uma foto ou dê alta à mão."],
  ["inbox.none", "Ninguna entrada coincide. Borra la búsqueda para ver el listado.", "Cap entrada coincideix. Esborra la cerca per veure el llistat.", "No intake matches. Clear the search to see the list.", "Aucune entrée ne correspond. Effacez la recherche pour voir la liste.", "Nenhuma entrada coincide. Apague a procura para ver a lista."],
  ["inbox.read", "Vino leído", "Vi llegit", "Wine read", "Vin lu", "Vinho lido"],
  ["inbox.inCellar", "En bodega", "Al celler", "In the cellar", "En cave", "Na adega"],
  ["inbox.pending", "Pendiente", "Pendent", "Pending", "En attente", "Pendente"],
  ["inbox.where", "En bodega · {cave} · {bin}", "Al celler · {cave} · {bin}", "In the cellar · {cave} · {bin}", "En cave · {cave} · {bin}", "Na adega · {cave} · {bin}"],
  ["inbox.slot", "Hueco pendiente · {cave} · {bin}", "Forat pendent · {cave} · {bin}", "Slot pending · {cave} · {bin}", "Emplacement en attente · {cave} · {bin}", "Lugar pendente · {cave} · {bin}"],
  ["inbox.enter", "Introducir en el hueco", "Introduir al forat", "Place in the slot", "Mettre à l'emplacement", "Colocar no lugar"],
  ["inbox.sheet", "Ficha", "Fitxa", "Sheet", "Fiche", "Ficha"],
  ["inbox.delete", "Eliminar", "Eliminar", "Delete", "Supprimer", "Eliminar"],
  ["inbox.another", "Escanear otra", "Escanejar-ne una altra", "Scan another", "Scanner une autre", "Digitalizar outra"],
  ["inbox.confirm", "Eliminar esta lectura{extra} del listado?", "Eliminar aquesta lectura{extra} del llistat?", "Delete this reading{extra} from the list?", "Supprimer cette lecture{extra} de la liste ?", "Eliminar esta leitura{extra} da lista?"],
  ["inbox.of", " de {name}", " de {name}", " of {name}", " de {name}", " de {name}"],
  ["inbox.deleted", "Lectura eliminada", "Lectura eliminada", "Reading deleted", "Lecture supprimée", "Leitura eliminada"],
  ["inbox.missing", "Ficha no encontrada", "Fitxa no trobada", "Sheet not found", "Fiche introuvable", "Ficha não encontrada"],
  ["inbox.reserved", "Hueco reservado {bin} · {cave}. Confirma cuando la botella esté en ese espacio.", "Forat reservat {bin} · {cave}. Confirma quan l'ampolla sigui en aquest espai.", "Slot reserved {bin} · {cave}. Confirm when the bottle is in that space.", "Emplacement réservé {bin} · {cave}. Confirmez quand la bouteille y est.", "Lugar reservado {bin} · {cave}. Confirme quando a garrafa estiver nesse espaço."],
  ["src.photo", "Fototeca", "Fototeca", "Photo library", "Photothèque", "Fototeca"],
  ["src.manual", "Manual", "Manual", "By hand", "Manuelle", "Manual"],
  ["src.camera", "Cámara", "Càmera", "Camera", "Appareil", "Câmara"],
  ["cal.h1", "Cuándo abrirlo", "Quan obrir-lo", "When to open it", "Quand l'ouvrir", "Quando o abrir"],
  ["catas.h1", "Catas", "Tastos", "Tastings", "Dégustations", "Provas"],
  ["catas.noneNote", "Cuaderno sin recuerdo", "Quadern sense record", "Notebook without a note", "Carnet sans souvenir", "Caderno sem nota"],
  ["catas.empty", "Todavía no hay catas. Usa Cata rápida.", "Encara no hi ha tastos. Fes servir Tast ràpid.", "No tastings yet. Use Quick tasting.", "Pas encore de dégustations. Utilisez Dégustation rapide.", "Ainda não há provas. Use Prova rápida."],
  ["drinks.h1", "Bebidas", "Begudes", "Drinks", "Consommés", "Bebidas"],
  ["drinks.lead", "Lo que sale de la cava se queda aquí, con su motivo.", "El que surt del celler es queda aquí, amb el seu motiu.", "What leaves the cellar stays here, with its reason.", "Ce qui sort de la cave reste ici, avec son motif.", "O que sai da adega fica aqui, com o motivo."],
  ["drinks.empty", "Aún no hay salidas de la cava.", "Encara no hi ha sortides del celler.", "Nothing has left the cellar yet.", "Aucune sortie de cave pour l'instant.", "Ainda não há saídas da adega."],
  ["drinks.none", "Nada con ese motivo.", "Res amb aquest motiu.", "Nothing with that reason.", "Rien avec ce motif.", "Nada com esse motivo."],
  ["drinks.producer", "Bodega", "Celler", "Estate", "Domaine", "Produtor"],
  ["drinks.wine", "Vino", "Vi", "Wine", "Vin", "Vinho"],
  ["drinks.bottles", "{n} botellas", "{n} ampolles", "{n} bottles", "{n} bouteilles", "{n} garrafas"],
  ["drinks.addTaste", "Añadir cata", "Afegir tast", "Add tasting", "Ajouter une dégustation", "Adicionar prova"],
  ["drinks.edit", "Editar", "Editar", "Edit", "Modifier", "Editar"],
  ["drinks.delete", "Borrar", "Esborrar", "Delete", "Effacer", "Apagar"],
  ["drinks.deleted", "Bebida borrada", "Beguda esborrada", "Drink deleted", "Consommé effacé", "Bebida apagada"],
  ["drinks.updated", "Salida actualizada", "Sortida actualitzada", "Exit updated", "Sortie mise à jour", "Saída atualizada"],
  ["drinks.gone", "Ese lote ya no está", "Aquest lot ja no hi és", "That lot is gone", "Ce lot n'est plus là", "Esse lote já não está"],
  ["drinks.left", "{why} · {n} · quedan {left}", "{why} · {n} · en queden {left}", "{why} · {n} · {left} left", "{why} · {n} · il en reste {left}", "{why} · {n} · ficam {left}"],
  ["drinks.noneLeft", "{why} · {n} · sin botellas", "{why} · {n} · sense ampolles", "{why} · {n} · no bottles left", "{why} · {n} · plus de bouteilles", "{why} · {n} · sem garrafas"],
  ["drinks.howMany", "¿Cuántas sirves de este lote? (hay {n})", "Quantes en serveixes d'aquest lot? (n'hi ha {n})", "How many from this lot? ({n} in it)", "Combien servez-vous de ce lot ? (il y en a {n})", "Quantas serve deste lote? (há {n})"],
  ["reason.todas", "Todas", "Totes", "All", "Toutes", "Todas"],
  ["reason.bebida", "Bebida", "Beguda", "Drunk", "Bue", "Bebida"],
  ["reason.regalada", "Regalada", "Regalada", "Given", "Offerte", "Oferecida"],
  ["reason.defecto", "Defectuosa / corcho", "Defectuosa / suro", "Faulty / cork", "Défaut / bouchon", "Defeituosa / rolha"],
  ["reason.vendida", "Vendida", "Venuda", "Sold", "Vendue", "Vendida"],
  ["reason.otro", "Otro", "Altre", "Other", "Autre", "Outro"],
  ["reason.error", "Error de registro (no contar)", "Error de registre (no comptar)", "Recording error (do not count)", "Erreur de saisie (ne pas compter)", "Erro de registo (não contar)"],
  ["occasion.cena", "Cena", "Sopar", "Dinner", "Dîner", "Jantar"],
  ["occasion.celebracion", "Celebración", "Celebració", "Celebration", "Célébration", "Celebração"],
  ["occasion.cata", "Cata", "Tast", "Tasting", "Dégustation", "Prova"],
  ["occasion.regalo", "Regalo", "Regal", "Gift", "Cadeau", "Presente"],
  ["balance.h1", "Balance", "Balanç", "Balance", "Bilan", "Balanço"],
  ["balance.lead", "Coste de compra frente al valor de mercado estimado.", "Cost de compra davant del valor de mercat estimat.", "Purchase cost against the estimated market value.", "Coût d'achat face à la valeur de marché estimée.", "Custo de compra face ao valor de mercado estimado."],
  ["balance.cost", "Coste", "Cost", "Cost", "Coût", "Custo"],
  ["balance.market", "Mercado", "Mercat", "Market", "Marché", "Mercado"],
  ["balance.diff", "Diferencia", "Diferència", "Difference", "Écart", "Diferença"],
  ["balance.noPct", "Sin porcentaje: falta el coste.", "Sense percentatge: falta el cost.", "No percentage: cost is missing.", "Pas de pourcentage : le coût manque.", "Sem percentagem: falta o custo."],
  ["balance.pct", "{p}% sobre el coste", "{p}% sobre el cost", "{p}% on cost", "{p} % sur le coût", "{p}% sobre o custo"],
  ["balance.byType", "Por tipo", "Per tipus", "By type", "Par type", "Por tipo"],
  ["balance.empty", "La cava está vacía.", "El celler és buit.", "The cellar is empty.", "La cave est vide.", "A adega está vazia."],
  ["balance.gaps", "Mayores diferencias", "Majors diferències", "Largest gaps", "Plus grands écarts", "Maiores diferenças"],
  ["balance.noMarket", "Aún no hay compras con valor de mercado.", "Encara no hi ha compres amb valor de mercat.", "No purchases have a market value yet.", "Aucun achat n'a encore de valeur de marché.", "Ainda não há compras com valor de mercado."],
  ["balance.missing", "{n} botellas sin valor de mercado", "{n} ampolles sense valor de mercat", "{n} bottles without a market value", "{n} bouteilles sans valeur de marché", "{n} garrafas sem valor de mercado"],
  ["balance.missing1", "1 botella sin valor de mercado", "1 ampolla sense valor de mercat", "1 bottle without a market value", "1 bouteille sans valeur de marché", "1 garrafa sem valor de mercado"],
  ["balance.estimate", "Estimar con Gemini", "Estimar amb Gemini", "Estimate with Gemini", "Estimer avec Gemini", "Estimar com o Gemini"],
  ["balance.edit", "Editar", "Editar", "Edit", "Modifier", "Editar"],
  ["balance.allHave", "Todas las botellas tienen valor de mercado.", "Totes les ampolles tenen valor de mercat.", "Every bottle has a market value.", "Toutes les bouteilles ont une valeur de marché.", "Todas as garrafas têm valor de mercado."],
  ["balance.allHaveToast", "Todas tienen valor de mercado", "Totes tenen valor de mercat", "All have a market value", "Toutes ont une valeur de marché", "Todas têm valor de mercado"],
  ["balance.perBt", "€ por botella", "€ per ampolla", "€ per bottle", "€ par bouteille", "€ por garrafa"],
  ["balance.saveValues", "Guardar valores", "Desar valors", "Save values", "Enregistrer les valeurs", "Guardar valores"],
  ["balance.needPrice", "Escribe un precio", "Escriu un preu", "Type a price", "Saisissez un prix", "Escreva um preço"],
  ["balance.saved", "Valores guardados", "Valors desats", "Values saved", "Valeurs enregistrées", "Valores guardados"],
  ["balance.needGemini", "Activa Gemini en Avisos para estimar", "Activa Gemini a Avisos per estimar", "Turn on Gemini in Notices to estimate", "Activez Gemini dans Alertes pour estimer", "Ative o Gemini em Avisos para estimar"],
  ["balance.estimating", "Estimando con Gemini…", "Estimant amb Gemini…", "Estimating with Gemini…", "Estimation avec Gemini…", "A estimar com o Gemini…"],
  ["balance.estimated", "Estimadas {n}", "Estimades {n}", "Estimated {n}", "Estimées {n}", "Estimadas {n}"],
  ["balance.noQuote", "Gemini no ha dado un precio. Puedes editarlo.", "Gemini no ha donat un preu. El pots editar.", "Gemini did not return a price. You can edit it.", "Gemini n'a pas donné de prix. Vous pouvez le modifier.", "O Gemini não deu um preço. Pode editá-lo."],
  ["balance.line", "Coste {c} · mercado {m} · {d}", "Cost {c} · mercat {m} · {d}", "Cost {c} · market {m} · {d}", "Coût {c} · marché {m} · {d}", "Custo {c} · mercado {m} · {d}"],
  ["balance.bot", "bot.", "amp.", "bt", "bt", "gf."],
  ["profile.h1", "Perfil", "Perfil", "Profile", "Profil", "Perfil"],
  ["profile.lead", "Colección, preferencias y configuración", "Col·lecció, preferències i configuració", "Collection, preferences and settings", "Collection, préférences et réglages", "Coleção, preferências e configuração"],
  ["profile.collection", "Colección", "Col·lecció", "Collection", "Collection", "Coleção"],
  ["profile.houseLine", "Mi Vinoteca {house}", "El meu celler {house}", "My cellar {house}", "Ma cave {house}", "A minha adega {house}"],
  ["profile.counts", "{b} botellas · {w} vinos", "{b} ampolles · {w} vins", "{b} bottles · {w} wines", "{b} bouteilles · {w} vins", "{b} garrafas · {w} vinhos"],
  ["profile.bottles", "Botellas", "Ampolles", "Bottles", "Bouteilles", "Garrafas"],
  ["profile.wines", "Vinos", "Vins", "Wines", "Vins", "Vinhos"],
  ["profile.lastCopy", "Última copia de seguridad", "Última còpia de seguretat", "Latest backup", "Dernière copie de sauvegarde", "Última cópia de segurança"],
  ["profile.demo", "Modo demostración", "Mode demostració", "Demo mode", "Mode démonstration", "Modo demonstração"],
  ["profile.demoOut", "Salir", "Sortir", "Leave", "Quitter", "Sair"],
  ["profile.demoHint", "Los vinos de ejemplo no son tu colección real.", "Els vins d'exemple no són la teva col·lecció real.", "The sample wines are not your real collection.", "Les vins d'exemple ne sont pas votre vraie collection.", "Os vinhos de exemplo não são a sua coleção real."],
  ["profile.houses", "Mis casas y vinotecas", "Les meves cases i vinoteques", "My houses and cellars", "Mes maisons et caves", "As minhas casas e adegas"],
  ["profile.housesSub", "Gestionar ubicaciones físicas.", "Gestionar ubicacions físiques.", "Manage physical locations.", "Gérer les emplacements physiques.", "Gerir localizações físicas."],
  ["profile.tastePrefs", "Preferencias de cata", "Preferències de tast", "Tasting preferences", "Préférences de dégustation", "Preferências de prova"],
  ["profile.tastePrefsSub", "Escala 0–{n}. El cuaderno aprobado no cambia.", "Escala 0–{n}. El quadern aprovat no canvia.", "Scale 0–{n}. The approved notebook stays as it is.", "Échelle 0–{n}. Le carnet validé ne change pas.", "Escala 0–{n}. O caderno aprovado não muda."],
  ["profile.sources", "Puntuaciones externas", "Puntuacions externes", "Outside scores", "Notes externes", "Pontuações externas"],
  ["profile.sourcesSub", "Qué guías se ven en la ficha.", "Quines guies es veuen a la fitxa.", "Which guides show on the sheet.", "Quels guides apparaissent sur la fiche.", "Que guias se veem na ficha."],
  ["profile.privacy", "Privacidad y seguridad", "Privadesa i seguretat", "Privacy and security", "Confidentialité et sécurité", "Privacidade e segurança"],
  ["profile.privacySub", "Valor, precios, hueco.", "Valor, preus, forat.", "Value, prices, slot.", "Valeur, prix, emplacement.", "Valor, preços, lugar."],
  ["profile.drinksSub", "Historial de lo servido, por año y mes.", "Historial del que s'ha servit, per any i mes.", "History of what was served, by year and month.", "Historique de ce qui a été servi, par année et par mois.", "Histórico do que foi servido, por ano e mês."],
  ["profile.backup", "Copias de seguridad", "Còpies de seguretat", "Backups", "Copies de sauvegarde", "Cópias de segurança"],
  ["profile.backupSub", "Exportar y restaurar JSON / CSV.", "Exportar i restaurar JSON / CSV.", "Export and restore JSON / CSV.", "Exporter et restaurer JSON / CSV.", "Exportar e restaurar JSON / CSV."],
  ["profile.about", "Acerca de", "Quant a", "About", "À propos", "Acerca de"],
  ["profile.aboutSub", "Versión {v} · esquema localStorage", "Versió {v} · esquema localStorage", "Version {v} · localStorage schema", "Version {v} · schéma localStorage", "Versão {v} · esquema localStorage"],
  ["profile.locations", "Mis ubicaciones", "Les meves ubicacions", "My locations", "Mes emplacements", "As minhas localizações"],
  ["profile.sourcesTitle", "Fuentes externas", "Fonts externes", "Outside sources", "Sources externes", "Fontes externas"],
  ["profile.noCellars", "Sin vinotecas", "Sense vinoteques", "No cellars", "Aucune cave", "Sem adegas"],
  ["profile.houseField", "La casa se indica en el campo Casa. No pedimos dirección postal.", "La casa s'indica al camp Casa. No demanem adreça postal.", "The house is the House field. We do not ask for a postal address.", "La maison se saisit dans le champ Maison. Nous ne demandons pas d'adresse postale.", "A casa indica-se no campo Casa. Não pedimos morada postal."],
  ["profile.houseType", "Casa", "Casa", "House", "Maison", "Casa"],
  ["profile.scale", "Escala principal", "Escala principal", "Main scale", "Échelle principale", "Escala principal"],
  ["profile.scaleHint", "El cuaderno sigue Débil–Ácido / Seco–Dulce / Suave–Tánico / Ligero–Poderoso.", "El quadern segueix Feble–Àcid / Sec–Dolç / Suau–Tànnic / Lleuger–Poderós.", "The notebook still runs Weak–Acid / Dry–Sweet / Soft–Tannic / Light–Powerful.", "Le carnet reste Faible–Acide / Sec–Doux / Souple–Tannique / Léger–Puissant.", "O caderno segue Fraco–Ácido / Seco–Doce / Suave–Tânico / Leve–Poderoso."],
  ["profile.decimals", "Permitir decimales", "Permetre decimals", "Allow decimals", "Autoriser les décimales", "Permitir decimais"],
  ["profile.sourcesHint", "Solo ocultan o muestran la guía. No hay API de Vivino.", "Només amaguen o mostren la guia. No hi ha API de Vivino.", "They only hide or show the guide. Vivino has no API.", "Elles masquent ou montrent seulement le guide. Vivino n'a pas d'API.", "Só ocultam ou mostram o guia. O Vivino não tem API."],
  ["profile.showValue", "Mostrar valor de la colección", "Mostrar el valor de la col·lecció", "Show the collection value", "Afficher la valeur de la collection", "Mostrar o valor da coleção"],
  ["profile.showPrices", "Mostrar precios en las fichas", "Mostrar preus a les fitxes", "Show prices on the sheets", "Afficher les prix sur les fiches", "Mostrar preços nas fichas"],
  ["profile.showBin", "Mostrar hueco exacto", "Mostrar el forat exacte", "Show the exact slot", "Afficher l'emplacement exact", "Mostrar o lugar exacto"],
  ["profile.face", "Face ID", "Face ID", "Face ID", "Face ID", "Face ID"],
  ["profile.faceHint", "En PWA no hay Face ID nativo. Más adelante: PIN o passkey. La colección no se publica.", "En PWA no hi ha Face ID natiu. Més endavant: PIN o passkey. La col·lecció no es publica.", "A PWA has no native Face ID. Later: a PIN or passkey. The collection is not published.", "En PWA, pas de Face ID natif. Plus tard : PIN ou passkey. La collection n'est pas publiée.", "Em PWA não há Face ID nativo. Mais tarde: PIN ou passkey. A coleção não se publica."],
  ["profile.copyOk", "Correcta", "Correcta", "Sound", "Correcte", "Correta"],
  ["profile.copyDue", "Pendiente", "Pendent", "Due", "En attente", "Pendente"],
  ["profile.copyLead", "La copia lleva toda la cava: vinos propios, entradas, actividad y las fotos de etiqueta. En el iPhone se ofrece guardar en Archivos o Drive.", "La còpia porta tot el celler: vins propis, entrades, activitat i les fotos d'etiqueta. A l'iPhone s'ofereix desar a Arxius o Drive.", "The backup holds the whole cellar: your wines, intakes, activity and label photos. On iPhone it offers to save to Files or Drive.", "La copie contient toute la cave : vins propres, entrées, activité et photos d'étiquette. Sur iPhone, elle propose Fichiers ou Drive.", "A cópia leva a adega toda: vinhos próprios, entradas, atividade e as fotos do rótulo. No iPhone oferece guardar em Ficheiros ou Drive."],
  ["profile.exportNow", "Crear copia ahora · JSON", "Crear còpia ara · JSON", "Back up now · JSON", "Créer une copie maintenant · JSON", "Criar cópia agora · JSON"],
  ["profile.exportCsv", "Exportar inventario · CSV", "Exportar inventari · CSV", "Export inventory · CSV", "Exporter l'inventaire · CSV", "Exportar inventário · CSV"],
  ["profile.exportTastings", "Exportar catas · CSV", "Exportar tastos · CSV", "Export tastings · CSV", "Exporter les dégustations · CSV", "Exportar provas · CSV"],
  ["profile.restore", "Restaurar copia JSON", "Restaurar còpia JSON", "Restore JSON backup", "Restaurer une copie JSON", "Restaurar cópia JSON"],
  ["profile.restoreHint", "La restauración pide confirmación. No se mezcla a ciegas.", "La restauració demana confirmació. No es barreja a cegues.", "Restore asks for confirmation. Nothing is merged blindly.", "La restauration demande une confirmation. Rien n'est fusionné à l'aveugle.", "A restauração pede confirmação. Não se mistura às cegas."],
  ["profile.wipe", "Eliminar colección", "Eliminar col·lecció", "Delete collection", "Supprimer la collection", "Eliminar coleção"],
  ["profile.aboutApp", "Mi Vinoteca", "El meu celler", "My cellar", "Ma cave", "A minha adega"],
  ["profile.schema", "Esquema vinoteca.pro.max.v3 · {b} botellas · {w} vinos · {c} vinotecas", "Esquema vinoteca.pro.max.v3 · {b} ampolles · {w} vins · {c} vinoteques", "Schema vinoteca.pro.max.v3 · {b} bottles · {w} wines · {c} cellars", "Schéma vinoteca.pro.max.v3 · {b} bouteilles · {w} vins · {c} caves", "Esquema vinoteca.pro.max.v3 · {b} garrafas · {w} vinhos · {c} adegas"],
  ["profile.labels", "Etiquetas propias guardadas: {n}", "Etiquetes pròpies desades: {n}", "Own labels saved: {n}", "Étiquettes personnelles enregistrées : {n}", "Rótulos próprios guardados: {n}"],
  ["profile.lastLine", "Última copia: {when}", "Última còpia: {when}", "Latest backup: {when}", "Dernière copie : {when}", "Última cópia: {when}"],
  ["profile.checking", "Consultando el almacenamiento…", "Consultant l'emmagatzematge…", "Checking storage…", "Consultation du stockage…", "A consultar o armazenamento…"],
  ["profile.private", "Colección privada. No se indexa ni se comparte sola.", "Col·lecció privada. No s'indexa ni es comparteix sola.", "Private collection. It is not indexed and it does not share itself.", "Collection privée. Elle n'est pas indexée et ne se partage pas seule.", "Coleção privada. Não se indexa nem se partilha sozinha."],
  ["profile.persist", "Almacenamiento persistente", "Emmagatzematge persistent", "Persistent storage", "Stockage persistant", "Armazenamento persistente"],
  ["profile.used", "Espacio usado", "Espai usat", "Space used", "Espace utilisé", "Espaço usado"],
  ["profile.persistUnknown", "No se puede consultar en este navegador.", "No es pot consultar en aquest navegador.", "This browser cannot report it.", "Ce navigateur ne peut pas le dire.", "Este navegador não consegue consultar."],
  ["profile.persistYes", "Sí. El sistema conserva estos datos.", "Sí. El sistema conserva aquestes dades.", "Yes. The system keeps this data.", "Oui. Le système conserve ces données.", "Sim. O sistema conserva estes dados."],
  ["profile.persistNo", "No. El sistema puede borrarlos si necesita espacio.", "No. El sistema els pot esborrar si necessita espai.", "No. The system may delete them if it needs space.", "Non. Le système peut les effacer s'il a besoin d'espace.", "Não. O sistema pode apagá-los se precisar de espaço."],
  ["profile.spaceUnknown", "Sin dato", "Sense dada", "No data", "Sans donnée", "Sem dado"],
  ["profile.spaceOf", "{used} de {quota}", "{used} de {quota}", "{used} of {quota}", "{used} sur {quota}", "{used} de {quota}"],
  ["profile.demoLeft", "Fuera de demostración. Los datos de este teléfono siguen aquí.", "Fora de demostració. Les dades d'aquest telèfon segueixen aquí.", "Demo mode off. This phone's data stays here.", "Mode démonstration quitté. Les données de ce téléphone restent ici.", "Fora da demonstração. Os dados deste telefone continuam aqui."],
  ["lang.kicker", "Idioma", "Idioma", "Language", "Langue", "Idioma"],
  ["lang.title", "Idioma de la cava", "Idioma del celler", "Cellar language", "Langue de la cave", "Idioma da adega"],
  ["lang.hint", "La interfaz, las fechas y los avisos. Tus notas y los nombres se quedan como los escribiste. El texto del catálogo sigue en español hasta que pulses Traducir.", "La interfície, les dates i els avisos. Les teves notes i els noms es queden com els vas escriure. El text del catàleg segueix en espanyol fins que premis Traduir.", "The interface, dates and notices. Your notes and names stay as you wrote them. Catalogue prose stays in Spanish until you tap Translate.", "L'interface, les dates et les alertes. Vos notes et les noms restent tels que vous les avez écrits. Le texte du catalogue reste en espagnol jusqu'à Traduire.", "A interface, as datas e os avisos. As suas notas e os nomes ficam como os escreveu. O texto do catálogo continua em espanhol até premir Traduzir."],
  ["backup.never", "Aún no", "Encara no", "Not yet", "Pas encore", "Ainda não"],
  ["backup.title", "Copia de seguridad", "Còpia de seguretat", "Backup", "Copie de sauvegarde", "Cópia de segurança"],
  ["backup.due", "Pendiente", "Pendent", "Due", "En attente", "Pendente"],
  ["backup.old", "Hace tiempo", "Fa temps", "A while ago", "Cela fait longtemps", "Há tempo"],
  ["backup.neverBody", "Aún no hay una copia de esta cava. Conviene guardarla en Archivos o Drive.", "Encara no hi ha una còpia d'aquest celler. Convé desar-la a Arxius o Drive.", "This cellar has no backup yet. Save one to Files or Drive.", "Cette cave n'a pas encore de copie. Enregistrez-la dans Fichiers ou Drive.", "Esta adega ainda não tem cópia. Convém guardá-la em Ficheiros ou Drive."],
  ["backup.oldBody", "La última copia tiene más de 30 días. Conviene hacer otra.", "L'última còpia té més de 30 dies. Convé fer-ne una altra.", "The latest backup is more than 30 days old. Make another.", "La dernière copie a plus de 30 jours. Il convient d'en faire une autre.", "A última cópia tem mais de 30 dias. Convém fazer outra."],
  ["backup.saved", "Copia guardada", "Còpia desada", "Backup saved", "Copie enregistrée", "Cópia guardada"],
  ["backup.notSaved", "Copia no guardada", "Còpia no desada", "Backup not saved", "Copie non enregistrée", "Cópia não guardada"],
  ["backup.fail", "No se pudo crear la copia", "No s'ha pogut crear la còpia", "The backup could not be created", "La copie n'a pas pu être créée", "Não foi possível criar a cópia"],
  ["backup.csvInv", "CSV de inventario", "CSV d'inventari", "Inventory CSV", "CSV d'inventaire", "CSV de inventário"],
  ["backup.csvTaste", "CSV de catas", "CSV de tastos", "Tastings CSV", "CSV des dégustations", "CSV de provas"],
  ["backup.restored", "Colección restaurada", "Col·lecció restaurada", "Collection restored", "Collection restaurée", "Coleção restaurada"],
  ["backup.badFile", "Archivo no válido", "Fitxer no vàlid", "File not valid", "Fichier non valide", "Ficheiro inválido"],
  ["backup.badJson", "JSON ilegible", "JSON il·legible", "Unreadable JSON", "JSON illisible", "JSON ilegível"],
  ["backup.csvLater", "Importar CSV: siguiente pase. Usa JSON de copia.", "Importar CSV: pas següent. Fes servir JSON de còpia.", "CSV import comes later. Use a JSON backup.", "Import CSV : plus tard. Utilisez une copie JSON.", "Importar CSV: mais tarde. Use o JSON da cópia."],
  ["backup.notWiped", "No se ha borrado", "No s'ha esborrat", "Nothing was deleted", "Rien n'a été effacé", "Nada foi apagado"],
  ["backup.wiped", "Colección vacía", "Col·lecció buida", "Collection emptied", "Collection vidée", "Coleção vazia"],
  ["backup.wipeAsk", "Escribe ELIMINAR para vaciar la colección de este iPhone. Las copias que ya guardaste no se tocan.", "Escriu ELIMINAR per buidar la col·lecció d'aquest iPhone. Les còpies que ja has desat no es toquen.", "Type ELIMINAR to empty this iPhone's collection. Backups you already saved stay untouched.", "Écrivez ELIMINAR pour vider la collection de cet iPhone. Les copies déjà enregistrées ne sont pas touchées.", "Escreva ELIMINAR para esvaziar a coleção deste iPhone. As cópias já guardadas não se tocam."],
  ["quota.toast", "No cabe en el iPhone. Las etiquetas siguen guardadas.", "No cap a l'iPhone. Les etiquetes segueixen desades.", "It does not fit on the iPhone. The labels stay saved.", "Cela ne tient pas sur l'iPhone. Les étiquettes restent enregistrées.", "Não cabe no iPhone. Os rótulos continuam guardados."],
  ["label.unread", "No se pudo leer la foto", "No s'ha pogut llegir la foto", "The photo could not be read", "La photo n'a pas pu être lue", "Não foi possível ler a foto"],
  ["label.updated", "Etiqueta actualizada", "Etiqueta actualitzada", "Label updated", "Étiquette mise à jour", "Rótulo atualizado"],
  ["label.change", "Cambiar etiqueta", "Canviar etiqueta", "Change label", "Changer l'étiquette", "Mudar rótulo"],
  ["notify.granted", "Permiso dado. Los avisos salen al abrir la app y en pruebas.", "Permís donat. Els avisos surten en obrir l'app i a les proves.", "Permission given. Notices appear when you open the app and in tests.", "Permission accordée. Les alertes sortent à l'ouverture de l'app et dans les essais.", "Permissão dada. Os avisos saem ao abrir a app e nos testes."],
  ["notify.denied", "El iPhone ha bloqueado los avisos. Ajustes → Notificaciones → Casa Llavaneras.", "L'iPhone ha blocat els avisos. Ajustos → Notificacions → Casa Llavaneras.", "The iPhone has blocked notices. Settings → Notifications → Casa Llavaneras.", "L'iPhone a bloqué les alertes. Réglages → Notifications → Casa Llavaneras.", "O iPhone bloqueou os avisos. Ajustes → Notificações → Casa Llavaneras."],
  ["notify.default", "Pulsa Permitir y acepta el diálogo del iPhone.", "Prem Permetre i accepta el diàleg de l'iPhone.", "Tap Allow and accept the iPhone dialogue.", "Appuyez sur Autoriser et acceptez le dialogue de l'iPhone.", "Prima Permitir e aceite o diálogo do iPhone."],
  ["notify.unsupported", "Este navegador no admite avisos.", "Aquest navegador no admet avisos.", "This browser does not support notices.", "Ce navigateur ne prend pas en charge les alertes.", "Este navegador não admite avisos."],
  ["notify.noWeb", "Este iPhone no admite avisos web", "Aquest iPhone no admet avisos web", "This iPhone does not support web notices", "Cet iPhone ne prend pas en charge les alertes web", "Este iPhone não admite avisos web"],
  ["notify.homeScreen", "Antes: Compartir → Añadir a pantalla de inicio", "Abans: Compartir → Afegir a la pantalla d'inici", "First: Share → Add to Home Screen", "D'abord : Partager → Sur l'écran d'accueil", "Antes: Partilhar → Adicionar ao ecrã inicial"],
  ["notify.on", "Avisos activados", "Avisos activats", "Notices on", "Alertes activées", "Avisos ativados"],
  ["notify.iosSettings", "Actívalos en Ajustes del iPhone", "Activa'ls als Ajustos de l'iPhone", "Turn them on in iPhone Settings", "Activez-les dans Réglages de l'iPhone", "Ative-os nos Ajustes do iPhone"],
  ["notify.testBody", "Avisos listos. Te avisaremos del apogeo y de la temperatura.", "Avisos a punt. T'avisarem de l'apogeu i de la temperatura.", "Notices are ready. We will tell you about peak and temperature.", "Alertes prêtes. Nous vous préviendrons de l'apogée et de la température.", "Avisos prontos. Avisamos do apogeu e da temperatura."],
  ["notify.testSent", "Aviso de prueba enviado", "Avís de prova enviat", "Test notice sent", "Alerte d'essai envoyée", "Aviso de teste enviado"],
  ["notify.tempTitle", "Vinoteca a {t} °C", "Vinoteca a {t} °C", "Cellar at {t} °C", "Cave à {t} °C", "Adega a {t} °C"],
  ["notify.tempBody", "Baja SET 1 hacia 12–14 °C para la guarda.", "Baixa SET 1 cap a 12–14 °C per a la guarda.", "Lower SET 1 toward 12–14 °C for ageing.", "Baissez SET 1 vers 12–14 °C pour l'élevage.", "Baixe SET 1 para 12–14 °C para o estágio."],
  ["notify.soonTitle", "Beber pronto", "Beure aviat", "Drink soon", "À boire bientôt", "Beber em breve"],
  ["notify.soonBody", "{wine} · {n} aviso{s}", "{wine} · {n} avís{s}", "{wine} · {n} notice{s}", "{wine} · {n} alerte{s}", "{wine} · {n} aviso{s}"],
  ["notify.soonS", "s", "s", "s", "s", "s"],
  ["notify.peakTitle", "En apogeo", "En apogeu", "At its peak", "À l'apogée", "No apogeu"],
  ["notify.peakBody", "{wine} listo para abrir.", "{wine} llest per obrir.", "{wine} ready to open.", "{wine} prêt à ouvrir.", "{wine} pronto a abrir."],
  ["notify.lastTitle", "Última botella", "Última ampolla", "Last bottle", "Dernière bouteille", "Última garrafa"],
  ["notify.lastBody", "Queda 1 botella de {wine}{extra}", "Queda 1 ampolla de {wine}{extra}", "1 bottle left of {wine}{extra}", "Plus qu'une bouteille de {wine}{extra}", "Resta 1 garrafa de {wine}{extra}"],
  ["notify.more", " · y {n} más", " · i {n} més", " · and {n} more", " · et {n} de plus", " · e mais {n}"],
  ["notify.h1", "Avisos", "Avisos", "Notices", "Alertes", "Avisos"],
  ["notify.lead", "En el iPhone solo llegan si la app está en la pantalla de inicio. Un toque activa el permiso.", "A l'iPhone només arriben si l'app és a la pantalla d'inici. Un toc activa el permís.", "On iPhone they arrive only if the app is on the Home Screen. One tap asks for permission.", "Sur iPhone, elles n'arrivent que si l'app est sur l'écran d'accueil. Un toucher active la permission.", "No iPhone só chegam se a app estiver no ecrã inicial. Um toque ativa a permissão."],
  ["notify.switch", "Activar avisos", "Activar avisos", "Turn notices on", "Activer les alertes", "Ativar avisos"],
  ["notify.evolve", "Beber pronto / maduros", "Beure aviat / madurs", "Drink soon / mature", "À boire bientôt / mûrs", "Beber em breve / maduros"],
  ["notify.ready", "En apogeo esta semana", "En apogeu aquesta setmana", "At peak this week", "À l'apogée cette semaine", "No apogeu esta semana"],
  ["notify.temp", "Temperatura alta", "Temperatura alta", "High temperature", "Température haute", "Temperatura alta"],
  ["notify.stock", "Última botella", "Última ampolla", "Last bottle", "Dernière bouteille", "Última garrafa"],
  ["notify.seeDrinks", "Ver bebidas", "Veure begudes", "See drinks", "Voir les consommés", "Ver bebidas"],
  ["notify.allow", "Permitir en el iPhone", "Permetre a l'iPhone", "Allow on iPhone", "Autoriser sur l'iPhone", "Permitir no iPhone"],
  ["notify.test", "Probar aviso", "Provar avís", "Test a notice", "Essayer une alerte", "Testar aviso"],
  ["price.h1", "Precios de mercado", "Preus de mercat", "Market prices", "Prix de marché", "Preços de mercado"],
  ["price.lead", "Vivino no tiene API. Sin clave se usa el dossier. Gemini estima la horquilla (no es una cotización). Wine-Searcher solo si tienes su clave.", "Vivino no té API. Sense clau es fa servir el dossier. Gemini estima la forquilla (no és una cotització). Wine-Searcher només si en tens la clau.", "Vivino has no API. Without a key the dossier is used. Gemini estimates the range (it is not a quote). Wine-Searcher only if you have its key.", "Vivino n'a pas d'API. Sans clé, le dossier est utilisé. Gemini estime la fourchette (ce n'est pas une cote). Wine-Searcher seulement si vous avez sa clé.", "O Vivino não tem API. Sem chave usa-se o dossier. O Gemini estima o intervalo (não é uma cotação). Wine-Searcher só se tiver a chave."],
  ["price.gemini", "Estimar con Gemini", "Estimar amb Gemini", "Estimate with Gemini", "Estimer avec Gemini", "Estimar com o Gemini"],
  ["price.geminiKey", "Clave Gemini (AI Studio)", "Clau Gemini (AI Studio)", "Gemini key (AI Studio)", "Clé Gemini (AI Studio)", "Chave Gemini (AI Studio)"],
  ["price.geminiPh", "No se guarda en el código", "No es desa al codi", "Not stored in the code", "Pas stockée dans le code", "Não se guarda no código"],
  ["price.probe", "Probar Gemini", "Provar Gemini", "Test Gemini", "Essayer Gemini", "Testar Gemini"],
  ["price.ws", "Usar Wine-Searcher", "Fer servir Wine-Searcher", "Use Wine-Searcher", "Utiliser Wine-Searcher", "Usar Wine-Searcher"],
  ["price.url", "API URL", "API URL", "API URL", "URL de l'API", "URL da API"],
  ["price.wsKey", "Clave Wine-Searcher", "Clau Wine-Searcher", "Wine-Searcher key", "Clé Wine-Searcher", "Chave Wine-Searcher"],
  ["price.optional", "Opcional", "Opcional", "Optional", "Facultatif", "Opcional"],
  ["price.save", "Guardar precios", "Desar preus", "Save prices", "Enregistrer les prix", "Guardar preços"],
  ["price.typed", "Clave escrita, pulsa Guardar precios para guardarla", "Clau escrita, prem Desar preus per desar-la", "Key typed; tap Save prices to keep it", "Clé saisie ; appuyez sur Enregistrer les prix pour la garder", "Chave escrita; prima Guardar preços para a guardar"],
  ["price.stored", "Clave guardada en esta app.", "Clau desada en aquesta app.", "Key saved in this app.", "Clé enregistrée dans cette app.", "Chave guardada nesta app."],
  ["price.none", "No hay clave en esta app. Pégala aquí: Safari y el icono de inicio no comparten la clave.", "No hi ha clau en aquesta app. Enganxa-la aquí: Safari i la icona d'inici no comparteixen la clau.", "No key in this app. Paste it here: Safari and the Home Screen icon do not share the key.", "Pas de clé dans cette app. Collez-la ici : Safari et l'icône d'accueil ne partagent pas la clé.", "Não há chave nesta app. Cole-a aqui: o Safari e o ícone do ecrã inicial não partilham a chave."],
  ["price.needKey", "No hay clave. Pégala arriba o guárdala antes.", "No hi ha clau. Enganxa-la a dalt o desa-la abans.", "No key. Paste it above or save it first.", "Pas de clé. Collez-la plus haut ou enregistrez-la d'abord.", "Não há chave. Cole-a acima ou guarde-a antes."],
  ["price.probing", "Probando la clave…", "Provant la clau…", "Testing the key…", "Essai de la clé…", "A testar a chave…"],
  ["price.savedKey", "Clave de Gemini guardada en esta app", "Clau de Gemini desada en aquesta app", "Gemini key saved in this app", "Clé Gemini enregistrée dans cette app", "Chave Gemini guardada nesta app"],
  ["price.keyFail", "No se pudo guardar la clave", "No s'ha pogut desar la clau", "The key could not be saved", "La clé n'a pas pu être enregistrée", "Não foi possível guardar a chave"],
  ["price.net", "red o CORS", "xarxa o CORS", "network or CORS", "réseau ou CORS", "rede ou CORS"],
  ["price.wsOn", "Precios: Wine-Searcher", "Preus: Wine-Searcher", "Prices: Wine-Searcher", "Prix : Wine-Searcher", "Preços: Wine-Searcher"],
  ["price.dossier", "Precios: dossier", "Preus: dossier", "Prices: dossier", "Prix : dossier", "Preços: dossier"],
  ["add.h1", "Añadir a vinoteca", "Afegir a la vinoteca", "Add to cellar", "Ajouter à la cave", "Adicionar à adega"],
  ["add.cellar", "Vinoteca", "Vinoteca", "Cellar", "Cave", "Adega"],
  ["add.bin", "Hueco / bandeja", "Forat / safata", "Slot / shelf", "Emplacement / clayette", "Lugar / prateleira"],
  ["add.qty", "Botellas", "Ampolles", "Bottles", "Bouteilles", "Garrafas"],
  ["add.price", "Precio € / botella", "Preu € / ampolla", "Price € / bottle", "Prix € / bouteille", "Preço € / garrafa"],
  ["add.note", "Nota", "Nota", "Note", "Note", "Nota"],
  ["add.notePh", "Caja, ocasión, proveedor…", "Caixa, ocasió, proveïdor…", "Case, occasion, merchant…", "Caisse, occasion, fournisseur…", "Caixa, ocasião, fornecedor…"],
  ["add.save", "Guardar en la cava", "Desar al celler", "Save in the cellar", "Enregistrer dans la cave", "Guardar na adega"],
  ["move.h1", "Mover lote", "Moure lot", "Move lot", "Déplacer le lot", "Mover lote"],
  ["move.dest", "Vinoteca destino", "Vinoteca de destí", "Destination cellar", "Cave de destination", "Adega de destino"],
  ["move.bin", "Nuevo hueco", "Nou forat", "New slot", "Nouvel emplacement", "Novo lugar"],
  ["move.qty", "Botellas a mover", "Ampolles a moure", "Bottles to move", "Bouteilles à déplacer", "Garrafas a mover"],
  ["move.go", "Mover", "Moure", "Move", "Déplacer", "Mover"],
  ["move.hint", "{n} ud en {where}", "{n} u. a {where}", "{n} bt in {where}", "{n} u. dans {where}", "{n} un. em {where}"],
  ["move.moved", "Movidas {n}", "Mogudes {n}", "Moved {n}", "Déplacées {n}", "Movidas {n}"],
  ["move.occupied", "El hueco {bin} ya está ocupado. ¿Mover igualmente?", "El forat {bin} ja està ocupat. Moure igualment?", "Slot {bin} is already taken. Move anyway?", "L'emplacement {bin} est déjà pris. Déplacer quand même ?", "O lugar {bin} já está ocupado. Mover mesmo assim?"],
  ["new.h1", "Nueva vinoteca", "Nova vinoteca", "New cellar", "Nouvelle cave", "Nova adega"],
  ["new.house", "Casa", "Casa", "House", "Maison", "Casa"],
  ["new.housePh", "Selecciona o introduce la casa", "Selecciona o introdueix la casa", "Choose or type the house", "Choisissez ou saisissez la maison", "Escolha ou escreva a casa"],
  ["new.name", "Nombre", "Nom", "Name", "Nom", "Nome"],
  ["new.namePh", "Ej. Bodega principal", "P. ex. Celler principal", "e.g. Main cellar", "p. ex. Cave principale", "p. ex. Adega principal"],
  ["new.brand", "Marca / modelo", "Marca / model", "Brand / model", "Marque / modèle", "Marca / modelo"],
  ["new.brandPh", "Ej. EuroCave Professional", "P. ex. EuroCave Professional", "e.g. EuroCave Professional", "p. ex. EuroCave Professional", "p. ex. EuroCave Professional"],
  ["new.place", "Sitio / estancia", "Lloc / estança", "Place / room", "Lieu / pièce", "Sítio / divisão"],
  ["new.placePh", "Ej. cocina, sótano, office", "P. ex. cuina, soterrani, office", "e.g. kitchen, cellar, office", "p. ex. cuisine, cave, office", "p. ex. cozinha, cave, office"],
  ["new.bins", "Huecos (referencia)", "Forats (referència)", "Slots (reference)", "Emplacements (référence)", "Lugares (referência)"],
  ["new.binsPh", "Ej. A-01 a C-12", "P. ex. A-01 a C-12", "e.g. A-01 to C-12", "p. ex. A-01 à C-12", "p. ex. A-01 a C-12"],
  ["new.cap", "Capacidad (botellas)", "Capacitat (ampolles)", "Capacity (bottles)", "Capacité (bouteilles)", "Capacidade (garrafas)"],
  ["new.t1", "Temp. zona 1 °C", "Temp. zona 1 °C", "Temp. zone 1 °C", "Temp. zone 1 °C", "Temp. zona 1 °C"],
  ["new.t2", "Temp. zona 2 °C", "Temp. zona 2 °C", "Temp. zone 2 °C", "Temp. zone 2 °C", "Temp. zona 2 °C"],
  ["new.hr", "Humedad relativa %", "Humitat relativa %", "Relative humidity %", "Humidité relative %", "Humidade relativa %"],
  ["new.slots", "Espacios a crear", "Espais a crear", "Slots to create", "Emplacements à créer", "Lugares a criar"],
  ["new.addSlots", "Añadir espacios", "Afegir espais", "Add slots", "Ajouter des emplacements", "Adicionar lugares"],
  ["new.create", "Crear", "Crear", "Create", "Créer", "Criar"],
  ["new.hint", "Se creará en la casa que indiques. Los huecos sirven para localizar cada botella.", "Es crearà a la casa que indiquis. Els forats serveixen per localitzar cada ampolla.", "It is created in the house you name. Slots locate each bottle.", "Elle sera créée dans la maison indiquée. Les emplacements situent chaque bouteille.", "Será criada na casa que indicar. Os lugares servem para localizar cada garrafa."],
  ["space.h1", "Añadir espacios", "Afegir espais", "Add slots", "Ajouter des emplacements", "Adicionar lugares"],
  ["space.count", "Nuevos espacios seguidos", "Nous espais seguits", "New slots in a row", "Nouveaux emplacements à la suite", "Novos lugares seguidos"],
  ["space.create", "Crear espacios nuevos", "Crear espais nous", "Create new slots", "Créer de nouveaux emplacements", "Criar lugares novos"],
  ["space.existing", "Asignar un espacio ya existente", "Assignar un espai ja existent", "Assign an existing slot", "Assigner un emplacement déjà existant", "Atribuir um lugar já existente"],
  ["space.assign", "Asignar a esta vinoteca", "Assignar a aquesta vinoteca", "Assign to this cellar", "Assigner à cette cave", "Atribuir a esta adega"],
  ["menu.h1", "Más de este vino", "Més d'aquest vi", "More on this wine", "Plus sur ce vin", "Mais deste vinho"],
  ["serve.h1", "Salida de cava", "Sortida de celler", "Leaving the cellar", "Sortie de cave", "Saída da adega"],
  ["serve.edit", "Editar salida", "Editar sortida", "Edit exit", "Modifier la sortie", "Editar saída"],
  ["serve.lead", "Elige el motivo. La nota es opcional.", "Tria el motiu. La nota és opcional.", "Choose the reason. The note is optional.", "Choisissez le motif. La note est facultative.", "Escolha o motivo. A nota é opcional."],
  ["serve.reason", "Motivo", "Motiu", "Reason", "Motif", "Motivo"],
  ["serve.date", "Fecha", "Data", "Date", "Date", "Data"],
  ["serve.occasion", "Ocasión", "Ocasió", "Occasion", "Occasion", "Ocasião"],
  ["serve.other", "Otra ocasión", "Una altra ocasió", "Other occasion", "Autre occasion", "Outra ocasião"],
  ["serve.otherPh", "Aniversario, comida…", "Aniversari, dinar…", "Anniversary, lunch…", "Anniversaire, déjeuner…", "Aniversário, almoço…"],
  ["serve.who", "Con quién", "Amb qui", "With whom", "Avec qui", "Com quem"],
  ["serve.whoPh", "Familia, invitados…", "Família, convidats…", "Family, guests…", "Famille, invités…", "Família, convidados…"],
  ["serve.stars", "Nota (1–5)", "Nota (1–5)", "Score (1–5)", "Note (1–5)", "Nota (1–5)"],
  ["serve.note", "Nota", "Nota", "Note", "Note", "Nota"],
  ["serve.notePh", "Qué se te quedó", "Què et va quedar", "What stayed with you", "Ce qui vous reste", "O que lhe ficou"],
  ["serve.save", "Guardar", "Desar", "Save", "Enregistrer", "Guardar"],
  ["serve.saveEdit", "Guardar cambios", "Desar canvis", "Save changes", "Enregistrer les changements", "Guardar alterações"],
  ["serve.skip", "Omitir nota", "Ometre nota", "Skip the note", "Omettre la note", "Omitir nota"],
  ["serve.cancel", "Cancelar", "Cancel·lar", "Cancel", "Annuler", "Cancelar"],
  ["serve.this", "esta botella", "aquesta ampolla", "this bottle", "cette bouteille", "esta garrafa"],
  ["cata.h1", "¿Añadir cata?", "Afegir tast?", "Add a tasting?", "Ajouter une dégustation ?", "Adicionar prova?"],
  ["cata.lead", "La salida ya está en Bebidas. Puedes anotar la cata ahora.", "La sortida ja és a Begudes. Pots anotar el tast ara.", "The exit is already in Drinks. You can note the tasting now.", "La sortie est déjà dans Consommés. Vous pouvez noter la dégustation maintenant.", "A saída já está em Bebidas. Pode anotar a prova agora."],
  ["cata.add", "Añadir cata", "Afegir tast", "Add tasting", "Ajouter une dégustation", "Adicionar prova"],
  ["cata.later", "Ahora no", "Ara no", "Not now", "Pas maintenant", "Agora não"],
  ["exit.h1", "Quitar lote", "Treure lot", "Remove lot", "Retirer le lot", "Retirar lote"],
  ["exit.list", "Quitar del listado", "Treure del llistat", "Remove from list", "Retirer de la liste", "Retirar da lista"],
  ["exit.lead", "Si fue un error de registro, no cuenta en el historial.", "Si va ser un error de registre, no compta a l'historial.", "If it was a recording error, it does not count in the history.", "S'il s'agissait d'une erreur de saisie, cela ne compte pas dans l'historique.", "Se foi um erro de registo, não conta no histórico."],
  ["exit.note", "Nota", "Nota", "Note", "Note", "Nota"],
  ["exit.notePh", "Opcional", "Opcional", "Optional", "Facultatif", "Opcional"],
  ["exit.go", "Quitar", "Treure", "Remove", "Retirer", "Retirar"],
  ["exit.void", "Lote quitado, sin contar", "Lot tret, sense comptar", "Lot removed, not counted", "Lot retiré, non compté", "Lote retirado, sem contar"],
  ["exit.logged", "Salida registrada", "Sortida registrada", "Exit recorded", "Sortie enregistrée", "Saída registada"],
  ["exit.lot", "Este lote", "Aquest lot", "This lot", "Ce lot", "Este lote"],
  ["exit.these", "Estas botellas", "Aquestes ampolles", "These bottles", "Ces bouteilles", "Estas garrafas"],
  ["slot.free", "libre", "lliure", "free", "libre", "livre"],
  ["slot.none", "Sin huecos libres.", "Sense forats lliures.", "No free slots.", "Aucun emplacement libre.", "Sem lugares livres."],
  ["slot.proposed", "Hueco libre propuesto: {bin}", "Forat lliure proposat: {bin}", "Suggested free slot: {bin}", "Emplacement libre proposé : {bin}", "Lugar livre proposto: {bin}"],
  ["slot.noneLeft", "No quedan huecos libres en esta vinoteca.", "No queden forats lliures en aquesta vinoteca.", "No free slots left in this cellar.", "Plus d'emplacements libres dans cette cave.", "Não restam lugares livres nesta adega."],
  ["slot.taken", "El hueco {bin} ya lo ocupa {name}. ¿Guardar igualmente?", "El forat {bin} ja l'ocupa {name}. Desar igualment?", "Slot {bin} is already held by {name}. Save anyway?", "L'emplacement {bin} est déjà pris par {name}. Enregistrer quand même ?", "O lugar {bin} já está ocupado por {name}. Guardar mesmo assim?"],
  ["slot.added", "+{n} · lote {qty}", "+{n} · lot {qty}", "+{n} · lot {qty}", "+{n} · lot {qty}", "+{n} · lote {qty}"],
  ["slot.placed", "{qty} en {where}", "{qty} a {where}", "{qty} in {where}", "{qty} dans {where}", "{qty} em {where}"],
  ["slot.placedTemp", "{qty} en {where} · {bin}", "{qty} a {where} · {bin}", "{qty} in {where} · {bin}", "{qty} dans {where} · {bin}", "{qty} em {where} · {bin}"],
  ["slot.oneTemp", "1 en {where} · {a}–{b} °C", "1 a {where} · {a}–{b} °C", "1 in {where} · {a}–{b} °C", "1 dans {where} · {a}–{b} °C", "1 em {where} · {a}–{b} °C"],
  ["slot.one", "1 botella en {where}", "1 ampolla a {where}", "1 bottle in {where}", "1 bouteille dans {where}", "1 garrafa em {where}"],
  ["slot.savedScan", "Guardado. Ábrelo en Botellas.", "Desat. Obre'l a Ampolles.", "Saved. Open it in Bottles.", "Enregistré. Ouvrez-le dans Bouteilles.", "Guardado. Abra-o em Garrafas."],
  ["slot.noSheet", "No se pudo crear la ficha. Escribe bodega y añada.", "No s'ha pogut crear la fitxa. Escriu celler i anyada.", "The sheet could not be created. Type the estate and vintage.", "La fiche n'a pas pu être créée. Saisissez le domaine et le millésime.", "Não foi possível criar a ficha. Escreva o produtor e a colheita."],
  ["noun.bottle", "botella", "ampolla", "bottle", "bouteille", "garrafa"],
  ["noun.bottles", "botellas", "ampolles", "bottles", "bouteilles", "garrafas"],
  ["noun.lot", "lote", "lot", "lot", "lot", "lote"],
  ["noun.lots", "lotes", "lots", "lots", "lots", "lotes"],
  ["wine.fav", "Favorito", "Favorit", "Favourite", "Favori", "Favorito"],
  ["wine.more", "Más de este vino", "Més d'aquest vi", "More on this wine", "Plus sur ce vin", "Mais deste vinho"],
  ["wine.inCellar", "En mi bodega · {n} {noun}", "Al meu celler · {n} {noun}", "In my cellar · {n} {noun}", "Dans ma cave · {n} {noun}", "Na minha adega · {n} {noun}"],
  ["wine.seeCave", "Ver en la vinoteca", "Veure a la vinoteca", "See in the cellar", "Voir dans la cave", "Ver na adega"],
  ["wine.noSheet", "No hay ficha para este vino", "No hi ha fitxa per a aquest vi", "There is no sheet for this wine", "Il n'y a pas de fiche pour ce vin", "Não há ficha para este vinho"],
  ["wine.general", "General", "General", "General", "Général", "Geral"],
  ["wine.tasteTab", "Cata", "Tast", "Tasting", "Dégustation", "Prova"],
  ["wine.estateTab", "Bodega", "Celler", "Estate", "Domaine", "Produtor"],
  ["wine.vintagesTab", "Añadas", "Anyades", "Vintages", "Millésimes", "Colheitas"],
  ["wine.ratings", "Calificaciones", "Qualificacions", "Scores", "Notes", "Classificações"],
  ["wine.pairings", "Maridajes", "Maridatges", "Pairings", "Accords", "Harmonizações"],
  ["wine.keep", "Guarda", "Guarda", "Cellar", "Garde", "Guarda"],
  ["wine.service", "Servicio", "Servei", "Service", "Service", "Serviço"],
  ["wine.techBtn", "Técnica", "Tècnica", "Craft", "Technique", "Técnica"],
  ["wine.glassBtn", "Copa", "Copa", "Glass", "Verre", "Copo"],
  ["wine.evolveBtn", "Evolución", "Evolució", "Ageing", "Élevage", "Estágio"],
  ["wine.marketBtn", "Mercado", "Mercat", "Market", "Marché", "Mercado"],
  ["wine.historyBtn", "Historia", "Història", "History", "Histoire", "História"],
  ["wine.binBtn", "Hueco", "Forat", "Slot", "Emplacement", "Lugar"],
  ["wine.buyBtn", "Compras", "Compres", "Purchases", "Achats", "Compras"],
  ["wine.critic", "Crítica publicada", "Crítica publicada", "Published note", "Note publiée", "Nota publicada"],
  ["wine.personal", "Cata personal", "Tast personal", "Personal tasting", "Dégustation personnelle", "Prova pessoal"],
  ["wine.personalEmpty", "Tu nota, no la de las guías.", "La teva nota, no la de les guies.", "Your note, not the guides'.", "Votre note, pas celle des guides.", "A sua nota, não a dos guias."],
  ["wine.noMemory", "Cata sin recuerdo", "Tast sense record", "Tasting without a note", "Dégustation sans souvenir", "Prova sem nota"],
  ["wine.nTastings", "{n} catas", "{n} tastos", "{n} tastings", "{n} dégustations", "{n} provas"],
  ["sub.ratings", "Calificaciones", "Qualificacions", "Scores", "Notes", "Classificações"],
  ["sub.pairings", "Maridajes", "Maridatges", "Pairings", "Accords", "Harmonizações"],
  ["sub.keep", "Conservación", "Conservació", "Keeping", "Conservation", "Conservação"],
  ["sub.servicio", "Servicio en copa", "Servei en copa", "Service in the glass", "Service au verre", "Serviço no copo"],
  ["sub.tecnica", "Ficha técnica", "Fitxa tècnica", "Technical sheet", "Fiche technique", "Ficha técnica"],
  ["sub.historia", "Historia", "Història", "History", "Histoire", "História"],
  ["sub.mercado", "Valor de mercado", "Valor de mercat", "Market value", "Valeur de marché", "Valor de mercado"],
  ["sub.evolve", "Evolución", "Evolució", "Ageing", "Élevage", "Estágio"],
  ["sub.profile", "Perfil", "Perfil", "Profile", "Profil", "Perfil"],
  ["sub.origen", "Origen y hueco", "Origen i forat", "Origin and slot", "Origine et emplacement", "Origem e lugar"],
  ["sub.mapa", "Mapa y bodega", "Mapa i celler", "Map and estate", "Carte et domaine", "Mapa e produtor"],
  ["sub.vinos", "Vinos de la zona", "Vins de la zona", "Wines of the region", "Vins de la région", "Vinhos da região"],
  ["sub.taste", "Cuaderno de cata", "Quadern de tast", "Tasting notebook", "Carnet de dégustation", "Caderno de prova"],
  ["sub.anadas", "Añadas", "Anyades", "Vintages", "Millésimes", "Colheitas"],
  ["sub.compras", "Compras e historial", "Compres i historial", "Purchases and history", "Achats et historique", "Compras e histórico"],
  ["sub.bottle", "Ubicación física", "Ubicació física", "Physical location", "Emplacement physique", "Localização física"],
  ["sub.add", "Añadir a vinoteca", "Afegir a la vinoteca", "Add to cellar", "Ajouter à la cave", "Adicionar à adega"],
  ["sub.sheet", "Ficha", "Fitxa", "Sheet", "Fiche", "Ficha"],
  ["menu.ratings", "Calificaciones", "Qualificacions", "Scores", "Notes", "Classificações"],
  ["menu.pairings", "Maridajes", "Maridatges", "Pairings", "Accords", "Harmonizações"],
  ["menu.keep", "Conservación", "Conservació", "Keeping", "Conservation", "Conservação"],
  ["menu.servicio", "Servicio en copa", "Servei en copa", "Service in the glass", "Service au verre", "Serviço no copo"],
  ["menu.tecnica", "Ficha técnica", "Fitxa tècnica", "Technical sheet", "Fiche technique", "Ficha técnica"],
  ["menu.historia", "Historia", "Història", "History", "Histoire", "História"],
  ["menu.mercado", "Valor de mercado", "Valor de mercat", "Market value", "Valeur de marché", "Valor de mercado"],
  ["menu.evolve", "Evolución y fechas", "Evolució i dates", "Ageing and dates", "Élevage et dates", "Estágio e datas"],
  ["menu.origen", "Origen y hueco", "Origen i forat", "Origin and slot", "Origine et emplacement", "Origem e lugar"],
  ["menu.mapa", "Mapa y bodega", "Mapa i celler", "Map and estate", "Carte et domaine", "Mapa e produtor"],
  ["menu.profile", "Perfil", "Perfil", "Profile", "Profil", "Perfil"],
  ["menu.taste", "Cuaderno de cata", "Quadern de tast", "Tasting notebook", "Carnet de dégustation", "Caderno de prova"],
  ["menu.bottle", "Ubicación física", "Ubicació física", "Physical location", "Emplacement physique", "Localização física"],
  ["menu.compras", "Compras e historial", "Compres i historial", "Purchases and history", "Achats et historique", "Compras e histórico"],
  ["menu.anadas", "Añadas", "Anyades", "Vintages", "Millésimes", "Colheitas"],
  ["taste.edit", "Editar cata", "Editar tast", "Edit tasting", "Modifier la dégustation", "Editar prova"],
  ["taste.sheet", "Hoja de cata", "Full de tast", "Tasting sheet", "Fiche de dégustation", "Folha de prova"],
  ["taste.yours", "Tu nota, no la de las guías.", "La teva nota, no la de les guies.", "Your note, not the guides'.", "Votre note, pas celle des guides.", "A sua nota, não a dos guias."],
  ["taste.date", "Fecha", "Data", "Date", "Date", "Data"],
  ["taste.sight", "Vista", "Vista", "Sight", "Œil", "Vista"],
  ["taste.intensity", "Intensidad", "Intensitat", "Intensity", "Intensité", "Intensidade"],
  ["taste.pale", "Pálido", "Pàl·lid", "Pale", "Pâle", "Pálido"],
  ["taste.deep", "Cubierto", "Cobert", "Deep", "Soutenu", "Coberto"],
  ["taste.nose", "Nariz", "Nas", "Nose", "Nez", "Nariz"],
  ["taste.closed", "Cerrada", "Tancada", "Closed", "Fermé", "Fechado"],
  ["taste.intense", "Intensa", "Intensa", "Intense", "Intense", "Intenso"],
  ["taste.otherAroma", "Otros aromas", "Altres aromes", "Other aromas", "Autres arômes", "Outros aromas"],
  ["taste.otherPh", "Lo que no está en las fichas", "El que no és a les fitxes", "What is not on the cards", "Ce qui n'est pas sur les fiches", "O que não está nas fichas"],
  ["taste.palate", "Boca", "Boca", "Palate", "Bouche", "Boca"],
  ["taste.weak", "Débil", "Feble", "Weak", "Faible", "Fraco"],
  ["taste.acid", "Ácido", "Àcid", "Acid", "Acide", "Ácido"],
  ["taste.dry", "Seco", "Sec", "Dry", "Sec", "Seco"],
  ["taste.sweet", "Dulce", "Dolç", "Sweet", "Doux", "Doce"],
  ["taste.soft", "Suave", "Suau", "Soft", "Souple", "Suave"],
  ["taste.tannic", "Tánico", "Tànnic", "Tannic", "Tannique", "Tânico"],
  ["taste.light", "Ligero", "Lleuger", "Light", "Léger", "Leve"],
  ["taste.powerful", "Poderoso", "Poderós", "Powerful", "Puissant", "Poderoso"],
  ["taste.finish", "Final / persistencia", "Final / persistència", "Finish / length", "Finale / persistance", "Final / persistência"],
  ["taste.short", "Corto", "Curt", "Short", "Court", "Curto"],
  ["taste.long", "Largo", "Llarg", "Long", "Long", "Longo"],
  ["taste.close", "Conclusión", "Conclusió", "Conclusion", "Conclusion", "Conclusão"],
  ["taste.score", "Puntuación (0–100)", "Puntuació (0–100)", "Score (0–100)", "Note (0–100)", "Pontuação (0–100)"],
  ["taste.memory", "Recuerdo", "Record", "Memory", "Souvenir", "Memória"],
  ["taste.memoryPh", "¿Qué se te queda en la memoria?", "Què et queda a la memòria?", "What stays in your memory?", "Que vous reste-t-il en mémoire ?", "O que lhe fica na memória?"],
  ["taste.save", "Guardar cata", "Desar tast", "Save tasting", "Enregistrer la dégustation", "Guardar prova"],
  ["taste.saved", "Cata guardada", "Tast desat", "Tasting saved", "Dégustation enregistrée", "Prova guardada"],
  ["taste.history", "Historial", "Historial", "History", "Historique", "Histórico"],
  ["taste.evolve", "Evolución", "Evolució", "Ageing", "Évolution", "Evolução"],
  ["taste.new", "Nueva cata", "Nou tast", "New tasting", "Nouvelle dégustation", "Nova prova"],
  ["taste.none", "Aún no hay catas de este vino.", "Encara no hi ha tastos d'aquest vi.", "No tastings of this wine yet.", "Pas encore de dégustations de ce vin.", "Ainda não há provas deste vinho."],
  ["taste.noScore", "Sin puntuación", "Sense puntuació", "No score", "Sans note", "Sem pontuação"],
  ["taste.noDate", "Sin fecha", "Sense data", "No date", "Sans date", "Sem data"],
  ["taste.editBtn", "Editar", "Editar", "Edit", "Modifier", "Editar"],
  ["taste.noPoints", "Aún no hay puntuación para ver la evolución.", "Encara no hi ha puntuació per veure l'evolució.", "No score yet to show the evolution.", "Pas encore de note pour voir l'évolution.", "Ainda não há pontuação para ver a evolução."],
  ["taste.over", "{n} sobre 100", "{n} sobre 100", "{n} out of 100", "{n} sur 100", "{n} em 100"],
  ["taste.acidL", "Acidez", "Acidesa", "Acidity", "Acidité", "Acidez"],
  ["taste.sweetL", "Dulzor", "Dolçor", "Sweetness", "Douceur", "Doçura"],
  ["taste.tanninL", "Tanino", "Taní", "Tannin", "Tanin", "Tanino"],
  ["taste.bodyL", "Cuerpo", "Cos", "Body", "Corps", "Corpo"],
  ["taste.finishL", "Final", "Final", "Finish", "Finale", "Final"],
  ["taste.gone", "Esa bebida ya no está", "Aquesta beguda ja no hi és", "That drink is gone", "Ce consommé n'est plus là", "Essa bebida já não está"],
  ["tech.grapes", "Uvas", "Raïms", "Grapes", "Cépages", "Castas"],
  ["tech.pct", "El porcentaje es opcional. La lista que ya tenías se queda.", "El percentatge és opcional. La llista que ja tenies es queda.", "The percentage is optional. The list you already had stays.", "Le pourcentage est facultatif. La liste que vous aviez reste.", "A percentagem é opcional. A lista que já tinha fica."],
  ["tech.addGrape", "Añadir uva", "Afegir raïm", "Add a grape", "Ajouter un cépage", "Adicionar casta"],
  ["tech.elevage", "Crianza", "Criança", "Ageing", "Élevage", "Estágio"],
  ["tech.months", "Meses", "Mesos", "Months", "Mois", "Meses"],
  ["tech.vessel", "Recipiente", "Recipient", "Vessel", "Récipient", "Recipiente"],
  ["tech.oak", "Roble", "Roure", "Oak", "Chêne", "Carvalho"],
  ["tech.newOak", "% roble nuevo", "% roure nou", "% new oak", "% chêne neuf", "% carvalho novo"],
  ["tech.free", "Texto libre", "Text lliure", "Free text", "Texte libre", "Texto livre"],
  ["tech.freePh", "La crianza, con tus palabras", "La criança, amb les teves paraules", "The ageing, in your words", "L'élevage, avec vos mots", "O estágio, com as suas palavras"],
  ["tech.save", "Guardar uvas y crianza", "Desar raïms i criança", "Save grapes and ageing", "Enregistrer cépages et élevage", "Guardar castas e estágio"],
  ["tech.saved", "Uvas y crianza guardadas", "Raïms i criança desats", "Grapes and ageing saved", "Cépages et élevage enregistrés", "Castas e estágio guardados"],
  ["tech.edit", "Editar uvas y crianza", "Editar raïms i criança", "Edit grapes and ageing", "Modifier cépages et élevage", "Editar castas e estágio"],
  ["tech.noText", "Sin texto", "Sense text", "No text", "Sans texte", "Sem texto"],
  ["vessel.barrica", "Barrica", "Bóta", "Barrel", "Barrique", "Barrica"],
  ["vessel.fudre", "Fudre", "Foudre", "Foudre", "Foudre", "Foudre"],
  ["vessel.deposito", "Depósito", "Dipòsit", "Tank", "Cuve", "Depósito"],
  ["vessel.anfora", "Ánfora", "Àmfora", "Amphora", "Amphore", "Ânfora"],
  ["vessel.botella", "Botella", "Ampolla", "Bottle", "Bouteille", "Garrafa"],
  ["vessel.hormigon", "Hormigón", "Formigó", "Concrete", "Béton", "Betão"],
  ["vessel.mixto", "Mixto", "Mixt", "Mixed", "Mixte", "Misto"],
  ["oak.frances", "Francés", "Francès", "French", "Français", "Francês"],
  ["oak.americano", "Americano", "Americà", "American", "Américain", "Americano"],
  ["oak.hungaro", "Húngaro", "Hongarès", "Hungarian", "Hongrois", "Húngaro"],
  ["oak.mixto", "Mixto", "Mixt", "Mixed", "Mixte", "Misto"],
  ["oak.ninguno", "Ninguno", "Cap", "None", "Aucun", "Nenhum"],
  ["fact.grapes", "Uvas", "Raïms", "Grapes", "Cépages", "Castas"],
  ["fact.abv", "Alcohol", "Alcohol", "Alcohol", "Alcool", "Álcool"],
  ["fact.style", "Estilo", "Estil", "Style", "Style", "Estilo"],
  ["fact.zone", "Zona", "Zona", "Region", "Région", "Região"],
  ["fact.drink", "Beber", "Beure", "Drink", "Boire", "Beber"],
  ["fact.limit", "Límite", "Límit", "Limit", "Limite", "Limite"],
  ["fact.pair", "Maridaje", "Maridatge", "Pairing", "Accord", "Harmonização"],
  ["fact.alt", "Altitud", "Altitud", "Altitude", "Altitude", "Altitude"],
  ["fact.soils", "Suelos", "Sòls", "Soils", "Sols", "Solos"],
  ["fact.vineyard", "Viñedo", "Vinya", "Vineyard", "Vignoble", "Vinha"],
  ["fact.vini", "Vinificación", "Vinificació", "Vinification", "Vinification", "Vinificação"],
  ["fact.elevage", "Crianza", "Criança", "Ageing", "Élevage", "Estágio"],
  ["fact.glass", "Copa", "Copa", "Glass", "Verre", "Copo"],
  ["fact.oxygen", "Oxígeno", "Oxigen", "Oxygen", "Oxygène", "Oxigénio"],
  ["fact.cellar", "Guarda en cava", "Guarda al celler", "Cellar keeping", "Garde en cave", "Guarda na adega"],
  ["fact.pos", "Posición", "Posició", "Position", "Position", "Posição"],
  ["fact.cellarShort", "Vinoteca", "Vinoteca", "Cellar", "Cave", "Adega"],
  ["fact.service", "Servicio", "Servei", "Service", "Service", "Serviço"],
  ["fact.serve", "Servir", "Servir", "Serve", "Servir", "Servir"],
  ["fact.decant", "Decantar", "Decantar", "Decant", "Carafer", "Decantar"],
  ["fact.humidity", "Humedad", "Humitat", "Humidity", "Humidité", "Humidade"],
  ["fact.bin", "Estantería / hueco", "Prestatge / forat", "Shelf / slot", "Clayette / emplacement", "Prateleira / lugar"],
  ["fact.hidden", "Oculto", "Ocult", "Hidden", "Masqué", "Oculto"],
  ["fact.qty", "Cantidad", "Quantitat", "Quantity", "Quantité", "Quantidade"],
  ["fact.in", "Entrada", "Entrada", "In", "Entrée", "Entrada"],
  ["fact.price", "Precio", "Preu", "Price", "Prix", "Preço"],
  ["fact.low", "Baja", "Baixa", "Low", "Basse", "Baixa"],
  ["fact.mid", "Media", "Mitjana", "Mid", "Moyenne", "Média"],
  ["fact.high", "Alta", "Alta", "High", "Haute", "Alta"],
  ["fact.yourCost", "Tu coste", "El teu cost", "Your cost", "Votre coût", "O seu custo"],
  ["fact.published", "Cata publicada", "Tast publicat", "Published tasting", "Dégustation publiée", "Prova publicada"],
  ["fact.making", "Elaboración", "Elaboració", "Winemaking", "Élaboration", "Elaboração"],
  ["fact.vintageNote", "Crítica de añada {y}", "Crítica d'anyada {y}", "Vintage note {y}", "Note du millésime {y}", "Nota da colheita {y}"],
  ["fact.refs", "Referencias", "Referències", "References", "Références", "Referências"],
  ["fact.sameZone", "Misma zona", "Mateixa zona", "Same region", "Même région", "Mesma região"],
  ["fact.onlyOne", "Solo esta referencia de la casa.", "Només aquesta referència de la casa.", "Only this cuvée from the house.", "Seule cette cuvée de la maison.", "Só esta referência da casa."],
  ["fact.similar", "Parecidos en catálogo", "Semblants al catàleg", "Similar in the catalogue", "Proches au catalogue", "Parecidos no catálogo"],
  ["fact.priceEvo", "Evolución de precio", "Evolució de preu", "Price evolution", "Évolution du prix", "Evolução do preço"],
  ["fact.from", "De dónde sale cada dato", "D'on surt cada dada", "Where each fact comes from", "D'où vient chaque donnée", "De onde sai cada dado"],
  ["fact.pageRead", "Página leída: {host}", "Pàgina llegida: {host}", "Page read: {host}", "Page lue : {host}", "Página lida: {host}"],
  ["fact.techFull", "Ficha técnica completa ›", "Fitxa tècnica completa ›", "Full technical sheet ›", "Fiche technique complète ›", "Ficha técnica completa ›"],
  ["fact.personalLink", "Cata personal ›", "Tast personal ›", "Personal tasting ›", "Dégustation personnelle ›", "Prova pessoal ›"],
  ["fact.historyLink", "Historia y añada ›", "Història i anyada ›", "History and vintage ›", "Histoire et millésime ›", "História e colheita ›"],
  ["fact.evolveLink", "Evolución y fechas ›", "Evolució i dates ›", "Ageing and dates ›", "Élevage et dates ›", "Estágio e datas ›"],
  ["fact.backMap", "Volver al mapa", "Tornar al mapa", "Back to the map", "Retour à la carte", "Voltar ao mapa"],
  ["fact.serviceLink", "Protocolo de servicio ›", "Protocol de servei ›", "Service protocol ›", "Protocole de service ›", "Protocolo de serviço ›"],
  ["fact.zoneMap", "Ver mapa de la zona", "Veure el mapa de la zona", "See the region map", "Voir la carte de la région", "Ver o mapa da região"],
  ["fact.notIn", "Este vino aún no está en tu cava.", "Aquest vi encara no és al teu celler.", "This wine is not in your cellar yet.", "Ce vin n'est pas encore dans votre cave.", "Este vinho ainda não está na sua adega."],
  ["fact.pickSlot", "Elegir hueco", "Triar forat", "Choose a slot", "Choisir l'emplacement", "Escolher lugar"],
  ["fact.otherPlace", "Otra ubicación", "Una altra ubicació", "Another location", "Autre emplacement", "Outra localização"],
  ["fact.serve1", "Servir 1", "Servir 1", "Serve 1", "Servir 1", "Servir 1"],
  ["fact.serveN", "Servir N", "Servir N", "Serve N", "Servir N", "Servir N"],
  ["fact.pending", "pendiente", "pendent", "pending", "en attente", "pendente"],
  ["fact.notCellar", "No está en cava", "No és al celler", "Not in the cellar", "Pas en cave", "Não está na adega"],
  ["fact.notYet", "aún no está en la bodega", "encara no és al celler", "not in the cellar yet", "pas encore en cave", "ainda não está na adega"],
  ["fact.estate", "Bodega", "Celler", "Estate", "Domaine", "Produtor"],
  ["fact.vintage", "Añada", "Anyada", "Vintage", "Millésime", "Colheita"],
  ["fact.app", "Denominación", "Denominació", "Appellation", "Appellation", "Denominação"],
  ["fact.region", "Región", "Regió", "Region", "Région", "Região"],
  ["fact.country", "País", "País", "Country", "Pays", "País"],
  ["fact.guides", "Guías del sector + nota de la casa. Vivino no tiene API: la media es de dossier, no de la web en vivo.", "Guies del sector + nota de la casa. Vivino no té API: la mitjana és de dossier, no de la web en viu.", "Trade guides plus the house note. Vivino has no API: the average is from the dossier, not the live web.", "Guides du métier + note de la maison. Vivino n'a pas d'API : la moyenne vient du dossier, pas du web en direct.", "Guias do setor + nota da casa. O Vivino não tem API: a média é do dossier, não da web ao vivo."],
  ["fact.estimate", "estimación", "estimació", "estimate", "estimation", "estimativa"],
  ["fact.noGuide", "Sin párrafo propio de esta guía para la añada. La nota de la casa está abajo.", "Sense paràgraf propi d'aquesta guia per a l'anyada. La nota de la casa és a sota.", "This guide has no paragraph of its own for the vintage. The house note is below.", "Ce guide n'a pas de paragraphe propre pour le millésime. La note de la maison est plus bas.", "Este guia não tem parágrafo próprio da colheita. A nota da casa está abaixo."],
  ["fact.users", "usuarios", "usuaris", "users", "utilisateurs", "utilizadores"],
  ["fact.reviews", "valoraciones", "valoracions", "ratings", "avis", "avaliações"],
  ["fact.houseNote", "Nota de cata (casa)", "Nota de tast (casa)", "Tasting note (house)", "Note de dégustation (maison)", "Nota de prova (casa)"],
  ["fact.sheetWord", "ficha", "fitxa", "sheet", "fiche", "ficha"],
  ["fact.howKeep", "Cómo conservarlo", "Com conservar-lo", "How to keep it", "Comment le conserver", "Como o conservar"],
  ["fact.howKeepBody", "Horizontal, oscuro, sin UV ni vibración de electrodomésticos. Estabilidad antes que la cifra exacta: más de 2 °C de oscilación acelera la evolución.", "Horitzontal, fosc, sense UV ni vibració d'electrodomèstics. Estabilitat abans que la xifra exacta: més de 2 °C d'oscil·lació accelera l'evolució.", "On its side, in the dark, away from UV and appliance vibration. Stability matters more than the exact figure: a swing of more than 2 °C speeds the evolution.", "Couché, dans le noir, sans UV ni vibration d'appareils. La stabilité compte plus que le chiffre exact : plus de 2 °C d'oscillation accélère l'évolution.", "Deitada, no escuro, sem UV nem vibração de eletrodomésticos. A estabilidade importa mais do que o número exacto: mais de 2 °C de oscilação acelera a evolução."],
  ["fact.light", "Luz: {light}. El corcho vive con humedad {h}: por debajo se reseca y entra oxígeno; por encima hay moho en la cápsula.", "Llum: {light}. El suro viu amb humitat {h}: per sota s'asseca i entra oxigen; per sobre hi ha floridura a la càpsula.", "Light: {light}. The cork lives at humidity {h}: below that it dries and oxygen gets in; above that the capsule grows mould.", "Lumière : {light}. Le bouchon vit à l'humidité {h} : en dessous il sèche et l'oxygène entre ; au-dessus, la capsule moisit.", "Luz: {light}. A rolha vive com humidade {h}: abaixo seca e entra oxigénio; acima há bolor na cápsula."],
  ["fact.now", "hoy {y}", "avui {y}", "today {y}", "aujourd'hui {y}", "hoje {y}"],
  ["fact.state", "Estado actual", "Estat actual", "Current state", "État actuel", "Estado atual"],
  ["fact.noWindow", "Sin dato de ventana. Pulsa Completar ficha.", "Sense dada de finestra. Prem Completar fitxa.", "No window data. Tap Complete the sheet.", "Pas de donnée de fenêtre. Appuyez sur Compléter la fiche.", "Sem dado de janela. Prima Completar ficha."],
  ["fact.vintageLine", "Añada {v}. Beber desde {from}. Apogeo {a}–{b}. Límite prudente {h}.", "Anyada {v}. Beure des de {from}. Apogeu {a}–{b}. Límit prudent {h}.", "Vintage {v}. Drink from {from}. Peak {a}–{b}. Prudent limit {h}.", "Millésime {v}. Boire dès {from}. Apogée {a}–{b}. Limite prudente {h}.", "Colheita {v}. Beber desde {from}. Apogeu {a}–{b}. Limite prudente {h}."],
  ["fact.vintageUnknown", "Añada {v}. Ventana de consumo: sin dato.", "Anyada {v}. Finestra de consum: sense dada.", "Vintage {v}. Drinking window: no data.", "Millésime {v}. Fenêtre de consommation : sans donnée.", "Colheita {v}. Janela de consumo: sem dado."],
  ["fact.sourceFicha", "Ficha", "Fitxa", "Sheet", "Fiche", "Ficha"],
  ["fact.sourceDossier", "Dossier", "Dossier", "Dossier", "Dossier", "Dossier"],
  ["fact.sourcePage", "Página", "Pàgina", "Page", "Page", "Página"],
  ["fact.sourceNone", "Sin fuente", "Sense font", "No source", "Sans source", "Sem fonte"],
  ["fact.confidence", "confianza", "confiança", "confidence", "confiance", "confiança"],
  ["src.page", "página", "pàgina", "page", "page", "página"],
  ["src.title", "título", "títol", "title", "titre", "título"],
  ["src.gemini", "estimación Gemini", "estimació Gemini", "Gemini estimate", "estimation Gemini", "estimativa Gemini"],
  ["src.default", "valor por defecto", "valor per defecte", "default value", "valeur par défaut", "valor por defeito"],
  ["prov.type", "tipo", "tipus", "type", "type", "tipo"],
  ["prov.grapes", "uvas", "raïms", "grapes", "cépages", "castas"],
  ["prov.region", "zona", "zona", "region", "région", "região"],
  ["prov.country", "país", "país", "country", "pays", "país"],
  ["prov.abv", "alcohol", "alcohol", "alcohol", "alcool", "álcool"],
  ["prov.tasting", "cata", "tast", "tasting", "dégustation", "prova"],
  ["prov.crianza", "crianza", "criança", "ageing", "élevage", "estágio"],
  ["prov.service", "servicio", "servei", "service", "service", "serviço"],
  ["prov.cellar", "guarda", "guarda", "keeping", "garde", "guarda"],
  ["prov.pairing", "maridajes", "maridatges", "pairings", "accords", "harmonizações"],
  ["prov.aging", "fechas de consumo", "dates de consum", "drinking dates", "dates de consommation", "datas de consumo"],
  ["prov.producer", "bodega", "celler", "estate", "domaine", "produtor"],
  ["prov.style", "estilo", "estil", "style", "style", "estilo"],
  ["prov.ratings", "puntuaciones", "puntuacions", "scores", "notes", "pontuações"],
  ["prov.dossier", "historia y técnica", "història i tècnica", "history and craft", "histoire et technique", "história e técnica"],
  ["prov.web", "web y mapa", "web i mapa", "web and map", "web et carte", "web e mapa"],
  ["prov.price", "precio", "preu", "price", "prix", "preço"],
  ["prov.evolution", "evolución", "evolució", "evolution", "évolution", "evolução"],
  ["prov.vintages", "añadas", "anyades", "vintages", "millésimes", "colheitas"],
  ["prov.shops", "tiendas", "botigues", "shops", "boutiques", "lojas"],
  ["tr.title", "Traducción", "Traducció", "Translation", "Traduction", "Tradução"],
  ["tr.button", "Traducir", "Traduir", "Translate", "Traduire", "Traduzir"],
  ["tr.keep", "El original en español se queda. La traducción usa tu clave de Gemini y se guarda solo en este iPhone.", "L'original en espanyol es queda. La traducció fa servir la teva clau de Gemini i es desa només en aquest iPhone.", "The Spanish original stays. Translation uses your Gemini key and is kept only on this iPhone.", "L'original en espagnol reste. La traduction utilise votre clé Gemini et reste seulement sur cet iPhone.", "O original em espanhol fica. A tradução usa a sua chave Gemini e guarda-se só neste iPhone."],
  ["tr.already", "El texto del catálogo ya está en español.", "El text del catàleg ja és en espanyol.", "The catalogue text is already in Spanish.", "Le texte du catalogue est déjà en espagnol.", "O texto do catálogo já está em espanhol."],
  ["tr.needKey", "Para traducir hace falta la clave de Gemini, en Avisos.", "Per traduir cal la clau de Gemini, a Avisos.", "Translation needs the Gemini key, in Notices.", "Pour traduire, il faut la clé Gemini, dans Alertes.", "Para traduzir é precisa a chave Gemini, em Avisos."],
  ["tr.working", "Traduciendo…", "Traduïnt…", "Translating…", "Traduction…", "A traduzir…"],
  ["tr.fail", "No se ha podido traducir.", "No s'ha pogut traduir.", "It could not be translated.", "La traduction n'a pas abouti.", "Não foi possível traduzir."],
  ["tr.done", "Traducción guardada en este iPhone.", "Traducció desada en aquest iPhone.", "Translation saved on this iPhone.", "Traduction enregistrée sur cet iPhone.", "Tradução guardada neste iPhone."],
  ["gemini.busy", "Sigue completando la ficha anterior", "Segueix completant la fitxa anterior", "Still finishing the previous sheet", "La fiche précédente n'est pas finie", "Ainda a completar a ficha anterior"],
  ["gemini.partial", "Ficha a medias", "Fitxa a mitges", "Sheet only partly filled", "Fiche à moitié", "Ficha a meio"],
  ["gemini.updated", "Ficha actualizada", "Fitxa actualitzada", "Sheet updated", "Fiche mise à jour", "Ficha atualizada"],
  ["gemini.fail", "No se pudo completar la ficha", "No s'ha pogut completar la fitxa", "The sheet could not be completed", "La fiche n'a pas pu être complétée", "Não foi possível completar a ficha"],
  ["gemini.needName", "Escribe bodega y añada", "Escriu celler i anyada", "Type the estate and vintage", "Saisissez le domaine et le millésime", "Escreva o produtor e a colheita"],
  ["gemini.gone", "Ese resultado ya no está", "Aquest resultat ja no hi és", "That result is gone", "Ce résultat n'est plus là", "Esse resultado já não está"],
  ["gemini.noCreate", "No se pudo crear la ficha", "No s'ha pogut crear la fitxa", "The sheet could not be created", "La fiche n'a pas pu être créée", "Não foi possível criar a ficha"],
  ["gemini.searching", "Buscando el vino en internet…", "Buscant el vi a internet…", "Looking the wine up…", "Recherche du vin sur internet…", "A procurar o vinho na internet…"],
  ["gemini.readingRoll", "Foto elegida. Leyendo la etiqueta para buscar el vino.", "Foto triada. Llegint l'etiqueta per buscar el vi.", "Photo chosen. Reading the label to look the wine up.", "Photo choisie. Lecture de l'étiquette pour chercher le vin.", "Foto escolhida. A ler o rótulo para procurar o vinho."],
  ["gemini.reading", "Analizando la foto. Un momento.", "Analitzant la foto. Un moment.", "Reading the photo. One moment.", "Analyse de la photo. Un instant.", "A analisar a foto. Um momento."],
  ["gemini.noSheet", "No hay ficha", "No hi ha fitxa", "No sheet", "Pas de fiche", "Não há ficha"],
  ["gemini.shops", "Bodega y tiendas", "Celler i botigues", "Estate and shops", "Domaine et boutiques", "Produtor e lojas"],
  ["gemini.inCatalog", "En el catálogo", "Al catàleg", "In the catalogue", "Au catalogue", "No catálogo"],
  ["chip.Rubí", "Rubí", "Rubí", "Ruby", "Rubis", "Rubi"],
  ["chip.Granate", "Granate", "Granat", "Garnet", "Grenat", "Granada"],
  ["chip.Picota", "Picota", "Cirera negra", "Black cherry", "Cerise noire", "Cereja negra"],
  ["chip.Púrpura", "Púrpura", "Porpra", "Purple", "Pourpre", "Púrpura"],
  ["chip.Teja", "Teja", "Teula", "Brick", "Tuile", "Tijolo"],
  ["chip.Pajizo", "Pajizo", "Palla", "Straw", "Paille", "Palha"],
  ["chip.Amarillo", "Amarillo", "Groc", "Yellow", "Jaune", "Amarelo"],
  ["chip.Verdoso", "Verdoso", "Verdós", "Greenish", "Verdâtre", "Esverdeado"],
  ["chip.Dorado", "Dorado", "Daurat", "Gold", "Doré", "Dourado"],
  ["chip.Ámbar", "Ámbar", "Ambre", "Amber", "Ambre", "Âmbar"],
  ["chip.Amarillo pálido", "Amarillo pálido", "Groc pàl·lid", "Pale yellow", "Jaune pâle", "Amarelo pálido"],
  ["chip.Rosado", "Rosado", "Rosat", "Rosé", "Rosé", "Rosé"],
  ["chip.Cobrizo", "Cobrizo", "Coure", "Copper", "Cuivré", "Acobreado"],
  ["chip.Rosa pálido", "Rosa pálido", "Rosa pàl·lid", "Pale pink", "Rose pâle", "Rosa pálido"],
  ["chip.Salmón", "Salmón", "Salmó", "Salmon", "Saumon", "Salmão"],
  ["chip.Frambuesa", "Frambuesa", "Gerd", "Raspberry", "Framboise", "Framboesa"],
  ["chip.Piel de cebolla", "Piel de cebolla", "Pell de ceba", "Onion skin", "Pelure d'oignon", "Pele de cebola"],
  ["chip.Topacio", "Topacio", "Topazi", "Topaz", "Topaze", "Topázio"],
  ["chip.Caoba", "Caoba", "Caoba", "Mahogany", "Acajou", "Mogno"],
  ["chip.Oro", "Oro", "Or", "Gold", "Or", "Ouro"],
  ["chip.Palo cortado", "Palo cortado", "Palo cortado", "Palo cortado", "Palo cortado", "Palo cortado"],
  ["chip.Fruta", "Fruta", "Fruita", "Fruit", "Fruit", "Fruta"],
  ["chip.Cereza", "Cereza", "Cirera", "Cherry", "Cerise", "Cereja"],
  ["chip.Fresa", "Fresa", "Maduixa", "Strawberry", "Fraise", "Morango"],
  ["chip.Ciruela", "Ciruela", "Pruna", "Plum", "Prune", "Ameixa"],
  ["chip.Mora", "Mora", "Móra", "Blackberry", "Mûre", "Amora"],
  ["chip.Manzana", "Manzana", "Poma", "Apple", "Pomme", "Maçã"],
  ["chip.Cítricos", "Cítricos", "Cítrics", "Citrus", "Agrumes", "Citrinos"],
  ["chip.Melocotón", "Melocotón", "Préssec", "Peach", "Pêche", "Pêssego"],
  ["chip.Fruta tropical", "Fruta tropical", "Fruita tropical", "Tropical fruit", "Fruit tropical", "Fruta tropical"],
  ["chip.Fruta pasa", "Fruta pasa", "Fruita seca", "Dried fruit", "Fruit sec", "Fruta passa"],
  ["chip.Floral", "Floral", "Floral", "Floral", "Floral", "Floral"],
  ["chip.Rosa", "Rosa", "Rosa", "Rose", "Rose", "Rosa"],
  ["chip.Violeta", "Violeta", "Violeta", "Violet", "Violette", "Violeta"],
  ["chip.Flores blancas", "Flores blancas", "Flors blanques", "White flowers", "Fleurs blanches", "Flores brancas"],
  ["chip.Jazmín", "Jazmín", "Gessamí", "Jasmine", "Jasmin", "Jasmim"],
  ["chip.Especias", "Especias", "Espècies", "Spice", "Épices", "Especiarias"],
  ["chip.Pimienta", "Pimienta", "Pebre", "Pepper", "Poivre", "Pimenta"],
  ["chip.Clavo", "Clavo", "Clau", "Clove", "Clou de girofle", "Cravo"],
  ["chip.Canela", "Canela", "Canyella", "Cinnamon", "Cannelle", "Canela"],
  ["chip.Regaliz", "Regaliz", "Regalèssia", "Liquorice", "Réglisse", "Alcaçuz"],
  ["chip.Hierbas", "Hierbas", "Herbes", "Herbs", "Herbes", "Ervas"],
  ["chip.Madera", "Madera", "Fusta", "Wood", "Bois", "Madeira"],
  ["chip.Vainilla", "Vainilla", "Vainilla", "Vanilla", "Vanille", "Baunilha"],
  ["chip.Coco", "Coco", "Coco", "Coconut", "Noix de coco", "Coco"],
  ["chip.Cedro", "Cedro", "Cedre", "Cedar", "Cèdre", "Cedro"],
  ["chip.Tostado", "Tostado", "Torrat", "Toast", "Toasté", "Tostado"],
  ["chip.Café", "Café", "Cafè", "Coffee", "Café", "Café"],
  ["chip.Chocolate", "Chocolate", "Xocolata", "Chocolate", "Chocolat", "Chocolate"],
  ["chip.Terciarios", "Terciarios", "Terciaris", "Tertiary", "Tertiaires", "Terciários"],
  ["chip.Cuero", "Cuero", "Cuir", "Leather", "Cuir", "Couro"],
  ["chip.Tabaco", "Tabaco", "Tabac", "Tobacco", "Tabac", "Tabaco"],
  ["chip.Tierra", "Tierra", "Terra", "Earth", "Terre", "Terra"],
  ["chip.Setas", "Setas", "Bolets", "Mushrooms", "Champignons", "Cogumelos"],
  ["chip.Balsámico", "Balsámico", "Balsàmic", "Balsamic", "Balsamique", "Balsâmico"],
  ["chip.Miel", "Miel", "Mel", "Honey", "Miel", "Mel"]
];
const I18N = { es: {}, ca: {}, en: {}, fr: {}, pt: {} };
I18N_ROWS.forEach(row => {
  I18N_ORDER.forEach((code, i) => { I18N[code][row[0]] = row[i + 1]; });
});
const OCCASION_IDS = ["cena", "celebracion", "cata", "regalo"];
let appLang = "es";
let langRefresh = false;
function appLocale() {
  const hit = LANG_CHOICES.find(c => c.code === appLang);
  return hit ? hit.locale : "es-ES";
}
function deviceLang() {
  const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || "es"];
  for (let i = 0; i < list.length; i++) {
    const base = String(list[i] || "").toLowerCase().split("-")[0];
    if (base === "pt" || base === "en" || base === "fr" || base === "ca" || base === "es") return base;
    if (I18N[base]) return base;
  }
  return "es";
}
function resolveLang() {
  try {
    const saved = (typeof state !== "undefined" && state && state.prefs && state.prefs.lang) || "";
    if (I18N[saved]) return saved;
  } catch (e) {}
  return deviceLang();
}
function t(key, vars) {
  const pack = I18N[appLang] || I18N.es;
  let s = Object.prototype.hasOwnProperty.call(pack, key) ? pack[key] : undefined;
  if (s == null || s === "") s = I18N.es[key];
  if (s == null) s = key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      s = String(s).split("{" + k + "}").join(vars[k] == null ? "" : String(vars[k]));
    });
  }
  return s;
}
function formatEuro(n) {
  const v = Math.round(Number(n) || 0);
  try {
    return new Intl.NumberFormat(appLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
  } catch (e) {
    return v + " €";
  }
}
function formatDate(iso) {
  if (!iso || iso === "—") return iso || "—";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  try {
    return new Intl.DateTimeFormat(appLocale(), { day: "numeric", month: "short", year: "numeric" }).format(d);
  } catch (e) {
    return String(iso);
  }
}
function formatMonth(yearMonth) {
  const m = String(yearMonth || "").match(/^(\d{4})-(\d{2})/);
  if (!m) return String(yearMonth || "");
  const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  try {
    return new Intl.DateTimeFormat(appLocale(), { month: "long", year: "numeric" }).format(d);
  } catch (e) {
    return String(yearMonth);
  }
}
function formatWhen(ts) {
  if (!ts) return t("backup.never");
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return t("backup.never");
  try {
    return new Intl.DateTimeFormat(appLocale(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
  } catch (e) {
    return String(ts);
  }
}
function nounBottles(n) {
  return Number(n) === 1 ? t("noun.bottle") : t("noun.bottles");
}
function nounLots(n) {
  return Number(n) === 1 ? t("noun.lot") : t("noun.lots");
}
function wineCountLabel(n) {
  n = Number(n) || 0;
  return n === 1 ? t("zones.wine1") : t("zones.wines", { n: n });
}
function countryLabel(name) {
  const key = "country." + name;
  const hit = t(key);
  return hit === key ? (name || "") : hit;
}
function chipLabel(word) {
  if (!word) return "";
  const key = "chip." + word;
  const hit = t(key);
  return hit === key ? word : hit;
}
function dishById(id) {
  return (window.PAIRING_DISHES || []).find(d => d.id === id) || null;
}
function dishName(d) {
  if (!d) return "";
  const key = "dish." + d.id;
  const hit = t(key);
  return hit === key ? d.name : hit;
}
function dishFamily(d) {
  if (!d || !d.family) return "";
  const key = "family." + String(d.family).toLowerCase();
  const hit = t(key);
  return hit === key ? d.family : hit;
}
function dishHeat(d) {
  if (!d) return "";
  const key = "heat." + d.id;
  const hit = t(key);
  return hit === key ? (d.heat || "") : hit;
}
function occasionIdFrom(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (OCCASION_IDS.indexOf(s) >= 0) return s;
  const legacy = { Cena: "cena", Celebración: "celebracion", Celebracion: "celebracion", Cata: "cata", Regalo: "regalo" };
  if (legacy[s]) return legacy[s];
  for (let i = 0; i < OCCASION_IDS.length; i++) {
    const id = OCCASION_IDS[i];
    const key = "occasion." + id;
    for (let j = 0; j < I18N_ORDER.length; j++) {
      if (I18N[I18N_ORDER[j]][key] === s) return id;
    }
  }
  return s;
}
function occasionLabel(raw) {
  const id = occasionIdFrom(raw);
  if (OCCASION_IDS.indexOf(id) >= 0) return t("occasion." + id);
  return raw || "";
}
function typeKey(value) {
  const tpe = value === "rose" ? "rosado" : value;
  const known = ["todos", "tinto", "blanco", "espumoso", "rosado", "dulce", "generoso", "otro"];
  return known.indexOf(tpe) >= 0 ? tpe : "otro";
}
function applyDom() {
  const loc = appLocale();
  try { document.documentElement.lang = loc; } catch (e) {}
  try { document.documentElement.style.setProperty("--vf-hint", JSON.stringify(t("scan.tap"))); } catch (e) {}
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });
}
function refreshVisible() {
  applyDom();
  langRefresh = true;
  try {
    if (typeof screenId === "undefined") return;
    if (screenId === "wine" && currentWine && typeof openWine === "function") {
      openWine(currentWine.id, currentBottle);
      return;
    }
    if (screenId === "wine-sub" && currentWine && typeof openWine === "function") {
      const sub = currentSub;
      openWine(currentWine.id, currentBottle);
      if (sub && typeof openWineSub === "function") openWineSub(sub);
      return;
    }
    if (screenId === "perfil-sub" && typeof perfilKind !== "undefined" && perfilKind && typeof openPerfilSub === "function") {
      openPerfilSub(perfilKind);
      return;
    }
    if (screenId === "dish" && typeof pairingDish !== "undefined" && pairingDish && typeof openDish === "function") {
      openDish(pairingDish);
      return;
    }
    if (typeof show === "function") show(screenId || "home", { replace: true });
  } catch (e) {
    console.warn("idioma", e);
  } finally {
    langRefresh = false;
  }
}
function setAppLang(code) {
  if (!I18N[code]) return;
  appLang = code;
  try {
    if (typeof state !== "undefined" && state) {
      if (!state.prefs) state.prefs = {};
      state.prefs.lang = code;
      if (typeof save === "function") save();
    }
  } catch (e) {}
  refreshVisible();
}
function bootLang() {
  appLang = resolveLang();
  if (document.body) applyDom();
}
function langPickerHtml() {
  const cur = appLang || "es";
  const chips = LANG_CHOICES.map(c => `<button type="button" class="chip ${c.code === cur ? "on" : ""}" onclick="setAppLang('${c.code}')">${c.endonym}</button>`).join("");
  return `<div class="card" id="lang-picker"><p class="tiny">${t("lang.kicker")}</p><h3 style="margin-top:4px">${t("lang.title")}</h3><p class="muted" style="margin-top:6px">${t("lang.hint")}</p><div class="chip-row" style="margin-top:10px">${chips}</div></div>`;
}
window.t = t;
window.setAppLang = setAppLang;
window.formatEuro = formatEuro;
window.formatDate = formatDate;
window.formatMonth = formatMonth;
window.formatWhen = formatWhen;
window.bootLang = bootLang;
window.applyDom = applyDom;
window.countryLabel = countryLabel;
window.dishName = dishName;
window.dishFamily = dishFamily;
window.dishHeat = dishHeat;
window.occasionLabel = occasionLabel;
window.occasionIdFrom = occasionIdFrom;
window.chipLabel = chipLabel;
window.langPickerHtml = langPickerHtml;
window.nounBottles = nounBottles;
window.nounLots = nounLots;
window.LANG_CHOICES = LANG_CHOICES;
function addI18n(rows) {
  rows.forEach(row => {
    I18N_ORDER.forEach((code, i) => { I18N[code][row[0]] = row[i + 1]; });
  });
}
addI18n([
  ["backup.confirm", "COPIA ENCONTRADA\n{w} vinos\n{b} lotes de botellas\n{t} catas\n{c} vinos propios\n{d} bebidas\n{l} fotos de etiqueta\nFecha: {when}\n\nEsto REEMPLAZA la colección actual. ¿Continuar?", "CÒPIA TROBADA\n{w} vins\n{b} lots d'ampolles\n{t} tastos\n{c} vins propis\n{d} begudes\n{l} fotos d'etiqueta\nData: {when}\n\nAixò REEMPLAÇA la col·lecció actual. Continuar?", "BACKUP FOUND\n{w} wines\n{b} bottle lots\n{t} tastings\n{c} own wines\n{d} drinks\n{l} label photos\nDate: {when}\n\nThis REPLACES the current collection. Continue?", "COPIE TROUVÉE\n{w} vins\n{b} lots de bouteilles\n{t} dégustations\n{c} vins propres\n{d} consommés\n{l} photos d'étiquette\nDate : {when}\n\nCela REMPLACE la collection actuelle. Continuer ?", "CÓPIA ENCONTRADA\n{w} vinhos\n{b} lotes de garrafas\n{t} provas\n{c} vinhos próprios\n{d} bebidas\n{l} fotos de rótulo\nData: {when}\n\nIsto SUBSTITUI a coleção atual. Continuar?"],
  ["scan.shops", "Bodega y tiendas", "Celler i botigues", "Estate and shops", "Domaine et boutiques", "Produtor e lojas"],
  ["scan.inCatalog", "En el catálogo", "Al catàleg", "In the catalogue", "Au catalogue", "No catálogo"],
  ["fact.complete", "Completar ficha", "Completar fitxa", "Complete the sheet", "Compléter la fiche", "Completar ficha"],
  ["fact.shopHint", "Primero la página de la tienda o la bodega. Lo que no aparezca, si hay clave guardada, lo estima Gemini.", "Primer la pàgina de la botiga o el celler. El que no surti, si hi ha clau desada, ho estima Gemini.", "The shop or estate page comes first. Whatever is missing, Gemini estimates if a key is saved.", "D'abord la page de la boutique ou du domaine. Ce qui manque, Gemini l'estime si une clé est enregistrée.", "Primeiro a página da loja ou do produtor. O que não aparecer, se houver chave guardada, o Gemini estima."],
  ["fact.estimateDot", "Estimación. ", "Estimació. ", "Estimate. ", "Estimation. ", "Estimativa. "],
  ["fact.buy", "Compra", "Compra", "Purchase", "Achat", "Compra"],
  ["fact.estimated", "Estimado", "Estimat", "Estimate", "Estimé", "Estimado"],
  ["fact.moves", "Movimientos", "Moviments", "Movements", "Mouvements", "Movimentos"],
  ["fact.hiddenValue", "Valor oculto en Privacidad.", "Valor ocult a Privacitat.", "Value hidden in Privacy.", "Valeur masquée dans Confidentialité.", "Valor oculto em Privacidade."],
  ["fact.noOther", "No hay otras añadas en el catálogo.", "No hi ha altres anyades al catàleg.", "No other vintages in the catalogue.", "Pas d'autres millésimes au catalogue.", "Não há outras colheitas no catálogo."],
  ["fact.pendingLine", "Alta pendiente · {cave} · {bin}", "Alta pendent · {cave} · {bin}", "Pending intake · {cave} · {bin}", "Entrée en attente · {cave} · {bin}", "Alta pendente · {cave} · {bin}"],
  ["fact.units", "Uds", "U.", "Qty", "Qté", "Un."],
  ["fact.dateNd", "fecha n/d", "data n/d", "date n/a", "date n/d", "data n/d"],
  ["fact.notInShort", "Aún no está en cava.", "Encara no és al celler.", "Not in the cellar yet.", "Pas encore en cave.", "Ainda não está na adega."],
  ["inbox.ready", "Ficha lista. Hueco {bin} reservado en altas pendientes.", "Fitxa llesta. Forat {bin} reservat a les altes pendents.", "Sheet ready. Slot {bin} reserved in pending intakes.", "Fiche prête. Emplacement {bin} réservé dans les entrées en attente.", "Ficha pronta. Lugar {bin} reservado nas altas pendentes."],
  ["inbox.see", "Ver ficha", "Veure fitxa", "See the sheet", "Voir la fiche", "Ver ficha"],
  ["cellar.reserve", "Reservar hueco", "Reservar forat", "Reserve a slot", "Réserver l'emplacement", "Reservar lugar"],
  ["price.works", "Funciona · {m}", "Funciona · {m}", "Works · {m}", "Ça marche · {m}", "Funciona · {m}"],
  ["gemini.noKeyNote", "Sin clave de Gemini en esta app. Si la guardaste en Safari, pégala también aquí: Inicio › Avisos › Precios de mercado.", "Sense clau de Gemini en aquesta app. Si la vas desar al Safari, enganxa-la també aquí: Inici › Avisos › Preus de mercat.", "No Gemini key in this app. If you saved it in Safari, paste it here too: Home › Notices › Market prices.", "Pas de clé Gemini dans cette app. Si vous l'avez enregistrée dans Safari, collez-la aussi ici : Accueil › Alertes › Prix de marché.", "Sem chave Gemini nesta app. Se a guardou no Safari, cole-a também aqui: Início › Avisos › Preços de mercado."],
  ["keep.rec", "Recomendación: {name} (ahora a {t} °C).", "Recomanació: {name} (ara a {t} °C).", "Suggestion: {name} (now at {t} °C).", "Conseil : {name} (actuellement à {t} °C).", "Recomendação: {name} (agora a {t} °C)."],
  ["keep.high", "La lectura actual está por encima de la guarda ideal ({a}–{b} °C). Baja SET 1 en La Sommelière.", "La lectura actual és per sobre de la guarda ideal ({a}–{b} °C). Baixa SET 1 a La Sommelière.", "The current reading is above the ideal cellar range ({a}–{b} °C). Lower SET 1 on La Sommelière.", "La lecture actuelle est au-dessus de la garde idéale ({a}–{b} °C). Baissez SET 1 sur La Sommelière.", "A leitura atual está acima da guarda ideal ({a}–{b} °C). Baixe o SET 1 na La Sommelière."],
  ["keep.ideal", "Temperatura idónea.", "Temperatura idònia.", "Ideal temperature.", "Température idéale.", "Temperatura ideal."],
  ["keep.adjust", "Ajusta 1 °C si puedes; la estabilidad importa más.", "Ajusta 1 °C si pots; l'estabilitat importa més.", "Adjust by 1 °C if you can; stability matters more.", "Ajustez d'1 °C si vous pouvez ; la stabilité compte davantage.", "Ajuste 1 °C se puder; a estabilidade importa mais."],
  ["tech.monthsN", "{n} meses", "{n} mesos", "{n} months", "{n} mois", "{n} meses"],
  ["tech.newN", "{n}% nuevo", "{n}% nou", "{n}% new", "{n} % neuf", "{n}% novo"],
  ["scan.frame", "Encuadra la etiqueta en vertical y pulsa Capturar etiqueta.", "Enquadra l'etiqueta en vertical i prem Capturar etiqueta.", "Frame the label upright and tap Capture label.", "Cadrez l'étiquette à la verticale et appuyez sur Capturer l'étiquette.", "Enquadre o rótulo na vertical e prima Capturar rótulo."],
  ["scan.noCam", "Cámara no disponible. Abre la cámara del sistema, elige una foto o usa el alta manual.", "Càmera no disponible. Obre la càmera del sistema, tria una foto o fes servir l'alta manual.", "Camera unavailable. Open the system camera, choose a photo or add by hand.", "Appareil indisponible. Ouvrez l'appareil du système, choisissez une photo ou saisissez à la main.", "Câmara indisponível. Abra a câmara do sistema, escolha uma foto ou use a alta manual."],
  ["scan.reading", "Leyendo la etiqueta…", "Llegint l'etiqueta…", "Reading the label…", "Lecture de l'étiquette…", "A ler o rótulo…"],
  ["scan.readingPct", "Leyendo la etiqueta… {n}%", "Llegint l'etiqueta… {n}%", "Reading the label… {n}%", "Lecture de l'étiquette… {n} %", "A ler o rótulo… {n}%"],
  ["scan.typeName", "Escribe el nombre del vino para buscarlo.", "Escriu el nom del vi per buscar-lo.", "Type the wine name to look it up.", "Saisissez le nom du vin pour le chercher.", "Escreva o nome do vinho para o procurar."],
  ["scan.prev", "Sigue la lectura anterior.", "Segueix la lectura anterior.", "Still finishing the previous reading.", "La lecture précédente n'est pas finie.", "Ainda a acabar a leitura anterior."],
  ["scan.rollReading", "Foto de la fototeca. Leyendo la etiqueta…", "Foto de la fototeca. Llegint l'etiqueta…", "Photo from the library. Reading the label…", "Photo de la photothèque. Lecture de l'étiquette…", "Foto da fototeca. A ler o rótulo…"],
  ["scan.geminiReading", "Leyendo la etiqueta con Gemini…", "Llegint l'etiqueta amb Gemini…", "Reading the label with Gemini…", "Lecture de l'étiquette avec Gemini…", "A ler o rótulo com o Gemini…"],
  ["scan.rollGemini", "Foto de la fototeca. Leyendo la etiqueta con Gemini…", "Foto de la fototeca. Llegint l'etiqueta amb Gemini…", "Photo from the library. Reading the label with Gemini…", "Photo de la photothèque. Lecture de l'étiquette avec Gemini…", "Foto da fototeca. A ler o rótulo com o Gemini…"],
  ["scan.unclean", "No se pudo limpiar la lectura. Corrige el texto y busca.", "No s'ha pogut netejar la lectura. Corregeix el text i busca.", "The reading could not be cleaned. Correct the text and search.", "La lecture n'a pas pu être nettoyée. Corrigez le texte et cherchez.", "Não foi possível limpar a leitura. Corrija o texto e procure."],
  ["scan.manualHint", "Escribe bodega, vino y añada. Alta manual es la última opción, sin foto.", "Escriu celler, vi i anyada. L'alta manual és l'última opció, sense foto.", "Type the estate, wine and vintage. Adding by hand is the last option, with no photo.", "Saisissez le domaine, le vin et le millésime. La saisie manuelle est le dernier recours, sans photo.", "Escreva o produtor, o vinho e a colheita. A alta manual é a última opção, sem foto."],
  ["advice.wait", "No está en su momento. Guárdalo a {a}–{b} °C hasta {y}. Abrirlo ahora pierde complejidad.", "No és el seu moment. Guarda'l a {a}–{b} °C fins al {y}. Obrir-lo ara perd complexitat.", "It is not ready. Keep it at {a}–{b} °C until {y}. Opening it now loses complexity.", "Ce n'est pas son moment. Gardez-le à {a}–{b} °C jusqu'en {y}. L'ouvrir maintenant lui fait perdre en complexité.", "Ainda não é o momento. Guarde-o a {a}–{b} °C até {y}. Abri-lo agora perde complexidade."],
  ["advice.early", "Ya se puede servir. El apogeo empieza en {y}.", "Ja es pot servir. L'apogeu comença el {y}.", "It can be served. The peak starts in {y}.", "Il peut déjà être servi. L'apogée commence en {y}.", "Já se pode servir. O apogeu começa em {y}."],
  ["advice.peak", "Está en la meseta. Sirve a {a}–{b} °C. Es el intervalo para tomarlo.", "És a la meseta. Serveix a {a}–{b} °C. És l'interval per prendre'l.", "It is on the plateau. Serve at {a}–{b} °C. This is the window to drink it.", "Il est sur le plateau. Servez à {a}–{b} °C. C'est l'intervalle pour le boire.", "Está no patamar. Sirva a {a}–{b} °C. É o intervalo para o beber."],
  ["advice.warn", "Ha pasado el corazón del apogeo. Sigue noble, pero cada año suma terciarios y resta fruta. Priorízalo.", "Ha passat el cor de l'apogeu. Segueix noble, però cada any suma terciaris i resta fruita. Prioritza'l.", "It is past the heart of the peak. Still fine, but each year adds tertiary notes and loses fruit. Drink it soon.", "Le cœur de l'apogée est passé. Il reste noble, mais chaque année ajoute des tertiaires et retire du fruit. Priorisez-le.", "Passou o coração do apogeu. Continua nobre, mas cada ano soma terciários e tira fruta. Dê-lhe prioridade."],
  ["advice.late", "Fuera de ventana prudente. Ábrelo solo si aceptas un perfil muy evolucionado. Revisa corcho y nivel.", "Fora de la finestra prudent. Obre'l només si acceptes un perfil molt evolucionat. Revisa el suro i el nivell.", "Outside the prudent window. Open it only if you accept a very evolved profile. Check the cork and the level.", "Hors de la fenêtre prudente. Ouvrez-le seulement si vous acceptez un profil très évolué. Vérifiez le bouchon et le niveau.", "Fora da janela prudente. Abra-o só se aceitar um perfil muito evoluído. Veja a rolha e o nível."]
]);
addI18n([
  ["map.tab", "Mapa", "Mapa", "Map", "Carte", "Mapa"],
  ["map.wines", "Vinos", "Vins", "Wines", "Vins", "Vinhos"],
  ["map.zone", "Zona de la bodega", "Zona del celler", "Estate area", "Zone du domaine", "Zona do produtor"],
  ["map.web", "Mapa y web ›", "Mapa i web ›", "Map and web ›", "Carte et web ›", "Mapa e web ›"],
  ["backup.share", "Copia de Mi Vinoteca", "Còpia d'El meu celler", "My cellar backup", "Copie de Ma cave", "Cópia d'A minha adega"],
  ["csv.name", "Nombre", "Nom", "Name", "Nom", "Nome"],
  ["csv.estate", "Bodega", "Celler", "Estate", "Domaine", "Produtor"],
  ["csv.vintage", "Añada", "Anyada", "Vintage", "Millésime", "Colheita"],
  ["csv.region", "Región", "Regió", "Region", "Région", "Região"],
  ["csv.country", "País", "País", "Country", "Pays", "País"],
  ["csv.type", "Tipo", "Tipus", "Type", "Type", "Tipo"],
  ["csv.qty", "Cantidad", "Quantitat", "Quantity", "Quantité", "Quantidade"],
  ["csv.place", "Ubicación", "Ubicació", "Location", "Emplacement", "Localização"],
  ["csv.score", "Puntuación", "Puntuació", "Score", "Note", "Pontuação"],
  ["csv.state", "Estado", "Estat", "State", "État", "Estado"],
  ["csv.price", "Precio", "Preu", "Price", "Prix", "Preço"]
]);
window.I18N = I18N;
if (document.body) {
  appLang = deviceLang();
  applyDom();
}

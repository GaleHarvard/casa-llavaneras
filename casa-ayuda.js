/* v116: pantalla Ayuda (guías paso a paso, hojas) y preguntas sobre cómo funciona la app. No toca datos de las vinotecas. */
(function () {
  "use strict";
  var GUIA = [
    "Guía de la app Vinoteca (Casa Llavaneras). Responde solo con esto. Si algo no está aquí, di que no estás seguro y sugiere mirar la pantalla correspondiente.",
    "Inicio: resumen de tu cava, avisos y accesos rápidos.",
    "Escanear: se fotografía la etiqueta de la botella con la cámara o se elige una foto; la app lee la etiqueta y propone el alta del vino. Si hay clave de Gemini, completa los datos.",
    "Alta manual: se escriben los datos del vino a mano.",
    "Vinotecas: se organizan las cavas, los espacios y las estanterías; se pueden crear espacios nuevos, mover botellas y mover lotes.",
    "Ubicación física (Origen y hueco): indica dónde está cada botella dentro de la vinoteca.",
    "Ficha del vino: bodega, añada, uvas, denominación y notas de cata. Desde 'Más de este vino' se abren: Calificaciones, Maridajes, Conservación, Servicio en copa, Ficha técnica, Historia, Valor de mercado, Evolución y fechas, Origen y hueco, Mapa y bodega, Perfil, Cuaderno de cata y Ubicación física.",
    "Calificaciones: puntuaciones de críticos y guías.",
    "Maridajes: qué platos acompañan al vino. La pestaña Mesa permite buscar por plato.",
    "Conservación y servicio en copa: temperatura, copa y decantación.",
    "Historia: historia de la bodega y del vino.",
    "Mapa y bodega: la zona vinícola y la bodega; también hay pantallas de Zonas y Bodegas.",
    "Valor de mercado: precios estimados y su evolución; se pueden editar y guardar precios.",
    "Evolución y fechas / Cuándo abrir: indica si el vino está listo para beber y cuándo abrirlo.",
    "Cuaderno de cata: se anotan catas (Añadir cata) con valoración.",
    "Salida de cava: al sacar una botella se indica el motivo (bebida, celebración, cena, regalo, vendida, defectuosa o corcho, otro).",
    "Botellas: lista de lo que tienes, con búsqueda y filtros (Todos, Tinto, Blanco, Rosado, Espumoso, Listo para beber, Solo lo que tengo).",
    "Avisos: notificaciones, por ejemplo cuándo abrir un vino.",
    "Perfil: idioma, casas, preferencias de cata, fuentes, privacidad, bebidas, copias de seguridad y versión de la app. Copias de seguridad: exportar y restaurar una copia. Clave Gemini: se guarda en cada dispositivo.",
    "Si falta información o hay un error en una ficha, se corrige con Editar."
  ].join("\n");

  var IMGS = ["1-ayuda-hoja1.jpg", "2-ayuda-hoja2.jpg"];
  function simg(a, b) { return ((a - 1) * 4 + b) + "-ayuda-s" + a + "-" + b + ".jpg"; }
  var SERIES = [
    { t: "Cómo añadir un vino con foto", k: /(alta|a[ñn]ad|introduc|meter|escane|foto|etiqueta|nuevo vino|registrar)/i },
    { t: "Cómo introducir un vino a mano", k: /(a mano|manual|introduc|escrib|teclear|sin foto)/i },
    { t: "Cómo buscar un vino", k: /(busc|encontr|localiz|filtr|lista)/i },
    { t: "Cómo encontrar la botella en tu vinoteca", k: /(hueco|d[oó]nde est|ubicaci|vinoteca|estanter|mover|botella)/i },
    { t: "Cómo ver puntuaciones, catas y favoritos", k: /(puntu|calific|cata|favorit|valor|nota|gu[ií]a)/i }
  ];
  SERIES.forEach(function (x, i) { x.n = i + 1; x.imgs = [1, 2, 3, 4].map(function (b) { return simg(i + 1, b); }); });
  function seriesHtml(x) {
    return '<div class="card"><h3 style="margin:0 0 8px">' + esc(x.t) + '</h3><div style="display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch">' +
      x.imgs.map(function (src, b) {
        return '<button type="button" data-serie="' + (x.n - 1) + '" data-paso="' + b + '" style="all:unset;flex:0 0 38%;cursor:zoom-in" aria-label="' + esc(x.t) + ', paso ' + (b + 1) + ' de 4"><img src="' + src + '" alt="' + esc(x.t) + ', paso ' + (b + 1) + '" style="width:100%;height:auto;border-radius:10px;display:block" loading="lazy" /></button>';
      }).join("") + '</div><p class="tiny" style="margin:8px 0 0;text-align:center">Toca un paso para verlo grande y deslizar</p></div>';
  }
  function bindSeries(root) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-serie]"), function (b) {
      b.addEventListener("click", function () { openZoom(IMGS_SER(Number(b.getAttribute("data-serie"))), Number(b.getAttribute("data-paso")), SERIES[Number(b.getAttribute("data-serie"))].t); });
    });
  }
  function IMGS_SER(i) { return SERIES[i].imgs; }
  var CHIPS = ["¿Cómo doy de alta un vino?", "¿Cómo sé dónde está cada botella?", "¿Qué es 'Valor de mercado'?", "¿Cómo hago una copia de seguridad?"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function ensureScreen() {
    if (document.getElementById("ayuda")) return;
    var ref = document.getElementById("deseos") || document.getElementById("perfil");
    if (!ref || !ref.parentNode) return;
    var sec = document.createElement("section");
    sec.id = "ayuda";
    sec.className = "screen";
    sec.innerHTML = '<div class="scroll" id="ayuda-body"></div>';
    ref.parentNode.insertBefore(sec, ref.nextSibling);
  }

  function key() {
    try { if (typeof storedGeminiKey === "function") return storedGeminiKey() || ""; } catch (e) {}
    return "";
  }

  function render() {
    ensureScreen();
    var body = document.getElementById("ayuda-body");
    if (!body) return;
    body.innerHTML =
      '<div class="hero"><p class="eyebrow">Ayuda</p><h1>Cómo funciona la Vinoteca</h1><p>Guía de todas las funciones y una caja para preguntar tus dudas.</p></div>' +
      '<h2 style="margin:14px 0 8px">Guías paso a paso</h2>' + SERIES.map(seriesHtml).join("") +
      '<h2 style="margin:14px 0 8px">Resumen general</h2>' +
      IMGS.map(function (src, n) {
        return '<div class="card"><button type="button" data-zoom="' + n + '" style="all:unset;display:block;width:100%;cursor:zoom-in" aria-label="Ampliar hoja ' + (n + 1) + ' de 2"><img src="' + src + '" alt="Infografía de la Vinoteca, hoja ' + (n + 1) + ' de 2" style="width:100%;height:auto;border-radius:12px;display:block" loading="lazy" /></button><p class="tiny" style="margin:8px 0 0;text-align:center">Toca la hoja para ampliarla</p></div>';
      }).join("") +
      '<div class="card" id="ayuda-chat">' +
      '<h3>Pregunta lo que quieras</h3>' +
      '<p class="muted" style="margin:6px 0 10px">Te contesta Gemini con esta guía. Necesita tu clave de Gemini (Perfil).</p>' +
      '<div id="ayuda-chips" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">' +
      CHIPS.map(function (c, i) { return '<button type="button" class="btn btn-ghost" data-chip="' + i + '">' + esc(c) + "</button>"; }).join("") +
      "</div>" +
      '<label class="field"><span>Tu pregunta</span><input id="ayuda-q" type="text" autocomplete="off" placeholder="Por ejemplo: ¿cómo muevo una botella?" /></label>' +
      '<button type="button" class="btn btn-gold" id="ayuda-send" style="width:100%;margin-top:8px">Preguntar</button>' +
      '<div id="ayuda-s"></div><div id="ayuda-a" class="muted" style="margin-top:12px;white-space:pre-wrap" aria-live="polite"></div>' +
      "</div>";
    Array.prototype.forEach.call(body.querySelectorAll("[data-zoom]"), function (b) {
      b.addEventListener("click", function () { openZoom(IMGS, Number(b.getAttribute("data-zoom")), "Hoja"); });
    });
    bindSeries(body);
    var q = document.getElementById("ayuda-q");
    document.getElementById("ayuda-send").addEventListener("click", function () { ask(q.value); });
    q.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); ask(q.value); } });
    Array.prototype.forEach.call(document.querySelectorAll("#ayuda-chips [data-chip]"), function (b) {
      b.addEventListener("click", function () { var text = CHIPS[Number(b.getAttribute("data-chip"))]; q.value = text; ask(text); });
    });
  }

  var zoomLevel = 1;
  function openZoom(list, n, title) {
    closeZoom();
    zoomLevel = 1;
    var total = list.length;
    var ov = document.createElement("div");
    ov.id = "ayuda-zoom";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "Paso ampliado");
    ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column";
    ov.innerHTML =
      '<div style="display:flex;gap:8px;justify-content:space-between;align-items:center;padding:10px 12px;padding-top:calc(10px + env(safe-area-inset-top))">' +
      '<span class="tiny" id="az-lab"></span>' +
      '<span style="display:flex;gap:8px"><button type="button" class="btn btn-ghost" id="az-out" aria-label="Alejar">−</button><button type="button" class="btn btn-ghost" id="az-in" aria-label="Acercar">+</button><button type="button" class="btn btn-gold" id="az-close">Cerrar</button></span></div>' +
      '<div id="az-box" style="flex:1;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom"><img id="az-img" src="" alt="" style="display:block;width:100%;height:auto;max-width:none" /></div>' +
      '<div style="display:flex;gap:8px;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom))"><button type="button" class="btn btn-ghost" id="az-prev" style="flex:1">‹ Anterior</button><button type="button" class="btn btn-ghost" id="az-next" style="flex:1">Siguiente ›</button></div>';
    document.body.appendChild(ov);
    function apply() { document.getElementById("az-img").style.width = (zoomLevel * 100) + "%"; }
    function go(m) {
      n = Math.max(0, Math.min(total - 1, m));
      zoomLevel = 1; apply();
      var im = document.getElementById("az-img");
      im.src = list[n]; im.alt = title + ", " + (n + 1) + " de " + total;
      document.getElementById("az-lab").textContent = title + " · " + (n + 1) + " de " + total;
      document.getElementById("az-prev").disabled = n === 0;
      document.getElementById("az-next").disabled = n === total - 1;
      document.getElementById("az-box").scrollTop = 0;
    }
    document.getElementById("az-close").addEventListener("click", closeZoom);
    document.getElementById("az-in").addEventListener("click", function () { zoomLevel = Math.min(4, zoomLevel + 0.5); apply(); });
    document.getElementById("az-out").addEventListener("click", function () { zoomLevel = Math.max(1, zoomLevel - 0.5); apply(); });
    document.getElementById("az-prev").addEventListener("click", function () { go(n - 1); });
    document.getElementById("az-next").addEventListener("click", function () { go(n + 1); });
    document.getElementById("az-img").addEventListener("dblclick", function () { zoomLevel = zoomLevel > 1 ? 1 : 2.5; apply(); });
    var x0 = null;
    var box = document.getElementById("az-box");
    box.addEventListener("touchstart", function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null || zoomLevel > 1 || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 70) go(dx < 0 ? n + 1 : n - 1);
    }, { passive: true });
    go(n);
  }
  function closeZoom() {
    var ov = document.getElementById("ayuda-zoom");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }

  var busy = false;
  async function ask(text) {
    text = String(text || "").trim();
    var out = document.getElementById("ayuda-a");
    if (!out || busy || !text) return;
    var sh = document.getElementById("ayuda-s");
    if (sh) {
      var hits = SERIES.filter(function (x) { return x.k.test(text); }).slice(0, 2);
      sh.innerHTML = hits.map(seriesHtml).join("");
      bindSeries(sh);
    }
    var k = key();
    if (!k) {
      out.textContent = "Falta la clave de Gemini en este dispositivo. Pégala en Inicio › Avisos › Precios de mercado (Clave Gemini) y vuelve a preguntar.";
      return;
    }
    busy = true;
    out.textContent = "Pensando…";
    var models = [];
    try { models = typeof geminiModelsFor === "function" ? geminiModelsFor("ground") : []; } catch (e) {}
    if (!models.length) models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    var payload = {
      systemInstruction: { parts: [{ text: GUIA }] },
      contents: [{ role: "user", parts: [{ text: text }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 }
    };
    var answer = "", reason = "";
    for (var i = 0; i < models.length && !answer; i++) {
      try {
        var url = "https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent";
        var res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": k }, body: JSON.stringify(payload) });
        if (res.status === 401 || res.status === 403) { reason = "La clave de Gemini no vale o no tiene permiso."; break; }
        if (res.status === 429) { reason = "Gemini ha llegado al límite de uso. Prueba más tarde."; break; }
        if (!res.ok) { reason = "Gemini no ha podido contestar ahora."; continue; }
        var data = await res.json();
        var parts = (((data.candidates || [])[0] || {}).content || {}).parts || [];
        answer = parts.map(function (p) { return p.text || ""; }).join("").trim();
      } catch (e) {
        reason = "No hay conexión con Gemini.";
        break;
      }
    }
    out.textContent = answer || reason || "No he podido contestar. Prueba otra vez.";
    busy = false;
  }

  function openAyuda() {
    closeZoom();
    render();
    if (typeof show === "function") show("ayuda");
  }
  window.openAyuda = openAyuda;

  function addCard() {
    var body = document.getElementById("perfil-body");
    if (!body || body.querySelector("[data-ayuda-card]")) return;
    var card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "button");
    card.setAttribute("data-ayuda-card", "1");
    card.innerHTML = '<div class="row"><h3>Ayuda</h3><span>›</span></div><p class="muted">Cómo funciona cada pantalla y preguntas.</p>';
    card.addEventListener("click", openAyuda);
    var cards = body.querySelectorAll(".card[role=button]");
    var anchor = cards.length ? cards[cards.length - 1] : null;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor.nextSibling);
    else body.appendChild(card);
  }

  function boot() {
    try {
      ensureScreen();
      var body = document.getElementById("perfil-body");
      if (!body) return;
      addCard();
      new MutationObserver(function () { try { addCard(); } catch (e) {} }).observe(body, { childList: true });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

/* v118: corregir bodega/zona en Editar y traducir al español textos extranjeros */
(function () {
  "use strict";
  function $id(x) { return document.getElementById(x); }
  function esc(s) { return typeof escHtml === "function" ? escHtml(String(s == null ? "" : s)) : String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function fold(s) { return typeof foldWinery === "function" ? foldWinery(s) : String(s || "").toLowerCase(); }

  var ID_FIELDS = [["id-producer", "Bodega"], ["id-name", "Nombre del vino"], ["id-zone", "Zona"]];

  function identityHtml(w) {
    var vals = { "id-producer": w.producer || "", "id-name": w.name || "", "id-zone": w.appellation || w.region || "" };
    return ID_FIELDS.map(function (f) {
      return '<label class="field"><span>' + f[1] + '</span><input id="fact-in-' + f[0] + '" value="' + esc(vals[f[0]]) + '"></label>';
    }).join("");
  }

  function readVal(key) {
    var el = $id("fact-in-" + key);
    return el ? String(el.value || "").replace(/\s+/g, " ").trim() : null;
  }

  function applyIdentity(w) {
    var producer = readVal("id-producer"), name = readVal("id-name"), zone = readVal("id-zone");
    if (producer === null) return false;
    var oldProducer = w.producer || "", oldName = w.name || "", oldZone = w.appellation || w.region || "";
    var sameNameAsProducer = fold(oldName) === fold(oldProducer);
    var changedP = producer && producer !== oldProducer;
    var changedZ = zone !== null && zone !== oldZone;
    var newName = name;
    if (changedP && name === oldName && sameNameAsProducer) newName = producer;
    var changedN = newName && newName !== oldName;
    if (!changedP && !changedN && !changedZ) return false;
    w.provenance = w.provenance || {};
    if (changedP) {
      w.producer = producer;
      w.provenance.producer = "usuario";
      w.provenance.wineryText = "";
      w.vintageFacts = {};
      w.geo = {};
      if (w.dossier && w.provenance.dossier !== "usuario") w.dossier.history = "";
    }
    if (changedN) { w.name = newName; w.provenance.name = "usuario"; }
    if (changedZ) {
      w.appellation = zone;
      w.region = zone;
      w.provenance.zoneText = "";
      w.provenance.zone = "usuario";
      var z = typeof zoneByName === "function" ? zoneByName(zone) : null;
      w.provenance.zoneId = z && z.name ? z.name : "";
      w.zoneAsset = z && z.map ? z.map : "";
    }
    if (changedP || changedN) {
      var generic = typeof GENERIC_ESTATE !== "undefined" ? GENERIC_ESTATE : "vinedo.jpg";
      var file = typeof wineryImageFor === "function" ? wineryImageFor(w) : generic;
      w.wineryAsset = file || generic;
      var card = typeof wineryCardFor === "function" ? wineryCardFor(w) : null;
      w.provenance.wineryId = card ? card.id : "";
      if (card) w.geo = { lat: card.lat, lng: card.lng, web: card.web, address: card.address, zone: card.town || "" };
    }
    return true;
  }

  if (typeof editWineFacts === "function") {
    var editOrig = editWineFacts;
    editWineFacts = function (wineId) {
      editOrig(wineId);
      try {
        var w = wineById(wineId);
        var box = document.querySelector("#wine-body #facts-v103");
        if (w && box && !$id("fact-in-id-producer")) box.insertAdjacentHTML("afterbegin", identityHtml(w));
      } catch (e) {}
    };
  }
  if (typeof saveWineFactEdits === "function") {
    var saveOrig = saveWineFactEdits;
    saveWineFactEdits = function (wineId) {
      try {
        var w = wineById(wineId);
        if (w && applyIdentity(w) && typeof save === "function") save();
      } catch (e) { console.warn("identidad", e); }
      return saveOrig(wineId);
    };
  }

  /* Traducción al español de textos web en otro idioma */
  var FR = /\b(les|des|du|aux|avec|et|une|est|sur|pour|dans|ar[oô]mes?|bouche|nez|notes?\s+de|fruits?\s+blancs?|p[eê]che|vigne|vin|fra[iî]cheur|finale?|sec|bois[eé]|tr[eè]s|belle|longue)\b|[êèëôûçœ]/gi;
  var EN = /\b(the|and|with|of|aromas?|palate|finish|flavou?rs?|notes?\s+of|dry|crisp|fruit|hints?)\b/gi;
  var ES = /\b(el|los|las|del|con|una|por|para|aromas?\s+de|notas?\s+de|boca|nariz|frutas?|blancas?|fresco|seco|largo|final)\b|[ñáíóú¿¡]/gi;
  function isForeign(text) {
    var s = String(text || "");
    if (s.length < 24) return false;
    var f = (s.match(FR) || []).length + (s.match(EN) || []).length;
    var e = (s.match(ES) || []).length;
    return f >= 3 && f > e;
  }
  var tried = {};
  async function translateFor(wineId) {
    var w = typeof wineById === "function" ? wineById(wineId) : null;
    var lang = (typeof appLang !== "undefined" && appLang) || "es";
    if (!w || lang !== "es" || tried[wineId]) return;
    var key = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
    if (!key) return;
    var items = [];
    if (w.tasting && isForeign(w.tasting) && !(w.provenance && w.provenance.tasting === "usuario")) items.push({ k: "tasting", text: w.tasting });
    Object.keys(w.ratings || {}).forEach(function (r) {
      var b = w.ratings[r];
      if (b && b.note && isForeign(b.note) && !(typeof scoreIsUser === "function" && scoreIsUser(b))) items.push({ k: "r:" + r, text: b.note });
    });
    ["history", "soils", "vineyard", "vinification", "elevage"].forEach(function (f) {
      var d = w.dossier;
      if (d && d[f] && isForeign(d[f]) && w.provenance && w.provenance.dossier !== "usuario") items.push({ k: "d:" + f, text: d[f] });
    });
    if (!items.length) return;
    tried[wineId] = true;
    var payload = {};
    items.forEach(function (it, i) { payload["t" + i] = it.text; });
    var prompt = ["Traduce al español estas notas de vino, con prosa natural de sumiller.",
      "Devuelve JSON {\"items\":[\"...\"]} con una traducción por cada entrada, en el mismo orden.",
      "Mantén sin traducir nombres propios (bodega, cuvée, denominación, lugar, uva).",
      "No inventes datos ni añadas nada.",
      JSON.stringify(items.map(function (it) { return it.text; }))].join("\n");
    var schema = { type: "OBJECT", properties: { items: { type: "ARRAY", items: { type: "STRING" } } }, required: ["items"] };
    try {
      var out = await geminiWithModel(key, prompt, schema, null, 2048);
      var arr = out && out.parsed && out.parsed.items;
      if (!Array.isArray(arr) || arr.length !== items.length) return;
      items.forEach(function (it, i) {
        var tr = String(arr[i] || "").trim();
        if (!tr) return;
        if (it.k === "tasting") w.tasting = tr;
        else if (it.k.indexOf("r:") === 0) w.ratings[it.k.slice(2)].note = tr;
        else w.dossier[it.k.slice(2)] = tr;
        var host = $id("wine-body");
        if (host) {
          var all = host.querySelectorAll("p,b,span");
          for (var j = 0; j < all.length; j++) {
            var el = all[j];
            if (!el.children.length && el.textContent.trim().indexOf(it.text.trim().slice(0, 40)) >= 0) el.textContent = el.textContent.replace(it.text, tr);
          }
        }
      });
      if (typeof save === "function") save();
    } catch (e) { console.warn("traducción añada", e); }
  }

  if (typeof openWine === "function") {
    var openOrig = openWine;
    openWine = function (wineId, bottle) {
      openOrig(wineId, bottle);
      try { translateFor(wineId); } catch (e) {}
    };
  }
  if (typeof openWineSub === "function") {
    var subOrig = openWineSub;
    openWineSub = function (kind) {
      var r = subOrig(kind);
      try { if (typeof currentWine !== "undefined" && currentWine) translateFor(currentWine.id); } catch (e) {}
      return r;
    };
  }
})();

/* v120: lo que el usuario corrige en Bodega, Nombre y Zona no se pisa al completar o ampliar datos */
(function () {
  "use strict";
  var PROV = ["producer", "name", "zone", "region"];

  function locked(w, k) {
    return !!(w && w.provenance && w.provenance[k] === "usuario");
  }

  function snap(w) {
    if (!w || !w.provenance) return null;
    var lp = locked(w, "producer"), ln = locked(w, "name"), lz = locked(w, "zone");
    if (!lp && !ln && !lz) return null;
    var s = { prov: {} };
    PROV.forEach(function (k) { s.prov[k] = w.provenance[k]; });
    if (lp) {
      s.producer = w.producer;
      s.wineryAsset = w.wineryAsset;
      s.wineryId = w.provenance.wineryId;
      s.geo = w.geo ? JSON.parse(JSON.stringify(w.geo)) : w.geo;
    }
    if (ln) s.name = w.name;
    if (lz) {
      s.appellation = w.appellation;
      s.region = w.region;
      s.zoneAsset = w.zoneAsset;
      s.zoneId = w.provenance.zoneId;
    }
    s.lp = lp; s.ln = ln; s.lz = lz;
    return s;
  }

  function restore(w, s) {
    if (!w || !s) return false;
    w.provenance = w.provenance || {};
    PROV.forEach(function (k) { if (s.prov[k] === "usuario") w.provenance[k] = "usuario"; });
    if (s.lp) {
      w.producer = s.producer;
      w.wineryAsset = s.wineryAsset;
      w.provenance.wineryId = s.wineryId;
      w.geo = s.geo;
    }
    if (s.ln) w.name = s.name;
    if (s.lz) {
      w.appellation = s.appellation;
      w.region = s.region;
      w.zoneAsset = s.zoneAsset;
      w.provenance.zoneId = s.zoneId;
    }
    return true;
  }

  function guard(fnName, getWine) {
    if (typeof window[fnName] !== "function") return;
    var orig = window[fnName];
    window[fnName] = async function () {
      var args = arguments;
      var w = null;
      try { w = getWine.apply(null, args); } catch (e) {}
      var s = snap(w);
      try {
        return await orig.apply(this, args);
      } finally {
        try {
          if (s && restore(w, s) && typeof save === "function") save();
        } catch (e) {}
      }
    };
  }

  guard("completeWineRecord", function (wine) { return wine; });
  guard("expandWineFacts", function (id) { return typeof wineById === "function" ? wineById(id) : null; });

  /* Al corregir la identidad, olvidar la página y el título del vino antiguo */
  if (typeof saveWineFactEdits === "function") {
    var saveV119 = saveWineFactEdits;
    saveWineFactEdits = function (wineId) {
      var w = null, before = "";
      try {
        w = wineById(wineId);
        before = w ? [w.producer, w.name].join("|") : "";
      } catch (e) {}
      var out = saveV119(wineId);
      try {
        if (w && locked(w, "producer") && [w.producer, w.name].join("|") !== before) {
          var p = w.provenance;
          ["pageUrl", "rawTitle", "pageExcerpt", "pageNote"].forEach(function (k) { if (p[k]) p[k] = ""; });
          w.shops = [];
          if (typeof save === "function") save();
        }
      } catch (e) {}
      return out;
    };
  }
})();

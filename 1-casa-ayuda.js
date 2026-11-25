/* v114: pantalla Ayuda (infografía) y preguntas sobre cómo funciona la app. No toca datos de las vinotecas. */
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

  var IMG = "ayuda-infografia.jpg";
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
      '<div class="card"><img src="' + IMG + '" alt="Infografía con todas las funciones de la Vinoteca" style="width:100%;height:auto;border-radius:12px;display:block" loading="lazy" /></div>' +
      '<div class="card" id="ayuda-chat">' +
      '<h3>Pregunta lo que quieras</h3>' +
      '<p class="muted" style="margin:6px 0 10px">Te contesta Gemini con esta guía. Necesita tu clave de Gemini (Perfil).</p>' +
      '<div id="ayuda-chips" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">' +
      CHIPS.map(function (c, i) { return '<button type="button" class="btn btn-ghost" data-chip="' + i + '">' + esc(c) + "</button>"; }).join("") +
      "</div>" +
      '<label class="field"><span>Tu pregunta</span><input id="ayuda-q" type="text" autocomplete="off" placeholder="Por ejemplo: ¿cómo muevo una botella?" /></label>' +
      '<button type="button" class="btn btn-gold" id="ayuda-send" style="width:100%;margin-top:8px">Preguntar</button>' +
      '<div id="ayuda-a" class="muted" style="margin-top:12px;white-space:pre-wrap" aria-live="polite"></div>' +
      "</div>";
    var q = document.getElementById("ayuda-q");
    document.getElementById("ayuda-send").addEventListener("click", function () { ask(q.value); });
    q.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); ask(q.value); } });
    Array.prototype.forEach.call(document.querySelectorAll("#ayuda-chips [data-chip]"), function (b) {
      b.addEventListener("click", function () { var text = CHIPS[Number(b.getAttribute("data-chip"))]; q.value = text; ask(text); });
    });
  }

  var busy = false;
  async function ask(text) {
    text = String(text || "").trim();
    var out = document.getElementById("ayuda-a");
    if (!out || busy || !text) return;
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

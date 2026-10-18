/* Bodegas v91: fichas consultables, enlazadas al mapa y al escáner. */
var bodegaOpen = "";
var bodegaFromList = false;

function wineryCardById(id) {
  return (WINERY_CARDS || []).find(card => card && card.id === id) || null;
}

function wineryCardFor(w) {
  if (!w || typeof WINERY_CARDS === "undefined" || typeof foldWinery !== "function") return null;
  const hay = foldWinery((w.producer || "") + " " + (w.name || ""));
  const compact = typeof compactWinery === "function" ? compactWinery(hay) : hay;
  let best = null;
  let bestLen = 0;
  WINERY_CARDS.forEach(card => {
    [card.name].concat(card.aliases || []).forEach(label => {
      const needle = foldWinery(label);
      if (!needle || needle.length <= bestLen) return;
      if (typeof wineryNeedleHits === "function" && !wineryNeedleHits(needle, hay, compact)) return;
      best = card;
      bestLen = needle.length;
    });
  });
  return best;
}

function fuzzyWineryHit(fields) {
  if (typeof WINERY_CARDS === "undefined" || typeof fuzzyRatio !== "function" || typeof fieldValue !== "function") return null;
  const producer = fieldValue(fields, "producer");
  const name = fieldValue(fields, "name");
  if (!producer && !name) return null;
  let best = null;
  let bestScore = 0;
  WINERY_CARDS.forEach(card => {
    [card.name].concat(card.aliases || []).forEach(label => {
      const score = Math.max(fuzzyRatio(producer, label), fuzzyRatio(name, label));
      if (score > bestScore) {
        bestScore = score;
        best = card;
      }
    });
  });
  return best && bestScore >= 0.86 ? best : null;
}

function zoneByName(name) {
  if (!name || typeof ZONES === "undefined") return null;
  return ZONES.find(zone => zone && zone.name === name) || null;
}

function wineryGroups(query) {
  const q = foldWinery(query || "");
  const cards = (WINERY_CARDS || []).filter(card => {
    if (!q) return true;
    const blob = foldWinery([card.name, card.country, card.zone, card.town].concat(card.aliases || []).join(" "));
    return blob.indexOf(q) >= 0;
  });
  const countries = [];
  cards.forEach(card => {
    let country = countries.find(group => group.country === card.country);
    if (!country) {
      country = { country: card.country, zones: [] };
      countries.push(country);
    }
    const zoneName = card.zone || "";
    let zone = country.zones.find(group => group.zone === zoneName);
    if (!zone) {
      zone = { zone: zoneName, items: [] };
      country.zones.push(zone);
    }
    zone.items.push(card);
  });
  return countries;
}

function wineryTile(card) {
  const img = card.file
    ? `<img src="${escHtml(card.file)}" alt="">`
    : `<span class="muted" style="display:block;height:118px;line-height:118px;text-align:center;font-size:12px">${escHtml(t("wineries.artPending"))}</span>`;
  const place = [card.town, card.zone || card.zoneText].filter(Boolean).join(" · ");
  return `<button class="zone-tile" onclick="openBodega('${card.id}', true)">
    ${img}
    <span><b>${escHtml(card.name)}</b><small>${escHtml(place || card.country)}</small></span>
  </button>`;
}

function renderBodegas(q) {
  bodegaOpen = "";
  const countries = wineryGroups(q);
  const html = countries.map(country => country.zones.map(zone => {
    const title = zone.zone || t("wineries.noZone");
    return `<p class="cal-h">${escHtml(countryLabel(country.country))} · ${escHtml(title)}</p><div class="zone-grid">${zone.items.map(wineryTile).join("")}</div>`;
  }).join("")).join("");
  const box = document.getElementById("bodegas-body");
  if (!box) return;
  box.innerHTML = `
    <button class="back" onclick="goBack()">‹ ${escHtml(backCaption())}</button>
    <p class="eyebrow">${escHtml(t("eyebrow.cellar"))}</p>
    <h1>${escHtml(t("wineries.h1"))}</h1>
    <div class="search" style="margin:12px 0"><input id="bodega-q" type="search" placeholder="${escHtml(t("wineries.search"))}" value="${escHtml(q || "")}" oninput="renderBodegas(this.value)"></div>
    ${html || `<p class="empty">${escHtml(t("wineries.none"))}</p>`}`;
  const input = document.getElementById("bodega-q");
  if (input && q) {
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }
}

function openBodegaList() {
  bodegaOpen = "";
  bodegaFromList = false;
  if (typeof show === "function") show("bodegas");
  else renderBodegas();
}

function openBodega(id, fromList) {
  bodegaOpen = id || "";
  bodegaFromList = !!fromList;
  if (typeof show === "function") show("bodegas");
  else renderBodegaSheet(id);
}

function bodegaFact(label, value) {
  const text = value == null ? "" : String(value).trim();
  if (!text || text === "0") return "";
  return `<div class="fact"><span>${escHtml(label)}</span><b>${escHtml(text)}</b></div>`;
}

function renderBodegaSheet(id) {
  const card = wineryCardById(id);
  const box = document.getElementById("bodegas-body");
  if (!box) return;
  if (!card) return renderBodegas();
  const back = bodegaFromList
    ? `<button class="back" onclick="openBodegaList()">‹ ${escHtml(t("wineries.back"))}</button>`
    : `<button class="back" onclick="goBack()">‹ ${escHtml(backCaption())}</button>`;
  const art = card.file
    ? `<img class="map-art" src="${escHtml(card.file)}" alt="${escHtml(card.name)}">`
    : `<p class="muted" style="text-align:center;margin:28px 0">${escHtml(t("wineries.artPending"))}</p>`;
  const zone = zoneByName(card.zone);
  const zoneBtn = zone
    ? `<button type="button" class="btn btn-ghost" style="width:100%;margin-top:12px" onclick="openZona('${zone.name.replace(/'/g, "\\'")}')">${escHtml(t("wineries.zone"))}: ${escHtml(zone.name)}</button>`
    : "";
  const alias = (card.aliases || []).filter(Boolean).join(" · ");
  const wines = (card.wines || []).filter(Boolean).join(" · ");
  const web = card.web && !(typeof isShopUrl === "function" && isShopUrl(card.web))
    ? `<a class="btn btn-gold" style="width:100%;margin-top:12px;display:block;text-align:center" href="${escHtml(card.web)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${escHtml(t("map.webBtn"))}</a>`
    : "";
  const approx = card.precision === "municipio"
    ? `<p class="tiny" style="margin:8px 0 0">${escHtml(t("map.pinTown", { place: card.town || "" }))}</p>`
    : "";
  const pin = card.lat != null && card.lng != null
    ? `${approx}<p class="muted" style="margin:8px 0 0">${escHtml(t("map.coords"))}: ${Number(card.lat).toFixed(3)}, ${Number(card.lng).toFixed(3)}</p>`
    : "";
  const sources = bodegaSources(card);
  box.innerHTML = `
    ${back}
    ${art}
    <p class="eyebrow">${escHtml([countryLabel(card.country), card.zoneText || card.zone].filter(Boolean).join(" · "))}</p>
    <h1>${escHtml(card.name)}</h1>
    ${alias ? `<p class="muted">${escHtml(t("wineries.alias"))}: ${escHtml(alias)}</p>` : ""}
    ${card.about ? `<p style="margin-top:12px;line-height:1.45">${escHtml(card.about)}</p>` : ""}
    ${bodegaFact(t("wineries.town"), card.town)}
    ${bodegaFact(t("wineries.address"), card.address)}
    ${bodegaFact(t("wineries.founded"), card.founded ? String(card.founded) : "")}
    ${bodegaFact(t("wineries.wines"), wines)}
    ${pin}
    ${web}
    ${zoneBtn}
    ${sources}`;
}

function bodegaSources(card) {
  const urls = [];
  (card.sources || []).forEach(url => {
    if (url && urls.indexOf(url) < 0) urls.push(url);
  });
  if (!urls.length) return "";
  const links = urls.map(url => {
    const label = String(url).replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer" onclick="return openExternal(this.href)">${escHtml(label)}</a>`;
  }).join(" · ");
  return `<p class="muted" style="margin-top:18px;font-size:11px;line-height:1.45">${escHtml(t("wineries.sources"))}: ${links}</p>`;
}

var revealV91 = reveal;
reveal = function (id) {
  revealV91(id);
  if (id !== "bodegas") return;
  if (bodegaOpen) renderBodegaSheet(bodegaOpen);
  else renderBodegas();
};

var renderZonasV91 = renderZonas;
renderZonas = function (q) {
  renderZonasV91(q);
  const h1 = document.querySelector("#zonas-body h1");
  if (!h1 || document.getElementById("bodega-link")) return;
  h1.insertAdjacentHTML("afterend", `<button type="button" class="btn btn-ghost" id="bodega-link" style="width:100%;margin:8px 0 4px" onclick="openBodegaList()">${t("wineries.link")}</button>`);
};

var mapaBlockV91 = mapaBlock;
mapaBlock = function (w) {
  let html = mapaBlockV91(w);
  const card = wineryCardFor(w);
  if (card && card.precision === "municipio") {
    const note = `<p class="tiny" style="margin:0 0 4px">${escHtml(t("map.pinTown", { place: card.town || "" }))}</p>`;
    const mark = '<p class="muted" style="margin:0 0 4px;font-size:13px">';
    if (html.indexOf(mark) >= 0) html = html.replace(mark, note + mark);
  }
  if (!card) return html;
  return html + `<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="openBodega('${card.id}')">${t("wineries.open")}</button>`;
};

var zoneStripV91 = zoneStrip;
zoneStrip = function (w) {
  const html = zoneStripV91(w);
  const card = wineryCardFor(w);
  if (!card) return html;
  return html + `<button type="button" class="btn btn-ghost" style="width:100%;margin:8px 0" onclick="openBodega('${card.id}')">${escHtml(card.name)}</button>`;
};

var wineForIntakeV91 = wineForIntake;
wineForIntake = function (fields, catalogHit) {
  const card = fuzzyWineryHit(fields);
  if (card && fields && typeof fieldValue === "function" && typeof fuzzyRatio === "function") {
    const producer = fieldValue(fields, "producer");
    const name = fieldValue(fields, "name");
    const labels = [card.name].concat(card.aliases || []);
    const producerHit = labels.some(label => fuzzyRatio(producer, label) >= 0.86);
    const nameHit = !producer && labels.some(label => fuzzyRatio(name, label) >= 0.86);
    if (nameHit || (producerHit && fuzzyRatio(producer, card.name) < 0.9)) {
      fields.producer = { value: card.name, confidence: 0.92 };
    }
    if (!fieldValue(fields, "appellation") && card.zone && (producerHit || nameHit)) {
      fields.appellation = { value: card.zone, confidence: 0.7 };
    }
  }
  return wineForIntakeV91(fields, catalogHit);
};

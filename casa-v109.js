/* v109: el nombre sale de la etiqueta. Productor y zona, solo si el catálogo o una fuente citada coinciden. */
function labelEvidence(wine, st) {
  const prov = (wine && wine.provenance) || {};
  const bits = [prov.ocrText, prov.labelText, prov.rawLabel, prov.frontText, prov.backText, wine && wine.labelText, wine && wine.ocrText];
  const bag = st || (typeof state !== "undefined" ? state : null);
  if (bag && wine && wine.id && Array.isArray(bag.inbox)) {
    bag.inbox.forEach(row => {
      if (row && row.wineId === wine.id && row.text) bits.push(row.text);
    });
  }
  return bits.filter(Boolean).join("\n");
}

function pageAgreesWithLabel(wine, evidence) {
  const fold = typeof foldIdentity === "function" ? foldIdentity : function (value) { return String(value || "").toLowerCase(); };
  const page = fold([wine && wine.provenance && wine.provenance.pageUrl, wine && wine.provenance && wine.provenance.pageExcerpt].filter(Boolean).join(" "));
  const label = fold(evidence || "");
  if (!page || !label) return false;
  if (/beychevelle/.test(page) && !/chateau margaux/.test(page)) return false;
  return /du chateau margaux|chateau margaux/.test(page);
}

function alignScannedIdentity(wine, text) {
  if (!wine || (typeof isCatalogWineId === "function" && isCatalogWineId(wine.id))) return false;
  if (typeof userLocked === "function" && (userLocked(wine, "name") || userLocked(wine, "producer"))) return false;
  const evidence = text || labelEvidence(wine);
  const picked = typeof catalogWineForLabel === "function" ? catalogWineForLabel(evidence) : null;
  if (!picked) return false;
  let changed = false;
  wine.provenance = wine.provenance || {};
  if (wine.name !== picked.name) { wine.name = picked.name; changed = true; }
  if (wine.producer !== picked.producer) { wine.producer = picked.producer; changed = true; }
  if (picked.appellation && wine.appellation !== picked.appellation) { wine.appellation = picked.appellation; changed = true; }
  if (picked.region && wine.region !== picked.region) { wine.region = picked.region; changed = true; }
  if (picked.country && !wine.country) { wine.country = picked.country; changed = true; }
  if (picked.type && wine.provenance.type !== "usuario" && wine.type !== picked.type) { wine.type = picked.type; changed = true; }
  wine.provenance.name = "catálogo";
  wine.provenance.producer = "catálogo";
  wine.provenance.region = "catálogo";
  if (wine.provenance.price && wine.provenance.price !== "usuario" && !pageAgreesWithLabel(wine, evidence)) {
    wine.priceHint = "";
    if (wine.dossier && wine.dossier.market) wine.dossier.market = { low: null, mid: null, high: null, trend: "" };
    delete wine.provenance.price;
    changed = true;
  }
  if (wine.provenance.aging === "valor por defecto") delete wine.provenance.aging;
  if (wine.provenance.price === "valor por defecto") {
    wine.priceHint = "";
    delete wine.provenance.price;
    changed = true;
  }
  return changed;
}

function misfiledBeychevelle(wine, evidence) {
  if (!wine || Number(wine.vintage) !== 2015) return false;
  const fold = typeof foldIdentity === "function" ? foldIdentity : function (value) { return String(value || "").toLowerCase(); };
  const identity = fold([wine.name, wine.producer].join(" "));
  const label = fold(evidence || "");
  if (!/\bbeychevelle\b/.test(identity)) return false;
  if (!label || /\bbeychevelle\b/.test(label)) return false;
  return typeof secondMargauxText === "function" && secondMargauxText(label);
}

function clearWrongSheet(wine) {
  const prov = wine.provenance || {};
  ["tasting", "crianza"].forEach(key => {
    if (prov[key] && prov[key] !== "usuario") {
      wine[key] = "";
      delete prov[key];
    }
  });
  if (prov.grapes && prov.grapes !== "usuario") {
    wine.grapes = [];
    delete prov.grapes;
  }
  if (prov.pairing && prov.pairing !== "usuario") {
    wine.pairing = [];
    delete prov.pairing;
  }
}

function migrateMisfiledMargaux(st) {
  if (!st || !Array.isArray(st.customWines)) return false;
  let changed = false;
  st.customWines.forEach(wine => {
    const evidence = labelEvidence(wine, st);
    if (!misfiledBeychevelle(wine, evidence)) return;
    const before = wine.id;
    if (!alignScannedIdentity(wine, evidence)) return;
    clearWrongSheet(wine);
    wine.id = before;
    const previousParent = wine.parentId;
    delete wine.parentId;
    if (typeof wineParentId === "function") wine.parentId = wineParentId(wine);
    if (st.cuvees && previousParent && previousParent !== wine.parentId) {
      const old = st.cuvees[previousParent];
      if (old && Array.isArray(old.vintageIds)) {
        old.vintageIds = old.vintageIds.filter(id => id !== wine.id);
        if (!old.vintageIds.length) delete st.cuvees[previousParent];
      }
    }
    if (typeof migrateV86 === "function") migrateV86(st);
    changed = true;
  });
  return changed;
}

var wineForIntakeV109 = typeof wineForIntake === "function" ? wineForIntake : null;
if (wineForIntakeV109) {
  wineForIntake = function (fields, catalogHit) {
    const built = wineForIntakeV109(fields, catalogHit);
    const wine = built && built.wine;
    if (wine && !built.fromCatalog && typeof fieldValue === "function") {
      const text = [fieldValue(fields, "name"), fieldValue(fields, "producer"), fieldValue(fields, "appellation"), wine.provenance && wine.provenance.ocrText].filter(Boolean).join(" ");
      alignScannedIdentity(wine, text);
    }
    return built;
  };
}

var wineFromInternetHitV109 = typeof wineFromInternetHit === "function" ? wineFromInternetHit : null;
if (wineFromInternetHitV109) {
  wineFromInternetHit = function (hit) {
    const wine = wineFromInternetHitV109(hit);
    if (wine) alignScannedIdentity(wine, (typeof lastOcrRaw !== "undefined" && lastOcrRaw) || labelEvidence(wine));
    return wine;
  };
}

var inferWineFromTextV109 = typeof inferWineFromText === "function" ? inferWineFromText : null;
if (inferWineFromTextV109) {
  inferWineFromText = function (raw) {
    const wine = inferWineFromTextV109(raw);
    if (wine && !(typeof isCatalogWineId === "function" && isCatalogWineId(wine.id))) alignScannedIdentity(wine, raw);
    return wine;
  };
}

var completeWineRecordV109 = typeof completeWineRecord === "function" ? completeWineRecord : null;
if (completeWineRecordV109) {
  completeWineRecord = async function (wine, pageUrl) {
    const result = await completeWineRecordV109(wine, pageUrl);
    if (wine && alignScannedIdentity(wine, labelEvidence(wine))) {
      if (typeof save === "function") save();
    }
    return result;
  };
}

(function () {
  if (typeof state === "undefined" || !state || state._corrupt) return;
  if (typeof cellarLocked !== "undefined" && cellarLocked) return;
  try {
    if (migrateMisfiledMargaux(state) && typeof save === "function") save();
  } catch (err) {}
})();

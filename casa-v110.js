/* v110: una sola pasada para la ficha Beychevelle 2015 que en realidad es Margaux du Château Margaux. */
function foldV110(value) {
  if (typeof foldIdentity === "function") return foldIdentity(value);
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function beychevelleIdentity(wine) {
  const name = foldV110(wine && wine.name);
  const producer = foldV110(wine && wine.producer);
  const blob = (name + " " + producer).trim();
  if (!/\bbeychevelle\b/.test(blob)) return false;
  return /\bchateau beychevelle\b/.test(blob) || name === "beychevelle" || producer === "beychevelle";
}

function medocPlace(wine) {
  const prov = (wine && wine.provenance) || {};
  return [wine && wine.region, wine && wine.appellation, prov.zoneId].some(value => {
    const folded = foldV110(value);
    return folded === "medoc" || /\bmedoc\b/.test(folded);
  });
}

function defaultRegionMark(wine) {
  const prov = (wine && wine.provenance) || {};
  const src = prov.region || "";
  if (!src || src === "valor por defecto") return true;
  if (src === "página" || src === "usuario" || src === "catálogo") {
    return Object.keys(prov).some(key => prov[key] === "valor por defecto");
  }
  return true;
}

function recentAlta(wine) {
  const prov = (wine && wine.provenance) || {};
  if (prov.intakeStatus === "CONFIRMED") return true;
  return wine && wine.style === "escaneo" && prov.intake === "usuario";
}

function margauxEngraving(wine) {
  const asset = String((wine && wine.wineryAsset) || "");
  if (/chateau-margaux/.test(asset)) return true;
  return !!(wine && wine.provenance && wine.provenance.wineryId === "margaux");
}

function beychevelleCandidate(wine) {
  if (!wine || (typeof isCatalogWineId === "function" && isCatalogWineId(wine.id))) return false;
  if (typeof userLocked === "function" && (userLocked(wine, "name") || userLocked(wine, "producer"))) return false;
  if (Number(wine.vintage) !== 2015) return false;
  if (!beychevelleIdentity(wine)) return false;
  if (!medocPlace(wine)) return false;
  if (!defaultRegionMark(wine)) return false;
  if (!recentAlta(wine)) return false;
  if (!margauxEngraving(wine)) return false;
  return true;
}

function applyMargauxSecond(wine, st) {
  const catalog = (typeof WINE_CATALOG !== "undefined" ? WINE_CATALOG : []).find(item => item && item.id === "margaux-du-chateau-margaux");
  const keptId = wine.id;
  wine.name = (catalog && catalog.name) || "Margaux du Château Margaux";
  wine.producer = (catalog && catalog.producer) || "Château Margaux";
  wine.appellation = (catalog && catalog.appellation) || "AOC Margaux";
  wine.region = (catalog && catalog.region) || "Margaux";
  wine.type = (catalog && catalog.type) || "tinto";
  wine.country = wine.country || (catalog && catalog.country) || "Francia";
  wine.vintage = 2015;
  wine.id = keptId;
  wine.provenance = wine.provenance || {};
  wine.provenance.name = "catálogo";
  wine.provenance.producer = "catálogo";
  wine.provenance.region = "catálogo";
  wine.provenance.wineryId = "margaux";
  if (!/chateau-margaux/.test(String(wine.wineryAsset || ""))) wine.wineryAsset = "vinedo-chateau-margaux.jpg";
  const previousParent = wine.parentId;
  delete wine.parentId;
  if (typeof wineParentId === "function") wine.parentId = wineParentId(wine);
  if (st && st.cuvees && previousParent && previousParent !== wine.parentId) {
    const old = st.cuvees[previousParent];
    if (old && Array.isArray(old.vintageIds)) {
      old.vintageIds = old.vintageIds.filter(id => id !== wine.id);
      if (!old.vintageIds.length) delete st.cuvees[previousParent];
    }
  }
}

function citeCatalogRegions(st, skipId) {
  (st.customWines || []).forEach(wine => {
    if (!wine || wine.id === skipId) return;
    if (typeof isCatalogWineId === "function" && isCatalogWineId(wine.id)) return;
    const prov = wine.provenance || {};
    if (prov.region) return;
    if (!(prov.wineryId || prov.zoneId)) return;
    if (!String(wine.region || wine.appellation || "").trim()) return;
    wine.provenance = prov;
    prov.region = "catálogo";
  });
}

function migrateV110Margaux(st) {
  if (!st || st._corrupt || !Array.isArray(st.customWines)) return false;
  st.migrations = st.migrations || {};
  if (st.migrations["v110-margaux"]) return false;
  if (typeof window !== "undefined" && window.__CASA_MIGRATION_HOLD === "v110-margaux") return false;
  const found = st.customWines.filter(beychevelleCandidate);
  const record = {
    at: new Date().toISOString(),
    count: found.length,
    wineId: "",
    action: found.length === 1 ? "corrected" : (found.length ? "skipped-many" : "none")
  };
  if (found.length === 1) {
    applyMargauxSecond(found[0], st);
    record.wineId = found[0].id;
    if (typeof migrateV86 === "function") migrateV86(st);
  }
  citeCatalogRegions(st, record.wineId);
  st.migrations["v110-margaux"] = record;
  return true;
}

(function () {
  if (typeof state === "undefined" || !state || state._corrupt) return;
  if (typeof cellarLocked !== "undefined" && cellarLocked) return;
  try {
    if (migrateV110Margaux(state) && typeof save === "function") save();
  } catch (err) {}
})();

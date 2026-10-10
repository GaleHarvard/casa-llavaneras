/* Arranque y enlaces con la página. */
const APP_VERSION = "v76";
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", ev => {
    const d = ev.data || {};
    if (d.type === "open" && d.screen) show(d.screen);
  });
}
window.renderCellar = renderCellar;
window.scheduleCellarSearch = scheduleCellarSearch;
const cellarQ = document.getElementById("cellar-q");
if (cellarQ) {
  ["input", "search", "change", "keyup", "compositionend"].forEach(type => {
    cellarQ.addEventListener(type, scheduleCellarSearch);
  });
}
window.renderPairings = renderPairings;
window.openDish = openDish;
window.setPairMode = (m, btn) => {
  pairingMode = m;
  $$("#pair-seg button").forEach(b => b.classList.toggle("on", b === btn));
  renderPairings();
};
window.setPairQuery = v => { pairingQuery = v; renderPairings(); };
window.show = show;
window.openBottle = openBottle;
window.openWine = openWine;
window.openWineSub = openWineSub;
window.openExternal = openExternal;
window.setTaste = setTaste;
window.openWineMenu = openWineMenu;
window.openCave = openCave;
window.startScan = startScan;
window.renderInbox = renderInbox;
window.enterInbox = enterInbox;
window.parkScanInInbox = parkScanInInbox;
window.runIdentify = runIdentify;
window.fakeScan = runIdentify;
window.captureLabel = captureLabel;
window.pickLabelPhoto = pickLabelPhoto;
window.pickFromRoll = pickFromRoll;
window.confirmScanWine = confirmScanWine;
window.confirmScanCustom = confirmScanCustom;
window.quickAdd = quickAdd;
window.toggleFav = toggleFav;
window.addCurrentToCellar = addCurrentToCellar;
window.openNotify = openNotify;
window.openPerfilSub = openPerfilSub;
window.setPref = setPref;
window.setSource = setSource;
window.exportBackup = exportBackup;
window.exportCsv = exportCsv;
window.exportTastingCsv = exportTastingCsv;
window.reviewRestore = reviewRestore;
window.importCsv = importCsv;
window.askWipe = askWipe;
window.exitDemo = exitDemo;
window.quickTaste = quickTaste;
window.openHomeMap = openHomeMap;
window.openWineThenTaste = openWineThenTaste;
window.addToLot = addToLot;
window.consumeMany = consumeMany;
window.showLotInCave = showLotInCave;
window.setExitReason = setExitReason;
window.setRemoveReason = setRemoveReason;
window.confirmExit = confirmExit;
window.setBebidaFilter = setBebidaFilter;
window.estimateMissingMarket = estimateMissingMarket;
window.editMissingMarket = editMissingMarket;
window.saveMarketEdits = saveMarketEdits;
window.pickFreeSlot = pickFreeSlot;
window.onAddBinInput = onAddBinInput;
window.paintFreeSlots = paintFreeSlots;
window.askServe = askServe;
window.askServeMany = askServeMany;
window.confirmServe = confirmServe;
window.skipServe = skipServe;
window.setServeChip = setServeChip;
window.syncServeChip = syncServeChip;
window.setServeRating = setServeRating;
window.editConsumption = editConsumption;
window.deleteConsumption = deleteConsumption;
window.dismissStock = dismissStock;
window.renderBebidas = renderBebidas;
window.deleteCave = deleteCave;
window.goBack = goBack;
window.refreshAddKeep = refreshAddKeep;
window.setPriceMode = setPriceMode;
window.APP_VERSION = APP_VERSION;
window.savePriceCfg = savePriceCfg;
window.probeGeminiKey = probeGeminiKey;
window.changeWineLabel = changeWineLabel;
window.refreshGeminiKeyState = refreshGeminiKeyState;
window.setNotify = setNotify;
window.enableNotifications = enableNotifications;
window.testNotification = testNotification;
window.moveBottle = moveBottle;
window.addCave = addCave;
window.saveCaveTemp = saveCaveTemp;
window.openSpaceSheet = openSpaceSheet;
window.addSequentialSpaces = addSequentialSpaces;
window.assignExistingSpace = assignExistingSpace;
window.previewNewSlots = previewNewSlots;
window.consumeBottle = consumeBottle;
window.showSheet = showSheet;
window.hideSheets = hideSheets;
window.removeLot = removeLot;
window.removeWineLots = removeWineLots;
window.deleteInbox = deleteInbox;
window.previewScanQuery = previewScanQuery;
window.setFilter = (t, btn) => {
  filterType = t;
  const row = btn && btn.parentElement;
  if (row) $$(".chip", row).forEach(c => c.classList.toggle("on", c === btn));
  renderCellar();
};
document.addEventListener("DOMContentLoaded", () => {
  const hideSplash = () => {
    const el = document.getElementById("splash");
    if (el) el.classList.add("hide");
  };
  let booted = false;
  let painted = false;
  const paint = (allowSave) => {
    try {
      if (!booted) {
        booted = true;
        clock();
        setInterval(() => { try { clock(); } catch (e) {} }, 30000);
        try { askPersistentStorage(); } catch (e) {}
      }
      if (allowSave) {
        try { refreshDirtyInternetWines(); } catch (e) { console.warn("limpieza", e); }
      }
      if (!painted) {
        try { renderHome(); } catch (e) { console.warn("inicio", e); throw e; }
        painted = true;
        if (window.casaMarkReady) window.casaMarkReady();
        else hideSplash();
      } else {
        repaintAfterLabels();
      }
    } catch (e) {
      console.warn("arranque", e);
      if (window.casaShowBootError) window.casaShowBootError();
    }
  };
  const slow = setTimeout(() => paint(false), 900);
  prepareOwnLabels().then(() => {
    clearTimeout(slow);
    paint(true);
  }).catch(() => {
    clearTimeout(slow);
    paint(true);
  });
  setTimeout(() => { try { runNotifyCheck(false); } catch (e) {} }, 1600);
});

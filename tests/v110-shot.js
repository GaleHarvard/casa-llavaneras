/* Antes y después de la ficha Beychevelle 2015, 1170×2532. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const playwright = require("/tmp/pw/node_modules/playwright");

const outDir = "/opt/cursor/artifacts";
fs.mkdirSync(outDir, { recursive: true });

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function seed(hold) {
  const wine = {
    id: "alta-beychevelle-2015",
    name: "Château Beychevelle",
    producer: "Château Beychevelle",
    vintage: 2015,
    region: "Médoc",
    appellation: "Médoc",
    country: "Francia",
    type: "tinto",
    style: "escaneo",
    priceHint: "158,90 €",
    wineryAsset: "vinedo-chateau-margaux.jpg",
    frontLabelImage: "idb:alta-beychevelle-2015",
    labelThumb: "idb:alta-beychevelle-2015",
    provenance: {
      intake: "usuario",
      intakeStatus: "CONFIRMED",
      zoneId: "Médoc",
      wineryId: "margaux",
      region: "valor por defecto",
      aging: "valor por defecto",
      price: "página"
    }
  };
  const raw = localStorage.getItem("vinoteca.pro.max.v3");
  const state = raw ? JSON.parse(raw) : { vinotecas: [{ id: "v1", name: "Casa" }], bottles: [] };
  if (!Array.isArray(state.vinotecas)) state.vinotecas = [{ id: "v1", name: "Casa" }];
  state.customWines = state.customWines || [];
  state.customWines.push(wine);
  state.bottles = state.bottles || [];
  state.bottles.push({ uid: "b-bey", wineId: wine.id, qty: 1, cellarId: "v1", bin: "C-02", price: 158.9, note: "balda", labelPhoto: "idb:alta-beychevelle-2015" });
  localStorage.setItem("vinoteca.pro.max.v3", JSON.stringify(state));
  if (hold) window.__CASA_MIGRATION_HOLD = "v110-margaux";
}

async function openSheet(browser, hold, file) {
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  });
  await context.addInitScript(seed, hold);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", err => errors.push(String(err)));
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" }).catch(() => {});
  await page.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && getComputedStyle(splash).display === "none";
  }, null, { timeout: 8000 });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  const info = await page.evaluate(() => {
    const wine = state.customWines.find(item => item && item.id === "alta-beychevelle-2015");
    const bottle = state.bottles.find(item => item && item.uid === "b-bey");
    openWine(wine.id, bottle);
    return {
      version: APP_VERSION,
      name: wine.name,
      producer: wine.producer,
      appellation: wine.appellation,
      shown: shownAppellation(wine),
      priceHint: wine.priceHint,
      bin: bottle.bin,
      photo: bottle.labelPhoto,
      price: bottle.price,
      action: state.migrations && state.migrations["v110-margaux"] && state.migrations["v110-margaux"].action,
      image: (document.querySelector("#wine-body img") || {}).src || ""
    };
  });
  await page.waitForFunction(() => {
    const img = document.querySelector("#wine-body img");
    return img && (img.getAttribute("src") || "").indexOf("vinedo-chateau-margaux.jpg") >= 0 && img.complete && img.naturalWidth > 400;
  });
  const text = await page.locator("#wine-body").innerText();
  await page.screenshot({ path: file, type: "png" });
  assert.deepStrictEqual(pngSize(file), { width: 1170, height: 2532 });
  assert.deepStrictEqual(errors, []);
  await context.close();
  return { info, text };
}

(async () => {
  const browser = await playwright.webkit.launch();
  const before = await openSheet(browser, true, path.join(outDir, "v110-antes.png"));
  assert.strictEqual(before.info.version, "v111");
  assert.ok(before.info.name.indexOf("Beychevelle") >= 0);
  assert.ok(before.info.producer.indexOf("Beychevelle") >= 0);
  assert.strictEqual(before.info.shown, "");
  assert.strictEqual(before.info.priceHint, "158,90 €");
  assert.strictEqual(before.info.action, undefined);
  assert.ok(before.text.includes("Alta confirmada"));
  assert.ok(before.text.includes("Château Beychevelle"));
  assert.ok(before.text.includes("158,90"));
  assert.ok(!before.text.includes("valor por defecto"));
  assert.ok(!before.text.includes("Margaux du Château Margaux"));

  const after = await openSheet(browser, false, path.join(outDir, "v110-despues.png"));
  assert.strictEqual(after.info.name, "Margaux du Château Margaux");
  assert.strictEqual(after.info.producer, "Château Margaux");
  assert.strictEqual(after.info.appellation, "AOC Margaux");
  assert.strictEqual(after.info.shown, "AOC Margaux");
  assert.strictEqual(after.info.priceHint, "158,90 €");
  assert.strictEqual(after.info.bin, "C-02");
  assert.strictEqual(after.info.photo, "idb:alta-beychevelle-2015");
  assert.strictEqual(after.info.price, 158.9);
  assert.strictEqual(after.info.action, "corrected");
  assert.ok(after.text.includes("Margaux du Château Margaux"));
  assert.ok(after.text.includes("AOC Margaux"));
  assert.ok(after.text.includes("158,90"));
  assert.ok(after.text.includes("Alta confirmada"));
  assert.ok(!after.text.includes("Beychevelle"));
  assert.ok(!after.text.includes("valor por defecto"));
  await browser.close();
  console.log("v110-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

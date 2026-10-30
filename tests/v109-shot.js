/* Ficha corregida de Margaux du Château Margaux, 1170×2532. */
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

(async () => {
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  });
  await context.addInitScript(() => {
    const wine = {
      id: "scan-beychevelle",
      name: "Château Beychevelle",
      producer: "Château Beychevelle",
      vintage: 2015,
      region: "Médoc",
      appellation: "Médoc",
      country: "Francia",
      type: "tinto",
      priceHint: "158,90 €",
      tasting: "Casis y cedro de otra bodega.",
      grapes: ["Cabernet Sauvignon"],
      aging: { drinkFrom: 2016, peakStart: 2018, peakEnd: 2025, holdTo: 2030 },
      provenance: {
        name: "página",
        producer: "página",
        region: "valor por defecto",
        price: "página",
        aging: "valor por defecto",
        tasting: "página",
        grapes: "página",
        ocrText: "MARGAUX 2015 · DU CHÂTEAU MARGAUX",
        pageUrl: "https://www.vinissimus.com/es/vino/chateau-beychevelle/"
      }
    };
    const raw = localStorage.getItem("vinoteca.pro.max.v3");
    const state = raw ? JSON.parse(raw) : { vinotecas: [{ id: "v1", name: "Casa" }], bottles: [] };
    if (!Array.isArray(state.vinotecas)) state.vinotecas = [{ id: "v1", name: "Casa" }];
    state.customWines = state.customWines || [];
    state.customWines.push(wine);
    state.bottles = state.bottles || [];
    state.bottles.push({ uid: "b-margaux", wineId: wine.id, qty: 1, cellarId: "v1", bin: "B-04", price: 80, note: "arriba", labelPhoto: "idb:scan-beychevelle" });
    state.inbox = state.inbox || [];
    state.inbox.push({ wineId: wine.id, text: "MARGAUX 2015 · DU CHÂTEAU MARGAUX" });
    localStorage.setItem("vinoteca.pro.max.v3", JSON.stringify(state));
  });
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
  const fixed = await page.evaluate(() => {
    const wine = state.customWines.find(item => item && item.id === "scan-beychevelle");
    const bottle = state.bottles.find(item => item && item.uid === "b-margaux");
    openWine(wine.id, bottle);
    return {
      version: APP_VERSION,
      name: wine.name,
      producer: wine.producer,
      region: wine.region,
      appellation: wine.appellation,
      priceHint: wine.priceHint,
      bottlePrice: bottle.price,
      bin: bottle.bin,
      photo: bottle.labelPhoto,
      range: shownDrinkRange(wine),
      image: wineryImageFor(wine)
    };
  });
  assert.strictEqual(fixed.version, "v111");
  assert.strictEqual(fixed.name, "Margaux du Château Margaux");
  assert.strictEqual(fixed.producer, "Château Margaux");
  assert.strictEqual(fixed.appellation, "AOC Margaux");
  assert.strictEqual(fixed.region, "Margaux");
  assert.strictEqual(fixed.priceHint, "");
  assert.strictEqual(fixed.range, "");
  assert.strictEqual(fixed.bottlePrice, 80);
  assert.strictEqual(fixed.bin, "B-04");
  assert.strictEqual(fixed.photo, "idb:scan-beychevelle");
  assert.strictEqual(fixed.image, "vinedo-chateau-margaux.jpg");
  await page.waitForFunction(() => {
    const img = document.querySelector("#wine-body img");
    return img && (img.getAttribute("src") || "").indexOf("vinedo-chateau-margaux.jpg") >= 0 && img.complete && img.naturalWidth > 400;
  });
  const text = await page.locator("#wine-body").innerText();
  assert.ok(text.includes("Margaux du Château Margaux"));
  assert.ok(text.includes("Château Margaux"));
  assert.ok(text.includes("AOC Margaux"));
  assert.ok(!text.includes("Beychevelle"));
  assert.ok(!text.includes("valor por defecto"));
  assert.ok(!text.includes("158"));
  assert.ok(!text.includes("2019"));
  assert.ok(!text.includes("Médoc · Cabernet"));
  assert.ok(!text.replace("Margaux · Médoc", "").includes("Médoc"));
  const file = path.join(outDir, "v109-margaux-ficha.png");
  await page.screenshot({ path: file, type: "png" });
  assert.deepStrictEqual(pngSize(file), { width: 1170, height: 2532 });
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log("v109-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

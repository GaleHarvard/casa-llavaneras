/* Ficha de prueba de Bodegas Muriel, solo para la captura. */
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

  const ready = await page.evaluate(() => {
    const wine = {
      id: "prueba-muriel",
      producer: "Bodegas Muriel",
      name: "Muriel",
      region: "Rioja Alavesa",
      appellation: "Rioja Alavesa",
      country: "España",
      type: "tinto",
      vintage: 0,
      grapes: []
    };
    state.customWines = state.customWines || [];
    state.customWines.push(wine);
    const hero = wineHeroHtml(wine);
    openWine(wine.id);
    const img = document.querySelector("#wine-body .estate-photo, #wine-body .hero-art img, #wine-body img.hero-art");
    return {
      version: APP_VERSION,
      image: wineryImageFor(wine),
      card: (wineryCardFor(wine) || {}).id || "",
      hero: hero,
      src: img ? img.getAttribute("src") : "",
      full: img ? img.className : ""
    };
  });
  assert.strictEqual(ready.version, "v108");
  assert.strictEqual(ready.image, "bodega-muriel.jpg");
  assert.strictEqual(ready.card, "bodegas-muriel");
  assert.ok(ready.hero.includes("bodega-muriel.jpg"));
  assert.ok(ready.hero.includes("hero-art-full"));
  assert.ok(!ready.hero.includes("botella-"));
  assert.strictEqual(ready.src, "bodega-muriel.jpg");
  await page.waitForFunction(() => {
    const img = document.querySelector("#wine-body img");
    return img && img.getAttribute("src") === "bodega-muriel.jpg" && img.complete && img.naturalWidth > 400;
  });
  await page.evaluate(() => {
    const screen = document.getElementById("wine");
    if (screen) screen.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  const file = path.join(outDir, "v108-muriel-ficha.png");
  await page.screenshot({ path: file, type: "png" });
  assert.deepStrictEqual(pngSize(file), { width: 1170, height: 2532 });
  const text = await page.locator("#wine-body").innerText();
  assert.ok(text.includes("Bodegas Muriel") || text.includes("Muriel"));
  assert.ok(!text.includes("Sin dato"));
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log("v108-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

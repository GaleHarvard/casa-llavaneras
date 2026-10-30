/* Ficha de Château Beychevelle con el grabado nuevo. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const playwright = require("/tmp/pw/node_modules/playwright");

const out = "/opt/cursor/artifacts/v111-beychevelle.png";
fs.mkdirSync("/opt/cursor/artifacts", { recursive: true });

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

(async () => {
  const browser = await playwright.webkit.launch();
  const page = await (await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  })).newPage();
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
    const wine = {
      id: "prueba-beychevelle",
      name: "Château Beychevelle",
      producer: "Château Beychevelle",
      vintage: 2015,
      type: "tinto",
      grapes: []
    };
    state.customWines = state.customWines || [];
    state.customWines.push(wine);
    openWine(wine.id);
    return { version: APP_VERSION, image: wineryImageFor(wine) };
  });
  assert.strictEqual(info.version, "v111");
  assert.strictEqual(info.image, "bodega-chateau-beychevelle.jpg");
  await page.waitForFunction(() => {
    const img = document.querySelector("#wine-body img");
    return img && img.getAttribute("src") === "bodega-chateau-beychevelle.jpg" && img.complete && img.naturalWidth > 400;
  });
  const text = await page.locator("#wine-body").innerText();
  assert.ok(text.includes("Château Beychevelle"));
  await page.screenshot({ path: out, type: "png" });
  assert.deepStrictEqual(pngSize(out), { width: 1170, height: 2532 });
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log("v111-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

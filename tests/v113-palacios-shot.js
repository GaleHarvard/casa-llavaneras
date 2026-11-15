/* Ficha de Descendientes de J. Palacios: grabado y historia. */
const assert = require("assert");
const fs = require("fs");
const playwright = require("/tmp/pw/node_modules/playwright");

const sheetShot = "/opt/cursor/artifacts/v113-palacios-ficha.png";
const historyShot = "/opt/cursor/artifacts/v113-palacios-historia.png";
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
    openBodega("descendientes-de-j-palacios", true);
    const card = wineryCardById("descendientes-de-j-palacios");
    const img = document.querySelector("#bodegas-body img");
    return {
      version: APP_VERSION,
      file: card && card.file,
      src: img && img.getAttribute("src"),
      width: img ? img.naturalWidth : 0
    };
  });
  assert.strictEqual(info.version, "v113");
  assert.strictEqual(info.file, "bodega-descendientes-de-j-palacios.jpg");
  assert.strictEqual(info.src, "bodega-descendientes-de-j-palacios.jpg");
  await page.waitForFunction(() => {
    const img = document.querySelector("#bodegas-body img");
    return img && img.complete && img.naturalWidth > 400;
  });
  const top = await page.locator("#bodegas-body").innerText();
  assert.ok(top.includes("Descendientes de J. Palacios"), top);
  assert.ok(top.includes("Corullón"), top);
  assert.ok(/do bierzo/i.test(top), top);
  assert.ok(!top.includes("Priorat"));
  assert.ok(!top.includes("alvaropalacios.com"));
  await page.screenshot({ path: sheetShot, type: "png" });
  assert.deepStrictEqual(pngSize(sheetShot), { width: 1170, height: 2532 });

  await page.evaluate(() => {
    const body = document.getElementById("bodegas-body");
    const node = Array.from(body.querySelectorAll("p")).find(p => /Rafael Moneo/.test(p.textContent));
    if (node) node.scrollIntoView({ block: "start" });
  });
  const history = await page.locator("#bodegas-body").innerText();
  assert.ok(history.includes("Rafael Moneo"));
  assert.ok(history.includes("1999"));
  assert.ok(history.includes("23 ha"));
  assert.ok(history.includes("Chao do Pando"));
  assert.ok(history.includes("Pétalos"));
  assert.ok(history.includes("La Faraona"));
  assert.ok(history.includes("bodeboca.com"));
  assert.ok(history.includes("crdobierzo.es"));
  await page.screenshot({ path: historyShot, type: "png" });
  assert.deepStrictEqual(pngSize(historyShot), { width: 1170, height: 2532 });
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log("v113-palacios-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

/* Ficha de Dominio del Challao con su grabado. */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const playwright = require("/tmp/pw/node_modules/playwright");

const out = "/opt/cursor/artifacts/v112-challao.png";
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
    openBodega("dominio-del-challao", true);
    const card = wineryCardById("dominio-del-challao");
    return { version: APP_VERSION, file: card && card.file, town: card && card.town };
  });
  assert.strictEqual(info.version, "v112");
  assert.strictEqual(info.file, "bodega-dominio-del-challao.jpg");
  assert.strictEqual(info.town, "Labastida");
  await page.waitForFunction(() => {
    const img = document.querySelector("#bodegas-body img");
    const text = document.getElementById("bodegas-body").innerText;
    return img && img.getAttribute("src") === "bodega-dominio-del-challao.jpg" && img.complete && img.naturalWidth > 400
      && text.includes("Labastida") && text.includes("2019") && text.includes("ideavinos.com");
  });
  await page.evaluate(() => {
    const body = document.getElementById("bodegas-body");
    if (body) body.scrollTop = body.scrollHeight;
  });
  const text = await page.locator("#bodegas-body").innerText();
  assert.ok(text.includes("Dominio del Challao"));
  assert.ok(text.includes("Challao Blanco"));
  assert.ok(/rioja alavesa/i.test(text), text);
  assert.ok(!text.includes("Laguardia"));
  assert.ok(!text.includes("El Olmo"));
  await page.screenshot({ path: out, type: "png" });
  assert.deepStrictEqual(pngSize(out), { width: 1170, height: 2532 });
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log("v112-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

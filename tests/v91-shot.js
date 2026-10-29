/* Lista de bodegas y ficha de Marqués de Riscal, 1170×2532. */
const fs = require("fs");
const assert = require("assert");
const playwright = require("/tmp/pw/node_modules/playwright");

(async () => {
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });
  const page = await context.newPage();
  page.on("dialog", dialog => dialog.accept());
  await page.route("**/*", route => {
    const url = route.request().url();
    if (/generativelanguage\.googleapis\.com/.test(url)) return route.abort("failed");
    return route.continue();
  });
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide");
  });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });

  await page.evaluate(() => openBodegaList());
  await page.waitForSelector("#bodegas-body h1");
  const list = await page.evaluate(() => {
    const h1 = document.querySelector("#bodegas-body h1");
    const text = document.getElementById("bodegas-body").textContent;
    const tiles = document.querySelectorAll("#bodegas-body .zone-tile").length;
    return {
      version: APP_VERSION,
      h1: h1.textContent,
      outline: getComputedStyle(h1).outlineStyle,
      tiles: tiles,
      text: text.slice(0, 400)
    };
  });
  assert.strictEqual(list.version, "v109");
  assert.strictEqual(list.h1, "Bodegas");
  assert.strictEqual(list.outline, "none");
  assert.ok(list.tiles >= 4, String(list.tiles));
  assert.ok(list.text.indexOf("España") >= 0);
  assert.ok(list.text.indexOf("Marqués de Riscal") >= 0);
  await page.screenshot({ path: "/opt/cursor/artifacts/v91-bodegas-lista-datos-hd.png", type: "png" });

  await page.evaluate(() => openBodega("vega-sicilia", true));
  await page.waitForFunction(() => {
    const h1 = document.querySelector("#bodegas-body h1");
    return h1 && h1.textContent === "Vega Sicilia";
  });
  const sheet = await page.evaluate(() => {
    const body = document.getElementById("bodegas-body");
    const img = body.querySelector("img");
    return {
      text: body.innerText,
      src: img ? img.getAttribute("src") : "",
      form: !!document.getElementById("score-form")
    };
  });
  assert.ok(sheet.text.indexOf("Valbuena de Duero") >= 0, sheet.text);
  assert.ok(sheet.text.indexOf("1864") >= 0);
  assert.ok(sheet.text.indexOf("Fuentes") >= 0);
  assert.ok(sheet.text.indexOf("temposvegasicilia.com") >= 0);
  assert.strictEqual(sheet.src, "bodega-vega-sicilia.jpg");
  await page.screenshot({ path: "/opt/cursor/artifacts/v91-vega-sicilia-hd.png", type: "png" });
  await browser.close();
  console.log("v91-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

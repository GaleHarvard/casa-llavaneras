/* Ficha de la bodega Pago de los Capellanes. No hay vino suyo en el catálogo. */
const assert = require("assert");
const fs = require("fs");
const playwright = require("/tmp/pw/node_modules/playwright");

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

  const catalog = await page.evaluate(() => {
    const rows = (window.WINE_CATALOG || []).concat(state.customWines || []);
    return {
      version: APP_VERSION,
      hits: rows.filter(wine => /capellan/i.test((wine.producer || "") + " " + (wine.name || ""))).map(wine => wine.id)
    };
  });
  assert.strictEqual(catalog.version, "v102");
  assert.deepStrictEqual(catalog.hits, []);

  const future = await page.evaluate(() => {
    const wine = { producer: "Bodegas Pago de los Capellanes", name: "Crianza", region: "Ribera del Duero", appellation: "Ribera del Duero", type: "tinto", grapes: ["Tempranillo"] };
    const hero = wineHeroHtml(wine);
    return {
      image: wineryImageFor(wine),
      card: (wineryCardFor(wine) || {}).id || "",
      hero: hero,
      bottle: hero.indexOf("botella-") >= 0
    };
  });
  assert.strictEqual(future.image, "bodega-pago-de-los-capellanes.jpg");
  assert.strictEqual(future.card, "pago-de-los-capellanes");
  assert.ok(future.hero.includes("bodega-pago-de-los-capellanes.jpg"));
  assert.ok(future.hero.includes("hero-art-full"));
  assert.strictEqual(future.bottle, false);

  await page.evaluate(() => openBodega("pago-de-los-capellanes", true));
  await page.waitForFunction(() => {
    const h1 = document.querySelector("#bodegas-body h1");
    const img = document.querySelector("#bodegas-body img");
    return h1 && h1.textContent === "Pago de los Capellanes" && img && img.complete && img.naturalWidth > 0;
  });
  const sheet = await page.evaluate(() => {
    const body = document.getElementById("bodegas-body");
    return {
      title: body.querySelector("h1").textContent,
      src: body.querySelector("img").getAttribute("src"),
      text: body.innerText
    };
  });
  assert.strictEqual(sheet.title, "Pago de los Capellanes");
  assert.strictEqual(sheet.src, "bodega-pago-de-los-capellanes.jpg");
  assert.ok(sheet.text.includes("Ribera del Duero"), sheet.text);
  assert.ok(sheet.text.includes("Pago de Capellanes"), sheet.text);
  assert.ok(sheet.text.includes("Bodegas Pago de los Capellanes"), sheet.text);
  assert.ok(!sheet.text.includes("Sin dato"), sheet.text);

  const shot = async (name) => {
    const file = "/opt/cursor/artifacts/" + name;
    await page.screenshot({ path: file, type: "png" });
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  };
  await shot("v102-pago-de-los-capellanes.png");

  await page.evaluate(() => renderBodegas("Capellanes"));
  await page.waitForFunction(() => {
    const tile = document.querySelector("#bodegas-body .zone-tile");
    const img = tile && tile.querySelector("img");
    return tile && img && img.getAttribute("src") === "bodega-pago-de-los-capellanes.jpg" && img.complete && img.naturalWidth > 0;
  });
  await shot("v102-pago-lista.png");

  await browser.close();
  console.log("v102-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

/* v107: Mesa › Catálogo y la cava de Jesús, solo con los tres ejemplos. */
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

async function shot(page, name) {
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, type: "png" });
  const size = pngSize(file);
  assert.deepStrictEqual(size, { width: 1170, height: 2532 });
}

async function boot(page, url) {
  const errors = [];
  page.on("pageerror", err => errors.push(String(err)));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" }).catch(() => {});
  await page.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && getComputedStyle(splash).display === "none";
  }, null, { timeout: 8000 });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  return errors;
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
  const jesus = await context.newPage();
  const jose = await context.newPage();
  const jesusErrors = await boot(jesus, "http://127.0.0.1:8807/jesus/");
  const joseErrors = await boot(jose, "http://127.0.0.1:8807/");

  const seeded = await jesus.evaluate(() => state.bottles.map(b => b.wineId).slice().sort());
  assert.deepStrictEqual(seeded, ["margaux-2016", "riscal-reserva-2019", "vs-unico-2009"]);

  await jesus.locator(".tab[data-go='pairings']").click();
  await jesus.waitForFunction(() => document.querySelector("#pairings.screen.active"));
  await jesus.locator("#pair-seg button", { hasText: "Catálogo" }).click();
  await jesus.waitForFunction(() => {
    const body = document.getElementById("pair-body");
    return body && body.innerText.includes("Château Margaux") && body.innerText.includes("Único");
  });
  const catalog = await jesus.locator("#pair-body").innerText();
  assert.ok(catalog.includes("Château Margaux"));
  assert.ok(catalog.includes("2016"));
  assert.ok(catalog.includes("Único"));
  assert.ok(catalog.includes("2009"));
  assert.ok(catalog.includes("Riscal") || catalog.includes("Reserva"));
  assert.ok(catalog.includes("2019"));
  assert.ok(!catalog.includes("Pingus"));
  assert.ok(!catalog.includes("Tondonia"));
  assert.ok(!catalog.includes("2014"));
  assert.ok(!catalog.includes("botella-tinto.jpg"));
  const thumbs = await jesus.evaluate(() => [...document.querySelectorAll("#pair-body img")].map(img => ({
    alt: img.alt,
    src: img.getAttribute("src") || "",
    hidden: img.style.display === "none"
  })));
  const unico = thumbs.find(img => /Único/.test(img.alt));
  assert.ok(!unico, "Único 2009 no tiene foto de etiqueta en el catálogo");
  await shot(jesus, "v107-jesus-catalogo.png");

  await jesus.locator(".tab[data-go='cellar']").click();
  await jesus.waitForFunction(() => document.querySelector("#cellar.screen.active"));
  const cava = await jesus.locator("#cellar-list").innerText();
  assert.ok(cava.includes("Château Margaux") || cava.includes("Margaux"));
  assert.ok(cava.includes("Único"));
  assert.ok(cava.includes("Riscal"));
  assert.ok(!cava.includes("Pingus"));
  assert.ok(!cava.includes("Tondonia"));
  await shot(jesus, "v107-jesus-cava.png");

  const removed = await jesus.evaluate(() => {
    removeWineLots("riscal-reserva-2019");
    confirmExit();
    return state.bottles.map(b => b.wineId).slice().sort();
  });
  assert.deepStrictEqual(removed, ["margaux-2016", "vs-unico-2009"]);
  await jesus.reload({ waitUntil: "domcontentloaded" });
  await jesus.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
  const afterReload = await jesus.evaluate(() => state.bottles.map(b => b.wineId).slice().sort());
  assert.deepStrictEqual(afterReload, ["margaux-2016", "vs-unico-2009"]);

  const joseCatalog = await jose.evaluate(() => {
    show("pairings");
    setPairMode("vinos", document.querySelector("#pair-seg button"));
    renderPairings();
    return {
      edition: window.CASA_EDITION || "",
      text: document.getElementById("pair-body").innerText,
      bottles: state.bottles.map(b => b.wineId),
      store: STORE
    };
  });
  assert.strictEqual(joseCatalog.edition, "");
  assert.strictEqual(joseCatalog.store, "vinoteca.pro.max.v3");
  assert.ok(joseCatalog.text.includes("Pingus"));
  assert.ok(joseCatalog.text.includes("Tondonia"));
  assert.ok(joseCatalog.bottles.includes("tondonia-reserva-2011"));
  assert.ok(joseCatalog.bottles.includes("vs-unico-2009"));

  const kept = await context.newPage();
  await kept.addInitScript(() => {
    localStorage.setItem("jesus.vinoteca.pro.max.v3", JSON.stringify({
      vinotecas: [{ id: "keep", name: "La de siempre", country: "ES" }],
      bottles: [{ uid: "suya", wineId: "prueba-suya", qty: 2, cellarId: "keep", bin: "A-01", bought: "", note: "la mía" }],
      customWines: [{ id: "prueba-suya", name: "La mía", producer: "Bodega de Jesús", vintage: 2020, type: "tinto" }]
    }));
  });
  await boot(kept, "http://127.0.0.1:8807/jesus/");
  const keptState = await kept.evaluate(() => ({
    caves: state.vinotecas.map(v => v.id + ":" + v.name),
    bottles: state.bottles.map(b => b.wineId + ":" + b.note)
  }));
  assert.deepStrictEqual(keptState.caves, ["keep:La de siempre"]);
  assert.deepStrictEqual(keptState.bottles, ["prueba-suya:la mía"]);

  assert.deepStrictEqual(jesusErrors, []);
  assert.deepStrictEqual(joseErrors, []);
  await browser.close();
  console.log("v107-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

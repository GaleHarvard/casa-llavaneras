/* Ficha corregida de Pêra-Manca Branco: cabecera, historia y mapa. */
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
  return file;
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
  await page.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && getComputedStyle(splash).display === "none";
  }, null, { timeout: 8000 });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });

  const report = await page.evaluate(() => {
    const id = "adega-terras-mancas-terras-mancas-2025";
    state.customWines = state.customWines || [];
    state.customWines.push({
      id: id,
      name: "Terras Mancas",
      producer: "Adega Terras Mancas",
      vintage: 2025,
      region: "Galicia",
      appellation: "Galicia",
      country: "España",
      type: "tinto",
      style: "escaneo",
      grapes: ["Mencía"],
      tasting: "Vista: Rojo cereza. Nariz: fruta roja.",
      labelThumb: "",
      ratings: { parker: { score: 91, scale: 100, note: "Vista: Rojo cereza" } },
      dossier: {
        history: "Viticultura artesanal en Galicia.",
        vinification: "Maceración larga en Galicia.",
        elevage: "Barrica usada"
      },
      provenance: {
        intake: "usuario",
        intakeStatus: "CONFIRMED",
        wineryText: "Viticultura artesanal en Galicia",
        zoneText: "Clima atlántico de Galicia",
        sources: []
      }
    });
    state.bottles.push({ uid: "b-pera", wineId: id, qty: 1, cellarId: "v1", bin: "C-04", price: 80, note: "regalo" });
    const before = state.bottles.length;
    const changed = migratePeraManca();
    const wine = state.customWines.find(item => item.id === id);
    openWine(id);
    return {
      changed: changed,
      name: wine.name,
      producer: wine.producer,
      vintage: wine.vintage,
      region: wine.region,
      grapes: wine.grapes,
      tasting: wine.tasting,
      history: wine.dossier.history,
      asset: wine.wineryAsset,
      map: wine.zoneAsset,
      bottles: state.bottles.length,
      before: before,
      qty: state.bottles.find(item => item.wineId === id).qty,
      header: document.querySelector(".wine-producer").textContent,
      cuvee: document.querySelector(".wine-cuvee").textContent,
      hero: document.querySelector(".hero-art img") ? document.querySelector(".hero-art img").getAttribute("src") : "",
      page: document.getElementById("wine-body").innerText
    };
  });

  assert.strictEqual(report.changed, true);
  assert.strictEqual(report.name, "Pêra-Manca Branco");
  assert.strictEqual(report.producer, "Fundação Eugénio de Almeida");
  assert.strictEqual(report.vintage, 0);
  assert.strictEqual(report.region, "Alentejo");
  assert.deepStrictEqual(report.grapes, ["Antão Vaz", "Arinto"]);
  assert.strictEqual(report.tasting, "");
  assert.ok(report.history.includes("Évora"));
  assert.ok(!/galicia/i.test(report.history));
  assert.strictEqual(report.asset, "bodega-cartuxa.jpg");
  assert.strictEqual(report.map, "mapa-alentejo.jpg");
  assert.strictEqual(report.bottles, report.before);
  assert.strictEqual(report.qty, 1);
  assert.ok(report.header.includes("Fundação Eugénio de Almeida"));
  assert.ok(report.cuvee.includes("Pêra-Manca Branco"));
  assert.ok(!report.cuvee.includes("2025"));
  assert.ok(report.hero.includes("bodega-cartuxa.jpg"));
  assert.ok(!/Terras Mancas|Galicia|Rojo cereza|botella-blanco/i.test(report.page));
  assert.strictEqual(errors.length, 0, errors.join("\n"));

  await shot(page, "v105-pera-manca-cabecera.png");

  await page.evaluate(() => openWineSub("historia"));
  await page.waitForFunction(() => {
    const screen = document.getElementById("wine-sub");
    return screen && screen.classList.contains("active") && /Évora/.test(document.getElementById("wine-sub-body").innerText);
  });
  const historyText = await page.evaluate(() => document.getElementById("wine-sub-body").innerText);
  assert.ok(historyText.includes("Antão Vaz"));
  assert.ok(!/Galicia|Rojo cereza|Terras Mancas/i.test(historyText));
  await shot(page, "v105-pera-manca-historia.png");

  await page.evaluate(() => openWineSub("mapa"));
  await page.waitForFunction(() => /mapa-alentejo\.jpg/.test(document.getElementById("wine-sub-body").innerHTML));
  const mapText = await page.evaluate(() => document.getElementById("wine-sub-body").innerText);
  assert.ok(/Alentejo|Évora/.test(mapText));
  assert.ok(!/Galicia|Terras Mancas/i.test(mapText));
  await shot(page, "v105-pera-manca-mapa.png");

  await browser.close();
  console.log("v105 pera-manca shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

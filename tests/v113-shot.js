/* Ficha de Dominio del Challao con la web del catálogo, tras migrar una web de evento. */
const assert = require("assert");
const fs = require("fs");
const playwright = require("/tmp/pw/node_modules/playwright");

const webShot = "/opt/cursor/artifacts/v113-challao-web.png";
const scoreShot = "/opt/cursor/artifacts/v113-calificaciones.png";
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
  await page.evaluate(() => {
    const wine = {
      id: "dominio-del-challao-2021",
      name: "Challao",
      producer: "Dominio del Challao",
      vintage: 2021,
      type: "tinto",
      appellation: "DOCa Rioja",
      region: "Rioja",
      country: "España",
      color: "#4a1020",
      ratings: {},
      tasting: "",
      geo: {
        web: "https://feria-vinos.example/dominio-del-challao",
        zone: "Labastida",
        lat: 42.59,
        lng: -2.79
      },
      provenance: { web: "estimación Gemini", producer: "usuario" }
    };
    state.customWines = state.customWines || [];
    state.customWines.push(wine);
    state.bottles = state.bottles || [];
    state.bottles.push({
      uid: "b-challao-v113",
      wineId: wine.id,
      qty: 2,
      cellarId: (state.vinotecas[0] && state.vinotecas[0].id) || "v1",
      bin: "A-07",
      bought: "2024-11-02",
      price: 28,
      note: ""
    });
    save();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" }).catch(() => {});
  await page.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && getComputedStyle(splash).display === "none";
  }, null, { timeout: 8000 });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  const info = await page.evaluate(() => {
    const wine = state.customWines.find(item => item && item.id === "dominio-del-challao-2021");
    openWine(wine.id);
    const web = document.getElementById("wine-web");
    return {
      version: APP_VERSION,
      stored: wine && wine.geo && wine.geo.web,
      source: wine && wine.provenance && wine.provenance.web,
      shown: web ? web.textContent : "",
      qty: state.bottles.filter(bottle => bottle.wineId === wine.id).reduce((n, bottle) => n + bottle.qty, 0)
    };
  });
  assert.strictEqual(info.version, "v113");
  assert.strictEqual(info.stored, "https://www.dominiodelchallao.com/");
  assert.strictEqual(info.source, "catálogo");
  assert.ok(info.shown.indexOf("dominiodelchallao.com") >= 0, info.shown);
  assert.ok(info.shown.indexOf("feria-vinos.example") < 0);
  assert.strictEqual(info.qty, 2);
  const sheet = await page.locator("#wine-body").innerText();
  assert.ok(sheet.includes("Dominio del Challao"));
  assert.ok(sheet.includes("dominiodelchallao.com"));
  assert.ok(!sheet.includes("feria-vinos.example"));
  await page.screenshot({ path: webShot, type: "png" });
  assert.deepStrictEqual(pngSize(webShot), { width: 1170, height: 2532 });

  await page.evaluate(() => { openRatingsList(); });
  await page.waitForFunction(() => {
    const btn = document.getElementById("score-search");
    return btn && btn.textContent.indexOf("Buscar puntuaciones") >= 0;
  });
  const scores = await page.locator("#wine-sub-body").innerText();
  assert.ok(scores.includes("Calificaciones"), scores);
  assert.ok(scores.includes("Sin puntuaciones publicadas"), scores);
  assert.ok(scores.includes("Buscar puntuaciones"), scores);
  assert.ok(/challao/i.test(scores), scores);
  await page.screenshot({ path: scoreShot, type: "png" });
  assert.deepStrictEqual(pngSize(scoreShot), { width: 1170, height: 2532 });
  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log("v113-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

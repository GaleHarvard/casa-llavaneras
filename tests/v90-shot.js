/* Captura de Calificaciones a 1170×2532, con el formulario cerrado y la bodega visible. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const playwright = require("/tmp/pw/node_modules/playwright");
const out = "/opt/cursor/artifacts/v90-calificaciones-hd.png";

(async () => {
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });
  const page = await context.newPage();
  page.on("dialog", dialog => dialog.accept());
  const leaked = [];
  await page.route("**/*", route => {
    const url = route.request().url();
    if (/generativelanguage\.googleapis\.com|openfoodfacts/.test(url)) {
      leaked.push(url);
      return route.abort("failed");
    }
    return route.continue();
  });
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide");
  });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  const info = await page.evaluate(() => {
    const wine = {
      id: "faustino-crianza-2020",
      name: "Crianza",
      producer: "Bodegas Faustino",
      vintage: 2020,
      type: "tinto",
      style: "crianza",
      appellation: "DOCa Rioja",
      region: "Rioja",
      country: "España",
      ratings: {},
      provenance: { category: "Crianza" }
    };
    state.customWines = state.customWines || [];
    state.customWines.push(wine);
    state.bottles.push({ uid: "b-faustino", wineId: wine.id, qty: 2, cellarId: "v1", bin: "A-04", bought: "2024-03-12", price: 18, note: "" });
    openWine(wine.id);
    const sheet = {
      h1: document.querySelector("#wine-body h1.wine-producer").textContent,
      cuvee: document.querySelector("#wine-body .wine-cuvee").textContent
    };
    openRatingsList();
    const form = document.getElementById("score-form");
    const add = Array.from(document.querySelectorAll("#wine-sub-body button")).find(btn => btn.textContent.indexOf("Añadir") >= 0);
    const search = document.getElementById("score-search");
    const h1 = document.querySelector("#wine-sub-body h1");
    const eye = document.querySelector("#wine-sub-body .eyebrow");
    const text = document.getElementById("wine-sub-body").innerText;
    const buscar = (text.match(/Buscar puntuaciones/g) || []).length;
    return {
      version: APP_VERSION,
      sheet: sheet,
      form: !!form,
      add: add ? add.textContent : "",
      search: search ? search.textContent : "",
      h1: h1 ? h1.textContent : "",
      eye: eye ? eye.textContent : "",
      outline: h1 ? getComputedStyle(h1).outlineStyle : "",
      text: text,
      buscar: buscar,
      searchTop: search ? search.getBoundingClientRect().top : 0,
      tabTop: document.querySelector(".tabbar") ? document.querySelector(".tabbar").getBoundingClientRect().top : 0
    };
  });
  assert.strictEqual(info.version, "v96");
  assert.strictEqual(info.sheet.h1, "Bodegas Faustino");
  assert.strictEqual(info.sheet.cuvee, "Crianza 2020");
  assert.strictEqual(info.form, false);
  assert.ok(info.eye.indexOf("Bodegas Faustino") >= 0, info.eye);
  assert.ok(info.eye.indexOf("Crianza 2020") >= 0, info.eye);
  assert.strictEqual(info.h1, "Calificaciones");
  assert.strictEqual(info.outline, "none");
  assert.ok(info.text.indexOf("Sin puntuaciones publicadas") >= 0);
  assert.ok(info.text.indexOf("· Buscar") < 0, info.text);
  assert.strictEqual(info.buscar, 1);
  assert.ok(info.searchTop < info.tabTop, info.searchTop + " vs " + info.tabTop);
  assert.strictEqual(leaked.length, 0);

  await page.click("#wine-sub-body button.btn-ghost");
  const opened = await page.evaluate(() => {
    const form = document.getElementById("score-form");
    const add = Array.from(document.querySelectorAll("#wine-sub-body button")).find(btn => btn.textContent.indexOf("Añadir") >= 0);
    return {
      form: !!form,
      formTop: form ? form.getBoundingClientRect().top : 0,
      addTop: add ? add.getBoundingClientRect().top : 0
    };
  });
  assert.strictEqual(opened.form, true);
  assert.ok(opened.formTop > opened.addTop, opened.formTop + " vs " + opened.addTop);

  await page.evaluate(() => openRatingsList());
  await page.waitForFunction(() => !document.getElementById("score-form"));
  await page.screenshot({ path: out, type: "png" });
  await browser.close();
  console.log("v90-shot " + out);
  console.log(JSON.stringify({ eye: info.eye, searchTop: info.searchTop, tabTop: info.tabTop }));
})().catch(err => {
  console.error(err);
  process.exit(1);
});

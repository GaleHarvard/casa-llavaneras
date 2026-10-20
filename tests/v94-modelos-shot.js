/* Ficha preliminar tras «Seguir solo con la delantera», con 404 en el primer modelo. */
const assert = require("assert");
const fs = require("fs");
const playwright = require("/tmp/pw/node_modules/playwright");

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

(async () => {
  const hits = [];
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext({
    serviceWorkers: "block",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3
  });
  await context.addInitScript(() => {
    localStorage.setItem("vinoteca-jgc-provider", JSON.stringify({
      geminiKey: "AIzaSYFAKEKEYFORV94TEST0001",
      geminiOn: true
    }));
  });
  const page = await context.newPage();
  page.on("dialog", dialog => dialog.accept());
  await page.route("**/*", route => {
    const url = route.request().url();
    if (/generativelanguage\.googleapis\.com\/v1beta\/models(\?|$)/.test(url)) {
      hits.push("list");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          models: [
            { name: "models/gemini-3.5-flash-lite" },
            { name: "models/gemini-2.5-flash" },
            { name: "models/gemini-2.5-flash-lite" }
          ]
        })
      });
    }
    if (/:generateContent/.test(url)) {
      hits.push(url);
      if (url.indexOf("gemini-3.5-flash-lite") >= 0) {
        return route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: 404, message: "models/gemini-3.5-flash-lite is not found" } })
        });
      }
      const text = JSON.stringify({
        name: "Finca Garbet",
        vintage: "2018",
        region: "Empordà",
        winery: "Perelada",
        grapes: "Garnacha",
        abv: "14,5",
        crianza: "",
        serveTemp: "",
        tasting: "",
        pairing: ""
      });
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          candidates: [{ finishReason: "STOP", content: { parts: [{ text: text }] } }]
        })
      });
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
  await page.evaluate(async () => {
    startScan();
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 180;
    const pen = canvas.getContext("2d");
    pen.fillStyle = "#6e1c2a";
    pen.fillRect(0, 0, 120, 180);
    pen.fillStyle = "#f4e2b0";
    pen.font = "22px serif";
    pen.fillText("ETQ", 28, 96);
    await altaAcceptPhoto(canvas.toDataURL("image/jpeg", 0.9));
  });
  await page.click("#alta-skip-back");
  await page.waitForSelector("#alta-preview", { timeout: 15000 });
  const sheet = await page.evaluate(() => {
    const body = document.getElementById("alta-preview");
    const zone = body.querySelector('img[src="mapa-emporda.jpg"]');
    const house = body.querySelector('img[src="bodega-perelada.jpg"]');
    return {
      version: APP_VERSION,
      text: body.textContent,
      name: document.getElementById("alta-f-name").value,
      winery: document.getElementById("alta-f-winery").value,
      vintage: document.getElementById("alta-f-vintage").value,
      region: document.getElementById("alta-f-region").value,
      confirm: document.getElementById("alta-confirm").disabled,
      zone: !!zone,
      house: !!house,
      zoneTop: zone ? zone.getBoundingClientRect().top : -1,
      binBottom: document.getElementById("alta-bin").getBoundingClientRect().bottom,
      vh: window.innerHeight,
      step: document.querySelector("#alta-preview h1").textContent
    };
  });
  assert.strictEqual(sheet.version, "v94");
  assert.strictEqual(sheet.step, "Ficha preliminar");
  assert.strictEqual(sheet.name, "Finca Garbet");
  assert.strictEqual(sheet.winery, "Perelada");
  assert.strictEqual(sheet.vintage, "2018");
  assert.strictEqual(sheet.region, "Empordà");
  assert.strictEqual(sheet.confirm, true);
  assert.strictEqual(sheet.zone, true);
  assert.strictEqual(sheet.house, true);
  assert.ok(sheet.zoneTop >= 0 && sheet.zoneTop < sheet.vh);
  assert.ok(sheet.binBottom <= sheet.vh);
  assert.ok(!/HTTP|404/.test(sheet.text));
  assert.strictEqual(hits.filter(item => item === "list").length, 1);
  assert.ok(hits.some(item => String(item).indexOf("gemini-3.5-flash-lite") >= 0));
  assert.ok(hits.some(item => String(item).indexOf("gemini-2.5-flash:") >= 0));
  const shot = "/opt/cursor/artifacts/v94-alta-preliminar.png";
  await page.screenshot({ path: shot, type: "png" });
  await browser.close();
  assert.deepStrictEqual(pngSize(shot), { width: 1170, height: 2532 });
  console.log("v94 captura ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

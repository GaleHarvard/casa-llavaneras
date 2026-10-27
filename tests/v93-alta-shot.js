/* Capturas del alta v93, 1170×2532. */
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
    if (/generativelanguage\.googleapis\.com|openfoodfacts/.test(url)) return route.abort("failed");
    return route.continue();
  });
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide");
  });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });

  const capture = await page.evaluate(() => {
    startScan();
    const cam = document.getElementById("alta-cam");
    const lib = document.getElementById("alta-lib");
    const fileCam = document.getElementById("scan-file-cam");
    const fileLib = document.getElementById("scan-file-lib");
    const box = id => {
      const el = document.getElementById(id);
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return { text: el.textContent, display: style.display, top: rect.top, bottom: rect.bottom, height: rect.height };
    };
    const tools = document.querySelector("#scan .scan-tools");
    return {
      version: APP_VERSION,
      cam: box("alta-cam"),
      lib: box("alta-lib"),
      capture: fileCam.getAttribute("capture"),
      libCapture: fileLib.hasAttribute("capture"),
      accept: fileLib.getAttribute("accept"),
      scanSlots: document.querySelector(".app").classList.contains("scan-slots"),
      altaFlow: document.querySelector(".app").classList.contains("alta-flow"),
      tools: getComputedStyle(tools).display,
      vh: window.innerHeight,
      step: document.querySelector("#alta-capture h2").textContent
    };
  });
  assert.strictEqual(capture.version, "v107");
  assert.strictEqual(capture.cam.text, "Cámara");
  assert.strictEqual(capture.lib.text, "Fototeca");
  assert.strictEqual(capture.capture, "environment");
  assert.strictEqual(capture.libCapture, false);
  assert.strictEqual(capture.accept, "image/*");
  assert.strictEqual(capture.scanSlots, false);
  assert.strictEqual(capture.altaFlow, true);
  assert.strictEqual(capture.tools, "none");
  assert.ok(capture.cam.top >= 0 && capture.cam.bottom <= capture.vh, JSON.stringify(capture.cam));
  assert.ok(capture.lib.top >= 0 && capture.lib.bottom <= capture.vh, JSON.stringify(capture.lib));
  assert.ok(capture.cam.height >= 48 && capture.lib.height >= 48);
  assert.strictEqual(capture.step, "Etiqueta delantera");
  const captura = "/opt/cursor/artifacts/v93-alta-captura.png";
  await page.screenshot({ path: captura, type: "png" });

  const backStep = await page.evaluate(() => {
    const paint = color => {
      const c = document.createElement("canvas");
      c.width = 90;
      c.height = 140;
      const g = c.getContext("2d");
      g.fillStyle = color;
      g.fillRect(0, 0, 90, 140);
      g.fillStyle = "#f4e2b0";
      g.font = "16px serif";
      g.fillText("ETQ", 18, 74);
      return c.toDataURL("image/jpeg", 0.85);
    };
    altaFlow.frontLabelImage = paint("#6e1c2a");
    altaFlow.ask = "back";
    altaFlow.step = "capture";
    renderAltaCapture();
    const skip = document.getElementById("alta-skip-back");
    const cam = document.getElementById("alta-cam").getBoundingClientRect();
    const lib = document.getElementById("alta-lib").getBoundingClientRect();
    return {
      step: document.querySelector("#alta-capture h2").textContent,
      skip: skip ? skip.textContent : "",
      cam: cam.bottom <= window.innerHeight && cam.height >= 48,
      lib: lib.bottom <= window.innerHeight && lib.height >= 48,
      libCapture: document.getElementById("scan-file-lib").hasAttribute("capture"),
      camCapture: document.getElementById("scan-file-cam").getAttribute("capture")
    };
  });
  assert.strictEqual(backStep.step, "Contraetiqueta");
  assert.strictEqual(backStep.skip, "Seguir solo con la delantera");
  assert.strictEqual(backStep.cam, true);
  assert.strictEqual(backStep.lib, true);
  assert.strictEqual(backStep.libCapture, false);
  assert.strictEqual(backStep.camCapture, "environment");

  const preview = await page.evaluate(() => {
    const front = altaFlow.frontLabelImage;
    const back = (() => {
      const c = document.createElement("canvas");
      c.width = 90;
      c.height = 140;
      const g = c.getContext("2d");
      g.fillStyle = "#1c3d6e";
      g.fillRect(0, 0, 90, 140);
      return c.toDataURL("image/jpeg", 0.85);
    })();
    altaFlow = blankAltaFlow();
    altaFlow.frontLabelImage = front;
    altaFlow.backLabelImage = back;
    altaFlow.sheet = {
      name: "Finca Garbet", vintage: "2018", region: "Empordà", winery: "Grup Peralada",
      grapes: "Garnacha", abv: "14,5", crianza: "", serveTemp: "", tasting: "", pairing: ""
    };
    altaFlow.assets = matchLocalAssets(altaFlow.sheet.region, altaFlow.sheet.winery);
    altaFlow.step = "preview";
    altaFlow.status = "DRAFT";
    renderAltaPreview();
    const confirm = document.getElementById("alta-confirm");
    const zone = document.querySelector('#alta-preview .alta-asset img[src="mapa-emporda.jpg"]');
    const house = document.querySelector('#alta-preview .alta-asset img[src="bodega-perelada.jpg"]');
    const cellar = document.getElementById("alta-cellar");
    const bin = document.getElementById("alta-bin");
    const zoneRect = zone.getBoundingClientRect();
    const binRect = bin.getBoundingClientRect();
    return {
      draft: document.querySelector("#alta-preview .tiny").textContent,
      title: document.querySelector("#alta-preview h1").textContent,
      confirmDisabled: confirm.disabled,
      anotherDisabled: document.getElementById("alta-another").disabled,
      zone: !!zone,
      house: !!house,
      zoneClick: zone.parentElement.getAttribute("onclick"),
      houseClick: house.parentElement.getAttribute("onclick"),
      cellarTop: cellar.getBoundingClientRect().top,
      binBottom: binRect.bottom,
      zoneTop: zoneRect.top,
      vh: window.innerHeight,
      sinDato: document.getElementById("alta-preview").textContent.includes("Sin dato"),
      options: cellar.options.length
    };
  });
  assert.strictEqual(preview.draft, "Borrador");
  assert.strictEqual(preview.title, "Ficha preliminar");
  assert.strictEqual(preview.confirmDisabled, true);
  assert.strictEqual(preview.anotherDisabled, true);
  assert.strictEqual(preview.zone, true);
  assert.strictEqual(preview.house, true);
  assert.ok(preview.zoneClick.includes("openZona"));
  assert.ok(preview.houseClick.includes("openBodega('perelada')"));
  assert.strictEqual(preview.sinDato, false);
  assert.ok(preview.options >= 2);
  assert.ok(preview.zoneTop >= 0 && preview.zoneTop < preview.vh);
  assert.ok(preview.binBottom <= preview.vh, JSON.stringify(preview));

  const placed = await page.evaluate(() => {
    document.getElementById("alta-cellar").value = "v1";
    altaCellarPicked();
    const bin = document.getElementById("alta-bin");
    const code = [...bin.options].map(opt => opt.value).find(Boolean);
    bin.value = code;
    altaLocationChanged();
    const confirm = document.getElementById("alta-confirm");
    const binRect = document.getElementById("alta-bin").getBoundingClientRect();
    const zone = document.querySelector('#alta-preview img[src="mapa-emporda.jpg"]');
    return {
      code,
      disabled: confirm.disabled,
      binBottom: binRect.bottom,
      vh: window.innerHeight,
      zone: !!zone,
      status: altaFlow.status
    };
  });
  assert.ok(placed.code);
  assert.strictEqual(placed.disabled, false);
  assert.strictEqual(placed.status, "DRAFT");
  assert.strictEqual(placed.zone, true);
  assert.ok(placed.binBottom <= placed.vh);
  const preliminar = "/opt/cursor/artifacts/v93-alta-preliminar.png";
  await page.screenshot({ path: preliminar, type: "png" });

  const confirmed = await page.evaluate(async () => {
    const stored = await confirmAlta(false);
    const hero = document.querySelector("#wine-body .label-thumb-hero");
    const illus = document.querySelector("#wine-body .hero-art img");
    const back = document.querySelector("#back-label-photo");
    const covers = document.querySelectorAll("#wine-body .label-thumb-hero").length;
    return {
      id: stored && stored.id,
      status: stored && stored.provenance && stored.provenance.intakeStatus,
      hero: hero ? hero.getAttribute("src").slice(0, 16) : "",
      confirmed: document.getElementById("alta-confirmed") ? document.getElementById("alta-confirmed").textContent : "",
      zone: /Empordà/.test(document.getElementById("wine-body").innerText),
      house: illus ? illus.getAttribute("src") : "",
      backHero: covers === 1,
      backSection: !!(back && back.hidden && back.getAttribute("src")),
      sinDato: document.getElementById("wine-body").textContent.includes("Sin dato"),
      zoneTop: illus ? illus.getBoundingClientRect().top : -1,
      vh: window.innerHeight
    };
  });
  assert.ok(confirmed.id);
  assert.strictEqual(confirmed.status, "CONFIRMED");
  assert.ok(confirmed.hero.startsWith("data:image/jpeg"));
  assert.strictEqual(confirmed.confirmed, "Alta confirmada");
  assert.strictEqual(confirmed.zone, true);
  assert.strictEqual(confirmed.house, "bodega-perelada.jpg");
  assert.strictEqual(confirmed.backSection, true);
  assert.strictEqual(confirmed.sinDato, false);
  assert.ok(confirmed.zoneTop >= 0 && confirmed.zoneTop < confirmed.vh, JSON.stringify(confirmed));
  const confirmada = "/opt/cursor/artifacts/v93-alta-confirmada.png";
  await page.screenshot({ path: confirmada, type: "png" });

  await browser.close();
  [captura, preliminar, confirmada].forEach(file => {
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  });
  console.log("v93 capturas ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

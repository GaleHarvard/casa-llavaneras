/* Cabecera de Murrieta Rosado sin botella ajena, y una ficha con foto real. */
const assert = require("assert");
const fs = require("fs");
const { execFileSync } = require("child_process");
const playwright = require("/tmp/pw/node_modules/playwright");

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

execFileSync("python3", ["-c", `
from PIL import Image, ImageDraw, ImageFont
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
im = Image.new("RGB", (420, 640), (236, 214, 170))
d = ImageDraw.Draw(im)
d.rectangle([0, 0, 420, 120], fill=(120, 24, 36))
d.text((28, 260), "FOTO REAL", fill=(40, 24, 18), font=font)
d.text((36, 330), "ETIQUETA", fill=(40, 24, 18), font=font)
im.save("/tmp/v100-etiqueta.jpg", "JPEG", quality=85)
`]);
const label = "data:image/jpeg;base64," + fs.readFileSync("/tmp/v100-etiqueta.jpg").toString("base64");

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

  const crossed = await page.evaluate(() => {
    const bad = [];
    (WINE_CATALOG || []).forEach(wine => {
      const html = wineHeroHtml(wine);
      if (/botella-(tinto|blanco|espumoso)/.test(html)) bad.push(wine.id + " botella");
      const own = typeof frontCoverSrc === "function" ? frontCoverSrc(wine) : "";
      if (!own && html.includes("foil-wrap")) bad.push(wine.id + " foil");
      if (!own && !html.includes("hero-art-full") && html.includes("hero-art")) bad.push(wine.id + " ancho");
    });
    return bad;
  });
  assert.deepStrictEqual(crossed, []);

  await page.evaluate(() => openWine("raidue-rose-2024"));
  await page.waitForFunction(() => {
    const art = document.querySelector("#wine-body .hero-art");
    const img = art && art.querySelector("img");
    return img && img.getAttribute("src") === "bodega-marques-de-murrieta.jpg" && img.complete && img.naturalWidth > 0;
  });
  const murrieta = await page.evaluate(() => {
    const row = document.querySelector("#wine-body .hero-row");
    const art = document.querySelector("#wine-body .hero-art");
    const img = art.querySelector("img");
    const rowBox = row.getBoundingClientRect();
    const artBox = art.getBoundingClientRect();
    return {
      version: APP_VERSION,
      src: img.getAttribute("src"),
      full: art.classList.contains("hero-art-full"),
      foil: !!document.querySelector("#wine-body .foil-wrap"),
      bottle: !!document.querySelector("#wine-body img[src*='botella-']"),
      title: document.querySelector("#wine-body h1").textContent,
      sub: document.querySelector("#wine-body .wine-cuvee").textContent,
      ratio: artBox.width / rowBox.width
    };
  });
  assert.strictEqual(murrieta.version, "v111");
  assert.strictEqual(murrieta.src, "bodega-marques-de-murrieta.jpg");
  assert.strictEqual(murrieta.full, true);
  assert.strictEqual(murrieta.foil, false);
  assert.strictEqual(murrieta.bottle, false);
  assert.ok(murrieta.title.indexOf("Murrieta") >= 0, murrieta.title);
  assert.ok(murrieta.sub.indexOf("2024") >= 0, murrieta.sub);
  assert.ok(murrieta.ratio > 0.92, String(murrieta.ratio));

  const shot = async (name) => {
    const file = "/opt/cursor/artifacts/" + name;
    await page.screenshot({ path: file, type: "png" });
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  };
  await shot("v100-murrieta-rosado.png");

  await page.evaluate(photo => {
    state.customWines = state.customWines || [];
    state.customWines.push({
      id: "foto-real-v100",
      name: "Luis Cañas",
      producer: "Bodegas Luis Cañas",
      vintage: 2024,
      region: "Rioja",
      appellation: "Rioja",
      country: "España",
      type: "tinto",
      grapes: ["Tempranillo"],
      ratings: {},
      provenance: { intake: "usuario", intakeStatus: "CONFIRMED" },
      labelThumb: photo,
      frontLabelImage: photo
    });
    if (typeof normalizeWine === "function") normalizeWine(state.customWines[state.customWines.length - 1]);
    openWine("foto-real-v100");
  }, label);
  await page.waitForFunction(() => {
    const thumb = document.querySelector("#wine-body .label-thumb-hero");
    const art = document.querySelector("#wine-body .hero-art img");
    return thumb && thumb.getAttribute("src").indexOf("data:image") === 0 && thumb.complete
      && art && art.getAttribute("src") === "bodega-luis-canas.jpg" && art.complete;
  });
  const real = await page.evaluate(() => {
    const row = document.querySelector("#wine-body .hero-row").getBoundingClientRect();
    const art = document.querySelector("#wine-body .hero-art").getBoundingClientRect();
    return {
      bottle: !!document.querySelector("#wine-body img[src*='botella-']"),
      full: document.querySelector("#wine-body .hero-art").classList.contains("hero-art-full"),
      ratio: art.width / row.width
    };
  });
  assert.strictEqual(real.bottle, false);
  assert.strictEqual(real.full, false);
  assert.ok(real.ratio < 0.8, String(real.ratio));
  await shot("v100-foto-real.png");

  await browser.close();
  console.log("v100-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

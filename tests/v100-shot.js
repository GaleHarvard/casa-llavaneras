/* Ficha corregida: Luis Cañas 2024, blanco, sin Tinto Joven. */
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
im = Image.new("RGB", (420, 640), (244, 236, 214))
d = ImageDraw.Draw(im)
d.rectangle([0, 0, 420, 90], fill=(186, 150, 70))
d.text((28, 250), "LUIS CANAS", fill=(40, 24, 18), font=font)
d.text((36, 320), "2024", fill=(40, 24, 18), font=font)
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

  const fixed = await page.evaluate(photo => {
    localStorage.setItem("vinoteca-jgc-provider", JSON.stringify({ key: "sigue-aqui" }));
    const before = JSON.stringify(state.customWines || []);
    state.customWines = state.customWines || [];
    state.bottles = state.bottles || [];
    state.customWines.push({
      id: "luis-canas-tinto-joven-2024",
      name: "Luis Cañas Tinto Joven 2024",
      producer: "Bodegas Luis Cañas",
      vintage: 2024,
      region: "Rioja",
      appellation: "Rioja Alavesa",
      country: "España",
      type: "tinto",
      style: "escaneo",
      grapes: ["Viura", "Malvasía", "Tempranillo Blanco"],
      color: "#4a1020",
      ratings: { parker: { score: 90, scale: 100, note: "guardar" } },
      provenance: { intake: "usuario", intakeStatus: "CONFIRMED", wineryId: "luis-canas", crianza: "Tinto Joven" },
      geo: { lat: 42.54, lng: -2.66, web: "https://luiscanas.com" },
      labelThumb: photo,
      frontLabelImage: photo,
      wineryAsset: "bodega-luis-canas.jpg"
    });
    state.bottles.push({ wineId: "luis-canas-tinto-joven-2024", qty: 3, note: "hueco B2", cellarId: "v1" });
    const rows = migrateGrapeIdentity(state);
    const wine = state.customWines.find(item => item.id === "luis-canas-tinto-joven-2024");
    const provider = localStorage.getItem("vinoteca-jgc-provider");
    return {
      version: APP_VERSION,
      rows: rows,
      name: wine.name,
      type: wine.type,
      color: wine.color,
      grapes: wine.grapes,
      thumb: wine.labelThumb === photo,
      rating: wine.ratings.parker.score,
      web: wine.geo.web,
      qty: state.bottles.find(item => item.wineId === wine.id).qty,
      note: state.bottles.find(item => item.wineId === wine.id).note,
      provider: provider,
      others: before
    };
  }, label);

  assert.strictEqual(fixed.version, "v105");
  assert.strictEqual(fixed.name, "Luis Cañas 2024");
  assert.strictEqual(fixed.type, "blanco");
  assert.strictEqual(fixed.thumb, true);
  assert.strictEqual(fixed.rating, 90);
  assert.strictEqual(fixed.web, "https://luiscanas.com");
  assert.strictEqual(fixed.qty, 3);
  assert.strictEqual(fixed.note, "hueco B2");
  assert.ok(fixed.provider.includes("sigue-aqui"));
  assert.ok(!/Tinto Joven/.test(fixed.name));

  await page.evaluate(() => openWine("luis-canas-tinto-joven-2024"));
  await page.waitForFunction(() => {
    const sub = document.querySelector("#wine-body .wine-cuvee");
    const art = document.querySelector("#wine-body .hero-art img");
    return sub && sub.textContent.indexOf("Luis Cañas 2024") >= 0 && art && art.complete && art.naturalWidth > 0;
  });
  const sheet = await page.evaluate(() => {
    const text = document.getElementById("wine-body").innerText;
    return {
      title: document.querySelector("#wine-body h1").textContent,
      sub: document.querySelector("#wine-body .wine-cuvee").textContent,
      text: text,
      bottle: !!document.querySelector("#wine-body img[src*='botella-']"),
      art: document.querySelector("#wine-body .hero-art img").getAttribute("src")
    };
  });
  assert.ok(sheet.title.indexOf("Luis Cañas") >= 0, sheet.title);
  assert.strictEqual(sheet.sub, "Luis Cañas 2024");
  assert.ok(!sheet.text.includes("Tinto Joven"), sheet.text);
  assert.ok(!sheet.text.includes("Sin dato"), sheet.text);
  assert.strictEqual(sheet.bottle, false);
  assert.strictEqual(sheet.art, "bodega-luis-canas.jpg");

  const shot = async (name) => {
    const file = "/opt/cursor/artifacts/" + name;
    await page.screenshot({ path: file, type: "png" });
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  };
  await shot("v100-luis-canas.png");

  await page.evaluate(() => openWineSub("tecnica"));
  await page.waitForFunction(() => {
    const text = document.getElementById("wine-body").innerText;
    return text.indexOf("Blanco") >= 0 && text.indexOf("Viura") >= 0;
  });
  const tech = await page.evaluate(() => document.getElementById("wine-body").innerText);
  assert.ok(tech.includes("Blanco"), tech);
  assert.ok(tech.includes("Viura"), tech);
  assert.ok(tech.includes("Malvasía"), tech);
  assert.ok(tech.includes("Tempranillo Blanco"), tech);
  assert.ok(!tech.includes("Tinto Joven"), tech);
  assert.ok(!tech.includes("Sin dato"), tech);
  await shot("v100-luis-canas-tipo.png");

  await browser.close();
  console.log("v100-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

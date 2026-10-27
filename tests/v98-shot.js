/* Fichas v100: etiqueta derecha, botón Girar foto, Luis Cañas y Figuero. */
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
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 54)
def card(title, year, path, exif=False):
    im = Image.new("RGB", (520, 780), (248, 241, 226))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 520, 160], fill=(176, 32, 32))
    d.rectangle([0, 620, 520, 780], fill=(32, 64, 150))
    d.text((36, 300), title, fill=(40, 24, 18), font=font)
    d.text((70, 390), year, fill=(90, 50, 30), font=font)
    if exif:
        stored = im.transpose(Image.Transpose.ROTATE_90)
        ex = Image.Exif()
        ex[274] = 6
        stored.save(path, "JPEG", quality=85, exif=ex)
    else:
        im.save(path, "JPEG", quality=85)
card("LUIS CANAS", "RIOJA 2024", "/tmp/v100-orient6.jpg", True)
card("FIGUERO", "VINAS VIEJAS", "/tmp/v100-figuero-label.jpg", False)
print("labels")
`]);

const orientB64 = fs.readFileSync("/tmp/v100-orient6.jpg").toString("base64");
const figueroB64 = fs.readFileSync("/tmp/v100-figuero-label.jpg").toString("base64");

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

  const orient = await page.evaluate(async (b64) => {
    const raw = "data:image/jpeg;base64," + b64;
    const bytes = dataUrlBytes(raw);
    const straight = await uprightLabelData(raw);
    const again = await uprightLabelData(straight);
    const place = (dataUrl) => new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const px = (x, y) => ctx.getImageData(Math.max(0, x), Math.max(0, y), 1, 1).data;
        const midX = Math.floor(canvas.width / 2);
        const midY = Math.floor(canvas.height / 2);
        const red = p => p[0] > 140 && p[0] > p[2] + 40;
        const blue = p => p[2] > 80 && p[2] > p[0] + 20;
        resolve({
          w: canvas.width,
          h: canvas.height,
          top: red(px(midX, 8)),
          bottom: blue(px(midX, canvas.height - 8)),
          right: red(px(canvas.width - 8, midY))
        });
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
    const once = await place(straight);
    const twice = await place(again);
    const mode = await labelOrientMode();
    return {
      orient: readJpegOrientation(bytes),
      rawSize: readJpegSize(bytes),
      mode: mode,
      once: once,
      twice: twice,
      straight: straight
    };
  }, orientB64);

  assert.strictEqual(orient.orient, 6);
  assert.ok(orient.rawSize.width > orient.rawSize.height);
  assert.ok(orient.once && orient.once.h > orient.once.w, JSON.stringify(orient.once));
  assert.strictEqual(orient.once.top, true, JSON.stringify(orient));
  assert.strictEqual(orient.once.bottom, true, JSON.stringify(orient));
  assert.strictEqual(orient.twice.top, true);
  assert.strictEqual(orient.twice.h, orient.once.h);
  assert.strictEqual(orient.twice.w, orient.once.w);

  const figueroLabel = "data:image/jpeg;base64," + figueroB64;
  await page.evaluate(({ straight, figueroLabel }) => {
    const base = () => ({
      type: "tinto",
      style: "escaneo",
      grapes: ["Tempranillo"],
      country: "España",
      ratings: {},
      provenance: { intake: "usuario", intakeStatus: "CONFIRMED" }
    });
    state.customWines = state.customWines || [];
    state.customWines.push(Object.assign(base(), {
      id: "luis-canas-2024",
      name: "Luis Cañas",
      producer: "Bodegas Luis Cañas",
      vintage: 2024,
      region: "Rioja",
      appellation: "Rioja",
      labelThumb: straight,
      frontLabelImage: straight
    }));
    state.customWines.push(Object.assign(base(), {
      id: "figuero-vinas-viejas-2021",
      name: "Viñas Viejas",
      producer: "Bodegas y Viñedos García Figuero",
      vintage: 2021,
      region: "Ribera del Duero",
      appellation: "Ribera del Duero",
      labelThumb: figueroLabel,
      frontLabelImage: figueroLabel
    }));
    if (typeof normalizeWine === "function") state.customWines.forEach(normalizeWine);
    linkIllustratedCellar();
  }, { straight: orient.straight, figueroLabel: figueroLabel });

  await page.evaluate(() => openWine("luis-canas-2024"));
  await page.waitForFunction(() => {
    const art = document.querySelector("#wine-body .hero-art img");
    const rot = document.getElementById("label-rotate");
    return art && art.complete && art.naturalWidth > 0 && rot && rot.textContent === "Girar foto";
  });
  const luis = await page.evaluate(() => {
    const body = document.getElementById("wine-body");
    const art = body.querySelector(".hero-art img");
    const thumb = body.querySelector(".label-thumb-hero");
    return {
      version: APP_VERSION,
      art: art ? art.getAttribute("src") : "",
      title: body.querySelector("h1").textContent,
      sub: body.querySelector(".wine-cuvee").textContent,
      rotate: document.getElementById("label-rotate").textContent,
      change: body.querySelector(".label-change").textContent,
      thumb: thumb ? thumb.getAttribute("src") : "",
      linked: (wineById("luis-canas-2024").provenance || {}).wineryId
    };
  });
  assert.strictEqual(luis.version, "v106");
  assert.strictEqual(luis.art, "bodega-luis-canas.jpg");
  assert.strictEqual(luis.linked, "luis-canas");
  assert.ok(luis.title.indexOf("Luis Cañas") >= 0, luis.title);
  assert.ok(luis.sub.indexOf("2024") >= 0, luis.sub);
  assert.strictEqual(luis.rotate, "Girar foto");
  assert.strictEqual(luis.change, "Cambiar etiqueta");
  assert.strictEqual(luis.thumb.indexOf("data:image"), 0);

  const turned = await page.evaluate(async (straight) => {
    await rotateSavedLabel();
    const src = labelPhotoCache["luis-canas-2024"];
    const img = await loadImageEl(src);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const midY = Math.floor(canvas.height / 2);
    const right = ctx.getImageData(canvas.width - 40, midY, 1, 1).data;
    const wine = wineById("luis-canas-2024");
    wine.labelThumb = straight;
    wine.frontLabelImage = straight;
    delete labelPhotoCache["luis-canas-2024"];
    openWine("luis-canas-2024");
    return {
      w: canvas.width,
      h: canvas.height,
      rightRed: right[0] > 140 && right[0] > right[2] + 40,
      button: document.getElementById("label-rotate").textContent
    };
  }, orient.straight);
  assert.ok(turned.w > turned.h, JSON.stringify(turned));
  assert.strictEqual(turned.rightRed, true, JSON.stringify(turned));
  assert.strictEqual(turned.button, "Girar foto");
  await page.waitForFunction(() => {
    const art = document.querySelector("#wine-body .hero-art img");
    const rot = document.getElementById("label-rotate");
    return art && art.getAttribute("src") === "bodega-luis-canas.jpg" && art.complete && art.naturalWidth > 0 && rot && rot.textContent === "Girar foto";
  });

  const shot = async (name) => {
    const file = "/opt/cursor/artifacts/" + name;
    await page.screenshot({ path: file, type: "png" });
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  };
  await shot("v100-etiqueta-derecha.png");
  await shot("v100-girar-foto.png");
  await shot("v100-luis-canas.png");

  await page.evaluate(() => openWine("figuero-vinas-viejas-2021"));
  await page.waitForFunction(() => {
    const art = document.querySelector("#wine-body .hero-art img");
    return art && art.getAttribute("src") === "bodega-garcia-figuero.jpg" && art.complete && art.naturalWidth > 0;
  });
  const fig = await page.evaluate(() => {
    const wine = wineById("figuero-vinas-viejas-2021");
    return {
      art: document.querySelector("#wine-body .hero-art img").getAttribute("src"),
      sub: document.querySelector("#wine-body .wine-cuvee").textContent,
      linked: (wine.provenance || {}).wineryId,
      file: wine.wineryAsset
    };
  });
  assert.strictEqual(fig.art, "bodega-garcia-figuero.jpg");
  assert.strictEqual(fig.linked, "garcia-figuero");
  assert.strictEqual(fig.file, "bodega-garcia-figuero.jpg");
  assert.ok(fig.sub.indexOf("2021") >= 0, fig.sub);
  await shot("v100-figuero.png");

  await browser.close();
  console.log("v100-shot ok", orient.mode);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

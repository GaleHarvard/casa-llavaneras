/* v106: icono 1024, simulación en la pantalla de inicio del iPhone e Inicio de Jesús. */
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
  const master = path.join(__dirname, "..", "jesus", "icon-1024.png");
  const iconOut = path.join(outDir, "v106-jesus-icono.png");
  fs.copyFileSync(master, iconOut);
  assert.deepStrictEqual(pngSize(iconOut), { width: 1024, height: 1024 });

  const browser = await playwright.webkit.launch();
  const phone = {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  };
  const home = await browser.newContext(phone);
  const homePage = await home.newPage();
  await homePage.setContent(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 390px; height: 844px; overflow: hidden; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif; }
  .wall {
    width: 390px; height: 844px; position: relative;
    background:
      radial-gradient(120% 70% at 50% 108%, #3a3428 0%, rgba(58,52,40,0) 55%),
      radial-gradient(80% 50% at 80% 8%, #243044 0%, rgba(36,48,68,0) 60%),
      linear-gradient(180deg, #141820 0%, #0c0e12 42%, #16130f 100%);
  }
  .status { height: 54px; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 22px 8px; font-size: 15px; font-weight: 600; }
  .status b { font-weight: 650; letter-spacing: -0.02em; }
  .sigs { display: flex; gap: 6px; align-items: center; font-size: 12px; font-weight: 600; }
  .battery { width: 25px; height: 12px; border: 1.5px solid #fff; border-radius: 3px; position: relative; }
  .battery:after { content: ""; position: absolute; right: -4px; top: 3px; width: 2px; height: 5px; background: #fff; border-radius: 0 1px 1px 0; }
  .battery i { display: block; margin: 1px; height: 8px; width: 70%; background: #fff; border-radius: 1px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); padding: 28px 18px 0; row-gap: 22px; }
  .slot { display: flex; flex-direction: column; align-items: center; }
  .glyph { width: 60px; height: 60px; border-radius: 13.5px; background: rgba(255,255,255,.08); box-shadow: inset 0 0 0 1px rgba(255,255,255,.06); }
  .slot img { width: 60px; height: 60px; border-radius: 13.5px; display: block; box-shadow: 0 10px 18px rgba(0,0,0,.35), 0 0 0 .5px rgba(255,255,255,.12); }
  .label { width: 76px; margin-top: 5px; font-size: 11px; line-height: 1.15; text-align: center; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,.85); }
  .ghost { width: 76px; height: 13px; margin-top: 6px; }
  .dock {
    position: absolute; left: 10px; right: 10px; bottom: 16px; height: 92px;
    border-radius: 28px; display: flex; align-items: center; justify-content: space-around;
    background: rgba(255,255,255,.14); backdrop-filter: blur(16px);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.12);
  }
  .dots { position: absolute; left: 0; right: 0; bottom: 116px; display: flex; justify-content: center; gap: 7px; }
  .dots i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.35); }
  .dots i.on { background: #fff; }
</style>
</head>
<body>
  <div class="wall">
    <div class="status"><b>9:41</b><div class="sigs"><span>●●●</span><span>5G</span><span class="battery"><i></i></span></div></div>
    <div class="grid">
      <div class="slot">
        <img src="http://127.0.0.1:8807/jesus/apple-touch-icon.png" alt="Jesús Gómez">
        <div class="label">Vinoteca Jesús Gómez</div>
      </div>
      <div class="slot"><div class="glyph"></div><div class="ghost"></div></div>
      <div class="slot"><div class="glyph"></div><div class="ghost"></div></div>
      <div class="slot"><div class="glyph"></div><div class="ghost"></div></div>
    </div>
    <div class="dots"><i class="on"></i><i></i></div>
    <div class="dock"><div class="glyph"></div><div class="glyph"></div><div class="glyph"></div><div class="glyph"></div></div>
  </div>
</body>
</html>`, { waitUntil: "load" });
  await homePage.waitForFunction(() => {
    const img = document.querySelector("img");
    return img && img.complete && img.naturalWidth === 180;
  });
  await shot(homePage, "v106-iphone-home.png");
  await home.close();

  const context = await browser.newContext({ ...phone, serviceWorkers: "block" });
  const jose = await context.newPage();
  const jesus = await context.newPage();
  const errors = [];
  jesus.on("pageerror", err => errors.push(String(err)));
  async function boot(page, url) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" }).catch(() => {});
    await page.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
    await page.waitForFunction(() => {
      const splash = document.getElementById("splash");
      return splash && getComputedStyle(splash).display === "none";
    }, null, { timeout: 8000 });
    await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  }
  await boot(jose, "http://127.0.0.1:8807/");
  await boot(jesus, "http://127.0.0.1:8807/jesus/");
  const joseLogo = await jose.evaluate(() => ({
    mark: document.querySelector("#splash .mark").textContent.trim(),
    emblem: !!document.querySelector(".jesus-emblem"),
    href: document.querySelector('link[rel="apple-touch-icon"]').getAttribute("href")
  }));
  assert.strictEqual(joseLogo.mark, "J.G.C.");
  assert.strictEqual(joseLogo.emblem, false);
  assert.strictEqual(joseLogo.href, "apple-touch-icon.png");
  await jesus.waitForFunction(() => {
    const home = document.querySelector("#home .home-hero .jesus-emblem");
    return home && home.complete && home.naturalWidth === 180;
  });
  await jesus.evaluate(() => { if (typeof renderPerfil === "function") renderPerfil(); });
  await jesus.waitForFunction(() => {
    const img = document.querySelector("#perfil-body img");
    return img && img.getAttribute("src") === "apple-touch-icon.png" && img.complete && img.naturalWidth === 180;
  });
  const jesusLogo = await jesus.evaluate(() => {
    const home = document.querySelector("#home .home-hero .jesus-emblem");
    const mark = document.querySelector("#splash .jesus-mark img");
    const perfil = document.querySelector("#perfil-body img");
    return {
      title: document.querySelector("#home h1").textContent,
      alt: home ? home.alt : "",
      src: home ? home.getAttribute("src") : "",
      width: home ? home.naturalWidth : 0,
      splash: mark ? mark.getAttribute("src") : "",
      splashAlt: mark ? mark.alt : "",
      markText: document.querySelector("#splash .mark").textContent,
      perfil: perfil ? perfil.getAttribute("src") : "",
      perfilWidth: perfil ? perfil.naturalWidth : 0,
      version: APP_VERSION
    };
  });
  assert.deepStrictEqual(errors, []);
  assert.strictEqual(jesusLogo.title, "Vinoteca Jesús Gómez");
  assert.strictEqual(jesusLogo.alt, "Jesús Gómez");
  assert.strictEqual(jesusLogo.src, "apple-touch-icon.png");
  assert.strictEqual(jesusLogo.width, 180);
  assert.strictEqual(jesusLogo.splash, "apple-touch-icon.png");
  assert.strictEqual(jesusLogo.splashAlt, "Jesús Gómez");
  assert.ok(!jesusLogo.markText.includes("J.G.C."));
  assert.strictEqual(jesusLogo.perfil, "apple-touch-icon.png");
  assert.strictEqual(jesusLogo.perfilWidth, 180);
  assert.strictEqual(jesusLogo.version, "v110");
  await shot(jesus, "v106-jesus-inicio.png");
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});

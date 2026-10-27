/* Clics reales en WebKit móvil: cinco pestañas, ficha y botón atrás. */
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

async function realClick(page, selector) {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  assert.ok(box && box.width > 2 && box.height > 2, selector);
  await page.mouse.click(box.x + box.width / 2, box.y + Math.min(box.height / 2, 24));
}

async function run(browserType, label) {
  const browser = await browserType.launch();
  const context = await browser.newContext({
    serviceWorkers: "allow",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", err => errors.push(String(err)));
  page.on("dialog", dialog => dialog.dismiss());
  await page.route("**/*", route => {
    const url = route.request().url();
    if (/generativelanguage\.googleapis\.com/.test(url)) return route.abort("failed");
    return route.continue();
  });
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide") && window.__casaReady === true;
  });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && getComputedStyle(splash).display === "none";
  }, null, { timeout: 8000 });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  await page.evaluate(() => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error("sin-camara"));
    }
  });

  const probe = await page.evaluate(() => {
    const splash = document.getElementById("splash");
    const tab = document.querySelector(".tab[data-go='cellar']");
    const rect = tab.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return {
      version: window.APP_VERSION,
      splash: splash.className,
      display: getComputedStyle(splash).display,
      pointer: getComputedStyle(splash).pointerEvents,
      boot: !!document.getElementById("boot-error"),
      hit: hit ? (hit.id || hit.className || hit.tagName) : ""
    };
  });
  assert.strictEqual(probe.version, "v105");
  assert.strictEqual(probe.display, "none");
  assert.strictEqual(probe.pointer, "none");
  assert.strictEqual(probe.boot, false);
  assert.ok(!String(probe.hit).includes("splash"), JSON.stringify(probe));

  const before = await page.evaluate(async () => {
    const idb = (mode, value) => new Promise((resolve, reject) => {
      const req = indexedDB.open("casa-llavaneras-labels", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("thumbs")) req.result.createObjectStore("thumbs");
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("thumbs", mode);
        const store = tx.objectStore("thumbs");
        const done = (result) => { db.close(); resolve(result); };
        if (mode === "readwrite") {
          store.put(value, "keep-v104");
          tx.oncomplete = () => done(true);
        } else {
          const get = store.get("keep-v104");
          get.onsuccess = () => done(get.result);
        }
        tx.onerror = () => reject(tx.error);
      };
    });
    await idb("readwrite", "foto-v104");
    localStorage.setItem("vinoteca-jgc-provider", JSON.stringify({ geminiKey: "clave-no-borrar-v104", mode: "gemini" }));
    const data = JSON.parse(localStorage.getItem("vinoteca.pro.max.v3") || "{}");
    return { bottles: (data.bottles || []).length, wines: (data.customWines || []).length };
  });
  assert.ok(before.bottles > 0, "la cava de ejemplo tiene botellas");

  await shot(page, "v104-inicio.png");
  await realClick(page, "#home-featured .card");
  await page.waitForFunction(() => document.querySelector("#wine.screen.active"));
  const wine = await page.locator("#wine h1").innerText();
  assert.ok(/Vega Sicilia/i.test(wine), wine);
  await shot(page, "v104-ficha.png");
  const favBefore = await page.locator("#topbar-actions .fav").getAttribute("class");
  await realClick(page, "#topbar-actions .fav");
  await page.waitForFunction(prev => {
    const el = document.querySelector("#topbar-actions .fav");
    return el && el.className !== prev;
  }, favBefore);
  await realClick(page, "#topbar .topbar-back");
  await page.waitForFunction(() => document.querySelector("#home.screen.active"));

  const tabs = [
    ["caves", "v104-vinotecas.png"],
    ["scan", "v104-escaner.png"],
    ["cellar", "v104-botellas.png"],
    ["pairings", "v104-mesa.png"],
    ["home", "v104-inicio-vuelta.png"]
  ];
  for (const [id, file] of tabs) {
    await realClick(page, ".tab[data-go='" + id + "']");
    await page.waitForFunction(screen => document.querySelector("#" + screen + ".screen.active"), id);
    await shot(page, file);
  }

  const after = await page.evaluate(async () => {
    const label = await new Promise((resolve, reject) => {
      const req = indexedDB.open("casa-llavaneras-labels", 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("thumbs", "readonly");
        const get = tx.objectStore("thumbs").get("keep-v104");
        get.onsuccess = () => { db.close(); resolve(get.result); };
        get.onerror = () => reject(get.error);
      };
    });
    const data = JSON.parse(localStorage.getItem("vinoteca.pro.max.v3") || "{}");
    return {
      bottles: (data.bottles || []).length,
      wines: (data.customWines || []).length,
      provider: localStorage.getItem("vinoteca-jgc-provider") || "",
      label
    };
  });
  assert.strictEqual(after.bottles, before.bottles);
  assert.strictEqual(after.wines, before.wines);
  assert.ok(after.provider.includes("clave-no-borrar-v104"));
  assert.strictEqual(after.label, "foto-v104");

  assert.deepStrictEqual(errors, []);
  await browser.close();
  console.log(label + " ok", probe.hit);
}

(async () => {
  await run(playwright.webkit, "webkit");
  if (process.env.V104_CHROMIUM === "1") await run(playwright.chromium, "chromium");
  console.log("v104-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

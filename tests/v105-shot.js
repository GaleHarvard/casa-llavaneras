/* Las dos ediciones en el mismo WebKit: los vinos no se mezclan. */
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
}

async function realClick(page, selector) {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded();
  const box = await loc.boundingBox();
  assert.ok(box && box.width > 2 && box.height > 2, selector);
  await page.mouse.click(box.x + box.width / 2, box.y + Math.min(box.height / 2, 24));
}

async function boot(page, url) {
  const errors = [];
  page.on("pageerror", err => errors.push(String(err)));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" }).catch(() => {});
  await page.waitForFunction(() => window.__casaReady === true, null, { timeout: 20000 });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && getComputedStyle(splash).display === "none";
  }, null, { timeout: 8000 });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" }).catch(() => {});
  return errors;
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
  const jose = await context.newPage();
  const jesus = await context.newPage();
  jose.on("dialog", dialog => dialog.accept());
  jesus.on("dialog", dialog => dialog.accept());
  const joseErrors = await boot(jose, "http://127.0.0.1:8807/");
  const jesusErrors = await boot(jesus, "http://127.0.0.1:8807/jesus/");

  const joseMark = await jose.evaluate(() => {
    localStorage.setItem("vinoteca-jgc-provider", JSON.stringify({ geminiKey: "clave-jose-v105", mode: "gemini" }));
    save();
    return {
      version: APP_VERSION,
      edition: window.CASA_EDITION || "",
      hero: !!document.querySelector(".home-hero-photo"),
      title: document.querySelector("#home h1").textContent,
      bottles: state.bottles.map(b => b.wineId)
    };
  });
  assert.strictEqual(joseMark.version, "v105");
  assert.strictEqual(joseMark.edition, "");
  assert.strictEqual(joseMark.hero, true);
  assert.strictEqual(joseMark.title, "Casa Llavaneras");
  assert.ok(joseMark.bottles.includes("vs-unico-2009"));

  const jesusMark = await jesus.evaluate(() => ({
    version: APP_VERSION,
    edition: window.CASA_EDITION,
    hero: !!document.querySelector(".home-hero-photo"),
    title: document.querySelector("#home h1").textContent,
    brand: document.querySelector(".brand-sub").textContent,
    store: STORE,
    labels: LABEL_DB_NAME,
    provider: PRICE_CFG_KEY,
    bottles: state.bottles.map(b => b.wineId),
    names: state.vinotecas.map(v => v.name),
    slots: codesFromLayout(state.vinotecas[0].layout).length
  }));
  assert.strictEqual(jesusMark.edition, "jesus");
  assert.strictEqual(jesusMark.hero, false);
  assert.strictEqual(jesusMark.title, "Vinoteca Jesús Gómez");
  assert.strictEqual(jesusMark.brand, "Vinoteca Jesús Gómez");
  assert.strictEqual(jesusMark.store, "jesus.vinoteca.pro.max.v3");
  assert.strictEqual(jesusMark.labels, "casa-llavaneras-labels-jesus");
  assert.strictEqual(jesusMark.provider, "vinoteca-jgc-provider-jesus");
  assert.deepStrictEqual(jesusMark.bottles, []);
  assert.ok(jesusMark.names.every(name => !String(name).trim()));
  assert.ok(jesusMark.slots >= 8);

  await shot(jesus, "v105-jesus-inicio.png");
  await realClick(jesus, ".tab[data-go='caves']");
  await jesus.waitForFunction(() => document.querySelector("#caves.screen.active"));
  const caves = await jesus.locator("#caves").innerText();
  assert.ok(caves.includes("Añade el nombre de tu vinoteca"), caves.slice(0, 400));
  assert.ok(!caves.includes("Vinoteca principal"));
  await shot(jesus, "v105-jesus-vinotecas.png");

  await realClick(jesus, ".tab[data-go='home']");
  await jesus.waitForFunction(() => document.querySelector("#home.screen.active"));
  await realClick(jesus, "[onclick=\"show('perfil')\"]");
  await jesus.waitForFunction(() => document.querySelector("#perfil.screen.active") && document.getElementById("jesus-key"));
  await jesus.evaluate(() => {
    const backup = document.querySelector("#perfil-body [onclick*='backup']");
    if (backup && backup.scrollIntoView) backup.scrollIntoView({ block: "end" });
  });
  const perfil = await jesus.locator("#perfil").innerText();
  assert.ok(perfil.includes("Clave Gemini"));
  assert.ok(perfil.includes("Copias de seguridad"));
  assert.ok(perfil.includes("Pega tu clave"));
  await shot(jesus, "v105-jesus-ajustes.png");
  const backup = jesus.locator("#perfil-body .card", { hasText: "Copias de seguridad" });
  await backup.scrollIntoViewIfNeeded();
  await backup.click();
  await jesus.waitForFunction(() => document.querySelector("#perfil-sub.screen.active"));
  const copia = await jesus.locator("#perfil-sub").innerText();
  assert.ok(copia.includes("Crear copia ahora"));
  assert.ok(copia.includes("Restaurar copia JSON"));
  await shot(jesus, "v105-jesus-copia.png");

  await jesus.evaluate(async () => {
    upsertCustomWine({
      id: "prueba-jesus-2024",
      name: "Prueba Jesús 2024",
      producer: "Bodega de Jesús",
      vintage: 2024,
      type: "tinto",
      grapes: ["Tempranillo"],
      ratings: emptyRatings()
    });
    state.bottles.push({ uid: "bj-prueba", wineId: "prueba-jesus-2024", qty: 1, cellarId: "j1", bin: "A-01", bought: "2026-10-27", price: 12, note: "" });
    const keyEl = document.getElementById("jesus-gemini-key") || document.getElementById("p-gemini-key");
    if (document.getElementById("p-gemini-key")) document.getElementById("p-gemini-key").value = "clave-jesus-v105";
    if (document.getElementById("p-gemini")) document.getElementById("p-gemini").checked = true;
    if (keyEl && keyEl.id === "jesus-gemini-key") keyEl.value = "clave-jesus-v105";
    saveJesusGeminiKey();
    save();
    const idb = (name, value) => new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("thumbs")) req.result.createObjectStore("thumbs");
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("thumbs", "readwrite");
        tx.objectStore("thumbs").put(value, "keep-v105");
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror = () => reject(tx.error);
      };
    });
    await idb("casa-llavaneras-labels-jesus", "foto-jesus");
    show("cellar", { tab: true });
    if (typeof renderCellar === "function") renderCellar();
  });
  await jesus.waitForFunction(() => document.body.innerText.includes("Prueba Jesús 2024"));
  await shot(jesus, "v105-jesus-botella.png");

  await jose.evaluate(async () => {
    const idb = () => new Promise((resolve, reject) => {
      const req = indexedDB.open("casa-llavaneras-labels", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("thumbs")) req.result.createObjectStore("thumbs");
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("thumbs", "readwrite");
        tx.objectStore("thumbs").put("foto-jose", "keep-v105");
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror = () => reject(tx.error);
      };
    });
    await idb();
    save();
  });
  await jose.reload({ waitUntil: "domcontentloaded" });
  await jose.waitForFunction(() => window.__casaReady === true);
  await jose.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });
  const after = await jose.evaluate(() => ({
    title: document.querySelector("#home h1").textContent,
    hero: !!document.querySelector(".home-hero-photo"),
    text: document.body.innerText,
    bottles: state.bottles.map(b => b.wineId),
    joseStore: localStorage.getItem("vinoteca.pro.max.v3"),
    jesusStore: localStorage.getItem("jesus.vinoteca.pro.max.v3"),
    joseKey: localStorage.getItem("vinoteca-jgc-provider"),
    jesusKey: localStorage.getItem("vinoteca-jgc-provider-jesus")
  }));
  assert.strictEqual(after.title, "Casa Llavaneras");
  assert.strictEqual(after.hero, true);
  assert.ok(after.bottles.includes("vs-unico-2009"));
  assert.ok(!after.bottles.includes("prueba-jesus-2024"));
  assert.ok(!after.text.includes("Prueba Jesús"));
  assert.ok(after.joseStore.includes("vs-unico-2009"));
  assert.ok(!after.joseStore.includes("prueba-jesus-2024"));
  const jesusBag = JSON.parse(after.jesusStore);
  assert.ok(jesusBag.bottles.some(b => b.wineId === "prueba-jesus-2024"));
  assert.ok(!jesusBag.bottles.some(b => b.wineId === "vs-unico-2009"));
  assert.ok(after.joseKey.includes("clave-jose-v105"));
  assert.ok(!after.joseKey.includes("clave-jesus-v105"));
  assert.ok(after.jesusKey.includes("clave-jesus-v105"));
  assert.ok(!after.jesusKey.includes("clave-jose-v105"));
  await shot(jose, "v105-jose-inicio.png");

  assert.deepStrictEqual(joseErrors, []);
  assert.deepStrictEqual(jesusErrors, []);
  await browser.close();
  console.log("v105-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

/* Ficha de Luis Cañas 2024 con una respuesta de Gemini simulada, marcada como TEST DATA. */
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

  const before = await page.evaluate(async () => {
    localStorage.setItem("vinoteca-jgc-provider", JSON.stringify({ geminiKey: "clave-gemini-de-prueba-v103", mode: "gemini" }));
    const put = (name, store, key, value) => new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(store)) req.result.createObjectStore(store);
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(value, key);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
    await put("casa-llavaneras-labels", "thumbs", "keep-v103", "foto-v103");
    await put("vinoteca-jgc-provider", "kv", "gemini", "no-borrar-v103");
    const bottles = (state.bottles || []).length;
    const first = state.bottles && state.bottles[0] ? state.bottles[0].id : "";
    state.customWines = state.customWines || [];
    state.customWines.push({
      id: "luis-canas-2024-test",
      name: "Luis Cañas 2024",
      producer: "Bodegas Luis Cañas",
      vintage: 2024,
      region: "Rioja",
      country: "España",
      appellation: "Rioja",
      type: "blanco",
      style: "escaneo",
      grapes: ["Viura", "Malvasía", "Tempranillo Blanco"],
      abv: 0,
      ratings: {},
      tasting: "",
      provenance: { intake: "usuario", intakeStatus: "CONFIRMED", wineryId: "luis-canas", zoneId: "Rioja" },
      geo: { web: "https://www.luiscanas.com/" },
      wineryAsset: "bodega-luis-canas.jpg",
      zoneAsset: "mapa-rioja.jpg"
    });
    save();
    return { version: APP_VERSION, bottles: bottles, first: first, wines: state.customWines.length };
  });
  assert.strictEqual(before.version, "v108");

  await page.evaluate(() => {
    const prose = "Texto descriptivo de prueba de Bodeboca que cuenta el paisaje familiar la cueva y la historia del viñedo durante muchos años sin ser un dato concreto.";
    window.geminiTryModels = async function (key, kind, run) { return run("gemini-test-data"); };
    window.geminiGrounded = async function () {
      return {
        parsed: {
          hectares: { official: "TEST 50 ha", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "TEST 80 ha", bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024" },
          founded: { official: "1970", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "1970", bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024" },
          production: { official: "TEST 400000 botellas", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "", bodebocaSource: "" },
          soils: { official: "TEST arcilla y caliza, 500 m", officialSource: "https://www.luiscanas.com/bodega", bodeboca: prose, bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024" },
          winemaker: { official: "TEST Fidel Fernández", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "", bodebocaSource: "" },
          bottles: { official: "TEST 120000", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "TEST 90000", bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024" },
          ageing: { official: "TEST 6 meses, roble americano", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "", bodebocaSource: "" },
          abv: { official: "TEST 13,5%", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "Sin dato", bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024" },
          harvest: { official: "", officialSource: "", bodeboca: "TEST vendimia temprana", bodebocaSource: "https://www.bodeboca.com/vino/luis-canas-2024" },
          scores: { official: "TEST Parker 91", officialSource: "https://www.luiscanas.com/bodega", bodeboca: "", bodebocaSource: "" }
        },
        raw: {
          candidates: [{
            groundingMetadata: {
              groundingChunks: [
                { web: { uri: "https://www.luiscanas.com/bodega", title: "TEST DATA Luis Cañas oficial" } },
                { web: { uri: "https://www.bodeboca.com/vino/luis-canas-2024", title: "TEST DATA Bodeboca" } }
              ]
            }
          }]
        }
      };
    };
    openWine("luis-canas-2024-test");
  });
  await page.waitForFunction(() => {
    const img = document.querySelector("#wine-body .hero-art img");
    const btn = document.getElementById("facts-expand");
    return img && img.complete && img.naturalWidth > 0 && btn && btn.textContent === "Ampliar datos";
  });
  await page.click("#wine-body #facts-expand");
  await page.waitForFunction(() => {
    const text = document.getElementById("wine-body").innerText;
    return text.indexOf("TEST 50 ha") >= 0 && text.indexOf("TEST Parker 91") >= 0;
  });
  await page.waitForTimeout(2300);

  const sheet = await page.evaluate(() => {
    const img = document.querySelector("#wine-body .hero-art img");
    const box = img.getBoundingClientRect();
    const text = document.getElementById("wine-body").innerText;
    const hero = document.querySelector("#wine-body .wine-hero").innerHTML;
    return {
      title: document.querySelector("#wine-body h1").textContent,
      sub: document.querySelector("#wine-body .wine-cuvee").textContent,
      src: img.getAttribute("src"),
      wide: (img.closest(".hero-art") || img).className,
      width: box.width,
      height: box.height,
      text: text,
      hero: hero,
      factsAfterCuvee: document.querySelector(".wine-cuvee").nextElementSibling.id
    };
  });
  assert.ok(sheet.title.indexOf("Luis Cañas") >= 0, sheet.title);
  assert.strictEqual(sheet.sub, "Luis Cañas 2024");
  assert.strictEqual(sheet.src, "bodega-luis-canas.jpg");
  assert.ok(sheet.wide.indexOf("hero-art-full") >= 0, sheet.wide);
  assert.ok(sheet.width >= 300, String(sheet.width));
  assert.ok(sheet.height >= 270, String(sheet.height));
  assert.strictEqual(sheet.factsAfterCuvee, "facts-v103");
  assert.ok(!sheet.hero.includes("botella-"), sheet.hero);
  ["TEST 50 ha", "1970", "TEST 400000 botellas", "TEST arcilla y caliza, 500 m", "TEST Fidel Fernández", "TEST 120000", "TEST 6 meses, roble americano", "TEST 13,5%", "TEST vendimia temprana", "TEST Parker 91"].forEach(bit => {
    assert.ok(sheet.text.includes(bit), bit);
  });
  assert.ok(!sheet.text.includes("TEST 80 ha"), sheet.text);
  assert.ok(!sheet.text.includes("TEST 90000"), sheet.text);
  assert.ok(!sheet.text.includes("Sin dato"), sheet.text);
  assert.ok(!sheet.text.includes("paisaje familiar"), sheet.text);

  const shot = async (name) => {
    const file = "/opt/cursor/artifacts/" + name;
    await page.screenshot({ path: file, type: "png" });
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  };
  await shot("v103-luis-canas.png");
  await page.evaluate(() => {
    const scroller = document.getElementById("wine-body");
    const el = document.getElementById("facts-v103");
    scroller.scrollTop = Math.max(0, el.offsetTop - 12);
  });
  await shot("v103-luis-canas-datos.png");

  await page.evaluate(() => openBodega("luis-canas", true));
  await page.waitForFunction(() => {
    const img = document.querySelector("#bodegas-body img.map-art");
    const text = document.getElementById("bodegas-body").innerText;
    return img && img.complete && img.naturalWidth > 0 && text.indexOf("TEST 50 ha") >= 0 && text.indexOf("Ampliar datos") >= 0;
  });
  const bodega = await page.evaluate(() => {
    const img = document.querySelector("#bodegas-body img.map-art");
    const box = img.getBoundingClientRect();
    const style = getComputedStyle(img);
    const h1 = document.querySelector("#bodegas-body h1");
    return {
      title: h1.textContent,
      src: img.getAttribute("src"),
      width: box.width,
      height: box.height,
      fit: style.objectFit,
      maxHeight: style.maxHeight,
      after: h1.nextElementSibling && h1.nextElementSibling.id,
      text: document.getElementById("bodegas-body").innerText
    };
  });
  assert.strictEqual(bodega.title, "Bodegas Luis Cañas");
  assert.strictEqual(bodega.src, "bodega-luis-canas.jpg");
  assert.ok(bodega.width >= 300, String(bodega.width));
  assert.ok(bodega.height >= 180, String(bodega.height));
  assert.strictEqual(bodega.fit, "contain");
  assert.strictEqual(bodega.maxHeight, "340px");
  assert.strictEqual(bodega.after, "facts-v103");
  assert.ok(bodega.text.includes("TEST 50 ha"));
  assert.ok(!bodega.text.includes("TEST 120000"), bodega.text);
  assert.ok(!bodega.text.includes("Sin dato"), bodega.text);
  await shot("v103-bodega-luis-canas.png");
  await page.evaluate(() => {
    const scroller = document.getElementById("bodegas-body");
    const el = document.getElementById("facts-v103");
    scroller.scrollTop = Math.max(0, el.offsetTop - 12);
  });
  await shot("v103-bodega-datos.png");

  await page.click("#bodegas-body #facts-edit");
  await page.fill("#bodegas-body #fact-in-hectares", "TEST 42 ha usuario");
  await page.click("#bodegas-body #facts-save");
  await page.waitForFunction(() => document.getElementById("bodegas-body").innerText.indexOf("TEST 42 ha usuario") >= 0);
  await page.click("#bodegas-body #facts-expand");
  await page.waitForFunction(() => {
    const text = document.getElementById("bodegas-body").innerText;
    return text.indexOf("TEST 42 ha usuario") >= 0 && text.indexOf("TEST 50 ha") < 0;
  });
  const edited = await page.evaluate(() => {
    const row = state.houseFacts && state.houseFacts["luis-canas"] && state.houseFacts["luis-canas"].hectares;
    return { by: row && row.by, value: row && row.value, text: document.getElementById("bodegas-body").innerText };
  });
  assert.strictEqual(edited.value, "TEST 42 ha usuario");
  assert.strictEqual(edited.by, "usuario");
  assert.ok(!edited.text.includes("Sin dato"));
  await page.waitForTimeout(2300);
  await page.evaluate(() => {
    const scroller = document.getElementById("bodegas-body");
    const el = document.getElementById("facts-v103");
    scroller.scrollTop = Math.max(0, el.offsetTop - 12);
  });
  await shot("v103-editar.png");

  const after = await page.evaluate(async () => {
    const read = (name, store, key) => new Promise((resolve, reject) => {
      const req = indexedDB.open(name, 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(store, "readonly");
        const get = tx.objectStore(store).get(key);
        get.onsuccess = () => { const value = get.result; db.close(); resolve(value); };
        get.onerror = () => reject(get.error);
      };
      req.onerror = () => reject(req.error);
    });
    const raw = localStorage.getItem("vinoteca.pro.max.v3");
    const parsed = JSON.parse(raw);
    return {
      bottles: (state.bottles || []).length,
      first: state.bottles && state.bottles[0] ? state.bottles[0].id : "",
      storeBottles: parsed.bottles.length,
      provider: localStorage.getItem("vinoteca-jgc-provider"),
      label: await read("casa-llavaneras-labels", "thumbs", "keep-v103"),
      providerDb: await read("vinoteca-jgc-provider", "kv", "gemini"),
      wines: (state.customWines || []).length
    };
  });
  assert.strictEqual(after.bottles, before.bottles);
  assert.strictEqual(after.first, before.first);
  assert.strictEqual(after.storeBottles, before.bottles);
  assert.ok(after.provider.includes("clave-gemini-de-prueba-v103"));
  assert.strictEqual(after.label, "foto-v103");
  assert.strictEqual(after.providerDb, "no-borrar-v103");
  assert.ok(after.wines >= before.wines);

  await browser.close();
  console.log("v103-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

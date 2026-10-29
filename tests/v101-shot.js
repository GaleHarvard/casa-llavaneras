/* Alta guardada con el código v99 y abierta con v101. */
const assert = require("assert");
const fs = require("fs");
const { execFileSync } = require("child_process");
const playwright = require("/tmp/pw/node_modules/playwright");

function extractFunction(src, name) {
  const start = src.indexOf("async function " + name);
  const at = start >= 0 ? start : src.indexOf("function " + name);
  if (at < 0) throw new Error("falta " + name);
  let i = src.indexOf("{", at);
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(at, i + 1);
    }
  }
  throw new Error("sin cierre " + name);
}

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const v99 = execFileSync("git", ["show", "12eb413:casa-alta.js"], { encoding: "utf8" });
const confirmV99 = extractFunction(v99, "confirmAlta");
assert.ok(confirmV99.includes('color: "#4a1020"'));
assert.ok(confirmV99.includes("split(/[,;]/)"));
assert.ok(!confirmV99.includes("alignWineWithGrapes"));

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

  const tasting = "Vista: Violáceo, ribete granate. Nariz: fruta roja.";
  const saved = await page.evaluate(async ({ confirmSrc, tasting }) => {
    const confirmAltaV99 = new Function(confirmSrc + "\nreturn confirmAlta;")();
    localStorage.setItem("vinoteca-jgc-provider", JSON.stringify({ geminiKey: "sigue-aqui", mode: "gemini" }));
    await new Promise((resolve, reject) => {
      const req = indexedDB.open("casa-llavaneras-labels", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("thumbs")) req.result.createObjectStore("thumbs");
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("thumbs", "readwrite");
        tx.objectStore("thumbs").put("foto-intacta", "keep-me");
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
    await new Promise((resolve, reject) => {
      const req = indexedDB.open("vinoteca-jgc-provider", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("kv")) req.result.createObjectStore("kv");
      };
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put("no-borrar", "gemini");
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
    altaFlow = blankAltaFlow();
    altaFlow.sheet = Object.assign(blankWineSheet(), {
      name: "Luis Cañas Tinto Joven 2024",
      vintage: "2024",
      region: "Rioja",
      winery: "Luis Cañas",
      grapes: "VIURA, MALVASÍA Y TEMPRANILLO BLANCO",
      tasting: tasting,
      crianza: "Tinto Joven"
    });
    altaFlow.cellarLocation = { cellarId: "v1", bin: "B-2" };
    altaFlow.qty = "1";
    openWine = function () {};
    await confirmAltaV99(false);
    const wine = (state.customWines || []).filter(Boolean).slice(-1)[0];
    state.customWines.push({
      id: "solo-cuvee",
      parentId: "p:solo:cuvee",
      name: "Casa Tinto Joven 2021",
      producer: "Casa Blanca",
      vintage: 2021,
      region: "Rioja",
      appellation: "Rioja",
      type: "tinto",
      style: "escaneo",
      grapes: [],
      color: "#4a1020",
      tasting: tasting,
      provenance: { intake: "usuario", intakeStatus: "CONFIRMED" }
    });
    state.cuvees = state.cuvees || {};
    state.cuvees["p:solo:cuvee"] = {
      id: "p:solo:cuvee",
      name: "Casa Tinto Joven 2021",
      grapes: ["VIURA", "MALVASÍA Y TEMPRANILLO BLANCO"],
      type: "tinto",
      appellation: "Rioja",
      vintageIds: ["solo-cuvee"]
    };
    save();
    return {
      count: (state.customWines || []).length,
      id: wine && wine.id,
      name: wine && wine.name,
      producer: wine && wine.producer,
      type: wine && wine.type,
      color: wine && wine.color,
      grapes: wine && wine.grapes,
      tasting: wine && wine.tasting,
      status: wine && wine.provenance && wine.provenance.intakeStatus,
      region: wine && (wine.appellation || wine.region)
    };
  }, { confirmSrc: confirmV99, tasting: tasting });

  assert.ok(saved.id, JSON.stringify(saved));
  assert.strictEqual(saved.name, "Luis Cañas Tinto Joven 2024");
  assert.strictEqual(saved.producer, "Bodegas Luis Cañas");
  assert.strictEqual(saved.type, "");
  assert.strictEqual(saved.color, "#4a1020");
  assert.deepStrictEqual(saved.grapes, ["VIURA", "MALVASÍA Y TEMPRANILLO BLANCO"]);
  assert.strictEqual(saved.tasting, tasting);
  assert.strictEqual(saved.status, "CONFIRMED");
  assert.ok(saved.region.indexOf("Rioja") >= 0, saved.region);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide");
  });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });

  const upgraded = await page.evaluate(id => {
    const wine = (state.customWines || []).find(item => item && item.id === id);
    const cuveeOnly = (state.customWines || []).find(item => item && item.id === "solo-cuvee");
    const cuvee = state.cuvees && state.cuvees["p:solo:cuvee"];
    return {
      version: APP_VERSION,
      name: wine && wine.name,
      type: wine && wine.type,
      color: wine && wine.color,
      grapes: wine && wine.grapes,
      tasting: wine && wine.tasting,
      thumb: wine && wine.labelThumb,
      provider: localStorage.getItem("vinoteca-jgc-provider"),
      cuveeName: cuveeOnly && cuveeOnly.name,
      cuveeType: cuveeOnly && cuveeOnly.type,
      cuveeGrapes: cuvee && cuvee.grapes,
      cuveeTaste: cuveeOnly && cuveeOnly.tasting
    };
  }, saved.id);
  assert.strictEqual(upgraded.version, "v108");
  assert.strictEqual(upgraded.name, "Luis Cañas 2024");
  assert.strictEqual(upgraded.type, "blanco");
  assert.strictEqual(upgraded.tasting, tasting);
  assert.deepStrictEqual(upgraded.grapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
  assert.ok(upgraded.provider.includes("sigue-aqui"), upgraded.provider);
  assert.strictEqual(upgraded.cuveeName, "Casa 2021");
  assert.strictEqual(upgraded.cuveeType, "blanco");
  assert.deepStrictEqual(upgraded.cuveeGrapes, ["VIURA", "MALVASÍA", "TEMPRANILLO BLANCO"]);
  assert.strictEqual(upgraded.cuveeTaste, tasting);

  const labels = await page.evaluate(async () => {
    const read = (dbName, store, key) => new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(store)) { db.close(); resolve(null); return; }
        const tx = db.transaction(store, "readonly");
        const get = tx.objectStore(store).get(key);
        get.onsuccess = () => { const value = get.result; db.close(); resolve(value || null); };
        get.onerror = () => reject(get.error);
      };
      req.onerror = () => reject(req.error);
    });
    return {
      labels: await read("casa-llavaneras-labels", "thumbs", "keep-me"),
      providerDb: await read("vinoteca-jgc-provider", "kv", "gemini")
    };
  });
  assert.strictEqual(labels.labels, "foto-intacta");
  assert.strictEqual(labels.providerDb, "no-borrar");

  await page.evaluate(id => openWine(id), saved.id);
  try {
    await page.waitForFunction(() => {
      const sub = document.querySelector("#wine-body .wine-cuvee");
      const art = document.querySelector("#wine-body .hero-art img");
      const text = document.getElementById("wine-body") ? document.getElementById("wine-body").innerText : "";
      return sub && sub.textContent.indexOf("Luis Cañas 2024") >= 0 && text.indexOf("Alta confirmada") >= 0 && art && art.complete && art.naturalWidth > 0;
    }, null, { timeout: 8000 });
  } catch (err) {
    const debug = await page.evaluate(() => {
      const body = document.getElementById("wine-body");
      return {
        screen: document.querySelector(".screen.active") && document.querySelector(".screen.active").id,
        text: body ? body.innerText.slice(0, 800) : "",
        html: body ? body.innerHTML.slice(0, 500) : ""
      };
    });
    console.error(JSON.stringify(debug, null, 2));
    throw err;
  }
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
  assert.ok(sheet.title.indexOf("Bodegas Luis Cañas") >= 0, sheet.title);
  assert.strictEqual(sheet.sub, "Luis Cañas 2024");
  assert.ok(sheet.text.includes("Alta confirmada"), sheet.text);
  assert.ok(sheet.text.includes("Vista: Violáceo"), sheet.text);
  assert.ok(sheet.text.includes("VIURA"), sheet.text);
  assert.ok(sheet.text.includes("TEMPRANILLO BLANCO"), sheet.text);
  assert.ok(!sheet.text.includes("MALVASÍA Y"), sheet.text);
  assert.ok(!sheet.text.includes("Tinto Joven"), sheet.text);
  assert.ok(!sheet.text.includes("Sin dato"), sheet.text);
  assert.ok(!sheet.text.includes("pajizo") && !sheet.text.includes("amarillo"), sheet.text);
  assert.strictEqual(sheet.bottle, false);
  assert.strictEqual(sheet.art, "bodega-luis-canas.jpg");

  const shot = async (name) => {
    const file = "/opt/cursor/artifacts/" + name;
    await page.screenshot({ path: file, type: "png" });
    const size = pngSize(file);
    assert.deepStrictEqual(size, { width: 1170, height: 2532 });
  };
  await shot("v101-luis-canas.png");

  await page.evaluate(() => openWineSub("tecnica"));
  await page.waitForFunction(() => {
    const sub = document.getElementById("wine-sub");
    const text = document.getElementById("wine-sub-body") ? document.getElementById("wine-sub-body").innerText : "";
    return sub && sub.classList.contains("active") && text.indexOf("Blanco") >= 0 && text.indexOf("VIURA") >= 0 && text.indexOf("TEMPRANILLO BLANCO") >= 0;
  });
  const tech = await page.evaluate(() => document.getElementById("wine-sub-body").innerText);
  assert.ok(tech.includes("Blanco"), tech);
  assert.ok(tech.includes("VIURA"), tech);
  assert.ok(tech.includes("MALVASÍA"), tech);
  assert.ok(tech.includes("TEMPRANILLO BLANCO"), tech);
  assert.ok(!tech.includes("Tinto Joven"), tech);
  assert.ok(!tech.includes("Sin dato"), tech);
  await shot("v101-luis-canas-tipo.png");

  await browser.close();
  console.log("v101-shot ok", saved.id);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

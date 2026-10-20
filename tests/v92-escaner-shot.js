/* Capturas 1170×2532 del escáner, la contraetiqueta y la añada. */
const fs = require("fs");
const assert = require("assert");
const playwright = require("/tmp/pw/node_modules/playwright");

function pngSize(file) {
  const buf = fs.readFileSync(file);
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
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
    if (/generativelanguage\.googleapis\.com|openfoodfacts\.org/.test(url)) return route.abort("failed");
    return route.continue();
  });
  await page.addInitScript(() => {
    window.VINOTECA_CONFIG = { geminiKey: "AIzaTESTKEYV92NOTREAL0001" };
  });
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide");
  });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });

  const offline = await page.evaluate(async () => {
    const prevVision = visionLabel;
    const prevCodes = readCodesFromImage;
    visionLabel = async () => ({ bag: null, failure: "timeout", reason: "tiempo agotado" });
    readCodesFromImage = async () => [];
    const bag = await readBothLabels("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "");
    visionLabel = prevVision;
    readCodesFromImage = prevCodes;
    openAlta({ fields: bag, photos: [], offline: !!bag._offline, ocrText: "3 finques lote L2023" });
    return {
      offline: !!bag._offline,
      failure: bag._failure,
      type: (bag.type && bag.type.value) || "",
      text: document.getElementById("alta-body").innerText,
      retry: !!document.getElementById("alta-retry")
    };
  });
  assert.strictEqual(offline.offline, false);
  assert.strictEqual(offline.failure, "timeout");
  assert.strictEqual(offline.type, "");
  assert.ok(!offline.text.includes("Sin conexión"));
  assert.ok(/tardado/i.test(offline.text));
  assert.strictEqual(offline.retry, true);

  const shots = await page.evaluate(() => {
    function jpeg(paint) {
      const canvas = document.createElement("canvas");
      canvas.width = 700;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      paint(ctx, canvas);
      return canvas.toDataURL("image/jpeg", 0.85);
    }
    const front = jpeg((ctx, canvas) => {
      ctx.fillStyle = "#f4e2b0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#2a1208";
      ctx.font = "64px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("3 FINQUES", canvas.width / 2, 420);
      ctx.font = "28px Georgia";
      ctx.fillText("ETIQUETA", canvas.width / 2, 480);
    });
    const back = jpeg((ctx, canvas) => {
      ctx.fillStyle = "#f7f4ea";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#111";
      for (let x = 80; x < 620; x += 18) ctx.fillRect(x, 180, 8, 220);
      ctx.font = "42px Georgia";
      ctx.textAlign = "center";
      ctx.fillText("CONTRAETIQUETA", canvas.width / 2, 520);
      ctx.font = "24px Georgia";
      ctx.fillText("contiene sulfitos", canvas.width / 2, 580);
    });
    return { front: front, back: back };
  });

  await page.evaluate(({ front, back }) => {
    labelPair.front = front;
    labelPair.back = back;
    labelPair.pending = "";
    labelPair.slot = "";
    show("scan");
    showLabelSlots();
  }, shots);
  await page.waitForFunction(() => {
    const box = document.getElementById("label-slots");
    return box && /Etiqueta delantera/.test(box.innerText) && /Contraetiqueta/.test(box.innerText) && box.querySelectorAll("img").length === 2;
  });
  const scanShot = "/opt/cursor/artifacts/v92-escaner-etiquetas.png";
  await page.screenshot({ path: scanShot, type: "png" });

  await page.evaluate(back => {
    const ratings = {
      vivino: { score: 0, scale: 5, note: "" },
      penin: { score: 0, scale: 100, note: "" },
      parker: { score: 0, scale: 100, note: "" },
      spectator: { score: 0, scale: 100, note: "" },
      decanter: { score: 0, scale: 100, note: "" }
    };
    const keep = {
      id: "duda-etiqueta",
      name: "Etiqueta dudosa",
      producer: "Casa",
      vintage: 2018,
      type: "tinto",
      grapes: [],
      labelThumb: back,
      tasting: "dibujo de la bodega",
      provenance: { intake: "usuario" },
      ratings: ratings
    };
    const move = {
      id: "mover-contra",
      name: "Mover",
      producer: "Casa",
      vintage: 2018,
      type: "tinto",
      grapes: [],
      labelThumb: back,
      tasting: "contiene sulfitos",
      provenance: { intake: "usuario", rawTitle: "contiene sulfitos" },
      ratings: ratings
    };
    state.customWines = state.customWines || [];
    state.customWines.push(keep, move);
    const prevCodes = readCodesFromImage;
    readCodesFromImage = async () => [];
    return migrateStoredBackLabels().then(() => {
      readCodesFromImage = prevCodes;
      const kept = state.customWines.find(w => w.id === "duda-etiqueta");
      const moved = state.customWines.find(w => w.id === "mover-contra");
      if (kept.backLabel || !kept.labelThumb) throw new Error("la duda se ha movido");
      if (!moved.backLabel || moved.labelThumb) throw new Error("la contraetiqueta no se ha apartado");
      state.customWines = state.customWines.filter(w => w.id !== "duda-etiqueta" && w.id !== "mover-contra");
      const wine = {
        id: "perelada-3-finques",
        name: "3 Finques",
        producer: "Perelada",
        vintage: 0,
        region: "Empordà",
        country: "España",
        appellation: "Empordà",
        type: "tinto",
        style: "escaneo",
        grapes: ["Garnatxa Negra", "Syrah", "Cabernet Sauvignon"],
        abv: 14.5,
        volume: "75 cl",
        color: "#4a1020",
        ratings: ratings,
        priceHint: "",
        tasting: "",
        provenance: { intake: "usuario" },
        geo: {},
        backLabel: back
      };
      state.customWines.push(wine);
      const cellar = (state.vinotecas || [])[0];
      state.bottles.push({
        uid: "bperelada92",
        wineId: wine.id,
        qty: 1,
        cellarId: cellar ? cellar.id : "v1",
        bin: "P1",
        bought: "2026-10-18",
        price: 0,
        note: "",
        labelPhoto: ""
      });
      save();
      openWine(wine.id);
    });
  }, shots.back);

  await page.waitForFunction(() => {
    const body = document.getElementById("wine-body");
    const back = document.getElementById("back-label");
    const btn = document.getElementById("back-label-toggle");
    const photo = document.getElementById("back-label-photo");
    return body && back && btn && photo && photo.hidden && /3 Finques/.test(body.innerText) && /Etiqueta posterior/.test(btn.textContent) && /Completar ficha/.test(body.innerText);
  });
  const sheet = await page.evaluate(() => {
    const hero = Array.from(document.querySelectorAll(".wine-hero img")).map(img => img.getAttribute("src") || "");
    const back = document.querySelector("#back-label-photo");
    const dash = Array.from(document.querySelectorAll("#vintage-block .chip")).some(btn => btn.textContent.trim() === "—");
    return {
      hero: hero,
      back: back ? back.getAttribute("src").slice(0, 30) : "",
      hidden: !!(back && back.hidden),
      dash: dash,
      edit: !!document.getElementById("ficha-edit")
    };
  });
  assert.ok(sheet.hero.some(src => src.includes("bodega-perelada.jpg")));
  assert.ok(!sheet.hero.some(src => src.startsWith("data:image")));
  assert.ok(sheet.back.startsWith("data:image"));
  assert.strictEqual(sheet.hidden, true);
  assert.strictEqual(sheet.dash, false);
  assert.strictEqual(sheet.edit, true);
  const fichaShot = "/opt/cursor/artifacts/v92-perelada-contraetiqueta.png";
  await page.screenshot({ path: fichaShot, type: "png" });

  await page.evaluate(() => openFichaEdit("perelada-3-finques"));
  await page.waitForSelector("#edit-vintage");
  await page.fill("#edit-vintage", "2019");
  const editShot = "/opt/cursor/artifacts/v92-perelada-anada.png";
  await page.screenshot({ path: editShot, type: "png" });
  await page.click("#edit-save");
  await page.waitForFunction(() => {
    const wine = state.customWines.find(w => w.id === "perelada-3-finques");
    return wine && wine.vintage === 2019 && document.getElementById("ficha-edit");
  });

  const pending = await page.evaluate(() => {
    const fields = {
      name: { value: "3 Finques", confidence: 0.9 },
      producer: { value: "", confidence: 0 },
      appellation: { value: "Empordà", confidence: 0.8 },
      type: { value: "", confidence: 0 },
      vintage: { value: "", confidence: 0 }
    };
    openAlta({ fields: fields, photos: [], front: "", back: "", ocrText: "Perelada 3 Finques contiene sulfitos", offline: false });
    const text = document.getElementById("alta-body").innerText;
    const suggest = !!document.getElementById("alta-suggest");
    saveAlta(false);
    const wine = (state.customWines || []).slice().reverse().find(w => /finques/i.test(w.name || ""));
    return {
      suggest: suggest,
      text: text,
      pending: !!(wine && wine.provenance && wine.provenance.producerPending),
      producer: wine ? wine.producer : "falta",
      offline: text.includes("Sin conexión")
    };
  });
  assert.strictEqual(pending.suggest, true);
  assert.ok(pending.text.includes("Castillo Perelada") || pending.text.includes("Perelada"));
  assert.strictEqual(pending.pending, true);
  assert.strictEqual(pending.producer, "");
  assert.strictEqual(pending.offline, false);

  [scanShot, fichaShot, editShot].forEach(file => {
    const size = pngSize(file);
    assert.deepStrictEqual(size, { w: 1170, h: 2532 });
  });
  await browser.close();
  console.log("v92 capturas ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

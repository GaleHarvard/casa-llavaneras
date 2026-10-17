/* Punta a punta del alta v89 con respuestas simuladas de Gemini. */
const fs = require("fs");
const path = require("path");

let playwright;
try {
  playwright = require("/tmp/pw/node_modules/playwright");
} catch (err) {
  console.log("playwright no disponible, se omite la punta a punta");
  process.exit(0);
}

const repeat = ("Juvé & Camps S.A.U. / ").repeat(40);
const goodParsed = {
  name: { value: "Reserva de la Familia", confidence: 0.96 },
  producer: { value: "Juvé & Camps B. Propietat d'Espiells S.A.U.", confidence: 0.92 },
  appellation: { value: "Cava, Comtats de Barcelona · Valls d'Anoia-Foix", confidence: 0.9 },
  vintage: { value: "2018", confidence: 0.98 },
  type: { value: "espumoso", confidence: 0.94 },
  category: { value: "Gran Reserva Brut Nature", confidence: 0.93 },
  grapes: { value: "", confidence: 0 },
  abv: { value: "12", confidence: 0.91 },
  volume: { value: "75 cl", confidence: 0.91 },
  ean: { value: "8424487600188", confidence: 0.8 },
  web: { value: "juveycamps.com", confidence: 0.9 }
};

function geminiBody(mode) {
  if (mode === "cut") {
    return {
      candidates: [{
        finishReason: "MAX_TOKENS",
        content: { parts: [{ text: JSON.stringify({ producer: { value: repeat, confidence: 0.9 } }) }] }
      }]
    };
  }
  return {
    candidates: [{
      finishReason: "STOP",
      content: { parts: [{ text: JSON.stringify(goodParsed) }] }
    }]
  };
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
  let mode = "cut";
  const calls = [];
  await page.route(/generativelanguage\.googleapis\.com/, async route => {
    const url = route.request().url();
    if (url.includes("generateContent")) {
      const body = route.request().postData() || "";
      calls.push(body);
      if (mode === "network") return route.abort("failed");
      if (mode === "429") {
        return route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: 429, message: "Resource has been exhausted (e.g. check quota).", status: "RESOURCE_EXHAUSTED" } })
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(geminiBody(mode))
      });
    }
    if (url.includes("/models")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          models: [{
            name: "models/gemini-2.5-flash",
            supportedGenerationMethods: ["generateContent"],
            supportedInputModalities: ["TEXT", "IMAGE"]
          }]
        })
      });
    }
    return route.fulfill({ status: 404, body: "no" });
  });
  await page.route(/openfoodfacts\.org/, route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ status: 0 })
  }));
  await page.addInitScript(() => {
    window.VINOTECA_CONFIG = { geminiKey: "AIzaTESTKEYV89NOTREAL0001" };
  });
  await page.goto("http://127.0.0.1:8807/", { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ":root{--inset-bot:34px;--inset-top:47px}" });
  await page.waitForFunction(() => {
    const splash = document.getElementById("splash");
    return splash && splash.classList.contains("hide");
  });
  await page.evaluate(() => { if (typeof setAppLang === "function") setAppLang("es"); });

  const png = fs.readFileSync(path.join(__dirname, "fixtures/juve-contraetiqueta.png"));
  const dataUrl = "data:image/png;base64," + png.toString("base64");
  await page.evaluate(src => { window.__juveUrl = src; }, dataUrl);

  async function read(nextMode) {
    mode = nextMode;
    const before = calls.length;
    const result = await page.evaluate(async () => {
      const prepared = await prepareLabelImage(window.__juveUrl);
      const fields = await readBothLabels(prepared.dataUrl, "");
      openAlta({
        fields: fields,
        photos: prepared.ok ? [prepared.dataUrl] : [],
        catalog: typeof fuzzyCatalogHit === "function" ? fuzzyCatalogHit(fields) : null
      });
      const value = id => (document.getElementById(id) || {}).value || "";
      return {
        prepared: prepared.ok && String(prepared.dataUrl).indexOf("image/jpeg") === 5,
        failure: (document.querySelector("#alta .alta-fail") || {}).textContent || "",
        name: value("alta-name"),
        producer: value("alta-producer"),
        appellation: value("alta-appellation"),
        vintage: value("alta-vintage"),
        type: value("alta-type"),
        category: value("alta-category"),
        grapes: value("alta-grapes"),
        abv: value("alta-abv"),
        volume: value("alta-volume"),
        ean: value("alta-ean"),
        web: value("alta-web"),
        wines: (state.customWines || []).length,
        bottles: state.bottles.length
      };
    });
    result.calls = calls.length - before;
    return result;
  }

  const cut = await read("cut");
  if (!cut.failure.includes("cortado")) throw new Error("corte sin aviso: " + JSON.stringify(cut));
  if (cut.producer.includes("S.A.U. /")) throw new Error("el corte rellenó la bodega repetida");
  await page.evaluate(() => saveAlta(false));
  const afterCut = await page.evaluate(() => ({
    wines: state.customWines.length,
    failure: (document.querySelector("#alta .alta-fail") || {}).textContent || ""
  }));
  if (afterCut.wines !== 0) throw new Error("el corte guardó una ficha");
  if (!afterCut.failure) throw new Error("guardar sin nombre no explicó el motivo");

  const quota = await read("429");
  if (!/minuto|cuota|límite|limite/i.test(quota.failure)) throw new Error("429 sin causa: " + quota.failure);
  if (quota.producer.includes("S.A.U. /")) throw new Error("429 rellenó la bodega repetida");

  const network = await read("network");
  if (!/red/i.test(network.failure)) throw new Error("red sin causa: " + network.failure);
  if ((stateWines(network)) !== 0) throw new Error("la red creó una ficha");

  const good = await read("good");
  const expect = {
    name: "Reserva de la Familia",
    producer: "Juvé & Camps",
    vintage: "2018",
    type: "espumoso",
    category: "Gran Reserva Brut Nature",
    abv: "12",
    volume: "75 cl",
    ean: "8424487600188",
    web: "juveycamps.com"
  };
  Object.keys(expect).forEach(key => {
    if (good[key] !== expect[key]) throw new Error(key + " = " + good[key]);
  });
  if (good.failure) throw new Error("la lectura buena mostró un fallo: " + good.failure);
  if (!good.prepared) throw new Error("la foto no salió en JPEG");
  if (good.calls !== 1) throw new Error("peticiones a Gemini: " + good.calls);
  const posted = calls[calls.length - 1];
  if (!posted.includes("image/jpeg")) throw new Error("Gemini no recibió JPEG");
  if (!posted.includes("2048")) throw new Error("faltan 2048 tokens");
  if (!posted.includes("application/json")) throw new Error("faltó application/json");
  if ((posted.match(/inlineData/g) || []).length !== 1) throw new Error("no fue una sola imagen");

  const place = await page.evaluate(() => {
    document.getElementById("alta-body").scrollTop = 0;
    const btn = document.querySelector("#alta-body .btn-gold");
    const other = document.querySelector("#alta-body .btn-ghost");
    const bar = document.querySelector(".tabbar");
    const name = document.getElementById("alta-name");
    return {
      name: name ? name.getBoundingClientRect().top : 0,
      save: btn ? Math.round(btn.getBoundingClientRect().bottom) : 0,
      another: other ? Math.round(other.getBoundingClientRect().bottom) : 0,
      tab: bar ? Math.round(bar.getBoundingClientRect().top) : 0
    };
  });
  const altaShot = "/opt/cursor/artifacts/v89-alta-juve-hd.png";
  await page.screenshot({ path: altaShot, type: "png" });
  if (place.another > place.tab) throw new Error("el botón queda bajo la barra " + JSON.stringify(place));

  const before = await page.evaluate(() => state.bottles.map(b => b.uid));
  await page.evaluate(() => saveAlta(false));
  await page.waitForFunction(() => {
    const h1 = document.querySelector("#wine-body h1");
    return h1 && /Juvé/.test(h1.textContent || "");
  });
  const ficha = await page.evaluate(() => {
    const h1 = document.querySelector("#wine-body h1");
    const style = getComputedStyle(h1);
    return {
      title: h1.textContent,
      cuvee: (document.querySelector("#wine-body .wine-cuvee") || {}).textContent || "",
      traducir: document.body.innerText.includes("Traducir"),
      wineTr: !!document.getElementById("wine-tr"),
      outline: style.outlineStyle,
      wines: state.customWines.length,
      bottles: state.bottles.map(b => b.uid),
      producer: state.customWines[0] && state.customWines[0].producer,
      name: state.customWines[0] && state.customWines[0].name
    };
  });
  if (ficha.traducir || ficha.wineTr) throw new Error("la ficha sigue mostrando Traducir");
  if (ficha.outline !== "none") throw new Error("contorno del título: " + ficha.outline);
  if (ficha.producer !== "Juvé & Camps" || ficha.name !== "Reserva de la Familia") throw new Error(JSON.stringify(ficha));
  if (ficha.title.includes("S.A.U. /")) throw new Error("título repetido: " + ficha.title);
  if (ficha.bottles.length !== before.length + 1) throw new Error("botellas " + ficha.bottles.length);
  before.forEach(uid => { if (!ficha.bottles.includes(uid)) throw new Error("se perdió " + uid); });
  await page.evaluate(() => { document.getElementById("wine-body").scrollTop = 0; });
  const fichaShot = "/opt/cursor/artifacts/v89-ficha-juve-hd.png";
  await page.screenshot({ path: fichaShot, type: "png" });
  await browser.close();
  console.log("e2e ok");
  console.log("corte", cut.failure);
  console.log("cuota", quota.failure);
  console.log("red", network.failure);
  console.log("ean leído", good.ean, "uvas", JSON.stringify(good.grapes));
  console.log("ficha", ficha.title, "/", ficha.cuvee.trim());
  function stateWines(row) { return row.wines; }
})().catch(err => {
  console.error(err);
  process.exit(1);
});

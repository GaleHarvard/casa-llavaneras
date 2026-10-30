/* Ficha de Domaine Georges Roumier, 1170×2532. */
const assert = require("assert");
const playwright = require("/tmp/pw/node_modules/playwright");

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
  await page.evaluate(() => openBodega("roumier", true));
  await page.waitForFunction(() => {
    const h1 = document.querySelector("#bodegas-body h1");
    return h1 && h1.textContent === "Domaine Georges Roumier";
  });
  const sheet = await page.evaluate(() => {
    const body = document.getElementById("bodegas-body");
    const img = body.querySelector("img");
    return {
      version: APP_VERSION,
      text: body.textContent,
      src: img ? img.getAttribute("src") : ""
    };
  });
  assert.strictEqual(sheet.version, "v111");
  assert.strictEqual(sheet.src, "bodega-domaine-georges-roumier.jpg");
  assert.ok(sheet.text.indexOf("Ilustración pendiente") < 0, sheet.text);
  assert.ok(sheet.text.indexOf("Chambolle-Musigny") >= 0);
  await page.screenshot({ path: "/opt/cursor/artifacts/v92-roumier-hd.png", type: "png" });
  await browser.close();
  console.log("v92-shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

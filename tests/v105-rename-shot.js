/* Renombrar baldas y huecos solo en la edición de Jesús. */
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
  const jesus = await context.newPage();
  const jose = await context.newPage();
  jesus.on("dialog", dialog => dialog.accept());
  jose.on("dialog", dialog => dialog.accept());
  const jesusErrors = await boot(jesus, "http://127.0.0.1:8807/jesus/");
  const joseErrors = await boot(jose, "http://127.0.0.1:8807/");

  await jesus.evaluate(() => openCave("j-es"));
  await jesus.waitForSelector("#cave-rename");
  await jesus.evaluate(() => {
    const btn = document.getElementById("cave-rename");
    const sc = document.querySelector("#cave-detail-screen .scroll");
    if (btn && sc) sc.scrollTop = Math.max(0, btn.offsetTop - 8);
  });
  const armed = await jesus.evaluate(() => document.getElementById("cave-detail").textContent);
  assert.ok(armed.includes("Renombrar"), armed.slice(0, 200));
  assert.ok(armed.includes("Balda 1"));
  await shot(jesus, "v105-jesus-renombrar-armario.png");

  await jesus.evaluate(() => openRenameSheet("j-es"));
  await jesus.waitForSelector("#rename-sheet.show #rename-row-0-0");
  await jesus.evaluate(() => {
    document.getElementById("rename-row-0-0").value = "Tintos de guarda";
    document.querySelector('[data-rename-slot="A-03"]').value = "Botella de guarda";
  });
  const dialog = await jesus.locator("#rename-sheet").innerText();
  assert.ok(dialog.includes("Renombrar"));
  assert.ok(dialog.includes("Nombre por defecto"));
  assert.ok(dialog.includes("Guardar nombres"));
  await shot(jesus, "v105-jesus-renombrar-dialogo.png");

  await jesus.evaluate(() => saveRenameSheet());
  await jesus.waitForFunction(() => {
    const text = document.getElementById("cave-detail").textContent || "";
    return text.includes("Tintos de guarda") && text.includes("Botella de guarda");
  });
  await jesus.evaluate(() => {
    const btn = document.getElementById("cave-rename");
    const sc = document.querySelector("#cave-detail-screen .scroll");
    if (btn && sc) sc.scrollTop = Math.max(0, btn.offsetTop - 8);
  });
  await shot(jesus, "v105-jesus-renombrar-resultado.png");

  const stored = await jesus.evaluate(async () => {
    showSheet("add-sheet");
    const cellar = document.getElementById("add-cellar");
    cellar.value = "j-es";
    onAddCellarChange();
    const shelf = document.getElementById("add-shelf");
    shelf.value = "0";
    onAddShelfChange();
    const slots = document.getElementById("add-free-grid").textContent;
    const shelfOptions = Array.from(shelf.options).map(o => o.textContent);
    const altaSlots = altaBinChoices("j-es", "A-03", 0);
    const altaShelves = altaShelfChoices("j-es", 0);
    upsertCustomWine({
      id: "renombre-jesus-2024",
      name: "Renombre 2024",
      producer: "Bodega de Jesús",
      vintage: 2024,
      type: "tinto",
      grapes: ["Tempranillo"],
      ratings: emptyRatings()
    });
    state.bottles.push({ uid: "bj-ren", wineId: "renombre-jesus-2024", qty: 1, cellarId: "j-es", bin: "A-03", bought: "2026-10-27", price: 12, note: "" });
    save();
    openWine("renombre-jesus-2024");
    const place = document.getElementById("jesus-place").textContent;
    openWineSub("origen");
    const origen = document.getElementById("wine-sub-body").textContent;
    const raw = localStorage.getItem("jesus.vinoteca.pro.max.v3");
    const backup = await collectBackup(false);
    return {
      place: place,
      origen: origen,
      slots: slots,
      shelfOptions: shelfOptions,
      altaSlots: altaSlots,
      altaShelves: altaShelves,
      raw: raw,
      backup: JSON.stringify(backup.state)
    };
  });
  assert.ok(stored.place.includes("Tintos de guarda") && stored.place.includes("Botella de guarda"), stored.place);
  assert.ok(stored.origen.includes("Tintos de guarda") && stored.origen.includes("Botella de guarda"), stored.origen.slice(0, 300));
  assert.ok(stored.slots.includes("Botella de guarda"), stored.slots.slice(0, 300));
  assert.ok(stored.shelfOptions.includes("Tintos de guarda"), stored.shelfOptions.join("|"));
  assert.ok(stored.altaSlots.includes("Botella de guarda") && stored.altaSlots.includes('value="A-03"'), stored.altaSlots);
  assert.ok(stored.altaShelves.includes("Tintos de guarda"), stored.altaShelves);
  assert.ok(stored.raw.includes("Tintos de guarda") && stored.raw.includes("Botella de guarda"));
  assert.ok(stored.backup.includes("Tintos de guarda") && stored.backup.includes("Botella de guarda"));

  const reverted = await jesus.evaluate(() => {
    openRenameSheet("j-es");
    document.querySelector("#rename-row-0-0").value = "";
    document.querySelector('[data-rename-slot="A-03"]').value = "";
    const defaults = document.querySelectorAll("#rename-sheet [data-default]");
    defaults.forEach(btn => { if (btn.getAttribute("data-default") === "Balda 1") resetRenameField(btn); });
    document.querySelector('[data-rename-slot="A-03"]').value = "";
    saveRenameSheet();
    const row = state.vinotecas.find(v => v.id === "j-es").layout.zones[0].rows[0];
    const names = state.vinotecas.find(v => v.id === "j-es").slotNames || {};
    return { name: row.name, slot: names["A-03"] || "", raw: localStorage.getItem(STORE) };
  });
  assert.strictEqual(reverted.name, "Balda 1");
  assert.strictEqual(reverted.slot, "");
  assert.ok(!reverted.raw.includes("Botella de guarda"));

  const joseMark = await jose.evaluate(() => {
    openCave("v1");
    showSheet("add-sheet");
    onAddCellarChange();
    openRenameSheet("v1");
    return {
      rename: !!document.getElementById("cave-rename"),
      sheet: !!document.getElementById("rename-sheet"),
      shelf: !!document.getElementById("add-shelf"),
      place: !!document.getElementById("jesus-place")
    };
  });
  assert.strictEqual(joseMark.rename, false);
  assert.strictEqual(joseMark.sheet, false);
  assert.strictEqual(joseMark.shelf, false);
  assert.strictEqual(joseMark.place, false);

  assert.deepStrictEqual(jesusErrors, []);
  assert.deepStrictEqual(joseErrors, []);
  await browser.close();
  console.log("v105 rename shot ok");
})().catch(err => {
  console.error(err);
  process.exit(1);
});

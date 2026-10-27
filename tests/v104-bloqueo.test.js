/* v104: el worker no navega dentro de activate y el splash deja de recibir toques. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const gemini = fs.readFileSync(path.join(root, "casa-gemini.js"), "utf8");
const estado = fs.readFileSync(path.join(root, "casa-estado.js"), "utf8");

assert.ok(sw.includes('"casa-llavaneras-ios-v106"'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v106"'));
assert.ok(sw.includes('const VERSION = "v106"'));
assert.ok(app.includes('APP_VERSION = "v106"'));
assert.ok(html.includes('content="v106"'));
assert.ok(html.includes('register("sw.js?v=106")'));
assert.ok(!sw.includes("client.navigate"));
assert.ok(sw.includes("clients.claim"));
assert.ok(sw.includes('type: "sw-activated"'));
assert.ok(sw.includes("function settleWithin"));
assert.ok(sw.includes("shellFallback"));
assert.ok(sw.includes("shellIsThisVersion"));
assert.ok(sw.includes('cache: "reload"'));
assert.ok(sw.includes('data.type === "skip-waiting"'));
assert.ok(html.includes("reg.update()"));
assert.ok(html.includes('postMessage({ type: "skip-waiting" })'));
assert.ok(html.includes("casa-sw-version"));
assert.ok(!html.includes("casa-sw-reload"));
assert.ok(html.includes("function casaReleaseSplash"));
assert.ok(html.includes('el.style.pointerEvents = "none"'));
assert.ok(html.includes('el.style.display = "none"'));
assert.ok(html.includes('el.classList.add("is-gone")'));
assert.ok(app.includes("window.casaHideSplash"));
assert.ok(css.includes("pointer-events: none !important"));
assert.ok(css.includes(".splash.is-gone { display: none !important; }"));
assert.ok(css.includes("#cam[hidden] { pointer-events: none !important; }"));
assert.ok(!html.includes("autoplay"));
assert.ok(gemini.includes("video.autoplay = true"));
assert.ok(estado.includes("vinoteca.pro.max.v3"));
assert.ok(!sw.includes("indexedDB.deleteDatabase"));
assert.ok(!html.includes("localStorage.clear"));

console.log("v104-bloqueo ok");

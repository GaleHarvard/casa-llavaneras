/* v106: el icono de Jesús es suyo. El de José sigue siendo J.G.C. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const pngSize = file => {
  const buf = fs.readFileSync(path.join(root, file));
  assert.strictEqual(buf.readUInt32BE(0), 0x89504e47);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf };
};

const joseSvg = read("icon.svg");
const jesusSvg = read("jesus/icon.svg");
const joseManifest = JSON.parse(read("manifest.json"));
const jesusManifest = JSON.parse(read("jesus/manifest.json"));
const joseHtml = read("index.html");
const jesusHtml = read("jesus/index.html");
const sw = read("sw.js");
const v105 = read("casa-v105.js");
const css = read("styles.css");

assert.ok(joseSvg.includes("J.G.C."));
assert.ok(!joseSvg.includes("Jesús"));
assert.ok(!joseSvg.includes("Gómez"));
assert.ok(jesusSvg.includes("Jesús"));
assert.ok(jesusSvg.includes("Gómez"));
assert.ok(!jesusSvg.includes("J.G. d B."));
assert.ok(!jesusSvg.includes("J.G.C."));
assert.ok(jesusSvg.includes('fill="#000"') || jesusSvg.includes("fill:#000"));
assert.ok(jesusSvg.includes("#e8c97a"));
assert.ok(jesusSvg.includes("#c6a35a"));

assert.ok(joseHtml.includes('<div class="mark">J.G.C.</div>'));
assert.ok(!joseHtml.includes("jesus-emblem"));
assert.ok(!joseHtml.includes("Jesús Gómez"));
assert.ok(joseHtml.includes('href="apple-touch-icon.png"'));
assert.ok(joseManifest.icons.every(icon => !String(icon.src).includes("jesus") && !String(icon.src).includes("maskable")));
assert.ok(joseManifest.icons.some(icon => icon.src === "apple-touch-icon.png"));

assert.ok(!jesusHtml.includes("../apple-touch-icon.png"));
assert.ok(!jesusHtml.includes("../icon-192.png"));
assert.ok(jesusHtml.includes('href="apple-touch-icon.png"'));
assert.ok(jesusHtml.includes('href="icon-192.png"'));
assert.ok(jesusHtml.includes('href="icon-120.png"'));
assert.ok(jesusHtml.includes('href="icon-152.png"'));
assert.ok(jesusHtml.includes('href="icon-167.png"'));
assert.ok(jesusHtml.includes("Jesús Gómez"));
assert.ok(!jesusHtml.includes("J.G. d B."));
assert.ok(jesusHtml.includes("jesus-emblem"));
assert.ok(jesusHtml.includes("icon-192-maskable"));

const icons = jesusManifest.icons;
assert.ok(icons.every(icon => !String(icon.src).startsWith("../") && !String(icon.src).includes("/")));
assert.ok(icons.some(icon => icon.src === "icon-192.png" && icon.purpose === "any"));
assert.ok(icons.some(icon => icon.src === "icon-512.png" && icon.purpose === "any"));
assert.ok(icons.some(icon => icon.src === "apple-touch-icon.png"));
assert.ok(icons.some(icon => icon.src === "icon-192-maskable.png" && icon.purpose === "maskable" && icon.sizes === "192x192"));
assert.ok(icons.some(icon => icon.src === "icon-512-maskable.png" && icon.purpose === "maskable" && icon.sizes === "512x512"));
for (const size of ["120x120", "152x152", "167x167", "180x180"]) {
  assert.ok(icons.some(icon => icon.sizes === size), size);
}

const expected = {
  "jesus/icon-1024.png": 1024,
  "jesus/icon-512.png": 512,
  "jesus/icon-512-maskable.png": 512,
  "jesus/icon-192.png": 192,
  "jesus/icon-192-maskable.png": 192,
  "jesus/apple-touch-icon.png": 180,
  "jesus/icon-180.png": 180,
  "jesus/icon-167.png": 167,
  "jesus/icon-152.png": 152,
  "jesus/icon-120.png": 120
};
for (const [file, px] of Object.entries(expected)) {
  const size = pngSize(file);
  assert.deepStrictEqual({ width: size.width, height: size.height }, { width: px, height: px }, file);
}
const joseIcon = pngSize("apple-touch-icon.png");
const jesusIcon = pngSize("jesus/apple-touch-icon.png");
assert.ok(!joseIcon.bytes.equals(jesusIcon.bytes));
assert.deepStrictEqual({ width: joseIcon.width, height: joseIcon.height }, { width: 180, height: 180 });

const assets = sw.slice(sw.indexOf("const ASSETS"), sw.indexOf("const OCR"));
assert.ok(!assets.includes("maskable"));
assert.ok(!assets.includes("icon-1024"));
const jesusIcons = sw.slice(sw.indexOf("const JESUS_ICONS"), sw.indexOf("];", sw.indexOf("const JESUS_ICONS")));
assert.ok(jesusIcons.includes("./icon-192-maskable.png"));
assert.ok(jesusIcons.includes("./icon-512-maskable.png"));
assert.ok(jesusIcons.includes("./apple-touch-icon.png"));
assert.ok(jesusIcons.includes("./icon-120.png"));
assert.ok(sw.includes("for (const path of JESUS_ICONS) await putFresh(cache, path);"));
assert.ok(sw.includes('JESUS_ICONS.indexOf("./" + rel) >= 0'));
assert.ok(sw.includes('"casa-llavaneras-jesus-ios-v110"'));
assert.ok(sw.includes('"casa-llavaneras-ios-v110"'));

assert.ok(v105.includes("jesusIconFile"));
assert.ok(v105.includes('img.alt = "Jesús Gómez"'));
assert.ok(!v105.includes("J.G. d B."));
assert.ok(v105.includes('img.src = "apple-touch-icon.png"'));
assert.ok(css.includes(".jesus-emblem"));
assert.ok(css.includes(".splash .jesus-mark"));
assert.ok(read("app.js").includes('APP_VERSION = "v110"'));

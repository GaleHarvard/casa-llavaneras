/* La miniatura respeta el EXIF y la ficha puede girarla. */
const fs = require("fs");
const path = require("path");
const assert = require("assert");

function extractFunction(src, name) {
  const start = src.indexOf("function " + name);
  if (start < 0) throw new Error("falta " + name);
  let i = src.indexOf("{", start);
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("sin cierre " + name);
}

const root = path.join(__dirname, "..");
const alta = fs.readFileSync(path.join(root, "casa-alta.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const i18n = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

assert.ok(app.includes('APP_VERSION = "v104"'));
assert.ok(html.includes('content="v104"'));
assert.ok(html.includes("casa-alta.js?v=104"));
assert.ok(sw.includes('const CACHE = "casa-llavaneras-ios-v104"'));
assert.ok(sw.includes('const VERSION = "v104"'));
assert.ok(alta.includes('imageOrientation: "from-image"'));
assert.ok(alta.includes('imageOrientation: "none"'));
assert.ok(alta.includes("function uprightLabelData"));
assert.ok(alta.includes("function ensureRotateLabelButton"));
assert.ok(alta.includes("compressLabelThumbStraight"));
assert.ok(alta.includes("linkIllustratedCellar"));
assert.ok(css.includes(".label-rotate"));
const row = i18n.split("\n").find(line => line.indexOf('["label.rotate"') >= 0);
assert.ok(row);
assert.strictEqual(row.split('", "').length, 6);
assert.ok(row.includes("Girar foto"));

const probe = (alta.match(/const ORIENT_PROBE = "([^"]+)"/) || [])[1];
assert.ok(probe);
eval(extractFunction(alta, "dataUrlBytes"));
eval(extractFunction(alta, "readJpegOrientation"));
eval(extractFunction(alta, "readJpegSize"));
const bytes = dataUrlBytes("data:image/jpeg;base64," + probe);
assert.strictEqual(readJpegOrientation(bytes), 6);
const size = readJpegSize(bytes);
assert.ok(size.width > size.height);

console.log("v100-orientacion ok");

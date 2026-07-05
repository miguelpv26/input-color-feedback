// Deterministic size ladder for the library's stylesheet.
// No dependencies — uses Node's built-in zlib. Run: node size.mjs
import { readFileSync } from "node:fs";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = join(here, "..", "styles.css");
const raw = readFileSync(cssPath, "utf8");

// Conservative inline minify (comments + whitespace only). A production
// minifier (Lightning CSS / csso) will match or beat this, so the reported
// numbers under-claim rather than over-claim.
function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")     // block comments
    .replace(/\s+/g, " ")                  // collapse whitespace
    .replace(/\s*([{}:;,>])\s*/g, "$1")   // trim around tokens
    .replace(/;}/g, "}")
    .trim();
}

const min = minify(raw);
const b = (s) => Buffer.byteLength(s, "utf8");
const gz = gzipSync(Buffer.from(min), { level: 9 }).length;
const br = brotliCompressSync(Buffer.from(min), {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
}).length;

const kb = (n) => (n / 1024).toFixed(2) + " KB";
const rows = [
  ["raw", b(raw)],
  ["minified", b(min)],
  ["min + gzip", gz],
  ["min + brotli", br],
];

console.log(`\nstyles.css — size ladder (${new Date().toISOString().slice(0, 10)})\n`);
for (const [label, n] of rows) {
  console.log(`  ${label.padEnd(14)} ${String(n).padStart(6)} B   ${kb(n)}`);
}
console.log(
  `\n  Dependencies: 0   ·   Headline figure to cite: ${kb(gz)} min+gzip\n`
);

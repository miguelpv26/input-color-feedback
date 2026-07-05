// Resolves the 🔬 cells in BENCHMARKS.md §3: reads each framework's *actual
// rendered* validation border colour and computes the WCAG 1.4.11 contrast ratio
// against the adjacent colours (need ≥3:1), then checks whether the invalid/valid
// borders stay distinguishable under forced-colors. This is what axe cannot do —
// axe's contrast rule is for text, not non-text/borders. Run: node contrast.mjs
import { chromium } from "playwright";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const targets = [
  { label: "Bootstrap", file: "bootstrap-states.html" },
  { label: "Bulma", file: "bulma-states.html" },
];

// WCAG sRGB relative luminance + contrast ratio.
const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
// Parse "rgb(...)"/"rgba(...)"; treat alpha < 0.5 as transparent (→ null).
const parse = (s) => { const m = (s || "").match(/[\d.]+/g); if (!m) return null; const a = m.length > 3 ? +m[3] : 1; return a < 0.5 ? null : [+m[0], +m[1], +m[2]]; };
const readStyles = (page) => page.$$eval("input", (els) => els.map((el) => ({
  id: el.id,
  border: getComputedStyle(el).borderTopColor,
  bg: getComputedStyle(el).backgroundColor,
})));

const browser = await chromium.launch();
try {
  for (const t of targets) {
    const url = pathToFileURL(join(here, "fixtures", t.file)).href;

    // 1.4.11 — border contrast vs adjacent colours
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const pageBg = parse(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) || [255, 255, 255];
    const rows = await readStyles(page);
    console.log(`\n${t.label} — border contrast (WCAG 1.4.11, need ≥3:1)`);
    for (const r of rows) {
      const border = parse(r.border);
      if (!border) { console.log(`  ${r.id.padEnd(8)} no solid border colour`); continue; }
      const inside = parse(r.bg) || pageBg;
      const cIn = contrast(border, inside), cOut = contrast(border, pageBg);
      const min = Math.min(cIn, cOut);
      console.log(`  ${r.id.padEnd(8)} ${r.border.padEnd(20)} vs fill ${cIn.toFixed(2)}:1 · vs page ${cOut.toFixed(2)}:1  →  ${min >= 3 ? "PASS" : "FAIL"} (${min.toFixed(2)}:1)`);
    }
    await ctx.close();

    // forced-colors — do the two states stay distinguishable by border?
    const fctx = await browser.newContext({ forcedColors: "active" });
    const fpage = await fctx.newPage();
    await fpage.goto(url, { waitUntil: "networkidle" });
    const byId = Object.fromEntries((await readStyles(fpage)).map((r) => [r.id, r.border]));
    const distinct = byId.invalid && byId.valid && byId.invalid !== byId.valid;
    console.log(`  forced-colors: invalid ${byId.invalid} · valid ${byId.valid}  →  ${distinct ? "borders differ" : "borders identical (state must come from icon/text)"}`);
    await fctx.close();
  }
} finally {
  await browser.close();
}

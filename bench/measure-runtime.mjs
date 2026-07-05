// Runtime cost of live validation feedback, measured with Chrome's own
// Performance.getMetrics (no trace parsing). For each fixture we:
//   1. load it (capturing the library's init Scripting cost), then
//   2. drive every input invalid -> valid and measure the deltas in
//      ScriptDuration / RecalcStyleDuration / LayoutDuration.
// Reports median + [p25-p75] across RUNS. Env: RUNS, N (inputs), THROTTLE (CPU).
//
// Quick smoke test first:  RUNS=1 N=5 npm run bench
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const RUNS = +(process.env.RUNS || 25);
const N = +(process.env.N || 20);
const THROTTLE = +(process.env.THROTTLE || 4);
// Default: animations OFF. Transitions are opt-in, reduced-motion-aware, and
// high-variance — they measure the *animation*, not the validation mechanism this
// study compares. Both this package and Bootstrap zero their transitions under
// prefers-reduced-motion, so disabling it is a fair, symmetric cut. ANIM=1 restores.
const ANIMATE = process.env.ANIM === "1";

// globalName: a window global to wait for so we know the CDN lib finished loading.
// The headline comparison: native HTML+CSS validation (mine) vs Bootstrap's JS
// validation, both animation-free.
const fixtures = [
  { label: "input-color-feedback (native)", file: "mine.html", globalName: null },
  { label: "Bootstrap (JS validation)", file: "bootstrap-js.html", globalName: null },
  { label: "Bootstrap (CSS was-validated)", file: "bootstrap-runtime.html", globalName: null },
  { label: "native baseline", file: "native.html", globalName: null },
  { label: "Pristine", file: "pristine.html", globalName: "Pristine" },
  { label: "just-validate", file: "just-validate.html", globalName: "JustValidate" },
];

const interactKeys = ["ScriptDuration", "RecalcStyleDuration", "LayoutDuration"];
const sortNum = (a) => [...a].sort((x, y) => x - y);
const median = (a) => {
  const s = sortNum(a), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const quantile = (a, q) => {
  const s = sortNum(a), p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p);
  return s[lo] + (s[hi] - s[lo]) * (p - lo);
};
const stat = (arr) =>
  arr.length
    ? { median: +median(arr).toFixed(2), p25: +quantile(arr, 0.25).toFixed(2), p75: +quantile(arr, 0.75).toFixed(2), n: arr.length }
    : { median: NaN, p25: NaN, p75: NaN, n: 0 };
const readMetrics = async (client) =>
  Object.fromEntries((await client.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));

// One measured run of one fixture. Throws on failure (caller counts it).
async function runOnce(browser, fx) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const client = await context.newCDPSession(page);
    await client.send("Performance.enable");
    await client.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
    if (!ANIMATE) {
      await client.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
    }

    const url = new URL(pathToFileURL(join(here, "fixtures", fx.file)));
    url.searchParams.set("n", String(N));
    await page.goto(url.href, { waitUntil: "load" });
    await page.waitForSelector("input");
    if (fx.globalName) {
      await page.waitForFunction((g) => typeof window[g] !== "undefined", fx.globalName, { timeout: 20000 });
    }

    const before = await readMetrics(client);

    const inputs = page.locator("input");
    const count = await inputs.count();
    for (let k = 0; k < count; k++) {
      const el = inputs.nth(k);
      await el.fill("x");       // invalid
      await el.fill("a@b.co");  // valid
    }
    await page.waitForTimeout(50);

    const after = await readMetrics(client);
    const out = { init: (before.ScriptDuration || 0) * 1000 };
    for (const key of interactKeys) out[key] = ((after[key] || 0) - (before[key] || 0)) * 1000;
    return out;
  } finally {
    await context.close();
  }
}

const results = {};
const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
try {
  for (const fx of fixtures) {
    process.stdout.write(`\n${fx.label}: `);
    const init = [], samples = Object.fromEntries(interactKeys.map((k) => [k, []]));
    let failures = 0;
    for (let i = 0; i < RUNS; i++) {
      try {
        const r = await runOnce(browser, fx);
        init.push(r.init);
        for (const key of interactKeys) samples[key].push(r[key]);
        process.stdout.write(".");
      } catch (e) {
        failures++;
        process.stdout.write("x");
        if (failures === 1) console.error(`\n  first failure in "${fx.label}": ${e.message.split("\n")[0]}`);
      }
    }
    results[fx.label] = {
      InitScripting: stat(init),
      ...Object.fromEntries(interactKeys.map((k) => [k, stat(samples[k])])),
      failures,
    };
  }
} finally {
  await browser.close();
}

const pad = (s, n) => String(s).padEnd(n);
const cols = ["InitScripting", ...interactKeys];
console.log(
  `\n\nLive-validation cost · ${N} inputs invalid→valid · CPU throttle ${THROTTLE}x · ` +
    `animations ${ANIMATE ? "ON" : "OFF (prefers-reduced-motion)"} · median [p25–p75] of ${RUNS} runs (ms)\n`
);
console.log(pad("fixture", 24) + cols.map((c) => pad(c.replace("Duration", ""), 22)).join("") + "ok/total");
for (const [label, m] of Object.entries(results)) {
  const ok = m[cols[0]].n;
  console.log(
    pad(label, 24) +
      cols.map((c) => pad(Number.isNaN(m[c].median) ? "—" : `${m[c].median} [${m[c].p25}–${m[c].p75}]`, 22)).join("") +
      `${ok}/${RUNS}`
  );
}
writeFileSync(join(here, "results.json"), JSON.stringify({ env: { RUNS, N, THROTTLE }, results }, null, 2));
console.log(`\nWrote results.json — publish it with browser/OS/CPU alongside.\n`);

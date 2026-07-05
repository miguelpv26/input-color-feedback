// Axe-core audit of a rendered page (a competitor demo or yours), focused on the
// colour/contrast criteria. Usage: node a11y.mjs <url>
// Note: axe flags contrast (1.4.11) and some 1.4.1 cases, but "colour is the only
// cue" still needs a human eyeball — treat this as evidence, not a verdict.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const url = process.argv[2];
if (!url) {
  console.error("usage: node a11y.mjs <url>");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });

const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
await browser.close();

console.log(`\nURL: ${url}`);
console.log(`Total WCAG A/AA violations: ${results.violations.length}\n`);
for (const v of results.violations) {
  const flag = /color|contrast/i.test(v.id + " " + v.description) ? "🎨" : "  ";
  console.log(`${flag} [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
}
console.log(`\n🎨 = colour/contrast related. Manual check still required for 1.4.1.\n`);

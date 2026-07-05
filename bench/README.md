# bench/ — reproducible benchmarks

Everything here backs the numbers in [`../BENCHMARKS.md`](../BENCHMARKS.md). This
folder is **not published** (the package's `files` field ships only `styles.css`).

## Run

```bash
cd bench
npm install
npx playwright install chromium   # one-time, for runtime + a11y

npm run size                      # deterministic size ladder (no browser)
npm run bench                     # runtime cost per fixture
npm run a11y -- https://…         # axe audit of a demo URL
```

## What each script does

- **`size.mjs`** — min + gzip + brotli of `../styles.css` using Node's built-in
  `zlib`. Deterministic; same on any machine. Uses a conservative inline minifier,
  so the number under-claims vs a production minifier.
- **`measure-runtime.mjs`** — loads each fixture, records the library's **init
  scripting** cost, then drives all inputs invalid→valid and measures
  **Scripting / Recalc Style / Layout** deltas via Chrome's `Performance.getMetrics`.
  Reports **median [p25–p75]** across runs.
  - Env vars: `RUNS` (default 25), `N` inputs (default 20), `THROTTLE` CPU rate
    (default 4×). Example: `RUNS=50 N=30 THROTTLE=6 npm run bench`.
  - Writes `results.json`.
- **`a11y.mjs`** — axe-core WCAG A/AA scan of any URL, flagging colour/contrast
  findings. (For border/non-text contrast use `contrast.mjs`; axe is text-only.)
- **`contrast.mjs`** — reads Bootstrap/Bulma's rendered validation border colours
  and computes the WCAG 1.4.11 ratio + a forced-colors check.

## Fixtures (`fixtures/`)

Identical N-input email forms so only the feedback layer differs. `measure-runtime.mjs`
runs with **animations off by default** (`prefers-reduced-motion`) so it compares
the validation *mechanism*, not transitions; `ANIM=1` re-enables them.

| File | What |
|---|---|
| `mine.html` | this package — pure HTML+CSS, live per-field, no JS |
| `bootstrap-js.html` | Bootstrap's live path — toggles `is-invalid`/`is-valid` in JS |
| `bootstrap-runtime.html` | Bootstrap `.was-validated` — CSS only, all-at-once (not live) |
| `native.html` | no library — browser floor |
| `pristine.html` | Pristine, from unpkg (real lib), no visual styling |
| `just-validate.html` | just-validate, from unpkg (real lib), no visual styling |

`bootstrap-states.html` / `bulma-states.html` are used by `contrast.mjs` (not the
runtime run). Real libraries load from unpkg, so there's **no bundling step** — but
`npm run bench` needs network on first load for the CDN assets.

## Honest-reporting checklist

When you publish results, include: **browser + version, OS, CPU model, `THROTTLE`,
`N`, `RUNS`**, and link `results.json`. Report medians with the interval — never a
single run, never a bare mean. If a reader reruns and lands in your interval, the
claim is unfalsifiable in the good sense.

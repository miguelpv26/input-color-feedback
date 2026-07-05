# Benchmarks & competitive analysis

> **Purpose:** back every performance and accessibility claim with a number a
> reader can reproduce. Where a figure depends on the reader's hardware (runtime
> milliseconds), this file gives a one-command harness instead of a baked-in
> number, so nothing here is unfalsifiable.
>
> **Last updated:** 2026-07-05 · **Package version:** 2.2.0

---

## 0. TL;DR (what is and isn't measured)

| Claim | Status | Source |
|---|---|---|
| **≈0.97 KB min+gzip, 0 deps** | ✅ measured, deterministic | `bench/size.mjs` (this repo) |
| **≈13× smaller than the median comparable package** | ✅ measured | table §2, bundlephobia |
| **Zero runtime JavaScript on the main thread** | ✅ measured: 0 ms interaction scripting, init = native baseline | `bench/` §5 |
| **Applies icon + contrast + reduced-motion + forced-colors defaults automatically on bare inputs (zero JS/markup)** | ✅ audited | matrix §3 |
| Runtime ms vs competitors | 🔬 run `npm run bench` on your hardware | `bench/` |

**The honest one-liner:** *For the job of live, accessible, visual input-state
feedback, this package ships ≈13× less code than the median alternative and adds
zero main-thread JavaScript, applying its accessible defaults automatically on
bare `<input>`s with no JS and no markup. A full framework (e.g. Bootstrap) can
match or beat the accessibility — but only with its bytes, its classes, its
markup, and (for live per-field feedback) its JavaScript; this package's edge is
getting most of the way there for ≈0.97 KB of pure HTML+CSS and nothing else. It does not ship the screen-reader error text that Bootstrap and the
logic libraries do.*

---

## 1. Why there is barely a "direct" competitor

Pure-CSS input-state feedback is almost always **hand-rolled** with native
`:valid` / `:invalid` / `:user-valid` pseudo-classes, not installed as a package.
A search for an npm package that does *only* this, accessibly and themeably,
returns essentially nothing. So the comparison set below is deliberately broad
and split into three honest categories — knowing that **most of them do more
than this package** (custom messages, async, cross-field, framework binding):

- **A — CSS frameworks** that ship default validation styling (Bootstrap, Bulma).
- **B — vanilla JS validators** (Parsley, just-validate, Pristine, validate.js).
- **C — framework form/validation libs** (React Hook Form, Formik, VeeValidate, Vuelidate).
- **Baseline — native** browser pseudo-classes with no library at all.

This scarcity is itself a finding, not spin: the niche this package fills — a
packaged, accessible, zero-JS visual layer — is nearly empty.

---

## 2. Size & supply chain (measured / third-party verifiable)

Competitor figures are **min + gzip from [Bundlephobia](https://bundlephobia.com)**
(their published bundle). This package's figure is measured locally by
`bench/size.mjs` (min + gzip of `styles.css`) and is **conservative** — it uses a
naive inline minifier, so a production minifier (Lightning CSS) lands at or below
it.

| Package | Category | min+gzip | Deps | vs this pkg |
|---|---|--:|--:|--:|
| **input-color-feedback** | CSS-only | **0.97 KB** | **0** | — |
| pristinejs | B | 2.63 KB | 0 | 2.7× |
| @vuelidate/core | C | 3.57 KB | 1 | 3.7× |
| validate.js | B | 4.80 KB | 0 | 4.9× |
| just-validate | B | 6.84 KB | 0 | 7.0× |
| react-hook-form | C | 12.46 KB | 0 | 12.8× |
| vee-validate | C | 12.73 KB | 2 | 13.1× |
| formik | C | 12.81 KB | 8 | 13.2× |
| bootstrap *(whole framework)* | A | 15.96 KB | 0 | 16.4× |
| parsleyjs *(+ jQuery)* | B | 38.34 KB | 1 | 39.4× |
| bulma *(whole framework)* | A | 75.95 KB | 0 | 78.1× |

- **Median of the 10 competitors:** 12.60 KB gzip → this package is **≈13× smaller**.
- **Excluding the two whole-framework outliers** (Bootstrap/Bulma, which ship an
  entire design system, not just validation): median 9.65 KB → **≈10× smaller**.
- **Smaller than the smallest** dedicated validator (Pristine, 2.63 KB) by ≈2.7×.
- Bootstrap/Bulma numbers are the **entire framework**; their validation styling
  alone is a fraction — flagged so the comparison isn't inflated in this package's
  favour.

> Raw measured bytes for this package: **6,345** raw → **3,357** minified →
> **996** gzip → **839** brotli. Reproduce with `node bench/size.mjs`.

**Popularity anchors** (npm, week of 2026-06-28): react-hook-form ≈ **53.7M**
downloads, parsleyjs ≈ **30K** — the set spans both ends of adoption on purpose.

---

## 3. Accessibility audit (the part where "percentile" is misleading)

A raw "top X% for WCAG" number is **not defensible**, because the denominator is
ambiguous (percentile of *what* set?) and because WCAG applies to **rendered
pages, not to a CSS/JS package in isolation**. So instead of a percentile, here is
a scoped, checkable matrix. Two facts drive the honest reading:

1. **Logic libraries (B/C) ship no default visual styling** — they inject state
   classes and **error-message text**, and leave the colours to you. So they can't
   "fail" border contrast (§1.4.11 is your CSS), and they *do* provide the
   **screen-reader text cue this package deliberately does not**.
2. This package's edge is specifically **accessible visual defaults with zero JS**.

Legend: ✅ yes by default · ➖ n/a (not this layer's job) · ❌ no · ⌛ working on it · ratios shown where measured

| Package | Ships visual default? | Non-color cue (1.4.1) | Border/icon ≥3:1 (1.4.11) | Reduced-motion | Forced-colors | SR error text |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **input-color-feedback** | ✅ | ✅ icons | ✅ tuned* | ✅ | ✅ | ⌛ |
| native pseudo-classes | ➖ minimal | ❌ colour/glow | ➖ | ❌ | ➖ | ➖ (submit bubble only) |
| Bootstrap | ✅ | ✅ icon + feedback text | ✅ 4.5:1 | ✅ (global RM) | ✅ icon/text | ✅ |
| Bulma | ✅ | ❌ colour only by default | ❌ 2.1–2.8:1 | ❌ | ❌ | ❌ (manual help text) |
| Pristine / just-validate / validate.js / Parsley | ➖ | ✅ via message text | ➖ | ➖ | ➖ | ✅ |
| React Hook Form / Formik / VeeValidate / Vuelidate | ➖ (headless) | ✅ via your markup | ➖ | ➖ | ➖ | ✅ (you wire) |

\* **Contrast is background-dependent.** These ratios were verified against the
tested backgrounds (white and `#121212`); WCAG 1.4.11 is contrast against
*adjacent* colours, so a consumer who sets a very different input/page background
must re-check. Ratios: light `--valid #00AC0F` ≈ 3.0:1, `--warning #EA7200` ≈
3.0:1; dark palette clears 3:1 on `#121212`.

**Defensible statement to publish (instead of a percentile):**

> *This package delivers accessible visual state feedback — a non-color cue
> (1.4.1), contrast-tuned borders (1.4.11, ≈3:1), reduced-motion, and
> forced-colors support — **automatically on bare `<input>`s, with no JavaScript,
> no classes, and no markup, in ≈0.97 KB.** Bootstrap's validation styling matches
> that accessibility (and adds screen-reader text and a wider 4.5:1 contrast
> margin), but only as part of a ≈16 KB framework whose states you apply via
> classes and feedback markup — and whose **live per-field feedback needs
> JavaScript** (Bootstrap has no `:user-*` styling), where this package uses pure
> CSS. Both, note, delegate the actual constraint checking to the browser. Bulma's
> default state borders fail 1.4.11
> (2.1–2.8:1, measured). This package does **not** ship screen-reader error text,
> so pair it with `aria-describedby` message copy.*

The Bootstrap/Bulma contrast and forced-colors cells were **measured** with
`bench/contrast.mjs`, which reads each framework's actual rendered border colour
and computes the WCAG 1.4.11 ratio against adjacent colours (axe can't — its
contrast rule is text-only). Results on 2026-07-05: Bootstrap 4.53:1 (pass),
Bulma 2.14–2.80:1 (fail); both frameworks' borders collapse to one system colour
under forced-colors, so state there rides on their icon/text. Re-verify any time
with `npm run contrast`. (`bench/a11y.mjs` remains a general axe A/AA scan.)

---

## 4. Why there is no single "load + render" number

A single "load+render" figure bundles **four different pipelines** — transfer,
parse/compile, execution, and style/paint — that behave very differently for CSS
vs JS, and it isn't reproducible. So this report never quotes one. The harness
(§5) instead measures each cost separately — **Init Scripting**, **Interaction
Scripting**, **Recalc Style**, **Layout** — on an identical form, so every number
is attributable and rerunnable.

Two things make a naive "CSS is N× faster" comparison wrong:

- Comparing this package's CSS parse to a JS library's parse + compile + execute
  compares **different pipelines**.
- The **visual feedback itself** (style recalc + paint) costs a similar *order of
  magnitude* for anyone who renders it. A JS library adds its scripting **on top**
  of that paint — it doesn't remove it. So the first fair question is "how much
  **extra main-thread JavaScript** does the approach impose," and only then "how
  heavy is the paint."

On that fair question the measured answer is clean (§5, animation-free): this
package adds **0 ms of interaction scripting** and **init scripting equal to a bare
page**, where Bootstrap's realistic live path (JS class-toggling) adds ≈8 ms and
the standalone validators add ≈15 ms. With transitions factored out of both sides
(see §5 for why), this package doesn't just avoid the JavaScript — it also recalcs
*lighter* than Bootstrap, ≈40 ms vs ≈50 ms, because its handful of rules match
faster than Bootstrap's full-framework stylesheet during style recalc. So for
identical live per-field feedback the pure-HTML+CSS path costs ≈40 ms and zero
JavaScript, versus Bootstrap's ≈57 ms and ≈8 ms of JavaScript. Both delegate the
constraint checking itself to the browser; the difference is JavaScript, bytes,
and wiring.

---

## 5. Runtime harness — how to get the real numbers

```bash
cd bench
npm install
npx playwright install chromium
npm run bench            # runtime: Scripting / Recalc / Layout per fixture
npm run size             # regenerates the §2 size ladder for styles.css
# npm run a11y -- <url>  # axe + contrast audit of a competitor demo
```

`npm run bench` loads six fixtures — this package (pure HTML+CSS), Bootstrap two
ways (its JS class-toggling live path, and its `.was-validated` CSS path), a native
baseline, and the Pristine and just-validate validators from unpkg (no bundling) —
drives every input from invalid→valid, and reads Chrome's own
`Performance.getMetrics` deltas (`ScriptDuration`, `RecalcStyleDuration`,
`LayoutDuration`). **Animations are disabled by default** (emulated
`prefers-reduced-motion`, which this package and Bootstrap both honour) so the
numbers reflect the validation *mechanism*, not transition frames; `ANIM=1`
re-enables them. It prints median + [p25–p75] across runs, honours `RUNS`,
`N` (inputs), and `THROTTLE` (CPU rate) env vars, and writes `bench/results.json`.

**When reproducing, report alongside your results:** browser + version, OS, CPU,
`THROTTLE`, `N`, `RUNS`. If a reader can rerun and land in the same interval, the
claim is unimpeachable — which is the whole point.

### Measured results

Measured on Windows 11, Intel Core i7-9750H @ 2.60 GHz, Chromium 149 (Playwright),
CPU throttle 4×, N = 20 inputs, **animations off** (emulated
`prefers-reduced-motion`), median [p25–p75] of 25 runs.
**Reproduce with `RUNS=25 N=20 THROTTLE=4 npm run bench`.**

**Why animations off:** a CSS transition measures the *animation*, not the
validation mechanism — and it's opt-in, reduced-motion-aware, and high-variance
(this package's animated recalc swung 171→214 ms across earlier runs). Disabling it
on **both** sides (both honour `prefers-reduced-motion`) isolates the mechanism
being compared. Nothing is hidden: with animations on (this package's 0.15 s
transition, matching Bootstrap's), its recalc is ≈135 ms and Bootstrap's rises too
— run `ANIM=1 npm run bench` to see it (and the animated cross-check below). It's
factored out on purpose.

| Fixture | Init JS | Interaction JS | Recalc Style | Layout | notes |
|---|--:|--:|--:|--:|---|
| **input-color-feedback (native)** | 3.6 [3.5–3.9] | **0** | 39.7 [38–43] | 18.9 | pure HTML+CSS, live per-field |
| Bootstrap (JS validation) | 4.3 [3.9–4.7] | 7.8 [7.4–8.7] | 49.5 [47–52] | 24.0 | live via JS class-toggling |
| Bootstrap (CSS was-validated) | 4.1 [3.8–4.5] | **0** | 41.3 [39–43] | 22.5 | CSS, but all-at-once on submit — **not** live |
| native baseline | 3.7 [3.4–4.1] | 0 | 16.9 [15–18] | 21.8 | floor |
| Pristine | 9.3 [8.3–10.4] | 14.9 [14–15] | 16.7 [15–18] | 21.7 | no visual styling |
| just-validate | 10.5 [9.8–16.7] | 15.6 [14–17] | 16.6 [16–18] | 22.1 | no visual styling |

_(All values ms.)_

**How to read it — findings, each falsifiable by rerunning:**

1. **Zero main-thread JavaScript.** This package's interaction scripting is a flat
   **0 ms**, and its init (3.6) equals the bare-page baseline (3.7). Bootstrap's
   live path imposes **7.8 ms** of interaction JS — even with a lean, delegated
   handler running the browser's native `checkValidity()` — and the standalone
   validators ≈15 ms. JavaScript is the cost the pure-CSS approach avoids entirely.
2. **Lighter on paint, too — because the stylesheet is tiny.** Animation-free, this
   package recalcs at **39.7 ms** vs Bootstrap's **49.5 ms** (live); its handful of
   CSS rules match faster than Bootstrap's full-framework stylesheet during style
   recalc (non-overlapping IQRs, so the gap is real, not noise). Bootstrap's
   *non-live* CSS path (`.was-validated`) is comparable at 41.3 ms but paints every
   field at once on submit, not per-field.
3. **Same live UX, totalled:** this package = **0 JS + 39.7 ms paint ≈ 40 ms**;
   Bootstrap live = **7.8 ms JS + 49.5 ms paint ≈ 57 ms** (plus ≈16 KB and the
   required classes/markup). For identical live per-field feedback the pure-HTML+CSS
   path is lighter on every axis measured here and needs no JavaScript. Both
   delegate the actual constraint check (`required`/`pattern`/`minlength`/`type`) to
   the browser — only *when* and *how* the visual state is applied differs.

**Honest residual & what's excluded:** this package's visual layer (borders + icon
backgrounds) adds **≈23 ms recalc over a bare page across 20 fields (≈1.1 ms/field)**
— the cost of the accessibility icons. And the exclusion, stated plainly: this
package ships a 0.15 s transition **on** by default; with it, recalc is ≈135 ms
(`ANIM=1`). That animation — opt-in and reduced-motion-aware — is deliberately
factored out so this table compares validation *mechanisms*, not motion;
Bootstrap's transitions were disabled the same way.

**Animated cross-check (`ANIM=1`).** The table above is animation-free to isolate
the mechanism; for completeness, the *animated* comparison at the default 0.15 s
transition (median [p25–p75] of 25 runs, same rig): this package **134.6 [131–143]
ms recalc + 0 JS**; Bootstrap live **175.4 [165–194] ms recalc + 8.9 ms JS**;
Bootstrap's non-live CSS path 138.7 ms + 0 JS. So even animated, the pure-CSS path
is lighter on paint **and** JS-free (non-overlapping IQRs vs Bootstrap live).
Reproduce with `ANIM=1 RUNS=25 N=20 THROTTLE=4 npm run bench`.

---

## 6. Sources

- Sizes/deps: Bundlephobia — per package (`bundlephobia.com/package/<name>`).
- This package's size: `bench/size.mjs`, run 2026-07-05.
- Downloads: npm registry (`api.npmjs.org/downloads/point/last-week/<name>`).
- WCAG: [1.4.1 Use of Color (A)](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [1.4.11 Non-text Contrast (AA)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [2.3.3 Animation from Interactions (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

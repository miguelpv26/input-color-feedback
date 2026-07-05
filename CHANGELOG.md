# Changelog

All notable changes to **input-color-feedback** are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [2.2.0] — 2026-07-04

### Added
- **Icon cues for the three judged states — colour is no longer the only signal
  (WCAG 1.4.1).** Each validation state now carries a drawn icon alongside its
  border colour: a **warning triangle** (focused-but-invalid), an **error cross**
  (left invalid), and a **valid tick** (user-validated). The three share one
  visual language — a bright fill with a darker same-hue border and rounded
  caps/joins.
- Icons are painted into the input's own `background-image` as inlined data-URI
  SVGs, so there is **no extra markup and no network request**; they travel
  inside `styles.css` itself. The standalone `warning.svg` / `error.svg` /
  `check.svg` sources live in the repo for editing — re-inline (URL-encode the
  markup) after changing one.
- **Icon slot only where it fits.** Single-line text-like inputs (`text`,
  `email`, `password`, `tel`, `url`, and a bare `<input>`) reserve a constant
  right-hand padding so the icon never overlaps the value; types that bring their
  own right-edge UI or don't take a background sanely (checkbox, radio, range,
  color, date, number, search…) keep the border-colour feedback only.

### Changed
- **Faster, themeable state transition.** The border-colour and glow transition is
  now **0.15s** (down from 0.3s — snappier, and in line with common UI
  conventions), and is exposed as a `--transition-duration` custom property so it
  can be retuned or disabled. Still fully disabled under `prefers-reduced-motion`.

### Notes
- The six states, their colours, and the glow render as in 2.1.0 (aside from the
  faster transition above); this release adds the icon layer on top.
- The icons are decorative `background-image`s and are **not** announced to
  assistive tech. Keep pairing states with visible error text (e.g. via
  `aria-describedby`) so screen-reader users get the message too.

## [2.1.0] — 2026-07-01

### Added
- **Colour-scheme–aware palette.** The valid and warning colours follow the page's declared
  `color-scheme` via `light-dark()`: `dark` keeps the original palette, `light` uses a
  contrast-safe set (green `#00AC0F`, orange `#EA7200`) that meets WCAG 1.4.11 (3:1) on white,
  and `light dark` follows the user's OS. Browsers without `light-dark()` fall back to dark.
- **Reduced-motion support.** Border and box-shadow transitions are disabled under
  `prefers-reduced-motion: reduce`.
- **Forced-colors focus ring.** A keyboard focus ring is restored in forced-colors /
  high-contrast mode, where the glow (box-shadow) isn't painted. Normal mode is untouched.
- **Packaging:** `exports` map (bare `input-color-feedback` import now works alongside
  `input-color-feedback/styles.css`), a `sideEffects` hint so bundlers keep the CSS, and a
  `files` allowlist so only the stylesheet is published.

### Changed
- **Removed all `!important`.** State conflicts are now resolved structurally with
  `:not(:placeholder-shown)` instead of forcing the cascade, so consumers can override the
  library with ordinary CSS — no `!important` arms race.
- Documented the per-state contrast ratios and the "colour alone isn't sufficient"
  (WCAG 1.4.1) caveat directly in the stylesheet.

### Notes
- No visible behaviour change on the dark UIs the package targets — all six states render
  identically to 2.0.0.

## [2.0.0]

- Initial public release of the current version.

[2.2.0]: https://github.com/miguelpv26/input-color-feedback/releases/tag/v2.2.0
[2.1.0]: https://github.com/miguelpv26/input-color-feedback/releases/tag/v2.1.0
[2.0.0]: https://github.com/miguelpv26/input-color-feedback/releases/tag/v2.0.0

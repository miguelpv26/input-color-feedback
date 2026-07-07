# input-color-feedback

A **tiny, dependency-free CSS utility** that gives form inputs live **color, glow and icon feedback** for focus, valid, and invalid states — no JavaScript, no markup changes.

Perfect for **forms and UI/UX polish**, or just making your inputs **feel alive**.

**🔗 [Live demo →](https://inputcolorfeedback.dev/)** — try all six states, in light and dark.

---

## 💿 Installation

```bash
npm install input-color-feedback
# or
yarn add input-color-feedback
```

---

## 🎨 Usage

**Import in CSS:**
```css
@import "input-color-feedback/styles.css";
```

**Or in JS (bundlers like Vite, Webpack, etc.):**
```js
import 'input-color-feedback/styles.css';
```

That's the whole setup — no components, no classes. Every `<input>` starts reacting to its focus and validation state automatically:

```html
<input type="email" placeholder="you@example.com" required>
<input type="text" placeholder="Your name" minlength="2" required>
```

---

## ✨ States

| State | Feedback |
|-------|----------|
| Unfocused & empty (resting) | neutral grey border, no glow |
| Focused & empty (placeholder shown) | **blue** border + glow |
| Focused but invalid | **amber** border + glow (orange in light mode) + ⚠️ warning-triangle icon |
| Focused & valid | **green** border + glow + ✓ valid-tick icon |
| Unfocused & invalid | **red** border + ✕ error-cross icon, no glow |
| Unfocused & valid | **green** border + ✓ valid-tick icon, no glow |

The glow (box-shadow) only appears on the focused field, so a long form never lights up all at once.

The icons ride in the input's own background (inlined SVGs — no extra markup, no network request), so state is signalled by more than colour. They appear on single-line text-like inputs (`text`, `email`, `password`, `tel`, `url`, bare `<input>`); other types keep just the border feedback.

> **⚠️ Requirements:** feedback keys off native HTML validation, so an input only reacts when it has a **`placeholder`** *and* a constraint (`required`, `type`, `minlength`, `pattern`, …). An unconstrained input is always `:valid`, so it would sit green from first paint — this is by design.

---

## 📦 Footprint

- **≈0.97 KB** min+gzip · **0 dependencies** · **0 runtime JavaScript**.
- Roughly **13× smaller** than the median comparable validation package — and smaller than the *smallest* JS validator in the field (measured, [Bundlephobia](https://bundlephobia.com)).
- Every figure is reproducible: [**BENCHMARKS.md**](./BENCHMARKS.md) has the full size + accessibility comparison against 10 packages, plus a one-command runtime harness (`bench/`) you can run on your own hardware.

It does **one** thing — accessible visual state feedback — and does it with no JS and no bytes to speak of. It doesn't ship screen-reader error text, so pair it with your own message copy (see [Accessibility](#-accessibility)).

---

## 🖌️ Theming

Every color is a CSS custom property on `:root`. Override them to match your brand — no Sass, no build step:

| Variable | Controls |
|----------|----------|
| `--default-color` | resting border |
| `--focus-color` | blue focus glow |
| `--valid-color` | green "valid" state |
| `--warning-color` | amber "focused but invalid" state |
| `--invalid-color` | red "left invalid" state |
| `--shadow-strength` | glow intensity (`0`–`1`) |
| `--transition-duration` | border + glow transition speed (e.g. `0.15s`; `0` disables) |

```css
:root {
  --focus-color: #7c3aed;
  --valid-color: #16a34a;
}
```

---

## 🌗 Light & dark

The palette follows your page's `color-scheme`. Declare `color-scheme: dark`, `light`, or `light dark` on your `<html>` — as you likely already do — and the two colors that wouldn't otherwise meet contrast on white (the valid green and the warning amber) swap automatically via `light-dark()`: the green darkens and the amber shifts to orange. Declare nothing and browsers render light, so the light palette applies. Override any of it through the variables above.

---

## ♿ Accessibility

- **Color isn't the only cue** ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)). Each judged state also carries a drawn icon (warning triangle, error cross, valid tick), so colorblind users aren't relying on hue alone.
- Respects **`prefers-reduced-motion`** — transitions are disabled for users who ask for less motion.
- Keeps a keyboard **focus ring in forced-colors / high-contrast mode**, where the glow can't render.
- The icons are decorative background images and **aren't announced to assistive tech**. On real forms, still pair the states with visible error text (e.g. via `aria-describedby`) so screen-reader users get the message too.

---

## 🌐 Browser support

Uses modern CSS — `:user-valid` / `:user-invalid`, `color-mix()`, and `light-dark()`. Works in current Chrome, Edge, Firefox and Safari; `light-dark()` needs 2024+ builds, and older browsers fall back to the dark palette.

---

## 🛣️ Roadmap

Where the library is headed — directional, not promises, and without fixed dates.

- **Feedback without required markup.** Today an input only reacts when it carries a `placeholder` *and* a constraint (see the Requirements note under [States](#-states)). A future release aims to lift that, so a plain `<input>` can show the same six states with no extra attributes.
- **Matching text colours _(exploring)_.** Optional tokens so a helper or error message can echo its input's state colour. This needs its own text-tuned palette — WCAG asks more contrast of text (4.5:1) than of borders (3:1) — so it's still exploratory.

Have a use case or an opinion on either? [Open an issue](https://github.com/miguelpv26/input-color-feedback/issues).

---

## ⚖ License

MIT © Miguel Payá Vañó <miguelpayav@gmail.com>

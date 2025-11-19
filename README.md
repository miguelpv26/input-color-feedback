# input-color-feedback

A **tiny CSS utility** that visually enhances input fields with **color and glow feedback** for focus, valid, and invalid states.  

Perfect for **forms, UI/UX improvements**, or just making your inputs **look alive**.

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
**Or import in JS (for bundlers like Webpack, Vite, etc.):**
```js
import 'input-color-feedback/styles.css';
```

All `<input>` fields automatically update their **border color** and **glow (box-shadow)** based on focus and validation state:

- **Focused and empty (placeholder shown)**: border glows blue  
- **Focused but invalid**: border glows amber/orange  
- **Focused and valid**: border glows green  
- **Unfocused invalid**: border turns red (no glow)  
- **Unfocused valid**: border turns green (no glow)  

> **⚠️ Note:** Inputs without a placeholder or without required/pattern validation **WILL NOT** show this behavior.

> The “glow” (box-shadow) only appears on focused inputs, while unfocused inputs only change border color according to validation.

---

## 🔧 Example

```html
<input type="text" placeholder="Your name" required />
<input type="email" placeholder="Your email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />
```

---

## 📝 Features

- Minimal CSS, no JavaScript required  
- Works for focus, valid, and invalid input states  
- Smooth transitions for border and box-shadow  
- Easy to include in any project

---

## ⚖ License

MIT © Miguel Payá Vañó <miguelpayav@gmail.com>
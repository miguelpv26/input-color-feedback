/* =====================================================================
   Bootstrap comparison pane — behaviour.
   External + same-origin so this frame runs under a strict CSP
   (script-src 'self'; no inline scripts).

   NOTE: the existence of this file IS the point of the comparison —
   Bootstrap has no pure-CSS live validation, so its states must be driven
   in JavaScript. The library in the other pane needs none.
   ===================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;

  // ---- Runs immediately, before first paint ----------------------------
  // The parent passes the initial theme via the src #hash. Setting
  // color-scheme here paints this frame's canvas in-theme immediately,
  // instead of flashing default white until Bootstrap's CSS arrives.
  function apply(theme) {
    var t = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-bs-theme', t);
    root.style.colorScheme = t;
    root.style.background = t === 'dark' ? '#121212' : '#ffffff';
  }
  apply(location.hash.slice(1));

  // ---- Follow the parent demo's live light/dark toggle -----------------
  window.addEventListener('message', function (e) {
    // Only accept messages from the embedding page, and only a known shape.
    if (e.source !== window.parent) return;
    var mode = e.data && e.data.theme;
    if (mode !== 'dark' && mode !== 'light') return;
    apply(mode);
  });

  // ---- Drive Bootstrap's live validation states in JS ------------------
  // Its usual live pattern: toggle .is-valid / .is-invalid from the native
  // checkValidity() on input and blur.
  function wire() {
    document.querySelectorAll('.form-control').forEach(function (el) {
      function update() {
        if (el.value === '') {
          el.classList.remove('is-valid', 'is-invalid');
          return;
        }
        var ok = el.checkValidity();
        el.classList.toggle('is-valid', ok);
        el.classList.toggle('is-invalid', !ok);
      }
      el.addEventListener('input', update);
      el.addEventListener('blur', update);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();

/* =====================================================================
   Demo page behaviour only — NOT part of the library (the library is
   styles.css, zero JavaScript). Kept as an external, same-origin file so
   the page can enforce a strict CSP: script-src 'self' (no inline
   handlers, no 'unsafe-inline').
   ===================================================================== */
(function () {
  'use strict';

  var stage = document.querySelector('.stage');
  var toggle = document.getElementById('theme-toggle');
  var frame = document.getElementById('bs-frame');

  // One toggle themes the whole page. The native panes follow the stage's
  // color-scheme via light-dark(); the sandboxed Bootstrap iframe is told
  // over postMessage so it can flip its own data-bs-theme.
  function setTheme(mode) {
    stage.dataset.bg = mode;
    if (frame && frame.contentWindow) {
      // Payload is a non-sensitive theme string; the frame validates its
      // shape. The frame runs at an opaque origin (sandbox without
      // allow-same-origin is not used here, but we still target '*' because
      // no sensitive data crosses the boundary).
      frame.contentWindow.postMessage({ theme: mode }, '*');
    }
  }

  function toggleTheme() {
    setTheme(stage.dataset.bg === 'dark' ? 'light' : 'dark');
  }

  if (toggle) toggle.addEventListener('click', toggleTheme);

  // Sync the Bootstrap pane once it has loaded (covers the initial paint).
  if (frame) {
    frame.addEventListener('load', function () {
      this.contentWindow.postMessage({ theme: stage.dataset.bg }, '*');
    });
  }
})();

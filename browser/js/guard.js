/* Client-side access deterrents, loaded from a file (not inline) so the Content-Security-Policy
   can use script-src 'self' with no 'unsafe-inline'. See the note in src/index.html. */
(function () {
  var block = function (e) { e.preventDefault(); e.stopPropagation(); return false; };
  var inField = function (el) {
    return !!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable));
  };

  // Right-click context menu (allowed inside form fields so the site stays usable).
  document.addEventListener('contextmenu', function (e) {
    if (inField(e.target)) { return; }
    return block(e);
  }, { capture: true });

  // Keyboard shortcuts.
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    var field = inField(document.activeElement);

    // Devtools / inspector / console.
    if (k === 'f12') { return block(e); }
    if (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) { return block(e); }
    // View source, save, print — always blocked.
    if (mod && (k === 'u' || k === 's' || k === 'p')) { return block(e); }
    // Copy / cut / select-all — blocked outside form fields.
    if (mod && !field && (k === 'c' || k === 'x' || k === 'a')) { return block(e); }
  }, { capture: true });

  // Copy / cut / selection outside form fields.
  ['copy', 'cut'].forEach(function (evt) {
    document.addEventListener(evt, function (e) {
      if (!inField(e.target)) { return block(e); }
    }, { capture: true });
  });
  document.addEventListener('selectstart', function (e) {
    if (!inField(e.target)) { return block(e); }
  }, { capture: true });

  // Deter drag-saving of images.
  document.addEventListener('dragstart', function (e) {
    if (e.target && e.target.tagName === 'IMG') { return block(e); }
  }, { capture: true });

  // Lightweight devtools-open detection (window size heuristic).
  var warned = false;
  setInterval(function () {
    var threshold = 170;
    var open = (window.outerWidth - window.innerWidth > threshold) ||
               (window.outerHeight - window.innerHeight > threshold);
    if (open && !warned) {
      warned = true;
      try { console.clear(); } catch (_) {}
      console.log('%cAccess to this page’s source is restricted.',
                  'color:#0b0b0c;font-size:16px;font-weight:700;');
    } else if (!open) {
      warned = false;
    }
  }, 1200);
})();

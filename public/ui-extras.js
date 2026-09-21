'use strict';

window.TA = window.TA || {};

(function (TA) {
  function initHowModal() {
    const btn = document.getElementById('howBtn');
    const overlay = document.getElementById('howOverlay');
    const closeBtn = document.getElementById('howClose');
    const okBtn = document.getElementById('howOk');
    if (!btn || !overlay) return;

    function open() {
      overlay.hidden = false;
    }
    function close() {
      overlay.hidden = true;
    }

    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (okBtn) okBtn.addEventListener('click', close);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.hidden) close();
    });
  }

  function initRegenerateButtons() {
    document.querySelectorAll('[data-role="regenerate"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.panel');
        if (!panel) return;
        const form = panel.querySelector('form');
        if (form) form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHowModal();
    initRegenerateButtons();
  });
})(window.TA);

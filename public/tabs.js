'use strict';

window.TA = window.TA || {};

(function (TA) {
  var TAB_KEYS = {
    formativka: { heading: 'titleFormativka', subheading: 'subFormativka' },
    analysis: { heading: 'titleAnalysis', subheading: 'subAnalysis' },
  };

  var currentTab = 'formativka';

  function init() {
    var tabButtons = Array.from(document.querySelectorAll('[data-tab-target]'));
    var panels = {
      formativka: document.getElementById('panel-formativka'),
      analysis: document.getElementById('panel-analysis'),
    };
    var heading = document.getElementById('pageTitle');
    var subheading = document.getElementById('pageSub');

    function applyTexts() {
      heading.textContent = TA.i18n.t(TAB_KEYS[currentTab].heading);
      subheading.textContent = TA.i18n.t(TAB_KEYS[currentTab].subheading);
    }

    function activate(tabId, opts) {
      opts = opts || {};
      currentTab = tabId;
      tabButtons.forEach(function (btn) {
        var isActive = btn.dataset.tabTarget === tabId;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
      });
      Object.keys(panels).forEach(function (id) {
        var isActive = id === tabId;
        panels[id].classList.toggle('active', isActive);
        panels[id].hidden = !isActive;
      });
      applyTexts();
      if (opts.focusPanel) panels[tabId].focus();
    }

    tabButtons.forEach(function (btn, index) {
      btn.addEventListener('click', function () { activate(btn.dataset.tabTarget); });
      btn.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          var next = event.key === 'ArrowRight'
            ? (index + 1) % tabButtons.length
            : (index - 1 + tabButtons.length) % tabButtons.length;
          tabButtons[next].focus();
          activate(tabButtons[next].dataset.tabTarget);
        }
      });
    });

    TA.i18n.onChange(applyTexts);
    activate('formativka');
  }

  TA.tabs = { init: init };
})(window.TA);

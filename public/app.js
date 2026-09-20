'use strict';

window.TA = window.TA || {};

(function (TA) {
  const limits = window.APP_CONFIG.limits;

  function setLoading(root, isLoading, loadingLabelKey, idleLabelKey) {
    const submitBtn = root.querySelector('[data-role="submit"]');
    const label = root.querySelector('[data-role="submit-label"]');
    const spinner = root.querySelector('[data-role="spinner"]');
    submitBtn.disabled = isLoading;
    submitBtn.setAttribute('aria-busy', String(isLoading));
    spinner.hidden = !isLoading;
    if (label) label.textContent = TA.i18n.t(isLoading ? loadingLabelKey : idleLabelKey);
  }

  function showError(root, message) {
    const el = root.querySelector('[data-role="error"]');
    el.textContent = message || '';
    el.hidden = !message;
  }

  function hideResult(root) {
    root.querySelector('[data-role="result"]').hidden = true;
    root.querySelector('[data-role="download"]').hidden = true;
  }

  function renderResult(root, markdown, filename) {
    const emptyEl = root.querySelector('[data-role="empty"]');
    const resultEl = root.querySelector('[data-role="result"]');
    const blocks = TA.markdown.parseMarkdown(markdown);
    resultEl.innerHTML = TA.markdown.renderHtml(blocks);
    resultEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const regenBtn = root.querySelector('[data-role="regenerate"]');
    if (regenBtn) regenBtn.hidden = false;

    const downloadBtn = root.querySelector('[data-role="download"]');
    downloadBtn.hidden = false;
    downloadBtn.disabled = false;
    downloadBtn.onclick = async () => {
      downloadBtn.disabled = true;
      const labelEl = downloadBtn.querySelector('span');
      const originalText = labelEl.textContent;
      labelEl.textContent = TA.i18n.t('btnPreparingFile');
      try {
        await TA.docxExport.downloadMarkdownAsDocx(markdown, filename);
      } catch (err) {
        showError(root, err.message || TA.i18n.t('errDocx'));
      } finally {
        downloadBtn.disabled = false;
        labelEl.textContent = originalText;
      }
    };
  }

  function bindCounter(textareaId, counterId, max) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    if (!textarea || !counter) return;
    const update = () => {
      counter.textContent = `${textarea.value.length} / ${max}`;
      counter.classList.toggle('is-over', textarea.value.length > max);
    };
    textarea.addEventListener('input', update);
    update();
  }

  function parseTable(raw) {
    const text = String(raw || '').replace(/\r\n/g, '\n').trim();
    if (!text) return [];
    const lines = text.split('\n').filter((line) => line.trim() !== '');
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    return lines
      .map((line) => line.split(delimiter).map((cell) => cell.trim()))
      .slice(0, limits.tablePreviewRows);
  }

  async function submitForm({ root, buildPayload, apiCall, loadingLabelKey, idleLabelKey }) {
    showError(root, '');
    hideResult(root);
    setLoading(root, true, loadingLabelKey, idleLabelKey);
    try {
      const payload = buildPayload();
      const { markdown, filename } = await apiCall(payload);
      renderResult(root, markdown, filename);
    } catch (err) {
      showError(root, err.message || TA.i18n.t('errGeneric'));
    } finally {
      setLoading(root, false, loadingLabelKey, idleLabelKey);
    }
  }

  function initFormativka() {
    const root = document.getElementById('panel-formativka');
    if (!root) return;
    bindCounter('formTopic', 'formTopicCount', limits.topicMax);
    bindCounter('formNotes', 'formNotesCount', limits.notesMax);

    const form = root.querySelector('form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitForm({
        root,
        buildPayload: () => ({
          subject: form.subject.value.trim(),
          grade: form.grade.value,
          topic: form.topic.value.trim(),
          count: Number(form.count.value),
          notes: form.notes.value.trim(),
        }),
        apiCall: (payload) => TA.api.generateFormativka(payload),
        loadingLabelKey: 'btnGenerating',
        idleLabelKey: 'btnGenerate',
      });
    });
  }

  function initAnalysis() {
    const root = document.getElementById('panel-analysis');
    if (!root) return;
    bindCounter('analysisNotes', 'analysisNotesCount', limits.notesMax);

    const form = root.querySelector('form');
    const tableInput = document.getElementById('analysisTable');
    const preview = document.getElementById('analysisPreview');

    function updatePreview() {
      const rows = parseTable(tableInput.value);
      preview.textContent = rows.length
        ? TA.i18n.t('tableHintParsed')(rows.length, rows[0].length)
        : TA.i18n.t('tableHintDefault');
    }
    tableInput.addEventListener('input', updatePreview);
    updatePreview();
    TA.i18n.onChange(updatePreview);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const rows = parseTable(tableInput.value);
      if (rows.length < 2) {
        showError(root, TA.i18n.t('errNeedTable'));
        return;
      }
      submitForm({
        root,
        buildPayload: () => ({ rows, notes: form.notes.value.trim() }),
        apiCall: (payload) => TA.api.analyzeGrades(payload),
        loadingLabelKey: 'btnAnalyzing',
        idleLabelKey: 'btnAnalyze',
      });
    });
  }

  function applyStaticI18n() {
    document.documentElement.lang = TA.i18n.getLang() === 'kk' ? 'kk' : TA.i18n.getLang();
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = TA.i18n.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', TA.i18n.t(el.getAttribute('data-i18n-ph')));
    });
    document.getElementById('langPillLabel').textContent = TA.i18n.t('langName');
  }

  function initLangSwitch() {
    const LABELS = { ru: 'Русский', en: 'English', kk: 'Қазақша' };
    const pillBtn = document.getElementById('langPillBtn');
    const menu = document.getElementById('langMenu');

    function renderMenu() {
      menu.innerHTML = '';
      TA.i18n.SUPPORTED.forEach((code) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = LABELS[code] || code;
        btn.classList.toggle('active', code === TA.i18n.getLang());
        btn.addEventListener('click', () => {
          TA.i18n.setLang(code);
          closeMenu();
        });
        menu.appendChild(btn);
      });
    }

    function openMenu() {
      renderMenu();
      menu.classList.add('open');
      pillBtn.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      menu.classList.remove('open');
      pillBtn.setAttribute('aria-expanded', 'false');
    }

    pillBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (menu.classList.contains('open')) closeMenu();
      else openMenu();
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && event.target !== pillBtn) closeMenu();
    });
  }

  function initSettings() {
    const btn = document.getElementById('settingsBtn');
    const dot = document.getElementById('settingsDot');
    const overlay = document.getElementById('settingsOverlay');
    const closeBtn = document.getElementById('settingsClose');
    const input = document.getElementById('settingsKeyInput');
    const saveBtn = document.getElementById('settingsSaveBtn');
    const clearBtn = document.getElementById('settingsClearBtn');
    const note = document.getElementById('settingsNote');

    function refreshDot() {
      const has = Boolean(TA.settings.getApiKey());
      dot.classList.toggle('is-set', has);
      dot.classList.toggle('is-missing', !has);
    }

    function showNote(text, isError) {
      note.textContent = text;
      note.hidden = !text;
      note.classList.toggle('is-error', Boolean(isError));
    }

    function open() {
      input.value = TA.settings.getApiKey();
      showNote('', false);
      overlay.hidden = false;
      setTimeout(() => input.focus(), 30);
    }
    function close() {
      overlay.hidden = true;
    }

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.hidden) close();
    });

    saveBtn.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value) {
        showNote(TA.i18n.t('errKeyMissing'), true);
        return;
      }
      TA.settings.setApiKey(value);
      refreshDot();
      showNote(TA.i18n.t('keySavedNote'), false);
      setTimeout(close, 700);
    });

    clearBtn.addEventListener('click', () => {
      TA.settings.setApiKey('');
      input.value = '';
      refreshDot();
      showNote(TA.i18n.t('keyClearedNote'), false);
    });

    refreshDot();
    TA.i18n.onChange(refreshDot);
    if (!TA.settings.getApiKey()) open();
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyStaticI18n();
    TA.i18n.onChange(applyStaticI18n);
    initLangSwitch();
    initSettings();
    TA.tabs.init();
    initFormativka();
    initAnalysis();
  });
})(window.TA);

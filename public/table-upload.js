'use strict';

window.TA = window.TA || {};

(function (TA) {
  function rowsToTsv(rows) {
    return rows.map((row) => row.map((cell) => String(cell ?? '')).join('\t')).join('\n');
  }

  function parseCsvText(text) {
    return text
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => line.split(','));
  }

  function fillTable(textarea, rows) {
    textarea.value = rowsToTsv(rows);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function showFileChip(wrap, name, onRemove) {
    wrap.innerHTML = '';
    const chip = document.createElement('span');
    chip.className = 'file-chip';
    chip.textContent = name + ' ';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.addEventListener('click', onRemove);
    chip.appendChild(remove);
    wrap.appendChild(chip);
  }

  function handleFile(file, textarea, chipWrap) {
    const name = file.name.toLowerCase();
    const reader = new FileReader();

    if (name.endsWith('.csv')) {
      reader.onload = () => {
        fillTable(textarea, parseCsvText(String(reader.result || '')));
        showFileChip(chipWrap, file.name, () => {
          chipWrap.innerHTML = '';
        });
      };
      reader.readAsText(file);
      return;
    }

    reader.onload = () => {
      if (!window.XLSX) return;
      const data = new Uint8Array(reader.result);
      const workbook = window.XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, blankrows: false });
      fillTable(textarea, rows);
      showFileChip(chipWrap, file.name, () => {
        chipWrap.innerHTML = '';
      });
    };
    reader.readAsArrayBuffer(file);
  }

  function init() {
    const dropzone = document.getElementById('analysisDropzone');
    const fileInput = document.getElementById('analysisFileInput');
    const chipWrap = document.getElementById('analysisFileChipWrap');
    const textarea = document.getElementById('analysisTable');
    if (!dropzone || !fileInput || !textarea) return;

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleFile(fileInput.files[0], textarea, chipWrap);
      }
      fileInput.value = '';
    });

    ['dragover', 'dragenter'].forEach((evt) => {
      dropzone.addEventListener(evt, (event) => {
        event.preventDefault();
        dropzone.classList.add('is-dragover');
      });
    });
    ['dragleave', 'dragend'].forEach((evt) => {
      dropzone.addEventListener(evt, () => dropzone.classList.remove('is-dragover'));
    });
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragover');
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) handleFile(file, textarea, chipWrap);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  TA.tableUpload = { init };
})(window.TA);

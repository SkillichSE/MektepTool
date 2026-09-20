'use strict';

window.TA = window.TA || {};


(function (TA) {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function parseInline(text) {
    const parts = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let match;
    while ((match = re.exec(text))) {
      if (match.index > last) parts.push({ text: text.slice(last, match.index), bold: false });
      parts.push({ text: match[1], bold: true });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push({ text: text.slice(last), bold: false });
    if (!parts.length) parts.push({ text, bold: false });
    return parts;
  }

  function parseMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let paragraph = [];
    let i = 0;

    function flushParagraph() {
      if (paragraph.length) {
        blocks.push({ type: 'p', text: paragraph.join(' ').trim() });
        paragraph = [];
      }
    }

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '') {
        flushParagraph();
        i++;
        continue;
      }
      if (/^---+$/.test(trimmed)) {
        flushParagraph();
        blocks.push({ type: 'hr' });
        i++;
        continue;
      }
      const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        blocks.push({ type: 'h' + heading[1].length, text: heading[2].trim() });
        i++;
        continue;
      }
      const bullet = trimmed.match(/^[-*]\s+(.*)$/);
      if (bullet) {
        flushParagraph();
        const items = [];
        while (i < lines.length) {
          const m = lines[i].trim().match(/^[-*]\s+(.*)$/);
          if (!m) break;
          items.push(m[1]);
          i++;
        }
        blocks.push({ type: 'ul', items });
        continue;
      }
      const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
      if (numbered) {
        flushParagraph();
        const items = [];
        while (i < lines.length) {
          const m = lines[i].trim().match(/^\d+[.)]\s+(.*)$/);
          if (!m) break;
          items.push(m[1]);
          i++;
        }
        blocks.push({ type: 'ol', items });
        continue;
      }
      paragraph.push(trimmed);
      i++;
    }
    flushParagraph();
    return blocks;
  }

  function inlineHtml(text) {
    return parseInline(text)
      .map((part) => {
        const escaped = escapeHtml(part.text);
        return part.bold ? `<strong>${escaped}</strong>` : escaped;
      })
      .join('');
  }

  function renderHtml(blocks) {
    return blocks
      .map((block) => {
        switch (block.type) {
          case 'hr':
            return '<hr>';
          case 'h1':
          case 'h2':
          case 'h3':
            return `<${block.type}>${inlineHtml(block.text)}</${block.type}>`;
          case 'p':
            return `<p>${inlineHtml(block.text)}</p>`;
          case 'ul':
            return `<ul>${block.items.map((it) => `<li>${inlineHtml(it)}</li>`).join('')}</ul>`;
          case 'ol':
            return `<ol>${block.items.map((it) => `<li>${inlineHtml(it)}</li>`).join('')}</ol>`;
          default:
            return '';
        }
      })
      .join('');
  }

  TA.markdown = { escapeHtml, parseInline, parseMarkdown, renderHtml };
})(window.TA);

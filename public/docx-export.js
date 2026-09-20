'use strict';

window.TA = window.TA || {};

(function (TA) {
  function buildDocxChildren(blocks) {
    const D = window.docx;
    const children = [];

    function runsFor(text) {
      return TA.markdown.parseInline(text).map(
        (part) => new D.TextRun({ text: part.text, bold: !!part.bold })
      );
    }

    blocks.forEach((block) => {
      switch (block.type) {
        case 'hr':
          children.push(new D.Paragraph({ children: [new D.PageBreak()] }));
          break;
        case 'h1':
          children.push(
            new D.Paragraph({ text: block.text, heading: D.HeadingLevel.HEADING_1, spacing: { after: 200, before: 80 } })
          );
          break;
        case 'h2':
          children.push(
            new D.Paragraph({ text: block.text, heading: D.HeadingLevel.HEADING_2, spacing: { after: 150, before: 220 } })
          );
          break;
        case 'h3':
          children.push(
            new D.Paragraph({ text: block.text, heading: D.HeadingLevel.HEADING_3, spacing: { after: 100, before: 160 } })
          );
          break;
        case 'p':
          children.push(new D.Paragraph({ children: runsFor(block.text), spacing: { after: 140 } }));
          break;
        case 'ul':
          block.items.forEach((item) => {
            children.push(new D.Paragraph({ children: runsFor(item), bullet: { level: 0 }, spacing: { after: 60 } }));
          });
          break;
        case 'ol':
          block.items.forEach((item, idx) => {
            children.push(
              new D.Paragraph({
                children: [new D.TextRun({ text: `${idx + 1}. `, bold: false }), ...runsFor(item)],
                spacing: { after: 60 },
              })
            );
          });
          break;
        default:
          break;
      }
    });

    return children;
  }

  function triggerBrowserDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function downloadMarkdownAsDocx(markdown, filename) {
    if (!window.docx) {
      throw new Error(TA.i18n.t('errDocxMissing'));
    }
    const blocks = TA.markdown.parseMarkdown(markdown);
    const doc = new window.docx.Document({
      sections: [{ properties: {}, children: buildDocxChildren(blocks) }],
    });
    const blob = await window.docx.Packer.toBlob(doc);
    triggerBrowserDownload(blob, filename);
  }

  TA.docxExport = { downloadMarkdownAsDocx };
})(window.TA);

/**
 * Exports the CV to a **real** native PDF that looks identical to the preview.
 *
 * 1. Captures the live DOM (HTML + all CSS) of the CV preview element.
 * 2. Sends it to /api/export/pdf which renders it with Puppeteer.
 * 3. Downloads the resulting real vector PDF — selectable text, no images.
 */
import { saveAs } from 'file-saver';

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
}

/** Collect every CSS rule visible to the document (including CSS modules). */
function collectAllCSS(): string {
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        rules.push(rule.cssText);
      }
    } catch {
      // Cross-origin stylesheet — skip
    }
  }
  return rules.join('\n');
}

/** Build a self-contained HTML page from the CV target element. */
function buildFullHTML(target: HTMLElement): string {
  // Clone the target so we can reset transforms without touching the live DOM.
  const clone = target.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.width = '210mm';
  clone.style.minHeight = '297mm';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';

  const css = collectAllCSS();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${css}
    /* Reset for print rendering */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { display: flex; justify-content: center; }
    @page { size: A4 portrait; margin: 0; }
  </style>
</head>
<body>${clone.outerHTML}</body>
</html>`;
}

export async function exportPreviewToPdf({ fileName }: ExportOptions): Promise<void> {
  const target = document.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
  if (!target) {
    throw new Error('Elemento de pré-visualização não encontrado.');
  }

  const html = buildFullHTML(target);

  const res = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, fileName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro ao gerar PDF.' }));
    throw new Error(err.error || 'Erro ao gerar PDF.');
  }

  const blob = await res.blob();
  saveAs(blob, fileName);
}

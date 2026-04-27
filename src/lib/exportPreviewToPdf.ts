/**
 * Exports the CV to PDF that looks identical to the preview.
 *
 * Strategy (automatic):
 *   1. Try the server-side Puppeteer endpoint → real vector PDF.
 *   2. If server fails (Puppeteer not installed), fall back to
 *      html2canvas + jsPDF on the client → high-res image PDF.
 *
 * Both paths produce an instant download — no print dialog.
 */
import { saveAs } from 'file-saver';

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
}

/* ─── Helpers ─── */

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
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm;
      margin: 0; padding: 0;
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

/* ─── Strategy 1: server-side Puppeteer (real vector PDF) ─── */

async function tryServerPdf(html: string, fileName: string): Promise<boolean> {
  try {
    const res = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, fileName }),
    });
    if (!res.ok) return false;
    const blob = await res.blob();
    if (blob.size < 500) return false; // too small → probably empty/error
    saveAs(blob, fileName);
    return true;
  } catch {
    return false;
  }
}

/* ─── Strategy 2: client-side html2canvas + jsPDF (fallback) ─── */

async function clientPdf(target: HTMLElement, fileName: string): Promise<void> {
  const html2canvas = (await import('html2canvas-pro')).default;
  const { default: jsPDF } = await import('jspdf');

  const A4_W_PX = 794;
  const A4_H_PX = 1123;
  const A4_W_MM = 210;
  const A4_H_MM = 297;

  const canvas = await html2canvas(target, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: A4_W_PX,
    windowHeight: Math.max(A4_H_PX, target.scrollHeight),
    width: A4_W_PX,
    onclone: (clonedDoc: Document) => {
      const el = clonedDoc.getElementById(CV_EXPORT_TARGET_ID);
      if (!el) return;
      el.style.transform = 'none';
      el.style.width = `${A4_W_PX}px`;
      el.style.minWidth = `${A4_W_PX}px`;
      el.style.maxWidth = `${A4_W_PX}px`;
      el.style.height = 'auto';
      el.style.minHeight = 'auto';
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
      el.style.boxShadow = 'none';
      el.style.borderRadius = '0';
      // Walk ancestors to reset transforms
      let parent = el.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.transform = 'none';
        parent.style.overflow = 'visible';
        parent = parent.parentElement;
      }
    },
  });

  if (!canvas.width || !canvas.height) {
    throw new Error('Não foi possível capturar o CV. Tente novamente.');
  }

  const pdfW = A4_W_MM;
  const pdfH = (canvas.height * A4_W_MM) / canvas.width;

  // Single continuous page sized to content
  const pdf = new jsPDF({
    unit: 'mm',
    format: [pdfW, Math.max(pdfH, A4_H_MM)],
    orientation: 'portrait',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
  pdf.save(fileName);
}

/* ─── Public API ─── */

export async function exportPreviewToPdf({ fileName }: ExportOptions): Promise<void> {
  const target = document.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
  if (!target) {
    throw new Error('Elemento de pré-visualização não encontrado.');
  }

  // Try Puppeteer first (best quality — real vector PDF)
  const html = buildFullHTML(target);
  const ok = await tryServerPdf(html, fileName);
  if (ok) return;

  // Fallback: client-side capture (high-res image PDF)
  await clientPdf(target, fileName);
}

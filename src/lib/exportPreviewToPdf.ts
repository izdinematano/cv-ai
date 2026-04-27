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

  // ── Force visibility ──
  // On mobile (<900px) the preview pane is display:none.
  // We must make it visible before html2canvas can measure / capture it.
  const overrides: { el: HTMLElement; prev: string }[] = [];
  const forceShow = (el: HTMLElement | null) => {
    if (!el) return;
    const computed = getComputedStyle(el);
    if (computed.display === 'none' || computed.visibility === 'hidden') {
      overrides.push({ el, prev: el.style.cssText });
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('left', '-9999px', 'important');
      el.style.setProperty('top', '0', 'important');
    }
  };

  // Walk up from target to body and force every hidden ancestor visible
  let node: HTMLElement | null = target;
  while (node && node !== document.body) {
    forceShow(node);
    node = node.parentElement;
  }

  // Also reset transform on target itself so html2canvas sees full-size
  const origTransform = target.style.transform;
  const origWidth = target.style.width;
  target.style.transform = 'none';
  target.style.width = `${A4_W_PX}px`;

  // Wait a tick for layout recalc
  await new Promise((r) => requestAnimationFrame(r));

  try {
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
        el.style.overflow = 'visible';
        el.style.boxShadow = 'none';
        el.style.borderRadius = '0';
        // Force every ancestor in the clone visible too
        let p = el.parentElement;
        while (p && p !== clonedDoc.body) {
          p.style.setProperty('display', 'block', 'important');
          p.style.setProperty('visibility', 'visible', 'important');
          p.style.setProperty('overflow', 'visible', 'important');
          p.style.transform = 'none';
          p = p.parentElement;
        }
      },
    });

    if (!canvas.width || !canvas.height) {
      throw new Error('Não foi possível capturar o CV. Tente novamente.');
    }

    const pdfW = A4_W_MM;
    const pdfH = (canvas.height * A4_W_MM) / canvas.width;

    const pdf = new jsPDF({
      unit: 'mm',
      format: [pdfW, Math.max(pdfH, A4_H_MM)],
      orientation: 'portrait',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
    pdf.save(fileName);
  } finally {
    // ── Restore original styles ──
    target.style.transform = origTransform;
    target.style.width = origWidth;
    for (const { el, prev } of overrides) {
      el.style.cssText = prev;
    }
  }
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

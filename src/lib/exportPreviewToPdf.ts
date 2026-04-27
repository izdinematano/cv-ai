/**
 * Exports the on-screen CV preview to a **real** vector PDF using the
 * browser's native print engine (`window.print()`).
 *
 * Benefits over the old html2canvas approach:
 *   - Text is selectable and searchable in the resulting PDF.
 *   - Vector graphics — no image compression artifacts, crisp at any zoom.
 *   - Much smaller file size (typically < 200 KB vs. 2–5 MB).
 *   - Fonts, colours and layout are preserved exactly as on screen.
 *
 * The `@media print` rules in globals.css hide all app chrome and size
 * the CV target to A4.  We add a temporary class `printing-pdf` on `<html>`
 * so the print-specific rules can be even more targeted if needed.
 */

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
}

export async function exportPreviewToPdf({ fileName }: ExportOptions): Promise<void> {
  const target = document.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
  if (!target) {
    throw new Error('Elemento de pré-visualização não encontrado.');
  }

  // Save original document title — the browser uses it as the default
  // file name in the "Save as PDF" dialog.
  const originalTitle = document.title;
  document.title = fileName.replace(/\.pdf$/i, '');

  // Add a marker class so CSS can refine print layout further.
  document.documentElement.classList.add('printing-pdf');

  // Give the browser a tick to apply the class before opening the dialog.
  await new Promise((r) => setTimeout(r, 80));

  window.print();

  // Restore after the print dialog closes (runs synchronously on most
  // browsers once the dialog is dismissed).
  document.documentElement.classList.remove('printing-pdf');
  document.title = originalTitle;
}

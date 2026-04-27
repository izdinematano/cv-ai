/**
 * Exports the on-screen CV preview to PDF via html2canvas + jsPDF.
 *
 * - Captures the live DOM at 3× resolution for crisp A4 output.
 * - Downloads the file directly — no print dialog.
 * - Handles multi-page overflow automatically.
 */
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
}

// A4 dimensions in mm and px (at 96 dpi)
const A4_W_MM = 210;
const A4_H_MM = 297;
const A4_W_PX = 794; // 210mm at 96dpi

export async function exportPreviewToPdf({ fileName }: ExportOptions): Promise<void> {
  const target = document.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
  if (!target) {
    throw new Error('Elemento de pré-visualização não encontrado.');
  }

  const canvas = await html2canvas(target, {
    scale: 3,
    backgroundColor: '#ffffff',
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: A4_W_PX,
    windowHeight: Math.max(1123, target.scrollHeight),
    width: A4_W_PX,
    onclone: (_doc, cloned) => {
      // Reset transforms that the preview pane applies (zoom/scale).
      cloned.style.transform = 'none';
      cloned.style.width = `${A4_W_PX}px`;
      cloned.style.minWidth = `${A4_W_PX}px`;
      cloned.style.maxWidth = `${A4_W_PX}px`;
      cloned.style.height = 'auto';
      cloned.style.minHeight = 'auto';
      cloned.style.maxHeight = 'none';
      cloned.style.overflow = 'visible';
      cloned.style.boxShadow = 'none';
      cloned.style.borderRadius = '0';

      // Also reset any parent wrapper transform
      const wrapper = cloned.parentElement;
      if (wrapper) {
        wrapper.style.transform = 'none';
        wrapper.style.overflow = 'visible';
      }
    },
  });

  // Calculate how many A4 pages the content spans
  const imgWidth = A4_W_MM;
  const imgTotalHeight = (canvas.height * A4_W_MM) / canvas.width;
  const pageCount = Math.ceil(imgTotalHeight / A4_H_MM);

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  });

  // Slice the canvas into A4-sized pages
  for (let page = 0; page < pageCount; page++) {
    if (page > 0) pdf.addPage();

    const sourceY = page * (canvas.width * A4_H_MM / A4_W_MM);
    const sliceHeight = Math.min(
      canvas.width * A4_H_MM / A4_W_MM,
      canvas.height - sourceY,
    );

    // Create a slice canvas for this page
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.round(sliceHeight);
    const ctx = pageCanvas.getContext('2d');
    if (!ctx) continue;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0, Math.round(sourceY),
      canvas.width, Math.round(sliceHeight),
      0, 0,
      pageCanvas.width, pageCanvas.height,
    );

    const pageImgData = pageCanvas.toDataURL('image/png');
    const pageHeightMM = (sliceHeight * A4_W_MM) / canvas.width;
    pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, pageHeightMM);
  }

  pdf.save(fileName);
}

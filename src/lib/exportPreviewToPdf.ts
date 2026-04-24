/**
 * Exports the on-screen CV preview to a multi-page A4 PDF, so the downloaded
 * file matches what the user sees exactly (same template, colours, typography,
 * photo, everything).
 *
 * Strategy:
 *   1. Snapshot the element with id="cv-export-target" using html2canvas-pro
 *      (the fork that supports modern CSS colour functions like oklch).
 *   2. Convert the snapshot to JPEG and place it into a jsPDF A4 document,
 *      slicing it over multiple pages if the preview is taller than A4.
 *   3. Trigger the browser download with the resulting blob.
 */
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
}

export async function exportPreviewToPdf({ fileName }: ExportOptions): Promise<void> {
  const target = document.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
  if (!target) {
    throw new Error('Elemento de pré-visualização não encontrado.');
  }

  const canvas = await html2canvas(target, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    // Strip transforms from ancestors in the cloned tree so the capture is at
    // the natural (un-zoomed) size regardless of the live preview zoom.
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
      if (!cloned) return;
      cloned.style.transform = 'none';
      let parent: HTMLElement | null = cloned.parentElement;
      while (parent) {
        parent.style.transform = 'none';
        parent = parent.parentElement;
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight + 1) {
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(fileName);
}

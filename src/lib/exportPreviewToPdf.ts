/**
 * Exports the on-screen CV preview to a multi-page A4 PDF, so the downloaded
 * file matches what the user sees exactly (same template, colours, typography,
 * photo, everything).
 *
 * Strategy:
 *   1. Snapshot the element with id="cv-export-target" using html2canvas-pro
 *      (the fork that supports modern CSS colour functions like oklch).
 *   2. Convert the snapshot to PNG (lossless, sharper text) and place it into
 *      a jsPDF A4 document, slicing it over multiple pages if the preview is
 *      taller than A4.
 *   3. Pages overlap by a small margin so content is never lost at page breaks.
 *   4. Trigger the browser download with the resulting blob.
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

  // Force an A4-width virtual viewport so media queries, flex/grid breakpoints
  // and font metrics render *identically* on desktop and on mobile. Without
  // this, html2canvas inherits `window.innerWidth`, so a phone (~360px) would
  // render the CV through mobile breakpoints and produce a visibly different
  // PDF from a desktop capture.
  // 210mm at 96dpi ≈ 794px.
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  const canvas = await html2canvas(target, {
    scale: 3, // higher scale = sharper text and images in the PDF
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: A4_WIDTH_PX,
    windowHeight: Math.max(A4_HEIGHT_PX, target.scrollHeight),
    width: A4_WIDTH_PX,
    // Strip transforms from ancestors in the cloned tree so the capture is at
    // the natural (un-zoomed) size regardless of the live preview zoom, and
    // force the target to render at its natural A4 width so mobile viewports
    // never squeeze or reflow it.
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
      if (!cloned) return;
      cloned.style.transform = 'none';
      cloned.style.width = '210mm';
      cloned.style.minWidth = '210mm';
      cloned.style.maxWidth = '210mm';
      // The preview pane is `display:none` on mobile (the user sees a modal
      // instead). Force every ancestor back to a rendered state in the clone
      // so the snapshot actually paints content.
      cloned.style.setProperty('display', 'block', 'important');
      cloned.style.setProperty('visibility', 'visible', 'important');
      let parent: HTMLElement | null = cloned.parentElement;
      while (parent && parent !== clonedDoc.body) {
        parent.style.transform = 'none';
        parent.style.overflow = 'visible';
        parent.style.setProperty('display', 'block', 'important');
        parent.style.setProperty('visibility', 'visible', 'important');
        parent = parent.parentElement;
      }
    },
  });

  // PNG is lossless — sharper text than JPEG, especially at high scale.
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth(); // 210
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Overlap between pages so a section sliced at a page break still appears
  // on both pages — the user never loses content at the seam.
  const OVERLAP_MM = 12;

  if (imgHeight <= pageHeight + 1) {
    // Single page — no slicing needed.
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page: draw the full image on every page, shifted so each page
    // shows the next slice with an overlap to the previous one.
    let heightLeft = imgHeight;
    let position = 0; // mm offset inside the PDF (negative = shift image up)

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      // Shift the image up by (pageHeight - overlap) so the next page
      // starts a bit earlier than where the previous one ended.
      position -= (pageHeight - OVERLAP_MM);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - OVERLAP_MM);
    }
  }

  pdf.save(fileName);
}

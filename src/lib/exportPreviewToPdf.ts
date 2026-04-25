/**
 * Exports the on-screen CV preview to a single continuous-page PDF.
 *
 * The PDF has a fixed A4 width (210 mm) but its height grows dynamically to
 * match the full content height — there are no artificial page breaks and no
 * content is sliced. Templates normally force `minHeight: 1122px` for the
 * on-screen preview; we strip that in the html2canvas clone so the capture
 * reflects the true content height.
 *
 * Strategy:
 *   1. Snapshot the element with id="cv-export-target" using html2canvas-pro.
 *   2. In the cloned DOM, remove all `minHeight` / `min-height` / fixed
 *      `height` declarations so the capture reflects the natural content flow.
 *   3. Convert the snapshot to PNG (lossless) at 3x scale for crisp text.
 *   4. Create a jsPDF with a custom format [210, dynamicHeight] so the page
 *      is exactly as tall as the captured content.
 *   5. Trigger the browser download.
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
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
      if (!cloned) return;

      // Reset the export root so it renders at natural height.
      cloned.style.transform = 'none';
      cloned.style.width = '210mm';
      cloned.style.minWidth = '210mm';
      cloned.style.maxWidth = '210mm';
      cloned.style.height = 'auto';
      cloned.style.minHeight = 'auto';
      cloned.style.maxHeight = 'none';
      cloned.style.setProperty('display', 'block', 'important');
      cloned.style.setProperty('visibility', 'visible', 'important');

      // Walk every descendant and strip fixed/min heights so nothing forces
      // an artificial A4-sized frame. This lets the content flow to its true
      // natural height in the snapshot.
      const walker = clonedDoc.createTreeWalker(
        cloned,
        NodeFilter.SHOW_ELEMENT,
        null
      );
      let el: Node | null = walker.currentNode;
      while (el) {
        const htmlEl = el as HTMLElement;
        htmlEl.style.removeProperty('min-height');
        htmlEl.style.removeProperty('minHeight');
        // Only remove hardcoded pixel heights (e.g. 1122px) — keep 'auto',
        // percentages, or 'fit-content' that authors may rely on.
        const h = htmlEl.style.height;
        if (/^\d+(\.\d+)?px$/.test(h) || h === '100vh' || h === '100%') {
          htmlEl.style.removeProperty('height');
        }
        el = walker.nextNode();
      }

      // Also force every ancestor back to a rendered state in the clone
      // so the snapshot actually paints content (mobile modal ancestors).
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

  // The PDF page width is always A4 (210 mm). The page height grows to match
  // the captured content so everything fits on one continuous page.
  const pdfWidth = 210; // mm
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // mm

  const pdf = new jsPDF({
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
    orientation: 'portrait',
  });

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
}

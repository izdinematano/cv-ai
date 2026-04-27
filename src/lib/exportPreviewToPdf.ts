/**
 * Exports the on-screen CV preview to a single continuous-page PDF.
 *
 * Optimized for small file size (< 5 MB):
 *   - Capture scale reduced to 2x (still crisp for A4 text).
 *   - JPEG quality 0.85 instead of lossless PNG (much smaller).
 *   - Large inline base64 images in the cloned DOM are re-compressed.
 */
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
}

/** Re-compress a base64 image so it doesn't bloat the PDF canvas. */
function compressBase64Image(dataUrl: string, maxSide = 600, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function exportPreviewToPdf({ fileName }: ExportOptions): Promise<void> {
  const target = document.getElementById(CV_EXPORT_TARGET_ID) as HTMLElement | null;
  if (!target) {
    throw new Error('Elemento de pré-visualização não encontrado.');
  }

  // 210mm at 96dpi ≈ 794px.
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  const canvas = await html2canvas(target, {
    scale: 2, // 2x is still crisp for A4 text while keeping file size low
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: A4_WIDTH_PX,
    windowHeight: Math.max(A4_HEIGHT_PX, target.scrollHeight),
    width: A4_WIDTH_PX,
    onclone: async (clonedDoc) => {
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

      // Walk every descendant and strip fixed/min heights.
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
        const h = htmlEl.style.height;
        if (h === '100vh' || h === '100%') {
          htmlEl.style.removeProperty('height');
        } else if (/^\d+(\.\d+)?px$/.test(h)) {
          if (parseFloat(h) >= 100) {
            htmlEl.style.removeProperty('height');
          }
        }
        el = walker.nextNode();
      }

      // Compress large inline base64 images so the canvas stays small.
      const images = cloned.querySelectorAll('img');
      for (const img of images) {
        const src = img.getAttribute('src') || '';
        if (src.startsWith('data:image') && src.length > 20000) {
          const compressed = await compressBase64Image(src, 400, 0.72);
          img.setAttribute('src', compressed);
        }
      }

      // Force every ancestor back to a rendered state in the clone.
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

  // JPEG with 0.85 quality — much smaller than lossless PNG.
  const imgData = canvas.toDataURL('image/jpeg', 0.85);

  const pdfWidth = 210; // mm
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // mm

  const pdf = new jsPDF({
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
    orientation: 'portrait',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
}

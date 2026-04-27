/**
 * Exports the CV to a **real** native PDF with selectable text.
 *
 * Uses @react-pdf/renderer to build a true PDF document (not an image)
 * and file-saver for immediate download — no print dialog.
 */
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { createElement } from 'react';
import { CVDocument } from '@/components/Export/PDFDocument';
import type { CVData } from '@/store/useCVStore';

export const CV_EXPORT_TARGET_ID = 'cv-export-target';

export interface ExportOptions {
  fileName: string;
  data: CVData;
  lang: 'pt' | 'en';
}

export async function exportPreviewToPdf({ fileName, data, lang }: ExportOptions): Promise<void> {
  // Build the react-pdf document tree and render it to a PDF blob.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = createElement(CVDocument, { data, lang }) as any;
  const blob = await pdf(doc).toBlob();
  saveAs(blob, fileName);
}

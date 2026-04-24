/**
 * Extracts raw text content from common CV document formats (PDF, DOCX, TXT).
 * Designed to run entirely in the browser so no server round-trip is needed.
 */

export type SupportedExtension = 'pdf' | 'docx' | 'doc' | 'txt' | 'md' | 'rtf';

export const ACCEPTED_FILE_TYPES =
  '.pdf,.docx,.doc,.txt,.md,.rtf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown,application/rtf';

const getExtension = (fileName: string): SupportedExtension | null => {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  if (!match) return null;
  const ext = match[1].toLowerCase();
  if (['pdf', 'docx', 'doc', 'txt', 'md', 'rtf'].includes(ext)) {
    return ext as SupportedExtension;
  }
  return null;
};

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Import lazily so the heavy pdf.js bundle is only loaded when needed.
  // Using the main entry point so Turbopack / webpack can resolve it in every mode.
  const pdfjsNamespace = (await import('pdfjs-dist')) as unknown as {
    getDocument: (src: unknown) => { promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
      }>;
    }> };
    GlobalWorkerOptions?: { workerSrc: string };
  };

  try {
    if (pdfjsNamespace.GlobalWorkerOptions) {
      pdfjsNamespace.GlobalWorkerOptions.workerSrc = '';
    }
  } catch {
    // ignore
  }

  const loadingTask = pdfjsNamespace.getDocument({ data: arrayBuffer, useWorker: false });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str || '').join(' ');
    pages.push(pageText);
  }
  return pages.join('\n\n').replace(/[ \t]+/g, ' ').trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // mammoth's package.json declares a "browser" field that points to the
  // browser bundle, so bundlers pick the right file automatically.
  const mammoth = (await import('mammoth')) as unknown as {
    extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result?.value || '').trim();
}

async function extractTextFromPlain(file: File): Promise<string> {
  const text = await file.text();
  return text.trim();
}

async function extractTextFromRtf(file: File): Promise<string> {
  // Very loose RTF text extraction: strip control words and braces.
  const raw = await file.text();
  return raw
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\[a-zA-Z]+-?\d*\s?/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DocumentExtractionResult {
  text: string;
  fileName: string;
  kind: SupportedExtension;
}

/**
 * Extracts text from a CV file. Returns an empty string for unsupported formats
 * or on parse failure (no throw - caller can decide what to do).
 */
export async function extractTextFromDocument(file: File): Promise<DocumentExtractionResult> {
  const ext = getExtension(file.name);

  if (!ext) {
    return { text: '', fileName: file.name, kind: 'txt' };
  }

  try {
    switch (ext) {
      case 'pdf':
        return { text: await extractTextFromPdf(file), fileName: file.name, kind: 'pdf' };
      case 'docx':
      case 'doc':
        return { text: await extractTextFromDocx(file), fileName: file.name, kind: 'docx' };
      case 'rtf':
        return { text: await extractTextFromRtf(file), fileName: file.name, kind: 'rtf' };
      case 'txt':
      case 'md':
      default:
        return { text: await extractTextFromPlain(file), fileName: file.name, kind: ext };
    }
  } catch {
    return { text: '', fileName: file.name, kind: ext };
  }
}

export const isSupportedCVFile = (fileName: string) => getExtension(fileName) !== null;

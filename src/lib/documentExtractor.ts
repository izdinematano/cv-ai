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

  // pdfjs-dist v5 requires a worker. We load it from a CDN matching the
  // installed package version so we don't have to ship the worker file
  // through the Next.js bundler (which is fragile under Turbopack).
  const pdfjsNamespace = (await import('pdfjs-dist')) as unknown as {
    version: string;
    getDocument: (src: unknown) => {
      promise: Promise<{
        numPages: number;
        getPage: (n: number) => Promise<{
          getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
        }>;
      }>;
    };
    GlobalWorkerOptions: { workerSrc: string };
  };

  if (typeof window !== 'undefined' && pdfjsNamespace.GlobalWorkerOptions) {
    const version = pdfjsNamespace.version || '5.6.205';
    pdfjsNamespace.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsNamespace.getDocument({ data: arrayBuffer });
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
  } catch (err) {
    console.error('[documentExtractor] failed to read file:', file.name, err);
    return { text: '', fileName: file.name, kind: ext };
  }
}

export const isSupportedCVFile = (fileName: string) => getExtension(fileName) !== null;

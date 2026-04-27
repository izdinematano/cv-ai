import { NextResponse } from 'next/server';

/**
 * POST /api/export/pdf
 *
 * Receives the full self-contained HTML of the CV and renders it to a
 * real vector PDF using Puppeteer.  The result is a genuine PDF with
 * selectable text, not an image — identical to what the user sees on screen.
 */
export async function POST(req: Request) {
  try {
    const { html, fileName } = await req.json();

    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'HTML em falta.' }, { status: 400 });
    }

    // Dynamic import so the build doesn't fail on environments without Puppeteer.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ],
    });

    const page = await browser.newPage();

    // Set viewport to A4 width (210mm ≈ 794px at 96dpi)
    await page.setViewport({ width: 794, height: 1123 });

    // Load the self-contained HTML with all styles inlined
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });

    // Wait a bit for web fonts to load
    await page.evaluate(() => document.fonts?.ready);

    // Generate real vector PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await browser.close();

    const safeName = (fileName || 'cv').replace(/[^a-zA-Z0-9._-]/g, '_');

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[PDF export] Puppeteer error:', err);
    return NextResponse.json(
      { error: 'Erro ao gerar o PDF. Verifica se o Puppeteer está instalado no servidor.' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

const TASK_MODELS: Record<string, string> = {
  translate: 'gemini-2.5-flash',
  improve: 'gemini-2.5-flash',
  import: 'gemini-2.5-flash',
  recommend: 'gemini-2.5-flash',
};

export async function GET() {
  return NextResponse.json({ configured: !!GEMINI_API_KEY });
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { task, prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const model = TASK_MODELS[task] || 'gemini-1.5-flash';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Gemini API error:', response.status, errorText);
      return NextResponse.json(
        {
          error: `Gemini API error: ${response.status}`,
          status: response.status,
          detail: errorText.slice(0, 500),
          model,
        },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const content = String(payload?.choices?.[0]?.message?.content || '').trim();

    return NextResponse.json({ content });
  } catch (err) {
    console.error('AI route error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

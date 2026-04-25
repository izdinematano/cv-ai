import { NextResponse } from 'next/server';
import { getAllExports, createExport } from '@/lib/serverDb';
import type { ExportRecord } from '@/store/useAppStore';

export async function GET() {
  try {
    const exports = await getAllExports();
    return NextResponse.json({ exports });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, cvId, cvName, paid } = body;

    const record: ExportRecord = {
      id: Math.random().toString(36).slice(2, 11),
      userId,
      cvId,
      cvName,
      createdAt: new Date().toISOString(),
      paid: paid || false,
    };

    await createExport(record);
    return NextResponse.json({ ok: true, record });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

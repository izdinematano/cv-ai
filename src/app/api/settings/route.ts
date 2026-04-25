import { NextResponse } from 'next/server';
import { getAdminSettings, updateAdminSettings } from '@/lib/serverDb';

export async function GET() {
  try {
    const settings = await getAdminSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const patch = await req.json();
    const updated = await updateAdminSettings(patch);
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

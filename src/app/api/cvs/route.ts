import { NextResponse } from 'next/server';
import { getUserCVs, saveUserCV, deleteUserCV } from '@/lib/serverDb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const cvs = await getUserCVs(userId);
    return NextResponse.json({ cvs });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, cv } = body;
    if (!userId || !cv) {
      return NextResponse.json({ ok: false, error: 'Missing userId or cv' }, { status: 400 });
    }
    const saved = await saveUserCV(userId, cv);
    return NextResponse.json({ ok: true, cv: saved });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const cvId = searchParams.get('cvId');
    if (!userId || !cvId) {
      return NextResponse.json({ ok: false, error: 'Missing userId or cvId' }, { status: 400 });
    }
    await deleteUserCV(userId, cvId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

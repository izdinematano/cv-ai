import { NextResponse } from 'next/server';
import { getAllExtraCredits } from '@/lib/serverDb';

export async function GET() {
  try {
    const extraCredits = await getAllExtraCredits();
    return NextResponse.json({ extraCredits });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

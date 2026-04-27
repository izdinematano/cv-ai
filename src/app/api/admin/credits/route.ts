import { NextResponse } from 'next/server';
import { addExtraCredits } from '@/lib/serverDb';

/**
 * POST /api/admin/credits
 * Body: { userId: string, amount: number }
 * Adds `amount` credits to the given user. Amount can be negative to remove credits.
 */
export async function POST(req: Request) {
  try {
    const { userId, amount } = (await req.json()) as { userId?: string; amount?: number };
    if (!userId || amount == null || !Number.isFinite(amount)) {
      return NextResponse.json({ ok: false, error: 'userId and numeric amount required' }, { status: 400 });
    }

    const newTotal = await addExtraCredits(userId, Math.round(amount));
    return NextResponse.json({ ok: true, credits: newTotal });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

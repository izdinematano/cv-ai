import { NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/lib/serverDb';

/**
 * Promote an existing user to admin by email.
 * Useful for the initial setup or when you need to grant admin access
 * without going through the UI flow.
 *
 * POST /api/admin/promote  { email: string }
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const updated = await updateUser(user.id, { role: 'admin' });
    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

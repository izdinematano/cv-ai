import { NextResponse } from 'next/server';
import { updateUser, deleteUser } from '@/lib/serverDb';

/**
 * Admin user management endpoints.
 *
 * DELETE /api/admin/users  { userId: string }
 * PATCH  /api/admin/users  { userId: string, action: 'reset-password', newPassword: string }
 */

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Missing userId' }, { status: 400 });
    }
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, action, newPassword } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ ok: false, error: 'Missing userId or action' }, { status: 400 });
    }

    if (action === 'reset-password') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const updated = await updateUser(userId, { password: newPassword });
      if (!updated) {
        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, user: updated });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

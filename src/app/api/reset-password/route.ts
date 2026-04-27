import { NextResponse } from 'next/server';
import { findUserByResetToken, updateUser } from '@/lib/serverDb';

/**
 * Reset password: POST /api/reset-password { token, newPassword }
 */
export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ ok: false, error: 'Token ou senha em falta.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ ok: false, error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const user = await findUserByResetToken(token);
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Token inválido ou expirado.' }, { status: 404 });
    }

    // Check expiry
    if (user.resetTokenExpiresAt && new Date(user.resetTokenExpiresAt) < new Date()) {
      return NextResponse.json({ ok: false, error: 'Token expirado. Solicita novo pedido.' }, { status: 410 });
    }

    await updateUser(user.id, {
      password: newPassword,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    });

    return NextResponse.json({ ok: true, message: 'Senha alterada com sucesso.' });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

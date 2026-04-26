import { NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/lib/serverDb';

/**
 * Simple password reset: POST /api/forgot-password { email }
 *
 * For now this generates a temporary password and returns it in the response.
 * In production you'd send an email instead. The user can then login with
 * the temporary password and change it later.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Insere o teu email.' }, { status: 400 });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({
        ok: true,
        message: 'Se o email existir no sistema, receberás instruções para repor a senha.',
      });
    }

    // Generate a simple temporary password
    const tempPassword = 'temp-' + Math.random().toString(36).slice(2, 8);
    await updateUser(user.id, { password: tempPassword });

    return NextResponse.json({
      ok: true,
      message: 'Se o email existir no sistema, receberás instruções para repor a senha.',
      // In production, remove this and send via email instead
      _tempPassword: tempPassword,
      _hint: 'Contacta o admin via WhatsApp para receber a nova senha temporária.',
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

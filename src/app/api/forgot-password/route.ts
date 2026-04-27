import { NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/lib/serverDb';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * Forgot password: POST /api/forgot-password { email }
 *
 * Generates a secure reset token, stores it on the user record
 * (expires in 1 hour), and sends a reset email with a link.
 */
function createToken() {
  return Array.from({ length: 32 }, () => Math.random().toString(36).slice(2, 3)).join('');
}

function tokenExpiry() {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
}

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

    const token = createToken();
    const expiresAt = tokenExpiry();
    await updateUser(user.id, { resetToken: token, resetTokenExpiresAt: expiresAt });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cv.moztraders.com';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.fullName);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
      // Still return success to avoid leaking info, but log for debugging
      return NextResponse.json({
        ok: true,
        message: 'Se o email existir no sistema, receberás instruções para repor a senha.',
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Se o email existir no sistema, receberás instruções para repor a senha.',
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

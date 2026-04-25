import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/serverDb';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Preenche todos os campos.' }, { status: 400 });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return NextResponse.json({ ok: false, error: 'Credenciais invalidas.' }, { status: 401 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

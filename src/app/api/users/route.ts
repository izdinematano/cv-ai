import { NextResponse } from 'next/server';
import { getAllUsers, findUserByEmail, createUser } from '@/lib/serverDb';
import type { AppUser } from '@/store/useAppStore';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;
    if (!email || !password || !fullName) {
      return NextResponse.json({ ok: false, error: 'Preenche todos os campos.' }, { status: 400 });
    }

    const existing = await findUserByEmail(email.trim().toLowerCase());
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Email ja registado.' }, { status: 409 });
    }

    const user: AppUser = {
      id: Math.random().toString(36).slice(2, 11),
      email: email.trim().toLowerCase(),
      fullName,
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await createUser(user);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

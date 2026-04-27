import { NextResponse } from 'next/server';
import { jwtVerify, createLocalJWKSet } from 'jose';
import { findUserByEmail, createUser } from '@/lib/serverDb';
import type { AppUser } from '@/store/useAppStore';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/** Fetch Google's public JWKS so we can verify the ID token signature. */
async function getGoogleJwks() {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch Google JWKS');
  return createLocalJWKSet(await res.json());
}

export async function POST(req: Request) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ ok: false, error: 'Google OAuth not configured' }, { status: 500 });
    }

    const { credential } = (await req.json()) as { credential?: string };
    if (!credential) {
      return NextResponse.json({ ok: false, error: 'Missing credential' }, { status: 400 });
    }

    const googleJwks = await getGoogleJwks();
    const { payload } = await jwtVerify(credential, googleJwks, {
      issuer: 'https://accounts.google.com',
      audience: GOOGLE_CLIENT_ID,
      clockTolerance: 60,
    });

    const p = payload as unknown as GoogleIdTokenPayload;
    if (!p.email_verified) {
      return NextResponse.json({ ok: false, error: 'Email não verificado pelo Google.' }, { status: 403 });
    }

    const email = p.email.toLowerCase().trim();
    const fullName = p.name || p.given_name || 'Utilizador Google';

    // Find or create local user
    let user: AppUser | undefined = await findUserByEmail(email);
    if (!user) {
      const newUser: AppUser = {
        id: `google_${p.sub}`,
        email,
        fullName,
        password: `google_oauth_${Math.random().toString(36).slice(2)}`,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      user = await createUser(newUser);
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('[Google OAuth]', err);
    return NextResponse.json(
      { ok: false, error: 'Falha na autenticação Google. Tenta novamente.' },
      { status: 401 }
    );
  }
}

import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/siteConfig';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1020 0%, #312e81 100%)',
          padding: 80,
          fontFamily: 'Inter, system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)',
            filter: 'blur(80px)',
            top: -180,
            right: -140,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(79,70,229,0.35)',
              }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0l1.582 6.135a2 2 0 0 0 1.437 1.437l6.135 1.582a.5.5 0 0 1 0 .962l-6.135 1.581a2 2 0 0 0-1.437 1.438l-1.582 6.134a.5.5 0 0 1-.962 0z" />
              </svg>
            </div>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              CV-Gen <span style={{ color: '#818cf8' }}>AI</span>
            </span>
          </div>

          <h1
            style={{
              fontSize: 62,
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 900,
              marginBottom: 24,
            }}
          >
            O teu CV profissional,
            <br />
            <span style={{ color: '#c7d2fe' }}>criado com IA</span> em minutos
          </h1>

          <p
            style={{
              fontSize: 22,
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.5,
              maxWidth: 780,
            }}
          >
            Editor bilingue PT/EN, sugestões inteligentes em cada campo e templates premium.
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}

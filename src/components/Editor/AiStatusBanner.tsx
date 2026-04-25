'use client';

/**
 * Compact AI status banner shown at the top of the editor content tab.
 * Pings /api/ai (GET) on mount to detect whether the Gemini key is
 * configured server-side. Gives the user a clear, immediate signal that
 * the AI features (improve, import, tailor) are or aren't available.
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';

export default function AiStatusBanner() {
  const [status, setStatus] = useState<'loading' | 'on' | 'off'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ai')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setStatus(d?.configured ? 'on' : 'off');
      })
      .catch(() => {
        if (!cancelled) setStatus('off');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div style={containerStyle('rgba(99,102,241,0.08)', 'rgba(99,102,241,0.25)')}>
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>A verificar AI...</span>
      </div>
    );
  }

  if (status === 'on') {
    return (
      <div style={containerStyle('rgba(5,150,105,0.10)', 'rgba(5,150,105,0.30)')}>
        <Sparkles size={16} color="var(--success)" aria-hidden="true" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
            IA Activa
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--foreground-muted)' }}>
            Clica no ícone <Sparkles size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> em qualquer descrição para melhorar com IA.
            Importa um CV ou usa o &quot;Adaptar à vaga&quot; para sugestões automáticas.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle('rgba(217,119,6,0.10)', 'rgba(217,119,6,0.35)')}>
      <AlertTriangle size={16} color="#d97706" aria-hidden="true" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>
          IA Indisponível
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--foreground-muted)' }}>
          A IA está temporariamente indisponível. Podes continuar a editar o teu CV manualmente.
        </span>
      </div>
    </div>
  );
}

function containerStyle(bg: string, border: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    borderRadius: 12,
    background: bg,
    border: `1px solid ${border}`,
  };
}

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  background: 'rgba(0,0,0,0.05)',
  padding: '1px 5px',
  borderRadius: 4,
};

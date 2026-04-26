'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function ForgotPasswordPage() {
  const { adminSettings } = useAppStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus('sent');
        setMessage(json.message || 'Instruções enviadas.');
      } else {
        setStatus('error');
        setMessage(json.error || 'Ocorreu um erro.');
      }
    } catch {
      setStatus('error');
      setMessage('Erro de ligação. Tenta novamente.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: 36,
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <KeyRound size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Esqueci a senha</h1>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              Reposição de palavra-passe
            </div>
          </div>
        </div>

        {status === 'sent' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 10,
                padding: 16,
                fontSize: 13,
                color: '#059669',
                lineHeight: 1.6,
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{message}</div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: 16,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                background: 'rgba(37,211,102,0.06)',
                border: '1px solid rgba(37,211,102,0.2)',
              }}
            >
              <MessageCircle size={20} color="#25d366" />
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                <strong>Contacta o suporte via WhatsApp</strong> para receber a tua nova senha temporária:
                <br />
                <a
                  href={`https://wa.me/${adminSettings.whatsappNumber.replace(/\D/g, '')}?text=Olá, esqueci a minha senha. O meu email é: ${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#25d366', fontWeight: 700 }}
                >
                  {adminSettings.whatsappNumber}
                </a>
              </div>
            </div>

            <Link
              href="/login"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13.5, color: 'var(--foreground-muted)', lineHeight: 1.55 }}>
              Insere o email da tua conta. Vamos gerar uma senha temporária que podes obter via WhatsApp com o suporte.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@exemplo.com"
                  required
                />
              </div>

              {status === 'error' && message && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12.5,
                    color: '#991b1b',
                  }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={status === 'loading'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> A processar...
                  </>
                ) : (
                  'Repor senha'
                )}
              </button>
            </form>
          </>
        )}

        <Link
          href="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--foreground-muted)',
            marginTop: 4,
          }}
        >
          <ArrowLeft size={12} /> Voltar ao login
        </Link>
      </div>
    </div>
  );
}

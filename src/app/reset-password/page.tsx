'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetLoading />}>
      <ResetForm />
    </Suspense>
  );
}

function ResetLoading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="glass-card" style={{ padding: 36, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Loader2 size={20} className="animate-spin" />
        <span>A carregar...</span>
      </div>
    </div>
  );
}

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link inválido ou expirado. Volta a solicitar a reposição de senha.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 6) {
      setStatus('error');
      setMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setMessage('As senhas não coincidem.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus('success');
        setMessage(json.message || 'Senha alterada com sucesso.');
      } else {
        setStatus('error');
        setMessage(json.error || 'Ocorreu um erro. Tenta novamente.');
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
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Repor senha</h1>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              Cria uma nova senha
            </div>
          </div>
        </div>

        {status === 'success' ? (
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
            <Link
              href="/login"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Entrar agora
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div className="form-group">
              <label>Nova senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repete a senha"
                minLength={6}
                required
              />
            </div>

            {status === 'error' && message && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                  color: '#fecaca',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>{message}</div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={status === 'loading' || !token}
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
                  <Loader2 size={16} className="animate-spin" /> A guardar...
                </>
              ) : (
                'Guardar nova senha'
              )}
            </button>
          </form>
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

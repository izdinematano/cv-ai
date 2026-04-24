'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register, users } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';
  const isFirstUser = isRegister && users.length === 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const result = isRegister
      ? register({ email, password, fullName })
      : login({ email, password });

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const destination = result.user.role === 'admin' ? '/admin' : '/dashboard';
    router.push(destination);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '36px',
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>CV Gen AI</h1>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              CVs profissionais em minutos
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {isRegister ? 'Criar conta' : 'Entrar'}
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            {isRegister
              ? 'Cria a tua conta e começa a criar CVs ilimitados. Pagas só quando exportares.'
              : 'Bem-vindo de volta. Entra para ver os teus CVs.'}
          </p>
        </div>

        {isFirstUser && (
          <div
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
              color: '#a7f3d0',
            }}
          >
            És o primeiro utilizador — esta conta será criada como <b>administrador</b>.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {isRegister && (
            <div className="form-group">
              <label>Nome completo</label>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Ex: Maria Nhantumbo"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@exemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: 10,
                fontSize: 12,
                color: '#fecaca',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            {isRegister ? 'Criar conta' : 'Entrar'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          {isRegister ? 'Já tens conta? ' : 'Ainda não tens conta? '}
          <Link href={isRegister ? '/login' : '/register'} style={{ color: 'var(--accent)' }}>
            {isRegister ? 'Entrar' : 'Criar conta'}
          </Link>
        </div>
      </div>
    </div>
  );
}

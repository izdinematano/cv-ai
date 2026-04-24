'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  CreditCard,
  ExternalLink,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import AuthGate from '@/components/Auth/AuthGate';
import { useAppStore } from '@/store/useAppStore';

export default function AdminPage() {
  return <AuthGate requireAdmin>{(user) => <AdminView adminEmail={user.email} />}</AuthGate>;
}

function AdminView({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const {
    payments,
    users,
    approvePayment,
    rejectPayment,
    adminSettings,
    updateAdminSettings,
    upgradeToAdmin,
    logout,
    exports,
  } = useAppStore();

  const [mpesaNumber, setMpesaNumber] = useState(adminSettings.mpesaNumber);
  const [whatsappNumber, setWhatsappNumber] = useState(adminSettings.whatsappNumber);
  const [pricePerPackMZN, setPricePerPackMZN] = useState(adminSettings.pricePerPackMZN);
  const [creditsPerPack, setCreditsPerPack] = useState(adminSettings.creditsPerPack);
  const [monthlyFreeExports, setMonthlyFreeExports] = useState(adminSettings.monthlyFreeExports);
  const [businessName, setBusinessName] = useState(adminSettings.businessName);
  const [savedFlash, setSavedFlash] = useState(false);

  const pending = payments.filter((p) => p.status === 'pending');
  const history = payments.filter((p) => p.status !== 'pending').slice(0, 10);

  const saveSettings = () => {
    updateAdminSettings({
      mpesaNumber,
      whatsappNumber,
      pricePerPackMZN: Math.max(1, Number(pricePerPackMZN) || 1),
      creditsPerPack: Math.max(1, Number(creditsPerPack) || 1),
      monthlyFreeExports: Math.max(0, Number(monthlyFreeExports) || 0),
      businessName,
    });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* HEADER */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={24} color="var(--accent)" /> Painel Admin
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              {adminEmail} · Faturacao, pagamentos, utilizadores e configuracao.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              href="/dashboard"
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 28 }}>
          <Stat label="Pagamentos pendentes" value={pending.length.toString()} icon={<CreditCard size={18} />} highlight={pending.length > 0} />
          <Stat label="Utilizadores" value={users.length.toString()} icon={<Users size={18} />} />
          <Stat label="Exports totais" value={exports.length.toString()} icon={<ExternalLink size={18} />} />
          <Stat label="Credito vendido (MZN)" value={`${payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amountMZN, 0).toLocaleString('pt-PT')}`} icon={<CreditCard size={18} />} />
        </div>

        {/* PENDING PAYMENTS */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Pagamentos pendentes</h2>
          {pending.length === 0 ? (
            <div className="glass-card" style={{ padding: 24, color: '#94a3b8', fontSize: 13 }}>
              Nenhum pagamento pendente. Pedidos de desbloqueio aparecem aqui.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map((p) => (
                <PaymentCard
                  key={p.id}
                  payment={p}
                  onApprove={() => approvePayment(p.id, adminEmail)}
                  onReject={() => {
                    const reason = prompt('Motivo da rejeicao (opcional):') || 'Pagamento nao confirmado';
                    rejectPayment(p.id, adminEmail, reason);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* HISTORY */}
        {history.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Historico recente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((p) => (
                <PaymentCard key={p.id} payment={p} compact />
              ))}
            </div>
          </section>
        )}

        {/* SETTINGS */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} /> Configuracao
          </h2>
          <div className="glass-card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label>Nome do negocio</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>
                <MessageCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                Numero WhatsApp (cliente envia comprovativo)
              </label>
              <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+258840000000" />
            </div>
            <div className="form-group">
              <label>
                <CreditCard size={12} style={{ display: 'inline', marginRight: 4 }} />
                Numero Mpesa (destino do pagamento)
              </label>
              <input value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} placeholder="84 000 0000" />
            </div>
            <div className="form-group">
              <label>Preco por pack (MZN)</label>
              <input type="number" value={pricePerPackMZN} onChange={(e) => setPricePerPackMZN(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Creditos por pack</label>
              <input type="number" value={creditsPerPack} onChange={(e) => setCreditsPerPack(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Exports gratuitos por mes</label>
              <input type="number" value={monthlyFreeExports} onChange={(e) => setMonthlyFreeExports(Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn-primary" onClick={saveSettings}>
                Guardar alteracoes
              </button>
              {savedFlash && (
                <span style={{ fontSize: 12, color: '#10b981' }}>
                  <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> Guardado
                </span>
              )}
            </div>
          </div>
        </section>

        {/* USERS */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Utilizadores</h2>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ textAlign: 'left', padding: 12 }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Email</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Papel</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Registado</th>
                  <th style={{ textAlign: 'right', padding: 12 }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.fullName}</td>
                    <td style={{ padding: 12, color: '#94a3b8' }}>{u.email}</td>
                    <td style={{ padding: 12 }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: u.role === 'admin' ? 'rgba(245,158,11,0.18)' : 'rgba(148,163,184,0.15)',
                          color: u.role === 'admin' ? '#fbbf24' : '#cbd5e1',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: 12, color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString('pt-PT')}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {u.role === 'user' && (
                        <button
                          className="btn-outline"
                          style={{ fontSize: 11, padding: '6px 10px' }}
                          onClick={() => {
                            if (confirm(`Tornar ${u.email} administrador?`)) {
                              upgradeToAdmin(u.id);
                            }
                          }}
                        >
                          Promover a admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        ...(highlight
          ? { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)' }
          : {}),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 12 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PaymentCard({
  payment,
  onApprove,
  onReject,
  compact,
}: {
  payment: import('@/store/useAppStore').PaymentRequest;
  onApprove?: () => void;
  onReject?: () => void;
  compact?: boolean;
}) {
  const statusColor =
    payment.status === 'approved'
      ? '#10b981'
      : payment.status === 'rejected'
      ? '#ef4444'
      : '#f59e0b';

  return (
    <div
      className="glass-card"
      style={{ padding: compact ? 12 : 16, display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}
    >
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{payment.userEmail}</div>
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 999,
              background: `${statusColor}22`,
              color: statusColor,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {payment.status}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
          <b>{payment.amountMZN} MZN</b> · {payment.credits} creditos · ref. {payment.mpesaReference || '-'} · WhatsApp {payment.whatsappNumber || '-'}
        </div>
        {payment.note && (
          <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6, fontStyle: 'italic' }}>
            “{payment.note}”
          </div>
        )}
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
          Criado em {new Date(payment.createdAt).toLocaleString('pt-PT')}
          {payment.reviewedAt && ` · Revisto em ${new Date(payment.reviewedAt).toLocaleString('pt-PT')} por ${payment.reviewerEmail}`}
          {payment.rejectionReason && ` · Motivo: ${payment.rejectionReason}`}
        </div>
      </div>
      {onApprove && onReject && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-primary"
            onClick={onApprove}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Check size={14} /> Aprovar
          </button>
          <button
            className="btn-outline"
            onClick={onReject}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--error)' }}
          >
            <X size={14} /> Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}

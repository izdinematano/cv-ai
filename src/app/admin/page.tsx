'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  CreditCard,
  ExternalLink,
  LogOut,
  MessageCircle,
  Search,
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
    cvs,
    extraCredits,
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

  const [userQuery, setUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  /** Per-user aggregates computed once for the table. Shape is { userId: {cvs, exports, credits} }. */
  const userStats = useMemo(() => {
    const map: Record<string, { cvs: number; exports: number; credits: number }> = {};
    for (const u of users) {
      map[u.id] = {
        cvs: cvs[u.id]?.length ?? 0,
        exports: exports.filter((e) => e.userId === u.id).length,
        credits: extraCredits[u.id] || 0,
      };
    }
    return map;
  }, [users, cvs, exports, extraCredits]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, userQuery, roleFilter]);

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
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="container-narrow" style={{ padding: '32px 24px 60px' }}>
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
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={26} color="var(--accent)" /> Painel Admin
            </h1>
            <p style={{ fontSize: 14, color: 'var(--foreground-muted)', marginTop: 4 }}>
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

        {/* Two rows of stats: lifetime totals on top, this-month deltas below */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
          <Stat label="Pagamentos pendentes" value={pending.length.toString()} icon={<CreditCard size={18} />} highlight={pending.length > 0} />
          <Stat label="Utilizadores" value={users.length.toString()} icon={<Users size={18} />} />
          <Stat label="Exports totais" value={exports.length.toString()} icon={<ExternalLink size={18} />} />
          <Stat label="Receita total (MZN)" value={`${payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amountMZN, 0).toLocaleString('pt-PT')}`} icon={<CreditCard size={18} />} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
          <Stat
            label="Novos utilizadores (30d)"
            value={users.filter((u) => Date.now() - new Date(u.createdAt).getTime() < 30 * 86400000).length.toString()}
            icon={<Users size={18} />}
          />
          <Stat
            label="Exports nos últimos 30d"
            value={exports.filter((e) => Date.now() - new Date(e.createdAt).getTime() < 30 * 86400000).length.toString()}
            icon={<ExternalLink size={18} />}
          />
          <Stat
            label="Receita (30d) · MZN"
            value={`${payments
              .filter((p) => p.status === 'approved' && p.reviewedAt && Date.now() - new Date(p.reviewedAt).getTime() < 30 * 86400000)
              .reduce((s, p) => s + p.amountMZN, 0)
              .toLocaleString('pt-PT')}`}
            icon={<CreditCard size={18} />}
          />
          <Stat
            label="Admins activos"
            value={users.filter((u) => u.role === 'admin').length.toString()}
            icon={<ShieldCheck size={18} />}
          />
        </div>

        {/* PENDING PAYMENTS */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Pagamentos pendentes</h2>
          {pending.length === 0 ? (
            <div className="glass-card" style={{ padding: 24, color: 'var(--foreground-muted)', fontSize: 13 }}>
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
                <span style={{ fontSize: 12, color: 'var(--success)' }}>
                  <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> Guardado
                </span>
              )}
            </div>
          </div>
        </section>

        {/* USERS */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>
              Utilizadores{' '}
              <span style={{ color: 'var(--muted-foreground)', fontWeight: 500, fontSize: 14 }}>
                ({filteredUsers.length} / {users.length})
              </span>
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={13}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted-foreground)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Pesquisar nome ou email..."
                  style={{
                    padding: '8px 10px 8px 30px',
                    fontSize: 13,
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    minWidth: 220,
                  }}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                style={{
                  padding: '8px 10px',
                  fontSize: 13,
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="all">Todos</option>
                <option value="user">Utilizadores</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>

          <div className="glass-card admin-users-wrap" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--muted)' }}>
                    <th style={{ textAlign: 'left', padding: 12 }}>Nome</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Papel</th>
                    <th style={{ textAlign: 'center', padding: 12 }}>CVs</th>
                    <th style={{ textAlign: 'center', padding: 12 }}>Exports</th>
                    <th style={{ textAlign: 'center', padding: 12 }}>Créditos</th>
                    <th style={{ textAlign: 'left', padding: 12 }}>Registado</th>
                    <th style={{ textAlign: 'right', padding: 12 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          padding: 24,
                          textAlign: 'center',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        Nenhum utilizador corresponde ao filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const stats = userStats[u.id];
                      return (
                        <tr key={u.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                          <td style={{ padding: 12, fontWeight: 600 }}>{u.fullName}</td>
                          <td style={{ padding: 12, color: 'var(--foreground-muted)' }}>{u.email}</td>
                          <td style={{ padding: 12 }}>
                            <span
                              style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: u.role === 'admin' ? '#fef3c7' : 'var(--muted)',
                                color: u.role === 'admin' ? '#92400e' : 'var(--foreground-muted)',
                                border: '1px solid transparent',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                              }}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>{stats?.cvs ?? 0}</td>
                          <td style={{ padding: 12, textAlign: 'center', fontWeight: 700 }}>{stats?.exports ?? 0}</td>
                          <td
                            style={{
                              padding: 12,
                              textAlign: 'center',
                              fontWeight: 700,
                              color: (stats?.credits ?? 0) > 0 ? 'var(--accent)' : 'var(--muted-foreground)',
                            }}
                          >
                            {stats?.credits ?? 0}
                          </td>
                          <td style={{ padding: 12, color: 'var(--foreground-muted)' }}>
                            {new Date(u.createdAt).toLocaleDateString('pt-PT')}
                          </td>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
          ? { background: '#fffbeb', border: '1px solid #fde68a' }
          : {}),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</div>
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
      ? '#059669'
      : payment.status === 'rejected'
      ? '#dc2626'
      : '#d97706';

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
        <div style={{ fontSize: 12, color: 'var(--foreground-muted)', marginTop: 4 }}>
          <b>{payment.amountMZN} MZN</b> · {payment.credits} creditos · ref. {payment.mpesaReference || '-'} · WhatsApp {payment.whatsappNumber || '-'}
        </div>
        {payment.note && (
          <div style={{ fontSize: 11, color: 'var(--foreground-muted)', marginTop: 6, fontStyle: 'italic' }}>
            “{payment.note}”
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import AuthGate from '@/components/Auth/AuthGate';
import { useAppStore } from '@/store/useAppStore';
import TemplateBuilder from '@/components/Admin/TemplateBuilder/TemplateBuilder';
import Preview from '@/components/Preview/Preview';
import { createShowcaseCVData, visibleTemplates } from '@/lib/templateCatalog';

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
    deleteUser,
    resetUserPassword,
    logout,
    exports,
    cvs,
    extraCredits,
    customTemplates,
    createCustomTemplate,
    cloneBuiltInTemplate,
    deleteCustomTemplate,
    duplicateCustomTemplate,
    publishCustomTemplate,
    syncFromServer,
  } = useAppStore();

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  const [builderId, setBuilderId] = useState<string | null>(null);
  const [clonePickerOpen, setClonePickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'settings' | 'users' | 'marketing'>('overview');

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTarget, setEmailTarget] = useState<'all' | 'active' | 'inactive'>('all');
  const [emailSent, setEmailSent] = useState(false);

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

  const saveSettings = async () => {
    await updateAdminSettings({
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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/editor"
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <FileText size={14} /> Editor
            </Link>
            <Link
              href="/dashboard"
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <LayoutDashboard size={14} /> Dashboard
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

        {/* TAB NAV */}
        <nav
          style={{
            display: 'flex',
            gap: 2,
            marginBottom: 24,
            borderBottom: '2px solid var(--card-border)',
            overflowX: 'auto',
          }}
        >
          {[
            { key: 'overview' as const, label: 'Visão geral', icon: <ShieldCheck size={14} /> },
            { key: 'templates' as const, label: 'Templates', icon: <LayoutTemplate size={14} /> },
            { key: 'settings' as const, label: 'Configuração', icon: <Settings size={14} /> },
            { key: 'users' as const, label: 'Utilizadores', icon: <Users size={14} /> },
            { key: 'marketing' as const, label: 'Marketing', icon: <Megaphone size={14} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: activeTab === t.key ? 800 : 500,
                color: activeTab === t.key ? 'var(--accent)' : 'var(--foreground-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: -2,
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {/* ====== OVERVIEW TAB ====== */}
        {activeTab === 'overview' && (<>
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

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => setActiveTab('templates')}
            className="glass-card"
            style={{ padding: 18, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <LayoutTemplate size={20} color="var(--accent)" />
            <div style={{ fontSize: 13, fontWeight: 700 }}>Gerir Templates</div>
            <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>{customTemplates.length} customizados</div>
          </button>
          <button
            onClick={() => { const created = createCustomTemplate(); setBuilderId(created.id); }}
            className="glass-card"
            style={{ padding: 18, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Plus size={20} color="#10b981" />
            <div style={{ fontSize: 13, fontWeight: 700 }}>Novo Template</div>
            <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>Abrir builder visual</div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="glass-card"
            style={{ padding: 18, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Settings size={20} color="#f59e0b" />
            <div style={{ fontSize: 13, fontWeight: 700 }}>Configurações</div>
            <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>Preços, créditos, WhatsApp</div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className="glass-card"
            style={{ padding: 18, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Users size={20} color="#8b5cf6" />
            <div style={{ fontSize: 13, fontWeight: 700 }}>Utilizadores</div>
            <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>{users.length} registados</div>
          </button>
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
                  onApprove={async () => {
                    await approvePayment(p.id, adminEmail);
                    await syncFromServer();
                  }}
                  onReject={async () => {
                    const reason = prompt('Motivo da rejeicao (opcional):') || 'Pagamento nao confirmado';
                    await rejectPayment(p.id, adminEmail, reason);
                    await syncFromServer();
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

        </>)}

        {/* ====== TEMPLATES TAB ====== */}
        {activeTab === 'templates' && (<>
        <section style={{ marginBottom: 32 }}>
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
            <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <LayoutTemplate size={18} /> Templates customizados{' '}
              <span style={{ fontSize: 12, color: 'var(--foreground-muted)', fontWeight: 500 }}>
                ({customTemplates.length})
              </span>
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn-outline"
                onClick={() => setClonePickerOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Copy size={14} aria-hidden="true" /> Clonar existente
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const created = createCustomTemplate();
                  setBuilderId(created.id);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} aria-hidden="true" /> Novo template
              </button>
            </div>
          </div>

          {customTemplates.length === 0 ? (
            <div className="glass-card" style={{ padding: 24, color: 'var(--foreground-muted)', fontSize: 13 }}>
              Ainda não criaste nenhum template. Clica em <strong>Novo template</strong> para
              abrir o construtor visual e desenhar um CV de raíz.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {customTemplates.map((t) => (
                <div
                  key={t.id}
                  className="glass-card"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    style={{
                      height: 160,
                      overflow: 'hidden',
                      background: 'var(--background-muted)',
                      borderBottom: '1px solid var(--card-border)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        transform: 'scale(0.2)',
                        transformOrigin: 'top left',
                        width: '500%',
                        pointerEvents: 'none',
                      }}
                    >
                      <Preview
                        templateOverride={t.id}
                        dataOverride={createShowcaseCVData('creative')}
                      />
                    </div>
                  </div>
                  <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={{ fontSize: 14 }}>{t.name}</strong>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: t.published ? 'rgba(5,150,105,0.12)' : 'rgba(148,163,184,0.18)',
                          color: t.published ? 'var(--success)' : 'var(--foreground-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: 0.4,
                        }}
                      >
                        {t.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>
                      {t.blocks.length} blocos · Atualizado {new Date(t.updatedAt).toLocaleDateString('pt-PT')}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <button
                        className="btn-primary"
                        style={{ flex: 1, fontSize: 12, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => setBuilderId(t.id)}
                        aria-label={`Editar template ${t.name}`}
                      >
                        <Pencil size={12} aria-hidden="true" /> Editar
                      </button>
                      <button
                        className="btn-outline"
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        onClick={() => publishCustomTemplate(t.id, !t.published)}
                        aria-label={t.published ? 'Despublicar' : 'Publicar'}
                      >
                        <Eye size={12} aria-hidden="true" />
                      </button>
                      <button
                        className="btn-outline"
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        onClick={() => {
                          const copy = duplicateCustomTemplate(t.id);
                          if (copy) setBuilderId(copy.id);
                        }}
                        aria-label="Duplicar"
                      >
                        <Copy size={12} aria-hidden="true" />
                      </button>
                      <button
                        className="btn-outline"
                        style={{ fontSize: 12, padding: '6px 10px', color: 'var(--error)', borderColor: 'var(--error)' }}
                        onClick={() => {
                          if (confirm(`Apagar template "${t.name}"?`)) deleteCustomTemplate(t.id);
                        }}
                        aria-label="Apagar"
                      >
                        <Trash2 size={12} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        </>)}

        {/* ====== SETTINGS TAB ====== */}
        {activeTab === 'settings' && (<>
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={18} /> Configuração
          </h2>

          {/* M-Pesa Payment Settings */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 20, borderLeft: '4px solid #e21a22' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <img src="/mpesa-logo.png" alt="M-Pesa" width={20} height={20} style={{ objectFit: 'contain', borderRadius: 4 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>M-Pesa — Pagamento</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div className="form-group">
                <label>
                  <CreditCard size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Número M-Pesa (destino)
                </label>
                <input value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} placeholder="84 000 0000" />
              </div>
              <div className="form-group">
                <label>
                  <MessageCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                  WhatsApp (comprovativo)
                </label>
                <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+258840000000" />
              </div>
              <div className="form-group">
                <label>Preço por pack (MZN)</label>
                <input type="number" value={pricePerPackMZN} onChange={(e) => setPricePerPackMZN(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Créditos por pack</label>
                <input type="number" value={creditsPerPack} onChange={(e) => setCreditsPerPack(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="glass-card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label>Nome do negócio</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Exports gratuitos por mês</label>
              <input type="number" value={monthlyFreeExports} onChange={(e) => setMonthlyFreeExports(Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn-primary" onClick={saveSettings}>
                Guardar alterações
              </button>
              {savedFlash && (
                <span style={{ fontSize: 12, color: 'var(--success)' }}>
                  <Check size={12} style={{ display: 'inline', marginRight: 4 }} /> Guardado
                </span>
              )}
            </div>
          </div>
        </section>

        </>)}

        {/* ====== USERS TAB ====== */}
        {activeTab === 'users' && (<>
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
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button
                                className="btn-outline"
                                style={{ fontSize: 10, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', borderColor: '#10b981' }}
                                onClick={async () => {
                                  const raw = prompt(`Quantos créditos adicionar a ${u.email}? (número positivo para adicionar, negativo para remover)`);
                                  if (!raw) return;
                                  const amount = parseInt(raw, 10);
                                  if (isNaN(amount) || amount === 0) { alert('Valor inválido.'); return; }
                                  try {
                                    const res = await fetch('/api/admin/credits', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: u.id, amount }),
                                    });
                                    const json = await res.json();
                                    if (json.ok) {
                                      alert(`Créditos atualizados! ${u.email} agora tem ${json.credits} créditos.`);
                                      await syncFromServer();
                                    } else {
                                      alert(json.error || 'Erro ao atribuir créditos.');
                                    }
                                  } catch { alert('Erro de ligação ao servidor.'); }
                                }}
                              >
                                <CreditCard size={10} /> Créditos
                              </button>
                              {u.role === 'user' && (
                                <button
                                  className="btn-outline"
                                  style={{ fontSize: 10, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                                  onClick={() => {
                                    if (confirm(`Tornar ${u.email} administrador?`)) {
                                      upgradeToAdmin(u.id);
                                    }
                                  }}
                                >
                                  <ShieldCheck size={10} /> Admin
                                </button>
                              )}
                              <button
                                className="btn-outline"
                                style={{ fontSize: 10, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                                onClick={async () => {
                                  const pwd = prompt(`Nova senha para ${u.email} (min 6 chars):`);
                                  if (pwd && pwd.length >= 6) {
                                    await resetUserPassword(u.id, pwd);
                                    alert(`Senha de ${u.email} alterada com sucesso.`);
                                  } else if (pwd) {
                                    alert('A senha deve ter pelo menos 6 caracteres.');
                                  }
                                }}
                              >
                                <KeyRound size={10} /> Senha
                              </button>
                              {u.email !== adminEmail && (
                                <button
                                  className="btn-outline"
                                  style={{ fontSize: 10, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--error)', borderColor: 'var(--error)' }}
                                  onClick={async () => {
                                    if (confirm(`Tens a certeza que queres apagar ${u.email}? Esta acção é irreversível.`)) {
                                      await deleteUser(u.id);
                                      await syncFromServer();
                                    }
                                  }}
                                >
                                  <UserMinus size={10} /> Apagar
                                </button>
                              )}
                            </div>
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
        </>)}

        {/* ====== MARKETING TAB ====== */}
        {activeTab === 'marketing' && (<>
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Megaphone size={18} /> Marketing & Comunicação
          </h2>

          <div className="glass-card" style={{ padding: 22, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} color="var(--accent)" /> Enviar email em massa
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="form-group">
                  <label>Destinatários</label>
                  <select
                    value={emailTarget}
                    onChange={(e) => setEmailTarget(e.target.value as typeof emailTarget)}
                    style={{
                      padding: '10px 12px',
                      fontSize: 13,
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <option value="all">Todos os utilizadores ({users.length})</option>
                    <option value="active">Activos (com CVs) ({users.filter(u => (cvs[u.id]?.length ?? 0) > 0).length})</option>
                    <option value="inactive">Inactivos (sem CVs) ({users.filter(u => (cvs[u.id]?.length ?? 0) === 0).length})</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assunto</label>
                  <input
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Ex: Novos templates disponíveis!"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Corpo do email</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Escreve aqui a mensagem para os utilizadores..."
                  rows={6}
                  style={{
                    padding: '10px 12px',
                    fontSize: 13,
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="btn-primary"
                  disabled={!emailSubject.trim() || !emailBody.trim()}
                  onClick={() => {
                    const targetUsers = emailTarget === 'all' ? users
                      : emailTarget === 'active' ? users.filter(u => (cvs[u.id]?.length ?? 0) > 0)
                      : users.filter(u => (cvs[u.id]?.length ?? 0) === 0);
                    // In production, this would call an email API
                    console.log('Email campaign:', { subject: emailSubject, body: emailBody, recipients: targetUsers.map(u => u.email) });
                    setEmailSent(true);
                    setTimeout(() => setEmailSent(false), 3000);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Send size={14} /> Enviar para {
                    emailTarget === 'all' ? users.length
                    : emailTarget === 'active' ? users.filter(u => (cvs[u.id]?.length ?? 0) > 0).length
                    : users.filter(u => (cvs[u.id]?.length ?? 0) === 0).length
                  } utilizadores
                </button>
                {emailSent && (
                  <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Campanha enviada!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Email list */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="var(--accent)" /> Lista de emails ({users.length})
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                maxHeight: 200,
                overflowY: 'auto',
                padding: 4,
              }}
            >
              {users.map((u) => (
                <span
                  key={u.id}
                  style={{
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'var(--muted)',
                    color: 'var(--foreground-muted)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  {u.email}
                </span>
              ))}
            </div>
            <button
              className="btn-outline"
              style={{ marginTop: 12, fontSize: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                const emails = users.map(u => u.email).join(', ');
                navigator.clipboard.writeText(emails);
                alert('Emails copiados para a área de transferência!');
              }}
            >
              <Copy size={12} /> Copiar todos os emails
            </button>
          </div>
        </section>
        </>)}
      </div>

      {builderId && (
        <TemplateBuilder templateId={builderId} onClose={() => setBuilderId(null)} />
      )}

      {clonePickerOpen && (
        <ClonePickerModal
          onClose={() => setClonePickerOpen(false)}
          onPick={(id, name, accent) => {
            const cloned = cloneBuiltInTemplate(id, name, accent);
            setClonePickerOpen(false);
            setBuilderId(cloned.id);
          }}
        />
      )}
    </div>
  );
}

function ClonePickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (id: string, name: string, accent: string) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clone-picker-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 960,
          maxHeight: '85vh',
          overflow: 'auto',
          padding: 24,
          borderRadius: 20,
          background: 'var(--background)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h2 id="clone-picker-title" style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              Clonar template existente
            </h2>
            <p style={{ fontSize: 12, color: 'var(--foreground-muted)', marginTop: 4 }}>
              Escolhe um dos templates built-in. Criamos uma cópia editável no builder —
              o original fica intacto.
            </p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="btn-outline" style={{ padding: '6px 10px' }}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {visibleTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id, t.name, t.accentColor)}
              className="glass-card"
              style={{
                padding: 0,
                overflow: 'hidden',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: 120,
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${t.accentColor} 0%, #0f172a 100%)`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 'auto 12px 12px 12px',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  {t.badge}
                </div>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--foreground-muted)', marginTop: 2 }}>
                  {t.tone}
                </div>
              </div>
            </button>
          ))}
        </div>
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
          <img src="/mpesa-logo.png" alt="M-Pesa" width={22} height={22} style={{ objectFit: 'contain', borderRadius: 4 }} />
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


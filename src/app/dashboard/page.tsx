'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  FilePlus2,
  FileText,
  LogOut,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import AuthGate from '@/components/Auth/AuthGate';
import { useAppStore } from '@/store/useAppStore';
import { useCVStore } from '@/store/useCVStore';

export default function DashboardPage() {
  return <AuthGate>{(user) => <DashboardView userId={user.id} role={user.role} />}</AuthGate>;
}

function DashboardView({ userId, role }: { userId: string; role: 'user' | 'admin' }) {
  const router = useRouter();
  const {
    getUserCVs,
    deleteCV,
    upsertCV,
    logout,
    remainingFreeExports,
    totalAvailableExports,
    getMonthlyExports,
    adminSettings,
    extraCredits,
    users,
  } = useAppStore();
  const { data, setData, setCurrentCvId, resetTemplateSelection, completeTemplateSelection } = useCVStore();

  const user = users.find((u) => u.id === userId);
  const cvs = getUserCVs(userId);
  const sorted = [...cvs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const used = getMonthlyExports(userId);
  const freeLeft = remainingFreeExports(userId);
  const total = totalAvailableExports(userId);
  const credits = extraCredits[userId] || 0;

  const handleCreate = () => {
    const created = upsertCV(userId, {
      name: `CV ${new Date().toLocaleDateString('pt-PT')}`,
      data,
    });
    setCurrentCvId(created.id);
    resetTemplateSelection();
    router.push(`/editor?cv=${created.id}`);
  };

  const handleOpen = (cvId: string) => {
    const cv = cvs.find((item) => item.id === cvId);
    if (!cv) return;
    setData(cv.data);
    setCurrentCvId(cv.id);
    completeTemplateSelection();
    router.push(`/editor?cv=${cv.id}`);
  };

  const handleDelete = (cvId: string) => {
    if (!confirm('Apagar este CV?')) return;
    deleteCV(userId, cvId);
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
            <h1 style={{ fontSize: 26, fontWeight: 700 }}>
              Olá, {user?.fullName?.split(' ')[0] || 'pro'} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Gere os teus CVs, acompanha a tua quota e exporta quando quiseres.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {role === 'admin' && (
              <Link href="/admin" className="btn-outline" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Shield size={14} /> Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <LogOut size={14} /> Sair
            </button>
          </div>
        </header>

        {/* STATS */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          <StatCard
            icon={<FileText size={18} />}
            label="CVs guardados"
            value={cvs.length.toString()}
          />
          <StatCard
            icon={<Sparkles size={18} />}
            label="Exports gratuitos este mes"
            value={`${freeLeft} / ${adminSettings.monthlyFreeExports}`}
            sub={`${used} usados`}
          />
          <StatCard
            icon={<CreditCard size={18} />}
            label="Creditos extra"
            value={credits.toString()}
            sub={credits > 0 ? 'pagos pelo utilizador' : 'pagar para adicionar'}
          />
          <StatCard
            icon={<Sparkles size={18} />}
            label="Total disponivel"
            value={total.toString()}
            sub="exports disponiveis"
            accent
          />
        </section>

        {/* CVS */}
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Os meus CVs</h2>
            <button
              onClick={handleCreate}
              className="btn-primary"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <Plus size={16} /> Novo CV
            </button>
          </div>

          {sorted.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: 40,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <FilePlus2 size={40} color="var(--accent)" />
              <div style={{ fontSize: 16, fontWeight: 600 }}>Ainda nao guardaste nenhum CV</div>
              <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 360, lineHeight: 1.55 }}>
                Cria o teu primeiro CV: importa texto, PDF ou DOCX, ou preenche do zero com ajuda da IA.
              </p>
              <button onClick={handleCreate} className="btn-primary" style={{ marginTop: 8 }}>
                Comecar agora
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 14,
              }}
            >
              {sorted.map((cv) => (
                <div
                  key={cv.id}
                  className="glass-card"
                  style={{
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'rgba(59,130,246,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={18} color="var(--accent)" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cv.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        Atualizado em {new Date(cv.updatedAt).toLocaleString('pt-PT')}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      {cv.data.experience.length} experiencia(s) · {cv.data.education.length} formacao(oes)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => handleOpen(cv.id)}
                      className="btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <Pencil size={14} /> Abrir
                    </button>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      className="btn-outline"
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...(accent
          ? {
              background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.12))',
              border: '1px solid rgba(59,130,246,0.35)',
            }
          : {}),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#94a3b8',
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</div>}
    </div>
  );
}

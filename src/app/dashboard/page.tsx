'use client';

/**
 * User dashboard – light premium rebrand.
 *
 * New in this iteration (all client-side, no schema changes):
 *  - Search field to filter saved CVs by name, template badge or job title.
 *  - Completion score per CV (percentage bar computed from filled sections).
 *  - "Duplicar" action that clones a CV via the existing upsertCV slice.
 *  - Template name badge on each card to make it scannable.
 *  - Mobile-friendly grid that gracefully stacks on small viewports.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  FilePlus2,
  FileText,
  LayoutTemplate,
  Loader2,
  LogOut,
  Pencil,
  Phone,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AuthGate from '@/components/Auth/AuthGate';
import Preview from '@/components/Preview/Preview';
import { useAppStore } from '@/store/useAppStore';
import { type CVData, useCVStore } from '@/store/useCVStore';
import { getTemplateDefinition } from '@/lib/templateCatalog';

export default function DashboardPage() {
  return <AuthGate>{(user) => <DashboardView userId={user.id} role={user.role} />}</AuthGate>;
}

/* -------------------------------------------------------------------------- */
/* Completion score                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Cheap, deterministic "how complete is this CV" score. Returns an integer
 * 0-100. Chosen signals: the 6 most impactful sections plus 2 hygiene items.
 * Any tweak to the weights should be purely cosmetic — this only drives the
 * UI bar and is not written back to the store.
 */
function computeCompletion(data: CVData): number {
  const checks: boolean[] = [
    !!data.personalInfo.fullName?.trim(),
    !!data.personalInfo.email?.trim(),
    !!data.personalInfo.jobTitle?.pt?.trim() || !!data.personalInfo.jobTitle?.en?.trim(),
    !!data.summary?.pt?.trim() || !!data.summary?.en?.trim(),
    data.experience.length > 0,
    data.education.length > 0,
    data.skills.length >= 3,
    !!data.personalInfo.photo,
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return score;
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

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
  const {
    data,
    setData,
    setCurrentCvId,
    resetTemplateSelection,
    completeTemplateSelection,
  } = useCVStore();

  const [query, setQuery] = useState('');

  const user = users.find((u) => u.id === userId);
  const cvs = getUserCVs(userId);
  const sorted = [...cvs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((cv) => {
      const title =
        cv.data.personalInfo.jobTitle?.pt ||
        cv.data.personalInfo.jobTitle?.en ||
        '';
      const def = getTemplateDefinition(cv.data.settings.template);
      return (
        cv.name.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        def.name.toLowerCase().includes(q)
      );
    });
  }, [query, sorted]);

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

  const handleDuplicate = (cvId: string) => {
    const original = cvs.find((item) => item.id === cvId);
    if (!original) return;
    // upsertCV creates a brand-new id when `id` is omitted in the payload.
    upsertCV(userId, {
      name: `${original.name} (cópia)`,
      data: JSON.parse(JSON.stringify(original.data)) as CVData,
    });
  };

  const handleDelete = (cvId: string) => {
    if (!confirm('Apagar este CV? Esta ação não pode ser desfeita.')) return;
    deleteCV(userId, cvId);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="container-narrow" style={{ padding: '32px 24px 60px' }}>
        {/* HEADER ------------------------------------------------------- */}
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
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
              Olá, {user?.fullName?.split(' ')[0] || 'pro'} 👋
            </h1>
            <p style={{ fontSize: 14, color: 'var(--foreground-muted)', marginTop: 4 }}>
              Os teus CVs, a tua quota, e tudo o que podes exportar — num sítio só.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {role === 'admin' && (
              <Link
                href="/admin"
                className="btn-outline"
                style={{ display: 'flex', gap: 8, alignItems: 'center' }}
              >
                <Shield size={14} /> Admin
              </Link>
            )}
            <Link
              href="/editor"
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <Pencil size={14} /> Editor
            </Link>
            <button
              onClick={handleLogout}
              className="btn-outline"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <LogOut size={14} /> Sair
            </button>
            <button
              onClick={handleCreate}
              className="btn-primary"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <Plus size={14} /> Novo CV
            </button>
          </div>
        </header>

        {/* STATS -------------------------------------------------------- */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            label="Exports gratuitos este mês"
            value={`${freeLeft} / ${adminSettings.monthlyFreeExports}`}
            sub={`${used} usados`}
          />
          <StatCard
            icon={<CreditCard size={18} />}
            label="Créditos extra"
            value={credits.toString()}
            sub={credits > 0 ? 'pagos pelo utilizador' : 'sem créditos adicionais'}
          />
          <StatCard
            icon={<Sparkles size={18} />}
            label="Total disponível"
            value={total.toString()}
            sub="exports no total"
            accent
          />
        </section>

        {/* BUY CREDITS -------------------------------------------------- */}
        <BuyCreditsCard userId={userId} />

        {/* TOOLBAR ------------------------------------------------------ */}
        <section style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Os meus CVs
            </h2>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                flex: '1 1 240px',
                maxWidth: 360,
              }}
            >
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted-foreground)',
                  pointerEvents: 'none',
                }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome, template ou cargo..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 34px',
                  fontSize: 14,
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>
        </section>

        {/* CVS ---------------------------------------------------------- */}
        {sorted.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: 44,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'var(--accent-soft)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent)',
              }}
            >
              <FilePlus2 size={26} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>
              Ainda não guardaste nenhum CV
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--foreground-muted)',
                maxWidth: 380,
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Cria o teu primeiro CV: importa PDF/DOCX, começa do zero ou
              adapta a partir de uma descrição de vaga.
            </p>
            <button onClick={handleCreate} className="btn-primary" style={{ marginTop: 8 }}>
              Começar agora
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: 28, textAlign: 'center', color: 'var(--foreground-muted)' }}
          >
            Nenhum CV corresponde à pesquisa <strong>&quot;{query}&quot;</strong>.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {filtered.map((cv) => {
              const def = getTemplateDefinition(cv.data.settings.template);
              const completion = computeCompletion(cv.data);
              const jobTitle =
                cv.data.personalInfo.jobTitle?.pt ||
                cv.data.personalInfo.jobTitle?.en ||
                '—';

              return (
                <motion.div
                  key={cv.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="dashboard-cv-card"
                  onClick={() => handleOpen(cv.id)}
                >
                  {/* Live miniature of the actual saved CV */}
                  <div className="dashboard-cv-thumb">
                    <div className="dashboard-cv-thumb-scale">
                      <Preview
                        dataOverride={cv.data}
                        templateOverride={cv.data.settings.template}
                        langOverride="pt"
                      />
                    </div>
                    <div className="dashboard-cv-thumb-fade" />
                    <div
                      className="dashboard-cv-thumb-badge"
                      style={{ background: def.accentColor || 'var(--accent)' }}
                    >
                      {def.name}
                    </div>
                  </div>

                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {cv.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--muted-foreground)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {jobTitle}
                      </div>
                    </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11.5,
                        color: 'var(--muted-foreground)',
                        marginBottom: 4,
                      }}
                    >
                      <span>Completude</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            completion >= 85
                              ? 'var(--success)'
                              : completion >= 50
                              ? 'var(--accent)'
                              : 'var(--warning)',
                        }}
                      >
                        {completion}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: 'var(--muted)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${completion}%`,
                          height: '100%',
                          background:
                            completion >= 85
                              ? 'var(--success)'
                              : completion >= 50
                              ? 'var(--accent)'
                              : 'var(--warning)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11.5,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {cv.data.experience.length} exp · {cv.data.education.length} form ·{' '}
                    Atualizado {new Date(cv.updatedAt).toLocaleDateString('pt-PT')}
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpen(cv.id);
                      }}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Pencil size={14} /> Abrir
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDuplicate(cv.id);
                      }}
                      className="btn-outline"
                      title="Duplicar"
                      aria-label="Duplicar CV"
                      style={{ padding: '10px 12px' }}
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(cv.id);
                      }}
                      className="btn-outline"
                      title="Apagar"
                      aria-label="Apagar CV"
                      style={{ padding: '10px 12px', color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* StatCard                                                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* BuyCreditsCard                                                             */
/* -------------------------------------------------------------------------- */

function BuyCreditsCard({ userId }: { userId: string }) {
  const { adminSettings, users, syncFromServer } = useAppStore();
  const user = users.find((u) => u.id === userId);

  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePay = async () => {
    if (!user || !phone.trim()) return;
    setStatus('processing');
    setMessage('');
    try {
      const res = await fetch('/api/mpesa/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          phoneNumber: phone.trim(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus('success');
        setMessage(json.message || `${adminSettings.creditsPerPack} créditos adicionados!`);
        await syncFromServer();
      } else {
        setStatus('error');
        setMessage(json.error || 'Pagamento falhou. Tenta novamente.');
      }
    } catch {
      setStatus('error');
      setMessage('Erro de ligação. Verifica a tua internet e tenta novamente.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setMessage('');
    setPhone('');
  };

  return (
    <section style={{ marginBottom: 28 }}>
      <div
        className="glass-card"
        style={{
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05))',
          border: '1px solid rgba(59,130,246,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#e21a22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src="/mpesa-logo.png" alt="M-Pesa" width={26} height={26} style={{ objectFit: 'contain', borderRadius: 4 }} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Comprar créditos via M-Pesa</h3>
            <p style={{ fontSize: 12, color: 'var(--foreground-muted)', margin: 0, marginTop: 2 }}>
              {adminSettings.creditsPerPack} exportações por {adminSettings.pricePerPackMZN} MZN — créditos não expiram.
            </p>
          </div>
        </div>

        {status === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 10,
                padding: 14,
                fontSize: 13,
                color: '#6ee7b7',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
            <button className="btn-outline" onClick={handleReset} style={{ fontSize: 13 }}>
              Comprar mais
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label style={{ fontSize: 12 }}>Número M-Pesa</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="84 000 0000"
                disabled={status === 'processing'}
                style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.05em' }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handlePay}
              disabled={!phone.trim() || status === 'processing'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                cursor: status === 'processing' ? 'wait' : 'pointer',
              }}
            >
              {status === 'processing' ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> A processar...
                </>
              ) : (
                <>
                  <Phone size={14} /> Pagar {adminSettings.pricePerPackMZN} MZN
                </>
              )}
            </button>
          </div>
        )}

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

        <div style={{ fontSize: 11.5, color: 'var(--foreground-muted)', lineHeight: 1.5 }}>
          Receberás um pedido USSD no telemóvel para confirmar com o teu PIN. Os créditos são adicionados automaticamente.
        </div>
      </div>
    </section>
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
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
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
          color: accent ? 'rgba(255,255,255,0.82)' : 'var(--muted-foreground)',
          fontWeight: 600,
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: accent ? 'white' : 'var(--foreground)',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 11.5,
            color: accent ? 'rgba(255,255,255,0.72)' : 'var(--muted-foreground)',
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * Landing page — light premium rebrand.
 *
 * Design intent:
 *  - Clean white surface, indigo accent (matches --accent tokens in globals).
 *  - Mobile-first: every section collapses to a single column below ~720px.
 *  - Three carefully picked featured templates, rendered with the live
 *    <Preview /> component so what the user sees on the homepage is exactly
 *    what the editor will render.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  LayoutDashboard,
  LogIn,
  Menu,
  Quote,
  Sparkles,
  Star,
  Wand2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Preview from '@/components/Preview/Preview';
import { useAppStore } from '@/store/useAppStore';
import { useCVStore } from '@/store/useCVStore';
import {
  createShowcaseCVData,
  getTemplateDefinition,
} from '@/lib/templateCatalog';

/**
 * Three picks that together showcase the stylistic range of the catalog:
 *  - Onyx (cv5)          → bold modern / tech
 *  - Magazine (resume2)  → editorial / creative
 *  - Atlas (atlas)       → structured / consulting
 */
const FEATURED_LANDING_TEMPLATES = ['cv5', 'resume2', 'atlas'] as const;

export default function LandingPage() {
  const router = useRouter();
  const { setTemplate, completeTemplateSelection } = useCVStore();
  const { currentUserId, users } = useAppStore();
  const currentUser = currentUserId
    ? users.find((u) => u.id === currentUserId) ?? null
    : null;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setTemplate(templateId);
    completeTemplateSelection();
    router.push('/editor');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <TopNav
        currentUser={currentUser}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      <Hero />

      <LogosBand />

      <FeaturedTemplates onSelect={handleTemplateSelect} />

      <HowItWorks />

      <FeatureGrid />

      <Testimonials />

      <FinalCTA />

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Top navigation                                                             */
/* -------------------------------------------------------------------------- */

function TopNav({
  currentUser,
  mobileNavOpen,
  setMobileNavOpen,
}: {
  currentUser: { id: string; fullName: string; role: string } | null;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(12px)',
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div
        className="container-narrow"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 6px 16px var(--accent-glow)',
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
            CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </Link>

        <div
          className="desktop-only"
          style={{ display: 'flex', alignItems: 'center', gap: 24 }}
        >
          <a href="#templates" style={navLinkStyle}>
            Templates
          </a>
          <a href="#how" style={navLinkStyle}>
            Como funciona
          </a>
          <a href="#features" style={navLinkStyle}>
            Funcionalidades
          </a>
          {currentUser ? (
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn-outline"
              style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <LayoutDashboard size={14} /> {currentUser.fullName.split(' ')[0]}
            </Link>
          ) : (
            <Link href="/login" style={navLinkStyle}>
              Entrar
            </Link>
          )}
          <Link
            href="/editor"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            Criar CV <ArrowRight size={14} />
          </Link>
        </div>

        <button
          className="mobile-only"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          style={{
            padding: 8,
            borderRadius: 10,
            border: '1px solid var(--card-border)',
            background: 'var(--background)',
          }}
        >
          {mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileNavOpen && (
        <div
          className="mobile-only"
          style={{
            borderTop: '1px solid var(--card-border)',
            background: 'var(--background)',
            padding: '16px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <a href="#templates" style={navLinkStyle} onClick={() => setMobileNavOpen(false)}>
            Templates
          </a>
          <a href="#how" style={navLinkStyle} onClick={() => setMobileNavOpen(false)}>
            Como funciona
          </a>
          <a href="#features" style={navLinkStyle} onClick={() => setMobileNavOpen(false)}>
            Funcionalidades
          </a>
          {currentUser ? (
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn-outline"
              style={{ textAlign: 'center' }}
            >
              {currentUser.fullName.split(' ')[0]}
            </Link>
          ) : (
            <Link href="/login" className="btn-outline" style={{ textAlign: 'center' }}>
              <LogIn size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Entrar
            </Link>
          )}
          <Link href="/editor" className="btn-primary" style={{ textAlign: 'center' }}>
            Criar CV
          </Link>
        </div>
      )}
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--foreground-muted)',
};

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  const showcase = useMemo(() => createShowcaseCVData('cv5'), []);
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      {/* Decorative background: two soft colour blobs + subtle grid */}
      <div aria-hidden className="hero-blob hero-blob-indigo" />
      <div aria-hidden className="hero-blob hero-blob-violet" />
      <div aria-hidden className="hero-grid" />

      <div
        className="container-narrow hero-inner"
        style={{
          position: 'relative',
          padding: '72px 24px 72px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: 'var(--accent-soft)',
              border: '1px solid rgba(79, 70, 229, 0.18)',
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <Sparkles size={14} /> Novo: exporta o CV em PDF idéntico ao preview
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              maxWidth: 640,
              marginBottom: 18,
            }}
          >
            O teu CV profissional,{' '}
            <span className="text-gradient">criado com IA</span> em minutos
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(16px, 1.8vw, 18px)',
              color: 'var(--foreground-muted)',
              lineHeight: 1.6,
              maxWidth: 560,
              marginBottom: 32,
            }}
          >
            Editor bilingue PT/EN, sugestões inteligentes em cada campo e templates
            premium pensados para Moçambique e o mercado internacional.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
          >
            <Link
              href="/editor"
              className="btn-primary"
              style={{
                padding: '14px 22px',
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Começar gratuitamente <ArrowRight size={16} />
            </Link>
            <a
              href="#templates"
              className="btn-outline"
              style={{
                padding: '14px 22px',
                fontSize: 15,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Ver templates
            </a>
          </motion.div>

          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--muted-foreground)',
              fontSize: 13,
            }}
          >
            <CheckCircle2 size={14} color="var(--success)" />
            Primeiras 2 exportações grátis — sem cartão de crédito.
          </div>
        </div>

        {/* Floating CV mockup (desktop only) */}
        <motion.div
          className="hero-mockup desktop-only"
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="hero-mockup-frame"
          >
            <div className="hero-mockup-chrome">
              <span className="hero-mockup-dot" style={{ background: '#ff5f57' }} />
              <span className="hero-mockup-dot" style={{ background: '#febc2e' }} />
              <span className="hero-mockup-dot" style={{ background: '#28c840' }} />
              <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--muted-foreground)' }}>
                cv.moztraders.com/editor
              </span>
            </div>
            <div className="hero-mockup-viewport">
              <div className="hero-mockup-scale">
                <Preview dataOverride={showcase} templateOverride="cv5" langOverride="pt" />
              </div>
            </div>
          </motion.div>

          {/* Floating badge */}
          <motion.div
            className="hero-mockup-badge"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Sparkles size={14} color="var(--accent)" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 12 }}>IA a melhorar</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                Resumo profissional
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-mockup-badge hero-mockup-badge-bottom"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <CheckCircle2 size={14} color="var(--success)" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 12 }}>ATS compatible</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                Score 94 / 100
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Social-proof band (simple stats strip in place of "logos we don't have")   */
/* -------------------------------------------------------------------------- */

function LogosBand() {
  const items = [
    { value: '20+', label: 'Templates premium' },
    { value: 'PT / EN', label: 'Bilingue nativo' },
    { value: 'A4', label: 'Export PDF pixel-perfect' },
    { value: '1-click', label: 'Criação guiada por IA' },
  ];
  return (
    <section
      style={{
        borderTop: '1px solid var(--card-border)',
        borderBottom: '1px solid var(--card-border)',
        background: 'var(--background-muted)',
      }}
    >
      <div
        className="container-narrow"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          padding: '28px 24px',
        }}
      >
        {items.map((it) => (
          <div key={it.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {it.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Featured templates (3 only)                                                */
/* -------------------------------------------------------------------------- */

function FeaturedTemplates({ onSelect }: { onSelect: (id: string) => void }) {
  const cards = useMemo(
    () =>
      FEATURED_LANDING_TEMPLATES.map((id) => ({
        id,
        def: getTemplateDefinition(id),
        showcase: createShowcaseCVData(id),
      })),
    []
  );

  return (
    <section id="templates" className="container-narrow" style={{ padding: '72px 24px' }}>
      <SectionHeading
        eyebrow="Templates"
        title={
          <>
            Três direções para <span className="text-gradient">começar</span>
          </>
        }
        subtitle="Cada template tem uma personalidade clara. Escolhe uma e ajusta no editor — podes trocar a qualquer momento."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
          marginTop: 42,
        }}
      >
        {cards.map(({ id, def, showcase }) => (
          <motion.button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              textAlign: 'left',
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--card-shadow)',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                height: 320,
                overflow: 'hidden',
                background: '#f5f5f7',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'scale(0.38)',
                  transformOrigin: 'top left',
                  width: '263%', // 1 / 0.38
                  height: '263%',
                }}
              >
                <Preview dataOverride={showcase} templateOverride={id} langOverride="pt" />
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  marginBottom: 10,
                }}
              >
                {def.badge}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                {def.name}
              </div>
              <div style={{ fontSize: 14, color: 'var(--foreground-muted)', lineHeight: 1.55 }}>
                {def.description}
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: 'var(--accent)',
                  fontWeight: 600,
                }}
              >
                Usar este template
                <ArrowRight size={14} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link
          href="/editor"
          className="btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          Ver todos os templates no editor <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works                                                               */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Preenche',
      desc: 'Editor intuitivo, colunas organizadas e sugestões de IA em cada campo.',
    },
    {
      n: '02',
      title: 'Refina com IA',
      desc: 'Tradução PT/EN automática, melhoria de resumo e recomendações de template.',
    },
    {
      n: '03',
      title: 'Exporta em PDF',
      desc: 'A4 pixel-perfect, idêntico ao preview, pronto para candidaturas sérias.',
    },
  ];
  return (
    <section
      id="how"
      style={{ background: 'var(--background-muted)', borderTop: '1px solid var(--card-border)' }}
    >
      <div className="container-narrow" style={{ padding: '72px 24px' }}>
        <SectionHeading
          eyebrow="Como funciona"
          title="Do zero ao PDF em 3 passos"
          subtitle="Concebido para quem precisa de um CV bom agora — não dentro de uma semana."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginTop: 42,
          }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 26,
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--accent)',
                  letterSpacing: '0.1em',
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 19, fontWeight: 700, margin: '8px 0 6px' }}>
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: 'var(--foreground-muted)', lineHeight: 1.6 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Feature grid                                                               */
/* -------------------------------------------------------------------------- */

function FeatureGrid() {
  const features = [
    {
      icon: Wand2,
      title: 'IA no editor',
      desc: 'Sugestões contextuais em cada campo, sem sair da página.',
    },
    {
      icon: Download,
      title: 'PDF idêntico ao preview',
      desc: 'O que vês no ecrã é exactamente o PDF que descarregas.',
    },
    {
      icon: CheckCircle2,
      title: 'Optimizado ATS',
      desc: 'Estruturas compatíveis com sistemas de triagem automática.',
    },
  ];
  return (
    <section id="features" className="container-narrow" style={{ padding: '72px 24px' }}>
      <SectionHeading
        eyebrow="Funcionalidades"
        title="Menos fricção, mais resultado"
        subtitle="Tudo o que precisas para destacar a tua candidatura, sem ferramentas complicadas."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18,
          marginTop: 42,
        }}
      >
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 22,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Icon size={18} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--foreground-muted)', lineHeight: 1.55 }}>
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

function Testimonials() {
  const items = [
    {
      name: 'Ana M.',
      role: 'Engenheira de Software, Maputo',
      avatar: 'https://i.pravatar.cc/120?img=47',
      quote:
        'Fiz o CV em 20 minutos, a tradução PT/EN poupou-me horas. Consegui a entrevista na semana seguinte.',
    },
    {
      name: 'João P.',
      role: 'Consultor Financeiro',
      avatar: 'https://i.pravatar.cc/120?img=12',
      quote:
        'O PDF sai exactamente igual ao preview. Nunca mais perdi tempo a formatar em Word.',
    },
    {
      name: 'Sara V.',
      role: 'Designer de Produto',
      avatar: 'https://i.pravatar.cc/120?img=32',
      quote:
        'Templates são lindos e a IA ajuda mesmo a melhorar os textos. Muito acima do que esperava.',
    },
  ];
  return (
    <section
      style={{
        background: 'var(--background-muted)',
        borderTop: '1px solid var(--card-border)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div className="container-narrow" style={{ padding: '72px 24px' }}>
        <SectionHeading
          eyebrow="Quem já usou"
          title={<>Feedback de quem recebeu <span className="text-gradient">o 'sim'</span></>}
          subtitle="Estudantes, profissionais e executivos que já exportaram o CV com a nossa app."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginTop: 42,
          }}
        >
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--card-shadow)',
                position: 'relative',
              }}
            >
              <Quote
                size={28}
                color="var(--accent)"
                style={{ opacity: 0.22, position: 'absolute', top: 18, right: 18 }}
              />
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    color="#f59e0b"
                    fill="#f59e0b"
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: 14.5,
                  color: 'var(--foreground)',
                  lineHeight: 1.6,
                  marginBottom: 18,
                }}
              >
                “{t.quote}”
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--accent-soft)',
                  }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                   */
/* -------------------------------------------------------------------------- */

function FinalCTA() {
  return (
    <section className="container-narrow" style={{ padding: '28px 24px 80px' }}>
      <div
        className="final-cta"
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(28px, 5vw, 56px)',
          background: 'linear-gradient(135deg, #0b1020 0%, #312e81 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(49, 46, 129, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden className="final-cta-grid" />
        <div aria-hidden className="final-cta-glow" />
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            margin: 0,
            marginBottom: 12,
          }}
        >
          Pronto para criar o teu CV?
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 16,
            maxWidth: 520,
            margin: 0,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Começa em segundos. Escolhe um template, preenche e exporta. Sem cartão, sem complicações.
        </p>
        <Link
          href="/editor"
          className="btn-primary"
          style={{
            padding: '14px 24px',
            fontSize: 15,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          Criar CV grátis <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--card-border)', background: 'var(--background-muted)' }}>
      <div
        className="container-narrow"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
          © {new Date().getFullYear()} CV-Gen AI. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared heading                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          margin: 0,
          marginBottom: subtitle ? 12 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 15.5,
            color: 'var(--foreground-muted)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

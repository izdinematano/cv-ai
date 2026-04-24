'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, LayoutDashboard, LogIn, Shield, Sparkles, Zap } from 'lucide-react';
import TemplateGallery from '@/components/Preview/TemplateGallery';
import { useAppStore } from '@/store/useAppStore';
import { useCVStore } from '@/store/useCVStore';

export default function LandingPage() {
  const router = useRouter();
  const { setTemplate, completeTemplateSelection } = useCVStore();
  const { currentUserId, users } = useAppStore();
  const currentUser = currentUserId ? users.find((u) => u.id === currentUserId) : null;
  const steps = [
    {
      step: '01',
      title: 'Preenche o teu CV',
      desc: 'Editor completo com IA a sugerir melhorias em tempo real.',
    },
    {
      step: '02',
      title: 'Optimiza com IA',
      desc: 'Tradução automática, melhoria de textos e recomendação de templates.',
    },
    {
      step: '03',
      title: 'Exporta em PDF',
      desc: 'Quando estiveres satisfeito, exporta o teu CV profissional em formato A4.',
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setTemplate(templateId);
    completeTemplateSelection();
    router.push('/editor');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'white', overflowX: 'hidden' }}>
      <nav
        style={{
          padding: '24px 64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--card-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={24} color="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a
            href="#features"
            className="desktop-only"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Funcionalidades
          </a>
          <a
            href="#templates"
            className="desktop-only"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Templates
          </a>
          <a
            href="#pricing"
            className="desktop-only"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}
          >
            Preços
          </a>
          {currentUser ? (
            <Link
              href={currentUser.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn-outline"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <LayoutDashboard size={16} /> {currentUser.fullName.split(' ')[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-outline"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <LogIn size={16} /> Entrar
            </Link>
          )}
          <Link href="/editor" className="btn-primary" style={{ padding: '10px 20px' }}>
            Criar CV
          </Link>
        </div>
      </nav>

      <section
        style={{
          padding: '180px 64px 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: -1,
          }}
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--accent)',
              padding: '8px 20px',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '24px',
              display: 'inline-block',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            Inteligencia Artificial para CVs bilingues
          </span>

          <h1
            style={{
              fontSize: '72px',
              lineHeight: '1.1',
              maxWidth: '900px',
              marginBottom: '24px',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            Cria o teu CV profissional em <span style={{ color: 'var(--accent)' }}>minutos</span> com IA
          </h1>

          <p
            style={{
              fontSize: '20px',
              color: 'var(--muted-foreground)',
              maxWidth: '650px',
              margin: '0 auto 40px',
              lineHeight: '1.6',
            }}
          >
            Editor completo, templates modernos e tradução PT-EN pensados para profissionais moçambicanos e para o mercado internacional.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link
              href="/editor"
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              Comecar Agora <ArrowRight size={20} />
            </Link>
            <a href="#templates" className="btn-outline" style={{ padding: '16px 36px', fontSize: '18px' }}>
              Ver Templates
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ marginTop: '80px', position: 'relative' }}
        >
          <div
            className="glass-card"
            style={{
              padding: '12px',
              borderRadius: '24px',
              maxWidth: '1000px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cv_platform_mockup.png"
              alt="CV Editor Preview"
              style={{ width: '100%', borderRadius: '16px', display: 'block' }}
            />
          </div>
        </motion.div>
      </section>

      <section id="features" style={{ padding: '100px 64px', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '40px', marginBottom: '16px' }}>Porque escolher o CV-Gen AI?</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '18px' }}>
            Tudo o que precisas para construir um CV forte e pronto para exportar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            {
              icon: <Zap color="var(--accent)" />,
              title: 'Velocidade Real',
              desc: 'Preenchimento rapido, melhoria com IA e recomendacao de template com base no cargo.',
            },
            {
              icon: <Globe color="var(--accent)" />,
              title: 'Bilingue de Verdade',
              desc: 'Alterna entre portugues e ingles, com traducao automatica dos campos principais.',
            },
            {
              icon: <Shield color="var(--accent)" />,
              title: 'Exportacao Profissional',
              desc: 'Preview em tempo real e PDF A4 pensado para apresentar bem em recrutamento e ATS.',
            },
          ].map((feature) => (
            <div key={feature.title} className="glass-card" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" style={{ padding: '100px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', maxWidth: '1200px', margin: '0 auto 60px' }}>
          <div>
            <h2 style={{ fontSize: '40px', marginBottom: '16px' }}>Templates Profissionais</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '18px' }}>
              Escolhe primeiro o modelo que mais combina contigo e entra logo no editor com esse visual selecionado.
            </p>
          </div>
          <Link href="/editor" className="btn-outline">
            Ver todos os designs
          </Link>
        </div>

        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <TemplateGallery featuredOnly onSelect={handleTemplateSelect} />
        </div>
      </section>

      <section
        style={{
          padding: '80px 64px',
          background: 'rgba(59, 130, 246, 0.03)',
          borderTop: '1px solid var(--card-border)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>
            Cria gratis. Paga apenas para <span style={{ color: 'var(--accent)' }}>descarregar</span>.
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '18px', marginBottom: '48px' }}>
            Todas as ferramentas de IA, todos os templates e a traducao PT-EN ficam disponiveis sem custo. So pagas quando estiveres pronto para exportar o teu PDF profissional.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
            {steps.map((item) => (
              <div key={item.step} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent)', opacity: 0.3, marginBottom: '12px' }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        style={{
          padding: '100px 32px',
          borderTop: '1px solid var(--card-border)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{ fontSize: 40, marginBottom: 12 }}>
              Preços <span style={{ color: 'var(--accent)' }}>simples e justos</span>
            </h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 16, maxWidth: 560, margin: '0 auto' }}>
              Cria, edita e adapta CVs à vontade. Pagas apenas quando descarregas o PDF final.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>
                Free
              </div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>
                0 <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>MZN</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#cbd5e1' }}>
                <li>✓ Editor completo bilingue PT/EN</li>
                <li>✓ Importação de PDF, DOCX ou texto</li>
                <li>✓ 20+ templates profissionais</li>
                <li>✓ Adaptar CV a descrição de vaga</li>
                <li>✓ 5 exportações PDF por mês</li>
              </ul>
              <Link href="/register" className="btn-outline" style={{ textAlign: 'center', marginTop: 6 }}>
                Criar conta grátis
              </Link>
            </div>

            <div
              className="glass-card"
              style={{
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.1))',
                border: '1px solid rgba(59,130,246,0.35)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: '#3b82f6',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 999,
                  letterSpacing: '0.06em',
                }}
              >
                POPULAR
              </div>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 800 }}>
                Pack de Créditos
              </div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>
                100 <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>MZN</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#cbd5e1' }}>
                <li>✓ Tudo no plano Free</li>
                <li>✓ <b>+5 exportações</b> adicionais (nunca expiram)</li>
                <li>✓ Pagamento via <b>Mpesa</b></li>
                <li>✓ Confirmação rápida por WhatsApp</li>
                <li>✓ Podes comprar quantos packs quiseres</li>
              </ul>
              <Link href="/register" className="btn-primary" style={{ textAlign: 'center', marginTop: 6 }}>
                Começar agora
              </Link>
            </div>

            <div className="glass-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>
                Empresas
              </div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>
                Sob consulta
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#cbd5e1' }}>
                <li>✓ Contas para toda a equipa</li>
                <li>✓ Templates com branding próprio</li>
                <li>✓ Exportações ilimitadas</li>
                <li>✓ Suporte dedicado</li>
              </ul>
              <a
                href="https://wa.me/258000000000"
                className="btn-outline"
                style={{ textAlign: 'center', marginTop: 6 }}
              >
                Falar connosco
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '64px', borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800 }}>
            CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
          &copy; 2026 CV-Gen AI. Criado para profissionais que querem apresentar melhor o seu trabalho.
        </p>
      </footer>
    </div>
  );
}

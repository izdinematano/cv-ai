'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Sparkles, Zap } from 'lucide-react';
import TemplateGallery from '@/components/Preview/TemplateGallery';
import { useCVStore } from '@/store/useCVStore';

export default function LandingPage() {
  const router = useRouter();
  const { setTemplate, completeTemplateSelection } = useCVStore();
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

        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <a href="#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>
            Funcionalidades
          </a>
          <a href="#templates" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>
            Templates
          </a>
          <Link href="/editor" className="btn-primary" style={{ padding: '10px 24px' }}>
            Criar CV Gratis
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

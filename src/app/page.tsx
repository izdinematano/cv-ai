'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, Zap, Globe, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'white', overflowX: 'hidden' }}>
      {/* Header/Nav */}
      <nav style={{ 
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
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={24} color="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <a href="#features" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Funcionalidades</a>
          <a href="#templates" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>Templates</a>
          <Link href="/editor" className="btn-primary" style={{ padding: '10px 24px' }}>
            Criar CV Grátis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '180px 64px 100px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Abstract Background Elements */}
        <div style={{ 
          position: 'absolute', 
          top: '10%', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: -1
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: 'var(--accent)', 
            padding: '8px 20px', 
            borderRadius: '100px', 
            fontSize: '14px', 
            fontWeight: 600,
            marginBottom: '24px',
            display: 'inline-block',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            ✨ Inteligência Artificial de Nova Geração
          </span>
          <h1 style={{ 
            fontSize: '72px', 
            lineHeight: '1.1', 
            maxWidth: '900px', 
            marginBottom: '24px',
            fontFamily: 'var(--font-outfit)'
          }}>
            Crie o seu CV profissional em <span style={{ color: 'var(--accent)' }}>minutos</span> com IA
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: 'var(--muted-foreground)', 
            maxWidth: '650px', 
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            Transforme a sua trajetória numa ferramenta de impacto. Gerador de currículos multilingue inteligente para o mercado internacional.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/editor" className="btn-primary" style={{ padding: '16px 36px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Começar Agora <ArrowRight size={20} />
            </Link>
            <Link href="#templates" className="btn-outline" style={{ padding: '16px 36px', fontSize: '18px' }}>
              Ver Templates
            </Link>
          </div>
        </motion.div>

        {/* Hero Image / Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ marginTop: '80px', position: 'relative' }}
        >
          <div className="glass-card" style={{ 
            padding: '12px', 
            borderRadius: '24px', 
            maxWidth: '1000px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img 
              src="/cv_platform_mockup.png" 
              alt="CV Editor Preview" 
              style={{ width: '100%', borderRadius: '16px', display: 'block' }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 64px', background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '40px', marginBottom: '16px' }}>Porquê escolher o CV-Gen AI?</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '18px' }}>Tudo o que precisa para conquistar a sua próxima vaga.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: <Zap color="var(--accent)" />, title: 'Velocidade Extrema', desc: 'Preenchimento automático e sugestões em tempo real para não perder tempo.' },
            { icon: <Globe color="var(--accent)" />, title: 'Bilingue Nativo', desc: 'Converta o seu CV entre Português e Inglês com adaptação técnica profissional.' },
            { icon: <Shield color="var(--accent)" />, title: 'Templates Premium', desc: 'Layouts modernos criados por recrutadores para passar em sistemas ATS.' },
          ].map((feat, i) => (
            <div key={i} className="glass-card" style={{ padding: '32px', transition: 'transform 0.3s ease' }}>
              <div style={{ marginBottom: '24px' }}>{feat.icon}</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{feat.title}</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates Section Preview */}
      <section id="templates" style={{ padding: '100px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', maxWidth: '1200px', margin: '0 auto 60px' }}>
          <div>
            <h2 style={{ fontSize: '40px', marginBottom: '16px' }}>Templates Profissionais</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '18px' }}>Escolha o estilo que melhor se adapta à sua carreira.</p>
          </div>
          <Link href="/editor" className="btn-outline">Ver todos os designs</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          {['Minimalista', 'Corporativo', 'Criativo', 'Executivo'].map((t, i) => (
            <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ height: '300px', background: '#f8fafc', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '20px', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontWeight: 600 }}>{t}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '64px', borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800 }}>CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>
          &copy; 2026 CV-Gen AI. Orgulhosamente criado para profissionais globais.
        </p>
      </footer>
    </div>
  );
}

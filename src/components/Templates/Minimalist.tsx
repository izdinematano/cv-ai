'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Link, Globe } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Minimalist({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;
  const t = {
    experience: lang === 'pt' ? 'Experiência' : 'Experience',
    education: lang === 'pt' ? 'Educação' : 'Education',
    skills: lang === 'pt' ? 'Habilidades' : 'Skills',
  };

  return (
    <div style={{ padding: '60px', color: '#1e293b' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          {data.personalInfo.fullName || 'Seu Nome'}
        </h1>
        <p style={{ fontSize: '18px', color: accentColor, fontWeight: 600, marginBottom: '20px' }}>
          {data.personalInfo.jobTitle[lang] || 'Título Profissional'}
        </p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '12px', color: '#64748b' }}>
          {data.personalInfo.email && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12}/>{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/>{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/>{data.personalInfo.location}</div>}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        <div>
          {/* Summary */}
          {data.summary[lang] && (
            <section style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>{data.summary[lang]}</p>
            </section>
          )}

          {/* Experience */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: accentColor, letterSpacing: '0.1em', fontWeight: 700, marginBottom: '16px' }}>{t.experience}</h2>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700 }}>{exp.position[lang]}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{exp.company}</div>
                <p style={{ fontSize: '12px', marginTop: '4px', lineHeight: '1.5' }}>{exp.description[lang]}</p>
              </div>
            ))}
          </section>
        </div>

        <div>
          {/* Skills */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: accentColor, letterSpacing: '0.1em', fontWeight: 700, marginBottom: '12px' }}>{t.skills}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.map((skill, i) => (
                <span key={i} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>{skill.pt}</span>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: accentColor, letterSpacing: '0.1em', fontWeight: 700, marginBottom: '12px' }}>{t.education}</h2>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{edu.institution}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{edu.year}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

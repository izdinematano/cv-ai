'use client';

import { CVData } from '@/store/useCVStore';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Student({ data, lang }: TemplateProps) {
  const { accentColor, fontSize } = data.settings;

  return (
    <div style={{ padding: '60px', minHeight: '1122px', background: '#fcfcfc', color: '#334155', fontSize: `${fontSize}px` }}>
      <header style={{ borderLeft: `8px solid ${accentColor}`, paddingLeft: '25px', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', marginBottom: '5px' }}>{data.personalInfo.fullName}</h1>
        <h2 style={{ fontSize: '18px', color: accentColor, fontWeight: 700 }}>{data.personalInfo.jobTitle[lang]}</h2>
        <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '12px', color: '#64748b' }}>
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
        <section>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: '15px', letterSpacing: '1px' }}>Educação</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800 }}>{edu.institution}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{edu.degree[lang]}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#94a3b8' }}>{edu.year}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: '15px', letterSpacing: '1px' }}>Experiência e Projetos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ fontWeight: 800, fontSize: '15px' }}>{exp.position[lang]} @ {exp.company}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{exp.period}</div>
                <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{exp.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: '15px', letterSpacing: '1px' }}>Competências</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {data.skills.map((s, i) => (
              <span key={i} style={{ border: `1px solid ${accentColor}`, color: accentColor, padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>{s[lang] || s.pt || s.en}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

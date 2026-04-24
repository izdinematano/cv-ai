'use client';

import { CVData } from '@/store/useCVStore';
interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Corporate({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;

  return (
    <div style={{ display: 'flex', minHeight: '1122px' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#f8fafc', padding: '40px 30px', borderRight: '1px solid #e2e8f0' }}>
        <div style={{ width: '120px', height: '120px', background: '#e2e8f0', borderRadius: '8px', marginBottom: '30px' }} />
        
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: accentColor, marginBottom: '15px' }}>Contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#475569' }}>
            {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
            {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: accentColor, marginBottom: '15px' }}>Skills</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.skills.map((skill, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#475569' }}>• {skill[lang] || skill.pt || skill.en}</div>
            ))}
          </div>
        </section>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '60px 40px' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>{data.personalInfo.fullName}</h1>
          <div style={{ width: '40px', height: '4px', background: accentColor, margin: '15px 0' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>{data.personalInfo.jobTitle[lang]}</h2>
        </header>

        <section style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#334155' }}>{data.summary[lang]}</p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '20px' }}>Professional Experience</h3>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>{exp.company}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{exp.period}</span>
              </div>
              <div style={{ fontSize: '13px', color: accentColor, fontWeight: 600, margin: '4px 0' }}>{exp.position[lang]}</div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>{exp.description[lang]}</p>
            </div>
          ))}
        </section>

        <section>
          <h3 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '20px' }}>Education</h3>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{edu.degree[lang]}</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>{edu.institution} | {edu.year}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

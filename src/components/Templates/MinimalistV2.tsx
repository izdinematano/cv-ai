'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from './_shared/BulletList';
import { labels } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function MinimalistV2({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;

  return (
    <div style={{ padding: '80px 60px', minHeight: '1122px', background: 'white', color: '#334155' }}>
      {/* Centered Header */}
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '8px', textTransform: 'uppercase', marginBottom: '15px', color: '#0f172a' }}>
          {data.personalInfo.fullName}
        </h1>
        <div style={{ width: '40px', height: '2px', background: accentColor, margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '3px', color: accentColor }}>
          {data.personalInfo.jobTitle[lang]}
        </h2>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '50px' }}>
        {/* Simple Summary */}
        <section style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#64748b' }}>{data.summary[lang]}</p>
        </section>

        <div style={{ height: '1px', background: '#f1f5f9' }} />

        {/* Experience Section */}
        <section>
          <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px', textAlign: 'center' }}>{labels.experience[lang]}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '40px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{exp.company}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{exp.period}</div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: accentColor, marginBottom: '8px' }}>{exp.position[lang]}</h4>
                  <BulletList text={exp.description[lang]} fontSize={13} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#64748b' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Bottom */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '20px' }}>
          <section>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{labels.education[lang]}</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{edu.institution}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{edu.degree[lang]} | {edu.year}</div>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{labels.skills[lang]}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.map((skill, i) => (
                <span key={i} style={{ fontSize: '12px', color: '#64748b' }}>
                  {skill[lang] || skill.pt || skill.en} {i < data.skills.length - 1 && '•'}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Subtle Footer Contact */}
      <footer style={{ marginTop: '80px', borderTop: '1px solid #f1f5f9', paddingTop: '30px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', letterSpacing: '1px' }}>
        {data.personalInfo.email}  |  {data.personalInfo.phone}  |  {data.personalInfo.location}
      </footer>
    </div>
  );
}

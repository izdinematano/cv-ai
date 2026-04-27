'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from './_shared/BulletList';
import { labels, a4Frame, fallbackPhoto } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Mosaic({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;
  const photo = data.personalInfo.photo || fallbackPhoto(data.personalInfo.fullName, accentColor);

  return (
    <div style={a4Frame({ fontSize: `${fontSize}px`, fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' })}>
      {/* Two-tone header */}
      <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: accentColor, padding: '40px 36px', color: 'white' }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.15 }}>{data.personalInfo.fullName}</h1>
          <h2 style={{ fontSize: 13, fontWeight: 500, margin: '8px 0 0', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{data.personalInfo.jobTitle[lang]}</h2>
        </div>
        <div style={{ background: '#0f172a', padding: '40px 36px', color: 'white', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
            <img src={photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#94a3b8' }}>
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
          </div>
        </div>
      </header>

      {/* Summary row */}
      <div style={{ padding: '20px 36px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: '#475569' }}>{data.summary[lang]}</p>
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Left — Experience */}
        <div style={{ padding: '28px 36px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 14, letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `2px solid ${accentColor}` }}>{labels.experience[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{exp.position[lang]}</div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>{exp.company} · {exp.period}</div>
                  <BulletList text={exp.description[lang]} fontSize={11} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#64748b', marginTop: 6 }} />
                </div>
              ))}
            </div>
          </section>

          {data.projects.length > 0 && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 12, letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `2px solid ${accentColor}` }}>{labels.projects[lang]}</h3>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, marginTop: 2 }}>{p.description[lang]}</div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right — Education, Skills, Languages, Certs */}
        <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 14, letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `2px solid ${accentColor}` }}>{labels.education[lang]}</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{edu.institution} · {edu.year}</div>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 12, letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `2px solid ${accentColor}` }}>{labels.skills[lang]}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 10.5, padding: '4px 10px', borderRadius: 6, background: `${accentColor}10`, border: `1px solid ${accentColor}30`, color: '#334155', fontWeight: 600 }}>{s[lang] || s.pt || s.en}</span>
              ))}
            </div>
          </section>

          {data.languages.length > 0 && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 10, letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `2px solid ${accentColor}` }}>{labels.languages[lang]}</h3>
              {data.languages.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span>
                  <span style={{ color: '#64748b' }}>{l.level[lang]}</span>
                </div>
              ))}
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 10, letterSpacing: '0.06em', paddingBottom: 6, borderBottom: `2px solid ${accentColor}` }}>{labels.certifications[lang]}</h3>
              {data.certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: '#64748b' }}>{c.issuer} · {c.year}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

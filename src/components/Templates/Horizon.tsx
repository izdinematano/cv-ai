'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from './_shared/BulletList';
import { labels, a4Frame, fallbackPhoto } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Horizon({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;
  const photo = data.personalInfo.photo || fallbackPhoto(data.personalInfo.fullName, accentColor);

  return (
    <div style={a4Frame({ fontSize: `${fontSize}px`, fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b' })}>
      {/* Full-width header with gradient */}
      <header style={{ background: `linear-gradient(135deg, #0f172a 0%, ${accentColor} 100%)`, color: 'white', padding: '44px 52px', display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ width: 100, height: 100, borderRadius: 16, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
          <img src={photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{data.personalInfo.fullName}</h1>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{data.personalInfo.jobTitle[lang]}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'right', flexShrink: 0 }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary band */}
      <div style={{ background: '#f8fafc', padding: '20px 52px', borderBottom: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: '#475569' }}>{data.summary[lang]}</p>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 0, flex: 1 }}>
        {/* Main */}
        <div style={{ padding: '28px 36px 40px 52px', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 16, letterSpacing: '0.06em' }}>{labels.experience[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {data.experience.map((exp) => (
                <div key={exp.id} style={{ paddingLeft: 16, borderLeft: `3px solid ${accentColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.position[lang]}</span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{exp.period}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: accentColor, fontWeight: 600, marginTop: 2 }}>{exp.company}</div>
                  <BulletList text={exp.description[lang]} fontSize={11.5} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#64748b', marginTop: 6 }} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 14, letterSpacing: '0.06em' }}>{labels.education[lang]}</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: 10, paddingLeft: 16, borderLeft: `3px solid ${accentColor}44` }}>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{edu.institution} · {edu.year}</div>
              </div>
            ))}
          </section>
        </div>

        {/* Sidebar */}
        <div style={{ background: '#f1f5f9', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 10, letterSpacing: '0.06em' }}>{labels.skills[lang]}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 10.5, padding: '4px 10px', borderRadius: 6, background: 'white', border: '1px solid #e2e8f0', color: '#334155' }}>{s[lang] || s.pt || s.en}</span>
              ))}
            </div>
          </section>

          {data.languages.length > 0 && (
            <section>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 10, letterSpacing: '0.06em' }}>{labels.languages[lang]}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.languages.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ fontWeight: 600 }}>{l.name}</span>
                    <span style={{ color: '#64748b' }}>{l.level[lang]}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects.length > 0 && (
            <section>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 10, letterSpacing: '0.06em' }}>{labels.projects[lang]}</h3>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 8, fontSize: 11 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ color: '#64748b', lineHeight: 1.5, marginTop: 2 }}>{p.description[lang]}</div>
                </div>
              ))}
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: accentColor, marginBottom: 10, letterSpacing: '0.06em' }}>{labels.certifications[lang]}</h3>
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

'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from './_shared/BulletList';
import { labels, a4Frame, fallbackPhoto } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Zenith({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;
  const photo = data.personalInfo.photo || fallbackPhoto(data.personalInfo.fullName, accentColor);

  return (
    <div style={a4Frame({ fontSize: `${fontSize}px`, fontFamily: '"Playfair Display", Georgia, serif', color: '#1a1a2e' })}>
      {/* Elegant centred header */}
      <header style={{ textAlign: 'center', padding: '50px 56px 32px', borderBottom: `2px solid ${accentColor}` }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, margin: '0 auto 18px' }}>
          <img src={photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: '0.06em' }}>{data.personalInfo.fullName}</h1>
        <h2 style={{ fontSize: 14, fontWeight: 400, color: accentColor, margin: '6px 0 16px', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'Inter, system-ui, sans-serif' }}>{data.personalInfo.jobTitle[lang]}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11, color: '#6b7280', fontFamily: 'Inter, system-ui, sans-serif', flexWrap: 'wrap' }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>·  {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>·  {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>·  {data.personalInfo.linkedin}</span>}
        </div>
      </header>

      <div style={{ padding: '30px 56px 40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Profile */}
        <section style={{ textAlign: 'center', marginBottom: `${sectionSpacing}px` }}>
          <p style={{ lineHeight: 1.8, color: '#475569', fontSize: 12.5, maxWidth: 600, margin: '0 auto' }}>{data.summary[lang]}</p>
        </section>

        {/* Three-column skills/languages/certs strip */}
        {(data.skills.length > 0 || data.languages.length > 0 || data.certifications.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: `${sectionSpacing}px`, padding: '18px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
            {data.skills.length > 0 && (
              <div>
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: 8 }}>{labels.skills[lang]}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {data.skills.map((s, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${accentColor}0d`, color: '#374151' }}>{s[lang] || s.pt || s.en}</span>
                  ))}
                </div>
              </div>
            )}
            {data.languages.length > 0 && (
              <div>
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: 8 }}>{labels.languages[lang]}</h3>
                {data.languages.map((l, i) => (
                  <div key={i} style={{ fontSize: 10.5, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600 }}>{l.name}</span> — <span style={{ color: '#6b7280' }}>{l.level[lang]}</span>
                  </div>
                ))}
              </div>
            )}
            {data.certifications.length > 0 && (
              <div>
                <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: accentColor, marginBottom: 8 }}>{labels.certifications[lang]}</h3>
                {data.certifications.map((c) => (
                  <div key={c.id} style={{ fontSize: 10.5, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span> <span style={{ color: '#6b7280' }}>· {c.issuer} {c.year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experience */}
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, textAlign: 'center', marginBottom: 18 }}>{labels.experience[lang]}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.position[lang]}</span>
                  <span style={{ fontSize: 10.5, color: '#9ca3af', whiteSpace: 'nowrap' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: 11.5, color: accentColor, fontWeight: 600, marginTop: 2 }}>{exp.company}</div>
                <BulletList text={exp.description[lang]} fontSize={11.5} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#4b5563', marginTop: 6 }} />
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, textAlign: 'center', marginBottom: 14 }}>{labels.education[lang]}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: data.education.length > 1 ? '1fr 1fr' : '1fr', gap: 16 }}>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{edu.institution} · {edu.year}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        {data.projects.length > 0 && (
          <section style={{ marginTop: `${sectionSpacing}px` }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, textAlign: 'center', marginBottom: 14 }}>{labels.projects[lang]}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: data.projects.length > 1 ? '1fr 1fr' : '1fr', gap: 14 }}>
              {data.projects.map((p) => (
                <div key={p.id} style={{ padding: 14, borderRadius: 8, background: '#faf9f7', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, marginTop: 4 }}>{p.description[lang]}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

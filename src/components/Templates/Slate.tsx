'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from './_shared/BulletList';
import { labels, a4Frame, fallbackPhoto } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Slate({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;
  const photo = data.personalInfo.photo || fallbackPhoto(data.personalInfo.fullName, accentColor);

  return (
    <div style={a4Frame({ fontSize: `${fontSize}px`, fontFamily: 'Inter, system-ui, sans-serif', color: '#e2e8f0', background: '#0f172a' })}>
      {/* Dark professional theme */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100%' }}>

        {/* Left sidebar */}
        <div style={{ background: '#1e293b', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, margin: '0 auto 16px' }}>
              <img src={photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#f8fafc' }}>{data.personalInfo.fullName}</h1>
            <h2 style={{ fontSize: 11, fontWeight: 500, color: accentColor, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{data.personalInfo.jobTitle[lang]}</h2>
          </div>

          <section>
            <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${accentColor}44` }}>{labels.contact[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10.5, color: '#94a3b8' }}>
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
              {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
              {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${accentColor}44` }}>{labels.skills[lang]}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}>{s[lang] || s.pt || s.en}</span>
              ))}
            </div>
          </section>

          {data.languages.length > 0 && (
            <section>
              <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${accentColor}44` }}>{labels.languages[lang]}</h3>
              {data.languages.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 5 }}>
                  <span style={{ color: '#e2e8f0' }}>{l.name}</span>
                  <span style={{ color: '#64748b' }}>{l.level[lang]}</span>
                </div>
              ))}
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${accentColor}44` }}>{labels.certifications[lang]}</h3>
              {data.certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: 6, fontSize: 10.5 }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.name}</div>
                  <div style={{ color: '#64748b' }}>{c.issuer} · {c.year}</div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Main content */}
        <div style={{ padding: '40px 44px', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, marginBottom: 10 }}>{labels.about[lang]}</h3>
            <p style={{ lineHeight: 1.7, color: '#94a3b8', fontSize: 12.5, margin: 0 }}>{data.summary[lang]}</p>
          </section>

          <section>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, marginBottom: 16 }}>{labels.experience[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{exp.position[lang]}</span>
                    <span style={{ fontSize: 10.5, color: '#64748b', whiteSpace: 'nowrap' }}>{exp.period}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: accentColor, fontWeight: 600, marginTop: 2 }}>{exp.company}</div>
                  <BulletList text={exp.description[lang]} fontSize={11.5} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#94a3b8', marginTop: 6 }} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, marginBottom: 14 }}>{labels.education[lang]}</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: '#f1f5f9' }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{edu.institution} · {edu.year}</div>
              </div>
            ))}
          </section>

          {data.projects.length > 0 && (
            <section>
              <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, marginBottom: 14 }}>{labels.projects[lang]}</h3>
              {data.projects.map((p) => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, marginTop: 2 }}>{p.description[lang]}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

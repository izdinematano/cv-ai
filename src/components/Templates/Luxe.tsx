'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from './_shared/BulletList';
import { labels, a4Frame, fallbackPhoto } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Luxe({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;
  const photo = data.personalInfo.photo || fallbackPhoto(data.personalInfo.fullName, accentColor);

  return (
    <div style={a4Frame({ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: `${fontSize}px`, color: '#1a1a2e' })}>
      {/* Gold top border */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${accentColor}, #d4a574, ${accentColor})` }} />

      <header style={{ padding: '48px 56px 36px', display: 'flex', gap: 32, alignItems: 'center', borderBottom: `1px solid ${accentColor}33` }}>
        <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${accentColor}`, flexShrink: 0 }}>
          <img src={photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.04em', margin: 0, textTransform: 'uppercase' }}>{data.personalInfo.fullName}</h1>
          <h2 style={{ fontSize: 15, fontWeight: 400, color: accentColor, margin: '6px 0 0', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{data.personalInfo.jobTitle[lang]}</h2>
          <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 11, color: '#6b7280', flexWrap: 'wrap' }}>
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0 }}>
        {/* Main column */}
        <div style={{ padding: '32px 40px 40px 56px', display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: accentColor, marginBottom: 10, borderBottom: `1px solid ${accentColor}44`, paddingBottom: 6 }}>{labels.profile[lang]}</h3>
            <p style={{ lineHeight: 1.7, color: '#374151', fontSize: 12.5 }}>{data.summary[lang]}</p>
          </section>

          <section>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: accentColor, marginBottom: 14, borderBottom: `1px solid ${accentColor}44`, paddingBottom: 6 }}>{labels.experience[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.position[lang]}</span>
                    <span style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap' }}>{exp.period}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: accentColor, fontWeight: 600, marginTop: 2 }}>{exp.company}</div>
                  <BulletList text={exp.description[lang]} fontSize={11.5} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#4b5563', marginTop: 6 }} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: accentColor, marginBottom: 14, borderBottom: `1px solid ${accentColor}44`, paddingBottom: 6 }}>{labels.education[lang]}</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{edu.institution} · {edu.year}</div>
              </div>
            ))}
          </section>
        </div>

        {/* Right sidebar */}
        <div style={{ background: '#faf9f7', padding: '32px 28px', borderLeft: `1px solid ${accentColor}22`, display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          <section>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 12 }}>{labels.skills[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: '#374151', padding: '4px 0', borderBottom: '1px solid #e5e7eb' }}>{s[lang] || s.pt || s.en}</span>
              ))}
            </div>
          </section>

          {data.languages.length > 0 && (
            <section>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 12 }}>{labels.languages[lang]}</h3>
              {data.languages.map((l, i) => (
                <div key={i} style={{ marginBottom: 6, fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{l.name}</span>
                  <span style={{ color: '#6b7280', marginLeft: 6 }}>— {l.level[lang]}</span>
                </div>
              ))}
            </section>
          )}

          {data.certifications.length > 0 && (
            <section>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: accentColor, marginBottom: 12 }}>{labels.certifications[lang]}</h3>
              {data.certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: '#6b7280' }}>{c.issuer} · {c.year}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

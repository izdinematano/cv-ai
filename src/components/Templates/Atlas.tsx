'use client';

import { CVData } from '@/store/useCVStore';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Atlas({ data, lang }: TemplateProps) {
  const { accentColor, fontSize } = data.settings;

  return (
    <div style={{ minHeight: '1122px', background: '#fff', color: '#0f172a', fontSize: `${fontSize}px` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}>
        <aside
          style={{
            background: '#0f172a',
            color: 'white',
            padding: '48px 30px',
            minHeight: '1122px',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '24px',
                overflow: 'hidden',
                background: '#1e293b',
                border: `4px solid ${accentColor}`,
                marginBottom: '18px',
              }}
            >
              {data.personalInfo.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.personalInfo.photo}
                  alt={data.personalInfo.fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1.05 }}>{data.personalInfo.fullName}</h1>
            <h2 style={{ fontSize: '15px', color: accentColor, marginTop: '10px', lineHeight: 1.5 }}>
              {data.personalInfo.jobTitle[lang]}
            </h2>
          </div>

          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', marginBottom: '16px' }}>
              Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}><Mail size={14} color={accentColor} /> {data.personalInfo.email}</div>
              <div style={{ display: 'flex', gap: '10px' }}><Phone size={14} color={accentColor} /> {data.personalInfo.phone}</div>
              <div style={{ display: 'flex', gap: '10px' }}><MapPin size={14} color={accentColor} /> {data.personalInfo.location}</div>
              {data.personalInfo.linkedin ? <div style={{ display: 'flex', gap: '10px' }}><Globe size={14} color={accentColor} /> {data.personalInfo.linkedin}</div> : null}
            </div>
          </section>

          {/* Education is intentionally in the left column, before Skills, per
              the product spec: education grounds the profile before showing
              skills on a dark sidebar. */}
          {data.education.length > 0 && (
            <section style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', marginBottom: '16px' }}>
                {lang === 'pt' ? 'Formação' : 'Education'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div style={{ fontWeight: 700 }}>{edu.degree[lang]}</div>
                    <div style={{ color: '#cbd5e1', marginTop: '2px' }}>{edu.institution}</div>
                    {edu.year && (
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{edu.year}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', marginBottom: '16px' }}>
              Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.map((skill, index) => (
                <span
                  key={`${skill.pt}-${skill.en}-${index}`}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#e2e8f0',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {skill[lang] || skill.pt || skill.en}
                </span>
              ))}
            </div>
          </section>

          {data.languages.length > 0 && (
            <section>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8', marginBottom: '16px' }}>
                {lang === 'pt' ? 'Idiomas' : 'Languages'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                {data.languages.map((language, index) => (
                  <div key={`${language.name}-${index}`}>
                    <strong>{language.name}</strong>
                    <div style={{ color: '#cbd5e1', marginTop: '2px' }}>{language.level[lang]}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        <main style={{ padding: '52px 48px' }}>
          <section style={{ marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', padding: '8px 14px', borderRadius: '999px', background: 'rgba(15,118,110,0.08)', color: accentColor, fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Strategic Profile
            </div>
            <p style={{ color: '#475569', lineHeight: 1.9, maxWidth: '680px' }}>{data.summary[lang]}</p>
          </section>

          <section style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '22px' }}>
              Professional Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ color: accentColor, fontWeight: 800, marginBottom: '6px' }}>{exp.company}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>{exp.period}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>{exp.position[lang]}</div>
                    <p style={{ color: '#475569', lineHeight: 1.8 }}>{exp.description[lang]}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {data.projects.length > 0 && (
            <section>
              <div style={{ background: '#f8fafc', borderRadius: '26px', padding: '26px' }}>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '18px' }}>
                  {lang === 'pt' ? 'Projectos' : 'Projects'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  {data.projects.map((project) => (
                    <div key={project.id}>
                      <div style={{ fontWeight: 800 }}>{project.name}</div>
                      {project.link && (
                        <div style={{ color: accentColor, fontSize: '12px', marginTop: '4px' }}>{project.link}</div>
                      )}
                      <div style={{ color: '#475569', lineHeight: 1.7, marginTop: '8px' }}>{project.description[lang]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

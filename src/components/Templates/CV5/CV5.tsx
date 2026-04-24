'use client';

import {
  TemplateProps,
  a4Frame,
  fallbackPhoto,
  labels,
} from '../_shared/TemplateUtils';

/**
 * CV5 - Black header with circular avatar; sidebar (Education/Skills/Languages) +
 * main column (Experience). Inspired by Locofy "CV 5" layout.
 */
export default function CV5({ data, lang }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, settings } = data;
  const accent = settings.accentColor;
  const photo = personalInfo.photo || fallbackPhoto(personalInfo.fullName, accent);

  const sectionTitle: React.CSSProperties = {
    fontSize: '14px',
    letterSpacing: '0.3em',
    fontWeight: 900,
    color: '#000',
    marginBottom: '14px',
  };

  return (
    <div style={a4Frame({ paddingBottom: '60px' })}>
      {/* HEADER */}
      <header style={{ background: '#000', color: '#fff', padding: '40px 50px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${accent}` }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, lineHeight: 1.1 }}>
                {personalInfo.fullName || 'Nome Apelido'}
              </h1>
              {personalInfo.jobTitle[lang] && (
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: 4, letterSpacing: '0.05em' }}>
                  {personalInfo.jobTitle[lang]}
                </div>
              )}
            </div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '10px', textAlign: 'right', opacity: 0.85 }}>
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
            {personalInfo.website && <div>{personalInfo.website}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
          </nav>
        </div>
        <div style={{ marginTop: 20, height: 1, background: '#eee', opacity: 0.4 }} />
      </header>

      {/* BODY */}
      <section style={{ display: 'flex', gap: 30, padding: '28px 50px 0' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 32, color: '#000', fontSize: '10.5px' }}>
          {education.length > 0 && (
            <div>
              <div style={sectionTitle}>{labels.education[lang]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div style={{ fontWeight: 700, fontSize: '11.5px', lineHeight: 1.4 }}>{edu.degree[lang]}</div>
                    <div style={{ marginTop: 4, color: '#444', lineHeight: 1.5 }}>
                      {edu.institution}
                      {edu.year ? <><br />{edu.year}</> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <div style={sectionTitle}>{labels.skills[lang]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {skills.map((s, i) => (
                  <div key={i}>{s[lang] || s.pt || s.en}</div>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <div style={sectionTitle}>{labels.languages[lang]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {languages.map((l, i) => (
                  <div key={i}>
                    <span style={{ fontWeight: 600 }}>{l.name}</span>
                    {l.level[lang] && <span style={{ color: '#555' }}> · {l.level[lang]}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <div style={sectionTitle}>{labels.certifications[lang]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {certifications.map((c) => (
                  <div key={c.id}>
                    <div style={{ fontWeight: 700, fontSize: '11px' }}>{c.name}</div>
                    <div style={{ color: '#555', marginTop: 2 }}>
                      {c.issuer} {c.year ? `· ${c.year}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26, fontSize: '10.5px', color: '#000' }}>
          {summary[lang] && (
            <div>
              <div style={sectionTitle}>{labels.profile[lang]}</div>
              <p style={{ margin: 0, lineHeight: 1.6, color: '#333' }}>{summary[lang]}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <div style={sectionTitle}>{labels.experience[lang]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>{exp.position[lang]}</div>
                    <div style={{ color: '#333', marginTop: 2 }}>
                      {exp.company}
                      {exp.period ? <><br />{exp.period}</> : null}
                    </div>
                    {exp.description[lang] && (
                      <p style={{ margin: '6px 0 0', lineHeight: 1.55, color: '#444', fontWeight: 300 }}>
                        {exp.description[lang]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <div style={sectionTitle}>{labels.projects[lang]}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projects.map((p) => (
                  <div key={p.id}>
                    <div style={{ fontWeight: 700, fontSize: '11.5px' }}>{p.name}</div>
                    {p.link && <div style={{ color: accent, fontSize: '9.5px', marginTop: 2 }}>{p.link}</div>}
                    {p.description[lang] && (
                      <p style={{ margin: '4px 0 0', lineHeight: 1.55, color: '#444' }}>{p.description[lang]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

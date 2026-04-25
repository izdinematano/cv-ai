'use client';

import { TemplateProps, a4Frame, fallbackPhoto, labels } from '../_shared/TemplateUtils';
import BulletList from '../_shared/BulletList';

interface CV6Props extends TemplateProps {
  variant?: 'dark' | 'light';
}

/**
 * CV6 - Editorial layout with selfie photo, two-column body (Experience + Education on left;
 * Skills + Awards/Certs + Languages on right). Supports dark and light variants.
 */
export default function CV6({ data, lang, variant = 'dark' }: CV6Props) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, settings } = data;
  const accent = settings.accentColor;

  const dark = variant === 'dark';
  const bg = dark ? '#0f0f10' : '#f5f3ee';
  const fg = dark ? '#f5f3ee' : '#1a1a1a';
  const subtle = dark ? '#a1a1aa' : '#525252';
  const accentText = dark ? accent : accent;

  const photo = personalInfo.photo || fallbackPhoto(personalInfo.fullName, accent);

  const sectionTitle: React.CSSProperties = {
    fontSize: '13.5px',
    fontWeight: 800,
    color: fg,
    marginBottom: 4,
  };
  const ruler: React.CSSProperties = {
    height: 1,
    background: dark ? 'rgba(245,243,238,0.4)' : 'rgba(0,0,0,0.4)',
    marginBottom: 12,
  };

  return (
    <div style={a4Frame({ background: bg, color: fg, padding: '38px 42px 38px' })}>
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '34px', fontWeight: 900, lineHeight: 1.05 }}>
            {personalInfo.fullName || 'Nome Apelido'}
          </h1>
          {personalInfo.jobTitle[lang] && (
            <h2 style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: 700, color: accentText }}>
              {personalInfo.jobTitle[lang]}
            </h2>
          )}
          <div style={{ display: 'flex', gap: 26, marginTop: 14, fontSize: '9.5px', color: subtle }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {personalInfo.phone && <div>{personalInfo.phone}</div>}
              {personalInfo.email && <div>{personalInfo.email}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
              {personalInfo.website && <div>{personalInfo.website}</div>}
              {personalInfo.location && <div>{personalInfo.location}</div>}
            </div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          style={{ width: 170, height: 110, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
        />
      </header>

      {/* BODY */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* LEFT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {summary[lang] && (
            <div>
              <h2 style={sectionTitle}>{labels.profile[lang]}</h2>
              <div style={ruler} />
              <p style={{ margin: 0, fontSize: '10px', lineHeight: 1.55, color: subtle }}>{summary[lang]}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <h2 style={sectionTitle}>{labels.experience[lang]}</h2>
              <div style={ruler} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div style={{ fontSize: '8px', color: subtle, marginBottom: 2 }}>{exp.period}</div>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 700, color: fg }}>{exp.company}</div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: fg }}>{exp.position[lang]}</div>
                    {exp.description[lang] && (
                      <div style={{ margin: '4px 0 0' }}>
                        <BulletList text={exp.description[lang]} fontSize={9.5} lineHeight={1.5} bulletColor={fg} style={{ color: subtle }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h2 style={sectionTitle}>{labels.education[lang]}</h2>
              <div style={ruler} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div style={{ fontSize: '8px', color: subtle }}>{edu.year}</div>
                    <div style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: 700 }}>{edu.institution}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600 }}>{edu.degree[lang]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {skills.length > 0 && (
            <div>
              <h2 style={sectionTitle}>{labels.skills[lang]}</h2>
              <div style={ruler} />
              <div style={{ fontSize: '9.8px', color: subtle, lineHeight: 1.55 }}>
                {skills.map((s, i) => (
                  <div key={i}>{s[lang] || s.pt || s.en}</div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 style={sectionTitle}>{labels.certifications[lang]}</h2>
              <div style={ruler} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {certifications.map((c) => (
                  <div key={c.id}>
                    <div style={{ fontSize: '8px', color: subtle }}>{c.year}</div>
                    <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 700, color: fg }}>{c.name}</div>
                    <div style={{ fontSize: '9.5px', color: subtle, fontWeight: 500 }}>{c.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <h2 style={sectionTitle}>{labels.projects[lang]}</h2>
              <div style={ruler} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {projects.map((p) => (
                  <div key={p.id}>
                    <div style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 700 }}>{p.name}</div>
                    {p.link && <div style={{ fontSize: '8.5px', color: accentText }}>{p.link}</div>}
                    {p.description[lang] && (
                      <div style={{ margin: '3px 0 0' }}>
                        <BulletList text={p.description[lang]} fontSize={9} lineHeight={1.45} bulletColor={fg} style={{ color: subtle }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h2 style={sectionTitle}>{labels.languages[lang]}</h2>
              <div style={ruler} />
              <div style={{ fontSize: '9.8px', color: subtle, lineHeight: 1.55 }}>
                {languages.map((l, i) => (
                  <div key={i}>
                    <span style={{ fontWeight: 600, color: fg }}>{l.name}</span>
                    {l.level[lang] && <span> · {l.level[lang]}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

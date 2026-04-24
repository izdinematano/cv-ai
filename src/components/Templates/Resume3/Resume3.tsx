'use client';

import { TemplateProps, a4Frame, fallbackPhoto, labels } from '../_shared/TemplateUtils';

/**
 * Resume3 - Two-column with main column on the left (photo + name + profile + experience + education)
 * and a slim right "Details/Skills/Links" sidebar. Soft black accent.
 */
export default function Resume3({ data, lang }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, settings } = data;
  const accent = settings.accentColor;
  const photo = personalInfo.photo || fallbackPhoto(personalInfo.fullName, accent);

  const sectionTitle: React.CSSProperties = {
    margin: 0,
    fontSize: '15px',
    textTransform: 'capitalize',
    letterSpacing: '0.02em',
    fontWeight: 700,
    color: '#000',
    marginBottom: 8,
  };

  return (
    <div
      style={a4Frame({
        display: 'flex',
        alignItems: 'flex-start',
        padding: '40px 34px 60px 40px',
        gap: 50,
        position: 'relative',
        color: 'rgba(0,0,0,0.7)',
        fontSize: '9px',
      })}
    >
      {/* Decorative background letter */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: -250,
          bottom: -100,
          fontSize: 720,
          fontWeight: 900,
          color: 'rgba(0,0,0,0.04)',
          lineHeight: 1,
          pointerEvents: 'none',
          fontFamily: 'serif',
        }}
      >
        {(personalInfo.fullName || 'B').charAt(0).toUpperCase()}
      </div>

      {/* MAIN COLUMN */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#000', textTransform: 'capitalize', lineHeight: 1.1 }}>
              {personalInfo.fullName || 'Nome Apelido'}
            </h3>
            <div style={{ marginTop: 4, fontSize: '10px', textTransform: 'capitalize', color: 'rgba(0,0,0,0.7)' }}>
              {personalInfo.jobTitle[lang]}
            </div>
          </div>
        </div>

        {summary[lang] && (
          <div>
            <h2 style={sectionTitle}>{labels.profile[lang]}</h2>
            <p style={{ margin: 0, fontSize: '9.5px', lineHeight: 1.6 }}>{summary[lang]}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 style={sectionTitle}>{labels.experience[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#000' }}>{exp.company}</div>
                  <div style={{ fontSize: '9.5px' }}>{exp.position[lang]}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.6)' }}>{exp.period}</div>
                  {exp.description[lang] && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                      <div style={{ lineHeight: '13px' }}>•</div>
                      <p style={{ margin: 0, lineHeight: 1.55 }}>{exp.description[lang]}</p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#000' }}>{edu.institution}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.7)' }}>
                    {edu.degree[lang]}{edu.year && `, ${edu.year}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 style={sectionTitle}>{labels.projects[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {projects.map((p) => (
                <div key={p.id}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#000' }}>{p.name}</div>
                  {p.link && <div style={{ fontSize: '9px', color: accent }}>{p.link}</div>}
                  {p.description[lang] && (
                    <p style={{ margin: '3px 0 0', fontSize: '9px', lineHeight: 1.55 }}>{p.description[lang]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR */}
      <aside style={{ width: 130, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 22, position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{ ...sectionTitle, marginBottom: 10 }}>{labels.details[lang]}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '10px' }}>
            {personalInfo.location && (
              <div>
                <b>Address</b>
                <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.7)' }}>{personalInfo.location}</div>
              </div>
            )}
            {personalInfo.phone && (
              <div>
                <b>Phone</b>
                <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.7)' }}>{personalInfo.phone}</div>
              </div>
            )}
            {personalInfo.email && (
              <div>
                <b>Email</b>
                <div style={{ fontSize: '9px', color: 'rgba(0,0,0,0.7)' }}>{personalInfo.email}</div>
              </div>
            )}
          </div>
        </div>

        {(personalInfo.linkedin || personalInfo.website) && (
          <div>
            <h2 style={{ ...sectionTitle, marginBottom: 10 }}>{labels.links[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '9.5px' }}>
              {personalInfo.linkedin && <div style={{ wordBreak: 'break-all' }}>{personalInfo.linkedin}</div>}
              {personalInfo.website && <div style={{ wordBreak: 'break-all' }}>{personalInfo.website}</div>}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 style={{ ...sectionTitle, marginBottom: 10 }}>{labels.skills[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {skills.map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '9.5px' }}>{s[lang] || s.pt || s.en}</div>
                  <div
                    style={{
                      marginTop: 3,
                      height: 2,
                      width: '100%',
                      background: 'rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: 2,
                        width: `${60 + ((i * 11) % 40)}%`,
                        background: '#000',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 style={{ ...sectionTitle, marginBottom: 10 }}>{labels.languages[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '9.5px' }}>
              {languages.map((l, i) => (
                <div key={i}>
                  <b>{l.name}</b>
                  {l.level[lang] && <div style={{ color: 'rgba(0,0,0,0.7)' }}>{l.level[lang]}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 style={{ ...sectionTitle, marginBottom: 10 }}>{labels.certifications[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '9px' }}>
              {certifications.map((c) => (
                <div key={c.id}>
                  <b style={{ fontSize: '9.5px', color: '#000' }}>{c.name}</b>
                  <div style={{ color: 'rgba(0,0,0,0.7)' }}>{c.issuer} {c.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

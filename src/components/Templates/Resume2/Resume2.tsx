'use client';

import { TemplateProps, a4Frame, fallbackPhoto, labels } from '../_shared/TemplateUtils';

/**
 * Resume2 - Editorial spread: large left column with photo, name, skills, education, languages;
 * right column with contact, about-me and experience entries; thin divider in the middle.
 */
export default function Resume2({ data, lang }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, settings } = data;
  const accent = settings.accentColor;
  const photo = personalInfo.photo || fallbackPhoto(personalInfo.fullName, accent);

  const sectionTitle: React.CSSProperties = {
    margin: 0,
    fontSize: '17px',
    fontWeight: 600,
    color: '#000',
  };
  const divider: React.CSSProperties = { height: 1, background: '#ccc', width: '100%' };
  const Bullet = () => (
    <div style={{ width: 6, height: 6, borderRadius: 3, background: '#000', marginTop: 8, flexShrink: 0 }} />
  );

  return (
    <div style={a4Frame({ display: 'flex', alignItems: 'flex-start', gap: 36, padding: '50px 60px', color: '#000' })}>
      {/* LEFT COLUMN */}
      <section style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 4 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 600, lineHeight: 1.1 }}>
            {personalInfo.fullName || 'Nome Apelido'}
          </h1>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 300, color: '#333' }}>
            {personalInfo.jobTitle[lang]}
          </h2>
        </div>

        {skills.length > 0 && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.skills[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {skills.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Bullet />
                  <div style={{ fontSize: '12px', fontWeight: 300 }}>{s[lang] || s.pt || s.en}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {education.length > 0 && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.education[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Bullet />
                    <div style={{ fontSize: '12px', fontWeight: 300 }}>{edu.year}</div>
                  </div>
                  <div style={{ paddingLeft: 18, fontSize: '12px', fontWeight: 600, marginTop: 2 }}>{edu.degree[lang]}</div>
                  <div style={{ paddingLeft: 18, fontSize: '12px', fontWeight: 300, color: '#444' }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {languages.length > 0 && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.languages[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {languages.map((l, i) => (
                <div key={i} style={{ fontSize: '12px' }}>
                  <span style={{ fontWeight: 600 }}>{l.name}</span>
                  {l.level[lang] && <span style={{ fontWeight: 300 }}> · {l.level[lang]}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {certifications.length > 0 && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.certifications[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ fontSize: '11.5px' }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontWeight: 300, color: '#555' }}>{c.issuer} {c.year && `· ${c.year}`}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* DIVIDER */}
      <div style={{ width: 1, alignSelf: 'stretch', background: '#ccc', flexShrink: 0 }} />

      {/* RIGHT COLUMN */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
        <h1 style={{ ...sectionTitle, fontSize: '20px' }}>{labels.contact[lang]}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px', fontWeight: 300 }}>
          {personalInfo.phone && <div>📞 {personalInfo.phone}</div>}
          {personalInfo.email && <div>✉️ {personalInfo.email}</div>}
          {personalInfo.website && <div>🌐 {personalInfo.website}</div>}
          {personalInfo.linkedin && <div>in {personalInfo.linkedin}</div>}
          {personalInfo.location && <div>📍 {personalInfo.location}</div>}
        </div>

        {summary[lang] && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.about[lang]}</h2>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 300, lineHeight: 1.55 }}>{summary[lang]}</p>
          </>
        )}

        {experience.length > 0 && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.experience[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Bullet />
                    <div style={{ fontSize: '12px', fontWeight: 300 }}>{exp.period}</div>
                  </div>
                  <div style={{ paddingLeft: 18, fontSize: '12px', fontWeight: 600, marginTop: 2 }}>{exp.position[lang]}</div>
                  <div style={{ paddingLeft: 18, fontSize: '12px', fontWeight: 300, color: '#444' }}>{exp.company}</div>
                  {exp.description[lang] && (
                    <p style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '11.5px', fontWeight: 300, lineHeight: 1.55 }}>
                      {exp.description[lang]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {projects.length > 0 && (
          <>
            <div style={divider} />
            <h2 style={sectionTitle}>{labels.projects[lang]}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {projects.map((p) => (
                <div key={p.id} style={{ paddingLeft: 18 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.name}</div>
                  {p.link && <div style={{ fontSize: '11px', color: accent, fontWeight: 300 }}>{p.link}</div>}
                  {p.description[lang] && (
                    <p style={{ margin: '4px 0 0', fontSize: '11.5px', fontWeight: 300, lineHeight: 1.55 }}>{p.description[lang]}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

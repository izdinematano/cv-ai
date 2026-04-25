'use client';

import { TemplateProps, a4Frame, fallbackPhoto, labels } from '../_shared/TemplateUtils';
import BulletList from '../_shared/BulletList';

/**
 * CV7 - Sidebar with large square photo + centered details (Location/Phone/Email/Languages/Skills);
 * main column with name + summary + timeline-style Experience and Education.
 */
export default function CV7({ data, lang }: TemplateProps) {
  const { personalInfo, summary, experience, education, skills, languages, projects, certifications, settings } = data;
  const accent = settings.accentColor;
  const photo = personalInfo.photo || fallbackPhoto(personalInfo.fullName, accent);

  const blockTitle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#000',
  };
  const underline: React.CSSProperties = {
    width: 34,
    height: 0,
    borderTop: '2px solid #000',
    marginTop: 4,
    marginBottom: 12,
  };

  const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 14px' }}>
      <h3 style={blockTitle}>{title}</h3>
      <div style={underline} />
      <div style={{ fontSize: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, color: '#000', fontWeight: 500 }}>
        {children}
      </div>
    </div>
  );

  const TimelineRow = ({
    period,
    place,
    title,
    org,
    description,
    accentDot,
  }: { period: string; place?: string; title: string; org: string; description?: string; accentDot?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ width: 106, textAlign: 'right', fontSize: '8.5px', color: '#000', fontWeight: 500, lineHeight: 1.3 }}>
        <div>{period}</div>
        {place && <div style={{ marginTop: 2 }}>{place}</div>}
      </div>
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: '#fff',
          border: `2.5px solid ${accentDot ? accent : '#000'}`,
          flexShrink: 0,
          marginTop: 1,
        }}
      />
      <div style={{ flex: 1, fontSize: '9px', color: '#000', lineHeight: 1.3 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ fontWeight: 500, marginTop: 1 }}>{org}</div>
        {description && (
          <div style={{ marginTop: 4 }}>
            <BulletList text={description} fontSize={9} lineHeight={1.45} bulletColor="#000" style={{ color: '#444' }} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={a4Frame({ display: 'flex', alignItems: 'flex-start', padding: '0 24px 24px 0', gap: 24 })}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          minHeight: '1122px',
          background: '#fff',
          boxShadow: '2px 0 14px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          paddingBottom: 32,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" style={{ width: 190, height: 190, objectFit: 'cover', alignSelf: 'flex-start' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: '10px', textAlign: 'center', padding: '0 12px' }}>
          {personalInfo.location && (
            <div>
              <b style={{ fontSize: '10px' }}>Location</b>
              <div style={{ fontWeight: 500 }}>{personalInfo.location}</div>
            </div>
          )}
          {personalInfo.phone && (
            <div>
              <b style={{ fontSize: '10px' }}>Phone</b>
              <div style={{ fontWeight: 500 }}>{personalInfo.phone}</div>
            </div>
          )}
          {personalInfo.email && (
            <div>
              <b style={{ fontSize: '10px' }}>Email</b>
              <div style={{ fontWeight: 500 }}>{personalInfo.email}</div>
            </div>
          )}
          {personalInfo.linkedin && (
            <div>
              <b style={{ fontSize: '10px' }}>LinkedIn</b>
              <div style={{ fontWeight: 500, wordBreak: 'break-all' }}>{personalInfo.linkedin}</div>
            </div>
          )}
          {personalInfo.website && (
            <div>
              <b style={{ fontSize: '10px' }}>Website</b>
              <div style={{ fontWeight: 500, wordBreak: 'break-all' }}>{personalInfo.website}</div>
            </div>
          )}
        </div>

        {languages.length > 0 && (
          <SidebarSection title={labels.languages[lang]}>
            {languages.map((l, i) => (
              <div key={i}>
                <b>{l.name}</b>
                {l.level[lang] && <div style={{ fontWeight: 400, fontSize: '9px' }}>{l.level[lang]}</div>}
              </div>
            ))}
          </SidebarSection>
        )}

        {skills.length > 0 && (
          <SidebarSection title={labels.skills[lang]}>
            {skills.map((s, i) => (
              <div key={i}>{s[lang] || s.pt || s.en}</div>
            ))}
          </SidebarSection>
        )}

        {certifications.length > 0 && (
          <SidebarSection title={labels.certifications[lang]}>
            {certifications.map((c) => (
              <div key={c.id}>
                <b>{c.name}</b>
                <div style={{ fontWeight: 400, fontSize: '9px' }}>{c.issuer} {c.year}</div>
              </div>
            ))}
          </SidebarSection>
        )}
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 28, minWidth: 0 }}>
        {/* Header text */}
        <div style={{ paddingLeft: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#000', lineHeight: 1.2 }}>
            {personalInfo.fullName || 'Nome Apelido'}
          </h1>
          <div>
            <h2 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#000' }}>{personalInfo.jobTitle[lang]}</h2>
          </div>
          {summary[lang] && (
            <div style={{ fontSize: '10px', lineHeight: 1.45, color: '#000', fontWeight: 500 }}>{summary[lang]}</div>
          )}
        </div>

        {/* Experience */}
        {experience.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ paddingLeft: 8 }}>
              <h2 style={blockTitle}>{labels.experience[lang]}</h2>
              <div style={underline} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
              {experience.map((exp, i) => (
                <TimelineRow
                  key={exp.id}
                  period={exp.period}
                  title={exp.position[lang]}
                  org={exp.company}
                  description={exp.description[lang]}
                  accentDot={i === 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ paddingLeft: 8 }}>
              <h2 style={blockTitle}>{labels.education[lang]}</h2>
              <div style={underline} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {education.map((edu) => (
                <TimelineRow
                  key={edu.id}
                  period={edu.year}
                  title={edu.degree[lang]}
                  org={edu.institution}
                />
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ paddingLeft: 8 }}>
              <h2 style={blockTitle}>{labels.projects[lang]}</h2>
              <div style={underline} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8 }}>
              {projects.map((p) => (
                <div key={p.id}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#000' }}>{p.name}</div>
                  {p.link && <div style={{ fontSize: '9px', color: accent, marginTop: 2 }}>{p.link}</div>}
                  {p.description[lang] && (
                    <div style={{ margin: '4px 0 0' }}>
                      <BulletList text={p.description[lang]} fontSize={9.5} lineHeight={1.5} bulletColor="#000" style={{ color: '#444' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

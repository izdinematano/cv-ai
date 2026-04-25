'use client';

import { CVData } from '@/store/useCVStore';
import BulletList from '../_shared/BulletList';
import styles from './Resume1.module.css';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

const ASSET_BASE = '/templates/resume1';

const labels = {
  education: { pt: 'EDUCAÇÃO', en: 'EDUCATION' },
  skills: { pt: 'COMPETÊNCIAS', en: 'SKILLS' },
  languages: { pt: 'IDIOMAS', en: 'LANGUAGES' },
  profile: { pt: 'PERFIL', en: 'PROFILE' },
  experience: { pt: 'EXPERIÊNCIA', en: 'EXPERIENCE' },
  projects: { pt: 'PROJETOS', en: 'PROJECTS' },
  certifications: { pt: 'CERTIFICAÇÕES', en: 'CERTIFICATIONS' },
} as const;

/**
 * Resume 1 — converted from Locofy layout. Pixel-perfect base layout, but the
 * left column also lists Languages, and the right column shows Projects and
 * Certifications below Experience so the user never loses content.
 */
export default function Resume1({ data, lang }: TemplateProps) {
  const {
    personalInfo,
    summary,
    education,
    skills,
    languages,
    experience,
    projects,
    certifications,
    settings,
  } = data;
  const accent = settings.accentColor;

  const nameParts = (personalInfo.fullName || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  const photo = personalInfo.photo || `${ASSET_BASE}/Group-1@2x.png`;

  const SectionHeader = ({ title }: { title: string }) => (
    <div className={styles.sectionHeader}>
      <b className={styles.sectionTitle}>{title}</b>
      <div className={styles.sectionRule} />
    </div>
  );

  const ProfileHeader = ({ title }: { title: string }) => (
    <div className={styles.profileHeader}>
      <b className={styles.profileTitle}>{title}</b>
      <div className={styles.ruleLong} />
    </div>
  );

  return (
    <div
      className={styles.root}
      style={{ ['--color-chocolate' as never]: accent } as React.CSSProperties}
    >
      {/* LEFT COLUMN */}
      <section className={styles.leftColumn}>
        <div className={styles.nameBlock}>
          <h1 className={styles.name}>
            {firstName}
            {lastName ? (
              <>
                <br />
                {lastName}
              </>
            ) : null}
          </h1>
          <div className={styles.titleRow}>
            <div className={styles.decorationWrapper}>
              <div className={styles.decoration} />
            </div>
            <div className={styles.titleText}>{personalInfo.jobTitle[lang]}</div>
          </div>
        </div>

        {personalInfo.location && (
          <div className={styles.locationRow}>
            <img className={styles.mapIcon} alt="" src={`${ASSET_BASE}/Map-Pin.svg`} />
            <div>{personalInfo.location}</div>
          </div>
        )}

        <div className={styles.sectionBlock}>
          {education.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <SectionHeader title={labels.education[lang]} />
              <div className={styles.sectionBody}>
                {education.map((edu) => (
                  <div key={edu.id} className={styles.courseBlock}>
                    <div className={styles.courseBox}>
                      <div className={styles.courseTitle}>{edu.degree[lang]}</div>
                      <div className={styles.courseMeta}>{edu.institution}</div>
                      <div className={styles.courseMeta}>{edu.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <SectionHeader title={labels.skills[lang]} />
              <div className={styles.skillsList}>
                {skills.map((s, i) => (
                  <div key={i} className={styles.skillRow}>
                    <div className={styles.skillDot} />
                    <div>{s[lang] || s.pt || s.en}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
              <SectionHeader title={labels.languages[lang]} />
              <div className={styles.skillsList}>
                {languages.map((l, i) => (
                  <div key={i} className={styles.langRow}>
                    <span className={styles.langName}>{l.name}</span>
                    <span className={styles.langLevel}>{l.level[lang]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RIGHT COLUMN */}
      <section className={styles.rightColumn}>
        <div className={styles.contactHeader}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.photo} alt="" src={photo} />

          <div className={styles.contactInfo}>
            {personalInfo.email && (
              <div className={styles.contactRow}>
                <img className={styles.contactIcon} alt="" src={`${ASSET_BASE}/Group-3.svg`} />
                <div className={styles.contactText}>{personalInfo.email}</div>
              </div>
            )}
            {personalInfo.phone && (
              <div className={styles.contactRow}>
                <img className={styles.contactIcon} alt="" src={`${ASSET_BASE}/Group-2.svg`} />
                <div className={styles.contactText}>{personalInfo.phone}</div>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className={styles.contactRow}>
                <img className={styles.contactIcon} alt="" src={`${ASSET_BASE}/x31-0-Linkedin.svg`} />
                <div className={styles.contactText}>{personalInfo.linkedin}</div>
              </div>
            )}
            {personalInfo.website && (
              <div className={styles.contactRow}>
                <img className={styles.contactIcon} alt="" src={`${ASSET_BASE}/Vector.svg`} />
                <div className={styles.contactText}>{personalInfo.website}</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.profileWrapper}>
          <div className={styles.profileContainer}>
            {summary[lang] && (
              <div className={styles.profileHeaderBlock}>
                <ProfileHeader title={labels.profile[lang]} />
                <div className={styles.profileDescription}>
                  <div className={styles.profileText}>{summary[lang]}</div>
                </div>
              </div>
            )}

            {experience.length > 0 && (
              <div className={styles.experienceBlock}>
                <div className={styles.experienceHeaderWrapper}>
                  <ProfileHeader title={labels.experience[lang]} />
                </div>
                <div className={styles.experienceList}>
                  <div className={styles.experienceItems}>
                    {experience.map((exp) => (
                      <div key={exp.id} className={styles.experienceItem}>
                        <div className={styles.jobHeader}>
                          <div className={styles.jobTitleBlock}>
                            <p className={styles.jobPosition}>{exp.position[lang]}</p>
                            <p className={styles.jobCompany}>{exp.company}</p>
                          </div>
                          <div className={styles.jobPeriod}>{exp.period}</div>
                        </div>
                        <div className={styles.jobDescription}>
                          <BulletList text={exp.description[lang]} className={styles.jobText} bulletColor="var(--color-chocolate, #0f766e)" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className={styles.experienceBlock}>
                <div className={styles.experienceHeaderWrapper}>
                  <ProfileHeader title={labels.projects[lang]} />
                </div>
                <div className={styles.experienceItems}>
                  {projects.map((p) => (
                    <div key={p.id} className={styles.projectItem}>
                      <div className={styles.projectName}>{p.name}</div>
                      {p.link && <div className={styles.projectLink}>{p.link}</div>}
                      <BulletList text={p.description[lang]} className={styles.jobText} bulletColor="var(--color-chocolate, #0f766e)" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className={styles.experienceBlock}>
                <div className={styles.experienceHeaderWrapper}>
                  <ProfileHeader title={labels.certifications[lang]} />
                </div>
                <div className={styles.experienceItems}>
                  {certifications.map((c) => (
                    <div key={c.id} className={styles.projectItem}>
                      <div className={styles.projectName}>{c.name}</div>
                      <div className={styles.jobText}>
                        {c.issuer} {c.year ? `· ${c.year}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

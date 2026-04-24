'use client';

import type { CSSProperties } from 'react';
import type { CVData } from '@/store/useCVStore';
import { labels } from './TemplateUtils';

interface TemplateExtrasProps {
  data: CVData;
  lang: 'pt' | 'en';
  /** Accent color of the template */
  accentColor: string;
  /** Optional style hint: "muted" for clean templates, "bold" for striking templates */
  variant?: 'muted' | 'bold' | 'dark';
  /** Optional style overrides for the wrapper */
  wrapperStyle?: CSSProperties;
  /** Override section title color */
  titleColor?: string;
  /** Override label transform: "upper" (default) renders titles in uppercase */
  titleTransform?: 'upper' | 'capitalize' | 'none';
  /** Section gap */
  sectionGap?: number;
  /** Optional grid layout override */
  twoColumns?: boolean;
}

/**
 * TemplateExtras - shared appendix renderer for Languages, Projects and
 * Certifications. Drop this at the bottom of any template that does not
 * already render those sections, so the user never loses their content.
 */
export default function TemplateExtras({
  data,
  lang,
  accentColor,
  variant = 'muted',
  wrapperStyle,
  titleColor,
  titleTransform = 'upper',
  sectionGap = 22,
  twoColumns = false,
}: TemplateExtrasProps) {
  const { languages, projects, certifications } = data;

  if (!languages.length && !projects.length && !certifications.length) return null;

  const isDark = variant === 'dark';
  const isBold = variant === 'bold';
  const titleStyle: CSSProperties = {
    fontSize: '13px',
    fontWeight: isBold ? 800 : 700,
    color: titleColor || (isDark ? '#f5f5f4' : '#0f172a'),
    textTransform: titleTransform === 'upper' ? 'uppercase' : titleTransform === 'capitalize' ? 'capitalize' : 'none',
    letterSpacing: titleTransform === 'upper' ? '0.06em' : '0.01em',
    margin: 0,
    marginBottom: 8,
  };
  const subText: CSSProperties = {
    color: isDark ? '#a1a1aa' : '#475569',
    fontSize: '11px',
    lineHeight: 1.55,
  };
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.08)';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h3 style={titleStyle}>{title}</h3>
      {children}
    </section>
  );

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: '10.5px',
        fontWeight: 600,
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
        color: isDark ? '#f5f5f4' : '#0f172a',
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );

  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 18,
        borderTop: cardBorder,
        display: twoColumns ? 'grid' : 'flex',
        flexDirection: twoColumns ? undefined : 'column',
        gridTemplateColumns: twoColumns ? '1fr 1fr' : undefined,
        gap: sectionGap,
        ...wrapperStyle,
      }}
    >
      {languages.length > 0 && (
        <Section title={labels.languages[lang]}>
          <div>
            {languages.map((l, i) => (
              <Pill key={i}>
                {l.name}
                {l.level[lang] && <span style={{ opacity: 0.7, fontWeight: 400 }}> · {l.level[lang]}</span>}
              </Pill>
            ))}
          </div>
        </Section>
      )}

      {projects.length > 0 && (
        <Section title={labels.projects[lang]}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map((p) => (
              <div key={p.id}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: titleColor || (isDark ? '#f5f5f4' : '#0f172a') }}>
                  {p.name}
                </div>
                {p.link && (
                  <div style={{ fontSize: '10.5px', color: accentColor, marginTop: 1 }}>{p.link}</div>
                )}
                {p.description[lang] && (
                  <p style={{ ...subText, margin: '4px 0 0' }}>{p.description[lang]}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {certifications.length > 0 && (
        <Section title={labels.certifications[lang]}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {certifications.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: titleColor || (isDark ? '#f5f5f4' : '#0f172a') }}>
                    {c.name}
                  </div>
                  {c.issuer && <div style={subText}>{c.issuer}</div>}
                </div>
                {c.year && <div style={{ ...subText, whiteSpace: 'nowrap' }}>{c.year}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

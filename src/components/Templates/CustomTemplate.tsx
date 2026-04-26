'use client';

/**
 * Renderer for admin-authored custom templates.
 *
 * Strategy: the template spec is a list of absolutely-positioned blocks inside
 * a fixed A4 canvas. Each block type maps to a small binding that reads from
 * the live CVData. Inside each block we render with natural flow so content
 * remains readable even when the block is resized.
 *
 * The same component is used:
 *   - live in the editor preview + dashboard thumbnails
 *   - during PDF export (html2canvas-pro captures the rendered DOM)
 *   - in the admin builder canvas (non-interactive preview layer)
 */

import type { CSSProperties, ReactNode } from 'react';
import type { CVData } from '@/store/useCVStore';
import {
  A4_HEIGHT,
  A4_WIDTH,
  type CustomTemplateBlock,
  type CustomTemplateSpec,
} from '@/lib/customTemplate';
import BulletList from './_shared/BulletList';

interface Props {
  spec: CustomTemplateSpec;
  data: CVData;
  lang: 'pt' | 'en';
  /** When true, suppress overflow:hidden on blocks so users can see content
   *  spilling out of undersized blocks during editing. */
  showOverflow?: boolean;
}

export default function CustomTemplate({ spec, data, lang, showOverflow }: Props) {
  const sorted = [...spec.blocks].sort((a, b) => (a.z ?? 1) - (b.z ?? 1));
  const pages = Math.max(1, spec.pages || 1);
  const totalHeight = A4_HEIGHT * pages;
  return (
    <div
      className="custom-template-root"
      style={{
        width: A4_WIDTH,
        minHeight: totalHeight,
        height: totalHeight,
        background: spec.bgColor,
        color: spec.textColor,
        fontFamily: spec.fontFamily,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Page-break markers. Visible in the builder (dashed line); invisible
          at export time since the PDF exporter already paginates on A4 bounds. */}
      {pages > 1 &&
        Array.from({ length: pages - 1 }).map((_, i) => (
          <div
            key={`break-${i}`}
            className="custom-template-pagebreak"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: (i + 1) * A4_HEIGHT,
              height: 0,
              borderTop: '1px dashed rgba(148,163,184,0.5)',
              pointerEvents: 'none',
              zIndex: 999,
            }}
          />
        ))}
      {sorted.map((block) => (
        <BlockFrame key={block.id} block={block} showOverflow={showOverflow}>
          <BlockContent block={block} spec={spec} data={data} lang={lang} />
        </BlockFrame>
      ))}
    </div>
  );
}

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.1)',
  lg: '0 8px 30px rgba(0,0,0,0.15)',
};

function BlockFrame({
  block,
  children,
  showOverflow,
}: {
  block: CustomTemplateBlock;
  children: ReactNode;
  showOverflow?: boolean;
}) {
  const p = block.props || {};
  const bg = p.gradient || p.bg;
  const style: CSSProperties = {
    position: 'absolute',
    left: block.x,
    top: block.y,
    width: block.w,
    height: block.h,
    padding: p.padding ?? 0,
    background: bg,
    border: p.borderWidth ? `${p.borderWidth}px solid ${p.borderColor || '#e5e7eb'}` : p.border,
    borderRadius: p.radius,
    color: p.color,
    fontSize: p.fontSize,
    fontWeight: p.fontWeight,
    textAlign: p.align,
    lineHeight: p.lineHeight ?? 1.45,
    overflow: showOverflow ? 'visible' : 'hidden',
    zIndex: block.z ?? 1,
    opacity: p.opacity ?? 1,
    boxShadow: SHADOW_MAP[p.shadow || 'none'] || 'none',
  };
  const shape = p.shape || 'rect';
  if (block.type === 'shape' && shape === 'circle') {
    style.borderRadius = '50%';
  }
  // Special shapes rendered via clip-path
  if (block.type === 'shape') {
    if (shape === 'triangle') style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    if (shape === 'diamond') style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    if (shape === 'hexagon') style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
    if (shape === 'wave') {
      style.clipPath = 'none';
      style.background = 'none';
    }
    if (shape === 'sidebar-strip') {
      style.borderRadius = 0;
    }
  }
  return (
    <div style={style}>
      {block.type === 'shape' && shape === 'wave' && (
        <svg viewBox="0 0 800 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path d="M0,40 C200,100 600,0 800,60 L800,120 L0,120 Z" fill={p.bg || '#eef2ff'} />
        </svg>
      )}
      {block.type === 'shape' && shape === 'dots-pattern' && (
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <defs><pattern id={`dots-${block.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill={p.bg || '#cbd5e1'} /></pattern></defs>
          <rect width="100%" height="100%" fill={`url(#dots-${block.id})`} />
        </svg>
      )}
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Individual block renderers                                                 */
/* -------------------------------------------------------------------------- */

function BlockContent({
  block,
  spec,
  data,
  lang,
}: {
  block: CustomTemplateBlock;
  spec: CustomTemplateSpec;
  data: CVData;
  lang: 'pt' | 'en';
}) {
  switch (block.type) {
    case 'shape':
    case 'divider':
      return null;
    case 'text':
      return <TextBlock block={block} />;
    case 'photo':
      return <PhotoBlock data={data} />;
    case 'header':
      return <HeaderBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'summary':
      return <SummaryBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'experience':
      return <ExperienceBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'education':
      return <EducationBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'skills':
      return <SkillsBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'languages':
      return <LanguagesBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'projects':
      return <ProjectsBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'certifications':
      return <CertificationsBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'references':
      return <ReferencesBlock block={block} data={data} lang={lang} spec={spec} />;
    case 'icon':
      return <IconBlock block={block} />;
    case 'contact-bar':
      return <ContactBarBlock block={block} data={data} />;
    case 'rating':
      return <RatingBlock block={block} />;
    case 'image':
      return <ImageBlock block={block} />;
    default:
      return null;
  }
}

const sectionTitleStyle = (spec: CustomTemplateSpec, block: CustomTemplateBlock): CSSProperties => ({
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: spec.accentColor,
  marginBottom: 8,
  textAlign: block.props?.align,
});

const subtleText = (spec: CustomTemplateSpec): CSSProperties => ({
  color: spec.mutedColor,
  fontSize: 11.5,
});

/** Allow a tight subset of inline HTML so admins can bold/italic/underline.
 *  Anything else is escaped. */
const SAFE_TAGS = /<\/?(?:b|strong|i|em|u|br|span)(?:\s[^>]*)?>/gi;
const escapeHtml = (s: string) =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

const sanitizeRichText = (raw: string) => {
  const placeholders: string[] = [];
  // Extract safe tags into placeholders, escape the rest, then restore.
  const withPlaceholders = raw.replace(SAFE_TAGS, (match) => {
    placeholders.push(match);
    return `\u0000${placeholders.length - 1}\u0000`;
  });
  const escaped = escapeHtml(withPlaceholders);
  return escaped.replace(/\u0000(\d+)\u0000/g, (_, i) => placeholders[Number(i)]);
};

function TextBlock({ block }: { block: CustomTemplateBlock }) {
  const raw = block.props?.content || '';
  const html = sanitizeRichText(raw).replace(/\n/g, '<br/>');
  return (
    <div
      style={{ fontSize: block.props?.fontSize ?? 13, lineHeight: block.props?.lineHeight ?? 1.5 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PhotoBlock({ data }: { data: CVData }) {
  if (data.personalInfo.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={data.personalInfo.photo}
        alt={data.personalInfo.fullName || 'Profile photo'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
      />
    );
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(148,163,184,0.15)',
        color: '#94a3b8',
        fontSize: 10,
        borderRadius: 'inherit',
      }}
    >
      Photo
    </div>
  );
}

function HeaderBlock({
  block,
  data,
  lang,
  spec,
}: {
  block: CustomTemplateBlock;
  data: CVData;
  lang: 'pt' | 'en';
  spec: CustomTemplateSpec;
}) {
  const align = block.props?.align || 'left';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', textAlign: align }}>
      <div style={{ fontSize: block.props?.fontSize ?? 28, fontWeight: 800, letterSpacing: '-0.02em', color: block.props?.color ?? spec.textColor }}>
        {data.personalInfo.fullName || 'First Last'}
      </div>
      <div style={{ fontSize: 13, color: spec.accentColor, fontWeight: 600, marginTop: 4 }}>
        {data.personalInfo.jobTitle[lang] || data.personalInfo.jobTitle.pt || ''}
      </div>
      <div style={{ fontSize: 11, color: spec.mutedColor, marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
        {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location, data.personalInfo.linkedin, data.personalInfo.website]
          .filter(Boolean)
          .map((line, i) => (
            <span key={i}>{line}</span>
          ))}
      </div>
    </div>
  );
}

function SummaryBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  const text = data.summary[lang] || data.summary.pt || '';
  if (!text) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Perfil' : 'Profile')}
        </div>
      )}
      <p style={{ fontSize: block.props?.fontSize ?? 12.5, lineHeight: 1.55, margin: 0, color: spec.textColor }}>{text}</p>
    </div>
  );
}

function ExperienceBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.experience.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Experiência' : 'Experience')}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.experience.map((e) => (
          <div key={e.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                {e.position[lang] || e.position.pt}
                {e.company ? <span style={{ color: spec.accentColor, fontWeight: 600 }}> · {e.company}</span> : null}
              </div>
              {e.period && <div style={subtleText(spec)}>{e.period}</div>}
            </div>
            {(e.description[lang] || e.description.pt) && (
              <div style={{ margin: '4px 0 0' }}>
                <BulletList text={e.description[lang] || e.description.pt} fontSize={11.5} lineHeight={1.5} bulletColor={spec.accentColor} style={{ color: spec.mutedColor }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.education.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Educação' : 'Education')}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.education.map((e) => (
          <div key={e.id}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{e.degree[lang] || e.degree.pt}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, ...subtleText(spec) }}>
              <span>{e.institution}</span>
              {e.year && <span>{e.year}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.skills.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || 'Skills'}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {data.skills.map((s, i) => {
          const label = s[lang] || s.pt || s.en;
          if (!label) return null;
          return (
            <span
              key={i}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 999,
                background: `${spec.accentColor}14`,
                color: spec.accentColor,
                fontWeight: 600,
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function LanguagesBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.languages.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Idiomas' : 'Languages')}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.languages.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
            <span style={{ fontWeight: 600 }}>{l.name}</span>
            <span style={{ color: spec.mutedColor }}>{l.level[lang] || l.level.pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.projects.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Projetos' : 'Projects')}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.projects.map((p) => (
          <div key={p.id}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>
              {p.name}
              {p.link ? <span style={{ color: spec.accentColor, fontSize: 11, marginLeft: 6 }}>{p.link}</span> : null}
            </div>
            {(p.description[lang] || p.description.pt) && (
              <div style={{ margin: '2px 0 0' }}>
                <BulletList text={p.description[lang] || p.description.pt} fontSize={11.5} lineHeight={1.5} bulletColor={spec.accentColor} style={{ color: spec.mutedColor }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.certifications.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Certificações' : 'Certifications')}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.certifications.map((c) => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
            <span style={{ fontWeight: 600 }}>
              {c.name}
              {c.issuer ? <span style={{ color: spec.mutedColor, fontWeight: 400 }}> · {c.issuer}</span> : null}
            </span>
            {c.year && <span style={{ color: spec.mutedColor }}>{c.year}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferencesBlock({ block, data, lang, spec }: { block: CustomTemplateBlock; data: CVData; lang: 'pt' | 'en'; spec: CustomTemplateSpec }) {
  if (!data.references.length) return null;
  return (
    <div>
      {block.props?.showTitle && (
        <div style={sectionTitleStyle(spec, block)}>
          {block.props?.title || (lang === 'pt' ? 'Referências' : 'References')}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {data.references.map((r) => (
          <div key={r.id} style={{ fontSize: 11.5 }}>
            <div style={{ fontWeight: 700 }}>{r.name}</div>
            <div style={{ color: spec.mutedColor }}>
              {[r.role, r.company].filter(Boolean).join(' · ')}
            </div>
            {r.contact && <div style={{ color: spec.accentColor }}>{r.contact}</div>}
            {r.relationship[lang] && (
              <div style={{ color: spec.mutedColor, fontStyle: 'italic' }}>{r.relationship[lang]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Decorative / utility blocks                                                */
/* -------------------------------------------------------------------------- */

/** Inline SVG icon library — no external deps, works in PDF export. */
const ICON_PATHS: Record<string, string> = {
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z',
  briefcase: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.61.68 2.37a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.76.32 1.56.55 2.37.68A2 2 0 0122 16.92z',
  mappin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 7a3 3 0 100 6 3 3 0 000-6z',
  globe: 'M12 2a10 10 0 100 20 10 10 0 000-20z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 2a2 2 0 100 4 2 2 0 000-4z',
  github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22',
  award: 'M12 15l-3.5 6.5L12 19l3.5 2.5L12 15z M8.21 13.89L7 23l5-3 5 3-1.21-9.12 M12 2a7 7 0 100 14 7 7 0 000-14z',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z',
  check: 'M20 6L9 17l-5-5',
  target: 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 6a6 6 0 100 12 6 6 0 000-12z M12 10a2 2 0 100 4 2 2 0 000-4z',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  code: 'M16 18l6-6-6-6 M8 6l-6 6 6 6',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20 M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z',
  coffee: 'M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3',
  palette: 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10a2 2 0 002-2c0-.53-.21-1.01-.54-1.36-.33-.35-.46-.83-.46-1.32a2 2 0 012-2.32h2.36A5.65 5.65 0 0022 9.64C22 5.32 17.52 2 12 2z',
  camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 13a4 4 0 100-8 4 4 0 000 8z',
  music: 'M9 18V5l12-2v13 M9 18a3 3 0 11-6 0 3 3 0 016 0z M21 16a3 3 0 11-6 0 3 3 0 016 0z',
  rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z M12 15l-3-3 M22 2l-7.5 7.5 M16 8l3-3 M15 15l3 3 M8 9l-3 3 M12 2a10 10 0 019.95 9',
  crown: 'M2 17l2-8 4 4 4-8 4 8 4-4 2 8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  flame: 'M12 22c3.98 0 7-2.24 7-6.06 0-3.18-2.45-5.88-3.5-6.94-.3.46-1.74 2.86-2.5 3.5-.76-.64-1-2.63-1-4-.82.64-2.02 1.77-2.76 3.06C7.82 14.2 7 16 7 17.5 7 19.76 8.94 22 12 22z',
  compass: 'M12 2a10 10 0 100 20 10 10 0 000-20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  terminal: 'M4 17l6-5-6-5 M12 19h8',
  sparkles: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z',
};

export const AVAILABLE_ICONS = Object.keys(ICON_PATHS);

function IconBlock({ block }: { block: CustomTemplateBlock }) {
  const p = block.props || {};
  const name = p.iconName || 'star';
  const size = p.iconSize || 28;
  const color = p.iconColor || '#4f46e5';
  const pathData = ICON_PATHS[name] || ICON_PATHS.star;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={pathData} />
      </svg>
    </div>
  );
}

function ContactBarBlock({ block, data }: { block: CustomTemplateBlock; data: CVData }) {
  const p = block.props || {};
  const isRow = p.layout !== 'column';
  const items = [
    { icon: 'mail', value: data.personalInfo.email },
    { icon: 'phone', value: data.personalInfo.phone },
    { icon: 'mappin', value: data.personalInfo.location },
    { icon: 'linkedin', value: data.personalInfo.linkedin },
    { icon: 'globe', value: data.personalInfo.website },
  ].filter((x) => !!x.value);
  return (
    <div style={{ display: 'flex', flexDirection: isRow ? 'row' : 'column', gap: isRow ? 14 : 4, flexWrap: 'wrap', alignItems: isRow ? 'center' : 'flex-start' }}>
      {items.map((item) => (
        <span key={item.icon} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: p.fontSize || 11, color: p.color || '#475569' }}>
          {p.showIcons !== false && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON_PATHS[item.icon]} />
            </svg>
          )}
          {item.value}
        </span>
      ))}
    </div>
  );
}

function RatingBlock({ block }: { block: CustomTemplateBlock }) {
  const p = block.props || {};
  const max = p.ratingMax || 5;
  const val = p.ratingValue || 3;
  const activeColor = p.color || '#4f46e5';
  const inactiveColor = p.bg || '#e2e8f0';
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: '100%' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: i < val ? activeColor : inactiveColor,
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}

function ImageBlock({ block }: { block: CustomTemplateBlock }) {
  const p = block.props || {};
  if (!p.imageUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(148,163,184,0.08)',
          color: '#94a3b8',
          fontSize: 11,
          borderRadius: 'inherit',
        }}
      >
        Imagem
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={p.imageUrl}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        objectFit: p.imageFit || 'cover',
        borderRadius: 'inherit',
        opacity: p.opacity ?? 1,
      }}
    />
  );
}

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
  const style: CSSProperties = {
    position: 'absolute',
    left: block.x,
    top: block.y,
    width: block.w,
    height: block.h,
    padding: p.padding ?? 0,
    background: p.bg,
    border: p.border,
    borderRadius: p.radius,
    color: p.color,
    fontSize: p.fontSize,
    fontWeight: p.fontWeight,
    textAlign: p.align,
    lineHeight: p.lineHeight ?? 1.45,
    overflow: showOverflow ? 'visible' : 'hidden',
    zIndex: block.z ?? 1,
  };
  if (block.type === 'shape' && p.shape === 'circle') {
    style.borderRadius = '50%';
  }
  return <div style={style}>{children}</div>;
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

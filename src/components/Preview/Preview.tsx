'use client';

import dynamic from 'next/dynamic';
import { type CVData, useCVStore } from '@/store/useCVStore';
import { useAppStore } from '@/store/useAppStore';
import CustomTemplate from '../Templates/CustomTemplate';
import TemplateExtras from '../Templates/_shared/TemplateExtras';

// Lazy-loaded template chunks. Each template is code-split so only the one the
// user selects (and its hover previews) is downloaded. `ssr: false` keeps the
// initial HTML identical to the client render and avoids hydration mismatches
// caused by per-template inline styles.
const loadingFallback = () => (
  <div
    aria-hidden="true"
    style={{
      width: '100%',
      minHeight: 320,
      background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
      backgroundSize: '200% 100%',
      animation: 'cv-skeleton 1.4s linear infinite',
    }}
  />
);
const Minimalist = dynamic(() => import('../Templates/Minimalist'), { ssr: false, loading: loadingFallback });
const MinimalistV2 = dynamic(() => import('../Templates/MinimalistV2'), { ssr: false, loading: loadingFallback });
const Corporate = dynamic(() => import('../Templates/Corporate'), { ssr: false, loading: loadingFallback });
const CorporateV2 = dynamic(() => import('../Templates/CorporateV2'), { ssr: false, loading: loadingFallback });
const Creative = dynamic(() => import('../Templates/Creative'), { ssr: false, loading: loadingFallback });
const CreativeV2 = dynamic(() => import('../Templates/CreativeV2'), { ssr: false, loading: loadingFallback });
const Executive = dynamic(() => import('../Templates/Executive'), { ssr: false, loading: loadingFallback });
const ExecutiveV2 = dynamic(() => import('../Templates/ExecutiveV2'), { ssr: false, loading: loadingFallback });
const Tech = dynamic(() => import('../Templates/Tech'), { ssr: false, loading: loadingFallback });
const Modern = dynamic(() => import('../Templates/Modern'), { ssr: false, loading: loadingFallback });
const Student = dynamic(() => import('../Templates/Student'), { ssr: false, loading: loadingFallback });
const Studio = dynamic(() => import('../Templates/Studio'), { ssr: false, loading: loadingFallback });
const Atlas = dynamic(() => import('../Templates/Atlas'), { ssr: false, loading: loadingFallback });
const Bold = dynamic(() => import('../Templates/Bold'), { ssr: false, loading: loadingFallback });
const Resume1 = dynamic(() => import('../Templates/Resume1/Resume1'), { ssr: false, loading: loadingFallback });
const Resume2 = dynamic(() => import('../Templates/Resume2/Resume2'), { ssr: false, loading: loadingFallback });
const Resume3 = dynamic(() => import('../Templates/Resume3/Resume3'), { ssr: false, loading: loadingFallback });
const CV5 = dynamic(() => import('../Templates/CV5/CV5'), { ssr: false, loading: loadingFallback });
const CV6 = dynamic(() => import('../Templates/CV6/CV6'), { ssr: false, loading: loadingFallback });
const CV7 = dynamic(() => import('../Templates/CV7/CV7'), { ssr: false, loading: loadingFallback });

/**
 * Templates in this list already render Languages/Projects/Certifications natively.
 * For every other template we append <TemplateExtras> below the main content so the
 * user never loses data - plus we render References and CustomSections for ALL
 * templates via the universal appendix below.
 */
const NATIVE_EXTRAS_TEMPLATES = new Set([
  'resume1',
  'resume2',
  'resume3',
  'cv5',
  'cv6-dark',
  'cv6-light',
  'cv7',
]);

/**
 * Templates that render SOME of Languages/Projects/Certifications natively
 * but still need the shared appendix for the others. Listing the native
 * sections here prevents double-rendering.
 */
const PARTIAL_NATIVE_EXTRAS: Record<
  string,
  Array<'languages' | 'projects' | 'certifications'>
> = {
  atlas: ['languages', 'projects'],
  bold: ['projects', 'certifications'],
};

const DARK_BACKGROUND_TEMPLATES = new Set([
  'bold',
  'executive-v2',
  'cv6-dark',
]);

const renderTemplateInner = (
  template: string,
  data: CVData,
  lang: 'pt' | 'en'
) => {
  switch (template) {
    case 'corporate':
      return <Corporate data={data} lang={lang} />;
    case 'corporate-v2':
      return <CorporateV2 data={data} lang={lang} />;
    case 'creative':
      return <Creative data={data} lang={lang} />;
    case 'creative-v2':
      return <CreativeV2 data={data} lang={lang} />;
    case 'executive':
      return <Executive data={data} lang={lang} />;
    case 'executive-v2':
      return <ExecutiveV2 data={data} lang={lang} />;
    case 'minimalist-v2':
      return <MinimalistV2 data={data} lang={lang} />;
    case 'tech':
      return <Tech data={data} lang={lang} />;
    case 'modern':
      return <Modern data={data} lang={lang} />;
    case 'student':
      return <Student data={data} lang={lang} />;
    case 'studio':
      return <Studio data={data} lang={lang} />;
    case 'atlas':
      return <Atlas data={data} lang={lang} />;
    case 'bold':
      return <Bold data={data} lang={lang} />;
    case 'resume1':
      return <Resume1 data={data} lang={lang} />;
    case 'resume2':
      return <Resume2 data={data} lang={lang} />;
    case 'resume3':
      return <Resume3 data={data} lang={lang} />;
    case 'cv5':
      return <CV5 data={data} lang={lang} />;
    case 'cv6-dark':
      return <CV6 data={data} lang={lang} variant="dark" />;
    case 'cv6-light':
      return <CV6 data={data} lang={lang} variant="light" />;
    case 'cv7':
      return <CV7 data={data} lang={lang} />;
    case 'minimalist':
    default:
      return <Minimalist data={data} lang={lang} />;
  }
};

/**
 * Renders a CV template along with a universal appendix for References,
 * Custom Sections, and any of Languages/Projects/Certifications that the
 * template does not render natively. This appendix lives on the same page
 * (and continues on a new page during PDF export when needed).
 */
export const renderTemplateById = (
  template: string,
  data: CVData,
  lang: 'pt' | 'en'
) => {
  const inner = renderTemplateInner(template, data, lang);
  const templateRendersAllSections = NATIVE_EXTRAS_TEMPLATES.has(template);
  const partialNative = PARTIAL_NATIVE_EXTRAS[template] ?? [];
  const isDark = DARK_BACKGROUND_TEMPLATES.has(template);

  const hasReferences = data.references.length > 0;
  const hasCustomSections = data.customSections.some((s) => s.items.length > 0);
  const hasBaseExtras =
    !templateRendersAllSections &&
    ((!partialNative.includes('languages') && data.languages.length > 0) ||
      (!partialNative.includes('projects') && data.projects.length > 0) ||
      (!partialNative.includes('certifications') && data.certifications.length > 0));

  if (!hasReferences && !hasCustomSections && !hasBaseExtras) return inner;

  const appendixBg = isDark ? '#0f0f10' : '#ffffff';
  const appendixFg = isDark ? '#f5f5f4' : '#0f172a';
  const appendixSubtle = isDark ? '#a1a1aa' : '#475569';
  const accent = data.settings.accentColor;

  return (
    <>
      {inner}
      <div
        style={{
          background: appendixBg,
          color: appendixFg,
          padding: '40px 48px',
          fontFamily: data.settings.fontFamily,
          fontSize: `${data.settings.fontSize}px`,
          breakInside: 'avoid',
        }}
      >
        {hasBaseExtras && (
          <TemplateExtras
            data={data}
            lang={lang}
            accentColor={accent}
            variant={isDark ? 'dark' : 'muted'}
            skip={partialNative}
          />
        )}

        {hasReferences && (
          <section style={{ marginTop: hasBaseExtras ? 28 : 0 }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                margin: 0,
                marginBottom: 12,
                color: appendixFg,
              }}
            >
              {lang === 'pt' ? 'Referências' : 'References'}
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
              }}
            >
              {data.references.map((ref) => (
                <div
                  key={ref.id}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 700 }}>
                    {ref.name || '—'}
                  </div>
                  {(ref.role || ref.company) && (
                    <div style={{ fontSize: '11px', color: appendixSubtle, marginTop: 2 }}>
                      {[ref.role, ref.company].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {ref.contact && (
                    <div style={{ fontSize: '11px', color: accent, marginTop: 4 }}>
                      {ref.contact}
                    </div>
                  )}
                  {ref.relationship[lang] && (
                    <div
                      style={{
                        fontSize: '10.5px',
                        color: appendixSubtle,
                        marginTop: 4,
                        fontStyle: 'italic',
                      }}
                    >
                      {ref.relationship[lang]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.customSections
          .filter((section) => section.items.length > 0)
          .map((section) => (
            <section key={section.id} style={{ marginTop: 28 }}>
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: 0,
                  marginBottom: 12,
                  color: appendixFg,
                }}
              >
                {section.label[lang] || section.label.pt || section.label.en}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700 }}>
                        {item.title[lang] || item.title.pt || item.title.en}
                      </div>
                      {item.period && (
                        <div style={{ fontSize: '11px', color: appendixSubtle, whiteSpace: 'nowrap' }}>
                          {item.period}
                        </div>
                      )}
                    </div>
                    {(item.subtitle[lang] || item.subtitle.pt) && (
                      <div style={{ fontSize: '11px', color: accent, fontWeight: 600, marginTop: 2 }}>
                        {item.subtitle[lang] || item.subtitle.pt}
                      </div>
                    )}
                    {(item.description[lang] || item.description.pt) && (
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: '11.5px',
                          lineHeight: 1.55,
                          color: appendixSubtle,
                        }}
                      >
                        {item.description[lang] || item.description.pt}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </>
  );
};

interface PreviewProps {
  dataOverride?: CVData;
  langOverride?: 'pt' | 'en';
  templateOverride?: string;
}

export default function Preview({
  dataOverride,
  langOverride,
  templateOverride,
}: PreviewProps) {
  const store = useCVStore();
  const customTemplates = useAppStore((s) => s.customTemplates);
  const data = dataOverride || store.data;
  const activeLanguage = langOverride || store.activeLanguage;
  const template = templateOverride || data?.settings?.template || 'minimalist';

  // Custom admin-built templates are handled by a single dynamic renderer.
  if (template.startsWith('custom-')) {
    const spec = customTemplates.find((t) => t.id === template);
    if (spec) {
      return (
        <div style={{ transformOrigin: 'top center' }}>
          <CustomTemplate spec={spec} data={data} lang={activeLanguage} />
        </div>
      );
    }
    // Fallthrough to default if the spec was deleted.
  }

  return (
    <div style={{ transformOrigin: 'top center' }}>
      {renderTemplateById(template, data, activeLanguage)}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Check, Eye, Layers3, Sparkles } from 'lucide-react';
import Preview from '@/components/Preview/Preview';
import {
  createShowcaseCVData,
  featuredTemplateIds,
  getTemplateDefinition,
  visibleTemplates,
} from '@/lib/templateCatalog';
import { toCatalogDefinition } from '@/lib/customTemplate';
import { useAppStore } from '@/store/useAppStore';

interface TemplateGalleryProps {
  activeTemplate?: string;
  onSelect?: (templateId: string) => void;
  featuredOnly?: boolean;
  compact?: boolean;
}

export default function TemplateGallery({
  activeTemplate,
  onSelect,
  featuredOnly = false,
  compact = false,
}: TemplateGalleryProps) {
  const customTemplates = useAppStore((s) => s.customTemplates);
  const publishedCustoms = customTemplates
    .filter((t) => t.published)
    .map(toCatalogDefinition);
  const baseList = featuredOnly
    ? visibleTemplates.filter((template) => featuredTemplateIds.includes(template.id))
    : visibleTemplates;
  // Published custom templates appear first — they're the freshest additions.
  const templates = featuredOnly
    ? baseList
    : [...publishedCustoms, ...baseList];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: compact ? '16px' : '22px',
      }}
    >
      {templates.map((template) => {
        const previewData = createShowcaseCVData(template.id);
        const selected = template.id === activeTemplate;

        return (
          <motion.button
            key={template.id}
            type="button"
            onClick={() => onSelect?.(template.id)}
            whileHover={{ y: compact ? -2 : -6 }}
            whileTap={{ scale: 0.995 }}
            className="template-card"
            style={{
              textAlign: 'left',
              borderRadius: '24px',
              overflow: 'hidden',
              border: selected
                ? `2px solid ${template.accentColor}`
                : '1px solid var(--card-border)',
              background: 'var(--card)',
              boxShadow: selected
                ? `0 20px 40px ${template.accentColor}33`
                : 'var(--card-shadow)',
            }}
          >
            <div
              style={{
                position: 'relative',
                height: compact ? '255px' : '360px',
                overflow: 'hidden',
                background:
                  'linear-gradient(180deg, var(--background-muted) 0%, var(--muted) 100%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 2,
                  flexWrap: 'wrap',
                }}
              >
                <span className="template-pill">{template.category}</span>
                <span className="template-pill template-pill-dark">
                  {template.badge}
                </span>
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  background: selected ? 'var(--accent)' : 'rgba(255,255,255,0.92)',
                  color: selected ? 'var(--accent-foreground)' : 'var(--foreground)',
                  border: selected ? 'none' : '1px solid var(--card-border)',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {selected ? <Check size={13} /> : <Eye size={13} />}
                {selected ? 'Selecionado' : 'Preview real'}
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '18px',
                  transform: `translateX(-50%) scale(${compact ? 0.23 : 0.33})`,
                  width: '760px',
                  transformOrigin: 'top center',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                  pointerEvents: 'none',
                }}
              >
                <Preview
                  dataOverride={previewData}
                  langOverride="en"
                  templateOverride={template.id}
                />
              </div>
            </div>

            <div
              style={{
                padding: compact ? '16px' : '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: compact ? '16px' : '18px', fontWeight: 800 }}>
                    {template.name}
                  </div>
                  <div style={{ color: 'var(--foreground-muted)', fontSize: '12px', marginTop: '4px' }}>
                    {template.tone}
                  </div>
                </div>

                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '999px',
                    background: template.accentColor,
                    boxShadow: `0 0 16px ${template.accentColor}`,
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                />
              </div>

              <p style={{ color: 'var(--foreground-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                {template.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    color: 'var(--foreground-muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <span className="template-pill template-pill-dark">
                    <Layers3 size={12} /> Modelo completo
                  </span>
                  <span className="template-pill template-pill-dark">
                    <Sparkles size={12} /> Igual ao preview
                  </span>
                </div>

                {onSelect ? (
                  <span
                    style={{
                      color: selected ? template.accentColor : 'var(--accent)',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {selected ? 'A editar este modelo' : `Escolher ${getTemplateDefinition(template.id).name}`}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

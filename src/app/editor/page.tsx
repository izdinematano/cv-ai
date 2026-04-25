'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye,
  LayoutTemplate,
  Sparkles,
  SplitSquareVertical,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Editor from '@/components/Editor/Editor';
import AutosaveIndicator from '@/components/Editor/AutosaveIndicator';
import VersionHistoryModal from '@/components/Editor/VersionHistoryModal';
import Header from '@/components/Header';
import Preview from '@/components/Preview/Preview';
import TemplateGallery from '@/components/Preview/TemplateGallery';
import { getTemplateDefinition } from '@/lib/templateCatalog';
import { useCVStore } from '@/store/useCVStore';

export default function EditorPage() {
  const {
    data,
    isConverting,
    hasChosenTemplate,
    setTemplate,
    completeTemplateSelection,
  } = useCVStore();

  const [zoom, setZoom] = useState(0.8);
  const [previewMode, setPreviewMode] = useState<'split' | 'preview'>('split');
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);
  const [cvSize, setCvSize] = useState({ width: 794, height: 1123 });

  useEffect(() => {
    const el = cvRef.current;
    if (!el) return;
    const update = () => {
      setCvSize({ width: el.scrollWidth, height: el.scrollHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, zoom]);

  const selectedTemplate = useMemo(
    () => getTemplateDefinition(data.settings.template),
    [data.settings.template]
  );

  const handleChooseTemplate = (templateId: string) => {
    setTemplate(templateId);
    completeTemplateSelection();
  };

  if (!hasChosenTemplate) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)',
        }}
      >
        <Header />

        <section
          className="template-picker-section"
          style={{
            maxWidth: '1480px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            className="template-picker-hero"
            style={{
              display: 'grid',
              gap: '24px',
              alignItems: 'start',
              marginBottom: '28px',
            }}
          >
            <div
              className="glass-card"
              style={{ padding: '30px', overflow: 'hidden', position: 'relative' }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  className="template-pill"
                  style={{ marginBottom: '16px', width: 'fit-content' }}
                >
                  <LayoutTemplate size={12} /> PASSO 1 DE 2
                </div>
                <h1
                  style={{
                    fontSize: 'clamp(28px, 5vw, 46px)',
                    lineHeight: 1.1,
                    maxWidth: '760px',
                    marginBottom: '14px',
                  }}
                >
                  Escolhe primeiro o modelo do teu CV e depois preenche o formulario.
                </h1>
                <p
                  style={{
                    color: 'var(--foreground-muted)',
                    fontSize: '17px',
                    lineHeight: 1.7,
                    maxWidth: '780px',
                  }}
                >
                  Agora os previews sao renderizados pelos proprios templates, com layouts,
                  shapes e detalhes visuais reais. Escolhe o estilo que mais combina contigo,
                  entra no editor e continua a ver o CV em simultaneo sempre que quiseres.
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '26px' }}>
              <div
                className="template-pill template-pill-dark"
                style={{ marginBottom: '16px', width: 'fit-content' }}
              >
                <Sparkles size={12} /> COMO FUNCIONA
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  'Escolhe entre varios modelos atrativos para tech, executivo, criativo, classico e junior.',
                  'Depois preenches o formulario ja com um contexto visual claro do resultado final.',
                  'No editor podes continuar em modo split para escrever de um lado e ver o CV do outro.',
                ].map((item) => (
                  <div
                    key={item}
                    style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '999px',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>
                    <p style={{ color: 'var(--foreground-muted)', lineHeight: 1.6, fontSize: '14px' }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <TemplateGallery
            activeTemplate={data.settings.template}
            onSelect={handleChooseTemplate}
          />
        </section>
      </main>
    );
  }

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />

      <div className="editor-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '999px',
              background: selectedTemplate.accentColor,
              boxShadow: `0 0 16px ${selectedTemplate.accentColor}`,
            }}
          />
          <div>
            <div className="editor-topbar-title">{selectedTemplate.name}</div>
            <div className="editor-topbar-sub">
              {selectedTemplate.badge} - {selectedTemplate.tone}
            </div>
          </div>
          <AutosaveIndicator onOpenHistory={() => setHistoryOpen(true)} />
        </div>

        <div
          className="editor-desktop-only"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
        >
          <button
            onClick={() => setPreviewMode('split')}
            className={previewMode === 'split' ? 'btn-primary' : 'btn-outline'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 13px', fontSize: '13px' }}
            title="Editor em modo dividido"
          >
            <SplitSquareVertical size={15} />
            Dividido
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={previewMode === 'preview' ? 'btn-primary' : 'btn-outline'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 13px', fontSize: '13px' }}
            title="Ver apenas o CV"
          >
            <Eye size={15} />
            Ver CV
          </button>
        </div>

        <div className="editor-mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-outline"
            onClick={() => setMobilePreviewOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 12px', fontSize: '13px' }}
          >
            <Eye size={15} /> Ver CV
          </button>
        </div>
      </div>

      <div className="editor-shell">
        {previewMode === 'split' ? (
          <aside className="editor-aside">
            <Editor />

            <AnimatePresence>
              {isConverting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: 20 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        border: '3px solid var(--accent-soft)',
                        borderTopColor: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Sparkles size={22} color="var(--accent)" />
                    </motion.div>
                  </div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: '16px', marginBottom: 6 }}>
                    A IA está a processar o teu CV…
                  </p>
                  <p
                    style={{
                      color: 'var(--foreground-muted)',
                      fontSize: '13px',
                      maxWidth: 260,
                      textAlign: 'center',
                      lineHeight: 1.5,
                    }}
                  >
                    Pode demorar alguns segundos. Não feches a página.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        ) : null}

        <section className="editor-preview-pane">
          <div className="editor-zoom-dock">
            <button
              onClick={() => setZoom((current) => Math.max(0.5, current - 0.1))}
              className="glass-card"
              style={{
                padding: '10px',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZoomOut size={18} />
            </button>
            <div
              className="glass-card"
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 800,
                fontSize: '13px',
              }}
            >
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setZoom((current) => Math.min(1.5, current + 0.1))}
              className="glass-card"
              style={{
                padding: '10px',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <div
            style={{
              width: cvSize.width * zoom,
              height: cvSize.height * zoom,
              minWidth: cvSize.width * zoom,
              minHeight: cvSize.height * zoom,
            }}
          >
            <div
              ref={cvRef}
              id="cv-export-target"
              className="cv-export-target"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <Preview />
            </div>
          </div>
        </section>
      </div>

      {mobilePreviewOpen && (
        <div className="mobile-preview-modal" role="dialog" aria-modal="true">
          <div className="mobile-preview-modal-header">
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>{selectedTemplate.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
                Pre-visualizacao
              </div>
            </div>
            <button
              className="btn-outline"
              onClick={() => setMobilePreviewOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}
            >
              <X size={14} /> Fechar
            </button>
          </div>
          <div className="mobile-preview-modal-body">
            <div className="cv-export-target">
              <Preview />
            </div>
          </div>
        </div>
      )}

      <VersionHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </main>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye,
  LayoutTemplate,
  Sparkles,
  SplitSquareVertical,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Editor from '@/components/Editor/Editor';
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
          background:
            'radial-gradient(circle at top, rgba(59,130,246,0.16), transparent 40%), var(--background)',
        }}
      >
        <Header />

        <section
          style={{
            padding: '42px 32px 56px',
            maxWidth: '1480px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
              gap: '24px',
              alignItems: 'start',
              marginBottom: '28px',
            }}
          >
            <div
              className="glass-card"
              style={{ padding: '30px', overflow: 'hidden', position: 'relative' }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 35%)',
                  pointerEvents: 'none',
                }}
              />
              <div style={{ position: 'relative' }}>
                <div
                  className="template-pill"
                  style={{ marginBottom: '16px', width: 'fit-content' }}
                >
                  <LayoutTemplate size={12} /> PASSO 1 DE 2
                </div>
                <h1
                  style={{
                    fontSize: '46px',
                    lineHeight: 1.05,
                    maxWidth: '760px',
                    marginBottom: '14px',
                  }}
                >
                  Escolhe primeiro o modelo do teu CV e depois preenche o formulario.
                </h1>
                <p
                  style={{
                    color: '#cbd5e1',
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
                        background: 'rgba(59,130,246,0.16)',
                        color: '#93c5fd',
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
                    <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '14px' }}>
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

      <div
        style={{
          padding: '14px 22px',
          borderBottom: '1px solid var(--card-border)',
          background: 'rgba(15, 23, 42, 0.78)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
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
            <div style={{ fontSize: '15px', fontWeight: 800 }}>{selectedTemplate.name}</div>
            <div style={{ color: '#94a3b8', fontSize: '12px' }}>
              {selectedTemplate.badge} - {selectedTemplate.tone}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPreviewMode('split')}
            className={previewMode === 'split' ? 'btn-primary' : 'btn-outline'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}
          >
            <SplitSquareVertical size={16} />
            Editor + preview
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={previewMode === 'preview' ? 'btn-primary' : 'btn-outline'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}
          >
            <Eye size={16} />
            Ver so o CV
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {previewMode === 'split' ? (
          <aside
            style={{
              width: '45%',
              minWidth: '450px',
              height: '100%',
              borderRight: '1px solid var(--card-border)',
              background: 'rgba(15, 23, 42, 0.32)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
            }}
          >
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
                    background: 'rgba(15, 23, 42, 0.82)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ color: 'var(--accent)', marginBottom: '16px' }}
                  >
                    <Sparkles size={40} />
                  </motion.div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>
                    A IA esta a adaptar o seu CV...
                  </p>
                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: '14px',
                      marginTop: '8px',
                    }}
                  >
                    Isso pode levar alguns segundos.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        ) : null}

        <section
          style={{
            flex: 1,
            height: '100%',
            overflow: 'auto',
            background: '#14161b',
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              display: 'flex',
              gap: '10px',
              zIndex: 10,
            }}
          >
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

          <motion.div
            animate={{ scale: zoom }}
            style={{
              width: '210mm',
              minHeight: '297mm',
              background: 'white',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              transformOrigin: 'top center',
              borderRadius: '2px',
              /* overflow intentionally visible so long CVs are never cropped
                 in preview; the wrapping scroll container already clips */
            }}
          >
            <Preview />
          </motion.div>
        </section>
      </div>
    </main>
  );
}

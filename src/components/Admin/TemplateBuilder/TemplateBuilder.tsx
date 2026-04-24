'use client';

/**
 * Full-screen shell of the admin template builder. Coordinates the canvas,
 * the sidebar, the top toolbar (undo/redo, zoom, save, publish) and wires
 * everything to the zustand store.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Globe, Redo2, Save, Undo2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { CustomTemplateBlock, CustomTemplateSpec } from '@/lib/customTemplate';
import BuilderCanvas from './BuilderCanvas';
import BuilderSidebar from './BuilderSidebar';

interface Props {
  templateId: string;
  onClose: () => void;
}

export default function TemplateBuilder({ templateId, onClose }: Props) {
  const storeTemplate = useAppStore((s) => s.customTemplates.find((t) => t.id === templateId));
  const { updateCustomTemplate, publishCustomTemplate } = useAppStore();

  // Local working copy with undo/redo history. We only commit back to the
  // store on Save (or when toggling published) so the builder never thrashes
  // IndexedDB writes while the user drags blocks around.
  const [spec, setSpec] = useState<CustomTemplateSpec | null>(storeTemplate ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'blocks' | 'props' | 'theme'>('blocks');
  const [zoom, setZoom] = useState(0.85);
  const [dirty, setDirty] = useState(false);

  const historyRef = useRef<CustomTemplateSpec[]>([]);
  const futureRef = useRef<CustomTemplateSpec[]>([]);

  // Keep the working copy synced when the user swaps between templates.
  useEffect(() => {
    if (storeTemplate && (!spec || spec.id !== storeTemplate.id)) {
      setSpec(storeTemplate);
      historyRef.current = [];
      futureRef.current = [];
      setDirty(false);
      setSelectedId(null);
    }
  }, [storeTemplate, spec]);

  const commit = (next: CustomTemplateSpec) => {
    if (!spec) return;
    historyRef.current.push(spec);
    if (historyRef.current.length > 50) historyRef.current.shift();
    futureRef.current = [];
    setSpec(next);
    setDirty(true);
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    if (!prev || !spec) return;
    futureRef.current.push(spec);
    setSpec(prev);
    setDirty(true);
  };

  const redo = () => {
    const next = futureRef.current.pop();
    if (!next || !spec) return;
    historyRef.current.push(spec);
    setSpec(next);
    setDirty(true);
  };

  const onBlocksChange = (blocks: CustomTemplateBlock[]) => {
    if (!spec) return;
    commit({ ...spec, blocks });
  };

  const onSpecChange = (patch: Partial<CustomTemplateSpec>) => {
    if (!spec) return;
    commit({ ...spec, ...patch });
  };

  const save = () => {
    if (!spec) return;
    updateCustomTemplate(spec.id, spec);
    setDirty(false);
  };

  const togglePublish = () => {
    if (!spec) return;
    const nextPublished = !spec.published;
    publishCustomTemplate(spec.id, nextPublished);
    setSpec({ ...spec, published: nextPublished });
  };

  // Warn on unsaved close.
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  // Keyboard shortcuts (undo / redo / save).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (!meta) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec]);

  const handleClose = () => {
    if (dirty && !confirm('Tens alterações por guardar. Queres sair mesmo assim?')) return;
    onClose();
  };

  if (!spec) {
    return (
      <div style={modalStyle}>
        <div style={{ padding: 40, textAlign: 'center' }}>Template não encontrado.</div>
      </div>
    );
  }

  return (
    <div style={modalStyle} role="dialog" aria-modal="true" aria-label="Editor de template">
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          borderBottom: '1px solid var(--card-border)',
          background: 'var(--background)',
        }}
      >
        <button type="button" onClick={handleClose} aria-label="Fechar editor" className="btn-outline" style={{ padding: '6px 10px', fontSize: 12 }}>
          <X size={14} aria-hidden="true" />
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <strong style={{ fontSize: 14 }}>{spec.name}</strong>
          <span style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>
            {spec.blocks.length} blocos · {spec.published ? 'Publicado' : 'Rascunho'} {dirty && ' · Alterações não guardadas'}
          </span>
        </div>

        <button type="button" onClick={undo} aria-label="Desfazer" className="btn-outline" style={tbBtn}>
          <Undo2 size={14} aria-hidden="true" />
        </button>
        <button type="button" onClick={redo} aria-label="Refazer" className="btn-outline" style={tbBtn}>
          <Redo2 size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
          aria-label="Zoom out"
          className="btn-outline"
          style={tbBtn}
        >
          <ZoomOut size={14} aria-hidden="true" />
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}
          aria-label="Zoom in"
          className="btn-outline"
          style={tbBtn}
        >
          <ZoomIn size={14} aria-hidden="true" />
        </button>

        <button type="button" onClick={togglePublish} className="btn-outline" style={{ ...tbBtn, minWidth: 110 }}>
          <Globe size={14} aria-hidden="true" /> {spec.published ? 'Despublicar' : 'Publicar'}
        </button>
        <button type="button" onClick={save} className="btn-primary" style={{ ...tbBtn, minWidth: 90 }}>
          <Save size={14} aria-hidden="true" /> Guardar
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <BuilderCanvas
          spec={spec}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={onBlocksChange}
          zoom={zoom}
        />
        <BuilderSidebar
          spec={spec}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onBlocksChange={onBlocksChange}
          onSpecChange={onSpecChange}
          tab={tab}
          onTabChange={setTab}
        />
      </div>
    </div>
  );
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  background: 'var(--background)',
  display: 'flex',
  flexDirection: 'column',
};

const tbBtn: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 12,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

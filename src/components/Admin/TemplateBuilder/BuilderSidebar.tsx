'use client';

/**
 * Left/right panels for the template builder. Broken into three tabs:
 *  - Blocos: palette to insert new blocks + list of existing blocks.
 *  - Propriedades: inspector for the selected block.
 *  - Tema: theme-wide colors and fonts.
 */

import { useRef } from 'react';
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import {
  BLOCK_LIBRARY,
  DEFAULT_FONTS,
  blockLabel,
  createBlock,
  type CustomTemplateBlock,
  type CustomTemplateSpec,
} from '@/lib/customTemplate';

interface Props {
  spec: CustomTemplateSpec;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onSpecChange: (patch: Partial<CustomTemplateSpec>) => void;
  onBlocksChange: (blocks: CustomTemplateBlock[]) => void;
  tab: 'blocks' | 'props' | 'theme';
  onTabChange: (t: 'blocks' | 'props' | 'theme') => void;
}

export default function BuilderSidebar({
  spec,
  selectedId,
  onSelect,
  onSpecChange,
  onBlocksChange,
  tab,
  onTabChange,
}: Props) {
  const selected = spec.blocks.find((b) => b.id === selectedId) || null;

  const patchBlock = (patch: Partial<CustomTemplateBlock>) => {
    if (!selected) return;
    onBlocksChange(
      spec.blocks.map((b) => (b.id === selected.id ? { ...b, ...patch, props: { ...b.props, ...(patch.props || {}) } } : b))
    );
  };

  const duplicateBlock = () => {
    if (!selected) return;
    const copy = { ...selected, id: Math.random().toString(36).slice(2, 11), x: selected.x + 16, y: selected.y + 16 };
    onBlocksChange([...spec.blocks, copy]);
    onSelect(copy.id);
  };

  const deleteBlock = () => {
    if (!selected) return;
    onBlocksChange(spec.blocks.filter((b) => b.id !== selected.id));
    onSelect(null);
  };

  const addBlock = (type: ReturnType<typeof createBlock>['type']) => {
    const block = createBlock(type);
    onBlocksChange([...spec.blocks, block]);
    onSelect(block.id);
    onTabChange('props');
  };

  return (
    <aside
      style={{
        width: 320,
        borderLeft: '1px solid var(--card-border)',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div role="tablist" aria-label="Painel do builder" style={{ display: 'flex', borderBottom: '1px solid var(--card-border)' }}>
        {(['blocks', 'props', 'theme'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => onTabChange(t)}
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: 12,
              fontWeight: 800,
              background: tab === t ? 'var(--background)' : 'var(--background-muted)',
              color: tab === t ? 'var(--accent)' : 'var(--foreground-muted)',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {t === 'blocks' ? 'Blocos' : t === 'props' ? 'Props' : 'Tema'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {tab === 'blocks' && (
          <BlocksTab spec={spec} onAdd={addBlock} selectedId={selectedId} onSelect={onSelect} onBlocksChange={onBlocksChange} />
        )}
        {tab === 'props' && (
          <PropsTab selected={selected} patchBlock={patchBlock} onDuplicate={duplicateBlock} onDelete={deleteBlock} />
        )}
        {tab === 'theme' && <ThemeTab spec={spec} onSpecChange={onSpecChange} />}
      </div>
    </aside>
  );
}

/* ============================ tabs ========================================= */

function BlocksTab({
  spec,
  onAdd,
  selectedId,
  onSelect,
  onBlocksChange,
}: {
  spec: CustomTemplateSpec;
  onAdd: (type: CustomTemplateBlock['type']) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onBlocksChange: (blocks: CustomTemplateBlock[]) => void;
}) {
  const moveZ = (id: string, dir: 1 | -1) => {
    const idx = spec.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const next = [...spec.blocks];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onBlocksChange(next);
  };
  return (
    <div>
      <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--foreground-muted)', marginBottom: 10 }}>
        Adicionar bloco
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
        {BLOCK_LIBRARY.map((b) => (
          <button
            key={b.type}
            type="button"
            onClick={() => onAdd(b.type)}
            className="btn-outline"
            style={{ padding: '8px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left' }}
            aria-label={`Adicionar bloco ${b.label}`}
          >
            <Plus size={12} aria-hidden="true" /> {b.label}
          </button>
        ))}
      </div>

      <h3 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--foreground-muted)', marginBottom: 10 }}>
        Camadas ({spec.blocks.length})
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {spec.blocks.map((b, i) => (
          <li
            key={b.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              borderRadius: 8,
              background: b.id === selectedId ? 'var(--accent-soft)' : 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => onSelect(b.id)}
          >
            <GripVertical size={12} color="var(--foreground-muted)" aria-hidden="true" />
            <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{blockLabel(b.type)}</span>
            <button
              type="button"
              aria-label="Subir camada"
              onClick={(e) => {
                e.stopPropagation();
                moveZ(b.id, -1);
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 10 }}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Descer camada"
              onClick={(e) => {
                e.stopPropagation();
                moveZ(b.id, 1);
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 10 }}
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PropsTab({
  selected,
  patchBlock,
  onDuplicate,
  onDelete,
}: {
  selected: CustomTemplateBlock | null;
  patchBlock: (patch: Partial<CustomTemplateBlock>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  if (!selected) {
    return (
      <p style={{ fontSize: 12, color: 'var(--foreground-muted)', lineHeight: 1.6 }}>
        Selecciona um bloco no canvas para editar as propriedades.
      </p>
    );
  }
  const p = selected.props || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--foreground-muted)' }}>
        {blockLabel(selected.type)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <NumberField label="X" value={selected.x} onChange={(v) => patchBlock({ x: v })} />
        <NumberField label="Y" value={selected.y} onChange={(v) => patchBlock({ y: v })} />
        <NumberField label="Largura" value={selected.w} onChange={(v) => patchBlock({ w: v })} />
        <NumberField label="Altura" value={selected.h} onChange={(v) => patchBlock({ h: v })} />
      </div>

      {(selected.type === 'text' ||
        selected.type === 'summary' ||
        selected.type === 'experience' ||
        selected.type === 'education' ||
        selected.type === 'skills' ||
        selected.type === 'languages' ||
        selected.type === 'projects' ||
        selected.type === 'certifications' ||
        selected.type === 'references') && (
        <TextField
          label="Título da secção"
          value={p.title ?? ''}
          onChange={(v) => patchBlock({ props: { title: v } })}
        />
      )}

      {selected.type === 'text' && (
        <RichTextField
          value={p.content ?? ''}
          onChange={(v) => patchBlock({ props: { content: v } })}
        />
      )}

      {selected.type !== 'shape' && selected.type !== 'divider' && selected.type !== 'photo' && (
        <SelectField
          label="Alinhamento"
          value={p.align ?? 'left'}
          options={[
            ['left', 'Esquerda'],
            ['center', 'Centro'],
            ['right', 'Direita'],
          ]}
          onChange={(v) => patchBlock({ props: { align: v as 'left' | 'center' | 'right' } })}
        />
      )}

      {selected.type === 'header' && (
        <NumberField label="Tamanho do nome" value={p.fontSize ?? 28} onChange={(v) => patchBlock({ props: { fontSize: v } })} />
      )}

      {(selected.type === 'shape' || selected.type === 'divider') && (
        <>
          <ColorField label="Cor" value={p.bg ?? '#eef2ff'} onChange={(v) => patchBlock({ props: { bg: v } })} />
          <NumberField label="Raio" value={p.radius ?? 0} onChange={(v) => patchBlock({ props: { radius: v } })} />
          {selected.type === 'shape' && (
            <SelectField
              label="Forma"
              value={p.shape ?? 'rect'}
              options={[
                ['rect', 'Rectângulo'],
                ['circle', 'Círculo'],
              ]}
              onChange={(v) => patchBlock({ props: { shape: v as 'rect' | 'circle' } })}
            />
          )}
        </>
      )}

      {selected.type !== 'shape' && selected.type !== 'divider' && (
        <ColorField
          label="Cor do texto"
          value={p.color ?? '#0f172a'}
          onChange={(v) => patchBlock({ props: { color: v } })}
        />
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onDuplicate} className="btn-outline" style={{ flex: 1, fontSize: 12, padding: '8px' }}>
          <Copy size={12} aria-hidden="true" style={{ marginRight: 4 }} /> Duplicar
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="btn-outline"
          style={{ flex: 1, fontSize: 12, padding: '8px', color: 'var(--error)', borderColor: 'var(--error)' }}
        >
          <Trash2 size={12} aria-hidden="true" style={{ marginRight: 4 }} /> Apagar
        </button>
      </div>
    </div>
  );
}

function ThemeTab({ spec, onSpecChange }: { spec: CustomTemplateSpec; onSpecChange: (patch: Partial<CustomTemplateSpec>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TextField label="Nome" value={spec.name} onChange={(v) => onSpecChange({ name: v })} />
      <TextField label="Badge" value={spec.badge} onChange={(v) => onSpecChange({ badge: v })} />
      <TextField label="Descrição" value={spec.description} onChange={(v) => onSpecChange({ description: v })} />
      <SelectField
        label="Fonte"
        value={spec.fontFamily}
        options={DEFAULT_FONTS.map((f) => [f, f])}
        onChange={(v) => onSpecChange({ fontFamily: v })}
      />
      <NumberField
        label="Páginas (A4)"
        value={spec.pages ?? 1}
        onChange={(v) => onSpecChange({ pages: Math.max(1, Math.min(6, Math.round(v))) })}
      />
      <ColorField label="Cor de acento" value={spec.accentColor} onChange={(v) => onSpecChange({ accentColor: v })} />
      <ColorField label="Fundo" value={spec.bgColor} onChange={(v) => onSpecChange({ bgColor: v })} />
      <ColorField label="Texto" value={spec.textColor} onChange={(v) => onSpecChange({ textColor: v })} />
      <ColorField label="Texto secundário" value={spec.mutedColor} onChange={(v) => onSpecChange({ mutedColor: v })} />
    </div>
  );
}

/* ============================ fields ======================================= */

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--foreground-muted)',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  display: 'block',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid var(--card-border)',
  background: 'var(--background)',
  color: 'var(--foreground)',
  fontFamily: 'inherit',
};

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={inputStyle}
      />
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function RichTextField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const wrap = (open: string, close: string) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || 'texto';
    const after = value.slice(end);
    const next = `${before}${open}${selected}${close}${after}`;
    onChange(next);
    // Restore caret after the wrapped text on next tick.
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + open.length;
      el.selectionEnd = start + open.length + selected.length;
    });
  };
  return (
    <div>
      <label style={labelStyle}>Conteúdo (HTML simples)</label>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <ToolbarBtn onClick={() => wrap('<strong>', '</strong>')} label="Negrito" emphasis="bold">
          B
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap('<em>', '</em>')} label="Itálico" emphasis="italic">
          I
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap('<u>', '</u>')} label="Sublinhado" emphasis="underline">
          U
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap('<br/>', '')} label="Quebra de linha">
          ↵
        </ToolbarBtn>
      </div>
      <textarea
        ref={ref}
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 12 }}
      />
      <div style={{ fontSize: 10, color: 'var(--foreground-muted)', marginTop: 4 }}>
        Tags permitidas: &lt;b&gt;, &lt;strong&gt;, &lt;i&gt;, &lt;em&gt;, &lt;u&gt;, &lt;br/&gt;, &lt;span&gt;.
      </div>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  label,
  emphasis,
  children,
}: {
  onClick: () => void;
  label: string;
  emphasis?: 'bold' | 'italic' | 'underline';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 28,
        height: 28,
        fontSize: 13,
        fontWeight: emphasis === 'bold' ? 800 : 600,
        fontStyle: emphasis === 'italic' ? 'italic' : 'normal',
        textDecoration: emphasis === 'underline' ? 'underline' : 'none',
        border: '1px solid var(--card-border)',
        borderRadius: 6,
        background: 'var(--background)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 30, border: '1px solid var(--card-border)', borderRadius: 6, padding: 2 }}
        />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
      </div>
    </div>
  );
}

'use client';

/**
 * Bullet-point editor for experience/project descriptions.
 *
 * The underlying data shape stays a single multi-line string (one bullet per
 * line) so all existing templates keep rendering correctly — but the admin
 * gets a structured UX with reorder, per-bullet AI improve, and inline
 * writing-quality feedback.
 */

import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { analyzeBullet } from '@/lib/writingQuality';
import WritingHints from './WritingHints';

interface Props {
  value: string;
  onChange: (next: string) => void;
  lang: 'pt' | 'en';
  placeholder?: string;
  /** Called when the user clicks "Melhorar" on a bullet. Should return the
   *  improved text; we replace the bullet in-place on resolve. */
  onImprove?: (bulletText: string) => Promise<string | void>;
  disabled?: boolean;
}

const splitBullets = (raw: string): string[] => {
  if (!raw.trim()) return [''];
  return raw
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*[-–•*]\s*/, '').trimEnd())
    .filter((s, i, arr) => !(s === '' && i === arr.length - 1));
};

const joinBullets = (bullets: string[]) =>
  bullets.map((b) => b.trim()).filter(Boolean).join('\n');

export default function BulletEditor({
  value,
  onChange,
  lang,
  placeholder = 'Descreve um marco com verbo de acção + métrica…',
  onImprove,
  disabled,
}: Props) {
  const bullets = splitBullets(value);

  const update = (i: number, next: string) => {
    const copy = [...bullets];
    copy[i] = next;
    onChange(joinBullets(copy));
  };

  const add = () => onChange(joinBullets([...bullets, '']));

  const remove = (i: number) => {
    const copy = bullets.filter((_, idx) => idx !== i);
    onChange(joinBullets(copy.length ? copy : ['']));
  };

  const move = (i: number, dir: 1 | -1) => {
    const j = i + dir;
    if (j < 0 || j >= bullets.length) return;
    const copy = [...bullets];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(joinBullets(copy));
  };

  const improve = async (i: number) => {
    if (!onImprove) return;
    const current = bullets[i];
    if (!current) return;
    const improved = await onImprove(current);
    if (typeof improved === 'string' && improved) update(i, improved);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {bullets.map((bullet, i) => {
        const report = analyzeBullet(bullet, lang);
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              background: 'var(--background)',
              border: '1px solid var(--card-border)',
              borderRadius: 10,
              padding: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: 'var(--accent)',
                  marginTop: 14,
                  flexShrink: 0,
                }}
              />
              <textarea
                value={bullet}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder}
                rows={Math.max(1, Math.ceil((bullet.length || 40) / 60))}
                spellCheck
                disabled={disabled}
                style={{
                  flex: 1,
                  resize: 'vertical',
                  minHeight: 34,
                  padding: '6px 10px',
                  fontSize: 13,
                  lineHeight: 1.45,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--foreground)',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || disabled}
                  aria-label="Subir bullet"
                  style={iconBtn}
                >
                  <ArrowUp size={12} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === bullets.length - 1 || disabled}
                  aria-label="Descer bullet"
                  style={iconBtn}
                >
                  <ArrowDown size={12} aria-hidden="true" />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {onImprove && (
                  <button
                    type="button"
                    onClick={() => improve(i)}
                    disabled={!bullet || disabled}
                    aria-label="Melhorar com IA"
                    style={{ ...iconBtn, color: 'var(--accent)' }}
                  >
                    <Sparkles size={12} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={disabled || bullets.length === 1}
                  aria-label="Remover bullet"
                  style={{ ...iconBtn, color: 'var(--error)' }}
                >
                  <Trash2 size={12} aria-hidden="true" />
                </button>
              </div>
            </div>
            <WritingHints report={report} compact />
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="btn-outline"
        disabled={disabled}
        style={{ fontSize: 12, padding: '6px 10px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <Plus size={12} aria-hidden="true" /> Adicionar bullet
      </button>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 24,
  height: 22,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--card-border)',
  borderRadius: 6,
  background: 'var(--background-muted)',
  cursor: 'pointer',
  padding: 0,
};

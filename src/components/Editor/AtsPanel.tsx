'use client';

/**
 * "ATS keyword match" helper. The admin pastes a job description and we
 * compare the N most frequent meaningful terms against the current CV
 * content (skills + experience + summary). Runs fully client-side.
 */

import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Target } from 'lucide-react';
import { atsMatch } from '@/lib/writingQuality';
import type { CVData } from '@/store/useCVStore';
import { useCVStore } from '@/store/useCVStore';

interface Props {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function AtsPanel({ data, lang }: Props) {
  const { addSkill } = useCVStore();
  const [open, setOpen] = useState(true);
  const [jd, setJd] = useState('');
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  const handleAddSkill = (word: string) => {
    if (addedSkills.has(word)) return;
    addSkill(word, lang);
    setAddedSkills((prev) => new Set(prev).add(word));
  };

  const haystack = useMemo(() => buildHaystack(data, lang), [data, lang]);
  const report = useMemo(() => (jd ? atsMatch(jd, haystack) : null), [jd, haystack]);

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--foreground)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 14 }}>
          <Target size={16} color="var(--accent)" aria-hidden="true" /> Otimização ATS
          {report && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                background:
                  report.score >= 70
                    ? 'rgba(5,150,105,0.12)'
                    : report.score >= 40
                      ? 'rgba(217,119,6,0.12)'
                      : 'rgba(239,68,68,0.12)',
                color:
                  report.score >= 70
                    ? 'var(--success)'
                    : report.score >= 40
                      ? 'var(--warning, #d97706)'
                      : 'var(--error)',
              }}
            >
              {report.score}%
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 11.5, color: 'var(--foreground-muted)', margin: 0 }}>
            Cola a descrição da vaga para a qual estás a concorrer. Extraímos as
            palavras-chave mais relevantes e mostramos quais já aparecem no teu
            CV — e quais ainda te faltam.
          </p>
          <textarea
            rows={5}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Cola aqui a descrição da vaga (ex.: 'We are looking for a Senior React developer with…')"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid var(--card-border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              resize: 'vertical',
              minHeight: 110,
              fontFamily: 'inherit',
            }}
          />
          {report && report.total > 0 && (
            <>
              <ProgressBar value={report.score} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <KeywordList
                  title={`✓ Cobertas (${report.matched.length})`}
                  words={report.matched}
                  color="var(--success)"
                  emptyLabel="Ainda nenhuma."
                />
                <MissingKeywordList
                  title={`✗ Em falta (${report.missing.length})`}
                  words={report.missing}
                  addedSkills={addedSkills}
                  onAdd={handleAddSkill}
                />
              </div>
              {report.missing.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--foreground-muted)', marginTop: 4 }}>
                  Clica numa palavra-chave em falta para a adicionar como competência.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: 8,
        background: 'rgba(148,163,184,0.22)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background:
            value >= 70 ? 'var(--success)' : value >= 40 ? '#d97706' : 'var(--error)',
          transition: 'width 200ms ease',
        }}
      />
    </div>
  );
}

function KeywordList({
  title,
  words,
  color,
  emptyLabel,
}: {
  title: string;
  words: string[];
  color: string;
  emptyLabel: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 6 }}>{title}</div>
      {words.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>{emptyLabel}</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {words.map((w) => (
            <span
              key={w}
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 999,
                background: 'var(--background)',
                border: '1px solid var(--card-border)',
                color: 'var(--foreground)',
              }}
            >
              {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MissingKeywordList({
  title,
  words,
  addedSkills,
  onAdd,
}: {
  title: string;
  words: string[];
  addedSkills: Set<string>;
  onAdd: (word: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--error)', marginBottom: 6 }}>{title}</div>
      {words.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>Parabéns — cobres todas.</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {words.map((w) => {
            const added = addedSkills.has(w);
            return (
              <button
                key={w}
                type="button"
                onClick={() => onAdd(w)}
                disabled={added}
                title={added ? 'Já adicionada' : 'Clica para adicionar como competência'}
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: added ? 'rgba(5,150,105,0.12)' : 'var(--background)',
                  border: `1px solid ${added ? 'var(--success)' : 'var(--card-border)'}`,
                  color: added ? 'var(--success)' : 'var(--foreground)',
                  cursor: added ? 'default' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 120ms ease',
                }}
              >
                {added ? <Check size={10} aria-hidden="true" /> : <Plus size={10} aria-hidden="true" />}
                {w}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildHaystack(data: CVData, lang: 'pt' | 'en'): string {
  const parts: string[] = [];
  parts.push(data.personalInfo.jobTitle?.[lang] || '');
  parts.push(data.summary?.[lang] || '');
  for (const s of data.skills) parts.push(s[lang] || '');
  for (const e of data.experience) {
    parts.push(e.position?.[lang] || '');
    parts.push(e.company || '');
    parts.push(e.description?.[lang] || '');
  }
  for (const p of data.projects) {
    parts.push(p.name || '');
    parts.push(p.description?.[lang] || '');
  }
  for (const c of data.certifications) parts.push(c.name || '');
  for (const e of data.education) {
    parts.push(e.institution || '');
    parts.push(e.degree?.[lang] || '');
  }
  return parts.join(' ');
}

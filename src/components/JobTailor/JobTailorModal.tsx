'use client';

import { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Loader2,
  Plus,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { tailorCVForJobDescription, type JobTailorSuggestion } from '@/lib/openrouter';
import { useCVStore } from '@/store/useCVStore';

interface JobTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JobTailorModal({ isOpen, onClose }: JobTailorModalProps) {
  const { data, activeLanguage, updateSummary, updatePersonalInfo, addSkill } = useCVStore();
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<JobTailorSuggestion | null>(null);
  const [appliedSkills, setAppliedSkills] = useState<Set<string>>(new Set());
  const [summaryApplied, setSummaryApplied] = useState(false);
  const [titleApplied, setTitleApplied] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const result = await tailorCVForJobDescription(jd, data, activeLanguage);
      setSuggestion(result);
      setAppliedSkills(new Set());
      setSummaryApplied(false);
      setTitleApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const applySummary = () => {
    if (!suggestion) return;
    updateSummary({ [activeLanguage]: suggestion.summary });
    setSummaryApplied(true);
  };

  const applyTitle = () => {
    if (!suggestion) return;
    updatePersonalInfo({
      jobTitle: {
        ...data.personalInfo.jobTitle,
        [activeLanguage]: suggestion.jobTitle,
      },
    });
    setTitleApplied(true);
  };

  const addSkillToCV = (skill: string) => {
    addSkill(skill, activeLanguage);
    setAppliedSkills((prev) => new Set(prev).add(skill));
  };

  const reset = () => {
    setSuggestion(null);
    setJd('');
    setAppliedSkills(new Set());
    setSummaryApplied(false);
    setTitleApplied(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 720,
          padding: 28,
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, color: '#94a3b8' }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Adaptar CV à vaga</h2>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              Cola a descrição da vaga e deixa a IA alinhar o teu CV. Funciona mesmo sem IA.
            </div>
          </div>
        </div>

        {!suggestion ? (
          <>
            <div className="form-group">
              <label>Descrição da vaga (JD)</label>
              <textarea
                rows={10}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Cola aqui a descrição da vaga (requisitos, responsabilidades, tecnologias)..."
                style={{ resize: 'vertical', minHeight: 220 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading || !jd.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'A analisar...' : 'Analisar e adaptar'}
              </button>
              <button className="btn-outline" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SuggestionBlock title="Título sugerido" icon={<Briefcase size={16} />}>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600 }}>{suggestion.jobTitle}</div>
                <button
                  className={titleApplied ? 'btn-outline' : 'btn-primary'}
                  onClick={applyTitle}
                  disabled={titleApplied}
                  style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {titleApplied ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
                  {titleApplied ? 'Aplicado' : 'Aplicar'}
                </button>
              </div>
            </SuggestionBlock>

            <SuggestionBlock title="Resumo reescrito" icon={<Sparkles size={16} />}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#cbd5e1', marginBottom: 8 }}>
                {suggestion.summary}
              </p>
              <button
                className={summaryApplied ? 'btn-outline' : 'btn-primary'}
                onClick={applySummary}
                disabled={summaryApplied}
                style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {summaryApplied ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
                {summaryApplied ? 'Aplicado' : 'Aplicar ao CV'}
              </button>
            </SuggestionBlock>

            {suggestion.prioritizedSkills.length > 0 && (
              <SuggestionBlock title="Skills prioritárias (ordem recomendada)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {suggestion.prioritizedSkills.map((s, i) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 11,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: i < 3 ? 'rgba(59,130,246,0.2)' : 'rgba(148,163,184,0.15)',
                        color: i < 3 ? '#93c5fd' : '#cbd5e1',
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}. {s}
                    </span>
                  ))}
                </div>
              </SuggestionBlock>
            )}

            {suggestion.missingSkills.length > 0 && (
              <SuggestionBlock title="Skills que a vaga pede e ainda não tens">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {suggestion.missingSkills.map((s) => {
                    const applied = appliedSkills.has(s);
                    return (
                      <button
                        key={s}
                        className={applied ? 'btn-outline' : 'btn-outline'}
                        onClick={() => !applied && addSkillToCV(s)}
                        disabled={applied}
                        style={{
                          fontSize: 11,
                          padding: '4px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          borderRadius: 999,
                          color: applied ? '#10b981' : '#e2e8f0',
                          borderColor: applied ? 'rgba(16,185,129,0.3)' : undefined,
                        }}
                      >
                        {applied ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                        {s}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
                  Só adiciona as que realmente dominas.
                </div>
              </SuggestionBlock>
            )}

            {suggestion.highlights.length > 0 && (
              <SuggestionBlock title="Sugestões para as tuas experiências">
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {suggestion.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </SuggestionBlock>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-outline" onClick={reset}>
                Analisar outra vaga
              </button>
              <button className="btn-primary" onClick={onClose}>
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--card-border)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#93c5fd',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

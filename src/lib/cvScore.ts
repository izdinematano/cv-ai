/**
 * Rigorous CV scoring with actionable suggestions.
 *
 * The scoring is intentionally strict: a CV that lacks fundamentals (summary,
 * action-verb bullets, metrics, multiple skills, education, contact details)
 * cannot reach a high score. Each missing or weak area produces a concrete,
 * actionable suggestion the user can fix.
 */

import type { CVData } from '@/store/useCVStore';

export interface ScoreSuggestion {
  /** Stable id used for keying the list. */
  id: string;
  /** Short label shown in the UI. */
  label: string;
  /** Severity: critical issues first. */
  severity: 'critical' | 'warning' | 'info';
  /** How many score points the user gains by fixing this. */
  worth: number;
}

export interface ScoreReport {
  score: number;
  suggestions: ScoreSuggestion[];
}

const ACTION_VERBS_EN = [
  'led', 'managed', 'built', 'designed', 'launched', 'shipped', 'delivered',
  'reduced', 'increased', 'improved', 'developed', 'implemented', 'created',
  'optimized', 'optimised', 'architected', 'scaled', 'mentored', 'coordinated',
  'owned', 'drove', 'spearheaded', 'orchestrated',
];

const ACTION_VERBS_PT = [
  'lider', 'lidei', 'liderei', 'geri', 'desenvolvi', 'concebi', 'lancei', 'lancei',
  'lancei', 'reduzi', 'aumentei', 'melhorei', 'implementei', 'criei', 'optimizei',
  'arquitectei', 'orientei', 'coordenei', 'fui responsavel', 'fui responsavel',
  'lancei', 'realizei', 'executei', 'conduzi',
];

const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const startsWithActionVerb = (line: string, lang: 'pt' | 'en'): boolean => {
  const first = stripAccents(line.trim().split(/\s+/)[0] || '');
  if (!first) return false;
  const verbs = lang === 'pt' ? ACTION_VERBS_PT : ACTION_VERBS_EN;
  return verbs.some((v) => first.startsWith(stripAccents(v)));
};

const hasMetric = (line: string): boolean =>
  /\d/.test(line) && /(%|\bk\b|\bm\b|\bb\b|x|euros?|usd|€|\$|users?|utilizadores?|clientes?|equipa|team|hours?|horas?|days?|dias?|weeks?|semanas?|months?|meses?|years?|anos?)/i.test(line);

const splitBullets = (raw: string): string[] =>
  raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-–•*]\s*/, '').trim())
    .filter(Boolean);

export function computeCVScore(data: CVData, lang: 'pt' | 'en'): ScoreReport {
  let score = 0;
  const suggestions: ScoreSuggestion[] = [];
  const p = data.personalInfo;

  // ---- Identity (max 25) -----------------------------------------------
  if (p.fullName) score += 6;
  else suggestions.push({ id: 'name', label: 'Adiciona o teu nome completo.', severity: 'critical', worth: 6 });

  if (p.jobTitle[lang] && p.jobTitle[lang].length >= 3) score += 5;
  else suggestions.push({ id: 'title', label: 'Define um cargo/headline (ex.: "Senior Frontend Engineer").', severity: 'critical', worth: 5 });

  if (p.email && /\S+@\S+\.\S+/.test(p.email)) score += 4;
  else suggestions.push({ id: 'email', label: 'Email em falta ou inválido.', severity: 'critical', worth: 4 });

  if (p.phone && p.phone.replace(/\D/g, '').length >= 7) score += 3;
  else suggestions.push({ id: 'phone', label: 'Adiciona um telefone de contacto.', severity: 'warning', worth: 3 });

  if (p.location) score += 3;
  else suggestions.push({ id: 'location', label: 'Indica a tua localização (cidade/país).', severity: 'warning', worth: 3 });

  if (p.linkedin) score += 2;
  else suggestions.push({ id: 'linkedin', label: 'Adiciona o link do LinkedIn.', severity: 'warning', worth: 2 });

  if (p.website || p.linkedin) score += 1;
  if (p.photo) score += 1;

  // ---- Summary (max 15) ------------------------------------------------
  const summary = (data.summary[lang] || '').trim();
  if (summary.length >= 200) score += 15;
  else if (summary.length >= 100) {
    score += 10;
    suggestions.push({ id: 'summary-short', label: 'Resumo curto. Expande para 3-5 frases descrevendo experiência, áreas e impacto.', severity: 'warning', worth: 5 });
  } else if (summary.length >= 40) {
    score += 5;
    suggestions.push({ id: 'summary-tiny', label: 'Resumo demasiado curto. Escreve um parágrafo de 3-5 frases (clica em ✨ para a IA reescrever).', severity: 'critical', worth: 10 });
  } else {
    suggestions.push({ id: 'summary-missing', label: 'Adiciona um resumo profissional (clica em ✨ para a IA gerar a partir da experiência).', severity: 'critical', worth: 15 });
  }

  // ---- Experience (max 25) ---------------------------------------------
  if (data.experience.length === 0) {
    suggestions.push({ id: 'exp-missing', label: 'Adiciona pelo menos uma experiência profissional.', severity: 'critical', worth: 25 });
  } else {
    score += Math.min(data.experience.length, 3) * 4; // up to 12 for 3+ roles
    let bulletCount = 0;
    let actionVerbBullets = 0;
    let metricBullets = 0;
    let weakBullets = 0;
    for (const exp of data.experience) {
      const desc = exp.description[lang] || '';
      const bullets = splitBullets(desc);
      bulletCount += bullets.length;
      for (const b of bullets) {
        if (startsWithActionVerb(b, lang)) actionVerbBullets += 1;
        if (hasMetric(b)) metricBullets += 1;
        if (b.length < 30) weakBullets += 1;
      }
    }

    if (bulletCount >= 3) score += 4;
    else suggestions.push({ id: 'exp-bullets', label: 'Cada experiência deve ter 3-5 bullets concretos.', severity: 'warning', worth: 4 });

    const verbRatio = bulletCount > 0 ? actionVerbBullets / bulletCount : 0;
    if (verbRatio >= 0.6) score += 5;
    else if (bulletCount > 0) {
      suggestions.push({
        id: 'exp-verbs',
        label: `Só ${Math.round(verbRatio * 100)}% dos bullets começam com verbo de acção. Reescreve com "Liderei", "Implementei", "Reduzi"... (✨ ajuda).`,
        severity: 'warning',
        worth: 5,
      });
    }

    if (metricBullets >= 2) score += 4;
    else {
      suggestions.push({
        id: 'exp-metrics',
        label: 'Adiciona métricas concretas (%, €, número de utilizadores, tempo). Bullets sem números têm fraco impacto.',
        severity: 'warning',
        worth: 4,
      });
    }

    if (weakBullets > 0 && bulletCount > 0) {
      suggestions.push({
        id: 'exp-weak',
        label: `${weakBullets} bullet(s) demasiado curto(s). Cada um deve ter 12+ palavras com contexto e resultado.`,
        severity: 'info',
        worth: 0,
      });
    }
  }

  // ---- Education (max 8) -----------------------------------------------
  if (data.education.length >= 1) score += 6;
  else suggestions.push({ id: 'edu', label: 'Adiciona formação académica.', severity: 'warning', worth: 6 });
  if (data.education.some((e) => e.year)) score += 2;

  // ---- Skills (max 12) -------------------------------------------------
  const skillCount = data.skills.filter((s) => (s[lang] || s.pt || s.en || '').trim()).length;
  if (skillCount >= 8) score += 12;
  else if (skillCount >= 5) {
    score += 8;
    suggestions.push({ id: 'skills-grow', label: 'Tens poucas competências. Aponta a 8-12 (técnicas + ferramentas + metodologias).', severity: 'info', worth: 4 });
  } else if (skillCount >= 1) {
    score += 4;
    suggestions.push({ id: 'skills-few', label: `Apenas ${skillCount} competência(s). Adiciona pelo menos 8 relevantes para o teu cargo.`, severity: 'warning', worth: 8 });
  } else {
    suggestions.push({ id: 'skills-missing', label: 'Adiciona competências (mínimo 8).', severity: 'critical', worth: 12 });
  }

  // ---- Languages (max 5) ------------------------------------------------
  if (data.languages.length >= 2) score += 5;
  else if (data.languages.length === 1) {
    score += 3;
    suggestions.push({ id: 'lang-grow', label: 'Adiciona pelo menos 2 idiomas com nível.', severity: 'info', worth: 2 });
  } else {
    suggestions.push({ id: 'lang-missing', label: 'Adiciona idiomas que dominas e o respectivo nível.', severity: 'warning', worth: 5 });
  }

  // ---- Projects / Certifications (max 10) ------------------------------
  if (data.projects.length >= 1) score += 5;
  else suggestions.push({ id: 'projects', label: 'Adiciona 1-3 projectos relevantes (open-source, freelance ou pessoais).', severity: 'info', worth: 5 });

  if (data.certifications.length >= 1) score += 5;
  else suggestions.push({ id: 'certs', label: 'Adiciona certificações relevantes (cursos, formações).', severity: 'info', worth: 5 });

  // Sort suggestions by severity then worth desc
  const order = { critical: 0, warning: 1, info: 2 } as const;
  suggestions.sort((a, b) => order[a.severity] - order[b.severity] || b.worth - a.worth);

  return { score: Math.min(score, 100), suggestions };
}

/**
 * Lightweight writing-quality heuristics for CV content. Runs fully offline,
 * no AI calls. Designed to give the user quick, actionable signals about
 * their own prose — longer-form AI polish still lives in the "Melhorar com IA"
 * button.
 *
 * The checks are intentionally conservative: they only flag issues we are
 * highly confident about, so the feedback doesn't feel spammy.
 */

export interface WritingReport {
  words: number;
  characters: number;
  readingLevel: 'short' | 'ok' | 'long';
  issues: WritingIssue[];
  /** `ok` = nothing to flag; `warn` = improvable; `critical` = please fix. */
  severity: 'ok' | 'warn' | 'critical';
}

export interface WritingIssue {
  code:
    | 'first-person'
    | 'passive-voice'
    | 'weak-opener'
    | 'no-numbers'
    | 'too-short'
    | 'too-long'
    | 'cliche';
  message: string;
  severity: 'warn' | 'critical';
}

const ACTION_VERBS_EN = [
  'led', 'built', 'designed', 'delivered', 'shipped', 'launched', 'drove',
  'increased', 'reduced', 'optimized', 'scaled', 'owned', 'managed',
  'mentored', 'architected', 'automated', 'accelerated', 'spearheaded',
  'improved', 'grew', 'created', 'developed', 'implemented', 'coordinated',
  'researched', 'analysed', 'analyzed', 'presented', 'negotiated',
];

const ACTION_VERBS_PT = [
  'liderei', 'construí', 'desenhei', 'entreguei', 'lancei', 'impulsionei',
  'aumentei', 'reduzi', 'otimizei', 'escalei', 'geri', 'mentoriei',
  'arquitetei', 'automatizei', 'acelerei', 'coordenei', 'melhorei',
  'aumentei', 'criei', 'desenvolvi', 'implementei', 'analisei', 'negociei',
  'apresentei',
];

const CLICHES = [
  'team player', 'hardworking', 'results-driven', 'go-getter', 'synergy',
  'think outside the box', 'detail-oriented', 'self-starter',
  'jogador de equipa', 'trabalhador', 'proativo',
];

const FIRST_PERSON = /\b(I|me|my|mine|we|us|our|ours|eu|me|meu|minha|nós|nosso|nossa)\b/i;
/** Simple passive-voice heuristic: auxiliary + past participle-ish token. */
const PASSIVE = /\b(was|were|been|being|is|are|be|foi|foram|é|são|ser|está)\s+\w+(ed|do|da|to|ido|so|sa)\b/i;
/** Any digit — presence indicates quantified impact. */
const HAS_NUMBER = /\d/;

const normalize = (s: string) => s.trim().toLowerCase();

const countWords = (s: string) => {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

/** Evaluate a single bullet / sentence. */
export function analyzeBullet(
  text: string,
  lang: 'pt' | 'en' = 'pt'
): WritingReport {
  const words = countWords(text);
  const characters = text.trim().length;
  const issues: WritingIssue[] = [];

  if (words > 0 && words < 5) {
    issues.push({ code: 'too-short', message: 'Demasiado curto — expande o impacto.', severity: 'warn' });
  }
  if (words > 35) {
    issues.push({ code: 'too-long', message: 'Longo — separa em bullets distintos.', severity: 'warn' });
  }

  if (FIRST_PERSON.test(text)) {
    issues.push({
      code: 'first-person',
      message: 'Evita pronomes na 1ª pessoa ("eu", "I", "my").',
      severity: 'warn',
    });
  }

  if (PASSIVE.test(text)) {
    issues.push({
      code: 'passive-voice',
      message: 'Frase parece na voz passiva — preferir verbo de ação directo.',
      severity: 'warn',
    });
  }

  const verbs = lang === 'pt' ? ACTION_VERBS_PT : ACTION_VERBS_EN;
  const firstWord = normalize(text).replace(/^[-–•*]\s*/, '').split(/\s+/)[0] || '';
  if (firstWord && words >= 3 && !verbs.includes(firstWord)) {
    issues.push({
      code: 'weak-opener',
      message: `Começa com verbo de acção (ex.: ${verbs.slice(0, 4).join(', ')}…).`,
      severity: 'warn',
    });
  }

  if (words >= 6 && !HAS_NUMBER.test(text)) {
    issues.push({
      code: 'no-numbers',
      message: 'Acrescenta um número/métrica para dar impacto.',
      severity: 'warn',
    });
  }

  const lower = text.toLowerCase();
  for (const c of CLICHES) {
    if (lower.includes(c)) {
      issues.push({ code: 'cliche', message: `Evita o cliché "${c}".`, severity: 'warn' });
      break;
    }
  }

  const readingLevel: WritingReport['readingLevel'] =
    words < 5 ? 'short' : words > 35 ? 'long' : 'ok';

  const severity: WritingReport['severity'] = issues.some((i) => i.severity === 'critical')
    ? 'critical'
    : issues.length >= 2
      ? 'warn'
      : issues.length === 1
        ? 'warn'
        : 'ok';

  return { words, characters, readingLevel, issues, severity };
}

/** Evaluate a free-form block (e.g. summary): same rules but with length
 *  bands tuned for a paragraph. */
export function analyzeParagraph(
  text: string,
  lang: 'pt' | 'en' = 'pt',
  opts: { min?: number; max?: number } = {}
): WritingReport {
  const { min = 40, max = 100 } = opts;
  const base = analyzeBullet(text, lang);
  const words = base.words;
  // Drop the bullet-specific length issues and replace with paragraph ones.
  const issues = base.issues.filter((i) => i.code !== 'too-short' && i.code !== 'too-long');
  if (words > 0 && words < min) {
    issues.push({
      code: 'too-short',
      message: `Menos de ${min} palavras — expande para dar contexto.`,
      severity: 'warn',
    });
  }
  if (words > max) {
    issues.push({
      code: 'too-long',
      message: `Mais de ${max} palavras — encurta para impactar mais.`,
      severity: 'warn',
    });
  }
  return {
    ...base,
    issues,
    readingLevel: words < min ? 'short' : words > max ? 'long' : 'ok',
    severity: issues.length === 0 ? 'ok' : 'warn',
  };
}

/* -------------------------------------------------------------------------- */
/* ATS keyword matching                                                       */
/* -------------------------------------------------------------------------- */

const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
  'e', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem',
  'que', 'se', 'é', 'ser', 'são', 'está', 'ao', 'à',
  'the', 'a', 'an', 'of', 'in', 'on', 'for', 'with', 'and', 'or', 'to',
  'is', 'are', 'was', 'were', 'be', 'been', 'as', 'by', 'at', 'from',
  'this', 'that', 'these', 'those', 'you', 'your', 'we', 'our',
]);

export interface AtsReport {
  total: number;
  matched: string[];
  missing: string[];
  score: number; // 0..100
  topKeywords: Array<{ word: string; count: number }>;
}

/**
 * Extract the N most frequent meaningful tokens from a job description,
 * then compare with a haystack (skills + experience text). Returns a
 * keyword-match report the user can act on.
 */
export function atsMatch(jobDescription: string, haystack: string): AtsReport {
  const tokens = tokenize(jobDescription);
  const counts = new Map<string, number>();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  // Sort and keep up to 25 terms that aren't too short.
  const topKeywords = [...counts.entries()]
    .filter(([w]) => w.length >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word, count]) => ({ word, count }));

  const hayLower = haystack.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];
  for (const { word } of topKeywords) {
    if (hayLower.includes(word)) matched.push(word);
    else missing.push(word);
  }

  const total = topKeywords.length || 1;
  const score = Math.round((matched.length / total) * 100);
  return { total, matched, missing, score, topKeywords };
}

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+.#\s-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w && w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

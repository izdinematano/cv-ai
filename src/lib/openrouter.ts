import { getTemplateRecommendation } from '@/lib/recommendations';
import type {
  CVData,
  Certification,
  Education,
  Experience,
  LanguageEntry,
  MultilingualField,
  Project,
} from '@/store/useCVStore';

export type TranslationModel = 'advanced' | 'light';
type GeminiTask = 'translate' | 'improve' | 'import' | 'recommend';

const TASK_MODELS: Record<GeminiTask, string> = {
  translate: 'gemini-1.5-flash',
  improve: 'gemini-1.5-pro',
  import: 'gemini-1.5-pro',
  recommend: 'gemini-1.5-flash',
};

const createId = () => Math.random().toString(36).slice(2, 11);

const emptyMultilingualField = (): MultilingualField => ({ pt: '', en: '' });

const normalizeMultilingual = (
  value: unknown,
  preferredLang: 'pt' | 'en'
): MultilingualField => {
  if (!value) return emptyMultilingualField();

  if (typeof value === 'string') {
    return preferredLang === 'pt'
      ? { pt: value.trim(), en: '' }
      : { pt: '', en: value.trim() };
  }

  if (typeof value === 'object') {
    const candidate = value as Partial<MultilingualField>;
    return {
      pt: typeof candidate.pt === 'string' ? candidate.pt.trim() : '',
      en: typeof candidate.en === 'string' ? candidate.en.trim() : '',
    };
  }

  return emptyMultilingualField();
};

const normalizeExperience = (
  items: unknown,
  preferredLang: 'pt' | 'en'
): Experience[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const value = (item || {}) as Partial<Experience>;
    return {
      id: typeof value.id === 'string' && value.id ? value.id : createId(),
      company: typeof value.company === 'string' ? value.company.trim() : '',
      position: normalizeMultilingual(value.position, preferredLang),
      period: typeof value.period === 'string' ? value.period.trim() : '',
      description: normalizeMultilingual(value.description, preferredLang),
    };
  });
};

const normalizeEducation = (
  items: unknown,
  preferredLang: 'pt' | 'en'
): Education[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const value = (item || {}) as Partial<Education>;
    return {
      id: typeof value.id === 'string' && value.id ? value.id : createId(),
      institution: typeof value.institution === 'string' ? value.institution.trim() : '',
      degree: normalizeMultilingual(value.degree, preferredLang),
      year: typeof value.year === 'string' ? value.year.trim() : '',
    };
  });
};

const normalizeProjects = (
  items: unknown,
  preferredLang: 'pt' | 'en'
): Project[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const value = (item || {}) as Partial<Project>;
    return {
      id: typeof value.id === 'string' && value.id ? value.id : createId(),
      name: typeof value.name === 'string' ? value.name.trim() : '',
      link: typeof value.link === 'string' ? value.link.trim() : '',
      description: normalizeMultilingual(value.description, preferredLang),
    };
  });
};

const normalizeCertifications = (items: unknown): Certification[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const value = (item || {}) as Partial<Certification>;
    return {
      id: typeof value.id === 'string' && value.id ? value.id : createId(),
      name: typeof value.name === 'string' ? value.name.trim() : '',
      issuer: typeof value.issuer === 'string' ? value.issuer.trim() : '',
      year: typeof value.year === 'string' ? value.year.trim() : '',
    };
  });
};

const normalizeSkills = (
  items: unknown,
  preferredLang: 'pt' | 'en'
): MultilingualField[] => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeMultilingual(item, preferredLang));
};

const normalizeLanguages = (
  items: unknown,
  preferredLang: 'pt' | 'en'
): LanguageEntry[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const value = (item || {}) as Partial<LanguageEntry>;
    return {
      name: typeof value.name === 'string' ? value.name.trim() : '',
      level: normalizeMultilingual(value.level, preferredLang),
    };
  });
};

/**
 * Calls Gemini chat completion. Never throws: returns empty string on any failure
 * (missing key, network error, HTTP error, rate limit). The caller is responsible for
 * deciding what to do with an empty response (use fallback / keep original text).
 */
async function callGeminiText(task: GeminiTask, prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, prompt }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[AI] request failed:', {
        status: response.status,
        body: payload,
      });
      return '';
    }

    const content = String(payload?.content || '').trim();

    // Treat provider/rate-limit error messages returned as assistant content as silent failures.
    if (looksLikeProviderError(content) || looksLikeProviderError(payload?.error?.message)) {
      console.warn('[AI] provider error in content:', content || payload?.error?.message);
      return '';
    }

    return content;
  } catch (err) {
    console.error('[AI] network error:', err);
    return '';
  }
}

function looksLikeProviderError(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false;
  const v = value.toLowerCase();
  return (
    v.startsWith('unknown:') ||
    v.includes('rate limit') ||
    v.includes('api providers') ||
    v.includes('third-party model provider') ||
    v.includes('currently not available') ||
    v.includes('no endpoints found') ||
    v.includes('trial users')
  );
}

async function callGeminiJSON<T>(task: GeminiTask, prompt: string): Promise<T | null> {
  const text = await callGeminiText(task, prompt);
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export async function translateCVField(
  text: string,
  from: 'pt' | 'en',
  to: 'pt' | 'en',
  modelType: TranslationModel = 'advanced'
) {
  if (!text) return '';

  const task: GeminiTask = modelType === 'light' ? 'translate' : 'improve';
  const prompt = `
You are a professional CV editor specializing in the international job market.
Convert the following CV field from ${from === 'pt' ? 'Portuguese' : 'English'} to ${
    to === 'pt' ? 'Portuguese' : 'English'
  }.

Rules:
1. Never do a literal translation.
2. Adapt technical terms and job titles to the professional standard of the target language.
3. Improve clarity and impact.
4. Preserve bullet formatting if it exists.
5. Return only the converted text.

TEXT:
"${text}"
`;

  const result = await callGeminiText(task, prompt);
  return result || text;
}

export async function improveCVField(
  text: string,
  lang: 'pt' | 'en',
  modelType: TranslationModel = 'advanced'
) {
  if (!text) return '';

  const task: GeminiTask = modelType === 'light' ? 'translate' : 'improve';
  const prompt = `
You are a senior CV writing agent.
Improve the following CV text in ${lang === 'pt' ? 'Portuguese' : 'English'}.

Rules:
1. Keep the same language.
2. Make the writing more professional and concise.
3. Prefer action verbs and specific outcomes when possible.
4. Keep the same overall structure and formatting.
5. Return only the improved text.

TEXT:
"${text}"
`;

  const result = await callGeminiText(task, prompt);
  return result || text;
}

interface ImportedCVPayload {
  personalInfo?: Partial<CVData['personalInfo']>;
  summary?: string | Partial<MultilingualField>;
  experience?: Partial<Experience>[];
  education?: Partial<Education>[];
  skills?: Array<string | Partial<MultilingualField>>;
  languages?: Partial<LanguageEntry>[];
  projects?: Partial<Project>[];
  certifications?: Partial<Certification>[];
}

export async function extractCVDataFromRawCV(
  rawCVText: string,
  preferredLang: 'pt' | 'en'
): Promise<Partial<CVData> | null> {
  if (!rawCVText.trim()) return null;

  const prompt = `
You are an expert CV parsing and rewriting agent.
Read the CV text below, improve it lightly, and convert it into valid JSON.

Return JSON only with this exact shape:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": "",
    "jobTitle": { "pt": "", "en": "" }
  },
  "summary": { "pt": "", "en": "" },
  "experience": [
    {
      "company": "",
      "position": { "pt": "", "en": "" },
      "period": "",
      "description": { "pt": "", "en": "" }
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": { "pt": "", "en": "" },
      "year": ""
    }
  ],
  "skills": [{ "pt": "", "en": "" }],
  "languages": [{ "name": "", "level": { "pt": "", "en": "" } }],
  "projects": [
    {
      "name": "",
      "link": "",
      "description": { "pt": "", "en": "" }
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "year": ""
    }
  ]
}

Rules:
1. Preferred language is ${preferredLang}.
2. If only one language is clearly present, fill that language first and leave the other blank when necessary.
3. Improve weak wording, but do not invent jobs, degrees, certifications, or achievements that are not implied.
4. Normalize obvious sections and contact details.
5. Return empty arrays when a section does not exist.

CV TEXT:
"""
${rawCVText}
"""
`;

  const payload = await callGeminiJSON<ImportedCVPayload>('import', prompt);
  if (!payload) return null;

  try {
    return {
      personalInfo: {
        fullName: typeof payload.personalInfo?.fullName === 'string' ? payload.personalInfo.fullName.trim() : '',
        email: typeof payload.personalInfo?.email === 'string' ? payload.personalInfo.email.trim() : '',
        phone: typeof payload.personalInfo?.phone === 'string' ? payload.personalInfo.phone.trim() : '',
        location: typeof payload.personalInfo?.location === 'string' ? payload.personalInfo.location.trim() : '',
        linkedin: typeof payload.personalInfo?.linkedin === 'string' ? payload.personalInfo.linkedin.trim() : '',
        website: typeof payload.personalInfo?.website === 'string' ? payload.personalInfo.website.trim() : '',
        jobTitle: normalizeMultilingual(payload.personalInfo?.jobTitle, preferredLang),
      },
      summary: normalizeMultilingual(payload.summary, preferredLang),
      experience: normalizeExperience(payload.experience, preferredLang),
      education: normalizeEducation(payload.education, preferredLang),
      skills: normalizeSkills(payload.skills, preferredLang),
      languages: normalizeLanguages(payload.languages, preferredLang),
      projects: normalizeProjects(payload.projects, preferredLang),
      certifications: normalizeCertifications(payload.certifications),
    };
  } catch {
    return null;
  }
}

interface TemplateSuggestion {
  template: string;
  reason: string;
  badge: string;
}

export async function recommendTemplateWithAI(
  rawCVText: string,
  data: Partial<CVData>,
  lang: 'pt' | 'en'
): Promise<TemplateSuggestion> {
  const jobTitle = data.personalInfo?.jobTitle?.[lang] || data.personalInfo?.jobTitle?.pt || data.personalInfo?.jobTitle?.en || '';
  const fallback = getTemplateRecommendation(jobTitle || rawCVText);

  if (!rawCVText.trim()) return fallback;

  const prompt = `
You are a resume design recommendation agent.
Choose the best template id for this CV from the list below and explain why.

Available template ids:
- minimalist
- minimalist-v2
- corporate
- corporate-v2
- creative
- creative-v2
- executive
- executive-v2
- tech
- modern
- student
- studio
- atlas
- bold

Return JSON only:
{
  "template": "tech",
  "reason": "short explanation",
  "badge": "short badge"
}

Candidate job title:
${jobTitle || 'Unknown'}

CV text:
"""
${rawCVText}
"""
`;

  const suggestion = await callGeminiJSON<TemplateSuggestion>('recommend', prompt);
  if (!suggestion?.template) return fallback;
  return suggestion;
}

export interface JobTailorSuggestion {
  summary: string;
  jobTitle: string;
  prioritizedSkills: string[];
  missingSkills: string[];
  highlights: string[];
}

/**
 * Returns a CV tailoring suggestion for the given job description. Falls back
 * to a client-side keyword analysis when the AI provider is unavailable.
 */
export async function tailorCVForJobDescription(
  jobDescription: string,
  data: CVData,
  lang: 'pt' | 'en'
): Promise<JobTailorSuggestion> {
  const clientFallback = buildClientSideTailorFallback(jobDescription, data, lang);

  if (!jobDescription.trim()) return clientFallback;

  const currentSummary = data.summary[lang] || data.summary.pt || data.summary.en || '';
  const currentTitle =
    data.personalInfo.jobTitle[lang] ||
    data.personalInfo.jobTitle.pt ||
    data.personalInfo.jobTitle.en ||
    '';
  const skillList = data.skills
    .map((s) => s[lang] || s.pt || s.en)
    .filter(Boolean)
    .join(', ');

  const prompt = `
You are a senior CV tailoring agent. The candidate wants to adapt their CV to the
job description below. Respond in ${lang === 'pt' ? 'Portuguese' : 'English'}.

Return JSON only with this exact shape:
{
  "summary": "3-4 sentence rewritten professional summary tailored to the JD",
  "jobTitle": "suggested concise job title that matches the JD",
  "prioritizedSkills": ["top 8 existing skills reordered by relevance to the JD"],
  "missingSkills": ["skills the JD clearly asks for that the candidate is missing, max 6"],
  "highlights": ["2-4 bullet suggestions for experience rewrites"]
}

Rules:
1. Never invent skills the candidate doesn't plausibly have.
2. Keep the summary grounded in the candidate's background.
3. Use action-oriented, concise language.
4. Only return valid JSON.

Candidate current title: ${currentTitle || 'Unknown'}
Candidate summary: ${currentSummary || 'N/A'}
Candidate skills: ${skillList || 'N/A'}

Job Description:
"""
${jobDescription}
"""
`;

  const payload = await callGeminiJSON<JobTailorSuggestion>('improve', prompt);
  if (!payload) return clientFallback;

  return {
    summary: typeof payload.summary === 'string' ? payload.summary : clientFallback.summary,
    jobTitle: typeof payload.jobTitle === 'string' ? payload.jobTitle : clientFallback.jobTitle,
    prioritizedSkills: Array.isArray(payload.prioritizedSkills)
      ? payload.prioritizedSkills.filter((s): s is string => typeof s === 'string')
      : clientFallback.prioritizedSkills,
    missingSkills: Array.isArray(payload.missingSkills)
      ? payload.missingSkills.filter((s): s is string => typeof s === 'string')
      : clientFallback.missingSkills,
    highlights: Array.isArray(payload.highlights)
      ? payload.highlights.filter((s): s is string => typeof s === 'string')
      : clientFallback.highlights,
  };
}

/* -----------------------------------------------------------------------------
 * Client-side fallback for CV tailoring (when AI is unavailable)
 * ----------------------------------------------------------------------------*/

const STOP_WORDS_EN = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'for', 'with', 'to', 'of', 'in', 'on', 'at',
  'by', 'from', 'be', 'is', 'are', 'was', 'were', 'will', 'you', 'your', 'our', 'we',
  'this', 'that', 'these', 'those', 'as', 'it', 'its', 'has', 'have', 'had', 'not', 'no',
  'all', 'any', 'some', 'who', 'what', 'when', 'where', 'why', 'how', 'can', 'do', 'does',
  'including', 'about', 'also', 'than', 'more', 'most', 'very', 'using', 'use',
]);
const STOP_WORDS_PT = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'nao', 'não', 'uma',
  'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele',
  'das', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'sobre', 'isso', 'esta',
  'nos', 'já', 'ja', 'eu', 'também', 'tambem', 'entre', 'ate', 'até', 'sao', 'são',
]);

const extractKeywords = (text: string) => {
  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.+#-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const counts = new Map<string, number>();
  for (const raw of tokens) {
    const word = raw.replace(/^[.+#-]+|[.+#-]+$/g, '');
    if (word.length < 3) continue;
    if (STOP_WORDS_EN.has(word) || STOP_WORDS_PT.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
};

const buildClientSideTailorFallback = (
  jobDescription: string,
  data: CVData,
  lang: 'pt' | 'en'
): JobTailorSuggestion => {
  const jdKeywords = extractKeywords(jobDescription);
  const jdKeywordSet = new Set(jdKeywords);

  const skillLabels = data.skills
    .map((s) => (s[lang] || s.pt || s.en || '').trim())
    .filter(Boolean);

  const prioritizedSkills = [...skillLabels].sort((a, b) => {
    const aHit = jdKeywordSet.has(a.toLowerCase()) ? 1 : 0;
    const bHit = jdKeywordSet.has(b.toLowerCase()) ? 1 : 0;
    return bHit - aHit;
  });

  const existingSkillSet = new Set(skillLabels.map((s) => s.toLowerCase()));
  const missingSkills = jdKeywords
    .filter((k) => k.length > 3 && !existingSkillSet.has(k))
    .slice(0, 8);

  const currentSummary = data.summary[lang] || data.summary.pt || data.summary.en || '';
  const currentTitle =
    data.personalInfo.jobTitle[lang] ||
    data.personalInfo.jobTitle.pt ||
    data.personalInfo.jobTitle.en ||
    '';

  const keywordsPreview = jdKeywords.slice(0, 6).join(', ');

  const summary = currentSummary
    ? lang === 'pt'
      ? `${currentSummary.trim()} Foco em ${keywordsPreview}.`
      : `${currentSummary.trim()} Focused on ${keywordsPreview}.`
    : lang === 'pt'
    ? `Profissional orientado a resultados, com foco em ${keywordsPreview}.`
    : `Results-driven professional focused on ${keywordsPreview}.`;

  return {
    summary,
    jobTitle: currentTitle,
    prioritizedSkills,
    missingSkills,
    highlights: [
      lang === 'pt'
        ? `Destaca experiências ligadas a: ${keywordsPreview}.`
        : `Highlight experience tied to: ${keywordsPreview}.`,
      lang === 'pt'
        ? 'Usa verbos de acção e métricas concretas em cada bullet.'
        : 'Lead each bullet with an action verb and a concrete metric.',
    ],
  };
};

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

export const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';

export type TranslationModel = 'advanced' | 'light';
type OpenRouterTask = 'translate' | 'improve' | 'import' | 'recommend';

const TASK_MODELS: Record<OpenRouterTask, string> = {
  translate: 'google/gemini-2.0-flash-lite:free',
  improve: 'anthropic/claude-3.5-sonnet',
  import: 'openai/gpt-4o-mini',
  recommend: 'google/gemini-2.0-flash-lite:free',
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
 * Calls OpenRouter chat completion. Never throws: returns empty string on any failure
 * (missing key, network error, HTTP error, rate limit). The caller is responsible for
 * deciding what to do with an empty response (use fallback / keep original text).
 */
async function callOpenRouterText(task: OpenRouterTask, prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) return '';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cv-gen-ai.local',
        'X-Title': 'CV Gen AI',
      },
      body: JSON.stringify({
        model: TASK_MODELS[task],
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) return '';

    const payload = await response.json();
    return String(payload?.choices?.[0]?.message?.content || '').trim();
  } catch {
    return '';
  }
}

async function callOpenRouterJSON<T>(task: OpenRouterTask, prompt: string): Promise<T | null> {
  const text = await callOpenRouterText(task, prompt);
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

  const task: OpenRouterTask = modelType === 'light' ? 'translate' : 'improve';
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

  const result = await callOpenRouterText(task, prompt);
  return result || text;
}

export async function improveCVField(
  text: string,
  lang: 'pt' | 'en',
  modelType: TranslationModel = 'advanced'
) {
  if (!text) return '';

  const task: OpenRouterTask = modelType === 'light' ? 'translate' : 'improve';
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

  const result = await callOpenRouterText(task, prompt);
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

  const payload = await callOpenRouterJSON<ImportedCVPayload>('import', prompt);
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

  const suggestion = await callOpenRouterJSON<TemplateSuggestion>('recommend', prompt);
  if (!suggestion?.template) return fallback;
  return suggestion;
}

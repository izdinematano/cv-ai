import type { CSSProperties } from 'react';
import type { CVData } from '@/store/useCVStore';

export interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export const A4_MIN_HEIGHT = 1122;

export const getInitials = (name: string) => {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');
};

export const labels = {
  profile: { pt: 'PERFIL', en: 'PROFILE' },
  about: { pt: 'SOBRE MIM', en: 'ABOUT ME' },
  experience: { pt: 'EXPERIÊNCIA', en: 'EXPERIENCE' },
  education: { pt: 'EDUCAÇÃO', en: 'EDUCATION' },
  skills: { pt: 'COMPETÊNCIAS', en: 'SKILLS' },
  languages: { pt: 'IDIOMAS', en: 'LANGUAGES' },
  projects: { pt: 'PROJETOS', en: 'PROJECTS' },
  certifications: { pt: 'CERTIFICAÇÕES', en: 'CERTIFICATIONS' },
  awards: { pt: 'PRÉMIOS', en: 'AWARDS' },
  contact: { pt: 'CONTACTO', en: 'CONTACT' },
  details: { pt: 'DETALHES', en: 'DETAILS' },
  links: { pt: 'LINKS', en: 'LINKS' },
} as const;

export const a4Frame = (extra: CSSProperties = {}): CSSProperties => ({
  width: '100%',
  minHeight: `${A4_MIN_HEIGHT}px`,
  background: 'white',
  color: '#1f2937',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden',
  ...extra,
});

export const fallbackPhoto = (name: string, color: string) => {
  const initials = getInitials(name);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">` +
    `<rect width="240" height="240" fill="${color}"/>` +
    `<text x="50%" y="55%" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="100" font-weight="700" fill="#ffffff">${initials}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

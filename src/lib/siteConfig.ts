/**
 * Single source of truth for public site metadata. Keep in sync with the
 * deployed domain. Everything SEO-related (layout metadata, robots, sitemap,
 * OG image) reads from here so a domain change is a one-liner.
 */
export const siteConfig = {
  name: 'CV-Gen AI',
  domain: 'cv.moztraders.com',
  url: 'https://cv.moztraders.com',
  tagline: 'Editor bilingue de CV com IA',
  description:
    'Cria o teu CV profissional em minutos. Editor bilingue PT/EN, sugestões inteligentes de IA em cada campo e templates premium pensados para Moçambique e o mercado internacional.',
  keywords: [
    'CV',
    'Currículo',
    'Resume',
    'IA',
    'AI',
    'Gerador de CV',
    'Multilingue',
    'Moçambique',
    'Trabalho remoto',
    'ATS',
    'PDF',
  ],
  locale: 'pt_PT',
  twitter: '@moztraders',
  themeColor: '#4f46e5',
} as const;

export type SiteConfig = typeof siteConfig;

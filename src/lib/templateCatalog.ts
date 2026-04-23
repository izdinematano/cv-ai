import type { CVData } from '@/store/useCVStore';

export interface TemplateDefinition {
  id: string;
  name: string;
  badge: string;
  category: string;
  tone: string;
  description: string;
  accentColor: string;
  featured?: boolean;
}

export const templateCatalog: TemplateDefinition[] = [
  {
    id: 'minimalist',
    name: 'Minimalista',
    badge: 'ATS Clean',
    category: 'Classico',
    tone: 'Discreto e elegante',
    description: 'Layout limpo para perfis que querem clareza, leitura rapida e foco no conteudo.',
    accentColor: '#2563eb',
    featured: true,
  },
  {
    id: 'minimalist-v2',
    name: 'Minimalista Mono',
    badge: 'Editorial',
    category: 'Classico',
    tone: 'Minimalismo premium',
    description: 'Tipografia centrada e visual editorial para um posicionamento mais sofisticado.',
    accentColor: '#0f766e',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    badge: 'Business',
    category: 'Executivo',
    tone: 'Profissional e seguro',
    description: 'Boa escolha para consultoria, administracao, banca e perfis institucionais.',
    accentColor: '#1d4ed8',
  },
  {
    id: 'corporate-v2',
    name: 'Corporate Edge',
    badge: 'Premium',
    category: 'Executivo',
    tone: 'Formal com impacto',
    description: 'Cabecalho forte, foto opcional e uma presenca mais premium para funcoes seniores.',
    accentColor: '#0f766e',
    featured: true,
  },
  {
    id: 'creative',
    name: 'Creative Studio',
    badge: 'Creative',
    category: 'Design',
    tone: 'Expressivo e visual',
    description: 'Para marketing, design, conteudo e perfis que precisam transmitir personalidade.',
    accentColor: '#ea580c',
  },
  {
    id: 'creative-v2',
    name: 'Creative Noir',
    badge: 'Bold',
    category: 'Design',
    tone: 'Dramatico e marcante',
    description: 'Contraste forte, shapes e presenca visual para portfolios e cargos criativos.',
    accentColor: '#db2777',
    featured: true,
  },
  {
    id: 'executive',
    name: 'Executive',
    badge: 'Leadership',
    category: 'Executivo',
    tone: 'Autoridade e sobriedade',
    description: 'Um CV de lideranca com ritmo classico e leitura forte para decisores.',
    accentColor: '#111827',
  },
  {
    id: 'executive-v2',
    name: 'Executive Prestige',
    badge: 'C-Level',
    category: 'Executivo',
    tone: 'Luxo contido',
    description: 'Visual refinado para diretores, gestores e cargos de topo com foco em presenca.',
    accentColor: '#7c3aed',
    featured: true,
  },
  {
    id: 'tech',
    name: 'Tech Grid',
    badge: 'Top for IT',
    category: 'Tech',
    tone: 'Moderno e tecnico',
    description: 'Sidebar de stack, contraste forte e look atual para software, dados e produto.',
    accentColor: '#06b6d4',
    featured: true,
  },
  {
    id: 'modern',
    name: 'Modern Canvas',
    badge: 'SaaS',
    category: 'Contemporaneo',
    tone: 'Visual fresco',
    description: 'Mistura foto, blocos visuais e uma apresentacao contemporanea sem perder legibilidade.',
    accentColor: '#8b5cf6',
    featured: true,
  },
  {
    id: 'student',
    name: 'Starter',
    badge: 'Junior',
    category: 'Entrada',
    tone: 'Leve e confiante',
    description: 'Pensado para estudantes, trainees e primeiros anos de carreira com boa hierarquia.',
    accentColor: '#f59e0b',
    featured: true,
  },
];

export const featuredTemplateIds = templateCatalog
  .filter((template) => template.featured)
  .map((template) => template.id);

export const getTemplateDefinition = (templateId: string) =>
  templateCatalog.find((template) => template.id === templateId) || templateCatalog[0];

export const createShowcaseCVData = (templateId: string): CVData => {
  const template = getTemplateDefinition(templateId);

  return {
    personalInfo: {
      fullName: 'Amina Matola',
      email: 'amina@portfolio.pro',
      phone: '+258 84 321 7788',
      location: 'Maputo, Mozambique',
      linkedin: 'linkedin.com/in/aminamatola',
      website: 'aminamatola.dev',
      jobTitle: {
        pt: 'Product Designer e Estratega de Marca',
        en: 'Product Designer and Brand Strategist',
      },
    },
    summary: {
      pt: 'Profissional bilingue com experiencia em design digital, estrategia visual e colaboracao com equipas de produto para criar experiencias memoraveis e orientadas a resultados.',
      en: 'Bilingual professional combining digital design, visual strategy, and product collaboration to craft memorable experiences and measurable business outcomes.',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'MozTech Studio',
        position: {
          pt: 'Senior Product Designer',
          en: 'Senior Product Designer',
        },
        period: '2023 - Presente',
        description: {
          pt: 'Redesenhei jornadas criticas da plataforma, aumentei a ativacao e alinhei design systems entre produto, marketing e engenharia.',
          en: 'Redesigned core journeys, increased activation, and aligned design systems across product, marketing, and engineering.',
        },
      },
      {
        id: 'exp-2',
        company: 'BlueWave Agency',
        position: {
          pt: 'Brand and UX Lead',
          en: 'Brand and UX Lead',
        },
        period: '2020 - 2023',
        description: {
          pt: 'Liderei identidades digitais para fintech, e-commerce e educacao com foco em clareza, consistencia e conversao.',
          en: 'Led digital identities for fintech, ecommerce, and education with a focus on clarity, consistency, and conversion.',
        },
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Universidade Eduardo Mondlane',
        degree: {
          pt: 'Licenciatura em Design e Multimedia',
          en: 'Bachelor in Design and Multimedia',
        },
        year: '2019',
      },
    ],
    skills: [
      { pt: 'UI Design', en: 'UI Design' },
      { pt: 'Design Systems', en: 'Design Systems' },
      { pt: 'Research', en: 'Research' },
      { pt: 'Figma', en: 'Figma' },
      { pt: 'Brand Strategy', en: 'Brand Strategy' },
      { pt: 'Prototipagem', en: 'Prototyping' },
    ],
    languages: [
      { name: 'Portugues', level: { pt: 'Nativo', en: 'Native' } },
      { name: 'English', level: { pt: 'Fluente', en: 'Fluent' } },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'FinFlow Mobile',
        link: 'finflow.app',
        description: {
          pt: 'Sistema mobile-first para onboarding financeiro com novo fluxo visual e copy de alta conversao.',
          en: 'Mobile-first financial onboarding system with a new visual flow and high-converting copy.',
        },
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Google UX Design',
        issuer: 'Google',
        year: '2022',
      },
    ],
    settings: {
      template: template.id,
      accentColor: template.accentColor,
      fontFamily: 'Inter',
      fontSize: 14,
      lineHeight: 1.5,
      sectionSpacing: 25,
    },
  };
};

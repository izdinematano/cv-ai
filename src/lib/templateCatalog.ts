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

const createAvatarDataUri = (name: string, accentColor: string) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="320" height="320" rx="36" fill="url(#grad)" />
    <circle cx="160" cy="122" r="58" fill="rgba(255,255,255,0.18)" />
    <path d="M68 275c20-55 63-83 92-83s72 28 92 83" fill="rgba(255,255,255,0.18)" />
    <text x="160" y="174" font-family="Arial, sans-serif" font-size="72" font-weight="700" text-anchor="middle" fill="#ffffff">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

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
    description: 'Cabecalho forte, foto opcional e uma presenca premium para funcoes seniores.',
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
  {
    id: 'studio',
    name: 'Studio Flow',
    badge: 'Canva Style',
    category: 'Creative Pro',
    tone: 'Colorido e polido',
    description: 'Blocos elegantes, foto, destaques e um look que lembra construtores premium modernos.',
    accentColor: '#14b8a6',
    featured: true,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    badge: 'Balanced',
    category: 'Consulting',
    tone: 'Estruturado e forte',
    description: 'Grade bem organizada para perfis analiticos, consultivos, finance e operations.',
    accentColor: '#0f766e',
    featured: true,
  },
  {
    id: 'bold',
    name: 'Bold Frame',
    badge: 'Impact',
    category: 'Modern Pro',
    tone: 'Forte e memoravel',
    description: 'Tipografia grande, shapes e destaque visual para perfis com ambicao e presenca.',
    accentColor: '#dc2626',
    featured: true,
  },
  {
    id: 'resume1',
    name: 'Resume 1',
    badge: 'Locofy',
    category: 'Editorial',
    tone: 'Coluna lateral e serifa moderna',
    description: 'Layout editorial com coluna lateral em cinza, foto redonda e tipografia espacada.',
    accentColor: '#d57215',
    featured: true,
  },
  {
    id: 'resume2',
    name: 'Resume 2',
    badge: 'Editorial',
    category: 'Editorial',
    tone: 'Spread elegante a duas colunas',
    description: 'Layout em revista com foto grande, divisor central e tipografia fina. Para perfis sénior e criativos.',
    accentColor: '#000000',
    featured: true,
  },
  {
    id: 'resume3',
    name: 'Resume 3',
    badge: 'Personal',
    category: 'Editorial',
    tone: 'Letra decorativa de fundo',
    description: 'Layout com inicial gigante de fundo, foto pequena, e sidebar com Skills barradas e Links.',
    accentColor: '#111827',
    featured: true,
  },
  {
    id: 'cv5',
    name: 'Onyx',
    badge: 'Bold',
    category: 'Modern Pro',
    tone: 'Header preto e foto circular',
    description: 'Cabeçalho preto com foto circular, sidebar de Skills/Education/Languages e foco em Experiência.',
    accentColor: '#1d4ed8',
    featured: true,
  },
  {
    id: 'cv6-dark',
    name: 'Manhattan Dark',
    badge: 'Designer',
    category: 'Creative Pro',
    tone: 'Tema escuro editorial',
    description: 'Inspiração editorial em tema escuro, foto retangular e tipografia em itálico para destaque.',
    accentColor: '#f59e0b',
    featured: true,
  },
  {
    id: 'cv6-light',
    name: 'Manhattan Light',
    badge: 'Designer',
    category: 'Creative Pro',
    tone: 'Tema claro editorial',
    description: 'Variante clara do Manhattan: bege suave, tipografia editorial e foto retangular.',
    accentColor: '#a16207',
    featured: true,
  },
  {
    id: 'cv7',
    name: 'Timeline',
    badge: 'Pro',
    category: 'Editorial',
    tone: 'Linha do tempo elegante',
    description: 'Sidebar com foto grande e detalhes; coluna principal com linha do tempo de Experiência e Educação.',
    accentColor: '#000000',
    featured: true,
  },
];

export const featuredTemplateIds = templateCatalog
  .filter((template) => template.featured)
  .map((template) => template.id);

export const getTemplateDefinition = (templateId: string) =>
  templateCatalog.find((template) => template.id === templateId) || templateCatalog[0];

const showcaseProfiles: Record<
  string,
  { name: string; jobTitlePt: string; jobTitleEn: string; summaryPt: string; summaryEn: string }
> = {
  tech: {
    name: 'Nelio Cumbe',
    jobTitlePt: 'Engenheiro de Software Full Stack',
    jobTitleEn: 'Full Stack Software Engineer',
    summaryPt: 'Cria plataformas digitais, produtos SaaS e experiencias tecnicas escalaveis com foco em clareza, performance e negocio.',
    summaryEn: 'Builds scalable digital platforms, SaaS products, and technical experiences with a focus on clarity, performance, and business impact.',
  },
  creative: {
    name: 'Amina Matola',
    jobTitlePt: 'Brand Designer e Directora Criativa',
    jobTitleEn: 'Brand Designer and Creative Director',
    summaryPt: 'Profissional bilingue com experiencia em design, conteudo e estrategia visual para marcas que querem uma presenca forte e moderna.',
    summaryEn: 'Bilingual professional with experience in design, content, and visual strategy for brands that want a strong modern presence.',
  },
  'creative-v2': {
    name: 'Amina Matola',
    jobTitlePt: 'Brand Designer e Directora Criativa',
    jobTitleEn: 'Brand Designer and Creative Director',
    summaryPt: 'Profissional bilingue com experiencia em design, conteudo e estrategia visual para marcas que querem uma presenca forte e moderna.',
    summaryEn: 'Bilingual professional with experience in design, content, and visual strategy for brands that want a strong modern presence.',
  },
  executive: {
    name: 'Paulo Cossa',
    jobTitlePt: 'Director de Operacoes',
    jobTitleEn: 'Operations Director',
    summaryPt: 'Lider com historico em crescimento operacional, governance, equipas multidisciplinares e entrega de resultados consistentes.',
    summaryEn: 'Leader with a track record in operational growth, governance, multidisciplinary teams, and consistent execution.',
  },
  'executive-v2': {
    name: 'Paulo Cossa',
    jobTitlePt: 'Director de Operacoes',
    jobTitleEn: 'Operations Director',
    summaryPt: 'Lider com historico em crescimento operacional, governance, equipas multidisciplinares e entrega de resultados consistentes.',
    summaryEn: 'Leader with a track record in operational growth, governance, multidisciplinary teams, and consistent execution.',
  },
  student: {
    name: 'Celma Jossias',
    jobTitlePt: 'Estudante de Engenharia Informatica',
    jobTitleEn: 'Computer Engineering Student',
    summaryPt: 'Perfil junior com base academica forte, curiosidade tecnica, portfolio em crescimento e vontade de aprender rapido.',
    summaryEn: 'Junior profile with a strong academic base, technical curiosity, a growing portfolio, and a high learning pace.',
  },
  studio: {
    name: 'Marta Sitoe',
    jobTitlePt: 'Marketing Strategist e Copy Lead',
    jobTitleEn: 'Marketing Strategist and Copy Lead',
    summaryPt: 'Une posicionamento, conteudo e design para criar campanhas memoraveis e experiencias de marca coerentes.',
    summaryEn: 'Combines positioning, content, and design to craft memorable campaigns and cohesive brand experiences.',
  },
  atlas: {
    name: 'Ibraimo Issufo',
    jobTitlePt: 'Business Analyst',
    jobTitleEn: 'Business Analyst',
    summaryPt: 'Transforma dados, processos e prioridades estrategicas em planos concretos, dashboards e operacoes mais eficientes.',
    summaryEn: 'Turns data, processes, and strategic priorities into clear plans, dashboards, and more efficient operations.',
  },
  bold: {
    name: 'Sara Machava',
    jobTitlePt: 'Growth Product Manager',
    jobTitleEn: 'Growth Product Manager',
    summaryPt: 'Conecta produto, growth e comunicacao com foco em aquisicao, ativacao e resultados mensuraveis.',
    summaryEn: 'Connects product, growth, and communication with a focus on acquisition, activation, and measurable outcomes.',
  },
};

export const createShowcaseCVData = (templateId: string): CVData => {
  const template = getTemplateDefinition(templateId);
  const profile =
    showcaseProfiles[templateId] ||
    showcaseProfiles[template.category.toLowerCase()] ||
    showcaseProfiles.creative;

  const photo = createAvatarDataUri(profile.name, template.accentColor);

  return {
    personalInfo: {
      fullName: profile.name,
      email: 'hello@cvgen.pro',
      phone: '+258 84 321 7788',
      location: 'Maputo, Mozambique',
      linkedin: 'linkedin.com/in/showcase-profile',
      website: 'portfolio.cvgen.pro',
      photo,
      jobTitle: {
        pt: profile.jobTitlePt,
        en: profile.jobTitleEn,
      },
    },
    summary: {
      pt: profile.summaryPt,
      en: profile.summaryEn,
    },
    experience: [
      {
        id: 'exp-1',
        company: 'MozTech Studio',
        position: {
          pt: 'Senior Strategist',
          en: 'Senior Strategist',
        },
        period: '2023 - Presente',
        description: {
          pt: 'Lidera iniciativas de alto impacto, melhora a experiencia do cliente e alinha estrategia, design e execucao.',
          en: 'Leads high-impact initiatives, improves customer experience, and aligns strategy, design, and execution.',
        },
      },
      {
        id: 'exp-2',
        company: 'BlueWave Agency',
        position: {
          pt: 'Lead Specialist',
          en: 'Lead Specialist',
        },
        period: '2020 - 2023',
        description: {
          pt: 'Conduziu projetos multidisciplinares, definiu processos e elevou a qualidade das entregas para clientes regionais.',
          en: 'Drove multidisciplinary projects, defined processes, and raised delivery quality for regional clients.',
        },
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Universidade Eduardo Mondlane',
        degree: {
          pt: 'Licenciatura em Gestao, Design e Tecnologia',
          en: 'Bachelor in Management, Design, and Technology',
        },
        year: '2019',
      },
    ],
    skills: [
      { pt: 'Estrategia', en: 'Strategy' },
      { pt: 'Comunicacao', en: 'Communication' },
      { pt: 'Analise', en: 'Analysis' },
      { pt: 'Leadership', en: 'Leadership' },
      { pt: 'Figma', en: 'Figma' },
      { pt: 'Research', en: 'Research' },
    ],
    languages: [
      { name: 'Portugues', level: { pt: 'Nativo', en: 'Native' } },
      { name: 'English', level: { pt: 'Fluente', en: 'Fluent' } },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Growth OS',
        link: 'growthos.app',
        description: {
          pt: 'Framework de crescimento com dashboards, copy orientada a conversao e experiencia digital consistente.',
          en: 'Growth framework with dashboards, conversion-led copy, and a consistent digital experience.',
        },
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Professional Certificate',
        issuer: 'Google',
        year: '2022',
      },
    ],
    references: [],
    customSections: [],
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

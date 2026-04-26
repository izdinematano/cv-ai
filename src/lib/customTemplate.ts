/**
 * Custom template schema used by the Admin Template Builder.
 *
 * A custom template is a JSON document describing a set of absolutely
 * positioned blocks inside an A4 canvas (794x1123px at 96dpi). A single
 * renderer (`<CustomTemplate />`) binds each block type to the current CV
 * data at render time, so one JSON produces a full CV for any user.
 */

/** A4 dimensions at 96dpi, used both in the canvas and the PDF export. */
export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;
export const GRID = 8;

export type CustomBlockType =
  | 'header'
  | 'photo'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'references'
  | 'text'
  | 'divider'
  | 'shape'
  | 'icon'
  | 'contact-bar'
  | 'rating'
  | 'image';

export interface CustomTemplateBlock {
  id: string;
  type: CustomBlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Stacking order inside the page. Higher = on top. */
  z?: number;
  props?: {
    title?: string;
    content?: string;
    align?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    bg?: string;
    border?: string;
    radius?: number;
    padding?: number;
    showTitle?: boolean;
    columns?: 1 | 2;
    shape?: 'rect' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'wave' | 'sidebar-strip' | 'dots-pattern';
    uppercase?: boolean;
    lineHeight?: number;
    opacity?: number;
    gradient?: string;
    borderWidth?: number;
    borderColor?: string;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    /** Icon block */
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
    /** Rating block */
    ratingMax?: number;
    ratingValue?: number;
    /** Image block */
    imageUrl?: string;
    imageFit?: 'cover' | 'contain' | 'fill';
    /** Contact bar layout */
    layout?: 'row' | 'column';
    showIcons?: boolean;
  };
}

export interface CustomTemplateSpec {
  /** Always prefixed with `custom-` so the renderer can route correctly. */
  id: string;
  name: string;
  badge: string;
  description: string;
  accentColor: string;
  fontFamily: string;
  bgColor: string;
  textColor: string;
  mutedColor: string;
  blocks: CustomTemplateBlock[];
  createdAt: string;
  updatedAt: string;
  /** Number of A4 pages. Defaults to 1. Blocks can be placed anywhere inside
   *  [0, pages * A4_HEIGHT]; the PDF exporter already breaks on A4 bounds. */
  pages?: number;
  /** Drafts are only visible in the admin panel. Published templates appear
   *  in the global gallery for every user. */
  published: boolean;
}

const createId = () => Math.random().toString(36).slice(2, 11);
const nowIso = () => new Date().toISOString();

export const DEFAULT_FONTS = [
  'Inter',
  'Outfit',
  'Georgia',
  'Times New Roman',
  'Helvetica',
  'Arial',
] as const;

export const BLOCK_LIBRARY: Array<{
  type: CustomBlockType;
  label: string;
  description: string;
  defaultSize: { w: number; h: number };
}> = [
  { type: 'header', label: 'Cabeçalho', description: 'Nome + cargo (grande)', defaultSize: { w: 600, h: 100 } },
  { type: 'photo', label: 'Foto', description: 'Foto de perfil', defaultSize: { w: 120, h: 120 } },
  { type: 'summary', label: 'Resumo', description: 'Perfil profissional', defaultSize: { w: 600, h: 120 } },
  { type: 'experience', label: 'Experiência', description: 'Lista de experiência', defaultSize: { w: 500, h: 280 } },
  { type: 'education', label: 'Educação', description: 'Lista de educação', defaultSize: { w: 500, h: 180 } },
  { type: 'skills', label: 'Skills', description: 'Chips de competências', defaultSize: { w: 240, h: 180 } },
  { type: 'languages', label: 'Idiomas', description: 'Lista de idiomas', defaultSize: { w: 240, h: 140 } },
  { type: 'projects', label: 'Projetos', description: 'Lista de projetos', defaultSize: { w: 500, h: 180 } },
  { type: 'certifications', label: 'Certificações', description: 'Lista de certificações', defaultSize: { w: 500, h: 140 } },
  { type: 'references', label: 'Referências', description: 'Lista de referências', defaultSize: { w: 500, h: 140 } },
  { type: 'text', label: 'Texto livre', description: 'Bloco de texto editável', defaultSize: { w: 400, h: 60 } },
  { type: 'divider', label: 'Linha', description: 'Linha divisora horizontal', defaultSize: { w: 600, h: 2 } },
  { type: 'shape', label: 'Forma', description: 'Rect/círculo/triângulo/onda decorativa', defaultSize: { w: 200, h: 80 } },
  { type: 'icon', label: 'Ícone', description: 'Ícone decorativo SVG', defaultSize: { w: 40, h: 40 } },
  { type: 'contact-bar', label: 'Contactos', description: 'Email, telefone, morada com ícones', defaultSize: { w: 600, h: 36 } },
  { type: 'rating', label: 'Avaliação', description: 'Barra ou estrelas de nível', defaultSize: { w: 200, h: 24 } },
  { type: 'image', label: 'Imagem', description: 'Imagem decorativa ou logo', defaultSize: { w: 160, h: 80 } },
];

export const blockLabel = (type: CustomBlockType) =>
  BLOCK_LIBRARY.find((b) => b.type === type)?.label ?? type;

export const createBlock = (
  type: CustomBlockType,
  overrides: Partial<CustomTemplateBlock> = {}
): CustomTemplateBlock => {
  const def = BLOCK_LIBRARY.find((b) => b.type === type)!;
  const defaultProps: Record<string, CustomTemplateBlock['props']> = {
    text: { content: 'Texto livre…', fontSize: 13, color: '#0f172a' },
    shape: { bg: '#eef2ff', shape: 'rect', radius: 12, opacity: 1 },
    divider: { bg: '#e5e7eb' },
    icon: { iconName: 'star', iconSize: 28, iconColor: '#4f46e5' },
    'contact-bar': { showIcons: true, layout: 'row', fontSize: 11, color: '#475569' },
    rating: { ratingMax: 5, ratingValue: 4, color: '#4f46e5', bg: '#e2e8f0' },
    image: { imageUrl: '', imageFit: 'cover', radius: 0, opacity: 1 },
  };
  return {
    id: createId(),
    type,
    x: 48,
    y: 48,
    w: def.defaultSize.w,
    h: def.defaultSize.h,
    props: defaultProps[type] ?? { showTitle: true },
    ...overrides,
  };
};

/**
 * A sensible starting layout used when an admin creates a new blank template.
 * Gives the user something to edit rather than an empty canvas.
 */
export const createDefaultTemplate = (name = 'Novo template'): CustomTemplateSpec => {
  const now = nowIso();
  return {
    id: `custom-${createId()}`,
    name,
    badge: 'Custom',
    description: 'Template criado no builder.',
    accentColor: '#4f46e5',
    fontFamily: 'Inter',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#475569',
    published: false,
    pages: 1,
    createdAt: now,
    updatedAt: now,
    blocks: [
      { id: createId(), type: 'shape', x: 0, y: 0, w: A4_WIDTH, h: 140, z: 0, props: { bg: '#eef2ff', shape: 'rect', radius: 0 } },
      { id: createId(), type: 'photo', x: 48, y: 30, w: 80, h: 80, z: 2 },
      { id: createId(), type: 'header', x: 150, y: 40, w: A4_WIDTH - 200, h: 70, z: 2, props: { showTitle: true, color: '#0f172a' } },
      { id: createId(), type: 'summary', x: 48, y: 170, w: A4_WIDTH - 96, h: 80, z: 1, props: { showTitle: true, title: 'Perfil' } },
      { id: createId(), type: 'experience', x: 48, y: 270, w: 450, h: 400, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 48, y: 690, w: 450, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'skills', x: 520, y: 270, w: 226, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'languages', x: 520, y: 490, w: 226, h: 180, z: 1, props: { showTitle: true } },
    ],
  };
};

/* -------------------------------------------------------------------------- */
/* Built-in presets                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Curated starting layouts that visually approximate the built-in React
 * templates. Since those are hard-coded components, we can't edit them
 * directly — but we can give the admin a faithful starting point that is then
 * freely editable. The key is the built-in `id` from `@/lib/templateCatalog`.
 *
 * When a preset is missing we fall back to `createDefaultTemplate`.
 */
const presetBuilders: Record<
  string,
  (name: string, accent: string) => Omit<CustomTemplateSpec, 'id' | 'createdAt' | 'updatedAt'>
> = {
  minimalist: (name, accent) => ({
    name,
    badge: 'Custom · Minimalista',
    description: 'Layout limpo com cabeçalho centrado e colunas equilibradas.',
    accentColor: accent,
    fontFamily: 'Inter',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#475569',
    published: false,
    pages: 1,
    blocks: [
      { id: createId(), type: 'header', x: 48, y: 48, w: A4_WIDTH - 96, h: 90, z: 1, props: { showTitle: true, align: 'center', fontSize: 32 } },
      { id: createId(), type: 'divider', x: 48, y: 150, w: A4_WIDTH - 96, h: 1, z: 1, props: { bg: '#e5e7eb' } },
      { id: createId(), type: 'summary', x: 48, y: 170, w: A4_WIDTH - 96, h: 90, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'experience', x: 48, y: 280, w: A4_WIDTH - 96, h: 360, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 48, y: 660, w: (A4_WIDTH - 120) / 2, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'skills', x: 48 + (A4_WIDTH - 120) / 2 + 24, y: 660, w: (A4_WIDTH - 120) / 2, h: 200, z: 1, props: { showTitle: true } },
    ],
  }),
  corporate: (name, accent) => ({
    name,
    badge: 'Custom · Corporate',
    description: 'Cabeçalho institucional com barra de acento e coluna lateral.',
    accentColor: accent,
    fontFamily: 'Inter',
    bgColor: '#ffffff',
    textColor: '#0b1020',
    mutedColor: '#475569',
    published: false,
    pages: 1,
    blocks: [
      { id: createId(), type: 'shape', x: 0, y: 0, w: A4_WIDTH, h: 8, z: 0, props: { bg: accent, radius: 0 } },
      { id: createId(), type: 'header', x: 48, y: 40, w: A4_WIDTH - 96, h: 90, z: 2, props: { showTitle: true, fontSize: 26 } },
      { id: createId(), type: 'divider', x: 48, y: 150, w: A4_WIDTH - 96, h: 1, z: 1, props: { bg: '#e5e7eb' } },
      { id: createId(), type: 'summary', x: 48, y: 170, w: A4_WIDTH - 96, h: 90, z: 1, props: { showTitle: true, title: 'Perfil Profissional' } },
      { id: createId(), type: 'experience', x: 48, y: 280, w: 460, h: 400, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 48, y: 700, w: 460, h: 180, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'skills', x: 528, y: 280, w: 218, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'languages', x: 528, y: 500, w: 218, h: 160, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'certifications', x: 528, y: 680, w: 218, h: 200, z: 1, props: { showTitle: true } },
    ],
  }),
  tech: (name, accent) => ({
    name,
    badge: 'Custom · Tech',
    description: 'Sidebar com foto e skills, coluna principal para experiência.',
    accentColor: accent,
    fontFamily: 'Inter',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#475569',
    published: false,
    pages: 1,
    blocks: [
      { id: createId(), type: 'shape', x: 0, y: 0, w: 260, h: A4_HEIGHT, z: 0, props: { bg: '#f1f5f9', radius: 0 } },
      { id: createId(), type: 'photo', x: 70, y: 40, w: 120, h: 120, z: 2 },
      { id: createId(), type: 'skills', x: 32, y: 180, w: 196, h: 220, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'languages', x: 32, y: 420, w: 196, h: 160, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 32, y: 600, w: 196, h: 220, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'header', x: 288, y: 48, w: A4_WIDTH - 336, h: 90, z: 1, props: { showTitle: true, fontSize: 28 } },
      { id: createId(), type: 'summary', x: 288, y: 160, w: A4_WIDTH - 336, h: 90, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'experience', x: 288, y: 270, w: A4_WIDTH - 336, h: 400, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'projects', x: 288, y: 690, w: A4_WIDTH - 336, h: 200, z: 1, props: { showTitle: true } },
    ],
  }),
  creative: (name, accent) => ({
    name,
    badge: 'Custom · Creative',
    description: 'Cabeçalho colorido com shape decorativo e grelha editorial.',
    accentColor: accent,
    fontFamily: 'Outfit',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#64748b',
    published: false,
    pages: 1,
    blocks: [
      { id: createId(), type: 'shape', x: 0, y: 0, w: A4_WIDTH, h: 160, z: 0, props: { bg: accent, radius: 0 } },
      { id: createId(), type: 'shape', x: A4_WIDTH - 180, y: 96, w: 160, h: 160, z: 1, props: { bg: '#ffffff', shape: 'circle' } },
      { id: createId(), type: 'photo', x: A4_WIDTH - 170, y: 106, w: 140, h: 140, z: 3 },
      { id: createId(), type: 'header', x: 48, y: 48, w: 480, h: 90, z: 2, props: { showTitle: true, color: '#ffffff', fontSize: 32 } },
      { id: createId(), type: 'summary', x: 48, y: 200, w: A4_WIDTH - 96, h: 100, z: 1, props: { showTitle: true, title: 'Sobre mim' } },
      { id: createId(), type: 'experience', x: 48, y: 320, w: 460, h: 360, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'projects', x: 48, y: 700, w: 460, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'skills', x: 528, y: 320, w: 218, h: 220, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'languages', x: 528, y: 560, w: 218, h: 140, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 528, y: 720, w: 218, h: 180, z: 1, props: { showTitle: true } },
    ],
  }),
  executive: (name, accent) => ({
    name,
    badge: 'Custom · Executive',
    description: 'Autoridade e sobriedade. Tipografia em maiúsculas e acento discreto.',
    accentColor: accent,
    fontFamily: 'Georgia',
    bgColor: '#ffffff',
    textColor: '#0b1020',
    mutedColor: '#475569',
    published: false,
    pages: 1,
    blocks: [
      { id: createId(), type: 'header', x: 48, y: 56, w: A4_WIDTH - 96, h: 90, z: 1, props: { showTitle: true, align: 'center', fontSize: 30 } },
      { id: createId(), type: 'divider', x: 200, y: 160, w: A4_WIDTH - 400, h: 2, z: 1, props: { bg: accent } },
      { id: createId(), type: 'summary', x: 48, y: 190, w: A4_WIDTH - 96, h: 100, z: 1, props: { showTitle: true, align: 'center' } },
      { id: createId(), type: 'experience', x: 48, y: 310, w: A4_WIDTH - 96, h: 400, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 48, y: 730, w: (A4_WIDTH - 120) / 2, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'certifications', x: 48 + (A4_WIDTH - 120) / 2 + 24, y: 730, w: (A4_WIDTH - 120) / 2, h: 200, z: 1, props: { showTitle: true } },
    ],
  }),
  modern: (name, accent) => ({
    name,
    badge: 'Custom · Modern',
    description: 'Duas colunas arejadas com cabeçalho próprio.',
    accentColor: accent,
    fontFamily: 'Inter',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    mutedColor: '#475569',
    published: false,
    pages: 1,
    blocks: [
      { id: createId(), type: 'shape', x: 0, y: 0, w: A4_WIDTH, h: 140, z: 0, props: { bg: '#eef2ff', radius: 0 } },
      { id: createId(), type: 'photo', x: 48, y: 32, w: 96, h: 96, z: 2 },
      { id: createId(), type: 'header', x: 168, y: 48, w: A4_WIDTH - 220, h: 70, z: 2, props: { showTitle: true, fontSize: 28 } },
      { id: createId(), type: 'summary', x: 48, y: 170, w: A4_WIDTH - 96, h: 90, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'experience', x: 48, y: 280, w: 460, h: 400, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'education', x: 528, y: 280, w: 218, h: 200, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'skills', x: 528, y: 500, w: 218, h: 180, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'languages', x: 48, y: 700, w: 218, h: 180, z: 1, props: { showTitle: true } },
      { id: createId(), type: 'projects', x: 290, y: 700, w: A4_WIDTH - 338, h: 180, z: 1, props: { showTitle: true } },
    ],
  }),
};

export const createTemplateFromBuiltIn = (
  builtInId: string,
  builtInName: string,
  accentColor: string
): CustomTemplateSpec => {
  const now = nowIso();
  const name = `${builtInName} (cópia editável)`;
  const builder = presetBuilders[builtInId];
  if (builder) {
    return {
      ...builder(name, accentColor),
      id: `custom-${createId()}`,
      createdAt: now,
      updatedAt: now,
    };
  }
  // Map similar templates to the closest curated preset, then override name/accent.
  const closestKey = ['minimalist-v2', 'corporate-v2'].includes(builtInId)
    ? builtInId.replace('-v2', '')
    : ['creative-v2'].includes(builtInId)
      ? 'creative'
      : ['executive-v2', 'cv5', 'cv7'].includes(builtInId)
        ? 'executive'
        : ['atlas', 'student', 'bold', 'studio', 'modern'].includes(builtInId)
          ? 'modern'
          : 'minimalist';
  const base = presetBuilders[closestKey](name, accentColor);
  return {
    ...base,
    id: `custom-${createId()}`,
    createdAt: now,
    updatedAt: now,
    badge: 'Custom · Baseado em existente',
  };
};

/** Expose a custom template as if it were a catalog entry so the gallery and
 *  picker can show it next to the built-in templates. */
export const toCatalogDefinition = (spec: CustomTemplateSpec) => ({
  id: spec.id,
  name: spec.name,
  badge: spec.badge || 'Custom',
  category: 'Custom',
  tone: 'Criado pelo admin',
  description: spec.description || 'Template personalizado.',
  accentColor: spec.accentColor,
  featured: false,
  hidden: !spec.published,
});

export const snapToGrid = (value: number, grid = GRID) =>
  Math.max(0, Math.round(value / grid) * grid);

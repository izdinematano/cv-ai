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
  | 'shape';

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
    shape?: 'rect' | 'circle';
    uppercase?: boolean;
    lineHeight?: number;
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
  { type: 'shape', label: 'Forma', description: 'Rectângulo/círculo decorativo', defaultSize: { w: 200, h: 80 } },
];

export const blockLabel = (type: CustomBlockType) =>
  BLOCK_LIBRARY.find((b) => b.type === type)?.label ?? type;

export const createBlock = (
  type: CustomBlockType,
  overrides: Partial<CustomTemplateBlock> = {}
): CustomTemplateBlock => {
  const def = BLOCK_LIBRARY.find((b) => b.type === type)!;
  return {
    id: createId(),
    type,
    x: 48,
    y: 48,
    w: def.defaultSize.w,
    h: def.defaultSize.h,
    props:
      type === 'text'
        ? { content: 'Texto livre…', fontSize: 13, color: '#0f172a' }
        : type === 'shape'
          ? { bg: '#eef2ff', shape: 'rect', radius: 12 }
          : type === 'divider'
            ? { bg: '#e5e7eb' }
            : { showTitle: true },
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

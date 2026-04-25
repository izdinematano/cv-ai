'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Award,
  Briefcase,
  Camera,
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Import,
  Languages,
  LayoutTemplate,
  Link as LinkIcon,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  User,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';

const reorderBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 10,
  minWidth: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};
import {
  ACCEPTED_FILE_TYPES,
  extractTextFromDocument,
} from '@/lib/documentExtractor';
import { compressImage } from '@/lib/imageUtils';
import {
  LANGUAGE_PROFICIENCY_LABELS,
  type LanguageProficiency,
  isLoadingLevel,
} from '@/store/useCVStore';
import TemplateGallery from '@/components/Preview/TemplateGallery';
import {
  extractCVDataFromRawCV,
  improveCVField,
  recommendTemplateWithAI,
} from '@/lib/openrouter';
import { getTemplateRecommendation } from '@/lib/recommendations';
import { getTemplateDefinition } from '@/lib/templateCatalog';
import { useCVStore } from '@/store/useCVStore';
import BulletEditor from './BulletEditor';
import WritingHints from './WritingHints';
import AtsPanel from './AtsPanel';
import AiStatusBanner from './AiStatusBanner';
import { analyzeParagraph } from '@/lib/writingQuality';

function SectionHeader({
  id,
  icon: Icon,
  title,
  count,
  isOpen,
  onToggle,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  count?: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={isOpen}
      aria-controls={`section-panel-${id}`}
      id={`section-header-${id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '16px 20px',
        cursor: 'pointer',
        background: 'var(--background-muted)',
        borderBottom: '1px solid var(--card-border)',
        border: 'none',
        textAlign: 'left',
        color: 'var(--foreground)',
        font: 'inherit',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon size={18} color="var(--accent)" aria-hidden="true" />
        <span style={{ fontWeight: 700, fontSize: '15px' }}>{title}</span>
        {count !== undefined && (
          <span
            aria-label={`${count} ${count === 1 ? 'entrada' : 'entradas'}`}
            style={{
              fontSize: '11px',
              background: 'var(--accent)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            {count}
          </span>
        )}
      </span>
      {isOpen ? (
        <ChevronUp size={18} aria-hidden="true" />
      ) : (
        <ChevronDown size={18} aria-hidden="true" />
      )}
    </button>
  );
}

export default function Editor() {
  const {
    data,
    activeLanguage,
    updatePersonalInfo,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    moveExperience,
    addEducation,
    updateEducation,
    removeEducation,
    moveEducation,
    addProject,
    updateProject,
    removeProject,
    moveProject,
    addCertification,
    updateCertification,
    removeCertification,
    addReference,
    updateReference,
    removeReference,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    addCustomSectionItem,
    updateCustomSectionItem,
    removeCustomSectionItem,
    addSkill,
    removeSkill,
    addLanguage,
    updateLanguage,
    removeLanguage,
    isConverting,
    setConverting,
    setTemplate,
    setData,
    setAccentColor,
    updateSettings,
  } = useCVStore();

  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [openSections, setOpenSections] = useState<string[]>(() => {
    // On mobile, only open the first section to avoid a very long scroll on
    // first render. Desktop keeps the common sections expanded.
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
      return ['personal'];
    }
    return ['import', 'personal', 'summary', 'experience'];
  });
  const [rawCVInput, setRawCVInput] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setConverting(true);
    setImportStatus(`A ler ${file.name}...`);
    try {
      const result = await extractTextFromDocument(file);
      if (!result.text) {
        setImportStatus(
          `Nao foi possivel ler ${file.name}. Tenta um PDF, DOCX ou cola o texto manualmente.`
        );
        return;
      }
      setRawCVInput(result.text);
      setImportFileName(file.name);
      setImportStatus(`${file.name} carregado. Clica em "Importar com IA" para organizar o conteudo.`);
    } finally {
      setConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSection = (id: string) => {
    setOpenSections((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const calculateScore = () => {
    let score = 0;
    const p = data.personalInfo;
    if (p.photo) score += 8;
    if (p.fullName) score += 8;
    if (p.jobTitle[activeLanguage]) score += 6;
    if (p.email) score += 5;
    if (p.phone) score += 4;
    if (p.location) score += 3;
    if (p.linkedin || p.website) score += 4;
    if (data.summary[activeLanguage] && data.summary[activeLanguage].length > 50) score += 14;
    if (data.experience.length >= 1) score += 18;
    if (data.experience.length >= 2) score += 5;
    if (data.experience.some((item) => item.description[activeLanguage])) score += 5;
    if (data.education.length >= 1) score += 10;
    if (data.skills.length >= 3) score += 8;
    if (data.skills.length >= 6) score += 4;
    if (data.languages.length >= 1) score += 4;
    if (data.projects.length >= 1) score += 4;
    if (data.certifications.length >= 1) score += 4;
    return Math.min(score, 100);
  };

  const score = calculateScore();
  const scoreColor = score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#10b981';
  const selectedTemplate = getTemplateDefinition(data.settings.template);

  const handleImportCV = async () => {
    if (!rawCVInput.trim()) return;

    setConverting(true);
    setImportStatus('A analisar o CV e a estruturar os dados...');

    try {
      const importedData = await extractCVDataFromRawCV(rawCVInput, activeLanguage);
      if (!importedData) {
        setImportStatus('Nao foi possivel interpretar o CV. Cola mais conteudo e tenta novamente.');
        return;
      }

      const mergedData = {
        ...data,
        ...importedData,
        personalInfo: {
          ...data.personalInfo,
          ...(importedData.personalInfo || {}),
          jobTitle: {
            ...data.personalInfo.jobTitle,
            ...(importedData.personalInfo?.jobTitle || {}),
          },
        },
        summary: {
          ...data.summary,
          ...(importedData.summary || {}),
        },
        settings: {
          ...data.settings,
        },
      } as typeof data;

      const suggestion = await recommendTemplateWithAI(rawCVInput, mergedData, activeLanguage);

      setData({
        ...mergedData,
        settings: {
          ...mergedData.settings,
          template: suggestion.template || mergedData.settings.template,
        },
      });

      if (suggestion.template) {
        setTemplate(suggestion.template);
      }

      setImportStatus(
        suggestion.reason
          ? `CV importado com sucesso. Modelo sugerido: ${suggestion.badge} - ${suggestion.reason}`
          : 'CV importado com sucesso.'
      );
    } finally {
      setConverting(false);
    }
  };

  /** Run AI polish on a single bullet and return the improved string so the
   *  BulletEditor can replace it in-place. Never throws; returns empty string
   *  on failure so the caller keeps the original. */
  const improveBullet = async (text: string): Promise<string> => {
    if (!text.trim()) return '';
    setConverting(true);
    try {
      const result = await improveCVField(text, activeLanguage);
      return typeof result === 'string' ? result : '';
    } catch {
      return '';
    } finally {
      setConverting(false);
    }
  };

  const handleAIImprove = async (
    value: string,
    section: 'summary' | 'experience' | 'project',
    id?: string
  ) => {
    if (!value) return;

    setConverting(true);

    try {
      const result = await improveCVField(value, activeLanguage);

      if (section === 'summary') {
        updateSummary({ [activeLanguage]: result });
        return;
      }

      if (section === 'experience' && id) {
        const current = data.experience.find((item) => item.id === id);
        if (!current) return;

        updateExperience(id, {
          description: { ...current.description, [activeLanguage]: result },
        });
      }

      if (section === 'project' && id) {
        const current = data.projects.find((item) => item.id === id);
        if (!current) return;

        updateProject(id, {
          description: { ...current.description, [activeLanguage]: result },
        });
      }
    } finally {
      setConverting(false);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--card-border)',
          background: 'var(--background)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setActiveTab('content')}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '13px',
            fontWeight: 800,
            color: activeTab === 'content' ? 'var(--accent)' : 'var(--muted-foreground)',
            borderBottom:
              activeTab === 'content' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'transparent',
          }}
        >
          CONTEUDO
        </button>
        <button
          onClick={() => setActiveTab('design')}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '13px',
            fontWeight: 800,
            color: activeTab === 'design' ? 'var(--accent)' : 'var(--muted-foreground)',
            borderBottom:
              activeTab === 'design' ? '2px solid var(--accent)' : '2px solid transparent',
            background: 'transparent',
          }}
        >
          DESIGN
        </button>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            background: 'var(--background-muted)',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--card-border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>Forca do Curriculo</span>
            <span style={{ fontSize: '13px', color: scoreColor, fontWeight: 800 }}>{score}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--card-border)', borderRadius: '6px' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              style={{
                height: '100%',
                background: scoreColor,
                borderRadius: '6px',
              }}
            />
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            background:
              'linear-gradient(135deg, var(--background-muted) 0%, var(--background) 100%)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--foreground-muted)', fontWeight: 800, marginBottom: '4px' }}>
              MODELO ATIVO
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '999px',
                  background: selectedTemplate.accentColor,
                  boxShadow: `0 0 14px ${selectedTemplate.accentColor}`,
                }}
              />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{selectedTemplate.name}</div>
                <div style={{ color: 'var(--foreground-muted)', fontSize: '12px' }}>{selectedTemplate.badge}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('design')}
            className="btn-outline"
            style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 700 }}
          >
            Trocar modelo
          </button>
        </div>

        {activeTab === 'content' ? (
          <>
            <AiStatusBanner />

            <AtsPanel data={data} lang={activeLanguage} />

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="import"
                icon={Import}
                title="Importar CV Existente"
                isOpen={openSections.includes('import')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('import') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div
                        style={{
                          background: 'var(--background-muted)',
                          border: '1px solid var(--card-border)',
                          borderRadius: '14px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                          Cola o texto do teu CV e deixa a IA organizar tudo.
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', lineHeight: 1.7 }}>
                          A app tenta extrair experiencias, educacao, skills, resumo e ainda sugerir o melhor modelo
                          para o teu perfil. Funciona melhor com texto copiado de PDF, Word ou LinkedIn.
                        </p>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_FILE_TYPES}
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        <button
                          className="btn-outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isConverting}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Upload size={14} /> Carregar PDF / DOCX / TXT
                        </button>
                        {importFileName && (
                          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
                            {importFileName}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Texto do CV (colar ou extraido do ficheiro)</label>
                        <textarea
                          rows={8}
                          value={rawCVInput}
                          onChange={(event) => setRawCVInput(event.target.value)}
                          placeholder="Cole aqui o conteudo completo do CV ou carrega um ficheiro acima."
                          style={{ resize: 'vertical', minHeight: '180px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary"
                          onClick={handleImportCV}
                          disabled={isConverting || !rawCVInput.trim()}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Sparkles size={16} /> Importar com IA
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => {
                            setRawCVInput('');
                            setImportFileName('');
                          }}
                          disabled={isConverting || (!rawCVInput && !importFileName)}
                        >
                          Limpar
                        </button>
                      </div>

                      {importStatus ? (
                        <div
                          style={{
                            background: 'var(--background-muted)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '12px',
                            lineHeight: 1.7,
                            color: 'var(--foreground-muted)',
                          }}
                        >
                          {importStatus}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="personal"
                icon={User}
                title="Dados Pessoais"
                isOpen={openSections.includes('personal')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('personal') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          background: 'var(--background-muted)',
                          padding: '15px',
                          borderRadius: '12px',
                          border: '1px dashed var(--card-border)',
                        }}
                      >
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'var(--muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '2px solid var(--accent)',
                            flexShrink: 0,
                          }}
                        >
                          {data.personalInfo.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={data.personalInfo.photo}
                              alt="Foto de perfil"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Camera size={30} color="var(--accent)" />
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <label
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              marginBottom: '8px',
                              display: 'block',
                            }}
                          >
                            Foto de Perfil
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              try {
                                // Compress before storing so the whole CV data
                                // fits comfortably inside localStorage's quota
                                // (~5MB per origin). Without this, a single
                                // 4MB camera photo can exceed the quota.
                                const compressed = await compressImage(file, {
                                  maxSide: 500,
                                  quality: 0.78,
                                });
                                updatePersonalInfo({ photo: compressed });
                              } catch (err) {
                                console.error('[photo upload] failed', err);
                                alert('Não foi possível processar a imagem.');
                              }
                            }}
                            style={{ fontSize: '11px' }}
                          />
                          {data.personalInfo.photo && (
                            <button
                              onClick={() => updatePersonalInfo({ photo: '' })}
                              style={{
                                marginTop: '8px',
                                color: 'var(--error)',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'transparent',
                              }}
                            >
                              <Trash2 size={12} /> Remover foto
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Nome Completo</label>
                          <input
                            value={data.personalInfo.fullName}
                            onChange={(event) =>
                              updatePersonalInfo({ fullName: event.target.value })
                            }
                            placeholder="Ex: Joao Mavie"
                          />
                        </div>

                        <div className="form-group">
                          <label>Titulo Profissional ({activeLanguage.toUpperCase()})</label>
                          <input
                            value={data.personalInfo.jobTitle[activeLanguage]}
                            onChange={(event) =>
                              updatePersonalInfo({
                                jobTitle: {
                                  ...data.personalInfo.jobTitle,
                                  [activeLanguage]: event.target.value,
                                },
                              })
                            }
                            placeholder="Ex: Software Engineer"
                          />
                        </div>

                        <div className="form-group">
                          <label>Email</label>
                          <input
                            value={data.personalInfo.email}
                            onChange={(event) =>
                              updatePersonalInfo({ email: event.target.value })
                            }
                            placeholder="Ex: joao@email.com"
                          />
                        </div>

                        <div className="form-group">
                          <label>Telefone</label>
                          <input
                            value={data.personalInfo.phone}
                            onChange={(event) =>
                              updatePersonalInfo({ phone: event.target.value })
                            }
                            placeholder="Ex: +258 84 000 0000"
                          />
                        </div>

                        <div className="form-group">
                          <label>Localizacao</label>
                          <input
                            value={data.personalInfo.location}
                            onChange={(event) =>
                              updatePersonalInfo({ location: event.target.value })
                            }
                            placeholder="Ex: Maputo, Mocambique"
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <h4
                            style={{
                              fontSize: '12px',
                              fontWeight: 800,
                              color: 'var(--muted-foreground)',
                              marginBottom: '15px',
                              textTransform: 'uppercase',
                            }}
                          >
                            Links e Redes
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                              <Globe
                                size={14}
                                style={{
                                  position: 'absolute',
                                  left: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: 'var(--accent)',
                                }}
                              />
                              <input
                                style={{ paddingLeft: '36px' }}
                                value={data.personalInfo.linkedin}
                                onChange={(event) =>
                                  updatePersonalInfo({ linkedin: event.target.value })
                                }
                                placeholder="linkedin.com/in/seu-perfil"
                              />
                            </div>

                            <div style={{ position: 'relative' }}>
                              <LinkIcon
                                size={14}
                                style={{
                                  position: 'absolute',
                                  left: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: 'var(--accent)',
                                }}
                              />
                              <input
                                style={{ paddingLeft: '36px' }}
                                value={data.personalInfo.website}
                                onChange={(event) =>
                                  updatePersonalInfo({ website: event.target.value })
                                }
                                placeholder="www.seu-portfolio.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="summary"
                icon={FileText}
                title="Perfil Profissional"
                isOpen={openSections.includes('summary')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('summary') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div className="form-group">
                        <label>Resumo ({activeLanguage.toUpperCase()})</label>
                        <textarea
                          rows={4}
                          value={data.summary[activeLanguage]}
                          onChange={(event) =>
                            updateSummary({ [activeLanguage]: event.target.value })
                          }
                          placeholder="Escreva um resumo profissional impactante..."
                          style={{ resize: 'vertical', minHeight: '100px' }}
                          spellCheck
                        />
                        <WritingHints
                          report={analyzeParagraph(data.summary[activeLanguage] || '', activeLanguage, { min: 40, max: 90 })}
                        />
                      </div>
                      <button
                        className="btn-outline"
                        style={{
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          alignSelf: 'flex-start',
                        }}
                        onClick={() =>
                          handleAIImprove(data.summary[activeLanguage], 'summary')
                        }
                        disabled={isConverting || !data.summary[activeLanguage]}
                      >
                        <Sparkles size={14} /> Melhorar com IA
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="experience"
                icon={Briefcase}
                title="Experiencia Profissional"
                count={data.experience.length}
                isOpen={openSections.includes('experience')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('experience') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      {data.experience.map((exp, expIdx) => (
                        <div
                          key={exp.id}
                          style={{
                            marginBottom: '18px',
                            padding: '16px',
                            background: 'var(--background-muted)',
                            borderRadius: '12px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => moveExperience(exp.id, -1)}
                              disabled={expIdx === 0}
                              aria-label="Mover experiência para cima"
                              className="btn-outline"
                              style={reorderBtnStyle}
                            >
                              <ArrowUp size={12} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveExperience(exp.id, 1)}
                              disabled={expIdx === data.experience.length - 1}
                              aria-label="Mover experiência para baixo"
                              className="btn-outline"
                              style={reorderBtnStyle}
                            >
                              <ArrowDown size={12} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="form-group">
                            <label>Empresa</label>
                            <input
                              value={exp.company}
                              onChange={(event) =>
                                updateExperience(exp.id, { company: event.target.value })
                              }
                              placeholder="Ex: MozTech"
                            />
                          </div>

                          <div className="form-group">
                            <label>Cargo ({activeLanguage.toUpperCase()})</label>
                            <input
                              value={exp.position[activeLanguage]}
                              onChange={(event) =>
                                updateExperience(exp.id, {
                                  position: {
                                    ...exp.position,
                                    [activeLanguage]: event.target.value,
                                  },
                                })
                              }
                              placeholder="Ex: Senior Developer"
                            />
                          </div>

                          <div className="form-group">
                            <label>Periodo</label>
                            <input
                              value={exp.period}
                              onChange={(event) =>
                                updateExperience(exp.id, { period: event.target.value })
                              }
                              placeholder="Ex: Jan 2022 - Presente"
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              Responsabilidades e conquistas ({activeLanguage.toUpperCase()})
                            </label>
                            <BulletEditor
                              value={exp.description[activeLanguage]}
                              onChange={(next) =>
                                updateExperience(exp.id, {
                                  description: {
                                    ...exp.description,
                                    [activeLanguage]: next,
                                  },
                                })
                              }
                              lang={activeLanguage}
                              placeholder="Começa com verbo de acção + métrica. Ex.: 'Liderei migração para microserviços, reduzindo latência 40%.'"
                              onImprove={improveBullet}
                              disabled={isConverting}
                            />
                          </div>

                          <button
                            onClick={() => removeExperience(exp.id)}
                            style={{
                              color: 'var(--error)',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'transparent',
                              marginTop: '4px',
                            }}
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      ))}

                      <button
                        className="btn-outline"
                        onClick={addExperience}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Experiencia
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="education"
                icon={GraduationCap}
                title="Educacao"
                count={data.education.length}
                isOpen={openSections.includes('education')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('education') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      {data.education.map((edu, eduIdx) => (
                        <div
                          key={edu.id}
                          style={{
                            marginBottom: '16px',
                            padding: '12px',
                            background: 'var(--background-muted)',
                            borderRadius: '8px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => moveEducation(edu.id, -1)}
                              disabled={eduIdx === 0}
                              aria-label="Mover educação para cima"
                              className="btn-outline"
                              style={reorderBtnStyle}
                            >
                              <ArrowUp size={12} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveEducation(edu.id, 1)}
                              disabled={eduIdx === data.education.length - 1}
                              aria-label="Mover educação para baixo"
                              className="btn-outline"
                              style={reorderBtnStyle}
                            >
                              <ArrowDown size={12} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="form-group">
                            <label>Instituicao</label>
                            <input
                              value={edu.institution}
                              onChange={(event) =>
                                updateEducation(edu.id, { institution: event.target.value })
                              }
                              placeholder="Instituicao"
                            />
                          </div>
                          <div className="form-group">
                            <label>Curso / Grau ({activeLanguage.toUpperCase()})</label>
                            <input
                              value={edu.degree[activeLanguage]}
                              onChange={(event) =>
                                updateEducation(edu.id, {
                                  degree: {
                                    ...edu.degree,
                                    [activeLanguage]: event.target.value,
                                  },
                                })
                              }
                              placeholder="Curso / Grau"
                            />
                          </div>
                          <div className="form-group">
                            <label>Ano de conclusao</label>
                            <input
                              value={edu.year}
                              onChange={(event) =>
                                updateEducation(edu.id, { year: event.target.value })
                              }
                              placeholder="Ano de conclusao"
                            />
                          </div>
                          <button
                            onClick={() => removeEducation(edu.id)}
                            style={{
                              color: 'var(--error)',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'transparent',
                            }}
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      ))}

                      <button
                        className="btn-outline"
                        onClick={addEducation}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Educacao
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="languages"
                icon={Languages}
                title="Idiomas"
                count={data.languages.length}
                isOpen={openSections.includes('languages')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('languages') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      {data.languages.map((lang, index) => {
                        const currentProficiency: LanguageProficiency =
                          lang.proficiency ||
                          (Object.entries(LANGUAGE_PROFICIENCY_LABELS).find(
                            ([, field]) =>
                              field.pt === lang.level.pt || field.en === lang.level.en
                          )?.[0] as LanguageProficiency | undefined) ||
                          'intermediate';

                        const displayedLevel = isLoadingLevel(lang.level[activeLanguage])
                          ? LANGUAGE_PROFICIENCY_LABELS[currentProficiency][activeLanguage]
                          : lang.level[activeLanguage];

                        return (
                          <div
                            key={`lang-${index}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1.1fr auto',
                              gap: '8px',
                              marginBottom: '10px',
                              alignItems: 'center',
                            }}
                          >
                            <input
                              value={lang.name}
                              onChange={(event) =>
                                updateLanguage(index, { name: event.target.value })
                              }
                              placeholder={activeLanguage === 'pt' ? 'Lingua' : 'Language'}
                            />
                            <select
                              value={currentProficiency}
                              onChange={(event) => {
                                const next = event.target.value as LanguageProficiency;
                                updateLanguage(index, {
                                  proficiency: next,
                                  level: LANGUAGE_PROFICIENCY_LABELS[next],
                                });
                              }}
                              style={{
                                background: 'var(--background)',
                                border: '1px solid var(--card-border)',
                                color: 'var(--foreground)',
                                borderRadius: '8px',
                                padding: '10px',
                              }}
                              title={displayedLevel}
                            >
                              {(
                                Object.entries(LANGUAGE_PROFICIENCY_LABELS) as Array<
                                  [LanguageProficiency, { pt: string; en: string }]
                                >
                              ).map(([key, label]) => (
                                <option key={key} value={key}>
                                  {label[activeLanguage]}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeLanguage(index)}
                              style={{ background: 'transparent', color: 'var(--error)' }}
                              aria-label="Remover idioma"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                      <button
                        className="btn-outline"
                        onClick={addLanguage}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Idioma
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="skills"
                icon={Code}
                title="Competencias"
                count={data.skills.length}
                isOpen={openSections.includes('skills')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('skills') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        {data.skills.map((skill, index) => (
                          <span
                            key={`${skill.pt}-${skill.en}-${index}`}
                            style={{
                              background: 'var(--accent)',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            {skill[activeLanguage] || skill.pt || skill.en}
                            <Trash2
                              size={12}
                              onClick={() => removeSkill(index)}
                              style={{ cursor: 'pointer' }}
                            />
                          </span>
                        ))}
                      </div>
                      <input
                        placeholder="Pressione Enter para adicionar"
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter') return;

                          event.preventDefault();
                          const value = (event.currentTarget.value || '').trim();
                          if (!value) return;

                          addSkill(value, activeLanguage);
                          event.currentTarget.value = '';
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="projects"
                icon={FolderGit2}
                title="Projectos"
                count={data.projects.length}
                isOpen={openSections.includes('projects')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('projects') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      {data.projects.map((project, prjIdx) => (
                        <div
                          key={project.id}
                          style={{
                            marginBottom: '20px',
                            padding: '16px',
                            background: 'var(--background-muted)',
                            borderRadius: '12px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => moveProject(project.id, -1)}
                              disabled={prjIdx === 0}
                              aria-label="Mover projecto para cima"
                              className="btn-outline"
                              style={reorderBtnStyle}
                            >
                              <ArrowUp size={12} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProject(project.id, 1)}
                              disabled={prjIdx === data.projects.length - 1}
                              aria-label="Mover projecto para baixo"
                              className="btn-outline"
                              style={reorderBtnStyle}
                            >
                              <ArrowDown size={12} aria-hidden="true" />
                            </button>
                          </div>
                          <div className="form-group">
                            <label>Nome</label>
                            <input
                              value={project.name}
                              onChange={(event) =>
                                updateProject(project.id, { name: event.target.value })
                              }
                              placeholder="Nome do projecto"
                            />
                          </div>
                          <div className="form-group">
                            <label>Link</label>
                            <input
                              value={project.link}
                              onChange={(event) =>
                                updateProject(project.id, { link: event.target.value })
                              }
                              placeholder="https://..."
                            />
                          </div>
                          <div className="form-group">
                            <label>Destaques ({activeLanguage.toUpperCase()})</label>
                            <BulletEditor
                              value={project.description[activeLanguage]}
                              onChange={(next) =>
                                updateProject(project.id, {
                                  description: {
                                    ...project.description,
                                    [activeLanguage]: next,
                                  },
                                })
                              }
                              lang={activeLanguage}
                              placeholder="Ex.: 'Implementei pipeline CI/CD que acelerou deploys 3x.'"
                              onImprove={improveBullet}
                              disabled={isConverting}
                            />
                          </div>
                          <button
                            onClick={() => removeProject(project.id)}
                            style={{
                              color: 'var(--error)',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'transparent',
                            }}
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn-outline"
                        onClick={addProject}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Projecto
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="certifications"
                icon={Award}
                title="Certificacoes"
                count={data.certifications.length}
                isOpen={openSections.includes('certifications')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('certifications') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      {data.certifications.map((cert) => (
                        <div
                          key={cert.id}
                          style={{
                            marginBottom: '16px',
                            padding: '12px',
                            background: 'var(--background-muted)',
                            borderRadius: '8px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div className="form-group">
                            <label>Nome</label>
                            <input
                              value={cert.name}
                              onChange={(event) =>
                                updateCertification(cert.id, { name: event.target.value })
                              }
                              placeholder="Nome da certificacao"
                            />
                          </div>
                          <div className="form-group">
                            <label>Emissor</label>
                            <input
                              value={cert.issuer}
                              onChange={(event) =>
                                updateCertification(cert.id, { issuer: event.target.value })
                              }
                              placeholder="Organizacao emissora"
                            />
                          </div>
                          <div className="form-group">
                            <label>Ano</label>
                            <input
                              value={cert.year}
                              onChange={(event) =>
                                updateCertification(cert.id, { year: event.target.value })
                              }
                              placeholder="Ano"
                            />
                          </div>
                          <button
                            onClick={() => removeCertification(cert.id)}
                            style={{
                              color: 'var(--error)',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'transparent',
                            }}
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      ))}

                      <button
                        className="btn-outline"
                        onClick={addCertification}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Certificacao
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* References */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="references"
                icon={UserCheck}
                title="Referencias"
                count={data.references.length}
                isOpen={openSections.includes('references')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('references') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      {data.references.map((ref) => (
                        <div
                          key={ref.id}
                          style={{
                            marginBottom: '16px',
                            padding: '12px',
                            background: 'var(--background-muted)',
                            borderRadius: '8px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div className="form-group">
                            <label>Nome</label>
                            <input
                              value={ref.name}
                              onChange={(event) =>
                                updateReference(ref.id, { name: event.target.value })
                              }
                              placeholder="Nome completo"
                            />
                          </div>
                          <div
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
                          >
                            <div className="form-group">
                              <label>Cargo</label>
                              <input
                                value={ref.role}
                                onChange={(event) =>
                                  updateReference(ref.id, { role: event.target.value })
                                }
                                placeholder="Ex: Diretor de Operacoes"
                              />
                            </div>
                            <div className="form-group">
                              <label>Empresa</label>
                              <input
                                value={ref.company}
                                onChange={(event) =>
                                  updateReference(ref.id, { company: event.target.value })
                                }
                                placeholder="Empresa / Organizacao"
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Contacto (email ou telefone)</label>
                            <input
                              value={ref.contact}
                              onChange={(event) =>
                                updateReference(ref.id, { contact: event.target.value })
                              }
                              placeholder="email@exemplo.com | +258 84 000 0000"
                            />
                          </div>
                          <div className="form-group">
                            <label>Relacao ({activeLanguage.toUpperCase()})</label>
                            <input
                              value={ref.relationship[activeLanguage]}
                              onChange={(event) =>
                                updateReference(ref.id, {
                                  relationship: {
                                    ...ref.relationship,
                                    [activeLanguage]: event.target.value,
                                  },
                                })
                              }
                              placeholder={
                                activeLanguage === 'pt'
                                  ? 'Ex: Antigo chefe direto'
                                  : 'e.g. Former direct manager'
                              }
                            />
                          </div>
                          <button
                            onClick={() => removeReference(ref.id)}
                            style={{
                              color: 'var(--error)',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'transparent',
                            }}
                          >
                            <Trash2 size={12} /> Remover
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn-outline"
                        onClick={addReference}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Referencia
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom sections */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <SectionHeader
                id="custom"
                icon={LayoutTemplate}
                title="Seccoes Personalizadas"
                count={data.customSections.length}
                isOpen={openSections.includes('custom')}
                onToggle={toggleSection}
              />
              <AnimatePresence initial={false}>
                {openSections.includes('custom') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px' }}>
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'var(--muted-foreground)',
                          lineHeight: 1.55,
                          marginBottom: '12px',
                        }}
                      >
                        Adiciona seccoes personalizadas (ex: Voluntariado, Prémios, Publicacoes,
                        Hobbies). Cada seccao pode ter varios items.
                      </p>
                      {data.customSections.map((section) => (
                        <div
                          key={section.id}
                          style={{
                            marginBottom: '18px',
                            padding: '14px',
                            background: 'var(--muted)',
                            borderRadius: '10px',
                            border: '1px solid var(--card-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div className="form-group">
                            <label>Titulo da seccao ({activeLanguage.toUpperCase()})</label>
                            <input
                              value={section.label[activeLanguage]}
                              onChange={(event) =>
                                updateCustomSection(section.id, {
                                  label: {
                                    ...section.label,
                                    [activeLanguage]: event.target.value,
                                  },
                                })
                              }
                              placeholder={
                                activeLanguage === 'pt' ? 'Ex: Voluntariado' : 'e.g. Volunteering'
                              }
                            />
                          </div>

                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                padding: '10px',
                                background: 'var(--background-muted)',
                                borderRadius: '8px',
                                border: '1px solid var(--card-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 140px',
                                  gap: '8px',
                                }}
                              >
                                <input
                                  value={item.title[activeLanguage]}
                                  onChange={(event) =>
                                    updateCustomSectionItem(section.id, item.id, {
                                      title: {
                                        ...item.title,
                                        [activeLanguage]: event.target.value,
                                      },
                                    })
                                  }
                                  placeholder={
                                    activeLanguage === 'pt' ? 'Titulo' : 'Title'
                                  }
                                />
                                <input
                                  value={item.period}
                                  onChange={(event) =>
                                    updateCustomSectionItem(section.id, item.id, {
                                      period: event.target.value,
                                    })
                                  }
                                  placeholder={
                                    activeLanguage === 'pt' ? 'Periodo' : 'Period'
                                  }
                                />
                              </div>
                              <input
                                value={item.subtitle[activeLanguage]}
                                onChange={(event) =>
                                  updateCustomSectionItem(section.id, item.id, {
                                    subtitle: {
                                      ...item.subtitle,
                                      [activeLanguage]: event.target.value,
                                    },
                                  })
                                }
                                placeholder={
                                  activeLanguage === 'pt'
                                    ? 'Subtitulo (ex: organizacao)'
                                    : 'Subtitle (e.g. organization)'
                                }
                              />
                              <textarea
                                rows={3}
                                value={item.description[activeLanguage]}
                                onChange={(event) =>
                                  updateCustomSectionItem(section.id, item.id, {
                                    description: {
                                      ...item.description,
                                      [activeLanguage]: event.target.value,
                                    },
                                  })
                                }
                                placeholder={
                                  activeLanguage === 'pt' ? 'Descricao' : 'Description'
                                }
                                style={{ resize: 'vertical', minHeight: '70px' }}
                              />
                              <button
                                onClick={() =>
                                  removeCustomSectionItem(section.id, item.id)
                                }
                                style={{
                                  color: 'var(--error)',
                                  fontSize: '11px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: 'transparent',
                                  alignSelf: 'flex-start',
                                }}
                              >
                                <Trash2 size={12} /> Remover item
                              </button>
                            </div>
                          ))}

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn-outline"
                              onClick={() => addCustomSectionItem(section.id)}
                              style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <Plus size={14} /> Adicionar item
                            </button>
                            <button
                              onClick={() => removeCustomSection(section.id)}
                              style={{
                                color: 'var(--error)',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'transparent',
                                padding: '8px 12px',
                              }}
                            >
                              <Trash2 size={14} /> Remover seccao
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        className="btn-outline"
                        onClick={addCustomSection}
                        style={{
                          width: '100%',
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} /> Adicionar Seccao
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {data.personalInfo.jobTitle[activeLanguage] && (
              <div
                style={{
                  padding: '16px',
                  background:
                    'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.08) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59,130,246,0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                  }}
                >
                  <Sparkles size={16} color="var(--accent)" />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>RECOMENDACAO IA</span>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    lineHeight: 1.5,
                    marginBottom: '12px',
                  }}
                >
                  {getTemplateRecommendation(data.personalInfo.jobTitle[activeLanguage]).reason}
                </p>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  onClick={() =>
                    setTemplate(
                      getTemplateRecommendation(data.personalInfo.jobTitle[activeLanguage]).template
                    )
                  }
                >
                  Usar Template{' '}
                  {getTemplateRecommendation(data.personalInfo.jobTitle[activeLanguage]).badge}
                </button>
              </div>
            )}

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
                Template
              </h3>
              <TemplateGallery
                compact
                activeTemplate={data.settings.template}
                onSelect={(templateId) => setTemplate(templateId)}
              />
            </section>

            <section>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Palette size={16} /> Cor de Destaque
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#0f766e', '#0f172a', '#ec4899'].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: color,
                        border:
                          data.settings.accentColor === color
                            ? '3px solid var(--foreground)'
                            : '1px solid var(--card-border)',
                        boxShadow:
                          data.settings.accentColor === color
                            ? `0 0 0 2px ${color}33`
                            : 'none',
                      }}
                    />
                  )
                )}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
                Ajustes de Layout
              </h3>
              <div className="form-group">
                <label>Espacamento entre Seccoes ({data.settings.sectionSpacing}px)</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={data.settings.sectionSpacing}
                  onChange={(event) =>
                    updateSettings({ sectionSpacing: Number(event.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label>Tamanho da Fonte ({data.settings.fontSize}px)</label>
                <input
                  type="range"
                  min="10"
                  max="18"
                  value={data.settings.fontSize}
                  onChange={(event) =>
                    updateSettings({ fontSize: Number(event.target.value) })
                  }
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

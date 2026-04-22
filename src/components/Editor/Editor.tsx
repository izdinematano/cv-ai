'use client';

import { useCVStore } from '@/store/useCVStore';
import { translateCVField, improveCVField } from '@/lib/openrouter';
import { 
  Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, 
  Code, Palette, Settings, Layout, Wand2, FileText, 
  Award, FolderGit2, Languages, Share2, Camera, ChevronDown, ChevronUp, ZoomIn, ZoomOut
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preview from '../Preview/Preview';
import { getTemplateRecommendation } from '@/lib/recommendations';

export default function Editor() {
  const { 
    data, activeLanguage, updatePersonalInfo, updateSummary, 
    addExperience, updateExperience, removeExperience, 
    addEducation, updateEducation, removeEducation,
    addProject, updateProject, removeProject,
    addCertification, updateCertification, removeCertification,
    addSkill, removeSkill, 
    isConverting, setConverting, setTemplate, setAccentColor, updateSettings 
  } = useCVStore();

  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [openSections, setOpenSections] = useState<string[]>(['personal']);
  const [zoom, setZoom] = useState(0.8);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const calculateScore = () => {
    let score = 10;
    if (data.personalInfo.fullName) score += 10;
    if (data.personalInfo.photo) score += 10;
    if (data.summary[activeLanguage]) score += 15;
    if (data.experience.length > 0) score += 20;
    if (data.education.length > 0) score += 15;
    if (data.skills.length > 0) score += 10;
    if (data.projects.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const handleAIImprove = async (field: string, value: string, section: string, id?: string) => {
    if (!value) return;
    setConverting(true);
    const result = await improveCVField(value, activeLanguage);
    
    if (section === 'summary') updateSummary({ [activeLanguage]: result });
    else if (section === 'experience' && id) {
      updateExperience(id, { description: { ...data.experience.find(e => e.id === id)?.description as any, [activeLanguage]: result } });
    }
    setConverting(false);
  };

  const SectionHeader = ({ id, icon: Icon, title, count }: { id: string, icon: any, title: string, count?: number }) => (
    <div 
      onClick={() => toggleSection(id)}
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '16px 20px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid var(--card-border)',
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Icon size={18} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: '15px' }}>{title}</span>
        {count !== undefined && (
          <span style={{ fontSize: '11px', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{count}</span>
        )}
      </div>
      {openSections.includes(id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', background: '#0a0a0a' }}>
      {/* Sidebar Controls (Inputs) */}
      <div style={{ width: '500px', borderRight: '1px solid var(--card-border)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', background: '#0f1115', position: 'sticky', top: 0, zIndex: 10 }}>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ 
              flex: 1, padding: '16px', fontSize: '13px', fontWeight: 700, 
              color: activeTab === 'content' ? 'var(--accent)' : '#94a3b8',
              borderBottom: activeTab === 'content' ? '2px solid var(--accent)' : 'none',
              background: 'transparent'
            }}
          >
            CONTEÚDO
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            style={{ 
              flex: 1, padding: '16px', fontSize: '13px', fontWeight: 700, 
              color: activeTab === 'design' ? 'var(--accent)' : '#94a3b8',
              borderBottom: activeTab === 'design' ? '2px solid var(--accent)' : 'none',
              background: 'transparent'
            }}
          >
            DESIGN
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Progress Card */}
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Força do Currículo</span>
              <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 800 }}>{calculateScore()}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${calculateScore()}%` }} style={{ height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
            </div>
          </div>

          {activeTab === 'content' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Personal Info */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <SectionHeader id="personal" icon={User} title="Dados Pessoais" />
                <AnimatePresence>
                  {openSections.includes('personal') && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label>Nome Completo</label>
                          <input value={data.personalInfo.fullName} onChange={(e) => updatePersonalInfo({ fullName: e.target.value })} placeholder="Ex: João Mavie" />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input value={data.personalInfo.email} onChange={(e) => updatePersonalInfo({ email: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Telefone</label>
                          <input value={data.personalInfo.phone} onChange={(e) => updatePersonalInfo({ phone: e.target.value })} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Experience */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <SectionHeader id="experience" icon={Briefcase} title="Experiência Profissional" count={data.experience.length} />
                <AnimatePresence>
                  {openSections.includes('experience') && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '20px' }}>
                        {data.experience.map((exp) => (
                          <div key={exp.id} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                            <input style={{ marginBottom: '8px' }} value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Empresa" />
                            <input value={exp.position[activeLanguage]} onChange={(e) => updateExperience(exp.id, { position: { ...exp.position, [activeLanguage]: e.target.value } })} placeholder="Cargo" />
                          </div>
                        ))}
                        <button className="btn-outline" onClick={addExperience} style={{ width: '100%', marginTop: '10px' }}><Plus size={16} /> Adicionar</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Skills */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <SectionHeader id="skills" icon={Code} title="Competências" count={data.skills.length} />
                <AnimatePresence>
                  {openSections.includes('skills') && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                          {data.skills.map((s, i) => (
                            <span key={i} style={{ background: 'var(--accent)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {s.pt} <Trash2 size={12} onClick={() => removeSkill(i)} style={{ cursor: 'pointer' }} />
                            </span>
                          ))}
                        </div>
                        <input 
                          placeholder="Pressione Enter para adicionar" 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addSkill((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Recommendation Banner */}
              {data.personalInfo.jobTitle[activeLanguage] && (
                <div style={{ 
                  padding: '16px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                  borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Sparkles size={16} color="var(--accent)" />
                    <span style={{ fontSize: '13px', fontWeight: 800 }}>RECOMENDAÇÃO IA</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
                    {getTemplateRecommendation(data.personalInfo.jobTitle[activeLanguage]).reason}
                  </p>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => setTemplate(getTemplateRecommendation(data.personalInfo.jobTitle[activeLanguage]).template)}
                  >
                    Usar Template {getTemplateRecommendation(data.personalInfo.jobTitle[activeLanguage]).badge}
                  </button>
                </div>
              )}

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Template</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { id: 'minimalist', name: 'Minimalista v1' },
                    { id: 'minimalist-v2', name: 'Minimalista v2' },
                    { id: 'corporate', name: 'Corporativo v1' },
                    { id: 'corporate-v2', name: 'Corporativo v2' },
                    { id: 'creative', name: 'Criativo v1' },
                    { id: 'creative-v2', name: 'Criativo v2' },
                    { id: 'executive', name: 'Executivo v1' },
                    { id: 'executive-v2', name: 'Executivo v2' },
                    { id: 'tech', name: 'Tech / IT' },
                    { id: 'modern', name: 'Moderno Pro' },
                    { id: 'student', name: 'Estudante' },
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      style={{ 
                        padding: '12px', borderRadius: '8px', background: data.settings.template === t.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)', color: 'white', fontSize: '12px', fontWeight: 600
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Cor de Destaque</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a', '#ec4899'].map(c => (
                    <div 
                      key={c} 
                      onClick={() => setAccentColor(c)}
                      style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', background: c, cursor: 'pointer',
                        border: data.settings.accentColor === c ? '3px solid white' : 'none'
                      }} 
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Ajustes de Layout</h3>
                <div className="form-group">
                  <label>Espaçamento entre Secções ({data.settings.sectionSpacing}px)</label>
                  <input type="range" min="10" max="60" value={data.settings.sectionSpacing} onChange={(e) => updateSettings({ sectionSpacing: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Tamanho da Fonte ({data.settings.fontSize}px)</label>
                  <input type="range" min="10" max="18" value={data.settings.fontSize} onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })} />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Preview Area (Right) */}
      <div style={{ flex: 1, background: '#1a1a1a', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '40px', position: 'relative' }}>
        {/* Zoom Controls */}
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', display: 'flex', gap: '10px', zIndex: 100 }}>
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="glass-card" style={{ padding: '10px', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomOut size={20} /></button>
          <div className="glass-card" style={{ padding: '10px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '13px' }}>{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))} className="glass-card" style={{ padding: '10px', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomIn size={20} /></button>
        </div>

        <motion.div 
          animate={{ scale: zoom }}
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            background: 'white', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            transformOrigin: 'top center',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <Preview />
        </motion.div>
      </div>
    </div>
  );
}

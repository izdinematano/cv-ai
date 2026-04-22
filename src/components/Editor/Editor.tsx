'use client';

import { useCVStore } from '@/store/useCVStore';
import { translateCVField, improveCVField } from '@/lib/openrouter';
import { Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, Code, Palette, Settings, Layout, Wand2 } from 'lucide-react';
import { useState } from 'react';

export default function Editor() {
  const { data, activeLanguage, updatePersonalInfo, updateSummary, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, addSkill, updateSkill, removeSkill, isConverting, setConverting, setTemplate, setAccentColor } = useCVStore();
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const calculateScore = () => {
    let score = 20; // Base score
    if (data.personalInfo.fullName) score += 10;
    if (data.summary[activeLanguage]) score += 20;
    if (data.experience.length > 0) score += 30;
    if (data.skills.length > 0) score += 20;
    return Math.min(score, 100);
  };

  const handleMagicConvert = async (field: any, value: string, section: string, id?: string) => {
    if (!value) return;
    setConverting(true);
    const result = await translateCVField(value, activeLanguage, activeLanguage === 'pt' ? 'en' : 'pt');
    
    const targetLang = activeLanguage === 'pt' ? 'en' : 'pt';
    
    if (section === 'personal') {
      updatePersonalInfo({ [field]: { ...data.personalInfo.jobTitle, [targetLang]: result } });
    } else if (section === 'summary') {
      updateSummary({ [targetLang]: result });
    } else if (section === 'experience' && id) {
      const exp = data.experience.find(e => e.id === id);
      if (exp) {
        updateExperience(id, { [field]: { ...exp[field as keyof typeof exp] as any, [targetLang]: result } });
      }
    }
    setConverting(false);
  };

  const handleAIImprove = async (field: any, value: string, section: string, id?: string) => {
    if (!value) return;
    setConverting(true);
    const result = await improveCVField(value, activeLanguage);
    
    if (section === 'summary') {
      updateSummary({ [activeLanguage]: result });
    } else if (section === 'experience' && id) {
      const exp = data.experience.find(e => e.id === id);
      if (exp) {
        updateExperience(id, { [field]: { ...exp[field as keyof typeof exp] as any, [activeLanguage]: result } });
      }
    }
    setConverting(false);
  };

  return (
    <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)' }}>
        <button 
          onClick={() => setActiveTab('content')}
          style={{ 
            flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, 
            color: activeTab === 'content' ? 'var(--accent)' : 'var(--muted-foreground)',
            borderBottom: activeTab === 'content' ? '2px solid var(--accent)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Layout size={18} /> Conteúdo
        </button>
        <button 
          onClick={() => setActiveTab('design')}
          style={{ 
            flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, 
            color: activeTab === 'design' ? 'var(--accent)' : 'var(--muted-foreground)',
            borderBottom: activeTab === 'design' ? '2px solid var(--accent)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Palette size={18} /> Design
        </button>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* CV Score Indicator */}
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.05)', 
          padding: '16px', 
          borderRadius: '12px', 
          border: '1px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray={`${calculateScore()}, 100`} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                {calculateScore()}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>Score do CV</div>
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Melhore os campos para aumentar</div>
            </div>
          </div>
          <Sparkles size={18} color="var(--accent)" />
        </div>

        {activeTab === 'content' ? (
          <>
            {/* Personal Info */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <User size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '18px' }}>Informações Pessoais</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              value={data.personalInfo.fullName}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              placeholder="Ex: João Mavie"
            />
          </div>
          <div className="form-group">
            <label>Título Profissional ({activeLanguage.toUpperCase()})</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={data.personalInfo.jobTitle[activeLanguage]}
                onChange={(e) => updatePersonalInfo({ jobTitle: { ...data.personalInfo.jobTitle, [activeLanguage]: e.target.value } })}
                placeholder="Ex: Software Engineer"
              />
              <button 
                className="magic-btn"
                onClick={() => handleMagicConvert('jobTitle', data.personalInfo.jobTitle[activeLanguage], 'personal')}
                disabled={isConverting}
              >
                <Sparkles size={14} />
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Telemóvel</label>
            <input 
              type="text" 
              value={data.personalInfo.phone}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '18px' }}>Resumo Profissional</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-outline" 
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => handleMagicConvert('summary', data.summary[activeLanguage], 'summary')}
              disabled={isConverting}
            >
              <Sparkles size={14} /> Converter p/ {activeLanguage === 'pt' ? 'Inglês' : 'Português'}
            </button>
            <button 
              className="btn-outline" 
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'var(--accent)' }}
              onClick={() => handleAIImprove('summary', data.summary[activeLanguage], 'summary')}
              disabled={isConverting}
            >
              <Wand2 size={14} color="var(--accent)" /> Melhorar c/ IA
            </button>
          </div>
        </div>
        <textarea 
          rows={4}
          value={data.summary[activeLanguage]}
          onChange={(e) => updateSummary({ [activeLanguage]: e.target.value })}
          placeholder="Descreva a sua trajetória e principais conquistas..."
          style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px', color: 'white', resize: 'vertical' }}
        />
      </section>

      {/* Experience */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Briefcase size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '18px' }}>Experiência Profissional</h2>
          </div>
          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={addExperience}>
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {data.experience.map((exp) => (
          <div key={exp.id} className="experience-item" style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label>Empresa</label>
                <input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Cargo ({activeLanguage.toUpperCase()})</label>
                <div style={{ position: 'relative' }}>
                  <input value={exp.position[activeLanguage]} onChange={(e) => updateExperience(exp.id, { position: { ...exp.position, [activeLanguage]: e.target.value } })} />
                  <button className="magic-btn" onClick={() => handleMagicConvert('position', exp.position[activeLanguage], 'experience', exp.id)} disabled={isConverting}>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Descrição ({activeLanguage.toUpperCase()})</label>
              <div style={{ position: 'relative' }}>
                <textarea rows={3} value={exp.description[activeLanguage]} onChange={(e) => updateExperience(exp.id, { description: { ...exp.description, [activeLanguage]: e.target.value } })} />
                <div style={{ position: 'absolute', right: '8px', top: '10px', display: 'flex', gap: '4px' }}>
                  <button className="magic-btn" style={{ position: 'static', transform: 'none' }} onClick={() => handleAIImprove('description', exp.description[activeLanguage], 'experience', exp.id)} disabled={isConverting}>
                    <Wand2 size={14} />
                  </button>
                  <button className="magic-btn" style={{ position: 'static', transform: 'none' }} onClick={() => handleMagicConvert('description', exp.description[activeLanguage], 'experience', exp.id)} disabled={isConverting}>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={() => removeExperience(exp.id)} style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <Trash2 size={14} /> Remover
              </button>
            </div>
          </div>
        ))}
      </section>
      {/* Education */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GraduationCap size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '18px' }}>Educação</h2>
          </div>
          <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={addEducation}>
            <Plus size={14} /> Adicionar
          </button>
        </div>

        {data.education.map((edu) => (
          <div key={edu.id} className="experience-item" style={{ marginBottom: '16px', padding: '16px', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
              <div className="form-group">
                <label>Instituição</label>
                <input value={edu.institution} onChange={(e) => updateEducation(edu.id, { institution: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Curso/Grau ({activeLanguage.toUpperCase()})</label>
                <div style={{ position: 'relative' }}>
                  <input value={edu.degree[activeLanguage]} onChange={(e) => updateEducation(edu.id, { degree: { ...edu.degree, [activeLanguage]: e.target.value } })} />
                  <button className="magic-btn" onClick={() => handleMagicConvert('degree', edu.degree[activeLanguage], 'education', edu.id)} disabled={isConverting}>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <div className="form-group">
                <label>Ano</label>
                <input style={{ width: '120px' }} value={edu.year} onChange={(e) => updateEducation(edu.id, { year: e.target.value })} placeholder="Ex: 2020-2024" />
              </div>
              <button onClick={() => removeEducation(edu.id)} style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <Trash2 size={14} /> Remover
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Code size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '18px' }}>Competências</h2>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {data.skills.map((skill, index) => (
            <div key={index} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              {skill.pt}
              <button onClick={() => removeSkill(index)} style={{ color: 'var(--muted-foreground)' }}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            id="new-skill"
            type="text" 
            placeholder="Adicionar competência (ex: React, Gestão de Projectos)"
            style={{ 
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: 'white',
              fontSize: '14px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                if (val) {
                  addSkill(val);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <button className="btn-primary" onClick={() => {
            const el = document.getElementById('new-skill') as HTMLInputElement;
            if (el.value) {
              addSkill(el.value);
              el.value = '';
            }
          }}>
            <Plus size={16} />
          </button>
        </div>
      </section>

      {/* Smart Suggestion */}
      <section style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
        border: '1px solid var(--accent)',
        borderRadius: '16px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px', color: 'white' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Dica da IA</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
            Este currículo está melhor otimizado em <span style={{ color: 'var(--accent)', fontWeight: 600 }}>inglês</span> para vagas internacionais. 
            Recomendamos o uso de verbos de ação como "Led", "Developed" e "Strategized" na versão em inglês.
          </p>
        </div>
      </section>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layout size={20} color="var(--accent)" /> Escolher Template
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { id: 'minimalist', name: 'Minimalista v1', img: '/templates/minimalist.png' },
                  { id: 'minimalist-v2', name: 'Minimalista v2', img: '/templates/minimalist-v2.png' },
                  { id: 'corporate', name: 'Corporativo v1', img: '/templates/corporate.png' },
                  { id: 'corporate-v2', name: 'Corporativo v2', img: '/templates/corporate-v2.png' },
                  { id: 'creative', name: 'Criativo v1', img: '/templates/creative.png' },
                  { id: 'creative-v2', name: 'Criativo v2', img: '/templates/creative-v2.png' },
                  { id: 'executive', name: 'Executivo v1', img: '/templates/executive.png' },
                  { id: 'executive-v2', name: 'Executivo v2', img: '/templates/executive-v2.png' },
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setTemplate(t.id as any)}
                    style={{ 
                      padding: '0', 
                      borderRadius: '12px', 
                      background: data.settings?.template === t.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                      border: data.settings?.template === t.id ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                      color: 'white',
                      textAlign: 'center',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ height: '120px', overflow: 'hidden' }}>
                      <img src={t.img} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: data.settings?.template === t.id ? 1 : 0.6 }} />
                    </div>
                    <div style={{ padding: '12px', fontWeight: 600, fontSize: '13px' }}>{t.name}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Palette size={20} color="var(--accent)" /> Cores e Estilo
              </h2>
              <div className="form-group">
                <label>Cor de Destaque</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'].map((c) => (
                    <button 
                      key={c}
                      onClick={() => setAccentColor(c)}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: c,
                        border: data.settings?.accentColor === c ? '2px solid white' : 'none',
                        boxShadow: data.settings?.accentColor === c ? '0 0 10px ' + c : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

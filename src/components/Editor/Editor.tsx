'use client';

import { useCVStore } from '@/store/useCVStore';
import { translateCVField } from '@/lib/openrouter';
import { Sparkles, Plus, Trash2, User, Briefcase, GraduationCap, Code } from 'lucide-react';
import { useState } from 'react';

export default function Editor() {
  const { data, activeLanguage, updatePersonalInfo, updateSummary, addExperience, updateExperience, removeExperience, addEducation, updateEducation, removeEducation, addSkill, updateSkill, removeSkill, isConverting, setConverting } = useCVStore();

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

  return (
    <div className="editor-container" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', height: '100%' }}>
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
          <button 
            className="btn-outline" 
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => handleMagicConvert('summary', data.summary[activeLanguage], 'summary')}
            disabled={isConverting}
          >
            <Sparkles size={14} /> Converter p/ {activeLanguage === 'pt' ? 'Inglês' : 'Português'}
          </button>
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
                <button className="magic-btn" onClick={() => handleMagicConvert('description', exp.description[activeLanguage], 'experience', exp.id)} disabled={isConverting} style={{ top: '10px' }}>
                  <Sparkles size={14} />
                </button>
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

    </div>
  );
}

'use client';

import { useCVStore } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Link, Globe } from 'lucide-react';

export default function Preview() {
  const { data, activeLanguage } = useCVStore();

  const t = {
    experience: activeLanguage === 'pt' ? 'Experiência Profissional' : 'Professional Experience',
    education: activeLanguage === 'pt' ? 'Educação' : 'Education',
    skills: activeLanguage === 'pt' ? 'Competências' : 'Skills',
    summary: activeLanguage === 'pt' ? 'Resumo' : 'Professional Summary',
  };

  return (
    <div className="preview-container" style={{ padding: '40px', height: '100%', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
      <div className="a4-page" style={{ 
        width: '100%', 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: 'white', 
        color: '#1e293b', 
        padding: '60px', 
        minHeight: '1122px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        borderRadius: '2px'
      }}>
        {/* Header */}
        <header style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '24px', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px' }}>{data.personalInfo.fullName || 'Seu Nome'}</h1>
          <p style={{ fontSize: '18px', color: '#3b82f6', fontWeight: 500, marginBottom: '16px' }}>
            {data.personalInfo.jobTitle[activeLanguage] || 'Título Profissional'}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '12px', color: '#64748b' }}>
            {data.personalInfo.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> {data.personalInfo.email}
              </div>
            )}
            {data.personalInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} /> {data.personalInfo.phone}
              </div>
            )}
            {data.personalInfo.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> {data.personalInfo.location}
              </div>
            )}
            {data.personalInfo.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link size={14} /> {data.personalInfo.linkedin}
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        {(data.summary[activeLanguage]) && (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              {t.summary}
            </h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
              {data.summary[activeLanguage]}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              {t.experience}
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{exp.position[activeLanguage] || 'Cargo'}</h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{exp.period || 'Período'}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>{exp.company || 'Empresa'}</div>
                <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {exp.description[activeLanguage]}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              {t.education}
            </h2>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{edu.degree[activeLanguage] || 'Grau/Curso'}</h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{edu.year}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569' }}>{edu.institution}</div>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section>
            <h2 style={{ fontSize: '16px', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              {t.skills}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.map((skill, index) => (
                <span key={index} style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                  {skill.pt}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

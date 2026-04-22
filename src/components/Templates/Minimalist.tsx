'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Minimalist({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;

  return (
    <div style={{ padding: '60px', minHeight: '1122px', background: 'white', color: '#334155', fontSize: `${fontSize}px` }}>
      <header style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '30px', marginBottom: `${sectionSpacing}px` }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{data.personalInfo.fullName}</h1>
        <h2 style={{ fontSize: '16px', color: accentColor, fontWeight: 600, marginBottom: '15px' }}>{data.personalInfo.jobTitle[lang]}</h2>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '11px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} /> {data.personalInfo.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} /> {data.personalInfo.phone}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={12} /> {data.personalInfo.location}</div>
          {data.personalInfo.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Globe size={12} /> LinkedIn</div>}
          {data.personalInfo.website && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Globe size={12} /> Website</div>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>Perfil</h3>
          <p style={{ lineHeight: 1.6 }}>{data.summary[lang]}</p>
        </section>

        <section>
          <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '20px' }}>Experiência</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{exp.position[lang]}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '12px', color: accentColor, fontWeight: 600, marginBottom: '8px' }}>{exp.company}</div>
                <p style={{ fontSize: '12px', color: '#64748b' }}>{exp.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <section>
            <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '15px' }}>Educação</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{edu.institution} | {edu.year}</div>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '15px' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: '#1e293b' }}>{s.pt}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

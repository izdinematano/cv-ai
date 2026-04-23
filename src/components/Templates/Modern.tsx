'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Modern({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;

  return (
    <div style={{ minHeight: '1122px', background: 'white', color: '#1e293b', fontSize: `${fontSize}px` }}>
      <header style={{ display: 'flex', borderBottom: `8px solid ${accentColor}` }}>
        <div style={{ background: '#0f172a', color: 'white', padding: '60px', flex: 2, display: 'flex', gap: '30px', alignItems: 'center' }}>
          {data.personalInfo.photo && (
            <div style={{ width: '120px', height: '120px', borderRadius: '20px', overflow: 'hidden', border: `3px solid ${accentColor}`, flexShrink: 0 }}>
              <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>{data.personalInfo.fullName}</h1>
            <h2 style={{ fontSize: '20px', color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>{data.personalInfo.jobTitle[lang]}</h2>
          </div>
        </div>
        <div style={{ background: accentColor, padding: '40px', flex: 1, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><Mail size={14} /> {data.personalInfo.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><Phone size={14} /> {data.personalInfo.phone}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><MapPin size={14} /> {data.personalInfo.location}</div>
          {data.personalInfo.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><Globe size={14} /> {data.personalInfo.linkedin}</div>}
          {data.personalInfo.website && <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><Globe size={14} /> {data.personalInfo.website}</div>}
        </div>
      </header>

      <div style={{ padding: '60px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px' }}>
        <div>
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>Perfil</h3>
            <p style={{ lineHeight: 1.8, color: '#475569' }}>{data.summary[lang]}</p>
          </section>

          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>Educação</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 800 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{edu.institution}</div>
              </div>
            ))}
          </section>
        </div>

        <div>
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '30px', textTransform: 'uppercase' }}>Experiência</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 800 }}>{exp.position[lang]}</h4>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{exp.period}</span>
                  </div>
                  <div style={{ color: accentColor, fontWeight: 800, fontSize: '15px', marginBottom: '12px' }}>{exp.company}</div>
                  <p style={{ lineHeight: 1.7, color: '#475569' }}>{exp.description[lang]}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

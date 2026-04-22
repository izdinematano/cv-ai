'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Modern({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;

  return (
    <div style={{ minHeight: '1122px', background: 'white', color: '#1e293b', fontSize: `${fontSize}px` }}>
      {/* Asymmetric Header */}
      <header style={{ display: 'flex', borderBottom: `8px solid ${accentColor}` }}>
        <div style={{ background: '#0f172a', color: 'white', padding: '60px', flex: 2 }}>
          <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>{data.personalInfo.fullName}</h1>
          <h2 style={{ fontSize: '20px', color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>{data.personalInfo.jobTitle[lang]}</h2>
        </div>
        <div style={{ background: accentColor, padding: '60px', flex: 1, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><Mail size={16} /> {data.personalInfo.email}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><Phone size={16} /> {data.personalInfo.phone}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}><MapPin size={16} /> {data.personalInfo.location}</div>
        </div>
      </header>

      <div style={{ padding: '60px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px' }}>
        {/* Left Col */}
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
                <div style={{ fontSize: '12px', color: accentColor, fontWeight: 700 }}>{edu.year}</div>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{s.pt}</span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col */}
        <div>
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '30px', textTransform: 'uppercase' }}>Experiência Profissional</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 800 }}>{exp.position[lang]}</h4>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{exp.period}</span>
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

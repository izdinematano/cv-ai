'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Globe } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function CorporateV2({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: '1122px', background: 'white', fontSize: `${fontSize}px` }}>
      {/* Main Content (Left) */}
      <div style={{ padding: '60px', borderRight: '1px solid #e2e8f0' }}>
        <header style={{ marginBottom: '40px', display: 'flex', gap: '25px', alignItems: 'center' }}>
          {data.personalInfo.photo && (
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: `3px solid ${accentColor}`, flexShrink: 0 }}>
              <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', marginBottom: '5px' }}>{data.personalInfo.fullName}</h1>
            <h2 style={{ fontSize: '18px', color: accentColor, fontWeight: 700 }}>{data.personalInfo.jobTitle[lang]}</h2>
          </div>
        </header>

        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '32px', height: '32px', background: accentColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Briefcase size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Experiência Profissional</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{exp.position[lang]}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '13px', color: accentColor, fontWeight: 600, marginBottom: '8px' }}>{exp.company}</div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>{exp.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ width: '32px', height: '32px', background: accentColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <GraduationCap size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Educação</h3>
          </div>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '15px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{edu.degree[lang]}</h4>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{edu.institution} | {edu.year}</div>
            </div>
          ))}
        </section>
      </div>

      {/* Sidebar (Right) */}
      <div style={{ background: '#f8fafc', padding: '60px 30px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', color: '#0f172a' }}>Contacto</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '11px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} color={accentColor} /> {data.personalInfo.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} color={accentColor} /> {data.personalInfo.phone}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={16} color={accentColor} /> {data.personalInfo.location}</div>
            {data.personalInfo.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Globe size={16} color={accentColor} /> {data.personalInfo.linkedin}</div>}
            {data.personalInfo.website && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Globe size={16} color={accentColor} /> {data.personalInfo.website}</div>}
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', color: '#0f172a' }}>Perfil</h3>
          <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#475569' }}>{data.summary[lang]}</p>
        </section>

        <section>
          <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', color: '#0f172a' }}>Competências</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.skills.map((skill, i) => (
              <div key={i}>
                <div style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>{skill.pt}</div>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                  <div style={{ width: '80%', height: '100%', background: accentColor, borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

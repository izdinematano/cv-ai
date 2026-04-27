'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import BulletList from './_shared/BulletList';
import { labels } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Modern({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;

  return (
    <div style={{ minHeight: '1122px', background: 'white', color: '#1e293b', fontSize: `${fontSize}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative circle accent */}
      <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '140px', height: '140px', background: accentColor, opacity: 0.04, borderRadius: '50%' }} />
      {/* Sparkle SVG */}
      <svg style={{ position: 'absolute', top: 200, right: 30, opacity: 0.05 }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /></svg>
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>{labels.profile[lang]}</h3>
            <p style={{ lineHeight: 1.8, color: '#475569' }}>{data.summary[lang]}</p>
          </section>

          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>{labels.education[lang]}</h3>
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '30px', textTransform: 'uppercase' }}>{labels.experience[lang]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 800 }}>{exp.position[lang]}</h4>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{exp.period}</span>
                  </div>
                  <div style={{ color: accentColor, fontWeight: 800, fontSize: '15px', marginBottom: '12px' }}>{exp.company}</div>
                  <BulletList text={exp.description[lang]} lineHeight={1.7} bulletColor={accentColor} style={{ color: '#475569' }} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin } from 'lucide-react';
import BulletList from './_shared/BulletList';
import { labels } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Executive({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;

  return (
    <div style={{ padding: '60px', minHeight: '1122px', background: 'white', color: '#1a1a1a', borderTop: `15px solid ${accentColor}` }}>
      {/* Elegant Header */}
      <header style={{ textAlign: 'center', marginBottom: '50px', borderBottom: '1px solid #e2e8f0', paddingBottom: '30px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', color: '#0f172a' }}>
          {data.personalInfo.fullName}
        </h1>
        <h2 style={{ fontSize: '18px', color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '25px' }}>
          {data.personalInfo.jobTitle[lang]}
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
          {data.personalInfo.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {data.personalInfo.email.toUpperCase()}</div>}
          {data.personalInfo.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {data.personalInfo.location.toUpperCase()}</div>}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Professional Summary - Full Width with Quote style */}
        <section style={{ position: 'relative', padding: '0 40px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, fontSize: '60px', color: accentColor, opacity: 0.2, lineHeight: 1 }}>
            &quot;
          </div>
          <p style={{ fontSize: '15px', lineHeight: '1.8', fontStyle: 'italic', color: '#334155', textAlign: 'center' }}>
            {data.summary[lang]}
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '15px', letterSpacing: '1px' }}>{labels.skills[lang]}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.skills.map((skill, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', background: accentColor, transform: 'rotate(45deg)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{skill[lang] || skill.pt || skill.en}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '15px', letterSpacing: '1px' }}>{labels.education[lang]}</h3>
              {data.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{edu.degree[lang]}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{edu.institution}</div>
                  <div style={{ fontSize: '11px', color: accentColor, fontWeight: 700 }}>{edu.year}</div>
                </div>
              ))}
            </section>
          </div>

          {/* Right Column */}
          <div>
            <section>
              <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '25px', letterSpacing: '1px', borderBottom: '2px solid #0f172a', display: 'inline-block' }}>{labels.experience[lang]}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{exp.position[lang]}</h4>
                        <div style={{ fontSize: '13px', color: accentColor, fontWeight: 700 }}>{exp.company}</div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{exp.period}</span>
                    </div>
                    <BulletList text={exp.description[lang]} fontSize={13} lineHeight={1.7} bulletColor={accentColor} style={{ color: '#475569', textAlign: 'justify' }} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

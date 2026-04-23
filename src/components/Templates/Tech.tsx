'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, Globe, Code2, Cpu } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Tech({ data, lang }: TemplateProps) {
  const { accentColor, fontSize, sectionSpacing } = data.settings;

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '260px 1fr', 
      minHeight: '1122px', 
      background: '#f1f5f9', 
      fontFamily: '"JetBrains Mono", monospace, system-ui',
      fontSize: `${fontSize}px`
    }}>
      <div style={{ background: '#0f172a', color: 'white', padding: '40px 25px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {data.personalInfo.photo ? (
            <div style={{ width: '120px', height: '120px', borderRadius: '24px', border: `3px solid ${accentColor}`, margin: '0 auto 20px', overflow: 'hidden' }}>
              <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'rgba(255,255,255,0.05)', border: `3px solid ${accentColor}`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={48} color={accentColor} />
            </div>
          )}
          <h1 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '5px' }}>{data.personalInfo.fullName}</h1>
          <div style={{ fontSize: '10px', color: accentColor, fontWeight: 700, textTransform: 'uppercase' }}>{data.personalInfo.jobTitle[lang]}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <section>
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {data.personalInfo.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} /> {data.personalInfo.phone}</div>
              {data.personalInfo.linkedin && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={14} /> {data.personalInfo.linkedin}</div>}
              {data.personalInfo.website && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={14} /> {data.personalInfo.website}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Code2 size={14} /> GitHub Profile</div>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: accentColor, textTransform: 'uppercase', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>Stack</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.map((s, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>{s[lang] || s.pt || s.en}</span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div style={{ padding: '50px', background: 'white' }}>
        <section style={{ marginBottom: `${sectionSpacing * 1.5}px` }}>
          <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: 900, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: accentColor }}>01.</span> Overview
          </h3>
          <p style={{ color: '#475569', lineHeight: 1.7 }}>{data.summary[lang]}</p>
        </section>

        <section style={{ marginBottom: `${sectionSpacing * 1.5}px` }}>
          <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: accentColor }}>02.</span> Experience
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ borderLeft: `2px solid ${accentColor}`, paddingLeft: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '15px' }}>{exp.position[lang]}</h4>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>{exp.period}</span>
                </div>
                <div style={{ color: accentColor, fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>{exp.company}</div>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{exp.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

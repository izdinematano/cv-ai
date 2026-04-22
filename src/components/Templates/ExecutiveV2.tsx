'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function ExecutiveV2({ data, lang }: TemplateProps) {
  const { accentColor, fontSize } = data.settings;
  const serifFont = '"Times New Roman", Times, serif';

  return (
    <div style={{ padding: '80px', minHeight: '1122px', background: '#fcfcfc', color: '#1a1a1a', border: '20px solid #f1f5f9', fontSize: `${fontSize}px` }}>
      <header style={{ textAlign: 'center', marginBottom: '60px', borderBottom: '2px double #e2e8f0', paddingBottom: '30px' }}>
        {data.personalInfo.photo && (
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${accentColor}`, margin: '0 auto 20px' }}>
            <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <h1 style={{ fontFamily: serifFont, fontSize: '48px', fontWeight: 400, marginBottom: '10px' }}>{data.personalInfo.fullName}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={12} /> {data.personalInfo.location}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12} /> {data.personalInfo.phone}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} /> {data.personalInfo.email}</span>
          {data.personalInfo.linkedin && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Globe size={12} /> LinkedIn</span>}
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '4px' }}>{data.personalInfo.jobTitle[lang]}</h2>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '45px' }}>
        <section>
          <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontStyle: 'italic', borderBottom: '1px solid #000', marginBottom: '20px' }}>Resumo Executivo</h3>
          <p style={{ lineHeight: '1.9', textAlign: 'justify' }}>{data.summary[lang]}</p>
        </section>

        <section>
          <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontStyle: 'italic', borderBottom: '1px solid #000', marginBottom: '25px' }}>Experiência</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{exp.company}</h4>
                  <span style={{ fontSize: '13px', fontStyle: 'italic' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: accentColor }}>{exp.position[lang]}</div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#475569' }}>{exp.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

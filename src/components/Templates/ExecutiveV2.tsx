'use client';

import { CVData } from '@/store/useCVStore';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function ExecutiveV2({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;

  const serifFont = '"Times New Roman", Times, serif';

  return (
    <div style={{ padding: '80px', minHeight: '1122px', background: '#fcfcfc', color: '#1a1a1a', border: '20px solid #f1f5f9' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px', borderBottom: '2px double #e2e8f0', paddingBottom: '30px' }}>
        <h1 style={{ fontFamily: serifFont, fontSize: '48px', fontWeight: 400, marginBottom: '10px' }}>{data.personalInfo.fullName}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>
          <span>{data.personalInfo.location}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.email}</span>
        </div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '4px' }}>
          {data.personalInfo.jobTitle[lang]}
        </h2>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '45px' }}>
        <section>
          <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontStyle: 'italic', borderBottom: '1px solid #000', marginBottom: '20px' }}>Professional Summary</h3>
          <p style={{ fontSize: '15px', lineHeight: '1.9', textAlign: 'justify', color: '#334155' }}>{data.summary[lang]}</p>
        </section>

        <section>
          <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontStyle: 'italic', borderBottom: '1px solid #000', marginBottom: '25px' }}>Professional Experience</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{exp.company.toUpperCase()}</h4>
                  <span style={{ fontSize: '13px', fontStyle: 'italic' }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: accentColor, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                   <span>{exp.position[lang]}</span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#475569' }}>{exp.description[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          <section>
            <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontStyle: 'italic', borderBottom: '1px solid #000', marginBottom: '20px' }}>Education</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{edu.institution}</div>
                <div style={{ fontSize: '13px' }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Class of {edu.year}</div>
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ fontFamily: serifFont, fontSize: '20px', fontStyle: 'italic', borderBottom: '1px solid #000', marginBottom: '20px' }}>Key Competencies</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {data.skills.map((skill, i) => (
                <div key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }} />
                  {skill.pt}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

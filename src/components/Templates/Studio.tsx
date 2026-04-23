'use client';

import { CVData } from '@/store/useCVStore';
import { Globe, Mail, MapPin, Phone, Sparkles } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Studio({ data, lang }: TemplateProps) {
  const { accentColor, fontSize } = data.settings;

  return (
    <div
      style={{
        minHeight: '1122px',
        background:
          'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(255,255,255,1) 22%, rgba(255,255,255,1) 100%)',
        color: '#102033',
        fontSize: `${fontSize}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '-60px',
          top: '-60px',
          width: '220px',
          height: '220px',
          borderRadius: '40px',
          background: accentColor,
          opacity: 0.12,
          transform: 'rotate(18deg)',
        }}
      />

      <div style={{ padding: '54px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 220px',
            gap: '24px',
            alignItems: 'center',
            marginBottom: '42px',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '28px',
              overflow: 'hidden',
              background: '#e2e8f0',
              border: `4px solid ${accentColor}`,
              boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
            }}
          >
            {data.personalInfo.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.personalInfo.photo}
                alt={data.personalInfo.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '999px',
                background: 'rgba(15,23,42,0.05)',
                fontSize: '11px',
                fontWeight: 800,
                color: accentColor,
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              <Sparkles size={12} /> Premium Profile
            </div>
            <h1 style={{ fontSize: '42px', lineHeight: 1.05, marginBottom: '10px', fontWeight: 900 }}>
              {data.personalInfo.fullName}
            </h1>
            <h2 style={{ fontSize: '19px', color: accentColor, marginBottom: '16px', fontWeight: 700 }}>
              {data.personalInfo.jobTitle[lang]}
            </h2>
            <p style={{ lineHeight: 1.8, color: '#475569', maxWidth: '560px' }}>{data.summary[lang]}</p>
          </div>

          <div
            style={{
              background: '#0f172a',
              color: 'white',
              borderRadius: '30px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 24px 50px rgba(15,23,42,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <Mail size={14} color={accentColor} /> {data.personalInfo.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <Phone size={14} color={accentColor} /> {data.personalInfo.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
              <MapPin size={14} color={accentColor} /> {data.personalInfo.location}
            </div>
            {data.personalInfo.linkedin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <Globe size={14} color={accentColor} /> {data.personalInfo.linkedin}
              </div>
            ) : null}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.9fr', gap: '28px' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '34px',
              padding: '34px',
              boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
            }}
          >
            <h3 style={{ fontSize: '13px', color: accentColor, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Experience
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '17px' }}>{exp.position[lang]}</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{exp.period}</span>
                  </div>
                  <div style={{ color: accentColor, fontWeight: 700, marginBottom: '10px' }}>{exp.company}</div>
                  <p style={{ color: '#475569', lineHeight: 1.75 }}>{exp.description[lang]}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div
              style={{
                background: `linear-gradient(180deg, ${accentColor} 0%, #0f172a 100%)`,
                color: 'white',
                borderRadius: '30px',
                padding: '28px',
              }}
            >
              <h3 style={{ fontSize: '13px', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {data.skills.map((skill, index) => (
                  <span
                    key={`${skill.pt}-${skill.en}-${index}`}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.14)',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {skill[lang] || skill.pt || skill.en}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                background: 'white',
                borderRadius: '28px',
                padding: '28px',
                boxShadow: '0 22px 50px rgba(15,23,42,0.08)',
              }}
            >
              <h3 style={{ fontSize: '13px', color: accentColor, marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                Education
              </h3>
              {data.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 800 }}>{edu.degree[lang]}</div>
                  <div style={{ color: '#475569', marginTop: '4px' }}>{edu.institution}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

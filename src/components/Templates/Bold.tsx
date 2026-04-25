'use client';

import { CVData } from '@/store/useCVStore';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import BulletList from './_shared/BulletList';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Bold({ data, lang }: TemplateProps) {
  const { accentColor, fontSize } = data.settings;

  return (
    <div
      style={{
        minHeight: '1122px',
        background: '#fffaf8',
        color: '#111827',
        fontSize: `${fontSize}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '-120px',
          top: '-50px',
          width: '360px',
          height: '360px',
          background: accentColor,
          opacity: 0.1,
          borderRadius: '80px',
          transform: 'rotate(22deg)',
        }}
      />

      <div style={{ padding: '52px' }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '28px',
            marginBottom: '34px',
            alignItems: 'end',
          }}
        >
          <div>
            <div style={{ color: accentColor, fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '14px' }}>
              Signature Profile
            </div>
            <h1 style={{ fontSize: '52px', lineHeight: 0.95, fontWeight: 900, marginBottom: '12px', maxWidth: '560px' }}>
              {data.personalInfo.fullName}
            </h1>
            <h2 style={{ fontSize: '21px', lineHeight: 1.4, color: '#374151', marginBottom: '18px' }}>
              {data.personalInfo.jobTitle[lang]}
            </h2>
            <p style={{ maxWidth: '620px', color: '#4b5563', lineHeight: 1.9 }}>{data.summary[lang]}</p>
          </div>

          <div
            style={{
              background: '#111827',
              color: 'white',
              borderRadius: '34px',
              padding: '26px',
              position: 'relative',
              minHeight: '220px',
            }}
          >
            <div
              style={{
                width: '116px',
                height: '116px',
                borderRadius: '28px',
                overflow: 'hidden',
                border: `4px solid ${accentColor}`,
                position: 'absolute',
                top: '-34px',
                right: '26px',
                background: '#1f2937',
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

            <div style={{ marginTop: '92px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}><Mail size={14} color={accentColor} /> {data.personalInfo.email}</div>
              <div style={{ display: 'flex', gap: '10px' }}><Phone size={14} color={accentColor} /> {data.personalInfo.phone}</div>
              <div style={{ display: 'flex', gap: '10px' }}><MapPin size={14} color={accentColor} /> {data.personalInfo.location}</div>
              {data.personalInfo.website ? <div style={{ display: 'flex', gap: '10px' }}><Globe size={14} color={accentColor} /> {data.personalInfo.website}</div> : null}
            </div>
          </div>
        </header>

        <section
          style={{
            background: '#ffffff',
            border: `2px solid ${accentColor}`,
            borderRadius: '36px',
            padding: '34px',
            boxShadow: '0 26px 60px rgba(17,24,39,0.08)',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '28px' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 900, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '18px' }}>
                Experience
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 900, fontSize: '18px' }}>{exp.position[lang]}</div>
                      <div style={{ color: '#9ca3af', fontSize: '12px' }}>{exp.period}</div>
                    </div>
                    <div style={{ color: accentColor, fontWeight: 800, marginBottom: '10px' }}>{exp.company}</div>
                    <BulletList text={exp.description[lang]} lineHeight={1.8} bulletColor={accentColor} style={{ color: '#4b5563' }} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 900, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '18px' }}>
                Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {data.skills.map((skill, index) => (
                  <span
                    key={`${skill.pt}-${skill.en}-${index}`}
                    style={{
                      background: '#111827',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {skill[lang] || skill.pt || skill.en}
                  </span>
                ))}
              </div>

              <h3 style={{ fontSize: '13px', fontWeight: 900, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: '18px' }}>
                Education
              </h3>
              {data.education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800 }}>{edu.degree[lang]}</div>
                  <div style={{ color: '#4b5563', marginTop: '4px' }}>{edu.institution}</div>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>{edu.year}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#111827', color: 'white', borderRadius: '30px', padding: '24px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '16px' }}>
              Projects
            </h3>
            {data.projects.map((project) => (
              <div key={project.id}>
                <div style={{ fontWeight: 900, marginBottom: '4px' }}>{project.name}</div>
                <div style={{ color: '#fca5a5', fontSize: '12px', marginBottom: '10px' }}>{project.link}</div>
                <BulletList text={project.description[lang]} lineHeight={1.8} bulletColor="#fca5a5" style={{ color: '#d1d5db' }} />
              </div>
            ))}
          </div>

          <div style={{ background: accentColor, color: 'white', borderRadius: '30px', padding: '24px' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '16px' }}>
              Certifications
            </h3>
            {data.certifications.map((cert) => (
              <div key={cert.id} style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: 900 }}>{cert.name}</div>
                <div style={{ opacity: 0.92, marginTop: '4px' }}>{cert.issuer}</div>
                <div style={{ opacity: 0.78, fontSize: '12px', marginTop: '4px' }}>{cert.year}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

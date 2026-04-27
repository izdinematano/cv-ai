'use client';

import { CVData } from '@/store/useCVStore';
import { Mail, Phone, MapPin } from 'lucide-react';
import BulletList from './_shared/BulletList';
import { labels, fallbackPhoto, getInitials } from './_shared/TemplateUtils';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function Creative({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;

  return (
    <div style={{ display: 'flex', minHeight: '1122px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Shapes */}
      <div style={{ 
        position: 'absolute', 
        top: '-100px', 
        left: '-100px', 
        width: '300px', 
        height: '300px', 
        background: accentColor, 
        opacity: 0.1, 
        borderRadius: '50%',
        zIndex: 0 
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        right: '-40px',
        width: '200px',
        height: '200px',
        background: accentColor,
        opacity: 0.06,
        borderRadius: '50%',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '280px',
        width: '2px',
        height: '120px',
        background: `linear-gradient(to bottom, ${accentColor}22, transparent)`,
        zIndex: 0,
      }} />
      <svg style={{ position: 'absolute', bottom: 30, left: 20, opacity: 0.08, zIndex: 0 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" /></svg>

      {/* Left Sidebar (Darker/Colored) */}
      <div style={{ 
        width: '300px', 
        background: '#1e293b', 
        color: 'white', 
        padding: '60px 35px', 
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        <div>
          <div style={{ 
            width: '160px', 
            height: '160px', 
            borderRadius: '24px', 
            background: 'rgba(255,255,255,0.1)', 
            border: `4px solid ${accentColor}`,
            marginBottom: '30px',
            overflow: 'hidden'
          }}>
            {data.personalInfo.photo ? (
              <img src={data.personalInfo.photo} alt={data.personalInfo.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>
                {getInitials(data.personalInfo.fullName)}
              </div>
            )}
          </div>
          
          <h1 style={{ fontSize: '28px', fontWeight: 800, lineHeight: '1.2', marginBottom: '10px' }}>
            {data.personalInfo.fullName}
          </h1>
          <p style={{ fontSize: '14px', color: accentColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {data.personalInfo.jobTitle[lang]}
          </p>
        </div>

        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '15px' }}>{labels.contact[lang]}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '11px', color: '#cbd5e1' }}>
            {data.personalInfo.email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color={accentColor} /> {data.personalInfo.email}</div>}
            {data.personalInfo.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color={accentColor} /> {data.personalInfo.phone}</div>}
            {data.personalInfo.location && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} color={accentColor} /> {data.personalInfo.location}</div>}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', borderBottom: `2px solid ${accentColor}`, paddingBottom: '8px', marginBottom: '15px' }}>{labels.skills[lang]}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.skills.map((skill, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '100px', fontSize: '10px' }}>{skill[lang] || skill.pt || skill.en}</span>
            ))}
          </div>
        </section>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '60px 50px', background: 'white', zIndex: 1 }}>
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
             {labels.profile[lang]}
          </h2>
          <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#475569' }}>{data.summary[lang]}</p>
        </section>

        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '25px', borderLeft: `5px solid ${accentColor}`, paddingLeft: '15px' }}>{labels.experience[lang]}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{exp.position[lang]}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{exp.period}</span>
                </div>
                <div style={{ fontSize: '14px', color: accentColor, fontWeight: 700, marginBottom: '10px' }}>{exp.company}</div>
                <BulletList text={exp.description[lang]} fontSize={13} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#64748b' }} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '25px', borderLeft: `5px solid ${accentColor}`, paddingLeft: '15px' }}>{labels.education[lang]}</h2>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{edu.degree[lang]}</h3>
              <div style={{ fontSize: '13px', color: '#475569' }}>{edu.institution} | {edu.year}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

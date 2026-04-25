'use client';

import { CVData } from '@/store/useCVStore';
import { Star, Zap } from 'lucide-react';
import BulletList from './_shared/BulletList';

interface TemplateProps {
  data: CVData;
  lang: 'pt' | 'en';
}

export default function CreativeV2({ data, lang }: TemplateProps) {
  const { accentColor } = data.settings;

  return (
    <div style={{ minHeight: '1122px', background: '#ffffff', color: '#1e293b', position: 'relative', overflow: 'hidden' }}>
      {/* Top Banner with Gradient */}
      <div style={{ 
        height: '280px', 
        background: `linear-gradient(135deg, ${accentColor} 0%, #1e293b 100%)`, 
        padding: '60px',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>{data.personalInfo.fullName}</h1>
          <h2 style={{ fontSize: '20px', fontWeight: 500, opacity: 0.9, letterSpacing: '2px' }}>{data.personalInfo.jobTitle[lang].toUpperCase()}</h2>
        </div>
        
        {/* Abstract Circle */}
        <div style={{ 
          position: 'absolute', 
          right: '-50px', 
          top: '-50px', 
          width: '300px', 
          height: '300px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '50%',
          zIndex: 0
        }} />
      </div>

      <div style={{ padding: '40px 60px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '50px' }}>
        {/* Left Col */}
        <div>
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Zap size={20} color={accentColor} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase' }}>My Profile</h3>
            </div>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#475569' }}>{data.summary[lang]}</p>
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
              <Star size={20} color={accentColor} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase' }}>Experience</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {data.experience.map((exp) => (
                <div key={exp.id} className="glass-card" style={{ padding: '24px', background: '#f8fafc', border: 'none', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{exp.position[lang]}</h4>
                    <span style={{ fontSize: '11px', background: accentColor, color: 'white', padding: '4px 10px', borderRadius: '20px' }}>{exp.period}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: accentColor, marginBottom: '12px' }}>{exp.company}</div>
                  <BulletList text={exp.description[lang]} fontSize={13} lineHeight={1.6} bulletColor={accentColor} style={{ color: '#64748b' }} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col */}
        <div>
          <section style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', borderBottom: `3px solid ${accentColor}`, display: 'inline-block' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>{data.personalInfo.email}</div>
              <div>{data.personalInfo.phone}</div>
              <div>{data.personalInfo.location}</div>
            </div>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', borderBottom: `3px solid ${accentColor}`, display: 'inline-block' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {data.skills.map((skill, i) => (
                <div key={i} style={{ background: '#f1f5f9', padding: '8px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{skill[lang] || skill.pt || skill.en}</div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', borderBottom: `3px solid ${accentColor}`, display: 'inline-block' }}>Education</h3>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{edu.degree[lang]}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{edu.institution}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

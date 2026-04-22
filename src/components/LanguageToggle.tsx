'use client';

import { useCVStore } from '@/store/useCVStore';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { activeLanguage, setLanguage } = useCVStore();

  return (
    <div className="glass-card" style={{ padding: '4px', display: 'flex', gap: '4px' }}>
      <button
        onClick={() => setLanguage('pt')}
        style={{
          padding: '6px 12px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          background: activeLanguage === 'pt' ? 'var(--accent)' : 'transparent',
          color: activeLanguage === 'pt' ? 'white' : 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '18px' }}>🇵🇹</span> PT
      </button>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '6px 12px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          background: activeLanguage === 'en' ? 'var(--accent)' : 'transparent',
          color: activeLanguage === 'en' ? 'white' : 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '18px' }}>🇬🇧</span> EN
      </button>
    </div>
  );
}

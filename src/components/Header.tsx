'use client';

import LanguageToggle from './LanguageToggle';
import { FileDown, Sparkles } from 'lucide-react';
import { useCVStore } from '@/store/useCVStore';
import { pdf } from '@react-pdf/renderer';
import { CVDocument } from './Export/PDFDocument';
import { saveAs } from 'file-saver';

export default function Header() {
  const { data, activeLanguage } = useCVStore();

  const handleDownload = async (lang: 'pt' | 'en') => {
    try {
      const blob = await pdf(<CVDocument data={data} lang={lang} />).toBlob();
      const fileName = `CV_${data.personalInfo.fullName.replace(/\s+/g, '_') || 'Profissional'}_${lang.toUpperCase()}.pdf`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('PDF Generation error:', error);
      alert('Erro ao gerar o PDF. Por favor tente novamente.');
    }
  };

  return (
    <header style={{ 
      padding: '16px 32px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--card-border)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(10px)',
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: 'var(--accent)', 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--accent-glow)'
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          CV-Gen <span style={{ color: 'var(--accent)' }}>AI</span>
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <LanguageToggle />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-outline" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            onClick={() => handleDownload('pt')}
          >
            <FileDown size={18} /> PT.pdf
          </button>
          <button 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            onClick={() => handleDownload('en')}
          >
            <FileDown size={18} /> EN.pdf
          </button>
        </div>
      </div>
    </header>
  );
}

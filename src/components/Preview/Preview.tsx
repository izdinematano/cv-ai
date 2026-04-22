'use client';

import { useCVStore } from '@/store/useCVStore';
import Minimalist from '../Templates/Minimalist';
import Corporate from '../Templates/Corporate';

export default function Preview() {
  const { data, activeLanguage } = useCVStore();
  const { template } = data.settings;

  const renderTemplate = () => {
    switch (template) {
      case 'corporate':
        return <Corporate data={data} lang={activeLanguage} />;
      case 'minimalist':
      default:
        return <Minimalist data={data} lang={activeLanguage} />;
    }
  };

  return (
    <div className="preview-container" style={{ padding: '40px', height: '100%', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
      <div className="a4-page" style={{ 
        width: '100%', 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: 'white', 
        minHeight: '1122px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        borderRadius: '2px',
        position: 'relative'
      }}>
        {renderTemplate()}
      </div>
    </div>
  );
}

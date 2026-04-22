'use client';

import { useCVStore } from '@/store/useCVStore';
import Minimalist from '../Templates/Minimalist';
import MinimalistV2 from '../Templates/MinimalistV2';
import Corporate from '../Templates/Corporate';
import CorporateV2 from '../Templates/CorporateV2';
import Creative from '../Templates/Creative';
import CreativeV2 from '../Templates/CreativeV2';
import Executive from '../Templates/Executive';
import ExecutiveV2 from '../Templates/ExecutiveV2';

export default function Preview() {
  const { data, activeLanguage } = useCVStore();
  const template = data?.settings?.template || 'minimalist';

  const renderTemplate = () => {
    switch (template) {
      case 'corporate':
        return <Corporate data={data} lang={activeLanguage} />;
      case 'corporate-v2':
        return <CorporateV2 data={data} lang={activeLanguage} />;
      case 'creative':
        return <Creative data={data} lang={activeLanguage} />;
      case 'creative-v2':
        return <CreativeV2 data={data} lang={activeLanguage} />;
      case 'executive':
        return <Executive data={data} lang={activeLanguage} />;
      case 'executive-v2':
        return <ExecutiveV2 data={data} lang={activeLanguage} />;
      case 'minimalist-v2':
        return <MinimalistV2 data={data} lang={activeLanguage} />;
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

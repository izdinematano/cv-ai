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
import Tech from '../Templates/Tech';
import Modern from '../Templates/Modern';
import Student from '../Templates/Student';

export default function Preview() {
  const { data, activeLanguage } = useCVStore();
  const template = data?.settings?.template || 'minimalist';

  const renderTemplate = () => {
    switch (template) {
      case 'corporate': return <Corporate data={data} lang={activeLanguage} />;
      case 'corporate-v2': return <CorporateV2 data={data} lang={activeLanguage} />;
      case 'creative': return <Creative data={data} lang={activeLanguage} />;
      case 'creative-v2': return <CreativeV2 data={data} lang={activeLanguage} />;
      case 'executive': return <Executive data={data} lang={activeLanguage} />;
      case 'executive-v2': return <ExecutiveV2 data={data} lang={activeLanguage} />;
      case 'minimalist-v2': return <MinimalistV2 data={data} lang={activeLanguage} />;
      case 'tech': return <Tech data={data} lang={activeLanguage} />;
      case 'modern': return <Modern data={data} lang={activeLanguage} />;
      case 'student': return <Student data={data} lang={activeLanguage} />;
      case 'minimalist':
      default:
        return <Minimalist data={data} lang={activeLanguage} />;
    }
  };

  return (
    <div style={{ transformOrigin: 'top center' }}>
      {renderTemplate()}
    </div>
  );
}

'use client';

import { type CVData, useCVStore } from '@/store/useCVStore';
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

export const renderTemplateById = (
  template: string,
  data: CVData,
  lang: 'pt' | 'en'
) => {
  switch (template) {
    case 'corporate':
      return <Corporate data={data} lang={lang} />;
    case 'corporate-v2':
      return <CorporateV2 data={data} lang={lang} />;
    case 'creative':
      return <Creative data={data} lang={lang} />;
    case 'creative-v2':
      return <CreativeV2 data={data} lang={lang} />;
    case 'executive':
      return <Executive data={data} lang={lang} />;
    case 'executive-v2':
      return <ExecutiveV2 data={data} lang={lang} />;
    case 'minimalist-v2':
      return <MinimalistV2 data={data} lang={lang} />;
    case 'tech':
      return <Tech data={data} lang={lang} />;
    case 'modern':
      return <Modern data={data} lang={lang} />;
    case 'student':
      return <Student data={data} lang={lang} />;
    case 'minimalist':
    default:
      return <Minimalist data={data} lang={lang} />;
  }
};

interface PreviewProps {
  dataOverride?: CVData;
  langOverride?: 'pt' | 'en';
  templateOverride?: string;
}

export default function Preview({
  dataOverride,
  langOverride,
  templateOverride,
}: PreviewProps) {
  const store = useCVStore();
  const data = dataOverride || store.data;
  const activeLanguage = langOverride || store.activeLanguage;
  const template = templateOverride || data?.settings?.template || 'minimalist';

  return (
    <div style={{ transformOrigin: 'top center' }}>
      {renderTemplateById(template, data, activeLanguage)}
    </div>
  );
}

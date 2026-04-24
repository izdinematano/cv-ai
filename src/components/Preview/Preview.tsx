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
import Studio from '../Templates/Studio';
import Atlas from '../Templates/Atlas';
import Bold from '../Templates/Bold';
import Resume1 from '../Templates/Resume1/Resume1';
import Resume2 from '../Templates/Resume2/Resume2';
import Resume3 from '../Templates/Resume3/Resume3';
import CV5 from '../Templates/CV5/CV5';
import CV6 from '../Templates/CV6/CV6';
import CV7 from '../Templates/CV7/CV7';

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
    case 'studio':
      return <Studio data={data} lang={lang} />;
    case 'atlas':
      return <Atlas data={data} lang={lang} />;
    case 'bold':
      return <Bold data={data} lang={lang} />;
    case 'resume1':
      return <Resume1 data={data} lang={lang} />;
    case 'resume2':
      return <Resume2 data={data} lang={lang} />;
    case 'resume3':
      return <Resume3 data={data} lang={lang} />;
    case 'cv5':
      return <CV5 data={data} lang={lang} />;
    case 'cv6-dark':
      return <CV6 data={data} lang={lang} variant="dark" />;
    case 'cv6-light':
      return <CV6 data={data} lang={lang} variant="light" />;
    case 'cv7':
      return <CV7 data={data} lang={lang} />;
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

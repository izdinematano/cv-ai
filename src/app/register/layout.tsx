import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Criar conta',
  description: `Regista-te no ${siteConfig.name}. Cria e exporta CVs profissionais com IA em minutos.`,
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

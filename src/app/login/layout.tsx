import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Entrar',
  description: `Iniciar sessão no ${siteConfig.name}. Cria e exporta CVs profissionais com IA.`,
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

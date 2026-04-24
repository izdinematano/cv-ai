import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: 'Editor de CV',
  description: `Editor bilingue PT/EN com sugestões de IA, templates premium e exportação PDF pixel-perfect. ${siteConfig.description}`,
  robots: { index: false, follow: false },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

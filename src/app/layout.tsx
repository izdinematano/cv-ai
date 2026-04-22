import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI CV Generator | Profissional & Multilingue",
  description: "Crie o seu currículo profissional em minutos com tradução inteligente para Inglês e Português. Focado no mercado internacional.",
  keywords: ["CV", "Currículo", "Resume", "IA", "AI", "Gerador de CV", "Multilingue", "Moçambique", "Trabalho remoto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

# CV-Gen AI 🚀

Uma aplicação web moderna, responsiva e inteligente para geração automática de currículos profissionais, com suporte nativo a múltiplos idiomas (Português e Inglês).

## ✨ Funcionalidades

- **🔄 CV Multilingue Inteligente**: Crie o seu CV em um idioma e converta instantaneamente para o outro com IA.
- **🧠 IA Contextual (OpenRouter)**: Tradução profissional que adapta termos técnicos e cargos ao mercado internacional (não é tradução literal).
- **🎨 Design Premium**: Interface inspirada em Glassmorphism, otimizada para Desktop e Mobile.
- **📄 Exportação PDF**: Download instantâneo de versões profissionais em PDF (CV_PT.pdf e CV_EN.pdf).
- **💡 Sugestões Inteligentes**: Dicas automáticas para otimizar o seu perfil para vagas internacionais.

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estado**: Zustand (com persistência local)
- **Estilo**: Vanilla CSS + Framer Motion
- **IA**: OpenRouter (Claude 3.5 Sonnet / Gemini 2.0)
- **PDF**: @react-pdf/renderer

## 🚀 Como Executar

1. **Clonar o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd cv-gen-ai
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente**:
   Crie um arquivo `.env.local` na raiz e adicione a sua chave do OpenRouter:
   ```env
   NEXT_PUBLIC_OPENROUTER_API_KEY=sua_chave_aqui
   ```

4. **Executar em Desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🌐 Deployment (Vercel)

Para fazer o deploy na Vercel:

1. Suba o código para o GitHub.
2. Importe o projeto na [Vercel](https://vercel.com).
3. Adicione a variável de ambiente `NEXT_PUBLIC_OPENROUTER_API_KEY` nas configurações do projeto.
4. Clique em **Deploy**.

## 📝 Licença

Este projeto foi desenvolvido como parte de um desafio de engenharia de software e IA.

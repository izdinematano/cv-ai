import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <header style={{ borderBottom: '1px solid var(--card-border)', padding: '20px 24px' }}>
        <div className="container-narrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)', textDecoration: 'none' }}>
            {siteConfig.name}
          </Link>
          <Link href="/" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none' }}>
            Voltar
          </Link>
        </div>
      </header>

      <main className="container-narrow" style={{ padding: '48px 24px', maxWidth: 720 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Termos e Condições</h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: 40, fontSize: 14 }}>
          Última atualização: {new Date().toLocaleDateString('pt-PT')}
        </p>

        <article style={{ display: 'flex', flexDirection: 'column', gap: 32, lineHeight: 1.7, fontSize: 15, color: 'var(--foreground-muted)' }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>1. Aceitação dos Termos</h2>
            <p>
              Ao aceder e utilizar o {siteConfig.name}, concordas em cumprir estes Termos e Condições.
              Se não concordares com alguma parte destes termos, não deves utilizar a plataforma.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>2. Descrição do Serviço</h2>
            <p>
              O {siteConfig.name} é uma plataforma de criação de currículos profissionais com suporte
              bilingue (Português/Inglês) e assistência de inteligência artificial. O serviço inclui
              templates premium, sugestões de conteúdo e exportação em PDF.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>3. Contas de Utilizador</h2>
            <p>
              Para aceder a determinadas funcionalidades, podes necessitar de criar uma conta.
              És responsável por manter a confidencialidade das tuas credenciais e por todas as
              atividades associadas à tua conta.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>4. Uso da Inteligência Artificial</h2>
            <p>
              A plataforma utiliza modelos de IA (Google Gemini) para gerar sugestões de conteúdo
              e melhorias de texto. As sugestões de IA são apenas orientativas e devem ser
              revistas pelo utilizador antes de inclusão no currículo final.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>5. Propriedade Intelectual</h2>
            <p>
              O conteúdo que crias e exportas através da plataforma é de tua propriedade.
              Os templates, design e código da plataforma são propriedade do {siteConfig.name}.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>6. Limitação de Responsabilidade</h2>
            <p>
              O {siteConfig.name} é fornecido &quot;como está&quot;. Não garantimos que o serviço
              estará sempre disponível ou livre de erros. Não somos responsáveis por decisões
              de contratação tomadas por terceiros com base nos currículos gerados.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>7. Alterações aos Termos</h2>
            <p>
              Reservamo-nos o direito de atualizar estes termos a qualquer momento.
              As alterações entram em vigor imediatamente após publicação.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>8. Contacto</h2>
            <p>
              Para questões sobre estes termos, contacta-nos através do e-mail
              suporte@moztraders.com.
            </p>
          </section>
        </article>
      </main>

      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '24px', textAlign: 'center', fontSize: 13, color: 'var(--muted-foreground)' }}>
        © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
      </footer>
    </div>
  );
}

import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Política de Privacidade</h1>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: 40, fontSize: 14 }}>
          Última atualização: {new Date().toLocaleDateString('pt-PT')}
        </p>

        <article style={{ display: 'flex', flexDirection: 'column', gap: 32, lineHeight: 1.7, fontSize: 15, color: 'var(--foreground-muted)' }}>
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>1. Introdução</h2>
            <p>
              O {siteConfig.name} valoriza a tua privacidade. Esta política explica como
              recolhemos, utilizamos e protegemos os teus dados pessoais quando utilizas a nossa plataforma.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>2. Dados que Recolhemos</h2>
            <p>Podemos recolher os seguintes dados:</p>
            <ul style={{ marginTop: 8, paddingLeft: 24 }}>
              <li>Informações de perfil (nome, e-mail, número de telefone)</li>
              <li>Dados do currículo (experiência, educação, competências, etc.)</li>
              <li>Dados de utilização (templates escolhidos, interações com a plataforma)</li>
              <li>Informações técnicas (endereço IP, tipo de navegador, cookies)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>3. Uso dos Dados</h2>
            <p>Utilizamos os teus dados para:</p>
            <ul style={{ marginTop: 8, paddingLeft: 24 }}>
              <li>Fornecer e melhorar o serviço de criação de CVs</li>
              <li>Gerar sugestões de conteúdo através de IA</li>
              <li>Personalizar a experiência do utilizador</li>
              <li>Enviar comunicações sobre o serviço (quando autorizado)</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>4. Inteligência Artificial e Dados</h2>
            <p>
              As sugestões de IA são processadas através da API do Google Gemini.
              O texto que submetes para melhoria é enviado anonimamente (sem identificadores
              pessoais) aos servidores da Google. Não armazenamos o histórico das tuas
              interações com a IA.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>5. Armazenamento e Segurança</h2>
            <p>
              Os teus dados são armazenados em servidores seguros. Utilizamos encriptação
              em trânsito (HTTPS) e implementamos medidas de segurança para proteger contra
              acesso não autorizado. No entanto, nenhum sistema é 100% seguro.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>6. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma e cookies
              analíticos para compreender como os utilizadores interagem com o site.
              Podes gerir as preferências de cookies nas definições do teu navegador.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>7. Os teus Direitos</h2>
            <p>Tens o direito de:</p>
            <ul style={{ marginTop: 8, paddingLeft: 24 }}>
              <li>Aceder aos teus dados pessoais</li>
              <li>Corrigir dados inexatos</li>
              <li>Solicitar a eliminação dos teus dados</li>
              <li>Exportar os teus dados (portabilidade)</li>
              <li>Opor-te ao processamento de dados</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>8. Retenção de Dados</h2>
            <p>
              Conservamos os teus dados enquanto mantiveres uma conta ativa.
              Após a eliminação da conta, os dados são removidos no prazo de 30 dias,
              salvo obrigações legais de retenção.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>9. Alterações à Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos alterações
              significativas através da plataforma ou por e-mail.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--foreground)', marginBottom: 12 }}>10. Contacto</h2>
            <p>
              Para questões sobre privacidade, contacta-nos através do e-mail
              privacidade@moztraders.com.
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

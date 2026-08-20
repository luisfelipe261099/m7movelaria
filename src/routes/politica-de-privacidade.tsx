import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/PageParts";
import { pageSeo, EMAIL, PHONE_LOCAL, STREET_ADDRESS, CITY, REGION } from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";

const PATH = "/politica-de-privacidade";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Política de privacidade", path: PATH },
];

/**
 * A política descreve exatamente o que este site faz hoje: nenhum formulário,
 * nenhum cookie próprio, nenhuma ferramenta de analytics. Se um dia entrar GA4,
 * pixel ou formulário de contato, ESTA PÁGINA precisa ser atualizada junto —
 * política que não corresponde ao site é pior do que não ter política.
 */
export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    ...pageSeo({
      title: "Política de Privacidade | M7 Movelaria",
      description:
        "Como a M7 Movelaria trata os dados de quem entra em contato pelo site, por WhatsApp ou por e-mail, conforme a LGPD.",
      path: PATH,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: "Política de privacidade",
          description: "Tratamento de dados pessoais pela M7 Movelaria, conforme a LGPD.",
          breadcrumb: TRAIL,
        }),
      ]),
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <section className="max-w-3xl mx-auto px-6 pt-8 pb-20">
          <Breadcrumbs trail={TRAIL} />
          <h1 className="mt-8 text-4xl md:text-5xl font-bold text-ink leading-[1.1]">
            Política de privacidade
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Aplica-se ao site m7movelaria.com.br e aos canais de atendimento da M7 Movelaria.
          </p>

          <div className="mt-10 space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-ink">Quais dados coletamos</h2>
              <p className="mt-3">
                Este site não possui formulário de cadastro, não cria conta de usuário e não coleta
                dados automaticamente para fins de publicidade. Não utilizamos cookies próprios,
                ferramentas de analytics nem pixels de rastreamento de redes sociais.
              </p>
              <p className="mt-3">
                Os dados que a M7 Movelaria trata são apenas os que você mesmo envia ao entrar em
                contato — normalmente nome, telefone, e-mail, endereço do imóvel e as informações do
                projeto (plantas, medidas, fotos e referências).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">Para que usamos</h2>
              <p className="mt-3">
                Esses dados são usados exclusivamente para responder ao seu contato, elaborar o
                orçamento e o projeto, executar o serviço contratado e prestar atendimento
                pós-instalação. Não vendemos, alugamos nem cedemos seus dados para terceiros com
                finalidade comercial.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">Serviços de terceiros</h2>
              <p className="mt-3">
                Os botões de contato do site levam ao WhatsApp e ao seu aplicativo de e-mail. A
                partir do momento em que você usa o WhatsApp, a conversa passa a ser regida também
                pela política de privacidade da Meta, sobre a qual não temos controle.
              </p>
              <p className="mt-3">
                O site é hospedado em infraestrutura de terceiros, que, como qualquer servidor web,
                mantém registros técnicos de acesso (como endereço IP e horário da requisição) para
                fins de segurança e funcionamento do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">Por quanto tempo guardamos</h2>
              <p className="mt-3">
                Mantemos as informações de projeto pelo tempo necessário para o atendimento, para
                eventual assistência posterior e para cumprir obrigações legais e fiscais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">Seus direitos</h2>
              <p className="mt-3">
                Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar
                a qualquer momento a confirmação de tratamento, o acesso, a correção, a
                portabilidade, a anonimização ou a exclusão dos seus dados, além de revogar
                consentimento. Basta pedir por um dos canais abaixo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">Como falar sobre privacidade</h2>
              <address className="mt-3 not-italic">
                M7 Movelaria — {STREET_ADDRESS}, {CITY} - {REGION}
                <br />
                E-mail:{" "}
                <a href={`mailto:${EMAIL}`} className="text-bronze underline underline-offset-2">
                  {EMAIL}
                </a>
                <br />
                WhatsApp:{" "}
                <a href="tel:+5541987116308" className="text-bronze underline underline-offset-2">
                  {PHONE_LOCAL}
                </a>
              </address>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink">Alterações</h2>
              <p className="mt-3">
                Se o site passar a usar cookies, analytics ou formulários, esta política será
                atualizada antes da mudança entrar no ar.
              </p>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

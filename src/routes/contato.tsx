import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Mail, MapPin, Clock, Phone } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/PageParts";
import { whatsappLink } from "@/lib/whatsapp";
import {
  pageSeo,
  canonical,
  EMAIL,
  PHONE_E164,
  PHONE_LOCAL,
  STREET_ADDRESS,
  CITY,
  REGION,
  ID_BUSINESS,
} from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";

const PATH = "/contato";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Contato", path: PATH },
];

export const Route = createFileRoute("/contato")({
  head: () => ({
    ...pageSeo({
      title: "Contato e Endereço em São José dos Pinhais | M7 Movelaria",
      description:
        "Contato da M7 Movelaria: WhatsApp, e-mail e endereço do ateliê na R. Henrique Bortolam, 182, Costeira, São José dos Pinhais. Atendemos Curitiba e região.",
      path: PATH,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: "Contato e orçamento — M7 Movelaria",
          description:
            "Canais de atendimento da M7 Movelaria: WhatsApp, e-mail e endereço do ateliê em São José dos Pinhais.",
          breadcrumb: TRAIL,
        }),
        {
          "@type": "ContactPage",
          "@id": `${canonical(PATH)}#contactpage`,
          url: canonical(PATH),
          mainEntity: { "@id": ID_BUSINESS },
        },
      ]),
    ],
  }),
  component: Contact,
});

/**
 * NAP em texto, não em imagem. É a página que o Google mais usa para casar o
 * site com o Perfil da Empresa — e o casamento só acontece se endereço,
 * telefone e nome estiverem escritos exatamente como no perfil.
 */
function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-cream">
          <div className="max-w-3xl mx-auto px-6 pt-8 pb-14 text-center">
            <div className="text-left">
              <Breadcrumbs trail={TRAIL} />
            </div>
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-bronze mb-4">Contato</p>
            <h1 className="text-4xl md:text-5xl font-bold text-ink leading-[1.1] text-balance">
              Peça um orçamento de móveis planejados
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
              Envie os detalhes do seu projeto — ambientes, planta ou medidas, prazo e referências.
              Nossa equipe retorna com as próximas etapas e agenda a visita técnica.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href={whatsappLink("Olá M7 Movelaria, gostaria de solicitar um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-bronze text-primary-foreground rounded text-sm font-medium hover:bg-bronze-dark transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden /> WhatsApp {PHONE_LOCAL}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-bronze text-bronze rounded text-sm font-medium hover:bg-bronze hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-4 h-4" aria-hidden /> Enviar e-mail
              </a>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6 grid gap-8 md:grid-cols-3">
            <div className="border border-border rounded p-6">
              <MapPin className="w-5 h-5 text-bronze" aria-hidden />
              <h2 className="mt-4 font-semibold text-ink">Ateliê</h2>
              <address className="mt-2 not-italic text-sm text-muted-foreground leading-relaxed">
                {STREET_ADDRESS}
                <br />
                {CITY} - {REGION}
              </address>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Visita combinada previamente, para garantir que haja alguém disponível para te
                acompanhar.
              </p>
            </div>
            <div className="border border-border rounded p-6">
              <Phone className="w-5 h-5 text-bronze" aria-hidden />
              <h2 className="mt-4 font-semibold text-ink">Telefone e WhatsApp</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <a href={`tel:${PHONE_E164}`} className="text-bronze underline underline-offset-2">
                  {PHONE_LOCAL}
                </a>
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                O WhatsApp é o canal mais rápido — dá para mandar planta, foto e medidas na mesma
                conversa.
              </p>
            </div>
            <div className="border border-border rounded p-6">
              <Clock className="w-5 h-5 text-bronze" aria-hidden />
              <h2 className="mt-4 font-semibold text-ink">Atendimento</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Segunda a sexta: 8h às 18h
                <br />
                Sábado: 8h às 12h
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                <a href={`mailto:${EMAIL}`} className="text-bronze hover:underline break-all">
                  {EMAIL}
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-cream py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              O que acelera o seu orçamento
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                "A planta do imóvel, mesmo que seja foto do papel ou print do PDF",
                "As medidas aproximadas do ambiente, se não houver planta",
                "Fotos do espaço como ele está hoje",
                "Referências do que você gosta — print de Pinterest e Instagram servem",
                "Se já houver projeto de arquitetura, o detalhamento da marcenaria",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-ink leading-relaxed">
                  <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-bronze shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Ainda em dúvida sobre prazo, material ou como funciona o processo? As{" "}
              <Link to="/perguntas-frequentes" className="text-bronze underline underline-offset-2">
                perguntas frequentes
              </Link>{" "}
              respondem a maioria delas, e a página{" "}
              <Link to="/sobre" className="text-bronze underline underline-offset-2">
                sobre a M7
              </Link>{" "}
              mostra o processo etapa por etapa.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

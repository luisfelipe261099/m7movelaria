import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Breadcrumbs, ContentSection, CtaBand } from "@/components/PageParts";
import { Picture } from "@/components/Picture";
import { pageSeo, STREET_ADDRESS, CITY, REGION, PHONE_E164, PHONE_LOCAL, EMAIL } from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";

const PATH = "/sobre";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Sobre a M7", path: PATH },
];

/**
 * Página de E-E-A-T: quem executa, onde fica, como trabalha.
 *
 * Tudo aqui é verificável a partir do que a M7 já publica (endereço, horário,
 * canais, ferragens e acabamentos usados) ou é descrição do próprio processo.
 * Não entra tempo de mercado, número de obras nem prêmio — se o cliente
 * confirmar esses dados depois, este é o lugar de acrescentar.
 */
const PROCESS = [
  {
    n: "01",
    title: "Primeiro contato",
    body: "Você manda os ambientes, o prazo e as referências pelo WhatsApp. Já nessa conversa dá para dizer o que é viável e o que precisa ser repensado antes de gastar tempo com desenho.",
  },
  {
    n: "02",
    title: "Visita técnica e medição",
    body: "Vamos ao local medir. Registramos prumo, esquadro e nível reais, além de pontos de elétrica, água e gás — porque é a medida do local, e não a da planta, que define o corte.",
  },
  {
    n: "03",
    title: "Projeto executivo",
    body: "Desenhamos as vistas de cada parede com a especificação de materiais, ferragens e iluminação. É onde as decisões acontecem: altura de bancada, tipo de porta, organização interna.",
  },
  {
    n: "04",
    title: "Ajustes e aprovação",
    body: "O projeto volta para você — e para o arquiteto, quando houver. Ajustamos até fechar. Só depois da aprovação o orçamento vira produção.",
  },
  {
    n: "05",
    title: "Produção no ateliê",
    body: "As peças são cortadas, usinadas e montadas no nosso ateliê em São José dos Pinhais, com a ferragem já especificada no projeto.",
  },
  {
    n: "06",
    title: "Instalação e regulagem",
    body: "Nossa equipe instala e faz a regulagem final de portas e gavetas. O móvel sai do ateliê com folga técnica justamente para ser ajustado ao local.",
  },
];

export const Route = createFileRoute("/sobre")({
  head: () => ({
    ...pageSeo({
      title: "Sobre a M7 Movelaria — Marcenaria em São José dos Pinhais",
      description:
        "Quem é a M7 Movelaria: marcenaria de alto padrão em São José dos Pinhais, com projeto executivo próprio, produção no ateliê e instalação com equipe própria.",
      path: PATH,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: "Sobre a M7 Movelaria",
          description:
            "Marcenaria de alto padrão em São José dos Pinhais: projeto executivo, produção no ateliê e instalação com equipe própria.",
          breadcrumb: TRAIL,
        }),
      ]),
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-cream">
          <div className="max-w-7xl mx-auto px-6 pt-8 pb-14">
            <Breadcrumbs trail={TRAIL} />
            <div className="mt-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-bronze mb-4">Sobre a M7</p>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] text-ink text-balance">
                  Uma marcenaria, não uma revenda de móveis
                </h1>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    A M7 Movelaria é uma marcenaria de alto padrão em São José dos Pinhais, no
                    Paraná. Projetamos, produzimos no nosso próprio ateliê e instalamos com equipe
                    própria — as três etapas na mesma casa.
                  </p>
                  <p>
                    Isso não é detalhe de vitrine: é o que permite corrigir uma medida a partir do
                    que a parede realmente é, ajustar um detalhe depois do projeto aprovado sem
                    passar por três fornecedores, e responder pelo resultado sem repassar a
                    responsabilidade para o instalador terceirizado.
                  </p>
                  <p>
                    Atendemos projetos residenciais e comerciais em São José dos Pinhais, Curitiba e
                    região metropolitana, tanto diretamente com o cliente quanto em parceria com
                    arquitetos e escritórios de interiores.
                  </p>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded shadow-lg">
                <Picture
                  name="hero-showroom-3d"
                  alt="Vista isométrica em 3D de ambientes com marcenaria planejada da M7 Movelaria"
                  priority
                  className="w-full h-full object-cover"
                  sizes="(min-width: 1024px) 46vw, 100vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              Como um projeto acontece, da conversa à instalação
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
              O processo é o mesmo para uma cozinha ou para uma casa inteira. O que muda é o tamanho
              de cada etapa.
            </p>
            <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PROCESS.map((p) => (
                <li key={p.n} className="border border-border rounded p-6">
                  <span className="font-display text-3xl text-bronze">{p.n}</span>
                  <h3 className="mt-3 font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <ContentSection
          tone="cream"
          h2="O que definimos por padrão em todo projeto"
          bullets={[
            "Chapa de MDF escolhida por função — 15, 18 ou 25 mm conforme a peça vai receber carga, vão livre ou apenas fechamento",
            "Ferragens Blum, Häfele e Salice, com amortecimento e regulagem em três eixos",
            "Perfis e sistemas deslizantes Rometal e Siforma nas portas de correr",
            "Acabamento em MDF revestido, laca fosca ou lâmina natural com encaixe em 45°",
            "Serralheria sob medida integrada quando o projeto pede estrutura metálica",
            "Iluminação em LED 3000K ou 5000K especificada por ambiente e por função",
          ]}
        />

        <ContentSection
          h2="Trabalhamos com arquitetos"
          body="Quando existe projeto de arquitetura, executamos conforme o detalhamento e devolvemos a compatibilização — apontando onde a medida real do local diverge do desenho e o que isso exige de ajuste antes do corte. É o tipo de retorno que evita a surpresa no dia da instalação. Escritórios que quiserem conhecer o padrão de execução podem agendar uma visita ao ateliê."
        />

        <section className="bg-cream py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">Onde estamos</h2>
            <address className="mt-6 not-italic text-muted-foreground leading-relaxed">
              <p className="text-ink font-semibold">M7 Movelaria</p>
              <p className="mt-2">
                {STREET_ADDRESS}
                <br />
                {CITY} - {REGION}
              </p>
              <p className="mt-3">
                WhatsApp e telefone:{" "}
                <a href={`tel:${PHONE_E164}`} className="text-bronze underline underline-offset-2">
                  {PHONE_LOCAL}
                </a>
                <br />
                E-mail:{" "}
                <a href={`mailto:${EMAIL}`} className="text-bronze underline underline-offset-2">
                  {EMAIL}
                </a>
              </p>
              <p className="mt-3">Segunda a sexta: 8h às 18h · Sábado: 8h às 12h</p>
            </address>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              A visita ao ateliê é combinada previamente — assim garantimos que haja alguém
              disponível para te acompanhar. Veja também{" "}
              <Link to="/projetos" className="text-bronze underline underline-offset-2">
                o portfólio de projetos
              </Link>{" "}
              e as{" "}
              <Link to="/perguntas-frequentes" className="text-bronze underline underline-offset-2">
                perguntas frequentes
              </Link>
              .
            </p>
          </div>
        </section>

        <CtaBand context="marcenaria sob medida" />
      </main>
      <SiteFooter />
    </div>
  );
}

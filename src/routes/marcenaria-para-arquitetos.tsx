import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { PageHero, ContentSection, FaqSection, CtaBand } from "@/components/PageParts";
import { serviceCatalog } from "@/data/catalog";
import { images } from "@/assets/generated/images";
import { pageSeo, canonical, SITE_URL } from "@/lib/seo";
import { jsonLd, webPage, faqPage, service as serviceSchema } from "@/lib/schema";

/**
 * Página de parceria com escritórios de arquitetura.
 *
 * Por que ela existe, e por que não é só mais uma landing de palavra-chave: o
 * resto do site fala com quem vai *morar* no móvel. Arquiteto procura outra
 * coisa e digita outra coisa ("marcenaria para arquitetos", "marceneiro
 * parceiro", "quem executa meu detalhamento em Curitiba") — a dúvida dele é se
 * o executor lê corte, respeita especificação e devolve compatibilização, não
 * quantas gavetas cabem no closet. É público diferente, intenção de busca
 * diferente e conteúdo diferente; por isso página própria, e fora de
 * /moveis-planejados/, que é a árvore por ambiente.
 *
 * Fica de fora, até o cliente confirmar: percentual de RT, número de escritórios
 * parceiros, prazo em dias e qualquer obra nomeada. Nada aqui é afirmação que a
 * M7 já não sustente em /sobre e no FAQ.
 */

const PATH = "/marcenaria-para-arquitetos";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Marcenaria para arquitetos", path: PATH },
];

const TITLE = "Marcenaria para Arquitetos em Curitiba | M7 Movelaria";
const DESCRIPTION =
  "Marcenaria parceira de escritórios de arquitetura em Curitiba e São José dos Pinhais: executamos seu detalhamento, devolvemos compatibilização e produzimos em ateliê próprio.";
const H1 = "Marcenaria para arquitetos em Curitiba e São José dos Pinhais";

const FAQ = [
  {
    q: "Vocês executam o detalhamento do escritório ou refazem o projeto?",
    a: "Executamos o seu. Quando o detalhamento existe, ele é a referência: seguimos as vistas, os materiais e as ferragens especificadas. O que devolvemos é a compatibilização — os pontos em que a medida real do local diverge do desenho e o que isso exige de ajuste antes do corte. Onde o projeto deixa a decisão em aberto, perguntamos em vez de arbitrar.",
  },
  {
    q: "Como funciona a compatibilização entre o desenho e a obra?",
    a: "Depois da medição no local, comparamos o levantamento com o detalhamento e apontamos as divergências: prumo e esquadro fora do desenho, altura de laje diferente da indicada, ponto de elétrica, água ou gás em posição que conflita com o módulo. Cada divergência vai com a alternativa construtiva, para o escritório decidir. É esse retorno que evita descobrir o problema no dia da instalação.",
  },
  {
    q: "A M7 atende o cliente do escritório diretamente?",
    a: "Só no que o escritório definir. A M7 é a executora: o interlocutor do projeto é o escritório, e a apresentação ao cliente final segue o que vocês combinarem. Quando o escritório prefere estar em toda conversa técnica, é assim que fazemos.",
  },
  {
    q: "Quais materiais e ferragens posso especificar em projeto?",
    a: "MDF de 15, 18 ou 25 mm escolhido por função da peça; acabamento em MDF revestido, laca fosca ou lâmina natural com encaixe em 45°; ferragens Blum, Häfele e Salice; perfis e sistemas deslizantes Rometal e Siforma; serralheria sob medida quando o projeto pede estrutura metálica; e iluminação em LED 3000K ou 5000K definida por função do ambiente. Se o projeto especificar linha diferente, avaliamos o fornecimento.",
  },
  {
    q: "Dá para conhecer o ateliê antes de indicar a M7 a um cliente?",
    a: "Dá, e é o que recomendamos antes da primeira indicação. O ateliê fica em São José dos Pinhais e é onde as peças são cortadas, usinadas e montadas — dá para ver o padrão de usinagem, de fitagem e de montagem de perto, que é o que uma foto de portfólio não mostra. Combine o horário pelo WhatsApp.",
  },
  {
    q: "Vocês fazem a instalação ou entregam as peças?",
    a: "A instalação é feita pela nossa equipe, incluindo a regulagem final de portas e gavetas. O móvel sai do ateliê com folga técnica prevista justamente para ser ajustado ao local, e quem instala precisa conhecer o projeto — por isso não terceirizamos essa etapa.",
  },
];

const ETAPAS = [
  {
    n: "01",
    title: "Leitura do detalhamento",
    body: "O escritório envia as pranchas. Antes de qualquer preço, lemos o detalhamento e apontamos o que é executável como está, o que depende de definição em obra e o que vale rever — é conversa técnica, não orçamento.",
  },
  {
    n: "02",
    title: "Medição e compatibilização",
    body: "Medimos no local e devolvemos as divergências entre o levantamento e o desenho, cada uma com a alternativa construtiva. A decisão continua sendo do escritório.",
  },
  {
    n: "03",
    title: "Especificação fechada",
    body: "Chapa por função, ferragem por fabricante, acabamento e iluminação por ambiente. Fica registrado o que vai ser executado, para não haver substituição silenciosa de material.",
  },
  {
    n: "04",
    title: "Produção no ateliê",
    body: "Corte, usinagem e montagem no nosso ateliê em São José dos Pinhais. Uma alteração aprovada durante a produção não passa por três fornecedores para acontecer.",
  },
  {
    n: "05",
    title: "Instalação com equipe própria",
    body: "Instalação e regulagem final por quem conhece o projeto, com a sequência combinada quando o imóvel já está habitado ou tem outras frentes de obra.",
  },
];

export const Route = createFileRoute("/marcenaria-para-arquitetos")({
  head: () => ({
    ...pageSeo({
      title: TITLE,
      description: DESCRIPTION,
      path: PATH,
      image: `${SITE_URL}${images["finish-lamina-45"].src}`,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: H1,
          description: DESCRIPTION,
          image: `${SITE_URL}${images["finish-lamina-45"].src}`,
          breadcrumb: TRAIL,
        }),
        serviceSchema({
          path: PATH,
          name: "Marcenaria para arquitetos",
          description:
            "Execução de marcenaria sob medida a partir do detalhamento de escritórios de arquitetura, com compatibilização, produção em ateliê próprio e instalação com equipe própria.",
          serviceType: "marcenaria para arquitetos",
        }),
        faqPage(canonical(PATH), FAQ),
      ]),
    ],
  }),
  component: ArchitectsPage,
});

function ArchitectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <PageHero
          eyebrow="Para escritórios de arquitetura"
          h1={H1}
          intro={[
            "A M7 executa marcenaria a partir do detalhamento do escritório. Projetamos, produzimos no nosso próprio ateliê em São José dos Pinhais e instalamos com equipe própria — as três etapas na mesma casa, o que encurta o caminho entre uma decisão de projeto e a peça pronta.",
            "O que o escritório costuma querer saber antes de indicar um executor é sempre a mesma coisa: se o desenho vai ser seguido, se as divergências da obra voltam a tempo de decidir e se a ferragem especificada é a que vai ser instalada. As três respostas estão nesta página.",
          ]}
          image="finish-lamina-45"
          imageAlt="Detalhe de marcenaria em lâmina natural com encaixe em 45 graus e continuidade de veio na quina"
          trail={TRAIL}
        />

        <ContentSection
          h2="O que a M7 entrega para o escritório"
          body="A parceria é de execução: o projeto é do escritório e o interlocutor do cliente continua sendo o escritório. O que muda é o que volta da obra para a prancheta."
          bullets={[
            "Compatibilização escrita entre o detalhamento e a medida real do local, com alternativa construtiva para cada divergência",
            "Especificação fechada antes da produção — chapa por função, ferragem por fabricante, acabamento e temperatura de LED por ambiente",
            "Produção no ateliê próprio, sem intermediário entre a aprovação de um ajuste e a peça sendo cortada",
            "Instalação e regulagem final por equipe própria, com sequência combinada quando o imóvel está habitado",
            "Visita ao ateliê aberta ao escritório, para conferir o padrão de usinagem e montagem antes da primeira indicação",
          ]}
        />

        <ContentSection
          tone="cream"
          h2="Compatibilização: o que devolvemos sobre o seu detalhamento"
          body="Nenhuma parede sai da obra igual ao desenho. Prumo, esquadro, nível de laje e posição de ponto de elétrica, água e gás mudam — e é a medida do local, não a da planta, que define o corte. Depois da medição, o escritório recebe as divergências levantadas e o que cada uma exige de ajuste, com a alternativa construtiva ao lado. A decisão é do escritório; o que não acontece é a alteração ser feita por conta própria no ateliê e aparecer no dia da instalação."
        />

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              Como a parceria funciona, etapa por etapa
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
              É o mesmo processo de qualquer projeto da casa, com uma diferença: o desenho já
              existe, e a primeira etapa é lê-lo.
            </p>
            <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ETAPAS.map((e) => (
                <li key={e.n} className="border border-border rounded p-6">
                  <span className="font-display text-3xl text-bronze">{e.n}</span>
                  <h3 className="mt-3 font-semibold text-ink">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{e.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <ContentSection
          tone="cream"
          h2="O que o escritório pode especificar em prancha"
          body="Esta é a lista que a M7 executa como padrão. Especificação diferente da linha abaixo não é problema — é uma conversa de fornecimento, feita antes do orçamento e não durante a produção."
          bullets={[
            "MDF de 15, 18 ou 25 mm, escolhido por função: carga, vão livre ou apenas fechamento",
            "Acabamento em MDF revestido, laca fosca ou lâmina natural com encaixe em 45° e continuidade de veio",
            "Ferragens Blum, Häfele e Salice, com amortecimento e regulagem em três eixos",
            "Perfis e sistemas deslizantes Rometal e Siforma nas portas de correr",
            "Serralheria sob medida integrada quando o projeto pede estrutura metálica",
            "Iluminação em LED 3000K para convívio e 5000K para tarefa, definida ambiente a ambiente",
          ]}
        />

        {/* Malha interna: a página de arquitetos é a que mais tem motivo para
            mandar o visitante ver execução — showroom e portfólio — e para
            distribuir autoridade para as landings por ambiente. */}
        <section className="py-16 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              Ver o padrão de execução antes de indicar
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Link
                to="/showroom-3d"
                className="block border border-border rounded p-6 hover:border-bronze/60 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-ink">Showroom 3D em tour 360°</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Ambientes navegáveis com os pontos de especificação abertos — útil também para
                  apresentar marcenaria ao seu cliente durante a reunião de projeto.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze">
                  Abrir o showroom <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </span>
              </Link>
              <Link
                to="/projetos"
                className="block border border-border rounded p-6 hover:border-bronze/60 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-ink">Projetos e especificação de ambientes</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Cada ambiente com o que foi especificado nele: chapa, ferragem, acabamento e
                  iluminação, item a item.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze">
                  Ver os projetos <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </span>
              </Link>
            </div>

            <h3 className="mt-12 text-lg font-semibold text-ink">Ambientes que executamos</h3>
            <ul className="mt-5 flex flex-wrap gap-3">
              {serviceCatalog.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/moveis-planejados/$servico"
                    params={{ servico: s.slug }}
                    className="inline-flex items-center px-4 py-2.5 border border-border rounded text-sm text-ink hover:border-bronze hover:text-bronze transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FaqSection items={FAQ} heading="Perguntas de quem especifica marcenaria" />
        <CtaBand context="marcenaria executada a partir do seu projeto" />
      </main>
      <SiteFooter />
    </div>
  );
}

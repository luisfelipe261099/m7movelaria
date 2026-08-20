import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Picture } from "@/components/Picture";
import { Breadcrumbs, CtaBand, FaqSection } from "@/components/PageParts";
import { serviceCatalog, cityCatalog } from "@/data/catalog";
import { pageSeo } from "@/lib/seo";
import { jsonLd, webPage, faqPage } from "@/lib/schema";
import { canonical } from "@/lib/seo";

const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Móveis planejados", path: "/moveis-planejados" },
];

const HUB_FAQ = [
  {
    q: "O que é um móvel planejado sob medida?",
    a: "É o móvel desenhado a partir das medidas reais do seu ambiente, e não montado a partir de módulos de catálogo em medidas fixas. Na prática isso significa aproveitar a altura até o teto, resolver canto vivo, encaixar em recuo de pilar e não deixar o vão morto que o módulo pronto sempre deixa. O projeto executivo, a medição no local e a instalação fazem parte do serviço.",
  },
  {
    q: "Qual a diferença entre planejado sob medida e modulado de loja?",
    a: "O modulado parte de módulos prontos em medidas fixas: resolve o preço e a rapidez, mas o projeto se adapta ao módulo, e sobra vão, tapa-furo e espaço morto. O sob medida parte da sua parede — a peça é cortada com a medida real do local, inclusive compensando parede fora de esquadro. Em ambiente pequeno essa diferença costuma valer mais do que em qualquer outro, porque cada centímetro vira armazenamento.",
  },
  {
    q: "Vocês fazem a casa inteira ou só um ambiente?",
    a: "Os dois. Muitos projetos começam por um ambiente — normalmente cozinha ou guarda-roupa — e continuam depois nos demais. Quando o conjunto sai no mesmo projeto, o resultado é mais coerente: mesmo acabamento, mesmos alinhamentos e nenhuma variação de tonalidade entre lotes de chapa.",
  },
];

export const Route = createFileRoute("/moveis-planejados/")({
  head: () => {
    const path = "/moveis-planejados";
    return {
      ...pageSeo({
        title: "Móveis Planejados sob Medida | M7 Movelaria",
        description:
          "Móveis planejados sob medida em São José dos Pinhais e Curitiba: cozinhas, dormitórios, closets, home office e móveis comerciais. Veja cada serviço.",
        path,
      }),
      scripts: [
        jsonLd([
          ...webPage({
            path,
            name: "Móveis planejados sob medida",
            description:
              "Serviços de marcenaria sob medida da M7 Movelaria em São José dos Pinhais e Curitiba.",
            breadcrumb: TRAIL,
          }),
          {
            "@type": "ItemList",
            "@id": `${canonical(path)}#servicos`,
            name: "Serviços de móveis planejados",
            itemListElement: serviceCatalog.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.name,
              url: canonical(`/moveis-planejados/${s.slug}`),
            })),
          },
          faqPage(canonical(path), HUB_FAQ),
        ]),
      ],
    };
  },
  component: ServicesHub,
});

function ServicesHub() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-cream">
          <div className="max-w-7xl mx-auto px-6 pt-8 pb-14">
            <Breadcrumbs trail={TRAIL} />
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-bronze mb-4">Serviços</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] text-ink max-w-3xl text-balance">
              Móveis planejados sob medida em São José dos Pinhais e Curitiba
            </h1>
            <div className="mt-6 max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
              <p>
                A M7 Movelaria é uma marcenaria: projetamos, produzimos no nosso ateliê em São José
                dos Pinhais e instalamos com equipe própria. Não trabalhamos com módulo de catálogo
                adaptado ao vão — cada peça é cortada a partir da medida real da sua parede.
              </p>
              <p>
                Abaixo estão os ambientes que executamos. Cada página explica o que entra no
                projeto, quais materiais e ferragens usamos e o que costuma decidir o resultado
                naquele ambiente específico.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceCatalog.map((s) => (
              <Link
                key={s.slug}
                to="/moveis-planejados/$servico"
                params={{ servico: s.slug }}
                className="group block border border-border rounded overflow-hidden hover:border-bronze/60 hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Picture
                    name={s.image}
                    alt={s.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-ink group-hover:text-bronze transition-colors">
                    {s.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze">
                    Ver o serviço <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-cream py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">Onde atendemos</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl leading-relaxed">
              O ateliê fica em São José dos Pinhais e atendemos Curitiba e a região metropolitana.
              Cada página traz o que muda no projeto naquela cidade.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {cityCatalog.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/moveis-planejados-em/$cidade"
                    params={{ cidade: c.slug }}
                    className="inline-flex items-center px-4 py-2.5 border border-border bg-background rounded text-sm text-ink hover:border-bronze hover:text-bronze transition-colors"
                  >
                    Móveis planejados em {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FaqSection items={HUB_FAQ} tone="light" />
        <CtaBand context="móveis planejados" />
      </main>
      <SiteFooter />
    </div>
  );
}

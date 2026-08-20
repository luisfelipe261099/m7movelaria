import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import {
  PageHero,
  ContentSection,
  FaqSection,
  RelatedLinks,
  CtaBand,
} from "@/components/PageParts";
import { serviceCatalog, cityCatalog, getCitySummary } from "@/data/catalog";
import { images } from "@/assets/generated/images";
import { pageSeo, canonical, SITE_URL } from "@/lib/seo";
import { jsonLd, webPage, faqPage, service as serviceSchema } from "@/lib/schema";

export const Route = createFileRoute("/moveis-planejados-em/$cidade")({
  // Conteúdo carregado sob demanda — ver a nota na rota de serviço.
  loader: async ({ params }) => {
    if (!getCitySummary(params.cidade)) throw notFound();
    const { getCity } = await import("@/data/cities");
    const city = getCity(params.cidade);
    if (!city) throw notFound();
    return { city };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        ...pageSeo({
          title: "Cidade não encontrada — M7 Movelaria",
          description: "Esta página não existe.",
          path: "/moveis-planejados",
          noindex: true,
        }),
      };
    }
    const { city } = loaderData;
    const path = `/moveis-planejados-em/${city.slug}`;
    const url = canonical(path);
    const trail = [
      { name: "Início", path: "/" },
      { name: "Móveis planejados", path: "/moveis-planejados" },
      { name: city.name, path },
    ];
    return {
      ...pageSeo({
        title: city.title,
        description: city.description,
        path,
        image: `${SITE_URL}${images[city.image].src}`,
      }),
      scripts: [
        jsonLd([
          ...webPage({ path, name: city.h1, description: city.description, breadcrumb: trail }),
          serviceSchema({
            path,
            name: `Móveis planejados em ${city.name}`,
            description: city.description,
            serviceType: "Marcenaria sob medida",
            cities: [city.name],
          }),
          faqPage(url, city.faq),
        ]),
      ],
    };
  },
  component: CityPage,
});

function CityPage() {
  const { city } = Route.useLoaderData();
  const path = `/moveis-planejados-em/${city.slug}`;
  const trail = [
    { name: "Início", path: "/" },
    { name: "Móveis planejados", path: "/moveis-planejados" },
    { name: city.name, path },
  ];
  const others = cityCatalog.filter((c) => c.slug !== city.slug);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <PageHero
          eyebrow={`${city.name} - PR`}
          h1={city.h1}
          intro={city.intro}
          image={city.image}
          imageAlt={city.imageAlt}
          trail={trail}
        />

        <ContentSection h2={city.context.h2} body={city.context.body} />

        <section className="bg-cream py-14">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              Bairros de {city.name} que atendemos
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{city.logistics}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {city.neighborhoods.map((n) => (
                <li
                  key={n}
                  className="px-3 py-1.5 bg-background border border-border rounded text-sm text-ink"
                >
                  {n}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              A lista não é exaustiva — atendemos {city.name} inteira. Se o seu bairro não estiver
              acima, é só perguntar no primeiro contato.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              O que executamos em {city.name}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviceCatalog.map((s) => (
                <Link
                  key={s.slug}
                  to="/moveis-planejados/$servico"
                  params={{ servico: s.slug }}
                  className="block border border-border rounded p-6 hover:border-bronze/60 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-ink">
                    {s.name} em {city.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.short}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FaqSection items={city.faq} heading={`Perguntas frequentes — ${city.name}`} />

        <RelatedLinks
          heading="Outras cidades atendidas"
          links={others.map((c) => ({
            to: `/moveis-planejados-em/${c.slug}`,
            label: `Móveis planejados em ${c.name}`,
            desc: c.description,
          }))}
        />

        <CtaBand context={`móveis planejados em ${city.name}`} />
      </main>
      <SiteFooter />
    </div>
  );
}

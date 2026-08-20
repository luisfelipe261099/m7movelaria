import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import {
  PageHero,
  ContentSection,
  FaqSection,
  RelatedLinks,
  CtaBand,
} from "@/components/PageParts";
import { serviceCatalog, cityCatalog, getServiceSummary } from "@/data/catalog";
import { images } from "@/assets/generated/images";
import { pageSeo, canonical, SITE_URL } from "@/lib/seo";
import { jsonLd, webPage, faqPage, service as serviceSchema } from "@/lib/schema";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/moveis-planejados/$servico")({
  // `import()` dinâmico de propósito: `routeTree.gen.ts` importa todas as rotas
  // estaticamente, então tudo que este arquivo importar no topo entra no chunk
  // compartilhado que TODA página baixa. O texto das seis landing pages de
  // serviço são ~20 KB que só esta rota precisa.
  loader: async ({ params }) => {
    if (!getServiceSummary(params.servico)) throw notFound();
    const { getService } = await import("@/data/services");
    const svc = getService(params.servico);
    if (!svc) throw notFound();
    return { svc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        ...pageSeo({
          title: "Serviço não encontrado — M7 Movelaria",
          description: "Esta página não existe.",
          path: "/moveis-planejados",
          noindex: true,
        }),
      };
    }
    const { svc } = loaderData;
    const path = `/moveis-planejados/${svc.slug}`;
    const url = canonical(path);
    const trail = [
      { name: "Início", path: "/" },
      { name: "Móveis planejados", path: "/moveis-planejados" },
      { name: svc.name, path },
    ];
    return {
      ...pageSeo({
        title: svc.title,
        description: svc.description,
        path,
        // og:image próprio: com a mesma capa em todas as rotas, o link
        // compartilhado no WhatsApp fica idêntico para páginas diferentes.
        image: `${SITE_URL}${images[svc.image].src}`,
      }),
      scripts: [
        jsonLd([
          ...webPage({
            path,
            name: svc.h1,
            description: svc.description,
            breadcrumb: trail,
          }),
          serviceSchema({
            path,
            name: svc.name,
            description: svc.description,
            serviceType: svc.keyword,
          }),
          faqPage(url, svc.faq),
        ]),
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { svc } = Route.useLoaderData();
  const trail = [
    { name: "Início", path: "/" },
    { name: "Móveis planejados", path: "/moveis-planejados" },
    { name: svc.name, path: `/moveis-planejados/${svc.slug}` },
  ];
  const related = svc.related
    .map((slug) => serviceCatalog.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      to: `/moveis-planejados/${s.slug}`,
      label: s.name,
      desc: s.short,
    }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <PageHero
          eyebrow="Serviço"
          h1={svc.h1}
          intro={svc.intro}
          image={svc.image}
          imageAlt={svc.imageAlt}
          trail={trail}
        />

        {svc.sections.map((s, i) => (
          <ContentSection
            key={s.h2}
            h2={s.h2}
            body={s.body}
            bullets={s.bullets}
            tone={i % 2 === 1 ? "cream" : "light"}
          />
        ))}

        {/* Link para as cidades: cada landing de serviço distribui autoridade
            para as locais, e vice-versa. Sem isso as páginas ficam ilhadas. */}
        <section className="py-14 border-t border-border">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              Onde executamos {svc.name.toLowerCase()}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              O ateliê fica em São José dos Pinhais e atendemos Curitiba e a região metropolitana.
              Veja o que muda no projeto em cada cidade:
            </p>
            <ul className="mt-6 flex flex-wrap gap-3">
              {cityCatalog.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/moveis-planejados-em/$cidade"
                    params={{ cidade: c.slug }}
                    className="inline-flex items-center px-4 py-2.5 border border-border rounded text-sm text-ink hover:border-bronze hover:text-bronze transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <FaqSection items={svc.faq} heading={`Perguntas frequentes sobre ${svc.keyword}`} />
        <RelatedLinks heading="Outros ambientes que executamos" links={related} />
        <CtaBand context={svc.name.toLowerCase()} />
      </main>
      <SiteFooter />
    </div>
  );
}

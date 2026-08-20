import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { projects } from "@/data/projects";
import { pageSeo, canonical } from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";
import { Breadcrumbs, CtaBand } from "@/components/PageParts";
import { Picture } from "@/components/Picture";

const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Projetos", path: "/projetos" },
];

export const Route = createFileRoute("/projetos/")({
  head: () => ({
    ...pageSeo({
      title: "Projetos de Marcenaria Executados | M7",
      description:
        "Portfólio interativo da M7 Movelaria: projetos de marcenaria de alto padrão em São José dos Pinhais e Curitiba, com os materiais e ferragens de cada ambiente.",
      path: "/projetos",
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: "/projetos",
          name: "Projetos de marcenaria — M7 Movelaria",
          description: "Portfólio de projetos de marcenaria de alto padrão da M7 Movelaria.",
          breadcrumb: TRAIL,
        }),
        {
          "@type": "ItemList",
          "@id": `${canonical("/projetos")}#projetos`,
          name: "Projetos de marcenaria",
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: canonical(`/projetos/${p.slug}`),
          })),
        },
      ]),
    ],
  }),
  component: ProjectsList,
});

function ProjectsList() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo" className="pt-8 pb-24 max-w-7xl mx-auto px-6">
        <Breadcrumbs trail={TRAIL} />
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-bronze mb-4">Portfólio</p>
        <h1 className="text-4xl md:text-5xl font-bold text-ink leading-[1.1] text-balance">
          Projetos de marcenaria sob medida da M7
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
          Cada projeto abaixo abre com seus ambientes e hotspots interativos que mostram material,
          ferragem e iluminação usados em cada ponto.
        </p>
        <div className="mb-12" />
        <div className="grid md:grid-cols-2 gap-10">
          {projects.map((p) => (
            <Link
              key={p.slug}
              to="/projetos/$projectId"
              params={{ projectId: p.slug }}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded">
                <Picture
                  name={p.coverName}
                  alt={`${p.name} — ${p.description}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 768px) 46vw, 100vw"
                />
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-bronze">{p.architect}</p>
                <h2 className="text-2xl md:text-3xl font-bold text-ink mt-1 group-hover:text-bronze transition-colors">
                  {p.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{p.client}</p>
                <p className="text-sm text-muted-foreground mt-3 max-w-md">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <CtaBand context="um projeto de marcenaria sob medida" />
      <SiteFooter />
    </div>
  );
}

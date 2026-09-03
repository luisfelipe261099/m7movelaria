import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { getProject, type Ambiente, type Hotspot } from "@/data/projects";
import { ArrowRight, X } from "lucide-react";
import { pageSeo, canonical, ID_BUSINESS } from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";
import { Breadcrumbs, CtaBand } from "@/components/PageParts";
import { Picture } from "@/components/Picture";

export const Route = createFileRoute("/projetos/$projectId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        ...pageSeo({
          title: "Projeto não encontrado — M7 Movelaria",
          description: "Este projeto não existe ou foi movido.",
          path: "/projetos",
          noindex: true,
        }),
      };
    }
    const { project } = loaderData;
    const path = `/projetos/${project.slug}`;
    const trail = [
      { name: "Início", path: "/" },
      { name: "Projetos", path: "/projetos" },
      { name: project.name, path },
    ];
    return {
      ...pageSeo({
        title: `${project.name} — M7 Movelaria`,
        description: project.description,
        path,
        type: "article",
      }),
      scripts: [
        jsonLd([
          ...webPage({
            path,
            name: project.name,
            description: project.description,
            breadcrumb: trail,
          }),
          {
            "@type": "CreativeWork",
            "@id": `${canonical(path)}#projeto`,
            name: project.name,
            description: project.description,
            url: canonical(path),
            creator: { "@id": ID_BUSINESS },
            about: project.ambientes.map((a) => a.name).join(", "),
          },
        ]),
      ],
    };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const trail = [
    { name: "Início", path: "/" },
    { name: "Projetos", path: "/projetos" },
    { name: project.name, path: `/projetos/${project.slug}` },
  ];
  const [selected, setSelected] = useState<Ambiente>(project.ambientes[0]);
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);

  useEffect(() => {
    if (!hotspot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHotspot(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [hotspot]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="conteudo" className="pt-8">
        <section className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumbs trail={trail} />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-bronze">{project.architect}</p>
              <h1 className="text-3xl md:text-5xl font-bold text-ink mt-2 text-balance">
                {project.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Cliente: {project.client}</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">{project.description}</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[280px_1fr] gap-8 pb-16">
          {/* Ambientes list */}
          <aside className="space-y-2 lg:sticky lg:top-24 self-start">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              Ambientes
            </p>
            {project.ambientes.map((amb: Ambiente) => (
              <button
                key={amb.id}
                onClick={() => {
                  setSelected(amb);
                  setHotspot(null);
                }}
                className={`w-full text-left px-4 py-3 border transition-all ${
                  selected.id === amb.id
                    ? "border-bronze bg-bronze/10 text-bronze"
                    : "border-border/50 hover:border-bronze/50"
                }`}
              >
                <div className="font-display text-lg">{amb.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {amb.hotspots.length} pontos de detalhe
                </div>
              </button>
            ))}
          </aside>

          {/* Interactive room */}
          <div>
            <div className="relative w-full aspect-[16/10] overflow-hidden border border-border/50">
              <Picture
                name={selected.image}
                alt={`${selected.name} — ${selected.intro}`}
                priority
                className="absolute inset-0 w-full h-full object-cover"
                sizes="(min-width: 1024px) 68vw, 100vw"
              />
              <div className="absolute inset-0 bg-black/10" />
              {selected.hotspots.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setHotspot(h)}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  aria-label={h.name}
                >
                  <span className="relative flex items-center justify-center">
                    <span className="absolute w-10 h-10 rounded-full bg-bronze/30 animate-ping" />
                    <span className="relative w-6 h-6 rounded-full bg-bronze border-2 border-background shadow-lg" />
                  </span>
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap text-xs uppercase tracking-widest bg-background/90 border border-bronze/50 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <h2 className="text-2xl md:text-3xl font-bold text-ink">{selected.name}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{selected.intro}</p>
              <p className="text-sm uppercase tracking-widest text-bronze mt-4">
                Toque nos pontos dourados para explorar os detalhes
              </p>
            </div>
          </div>
        </section>
        {/*
          A especificação em marcação, fora do estado do React.

          Todo o painel técnico do projeto vivia dentro de `{hotspot && (...)}`,
          com estado inicial `null`: o conteúdo existia só depois de um clique
          que nenhum rastreador dá. Na prática a página tinha 317 palavras
          visíveis e todo o material, ferragem e iluminação ficava invisível
          para busca — e para quem usa leitor de tela.

          `@/data/projects` já é importado no topo deste arquivo, então isto não
          acrescenta um byte de JavaScript: é o mesmo módulo, agora renderizado.
          O visualizador continua sendo o jeito bonito de navegar; esta seção é a
          versão legível.
        */}
        <section className="border-t border-border bg-cream">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <h2 className="text-2xl md:text-3xl font-bold text-ink">
              Especificação de projeto de cada ambiente
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
              O que está desenhado em cada ambiente deste projeto: material, ferragem especificada e
              iluminação, peça por peça.
            </p>

            <div className="mt-10 space-y-12">
              {project.ambientes.map((amb: Ambiente) => (
                <article key={amb.id}>
                  <h3 className="text-xl font-semibold text-ink">{amb.name}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{amb.intro}</p>

                  <div className="mt-6 space-y-8">
                    {amb.hotspots.map((h) => (
                      <div key={h.id} className="border-l-2 border-bronze/30 pl-5">
                        <h4 className="font-semibold text-ink">{h.name}</h4>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {h.description}
                        </p>
                        <dl className="mt-3 space-y-1.5 text-sm">
                          {[
                            ["Materiais", h.materials],
                            ["Ferragens", h.ferragens],
                            ["Iluminação", h.iluminacao],
                            ["Diferenciais", h.diferenciais],
                          ]
                            .filter(([, itens]) => (itens as string[]).length > 0)
                            .map(([rotulo, itens]) => (
                              <div key={rotulo as string} className="flex flex-wrap gap-x-2">
                                <dt className="text-bronze">{rotulo as string}:</dt>
                                <dd className="text-muted-foreground">
                                  {(itens as string[]).join(" · ")}
                                </dd>
                              </div>
                            ))}
                        </dl>
                      </div>
                    ))}
                  </div>

                  {amb.servicoSlug && (
                    <Link
                      to="/moveis-planejados/$servico"
                      params={{ servico: amb.servicoSlug }}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm text-bronze underline hover:text-bronze-dark"
                    >
                      Como projetamos {amb.name.toLowerCase()}{" "}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <CtaBand context="um projeto como este" />
      <SiteFooter />

      {/* Hotspot drawer */}
      {hotspot && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setHotspot(null)}>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" />
          <div
            className="w-full max-w-md bg-card border-l border-bronze/40 h-full overflow-y-auto p-8 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-bronze">Detalhe</p>
                <h3 className="font-display text-3xl mt-2">{hotspot.name}</h3>
              </div>
              <button
                onClick={() => setHotspot(null)}
                className="p-2 hover:text-bronze transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{hotspot.description}</p>

            <DetailBlock title="Materiais" items={hotspot.materials} />
            <DetailBlock title="Ferragens" items={hotspot.ferragens} />
            <DetailBlock title="Iluminação" items={hotspot.iluminacao} />
            <DetailBlock title="Diferenciais M7" items={hotspot.diferenciais} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <h4 className="text-xs uppercase tracking-[0.3em] text-bronze mb-3 border-b border-bronze/30 pb-2">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="text-bronze">—</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

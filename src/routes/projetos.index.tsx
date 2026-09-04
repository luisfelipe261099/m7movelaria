import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { projects } from "@/data/projects";
import { obras } from "@/data/obras";
import { serviceCatalog } from "@/data/catalog";
import { images } from "@/assets/generated/images";
import { pageSeo, canonical, SITE_URL, ID_BUSINESS } from "@/lib/seo";
import { jsonLd, webPage } from "@/lib/schema";
import { whatsappLink } from "@/lib/whatsapp";
import { Breadcrumbs, CtaBand } from "@/components/PageParts";
import { Picture } from "@/components/Picture";

const PATH = "/projetos";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Projetos", path: PATH },
];

/** A foto de abertura da página — também é a imagem de compartilhamento. */
const CAPA = obras[0];
const idObra = (slug: string) => `${canonical(PATH)}#obra-${slug}`;

/** "Home theater e painel de TV" → "home theater e painel de TV": só a
 *  inicial cai, a sigla fica. `toLowerCase()` inteiro virava "painel de tv". */
const minusculaInicial = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const Route = createFileRoute("/projetos/")({
  head: () => ({
    ...pageSeo({
      title: "Projetos e Obras de Marcenaria | M7 Movelaria",
      description:
        "Fotos de móveis entregues e projetos interativos de marcenaria sob medida da M7 Movelaria, em São José dos Pinhais e Curitiba, com materiais e ferragens.",
      path: PATH,
      image: `${SITE_URL}${images[CAPA.image].src}`,
      imageWidth: images[CAPA.image].width,
      imageHeight: images[CAPA.image].height,
      imageAlt: CAPA.alt,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: "Projetos e obras de marcenaria — M7 Movelaria",
          description:
            "Fotos de móveis entregues e projetos interativos de marcenaria sob medida da M7 Movelaria.",
          // Referência por @id ao nó completo abaixo, em vez de um segundo
          // ImageObject anônimo para a mesma foto.
          imageId: idObra(CAPA.slug),
          breadcrumb: TRAIL,
        }),
        // Cada foto vira um ImageObject: `caption` é a legenda visível,
        // `description` o texto para quem não vê. `publisher`, e não
        // `creator`: a M7 publica as fotos, mas quem fotografou não foi
        // informado — creator é crédito autoral e o Google o exibe como tal.
        ...obras.map((o, i) => ({
          "@type": "ImageObject",
          "@id": idObra(o.slug),
          contentUrl: `${SITE_URL}${images[o.image].src}`,
          url: idObra(o.slug),
          name: o.name,
          caption: o.caption,
          description: o.alt,
          width: images[o.image].width,
          height: images[o.image].height,
          publisher: { "@id": ID_BUSINESS },
          ...(i === 0 ? { representativeOfPage: true } : {}),
        })),
        {
          "@type": "ItemList",
          "@id": `${canonical(PATH)}#projetos`,
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
          Projetos e obras de marcenaria sob medida da M7
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground leading-relaxed">
          Dois tipos de imagem convivem nesta página. As fotos são de móveis entregues, do jeito que
          ficaram. Os projetos interativos, mais abaixo, são renders de projeto executivo.
        </p>

        {/* ————— OBRAS ENTREGUES ————— */}
        {/* A foto vem logo depois do título de propósito: a página promete
            "fotos de móveis entregues" no título e na meta, então a primeira
            tela precisa ter foto — antes havia 1,4 telas de texto no celular.
            Sem JS: <figure>/<figcaption> nativos e legenda no DOM para o
            Google ler. Não é <ul>: o sexto bloco da grade é um convite, não
            uma foto, e cinco figuras com h3 já são navegáveis por título. */}
        <section id="obras" className="mt-10" aria-labelledby="obras-titulo">
          <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Fotos</p>
          <h2 id="obras-titulo" className="text-2xl md:text-3xl font-bold text-ink">
            Obras entregues
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Móveis entregues pela M7, fotografados prontos. Cada legenda diz o que a foto mostra de
            marcenaria e, quando existe, leva à página que explica como projetamos aquele tipo de
            móvel.
          </p>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {obras.map((o, i) => {
              const servico = o.servicoSlug
                ? serviceCatalog.find((s) => s.slug === o.servicoSlug)
                : undefined;
              const img = images[o.image];
              // Uma foto em retrato entre quatro em paisagem deixava a fileira
              // 200 px mais alta de um lado. Proporção única 4:3 para todas:
              // sem perda nas paisagens (1200x896 ≈ 4:3) e, no retrato, o
              // recorte ancorado a 30% mantém tampo, encaixe e boa parte do pé.
              const retrato = img.height > img.width;
              return (
                <figure key={o.slug} id={`obra-${o.slug}`} className="flex h-full flex-col">
                  <div className="aspect-[4/3] overflow-hidden rounded bg-ink">
                    <Picture
                      name={o.image}
                      alt={o.altCurto}
                      // A primeira foto entra na primeira tela em todos os
                      // tamanhos desde que a seção fique aqui em cima — é a
                      // candidata a LCP. Se a seção descer, tirar o priority.
                      priority={i === 0}
                      className={`w-full h-full object-cover${retrato ? " object-[50%_30%]" : ""}`}
                      sizes="(min-width: 1280px) 395px, (min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 640px) calc((100vw - 72px) / 2), calc(100vw - 48px)"
                    />
                  </div>
                  <figcaption className="mt-4">
                    <h3 className="text-lg font-semibold text-ink">{o.name}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      {o.caption}
                    </p>
                  </figcaption>
                  {/* Fora da <figcaption>: o nome acessível da figure é a
                      legenda, e o link não faz parte dela. `mt-auto` alinha os
                      links da fileira pelo rodapé, mesmo com legendas de
                      tamanhos diferentes. */}
                  {servico && (
                    <Link
                      to="/moveis-planejados/$servico"
                      params={{ servico: servico.slug }}
                      className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm text-bronze underline hover:text-bronze-dark self-start"
                    >
                      Como projetamos {minusculaInicial(servico.name)}{" "}
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  )}
                </figure>
              );
            })}
            {/* A sexta célula da grade fecha a fileira com o convite que faz
                sentido depois de ver foto: ver de perto. */}
            <aside
              aria-labelledby="visita-titulo"
              className="rounded border border-bronze/40 bg-cream p-6 self-start"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-bronze">Ao vivo</p>
              <h3 id="visita-titulo" className="mt-2 text-lg font-semibold text-ink text-balance">
                Prefere ver acabamento e ferragem de perto?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                O ateliê em São José dos Pinhais recebe visita com hora marcada. É a melhor forma de
                decidir acabamento — foto não mostra o toque nem o fechamento da porta.
              </p>
              <a
                href={whatsappLink("Olá M7 Movelaria, gostaria de agendar uma visita ao ateliê.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-bronze underline hover:text-bronze-dark"
              >
                <MessageCircle className="w-4 h-4" aria-hidden /> Agendar visita pelo WhatsApp
              </a>
            </aside>
          </div>
        </section>

        {/* ————— PROJETOS EXECUTIVOS (RENDERS) ————— */}
        <section className="mt-20" aria-labelledby="projetos-titulo">
          <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Projeto executivo</p>
          <h2 id="projetos-titulo" className="text-2xl md:text-3xl font-bold text-ink">
            Projetos interativos
          </h2>
          <div className="mt-3 max-w-2xl space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Renders de projeto executivo, não fotografia: o desenho detalhado peça a peça, como
              vai para a produção. Cada projeto abre com seus ambientes e pontos interativos — você
              clica em uma peça e vê o que foi especificado ali: a chapa, a ferragem, o tipo de
              iluminação e o que o detalhe resolve no uso do dia a dia.
            </p>
            <p>
              A M7 documenta projeto peça por peça porque é assim que o móvel é produzido. A
              diferença entre uma corrediça de 35 kg e uma reforçada, entre lâmina natural e laca
              fosca, entre dobradiça comum e amortecida, aparece no orçamento e aparece no uso
              depois de instalado. Mostrar essa escolha é mais honesto do que mostrar só a foto
              bonita do conjunto.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-10">
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
                    alt={`Render de ${p.name} — ${p.description}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1280px) 604px, (min-width: 768px) calc((100vw - 88px) / 2), calc(100vw - 48px)"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest text-bronze">{p.architect}</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-ink mt-1 group-hover:text-bronze transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.client}</p>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <CtaBand context="um projeto de marcenaria sob medida" />
      <SiteFooter />
    </div>
  );
}

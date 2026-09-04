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

export const Route = createFileRoute("/projetos/")({
  head: () => ({
    ...pageSeo({
      title: "Projetos e Obras de Marcenaria | M7 Movelaria",
      description:
        "Portfólio da M7 Movelaria: fotos de obras entregues e projetos interativos de marcenaria sob medida em São José dos Pinhais e Curitiba, com os materiais e ferragens de cada ambiente.",
      path: PATH,
      image: `${SITE_URL}${images[CAPA.image].src}`,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: "Projetos e obras de marcenaria — M7 Movelaria",
          description:
            "Fotos de obras entregues e projetos interativos de marcenaria sob medida da M7 Movelaria.",
          image: `${SITE_URL}${images[CAPA.image].src}`,
          breadcrumb: TRAIL,
        }),
        // Cada foto vira um ImageObject com legenda: é o que dá ao Google
        // Imagens um texto ligado à imagem além do alt, e liga a foto ao nó
        // da empresa por @id em vez de a uma entidade anônima.
        ...obras.map((o) => ({
          "@type": "ImageObject",
          "@id": `${canonical(PATH)}#obra-${o.slug}`,
          contentUrl: `${SITE_URL}${images[o.image].src}`,
          url: `${canonical(PATH)}#obra-${o.slug}`,
          name: o.name,
          caption: o.alt,
          width: images[o.image].width,
          height: images[o.image].height,
          creator: { "@id": ID_BUSINESS },
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
        {/* Conteúdo que só faz sentido num índice: sem isto a página era o card
            do projeto e mais nada, e não respondia nada a quem chegava nela. */}
        <div className="mt-5 max-w-2xl space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Dois tipos de imagem convivem nesta página, e vale saber qual é qual. As fotos são de
            móveis instalados — obra entregue, do jeito que ficou. Os projetos interativos, mais
            abaixo, são renders do projeto executivo: o desenho aprovado antes do corte, com cada
            peça abrindo o que foi especificado ali.
          </p>
          <p>
            A M7 documenta projeto peça por peça porque é assim que o móvel é produzido. A diferença
            entre uma corrediça de 35 kg e uma reforçada, entre lâmina natural e laca fosca, entre
            dobradiça comum e amortecida, aparece no orçamento e aparece no uso depois de instalado.
            Mostrar essa escolha é mais honesto do que mostrar só a foto bonita do conjunto.
          </p>
        </div>

        {/* ————— OBRAS ENTREGUES ————— */}
        {/* Sem JS de propósito: <figure>/<figcaption> nativos, imagem em proporção
            natural (o <Picture> traz width/height, então não há CLS) e legenda
            no DOM para o Google ler. Galeria com lightbox seria mais bonita e
            custaria um chunk a mais na rota inteira. */}
        <section id="obras" className="mt-16 scroll-mt-24" aria-labelledby="obras-titulo">
          <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Fotos</p>
          <h2 id="obras-titulo" className="text-2xl md:text-3xl font-bold text-ink">
            Obras entregues
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Móveis já instalados, fotografados no lugar. Cada legenda diz o que a foto mostra de
            marcenaria — acabamento, vidro, iluminação, puxador — e, quando existe, leva à página
            que explica como projetamos aquele tipo de móvel.
          </p>
          <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {obras.map((o, i) => {
              const servico = o.servicoSlug
                ? serviceCatalog.find((s) => s.slug === o.servicoSlug)
                : undefined;
              return (
                <li key={o.slug} id={`obra-${o.slug}`} className="scroll-mt-24">
                  <figure>
                    <div className="overflow-hidden rounded bg-ink">
                      <Picture
                        name={o.image}
                        alt={o.alt}
                        // A primeira foto é a candidata a LCP desta página.
                        priority={i === 0}
                        className="w-full h-auto"
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                      />
                    </div>
                    <figcaption className="mt-4">
                      <h3 className="text-lg font-semibold text-ink">{o.name}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        {o.caption}
                      </p>
                      {servico && (
                        <Link
                          to="/moveis-planejados/$servico"
                          params={{ servico: servico.slug }}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm text-bronze underline hover:text-bronze-dark"
                        >
                          Como projetamos {servico.name.toLowerCase()}{" "}
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                        </Link>
                      )}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
            {/* A sexta célula da grade fecha a fileira com o convite que faz
                sentido depois de ver foto: ver de perto. */}
            <li className="h-full">
              <div className="h-full min-h-[240px] flex flex-col justify-between rounded border border-bronze/40 bg-cream p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-bronze">Ao vivo</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink text-balance">
                    Prefere ver acabamento e ferragem de perto?
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    O ateliê em São José dos Pinhais recebe visita com hora marcada. É a melhor
                    forma de decidir acabamento — foto não mostra o toque nem o fechamento da porta.
                  </p>
                </div>
                <a
                  href={whatsappLink("Olá M7 Movelaria, gostaria de agendar uma visita ao ateliê.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm text-bronze underline hover:text-bronze-dark"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden /> Agendar visita pelo WhatsApp
                </a>
              </div>
            </li>
          </ul>
        </section>

        {/* ————— PROJETOS EXECUTIVOS (RENDERS) ————— */}
        <section className="mt-20" aria-labelledby="projetos-titulo">
          <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Projeto executivo</p>
          <h2 id="projetos-titulo" className="text-2xl md:text-3xl font-bold text-ink">
            Projetos interativos
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Renders do projeto executivo, não fotografia. Cada projeto abre com seus ambientes e
            pontos interativos: você clica em uma peça e vê o que foi especificado ali — a chapa, a
            ferragem, o tipo de iluminação e o que o detalhe resolve no uso do dia a dia.
          </p>
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
                    alt={`Render de ${p.name.toLowerCase()} — ${p.description}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 46vw, 100vw"
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

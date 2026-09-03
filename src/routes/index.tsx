import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutGrid,
  Package,
  Truck,
  ArrowRight,
  Check,
  Ruler,
  Sparkles,
  Layers,
  Palette,
  Users,
  Heart,
  MessageCircle,
  Calendar,
  Play,
  Phone,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Picture } from "@/components/Picture";
import { HeroVideo } from "@/components/HeroVideo";
import { FaqSection } from "@/components/PageParts";
import { whatsappLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { pageSeo, canonical, PHONE_LOCAL } from "@/lib/seo";
import { jsonLd, webPage, faqPage } from "@/lib/schema";
import { serviceCatalog, cityCatalog } from "@/data/catalog";
import { images } from "@/assets/generated/images";

/** Precisa ser idêntico ao `sizes` do <Picture> do hero: se divergir, o
 *  navegador escolhe uma variante no preload e outra ao renderizar, e baixa as
 *  duas. */
const HERO_SIZES = "(min-width: 1024px) 46vw, 100vw";

/** Perguntas na própria home: capturam a busca informacional sem obrigar o
 *  visitante a navegar, e habilitam o rich result de FAQ na SERP da marca. */
const HOME_FAQ = [
  {
    q: "A M7 Movelaria atende Curitiba além de São José dos Pinhais?",
    a: "Sim. O ateliê fica em São José dos Pinhais, na R. Henrique Bortolam, 182, bairro Costeira, e atendemos Curitiba e toda a região metropolitana — Pinhais, Araucária, Colombo, Fazenda Rio Grande, Piraquara e Quatro Barras — com medição no local, entrega e instalação pela nossa própria equipe.",
  },
  {
    q: "Qual a diferença entre a M7 e uma loja de móveis planejados?",
    a: "Somos uma marcenaria: projetamos, produzimos no nosso ateliê e instalamos com equipe própria. Loja de planejados revende módulos em medidas fixas montados por terceiros. Na prática isso muda o que é possível fazer com a sua parede — e quem responde quando algo precisa de ajuste.",
  },
  {
    q: "Quanto custa um móvel planejado sob medida?",
    a: "Não existe preço de tabela: o valor é formado pelos metros lineares projetados, pelo tipo de chapa e acabamento, pela ferragem especificada e pela quantidade de gavetas e mecanismos. Envie a planta ou as medidas pelo WhatsApp para receber um orçamento fechado do seu projeto.",
  },
];

export const Route = createFileRoute("/")({
  head: () => {
    const path = "/";
    return {
      ...pageSeo({
        title: "Móveis Planejados em São José dos Pinhais | M7 Movelaria",
        description:
          "Marcenaria de alto padrão em São José dos Pinhais e Curitiba: cozinhas, dormitórios, closets e home office planejados sob medida. Peça seu orçamento.",
        path,
      }),
      links: [
        { rel: "canonical", href: canonical(path) },
        // Preload do pôster do hero — só a partir de 1024px.
        //
        // A partir desse ponto o hero fica lado a lado e a imagem é o elemento
        // LCP. Abaixo disso o layout empilha, a imagem cai abaixo da dobra e
        // quem vira LCP é o parágrafo de abertura (medido com
        // PerformanceObserver em viewport de celular). Preload sem `media` fazia
        // o celular baixar 45 KB com prioridade alta disputando banda com o CSS
        // e a fonte — atrasando justamente o texto que ele precisa pintar.
        {
          rel: "preload",
          as: "image",
          imageSrcSet: images["hero-showroom-3d"].avif,
          imageSizes: HERO_SIZES,
          type: "image/avif",
          media: "(min-width: 1024px)",
          fetchPriority: "high",
        },
      ],
      scripts: [
        jsonLd([
          ...webPage({
            path,
            name: "M7 Movelaria — móveis planejados em São José dos Pinhais",
            description:
              "Marcenaria de alto padrão em São José dos Pinhais e Curitiba: móveis planejados sob medida.",
          }),
          faqPage(canonical(path), HOME_FAQ),
        ]),
      ],
    };
  },
  component: Home,
});

const differentials = [
  {
    icon: Sparkles,
    title: "Projeto exclusivo",
    desc: "Cada projeto nasce da medida real da sua parede, não de um módulo de catálogo.",
  },
  {
    icon: Layers,
    title: "Materiais premium",
    desc: "MDF escolhido por função e ferragens Blum, Häfele e Salice em todo projeto.",
  },
  {
    icon: Palette,
    title: "Acabamento impecável",
    desc: "Laca fosca, lâmina natural em 45° e serralheria sob medida integrada.",
  },
  {
    icon: Users,
    title: "Equipe própria",
    desc: "Projeto, produção no ateliê e instalação feitos pela mesma casa.",
  },
  {
    icon: Heart,
    title: "Atendimento pós-obra",
    desc: "Regulagem final na instalação e suporte depois da entrega.",
  },
];

const hardware = [
  {
    img: "hw-blum",
    name: "Blum",
    alt: "Dobradiça Blum com sistema clip usada nos armários planejados da M7",
    desc: "Dobradiças e corrediças austríacas com abertura silenciosa e vida útil superior.",
  },
  {
    img: "hw-hafele",
    name: "Häfele",
    alt: "Ferragem Häfele — corrediça oculta usada nos gaveteiros sob medida",
    desc: "Ferragens alemãs de alta engenharia — corrediças ocultas, articuladores e sistemas de porta.",
  },
  {
    img: "hw-salice",
    name: "Salice",
    alt: "Dobradiça italiana Salice para portas de sobrepor",
    desc: "Dobradiças italianas premium com clip reto para portas de sobrepor perfeitas.",
  },
  {
    img: "hw-siforma",
    name: "Siforma",
    alt: "Perfil Siforma para porta deslizante de armário planejado",
    desc: "Perfis e sistemas de portas deslizantes com movimento suave e acabamento refinado.",
  },
  {
    img: "hw-rometal",
    name: "Rometal",
    alt: "Sistema de porta deslizante Rometal aplicado em marcenaria sob medida",
    desc: "Kits de portas deslizantes e cabideiros iluminados — engenharia nacional de alto padrão.",
  },
  {
    img: "hw-mdf",
    name: "Chapas de MDF",
    alt: "Chapas de MDF em diferentes espessuras e padrões usadas na marcenaria",
    desc: "MDF 6, 15, 18 e 25 mm em branco e cores — estrutura estável e acabamento superior.",
  },
] as const;

const finishes = [
  {
    img: "finish-lamina-45",
    name: "Lâmina 45°",
    desc: "Encaixes em 45 graus com lâmina natural — continuidade de veio e cantos vivos.",
    alt: "Detalhe de encaixe em 45 graus com lâmina natural e continuidade de veio na quina",
  },
  {
    img: "finish-laca",
    name: "Laca fosca",
    desc: "Pintura em laca com toque aveludado e superfície uniforme sem emendas.",
    alt: "Porta de armário com acabamento em laca fosca, superfície uniforme sem emenda",
  },
  {
    img: "finish-serralheria",
    name: "Serralheria",
    desc: "Estruturas metálicas sob medida integradas ao mobiliário — leveza industrial.",
    alt: "Estrutura metálica sob medida integrada à marcenaria de uma estante",
  },
  {
    img: "finish-led-3000",
    name: "LED 3000K",
    desc: "Luz quente amarelada — cria aconchego em ambientes de convívio e cozinhas.",
    alt: "Iluminação em LED 3000K, luz quente, embutida em nicho de marcenaria",
  },
  {
    img: "finish-led-5000",
    name: "LED 5000K",
    desc: "Luz branca neutra — funcional para closets, bancadas e áreas de trabalho.",
    alt: "Iluminação em LED 5000K, luz branca neutra, sobre bancada de trabalho",
  },
] as const;

const portfolio = [
  {
    img: "hero-living",
    alt: "Sala de estar com painel de TV e marcenaria em madeira nogueira",
  },
  { img: "project-closet", alt: "Closet planejado com araras iluminadas e gaveteiros" },
  {
    img: "project-kitchen",
    alt: "Cozinha planejada com bancada em quartzo e iluminação em LED",
  },
  { img: "project-office", alt: "Home office com estante iluminada sob medida" },
  { img: "hero-showroom-3d", alt: "Vista isométrica do showroom M7 em 3D" },
] as const;

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        {/* HERO */}
        <section id="inicio" className="bg-cream">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-6 py-16 lg:py-24">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-5">
                Marcenaria sob medida
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] text-ink text-balance">
                Móveis planejados de{" "}
                <span className="text-bronze italic font-display font-medium">alto padrão</span> em
                São José dos Pinhais
              </h1>
              <p className="mt-6 text-muted-foreground max-w-lg leading-relaxed">
                Marcenaria sob medida para cozinhas, dormitórios, closets, home office e ambientes
                comerciais — em São José dos Pinhais, Curitiba e região metropolitana. Projeto,
                produção no ateliê e instalação com equipe própria.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappLink("Olá M7 Movelaria, gostaria de solicitar um orçamento.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors"
                >
                  Pedir orçamento no WhatsApp <MessageCircle className="w-4 h-4" aria-hidden />
                </a>
                <Link
                  to="/moveis-planejados"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-bronze text-bronze rounded hover:bg-bronze hover:text-primary-foreground transition-colors"
                >
                  Ver os serviços <LayoutGrid className="w-4 h-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-bronze" aria-hidden /> Projeto executivo próprio
                </span>
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-bronze" aria-hidden /> Ferragens Blum e Häfele
                </span>
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-bronze" aria-hidden /> Entrega e instalação própria
                </span>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded shadow-lg bg-ink group">
              <HeroVideo
                sizes={HERO_SIZES}
                src="/media/hero-showroom.mp4"
                poster="hero-showroom-3d"
                posterAlt="Showroom da M7 Movelaria em 3D, com cozinha, sala e closet planejados"
                label="Vídeo do showroom M7 em 360 graus"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-xs uppercase tracking-[0.2em] rounded">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-bronze animate-pulse" />
                Tour 360°
              </div>
              <Link
                to="/showroom-3d"
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2.5 bg-bronze text-primary-foreground text-sm rounded hover:bg-bronze-dark transition-colors"
              >
                <Play className="w-3 h-3 fill-current" aria-hidden /> Entrar no tour 360°
              </Link>
            </div>
          </div>
        </section>

        {/* SERVIÇOS — cada card leva para a landing do serviço */}
        <section id="servicos" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Nossos serviços</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink text-balance">
                Móveis planejados sob medida para cada ambiente
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Da cozinha ao escritório comercial, cada ambiente tem um problema diferente para
                resolver. Veja o que entra em cada projeto.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serviceCatalog.map((s) => (
                <Link
                  key={s.slug}
                  to="/moveis-planejados/$servico"
                  params={{ servico: s.slug }}
                  className="group block bg-background border border-border rounded overflow-hidden hover:border-bronze/60 hover:shadow-md transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <Picture
                      name={s.image}
                      alt={s.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-ink text-lg group-hover:text-bronze transition-colors">
                      {s.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.short}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze">
                      Ver o serviço <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ÁREA ATENDIDA — sinal local explícito + malha de links para as cidades */}
        <section id="area-atendida" className="bg-cream py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Área atendida</p>
                <h2 className="text-3xl md:text-4xl font-bold text-ink text-balance">
                  Marcenaria em São José dos Pinhais, Curitiba e região metropolitana
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Nosso ateliê fica na R. Henrique Bortolam, 182, bairro Costeira, em São José dos
                  Pinhais — a poucos minutos da divisa com Curitiba. Isso encurta o caminho entre um
                  ajuste no projeto e a peça pronta, e mantém medição, entrega e instalação com a
                  nossa própria equipe.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`tel:+${WHATSAPP_NUMBER}`}
                    className="inline-flex items-center gap-2 text-bronze hover:underline"
                  >
                    <Phone className="w-4 h-4" aria-hidden /> {PHONE_LOCAL}
                  </a>
                </div>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {cityCatalog.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to="/moveis-planejados-em/$cidade"
                      params={{ cidade: c.slug }}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 bg-background border border-border rounded text-sm text-ink hover:border-bronze hover:text-bronze transition-colors"
                    >
                      <span>Móveis planejados em {c.name}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded shadow-md">
              <Picture
                name="project-closet"
                alt="Closet planejado com araras iluminadas em LED e gaveteiros internos"
                className="w-full h-full object-cover"
                sizes="(min-width: 1024px) 46vw, 100vw"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Sobre a M7</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-tight text-balance">
                Uma marcenaria, não uma revenda de móveis
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                A M7 Movelaria projeta, produz no próprio ateliê e instala com equipe própria. É o
                que permite corrigir uma medida a partir do que a parede realmente é — e responder
                pelo resultado sem repassar a responsabilidade para um instalador terceirizado.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Medição no local antes de qualquer corte",
                  "Projeto executivo com especificação de materiais e ferragens",
                  "Instalação e regulagem final pela nossa equipe",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-ink">
                    <span
                      aria-hidden
                      className="w-6 h-6 rounded-full bg-bronze/15 text-bronze grid place-items-center shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                to="/sobre"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors"
              >
                Como trabalhamos <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* SHOWROOM 3D CTA */}
        <section className="bg-cream py-20 defer-render">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 rounded overflow-hidden shadow-lg">
              <div className="aspect-[4/3] md:aspect-auto">
                <Picture
                  name="project-kitchen"
                  alt="Cozinha planejada com bancada em quartzo, vista no showroom 3D interativo"
                  className="w-full h-full object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="bg-ink text-white p-10 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Showroom 3D</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-balance">
                  Explore nossos projetos em 360°
                </h2>
                <p className="mt-4 text-white/80 leading-relaxed">
                  Navegue pelos ambientes do showroom M7. Clique nos hotspots dourados para
                  descobrir materiais, ferragens, iluminação e cada detalhe técnico do projeto.
                </p>
                <Link
                  to="/showroom-3d"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors self-start"
                >
                  Entrar no showroom 3D <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MATERIAIS PREMIUM — FERRAGENS */}
        <section id="materiais" className="py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">
                Materiais premium
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink text-balance">
                Ferragens das melhores marcas do mundo
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A ferragem é a única parte do móvel que se move — e é onde ele falha primeiro. Por
                isso especificamos fabricantes que publicam vida útil em ciclos de abertura.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hardware.map((h) => (
                <div
                  key={h.name}
                  className="bg-background border border-border rounded overflow-hidden hover:border-bronze/60 hover:shadow-md transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-white">
                    <Picture
                      name={h.img}
                      alt={h.alt}
                      className="w-full h-full object-cover"
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-ink">{h.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACABAMENTOS */}
        <section id="acabamentos" className="bg-cream py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Acabamentos</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink text-balance">
                Detalhes que definem o alto padrão
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Da lâmina natural em 45° à iluminação técnica em LED — cada acabamento é escolhido
                para elevar o resultado final.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {finishes.map((f, i) => (
                <div
                  key={f.name}
                  className={`group relative overflow-hidden rounded shadow-sm ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
                >
                  <div className={`${i === 0 ? "aspect-[16/10]" : "aspect-[4/3]"} overflow-hidden`}>
                    <Picture
                      name={f.img}
                      alt={f.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes={
                        i === 0
                          ? "(min-width: 1024px) 62vw, 100vw"
                          : "(min-width: 1024px) 30vw, 100vw"
                      }
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white">
                    <p className="text-xs uppercase tracking-[0.25em] text-bronze-soft">
                      Acabamento
                    </p>
                    <h3 className={`font-display ${i === 0 ? "text-2xl" : "text-lg"} mt-1`}>
                      {f.name}
                    </h3>
                    <p className="text-sm text-white/90 mt-1 max-w-md leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFÓLIO */}
        <section id="portfolio" className="py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Portfólio</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink text-balance">
              Projetos de marcenaria sob medida
            </h2>
            <div className="mt-12 grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {portfolio.map((p) => (
                <Link
                  key={p.img}
                  to="/projetos"
                  aria-label={`${p.alt} — ver o portfólio completo`}
                  className="block aspect-square overflow-hidden rounded group"
                >
                  <Picture
                    name={p.img}
                    alt={p.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 46vw"
                  />
                </Link>
              ))}
            </div>
            <div className="mt-10">
              <Link
                to="/projetos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors text-sm"
              >
                Ver o portfólio completo <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* POR QUE ESCOLHER */}
        <section className="bg-cream py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">
              Por que escolher a M7
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink text-balance">
              Qualidade que faz a diferença
            </h2>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {differentials.map((d) => (
                <div key={d.title} className="text-center">
                  <div
                    aria-hidden
                    className="w-14 h-14 mx-auto rounded-full bg-bronze/10 grid place-items-center text-bronze"
                  >
                    <d.icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-ink text-base">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                    {d.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/*
          No lugar de depoimentos: o que dá para verificar.

          Aqui havia seis depoimentos assinados por pessoas que não existem, com
          cidade e elogio inventados. Além de ser propaganda enganosa (CDC art. 37),
          é o tipo de prova social que qualquer visitante desconfia. Quando houver
          avaliação real no Perfil da Empresa, o caminho é citar de lá com link — e
          só então faz sentido discutir `Review` no schema.
        */}
        <section id="como-trabalhamos" className="py-20 defer-render">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Por que a M7</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink">
                O que você contrata quando contrata a M7
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  titulo: "Marcenaria, não revenda",
                  texto:
                    "Projetamos, cortamos e montamos no nosso ateliê em São José dos Pinhais. Não adaptamos módulo de catálogo ao seu vão.",
                },
                {
                  titulo: "Ferragem de linha alta",
                  texto:
                    "Blum, Häfele e Salice como padrão — corrediça com amortecimento, dobradiça regulável e sistema de abertura que dura.",
                },
                {
                  titulo: "Projeto executivo antes do corte",
                  texto:
                    "Você aprova o desenho com medidas reais, cor e ferragem definidas. A chapa só é cortada depois disso.",
                },
                {
                  titulo: "Equipe própria na instalação",
                  texto:
                    "Quem monta na sua casa é a nossa equipe, a mesma que produziu a peça — não uma montadora terceirizada.",
                },
              ].map((item) => (
                <div key={item.titulo} className="bg-background border border-border rounded p-6">
                  <h3 className="font-semibold text-ink">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="defer-render">
          <FaqSection items={HOME_FAQ} heading="Perguntas frequentes" />
        </div>
        <div className="bg-cream pb-16 -mt-8 text-center">
          <Link
            to="/perguntas-frequentes"
            className="inline-flex items-center gap-2 text-bronze hover:underline"
          >
            Ver todas as perguntas frequentes <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        {/* CTA FINAL */}
        <section className="bg-bronze text-primary-foreground">
          <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-[auto_1fr_auto] items-center gap-6">
            <div
              aria-hidden
              className="w-14 h-14 rounded-full bg-white/15 grid place-items-center shrink-0"
            >
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                Vamos criar juntos o ambiente dos seus sonhos?
              </h2>
              <p className="text-white text-sm mt-1">
                Fale com nossa equipe e receba um orçamento do seu projeto.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-bronze rounded font-medium hover:bg-white/90 transition-colors text-sm"
              >
                <Phone className="w-4 h-4" aria-hidden /> {PHONE_LOCAL}
              </a>
              <a
                href={whatsappLink("Olá M7 Movelaria, gostaria de solicitar um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-white/60 rounded font-medium hover:bg-white/10 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" aria-hidden /> Solicitar orçamento
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

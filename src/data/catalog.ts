import type { ImageName } from "@/assets/generated/images";

/**
 * Catálogo leve de serviços e cidades: só o que a navegação, o rodapé, a home e
 * os blocos de links cruzados precisam.
 *
 * Por que existe separado de `services.ts` / `cities.ts`: aqueles arquivos
 * carregam o texto longo de cada landing page (uns 60 KB). O rodapé aparece em
 * *todas* as páginas — se ele importasse o módulo inteiro, todo visitante
 * baixaria a prosa das 12 landing pages só para renderizar uma lista de links.
 * Aqui ficam os campos curtos; o conteúdo longo só entra no bundle da rota que
 * realmente o exibe.
 *
 * `services.ts` e `cities.ts` importam este arquivo e o estendem, então não há
 * duplicação de nome ou slug: a fonte de verdade dos dois é este catálogo.
 */

export type ServiceSummary = {
  slug: string;
  /** Nome curto — menu, rodapé, breadcrumb, schema. */
  name: string;
  /** Palavra-chave principal, como a pessoa digita no Google. */
  keyword: string;
  /** Uma linha, usada nos cards e no schema. */
  short: string;
  image: ImageName;
  imageAlt: string;
  /** <= 60 caracteres para não truncar na SERP. */
  title: string;
  /** <= 155 caracteres. */
  description: string;
  h1: string;
  /** Slugs de serviços relacionados — malha de links internos. */
  related: string[];
};

export const serviceCatalog: ServiceSummary[] = [
  {
    slug: "cozinhas-planejadas",
    name: "Cozinhas planejadas",
    keyword: "cozinha planejada",
    short: "Cozinha sob medida com torre quente, ilha e ferragens Blum.",
    image: "project-kitchen",
    imageAlt:
      "Cozinha planejada com bancada em quartzo, armários superiores e iluminação em LED embutida",
    title: "Cozinhas Planejadas em São José dos Pinhais | M7",
    description:
      "Cozinha planejada sob medida em São José dos Pinhais e Curitiba: torre quente, ilha, ferragens Blum e acabamento em laca ou lâmina natural. Peça o orçamento.",
    h1: "Cozinhas planejadas sob medida em São José dos Pinhais e Curitiba",
    related: ["dormitorios-planejados", "home-theater-e-painel-de-tv", "closets-planejados"],
  },
  {
    slug: "dormitorios-planejados",
    name: "Dormitórios planejados",
    keyword: "dormitório planejado",
    short: "Guarda-roupa, cabeceira e criados-mudos integrados ao quarto.",
    image: "finish-lamina-45",
    imageAlt:
      "Detalhe de marcenaria em lâmina natural com encaixe em 45 graus e continuidade de veio na quina",
    title: "Dormitórios Planejados sob Medida | M7 Movelaria",
    description:
      "Guarda-roupa, cabeceira e criado-mudo planejados sob medida em São José dos Pinhais e Curitiba. Portas de correr, gavetas internas e LED. Peça o orçamento.",
    h1: "Dormitórios e guarda-roupas planejados sob medida",
    related: ["closets-planejados", "home-theater-e-painel-de-tv", "cozinhas-planejadas"],
  },
  {
    slug: "closets-planejados",
    name: "Closets planejados",
    keyword: "closet planejado",
    short: "Closet aberto ou fechado com araras iluminadas e gaveteiros.",
    image: "project-closet",
    imageAlt: "Closet planejado com araras iluminadas em LED, gaveteiros internos e prateleiras",
    title: "Closets Planejados sob Medida | M7 Movelaria",
    description:
      "Closet planejado em São José dos Pinhais e Curitiba: araras iluminadas, gaveteiros com puxador usinado e módulos com porta de vidro. Peça o orçamento.",
    h1: "Closets planejados sob medida, abertos ou fechados",
    related: ["dormitorios-planejados", "home-office-planejado", "cozinhas-planejadas"],
  },
  {
    slug: "home-office-planejado",
    name: "Home office planejado",
    keyword: "home office planejado",
    short: "Escritório em casa com bancada, estante e passagem de cabos.",
    image: "project-office",
    imageAlt: "Home office planejado com bancada sob medida e estante iluminada em LED",
    title: "Home Office Planejado sob Medida | M7 Movelaria",
    description:
      "Home office planejado em São José dos Pinhais e Curitiba: bancada sob medida, estante iluminada e passagem de cabos escondida. Peça seu orçamento.",
    h1: "Home office planejado sob medida para trabalhar em casa",
    related: ["closets-planejados", "moveis-comerciais", "dormitorios-planejados"],
  },
  {
    slug: "moveis-comerciais",
    name: "Móveis planejados comerciais",
    keyword: "móveis planejados comerciais",
    short: "Recepções, lojas, consultórios e escritórios sob medida.",
    image: "hero-showroom-3d",
    imageAlt: "Vista isométrica em 3D de ambientes com marcenaria planejada integrada",
    title: "Móveis Planejados Comerciais | M7 Movelaria",
    description:
      "Marcenaria comercial sob medida em São José dos Pinhais e Curitiba: recepção, balcão, expositor e mobiliário de consultório e escritório. Fale conosco.",
    h1: "Móveis planejados para lojas, escritórios e consultórios",
    related: ["home-office-planejado", "cozinhas-planejadas", "home-theater-e-painel-de-tv"],
  },
  {
    slug: "home-theater-e-painel-de-tv",
    name: "Home theater e painel de TV",
    keyword: "painel de TV planejado",
    short: "Painel ripado, rack basculante e nichos com LED embutido.",
    image: "hero-living",
    imageAlt:
      "Sala de estar com painel de TV em marcenaria de madeira nogueira e prateleiras iluminadas",
    title: "Painel de TV e Home Theater Planejado | M7",
    description:
      "Painel de TV e home theater sob medida em São José dos Pinhais e Curitiba: painel ripado, rack basculante, nichos e LED embutido. Peça o orçamento.",
    h1: "Home theater e painel de TV planejados sob medida",
    related: ["cozinhas-planejadas", "dormitorios-planejados", "moveis-comerciais"],
  },
];

export type CitySummary = {
  slug: string;
  /** Precisa bater com SERVED_CITIES em seo.ts. */
  name: string;
  h1: string;
  title: string;
  description: string;
  image: ImageName;
  imageAlt: string;
};

export const cityCatalog: CitySummary[] = [
  {
    slug: "sao-jose-dos-pinhais",
    name: "São José dos Pinhais",
    h1: "Móveis planejados em São José dos Pinhais",
    title: "Móveis Planejados em São José dos Pinhais | M7",
    description:
      "Marcenaria sob medida em São José dos Pinhais: cozinhas, dormitórios, closets e home office. Ateliê na R. Orestes Fogiato, 710. Peça seu orçamento.",
    image: "project-kitchen",
    imageAlt: "Cozinha planejada sob medida com bancada em quartzo e armários até o teto",
  },
  {
    slug: "curitiba",
    name: "Curitiba",
    h1: "Móveis planejados em Curitiba",
    title: "Móveis Planejados em Curitiba sob Medida | M7",
    description:
      "Marcenaria de alto padrão sob medida em Curitiba: cozinhas, closets, home office e painel de TV. Atendemos Batel, Água Verde, Ecoville e região.",
    image: "hero-living",
    imageAlt: "Sala de estar com painel de TV e prateleiras iluminadas em marcenaria sob medida",
  },
  {
    slug: "pinhais",
    name: "Pinhais",
    h1: "Móveis planejados em Pinhais",
    title: "Móveis Planejados em Pinhais sob Medida | M7",
    description:
      "Marcenaria sob medida em Pinhais: cozinhas, guarda-roupas, closets e home office planejados. Atendemos Centro, Weissópolis e Alphaville Graciosa.",
    image: "project-closet",
    imageAlt: "Closet planejado com araras iluminadas em LED e gaveteiros internos",
  },
  {
    slug: "araucaria",
    name: "Araucária",
    h1: "Móveis planejados em Araucária",
    title: "Móveis Planejados em Araucária sob Medida | M7",
    description:
      "Marcenaria sob medida em Araucária: cozinhas planejadas, dormitórios, closets e móveis comerciais. Projeto, produção e instalação própria.",
    image: "project-office",
    imageAlt: "Home office planejado com bancada sob medida e estante iluminada",
  },
  {
    slug: "colombo",
    name: "Colombo",
    h1: "Móveis planejados em Colombo",
    title: "Móveis Planejados em Colombo sob Medida | M7",
    description:
      "Marcenaria sob medida em Colombo: cozinha planejada, guarda-roupa, closet e painel de TV. Medição no local e instalação pela nossa equipe.",
    image: "finish-lamina-45",
    imageAlt: "Detalhe de marcenaria em lâmina natural com encaixe em 45 graus",
  },
  {
    slug: "fazenda-rio-grande",
    name: "Fazenda Rio Grande",
    h1: "Móveis planejados em Fazenda Rio Grande",
    title: "Móveis Planejados em Fazenda Rio Grande | M7",
    description:
      "Marcenaria sob medida em Fazenda Rio Grande: cozinha planejada, guarda-roupa e home office. Projeto próprio, produção e instalação. Peça o orçamento.",
    image: "project-kitchen",
    imageAlt: "Cozinha planejada sob medida com armários até o teto e iluminação em LED",
  },
];

export const getServiceSummary = (slug: string) => serviceCatalog.find((s) => s.slug === slug);
export const getCitySummary = (slug: string) => cityCatalog.find((c) => c.slug === slug);

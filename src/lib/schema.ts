/**
 * Construtores de JSON-LD (schema.org).
 *
 * Regras que valem para todo este arquivo:
 *
 * 1. **Uma entidade, um `@id`.** Antes o site declarava `Organization` no root e
 *    `FurnitureStore` na home, ambos sem `@id` — para o Google eram duas empresas
 *    diferentes com o mesmo nome. Agora existe um único nó de negócio
 *    (`ID_BUSINESS`) e todas as páginas apenas o referenciam.
 * 2. **Nada de dado inventado.** CNPJ, CEP, coordenadas, nota de avaliação e
 *    quantidade de reviews só entram quando o cliente confirmar. Marcar
 *    `aggregateRating` sem review real é infração de diretriz do Google
 *    (structured data spam) e do CDC art. 37 — ver AGENTS.md.
 */
import {
  SITE_URL,
  SITE_NAME,
  LOGO_URL,
  OG_IMAGE,
  PHONE_E164,
  EMAIL,
  POSTAL_ADDRESS,
  OPENING_HOURS,
  GEO,
  SERVED_CITIES,
  ID_BUSINESS,
  ID_WEBSITE,
  ID_LOGO,
  canonical,
} from "./seo";
import { serviceCatalog } from "@/data/catalog";

type Json = Record<string, unknown>;

/** Empacota um grafo JSON-LD no formato aceito pelo `head().scripts` das rotas. */
export function jsonLd(nodes: Json[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }),
  };
}

/**
 * Nós globais: a empresa e o site. Renderizados uma única vez, no root.
 * Todas as outras páginas se penduram neles por `@id`.
 */
export function globalGraph(): Json[] {
  return [
    {
      "@type": ["FurnitureStore", "HomeAndConstructionBusiness"],
      "@id": ID_BUSINESS,
      name: SITE_NAME,
      alternateName: "M7 Movelaria — Móveis Planejados",
      url: `${SITE_URL}/`,
      logo: { "@id": ID_LOGO },
      image: [OG_IMAGE, LOGO_URL],
      telephone: PHONE_E164,
      email: EMAIL,
      address: POSTAL_ADDRESS,
      ...(GEO ? { geo: { "@type": "GeoCoordinates", ...GEO } } : {}),
      openingHoursSpecification: OPENING_HOURS,
      currenciesAccepted: "BRL",
      description:
        "Marcenaria de alto padrão em São José dos Pinhais (PR). Móveis planejados sob medida — cozinhas, dormitórios, closets, home office e ambientes comerciais — com ferragens Blum, Häfele e Salice.",
      areaServed: SERVED_CITIES.map((city) => ({
        "@type": "City",
        name: city,
        containedInPlace: { "@type": "State", name: "Paraná" },
      })),
      knowsAbout: [
        "Móveis planejados",
        "Marcenaria sob medida",
        "Cozinhas planejadas",
        "Closets planejados",
        "Home office planejado",
        "Ferragens Blum",
        "Ferragens Häfele",
        "Laca fosca",
        "Lâmina natural 45 graus",
      ],
      // sameAs fica vazio até existirem perfis reais (Instagram, Google, Facebook).
      // Declarar perfil inexistente quebra a validação de entidade no Google.
      // O `itemOffered` referencia por `@id` o mesmo Service que a página do
      // serviço declara. Sem isso, a página de cozinhas servia dois nós: um
      // anônimo vindo daqui com serviceType "Cozinhas planejadas" e o da
      // própria página com "cozinha planejada" — dois serviços diferentes para
      // o Google. Merge de `@id` com propriedades parciais é JSON-LD válido, e
      // o nome fica declarado para a home não listar seis ofertas sem rótulo.
      makesOffer: serviceCatalog.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@id": `${canonical(`/moveis-planejados/${s.slug}`)}#service`,
          "@type": "Service",
          name: s.name,
          serviceType: s.name,
        },
      })),
    },
    {
      "@type": "ImageObject",
      "@id": ID_LOGO,
      url: LOGO_URL,
      contentUrl: LOGO_URL,
      width: 512,
      height: 512,
      caption: SITE_NAME,
    },
    {
      "@type": "WebSite",
      "@id": ID_WEBSITE,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      inLanguage: "pt-BR",
      publisher: { "@id": ID_BUSINESS },
    },
  ];
}

/** Nó `WebPage` da página atual, já ligado ao site e à empresa. */
export function webPage(opts: {
  path: string;
  name: string;
  description: string;
  image?: string;
  breadcrumb?: Array<{ name: string; path: string }>;
}): Json[] {
  const url = canonical(opts.path);
  const nodes: Json[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: opts.name,
      description: opts.description,
      inLanguage: "pt-BR",
      isPartOf: { "@id": ID_WEBSITE },
      about: { "@id": ID_BUSINESS },
      primaryImageOfPage: { "@type": "ImageObject", url: opts.image ?? OG_IMAGE },
      ...(opts.breadcrumb?.length ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    },
  ];
  if (opts.breadcrumb?.length) nodes.push(breadcrumb(url, opts.breadcrumb));
  return nodes;
}

export function breadcrumb(pageUrl: string, trail: Array<{ name: string; path: string }>): Json {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: canonical(t.path),
    })),
  };
}

/**
 * FAQPage. Marcação válida do conteúdo — mas o resultado com sanfona na SERP
 * saiu do ar para este tipo de site em agosto/2023 (restrito a governo e
 * saúde). Serve para o Google entender a página, não para ganhar espaço.
 */
export function faqPage(pageUrl: string, faqs: Array<{ q: string; a: string }>): Json {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function service(opts: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  cities?: readonly string[];
}): Json {
  return {
    "@type": "Service",
    "@id": `${canonical(opts.path)}#service`,
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    provider: { "@id": ID_BUSINESS },
    areaServed: (opts.cities ?? SERVED_CITIES).map((city) => ({ "@type": "City", name: city })),
    url: canonical(opts.path),
  };
}

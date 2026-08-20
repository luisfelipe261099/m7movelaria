/**
 * Fonte única de verdade para URLs, dados do negócio (NAP) e meta tags de SEO.
 *
 * IMPORTANTE: se o domínio mudar, basta alterar SITE_URL aqui — canonicals,
 * og:url, sitemap, schema e links internos seguem juntos. O `Sitemap:` de
 * `public/robots.txt` é o único lugar fora deste módulo (atualizar junto).
 */
export const SITE_URL = "https://m7movelaria.com.br";

export const SITE_NAME = "M7 Movelaria";
export const OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
export const LOGO_URL = `${SITE_URL}/logo-512.png`;

/**
 * NAP (Name, Address, Phone) — precisa bater *caractere por caractere* com o
 * Perfil da Empresa no Google. Inconsistência de NAP é um dos fatores que mais
 * derruba ranking no pacote local.
 */
/** Formato de máquina (E.164) — schema.org e href="tel:". */
export const PHONE_E164 = "+5541987116308";
/** Formato de exibição, igual ao do Perfil da Empresa no Google. */
export const PHONE_LOCAL = "(41) 98711-6308";
export const EMAIL = "m7movelaria@outlook.com.br";
export const STREET_ADDRESS = "R. Orestes Fogiato, 710";
export const CITY = "São José dos Pinhais";
export const REGION = "PR";
export const COUNTRY = "BR";
/** CEP e coordenadas ainda não confirmados pelo cliente — ver README. */
export const POSTAL_CODE = "";
export const GEO: { latitude: number; longitude: number } | null = null;

/** Cidades atendidas — usado em schema (areaServed) e nas landing pages locais. */
export const SERVED_CITIES = [
  "São José dos Pinhais",
  "Curitiba",
  "Pinhais",
  "Araucária",
  "Colombo",
  "Fazenda Rio Grande",
  "Piraquara",
  "Quatro Barras",
] as const;

/**
 * Código de verificação do Google Search Console.
 * Definir `VITE_GOOGLE_SITE_VERIFICATION` nas variáveis de ambiente da Vercel
 * (Settings → Environment Variables) com o valor do método "tag HTML" —
 * só o conteúdo do `content=`, sem as aspas nem a tag inteira.
 */
export const GOOGLE_SITE_VERIFICATION: string = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ?? "";

type PageSeoOptions = {
  title: string;
  description: string;
  /** Caminho da página começando com "/" (ex.: "/contato"). */
  path: string;
  /** Sobrescreve a imagem de compartilhamento padrão. */
  image?: string;
  /** og:type — "website" (padrão) ou "article" em conteúdos editoriais. */
  type?: "website" | "article";
  /** Tira a página do índice (ex.: rota de erro). */
  noindex?: boolean;
};

/**
 * Diretiva de indexação. `max-image-preview:large` é o que libera a miniatura
 * grande nos resultados do Google — sem ela o Discover/Imagens usa thumbnail
 * pequena ou nenhuma.
 */
const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

/**
 * Gera o conjunto completo de meta tags + canonical de uma página.
 * Uso no `head()` das rotas: `head: () => ({ ...pageSeo({ ... }) })`.
 */
export function pageSeo({
  title,
  description,
  path,
  image = OG_IMAGE,
  type = "website",
  noindex = false,
}: PageSeoOptions) {
  const url = canonical(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: noindex ? "noindex, follow" : ROBOTS_INDEX },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `${SITE_NAME} — móveis planejados sob medida` },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** URL absoluta e canônica de um caminho interno. */
export function canonical(path: string) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

/** Nó JSON-LD reaproveitável — evita repetir o endereço em cada schema. */
export const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: STREET_ADDRESS,
  addressLocality: CITY,
  addressRegion: REGION,
  addressCountry: COUNTRY,
  ...(POSTAL_CODE ? { postalCode: POSTAL_CODE } : {}),
} as const;

export const OPENING_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "08:00",
    closes: "12:00",
  },
] as const;

/** @id estáveis: permitem que os nós JSON-LD de páginas diferentes se refiram
 *  à *mesma* entidade em vez de criarem uma empresa nova a cada página. */
export const ID_BUSINESS = `${SITE_URL}/#business`;
export const ID_WEBSITE = `${SITE_URL}/#website`;
export const ID_LOGO = `${SITE_URL}/#logo`;

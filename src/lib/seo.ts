/**
 * Fonte única de verdade para URLs, dados do negócio (NAP) e meta tags de SEO.
 *
 * Canonicals, og:url, sitemap, robots.txt, schema e links internos saem todos
 * daqui — mudar esta linha (ou a variável de ambiente) move o site inteiro.
 *
 * ATENÇÃO ao `www`: hoje a Vercel tem `www.m7movelaria.com.br` como domínio
 * primário e responde 308 no apex. O canonical precisa apontar para o host que
 * devolve 200, senão cada página manda o Google para uma URL que redireciona.
 * Se um dia o primário virar o apex, trocar aqui (ou definir VITE_SITE_URL).
 */
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "https://www.m7movelaria.com.br";

export const SITE_NAME = "M7 Movelaria";
export const OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
export const LOGO_URL = `${SITE_URL}/logo-512.png`;

/**
 * NAP (Name, Address, Phone) — precisa bater *caractere por caractere* com o
 * Perfil da Empresa no Google. Inconsistência de NAP é um dos fatores que mais
 * derruba ranking no pacote local.
 *
 * Estas constantes são a única fonte do telefone no site: o link do WhatsApp,
 * todo `href="tel:"`, o schema.org e o número exibido saem daqui, inclusive o
 * `WHATSAPP_NUMBER` de `src/lib/whatsapp.ts`, que é derivado do `PHONE_E164`.
 * A única cópia manual que sobra é `public/llms.txt`, que é arquivo estático e
 * não passa pelo bundler — ao trocar o número, edite os dois.
 */
/** Formato de máquina (E.164) — schema.org e href="tel:". */
export const PHONE_E164 = "+5541987116308";
/** Formato de exibição, igual ao do Perfil da Empresa no Google. */
export const PHONE_LOCAL = "(41) 98711-6308";
export const EMAIL = "m7movelaria@outlook.com.br";
export const STREET_ADDRESS = "R. Henrique Bortolam, 182 - Costeira";
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
  /**
   * Dimensões e alt da imagem de compartilhamento. Só fazem sentido junto
   * com `image`: o padrão (og-cover.jpg) é 1200x630 com alt genérico, e é
   * isso que vale quando nada é passado. WhatsApp e Facebook montam o card
   * com width/height declarados antes de baixar a imagem — declarar 630 para
   * uma foto de 896 de altura entrega o primeiro card com proporção errada.
   */
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
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
  imageWidth = 1200,
  imageHeight = 630,
  imageAlt = `${SITE_NAME} — móveis planejados sob medida`,
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
      { property: "og:image:width", content: String(imageWidth) },
      { property: "og:image:height", content: String(imageHeight) },
      { property: "og:image:alt", content: imageAlt },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: imageAlt },
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

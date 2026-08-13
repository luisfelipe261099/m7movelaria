/**
 * Fonte única de verdade para URLs e meta tags de SEO.
 *
 * IMPORTANTE: se o domínio definitivo mudar (ex.: migrar para m7movelaria.com.br),
 * basta alterar SITE_URL aqui — canonicals, og:url, sitemap e schema seguem juntos.
 * O robots.txt (public/robots.txt) precisa ser atualizado manualmente.
 */
export const SITE_URL = "https://m7movelaria.online";

export const SITE_NAME = "M7 Movelaria";
export const OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
export const LOGO_URL = `${SITE_URL}/logo-512.png`;
export const PHONE_DISPLAY = "+55 41 98711-6308";

type PageSeoOptions = {
  title: string;
  description: string;
  /** Caminho da página começando com "/" (ex.: "/contato"). */
  path: string;
  /** Sobrescreve a imagem de compartilhamento padrão. */
  image?: string;
};

/**
 * Gera o conjunto completo de meta tags + canonical de uma página.
 * Uso no `head()` das rotas: `head: () => ({ ...pageSeo({ ... }) })`.
 */
export function pageSeo({ title, description, path, image = OG_IMAGE }: PageSeoOptions) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

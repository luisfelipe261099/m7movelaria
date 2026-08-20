import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { SITE_URL } from "./lib/seo";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const CANONICAL_HOST = new URL(SITE_URL).host;

/** Rotas cujo HTML pode ser guardado na CDN — todo o site é conteúdo estático. */
const HTML_CACHE_CONTROL = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";

/**
 * Middleware de resposta. Faz três coisas que só dá para fazer aqui:
 *
 * 1. **Cache do HTML na CDN.** Sem `s-maxage` a Vercel não guarda o HTML e toda
 *    visita paga o tempo de execução da função (incluindo cold start) dentro do
 *    TTFB, que entra direto no LCP. `max-age=0` mantém o navegador sempre
 *    revalidando (o conteúdo pode mudar a cada deploy) enquanto a CDN serve de
 *    cache compartilhado, e `stale-while-revalidate` evita que a expiração do
 *    cache faça alguém esperar pela função.
 *
 * 2. **noindex fora do domínio canônico.** O alias `*.vercel.app` e as URLs de
 *    preview servem o site inteiro com 200. Sem isso o Google indexa duas
 *    cópias do mesmo conteúdo e escolhe sozinho qual mostrar. Escolhemos
 *    `X-Robots-Tag` em vez de redirecionar por host porque redirect mataria os
 *    previews de deploy — e porque, enquanto o DNS de m7movelaria.com.br não
 *    estiver apontado, um redirect deixaria o site inacessível.
 *
 * 3. **Cabeçalhos de segurança.** Baratos, e o `Referrer-Policy` também evita
 *    vazar a URL completa para o WhatsApp e para os sites externos linkados.
 */
const responseMiddleware = createMiddleware().server(async ({ next, request }) => {
  // Normalização de URL. A ordem importa: barra final primeiro, senão
  // "/Contato/" encadearia dois redirects. 308 (e não 307) porque é permanente
  // — é o que consolida os sinais na URL canônica em vez de dividi-los.
  const url = new URL(request.url);
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    return new Response(null, {
      status: 308,
      headers: { location: url.pathname.replace(/\/+$/, "") + url.search },
    });
  }
  // Minúsculas: /Contato e /contato respondiam 200 as duas, virando conteúdo
  // duplicado. Seguro porque *todos* os slugs do site (src/data/catalog.ts e
  // src/data/projects.ts) são minúsculos — se um dia entrar slug com maiúscula,
  // esta regra precisa mudar junto.
  const lower = url.pathname.toLowerCase();
  if (lower !== url.pathname) {
    return new Response(null, { status: 308, headers: { location: lower + url.search } });
  }

  const result = await next();
  const response = result.response;
  if (!(response instanceof Response)) return result;

  const headers = response.headers;
  const contentType = headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html");

  // Só 200: sem o guard de status, uma 404 ou o HTML de erro 500 ficaria preso
  // na CDN por uma hora — regressão bem pior do que o problema que o cache
  // resolve.
  if (isHtml && response.status === 200 && !headers.has("cache-control")) {
    headers.set("cache-control", HTML_CACHE_CONTROL);
  }

  // Preload da fonte por header HTTP. No HTML, o Float do React 19 iça o
  // stylesheet e os modulepreload para antes dos <link> declarativos da rota,
  // então o preload da fonte acaba atrás de centenas de KB de JS. O header
  // chega antes do primeiro byte de HTML. `crossorigin` é obrigatório mesmo
  // sendo mesma origem — fonte é sempre buscada em modo CORS, e sem ele o
  // preload é descartado e o arquivo baixa duas vezes.
  if (isHtml) {
    headers.set(
      "link",
      '</fonts/inter-latin.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
    );
  }

  // O host de verdade chega em x-forwarded-host atrás do proxy da Vercel.
  const host = request.headers.get("x-forwarded-host") ?? new URL(request.url).host;
  if (
    host &&
    host !== CANONICAL_HOST &&
    !host.startsWith("localhost") &&
    !host.startsWith("127.")
  ) {
    headers.set("x-robots-tag", "noindex, nofollow");
  }

  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, responseMiddleware],
}));

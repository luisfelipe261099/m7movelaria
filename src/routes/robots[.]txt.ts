import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt como rota, e não como arquivo estático em public/.
 *
 * Motivo: a linha `Sitemap:` precisa do domínio absoluto. Como arquivo estático
 * ela era o único lugar do projeto com o domínio hardcoded fora de
 * `src/lib/seo.ts` — ou seja, um passo manual fácil de esquecer numa troca de
 * domínio, e um erro silencioso (o Google simplesmente para de encontrar o
 * sitemap). Aqui ela acompanha o SITE_URL sozinha.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = [
          "# M7 Movelaria",
          "# O site inteiro é público e deve ser rastreado. Nada é bloqueado de",
          "# propósito: bloquear CSS/JS impede o Google de renderizar a página e",
          "# derruba a avaliação de mobile-friendly.",
          "",
          "User-agent: *",
          "Allow: /",
          "",
          `Sitemap: ${SITE_URL}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});

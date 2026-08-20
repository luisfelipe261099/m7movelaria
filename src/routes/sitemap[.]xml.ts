import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { projects } from "@/data/projects";
import { serviceCatalog, cityCatalog } from "@/data/catalog";
import { images } from "@/assets/generated/images";
import { SITE_URL } from "@/lib/seo";

/**
 * `lastmod` precisa ser a data em que o conteúdo *realmente* mudou. Gerar
 * `new Date()` a cada requisição faz todas as URLs parecerem atualizadas o tempo
 * todo — o Google detecta isso e passa a ignorar o campo no site inteiro.
 * Então: constante, atualizada à mão quando o conteúdo da rota mudar.
 */
const LASTMOD = "2026-08-20";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  /** Imagens da página, para a extensão de imagens do sitemap. */
  images?: Array<{ loc: string; title: string }>;
}

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/moveis-planejados", changefreq: "monthly", priority: "0.9" },
          ...serviceCatalog.map((s) => ({
            path: `/moveis-planejados/${s.slug}`,
            changefreq: "monthly" as const,
            priority: "0.9",
            images: [{ loc: `${SITE_URL}${images[s.image].src}`, title: s.imageAlt }],
          })),
          ...cityCatalog.map((c) => ({
            path: `/moveis-planejados-em/${c.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
            images: [{ loc: `${SITE_URL}${images[c.image].src}`, title: c.imageAlt }],
          })),
          { path: "/showroom-3d", changefreq: "monthly", priority: "0.8" },
          { path: "/projetos", changefreq: "monthly", priority: "0.8" },
          ...projects.map((p) => ({
            path: `/projetos/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          { path: "/perguntas-frequentes", changefreq: "monthly", priority: "0.7" },
          { path: "/sobre", changefreq: "yearly", priority: "0.6" },
          { path: "/contato", changefreq: "yearly", priority: "0.7" },
          { path: "/politica-de-privacidade", changefreq: "yearly", priority: "0.2" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(`${SITE_URL}${e.path}`)}</loc>`,
            `    <lastmod>${e.lastmod ?? LASTMOD}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            ...(e.images ?? []).map((img) =>
              [
                `    <image:image>`,
                `      <image:loc>${escapeXml(img.loc)}</image:loc>`,
                `      <image:title>${escapeXml(img.title)}</image:title>`,
                `    </image:image>`,
              ].join("\n"),
            ),
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // s-maxage para a CDN guardar: sem ele a Vercel executa a função a
            // cada requisição do sitemap.
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});

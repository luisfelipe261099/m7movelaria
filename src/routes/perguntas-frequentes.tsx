import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Breadcrumbs, CtaBand } from "@/components/PageParts";
import { pageSeo, canonical } from "@/lib/seo";
import { jsonLd, webPage, faqPage } from "@/lib/schema";

const PATH = "/perguntas-frequentes";
const TRAIL = [
  { name: "Início", path: "/" },
  { name: "Perguntas frequentes", path: PATH },
];

export const Route = createFileRoute("/perguntas-frequentes")({
  // Ver a nota na rota de serviço: import dinâmico mantém as respostas fora do
  // chunk compartilhado que todas as páginas baixam.
  loader: async () => {
    const { faq, faqGroups } = await import("@/data/faq");
    return { faq, faqGroups };
  },
  head: ({ loaderData }) => ({
    ...pageSeo({
      title: "Perguntas Frequentes | M7 Movelaria",
      description:
        "Preço, prazo, materiais, ferragens e instalação de móveis planejados: as dúvidas mais comuns respondidas pela M7 Movelaria.",
      path: PATH,
    }),
    scripts: [
      jsonLd([
        ...webPage({
          path: PATH,
          name: "Perguntas frequentes sobre móveis planejados",
          description:
            "Dúvidas comuns sobre preço, prazo, materiais, ferragens e instalação de marcenaria sob medida.",
          breadcrumb: TRAIL,
        }),
        // FAQPage com todas as perguntas. Descreve o conteúdo para o Google; o
        // resultado com sanfona na SERP não vale mais para este tipo de site
        // desde agosto/2023 (ficou restrito a governo e saúde).
        faqPage(
          canonical(PATH),
          (loaderData?.faq ?? []).map((f) => ({ q: f.q, a: f.a })),
        ),
      ]),
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { faq, faqGroups } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-cream">
          <div className="max-w-3xl mx-auto px-6 pt-8 pb-14">
            <Breadcrumbs trail={TRAIL} />
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-bronze mb-4">Dúvidas</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] text-ink text-balance">
              Perguntas frequentes sobre móveis planejados
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              As dúvidas que mais aparecem antes de um orçamento de marcenaria sob medida —
              respondidas sem rodeio. Se a sua pergunta não estiver aqui, mande no WhatsApp que a
              gente responde e ela provavelmente entra nesta página.
            </p>
          </div>
        </section>

        {faqGroups.map((group, gi) => {
          const items = faq.filter((f) => f.group === group);
          if (!items.length) return null;
          return (
            <section key={group} className={gi % 2 === 1 ? "bg-cream py-14" : "py-14"}>
              <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-2xl md:text-3xl font-bold text-ink">{group}</h2>
                <div className="mt-6 divide-y divide-border">
                  {items.map((f) => (
                    <details key={f.q} className="group py-4" open>
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-semibold text-ink marker:content-none">
                        <span>{f.q}</span>
                        <span
                          aria-hidden
                          className="mt-1 text-bronze transition-transform group-open:rotate-45 shrink-0 text-xl leading-none"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        <CtaBand context="móveis planejados sob medida" />
      </main>
      <SiteFooter />
    </div>
  );
}

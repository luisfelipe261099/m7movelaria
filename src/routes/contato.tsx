import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { whatsappLink } from "@/lib/whatsapp";
import { pageSeo } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  head: () => ({
    ...pageSeo({
      title: "Solicite seu Orçamento — M7 Movelaria",
      description:
        "Fale com a M7 Movelaria para orçamento de móveis planejados em São José dos Pinhais e região: WhatsApp (41) 98711-6308 ou e-mail.",
      path: "/contato",
    }),
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-32 pb-24 max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-bronze mb-3">Contato</p>
        <h1 className="font-display text-5xl md:text-6xl">Solicite seu Orçamento</h1>
        <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
          Envie os detalhes do seu projeto — arquiteto, ambientes e briefing — e nossa equipe
          entrará em contato para agendar uma visita ao ateliê.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={whatsappLink("Olá M7 Movelaria, gostaria de solicitar um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-bronze text-primary-foreground text-sm uppercase tracking-widest hover:opacity-90 transition"
          >
            WhatsApp
          </a>
          <a
            href="mailto:m7movelaria@outlook.com.br"
            className="px-8 py-3 border border-bronze text-bronze text-sm uppercase tracking-widest hover:bg-bronze hover:text-primary-foreground transition"
          >
            E-mail
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

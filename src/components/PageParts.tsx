import { Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, MapPin, Phone } from "lucide-react";
import { whatsappLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { PHONE_LOCAL, STREET_ADDRESS, CITY, REGION } from "@/lib/seo";
import { Picture } from "@/components/Picture";
import type { ImageName } from "@/assets/generated/images";

/**
 * Blocos reaproveitados pelas landing pages de serviço e de cidade.
 *
 * Duas decisões que valem para todos eles:
 *  - nada aqui usa estado do React. Landing page é conteúdo, e o que der para
 *    entregar em HTML puro não custa nada de hidratação (TBT no Lighthouse).
 *  - o FAQ usa <details>/<summary> nativo em vez de acordeão em JS: acessível
 *    por padrão, indexável (o texto está no DOM mesmo fechado) e zero KB.
 */

export function Breadcrumbs({ trail }: { trail: Array<{ name: string; path: string }> }) {
  const last = trail[trail.length - 1];
  return (
    <nav aria-label="Trilha de navegação" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.slice(0, -1).map((t) => (
          <li key={t.path} className="flex items-center gap-2">
            <Link to={t.path} className="hover:text-bronze transition-colors">
              {t.name}
            </Link>
            <span aria-hidden className="text-border">
              /
            </span>
          </li>
        ))}
        <li aria-current="page" className="text-ink">
          {last.name}
        </li>
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  h1,
  intro,
  image,
  imageAlt,
  trail,
}: {
  eyebrow: string;
  h1: string;
  intro: string[];
  image: ImageName;
  imageAlt: string;
  trail: Array<{ name: string; path: string }>;
}) {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-14 lg:pb-20">
        <Breadcrumbs trail={trail} />
        <div className="mt-8 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-bronze mb-4">{eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] text-ink text-balance">
              {h1}
            </h1>
            {intro.map((p) => (
              <p key={p.slice(0, 30)} className="mt-5 text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappLink(`Olá M7 Movelaria, gostaria de um orçamento de ${h1}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden /> Pedir orçamento no WhatsApp
              </a>
              <Link
                to="/projetos"
                className="inline-flex items-center gap-2 px-6 py-3 border border-bronze text-bronze rounded hover:bg-bronze hover:text-primary-foreground transition-colors"
              >
                Ver o portfólio de projetos <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </div>
          {/* A imagem do topo é a candidata a LCP desta rota — por isso priority. */}
          <div className="relative aspect-[4/3] overflow-hidden rounded shadow-lg bg-ink">
            <Picture
              name={image}
              alt={imageAlt}
              priority
              className="w-full h-full object-cover"
              sizes="(min-width: 1024px) 46vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContentSection({
  h2,
  body,
  bullets,
  tone = "light",
}: {
  h2: string;
  body?: string;
  bullets?: readonly string[];
  tone?: "light" | "cream";
}) {
  return (
    <section className={tone === "cream" ? "bg-cream py-14" : "py-14"}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-ink text-balance">{h2}</h2>
        {body && <p className="mt-5 text-muted-foreground leading-relaxed">{body}</p>}
        {bullets && (
          <ul className="mt-6 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3 text-ink leading-relaxed">
                <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-bronze shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function FaqSection({
  items,
  heading = "Perguntas frequentes",
  tone = "cream",
}: {
  items: ReadonlyArray<{ q: string; a: string; link?: { to: string; label: string } }>;
  heading?: string;
  tone?: "light" | "cream";
}) {
  return (
    <section className={tone === "cream" ? "bg-cream py-16" : "py-16"}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-ink">{heading}</h2>
        <div className="mt-8 divide-y divide-border">
          {items.map((f) => (
            <details key={f.q} className="group py-4">
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
              {/* Sublinhado, e não só colorido: cor sozinha não distingue link
                  de texto corrido (WCAG 1.4.1). */}
              {f.link && (
                <Link
                  to={f.link.to}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-bronze underline hover:text-bronze-dark"
                >
                  {f.link.label} <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RelatedLinks({
  heading,
  links,
}: {
  heading: string;
  /**
   * `desc` é opcional: a página de cidade passava aqui a própria meta
   * description de cada vizinha, e o texto que deveria ser exclusivo da
   * `<meta>` acabava reimpresso no corpo das outras cinco cidades.
   */
  links: Array<{ to: string; label: string; desc?: string }>;
}) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-ink">{heading}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block border border-border rounded p-6 hover:border-bronze/60 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-ink">{l.label}</h3>
              {l.desc && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze">
                Ver página <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Faixa final com NAP visível. Repetir endereço e telefone em texto (não só no
 * rodapé) é sinal local — e o formato tem que bater com o Perfil da Empresa no
 * Google, caractere por caractere.
 */
export function CtaBand({ context }: { context: string }) {
  return (
    <section className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-balance">
            Peça um orçamento de {context}
          </h2>
          <p className="mt-3 text-white/70 leading-relaxed">
            Envie a planta ou as medidas pelo WhatsApp. Nossa equipe retorna com as próximas etapas
            e agenda a visita técnica.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappLink(`Olá M7 Movelaria, gostaria de um orçamento de ${context}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground rounded hover:bg-bronze-dark transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden /> Falar no WhatsApp
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/60 rounded hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden /> {PHONE_LOCAL}
            </a>
          </div>
        </div>
        <address className="not-italic text-sm text-white/70 leading-relaxed md:justify-self-end">
          <p className="text-bronze uppercase tracking-widest text-xs mb-3">Ateliê M7 Movelaria</p>
          <p className="flex gap-2">
            <MapPin className="w-4 h-4 text-bronze shrink-0 mt-0.5" aria-hidden />
            <span>
              {STREET_ADDRESS}
              <br />
              {CITY} - {REGION}
            </span>
          </p>
          <p className="mt-3">Seg a Sex: 8h às 18h · Sáb: 8h às 12h</p>
        </address>
      </div>
    </section>
  );
}

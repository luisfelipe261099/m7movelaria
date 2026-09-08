import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Menu, X, Calculator } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { EMAIL, PHONE_E164, PHONE_LOCAL, STREET_ADDRESS, CITY, REGION } from "@/lib/seo";
import { serviceCatalog, cityCatalog } from "@/data/catalog";

/**
 * Menu principal. Antes eram quase só âncoras (#sobre, #servicos) apontando para
 * a home — âncora não é URL indexável, então nenhuma página interna recebia link
 * de navegação. Agora cada item de peso aponta para uma página real; o rodapé
 * completa a malha com os serviços e as cidades.
 */
const nav = [
  { label: "Móveis planejados", to: "/moveis-planejados" },
  { label: "Projetos", to: "/projetos" },
  { label: "Showroom 3D", to: "/showroom-3d" },
  { label: "Sobre", to: "/sobre" },
  { label: "Dúvidas", to: "/perguntas-frequentes" },
  { label: "Contato", to: "/contato" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-background">
      {/* Top bar — NAP visível em todas as páginas (sinal local). */}
      <div className="bg-cream border-b border-border/60 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0">
            <span className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-bronze shrink-0" aria-hidden />
              <span className="truncate">
                {STREET_ADDRESS} — {CITY} - {REGION}
              </span>
            </span>
            <a
              href={`tel:${PHONE_E164}`}
              className="hidden md:flex items-center gap-2 hover:text-bronze"
            >
              <Phone className="w-3.5 h-3.5 text-bronze" aria-hidden />
              {PHONE_LOCAL}
            </a>
          </div>
        </div>
      </div>
      {/* Main nav */}
      <div className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <Link to="/" className="flex flex-col justify-center leading-none py-2">
            <span className="font-display text-3xl text-bronze tracking-widest">M7</span>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Movelaria
            </span>
          </Link>
          <nav aria-label="Menu principal" className="hidden lg:flex items-center gap-7 text-sm">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="text-ink hover:text-bronze transition-colors"
                activeProps={{ className: "text-bronze" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {/* "Orçamento" leva ao simulador, não ao WhatsApp: o WhatsApp tem
                o botão flutuante em toda página (WhatsAppFlutuante). */}
            <Link
              to="/orcamento"
              className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-bronze text-primary-foreground text-sm font-medium rounded hover:bg-bronze-dark transition-colors"
            >
              <Calculator className="w-4 h-4" aria-hidden /> Solicitar Orçamento
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              className="lg:hidden w-11 h-11 grid place-items-center rounded border border-border text-ink hover:border-bronze hover:text-bronze transition-colors"
            >
              {menuOpen ? (
                <X className="w-5 h-5" aria-hidden />
              ) : (
                <Menu className="w-5 h-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="menu-mobile"
          aria-label="Menu principal"
          className="lg:hidden border-b border-border bg-background shadow-lg max-h-[70vh] overflow-y-auto"
        >
          <ul className="max-w-7xl mx-auto px-6 py-4">
            <li>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-ink hover:text-bronze border-b border-border/40 transition-colors"
                activeProps={{ className: "text-bronze" }}
                activeOptions={{ exact: true }}
              >
                Início
              </Link>
            </li>
            {nav.map((n) => (
              <li key={n.label}>
                <Link
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-ink hover:text-bronze border-b border-border/40 transition-colors"
                  activeProps={{ className: "text-bronze" }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 pb-2 flex flex-wrap gap-3">
              <Link
                to="/orcamento"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-bronze text-primary-foreground text-sm font-medium rounded hover:bg-bronze-dark transition-colors"
              >
                <Calculator className="w-4 h-4" aria-hidden /> Solicitar Orçamento
              </Link>
              <a
                href={`tel:${PHONE_E164}`}
                className="inline-flex items-center gap-2 px-5 py-3 border border-bronze text-bronze text-sm font-medium rounded hover:bg-bronze hover:text-primary-foreground transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden /> {PHONE_LOCAL}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/**
 * Botão flutuante do WhatsApp, em toda página que tem rodapé.
 *
 * Existe porque os botões "orçamento" passaram a levar ao simulador: o
 * WhatsApp continua a um toque, só que num lugar fixo. Verde do WhatsApp de
 * propósito (é o ícone que a pessoa reconhece), sem JS, `fixed` com respeito
 * à área segura do iPhone. z-40: fica abaixo do showroom em tela cheia
 * (z-200) e da gaveta de hotspot (z-50), que precisam cobrir a tela.
 */
export function WhatsAppFlutuante() {
  return (
    <a
      href={whatsappLink("Olá M7 Movelaria, gostaria de falar sobre um projeto.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a M7 no WhatsApp"
      className="fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] pl-3 pr-3 sm:pr-4 py-3 hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] transition-colors print:hidden"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
    </a>
  );
}

export function SiteFooter() {
  return (
    <>
      {/* Irmão do <footer>, nunca filho: o rodapé tem `content-visibility`
          (defer-render), que cria bloco de contenção — um `fixed` lá dentro
          fica preso ao rodapé em vez de à tela. */}
      <WhatsAppFlutuante />
      <footer className="bg-ink text-white/80 defer-render">
        <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <div className="font-display text-3xl text-bronze tracking-widest">M7</div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/60 mt-1 mb-4">
              Movelaria
            </div>
            <p className="text-white/70 max-w-xs leading-relaxed">
              Marcenaria de alto padrão em São José dos Pinhais. Projeto executivo, produção no
              ateliê e instalação com equipe própria.
            </p>
          </div>

          {/* Rodapé é onde a malha de links internos se fecha: toda página do site
            alcança todos os serviços e todas as cidades em um clique. */}
          <nav aria-labelledby="rodape-servicos">
            <h2 id="rodape-servicos" className="text-bronze uppercase tracking-widest text-xs mb-4">
              Serviços
            </h2>
            <ul className="text-white/70">
              <li>
                <Link to="/moveis-planejados" className="block py-1.5 hover:text-bronze">
                  Móveis planejados
                </Link>
              </li>
              {serviceCatalog.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/moveis-planejados/$servico"
                    params={{ servico: s.slug }}
                    className="block py-1.5 hover:text-bronze"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/marcenaria-para-arquitetos" className="block py-1.5 hover:text-bronze">
                  Marcenaria para arquitetos
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="rodape-cidades">
            <h2 id="rodape-cidades" className="text-bronze uppercase tracking-widest text-xs mb-4">
              Onde atendemos
            </h2>
            <ul className="text-white/70">
              {cityCatalog.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/moveis-planejados-em/$cidade"
                    params={{ cidade: c.slug }}
                    className="block py-1.5 hover:text-bronze"
                  >
                    Móveis planejados em {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-bronze uppercase tracking-widest text-xs mb-4">Contato</h2>
            <address className="not-italic space-y-3 text-white/70">
              <p className="flex gap-2">
                <MapPin className="w-4 h-4 text-bronze shrink-0 mt-0.5" aria-hidden />
                <span>
                  {STREET_ADDRESS} — {CITY} - {REGION}
                </span>
              </p>
              <p className="flex gap-2">
                <Phone className="w-4 h-4 text-bronze shrink-0 mt-0.5" aria-hidden />
                <a href={`tel:${PHONE_E164}`} className="hover:text-bronze">
                  {PHONE_LOCAL}
                </a>
              </p>
              <p className="flex gap-2">
                <Mail className="w-4 h-4 text-bronze shrink-0 mt-0.5" aria-hidden />
                <a href={`mailto:${EMAIL}`} className="hover:text-bronze break-all">
                  {EMAIL}
                </a>
              </p>
              <p className="flex gap-2">
                <Clock className="w-4 h-4 text-bronze shrink-0 mt-0.5" aria-hidden />
                <span>Seg - Sex: 8h às 18h · Sáb: 8h às 12h</span>
              </p>
            </address>
            <ul className="mt-5 text-white/70">
              <li>
                <Link to="/projetos" className="block py-1.5 hover:text-bronze">
                  Portfólio de projetos
                </Link>
              </li>
              <li>
                <Link to="/showroom-3d" className="block py-1.5 hover:text-bronze">
                  Showroom 3D
                </Link>
              </li>
              <li>
                <Link to="/contato" className="block py-1.5 hover:text-bronze">
                  Contato e orçamento
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="block py-1.5 hover:text-bronze">
                  Sobre a M7
                </Link>
              </li>
              <li>
                <Link to="/perguntas-frequentes" className="block py-1.5 hover:text-bronze">
                  Perguntas frequentes
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidade" className="block py-1.5 hover:text-bronze">
                  Política de privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} M7 Movelaria — Móveis planejados sob medida em São José dos
          Pinhais, PR. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}

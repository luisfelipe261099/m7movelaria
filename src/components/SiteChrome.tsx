import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Menu, X, MessageCircle } from "lucide-react";
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
            <a
              href={whatsappLink("Olá M7 Movelaria, gostaria de solicitar um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center px-6 py-3 bg-bronze text-primary-foreground text-sm font-medium rounded hover:bg-bronze-dark transition-colors"
            >
              Solicitar Orçamento
            </a>
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
              <a
                href={whatsappLink("Olá M7 Movelaria, gostaria de solicitar um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-bronze text-primary-foreground text-sm font-medium rounded hover:bg-bronze-dark transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden /> Solicitar Orçamento
              </a>
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

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/80 defer-render">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <div className="font-display text-3xl text-bronze tracking-widest">M7</div>
          <div className="text-xs uppercase tracking-[0.3em] text-white/60 mt-1 mb-4">
            Movelaria
          </div>
          <p className="text-white/70 max-w-xs leading-relaxed">
            Marcenaria de alto padrão em São José dos Pinhais. Projeto executivo, produção no ateliê
            e instalação com equipe própria.
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
  );
}
